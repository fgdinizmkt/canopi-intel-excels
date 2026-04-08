# Checkpoint Atual — 2026-04-07

**Status:** Recorte 25 — Supabase E5: Quarta Migração de Entidade concluído.

## Objetivo Atual
Prosseguir Fase E — Supabase Migration & Scale.
Próximo passo: definir e aprovar o Recorte 26 (E6 — Quinta Migração ou escrita defensiva).

## Último Estado Confiável
**Recorte 25 — Supabase E5: Quarta Migração de Entidade** (commit `77eb41f`, publicado em origin/main)

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
- ✅ Recorte 24: Repository layer `src/lib/contactsRepository.ts` implementado.
- ✅ Recorte 24: `getContactsFromMock()` extrai contatos flat com accountId/accountName.
- ✅ Recorte 24: `getContacts()`: query Supabase campos de ContactRow + merge com contasMock + fallback seguro.
- ✅ Recorte 24: Merge defensivo com nullish coalescing (??) para todos 18 campos (7 obrigatórios + 11 opcionais).
- ✅ Recorte 24: Shell seguro para contatos sem mock: todos campos obrigatórios preenchidos (id, nome, forcaRelacional, classificacao, influencia, accountId, accountName).
- ✅ Recorte 24: `src/pages/Contacts.tsx` consome `getContacts()` em useEffect com try/catch e fallback.
- ✅ Recorte 24: Adapter tipado `radarContacts` em useMemo<EnrichedContact[]> resolve mismatch RepositoryContact → component props.
- ✅ Recorte 24: Sem `as any` — type safety completa via adapter explícito.
- ✅ Recorte 24: Logging observabilidade em 5 pontos (config, error, shell warn, success, exception).
- ✅ Recorte 25: Repository layer `src/lib/actionsRepository.ts` implementado como camada complementar/remota.
- ✅ Recorte 25: `getActions()`: query Supabase 31 campos de ActionRow (13 obrigatórios + 18 opcionais) + retorna [] em erro.
- ✅ Recorte 25: Type guards explícitos (isValidPriority, isValidStatus, isValidSlaStatus, isValidSourceType) — sem `as any`.
- ✅ Recorte 25: Shell seguro para ações remotas: todos 13 campos obrigatórios preenchidos (id, priority, category, channel, status, title, description, accountName, origin, slaStatus, suggestedOwner, ownerTeam, createdAt).
- ✅ Recorte 25: `src/pages/Actions.tsx` consome `getActions()` em useEffect com dependências `[]` (uma vez no mount).
- ✅ Recorte 25: supabaseActions = estado complementar; sessionActions = source of truth (primária).
- ✅ Recorte 25: allItems via useMemo com merge explícito donde sessionActions siempre vence por id.
- ✅ Recorte 25: Sem refetch desnecessário (merge é local e reativo, useEffect não depende de sessionActions).
- ✅ Recorte 25: Decisão arquitetural: AccountDetailContext/sessionActions = source of truth; actionsRepository.ts = complementary; Actions.tsx = responsável pelo merge.
- ✅ Recorte 25: createAction, updateAction, deep-linking, playbooks, localStorage/sessionActions preservados intactos.
- ✅ Recorte 25: Logging em 4 pontos (config, error, success, exception).
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5 ativadas.
- ✅ Publicação: commits publicados em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

## O que está pendente
- ⌛ Definição e aprovação do Recorte 26 (E6 — Quinta Migração ou Escrita) pelo Orquestrador.

## Próximo Passo Exato
Aguardar aprovação do Orquestrador para definir o Recorte 26 (E6). Candidatos: escrita defensiva em repositórios existentes ou ABM/ABX/oportunidades migrations.
