-- Migration: Salesforce sync contracts — persist approved multi-entity contract after dry-run
-- Stores the user-approved sync contract (intent to sync) without writing any canonical data.
-- No Salesforce record data is written to accounts, contacts, campaigns or any canonical table.

CREATE TABLE IF NOT EXISTS public.salesforce_sync_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'salesforce',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'mapped', 'synced', 'cancelled')),
  contract_json JSONB NOT NULL,
  dry_run_summary JSONB NOT NULL,
  created_by TEXT NULL,
  source_connection_id UUID NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salesforce_sync_contracts_provider
  ON public.salesforce_sync_contracts(provider);

CREATE INDEX IF NOT EXISTS idx_salesforce_sync_contracts_status
  ON public.salesforce_sync_contracts(status);

CREATE INDEX IF NOT EXISTS idx_salesforce_sync_contracts_created_at
  ON public.salesforce_sync_contracts(created_at DESC);

ALTER TABLE public.salesforce_sync_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage salesforce_sync_contracts"
  ON public.salesforce_sync_contracts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Deny anon salesforce_sync_contracts"
  ON public.salesforce_sync_contracts
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny authenticated salesforce_sync_contracts"
  ON public.salesforce_sync_contracts
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
