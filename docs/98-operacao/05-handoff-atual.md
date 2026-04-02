# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Saneamento de journeyTimeline (14º Recorte Fase 5)
- **Último commit relevante:** `9af5011` — refactor: remove hardcoded journeyTimeline visualization from AbmStrategy (14º recorte)
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

## O que foi entregue (14º Recorte — Saneamento de journeyTimeline)
- `journeyTimeline` constant removido (7 linhas): hardcoded array com 5 estágios (Awareness, Engagement, MQA, Opportunity, Win) e contagens fictícias (142→85→24→12→5).
- Visualização "Jornada de Contas (Funil ABM)" removida (23 linhas): card completo com progress bars animadas, badge "PROGRESSION" e footer "Velocity Index ABM (15% ACCEL.)".
- Total: `0 insertions(+), 32 deletions(-)` — zero impacto visual ou funcional.
- Justificativa: dados decorativos não derivados de fonte real; não alinhados com operacionalidade do cockpit.

---

## Próximos passos (Roadmap)
1. Iniciar o **15º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs ainda intactos.
   - Central de Playbooks — orquestração cross-channel corporativa.
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code e journeyTimeline concluído. IIFEs (~1000 linhas), `abmHeatmapAccounts`, `entryPlays`, `benchmarks`, `verticalClusters` — ainda ativos no render (escopo do 15º recorte e adiante).
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
