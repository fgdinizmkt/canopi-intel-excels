# Decisões arquiteturais

## Objetivo
Registrar decisões técnicas e de produto já tomadas e consolidadas, para evitar reabrir discussões resolvidas em sessões futuras.

---

## Decisões consolidadas

### 1. Arquitetura antes de engenharia
**Decisão:** a base documental (visão, arquitetura, fronteiras, specs) foi criada antes de qualquer construção de tela.

**Implicação:** toda nova página ou feature deve ter papel claro, fronteira definida e critério de pronto antes de ser construída. Não se expande escopo por impulso.

**Onde está documentado:** `docs/00-visao-do-produto/`, `docs/01-arquitetura-do-sistema/`, `docs/02-estrutura-da-plataforma/` (em `refactor/organizacao-inicial`)

---

### 2. Next.js 15 App Router como direção técnica
**Decisão:** a plataforma usa App Router nativo com route group `(shell)`. O SPA bridge (App.tsx + main.tsx + [slug]/page.tsx) foi removido inteiramente.

**Estrutura atual:**
- `src/app/(shell)/layout.tsx` — shell com Sidebar + Topbar + footer + modal
- `src/app/(shell)/<rota>/page.tsx` — uma por página, com auth check + import direto de `src/pages/`
- `src/pages/*.tsx` — componentes canônicos das páginas

**Implicação:** não criar novos bridges ou wrappers alternativos. Toda nova rota entra como `(shell)/<rota>/page.tsx`.

**Commits:** `aec688c` (Fase 4 técnica), `b4981a8` (PR #10)

---

### 3. Conta como domínio-mãe
**Decisão:** `Conta` é a entidade central do sistema. Todas as outras entidades gravitam em torno dela.

**Implicação estrutural:**
- Sinais pertencem a contas
- Ações têm `accountName` como campo obrigatório
- Contatos pertencem a contas
- ABM e ABX operam sobre contas

**Onde está documentado:** `docs/01-arquitetura-do-sistema/04-mapa-de-relacoes-entre-entidades.md`

**Dado real:** `src/data/accountsData.ts` — `contasMock: Conta[]` com `sinais[]`, `acoes[]`, `prontidao`, `playAtivo`, `potencial`, `atividadeRecente`, `statusGeral`, `oportunidadePrincipal`

---

### 4. Sinais como camada de detecção — não de execução
**Decisão:** Sinais detectam, classificam e priorizam. Não executam.

**Implicação:**
- Sinais escrevem em `localStorage('canopi_actions')` para passar ações para a página Actions
- Actions lê esse localStorage via `adaptStoredAction()` com deduplicação defensiva
- Sinais não têm lógica de execução própria

**Dado real:** `src/data/signalsV6.ts` — `advancedSignals[]` com `severity`, `confidence`, `category`, `source`, `channel`, `probableCause`, `context`

---

### 5. IA como camada transversal — não como módulo isolado
**Decisão:** o Assistente é camada de sustentação transversal, não módulo operacional principal. Não deve roubar protagonismo das páginas núcleo.

**Implicação:** o Assistente entra depois que a lógica estrutural do sistema estiver clara. Não antes.

**Onde está documentado:** `docs/01-arquitetura-do-sistema/01-matriz-funcao-por-pagina.md`

---

### 6. Integrações como camada estrutural
**Decisão:** Integrações governa fontes, conectores e disponibilidade de dados. Não é página analítica de negócio.

**Implicação:** Integrações entra depois do núcleo principal. Seu valor aumenta quando já existe estrutura real para sustentar.

---

### 7. Inteligência Cruzada como camada estratégica
**Decisão:** CrossIntelligence aproveita aprendizados entre ABM e ABX. Depende de padrões e comparações entre os dois contextos. Deve vir depois de ABM e ABX.

**Commits:** PRs #1–#6 (evoluíram CrossIntelligence antes da migração estrutural)

---

### 8. Migração Supabase: estratégia defensiva e gradual
**Decisão:** Migração para Supabase segue padrão read-only, defensivo e gradual sem quebra de funcionalidade.

**Implicação estrutural:**
- **Repository pattern:** cada entidade tem `src/lib/{entity}Repository.ts` com `get{Entity}()` retornando tipo canônico
- **Fallback completo:** se Supabase não configurado ou erro → volta a mock imediatamente (sem falha)
- **Merge com mock:** dados do Supabase são mergeados com mock para campos não migrados ainda (sinais, ações, contatos, ABM, ABX, etc)
- **Shell seguro:** contas novas no Supabase sem mock correspondente recebem shell explícito com todos campos obrigatórios preenchidos (não cast frouxo)
- **Read-only primeiro:** primeira migração (E2) é apenas leitura. Writes vêm em recortes futuros
- **Logging de observabilidade:** pontos-chave de fallback e sucesso logam para visibilidade em prod

**Decisão de produto:** mocks nunca são removidos. São stepping stones para real data. Sua vida útil é prolongada enquanto migração acontece.

**Dado real:** `src/lib/accountsRepository.ts` (Recorte 22) implementa padrão para `Conta` — serve de template para futuras entidades.

**Commits:** `fd5b46d` (E1 preparação), `15ce264` (E2 primeira migração)

---

### 8.1 Responsabilidade Explícita em Camadas de Migração (Recorte 25)
**Decisão refinada:** Migração Supabase estabelece separação clara de responsabilidades entre contexto, repositório e página.

**Implicação estrutural (Recorte 25 em diante):**
- **AccountDetailContext (source of truth):** gerencia fila viva (sessionActions), localStorage, create/update direto
  - Nunca depende de Supabase — é a fonte primária operacional
  - Hidratação e sincronização locais são exclusivamente desta camada
  - Todas as operações de escrita passam aqui
- **Repository (`src/lib/{entity}Repository.ts`):** camada complementar/remota apenas
  - Retorna dados para complementar lacunas, não substitui source of truth
  - Em erro ou ausência de config → retorna [] (complemento vazio, não fallback para context)
  - Nunca reimplementa merge interno — merge é job da página
  - Read-only absoluto
- **Página (`src/pages/{Entity}.tsx`):** responsável pelo merge e UI
  - Merge explícito: camada local (context) sempre vence por id
  - useEffect do repositório roda uma vez (mount) — sem refetch desnecessário
  - `sessionActions` continua source of truth para toda lógica de UI

**Exemplo concreto (Recorte 25):**
```typescript
// Context = source of truth
const { sessionActions, createAction, updateAction } = useAccountDetail();

// Repository = complementar
const [supabaseActions, setSupabaseActions] = useState([]);
useEffect(() => {
  const remote = await getActions();  // retorna [] se erro
  setSupabaseActions(remote);
}, []);  // roda uma vez

// Merge = página
const allItems = useMemo(() => {
  const merged = [...sessionActions];  // base primária
  // adiciona do Supabase apenas se não existe por id
  for (const action of supabaseActions) {
    if (!mergedIds.has(action.id)) {
      merged.push(action);
    }
  }
  return merged;
}, [sessionActions, supabaseActions]);
```

**Benefício:** evita duas responsabilidades sobre mesma fonte, reduz refetch desnecessário, clareza de precedência.

**Commits:** `77eb41f` (E5 implementação com padrão claro)

---

### 8.2 Escrita Defensiva em Actions (Recorte 26)
**Decisão refinada:** Primeira escrita remota em `actions` segue padrão defensivo: best-effort, nunca bloqueia UX, sem rollback de UI.

**Implicação estrutural (Recorte 26 em diante):**
- **AccountDetailContext (source of truth intacto):** createAction() e updateAction() continuam local-first
  - `sessionActions` e `localStorage` são operacionais soberanos
  - Persistência remota é disparada DEPOIS da UI estar atualizada
  - Sem await bloqueando a ação local
- **persistAction() em Repository:** camada complementar de persistência
  - Upsert por id no Supabase
  - Mapeamento explícito ActionItem → ActionRow (sem spreads frouxos)
  - Falha silenciosa: loga erros, nunca relança, nunca impacta UX
  - Se Supabase não está configurado: skips automaticamente
- **Padrão fire-and-forget:** createAction/updateAction disparam persistAction().catch(() => {})
  - Não bloqueia retorno de id
  - Não bloqueia revalidação de estado local
  - Não requer retry sofisticado

**Helpers puros extraídos:**
- `buildNewAction(partialAction)`: montagem protegida sem spread aberto, id/status/createdAt imutáveis
- `applyActionPatch(action, patch, actor)`: cálculo de ação final com histórico automático antes de setState

**Exemplo concreto (Recorte 26):**
```typescript
// createAction: local-first + remote best-effort
const createAction = useCallback((partialAction) => {
  const newAction = buildNewAction(partialAction);  // puro
  setSessionActions(prev => [newAction, ...prev]);   // local, imediato
  persistAction(newAction).catch(() => {});          // remoto, fire-and-forget
  return newAction.id;
}, []);

// updateAction: snapshot + calcular + setState + persist
const updateAction = useCallback((actionId, patch, actor) => {
  const currentAction = sessionActions.find(a => a.id === actionId);
  if (!currentAction) return;
  const updatedAction = applyActionPatch(currentAction, patch, actor);  // puro
  setSessionActions(prev => prev.map(a => a.id === actionId ? updatedAction : a));
  persistAction(updatedAction).catch(() => {});  // remoto, fire-and-forget
}, [sessionActions]);
```

**Benefício:** separação nítida entre operação local (confiável, rápida, reativa) e persistência remota (complementar, assíncrona, opcional).

**Commits:** `bf676c60fd7484ed42f41dab757e81300abdeda4` (E6 implementação defensiva)

---

### 9. CSS: cada página com namespace próprio
**Decisão:** páginas que usam CSS inline (não Tailwind puro) devem prefixar suas classes para evitar colisões.

**Exemplos consolidados:**
- Signals: `signals.css` com classes `.filter-select`, `.hero-metric`, `.sig-*`
- Performance (main): CSS inline com prefixo `perf-*`

**Direção futura:** migrar progressivamente para Tailwind puro (consistente com Actions, Accounts, Overview).

---

### 10. Dados mock: caminho para dados reais
**Decisão:** a plataforma usa dados mock estruturados como stepping stone para dados reais. Os mocks devem refletir a estrutura real das entidades, não ser gerados aleatoriamente.

**Fontes de dados reais disponíveis:**
- `src/data/signalsV6.ts` — `advancedSignals`, `ownersList`, `stSuggestionsList`
- `src/data/accountsData.ts` — `contasMock: Conta[]`
- `src/data/mockData.ts` — `kpis`, `accountsAtRisk`, `priorities`, `pipelineInfluence` (legacy, reduzir dependência)

---

## Decisões ainda em aberto

| Questão | Estado | Observação |
|---|---|---|
| Portabilidade dos docs para main | Pendente | `docs/` completo existe só em `refactor/organizacao-inicial` |
| Performance.tsx: CSS inline vs Tailwind | Em decisão | Proposta em `docs/98-operacao/` |
| Contatos: página independente vs extensão de Contas | Em aberto | Existe `Contacts.tsx` mas sem auditoria feita |
| Conexão de Performance com dados reais | Pendente | `Performance.tsx` usa mock hardcoded desconectado dos dados reais |
| Side panels vs accordion expand | Em decisão | Main usa side panel; refactor usa accordion. Não decidido qual adotar |
