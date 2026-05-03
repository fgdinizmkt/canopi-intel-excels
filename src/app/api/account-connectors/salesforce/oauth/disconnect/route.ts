import { NextResponse } from 'next/server';
import { revokeAndDisconnect } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await revokeAndDisconnect();
    return NextResponse.json({ status: 'success' });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Não foi possível desconectar OAuth no momento.',
      },
      { status: 500 }
    );
  }
}
