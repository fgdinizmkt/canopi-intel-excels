# HubSpot Property Registry — C2.9E.2D.9

> **Status:** implementado e publicado. Nenhuma propriedade real foi criada no HubSpot.

## Identificação do recorte

- **Nome:** C2.9E.2D.9 — Property registry formal da nova carga limpa HubSpot
- **Contrato de referência:** `c2.9e.2d.8` (plano mínimo C2.9E.2D.8)
- **Arquivo criado:** `src/lib/hubspotPropertyRegistry.ts`

## Objetivo

Formalizar em código o contrato de propriedades HubSpot da Canopi para Company, Contact, Deal e Product/Service, de forma que:

- qualquer carga futura possa validar o próprio payload contra a registry antes de enviar;
- qualquer enriquecimento possa verificar se a propriedade está registrada antes de exportar;
- qualquer sync possa usar os metadados (direção, regra de conflito, blocking) como guardrail automático;
- o setup existente (`hubspotWritebackSetup.ts`) tenha uma referência canônica para migração futura.

## Por que a registry era necessária

O código anterior tinha listas parciais de propriedades apenas para Company e Contact, sem:

- cobertura de Deal e Product;
- campo de `canonical_id` por entidade;
- campo de `tenant_id`;
- regras formais de conflito;
- direção de fluxo;
- distinção entre blocking e não-blocking;
- entidades de enriquecimento (ICP tier, segment, buying committee, etc.).

A registry fecha esse gap antes de qualquer nova carga limpa.

## Entidades cobertas

| Entidade HubSpot | Tipo interno | Propriedades registradas |
|---|---|---|
| Company | `company` | 11 |
| Contact | `contact` | 13 |
| Deal/Opportunity | `deal` | 10 |
| Product/Service | `product` | 9 |
| **Total** | | **43** |

> **Service** não é uma entidade separada no HubSpot. Serviços são tratados como Product com `canopi_product_type = 'service'`.

## Propriedades obrigatórias por entidade

As propriedades abaixo são obrigatórias (`required: true`) e compõem o núcleo de identidade e rastreabilidade:

### Company
| Propriedade HubSpot | Blocking | Descrição |
|---|---|---|
| `canopi_canonical_id` | **Sim** | UUID canônico da account na Canopi |
| `canopi_company_id` | **Sim** | ID externo hash-based; único no HubSpot |
| `canopi_tenant_id` | **Sim** | Tenant da instalação Canopi |
| `canopi_import_batch_id` | Não | Identificador do lote de carga |
| `canopi_contract_version` | Não | Versão do contrato para auditoria |

### Contact
| Propriedade HubSpot | Blocking | Descrição |
|---|---|---|
| `canopi_canonical_id` | **Sim** | UUID canônico do contact na Canopi |
| `canopi_contact_id` | **Sim** | ID externo hash-based; único no HubSpot |
| `canopi_tenant_id` | **Sim** | Tenant da instalação Canopi |
| `canopi_associated_company_id` | Não | ID Canopi da company âncora |
| `canopi_import_batch_id` | Não | Identificador do lote de carga |
| `canopi_contract_version` | Não | Versão do contrato para auditoria |

### Deal
| Propriedade HubSpot | Blocking | Descrição |
|---|---|---|
| `canopi_canonical_id` | **Sim** | UUID canônico da oportunidade na Canopi |
| `canopi_opportunity_id` | **Sim** | ID externo; único no HubSpot |
| `canopi_tenant_id` | **Sim** | Tenant da instalação Canopi |
| `canopi_import_batch_id` | Não | Identificador do lote de carga |
| `canopi_contract_version` | Não | Versão do contrato para auditoria |

### Product
| Propriedade HubSpot | Blocking | Descrição |
|---|---|---|
| `canopi_canonical_id` | **Sim** | UUID canônico do produto/serviço na Canopi |
| `canopi_product_id` | **Sim** | ID externo; único no HubSpot |
| `canopi_tenant_id` | **Sim** | Tenant da instalação Canopi |
| `canopi_import_batch_id` | Não | Identificador do lote de carga |
| `canopi_contract_version` | Não | Versão do contrato para auditoria |

## Propriedades de enriquecimento inicial

Não são obrigatórias para a carga limpa, mas estão registradas para uso futuro:

### Company
- `canopi_icp_tier` — nível ICP (tier_1, tier_2, tier_3, out_of_icp)
- `canopi_segment` — segmento de mercado
- `canopi_account_score` — score quantitativo

### Contact
- `canopi_contact_role` — papel funcional (decision_maker, influencer, champion, blocker, end_user, technical, unknown)
- `canopi_engagement_score` — score de engajamento
- `canopi_buying_committee_role` — papel no buying committee

### Deal
- `canopi_stage_canonical` — estágio canônico no modelo Canopi
- `canopi_forecast_category` — categoria de forecast (pipeline, best_case, commit, closed_won, omitted)
- `canopi_opportunity_score` — score quantitativo

### Product
- `canopi_product_type` — tipo (product, service, addon, license)
- `canopi_solution_family` — família de solução

## Regras bloqueadoras formalizadas

A registry distingue:

- `blocking: true` — a ausência ou divergência desta propriedade bloqueia qualquer operação de carga ou sync.
- `conflictRule: 'block_on_diverge'` — se a propriedade já existe no HubSpot com valor diferente, bloquear antes de qualquer update.
- `canopiOwned: true` — a Canopi é a dona do campo; edições manuais no HubSpot são sobrescritas.
- `canReturnFromHubSpot: false` — o valor desta propriedade nunca volta do HubSpot para a Canopi como fonte de verdade.

Propriedades com `direction: 'bidirectional'` e `canReturnFromHubSpot: true` (ex: `canopi_sync_status`) podem ser atualizadas pelo HubSpot e refletidas de volta.

## Helpers disponíveis

```ts
import {
  getHubspotPropertiesByEntity,
  getBlockingHubspotProperties,
  getRequiredHubspotProperties,
  isRegisteredHubspotProperty,
  validateHubspotPropertyRegistry,
} from '@/src/lib/hubspotPropertyRegistry';

// Listar todas as propriedades de uma entidade
getHubspotPropertiesByEntity('company');

// Listar apenas as bloqueadoras
getBlockingHubspotProperties('contact');

// Listar apenas as obrigatórias
getRequiredHubspotProperties('deal');

// Verificar se uma propriedade HubSpot está registrada
isRegisteredHubspotProperty('product', 'canopi_product_id'); // true

// Validar se a registry está completa
validateHubspotPropertyRegistry();
// → { valid: true, totalProperties: 43, missingBlocking: [], warnings: [] }
```

## Relação com o setup existente

O `hubspotWritebackSetup.ts` contém as arrays `HUBSPOT_WRITEBACK_COMPANY_PROPERTIES` e `HUBSPOT_WRITEBACK_CONTACT_PROPERTIES`, que foram usadas no writeback histórico para criar propriedades reais no HubSpot.

A nova registry (`hubspotPropertyRegistry.ts`) é a fonte de verdade para a nova carga limpa. A migração do setup para usar a registry como fonte é um passo futuro — não foi feito neste recorte para não alterar o comportamento de escrita existente.

## O que ainda não foi executado

- Nenhuma propriedade real foi criada no HubSpot.
- Nenhuma carga limpa foi enviada.
- Nenhuma migração do setup existente foi feita.
- Nenhuma chamada à API HubSpot foi feita.
- Nenhuma escrita em Supabase foi feita.
- Nenhum mapping foi criado.
- Nenhum reset foi executado.

## Como esta registry prepara o dry-run da nova carga limpa

O próximo recorte (C2.9E.2D.10) poderá usar:

1. `getRequiredHubspotProperties('company')` para validar o payload de cada account antes de enviar.
2. `getBlockingHubspotProperties('company')` para bloquear a carga se alguma propriedade identidade estiver ausente.
3. `isRegisteredHubspotProperty('company', name)` para garantir que nenhuma propriedade não registrada seja enviada.
4. `validateHubspotPropertyRegistry()` como checagem de sanidade no início do dry-run.

## Ressalva operacional explícita

> **Nenhuma propriedade real foi criada no HubSpot neste recorte.**
> A registry define o contrato, não executa a criação.
> A criação real de propriedades no HubSpot é responsabilidade do recorte de setup da nova carga limpa, que depende de autorização explícita do operador.

## Próximo recorte recomendado

**C2.9E.2D.10 — Dry-run de nova carga limpa Canopi → HubSpot**

- Congelar snapshot dos 250 accounts e 305 contacts atuais.
- Validar cada entidade contra `getRequiredHubspotProperties`.
- Gerar plano de `create` (não `upsert`) com `planHash`.
- Retornar sem escrever.
- Só depois: setup de propriedades → create real → captura de `hs_object_id` → persistência de mappings.
