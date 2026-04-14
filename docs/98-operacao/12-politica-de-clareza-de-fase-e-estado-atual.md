# Política de Clareza de Fase e Estado Atual

## Objetivo
Evitar ambiguidade sobre **em que fase o projeto está**, **o que já terminou** e **o que está sendo feito agora**.

Esta política passa a valer como regra de governança operacional do Canopi.

---

## Regra central
Sempre que houver checkpoint, handoff, resumo de progresso, retorno de agente ou atualização de execução, a comunicação deve separar com clareza:

1. **Plano encerrado**
2. **Plano em andamento**
3. **Objetivo atual**
4. **Próximo passo exato**
5. **O que ainda não foi feito**

É proibido misturar plano concluído com plano em andamento como se fossem a mesma coisa.

---

## Regra obrigatória de comunicação
Toda resposta operacional sobre status deve conter explicitamente os cinco blocos abaixo:

### 1. Fase atual
Dizer em uma frase curta em que fase estamos.

### 2. O que já terminou
Dizer em uma frase curta o que foi concluído e não deve mais ser tratado como "em aberto".

### 3. O que estamos fazendo agora
Dizer em linguagem simples qual trabalho está em andamento neste momento.

### 4. Objetivo do momento
Dizer por que esse trabalho atual existe.

### 5. Próximo passo exato
Dizer qual é o próximo movimento concreto esperado.

---

## Estado canônico que deve ser comunicado a partir de agora

### Plano encerrado
O **plano de seed canônico** foi concluído.

Isso significa:
- o seed foi estruturado
- o seed foi estabilizado
- o seed foi fechado de forma determinística
- o seed não deve mais ser comunicado como se ainda estivesse sendo criado

### Plano em andamento
O projeto está agora na fase de **materialização pós-seed**.

Isso significa:
- subir o seed canônico para a base real
- reduzir dependência de mock/local
- conectar as telas e fluxos à camada persistida
- transformar o que hoje é fallback/local-first em base real progressivamente

### Objetivo atual
Fazer o sistema usar como fonte real os dados já preparados, em vez de depender só da versão mock/local.

### Próximo passo exato
Executar a trilha real de Supabase sobre o recorte canônico já fechado, começando pela população efetiva do Bloco C no ambiente de desenvolvimento e pela continuidade da transição de consumo para fonte persistida.

---

## Regra de separação de narrativas
Sempre diferenciar explicitamente:

- **Plano de seed**
- **Plano de produto/UI**
- **Plano de persistência/Supabase**

Nunca responder apenas "estamos avançando" sem dizer **qual plano** está avançando.

---

## Regra de linguagem
Quando houver risco de confusão, a resposta deve usar linguagem simples, incluindo analogias concretas, por exemplo:

- "montar os dados"
- "guardar os dados no lugar certo"
- "ligar a casa nos dados reais"

O objetivo é garantir entendimento inclusive para leitura não técnica.

---

## Regra de bloqueio semântico
As seguintes ambiguidades passam a ser consideradas erro de governança:

- tratar seed concluído como seed ainda em execução
- não dizer se o assunto é seed, UI ou Supabase
- resumir progresso sem dizer o que acabou e o que continua
- dizer "próximo passo" sem dizer o objetivo da etapa atual
- responder status técnico sem traduzir em linguagem simples quando houver confusão do orquestrador

---

## Aplicação prática imediata
A partir deste documento, toda comunicação operacional deve deixar explícito:

- **Seed:** concluído
- **Fase atual:** pós-seed / materialização Supabase + consumo real
- **Objetivo atual:** tirar a plataforma da dependência exclusiva de mock/local
- **Próximo passo:** subir e consumir a base real de forma progressiva e validada

---

## Critério de conformidade
Uma atualização operacional só deve ser considerada clara se a pessoa conseguir responder sem hesitar:

1. O que já terminou?
2. O que está acontecendo agora?
3. Para quê?
4. O que vem imediatamente depois?

Se uma dessas respostas não estiver explícita, a comunicação está em não conformidade.
