# Integrações: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Integrações**.

## Papel da página no sistema
Integrações é a camada de **governança de fontes e conectores**.

## O que a página consome
status de conectores, falhas, mapeamentos e cobertura.

## O que a página produz
visibilidade de saúde das integrações e gaps.

## O que a página não deve ser
virar tela analítica de negócio.

## Estrutura recomendada da tela
1. Lista de integrações
2. Status e saúde
3. Última sincronização
4. Cobertura por módulo
5. Alertas técnicos simples

## Filtros principais
- tipo
- status
- módulo impactado
- criticidade

## Ações que o usuário deve conseguir fazer
- ver detalhe
- reprocessar
- ver cobertura
- abrir configuração

## Estados vazios que a página precisa prever
- sem integrações
- sem falhas
- sem cobertura suficiente

## Regras operacionais mínimas
- mostrar impacto da integração no produto
- não competir com Configurações

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir lista mínima
7. desenhar estados de saúde
8. mostrar impacto por módulo

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