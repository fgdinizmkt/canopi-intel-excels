import { NextResponse } from 'next/server';
import {
  getEligibleSalesforceOpportunityPreviewContracts,
  generateOpportunityRelationshipPreview,
} from '@/src/lib/server/salesforceOAuthService';

/**
 * GET /api/account-connectors/salesforce/oauth/opportunity-preview
 *
 * Lista contratos Salesforce elegíveis para preview de Opportunities.
 *
 * Guardrails:
 * - Read-only. Não grava nenhum dado.
 * - Não exige contractId — apenas lista contratos disponíveis.
 * - Filtra contratos com entity Opportunity e selectedRecords.length > 0.
 * - Retorna indicação de se há lookup de Account disponível (C4.7).
 */
export async function GET() {
  try {
    const contracts = await getEligibleSalesforceOpportunityPreviewContracts();
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
 * POST /api/account-connectors/salesforce/oauth/opportunity-preview
 *
 * Executa preview read-only de Opportunities Salesforce → Canopi.
 *
 * Guardrails:
 * - Exige contractId explícito no body — sem fallback para último contrato.
 * - Não aceita lista de Opportunities do front-end — lê exclusivamente do contrato salvo.
 * - Read-only: nenhuma Opportunity, Account ou Contact é gravada.
 * - Opportunity sem Account resolvida via lookup C4.7 = unresolved_account.
 * - Vínculo Opportunity → Contact não é inferido (OpportunityContactRole não disponível).
 * - Não implementa Campaign, Lead, writeback, Bulk API ou migration.
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

    const result = await generateOpportunityRelationshipPreview(contractId);

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
      CONTRACT_NOT_MAPPED: 409,
      NO_OPPORTUNITIES_IN_CONTRACT: 422,
      READ_SYNC_CONTRACT_FAILED: 500,
      READ_CONTRACTS_FAILED: 500,
    };

    const httpStatus = statusMap[message] ?? 500;

    return NextResponse.json(
      { status: 'error', error: message },
      { status: httpStatus },
    );
  }
}
