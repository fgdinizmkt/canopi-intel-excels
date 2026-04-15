# SLA máximo de 3 ciclos entre ChatGPT e Claude Code

## Objetivo
Mitigar vai e volta desnecessário entre orquestração e execução. Tornar explícita a responsabilidade do ChatGPT em orientar de forma clara, fechada e literal o que o agente deve entregar.

---

## Princípio
A responsabilidade por reduzir ambiguidade, retrabalho e ciclos excessivos é do **ChatGPT**.

O ChatGPT deve orientar o Claude Code com:
- escopo fechado
- entregável literal
- critério de aceite explícito
- estado final esperado
- evidência exigida
- restrições e não-objetivos

Não é aceitável delegar ao Claude Code pedidos abertos, vagos ou interpretativos quando o recorte já deveria estar suficientemente especificado.

---

## Regra canônica
Para cada frente, recorte ou correção em andamento, o fluxo entre ChatGPT e Claude Code tem **SLA máximo de 3 ciclos de ida e volta**.

### Definição de ciclo
Um ciclo é:
1. ChatGPT orienta com prompt operacional
2. Claude Code retorna implementação, diagnóstico ou evidência
3. ChatGPT analisa e devolve nova orientação

Ao completar **3 ciclos**, o ChatGPT deve obrigatoriamente interromper o padrão de ida e volta e fazer uma destas ações:
1. emitir um **prompt final fechado**, com entregável literal e sem margem interpretativa
2. mandar **reverter e limpar** a frente, se a ambiguidade tiver contaminado o recorte
3. registrar a frente como **pendente com registro formal** no repositório, se faltar validação externa do usuário

---

## Obrigação do ChatGPT antes de cada novo ciclo
Antes de abrir mais um ciclo com o Claude Code, o ChatGPT deve verificar se o pedido está fechado nos itens abaixo:
- o que deve ser literalmente entregue
- quais arquivos podem ser alterados
- quais arquivos não podem ser alterados
- o que caracteriza sucesso
- o que é proibido
- que evidência deve voltar
- se pode ou não commitar
- em qual estado final a frente deve terminar

Se algum desses pontos não estiver explícito, o ChatGPT deve corrigir o prompt antes de enviar.

---

## Entregável literal obrigatório
Sempre que houver continuidade operacional, o ChatGPT deve orientar o Claude Code com um pacote de entrega literal contendo, no mínimo:
- objetivo do recorte
- arquivos alvo
- entregáveis exatos
- validações obrigatórias
- formato de retorno
- regra de commit ou proibição de commit
- próximo estado esperado ao final

---

## Proibido
- abrir quarto ciclo de refinamento sem endurecer o prompt
- pedir “ajustes gerais”, “melhorar”, “refinar” ou similares sem delimitação objetiva
- deixar o Claude Code decidir sozinho o que é o entregável final quando isso já deveria ter vindo da orquestração
- aceitar resposta parcialmente útil como fechamento de frente sem transformar isso em instrução final clara
- manter conversa operacional longa com múltiplos desvios sem consolidar um pacote final de execução

---

## Regra de fechamento
Ao atingir o terceiro ciclo, a próxima orientação do ChatGPT deve ser a mais fechada da frente até então.

Ela deve dizer literalmente:
- o que entregar
- o que não entregar
- o que validar
- o que mostrar
- se deve commitar, reverter, isolar ou registrar pendência formal

---

## Relação com a governança geral
Esta regra complementa a governança publicada em `docs/98-operacao/12-regras-chat-e-retomada-campanhas.md`.

Leitura conjunta obrigatória:
- não deixar pontas soltas
- não deixar contaminação entre recortes
- não confundir estado local/chat com estado publicado
- não deixar mudança visual sem aprovação explícita
- não exceder 3 ciclos sem fechar a instrução

---

## Aplicação prática
Se uma frente entrar em repetição, ambiguidade ou correção incremental demais, o ChatGPT deve assumir que a especificação anterior falhou e substituir o fluxo por:
- instrução fechada
- entregável literal
- evidência objetiva
- estado final único

Sem isso, a responsabilidade do vai e volta continua sendo do ChatGPT.

---

**Status:** Ativo
**Data:** 2026-04-15
**Responsável:** ChatGPT | Canopi
