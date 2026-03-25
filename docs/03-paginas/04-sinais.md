# Sinais

## Objetivo da página
Detectar, organizar e priorizar mudanças de contexto, riscos, oportunidades e anomalias que exigem atenção na operação.

## Papel no sistema
A página de Sinais é a principal camada de leitura e detecção da Canopi.

Ela existe para transformar informação dispersa em alertas operacionais mais claros.

## Perguntas que a página deve responder
- O que mudou e merece atenção?
- Quais sinais indicam risco?
- Quais sinais indicam oportunidade?
- Qual conta ou contato foi impactado?
- O que é ruído e o que merece ação?
- Quais sinais ainda não geraram consequência operacional?

## O que a página consome
- eventos e mudanças observadas
- dados de CRM
- dados de campanhas e canais
- histórico de conta e contato
- regras de detecção
- contexto de oportunidade
- comportamento operacional

## O que a página produz
- alertas priorizados
- leitura de risco e oportunidade
- agrupamento de sinais por entidade
- gatilhos para geração de ação
- suporte à priorização operacional

## Entidades principais
- Sinal
- Conta
- Contato
- Ação
- Canal
- Campanha
- Oportunidade

## Tipos de dado predominantes
- factual: evento observado, ausência de atividade, variação, resposta, mudança detectada
- inferido: relevância, urgência, risco, oportunidade, impacto provável
- sugerido: ação recomendada, owner sugerido, prazo sugerido, investigação sugerida

## Estrutura recomendada da página

### 1. Feed priorizado de sinais
Lista central com sinais organizados por prioridade, urgência ou relevância.

Cada sinal deve mostrar:
- título do sinal
- conta e/ou contato associado
- categoria
- urgência
- impacto estimado
- origem
- data
- status de tratamento

### 2. Filtros principais
- risco ou oportunidade
- conta
- contato
- owner
- canal
- origem
- status
- criticidade
- período

### 3. Detalhe do sinal
Ao abrir um sinal, o usuário deve ver:
- descrição do evento
- contexto afetado
- por que isso importa
- evidências factuais
- leitura inferida
- ação sugerida ou ação já criada
- owner relacionado, se houver

## Relações mais importantes
- um Sinal pode estar ligado a uma Conta
- um Sinal pode estar ligado a um Contato
- um Sinal pode estar ligado a uma Campanha ou Canal
- um Sinal pode influenciar uma Oportunidade
- um Sinal pode gerar uma ou mais Ações

## Regras de produto
- sinal factual e leitura inferida precisam estar distinguíveis
- a página deve facilitar priorização, não gerar ruído
- sinais relevantes devem apontar para consequência operacional
- sinais tratados e não tratados devem ser diferenciados

## O que a página não deve fazer
- virar dashboard genérico
- substituir Ações
- absorver profundidade de Conta ou Contato
- exibir todos os eventos brutos sem curadoria

## Relação com ABM e ABX
- ABM pode consumir sinais de prontidão, aderência, cobertura e ativação
- ABX pode consumir sinais de risco, expansão, relacionamento e continuidade
- Inteligência Cruzada pode reaproveitar padrões observados a partir de sinais

## Critérios de qualidade da V1
A página está boa na V1 se:
1. distingue bem ruído de prioridade
2. conecta sinal com entidade afetada
3. ajuda a decidir o que merece ação
4. explica minimamente por que o sinal apareceu
5. não exige leitura excessiva para gerar entendimento

## Resumo
A página de Sinais é a camada de detecção da Canopi. Ela transforma mudanças e evidências em leitura operacional priorizada.
