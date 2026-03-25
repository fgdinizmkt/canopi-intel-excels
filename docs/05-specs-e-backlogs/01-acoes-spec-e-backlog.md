# Ações: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Ações**.

## Papel da página no sistema
Ações é a camada de **consequência operacional da Canopi**.

## O que a página consome
Sinais, Contas, Contatos, ABM, ABX, canais e inputs manuais.

## O que a página produz
fila priorizada com owner, prazo, status e próxima etapa.

## O que a página não deve ser
virar lista genérica de tarefas ou substituir Sinais, Contas ou CRM.

## Estrutura recomendada da tela
1. Cabeçalho com métricas e filtros rápidos
2. Lista principal de ações
3. Painel lateral de detalhe
4. Visão por status
5. Bloco de ações sugeridas

## Filtros principais
- prioridade
- status
- owner
- prazo
- origem
- entidade
- camada estratégica
- canal

## Ações que o usuário deve conseguir fazer
- criar
- editar
- atribuir owner
- mudar prioridade
- alterar prazo
- concluir
- adiar
- descartar
- escalar
- abrir conta/contato/sinal

## Estados vazios que a página precisa prever
- sem ações
- sem ações críticas
- sem ações do filtro
- sem owner
- sem prazo

## Regras operacionais mínimas
- ações de sinais críticos sobem prioridade
- ações sem owner ou prazo entram em exceção
- ações vencidas ganham destaque
- ações ligadas a contas prioritárias recebem peso adicional

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir modelo de dados
7. desenhar layout
8. criar badges
9. implementar filtros
10. conectar links contextuais
11. definir estados vazios
12. montar dados mock
13. validar ação manual vs sugerida

## Ordem prática de implementação
14. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.