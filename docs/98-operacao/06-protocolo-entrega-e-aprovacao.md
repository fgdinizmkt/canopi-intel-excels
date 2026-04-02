# 06 - Protocolo de entrega e aprovação

## Objetivo
Registrar a ordem obrigatória de entrega de qualquer recorte antes de commit, evitando retrabalho, resumo sem evidência e avanço operacional sem aprovação explícita.

## Ordem obrigatória

Toda implementação segue esta sequência, sem exceção:

1. Executar apenas o escopo já aprovado.
2. Mostrar resultado objetivo do que foi implementado.
3. Mostrar build, com comando, resultado e exit code.
4. Mostrar `git diff --stat` real.
5. Mostrar diff real literal dos arquivos alterados.
6. Mostrar checklist de conferência.
7. Parar antes do commit.
8. Aguardar aprovação explícita do usuário.
9. Só então commitar.
10. Só então atualizar a memória operacional.
11. Só então fazer commit documental, se necessário.

## Checklist obrigatório de conferência

Ao final da implementação, confirmar explicitamente:
- o que entrou
- o que foi preservado
- o que não foi alterado
- se houve fallback
- se houve ou não comportamento fictício adicionado

## Regras críticas

- Não pedir autorização para commit antes de mostrar build, diff stat, diff real e checklist.
- Não sugerir `git add`, `git commit` ou `git push` antes da aprovação explícita.
- Não encerrar entrega com próximo passo operacional.
- Encerrar sempre com: `Parado antes de commit. Aguardando aprovação.`
- Não substituir diff real por resumo narrativo.
- Não usar expressões como:
  - `omitido para brevidade`
  - `segue o mesmo padrão`
  - `renderização da lista`
  - `card aqui`
  - `preservado` sem evidência no diff
- Se o diff for grande, dividir por blocos lógicos, mas continuar mostrando o código real alterado.

## Violação de processo

Commitar antes da aprovação explícita do usuário é violação de processo, mesmo que:
- o build esteja limpo
- o recorte esteja dentro do escopo
- o diff pareça correto

## Observação

Este protocolo complementa o `AGENTS.md` e deve ser tratado como regra operacional vigente do projeto.
