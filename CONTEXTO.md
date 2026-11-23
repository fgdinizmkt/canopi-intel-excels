# CONTEXTO OPERACIONAL — Canopi
> Leia este arquivo no início de TODA sessão. É a memória viva do projeto para IA.
> Última atualização: 23/11/2026 — 2ª revisão (início da renomeação para Knopi)

---

## RENOMEAÇÃO CANOPI → KNOPI (desde 23/11/2026)

O produto passa a se chamar **Knopi**, com troca em tudo, inclusive contratos externos. Identidade visual única e definitiva: **Knopi · Manual de Marca v1.1**. Plano, etapas e status em `docs/98-operacao/67-renomeacao-knopi.md`. Etapa 1 (marca visível em `src/`) feita em 23/11.

---

## QUEM OPERA

**Fábio** — construtor solo da Canopi.
- Usa Claude Code como executor principal de código (Sonnet para arquitetura, Haiku para mecânico)
- ChatGPT: orquestração e revisão crítica de escopo
- Gemini/Antigravity: UX/UI visual, validação no browser
- Codex: auditoria técnica, diff/build/Git
- GooseWorks, OpenSquad, Agency Agents: subagentes/perfis dentro desses ambientes
- Não quer validação fácil. Quer análise crítica, que discorde quando necessário.

---

## O PRODUTO

**Canopi** — SaaS B2B de inteligência de receita e Account Intelligence para times de Revenue/GTM.
- Repo: `fgdinizmkt/canopi-intel-excels`
- App local: `127.0.0.1:3053` via `npm run dev:clean`
- Stack: Next.js 14 + Supabase + TypeScript + Tailwind
- Integrations: HubSpot (completo), Salesforce (OAuth + sync), RD Station (postergado)

---

## FASE ATIVA — Integrações HubSpot (série C2.9)

### O que está fechado (não reabrir sem decisão explícita)
- **C2.9B** — HubSpot Read-Only Connector Surface ✅
- **C2.9C** — HubSpot Writeback Dry-Run ✅
- **C2.9D.1** — HubSpot Writeback Setup ✅
- **C2.9D.2** — HubSpot Writeback Real Protegido ✅
- **C2.9E.2A** — HubSpot Ingest Contract Foundation ✅
- **C2.9E.2B** — HubSpot Ingest Execution (dry-run → plan → apply) ✅
- **C2.9E.2C** — HubSpot Identity Mapping Foundation ✅
- **C2.9E.2D.9** — Property Registry (43 props) ✅
- **C2.9E.2D.10** — Clean Reload Dry-Run ✅
- **C2.9E.2D.11** — Clean Reload Setup Properties ✅
- **C2.9E.2D.12** — Clean Reload Company Create (247 empresas) ✅
- **C2.9E.2D.13** — Clean Reload Contact Create (305 contatos) ✅
- **C2.9E.2D.14** — Clean Reload Deal Create (27 deals) ✅

### Estado atual do HubSpot (DEV)
- **247 Companies** criadas no HubSpot com `canopi_canonical_id` ✅
- **305 Contacts** criados no HubSpot, associados às companies ✅
- **27 Deals** criados no HubSpot, associados a companies e contacts ✅
- **Mappings Supabase:** 247 company + 305 contact + 27 deal em `hubspot_identity_mappings`
- `canProceedToNextRecorte: true`

### Próximo recorte recomendado
Auditoria pós-deal-create + validação funcional dos 27 deals no HubSpot UI.
Depois: definir próxima frente (ingest real com dados HubSpot → Canopi, ou Salesforce reativar).

---

## SALESFORCE

- **C4.18C — Salesforce Full-load Connector Flow** fechado tecnicamente
- Branches com trabalho Salesforce preservado em quarentena local
- RD Station postergado até encerramento formal de HubSpot ou decisão explícita

---

## COCKPIT / UI

- Páginas implementadas com dados mock: Visão Geral, Contas, Contatos, Sinais, ABM, ABX, Ações, Desempenho, Assistente, Configurações
- Configurações: camada canônica de Contas (UI completa), integrações HubSpot + Salesforce
- **Sinais** funcionam com `advancedSignals` (mock) — integração com dados reais é frente futura
- Porta de validação manual: `127.0.0.1:3053`

---

## BRANCH

- Branch principal: `main` alinhado com `origin/main`
- Último commit relevante: C2.9E.2D.14 (Deal Create)
- Branches em quarentena: `quarantine/salesforce-runtime-invariant-44d62bc`, `wip-abe-cockpit-offplan-quarantine`

---

## REGRAS OPERACIONAIS CRÍTICAS

1. `npm run dev:check` antes de qualquer commit
2. Nunca commitar antes de aprovação explícita do Fábio
3. `git diff --stat` + trecho mínimo do diff antes do commit
4. Fechamento de fase exige evidência técnica + visual + operacional
5. Trabalho off-plan na working tree permanece intocado até decisão
6. Token HubSpot nunca aparece em output ou resposta — foi exposto uma vez (C2.9E.2D.13) e exigiu rotação manual
7. Após qualquer validação, entregar 1 próximo prompt operacional — não encerrar em "estado validado" sem próximo passo

---

## ARQUIVOS-CHAVE

| Arquivo | Finalidade |
|---|---|
| `docs/98-operacao/00-status-atual.md` | Estado técnico completo |
| `docs/98-operacao/01-roadmap-fases.md` | Roadmap de fases |
| `docs/98-operacao/02-decisoes-arquiteturais.md` | Decisões arquiteturais |
| `docs/98-operacao/03-log-de-sessoes.md` | Log de sessões e commits |
| `src/lib/hubspotPropertyRegistry.ts` | 43 propriedades HubSpot registradas |
| `src/lib/server/` | Serviços server-side HubSpot/Salesforce |
| `src/app/api/account-connectors/` | Rotas de API das integrações |
| `src/app/(shell)/configuracoes/` | UI de configurações e conectores |
