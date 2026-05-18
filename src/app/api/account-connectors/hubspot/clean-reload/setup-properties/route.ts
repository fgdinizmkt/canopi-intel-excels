import { NextResponse } from 'next/server';
import { runHubspotCleanReloadSetup } from '@/src/lib/server/hubspotCleanReloadSetupService';

const BLOCKED_PAYLOAD_KEYS = ['token', 'records', 'companies', 'contacts', 'apply', 'create', 'reset'];

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
      { status: 'error', error: 'BLOCKED_PAYLOAD_KEYS', blocked: blockedKeys, canProceedToCleanCreate: false },
      { status: 400 },
    );
  }

  const rawMode = readString(body.mode_setup);
  const mode = rawMode === 'create_missing' ? 'create_missing' : 'verify';
  const confirm = body.confirm === true;
  const contractVersion = readString(body.contractVersion) ?? undefined;

  if (mode === 'create_missing' && !confirm) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'CONFIRM_REQUIRED',
        message: 'mode_setup=create_missing requer confirm=true explícito.',
        canProceedToCleanCreate: false,
      },
      { status: 400 },
    );
  }

  try {
    const result = await runHubspotCleanReloadSetup({ mode, contractVersion });
    const httpStatus = result.status === 'error' ? 422 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return NextResponse.json(
      { status: 'error', error: message, canProceedToCleanCreate: false },
      { status: 500 },
    );
  }
}
