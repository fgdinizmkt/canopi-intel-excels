# Dicionário operacional de campanhas, ações, ABM e ABX

## Objetivo
Consolidar a modelagem canônica de campanhas, ações, sinais e escalas operacionais no Canopi para orientar schema, filtros, interfaces e prompts futuros.

---

## Princípio geral
No Canopi, `campanha` não deve absorver origem, canal, sinal, audiência, objetivo ou escala.

A leitura correta separa estes blocos:
- origem
- canal
- hand raiser
- campanha
- tipo de campanha
- formato
- audience
- objective
- uso principal
- escala

---

## 1. Campo: campanha
### Definição
A iniciativa concreta que está sendo executada para gerar, nutrir, acelerar, expandir, reativar ou coordenar movimento em uma ou mais contas.

### Responde
O que estamos fazendo nesta conta ou grupo de contas.

### Exemplos
- Webinar de governança de dados para indústria
- Sequência executiva de prospecção para contas Tier 1
- Trilha de nutrição de modernização de dados
- Workshop privado com conta estratégica
- Reativação de contas paradas de manufatura
- Co-marketing com parceiro de cloud

### Não é
- origem
- canal
- audiência
- objetivo
- hand raiser
- escala

### Onde aparece na plataforma
- Accounts
- ABM Strategy
- ABX Orchestration
- Intelligence Exchange
- perfil da empresa
- timeline da conta

---

## 2. Campo: origem
### Definição
A natureza da entrada, influência ou geração inicial do movimento.

### Valores canônicos iniciais
- orgânico
- pago
- prospecção ativa
- parceria
- base existente
- indicação
- direto

### Regras
- `orgânico` não absorve nada pago
- `orgânico` não absorve cold mail, cold call ou outreach frio
- `pago` cobre mídia comprada
- `prospecção ativa` cobre abordagem fria/ativa

### Exemplos
- Orgânico via SEO
- Pago via LinkedIn Ads
- Prospecção ativa via sequência outbound
- Parceria via evento conjunto

### Onde aparece na plataforma
- filtros de campanhas
- atribuição de sinais
- Accounts
- Performance
- Intelligence Exchange

---

## 3. Campo: canal
### Definição
O meio por onde a campanha rodou, a interação aconteceu ou o sinal foi capturado.

### Valores canônicos iniciais
- SEO
- website
- blog / conteúdo
- social orgânico
- email
- LinkedIn
- Google Ads
- Meta Ads
- SDR
- parceiro
- CRM / automação
- sales engagement
- webinar
- workshop digital
- podcast
- vídeocast
- evento presencial
- workshop presencial

### Regra
Canal não é campanha.

### Onde aparece na plataforma
- Performance
- Signals
- Accounts
- filtros de campanha
- Integrations

---

## 4. Campo: hand raiser
### Definição
Gatilho ou sinal de interesse, intenção ou prontidão, explícito ou implícito.

### Valores canônicos iniciais
- formulário preenchido
- pedido de contato
- pedido de demo
- download de material
- inscrição em webinar
- participação em webinar
- inscrição em workshop digital
- participação em workshop digital
- participação em evento presencial
- participação em workshop presencial
- resposta a outbound
- engajamento com conteúdo
- visita a página crítica
- sinal comercial direto
- reativação

### Regra
Hand raiser não é campanha nem canal.
Ele pode vir de vários canais e várias origens.

### Onde aparece na plataforma
- Signals
- Accounts
- perfil da empresa
- perfil do contato
- Intelligence Exchange
- Assistant

---

## 5. Campo: tipo de campanha
### Definição
A classe operacional da campanha.

### Valores canônicos iniciais
- conteúdo
- captação
- nutrição
- prospecção
- conversão
- relacionamento
- reativação
- expansão
- co-marketing / parceria
- prova social / autoridade

### Regra
É o filtro principal para leitura de campanha.

### Onde aparece na plataforma
- filtros em Accounts
- ABM Strategy
- ABX Orchestration
- Performance

---

## 6. Campo: formato
### Definição
A materialização da campanha ou ação.

### Valores canônicos iniciais
#### Remoto
- webinar
- workshop digital
- podcast
- vídeocast
- sequência outbound
- nurture
- landing page / oferta
- conteúdo rico
- campanha paga

#### Presencial
- evento de mercado
- evento próprio
- workshop presencial

### Regras
- webinar e evento não devem ser fundidos
- podcast e vídeocast devem existir como formatos próprios
- o formato não define sozinho a escala

### Onde aparece na plataforma
- campanha
- timeline
- profile da empresa
- ABM Strategy
- ABX Orchestration

---

## 7. Campo: audience
### Definição
Para quem a campanha foi pensada.

### Valores canônicos iniciais
- new logo
- conta alvo
- cluster estratégico
- cliente existente
- expansão
- retenção
- mixed

### Regra
Audience é atributo da campanha, não campanha.

### Onde aparece na plataforma
- campanha
- ABM Strategy
- ABX Orchestration
- Intelligence Exchange

---

## 8. Campo: objective
### Definição
O objetivo principal da campanha ou ação.

### Valores canônicos iniciais
- awareness
- engajamento
- meeting
- pipeline
- conversão
- expansão
- retenção
- reativação
- educação
- relacionamento

### Regra
Objective é atributo da campanha, não campanha.

### Onde aparece na plataforma
- campanha
- Performance
- Assistant
- Intelligence Exchange

---

## 9. Campo: uso principal
### Definição
Indica qual lógica operacional predomina naquela ação ou campanha.

### Valores canônicos iniciais
- ABM
- ABX
- híbrido
- operacional geral

### Regra
ABM e ABX não devem ser só rótulos macro. Eles devem classificar campanhas, ações e plays.

### Onde aparece na plataforma
- campanhas
- ações
- plays
- Signals
- Assistant
- Intelligence Exchange

---

## 10. Campo: escala
### Definição
Classifica a abrangência e o grau de personalização da ação.

### Valores canônicos iniciais
- 1:1
- 1:few
- 1:many

### Responde
- para quantas contas a ação foi desenhada
- qual o grau de personalização
- qual a abrangência operacional

### Regras
- a escala não substitui formato, campanha ou canal
- a mesma natureza de ação pode existir em escalas diferentes
- workshop pode ser 1:1, 1:few ou 1:many
- webinar tende a 1:many, mas pode alimentar desdobramentos menores

### Onde aparece na plataforma
- ABM Strategy
- ABX Orchestration
- campanhas
- ações
- plays
- Intelligence Exchange

---

## Leitura composta recomendada
A leitura mínima de uma campanha ou ação no Canopi deve combinar:
- campanha
- tipo de campanha
- formato
- origem
- canal principal
- hand raiser relevante
- audience
- objective
- uso principal
- escala

---

## Exemplos canônicos

### Exemplo 1
- campanha: Webinar de governança de dados para manufatura
- tipo de campanha: conteúdo
- formato: webinar
- origem: orgânico
- canal principal: SEO
- hand raiser: inscrição em webinar
- audience: cluster estratégico
- objective: pipeline
- uso principal: ABM
- escala: 1:many

### Exemplo 2
- campanha: Workshop privado com conta estratégica
- tipo de campanha: relacionamento
- formato: workshop digital
- origem: base existente
- canal principal: email
- hand raiser: sinal comercial direto
- audience: conta alvo
- objective: expansão
- uso principal: ABX
- escala: 1:1

### Exemplo 3
- campanha: Sequência outbound para 8 contas industriais
- tipo de campanha: prospecção
- formato: sequência outbound
- origem: prospecção ativa
- canal principal: SDR
- hand raiser: resposta a outbound
- audience: cluster estratégico
- objective: meeting
- uso principal: ABM
- escala: 1:few

### Exemplo 4
- campanha: Vídeocast com especialistas de dados industriais
- tipo de campanha: prova social / autoridade
- formato: vídeocast
- origem: orgânico
- canal principal: LinkedIn
- hand raiser: engajamento com conteúdo
- audience: mixed
- objective: awareness
- uso principal: ABM
- escala: 1:many

---

## Reflexos futuros obrigatórios
Esta modelagem deve orientar futuras interfaces e filtros em:
- Accounts
- ABM Strategy
- ABX Orchestration
- Intelligence Exchange
- perfil da empresa
- perfil do contato
- Assistant
- Signals
- Performance

---

## Observação final
Esta estrutura deve ser tratada como base operacional prioritária para schema, prompts e UI.
A taxonomia ainda pode amadurecer, mas estes campos já devem funcionar como contrato canônico inicial do produto.