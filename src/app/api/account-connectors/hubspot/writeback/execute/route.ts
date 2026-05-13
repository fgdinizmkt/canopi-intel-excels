import { NextRequest, NextResponse } from 'next/server';
import type { HubspotWritebackDryRunResult } from '@/src/lib/hubspotWritebackTypes';
import type {
  HubspotWritebackExecuteError,
} from '@/src/lib/hubspotWritebackExecuteTypes';
import { executeHubspotWriteback } from '@/src/lib/hubspotWritebackExecute';

export const dynamic = 'force-dynamic';

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readStringRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((accumulator, [key, entry]) => {
    const normalizedKey = readString(key);
    const normalizedValue = readString(entry);
    if (normalizedKey && normalizedValue) {
      accumulator[normalizedKey] = normalizedValue;
    }
    return accumulator;
  }, {});
}

function extractToken(request: NextRequest, body: Record<string, unknown>) {
  const tokenFromBody = typeof body.tokenKey === 'string'
    ? body.tokenKey.trim()
    : typeof body.token === 'string'
      ? body.token.trim()
      : '';

  if (tokenFromBody) return tokenFromBody;

  const url = new URL(request.url);
  return url.searchParams.get('tokenKey')?.trim() || url.searchParams.get('token')?.trim() || '';
}

function isDryRunResult(value: unknown): value is HubspotWritebackDryRunResult {
  if (!value || typeof value !== 'object') return false;
  const dryRun = value as HubspotWritebackDryRunResult;
  return dryRun.status === 'success' && Array.isArray(dryRun.blockers) && Array.isArray(dryRun.warnings) && typeof dryRun.analyzedAt === 'string';
}

export async function GET() {
  const error: HubspotWritebackExecuteError = {
    status: 'error',
    provider: 'hubspot',
    error: 'Use POST para executar o writeback protegido da HubSpot.',
  };
  return NextResponse.json(error, { status: 405 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const token = extractToken(request, body);
  const confirmWriteback = readBoolean(body.confirmWriteback);
  const setupReady = readBoolean(body.setupReady);
  const dryRun = body.dryRun;
  const executionModeRaw = readString(body.executionMode);
  const executionMode = executionModeRaw === 'remaining' ? 'remaining' : executionModeRaw === 'limited' ? 'limited' : null;
  const maxCompaniesPerBatch = readNumber(body.maxCompaniesPerBatch, readNumber(body.maxCompanies, 50));
  const maxContactsPerBatch = readNumber(body.maxContactsPerBatch, readNumber(body.maxContacts, 50));
  const maxAssociationsPerBatch = readNumber(body.maxAssociationsPerBatch, readNumber(body.maxAssociations, 50));
  const sentCompanyHubspotIds = readStringRecord(body.sentCompanyHubspotIds);
  const sentContactHubspotIds = readStringRecord(body.sentContactHubspotIds);

  if (!token) {
    const error: HubspotWritebackExecuteError = {
      status: 'error',
      provider: 'hubspot',
      error: 'Informe um token válido do HubSpot para executar o writeback protegido.',
    };
    return NextResponse.json(error, { status: 400 });
  }

  if (!confirmWriteback) {
    const error: HubspotWritebackExecuteError = {
      status: 'error',
      provider: 'hubspot',
      error: 'Confirmação explícita ausente para executar writeback.',
    };
    return NextResponse.json(error, { status: 400 });
  }

  if (!setupReady) {
    const error: HubspotWritebackExecuteError = {
      status: 'error',
      provider: 'hubspot',
      error: 'O setup HubSpot ainda não está pronto para writeback real.',
      details: 'Valide pré-requisitos, propriedades Canopi e scopes de escrita antes de enviar.',
    };
    return NextResponse.json(error, { status: 403 });
  }

  if (!isDryRunResult(dryRun)) {
    const error: HubspotWritebackExecuteError = {
      status: 'error',
      provider: 'hubspot',
      error: 'O dry-run informado é inválido ou está ausente.',
    };
    return NextResponse.json(error, { status: 400 });
  }

  if (!executionMode) {
    const error: HubspotWritebackExecuteError = {
      status: 'error',
      provider: 'hubspot',
      error: 'Modo de execução inválido.',
    };
    return NextResponse.json(error, { status: 400 });
  }

  const result = await executeHubspotWriteback({
    token,
    confirmWriteback,
    setupReady,
    dryRun,
    executionMode,
    maxCompaniesPerBatch,
    maxContactsPerBatch,
    maxAssociationsPerBatch,
    sentCompanyHubspotIds,
    sentContactHubspotIds,
    sentCompanyIds: Array.isArray(body.sentCompanyIds) ? body.sentCompanyIds.map(String) : undefined,
    sentContactIds: Array.isArray(body.sentContactIds) ? body.sentContactIds.map(String) : undefined,
    sentAssociationKeys: Array.isArray(body.sentAssociationKeys) ? body.sentAssociationKeys.map(String) : undefined,
  });

  if ('error' in result) {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'hubspot',
        error: result.error,
        details: result.details,
      } satisfies HubspotWritebackExecuteError,
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: 'success',
    provider: 'hubspot',
    ...result,
  });
}
