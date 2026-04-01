# Regras do processo operacional

## Objetivo
Tornar explícito o que deve acontecer após cada evento do projeto. Nada aqui é opcional.

---

## Regra 0 — Fluxo obrigatório antes de qualquer commit

Toda implementação segue esta sequência, sem exceção:

1. Executar o recorte autorizado
2. Mostrar resultado do build (`✓ Compiled` ou erros)
3. Mostrar `git diff --stat`
4. Mostrar diff real do arquivo alterado
5. **Aguardar aprovação explícita do usuário**
6. Só então commitar
7. Só então atualizar a memória operacional
8. Só então fazer commit da documentação, se necessário

Commitar antes da aprovação explícita é uma violação de processo, mesmo que o build esteja limpo e o recorte esteja dentro do escopo autorizado.

---

## Regra 1 — Toda etapa concluída atualiza a memória operacional

Quando um recorte for implementado, commitado e validado:

| Arquivo | O que atualizar |
|---|---|
| `00-status-atual.md` | Mover item de "em andamento" para "concluído"; atualizar "próximo passo aprovado" |
| `03-log-de-sessoes.md` | Adicionar entrada com data, o que foi feito, commits (hash + mensagem), PRs, impacto |

---

## Regra 2 — Toda mudança de fase atualiza três arquivos

Quando uma fase mudar de status (ex: "em andamento" → "concluída"):

| Arquivo | O que atualizar |
|---|---|
| `00-status-atual.md` | Atualizar fase atual e o que está em andamento |
| `01-roadmap-fases.md` | Atualizar status da fase na tabela; marcar critério de pronto como atingido |
| `03-log-de-sessoes.md` | Registrar a mudança de fase, com data e contexto |

---

## Regra 3 — Toda decisão arquitetural consolidada ou alterada atualiza um arquivo

Quando uma decisão técnica ou de produto for tomada ou revisada:

| Arquivo | O que atualizar |
|---|---|
| `02-decisoes-arquiteturais.md` | Adicionar nova decisão na seção "Decisões consolidadas" ou mover item de "em aberto" para "consolidado" |

---

## Regra 4 — Toda pendência identificada é registrada imediatamente

Quando qualquer pendência, risco ou bloqueio for identificado:

| Arquivo | O que atualizar |
|---|---|
| `00-status-atual.md` | Adicionar na tabela "Riscos e pendências" |

---

## Regra 6 — Protocolo de Mudança Visual

A estética premium é um pilar não-negociável do projeto. Nenhuma mudança operacional deve tornar a tela "fria", "árida" ou excessivamente densa.

### Fluxo de Aprovação Visual Obrigatória

Antes de qualquer mudança estrutural forte de UI (layout, hierarquia ou linguagem):

1. **Propor Direção Visual:** O agente descreve como pretende organizar os elementos.
2. **Explicar o Impacto:** O que ganha protagonismo e o que perde peso visual.
3. **Obter Aprovação:** O usuário deve validar explicitamente a direção proposta.
4. **Implementar:** Só após o "OK", o código é alterado.

### Diretrizes de UI

- Mudanças bruscas de layout ou densidade sem validação prévia são violação de processo.
- Ajustes incrementais podem seguir o fluxo normal (Regra 0).
- A clareza operativa deve caminhar junto com o design editorial/premium.

---

## Regra 5 — O que não está documentado é pendência do processo

Se uma etapa foi concluída e não está registrada em `03-log-de-sessoes.md`, isso é uma lacuna do processo — não da memória de chat.

A documentação deve ser autossuficiente para retomar o projeto em um novo chat sem perda de contexto.

---

## O que registrar em 03-log-de-sessoes.md

Cada entrada deve conter:

```
## YYYY-MM-DD — Descrição curta

**Fase:** Fase N — Nome da fase

**O que foi feito:**
- item 1
- item 2

**Commits:**
- `<hash>` — mensagem do commit

**PRs:**
- PR #N — título

**Impacto no projeto:**
- o que mudou no estado geral
- o que isso viabiliza a seguir
```

---

## O que NÃO registrar

- Especulações ou hipóteses não confirmadas
- Fatos que não estejam verificados no repositório ou no histórico git
- Detalhes de UX ou código que já ficam legíveis nos commits
- Listas genéricas sem contexto operacional
