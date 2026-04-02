# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- **Último commit relevante:** `7354f33` — feat: estabiliza people layer e ativa acoes reais em abxorchestration
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

## O que foi entregue (fechamento definitivo da frente ABX — complementação do 10º recorte)
- `generatePeopleData`: `Math.random()` eliminado — fórmulas determinísticas estabilizam People Layer entre reloads.
- `CommercialMemoryLayer`: "Explorar Ficha 360°" agora abre modal 360° real via `handleAccountSelect`.
- `ContactOperationalFilaLayer`: "Ação" localiza conta por `p.accountId` e abre modal 360° real.
- `ContactActionsLayer`: 4 botões "Acionar Play" fictícios removidos — UX honesta.
- **Decisão arquitetural registrada:** ABX mantém profundidade própria via `compiladoClientesData`; integração com `contasMock` descartada definitivamente.

---

## Próximos passos (Roadmap)
1. Iniciar o **12º Recorte da Fase 5** (frente a definir).
2. Candidatos priorizados:
   - Continuação do saneamento de `AbmStrategy.tsx` (IIFE, modais e benchmarks ainda hardcoded).
   - Central de Playbooks (orquestração cross-channel corporativa).
3. ABX encerrado — sem dívidas imediatas.

## Pendências / Backlog
- **AbmStrategy.tsx:** TAL conectada. IIFE (~1000 linhas), `openDetailedModal` (20 cases), benchmarks, clusters e scatter ainda hardcoded.
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente.
- **Playbooks:** Orquestração corporativa ainda é conceito; requer estrutura de execução.
- **ABXOrchestration.tsx:** `HumanMappingDiagnosis` e `contactsBigNumbers` com valores hardcoded (sem fonte de dados real disponível — aceito como estado definitivo).

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
