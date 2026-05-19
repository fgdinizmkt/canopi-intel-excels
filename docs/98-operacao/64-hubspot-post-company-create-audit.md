# HubSpot — Auditoria Pós-Create de Companies — C2.9E.2D.12B

> **Status:** auditoria executada em 2026-05-18. Somente leitura. Nenhuma escrita, delete, archive, update ou reset executado.

## Ambiente executor e perfil

- **Ambiente executor:** Claude Code / Sonnet 4.6
- **Perfil/subagente:** `ai-data-remediation-engineer` (Agency Agents / engineering) — aplicado inline
- **Motivo:** auditoria de identidade, detecção de duplicidades, diagnóstico de integridade de dados — leitura pura sem orquestração paralela necessária

---

## E. Totais auditados no HubSpot

| Métrica | Total |
|---|---|
| **Total de Companies no HubSpot** | **665** |
| Com `canopi_canonical_id` (base nova) | 247 |
| Com `canopi_company_id` | 595 |
| Com `canopi_tenant_id` | 247 |
| Com `canopi_import_batch_id` | 595 |
| Com `canopi_contract_version` | 247 |
| Com `canopi_sync_status` | 247 |
| Com `canopi_source` | 595 |
| Com `canopi_last_sync_at` | 595 |

---

## F. Separação entre histórico e base nova

| Grupo | Total | Critério |
|---|---|---|
| **Base operacional nova** | **247** | `canopi_canonical_id` presente — criadas em C2.9E.2D.12A |
| **Histórico antigo** | **348** | `canopi_company_id` presente, `canopi_canonical_id` ausente — population pack C2.9D.2 |
| **Fora do padrão Canopi** | **70** | Sem `canopi_company_id` — registros externos/manuais sem rastreabilidade Canopi |
| **Total** | **665** | — |

**Conclusão:** O HubSpot convive com duas bases explicitamente distintas. A separação é limpa e detectável via `canopi_canonical_id`.

---

## G. Duplicidades encontradas

### Entre base nova e histórico

| Critério | Conflitos |
|---|---|
| `domain` em comum (nova × histórico) | **0** |
| `name` normalizado em comum (nova × histórico) | **0** |
| `canopi_company_id` em comum (nova × histórico) | **0** |

**Conclusão: nenhuma duplicidade real entre a base nova e o histórico.** As duas bases são universos completamente distintos de registros.

### Internamente na base nova (247 companies)

| Critério | Quantidade |
|---|---|
| Grupos com mesmo `name` normalizado | **89 grupos / 225 registros** |
| Duplicidade real (mesmo `canopi_company_id`) | **0** |
| Duplicidade visual (mesmo nome, domínio diferente) | **89 grupos** |

**Causa confirmada:** dado sintético proveniente do C4.17.1 (Salesforce synthetic dataset generator). O mesmo "nome de empresa" foi gerado com múltiplos domínios variantes — ex:
- `soma campaignheavy 4` → `*.example.com`, `*.salesforce.test`, `*.com.br`

Cada variante tem `canopi_company_id` único (hash de nome+domínio), portanto são registros distintos no HubSpot. **Não são duplicatas operacionais — são artefatos do dataset sintético.**

---

## H. Auditoria dos 247 mappings

| Métrica | Valor |
|---|---|
| Total de mappings `entity_type=account` | **247** |
| Status `active` | **247** |
| `hs_object_id` presente e confirmado no HubSpot | **247** |
| `canonical_id` válido (UUID) | **247** |
| Mappings órfãos (canonical sem hs_object_id) | **0** |
| Mappings sem Company correspondente no HubSpot | **0** |

**Conclusão:** 247/247 mappings íntegros. Nenhum mapping órfão. Todos os `hs_object_id` confirmados existentes no HubSpot.

---

## I. Campos populados nas 247 Companies novas

Todos os 247 registros apresentam exatamente o mesmo conjunto de campos preenchidos:

| Campo | Valor | Tipo |
|---|---|---|
| `name` | nome da account Canopi | identidade |
| `domain` | domínio sanitizado (ou omitido se inválido) | identidade |
| `canopi_canonical_id` | UUID de `accounts.id` | identidade bloqueadora |
| `canopi_company_id` | `cpco_${hash}` | identidade bloqueadora |
| `canopi_tenant_id` | `canopi-local-validation-tenant` | identidade bloqueadora |
| `canopi_import_batch_id` | `canopi-clean-reload-2026-05-18` | controle operacional |
| `canopi_contract_version` | `c2.9e.2d.12` | controle operacional |
| `canopi_sync_status` | `pending` | controle operacional |
| `canopi_source` | `canopi_clean_reload` | controle operacional |
| `canopi_last_sync_at` | ISO 8601 da criação | controle operacional |
| `hs_object_id` | ID HubSpot capturado | HubSpot nativo |
| `createdate` | data de criação HubSpot | HubSpot nativo |

**Natureza da carga:** puramente identidade + controle. Nenhum enriquecimento real.

---

## J. Campos estratégicos ainda faltantes

| Campo HubSpot | Relevância | Status |
|---|---|---|
| `industry` | segmentação ABM/ICP | **vazio** |
| `city` / `country` | geo-segmentação | **vazio** |
| `phone` | contato operacional | **vazio** |
| `numberofemployees` | sizing para ICP | **vazio** |
| `annualrevenue` | sizing para ICP | **vazio** |
| `description` | contexto narrativo | **vazio** |
| `linkedin_company_page` | enrichment LinkedIn | **vazio** |
| `canopi_icp_tier` | classificação ICP Canopi | **vazio** |
| `canopi_abm_tier` | segmentação ABM Canopi | **vazio** |
| `canopi_segment` | segmento de mercado | **vazio** |

---

## K. As 247 companies são novas ou atualização das antigas?

**São 100% novas.** Nenhuma das 247 Companies novas tem `hs_object_id` em comum com as 348 históricas. As duas bases coexistem sem sobreposição de registros no HubSpot.

---

## L. Recomendação objetiva antes de Contacts

### Opção A — Seguir para Contacts (C2.9E.2D.13) imediatamente
- **Prós:** mantém o momentum do clean reload; a base de identidade está pronta
- **Contras:** os dados sintéticos das Companies (89 grupos de nomes duplicados) vão se propagar nos Contacts e nos vínculos Contact → Company; o HubSpot operacional ficará com duas bases convivendo sem separação visual

### Opção B — Enriquecer Companies antes de Contacts
- **Prós:** Companies com campos reais (industry, geo, employees) dão mais valor ao vínculo Contact → Company; enriquecimento via GooseWorks é possível agora
- **Contras:** enriquecimento de 247 Companies pode bloquear semanas; dados sintéticos tornam o enriquecimento inútil para as empresas de teste
- **Viável:** sim, mas recomendado somente após resolver a questão dos dados sintéticos

### Opção C — Separar histórico de operacional no HubSpot
- **Prós:** visibilidade clara no HubSpot entre "o que é Canopi-operacional" e "o que é histórico"; reduz risco de confusão operacional
- **Contras:** requer intervenção manual ou rota de archive/tag no HubSpot — fora do escopo do clean reload atual
- **Recomendação:** implementar via propriedade `canopi_data_tier` ou similar em recorte separado

### Opção D — Criar estado/tela de separação entre histórico e operacional
- **Prós:** visibilidade na plataforma Canopi; operador sabe o que cada base representa
- **Contras:** requer UI e lógica de leitura diferenciada
- **Timing:** relevante em fase posterior

### **Recomendação objetiva:**

> **Avançar para Contacts (Opção A) com consciência dos riscos documentados.** A base nova está tecnicamente pronta: 247 mappings íntegros, identidade completa, `canProceedToContactCreate: true`. Os dados sintéticos são artefatos conhecidos do dataset de teste — não impedem a validação técnica do fluxo de Contacts. O enriquecimento e a separação visual do histórico são recortes posteriores.

---

## M. Riscos se avançarmos agora

| Risco | Severidade | Observação |
|---|---|---|
| Contacts vinculados a Companies sintéticas | Baixa | Dado de teste, ambiente de validação |
| 89 grupos de nomes duplicados no HubSpot | Baixa | Artefato sintético, não impacta fluxo técnico |
| 348 Companies históricas coexistindo sem tag visual | Média | Confusão operacional futura se o HubSpot for usado por humanos |
| 70 Companies sem rastreabilidade Canopi | Baixa | Registros externos, não afetam o clean reload |
| `canopi_sync_status` em `pending` para todas | Baixa | Esperado — atualização para `active` é recorte futuro |
| Enriquecimento aplicado antes de dados reais | Média | Não enriquecer Companies sintéticas — aguardar dados reais |

---

## N. Confirmação de guardrails

- Nenhum create executado ✅
- Nenhum delete executado ✅
- Nenhum archive executado ✅
- Nenhum reset executado ✅
- Nenhum update no HubSpot executado ✅
- Nenhum mapping criado ou alterado ✅
- Nenhuma escrita em Supabase ✅
- Nenhuma alteração de UI ✅
- Salesforce não reaberto ✅
- RD Station não tocado ✅
- Somente leitura via HubSpot Search API e preflight de auditoria ✅

---

## Próximo recorte recomendado

**C2.9E.2D.13 — Create limpo de Contacts + captura de `hs_object_id` + persistência de mappings + associação Contact → Company**

Pré-condições satisfeitas:
- 247 Companies novas no HubSpot com identidade completa ✅
- 247 mappings `entity_type=account` ativos e íntegros ✅
- `canProceedToContactCreate: true` ✅
- Separação clara entre base nova e histórico ✅
