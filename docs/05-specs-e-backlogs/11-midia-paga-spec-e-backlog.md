# Mídia Paga: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Mídia Paga**.

## Papel da página no sistema
Mídia Paga é a camada de **leitura do canal pago e impacto em contas**.

## O que a página consome
campanhas, investimento, públicos, conversões e contas.

## O que a página produz
diagnóstico de eficiência e ajustes prioritários.

## O que a página não deve ser
substituir ads manager.

## Estrutura recomendada da tela
1. KPIs de mídia
2. Campanhas e públicos
3. Contas impactadas
4. Eficiência relativa
5. Ações sugeridas

## Filtros principais
- tempo
- canal
- campanha
- público
- conta
- segmento

## Ações que o usuário deve conseguir fazer
- abrir campanha
- abrir conta
- criar ação
- comparar períodos

## Estados vazios que a página precisa prever
- sem campanhas pagas
- sem dados de atribuição

## Regras operacionais mínimas
- ligar mídia a contas sempre que possível
- não centralizar toda lógica de campanha

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir KPIs mínimos
7. desenhar visão de campanhas
8. integrar leitura com ABM e Contas

## Ordem prática de implementação
9. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.