import { NextResponse } from 'next/server';
import { fetchLeadsPreview } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'NOT_CONFIGURED') return { status: 400, message: 'Configuração OAuth pendente.' };
  if (code === 'NOT_CONNECTED') return { status: 400, message: 'Conexão OAuth ainda não está ativa.' };
  if (code === 'TOKEN_REFRESH_EMPTY') return { status: 502, message: 'Não foi possível renovar o token OAuth.' };
  return { status: 500, message: 'Não foi possível consultar Leads no Salesforce.' };
}

/**
 * GET /api/account-connectors/salesforce/oauth/leads
 *
 * Leitura read-only de Leads do Salesforce.
 * Não grava, não cria contrato, não sincroniza.
 * Guardrail: máximo 10.000 registros.
 */
export async function GET() {
  try {
    const result = await fetchLeadsPreview();
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      leads: result,
    });
  } catch (error) {
    const { status, message } = sanitizeError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: message },
      { status },
    );
  }
}
