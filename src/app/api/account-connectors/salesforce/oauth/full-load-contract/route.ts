import { NextRequest, NextResponse } from 'next/server';
import { createSalesforceFullLoadContract } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

const ALLOWED_OBJECTS = ['Contact', 'Opportunity'] as const;
type AllowedObject = (typeof ALLOWED_OBJECTS)[number];

function sanitizeError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'NOT_CONFIGURED') return { status: 400, message: 'Configuração OAuth pendente.' };
  if (code === 'NOT_CONNECTED') return { status: 400, message: 'Conexão OAuth ainda não está ativa.' };
  if (code === 'TOKEN_REFRESH_EMPTY') return { status: 502, message: 'Não foi possível renovar o token OAuth.' };
  if (code === 'FULL_LOAD_NO_OBJECTS') return { status: 400, message: 'Nenhum objeto informado para carga completa.' };
  if (code === 'FULL_LOAD_NO_RECORDS') return { status: 422, message: 'Nenhum registro encontrado no Salesforce para os objetos solicitados.' };
  if (code === 'SAVE_FULL_LOAD_CONTRACT_FAILED') return { status: 500, message: 'Não foi possível salvar o contrato de carga completa.' };
  if (code === 'PAGINATED_QUERY_FAILED') return { status: 502, message: 'Erro ao consultar o Salesforce.' };
  return { status: 500, message: 'Erro inesperado ao criar contrato de carga completa.' };
}

/**
 * POST /api/account-connectors/salesforce/oauth/full-load-contract
 *
 * Cria um contrato de carga completa para Contact e/ou Opportunity,
 * buscando todos os registros disponíveis no Salesforce via paginação.
 *
 * Body: { objects: ('Contact' | 'Opportunity')[] }
 * Guardrails: max 10.000 registros por objeto. Não implementa Account (fluxo próprio).
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const rawObjects = Array.isArray(body.objects) ? body.objects : [];
  const objects = rawObjects.filter((o): o is AllowedObject =>
    typeof o === 'string' && (ALLOWED_OBJECTS as readonly string[]).includes(o),
  );

  if (objects.length === 0) {
    return NextResponse.json(
      { status: 'error', error: 'objects deve conter ao menos um valor válido: Contact, Opportunity.' },
      { status: 400 },
    );
  }

  try {
    const result = await createSalesforceFullLoadContract(objects);
    return NextResponse.json({
      status: 'ok',
      provider: 'salesforce',
      contractId: result.contractId,
      summary: result.summary,
    });
  } catch (error) {
    const { status, message } = sanitizeError(error);
    return NextResponse.json({ status: 'error', error: message }, { status });
  }
}
