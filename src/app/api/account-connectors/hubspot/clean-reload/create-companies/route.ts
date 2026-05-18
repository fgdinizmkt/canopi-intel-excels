import { NextRequest, NextResponse } from 'next/server';
import {
  runHubspotCleanReloadCompanyCreate,
  CLEAN_RELOAD_COMPANY_CREATE_CONTRACT_VERSION,
} from '@/src/lib/server/hubspotCleanReloadCompanyCreateService';

const BLOCKED_KEYS = ['token', 'contacts', 'deals', 'products', 'services', 'reset', 'delete', 'upsert', 'applyAll'];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ status: 'error', error: 'INVALID_JSON', canProceedToContactCreate: false }, { status: 400 });
  }

  // Blocked payload keys
  const blocked = BLOCKED_KEYS.filter((k) => k in body);
  if (blocked.length > 0) {
    return NextResponse.json(
      { status: 'error', error: 'BLOCKED_PAYLOAD_KEYS', blockedKeys: blocked, canProceedToContactCreate: false },
      { status: 400 },
    );
  }

  // Required: confirmCreateCompanies
  if (body.confirmCreateCompanies !== true) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'CONFIRM_REQUIRED',
        message: 'confirmCreateCompanies: true é obrigatório para executar o create real.',
        canProceedToContactCreate: false,
      },
      { status: 400 },
    );
  }

  // Required: batchId
  const batchId = typeof body.batchId === 'string' ? body.batchId.trim() : '';
  if (!batchId) {
    return NextResponse.json(
      { status: 'error', error: 'BATCH_ID_REQUIRED', message: 'batchId é obrigatório.', canProceedToContactCreate: false },
      { status: 400 },
    );
  }

  // Required: tenantId
  const tenantId = typeof body.tenantId === 'string' ? body.tenantId.trim() : '';
  if (!tenantId) {
    return NextResponse.json(
      { status: 'error', error: 'TENANT_ID_REQUIRED', message: 'tenantId é obrigatório.', canProceedToContactCreate: false },
      { status: 400 },
    );
  }

  const contractVersion =
    typeof body.contractVersion === 'string' ? body.contractVersion.trim() : CLEAN_RELOAD_COMPANY_CREATE_CONTRACT_VERSION;

  const resumeMode = body.resumeMode === true;

  try {
    const result = await runHubspotCleanReloadCompanyCreate({ batchId, tenantId, contractVersion, resumeMode });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'INTERNAL_ERROR';
    return NextResponse.json({ status: 'error', error: msg, canProceedToContactCreate: false }, { status: 422 });
  }
}
