# Estratégia ABM: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Estratégia ABM**.

## Papel da página no sistema
Estratégia ABM é a camada de **planejamento account-based para aquisição**.

## O que a página consome
contas, fit, prontidão, sinais, campanhas e clusters.

## O que a página produz
listas prioritárias, segmentação e plays ABM.

## O que a página não deve ser
duplicar Contas ou substituir canais.

## Estrutura recomendada da tela
1. Resumo da carteira ABM
2. Segmentação e clusters
3. Prioridade e prontidão
4. Plays e hipóteses
5. Conexão com mídia, orgânico e outbound

## Filtros principais
- tier
- segmento
- prioridade
- prontidão
- owner
- cluster

## Ações que o usuário deve conseguir fazer
- classificar contas
- abrir conta
- abrir canais
- criar ação
- ajustar play

## Estados vazios que a página precisa prever
- sem contas ABM
- sem critérios de segmentação

## Regras operacionais mínimas
- ABM opera sobre entidades-base
- não criar entidade paralela

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir indicadores de fit
7. desenhar visão de clusters
8. estruturar plays
9. validar integração com canais e ações

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