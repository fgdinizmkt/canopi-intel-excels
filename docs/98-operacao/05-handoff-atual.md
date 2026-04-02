# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** ABM Modal Fictício (12º Recorte Fase 5)
- **Último commit relevante:** `6d416a6` — feat: remove modal ficticio e neutraliza interatividade artificial em abmstrategy
- **Data:** 2026-04-02
- **Ambiente:** Next.js 15 App Router / main íntegra (build ok)

## Regras obrigatórias
- Executar apenas o recorte autorizado
- Mostrar build, git diff --stat e diff real antes de pedir aprovação
- Aguardar aprovação explícita antes de commit
- Atualizar a memória operacional ao fechar cada recorte
- Não avançar para outra frente sem fechar corretamente a atual
- Não inventar contexto, resultados ou análises
- **Mudança Visual:** Propor e validar direção visual antes de mudanças estruturais de UI.
- **Estética:** Preservar experiência premium durante refinamentos operacionais.

## O que foi entregue (12º Recorte — ABM Modal Fictício)
- `openDetailedModal` removida: switch de 20 cases, ~1074 linhas de JSX fictício eliminadas de `AbmStrategy.tsx`.
- Estados `modalOpen` e `modalData` removidos.
- Import `Modal` removido.
- ~40 `onClick={() => openDetailedModal(...)}` removidos de todos os pontos de chamada.
- `cursor-pointer` removido das tech-fit cards sem ação real.
- `<Modal />` removida do JSX final.
- `openAccount(acc.id)` na TAL Table preservado — único ponto de interação real da página.
- Toda estrutura visual, IIFEs, datasets, sliders e visualizações preservados intactos.

---

## Próximos passos (Roadmap)
1. Iniciar o **13º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs, datasets hardcoded e benchmarks ainda intactos.
   - Central de Playbooks — orquestração cross-channel corporativa.
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Modal fictício removido. IIFEs (~1000 linhas), datasets hardcoded (`abmHeatmapAccounts`, `scatterAccounts`, `entryPlays`, benchmarks, clusters) ainda intactos — fora do escopo do 12º recorte.
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente.
- **Playbooks:** Orquestração corporativa ainda é conceito; requer estrutura de execução.
- **ABXOrchestration.tsx:** `HumanMappingDiagnosis` e `contactsBigNumbers` com valores hardcoded (aceito como estado definitivo).

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
