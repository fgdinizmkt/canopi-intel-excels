import { NextRequest, NextResponse } from 'next/server';
import {
  saveSalesforceSyncContract,
  getLatestPendingSalesforceSyncContract,
  saveSalesforceAccountCanonicalMapping,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeSyncContractError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_EMPTY') return { status: 400, message: 'Contrato vazio — nenhuma entidade informada.' };
  if (code === 'DRY_RUN_SUMMARY_INVALID') return { status: 400, message: 'Resumo do dry-run inválido ou ausente.' };
  if (code === 'NO_RECORDS_CAN_SYNC') return { status: 400, message: 'Nenhum registro apto para sync no dry-run.' };
  if (code === 'SAVE_SYNC_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível salvar o contrato no momento.' };
  return { status: 500, message: 'Erro inesperado ao salvar o contrato de sync.' };
}

function sanitizeMappingError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_ID_REQUIRED') return { status: 400, message: 'ID do contrato é obrigatório.' };
  if (code === 'MAPPING_INVALID') return { status: 400, message: 'Mapeamento inválido ou ausente.' };
  if (code === 'MAPPING_FIELD_MAP_REQUIRED') return { status: 400, message: 'Mapa de campos (fieldMap) é obrigatório.' };
  if (code.startsWith('MAPPING_MISSING_FIELD_')) {
    const field = code.replace('MAPPING_MISSING_FIELD_', '').toLowerCase();
    return { status: 400, message: `Campo canônico obrigatório ausente no mapeamento: ${field}.` };
  }
  if (code === 'CONTRACT_NOT_FOUND') return { status: 404, message: 'Contrato não encontrado ou não pertence ao provider salesforce.' };
  if (code === 'CONTRACT_STATUS_IMMUTABLE') return { status: 409, message: 'Este contrato já foi sincronizado ou cancelado e não pode ser remapeado.' };
  if (code === 'READ_SYNC_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível ler o contrato no momento.' };
  if (code === 'SAVE_MAPPING_FAILED') return { status: 500, message: 'Não foi possível salvar o mapeamento no momento.' };
  return { status: 500, message: 'Erro inesperado ao salvar o mapeamento canônico.' };
}

// ─── GET — retorna o último contrato pending ──────────────────────────────────
export async function GET(_request: NextRequest) {
  try {
    const contract = await getLatestPendingSalesforceSyncContract();
    if (!contract) {
      return NextResponse.json(
        {
          status: 'not_found',
          provider: 'salesforce',
          message: 'Nenhum contrato Salesforce pendente encontrado. Execute o dry-run e salve o contrato antes de mapear.',
        },
        { status: 404 },
      );
    }
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      syncContract: {
        id: contract.id,
        provider: contract.provider,
        status: contract.status,
        createdAt: contract.createdAt,
        estimatedRecordsCanSync: contract.estimatedRecordsCanSync,
        contractJson: contract.contractJson,
        dryRunSummary: contract.dryRunSummary,
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const message = code === 'READ_SYNC_CONTRACT_FAILED'
      ? 'Não foi possível consultar o contrato no momento.'
      : 'Erro inesperado ao consultar o contrato.';
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: message },
      { status: 500 },
    );
  }
}

// ─── PATCH — salva mapeamento canônico de Account ─────────────────────────────
export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'Payload inválido.' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { status: 'error', error: 'Body inválido.' },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;

  if (!('contractId' in raw) || !('mapping' in raw)) {
    return NextResponse.json(
      { status: 'error', error: 'Campos "contractId" e "mapping" são obrigatórios.' },
      { status: 400 },
    );
  }

  const contractId = raw.contractId;
  const mapping = raw.mapping;

  if (typeof contractId !== 'string' || !contractId.trim()) {
    return NextResponse.json(
      { status: 'error', error: 'contractId deve ser uma string não vazia.' },
      { status: 400 },
    );
  }

  if (typeof mapping !== 'object' || mapping === null) {
    return NextResponse.json(
      { status: 'error', error: 'mapping deve ser um objeto.' },
      { status: 400 },
    );
  }

  try {
    const result = await saveSalesforceAccountCanonicalMapping(
      contractId,
      mapping as Parameters<typeof saveSalesforceAccountCanonicalMapping>[1],
    );
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      syncContract: {
        id: result.id,
        status: result.status,
        mappedEntity: result.mappedEntity,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    const mapped = sanitizeMappingError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: mapped.message },
      { status: mapped.status },
    );
  }
}

// ─── POST — salva contrato de sync (C4.4 — preservado) ────────────────────────
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'Payload inválido.' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { status: 'error', error: 'Body inválido.' },
      { status: 400 },
    );
  }

  const raw = body as Record<string, unknown>;

  if (!('contract' in raw) || !('dryRunSummary' in raw)) {
    return NextResponse.json(
      { status: 'error', error: 'Campos "contract" e "dryRunSummary" são obrigatórios.' },
      { status: 400 },
    );
  }

  const { contract, dryRunSummary } = raw;

  if (
    typeof dryRunSummary !== 'object' ||
    dryRunSummary === null ||
    typeof (dryRunSummary as Record<string, unknown>).estimatedRecordsCanSync !== 'number' ||
    (dryRunSummary as Record<string, unknown>).estimatedRecordsCanSync as number <= 0
  ) {
    return NextResponse.json(
      { status: 'error', error: 'O dry-run não indicou registros aptos para sync.' },
      { status: 400 },
    );
  }

  try {
    const result = await saveSalesforceSyncContract(contract, dryRunSummary);
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      syncContract: {
        id: result.id,
        provider: result.provider,
        status: result.status,
        createdAt: result.createdAt,
        estimatedRecordsCanSync: result.estimatedRecordsCanSync,
      },
    });
  } catch (error) {
    const mapped = sanitizeSyncContractError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: mapped.message },
      { status: mapped.status },
    );
  }
}
