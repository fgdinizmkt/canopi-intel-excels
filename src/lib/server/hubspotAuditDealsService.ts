import { getSupabaseAdminClient } from './supabaseAdmin';

// ── Types ─────────────────────────────────────────────────────────────────

interface DealMapping {
  id: string;
  canonical_id: string;
  canopi_external_id: string;
  hubspot_id: string;
  status: string;
  metadata_json: Record<string, unknown> | null;
}

export interface DealAuditEntry {
  canonicalId: string;
  canopiExternalId: string;
  hsObjectId: string;
  foundInHubspot: boolean;
  propertyChecks: {
    canopi_canonical_id: 'ok' | 'mismatch' | 'missing';
    canopi_opportunity_id: 'ok' | 'mismatch' | 'missing';
    canopi_tenant_id: 'ok' | 'present' | 'missing';
    canopi_sync_status: 'ok' | 'present' | 'missing';
    canopi_source: 'ok' | 'mismatch' | 'missing';
  };
  companyAssociations: number;
  contactAssociations: number;
  auditStatus: 'ok' | 'mismatch' | 'not_found';
  issues: string[];
}

export interface HubspotAuditDealsResult {
  status: 'success';
  mode: 'audit_deals';
  provider: 'hubspot';
  auditedAt: string;
  summary: {
    totalMappings: number;
    verified: number;
    mismatched: number;
    notFoundInHubspot: number;
    totalCompanyAssociations: number;
    totalContactAssociations: number;
  };
  entries: DealAuditEntry[];
  canProceedToNextRecorte: boolean;
  guardrails: string[];
}

// ── HubSpot helpers ───────────────────────────────────────────────────────

interface HubspotBatchReadResponse {
  results?: Array<{
    id?: string;
    properties?: Record<string, string | null>;
  }>;
  errors?: Array<{ message?: string }>;
}

interface HubspotAssocBatchResponse {
  results?: Array<{
    from?: { id?: string };
    to?: Array<{ toObjectId?: number | string }>;
  }>;
}

const DEAL_AUDIT_PROPERTIES = [
  'dealname',
  'canopi_canonical_id',
  'canopi_opportunity_id',
  'canopi_tenant_id',
  'canopi_sync_status',
  'canopi_source',
  'canopi_contract_version',
  'canopi_import_batch_id',
];

async function batchReadDeals(
  token: string,
  hsObjectIds: string[],
): Promise<Map<string, Record<string, string | null>>> {
  const resultMap = new Map<string, Record<string, string | null>>();
  if (hsObjectIds.length === 0) return resultMap;

  const CHUNK = 100;
  for (let i = 0; i < hsObjectIds.length; i += CHUNK) {
    const chunk = hsObjectIds.slice(i, i + CHUNK);
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/batch/read', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: chunk.map((id) => ({ id })),
        properties: DEAL_AUDIT_PROPERTIES,
      }),
      cache: 'no-store',
    });

    if (!res.ok) continue;

    const body = (await res.json().catch(() => ({}))) as HubspotBatchReadResponse;
    for (const r of body.results ?? []) {
      if (r.id && r.properties) {
        resultMap.set(r.id, r.properties as Record<string, string | null>);
      }
    }
  }

  return resultMap;
}

async function batchReadAssociations(
  token: string,
  hsObjectIds: string[],
  toType: 'companies' | 'contacts',
): Promise<Map<string, number>> {
  const countMap = new Map<string, number>();
  if (hsObjectIds.length === 0) return countMap;

  const CHUNK = 100;
  for (let i = 0; i < hsObjectIds.length; i += CHUNK) {
    const chunk = hsObjectIds.slice(i, i + CHUNK);
    const res = await fetch(`https://api.hubapi.com/crm/v4/associations/deals/${toType}/batch/read`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: chunk.map((id) => ({ id })) }),
      cache: 'no-store',
    });

    if (!res.ok) continue;

    const body = (await res.json().catch(() => ({}))) as HubspotAssocBatchResponse;
    for (const r of body.results ?? []) {
      const fromId = r.from?.id;
      if (fromId) {
        countMap.set(fromId, (r.to ?? []).length);
      }
    }
  }

  return countMap;
}

// ── Main export ───────────────────────────────────────────────────────────

export async function runHubspotAuditDeals(): Promise<
  HubspotAuditDealsResult | { status: 'error'; error: string; canProceedToNextRecorte: false }
> {
  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return { status: 'error', error: 'HUBSPOT_TOKEN_NOT_CONFIGURED', canProceedToNextRecorte: false };
  }

  const supabase = getSupabaseAdminClient();
  const auditedAt = new Date().toISOString();

  // 1. Read deal mappings from Supabase
  const { data: mappingsData, error: mappingsError } = await supabase
    .from('hubspot_identity_mappings')
    .select('id, canonical_id, canopi_external_id, hubspot_id, status, metadata_json')
    .eq('provider', 'hubspot')
    .eq('entity_type', 'deal')
    .eq('status', 'active');

  if (mappingsError) {
    return { status: 'error', error: `READ_MAPPINGS_FAILED: ${mappingsError.message}`, canProceedToNextRecorte: false };
  }

  const mappings = (mappingsData ?? []) as DealMapping[];

  if (mappings.length === 0) {
    return { status: 'error', error: 'NO_DEAL_MAPPINGS_FOUND', canProceedToNextRecorte: false };
  }

  const hsObjectIds = mappings.map((m) => m.hubspot_id).filter(Boolean);

  // 2. Batch read deal properties from HubSpot
  const dealPropsMap = await batchReadDeals(token, hsObjectIds);

  // 3. Batch read associations
  const companyAssocMap = await batchReadAssociations(token, hsObjectIds, 'companies');
  const contactAssocMap = await batchReadAssociations(token, hsObjectIds, 'contacts');

  // 4. Build audit entries
  const entries: DealAuditEntry[] = [];

  for (const mapping of mappings) {
    const hsId = mapping.hubspot_id;
    const props = dealPropsMap.get(hsId);
    const foundInHubspot = !!props;

    if (!foundInHubspot) {
      entries.push({
        canonicalId: mapping.canonical_id,
        canopiExternalId: mapping.canopi_external_id,
        hsObjectId: hsId,
        foundInHubspot: false,
        propertyChecks: {
          canopi_canonical_id: 'missing',
          canopi_opportunity_id: 'missing',
          canopi_tenant_id: 'missing',
          canopi_sync_status: 'missing',
          canopi_source: 'missing',
        },
        companyAssociations: 0,
        contactAssociations: 0,
        auditStatus: 'not_found',
        issues: [`Deal não encontrado no HubSpot (hs_object_id: ${hsId})`],
      });
      continue;
    }

    const issues: string[] = [];

    // Property checks
    const checkCanonicalId = (): 'ok' | 'mismatch' | 'missing' => {
      const val = props['canopi_canonical_id'];
      if (!val) return 'missing';
      if (val !== mapping.canonical_id) {
        issues.push(`canopi_canonical_id diverge: HubSpot="${val}" Supabase="${mapping.canonical_id}"`);
        return 'mismatch';
      }
      return 'ok';
    };

    const checkOpportunityId = (): 'ok' | 'mismatch' | 'missing' => {
      const val = props['canopi_opportunity_id'];
      if (!val) return 'missing';
      if (val !== mapping.canopi_external_id) {
        issues.push(`canopi_opportunity_id diverge: HubSpot="${val}" Supabase="${mapping.canopi_external_id}"`);
        return 'mismatch';
      }
      return 'ok';
    };

    const checkTenantId = (): 'ok' | 'present' | 'missing' => {
      const val = props['canopi_tenant_id'];
      if (!val) {
        issues.push('canopi_tenant_id ausente no HubSpot');
        return 'missing';
      }
      return 'present';
    };

    const checkSyncStatus = (): 'ok' | 'present' | 'missing' => {
      const val = props['canopi_sync_status'];
      if (!val) {
        issues.push('canopi_sync_status ausente no HubSpot');
        return 'missing';
      }
      return val === 'pending' ? 'ok' : 'present';
    };

    const checkSource = (): 'ok' | 'mismatch' | 'missing' => {
      const val = props['canopi_source'];
      if (!val) {
        issues.push('canopi_source ausente no HubSpot');
        return 'missing';
      }
      if (val !== 'canopi_clean_reload') {
        issues.push(`canopi_source inesperado: "${val}"`);
        return 'mismatch';
      }
      return 'ok';
    };

    const propertyChecks = {
      canopi_canonical_id: checkCanonicalId(),
      canopi_opportunity_id: checkOpportunityId(),
      canopi_tenant_id: checkTenantId(),
      canopi_sync_status: checkSyncStatus(),
      canopi_source: checkSource(),
    };

    const companyAssociations = companyAssocMap.get(hsId) ?? 0;
    const contactAssociations = contactAssocMap.get(hsId) ?? 0;

    if (companyAssociations === 0) {
      issues.push('Nenhuma associação Deal → Company encontrada no HubSpot');
    }

    const hasMismatch =
      propertyChecks.canopi_canonical_id !== 'ok' ||
      propertyChecks.canopi_opportunity_id !== 'ok' ||
      propertyChecks.canopi_tenant_id === 'missing' ||
      propertyChecks.canopi_source !== 'ok' ||
      companyAssociations === 0;

    entries.push({
      canonicalId: mapping.canonical_id,
      canopiExternalId: mapping.canopi_external_id,
      hsObjectId: hsId,
      foundInHubspot: true,
      propertyChecks,
      companyAssociations,
      contactAssociations,
      auditStatus: hasMismatch ? 'mismatch' : 'ok',
      issues,
    });
  }

  // 5. Build summary
  const verified = entries.filter((e) => e.auditStatus === 'ok').length;
  const mismatched = entries.filter((e) => e.auditStatus === 'mismatch').length;
  const notFound = entries.filter((e) => e.auditStatus === 'not_found').length;
  const totalCompanyAssociations = entries.reduce((s, e) => s + e.companyAssociations, 0);
  const totalContactAssociations = entries.reduce((s, e) => s + e.contactAssociations, 0);

  const canProceed = notFound === 0 && mismatched === 0;

  return {
    status: 'success',
    mode: 'audit_deals',
    provider: 'hubspot',
    auditedAt,
    summary: {
      totalMappings: mappings.length,
      verified,
      mismatched,
      notFoundInHubspot: notFound,
      totalCompanyAssociations,
      totalContactAssociations,
    },
    entries,
    canProceedToNextRecorte: canProceed,
    guardrails: [
      'Auditoria somente leitura — nenhum dado alterado no HubSpot ou Supabase.',
      'Token não exposto na resposta.',
    ],
  };
}
