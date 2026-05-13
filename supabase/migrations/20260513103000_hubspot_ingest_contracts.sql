-- Migration: HubSpot ingest contracts — persist canonical ingest intent before execution
-- Stores the read-only dry-run contract for HubSpot -> Canopi canonical ingestion.
-- No canonical data is written here. Execution is deferred to a later recorte.
-- source_connection_id remains nullable because there is no formal tenant boundary in this recorte.

CREATE TABLE IF NOT EXISTS public.hubspot_ingest_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'hubspot' CHECK (provider = 'hubspot'),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready', 'blocked', 'executed', 'failed')),
  source_connection_id UUID NULL,
  created_by TEXT NULL,
  contract_json JSONB NOT NULL,
  dry_run_summary JSONB NOT NULL,
  execution_summary JSONB NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hubspot_ingest_contracts_provider
  ON public.hubspot_ingest_contracts(provider);

CREATE INDEX IF NOT EXISTS idx_hubspot_ingest_contracts_status
  ON public.hubspot_ingest_contracts(status);

CREATE INDEX IF NOT EXISTS idx_hubspot_ingest_contracts_created_at
  ON public.hubspot_ingest_contracts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hubspot_ingest_contracts_source_connection_id
  ON public.hubspot_ingest_contracts(source_connection_id);

ALTER TABLE public.hubspot_ingest_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage hubspot_ingest_contracts"
  ON public.hubspot_ingest_contracts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anon hubspot_ingest_contracts"
  ON public.hubspot_ingest_contracts
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny authenticated hubspot_ingest_contracts"
  ON public.hubspot_ingest_contracts
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
