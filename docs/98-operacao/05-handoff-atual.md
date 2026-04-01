# 05 - Handoff atual

## Estado atual
- Fase: Fase 5 — Refino e endurecimento
- Último recorte concluído: Centro de Comando (Fase 1 — Perfil da Conta)
- Último commit relevante: eb6e07a - feat: implementacao do Centro de Comando (Fase 1) e costura global em Accounts, Outbound, Actions e Signals
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
- Executar a Fase 2 do Centro de Comando: Organograma Visual em `AccountDetailView.tsx`.
- Executar a Fase 3 do Centro de Comando: Perfil Granular do Contato.
- Manter a integridade da navegação híbrida (Drawer/Fullscreen) durante as expansões.

## Pendências / Backlog
- **Organograma Visual:** Implementação técnica do grafo de Stakeholders (Fase 2).
- **Perfil do Contato:** Detalhamento individual de Stakeholders (Fase 3).
- **Consolidação Assistant:** Integrar o assistente de IA com o contexto da conta aberta.

## Arquivos que sempre precisam ser lidos
- AGENTS.md
- docs/98-operacao/00-status-atual.md
- docs/98-operacao/01-roadmap-fases.md
- docs/98-operacao/02-decisoes-arquiteturais.md
- docs/98-operacao/03-log-de-sessoes.md
- docs/98-operacao/04-regras-do-processo.md
- docs/98-operacao/05-handoff-atual.md
