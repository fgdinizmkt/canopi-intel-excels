import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/src/lib/supabase/env';

/**
 * Encerra a sessao do Supabase Auth (apaga os cookies de sessao) e volta
 * para o login. Tambem limpa o cookie do login provisorio antigo.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  const { url, anonKey } = getSupabaseEnv();

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    });
    await supabase.auth.signOut();
  }

  // Legado do login provisorio.
  response.cookies.set('canopi_auth', '', { path: '/', maxAge: 0, expires: new Date(0), sameSite: 'lax' });

  return response;
}
