# Canopi — Sistema Operacional de Agentes

> **INSTRUÇÃO OBRIGATÓRIA:** Leia `CONTEXTO.md` na raiz do projeto no início de toda sessão. Ele contém o estado operacional atualizado — fase ativa, próximo passo aprovado, decisões recentes. Sem isso você vai perder contexto.
>
> Para estado técnico detalhado: `docs/98-operacao/00-status-atual.md`
> Para protocolo completo de agentes: `AGENTS.md`

---

## O Produto

**Canopi** — plataforma SaaS B2B de inteligência de receita e Account Intelligence.

Problema que resolve: times de Revenue/GTM tomam decisões com dados fragmentados entre CRMs, canais e ferramentas. A Canopi consolida tudo num cockpit único orientado a **sinal → ação**.

Módulos principais:
- **Sinais** — alertas classificados por severidade (crítico/alerta/oportunidade) com causa, impacto em R$ e ação recomendada
- **Contas** — scoring, mapa de stakeholders (decisor/champion/sponsor/blocker), oportunidades
- **Contatos** — força relacional, receptividade, influência, próxima ação
- **Estratégia ABM** — playbooks por tipo de situação por conta
- **Orquestração ABX** — execução multicanal coordenada
- **Ações** — fila priorizada derivada de sinais e contas
- **Integrações** — HubSpot, Salesforce, RD Station, CSV — camada canônica que normaliza tudo

Usuário alvo: Head de Revenue Ops, Marketing B2B, SDR Lead em empresas enterprise brasileiras.

---

## Operador

**Fábio** — construtor solo. Interface com Claude Code (executor principal), ChatGPT (orquestração), Gemini/Antigravity (UX/UI visual), Codex (auditoria técnica).
- Não quer validação fácil. Quer análise crítica, que discorde quando necessário.
- Cada mudança visual ou estrutural exige aprovação explícita antes do commit.
- Nunca commitar antes de aprovação. Nunca inventar estado do projeto — usar `docs/98-operacao/` como fonte de verdade.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind |
| Backend | Next.js API Routes (server-side) |
| Banco | Supabase (PostgreSQL + RLS + RPCs) |
| Integrações | HubSpot API v3/v4, Salesforce OAuth, RD Station |
| Dev local | `npm run dev:clean` · porta `127.0.0.1:3053` |
| Lint/Build | `npm run dev:check` antes de qualquer commit |
| Repo | `fgdinizmkt/canopi-intel-excels` (GitHub) |

---

## Sistema de Agentes

Este projeto opera com grupos de agentes especializados. Claude Code (você) é o **executor principal de código**. Os outros ambientes (ChatGPT, Gemini, Codex) são ambientes executores alternativos. GooseWorks, OpenSquad e Agency Agents são subagentes/perfis acionáveis dentro desses ambientes.

**Antes de qualquer tarefa, declare:**
1. Ambiente executor recomendado
2. Subagente/perfil recomendado
3. Motivo da escolha
4. Condição de escalonamento

### Grupo 1 — Produto

| # | Agente | Arquivo | Responsabilidade |
|---|---|---|---|
| 00 | Orquestrador | agents/00-orquestrador.md | Coordena agentes, mantém plano como norte |
| 01 | Product Manager | agents/01-product-manager.md | Roadmap, specs, backlog, ClickUp |
| 02 | Frontend Engineer | agents/02-frontend-engineer.md | Next.js, React, componentes, UI |
| 03 | Backend Engineer | agents/03-backend-engineer.md | API routes, Supabase, autenticação |
| 04 | Integrations Engineer | agents/04-integracoes-engineer.md | HubSpot, Salesforce, RD Station |
| 05 | Data Architect | agents/05-dados-arquiteto.md | Camada canônica, schema, migrations |

### Grupo 2 — GTM e Marketing

| # | Agente | Arquivo | Responsabilidade |
|---|---|---|---|
| 10 | GTM Strategist | agents/10-gtm-strategist.md | Posicionamento, ICP, early adopters, pricing |
| 11 | Copywriter | agents/11-copywriter.md | Website, onboarding, in-product copy |

### Grupo 3 — Especialistas

| # | Agente | Arquivo | Responsabilidade |
|---|---|---|---|
| 20 | QA Visual | agents/20-qa-visual.md | Playwright, visual audit, smoke tests |
| 21 | GooseWorks | agents/21-gooseworks.md | Pesquisa, enriquecimento, dados externos |
| 22 | OpenSquad | agents/22-opensquad.md | Orquestração multiagente complexa |
| 23 | Agency Agents | agents/23-agency-agents.md | Marketing da Canopi como produto |

### Lógica de Roteamento

| Demanda | Agentes |
|---|---|
| Nova feature front-end | 01 (spec) → 02 (impl) → 20 (QA) |
| Nova rota de API / integração | 01 (spec) → 03 ou 04 (impl) → 05 se schema muda |
| Bug visual | 02 → validação Gemini/Antigravity se UX complexo |
| Schema / migration Supabase | 05 → 03 para rotas |
| Pesquisa de mercado / ICP | 21 (GooseWorks) → 10 (estratégia) |
| Copy website / produto | 11 |
| Marketing da Canopi | 23 (Agency Agents) |
| Demanda cruzada | 00 (Orquestrador) declara quem faz o quê |

---

## Protocolo de Implementação

Ver `AGENTS.md` para o protocolo completo. Resumo operacional:

**Fluxo obrigatório antes de qualquer commit:**
1. Se houver mudança visual: propor direção, obter aprovação antes de codar
2. Executar o recorte autorizado
3. `npm run dev:check` (lint + build)
4. `git diff --stat` + trecho alterado
5. Aguardar aprovação explícita do Fábio
6. Commitar
7. Atualizar memória operacional

**Regras de implementação:**
- Implementar em blocos pequenos, validáveis e reversíveis
- Não fazer full-file replacement quando patch localizado resolve
- Não imprimir arquivo inteiro sem autorização explícita
- Após 2 rodadas de patch sem resolver: parar, escalar para causa raiz
- Trabalho off-plan preservado na working tree permanece intocado até decisão explícita

**Dev local:**
- Iniciar: `npm run dev:clean` · porta `127.0.0.1:3053`
- Validar: `npm run dev:check` antes de qualquer commit
- Nunca usar `next start` para validação manual
- Erros de chunk/manifest: reiniciar pelo fluxo limpo

---

## Memória Operacional

A memória do projeto vive em dois lugares:

| Onde | O que armazena |
|---|---|
| `docs/98-operacao/` | Memória técnica: status, roadmap, decisões arquiteturais, log de sessões |
| `CONTEXTO.md` | Memória operacional para IA: estado atual, frente ativa, próximo passo |
| `~/.claude/projects/.../memory/` | Memória persistente entre sessões Claude Code |

**Protocolo de atualização ao final de toda sessão:**
1. `CONTEXTO.md` — data, frente, o que mudou, próximo passo aprovado
2. `docs/98-operacao/00-status-atual.md` — estado técnico detalhado
3. `docs/98-operacao/03-log-de-sessoes.md` — o que foi feito, commits relevantes
4. `~/.claude/projects/.../memory/project_canopi.md` — entregáveis e estado

Atualização parcial = não aceitável.

---

## Metas do Produto

| Marco | Descrição |
|---|---|
| MVP Integrações | HubSpot + Salesforce lendo e escrevendo dados reais em produção |
| MVP Cockpit | Sinais + Contas + Ações com dados reais do HubSpot |
| Beta | Primeiro cliente pagante operando o cockpit |
| v1.0 | RD Station + multi-tenant + onboarding self-serve |
