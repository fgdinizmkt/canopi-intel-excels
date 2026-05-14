# HubSpot ingest execution dry-run — fechamento técnico

## Status
- Rota de dry-run de execução canônica implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional real concluída com sucesso.
- Nenhum dado canônico foi persistido.

## Commit
- `93491cf` — `feat(settings): add HubSpot ingest execution dry-run`

## Escopo entregue
- rota `POST /api/account-connectors/hubspot/ingest/execute`;
- service server-side `hubspotIngestExecuteService.ts`;
- tipos atualizados em `hubspotIngestTypes.ts`;
- leitura canônica de contrato salvo por `contractId`;
- plano de dry-run auditável para `accounts` e `contacts`;
- bloqueio explícito de payload proibido;
- retorno determinístico com `blockers`, `warnings`, `plan`, `outOfScope`, `unresolved`, `guardrails` e `summary`;
- sem escrita em `accounts`, `contacts` ou `hubspot_ingest_contracts`.

## Fora de escopo
- ingestão real;
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
- `status=success`;
- `mode=dry_run`;
- `provider=hubspot`;
- `canPersist=false`;
- `summary.persisted=false`;
- `summary.dryRunOnly=true`;
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
- payload vazio bloqueado;
- `contractId` vazio bloqueado;
- `contractId` inexistente bloqueado;
- todos com `canPersist=false`;
- todos sem chave `token` na resposta.

## Guardrails confirmados
- aceitar apenas `{ "contractId": "..." }`;
- bloquear payload com token, records, companies ou contacts;
- ler contrato apenas no servidor;
- bloquear contrato inexistente;
- bloquear provider diferente de `hubspot`;
- bloquear status diferente de `ready`;
- bloquear execução fora do recorte canônico;
- bloquear ambiguidades sem resolução explícita;
- não escrever em tabelas canônicas;
- não persistir segredo em resposta ou log;
- manter dry-run antes de qualquer persistência futura.

## Próximo passo
- abrir `C2.9E.2B.2` para a etapa de apply/persistência futura com idempotência e `execution_summary`.
