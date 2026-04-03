# Governança de fechamento binário

## Objetivo
Eliminar retrabalho causado por critérios de aprovação que aparecem tarde demais, por exigências implícitas e por aceitação parcial quando o padrão definido para o recorte é fechamento total.

---

## 1. Regra de critério fechado na largada
Se o padrão do recorte for **100% correto**, os critérios de aprovação devem ser explicitados no **primeiro prompt operacional**, e não descobertos ao longo do ciclo.

É obrigatório declarar na largada:
- o que caracteriza fechamento
- o que invalida fechamento
- quais provas serão exigidas
- se aprovação parcial é proibida

---

## 2. Regra de prova binária upfront
Quando a exigência for fechamento total, a prova também deve ser binária e previamente definida.

Exemplos de prova obrigatória, conforme o tipo de tarefa:
- build completo sem truncamento
- diff real literal
- prova de zeragem de padrões proibidos
- lista nominal do que pode permanecer
- validação visual real quando o bug for visual

Não é permitido pedir essa prova apenas no fim se ela já era necessária desde o início.

---

## 3. Regra de proibição de avanço parcial
Se o usuário definir que **nada pode avançar sem estar 100% correto**, ficam proibidos:
- aprovação parcial
- commit parcial
- push parcial
- abertura do próximo recorte com pendência no atual
- linguagem ambígua como "parcialmente aprovado" ou "pode avançar depois"

---

## 4. Regra de zero requisito implícito
Nenhum requisito crítico de aprovação pode ficar implícito.

Se um fechamento depende de:
- screenshots
- grep de padrões proibidos
- contagem zero de ocorrências
- validação humana
- lista de remanescentes legítimos

então isso precisa estar escrito no prompt inicial do ciclo.

---

## 5. Regra de responsabilidade de orquestração
Se uma exigência crítica aparecer apenas no fim e gerar retrabalho, isso deve ser tratado como falha de orquestração, não como falha exclusiva do agente executor.

Correção obrigatória para o ciclo seguinte:
- transformar a exigência esquecida em regra explícita de governança
- incorporá-la ao próximo prompt desde a largada
- impedir repetição do mesmo tipo de omissão

---

## 6. Regra de fechamento por escopo real
Só pode ser usado "concluído", "100% correto", "sem pendências" ou equivalente quando:
- o escopo prometido foi integralmente entregue
- as provas definidas no início foram apresentadas
- não restar pendência dentro do escopo do recorte

Se ainda houver pendência, a entrega deve ser reenquadrada antes de pedir aprovação.

---

## 7. Regra de leitura dura de aprovação
Quando o padrão for fechamento total, a revisão deve responder de forma binária:
- aprovado
- não aprovado

Sem zonas cinzentas.
Sem linguagem conciliadora.
Sem aceitar narrativa maior do que a prova.

---

## 8. Regra de bloqueio automático
Se faltar qualquer prova previamente exigida, o recorte não pode ser aprovado.

Checklist mínimo para fechamento total:
- build completo
- diff compatível com a narrativa
- prova final do critério central do recorte
- nenhuma pendência remanescente dentro do escopo

Se um item falhar, o recorte continua aberto.
