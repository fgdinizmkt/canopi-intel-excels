# HubSpot ingest execution plan snapshot — fechamento técnico

## Status
- Rota de materialização de snapshot de execução implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional real concluída com sucesso.
- Snapshot persistido apenas em `execution_summary`.

## Commit
- `6b19b38` — `feat(settings): add HubSpot ingest execution plan snapshot`

## Escopo entregue
- rota `POST /api/account-connectors/hubspot/ingest/execute/plan`;
- service server-side `hubspotIngestExecutionPlanService.ts`;
- helper `updateHubspotIngestContractExecutionSummary`;
- tipos atualizados em `hubspotIngestTypes.ts`;
- materialização de plano por registro para Companies e Contacts canônicos;
- cálculo de `planHash` determinístico;
- persistência somente em `hubspot_ingest_contracts.execution_summary`;
- retorno auditável com `planned`, `records`, `unresolved`, `outOfScope`, `guardrails`, `blockers` e `warnings`.

## Fora de escopo
- apply/persistência canônica;
- upsert em `accounts`;
- upsert em `contacts`;
- writeback HubSpot;
- novo contrato de ingestão;
- Salesforce;
- RD Station CRM;
- Outro CRM;
- UI.

## Validação funcional real
- contrato usado: `d673e0d5-7a9c-4c01-bd64-a74e6f2bda12`;
- `HTTP 200` no cenário positivo;
- `status=planned`;
- `mode=execution_plan_snapshot`;
- `provider=hubspot`;
- `canPersist=false`;
- `persisted=false`;
- `canonicalPersisted=false`;
- `planHash=5f4dda77bbeed3f04d4b801cc663eebe6ae76a9778eb1ddb18124fe187163258`;
- `execution_summary` salvo no contrato;
- `contract_json` permaneceu em `c2.9e.2a`;
- contrato permaneceu `ready`;
- resposta sem chave `token`;
- `hubspot_ingest_contracts`: `3 -> 3`;
- `accounts`: `250 -> 250`;
- `contacts`: `305 -> 305`;
- plano retornado para `accounts`: `418` total, `348` update, `70` review;
- plano retornado para `contacts`: `738` total, `736` update, `2` review.

## Testes negativos aprovados
- payload com `token` bloqueado;
- payload com `companies` bloqueado;
- payload com `contacts` bloqueado;
- payload com `records` bloqueado;
- payload com `mode` bloqueado;
- payload vazio bloqueado;
- `contractId` vazio bloqueado;
- `contractId` inexistente bloqueado;
- todos com `canPersist=false`;
- todos sem chave `token` na resposta.

## Guardrails confirmados
- aceitar apenas `{ "contractId": "..." }`;
- bloquear payload com token, records, companies, contacts ou mode;
- ler contrato apenas no servidor;
- bloquear contrato inexistente;
- bloquear provider diferente de `hubspot`;
- bloquear status diferente de `ready`;
- bloquear execução fora do recorte canônico;
- bloquear ambiguidades sem resolução explícita;
- não escrever em tabelas canônicas;
- persistir somente `execution_summary`;
- não alterar `contract_json` nem `status`;
- não persistir segredo em resposta ou log;
- manter o snapshot antes de qualquer apply futuro.

## Próximo passo
- abrir `C2.9E.2B.2B` para a etapa de apply/persistência futura com idempotência e `approvedPlanHash`.
