# Bloco C — Campanhas, Interações e Recomendações de Play

**Status:** Aberto (scaffolding implementado, população em andamento)  
**Dependência:** Bloco A e Bloco B completos e validados  
**Objetivo:** Adicionar profundidade analítica, histórico de jornada e recomendações acionáveis  
**Fonte de Verdade:** `scripts/seed/buildBlockCSeed.ts` (estrutura canônica)

---

## 1. Papel deste Bloco

O Bloco C existe para adicionar a camada de **profundidade operacional**, **jornada de conta** e **recomendação acionável**:

- **De onde vem** o interesse da conta (campanhas)
- **Como a conta se engaja** conosco (interações / touchpoints)
- **Qual é o próximo play** mais provável de avançar a conta (recomendações baseadas em estado e histórico)

Sem este bloco, a plataforma mostra **o estado** mas não consegue contar **a história** de como chegou lá.

**Exemplo:**
```
Sem Bloco C: "Itaú está em Qualificação, potencial 88"
Com Bloco C: "Itaú chegou a Qualificação porque mostrou 8 touchpoints ao longo de 6 semanas 
             (webinar + demo + proposal + Q&A call). Próximo play: steering committee alignment 
             com 72% de probabilidade de sucesso."
```

---

## 2. Escopo do Bloco C

As tabelas oficiais do Bloco C são:

- `campaigns` — Campanhas que geraram interesse ou engajamento
- `interactions` — Touchpoints entre empresa e conta
- `play_recommendations` — Próximas ações recomendadas baseadas em estado atual

Este bloco **não**:

- Cria novas contas (Bloco A é imutável)
- Modifica dados do Bloco A ou B
- Ativa Supabase como fonte produtiva (Bloco C é seed primeiro)
- Inventa dados de campanhas reais sem estrutura

---

## 3. Relação com Bloco A e Bloco B

### Bloco A (Contas)
- Bloco C **referencia** accountId válidos do Bloco A
- Bloco C **não modifica** accounts, contacts, signals, opportunities

### Bloco B (Integrations)
- Bloco C **referencia** integrationId válidos do Bloco B para source e channel de interações
- Exemplo: Uma interação com `source: 'rd_station'` deve estar coberta na accountSourceCoverage para aquela conta

### Coerência Garantida
Toda referência a `accountId` em qualquer tabela do Bloco C deve apontar para conta real no Bloco A.
Toda referência a source/channel deve ser plausível com as integrações ativas do Bloco B.

---

## 4. Tabela 1: `campaigns`

### Papel

Registro de campanhas inbound e outbound que geraram interesse, engajamento ou sinais.

### Estrutura

```typescript
interface Campaign {
  id: string;                    // e.g., 'camp_hs_webinar_q1'
  name: string;                  // descrição clara
  type: 'inbound' | 'outbound' | 'earned' | 'partnership';
  channel: string;               // 'email', 'website', 'paid', 'event', 'content'
  source: string;                // qual integração / origem detectada
  startDate: string;             // YYYY-MM-DD
  endDate?: string;              // YYYY-MM-DD
  budget?: number;               // em BRL
  objective: string;             // meta da campanha
  targetAudience?: string;       // quem era alvo
  
  // Impacto
  accountsReached: number;       // quantas contas alcançadas
  accountsEngaged: number;       // quantas geraram interações
  signalsGenerated: number;      // quantos sinais desta campanha
  
  // Status
  isActive: boolean;
  performance?: number;          // 0-100 score
}
```

### Tipos de Campanha Válidos

```
type: 'inbound' | 'outbound' | 'earned' | 'partnership'
```

- `inbound`: Lead vem naturalmente (webinar, conteúdo, SEO)
- `outbound`: Outreach planejado (email, call, ads)
- `earned`: Menção/cobertura externa (PR, article, referral)
- `partnership`: Via parceiro/integração

### Canais Válidos

```
'email', 'website', 'paid', 'event', 'content', 'call', 'referral', 'other'
```

### Regra

Cada integração ativa do Bloco B que gera sinais deve ter 1-2 campanhas associadas.

Exemplo: GA4 pode ter campanhas "Webinar Q1", "Content Download Q2", etc.

---

## 5. Tabela 2: `interactions`

### Papel

Registra cada touchpoint entre empresa e conta.

Simula jornada de engajamento: "conta visitou site em 12/04, respondeu email em 13/04, participou de demo em 14/04".

### Estrutura

```typescript
interface Interaction {
  id: string;                    // e.g., 'int_acc1_2026_04_13_001'
  accountId: string;             // ref a Bloco A
  campaignId?: string;           // ref a campaigns (se origem de campanha)
  interactionType: InteractionType; // tipo de interação
  
  timestamp: string;             // ISO 8601
  date: string;                  // YYYY-MM-DD (convenience)
  
  // Contexto
  channel: string;               // 'website', 'email', 'call', 'event'
  direction: 'inbound' | 'outbound';
  initiator: 'conta' | 'empresa'; // quem iniciou?
  
  // Detalhes
  description: string;           // descrição clara do que aconteceu
  relevance: number;             // 0-100 (quão relevante foi)
  sentiment?: 'positive' | 'neutral' | 'negative';
  owner?: string;                // quem da empresa interagiu
  
  // Resultado
  followUpRequired: boolean;
  nextStep?: string;
  
  // Metadados
  source: string;                // qual integração detectou
  confidence: number;            // 0-100 (certeza dessa interação)
}
```

### Tipos de Interação Válidos

```typescript
type InteractionType = 
  | 'visit'                // visit a website/page
  | 'download'             // download content/whitepaper
  | 'email_open'           // opened email
  | 'email_click'          // clicked link in email
  | 'call'                 // phone call
  | 'demo'                 // product demo
  | 'meeting'              // formal meeting
  | 'submission'           // form submission / inquiry
  | 'event'                // event attendance
  | 'content_consumption'  // consumed blog/video/etc
```

### Coerência de Tipo e Source

**Invariante:** `interactionType` deve fazer sentido com `source`.

Exemplo **não-aceitável**:
```
{
  interactionType: 'email_open',
  source: 'google_ads',    // ❌ Google Ads não envia emails
}
```

Exemplo **aceitável**:
```
{
  interactionType: 'email_open',
  source: 'rd_station',    // ✅ RD Station é marketing automation
}
```

### Regra de Volume

Cada conta deve ter **5-15 interações** ao longo de **3-6 meses** (realismo operacional).

Interações devem estar distribuídas entre:
- Canais (website, email, call, event)
- Iniciadores (conta vs empresa)
- Sentimentos (positive, neutral, negative)

---

## 6. Tabela 3: `play_recommendations`

### Papel

Recomendação de próximo play baseado no estado atual e histórico da conta.

Exemplo: "Esta conta está em Descoberta com alto inbound. Play recomendado: ABM Qualificação."

### Estrutura

```typescript
interface PlayRecommendation {
  id: string;                    // e.g., 'play_rec_acc1_2026_04'
  accountId: string;             // ref a Bloco A
  
  // Play recomendado
  playId: string;                // id do play (ref a play pool)
  playName: string;              // e.g., 'ABM Entry - BI & Analytics'
  playType: 'entry' | 'engagement' | 'expansion' | 'retention' | 'reactivation';
  
  // Por quê essa recomendação
  rationale: string;             // explicação clara
  keySignals: string[];          // quais sinais levaram a isso
  accountReadiness: number;      // 0-100 (receptividade)
  
  // Contexto
  estimatedValue: number;        // valor potencial em BRL
  timelineWeeks: number;         // quantas semanas para executar
  confidenceScore: number;       // 0-100 (certeza da recomendação)
  
  // Status
  isActive: boolean;
  startedAt?: string;            // quando começou (YYYY-MM-DD)
  successProbability: number;    // 0-100
  
  // Próximos passos
  nextStepDescription: string;   // qual é o próximo passo concreto
  nextStepOwner?: string;        // quem deveria fazer
  nextStepDeadline?: string;     // YYYY-MM-DD
}
```

### Tipos de Play Válidos

```typescript
type PlayType = 'entry' | 'engagement' | 'expansion' | 'retention' | 'reactivation'
```

- `entry`: Primeiros passos para nova conta (ABM)
- `engagement`: Aprofundar relacionamento existente
- `expansion`: Crescimento com cliente existente (ABX)
- `retention`: Mitigar risco de churn
- `reactivation`: Reativar conta desengajada

### Play Pool — Referência Pré-definida

Todas as recomendações devem referenciar um play do pool oficial:

```typescript
interface PlayDefinition {
  id: string;
  name: string;
  category: 'ABM' | 'ABX' | 'operational' | 'retention';
  description: string;
  prerequisites: string[];           // quais condições precisam estar presentes
  idealTimelineWeeks: number;
  estimatedValueRange: { min: number; max: number };
}
```

**Plays Pré-definidos (atualizável):**

**ABM Entry:**
- `play_abm_entry_bi`: BI & Analytics (webinar → whitepaper → demo)
- `play_abm_entry_consulting`: Consulting (discovery → proposal → negotiation)
- `play_abm_entry_platform`: Platform (freemium → upsell → contract)

**ABX Expansion:**
- `play_abx_expansion_crosssell`: Cross-sell para cliente existente
- `play_abx_expansion_upsell`: Upsell para tier superior

**Retention:**
- `play_abx_retention_risk`: Risk Mitigation (churn signal → win-back)

**Operational:**
- `play_operational_govtech`: GovTech Alignment (reqs específicas)

### Regra

Cada conta deve ter **1-3 plays recomendados ativos**.

Recomendação muda conforme conta avança na jornada.

---

## 7. Coerência com Bloco A e B

### Invariante 1: Conta Sempre Válida

Toda referência a `accountId` deve apontar para conta real no Bloco A.

```
accountId ∈ {id de qualquer uma das 43 contas}
```

### Invariante 2: Interaction Source Válida

Toda `interactionType` deve fazer sentido com `source`:

```
email_open/email_click → source em ['rd_station', 'hubspot', 'salesforce']
visit/download → source em ['ga4', 'search_console', 'website']
call/meeting → source em ['hubspot', 'salesforce', 'apollo', 'outreach']
demo/submission → source em ['hubspot', 'salesforce', 'calendly', 'forms']
```

### Invariante 3: Play Recomendado Coerente

A recomendação deve fazer sentido com:

- **Etapa atual** da conta
- **Tipo estratégico** (ABM vs ABX)
- **Histórico de interações**
- **Sinais recentes**

Exemplo **não-aceitável**:
```
Conta em 'Prospecção' / ABM:
  → Play recomendado: 'ABX Retention — Risk Mitigation'  ❌
```

Exemplo **aceitável**:
```
Conta em 'Prospecção' / ABM:
  → Play recomendado: 'ABM Entry — Platform'  ✅
```

### Invariante 4: Interações Refletem Sinais

Se há um sinal importante, deve haver interações que o suportam.

Exemplo:
```
Sinal: 'Alta atividade em materiais de IA'
  → Deve haver interações: 'visit', 'download', 'email_click' associadas
```

---

## 8. Ordem Oficial de População

1. **Campanhas** (13 integrations → 13-26 campaigns)
   - 1-2 campanhas por integração ativa do Bloco B
   - Realismo: datas, budgets, métricas coerentes

2. **Interações** (43 accounts × 5-15 = 215-645 interactions)
   - Distribuídas ao longo de 3-6 meses
   - Refletem campanhas e sinais do Bloco A
   - Variedade de canais, tipos, sentimentos

3. **Play Recommendations** (43 accounts × 1-3 = 43-129 plays)
   - Geradas baseado em:
     - Estado atual da conta (Bloco A)
     - Histórico de interações (Bloco C campaigns/interactions)
     - Sinais mais recentes (Bloco A signals)
   - Recomendações coerentes com tipo estratégico e etapa

---

## 9. Critério de Aceite do Bloco C

O Bloco C pode ser considerado pronto quando:

1. ✅ As 3 tabelas estão estruturadas (types + builders)
2. ✅ Há geração automatizada (scaffolding + runner funcional)
3. ✅ Validação de coerência passa para todas as 43 contas
4. ✅ Cada conta tem 1-3 plays recomendados ativos
5. ✅ Cada conta tem 5-15 interações ao longo do tempo
6. ✅ Campanhas são referenciáveis e plausíveis
7. ✅ Não há `accountId` orfanado (referência inválida)
8. ✅ Play recomendado é coerente com estado da conta
9. ✅ Handoff pode ser feito sem contexto oral
10. ✅ Documentação canônica é clara e completa

---

## 10. O Que NÃO é Bloco C

- **Relatórios de performance** — isso é BI/Analytics
- **Análise de ROI de campanha** — isso é Analytics
- **Previsão de churn** — isso é ML/Predictive
- **Gestão de funil/pipeline** — isso é Sales Operations
- **Acompanhamento de tasks** — isso é CRM/Sales Execution

**Bloco C é:** Estrutura canônica para contar a história operacional de cada conta.

---

## 11. Leitura Obrigatória Associada

Este documento deve ser lido junto com:

1. `docs/98-operacao/01-plano-canonico-seed-handoff-obrigatorio.md`
2. `docs/98-operacao/02-bloco-a-mapeamento-canonico.md`
3. `docs/98-operacao/03-regras-minimas-de-volume-e-densidade.md`
4. `docs/98-operacao/04-bloco-b-integrations-e-cobertura.md`

---

## 12. Status deste Bloco

**Status:** Documento de definição criado + scaffolding implementado  
**Estrutura:** Tipos, builders, validadores, runner funcionando  
**Dados:** Ainda não povoados (próxima iteração)  
**Validação:** Automatizada via `validateBlockCSeed.ts`  
**Supabase:** Não tocar ainda — Bloco C é seed-first

---

## 13. Próxima Ação Oficial

A próxima ação oficial após este documento é:

**Preencher as tabelas campaigns, interactions e play_recommendations com dados realistas para as 43 contas.**

Scaffolding esperado:

- `scripts/seed/buildBlockCSeed.ts` — população das 3 tabelas
- `scripts/seed/exportBlockCSeedJson.ts` — exportação para JSON
- `scripts/seed/validateBlockCSeed.ts` — validação de coerência
- `scripts/seed/runBlockCSeed.sh` — orquestração do fluxo

Executar:
```bash
bash scripts/seed/runBlockCSeed.sh
```

---

## 14. Glossário

| Termo | Significado |
|-------|-------------|
| **Campaign** | Ação de marketing/vendas que gerou interesse ou engajamento |
| **Interaction** | Touchpoint único entre empresa e conta |
| **Play** | Sequência estruturada de ações para avançar a conta |
| **Play Recommendation** | Próximo play mais provável de sucesso para uma conta específica |
| **Account Readiness** | 0-100 score: quanto a conta está pronta para este play |
| **Confidence Score** | 0-100 score: quanto de certeza temos na recomendação |
| **Success Probability** | 0-100 score: probabilidade estimada de sucesso do play |

---

**Versão:** 1.0.0  
**Última atualização:** 2026-04-13  
**Responsável:** Canopi Seed Operations
