# HubSpot Read-Only Connector Closure — C2.9B

## Contexto

Este documento registra o fechamento operacional do **HubSpot read-only connector surface** após validação técnica e visual do escopo C2.9B dentro da frente de padronização de conectores CRM.

O commit técnico é `5a3a019` — `feat(settings): add HubSpot read-only connector surface`.

## Marco fechado

**C2.9B — HubSpot read-only connector surface**

## Escopo entregue

- Card HubSpot ativo na Loja de Conectores, apontando para a rota canônica.
- Rota canônica:
  `/configuracoes/objetos/contas/fontes-conectores/hubspot`
- Redirect legado:
  `/configuracoes/objetos-crm/hubspot` → rota canônica (não cria segunda superfície funcional).
- Validação de Private App token em sessão local (não persiste credencial).
- Preview read-only de empresas (Companies) via HubSpot API.
- Análise de campos e propriedades de empresas (schema discovery).
- UX sem token validada visualmente: status `Configuração incompleta`, mensagem clara, input com erro, botões Pré-visualizar e Analisar bloqueados.
- Badges públicos na UI: Acesso de leitura / Pré-visualização / Análise de campos / Sem gravação.
- Copy de segurança: nenhum dado gravado na Canopi, nenhuma credencial salva, nada alterado na HubSpot.

## Alinhamento técnico do adaptador

- `hubspotAdapter.ts`: `supportsIncrementalSync: false`, `supportsWebhooks: false`, `optionalScopes` sem `crm.objects.companies.write`.
- `contaConnectorsV2.ts`: `supportsWriteback: false`, `writebackTargets: []`, permissões sem write.
- `ConnectorsStore.tsx`: card HubSpot com `ctaEnabled: true` e `ctaHref` correto.

## Escopo explicitamente fora deste recorte

- OAuth
- Persistência de credenciais
- Sync (incremental ou full-load)
- Writeback
- Webhooks
- Incremental sync
- Contacts
- Deals
- Associations
- Pipelines
- Full-load
- Paginação real
- Retry / backoff
- Importação persistente
- Enriquecimento de dados Canopi

## Decisões de produto registradas

- Private App token é aceito apenas como validação provisória, local e manual neste recorte.
- Arquitetura futura multiempresa deve considerar OAuth; HubSpot não deve copiar Salesforce como blueprint.
- HubSpot fica limitado neste recorte a Companies + Properties read-only.
- CSV/upload não é conector CRM peer e não foi promovido como tal.

## Validações realizadas

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
- Validação visual sem token aprovada pelo usuário (Configuração incompleta, UX correta).
- `git status` pós-commit local: working tree limpo.
- Branch `ahead 1` antes do push (commit técnico `5a3a019`).
- Busca por termos proibidos (`supportsIncrementalSync: true`, `supportsWebhooks: true`, `supportsWriteback: true`, `crm.objects.companies.write`) retornou CLEAN para HubSpot.
- Página canônica auditada: nenhum termo proibido presente como promessa atual.

## Riscos e dívidas futuras (não pendências do C2.9B)

- OAuth multiempresa para Private App token persistido com segurança.
- Paginação real de Companies além de preview.
- Rate limits e retry/backoff para chamadas HubSpot.
- Contacts, Deals, Associations e Pipelines.
- Hidratação de estado pós-refresh (se aplicável a futuras versões).
- Documentação futura de escopos mínimos por conector.
- Eventual migração/versionamento de APIs HubSpot.

## Próximo passo recomendado

- Fechar documentação e sincronização operacional do C2.9B (este documento).
- Avançar para o próximo conector CRM planejado conforme sequência da frente C2.9:
  **HubSpot (fechado) → RD Station CRM → Outro CRM / importações orientadas.**
- Antes de qualquer novo incremento HubSpot, usar auditoria oficial e este documento como base.
- Salesforce C4.18C permanece fechado e não deve ser reaberto a partir desta frente.
