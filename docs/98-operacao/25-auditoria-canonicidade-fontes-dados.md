# Auditoria Canônica: Fontes de Dados da Plataforma

**Data:** 2026-04-15  
**Status:** Auditoria Completa  
**Objetivo:** Mapear inconsistências de fontes de dados e identificar pontos onde operador recebe leitura incorreta

---

## 1. MATRIZ DE FONTES POR TELA

| Tela | Componente | Fonte | Tipo | Status | Confiabilidade |
|------|-----------|--------|------|--------|-----------------|
| **Accounts** | Listagem de contas | `getAccounts()` → Supabase + fallback contasMock | Real/Mock | ✅ Sincronizado | Alta |
| **Accounts** | Filtros de conta | Derivados de `contas` | Real/Mock | ✅ Sincronizado | Alta |
| **Accounts** | Interações (Bloco C) | `getInteractions()` → Supabase + fallback seed | Real/Mock | ✅ Sincronizado | Alta |
| **Accounts** | Plays recomendados | `getPlayRecommendations()` → Supabase + fallback seed | Real/Mock | ✅ Sincronizado | Alta |
| **Accounts** | Campanhas Canônicas (E22.1) | `getCampaignsCanonical()` → Supabase + fallback seed | Real/Mock | ✅ Sincronizado | Alta |
| **Overview** | Sinais Críticos | `advancedSignals` (mock direto) | Mock | ⚠️ Hardcoded | Baixa |
| **Overview** | Métricas de Pipeline | Derivado de `advancedSignals` | Mock | ⚠️ Hardcoded | Baixa |
| **Overview** | Taxa de Conversão | `resolvedosSinais.length / advancedSignals.length` | Mock | ⚠️ Hardcoded | Baixa |
| **Overview** | Fila de Ações | `initialActions` (mock direto) | Mock | ⚠️ Hardcoded | Baixa |
| **Overview** | Anomalias de Fila | Derivado de `initialActions` | Mock | ⚠️ Hardcoded | Baixa |
| **Performance** | Métricas (Pipeline, Receita, etc) | METRICS hardcoded por período | Mock | ❌ Static | Nenhuma |
| **Performance** | Razões de Perda | LOSS_REASONS hardcoded | Mock | ❌ Static | Nenhuma |
| **Performance** | Objeções | OBJECTIONS hardcoded | Mock | ❌ Static | Nenhuma |
| **Performance** | Aceleradores | ACCELERATORS hardcoded | Mock | ❌ Static | Nenhuma |
| **Performance** | Squad Owners | SQUAD_OWNERS hardcoded | Mock | ❌ Static | Nenhuma |
| **Performance** | Integrações | INTEGRATIONS hardcoded (fictício) | Fictional | ❌ Static | Nenhuma |
| **Performance** | Canais | CORE_CHANNELS hardcoded | Mock | ❌ Static | Nenhuma |
| **Performance** | Frentes | FRENTES hardcoded (8 frentes com KPIs) | Mock | ❌ Static | Nenhuma |
| **Settings** | Integrações | Hardcoded: Nexus Core, Sugar CRM, Apollo, etc | Fictional | ❌ Misleading | Nenhuma |
| **Settings** | Status de Integração | Hardcoded em HTML | Fictional | ❌ Misleading | Nenhuma |

---

## 2. INCONSISTÊNCIAS CRÍTICAS IDENTIFICADAS

### 2.1 Overview.tsx: Mock Data Apresentada como Real

**Problema:**
- Importa `advancedSignals` (mock) diretamente em linha 9
- Importa `initialActions` (mock) diretamente em linha 10
- Calcula métricas operacionais derivadas 100% de mock
- Exibe como "Dados auditados" (linha 148: "Dados auditados da execução real")

**Exemplo Crítico:**
```typescript
// Linha 93-98 (Overview.tsx)
const allSignals = advancedSignals.filter(s => !s.archived && s.resolved === false);
const accountsWithSignals = new Set(allSignals.map(s => s.accountId || s.account));
const activeAccountsCount = accountsWithSignals.size;
const totalPipeline = activeAccountsCount > 0 ? `R$ ${(activeAccountsCount * 215)}k` : 'R$ 0';
```

Pipeline total é calculado como `contas_mock * 215k`, apresentado como real.

**Impacto:**
- Operador lê "Pipeline: R$ X" sem saber que é mock
- Métricas de conversão são fictícias
- Scores de fila (GHOSTING, VAZÃO, CONGESTIONAMENTO) são derivados de mock

### 2.2 Performance.tsx: Dados Completamente Fictícios

**Problema:**
- Toda seção METRICS é hardcoded (linhas 47-53)
- LOSS_REASONS, OBJECTIONS, ACCELERATORS são arrays estáticos (linhas 76-78)
- SQUAD_OWNERS são nomes inventados com SLAs fictícios (linhas 81-90)
- INTEGRATIONS mostram status fictício "Falha", "Conectado", "Degradado" (linhas 92-99)
- FRENTES (8 frentes: ABM, ABX, Outbound, SEO, Mídia Paga, Inbound, Social, Squads) com KPIs hardcoded (linhas 55-64)

**Exemplo Crítico:**
```typescript
const METRICS: Record<string, Record<string, string>> = {
  '7d':  { pipeline:'1,2M', conversao:'74%', acoes:'12/18', score:'79%', ... },
  '30d': { pipeline:'5,4M', conversao:'79%', acoes:'41/56', score:'82%', ... },
  // Valores completamente static, não derivados de dados reais
};
```

**Integrações Fictícias:**
- "HubSpot CRM" — "47 contatos desatualizados · Falha há 4h17m"
- "Google Ads" — "Conflito de tags GTM · CTR afetado desde ontem"
- "LinkedIn Ads" — Marcado como "Conectado"
- Nenhum desses reflete o estado real de Supabase

**Impacto:**
- Performance.tsx é 100% ficcional
- Operador vê "SLA 84% global" como real
- Pensa que "HubSpot tem falha" quando Supabase é a real fonte

### 2.3 Settings.tsx: Integrações Fictícias Apresentadas como Reais

**Problema (atual):**
- Mostra integrações inexistentes: "Nexus Core", "Sugar CRM", "Apollo", "Minerva Signals Engine", "LinkedIn Paid Social"
- Não mostra informações sobre Supabase (que É a real fonte de dados)
- Não mostra estado de fallback (quando Supabase está inoperante)
- Não mostra ambiente atual (dev/staging/prod)

**Impacto:**
- Operador não consegue saber qual é a real fonte de dados
- Não consegue diagnosticar se dados são reais ou mock
- Não pode verificar saúde da plataforma

---

## 3. NAVEGAÇÃO E CONFUSÃO DE SINAIS

### Accounts vs Overview vs Performance

| Cenário | Accounts | Overview | Performance |
|---------|----------|----------|-------------|
| **Contas ativas** | Real (Supabase ou mock) | Mock (advancedSignals) | Mock (hardcoded FRENTES) |
| **Interações/Sinais** | Real (getInteractions) | Mock (advancedSignals) | Mock (hardcoded) |
| **Pipeline** | Não mostrado | Mock x 215k | Hardcoded "5,4M" |
| **Taxa de Conversão** | Não aplicável | Mock (resolvidos/total) | Hardcoded "79%" |
| **SLA** | Não mostrado | Derivado de mock | Hardcoded por squad |

**Resultado:** Operador lê números diferentes em cada página, sem saber que todas são mock (exceto Accounts que tenta real).

---

## 4. PONTOS ONDE PLATAFORMA INDUZ LEITURA INCORRETA

### 4.1 Overview.tsx
- **Linha 148:** "Dados auditados da execução real" — misleading, são mock
- **Linhas 49-89:** Métricas críticas, alertas, oportunidades — todas mock
- **Linhas 96-98:** "Pipeline", "Melhor origem" — derivado de mock

### 4.2 Performance.tsx
- **Linha 148:** Sem nenhuma indicação de que são dados estáticos
- **Linhas 92-99:** INTEGRATIONS com status "Falha", "Conectado" — fictício
- **Linhas 81-90:** SQUAD_OWNERS com SLA valores — fictício
- **Linhas 47-53:** METRICS com periods diferentes — tudo static

### 4.3 Settings.tsx (Current)
- Mostra integrações que NÃO EXISTEM: Sugar CRM, Apollo, Nexus Core
- Não menciona Supabase, que É a real fonte
- Não oferece "Ambiente Atual" para diagnosticar estado

---

## 5. CONFIABILIDADE POR TELA

| Tela | Componentes Reais | Componentes Mock | Confiabilidade Geral | Diagnóstico |
|------|-----------------|-----------------|----------------------|------------|
| **Accounts** | ✅ Todas as principais (contas, interações, plays, campanhas) | Fallback apenas se Supabase indisponível | **Alta (80-100%)** | Verde: operador vê números reais se Supabase configurado |
| **Overview** | ❌ Nenhum (todos advancedSignals + initialActions) | 100% mock | **Baixa (0%)** | Vermelho: todos números são mock, apresentados como reais |
| **Performance** | ❌ Nenhum (toda seção é hardcoded) | 100% static/hardcoded | **Nenhuma (0%)** | Vermelho: totalmente fictício, nenhum dado real |
| **Settings** | ❌ Nenhum (integrações fictícias) | 100% hardcoded narrative | **Nenhuma (0%)** | Vermelho: misleading, oculta fontes reais |

---

## 6. LACUNAS ESTRUTURAIS

1. **Sem indicação de origem dos dados:** Operador não consegue dizer se está vendo real ou mock
2. **Sem "modo debug":** Não há forma de verificar de qual repositório estão vindo dados
3. **Sem indicador de Supabase status:** Não sabe se fallback está ativo
4. **Sem "Configuração Atual":** Não consegue diagnosticar ambiente (dev/staging/prod)
5. **Sem auditoria de consistência:** Não sabe por que Accounts mostra 8 contas e Performance mostra pipeline de "5,4M"

---

## 7. RECOMENDAÇÕES

### Imediatas (Fase 1)
1. **Settings.tsx:** Recriar com 4 blocos:
   - Ambiente Atual (environment, Supabase status, modo fallback)
   - Fontes Reais da Plataforma (8 entidades: accounts, interactions, plays, campaigns, signals, oportunidades, etc)
   - Confiabilidade por Tela (matriz de confiança)
   - Lacunas Estruturais (listando o que não está reconciliado)

2. **Documentação Visual:** Adicionar badges em Overview e Performance indicando "Dados Mock" vs "Dados Reais"

### Médio-Prazo (Fase 2)
1. **Performance.tsx Refactor:** Derivar METRICS e FRENTES de dados reais (getInteractions, getCampaignsCanonical, etc)
2. **Overview.tsx Refactor:** Usar getAccounts(), getInteractions(), getCampaignsCanonical() ao invés de mock direto

### Longo-Prazo (Fase 3)
1. **Reconciliação de Dados:** Garantir que todas as páginas usam mesma fonte de verdade
2. **Compliance de Confiabilidade:** Definir SLA de confiança por página (ex: Accounts ≥95%, Overview ≥80%)

---

**Versão:** 1.0  
**Data:** 2026-04-15  
**Responsável:** Canopi | Auditoria Operacional
