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

### 8.3 Escrita Defensiva em Signals (Recorte 27)
**Decisão refinada:** Segunda escrita remota em `signals` segue padrão defensivo idêntico a E6, sem desvios.

**Implicação estrutural (Recorte 27 em diante):**
- **persistSignal() em Repository:** função complementar de persistência
  - Upsert por id no Supabase
  - Mapeamento explícito SignalItem → SignalRow (sem spreads frouxos)
  - Falha silenciosa: loga erros, nunca relança, nunca impacta UX
  - Se Supabase não está configurado: skips automaticamente
- **Integração em Signals.tsx (local-first):** confirmAssign() e archive() seguem padrão rígido
  - 1. Identificar alvo explicitamente (snapshot do sinal)
  - 2. Construir estado final ANTES de setState
  - 3. Atualizar estado local por id (não por condição ampla)
  - 4. Disparar persistSignal().catch(() => {}) (fire-and-forget, assíncrono)
  - Ordem garante: alvo snapshot = alvo update local = alvo persist remoto (sem divergência)
- **Tipagem:** Tipo `SignalItem` nomeado e explícito em signalsRepository.ts
  - Exportado para uso em Signals.tsx
  - Contém 20 campos: 6 obrigatórios (id, severity, category, archived, resolved, owner) + 14 opcionais
  - Compatível com advancedSignals estrutura
  - Mapeamento claro: SignalItem → SignalRow (subset para banco de dados)

**Exemplo concreto (Recorte 27):**
```typescript
// confirmAssign: exemplo de padrão defensivo em signals
const confirmAssign = () => {
  // 1. Identificar alvo
  const targetSignal = signals.find(x => x.flow === 'assign' && !x.archived);
  if (!targetSignal) { closeMid(); return; }

  // 2. Construir estado final ANTES de setState
  const updatedSignal = { ...targetSignal, resolved: true, owner: selOwner };

  // 3. Atualizar estado local por id
  setSignals(signals.map(x => x.id === targetSignal.id ? updatedSignal : x));

  // 4. Persistir remotamente (fire-and-forget)
  persistSignal(updatedSignal).catch(() => {});
};
```

**Benefício:** Total de 2 mutações de signals acopladas com persistência defensiva (confirmAssign, archive). Sem divergência entre snapshot, estado local e persistência remota.

**Commits:** `054254a0c96f07cb72f7433c069d2b08a40a8350` (E7 implementação defensiva em signals)

---

### 8.4 Escrita Defensiva em Contacts: Owner Assignment (Recorte 28.1)
**Decisão refinada:** Terceira escrita remota em `contacts` via micro-recorte 28.1. Owner assignment mínimo destrava E8 com padrão consolidado.

**Implicação estrutural (Recorte 28.1 em diante):**
- **AccountDetailView (estado local):** mantém cópia local dos contatos via `[localContatos, setLocalContatos]`
  - useEffect sincroniza com `account.contatos` quando account muda
  - Handler `handleUpdateContact(updatedContact)` atualiza a cópia local por id
  - Passa `onUpdateContact` callback e `accountId` real para ContactDetailProfile
- **persistContact() em Repository:** função complementar de persistência
  - Upsert por id no Supabase
  - Mapeamento explícito ContactItem → ContactRow (sem spreads frouxos)
  - Falha silenciosa: loga erros, nunca relança, nunca impacta UX
  - Se Supabase não está configurado: skips automaticamente
- **ContactDetailProfile (local-first):** owner assignment com padrão rígido
  - useEffect ressincroniza `ownerInput` e `ownerStatus` ao alternar contatos (dependência: contact.id, contact.owner)
  - handleAssignOwner():
    1. Snapshot contato-alvo
    2. Build estado final (ContatoConta puro)
    3. `onUpdateContact(updatedContact)` — LOCAL: setState imediatamente
    4. `persistContact({...updatedContact, accountId, accountName}).catch()` — REMOTO: fire-and-forget
  - Ordem garante: owner muda na UI na hora, persistência é background best-effort
- **Tipagem:** Tipo `ContactItem` nomeado e explícito em contactsRepository.ts
  - Exportado para uso em ContactDetailProfile
  - Contém 20 campos: id, nome, cargo, area, senioridade, papelComite, forcaRelacional, receptividade, acessibilidade, status, classificacao, influencia, potencialSucesso, scoreSucesso, ganchoReuniao, liderId, owner, accountId, accountName
  - Mapeamento claro: ContactItem → ContactRow (subset para banco de dados)

**Exemplo concreto (Recorte 28.1):**
```typescript
// AccountDetailView: local state + callback
const [localContatos, setLocalContatos] = useState<ContatoConta[]>(account?.contatos ?? []);
const handleUpdateContact = (updatedContact: ContatoConta) => {
  setLocalContatos(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
};

// ContactDetailProfile: local-first owner assignment
const handleAssignOwner = () => {
  if (!ownerInput.trim()) return;
  
  // 1. Snapshot
  const targetContact = contact;
  
  // 2. Build final state
  const updatedContact: ContatoConta = { ...targetContact, owner: ownerInput.trim() };
  
  // 3. Update local (local-first, imediato)
  if (onUpdateContact) {
    onUpdateContact(updatedContact);
  }
  
  // 4. Persist remoto (fire-and-forget)
  persistContact({
    ...updatedContact,
    accountId: accountId,
    accountName: accountName,
  }).catch(() => {});
};
```

**Benefício:** Owner assignment mínimo destrava E8 com padrão consolidado (local-first + fire-and-forget). Sem divergência entre snapshot, estado local e persistência remota.

**Commits:** `027191c` (E8 implementação defensiva em contacts via micro-recorte 28.1)

---

### 8.5 Escrita Defensiva em Contacts: Classificação Multi-toggle (Recorte 29)
**Decisão refinada:** Extensão do padrão defensivo de E8 para campo multi-seleção `classificacao` em contacts via inline toggles.

**Implicação estrutural (Recorte 29 em diante):**
- **ContactDetailProfile (local-first):** classificação toggle com padrão rígido idêntico ao owner assignment
  - Estado `[selectedClassifications, setSelectedClassifications]` com tipagem explícita de 7 tipos: 'Decisor' | 'Influenciador' | 'Champion' | 'Sponsor' | 'Blocker' | 'Técnico' | 'Negócio'
  - Estado `[classificationStatus, setClassificationStatus]` para feedback visual (1.5s)
  - Constante `classificationOptions` com 7 tipos tipados explicitamente
  - useEffect ressincroniza `selectedClassifications` e `classificationStatus` ao alternar contatos (dependência: `contact.id`, `contact.classificacao`)
  - `handleToggleClassification(classification: union type)`:
    1. Snapshot contato-alvo
    2. Build array togglado + nova ContatoConta
    3. `setSelectedClassifications() + onUpdateContact()` — LOCAL: setState imediatamente
    4. `persistContact({...updatedContact, accountId, accountName}).catch()` — REMOTO: fire-and-forget
  - UI: 7 botões toggle com cores semânticas (amber=Decisor, blue=Influenciador, emerald=Champion, purple=Sponsor, red=Blocker, slate=Técnico, indigo=Negócio)
    - Selecionado: ring effect + cores cheias + opacity-100
    - Deseleccionado: opacity-60 + cores reduzidas
    - Feedback texto aparece por 1.5s após toggle
- **Sem alterações no Repository:** persistContact() já suporta campo `classificacao` via ContactItem
- **Sem novo componente, hook ou spread:** padrão inline em ContactDetailProfile apenas, reusa `onUpdateContact` + `persistContact` existentes
- **Tipagem:** Union literal para `handleToggleClassification` parameter garante type safety sem `as any`

**Exemplo concreto (Recorte 29):**
```typescript
// ContactDetailProfile: classificacao toggle
const handleToggleClassification = (classification: 'Decisor' | 'Influenciador' | 'Champion' | 'Sponsor' | 'Blocker' | 'Técnico' | 'Negócio') => {
  // 1. Snapshot
  const targetContact = contact;

  // 2. Build toggled array + final state
  const newClassifications = selectedClassifications.includes(classification)
    ? selectedClassifications.filter(c => c !== classification)
    : [...selectedClassifications, classification];

  const updatedContact: ContatoConta = { ...targetContact, classificacao: newClassifications };

  // 3. Update local (local-first)
  setSelectedClassifications(newClassifications);
  if (onUpdateContact) {
    onUpdateContact(updatedContact);
  }

  // 4. Persist remoto (fire-and-forget)
  persistContact({
    ...updatedContact,
    accountId: accountId,
    accountName: accountName,
  }).catch(() => {});

  setClassificationStatus('Classificação atualizada');
  setTimeout(() => setClassificationStatus(null), 1500);
};
```

**Benefício:** Extensão natural de E8 para field multi-seleção. Reutiliza padrão defensivo consolidado (snapshot → build → local-first → fire-and-forget) sem novas abstrações. Classificação fica editável inline com feedback imediato.

**Commits:** `2e46a47` (E8.2 implementação defensiva em contacts via Recorte 29)

---

### 8.6 Leitura Defensiva em ABM (Recorte 30)
**Decisão refinada:** Primeira migração de leitura em ABM segue padrão defensivo idêntico a E2 (Accounts), sem escrita, sem ABX.

**Implicação estrutural (Recorte 30 em diante):**
- **abmRepository.ts (layer complementar/remota):** função `getAbm()` 
  - Query Supabase com explicit fields: id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico (não select('*'))
  - Fallback completo: Supabase não configurado ou erro → retorna `[]` (complemento vazio)
  - Logging de observabilidade: config check, query success, query error, exception handling
  - Type `AbmRow`: subset de Conta focusing on ABM scoring fields (id obrigatório + 8 campos opcionais)
- **AbmStrategy.tsx (responsável pelo merge e UI):** padrão rígido local-first
  - State `[supabaseAbm, setSupabaseAbm]` para dados remotos
  - useEffect carrega `getAbm()` uma única vez no mount (deps: `[]`)
  - useMemo `accounts`: merge explícito de contasMock (base) + supabaseAbm (complemento) por id
    - Merge defensivo com nullish coalescing (`??`): icp, crm, vp, ct, ft, tipoEstrategico, abm
    - Ignora contas remotas sem correspondente no mock (sem criar shells novos)
  - useEffect sincroniza `activeAccountId` com `accounts` (deps: `[accounts]`)
  - `activeAccount` derivado de `accounts` com dependências corretas
  - Todas UI derivações (heatmaps, TAL, métricas, posição) usam `accounts` em vez de contasMock

**Benefício:** ABM completa o trio de leituras (Accounts E2, Signals E3, ABM E10A). Padrão maduro validado 3x. ABX fica para Recorte 31 (E10B), mantendo escopo controlado.

**Commits:** `4aa13f3` (E10A implementação defensiva de leitura em ABM via Recorte 30)

---

### 8.7 Leitura Defensiva em ABX (Recorte 31)
**Decisão refinada:** Segunda migração de leitura em ABM (complementar) segue padrão defensivo idêntico a E10A (ABM), sem escrita.

**Implicação estrutural (Recorte 31 em diante):**
- **abxRepository.ts (layer complementar/remota):** função `getAbx()`
  - Query Supabase com explicit fields: id, abx (não select('*'))
  - Fallback completo: Supabase não configurado ou erro → retorna `[]` (complemento vazio)
  - Logging de observabilidade: config check, query success, query error, exception handling
  - Type `AbxRow`: subset de Conta focusing on ABX expansion fields (id obrigatório + abx opcional)
  - ABX é objeto aninhado com 9 campos opcionais: motivo, evolucaoJornada, maturidadeRelacional, sponsorAtivo, profundidadeComite, continuidade, expansao, retencao, riscoEstagnacao
- **AbmStrategy.tsx (responsável pelo merge e UI):** padrão rígido local-first expandido
  - State `[supabaseAbx, setSupabaseAbx]` para dados remotos
  - useEffect carrega ABX em paralelo com ABM via `Promise.all([getAbm(), getAbx()])` (uma vez no mount)
  - useMemo `accounts`: merge explícito de contasMock (base) + supabaseAbm (complemento) + supabaseAbx (complemento) por id
    - Merge defensivo com nullish coalescing (`??`): campo abx (objeto aninhado)
    - Ignora contas remotas sem correspondente no mock (sem criar shells novos)
  - Dependências corretas: `[supabaseAbm, supabaseAbx]`
  - Todas UI derivações (heatmaps, TAL, métricas, posição) usam `accounts` merged com ABM + ABX

**Benefício:** ABX complementa E10A (pair E10A/E10B = ABM + ABX em harmonia). Padrão consolidado: E2 (Accounts) + E3 (Signals) + E10A (ABM) + E10B (ABX) = 4 leituras defensivas validadas. ABX read-only, sem impacto em existente.

**Commits:** `04f634f` (E10B implementação defensiva de leitura em ABX via Recorte 31)

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


---

### Decisão 11: Escrita Defensiva em ABM (Escopo Mínimo - Recorte 32)

No Recorte 32, abrimos o primeiro write path defensivo para a entidade ABM (E11A). A decisão arquitetural fundamental aqui foi a **restrição voluntária de escopo**:
- Apenas um único campo foi exposto à mutação remota (`tipoEstrategico`), garantindo uma superfície de risco minúscula.
- O repository `src/lib/abmRepository.ts` recebeu a função `persistAbm()`, usando unicamente `upsert` explícito referenciado na chave `id` (`{ onConflict: 'id' }`).
- A implementação segue o padrão *fire-and-forget* consolidado: a interface em `AbmStrategy.tsx` atualiza imediatamente (local-first) nos botões de estado estratégico, enfileirando o salvamento em background.
- Em caso de falha no servidor, o Supabase é silenciado e não propaga exceptions para a UI. Não há rollback para não frustrar a ação local de planejamento. O objetivo foi testar o "write shell" antes de expandir.
