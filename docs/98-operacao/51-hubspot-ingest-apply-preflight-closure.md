# HubSpot ingest apply preflight — fechamento técnico

## Status
- Rota de preflight de apply idempotente implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional real concluída com sucesso.
- Nenhum dado canônico foi persistido.

## Commit
- `95d37cc` — `feat(settings): add HubSpot ingest apply preflight`

## Escopo entregue
- rota `POST /api/account-connectors/hubspot/ingest/execute/apply/preflight`;
- service server-side `hubspotIngestApplyPreflightService.ts`;
- tipos atualizados em `hubspotIngestTypes.ts`;
- leitura do contrato salvo por `contractId`;
- leitura do snapshot salvo em `execution_summary`;
- validação de `approvedPlanHash` e `idempotencyKey`;
- comparação do snapshot com a base Canopi atual;
- retorno auditável com `summary`, `conflicts`, `blockers`, `warnings`, `guardrails` e `nextStep`;
- sem escrita em `accounts`, `contacts` ou `hubspot_ingest_contracts`.

## Fora de escopo
- apply real/persistência canônica;
- upsert em `accounts`;
- upsert em `contacts`;
- writeback HubSpot;
- novo contrato de ingestão;
- HubSpot novamente consultado;
- Salesforce;
- RD Station CRM;
- Outro CRM;
- UI.

## Validação funcional real
- contrato usado: `d673e0d5-7a9c-4c01-bd64-a74e6f2bda12`;
- `approvedPlanHash` usado: `5f4dda77bbeed3f04d4b801cc663eebe6ae76a9778eb1ddb18124fe187163258`;
- `idempotencyKey` de teste: `11111111-1111-4111-8111-111111111111`;
- `HTTP 200` no cenário positivo;
- `status=ready`;
- `mode=apply_preflight`;
- `provider=hubspot`;
- `canApply=false`;
- `wouldPersist=false`;
- resposta sem chave `token`;
- `summary.accounts`: `418` planned, `348` readyToApply, `0` review, `0` blocked, `0` skip;
- `summary.contacts`: `738` planned, `736` readyToApply, `0` review, `0` blocked, `0` skip;
- `nextStep=apply_real_requires_transactional_boundary`;
- `hubspot_ingest_contracts`: `3 -> 3`;
- `accounts`: `250 -> 250`;
- `contacts`: `305 -> 305`.

## Testes negativos aprovados
- payload com `token` bloqueado;
- payload com `companies` bloqueado;
- payload com `contacts` bloqueado;
- payload com `records` bloqueado;
- payload com `mode` bloqueado;
- payload com `apply` bloqueado;
- payload vazio bloqueado;
- `contractId` vazio bloqueado;
- `approvedPlanHash` vazio bloqueado;
- `approvedPlanHash` divergente bloqueado;
- `idempotencyKey` vazio bloqueado;
- `contractId` inexistente bloqueado;
- todos com `canApply=false`;
- todos com `wouldPersist=false`;
- todos sem chave `token` na resposta.

## Guardrails confirmados
- aceitar apenas `{ "contractId": "...", "approvedPlanHash": "...", "idempotencyKey": "..." }`;
- bloquear payload com token, records, companies, contacts, mode ou apply;
- ler contrato e snapshot apenas no servidor;
- bloquear contrato inexistente;
- bloquear provider diferente de `hubspot`;
- bloquear status diferente de `ready`;
- bloquear contrato sem snapshot planejado válido;
- bloquear `approvedPlanHash` divergente;
- bloquear `idempotencyKey` ausente, vazio ou inválida;
- bloquear ambiguidades sem resolução explícita;
- bloquear tentativa de create neste recorte;
- não escrever em tabelas canônicas;
- não persistir segredo em resposta ou log;
- manter `canApply=false` neste recorte.

## Próximo passo
- abrir `C2.9E.2B.2B.2` para o apply real transacional usando snapshot aprovado e preflight validado.
