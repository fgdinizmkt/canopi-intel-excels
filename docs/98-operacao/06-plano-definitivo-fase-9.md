# 06 - Plano definitivo da Fase 9

## Finalidade do documento
Este documento é a referência canônica para a continuação da **Fase 9 — Data Intelligence & Scale**.

Ele foi aprovado como **norte de execução**, **fonte de consulta recorrente** e **base de atualização da memória operacional** do projeto.

Sempre que houver dúvida sobre prioridade, ordem de execução, responsáveis, critérios de fechamento ou relação entre frente funcional e documentação, este arquivo deve prevalecer como referência primária.

---

## Estado de partida
- **Projeto:** Canopi | intel excels
- **Fase atual:** Fase 9 — Data Intelligence & Scale
- **Branch de referência:** `main`
- **Estado operacional de partida:** build íntegro, repositório sincronizado e último recorte concluído em Inteligência de Performance
- **Situação do próximo marco:** aprovado formalmente nesta sessão

---

## Objetivo desta rodada
Fechar a continuação da Fase 9 com uma sequência enxuta, segura e auditável, respeitando a ordem correta de maturidade do produto:

1. validar a coerência operacional da base atual
2. corrigir inconsistências encontradas
3. consolidar inteligência no `Overview.tsx`
4. preparar a fundação de escala com Supabase
5. registrar tudo de forma canônica na memória operacional

---

## Princípios de execução

### 1. Primeiro coerência, depois expansão
Nenhuma nova camada estratégica deve ser empilhada sobre contagens erradas, vínculos quebrados ou estados inconsistentes.

### 2. A base atual deve se comportar como produto real
O foco imediato não é adicionar volume de feature, e sim garantir que números, sinais, ações, vínculos e métricas reflitam uma operação crível.

### 3. O `Overview.tsx` deve virar a melhor porta de entrada da plataforma
O próximo recorte funcional prioritário não é uma nova área isolada. É a consolidação da inteligência já distribuída no produto dentro da visão geral.

### 4. Supabase entra como fundação, não como migração precipitada
A infraestrutura deve ser preparada progressivamente. O mock atual permanece como fonte operacional até que a camada real esteja pronta para assumir domínios específicos sem regressão.

### 5. Documentação não é efeito colateral
Cada frente relevante precisa deixar rastros canônicos em `status`, `handoff`, `log` e, quando aplicável, em documentação de infraestrutura.

---

## Sequência oficial de execução
A ordem aprovada para a continuação da Fase 9 é:

1. **Fase A — Auditoria de consistência operacional**
2. **Fase B — Correção das inconsistências encontradas**
3. **Fase C — Consolidação do `Overview.tsx`**
4. **Fase D — Revisão visual e de densidade do Overview**
5. **Fase E — Preparação da infraestrutura Supabase**
6. **Fase F — Fechamento documental e memória operacional**

Esta ordem deve ser respeitada. Não antecipar recortes posteriores sem fechamento suficiente dos anteriores.

---

## Fase A — Auditoria de consistência operacional

### Objetivo
Validar se a plataforma está coerente em dados, vínculos, estados, contagens e comportamento, como se estivesse em uso real.

### Escopo de auditoria

#### Dados fundamentais
Auditar obrigatoriamente:
- `src/data/accountsData.ts`
- `src/data/signalsV6.ts`
- `ownersList`
- `stSuggestionsList`
- persistências locais associadas à fila e à sessão

#### Páginas
Auditar obrigatoriamente:
- `src/pages/Overview.tsx`
- `src/pages/Accounts.tsx`
- `src/pages/Actions.tsx`
- `src/pages/Signals.tsx`
- `src/pages/Performance.tsx`
- `src/pages/Contacts.tsx`
- `src/pages/AbmStrategy.tsx`
- `src/pages/ABXOrchestration.tsx`
- `src/pages/Settings.tsx`

### Verificações mínimas obrigatórias
1. total de sinais
2. sinais por severidade
3. sinais por categoria
4. sinais por canal
5. sinais por status (`resolved` vs `unresolved`)
6. coerência entre `Overview` e os dados reais
7. coerência entre `Actions` e `contasMock`
8. ausência de duplicação indevida de ações
9. cálculo correto de aging
10. associação correta entre contas, sinais e ações
11. funcionamento coerente de filtros, badges e métricas derivadas
12. `npm run build` com **Exit 0** ao final

### Saída esperada
- resumo objetivo da auditoria
- lista das inconsistências encontradas
- correções seguras aplicadas imediatamente
- pendências que exigem decisão manual
- resultado final do build

### Responsável principal
**Claude Code**

### Critério de fechamento
A fase só fecha quando as inconsistências críticas identificadas estiverem tratadas ou explicitamente classificadas para decisão manual.

---

## Fase B — Correção das inconsistências encontradas

### Objetivo
Eliminar resíduos operacionais antes da próxima consolidação estratégica.

### Escopo
1. corrigir divergências entre mock, tela e métricas
2. remover duplicações e inconsistências de renderização
3. ajustar derivações incorretas
4. blindar comportamentos defensivos onde houver risco de quebra
5. consolidar owners, referências, estados e nomenclaturas

### Saída esperada
- diff limpo e focal
- build íntegro
- documentação mínima atualizada com o que foi corrigido

### Responsável principal
**Claude Code**

### Critério de fechamento
Nenhuma inconsistência crítica aberta da Fase A permanece sem tratamento ou classificação explícita.

---

## Fase C — Consolidação do `Overview.tsx`

### Recorte aprovado
**Opção B — Consolidação em `Overview.tsx`**

### Objetivo
Transformar o `Overview.tsx` em painel de controle inteligente, sintetizando a inteligência de performance, a inteligência da fila operacional e o estado geral do produto.

### O que deve entrar

#### Inteligência de performance
Aproveitar a lógica já implementada para:
- canais dinâmicos
- conversão por canal
- pipeline influenciado
- leitura factual de eficiência operacional

#### Inteligência de fila
Aproveitar a lógica já implementada para:
- anomalias operacionais
- congestionamento
- ghosting
- baixa vazão
- efeito cascata
- priorização por risco

#### Estado operacional em tempo real
Organizar a entrada do produto para responder rapidamente:
- o que exige atenção agora
- o que melhorou
- o que piorou
- o que está em risco
- o que deve ser priorizado

### Fontes de reaproveitamento prioritárias
- `src/pages/Performance.tsx`
- `src/pages/Actions.tsx`

### Resultado esperado
- `Overview.tsx` mais executivo e mais operacional
- consolidação real do melhor que já existe no produto
- build íntegro
- documentação da decisão e do recorte

### Responsável principal
**Claude Code**

### Critério de fechamento
O `Overview.tsx` deve se tornar a melhor porta de entrada da plataforma, não apenas um resumo visual.

---

## Fase D — Revisão visual e de densidade

### Objetivo
Garantir que a consolidação do `Overview.tsx` preserve clareza, hierarquia e leitura premium.

### Pontos de revisão
1. hierarquia visual
2. densidade de cards e sinais
3. legibilidade dos agrupamentos
4. clareza entre positivo, urgência e risco
5. coerência enterprise da interface

### Responsável preferencial
**Antigravity**, se acionado

### Alternativa
Revisão crítica manual orientada por produto caso Antigravity não participe do ciclo.

### Critério de fechamento
O `Overview.tsx` consolidado deve ser claro, navegável e semanticamente superior ao estado anterior.

---

## Fase E — Preparação da infraestrutura Supabase

### Objetivo
Preparar a fundação para a evolução do mock para backend real, sem migrar toda a plataforma de uma vez.

### Diretriz principal
Supabase não entra nesta rodada como tarefa de migração total.
Ele entra como **fundação de escala**.

### Subfrentes desta fase

#### E1. Preparação de ambiente
1. criar projeto no Supabase
2. definir ambientes `dev`, `staging` e `prod`
3. registrar e proteger variáveis necessárias
4. preparar `.env.local`
5. instalar SDK e, quando necessário, CLI

#### E2. Estrutura inicial do banco
Preparar schema inicial para:
- `owners`
- `accounts`
- `signals`
- `actions`
- `contacts`

Incluir:
- chaves primárias
- relacionamentos mínimos
- bases para RLS
- políticas iniciais seguras
- seed mínimo opcional para teste

#### E3. Camada cliente no projeto
Criar a base de integração com:
- `src/lib/supabaseClient.ts`
- tipagem inicial das entidades principais
- comportamento defensivo para ausência de env vars

#### E4. Camada de API inicial
Preparar rotas para:
- `accounts`
- `signals`
- `actions`
- `contacts`

Mesmo que a primeira rodada seja apenas leitura e escrita básica.

#### E5. Estratégia de entrada gradual
A migração deve acontecer por domínio, não por explosão total.

Ordem sugerida de entrada:
1. `Accounts`
2. `Signals`
3. `Actions`
4. demais domínios posteriormente

#### E6. Validação técnica
Validar:
- leitura real
- escrita real
- fallback para ausência de configuração
- compatibilidade com o estado atual do produto
- `npm run build` íntegro

#### E7. Documentação da infraestrutura
Criar documentação dedicada para registrar:
- variáveis por ambiente
- tabelas
- políticas
- ordem de migração
- modo de execução local

### Responsáveis
- **Coordenação:** usuário
- **Execução técnica:** Claude Code

### Critério de fechamento
A infraestrutura precisa estar pronta para começar a transição, mas sem exigir ainda a substituição integral do mock atual.

---

## Fase F — Fechamento documental e memória operacional

### Objetivo
Fechar cada frente com memória operacional canônica e recuperável.

### Arquivos obrigatórios de atualização
1. `docs/98-operacao/00-status-atual.md`
2. `docs/98-operacao/03-log-de-sessoes.md`
3. `docs/98-operacao/05-handoff-atual.md`
4. `docs/98-operacao/02-decisoes-arquiteturais.md`, quando houver decisão estrutural nova
5. `docs/98-operacao/07-infraestrutura-supabase.md`, quando a fase de infra estiver madura o suficiente

### Regra
Nenhuma fase relevante desta continuação deve ser considerada fechada sem atualização mínima da memória operacional.

---

## Responsáveis por agente

### Claude Code
Responsável por:
1. auditoria técnica
2. correção das inconsistências
3. implementação do recorte funcional do `Overview.tsx`
4. preparação técnica de Supabase
5. apoio à documentação operacional técnica

### ChatGPT
Responsável por:
1. orquestração do plano
2. revisão de coerência estratégica
3. consolidação da memória operacional canônica
4. geração de prompts e direcionamentos por fase

### Usuário
Responsável por:
1. validar direção estratégica
2. aprovar o fechamento de cada fase
3. coordenar prioridade e timing de infraestrutura
4. acionar documentação e oficialização quando necessário

### Antigravity
Responsável preferencial por:
1. revisão visual da consolidação do `Overview.tsx`
2. refinamento de densidade e hierarquia visual
3. manutenção da coerência premium do produto

---

## Ordem prática de execução

### Passo 1
Executar a **Fase A**.

### Passo 2
Aplicar a **Fase B** imediatamente sobre o que a auditoria revelar.

### Passo 3
Com a base auditada, avançar para a **Fase C**.

### Passo 4
Refinar a apresentação via **Fase D**.

### Passo 5
Preparar a infraestrutura via **Fase E**, sem forçar migração total.

### Passo 6
Fechar o ciclo com a **Fase F**.

---

## Critérios de qualidade do ciclo
Antes de qualquer fechamento relevante:
1. `npm run build` deve estar íntegro
2. diff precisa estar coerente com o escopo
3. documentação precisa refletir o estado real
4. não deixar código comentado, TODO ou resíduo gratuito
5. não inventar análise, contexto ou validação não executada

---

## Regra de consulta recorrente
Este documento deve ser consultado sempre que houver qualquer uma das situações abaixo:

1. dúvida sobre o próximo passo aprovado
2. dúvida sobre prioridade entre recortes
3. necessidade de retomar contexto após troca de chat
4. necessidade de registrar nova atualização de memória operacional
5. necessidade de validar se Supabase já virou tarefa ativa ou ainda está em preparação
6. necessidade de conferir responsáveis por frente

---

## Estado aprovado nesta sessão
- O plano acima foi **aprovado formalmente** pelo usuário.
- A primeira frente já foi direcionada ao **Claude Code**.
- Supabase foi mantido **dentro do plano definitivo**, porém **ainda não convertido em tarefa ativa autônoma nesta sessão**.
- Este documento passa a servir como **norte oficial da continuação da Fase 9**.
