# HubSpot ingest contract foundation — fechamento técnico operacional

## Status
- Fundação técnica implementada, commitada e publicada.
- Validação estática aprovada.
- Validação funcional real pendente.

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
- validação funcional real não executada por falta de Supabase local configurado e token HubSpot seguro no ambiente.

## Pendências
- aplicar e validar a migration em ambiente seguro;
- criar contrato real via `POST` com token seguro;
- validar `GET` list e `GET ?id=`;
- confirmar que token não é salvo nem retornado;
- confirmar que `accounts` e `contacts` não sofrem alteração;
- abrir `C2.9E.2B` somente depois disso.
