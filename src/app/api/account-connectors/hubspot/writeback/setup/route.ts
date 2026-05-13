import { NextRequest, NextResponse } from 'next/server';
import {
  buildHubspotWritebackPropertyPayload,
  buildHubspotWritebackSetupResult,
  parseHubspotScopes,
  type HubspotWritebackPropertyRecord,
} from '@/src/lib/hubspotWritebackSetup';
import type {
  HubspotWritebackSetupActionLog,
  HubspotWritebackSetupError,
  HubspotWritebackSetupResult,
} from '@/src/lib/hubspotWritebackSetupTypes';

export const dynamic = 'force-dynamic';

type HubspotTokenInfo = {
  hub_id?: number | string;
  hubId?: number | string;
  scopes?: string[] | string;
};

type HubspotPropertyRecord = {
  name?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  groupName?: string;
  description?: string;
  formField?: boolean;
  hidden?: boolean;
  archived?: boolean;
  calculated?: boolean;
  externalOptions?: boolean;
  hubspotDefined?: boolean;
  hasUniqueValue?: boolean;
  modificationMetadata?: {
    readOnlyValue?: boolean;
    readOnlyDefinition?: boolean;
    readOnlyOptions?: boolean;
  };
};

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function sanitizeHubspotError(status: number) {
  if (status === 400) return 'Token inválido ou malformado.';
  if (status === 401 || status === 403) return 'Token inválido, revogado ou sem permissão para validar o setup.';
  if (status === 404) return 'HubSpot não retornou dados para este token.';
  if (status === 429) return 'HubSpot atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'HubSpot indisponível no momento.';
  return 'Não foi possível validar o setup HubSpot.';
}

function normalizeProperty(property: HubspotPropertyRecord): HubspotWritebackPropertyRecord {
  return {
    name: readString(property.name) || undefined,
    label: readString(property.label) || undefined,
    type: readString(property.type) || undefined,
    fieldType: readString(property.fieldType) || undefined,
    groupName: readString(property.groupName) || undefined,
    description: readString(property.description) || undefined,
    formField: readBoolean(property.formField),
    hidden: readBoolean(property.hidden),
    archived: readBoolean(property.archived),
    calculated: readBoolean(property.calculated),
    externalOptions: readBoolean(property.externalOptions),
    hasUniqueValue: readBoolean(property.hasUniqueValue),
    hubspotDefined: readBoolean(property.hubspotDefined),
    modificationMetadata: property.modificationMetadata || undefined,
  };
}

async function readTokenContext(token: string) {
  let hubId: string | null = null;
  let scopes: string[] = [];

  try {
    const response = await fetch('https://api.hubapi.com/oauth/v2/private-apps/get/access-token-info', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenKey: token }),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json().catch(() => null)) as HubspotTokenInfo | null;
      hubId = payload?.hub_id !== undefined
        ? String(payload.hub_id)
        : payload?.hubId !== undefined
          ? String(payload.hubId)
          : null;
      scopes = parseHubspotScopes(payload?.scopes);
    }
  } catch {
    // A introspecção é opcional. O setup continua com a leitura dos objetos.
  }

  return { hubId, scopes };
}

async function fetchProperties(token: string, objectType: 'companies' | 'contacts') {
  const response = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      properties: [] as HubspotPropertyRecord[],
    };
  }

  const payload = (await response.json().catch(() => null)) as { results?: HubspotPropertyRecord[] } | null;
  return {
    ok: true as const,
    status: response.status,
    properties: Array.isArray(payload?.results) ? payload.results.map(normalizeProperty) : [],
  };
}

function extractToken(request: NextRequest, body: Record<string, unknown>) {
  const tokenFromBody = typeof body.tokenKey === 'string'
    ? body.tokenKey.trim()
    : typeof body.token === 'string'
      ? body.token.trim()
      : '';

  if (tokenFromBody) return tokenFromBody;

  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('tokenKey')?.trim() || url.searchParams.get('token')?.trim() || '';
  return tokenFromQuery;
}

async function verifySetup(token: string, creationLog?: HubspotWritebackSetupActionLog[]): Promise<HubspotWritebackSetupResult> {
  const { hubId, scopes } = await readTokenContext(token);
  const companiesResponse = await fetchProperties(token, 'companies');
  const contactsReadScopeAvailable = scopes.includes('crm.schemas.contacts.read');

  const companiesProperties = companiesResponse.ok ? companiesResponse.properties : [];
  const contactsProperties = contactsReadScopeAvailable
    ? (await fetchProperties(token, 'contacts')).properties
    : [];

  return buildHubspotWritebackSetupResult({
    hubId,
    scopes,
    readAccessConfirmed: companiesResponse.ok,
    companiesProperties,
    contactsProperties,
    creationLog,
  });
}

async function createMissingProperties(token: string): Promise<HubspotWritebackSetupResult> {
  const initialResult = await verifySetup(token);

  if (!initialResult.readAccessConfirmed || !initialResult.scopeSummary.schemaRead.ready) {
    return initialResult;
  }

  if (!initialResult.scopeSummary.schemaWrite.ready) {
    return initialResult;
  }

  if (initialResult.companies.incompatible.length > 0 || initialResult.contacts.incompatible.length > 0) {
    return initialResult;
  }

  const creationLog: HubspotWritebackSetupActionLog[] = [];

  const missingCompanyProperties = initialResult.companies.properties.filter((property) => property.status === 'missing');
  for (const property of missingCompanyProperties) {
    const requirement = property.requirement;
    const response = await fetch(`https://api.hubapi.com/crm/v3/properties/${requirement.objectType}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildHubspotWritebackPropertyPayload(requirement)),
      cache: 'no-store',
    });

    if (response.ok) {
      creationLog.push({
        objectType: requirement.objectType,
        propertyName: requirement.name,
        label: requirement.label,
        action: 'created',
        message: `${requirement.label} criada com sucesso.`,
      });
      continue;
    }

    creationLog.push({
      objectType: requirement.objectType,
      propertyName: requirement.name,
      label: requirement.label,
      action: 'blocked_incompatible',
      message: `Falha ao criar ${requirement.label}.`,
    });
  }

  const missingContactProperties = initialResult.contacts.properties.filter((property) => property.status === 'missing');
  for (const property of missingContactProperties) {
    const requirement = property.requirement;
    const response = await fetch(`https://api.hubapi.com/crm/v3/properties/${requirement.objectType}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildHubspotWritebackPropertyPayload(requirement)),
      cache: 'no-store',
    });

    if (response.ok) {
      creationLog.push({
        objectType: requirement.objectType,
        propertyName: requirement.name,
        label: requirement.label,
        action: 'created',
        message: `${requirement.label} criada com sucesso.`,
      });
      continue;
    }

    creationLog.push({
      objectType: requirement.objectType,
      propertyName: requirement.name,
      label: requirement.label,
      action: 'blocked_incompatible',
      message: `Falha ao criar ${requirement.label}.`,
    });
  }

  return verifySetup(token, creationLog);
}

export async function GET(request: NextRequest) {
  const token = extractToken(request, {});
  return handleSetup({ token, action: 'verify', confirm: false });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const token = extractToken(request, body);
  const action = typeof body.action === 'string' ? body.action.trim() : 'verify';
  const confirm = readBoolean(body.confirm);

  return handleSetup({ token, action, confirm });
}

async function handleSetup(options: {
  token: string;
  action: string;
  confirm: boolean;
}) {
  const { token, action, confirm } = options;
  if (!token) {
    const error: HubspotWritebackSetupError = {
      status: 'error',
      provider: 'hubspot',
      error: 'Informe um token de Private App para validar o setup do HubSpot.',
    };
    return NextResponse.json(error, { status: 400 });
  }

  try {
    if (action === 'create_missing_properties') {
      if (!confirm) {
        const error: HubspotWritebackSetupError = {
          status: 'error',
          provider: 'hubspot',
          error: 'Confirmação explícita ausente para criar propriedades Canopi.',
        };
        return NextResponse.json(error, { status: 400 });
      }

      const result = await createMissingProperties(token);
      if (!result.readAccessConfirmed || !result.scopeSummary.schemaRead.ready || !result.scopeSummary.schemaWrite.ready) {
        return NextResponse.json({
          status: 'error',
          provider: 'hubspot',
          error: 'Faltam permissões de leitura ou escrita para criar propriedades Canopi no HubSpot.',
          details: 'Reconecte o HubSpot com escopos de leitura e schema write antes de criar propriedades.',
        }, { status: 403 });
      }

      return NextResponse.json(result);
    }

    const result = await verifySetup(token);
    return NextResponse.json(result);
  } catch (error) {
    const fallback: HubspotWritebackSetupError = {
      status: 'error',
      provider: 'hubspot',
      error: 'Não foi possível validar o setup HubSpot no momento.',
      details: error instanceof Error ? error.message : undefined,
    };
    return NextResponse.json(fallback, { status: 502 });
  }
}
