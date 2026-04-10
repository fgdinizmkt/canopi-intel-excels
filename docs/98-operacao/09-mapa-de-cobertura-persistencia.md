# Mapa de Cobertura de Persistência — Recorte 43

## Objetivo

Inventário factual dos campos do modelo de dados `Conta` e entidades relacionadas,
documentando o que está coberto, o que está ausente e as decisões de ownership pendentes.
Baseado em leitura direta do código publicado em `origin/main` após commit `5672e97`.

Nenhuma recomendação de implementação está contida aqui.
Nenhum campo será alterado como resultado deste documento.

---

## Legenda

| Símbolo | Significado |
|---|---|
| ✅ | Coberto: campo lido e/ou escrito via repository Supabase |
| ⬜ | Ausente: campo existe no modelo mas sem cobertura Supabase |
| ❓ | Decisão pendente de ownership ou localização no modelo |
| 🔒 | Fora do escopo de persistência por decisão explícita ou natureza do campo |

---

## 1. Entidade: Conta (top-level)

**Arquivo de modelo:** `src/data/accountsData.ts` — `interface Conta`
**Repository responsável:** `src/lib/accountsRepository.ts`

### 1.1 Campos escalares top-level

| Campo | Tipo | Leitura Supabase | Escrita Supabase | Fonte de Verdade Atual | Lacuna |
|---|---|---|---|---|---|
| `id` | `string` | ✅ `getAccounts()` | ✅ chave de upsert | Supabase | — |
| `slug` | `string` | ✅ `getAccounts()` | ⬜ não em `persistAccount()` | contasMock | slug não muda operacionalmente |
| `nome` | `string` | ✅ `getAccounts()` | ⬜ | contasMock | sem caso de uso de escrita identificado |
| `tipoEstrategico` | `TipoEstrategico` | ✅ `getAccounts()` + `getAbm()` | ✅ `persistAccount()` e `persistAbm()` | Supabase (quando configurado) | **DECISÃO PENDENTE: ver seção 5** |
| `playAtivo` | `string union` | ✅ `getAccounts()` + `getAbm()` | ✅ `persistAccount()` e `persistAbm()` | Supabase (quando configurado) | **DECISÃO PENDENTE: ver seção 5** |
| `resumoExecutivo` | `string` | ✅ `getAccounts()` | ✅ `persistAccount()` | Supabase | — |
| `proximaMelhorAcao` | `string` | ✅ `getAccounts()` | ✅ `persistAccount()` | Supabase | — |
| `etapa` | `string` | ✅ `getAccounts()` | ⬜ | contasMock | sem caso de uso de escrita identificado |
| `potencial`, `risco`, `prontidao` | `number` | ✅ `getAccounts()` | ⬜ | contasMock | campos calculados, sem escrita prevista |
| `coberturaRelacional` | `number` | ✅ `getAccounts()` | ⬜ | contasMock | campo calculado |
| `icp`, `crm`, `vp`, `ct`, `ft` | `number` | ✅ `getAccounts()` + `getAbm()` | ⬜ | Supabase lê, não escreve | scores lidos do Supabase mas sem UI de edição |
| `statusGeral` | `string union` | ✅ `getAccounts()` | ⬜ | contasMock | campo derivado ou editorial |
| `budgetBrl` | `number` | ✅ `getAccounts()` | ⬜ | contasMock | sem caso de uso de escrita identificado |
| `ownerPrincipal` | `string` | ✅ `getAccounts()` | ⬜ | contasMock | sem UI de edição |
| `ultimaMovimentacao` | `string` | ✅ `getAccounts()` | ⬜ | contasMock | campo editorial |
| `atividadeRecente` | `string union` | ✅ `getAccounts()` | ⬜ | contasMock | campo derivado |
| `possuiOportunidade` | `boolean` | ✅ `getAccounts()` | ⬜ | contasMock | campo derivado |
| `reconciliationStatus` | `string union` | ⬜ | ⬜ | contasMock | campo de controle interno, não lido do Supabase |

### 1.2 Campos de objeto aninhado: `abm`

**Localização no modelo:** `Conta.abm` (objeto dentro de Conta, não top-level)
**Repository:** `src/lib/abmRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `abm.motivo` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.fit` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.cluster` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.similaridade` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.coberturaInicialComite` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.playsEntrada` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.potencialAbertura` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.hipoteses` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.contasSimilares` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — |
| `abm.strategyNarrative` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — (Recorte 40) |
| `abm.riskAssessment` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — (Recorte 40) |
| `abm.successCriteria` | ✅ `getAbm()` | ✅ `persistAbm()` | Supabase | — (Recorte 40) |

### 1.3 Campos de objeto aninhado: `abx`

**Localização no modelo:** `Conta.abx` (objeto dentro de Conta, não top-level)
**Repository:** `src/lib/abxRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `abx.motivo` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.evolucaoJornada` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.maturidadeRelacional` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.sponsorAtivo` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.profundidadeComite` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.continuidade` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.expansao` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.retencao` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.riscoEstagnacao` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — |
| `abx.strategyNarrative` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — (Recorte 41) |
| `abx.riskAssessment` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — (Recorte 41) |
| `abx.successCriteria` | ✅ `getAbx()` | ✅ `persistAbx()` | Supabase | — (Recorte 41) |

---

## 2. Entidade: Signal (SinalConta / SignalItem)

**Arquivo de modelo:** `src/data/accountsData.ts` — `interface SinalConta`
**Repository:** `src/lib/signalsRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `id` | ✅ | ✅ chave | Supabase | — |
| `titulo` | ✅ | ✅ | Supabase | — |
| `tipo` | ✅ | ✅ | Supabase | — |
| `impacto` | ✅ | ✅ | Supabase | — |
| `owner` | ✅ | ✅ | Supabase | — |
| `contexto` (`context`) | ✅ | ✅ | Supabase | — (Recorte 37) |
| `probableCause` | ✅ | ✅ | Supabase | — (Recorte 37) |
| `recommendation` | ✅ | ✅ | Supabase | — (Recorte 37) |
| `data` | ✅ | ✅ | Supabase | — |
| campos operacionais locais (`recorrencia`, etc.) | 🔒 | 🔒 | Local/mock | Marcados como "não persistem em Supabase" no repository |

---

## 3. Entidade: Contact (ContatoConta / ContactItem)

**Arquivo de modelo:** `src/data/accountsData.ts` — `interface ContatoConta`
**Repository:** `src/lib/contactsRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `id` | ✅ | ✅ chave | Supabase | — |
| `nome` | ✅ | ✅ | Supabase | — |
| `cargo`, `area`, `senioridade` | ✅ | ✅ | Supabase | — |
| `forcaRelacional`, `receptividade`, `acessibilidade` | ✅ | ✅ | Supabase | — |
| `papelComite`, `status`, `classificacao` | ✅ | ✅ | Supabase | — |
| `influencia`, `potencialSucesso`, `scoreSucesso` | ✅ | ✅ | Supabase | — |
| `observacoes` | ✅ | ✅ | Supabase | — (Recorte 38) |
| `historicoInteracoes` | ✅ | ✅ | Supabase | — (Recorte 38) |
| `proximaAcao` | ✅ | ✅ | Supabase | — (Recorte 38) |

---

## 4. Entidade: Action (AcaoConta / ActionItem)

**Arquivo de modelo:** implícita em `actionsRepository`
**Repository:** `src/lib/actionsRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `id` | ✅ | ✅ chave | Supabase | — |
| `title`, `status`, `priority` | ✅ | ✅ | Supabase | — |
| `ownerName`, `accountName` | ✅ | ✅ | Supabase | — |
| `resolutionPath` | ✅ | ✅ | Supabase | — (Recorte 39) |
| `executionNotes` | ✅ | ✅ | Supabase | — (Recorte 39) |
| `learnings` | ✅ | ✅ | Supabase | — (Recorte 39) |

---

## 5. Decisão Pendente de Ownership: `tipoEstrategico` e `playAtivo`

Esta é a lacuna arquitetural documentada neste recorte. Não há recomendação de resolução aqui.

### Situação Atual (factual)

`tipoEstrategico` e `playAtivo` são campos **top-level de `Conta`**, na interface:

```typescript
// src/data/accountsData.ts — linha 690 e 704
tipoEstrategico: TipoEstrategico;  // top-level de Conta
playAtivo: 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum';  // top-level de Conta
```

Eles **não existem** dentro de `Conta.abx`. Não há campo equivalente em `Conta.abx`.

### Quem escreve esses campos hoje

`persistAccount()` em `accountsRepository.ts` — escreve `tipoEstrategico` e `playAtivo` como colunas top-level na tabela `contas` do Supabase.

`persistAbm()` em `abmRepository.ts` — também aceita `tipoEstrategico` e `playAtivo` no payload e os escreve como colunas top-level. Isso representa escrita redundante potencial do mesmo campo por dois repositories diferentes.

### Quem lê esses campos hoje

`getAccounts()` — lê `tipoEstrategico` e `playAtivo` como colunas top-level.
`getAbm()` — também lê `tipoEstrategico` e `playAtivo` como colunas top-level, via `select('id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico, playAtivo')`.

### O problema de ownership

Dois repositories (`accountsRepository` e `abmRepository`) estão autorizados a escrever as mesmas colunas Supabase (`tipoEstrategico`, `playAtivo`) sobre a mesma tabela (`contas`), por caminhos diferentes na UI.

Não há colisão garantida (ambos fazem upsert por `id`), mas não há definição explícita de qual repository é a fonte de verdade para esses campos.

### Perguntas abertas (não respondidas neste documento)

1. `tipoEstrategico` deve continuar sendo escrito por dois repositories, ou deve ter um único responsável?
2. `playAtivo` no contexto ABX tem o mesmo significado semântico que `playAtivo` no contexto ABM? Ou são dimensões diferentes que hoje compartilham o mesmo campo?
3. Se `playAtivo` for semanticamente diferente em ABX, deve existir `abx.playAtivo` dentro do objeto `Conta.abx`? Isso exigiria mudança de modelo.
4. Quem chama `persistAccount()` vs `persistAbm()` para esses campos na UI: é sempre o mesmo evento de interação, ou podem ser chamados independentemente?

Essas perguntas precisam de decisão do Orquestrador antes de qualquer recorte funcional que toque nesses campos.

---

## 6. Resumo de Cobertura por Dimensão

| Dimensão | Read Supabase | Write Supabase | Recorte que fechou |
|---|---|---|---|
| Accounts — scores (`icp`, `crm`, `vp`, `ct`, `ft`) | ✅ | ⬜ | R30 (read), sem write |
| Accounts — campos editoriais (`resumoExecutivo`, `proximaMelhorAcao`) | ✅ | ✅ | R34/R35 |
| Accounts — `tipoEstrategico`, `playAtivo` | ✅ | ✅ | R32/R33/R34/R35 |
| Signals — operacionais + narrativos | ✅ | ✅ | R37 |
| Contacts — todos os campos cobertos | ✅ | ✅ | R38 |
| Actions — todos os campos cobertos | ✅ | ✅ | R39 |
| ABM — objeto `abm` completo + narrativos | ✅ | ✅ | R30/R32/R33/R40 |
| ABX — objeto `abx` completo + narrativos | ✅ | ✅ | R31/R41 |
| ABX — `tipoEstrategico`, `playAtivo` | ⬜ | ⬜ | ❓ Decisão pendente (seção 5) |

---

## 7. Campos sem Cobertura Supabase por Decisão Implícita

Os seguintes campos existem no modelo `Conta` mas nunca foram incluídos em nenhum repository.
Não há registro de decisão explícita de exclusão — apenas ausência de implementação.

- `sinais[]` — array de `SinalConta` (lidos via `signalsRepository`, não via `accountsRepository`)
- `acoes[]` — array de `AcaoConta` (lidas via `actionsRepository`)
- `contatos[]` — array de `ContatoConta` (lidos via `contactsRepository`)
- `oportunidades[]` — array de `OportunidadeConta` — **sem repository Supabase**
- `canaisCampanhas` — objeto — **sem repository Supabase**
- `inteligencia` — objeto com 6 arrays — **sem repository Supabase**
- `tecnografia` — array de strings — **sem repository Supabase**
- `historico[]` — array — **sem repository Supabase**
- `leituraFactual[]`, `leituraInferida[]`, `leituraSugerida[]` — arrays — **sem repository Supabase**
- `reconciliationStatus` — campo de controle interno — **sem repository Supabase**

---

*Documento criado em: 2026-04-10*
*Fonte: leitura direta de `src/lib/` e `src/data/accountsData.ts` em commit `5672e97`*
*Recorte 43 — documental, sem alteração de código*
