import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Environment = 'dev' | 'staging' | 'prod';

const currentEnv: Environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'dev';

function getSupabaseUrl(env: Environment): string {
  const byEnv = {
    dev: process.env.NEXT_PUBLIC_SUPABASE_URL_DEV,
    staging: process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
    prod: process.env.NEXT_PUBLIC_SUPABASE_URL_PROD,
  }[env];

  return byEnv || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getServiceRoleKey(env: Environment): string {
  const byEnv = {
    dev: process.env.SUPABASE_SERVICE_ROLE_KEY_DEV,
    staging: process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
    prod: process.env.SUPABASE_SERVICE_ROLE_KEY_PROD,
  }[env];

  return byEnv || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = getSupabaseUrl(currentEnv);
  const serviceRoleKey = getServiceRoleKey(currentEnv);

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin configuration is missing.');
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
