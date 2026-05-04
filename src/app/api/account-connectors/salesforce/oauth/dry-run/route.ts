import { NextRequest, NextResponse } from 'next/server';
import {
  dryRunMultiEntityContract,
  PREVIEW_ALLOWLIST,
  type DryRunContractInput,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

const ALLOWED_OBJECTS = new Set(Object.keys(PREVIEW_ALLOWLIST));
const MAX_RECORDS_PER_ENTITY = 50;

function sanitizeDryRunError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'NOT_CONFIGURED') return { status: 400, message: 'Configuração OAuth pendente.' };
  if (code === 'NOT_CONNECTED') return { status: 400, message: 'Conexão OAuth não está ativa.' };
  if (code === 'TOKEN_REFRESH_EMPTY') return { status: 502, message: 'Não foi possível renovar o token OAuth.' };
  return { status: 500, message: 'Não foi possível executar o dry-run no momento.' };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'Payload inválido.' },
      { status: 400 },
    );
  }

  if (typeof body !== 'object' || body === null || !('contract' in body)) {
    return NextResponse.json(
      { status: 'error', error: 'Campo "contract" obrigatório.' },
      { status: 400 },
    );
  }

  const raw = (body as { contract: unknown }).contract;

  if (typeof raw !== 'object' || raw === null) {
    return NextResponse.json(
      { status: 'error', error: 'Contrato inválido.' },
      { status: 400 },
    );
  }

  const c = raw as Record<string, unknown>;

  if (!Array.isArray(c.entities) || c.entities.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'Contrato vazio — nenhuma entidade informada.' },
      { status: 400 },
    );
  }

  const sanitizedEntities: DryRunContractInput['entities'] = [];

  for (const rawEntity of c.entities) {
    if (typeof rawEntity !== 'object' || rawEntity === null) continue;
    const e = rawEntity as Record<string, unknown>;
    const objectApiName = typeof e.objectApiName === 'string' ? e.objectApiName.trim() : '';

    if (!objectApiName || !ALLOWED_OBJECTS.has(objectApiName)) continue;

    const rawRecords = Array.isArray(e.selectedRecords) ? e.selectedRecords : [];
    const selectedRecords: DryRunContractInput['entities'][number]['selectedRecords'] = [];

    for (const rawRec of rawRecords.slice(0, MAX_RECORDS_PER_ENTITY)) {
      if (typeof rawRec !== 'object' || rawRec === null) continue;
      const rec = rawRec as Record<string, unknown>;
      const id = typeof rec.id === 'string' ? rec.id.trim() : '';
      if (!id) continue;
      const displayName = typeof rec.displayName === 'string' ? rec.displayName : id;
      selectedRecords.push({ id, displayName });
    }

    if (selectedRecords.length === 0) continue;

    sanitizedEntities.push({
      objectApiName,
      label: typeof e.label === 'string' ? e.label : objectApiName,
      selectedRecords,
    });
  }

  if (sanitizedEntities.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'Nenhum registro válido encontrado no contrato.' },
      { status: 400 },
    );
  }

  const contract: DryRunContractInput = {
    source: typeof c.source === 'string' ? c.source : 'salesforce-oauth',
    mode: typeof c.mode === 'string' ? c.mode : 'local-multi-entity-contract',
    entities: sanitizedEntities,
  };

  try {
    const result = await dryRunMultiEntityContract(contract);
    const { status: _s, ...rest } = result;
    return NextResponse.json({ status: 'success', provider: 'salesforce', ...rest });
  } catch (error) {
    const mapped = sanitizeDryRunError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: mapped.message },
      { status: mapped.status },
    );
  }
}
