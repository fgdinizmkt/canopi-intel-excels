import { getSupabaseAdminClient } from './supabaseAdmin';
import type { HubspotIngestApplyRpcResult } from '../hubspotIngestTypes';

export async function applyHubspotIngestContractViaRpc(params: {
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
}): Promise<HubspotIngestApplyRpcResult> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.rpc('apply_hubspot_ingest_contract', {
    contract_id: params.contractId,
    approved_plan_hash: params.approvedPlanHash,
    idempotency_key: params.idempotencyKey,
  });

  if (error) {
    throw new Error('APPLY_HUBSPOT_INGEST_CONTRACT_RPC_FAILED');
  }

  return data as HubspotIngestApplyRpcResult;
}
