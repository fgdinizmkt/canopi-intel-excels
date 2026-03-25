# Orquestração ABX: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Orquestração ABX**.

## Papel da página no sistema
Orquestração ABX é a camada de **coordenação de continuidade, relacionamento e expansão**.

## O que a página consome
contas, contatos, histórico, sinais, ações e oportunidades.

## O que a página produz
plays por momento da conta e expansão.

## O que a página não deve ser
virar módulo completo de CS ou duplicar ABM.

## Estrutura recomendada da tela
1. Resumo da carteira ABX
2. Momento da conta
3. Riscos e oportunidades de expansão
4. Plays de continuidade
5. Contatos e owners relacionados

## Filtros principais
- momento da conta
- risco
- expansão
- owner
- segmento

## Ações que o usuário deve conseguir fazer
- abrir conta
- ver contatos
- criar ação
- ajustar play
- abrir oportunidade

## Estados vazios que a página precisa prever
- sem carteira ABX
- sem sinais relacionais

## Regras operacionais mínimas
- ABX usa as mesmas entidades-base com ótica diferente
- não absorver gestão completa de CS

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir jornadas
7. desenhar visão da carteira
8. modelar sinais relacionais
9. validar fronteira com Contas e Oportunidades

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