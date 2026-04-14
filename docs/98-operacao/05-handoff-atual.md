# 05 - Handoff atual

## Estado atual — 2026-04-14

- **Branch:** `main` — sincronizada com `origin/main`
- **Último commit em origin/main:** `8762ae4` — `feat(accounts): apply 4c list volume and hygiene controls`
- **Status do build:** BUILD-STABLE (Exit 0 confirmado em todos os recortes publicados)
- **Idioma Operacional:** Português do Brasil (Seção 8 de `04-regras-do-processo.md`)

---

## Histórico Macro — O que foi entregue (Cronológico)

### Fase E — Supabase Migration & Scale (Concluída)
- **E1–E5 (Recortes 22–25):** Leitura defensiva de Accounts, Signals, Contacts, Actions.
- **E6–E9C (Recortes 26–36):** Escrita defensiva e narrativas em Actions, Signals, Contacts, Accounts. Padrão atômico `1 snapshot → 1 setState → 1 persist` consolidado.
- **E10A/E10B (Recortes 30–31):** ABM + ABX Repository layers (read-only).
- **E11A/E11B (Recortes 32–33):** Escrita defensiva em ABM — `tipoEstrategico` e `playAtivo`.
- **E12/E13 (Recortes 40–41):** Narrativas estratégicas em ABM + ABX.
- **E14/E15 (Recortes 45–46):** Leitura + Escrita defensiva de Oportunidades.
- **E16 (Recorte 47):** Ciclo completo de Inteligência Acumulada (`inteligencia`).
- **E17/E18/E19/E20 (Recortes 48–51):** Leitura Estruturada, Histórico Operacional, Tecnografia, Canais & Campanhas.
- **Recorte 52 (Documental):** Fechamento canônico da Fase E. Mapa de cobertura reconciliado.

### Fase Scoring (Recortes 53–56) — Publicado
- **Recorte 53:** `calculateAccountScore()` em `scoringRepository.ts` — 5 dimensões.
- **Recorte 54:** Grid 4-cards em Overview.tsx (Críticas, Altas Prioridades, Alto Potencial, Top Oportunidades).
- **Recorte 55:** `deriveProximaMelhorAcao()` — recomendação determinística por score.
- **Recorte 56:** `deriveAcaoOperacional()` — ActionItem derivado do score, entra na fila local.
- **Commits:** `1825db0`, `fc1923f`, `b328523`, `81447b4`

### Bloco C — Seed + Infraestrutura Supabase (Publicado)
- Seed canônico consolidado: 13 campanhas, 217 interações, 65 play_recommendations.
- Migration SQL em `supabase/migrations/20260413000000_bloco_c.sql`.
- Repositories defensivos: `campaignsRepository.ts`, `interactionsRepository.ts`, `playRecommendationsRepository.ts`.
- Script de importação idempotente: `scripts/supabase/importBlockCSeed.ts`.
- **Commits relevantes:** `37c49e0`, `91043a6`, `458da13`

### Bloco C — Consumo na UI (Publicado)
- **Consumer Accounts:** filtros, recência, volume agregado e Board (Kanban) com sinais Bloco C.
- **Consumer Overview:** Indicadores executivos derivados de campanhas + interações do Bloco C.
- **Consumer AccountDetail:** Timeline com eventos do Bloco C integrada.
- **Commits:** `f3b6343`, `f8376a8`, `1a9381b`, `6a9c413`, `27d4e68`

### Paridade Funcional — AccountProfile & ContactProfile (Aprovado e Fechado)
- Nova página dedicada `AccountProfile.tsx`: Radar Relacional, Fila de Fogo Ativa, Score Rationale, Timeline 360, Portfólio & Whitespace, Contexto Compacto (Origem/Influência).
- CTAs da Fila de Fogo operacionais: injetam ações reais via `createAction()`.
- `ContactProfile.tsx`: paridade operacional, navegação Empresa → Contato religada.
- Build EXIT 0 após sanitização de `accountsData.ts` e correções JSX.
- **Commit Final:** `ee3957f`, `a9c29fc`, `6cb5eaf`, `c69d7c0`

### Refinamento Accounts.tsx — Subetapas 1–4 (Publicado)
- Subetapa 1 (`efc3fba`): Visual direction refinement.
- Subetapa 2 (`4eaa3a4`): Ergonomic refinement.
- Subetapa 3 (`9d1cd85`): Shortcut contextualization.
- Subetapas 4a/4b/4c (`9dca7c7`, `5dde7e3`, `8762ae4`): List readability, play simplification, volume & hygiene controls.
- **Último commit publicado:** `8762ae4`

---

## Estado do Working Tree (2026-04-14)

**3 arquivos modificados localmente, não commitados:**
- `src/lib/accountsRepository.ts`
- `src/pages/Accounts.tsx`
- `src/pages/Overview.tsx`

**Natureza das mudanças (diff auditado):**
- `Overview.tsx`: Guards defensivos (`conta.nome || 'Conta'`) + helper `getAccountContext()` substituindo template string inline + `getInitials()` substituindo `.substring(0, 2)` bruto em avatares.
- `Accounts.tsx`: Mudanças relacionadas às subetapas recentes (hygiene controls).
- `accountsRepository.ts`: Expansão defensiva do repositório (+19 linhas).

**⚠️ Decisão pendente:** Essas mudanças precisam ser revisadas, aprovadas e commitadas antes de avançar para o próximo recorte.

---

## Pendências Abertas

1. **Commit das mudanças locais** — 3 arquivos modificados aguardam revisão e commit.
2. **Reconciliação do Bloco C no Supabase remoto** — Migration e import do seed Bloco C ainda não foram executados no Supabase de produção (E21 pendente).
3. **Documentação** — `00-status-atual.md` e `06-checkpoint-atual.md` precisam de entrada para os recortes de Bloco C consumo + Refinamento Accounts + AccountProfile parity.

---

## Próximo Passo Exato

**Opção A (Higiene imediata):** Revisar, aprovar e commitar as 3 mudanças locais pendentes.

**Opção B (Próxima frente macro — E21):** Executar a migration SQL do Bloco C no Supabase remoto real e validar o consumo dos novos repositories na UI.

**Opção C (Novas features):** Definir Recorte 61 — expansão de inteligência, UX refinements ou nova frente.

---

## Regras obrigatórias (Reforço)

1. `npm run build` obrigatório antes de cada commit de fechamento de recorte (Exit 0).
2. Toda comunicação operativa em **Português do Brasil**.
3. Preservar histórico completo nos documentos de operação.
4. Não introduzir estilos inline em componentes já migrados para Tailwind v4.
5. Nenhum recorte funcional avança sem aprovação formal do Orquestrador.

---

> [!IMPORTANT]
> **Governança Operacional: Ordem Canônica**
> Deve-se respeitar rigorosamente a sequência de fases e recortes definida nos documentos de roadmap e handoff. É expressamente proibido pular recortes, antecipar execuções futuras ou tratar recomendações técnicas como recortes já iniciados sem aprovação formal.
