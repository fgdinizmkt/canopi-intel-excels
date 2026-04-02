# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Auditoria técnica das IIFEs (19º Recorte Fase 5)
- **Último commit relevante:** `4065760` — docs: registra conclusao do 19º recorte (auditoria tecnica das IIFEs)
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

## O que foi entregue (19º Recorte — Auditoria Técnica das IIFEs)
- **Tipo:** Auditoria técnica (research/validation, sem código alterado).
- **Achado:** As 2 IIFEs (linhas 288–850 e 859–1313, ~1016 linhas totais) estão estruturalmente consolidadas e não possuem slice pequeno/seguro para extração.
- **Motivo:**
  - Acoplamento de dados: `abmHeatmapAccounts` alimenta 10 visualizações (6 heatmaps + 4 matrix views)
  - Acoplamento de estado: `hmTooltip`/`setHmTooltip` compartilhados entre IIFE 1 e IIFE 2
  - Acoplamento de renderização: SVG heatmap + SVG matrix + 30+ action cards são interdependentes
  - Tentativa de split resultaria em 8–10 props novos, 2 componentes intermediários, zero ganho de legibilidade
- **Decisão:** IIFEs formalmente **FORA DO ESCOPO** de saneamento incremental da Fase 5. Refactor eventual só em Fase 6+ com separação de camadas.
- **Total:** `0 insertions(+), 0 deletions(-)` — zero impacto no código; apenas documentação estratégica.
- **Justificativa:** Evitar refactor especulativo que deterioraria código sem ganho funcional ou de manutenção.

---

## Próximos passos (Roadmap)
1. Iniciar o **20º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Central de Playbooks — orquestração cross-channel corporativa (PRIORIZADO).
   - Refactor defensivo de helpers scoring (`getHmScore`, `getWeightedIcp`) — Fase 6+, não agora.
3. **Bloqueios formais registrados:**
   - `abmHeatmapAccounts` saneável apenas após evolução de `contasMock` (18º recorte).
   - IIFEs de `AbmStrategy.tsx` fora do escopo incremental (19º recorte).
4. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** Saneamento de dead code, journeyTimeline, benchmarks, verticalClusters e entryPlays concluído.
  - **`abmHeatmapAccounts` — BLOQUEADO (18º recorte):** Pré-requisitos = adicionar icp, crm, vp, ft, budget numéricos a contasMock + garantir 6-12 contas.
  - **IIFEs (~1016 linhas) — BLOQUEADO (19º recorte):** Acoplamento estrutural em dados, estado e SVG; refactor eventual em Fase 6+.
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente.
- **Playbooks:** Orquestração corporativa ainda é conceito; requer estrutura de execução. **CANDIDATO PRIORITÁRIO para 20º Recorte.**
- **ABXOrchestration.tsx:** `HumanMappingDiagnosis` e `contactsBigNumbers` com valores hardcoded (aceito como estado definitivo).

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
