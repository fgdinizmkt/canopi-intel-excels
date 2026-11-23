import { NextResponse } from 'next/server';
import { runHubspotAuditDeals } from '@/src/lib/server/hubspotAuditDealsService';

export async function GET() {
  try {
    const result = await runHubspotAuditDeals();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'INTERNAL_ERROR';
    return NextResponse.json({ status: 'error', error: message, canProceedToNextRecorte: false }, { status: 422 });
  }
}
