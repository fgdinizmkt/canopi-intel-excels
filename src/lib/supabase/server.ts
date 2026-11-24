/**
 * Cliente Supabase para Server Components e Route Handlers.
 *
 * Le a sessao do usuario nos cookies (gravados pelo cliente do navegador e
 * renovados pelo middleware). Um cliente novo por requisicao, nunca
 * compartilhado entre requisicoes.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Components nao podem gravar cookie; o middleware ja renova
        // a sessao, entao aqui a falha e esperada e segura de ignorar.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* chamado de um Server Component */
        }
      },
    },
  });
}

/** Usuario autenticado da requisicao atual, ou null. */
export async function getUsuarioAtual() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
