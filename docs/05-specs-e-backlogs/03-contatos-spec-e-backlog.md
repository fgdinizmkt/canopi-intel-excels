# Contatos: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Contatos**.

## Papel da página no sistema
Contatos é a camada de **camada de stakeholders e influência**.

## O que a página consome
dados do contato, interações, conta, sinais, ações, campanhas e owners.

## O que a página produz
visão de influência, acessibilidade e próxima abordagem.

## O que a página não deve ser
substituir Contas ou virar CRM bruto.

## Estrutura recomendada da tela
1. Cabeçalho do contato
2. Bloco de dados relacionais
3. Bloco de influência
4. Bloco de interações e sinais
5. Bloco de ações
6. Bloco de vínculo com ABM/ABX/Outbound

## Filtros principais
- conta
- cargo
- área
- influência
- status de relacionamento
- owner
- ABM/ABX
- última interação

## Ações que o usuário deve conseguir fazer
- abrir perfil
- ver conta
- criar ação
- registrar relacionamento
- mudar owner
- abrir outbound

## Estados vazios que a página precisa prever
- sem contato-chave
- sem interação recente
- sem ação
- sem owner

## Regras operacionais mínimas
- todo contato remete à conta
- influência é inferida
- contatos sem relacionamento recente podem gerar sinal

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
7. definir estrutura de perfil
8. desenhar indicadores
9. criar vínculo forte com conta
10. implementar histórico simples
11. mockar perfis
12. validar fronteira com Outbound

## Ordem prática de implementação
13. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.