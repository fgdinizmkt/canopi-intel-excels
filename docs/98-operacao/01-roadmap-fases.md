# Roadmap por fases

## Fonte
Baseado em `docs/00-visao-do-produto/04-roadmap-consolidado.md` (branch `refactor/organizacao-inicial`) e no trabalho real executado em main.

---

## Fase 1 — Base documental
**Status: Concluída** (em `refactor/organizacao-inicial`, não portada para main)

Itens:
- [x] Visão do produto
- [x] Arquitetura do sistema
- [x] Estrutura da plataforma (hierarquia, ordem de construção, fronteiras)
- [x] Páginas da V1 (specs e backlogs)
- [x] Operação e governança (perfis, regras, critérios)

Critério de pronto: base documental suficiente para orientar execução sem reabrir discussões estruturais.

Observação: os documentos existem em `refactor/organizacao-inicial:docs/` mas não foram portados para `main`. Portá-los é uma pendência de Fase 4 ou início de Fase 5.

---

## Fase 2 — Consolidação curta
**Status: Concluída** (em `refactor/organizacao-inicial`, não portada para main)

Itens:
- [x] Dicionário oficial de labels
- [x] Tabela de decisão de fronteiras
- [x] Template mínimo de página
- [x] README principal
- [x] Roadmap consolidado
- [x] Regras operacionais do projeto

Critério de pronto: nenhuma ambiguidade de nomenclatura; fronteiras claras entre páginas; template padrão estabelecido.

---

## Fase 3 — Backlog executável
**Status: Concluída** (em `refactor/organizacao-inicial`, não portada para main)

Itens:
- [x] Specs e backlogs por página (15 páginas cobertas)
- [x] Prioridades de implementação definidas
- [x] Dependências entre páginas mapeadas

Critério de pronto: toda página tem papel, fronteira, inputs, outputs, KPIs e ações derivadas.

---

## Fase 4 — Construção da V1
**Status: Concluída (Núcleo Mínimo)**

### Ordem de construção definida
(baseada em `docs/02-estrutura-da-plataforma/02-ordem-de-construcao-das-paginas.md`)

| Prioridade | Página | Status |
|---|---|---|
| 1 | Ações | ✅ Fortalecida com dados reais — commit `ab2722b` |
| 2 | Contas | ✅ Fortalecida com dados reais — commit `ab2722b` |
| 3 | Contatos | ⏳ Existe mas não foi fortalecida nesta rodada |
| 4 | Sinais | ✅ Fortalecida com dados reais — commit `ab2722b` |
| 5 | Visão Geral | ✅ Fortalecida com dados reais — commit `b64d82e` |
| 6 | Desempenho | ✅ Recorte executado — contas inline com sinais e ações — commit `6395b58` |
| 7 | Estratégia ABM | ⚠️ Existe, evoluída em commits anteriores, não auditada nesta rodada |
| 8 | Orquestração ABX | ⚠️ Existe, evoluída em commits anteriores, não auditada nesta rodada |
| 9 | Inteligência Cruzada | ✅ Primeiro recorte de Fase 5 — commit `c1a4c95` |
| 10 | Integrações | ✅ Painel de Confiabilidade do Stack — commit `cdea929` |
| 11 | Assistente | ⏳ Existe (`Assistant.tsx`) mas em estado inicial |
| 12 | Configurações | ⏳ Existe (`Settings.tsx`) mas em estado inicial |
| 13 | Performance Orgânica | ✅ Saneamento técnico inicial — commit `8135da4` |
| 14 | Mídia Paga | ✅ Saneamento técnico inicial — commit `8135da4` |
| 15 | Outbound | ✅ Cockpit tático orientado por sinais — commit `281613e` |

### Critério de pronto para Fase 4
Baseado em `docs/05-specs-e-backlogs/06-desempenho-spec-e-backlog.md` (e equivalentes):
- Objetivo da página visível e compreensível
- Blocos principais estáveis
- Filtros mínimos definidos
- Estados vazios cobertos
- Relação clara com entidades-base (sinais, ações, contas)
- Fronteira clara com páginas vizinhas
- Dados mock ou estrutura suficiente para navegação coerente

### Conclusão da Fase 4
A Fase 4 foi encerrada no seu núcleo imediato (Visão Geral e Desempenho) em 2026-04-01, permitindo a transição para a camada de inteligência e refino.

---

## Fase 5 — Refino e endurecimento
**Status: Em andamento**

Recortes concluídos:
- [x] **CrossIntelligence.tsx** — Injeção de sinais reais (Nexus/Minerva) e persistência em `canopi_actions` (commit `c1a4c95`).
- [x] **Estabilização UI/Runtime** — Criação de `globals.css` e saneamento de cache do Next.js 15 (commit `0bd0822`).
- [x] **Integrations.tsx** — Dashboard de confiabilidade e KPIs de saúde do stack (commit `cdea929`).
- [x] **Outbound.tsx** — Cockpit tático com fila de intervenção e Contexto ICP (commit `281613e`).
- [x] **Centro de Comando (Completo)** — Perfil da Conta, Organograma Visual e Perfil do Contato (commit `8135da4`).

Itens em andamento/previstos:
- Revisar qualidade das telas remanescentes (Assistente, Configurações).
- Consolidar orquestração cross-channel.
- Manter o foco em refino de funcionalidade e preservação da estética premium (Regra 6).

Próxima etapa: Iniciar o 6º Recorte da Fase 5 (Evolução do Assistente de IA ou orquestração).

