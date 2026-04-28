import { NextRequest, NextResponse } from 'next/server';
import type {
  AccountSchemaDiscoveryResult,
  AccountSchemaProperty,
  AccountSchemaSuggestedMapping,
} from '@/src/lib/accountConnectionModel';

export const dynamic = 'force-dynamic';

type HubspotPropertyRecord = {
  name?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  description?: string;
  groupName?: string;
  hidden?: boolean;
  calculated?: boolean;
  modificationMetadata?: {
    readOnlyValue?: boolean;
    readOnlyDefinition?: boolean;
  };
  hasUniqueValue?: boolean;
  options?: unknown[];
  referencedObjectType?: string;
};

type DiscoveryCandidate = {
  hubspotFields: string[];
  canopiField: string;
  canopiLabel: string;
  confidence: 'alta' | 'média' | 'baixa';
};

const RECOMMENDED_CANDIDATES: DiscoveryCandidate[] = [
  {
    hubspotFields: ['hs_object_id'],
    canopiField: 'externalAccountId',
    canopiLabel: 'ID externo da conta',
    confidence: 'alta',
  },
  {
    hubspotFields: ['name'],
    canopiField: 'accountName',
    canopiLabel: 'Nome da conta',
    confidence: 'alta',
  },
  {
    hubspotFields: ['domain'],
    canopiField: 'accountDomain',
    canopiLabel: 'Domínio da conta',
    confidence: 'alta',
  },
  {
    hubspotFields: ['industry'],
    canopiField: 'accountIndustry',
    canopiLabel: 'Setor',
    confidence: 'média',
  },
  {
    hubspotFields: ['country'],
    canopiField: 'accountCountry',
    canopiLabel: 'País',
    confidence: 'média',
  },
  {
    hubspotFields: ['hubspot_owner_id'],
    canopiField: 'externalOwnerId',
    canopiLabel: 'Owner externo',
    confidence: 'média',
  },
  {
    hubspotFields: ['createdate', 'hs_createdate'],
    canopiField: 'externalCreatedAt',
    canopiLabel: 'Criado em',
    confidence: 'média',
  },
  {
    hubspotFields: ['lastmodifieddate', 'hs_lastmodifieddate'],
    canopiField: 'externalUpdatedAt',
    canopiLabel: 'Atualizado em',
    confidence: 'alta',
  },
];

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

function sanitizeHubspotError(status: number): string {
  if (status === 400) return 'Token inválido ou malformado.';
  if (status === 401 || status === 403) return 'Token inválido, revogado ou sem permissão para descobrir o schema de companies.';
  if (status === 404) return 'HubSpot não retornou o schema de companies para este token.';
  if (status === 429) return 'HubSpot atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'HubSpot indisponível no momento.';
  return 'Não foi possível detectar o schema de companies.';
}

function sanitizeProperty(property: HubspotPropertyRecord): AccountSchemaProperty {
  const modificationMetadata = property.modificationMetadata || {};
  return {
    name: readString(property.name) || '',
    label: readString(property.label) || readString(property.name) || '',
    type: readString(property.type) || 'unknown',
    fieldType: readString(property.fieldType) || 'unknown',
    description: readString(property.description),
    groupName: readString(property.groupName),
    hidden: readBoolean(property.hidden),
    calculated: readBoolean(property.calculated),
    readOnlyValue: readBoolean(modificationMetadata.readOnlyValue),
    readOnlyDefinition: readBoolean(modificationMetadata.readOnlyDefinition),
    hasUniqueValue: readBoolean(property.hasUniqueValue),
    optionCount: Array.isArray(property.options) ? property.options.length : 0,
    referencedObjectType: readString(property.referencedObjectType),
  };
}

function buildDiscoveryResponse(properties: AccountSchemaProperty[]): AccountSchemaDiscoveryResult {
  const propertyNames = new Set(properties.map((property) => property.name));
  const propertyByName = new Map(properties.map((property) => [property.name, property]));
  const suggestedMappings: AccountSchemaSuggestedMapping[] = [];
  const missingRecommendedFields: AccountSchemaSuggestedMapping[] = [];

  for (const candidate of RECOMMENDED_CANDIDATES) {
    const match = candidate.hubspotFields.find((field) => propertyNames.has(field)) || null;
    const matchedProperty = match ? propertyByName.get(match) : null;
    const mapping: AccountSchemaSuggestedMapping = {
      hubspotField: match || candidate.hubspotFields[0],
      hubspotLabel: matchedProperty?.label || match || candidate.hubspotFields[0],
      canopiField: candidate.canopiField,
      canopiLabel: candidate.canopiLabel,
      confidence: candidate.confidence,
      status: match ? 'encontrado' : 'ausente',
    };

    if (match) {
      suggestedMappings.push(mapping);
    } else {
      missingRecommendedFields.push(mapping);
    }
  }

  return {
    provider: 'hubspot',
    loadedAt: new Date().toISOString(),
    count: properties.length,
    properties,
    suggestedMappings,
    missingRecommendedFields,
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; tokenKey?: unknown };
  const token = typeof body.tokenKey === 'string'
    ? body.tokenKey.trim()
    : typeof body.token === 'string'
      ? body.token.trim()
      : '';

  if (!token) {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: 'Informe um token de Private App para detectar o schema de companies.',
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/properties/companies', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          provider: 'hubspot',
          error: sanitizeHubspotError(response.status),
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const payload = (await response.json().catch(() => null)) as {
      results?: HubspotPropertyRecord[];
    } | null;

    const properties = Array.isArray(payload?.results)
      ? payload.results.map(sanitizeProperty)
      : [];

    const discovery = buildDiscoveryResponse(properties);

    return NextResponse.json({
      status: 'success',
      ...discovery,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: 'Não foi possível detectar o schema de companies no momento.',
      },
      { status: 502 }
    );
  }
}
