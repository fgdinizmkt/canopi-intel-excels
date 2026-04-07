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
