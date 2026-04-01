# Status atual do projeto

## Branch principal
`main` — atualizada em 2026-04-01

## Fase atual do plano
**Fase 5 — Início da camada de inteligência cruzada** (em andamento)

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

### Limpeza de branches
- `feat/evolucao-produto` deletada do remote em 2026-04-01
- PR #11 fechada e merged (squash) em main

---

## O que está em andamento

Fechamento documental do primeiro recorte da Fase 5.

---

## Próximo passo aprovado

- Definir o 4º recorte da Fase 5 conforme prioridades do roadmap (ex: Outbound ou Assistant).
- Manter o foco em refino de funcionalidade e dados reais.
- Continuar o monitoramento de integridade do App Router.

---

## Riscos e pendências

| Item | Tipo | Detalhe |
|---|---|---|
| `main` local à frente de `origin/main` | Git | Há 1 commit local ainda não publicado |
| `03-log-de-sessoes.md` ainda não registra o recorte de CrossIntelligence | Documentação | Precisa ser atualizado antes de fechar o processo |
| Contatos | Pendência de produto | Página existe (`Contacts.tsx`) mas não foi fortalecida nesta rodada |
| Canais + Sustentação | Pendência ampla | Outbound, SeoInbound, PaidMedia, Integrations, Settings, Assistant — em estado inicial |
