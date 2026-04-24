# Handoff — Roadmap de Configurações / Setup da Canopi


## Objetivo
Registrar, em formato seguro para handoff entre chats e agentes, a direção aprovada para a frente de **Configurações** da Canopi.

Este documento existe para evitar três erros recorrentes:
1. empobrecer a página para um painel de status ou inventário
2. inventar configurações sem efeito real no produto
3. misturar visão futura demais com o que já está sugerido ou materializado na plataforma

---


## Estado de referência no repositório
A camada de Configurações está 100% materializada no front-end e integrada à lógica operacional da Canopi (Fase Funcional 2 concluída).

---

---


## Decisão aprovada


### O que NÃO fazer

- não simplificar a página para health dashboard

- não reduzir a tela a conexões + status

- não criar settings genéricos de CRM sem impacto na Canopi

- não inventar taxonomias, campos ou regras sem superfície real no produto

- não tratar Configurações como módulo isolado do restante da plataforma


### O que fazer
Trazer um **setup robusto e amplo**, sim, mas sempre:

- reancorado no que a Canopi já mostra, sugere ou depende

- com efeito real em módulos já existentes ou explicitamente planejados

- implementado em etapas para evitar entregas rasas e reinterpretadas

---


## Regra-mestra de entrada de qualquer configuração
Toda configuração nova só pode entrar se responder claramente às 4 perguntas abaixo:

1. **De onde esse dado vem?**
   - integração, fonte interna, input manual, regra interna
2. **Onde isso aparece na Canopi?**
   - Contas, Sinais, Ações, Desempenho, ABM, ABX, Cockpit, Assistant etc.
3. **O que muda quando isso é alterado?**
   - score, sinal, roteamento, play, owner, classificação, recomendação, decisão
4. **Qual módulo depende disso operacionalmente?**
   - qual parte quebra, empobrece ou ganha inteligência quando o parâmetro muda

Se uma configuração não responder a essas 4 perguntas, **não deve entrar**.

---


## Mapa de espelhamento: Setup ↔ Plataforma


### 1. Contas
Configurações que precisam existir porque alimentam a experiência de Contas:

- source of truth de conta

- hierarquia parent/child

- campos críticos de conta

- owner mapping

- tier da conta

- status ABM / ABX

- stakeholder taxonomy

- matching e dedupe


### 2. Sinais
Configurações de Sinais:

- categorias de sinal

- severidade

- thresholds

- cooldown

- owner padrão

- SLA

- dependência de fonte

- condições compostas de disparo


### 3. Ações
Configurações que precisam existir porque a plataforma já opera com recomendação e fila:

- tipos de ação

- prioridade

- owner padrão

- condições de ativação

- condições de cancelamento

- relação entre sinal e ação

- biblioteca de plays


### 4. Desempenho / canais
Configurações que precisam existir porque há leitura de performance e canais:

- eventos

- conversões

- attribution logic

- source normalization

- taxonomy de campanha

- contas de mídia

- KPIs oficiais

- frequência de sync


### 5. Estratégia ABM
Configurações que precisam existir porque ABM já é parte do sistema:

- ICP

- tiers

- target account logic

- clusters

- vertical priority

- committee ideal

- playbooks por tier


### 6. Orquestração ABX
Configurações que precisam existir porque ABX já é parte do sistema:

- journey stage

- sponsor/champion logic

- committee maturity

- stagnation risk

- expansion readiness

- orchestration rules


### 7. Inteligência Cruzada
Configurações que precisam existir porque a plataforma propõe account intelligence e reutilização de learnings:

- propagação ABM ↔ ABX

- confidence threshold

- padrões reaproveitáveis por cluster/vertical

- limites de propagação


### 8. Assistant
Configurações que precisam existir porque o Assistant já faz parte do produto:

- fontes prioritárias

- fallback

- confiança mínima

- autonomia

- escopo de recomendação

- tom / política de resposta


### 9. Cockpit V2
O Cockpit **não deve ter setup próprio isolado**.
Ele deve refletir o que foi parametrizado nos módulos acima.

---


## Roadmap aprovado para implementação do Setup


### Etapa 1 — Objetos, Campos, CRM e Matching
**STATUS: CONCLUÍDO NO FRONT (Materializado)**

Cobertura:

- entidades-base: Conta, Contato, Oportunidade, Campanha, Stakeholder, Owner

- source of truth por entidade

- prioridade de fontes

- lifecycle stages

- deal stages

- owners por etapa

- campos críticos de conta e contato

- taxonomia de owners e stakeholders

- matching e deduplicação

- hierarquia de contas

- estados de draft / validado / publicado

**Implementação:** 100% da interface operacional materializada. Parâmetros de sincronização e regras de matching definidos no estado local, aguardando persistência na API.


### Etapa 2 — Medição, Conversões e Mídia
**STATUS: CONCLUÍDO NO FRONT (Materializado)**

Cobertura:

- GA4

- Google Ads

- Meta

- LinkedIn

- eventos

- conversões primárias/secundárias

- attribution mapping

- campaign taxonomy

- audience sync flags

**Implementação:** Interface estruturada em abas categorizadas. Taxonomia de eventos e regras de atribuição/taxonomia totalmente parametrizáveis no front.


### Etapa 3 — Scores, Sinais e Roteamento
**STATUS: CONCLUÍDO NO FRONT (Materializado)**

Cobertura:

- lead fit

- engagement

- account potential

- committee completeness

- relationship strength

- ABX readiness

- thresholds

- cooldowns

- owners

- SLAs

- routing

**Implementação:** Engine de scoring estratificada com visualização de pesos e fontes. Gatilhos de sinal (triggers) parametrizáveis com severidade e SLA. Tabela de roteamento funcional com hierarquia de prioridade e fallbacks operacionais.


### Etapa 4 — Plays, ABM e ABX
**STATUS: CONCLUÍDO NO FRONT (Materializado)**

Cobertura:
- play library (materialização de 7 táticas canônicas)
- ICP (vertical, revenue, technographics)
- tiers e clusters operacionais
- sponsor logic e maturity
- journey orchestration rules
- stagnation risk e expansion readiness

**Implementação:** Interface densa com cards de táticas e regras de orquestração automatizadas. Parametrização completa de ICP e matriz de Tiers.


### Etapa 5 — Intelligence Exchange e Governança
**STATUS: CONCLUÍDO NO FRONT (Materializado)**

Cobertura:
- propagação ABM ↔ ABX (intelligence exchange)
- confidence thresholds e expiração
- repositório de learnings e padrões reaproveitáveis
- versionamento e histórico de alterações
- políticas de publicação (peer review)
- governança e permissões granulares por domínio

**Implementação:** Camada premium de governança materializada. Setup funcional para troca de inteligência entre contextos e matriz de permissões por domínio de dados.

---


## Escopo detalhado da Etapa 1


### 1. Modelo de objetos
Criar setup funcional para:

- Conta

- Contato

- Oportunidade

- Campanha

- Stakeholder

- Owner

- Sinal

- Ação

Cada objeto precisa expor:

- nome

- fonte principal

- status

- quantidade de campos obrigatórios

- quantidade de campos customizados

- CTA de configuração


### 2. Source of truth e prioridade entre fontes
Entidades mínimas:

- Conta

- Contato

- Oportunidade

- Campanha

Cada uma deve permitir parametrizar:

- sistema principal

- prioridade em conflito

- overwrite / append / revisão manual

- frequência esperada de sync

- política de fallback


### 3. Lifecycle e pipeline
Setup funcional para:

- lifecycle stages de marketing

- deal stages de vendas

- critérios de passagem

- owners por etapa

- motivos de perda

- motivos de desqualificação


### 4. Campos críticos de Conta e Contato
**Conta**

- nome canônico

- domínio

- segmento

- porte

- tier

- owner

- parent account

- vertical

- status ABM

- status ABX

- fit tier

- committee completeness

**Contato**

- nome

- email

- cargo original

- cargo normalizado

- área

- senioridade

- stakeholder role

- influência

- owner

- status de relacionamento

Cada campo deve permitir:

- obrigatório/opcional

- externo/interno

- editável/read-only

- usado em matching ou não


### 5. Taxonomia de Owners e Stakeholders
Exemplos coerentes com a Canopi:

- Executive Sponsor

- Champion

- Budget Holder

- Technical Evaluator

- Procurement

- User Rep

A UI deve permitir:

- adicionar

- editar

- ativar/desativar

- priorizar

- associar à lógica de conta/comitê


### 6. Matching e deduplicação
**Conta**

- domínio

- nome da empresa

- aliases

- parent-child

**Contato**

- email

- LinkedIn URL

- telefone

- nome + empresa

A UI deve permitir:

- critério principal

- critérios secundários

- fuzzy matching on/off

- merge automático ou revisão manual

- regra de conflito

- visão de conflitos detectados / itens em revisão


### 7. Hierarquia de contas
Configurar:

- parent account

- child account

- subsidiária

- unidade de negócio

- holding


### 8. Camada de publicação
A etapa precisa deixar explícito:

- rascunho

- alteração pendente

- validado

- publicado

---


## Invariantes de implementação
Para qualquer agente que mexer nesta frente:

1. **Não empobrecer o setup**
   - se a tela virar só cards de status, a direção está errada

2. **Não desacoplar do produto**
   - toda configuração precisa conversar com pelo menos um módulo real

3. **Não misturar etapas**
   - Etapa 1 não deve abrir GA4/Meta/Google Ads profundo
   - Etapa 1 não deve abrir score complexo ou ABM/ABX avançado

4. **Não reinventar a Canopi**
   - a lógica deve emergir do produto, não de um software de CRM genérico

5. **Manter profundidade funcional**
   - drawers, modais, conflito, validação, rascunho/publicação, e não apenas visual decorativo

---


## Agentes e papéis


### Claude Code
Executor principal da implementação por etapa no repositório local.


### ChatGPT
Responsável por:

- consolidar direção

- documentar handoff

- registrar regras e invariantes

- reduzir risco de reinterpretação entre chats


### Antigravity
Não é o executor principal desta frente.
Pode ser útil mais à frente para exploração visual, mas aqui tende a aumentar o risco de reinvenção.

---


---


---

## 🚀 ROADMAP CONCLUÍDO (2026-04-23)
Todas as 5 etapas do Roadmap de Configurações foram materializadas no front-end da plataforma Canopi. A página `/configuracoes` agora atua como uma camada densa de parametrização para Objetos, Mídia, Scores, Sinais, Roteamento, Plays, ABM, ABX, Intelligence Exchange e Governança.

---

## 🛠️ CONSUMO OPERACIONAL (Fase Funcional 2)
As configurações publicadas deixaram de ser apenas visual/mock e passaram a ser o motor de lógica dos seguintes módulos:

### 1. Mapa de Impacto: Configuração → Efeito
| Configuração Criada | Onde aparece na Canopi | O que muda quando alterada |
| :--- | :--- | :--- |
| **Scoring Rules** | `/accounts`, `/overview`, `/actions` | Altera pesos (Potencial, Risco, Prontidão, Cobertura) e bônus de pontuação, reordenando a triagem de contas. |
| **Signal Configs** | `/sinais` | Define severidade ('Crítico', 'Alerta'), SLAs (ex: 2h, 24h) e o Owner Padrão de cada sinal categorizado. |
| **Routing Rules** | `/sinais`, `/actions` | Define o roteamento automático (ex: Head of Sales para sinais críticos) e fallbacks operacionais. |
| **ABM/ABX Readiness** | `/cockpit-v2` | Alinha o status visual e operacional dos motores de orquestração com os thresholds de prontidão. |

### 2. Status de Implementação
- **Contas (`/accounts`):** Consumo real de `scoring_rules` para cálculo dinâmico e ordenação.
- **Sinais (`/sinais`):** Engine de processamento reativo que aplica severidade, SLA e Owner via `signal_configs` e `routing_rules`.
- **Overview (`/overview`):** Triagem de contas críticas e alta prioridade baseada em regras publicadas.
- **Ações (`/actions`):** Roteamento operacional completo. Injeção dinâmica de `owner` e `fallback` via `routing_rules`, com sinalização visual de ancoragem (⚓) aplicada deterministicamente.
- **Cockpit V2:** Status dos motores regidos por `scoring_rules`. Exibição de **Foco Sensível**, multiplicadores de peso operacional e thresholds reais no painel de detalhes do motor.

---

## Status deste documento
- **Finalizado**: A frente de Configurações está funcional e integrada ao núcleo operacional da Canopi.

---

## 🔒 Fechamento técnico — Configurações → Objetos → Contas V2 (2026-04-23)

O recorte funcional de hardening da entidade Contas foi concluído com sucesso em estado local.

### 1. Entregas Fiscais e Técnicas
- **Contas V2 Modularizada:** Implementação de hub minimalista redirecionando para módulo dedicado com 9 subpáginas (Fontes, Identidade, Camada Canônica, Classificação ABM/ABX, Writeback, Upload/LGPD, Governança, Validação e Visão Geral).
- **Motor de Blockers Centralizado:** Lógica de validação estrita implementada no `ContasConfigContext.tsx` via `getAccountConfigBlockers`.
- **Blockers Implementados (Gating):**
  - `CONECTOR_MISSING`: Impede publicação sem fonte selecionada.
  - `CONNECTOR_INCOMPLETE`: Exige preenchimento de objeto nativo e PK em conectores padrão.
  - `LGPD_LEGAL_BASIS_MISSING`: Mandatório para CSV e fontes de alto risco.
  - `IDENTITY_CONFLICT`: Bloqueia se não houver chave primária ativa na Identidade.
  - `CANONICAL_MAPPING_INCOMPLETE`: Exige 8 campos mínimos (external_account_id, canonical_name, primary_domain, account_owner, account_operating_mode, targeting_status, abm_tier, abx_stage).
  - `WRITEBACK_UNSAFE`: Protege contra corrupção de dados no CRM se a política for insegura (Permite apenas Append ou Manual Review).
  - `CUSTOM_CONNECTOR_INCOMPLETE`: Hardening completo para "Outro CRM" (Nome, Obj, PK, Secundárias, Obrigatórios, Confiança, Política).
- **Presets Consolidados:** Mudança para `src/lib/contaConnectorsV2.ts` eliminando duplicidade de lógica.
- **Remoção de Arquivos Legados:**
  - `src/lib/contaConnectors.ts` (Removido)
  - `src/lib/entityConfigs.ts` (Removido)
  - `AccountConnectors.tsx` (Removido)
- **Infraestrutura:** Build aprovado e Type checking (TSC) validado.

### 2. Limitações e Escopo de Homologação
- **Ambiente:** Funcional em Local State (React Context).
- **Dados:** Persistência volátil (navegação atual).
- **Exclusões:** Este recorte **NÃO** inclui integração real com Backend (API/Supabase), Auth OAuth, Sync real de CRM ou Deploy em produção real com escrita em banco.
