# Protocolo CHECKPOINT

## Finalidade
Este protocolo existe para proteger a continuidade operacional do projeto em situações de:
- troca de chat
- troca de agente
- pausa no meio de um recorte
- travamento de agente
- resposta truncada
- loop, alucinação ou perda de contexto recente

O protocolo não substitui a memória consolidada do projeto.
Ele protege a retomada do trabalho em andamento.

---

## Arquivos canônicos

### Memória consolidada
- `docs/98-operacao/00-status-atual.md`
- `docs/98-operacao/03-log-de-sessoes.md`

### Memória viva de retomada
- `docs/98-operacao/06-checkpoint-atual.md`

---

## Comandos canônicos

### `CHECKPOINT`
Usado quando o agente atual ainda está funcional e o contexto precisa ser preservado.

Ao receber `CHECKPOINT`, qualquer agente deve:
1. parar a execução em curso
2. atualizar `docs/98-operacao/06-checkpoint-atual.md`
3. registrar apenas fatos verificáveis
4. deixar o próximo passo exato
5. devolver um resumo curto do estado salvo

### `CHECKPOINT SOS`
Usado quando o agente atual já não é confiável ou não está mais disponível.

Exemplos:
- loop
- alucinação
- travamento
- corte por token
- resposta sem sentido
- agente que morreu no meio da ação

Ao receber `CHECKPOINT SOS`, o novo agente deve:
1. entrar em modo de resgate
2. ler `docs/98-operacao/06-checkpoint-atual.md`, se existir
3. se o checkpoint estiver ausente, incompleto ou desatualizado, reconstruir o estado usando:
   - `docs/98-operacao/00-status-atual.md`
   - `docs/98-operacao/03-log-de-sessoes.md`
   - últimos outputs factuais disponíveis
4. atualizar `docs/98-operacao/06-checkpoint-atual.md` com o resgate
5. responder com o estado real e o próximo passo exato

---

## Regra universal de leitura
Se `docs/98-operacao/06-checkpoint-atual.md` existir, qualquer agente que assumir o projeto deve lê-lo antes de agir.

Se o status do arquivo estiver `ATIVO` ou `RESGATE`, ele tem prioridade operacional para retomada.

Se o status estiver `LIMPO`, a retomada deve seguir pela memória consolidada (`00` e `03`) e pelo próximo recorte aprovado.

---

## Estados do checkpoint

### `ATIVO`
Existe trabalho em andamento que ainda não foi concluído ou consolidado.

### `RESGATE`
O estado atual foi reconstruído por outro agente após falha, interrupção ou perda de continuidade.

### `LIMPO`
Não existe trabalho crítico em aberto no checkpoint. A memória consolidada já contém a verdade principal do projeto.

---

## Campos mínimos obrigatórios em `06-checkpoint-atual.md`
- Status
- Origem
- Confiabilidade
- Data/hora
- Agente responsável
- Objetivo atual
- Estado de git
- Concluído
- Pendente
- Última validação conhecida
- Riscos / atenção
- Próximo passo exato

---

## Regras de confiança
- nunca inventar contexto
- nunca registrar algo que não tenha lastro no repositório, terminal ou validação explícita
- sempre distinguir salvamento direto de resgate
- usar `CHECKPOINT SOS` quando houver qualquer dúvida razoável sobre a confiabilidade do agente anterior

---

## Regra prática para o usuário
- use `CHECKPOINT` para salvar
- use `CHECKPOINT SOS` para resgatar

Estes são os únicos dois comandos que o usuário precisa lembrar.
