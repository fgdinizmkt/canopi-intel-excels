import { getSupabaseAdminClient } from './supabaseAdmin';
import type {
  HubspotIngestAmbiguousItem,
  HubspotIngestContract,
  HubspotIngestContractDraftInput,
  HubspotIngestContractDraftResult,
  HubspotIngestContractJson,
  HubspotIngestContractStatus,
  HubspotIngestContractSummary,
  HubspotIngestCountKind,
  HubspotIngestDryRunSummary,
  HubspotIngestEntityStatus,
  HubspotIngestEntitySummary,
  HubspotIngestObjectRole,
  HubspotIngestObjectSelection,
  HubspotIngestObjectType,
  HubspotIngestPropertyStatus,
  HubspotIngestResolvedEntityItem,
  HubspotIngestScopeSnapshotItem,
  HubspotIngestScopeStatus,
  HubspotIngestUnresolvedItem,
} from '../hubspotIngestTypes';

const HUBSPOT_PROVIDER = 'hubspot';
const HUBSPOT_OBJECTS: Record<HubspotIngestObjectType, {
  label: string;
  selected: boolean;
  role: HubspotIngestObjectRole;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
}> = {
  companies: {
    label: 'Contas / Companies',
    selected: true,
    role: 'canonical',
    scopeRequired: 'crm.objects.companies.read',
    sourceEndpoint: '/crm/v3/objects/companies/search',
    note: 'Primeiro recorte da ingestão canônica.',
  },
  contacts: {
    label: 'Contatos / Contacts',
    selected: true,
    role: 'canonical',
    scopeRequired: 'crm.objects.contacts.read',
    sourceEndpoint: '/crm/v3/objects/contacts/search',
    note: 'Primeiro recorte da ingestão canônica.',
  },
  deals: {
    label: 'Deals / Opportunities',
    selected: false,
    role: 'out_of_scope',
    scopeRequired: 'crm.objects.deals.read',
    sourceEndpoint: '/crm/v3/objects/deals/search',
    note: 'Fora do primeiro recorte de ingestão canônica.',
  },
  leads: {
    label: 'Leads',
    selected: false,
    role: 'out_of_scope',
    scopeRequired: 'crm.objects.leads.read',
    sourceEndpoint: '/crm/v3/objects/leads/search',
    note: 'Fora do primeiro recorte de ingestão canônica.',
  },
  campaigns: {
    label: 'Campanhas',
    selected: false,
    role: 'inventory',
    scopeRequired: 'marketing.campaigns.read',
    sourceEndpoint: '/marketing/campaigns/2026-03',
    note: 'Inventário futuro, fora do primeiro recorte.',
  },
  properties: {
    label: 'Catálogo de propriedades',
    selected: false,
    role: 'inventory',
    scopeRequired: 'crm.schemas.companies.read',
    sourceEndpoint: '/crm/v3/properties/companies',
    note: 'Inventário futuro, fora do primeiro recorte.',
  },
  associations: {
    label: 'Associações',
    selected: false,
    role: 'diagnostic',
    scopeRequired: null,
    sourceEndpoint: null,
    note: 'Inventário amostral, fora do primeiro recorte.',
  },
};

const HUBSPOT_SCOPE_STATUS: Record<HubspotIngestScopeStatus, HubspotIngestScopeStatus> = {
  granted: 'granted',
  missing: 'missing',
  not_required: 'not_required',
};

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function sanitizeHubspotError(status: number, label: string): string {
  if (status === 400) return `Token inválido ou malformado ao consultar ${label}.`;
  if (status === 401 || status === 403) return `Token sem permissão para consultar ${label}.`;
  if (status === 404) return `${label} não está disponível nesta conta.`;
  if (status === 429) return `HubSpot atingiu limite temporário ao consultar ${label}.`;
  if (status >= 500) return `HubSpot indisponível no momento ao consultar ${label}.`;
  return `Não foi possível consultar ${label}.`;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type HubspotSearchResponse = {
  total?: number;
  results?: Array<{
    id?: string | number;
    createdAt?: string;
    updatedAt?: string;
    properties?: Record<string, unknown>;
    associations?: Record<string, unknown>;
  }>;
};

type HubspotPropertyResponse = {
  total?: number;
  results?: Array<{
    name?: string;
  }>;
};

type HubspotSearchResult = {
  ok: boolean;
  status: number;
  errorMessage: string | null;
  total: number | null;
  sampleId: string | null;
  results: Array<{
    id: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    properties: Record<string, string | null>;
  }>;
};

type HubspotPropertyCatalogResult = {
  ok: boolean;
  status: number;
  errorMessage: string | null;
  total: number | null;
  propertyNames: Set<string>;
};

type HubspotPropertyCountResult = {
  count: number | null;
  status: HubspotIngestPropertyStatus;
  errorMessage: string | null;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
};

function computeOutsideCanopiCount(total: number | null, canopiTaggedCount: number | null): number | null {
  if (typeof total !== 'number' || typeof canopiTaggedCount !== 'number') return null;
  if (canopiTaggedCount > total) return null;
  return total - canopiTaggedCount;
}

async function fetchSearch(
  token: string,
  objectType: Exclude<HubspotIngestObjectType, 'campaigns' | 'properties' | 'associations'>,
  options: {
    propertyName: string;
    operator: 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY';
    limit?: number;
    properties?: string[];
  }
): Promise<HubspotSearchResult> {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: options.propertyName,
              operator: options.operator,
            },
          ],
        },
      ],
      limit: options.limit ?? 1,
      properties: options.properties ?? ['hs_object_id'],
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: sanitizeHubspotError(response.status, objectType),
      total: null,
      sampleId: null,
      results: [],
    };
  }

  const payload = (await response.json().catch(() => null)) as HubspotSearchResponse | null;
  const results = Array.isArray(payload?.results)
    ? payload.results.map((item) => ({
        id: readString(item.id),
        createdAt: readString(item.createdAt),
        updatedAt: readString(item.updatedAt),
        properties: Object.entries(item.properties ?? {}).reduce<Record<string, string | null>>((accumulator, [key, value]) => {
          accumulator[key] = readString(value);
          return accumulator;
        }, {}),
      }))
    : [];

  return {
    ok: true,
    status: 200,
    errorMessage: null,
    total: typeof payload?.total === 'number' ? payload.total : null,
    sampleId: results[0]?.id ?? null,
    results,
  };
}

async function fetchCampaignCount(token: string): Promise<HubspotSearchResult> {
  const response = await fetch('https://api.hubapi.com/marketing/campaigns/2026-03?limit=1', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: sanitizeHubspotError(response.status, 'campanhas'),
      total: null,
      sampleId: null,
      results: [],
    };
  }

  const payload = (await response.json().catch(() => null)) as { total?: number; results?: Array<{ id?: string | number }> } | null;
  return {
    ok: true,
    status: 200,
    errorMessage: null,
    total: typeof payload?.total === 'number' ? payload.total : null,
    sampleId: readString(payload?.results?.[0]?.id),
    results: [],
  };
}

async function fetchPropertyCatalog(token: string, objectType: 'companies' | 'contacts'): Promise<HubspotPropertyCatalogResult> {
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
      ok: false,
      status: response.status,
      errorMessage: sanitizeHubspotError(response.status, `catálogo de propriedades de ${objectType}`),
      total: null,
      propertyNames: new Set<string>(),
    };
  }

  const payload = (await response.json().catch(() => null)) as HubspotPropertyResponse | null;
  const propertyNames = new Set(
    (payload?.results ?? [])
      .map((property) => readString(property?.name))
      .filter((name): name is string => Boolean(name))
  );

  return {
    ok: true,
    status: 200,
    errorMessage: null,
    total: typeof payload?.total === 'number' ? payload.total : propertyNames.size,
    propertyNames,
  };
}

async function fetchCanopiPropertyCount(params: {
  token: string;
  objectType: 'companies' | 'contacts';
  propertyName: string;
  catalog: HubspotPropertyCatalogResult;
  schemaScope: string;
}): Promise<HubspotPropertyCountResult> {
  if (!params.catalog.ok) {
    return {
      count: null,
      status: params.catalog.status === 403 ? 'missing_scope' : 'error',
      errorMessage: params.catalog.errorMessage,
      scopeRequired: params.schemaScope,
      sourceEndpoint: `/crm/v3/properties/${params.objectType}`,
      note: 'Não foi possível ler o catálogo de propriedades para confirmar o campo Canopi.',
    };
  }

  if (!params.catalog.propertyNames.has(params.propertyName)) {
    return {
      count: null,
      status: 'not_configured',
      errorMessage: null,
      scopeRequired: params.schemaScope,
      sourceEndpoint: `/crm/v3/properties/${params.objectType}`,
      note: `Propriedade ${params.propertyName} não encontrada nesta conta.`,
    };
  }

  const searchResult = await fetchSearch(params.token, params.objectType, {
    propertyName: params.propertyName,
    operator: 'HAS_PROPERTY',
    limit: 1,
    properties: ['hs_object_id'],
  });

  if (!searchResult.ok) {
    return {
      count: null,
      status: searchResult.status === 403 ? 'missing_scope' : 'error',
      errorMessage: searchResult.errorMessage,
      scopeRequired: params.schemaScope,
      sourceEndpoint: `/crm/v3/objects/${params.objectType}/search`,
      note: `Filtro: ${params.propertyName} HAS_PROPERTY.`,
    };
  }

  return {
    count: searchResult.total,
    status: 'available',
    errorMessage: null,
    scopeRequired: params.schemaScope,
    sourceEndpoint: `/crm/v3/objects/${params.objectType}/search`,
    note: `Filtro: ${params.propertyName} HAS_PROPERTY.`,
  };
}

function buildSelection(objectType: HubspotIngestObjectType): HubspotIngestObjectSelection {
  const meta = HUBSPOT_OBJECTS[objectType];
  return {
    objectType,
    label: meta.label,
    selected: meta.selected,
    role: meta.role,
    scopeRequired: meta.scopeRequired,
    sourceEndpoint: meta.sourceEndpoint,
    note: meta.note,
  };
}

function buildScopeSnapshot(
  companiesStatus: HubspotPropertyCatalogResult,
  contactsStatus: HubspotPropertyCatalogResult,
  companiesCanopiStatus: HubspotPropertyCountResult,
  contactsCanopiStatus: HubspotPropertyCountResult,
): HubspotIngestScopeSnapshotItem[] {
  const granted = (scope: string | null, objectType: HubspotIngestObjectType, sourceEndpoint: string | null, note: string | null): HubspotIngestScopeSnapshotItem => ({
    scope,
    objectType,
    status: HUBSPOT_SCOPE_STATUS.granted,
    sourceEndpoint,
    note,
  });

  const missing = (scope: string | null, objectType: HubspotIngestObjectType, sourceEndpoint: string | null, note: string | null): HubspotIngestScopeSnapshotItem => ({
    scope,
    objectType,
    status: HUBSPOT_SCOPE_STATUS.missing,
    sourceEndpoint,
    note,
  });

  const notRequired = (scope: string | null, objectType: HubspotIngestObjectType, sourceEndpoint: string | null, note: string | null): HubspotIngestScopeSnapshotItem => ({
    scope,
    objectType,
    status: HUBSPOT_SCOPE_STATUS.not_required,
    sourceEndpoint,
    note,
  });

  return [
    companiesStatus.ok
      ? granted('crm.objects.companies.read', 'companies', '/crm/v3/objects/companies/search', 'Leitura do total de Companies disponível.')
      : missing('crm.objects.companies.read', 'companies', '/crm/v3/objects/companies/search', 'Leitura do total de Companies indisponível.'),
    contactsStatus.ok
      ? granted('crm.objects.contacts.read', 'contacts', '/crm/v3/objects/contacts/search', 'Leitura do total de Contacts disponível.')
      : missing('crm.objects.contacts.read', 'contacts', '/crm/v3/objects/contacts/search', 'Leitura do total de Contacts indisponível.'),
    companiesCanopiStatus.status === 'available'
      ? granted('crm.schemas.companies.read', 'companies', '/crm/v3/properties/companies', 'Propriedade canopi_company_id disponível.')
      : companiesCanopiStatus.status === 'missing_scope'
        ? missing('crm.schemas.companies.read', 'companies', '/crm/v3/properties/companies', 'Escopo de schema ausente para canopi_company_id.')
        : missing('crm.schemas.companies.read', 'companies', '/crm/v3/properties/companies', 'Propriedade canopi_company_id indisponível.'),
    contactsCanopiStatus.status === 'available'
      ? granted('crm.schemas.contacts.read', 'contacts', '/crm/v3/properties/contacts', 'Propriedade canopi_contact_id disponível.')
      : contactsCanopiStatus.status === 'missing_scope'
        ? missing('crm.schemas.contacts.read', 'contacts', '/crm/v3/properties/contacts', 'Escopo de schema ausente para canopi_contact_id.')
        : missing('crm.schemas.contacts.read', 'contacts', '/crm/v3/properties/contacts', 'Propriedade canopi_contact_id indisponível.'),
    notRequired('crm.objects.deals.read', 'deals', '/crm/v3/objects/deals/search', 'Fora do primeiro recorte.'),
    notRequired('crm.objects.leads.read', 'leads', '/crm/v3/objects/leads/search', 'Fora do primeiro recorte.'),
    notRequired('marketing.campaigns.read', 'campaigns', '/marketing/campaigns/2026-03', 'Fora do primeiro recorte.'),
    notRequired('crm.schemas.companies.read', 'properties', '/crm/v3/properties/companies', 'Inventário futuro fora do primeiro recorte.'),
    notRequired(null, 'associations', null, 'Associações serão inventariadas em recorte futuro.'),
  ];
}

function buildEntitySummary(params: {
  objectType: HubspotIngestObjectType;
  label: string;
  selected: boolean;
  status: HubspotIngestEntityStatus;
  hubspotTotalCount: number | null;
  canopiTaggedCount: number | null;
  canopiBatchCount: number | null;
  canopiTagStatus?: HubspotIngestPropertyStatus;
  canopiBatchStatus?: HubspotIngestPropertyStatus;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
  countKind: HubspotIngestCountKind;
}): HubspotIngestEntitySummary {
  return {
    objectType: params.objectType,
    label: params.label,
    selected: params.selected,
    status: params.status,
    hubspotTotalCount: params.hubspotTotalCount,
    canopiTaggedCount: params.canopiTaggedCount,
    canopiBatchCount: params.canopiBatchCount,
    outsideCanopiCount: computeOutsideCanopiCount(params.hubspotTotalCount, params.canopiTaggedCount),
    countKind: params.countKind,
    canopiTagStatus: params.canopiTagStatus,
    canopiBatchStatus: params.canopiBatchStatus,
    scopeRequired: params.scopeRequired,
    sourceEndpoint: params.sourceEndpoint,
    note: params.note,
  };
}

function buildUnresolvedContactItem(record: { id: string | null; createdAt: string | null; updatedAt: string | null; properties: Record<string, string | null> }): HubspotIngestUnresolvedItem {
  return {
    objectType: 'contacts',
    hubspotId: record.id,
    reason: 'Contato sem canopi_contact_id.',
    evidence: ['canopi_contact_id NOT_HAS_PROPERTY'],
    fields: {
      hs_object_id: record.id,
      email: record.properties.email ?? null,
      firstname: record.properties.firstname ?? null,
      lastname: record.properties.lastname ?? null,
      createdate: record.properties.createdate ?? record.createdAt ?? null,
      lastmodifieddate: record.properties.lastmodifieddate ?? record.updatedAt ?? null,
      associatedcompanyid: record.properties.associatedcompanyid ?? null,
    },
    remediation: 'Backfill protegido ou revisão manual futura para preencher canopi_contact_id.',
  };
}

function buildContractStatus(blockers: string[]): Extract<HubspotIngestContractStatus, 'ready' | 'blocked'> {
  return blockers.length > 0 ? 'blocked' : 'ready';
}

function buildRecommendation(status: Extract<HubspotIngestContractStatus, 'ready' | 'blocked'>): string {
  if (status === 'blocked') {
    return 'Corrigir escopos, leitura de schema ou disponibilidade do HubSpot antes de avançar para a ingestão canônica.';
  }
  return 'Prosseguir para C2.9E.2B com Companies + Contacts como primeiro recorte. Deals, Leads, Campaigns, Properties e Associações ficam fora deste corte inicial.';
}

export async function prepareHubspotIngestContractDraft(input: HubspotIngestContractDraftInput): Promise<HubspotIngestContractDraftResult> {
  const token = input.token.trim();
  if (!token) {
    throw new Error('TOKEN_REQUIRED');
  }

  const loadedAt = new Date().toISOString();
  const companiesTask = fetchSearch(token, 'companies', { propertyName: 'hs_object_id', operator: 'HAS_PROPERTY' });
  const contactsTask = fetchSearch(token, 'contacts', { propertyName: 'hs_object_id', operator: 'HAS_PROPERTY' });
  const companiesCatalogTask = fetchPropertyCatalog(token, 'companies');
  const contactsCatalogTask = fetchPropertyCatalog(token, 'contacts');

  const [companiesResult, contactsResult, companiesCatalogResult, contactsCatalogResult] = await Promise.all([
    companiesTask,
    contactsTask,
    companiesCatalogTask,
    contactsCatalogTask,
  ]);

  const companiesCanopiResult = companiesResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'companies',
        propertyName: 'canopi_company_id',
        catalog: companiesCatalogResult,
        schemaScope: 'crm.schemas.companies.read',
      })
    : null;
  const companiesBatchResult = companiesResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'companies',
        propertyName: 'canopi_import_batch_id',
        catalog: companiesCatalogResult,
        schemaScope: 'crm.schemas.companies.read',
      })
    : null;
  const contactsCanopiResult = contactsResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'contacts',
        propertyName: 'canopi_contact_id',
        catalog: contactsCatalogResult,
        schemaScope: 'crm.schemas.contacts.read',
      })
    : null;
  const contactsBatchResult = contactsResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'contacts',
        propertyName: 'canopi_import_batch_id',
        catalog: contactsCatalogResult,
        schemaScope: 'crm.schemas.contacts.read',
      })
    : null;

  const unresolvedContacts: HubspotIngestUnresolvedItem[] = [];
  const contactsWithoutCanopiIdTotal =
    typeof contactsResult.total === 'number' && typeof contactsCanopiResult?.count === 'number'
      ? Math.max(contactsResult.total - contactsCanopiResult.count, 0)
      : 0;
  if (contactsCanopiResult?.status === 'available' && typeof contactsResult.total === 'number' && typeof contactsCanopiResult.count === 'number') {
    if (contactsWithoutCanopiIdTotal > 0) {
      const unresolvedSearch = await fetchSearch(token, 'contacts', {
        propertyName: 'canopi_contact_id',
        operator: 'NOT_HAS_PROPERTY',
        limit: Math.min(contactsWithoutCanopiIdTotal, 5),
        properties: ['hs_object_id', 'email', 'firstname', 'lastname', 'createdate', 'lastmodifieddate', 'associatedcompanyid'],
      });
      if (unresolvedSearch.ok) {
        unresolvedContacts.push(...unresolvedSearch.results.map(buildUnresolvedContactItem));
      } else {
        unresolvedContacts.push({
          objectType: 'contacts',
          hubspotId: null,
          reason: 'Contatos sem canopi_contact_id identificados, mas a amostra detalhada não pôde ser carregada.',
          evidence: ['canopi_contact_id NOT_HAS_PROPERTY', 'sample_unavailable'],
          fields: {},
          remediation: 'Backfill protegido ou revisão manual futura para preencher canopi_contact_id.',
        });
      }
    }
  }

  const companiesEntity = companiesResult.ok
    ? buildEntitySummary({
        objectType: 'companies',
        label: HUBSPOT_OBJECTS.companies.label,
        selected: HUBSPOT_OBJECTS.companies.selected,
        status: 'available',
        hubspotTotalCount: companiesResult.total,
        canopiTaggedCount: companiesCanopiResult?.count ?? null,
        canopiBatchCount: companiesBatchResult?.count ?? null,
        canopiTagStatus: companiesCanopiResult?.status ?? 'not_configured',
        canopiBatchStatus: companiesBatchResult?.status ?? 'not_configured',
        scopeRequired: HUBSPOT_OBJECTS.companies.scopeRequired,
        sourceEndpoint: HUBSPOT_OBJECTS.companies.sourceEndpoint,
        note: companiesCanopiResult?.status === 'available'
          ? companiesBatchResult?.status === 'available'
            ? 'Total real do HubSpot. Canopi calculada por canopi_company_id; lote por canopi_import_batch_id.'
            : 'Total real do HubSpot. Canopi calculada por canopi_company_id.'
          : companiesCanopiResult?.status === 'not_configured'
            ? 'Total real do HubSpot. Propriedade Canopi não encontrada nesta conta.'
            : companiesCanopiResult?.status === 'missing_scope'
              ? 'Escopo de schema ausente para ler propriedades Canopi.'
              : 'Total real retornado pelo HubSpot Search API.',
        countKind: 'real_total',
      })
    : buildEntitySummary({
        objectType: 'companies',
        label: HUBSPOT_OBJECTS.companies.label,
        selected: HUBSPOT_OBJECTS.companies.selected,
        status: companiesResult.status === 403 ? 'missing_scope' : companiesResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        canopiTagStatus: companiesResult.status === 403 ? 'missing_scope' : 'error',
        canopiBatchStatus: companiesResult.status === 403 ? 'missing_scope' : 'error',
        scopeRequired: HUBSPOT_OBJECTS.companies.scopeRequired,
        sourceEndpoint: HUBSPOT_OBJECTS.companies.sourceEndpoint,
        note: companiesResult.status === 403 ? 'Escopo ausente para ler companies.' : companiesResult.errorMessage,
        countKind: 'not_available',
      });

  const contactsEntity = contactsResult.ok
    ? buildEntitySummary({
        objectType: 'contacts',
        label: HUBSPOT_OBJECTS.contacts.label,
        selected: HUBSPOT_OBJECTS.contacts.selected,
        status: 'available',
        hubspotTotalCount: contactsResult.total,
        canopiTaggedCount: contactsCanopiResult?.count ?? null,
        canopiBatchCount: contactsBatchResult?.count ?? null,
        canopiTagStatus: contactsCanopiResult?.status ?? 'not_configured',
        canopiBatchStatus: contactsBatchResult?.status ?? 'not_configured',
        scopeRequired: HUBSPOT_OBJECTS.contacts.scopeRequired,
        sourceEndpoint: HUBSPOT_OBJECTS.contacts.sourceEndpoint,
        note: contactsCanopiResult?.status === 'available'
          ? contactsBatchResult?.status === 'available'
            ? 'Total real do HubSpot. Canopi calculada por canopi_contact_id; lote por canopi_import_batch_id.'
            : 'Total real do HubSpot. Canopi calculada por canopi_contact_id.'
          : contactsCanopiResult?.status === 'not_configured'
            ? 'Total real do HubSpot. Propriedade Canopi não encontrada nesta conta.'
            : contactsCanopiResult?.status === 'missing_scope'
              ? 'Escopo de schema ausente para ler propriedades Canopi.'
              : 'Total real retornado pelo HubSpot Search API.',
        countKind: 'real_total',
      })
    : buildEntitySummary({
        objectType: 'contacts',
        label: HUBSPOT_OBJECTS.contacts.label,
        selected: HUBSPOT_OBJECTS.contacts.selected,
        status: contactsResult.status === 403 ? 'missing_scope' : contactsResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        canopiTagStatus: contactsResult.status === 403 ? 'missing_scope' : 'error',
        canopiBatchStatus: contactsResult.status === 403 ? 'missing_scope' : 'error',
        scopeRequired: HUBSPOT_OBJECTS.contacts.scopeRequired,
        sourceEndpoint: HUBSPOT_OBJECTS.contacts.sourceEndpoint,
        note: contactsResult.status === 403 ? 'Escopo ausente para ler contacts.' : contactsResult.errorMessage,
        countKind: 'not_available',
      });

  const dealsEntity = buildEntitySummary({
    objectType: 'deals',
    label: HUBSPOT_OBJECTS.deals.label,
    selected: HUBSPOT_OBJECTS.deals.selected,
    status: 'not_implemented',
    hubspotTotalCount: null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    canopiTagStatus: 'not_configured',
    canopiBatchStatus: 'not_configured',
    scopeRequired: HUBSPOT_OBJECTS.deals.scopeRequired,
    sourceEndpoint: HUBSPOT_OBJECTS.deals.sourceEndpoint,
    note: HUBSPOT_OBJECTS.deals.note,
    countKind: 'not_implemented',
  });

  const leadsEntity = buildEntitySummary({
    objectType: 'leads',
    label: HUBSPOT_OBJECTS.leads.label,
    selected: HUBSPOT_OBJECTS.leads.selected,
    status: 'not_implemented',
    hubspotTotalCount: null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    canopiTagStatus: 'not_configured',
    canopiBatchStatus: 'not_configured',
    scopeRequired: HUBSPOT_OBJECTS.leads.scopeRequired,
    sourceEndpoint: HUBSPOT_OBJECTS.leads.sourceEndpoint,
    note: HUBSPOT_OBJECTS.leads.note,
    countKind: 'not_implemented',
  });

  const campaignsEntity = buildEntitySummary({
    objectType: 'campaigns',
    label: HUBSPOT_OBJECTS.campaigns.label,
    selected: HUBSPOT_OBJECTS.campaigns.selected,
    status: 'not_implemented',
    hubspotTotalCount: null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    canopiTagStatus: 'not_configured',
    canopiBatchStatus: 'not_configured',
    scopeRequired: HUBSPOT_OBJECTS.campaigns.scopeRequired,
    sourceEndpoint: HUBSPOT_OBJECTS.campaigns.sourceEndpoint,
    note: HUBSPOT_OBJECTS.campaigns.note,
    countKind: 'not_implemented',
  });

  const propertiesEntity = buildEntitySummary({
    objectType: 'properties',
    label: HUBSPOT_OBJECTS.properties.label,
    selected: HUBSPOT_OBJECTS.properties.selected,
    status: companiesCatalogResult.ok ? 'available' : companiesCatalogResult.status === 403 ? 'missing_scope' : 'error',
    hubspotTotalCount: companiesCatalogResult.ok ? companiesCatalogResult.total : null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    canopiTagStatus: 'not_configured',
    canopiBatchStatus: 'not_configured',
    scopeRequired: HUBSPOT_OBJECTS.properties.scopeRequired,
    sourceEndpoint: HUBSPOT_OBJECTS.properties.sourceEndpoint,
    note: companiesCatalogResult.ok
      ? 'Total real de propriedades da entidade Companies.'
      : companiesCatalogResult.status === 403
        ? 'Escopo ausente para ler propriedades de companies.'
        : companiesCatalogResult.errorMessage,
    countKind: companiesCatalogResult.ok ? 'real_total' : 'not_available',
  });

  const associationsEntity = buildEntitySummary({
    objectType: 'associations',
    label: HUBSPOT_OBJECTS.associations.label,
    selected: HUBSPOT_OBJECTS.associations.selected,
    status: 'not_implemented',
    hubspotTotalCount: null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    canopiTagStatus: 'not_configured',
    canopiBatchStatus: 'not_configured',
    scopeRequired: null,
    sourceEndpoint: null,
    note: 'Amostra de vínculos do primeiro registro lido. Não representa o total de associações do CRM.',
    countKind: 'sample',
  });

  const entitySummaries = [
    companiesEntity,
    contactsEntity,
    dealsEntity,
    leadsEntity,
    campaignsEntity,
    propertiesEntity,
    associationsEntity,
  ];

  const resolvedItems: HubspotIngestResolvedEntityItem[] = [
    {
      objectType: 'companies',
      label: HUBSPOT_OBJECTS.companies.label,
      totalHubspotCount: companiesEntity.hubspotTotalCount,
      canopiTaggedCount: companiesEntity.canopiTaggedCount,
      outsideCanopiCount: companiesEntity.outsideCanopiCount,
      sourceEndpoint: companiesEntity.sourceEndpoint,
    },
    {
      objectType: 'contacts',
      label: HUBSPOT_OBJECTS.contacts.label,
      totalHubspotCount: contactsEntity.hubspotTotalCount,
      canopiTaggedCount: contactsEntity.canopiTaggedCount,
      outsideCanopiCount: contactsEntity.outsideCanopiCount,
      sourceEndpoint: contactsEntity.sourceEndpoint,
    },
  ];

  const ambiguousItems: HubspotIngestAmbiguousItem[] = [];

  const scopeSnapshot = buildScopeSnapshot(
    companiesCatalogResult,
    contactsCatalogResult,
    companiesCanopiResult ?? {
      count: null,
      status: 'error',
      errorMessage: 'Não avaliado.',
      scopeRequired: 'crm.schemas.companies.read',
      sourceEndpoint: '/crm/v3/properties/companies',
      note: null,
    },
    contactsCanopiResult ?? {
      count: null,
      status: 'error',
      errorMessage: 'Não avaliado.',
      scopeRequired: 'crm.schemas.contacts.read',
      sourceEndpoint: '/crm/v3/properties/contacts',
      note: null,
    },
  );

  const blockers: string[] = [];
  if (!companiesResult.ok) blockers.push(companiesResult.status === 403 ? 'Sem escopo para ler Companies.' : companiesResult.errorMessage || 'Leitura de Companies indisponível.');
  if (!contactsResult.ok) blockers.push(contactsResult.status === 403 ? 'Sem escopo para ler Contacts.' : contactsResult.errorMessage || 'Leitura de Contacts indisponível.');
  if (companiesCanopiResult?.status === 'missing_scope') blockers.push('Sem escopo de schema para ler canopi_company_id.');
  if (contactsCanopiResult?.status === 'missing_scope') blockers.push('Sem escopo de schema para ler canopi_contact_id.');
  if (companiesCanopiResult?.status === 'not_configured') blockers.push('Propriedade canopi_company_id não encontrada.');
  if (contactsCanopiResult?.status === 'not_configured') blockers.push('Propriedade canopi_contact_id não encontrada.');

  const warnings: string[] = [];
  if (unresolvedContacts.length > 0) {
    warnings.push(`${unresolvedContacts.length} Contacts sem canopi_contact_id foram identificados no HubSpot.`);
  }
  warnings.push('Deals, Leads, Campaigns, Properties e Associações permanecem fora do primeiro recorte de ingestão canônica.');

  const status = buildContractStatus(blockers);
  const dryRunSummary: HubspotIngestDryRunSummary = {
    generatedAt: loadedAt,
    status,
    companiesHubspotCount: companiesEntity.hubspotTotalCount,
    companiesCanopiCount: companiesEntity.canopiTaggedCount,
    companiesWithoutCanopiId: companiesEntity.outsideCanopiCount,
    contactsHubspotCount: contactsEntity.hubspotTotalCount,
    contactsCanopiCount: contactsEntity.canopiTaggedCount,
    contactsWithoutCanopiId: contactsEntity.outsideCanopiCount,
    unresolvedItemsCount: contactsWithoutCanopiIdTotal ?? unresolvedContacts.length,
    ambiguousItemsCount: ambiguousItems.length,
    entitySummaries,
    outOfScopeObjects: ['deals', 'leads', 'campaigns', 'properties', 'associations'],
    blockers,
    warnings,
    recommendation: buildRecommendation(status),
  };

  const contractJson: HubspotIngestContractJson = {
    version: 'c2.9e.2a',
    provider: HUBSPOT_PROVIDER,
    sourceConnectionId: input.sourceConnectionId ?? null,
    createdBy: input.createdBy ?? null,
    createdAt: loadedAt,
    updatedAt: loadedAt,
    selectedObjects: [
      buildSelection('companies'),
      buildSelection('contacts'),
      buildSelection('deals'),
      buildSelection('leads'),
      buildSelection('campaigns'),
      buildSelection('properties'),
      buildSelection('associations'),
    ],
    identityPolicy: {
      companies: {
        canonicalTarget: 'accounts',
        stableIdentifierField: 'canopi_company_id',
        matchStrategy: 'canopi_id_first_then_evidence',
        evidenceFields: ['domain', 'website', 'name'],
        matchSignals: ['domain', 'website', 'hs_object_id'],
        canopiIdField: 'canopi_company_id',
        canopiBatchField: 'canopi_import_batch_id',
        notes: 'Companies entram no primeiro recorte com prioridade por canopi_company_id e evidências de domínio/website/nome.',
      },
      contacts: {
        canonicalTarget: 'contacts',
        stableIdentifierField: 'canopi_contact_id',
        matchStrategy: 'canopi_id_first_then_evidence',
        evidenceFields: ['email', 'firstname', 'lastname', 'phone', 'jobtitle'],
        matchSignals: ['email', 'firstname', 'lastname', 'associated_company', 'phone'],
        canopiIdField: 'canopi_contact_id',
        canopiBatchField: 'canopi_import_batch_id',
        notes: 'Contacts entram no primeiro recorte com prioridade por canopi_contact_id e evidências de email/nome/empresa/telefone. Os 2 registros sem tag permanecem como backlog futuro.',
      },
    },
    scopeSnapshot,
    resolvedItems,
    unresolvedItems: unresolvedContacts,
    ambiguousItems,
    dryRunSummary,
    canonicalTargets: {
      companies: 'accounts',
      contacts: 'contacts',
    },
  };

  return {
    contractJson,
    dryRunSummary,
    status,
    unresolvedItems: unresolvedContacts,
    ambiguousItems,
  };
}

type HubspotIngestContractRow = {
  id: string;
  provider: string;
  status: HubspotIngestContractStatus;
  source_connection_id: string | null;
  created_by: string | null;
  contract_json: HubspotIngestContractJson;
  dry_run_summary: HubspotIngestDryRunSummary;
  execution_summary: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapContractRow(row: HubspotIngestContractRow): HubspotIngestContract {
  return {
    id: row.id,
    provider: row.provider as 'hubspot',
    status: row.status,
    sourceConnectionId: row.source_connection_id,
    createdBy: row.created_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dryRunSummary: row.dry_run_summary,
    contractJson: row.contract_json,
    executionSummary: row.execution_summary,
  };
}

export async function saveHubspotIngestContract(params: {
  contractJson: HubspotIngestContractJson;
  dryRunSummary: HubspotIngestDryRunSummary;
  status: HubspotIngestContractStatus;
  sourceConnectionId: string | null;
  createdBy: string | null;
  notes: string | null;
}): Promise<HubspotIngestContract> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('hubspot_ingest_contracts')
    .insert({
      provider: HUBSPOT_PROVIDER,
      status: params.status,
      source_connection_id: params.sourceConnectionId,
      created_by: params.createdBy,
      contract_json: params.contractJson,
      dry_run_summary: params.dryRunSummary,
      execution_summary: null,
      notes: params.notes,
    })
    .select('id, provider, status, source_connection_id, created_by, contract_json, dry_run_summary, execution_summary, notes, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new Error('SAVE_HUBSPOT_INGEST_CONTRACT_FAILED');
  }

  return mapContractRow(data as HubspotIngestContractRow);
}

export async function getHubspotIngestContractById(id: string): Promise<HubspotIngestContract | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('hubspot_ingest_contracts')
    .select('id, provider, status, source_connection_id, created_by, contract_json, dry_run_summary, execution_summary, notes, created_at, updated_at')
    .eq('provider', HUBSPOT_PROVIDER)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error('READ_HUBSPOT_INGEST_CONTRACT_FAILED');
  }
  if (!data) return null;
  return mapContractRow(data as HubspotIngestContractRow);
}

export async function listHubspotIngestContracts(limit = 20): Promise<HubspotIngestContractSummary[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('hubspot_ingest_contracts')
    .select('id, provider, status, source_connection_id, created_by, dry_run_summary, notes, created_at, updated_at')
    .eq('provider', HUBSPOT_PROVIDER)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error('READ_HUBSPOT_INGEST_CONTRACT_LIST_FAILED');
  }

  return (data ?? []).map((row) => {
    const contractRow = row as {
      id: string;
      provider: string;
      status: HubspotIngestContractStatus;
      source_connection_id: string | null;
      created_by: string | null;
      dry_run_summary: HubspotIngestDryRunSummary;
      notes: string | null;
      created_at: string;
      updated_at: string;
    };

    return {
      id: contractRow.id,
      provider: contractRow.provider as 'hubspot',
      status: contractRow.status,
      sourceConnectionId: contractRow.source_connection_id,
      createdBy: contractRow.created_by,
      notes: contractRow.notes,
      createdAt: contractRow.created_at,
      updatedAt: contractRow.updated_at,
      dryRunSummary: contractRow.dry_run_summary,
    };
  });
}

export function validateHubspotIngestConnectionId(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isUuidLike(trimmed)) {
    throw new Error('INVALID_SOURCE_CONNECTION_ID');
  }
  return trimmed;
}

export function validateOptionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
