# Contas: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Contas**.

## Papel da página no sistema
Contas é a camada de **profundidade principal da empresa**.

## O que a página consome
dados cadastrais, sinais, ações, oportunidades, campanhas e owners.

## O que a página produz
visão operacional e estratégica por conta.

## O que a página não deve ser
absorver toda a execução ou substituir Contatos, ABM e ABX.

## Estrutura recomendada da tela
1. Cabeçalho da conta
2. Bloco de contexto da empresa
3. Bloco de sinais
4. Bloco de ações
5. Bloco de contatos-chave
6. Bloco de oportunidades
7. Bloco de relação com ABM/ABX

## Filtros principais
- segmento
- tier
- status
- owner
- risco
- prontidão
- ABM/ABX
- oportunidade

## Ações que o usuário deve conseguir fazer
- ver perfil
- editar metadados
- abrir contatos
- abrir ações
- abrir sinais
- abrir ABM
- abrir ABX

## Estados vazios que a página precisa prever
- sem sinais
- sem contatos mapeados
- sem ações
- sem oportunidade
- sem owner

## Regras operacionais mínimas
- conta sempre remete a contatos, sinais e ações
- classificação ABM/ABX é camada
- contas sem owner ou contato-chave entram em atenção

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
8. definir card/tabela
9. desenhar perfil 360
10. estruturar blocos
11. separar factual/inferido/sugerido
12. criar navegação contextual
13. mockar estados
14. validar fronteira estratégica

## Ordem prática de implementação
15. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.