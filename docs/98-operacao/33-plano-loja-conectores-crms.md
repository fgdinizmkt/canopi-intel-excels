# Plano Operacional — Loja de Conectores e CRMs

## 1) Estado atual
- `main` limpa e sincronizada no ponto de partida desta frente.
- Patch local anterior descartado com `git restore`.
- Fontes e Conectores permanece na arquitetura antiga.
- `AccountSources.tsx` concentra responsabilidades em excesso.

## 2) Problema estrutural
- Mistura no mesmo fluxo: loja de conectores, seleção de método, CSV, token, schema, mapping e validação local.
- CSV aparece como fluxo global, fora da página dedicada de cada CRM.
- Estado antigo e estados concorrentes podem confundir a experiência.
- Fica difícil validar um CRM isoladamente ponta a ponta.
- A página atual fica longa, frágil e com responsabilidades demais.

## 3) Decisão de produto
- CSV deixa de existir como conector solto/global.
- CSV passa a ser método de entrada dentro de cada CRM/conector.
- Fontes e Conectores vira loja/vitrine de conectores.
- Cada CRM/conector terá página dedicada.
- Salesforce será a primeira trilha de implementação e validação, sem limitar o plano ao Salesforce.

## 4) Arquitetura-alvo
- Rota loja:
  - `/configuracoes/objetos/contas/fontes-conectores`
- Rotas dedicadas por conector:
  - `/configuracoes/objetos/contas/fontes-conectores/salesforce`
  - `/configuracoes/objetos/contas/fontes-conectores/hubspot`
  - `/configuracoes/objetos/contas/fontes-conectores/rd-station-crm`
  - `/configuracoes/objetos/contas/fontes-conectores/pipedrive`
  - `/configuracoes/objetos/contas/fontes-conectores/clickup`
  - `/configuracoes/objetos/contas/fontes-conectores/outro-crm`

## 5) Loja de conectores
Cards previstos:
- Salesforce
- HubSpot
- RD Station CRM
- Pipedrive
- ClickUp
- Outro CRM

Cada card deve exibir:
- status;
- maturidade;
- métodos disponíveis;
- objetos suportados;
- última configuração;
- lacunas;
- CTA para configurar.

Regra de arquitetura da loja:
- A loja não renderiza fluxo inline de configuração.
- Toda configuração ocorre na rota dedicada de cada conector.

## 6) Modelo comum de página dedicada por conector
Cada conector deve conter:
- cabeçalho do conector;
- status da integração;
- métodos disponíveis;
- objetos suportados;
- configuração do método escolhido;
- descoberta ou ingestão de schema;
- preview;
- contrato local da fonte;
- validação;
- próximos passos.

## 7) Métodos por conector
### Salesforce
- OAuth / Connected App;
- Token temporário;
- CSV exportado do Salesforce;
- Bulk API 2.0 (futuro).

### HubSpot
- OAuth;
- Private App token;
- CSV exportado do HubSpot (futuro, se fizer sentido).

### RD Station CRM
- Token/API conforme disponibilidade real;
- OAuth/API RD Station Marketing separado quando aplicável;
- CSV exportado (futuro, se fizer sentido).

### Pipedrive
- OAuth;
- API token;
- CSV exportado (futuro, se fizer sentido).

### ClickUp
- OAuth;
- Personal token;
- CSV/export (futuro, se fizer sentido).

### Outro CRM
- API token;
- OAuth quando aplicável;
- CSV exportado;
- configuração manual.

## 8) Primeira trilha de execução: Salesforce
Escopo de execução inicial:
- criar página dedicada do Salesforce;
- mostrar métodos disponíveis;
- implementar primeiro o método de token temporário;
- implementar depois CSV exportado do Salesforce;
- implementar placeholders de OAuth e Bulk API;
- validar hard refresh;
- validar alternância de método;
- validar que nenhum fluxo aparece na loja;
- validar que estado antigo não vaza para o novo fluxo.

Regra de progressão:
- Não avançar para outro CRM antes de Salesforce estar testado e aprovado.

## 9) Trilhas futuras
- HubSpot;
- RD Station CRM;
- Pipedrive;
- ClickUp;
- Outro CRM.

## 10) Escopo por camada
### O que fica dentro de cada página de CRM
- método da fonte;
- credenciais temporárias;
- upload CSV da fonte específica;
- descoberta/preview de schema da fonte;
- contrato local da fonte;
- validação da fonte;
- status da fonte.

### O que continua global
- identidade e dedupe;
- camada canônica;
- classificação ABM/ABX;
- writeback;
- upload/LGPD global;
- governança;
- validação/publicação.

## 11) Ordem de implementação
- Fase 0: documentação e plano.
- Fase 1: loja de conectores sem fluxos inline.
- Fase 2: rota dedicada Salesforce.
- Fase 3: método token temporário Salesforce.
- Fase 4: método CSV exportado Salesforce.
- Fase 5: placeholders OAuth e Bulk API Salesforce.
- Fase 6: validação Salesforce completa.
- Fase 7: documentação de fechamento Salesforce.
- Fase 8: iniciar próximo CRM.

## 12) Gates de aprovação
- Nenhum commit de produto sem validação visual.
- `lint` e `build:safe` obrigatórios.
- Hard refresh obrigatório em cada rota afetada.
- Loja não pode renderizar fluxo inline.
- CSV não pode aparecer como conector global.
- Salesforce deve ser aprovado antes de outro CRM.
- Codex audita diff/build/runtime/Git antes de commit/push.

## 13) Status do plano
| Fase | Status | Próxima ação | Gate |
|---|---|---|---|
| Fase 0 | em andamento | Consolidar e aprovar este plano operacional | Aprovação explícita do Fábio para iniciar implementação |
| Fase 1 | pendente | Desenhar loja de conectores sem fluxos inline | Loja sem fluxo inline e validação visual |
| Fase 2 | pendente | Criar rota dedicada Salesforce | Navegação e isolamento de estado por rota |
| Fase 3 | pendente | Implementar token temporário Salesforce | Teste local validado e hard refresh ok |
| Fase 4 | pendente | Implementar CSV exportado Salesforce | CSV restrito à página Salesforce |
| Fase 5 | pendente | Inserir placeholders OAuth/Bulk API | Sinalização clara de escopo futuro |
| Fase 6 | pendente | Executar validação ponta a ponta Salesforce | Fluxo estável, sem vazamento de estado antigo |
| Fase 7 | pendente | Registrar fechamento Salesforce na operação | Evidência técnica + visual + operacional |
| Fase 8 | pendente | Abrir trilha do próximo CRM | Salesforce aprovado formalmente |

## 14) Regras operacionais
- ChatGPT orquestra e define corte de escopo.
- Codex audita Git/diff/build/status e pode documentar com aprovação.
- Claude Code implementa somente com escopo fechado.
- Antigravity entra para refinamento visual.
- Nenhum agente pode commitar/pushar sem autorização explícita do Fábio.
