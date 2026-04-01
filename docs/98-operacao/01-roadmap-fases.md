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
**Status: Em andamento**

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
| 9 | Inteligência Cruzada | ⚠️ Existe, evoluída em PRs #1–#6, não auditada nesta rodada |
| 10 | Integrações | ⏳ Existe (`Integrations.tsx`) mas em estado inicial |
| 11 | Assistente | ⏳ Existe (`Assistant.tsx`) mas em estado inicial |
| 12 | Configurações | ⏳ Existe (`Settings.tsx`) mas em estado inicial |
| 13 | Performance Orgânica | ⏳ Existe (`SeoInbound.tsx`) mas em estado inicial |
| 14 | Mídia Paga | ⏳ Existe (`PaidMedia.tsx`) mas em estado inicial |
| 15 | Outbound | ⏳ Existe (`Outbound.tsx`) mas em estado inicial |

### Critério de pronto para Fase 4
Baseado em `docs/05-specs-e-backlogs/06-desempenho-spec-e-backlog.md` (e equivalentes):
- Objetivo da página visível e compreensível
- Blocos principais estáveis
- Filtros mínimos definidos
- Estados vazios cobertos
- Relação clara com entidades-base (sinais, ações, contas)
- Fronteira clara com páginas vizinhas
- Dados mock ou estrutura suficiente para navegação coerente

### O que falta para encerrar Fase 4 (interpretação mínima)
O roadmap lista "consolidar Visão Geral e Desempenho" como o grupo imediato após Ações, Contas e Sinais. Visão Geral está concluída. **Desempenho é o próximo passo obrigatório antes de avançar para Fase 5.**

As demais páginas (Contatos, canais, sustentação) também fazem parte da Fase 4 no sentido amplo, mas podem ser abordadas em iterações subsequentes dentro da mesma fase, ou tratadas como primeiro escopo da Fase 5 dependendo da decisão do produto.

---

## Fase 5 — Refino e endurecimento
**Status: Não iniciada**

Itens previstos:
- Revisar qualidade das telas
- Revisar coerência de navegação
- Ajustar regras e priorização
- Remover redundância e excesso de escopo

Pré-requisito: Fase 4 suficientemente concluída (pelo menos o núcleo operacional).
