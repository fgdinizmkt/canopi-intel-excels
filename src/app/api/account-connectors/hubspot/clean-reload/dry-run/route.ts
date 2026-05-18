import { NextResponse } from 'next/server';
import { runHubspotCleanReloadDryRun } from '@/src/lib/server/hubspotCleanReloadDryRunService';

const BLOCKED_PAYLOAD_KEYS = [
  'token',
  'companies',
  'contacts',
  'records',
  'mode',
  'apply',
  'create',
  'reset',
];

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'INVALID_JSON', canProceedToCleanCreate: false },
      { status: 400 },
    );
  }

  const blockedKeys = BLOCKED_PAYLOAD_KEYS.filter((k) => k in body);
  if (blockedKeys.length > 0) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'BLOCKED_PAYLOAD_KEYS',
        blocked: blockedKeys,
        canProceedToCleanCreate: false,
      },
      { status: 400 },
    );
  }

  const batchId = readString(body.batchId);
  if (!batchId) {
    return NextResponse.json(
      { status: 'error', error: 'BATCH_ID_REQUIRED', canProceedToCleanCreate: false },
      { status: 400 },
    );
  }

  const contractVersion = readString(body.contractVersion) ?? undefined;
  const tenantId = readString(body.tenantId) ?? null;
  const rawSampleSize = typeof body.sampleSize === 'number' ? body.sampleSize : 5;
  const sampleSize = Math.max(1, Math.min(20, rawSampleSize));

  try {
    const result = await runHubspotCleanReloadDryRun({
      batchId,
      contractVersion,
      tenantId,
      sampleSize,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return NextResponse.json(
      { status: 'error', error: message, canProceedToCleanCreate: false },
      { status: 500 },
    );
  }
}
