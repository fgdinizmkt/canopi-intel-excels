# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Auditoria técnica de abmHeatmapAccounts (18º Recorte Fase 5)
- **Último commit relevante:** Documentação do 18º recorte (auditoria, sem código)
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

## O que foi entregue (18º Recorte — Auditoria Técnica de abmHeatmapAccounts)
- **Tipo:** Auditoria técnica (research/validation, sem código alterado).
- **Achado:** `abmHeatmapAccounts` não pode ser saneado com `contasMock` no estado atual.
- **Motivo:** Ausência de campos numéricos exigidos (icp, crm, vp, ft, budget) em `contasMock`; volume insuficiente (3 contas vs. 12); dependência estrutural em 6+ pontos do código.
- **Decisão:** `abmHeatmapAccounts` formalmente **BLOQUEADO** até que `contasMock` evolua.
- **Total:** `0 insertions(+), 0 deletions(-)` — zero impacto no código; apenas documentação estratégica.
- **Justificativa:** Evitar trabalho especulativo; documentar pré-requisitos mínimos para saneamento futuro.

---

## Próximos passos (Roadmap)
1. Iniciar o **19º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` — IIFEs (~1000 linhas) ainda ativos.
   - Central de Playbooks — orquestração cross-channel corporativa.
3. **Bloqueio formal:** `abmHeatmapAccounts` saneável apenas após evolução de `contasMock` (pré-requisitos registrados).
4. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code, journeyTimeline, benchmarks, verticalClusters e entryPlays concluído. IIFEs (~1000 linhas) — ainda ativos no render (escopo do 19º recorte e adiante). **`abmHeatmapAccounts` — BLOQUEADO** (auditoria 18º recorte concluída: pré-requisitos = adicionar icp, crm, vp, ft, budget numéricos a contasMock + garantir 6-12 contas).
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
