# Governança de alinhamento local e remoto

## Objetivo
Eliminar retrabalho causado por divergência entre estado local e remoto, especialmente após recortes aprovados, commits já sincronizados e retomada paralela de trabalho com agentes.

---

## 1. Fonte canônica de verdade
Enquanto houver qualquer dúvida sobre o estado local, a fonte canônica do projeto passa a ser **origin/main**.

Isso significa:
- o hash de `origin/main` é a referência oficial
- o estado local não pode ser tratado como base válida até ser reconciliado
- nenhum novo recorte pode partir de um local potencialmente divergente

---

## 2. Regra de reconciliação obrigatória antes de continuar
Antes de abrir qualquer novo recorte depois de um fechamento aprovado e já pushado, é obrigatório:
1. alinhar o ambiente local com `origin/main`
2. confirmar o hash local
3. confirmar o hash remoto
4. verificar que ambos são idênticos
5. verificar `working tree clean`

Sem isso, o próximo recorte não pode começar.

---

## 3. Regra de bloqueio de avanço em base divergente
Fica proibido:
- continuar implementações novas em base local divergente
- usar branch local desatualizada como base de recorte
- validar entrega nova sobre estado local não reconciliado
- aceitar "quase alinhado" como condição suficiente

A condição aceita é apenas:
- **local e remoto 100% alinhados**

---

## 4. Regra de hash canônico explícito
Sempre que um recorte for encerrado com commit já sincronizado, o hash final deve ser tratado como **hash canônico de retomada**.

Esse hash deve ser explicitado na operação seguinte para evitar:
- sobreposição de trabalho
- reintrodução de código antigo
- saneamento feito em cima de base errada

---

## 5. Regra de trabalho paralelo com agentes
Se o trabalho voltar a ocorrer simultaneamente com mais de um agente, o alinhamento local deve acontecer antes da reabertura da execução paralela.

Fluxo obrigatório:
1. verificar GitHub
2. fixar hash canônico
3. alinhar local
4. só então reabrir o trabalho paralelo

---

## 6. Regra de prova mínima para reconciliação local
A reconciliação local só pode ser dada como concluída quando forem apresentados, de forma literal:
- hash local
- hash remoto
- confirmação de igualdade entre ambos
- `git status` limpo

Sem esses quatro itens, a reconciliação não está fechada.

---

## 7. Regra de governança de retomada
Toda retomada após saneamento grande, correção de regressão ou fechamento de recorte crítico deve começar com:
- checagem do GitHub
- checagem dos commits relevantes
- alinhamento local-remoto
- só depois definição do próximo hotspot

---

## 8. Regra de linguagem operacional
Não usar termos vagos como:
- "parece alinhado"
- "acho que está igual"
- "provavelmente sincronizado"

A linguagem correta é binária:
- alinhado
- não alinhado

---

## 9. Regra de bloqueio automático
Se local e remoto não estiverem comprovadamente iguais, o projeto entra em bloqueio de avanço.

Nesse estado:
- não há aprovação de novo recorte
- não há novo saneamento
- não há nova frente
- não há abertura de próximo hotspot

Primeiro reconcilia.
Depois continua.
