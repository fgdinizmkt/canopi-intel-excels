# Plano mestre — Configurações módulo a módulo

## Objetivo
Parar a evolução genérica da área de Configurações e passar a executar a frente módulo a módulo, submódulo a submódulo, com aderência real ao produto Canopi.

A regra desta frente passa a ser:
- trabalhar um módulo por vez
- fechar o módulo atual antes de abrir o próximo
- não misturar várias frentes na mesma rodada
- evitar editor genérico sem efeito operacional
- forçar coerência com a Canopi real, seus conectores e seus usos no produto

## Caminho dentro da Canopi
Configurações

## Macroestrutura oficial da frente

### 1. Objetos & CRM
1. Entidades
   1. Conta
   2. Contato
   3. Oportunidade
   4. Campanha
   5. Sinal
   6. Ação
   7. Stakeholder
   8. Owner
2. Source of Truth
3. Pipeline
4. Campos
5. Owners & Stakeholders
6. Matching & Dedupe
7. Hierarquia

### 2. Medição & Conversões
1. Mídia
2. Conversões
3. Atribuição
4. Audiências

### 3. Scores, Sinais & Roteamento
1. Scores
2. Sinais
3. Roteamento

### 4. Plays, ABM & ABX
1. Plays
2. ABM
3. ABX

### 5. Intelligence Exchange & Governança
1. Exchange
2. Learnings
3. Governança
4. Permissões

## Ordem oficial de execução

### Fase A — Objetos & CRM
1. Entidades → Conta
2. Entidades → Contato
3. Entidades → Oportunidade
4. Entidades → Campanha
5. Entidades → Sinal
6. Entidades → Ação
7. Entidades → Stakeholder
8. Entidades → Owner
9. Source of Truth
10. Pipeline
11. Campos
12. Owners & Stakeholders
13. Matching & Dedupe
14. Hierarquia

### Fase B — Medição & Conversões
15. Mídia
16. Conversões
17. Atribuição
18. Audiências

### Fase C — Scores, Sinais & Roteamento
19. Scores
20. Sinais
21. Roteamento

### Fase D — Plays, ABM & ABX
22. Plays
23. ABM
24. ABX

### Fase E — Intelligence Exchange & Governança
25. Exchange
26. Learnings
27. Governança
28. Permissões

## Regra de passagem de módulo
Um módulo só pode ser considerado fechado quando atender os 6 critérios abaixo:
1. configuração crível para o papel real do módulo na Canopi
2. persistência funcional (draft, publish, reload)
3. CTAs principais realmente funcionais
4. aderência ao produto e às integrações relevantes
5. ausência de campos genéricos sem uso real
6. diferença clara entre leitura, resumo e configuração editável

## Regra de escopo por rodada
Cada rodada deve cobrir somente:
- o módulo ou submódulo aprovado
- seus campos, comportamentos e CTAs reais
- sua persistência dentro da infraestrutura existente de settings
- seu efeito esperado dentro da Canopi

Cada rodada não deve cobrir:
- módulos vizinhos
- redesign amplo da página
- várias entidades ao mesmo tempo
- integrações profundas fora do recorte aprovado

## Regra de qualidade por módulo
Todo módulo deve ser especificado e implementado considerando:
- papel operacional na Canopi
- superfícies do produto afetadas
- o que é configurável de verdade
- o que é apenas leitura ou resumo
- campos obrigatórios, derivados, bloqueados e sincronizáveis
- conectores e ferramentas relevantes
- validações mínimas para draft e publish

## Regra específica para Entidades
A subárea Entidades não será mais tratada como editor genérico.
Cada entidade canônica será materializada isoladamente.
A ordem oficial é:
1. Conta
2. Contato
3. Oportunidade
4. Campanha
5. Sinal
6. Ação
7. Stakeholder
8. Owner

Cada entidade só pode avançar para a próxima quando estiver:
- crível
- funcional
- persistida
- com CTAs reais
- sem depender de interpretação genérica do agente

## Estado atual aprovado
A decisão metodológica aprovada é:
- abandonar rounds amplos e genéricos em Entidades
- executar a frente inteira de Configurações módulo a módulo
- começar pela entidade Conta

## Próxima ação aprovada
Abrir a rodada:
Configurações → Objetos & CRM → Entidades → Conta

Todo prompt subsequente deve respeitar este plano mestre até nova revisão explícita.
