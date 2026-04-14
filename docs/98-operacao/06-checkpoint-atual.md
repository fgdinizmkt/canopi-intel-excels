# Checkpoint Atual — Estado Real do main (2026-04-14)

## Estado de Partida
- **Branch:** `main` (sincronizada em 2026-04-14)
- **HEAD real publicado:** `8762ae4` — `feat(accounts): apply 4c list volume and hygiene controls`
- **Status da Infra:** Fase E (E1–E20) consolidada. Bloco C infra + seed publicados. Consumo UI do Bloco C publicado. Paridade funcional dos perfis aprovada e fechada. Refinamento Accounts (8 subetapas) publicado.

## 1. Recortes Concluídos (Fase E)

- ✅ Recorte 41: Adição de strategyNarrative, riskAssessment e successCriteria em `Conta.abx`.
- ✅ Recorte 41: Repository layer expandido com `persistAbx()` em `src/lib/abxRepository.ts`.
- ✅ Recorte 41: UI Expansionista integrada ao card de Ranking ABM em `AbmStrategy.tsx`.
- ✅ Recorte 41: Publicação: commit `616a8ca` — feat(abx): add defensive strategic narrative persistence publicado em origin/main.

- ✅ Recorte 40: Modelagem `Conta.abm` expandida com 3 campos narrativos estratégicos.
- ✅ Recorte 40: Repository layer expandido: `AbmRow.abm` contém 3 campos narrativos.
- ✅ Recorte 40: Publicação: commit `88bceb3` — feat(abm): add defensive strategic narrative persistence publicado em origin/main.

- ✅ Recorte 39: Repository layer expandido com `resolutionPath`, `executionNotes`, `learnings` em ActionRow.
- ✅ Recorte 39: ModalTab expandido com "narrativa", ActionOverlay + 4ª aba discreta.
- ✅ Recorte 39: Publicação: commit `a60f2f9` — feat(actions): add defensive narrative editing with atomicity publicado em origin/main.

- ✅ Recorte 38: Repository layer expandido: 3 campos narrativos (`observacoes`, `historicoInteracoes`, `proximaAcao`) em ContactItem/ContactRow.
- ✅ Recorte 38: Seção "Narrativas Operacionais" com UI dupla (read/edit) em ContactDetailProfile.
- ✅ Recorte 38: Publicação: commit `8abd084` — feat(contacts): add defensive narrative editing publicado em origin/main.

- ✅ Recorte 37: Repository layer verificado para context, probableCause e recommendation em SignalItem.
- ✅ Recorte 37: Drawer synchronization pattern para edição de sinais.
- ✅ Recorte 37: Publicação: commit `16e673e` — feat(signals): add defensive narrative editing with modal publicado em origin/main.

- ✅ Recorte 36: AccountPersistPayload expandido para 4 campos narrativos em Accounts.
- ✅ Recorte 36: Modal de edição narrativa dual em Accounts view lista.
- ✅ Recorte 36: Publicação: commit `a6604c2` — feat(accounts): add defensive narrative persistence publicado em origin/main.

- ✅ Recorte 35: Escrita defensiva em Accounts expandida para `playAtivo`.
- ✅ Recorte 35: Padrão dual-field snapshot garantindo integridade contra sobrescrita.
- ✅ Recorte 35: Publicação: commit `cdbc4f3` — feat(accounts): add defensive playAtivo persistence publicado em origin/main.

- ✅ Recorte 34: Repository layer expandido com persistAccount() para escrita defensiva (tipoEstrategico).
- ✅ Recorte 34: UI mínima de toggle estrategico em Accounts view lista.
- ✅ Recorte 34: Publicação: commit `650a4c4` — feat(accounts): add defensive tipoEstrategico persistence publicado em origin/main.

- ✅ Recorte 33: Escrita defensiva em ABM expandida para `playAtivo`.
- ✅ Recorte 33: Repository layer expandido com `.upsert()` para múltiplos campos estratégicos.
- ✅ Recorte 33: Publicação: commit `1c91d31` — feat(abm): expand defensive persistence to playAtivo publicado em origin/main.

- ✅ Recorte 32: Primeira escrita defensiva em ABM (campo `tipoEstrategico`).
- ✅ Recorte 32: Repository layer `persistAbm()` com padrão fire-and-forget.
- ✅ Recorte 32: Publicação: commit `b944813` — feat(abm): add local-first strategic type persistence publicado em origin/main.

- ✅ Recorte 31: Repository layer de ABX (Read-Only) implementado.
- ✅ Recorte 31: Merge defensivo de objetos aninhados em `AbmStrategy.tsx`.
- ✅ Recorte 31: Publicação: commit `04f634f` — feat(abx): add defensive read-only Supabase repository layer publicado em origin/main.

- ✅ Recorte 30: Repository layer de ABM (Read-Only) implementado.
- ✅ Recorte 30: Sincronização de `activeAccountId` com `accounts` derivada.
- ✅ Recorte 30: Publicação: commit `4aa13f3` — feat(abm): add defensive read-only Supabase repository layer publicado em origin/main.


- 📋 Recorte 42: Especificação visual concluída. Implementação bloqueada (régua de risco zero ativa).
  - Documento: `docs/98-operacao/07-especificacoes-visuais.md`
  - Commit de referência (não publicado): `e374cca` (descartado via `git reset`)

- 📋 Recorte 43: Mapa de cobertura de persistência documental concluído. Nenhum código alterado.
  - Documento: `docs/98-operacao/09-mapa-de-cobertura-persistencia.md`
  - **Decisão pendente de Orquestrador:** (Resolvida pelo Recorte 44)

- ✅ Recorte 44 (Documental + Funcional): Resolução de Ownership de tipoEstrategico e playAtivo.
  - Ownership centralizado em `accountsRepository`.
  - Escrita via `abmRepository` desativada para esses campos.
  - Atualização do Mapa de Cobertura Documental.

- ✅ Recorte 45 (Funcional): Leitura Defensiva de Oportunidades (E14)
  - `oportunidadesRepository.ts` validado e estruturado.
  - Orquestração de mock persistida em `accountsRepository.ts`.

- ✅ Recorte 46 (Funcional): Escrita Defensiva Atômica de Oportunidades (E15)
  - Persistência atômica de `etapa` e `risco`.
  - UI com overlay de edição e botão explícito "Salvar".
  - Publicação: commit `2f91d47` em `origin/main`.

- ✅ Recorte 47 (Funcional): Escrita Defensiva Atômica de Inteligência (E16)
  - Ciclo completo de leitura, merge e escrita de `inteligencia`.
  - Read path assíncrono fechado em `AccountDetailView.tsx`.
  - Publicação: commit `9ec0667` em `origin/main`.

- ✅ Recorte 50 (Funcional): Tecnografia de Conta (E19)
  - Ciclo completo de leitura, merge e escrita defensiva do array `tecnografia` (strings simples).
  - Repository layer expandido: `AccountRow` e `AccountPersistPayload` incluem `tecnografia`, query em `getAccounts()` persistência fire-and-forget.
  - UI local-first: `localTecnografia` como fonte de verdade, editor com controle de estado `string | null`.
  - Validação defensiva: Guard clauses bloqueiam persistência se nome vazio ou duplicado.
  - Editor mínimo: Input único para adicionar, botões inline com ✕ para remover.
  - Atomicidade: 1 snapshot → 1 build → 1 setState → 1 persist.
  - Publicação: commit `90662a0` em `origin/main`.

- ✅ Recorte 49 (Funcional): Histórico Operacional de Conta (E18)
  - Ciclo completo de leitura, merge e escrita defensiva do array `historico` estruturado.
  - Repository layer expandido: `AccountRow` e `AccountPersistPayload` incluem `historico`, query em `getAccounts()` persistência fire-and-forget.
  - UI local-first: `localHistorico` como fonte de verdade, editor modal com 4 campos (data, tipo, descricao, icone).
  - Validação defensiva: Guard clause bloqueia persistência se tipo ou descricao vazios.
  - Timeline integrada: Display combinado de `sessionLogs` (local) + `localHistorico` (remoto).
  - Separação: `sessionLogs` intocado, `historico` persiste separadamente em Supabase.
  - Atomicidade: 1 snapshot → 1 build → 1 setState → 1 persist.
  - Publicação: commit `d3ed9d9` em `origin/main`.

- ✅ Recorte 48 (Funcional): Leitura Estruturada da Conta (E17)
  - Ciclo completo de leitura, merge e escrita defensiva dos blocos estruturados: `leituraFactual`, `leituraInferida`, `leituraSugerida`.
  - Repository layer expandido: query defensiva em `getAccounts()`, fallback para mock, persistência fire-and-forget.
  - UI local-first: `localLeitura` como fonte de verdade, editor modal mínimo em `AccountDetailView.tsx`.
  - Atomicidade: 1 snapshot → 1 build → 1 setState → 1 persist.
  - Publicação: commit `569c665` em `origin/main`.

- ✅ Recorte 51 (Funcional): Canais e Campanhas de Conta (E20)
  - Ciclo completo de leitura, merge e escrita defensiva de `canaisCampanhas` (objeto aninhado com array estruturado).
  - Repository layer expandido: `AccountRow` e `AccountPersistPayload` incluem `canaisCampanhas`, query em `getAccounts()` com merge defensivo em cascata, persistência fire-and-forget.
  - UI local-first: `localCanaisCampanhas` como fonte de verdade, editor modal com input para `origemPrincipal` e textarea para `influenciasJson`.
  - Validação defensiva barreira canônica: `JSON.parse()` com try/catch, validação de array, validação de shape (5 campos string).
  - Guard clauses bloqueiam persistência se origemPrincipal vazio, JSON inválido, array inválido ou shape inválido.
  - Atomicidade: 1 snapshot → 1 build → 1 setState → 1 persist.
  - Publicação: commit `15b6371` em `origin/main`.

## 2. Recortes Publicados Pós-Fase E

- ✅ Recorte 53 (Funcional): Scoring Derivado e Priorização de Contas
  - Implementação de `calculateAccountScore()` em `scoringRepository.ts` com 5 dimensões: potencial, risco, prontidão, cobertura, confiança.
  - Funções auxiliares: `isContaCritica()`, `isAltaPrioridade()`, `getPrincipalAviso()` com lógica pura e determinística.
  - Triagem operacional integrada em Overview.tsx e Actions.tsx.
  - Sem persistência nova, sem schema novo — apenas derivação em leitura.
  - Publicação: commit `1825db0` em `origin/main`.

- ✅ Recorte 54 (Funcional): Triagem Operacional Baseada em Score
  - Grid 4-cards em Overview.tsx: Contas Críticas, Altas Prioridades, Alto Potencial/Baixa Cobertura, Top Oportunidades.
  - Categorização automática por score com cálculo determinístico.
  - Integração em Actions.tsx com as mesmas categorias de triagem.
  - Publicação: commit `fc1923f` em `origin/main`.

- ✅ Recorte 55 (Funcional): Próxima Melhor Ação Derivada por Score
  - Implementação de `deriveProximaMelhorAcao()` e `deriveMotivoDaRecomendacao()` em `scoringRepository.ts`.
  - Recomendação determinística baseada em análise pura de score (sem ML/NLP).
  - Lógica: risco crítico → prontidão alta → prioridade geral → padrão.
  - Bloco "Próxima Melhor Ação" em AccountDetailView exibindo recomendação e motivo.
  - Publicação: commit `b328523` em `origin/main`.

- ✅ Recorte 56 (Funcional): Geração de Ação Operacional a partir da Recomendação
  - Implementação de `deriveAcaoOperacional()` em `scoringRepository.ts` transformando score em ActionItem estruturado.
  - Botão "Gerar Ação Operacional" em AccountDetailView bloco "Próxima Melhor Ação".
  - Botões "Ação" em todos 4 cards de triagem em Overview.tsx (Críticas, Altas Prioridades, Alto Potencial, Top Oportunidades).
  - Ação gerada entra na fila operacional local via `createAction()` com `sourceType: 'score-derivada'`.
  - Extensão de `ActionItem.sourceType` para incluir `'score-derivada'` em `accountsData.ts`.
  - Publicação: commit `81447b4` em `origin/main`.

- ✅ Consolidação Seed Canônico (Bloco C): Concluído e Fechado
  - Auditoria completa do estado do Bloco C (Campaigns, Interactions, Plays).
  - Remoção de não-determinismo em `createCampaign()` e `createInteraction()`.
  - População final determinística: 13 campanhas, 217 interações, 65 recomendações de play.
  - Decisão: Artefato `seed/generated/bloco-c.parcial.json` agora é versionado no repositório.
  - Documentação `05-bloco-c-campaigns-interactions-e-plays.md` atualizada e sincronizada.
  - Próximo Milestone: Preparação para população real de tabelas relacionais Supabase.

- ✅ Trilha Supabase Bloco C — Infraestrutura: Concluído
  - Mapeamento de schema concluído: `campaigns`, `interactions`, `play_recommendations`.
  - Migration SQL criada em `supabase/migrations/20260413000000_bloco_c.sql`.
  - Repositories defensivos com fallback (CAM/INT/PLAY) criados em `src/lib/`.
  - Script de importação idempotente `scripts/supabase/importBlockCSeed.ts` implementado.
  - Documentação operacional consolidada em `docs/98-operacao/11-trilha-supabase-bloco-c.md`.

- ✅ **Marco Final: Paridade Funcional de Perfis (Accounts/Contacts)**: Concluído e Fechado
  - ✅ **AccountProfile.tsx**: Radar Relacional, Fila de Fogo Ativa, Contexto Compacto (Origem/Influência), Timeline 360, Portfólio & Whitespace.
  - ✅ **ContactProfile.tsx**: Paridade operacional aceitável e navegação restaurada.
  - ✅ **Funcionalidade**: CTAs da Fila de Fogo religados a `createAction` real.
  - ✅ **Infra**: Correção de hooks e padronização semântica de status de contatos.
  - ✅ **Build**: Exit 0 em produção.
  - **Commit Final:** `ee3957f` em `origin/main`.

## 3. Marcos Pós-Paridade (Publicados — pós ee3957f)

Esses marcos foram publicados em `origin/main` mas não estavam refletidos neste documento até esta reconciliação (2026-04-14).

- ✅ Accounts refinamento subetapas 1–4c (8 commits): visual direction, ergonomia, shortcut contextualization, list readability, play simplification, volume & hygiene controls.
  - Commits: `efc3fba` → `8762ae4` (HEAD atual).
  - Inclui: restore funcional (`c0e9578`), layout consolidation (`a8e1282`), fix JSX (`a5a28d1`), sanitize accountsData (`a9c29fc`), docs governance (`c69d7c0`, `6cb5eaf`).

## 4. Pendência Local Congelada (NÃO publicada)

> **Status: CONGELADA — aguarda decisão do Orquestrador**

Os seguintes arquivos estão modificados no working tree local, NÃO commitados e NÃO publicados:

- `src/lib/accountsRepository.ts` — +19 linhas (expansão defensiva)
- `src/pages/Accounts.tsx` — +20 linhas (hygiene controls)
- `src/pages/Overview.tsx` — +24 linhas (helpers `getInitials()`, `getAccountContext()`, guards defensivos)

Essas mudanças representam o material conhecido como "último refinamento local" e estão aguardando revisão e aprovação formal antes de qualquer commit.

Não existem "Restauração Funcional Crítica" nem "Recorte 61" publicados. Qualquer referência a esses termos no histórico anterior era estado documental inválido — agora eliminada nesta reconciliação.

## Próximo Passo Exato

**Decisão pendente do Orquestrador:**

- **Opção A (Higiene):** Revisar, aprovar e commitar as 3 mudanças locais.
- **Opção B (E21):** Executar migration SQL do Bloco C no Supabase remoto + import do seed + validação do consumo na UI.
- **Opção C (Documental):** Registrar entradas dos marcos pós-ee3957f em `00-status-atual.md` (concluído agora) e finalizar log de sessões.
- **Opção D (Nova frente):** Definir próximo recorte funcional.

---
*Reconciliação documental: 2026-04-14T19:50 BRT*
*Último commit real: `8762ae4` — origin/main*
*Documentos sinc: 00-status-atual.md, 05-handoff-atual.md, 06-checkpoint-atual.md*