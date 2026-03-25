# Inteligência Cruzada: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Inteligência Cruzada**.

## Papel da página no sistema
Inteligência Cruzada é a camada de **reaproveitamento de padrões entre ABM e ABX**.

## O que a página consome
histórico, resultados, sinais, plays e contextos comparáveis.

## O que a página produz
hipóteses e recomendações reaproveitáveis.

## O que a página não deve ser
executar operação ou virar dashboard genérico.

## Estrutura recomendada da tela
1. Padrões identificados
2. Recomendações cruzadas
3. Casos comparáveis
4. Impactos observados
5. Atalhos para ações e estratégias

## Filtros principais
- origem do padrão
- ABM/ABX
- segmento
- resultado
- entidade

## Ações que o usuário deve conseguir fazer
- abrir caso
- aplicar recomendação
- criar ação
- abrir ABM/ABX

## Estados vazios que a página precisa prever
- sem padrões consistentes
- sem histórico suficiente

## Regras operacionais mínimas
- sempre explicitar origem do aprendizado
- não disputar papel com Sinais ou Ações

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir formato dos padrões
7. desenhar cards comparativos
8. ligar recomendações a ações
9. validar clareza entre insight e operação

## Ordem prática de implementação
10. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.