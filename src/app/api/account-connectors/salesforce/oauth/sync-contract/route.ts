import { NextRequest, NextResponse } from 'next/server';
import { saveSalesforceSyncContract } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeSyncContractError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_EMPTY') return { status: 400, message: 'Contrato vazio — nenhuma entidade informada.' };
  if (code === 'DRY_RUN_SUMMARY_INVALID') return { status: 400, message: 'Resumo do dry-run inválido ou ausente.' };
  if (code === 'NO_RECORDS_CAN_SYNC') return { status: 400, message: 'Nenhum registro apto para sync no dry-run.' };
  if (code === 'SAVE_SYNC_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível salvar o contrato no momento.' };
  return { status: 500, message: 'Erro inesperado ao salvar o contrato de sync.' };
}

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
