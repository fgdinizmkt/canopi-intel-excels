# Status atual do projeto

## Branch principal
`main` — atualizada em 2026-04-03 (Fase 8 - Recorte 10)

## Fase atual do plano
**Fase 8 — Operational Efficiency** (Em Andamento - Saneamento Técnico)

---

## O que já foi concluído

### Saneamento de Performance (Fase 8 — 2026-04-03)

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

---

## Bloqueios e Pontas Soltas (Auditado)

1.  **Infraestrutura de Qualidade (BLOQUEADO):** `npm run lint` não está operacional. Falta instalar `eslint` como devDependency para garantir auditoria automatizada Real-Time.
2.  **Alertas de Runtime (PENDENTE):** `Recharts` emitindo `width(-1)` durante o build em `estrategia-abm` e `acoes`. Requer ajuste de `ResponsiveContainer`.
3.  **IIFEs Gigantes (BLOQUEADO):** ~1000 linhas de JSX acoplado em `AbmStrategy.tsx` mantidas por complexidade técnica.
4.  **Estilos Inline (BACKLOG):** `Performance.tsx` ainda utiliza estilos inline `perf-*` por decisão de preservação visual.

---

## Próximo passo aprovado

- **Fase 8 — Operational Efficiency:** Realizar auditoria objetiva nos arquivos `PaidMedia.tsx`, `SeoInbound.tsx`, `AccountDetailView.tsx` e `Topbar.tsx` para definição e abertura do Recorte 11.

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
