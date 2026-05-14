import { NextRequest, NextResponse } from 'next/server';
import { dryRunHubspotIngestExecution } from '@/src/lib/server/hubspotIngestExecuteService';

export const dynamic = 'force-dynamic';

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readBodyErrors(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Payload inválido. Envie apenas { "contractId": "..." }.'];
  }

  const raw = body as Record<string, unknown>;
  const allowedKeys = new Set(['contractId']);
  const keys = Object.keys(raw);
  const extraKeys = keys.filter((key) => !allowedKeys.has(key));
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

function buildBlockedResponse(contractId: string, blockers: string[], warnings: string[] = []) {
  return NextResponse.json(
    {
      status: 'blocked',
      mode: 'dry_run',
      provider: 'hubspot',
      contractId,
      canPersist: false,
      blockers,
      warnings,
      plan: {
        accounts: {
          totalPlanned: 0,
          create: 0,
          update: 0,
          skip: 0,
          review: 0,
          allowedFields: ['nome', 'dominio', 'vertical', 'segmento', 'porte', 'localizacao', 'ownerPrincipal', 'etapa'],
          notes: 'Sem contrato válido não há plano executável.',
        },
        contacts: {
          totalPlanned: 0,
          create: 0,
          update: 0,
          skip: 0,
          review: 0,
          allowedFields: ['id', 'accountId', 'accountName', 'nome', 'cargo', 'area', 'status'],
          notes: 'Sem contrato válido não há plano executável.',
        },
      },
      outOfScope: {
        deals: { included: false, action: 'skip', reason: 'Fora do primeiro recorte canônico.' },
        leads: { included: false, action: 'skip', reason: 'Fora do primeiro recorte canônico.' },
        campaigns: { included: false, action: 'skip', reason: 'Fora do primeiro recorte canônico.' },
        properties: { included: false, action: 'skip', reason: 'Fora do primeiro recorte canônico.' },
        associations: { included: false, action: 'skip', reason: 'Fora do primeiro recorte canônico.' },
      },
      unresolved: {
        companiesOutsideCanopi: 0,
        contactsWithoutCanopiId: 0,
        ambiguousItems: 0,
      },
      guardrails: [
        'contractId obrigatório; nenhum fallback para último contrato.',
        'Payload bruto, token, records, companies e contacts são rejeitados.',
        'Nenhuma escrita em accounts ou contacts nesta etapa.',
        'canPersist permanece false.',
      ],
      summary: {
        companiesTotal: 0,
        contactsTotal: 0,
        companiesPlannedUpdate: 0,
        contactsPlannedUpdate: 0,
        unresolvedCompanies: 0,
        unresolvedContacts: 0,
        persisted: false,
        dryRunOnly: true,
        contractStatus: 'failed',
      },
    },
    { status: 400 },
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const issues = readBodyErrors(body);
  if (issues.length > 0) {
    const contractId = typeof body === 'object' && body !== null && !Array.isArray(body) && typeof (body as Record<string, unknown>).contractId === 'string'
      ? String((body as Record<string, unknown>).contractId).trim()
      : '';
    return buildBlockedResponse(contractId, issues);
  }

  const contractId = String((body as Record<string, unknown>).contractId).trim();
  if (!isUuidLike(contractId)) {
    return buildBlockedResponse(contractId, ['contractId deve ser um UUID válido.']);
  }
  const result = await dryRunHubspotIngestExecution(contractId);

  return NextResponse.json(result, { status: result.status === 'blocked' ? 409 : 200 });
}
