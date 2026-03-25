# Sinais: spec operacional e backlog executável

## Objetivo deste documento
Traduzir a documentação-base da Canopi em um pacote prático de execução para a página **Sinais**.

## Papel da página no sistema
Sinais é a camada de **detecção e priorização de risco e oportunidade**.

## O que a página consome
eventos, métricas, ausência de atividade, variações e regras.

## O que a página produz
alertas priorizados e ações derivadas.

## O que a página não deve ser
executar ação ou virar dashboard geral.

## Estrutura recomendada da tela
1. Cabeçalho com volume e distribuição
2. Lista priorizada
3. Painel de detalhe
4. Agrupadores por severidade e origem
5. Bloco de transição para ação

## Filtros principais
- severidade
- tipo
- origem
- entidade
- conta
- owner
- status
- janela de tempo

## Ações que o usuário deve conseguir fazer
- abrir sinal
- reconhecer
- descartar
- virar ação
- abrir conta/contato
- reclassificar

## Estados vazios que a página precisa prever
- sem sinais
- sem sinais críticos
- sem sinais do filtro
- sem origem definida

## Regras operacionais mínimas
- sinal precisa apontar entidade
- sinal crítico deve sugerir ou gerar ação
- sinal descartado precisa de rastreabilidade

## Critério de pronto para V1
- objetivo visível e compreensível
- blocos principais estáveis
- filtros mínimos definidos
- estados vazios cobertos
- relação clara com entidades-base
- fronteira clara com páginas vizinhas
- dados mock ou estrutura suficiente para navegação coerente

## Backlog executável
6. definir taxonomia
7. desenhar cards/lista
8. criar severidade e urgência
9. implementar ponte com ações
10. mockar sinais
11. validar sobreposição com Inteligência Cruzada

## Ordem prática de implementação
12. revisar o doc da página já existente em `docs/03-paginas`
2. alinhar este spec com a tela atual ou com a ausência dela
3. definir dados mock mínimos
4. desenhar estrutura visual
5. implementar blocos principais
6. validar fronteiras com outras páginas
7. revisar coerência com a V1 da Canopi

## Observação final
Este documento existe para reduzir improviso. Ele transforma a documentação-base em uma trilha prática de execução.