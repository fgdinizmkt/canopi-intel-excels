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
const MAX_ACCOUNTS_PREVIEW_LIMIT = 25;

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
    const redirectUri = row.redirect_uri?.trim() || '';
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

export function buildAuthorizeUrl(config: OAuthConfigStatus, state: string): string {
  const url = new URL(`${config.loginUrl}/services/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scopes.join(' '));
  url.searchParams.set('state', state);
  return url.toString();
}

export function resolveSalesforceAppOrigin(redirectUri: string | null | undefined): string {
  const fallback = 'http://localhost:3053';
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
