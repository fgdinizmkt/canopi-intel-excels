import { NextResponse } from 'next/server';
import {
  getOAuthConfigStatus,
  getOAuthConnection,
  fetchMultiObjectDiscovery,
  DEFAULT_API_VERSION,
} from '@/src/lib/server/salesforceOAuthService';
import { decryptToken } from '@/src/lib/server/oauthTokenCrypto';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const config = await getOAuthConfigStatus();
    if (!config.configured) {
      return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 400 });
    }

    const row = await getOAuthConnection();
    if (!row || row.status !== 'connected') {
      return NextResponse.json({ error: 'NOT_CONNECTED' }, { status: 400 });
    }

    const accessToken = decryptToken(row.access_token_encrypted);
    const instanceUrl = row.instance_url || '';
    const apiVersion = row.api_version || DEFAULT_API_VERSION;

    if (!accessToken || !instanceUrl) {
      return NextResponse.json({ error: 'MISSING_CREDENTIALS' }, { status: 400 });
    }

    const discoveries = await fetchMultiObjectDiscovery(instanceUrl, accessToken, apiVersion);
    return NextResponse.json({ discoveries });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível executar o discovery de metadados no momento.' },
      { status: 500 },
    );
  }
}
