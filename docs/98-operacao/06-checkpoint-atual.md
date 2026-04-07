# Checkpoint Atual — 2026-04-07

**Status:** Recorte 19 — Higiene de Deep-Link e Consumo de Query Params concluído.

## Objetivo Atual
Finalizar a Fase 9 — Data Intelligence & Scale.
Próximo passo: definir e aprovar o Recorte 20.

## Último Estado Confiável
**Recorte 19 — Higiene de Deep-Link e Consumo de Query Params** (commit `007f446`, publicado em origin/main)

## O que está concluído
- ✅ Recorte 16: Cards acionáveis implementados (4 tipos: existing_account, signal, action, new_action).
- ✅ Recorte 16: validateCards() filtra contra entidades reais (slug, signalId, actionId).
- ✅ Recorte 16: handleCreateAction() cria ação na fila via createAction() do contexto.
- ✅ Recorte 16: extractCards() parser no backend (route.ts) via CANOPI_CARDS regex.
- ✅ Estabilização Premium: interface Enterprise Edition, bolhas assimétricas, grade 12 colunas.
- ✅ Recorte 17: renderResponseCards() refatorado em 4 branches explícitos (new_action, existing_account, existing_signal, existing_action).
- ✅ Recorte 17: Deep-linking implementado para cada card type:
  - existing_account → `/contas/{slug}`
  - existing_signal → `/sinais?signalId=X` (novo)
  - existing_action → `/acoes?actionId=X` (novo)
  - new_action → `/acoes` com link "Ver Fila"
- ✅ Recorte 17: useSearchParams hooks adicionados a Signals.tsx e Actions.tsx.
- ✅ Recorte 17: Visual differentiation mantida (cores e ícones distintos por tipo).
- ✅ Recorte 18: `createAction()` retorna ID da ação criada (antes: void).
- ✅ Recorte 18: `new_action` passa a usar deep-link `/acoes?actionId={id}` direto para a ação criada.
- ✅ Recorte 18: Fallback seguro para `/acoes` quando não houver ID determinístico.
- ✅ Recorte 19: Query params `signalId` e `actionId` são consumidos e limpos da URL após deep-link.
- ✅ Recorte 19: Drawer/overlay permanecem abertos após consumo do deep-link.
- ✅ Recorte 19: Sem reabertura fantasma por URL suja (refresh/back comportam-se corretamente).
- ✅ Publicação: commits publicados em origin/main.
- ✅ Documentação: checkpoint sincronizado.

## O que está pendente
- ⌛ Definição e aprovação do Recorte 20 pelo Orquestrador.

## Próximo Passo Exato
Aguardar aprovação do Orquestrador para definir o Recorte 20.
