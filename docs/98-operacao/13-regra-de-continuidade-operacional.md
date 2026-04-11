# Regra de Continuidade Operacional

## Objetivo
Eliminar a recorrência de encerramentos incompletos entre etapas do projeto.

---

## Regra
Após cada validação, aprovação ou fechamento de estado, o fluxo **não pode parar em status** quando houver continuidade operacional óbvia.

A saída correta deve ser sempre uma destas duas:

1. **Entregar exatamente 1 próximo prompt operacional**, quando o próximo passo estiver claro.
2. **Entrar explicitamente em espera**, somente quando o usuário mandar aguardar o retorno de outro agente ou bloquear novas ações.

---

## Proibição explícita
É proibido:
- encerrar em “estado validado” sem converter isso no próximo comando
- fechar uma etapa apenas com resumo quando o próximo gate já estiver evidente
- repetir o mesmo erro de fluxo em recorrência ao longo do projeto
- misturar continuidade de operação com reflexão vazia ou observação passiva

---

## Aplicação prática
### Quando houver continuidade clara
- validar o estado
- decidir o próximo passo
- entregar **um único prompt**
- não devolver a orquestração ao usuário

### Quando o usuário mandar esperar
- não tomar ação adicional
- não abrir novo prompt
- aguardar em silêncio o retorno do agente em andamento

---

## Relação com outras regras já vigentes
Esta regra complementa e não substitui:
- SLA de 3 retrabalhos
- separação entre aprovação de commit e aprovação de push
- regra de desbloqueio por prioridade

---

## Status
Regra incorporada à operação do projeto.
