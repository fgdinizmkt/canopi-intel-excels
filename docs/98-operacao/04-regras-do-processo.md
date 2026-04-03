# Regras do processo operacional

## Objetivo
Tornar explícito o que deve acontecer após cada evento do projeto. Nada aqui é opcional.

---

## Protocolo Fixo de Operação

A operação do projeto é orquestrada por uma combinação de agentes especializados. Antes de qualquer prompt, a escolha do agente deve ser explícita.

### Papéis dos Agentes

#### 1. Claude Code (Terminal/Agente de Execução)
- **Especialidade:** Auditoria técnica, refatoração de alta precisão, implementação de lógica e código.
- **Responsabilidade:** Execução de comandos, validação de build, geração de diffs, commits de código e fechamentos documentais operacionais.

#### 2. Antigravity (Agente de Design/UX)
- **Especialidade:** Direção visual, estrutural de página, densidade de dados e narrativa visual.
- **Responsabilidade:** Garantir a estética premium e hierarquia de informação. Implementa quando o foco principal for a experiência visual aplicada ao componente.

#### 3. ChatGPT (Orquestrador)
- **Especialidade:** Visão estratégica, corte de escopo, escolha do agente ideal e revisão crítica.
- **Responsabilidade:** Garantir a coerência com a memória operacional total e evitar deriva rítmica das fases do roadmap.

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

---

## Regras Adicionais de Execução

### 1. Sincronismo e Leitura
- **Sync Global:** Antes de qualquer trabalho em pasta local, o agente deve garantir sincronia total (`git status`, `git fetch origin`, `git rev-parse HEAD`, `git rev-parse origin/main`).
- **Git Pull:** Só realizar `git pull --ff-only origin main` se a working tree estiver limpa e o local estiver atrás do remoto.
- **Leitura Mandatória:** É obrigatório ler os arquivos de governança (`docs/98-operacao/`) e o status atual antes de agir.

### 2. Fluxo de Diálogo
- **Seleção de Agente:** O usuário deve ser informado de qual agente executará a tarefa antes do envio do prompt de ação.
- **Última Mensagem:** O agente nunca deve ignorar o contexto ou instruções contidas na última mensagem do usuário.
- **Retomada:** Em caso de interrupção (limite de tokens ou crash), a retomada deve ser orientada estritamente pela memória operacional (`00-status-atual.md` e `05-handoff-atual.md`).

### 3. Critério de Pronto
- **Aprovação Documental:** Um recorte só é considerado fechado quando a documentação operacional estiver completa e o usuário concordar explicitamente. Se o usuário considerar incompleto, a tarefa continua aberta.

---

## Governança, Política e Regras Complementares

Para garantir a continuidade e a transparência em chats subsequentes ou trocas de contexto, as seguintes políticas são mandatórias:

### 1. Prompt de Continuidade Obrigatório
Toda resposta de fechamento de recorte deve, obrigatoriamente, propor o próximo prompt de continuidade. A próxima ação nunca deve ficar implícita ou dependente da memória de curto prazo do chat.

### 2. Separação entre Pedido Explícito e Inferência
O orquestrador deve distinguir claramente o que foi solicitado literalmente pelo usuário (Escopo Explícito) do que é uma recomendação estratégica baseada na memória operacional (Escopo de Inferência). Recomendações não devem ser apresentadas como obrigações sem validação prévia.

### 3. Política de "Nenhuma Ponta Solta"
Toda pendência identificada durante um recorte deve ter um encaminhamento formal. Se não for resolvida no micro-recorte atual, deve entrar explicitamente no próximo prompt de continuidade ou ser registrada como risco/pendência em `00-status-atual.md`.

### 4. Aprovação Baseada em Evidência Técnica
A aprovação de um recorte depende da apresentação formal do seguinte conjunto mínimo:
- Lista de arquivos efetivamente alterados.
- Saída literal do `npm run build` (sucesso ou falha).
- `git diff --stat` do recorte.
- Diff real literal (completo ou segmentado por blocos).
- Checklist final de integridade.

### 5. Arquivos Grandes exigem Diff Segmentado
Para arquivos extensos (ex: `Actions.tsx`, `Performance.tsx`), o diff real deve ser entregue segmentado por blocos alterados (ex: Header, Filtros, Modal). Deve-se explicitar o que foi convertido para Tailwind, o que foi apenas estabilizado e o que permaneceu pendente.

### 6. Fidelidade da Lista de Alterações
Se um arquivo for mencionado como alterado em um relatório, ele deve obrigatoriamente aparecer no diff real correspondente. Se não houver alteração técnica, o arquivo não deve ser citado.

### 7. Prompts de Alta Densidade e Baixa Redundância
Priorizar instruções práticas, definições de escopo e evidências. Evitar repetições de contexto óbvio ou saudações desnecessárias que consomem tokens e reduzem a clareza operativa.

### 8. Idioma Operacional (PT-BR)
Toda comunicação operacional e documental deste repositório deve ocorrer exclusivamente em **Português do Brasil**:
- Não alternar idioma sem solicitação explícita do usuário.
- Prompts, diagnósticos, handoffs, aprovações, checklists e relatórios devem permanecer em PT-BR.
- Comentários técnicos em arquivos de código podem seguir o padrão do arquivo original (geralmente inglês), mas o contexto operacional de suporte deve ser em português.

### 9. Governança e Precisão Técnica (Documento Complementar Oficial)
Para reduzir a recorrência de retrabalho e garantir a integridade da comunicação operacional, as regras de **Aderência Semântica**, **Reenquadramento Obrigatório**, **Taxonomia Técnica** e **Pré-validação** estão consolidadas no documento oficial:
- [06-governanca-complementar.md](./06-governanca-complementar.md)

Toda entrega deste repositório deve obrigatoriamente seguir as diretrizes contidas no arquivo acima, sob risco de bloqueio automático de aprovação em caso de imprecisão técnica ou semântica.
