import { NextRequest, NextResponse } from 'next/server';
import type {
  HubspotSnapshotEntity,
  HubspotSnapshotEntityStatus,
  HubspotSnapshotCountKind,
  HubspotSnapshotPropertyStatus,
  HubspotSnapshotResult,
} from '@/src/lib/hubspotSnapshotTypes';

export const dynamic = 'force-dynamic';

type HubspotSearchResponse = {
  total?: number;
  results?: Array<{
    id?: string | number;
  }>;
  paging?: {
    next?: {
      after?: string;
    };
  };
};

type HubspotPropertyRecord = {
  name?: string;
};

type HubspotPropertyResponse = {
  total?: number;
  results?: HubspotPropertyRecord[];
};

type HubspotCampaignsResponse = {
  total?: number;
  results?: Array<{
    id?: string | number;
  }>;
};

type HubspotObjectRecord = {
  associations?: Record<string, unknown>;
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

async function readToken(request: NextRequest): Promise<string> {
  const body = (await request.json().catch(() => ({}))) as { token?: unknown; tokenKey?: unknown };
  if (typeof body.tokenKey === 'string' && body.tokenKey.trim()) return body.tokenKey.trim();
  if (typeof body.token === 'string' && body.token.trim()) return body.token.trim();
  const queryToken = request.nextUrl.searchParams.get('token');
  return queryToken && queryToken.trim() ? queryToken.trim() : '';
}

function buildEntity(params: {
  objectType: string;
  label: string;
  status: HubspotSnapshotEntityStatus;
  hubspotTotalCount: number | null;
  canopiTaggedCount: number | null;
  canopiBatchCount: number | null;
  outsideCanopiCount: number | null;
  count: number | null;
  sampleCount: number | null;
  countKind: HubspotSnapshotCountKind;
  canopiTagStatus?: HubspotSnapshotPropertyStatus;
  canopiBatchStatus?: HubspotSnapshotPropertyStatus;
  lastCheckedAt: string;
  errorMessage: string | null;
  scopeRequired: string | null;
  sourceEndpoint?: string | null;
  note?: string | null;
}): HubspotSnapshotEntity {
  return {
    objectType: params.objectType,
    label: params.label,
    status: params.status,
    hubspotTotalCount: params.hubspotTotalCount,
    canopiTaggedCount: params.canopiTaggedCount,
    canopiBatchCount: params.canopiBatchCount,
    outsideCanopiCount: params.outsideCanopiCount,
    count: params.count,
    sampleCount: params.sampleCount,
    countKind: params.countKind,
    canopiTagStatus: params.canopiTagStatus,
    canopiBatchStatus: params.canopiBatchStatus,
    lastCheckedAt: params.lastCheckedAt,
    errorMessage: params.errorMessage,
    scopeRequired: params.scopeRequired,
    source: 'hubspot',
    sourceEndpoint: params.sourceEndpoint || null,
    note: params.note || null,
  };
}

type HubspotSearchCountResult = {
  ok: boolean;
  status: number;
  errorMessage: string | null;
  total: number | null;
  sampleId: string | null;
};

type HubspotPropertyCatalogResult = {
  ok: boolean;
  status: number;
  errorMessage: string | null;
  total: number | null;
  propertyNames: Set<string>;
};

async function fetchSearchCount(token: string, objectType: 'companies' | 'contacts' | 'deals' | 'leads', propertyName = 'hs_object_id'): Promise<HubspotSearchCountResult> {
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
              propertyName,
              operator: 'HAS_PROPERTY',
            },
          ],
        },
      ],
      limit: 1,
      properties: ['hs_object_id'],
    }),
  });

  if (!response.ok) {
    return { ok: false, status: response.status, errorMessage: sanitizeHubspotError(response.status, objectType), total: null as number | null, sampleId: null as string | null };
  }

  const payload = (await response.json().catch(() => null)) as HubspotSearchResponse | null;
  const total = typeof payload?.total === 'number' ? payload.total : null;
  const sampleId = readString(payload?.results?.[0]?.id);

  return {
    ok: true,
    status: 200,
    errorMessage: null as string | null,
    total,
    sampleId,
  };
}

async function fetchCampaignCount(token: string): Promise<HubspotSearchCountResult> {
  const response = await fetch('https://api.hubapi.com/marketing/campaigns/2026-03?limit=1', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false, status: response.status, errorMessage: sanitizeHubspotError(response.status, 'campanhas'), total: null as number | null, sampleId: null as string | null };
  }

  const payload = (await response.json().catch(() => null)) as HubspotCampaignsResponse | null;
  const total = typeof payload?.total === 'number' ? payload.total : null;
  const sampleId = readString(payload?.results?.[0]?.id);

  return {
    ok: true,
    status: 200,
    errorMessage: null as string | null,
    total,
    sampleId,
  };
}

async function fetchPropertyCatalog(token: string, objectType: 'companies' | 'contacts' | 'deals'): Promise<HubspotPropertyCatalogResult> {
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

function computeOutsideCanopiCount(total: number | null, canopiTaggedCount: number | null): number | null {
  if (typeof total !== 'number' || typeof canopiTaggedCount !== 'number') return null;
  if (canopiTaggedCount > total) return null;
  return total - canopiTaggedCount;
}

type HubspotPropertyCountResult = {
  count: number | null;
  status: HubspotSnapshotPropertyStatus;
  errorMessage: string | null;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
};

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

  const searchResult = await fetchSearchCount(params.token, params.objectType, params.propertyName);

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

function countAssociations(associations: unknown): number {
  if (!associations || typeof associations !== 'object') return 0;

  return Object.values(associations as Record<string, unknown>).reduce<number>((total, value) => {
    if (Array.isArray(value)) return total + value.length;
    if (value && typeof value === 'object') {
      const nestedResults = (value as { results?: unknown }).results;
      if (Array.isArray(nestedResults)) return total + nestedResults.length;
    }
    return total;
  }, 0);
}

async function fetchAssociationSample(token: string, sampleSource: { objectType: 'companies' | 'contacts' | 'deals' | 'leads'; sampleId: string | null } | null, label: string) {
  if (!sampleSource?.sampleId) {
    return buildEntity({
      objectType: 'associations',
      label,
      status: 'not_implemented',
      hubspotTotalCount: null,
      canopiTaggedCount: null,
      canopiBatchCount: null,
      outsideCanopiCount: null,
      count: null,
      sampleCount: null,
      countKind: 'not_implemented',
      lastCheckedAt: new Date().toISOString(),
      errorMessage: null,
      scopeRequired: null,
      sourceEndpoint: null,
      note: 'Não foi possível amostrar associações sem um registro-base lido.',
    });
  }

  const associationsQuery = sampleSource.objectType === 'companies'
    ? 'contacts,deals'
    : sampleSource.objectType === 'contacts'
      ? 'companies,deals'
      : 'companies,contacts';

  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${sampleSource.objectType}/${sampleSource.sampleId}?associations=${associationsQuery}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const status = response.status === 403 ? 'missing_scope' : response.status === 404 ? 'unavailable' : 'error';
    const scopeRequiredByObject: Record<'companies' | 'contacts' | 'deals' | 'leads', string> = {
      companies: 'crm.objects.companies.read',
      contacts: 'crm.objects.contacts.read',
      deals: 'crm.objects.deals.read',
      leads: 'crm.objects.leads.read',
    };
    return buildEntity({
      objectType: 'associations',
      label,
      status,
      hubspotTotalCount: null,
      canopiTaggedCount: null,
      canopiBatchCount: null,
      outsideCanopiCount: null,
      count: null,
      sampleCount: null,
      countKind: 'not_available',
      lastCheckedAt: new Date().toISOString(),
      errorMessage: sanitizeHubspotError(response.status, 'associações'),
      scopeRequired: scopeRequiredByObject[sampleSource.objectType],
      sourceEndpoint: `${sampleSource.objectType}/:id?associations=${associationsQuery}`,
    });
  }

  const payload = (await response.json().catch(() => null)) as HubspotObjectRecord | null;
  const sampleCount = countAssociations(payload?.associations);

  return buildEntity({
    objectType: 'associations',
    label,
    status: 'available',
    hubspotTotalCount: null,
    canopiTaggedCount: null,
    canopiBatchCount: null,
    outsideCanopiCount: null,
    count: null,
    sampleCount,
    countKind: 'sample',
    lastCheckedAt: new Date().toISOString(),
    errorMessage: null,
    scopeRequired: {
      companies: 'crm.objects.companies.read',
      contacts: 'crm.objects.contacts.read',
      deals: 'crm.objects.deals.read',
      leads: 'crm.objects.leads.read',
    }[sampleSource.objectType],
    sourceEndpoint: `${sampleSource.objectType}/:id?associations=${associationsQuery}`,
    note: 'Amostra de vínculos do primeiro registro lido. Não representa o total de associações do CRM.',
  });
}

export async function POST(request: NextRequest) {
  const token = await readToken(request);
  if (!token) {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: 'Informe um token de Private App para montar o snapshot do HubSpot.',
      },
      { status: 400 }
    );
  }

  const loadedAt = new Date().toISOString();
  const companiesScope = 'crm.objects.companies.read';
  const contactsScope = 'crm.objects.contacts.read';
  const dealsScope = 'crm.objects.deals.read';
  const leadsScope = 'crm.objects.leads.read';
  const campaignsScope = 'marketing.campaigns.read';
  const companiesSchemaScope = 'crm.schemas.companies.read';
  const contactsSchemaScope = 'crm.schemas.contacts.read';

  const companiesTask = fetchSearchCount(token, 'companies');
  const contactsTask = fetchSearchCount(token, 'contacts');
  const dealsTask = fetchSearchCount(token, 'deals');
  const leadsTask = fetchSearchCount(token, 'leads');
  const campaignsTask = fetchCampaignCount(token);
  const companiesCatalogTask = fetchPropertyCatalog(token, 'companies');
  const contactsCatalogTask = fetchPropertyCatalog(token, 'contacts');

  const [companiesResult, contactsResult, dealsResult, leadsResult, campaignsResult, companiesCatalogResult, contactsCatalogResult] = await Promise.all([
    companiesTask,
    contactsTask,
    dealsTask,
    leadsTask,
    campaignsTask,
    companiesCatalogTask,
    contactsCatalogTask,
  ]);

  const companyCanopiTagResult = companiesResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'companies',
        propertyName: 'canopi_company_id',
        catalog: companiesCatalogResult,
        schemaScope: companiesSchemaScope,
      })
    : null;
  const companyCanopiBatchResult = companiesResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'companies',
        propertyName: 'canopi_import_batch_id',
        catalog: companiesCatalogResult,
        schemaScope: companiesSchemaScope,
      })
    : null;
  const contactCanopiTagResult = contactsResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'contacts',
        propertyName: 'canopi_contact_id',
        catalog: contactsCatalogResult,
        schemaScope: contactsSchemaScope,
      })
    : null;
  const contactCanopiBatchResult = contactsResult.ok
    ? await fetchCanopiPropertyCount({
        token,
        objectType: 'contacts',
        propertyName: 'canopi_import_batch_id',
        catalog: contactsCatalogResult,
        schemaScope: contactsSchemaScope,
      })
    : null;

  const companyEntity = companiesResult.ok
    ? buildEntity({
        objectType: 'companies',
        label: 'Contas / Companies',
        status: 'available',
        hubspotTotalCount: companiesResult.total,
        canopiTaggedCount: companyCanopiTagResult?.count ?? null,
        canopiBatchCount: companyCanopiBatchResult?.count ?? null,
        outsideCanopiCount: computeOutsideCanopiCount(companiesResult.total, companyCanopiTagResult?.count ?? null),
        count: companiesResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: companiesScope,
        sourceEndpoint: '/crm/v3/objects/companies/search',
        canopiTagStatus: companyCanopiTagResult?.status ?? 'not_configured',
        canopiBatchStatus: companyCanopiBatchResult?.status ?? 'not_configured',
        note: companyCanopiTagResult?.status === 'available'
          ? companyCanopiBatchResult?.status === 'available'
            ? 'Total real do HubSpot. Canopi calculada por canopi_company_id; lote por canopi_import_batch_id.'
            : 'Total real do HubSpot. Canopi calculada por canopi_company_id.'
          : companyCanopiTagResult?.status === 'not_configured'
            ? 'Total real do HubSpot. Propriedade Canopi não encontrada nesta conta.'
            : companyCanopiTagResult?.status === 'missing_scope'
              ? 'Total real do HubSpot. Escopo de schema ausente para ler propriedades Canopi.'
              : 'Total real retornado pelo HubSpot Search API.',
      })
    : buildEntity({
        objectType: 'companies',
        label: 'Contas / Companies',
        status: companiesResult.status === 403 ? 'missing_scope' : companiesResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: companiesResult.status === 403
          ? 'Escopo ausente para ler companies.'
          : companiesResult.errorMessage,
        scopeRequired: companiesScope,
        sourceEndpoint: '/crm/v3/objects/companies/search',
        canopiTagStatus: companiesResult.status === 403 ? 'missing_scope' : 'error',
        canopiBatchStatus: companiesResult.status === 403 ? 'missing_scope' : 'error',
      });

  const contactEntity = contactsResult.ok
    ? buildEntity({
        objectType: 'contacts',
        label: 'Contatos / Contacts',
        status: 'available',
        hubspotTotalCount: contactsResult.total,
        canopiTaggedCount: contactCanopiTagResult?.count ?? null,
        canopiBatchCount: contactCanopiBatchResult?.count ?? null,
        outsideCanopiCount: computeOutsideCanopiCount(contactsResult.total, contactCanopiTagResult?.count ?? null),
        count: contactsResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: contactsScope,
        sourceEndpoint: '/crm/v3/objects/contacts/search',
        canopiTagStatus: contactCanopiTagResult?.status ?? 'not_configured',
        canopiBatchStatus: contactCanopiBatchResult?.status ?? 'not_configured',
        note: contactCanopiTagResult?.status === 'available'
          ? contactCanopiBatchResult?.status === 'available'
            ? 'Total real do HubSpot. Canopi calculada por canopi_contact_id; lote por canopi_import_batch_id.'
            : 'Total real do HubSpot. Canopi calculada por canopi_contact_id.'
          : contactCanopiTagResult?.status === 'not_configured'
            ? 'Total real do HubSpot. Propriedade Canopi não encontrada nesta conta.'
            : contactCanopiTagResult?.status === 'missing_scope'
              ? 'Escopo de schema ausente para ler propriedades Canopi.'
              : 'Total real retornado pelo HubSpot Search API.',
      })
    : buildEntity({
        objectType: 'contacts',
        label: 'Contatos / Contacts',
        status: contactsResult.status === 403 ? 'missing_scope' : contactsResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: contactsResult.status === 403
          ? 'Escopo ausente para ler contacts.'
          : contactsResult.errorMessage,
        scopeRequired: contactsScope,
        sourceEndpoint: '/crm/v3/objects/contacts/search',
        canopiTagStatus: contactsResult.status === 403 ? 'missing_scope' : 'error',
        canopiBatchStatus: contactsResult.status === 403 ? 'missing_scope' : 'error',
      });

  const dealEntity = dealsResult.ok
    ? buildEntity({
        objectType: 'deals',
        label: 'Deals / Opportunities',
        status: 'available',
        hubspotTotalCount: dealsResult.total,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: dealsResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: dealsScope,
        sourceEndpoint: '/crm/v3/objects/deals/search',
        canopiTagStatus: 'not_configured',
        canopiBatchStatus: 'not_configured',
        note: 'Canopi ainda não escreve Deals neste fluxo.',
      })
    : buildEntity({
        objectType: 'deals',
        label: 'Deals / Opportunities',
        status: dealsResult.status === 403 ? 'missing_scope' : dealsResult.status === 404 ? 'not_implemented' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: dealsResult.status === 403
          ? 'Escopo ausente para ler deals.'
          : dealsResult.errorMessage,
        scopeRequired: dealsScope,
        sourceEndpoint: '/crm/v3/objects/deals/search',
        canopiTagStatus: 'not_configured',
        canopiBatchStatus: 'not_configured',
      });

  const leadEntity = leadsResult.ok
    ? buildEntity({
        objectType: 'leads',
        label: 'Leads',
        status: 'available',
        hubspotTotalCount: leadsResult.total,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: leadsResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: leadsScope,
        sourceEndpoint: '/crm/v3/objects/leads/search',
        note: 'Total real retornado pelo HubSpot Search API, se o objeto estiver disponível na conta.',
      })
    : buildEntity({
        objectType: 'leads',
        label: 'Leads',
        status: leadsResult.status === 403 ? 'missing_scope' : leadsResult.status === 404 ? 'not_implemented' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: leadsResult.status === 404 ? 'not_implemented' : 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: leadsResult.status === 403
          ? 'Escopo ausente para ler leads.'
          : leadsResult.errorMessage,
        scopeRequired: leadsScope,
        sourceEndpoint: '/crm/v3/objects/leads/search',
        canopiTagStatus: 'not_configured',
        canopiBatchStatus: 'not_configured',
      });

  const campaignEntity = campaignsResult.ok
    ? buildEntity({
        objectType: 'campaigns',
        label: 'Campanhas',
        status: 'available',
        hubspotTotalCount: campaignsResult.total,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: campaignsResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: campaignsScope,
        sourceEndpoint: '/marketing/campaigns/2026-03',
        note: 'Total real retornado pelo endpoint de listagem de campanhas.',
      })
    : buildEntity({
        objectType: 'campaigns',
        label: 'Campanhas',
        status: campaignsResult.status === 403 ? 'missing_scope' : campaignsResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: campaignsResult.status === 403
          ? 'Escopo ausente para ler campanhas.'
          : campaignsResult.errorMessage,
        scopeRequired: campaignsScope,
        sourceEndpoint: '/marketing/campaigns/2026-03',
        canopiTagStatus: 'not_configured',
        canopiBatchStatus: 'not_configured',
      });

  const propertyEntity = companiesCatalogResult.ok
    ? buildEntity({
        objectType: 'properties',
        label: 'Catálogo de propriedades',
        status: 'available',
        hubspotTotalCount: companiesCatalogResult.total,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: companiesCatalogResult.total,
        sampleCount: null,
        countKind: 'real_total',
        lastCheckedAt: loadedAt,
        errorMessage: null,
        scopeRequired: companiesSchemaScope,
        sourceEndpoint: '/crm/v3/properties/companies',
        note: 'Total real de propriedades da entidade Companies.',
      })
    : buildEntity({
        objectType: 'properties',
        label: 'Catálogo de propriedades',
        status: companiesCatalogResult.status === 403 ? 'missing_scope' : companiesCatalogResult.status === 404 ? 'unavailable' : 'error',
        hubspotTotalCount: null,
        canopiTaggedCount: null,
        canopiBatchCount: null,
        outsideCanopiCount: null,
        count: null,
        sampleCount: null,
        countKind: 'not_available',
        lastCheckedAt: loadedAt,
        errorMessage: companiesCatalogResult.status === 403
          ? 'Escopo ausente para ler propriedades de companies.'
          : companiesCatalogResult.errorMessage,
        scopeRequired: companiesSchemaScope,
        sourceEndpoint: '/crm/v3/properties/companies',
        canopiTagStatus: 'missing_scope',
        canopiBatchStatus: 'missing_scope',
      });

  const sampleSource = companiesResult.ok && companiesResult.sampleId
    ? { objectType: 'companies' as const, sampleId: companiesResult.sampleId }
    : contactsResult.ok && contactsResult.sampleId
      ? { objectType: 'contacts' as const, sampleId: contactsResult.sampleId }
      : dealsResult.ok && dealsResult.sampleId
        ? { objectType: 'deals' as const, sampleId: dealsResult.sampleId }
        : leadsResult.ok && leadsResult.sampleId
          ? { objectType: 'leads' as const, sampleId: leadsResult.sampleId }
          : null;

  const associationEntity = await fetchAssociationSample(token, sampleSource, 'Associações');

  return NextResponse.json({
    status: 'success',
    provider: 'hubspot',
    loadedAt,
    entities: [companyEntity, contactEntity, dealEntity, leadEntity, campaignEntity, propertyEntity, associationEntity],
  } satisfies HubspotSnapshotResult);
}
