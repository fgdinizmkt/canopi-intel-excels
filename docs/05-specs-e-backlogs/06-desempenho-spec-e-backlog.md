# Desempenho: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Desempenho**.

## Papel da página no sistema
Desempenho é a camada de **análise consolidada de resultado e eficiência**.

## O que a página consome
métricas de canais, conversão, funil e impacto em contas.

## O que a página produz
diagnóstico comparativo e tendências.

## O que a página não deve ser
substituir páginas de canal ou virar BI enciclopédico.

## Estrutura recomendada da tela
1. KPIs de desempenho
2. Quebras por canal/segmento/owner
3. Tendências temporais
4. Bloco de explicação de impacto
5. Atalhos para ações corretivas

## Filtros principais
- tempo
- canal
- segmento
- owner
- ABM/ABX

## Ações que o usuário deve conseguir fazer
- comparar períodos
- abrir canais
- gerar ação corretiva
- abrir contas impactadas

## Estados vazios que a página precisa prever
- sem volume suficiente
- sem integração de métricas

## Regras operacionais mínimas
- desempenho deve responder o que mudou e onde agir
- quando possível apontar relação com sinais e ações

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir KPIs núcleo
7. desenhar visualizações mínimas
8. ligar impacto a contas e ações
9. mockar cenários

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