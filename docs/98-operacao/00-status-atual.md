# Status atual do projeto

## Branch principal
`main` — atualizada em 2026-04-02 (Refinamento Técnico e Acessibilidade — 24º Recorte Fase 6)

## Fase atual do plano
**Fase 6 — Dinamização e Refino ABM** (Em finalização)

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

### Fase 6 — Conexão e Refino ABM (2026-04-02)

**AbmStrategy.tsx** — commit `c8565fd` (Recorte 22)
- Conexão funcional dos heatmaps ao `contasMock`.
- Expansão da base para 7 contas reais.
- Normalização financeira para escala SVG.

**AbmStrategy.tsx** — commit `4dbbd95` (Recorte 23)
- Dinamização reativa dos Action Cards e Matrizes via `activeAccount`.
- Reparo de corrupção JSX em `matrixCardsMap`.

**AbmStrategy.tsx + Actions.tsx** — commit `4dbbd95` (Recorte 24)
- **Saneamento Técnico:** Migração de estilos inline para Tailwind (~120 linhas removidas).
- **Acessibilidade:** Adição de `aria-label`, `title`, e `role="img"` em todos os controles interativos.
- **Linting & Tipagem:** Resolução de erro tsc no componente `Button` e avisos de acessibilidade.
- **Integridade:** Build de produção validado (Exit code: 0).

---

## O que está em andamento

Nenhuma implementação funcional em andamento.

---

## Próximo passo aprovado

- **Recorte 24 Concluído:** Refinamento técnico e acessibilidade finalizados.
- **Recorte 25:** Consolidação de Feedback e Entrega Final da Fase 6.

---

| Centro de Comando | Fase 1 Concluída | Perfil da Conta integrado e costurado globalmente |
| Centro de Comando | Fase 2 Concluída | Organograma Visual recursivo funcional |
| Centro de Comando | Fase 3 Concluída | Perfil Granular do Contato com inteligência Canopi |
| Assistant Contextual | 6º Recorte Concluído | KPIs reais, fila operacional, contexto injetado no Gemini |
| Performance Real Data | 7º Recorte Concluído | ACCOUNTS e ALERTS derivados de contasMock e advancedSignals |
| Stakeholder Intelligence | 8º Recorte Concluído | Contacts transversal conectado via Deep Link ao Centro de Comando |
| ABM TAL Real Data | 9º Recorte Concluído | TAL de ABMStrategy derivada de contasMock e conectada ao Centro de Comando |
| ABX Action Routes | 10º Recorte Concluído | People Layer determinístico; CommercialMemory, ContactFila e ActionRoutes com ações reais; decisão arquitetural ABX finalizada |
| ABM Modal Fictício | 12º Recorte Concluído | openDetailedModal (20 cases, ~1074 linhas) removida; interatividade artificial eliminada |
| Central de Playbooks | 20º Recorte Concluído | Biblioteca retrátil e injeção rastreável na fila operacional de Actions |
| Base Numérica Scoring | 21º Recorte Concluído | Estrutura de Conta estendida; budgetBrl padronizado (Preparação Estrutural Fase 6) |
| Conexão de Heatmaps | 22º Recorte Concluído | Heatmaps em AbmStrategy conectados ao contasMock dinâmico |
| Action Cards Dinâmicos | 23º Recorte Concluído | Blocos laterais e matrizes reativos à activeAccount e budgetBrl |
| Refinamento Técnico | 24º Recorte Concluído | Acessibilidade, Tailwind e fix de tipagem em AbmStrategy e Actions |
