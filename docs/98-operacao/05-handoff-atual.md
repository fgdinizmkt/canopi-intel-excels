# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Saneamento de Dead Code (13º Recorte Fase 5)
- **Último commit relevante:** `fef12eb` — refactor: remove dead code órfão de AbmStrategy após remoção do modal fictício (13º recorte)
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

## O que foi entregue (13º Recorte — Saneamento de Dead Code)
- 7 imports Lucide órfãos removidos: `Loader2`, `MoreVertical`, `Maximize2`, `TrendingDown`, `Building2`, `MousePointer2`, `Info`.
- `AnimatePresence` removido de `motion/react` (usado apenas no modal excluído).
- `scatterAccounts` removido (12 contas com scatter data x/y — exclusivo do modal).
- `personas`, `hexVerticals` removidos (arrays do hexbin do modal).
- `hexIntensityMap` removido (Record 10×10 de intensidades).
- `getHexCellColor`, `channelByIntensity` removidos (helpers do hexbin).
- `budgetAlloc`/`setBudgetAlloc`, `totalBudget` removidos (estado do modal de budget).
- `Hexagon` removido (helper component SVG sem referência no JSX restante).
- Total: `11 insertions(+), 74 deletions(-)` — zero impacto visual ou funcional.

---

## Próximos passos (Roadmap)
1. Iniciar o **14º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Central de Playbooks — orquestração cross-channel corporativa.
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs ainda intactos.
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code concluído. IIFEs (~1000 linhas), `abmHeatmapAccounts`, `entryPlays`, `benchmarks`, `verticalClusters`, `journeyTimeline` — todos ainda ativos no render (fora do escopo do 13º recorte).
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
