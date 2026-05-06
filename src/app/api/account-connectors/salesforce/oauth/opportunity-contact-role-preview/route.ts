import { NextResponse } from 'next/server';
import {
  getEligibleSalesforceOpportunityContactRolePreviewContracts,
  generateOpportunityContactRoleRelationshipPreview,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account-connectors/salesforce/oauth/opportunity-contact-role-preview
 *
 * Lista contratos Salesforce elegíveis para preview de OpportunityContactRole.
 */
export async function GET() {
  try {
    const contracts = await getEligibleSalesforceOpportunityContactRolePreviewContracts();
    return NextResponse.json({
      status: 'ok',
      provider: 'salesforce',
      contracts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

/**
 * POST /api/account-connectors/salesforce/oauth/opportunity-contact-role-preview
 *
 * Executa preview read-only de OpportunityContactRole Salesforce → Canopi.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const contractId = typeof body?.contractId === 'string' ? body.contractId.trim() : '';

    if (!contractId) {
      return NextResponse.json(
        { status: 'error', error: 'contractId é obrigatório. Não há fallback para último contrato.' },
        { status: 400 },
      );
    }

    const result = await generateOpportunityContactRoleRelationshipPreview(contractId);

    return NextResponse.json({
      status: 'ok',
      provider: 'salesforce',
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    
    const statusMap: Record<string, number> = {
      CONTRACT_NOT_FOUND: 404,
      NO_OPPORTUNITY_CONTACT_ROLES_IN_CONTRACT: 422,
    };

    const httpStatus = statusMap[message] ?? 500;

    return NextResponse.json({ status: 'error', error: message }, { status: httpStatus });
  }
}
