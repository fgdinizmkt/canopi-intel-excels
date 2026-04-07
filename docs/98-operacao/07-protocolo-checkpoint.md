# Protocolo Formal de CHECKPOINT — Canopi | Intel Excels

## Finalidade

Este protocolo estabelece a disciplina operacional de sincronização de estado entre:
- **Código versionado** (git, commits, branches)
- **Memória operacional** (documentação em `docs/98-operacao/`)
- **Contexto de sessão** (decisões, próximos passos, aprovações)

O objetivo é manter uma **fonte única de verdade** (o repositório) e permitir que qualquer sessão reconstrua o estado real do projeto sem adivinhar ou confiar em resumos anteriores.

---

## Arquivos Canônicos

Todos os arquivos listados abaixo são parte da memória operacional viva do projeto. Deles dependem decisões, aprovações e sequência de recortes.

| Arquivo | Responsabilidade |
|---|---|
| `docs/98-operacao/00-status-atual.md` | Estado vigente do projeto: fase atual, último recorte concluído, bloqueios, tabela de marcos |
| `docs/98-operacao/01-roadmap-fases.md` | Plano canônico: fases 1-10, recortes agendados, objetivos de longo prazo |
| `docs/98-operacao/02-decisoes-arquiteturais.md` | Decisões técnicas cristalizadas: padrões, exclusões, motivações |
| `docs/98-operacao/03-log-de-sessoes.md` | Histórico cronológico: cada sessão, contexto, ações executadas, resultado |
| `docs/98-operacao/06-checkpoint-atual.md` | Estado da sessão atual: último confiável, concluído, pendente, próximo passo **exato** |
| `docs/98-operacao/07-protocolo-checkpoint.md` | Este arquivo: governança de sincronização |

---

## Comandos Canônicos

### 1. `CHECKPOINT`
**Comando de salvamento operacional.**

Invocado quando há dúvida sobre o estado vigente ou ao final de uma etapa significativa.

**Procedimento:**
- Ler `06-checkpoint-atual.md` (este é o ponto de partida)
- Comparar com `00-status-atual.md` e `03-log-de-sessoes.md` (validação cruzada)
- Se tudo está sincronizado, responder com:
  - **Status:** resumo de 1 linha (ex: "Fase 9 — Recorte 16 concluído")
  - **Objetivo atual:** o que está em andamento agora
  - **O que está concluído:** estado validado no repositório
  - **O que está pendente:** bloqueadores ou próximas ações
  - **Próximo passo exato:** ação atômica e verificável

---

### 2. `CHECKPOINT SOS`
**Comando de resgate — usado quando a sessão perdeu contexto.**

Invocado quando há desconexão, dúvida severa ou suspeita de desincronização.

**Procedimento:**
- **Não continuar a tarefa cegamente.**
- Reconstruir o estado de verdade usando:
  1. `06-checkpoint-atual.md` (último estado confiável)
  2. `00-status-atual.md` (quadro geral)
  3. `03-log-de-sessoes.md` (sequência de ações)
  4. `git log --oneline` (evidência factual de commits)
- Responder com:
  - **Estado real reconstruído:** fatos verificados no repositório
  - **Nível de confiança:** alto, médio, baixo (explicar)
  - **Lacunas de contexto:** o que não pode ser derivado dos arquivos
  - **Próximo passo exato:** ação segura e validável

---

## Regra Universal de Leitura

Antes de qualquer ação — seja edição de código, abertura de nova frente, ou proposta de recorte — **obrigatoriamente**:

1. Ler `06-checkpoint-atual.md` (estado da sessão atual)
2. Validar contra `00-status-atual.md` (estado geral do projeto)
3. Se o estado está `LIMPO` ou `ATIVO`, prosseguir normalmente
4. Se houver inconsistência ou desconfiança, invocar `CHECKPOINT SOS` (entra em modo `RESGATE`)

**Exceção:** Se o usuário explicita novos contextos ou fatos que não estão documentados, aceitar como verdade e atualizar a memória após ação.

---

## Estados do Checkpoint

Um checkpoint reflete sempre um destes estados operacionais:

- **ATIVO:** Sessão em andamento. `06-checkpoint-atual.md` é atualizado a cada etapa significativa. Trabalho flui naturalmente sem bloqueios.
- **LIMPO:** Sessão anterior foi sincronizada integralmente. Documentação (`06`, `00`, `03`) estão em harmonia com o repositório (git). Pronto para nova sessão.
- **RESGATE:** Estado desincronizado ou desconfiança detectada. Invocado via `CHECKPOINT SOS`. Requer reconstrução factual do estado antes de prosseguir.

---

## Campos Mínimos Obrigatórios em `06-checkpoint-atual.md`

Todo checkpoint válido **deve conter**:

```markdown
# Checkpoint Atual — [data ISO]

**Status:** [uma linha: fase + último estado verificado]

## Objetivo Atual
[O que está sendo perseguido agora]

## Último Estado Confiável
[Commit hash ou recorte que validamos como funcionando]

## O que está concluído
- ✅ [Item 1]
- ✅ [Item 2]
...

## O que está pendente
- ⌛ [Bloqueador 1]
- ⌛ [Próxima tarefa]
...

## Próximo Passo Exato
[Uma frase imperativamente clara de ação atômica]
```

---

## Regras de Confiança

### Fontes de verdade (ordem de autoridade)

1. **Código versionado no repositório** (git)
   - `git log`, `git show`, `git diff` são infalíveis
   - Se o código está em `main` publicado em `origin/main`, é a verdade

2. **Documentação operacional** (`docs/98-operacao/`)
   - Sincronizada em commits separados
   - Governa decisões e sequência de trabalho
   - Quando há discrepância com o código, documentação fornece contexto, mas código é a realidade

3. **Memória de chat** (conversas anteriores)
   - Útil para contexto apenas
   - **Nunca é autoridade sobre estado do projeto**
   - Se há conflito com repositório, repositório vence sempre

### Transição para RESGATE

Um checkpoint passa para estado `RESGATE` (emergência) se:
- `06-checkpoint-atual.md` descreve um commit que não existe em git
- Estado descrito em `00-status-atual.md` não pode ser verificado no código
- Há desincronização clara entre documentação e repositório
- Usuário invoca `CHECKPOINT SOS` explicitamente
- Há lacunas de contexto que não podem ser preenchidas via documentação

---

## Regra Prática para o Usuário

Quando invocar cada comando e qual estado esperar:

| Situação | Comando | Estado Esperado |
|---|---|---|
| Confirmar em que estamos | `CHECKPOINT` | LIMPO ou ATIVO |
| Dúvida severa sobre estado | `CHECKPOINT SOS` | RESGATE → reconstruir → LIMPO |
| Contexto foi perdido | `CHECKPOINT SOS` | RESGATE → reconstruir → ATIVO |
| Tarefa importante em andamento | `CHECKPOINT` antes | Verificar estado (ATIVO ou LIMPO) |
| Sessão encerrada | `CHECKPOINT` final | Transição para LIMPO |
