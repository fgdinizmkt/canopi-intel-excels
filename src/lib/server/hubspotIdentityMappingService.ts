import { getSupabaseAdminClient } from './supabaseAdmin';
import type {
  HubspotIdentityMapping,
  HubspotIdentityMappingEntityType,
  HubspotIdentityMappingLookupFilters,
  HubspotIdentityMappingProvider,
  HubspotIdentityMappingStatus,
} from '../hubspotIngestTypes';

const DEFAULT_PROVIDER: HubspotIdentityMappingProvider = 'hubspot';

type HubspotIdentityMappingRow = {
  id: string;
  provider: string;
  entity_type: string;
  canonical_id: string;
  canopi_external_id: string;
  hubspot_id: string | null;
  source_connection_id: string | null;
  source_fingerprint: string | null;
  status: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function readProvider(value: unknown): HubspotIdentityMappingProvider {
  return value === 'hubspot' ? 'hubspot' : DEFAULT_PROVIDER;
}

function readEntityType(value: unknown): HubspotIdentityMappingEntityType {
  if (value === 'account') return 'account';
  if (value === 'deal') return 'deal';
  return 'contact';
}

function readStatus(value: unknown): HubspotIdentityMappingStatus {
  if (value === 'inactive') return 'inactive';
  if (value === 'blocked') return 'blocked';
  return 'active';
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function mapRow(row: HubspotIdentityMappingRow): HubspotIdentityMapping {
  return {
    id: row.id,
    provider: readProvider(row.provider),
    entityType: readEntityType(row.entity_type),
    canonicalId: row.canonical_id,
    canopiExternalId: row.canopi_external_id,
    hubspotId: row.hubspot_id,
    sourceConnectionId: row.source_connection_id,
    sourceFingerprint: row.source_fingerprint,
    status: readStatus(row.status),
    metadataJson: normalizeMetadata(row.metadata_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function queryIdentityMappings(filters: HubspotIdentityMappingLookupFilters): Promise<HubspotIdentityMapping[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from('hubspot_identity_mappings')
    .select('id, provider, entity_type, canonical_id, canopi_external_id, hubspot_id, source_connection_id, source_fingerprint, status, metadata_json, created_at, updated_at');

  query = query.eq('provider', filters.provider ?? DEFAULT_PROVIDER);

  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  if (filters.canonicalId) {
    query = query.eq('canonical_id', filters.canonicalId);
  }
  if (filters.canopiExternalId) {
    query = query.eq('canopi_external_id', filters.canopiExternalId);
  }
  if (filters.hubspotId) {
    query = query.eq('hubspot_id', filters.hubspotId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('updated_at', { ascending: false }).order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    throw new Error('READ_HUBSPOT_IDENTITY_MAPPINGS_FAILED');
  }

  return (data ?? []).map((row) => mapRow(row as HubspotIdentityMappingRow));
}

export async function listHubspotIdentityMappings(filters: HubspotIdentityMappingLookupFilters = {}): Promise<HubspotIdentityMapping[]> {
  return queryIdentityMappings(filters);
}

export async function listHubspotIdentityMappingsByCanonicalId(
  canonicalId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'canonicalId'> = {},
): Promise<HubspotIdentityMapping[]> {
  const normalizedCanonicalId = readString(canonicalId);
  if (!normalizedCanonicalId) return [];
  return queryIdentityMappings({ ...filters, canonicalId: normalizedCanonicalId });
}

export async function listHubspotIdentityMappingsByCanopiExternalId(
  canopiExternalId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'canopiExternalId'> = {},
): Promise<HubspotIdentityMapping[]> {
  const normalizedCanopiExternalId = readString(canopiExternalId);
  if (!normalizedCanopiExternalId) return [];
  return queryIdentityMappings({ ...filters, canopiExternalId: normalizedCanopiExternalId });
}

export async function listHubspotIdentityMappingsByHubspotId(
  hubspotId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'hubspotId'> = {},
): Promise<HubspotIdentityMapping[]> {
  const normalizedHubspotId = readString(hubspotId);
  if (!normalizedHubspotId) return [];
  return queryIdentityMappings({ ...filters, hubspotId: normalizedHubspotId });
}

export async function findHubspotIdentityMappingByCanonicalId(
  canonicalId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'canonicalId'> = {},
): Promise<HubspotIdentityMapping | null> {
  const [first] = await listHubspotIdentityMappingsByCanonicalId(canonicalId, filters);
  return first ?? null;
}

export async function findHubspotIdentityMappingByCanopiExternalId(
  canopiExternalId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'canopiExternalId'> = {},
): Promise<HubspotIdentityMapping | null> {
  const [first] = await listHubspotIdentityMappingsByCanopiExternalId(canopiExternalId, filters);
  return first ?? null;
}

export async function findHubspotIdentityMappingByHubspotId(
  hubspotId: string,
  filters: Omit<HubspotIdentityMappingLookupFilters, 'hubspotId'> = {},
): Promise<HubspotIdentityMapping | null> {
  const [first] = await listHubspotIdentityMappingsByHubspotId(hubspotId, filters);
  return first ?? null;
}
