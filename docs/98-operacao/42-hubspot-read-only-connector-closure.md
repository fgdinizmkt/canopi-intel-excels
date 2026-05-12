# HubSpot Read-Only Connector Surface — C2.9B

> **Status corrigido em 2026-05-12:**
> C2.9B está **implementado e publicado**, mas **pendente de validação funcional com credencial real**.
> O commit técnico pode permanecer — o escopo é read-only e seguro.
> O recorte **não deve ser tratado como fechado operacionalmente** até que a validação funcional seja concluída e registrada.

## Contexto

Este documento registra a publicação técnica e documental do **HubSpot read-only connector surface** (C2.9B) e o checklist de validação funcional pendente.

O commit técnico é `5a3a019` — `feat(settings): add HubSpot read-only connector surface`.

## Status do marco

**C2.9B — HubSpot read-only connector surface**

- Implementação técnica: **publicada** (`5a3a019`)
- Documentação operacional: **publicada** (`404952c`)
- Validação técnica (lint, tsc, flags, diff): **OK**
- Validação visual sem token: **aprovada**
- Validação funcional com token real: **pendente**
- Fechamento operacional final: **pendente**

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

## O que foi realmente validado

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
- Validação visual sem token aprovada pelo usuário (status `Configuração incompleta`, UX correta).
- `git status` pós-commit: working tree limpo.
- Busca por termos proibidos (`supportsIncrementalSync: true`, `supportsWebhooks: true`, `supportsWriteback: true`, `crm.objects.companies.write`): CLEAN para HubSpot.
- Página canônica auditada: nenhum termo proibido presente como promessa atual.
- Card na Loja de Conectores ativo com href correto.
- Rota canônica acessível.
- Redirect legado funcional.

## O que ainda falta validar (checklist funcional)

A validação funcional com credencial real **não foi realizada**. O fechamento operacional final depende de:

1. Abrir a Loja de Conectores e confirmar card HubSpot ativo.
2. Abrir a rota canônica `/configuracoes/objetos/contas/fontes-conectores/hubspot`.
3. Confirmar UX sem token: status `Configuração incompleta`, input com erro, botões bloqueados.
4. Inserir token inválido e confirmar mensagem de erro real do endpoint de validação.
5. Inserir token válido com escopo `crm.objects.companies.read` e confirmar retorno positivo.
6. Rodar "Pré-visualizar empresas" e confirmar quantidade e amostra retornada.
7. Rodar "Analisar campos" e confirmar propriedades retornadas pelo schema discovery.
8. Recarregar a página e confirmar que o token **não** fica persistido.
9. Confirmar que nenhum dado foi gravado na Canopi durante os testes.
10. Confirmar que nenhum dado foi alterado na HubSpot durante os testes.
11. Confirmar mensagens de erro reais (token expirado, escopo insuficiente, conta sem empresas).
12. Registrar evidências manuais (screenshots ou notas).
13. Só então considerar o fechamento operacional concluído.

> O teste deve ser realizado localmente no browser com credencial controlada.
> Não colar tokens em chat ou documentação.

## Riscos e dívidas futuras (não pendências do C2.9B)

- OAuth multiempresa para Private App token persistido com segurança.
- Paginação real de Companies além de preview.
- Rate limits e retry/backoff para chamadas HubSpot.
- Contacts, Deals, Associations e Pipelines.
- Hidratação de estado pós-refresh (se aplicável a futuras versões).
- Documentação futura de escopos mínimos por conector.
- Eventual migração/versionamento de APIs HubSpot.

## Próximo passo

- Executar o checklist de validação funcional acima.
- Registrar o resultado no log de sessões e neste documento.
- Só avançar para RD Station CRM após validação funcional HubSpot concluída ou após decisão formal de postergar.
- Salesforce C4.18C permanece fechado e não deve ser reaberto.
