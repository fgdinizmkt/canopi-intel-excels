# Orquestração de subagentes e ambientes executores — OPS.AGENTS.01

> **Status:** registrado como regra operacional viva para direcionamento de agentes, ambientes e perfis especializados.

## Objetivo

Formalizar a distinção entre:

- **ambiente executor**: onde a ação é executada;
- **subagente/perfil especializado**: recurso acionado dentro desse ambiente;
- **motivo da escolha**: justificativa operacional para a combinação escolhida.

## Regra central

Antes de qualquer tarefa, o orquestrador deve decidir nesta ordem:

1. qual **ambiente executor** usar;
2. qual **subagente/perfil** acionar dentro desse ambiente;
3. por que essa combinação é a mais adequada para o recorte atual.

## Ambientes executores

Os ambientes executores atualmente considerados válidos são:

- **Claude Code / Claude Code Sonnet**
- **Codex**
- **Gemini / Gemini CLI / Antigravity**

Esses ambientes são a camada de execução principal. Eles não devem ser confundidos com os subagentes/perfis instalados.

## Subagentes e perfis especializados

Os recursos abaixo devem ser tratados como subagentes/perfis acionáveis dentro dos ambientes executores:

- **GooseWorks**
- **OpenSquad**
- **Agency Agents**
- outros subagentes ou perfis customizados instalados

Esses recursos não devem ser tratados como ferramentas autônomas paralelas. A leitura correta é sempre:

`ambiente executor + subagente/perfil + objetivo`

## Matriz operacional

| Situação | Ambiente executor | Subagente/perfil |
|---|---|---|
| Pesquisa externa, enriquecimento, lead gen | ambiente disponível mais adequado | GooseWorks |
| Orquestração multiagente | Claude Code, Codex ou Gemini/Antigravity conforme o contexto | OpenSquad |
| Auditoria técnica local, diff, build, Git | Codex ou Claude Code | subagente/perfil especializado, se houver |
| Arquitetura sensível, mapping, identidade, segurança, fluxo de dados | Claude Code / Sonnet | subagente/perfil especializado, quando fizer sentido |
| Revisão ampla, comparação, apoio analítico e validação contextual | Gemini / Gemini CLI / Antigravity | subagente/perfil apropriado ao recorte |

## Guardrails

- O ambiente vem antes do subagente.
- O subagente não substitui a escolha do ambiente executor.
- A decisão deve sempre registrar o motivo da combinação escolhida.
- Não tratar GooseWorks, OpenSquad ou Agency Agents como serviços independentes fora do ambiente executor.
- Se a tarefa mudar de natureza, a combinação ambiente + subagente também deve mudar.

## Estado operacional atual

Recursos atualmente disponíveis no projeto:

- **GooseWorks**: instalado e autenticado, pronto para uso como subagente/perfil de pesquisa e enriquecimento.
- **OpenSquad**: instalado no repositório local, pronto para uso como subagente/perfil de orquestração multiagente.
- **Agency Agents**: instalado nos ambientes detectados e convertido para Claude Code, GitHub Copilot e Gemini CLI, pronto para uso como subagente/perfil especializado.

## Como registrar escolhas futuras

Em cada recorte, registrar explicitamente:

- ambiente executor selecionado;
- subagente/perfil acionado;
- motivo da escolha;
- condição de troca, se houver risco, ambiguidade ou mudança de escopo.

## Limites

- Este documento não altera código funcional.
- Este documento não executa apply, RPC ou escrita de dados.
- Este documento apenas formaliza governança operacional.

## Próximo passo recomendado

Usar esta regra como padrão para os próximos recortes: primeiro ambiente executor, depois subagente/perfil, depois justificativa.
