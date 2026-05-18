# HubSpot Clean Reload — Create Limpo de Companies — C2.9E.2D.12

> **Status:** implementado e validado funcionalmente. 247 Companies criadas no HubSpot, 247 mappings persistidos em `hubspot_identity_mappings`, `canProceedToContactCreate: true`.

## Identificação do recorte

- **Nome:** C2.9E.2D.12 — Create limpo de Companies no HubSpot + captura de `hs_object_id` + persistência de mappings
- **Dependência direta:** C2.9E.2D.11A — 6/6 propriedades bloqueadoras presentes e compatíveis no HubSpot, `canProceedToCleanCreate: true` validado em 2026-05-18
- **Arquivos criados:**
  - `src/lib/server/hubspotCleanReloadCompanyCreateService.ts`
  - `src/app/api/account-connectors/hubspot/clean-reload/create-companies/route.ts`

## Objetivo

Criar Companies no HubSpot a partir da base canônica Canopi (`accounts`), capturar `hs_object_id` para cada Company criada e persistir o mapping `canonical_id → hs_object_id` em `hubspot_identity_mappings`.

Somente Companies são criadas neste recorte. Contacts, Deals, Products e Services não fazem parte deste recorte.

## Escopo estrito

| Permitido | Bloqueado |
|---|---|
| Criar Companies no HubSpot | Criar Contacts, Deals, Products, Services |
| Capturar `hs_object_id` | Usar `hs_object_id` históricos |
| Persistir mappings `entity_type=account` | Escrever em `accounts` ou `contacts` no Supabase |
| Preflight completo antes de qualquer escrita | Reset, delete, upsert, applyAll |

## Rota

```
POST /api/account-connectors/hubspot/clean-reload/create-companies
```

### Payload obrigatório

```json
{
  "batchId": "canopi-clean-reload-2026-05-18",
  "tenantId": "canopi-local-validation-tenant",
  "confirmCreateCompanies": true
}
```

Todos os três campos são obrigatórios. `confirmCreateCompanies: true` é o gate de segurança — sem ele, retorna `CONFIRM_REQUIRED` com HTTP 400.

### Chaves bloqueadas no payload

`token`, `contacts`, `deals`, `products`, `services`, `reset`, `delete`, `upsert`, `applyAll`

Qualquer uma dessas chaves retorna `BLOCKED_PAYLOAD_KEYS` com HTTP 400.

## Preflight mandatório

Antes de qualquer escrita no HubSpot, o serviço executa:

1. **Registry validation** — `validateHubspotPropertyRegistry()` deve retornar `valid: true`.
2. **Setup properties** — `runHubspotCleanReloadSetup({mode:'verify'})` deve retornar `canProceedToCleanCreate: true`. Propriedades bloqueadoras ausentes ou incompatíveis bloqueiam a execução.
3. **Existing mappings** — `listHubspotIdentityMappings({provider:'hubspot', entityType:'account', status:'active'})` deve retornar `length === 0`. Qualquer mapping ativo existente bloqueia a execução.
4. **Valid accounts** — `accounts` com `nome` preenchido e `tenantId` presente. Accounts sem `nome` são bloqueadas e registradas em `blockedReasons`.

## Geração de `canopi_company_id`

Algoritmo FNV-1a 32-bit (mirrors `hubspotWritebackNormalizer.createCompanyId`):

```
normalizeSlug(nome) + '|' + normalizeSlug(dominio ?? '') + '|'
→ stableHash(base) em base-36
→ 'cpco_' + hash
```

`website` não faz parte do input para registros da base Canopi.

## Propriedades enviadas ao HubSpot por Company

| Propriedade HubSpot | Valor |
|---|---|
| `name` | `accounts.nome` |
| `domain` | `accounts.dominio` (omitido se null/vazio) |
| `canopi_canonical_id` | `accounts.id` (UUID) |
| `canopi_company_id` | `cpco_${hash}` |
| `canopi_tenant_id` | `tenantId` do payload |
| `canopi_import_batch_id` | `batchId` do payload |
| `canopi_contract_version` | `c2.9e.2d.12` (ou override do payload) |
| `canopi_sync_status` | `pending` |
| `canopi_source` | `canopi_clean_reload` |
| `canopi_last_sync_at` | ISO 8601 do momento de execução |

## Matching de resultados

HubSpot batch create não garante a ordem dos resultados. O matching `resultado → input` é feito por `properties.canopi_canonical_id`. Companies cujo `canopi_canonical_id` não aparecer nos resultados são marcadas como falha.

## Persistência de mappings

Para cada Company criada com sucesso no HubSpot:

```
hubspot_identity_mappings:
  provider            = 'hubspot'
  entity_type         = 'account'
  canonical_id        = accounts.id
  canopi_external_id  = canopi_company_id
  hubspot_id          = hs_object_id
  status              = 'active'
  metadata_json       = { batchId, tenantId, contractVersion, createdAt, source: 'canopi_clean_reload' }
```

### Cenário `created_without_mapping`

Se uma Company for criada no HubSpot mas o insert do mapping falhar, ela é registrada em `warnings` com o `hs_object_id` capturado e marcada como `mappingStatus: 'failed'` em `createdCompanies`. Isso bloqueia `canProceedToContactCreate`.

## Processamento em chunks

Chunk size: 50 Companies por chamada ao endpoint `POST /crm/v3/objects/companies/batch/create`. Falha em um chunk não interrompe os demais — cada chunk é processado independentemente.

## Contrato da resposta

```ts
{
  status: 'success',
  mode: 'create_companies',
  provider: 'hubspot',
  contractVersion: string,
  batchId: string,
  tenantId: string,
  executedAt: string,                // ISO 8601
  preflight: {
    registryValid: boolean,
    setupReady: boolean,
    setupMissingProperties: string[],
    setupIncompatibleProperties: string[],
    existingCompanyMappings: number,
    validCompanies: number,
    blockedCompanies: number,
    blockedReasons: string[],
  },
  results: {
    attempted: number,
    created: number,
    failed: number,
    mappingsPersisted: number,
    mappingsFailed: number,
    createdWithoutMapping: number,
  },
  createdCompanies: CompanyCreateEntry[],
  failedCompanies: CompanyCreateFailure[],
  blockers: string[],
  warnings: string[],
  canProceedToContactCreate: boolean,
  guardrails: string[],
}
```

## Condição para `canProceedToContactCreate: true`

- `blockers` vazio após create (nenhuma falha de create, nenhum mapping faltando)
- `createdCompanies.length > 0`

## Idempotência

A rota **não é idempotente** — a checagem de mappings existentes bloqueia a segunda execução se qualquer mapping ativo já existir. Isso é intencional: a nova carga limpa parte de estado limpo.

## Guardrails explícitos

- Nenhum Contact criado no HubSpot.
- Nenhum Deal, Product ou Service criado no HubSpot.
- Nenhum reset ou delete executado.
- Nenhum `hs_object_id` histórico reutilizado.
- Nenhuma escrita em `accounts` ou `contacts` no Supabase.
- Token lido de `HUBSPOT_PRIVATE_APP_TOKEN` no servidor — não exposto na resposta.
- Preflight completo obrigatório antes de qualquer escrita no HubSpot.
- `confirmCreateCompanies: true` obrigatório.
- Execution bloqueada se qualquer mapping `entity_type=account` ativo já existir.

## Domain sanitization

Antes de enviar o `domain` ao HubSpot, o serviço aplica `sanitizeDomain()`:
- Remove prefixos `http://` e `https://`
- Remove paths após `/`
- Valida contra o padrão `[a-z0-9][a-z0-9\-.]*\.[a-z]{2,}`
- Domínios inválidos (ex: `expressl&t.net`) são enviados como `null` — omitidos do payload

Isso evita falha de batch inteiro por um único domínio com caracteres inválidos (ex: `&` HTML entity).

## `resumeMode`

Quando `resumeMode: true` é passado no payload:
- Companies com mapping ativo em `hubspot_identity_mappings` são ignoradas
- Somente as não mapeadas são tentadas
- Útil para retomar após falha parcial sem limpar e reiniciar

## Conflito de `canopi_company_id` histórico

Preflight detecta companies com `canopi_company_id` existente no HubSpot mas SEM `canopi_canonical_id` (registros históricos de C2.9D.2). Se encontrados, a execução é bloqueada antes de qualquer create.

## O que este recorte NÃO faz

- Não cria Contacts, Deals, Products ou Services.
- Não executa upsert ou atualização de Companies existentes.
- Não lê nem reutiliza `hs_object_id` históricos.
- Não escreve em `accounts` ou `contacts` no Supabase.
- Não executa o recorte de Contacts (C2.9E.2D.13).

## Validação funcional executada (C2.9E.2D.12A) — 2026-05-18

Servidor: `next dev -H 0.0.0.0 -p 3053`

### Teste 1 — Sem `confirmCreateCompanies`

```json
{}
HTTP 400 — CONFIRM_REQUIRED, canProceedToContactCreate: false ✅
```

### Teste 2 — Chave bloqueada `token`

```json
{ "token": "x", "confirmCreateCompanies": true, "batchId": "b1", "tenantId": "t1" }
HTTP 400 — BLOCKED_PAYLOAD_KEYS: ["token"], canProceedToContactCreate: false ✅
```

### Teste 3 — Sem `batchId`

```json
{ "confirmCreateCompanies": true }
HTTP 400 — BATCH_ID_REQUIRED, canProceedToContactCreate: false ✅
```

### Teste 4 — Sem `tenantId`

```json
{ "confirmCreateCompanies": true, "batchId": "canopi-clean-reload-2026-05-18" }
HTTP 400 — TENANT_ID_REQUIRED, canProceedToContactCreate: false ✅
```

### Teste 5 — Preflight + create real

```json
{
  "batchId": "canopi-clean-reload-2026-05-18",
  "tenantId": "canopi-local-validation-tenant",
  "confirmCreateCompanies": true
}
HTTP 200 — create real executado
```

**Preflight:**
- `registryValid: true`
- `setupReady: true` (6/6 propriedades bloqueadoras presentes)
- `metadataPropertiesCreated: ["canopi_contract_version", "canopi_sync_status"]`
- `metadataPropertiesAlreadyExist: ["canopi_import_batch_id", "canopi_last_sync_at", "canopi_source"]`
- `existingCompanyMappings: 0`
- `hubspotCanopiCompanyIdConflicts: 0`
- `validCompanies: 247`, `blockedCompanies: 3` (IDs 1, 11, 14 — legados sem nome)

**Resultado inicial (antes do fix de domain):**
- `created: 200`, `failed: 47`
- Causa dos 47 failures: domínio `expressl&t.net` contendo `&` inválido bloqueou o batch inteiro do 5º chunk

**Fixes aplicados durante validação:**
1. `sanitizeDomain()` — domínios com caracteres inválidos são omitidos do payload (enviados como `null`)
2. `resumeMode: true` — permite criar somente os não mapeados sem reiniciar
3. Conflito de `canopi_company_id` histórico — preflight busca companies sem `canopi_canonical_id` e bloqueia se houver conflito
4. Retry 429 — `batchCreateCompanies` com backoff automático (2 retries)

### Teste 6 — resumeMode para criar os 47 restantes

```json
{
  "batchId": "canopi-clean-reload-2026-05-18",
  "tenantId": "canopi-local-validation-tenant",
  "confirmCreateCompanies": true,
  "resumeMode": true
}
HTTP 200 — create em modo resume
```

```
results:
  attempted: 247
  created: 47
  failed: 0
  mappingsPersisted: 47
  mappingsFailed: 0
  createdWithoutMapping: 0
blockers: []
warnings: ["3 accounts bloqueadas e excluídas: 14, 11, 1"]
canProceedToContactCreate: true ✅
```

### Estado final

| Métrica | Valor |
|---|---|
| Companies criadas no HubSpot | 247 |
| Mappings persistidos (`entity_type=account`) | 247 |
| Mappings falhos | 0 |
| `canProceedToContactCreate` | `true` |
| Accounts bloqueadas (sem nome) | 3 (IDs 1, 11, 14) |
| Token exposto na resposta | Não |
| Contatos criados | Nenhum |
| Escrita em `accounts`/`contacts` Supabase | Nenhuma |

### Guardrails confirmados

- Nenhum Contact criado ✅
- Nenhum Deal, Product ou Service criado ✅
- Nenhum reset ou delete executado ✅
- Nenhum `hs_object_id` histórico reutilizado ✅
- Nenhuma escrita em `accounts` ou `contacts` no Supabase ✅
- Token não exposto na resposta ✅

## Próximo recorte recomendado

**C2.9E.2D.13 — Create limpo de Contacts + captura de `hs_object_id` + persistência de mappings + associação Contact → Company**

Pré-condição satisfeita: 247 Companies criadas no HubSpot com mappings ativos, `canProceedToContactCreate: true`.
