# Visão Geral: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Visão Geral**.

## Papel da página no sistema
Visão Geral é a camada de **cockpit executivo-operacional**.

## O que a página consome
KPIs, sinais, ações, desempenho, contas prioritárias e integrações.

## O que a página produz
leitura rápida do estado do sistema.

## O que a página não deve ser
substituir páginas profundas.

## Estrutura recomendada da tela
1. KPIs principais
2. Alertas prioritários
3. Contas em atenção
4. Resumo operacional de ações
5. Atalhos para módulos estratégicos

## Filtros principais
- janela de tempo
- owner
- segmento
- camada estratégica

## Ações que o usuário deve conseguir fazer
- abrir contas
- abrir sinais
- abrir ações
- abrir desempenho

## Estados vazios que a página precisa prever
- sem dados suficientes
- sem alertas relevantes

## Regras operacionais mínimas
- todo bloco deve apontar para uma página mais profunda
- não repetir análises longas de outros módulos

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir KPIs
7. desenhar grade de cards
8. conectar atalhos
9. validar equilíbrio executivo-operacional

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