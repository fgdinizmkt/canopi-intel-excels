# Página Meu Perfil (/usuario) — Estado Atual

**Data:** 2026-04-16  
**Status:** UI preparada para backend · Integração real pendente  
**Última atualização:** Refatoração visual + estrutura de dados unificada

---

## O que está PRONTO

### ✅ UI e Persistência Local (localStorage)

**Identidade Pessoal:**
- Foto de perfil (upload, armazenamento local via data URL)
- Nome, email, cargo, área, papel, status
- Edição inline com Save/Cancel

**Contexto Operacional (sidebar):**
- Squads, frentes, papel operacional, escopo de contas
- Módulos e acessos visíveis
- Apenas leitura (dados do workspace)

**Ferramentas Oficiais do Workspace:**
- Grade 2×2 com cards estruturais: HubSpot, Salesforce, Teams, Outlook
- Ícones coerentes e coloridos
- Status "Disponível" para ferramentas oficiais
- Seção "Bloqueados neste workspace" listando provedores vetados
- **Política centralizada** em `WORKSPACE_POLICY` (define suite, CRMs, colaboração, agenda)

**Comunicação Pessoal (card):**
- Status display honesto (Não Conectado, Conta Conectada, Aguardando, Erro, Bloqueado)
- Campos persistidos em localStorage:
  - `workspace` (ex: canopi.teams.com)
  - `canalPadrao` (ex: #revenue-ops)
  - `usuarioId` (ex: fdiniz)
  - `tiposAlerta` (Urgentes, Reuniões)
  - `status` (estado da conexão local)

**Agenda Pessoal (card):**
- Status display honesto (idem Comunicação)
- Campos persistidos em localStorage:
  - `email` (da agenda)
  - `fusoHorario` (São Paulo, Nova York, Londres, Singapura)
  - `horarioTrabalho` (início/fim)
  - `janelasFoco` (array: 09:00-11:00, 14:00-16:00)
  - `lembretes` (Ativados, Desativados, Apenas Urgentes)
  - `status` (estado da conexão local)

**Preferências Rápidas:**
- Visão Inicial, Densidade, Enfoque, SLA
- Persistidas em localStorage

**Segurança da Conta:**
- Método de autenticação (Email + Senha)
- Status 2FA (Ativado/Desativado)
- Alterar Senha (recolhido por padrão, expande ao clicar)
- Validação de força + correspondência inline

### ✅ Arquitetura de Dados

**Fonte Única: `DEFAULT_USER_PROFILE`**
- Unificação de 5 keys localStorage antigos em 1 objeto coeso
- Migração automática para backward compatibility
- Tipagem TypeScript completa

**Política do Workspace: `WORKSPACE_POLICY`**
- Configuração centralizada e imutável
- Define: suite principal, CRMs (marketing/vendas), colaboração, agenda
- **NÃO é escolhido pelo usuário** — vem do backend/admin

**Estados de Conexão Mapeados:**
- `getStatusDisplay()` retorna label + cor + ícone para cada estado
- Estados possíveis: não-conectado, conectado, aguardando, erro, bloqueado, sem-permissão
- Preparado para mapear responses reais de OAuth

---

## O que está PENDENTE de Backend Real

### ❌ Autenticação e Integração

**Comunicação (Microsoft Teams / Google Chat):**
- Nenhuma conexão real com OAuth/OIDC
- Nenhuma leitura de workspace/canais reais
- Nenhum callback de autenticação
- Status permanece "Não Conectado" (localStorage apenas)

**Agenda (Outlook / Google Calendar):**
- Nenhuma conexão real com OAuth/OIDC
- Nenhuma leitura de calendário
- Nenhum callback de autenticação
- Status permanece "Não Conectado" (localStorage apenas)

**CRMs (HubSpot, Salesforce):**
- Ferramentas oficiais são apenas informativas
- Nenhuma integração com APIs de CRM
- Apenas "Disponível" no workspace

### ❌ Fonte de Verdade

**Atualmente:**
- localStorage é a única fonte de verdade
- Não sincroniza com servidor
- Não validação de policy no backend
- Sem persistência real entre dispositivos/sessões

**Futuramente será:**
- Backend (API) como fonte de verdade
- Configurações > Administrador configura WORKSPACE_POLICY
- Banco de dados persiste vínculos de conta (account links)
- Status real vem de provider (Microsoft Graph, Google APIs)

---

## Mudanças Estruturais Necessárias

Para passar de localStorage mock para backend real:

1. **API Endpoint:**
   - `GET /api/workspace/policy` → retorna WORKSPACE_POLICY autorizada
   - `POST /api/accounts/link/{provider}` → inicia OAuth flow
   - `GET /api/accounts/connections` → status real de todas as contas vinculadas
   - `POST /api/accounts/unlink/{provider}` → revoga conexão

2. **Base de Dados:**
   - Tabela `user_account_links`: user_id, provider, account_id, refresh_token (encrypted), scopes, connected_at, revoked_at
   - Tabela `workspace_policy`: workspace_id, suite_principal, crm_marketing, crm_vendas, ...

3. **OAuth Callbacks:**
   - Microsoft: `/auth/callback/teams` e `/auth/callback/outlook`
   - Google: `/auth/callback/chat` e `/auth/callback/calendar`
   - Armazena tokens + refresh tokens (encrypted)

4. **UI Changes:**
   - Botão "Conectar" → abre OAuth flow no provider
   - Status real → lido de `GET /api/accounts/connections`
   - Botão "Desconectar" → chama `POST /api/accounts/unlink`
   - Nenhuma persistência local de estado de conexão

---

## Regra de Ouro

> **localStorage é source-of-truth provisório. Backend será a fonte real. A página /usuario é camada de apresentação apenas.**

- Meu Perfil = apresentação de dados do usuário + vínculos
- Configurações = onde admin configura policy do workspace
- Backend = onde tudo é validado, persistido, sincronizado

---

## Checklist para Produção

- [ ] API endpoints para OAuth flow (Microsoft + Google)
- [ ] Encryption de refresh tokens
- [ ] Database schema para account links
- [ ] Callback handlers (2 para Teams, 2 para Outlook, 2 para Chats/Calendars = 6 total)
- [ ] Revoke/unlink logic
- [ ] Real status polling (GET /api/accounts/connections)
- [ ] Scopes mínimos por provider (leitura de calendário, canais, presença)
- [ ] Sincronização periódica de status (cron job)
- [ ] Rotação de refresh tokens
- [ ] Audit log de conexões/desconexões

---

## Notas de Implementação

**Sem mudanças esperadas na UI para passar para backend:**
- Os mesmos campos de entrada funcionarão
- Os mesmos status states mapeiam para responses reais
- O mesmo layout acomoda dados vindos de API

**Única mudança na lógica:**
- `useEffect` que lê localStorage → fazer request à API
- Botão "Conectar" → `onClick={() => window.location.href = '/api/accounts/oauth/teams'}`
- Status não mais local → refetch em intervalo (polling ou WebSocket)

---

**Preparação Concluída:** Arquitetura UI pronta para integração backend real.
