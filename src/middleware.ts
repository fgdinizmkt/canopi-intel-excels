/**
 * Guarda de autenticacao do Knopi (Supabase Auth).
 *
 * A cada requisicao: renova a sessao do usuario nos cookies e manda para
 * /login quem nao esta logado. Cobre todas as paginas, inclusive as do
 * Pages Router em src/pages, que antes escapavam do guard por cookie.
 *
 * /api tambem exige sessao: sem login a resposta e 401 em JSON (nada de
 * redirecionar chamada de API para a tela de login). Sem isso, qualquer um
 * chamava o assistente (credito do Gemini) e as rotas de escrita no CRM.
 * O retorno do OAuth do Salesforce chega pelo navegador do proprio usuario,
 * com o cookie de sessao, entao continua funcionando.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './lib/supabase/env';

const ROTAS_PUBLICAS = ['/login', '/logout'];

function ehPublica(path: string): boolean {
  return ROTAS_PUBLICAS.some((r) => path === r || path.startsWith(`${r}/`));
}

function ehApi(path: string): boolean {
  return path === '/api' || path.startsWith('/api/');
}

function naoAutorizado(): NextResponse {
  return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const { url, anonKey } = getSupabaseEnv();

  // Sem Supabase configurado nao ha como autenticar: fecha tudo menos o login.
  if (!url || !anonKey) {
    if (ehPublica(path)) return NextResponse.next();
    if (ehApi(path)) return naoAutorizado();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Resposta que grava cookie de sessao nunca pode ser cacheada pela CDN.
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Renova e valida a sessao antes de qualquer resposta.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims?.sub);

  if (!logado && ehApi(path)) {
    return naoAutorizado();
  }

  if (!logado && !ehPublica(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (logado && path === '/login') {
    const destino = NextResponse.redirect(new URL('/', request.url));
    response.cookies.getAll().forEach((c) => destino.cookies.set(c));
    return destino;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf)$).*)',
  ],
};
