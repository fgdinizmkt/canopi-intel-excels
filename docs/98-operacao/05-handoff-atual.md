# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Saneamento de entryPlays (17º Recorte Fase 5)
- **Último commit relevante:** `bd306c4` — refactor: remove hardcoded entryPlays visualization from AbmStrategy (17º recorte)
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

## O que foi entregue (17º Recorte — Saneamento de entryPlays)
- `entryPlays` constant removido (5 linhas): hardcoded array com 3 playbooks fictícios (Relatório Setorial, Webinar, Campanha Social Ads) e eficácia hardcoded.
- Visualização "Plays de Entrada Recomendados" removida (31 linhas): card grande com grid 3-colunas, header fictício, botões "Executar Play" e "Ver Todos os Playbooks" sem ação.
- Total: `0 insertions(+), 34 deletions(-)` — zero impacto visual ou funcional.
- Justificativa: dados fictícios não derivados de fonte real; botões sem ação/handler; descrição enganosa; sem função operacional no cockpit ABM.

---

## Próximos passos (Roadmap)
1. Iniciar o **18º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs (~1000 linhas) e `abmHeatmapAccounts` ainda ativos.
   - Central de Playbooks — orquestração cross-channel corporativa.
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code, journeyTimeline, benchmarks, verticalClusters e entryPlays concluído. IIFEs (~1000 linhas), `abmHeatmapAccounts` — ainda ativos no render (escopo do 18º recorte e adiante).
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
