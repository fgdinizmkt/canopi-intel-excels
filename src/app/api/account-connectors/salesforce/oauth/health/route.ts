import { NextResponse } from 'next/server';
import { validateConnectionHealth } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const status = await validateConnectionHealth();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        status: 'error',
        error: 'Não foi possível validar a conexão OAuth no momento.',
      },
      { status: 500 }
    );
  }
}
