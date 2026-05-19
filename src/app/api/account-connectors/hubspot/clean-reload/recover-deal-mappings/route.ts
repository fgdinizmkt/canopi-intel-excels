import { NextRequest, NextResponse } from 'next/server';
import {
  runHubspotCleanReloadDealRecovery,
  DEAL_RECOVERY_CONTRACT_VERSION,
  type KnownDealMapping,
} from '@/src/lib/server/hubspotCleanReloadDealRecoveryService';

const BLOCKED_KEYS = ['token', 'contacts', 'companies', 'deals', 'products', 'services', 'reset', 'delete', 'upsert', 'applyAll'];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ status: 'error', error: 'INVALID_JSON', canProceedToNextRecorte: false }, { status: 400 });
  }

  const blocked = BLOCKED_KEYS.filter((k) => k in body);
  if (blocked.length > 0) {
    return NextResponse.json(
      { status: 'error', error: 'BLOCKED_PAYLOAD_KEYS', blockedKeys: blocked, canProceedToNextRecorte: false },
      { status: 400 },
    );
  }

  if (body.confirmRecoverDealMappings !== true) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'CONFIRM_REQUIRED',
        message: 'confirmRecoverDealMappings: true é obrigatório.',
        canProceedToNextRecorte: false,
      },
      { status: 400 },
    );
  }

  const batchId = typeof body.batchId === 'string' ? body.batchId.trim() : '';
  if (!batchId) {
    return NextResponse.json(
      { status: 'error', error: 'BATCH_ID_REQUIRED', message: 'batchId é obrigatório.', canProceedToNextRecorte: false },
      { status: 400 },
    );
  }

  const tenantId = typeof body.tenantId === 'string' ? body.tenantId.trim() : '';
  if (!tenantId) {
    return NextResponse.json(
      { status: 'error', error: 'TENANT_ID_REQUIRED', message: 'tenantId é obrigatório.', canProceedToNextRecorte: false },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.knownDealMappings) || body.knownDealMappings.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'KNOWN_DEAL_MAPPINGS_REQUIRED', message: 'knownDealMappings[] é obrigatório e não pode ser vazio.', canProceedToNextRecorte: false },
      { status: 400 },
    );
  }

  const knownDealMappings = (body.knownDealMappings as unknown[]).filter(
    (item): item is KnownDealMapping =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).canonicalId === 'string' &&
      typeof (item as Record<string, unknown>).hsObjectId === 'string',
  );

  if (knownDealMappings.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'KNOWN_DEAL_MAPPINGS_INVALID', message: 'Nenhum item válido em knownDealMappings.', canProceedToNextRecorte: false },
      { status: 400 },
    );
  }

  const contractVersion =
    typeof body.contractVersion === 'string' ? body.contractVersion.trim() : DEAL_RECOVERY_CONTRACT_VERSION;

  try {
    const result = await runHubspotCleanReloadDealRecovery({ batchId, tenantId, contractVersion, knownDealMappings });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'INTERNAL_ERROR';
    return NextResponse.json({ status: 'error', error: msg, canProceedToNextRecorte: false }, { status: 422 });
  }
}
