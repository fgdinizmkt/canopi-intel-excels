# HubSpot Clean Reload Dry-Run — Validação Funcional — C2.9E.2D.10A

> **Status:** validação funcional completa. Nenhuma escrita foi feita no HubSpot, no Supabase nem em mappings.

## Identificação do recorte

- **Nome:** C2.9E.2D.10A — Validação funcional do dry-run da nova carga limpa Canopi → HubSpot
- **Dependência direta:** C2.9E.2D.10 — `POST /api/account-connectors/hubspot/clean-reload/dry-run`
- **Data de execução:** 2026-05-18
- **Servidor:** `next dev -H 0.0.0.0 -p 3053`

## Objetivo

Confirmar que a rota implementada em C2.9E.2D.10 se comporta corretamente em todos os cenários de bloqueio e no cenário positivo com base de dados real Canopi, sem executar nenhuma escrita externa.

## Testes negativos

### Teste 1 — Payload vazio (`batchId` ausente)

```json
POST /api/account-connectors/hubspot/clean-reload/dry-run
{}
```

**Resultado esperado e obtido:**
```json
{ "status": "error", "error": "BATCH_ID_REQUIRED", "canProceedToCleanCreate": false }
HTTP 400
```

### Teste 2 — Chave bloqueada `apply`

```json
{ "apply": true }
```

**Resultado esperado e obtido:**
```json
{ "status": "error", "error": "BLOCKED_PAYLOAD_KEYS", "blocked": ["apply"], "canProceedToCleanCreate": false }
HTTP 400
```

### Teste 3 — Chave bloqueada `reset`

```json
{ "reset": true }
```

**Resultado esperado e obtido:**
```json
{ "status": "error", "error": "BLOCKED_PAYLOAD_KEYS", "blocked": ["reset"], "canProceedToCleanCreate": false }
HTTP 400
```

### Teste 4 — Chave bloqueada `token`

```json
{ "token": "abc" }
```

**Resultado esperado e obtido:**
```json
{ "status": "error", "error": "BLOCKED_PAYLOAD_KEYS", "blocked": ["token"], "canProceedToCleanCreate": false }
HTTP 400
```

### Teste 5 — Chaves bloqueadas `companies` + `contacts`

```json
{ "companies": [], "contacts": [] }
```

**Resultado esperado e obtido:**
```json
{ "status": "error", "error": "BLOCKED_PAYLOAD_KEYS", "blocked": ["companies", "contacts"], "canProceedToCleanCreate": false }
HTTP 400
```

### Teste 6 — `batchId` presente, `tenantId` ausente

```json
{ "batchId": "canopi-clean-reload-validation-2026-05-18" }
```

**Resultado esperado e obtido:**
- `status: "success"`
- `blockers` presentes (todas as 250 companies bloqueadas por `tenantId` ausente)
- `canProceedToCleanCreate: false`
- `companies.valid: 0`, `companies.blocked: 250`
- Sem `token` na resposta

## Teste positivo

### Payload

```json
{
  "batchId": "canopi-clean-reload-validation-2026-05-18",
  "tenantId": "canopi-local-validation-tenant",
  "contractVersion": "c2.9e.2d.9",
  "sampleSize": 6
}
```

### Resultado obtido

| Campo | Valor |
|---|---|
| `status` | `"success"` |
| `mode` | `"clean_reload_dry_run"` |
| `provider` | `"hubspot"` |
| `contractVersion` | `"c2.9e.2d.9"` |
| `batchId` | `"canopi-clean-reload-validation-2026-05-18"` |
| `tenantId` | `"canopi-local-validation-tenant"` |
| `registryValidation.valid` | `true` |
| `registryValidation.totalProperties` | `42` |
| `registryValidation.missingBlocking` | `[]` |
| `companies.total` | `250` |
| `companies.valid` | `247` |
| `companies.blocked` | `3` |
| `contacts.total` | `305` |
| `contacts.valid` | `305` |
| `contacts.blockedNoAnchor` | `0` |
| `contacts.blockedOther` | `0` |
| `existingMappings.total` | `0` |
| `blockers` | `[]` |
| `warnings` | `["3 companies bloqueadas e excluídas do plano"]` |
| `planHash` | `939400e35fcd7774eb2d311f171a1cff4647d3915d7675664a8e656fae5e1cf6` |
| `canProceedToCleanCreate` | `true` |
| Token na resposta | Não — confirmado |

### Determinismo do planHash

Duas chamadas consecutivas com o mesmo payload produziram o mesmo hash:

```
939400e35fcd7774eb2d311f171a1cff4647d3915d7675664a8e656fae5e1cf6
939400e35fcd7774eb2d311f171a1cff4647d3915d7675664a8e656fae5e1cf6
```

Confirmado como determinístico.

## 3 companies bloqueadas

As três accounts com `canonical_id = "1"`, `"11"` e `"14"` têm `nome: null` e `dominio: null`. São registros legados/placeholder sem identificação. Corretamente excluídas do plano — sem elas, 247 companies são válidas.

## Discrepância de contagem de propriedades

O doc operacional C2.9E.2D.9 (`58-hubspot-property-registry.md`) registrava:
- Contact: 13 propriedades
- Total: 43

O retorno funcional confirmou:
- `registryValidation.totalProperties: 42`

A registry tem Contact com 12 propriedades (não 13). A discrepância é documental — a registry em si é **funcionalmente válida** (`missingBlocking: []`, `valid: true`). Nenhuma propriedade bloqueadora está ausente.

## Estado do HubSpot confirmado

- `hubspot_identity_mappings`: `0` registros — confirmado limpo para nova carga
- Nenhuma escrita realizada em nenhuma tabela
- Nenhuma chamada à API HubSpot

## Guardrails confirmados

- Nenhuma escrita executada — somente leitura de `accounts` e `contacts`
- Nenhuma chamada à API HubSpot
- Nenhum mapping criado
- `canProceedToCleanCreate=false` em todos os cenários de bloqueio
- `tenantId` fornecido explicitamente — não inferido do ambiente
- `planHash` determinístico confirmado
- Resposta não expõe token, credentials ou payload bruto

## Próximo recorte

**C2.9E.2D.11 — Setup de propriedades para nova carga limpa**

Verificar e criar as propriedades bloqueadoras no HubSpot (`canopi_canonical_id`, `canopi_tenant_id`, `canopi_contract_version` nas Company e Contact properties) antes do create real.
