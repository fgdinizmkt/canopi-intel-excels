# HubSpot ingest apply RPC foundation — fechamento técnico

## Status
- Fundação SQL/RPC transacional para o apply real implementada, commitada e publicada.
- Validação estática aprovada.
- Validação manual no Supabase SQL Editor concluída com sucesso.
- Nenhum apply real foi executado.

## Commit
- `f00ac0a` — `feat(settings): add HubSpot ingest apply RPC foundation`

## Escopo entregue
- migration `supabase/migrations/20260514183000_hubspot_ingest_apply_rpc.sql`;
- helper SQL `public.hubspot_ingest_apply_build_result(...)`;
- RPC transacional `public.apply_hubspot_ingest_contract(contract_id, approved_plan_hash, idempotency_key)`;
- service server-side `src/lib/server/hubspotIngestApplyRpcService.ts`;
- tipos atualizados em `src/lib/hubspotIngestTypes.ts`;
- travamento transacional com `SELECT ... FOR UPDATE` e `pg_advisory_xact_lock(...)`;
- validação do contrato salvo, snapshot aprovado e `approvedPlanHash` antes de qualquer escrita;
- apply update-only com patch esparso para `accounts` e `contacts`;
- retorno auditável com `status`, `summary`, `countsBefore`, `countsAfter`, `sourceSnapshot`, `blockers` e `warnings`;
- preservação de `sourceSnapshot` no `execution_summary` final;
- atualização de `hubspot_ingest_contracts.status` para `executed` apenas em sucesso total.

## Fora de escopo
- execução da RPC;
- apply real;
- upsert em `accounts`;
- upsert em `contacts`;
- writeback HubSpot;
- novo contrato de ingestão;
- Salesforce;
- RD Station CRM;
- Outro CRM;
- UI.

## Validação manual no Supabase SQL Editor
- migration colada manualmente no Supabase SQL Editor;
- resultado: `Success. No rows returned`;
- RPC criada/atualizada com sucesso;
- RPC não foi chamada;
- nenhum apply real foi executado;
- nenhuma alteração em `accounts`, `contacts` ou `hubspot_ingest_contracts` foi feita pelo usuário.

## Validação estática
- `git diff --check` OK;
- `npm run lint` OK;
- `npx tsc --noEmit` OK.

## Guardrails confirmados
- aceitar apenas `contract_id`, `approved_plan_hash` e `idempotency_key`;
- bloquear payload com token, records, companies, contacts, mode ou apply;
- bloquear contrato inexistente;
- bloquear provider diferente de `hubspot`;
- bloquear status diferente de `ready`;
- bloquear contrato sem snapshot planejado válido;
- bloquear `approvedPlanHash` divergente;
- bloquear `idempotencyKey` ausente, vazio ou inválida;
- bloquear ambiguidades sem resolução explícita;
- bloquear tentativa de create neste recorte;
- não alterar `contacts.id` como campo mutável;
- não persistir segredo em resposta ou log.

## Próximo passo
- abrir a auditoria da rota de apply real que chamará a RPC, sem executar apply automaticamente.
