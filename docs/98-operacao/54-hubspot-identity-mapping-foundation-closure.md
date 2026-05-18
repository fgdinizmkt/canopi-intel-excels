# HubSpot identity mapping foundation — fechamento operacional

## Status
- Fundação estrutural do mapeamento de identidade HubSpot ↔ Canopi implementada, publicada e validada manualmente no Supabase.
- Nenhum apply real foi executado.
- Nenhuma RPC foi chamada.
- A frente ainda não popula mappings nem adapta snapshot, preflight ou RPC para consumo do crosswalk.

## Commit
- `3193a5e` — `feat(settings): add HubSpot identity mapping foundation`

## Objetivo do recorte
- Criar a base estrutural para resolver identidade HubSpot ↔ Canopi antes de qualquer nova tentativa de apply real.
- Preparar um crosswalk persistido entre identidade externa do HubSpot e identidade canônica da Canopi.

## Causa raiz que motivou a fundação
- O snapshot de execução estava usando `canopiId` externo do HubSpot, derivado de writeback, como se fosse chave canônica local.
- Isso não bate com `accounts.id` nem `contacts.id` e bloqueou o apply por ausência de correspondência canônica.
- O preflight anterior também precisava bloquear a ausência de match canônico, não tratá-la como `ready_to_apply`.

## Diferença entre identidade externa e identidade canônica
- `canopi_external_id` representa o identificador externo do writeback:
  - `cpco_*` para Companies;
  - `cpct_*` para Contacts.
- `canonical_id` representa o ID real da Canopi:
  - `accounts.id`;
  - `contacts.id`.
- O apply futuro precisa operar sobre `canonical_id`, não sobre o ID externo cru.

## Tabela criada
- `public.hubspot_identity_mappings`
- Campos principais:
  - `provider`
  - `entity_type`
  - `canonical_id`
  - `canopi_external_id`
  - `hubspot_id`
  - `source_connection_id`
  - `source_fingerprint`
  - `status`
  - `metadata_json`
  - `created_at`
  - `updated_at`

## RLS e políticas
- RLS habilitado.
- `service_role` pode gerenciar a tabela.
- `anon` e `authenticated` estão bloqueados.
- O recorte não cria escrita automática nem backfill.

## Validação real no Supabase
- Migration aplicada manualmente no Supabase SQL Editor.
- Resultado: `Success. No rows returned`.
- Confirmações:
  - tabela existe;
  - `rls_enabled = true`;
  - `policies_count = 3`;
  - `mappings_count = 0`.

## Limites explícitos deste recorte
- Não houve backfill.
- Não houve apply.
- Não houve RPC.
- Não houve alteração canônica.
- Snapshot, preflight e RPC ainda não foram adaptados para usar o mapping.
- Não houve gravação de mappings na tabela nova.

## Próximo recorte recomendado
- Popular ou recuperar mappings de identidade de forma segura.
- Regenerar snapshot com `canonicalId` resolvido.
- Endurecer o preflight para bloquear qualquer record sem match canônico.
- Adaptar a RPC para usar `canonicalId`.
