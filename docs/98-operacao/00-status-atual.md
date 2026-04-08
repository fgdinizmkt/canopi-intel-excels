# Status atual do projeto

## Branch principal
 `main` — sincronizada em 2026-04-08 (Recorte 28.1 — Supabase E8: Primeira Escrita Defensiva em Contacts: 027191c, publicado em origin/main)

## Fase atual do plano
**Fase E — Supabase Migration & Scale** (Em execução - Último Recorte: Recorte 28.1 — Supabase E8: Primeira Escrita Defensiva em Contacts)

---

### Marco Operacional Local-First (Concluído - 2026-04-04)

**Operacionalização do Lifecycle (Commits `f0afafd` e `20edc2e`)**
- **Resultado:** Canopi transformado de protótipo em motor de execução real.
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

1.  **Infraestrutura de Qualidade (BLOQUEADO):** `npm run lint` não está operacional. Falta instalar `eslint` como devDependency para garantir auditoria automatizada Real-Time.
2.  **Alertas de Runtime (PENDENTE):** `Recharts` emitindo `width(-1)` durante o build em `estrategia-abm` e `acoes`. Requer ajuste de `ResponsiveContainer`.
3.  **IIFEs Gigantes (BLOQUEADO):** ~1000 linhas de JSX acoplado em `AbmStrategy.tsx` mantidas por complexidade técnica.

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

## Próximo Passo

- **Status Atual:** Recorte 28.1 — E8 concluído e publicado em origin/main
- **Novo Recorte:** Definir e aprovar o Recorte 29 (próxima escrita defensiva ou migração complementar)

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
| Copiloto Operacional Real | Recorte Concluído (Fase 9) | Opção 3: Helper consolidado + integração em Assistant.tsx + enriquecimento em route.ts (5 blocos de contexto) |
| Plays Recomendados | Recorte Concluído (Fase 9) | Recorte 15: deriveRecommendedPlays() + bloco visual com 6 padrões (Ghosting→Atribuição, Cascata→Destravamento, Congestionamento→Redistribuição, Vazão→Desbloqueio, Risco→Intervenção, Sinal Crítico→Ativação) |
| Assistant Orquestrador | Recorte 16 Concluído (Fase 9) | Cards acionáveis (existing_account/signal/action + new_action), validateCards(), handleCreateAction(), extractCards() |
| Supabase E1: Preparação | Recorte 21 Concluído (Fase E) | SDK instalado, cliente defensivo, .env com convenção dev/staging/prod |
| Supabase E2: First Migration | Recorte 22 Concluído (Fase E) | Repository layer accounts: getAccounts(), merge com mock, shell seguro, Accounts.tsx consumindo dados |
| Supabase E3: Second Migration | Recorte 23 Concluído (Fase E) | Repository layer signals: getSignals(), query campos de SignalRow, merge defensivo (nullish coalescing), Signals.tsx consumindo dados |
