# HubSpot ingest protected apply route — fechamento técnico

## Status
- Rota protegida de apply real implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional limitada a cenários negativos concluída com sucesso.
- Nenhum apply real foi executado.

## Commit
- `535f8ca` — `feat(settings): add protected HubSpot ingest apply route`

## Escopo entregue
- rota `POST /api/account-connectors/hubspot/ingest/execute/apply`;
- validação server-side de payload antes de qualquer chamada à RPC;
- aceitação exclusiva de `contractId`, `approvedPlanHash` e `idempotencyKey`;
- validação de `contractId` como UUID;
- validação de `approvedPlanHash` como SHA-256 hexadecimal de 64 caracteres;
- validação de `idempotencyKey` como UUID;
- rejeição de payload vazio, array, campos extras e chaves proibidas;
- chamada exclusiva ao service server-side `applyHubspotIngestContractViaRpc(...)`;
- trava operacional server-side via `CANOPI_ENABLE_HUBSPOT_INGEST_APPLY=true`;
- retorno `403` com `status=blocked` e `canPersist=false` quando a flag está desligada;
- sem escrita direta em `accounts`, `contacts` ou `hubspot_ingest_contracts`.

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

## Validação funcional limitada
- payload vazio bloqueado com `HTTP 400`;
- payload array bloqueado com `HTTP 400`;
- `contractId` vazio e inválido bloqueados com `HTTP 400`;
- `approvedPlanHash` vazio e inválido bloqueados com `HTTP 400`;
- `idempotencyKey` vazio e inválido bloqueados com `HTTP 400`;
- payload com `token` bloqueado com `HTTP 400`;
- payload com `records` bloqueado com `HTTP 400`;
- payload com `companies` bloqueado com `HTTP 400`;
- payload com `contacts` bloqueado com `HTTP 400`;
- payload com `mode` bloqueado com `HTTP 400`;
- payload com `apply` bloqueado com `HTTP 400`;
- payload formalmente válido com flag desligada retornou `HTTP 403`;
- respostas negativas com `status=blocked`, `canPersist=false` e sem chave `token`;
- nenhuma RPC foi chamada;
- nenhum apply real foi executado;
- nenhuma alteração em `accounts`, `contacts` ou `hubspot_ingest_contracts`.

## Guardrails confirmados
- payload bruto, token, records, companies, contacts, mode e apply são rejeitados;
- a rota nunca consulta HubSpot;
- a rota nunca escreve diretamente em accounts ou contacts;
- a única escrita permitida permanece dentro da RPC transacional, e apenas quando a flag operacional estiver explicitamente habilitada;
- resposta não expõe token, secrets, payload bruto ou `.env.local`.

## Próximo passo
- auditoria e execução controlada do apply real com `CANOPI_ENABLE_HUBSPOT_INGEST_APPLY=true` apenas em sessão explicitamente aprovada.
