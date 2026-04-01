# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- Último recorte concluído: 6º Recorte — Assistant Contextual
- Último commit relevante: `0dd95a0` — feat: contextualiza assistant com dados reais da plataforma
- Branch atual: main
- Status do push: local em sincronia com origin/main

## Regras obrigatórias
- Executar apenas o recorte autorizado
- Mostrar build, git diff --stat e diff real antes de pedir aprovação
- Aguardar aprovação explícita antes de commit
- Atualizar a memória operacional ao fechar cada recorte
- Não avançar para outra frente sem fechar corretamente a atual
- Não inventar contexto, resultados ou análises
- **Mudança Visual:** Propor e validar direção visual antes de mudanças estruturais de UI.
- **Estética:** Preservar experiência premium durante refinamentos operacionais.

## Próximo passo correto
- Iniciar o 7º Recorte da Fase 5 (frente a definir pelo usuário).
- Candidatos priorizados pela varredura técnica:
  1. `Performance.tsx` — conexão com dados reais + decisão CSS inline vs Tailwind (pendência arquitetural registrada)
  2. `Contacts.tsx` — requer primeiro decisão arquitetural: página independente vs extensão de Contas
  3. Auditoria de `ABMStrategy.tsx` (2627 linhas, maior risco de dívida técnica)
- Manter foco em refino funcional e preservação da estética premium.

## Pendências / Backlog
- **Performance.tsx:** dados hardcoded desconectados de `contasMock` e `advancedSignals`; CSS inline `perf-*` em aberto.
- **Contacts.tsx:** decisão arquitetural pendente (página independente vs extensão de Contas).
- **ABMStrategy.tsx:** sem audit recente; maior arquivo do projeto; sem `AccountDetailContext`.
- **ABXOrchestration.tsx:** sem `AccountDetailContext`; usa `abxData` próprio sem audit recente.

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
