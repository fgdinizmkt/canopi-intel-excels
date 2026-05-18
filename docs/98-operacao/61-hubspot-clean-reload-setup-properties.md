# HubSpot Clean Reload — Setup de Propriedades Bloqueadoras — C2.9E.2D.11

> **Status:** implementado e validado funcionalmente. Nenhum Company, Contact ou mapping criado.

## Identificação do recorte

- **Nome:** C2.9E.2D.11 — Setup/verificação das propriedades bloqueadoras no HubSpot antes do create real
- **Dependência direta:** C2.9E.2D.10A — `canProceedToCleanCreate: true` validado em 2026-05-18
- **Arquivos criados:**
  - `src/lib/server/hubspotCleanReloadSetupService.ts`
  - `src/app/api/account-connectors/hubspot/clean-reload/setup-properties/route.ts`

## Objetivo

Garantir que as propriedades bloqueadoras da nova carga limpa estejam presentes e compatíveis no HubSpot antes de qualquer criação de Company ou Contact.

O recorte cobre:
1. Leitura das propriedades existentes via `HUBSPOT_PRIVATE_APP_TOKEN` (env, nunca exposto).
2. Comparação contra as blocking properties da registry (C2.9E.2D.9).
3. Auditoria de compatibilidade por propriedade: tipo, fieldType, hasUniqueValue, arquivado.
4. Criação das propriedades ausentes — somente com `mode_setup=create_missing` + `confirm=true`.
5. Re-verificação automática pós-criação.
6. Retorno de `canProceedToCleanCreate: true/false`.

## Escopo — somente Company e Contact

Deal e Product/Service não fazem parte deste recorte. A carga limpa inicial cobre apenas Company e Contact.

## Propriedades bloqueadoras auditadas

| Entidade | hubspotName | type | fieldType | hasUniqueValue |
|---|---|---|---|---|
| Company | `canopi_canonical_id` | string | text | true |
| Company | `canopi_company_id` | string | text | true |
| Company | `canopi_tenant_id` | string | text | false |
| Contact | `canopi_canonical_id` | string | text | true |
| Contact | `canopi_contact_id` | string | text | true |
| Contact | `canopi_tenant_id` | string | text | false |

**6 propriedades bloqueadoras** no total. As propriedades de metadata e enrichment não são verificadas nem criadas aqui.

### Lógica de hasUniqueValue

- `canopi_canonical_id`: UUID de accounts.id ou contacts.id — único por registro → `true`
- `canopi_company_id` / `canopi_contact_id`: ID externo determinístico — único por registro → `true`
- `canopi_tenant_id`: Mesmo valor para todos os registros do mesmo tenant → `false`

## Rota

```
POST /api/account-connectors/hubspot/clean-reload/setup-properties
```

### Modo verify (padrão — somente leitura)

```json
{}
```

ou com versão explícita:

```json
{ "contractVersion": "c2.9e.2d.11" }
```

### Modo create_missing (escrita no HubSpot)

```json
{
  "mode_setup": "create_missing",
  "confirm": true
}
```

`confirm: true` é obrigatório. Sem ele, retorna `CONFIRM_REQUIRED` com HTTP 400.

### Chaves bloqueadas no payload

`token`, `records`, `companies`, `contacts`, `apply`, `create`, `reset`

Qualquer uma dessas chaves retorna `BLOCKED_PAYLOAD_KEYS` com HTTP 400.

### Nota: `mode_setup` (não `mode`)

O campo de controle é `mode_setup` para não colidir com o campo `mode` de outras rotas da frente. Payloads genéricos não ativam acidentalmente o modo de criação.

## Contrato da resposta

```ts
{
  status: 'success',
  contractVersion: string,
  mode: 'verify' | 'create_missing',
  checkedAt: string,              // ISO 8601
  objects: {
    companies: {
      objectType: 'companies',
      properties: PropertyCheckResult[],  // status: 'ok' | 'missing' | 'incompatible'
      ready: boolean,
    },
    contacts: {
      objectType: 'contacts',
      properties: PropertyCheckResult[],
      ready: boolean,
    },
  },
  summary: {
    totalChecked: number,         // sempre 6 neste recorte
    ok: number,
    missing: number,
    incompatible: number,
    created: number,              // > 0 somente em create_missing
    failed: number,
  },
  missingProperties: string[],      // ex: ["companies.canopi_canonical_id"]
  incompatibleProperties: string[], // ex: ["companies.canopi_tenant_id: tipo 'enumeration' difere..."]
  createdProperties: string[],      // ex: ["companies.canopi_canonical_id"]
  blockers: string[],
  warnings: string[],
  canProceedToCleanCreate: boolean,
  guardrails: string[],
}
```

## Condição para `canProceedToCleanCreate: true`

`blockers` deve estar vazio. Blockers são gerados por:
1. Propriedades bloqueadoras ausentes (`missing > 0`)
2. Propriedades bloqueadoras incompatíveis (`incompatible > 0`)
3. Falha de criação em `create_missing` (`failed > 0`)

## Comportamento idempotente

Executar `create_missing` duas vezes é seguro. Na segunda execução, todas as propriedades já existem e o log registra `already_exists`. Nenhuma sobrescrita.

## Proteção contra incompatibilidades

Se uma propriedade já existe com tipo ou fieldType diferentes do esperado:
- Em `verify`: marcada como `incompatible` na auditoria.
- Em `create_missing`: **bloqueia toda a execução** e retorna `INCOMPATIBLE_PROPERTIES_BLOCK_CREATE` com a lista das propriedades afetadas.
- Nenhuma tentativa de atualizar ou sobrescrever propriedades existentes — isso exige intervenção manual no HubSpot.

## Guardrails explícitos

- Nenhum Company ou Contact criado no HubSpot.
- Nenhum mapping criado em `hubspot_identity_mappings`.
- Nenhuma escrita em `accounts` ou `contacts` no Supabase.
- Token lido de `HUBSPOT_PRIVATE_APP_TOKEN` no servidor — não exposto na resposta.
- `create_missing` só executa com `confirm=true` explícito.
- Propriedades incompatíveis bloqueiam `create_missing` inteiramente.
- Propriedades existentes nunca são sobrescritas.

## O que este recorte NÃO faz

- Não cria Companies nem Contacts no HubSpot.
- Não captura `hs_object_id`.
- Não persiste mappings em `hubspot_identity_mappings`.
- Não verifica nem cria propriedades de Deal ou Product/Service.
- Não executa a carga limpa real.
- Não altera o planHash gerado em C2.9E.2D.10.

## Validação funcional executada (C2.9E.2D.11A) — 2026-05-18

Servidor: `next dev -H 0.0.0.0 -p 3053`

### Teste 1 — Chave bloqueada `token`

```json
POST {}  →  { "token": "x" }
HTTP 400 — BLOCKED_PAYLOAD_KEYS: ["token"], canProceedToCleanCreate: false ✅
```

### Teste 2 — `create_missing` sem `confirm`

```json
{ "mode_setup": "create_missing" }
HTTP 400 — CONFIRM_REQUIRED, canProceedToCleanCreate: false ✅
```

### Teste 3 — verify inicial

```json
{}
HTTP 200 — mode: verify
summary: { totalChecked: 6, ok: 2, missing: 4, incompatible: 0, created: 0, failed: 0 }
```

| Propriedade | Status |
|---|---|
| companies.canopi_canonical_id | missing |
| companies.canopi_company_id | ok (existia do C2.9D.1) |
| companies.canopi_tenant_id | missing |
| contacts.canopi_canonical_id | missing |
| contacts.canopi_contact_id | ok (existia do C2.9D.1) |
| contacts.canopi_tenant_id | missing |

`canProceedToCleanCreate: false` ✅

### Teste 4 — `create_missing` com `confirm: true`

```json
{ "mode_setup": "create_missing", "confirm": true }
HTTP 200 — mode: create_missing
summary: { totalChecked: 6, ok: 6, missing: 0, incompatible: 0, created: 4, failed: 0 }
```

Propriedades criadas:
- `companies.canopi_canonical_id` — string/text, `hasUniqueValue: true`
- `companies.canopi_tenant_id` — string/text, `hasUniqueValue: false`
- `contacts.canopi_canonical_id` — string/text, `hasUniqueValue: true`
- `contacts.canopi_tenant_id` — string/text, `hasUniqueValue: false`

`canProceedToCleanCreate: true` ✅

### Teste 5 — re-verify pós-criação

```json
{}
HTTP 200 — mode: verify
summary: { totalChecked: 6, ok: 6, missing: 0, incompatible: 0, created: 0, failed: 0 }
missingProperties: []
incompatibleProperties: []
createdProperties: []
canProceedToCleanCreate: true ✅
```

### Confirmações de guardrail

- Nenhum token retornado em nenhuma das respostas ✅
- Nenhuma Company criada ✅
- Nenhum Contact criado ✅
- Nenhum mapping criado ✅
- Nenhuma escrita no Supabase ✅

## Próximo recorte recomendado

**C2.9E.2D.12 — Create limpo de Companies + captura de `hs_object_id` + persistência de mappings**

Pré-condição satisfeita: 6/6 propriedades bloqueadoras presentes e compatíveis no HubSpot, `canProceedToCleanCreate: true`.
