import { NextRequest, NextResponse } from 'next/server';
import {
  generateContactRelationshipPreview,
  getEligibleSalesforceContactPreviewContracts,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeContactPreviewError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'CONTRACT_ID_REQUIRED') return { status: 400, message: 'ID do contrato é obrigatório.' };
  if (code === 'CONTRACT_NOT_FOUND') return { status: 404, message: 'Contrato não encontrado.' };
  if (code === 'CONTRACT_NOT_MAPPED')
    return { status: 400, message: 'O contrato deve ter status mapped ou synced para gerar preview de Contacts.' };
  if (code === 'NO_CONTACTS_IN_CONTRACT')
    return { status: 400, message: 'Nenhum registro de Contact encontrado no contrato.' };
  if (code === 'READ_SYNC_CONTRACT_FAILED')
    return { status: 500, message: 'Não foi possível ler o contrato no momento.' };
  if (code === 'READ_CONTRACTS_FAILED')
    return { status: 500, message: 'Não foi possível listar contratos elegíveis.' };
  return { status: 500, message: 'Erro inesperado ao gerar preview de Contacts.' };
}

// ─── GET — lista contratos elegíveis para preview de Contacts ────────────────
// Read-only. Não exige contractId. Não executa preview. Não grava nada.
export async function GET() {
  try {
    const contracts = await getEligibleSalesforceContactPreviewContracts();
    return NextResponse.json({ status: 'success', provider: 'salesforce', contracts });
  } catch (error) {
    const { status, message } = sanitizeContactPreviewError(error);
    return NextResponse.json({ status: 'error', provider: 'salesforce', error: message }, { status });
  }
}

// ─── POST — preview read-only de Contacts com resolução de vínculo Account ───
// Guardrail: não aceita payload de contatos do cliente.
// contractId é OBRIGATÓRIO — sem fallback para último contrato.
// Não grava em contacts. Não altera accounts. Não altera status do contrato.
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
      {
        status: 'error',
        provider: 'salesforce',
        error: 'contractId é obrigatório para gerar preview de Contacts. Nenhum fallback automático é permitido.',
      },
      { status: 400 },
    );
  }

  try {
    const preview = await generateContactRelationshipPreview(contractId);
    return NextResponse.json({ status: 'success', provider: 'salesforce', preview });
  } catch (error) {
    const { status, message } = sanitizeContactPreviewError(error);
    return NextResponse.json({ status: 'error', provider: 'salesforce', error: message }, { status });
  }
}
