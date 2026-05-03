-- Migration: Salesforce OAuth productive minimal connection storage

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.connector_oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('requires_configuration', 'disconnected', 'connected', 'error')),
  instance_url TEXT,
  org_id TEXT,
  user_id TEXT,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  token_type TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  access_token_issued_at TIMESTAMPTZ,
  access_token_expires_at TIMESTAMPTZ,
  last_health_check_at TIMESTAMPTZ,
  account_label TEXT,
  account_fields_count INTEGER,
  api_version TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connector_oauth_connections_provider ON public.connector_oauth_connections(provider);
CREATE INDEX IF NOT EXISTS idx_connector_oauth_connections_status ON public.connector_oauth_connections(status);

ALTER TABLE public.connector_oauth_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny public read connector_oauth_connections"
  ON public.connector_oauth_connections;

DROP POLICY IF EXISTS "Deny public write connector_oauth_connections"
  ON public.connector_oauth_connections;

CREATE POLICY "Service role can manage connector_oauth_connections"
  ON public.connector_oauth_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anon connector_oauth_connections"
  ON public.connector_oauth_connections
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
