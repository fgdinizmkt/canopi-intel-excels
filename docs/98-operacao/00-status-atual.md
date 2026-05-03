# Status atual do projeto

## Branch principal
`main` em `5a41865` (Local = `origin/main` = Google Drive). **Estado Salesforce estabilizado e fechado operacionalmente**: OAuth produtivo preservado, Account/describe validado, discovery read-only multiobjeto preservado (Account, Contact, Opportunity, Lead, Campaign), CSV por entidade preservado como entrada local e Token temporário preservado como validação pontual. A UI “Frankenstein” introduzida pelos commits `b4beff7` e `6297de5` foi revertida para restaurar estabilidade.

Salesforce continua **não sendo conector produtivo completo**: sem sync real, sem Bulk API, sem writeback real e sem importação real.

Pendências futuras (fora do escopo atual):
- abrir recortes próprios para sync read-only controlado, Bulk API e writeback;
- criar “Base de Teste Completa por CRM” (pós-configurações) para validar leitura/interpretação/vínculos com dados robustos.

## Fase atual do plano
**Fase E — Supabase Migration & Scale** (Concluída: E1–E20 + Bloco C Infra + Consumo UI + AccountProfile/ContactProfile Parity + Refinamento Accounts 1–4c + Fallback Defensivo + E21 Bloco C Population + E22 CockpitV2 Tactical Polish + **Saneamento Absoluto Final**)

---

### MARCO: Saneamento Absoluto Final do Repositório — 2026-04-22

**Status: Concluído (Build & Lint 0 Warnings)**

- **Hooks Integrity:** Zeragem total de warnings `exhaustive-deps` em componentes críticos (`AccountProfile`, `Overview`, `Signals`, `Actions`, `AbmStrategy`, `usuario/page`, `DecisionMindMap`).
- **Acessibilidade:** Correção de labels e atributos ARIA em formulários e seletores em `Signals.tsx` e `usuario/page.tsx`.
- **Build de Produção:** Validado com `npm run build` (Exit 0) e `npm run lint` (0 warnings).
- **Estabilização:** Repositório em estado "pristine" para entrega e governança futura.

---

### MARCO: Configurações & Setup (Etapa 5: Intelligence Exchange e Governança) — 2026-04-23

**Status: Concluído no Front-end (Materializado)**

- **Intelligence Exchange:** Camada funcional de propagação de inteligência (ABM ↔ ABX) com regras de confiança e validade.
- **Learning Repository:** Catálogo de padrões e recomendações reaproveitáveis entre contextos.
- **Governança:** Setup de versionamento, políticas de publicação (peer review) e log histórico de alterações.
- **Permissões:** Controle de acesso granular por domínio de inteligência (mídia, sinais, plays, exchange).
- **Finalização:** Etapa final do Roadmap de Setup materializada e validada via Build.

---

### MARCO: Configurações & Setup (Etapa 4: Plays, ABM e ABX) — 2026-04-23

**Status: Concluído no Front-end (Materializado)**

- **Biblioteca de Plays:** Materialização de 7 táticas canônicas (Executive Intro, Stakeholder Expansion, etc.) com critérios de sucesso e governança.
- **ABM Setup:** Parametrização de ICP (verticals, technographics), Tiers de conta e clusters operacionais baseados em lógica de segmentação.
- **ABX Orchestration:** Definição de regras de orquestração de jornada, triggers de multi-threading e critérios de prontidão para expansão (Readiness).

---

### MARCO: Configurações & Setup (Etapa 3: Scores, Sinais e Roteamento) — 2026-04-22

**Status: Concluído no Front-end (Materializado)**

- **Scores & Atribuição:** Implementação de engine de pesos para Lead Fit, Engagement e Account Potential com visualização de gatilhos.
- **Sinais & Triggers:** Parametrização de severidade, cooldown e dependência de fontes para os 6 alertas canônicos do Cockpit.
- **Roteamento & SLA:** Tabela de roteamento funcional baseada em tier de conta e criticidade de sinal, com fluxos de fallback.

---

### MARCO: Configurações & Setup (Etapa 2: Mídia & Conversões) — 2026-04-22

**Status: Concluído no Front-end (Materializado)**

- **Mídia & Analytics:** Parametrização funcional de GA4, Google Ads, Meta e LinkedIn com monitoramento de status e frequência de sync.
- **Eventos & Conversões:** Registro de eventos canônicos (primary/secondary) com mapeamento de origem e destino na Canopi.
- **Atribuição & Taxonomia:** Definição de modelos de atribuição multi-touch e regras de nomenclatura de UTMs para ABM/ABX Plays.

---

### MARCO: Configurações & Setup (Etapa 1: Objetos, Campos, CRM e Matching) — 2026-04-22

**Status: Concluído no Front-end (Materializado)**

- **Entidades-Base:** Mapeamento de Conta, Contato, Oportunidade e Campanha como fontes primárias.
- **Source of Truth:** Configuração de prioridade de fontes e regras de overwrite em caso de conflito.
- **Lifecycle & Pipeline:** Setup de estágios operacionais (MQL, SQL, Won, Lost) e critérios de passagem.
- **Matching Logic:** Definição de regras de deduplicação por domínio e email.

---

### MARCO: Contas V2 — Separação de Responsabilidades e Refinamento — 2026-04-25

**Status: Recortes Fase A, B.1, C1, C1.1, C1.2 e C1.3 concluídos e publicados em origin/main**

- **Fase A** (`219afa2`): Fontes e Conectores transformada em etapa de contrato local de leitura. Tabela de mapeamento canônico removida. Responsabilidades separadas por etapa.
- **Fase B.1** (`73ff047`): Camada Canônica com revisão local real do mapeamento. `canonicalMapping` e `canonicalMappingReviewed` como artefatos de sessão. Ações reais: revisar, reabrir, restaurar preset.
- **Recorte C1** (`27e8513`): Modelo estrutural de conexão real scaffolded — `accountConnectionModel`, `accountConnectorAdapters` por provedor. Sem OAuth/token real.
- **Recorte C1.1** (`4097668`): Painel de configuração local editável. `localSourceConfigByProvider` com persistência por provider via sessionStorage.
- **Recorte C1.2** (`de567e2`): Refinamento visual — cards compactos, blocos por função (essenciais, opcionais, observações, específicos), destaque da ação principal.
- **Recorte C1.3** (`03134ec`): Lapidação final de densidade — texto secundário compactado, "Complementares, não obrigatórios" no Bloco B, grade `xl:grid-cols-4`, padding reduzido, nota explicativa no botão de salvar local.

**Limite operacional confirmado:**
- Nenhum recorte implementou OAuth, token, API externa, sync real ou backend de conexão.
- Fontes opera exclusivamente como setup local/simulado do contrato de leitura.
- Próximos artefatos ainda pendentes: `identityRules` (Fase C), `canonicalMapping` integrado a gates (Fase B.2), `classificationRules` (Fase E).

### MARCO: Salesforce S1/S2 — Auditoria do fluxo atual e congelamento funcional — 2026-05-01

**Status: S1 publicado; S2 concluído como auditoria documental**

- **S1 publicado:** a copy visual de Salesforce foi ajustada para `Teste com token temporário`, `Validação com token temporário` e `Testar acesso com token`, sem alterar comportamento.
- **Auditoria S2 concluída:** Salesforce hoje é controlado por `AccountSources.tsx`, `salesforceAdapter.ts`, `accountConnectionModel.ts`, `src/app/api/account-connectors/salesforce/test/route.ts` e `contaConnectorsV2.ts`.
- **Comportamento real existente:** teste server-side mínimo com `instanceUrl + Bearer token temporário`, usando `Account/describe` para leitura read-only do objeto `Account`.
- **Limites atuais:** não existe preview próprio de Salesforce, não existe schema discovery próprio além do teste/describe mínimo e não existe reset próprio de sessão Salesforce.
- **CSV:** continua como fluxo genérico compartilhado no módulo, não como implementação Salesforce dedicada.
- **Diretriz operacional:** Salesforce permanece pendente/congelado para incrementos funcionais; qualquer próximo passo deve decidir primeiro se CSV local dedicado, reset visual ou apenas encerramento desta versão como teste mínimo são realmente necessários.
- **Guardrails:** não chamar Salesforce de completo, não chamar Fontes e Conectores de fechado globalmente, não prometer OAuth produtivo, Connected App, External Client App, sync, writeback, Bulk API ou importação real.

### MARCO: Salesforce 2C.1 — Metadados de Account read-only após token temporário — 2026-05-02

**Status: Concluído e publicado em origin/main**

- **Commit:** `d2afafa` — `feat(settings): show Salesforce Account metadata fields`
- **Objetivo:** mostrar os campos de metadados do objeto `Account` de forma read-only após teste bem-sucedido com token temporário.
- **Escopo real:** visualização read-only dos metadados de `Account` no Salesforce dedicado, sem OAuth real, sem CSV real, sem persistência de token, sem `localStorage`, sem cookies, sem banco, sem sessão, sem contexto global, sem sync, sem writeback e sem leitura de registros reais.
- **Garantias:** o recorte não transforma Salesforce em conector produtivo completo; ele apenas confirma a fronteira local de leitura do objeto `Account`.
- **Validações:** `npm run lint` OK; `npm run build:safe` OK; `HEAD = origin/main = d2afafa`; working tree limpa.
- **Memória operacional:** o espelho local/GitHub já está fechado; o espelho para o Google Drive oficial deve ser aplicado pelo ritual de atualização de memória quando houver acesso conectado ou atualização manual.

### MARCO: Salesforce 2C.2 — Preparação local de CSV exportado — 2026-05-02

**Status: Concluído e publicado em origin/main**

- **Commit:** `46fae8f` — `feat(settings): add Salesforce CSV preparation flow`
- **Objetivo:** concluir o fluxo local de preparação de CSV exportado do Salesforce na página dedicada de Configurações.
- **Escopo real publicado:**
  - componente dedicado `SalesforceCsvPreparation.tsx` integrado em `SalesforceMethodSelector.tsx`;
  - requisitos do CSV, download de exemplo, upload local, parsing client-side e detecção de delimitador;
  - validações de extensão, tamanho, cabeçalho e headers duplicados;
  - leitura de colunas com exemplos, ajuste local por coluna (`Usar sugestão`, `Trocar campo`, `Ignorar coluna`);
  - contadores de reconhecidas, alternativas locais, não reconhecidas e ignoradas;
  - gate de obrigatórios para confirmação local:
    - Nome da conta: `Account Name` ou `Nome da conta para preview`;
    - Identificação/desambiguação: `Account Id`, `Domínio`, `Website` ou `Documento local`;
  - bloqueio amigável da confirmação enquanto obrigatórios estiverem pendentes;
  - confirmação para esta sessão e resumo final do ajuste local.
- **Garantias e limites:** sem persistência; sem `localStorage`; sem `sessionStorage`; sem cookies; sem banco; sem rota API nova; sem sync; sem writeback; sem dedupe; sem matching real; sem criação/atualização de registros; sem alteração em outros CRMs.
- **Validações:** `npm run lint` OK; `npm run build:safe` OK; `HEAD = origin/main = 46fae8f`; working tree limpa.
- **Memória operacional:** fechamento técnico + visual aprovado pelo Fábio; pendente apenas o espelhamento no Google Drive quando aplicável.

### MARCO: RD Station R2A/R2B — tentativa de copy/modelagem revertida e congelamento operacional — 2026-05-01

**Status: Revertido antes de commit; RD Station voltou ao estado publicado anterior**

- **R1 auditado:** RD Station CRM foi confirmado como preset local/shell, sem API real, sem token real, sem preview/schema/reset próprios e sem CSV dedicado.
- **R2A tentado localmente:** a copy/modelagem visual foi ajustada para reduzir linguagem de API/token e apontar RD Station como preset local sem conexão externa.
- **Regressão funcional encontrada:** a validação visual mostrou quebra de interatividade, com os cards de CRM deixando de responder ao clique.
- **Reversão:** os três arquivos do recorte foram restaurados antes de commit, recuperando os cliques dos CRMs e deixando RD Station no estado publicado anterior.
- **Diretriz pós-reversão:** novas alterações em RD Station devem começar por um recorte menor e mais seguro, com diagnóstico do componente/card e dos eventos de clique antes de qualquer novo ajuste de copy.
- **Guardrails:** não criar rota API RD, não criar token real, não criar sync/writeback/importação real, não mexer em HubSpot/Salesforce/Outro CRM no mesmo recorte.

### MARCO: Critério de fechamento CRM 100% — 2026-05-01

**Status: Definição operacional consolidada**

- **Definição correta:** um CRM só é considerado fechado quando todas as formas relevantes de conexão/entrada daquela fonte estiverem funcionais, testáveis, visualmente claras e validadas pelo Fábio no browser.
- **HubSpot:** mais próximo de fechado na versão atual, com Private App/API Token, CSV local, preview read-only, schema discovery e reset funcionando.
- **Salesforce:** incompleto; possui apenas teste mínimo com token temporário, sem CSV dedicado, sem preview/schema/reset próprios.
- **RD Station CRM:** incompleto; permanece como preset local/shell, sem fechamento.
- **Outro CRM:** incompleto; permanece pendente.
- **Guardrails:** não declarar Fontes e Conectores como fechado globalmente, não confundir tentativa revertida com fechamento, não prometer sync/writeback/importação real para nenhum CRM nesta frente.

---

### MARCO: CockpitV2 Intelligence & Tactical UX — 2026-04-20
**Status: Concluído e Validado Visualmente**

- **Evolução do Sinal:** Primeiro nó da árvore (`signal`) transformado em uma evolução direta do card de seleção, mantendo hierarquia (Conta > Sinal) e severidade.
- **Painel Tático (Drawer):** Redesenho integral com dark theme tático (`#16181D`). Segmentação clara entre Contexto Operacional, Evidências e Matriz de Decisão.
- **Matriz de Decisão:** Implementação de análise de consequências, probabilidade de sucesso e atribuição de responsável para cada opção estratégica.
- **Sincronização Atômica DOM:** Zeragem de lag nos conectores durante drag via injeção direta de atributos no SVG (bypass React render).
- **Dados:** Persistência de `consequence` no modelo de dados e registro atômico na jornada de decisões.
- **Build de Produção:** Validado com `npm run build` (Exit 0).
- **Aprovação:** Validado visualmente pelo usuário conforme requisitos de alta fidelidade operacional.

---

### MARCO: E21 — População do Bloco C no Supabase Remoto - 2026-04-14
**Status: Concluído e Validado**

- **Fase 1 (Migration):** `supabase/migrations/20260413000000_bloco_c.sql` executada com sucesso no Supabase remoto
  - 3 tabelas criadas: `campaigns`, `interactions`, `play_recommendations`
  - Índices de performance estabelecidos (account_id, campaign_id)
  - RLS (Row Level Security) configurado com políticas de acesso
  
- **Fase 2 (Import):** `scripts/supabase/importBlockCSeed.ts` executado com sucesso
  - Seed data lido de `seed/generated/bloco-c.parcial.json`
  - Upsert idempotente com mapeamento camelCase → snake_case
  - Interações processadas em chunks de 50 registros
  
- **Volumes Importados:**
  - **campaigns:** 13 registros (inbound/outbound, múltiplos canais)
  - **interactions:** 217 registros (email, meeting, demo, submission — histórico completo)
  - **play_recommendations:** 65 registros (ABM Entry, Consulting, Platform — múltiplas contas)
  
- **Fase 3 (Validação Pós-Import):** Queries de validação + teste de repositórios
  - ✓ Todas as 3 tabelas acessíveis via anon key
  - ✓ Volumes confirmados: 13 campaigns, 217 interactions, 65 play_recommendations
  - ✓ `getCampaigns()` / `getCampaignsMap()` operacionais (13 entradas mapeadas)
  - ✓ `getInteractions()` / `getInteractionsByAccount()` operacionais (217 registros)
  - ✓ `getPlayRecommendations()` / `getPlayRecommendationsByAccount()` operacionais (65 registros)
  - ✓ Mapeadores snake_case ↔ camelCase validados
  - ✓ RLS permitindo leitura correta sem exposição de dados sensíveis

- **Impacto Operacional:**
  - Bloco C agora 100% populado no Supabase remoto
  - Repositórios consumindo dados reais de campanha, interação e recomendação de play
  - UI reflete comportamento de dados remotos: filtros, timelines, recomendações
  - Fallback defensivo ainda protege Accounts em caso de Bloco C indisponível

- **Artefatos Temporários:** Scripts de validação e validação removidos (check-migration, import, validate-bloco-c, validate-repositories)

---

### MARCO: Fallback Defensivo para Dataset Insuficiente/Corrompido - 2026-04-14
**Status: Publicado (Commit `915a2ba`)**

- **Função alterada:** `getAccounts()` em `src/lib/accountsRepository.ts`
- **Validação implementada:** 
  1. **Volumetria:** Rejeita dataset com < 20 contas (mínimo para operação estratégica)
  2. **Integridade:** Rejeita se > 10% dos registros faltam `nome` ou `slug` (identidade crítica)
- **Comportamento:** Automaticamente restaura `contasMock` com warning no console quando dataset é insuficiente/corrompido
- **Escopo:** Puro read-only, sem mutação de dados, sem alteração de persistência
- **Impacto operacional:** Elimina risco de Accounts operar com base parcial. Sistema agora valida qualidade do dataset antes de usar, garantindo que sempre funciona com base canônica válida.

---

### MARCO: Restauração de Paridade Funcional (Account & Contact Profile) - 2026-04-14
**Status: Aprovado e Fechado (Commit `ee3957f`)**

- **Account Profile:** A nova página dedicada atingiu 100% de paridade operacional com o sistema legado. Inclui: Radar Relacional, Fila de Fogo Ativa, Score Rationale, Timeline 360, Portfólio & Whitespace, e Contexto Compacto de Origem/Canais.
- **Contact Profile:** Materializado com navegabilidade Empresa -> Contato religada e paridade de edição de narrativas e classificação.
- **Destaque:** Todos os CTAs da Fila de Fogo estão operacionais, injetando ações reais na fila de sessão com payloads táticos.
- **Build:** Status BUILD-STABLE atingido. Zeragem de erros de tipagem em `accountsData.ts` e inconsistências de JSX em `AccountProfile.tsx` e `ContactProfile.tsx`.

**Operacionalização do Lifecycle (Commits `f0afafd`, `20edc2e`, `ee3957f`)**
- **Resultado:** Canopi transformado de protótipo em motor de execução real com cockpit profundo.
- **Entidades:** Consolidação de Conta e Contato como hubs de ação.
- **Persistência:** Implementação de `localStorage` para `sessionActions` e `sessionLogs` no `AccountDetailContext`.
- **UX Operativa:** CTAs do Command Center (Executar Playbook, Registrar Log) agora materializam ações reais na fila global.

**Camada Analítica Operacional (Commit `098f21d` + Hotfix `9e15033`)**
- **Métricas de Conversão:** Implementação de cálculo dinâmico de taxa de conclusão (Conversion Rate) na `Actions.tsx`.
- **Restauração de Integridade:** Correção tática do bloco de métricas operacionais (Commit `9e15033`).
- **Inteligência de Aging:** Rastreamento de ações estagnadas (+48h) via campo `createdAt` injetado no schema.
- **Dashboard de Performance:** Painel de indicadores operacionais da fila global consolidado e funcional.
- **Build de Produção:** Validado com `npm run build` após hotfix (sucesso completo).

---
**Recorte 18 — Auditoria de Conformidade: Contacts.tsx**
- **Resultado:** Aprovado por Conformidade Prévia. O arquivo já opera sob Tailwind v4 native e zero estilos inline.
- **Alteração de Código:** Nenhuma (0 insertions, 0 deletions).
- **Build de Produção:** Validado com `npm run build` (Exit 0).

**Recorte 17 — Auditoria de Conformidade: Footer.tsx**
- **Resultado:** Concluído por Inexistência Técnica. O projeto não sustenta um componente de rodapé materializado no layout atual.
- **Alteração de Código:** Nenhuma (0 insertions, 0 deletions).
- **Build de Produção:** Validado com `npm run build` (Exit 0).

**Recorte 16 — Auditoria de Conformidade: Sidebar.tsx**
- **Resultado:** Aprovado por integridade biográfica (retificado de Navigation.tsx). O arquivo já opera 100% sob Tailwind v4 native e zero estilos inline.
- **Alteração de Código:** Nenhuma (0 insertions, 0 deletions).
- **Build de Produção:** Validado com `npm run build` (Exit 0).

**Recorte 15 — Auditoria de Conformidade: Topbar.tsx**
- **Resultado:** Aprovado por integridade biográfica. O arquivo já opera 100% sob Tailwind v4 native e zero estilos inline.
- **Alteração de Código:** Nenhuma (0 insertions, 0 deletions).
- **Build de Produção:** Validado com `npm run build` (Exit 0).

**Recorte 14 — Saneamento Técnico: AccountDetailView.tsx**
- **Saneamento Cirúrgico:** Migração de 100% das cores hexadecimais inline (`ScoreMiniBar`) para utilitários Tailwind v4 native.
- **Dinamismo Legítimo:** Preservação de apenas 2 ocorrências de `style={{` (largura dinâmica legítima de barras de KPI e pipeline).
- **Build de Produção:** Validado com `npm run build` (Exit 0).
- **Commit de Código:** `8485ce6` — refactor(account): saneamento técnico cirúrgico e migração para Tailwind v4 native (Recorte 14).

**Recorte 11 — Saneamento Técnico: Performance.tsx**
- **Saneamento Total:** Remoção de 100% das classes `perf-*` e transição para Tailwind v4 native.
- **Zeragem de Estilos:** Conversão de ~240 blocos de estilo inline para utilitários, garantindo visual premium (blur, gradientes).
- **Dinamismo Legítimo:** Consolidado em 31 ocorrências (barras de progresso e branding dinâmico).
- **Build de Produção:** Validado com `npm run build` (Exit 0). Commit: `7a3d2192424e07dfde19dd5be16a37c1513022f4`.

**Recorte 13 — Saneamento Técnico: PaidMedia.tsx**
- **Saneamento Total:** Remoção de 100% dos estilos inline estáticos (VTR, Retention, Bid Control) para Tailwind v4 native.
- **Dinamismo Legítimo:** Preservação de 1 única ocorrência (Eficiência de Segmento) baseada em dados de mock iterativos.
- **Estabilização Recharts:** Mitigação de warnings de hidratação via `ClientOnly` validada no build.
- **Build de Produção:** Validado com `npm run build` (Exit 0).
- **Commit de Código:** `7f58aa4` — refactor(paid): saneamento técnico integral e migração para Tailwind v4 native (Recorte 13).


**Recorte 12 — Saneamento Técnico: SeoInbound.tsx**
- **Saneamento Total:** Remoção de estilos inline estáticos (82% e 14.5%) e migração para Tailwind v4 native.
- **Estabilização de Build:** Integridade JSX restaurada via reparações cirúrgicas e validação de `npm run build` (Exit 0).
- **Dinamismo Legítimo:** Preservação de 1 única ocorrência justificável (LP Authority Score).
- **Commit de Código:** `7916b67` — refactor(seo): saneamento técnico integral e migração para Tailwind v4 native (Recorte 12).
**Recorte 2 — Infra de Imagens & Pipeline Next.js**
- Configuração de `next.config.mjs` com `remotePatterns` para `api.dicebear.com` e `images.unsplash.com`.
- Migração de `<img>` para `next/image` em `Topbar.tsx` e `SeoInbound.tsx`.
- Desativação de `unoptimized={true}` para habilitar o pipeline nativo do Next.js.

**Recorte 3 — Otimização de Reconciliação (DOM)**
- **Performance.tsx:** Refatoração integral com extração de blocos densos para sub-componentes memoizados.
- **Conformidade de Hooks:** Correção de chamadas condicionais de React Hooks em `AccountDetailView.tsx`.
- **Build de Produção:** Validado com `npm run build` (Exit 0) em todo o projeto.

**Recorte 9 — Saneamento Técnico: ABXOrchestration.tsx**
- **Saneamento de Estilos:** Remoção total de estilos inline estáticos e conversão para Tailwind v4.
- **Governança Visual:** Implementação de `colorMap` centralizado para estados de cards e heatmaps.
- **Dinamismo Legítimo:** Redução de `style={{` para apenas 2 ocorrências (larguras percentuais dinâmicas).
- **Build de Produção:** Validado com `npm run build` (Exit 0). Commit: `3f871da824cd9112e73fff13f4d1aac77776f023`.

**Recorte 10 — Saneamento Técnico: Outbound.tsx**
- **Saneamento Massivo:** Remoção de interpolações de classe inseguras (`bg-${`, `text-${`, `border-${`).
- **Arquitetura de Estilos:** Implementação de utilitário `cx` e centralização de mapeamentos em `colorMap`.
- **Dinamismo Legítimo:** Consolidado em 1 única ocorrência de `style={{` (largura dinâmica de mix de canais).
- **Build de Produção:** Validado com `npm run build` (Exit 0). Commit: `aea96de7d3e2c68d6eb9426aa648541bb6319eed`.

### Fase 7 — Deep Intelligence (Concluída - 2026-04-02)

### Infraestrutura técnica (PR #10 — 2026-03-31)
- Migração completa do cockpit para Next.js 15 App Router
- Shell layout em `src/app/(shell)/layout.tsx` com Sidebar + Topbar
- Rotas nativas criadas para todas as páginas da V1
- Remoção do bridge SPA (App.tsx, main.tsx, [slug]/page.tsx)
- Topbar e Sidebar desacopladas de estado via `usePathname()`
- Build passando sem erros de tipo

### Fortalecimento com dados reais (PR #11 — 2026-03-31 / 2026-04-01)

**Overview.tsx** — commit `b64d82e`
- Header derivado de `advancedSignals.length`
- Executive Highlight conectado ao sinal crítico de maior confiança
- Saúde Operacional derivada dos três níveis de severidade reais
- Prioridades Imediatas: top 3 sinais por `severityOrder + confidence`

**Performance.tsx** — commit `6395b58`
- Seção Contas: sinais ativos e ações em andamento expandidos inline por conta
- Rodapé: 5 campos visíveis (canal, valor, owner, relacionamento, último contato)

**Accounts.tsx** — commit `ab2722b`
- Card Grade/Board: microbadges de status, potencial, atividade, sinais e atrasos
- Lista: dot colorido por `atividadeRecente` da conta

**Signals.tsx** — commit `ab2722b`
- 5ª métrica hero: `archived.length`
- Filtros de severidade e categoria conectados ao estado existente

**Actions.tsx** — commit `ab2722b`
- Ponte localStorage: `adaptStoredAction()` + `useEffect` defensivo com deduplicação por ID
- Campo `origin` visível nas densidades compacta e super-compacta

### Fase 5 — Saneamento Progressivo ABM (2026-04-02)

**AbmStrategy.tsx** — commits `6d416a6` a `bd306c4`
- Remoção de ~1100 linhas de código morto e visualizações fictícias (Modais, journeyTimeline, benchmarks, entryPlays, verticalClusters).
- Saneamento de imports e estados órfãos.

### Fase 6 — Conexão e Refino ABM (2026-04-02)

**accountsData.ts** — commit `85ca5af` (Recorte 21)
- Estrutura de scoring e preenchimento de `contasMock`.

**AbmStrategy.tsx** — commit `c8565fd` (Recorte 22)
- Conexão funcional dos heatmaps ao `contasMock`.

**AbmStrategy.tsx** — commit `4dbbd95` (Recorte 23)
- Dinamização reativa dos Action Cards e Matrizes. Reparo de corrupção JSX.

**AbmStrategy.tsx + Actions.tsx** — commit `4dbbd95` (Recorte 24)
- **Saneamento Técnico Real:** Migração de estilos inline para Tailwind (~120 linhas removidas).
- **Acessibilidade:** Adição manual de `aria-label` e `title` em botões críticos identificados visualmente.
- **Auditoria de Tipagem:** Build de produção (`npm run build`) validado com sucesso (zero erros `tsc`).

**Auditoria de Infraestrutura e Qualidade** — commit `FIX_LINT_BUILD` (Recorte 24 - Finalização)
- **Infraestrutura de Linting Reativada:** Configuração de `.eslintrc.json` e `next/core-web-vitals` funcional.
- **Saneamento de Build Errors:** Correção em massa de `react/no-unescaped-entities` em 8 arquivos críticos (`PaidMedia`, `SeoInbound`, `Outbound`, `Settings`, etc).
- **Lint Limpo:** Execução de `npm run lint` com 0 erros bloqueadores.
- **Build de Produção:** Validado com `npm run build` (sucesso completo em todas as 16 rotas).

**Recorte 19 — Saneamento Técnico: Settings.tsx**
- **Saneamento Cirúrgico:** Substituição de interpolações frágeis de classes Tailwind por mapeamentos estáticos (`bgMap`, `textMap`).
- **Blindagem ARIA:** Implementação de `aria-label`, `aria-pressed` e `type="button"` nos toggles de controle da engine Nexus.
- **Build de Produção:** Validado com `npm run build` (sucesso completo).
- **Commit de Código:** `2cad13f` — refactor(settings): saneamento tecnico e blindagem de acessibilidade no control tower.

**Recorte — Inteligência Operacional: Actions.tsx**
- **Resultado:** Implementação da camada de detecção proativa de anomalias na fila operacional.
- **Inteligência Nexus:** Adição de gatilhos determinísticos para:
  - **Congestionamento:** Concentração de ações críticas em um único canal.
  - **Ghosting Crítico:** Ações de alta prioridade sem owner há +24h.
  - **Baixa Vazão:** Origens de sinal com acúmulo de itens e zero conclusões.
  - **Efeito Cascata:** Contas com múltiplos impeditivos (bloqueios/atrasos) simultâneos.
- **UI/UX:** Adição do painel "Insights Operacionais" (Detecção Ativa) abaixo do hero.
- **Build de Produção:** Validado com `npm run build` (sucesso completo).
- **Commit de Código:** `3fbf890` — feat(actions): adiciona deteccao operacional de anomalias na fila.

**Recorte — Inteligência de Performance: Performance.tsx**
- **Resultado:** Substituição de mocks estáticos por derivação analítica real baseada em `contasMock` e `advancedSignals`.
- **Inteligência Analítica:** Cálculo determinístico de:
  - **Eficiência Operacional:** Pipeline associado e taxa de conversão factual por canal.
  - **Vazão de Origem:** Identificação factual da origem com maior volume de sinais no período.
  - **Taxa de Conversão:** Baseada estritamente em sinais resolvidos (`s.resolved`).
- **Eliminação de Ruído:** Remoção integral de `Math.random()` e fallbacks manuais de pipeline.
- **Build de Produção:** Validado com `npm run build` (sucesso completo).
- **Commit de Código:** `1e7bf81` — feat(performance): adiciona leitura dinamica por canal e origem.

---

## Bloqueios e Pontas Soltas (Auditado)

*(Nenhum bloqueio operacional ou técnico ativo. A infraestrutura de linting está rodando `Exit 0`, alertas de Recharts sumiram com estabilização de SSG, e as IIFEs de `AbmStrategy.tsx` estão contidas como dívida técnica conhecida, sem obstruir manutenibilidade).*

---

## Último Recorte Concluído

**Fase 9 — Data Intelligence & Scale**

- **Recorte 16 — Assistant Orquestrador:** Concluído — 2026-04-07
  - ✅ Cards acionáveis para contas existentes, sinais e ações (existing_account, signal, action)
  - ✅ Criação de nova ação diretamente na fila via `handleCreateAction()` (tipo new_action)
  - ✅ Validação de cards contra entidades reais via `validateCards()` (slug, signalId, actionId)
  - ✅ Proteção contra duplicação de ações via `checkActionDuplicate()`
  - ✅ Parser `extractCards()` em route.ts via regex CANOPI_CARDS
  - ✅ Estabilização premium: grade 12 colunas, tipografia, design assimétrico de bolhas
  - ✅ Restore do backend agêntico: tipos ResponseCard + instrução Gemini + payload { text, cards }
  - ✅ Build Exit 0 (45.5 kB Assistant)
  - **Commits:** `fe9d5f9` (feat) + `a5b43d0` (estabilização)
  - **Status:** ✅ Publicado em origin/main

- **Recorte Reconciliação:** Concluído — 2026-04-06
  - ✅ Reconciliação de datasets publicada (links accountId/relatedAccountId)
  - ✅ 9 contas órfãs + 4 vazias classificadas para filtro downstream
  - ✅ Build Exit 0

- **Recorte Opção B — Overview.tsx Consolidada:** Concluído — 2026-04-06
  - ✅ Painel unificado (Performance + Actions Intelligence)
  - ✅ 6 KPIs dinâmicos (Pipeline, Conversão, Sinais, Ações, SLA, Origem)
  - ✅ 4 anomalias detectadas (Ghosting, Vazão, Congestionamento, Cascata)
  - ✅ Build Exit 0 (6.86 kB)
  - **Commit:** `05c36c8` + `7fdce40` (cleanup)

- **Recorte Opção 3 — Copiloto Operacional Real:** Concluído — 2026-04-06
  - ✅ Helper `operationalIntelligence.ts` consolidando 4 blocos de inteligência
  - ✅ Integração em Assistant.tsx (card Prioridades Imediatas, context enriquecido)
  - ✅ Enriquecimento em route.ts (5 blocos de inteligência injetados na system instruction)
  - ✅ Assistant agora responde melhor: 1) atenção, 2) risco, 3) melhoria, 4) play, 5) foco
  - ✅ Build Exit 0 (40.8 kB Assistant)
  - **Commits:** `6fff541` (feat) + `cfd30d1` (docs)
  - **Status:** ✅ Publicado em origin/main

- **Recorte 15 — Plays Recomendados:** Concluído — 2026-04-06
  - ✅ Função `deriveRecommendedPlays()` com 6 padrões automáticos
  - ✅ Bloco visual com cards responsivos, cores por urgência
  - ✅ Botões "Chat" (preenche input) + "Copiar" (clipboard)
  - ✅ Fecha loop: Inteligência → Recomendação → Ação
  - ✅ Build Exit 0 (42.4 kB Assistant)
  - **Commits:** `f9cf7a7` (feat) + `e884885` (docs)
  - **Status:** ✅ Publicado em origin/main

## Último Recorte Concluído — Fase E

**Recorte 22 — Supabase E2: Primeira Migração de Entidade (accounts)** — 2026-04-07
- ✅ Repositório defensivo `src/lib/accountsRepository.ts`
- ✅ `getAccounts()`: query Supabase + merge com contasMock + fallback seguro
- ✅ Shell explícito para contas sem mock correspondente
- ✅ Tipagem alinhada: AccountRow com union types corretos (risco: number, atividadeRecente: 'Alta'|'Média'|'Baixa', etc)
- ✅ `src/pages/Accounts.tsx`: consome getAccounts() em useEffect com try/catch
- ✅ Todos os useMemo, métricas e filtros alimentados por dados potencialmente do Supabase
- ✅ Cleanup de timeout corrigido (fora do async)
- ✅ Build Exit 0 (59.1 kB Accounts, +600 bytes com repositório)
- **Commit:** `15ce264` — feat(supabase): Recorte 22 — E2: Primeira Migração de Entidade (accounts)
- **Status:** ✅ Publicado em origin/main

**Recorte 23 — Supabase E3: Segunda Migração de Entidade (signals)** — 2026-04-07
- ✅ Repositório defensivo `src/lib/signalsRepository.ts`
- ✅ `getSignals()`: query Supabase campos de SignalRow (id, severity, type, category, archived, resolved, title, description, timestamp, account, accountId, owner, confidence, channel, source, context, probableCause, impact, recommendation)
- ✅ Merge defensivo com advancedSignals: nullish coalescing (??) para todos 19 campos críticos
- ✅ Shell seguro para sinais sem mock correspondente
- ✅ Tipagem SignalRow com 1 campo obrigatório (id) + 18 campos opcionais
- ✅ `src/pages/Signals.tsx`: consome getSignals() em useEffect com try/catch
- ✅ Fallback completo: não configurado → advancedSignals; erro → advancedSignals; sem dados → advancedSignals
- ✅ Logging observabilidade em 5 pontos (config, error, shell, success, exception)
- ✅ Build Exit 0 (validado)
- **Commit:** `1d7ab3d` — feat(signals): implementa Recorte 23 — Supabase E3 Segunda Migração de Entidade
- **Status:** ✅ Publicado em origin/main

**Recorte 27 — Supabase E7: Primeira Escrita Defensiva em Signals** — 2026-04-08
- ✅ Tipo `SignalItem` nomeado e explícito em signalsRepository.ts
- ✅ Função `persistSignal(signal: SignalItem)` com upsert por id e mapeamento explícito (SignalItem → SignalRow)
- ✅ Fire-and-forget pattern: best-effort, nunca bloqueia UX, falha silenciosa com logging
- ✅ Integração defensiva em `confirmAssign()`: snapshot → construção estado → update por id → persist remoto
- ✅ Integração defensiva em `archive()`: snapshot → construção estado → update por id → persist remoto
- ✅ Alinhamento garantido entre snapshot, estado local e persistência remota (sem divergência)
- ✅ `sessionState` (localStorage + signals) permanece source of truth absoluta
- ✅ Supabase persistência complementar sem impacto em falha
- ✅ Build Exit 0 (validado)
- **Commit:** `054254a0c96f07cb72f7433c069d2b08a40a8350` — feat(signals): add defensive best-effort Supabase persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 28.1 — Supabase E8: Primeira Escrita Defensiva em Contacts (Micro-recorte)** — 2026-04-08
- ✅ Owner assignment mínimo em contatos (caminho de escrita real)
- ✅ Tipo `ContactItem` com `owner?: string` (20 campos: 4 obrigatórios + 16 opcionais)
- ✅ Função `persistContact(contact: ContactItem)` com upsert por id, mapeamento explícito (ContactItem → ContactRow)
- ✅ UI mínima: input + botão "Atribuir" em ContactDetailProfile com feedback visual
- ✅ Local-first via AccountDetailView com `[localContatos, setLocalContatos]` e `onUpdateContact` callback
- ✅ Padrão: snapshot → build estado (ContatoConta) → `onUpdateContact()` local-first → `persistContact()` fire-and-forget
- ✅ Ressincronização automática de `ownerInput` ao alternar contatos via useEffect
- ✅ accountId correto vindo de `account.id` (não accountName)
- ✅ Fire-and-forget: persistência remota nunca bloqueia UX, falha silenciosa com logging
- ✅ Build Exit 0 (validado)
- **Commit:** `027191c` — feat(contacts): add local-first owner assignment with defensive persistence
- **Status:** ✅ Publicado em origin/main
- **Nota:** E8 foi destravado e concluído via micro-recorte 28.1 (owner assignment mínimo). Ponte real e operacional para future expansões.

**Recorte 29 — Supabase E8.2: Classificação Editável em Contacts** — 2026-04-08
- ✅ Extensão do Recorte 28.1: classificação multi-toggle em ContactDetailProfile
- ✅ Tipo `ContactItem` já suporta campo `classificacao` (sem alterações necessárias)
- ✅ Estado `[selectedClassifications, setSelectedClassifications]` com tipagem explícita de 7 tipos (Decisor, Influenciador, Champion, Sponsor, Blocker, Técnico, Negócio)
- ✅ Estado `[classificationStatus, setClassificationStatus]` para feedback "Classificação atualizada" (1.5s)
- ✅ Função `handleToggleClassification()` implementa padrão local-first idêntico ao owner assignment
  - 1. Snapshot contato-alvo
  - 2. Build array togglado + nova ContatoConta
  - 3. `setSelectedClassifications() + onUpdateContact()` local-first
  - 4. `persistContact({...updatedContact, accountId, accountName}).catch()` fire-and-forget
- ✅ UI: 7 botões toggle com cores semânticas (amber=Decisor, blue=Influenciador, emerald=Champion, purple=Sponsor, red=Blocker, slate=Técnico, indigo=Negócio)
- ✅ Visual: botão selecionado mostra ring effect + cores cheias; deseleccionado mostra opacity-60
- ✅ useEffect ressincroniza selectedClassifications ao alternar contatos
- ✅ Sem novo componente, sem novo hook, sem spread em ContactItem — apenas inline no ContactDetailProfile
- ✅ Build Exit 0 (validado)
- **Commit:** `2e46a47` — feat(contacts): add local-first classification toggles with defensive persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 30 — Supabase E10A: ABM Repository Layer (Read-Only)** — 2026-04-08
- ✅ Repository layer `src/lib/abmRepository.ts` implementado
- ✅ `getAbm()`: query Supabase campos de AbmRow (id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico)
- ✅ Fallback seguro: Supabase não configurado ou erro → retorna `[]` (complemento vazio)
- ✅ Merge explícito em AbmStrategy.tsx: `accounts = useMemo(contasMock + supabaseAbm por id)`
- ✅ Merge defensivo com nullish coalescing (`??`) para campos: icp, crm, vp, ct, ft, tipoEstrategico, abm
- ✅ Shell seguro: ignora contas remotas sem correspondente no mock (não cria shells novos)
- ✅ `activeAccountId` sincroniza com `accounts` via useEffect
- ✅ `accounts` como fonte derivada final em toda UI: heatmaps, TAL table, métricas, posição
- ✅ Sem escrita, sem ABX, sem novos campos (read-only)
- ✅ Build Exit 0 (validado)
- **Commit:** `4aa13f3` — feat(abm): add defensive read-only Supabase repository layer
- **Status:** ✅ Publicado em origin/main

**Recorte 31 — Supabase E10B: ABX Repository Layer (Read-Only)** — 2026-04-08
- ✅ Repository layer `src/lib/abxRepository.ts` implementado (novo arquivo)
- ✅ `getAbx()`: query Supabase campo `abx` (objeto aninhado com 9 campos opcionais)
- ✅ Fallback seguro: Supabase não configurado ou erro → retorna `[]` (complemento vazio)
- ✅ Merge explícito em AbmStrategy.tsx: `accounts = useMemo(contasMock + supabaseAbm + supabaseAbx por id)`
- ✅ Merge defensivo com nullish coalescing (`??`) para campo: abx
- ✅ Carga paralela ABM + ABX via `Promise.all([getAbm(), getAbx()])`
- ✅ Shell seguro: ignora contas remotas sem correspondente no mock
- ✅ ABX complementar ao E10A (pair E10A/E10B = ABM + ABX em harmonia)
- ✅ Sem escrita, read-only
- ✅ Build Exit 0 (validado)
- **Commit:** `04f634f` — feat(abx): add defensive read-only Supabase repository layer
- **Status:** ✅ Publicado em origin/main

**Recorte 32 — Supabase E11A: Escrita Defensiva em ABM (escopo mínimo)** — 2026-04-09
- ✅ Definição de primeiro write path defensivo e best-effort restrito ao campo `tipoEstrategico` em ABM.
- ✅ Implementação de `persistAbm()` em `src/lib/abmRepository.ts`.
- ✅ Persistência limitada com `.upsert({ id, tipoEstrategico }, { onConflict: 'id' })` explícito e fire-and-forget.
- ✅ Implementação de seletor local-first em `src/pages/AbmStrategy.tsx` na seção de "Configuração de Estratégia".
- ✅ 4 estados estratégicos configurados na UI (`ABM`, `ABX`, `Híbrida`, `Em andamento`).
- ✅ Build Exit 0 (validado).
- **Commit:** `b944813` — feat(abm): add local-first strategic type persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 33 — Supabase E11B: Expandir Escrita Defensiva em ABM — Play Ativo** — 2026-04-09
- ✅ Ciclo completo local-first de `playAtivo`: READ / MERGE / LOCAL-FIRST UPDATE / PERSIST WRITE
- ✅ Type `PlayAtivo` com 4 valores: `'ABM' | 'ABX' | 'Híbrido' | 'Nenhum'` exportado de `abmRepository.ts`
- ✅ **READ:** `getAbm()` expandido para trazer `.select(..., playAtivo)` do Supabase
- ✅ **MERGE:** `useMemo(accounts)` em `AbmStrategy.tsx` aplica `playAtivo: remote.playAtivo ?? merged[idx].playAtivo` com fallback local
- ✅ **LOCAL-FIRST UPDATE:** `handleUpdatePlayAtivo()` implementado com padrão idêntico a `handleUpdateTipoEstrategico()` (E11A)
- ✅ **PERSIST WRITE:** `persistAbm()` expandido para aceitar `playAtivo` junto com `tipoEstrategico`, enfileira `.upsert({ id, tipoEstrategico, playAtivo }, { onConflict: 'id' })`
- ✅ UI: 4 botões toggle (ABM, ABX, Híbrido, Nenhum) em seção "Play Ativo" com feedback visual de seleção
- ✅ Fire-and-forget defensivo mantido: falha remota nunca bloqueia UX, logging silencioso em fallback
- ✅ Build Exit 0 (validado, 2 files changed, 57 insertions, 7 deletions)
- **Commit:** `1c91d31` — feat(abm): expand defensive persistence to playAtivo
- **Status:** ✅ Publicado em origin/main

**Recorte 34 — Supabase E9: Escrita Defensiva em Accounts (campo inicial: tipoEstrategico)** — 2026-04-10
- ✅ Primeira escrita defensiva na entidade de accounts (complementar a E11A/E11B em ABM)
- ✅ Implementação de `persistAccount()` em `src/lib/accountsRepository.ts`
- ✅ Persistência defensiva best-effort: `.upsert({ id, tipoEstrategico }, { onConflict: 'id' })` explícito
- ✅ Payload mínimo `{ id, tipoEstrategico }` — únicos campos escritos, falha silenciosa/logging defensivo
- ✅ Implementação de `handleUpdateTipoEstrategico()` em `src/pages/Accounts.tsx` com padrão local-first + fire-and-forget
- ✅ UI mínima: 4 botões toggle (`ABM`, `ABX`, `Híbrida`, `Em andamento`) apenas na view `lista`, coluna "Tipo estratégico"
- ✅ Grade e board permanecem somente leitura neste recorte (abrem account detail sem edição)
- ✅ Build Exit 0 (validado, 2 files changed, 66 insertions, 3 deletions)
- **Commit:** `650a4c4` — feat(accounts): add defensive tipoEstrategico persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 35 — Supabase E9B: Escrita Defensiva em Accounts (playAtivo)** — 2026-04-10
- ✅ Expansão da escrita defensiva em accounts para campo `playAtivo`
- ✅ Extensão de `persistAccount()` em `src/lib/accountsRepository.ts` com tipo `AccountPersistPayload`
- ✅ Persistência defensiva dual-field: `.upsert({ id, tipoEstrategico, playAtivo }, { onConflict: 'id' })` explícito
- ✅ Payload explícito com guards defensivos: apenas campos definidos incluídos (previne sobrescrita mútua com undefined)
- ✅ Implementação de `handleUpdatePlayAtivo()` em `src/pages/Accounts.tsx` com padrão local-first + fire-and-forget
- ✅ Padrão robusto: snapshot dual-field ANTES de setState, persistência com AMBOS campos (tipoEstrategico + playAtivo)
- ✅ UI mínima: 4 botões toggle (`ABM`, `ABX`, `Híbrido`, `Nenhum`) apenas na view `lista`, coluna "Play ativo"
- ✅ Grade e board permanecem somente leitura (mantêm comportamento intacto)
- ✅ Type safety reforçado: `AccountPersistPayload` explícito, sem `any`, proteção contra sobrescrita
- ✅ Validação: Bug de persistência crítico corrigido (campos não sobrescrevem-se mutuamente)
- ✅ Build Exit 0 (validado, 2 files changed, 84 insertions, 9 deletions)
- **Commit:** `cdbc4f3` — feat(accounts): add defensive playAtivo persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 36 — Supabase E9C: Escrita Defensiva em Accounts (Campos Narrativos)** — 2026-04-10
- ✅ Expansão da escrita defensiva em accounts para campos narrativos `resumoExecutivo` + `proximaMelhorAcao`
- ✅ Extensão de `persistAccount()` em `src/lib/accountsRepository.ts` para 4 campos (tipo + play + resumo + ação)
- ✅ Persistência defensiva quadruplo-field: `.upsert({ id, tipoEstrategico, playAtivo, resumoExecutivo, proximaMelhorAcao }, { onConflict: 'id' })` explícito
- ✅ Implementação de handler ATÔMICO `handleUpdateNarrativas()` em `src/pages/Accounts.tsx`
- ✅ Padrão robusto: 1 snapshot + 1 setState + 1 persist = zero race condition entre múltiplos campos
- ✅ UI mínima: coluna "Próxima melhor ação" clicável com ícone ✎; modal compacto para edição dual
- ✅ Modal: 2 textareas (resumo + ação), salva atomicamente ambas narrativas juntas
- ✅ Grade e board permanecem somente leitura (mantêm comportamento intacto)
- ✅ Type safety consolidado: `AccountPersistPayload` com 4 campos, guards defensivos contra undefined
- ✅ Build Exit 0 (validado, 2 files changed, 137 insertions, 12 deletions)
- **Commit:** `a6604c2` — feat(accounts): add defensive narrative persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 37 — Supabase E7.1: Campos Narrativos Editáveis em Signals** — 2026-04-10
- ✅ Expansão da escrita defensiva em signals para campos narrativos `context` + `probableCause` + `recommendation`
- ✅ Replicação de padrão atômico de Recorte 36 (accounts): 1 snapshot + 1 setState + 1 persist
- ✅ Implementação de handler ATÔMICO `handleUpdateSignalNarrativas()` em `src/pages/Signals.tsx`
- ✅ **Novo padrão: Drawer synchronization** — detecta se sinal editado está aberto, sincroniza explicitamente com `setDrawer(updatedSignal)` após setState do array
- ✅ Modal de edição com 3 textareas (`context`, `probableCause`, `recommendation`), 3 linhas cada
- ✅ Trigger UI: edit button (✎) ao lado de "Causa/Impacto" no drawer
- ✅ Fire-and-forget: persistSignal() sem await, falhas logadas silenciosamente
- ✅ Type safety consolidado: 3 campos narrativos tipados, guards defensivos contra undefined
- ✅ Build Exit 0 (validado, 1 file changed, 132 insertions, 1 deletion)
- **Commit:** `16e673e` — feat(signals): add defensive narrative editing with modal
- **Status:** ✅ Publicado em origin/main

**Recorte 38 — Supabase E8.1: Campos Narrativos Editáveis em Contacts** — 2026-04-10
- ✅ Expansão de escrita defensiva em contacts para campos narrativos (`observacoes`, `historicoInteracoes`, `proximaAcao`).
- ✅ Replicação de padrão atômico: snapshot + persistência fire-and-forget.
- ✅ UI discreta: modal de edição via ícone ✎ na ficha do contato.
- ✅ Build validado.
- **Commit:** `8abd084` — feat(contacts): add defensive narrative persistence
- **Status:** ✅ Publicado em origin/main

**Recorte 39 — Supabase E6.1: Campos Narrativos Editáveis em Actions** — 2026-04-10
- ✅ Expansão de escrita defensiva em actions para 3 campos narrativos (`resolutionPath`, `executionNotes`, `learnings`).
- ✅ Replicação de padrão atômico: 1 snapshot + 1 setState + 1 persist.
- ✅ Implementação de handler ATÔMICO `handleUpdateNarrativas()` em `src/pages/Actions.tsx`.
- ✅ ModalTab expandido com "narrativa", ActionOverlay + 4ª aba discreta.
- ✅ Fire-and-forget: persistAction() sem await, falhas logadas silenciosamente.
- ✅ Type safety consolidado: 3 campos narrativos tipados via ActionItem.
- ✅ Build Exit 0 (validado).
- **Commit:** `a60f2f9` — feat(actions): add defensive narrative editing with atomicity
- **Status:** ✅ Publicado em origin/main

- **Recorte 40 — Supabase E12: Campos Narrativos Estratégicos em ABM** — 2026-04-10
  - ✅ Expansão de escrita defensiva em ABM para 3 campos narrativos estratégicos (`strategyNarrative`, `riskAssessment`, `successCriteria`).
  - ✅ Modelagem estendida: `Conta.abm` com 3 campos aninhados.
  - ✅ Repository estendido: `AbmRow.abm` contém 3 campos narrativos.
  - ✅ `persistAbm()` refatorada com tipagem explícita `AbmRow['abm']`.
  - ✅ Handler `handleUpdateAbmNarrativas()` em `src/pages/AbmStrategy.tsx`.
  - ✅ UI dupla (read/edit) em seção "Narrativa Estratégica" no card de Ranking ABM.
  - ✅ Fire-and-forget: persistAbm() sem await, falhas logadas silenciosamente.
  - ✅ Build Exit 0 (validado).
  - **Commit:** `88bceb3` — feat(abm): add defensive strategic narrative persistence
  - **Status:** ✅ Publicado em origin/main

- **Recorte 41 — Supabase E13: Campos Narrativos Estratégicos em ABX** — 2026-04-10
  - ✅ Expansão estratégica em ABX: narrativas `strategyNarrative` + `riskAssessment` + `successCriteria` dentro do objeto `abx`.
  - ✅ Simetria estratégica: ABX agora espelha as capacidades narrativas de ABM.
  - ✅ Implementação de `persistAbx()` em `src/lib/abxRepository.ts` com tipagem explícita.
  - ✅ Handler ATÔMICO `handleUpdateAbxNarratives()` em `src/pages/AbmStrategy.tsx`.
  - ✅ UI simétrica: Seção "Narrativa Expansionista" no card de Ranking ABM.
  - ✅ Padrão atômico consolidado em todas as 6 dimensões (Accounts, Signals, Actions, Contacts, ABM, ABX).
  - ✅ Build Exit 0 (validado, 1 file changed, 115 insertions, 1 deletion).
  - **Commit:** `616a8ca` — feat(abx): add defensive strategic narrative persistence
  - **Status:** ✅ Publicado em origin/main


---

## Próximo Passo

- **Marco Funcional:** Último commit publicado: `8762ae4` — Refinamento Accounts subetapas 1–4c concluído.
- **Status da Infra:** Fase E consolidada. Bloco C infra + seed publicados. Consumo UI do Bloco C publicado. AccountProfile/ContactProfile com paridade funcional aprovada e fechada. Refinamento de Accounts (8 subetapas) publicado.
- **Pendência funcional:** E21 — Population Real do Bloco C no Supabase remoto (não iniciado).
- **Pendência local (congelada):** 3 arquivos modificados em working tree (`accountsRepository.ts`, `Accounts.tsx`, `Overview.tsx`) aguardando revisão e decisão de commit.
- **Recorte 42:** Concluído como **especificação visual documental**. Nenhum código alterado. Implementação bloqueada pela régua de risco zero.
  - Especificação em: `docs/98-operacao/07-especificacoes-visuais.md`
  - Commit de referência (não publicado): `e374cca` (descartado via `git reset`)
- **Recorte 43:** Concluído como **mapa de cobertura de persistência documental**. Nenhum código alterado.
  - Documento: `docs/98-operacao/09-mapa-de-cobertura-persistencia.md`
- **Decisão de Orquestrador resolvida no Recorte 44:** ownership de `tipoEstrategico` e `playAtivo` centralizado em `accountsRepository`.
- **Recorte 44:** Concluído doc+funcional. Ownership de `tipoEstrategico` e `playAtivo` realinhado centralmente sob `accountsRepository`.
- **Recorte 45:** Concluído. Implementação de persistência de leitura (read layer defensivo) para Oportunidades via `oportunidadesRepository.ts`, orquestrado ativamente em `accountsRepository.ts`.
- **Recorte 46:** Concluído. Escrita defensiva atômica de Oportunidades (`etapa` e `risco`) com padrão 1 snapshot → 1 build → 1 setState → 1 persist. Botão "Salvar" explícito no overlay de edição em `AccountDetailView.tsx`.
- **Recorte 47:** Concluído. Implementação do ciclo completo de leitura, merge e escrita defensiva atômica para o objeto `inteligencia` da entidade Conta. Read path fechado em `AccountDetailView.tsx` via `getAccounts()` do repositório.
- **Recorte 48:** Concluído. Supabase E17: Leitura Estruturada da Conta. Implementação de leitura, merge defensivo e escrita atômica dos blocos `leituraFactual`, `leituraInferida` e `leituraSugerida`. Repository layer expandido em `accountsRepository.ts` com query defensiva e fallback para mock. UI local-first com editor modal mínimo em `AccountDetailView.tsx`. Atomicidade: 1 snapshot → 1 build → 1 setState → 1 persist. Publicação: commit `569c665`.
- **Recorte 57-59:** **Restauração de Paridade Funcional (Account/Contact Profile)**.
  - ✅ Materialização da página dedicada `AccountProfile.tsx` e `ContactProfile.tsx`.
  - ✅ Restauração do Radar Relacional, Fila de Fogo, Score Rationale e Timeline 360.
  - ✅ Implementação do Contexto Compacto (Origem/Influência) e Status de Contatos Normalizado.
  - ✅ Operacionalização de CTAs (Fila de Fogo → Ações Reais).
  - ✅ Build Exit 0.
  - **Commit:** `ee3957f` — final functional polish and parity approval.
- **Recorte 51:** Concluído. Supabase E20: Canais e Campanhas. Implementação completa de leitura, merge defensivo e escrita defensiva atômica para `canaisCampanhas`. Repository layer: `AccountRow` e `AccountPersistPayload` expandidos, `getAccounts()` query com merge defensivo em cascata. UI: estado local-first `localCanaisCampanhas`, editor modal com input para `origemPrincipal` e textarea para `influenciasJson`. Validação: `JSON.parse()` com try/catch como barreira canônica, validação de shape (canal, campanha, tipo, impacto, data). Publicação: commit `15b6371`.
- **Recorte 52:** Concluído (Documental). Fechamento Canônico da Fase E. Reconciliação factual dos documentos operacionais para eliminar inconsistências entre mapa, checkpoint e decisões. Correção: remoção de linha inconsistente sobre `tipoEstrategico`/`playAtivo` em ABX no resumo de cobertura. Clarificação terminológica: campos com cobertura Supabase especializada via repositories independentes vs. campos sem persistência.
- **Recorte 53:** Concluído. Scoring Derivado e Priorização de Contas. Implementação de `calculateAccountScore()` em `scoringRepository.ts` com 5 dimensões (potencial, risco, prontidão, cobertura, confiança). Derivação em leitura sem persistência. Helpers: `isContaCritica()`, `isAltaPrioridade()`. Publicação: commit `1825db0`.
- **Recorte 54:** Concluído. Triagem Operacional Baseada em Score. Grid 4-cards em Overview.tsx (Críticas, Altas Prioridades, Alto Potencial/Baixa Cobertura, Top Oportunidades) com categorização automática por score. Integração em Actions.tsx. Publicação: commit `fc1923f`.
- **Recorte 55:** Concluído. Próxima Melhor Ação Derivada por Score. Implementação de `deriveProximaMelhorAcao()` e `deriveMotivoDaRecomendacao()` em `scoringRepository.ts` com lógica determinística. Recomendação baseada em análise de score. Publicação: commit `b328523`.
- **Recorte 56:** Concluído. Geração de Ação Operacional a partir da Recomendação. Implementação de `deriveAcaoOperacional()` transformando score em ActionItem estruturado. Botões em AccountDetailView e Overview cards. Ação entra na fila operacional local via `createAction()` com `sourceType: 'score-derivada'`. Publicação: commit `81447b4`.

> [!IMPORTANT]
> **Governança Operacional: Ordem Canônica**
> Deve-se respeitar rigorosamente a sequência de fases e recortes definida nos documentos de roadmap e handoff. É expressamente proibido pular recortes, antecipar execuções futuras ou tratar recomendações técnicas como recortes já iniciados sem aprovação formal.



---


| Centro de Comando | Fase 1, 2, 3 Concluída | Perfil, Organograma e Contato vinculados globalmente |
| Assistant Contextual | 6º Recorte Concluído | KPIs e fila operacional derivados de dados reais e injetados via Assistant Context |
| Performance Real Data | 7º Recorte Concluído | ACCOUNTS e ALERTS derivados de contasMock e advancedSignals |
| Stakeholder Intelligence | 8º Recorte Concluído | Contacts transversal conectado via Deep Link ao Centro de Comando |
| ABM TAL Real Data | 9º Recorte Concluído | TAL de ABMStrategy derivada de contasMock e conectada ao Centro de Comando |
| ABX Action Routes | 10º Recorte Concluído | People Layer determinístico; CommercialMemory, ContactFila e ActionRoutes com ações reais |
| Central de Playbooks | 20º Recorte Concluído | Biblioteca retrátil e injeção rastreável na fila operacional de Actions |
| Base Numérica Scoring | 21º Recorte Concluído | Estrutura de Conta estendida; budgetBrl padronizado |
| Conexão de Heatmaps | 22º Recorte Concluído | Heatmaps em AbmStrategy conectados ao contasMock dinâmico |
| Action Cards Dinâmicos | 23º Recorte Concluído | Blocos laterais e matrizes reativos à activeAccount |
| Refinamento Técnico | 24º Recorte Concluído | Infra de Lint reativada; Lint Limpo; Build íntegro; react/no-unescaped-entities saneado globalmente |
| Deep Intelligence (Perfil) | 25º Recorte Concluído | Perfil da Empresa com leitura estruturada, ações, oportunidades e scores (AccountDetailView) |
| Inteligência Relacional | 26º Recorte Concluído | Radar de cruzamento sinais x stakeholders; micro-badges dinâmicos e filtro contextual |
| Inteligência Cumulativa | 27º Recorte Concluído | Seção de Insights Históricos, Padrões e Lições Aprendidas (inteligencia{}) |
| Fila de Fogo (Fire Queue) | 28º Recorte Concluído | Cruzamento dinâmico sinais x radar x histórico para priorização de lote |
| Lifecycle Operacional | Marco Concluído | Transições de status, histórico automático e persistência local (LocalStorage) |
| Analytics de Conversão | Marco Concluído | Medição de taxa de conclusão, aging e backlog crítico via sessionActions |
| Inteligência de Fila | Recorte Concluído (Fase 9) | Camada proativa de detecção de anomalias (Congestionamento, Ghosting, Vazão, Cascata) em Actions |
| Inteligência de Canais | Recorte Concluído (Fase 9) | Leitura comparativa e dinâmica de performance e pipeline por canal/origem em Performance |
| Consolidação de Overview | Recorte Concluído (Fase 9) | Opção B: Painel unificado com inteligência de Performance + Actions (KPIs, Insights, Anomalias) |
| Assistant Orquestrador | Recorte 16 Concluído | Cards acionáveis, handleCreateAction, extractCards() |
| Supabase E1: Preparação | Recorte 21 Concluído (Fase E) | SDK instalado, cliente defensivo, .env com convenção dev/staging/prod |
| Supabase E2-E5: Leitura | Recortes 22-25 Concluídos (Fase E) | Migração de leitura defensiva: Accounts, Signals, Contacts, Actions |
| Supabase E6-E9: Escrita 1 | Recortes 26-39 Concluídos (Fase E) | Escrita defensiva: Actions, Signals, Contacts, Accounts (Campos core/operacionais + narrativas) |
| Supabase E10-E11: ABM Core | Recortes 30-33 Concluídos (Fase E) | ABM Repository (Read/Write) + ABX Repository (Read) + playAtivo |
| Supabase E12: ABM Narrativa | Recorte 40 Concluído (Fase E) | Escrita defensiva de narrativas estratégicas em ABM com atomicidade |
| Supabase E13: ABX Narrativa | Recorte 41 Concluído (Fase E) | Escrita defensiva de narrativas estratégicas em ABX (estratégia, risco, sucesso) |
| Supabase E14: Oportunidades | Recorte 45 Concluído (Fase E) | Leitura defensiva read-only de Oportunidades orquestrada através de accountsRepository |
| Supabase E15: Escrita Oport. | Recorte 46 Concluído (Fase E) | Escrita defensiva atômica de `etapa` e `risco` em Oportunidades via save explícito |
| Supabase E16: Inteligência | Recorte 47 Concluído (Fase E) | Leitura + merge + escrita atômica de `inteligencia` em Conta via repositório |
| Supabase E17: Leitura Estruturada | Recorte 48 Concluído (Fase E) | Leitura + merge + escrita defensiva atômica de `leituraFactual`, `leituraInferida`, `leituraSugerida` |
| Supabase E18: Histórico Operacional | Recorte 49 Concluído (Fase E) | Leitura + merge + escrita defensiva do array `historico` estruturado em Conta com timeline integrada |
| Supabase E19: Tecnografia | Recorte 50 Concluído (Fase E) | Leitura + merge + escrita defensiva do array `tecnografia` (strings simples) com editor mínimo |
| Supabase E20: Canais e Campanhas | Recorte 51 Concluído (Fase E) | Leitura + merge + escrita defensiva de `canaisCampanhas` com JSON.parse barreira canônica e validação de shape |
| Consolidação Seed Bloco C | Concluído (2026-04-13) | População determinística de `campaigns`, `interactions` e `play_recommendations`. Artefato JSON versionado. |
| Supabase Bloco C Infra | Concluído (2026-04-13) | Migration SQL, Repositories defensivos (CAM/INT/PLAY) e script de importação idempotente materializados. |
| Bloco C Consumo UI | Concluído (2026-04-13/14) | Board (Kanban), filtros operacionais, recência, volume agregado em Accounts. Indicadores executivos em Overview. Timeline com eventos em AccountDetail. Commits: `9612b2b` a `27d4e68`. |
| AccountProfile & ContactProfile Parity | Concluído e Fechado (2026-04-14) | Materialização de páginas dedicadas com Radar Relacional, Fila de Fogo Ativa, Timeline 360, Score Rationale, Portfólio & Whitespace. CTAs operacionais via createAction(). Build Exit 0. Commit final: `ee3957f`. Freeze documental: `6cb5eaf`. |
| Refinamento Accounts — Subetapas 1–4c | Concluído (2026-04-14) | 8 commits de refinamento progressivo (visual direction, ergonomia, shortcut contextualization, list readability, play simplification, volume & hygiene controls). Commit final publicado: `8762ae4`. |
| Contenção de Sistema de Tema | Concluído (2026-04-17) | 3 iterações de dark mode bidirecional falharam; decisão de abandonar escuro e travar plataforma em modo claro permanentemente. ThemeContext neutralizado (sempre isDark: false). Todas as classes dark: removidas do codebase. Seletor de tema removido de /usuario UI. Commit: `6943485`. |
| Cockpit V2 Foundation Replacement | Concluído (2026-04-19) | Substituição da base legada pela nova fundação integrada ao shell real. Onion chart responsivo, painel contextual unificado e roteamento independente via Pages Router. |
| Contas V2 — Fase A + B.1 + C1 a C1.3 + C2.1 a C2.9 | Em fechamento CRM por CRM; HubSpot validado para a versão atual (2026-04-30) | Separação de responsabilidades, contrato local editável, modelo de conexão real scaffolded, teste real HubSpot, preview read-only, schema discovery, hard reset de sessão, microcopy de método retomado, schema validation local CSV, taxonomia de CSV como método local de entrada/carga, generalização multi-conector com blindagem de provider inválido/legado, teste real mínimo Salesforce e ajuste mínimo de navegação para acesso direto a Fontes e Conectores. Commits: `219afa2` → `2a65e6e`. HubSpot validado; Salesforce, RD Station CRM e Outro CRM seguem em fechamento individual. Sem OAuth/token durável/API real persistida/sync/writeback. |

---

## Próximo Passo

- **Contas V2 — Próximo recorte:** nenhum recorte aberto automaticamente. A frente segue em Fontes e Conectores até nova autorização explícita do Fábio.
- **Contas V2 — C2.9:** fechamento de linguagem, boundaries e taxonomia de Fontes e Conectores concluído localmente no commit `2a65e6e`. CSV passou a ser tratado como método local de entrada/carga; HubSpot foi validado como primeiro CRM completo da versão atual; Salesforce é o próximo CRM a ser fechado; RD Station CRM e Outro CRM seguem pendentes de fechamento individual; a frente continua em fechamento CRM por CRM; OAuth completo, persistência segura, sync, importação real, writeback, RD real, Outro CRM real, Supabase e B.2 seguem fora do escopo da versão atual.
- **Contas V2 — Fase B.2 pendente:** Integrar `canonicalMappingReviewed` à validação local (AccountValidation) e blockers. Não altera OAuth nem Supabase.
- **Cockpit V2:** Refinamento dos recortes analíticos e interativos sobre a nova fundação estabilizada.
- **Pendência técnica Cockpit:** Monitorar performance do SVG foreignObject em densidades extremas de sinal.
