# Assistente: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Assistente**.

## Papel da página no sistema
Assistente é a camada de **síntese, explicação e recomendação transversal**.

## O que a página consome
contexto de todas as entidades e páginas.

## O que a página produz
respostas, resumos e sugestões operacionais.

## O que a página não deve ser
ser módulo isolado ou produto separado.

## Estrutura recomendada da tela
1. Caixa de interação
2. Respostas recentes e contexto
3. Atalhos por página
4. Explicabilidade das sugestões

## Filtros principais
- contexto da página
- entidade
- tipo de ajuda

## Ações que o usuário deve conseguir fazer
- perguntar
- resumir
- explicar
- gerar ação
- abrir página relacionada

## Estados vazios que a página precisa prever
- sem contexto suficiente
- sem histórico de perguntas

## Regras operacionais mínimas
- sempre responder com base no contexto atual
- recomendação precisa ser explicável

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
5. definir prompts e casos de uso
6. desenhar UI mínima
7. ligar respostas a ações e páginas

## Ordem prática de implementação
8. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.