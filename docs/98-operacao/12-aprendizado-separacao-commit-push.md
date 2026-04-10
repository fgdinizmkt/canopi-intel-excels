# Aprendizado operacional — separação entre aprovação de commit e aprovação de push

## Regra aprendida

Aprovação de **commit** e aprovação de **push** são gates diferentes.

Eles não podem ser aprovados no mesmo ato.

---

## Fluxo correto

1. executar o recorte
2. validar build
3. validar `git diff --stat`
4. validar diff real
5. aprovar **somente o commit**
6. gerar o commit e informar o SHA
7. avaliar o commit gerado
8. aprovar **somente o push**
9. publicar em `origin/main`

---

## Erro que não deve se repetir

Não tratar `commit + push` como pacote único.

Mesmo que o diff esteja correto e o build esteja limpo, o push continua sendo uma segunda autorização.

---

## Aplicação prática no projeto

Quando o agente estiver com alterações staged e aguardando aprovação:
- a primeira aprovação libera apenas o commit
- o push permanece bloqueado
- só após o SHA do commit existir e ser revisado é que o push pode ser autorizado

---

## Motivo da regra

Essa separação evita:
- publicar algo sem a última checagem consciente
- pular um gate de controle
- confundir revisão de conteúdo com autorização de publicação

---

## Status

Aprendizado incorporado como regra operacional do projeto.
