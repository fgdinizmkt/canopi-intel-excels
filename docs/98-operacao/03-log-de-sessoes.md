# Log de sessões

## Objetivo
Registro cronológico do trabalho executado por sessão. Não substitui o git log — registra decisões, contexto e raciocínio que não ficam nos commits.

---

## 2026-03-23 — Estado inicial

**Commit base:** `b072ff2` — "Estado estável inicial da aplicação com ABM e ABX funcionando"

- Aplicação React/Vite com roteamento SPA via `App.tsx`
- Páginas principais existentes: Overview, Accounts, Actions, Signals, Performance, ABM, ABX, CrossIntelligence, Outbound, SeoInbound, PaidMedia
- CrossIntelligence já evoluída em PRs #1–#6 (foco em operacionalidade)
- Dados mock em `src/data/mockData.ts` (sintéticos)
- Base documental criada em branch `refactor/organizacao-inicial` (não portada para main)

---

## 2026-03-30 a 2026-03-31 — Migração estrutural para App Router (PR #10)

**Branch:** refactor/organizacao-inicial → main via PR #10
**Commit:** `b4981a8`

**O que foi feito:**
- Limpeza de backups e arquivos duplicados na raiz
- Correção de imports `framer-motion → motion/react` em 4 arquivos
- Criação do shell layout `(shell)/layout.tsx` com Sidebar + Topbar + footer + modal Nova Campanha
- Criação de rotas nativas para todas as 15 páginas da V1 em `(shell)/<rota>/page.tsx`
- Rota ABM com sub-navegação via `useSearchParams` e Suspense boundary
- Topbar: derivação autônoma de título, breadcrumbs e tabs via `usePathname()`
- Sidebar: highlight ativo via `usePathname()`
- Remoção do SPA bridge: `App.tsx`, `main.tsx`, `app/[slug]/page.tsx`, `app/page.tsx`
- `(shell)/page.tsx` redireciona `/` para `/visao-geral`
- Remoção de props órfãos de Topbar e Sidebar
- Adição de `AGENTS.md` com regras do projeto

**Resultado:** build Next.js passando sem erros. Toda navegação via URL nativa.

---

## 2026-03-31 — Fortalecimento de Overview com dados reais (PR #11 — parcial)

**Branch:** feat/evolucao-produto
**Commit squash:** `b64d82e`

**Decisão de contexto:** iniciar rodada de diagnóstico + fortalecimento das páginas principais com dados reais já disponíveis em `signalsV6.ts` e `accountsData.ts`. Abordagem: leitura diagnóstica → proposta → aprovação → implementação → commit → push.

**O que foi feito em Overview.tsx:**
- Header count: `advancedSignals.length`
- Executive Highlight: sinal crítico de maior confiança (SIG-4068, Nexus Fintech, 97%)
- Saúde Operacional: um sinal por nível de severidade com `title` e `impact`
- Prioridades Imediatas: top 3 sinais ordenados por `severityOrder` + `confidence`
- ABM Readiness: contas de `contasMock` com `prontidao > 70 && playAtivo !== 'Nenhum'`
- Channel Health: `getChannelStatus(category)` deriva pior severidade por categoria de canal
- Labels de canais em português: Tráfego Pago / SEO + Orgânico / Outbound / Inbound

---

## 2026-04-01 — Fortalecimento de Accounts, Signals e Actions

**Branch:** feat/evolucao-produto
**Commits:** `30cd303`, `45d3a76`, `3af12cd` → squash em main como `ab2722b`

**Accounts.tsx:**
- Grade/Board: microbadges de potencial, atividade recente, contagem de sinais, ações atrasadas
- Lista: dot colorido por `atividadeRecente`
- Coluna "Próxima melhor ação": `max-w-[200px] truncate` + `title` para leitura completa

**Signals.tsx:**
- Imports limpos: `abmStepsList` e `abxChannelsList` removidos
- 5ª métrica hero: `archived.length` (completava o grid `repeat(5,1fr)` que estava vazio)
- Filtros de severidade e categoria com `<select className="filter-select">`
- Linha de metadados `channel · source` no card da lista
- Bullets do painel Outbound conectados a `midData.probableCause` + `midData.context`

**Actions.tsx:**
- `adaptStoredAction()`: mapeia schema simplificado do localStorage para `ActionItem` completo
- `useEffect` defensivo: lê `canopi_actions` no mount + listener de `storage`, deduplicação por `Set` de IDs
- Campo `origin` visível nas densidades compacta e super-compacta
- Métrica SLA: `delayed = items.filter(i => i.slaStatus === "vencido" || i.slaStatus === "alerta").length`

---

## 2026-04-01 — Fechamento da PR #11 e limpeza

**Situação encontrada:** PR #11 foi mergeada com squash no GitHub contendo apenas Overview (estado da branch no momento do merge automático). Os demais commits (Accounts, Signals, Actions) estavam no remote mas não no squash.

**Resolução:**
- `git merge --squash origin/feat/evolucao-produto` from main
- Commit `ab2722b` com as 3 páginas restantes
- Push direto para `origin/main`
- Delete da branch remota `feat/evolucao-produto`
- Verificação: PR #11 já estava `closed + merged` no GitHub

**Estado final de main:**
```
ab2722b feat: fortalece accounts, signals e actions com dados reais
b64d82e feat: fortalece overview com sinais e contas reais (#11)
b4981a8 feat: consolida migração do cockpit para App Router (#10)
b072ff2 Estado estável inicial da aplicação com ABM e ABX funcionando
```

---

## 2026-04-01 — Diagnóstico de Performance.tsx (sessão atual)

**Contexto:** Fase 4 exige "consolidar Visão Geral e Desempenho". Visão Geral concluída. Desempenho pendente.

**Comparação realizada entre:**
- `main:src/pages/Performance.tsx` (914 linhas) — versão com CSS inline `perf-*`, side panels, modais, toasts
- `refactor/organizacao-inicial:src/pages/Performance.tsx` (1106 linhas) — versão Tailwind, TypeScript tipado, accordion, contas inline

**Achados principais:**
1. Refactor tem modelo de dados mais rico: `fronts[]` com `confidence`, `context`, `mix[]`, `nurture[]`, `trend[]`
2. Refactor migrou CSS para Tailwind (consistente com restante da plataforma)
3. Refactor usa accordion expand in-place nas Frentes (sem painel lateral)
4. Refactor expande sinais + ações por conta inline (melhor leitura operacional)
5. Refactor tem 6 blocos de dados declarados mas nunca renderizados (`toolDiagnostics`, `journeySteps`, `consequenceRows`, `heroMetrics`, `summaryCards`, `macroSeries`)
6. Refactor perdeu: side panel, owner fullscreen, integration fullscreen, export modal, toast

**Decisão de abordagem:** não fazer overwrite completo. Definir recorte cirúrgico mínimo.

**Proposta de execução:** ver `docs/98-operacao/00-status-atual.md` e Bloco 2 da conversa desta sessão.

**Status:** aprovado e executado. Ver entrada abaixo.

---

## 2026-04-01 — Recorte de Desempenho executado + memória operacional criada

**Fase:** Fase 4 — Construção da V1

**O que foi feito:**

Performance.tsx — seção Contas:
- Substituído grid 2 colunas com cards clicáveis (abriam side panel) por lista vertical com cards inline
- Sinais ativos agora exibem: dot colorido por severidade + ID + título completo + badge de severidade
- Ações em andamento agora exibem: título + owner + badge de status
- Rodapé expandido de 3 para 5 campos: Canal, Valor, Owner, Relacionamento, Último contato
- Botão "Ver análise" removido (não havia destino útil sem painel); adicionados "Ver no Canopi" + contador de sinais/ações
- `openAccPanel` preservada no componente (ainda usada pelas Frentes)
- CSS `perf-*` preservado — nenhuma dependência nova introduzida

docs/98-operacao/:
- Criados 5 arquivos: 00-status-atual, 01-roadmap-fases, 02-decisoes-arquiteturais, 03-log-de-sessoes, 04-regras-do-processo
- 04-regras-do-processo.md: regras operacionais explícitas com tabela de eventos → arquivos a atualizar

AGENTS.md:
- Seção "Memória operacional — regra obrigatória" adicionada com tabela e instruções

**Commits:**
- `6395b58` — feat: fortalece desempenho com contas inline e memória operacional

**PRs:** nenhuma (commit direto em main)

**Impacto no projeto:**
- Desempenho agora conecta visualmente sinais e ações por conta — cumpre critério de "relação clara com entidades-base" da Fase 4
- Memória operacional estabelecida como parte do processo padrão
- Fase 4 pode ser considerada encerrada no núcleo mínimo (Visão Geral + Desempenho concluídos)
