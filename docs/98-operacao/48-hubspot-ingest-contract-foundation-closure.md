# HubSpot ingest contract foundation — fechamento técnico operacional

## Status
- Fundação técnica implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional real concluída com sucesso.

## Commit
- `b6c9d4a` — `feat(settings): add HubSpot ingest contract foundation`

## Escopo entregue
- migration `hubspot_ingest_contracts`;
- tipos `hubspotIngestTypes.ts`;
- service server-side `hubspotIngestContractService.ts`;
- rota `/api/account-connectors/hubspot/ingest/contracts`;
- `POST` para criar contrato;
- `GET` para listar e ler contrato;
- dry-run summary;
- representação de Companies + Contacts;
- representação de unresolved Contacts sem `canopi_contact_id`;
- sem ingestão real.

## Fora de escopo
- execução canônica;
- upsert em `accounts`;
- upsert em `contacts`;
- Deals/Opps;
- enriquecimento;
- UI;
- writeback;
- Salesforce;
- RD Station CRM;
- Outro CRM.

## Validações
- `git diff --check`;
- `npm run lint`;
- `npx tsc --noEmit`;
- reexecução do contrato real com `POST` e token HubSpot seguro no ambiente;
- `GET` por `id` retornando `200` e `sameContract=true`;
- verificação de que o token não foi persistido nem retornado (`responseHasToken=false`);
- conferência de que `hubspot_ingest_contracts` passou de `2` para `3` registros;
- conferência de que `accounts` permaneceu em `250`;
- conferência de que `contacts` permaneceu em `305`;
- dry-run validado com Companies HubSpot `418`, Companies Canopi/tagged `348`, Companies fora da Canopi `70`, Contacts HubSpot `738`, Contacts Canopi/tagged `736` e `2` Contacts sem `canopi_contact_id`.

## Pendências
- registrar `C2.9E.2B` como próximo recorte canônico baseado no contrato salvo;
- manter Deals, Leads, Campaigns, Properties e Associações fora do primeiro recorte;
- preservar o guardrail de não executar novo `POST` ou nova ingestão sem aprovação explícita.
