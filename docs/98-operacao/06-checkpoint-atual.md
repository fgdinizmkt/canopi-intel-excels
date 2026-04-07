# Checkpoint atual

## Status
LIMPO

## Origem
institucionalização inicial do protocolo CHECKPOINT

## Confiabilidade
alta

## Data/hora
2026-04-07

## Agente responsável
ChatGPT

## Objetivo atual
Formalizar um protocolo universal de checkpoint para que qualquer agente consiga salvar ou resgatar o contexto operacional do projeto sem depender da memória do chat.

## Estado de git
- Branch: `main`
- HEAD publicado: `a5b43d0`
- origin/main: sincronizada
- Working tree: limpa no último estado validado reportado pelo usuário

## Concluído
- Assistant Premium estabilizado e publicado em `origin/main`
- Memória consolidada do recorte já sincronizada em `00-status-atual.md` e `03-log-de-sessoes.md`
- Arquivo canônico de checkpoint criado em `docs/98-operacao/06-checkpoint-atual.md`

## Pendente
- Formalizar no `AGENTS.md` a regra universal de leitura e escrita do checkpoint
- Definir explicitamente os dois comandos canônicos:
  - `CHECKPOINT` = salvar
  - `CHECKPOINT SOS` = resgatar

## Última validação conhecida
- Publicação remota confirmada do commit `a5b43d0`
- Branch local reportada como sincronizada com `origin/main`
- Working tree reportada como limpa

## Riscos / atenção
- Enquanto `AGENTS.md` não refletir o protocolo, o checkpoint ainda não está plenamente institucionalizado
- O arquivo já existe e pode servir como âncora factual de retomada, mas a regra universal ainda precisa ser registrada

## Próximo passo exato
Atualizar o `AGENTS.md` para tornar obrigatório que qualquer agente:
1. leia `docs/98-operacao/06-checkpoint-atual.md` antes de agir, se ele existir
2. atualize o arquivo ao receber `CHECKPOINT`
3. entre em modo resgate ao receber `CHECKPOINT SOS`
