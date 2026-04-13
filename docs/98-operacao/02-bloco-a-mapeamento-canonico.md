# Bloco A — Mapeamento Canônico da Espinha Dorsal Operacional

**Status:** Ativo  
**Dependência:** `01-plano-canonico-seed-handoff-obrigatorio.md`  
**Cenário oficial:** Parcial  
**Objetivo:** definir o mapeamento canônico entre a base semântica atual do repo e as tabelas operacionais do Supabase

---

## 1. Papel deste documento

Este documento existe para tirar ambiguidade do Bloco A.

Ele define:

- quais tabelas fazem parte da espinha dorsal operacional
- qual é a fonte de verdade de cada uma
- como cada entidade nasce
- como manter coerência entre elas
- o que é obrigatório antes de materializar seed reaplicável

Sem este documento, o seed corre risco de virar apenas flatten técnico sem coerência de produto.

---

## 2. Escopo do Bloco A

As tabelas oficiais do Bloco A são:

- `accounts`
- `contas`
- `contacts`
- `signals`
- `actions`
- `oportunidades`

Este bloco não inclui ainda:

- `integrations`
- `source_snapshots`
- `account_source_coverage`
- `sync_status`
- `campaigns`
- `interactions`
- `play_recommendations`

Essas entram apenas nos blocos seguintes.

---

## 3. Fonte de verdade atual

A fonte de verdade canônica inicial para o Bloco A é:

- `src/data/accountsData.ts`

Mais especificamente:

- `contasMock` é a base semântica principal de contas
- `initialActions` é a base semântica principal de ações

Até existir uma camada superior de seed canônico, nenhum seed oficial deve ignorar essa origem.

---

## 4. Entidade-mãe

A entidade-mãe do Bloco A é a **conta**.

### Invariantes obrigatórios

1. toda entidade derivada precisa conseguir apontar para uma conta real
2. o `id` da conta precisa ser estável
3. o `slug` da conta precisa ser estável
4. `nome`, `vertical`, `segmento`, `ownerPrincipal` e `statusGeral` precisam ser semanticamente coerentes entre telas
5. uma conta não pode existir no seed com dois IDs diferentes
6. um contato, sinal, ação ou oportunidade não pode existir sem reconciliação explícita com conta

---

## 5. Mapeamento canônico por tabela

## 5.1 `accounts`

### Papel

Camada operacional resumida da conta.

### Fonte

`contasMock[]`

### Deve conter

- `id`
- `slug`
- `nome`
- `dominio`
- `vertical`
- `segmento`
- `porte`
- `localizacao`
- `ownerPrincipal`
- `etapa`
- `tipoEstrategico`
- `potencial`
- `risco`
- `prontidao`
- `coberturaRelacional`
- `ultimaMovimentacao`
- `atividadeRecente`
- `playAtivo`
- `statusGeral`
- `oportunidadePrincipal`
- `possuiOportunidade`
- `proximaMelhorAcao`
- `resumoExecutivo`
- `inteligencia`
- `leituraFactual`
- `leituraInferida`
- `leituraSugerida`
- `historico`
- `tecnografia`
- `canaisCampanhas`

### Regra

`accounts` não deve tentar concentrar tudo da plataforma.
Ela deve ser a camada de leitura operacional resumida.

---

## 5.2 `contas`

### Papel

Camada estratégica de conta para ABM e ABX.

### Fonte

`contasMock[]`

### Deve conter no mínimo

- `id`
- `slug`
- `nome`
- `icp`
- `crm`
- `vp`
- `ct`
- `ft`
- `abm`
- `abx`

### Regra

`contas` existe para preservar a camada estratégica e de score da conta.
Ela não substitui `accounts`; ela complementa.

---

## 5.3 `contacts`

### Papel

Flatten operacional dos contatos por conta.

### Fonte

`conta.contatos[]` em `contasMock[]`

### Cada linha precisa derivar de

- `contact.id`
- `contact.nome`
- `contact.cargo`
- `contact.area`
- `contact.senioridade`
- `contact.papelComite`
- `contact.forcaRelacional`
- `contact.receptividade`
- `contact.acessibilidade`
- `contact.status`
- `contact.classificacao`
- `contact.influencia`
- `contact.potencialSucesso`
- `contact.scoreSucesso`
- `contact.ganchoReuniao`
- `contact.liderId`
- `contact.owner`
- `contact.observacoes`
- `contact.historicoInteracoes`
- `contact.proximaAcao`
- `account.id` como `accountId`
- `account.nome` como `accountName`

### Regra

Nenhum contato pode nascer sem `accountId` e `accountName` reconciliados.

---

## 5.4 `signals`

### Papel

Flatten operacional dos sinais da plataforma.

### Fonte

`conta.sinais[]` em `contasMock[]`

### Mapeamento mínimo esperado

- `sinal.id` -> `id`
- `sinal.titulo` -> `title`
- `sinal.tipo` -> `type`
- `sinal.impacto` -> `severity`
- categoria derivada da origem do sinal
- `conta.nome` -> `account`
- `conta.id` -> `accountId`
- `sinal.owner` -> `owner`
- confiança derivada do cenário
- canal e source quando aplicável
- `sinal.contexto` -> `context`
- causa provável derivada ou vazia quando não houver lastro
- `sinal.recomendacao` -> `recommendation`
- timestamp coerente com `sinal.data`

### Regra

`signals` não pode inventar uma semântica paralela.
Se a base não sustenta um campo, usar valor defensivo claro, não fantasia silenciosa.

---

## 5.5 `actions`

### Papel

Fila operacional global consolidada.

### Fonte

`initialActions[]`

### Regra

`actions` não deve ser gerada a partir de cada `conta.acoes` neste primeiro momento.
A base canônica inicial da fila operacional global é `initialActions`.

### Campos obrigatórios

Tudo que hoje já estrutura `ActionItem`:

- `id`
- `priority`
- `category`
- `channel`
- `status`
- `title`
- `description`
- `accountName`
- `accountContext`
- `origin`
- `relatedSignal`
- `ownerName`
- `suggestedOwner`
- `ownerTeam`
- `slaText`
- `slaStatus`
- `expectedImpact`
- `nextStep`
- `dependencies`
- `evidence`
- `history`
- `projectObjective`
- `projectSuccess`
- `projectSteps`
- `buttons`
- `sourceType`
- `playbookName`
- `playbookRunId`
- `playbookStepId`
- `relatedAccountId`
- `resolutionPath`
- `executionNotes`
- `learnings`
- `createdAt`

### Regra adicional

Toda `action.relatedAccountId` precisa apontar para uma conta existente no seed oficial, ou ser explicitamente marcada como exceção técnica documentada.

---

## 5.6 `oportunidades`

### Papel

Flatten operacional das oportunidades por conta.

### Fonte

`conta.oportunidades[]` em `contasMock[]`

### Cada linha deve carregar

- `oportunidade.id`
- `oportunidade.nome`
- `oportunidade.etapa`
- `oportunidade.valor`
- `oportunidade.owner`
- `oportunidade.risco`
- `oportunidade.probabilidade`
- `oportunidade.historico`
- `conta.id`
- `conta.slug`
- `conta.nome`

### Regra

Nenhuma oportunidade pode existir sem reconciliação de conta.

---

## 6. Dicionários fixos obrigatórios do Bloco A

Antes da materialização do seed, precisamos congelar estes dicionários:

- owners oficiais
- canais oficiais
- origens oficiais
- severidades oficiais
- categorias de sinal oficiais
- categorias de ação oficiais
- tipos estratégicos oficiais
- status operacionais oficiais
- níveis de confiança oficiais

Sem isso, a base tende a divergir entre tabelas.

---

## 7. Regras de cenário para o Bloco A

O cenário oficial continua sendo o **Parcial**.

No Bloco A, isso significa:

- algumas contas com cobertura forte
- algumas contas reconciliadas, mas ainda rasas
- algumas ações ligadas a contas órfãs já reconciliadas
- sinais suficientes para dar vida ao cockpit
- oportunidades suficientes para dar vida ao pipeline
- sem tentar simular perfeição de integração nesta fase

---

## 8. Artefato técnico esperado após este documento

A próxima materialização oficial deve resultar em uma camada de geração de seed no repo, e não em seed manual avulso.

Artefatos esperados na sequência:

- um ponto de entrada de seed no repo
- uma estrutura de cenário canônico
- builders para cada tabela do Bloco A
- saída reaplicável em SQL ou JSON

---

## 9. Critério de encerramento do Bloco A

O Bloco A só pode ser considerado encerrado quando:

1. as seis tabelas tiverem fonte clara e coerente
2. a geração não depender mais de colagem manual
3. a plataforma conseguir ler esse seed sem colapsar semântica entre telas
4. ações, sinais, contatos e oportunidades apontarem para contas reais
5. `accounts` e `contas` estiverem reconciliadas como duas camadas complementares, não concorrentes

---

## 10. Próxima ação oficial

A próxima ação oficial após este documento é:

**criar a estrutura de diretório e o ponto de entrada da futura camada de seed para o Bloco A.**
