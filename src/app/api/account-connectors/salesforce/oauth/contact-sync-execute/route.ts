import { NextResponse } from 'next/server';
import { executeContactSync } from '@/src/lib/server/salesforceOAuthService';

/**
 * POST /api/account-connectors/salesforce/oauth/contact-sync-execute
 *
 * Executa sync persistente controlado de Contacts Salesforce → Canopi.
 *
 * Guardrails:
 * - Exige contractId explícito no body — sem fallback para último contrato.
 * - Não aceita lista de contatos do front-end — tudo é lido do contrato salvo.
 * - Read exclusivamente do contrato no banco (status=mapped ou synced).
 * - Grava apenas via syncContactFromCRM (whitelist estrita no repository).
 * - Contatos sem Account resolvida são ignorados — nunca cria órfãos.
 * - Campos estratégicos/relacionais da Canopi não são sobrescritos.
 * - Não implementa Opportunity, Lead, Campaign, Bulk API ou writeback.
 * - Não altera status do contrato.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const contractId =
      typeof body?.contractId === 'string' ? body.contractId.trim() : '';

    if (!contractId) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'contractId é obrigatório. Não há fallback para último contrato.',
        },
        { status: 400 },
      );
    }

    const result = await executeContactSync(contractId);

    return NextResponse.json({
      status: 'ok',
      provider: 'salesforce',
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    const statusMap: Record<string, number> = {
      CONTRACT_ID_REQUIRED: 400,
      CONTRACT_NOT_FOUND: 404,
      CONTRACT_STATUS_INVALID: 409,
      NO_CONTACTS_IN_CONTRACT: 422,
      READ_SYNC_CONTRACT_FAILED: 500,
    };

    const httpStatus = statusMap[message] ?? 500;

    return NextResponse.json(
      { status: 'error', error: message },
      { status: httpStatus },
    );
  }
}
