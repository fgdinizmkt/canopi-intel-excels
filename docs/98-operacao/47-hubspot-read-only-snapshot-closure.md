# HubSpot read-only CRM snapshot — fechamento operacional

> **Status:** Snapshot read-only implementado e validado funcionalmente. A UI ficou viável para seguir sem novo refinamento visual nesta etapa.

## Estado fechado

- HubSpot conectado/desconectado muda o display corretamente.
- Companies / Contas validados no HubSpot: `418`.
- Contacts / Contatos validados no HubSpot: `738`.
- Contacts Canopi identificados no snapshot: `736`.
- Pendência futura registrada: `2` Contacts sem `canopi_contact_id`.
- O snapshot diferencia total HubSpot, registros Canopi e amostra de associações.

## Escopo entregue

- leitura read-only de inventário HubSpot;
- total HubSpot separado de registros Canopi;
- Companies;
- Contacts;
- Deals / Opportunities com estado de escopo;
- Leads com estado de escopo;
- Campanhas com estado de escopo;
- catálogo de propriedades;
- associações em modo amostral;
- diagnóstico visual compacto no card superior.

## Decisões importantes

- não perseguir `798` para Contacts;
- não usar List API como correção deste recorte;
- Contacts total bate com o HubSpot em `738`;
- a diferença real é de `2` Contacts sem `canopi_contact_id`;
- esses 2 registros entram como backlog futuro de backfill/resolução de identidade.

## Fora de escopo

- writeback;
- enriquecimento;
- persistência canônica HubSpot -> Canopi;
- resolução dos 2 Contacts;
- RD Station CRM;
- Salesforce.

## Validações

- `git diff --check`;
- `npm run lint`;
- `npx tsc --noEmit`;
- validação visual/funcional pelo Fábio.

## Próximos passos

- registrar o backlog futuro dos 2 Contacts sem `canopi_contact_id`;
- abrir inventário real / ingestão canônica HubSpot em recorte futuro;
- depois tratar enriquecimento;
- manter RD Station CRM postergado até fechamento formal HubSpot ou decisão explícita.
