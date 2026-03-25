# Ações

## Objetivo da página
Centralizar a consequência operacional da Canopi, organizando tudo o que precisa ser feito a partir de sinais, contexto de conta, estratégia e execução de canais.

## Papel no sistema
A página de Ações é o hub operacional da plataforma.

Ela existe para transformar leitura em execução, conectando:
- contexto
- prioridade
- responsável
- prazo
- status
- origem da ação

## Perguntas que a página deve responder
- O que precisa ser feito agora?
- Qual ação é mais prioritária?
- De onde essa ação veio?
- Quem é o responsável?
- Em qual conta, contato ou oportunidade essa ação impacta?
- O que está atrasado, parado ou sem owner?
- Quais ações são recomendadas e quais já foram executadas?

## O que a página consome
- sinais gerados pelo sistema
- contexto de conta
- contexto de contato
- oportunidades
- campanhas e canais
- owners e responsáveis
- regras de priorização
- ações manuais criadas pelo usuário
- ações sugeridas pelo sistema

## O que a página produz
- fila operacional priorizada
- plano de execução por owner
- visão de backlog
- visão de ações atrasadas
- visão de ações por conta, contato, canal ou estratégia
- consequência operacional derivada de sinais e inferências

## Entidades principais
- Ação
- Conta
- Contato
- Sinal
- Owner
- Oportunidade

## Tipos de dado predominantes
- factual: ação criada, prazo, owner, status, origem
- inferido: prioridade, impacto provável, urgência relativa
- sugerido: próxima ação, escalonamento, follow-up, reforço de plano

## Estrutura recomendada da página

### 1. Visão superior
Bloco inicial com leitura rápida de operação:
- ações abertas
- ações atrasadas
- ações sem owner
- ações críticas
- ações concluídas recentemente

### 2. Lista principal de ações
Lista central com filtros e ordenação.

Cada ação deve exibir no mínimo:
- título da ação
- conta associada
- contato associado, se existir
- origem da ação
- prioridade
- owner
- prazo
- status
- tag de contexto, quando houver

### 3. Painel de filtros
Filtros mínimos da V1:
- status
- prioridade
- owner
- conta
- contato
- origem
- canal
- estratégia relacionada
- prazo

### 4. Detalhe lateral ou modal
Ao abrir uma ação, o usuário deve ver:
- descrição
- contexto da ação
- por que ela existe
- entidade associada
- origem do sinal ou recomendação
- owner
- prazo
- histórico básico
- próximas etapas

## Relações mais importantes
- uma Ação pode nascer de um Sinal
- uma Ação pode estar ligada a uma Conta
- uma Ação pode estar ligada a um Contato
- uma Ação pode apoiar uma Oportunidade
- uma Ação deve ter um Owner
- uma Ação pode estar ligada a um Canal ou Campanha

## Regras de produto
- toda ação deve ter contexto claro
- toda ação deve ter owner ou estar explicitamente sem owner
- ações sugeridas devem se diferenciar de ações manuais
- a página não deve virar lista genérica de tarefas sem inteligência
- a priorização precisa ser visível e explicável

## O que a página não deve fazer
- substituir Conta ou Contato como profundidade de contexto
- virar ferramenta completa de project management
- absorver toda a análise de sinais
- funcionar como backlog sem relação com o sistema

## Relação com ABM e ABX
- ABM pode gerar ações ligadas a ativação, cobertura, campanha e influência
- ABX pode gerar ações ligadas a continuidade, relacionamento, expansão e proteção de conta
- a página de Ações deve receber contexto estratégico, mas não ser a estratégia em si

## Critérios de qualidade da V1
A página está boa na V1 se:
1. deixar claro o que fazer agora
2. mostrar contexto da ação sem excesso de navegação
3. permitir priorização real
4. conectar ação com conta, contato e sinal
5. evitar sensação de lista cega

## Resumo
A página de Ações é a principal camada de consequência operacional da Canopi. Ela conecta leitura, prioridade e execução em um único fluxo acionável.
