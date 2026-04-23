# Plano de trabalho — Configurações / Objetos & CRM / Entidades (uma por vez)

## Objetivo
Sair da implementação genérica da subpágina de Entidades e passar a materializar cada entidade canônica da Canopi de forma isolada, crível e operacional.

A regra desta frente passa a ser:
- trabalhar uma entidade por vez
- fechar a entidade atual antes de abrir a próxima
- não misturar múltiplas entidades no mesmo recorte
- não tratar a subpágina como editor genérico de metadados
- forçar aderência ao produto real e aos conectores/ferramentas relevantes

## Caminho dentro da Canopi
Configurações → Objetos & CRM → Entidades

## Sequência oficial de execução
1. Conta
2. Contato
3. Oportunidade
4. Campanha
5. Sinal
6. Ação
7. Stakeholder
8. Owner

## Regra de passagem de fase
Uma entidade só pode ser considerada fechada quando atender os 5 critérios abaixo:
1. configuração crível para o papel real da entidade na Canopi
2. persistência funcional (draft, publish, reload)
3. CTAs principais realmente funcionais
4. integração conceitual clara com ferramentas/fontes relevantes
5. ausência de campos genéricos sem uso ou sem aderência ao produto

## Escopo por entidade
Cada rodada deve cobrir somente:
- bloco comum da entidade, quando aplicável
- bloco específico da entidade
- comportamento operacional da entidade
- regras de edição, bloqueio, leitura e resumo
- persistência real da entidade dentro do bloco `objects_entities`

Cada rodada não deve cobrir:
- outras entidades
- outras subpáginas de Objetos & CRM
- redesign amplo da página
- integrações profundas fora do recorte da entidade atual

## Critérios de qualidade para cada entidade
Cada entidade deve ser especificada e implementada considerando:
- qual seu papel operacional na Canopi
- onde aparece no produto
- o que pode ou não ser configurado nela
- o que é somente leitura / resumo
- o que é configurável de verdade
- quais conectores/ferramentas afetam sua configuração
- quais campos são obrigatórios, derivados, bloqueados ou sincronizáveis

## Entidade 1 — Conta
### Objetivo da rodada
Transformar Conta na primeira entidade realmente configurável dentro de:
Configurações → Objetos & CRM → Entidades

### Foco obrigatório
Conta deve deixar de ser tratada como schema genérico e passar a refletir uma configuração operacional crível para:
- Salesforce
- RD Station
- HubSpot
- Canopi

### O que a rodada de Conta precisa resolver
- identidade operacional da conta
- chaves e identificadores principais
- origem e prioridade de dados por ferramenta
- comportamento da conta dentro da Canopi
- relação da conta com contatos, oportunidades, campanhas, sinais e ações
- governança mínima da conta dentro do bloco de entidades

### O que não entra na rodada de Conta
- implementação detalhada de Contato
- implementação detalhada de Oportunidade
- regras profundas de pipeline
- matching completo
- hierarquia profunda
- source of truth detalhado de todas as entidades

Esses pontos podem aparecer apenas como resumo ou referência quando indispensáveis para a Conta.

## Estrutura padrão das próximas rodadas
Cada entidade futura deve seguir a mesma disciplina:
1. definição de papel da entidade
2. especificação detalhada da entidade
3. implementação funcional focada
4. validação de persistência e CTAs
5. revisão crítica antes de abrir a próxima

## Próxima ação aprovada
Abrir a rodada:
Configurações → Objetos & CRM → Entidades → Conta

A partir daqui, todo prompt para agente deve trabalhar somente a entidade Conta até ela ficar crível e funcional.
