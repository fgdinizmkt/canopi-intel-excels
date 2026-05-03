import { NextRequest, NextResponse } from 'next/server';
import { fetchAccountsPreview } from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

function sanitizeAccountsPreviewError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  const status = (error as Error & { status?: number }).status;

  if (code === 'NOT_CONFIGURED') {
    return { status: 400, message: 'Configuração OAuth pendente.' };
  }

  if (code === 'NOT_CONNECTED') {
    return { status: 400, message: 'Conexão OAuth ainda não está ativa.' };
  }

  if (code === 'TOKEN_REFRESH_EMPTY') {
    return { status: 502, message: 'Não foi possível renovar o token OAuth.' };
  }

  if (code === 'ACCOUNT_QUERY_FAILED' && status === 429) {
    return { status: 429, message: 'Salesforce atingiu limite temporário. Tente novamente em instantes.' };
  }

  if (code === 'ACCOUNT_QUERY_FAILED' && (status === 401 || status === 403)) {
    return { status: 403, message: 'Sem permissão para ler Accounts nesta organização Salesforce.' };
  }

  if (code === 'ACCOUNT_QUERY_FAILED' && status === 400) {
    return { status: 400, message: 'Salesforce não aceitou a consulta de Accounts.' };
  }

  return { status: 500, message: 'Não foi possível carregar o preview de Accounts no momento.' };
}

function normalizeLimit(rawValue: string | null): number {
  if (!rawValue) return 10;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return 10;
  const limit = Math.trunc(parsed);
  if (limit <= 0) return 10;
  return Math.min(limit, 25);
}

export async function GET(request: NextRequest) {
  const limit = normalizeLimit(request.nextUrl.searchParams.get('limit'));

  try {
    const preview = await fetchAccountsPreview(limit);
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      preview,
    });
  } catch (error) {
    const mapped = sanitizeAccountsPreviewError(error);
    return NextResponse.json(
      {
        status: 'error',
        provider: 'salesforce',
        error: mapped.message,
      },
      { status: mapped.status }
    );
  }
}
