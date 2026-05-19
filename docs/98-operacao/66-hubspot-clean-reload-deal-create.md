# HubSpot — Create Limpo de Deals — C2.9E.2D.14

> **Status:** implementado, recovery executado com sucesso em 2026-05-19. 27/27 Deals criados, 27/27 mappings persistidos, 27/27 associações Deal → Company e 80/80 associações Deal → Contact criadas. Serviço corrigido com `preflightOnly` real após incidente de execução antecipada.

## Ambiente executor e perfil

- **Ambiente executor:** Claude Code / Sonnet 4.6
- **Perfil/subagente:** `ai-data-remediation-engineer` (Agency Agents / Engineering) — aplicado inline
- **Motivo:** recorte envolve identidade de Deals, vínculos Deal→Company e Deal→Contact, constraint de banco, recovery sem create adicional e integridade de mappings — exige ambiente executor de alta confiança com subagente especializado em remediação de dados

---

## Arquivos criados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/lib/hubspotIngestTypes.ts` | Tipo | `HubspotIdentityMappingEntityType` estendido com `'deal'` |
| `src/lib/server/hubspotIdentityMappingService.ts` | Serviço | `readEntityType` reconhece `'deal'` |
| `src/lib/server/hubspotCleanReloadDealCreateService.ts` | Serviço | Create limpo de Deals + mappings + associações + `preflightOnly` |
| `src/lib/server/hubspotCleanReloadDealRecoveryService.ts` | Serviço | Recovery: insert de mappings + associações para Deals já criados |
| `src/app/api/account-connectors/hubspot/clean-reload/create-deals/route.ts` | Rota | POST protegida com `preflightOnly` e gate de idempotência |
| `src/app/api/account-connectors/hubspot/clean-reload/recover-deal-mappings/route.ts` | Rota | POST protegida para recovery de mappings e associações |
| `docs/98-operacao/66-hubspot-clean-reload-deal-create.md` | Doc | Este documento |

---

## Contrato da rota create-deals

**Endpoint:** `POST /api/account-connectors/hubspot/clean-reload/create-deals`

### Campos obrigatórios (create real)

| Campo | Tipo | Descrição |
|---|---|---|
| `confirmCreateDeals` | `true` | Gate explícito — obrigatório quando `preflightOnly` não for `true` |
| `batchId` | string | Identificador do lote de importação |
| `tenantId` | string | Identificador do tenant Canopi |

### Campos opcionais

| Campo | Tipo | Descrição |
|---|---|---|
| `preflightOnly` | boolean | Executa validações completas e retorna diagnóstico sem nenhuma escrita |
| `contractVersion` | string | Padrão: `c2.9e.2d.14` |
| `resumeMode` | boolean | Ignora Deals já mapeados e cria somente os faltantes |

### Chaves bloqueadas no payload

`token`, `contacts`, `companies`, `products`, `services`, `reset`, `delete`, `upsert`, `applyAll`

### Respostas

| Código | Condição |
|---|---|
| 400 | Payload inválido, chave bloqueada, confirmação ausente (sem preflightOnly), batchId/tenantId ausentes |
| 200 | Execução concluída (com ou sem blockers no body) |
| 422 | Erro interno não tratado |

---

## Contrato da rota recover-deal-mappings

**Endpoint:** `POST /api/account-connectors/hubspot/clean-reload/recover-deal-mappings`

### Campos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `confirmRecoverDealMappings` | `true` | Gate explícito |
| `batchId` | string | Identificador do lote |
| `tenantId` | string | Identificador do tenant |
| `knownDealMappings` | array | Lista de `{ canonicalId, hsObjectId }` dos Deals já criados |

### Chaves bloqueadas

`token`, `contacts`, `companies`, `deals`, `products`, `services`, `reset`, `delete`, `upsert`, `applyAll`

---

## Incidente: execução antecipada do create real

### O que aconteceu

Na primeira chamada bem-sucedida com token válido, o payload incluía `confirmCreateDeals: true` com intenção de preflight. O serviço, ao não encontrar bloqueadores ativos (nenhum deal mapping existia, propriedades recém-criadas, contact count seguro), avançou para o create real e criou os 27 Deals no HubSpot.

### Causa raiz

O serviço não possuía modo preflight-only separado. A única proteção era a avaliação de bloqueadores — quando todos passavam, o create era executado imediatamente.

### Impacto

- 27 Deals criados no HubSpot com todas as propriedades corretas
- 0 mappings persistidos (falha em cascade por constraint do banco)
- 0 associações criadas

### Constraint do Supabase

A tabela `hubspot_identity_mappings` tinha CHECK constraint aceitando apenas `('account', 'contact')`. O valor `'deal'` foi rejeitado para todos os 27 inserts. A constraint foi ajustada manualmente no Supabase SQL Editor:

```sql
ALTER TABLE hubspot_identity_mappings
  DROP CONSTRAINT hubspot_identity_mappings_entity_type_check;

ALTER TABLE hubspot_identity_mappings
  ADD CONSTRAINT hubspot_identity_mappings_entity_type_check
  CHECK (entity_type IN ('account', 'contact', 'deal'));
```

### Recovery executado

Após ajuste da constraint, o recovery foi executado via `POST /recover-deal-mappings` com os 27 pares `canonicalId → hsObjectId` conhecidos — sem nenhum create adicional no HubSpot.

### Correção do serviço

Após o recovery, o serviço foi corrigido com `preflightOnly: true` real: o gate foi inserido no serviço (não apenas na rota) imediatamente após a avaliação de bloqueadores, tornando estruturalmente impossível qualquer escrita quando `preflightOnly=true`.

---

## Preflight executado (via preflightOnly=true pós-correção)

| Verificação | Resultado |
|---|---|
| `registryValid` | `true` |
| `dealBlockingPropertiesReady` | `true` |
| `dealBlockingMissing` | `[]` |
| `dealPropertiesCreated` (no setup) | 10 propriedades |
| `hubspotContactTotal` | **993** |
| `contactCountSafe` | `true` |
| `existingCompanyMappings` | **247** |
| `existingContactMappings` | **305** |
| `existingDealMappings` | **27** (pós-recovery) |
| `validDeals` | **27** |
| `blockedDeals` | **0** |
| `expectedCompanyAssociations` | **27** |
| `expectedContactAssociations` | **80** |

---

## Propriedades de Deal criadas no HubSpot (setup)

| Propriedade | Tipo | hasUniqueValue | Bloqueadora |
|---|---|---|---|
| `canopi_canonical_id` | string/text | `true` | ✅ |
| `canopi_opportunity_id` | string/text | `true` | ✅ |
| `canopi_tenant_id` | string/text | `false` | ✅ |
| `canopi_associated_company_id` | string/text | `false` | — |
| `canopi_import_batch_id` | string/text | `false` | — |
| `canopi_contract_version` | string/text | `false` | — |
| `canopi_sync_status` | enumeration/select | `false` | — |
| `canopi_last_sync_at` | string/text | `false` | — |
| `canopi_source` | string/text | `false` | — |
| `canopi_stage_canonical` | string/text | `false` | — |

---

## Resumo do create real + recovery

| Métrica | Valor |
|---|---|
| **Deals tentados** | **27** |
| **Deals criados no HubSpot** | **27** |
| **Deals com falha** | **0** |
| **Mappings inseridos (recovery)** | **27** |
| **Mappings com falha** | **0** |
| **Associações Deal → Company** | **27/27** |
| **Associações Deal → Contact** | **80/80** |
| **Associações com falha** | **0** |
| **Contacts HubSpot (antes/depois)** | **993 / 993** |
| **canProceedToNextRecorte** | **true** |
| **Blockers** | **[]** |
| **Warnings** | **[]** |

---

## Parâmetros de execução

| Parâmetro | Valor |
|---|---|
| `batchId` (create) | `canopi-clean-reload-deals-2026-05-18` |
| `batchId` (recovery) | `canopi-clean-reload-deals-2026-05-18` |
| `tenantId` | `canopi-local-validation-tenant` |
| `contractVersion` | `c2.9e.2d.14` |
| `executedAt` | `2026-05-19` |

---

## Campos enviados ao HubSpot por Deal

| Campo | Origem |
|---|---|
| `dealname` | `oportunidades.nome` |
| `amount` | `oportunidades.valor` (string, omitido se null) |
| `canopi_canonical_id` | `oportunidades.id` (UUID) |
| `canopi_opportunity_id` | `cpdo_${FNV-1a(canonicalId)}` |
| `canopi_tenant_id` | `tenantId` do payload |
| `canopi_associated_company_id` | `canonical_id` da account associada |
| `canopi_import_batch_id` | `batchId` do payload |
| `canopi_contract_version` | `c2.9e.2d.14` |
| `canopi_sync_status` | `pending` |
| `canopi_source` | `canopi_clean_reload` |
| `canopi_last_sync_at` | ISO 8601 da execução |
| `canopi_stage_canonical` | `oportunidades.etapa` (omitido se null) |

Nota: `dealstage`, `pipeline` e `closedate` não existem no schema `oportunidades` atual — omitidos por design.

---

## Resolução da cadeia account_slug

```
oportunidades.account_slug → accounts.slug → accounts.id (UUID)
  → hubspot_identity_mappings (entity_type=account) → companyHubspotId
```

---

## Associações criadas

### Deal → Company
- **API:** `POST /crm/v4/associations/deals/companies/batch/create`
- **Tipo:** `HUBSPOT_DEFINED`, `associationTypeId: 5`
- **Resultado:** 27/27 ✅

### Deal → Contact
- **API:** `POST /crm/v4/associations/deals/contacts/batch/create`
- **Tipo:** `HUBSPOT_DEFINED`, `associationTypeId: 3`
- **Resolução:** `contacts.accountId` → contacts por account → contact mappings ativos → contactHubspotIds
- **Resultado:** 80/80 ✅

---

## Mapping persistido em hubspot_identity_mappings

| Campo | Valor |
|---|---|
| `provider` | `hubspot` |
| `entity_type` | `deal` |
| `canonical_id` | `oportunidades.id` |
| `canopi_external_id` | `cpdo_...` (FNV-1a do canonicalId) |
| `hubspot_id` | `hs_object_id` real retornado pelo HubSpot |
| `status` | `active` |
| `metadata_json.batchId` | `canopi-clean-reload-deals-2026-05-18` |
| `metadata_json.tenantId` | `canopi-local-validation-tenant` |
| `metadata_json.contractVersion` | `c2.9e.2d.14` |
| `metadata_json.source` | `canopi_clean_reload` |
| `metadata_json.recoveryMode` | `true` |
| `metadata_json.associatedCompanyCanonicalId` | `canonical_id` da account no Supabase |
| `metadata_json.associatedCompanyHubspotId` | `hs_object_id` da Company no HubSpot |

---

## Idempotência confirmada

Chamada com `confirmCreateDeals: true` pós-recovery retornou:
- `blockers: ["27 mapping(s) ativo(s) de Deal já existem. Use resumeMode=true para criar somente os não mapeados."]`
- `results.created: 0`
- `canProceedToNextRecorte: false`

**Idempotência intacta — nenhum Deal duplicado.**

---

## preflightOnly confirmado

Chamada com `preflightOnly: true` retornou:
- `results_created: 0`
- Diagnóstico completo (registry, properties, contact count, mappings, candidatos)
- `guardrails: ["preflightOnly=true: nenhum Deal criado.", ...]`
- HubSpot e Supabase intactos

---

## Guardrails confirmados

- Nenhum Contact criado ✅
- Nenhuma Company criada ✅
- Nenhum Product criado ✅
- Nenhum Service criado ✅
- Nenhum reset ou delete executado ✅
- Nenhum hs_object_id histórico reutilizado ✅
- Deals associados somente às 247 Companies operacionais novas via mapping ativo ✅
- Deals associados somente a Contacts com mapping ativo (`entity_type=contact`) ✅
- Nenhuma escrita em `accounts`, `contacts` ou `oportunidades` no Supabase ✅
- Contacts HubSpot permaneceram em 993 ✅ (abaixo do limite de 1000)
- Token não exposto na resposta ✅
- Recovery executado sem nenhum create adicional no HubSpot ✅

---

## Confirmações finais

| Item | Valor |
|---|---|
| Contacts criados neste recorte | **0** |
| Companies criadas neste recorte | **0** |
| Products/Services criados | **0** |
| Escrita em `accounts` (Supabase) | **0** |
| Escrita em `contacts` (Supabase) | **0** |
| Escrita em `oportunidades` (Supabase) | **0** |

---

## Próximo recorte recomendado

**C2.9E.2D.15 — Enriquecimento ou validação visual dos Deals no HubSpot**, ou recorte de associação de Products/Services se prioritário.

Pré-condições satisfeitas:
- 247 Companies novas no HubSpot com identity completa ✅
- 305 Contacts novos no HubSpot com identity completa ✅
- 27 Deals novos no HubSpot com identity completa ✅
- 305 associações Contact → Company criadas ✅
- 27 associações Deal → Company criadas ✅
- 80 associações Deal → Contact criadas ✅
- 27 mappings `entity_type=deal` ativos e íntegros ✅
- `canProceedToNextRecorte: true` ✅
