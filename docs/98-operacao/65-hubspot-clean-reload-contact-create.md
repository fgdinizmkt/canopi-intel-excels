# HubSpot — Create Limpo de Contacts — C2.9E.2D.13

> **Status:** implementado e executado com sucesso em 2026-05-19. 305/305 Contacts criados, associados e mapeados. Durante o preflight/setup, o HubSpot também recebeu as propriedades de metadados `canopi_contract_version` e `canopi_sync_status`.

## Ambiente executor e perfil

- **Ambiente executor:** Claude Code / Sonnet 4.6
- **Perfil/subagente:** `ai-data-remediation-engineer` (Agency Agents / Engineering) — aplicado inline
- **Motivo:** recorte envolve identidade, vínculos Contact → Company, integridade de mappings e risco de associação incorreta — exige ambiente executor de alta confiança com subagente especializado em remediação de dados

---

## Arquivos criados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `src/lib/server/hubspotCleanReloadContactCreateService.ts` | Serviço | Create limpo de Contacts + associação + mappings |
| `src/app/api/account-connectors/hubspot/clean-reload/create-contacts/route.ts` | Rota | POST protegida com payload validation |
| `docs/98-operacao/65-hubspot-clean-reload-contact-create.md` | Doc | Este documento |

---

## Contrato da rota

**Endpoint:** `POST /api/account-connectors/hubspot/clean-reload/create-contacts`

### Campos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `confirmCreateContacts` | `true` | Gate explícito — obrigatório |
| `batchId` | string | Identificador do lote de importação |
| `tenantId` | string | Identificador do tenant Canopi |

### Campos opcionais

| Campo | Tipo | Descrição |
|---|---|---|
| `contractVersion` | string | Padrão: `c2.9e.2d.13` |
| `resumeMode` | boolean | Ignora Contacts já mapeados e cria somente os faltantes |

### Chaves bloqueadas no payload

`token`, `companies`, `deals`, `products`, `services`, `reset`, `delete`, `upsert`, `applyAll`

### Respostas

| Código | Condição |
|---|---|
| 400 | Payload inválido, chave bloqueada, confirmação ausente, batchId/tenantId ausente |
| 200 | Execução concluída (com ou sem blockers no body) |
| 422 | Erro interno não tratado |

---

## Validações negativas executadas

| Teste | Payload | Resposta esperada | Resultado |
|---|---|---|---|
| a | sem `confirmCreateContacts` | `CONFIRM_REQUIRED` 400 | ✅ |
| b | `token` no payload | `BLOCKED_PAYLOAD_KEYS` 400 | ✅ |
| c | sem `batchId` | `BATCH_ID_REQUIRED` 400 | ✅ |
| d | sem `tenantId` | `TENANT_ID_REQUIRED` 400 | ✅ |

---

## Preflight executado

| Verificação | Resultado |
|---|---|
| `registryValid` | `true` |
| `contactBlockingPropertiesReady` | `true` |
| `contactBlockingMissing` | `[]` |
| `contactPropertiesCreated` | `['canopi_contract_version', 'canopi_sync_status']` |
| `contactPropertiesFailed` | `[]` |
| `contactPropertiesAlreadyExist` | 7 propriedades (canopi_canonical_id, canopi_contact_id, canopi_tenant_id, canopi_associated_company_id, canopi_import_batch_id, canopi_last_sync_at, canopi_source) |
| `existingCompanyMappings` | **247** |
| `existingContactMappings` | **0** (primeira execução) |
| `validContacts` | **305** |
| `blockedContacts` | **0** |
| `blockedNoAnchor` | **0** |

---

## Resumo do create real

| Métrica | Valor |
|---|---|
| **Contacts tentados** | **305** |
| **Contacts criados** | **305** |
| **Contacts com falha** | **0** |
| **Associações Contact → Company tentadas** | **305** |
| **Associações Contact → Company criadas** | **305** |
| **Associações com falha** | **0** |
| **Mappings persistidos** | **305** |
| **Mappings com falha** | **0** |
| **Criados sem mapping** | **0** |
| **canProceedToDealCreate** | **true** |
| **Blockers** | **[]** |
| **Warnings** | **[]** |

---

## Parâmetros de execução

| Parâmetro | Valor |
|---|---|
| `batchId` | `canopi-clean-reload-contacts-2026-05-18` |
| `tenantId` | `canopi-local-validation-tenant` |
| `contractVersion` | `c2.9e.2d.13` |
| `resumeMode` | `false` |
| `executedAt` | `2026-05-19T01:44:06.560Z` |

---

## Campos enviados ao HubSpot por Contact

| Campo | Origem |
|---|---|
| `firstname` | Primeira palavra do `nome` |
| `lastname` | Restante do `nome` (vazio se nome único) |
| `jobtitle` | `cargo` da Canopi |
| `canopi_canonical_id` | `contacts.id` (UUID) |
| `canopi_contact_id` | `cpct_${FNV-1a(canonicalId)}` |
| `canopi_tenant_id` | `tenantId` do payload |
| `canopi_associated_company_id` | `canonical_id` da account associada |
| `canopi_import_batch_id` | `batchId` do payload |
| `canopi_contract_version` | `c2.9e.2d.13` |
| `canopi_sync_status` | `pending` |
| `canopi_source` | `canopi_clean_reload` |
| `canopi_last_sync_at` | ISO 8601 da execução |

Nota: email não existe no schema `contacts` atual da Canopi — omitido por design.

---

## Associação Contact → Company

- **API usada:** `POST /crm/v4/associations/contacts/companies/batch/create`
- **Tipo de associação:** `HUBSPOT_DEFINED`, `associationTypeId: 1` (Contact to Company — primária)
- **Etapa:** explicitamente separada do batch create (HubSpot não suporta inline)
- **Guardrail:** somente Companies com mapping ativo (`entity_type=account`, `status=active`) são usadas como destino
- **Resultado:** 305/305 associações criadas com sucesso

---

## Mapping persistido em hubspot_identity_mappings

| Campo | Valor |
|---|---|
| `provider` | `hubspot` |
| `entity_type` | `contact` |
| `canonical_id` | `contacts.id` |
| `canopi_external_id` | `canopi_contact_id` (`cpct_...`) |
| `hubspot_id` | `hs_object_id` real retornado pelo HubSpot |
| `status` | `active` |
| `metadata_json.batchId` | `canopi-clean-reload-contacts-2026-05-18` |
| `metadata_json.tenantId` | `canopi-local-validation-tenant` |
| `metadata_json.contractVersion` | `c2.9e.2d.13` |
| `metadata_json.source` | `canopi_clean_reload` |
| `metadata_json.associatedCompanyCanonicalId` | `canonical_id` da account no Supabase |
| `metadata_json.associatedCompanyHubspotId` | `hs_object_id` da Company no HubSpot |

---

## Idempotência confirmada

Segunda chamada imediata retornou:
- `blockers: ["305 mapping(s) ativo(s) de Contact já existem. Execute um recorte de limpeza antes, ou use resumeMode=true para criar somente os não mapeados."]`
- `results.created: 0`
- `canProceedToDealCreate: false`

**Idempotência intacta — nenhum Contact duplicado.**

---

## resumeMode

Implementado: ao passar `resumeMode: true`, o serviço:
1. Carrega mappings existentes de Contact (`entity_type=contact`, `status=active`)
2. Filtra da lista de candidatos aqueles já mapeados
3. Cria somente os não mapeados
4. Persiste mappings somente dos recém-criados

---

## Guardrails confirmados

- Nenhuma Company criada ✅
- Nenhum Deal criado ✅
- Nenhum Product criado ✅
- Nenhum Service criado ✅
- Nenhum reset ou delete executado ✅
- Nenhum hs_object_id histórico reutilizado ✅
- Contacts associados somente às 247 Companies operacionais novas via mapping ativo ✅
- Nenhuma escrita em `accounts` ou `contacts` no Supabase ✅
- Mapping só persiste para Contacts criados com sucesso neste recorte ✅
- Token não exposto na resposta ✅
- O token exposto no output operacional exigiu rotação manual fora do repo/chat ✅
- Salesforce não reaberto ✅
- RD Station não tocado ✅

---

## Confirmações finais

| Item | Valor |
|---|---|
| Companies criadas neste recorte | **0** |
| Deals criados neste recorte | **0** |
| Products/Services criados neste recorte | **0** |
| Escrita em `accounts` (Supabase) | **0** |
| Escrita em `contacts` (Supabase) | **0** |

> Precisão operacional: a execução não escreveu dados de negócio no HubSpot além do setup de metadados do preflight. As propriedades `canopi_contract_version` e `canopi_sync_status` foram criadas no HubSpot durante o setup, e isso deve ser documentado como metadata setup, não como criação de Companies/Contacts/Deals/Products.

---

## Próximo recorte recomendado

**C2.9E.2D.14 — Create limpo de Deals no HubSpot** (ou recorte de enriquecimento de Companies/Contacts com dados reais, se prioritário).

Pré-condições satisfeitas:
- 247 Companies novas no HubSpot com identity completa ✅
- 305 Contacts novos no HubSpot com identity completa ✅
- 305 associações Contact → Company criadas ✅
- 305 mappings `entity_type=contact` ativos e íntegros ✅
- `canProceedToDealCreate: true` ✅
