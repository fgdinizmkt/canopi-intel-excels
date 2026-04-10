# SLA de retrabalho

## Regra operacional obrigatória

O SLA máximo de retrabalho neste projeto é de **3 retrabalhos por tarefa, recorte ou frente**.

Isso vale para qualquer agente ou fluxo de execução.

---

## Definição de retrabalho

Conta como retrabalho toda nova tentativa sobre o mesmo escopo quando a entrega anterior precisou ser refeita por erro, premissa incorreta, drift factual, recomendação inadequada, execução fora da régua definida ou repetição de instrução já corrigida.

---

## Regra de corte

Ao atingir **3 retrabalhos**, a operação deve ser interrompida.

A partir desse ponto:
- não se insiste no mesmo caminho
- não se repete nova tentativa equivalente
- não se empurra recomendação por insistência
- deve-se registrar a causa objetiva do bloqueio
- deve-se propor apenas redirecionamento de escopo, mudança de abordagem ou encerramento da frente

---

## Aplicação prática

Quando o limite for atingido, a resposta correta passa a ser:
1. reconhecer que o SLA foi estourado
2. interromper a linha atual
3. documentar o motivo factual
4. abrir apenas uma alternativa nova com escopo claramente diferente, ou encerrar a frente

---

## Observação

Esta regra existe para evitar looping, desgaste operacional, falsa sensação de avanço e repetição improdutiva.

**Diretriz do projeto:** depois de 3 retrabalhos, insistência deixa de ser execução e passa a ser ruído.
