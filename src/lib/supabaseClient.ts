import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './supabase/env';

/**
 * Supabase Client Configuration
 * Supports dev, staging, and prod environments via NEXT_PUBLIC_ENVIRONMENT
 * Degrades gracefully when environment variables are not configured
 *
 * No navegador o cliente carrega a sessao do usuario (Supabase Auth, em
 * cookies), entao toda leitura vai como usuario logado e as regras de RLS
 * liberam so para membros. No servidor (pre-render de componente cliente)
 * nao ha sessao: o cliente existe so para nao quebrar o import.
 */

type Environment = 'dev' | 'staging' | 'prod';

const { url: supabaseUrl, anonKey: supabaseAnonKey, env: currentEnv } = getSupabaseEnv();

/**
 * Supabase client instance
 * Returns null if environment variables are not configured
 */
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      `[Supabase] Environment variables not configured for '${currentEnv}' environment. ` +
      `Add NEXT_PUBLIC_SUPABASE_URL_${currentEnv.toUpperCase()} and NEXT_PUBLIC_SUPABASE_ANON_KEY_${currentEnv.toUpperCase()} to .env.local`
    );
    return null;
  }

  if (typeof window !== 'undefined') {
    // Singleton no navegador, sessao em cookies (lida pelo middleware).
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
})();

/**
 * Check if Supabase is configured and ready
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Get current environment
 */
export const getEnvironment = (): Environment => {
  return currentEnv as Environment;
};

/**
 * Lê todas as linhas de uma consulta, contornando o teto padrão do PostgREST
 * (1.000 linhas por requisição). Pagina com .range() até esgotar o resultado.
 *
 * Uso: fetchAllRows(() => supabase!.from('accounts').select('...'))
 * O factory é reexecutado a cada página para aplicar um novo range.
 */
type RowsResult = { data: unknown[] | null; error: { message: string } | null };

export async function fetchAllRows<T>(
  build: () => PromiseLike<RowsResult> & {
    range: (from: number, to: number) => PromiseLike<RowsResult>;
  },
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const PAGE = 1000;
  let fromIdx = 0;
  const all: T[] = [];

  for (;;) {
    const { data, error } = await build().range(fromIdx, fromIdx + PAGE - 1);
    if (error) {
      return { data: null, error };
    }
    const batch = (data || []) as T[];
    all.push(...batch);
    if (batch.length < PAGE) {
      break;
    }
    fromIdx += PAGE;
  }

  return { data: all, error: null };
}

export default supabase;
