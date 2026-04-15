# Validação visual interna e continuidade iterativa

## Objetivo
Destravar a evolução do produto em fase não aprovada, permitindo continuidade com validação visual interna do agente sem depender de aprovação visual explícita do usuário em cada iteração.

---

## Regra
Enquanto a plataforma estiver longe de aprovação final, a frente pode seguir com **validação visual interna obrigatória** feita pelo agente, desde que haja:
- evidência visual objetiva ou descrição visual suficiente
- build válido
- diff isolado
- coerência com o escopo do recorte

A aprovação visual explícita do usuário deixa de ser bloqueio para **iteração exploratória e refinamento**.

---

## O que continua exigindo cuidado do usuário
Aprovação explícita do usuário continua recomendada antes de:
- publicar mudanças amplas de UX/UI em fluxo central
- consolidar uma direção visual como definitiva
- alterar hierarquia estrutural relevante
- fechar marcos que o usuário queira revisar no front

---

## O que passa a ser suficiente para seguir
Para continuar iterando, o agente deve devolver no mínimo:
1. screenshots reais quando disponíveis, ou evidência visual equivalente
2. descrição objetiva do impacto visual
3. diff isolado
4. build
5. recomendação clara de seguir, ajustar ou reverter

---

## Regra operacional
Não parar uma frente só porque o usuário ainda não olhou o front, quando a necessidade do momento for exploração, aproximação visual e avanço iterativo.

Nesses casos, o próximo passo correto é:
- implementar
- validar visualmente por agente
- registrar evidência
- continuar refinando até chegar em algo digno de avaliação do usuário

---

## Relação com a governança geral
Esta regra não revoga:
- não deixar pontas soltas
- não contaminar recortes
- manter memória operacional remota e local sincronizadas
- fechar cada frente com estado inequívoco

Ela apenas substitui o bloqueio excessivo de aprovação visual do usuário durante fases ainda exploratórias do produto.

---

## Aplicação imediata no E22.1
E22.1 pode ser reaberto e iterado com validação visual interna do agente.

O usuário só precisa entrar como aprovador final quando a implementação já estiver visualmente madura o suficiente para avaliação real.

---

**Status:** Ativo
**Data:** 2026-04-15
**Responsável:** ChatGPT | Canopi
