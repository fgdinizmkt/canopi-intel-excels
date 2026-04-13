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

### 8.3.1 Drawer Synchronization Pattern (Recorte 37)
**Decisão nova:** Quando uma entidade é exibida em dois lugares de estado (array de fonte e drawer de detalhe), mutações no array devem sincronizar explicitamente o drawer.

**Contexto do problema:**
- `signals` array é a fonte de verdade
- `drawer` é estado separado que exibe detalhe de 1 sinal
- Quando handler atualiza signal no array via setSignals(), drawer permanecia stale (exibia valores antigos)
- Exemplo: usuário edita `context` de um sinal aberto no drawer → `setSignals()` atualiza array → drawer exibe valor antigo

**Solução implementada (Recorte 37):**
```typescript
// Em handleUpdateSignalNarrativas():
setSignals(prev => 
  prev.map(s => s.id === signalId ? updatedSignal : s)
);

// Sincronização explícita: se sinal editado está aberto no drawer
if (drawer?.id === signalId) {
  setDrawer(updatedSignal);  // imediatamente reflect
}

persistSignal(updatedSignal).catch(() => {});
```

**Padrão genérico (aplicável a outras entidades):**
- Identifique pares estado: (array-source, detail-view)
- Após setState no array-source, detecte se detalhe aberto = alvo mutação
- Se sim: setDetailView(mutatedEntity) para sincronizar imediatamente
- Implementação é mínima (1 linha if), benefício é imenso (zero staleness)

**Benefício:** Drawer nunca exibe valores antigos. Sincronização é imediata, sem lag entre array update e detail view.

**Aplicabilidade futura:** Padrão escalável para Accounts.drawer, Actions.overlay, Contacts.detail — qualquer entidade com view "list + detail" separada.

**Commits:** `16e673e` (E7.1 implementação de drawer synchronization em signals)

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

### Decisão 15: Escrita Defensiva em Contacts — Campos Narrativos com Atomicidade (Recorte 38 — E8.1)

No Recorte 38, expandimos o padrão E8 para incluir três novos campos narrativos (`observacoes`, `historicoInteracoes`, `proximaAcao`) com ênfase especial em **atomicidade contra race conditions** e **sincronização implícita via props**. A decisão arquitetural fundamental aqui foi a aplicação consolidada do padrão atômico (validado em E9C para Accounts) em um componente de detalhe cujo estado de contato é derivado de array-source via prop, garantindo sincronização automática sem setters explícitos.

**Implicação estrutural (Recorte 38 em diante):**

- **Type extensões em src/data/accountsData.ts:** Interface `ContatoConta` expandida com 3 campos narrativos opcionais
  ```typescript
  export interface ContatoConta {
    // ... campos existentes ...
    observacoes?: string;           // Observações tácticas sobre o stakeholder
    historicoInteracoes?: string;   // Histórico de interações e pontos-chave
    proximaAcao?: string;           // Próxima ação recomendada com este stakeholder
  }
  ```

- **Type extensões em src/lib/contactsRepository.ts:**
  - `ContactItem` expandido com 3 campos narrativos
  - `ContactRow` expandido com 3 campos narrativos (interface de persistência)
  - `RepositoryContact` expandido com 3 campos narrativos (return type)
  - `getContacts()` SELECT query expandida para incluir `observacoes, historicoInteracoes, proximaAcao`
  - Merge defensivo com nullish coalescing (`??`): preserva valores mock quando Supabase retorna null/undefined
  - Shell seguro (fallback quando sem mock) popula todos 3 campos

- **PERSIST WRITE:** `persistContact()` em `src/lib/contactsRepository.ts` expandida
  - Mapeamento explícito: todos 3 campos narrativos incluídos no ContactRow
  - Upsert explícito: `.upsert(contactRow, { onConflict: 'id' })`
  - Falha silenciosa: erros logados com `console.error()`, nunca relançados
  - Se Supabase não configurado: skips automaticamente

- **LOCAL-FIRST UPDATE — PADRÃO ATOMICAMENTE GARANTIDO + CALLBACK SYNC:** Novo `handleUpdateNarrativas()` em `src/components/account/ContactDetailProfile.tsx`
  - Padrão rígido com 3 passos (sincronização implícita via prop derivada):
    1. **SNAPSHOT:** Captura snapshot completo do contato (todos 3 campos narrativos)
    2. **SETSTATE CALLBACK:** Uma única chamada `onUpdateContact(updatedContact)` que atualiza todos 3 campos simultaneamente no array-source (`localContatos`) em `AccountDetailView` (componente pai)
    3. **PERSIST:** Uma única chamada `persistContact()` com snapshot completo (não valores parciais/atuais)
  - **Sincronização implícita via prop:** Contato em `ContactDetailProfile` é prop derivada via `localContatos.find(c => c.id === contact.id)`. Quando `onUpdateContact()` atualiza array-source, re-render automático propagadiza novo valor via prop, sincronizando estados locais (`observacoes`, `historicoInteracoes`, `proximaAcao`) via useEffect existente.
  - Pseudocódigo:
    ```typescript
    const handleUpdateNarrativas = () => {
      // 1. Snapshot (para validação, embora não usado aqui)
      const targetContact = contact;
      
      // 2. Build estado final (todos 3 campos)
      const updatedContact: ContatoConta = {
        ...targetContact,
        observacoes: observacoes.trim(),
        historicoInteracoes: historicoInteracoes.trim(),
        proximaAcao: proximaAcao.trim(),
      };
      
      // 3. Dispara callback (o qual atualiza localContatos em AccountDetailView)
      if (onUpdateContact) {
        onUpdateContact(updatedContact);  // atualiza array-source em AccountDetailView
      }
      
      // 4. Persistir (fire-and-forget, desacoplado do estado local)
      persistContact({
        ...updatedContact,
        accountId: accountId,
        accountName: accountName,
      }).catch(() => {});
    };
    ```
  - Garantia: nenhuma chance de dois persists concorrentes sobrescreverem um ao outro (1 snapshot + 1 setState via callback + 1 persist). Sincronização implícita de drawer: prop `contact` recebe novo valor automaticamente quando pai re-renderiza.

- **UI — Seção Narrativas Operacionais:** Nova seção em `src/components/account/ContactDetailProfile.tsx`
  - Estado local: 5 hooks (`editingNarrative: boolean`, `observacoes`, `historicoInteracoes`, `proximaAcao`, `narrativeStatus: string | null`)
  - useEffect sincroniza todos 5 ao mudar contact.id
  - Modo read: exibe 3 campos com labels "Obs:", "Hist:", "Próx:" e snippet truncado
  - Modo edit: toggle button (✎) abre 3 textareas com conteúdo completo
  - Botão save dispara `handleUpdateNarrativas()`, mostra feedback "✓ Salvo" por 1.5s
  - Placeholder quando todos campos vazios
  - Sem alteração em Contacts.tsx, grade ou board (escopo isolado em ContactDetailProfile)

- **Tipagem:** Sem novo tipo — reutiliza `ContatoConta` estendida
  - Imports atualizados em ContactDetailProfile.tsx para incluir tipos e `persistContact`
  - Sem `as any`, mapeamento explícito de 3 campos

**Benefício arquitetural:** E8.1 demonstra que o padrão atomicamente garantido (E9C) é escalável a entidades com componentes de detalhe cuja state é prop derivada de array-source. A sincronização implícita (via re-render com prop atualizada) é mais simples que sincronização explícita (setDrawer() condicional em E7.1), eliminando lógica condicional. A consolidação de 1 snapshot + 1 setState (callback no pai) + 1 persist é a chave para evitar divergência remota. Futuras expansões em contacts com múltiplos campos correlatos podem seguir este template exatamente.

**Validação de padrão:** E8.1 é a terceira aplicação do padrão atomicamente garantido (E9: Accounts tipoEstrategico → E9C: Accounts narrativos → E8.1: Contacts narrativos). Padrão consolidado e repetível em qualquer escrita defensiva multi-field. Nota arquitetural: E7.1 (Signals) usa sincronização explícita (setDrawer condicional), enquanto E8.1 (Contacts) usa sincronização implícita (prop derivada) — ambas válidas, escolha depende de arquitetura de state parent/child.

**Commits:** `8abd084` (E8.1 implementação defensiva de campos narrativos em Contacts via Recorte 38 com atomicidade garantida e drawer sync)

---

### Decisão 16: Escrita Defensiva em Actions — Campos Narrativos com Atomicidade (Recorte 39 — E6.1)

No Recorte 39, expandimos o padrão E6 para incluir três novos campos narrativos (`resolutionPath`, `executionNotes`, `learnings`) com ênfase especial em **atomicidade contra race conditions** e **aba discreta no overlay**. A decisão arquitetural fundamental aqui foi a quarta validação do padrão atômico (consolidado em E9/E9C/E8.1) em uma entidade com UI overlay de detalhe.

**Implicação estrutural (Recorte 39 em diante):**

- **Type extensões em src/data/accountsData.ts:** Interface `ActionItem` expandida com 3 campos narrativos opcionais
  ```typescript
  export interface ActionItem {
    // ... campos existentes ...
    resolutionPath?: string;      // Como a ação está sendo resolvida / trilha de resolução
    executionNotes?: string;      // Notas operacionais correntes de execução
    learnings?: string;           // Aprendizados acumulados durante a execução
  }
  ```

- **Type extensões em src/lib/actionsRepository.ts:**
  - `ActionRow` expandido com 3 campos narrativos (interface de persistência)
  - `getActions()` SELECT query expandida para incluir `resolutionPath, executionNotes, learnings`
  - Shell seguro (fallback quando sem mock) popula todos 3 campos
  - `persistAction()` mapeamento explícito: todos 3 campos narrativos incluídos no upsert atomicamente garantido

- **ModalTab expandido em src/pages/Actions.tsx:**
  - +1 aba discreta: "narrativa" adicionada ao enum ModalTab (4ª aba ao lado de 'resumo', 'projeto', 'historico')
  - Sem alteração nas 3 abas existentes (escopo mínimo, encapsulado)

- **LOCAL-FIRST UPDATE — PADRÃO ATOMICAMENTE GARANTIDO:** Novo `handleUpdateNarrativas()` em `src/pages/Actions.tsx`
  - Padrão rígido com 4 passos:
    1. **SNAPSHOT:** Captura snapshot completo da ação (todos 3 campos narrativos)
    2. **SETSTATE LOCAL:** Uma única chamada `updateAction()` que atualiza todos 3 campos simultaneamente (sem await)
    3. **PERSIST:** Uma única chamada `persistAction()` fire-and-forget (nenhuma espera, falha silenciosa)
    4. **FEEDBACK:** Timeout de 1.5s para mostrar "✓ Salvo" (sem persistência)
  - Pseudocódigo:
    ```typescript
    const handleUpdateNarrativas = () => {
      if (!item) return;

      // 1. Snapshot
      const targetAction = item;
      
      // 2. Build estado final (todos 3 campos)
      const updatedAction: ActionItem = {
        ...targetAction,
        resolutionPath: resolutionPath.trim(),
        executionNotes: executionNotes.trim(),
        learnings: learnings.trim(),
      };
      
      // 3. Atualizar local (fire-and-forget, sem await)
      updateAction(item.id, {
        resolutionPath: updatedAction.resolutionPath,
        executionNotes: updatedAction.executionNotes,
        learnings: updatedAction.learnings,
      });
      
      // 4. Feedback visual (desacoplado de persistência)
      setNarrativeStatus("✓ Salvo");
      setTimeout(() => setNarrativeStatus(null), 1500);
    };
    ```
  - Garantia: nenhuma chance de dois persists concorrentes sobrescreverem um ao outro (1 snapshot + 1 updateAction + 1 persistAction)

- **UI — Aba Discreta "Narrativa Operacional":** Nova aba em `src/pages/Actions.tsx` ActionOverlay
  - Estado local: 5 hooks (`editingNarrative: boolean`, `resolutionPath`, `executionNotes`, `learnings`, `narrativeStatus: string | null`)
  - useEffect sincroniza todos 5 ao mudar item.id
  - Modo read: exibe 3 campos com labels em uppercase e conteúdo truncado; placeholder se vazio
  - Modo edit: toggle button (✎) abre 3 textareas com conteúdo completo, placeholders descritivos
  - Botão save dispara `handleUpdateNarrativas()`, mostra feedback "✓ Salvo" por 1.5s
  - Sem alteração em outras 3 abas, grade ou detalhe resumido (escopo isolado em aba discreta)

- **Tipagem:** Sem novo tipo — reutiliza `ActionItem` estendida
  - Imports atualizados em Actions.tsx para incluir tipos e `persistAction`
  - Sem `as any`, mapeamento explícito de 3 campos

**Benefício arquitetural:** E6.1 é a quarta aplicação do padrão atomicamente garantido e demonstra que a consolidação de 1 snapshot + 1 setState + 1 persist é escalável a QUALQUER entidade com UI overlay. A aba discreta (não intrusiva nas 3 abas existentes) é estratégia de UI leve que mantém encapsulamento de escopo. Futuras expansões em actions com múltiplos campos correlatos podem seguir este template exatamente.

**Validação de padrão:** E6.1 é a quarta aplicação do padrão atomicamente garantido (E9 tipoEstrategico → E9C narrativos Accounts → E8.1 narrativos Contacts → E6.1 narrativos Actions). Padrão consolidado e repetível em qualquer entidade e UI (drawer prop, overlay componentizado, modal). Ciclo narrativo fechado: tríade core (Accounts, Signals, Actions) agora tem escrita defensiva com narrativas.

**Commits:** `a60f2f9` (E6.1 implementação defensiva de campos narrativos em Actions via Recorte 39 com atomicidade garantida e aba discreta)

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

### Decisão 12: Escrita Defensiva em ABM — Expansão de Escopo (Recorte 33 — E11B)

No Recorte 33, expandimos o padrão E11A para incluir novo campo `playAtivo`, demonstrando que o padrão defensivo é extensível a múltiplos campos sem quebra de arquitetura. A decisão foi fechar o **ciclo local-first completo** de playAtivo: READ / MERGE / LOCAL-FIRST UPDATE / PERSIST WRITE.

**Implicação estrutural (Recorte 33 em diante):**
- **Type `PlayAtivo`:** Union literal `'ABM' | 'ABX' | 'Híbrido' | 'Nenhum'` exportado de `abmRepository.ts`
- **READ:** `getAbm()` expandido para trazer `.select(..., playAtivo)` do Supabase em AbmRow
  - Campo `playAtivo?: PlayAtivo` adicionado à interface AbmRow
  - Query explícita inclui `playAtivo` na lista de campos (não select('*'))
  - Fallback: Supabase não configurado ou erro → retorna `[]` (complemento vazio)
- **MERGE:** `useMemo(accounts)` em `AbmStrategy.tsx` aplica merge defensivo com nullish coalescing
  - Padrão: `playAtivo: remote.playAtivo ?? merged[idx].playAtivo`
  - Garante: se remoto traz valor, usa; se undefined, preserva local
  - Sem divergência entre snapshot, estado local e persistência remota
- **LOCAL-FIRST UPDATE:** `handleUpdatePlayAtivo()` implementado com padrão idêntico a `handleUpdateTipoEstrategico()` (E11A)
  - 1. Snapshot conta-alvo
  - 2. Build estado final (AbmRow puro)
  - 3. `setSupabaseAbm()` — LOCAL-FIRST: setState imediatamente
  - 4. `persistAbm({ id, playAtivo }).catch()` — REMOTO: fire-and-forget
  - UI: 4 botões toggle (ABM, ABX, Híbrido, Nenhum) com feedback visual de seleção
- **PERSIST WRITE:** `persistAbm()` expandido para aceitar `playAtivo` junto com `tipoEstrategico`
  - Assinatura: `persistAbm(abm: { id: string; tipoEstrategico?: TipoEstrategico; playAtivo?: PlayAtivo })`
  - Upsert payload: `.upsert({ id, tipoEstrategico, playAtivo }, { onConflict: 'id' })`
  - Mapeamento explícito: apenas campos autorizado enviados (sem spreads frouxos)
  - Fire-and-forget: falha silenciosa, loga error, nunca impacta UX

**Benefício:** E11B valida que o padrão defensivo (local-first + fire-and-forget) é escalável. Próximas expansões de campos em ABM (ou outras entidades) podem seguir exatamente este template sem reabrir discussão arquitetural.

**Commits:** `1c91d31` (E11B implementação defensiva de playAtivo em ABM via Recorte 33)

---

### Decisão 13: Escrita Defensiva em Accounts (Recorte 34 — E9)

No Recorte 34, abrimos o primeiro write path defensivo para a entidade de **accounts** (E9), complementando os padrões estabelecidos em E11A/E11B (ABM) e E6-E8 (Actions, Signals, Contacts). O escopo é mínimo e focado: primeiro campo `tipoEstrategico` com UI apenas na view `lista`.

**Implicação estrutural (Recorte 34 em diante):**
- **Type `TipoEstrategico`:** Union literal `'ABM' | 'ABX' | 'Híbrida' | 'Em andamento'` já existe em `src/data/accountsData.ts` e é importado em `accountsRepository.ts`
- **PERSIST WRITE:** Novo `persistAccount()` implementado em `src/lib/accountsRepository.ts`
  - Assinatura: `async function persistAccount(account: { id: string; tipoEstrategico?: TipoEstrategico }): Promise<void>`
  - Persistência defensiva best-effort com upsert explícito por `id`
  - Upsert payload: `.upsert({ id, tipoEstrategico }, { onConflict: 'id' })`
  - Mapeamento explícito: apenas campos `{ id, tipoEstrategico }` enviados ao Supabase (payload mínimo)
  - Falha silenciosa: erros são capturados e logados com `console.warn()`, nunca relançados, nunca impedem retorno
  - Se Supabase não está configurado: skips automaticamente com `console.debug()`, retorna vazio
- **LOCAL-FIRST UPDATE:** `handleUpdateTipoEstrategico()` implementado em `src/pages/Accounts.tsx`
  - 1. Snapshot conta-alvo (validação)
  - 2. `setContas()` — LOCAL-FIRST: atualiza estado imediatamente (SEM await)
  - 3. `persistAccount({ id, tipoEstrategico })` — REMOTO: fire-and-forget (SEM await, SEM .catch())
  - Garantia: alvo snapshot = alvo update local = alvo persist remoto
- **UI — Escopo Mínimo:** 4 botões toggle (`ABM`, `ABX`, `Híbrida`, `Em andamento`) APENAS na view `lista`, coluna "Tipo estratégico"
  - Grade e board permanecem somente leitura neste recorte (mantêm comportamento de `openAccount(conta.id)` sem edição)
  - Cada botão dispara `handleUpdateTipoEstrategico(contaId, tipo)` ao clique
  - Feedback visual: botão ativo fica colorido (blue, purple, amber, slate); inativos ficam transparentes com hover
- **Tipagem:** Não há novo tipo — `TipoEstrategico` já existe
  - AccountRow já inclui `tipoEstrategico?: TipoEstrategico` (linha 26)
  - Imports atualizados em Accounts.tsx para incluir `persistAccount` e `TipoEstrategico`

**Benefício:** Abre escrita defensiva em accounts com padrão estabelecido, validando que o modelo local-first + fire-and-forget é agnóstico à entidade. Futuras expansões de campos em accounts (ou outras entidades) podem seguir exatamente este template. Grade e board permanecem intactos neste recorte, mantendo encapsulamento mínimo.

**Commits:** `650a4c4` (E9 implementação defensiva de tipoEstrategico em Accounts via Recorte 34)

---

### Decisão 14: Escrita Defensiva em Accounts — Campos Narrativos com Atomicidade (Recorte 36 — E9C)

No Recorte 36, expandimos o padrão E9 para incluir dois novos campos narrativos (`resumoExecutivo`, `proximaMelhorAcao`) com ênfase especial em **atomicidade contra race conditions**. A decisão arquitetural fundamental aqui foi a consolidação de um padrão multi-field defensivo que garante snapshot único e persist unificado.

**Implicação estrutural (Recorte 36 em diante):**
- **Type `AccountPersistPayload`:** Expandido para aceitar 4 campos
  ```typescript
  type AccountPersistPayload = {
    id: string;
    tipoEstrategico?: TipoEstrategico;
    playAtivo?: AccountRow['playAtivo'];
    resumoExecutivo?: string;
    proximaMelhorAcao?: string;
  };
  ```
  - Mapeia exatamente os 4 campos controláveis via UI
  - Todos opcionais (defensivo: undefined não sobrescreve banco)
- **PERSIST WRITE:** `persistAccount()` em `src/lib/accountsRepository.ts` expandida
  - Assinatura: `async function persistAccount(account: { id: string; tipoEstrategico?; playAtivo?; resumoExecutivo?; proximaMelhorAcao? }): Promise<void>`
  - Payload defensivo: constrói objeto incluindo APENAS campos definidos (guards `if (account.XXX !== undefined)`)
  - Upsert explícito: `.upsert(payload, { onConflict: 'id' })`
  - Falha silenciosa idêntica a E9: erros logados com `console.warn()`, nunca relançados
  - Se Supabase não configurado: skips automaticamente
- **LOCAL-FIRST UPDATE — PADRÃO ATOMICAMENTE GARANTIDO:** Novo `handleUpdateNarrativas()` em `src/pages/Accounts.tsx`
  - Padrão rígido com 3 passos ANTES de qualquer async:
    1. **SNAPSHOT:** Captura snapshot completo da conta (todos 4 campos): `const contaAtual = contas.find(c => c.id === contaId);`
    2. **SETSTATE:** Uma única chamada `setContas()` que atualiza AMBOS campos narrativos simultaneamente
    3. **PERSIST:** Uma única chamada `persistAccount()` com snapshot completo de todos 4 campos (não valores parciais/atuais)
  - Pseudocódigo:
    ```typescript
    const handleUpdateNarrativas = (contaId: string, newResumo: string, newAcao: string) => {
      // 1. Snapshot
      const contaAtual = contas.find(c => c.id === contaId);
      if (!contaAtual) return;
      
      // 2. SetState (ONE call, both fields)
      setContas(prev => prev.map(c =>
        c.id === contaId 
          ? { ...c, resumoExecutivo: newResumo, proximaMelhorAcao: newAcao } 
          : c
      ));
      
      // 3. Persist (ONE call, full snapshot)
      persistAccount({
        id: contaId,
        tipoEstrategico: contaAtual.tipoEstrategico,
        playAtivo: contaAtual.playAtivo,
        resumoExecutivo: newResumo,
        proximaMelhorAcao: newAcao
      });
    };
    ```
  - Garantia: nenhuma chance de dois persists concorrentes sobrescreverem um ao outro (snapshot + 1 setState + 1 persist)
- **UI — Modal Discreta:** Modal de edição narrativa em `src/pages/Accounts.tsx`
  - Trigger: ícone de edição (✎) na coluna "Próxima melhor ação" (hover visible)
  - Modal: overlay escuro, 2 textareas (resumoExecutivo: 3 linhas, proximaMelhorAcao: 3 linhas)
  - Placeholders descritivos: "Resumo executivo da conta..." / "Próxima melhor ação..."
  - Botões: "Cancelar" (fecha sem salvar) / "Salvar" (dispara `handleUpdateNarrativas()`, fecha modal)
  - Grade e board permanecem somente leitura (nenhuma mudança de escopo)
- **Tipagem:** Sem novo tipo — reutiliza `TipoEstrategico` e `AccountRow['playAtivo']`
  - Imports atualizados em Accounts.tsx para incluir `persistAccount` (já existente, apenas expandido)
  - Sem `as any`, mapeamento explícito de 4 campos

**Benefício arquitetural:** E9C demonstra que o padrão defensivo é escalável a múltiplos campos **com garantia de atomicidade contra race conditions**. A consolidação de 1 snapshot + 1 setState + 1 persist é a chave para evitar divergência remota. Futuras expansões em accounts (ou outras entidades com múltiplos campos correlatos) podem seguir este template exatamente.

**Benefício operacional:** Narrativas agora são editáveis com persistência defensiva, sem requerer navegação em ABM ou ABX. Escopo mantido mínimo: apenas lista de contas, modal discreta, sem tocar grade/board.

**Bug corrigido:** Implementação anterior com dois handlers separados (`handleUpdateResumoExecutivo` + `handleUpdateProximaMelhorAcao`) criava race condition onde segundo persist poderia sobrescrever primeiro se resolvidos out-of-order. Consolidação em `handleUpdateNarrativas()` elimina divergência.

**Commits:** `a6604c2` (E9C implementação defensiva de campos narrativos em Accounts via Recorte 36 com atomicidade garantida)

---

### Decisão 17: Escrita Defensiva em ABM — Campos Narrativos Estratégicos com Atomicidade e Tipagem Explícita (Recorte 40 — E12)

No Recorte 40, aplicamos o padrão defensivo consolidado ao domínio estratégico de ABM, expandindo a estrutura de ABM para incluir três campos narrativos (`strategyNarrative`, `riskAssessment`, `successCriteria`) **dentro do objeto abm aninhado**, com ênfase em **tipagem explícita** (nenhum `Record<string, any>`), **merge defensivo** (nullish coalescing para preservar mock), e **atomicidade contra race conditions**. A decisão arquitetural fundamental aqui foi a quinta validação consolidada do padrão atômico, aplicada a um objeto aninhado em vez de top-level.

**Contexto do problema:**
- ABM contém 9 campos operacionais existentes (`motivo`, `fit`, `cluster`, etc.) agrupados dentro de `Conta.abm`
- Os 3 novos campos narrativos devem viver **dentro desse mesmo objeto aninhado** (não top-level)
- Persistência remota de objetos aninhados requer cuidado extra com merge e tipagem para evitar perda de dados

**Implicação estrutural (Recorte 40 em diante):**

- **Type extensões em src/data/accountsData.ts:**
  - Interface `Conta.abm` expandida com 3 campos narrativos opcionais **dentro do objeto**:
    ```typescript
    abm: {
      motivo: string;
      fit: string;
      // ... 7 mais existentes ...
      // Narrativas estratégicas (E12)
      strategyNarrative?: string;  // Narrativa estratégica da abordagem
      riskAssessment?: string;     // Avaliação de riscos táticos
      successCriteria?: string;    // Critérios de sucesso mensuráveis
    };
    ```
  - Nenhuma mudança top-level de `Conta` — narrativas vivem exclusivamente dentro `abm`

- **Type extensões em src/lib/abmRepository.ts:**
  - Interface `AbmRow` expandida: campo `abm?` (objeto aninhado) inclui 3 novos campos narrativos
    ```typescript
    abm?: {
      // ... 9 operacionais existentes ...
      strategyNarrative?: string;
      riskAssessment?: string;
      successCriteria?: string;
    };
    ```
  - `getAbm()` SELECT query permanece **original** (sem adicionar colunas top-level para narrativas): `'id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico, playAtivo'`
    - Narrativas são lidas como parte do objeto JSON `abm`, não como colunas separadas
  - Merge defensivo com nullish coalescing: `{ ...remote.abm || {} }` preserva valores mock quando Supabase retorna undefined
  - Shell seguro (fallback quando sem mock) popula todos 3 campos narrativos dentro do objeto abm

- **PERSIST WRITE:** `persistAbm()` em `src/lib/abmRepository.ts` expandida com **tipagem explícita**
  - Assinatura: 
    ```typescript
    async function persistAbm(abm: {
      id: string;
      tipoEstrategico?: TipoEstrategico;
      playAtivo?: PlayAtivo;
      abm?: {  // Objeto aninhado com tipagem explícita
        strategyNarrative?: string;
        riskAssessment?: string;
        successCriteria?: string;
        // + 9 existentes
      };
    }): Promise<void>
    ```
  - **Nenhum `Record<string, any>`** — tipagem totalmente explícita via `abm?: AbmRow['abm']`
  - Payload defensivo: construído com type guards, apenas campos definidos enviados ao Supabase
  - Upsert explícito: `.upsert({ id, tipoEstrategico, playAtivo, abm }, { onConflict: 'id' })`
  - Falha silenciosa: erros logados com `console.error()`, nunca relançados
  - Se Supabase não configurado: skips automaticamente

- **LOCAL-FIRST UPDATE — PADRÃO ATOMICAMENTE GARANTIDO:** Novo `handleUpdateAbmNarratives()` em `src/pages/AbmStrategy.tsx`
  - Padrão rígido com 3 passos ANTES de qualquer async (consolidado de E9/E9C/E8.1):
    1. **SNAPSHOT:** Captura snapshot completo da conta e seu objeto abm aninhado
    2. **BUILD:** Constrói `updatedAbmObject` com spread: `{ ...activeAccount.abm, strategyNarrative: ..., riskAssessment: ..., successCriteria: ... }`
       - Spread preserva todos 9 campos operacionais existentes + adiciona 3 narrativos
    3. **SETSTATE:** Uma única chamada `setSupabaseAbm()` que atualiza o item por id
    4. **PERSIST:** Uma única chamada `persistAbm({ id: targetId, abm: updatedAbmObject })` com snapshot completo (não valores parciais)
  - Pseudocódigo:
    ```typescript
    const handleUpdateAbmNarratives = (narrative, risk, success) => {
      // 1. Snapshot target
      const targetId = activeAccount.id;
      
      // 2. Build: merge abm com novos campos narrativos
      const updatedAbmObject = {
        ...activeAccount.abm,
        strategyNarrative: narrative || undefined,
        riskAssessment: risk || undefined,
        successCriteria: success || undefined,
      };
      
      // 3. Create payload com tipagem explícita
      const updatedAbm: Parameters<typeof persistAbm>[0] = {
        id: targetId,
        abm: updatedAbmObject,  // Tipo é AbmRow['abm'], não any
      };
      
      // 4. Update local-first (imediato)
      setSupabaseAbm(prev => prev.map(item => 
        item.id === targetId ? { ...item, abm: updatedAbmObject } : item
      ));
      
      // 5. Fire-and-forget persist (background, sem bloquear)
      persistAbm(updatedAbm).catch(() => {});
    };
    ```
  - Garantia: nenhuma chance de dois persists concorrentes sobrescreverem um ao outro (1 snapshot + 1 setState + 1 persist unificado)

- **UI — Seção Discreta "Narrativa Estratégica":** Em `src/pages/AbmStrategy.tsx`
  - Trigger: toggle ✎ em header da seção (visible on hover)
  - Modo LEITURA: 3 textareas readonly com conteúdo (sem edit)
  - Modo EDIÇÃO: 3 textareas editáveis (strategyNarrative: 3 linhas, riskAssessment: 3 linhas, successCriteria: 3 linhas)
  - Placeholders: "Narrativa estratégica da abordagem...", "Avaliação de riscos...", "Critérios de sucesso..."
  - Botões: toggle ✎ abre edição, "Salvar" dispara `handleUpdateAbmNarratives()`, "Cancelar" fecha sem salvar
  - Feedback visual: badge "✓ Salvo" aparece por 1.5s após persist bem-sucedido
  - Grade e board permanecem somente leitura (nenhuma mudança de escopo)

- **Tipagem:** Não há novo tipo — reutiliza tipos existentes
  - `TipoEstrategico` e `PlayAtivo` já existem
  - Imports atualizados em AbmStrategy.tsx para incluir `persistAbm` (novo)
  - Sem `as any`, mapeamento explícito via `AbmRow['abm']`

**Benefício arquitetural:** E12 consolida que o padrão defensivo é totalmente agnóstico a estrutura de dados — aplicável tanto a campos top-level quanto a objetos aninhados. A ênfase em **tipagem explícita** (recusando `Record<string, any>`) e **merge com spread preservando estrutura aninhada** são lições críticas para futuras persistências complexas. Quinta aplicação consolidada do padrão atômico (E9 Accounts → E7.1 Signals → E8.1 Contacts → E6.1 Actions → E12 ABM).

**Benefício operacional:** Narrativas estratégicas de ABM agora são editáveis com persistência defensiva, sem requerer navegação externa. Escopo mantido mínimo: apenas seção discreta em ABM, sem tocar estrutura existente de 9 campos operacionais.

**Commits:** `88bceb3` (E12 implementação defensiva de narrativas estratégicas em ABM via Recorte 40 com atomicidade e tipagem explícita)

---

### Decisão 18: Escrita Defensiva em ABX — Campos Narrativos Estratégicos com Atomicidade e Simetria (Recorte 41 — E13)

No Recorte 41, expandimos o padrão defensivo e atômico para o domínio **ABX**, introduzindo três campos narrativos (`strategyNarrative`, `riskAssessment`, `successCriteria`) **dentro do objeto abx aninhado**. Esta decisão fecha a simetria estratégica com o domínio ABM (Recorte 40), consolidando o padrão de escrita defensiva para objetos compostos e reforçando a arquitetura local-first.

**Contexto do problema:**
- ABX possuía 9 campos operacionais (`motivo`, `evolucaoJornada`, etc.) agrupados dentro de `Conta.abx`.
- Era necessário adicionar narrativas estratégicas específicas para o contexto de expansão e retenção (ABX), mantendo a mesma experiência de usuário e integridade de dados de ABM.

**Implicação estrutural (Recorte 41 em diante):**

- **Modelagem (`src/data/accountsData.ts`):** 
  - Interface `Conta.abx` expandida com 3 campos narrativos opcionais (E13): `strategyNarrative`, `riskAssessment`, `successCriteria`.
- **Repository (`src/lib/abxRepository.ts`):**
  - Interface `AbxRow` expandida para incluir os 3 campos dentro do objeto `abx`.
  - Implementada função `persistAbx()` com **tipagem explícita** e payload mapeado campo a campo.
  - Upsert explícito por ID (`{ onConflict: 'id' }`) e comportamento fire-and-forget.
- **UI & Estado (`src/pages/AbmStrategy.tsx`):**
  - Implementado handler atômico `handleUpdateAbxNarratives()` seguindo o protocolo de 5 etapas: 
    1. **Snapshot** da conta ativa.
    2. **Build** do objeto final (`updatedAbxObject`) fundindo dados operacionais existentes com novas narrativas.
    3. **SetState** local-first no estado `supabaseAbx` para reflexão imediata na UI.
    4. **Persist** remoto assíncrono (fire-and-forget).
    5. **Feedback** visual ("✓ Salvo").
  - Adicionada seção "Narrativa Expansionista" no card de Ranking ABM, mantendo simetria visual com a seção de ABM.

**Benefício arquitetural:** Sexta aplicação consolidada do padrão atômico, agora abrangendo todos os principais domínios operacionais (Accounts, Signals, Actions, Contacts) e estratégicos (ABM, ABX). A simetria entre ABM e ABX simplifica a manutenção e garante que a tese estratégica da conta (entrada vs. expansão) seja capturada de forma consistente e segura, encerrando o ciclo de implementação da camada estratégica narrativamente editável.

**Commits:** `616a8ca` (E13 implementação defensiva de narrativas estratégicas em ABX via Recorte 41 com atomicidade)

---

### 8.4 Padrão Estruturado Leitura-Escrita em Arrays Aninhados (E14–E19: Oportunidades + Inteligência + Leitura Estruturada + Histórico + Tecnografia)

**Contexto (Recortes 45–50):**
Ao expandir a cobertura Supabase para entidades com múltiplos arrays (Oportunidades: `etapa` + `risco`; Inteligência: 6 arrays de learnings; Leitura Estruturada: 3 arrays de strings; Histórico Operacional: array estruturado; Tecnografia: array simples de strings), consolidamos um padrão generalizado para read-write defensivo em estruturas profundas de Conta.

**Decisão consolidada (E14–E19):**
1. **Leitura defensiva:** Query em `getAccounts()` inclui os campos remotos; merge com mock no absence fallback (nullish coalescing ou empty array).
2. **Estado local-first:** A UI mantém `local[fieldName]` (e.g., `localLeitura`, `localInteligencia`, `localOportunidades`, `localHistorico`, `localTecnografia`) como fonte de verdade para renderização. Não usa `account.field` diretamente após setState local.
3. **Editor modal ou inline:** Ao editar, `editingX` captura um snapshot **completo** de todos os campos relacionados (não apenas um). Para campos simples de strings, uso de `string | null` oferece controle de estado claro (null = fechado, string = em edição).
4. **Validação defensiva:** Guard clauses bloqueiam persistência de entradas inválidas (campos obrigatórios vazios, duplicatas), exibindo feedback ao usuário sem alterar o estado local.
4. **Atomicidade garantida:** 1 snapshot → 1 build → 1 setState → 1 persistX() fire-and-forget.
5. **Merge com tipos:** Leitura remota respeita tipagem: arrays podem estar `undefined`, vazios ou preenchidos. No merge: `row.field || mockAccount.field || []`.
6. **Zero ambiguidade:** Cada campo tem ownership e repositório claro (`accountsRepository` para top-level, `oportunidadesRepository` para oportunidades, etc). Sem dupla escrita.

**Implicação estrutural (Recortes 45–50 consolidados):**
- **E14 (Recorte 45):** Leitura defensiva de Oportunidades via `getOportunidadesMap()`, orquestrada em `accountsRepository`.
- **E15 (Recorte 46):** Escrita defensiva atômica de etapa + risco com UI overlay explícito "Salvar" (não auto-persist).
- **E16 (Recorte 47):** Leitura + escrita defensiva atômica para objeto `inteligencia` (6 arrays) com state local-first.
- **E17 (Recorte 48):** Extensão do E16 para arrays estruturados top-level (`leituraFactual`, `leituraInferida`, `leituraSugerida`), replicando padrão E16 exatamente.
- **E18 (Recorte 49):** Extensão do E17 para array estruturado `historico` com estrutura de objeto por entrada, validação defensiva obrigatória, e timeline integrada que combina `sessionLogs` (local) + `localHistorico` (remoto) com separação clara de origem.
- **E19 (Recorte 50):** Extensão do E18 para arrays simples de strings (`tecnografia`), com editor via estado `string | null`, validação contra vazio e duplicata, e remoção inline com persist.

**Template genérico (replicável para futuras entidades):**
```typescript
// Repository: tipo + query + fallback
export type NewRow = { id: string; fieldA?: string[]; fieldB?: string[] };
export async function getNew(): Promise<Conta[]> {
  // Query inclui fieldA, fieldB
  // Merge com mock: row.fieldA || mockAccount.fieldA || []
}
export async function persistNew(account: { id: string; fieldA?: string[]; fieldB?: string[] }) {
  // Snapshot completo em payload defensivo
  // Fire-and-forget, sem await bloqueador
}

// UI: estado local + editor modal
const [localNew, setLocalNew] = useState({ fieldA: account?.fieldA ?? [], fieldB: account?.fieldB ?? [] });
const [editingNew, setEditingNew] = useState<typeof localNew | null>(null);

// Renderização: usa localNew (não account.field)
{localNew.fieldA.map(...)}

// Salvamento: snapshot → setState → persist (atômico)
const handleSaveNew = () => {
  if (!editingNew) return;
  const snapshot = { ...editingNew };
  setLocalNew(snapshot);
  persistNew({ id: account.id, fieldA: snapshot.fieldA, fieldB: snapshot.fieldB });
  setEditingNew(null);
};
```

**Benefício arquitetural:** O padrão E14–E19 generaliza escalabilidade a novos campos estruturados profundos sem aumentar complexidade conceitual. A simetria remota-local-persistência é idêntica seja para 1 campo simples, 1 array, ou múltiplos arrays. A validação defensiva (E18+) protege integridade de persistência contra entradas inválidas. Controle de estado via `string | null` (E19) oferece alternativa limpa a booleanos de edição para casos de entrada simples.

**Commits:** `81a1c6b` (E14), `2f91d47` (E15), `9ec0667` (E16), `569c665` (E17), `d3ed9d9` (E18), `90662a0` (E19)

---

### 8.5 JSON como Barreira Canônica de Integridade de Entrada (E20: Canais e Campanhas)

**Contexto (Recorte 51):**
Ao implementar leitura-escrita defensiva para `canaisCampanhas` (objeto aninhado com estrutura `{ origemPrincipal: string; influencias: {canal, campanha, tipo, impacto, data}[] }`), enfrentou-se o desafio de permitir edição textual de JSON em textarea sem normalizar silenciosamente dados inválidos. A solução consolidada estabelece `JSON.parse()` como a **barreira canônica obrigatória** de integridade de entrada, movendo toda validação para o momento de salvamento (não digitação).

**Decisão consolidada (E20):**
1. **Estado de edição desacoplado:** O campo `editingCanaisCampanhas` armazena `{ origemPrincipal: string; influenciasJson: string }`, onde `influenciasJson` é a string JSON bruta (não parseada) capturada do textarea.
2. **Parse defensivo em handleSave:** `handleSaveCanaisCampanhas()` executa `JSON.parse(editingCanaisCampanhas.influenciasJson)` dentro de try/catch como primeira barreira de validação.
3. **Validação sequencial:** Após parse bem-sucedido, quatro guards sequenciais protegem persistência:
   - Guard 1: `origemPrincipal.trim()` não vazio (feedback: "Origem principal é obrigatória.")
   - Guard 2: JSON.parse bem-sucedido (feedback: "JSON de influências inválido.")
   - Guard 3: Resultado é array (feedback: "Influências devem ser um array JSON.")
   - Guard 4: Cada item tem exatamente 5 campos string (`canal`, `campanha`, `tipo`, `impacto`, `data`) (feedback: "Cada influência deve ter: canal, campanha, tipo, impacto, data (todos strings).")
4. **Atomicidade bloqueada:** Se qualquer guard falha, `return` imediato sem `setState` e sem `persistAccount()`. Feedback é exibido via `setShowFeedback()` com timeout auto-clear (3000ms).
5. **Snapshot final:** Só após todos os guards passarem, o snapshot final `{ origemPrincipal, influencias: parsedInfluencias }` é construído (com influencias como array parseado) e persistido.
6. **Inicialização do editor:** Ao abrir o editor, `influenciasJson` é inicializado com `JSON.stringify(localCanaisCampanhas.influencias, null, 2)` para edição formatada.

**Benefício arquitetural:** E20 estabelece o padrão para campos cujos valores são estruturas complexas exigindo edição textual. Ao mover validação para o momento de save (não onChange), evita normalização silenciosa de dados inválidos e oferece ao usuário feedback explícito sobre a causa de rejeição. A barreira JSON.parse centralizada oferece consistência e clareza: "se parse passa, dados são estruturalmente válidos". O padrão é replicável para qualquer campo armazenado como JSON em Supabase (ex: metadata, configurações, hipoteses estruturadas).

**Commits:** `15b6371` (E20 implementação defensiva com barreira canônica JSON.parse em handleSaveCanaisCampanhas)
