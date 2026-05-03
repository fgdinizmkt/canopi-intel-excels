import { NextResponse } from 'next/server';
import {
  buildAuthorizeUrl,
  generateOAuthState,
  getOAuthConfigStatus,
  OAUTH_STATE_COOKIE,
  resolveSalesforceAppOrigin,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getOAuthConfigStatus();
  if (!config.configured) {
    const appOrigin = resolveSalesforceAppOrigin(config.redirectUri);
    const fallback = new URL('/configuracoes/objetos-crm/salesforce?salesforceOAuthStatus=config_missing', appOrigin);
    return NextResponse.redirect(fallback.toString(), { status: 302 });
  }

  const state = generateOAuthState();
  const redirectUrl = buildAuthorizeUrl(config, state);

  const response = NextResponse.redirect(redirectUrl, { status: 302 });
  response.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  return response;
}
