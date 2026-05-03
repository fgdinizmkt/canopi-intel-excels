import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeAuthorizationCode,
  getOAuthConfigStatus,
  OAUTH_STATE_COOKIE,
  resolveSalesforceAppOrigin,
  upsertOAuthConnectionFromTokenPayload,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function redirectToSalesforcePage(appOrigin: string, status: string) {
  const url = new URL('/configuracoes/objetos-crm/salesforce', appOrigin);
  url.searchParams.set('salesforceOAuthStatus', status);
  return NextResponse.redirect(url, { status: 302 });
}

export async function GET(request: NextRequest) {
  const config = await getOAuthConfigStatus();
  const appOrigin = resolveSalesforceAppOrigin(config.redirectUri);
  if (!config.configured) {
    return redirectToSalesforcePage(appOrigin, 'config_missing');
  }

  const code = request.nextUrl.searchParams.get('code')?.trim() || '';
  const state = request.nextUrl.searchParams.get('state')?.trim() || '';
  const returnedError = request.nextUrl.searchParams.get('error');

  if (returnedError) {
    return redirectToSalesforcePage(appOrigin, 'authorization_denied');
  }

  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value || '';
  if (!state || !stateCookie || state !== stateCookie) {
    const resp = redirectToSalesforcePage(appOrigin, 'invalid_state');
    resp.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return resp;
  }

  if (!code) {
    const resp = redirectToSalesforcePage(appOrigin, 'missing_code');
    resp.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return resp;
  }

  try {
    const payload = await exchangeAuthorizationCode(code, config);
    await upsertOAuthConnectionFromTokenPayload(payload);
    const resp = redirectToSalesforcePage(appOrigin, 'success');
    resp.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return resp;
  } catch {
    const resp = redirectToSalesforcePage(appOrigin, 'callback_error');
    resp.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return resp;
  }
}
