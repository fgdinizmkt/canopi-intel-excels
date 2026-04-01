# Status atual do projeto

## Branch principal
`main` — atualizada em 2026-04-01

## Fase atual do plano
**Fase 4 — Construção da V1** (em andamento)

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

**Accounts.tsx** — commit `ab2722b`
- Card Grade/Board: microbadges de status, potencial, atividade, sinais e atrasos
- Lista: dot colorido por `atividadeRecente` da conta
- Coluna "Próxima melhor ação": `truncate` com `title` para leitura completa no hover

**Signals.tsx** — commit `ab2722b`
- 5ª métrica hero: `archived.length` (preenche o grid `repeat(5,1fr)` que já existia)
- Filtros de severidade e categoria conectados ao estado existente
- Linha de metadados `source + channel` no card da lista
- Bullets de diagnóstico Outbound conectados ao `midData.probableCause` e `midData.context`
- Imports limpos: `abmStepsList` e `abxChannelsList` removidos

**Actions.tsx** — commit `ab2722b`
- Ponte localStorage: `adaptStoredAction()` + `useEffect` defensivo com deduplicação por ID
- Campo `origin` visível nas densidades compacta e super-compacta
- Métrica SLA renomeada para "Em risco de SLA" (vencido + alerta)

### Limpeza de branches
- `feat/evolucao-produto` deletada do remote em 2026-04-01
- PR #11 fechada e merged (squash) em main

---

## O que está em andamento

### Desempenho (Performance.tsx) — pendente de execução
- Diagnóstico comparativo já feito entre a versão `main` e a versão `refactor/organizacao-inicial`
- Proposta de recorte seguro documentada em `docs/98-operacao/` (este repositório)
- Aguardando aprovação para execução

---

## Próximo passo aprovado

Não iniciado ainda. Proposta em `docs/98-operacao/00-status-atual.md` (seção "Desempenho").

Recorte proposto para Performance.tsx:
1. Migrar seção Contas para layout inline (sinais + ações visíveis sem clique extra)
2. Enriquecer Squads com dados `comp / active / time`

Ver detalhes completos em `docs/98-operacao/` e na conversa de diagnóstico.

---

## Riscos e pendências

| Item | Tipo | Detalhe |
|---|---|---|
| `refactor/organizacao-inicial` ainda existe localmente | Branch local | Tem docs e versões mais evoluídas de alguns arquivos que não foram portados para main |
| `docs/` não está em main | Pendência | A pasta de documentação do produto existe apenas em `refactor/organizacao-inicial` |
| Desempenho sem dados reais | Pendência de produto | `Performance.tsx` usa mock hardcoded desconectado de `signalsV6.ts` / `accountsData.ts` |
| Contatos | Pendência Fase 4 | Página existe (`Contacts.tsx`) mas não foi fortalecida nesta rodada |
| Canais + Sustentação | Pendência Fase 4 ampla | Outbound, SeoInbound, PaidMedia, Integrations, Settings, Assistant — em estado inicial |
