# Outbound: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Outbound**.

## Papel da página no sistema
Outbound é a camada de **leitura e execução da abordagem ativa**.

## O que a página consome
contatos, cadências, respostas, sinais, contas e owners.

## O que a página produz
priorização de abordagem, follow-ups e ajustes.

## O que a página não deve ser
virar CRM comercial completo.

## Estrutura recomendada da tela
1. Resumo da operação outbound
2. Cadências e status
3. Contatos e contas prioritárias
4. Respostas e sinais
5. Ações derivadas

## Filtros principais
- cadência
- status
- owner
- conta
- contato
- resposta
- prioridade

## Ações que o usuário deve conseguir fazer
- abrir contato
- abrir conta
- criar ação
- mudar cadência
- registrar resposta

## Estados vazios que a página precisa prever
- sem cadências
- sem contatos ativos
- sem respostas recentes

## Regras operacionais mínimas
- Outbound deve sempre remeter a Conta e Contato
- não absorver toda a operação de vendas

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir visão de cadências
7. desenhar status e respostas
8. ligar outbound a sinais e ações

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