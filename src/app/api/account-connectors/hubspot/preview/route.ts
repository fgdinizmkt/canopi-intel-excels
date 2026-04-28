import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type HubspotCompanyRecord = {
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
  properties?: Record<string, unknown>;
};

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function sanitizeHubspotError(status: number): string {
  if (status === 400) return 'Token inválido ou malformado.';
  if (status === 401 || status === 403) return 'Token inválido, revogado ou sem permissão para ler companies.';
  if (status === 404) return 'HubSpot não retornou dados para este token.';
  if (status === 429) return 'HubSpot atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'HubSpot indisponível no momento.';
  return 'Não foi possível carregar o preview de companies.';
}

function sanitizeCompany(company: HubspotCompanyRecord) {
  const properties = company.properties || {};
  return {
    id: readString(company.id) || readString(properties.hs_object_id) || '',
    name: readString(properties.name),
    domain: readString(properties.domain),
    industry: readString(properties.industry),
    country: readString(properties.country),
    ownerId: readString(properties.hubspot_owner_id),
    createdAt: readString(company.createdAt),
    updatedAt: readString(company.updatedAt),
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
        error: 'Informe um token de Private App para carregar o preview de companies.',
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/companies?limit=10&archived=false&properties=name,domain,industry,country,hubspot_owner_id',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

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
      results?: HubspotCompanyRecord[];
    } | null;

    const companies = Array.isArray(payload?.results)
      ? payload.results.slice(0, 10).map(sanitizeCompany)
      : [];

    return NextResponse.json({
      status: 'success',
      provider: 'hubspot',
      loadedAt: new Date().toISOString(),
      count: companies.length,
      companies,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: 'Não foi possível carregar o preview de companies no momento.',
      },
      { status: 502 }
    );
  }
}
