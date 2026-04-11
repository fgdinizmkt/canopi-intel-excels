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

## 4.5. Entidade: Opportunity (OportunidadeConta / OpportunityRow)

**Arquivo de modelo:** implícita estruturada via accountsData
**Repository:** `src/lib/oportunidadesRepository.ts`

| Campo | Leitura Supabase | Escrita Supabase | Fonte de Verdade | Lacuna |
|---|---|---|---|---|
| `id` | ✅ | ⬜ read-only fixo | Supabase | N/D |
| `account_slug` | ✅ | ⬜ | Supabase | N/D |
| `nome`, `valor`, `owner`, `probabilidade` | ✅ | ⬜ | Supabase | — (E14) |
| `etapa`, `risco` | ✅ | ✅ | Supabase | — (E15) |
| `historico` | ✅ | ⬜ | Supabase | — (E14) |

---

## 5. Decisão de Ownership Resolvida (Recorte 44): `tipoEstrategico` e `playAtivo`

Esta lacuna arquitetural documentada no Recorte 43 foi formalmente resolvida no Recorte 44 por decisão do Orquestrador.

### Resolução Final (Factual)

1. `accountsRepository` foi definido como o **owner definitivo e prioritário** de `tipoEstrategico` e `playAtivo`.
2. A entidade `Conta` (top-level) rege esses campos de forma central.
3. `abmRepository` foi destituído da autoridade de escrita desses campos. Suas obrigações voltaram a ficar circunscritas puramente ao domínio aninhado `abm`.
4. Os handlers de atualização na interface (`AbmStrategy.tsx`) agora despacham mutações exclusivamente via `persistAccount()`.

Não há mais dupla fonte de escrita ou ambiguidade sobre esses campos.

---

---

## 6. Resumo de Cobertura por Dimensão

| Dimensão | Read Supabase | Write Supabase | Recorte que fechou |
|---|---|---|---|
| Accounts — scores (`icp`, `crm`, `vp`, `ct`, `ft`) | ✅ | ⬜ | R30 (read), sem write |
| Accounts — campos editoriais (`resumoExecutivo`, `proximaMelhorAcao`) | ✅ | ✅ | R34/R35 |
| Accounts — `tipoEstrategico`, `playAtivo` | ✅ | ✅ | R32/R33/R34/R35 |
| Accounts — `inteligencia` (Cumulativa) | ✅ | ✅ | R47 |
| Signals — operacionais + narrativos | ✅ | ✅ | R37 |
| Contacts — todos os campos cobertos | ✅ | ✅ | R38 |
| Actions — todos os campos cobertos | ✅ | ✅ | R39 |
| Oportunidades — read/write defensivo | ✅ | ✅ | R46 |
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
- `canaisCampanhas` — objeto — **sem repository Supabase**
- `tecnografia` — array de strings — **sem repository Supabase**
- `historico[]` — array — **sem repository Supabase**
- `leituraFactual[]`, `leituraInferida[]`, `leituraSugerida[]` — arrays — **sem repository Supabase**
- `reconciliationStatus` — campo de controle interno — **sem repository Supabase**

---

*Documento criado em: 2026-04-10*
*Fonte: leitura direta de `src/lib/` e `src/data/accountsData.ts` em commit `5672e97`*
*Recorte 43 — documental, sem alteração de código*
