import { NextRequest, NextResponse } from 'next/server';
import { executeAccountSync } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeSyncExecuteError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_ID_REQUIRED') return { status: 400, message: 'ID do contrato é obrigatório.' };
  if (code === 'CONTRACT_NOT_FOUND') return { status: 404, message: 'Contrato não encontrado.' };
  if (code === 'CONTRACT_NOT_MAPPED')
    return { status: 400, message: 'O contrato deve estar com status mapeado antes de executar o sync.' };
  if (code === 'ACCOUNT_MAPPING_NOT_FOUND')
    return { status: 400, message: 'Mapeamento de Account não encontrado no contrato.' };
  if (code === 'NO_ACCOUNTS_IN_CONTRACT')
    return { status: 400, message: 'Não há registros de Account selecionados no contrato.' };
  if (code === 'READ_SYNC_CONTRACT_FAILED')
    return { status: 500, message: 'Não foi possível ler o contrato no momento.' };
  return { status: 500, message: 'Erro inesperado durante a execução do sync.' };
}

// ─── POST — executa sync persistente controlado de Accounts ──────────────────
// Guardrail: não aceita payload de contas do cliente.
// contractId é OBRIGATÓRIO — sem fallback para último contrato mapped.
// Lê exclusivamente do contrato salvo no banco (status=mapped).
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const contractId = typeof body.contractId === 'string' ? body.contractId.trim() : '';

  if (!contractId) {
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: 'contractId é obrigatório para executar o sync. Nenhum fallback automático é permitido.' },
      { status: 400 },
    );
  }

  try {
    const result = await executeAccountSync(contractId);

    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      result,
    });
  } catch (error) {
    const { status, message } = sanitizeSyncExecuteError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: message },
      { status },
    );
  }
}
