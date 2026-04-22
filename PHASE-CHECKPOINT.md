# Phase Checkpoint — Decision MindMap Recovery & Local Exclusivity

**Data**: 2026-04-22  
**Estado**: Encerrado — Baseline Utilizável  
**Build**: ✅ Passing

---

## O QUE FICOU FUNCIONAL

### Core Tree Navigation
- ✅ Árvore completa navegável: signal → evidências → hipóteses → decisões → opções → ações
- ✅ Conectores coerentes em toda a árvore (signal/ev/hyp/dec/opt/act)
- ✅ Seleção de qualquer nó sem quebras ou travamentos
- ✅ Drawer abre com detalhes do nó selecionado
- ✅ Tooltip hover único consolidado

### Viewport & Layout
- ✅ Bounds seguros com PADDING (TOP 180, LEFT/RIGHT 80, BOTTOM 150)
- ✅ Vertical spacing uniforme (VERTICAL_SPACING 280)
- ✅ Canvas height dinâmico com offset awareness
- ✅ Min-height viewport 1200px (seguro para conteúdo)
- ✅ Drag & offset preservation funcional

### Local Exclusivity (Option Selection)
- ✅ Estado `chosenOptionPerDecision` rastreia qual opção foi clicada **por decisão**
- ✅ Styling visual para opção escolhida: ring-teal-300, border-teal-500 (diferenciado)
- ✅ Opção irmã automaticamente perde destaque
- ✅ Drawer mostra apenas opção escolhida (filter de alternativas)
- ✅ Implementação **local e segura** — sem afetar visibleCards ou árvore global

### Code Quality
- ✅ Build passa sem erros de compilação
- ✅ TypeScript tipos validos
- ✅ Sem regressões estruturais vs. Phase 2 baseline

---

## O QUE FICOU COMO DÉBITO

### 1. Drawer Auto-Open (Baixa Prioridade)
**Descrição**: Ao escolher uma opção, o drawer não abre automaticamente.  
**Comportamento atual**: Clica opção → opção fica highlighted → drawer permanece fechado (precisa clicar nó para abrir)  
**Débito**: UX flow poderia ser mais fluido  
**Risco de implementar**: Baixíssimo — é apenas uma `setSelectedCard(id)` a mais

### 2. Ações Filtradas por Opção (Médio)
**Descrição**: Ações (act1-1, act1-2, etc.) aparecem sempre, independente de qual opção foi escolhida.  
**Comportamento atual**: Ao escolher opt1-1, a drawer mostra opt1-1 details, mas não filtra act1-1 vs act1-2  
**Débito**: Sem contexto visual de qual ação pertence a qual opção  
**Risco de implementar**: Médio — requer lógica de derivação de ações da opção, mas sem podar canvas

### 3. Limpeza de Estado ao Mudar de Ramo (Baixo)
**Descrição**: `chosenOptionPerDecision` persiste ao navegar para outro ponto de decisão.  
**Comportamento atual**: Se escolhe opt1-1, depois vai pra dec2, depois volta: opt1-1 ainda está marcada  
**Débito**: Pode ser confuso se o usuário espera "reset" ao sair de um ramo  
**Risco de implementar**: Muito baixo — `setChosenOptionPerDecision({})` ou filtro ao trocar selectedCard

### 4. Decision Ledger Integration (Fora escopo visual)
**Descrição**: Escolhas não estão sendo registradas em `signalCase.decisionLedger`.  
**Comportamento atual**: onDecisionRecorded é chamado ao clicar nó, mas não ao **escolher opção**  
**Débito**: Ledger histórico não reflete escolhas de alternativas  
**Risco de implementar**: Baixo — é apenas uma chamada onDecisionRecorded adicional

### 5. Multi-Decision Support (Não implementado)
**Descrição**: Atualmente apenas `decisionPoints[0]` é renderizado.  
**Comportamento atual**: Só há 1 ponto de decisão na árvore (3 opções)  
**Débito**: Se houver múltiplas decisões em sequência, lógica de escolha pode quebrar  
**Risco de implementar**: Médio — requer iteração sobre decisionPoints[0..N]

---

## PRÓXIMO RECORTE RECOMENDADO

### Phase 4 — UX Fluidity & Contextual Display (se autorizado)

**Escopo mínimo (sem quebra de baseline):**

1. **Drawer Auto-Open** (15 min)
   - Ao `setChosenOptionPerDecision`, chamar também `setSelectedCard(nodeId)`
   - Risco: Muito baixo
   - Impacto: UX melhora significativamente

2. **Ações Filtradas** (30 min)
   - Ao escolher opt1-1, filtrar drawer para mostrar apenas act1-1
   - Implementar via helper: `getActionsForOption(optionId)`
   - Risco: Médio (requer entender relação opt→act)
   - Impacto: Contexto visual claro

3. **Reset por Ramo** (10 min)
   - Ao sair de uma subtree (volta ao signal), limpar chosenOptionPerDecision
   - Impacto: Clareza cognitiva

**Escopo ampliado (se houver tempo):**

4. **Decision Ledger** (20 min)
   - Ao escolher opção, registrar em signalCase.decisionLedger
   - Estrutura: `{ stage, decision, owner, timestamp }`

5. **Multi-Decision** (TBD)
   - Iterar sobre todos decisionPoints, não apenas [0]
   - Risco: Alto — requer refactor significativo

---

## DÉBITO CONSOLIDADO

| Débito | Prioridade | Risco | Tamanho |
|--------|-----------|-------|--------|
| Drawer Auto-Open | Alta | Baixo | XS |
| Ações Filtradas | Média | Médio | S |
| Reset por Ramo | Média | Baixo | XS |
| Decision Ledger | Baixa | Baixo | S |
| Multi-Decision | Baixa | Alto | L |

**Total débito**: ~1.5h se implementado Phase 4 (escopo mínimo)

---

## CHECKPOINT FINAL

**Baseline Atual**: ✅ Utilizável e Estável  
**Estado MindMap**: Árvore viva, conectores coerentes, exclusividade local funcional  
**Build Status**: Passing  
**Code Quality**: Aceitável (sem regressões)  
**Próximo Milestone**: Phase 4 (UX Fluidity) — Aguardando autorização

---

**Fase encerrada sem commit. Pronto para consolidar ou iniciar Phase 4.**
