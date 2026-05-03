import { NextRequest, NextResponse } from 'next/server';
import {
  fetchObjectsPreview,
  normalizeObjectsPreviewLimit,
  PREVIEW_ALLOWLIST,
} from '@/src/lib/server/salesforceOAuthService';

export const dynamic = 'force-dynamic';

const ALLOWED_OBJECTS = Object.keys(PREVIEW_ALLOWLIST);

function sanitizePreviewError(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (code === 'NOT_CONFIGURED') return { status: 400, message: 'Configuração OAuth pendente.' };
  if (code === 'NOT_CONNECTED') return { status: 400, message: 'Conexão OAuth não está ativa.' };
  if (code === 'TOKEN_REFRESH_EMPTY') return { status: 502, message: 'Não foi possível renovar o token OAuth.' };
  if (code === 'NO_ALLOWED_OBJECTS') return { status: 400, message: 'Nenhum objeto válido informado.' };
  return { status: 500, message: 'Não foi possível carregar o preview multi-entidade no momento.' };
}

export async function GET(request: NextRequest) {
  const rawObjects = request.nextUrl.searchParams.get('objects') ?? '';
  const rawLimit = request.nextUrl.searchParams.get('limit');

  const requestedObjects = rawObjects
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const objects =
    requestedObjects.length > 0
      ? requestedObjects.filter((o) => ALLOWED_OBJECTS.includes(o))
      : ALLOWED_OBJECTS;

  if (!objects.length) {
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: 'Nenhum objeto válido informado.' },
      { status: 400 },
    );
  }

  const limit = normalizeObjectsPreviewLimit(rawLimit);

  try {
    const results = await fetchObjectsPreview(objects, limit);
    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      requestedAt: new Date().toISOString(),
      objects: results,
    });
  } catch (error) {
    const mapped = sanitizePreviewError(error);
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: mapped.message },
      { status: mapped.status },
    );
  }
}
