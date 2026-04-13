# Plano Canônico Fixo — Seed Operacional Coerente do Canopi

**Status:** Ativo  
**Natureza:** Leitura obrigatória para handoff  
**Prioridade:** Máxima enquanto a fase de seed canônico estiver aberta  
**Escopo:** Supabase + coerência estrutural de dados fictícios + estabilidade de leitura da plataforma

---

## 1. Objetivo desta fase

Construir uma base fictícia canônica, coerente e reutilizável para o Canopi, de forma que a plataforma deixe de depender apenas do mock local e passe a ter um seed estável, crível e consistente no Supabase.

Esta fase **não existe para otimizar UI** nem para expandir a plataforma indefinidamente.

Ela existe para resolver um problema estrutural:

- a plataforma precisa de uma base de dados fictícia coerente
- a coerência precisa atravessar todas as telas
- ABM, ABX, cockpit, sinais, ações, contas, integrações e confiança precisam falar a mesma língua
- o seed precisa ser reproduzível, auditável e entendível em handoff

---

## 2. Estado exato de início desta fase

Esta fase começa **somente a partir do seguinte estado**:

1. Deploy público mock da plataforma funcionando na Vercel
2. Ambiente demo público sem Supabase ativo
3. `accounts`, `signals`, `actions` e `contacts` já corrigidas no Supabase para respeitar os nomes de colunas esperados pelo código
4. fallback mock restaurado e funcional
5. necessidade formal reconhecida de sair do mock puro para um seed coerente no Supabase

Enquanto esse estado não existir, esta fase ainda não começou de fato.

---

## 3. Estado exato de encerramento desta fase

Esta fase **só termina** quando todos os critérios abaixo forem verdadeiros ao mesmo tempo:

1. Existe uma fonte de verdade canônica para o seed
2. Existe um mecanismo de geração do seed no repo, e não apenas inserts soltos no SQL Editor
3. O cenário oficial inicial do seed está definido e documentado
4. As tabelas-base da plataforma já podem ser populadas de forma coerente a partir dessa fonte de verdade
5. O seed pode ser reaplicado sem reinvenção manual
6. A plataforma consegue ler essa base sem quebrar semântica entre telas
7. O handoff desta fase pode ser feito sem contexto oral adicional

Se qualquer um desses pontos faltar, a fase ainda está aberta.

---

## 4. Regra principal desta fase

**Nada de seed manual e avulso como fonte de verdade.**

É permitido usar o SQL Editor para testes pontuais, validações e correções de schema.

Não é permitido tratar inserts avulsos como versão oficial da base.

A versão oficial da base precisa nascer do repo.

---

## 5. Fonte de verdade canônica

A fonte de verdade inicial desta fase é:

- `src/data/accountsData.ts`

Ela já contém a base semântica mais rica da plataforma neste momento, incluindo:

- `contasMock`
- `initialActions`
- estrutura de conta
- contatos
- oportunidades
- sinais
- ações
- canais e campanhas
- blocos `abm`
- blocos `abx`
- inteligência, tecnografia e histórico

Enquanto não houver uma camada melhor e mais explícita de seed canônico, este arquivo é a melhor base operacional existente.

---

## 6. Cenário oficial inicial

O cenário oficial inicial desta fase é:

**Cenário Parcial**

### Definição

A plataforma deve nascer com uma base fictícia que simule uma operação plausível, porém imperfeita.

Ela não deve parecer:

- perfeita demais
- totalmente limpa
- 100% conectada
- artificialmente otimista

Ela deve parecer uma operação real com:

- algumas integrações conectadas
- algumas integrações parciais
- algumas ausentes
- sinais conflitantes em parte das contas
- cobertura relacional incompleta em várias frentes
- confiança variável por área

### Motivo da escolha

O cenário parcial é o melhor ponto de partida porque:

- ativa o valor real do cockpit
- torna visíveis sinais, cobertura, gaps e confiança
- fortalece a leitura de integrações
- deixa ABM e ABX mais críveis
- evita a sensação de demo perfeita e falsa

---

## 7. Ordem canônica de implementação

A ordem desta fase é fixa.

### Bloco A — Espinha dorsal operacional

Criar e popular de forma coerente:

- `accounts`
- `contas`
- `contacts`
- `signals`
- `actions`
- `oportunidades`

### Objetivo do Bloco A

Fazer a plataforma voltar a ter um coração operacional coerente no Supabase.

### Critério de pronto do Bloco A

- cada conta tem `id` e `slug` estáveis
- cada contato aponta para conta válida
- cada ação referencia conta válida quando necessário
- cada sinal referencia conta válida quando necessário
- `contas` preserva a camada estratégica `abm` e `abx`
- `accounts` preserva a camada operacional resumida
- a leitura cruzada entre telas não parece quebrada

---

### Bloco B — Emulação de origem, cobertura e confiança

Criar e popular:

- `integrations`
- `source_snapshots`
- `account_source_coverage`
- `sync_status`

### Objetivo do Bloco B

Permitir que o Canopi mostre origem do dado, cobertura, confiança e lacunas de forma crível.

### Critério de pronto do Bloco B

- a plataforma consegue mostrar fontes conectadas, parciais e ausentes
- cada conta pode ter cobertura por origem
- a confiança dos dados deixa de ser abstrata
- integração passa a impactar sinais e leitura operacional

---

### Bloco C — Profundidade analítica e de recomendação

Criar e popular:

- `campaigns`
- `interactions`
- `play_recommendations`

### Objetivo do Bloco C

Dar profundidade real para desempenho, frentes operacionais, jornada e recomendação.

### Critério de pronto do Bloco C

- campanhas influenciam contas e sinais de forma crível
- interações ajudam a contar a jornada
- plays recomendados têm lastro em dados e contexto

---

## 8. Regras inegociáveis de coerência

Estas regras valem para todos os blocos.

### 8.1 Conta é a entidade-mãe

Tudo parte da conta.

Logo:

- `accounts.id` e `accounts.slug` precisam ser consistentes
- `contas.id` precisa reconciliar com a mesma conta operacional
- `contacts.accountId` precisa sempre apontar para conta real
- `signals.accountId` precisa sempre apontar para conta real
- `actions.relatedAccountId` deve apontar para conta real sempre que aplicável
- `oportunidades` não podem existir soltas

### 8.2 Uma taxonomia só

Não é permitido cada tabela chamar a mesma coisa por nomes diferentes.

Precisamos fixar taxonomias únicas para:

- owners
- canais
- origens
- severidades
- categorias de sinal
- categorias de ação
- tipos de play
- status de integração
- status de cobertura
- níveis de confiança

### 8.3 Cenários são overlays, não mundos separados

A base canônica é uma só.

Os cenários saudável, parcial ou crítico devem atuar como camadas de ajuste, e não como três bases independentes.

### 8.4 Nada “bonito” sem causalidade

Não basta ter linhas em tabelas.

Os dados precisam parecer conectados.

Exemplo:

- campanha influencia conta
- conta gera sinal
- sinal vira ação
- ação impacta leitura da conta
- integração ausente reduz confiança
- ABM e ABX leem esses efeitos de forma diferente

### 8.5 ABM e ABX precisam manter identidade própria

O seed não pode misturar tudo como se fosse uma camada só.

ABM precisa aparecer mais em:

- fit
- cluster
- seleção de conta
- campanha por conta
- play de entrada
- cobertura inicial

ABX precisa aparecer mais em:

- jornada da conta
- continuidade
- sponsor
- expansão de comitê
- retenção
- risco de estagnação
- evolução relacional

---

## 9. O que está fora do escopo desta fase

Enquanto este plano estiver aberto, **não é foco principal**:

- otimizar visual fino da plataforma
- criar novas páginas profundas além do necessário para suportar o seed
- refinar branding secundário
- expandir roadmap de V2
- sofisticar demais o assistente
- inventar integrações reais antes da emulação coerente

Essas coisas podem acontecer de forma pontual, mas não podem competir com o objetivo principal.

---

## 10. Resultado esperado desta fase

Ao final desta fase, o Canopi deve estar em um estado em que:

- o seed fictício não parece improvisado
- a plataforma consegue ser navegada com lógica mais crível
- ABM, ABX, cockpit, integrações e confiança possuem lastro de dados
- handoff não depende de explicação oral do autor
- o time pode voltar a otimizar a plataforma sobre uma base mais sólida

---

## 11. Leitura obrigatória para handoff

Enquanto esta fase estiver ativa, qualquer handoff válido precisa passar por esta leitura mínima:

1. `docs/98-operacao/01-plano-canonico-seed-handoff-obrigatorio.md`
2. `docs/98-operacao/00-status-atual.md`
3. `src/data/accountsData.ts`

Se o handoff envolver seed, Supabase, coerência entre entidades, ABM, ABX, integrações ou mock estruturado, esta leitura é obrigatória.

---

## 12. Regra de handoff

Nenhum handoff desta frente deve ser considerado completo sem declarar explicitamente:

- em que bloco o trabalho está (`A`, `B` ou `C`)
- o que já foi estabilizado
- o que ainda está aberto
- se o cenário oficial continua sendo o **Parcial**
- se a fonte de verdade continua sendo `accountsData.ts` ou se já existe uma camada canônica superior
- qual foi o último artefato efetivamente materializado no repo

---

## 13. Próxima ação oficial após este documento

A próxima ação oficial desta fase é:

**desenhar a estrutura canônica do Bloco A no repo e definir como ela será materializada em seed reaplicável.**

Sem isso, a fase ainda está apenas descrita, não executada.

---

## 14. Encerramento formal desta fase

Quando esta fase terminar, ela deve ser encerrada explicitamente com:

1. atualização deste documento para status concluído
2. atualização do `00-status-atual.md`
3. registro objetivo do que passou a ser a nova base operacional do Canopi
4. liberação consciente para voltar a otimizar a plataforma

Até lá, este plano continua sendo a referência canônica fixa para seed e handoff.
