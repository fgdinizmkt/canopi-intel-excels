/**
 * Variaveis do Supabase por ambiente (dev, staging, prod), num lugar so.
 *
 * As referencias a process.env.NEXT_PUBLIC_* ficam escritas por extenso de
 * proposito: o Next so embute no bundle do navegador as variaveis citadas
 * literalmente no codigo.
 */

type Environment = 'dev' | 'staging' | 'prod';

const currentEnv: Environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'dev';

const environmentConfig: Record<Environment, { url?: string; anonKey?: string }> = {
  dev: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_DEV,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV,
  },
  staging: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING,
  },
  prod: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD,
  },
};

export function getSupabaseEnv(): { url?: string; anonKey?: string; env: Environment } {
  const cfg = environmentConfig[currentEnv] ?? environmentConfig.dev;
  return { ...cfg, env: currentEnv };
}

export function isSupabaseEnvConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}
