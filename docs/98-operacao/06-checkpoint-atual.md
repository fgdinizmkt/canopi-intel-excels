# Checkpoint Atual — 2026-04-07

**Status:** Recorte 23 — Supabase E3: Segunda Migração de Entidade concluído.

## Objetivo Atual
Prosseguir Fase E — Supabase Migration & Scale.
Próximo passo: definir e aprovar o Recorte 24 (E4 — Terceira Migração de Entidade).

## Último Estado Confiável
**Recorte 23 — Supabase E3: Segunda Migração de Entidade** (commit `1d7ab3d`, publicado em origin/main)

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
- ✅ Recorte 20: `resolveDuplicateActionId()` resolve determinísticamente actionId de ação equivalente.
- ✅ Recorte 20: Duplicidade deixa de ser booleana, permite deep-link `/acoes?actionId={id}` para ação existente.
- ✅ Recorte 20: Fallback genérico `/acoes` mantido apenas como contingência sem match.
- ✅ Recorte 21: SDK `@supabase/supabase-js@^2.102.1` instalado.
- ✅ Recorte 21: `.env.example` expandido com convenção dev/staging/prod.
- ✅ Recorte 21: `src/lib/supabaseClient.ts` criado com mapeamento explícito e degradação segura.
- ✅ Recorte 21: Documentação mínima de ambiente `docs/98-operacao/08-preparacao-supabase-e1.md` criada.
- ✅ Recorte 22: Repository layer `src/lib/accountsRepository.ts` implementado.
- ✅ Recorte 22: `getAccounts()`: query Supabase 24 campos + merge com contasMock + fallback seguro.
- ✅ Recorte 22: Tipagem AccountRow alinhada com Conta (risco: number, atividadeRecente/playAtivo/statusGeral como unions, tipoEstrategico).
- ✅ Recorte 22: Shell seguro para contas sem mock: todos campos obrigatórios preenchidos, campos profundos vazios.
- ✅ Recorte 22: `src/pages/Accounts.tsx` consome `getAccounts()` em useEffect com try/catch e fallback.
- ✅ Recorte 22: Cleanup de timeout corrigido (fora do async).
- ✅ Recorte 22: Todas métricas, filtros, opcoes, coberturaBase alimentadas por dados potencialmente do Supabase.
- ✅ Transição: Fase 9 (Data Intelligence & Scale) finalizada. Fase E (Supabase Migration & Scale) em execução.
- ✅ Publicação: commits publicados em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 02-decisoes-arquiteturais.md, 06-checkpoint-atual.md sincronizados.

- ✅ Recorte 23: Repository layer `src/lib/signalsRepository.ts` implementado.
- ✅ Recorte 23: `getSignals()`: query Supabase campos de SignalRow + merge com advancedSignals + fallback seguro.
- ✅ Recorte 23: Merge defensivo com nullish coalescing (??) para todos 19 campos críticos.
- ✅ Recorte 23: Shell seguro para sinais sem mock: todos campos obrigatórios preenchidos, campos profundos vazios.
- ✅ Recorte 23: `src/pages/Signals.tsx` consome `getSignals()` em useEffect com try/catch e fallback.
- ✅ Recorte 23: Logging observabilidade em 5 pontos (config, error, shell warn, success, exception).
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3 ativadas.
- ✅ Publicação: commits publicados em origin/main.
- ✅ Documentação: 00-status-atual.md, 06-checkpoint-atual.md sincronizados.

## O que está pendente
- ⌛ Definição e aprovação do Recorte 24 (E4 — Terceira Migração de Entidade) pelo Orquestrador.

## Próximo Passo Exato
Aguardar aprovação do Orquestrador para definir o Recorte 24 (E4). Candidato: contatos (Contacts).
