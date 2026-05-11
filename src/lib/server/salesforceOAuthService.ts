import { randomBytes } from 'crypto';
import { encryptToken, decryptToken } from './oauthTokenCrypto';
import { getSupabaseAdminClient } from './supabaseAdmin';

export const SALESFORCE_PROVIDER = 'salesforce';
export const OAUTH_STATE_COOKIE = 'canopi_salesforce_oauth_state';
export const DEFAULT_API_VERSION = 'v66.0';
const DEFAULT_LOGIN_URL = 'https://login.salesforce.com';
const DEFAULT_SCOPES = ['api', 'refresh_token'];

export type OAuthConnectionStatus =
  | 'requires_configuration'
  | 'disconnected'
  | 'connected'
  | 'error';

export interface OAuthConfigStatus {
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  redirectUriConfigured: boolean;
  loginUrlConfigured: boolean;
  configured: boolean;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  loginUrl: string;
  scopes: string[];
  source: 'database' | 'env' | 'none';
  updatedAt: string | null;
}

export interface OAuthSafeStatus {
  configured: boolean;
  connected: boolean;
  status: OAuthConnectionStatus;
  instanceUrl: string | null;
  orgId: string | null;
  userId: string | null;
  scopes: string[];
  lastHealthCheckAt: string | null;
  accountLabel: string | null;
  accountFieldsCount: number | null;
  apiVersion: string;
  error: string | null;
  configChecklist: {
    clientId: boolean;
    clientSecret: boolean;
    redirectUri: boolean;
    loginUrl: boolean;
  };
}

export interface OAuthConfigSafeResponse {
  configured: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  loginUrl: string;
  redirectUri: string;
  scopes: string[];
  callbackUrl: string;
  updatedAt: string | null;
}

type OAuthTokenPayload = {
  access_token?: string;
  refresh_token?: string;
  instance_url?: string;
  id?: string;
  issued_at?: string;
  scope?: string;
  token_type?: string;
};

type SalesforceDescribeResponse = {
  label?: string;
  fields?: Array<{ name?: string }>;
};

type SalesforceDescribeField = {
  name?: string;
  label?: string;
  type?: string;
  nillable?: boolean;
  updateable?: boolean;
  createable?: boolean;
  calculated?: boolean;
};

type SalesforceDescribeFullResponse = {
  label?: string;
  fields?: SalesforceDescribeField[];
};

export type SalesforceObjectStatus = 'available' | 'unavailable' | 'no_permission' | 'error';

export interface SalesforceFieldMeta {
  name: string;
  label: string;
  type: string;
  nillable: boolean;
  updateable: boolean;
  createable: boolean;
  calculated: boolean;
}

export interface SalesforceObjectDiscovery {
  objectApiName: string;
  label: string;
  status: SalesforceObjectStatus;
  readable: boolean;
  fieldCount: number;
  fields: SalesforceFieldMeta[];
  recommendedFields: SalesforceFieldMeta[];
  missingRecommendedFields: string[];
  message?: string;
}

export interface SalesforceAccountPreviewRecord {
  Id: string | null;
  Name: string | null;
  Website: string | null;
  Industry: string | null;
  Type: string | null;
  OwnerId: string | null;
  CreatedDate: string | null;
  LastModifiedDate: string | null;
}

export interface SalesforceAccountPreviewResult {
  records: SalesforceAccountPreviewRecord[];
  totalSize: number;
  done: boolean;
  limit: number;
  apiVersion: string;
  instanceUrl: string;
  accountLabel: string;
  testedAt: string;
}

const RECOMMENDED_FIELDS: Record<string, string[]> = {
  Account: ['Id', 'Name', 'Website', 'Industry', 'Type', 'AnnualRevenue', 'NumberOfEmployees', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Contact: ['Id', 'AccountId', 'FirstName', 'LastName', 'Name', 'Email', 'Phone', 'Title', 'Department', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Opportunity: ['Id', 'AccountId', 'Name', 'StageName', 'Amount', 'CloseDate', 'Probability', 'Type', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Lead: ['Id', 'Company', 'FirstName', 'LastName', 'Name', 'Email', 'Phone', 'Title', 'Status', 'LeadSource', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Campaign: ['Id', 'Name', 'Type', 'Status', 'StartDate', 'EndDate', 'BudgetedCost', 'ActualCost', 'ExpectedRevenue', 'IsActive', 'CreatedDate', 'LastModifiedDate'],
};

const ACCOUNT_PREVIEW_FIELDS = [
  'Id',
  'Name',
  'Website',
  'Industry',
  'Type',
  'OwnerId',
  'CreatedDate',
  'LastModifiedDate',
];

const DEFAULT_ACCOUNTS_PREVIEW_LIMIT = 10;
const MAX_ACCOUNTS_PREVIEW_LIMIT = 200;

type ConnectionRow = {
  provider: string;
  status: OAuthConnectionStatus;
  instance_url: string | null;
  org_id: string | null;
  user_id: string | null;
  scopes: string[] | null;
  token_type: string | null;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  access_token_issued_at: string | null;
  access_token_expires_at: string | null;
  last_health_check_at: string | null;
  account_label: string | null;
  account_fields_count: number | null;
  api_version: string | null;
  error_message: string | null;
  created_at?: string;
  updated_at?: string;
};

type ConfigRow = {
  provider: string;
  client_id: string | null;
  encrypted_client_secret: string | null;
  login_url: string | null;
  redirect_uri: string | null;
  scopes: string[] | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
};

function normalizeLoginUrl(raw: string | null | undefined): string {
  const value = (raw || '').trim() || DEFAULT_LOGIN_URL;
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_LOGIN_URL;
  }
}

function parseScopes(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(/[\s,]+/).map((v) => v.trim()).filter(Boolean);
}

function normalizeScopes(raw: string[] | null | undefined): string[] {
  if (!raw || raw.length === 0) return [...DEFAULT_SCOPES];
  return raw.map((v) => v.trim()).filter(Boolean);
}

function normalizeAccountsPreviewLimit(rawLimit: number | string | null | undefined): number {
  const parsed = typeof rawLimit === 'string' ? Number(rawLimit) : rawLimit;
  if (!Number.isFinite(parsed as number)) return DEFAULT_ACCOUNTS_PREVIEW_LIMIT;
  const limit = Math.trunc(Number(parsed));
  if (limit <= 0) return DEFAULT_ACCOUNTS_PREVIEW_LIMIT;
  return Math.min(limit, MAX_ACCOUNTS_PREVIEW_LIMIT);
}

function parseIdentityUrl(identityUrl: string | undefined): { orgId: string | null; userId: string | null } {
  if (!identityUrl) return { orgId: null, userId: null };
  try {
    const path = new URL(identityUrl).pathname.split('/').filter(Boolean);
    const idIdx = path.findIndex((x) => x === 'id');
    if (idIdx >= 0 && path.length >= idIdx + 3) {
      return { orgId: path[idIdx + 1] || null, userId: path[idIdx + 2] || null };
    }
  } catch {
    // ignore malformed identity URL
  }
  return { orgId: null, userId: null };
}

export function generateOAuthState(): string {
  return randomBytes(24).toString('base64url');
}

export async function getOAuthConfigStatus(): Promise<OAuthConfigStatus> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from('connector_oauth_configs')
    .select('*')
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  const row = data as ConfigRow | null;
  if (row) {
    const clientId = row.client_id?.trim() || '';
    const secretEncrypted = row.encrypted_client_secret?.trim() || '';
    const dbRedirectUri = row.redirect_uri?.trim() || '';
    // Allow local-dev override: SALESFORCE_OAUTH_REDIRECT_URI takes precedence over DB when set.
    const redirectUri = process.env.SALESFORCE_OAUTH_REDIRECT_URI?.trim() || dbRedirectUri;
    const loginUrl = normalizeLoginUrl(row.login_url);
    const scopes = normalizeScopes(row.scopes);

    return {
      clientIdConfigured: Boolean(clientId),
      clientSecretConfigured: Boolean(secretEncrypted),
      redirectUriConfigured: Boolean(redirectUri),
      loginUrlConfigured: Boolean(loginUrl),
      configured: Boolean(clientId && secretEncrypted && redirectUri),
      clientId,
      clientSecret: secretEncrypted ? decryptToken(secretEncrypted) : undefined,
      redirectUri,
      loginUrl,
      scopes,
      source: 'database',
      updatedAt: row.updated_at || null,
    };
  }

  const envClientId = process.env.SALESFORCE_OAUTH_CLIENT_ID?.trim() || '';
  const envClientSecret = process.env.SALESFORCE_OAUTH_CLIENT_SECRET?.trim() || '';
  const envRedirectUri = process.env.SALESFORCE_OAUTH_REDIRECT_URI?.trim() || '';
  const envLoginUrl = normalizeLoginUrl(process.env.SALESFORCE_LOGIN_URL);

  if (envClientId || envClientSecret || envRedirectUri) {
    return {
      clientIdConfigured: Boolean(envClientId),
      clientSecretConfigured: Boolean(envClientSecret),
      redirectUriConfigured: Boolean(envRedirectUri),
      loginUrlConfigured: Boolean(envLoginUrl),
      configured: Boolean(envClientId && envClientSecret && envRedirectUri),
      clientId: envClientId,
      clientSecret: envClientSecret || undefined,
      redirectUri: envRedirectUri,
      loginUrl: envLoginUrl,
      scopes: [...DEFAULT_SCOPES],
      source: 'env',
      updatedAt: null,
    };
  }

  return {
    clientIdConfigured: false,
    clientSecretConfigured: false,
    redirectUriConfigured: false,
    loginUrlConfigured: true,
    configured: false,
    clientId: '',
    redirectUri: '',
    loginUrl: DEFAULT_LOGIN_URL,
    scopes: [...DEFAULT_SCOPES],
    source: 'none',
    updatedAt: null,
  };
}

export function toSafeConfigResponse(config: OAuthConfigStatus): OAuthConfigSafeResponse {
  return {
    configured: config.configured,
    clientIdConfigured: config.clientIdConfigured,
    clientSecretConfigured: config.clientSecretConfigured,
    loginUrl: config.loginUrl,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    callbackUrl: config.redirectUri,
    updatedAt: config.updatedAt,
  };
}

export async function saveOAuthConfig(input: {
  clientId: string;
  clientSecret?: string;
  loginUrl?: string;
  redirectUri: string;
  scopes?: string[];
}): Promise<void> {
  const current = await getOAuthConfigStatus();
  const clientId = input.clientId.trim();
  const redirectUri = input.redirectUri.trim();
  const loginUrl = normalizeLoginUrl(input.loginUrl || current.loginUrl || DEFAULT_LOGIN_URL);
  const scopes = normalizeScopes(input.scopes);

  const incomingSecret = (input.clientSecret || '').trim();
  const hasExistingSecret = current.clientSecretConfigured;

  if (!clientId) throw new Error('CLIENT_ID_REQUIRED');
  if (!redirectUri) throw new Error('REDIRECT_URI_REQUIRED');
  if (!incomingSecret && !hasExistingSecret) throw new Error('CLIENT_SECRET_REQUIRED');

  const encryptedSecret = incomingSecret
    ? encryptToken(incomingSecret)
    : (await getEncryptedClientSecretOrThrow());

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('connector_oauth_configs')
    .upsert(
      {
        provider: SALESFORCE_PROVIDER,
        client_id: clientId,
        encrypted_client_secret: encryptedSecret,
        login_url: loginUrl,
        redirect_uri: redirectUri,
        scopes,
        status: 'configured',
      },
      { onConflict: 'provider' }
    );

  if (error) throw new Error('SAVE_OAUTH_CONFIG_FAILED');
}

async function getEncryptedClientSecretOrThrow(): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('connector_oauth_configs')
    .select('encrypted_client_secret')
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (error) throw new Error('READ_OAUTH_CONFIG_FAILED');
  const value = (data as { encrypted_client_secret?: string | null } | null)?.encrypted_client_secret?.trim();
  if (!value) throw new Error('CLIENT_SECRET_REQUIRED');
  return value;
}

export function buildAuthorizeUrl(config: OAuthConfigStatus, state: string, forceLogin = false): string {
  const url = new URL(`${config.loginUrl}/services/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scopes.join(' '));
  url.searchParams.set('state', state);
  if (forceLogin) url.searchParams.set('prompt', 'login');
  return url.toString();
}

export function resolveSalesforceAppOrigin(redirectUri: string | null | undefined): string {
  const fallback = 'http://localhost:3053';

  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      const origin = new URL(appUrl).origin;
      if (origin && origin !== 'null') return origin;
    } catch { /* fall through */ }
  }

  const raw = (redirectUri || '').trim();
  if (!raw) return fallback;

  try {
    const origin = new URL(raw).origin;
    if (origin === 'http://0.0.0.0:3053') return fallback;
    return origin;
  } catch {
    return fallback;
  }
}

export async function exchangeAuthorizationCode(code: string, config: OAuthConfigStatus): Promise<OAuthTokenPayload> {
  if (!config.clientSecret) throw new Error('CLIENT_SECRET_REQUIRED');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const tokenRes = await fetch(`${config.loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!tokenRes.ok) throw new Error('TOKEN_EXCHANGE_FAILED');
  return (await tokenRes.json()) as OAuthTokenPayload;
}

export async function refreshAccessToken(refreshToken: string, config: OAuthConfigStatus): Promise<OAuthTokenPayload> {
  if (!config.clientSecret) throw new Error('CLIENT_SECRET_REQUIRED');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const tokenRes = await fetch(`${config.loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!tokenRes.ok) throw new Error('TOKEN_REFRESH_FAILED');
  return (await tokenRes.json()) as OAuthTokenPayload;
}

export async function fetchAccountDescribe(instanceUrl: string, accessToken: string, apiVersion = DEFAULT_API_VERSION): Promise<{ accountLabel: string; accountFieldsCount: number }> {
  const res = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/describe`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = new Error('ACCOUNT_DESCRIBE_FAILED');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const payload = (await res.json()) as SalesforceDescribeResponse;
  return {
    accountLabel: payload.label || 'Account',
    accountFieldsCount: Array.isArray(payload.fields) ? payload.fields.length : 0,
  };
}

export async function upsertOAuthConnectionFromTokenPayload(payload: OAuthTokenPayload, apiVersion = DEFAULT_API_VERSION): Promise<void> {
  const accessToken = payload.access_token?.trim() || '';
  const refreshToken = payload.refresh_token?.trim() || '';
  const instanceUrl = payload.instance_url?.trim() || '';

  if (!accessToken || !instanceUrl || !refreshToken) {
    throw new Error('OAUTH_PAYLOAD_INCOMPLETE');
  }

  const describe = await fetchAccountDescribe(instanceUrl, accessToken, apiVersion);
  const identity = parseIdentityUrl(payload.id);
  const nowIso = new Date().toISOString();

  const row: ConnectionRow = {
    provider: SALESFORCE_PROVIDER,
    status: 'connected',
    instance_url: instanceUrl,
    org_id: identity.orgId,
    user_id: identity.userId,
    scopes: parseScopes(payload.scope),
    token_type: payload.token_type || 'Bearer',
    access_token_encrypted: encryptToken(accessToken),
    refresh_token_encrypted: encryptToken(refreshToken),
    access_token_issued_at: payload.issued_at ? new Date(Number(payload.issued_at)).toISOString() : nowIso,
    access_token_expires_at: null,
    last_health_check_at: nowIso,
    account_label: describe.accountLabel,
    account_fields_count: describe.accountFieldsCount,
    api_version: apiVersion,
    error_message: null,
  };

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('connector_oauth_connections')
    .upsert(row, { onConflict: 'provider' });

  if (error) throw new Error('PERSISTENCE_FAILED');
}

export async function getOAuthConnection(): Promise<ConnectionRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('connector_oauth_connections')
    .select('*')
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (error) throw new Error('READ_CONNECTION_FAILED');
  return data as ConnectionRow | null;
}

export async function deleteOAuthConnection(): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('connector_oauth_connections')
    .delete()
    .eq('provider', SALESFORCE_PROVIDER);

  if (error) throw new Error('DELETE_CONNECTION_FAILED');
}

export async function updateOAuthConnectionPatch(patch: Partial<ConnectionRow>): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('connector_oauth_connections')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('provider', SALESFORCE_PROVIDER);

  if (error) throw new Error('UPDATE_CONNECTION_FAILED');
}

export function toSafeStatus(config: OAuthConfigStatus, row: ConnectionRow | null): OAuthSafeStatus {
  if (!config.configured) {
    return {
      configured: false,
      connected: false,
      status: 'requires_configuration',
      instanceUrl: null,
      orgId: null,
      userId: null,
      scopes: config.scopes,
      lastHealthCheckAt: null,
      accountLabel: null,
      accountFieldsCount: null,
      apiVersion: DEFAULT_API_VERSION,
      error: null,
      configChecklist: {
        clientId: config.clientIdConfigured,
        clientSecret: config.clientSecretConfigured,
        redirectUri: config.redirectUriConfigured,
        loginUrl: config.loginUrlConfigured,
      },
    };
  }

  if (!row) {
    return {
      configured: true,
      connected: false,
      status: 'disconnected',
      instanceUrl: null,
      orgId: null,
      userId: null,
      scopes: config.scopes,
      lastHealthCheckAt: null,
      accountLabel: null,
      accountFieldsCount: null,
      apiVersion: DEFAULT_API_VERSION,
      error: null,
      configChecklist: {
        clientId: true,
        clientSecret: true,
        redirectUri: true,
        loginUrl: true,
      },
    };
  }

  return {
    configured: true,
    connected: row.status === 'connected',
    status: row.status,
    instanceUrl: row.instance_url,
    orgId: row.org_id,
    userId: row.user_id,
    scopes: row.scopes || config.scopes,
    lastHealthCheckAt: row.last_health_check_at,
    accountLabel: row.account_label,
    accountFieldsCount: row.account_fields_count,
    apiVersion: row.api_version || DEFAULT_API_VERSION,
    error: row.error_message,
    configChecklist: {
      clientId: true,
      clientSecret: true,
      redirectUri: true,
      loginUrl: true,
    },
  };
}

export async function validateConnectionHealth(): Promise<OAuthSafeStatus> {
  const config = await getOAuthConfigStatus();
  if (!config.configured) return toSafeStatus(config, null);

  const row = await getOAuthConnection();
  if (!row) return toSafeStatus(config, null);

  let accessToken = decryptToken(row.access_token_encrypted);
  const refreshToken = decryptToken(row.refresh_token_encrypted);
  let instanceUrl = row.instance_url || '';

  try {
    const described = await fetchAccountDescribe(instanceUrl, accessToken, row.api_version || DEFAULT_API_VERSION);
    await updateOAuthConnectionPatch({
      status: 'connected',
      instance_url: instanceUrl,
      account_label: described.accountLabel,
      account_fields_count: described.accountFieldsCount,
      api_version: row.api_version || DEFAULT_API_VERSION,
      last_health_check_at: new Date().toISOString(),
      error_message: null,
    });
    const fresh = await getOAuthConnection();
    return toSafeStatus(config, fresh);
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    if ((status === 401 || status === 403) && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken, config);
      accessToken = refreshed.access_token?.trim() || '';
      if (!accessToken) throw new Error('TOKEN_REFRESH_EMPTY');

      if (refreshed.instance_url?.trim()) instanceUrl = refreshed.instance_url.trim();

      const described = await fetchAccountDescribe(instanceUrl, accessToken, row.api_version || DEFAULT_API_VERSION);
      await updateOAuthConnectionPatch({
        status: 'connected',
        instance_url: instanceUrl,
        access_token_encrypted: encryptToken(accessToken),
        access_token_issued_at: refreshed.issued_at ? new Date(Number(refreshed.issued_at)).toISOString() : new Date().toISOString(),
        scopes: refreshed.scope ? parseScopes(refreshed.scope) : row.scopes,
        account_label: described.accountLabel,
        account_fields_count: described.accountFieldsCount,
        api_version: row.api_version || DEFAULT_API_VERSION,
        last_health_check_at: new Date().toISOString(),
        error_message: null,
      });
      const fresh = await getOAuthConnection();
      return toSafeStatus(config, fresh);
    }

    await updateOAuthConnectionPatch({
      status: 'error',
      last_health_check_at: new Date().toISOString(),
      error_message: 'Não foi possível validar Account/describe com OAuth no momento.',
    });

    const fresh = await getOAuthConnection();
    return toSafeStatus(config, fresh);
  }
}

export async function fetchObjectDescribe(
  instanceUrl: string,
  accessToken: string,
  objectApiName: string,
  apiVersion = DEFAULT_API_VERSION,
): Promise<SalesforceObjectDiscovery> {
  const recommended = RECOMMENDED_FIELDS[objectApiName] || [];
  const empty = (status: SalesforceObjectStatus, message: string): SalesforceObjectDiscovery => ({
    objectApiName,
    label: objectApiName,
    status,
    readable: false,
    fieldCount: 0,
    fields: [],
    recommendedFields: [],
    missingRecommendedFields: recommended,
    message,
  });

  try {
    const res = await fetch(
      `${instanceUrl}/services/data/${apiVersion}/sobjects/${objectApiName}/describe`,
      {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (res.status === 401 || res.status === 403) {
      return empty('no_permission', 'Sem permissão de leitura para este objeto.');
    }
    if (res.status === 404) {
      return empty('unavailable', 'Objeto não encontrado nesta organização.');
    }
    if (!res.ok) {
      return empty('unavailable', 'Objeto indisponível no momento.');
    }

    const payload = (await res.json()) as SalesforceDescribeFullResponse;
    const rawFields = Array.isArray(payload.fields) ? payload.fields : [];

    const fields: SalesforceFieldMeta[] = rawFields
      .filter((f) => Boolean(f.name))
      .map((f) => ({
        name: f.name!,
        label: f.label || f.name!,
        type: f.type || 'unknown',
        nillable: f.nillable ?? true,
        updateable: f.updateable ?? false,
        createable: f.createable ?? false,
        calculated: f.calculated ?? false,
      }));

    const fieldNameSet = new Set(fields.map((f) => f.name));
    const recommendedFields = fields.filter((f) => recommended.includes(f.name));
    const missingRecommendedFields = recommended.filter((name) => !fieldNameSet.has(name));

    return {
      objectApiName,
      label: payload.label || objectApiName,
      status: 'available',
      readable: true,
      fieldCount: fields.length,
      fields,
      recommendedFields,
      missingRecommendedFields,
    };
  } catch {
    return empty('error', 'Erro inesperado ao consultar metadados.');
  }
}

export async function fetchMultiObjectDiscovery(
  instanceUrl: string,
  accessToken: string,
  apiVersion = DEFAULT_API_VERSION,
): Promise<SalesforceObjectDiscovery[]> {
  const objects = ['Account', 'Contact', 'Opportunity', 'Lead', 'Campaign'];
  const results = await Promise.allSettled(
    objects.map((obj) => fetchObjectDescribe(instanceUrl, accessToken, obj, apiVersion)),
  );
  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      objectApiName: objects[i],
      label: objects[i],
      status: 'error' as SalesforceObjectStatus,
      readable: false,
      fieldCount: 0,
      fields: [],
      recommendedFields: [],
      missingRecommendedFields: RECOMMENDED_FIELDS[objects[i]] || [],
      message: 'Erro inesperado.',
    };
  });
}

async function queryAccountsPreview(
  instanceUrl: string,
  accessToken: string,
  apiVersion: string,
  limit: number,
): Promise<SalesforceAccountPreviewResult> {
  const fields = ACCOUNT_PREVIEW_FIELDS.join(', ');
  const soql = `SELECT ${fields} FROM Account ORDER BY LastModifiedDate DESC LIMIT ${limit}`;
  const queryUrl = new URL(`${instanceUrl}/services/data/${apiVersion}/query`);
  queryUrl.searchParams.set('q', soql);

  const res = await fetch(queryUrl.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    const err = new Error('ACCOUNT_QUERY_UNAUTHORIZED');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  if (!res.ok) {
    const err = new Error('ACCOUNT_QUERY_FAILED');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const payload = (await res.json().catch(() => null)) as {
    totalSize?: number;
    done?: boolean;
    records?: Array<Record<string, unknown>>;
  } | null;

  const records = Array.isArray(payload?.records)
    ? payload.records.map((record) => ({
        Id: typeof record.Id === 'string' ? record.Id : null,
        Name: typeof record.Name === 'string' ? record.Name : null,
        Website: typeof record.Website === 'string' ? record.Website : null,
        Industry: typeof record.Industry === 'string' ? record.Industry : null,
        Type: typeof record.Type === 'string' ? record.Type : null,
        OwnerId: typeof record.OwnerId === 'string' ? record.OwnerId : null,
        CreatedDate: typeof record.CreatedDate === 'string' ? record.CreatedDate : null,
        LastModifiedDate: typeof record.LastModifiedDate === 'string' ? record.LastModifiedDate : null,
      }))
    : [];

  return {
    records,
    totalSize: typeof payload?.totalSize === 'number' ? payload.totalSize : records.length,
    done: payload?.done === true,
    limit,
    apiVersion,
    instanceUrl,
    accountLabel: 'Account',
    testedAt: new Date().toISOString(),
  };
}

export async function fetchAccountsPreview(limitInput = DEFAULT_ACCOUNTS_PREVIEW_LIMIT): Promise<SalesforceAccountPreviewResult> {
  const config = await getOAuthConfigStatus();
  if (!config.configured) throw new Error('NOT_CONFIGURED');

  const row = await getOAuthConnection();
  if (!row || row.status !== 'connected') throw new Error('NOT_CONNECTED');

  const limit = normalizeAccountsPreviewLimit(limitInput);
  let accessToken = decryptToken(row.access_token_encrypted);
  const refreshToken = decryptToken(row.refresh_token_encrypted);
  let instanceUrl = row.instance_url || '';
  const apiVersion = row.api_version || DEFAULT_API_VERSION;

  try {
    return await queryAccountsPreview(instanceUrl, accessToken, apiVersion, limit);
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    if ((status === 401 || status === 403) && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken, config);
      accessToken = refreshed.access_token?.trim() || '';
      if (!accessToken) throw new Error('TOKEN_REFRESH_EMPTY');

      if (refreshed.instance_url?.trim()) {
        instanceUrl = refreshed.instance_url.trim();
      }

      await updateOAuthConnectionPatch({
        status: 'connected',
        instance_url: instanceUrl,
        access_token_encrypted: encryptToken(accessToken),
        access_token_issued_at: refreshed.issued_at ? new Date(Number(refreshed.issued_at)).toISOString() : new Date().toISOString(),
        scopes: refreshed.scope ? parseScopes(refreshed.scope) : row.scopes,
        last_health_check_at: new Date().toISOString(),
        error_message: null,
      });

      return await queryAccountsPreview(instanceUrl, accessToken, apiVersion, limit);
    }

    throw error;
  }
}

// ─── Multi-entity preview ───────────────────────────────────────────────────

export const PREVIEW_ALLOWLIST: Record<string, string[]> = {
  Account: ['Id', 'Name', 'Website', 'Industry', 'Type', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Contact: ['Id', 'AccountId', 'Name', 'Email', 'Title', 'Department', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Opportunity: ['Id', 'AccountId', 'Name', 'StageName', 'Amount', 'CloseDate', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  OpportunityContactRole: ['Id', 'OpportunityId', 'ContactId', 'Role', 'IsPrimary', 'CreatedDate', 'LastModifiedDate'],
  Lead: ['Id', 'Company', 'Name', 'Email', 'Status', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
  Campaign: ['Id', 'Name', 'Type', 'Status', 'StartDate', 'EndDate', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
};

const DEFAULT_OBJECTS_PREVIEW_LIMIT = 5;
const MAX_OBJECTS_PREVIEW_LIMIT = 10;

export type SalesforceObjectPreviewValue = string | number | boolean | null;

export interface SalesforceObjectPreviewResult {
  objectApiName: string;
  label: string;
  limit: number;
  totalSize: number;
  fields: string[];
  records: Record<string, SalesforceObjectPreviewValue>[];
  status: 'success' | 'error';
  error: string | null;
  testedAt: string;
  needsRefresh?: boolean;
}

export function normalizeObjectsPreviewLimit(rawLimit: number | string | null | undefined): number {
  const parsed = typeof rawLimit === 'string' ? Number(rawLimit) : rawLimit;
  if (!Number.isFinite(parsed as number)) return DEFAULT_OBJECTS_PREVIEW_LIMIT;
  const limit = Math.trunc(Number(parsed));
  if (limit <= 0) return DEFAULT_OBJECTS_PREVIEW_LIMIT;
  return Math.min(limit, MAX_OBJECTS_PREVIEW_LIMIT);
}

async function queryObjectPreview(
  instanceUrl: string,
  accessToken: string,
  objectApiName: string,
  apiVersion: string,
  limit: number,
): Promise<SalesforceObjectPreviewResult> {
  const fields = PREVIEW_ALLOWLIST[objectApiName] || [];
  if (!fields.length) {
    return {
      objectApiName,
      label: objectApiName,
      limit,
      totalSize: 0,
      fields: [],
      records: [],
      status: 'error',
      error: 'Objeto não está na lista permitida de preview.',
      testedAt: new Date().toISOString(),
      needsRefresh: false,
    };
  }

  const soql = `SELECT ${fields.join(', ')} FROM ${objectApiName} ORDER BY LastModifiedDate DESC LIMIT ${limit}`;
  const queryUrl = new URL(`${instanceUrl}/services/data/${apiVersion}/query`);
  queryUrl.searchParams.set('q', soql);

  try {
    const res = await fetch(queryUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (res.status === 401 || res.status === 403) {
      return {
        objectApiName,
        label: objectApiName,
        limit,
        totalSize: 0,
        fields,
        records: [],
        status: 'error',
        error: 'Sem permissão de leitura para este objeto.',
        testedAt: new Date().toISOString(),
        needsRefresh: true,
      };
    }

    if (!res.ok) {
      return {
        objectApiName,
        label: objectApiName,
        limit,
        totalSize: 0,
        fields,
      records: [],
      status: 'error',
      error: 'Não foi possível carregar o preview deste objeto.',
      testedAt: new Date().toISOString(),
      needsRefresh: false,
    };
    }

    const payload = (await res.json().catch(() => null)) as {
      totalSize?: number;
      done?: boolean;
      records?: Array<Record<string, unknown>>;
    } | null;

    const records = Array.isArray(payload?.records)
      ? payload.records.map((raw) => {
          const record: Record<string, SalesforceObjectPreviewValue> = {};
          for (const field of fields) {
            const v = raw[field];
            if (v === null || v === undefined) {
              record[field] = null;
            } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
              record[field] = v;
            } else {
              record[field] = String(v);
            }
          }
          return record;
        })
      : [];

    return {
      objectApiName,
      label: objectApiName,
      limit,
      totalSize: typeof payload?.totalSize === 'number' ? payload.totalSize : records.length,
      fields,
      records,
      status: 'success',
      error: null,
      testedAt: new Date().toISOString(),
    };
  } catch {
    return {
      objectApiName,
      label: objectApiName,
      limit,
      totalSize: 0,
      fields,
      records: [],
      status: 'error',
      error: 'Erro inesperado ao carregar preview deste objeto.',
      testedAt: new Date().toISOString(),
      needsRefresh: false,
    };
  }
}

export async function fetchObjectsPreview(
  objectApiNames: string[],
  limitInput: number | string | null | undefined = DEFAULT_OBJECTS_PREVIEW_LIMIT,
): Promise<SalesforceObjectPreviewResult[]> {
  const config = await getOAuthConfigStatus();
  if (!config.configured) throw new Error('NOT_CONFIGURED');

  const row = await getOAuthConnection();
  if (!row || row.status !== 'connected') throw new Error('NOT_CONNECTED');

  const allowedObjects = objectApiNames.filter((o) => Boolean(PREVIEW_ALLOWLIST[o]));
  if (!allowedObjects.length) throw new Error('NO_ALLOWED_OBJECTS');

  const limit = normalizeObjectsPreviewLimit(limitInput);
  let accessToken = decryptToken(row.access_token_encrypted);
  const refreshToken = decryptToken(row.refresh_token_encrypted);
  let instanceUrl = row.instance_url || '';
  const apiVersion = row.api_version || DEFAULT_API_VERSION;

  const runAll = (token: string, url: string) =>
    Promise.all(allowedObjects.map((obj) => queryObjectPreview(url, token, obj, apiVersion, limit)));

  const firstPass = await runAll(accessToken, instanceUrl);
  const shouldRefresh = firstPass.some((result) => result.needsRefresh === true);

  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, config);
    accessToken = refreshed.access_token?.trim() || '';
    if (!accessToken) throw new Error('TOKEN_REFRESH_EMPTY');
    if (refreshed.instance_url?.trim()) instanceUrl = refreshed.instance_url.trim();

    await updateOAuthConnectionPatch({
      status: 'connected',
      instance_url: instanceUrl,
      access_token_encrypted: encryptToken(accessToken),
      access_token_issued_at: refreshed.issued_at
        ? new Date(Number(refreshed.issued_at)).toISOString()
        : new Date().toISOString(),
      scopes: refreshed.scope ? parseScopes(refreshed.scope) : row.scopes,
      last_health_check_at: new Date().toISOString(),
      error_message: null,
    });

    return await runAll(accessToken, instanceUrl);
  }

  return firstPass;
}

// ─── Dry-run ─────────────────────────────────────────────────────────────────

const DRY_RUN_MAX_RECORDS_PER_ENTITY = 50;

export interface DryRunRecord {
  id: string;
  displayName: string;
  status: 'valid' | 'missing' | 'permission-error' | 'other-error';
  reason?: string;
}

export interface DryRunEntityResult {
  objectApiName: string;
  label: string;
  selectedCount: number;
  validCount: number;
  missingCount: number;
  permissionErrorCount: number;
  otherErrorCount: number;
  records: DryRunRecord[];
}

export interface DryRunSummary {
  totalChecked: number;
  totalValid: number;
  totalMissing: number;
  totalPermissionError: number;
  totalOtherError: number;
  estimatedRecordsCanSync: number;
  estimatedRecordsWillFail: number;
}

export interface DryRunResult {
  status: 'success' | 'error';
  dryRunAt: string;
  executionTimeMs: number;
  results: DryRunEntityResult[];
  summary: DryRunSummary;
}

export interface DryRunContractInput {
  source: string;
  mode: string;
  entities: {
    objectApiName: string;
    label?: string;
    selectedRecords: {
      id: string;
      displayName?: string;
    }[];
  }[];
}

async function queryRecordExists(
  instanceUrl: string,
  accessToken: string,
  objectApiName: string,
  id: string,
  apiVersion: string,
): Promise<{ status: DryRunRecord['status']; needsRefresh: boolean }> {
  const soql = `SELECT Id FROM ${objectApiName} WHERE Id = '${id.replace(/'/g, '')}' LIMIT 1`;
  const queryUrl = new URL(`${instanceUrl}/services/data/${apiVersion}/query`);
  queryUrl.searchParams.set('q', soql);

  try {
    const res = await fetch(queryUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (res.status === 401 || res.status === 403) {
      return { status: 'permission-error', needsRefresh: true };
    }

    if (!res.ok) {
      return { status: 'other-error', needsRefresh: false };
    }

    const payload = (await res.json().catch(() => null)) as { totalSize?: number; records?: unknown[] } | null;
    const count = typeof payload?.totalSize === 'number' ? payload.totalSize : (Array.isArray(payload?.records) ? payload.records.length : 0);
    return { status: count > 0 ? 'valid' : 'missing', needsRefresh: false };
  } catch {
    return { status: 'other-error', needsRefresh: false };
  }
}

export async function dryRunMultiEntityContract(contract: DryRunContractInput): Promise<DryRunResult> {
  const startMs = Date.now();
  const dryRunAt = new Date().toISOString();

  const config = await getOAuthConfigStatus();
  if (!config.configured) throw new Error('NOT_CONFIGURED');

  const row = await getOAuthConnection();
  if (!row || row.status !== 'connected') throw new Error('NOT_CONNECTED');

  let accessToken = decryptToken(row.access_token_encrypted);
  const refreshToken = decryptToken(row.refresh_token_encrypted);
  let instanceUrl = row.instance_url || '';
  const apiVersion = row.api_version || DEFAULT_API_VERSION;

  const validEntities = contract.entities.filter((e) => Boolean(PREVIEW_ALLOWLIST[e.objectApiName]));

  async function runForEntity(
    entity: DryRunContractInput['entities'][number],
    token: string,
    url: string,
  ) {
    const limited = entity.selectedRecords.slice(0, DRY_RUN_MAX_RECORDS_PER_ENTITY);
    const records = await Promise.all(
      limited.map(async (rec) => {
        const r = await queryRecordExists(url, token, entity.objectApiName, rec.id, apiVersion);
        return { id: rec.id, displayName: rec.displayName ?? rec.id, ...r };
      }),
    );
    return { entity, records };
  }

  const firstPass = await Promise.all(validEntities.map((e) => runForEntity(e, accessToken, instanceUrl)));
  const shouldRefresh = firstPass.some((p) => p.records.some((r) => r.needsRefresh));

  let finalPass = firstPass;
  if (shouldRefresh && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken, config);
    accessToken = refreshed.access_token?.trim() || '';
    if (!accessToken) throw new Error('TOKEN_REFRESH_EMPTY');
    if (refreshed.instance_url?.trim()) instanceUrl = refreshed.instance_url.trim();

    await updateOAuthConnectionPatch({
      status: 'connected',
      instance_url: instanceUrl,
      access_token_encrypted: encryptToken(accessToken),
      access_token_issued_at: refreshed.issued_at
        ? new Date(Number(refreshed.issued_at)).toISOString()
        : new Date().toISOString(),
      scopes: refreshed.scope ? parseScopes(refreshed.scope) : row.scopes,
      last_health_check_at: new Date().toISOString(),
      error_message: null,
    });

    finalPass = await Promise.all(validEntities.map((e) => runForEntity(e, accessToken, instanceUrl)));
  }

  const results: DryRunEntityResult[] = finalPass.map(({ entity, records }) => {
    let valid = 0, missing = 0, permErr = 0, other = 0;
    const mapped: DryRunRecord[] = records.map((r) => {
      if (r.status === 'valid') valid++;
      else if (r.status === 'missing') missing++;
      else if (r.status === 'permission-error') permErr++;
      else other++;
      return { id: r.id, displayName: r.displayName, status: r.status };
    });
    return {
      objectApiName: entity.objectApiName,
      label: entity.label ?? entity.objectApiName,
      selectedCount: mapped.length,
      validCount: valid,
      missingCount: missing,
      permissionErrorCount: permErr,
      otherErrorCount: other,
      records: mapped,
    };
  });

  const totalValid = results.reduce((s, e) => s + e.validCount, 0);
  const totalMissing = results.reduce((s, e) => s + e.missingCount, 0);
  const totalPermErr = results.reduce((s, e) => s + e.permissionErrorCount, 0);
  const totalOther = results.reduce((s, e) => s + e.otherErrorCount, 0);
  const totalChecked = results.reduce((s, e) => s + e.selectedCount, 0);

  return {
    status: 'success',
    dryRunAt,
    executionTimeMs: Date.now() - startMs,
    results,
    summary: {
      totalChecked,
      totalValid,
      totalMissing,
      totalPermissionError: totalPermErr,
      totalOtherError: totalOther,
      estimatedRecordsCanSync: totalValid,
      estimatedRecordsWillFail: totalMissing + totalPermErr + totalOther,
    },
  };
}

// ─── Sync Contract ───────────────────────────────────────────────────────────

export type SyncContractStatus = 'pending' | 'mapped' | 'synced' | 'cancelled';

export interface SyncContractSavedResult {
  id: string;
  provider: string;
  status: SyncContractStatus;
  createdAt: string;
  estimatedRecordsCanSync: number;
}

export async function saveSalesforceSyncContract(
  contractJson: unknown,
  dryRunSummaryJson: unknown,
): Promise<SyncContractSavedResult> {
  if (
    typeof contractJson !== 'object' ||
    contractJson === null ||
    !('entities' in contractJson) ||
    !Array.isArray((contractJson as { entities: unknown }).entities) ||
    (contractJson as { entities: unknown[] }).entities.length === 0
  ) {
    throw new Error('CONTRACT_EMPTY');
  }

  if (
    typeof dryRunSummaryJson !== 'object' ||
    dryRunSummaryJson === null ||
    !('estimatedRecordsCanSync' in dryRunSummaryJson)
  ) {
    throw new Error('DRY_RUN_SUMMARY_INVALID');
  }

  const estimatedRecordsCanSync =
    typeof (dryRunSummaryJson as { estimatedRecordsCanSync: unknown }).estimatedRecordsCanSync === 'number'
      ? (dryRunSummaryJson as { estimatedRecordsCanSync: number }).estimatedRecordsCanSync
      : 0;

  if (estimatedRecordsCanSync <= 0) {
    throw new Error('NO_RECORDS_CAN_SYNC');
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('salesforce_sync_contracts')
    .insert({
      provider: SALESFORCE_PROVIDER,
      status: 'pending',
      contract_json: contractJson,
      dry_run_summary: dryRunSummaryJson,
    })
    .select('id, provider, status, created_at')
    .single();

  if (error || !data) throw new Error('SAVE_SYNC_CONTRACT_FAILED');

  const row = data as { id: string; provider: string; status: string; created_at: string };

  return {
    id: row.id,
    provider: row.provider,
    status: row.status as SyncContractStatus,
    createdAt: row.created_at,
    estimatedRecordsCanSync,
  };
}

// ─── Canonical Mapping (C4.5) ─────────────────────────────────────────────────

export interface SalesforceAccountCanonicalFieldMap {
  source_external_id: string;
  nome: string;
  dominio: string;
  segmento: string;
  tipo: string;
  [key: string]: string;
}

export interface SalesforceAccountDedupeRule {
  priority: string[];
  domainSourceField: string;
  preserveCanopiId: boolean;
  neverOverwrite: string[];
}

export interface SalesforceAccountCanonicalMapping {
  entity: 'Account';
  sourceObjectApiName: 'Account';
  fieldMap: SalesforceAccountCanonicalFieldMap;
  dedupeRule: SalesforceAccountDedupeRule;
  sourceExternalIdField: string;
  canonicalDedupeField: string;
  updatedAt: string;
}

export interface SyncContractFullResult {
  id: string;
  provider: string;
  status: SyncContractStatus;
  createdAt: string;
  contractJson: unknown;
  dryRunSummary: unknown;
  estimatedRecordsCanSync: number;
}

export interface AccountMappingSavedResult {
  id: string;
  provider: string;
  status: SyncContractStatus;
  mappedEntity: 'Account';
  updatedAt: string;
}

export interface SalesforceSyncPreviewItem {
  sourceExternalId: string;
  sourceDisplayName: string;
  canonicalFields: {
    nome: string;
    dominio: string;
    segmento: string;
    tipo: string;
  };
  currentCanopiValue?: {
    nome?: string;
    dominio?: string;
    segmento?: string;
    tipoEstrategico?: string;
  };
  actionPreview: 'create' | 'update' | 'no_change' | 'warning';
  warnings: string[];
}

export interface SalesforceSyncPreviewResult {
  contractId: string;
  entity: 'Account';
  items: SalesforceSyncPreviewItem[];
  summary: {
    total: number;
    toCreate: number;
    toUpdate: number;
    noChange: number;
    warnings: number;
  };
}

export const DEFAULT_ACCOUNT_FIELD_MAP: SalesforceAccountCanonicalFieldMap = {
  source_external_id: 'Id',
  nome: 'Name',
  dominio: 'Website',
  segmento: 'Industry',
  tipo: 'Type',
};

export const DEFAULT_ACCOUNT_DEDUPE_RULE: SalesforceAccountDedupeRule = {
  priority: ['source_external_id', 'domain_match'],
  domainSourceField: 'Website',
  preserveCanopiId: true,
  neverOverwrite: ['id', 'tipoEstrategico', 'playAtivo', 'scoring'],
};

export async function getLatestPendingSalesforceSyncContract(): Promise<SyncContractFullResult | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, created_at, contract_json, dry_run_summary')
    .eq('provider', SALESFORCE_PROVIDER)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!data) return null;

  const row = data as {
    id: string;
    provider: string;
    status: string;
    created_at: string;
    contract_json: unknown;
    dry_run_summary: unknown;
  };

  const dryRun = row.dry_run_summary as { estimatedRecordsCanSync?: number } | null;
  const estimatedRecordsCanSync =
    typeof dryRun?.estimatedRecordsCanSync === 'number' ? dryRun.estimatedRecordsCanSync : 0;

  return {
    id: row.id,
    provider: row.provider,
    status: row.status as SyncContractStatus,
    createdAt: row.created_at,
    contractJson: row.contract_json,
    dryRunSummary: row.dry_run_summary,
    estimatedRecordsCanSync,
  };
}

export async function getLatestMappedSalesforceSyncContract(): Promise<SyncContractFullResult | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, created_at, contract_json, dry_run_summary')
    .eq('provider', SALESFORCE_PROVIDER)
    .eq('status', 'mapped')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!data) return null;

  const row = data as {
    id: string;
    provider: string;
    status: string;
    created_at: string;
    contract_json: unknown;
    dry_run_summary: unknown;
  };

  const dryRun = row.dry_run_summary as { estimatedRecordsCanSync?: number } | null;
  const estimatedRecordsCanSync =
    typeof dryRun?.estimatedRecordsCanSync === 'number' ? dryRun.estimatedRecordsCanSync : 0;

  return {
    id: row.id,
    provider: row.provider,
    status: row.status as SyncContractStatus,
    createdAt: row.created_at,
    contractJson: row.contract_json,
    dryRunSummary: row.dry_run_summary,
    estimatedRecordsCanSync,
  };
}

export async function saveSalesforceAccountCanonicalMapping(
  contractId: string,
  mapping: Partial<SalesforceAccountCanonicalMapping>,
): Promise<AccountMappingSavedResult> {
  if (!contractId || typeof contractId !== 'string' || !contractId.trim()) {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  if (typeof mapping !== 'object' || mapping === null) {
    throw new Error('MAPPING_INVALID');
  }

  if (!mapping.fieldMap || typeof mapping.fieldMap !== 'object') {
    throw new Error('MAPPING_FIELD_MAP_REQUIRED');
  }

  const requiredCanonicalFields = ['source_external_id', 'nome', 'dominio'];
  for (const field of requiredCanonicalFields) {
    if (!mapping.fieldMap[field] || typeof mapping.fieldMap[field] !== 'string') {
      throw new Error(`MAPPING_MISSING_FIELD_${field.toUpperCase()}`);
    }
  }

  const supabase = getSupabaseAdminClient();

  // Busca contrato existente para mesclar contract_json
  const { data: existing, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, contract_json, status')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!existing) throw new Error('CONTRACT_NOT_FOUND');

  const existingRow = existing as { id: string; contract_json: unknown; status: string };
  if (existingRow.status === 'synced' || existingRow.status === 'cancelled') {
    throw new Error('CONTRACT_STATUS_IMMUTABLE');
  }

  const canonicalMapping: SalesforceAccountCanonicalMapping = {
    entity: 'Account',
    sourceObjectApiName: 'Account',
    fieldMap: {
      ...DEFAULT_ACCOUNT_FIELD_MAP,
      ...(mapping.fieldMap ?? {}),
    },
    dedupeRule: {
      ...DEFAULT_ACCOUNT_DEDUPE_RULE,
      ...(mapping.dedupeRule ?? {}),
    },
    sourceExternalIdField: mapping.sourceExternalIdField ?? 'Id',
    canonicalDedupeField: mapping.canonicalDedupeField ?? 'dominio',
    updatedAt: new Date().toISOString(),
  };

  const existingContractJson =
    typeof existingRow.contract_json === 'object' && existingRow.contract_json !== null
      ? (existingRow.contract_json as Record<string, unknown>)
      : {};

  const updatedContractJson = {
    ...existingContractJson,
    canonical_mapping: canonicalMapping,
  };

  const nowIso = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('salesforce_sync_contracts')
    .update({
      status: 'mapped',
      contract_json: updatedContractJson,
      updated_at: nowIso,
    })
    .eq('id', contractId);

  if (updateError) throw new Error('SAVE_MAPPING_FAILED');

  return {
    id: contractId,
    provider: SALESFORCE_PROVIDER,
    status: 'mapped',
    mappedEntity: 'Account',
    updatedAt: nowIso,
  };
}

export async function generateAccountSyncPreview(contractId: string): Promise<SalesforceSyncPreviewResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const supabase = getSupabaseAdminClient();
  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };
  if (row.status !== 'mapped') {
    throw new Error('CONTRACT_NOT_MAPPED');
  }

  const contractJson = row.contract_json;
  const mapping = contractJson?.canonical_mapping as SalesforceAccountCanonicalMapping | undefined;

  if (!mapping || mapping.entity !== 'Account') {
    throw new Error('ACCOUNT_MAPPING_NOT_FOUND');
  }

  // Localiza a entidade Account no contrato
  const accountEntity = contractJson?.entities?.find((e: any) => e.objectApiName === 'Account');
  const sfAccounts = (accountEntity?.selectedRecords ?? []) as any[];

  if (sfAccounts.length === 0) {
    throw new Error('NO_ACCOUNTS_IN_CONTRACT');
  }

  // Busca contas locais para comparação (somente leitura)
  const { getAccounts } = await import('../accountsRepository');
  const currentAccounts = await getAccounts();

  const previewItems: SalesforceSyncPreviewItem[] = [];
  const fieldMap = mapping.fieldMap;

  for (const sfAcc of sfAccounts) {
    // Lê campos do topo do registro e, se ausentes, de fieldValues (estrutura ContractRecord)
    const sourceExternalId = readSfField(sfAcc, fieldMap.source_external_id)
      || String(sfAcc['id'] ?? '');
    const proposedNome = (readSfField(sfAcc, fieldMap.nome)
      || String(sfAcc['displayName'] ?? '')).trim();
    const proposedDominio = normalizeDomain(readSfField(sfAcc, fieldMap.dominio));
    const proposedSegmento = readSfField(sfAcc, fieldMap.segmento).trim();
    const proposedTipo = readSfField(sfAcc, fieldMap.tipo).trim();

    const warnings: string[] = [];
    if (!proposedNome) warnings.push('Nome ausente no Salesforce');
    if (!proposedDominio) warnings.push('Domínio/Website ausente no Salesforce');

    // Match por domínio — ambos os lados normalizados
    const match = currentAccounts.find(
      (a) => Boolean(proposedDominio && normalizeDomain(a.dominio) === proposedDominio),
    );

    let actionPreview: SalesforceSyncPreviewItem['actionPreview'] = 'create';
    let currentCanopiValue: SalesforceSyncPreviewItem['currentCanopiValue'] | undefined;

    if (match) {
      currentCanopiValue = {
        nome: match.nome,
        dominio: match.dominio,
        segmento: match.segmento,
        tipoEstrategico: match.tipoEstrategico,
      };

      const hasChanges =
        match.nome !== proposedNome ||
        (proposedDominio && normalizeDomain(match.dominio) !== proposedDominio) ||
        (proposedSegmento && match.segmento !== proposedSegmento);

      actionPreview = hasChanges ? 'update' : 'no_change';
    }

    if (warnings.length > 0 && actionPreview === 'create') {
      actionPreview = 'warning';
    }

    previewItems.push({
      sourceExternalId,
      sourceDisplayName: proposedNome || 'Conta sem nome',
      canonicalFields: {
        nome: proposedNome,
        dominio: proposedDominio,
        segmento: proposedSegmento,
        tipo: proposedTipo,
      },
      currentCanopiValue,
      actionPreview,
      warnings,
    });
  }

  return {
    contractId,
    entity: 'Account',
    items: previewItems,
    summary: {
      total: previewItems.length,
      toCreate: previewItems.filter((i) => i.actionPreview === 'create').length,
      toUpdate: previewItems.filter((i) => i.actionPreview === 'update').length,
      noChange: previewItems.filter((i) => i.actionPreview === 'no_change').length,
      warnings: previewItems.filter((i) => i.actionPreview === 'warning').length,
    },
  };
}

// ─── Domain normalization ─────────────────────────────────────────────────────

function normalizeDomain(raw: string | null | undefined): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  try {
    // Aceita URLs com ou sem protocolo
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const url = new URL(withProto);
    // Descarta path, query e hash — mantém apenas hostname em lowercase sem www.
    return url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  } catch {
    // Fallback defensivo: strip manual sem URL parser
    return s
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .replace(/\.$/, '')
      .trim();
  }
}

// ─── Sync Execution (C4.7) ───────────────────────────────────────────────────

export type SyncOutcome = 'synced' | 'partial_with_skips' | 'no_op_all_skipped' | 'failed_with_errors';

function computeSyncOutcome(
  createdCount: number,
  updatedCount: number,
  skippedCount: number,
  errorCount: number,
): SyncOutcome {
  if (errorCount > 0) return 'failed_with_errors';
  const processed = createdCount + updatedCount;
  if (processed === 0) return 'no_op_all_skipped';
  if (skippedCount > 0) return 'partial_with_skips';
  return 'synced';
}

/** Lê um campo do registro Salesforce — primeiro no topo, depois em fieldValues. */
function readSfField(sfAcc: Record<string, unknown>, fieldName: string): string {
  const top = sfAcc[fieldName];
  if (top !== undefined && top !== null && top !== '') return String(top);
  const fv = sfAcc['fieldValues'];
  if (fv && typeof fv === 'object') {
    const nested = (fv as Record<string, unknown>)[fieldName];
    if (nested !== undefined && nested !== null && nested !== '') return String(nested);
  }
  return '';
}

export interface SyncExecutionSkippedRecord {
  sourceExternalId: string;
  displayName: string;
  reason: string;
}

export interface SyncExecutionRecordPair {
  sourceExternalId: string;
  canopiId: string;
  dominio: string;
  nome: string;
}

export interface SyncExecutionResult {
  contractId: string;
  entity: 'Account';
  startedAt: string;
  finishedAt: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  outcome: SyncOutcome;
  /** Pares de IDs/dados para registros criados — sourceExternalId nunca vira id Canopi */
  createdRecords: SyncExecutionRecordPair[];
  /** Pares de IDs/dados para registros atualizados */
  updatedRecords: SyncExecutionRecordPair[];
  /** Registros ignorados com motivo */
  skippedRecords: SyncExecutionSkippedRecord[];
  warnings: string[];
  statusTransitioned: boolean;
}

/**
 * Executa sync persistente controlado de Accounts Salesforce → Canopi.
 *
 * Guardrails absolutos:
 * - Nunca aceita payload bruto do front-end.
 * - Lê exclusivamente do contrato salvo no banco (status=mapped).
 * - Grava apenas via syncAccountFromCRM (whitelist estrita no repository).
 * - Nunca sobrescreve campos estratégicos, scoring ou inteligência Canopi.
 * - Registra sync_summary_log no JSONB do contrato (não cria nova tabela).
 * - Transita status para 'synced' apenas após execução completa sem erro fatal.
 * - Contas sem nome ou domínio são ignoradas com rastreabilidade no log.
 */
export async function executeAccountSync(contractId: string): Promise<SyncExecutionResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  // ── 1. Busca contrato mapped ──────────────────────────────────────────────
  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };

  if (row.status !== 'mapped') {
    throw new Error('CONTRACT_NOT_MAPPED');
  }

  const contractJson = row.contract_json;
  const mapping = contractJson?.canonical_mapping as SalesforceAccountCanonicalMapping | undefined;

  if (!mapping || mapping.entity !== 'Account') {
    throw new Error('ACCOUNT_MAPPING_NOT_FOUND');
  }

  // ── 2. Extrai registros selecionados do contrato ──────────────────────────
  const accountEntity = contractJson?.entities?.find((e: any) => e.objectApiName === 'Account');
  const sfAccounts = (accountEntity?.selectedRecords ?? []) as any[];

  if (sfAccounts.length === 0) {
    throw new Error('NO_ACCOUNTS_IN_CONTRACT');
  }

  // ── 3. Leitura fresh direta do admin client — sem fallback para mock ────────
  // getAccounts() tem fallback para contasMock quando rows < 20, tornando o
  // dedupe por domínio não confiável. O sync persistente exige fonte canônica.
  const { syncAccountFromCRM } = await import('../accountsRepository');
  const { data: freshRows } = await supabase
    .from('accounts')
    .select('id, nome, dominio, segmento');

  // Índice: domínio normalizado → lista de canopiIds (detecta ambiguidade se >1)
  const domainIndex = new Map<string, string[]>();
  for (const row of freshRows ?? []) {
    const norm = normalizeDomain((row as { dominio?: string }).dominio ?? '');
    if (!norm) continue;
    const existing = domainIndex.get(norm) ?? [];
    existing.push((row as { id: string }).id);
    domainIndex.set(norm, existing);
  }

  const fieldMap = mapping.fieldMap;

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const createdRecords: SyncExecutionRecordPair[] = [];
  const updatedRecords: SyncExecutionRecordPair[] = [];
  const skippedRecords: SyncExecutionSkippedRecord[] = [];
  const warnings: string[] = [];

  // ── 4. Itera e executa sync conta a conta ────────────────────────────────
  for (const sfAcc of sfAccounts) {
    // Lê campos do topo do registro e, se ausentes, de fieldValues (estrutura ContractRecord)
    const sourceExternalId = readSfField(sfAcc, fieldMap.source_external_id)
      || String(sfAcc['id'] ?? '');
    const proposedNome = (readSfField(sfAcc, fieldMap.nome)
      || String(sfAcc['displayName'] ?? '')).trim();
    const proposedDominio = normalizeDomain(readSfField(sfAcc, fieldMap.dominio));
    const proposedSegmento = readSfField(sfAcc, fieldMap.segmento).trim();
    const displayName = proposedNome || sourceExternalId || 'Conta sem nome';

    // Regra de segurança: domínio vazio sem match seguro → ignorar com rastreabilidade
    if (!proposedDominio && !sourceExternalId) {
      skippedRecords.push({
        sourceExternalId,
        displayName,
        reason: 'Domínio e ID externo ausentes. Não é possível fazer match ou criar com segurança.',
      });
      skippedCount++;
      continue;
    }

    // Dedupe por domínio normalizado via índice fresh do admin client
    const matchIds = proposedDominio ? (domainIndex.get(proposedDominio) ?? []) : [];

    if (matchIds.length > 1) {
      // Ambiguidade: mais de uma conta com o mesmo domínio — não toca em nenhuma
      skippedRecords.push({
        sourceExternalId,
        displayName,
        reason: 'Domínio duplicado na base Canopi. Sync ignorado para evitar ambiguidade.',
      });
      skippedCount++;
    } else if (matchIds.length === 1) {
      // ── UPDATE seletivo — apenas campos CRM-safe, domínio já normalizado ──
      const matchId = matchIds[0];
      const result = await syncAccountFromCRM(
        {
          id: matchId,
          nome: proposedNome || undefined,
          dominio: proposedDominio || undefined,
          segmento: proposedSegmento || undefined,
        },
        'update',
      );

      if (result.action === 'updated') {
        updatedCount++;
        updatedRecords.push({ sourceExternalId, canopiId: matchId, dominio: proposedDominio, nome: proposedNome });
      } else if (result.action === 'skipped') {
        skippedRecords.push({
          sourceExternalId,
          displayName,
          reason: result.reason ?? 'Sem campos a atualizar.',
        });
        skippedCount++;
      } else if (result.action === 'error') {
        warnings.push(`Erro ao atualizar "${displayName}": ${result.error}`);
        errorCount++;
      }
    } else {
      // ── CREATE — apenas se dados mínimos presentes ─────────────────────
      if (!proposedNome || !proposedDominio) {
        skippedRecords.push({
          sourceExternalId,
          displayName,
          reason: 'Nome ou domínio ausentes. Conta não criada por falta de dados mínimos.',
        });
        skippedCount++;
        continue;
      }

      // ID Canopi sempre gerado internamente — sourceExternalId nunca vira id interno
      // dominio já normalizado por normalizeDomain() acima
      const canopiId = crypto.randomUUID();

      const result = await syncAccountFromCRM(
        {
          id: canopiId,
          nome: proposedNome,
          dominio: proposedDominio,
          segmento: proposedSegmento || undefined,
        },
        'create',
      );

      if (result.action === 'created') {
        createdCount++;
        createdRecords.push({ sourceExternalId, canopiId, dominio: proposedDominio, nome: proposedNome });
        // Atualiza índice em memória para impedir duplicação intra-execução
        domainIndex.set(proposedDominio, [canopiId]);
      } else if (result.action === 'skipped') {
        skippedRecords.push({
          sourceExternalId,
          displayName,
          reason: result.reason ?? 'Conta ignorada na criação.',
        });
        skippedCount++;
      } else if (result.action === 'error') {
        warnings.push(`Erro ao criar "${displayName}": ${result.error}`);
        errorCount++;
      }
    }
  }

  const finishedAt = new Date().toISOString();

  // ── 5. Registra sync_summary_log no JSONB do contrato ────────────────────
  const outcome = computeSyncOutcome(createdCount, updatedCount, skippedCount, errorCount);

  const syncSummaryLog = {
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
  };

  const updatedContractJson = {
    ...contractJson,
    sync_summary_log: syncSummaryLog,
  };

  // Transita para 'synced' somente se ao menos um registro foi criado ou atualizado sem erros
  const newStatus: SyncContractStatus = outcome === 'synced' ? 'synced' : 'mapped';
  const statusTransitioned = newStatus === 'synced';

  await supabase
    .from('salesforce_sync_contracts')
    .update({
      status: newStatus,
      contract_json: updatedContractJson,
      updated_at: finishedAt,
    })
    .eq('id', contractId);

  return {
    contractId,
    entity: 'Account',
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
    statusTransitioned,
  };
}

// ─── Contact Relationship Preview (C4.8) ─────────────────────────────────────

export type ContactActionPreview =
  | 'ready_to_create'
  | 'ready_to_update'
  | 'unresolved_account'
  | 'missing_required_fields';

export interface ContactRelationshipPreviewItem {
  sourceContactId: string;
  sourceAccountId: string;
  resolvedCanopiAccountId: string | null;
  resolvedAccountName: string | null;
  nome: string;
  email: string;
  cargo: string;
  area: string;
  actionPreview: ContactActionPreview;
  warnings: string[];
}

export interface ContactRelationshipPreviewResult {
  contractId: string;
  totalContacts: number;
  resolvedCount: number;
  unresolvedCount: number;
  missingFieldsCount: number;
  items: ContactRelationshipPreviewItem[];
}

/**
 * Monta lookup Salesforce AccountId → Canopi accountId a partir dos
 * sync_summary_log de contratos Account já sincronizados (C4.7).
 * Fonte canônica: createdRecords e updatedRecords do log, onde
 * sourceExternalId = SF AccountId e canopiId = UUID interno Canopi.
 */
async function buildAccountIdLookup(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
): Promise<Map<string, { canopiId: string; nome: string }>> {
  const lookup = new Map<string, { canopiId: string; nome: string }>();

  const { data: contracts } = await supabase
    .from('salesforce_sync_contracts')
    .select('contract_json')
    .eq('provider', SALESFORCE_PROVIDER)
    .eq('status', 'synced');

  for (const c of contracts ?? []) {
    const ssl = c.contract_json?.sync_summary_log;
    if (!ssl) continue;
    for (const rec of [...(ssl.createdRecords ?? []), ...(ssl.updatedRecords ?? [])]) {
      const sfId: string = rec.sourceExternalId ?? '';
      const canopiId: string = rec.canopiId ?? '';
      const nome: string = rec.nome ?? '';
      if (sfId && canopiId && !lookup.has(sfId)) {
        lookup.set(sfId, { canopiId, nome });
      }
    }
  }

  return lookup;
}

/**
 * Preview read-only de Contacts Salesforce → Canopi com resolução de vínculo Account.
 *
 * Guardrails:
 * - Não grava em contacts.
 * - Não altera accounts.
 * - Não altera status do contrato.
 * - Não cria sync_summary_log de Contacts.
 * - Contact sem accountId Canopi resolvido = unresolved_account.
 */
export async function generateContactRelationshipPreview(
  contractId: string,
): Promise<ContactRelationshipPreviewResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const supabase = getSupabaseAdminClient();

  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };
  if (row.status !== 'mapped' && row.status !== 'synced') {
    throw new Error('CONTRACT_NOT_MAPPED');
  }

  const contractJson = row.contract_json;
  const entities: any[] = Array.isArray(contractJson?.entities) ? contractJson.entities : [];

  const contactEntity = entities.find((e: any) => e.objectApiName === 'Contact');
  const sfContacts = (contactEntity?.selectedRecords ?? []) as any[];

  if (sfContacts.length === 0) {
    throw new Error('NO_CONTACTS_IN_CONTRACT');
  }

  // Lookup SF AccountId → Canopi accountId via sync_summary_log de contratos Account
  const accountIdLookup = await buildAccountIdLookup(supabase);

  const items: ContactRelationshipPreviewItem[] = [];

  for (const sfCon of sfContacts) {
    const sourceContactId = readSfField(sfCon, 'Id') || String(sfCon['id'] ?? '');
    const sourceAccountId = readSfField(sfCon, 'AccountId');
    const nome = (readSfField(sfCon, 'Name') || String(sfCon['displayName'] ?? '')).trim();
    const email = readSfField(sfCon, 'Email').trim();
    const cargo = readSfField(sfCon, 'Title').trim();
    const area = readSfField(sfCon, 'Department').trim();

    const warnings: string[] = [];
    let actionPreview: ContactActionPreview;

    // Campos mínimos obrigatórios: nome
    if (!nome) {
      items.push({
        sourceContactId,
        sourceAccountId,
        resolvedCanopiAccountId: null,
        resolvedAccountName: null,
        nome,
        email,
        cargo,
        area,
        actionPreview: 'missing_required_fields',
        warnings: ['Nome ausente — contato não pode ser criado sem identificação.'],
      });
      continue;
    }

    // Resolver vínculo Account
    const resolved = sourceAccountId ? accountIdLookup.get(sourceAccountId) ?? null : null;

    if (!resolved) {
      warnings.push(
        sourceAccountId
          ? `Salesforce AccountId "${sourceAccountId}" não encontrado nos contratos Account sincronizados.`
          : 'AccountId ausente no registro Salesforce.',
      );
      actionPreview = 'unresolved_account';
    } else {
      // Verificar se já existe contato com esse sourceContactId (sem escrita — apenas check)
      actionPreview = 'ready_to_create';
    }

    if (!email) warnings.push('E-mail ausente — contato será criado sem e-mail.');

    items.push({
      sourceContactId,
      sourceAccountId,
      resolvedCanopiAccountId: resolved?.canopiId ?? null,
      resolvedAccountName: resolved?.nome ?? null,
      nome,
      email,
      cargo,
      area,
      actionPreview,
      warnings,
    });
  }

  const resolvedCount = items.filter(
    (i) => i.actionPreview === 'ready_to_create' || i.actionPreview === 'ready_to_update',
  ).length;
  const unresolvedCount = items.filter((i) => i.actionPreview === 'unresolved_account').length;
  const missingFieldsCount = items.filter((i) => i.actionPreview === 'missing_required_fields').length;

  return {
    contractId,
    totalContacts: items.length,
    resolvedCount,
    unresolvedCount,
    missingFieldsCount,
    items,
  };
}

// ─── Eligible Contracts for Contact Preview (C4.8) ───────────────────────────

export interface EligibleContactPreviewContract {
  id: string;
  status: 'mapped' | 'synced';
  createdAt: string;
  contactCount: number;
  hasCanonicalMapping: boolean;
  hasAccountLookupSource: boolean;
}

/**
 * Lista contratos Salesforce elegíveis para preview de Contacts.
 *
 * Guardrails:
 * - Read-only. Não altera nenhum dado.
 * - Filtra apenas contratos com entity Contact e selectedRecords.length > 0.
 * - Retorna apenas contratos com status mapped ou synced.
 * - hasAccountLookupSource indica se existe ao menos um contrato synced (fonte de lookup de AccountId).
 */
export async function getEligibleSalesforceContactPreviewContracts(): Promise<EligibleContactPreviewContract[]> {
  const supabase = getSupabaseAdminClient();

  const { data: rows, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, status, created_at, contract_json')
    .eq('provider', SALESFORCE_PROVIDER)
    .in('status', ['mapped', 'synced'])
    .order('created_at', { ascending: false });

  if (error) throw new Error('READ_CONTRACTS_FAILED');

  // Verificar se existe ao menos um contrato synced para gerar lookup de AccountId
  const hasSyncedAccountContract = (rows ?? []).some((r: any) => r.status === 'synced');

  const result: EligibleContactPreviewContract[] = [];

  for (const row of rows ?? []) {
    const entities: any[] = Array.isArray(row.contract_json?.entities) ? row.contract_json.entities : [];
    const contactEntity = entities.find((e: any) => e.objectApiName === 'Contact');
    const contactCount = (contactEntity?.selectedRecords ?? []).length;

    if (contactCount === 0) continue;

    const hasCanonicalMapping = !!(row.contract_json?.canonicalMapping?.fieldMap);

    result.push({
      id: row.id,
      status: row.status as 'mapped' | 'synced',
      createdAt: row.created_at,
      contactCount,
      hasCanonicalMapping,
      hasAccountLookupSource: hasSyncedAccountContract,
    });
  }

  return result;
}

// ─── Contact Sync Execute (C4.9) ──────────────────────────────────────────────

export interface ContactSyncExecutionRecordPair {
  sourceContactId: string;
  canopiId: string;
  nome: string;
  accountId: string;
}

export interface ContactSyncExecutionSkippedRecord {
  sourceContactId: string;
  displayName: string;
  reason: string;
}

export type ContactSyncOutcome = 'synced' | 'partial' | 'skipped' | 'error';

export interface ContactSyncExecutionResult {
  contractId: string;
  entity: 'Contact';
  startedAt: string;
  finishedAt: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  outcome: ContactSyncOutcome;
  createdRecords: ContactSyncExecutionRecordPair[];
  updatedRecords: ContactSyncExecutionRecordPair[];
  skippedRecords: ContactSyncExecutionSkippedRecord[];
  warnings: string[];
  statusTransitioned: boolean;
}

function computeContactSyncOutcome(
  created: number,
  updated: number,
  skipped: number,
  errors: number,
): ContactSyncOutcome {
  if (errors > 0 && created === 0 && updated === 0) return 'error';
  if (created === 0 && updated === 0 && skipped > 0 && errors === 0) return 'skipped';
  if (errors > 0) return 'partial';
  return 'synced';
}

function normalizeContactName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Executa sync persistente controlado de Contacts Salesforce → Canopi.
 *
 * Guardrails absolutos:
 * - Nunca aceita payload bruto do front-end.
 * - Lê exclusivamente do contrato salvo no banco (status=mapped ou synced).
 * - Grava apenas via syncContactFromCRM (whitelist estrita no repository).
 * - Nunca sobrescreve campos estratégicos/relacionais da Canopi.
 * - Contact sem Account resolvida = skip. Não cria órfãos.
 * - Contact sem nome = skip.
 * - Dedupe por accountId + nome normalizado (email não existe no schema atual).
 * - Registra contact_sync_summary_log no JSONB do contrato (não cria nova tabela).
 * - Não altera status do contrato (Contact sync não transita o contrato para outro status).
 * - Não implementa Opportunity, Lead, Campaign, Bulk API ou writeback.
 */
export async function executeContactSync(contractId: string): Promise<ContactSyncExecutionResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  // ── 1. Busca contrato mapped ou synced ───────────────────────────────────
  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };

  if (row.status !== 'mapped' && row.status !== 'synced') {
    throw new Error('CONTRACT_STATUS_INVALID');
  }

  const contractJson = row.contract_json;
  const entities: any[] = Array.isArray(contractJson?.entities) ? contractJson.entities : [];

  // ── 2. Extrai registros de Contact do contrato ────────────────────────────
  const contactEntity = entities.find((e: any) => e.objectApiName === 'Contact');
  const sfContacts = (contactEntity?.selectedRecords ?? []) as any[];

  if (sfContacts.length === 0) {
    throw new Error('NO_CONTACTS_IN_CONTRACT');
  }

  // ── 3. Lookup Salesforce AccountId → Canopi accountId via sync_summary_log ─
  // Reutiliza buildAccountIdLookup do C4.8 — sem escrita, sem alteração de contrato
  const accountIdLookup = await buildAccountIdLookup(supabase);

  // ── 4. Leitura fresh de contatos existentes para dedupe ──────────────────
  // Sem fallback para mock — sync persistente exige fonte canônica
  const { syncContactFromCRM } = await import('../contactsRepository');
  const { data: freshContacts } = await supabase
    .from('contacts')
    .select('id, nome, accountId');

  // Índice: accountId + nomeNormalizado → canopiId (detecta ambiguidade se >1)
  const contactDedupeIndex = new Map<string, string[]>();
  for (const c of freshContacts ?? []) {
    const row = c as { id: string; nome?: string; accountId?: string };
    if (!row.accountId || !row.nome) continue;
    const key = `${row.accountId}::${normalizeContactName(row.nome)}`;
    const existing = contactDedupeIndex.get(key) ?? [];
    existing.push(row.id);
    contactDedupeIndex.set(key, existing);
  }

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const createdRecords: ContactSyncExecutionRecordPair[] = [];
  const updatedRecords: ContactSyncExecutionRecordPair[] = [];
  const skippedRecords: ContactSyncExecutionSkippedRecord[] = [];
  const warnings: string[] = [];

  // ── 5. Itera e executa sync contato a contato ─────────────────────────────
  for (const sfCon of sfContacts) {
    const sourceContactId = readSfField(sfCon, 'Id') || String(sfCon['id'] ?? '');
    const sourceAccountId = readSfField(sfCon, 'AccountId');
    const nome = (readSfField(sfCon, 'Name') || String(sfCon['displayName'] ?? '')).trim();
    const cargo = readSfField(sfCon, 'Title').trim();
    const area = readSfField(sfCon, 'Department').trim();
    const displayName = nome || sourceContactId || 'Contato sem nome';

    // Regra: nome obrigatório
    if (!nome) {
      skippedRecords.push({
        sourceContactId,
        displayName,
        reason: 'Nome ausente. Contato não pode ser criado sem identificação.',
      });
      skippedCount++;
      continue;
    }

    // Regra: Account deve estar resolvida — nenhum órfão
    const resolved = sourceAccountId ? accountIdLookup.get(sourceAccountId) ?? null : null;
    if (!resolved) {
      skippedRecords.push({
        sourceContactId,
        displayName,
        reason: sourceAccountId
          ? `Salesforce AccountId "${sourceAccountId}" não encontrado nos contratos Account sincronizados. Contato ignorado para evitar órfão.`
          : 'AccountId ausente no registro Salesforce. Contato ignorado para evitar órfão.',
      });
      skippedCount++;
      continue;
    }

    const { canopiId: canopiAccountId, nome: accountName } = resolved;
    const nomeNorm = normalizeContactName(nome);
    const dedupeKey = `${canopiAccountId}::${nomeNorm}`;
    const matchIds = contactDedupeIndex.get(dedupeKey) ?? [];

    if (matchIds.length > 1) {
      // Ambiguidade — mais de um contato com mesmo accountId + nome → skip conservador
      skippedRecords.push({
        sourceContactId,
        displayName,
        reason: 'Ambiguidade detectada: mais de um contato com mesmo accountId e nome normalizado. Sync ignorado.',
      });
      skippedCount++;
    } else if (matchIds.length === 1) {
      // UPDATE seletivo — apenas campos CRM-safe
      const matchId = matchIds[0];
      const result = await syncContactFromCRM(
        {
          id: matchId,
          accountId: canopiAccountId,
          accountName,
          nome,
          cargo: cargo || undefined,
          area: area || undefined,
        },
        'update',
      );

      if (result.action === 'updated') {
        updatedCount++;
        updatedRecords.push({ sourceContactId, canopiId: matchId, nome, accountId: canopiAccountId });
      } else if (result.action === 'skipped') {
        skippedRecords.push({
          sourceContactId,
          displayName,
          reason: result.reason ?? 'Sem campos a atualizar.',
        });
        skippedCount++;
      } else if (result.action === 'error') {
        warnings.push(`Erro ao atualizar "${displayName}": ${result.error}`);
        errorCount++;
      }
    } else {
      // CREATE — ID Canopi sempre gerado internamente
      const canopiContactId = crypto.randomUUID();

      const result = await syncContactFromCRM(
        {
          id: canopiContactId,
          accountId: canopiAccountId,
          accountName,
          nome,
          cargo: cargo || undefined,
          area: area || undefined,
          status: 'Ativa',
        },
        'create',
      );

      if (result.action === 'created') {
        createdCount++;
        createdRecords.push({ sourceContactId, canopiId: canopiContactId, nome, accountId: canopiAccountId });
        // Atualiza índice em memória para impedir duplicação intra-execução
        contactDedupeIndex.set(dedupeKey, [canopiContactId]);
      } else if (result.action === 'skipped') {
        skippedRecords.push({
          sourceContactId,
          displayName,
          reason: result.reason ?? 'Contato ignorado na criação.',
        });
        skippedCount++;
      } else if (result.action === 'error') {
        warnings.push(`Erro ao criar "${displayName}": ${result.error}`);
        errorCount++;
      }
    }
  }

  const finishedAt = new Date().toISOString();

  // ── 6. Registra contact_sync_summary_log no JSONB do contrato ────────────
  // Não cria nova tabela — armazena no contract_json existente
  const outcome = computeContactSyncOutcome(createdCount, updatedCount, skippedCount, errorCount);

  const contactSyncSummaryLog = {
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
  };

  const updatedContractJson = {
    ...contractJson,
    contact_sync_summary_log: contactSyncSummaryLog,
  };

  // Não altera o status do contrato — Contact sync é independente do status de Account
  await supabase
    .from('salesforce_sync_contracts')
    .update({
      contract_json: updatedContractJson,
      updated_at: finishedAt,
    })
    .eq('id', contractId);

  return {
    contractId,
    entity: 'Contact',
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
    statusTransitioned: false, // Contact sync não transita o status do contrato
  };
}

// ─── Opportunity Preview (C4.10) ─────────────────────────────────────────────

/**
 * Preview read-only de Opportunities Salesforce → Canopi.
 *
 * Guardrails absolutos:
 * - Não grava em opportunities, oportunidades, accounts ou contacts.
 * - Não altera status do contrato.
 * - Opportunity sem Account resolvida = unresolved_account.
 * - Não infere vínculo com Contact. ContactRole não está disponível no payload atual.
 * - Não implementa Campaign, Lead, writeback ou Bulk API.
 */

export type OpportunityActionPreview =
  | 'ready_to_create'
  | 'ready_to_update'
  | 'unresolved_account'
  | 'missing_required_fields';

export interface OpportunityRelationshipPreviewItem {
  sourceOpportunityId: string;
  sourceAccountId: string;
  resolvedCanopiAccountId: string | null;
  resolvedAccountName: string | null;
  nome: string;
  stageName: string;
  amount: number | null;
  closeDate: string;
  probability: number | null;
  type: string;
  ownerId: string;
  actionPreview: OpportunityActionPreview;
  warnings: string[];
}

export interface OpportunityRelationshipPreviewResult {
  contractId: string;
  totalOpportunities: number;
  resolvedCount: number;
  unresolvedCount: number;
  missingFieldsCount: number;
  contactRoleLacuna: boolean; // Sempre true: OpportunityContactRole não disponível no payload
  items: OpportunityRelationshipPreviewItem[];
}

export interface EligibleOpportunityPreviewContract {
  id: string;
  status: 'mapped' | 'synced';
  createdAt: string;
  opportunityCount: number;
  hasAccountLookupSource: boolean;
}

/**
 * Lista contratos Salesforce elegíveis para preview de Opportunities.
 *
 * Guardrails:
 * - Read-only. Não altera nenhum dado.
 * - Filtra apenas contratos com entity Opportunity e selectedRecords.length > 0.
 * - Retorna apenas contratos com status mapped ou synced.
 * - hasAccountLookupSource indica se existe ao menos um contrato synced (fonte de lookup de AccountId C4.7).
 */
export async function getEligibleSalesforceOpportunityPreviewContracts(): Promise<EligibleOpportunityPreviewContract[]> {
  const supabase = getSupabaseAdminClient();

  const { data: rows, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, status, created_at, contract_json')
    .eq('provider', SALESFORCE_PROVIDER)
    .in('status', ['mapped', 'synced'])
    .order('created_at', { ascending: false });

  if (error) throw new Error('READ_CONTRACTS_FAILED');

  // Verificar se existe ao menos um contrato synced para lookup de AccountId (C4.7)
  const hasSyncedAccountContract = (rows ?? []).some((r: any) => r.status === 'synced');

  const result: EligibleOpportunityPreviewContract[] = [];

  for (const row of rows ?? []) {
    const entities: any[] = Array.isArray(row.contract_json?.entities) ? row.contract_json.entities : [];
    const oppEntity = entities.find((e: any) => e.objectApiName === 'Opportunity');
    const opportunityCount = (oppEntity?.selectedRecords ?? []).length;

    if (opportunityCount === 0) continue;

    result.push({
      id: row.id,
      status: row.status as 'mapped' | 'synced',
      createdAt: row.created_at,
      opportunityCount,
      hasAccountLookupSource: hasSyncedAccountContract,
    });
  }

  return result;
}

/**
 * Preview read-only de Opportunities Salesforce → Canopi com resolução de vínculo Account.
 *
 * Guardrails:
 * - Exige contractId explícito — sem fallback para último contrato.
 * - Lê exclusivamente do contrato salvo no banco (status=mapped ou synced).
 * - Resolve Opportunity.AccountId via buildAccountIdLookup (C4.7).
 * - Não infere vínculo com Contact. OpportunityContactRole não está disponível.
 * - Não grava em oportunidades, accounts ou contacts.
 * - Não altera status do contrato.
 */
export async function generateOpportunityRelationshipPreview(
  contractId: string,
): Promise<OpportunityRelationshipPreviewResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const supabase = getSupabaseAdminClient();

  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };
  if (row.status !== 'mapped' && row.status !== 'synced') {
    throw new Error('CONTRACT_NOT_MAPPED');
  }

  const contractJson = row.contract_json;
  const entities: any[] = Array.isArray(contractJson?.entities) ? contractJson.entities : [];
  const priorSummary = contractJson?.opportunity_sync_summary_log as OpportunitySyncSummaryLog | undefined;
  const priorSourceMapping = buildOpportunitySourceMappingLookup(priorSummary);

  const oppEntity = entities.find((e: any) => e.objectApiName === 'Opportunity');
  const sfOpportunities = (oppEntity?.selectedRecords ?? []) as any[];

  if (sfOpportunities.length === 0) {
    throw new Error('NO_OPPORTUNITIES_IN_CONTRACT');
  }

  // Lookup SF AccountId → Canopi accountId via sync_summary_log dos contratos Account (C4.7)
  const accountIdLookup = await buildAccountIdLookup(supabase);

  const items: OpportunityRelationshipPreviewItem[] = [];

  for (const sfOpp of sfOpportunities) {
    const sourceOpportunityId = readSfField(sfOpp, 'Id') || String(sfOpp['id'] ?? '');
    const sourceAccountId = readSfField(sfOpp, 'AccountId');
    const nome = (readSfField(sfOpp, 'Name') || String(sfOpp['displayName'] ?? '')).trim();
    const stageName = readSfField(sfOpp, 'StageName').trim();
    const amountRaw = readSfField(sfOpp, 'Amount');
    const amount = amountRaw ? parseFloat(amountRaw) : null;
    const closeDate = readSfField(sfOpp, 'CloseDate').trim();
    const probabilityRaw = readSfField(sfOpp, 'Probability');
    const probability = probabilityRaw ? parseFloat(probabilityRaw) : null;
    const type = readSfField(sfOpp, 'Type').trim();
    const ownerId = readSfField(sfOpp, 'OwnerId').trim();

    const warnings: string[] = [];
    let actionPreview: OpportunityActionPreview;

    // Campos mínimos obrigatórios: nome
    if (!nome) {
      items.push({
        sourceOpportunityId,
        sourceAccountId,
        resolvedCanopiAccountId: null,
        resolvedAccountName: null,
        nome,
        stageName,
        amount,
        closeDate,
        probability,
        type,
        ownerId,
        actionPreview: 'missing_required_fields',
        warnings: ['Nome da Opportunity ausente — não pode ser registrada sem identificação.'],
      });
      continue;
    }

    // Resolver vínculo Account: Salesforce AccountId → Canopi accountId
    const resolved = sourceAccountId ? accountIdLookup.get(sourceAccountId) ?? null : null;

    if (!resolved) {
      warnings.push(
        sourceAccountId
          ? `Salesforce AccountId "${sourceAccountId}" não encontrado nos contratos Account sincronizados (C4.7). Opportunity marcada como unresolved_account.`
          : 'AccountId ausente no registro Salesforce. Opportunity marcada como unresolved_account.',
      );
      actionPreview = 'unresolved_account';
    } else if (priorSourceMapping.has(sourceOpportunityId)) {
      actionPreview = 'ready_to_update';
    } else {
      actionPreview = 'ready_to_create';
    }

    // Avisos de campos relevantes ausentes
    if (!stageName) warnings.push('StageName ausente.');
    if (!closeDate) warnings.push('CloseDate ausente.');
    if (amount === null) warnings.push('Amount ausente.');

    items.push({
      sourceOpportunityId,
      sourceAccountId,
      resolvedCanopiAccountId: resolved?.canopiId ?? null,
      resolvedAccountName: resolved?.nome ?? null,
      nome,
      stageName,
      amount,
      closeDate,
      probability,
      type,
      ownerId,
      actionPreview,
      warnings,
    });
  }

  const resolvedCount = items.filter(
    (i) => i.actionPreview === 'ready_to_create' || i.actionPreview === 'ready_to_update',
  ).length;
  const unresolvedCount = items.filter((i) => i.actionPreview === 'unresolved_account').length;
  const missingFieldsCount = items.filter((i) => i.actionPreview === 'missing_required_fields').length;

  return {
    contractId,
    totalOpportunities: items.length,
    resolvedCount,
    unresolvedCount,
    missingFieldsCount,
    contactRoleLacuna: true, // OpportunityContactRole não disponível no payload atual — C4.10 não infere vínculo com Contact
    items,
  };
}

// ─── Opportunity Sync Execute (C4.12) ────────────────────────────────────────

export type OpportunitySyncOutcome = 'synced' | 'partial' | 'skipped' | 'error';

export interface OpportunitySyncExecutionRecordPair {
  sourceOpportunityId: string;
  canopiOpportunityId: string;
  accountId: string;
  accountSlug: string;
  nome: string;
  etapa: string;
  valor: number;
}

export interface OpportunitySyncExecutionSkippedRecord {
  sourceOpportunityId: string;
  sourceAccountId: string;
  accountId: string | null;
  accountSlug: string | null;
  canopiOpportunityId: string | null;
  nome: string;
  reason: string;
}

export interface OpportunitySyncExecutionResult {
  contractId: string;
  entity: 'Opportunity';
  startedAt: string;
  finishedAt: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  unresolvedAccountCount: number;
  missingRequiredFieldsCount: number;
  existingMatchSkippedCount: number;
  ambiguousMatchSkippedCount: number;
  errorCount: number;
  outcome: OpportunitySyncOutcome;
  createdRecords: OpportunitySyncExecutionRecordPair[];
  updatedRecords: OpportunitySyncExecutionRecordPair[];
  skippedRecords: OpportunitySyncExecutionSkippedRecord[];
  warnings: string[];
  statusTransitioned: boolean;
}

function computeOpportunitySyncOutcome(
  createdCount: number,
  updatedCount: number,
  skippedCount: number,
  errorCount: number,
): OpportunitySyncOutcome {
  if (errorCount > 0 && createdCount === 0 && updatedCount === 0) return 'error';
  if (createdCount === 0 && updatedCount === 0 && skippedCount > 0 && errorCount === 0) return 'skipped';
  if (errorCount > 0 || skippedCount > 0) return 'partial';
  return 'synced';
}

function normalizeOpportunityName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildOpportunityIdentityKey(accountSlug: string, nome: string): string {
  return `${accountSlug}::${normalizeOpportunityName(nome)}`;
}

type CanopiAccountLookupEntry = {
  canopiId: string;
  slug: string;
  nome: string;
};

type OpportunityRowLookupEntry = {
  id: string;
  account_slug: string;
  nome: string;
  etapa: string;
  valor: number;
  owner: string;
  risco: 'Alto' | 'Médio' | 'Baixo';
  probabilidade: number;
  historico: string[];
};

type OpportunitySyncSummaryLog = {
  startedAt: string;
  finishedAt: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  unresolvedAccountCount: number;
  missingRequiredFieldsCount: number;
  existingMatchSkippedCount: number;
  ambiguousMatchSkippedCount: number;
  errorCount: number;
  outcome: OpportunitySyncOutcome;
  createdRecords: OpportunitySyncExecutionRecordPair[];
  updatedRecords: OpportunitySyncExecutionRecordPair[];
  skippedRecords: OpportunitySyncExecutionSkippedRecord[];
  warnings: string[];
};

async function buildCanopiAccountLookup(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
): Promise<Map<string, CanopiAccountLookupEntry>> {
  const lookup = new Map<string, CanopiAccountLookupEntry>();

  const { data, error } = await supabase
    .from('accounts')
    .select('id, slug, nome');

  if (error) throw new Error('READ_CANOPI_ACCOUNT_LOOKUP_FAILED');

  for (const row of data ?? []) {
    const id = String((row as { id?: string }).id ?? '').trim();
    const slug = String((row as { slug?: string }).slug ?? '').trim();
    const nome = String((row as { nome?: string }).nome ?? '').trim();
    if (!id || !slug) continue;
    lookup.set(id, { canopiId: id, slug, nome });
  }

  return lookup;
}

async function buildOpportunityRowLookup(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
): Promise<{
  rowsById: Map<string, OpportunityRowLookupEntry>;
  rowsByIdentity: Map<string, OpportunityRowLookupEntry[]>;
}> {
  const rowsById = new Map<string, OpportunityRowLookupEntry>();
  const rowsByIdentity = new Map<string, OpportunityRowLookupEntry[]>();

  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      id,
      account_slug,
      nome,
      etapa,
      valor,
      owner,
      risco,
      probabilidade,
      historico
    `);

  if (error) throw new Error('READ_EXISTING_OPPORTUNITIES_FAILED');

  for (const row of data ?? []) {
    const entry: OpportunityRowLookupEntry = {
      id: String((row as { id?: string }).id ?? ''),
      account_slug: String((row as { account_slug?: string }).account_slug ?? ''),
      nome: String((row as { nome?: string }).nome ?? ''),
      etapa: String((row as { etapa?: string }).etapa ?? ''),
      valor: Number((row as { valor?: number }).valor ?? 0),
      owner: String((row as { owner?: string }).owner ?? ''),
      risco: ((row as { risco?: OpportunityRowLookupEntry['risco'] }).risco ?? 'Médio') as OpportunityRowLookupEntry['risco'],
      probabilidade: Number((row as { probabilidade?: number }).probabilidade ?? 0),
      historico: Array.isArray((row as { historico?: string[] }).historico) ? ((row as { historico?: string[] }).historico ?? []) : [],
    };

    if (!entry.id || !entry.account_slug || !entry.nome) continue;
    rowsById.set(entry.id, entry);

    const key = buildOpportunityIdentityKey(entry.account_slug, entry.nome);
    const existing = rowsByIdentity.get(key) ?? [];
    existing.push(entry);
    rowsByIdentity.set(key, existing);
  }

  return { rowsById, rowsByIdentity };
}

function buildOpportunitySourceMappingLookup(summary: OpportunitySyncSummaryLog | undefined): Map<string, string> {
  const lookup = new Map<string, string>();
  if (!summary) return lookup;

  for (const record of [...(summary.createdRecords ?? []), ...(summary.updatedRecords ?? [])]) {
    if (record.sourceOpportunityId && record.canopiOpportunityId && !lookup.has(record.sourceOpportunityId)) {
      lookup.set(record.sourceOpportunityId, record.canopiOpportunityId);
    }
  }

  return lookup;
}

/**
 * Executa sync persistente controlado de Opportunities Salesforce → Canopi.
 *
 * Guardrails absolutos:
 * - Nunca aceita payload bruto do front-end.
 * - Lê exclusivamente do contrato salvo no banco (status=mapped ou synced).
 * - Grava somente Opportunities com Account resolvida via C4.7.
 * - Nunca cria Accounts, Contacts ou vínculos Opportunity ↔ Contact.
 * - Não usa OpportunityContactRole para persistência.
 * - Não usa writeback Salesforce, Bulk API ou migration.
 * - Não altera status do contrato.
 * - Registra opportunity_sync_summary_log no JSONB do contrato existente.
 */
export async function executeOpportunitySync(contractId: string): Promise<OpportunitySyncExecutionResult> {
  if (!contractId || typeof contractId !== 'string') {
    throw new Error('CONTRACT_ID_REQUIRED');
  }

  const startedAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  const { data: contractRow, error: readError } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, provider, status, contract_json')
    .eq('id', contractId)
    .eq('provider', SALESFORCE_PROVIDER)
    .maybeSingle();

  if (readError) throw new Error('READ_SYNC_CONTRACT_FAILED');
  if (!contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const row = contractRow as { id: string; status: string; contract_json: any };
  if (row.status !== 'mapped' && row.status !== 'synced') {
    throw new Error('CONTRACT_STATUS_INVALID');
  }

  const contractJson = row.contract_json;
  const entities: any[] = Array.isArray(contractJson?.entities) ? contractJson.entities : [];
  const oppEntity = entities.find((e: any) => e.objectApiName === 'Opportunity');
  const sfOpportunities = (oppEntity?.selectedRecords ?? []) as any[];

  if (sfOpportunities.length === 0) {
    throw new Error('NO_OPPORTUNITIES_IN_CONTRACT');
  }

  const priorSummary = contractJson?.opportunity_sync_summary_log as OpportunitySyncSummaryLog | undefined;
  const priorSourceMapping = buildOpportunitySourceMappingLookup(priorSummary);

  const warnings: string[] = [];
  const [accountIdLookup, canopiAccountLookup, opportunityLookup] = await Promise.all([
    buildAccountIdLookup(supabase),
    buildCanopiAccountLookup(supabase),
    buildOpportunityRowLookup(supabase),
  ]);

  const { syncOpportunityFromCRM } = await import('../oportunidadesRepository');

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let unresolvedAccountCount = 0;
  let missingRequiredFieldsCount = 0;
  let existingMatchSkippedCount = 0;
  let ambiguousMatchSkippedCount = 0;
  let errorCount = 0;

  const createdRecords: OpportunitySyncExecutionRecordPair[] = [];
  const updatedRecords: OpportunitySyncExecutionRecordPair[] = [];
  const skippedRecords: OpportunitySyncExecutionSkippedRecord[] = [];

  for (const sfOpp of sfOpportunities) {
    const sourceOpportunityId = readSfField(sfOpp, 'Id') || String(sfOpp['id'] ?? '').trim();
    const sourceAccountId = readSfField(sfOpp, 'AccountId');
    const nome = (readSfField(sfOpp, 'Name') || String(sfOpp['displayName'] ?? '')).trim();
    const stageName = readSfField(sfOpp, 'StageName').trim();
    const amountRaw = readSfField(sfOpp, 'Amount');
    const amount = amountRaw ? Number.parseFloat(amountRaw) : Number.NaN;
    const closeDate = readSfField(sfOpp, 'CloseDate').trim();
    const probabilityRaw = readSfField(sfOpp, 'Probability');
    const probability = probabilityRaw ? Number.parseFloat(probabilityRaw) : 0;
    const ownerId = readSfField(sfOpp, 'OwnerId').trim();
    if (!closeDate) warnings.push(`CloseDate ausente em Opportunity "${nome || sourceOpportunityId || 'sem id'}".`);
    if (!ownerId) warnings.push(`OwnerId ausente em Opportunity "${nome || sourceOpportunityId || 'sem id'}".`);

    const basicAccount = sourceAccountId ? accountIdLookup.get(sourceAccountId) ?? null : null;
    const resolvedCanopiAccount = basicAccount ? canopiAccountLookup.get(basicAccount.canopiId) ?? null : null;
    const resolvedAccountSlug = resolvedCanopiAccount?.slug ?? null;
    const resolvedAccountId = resolvedCanopiAccount?.canopiId ?? null;

    if (!sourceOpportunityId || !sourceAccountId || !nome || !stageName || !Number.isFinite(amount)) {
      missingRequiredFieldsCount++;
      skippedCount++;
      skippedRecords.push({
        sourceOpportunityId: sourceOpportunityId || '',
        sourceAccountId: sourceAccountId || '',
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: null,
        nome: nome || '—',
        reason: !sourceOpportunityId
          ? 'Id da Opportunity ausente.'
          : !sourceAccountId
            ? 'AccountId ausente no registro Salesforce.'
            : !nome
              ? 'Nome da Opportunity ausente.'
              : !stageName
                ? 'StageName ausente.'
                : 'Amount ausente.',
      });
      continue;
    }

    if (!resolvedCanopiAccount || !resolvedAccountSlug || !resolvedAccountId) {
      unresolvedAccountCount++;
      skippedCount++;
      skippedRecords.push({
        sourceOpportunityId,
        sourceAccountId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: null,
        nome,
        reason: sourceAccountId
          ? `Salesforce AccountId "${sourceAccountId}" não encontrado nos contratos Account sincronizados (C4.7). Opportunity ignorada para evitar órfão.`
          : 'AccountId ausente no registro Salesforce. Opportunity ignorada para evitar órfão.',
      });
      continue;
    }

    const existingMappedOpportunityId = priorSourceMapping.get(sourceOpportunityId) ?? null;
    const existingMappedOpportunity = existingMappedOpportunityId
      ? opportunityLookup.rowsById.get(existingMappedOpportunityId) ?? null
      : null;

    const identityKey = buildOpportunityIdentityKey(resolvedAccountSlug, nome);
    const identityMatches = opportunityLookup.rowsByIdentity.get(identityKey) ?? [];

    const syncNote = `Sincronizada do Salesforce C4.12 em ${new Date().toISOString()}`;
    const syncHistorico = existingMappedOpportunity
      ? [...(existingMappedOpportunity.historico || []), syncNote]
      : [syncNote];

    if (existingMappedOpportunityId && existingMappedOpportunity) {
      const result = await syncOpportunityFromCRM(
        {
          id: existingMappedOpportunityId,
          accountSlug: resolvedAccountSlug,
          nome,
          etapa: stageName,
          valor: Number.isFinite(amount) ? amount : 0,
          owner: ownerId || undefined,
          probabilidade: Number.isFinite(probability) ? probability : 0,
          historico: syncHistorico,
        },
        'update',
      );

      if (result.action === 'updated') {
        updatedCount++;
        updatedRecords.push({
          sourceOpportunityId,
          canopiOpportunityId: existingMappedOpportunityId,
          accountId: resolvedAccountId,
          accountSlug: resolvedAccountSlug,
          nome,
          etapa: stageName,
          valor: Number.isFinite(amount) ? amount : 0,
        });
      } else if (result.action === 'skipped') {
        skippedCount++;
        existingMatchSkippedCount++;
        skippedRecords.push({
          sourceOpportunityId,
          sourceAccountId,
          accountId: resolvedAccountId,
          accountSlug: resolvedAccountSlug,
          canopiOpportunityId: existingMappedOpportunityId,
          nome,
          reason: result.reason ?? 'Opportunity mapeada previamente, mas não pôde ser atualizada.',
        });
      } else {
        errorCount++;
        warnings.push(`Erro ao atualizar Opportunity "${nome}": ${result.error}`);
      }
      continue;
    }

    if (existingMappedOpportunityId && !existingMappedOpportunity) {
      skippedCount++;
      existingMatchSkippedCount++;
      skippedRecords.push({
        sourceOpportunityId,
        sourceAccountId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: existingMappedOpportunityId,
        nome,
        reason: 'Mapeamento anterior existe no contrato, mas a Opportunity Canopi não foi encontrada para atualização. Sync conservador ignorado.',
      });
      continue;
    }

    if (identityMatches.length === 1) {
      skippedCount++;
      existingMatchSkippedCount++;
      skippedRecords.push({
        sourceOpportunityId,
        sourceAccountId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: identityMatches[0].id,
        nome,
        reason: 'Opportunity já existe na Canopi com a mesma combinação account_slug + nome normalizado. Sync conservador ignorou para evitar duplicidade.',
      });
      continue;
    }

    if (identityMatches.length > 1) {
      skippedCount++;
      ambiguousMatchSkippedCount++;
      skippedRecords.push({
        sourceOpportunityId,
        sourceAccountId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: null,
        nome,
        reason: 'Mais de uma Opportunity Canopi corresponde a account_slug + nome normalizado. Sync ignorado para evitar ambiguidade.',
      });
      continue;
    }

    const result = await syncOpportunityFromCRM(
      {
        id: crypto.randomUUID(),
        accountSlug: resolvedAccountSlug,
        nome,
        etapa: stageName,
        valor: Number.isFinite(amount) ? amount : 0,
        owner: ownerId || undefined,
        probabilidade: Number.isFinite(probability) ? probability : 0,
        historico: syncHistorico,
      },
      'create',
    );

    if (result.action === 'created' && result.canopiId) {
      createdCount++;
      createdRecords.push({
        sourceOpportunityId,
        canopiOpportunityId: result.canopiId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        nome,
        etapa: stageName,
        valor: Number.isFinite(amount) ? amount : 0,
      });
      opportunityLookup.rowsById.set(result.canopiId, {
        id: result.canopiId,
        account_slug: resolvedAccountSlug,
        nome,
        etapa: stageName,
        valor: Number.isFinite(amount) ? amount : 0,
        owner: ownerId || '',
        risco: 'Médio',
        probabilidade: Number.isFinite(probability) ? probability : 0,
        historico: syncHistorico,
      });
      const createdKey = buildOpportunityIdentityKey(resolvedAccountSlug, nome);
      const nextIdentity = opportunityLookup.rowsByIdentity.get(createdKey) ?? [];
      nextIdentity.push({
        id: result.canopiId,
        account_slug: resolvedAccountSlug,
        nome,
        etapa: stageName,
        valor: Number.isFinite(amount) ? amount : 0,
        owner: ownerId || '',
        risco: 'Médio',
        probabilidade: Number.isFinite(probability) ? probability : 0,
        historico: syncHistorico,
      });
      opportunityLookup.rowsByIdentity.set(createdKey, nextIdentity);
      priorSourceMapping.set(sourceOpportunityId, result.canopiId);
    } else if (result.action === 'skipped') {
      skippedCount++;
      warnings.push(`Opportunity "${nome}" ignorada na criação: ${result.reason ?? 'sem motivo informado'}.`);
      skippedRecords.push({
        sourceOpportunityId,
        sourceAccountId,
        accountId: resolvedAccountId,
        accountSlug: resolvedAccountSlug,
        canopiOpportunityId: null,
        nome,
        reason: result.reason ?? 'Opportunity ignorada na criação.',
      });
    } else {
      errorCount++;
      warnings.push(`Erro ao criar Opportunity "${nome}": ${result.error}`);
    }
  }

  const finishedAt = new Date().toISOString();
  const outcome = computeOpportunitySyncOutcome(createdCount, updatedCount, skippedCount, errorCount);

  const opportunitySyncSummaryLog: OpportunitySyncSummaryLog = {
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    unresolvedAccountCount,
    missingRequiredFieldsCount,
    existingMatchSkippedCount,
    ambiguousMatchSkippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
  };

  const updatedContractJson = {
    ...contractJson,
    opportunity_sync_summary_log: opportunitySyncSummaryLog,
  };

  const { error: updateError } = await supabase
    .from('salesforce_sync_contracts')
    .update({
      contract_json: updatedContractJson,
      updated_at: finishedAt,
    })
    .eq('id', contractId);

  if (updateError) {
    throw new Error('SAVE_OPPORTUNITY_SYNC_SUMMARY_FAILED');
  }

  return {
    contractId,
    entity: 'Opportunity',
    startedAt,
    finishedAt,
    createdCount,
    updatedCount,
    skippedCount,
    unresolvedAccountCount,
    missingRequiredFieldsCount,
    existingMatchSkippedCount,
    ambiguousMatchSkippedCount,
    errorCount,
    outcome,
    createdRecords,
    updatedRecords,
    skippedRecords,
    warnings,
    statusTransitioned: false,
  };
}

// ─── C4.11 OpportunityContactRole Preview ───────────────────────────────────

export interface EligibleOpportunityContactRolePreviewContract {
  id: string;
  createdAt: string;
  roleCount: number;
}

export interface OpportunityContactRolePreviewItem {
  sourceRoleId: string;
  sourceOpportunityId: string | null;
  sourceContactId: string | null;
  roleName: string;
  isPrimary: boolean;

  resolvedCanopiAccountId: string | null;
  resolvedAccountName: string | null;

  resolvedCanopiContactId: string | null;
  resolvedContactName: string | null;

  opportunityName: string | null;

  actionPreview: 'ready_to_link' | 'unresolved_opportunity' | 'unresolved_contact' | 'missing_required_fields';
  warnings: string[];
}

export interface OpportunityContactRolePreviewResult {
  contractId: string;
  totalRoles: number;
  readyToLinkCount: number;
  unresolvedOppCount: number;
  unresolvedContactCount: number;
  missingFieldsCount: number;
  items: OpportunityContactRolePreviewItem[];
}

export async function getEligibleSalesforceOpportunityContactRolePreviewContracts(): Promise<EligibleOpportunityContactRolePreviewContract[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, created_at, status, contract_json')
    .eq('provider', 'salesforce')
    .in('status', ['mapped', 'synced'])
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const eligible: EligibleOpportunityContactRolePreviewContract[] = [];

  for (const row of data) {
    const contract = row.contract_json;
    if (!contract || !Array.isArray(contract.entities)) continue;

    const ocrEntity = contract.entities.find((e: any) => e.objectApiName === 'OpportunityContactRole');
    if (!ocrEntity) continue;

    const recs = Array.isArray(ocrEntity.selectedRecords) ? ocrEntity.selectedRecords : [];
    if (recs.length === 0) continue;

    eligible.push({
      id: row.id,
      createdAt: row.created_at,
      roleCount: recs.length,
    });
  }

  return eligible;
}

export async function generateOpportunityContactRoleRelationshipPreview(
  contractId: string,
): Promise<OpportunityContactRolePreviewResult> {
  const supabase = getSupabaseAdminClient();

  const { data: contractRow, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, contract_json')
    .eq('id', contractId)
    .single();

  if (error || !contractRow) throw new Error('CONTRACT_NOT_FOUND');

  const contractJson = contractRow.contract_json;
  const entities = contractJson?.entities || [];

  const ocrEntity = entities.find((e: any) => e.objectApiName === 'OpportunityContactRole');
  if (!ocrEntity || !Array.isArray(ocrEntity.selectedRecords) || ocrEntity.selectedRecords.length === 0) {
    throw new Error('NO_OPPORTUNITY_CONTACT_ROLES_IN_CONTRACT');
  }
  const roleRecords = ocrEntity.selectedRecords;

  // Carregar lookups (C4.7 para Account, e das Opps do próprio contrato para Opportunity)
  const accountIdLookup = await buildAccountIdLookup(supabase);
  const oppEntity = entities.find((e: any) => e.objectApiName === 'Opportunity');
  const oppRecords = oppEntity && Array.isArray(oppEntity.selectedRecords) ? oppEntity.selectedRecords : [];

  const oppMap = new Map<string, any>();
  for (const opp of oppRecords) {
    const id = opp.Id || opp.id;
    if (id) oppMap.set(id, opp);
  }

  // C4.9 Contact lookup a partir do contact_sync_summary_log
  const contactLookup = new Map<string, { canopiId: string; nome: string }>();

  // Vamos buscar todos os contratos synced de salesforce para montar um mapa global de contacts criados
  const { data: syncedContracts } = await supabase
    .from('salesforce_sync_contracts')
    .select('contract_json')
    .eq('provider', 'salesforce')
    .eq('status', 'synced');

  if (syncedContracts) {
    for (const sc of syncedContracts) {
      const summary = sc.contract_json?.contact_sync_summary_log;
      if (summary && Array.isArray(summary.createdRecords)) {
        for (const rec of summary.createdRecords) {
          if (rec.sourceContactId) {
            contactLookup.set(rec.sourceContactId, { canopiId: rec.canopiId, nome: rec.nome });
          }
        }
      }
      if (summary && Array.isArray(summary.updatedRecords)) {
        for (const rec of summary.updatedRecords) {
          if (rec.sourceContactId) {
            contactLookup.set(rec.sourceContactId, { canopiId: rec.canopiId, nome: rec.nome });
          }
        }
      }
    }
  }

  const items: OpportunityContactRolePreviewItem[] = [];

  for (const rec of roleRecords) {
    const sourceRoleId = (rec.Id || rec.id || '').trim();
    const sourceOpportunityId = (rec.OpportunityId || rec.opportunityId || '').trim();
    const sourceContactId = (rec.ContactId || rec.contactId || '').trim();
    const roleName = (rec.Role || rec.role || '').trim();
    const isPrimary = Boolean(rec.IsPrimary || rec.isPrimary);

    let actionPreview: OpportunityContactRolePreviewItem['actionPreview'] = 'ready_to_link';
    const warnings: string[] = [];

    if (!sourceOpportunityId || !sourceContactId) {
      actionPreview = 'missing_required_fields';
      warnings.push('Campos OpportunityId ou ContactId ausentes.');
    }

    const opp = sourceOpportunityId ? oppMap.get(sourceOpportunityId) : null;
    let resolvedCanopiAccountId: string | null = null;
    let resolvedAccountName: string | null = null;
    let opportunityName: string | null = null;

    if (opp) {
      opportunityName = opp.Name || opp.name || null;
      const oppAccountId = opp.AccountId || opp.accountId;
      if (oppAccountId) {
        const accInfo = accountIdLookup.get(oppAccountId);
        if (accInfo) {
          resolvedCanopiAccountId = accInfo.canopiId;
          resolvedAccountName = accInfo.nome;
        }
      }
    } else if (sourceOpportunityId) {
      warnings.push(`Opportunity "${sourceOpportunityId}" não encontrada no payload.`);
      if (actionPreview === 'ready_to_link') actionPreview = 'unresolved_opportunity';
    }

    const contactInfo = sourceContactId ? contactLookup.get(sourceContactId) : null;
    let resolvedCanopiContactId: string | null = null;
    let resolvedContactName: string | null = null;

    if (contactInfo) {
      resolvedCanopiContactId = contactInfo.canopiId;
      resolvedContactName = contactInfo.nome;
    } else if (sourceContactId) {
      warnings.push(`Contact "${sourceContactId}" não foi sincronizado na Canopi (C4.9).`);
      if (actionPreview === 'ready_to_link') actionPreview = 'unresolved_contact';
    }

    if (!resolvedCanopiAccountId && opp) {
        warnings.push(`Account da Opportunity não está resolvida. Readiness comprometido.`);
    }

    items.push({
      sourceRoleId,
      sourceOpportunityId,
      sourceContactId,
      roleName,
      isPrimary,
      resolvedCanopiAccountId,
      resolvedAccountName,
      resolvedCanopiContactId,
      resolvedContactName,
      opportunityName,
      actionPreview,
      warnings,
    });
  }

  const readyToLinkCount = items.filter((i) => i.actionPreview === 'ready_to_link').length;
  const unresolvedOppCount = items.filter((i) => i.actionPreview === 'unresolved_opportunity').length;
  const unresolvedContactCount = items.filter((i) => i.actionPreview === 'unresolved_contact').length;
  const missingFieldsCount = items.filter((i) => i.actionPreview === 'missing_required_fields').length;

  return {
    contractId,
    totalRoles: items.length,
    readyToLinkCount,
    unresolvedOppCount,
    unresolvedContactCount,
    missingFieldsCount,
    items,
  };
}

// ─── Revoke ──────────────────────────────────────────────────────────────────

export async function revokeAndDisconnect(): Promise<void> {
  const cfg = await getOAuthConfigStatus();
  const row = await getOAuthConnection();
  if (!row) return;

  try {
    const token = decryptToken(row.access_token_encrypted);
    const body = new URLSearchParams({ token });
    await fetch(`${cfg.loginUrl}/services/oauth2/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
  } catch {
    // Keep local disconnect even if revoke fails.
  }

  await deleteOAuthConnection();
}
