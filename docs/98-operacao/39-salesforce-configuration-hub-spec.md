# Especificação UX: Hub de Configuração Operacional Salesforce

## 1. Diagnóstico da Mudança de Direção (Wizard vs. Hub)

A evolução da interface Salesforce na Canopi exigiu uma ruptura com o modelo de "Wizard Técnico" (Passo 1, 2, 3...) em favor de um "Hub de Configuração".

*   **Por que o Wizard deixou de fazer sentido:** O modelo linear pressupõe uma jornada única de setup. Em integrações profissionais, o usuário precisa reconfigurar partes específicas (ex: mudar um filtro, adicionar um campo) sem precisar re-atravessar um funil técnico.
*   **Impacto da Conexão Automática:** Ao remover a barreira de "Conectar" como um passo manual e heróico, a hierarquia da tela muda. A conexão passa a ser um *status* de sistema, e a configuração passa a ser o *protagonismo* do usuário.
*   **Configuração Operacional:** A lógica deixa de ser "Como eu conecto?" para ser "Como eu quero que meus dados do Salesforce se comportem dentro da Canopi?".
*   **O que será reaproveitado:** A lógica de `qualityResolutions`, o mapeamento de entidades (Accounts, Contacts, Opportunities), os esquemas de validação de dados e o motor de dry-run.

## 2. Arquitetura da Nova Tela

A página será composta por blocos modulares que permitem visão 360º da integração:

### A. Cabeçalho e Status Global
*   **Objetivo:** Identificar a integração e saúde geral.
*   **Visual:** Título "Configuração Salesforce", breadcrumbs e badge de status flutuante (ex: "Aguardando Conexão" ou "Conectado").

### B. Autenticação Master
*   **Objetivo:** Gerenciar a ponte de acesso OAuth.
*   **Sistemas:** Mostra o ambiente (Produção/Sandbox) e o status da conta conectada.
*   **Consequência:** Sem autenticação, os blocos de dados exibem estados *disabled* ou *vazios*.

### C. Sincronização de Objetos
*   **Objetivo:** Definir quais entidades participam do fluxo.
*   **Interface:** Toggles para Leads/Contatos, Contas, Oportunidades. Botão para adicionar *Custom Objects*.
*   **Consequência:** Ativar um objeto libera o bloco de mapeamento correspondente.

### D. Escopo e Filtros
*   **Objetivo:** Reduzir ruído e volume de dados importados.
*   **Campos:** Data de corte (ex: Últimos 12 meses) e Query Builder (Filtros condicionais).
*   **Sistemas:** Gera a cláusula WHERE das consultas à API Salesforce.

### E. Identidade e Unicidade
*   **Objetivo:** Evitar duplicação.
*   **Campos:** Seletor de Chave Única (ex: Email, Id) e Regras de Conflito (ex: "Sobrescrever Canopi" vs "Preencher apenas vazios").

### F. Configurações de Fluxo
*   **Objetivo:** Definir o comportamento de escrita e periodicidade.
*   **Opções:** Direção dos dados (Bidirecional ou SF -> Canopi), Modo (Batch ou Real-time), Ação de Deleção.

### G. Mapeamento de Campos
*   **Objetivo:** Unificar a taxonomia de dados.
*   **Interface:** Lista de Campos Canopi <-> Campos Salesforce. Inclui tradução de valores (picklists).

### H. Atividade Recente (Sidebar)
*   **Objetivo:** Auditoria rápida de performance e erros.
*   **Visual:** Timeline de logs, contadores de registros sincronizados e erros recentes.

## 3. Lógica de Conexão Automática

A Canopi deve buscar ser "silenciosa" e resiliente:
*   **Restauração:** O sistema tenta validar o token existente assim que a página é carregada.
*   **Estados:**
    *   *Aguardando:* Spinner discreto.
    *   *Conectado:* Ícone verde, habilita todos os blocos.
    *   *Erro:* Badge vermelho, CTA de "Reconectar" ganha destaque no bloco de Autenticação Master.
*   **Ambientes:** Seletor visível entre Produção e Sandbox (alterar ambiente invalida o token atual).

## 4. Papel das Pendências e Discrepâncias

As pendências deixam de ser uma "lista de erros" para serem "decisões de configuração":
*   **Mapeamento:** Se um campo obrigatório não está mapeado, o bloco de Mapeamento exibe um aviso crítico.
*   **Identidade:** Discrepâncias de registros órfãos são tratadas como exceções de configuração de unicidade.
*   **Contextual:** Avisos aparecem dentro de cada bloco relevante, mantendo o usuário focado na resolução sem trocar de contexto.

## 5. Bloco: Mapeamento de Campos (Estilo HubSpot/RD)

*   **Seletor de Objeto:** Tabs ou Dropdown para alternar entre Leads, Contatos, etc.
*   **Tabela de Mapeamento:**
    *   *Campo Canopi:* Estático (ex: `email_address`).
    *   *Campo Salesforce:* Dropdown com campos descobertos via Describe API.
    *   *Tradução de Valores:* Para picklists (ex: `LeadStatus`), abre um sub-mapa de opções.
*   **Status:** Ícone de check para mapeado corretamente, alerta para campos obrigatórios vazios.

## 6. Bloco: Sincronização de Objetos

*   **Toggles:** Controles independentes.
*   **Dependências:** Exemplo: Habilitar "Oportunidades" exige que "Contas" esteja ativo (aviso visual).
*   **Custom Objects:** Permite digitar o API Name do objeto personalizado para iniciar mapeamento manual.

## 7. Bloco: Escopo e Filtros

*   **Data de Corte:** Define o `CreatedDate` mínimo para busca.
*   **Query Builder:** Interface visual (Campo + Operador + Valor) para filtrar registros (ex: `Rating EQUALS 'Hot'`).

## 8. Identidade e Configurações de Fluxo

*   **Chave Única:** Essencial para reconciliação.
*   **Direção:** Define se a Canopi pode escrever de volta no Salesforce (Writeback).
*   **Modo de Sincronização:** Batch (periódico) ou Webhooks (exige setup de URL de callback no SF).

## 9. Atividade Recente / Logs

*   **Sidebar Direita:** Mantém o histórico visual sem poluir a área de configuração.
*   **Itens:** "Sincronização concluída com sucesso (12 registros)", "Aviso de Sincronização (Falha em 2 registros)".

## 10. CTA e Conclusão Real

*   **CTA Final:** Botão fixo no rodapé: "Iniciar Sincronização Completa".
*   **Pré-condições:** Conexão ativa + Mapeamentos obrigatórios preenchidos + Chave de identidade definida.
*   **Ação:** Dispara o processo de sincronização persistente seguindo todas as regras de filtro e mapeamento configuradas nos blocos acima.

## 11. Wireframe Textual (Markdown)

```text
+--------------------------------------------------------------------------------+
|  Canopi | Integrações > Salesforce                     [ Status: Conectado ]   |
+--------------------------------------------------------------------------------+
|                                                                                |
|  CONFIGURAÇÃO SALESFORCE                                                       |
|  Conecte sua instância para mapear objetos e automatizar fluxos.               |
|                                                                                |
|  +-------------------------------------------------------------+  +----------+  |
|  | AUTENTICAÇÃO MASTER                                         |  | ATIVIDADE|  |
|  | [SF Logo] Ambiente: [Produção ^] [ Reconectar Salesforce ]  |  | RECENTE  |  |
|  +-------------------------------------------------------------+  |          |  |
|                                                                   | > Hoje   |  |
|  +---------------------------+ +-------------------------------+  |   Sucesso|  |
|  | SINCRONIZAÇÃO DE OBJETOS  | | ESCOPO E FILTROS              |  |          |  |
|  | (o) Leads & Contatos      | | Data de corte: [Últimos 12m^] |  | > Ontem  |  |
|  | (o) Contas & Orgs         | | [ Query Builder... ]          |  |   Erro   |  |
|  | ( ) Oportunidades         | |                               |  |          |  |
|  | [ + Add Custom Object ]   | +-------------------------------+  | [Logs]   |  |
|  +---------------------------+                                    +----------+  |
|                                                                                |
|  +---------------------------+ +-------------------------------+                |
|  | CONFIGURAÇÕES DE FLUXO    | | IDENTIDADE E UNICIDADE        |                |
|  | Direção: [ <-> ] [ -> ]   | | Chave Única: [ Email ^ ]      |                |
|  | Modo: [ Batch ] [ Real-T ]| | Conflito: (o) Sobrescrever SF |                |
|  +---------------------------+ +-------------------------------+                |
|                                                                                |
|  +-------------------------------------------------------------+                |
|  | MAPEAMENTO DE CAMPOS                              Obj: Leads |                |
|  | Campo Canopi       | Dir | Campo Salesforce                 |                |
|  | email_address      |  -> | [ Email               ^]         |                |
|  | first_name         |  -> | [ FirstName           ^]         |                |
|  | [ + Adicionar Mapeamento ]                                  |                |
|  +-------------------------------------------------------------+                |
|                                                                                |
+--------------------------------------------------------------------------------+
| [Criptografia Ativa]                      [ INICIAR SINCRONIZAÇÃO COMPLETA ]   |
+--------------------------------------------------------------------------------+
```

## 12. Handoff para implementação (Claude Code / Sonnet)

### Objetivo
Converter a página `SalesforceMultiEntityPreview.tsx` em um dashboard modular e consolidado, eliminando o fluxo step-by-step atual.

### Componentes Sugeridos
*   `SalesforceAuthCard.tsx`: Bloco Master.
*   `SalesforceSyncSettings.tsx`: Agrupador de Toggles e Filtros.
*   `SalesforceFieldMapper.tsx`: Tabela de mapeamento unificada.
*   `SalesforceActivitySidebar.tsx`: Painel de logs lateral.

### Estado Necessário
*   Consolidar `setupStep` em um estado único de `configState`.
*   Unificar as resoluções de qualidade (`accountQualityResolutions`) dentro da lógica de mapeamento.

### Ordem de Implementação
1.  **Fase 1:** Reestruturação do Layout (Grid de blocos + Sidebar).
2.  **Fase 2:** Migração dos controles existentes (Toggles de objetos e Filtros de data) para os novos blocos.
3.  **Fase 3:** Implementação da Tabela de Mapeamento Unificada.
4.  **Fase 4:** Integração dos Logs/Atividade Recente.
5.  **Fase 5:** Validação do CTA Final de Sincronização.

### O que desmontar
*   O componente de `Stepper` (Passo 1, 2...).
*   Os cards isolados de "Pendências" (substituídos por avisos contextuais).
*   A lógica de "Resumo da Configuração" (agora intrínseca à tela).
