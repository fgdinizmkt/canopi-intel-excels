# Especificações Visuais — Pendentes de Implementação

## Objetivo deste arquivo
Registrar especificações de UX/UI que foram identificadas, avaliadas e bloqueadas para implementação enquanto a régua de risco zero estiver ativa. Nenhum item aqui representa um recorte funcional concluído.

---

## Recorte 42 — Especificação Visual: QG de Narrativas Estratégicas ABM/ABX

### Status
`ESPECIFICAÇÃO APROVADA — IMPLEMENTAÇÃO BLOQUEADA`

Implementação reprovada por não atingir critério de risco zero operacional. O objetivo visual existe e está documentado. Nenhum código foi alterado, commitado em origin/main ou publicado.

### Arquivo Alvo
`src/pages/AbmStrategy.tsx`

### Problema Identificado
As seções "Narrativa Estratégica" (ABM, Recorte 40) e "Narrativa Expansionista" (ABX, Recorte 41) estão encapsuladas dentro do array `actionCards.avg`, aninhadas no card de Ranking ABM. Isso produz:

1. **Acúmulo visual:** O card de ranking contém posição, tipo estratégico, play ativo, duas seções de narrativa completas (cada uma com estados de edição/leitura, textareas, botões de salvar) e o mini-ranking dos top 5. Densidade excessiva.
2. **Hierarquia ambígua:** Narrativa estratégica e narrativa expansionista têm a mesma hierarquia visual de labels de configuração (Tipo Estratégico, Play Ativo), o que não reflete sua natureza diferente.
3. **Simetria não perceptível:** A simetria técnica entre ABM e ABX (implementada nos Recortes 40 e 41) não é perceptível visualmente porque os dois blocos são horizontalmente adjacentes dentro de um card estreito.
4. **Slot ocioso:** O slot `xl:col-span-5` do grid principal está vazio — um `<div>` sem conteúdo — desde a criação do layout.

### Intenção de Design
- Emancipar as narrativas ABM e ABX para o slot `xl:col-span-5`, que está atualmente ocioso.
- Criar um painel "QG de Narrativas" com hierarquia clara, lado a lado em um grid `md:grid-cols-2`.
- Remover as seções de narrativa do card de Ranking, deixando-o com responsabilidade única: posição, tipo estratégico, play ativo, ranking dos top 5.
- Tornar visualmente perceptível a simetria estratégica entre a tese de Aquisição (ABM) e a tese de Expansão (ABX).

### Escopo Esperado de Alteração Futura

| Operação | Localização | Linhas estimadas |
|---|---|---|
| Remover | `actionCards.avg` — seções de narrativa ABM e ABX com UI de edição/leitura | ~130 linhas removidas |
| Adicionar | `xl:col-span-5 div` — componente "QG de Narrativas" | ~175 linhas adicionadas |
| Alterar (cosmético) | `actionCards.avg` — label `space-y-3` para `space-y-4`; labels de MiniActions | ~8 linhas |

Handlers (`handleUpdateAbmNarratives`, `handleUpdateAbxNarratives`), states (`editingNarrative`, `strategyNarrative`, etc.) e persistência (local-first + Supabase fire-and-forget) permanecem intactos, sem modificação.

### Mapa de Impacto (para revisão futura antes de implementar)

| Vetor de Risco | Descrição |
|---|---|
| **Grid Layout** | `xl:col-span-5` passa de vazio para preenchido — altera a altura da row do grid no layout principal |
| **DOM Order** | Narrativas sobem da closure de mapeamento `actionCards.avg` para o componente de nível superior — muda a árvore de reconciliação do React para esses estados |
| **Responsividade** | O novo painel empilha em mobile (`grid-cols-1` → `md:grid-cols-2`) — altera o scroll height em telas menores |
| **Estado de Edição** | Mesmo state, ponto de renderização diferente — comportamento preservado, mas contexto visual muda |
| **Labels de MiniActions** | `Exportar CSV` → `Export`, `Atribuir AE` → `Owner`, `Criar Meta` → `Goal` — mudança de conteúdo textual na interface |
| **Badge de Posição** | `POSIÇÃO: Nº` → `TOP N` — mudança de label |
| **Cor de Badge** | `bg-blue-50 text-blue-600` → `bg-blue-100 text-blue-700` — mudança de estilo |

Nenhum dos vetores acima é nulo. Portanto, o critério de risco zero não é atingível para este objetivo.

### Diff de Referência (Inspeção Local)
Commit local gerado apenas para auditoria de diff, **nunca publicado em origin/main**:

```
SHA: e374cca6977de29942cf543081f03952fb4ed34a
Natureza: commit local de inspeção (descartado via git reset)
Status: NÃO publicado. origin/main permanece em f7c9255 (Recorte 41).
```

O diff completo está registrado na sessão de auditoria de 2026-04-10 no Log de Sessões.

### Critérios de Aceitação para Implementação Futura

A implementação só pode avançar quando **todos** os critérios abaixo forem satisfeitos:

1. A régua de risco zero for explicitamente relaxada pelo Orquestrador — registrada em nova entrada deste arquivo ou no Log de Sessões com data e autorização.
2. O diff do commit `e374cca` (ou equivalente atualizado) for revisado bloco a bloco pelo Orquestrador.
3. Cada vetor do Mapa de Impacto acima for avaliado individualmente e explicitamente aceito.
4. Build limpo (`npm run build`, `exit code: 0`) antes do commit de implementação.
5. `git diff --stat` confirmando que apenas `src/pages/AbmStrategy.tsx` foi alterado.
6. Aprovação explícita com a frase "autorizado para commit" registrada na sessão.
7. Commit e push apenas após aprovação — sem antecipação.

### Observação Explícita
Nenhum código foi publicado em `origin/main` como resultado deste Recorte 42. Nenhuma linha de `src/` foi alterada. O commit de inspeção local `e374cca` foi descartado via `git reset`. O branch local está sincronizado com `origin/main` no estado do Recorte 41.

O Recorte 41 permanece sendo o último marco funcional confiável do projeto.

---

*Documento criado em: 2026-04-10*
*Autor: Antigravity (Direção Visual)*
*Status: Especificação ativa — implementação bloqueada pela régua de risco zero*
