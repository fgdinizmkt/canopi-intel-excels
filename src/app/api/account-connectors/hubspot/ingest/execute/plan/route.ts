import { NextRequest, NextResponse } from 'next/server';
import { materializeHubspotIngestExecutionPlan } from '@/src/lib/server/hubspotIngestExecutionPlanService';
import type { HubspotIngestExecutionPlanSnapshotExecutionSummary } from '@/src/lib/hubspotIngestTypes';

export const dynamic = 'force-dynamic';

function readBodyErrors(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Payload inválido. Envie apenas { "contractId": "..." }.'];
  }

  const raw = body as Record<string, unknown>;
  const keys = Object.keys(raw);
  const extraKeys = keys.filter((key) => key !== 'contractId');
  const issues: string[] = [];

  if (keys.length === 0) {
    issues.push('Payload vazio. Envie apenas { "contractId": "..." }.');
  }

  if (extraKeys.length > 0) {
    issues.push(`Campos não permitidos no payload: ${extraKeys.join(', ')}.`);
  }

  if (!('contractId' in raw)) {
    issues.push('contractId é obrigatório.');
  } else if (typeof raw.contractId !== 'string' || !raw.contractId.trim()) {
    issues.push('contractId deve ser uma string não vazia.');
  }

  return issues;
}

function buildBlockedResponse(contractId: string, blockers: string[], warnings: string[] = []): HubspotIngestExecutionPlanSnapshotExecutionSummary {
  return {
    version: 'c2.9e.2b.2a',
    mode: 'execution_plan_snapshot',
    provider: 'hubspot',
    contractId,
    planHash: null,
    createdAt: new Date().toISOString(),
    status: 'blocked',
    persisted: false,
    canPersist: false,
    canonicalPersisted: false,
    summary: {
      accounts: {
        planned: 0,
        update: 0,
        review: 0,
        create: 0,
        skip: 0,
      },
      contacts: {
        planned: 0,
        update: 0,
        review: 0,
        create: 0,
        skip: 0,
      },
    },
    records: {
      accounts: [],
      contacts: [],
    },
    unresolved: {
      companiesOutsideCanopi: 0,
      contactsWithoutCanopiId: 0,
      ambiguousItems: 0,
    },
    outOfScope: ['deals', 'leads', 'campaigns', 'properties', 'associations'],
    guardrails: [
      'contractId obrigatório; nenhum fallback para último contrato.',
      'Contrato lido somente no servidor por id e provider hubspot.',
      'Payload bruto do CRM e chaves proibidas são rejeitados.',
      'Token não é aceito no payload e não é persistido.',
      'Nenhuma escrita em accounts ou contacts nesta etapa.',
      'Somente execution_summary é atualizado nesta rota.',
      'contract_json e status permanecem inalterados.',
      'Deals, Leads, Campaigns, Properties e Associations permanecem fora do primeiro recorte.',
      'AmbiguousItems bloqueiam a materialização do snapshot.',
      'Resposta não expõe segredo, payload bruto ou .env.local.',
      'planHash exclui timestamps e deriva apenas do snapshot determinístico.',
    ],
    blockers,
    warnings,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const issues = readBodyErrors(body);
  if (issues.length > 0) {
    const contractId = typeof body === 'object' && body !== null && !Array.isArray(body) && typeof (body as Record<string, unknown>).contractId === 'string'
      ? String((body as Record<string, unknown>).contractId).trim()
      : '';
    return NextResponse.json(buildBlockedResponse(contractId, issues), { status: 400 });
  }

  const contractId = String((body as Record<string, unknown>).contractId).trim();
  const result = await materializeHubspotIngestExecutionPlan(contractId);

  return NextResponse.json(result, { status: result.status === 'blocked' ? 409 : 200 });
}
