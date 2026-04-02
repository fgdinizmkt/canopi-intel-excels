# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último recorte concluído:** ABM TAL Real Data (Recorte 9)
- **Último commit relevante:** `1fda339` — feat: conecta tal de abmstrategy ao centro de comando
- **Data:** 2026-04-01
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

## O que foi entregue nesta sessão
- Auditoria técnica de `AbmStrategy.tsx` (2627 linhas, maior arquivo do projeto).
- Substituição do array `abmAccounts` hardcoded por derivação real de `contasMock` via `useMemo`.
- Conexão da TAL Table ao `AccountDetailContext`: clique em conta abre o Centro de Comando.
- IIFE, heatmaps, scatter, modais e benchmarks mantidos intencionalmente fora do escopo.

---

## Próximos passos (Roadmap)
1. Iniciar o 10º Recorte da Fase 5 (frente a definir).
2. Candidatos priorizados:
   - `ABXOrchestration.tsx` (sem `AccountDetailContext`, usa `abxData` próprio sem audit recente).
   - Continuação do saneamento de `AbmStrategy.tsx` (IIFE, modais e benchmarks ainda hardcoded).
   - Central de Playbooks (orquestração cross-channel corporativa).
3. Manter a estética premium e a densidade operacional nos próximos refinos.

## Pendências / Backlog
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente — migração fora do escopo do 7º recorte.
- **AbmStrategy.tsx:** TAL conectada. IIFE (~1000 linhas), `openDetailedModal` (20 cases, ~1080 linhas), benchmarks, clusters e scatter ainda hardcoded — fora do escopo do 9º recorte.
- **ABXOrchestration.tsx:** sem `AccountDetailContext`; usa `abxData` próprio sem audit recente.

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
