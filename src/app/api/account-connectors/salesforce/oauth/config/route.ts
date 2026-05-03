import { NextRequest, NextResponse } from 'next/server';
import { getOAuthConfigStatus, saveOAuthConfig, toSafeConfigResponse } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function parseScopes(raw: unknown): string[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(/[\s,]+/).map((v) => v.trim()).filter(Boolean);
  }
  return undefined;
}

export async function GET() {
  try {
    const config = await getOAuthConfigStatus();
    return NextResponse.json(toSafeConfigResponse(config));
  } catch {
    return NextResponse.json(
      {
        configured: false,
        clientIdConfigured: false,
        clientSecretConfigured: false,
        loginUrl: 'https://login.salesforce.com',
        redirectUri: '',
        scopes: ['api', 'refresh_token'],
        callbackUrl: '',
        updatedAt: null,
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      clientId?: unknown;
      clientSecret?: unknown;
      loginUrl?: unknown;
      redirectUri?: unknown;
      scopes?: unknown;
    };

    const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : '';
    const clientSecret = typeof body.clientSecret === 'string' ? body.clientSecret.trim() : '';
    const redirectUri = typeof body.redirectUri === 'string' ? body.redirectUri.trim() : '';
    const loginUrl = typeof body.loginUrl === 'string' ? body.loginUrl.trim() : '';
    const scopes = parseScopes(body.scopes);

    await saveOAuthConfig({ clientId, clientSecret, redirectUri, loginUrl, scopes });

    const saved = await getOAuthConfigStatus();
    return NextResponse.json({
      status: 'success',
      message: 'Configuração OAuth salva.',
      config: toSafeConfigResponse(saved),
    });
  } catch (error) {
    const code = (error as Error).message;
    const errorMessage =
      code === 'CLIENT_ID_REQUIRED'
        ? 'Client ID é obrigatório.'
        : code === 'REDIRECT_URI_REQUIRED'
        ? 'Redirect URI é obrigatório.'
        : code === 'CLIENT_SECRET_REQUIRED'
        ? 'Client Secret é obrigatório para salvar a configuração.'
        : 'Não foi possível salvar a configuração OAuth.';

    return NextResponse.json(
      {
        status: 'error',
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
