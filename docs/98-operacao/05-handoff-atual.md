# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** Central de Playbooks (20º Recorte Fase 5)
- **Último commit relevante:** `3ea4daa` — feat(actions): implementa biblioteca de playbooks e injecao rastreavel na fila operacional
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
- **Estética:** Preservar experiênca premium durante refinamentos operacionais.

## O que foi entregue (20º Recorte — Central de Playbooks)
- **Tipo:** Implementação funcional estratégica.
- **Feat:** `PlaybookLibraryBar` retrátil com biblioteca de templates corporativos.
- **Feat:** Injeção rastreável de ações na fila operacional (`Actions.tsx`).
- **Feat:** Badges visuais de origem nos cards de Lista e Kanban.
- **Rastreabilidade:** Extensão do tipo `ActionItem` para auditoria de origem (playbook/run/step).
- **Total:** `313 insertions(+), 0 deletions(-)` — entrega íntegra e build validado.

---

## Próximos passos (Roadmap)
1. Iniciar o **21º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - **Evolução de `contasMock`:** Adicionar icp, crm, vp, ft, budget numéricos para DESBLOQUEAR os heatmaps de `AbmStrategy.tsx`.
   - Refactor defensivo de helpers scoring (`getHmScore`, `getWeightedIcp`) — Fase 6+, não agora.
3. **Bloqueios formais registrados:**
   - `abmHeatmapAccounts` bloqueado até a evolução de `contasMock`.
   - IIFEs de `AbmStrategy.tsx` fora do escopo incremental (19º recorte).

## Pendências / Backlog
- **Actions.tsx:** CSS inline em botões novos (Migrar para classes se necessário).
- **AbmStrategy.tsx:** 
  - **`abmHeatmapAccounts` — BLOQUEADO:** Aguardando base numérica em `contasMock`.
  - **IIFEs (~1016 linhas) — BLOQUEADO:** Refactor eventual em Fase 6+.
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente.

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
