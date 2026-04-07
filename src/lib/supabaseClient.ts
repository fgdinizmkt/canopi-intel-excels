import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * Supports dev, staging, and prod environments via NEXT_PUBLIC_ENVIRONMENT
 * Degrades gracefully when environment variables are not configured
 */

type Environment = 'dev' | 'staging' | 'prod';

const currentEnv: Environment = (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'dev';

/**
 * Explicit environment mapping for security and clarity
 */
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

const config = environmentConfig[currentEnv];

/**
 * Supabase client instance
 * Returns null if environment variables are not configured
 * This allows the application to run without Supabase during development
 */
export const supabase = (() => {
  if (!config.url || !config.anonKey) {
    console.warn(
      `[Supabase] Environment variables not configured for '${currentEnv}' environment. ` +
      `Add NEXT_PUBLIC_SUPABASE_URL_${currentEnv.toUpperCase()} and NEXT_PUBLIC_SUPABASE_ANON_KEY_${currentEnv.toUpperCase()} to .env.local`
    );
    return null;
  }

  return createClient(config.url, config.anonKey);
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
  return currentEnv;
};

export default supabase;
