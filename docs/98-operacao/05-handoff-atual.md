# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- Último recorte concluído: 7º Recorte — Performance com dados reais
- Último commit relevante: `165dc40` — feat: conecta performance a contas e sinais reais
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
- Iniciar o 8º Recorte da Fase 5 (frente a definir pelo usuário).
- Candidatos priorizados:
  1. `Contacts.tsx` — requer primeiro decisão arquitetural: página independente vs extensão de Contas
  2. Auditoria de `ABMStrategy.tsx` (maior arquivo do projeto, maior risco de dívida técnica)
  3. `ABXOrchestration.tsx` — sem `AccountDetailContext`; usa `abxData` próprio sem audit recente
- Manter foco em refino funcional e preservação da estética premium.

## Pendências / Backlog
- **Performance.tsx:** CSS inline `perf-*` mantido intencionalmente — migração fora do escopo do 7º recorte.
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
