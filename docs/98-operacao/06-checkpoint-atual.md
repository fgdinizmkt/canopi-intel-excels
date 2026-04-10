# Checkpoint Atual — 2026-04-10

**Status:** Recorte 34 concluído e publicado. Main estável em origin/main.

**Recorte 34 Publicado:**
- Commit: `650a4c4` — `feat(accounts): add defensive tipoEstrategico persistence`
- Descrição: Primeira escrita defensiva em accounts com campo `tipoEstrategico`, local-first + fire-and-forget
- Impacto: UI mínima (4 botões toggle em lista), grade/board intactos

## Objetivo Atual
Prosseguir Fase E — Supabase Migration & Scale.
Próximo passo: definição e aprovação do Orquestrador para o Recorte 35.

## Último Estado Confiável
**Recorte 34 — Supabase E9: Escrita Defensiva em Accounts (tipoEstrategico)** (commit `650a4c4`, publicado em origin/main)
**Hotfix Operacional P0 `/sinais`** (commit `90401f2`, publicado em origin/main — pós-Recorte 33)

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
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6 ativadas.
- ✅ Publicação: commits publicados em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 26: Repository layer `src/lib/actionsRepository.ts` expandido com `persistAction()` para escrita defensiva.
- ✅ Recorte 26: `persistAction()`: upsert por id via Supabase, mapeamento explícito ActionItem → ActionRow, falha silenciosa.
- ✅ Recorte 26: Helper puro `buildNewAction()`: montagem protegida, sem sobrescrita de id/status/createdAt, preservação campo a campo.
- ✅ Recorte 26: Helper puro `applyActionPatch()`: cálculo determinístico com checks de presença ('in'), histórico automático sem side effects.
- ✅ Recorte 26: `createAction()` refatorado: local-first + persistência remota fire-and-forget, sem bloqueio de UX.
- ✅ Recorte 26: `updateAction()` refatorado: snapshot ANTES de setState, cálculo final ANTES de setState, persistência remota depois.
- ✅ Recorte 26: Fire-and-forget pattern: persistAction().catch(() => {}) nunca bloqueia, nunca relança, nunca causa rollback.
- ✅ Recorte 26: SessionActions/localStorage continuam source of truth absoluta, remote persistence é complementar best-effort.
- ✅ Recorte 26: Type safety: sem `as any`, mapeamento ActionRow completo, type guard isValidSourceType.
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6 concluídas.
- ✅ Publicação: commit bf676c60fd7484ed42f41dab757e81300abdeda4 publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 27: Tipo `SignalItem` nomeado e explícito em signalsRepository.ts (20 campos: 6 obrigatórios + 14 opcionais).
- ✅ Recorte 27: Repository layer `src/lib/signalsRepository.ts` expandido com `persistSignal()` para escrita defensiva.
- ✅ Recorte 27: `persistSignal()`: upsert por id via Supabase, mapeamento explícito SignalItem → SignalRow, falha silenciosa.
- ✅ Recorte 27: Integração defensiva em `confirmAssign()`: snapshot → construção → update por id → persist fire-and-forget.
- ✅ Recorte 27: Integração defensiva em `archive()`: snapshot → construção → update por id → persist fire-and-forget.
- ✅ Recorte 27: Alinhamento garantido entre snapshot, estado local e persistência remota (sem divergência).
- ✅ Recorte 27: Sessions/localStorage continuam source of truth absoluta, remote persistence é complementar best-effort.
- ✅ Recorte 27: Type safety: tipagem `SignalItem[]` em useState, sem `as any`, mapeamento SignalRow completo.
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6, E7 concluídas.
- ✅ Publicação: commit 054254a0c96f07cb72f7433c069d2b08a40a8350 publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 28.1: Tipo `ContactItem` nomeado e explícito em contactsRepository.ts (20 campos: 4 obrigatórios + 16 opcionais, incluindo owner).
- ✅ Recorte 28.1: Repository layer `src/lib/contactsRepository.ts` expandido com `persistContact()` para escrita defensiva.
- ✅ Recorte 28.1: `persistContact()`: upsert por id via Supabase, mapeamento explícito ContactItem → ContactRow, falha silenciosa.
- ✅ Recorte 28.1: AccountDetailView com `[localContatos, setLocalContatos]` estado local dos contatos.
- ✅ Recorte 28.1: `handleUpdateContact()` callback atualiza localContatos por id (local-first).
- ✅ Recorte 28.1: ContactDetailProfile com owner assignment UI mínima (input + botão "Atribuir").
- ✅ Recorte 28.1: Ressincronização automática de ownerInput ao alternar contatos via useEffect.
- ✅ Recorte 28.1: accountId real vindo de account.id (não accountName).
- ✅ Recorte 28.1: Padrão local-first: snapshot → build → `onUpdateContact()` → `persistContact().catch()` fire-and-forget.
- ✅ Recorte 28.1: Owner muda na UI imediatamente, persistência é background best-effort.
- ✅ Recorte 28.1: Type safety: tipagem `ContactItem` explícita, sem `as any`, mapeamento ContactRow completo.
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6, E7, E8 concluídas via micro-recorte 28.1.
- ✅ Publicação: commit 027191c publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 29: Extensão do padrão defensivo de E8 para campo multi-seleção `classificacao` em contacts.
- ✅ Recorte 29: Estado `[selectedClassifications, setSelectedClassifications]` com tipagem explícita de 7 tipos.
- ✅ Recorte 29: Estado `[classificationStatus, setClassificationStatus]` para feedback "Classificação atualizada".
- ✅ Recorte 29: Função `handleToggleClassification()` reusa padrão local-first idêntico ao owner assignment.
- ✅ Recorte 29: UI inline: 7 botões toggle com cores semânticas (amber=Decisor, blue=Influenciador, emerald=Champion, purple=Sponsor, red=Blocker, slate=Técnico, indigo=Negócio).
- ✅ Recorte 29: Selecionado mostra ring effect + cores cheias; deseleccionado mostra opacity-60.
- ✅ Recorte 29: useEffect ressincroniza selectedClassifications ao alternar contatos.
- ✅ Recorte 29: Padrão: snapshot → build togglado → `setSelectedClassifications() + onUpdateContact()` local-first → `persistContact().catch()` fire-and-forget.
- ✅ Recorte 29: Classificação muda na UI imediatamente, persistência é background best-effort.
- ✅ Recorte 29: Sem novo componente, sem novo hook, sem spread em ContactItem — apenas inline em ContactDetailProfile.
- ✅ Recorte 29: Type safety: tipagem union literal explícita, sem `as any`, mapeamento ContactRow completo (já reusado de E8).
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6, E7, E8, E8.2 concluídas.
- ✅ Publicação: commit 2e46a47 publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 30: Repository layer `src/lib/abmRepository.ts` implementado (first read-only ABM).
- ✅ Recorte 30: `getAbm()` query Supabase 8 campos (id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico).
- ✅ Recorte 30: Fallback seguro: Supabase não configurado ou erro → retorna `[]` (complemento vazio).
- ✅ Recorte 30: Merge explícito em AbmStrategy.tsx com useMemo (contasMock base + supabaseAbm complemento).
- ✅ Recorte 30: Merge defensivo com nullish coalescing (`??`) em campos: icp, crm, vp, ct, ft, tipoEstrategico, abm.
- ✅ Recorte 30: Shell seguro: ignora contas remotas sem correspondente no mock.
- ✅ Recorte 30: `activeAccountId` sincroniza com `accounts` via useEffect.
- ✅ Recorte 30: `accounts` como fonte derivada final em toda UI ABM (heatmaps, TAL, métricas, posição).
- ✅ Recorte 30: Sem escrita, sem ABX, sem novos campos (read-only).
- ✅ Recorte 30: Type safety: tipagem `AbmRow` explícita, sem `as any`, mapeamento completo.
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6, E7, E8, E8.2, E10A concluídas.
- ✅ Publicação: commit 4aa13f3 publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 31: Repository layer `src/lib/abxRepository.ts` implementado (second read-only ABM complementar).
- ✅ Recorte 31: `getAbx()` query Supabase 2 campos (id, abx).
- ✅ Recorte 31: Campo `abx` é objeto aninhado com 9 campos opcionais: motivo, evolucaoJornada, maturidadeRelacional, sponsorAtivo, profundidadeComite, continuidade, expansao, retencao, riscoEstagnacao.
- ✅ Recorte 31: Fallback seguro: Supabase não configurado ou erro → retorna `[]` (complemento vazio).
- ✅ Recorte 31: Merge explícito em AbmStrategy.tsx com useMemo (contasMock base + supabaseAbm complemento + supabaseAbx complemento).
- ✅ Recorte 31: Merge defensivo com nullish coalescing (`??`) em campo: abx (objeto aninhado).
- ✅ Recorte 31: Carga paralela ABM + ABX via `Promise.all([getAbm(), getAbx()])`.
- ✅ Recorte 31: Shell seguro: ignora contas remotas sem correspondente no mock.
- ✅ Recorte 31: `accounts` como fonte derivada final em toda UI ABM (ABM + ABX merged).
- ✅ Recorte 31: Pair E10A/E10B completo: ABM + ABX em harmonia.
- ✅ Recorte 31: Sem escrita, sem novos campos (read-only).
- ✅ Recorte 31: Type safety: tipagem `AbxRow` explícita, sem `as any`, mapeamento completo.
- ✅ Transição: Fase E (Supabase Migration & Scale) em execução — E1, E2, E3, E4, E5, E6, E7, E8, E8.2, E10A, E10B concluídas.
- ✅ Publicação: commit 04f634f49c90eabea027d2f59e56549745f95b5a publicado em origin/main.
- ✅ Documentação: 00-status-atual.md, 03-log-de-sessoes.md, 06-checkpoint-atual.md, 02-decisoes-arquiteturais.md sincronizados.

- ✅ Recorte 32: Primeira escrita defensiva em ABM implementada com escopo mínimo restrito ao campo `tipoEstrategico`.
- ✅ Recorte 32: Construída função `persistAbm()` com `upsert` explícito condicional por `id` (`onConflict: 'id'`).
- ✅ Recorte 32: Interface `AbmStrategy.tsx` com seletor local-first garantindo UX estrita, persistindo em best-effort.
- ✅ Recorte 32: Transição: Primeira escrita local-first sucedendo perfeitamente o par de leitura ABM/ABX (E10A/E10B).
- ✅ Recorte 32: Publicação: commit `b944813` sincronizado e homologado (Exit 0), publicado em origin/main.

- ✅ Recorte 33: Expandir escrita defensiva em ABM para campo novo `playAtivo` com 4 valores: 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum'.
- ✅ Recorte 33: **READ:** `getAbm()` expandido para trazer `.select(..., playAtivo)` do Supabase em AbmRow.
- ✅ Recorte 33: **MERGE:** `useMemo(accounts)` aplica merge defensivo com nullish coalescing: `playAtivo: remote.playAtivo ?? merged[idx].playAtivo`.
- ✅ Recorte 33: **LOCAL-FIRST UPDATE:** `handleUpdatePlayAtivo()` implementado com padrão idêntico a `handleUpdateTipoEstrategico()` (E11A).
- ✅ Recorte 33: **PERSIST WRITE:** `persistAbm()` expandido para aceitar `playAtivo` junto com `tipoEstrategico`, upsert payload completo.
- ✅ Recorte 33: UI: 4 botões toggle (ABM, ABX, Híbrido, Nenhum) na seção "Play Ativo" com feedback visual de seleção.
- ✅ Recorte 33: Fire-and-forget defensivo mantido: falha remota nunca bloqueia UX, logging silencioso em fallback.
- ✅ Recorte 33: Ciclo local-first completo validado: READ/MERGE/LOCAL-FIRST UPDATE/PERSIST WRITE em harmonia.
- ✅ Recorte 33: Padrão escalável: expansões futuras em ABM (ou outras entidades) podem replicar este template.
- ✅ Recorte 33: Build: Exit 0 (validado, 2 files changed, 57 insertions, 7 deletions).
- ✅ Recorte 33: Publicação: commit `1c91d31` — feat(abm): expand defensive persistence to playAtivo publicado em origin/main.

- ✅ Recorte 34: Repository layer `src/lib/accountsRepository.ts` expandido com `persistAccount()` para escrita defensiva.
- ✅ Recorte 34: `persistAccount()`: upsert por id via Supabase, payload mínimo `{ id, tipoEstrategico }`, falha silenciosa.
- ✅ Recorte 34: Padrão local-first em `src/pages/Accounts.tsx`: `handleUpdateTipoEstrategico()` com snapshot/setState/persist.
- ✅ Recorte 34: Fire-and-forget: persistAccount() dispara SEM await, nunca bloqueia UX, falhas logadas silenciosamente.
- ✅ Recorte 34: UI mínima: 4 botões toggle (`ABM`, `ABX`, `Híbrida`, `Em andamento`) APENAS em view `lista`.
- ✅ Recorte 34: Grade e board intactos — permanecem somente leitura, sem mudança de comportamento.
- ✅ Recorte 34: Validação: padrão defensivo é agnóstico à entidade (comprovado em Actions E6, Signals E7, Contacts E8, ABM E11A/E11B, Accounts E9).
- ✅ Recorte 34: Build: Exit 0 (validado, 2 files changed, 66 insertions, 3 deletions).
- ✅ Recorte 34: Publicação: commit `650a4c4` — feat(accounts): add defensive tipoEstrategico persistence publicado em origin/main.

## O que está pendente
- ⌛ Definição e aprovação do Recorte 35 pelo Orquestrador.

## Próximo Passo Exato
Prosseguir Fase E — Supabase Migration & Scale. Próximo recorte: definição e aprovação do Recorte 35.