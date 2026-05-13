import { NextRequest, NextResponse } from 'next/server';
import {
  getHubspotIngestContractById,
  listHubspotIngestContracts,
  prepareHubspotIngestContractDraft,
  saveHubspotIngestContract,
  validateHubspotIngestConnectionId,
  validateOptionalText,
} from '@/src/lib/server/hubspotIngestContractService';

export const dynamic = 'force-dynamic';

function sanitizeError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'TOKEN_REQUIRED') return { status: 400, message: 'Informe um token do HubSpot para montar o contrato de ingestão.' };
  if (code === 'INVALID_SOURCE_CONNECTION_ID') return { status: 400, message: 'sourceConnectionId deve ser um UUID válido.' };
  if (code === 'READ_HUBSPOT_INGEST_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível ler o contrato HubSpot no momento.' };
  if (code === 'READ_HUBSPOT_INGEST_CONTRACT_LIST_FAILED') return { status: 500, message: 'Não foi possível listar os contratos HubSpot no momento.' };
  if (code === 'SAVE_HUBSPOT_INGEST_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível salvar o contrato HubSpot no momento.' };
  return { status: 500, message: 'Erro inesperado ao processar contrato de ingestão HubSpot.' };
}

function readToken(request: NextRequest, body: Record<string, unknown>): string {
  const tokenFromBody = typeof body.tokenKey === 'string'
    ? body.tokenKey.trim()
    : typeof body.token === 'string'
      ? body.token.trim()
      : '';

  if (tokenFromBody) return tokenFromBody;

  const url = new URL(request.url);
  return url.searchParams.get('tokenKey')?.trim() || url.searchParams.get('token')?.trim() || '';
}

function readLimit(request: NextRequest): number {
  const raw = request.nextUrl.searchParams.get('limit');
  if (!raw) return 20;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 20;
  return Math.max(1, Math.min(50, Math.trunc(parsed)));
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')?.trim() || '';
    if (id) {
      const contract = await getHubspotIngestContractById(id);
      if (!contract) {
        return NextResponse.json(
          {
            status: 'not_found',
            provider: 'hubspot',
            message: 'Contrato HubSpot não encontrado.',
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        status: 'success',
        provider: 'hubspot',
        contract,
      });
    }

    const contracts = await listHubspotIngestContracts(readLimit(request));
    return NextResponse.json({
      status: 'success',
      provider: 'hubspot',
      count: contracts.length,
      contracts,
    });
  } catch (error) {
    const mapped = sanitizeError(error);
    return NextResponse.json(
      { status: 'error', provider: 'hubspot', error: mapped.message },
      { status: mapped.status },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const token = readToken(request, body);
  if (!token) {
    return NextResponse.json(
      { status: 'error', provider: 'hubspot', error: 'Informe um token de Private App para montar o contrato de ingestão.' },
      { status: 400 },
    );
  }

  try {
    const sourceConnectionId = validateHubspotIngestConnectionId(
      typeof body.sourceConnectionId === 'string' ? body.sourceConnectionId : null,
    );
    const createdBy = validateOptionalText(body.createdBy);
    const notes = validateOptionalText(body.notes);

    const draft = await prepareHubspotIngestContractDraft({
      token,
      sourceConnectionId,
      createdBy,
      notes,
    });

    const contract = await saveHubspotIngestContract({
      contractJson: draft.contractJson,
      dryRunSummary: draft.dryRunSummary,
      status: draft.status,
      sourceConnectionId,
      createdBy,
      notes,
    });

    return NextResponse.json({
      status: 'success',
      provider: 'hubspot',
      contract,
    });
  } catch (error) {
    const mapped = sanitizeError(error);
    return NextResponse.json(
      { status: 'error', provider: 'hubspot', error: mapped.message },
      { status: mapped.status },
    );
  }
}
