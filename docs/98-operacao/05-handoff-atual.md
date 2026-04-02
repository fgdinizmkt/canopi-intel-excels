# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Saneamento de verticalClusters (16º Recorte Fase 5)
- **Último commit relevante:** `d4fb5e4` — refactor: remove hardcoded verticalClusters visualization from AbmStrategy (16º recorte)
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

## O que foi entregue (16º Recorte — Saneamento de verticalClusters)
- `verticalClusters` constant removido (8 linhas): hardcoded array com 4 verticais fictícias e dados de count/health/eficiência.
- Visualização "Clusterização ABM" removida (22 linhas): card com 4 items, progress bars, badges, botões "+ Novo" e links "Playbook" fictícios.
- Total: `1 insertion(+), 31 deletions(-)` — zero impacto visual ou funcional.
- Justificativa: dados fictícios não derivados de fonte real; botões/links não funcionais; sem função operacional no cockpit ABM.

---

## Próximos passos (Roadmap)
1. Iniciar o **17º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs ainda intactos.
   - Central de Playbooks — orquestração cross-channel corporativa.
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code, journeyTimeline, benchmarks e verticalClusters concluído. IIFEs (~1000 linhas), `abmHeatmapAccounts`, `entryPlays` — ainda ativos no render (escopo do 17º recorte e adiante).
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
