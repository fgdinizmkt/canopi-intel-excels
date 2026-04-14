# Bloco B — Integrações, Snapshots e Cobertura da Origem do Dado

**Status:** Ativo  
**Dependência:** Bloco A completo e congelado  
**Objetivo:** Modelar origem do dado, cobertura por conta e confiança de fonte  
**Fonte de Verdade:** `src/data/accountsData.ts` (continua) + novo padrão Bloco B

---

## 1. Papel deste documento

O Bloco B existe para tirar da abstração e colocar na estrutura:

- **De onde vêm os dados** de cada conta
- **Qual é o estado** de cada integração por conta
- **Qual é a cobertura relacional** (contatos, sinais, dados de negócio)
- **Qual é a confiança** dos dados baseado em origem
- **Qual é a saúde de sincronização** de cada fonte

Sem este bloco, a plataforma não consegue justificar por que um sinal existe, de onde veio, ou por que está faltando.

---

## 2. Escopo do Bloco B

As tabelas oficiais do Bloco B são:

- `integrations`
- `source_snapshots`
- `account_source_coverage`
- `sync_status`

Essas tabelas emulam:

- **Estados de conexão** (connected, partial, missing, stale, error)
- **Cobertura por conta** (full, partial, weak, none)
- **Timestamps de sincronização** (última atualização conhecida)
- **Histórico de mudanças** de estado

Este bloco **não**:

- cria novas contas
- modifica dados do Bloco A
- ativa Supabase como fonte produtiva
- inventa conectores reais (apenas emula)

---

## 3. Fonte de Verdade Continua

O Bloco B **não substitui** a fonte de verdade do Bloco A.

Continua sendo:

- `src/data/accountsData.ts` → accountsData, contacts, signals, opportunities

O Bloco B **complementa** com:

- Estado de origem
- Cobertura por conta
- Saúde de sincronização
- Histórico de mudanças

---

## 4. Tabela 1: `integrations`

### Papel

Registro de todas as integrações disponíveis no Canopi, e seu status geral (não por conta, mas global).

### Fonte

Nova estrutura: `IntegrationDefinition[]` em novo arquivo ou em `accountsData.ts`

### Campos Obrigatórios

```typescript
{
  id: string;                    // e.g., 'hubspot', 'salesforce', 'google_ads'
  label: string;                 // e.g., 'HubSpot'
  category: string;              // e.g., 'CRM', 'Ads', 'Analytics'
  description: string;           // descrição breve da integração
  isActive: boolean;             // se está ativa no Cenário Parcial
  connectedSince?: string;       // data da primeira conexão (YYYY-MM-DD)
  lastChecked?: string;          // última verificação de saúde (timestamp ISO)
  healthStatus: 'healthy' | 'degraded' | 'down';
}
```

### Regra

Não é uma tabela grande. Cada integração do Cenário Parcial debe ter uma linha.

Referência rápida: ver `scripts/seed/scenarios/parcial.ts` para lista de integrações e seus estados.

---

## 5. Tabela 2: `source_snapshots`

### Papel

Um snapshot captura o estado de uma integração em um momento no tempo.

Simula "último pull de dados que conseguimos fazer com essa integração".

### Fonte

Nova estrutura: `SourceSnapshot[]`

### Campos Obrigatórios

```typescript
{
  id: string;                    // e.g., 'snap_hubspot_2026_04_13'
  integrationId: string;         // referência a integrations.id
  snapshotDate: string;          // data do snapshot (YYYY-MM-DD)
  snapshotTimestamp: string;     // timestamp completo (ISO 8601)
  recordsReceived: number;       // quantos registros vieram nesse pull
  recordsProcessed: number;      // quantos foram processados com sucesso
  recordsFailedCount?: number;   // quantos falharam
  dataConsistency: number;       // score de consistência 0-100
  lastSyncDuration?: number;     // tempo de sincronização em segundos
  syncStatus: 'success' | 'partial_failure' | 'failure';
  errorMessage?: string;         // se houver erro
  confidenceLevel: number;       // nível de confiança 0-100
}
```

### Regra

Cada integração ativa do Bloco A deve ter ao menos 1-2 snapshots que justifiquem seu estado atual.

Exemplo: Se HubSpot está `connected`, deve haver um snapshot recente com `syncStatus: 'success'`.

---

## 6. Tabela 3: `account_source_coverage`

### Papel

Mapeia qual integração cobre qual dado de qual conta.

Define a profundidade de cobertura por conta e por campo.

### Fonte

Nova estrutura: `AccountSourceCoverage[]`

Deve ser gerada a partir de:

- As 43 contas do Bloco A
- Os estados de integração do Cenário Parcial
- Análise coerente do que cada conta deveria ter recebido

### Campos Obrigatórios

```typescript
{
  id: string;                    // e.g., 'cov_acc1_hubspot'
  accountId: string;             // referência a Bloco A
  integrationId: string;         // referência a integrations.id
  coverageLevel: 'full' | 'partial' | 'weak' | 'none';
  
  // campos específicos que essa integração cobre para essa conta
  contactsCovered: boolean;      // cobre contatos?
  signalsCovered: boolean;       // cobre sinais?
  opportunitiesCovered: boolean; // cobre oportunidades?
  companyDataCovered: boolean;   // cobre dados da empresa?
  engagementDataCovered: boolean;// cobre dados de engajamento?
  
  lastSyncDate: string;          // última sincronização (YYYY-MM-DD)
  nextExpectedSync?: string;     // próxima sincronização esperada
  dataFreshness: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'stale';
  
  // qualidade
  dataQualityScore: number;      // 0-100
  completenessScore: number;     // 0-100 (quanto% dos campos esperados foram preenchidos)
  
  // contexto operacional
  isManualOverride?: boolean;    // foi corrigido manualmente?
  notes?: string;                // observações técnicas
}
```

### Regra

Para cada conta, mapeamos quais integrações a cobrem e em que nível.

Exemplo:
- Conta `1` (Itaú): HubSpot = partial (tem contacts, sinais), Salesforce = stale (fora de data)
- Conta `2` (XP Investimentos): HubSpot = full, LinkedIn = partial, Google Ads = missing

---

## 7. Tabela 4: `sync_status`

### Papel

Status corrente de sincronização de cada integração. É o "health check" contínuo.

### Fonte

Nova estrutura: `SyncStatus[]`

### Campos Obrigatórios

```typescript
{
  id: string;                    // e.g., 'sync_hubspot'
  integrationId: string;         // referência a integrations.id
  lastSyncAttempt: string;       // última tentativa (timestamp ISO)
  lastSuccessfulSync: string;    // último sucesso (timestamp ISO)
  syncIntervalMinutes: number;   // a cada quantos minutos sincroniza?
  
  currentStatus: 'connected' | 'partial' | 'missing' | 'stale' | 'error';
  statusReason?: string;         // por que está nesse status
  
  recordsInQueue?: number;       // registros aguardando processamento
  errorCount?: number;           // quantas tentativas falharam
  successCount?: number;         // quantas tentativas funcionaram
  
  nextRetryAt?: string;          // se em erro, quando tenta novamente
  maintenanceWindow?: string;    // se em manutenção, até quando
  
  // contexto
  isMonitored: boolean;          // está sendo monitorado?
  alertsActive?: number;         // quantos alertas ativos
}
```

### Regra

Um registro por integração.

O `currentStatus` deve ser coerente com:

- O estado em `scenarios/parcial.ts`
- Os últimos snapshots em `source_snapshots`
- A cobertura reportada em `account_source_coverage`

---

## 8. Estados Válidos e Transições

### Estados de Integração

```
connected
├─ Integração funcionando normalmente
└─ Sincroniza regularmente, dados chegam consistentes

partial
├─ Integração funcionando, mas com limitações
├─ Alguns campos faltando, sincronização lenta
└─ Dados chegam, mas com gaps conhecidos

missing
├─ Integração não conectada
└─ Nenhum dado recebido dessa fonte

stale
├─ Integração foi conectada, mas não sincroniza há muito tempo
├─ Dados defasados
└─ Requer reconexão ou reativação

error
├─ Integração apresentou falha
├─ Último pull falhou
└─ Requer intervenção técnica
```

### Níveis de Cobertura por Conta

```
full
├─ Cobertura completa de um tipo de dado (contatos, sinais, oportunidades)
└─ >85% dos campos esperados preenchidos

partial
├─ Cobertura incompleta
├─ Alguns contatos/sinais sim, outros faltam
└─ 40-85% dos campos esperados preenchidos

weak
├─ Cobertura muito limitada
├─ Esporádica ou muito superficial
└─ <40% dos campos esperados preenchidos

none
├─ Nenhuma cobertura dessa fonte para essa conta
└─ 0% dos campos preenchidos
```

---

## 9. Regras de Coerência com o Bloco A

### Invariante 1: Conta Sempre Válida

Toda referência a `accountId` em qualquer tabela do Bloco B deve apontar para conta real no Bloco A.

```typescript
accountId ∈ {id de qualquer uma das 43 contas}
```

### Invariante 2: Integração Sempre Válida

Toda referência a `integrationId` deve apontar para integração registrada em `integrations`.

### Invariante 3: Coerência de Estados

Se `sync_status` diz `connected`, então:

- Deve haver snapshot **recente** (menos de 24h)
- Snapshot deve ter `syncStatus: 'success'`
- `account_source_coverage` para essa integração NÃO deve ser `none`

Se `sync_status` diz `stale`, então:

- Último snapshot tem **mais de 30 dias**
- `account_source_coverage` para essa integração pode ser `weak` ou `none`

### Invariante 4: Covertura Racional

A soma de cobertura de uma conta não pode ser irracional.

Exemplo **não-aceitável**:
```
Conta X:
├─ HubSpot: none (não conectado)
├─ Salesforce: none
└─ Resultado: conta inteira vazia
```

Mas isso é OK se essa conta for muito nova (descoberta).

Exemplo **aceitável**:
```
Conta Y:
├─ HubSpot: partial (tem contatos, faltam sinais)
├─ Google Ads: partial (tem sinais, faltam contatos)
└─ Resultado: cobertura combinada faz sentido
```

---

## 10. Critério de Aceite do Bloco B

O Bloco B pode ser considerado pronto quando:

1. ✅ As 4 tabelas estão estruturadas (types + builders)
2. ✅ Há geração automatizada no repo (sem seed manual)
3. ✅ Validação de coerência passa para todas as 43 contas
4. ✅ Cada conta tem pelo menos 2-3 integrações com cobertura definida
5. ✅ Não há `accountId` ou `integrationId` orfanado
6. ✅ Estados são coerentes entre snapshot → sync_status → account_source_coverage
7. ✅ Histórico de mudanças está registrado onde aplicável
8. ✅ Handoff pode ser feito sem contexto oral

---

## 11. Arqueologia: Por Que Essas 4 Tabelas?

### `integrations`

Define o universo de possíveis fontes.

Sem isso, a plataforma não sabe quantas integrações existem ou qual é seu status.

### `source_snapshots`

Captura histórico de sincronização.

Permite ver:
- Quando foi a última vez que recebemos dados?
- Quantos registros chegaram?
- Houve erro?

### `account_source_coverage`

Responde a pergunta operacional:
- **Para essa conta específica, essa integração cobre o quê?**

Sem isso, não dá para entender por que faltam contatos de uma conta.

### `sync_status`

Status corrente em tempo real (quase).

Permite dashboard mostrar:
- Quais integrações estão saudáveis
- Quais têm alertas
- Quais precisam de intervenção

---

## 12. Leitura Obrigatória Associada

Este documento deve ser lido junto com:

1. `docs/98-operacao/01-plano-canonico-seed-handoff-obrigatorio.md`
2. `docs/98-operacao/02-bloco-a-mapeamento-canonico.md`
3. `docs/98-operacao/03-regras-minimas-de-volume-e-densidade.md`
4. `scripts/seed/scenarios/parcial.ts`

---

## 13. Próxima Ação Oficial

A próxima ação oficial após este documento é:

**Criar estrutura de tipos e builders para as 4 tabelas, sem populacional dados ainda.**

Scaffolding esperado:

- `scripts/seed/buildBlockBSeed.ts`
- `scripts/seed/exportBlockBSeedJson.ts`
- `scripts/seed/validateBlockBSeed.ts`

Esses arquivos devem nascer prontos para receberem dados na próxima iteração.

---

## 14. Efeito sobre Bloco C

O Bloco C (campaigns, interactions, plays) depende do Bloco B estar estruturado.

Não começamos Bloco C enquanto Bloco B não tiver scaffolding e validação pronta.

---

## 15. Status deste Bloco

**Status:** Documento de definição criado  
**Estrutura:** Pronta para implementação  
**Dados:** Ainda não povoados (próxima iteração)  
**Validação:** A ser implementada  
**Supabase:** Não tocar ainda
