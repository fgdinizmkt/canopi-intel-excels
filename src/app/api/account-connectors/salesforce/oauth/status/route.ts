import { NextResponse } from 'next/server';
import { getOAuthConfigStatus, getOAuthConnection, toSafeStatus } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getOAuthConfigStatus();
    const row = config.configured ? await getOAuthConnection() : null;
    return NextResponse.json(toSafeStatus(config, row));
  } catch {
    return NextResponse.json(
      {
        configured: false,
        connected: false,
        status: 'error',
        instanceUrl: null,
        orgId: null,
        userId: null,
        scopes: ['api', 'refresh_token'],
        lastHealthCheckAt: null,
        accountLabel: null,
        accountFieldsCount: null,
        apiVersion: 'v66.0',
        error: 'Não foi possível carregar o estado OAuth no momento.',
        configChecklist: {
          clientId: false,
          clientSecret: false,
          redirectUri: false,
          loginUrl: true,
        },
      },
      { status: 200 }
    );
  }
}
