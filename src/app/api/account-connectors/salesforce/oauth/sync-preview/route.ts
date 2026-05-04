import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestMappedSalesforceSyncContract,
  generateAccountSyncPreview,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizePreviewError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_ID_REQUIRED') return { status: 400, message: 'ID do contrato é obrigatório para o preview.' };
  if (code === 'CONTRACT_NOT_FOUND') return { status: 404, message: 'Contrato não encontrado.' };
  if (code === 'CONTRACT_NOT_MAPPED') return { status: 400, message: 'O contrato deve estar mapeado antes de gerar o preview de sync.' };
  if (code === 'ACCOUNT_MAPPING_NOT_FOUND') return { status: 400, message: 'Mapeamento de Account não encontrado no contrato.' };
  if (code === 'NO_ACCOUNTS_IN_CONTRACT') return { status: 400, message: 'Não há registros de Account selecionados no contrato.' };
  if (code === 'READ_SYNC_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível ler o contrato no momento.' };
  return { status: 500, message: 'Erro inesperado ao gerar preview de sincronização.' };
}

// ─── POST — gera preview read-only de sincronização ──────────────────────────
export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  try {
    let contractId = body.contractId;

    // Se não informou ID, tenta pegar o último mapeado
    if (!contractId) {
      const latest = await getLatestMappedSalesforceSyncContract();
      if (!latest) {
        return NextResponse.json(
          { 
            status: 'error', 
            error: 'Nenhum contrato Salesforce mapeado encontrado. Salve o mapeamento antes de visualizar o preview.' 
          },
          { status: 404 },
        );
      }
      contractId = latest.id;
    }

    const preview = await generateAccountSyncPreview(contractId);

    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      preview,
    });
  } catch (error) {
    const { status, message } = sanitizePreviewError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: message },
      { status },
    );
  }
}
