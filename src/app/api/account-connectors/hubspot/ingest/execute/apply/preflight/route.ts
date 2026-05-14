import { NextRequest, NextResponse } from 'next/server';
import { preflightHubspotIngestApply } from '@/src/lib/server/hubspotIngestApplyPreflightService';
import type { HubspotIngestApplyPreflightResult } from '@/src/lib/hubspotIngestTypes';

export const dynamic = 'force-dynamic';

function readBodyErrors(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Payload inválido. Envie apenas { "contractId": "...", "approvedPlanHash": "...", "idempotencyKey": "..." }.'];
  }

  const raw = body as Record<string, unknown>;
  const keys = Object.keys(raw);
  const extraKeys = keys.filter((key) => !['contractId', 'approvedPlanHash', 'idempotencyKey'].includes(key));
  const issues: string[] = [];

  if (keys.length === 0) {
    issues.push('Payload vazio. Envie apenas { "contractId": "...", "approvedPlanHash": "...", "idempotencyKey": "..." }.');
  }

  if (extraKeys.length > 0) {
    issues.push(`Campos não permitidos no payload: ${extraKeys.join(', ')}.`);
  }

  if (!('contractId' in raw)) {
    issues.push('contractId é obrigatório.');
  } else if (typeof raw.contractId !== 'string' || !raw.contractId.trim()) {
    issues.push('contractId deve ser uma string não vazia.');
  }

  if (!('approvedPlanHash' in raw)) {
    issues.push('approvedPlanHash é obrigatório.');
  } else if (typeof raw.approvedPlanHash !== 'string' || !raw.approvedPlanHash.trim()) {
    issues.push('approvedPlanHash deve ser uma string não vazia.');
  }

  if (!('idempotencyKey' in raw)) {
    issues.push('idempotencyKey é obrigatório.');
  } else if (typeof raw.idempotencyKey !== 'string' || !raw.idempotencyKey.trim()) {
    issues.push('idempotencyKey deve ser uma string não vazia.');
  }

  return issues;
}

function buildBlockedResponse(params: {
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
  blockers: string[];
  warnings: string[];
}): HubspotIngestApplyPreflightResult {
  return {
    status: 'blocked',
    mode: 'apply_preflight',
    provider: 'hubspot',
    contractId: params.contractId,
    approvedPlanHash: params.approvedPlanHash,
    idempotencyKey: params.idempotencyKey,
    canApply: false,
    wouldPersist: false,
    summary: {
      accounts: {
        planned: 0,
        readyToApply: 0,
        review: 0,
        blocked: 0,
        skip: 0,
      },
      contacts: {
        planned: 0,
        readyToApply: 0,
        review: 0,
        blocked: 0,
        skip: 0,
      },
    },
    conflicts: {
      accounts: [],
      contacts: [],
    },
    blockers: params.blockers,
    warnings: params.warnings,
    guardrails: [
      'contractId, approvedPlanHash e idempotencyKey são obrigatórios.',
      'Nenhuma escrita em accounts ou contacts nesta etapa.',
      'Snapshot salvo é a única fonte de verdade para o preflight.',
      'Resposta não expõe token, secrets, payload bruto ou .env.local.',
    ],
    nextStep: 'apply_real_requires_transactional_boundary',
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const issues = readBodyErrors(body);
  if (issues.length > 0) {
    const raw = typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
    const contractId = typeof raw.contractId === 'string' ? raw.contractId.trim() : '';
    const approvedPlanHash = typeof raw.approvedPlanHash === 'string' ? raw.approvedPlanHash.trim() : '';
    const idempotencyKey = typeof raw.idempotencyKey === 'string' ? raw.idempotencyKey.trim() : '';
    return NextResponse.json(buildBlockedResponse({
      contractId,
      approvedPlanHash,
      idempotencyKey,
      blockers: issues,
      warnings: [],
    }), { status: 400 });
  }

  const contractId = String((body as Record<string, unknown>).contractId).trim();
  const approvedPlanHash = String((body as Record<string, unknown>).approvedPlanHash).trim();
  const idempotencyKey = String((body as Record<string, unknown>).idempotencyKey).trim();
  const result = await preflightHubspotIngestApply({
    contractId,
    approvedPlanHash,
    idempotencyKey,
  });

  return NextResponse.json(result, { status: result.status === 'blocked' ? 409 : 200 });
}
