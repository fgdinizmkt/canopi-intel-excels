# Plano Operacional — Loja de Conectores e CRMs

## 1) Estado atual
- `main` local em `b64f4da` (ahead em relação a `origin/main`), pendente de validação final no browser, push e sync Google Drive.
- Salesforce 2C.1, 2C.2 e 2C.3 foram fechados na trilha dedicada (metadados read-only + preparação local CSV + OAuth produtivo).
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
- OAuth / External Client App;
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

Estado consolidado desta trilha:
- Salesforce 2C.1 fechado em `d2afafa`.
- Salesforce 2C.2 fechado em `46fae8f`.
- Salesforce 2C.3 fechado em `bc3dd69`.
- Salesforce C3.0 fechado localmente em `61f2799` com preview read-only de Accounts via OAuth.
- Salesforce C3.1 fechado localmente em `e407cbc` com seleção controlada de Accounts para pré-sync read-only.
- Salesforce C3.2 fechado localmente em `8bf34c2` com contrato local de pré-sync read-only de Accounts.
- Salesforce C3.3 fechado localmente em `d665137` com dry-run read-only local de Accounts.
- Salesforce C4.0 fechado localmente em `d8bbe2f` com preview read-only multi-entidade (Account, Contact, Opportunity, Lead, Campaign).
- Marco atual: **Salesforce Setup Read-only fechado operacionalmente**.
- A página dedicada cobre: metadados read-only (token temporário), preparação local de CSV exportado, conexão OAuth produtiva com persistência segura, preview read-only de Accounts via OAuth, seleção controlada local para pré-sync read-only, contrato local de pré-sync read-only, dry-run read-only local de Accounts e preview read-only multi-entidade com discovery read-only e tabelas por entidade.
- **Salesforce ainda não é conector produtivo completo.** Sem sync real, sem Bulk API, sem writeback real e sem importação real.
- Persistência de mapeamento pré-sync: pendente (recorte próprio futuro).
- Próximo passo natural: recorte posterior de preparação para sync read-only multi-entidade Salesforce; depois marcos de Sync Read-only, Mapping persistente, Bulk API, Writeback seguro, Test Data Pack e Connector completo.
- O escopo continua sendo uma trilha CRM por CRM; os fechamentos 2C.1–2C.4 não equivalem a conector produtivo completo.

Regra de progressão:
- Não avançar para outro CRM antes de Salesforce estar testado e aprovado.

## 9) Trilhas futuras
- HubSpot;
- RD Station CRM;
- Pipedrive;
- ClickUp;
- Outro CRM.

## 9.1) Frente futura (pós-configurações): Base de Teste Completa por CRM
**Não iniciar agora.** Esta frente só entra depois de todas as configurações de CRMs estarem fechadas.

Objetivo:
Criar bases fictícias, robustas e controladas por CRM (começando por Salesforce) para alimentar o CRM de origem e validar se a Canopi consegue **ler, interpretar, relacionar e organizar** os dados corretamente antes de qualquer sync real.

Entregáveis previstos (por CRM):
- CSVs por entidade;
- ordem correta de importação (quando aplicável);
- dicionário de campos (origem → significado);
- regras de vínculo entre entidades;
- cenários bons e ruins (dados sujos, duplicidade, campos ausentes, vínculos inválidos);
- checklist do que a Canopi deve ler (fatos);
- checklist do que a Canopi deve inferir (hipóteses explícitas);
- critérios para declarar “pronto para sync real” (read-only controlado primeiro).

Salesforce Test Data Pack v1 (previsto):
- Accounts, Contacts, Opportunities, Leads, Campaigns;
- Campaign Members (se aplicável no modelo);
- Tasks/Activities (se fizer sentido para validar histórico, ações e follow-up).

Guardrails desta frente:
- não substitui as configurações dos conectores;
- não antecipa sync real;
- não antecipa writeback.

## 9.2) Próximos marcos Salesforce (pós Setup Read-only)
- Salesforce Preparação para sync read-only multi-entidade
- Salesforce Sync Read-only
- Salesforce Mapping persistente
- Salesforce Bulk API
- Salesforce Writeback seguro
- Salesforce Test Data Pack
- Salesforce Connector completo

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

## Decisão arquitetural — CRM local + Canopi global
### 1. Problema identificado
- O fluxo atual ainda parte de Configurações > Objetos & CRM > Entidades > Conta > Fontes e Conectores.
- Isso faz parecer que a fonte/CRM pertence à entidade Conta.
- A arquitetura correta deve colocar a Loja de Conectores antes da configuração detalhada das entidades.
- Conta, Contato, Oportunidade e Campanha são destinos canônicos e também podem aparecer como objetos mapeados de cada CRM.

### 2. Decisão conceitual
- A Loja de Conectores passa a ser a entrada primária para CRMs/fontes.
- Cada CRM terá uma página dedicada.
- Dentro de cada CRM ficam as configurações locais daquela fonte:
  - conexão;
  - método de entrada;
  - objetos disponíveis;
  - mapping da fonte para Canopi;
  - matching/dedupe aplicado à fonte;
  - pipeline local;
  - writeback local;
  - governança local;
  - validação local.
- A Canopi mantém uma camada global separada para consolidar regras entre fontes:
  - modelo canônico;
  - dedupe global entre fontes;
  - survivorship;
  - pipeline consolidado;
  - writeback global;
  - governança global;
  - publicação/auditoria.

### 3. Writeback
- Writeback não é só global nem só local.
- Existe writeback global, que define política:
  - quais campos podem voltar;
  - quais campos são bloqueados;
  - se pode criar/atualizar registros;
  - se pode sobrescrever dados;
  - aprovação/manual vs automático;
  - regras de segurança e auditoria.
- Existe writeback local por CRM, que define execução:
  - como Salesforce recebe dados;
  - como HubSpot recebe dados;
  - como Pipedrive recebe dados;
  - quais objetos/campos recebem retorno;
  - quais permissões/tokens são necessários;
  - quais limitações técnicas existem em cada conector.

### 4. Caminho-alvo de navegação
Registrar o caminho recomendado:

Configurações
→ Objetos & CRM
→ Hub de CRM e Dados
→ Loja de Conectores
→ CRM selecionado, por exemplo Salesforce
→ Conexão
→ Objetos
→ Mapping
→ Matching local
→ Pipeline local
→ Writeback local
→ Governança local
→ Validação local

E, em paralelo no Hub de CRM e Dados:

Hub de CRM e Dados
→ Camada Canônica Global
→ Modelo Conta/Contato/Oportunidade/Campanha
→ Dedupe global entre fontes
→ Survivorship
→ Pipeline consolidado
→ Writeback global
→ Governança global
→ Publicação/Auditoria

### 5. O que NÃO fazer na Fase 1
- Não reorganizar todo o hub agora.
- Não mover entidades agora.
- Não reestruturar rotas globais agora.
- Não misturar esse redesenho com o commit da loja, exceto pela documentação.
- Fechar Fase 1 como loja funcional com logos.
- Abrir fase posterior para redesenhar Hub de CRM e Dados.

### 6. Próxima fase sugerida
Fase 1B — Redesenho do Hub de CRM e Dados

Objetivo:
Reposicionar a Loja de Conectores como entrada primária e separar claramente:
- configuração local por CRM;
- camada canônica global da Canopi.

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
| Fase 0 | concluída | Manter a memória operacional sincronizada | Aprovação explícita do Fábio consolidada |
| Fase 1 | concluída | Loja funcional com logos publicada | Loja sem fluxo inline e validação visual |
| Fase 2 | concluída | Rota dedicada Salesforce consolidada | Navegação e isolamento de estado por rota |
| Fase 3 | concluída | Token temporário Salesforce implementado e validado | Teste local validado e hard refresh ok |
| Fase 4 | concluída | CSV exportado Salesforce implementado na página dedicada | CSV restrito à página Salesforce |
| Fase 5 | concluída (2C.3) | OAuth Salesforce produtivo publicado | Persistência segura + validação visual + lint/build:safe |
| Fase 6 | em andamento | Executar validação ponta a ponta Salesforce | Fluxo estável, sem vazamento de estado antigo |
| Fase 7 | concluída (2C.2) | Fechamento operacional de Salesforce 2C.2 registrado | Evidência técnica + visual + operacional |
| Fase 8 | pendente | Abrir trilha do próximo CRM | Salesforce aprovado formalmente |

## 15) Memória operacional e espelho externo
- A atualização da memória operacional deve ser refletida no repositório local, em `origin/main` e na pasta oficial do Google Drive do projeto.
- Quando o ambiente não tiver acesso direto ao Google Drive, o bloco canônico deve ser preparado para aplicação manual ou por ferramenta conectada, sem fingir sincronização.

## 14) Princípio Transversal — Classificação de Conectores por Natureza Operacional

**Não classificar conectores apenas pelo nome da ferramenta.**

Cada conector deve ser mapeado pela **natureza operacional** (CRM, infraestrutura, mensuração, mídia, automação, dados técnicos), não apenas pelo nome. Salesforce, por exemplo, oferece múltiplas naturezas: CRM (Accounts, Leads) + infraestrutura (My Domain, Experience Cloud) + dados técnicos (metadados, permissões).

**Decisão documentada em:** `docs/98-operacao/02-decisoes-arquiteturais.md` — Decisão 19

**Implicação para Loja de CRMs:** Esta frente cobre natureza "CRM / Dados". Frente futura "Canais e Infraestrutura" cobrirá as demais naturezas (domínios, tracking, publicação).

---

## 15) Regras operacionais
- ChatGPT orquestra e define corte de escopo.
- Codex audita Git/diff/build/status e pode documentar com aprovação.
- Claude Code implementa somente com escopo fechado.
- Antigravity entra para refinamento visual.
- Nenhum agente pode commitar/pushar sem autorização explícita do Fábio.
