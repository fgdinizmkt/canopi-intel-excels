# HubSpot identity mapping recovery dry-run — fechamento operacional

## Status
- Dry-run de recuperação de mappings de identidade HubSpot ↔ Canopi implementado, validado funcionalmente em leitura pura e fechado operacionalmente.
- Nenhuma escrita foi feita.
- Nenhum apply foi executado.
- Nenhuma RPC foi chamada.
- A frente ainda não popula mappings, não adapta snapshot, não altera preflight e não altera a RPC.

## Commit
- `ed53cc0` — `feat(settings): add HubSpot identity mapping recovery dry-run`

## Objetivo do recorte
- Criar um dry-run somente leitura para avaliar, com o contrato real, quais registros do snapshot podem ser vinculados com segurança aos IDs canônicos da Canopi.
- Separar recuperação exata de tentativa heurística para impedir promoção indevida de identidade.

## Por que o dry-run foi necessário
- O snapshot usa `canopiId` externo vindo do HubSpot (`cpco_*` / `cpct_*`) como identidade operacional de planejamento.
- Esses IDs não correspondem diretamente a `accounts.id` nem `contacts.id`.
- A RPC anterior bloqueou corretamente o apply real por ausência de vínculo canônico.
- O dry-run foi necessário para medir recuperabilidade real antes de qualquer novo ajuste de snapshot, preflight ou RPC.

## Regra de classificação
- Heurística nunca promove um registro para `resolved_exact`.
- Recuperação exata exige crosswalk persistido ou `canonical_id` direto.
- Contacts sem `anchorCanonicalId` resolvido entram como `unresolved`.
- `missing_required_fields` fica reservado para ausência real de campos mínimos do próprio contato.

## Classificações usadas
- `resolved_exact`
- `unresolved`
- `ambiguous`
- `unsafe`
- `missing_required_fields`

## Resultado real do contrato validado
- Contrato usado: `d673e0d5-7a9c-4c01-bd64-a74e6f2bda12`
- `status: success`
- `mode: identity_mapping_recovery_dry_run`
- `snapshot.version: c2.9e.2b.2a`
- `snapshot.mode: execution_plan_snapshot`
- `snapshot.status: planned`

## Contagens observadas
- `accounts`: `total=348`, `resolvedExact=0`, `unresolved=348`, `ambiguous=0`, `unsafe=0`, `missingRequiredFields=0`
- `contacts`: `total=736`, `resolvedExact=0`, `unresolved=736`, `ambiguous=0`, `unsafe=0`, `missingRequiredFields=0`

## Contagens pós-validação
- `hubspot_identity_mappings = 0`
- `hubspot_ingest_contracts = 3`
- `accounts = 250`
- `contacts = 305`

## Correção semântica aplicada
- Contacts sem account anchor resolvido passaram a ser classificados como `unresolved`.
- `missing_required_fields` ficou restrito a ausência real de campos mínimos do contato.
- `matchSource` passou a diferenciar corretamente:
  - `direct_canonical_id`
  - `identity_mapping_canopi_external_id`
  - `identity_mapping_hubspot_id`

## Limites explícitos deste recorte
- Não popula mappings.
- Não altera snapshot.
- Não altera preflight.
- Não altera RPC.
- Não executa apply.
- Não escreve em `accounts`, `contacts`, `hubspot_ingest_contracts` ou `hubspot_identity_mappings`.

## Próximo recorte recomendado
- Recuperar e popular mappings de forma controlada.
- Validar os mappings persistidos.
- Regenerar snapshot com `canonicalId`.
- Endurecer o preflight para bloquear qualquer registro sem match canônico.
- Adaptar a RPC para operar sobre `canonicalId`.
