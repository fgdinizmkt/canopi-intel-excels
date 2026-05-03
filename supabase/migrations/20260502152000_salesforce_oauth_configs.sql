-- Migration: Salesforce OAuth configuration persistence (External Client App)

CREATE TABLE IF NOT EXISTS public.connector_oauth_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  encrypted_client_secret TEXT NOT NULL,
  login_url TEXT NOT NULL DEFAULT 'https://login.salesforce.com',
  redirect_uri TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{api,refresh_token}',
  status TEXT NOT NULL DEFAULT 'configured',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connector_oauth_configs_provider ON public.connector_oauth_configs(provider);

ALTER TABLE public.connector_oauth_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public read connector_oauth_configs"
  ON public.connector_oauth_configs;

DROP POLICY IF EXISTS "Deny public write connector_oauth_configs"
  ON public.connector_oauth_configs;

CREATE POLICY "Service role can manage connector_oauth_configs"
  ON public.connector_oauth_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anon connector_oauth_configs"
  ON public.connector_oauth_configs
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
