import { NextResponse } from 'next/server';
import { executeOpportunitySync } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/account-connectors/salesforce/oauth/opportunity-sync-execute
 *
 * Executa sync persistente controlado de Opportunities Salesforce → Canopi.
 *
 * Guardrails:
 * - Exige contractId explícito no body — sem fallback para último contrato.
 * - Não aceita payload bruto do front-end.
 * - Lê exclusivamente do contrato salvo no banco (status=mapped ou synced).
 * - Grava somente Opportunities com Account resolvida.
 * - Não cria Accounts, Contacts ou vínculos Opportunity ↔ Contact.
 * - Não usa OpportunityContactRole, writeback Salesforce ou Bulk API.
 * - Não altera status do contrato.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const contractId = typeof body?.contractId === 'string' ? body.contractId.trim() : '';

    if (!contractId) {
      return NextResponse.json(
        {
          status: 'error',
          error: 'contractId é obrigatório. Não há fallback para último contrato.',
        },
        { status: 400 },
      );
    }

    const result = await executeOpportunitySync(contractId);

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
      NO_OPPORTUNITIES_IN_CONTRACT: 422,
      READ_SYNC_CONTRACT_FAILED: 500,
      READ_CANOPI_ACCOUNT_LOOKUP_FAILED: 500,
      READ_EXISTING_OPPORTUNITIES_FAILED: 500,
      SAVE_OPPORTUNITY_SYNC_SUMMARY_FAILED: 500,
    };

    const httpStatus = statusMap[message] ?? 500;

    return NextResponse.json({ status: 'error', error: message }, { status: httpStatus });
  }
}
