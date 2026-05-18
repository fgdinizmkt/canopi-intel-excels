# HubSpot Clean Reload Dry-Run — C2.9E.2D.10

> **Status:** implementado e publicado. Nenhuma escrita foi feita no HubSpot, no Supabase, nem em mappings.

## Identificação do recorte

- **Nome:** C2.9E.2D.10 — Dry-run da nova carga limpa Canopi → HubSpot
- **Dependência direta:** C2.9E.2D.9 — `src/lib/hubspotPropertyRegistry.ts`
- **Arquivos criados:**
  - `src/lib/server/hubspotCleanReloadDryRunService.ts`
  - `src/app/api/account-connectors/hubspot/clean-reload/dry-run/route.ts`

## Objetivo

Montar e validar um plano de carga limpa da Canopi para o HubSpot, sem escrever nada. O dry-run:

1. Lê `accounts` e `contacts` da Canopi (Supabase, somente leitura).
2. Valida cada entidade contra a property registry (C2.9E.2D.9).
3. Verifica ancoragem contact → company.
4. Verifica ausência de conflito com mappings históricos.
5. Gera `planHash` determinístico.
6. Retorna `canProceedToCleanCreate: true/false`.

## Rota

```
POST /api/account-connectors/hubspot/clean-reload/dry-run
```

### Payload aceito

```json
{
  "batchId": "nova-carga-2026-05-18",
  "tenantId": "<tenant-uuid>",
  "contractVersion": "c2.9e.2d.9",
  "sampleSize": 5
}
```

### Payload bloqueado

As seguintes chaves bloqueiam a requisição imediatamente: `token`, `companies`, `contacts`, `records`, `mode`, `apply`, `create`, `reset`.

### `batchId` obrigatório

Sem `batchId`, a rota retorna `BATCH_ID_REQUIRED` com `canProceedToCleanCreate: false`.

## Uso da property registry como guardrail

O serviço usa obrigatoriamente:

| Helper | Uso |
|---|---|
| `validateHubspotPropertyRegistry()` | Valida que a registry está completa antes de qualquer checagem |
| `getBlockingHubspotProperties('company')` | Identifica quais campos ausentes são bloqueadores |
| `getRequiredHubspotProperties('company')` | Lista propriedades obrigatórias que o payload deve cobrir |
| `getBlockingHubspotProperties('contact')` | Idem para contacts |
| `getRequiredHubspotProperties('contact')` | Idem para contacts |

## Validações por entidade

### Company
| Validação | Tipo | Descrição |
|---|---|---|
| `accounts.id` presente | Implícito | UUID do DB — sempre presente |
| `nome` presente | Bloqueador | Necessário para gerar `canopi_company_id` |
| `tenantId` fornecido | Bloqueador | Necessário para `canopi_tenant_id` |
| `dominio` presente | Warning | Ausência degrada qualidade do hash de company ID |

### Contact
| Validação | Tipo | Descrição |
|---|---|---|
| `contacts.id` presente | Implícito | UUID do DB — sempre presente |
| `accountId` resolvido em companies válidas | Bloqueador | Contact sem âncora não entra na carga |
| `tenantId` fornecido | Bloqueador | Necessário para `canopi_tenant_id` |
| `nome` presente | Warning | Contact sem nome identificável |

## Resultado do dry-run

```ts
{
  status: 'success',
  mode: 'clean_reload_dry_run',
  provider: 'hubspot',
  contractVersion: string,
  batchId: string,
  tenantId: string | null,
  executedAt: string,            // ISO 8601
  registryValidation: {
    valid: boolean,
    totalProperties: number,     // esperado: 43
    missingBlocking: string[],
    warnings: string[],
  },
  companies: {
    total: number,               // todos os accounts Canopi
    valid: number,               // aptos para carga
    blocked: number,             // excluídos do plano
    requiredProperties: string[],
    blockingProperties: string[],
    samples: [...],              // mix de válidas + bloqueadas
  },
  contacts: {
    total: number,
    valid: number,
    blockedNoAnchor: number,     // sem empresa âncora
    blockedOther: number,        // outros bloqueios
    requiredProperties: string[],
    blockingProperties: string[],
    samples: [...],
  },
  existingMappings: {
    total: number,               // hubspot_identity_mappings atual
    note: string,
  },
  blockers: string[],
  warnings: string[],
  planHash: string,              // SHA-256 determinístico
  canProceedToCleanCreate: boolean,
  guardrails: string[],
}
```

## planHash

O `planHash` é um SHA-256 determinístico de:

```json
{
  "batchId": "...",
  "contractVersion": "...",
  "tenantId": "...",
  "companies": ["<uuid-sorted>", ...],
  "contacts": ["<uuid-sorted>", ...]
}
```

O mesmo `batchId` + `contractVersion` + `tenantId` + mesma base Canopi sempre gera o mesmo hash. Hash diferente indica que a base mudou entre duas execuções.

## Condição para `canProceedToCleanCreate: true`

Todos os bloqueadores a seguir devem estar ausentes:

1. Registry inválida (`validateHubspotPropertyRegistry().valid === false`).
2. `tenantId` ausente.
3. Zero companies válidas.

## Guardrails explícitos

- Nenhuma escrita executada — somente leitura de `accounts` e `contacts`.
- Nenhuma chamada à API HubSpot.
- Nenhum mapping criado.
- `canProceedToCleanCreate=false` bloqueia qualquer create subsequente.
- `tenantId` deve ser fornecido explicitamente — não inferido do ambiente.
- `planHash` é determinístico — mesma base gera o mesmo hash.
- Contacts bloqueados por ausência de âncora não entram na carga.
- Histórico HubSpot (`hubspot_identity_mappings`) não é reutilizado — nova carga gera novos `hs_object_ids`.
- Resposta não expõe token, credentials ou payload bruto.

## O que ainda não foi executado

- Nenhuma propriedade criada no HubSpot.
- Nenhum create real de Company ou Contact.
- Nenhum mapping persistido em `hubspot_identity_mappings`.
- Nenhum reset do HubSpot histórico.
- Nenhuma captura de `hs_object_id`.

## Próximo recorte recomendado

**C2.9E.2D.11 — Setup de propriedades para nova carga limpa**

Antes do create real, garantir que as propriedades bloqueadoras estão presentes no HubSpot:
- Verificar `canopi_canonical_id`, `canopi_tenant_id`, `canopi_contract_version` nas Company e Contact properties do HubSpot.
- Criar as que estiverem ausentes via setup route existente (adaptada para a nova registry).
- Sem create real até o setup estar confirmado.

Após o setup: **C2.9E.2D.12 — Create limpo de Companies + captura de hs_object_id + persistência de mappings**.
