# Status atual do projeto

## Branch principal
`main` — atualizada em 2026-04-02 (ABM Modal Fictício Removido — 12º Recorte Fase 5)

## Fase atual do plano
**Fase 5 — Refino e endurecimento** (em andamento)

---

## O que já foi concluído

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
- ABM Readiness: contas de `contasMock` com `prontidao > 70`
- Channel Health: `getChannelStatus()` deriva pior severidade por categoria de sinal

**Performance.tsx** — commit `6395b58`
- Seção Contas: sinais ativos e ações em andamento expandidos inline por conta
- Rodapé: 5 campos visíveis (canal, valor, owner, relacionamento, último contato)
- Cumpre critério de Fase 4: relação clara com entidades-base (sinais + ações visíveis por conta)

**Accounts.tsx** — commit `ab2722b`
- Card Grade/Board: microbadges de status, potencial, atividade, sinais e atrasos
- Lista: dot colorido por `atividadeRecente` da conta
- Coluna "Próxima melhor ação": `truncate` com `title` para leitura completa no hover

**Signals.tsx** — commit `ab2722b`
- 5ª métrica hero: `archived.length`
- Filtros de severidade e categoria conectados ao estado existente
- Linha de metadados `source + channel` no card da lista
- Bullets de diagnóstico Outbound conectados ao `midData.probableCause` e `midData.context`
- Imports limpos: `abmStepsList` e `abxChannelsList` removidos

**Actions.tsx** — commit `ab2722b`
- Ponte localStorage: `adaptStoredAction()` + `useEffect` defensivo com deduplicação por ID
- Campo `origin` visível nas densidades compacta e super-compacta
- Métrica SLA renomeada para "Em risco de SLA" (vencido + alerta)

### Fase 5 — Primeiro recorte de CrossIntelligence (2026-04-01)

**CrossIntelligence.tsx** — commit `c1a4c95`
- Injeção de sinais reais no fluxo operacional, incluindo Nexus e Minerva
- Persistência em `localStorage('canopi_actions')`
- Conexão dos CTAs finais para alimentar a fila global de ações

### Fase 5 — Segundo recorte de Restauração UI/Runtime (2026-04-01)

**Estabilização Global** — commit `0bd0822`
- Correção de falha de injeção de CSS (Tailwind v4) no App Router.
- Criação de `src/app/globals.css` com ordem correta de `@import`.
- Atualização do Root Layout (`src/app/layout.tsx`).
- Eliminação de erro de runtime (`_document.js`) via limpeza de cache (.next) e rebuild íntegro.

### Fase 5 — Terceiro recorte de Fortalecimento de Integrações (2026-04-01)

**Integrations.tsx** — commit `cdea929`
- Transformação da página em um Painel de Confiabilidade do Stack.
- Implementação de KPIs de saúde (Confiança, Fontes Críticas, Gaps).
- Categorização funcional (CRM, Ads, Dados, Destino).
- Metadados de impacto operacional por fonte de dados.
- CTAs funcionais baseados no status do conector.

### Fase 5 — Quarto recorte de Cockpit de Outbound (2026-04-01)

**Outbound.tsx** — commit `281613e`
- Cockpit tático orientado por sinais (Nexus/Minerva/Local).
- Fila de intervenção com classificação ABM / ABX / Growth / Híbrido.
- Drawer funcional de playbook com roteamento de alçada (SDR vs. Global Actions).
- Aba Contexto ICP completa com Personas e Benchmarks.
- Costura arquitetural e semântica de navegação finalizada.

### Fase 5 — Quinto recorte de Centro de Comando (2026-04-01)

**Centro de Comando (Completo — Fases 1, 2 e 3)** — commit `8135da4`
- Fase 1 (Perfil da Conta): `AccountDetailContext` + `AccountDetailManager` + `AccountDetailView` estrutural.
- Fase 2 (Organograma Visual): Implementação de árvore recursiva (`liderId`) e componente `OrganogramNode` (Power Grid).
- Fase 3 (Perfil do Contato): Camada de profundidade granular (`ContactDetailProfile`) com Manual Canopi AI, Matriz de Poder e Acesso, e Dimming Background.
- Saneamento Técnico: Correção de warnings de `width(-1)` em gráficos via wrapper `ClientOnly`, estabilização do Pages Router via `_app.tsx` e ajuste de `@import` no CSS.
- Costura Global Final: Injeção de pontos de contato em **Accounts**, **Outbound**, **Actions** e **Signals**.

### Limpeza de branches
- `feat/evolucao-produto` deletada do remote em 2026-04-01
- PR #11 fechada e merged (squash) em main

---

### Fase 5 — Sexto recorte: Assistant Contextual (2026-04-01)

**Assistant.tsx** + **route.ts** — commit `0dd95a0`
- `useAccountDetail` conectado: Assistant detecta conta aberta em tempo real
- `localStorage('canopi_actions')` lido defensivamente em `useEffect`
- 5 KPIs derivados de dados reais: ações na fila, sinais ativos, sinais críticos, contas prioritárias, confiança média
- Fila operacional: ações reais com fallback em sinais críticos quando fila vazia
- `handleSend` monta `contextBlock` compacto e envia `{ message, history, context }` à API
- `route.ts`: histórico mapeado para formato Gemini (`model`/`parts`), contexto injetado no `systemInstruction`

### Fase 5 — Sétimo recorte: Performance com dados reais (2026-04-01)

**Performance.tsx** — commit `165dc40`
- Constante `ACCOUNTS` hardcoded removida → substituída por `useMemo` derivado de `contasMock`
- Constante `ALERTS` hardcoded removida → substituída por `useMemo` derivado de `advancedSignals`
- Ordenação de contas: Crítico → Atenção → Saudável, desempate por `potencial` desc, top 4
- Mapeamento `impacto` → `sev`: `'Alto'→'crítico'`, `'Médio'→'alerta'`, `'Baixo'→'oportunidade'`
- Mapeamento `statusGeral` → cor e classe de badge para consistência visual
- Alerts: filtra `!archived && !resolved`, ordena por severidade, top 4, mapeia campos visuais completos
- CSS inline `perf-*` mantido intencionalmente — migração fora do escopo deste recorte
### Fase 5 — Oitavo recorte: Stakeholder Intelligence (2026-04-01)

**Contacts.tsx** — commit `d8a184b`
- Transformação da página em Radar Transversal de Influence & Coverage.
- Implementação do `StakeholderPulse` (KPIs) e `StakeholderRadar` (Cards).
- Expansão do `AccountDetailContext` para suportar `selectedContactId` global.
- Implementação de Deep Link: clique no radar abre o Centro de Comando focado no perfil do contato (Fase 3).
- Heurísticas reais: Identificação de Sponsors em risco e metas de cobertura por conta.
- Eliminação de CRUD estático em favor de inteligência operacional dinâmica.

### Fase 5 — Nono recorte: ABM TAL Real Data (2026-04-01)

**AbmStrategy.tsx** — commit `1fda339`
- Array `abmAccounts` hardcoded (12 empresas fictícias) removido do escopo de módulo
- `abmAccounts` agora derivado de `contasMock` via `useMemo`: `nome→name`, iniciais derivadas, `vertical→vertical`, `prontidao/10→fitScore`, `prontidao→engagement`, `statusGeral→status` (Crítico→HOT / Atenção→PLAYBOOK / Saudável→MAPEANDO), `prontidao>70→mqa`
- Clique na TAL Table: `openDetailedModal('ACCOUNT', acc)` substituído por `openAccount(acc.id)` — agora abre o Centro de Comando com o perfil real da conta
- `useAccountDetail` e `contasMock` adicionados aos imports
- IIFE, heatmaps, scatter, persona matrix, `openDetailedModal`, benchmarks, clusters, `journeyTimeline`, `entryPlays` mantidos intencionalmente fora do escopo

### Fase 5 — Décimo recorte: ABX Action Routes + Dead Code (2026-04-01)

**ABXOrchestration.tsx** — commit `a52dd2e` + fechamento `7354f33`
- Auditoria técnica completa: 1307 linhas, fonte exclusiva `compiladoClientesData` (abxData), sem `AccountDetailContext`
- `ActionRoutesLayer` conectado ao `handleAccountSelect` (commit `a52dd2e`)
- Dead code removido do module scope: `pipelineByVertical`, `channelInfluence`, `committeeRoles`, `funnelEvolution` (commit `a52dd2e`)
- **Fechamento definitivo da frente ABX** (commit `7354f33`):
  - `generatePeopleData`: 4 chamadas `Math.random()` substituídas por fórmulas determinísticas (`((i * 17 + 23) % 91) + 9` etc.) — People Layer estável entre reloads
  - `CommercialMemoryLayer`: prop `onSelect` adicionada; botão "Explorar Ficha 360°" conectado ao modal 360° real
  - `ContactOperationalFilaLayer`: prop `onSelect` adicionada; botão "Ação" localiza conta via `processedAccounts.find(a => a.id === p.accountId)` e abre modal 360°
  - `ContactActionsLayer`: 4 botões "Acionar Play" fictícios removidos; cards mantidos como bloco narrativo
- **Decisão arquitetural definitiva:** ABX mantém profundidade própria via `compiladoClientesData`; não integrar `processedAccounts` com `contasMock` (IDs incompatíveis; modal interno já é mais rico para contexto ABX)

### Fase 5 — Décimo segundo recorte: ABM Modal Fictício (2026-04-02)

**AbmStrategy.tsx** — commit `6d416a6`
- `openDetailedModal` removida: switch de 20 cases, ~1074 linhas de JSX fictício eliminadas
- Estados `modalOpen` e `modalData` removidos
- Import `Modal` removido
- ~40 handlers `onClick={() => openDetailedModal(...)}` removidos de todos os pontos de chamada
- `cursor-pointer` removido de 3 tech-fit cards sem ação real
- `<Modal />` removida do JSX final do componente
- `openAccount(acc.id)` na TAL Table preservado — único ponto de interação real
- Toda estrutura visual, IIFEs, datasets, sliders e visualizações preservados intactos

---

## O que está em andamento

Nenhuma implementação funcional em andamento.

---

## Próximo passo aprovado

- Iniciar o 13º Recorte da Fase 5 (frente a definir).
- Candidatos priorizados:
  1. `AbmStrategy.tsx` — IIFEs, datasets hardcoded e benchmarks ainda intactos (saneamento continuado)
  2. Central de Playbooks — orquestração cross-channel corporativa
- Manter foco em refino funcional e preservação da estética premium (Regra 6).

---

| Centro de Comando | Fase 1 Concluída | Perfil da Conta integrado e costurado globalmente |
| Centro de Comando | Fase 2 Concluída | Organograma Visual recursivo funcional |
| Centro de Comando | Fase 3 Concluída | Perfil Granular do Contato com inteligência Canopi |
| Assistant Contextual | 6º Recorte Concluído | KPIs reais, fila operacional, contexto injetado no Gemini |
| Performance Real Data | 7º Recorte Concluído | ACCOUNTS e ALERTS derivados de contasMock e advancedSignals |
| Stakeholder Intelligence | 8º Recorte Concluído | Contacts transversal conectado via Deep Link ao Centro de Comando |
| ABM TAL Real Data | 9º Recorte Concluído | TAL de ABMStrategy derivada de contasMock e conectada ao Centro de Comando |
| ABX Action Routes | 10º Recorte Concluído (fechado) | People Layer determinístico; CommercialMemory, ContactFila e ActionRoutes com ações reais; decisão arquitetural ABX finalizada |
| ABM Modal Fictício | 12º Recorte Concluído | openDetailedModal (20 cases, ~1074 linhas) removida; interatividade artificial eliminada |
| Control Tower V1 | 11º Recorte Concluído | Settings.tsx transformado em cockpit de governança e inteligência |
| Roadmap | Sincronismo | Memória operacional e remoto atualizados |
| Roadmap | Próximo Passo | Recorte 12 — Frente a definir |
