# HANDOFF — ChatGPT Orquestrador | Leituras obrigatórias primeiro

## Função deste handoff
Este documento existe para iniciar corretamente um novo chat do projeto **Canopi | intel excels** com o ChatGPT atuando como **orquestrador principal**.

O objetivo aqui não é resumir tudo de forma solta.
O objetivo principal é deixar explícito **o que deve ser lido obrigatoriamente, em qual ordem, antes de qualquer decisão**.

---

## Regra máxima deste handoff
**Nunca esquecer a pasta `docs/98-operacao`.**

Sempre que um novo chat começar neste projeto, a atualização obrigatória deve partir de:
1. `AGENTS.md`
2. `docs/98-operacao/`

Sem isso, o risco é:
- confundir estado publicado com estado de conversa
- perder decisões operacionais
- repetir discussões já resolvidas
- tratar taxonomia conceitual como se já fosse estado implementado
- abrir frentes paralelas fora de hora

---

## Leituras obrigatórias em ordem
Estas leituras devem acontecer **antes de qualquer resposta mais estratégica, técnica ou operacional**.

### Bloco 0 — Governança base
1. `AGENTS.md`
   - regras gerais do projeto
   - postura esperada
   - limites de atuação
   - governança de execução

### Bloco 1 — Estado factual do projeto
2. `docs/98-operacao/00-status-atual.md`
   - fonte principal do estado publicado do Canopi
   - fase atual
   - último estado consolidado
   - recortes concluídos
   - pendências e direção factual

3. `docs/98-operacao/04-regras-do-processo.md`
   - governança operacional
   - ordem canônica
   - regras para recortes, execução, validação e commit

4. `docs/98-operacao/05-handoff-atual.md`
   - handoff operacional vigente do projeto
   - deve ser lido para entender o ponto em que a documentação formal deixou o bastão

5. `docs/98-operacao/06-checkpoint-atual.md`
   - checkpoint operacional consolidado
   - útil para entender recortes recentes, congelamentos e continuidade

### Bloco 2 — Documentos de apoio que podem alterar leitura do estado
6. `docs/98-operacao/07-especificacoes-visuais.md`
   - ler quando houver tema de UI, refinamento visual ou risco de alterar direção aprovada

7. `docs/98-operacao/09-mapa-de-cobertura-persistencia.md`
   - ler quando o tema tocar persistência, ownership de campos, write paths, leitura defensiva ou cobertura Supabase

### Bloco 3 — Frente recente de taxonomia, campanhas, ABM e ABX
8. `docs/98-operacao/12-regras-chat-e-retomada-campanhas.md`
   - regras da frente de campanhas em `Accounts.tsx`
   - restrições aprovadas
   - ponto real de retomada pós-E21

9. `docs/98-operacao/13-taxonomia-campanhas-notas.md`
   - princípios semânticos de campanhas, canal, origem, hand raiser, formatos

10. `docs/98-operacao/14-abm-abx-escala-de-acoes.md`
   - escala 1:1, 1:few, 1:many para ABM e ABX

11. `docs/98-operacao/15-dicionario-operacional-campanhas.md`
   - dicionário consolidado dos campos operacionais

12. `docs/98-operacao/17-revisao-canonica-taxonomia-campanhas.md`
   - correção canônica importante entre `canal` e `formato`

13. `docs/98-operacao/19-revisao-da-auditoria-taxonomia-campanhas.md`
   - correção da primeira auditoria equivocada
   - deixa explícito que o Bloco C atual não é ainda a taxonomia canônica final

### Bloco 4 — Handoffs recentes do próprio ChatGPT
14. `docs/98-operacao/21-handoff-chatgpt-orquestrador-taxonomia-abm-abx.md`
   - handoff anterior do orquestrador
   - útil como contexto complementar, mas não substitui os blocos acima

15. `docs/98-operacao/22-handoff-chatgpt-orquestrador-leituras-obrigatorias.md`
   - este documento
   - deve passar a ser a referência de entrada para novos chats

---

## Regra prática de leitura por tipo de assunto
### Se o assunto for estado atual do Canopi
Ler obrigatoriamente:
- `AGENTS.md`
- `docs/98-operacao/00-status-atual.md`
- `docs/98-operacao/04-regras-do-processo.md`
- `docs/98-operacao/05-handoff-atual.md`
- `docs/98-operacao/06-checkpoint-atual.md`

### Se o assunto for campanhas, Accounts, Bloco C, taxonomia, ABM e ABX
Ler obrigatoriamente:
- todos os arquivos do bloco acima
- mais:
  - `docs/98-operacao/12-regras-chat-e-retomada-campanhas.md`
  - `docs/98-operacao/13-taxonomia-campanhas-notas.md`
  - `docs/98-operacao/14-abm-abx-escala-de-acoes.md`
  - `docs/98-operacao/15-dicionario-operacional-campanhas.md`
  - `docs/98-operacao/17-revisao-canonica-taxonomia-campanhas.md`
  - `docs/98-operacao/19-revisao-da-auditoria-taxonomia-campanhas.md`

### Se o assunto for persistência, Supabase ou ownership de campo
Ler obrigatoriamente:
- `docs/98-operacao/00-status-atual.md`
- `docs/98-operacao/04-regras-do-processo.md`
- `docs/98-operacao/09-mapa-de-cobertura-persistencia.md`
- e depois qualquer doc da frente específica que estiver sendo discutida

### Se o assunto for UI, direção visual ou risco de mexer em telas existentes
Ler obrigatoriamente:
- `docs/98-operacao/00-status-atual.md`
- `docs/98-operacao/04-regras-do-processo.md`
- `docs/98-operacao/07-especificacoes-visuais.md`
- e os docs específicos da frente tocada

---

## Estado real do produto que nunca deve ser esquecido
O **Canopi já é uma plataforma madura**.

Não é correto falar como se estivéssemos inventando uma plataforma do zero no contexto do produto atual.

Leitura correta:
- produto maduro existente
- recortes publicados já consolidados
- decisões conceituais recentes para orientar próximos ajustes
- aplicação incremental, segura e auditável

---

## O que foi decidido recentemente e precisa ser lembrado
### Modelagem canônica mínima
A leitura mínima de campanha/ação deve separar:
- `campanha`
- `tipoCampanha`
- `formato`
- `origem`
- `canalPrincipal`
- `handRaiser`
- `audience`
- `objective`
- `usoPrincipal`
- `escala`

### Regras semânticas críticas
- `campanha` não é origem
- `canal` não é campanha
- `hand raiser` não é campanha nem canal
- `audience` e `objective` são atributos da campanha
- `orgânico` não absorve pago nem cold
- `podcast` e `vídeocast` são formatos, não canais
- `usoPrincipal` deve suportar `ABM | ABX | híbrido | operacional geral`
- `escala` deve suportar `1:1 | 1:few | 1:many`

### Regra crítica sobre o Bloco C atual
O Bloco C atual é a base técnica vigente e funcional, **mas ainda não deve ser tratado como taxonomia canônica final**.

---

## Situação operacional exata neste momento
A frente ativa mais recente é:
- taxonomia de campanhas, ABM e ABX
- alinhamento semântico do modelo atual
- auditoria via Claude Code orientada por aderência semântica

Estamos aguardando o retorno do **Claude Code** com uma nova auditoria mais correta.

---

## O que o ChatGPT orquestrador deve fazer ao receber esse retorno
1. Confirmar que as leituras obrigatórias acima já estão atualizadas mentalmente.
2. Ler o retorno do Claude Code com frieza.
3. Verificar se ele:
   - distinguiu estado técnico de contrato canônico
   - montou matriz de correspondência entre campos atuais e campos canônicos
   - identificou colapsos semânticos em `type`, `channel` e `source`
   - propôs type map, adapter ou normalizer útil
   - evitou cair em solução apenas cosmética/documental
4. Só então definir o próximo recorte.

---

## Regra de orquestração
### Quando a tarefa for conceitual, estratégica ou semântica
- ChatGPT assume a frente
- consolida
- corrige incoerências
- decide direção
- gera prompt preciso para o agente executor

### Quando a tarefa for técnica, diff, build, implementação e evidência
- delegar para Claude Code
- exigir build
- exigir `git diff --stat`
- exigir diff real
- exigir pausa antes de commit

### Quando a tarefa for visual/UX estrutural pesada
- considerar Antigravity apenas se realmente necessário

---

## O que não fazer
- não responder sem antes internalizar a pasta `docs/98-operacao`
- não esquecer `00-status-atual.md`
- não esquecer `04-regras-do-processo.md`
- não esquecer `05-handoff-atual.md` e `06-checkpoint-atual.md`
- não esquecer os docs `12`, `13`, `14`, `15`, `17` e `19` quando o tema for campanhas/ABM/ABX
- não abrir frente paralela sem base
- não cair em rebuild desnecessário
- não tratar legado/transitório como contrato final

---

## Frase-guia para qualquer novo chat neste projeto
Antes de qualquer decisão, atualize-se com `AGENTS.md` e com a pasta `docs/98-operacao`, especialmente `00`, `04`, `05`, `06`, `12`, `13`, `14`, `15`, `17` e `19`.

Sem isso, a chance de desvio operacional é alta.

---

## Instrução final
Se este handoff estiver sendo lido em um novo chat, comece por:
1. reconhecer que a leitura obrigatória parte de `docs/98-operacao`
2. usar a ordem de leitura deste documento
3. só depois responder, planejar, auditar ou orientar qualquer execução