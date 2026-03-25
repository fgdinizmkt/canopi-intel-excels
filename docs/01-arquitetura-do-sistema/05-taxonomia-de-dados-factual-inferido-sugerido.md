# Taxonomia de dados: factual, inferido e sugerido

## Objetivo deste documento
Definir a taxonomia oficial dos tipos de dado da Canopi, para evitar confusão entre informação observada, interpretação do sistema e recomendação operacional.

## Princípio central
A Canopi não deve tratar todos os dados como equivalentes.

O sistema precisa diferenciar com clareza:
- o que é fato
- o que é inferência
- o que é sugestão

Essa separação é obrigatória para que a plataforma seja confiável, explicável e operacionalmente útil.

## Os três tipos de dado

### 1. Dado factual
Dado factual é toda informação observável, registrada ou capturada diretamente de uma fonte.

Características do dado factual:
- vem de fonte objetiva
- pode ser rastreado
- não depende de interpretação do sistema para existir
- deve ser exibido com maior grau de confiança

Exemplos:
- nome da conta
- cargo do contato
- estágio da oportunidade
- data da última interação
- número de reuniões realizadas
- investimento em mídia
- taxa de abertura
- origem do lead
- owner responsável
- canal utilizado
- status de integração

### 2. Dado inferido
Dado inferido é uma leitura produzida a partir da combinação de fatos, contexto e regras analíticas.

Características do dado inferido:
- depende de interpretação
- resulta de lógica, modelo, heurística ou correlação
- deve ser apresentado como leitura do sistema, não como verdade absoluta
- precisa idealmente indicar por que foi gerado

Exemplos:
- conta com alta propensão de resposta
- contato com influência elevada no comitê
- risco de perda de timing
- conta com baixa cobertura relacional
- oportunidade com chance de desaceleração
- canal com baixa eficiência relativa para determinado cluster
- sinal de prontidão comercial
- sinal de risco de estagnação

### 3. Dado sugerido
Dado sugerido é a recomendação operacional gerada a partir de fatos e inferências.

Características do dado sugerido:
- não descreve o que é
- propõe o que fazer
- deve aparecer como recomendação, nunca como imposição
- precisa estar conectado a contexto, prioridade e possível impacto

Exemplos:
- acionar owner da conta
- revisar cadência de outbound
- priorizar contato com maior influência
- ativar campanha específica para cluster semelhante
- criar ação de follow-up em até 3 dias
- revisar cobertura da conta
- investigar queda de engajamento
- escalar risco para liderança

## Regra de ouro
Factual, inferido e sugerido não podem aparecer misturados como se fossem a mesma coisa.

A interface da Canopi deve deixar visível:
- o que foi observado
- o que foi interpretado
- o que está sendo recomendado

## Aplicação por entidade

### Conta
Na entidade Conta, podem coexistir os três tipos:
- factual: segmento, receita, estágio, histórico, owners
- inferido: prioridade, risco, prontidão, potencial
- sugerido: próxima melhor ação, aprofundar relacionamento, revisar cobertura

### Contato
Na entidade Contato, podem coexistir os três tipos:
- factual: nome, cargo, área, interações, presença em reuniões
- inferido: nível de influência, acessibilidade, centralidade relacional
- sugerido: abordar, nutrir, incluir em play, escalar relação

### Sinal
Na entidade Sinal, predominam fatos e inferências:
- factual: evento detectado, variação observada, ausência de atividade, resposta recebida
- inferido: urgência, relevância, risco, oportunidade
- sugerido: ação derivada do sinal

### Ação
Na entidade Ação, predominam sugestões e operação:
- factual: ação criada, owner, prazo, status, origem
- inferido: prioridade da ação, impacto provável
- sugerido: próxima etapa, reforço, escalonamento, ajuste de plano

### Oportunidade
Na entidade Oportunidade:
- factual: valor, estágio, data, responsáveis
- inferido: probabilidade, risco, tendência
- sugerido: avançar, proteger, envolver stakeholder, reativar

### Campanha
Na entidade Campanha:
- factual: orçamento, público, peças, canal, métricas
- inferido: aderência, eficiência relativa, saturação
- sugerido: expandir, pausar, ajustar mensagem, replicar padrão

### Canal
Na entidade Canal:
- factual: volume, investimento, frequência, taxa observada
- inferido: qualidade relativa, adequação por conta ou cluster
- sugerido: reforçar, reduzir, reconfigurar uso

### Owner
Na entidade Owner:
- factual: responsável atribuído, carteira, ações em aberto
- inferido: sobrecarga, nível de cobertura, concentração de risco
- sugerido: redistribuir, priorizar, acompanhar

## Regras de interface

### 1. Separação visual
O produto deve tornar visível a diferença entre:
- dado factual
- leitura inferida
- recomendação sugerida

### 2. Explicabilidade
Sempre que possível, dados inferidos e sugeridos devem responder:
- por que isso apareceu
- com base em quais sinais ou fatos
- qual impacto esperado

### 3. Prioridade de confiança
Na hierarquia de confiança:
1. factual
2. inferido
3. sugerido

Isso não significa que o sugerido é menos útil. Significa apenas que ele deve ser apresentado como proposta de ação, não como fato.

## Implicações para produto
Essa taxonomia deve orientar:
- modelagem de dados
- interface
- motores de recomendação
- explicabilidade do sistema
- priorização operacional
- leitura de risco e oportunidade

## Conclusão
A Canopi só será confiável e acionável se separar com clareza o que é observado, o que é interpretado e o que é recomendado.

Essa distinção deve estar presente em todas as entidades e páginas do sistema.