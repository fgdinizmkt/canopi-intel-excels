# 05 - Handoff atual

## Estado atual
- Fase: Fase 6 — Estruturação de Inteligência de Scoring
- **Último recorte concluído:** Base numérica estrutural para Scoring (21º Recorte Fase 6)
- **Último commit relevante:** `85ca5af` — feat(data): implementa base numerica estrutural para scoring (budgetBrl)
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

## O que foi entregue (21º Recorte — Fase 6)
- **Tipo:** Preparação estrutural de base de dados.
- **Feat:** Expansão da interface `Conta` com campos mandatórios de scoring (`icp`, `crm`, `vp`, `ct`, `ft`, `budgetBrl`).
- **Padronização:** Campo `budgetBrl` definido como valor absoluto em BRL (Reais) com comentário JSDoc.
- **Dados:** Enriquecimento de `contasMock` com valores numéricos coerentes com a realidade das contas.
- **Integridade:** Build de produção validado (Exit code: 0); sem regressões de tipagem.
- **Total:** `15 insertions(+), 2 deletions(-)` — entrega documental e de dados íntegra.

---

## Próximos passos (Roadmap)
1. Iniciar o **22º Recorte da Fase 6**.
2. Candidato priorizado:
   - **Conexão Funcional de Heatmaps:** Alterar `AbmStrategy.tsx` para consumir dinamicamente os novos campos de scoring (`icp`, `crm`, `vp`, `ct`, `ft`, `budgetBrl`) nos 6 heatmaps.
3. **Escopo:** Substituir o cálculo estático/placeholder pela leitura real dos campos estendidos na interface `Conta`.

## Pendências / Backlog
- **Actions.tsx:** CSS inline em botões novos (Migrar para classes se necessário).
- **AbmStrategy.tsx:** 
  - **Conexão Funcional — PENDENTE:** Integrar a nova base financeira aos gráficos dinâmicos.
  - **IIFEs (~1016 linhas) — BLOQUEADO:** Refactor eventual em Fase 6+, fora do escopo incremental atual.
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente.

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
