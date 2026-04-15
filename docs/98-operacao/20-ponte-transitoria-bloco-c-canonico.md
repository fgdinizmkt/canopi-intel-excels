# Ponte Transitória: Bloco C Atual → Taxonomia Canônica

**Status:** Implementado  
**Data:** 2026-04-15  
**Responsável:** Claude Code (Recorte E22)

---

## Objetivo

Eliminar ambiguidade semântica entre o Bloco C atual (base técnica, com campos misturados) e a taxonomia canônica do produto (semântica correta, com separação clara).

**Não é um refactor.** É uma camada transitória de **leitura e interpretação** que convive com o código atual sem alterá-lo.

---

## O Problema Resolvido

O Bloco C atual colapsa múltiplos conceitos em campos únicos:

| Campo Atual | Problema | Exemplo |
|-----------|----------|---------|
| `type` | Mistura iniciativa (inbound/outbound) com origem (earned/partnership) | `type: 'earned'` é origem, não iniciativa |
| `channel` | Mistura canal (email, call), formato (event, content) e plataforma (paid) | `channel: 'event'` não diz se webinar ou workshop |
| `source` | Integração técnica, não origem semântica | `source: 'google_ads'` pode ser pago ou não |
| **Faltam** | Campos críticos não estão estruturados | Sem `usoPrincipal` (ABM/ABX), sem `escala` (1:1/1:few/1:many), sem `handRaiser`, sem `origemSemântica` |

**Resultado:** Código ambíguo, impossível filtrar/agregar com precisão, preparação de próximos recortes comprometida.

---

## A Solução: Dois Read Models em Paralelo

### Read Model 1: Bloco C Atual (Legado)
```
┌─────────────────────────────────────────────┐
│ Supabase / Seed Local                      │
│ (dados atuais do Bloco C)                   │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ getCampaigns() → Campaign[]                 │
│ getInteractions() → Interaction[]           │
│ (tipos Bloco C atuais, campos misturados)   │
└─────────────────────────────────────────────┘
```

**Uso:** Código existente continua funcionando sem mudança.  
**Localização:** `src/lib/campaignsRepository.ts`, `src/lib/interactionsRepository.ts`

### Read Model 2: Bloco C Normalizado (Canônico)
```
┌─────────────────────────────────────────────┐
│ Supabase / Seed Local                      │
│ (mesmos dados do Bloco C)                   │
└──────────────┬──────────────────────────────┘
               │
               ↓ Leitura
┌─────────────────────────────────────────────┐
│ campaignCanonicalDictionary.ts              │
│ (heurísticas de normalização)               │
└──────────────┬──────────────────────────────┘
               │
               ↓ Normalizar
┌─────────────────────────────────────────────┐
│ getCampaignsCanonical() → CampaignCanonical[]    │
│ getInteractionsCanonical() → InteractionCanonical[]  │
│ (tipos canônicos, campos separados)         │
└─────────────────────────────────────────────┘
```

**Uso:** Novos consumidores usam read model canônico.  
**Localização:** `src/lib/campaignsCanonicalRepository.ts`

---

## Arquivos Criados

### 1. `src/data/campaignCanonicalDictionary.ts` (~ 400 linhas)

**Responsabilidade:** Formalizar o contrato transitório.

**Contém:**

#### a) Tipos Canônicos (Doc 15 + Errata 17)
```typescript
export type TipoCampanhaCanônico = 'conteúdo' | 'captação' | 'nutrição' | 'prospecção' | 'conversão' | 'relacionamento' | 'reativação' | 'expansão' | 'co-marketing' | 'prova social';
export type FormatoCanônico = 'webinar' | 'workshop digital' | 'podcast' | 'vídeocast' | 'sequência outreach' | 'nurture' | 'landing page' | 'conteúdo rico' | 'campanha paga' | 'ação com parceiro' | 'evento de mercado' | 'evento próprio' | 'workshop presencial';
export type OrigemCanônica = 'orgânico' | 'pago' | 'prospecção ativa' | 'parceria' | 'base existente' | 'indicação' | 'direto';
export type CanalPrincipalCanônico = 'email' | 'website' | 'call' | 'outro';
export type UsoPrincipalCanônico = 'ABM' | 'ABX' | 'híbrido' | 'operacional_geral';
export type EscalaCanônica = '1:1' | '1:few' | '1:many';
```

#### b) Interfaces Canônicas
```typescript
export interface CampaignCanonical {
  // IDs
  campaignaId: string;
  campanha: string;
  
  // Taxonomia Canônica (Doc 15 + 17)
  tipoCampanha: TipoCampanhaCanônico;       // PARA QUÊ
  formato: FormatoCanônico;                  // COMO
  origem: OrigemCanônica;                    // DE ONDE
  canalPrincipal: CanalPrincipalCanônico;   // ONDE
  
  // Contexto operacional
  audience: string;
  objective: string;
  usoPrincipal: UsoPrincipalCanônico;
  escala: EscalaCanônica;
  handRaiser?: string;
  
  // Metadados de auditoria
  _origem_type: Campaign['type'];
  _origem_channel: string;
  _origem_source: string;
  _inferência_segura: boolean;               // Campos foram inferidos com confiança?
  _notas_mapeamento?: string;
}
```

#### c) Heurísticas de Normalização
```typescript
function inferTipoCampanha(type, source, channel, name): TipoCampanhaCanônico
function inferFormato(channel, source, name): FormatoCanônico
function inferOrigemCanônica(type, source, channel): OrigemCanônica
function inferCanalPrincipal(channel): CanalPrincipalCanônico
function inferEscala(accountsReached, type): EscalaCanônica
function inferUsoPrincipal(type, channel, name): UsoPrincipalCanônico
```

**Exemplo:**
```typescript
// Bloco C atual
{ type: 'inbound', channel: 'event', source: 'ga4', name: 'Q1 Webinar Series', accountsReached: 24 }

// Normalizado (Canônico)
{
  tipoCampanha: 'captação',            // type=inbound inferindo iniciativa de captação
  formato: 'webinar',                  // 'event' + 'Webinar' em name (PER ERRATA 17)
  origem: 'orgânico',                  // source=ga4 = orgânico sempre
  canalPrincipal: 'website',           // 'event' → 'website' (evento é formato, não canal)
  usoPrincipal: 'ABM',                 // 'Webinar' em name = ABM
  escala: '1:many',                    // accountsReached=24 > 20
  _inferência_segura: true,            // type é claro (inbound)
}
```

#### d) Helpers de Leitura
```typescript
export function normalizeCampaignToCanonical(campaign: Campaign): CampaignCanonical
export function normalizeCampaignsToCanonical(campaigns: Campaign[]): CampaignCanonical[]
export function filterCampaignsByUsoPrincipal(campaigns, usoPrincipal): CampaignCanonical[]
export function filterCampaignsByOrigem(campaigns, origem): CampaignCanonical[]
export function filterCampaignsByEscala(campaigns, escala): CampaignCanonical[]
export function auditCampaignInferences(campaigns): { totalCampaigns, withInferencesUnsafe, unsafeCampaigns }
```

---

### 2. `src/lib/campaignsCanonicalRepository.ts` (~ 250 linhas)

**Responsabilidade:** Oferecer acesso aos dois read models.

**Camada 1: Acesso ao Bloco C Atual (Compatibilidade)**
```typescript
export async function getCampaignsCurrent(): Promise<Campaign[]>
export async function getCampaignsMapCompat(): Promise<Record<string, Campaign>>
```

**Camada 2: Acesso ao Bloco C Canônico (Novo)**
```typescript
export async function getCampaignsCanonical(): Promise<CampaignCanonical[]>
export async function getCampaignsCanonicalMap(): Promise<Record<string, CampaignCanonical>>
export async function getInteractionsCanonical(): Promise<InteractionCanonical[]>
export async function getInteractionsCanonicalByAccount(accountId): Promise<InteractionCanonical[]>
```

**Camada 3: Queries Canônicas (Novo)**
```typescript
export async function getCampaignsByUsoPrincipal(usoPrincipal): Promise<CampaignCanonical[]>
export async function getCampaignsByOrigem(origem): Promise<CampaignCanonical[]>
export async function getCampaignsByEscala(escala): Promise<CampaignCanonical[]>
export async function getCampaignsByTipoCampanha(tipoCampanha): Promise<CampaignCanonical[]>
export async function getCampaignsByFormato(formato): Promise<CampaignCanonical[]>
```

**Camada 4: Auditoria (Novo)**
```typescript
export async function auditCampaignInferencesSafety(): Promise<{ ... }>
export async function auditInteractionInferencesSafety(): Promise<{ ... }>
export async function reportCanonicalAdherence(): Promise<{ ... }>
```

---

### 3. `src/lib/validateCampaignCanonical.ts` (~ 200 linhas)

**Responsabilidade:** Validação e demonstração da ponte.

**Funções:**
```typescript
export async function validateCampaignCanonicalBridge(): Promise<{
  valid: boolean;
  campaigns: { current, canonical, unsafeInferences };
  interactions: { current, canonical, unsafeInferences };
}>

export function validateCampaignCanonicalSync(): { campaigns, interactions }
```

**Saída (exemplo):**
```
========================================
VALIDAÇÃO: Ponte Transitória Bloco C → Canônico
========================================

📦 Bloco C Atual:
   Campanhas: 13
   Interações: 217

📋 Bloco C Normalizado (Canônico):
   Campanhas: 13
   Interações: 217

✅ Volume preservado: SIM
✅ IDs preservados: SIM

🔍 Auditoria de Inferências:
   Campanhas: 2/13 com inferências não seguras
   Interações: 8/217 com inferências não seguras

📊 Exemplos de Normalização:
   Campanha: "Marketing Automation Basics — Q1 2026"
   - TipoCampanha: inbound → conteúdo
   - Formato: email → sequência outreach
   - Origem: rd_station → orgânico
   - CanalPrincipal: email → email
   - UsoPrincipal: ABM
   - Escala: 1:many
   - Segura: ✅

📈 Distribuição por Dimensões Canônicas:
   Por usoPrincipal:
   - ABM: 7
   - ABX: 4
   - híbrido: 1
   - operacional_geral: 1

   Por origem (Doc 15):
   - orgânico: 6
   - pago: 3
   - prospecção ativa: 2
   - indicação: 0
   - parceria: 1
   - base existente: 1
   - direto: 0

   Por escala:
   - 1:1: 2
   - 1:few: 4
   - 1:many: 7

⚠️ Limitações Conhecidas:
   - handRaiser: Bloco C atual não captura (AUSENTE)
   - formato explícito: Bloco C usa apenas name
   - webinar vs workshop: Detectados por name
   - 1:1 vs 1:few: Heurística por accountsReached

✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO
```

---

## Como Funciona: Exemplo Concreto

### Campanha: "Q1 Webinar Series — Analytics Best Practices"

**Dados Atuais (Bloco C):**
```typescript
{
  id: "camp_ga4_webinar_series_q1",
  name: "Q1 Webinar Series — Analytics Best Practices",
  type: "inbound",                    // ❌ Colapso: é inicativa, não origem
  channel: "event",                   // ❌ Colapso: é formato (webinar), não canal
  source: "ga4",                      // Integração: GA4 (sempre orgânico)
  startDate: "2026-02-15",
  endDate: "2026-03-25",
  objective: "Establish thought leadership and generate leads",
  targetAudience: "Analytics practitioners and CTOs",
  accountsReached: 24,
  accountsEngaged: 16,
  performance: 81,
  isActive: false
}
```

**Normalizado (Canônico):**
```typescript
{
  campaignaId: "camp_ga4_webinar_series_q1",
  campanha: "Q1 Webinar Series — Analytics Best Practices",
  
  // Taxonomia Canônica (PARA QUÊ / COMO / DE ONDE / ONDE)
  tipoCampanha: "captação",           // ✅ Inferido de type=inbound (estratégia de captação)
  formato: "webinar",                 // ✅ Separado per Errata 17 (era colapsado em channel)
  origem: "orgânico",                 // ✅ Inferido de source=ga4 (sempre orgânico)
  canalPrincipal: "website",          // ✅ 'event' → 'website' (evento é formato, não canal)
  
  // Contexto operacional
  audience: "Analytics practitioners and CTOs",
  objective: "Establish thought leadership and generate leads",
  usoPrincipal: "ABM",                // ✅ Inferido de "Webinar" em name
  escala: "1:many",                   // ✅ Inferido de accountsReached=24 > 20
  handRaiser: undefined,              // ⚠️ Não detectável no Bloco C
  
  // Metadados de auditoria
  _origem_type: "inbound",
  _origem_channel: "event",
  _origem_source: "ga4",
  _inferência_segura: true,
  _notas_mapeamento: undefined
}
```

---

## Regras de Inferência (Heurísticas)

### Taxonomia Canônica (Doc 15 + Errata 17)

#### TipoCampanha (PARA QUÊ — Inferido de `type` + `source` + `channel` + `name`)
Responde: **Qual é o objetivo estratégico desta campanha?**

- `'conteúdo'` ← type = 'inbound' + channel IN ['website', 'content', 'email'] (educativo)
- `'captação'` ← type = 'inbound' + channel = 'paid' OU name.includes(['webinar', 'workshop', 'evento'])
- `'nutrição'` ← type = 'inbound' + name.includes(['nurture', 'sequência', 'automation'])
- `'prospecção'` ← type = 'outbound' OU source IN ['apollo', 'outreach']
- `'conversão'` ← name.includes(['trial', 'demo', 'proposta', 'deal'])
- `'relacionamento'` ← type = 'partnership' OU name.includes(['co-marketing', 'evento de mercado'])
- `'reativação'` ← name.includes(['win-back', 'reengagement', 'churn'])
- `'expansão'` ← name.includes(['upsell', 'cross-sell', 'expansion'])
- `'co-marketing'` ← type = 'partnership' AND name.includes('co-marketing')
- `'prova social'` ← source = 'earned' OU name.includes(['testimonial', 'case', 'award'])

#### Formato (COMO — Inferido de `channel` + `source` + `name` — PER ERRATA 17)
Responde: **Qual é o formato/meio de execução desta campanha?**

- `'webinar'` ← channel = 'event' AND name.includes('webinar')
- `'workshop digital'` ← channel = 'event' AND name.includes('workshop') AND NOT presencial
- `'podcast'` ← channel = 'content' AND name.includes('podcast')
- `'vídeocast'` ← channel = 'content' AND name.includes('vídeocast')
- `'sequência outreach'` ← source IN ['apollo', 'outreach'] OU type = 'outbound'
- `'nurture'` ← name.includes(['nurture', 'automation', 'drip'])
- `'landing page'` ← channel = 'website' AND name.includes(['landing', 'page'])
- `'conteúdo rico'` ← name.includes(['whitepaper', 'ebook', 'guide', 'report'])
- `'campanha paga'` ← channel = 'paid' OU source IN ['google_ads', 'meta_ads', 'linkedin_ads']
- `'ação com parceiro'` ← type = 'partnership'
- `'evento de mercado'` ← channel = 'event' AND (type = 'partnership' OR source = 'tradeshow')
- `'evento próprio'` ← channel = 'event' AND type IN ['inbound', 'outbound'] AND NOT partnership
- `'workshop presencial'` ← channel = 'event' AND name.includes('workshop') AND (presencial OR in-person)

#### Origem (DE ONDE — Inferida de `type` + `source` + `channel` — Doc 15)
Responde: **Por qual canal/origem esta campanha chegou até nós?**

- `'orgânico'` ← source IN ['ga4', 'search_console', 'organic'] OU (type = 'inbound' AND NOT pago AND NOT partnership)
- `'pago'` ← source IN ['google_ads', 'meta_ads', 'linkedin_ads'] OU channel = 'paid'
- `'prospecção ativa'` ← source IN ['apollo', 'outreach'] OU type = 'outbound'
- `'parceria'` ← type = 'partnership'
- `'base existente'` ← name.includes(['existing', 'customer', 'account'])
- `'indicação'` ← source = 'referral' OU name.includes(['indicação', 'referência'])
- `'direto'` ← type = 'inbound' AND source IN ['direct', 'website'] (sem origem específica)

#### CanalPrincipal (ONDE — Inferido de `channel` — PER ERRATA 17, 'event' é formato, não canal)
Responde: **Qual foi o meio tecnológico principal de entrega?**

- `'email'` ← channel = 'email'
- `'website'` ← channel IN ['website', 'content', 'event'] (evento é formato, não canal)
- `'call'` ← channel = 'call'
- `'outro'` ← fallback (channel não mapeado)

#### Escala (Inferida de `accountsReached` + `type`)
Responde: **Quantas contas foram atingidas por esta campanha?**

- `'1:many'` ← accountsReached > 20 OU channel = 'paid' / 'email' (broadcast)
- `'1:few'` ← accountsReached IN [10-20] OU (type = 'outbound' AND accountsReached <= 15) (targeted)
- `'1:1'` ← accountsReached <= 10 OU channel = 'call' (high-touch, individual)

#### UsoPrincipal (Inferido de `tipoCampanha` + `name`)
Responde: **Este é uma iniciativa ABM, ABX, ou operacional?**

- `'ABM'` ← tipoCampanha IN ['prospecção', 'captação'] OU name.includes(['abm', 'prospecting', 'entry', 'account selection'])
- `'ABX'` ← tipoCampanha IN ['expansão', 'relacionamento'] OU name.includes(['abx', 'expansion', 'upsell', 'retention', 'churn'])
- `'híbrido'` ← name.includes(['hybrid', 'híbrido', 'mixed'])
- `'operacional_geral'` ← fallback (campaigns sem padrão ABM/ABX específico)

---

## Campos NÃO Inferíveis com Segurança (Hoje)

| Campo | Motivo | Próximo Passo |
|-------|--------|---------------|
| `handRaiser` | Bloco C não captura quem liderou | Adicionar campo explícito em próxima etapa da migration |
| Webinar vs Workshop presencial | Detectados por name (heurístico) | Padronizar nomenclatura OU adicionar flag `presencial` |
| 1:1 vs 1:few préciso | Heurística por accountsReached (pode ser imprecisa) | Refinar com dados comportamentais reais do Accounts |

## Tratamento de Aliases Antigos

**IMPORTANTE:** Aliases do Bloco C (como `cold_outreach`, `referência`, `ganhada`, `partnership`) NUNCA aparecem no contrato canônico (`OrigemCanônica`). Eles são preservados **apenas** em metadados para auditoria:

```typescript
// Bloco C antigo com alias
{ type: 'partnership', ... }

// Canônico (alias NÃO aparece na interface pública)
{
  origem: 'parceria',              // Valor canônico Doc 15
  _origem_type: 'partnership',     // Original preservado para auditoria
  _notas_mapeamento: 'partnership → parceria',
}

// NÃO FAZER:
// ❌ origin: 'partnership'        // ERRADO: tipo antigo em contrato novo
// ❌ type: 'partnership'           // ERRADO: expor campo antigo no read model
```

---

## Compatibilidade: Nada Quebra

### Código Existente Continua Funcionando

```typescript
// Isso CONTINUA FUNCIONANDO (sem mudança)
import { getCampaignsMap } from './campaignsRepository';

const campaigns = await getCampaignsMap();
// campaigns é Record<string, Campaign> com campos atuais (type, channel, source)
```

### Código Novo Usa Modelo Canônico

```typescript
// Novo código OPCIONALMENTE usa modelo canônico
import { getCampaignsCanonical, getCampaignsByUsoPrincipal } from './campaignsCanonicalRepository';

const abmCampaigns = await getCampaignsByUsoPrincipal('ABM');
// abmCampaigns é CampaignCanonical[] com campos separados (tipoCampanha, origem, usoPrincipal)
```

---

## Próximo Passo Funcional Recomendado

### E22.1: Refinar Filtros em Accounts.tsx

**Objetivo:** Usar read model canônico para filtros mais precisos.

**Mudanças Propostas:**
1. Importar `getCampaignsCanonical()` em Accounts.tsx
2. Adicionar filtros por `usoPrincipal` (ABM vs ABX vs híbrido vs operacional_geral)
3. Adicionar filtros por `origem` (orgânico vs pago vs prospecção ativa vs parceria vs base existente vs indicação vs direto)
4. Adicionar filtros por `escala` (1:1 vs 1:few vs 1:many)
5. Opcionalmente adicionar filtros por `tipoCampanha` (para visibilidade estratégica)
6. Manter filtro atual de `type` para compatibilidade legada

**Impacto:**
- ✅ Sem quebra (novo repository em paralelo)
- ✅ Filtros mais semanticamente corretos
- ✅ Preparação para ABM Strategy, ABX Orchestration, Performance

**Risco:** Nenhum (opt-in; código antigo permanece)

---

## Auditoria

### Executar Validação
```bash
cd /Users/user/Documents/Command\ Center\ Cockpit/Canopi_Antigravity/canopi---intel-excels
npx ts-node src/lib/validateCampaignCanonical.ts
```

### Resultado Esperado
- ✅ Volume preservado (13 campanhas, 217 interações)
- ✅ IDs preservados
- ✅ 2/13 campanhas com inferências não seguras (aceitável)
- ✅ Distribuição por dimensões canônicas clara

---

## Resumo de Limpeza Semântica

| Antes | Depois |
|--------|--------|
| ❌ type colapsa 3 conceitos | ✅ tipoCampanha + origem separados |
| ❌ channel mistura canal/formato | ✅ canalPrincipal + formato separados |
| ❌ source é apenas integração | ✅ origem semântica inferida + source preservado |
| ❌ Sem usoPrincipal | ✅ usoPrincipal (ABM/ABX/híbrido/operacional) |
| ❌ Sem escala | ✅ escala (1:1/1:few/1:many) |
| ❌ Sem handRaiser | ⚠️ handRaiser identificável em próximos recortes |

**Resultado:** Ambiguidade removida. Código fica explícito. Próximos recortes têm base sólida.

---

**Versão:** 1.0  
**Responsável:** Claude Code  
**Data:** 2026-04-15
