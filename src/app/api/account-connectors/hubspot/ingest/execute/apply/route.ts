import { NextRequest, NextResponse } from 'next/server';
import { applyHubspotIngestContractViaRpc } from '@/src/lib/server/hubspotIngestApplyRpcService';

export const dynamic = 'force-dynamic';

const ALLOWED_KEYS = new Set(['contractId', 'approvedPlanHash', 'idempotencyKey']);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_REGEX = /^[0-9a-f]{64}$/i;
const APPLY_ENABLE_FLAG = 'CANOPI_ENABLE_HUBSPOT_INGEST_APPLY';

function isUuidLike(value: string): boolean {
  return UUID_REGEX.test(value);
}

function isSha256Hex(value: string): boolean {
  return SHA256_REGEX.test(value);
}

function isHubspotIngestApplyEnabled(): boolean {
  return process.env[APPLY_ENABLE_FLAG] === 'true';
}

function readBodyErrors(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Payload inválido. Envie apenas { "contractId": "...", "approvedPlanHash": "...", "idempotencyKey": "..." }.'];
  }

  const raw = body as Record<string, unknown>;
  const keys = Object.keys(raw);
  const extraKeys = keys.filter((key) => !ALLOWED_KEYS.has(key));
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
  } else if (!isUuidLike(raw.contractId.trim())) {
    issues.push('contractId deve ser um UUID válido.');
  }

  if (!('approvedPlanHash' in raw)) {
    issues.push('approvedPlanHash é obrigatório.');
  } else if (typeof raw.approvedPlanHash !== 'string' || !raw.approvedPlanHash.trim()) {
    issues.push('approvedPlanHash deve ser uma string não vazia.');
  } else if (!isSha256Hex(raw.approvedPlanHash.trim())) {
    issues.push('approvedPlanHash deve ser um hash SHA-256 hexadecimal de 64 caracteres.');
  }

  if (!('idempotencyKey' in raw)) {
    issues.push('idempotencyKey é obrigatório.');
  } else if (typeof raw.idempotencyKey !== 'string' || !raw.idempotencyKey.trim()) {
    issues.push('idempotencyKey deve ser uma string não vazia.');
  } else if (!isUuidLike(raw.idempotencyKey.trim())) {
    issues.push('idempotencyKey deve ser um UUID válido.');
  }

  return issues;
}

function buildBlockedResponse(params: {
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
  blockers: string[];
  warnings: string[];
}) {
  return {
    status: 'blocked',
    mode: 'apply',
    provider: 'hubspot',
    contractId: params.contractId,
    approvedPlanHash: params.approvedPlanHash,
    idempotencyKey: params.idempotencyKey,
    canPersist: false,
    persisted: false,
    canonicalPersisted: false,
    summary: {
      accounts: {
        planned: 0,
        applied: 0,
        review: 0,
        blocked: 0,
        skip: 0,
      },
      contacts: {
        planned: 0,
        applied: 0,
        review: 0,
        blocked: 0,
        skip: 0,
      },
    },
    blockers: params.blockers,
    warnings: params.warnings,
    guardrails: [
      'contractId, approvedPlanHash e idempotencyKey são obrigatórios.',
      'Payload bruto, token, records, companies, contacts, mode e apply são rejeitados.',
      'A rota nunca consulta HubSpot e nunca escreve diretamente em accounts ou contacts.',
      'A única escrita permitida ocorre dentro da RPC transacional.',
      'Resposta não expõe token, secrets, payload bruto ou .env.local.',
    ],
  };
}

function readBodyContractFields(body: unknown): {
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
} {
  const raw = body as Record<string, unknown>;
  return {
    contractId: typeof raw.contractId === 'string' ? raw.contractId.trim() : '',
    approvedPlanHash: typeof raw.approvedPlanHash === 'string' ? raw.approvedPlanHash.trim() : '',
    idempotencyKey: typeof raw.idempotencyKey === 'string' ? raw.idempotencyKey.trim() : '',
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const issues = readBodyErrors(body);
  if (issues.length > 0) {
    const fields = typeof body === 'object' && body !== null && !Array.isArray(body)
      ? readBodyContractFields(body)
      : { contractId: '', approvedPlanHash: '', idempotencyKey: '' };

    return NextResponse.json(
      buildBlockedResponse({
        contractId: fields.contractId,
        approvedPlanHash: fields.approvedPlanHash,
        idempotencyKey: fields.idempotencyKey,
        blockers: issues,
        warnings: [],
      }),
      { status: 400 },
    );
  }

  const { contractId, approvedPlanHash, idempotencyKey } = readBodyContractFields(body);

  if (!isHubspotIngestApplyEnabled()) {
    return NextResponse.json(
      buildBlockedResponse({
        contractId,
        approvedPlanHash,
        idempotencyKey,
        blockers: ['Apply real do HubSpot desabilitado por configuração operacional.'],
        warnings: [],
      }),
      { status: 403 },
    );
  }

  try {
    const result = await applyHubspotIngestContractViaRpc({
      contractId,
      approvedPlanHash,
      idempotencyKey,
    });

    return NextResponse.json(result, { status: result.status === 'blocked' ? 409 : 200 });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        mode: 'apply',
        provider: 'hubspot',
        contractId,
        approvedPlanHash,
        idempotencyKey,
        canPersist: false,
        error: 'Não foi possível executar o apply do HubSpot no momento.',
      },
      { status: 500 },
    );
  }
}
