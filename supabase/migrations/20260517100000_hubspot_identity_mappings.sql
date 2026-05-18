-- Migration: HubSpot identity mappings — explicit crosswalk between HubSpot external IDs and Canopi canonical IDs
-- This table stores identity resolution only. It does not apply canonical data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.hubspot_identity_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (btrim(provider) <> ''),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('account', 'contact')),
  canonical_id TEXT NOT NULL CHECK (btrim(canonical_id) <> ''),
  canopi_external_id TEXT NOT NULL CHECK (btrim(canopi_external_id) <> ''),
  hubspot_id TEXT NULL,
  source_connection_id UUID NULL,
  source_fingerprint TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'blocked')),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_provider_entity_canonical
  ON public.hubspot_identity_mappings(provider, entity_type, canonical_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_provider_entity_canopi_external
  ON public.hubspot_identity_mappings(provider, entity_type, canopi_external_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_provider_entity_hubspot
  ON public.hubspot_identity_mappings(provider, entity_type, hubspot_id)
  WHERE hubspot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_provider_entity_status
  ON public.hubspot_identity_mappings(provider, entity_type, status);

CREATE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_source_connection_id
  ON public.hubspot_identity_mappings(source_connection_id);

CREATE INDEX IF NOT EXISTS idx_hubspot_identity_mappings_source_fingerprint
  ON public.hubspot_identity_mappings(source_fingerprint);

ALTER TABLE public.hubspot_identity_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage hubspot_identity_mappings"
  ON public.hubspot_identity_mappings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anon hubspot_identity_mappings"
  ON public.hubspot_identity_mappings
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny authenticated hubspot_identity_mappings"
  ON public.hubspot_identity_mappings
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
