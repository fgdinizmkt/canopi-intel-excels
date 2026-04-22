# Handoff — Roadmap de Configurações / Setup da Canopi

## Objetivo
Registrar, em formato seguro para handoff entre chats e agentes, a direção aprovada para a frente de **Configurações** da Canopi.

Este documento existe para evitar três erros recorrentes:
1. empobrecer a página para um painel de status ou inventário
2. inventar configurações sem efeito real no produto
3. misturar visão futura demais com o que já está sugerido ou materializado na plataforma

---

## Estado de referência no repositório

### Fato 1 — rota publicada em `main`
No branch principal, a rota `/configuracoes` ainda aponta para `src/pages/Settings.tsx`.

### Fato 2 — natureza do `Settings` legado
O `Settings.tsx` publicado em `main` é **diagnóstico/documental**. Ele não é uma central operacional de setup. O próprio arquivo assume escopo de transparência, mapeamento e diagnóstico, sem persistência nem execução real.

### Leitura consolidada
Portanto, o problema não é apenas "melhorar a tela".
O problema é transformar Configurações em uma **camada de parametrização real da lógica operacional da Canopi**.

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
Configurações que precisam existir porque sinais já são núcleo do produto:
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
**Esta é a etapa prioritária.**

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

**Por que vem primeiro:**
Porque sustenta diretamente Contas, Sinais, Ações, Cockpit, ABM e ABX.
Sem essa camada, o resto tende a ficar superficial.

### Etapa 2 — Medição, Conversões e Mídia
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

### Etapa 3 — Scores, Sinais e Roteamento
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

### Etapa 4 — Plays, ABM e ABX
Cobertura:
- play library
- ICP
- tiers
- target accounts
- clusters
- sponsor logic
- journey rules
- expansion logic

### Etapa 5 — Intelligence Exchange e Governança
Cobertura:
- propagação ABM ↔ ABX
- confidence thresholds
- versionamento
- publicação
- auditoria
- permissões
- API

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

## Próxima ação operacional aprovada
**Iniciar a Etapa 1: Objetos, Campos, CRM e Matching** no trabalho local do Claude Code, usando este documento como contrato de direção.

---

## Status deste documento
- Criado para handoff seguro entre chats e agentes
- Serve como base de alinhamento para a evolução de `/configuracoes`
- Deve ser atualizado conforme cada etapa for efetivamente materializada
