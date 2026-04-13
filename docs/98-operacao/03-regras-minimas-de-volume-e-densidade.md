# Regras Mínimas de Volume e Densidade — Seed Canônico

**Status:** Ativo  
**Natureza:** Complemento obrigatório ao plano canônico de seed  
**Aplicação:** Bloco A e qualquer rodada posterior de enriquecimento

---

## 1. Objetivo

Este documento fixa regras mínimas de aceite para o seed canônico do Canopi.

Ele existe para impedir que a plataforma seja populada com uma base aparentemente correta em estrutura, mas insuficiente em densidade operacional, profundidade relacional e volume mínimo para uma demo crível.

---

## 2. Regra de volume mínimo

O seed canônico não será considerado aceitável enquanto não houver, no mínimo:

- **20 contas ABM**
- **20 contas ABX**

Isso define um piso operacional de **40 contas estratégicas** no seed.

Contas adicionais podem existir, mas esse piso não pode ser descumprido.

---

## 3. Regra de densidade mínima por conta

Nenhuma conta estratégica pode permanecer zerada nas entidades fundamentais.

Cada conta precisa ter, no mínimo:

- **1 contato**
- **1 sinal**
- **1 oportunidade**

Esses são mínimos absolutos.

### Recomendação preferencial

Para contas prioritárias, o alvo recomendado é:

- **2 a 3 contatos**
- **1 a 2 sinais**
- **1 oportunidade confirmada**

---

## 4. Regra de coerência operacional

Não é permitido aceitar no seed:

- conta sem contato, mas com ação operacional dependente de stakeholder
- conta sem sinal, mas com ação derivada de evento ou mudança
- conta sem oportunidade, mas apresentada como conta ativa de pipeline
- ação órfã sem lastro relacional ou factual

Se houver ação, ela precisa ter base mínima de execução.

---

## 5. Regra de aceite do Bloco A

O Bloco A só pode ser considerado pronto quando:

1. existir piso mínimo de 20 contas ABM e 20 contas ABX
2. nenhuma conta estratégica estiver zerada em contatos, sinais e oportunidades
3. ações órfãs tiverem sido eliminadas ou reconciliadas
4. a plataforma puder ser demonstrada sem sensação de vazio estrutural em boa parte das contas

---

## 6. Consequência prática

Enquanto essas regras não forem atendidas:

- o seed não deve ser promovido como base aceitável para Supabase
- o Bloco A continua em fase de enriquecimento
- o trabalho deve continuar concentrado em `src/data/accountsData.ts` e na geração derivada do seed

---

## 7. Prioridade operacional

A partir desta regra, toda rodada de enriquecimento deve perseguir nesta ordem:

1. remover contas zeradas
2. remover ações órfãs
3. atingir 20 contas ABM densas
4. atingir 20 contas ABX densas
5. só depois aprofundar qualidade analítica e emulação de origem

---

## 8. Leitura obrigatória associada

Este documento deve ser lido junto com:

1. `docs/98-operacao/01-plano-canonico-seed-handoff-obrigatorio.md`
2. `docs/98-operacao/02-bloco-a-mapeamento-canonico.md`
3. `src/data/accountsData.ts`

---

## 9. Efeito sobre handoff

Todo handoff dessa frente precisa explicitar:

- quantas contas ABM existem no seed
- quantas contas ABX existem no seed
- quantas contas ainda estão rasas
- se ainda existe alguma conta zerada
- se ainda existem ações órfãs

Sem isso, o handoff fica incompleto.
