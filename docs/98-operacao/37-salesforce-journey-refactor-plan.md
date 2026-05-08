# 37 — Plano de Refatoração: Jornada Operacional Salesforce

## Decisão de transição (2026-05-08)

Encerrar os hotfixes incrementais de UX da página Salesforce.
Abrir refatoração faseada para transformar a página em uma jornada operacional real.

O estado atual (commit `fc6ef50`) é um checkpoint funcional, não UX final.

---

## Diagnóstico — Auditoria C4.16.26

### Problema central

A página `SalesforceMethodSelector.tsx` (3249 linhas) mistura:
- dois journeys paralelos (single-object Accounts quality + multi-entity Account/Contact/Opportunity)
- lógica de conexão OAuth
- lógica de preview/selection/contract/dry-run
- lógica de resolução de qualidade
- lógica de sync real (parcialmente órfã)

Sem separação visual, sem sequência guiada, sem progresso visível.

### Problemas P0 (quebram o fluxo)

**P0.1 — Reset silencioso de decisões**
`toggleAccountPreviewRowSelection` e `handleLoadAccountsPreview` chamam `setAccountQualityResolutions({})`.
Um clique de checkbox ou recarga de accounts apaga todas as decisões de qualidade sem aviso.

**P0.2 — Seção de qualidade invisível sem dry-run**
`{localPreSyncDryRun && ...}` — se o usuário não executou o dry-run (escondido no accordion), a seção de qualidade nunca aparece.

**P0.3 — Preparação usa linhas brutas, não resolvidas**
`handlePrepareAccountPreviewSelection` usa `accountPreviewRows` (direto do SF), não `buildResolvedAccountRows(...)`.
A tabela de preparação mostra valores originais do Salesforce, não as correções locais.

### Problemas P1 (degradam o produto)

**P1.1 — Cap de 12 itens, itens 13+ inacessíveis individualmente**
Workaround de bulk não cobre decisão "manual" (requer valor por campo).

**P1.2 — `resetAccountsOperationalSession` não limpa `confirmedIndustryItems` nem `editingResolutionKeys`**

**P1.3 — Botão "Salvar ajustes" desaparece quando todos os itens estão resolvidos**

**P1.4 — `handleExecuteAccountSync` existe mas não há botão visível na UI**

### Problemas P2 (friction)

**P2.1 — Dois journeys paralelos misturados visualmente**
"Próximo passo da jornada" é o step da jornada multi-entidade, não da revisão de qualidade de Accounts.

**P2.2 — Nenhum indicador de progresso total (N resolvidos de M)**

**P2.3 — `confirmedValue` pode ficar stale na resolved card após edição parcial**

**P2.4 — Botões Preparar / Gerar contrato / Dry-run são 3 ações separadas que deveriam ser 1**

---

## Jornada Alvo (11 etapas)

| # | Etapa | Condição de entrada |
|---|-------|---------------------|
| 1 | Configurar OAuth Client App | `!oauthConfigured` |
| 2 | Conectar Salesforce | `oauthConfigured && !oauthConnected` |
| 3 | Validar conexão | `oauthConnected` |
| 4 | Carregar Accounts (limite) | `oauthConnected` |
| 5 | Selecionar registros | `accountsPreview` |
| 6 | **"Analisar seleção"** (prepare + contract + dry-run unificados) | `selectedRows > 0` |
| 7 | Ver resumo da análise (N válidos, M com avisos, K bloqueados) | `localPreSyncDryRun` |
| 8 | Resolver pendências de qualidade (sem cap, com progresso) | `dryRun.alertCount > 0` |
| 9 | Salvar ajustes e recalcular (sempre visível) | `any` |
| 10 | Ver resumo final pós-resolução | `recalculated` |
| 11 | Executar sync (desbloqueado quando `blockedCount === 0`) | `syncReady` |

---

## Modelo de Resoluções de Qualidade

### Decisões por tipo de campo

| Campo | UI de edição (manual) | Decisões disponíveis |
|-------|----------------------|---------------------|
| `Industry` | Select padrão + Outro → text + Confirmar | todas 5 |
| `Type` | Select com opções fixas | todas 5 |
| `Website` | Input text | todas 5 |
| `OwnerId` | Nenhuma (info estática) | accept / fix_salesforce |
| outros texto | Input text | todas 5 |

### Efeito de cada decisão no contrato

| Decisão | Efeito em `buildResolvedAccountRows` | Status dry-run |
|---------|-------------------------------------|----------------|
| `manual` + valor válido | Remove gap; escreve valor local no record | apto para sync |
| `manual` + valor vazio | Gap permanece | com alertas |
| `accept` | Remove gap sem alterar valor | com alertas (aceito) |
| `fix_salesforce` | Remove gap sem alterar valor | com alertas (delegado) |
| `remove` | Remove row do escopo | fora do contrato |
| `blocker` | Gap permanece como blocker | bloqueado para sync |

**Invariante faltante:** Decisão `manual` sem valor não deve ser aceita como resolução no botão "Salvar ajustes". Mostrar inline warning "Informe o valor antes de salvar".

---

## Plano Faseado

### Fase 0 — State Safety (baixo risco)

Prompt: C4.16.27

1. `toggleAccountPreviewRowSelection` — remover `setAccountQualityResolutions({})`
2. `handleLoadAccountsPreview` — remover `setAccountQualityResolutions({})`
3. `resetAccountsOperationalSession` — incluir `setConfirmedIndustryItems({})` e `setEditingResolutionKeys(new Set())`
4. Remover `.slice(0, 12)`, adicionar estado `showAllQualityItems` com toggle "Mostrar todos / Mostrar menos"

### Fase 1 — Journey Consolidation (médio risco)

Prompt: C4.16.28

1. Criar `handleAnalyzeSelection()` — prepare → contract → dryrun em sequência
2. Substituir 3 botões por 1 "Analisar seleção" (botões originais ficam em `<details>` Ações avançadas)
3. Adicionar header de progresso: "N pendências · M resolvidas · K total"
4. Adicionar botão "Executar sync" quando `blockedCount === 0 && phase === 'idle'`

### Fase 2 — Contrato Correto + Qualidade Independente (baixo risco)

Prompt: C4.16.29

1. `handlePrepareAccountPreviewSelection` usa `buildResolvedAccountRows(...)` em vez de `accountPreviewRows`
2. Seção de qualidade visível quando prep tem gaps, não quando dry-run existe
3. Botão "Recalcular com decisões atuais" sempre presente na seção de qualidade

### Fase 3+ — Componentes, Persistência, Multi-Entity Separation

Planejados mas sem prompt definido ainda.

- **Fase 3:** Extração de componentes: `AccountsQualityPanel`, `AccountsPreviewPanel`, `OAuthConnectionPanel`
- **Fase 4:** Persistência de `accountQualityResolutions` em `localStorage` por orgId
- **Fase 5:** Separação visual clara entre jornada single-object Accounts e jornada multi-entity
- **Fase 6:** Sync real controlado com botão visível, confirmação, guardrails

---

## Próximo passo

**C4.16.27 — Fase 0 State Safety**

Ver prompt completo na seção "Next 3 Prompts" da auditoria C4.16.26.

---

## Commits de referência

| Commit | Descrição |
|--------|-----------|
| `fc6ef50` | Checkpoint C4.16.25B — quality resolution UX (antes da refatoração) |
