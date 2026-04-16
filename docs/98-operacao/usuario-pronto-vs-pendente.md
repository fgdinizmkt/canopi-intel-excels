# Meu Perfil (/usuario) — UI Pronta vs Backend Pendente

**Data:** 2026-04-16  
**Contexto:** Refatoração visual e estrutural concluída. OAuth real ainda não integrado.

---

## ✅ UI PRONTA — Funcionando Hoje

### Identidade Pessoal
- ✅ Exibição de foto, nome, cargo, área, papel, status
- ✅ Edição inline de informações pessoais (Save/Cancel)
- ✅ Upload e armazenamento de foto em localStorage (data URL)
- ✅ Suporta edição e remoção de avatar

### Contexto Operacional (Sidebar)
- ✅ Squads, frentes, papel operacional, escopo de contas
- ✅ Módulos e acessos visíveis (apenas leitura)
- ✅ Dados estruturados em DEFAULT_OPERATIONAL

### Ferramentas Oficiais do Workspace
- ✅ **Grade compacta 2×2** (HubSpot, Salesforce, Teams, Outlook)
- ✅ **Ícones coerentes** coloridos por vendor
- ✅ **Status visual** "Disponível" em verde
- ✅ **Seção "Bloqueados"** listando provedores vetados
- ✅ **WORKSPACE_POLICY** centralizado (fonte de verdade local)

### Comunicação Pessoal (card)
- ✅ **Status display honesto** com ícones e cores:
  - Não Conectado (cinza)
  - Conta Conectada (verde)
  - Aguardando Autenticação (azul)
  - Erro de Conexão (vermelho)
  - Bloqueado pelo Workspace (âmbar)
- ✅ **Campos expostos e persistidos:**
  - Workspace (ex: canopi.teams.com)
  - Canal/Destino Padrão (ex: #revenue-ops)
  - Identificador do Usuário (ex: fdiniz)
  - Tipos de Alerta (checkboxes: Urgentes, Reuniões)
- ✅ **Atualização em tempo real** na UI

### Agenda Pessoal (card)
- ✅ **Status display honesto** (idem Comunicação)
- ✅ **Campos expostos e persistidos:**
  - Email da Agenda
  - Fuso Horário (select: São Paulo, Nova York, Londres, Singapura)
  - Horário de Trabalho (Início/Fim com inputs de hora)
  - Janelas de Foco (inputs de texto: 09:00-11:00, 14:00-16:00)
  - Preferências de Lembrete (select: Ativados, Desativados, Apenas Urgentes)
- ✅ **Persistência em localStorage** de todos os campos

### Preferências Rápidas
- ✅ **Grid 2×2 compacto:**
  - Visão Inicial (select)
  - Densidade (botões: Compacto, Normal, Expandido)
  - Enfoque (botões: ABM, ABX, Híbrido)
  - SLA (botões: Baixa, Normal, Alta)
- ✅ **Cores dinâmicas** por seleção

### Segurança da Conta
- ✅ **Exibição de método:** Email + Senha
- ✅ **Status 2FA:** Ativado/Desativado
- ✅ **Alterar Senha (recolhido por padrão):**
  - Botão expande seção de alteração
  - Campos: Senha Atual, Nova Senha, Confirmar
  - **Validação em tempo real:**
    - Mínimo 8 caracteres ✓
    - Número ou símbolo ✓
    - Senhas correspondem ✓
  - Botões Atualizar/Cancelar fecham seção
  - **Funciona:** Altera senha em localStorage (integrada com login)

### Arquitetura de Dados
- ✅ **Fonte única: `DEFAULT_USER_PROFILE`**
  - Unificação de 5 keys localStorage antigos
  - Tipagem TypeScript completa
  - Migração automática backward compatible
- ✅ **Helper functions:**
  - `getStatusDisplay()` → label + cor + ícone
  - `getVendorIcon()` → ícone por vendor ID
  - Mapeamento de estados para display real

### Performance e UX
- ✅ **Renderização sem erros** (build clean)
- ✅ **Lazy loading de seções** (recolhimento/expansão)
- ✅ **Responsivo** (grid adapta mobile/desktop)
- ✅ **Acessibilidade básica** (labels, alt text, ARIA)

---

## ❌ BACKEND PENDENTE — Necessário para Produção

### OAuth/OIDC (Comunicação e Agenda)

❌ **Autenticação do usuário com provedor:**
- Nenhum flow OAuth iniciado
- Nenhum callback processado
- Nenhum exchange de auth code → tokens
- **Status:** Botão "Conectar" não existe na UI (por segurança)

❌ **Persistência de vínculos de conta:**
- Nenhuma tabela `user_account_links`
- Nenhum armazenamento de refresh token (encrypted)
- Nenhuma rastreabilidade de conexão
- **Status:** localStorage é única fonte (insuficiente para produção)

❌ **Validação de token em tempo real:**
- Nenhuma verificação de validade de token
- Nenhuma rotação de refresh token
- Nenhuma API de status real
- **Status:** Status UI sempre "Não Conectado"

❌ **Revogação de conexão:**
- Nenhum endpoint para desconectar
- Nenhuma invalidação remota
- **Status:** Usuário não pode desconectar remotamente

### Leitura de Dados Reais

❌ **Calendário (Outlook/Google Calendar):**
- Nenhuma leitura de eventos
- Nenhuma sincronização de freebusy
- Nenhuma exibição de compromissos
- **Status:** Campos persistem localmente apenas

❌ **Chat (Teams/Google Chat):**
- Nenhuma leitura de canais
- Nenhuma leitura de mensagens
- Nenhuma exibição de presença
- **Status:** Campos persistem localmente apenas

❌ **CRMs (HubSpot/Salesforce):**
- Nenhuma integração com APIs de CRM
- Ferramentas apenas informativas
- **Status:** "Disponível" é hardcoded

### Sincronização com Backend

❌ **API para obter WORKSPACE_POLICY:**
- Atualmente hardcoded no frontend
- Não sincroniza com admin/configurações
- Não valida policy no backend
- **Status:** Precisa de `GET /api/workspace/policy`

❌ **API para obter status de conexões:**
- Nenhuma chamada a backend para status real
- Nenhuma polling periódica
- Status baseado em localStorage
- **Status:** Precisa de `GET /api/accounts/connections` com polling

❌ **API para vincular conta:**
- Nenhum endpoint para iniciar OAuth
- Nenhum callback handler
- **Status:** Precisa de 6 endpoints (Teams, Outlook, Chat, Calendar start/callback)

❌ **API para desconectar:**
- Nenhum endpoint para revogar
- **Status:** Precisa de `POST /api/accounts/unlink/{provider}`

### Banco de Dados

❌ **Tabelas necessárias:**
- `user_account_links` (OAuth links, refresh tokens)
- `workspace_policy` (configuração de workspace)
- `account_link_audit` (auditoria de conexões)
- **Status:** Nenhuma migração criada

---

## 📊 Comparação: Frontend vs Backend

| Aspecto | Frontend (Pronto ✅) | Backend (Pendente ❌) |
|---------|--------------------|--------------------|
| **UI/UX** | Refatorada, honesta, preparada | — |
| **Persistência local** | localStorage (temporária) | Database (permanente) |
| **Status real** | Hardcoded no frontend | Via API |
| **Validação de policy** | Hardcoded em código | Via configuração admin |
| **Autenticação OAuth** | Estrutura de estado | Endpoints + provedor |
| **Token storage** | localStorage (inseguro) | Database encrypted |
| **Token refresh** | Manual | Automático via cron |
| **Revogação** | Sem suporte | Endpoint + provedor |
| **Auditoria** | Nenhuma | Audit log + timestamps |
| **Dados reais** | Nenhuma leitura | APIs de provedor |

---

## 🎯 Fluxo Esperado Após Backend

### Hoje (UI only)
```
1. Usuário vê campos em localStorage
2. Digita dados
3. Salva em localStorage
4. Status permanece "Não Conectado"
5. Nada sincroniza com servidor
```

### Com Backend
```
1. Usuário vê campos
2. Clica "Conectar"
3. Redireciona para OAuth (Microsoft/Google)
4. Volta de callback com refresh token
5. Backend armazena token (encrypted)
6. API retorna status "Conectado"
7. Polling periodicamente valida token
8. Usuário pode desconectar (revoga remotamente)
9. Dashboard pode ler calendário/chat real
10. Auditoria registra cada ação
```

---

## 📋 Checklist de Migração

- [ ] Database migrations (3 tabelas)
- [ ] OAuth endpoints (6: Teams, Outlook, Chat, Calendar start/callback)
- [ ] Token refresh cron job
- [ ] Status polling API
- [ ] Unlink/revoke endpoint
- [ ] Encryption utilities
- [ ] Frontend: Remover botões "Conectar" (escondidos por segurança)
- [ ] Frontend: Adicionar polling em useEffect
- [ ] Frontend: Integrar oauth start endpoints
- [ ] Tests (unit + integration + oauth flow)
- [ ] Security audit (OWASP + token handling)
- [ ] Documentação de scopes por provider
- [ ] Rate limiting e abuse prevention
- [ ] Error handling e retry logic

---

## 💡 Notas Importantes

### A UI Não Muda
Quando o backend for implementado, **a UI praticamente não precisa mudar:**
- Mesmos campos de entrada permanecem
- Mesmos status states mapeiam para responses reais
- Mesmo layout acomoda dados vindos de API
- **Mudança principal:** useEffect que lê localStorage → fazer requisição à API

### localStorage é Temporário
- ✅ Funciona hoje para permitir navegação e testes
- ✅ Suporta offline (degradado)
- ❌ Não é seguro para refresh tokens
- ❌ Não sincroniza entre dispositivos
- ❌ Perdido ao limpar cache/cookies

### Segurança Primeiro
- Nenhum token será armazenado no localStorage em produção
- Refresh tokens encrypted no banco de dados
- CSRF protection (state tokens)
- OAuth state validation obrigatória

---

**Status Final:**
> A página Meu Perfil é **pronta em UI e arquitetura**, mas **requer implementação de backend para segurança e funcionalidade real**. Nenhuma funcionalidade quebra ao adicionar backend — é migração gradual.
