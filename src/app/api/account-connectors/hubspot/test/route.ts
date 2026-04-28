import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type HubspotTokenInfo = {
  hub_id?: number | string;
  hubId?: number | string;
  scopes?: string[] | string;
};

function parseScopes(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((scope) => String(scope).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[\s,]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
  }
  return [];
}

function sanitizeHubspotError(status: number): string {
  if (status === 400) return 'Token inválido ou malformado.';
  if (status === 401 || status === 403) return 'Token inválido, revogado ou sem permissão para ler companies.';
  if (status === 404) return 'HubSpot não retornou dados para este token.';
  if (status === 429) return 'HubSpot atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'HubSpot indisponível no momento.';
  return 'Não foi possível validar a conexão HubSpot.';
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
        error: 'Informe um token de Private App para testar a conexão HubSpot.',
      },
      { status: 400 }
    );
  }

  let hubId: string | null = null;
  let scopes: string[] = [];

  try {
    const infoResponse = await fetch('https://api.hubapi.com/oauth/v2/private-apps/get/access-token-info', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenKey: token }),
      cache: 'no-store',
    });

    if (infoResponse.ok) {
      const info = (await infoResponse.json().catch(() => null)) as HubspotTokenInfo | null;
      hubId = info?.hub_id !== undefined
        ? String(info.hub_id)
        : info?.hubId !== undefined
          ? String(info.hubId)
          : null;
      scopes = parseScopes(info?.scopes);
    }
  } catch {
    // Introspection is optional. Continue to the read-only access check.
  }

  const companiesResponse = await fetch('https://api.hubapi.com/crm/v3/objects/companies?limit=1&archived=false', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!companiesResponse.ok) {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: sanitizeHubspotError(companiesResponse.status),
      },
      { status: companiesResponse.status >= 500 ? 502 : companiesResponse.status }
    );
  }

  return NextResponse.json({
    status: 'success',
    provider: 'hubspot',
    testedAt: new Date().toISOString(),
    hubId,
    scopes,
    readAccessConfirmed: true,
  });
}
