# Arquitetura Mínima — Conexão Real Comunicação + Agenda

**Versão:** 1.0  
**Status:** Proposta Técnica  
**Escopo:** OAuth real para Teams/Outlook (Microsoft) + Google Chat/Calendar (Google)

---

## 1. Visão Geral

### Componentes

```
┌────────────────────────────────────────────┐
│         Browser (Frontend)                 │
│  ┌──────────────────────────────────┐     │
│  │  Meu Perfil (/usuario)           │     │
│  │  - Botão "Conectar"              │     │
│  │  - Status real (API polling)     │     │
│  │  - Botão "Desconectar"           │     │
│  └──────────────────────────────────┘     │
└────────────────────────────────────────────┘
                    ↓ (OAuth redirect)
┌────────────────────────────────────────────┐
│  OAuth Provider (Microsoft/Google)        │
│  - User consents                          │
│  - Grants scopes                          │
│  - Returns auth code                      │
└────────────────────────────────────────────┘
                    ↓ (callback)
┌────────────────────────────────────────────┐
│  Backend API (/auth/callback/*)           │
│  - Troca auth code por tokens             │
│  - Armazena refresh token (encrypted)     │
│  - Cria/atualiza account link             │
│  - Retorna 302 → /usuario                 │
└────────────────────────────────────────────┘
                    ↓ (persista)
┌────────────────────────────────────────────┐
│  Database (PostgreSQL/MySQL)              │
│  - user_account_links                     │
│  - workspace_policy                       │
└────────────────────────────────────────────┘
```

---

## 2. Fluxo OAuth Completo

### 2.1 Iniciação (Frontend)

```typescript
// /usuario page — Botão "Conectar"
<button onClick={() => {
  const workspace_id = userProfile.workspace_id; // ou da sessão
  window.location.href = `/api/accounts/oauth/teams/start?workspace_id=${workspace_id}`;
}}>
  Conectar Teams
</button>
```

### 2.2 Start Endpoint

**GET `/api/accounts/oauth/{provider}/start`**

```typescript
// Backend
export async function GET(req: Request) {
  const workspace_id = req.nextUrl.searchParams.get('workspace_id');
  const user_id = req.user.id; // via auth middleware
  
  // Gera state token (CSRF protection)
  const state = crypto.randomBytes(16).toString('hex');
  await redis.setex(`oauth_state:${state}`, 600, JSON.stringify({
    user_id,
    workspace_id,
    provider: 'teams',
    timestamp: Date.now()
  }));

  const redirect_uri = `${BASE_URL}/api/accounts/oauth/teams/callback`;
  
  // Microsoft OAuth URL
  const auth_url = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  auth_url.searchParams.append('client_id', MICROSOFT_CLIENT_ID);
  auth_url.searchParams.append('redirect_uri', redirect_uri);
  auth_url.searchParams.append('response_type', 'code');
  auth_url.searchParams.append('scope', 'https://graph.microsoft.com/.default');
  auth_url.searchParams.append('state', state);
  auth_url.searchParams.append('prompt', 'select_account');

  return redirect(auth_url.toString());
}
```

**Scopes Mínimos:**

Teams (Comunicação):
```
https://graph.microsoft.com/User.Read
https://graph.microsoft.com/TeamsActivity.Send
https://graph.microsoft.com/Channel.ReadBasic.All
https://graph.microsoft.com/Chat.ReadBasic
```

Outlook (Agenda):
```
https://graph.microsoft.com/Calendar.Read
https://graph.microsoft.com/Calendars.Read.Shared
```

Google:
```
https://www.googleapis.com/auth/chat.messages.create  // Chat
https://www.googleapis.com/auth/calendar.readonly     // Calendar
```

### 2.3 Callback Endpoint

**GET `/api/accounts/oauth/{provider}/callback`**

```typescript
export async function GET(req: Request) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  // Valida state
  const state_data = await redis.get(`oauth_state:${state}`);
  if (!state_data) throw new Error('Invalid state');
  
  const { user_id, workspace_id, provider } = JSON.parse(state_data);
  
  // Troca code por tokens
  const tokens = await exchangeCodeForTokens(code, provider);
  const { access_token, refresh_token, expires_in } = tokens;

  // Valida token + obtém dados do usuário remoto
  const remote_account = await getRemoteAccount(access_token, provider);
  
  // Armazena link de conta (encrypted refresh token)
  await db.user_account_links.upsert({
    user_id,
    provider,
    workspace_id,
    account_id: remote_account.id,
    account_email: remote_account.email,
    account_name: remote_account.displayName,
    access_token_encrypted: encrypt(access_token),
    refresh_token_encrypted: encrypt(refresh_token),
    refresh_token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    scopes: SCOPES[provider],
    connected_at: new Date(),
    last_refreshed: new Date(),
    revoked_at: null,
  });

  // Limpa state
  await redis.del(`oauth_state:${state}`);

  // Retorna para /usuario com flash message de sucesso
  return redirect(`/usuario?connected=${provider}`);
}

function encrypt(text: string): string {
  // AES-256-GCM ou similar
  return crypto.subtle.encrypt(...);
}
```

### 2.4 Revoke/Unlink Endpoint

**POST `/api/accounts/unlink/{provider}`**

```typescript
export async function POST(req: Request) {
  const user_id = req.user.id;
  const { provider } = req.body;

  const link = await db.user_account_links.findOne({
    user_id,
    provider,
    revoked_at: null
  });

  if (!link) throw new Error('No active link found');

  // Revoga token no provider (se suportado)
  try {
    await revokeRemoteToken(link.refresh_token_encrypted, provider);
  } catch (e) {
    // Log, mas não falha — pode estar já revogado
  }

  // Marca como revogado (soft delete)
  await db.user_account_links.update(link.id, {
    revoked_at: new Date(),
    access_token_encrypted: null, // limpa para segurança
  });

  return json({ success: true });
}
```

---

## 3. Leitura de Status Real

### 3.1 Endpoint GET Status

**GET `/api/accounts/connections`**

```typescript
export async function GET(req: Request) {
  const user_id = req.user.id;

  const links = await db.user_account_links.find({
    user_id,
    revoked_at: null,
  });

  const status = {};
  
  for (const link of links) {
    const refresh_token = decrypt(link.refresh_token_encrypted);
    
    // Valida se token ainda é válido
    let is_valid = true;
    try {
      // Tenta refresh
      const new_tokens = await refreshTokenIfNeeded(refresh_token, link.provider);
      if (new_tokens) {
        // Armazena novo access token
        await db.user_account_links.update(link.id, {
          access_token_encrypted: encrypt(new_tokens.access_token),
          last_refreshed: new Date(),
        });
      }
    } catch (e) {
      is_valid = false; // Token expirou ou foi revogado remotamente
    }

    status[link.provider] = {
      connected: is_valid,
      account_email: link.account_email,
      account_name: link.account_name,
      connected_at: link.connected_at,
      status: is_valid ? 'conectado' : 'erro',
    };
  }

  return json(status);
}
```

### 3.2 Frontend Polling

```typescript
// /usuario page
useEffect(() => {
  const poll = async () => {
    const res = await fetch('/api/accounts/connections');
    const status = await res.json();
    
    setUserProfile(prev => ({
      ...prev,
      comunicacao: {
        ...prev.comunicacao,
        status: status.teams?.connected ? 'conectado' : 'nao-conectado',
      },
      agenda: {
        ...prev.agenda,
        status: status.outlook?.connected ? 'conectado' : 'nao-conectado',
      },
    }));
  };

  poll(); // Imediato
  const interval = setInterval(poll, 60000); // A cada 1 min

  return () => clearInterval(interval);
}, []);
```

---

## 4. Database Schema

### 4.1 Tabela: user_account_links

```sql
CREATE TABLE user_account_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  provider VARCHAR(50) NOT NULL, -- 'teams', 'outlook', 'google-chat', 'google-calendar'
  
  -- Dados remotos
  account_id VARCHAR(255) NOT NULL, -- Microsoft User ID ou Google User ID
  account_email VARCHAR(255),
  account_name VARCHAR(255),
  
  -- Tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT NOT NULL,
  refresh_token_expires_at TIMESTAMP,
  scopes TEXT[], -- JSON array of scopes granted
  
  -- Lifecycle
  connected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_refreshed TIMESTAMP,
  revoked_at TIMESTAMP,
  
  UNIQUE(user_id, provider, workspace_id),
  INDEX(user_id),
  INDEX(provider),
  INDEX(revoked_at)
);
```

### 4.2 Tabela: workspace_policy

```sql
CREATE TABLE workspace_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id),
  
  -- Suite principal
  suite_principal VARCHAR(50) NOT NULL, -- 'microsoft' | 'google'
  
  -- CRMs
  crm_marketing_vendor VARCHAR(50), -- 'hubspot', 'salesforce', etc
  crm_vendas_vendor VARCHAR(50),
  
  -- Colaboração e Agenda
  colaboracao_vendor VARCHAR(50), -- 'teams', 'google-chat', 'slack'
  agenda_vendor VARCHAR(50), -- 'outlook', 'google-calendar'
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 5. Segurança

### 5.1 Encryption em Repouso

```typescript
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes, hex

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Retorna: iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(ciphertext: string): string {
  const [iv_hex, authTag_hex, encrypted_hex] = ciphertext.split(':');
  const iv = Buffer.from(iv_hex, 'hex');
  const authTag = Buffer.from(authTag_hex, 'hex');
  const encrypted = Buffer.from(encrypted_hex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 5.2 CSRF Protection

- State token gerado e armazenado em Redis (expira em 10 min)
- Validado no callback antes de processar

### 5.3 Token Rotation

```typescript
async function refreshTokenIfNeeded(refresh_token: string, provider: string) {
  // Se < 5 min para expirar, faz refresh
  const link = await db.user_account_links.findOne({ refresh_token });
  
  if (!link || Date.now() + 5*60*1000 < link.refresh_token_expires_at) {
    return null; // Ainda válido
  }

  const new_tokens = await getNewTokens(refresh_token, provider);
  return new_tokens; // { access_token, refresh_token, expires_in }
}
```

### 5.4 Auditoria

```sql
CREATE TABLE account_link_audit (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  provider VARCHAR(50),
  action VARCHAR(50), -- 'connected', 'refreshed', 'revoked', 'error'
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Diferença: Ferramenta Oficial vs Conta Pessoal Vinculada

| Aspecto | Ferramenta Oficial | Conta Pessoal Vinculada |
|---------|-------------------|------------------------|
| **Fonte** | `WORKSPACE_POLICY` (admin) | `user_account_links` (OAuth) |
| **Escopo** | Stack autorizado da empresa | Integração pessoal do usuário |
| **Quem configura** | Admin do workspace | Usuário (via OAuth) |
| **Responsabilidade** | Canopi (via app permissions) | Usuário (via personal account) |
| **Dados** | Apenas informativos | Acesso real a calendário/chat |
| **Status** | Always "Disponível" | "Conectado" ou "Erro" |
| **Exemplo** | "Teams é a colaboração oficial" | "Meu Teams pessoal está vinculado" |

---

## 7. MVP Minimal Scope

**Para Produção — Fase 1:**

1. ✅ OAuth flow Microsoft Teams + Outlook
2. ✅ Account link storage (encrypted)
3. ✅ Token refresh logic
4. ✅ Unlink/revoke
5. ✅ Status polling endpoint
6. ✅ Workspace policy from backend
7. ⏸ Read calendars (pode ser Fase 2)
8. ⏸ Read chat messages (pode ser Fase 2)
9. ⏸ Send messages (pode ser Fase 2)

**Fase 2:**
- Google Chat + Calendar
- Leitura de dados (calendário, presença)
- Sincronização periódica

---

## 8. Timeline Estimado

- **Semana 1:** OAuth endpoints + database
- **Semana 2:** Token refresh + revoke
- **Semana 3:** Frontend integration + status polling
- **Semana 4:** Testes + hardening

---

## Checklist de Implementação

- [ ] Environment variables (MICROSOFT_CLIENT_ID, GOOGLE_CLIENT_ID, ENCRYPTION_KEY)
- [ ] Redis para state tokens
- [ ] Database migrations
- [ ] OAuth endpoints (6: /start, /callback para Teams, Outlook, Chat, Calendar)
- [ ] Token refresh cron job (run every 6 hours)
- [ ] Encryption/decryption utilities
- [ ] Error handling e retry logic
- [ ] Logging e audit trail
- [ ] Rate limiting em oauth endpoints
- [ ] HTTPS enforcement (OAuth requires)
- [ ] Refresh token rotation
- [ ] Integration tests
- [ ] Security audit (OWASP)

---

**Status:** Arquitetura validada. Pronta para desenvolvimento.
