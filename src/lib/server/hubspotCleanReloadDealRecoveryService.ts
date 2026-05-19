import { getSupabaseAdminClient } from './supabaseAdmin';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';

export const DEAL_RECOVERY_CONTRACT_VERSION = 'c2.9e.2d.14';

const ASSOC_CHUNK_SIZE = 50;

// ── Types ─────────────────────────────────────────────────────────────────

type AccountSlugRow = {
  id: string;
  slug: string | null;
};

type OportunidadeRow = {
  id: string;
  account_slug: string | null;
};

type ContactAccountRow = {
  id: string;
  accountId: string | null;
};

export interface KnownDealMapping {
  canonicalId: string;
  hsObjectId: string;
}

export interface DealRecoveryEntry {
  canonicalId: string;
  hsObjectId: string;
  accountCanonicalId: string;
  companyHubspotId: string;
  contactHubspotIds: string[];
  mappingStatus: 'persisted' | 'failed' | 'skipped_already_exists';
  companyAssociationCreated: boolean;
  contactAssociationsCreated: number;
}

export interface AssociationFailure {
  dealHsObjectId: string;
  targetId: string;
  targetType: 'company' | 'contact';
  error: string;
}

export interface HubspotCleanReloadDealRecoveryResult {
  status: 'success';
  mode: 'recover_deal_mappings';
  provider: 'hubspot';
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
  inputDeals: number;
  skippedAlreadyMapped: number;
  mappingsPersisted: number;
  mappingsFailed: number;
  companyAssociationsAttempted: number;
  companyAssociationsCreated: number;
  companyAssociationsFailed: number;
  contactAssociationsAttempted: number;
  contactAssociationsCreated: number;
  contactAssociationsFailed: number;
  resolvedDeals: DealRecoveryEntry[];
  unresolvedCanonicalIds: string[];
  associationFailures: AssociationFailure[];
  blockers: string[];
  warnings: string[];
  canProceedToNextRecorte: boolean;
}

export interface HubspotCleanReloadDealRecoveryOptions {
  batchId: string;
  tenantId: string;
  contractVersion?: string;
  knownDealMappings: KnownDealMapping[];
}

// ── Associations ──────────────────────────────────────────────────────────

interface AssociationInput {
  from: { id: string };
  to: { id: string };
  types: Array<{ associationCategory: string; associationTypeId: number }>;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function batchAssociate(
  token: string,
  fromType: string,
  toType: string,
  allInputs: AssociationInput[],
  associationTypeId: number,
  retries = 2,
): Promise<{ succeeded: number; failed: AssociationFailure[] }> {
  if (allInputs.length === 0) return { succeeded: 0, failed: [] };

  const failedAssociations: AssociationFailure[] = [];
  let succeeded = 0;
  const targetType = toType === 'companies' ? 'company' : 'contact';

  for (let i = 0; i < allInputs.length; i += ASSOC_CHUNK_SIZE) {
    const chunk = allInputs.slice(i, i + ASSOC_CHUNK_SIZE);
    let done = false;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const res = await fetch(`https://api.hubapi.com/crm/v4/associations/${fromType}/${toType}/batch/create`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: chunk }),
        cache: 'no-store',
      });

      if (res.status === 429 && attempt < retries) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? 10);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (res.ok) {
        succeeded += chunk.length;
      } else {
        const errBody = (await res.json().catch(() => ({}))) as { message?: string };
        const msg = errBody.message ?? `HTTP ${res.status}`;
        for (const input of chunk) {
          failedAssociations.push({ dealHsObjectId: input.from.id, targetId: input.to.id, targetType, error: msg });
        }
      }
      done = true;
      break;
    }

    if (!done) {
      for (const input of chunk) {
        failedAssociations.push({ dealHsObjectId: input.from.id, targetId: input.to.id, targetType, error: 'RATE_LIMIT_EXHAUSTED' });
      }
    }
  }

  return { succeeded, failed: failedAssociations };
}

// ── Main export ───────────────────────────────────────────────────────────

export async function runHubspotCleanReloadDealRecovery(
  options: HubspotCleanReloadDealRecoveryOptions,
): Promise<HubspotCleanReloadDealRecoveryResult | { status: 'error'; error: string; canProceedToNextRecorte: false }> {
  const { batchId, tenantId, contractVersion = DEAL_RECOVERY_CONTRACT_VERSION, knownDealMappings } = options;
  const executedAt = new Date().toISOString();

  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return { status: 'error', error: 'HUBSPOT_TOKEN_NOT_CONFIGURED', canProceedToNextRecorte: false };
  }

  if (!knownDealMappings || knownDealMappings.length === 0) {
    return { status: 'error', error: 'KNOWN_DEAL_MAPPINGS_REQUIRED', canProceedToNextRecorte: false };
  }

  const blockers: string[] = [];
  const warnings: string[] = [];

  // ── Load Supabase context ─────────────────────────────────────────────

  const supabase = getSupabaseAdminClient();

  // Existing deal mappings (idempotency)
  const existingDealMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'deal', status: 'active' });
  const alreadyMappedById = new Map<string, boolean>();
  for (const m of existingDealMappings) {
    if (m.canonicalId) alreadyMappedById.set(m.canonicalId, true);
  }

  // Company mappings
  const companyMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'account', status: 'active' });
  const companyMappingByAccountId = new Map<string, string>();
  for (const m of companyMappings) {
    if (m.canonicalId && m.hubspotId) companyMappingByAccountId.set(m.canonicalId, m.hubspotId);
  }

  // Contact mappings
  const contactMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'contact', status: 'active' });
  const contactMappingByCanonicalId = new Map<string, string>();
  for (const m of contactMappings) {
    if (m.canonicalId && m.hubspotId) contactMappingByCanonicalId.set(m.canonicalId, m.hubspotId);
  }

  // Accounts slug → id
  const { data: accsData, error: accsError } = await supabase.from('accounts').select('id, slug').not('slug', 'is', null);
  if (accsError) return { status: 'error', error: 'READ_ACCOUNTS_FAILED', canProceedToNextRecorte: false };
  const slugToAccountId = new Map<string, string>();
  for (const acc of (accsData ?? []) as AccountSlugRow[]) {
    if (acc.slug) slugToAccountId.set(acc.slug, acc.id);
  }

  // Oportunidades canonicalId → account_slug
  const { data: opsData, error: opsError } = await supabase.from('oportunidades').select('id, account_slug');
  if (opsError) return { status: 'error', error: 'READ_OPORTUNIDADES_FAILED', canProceedToNextRecorte: false };
  const dealSlugById = new Map<string, string>();
  for (const row of (opsData ?? []) as OportunidadeRow[]) {
    if (row.account_slug) dealSlugById.set(row.id, row.account_slug);
  }

  // Contacts → accountId map
  const { data: contactsData, error: contactsError } = await supabase.from('contacts').select('id, accountId');
  if (contactsError) return { status: 'error', error: 'READ_CONTACTS_FAILED', canProceedToNextRecorte: false };
  const contactHubspotIdsByAccountId = new Map<string, string[]>();
  for (const row of (contactsData ?? []) as ContactAccountRow[]) {
    if (!row.accountId) continue;
    const contactHsId = contactMappingByCanonicalId.get(row.id);
    if (!contactHsId) continue;
    if (!contactHubspotIdsByAccountId.has(row.accountId)) contactHubspotIdsByAccountId.set(row.accountId, []);
    contactHubspotIdsByAccountId.get(row.accountId)!.push(contactHsId);
  }

  // ── Resolve each known deal ───────────────────────────────────────────

  const resolvedDeals: DealRecoveryEntry[] = [];
  const unresolvedCanonicalIds: string[] = [];
  const toInsert: Array<{
    canonicalId: string;
    hsObjectId: string;
    accountCanonicalId: string;
    companyHubspotId: string;
    contactHubspotIds: string[];
  }> = [];

  for (const { canonicalId, hsObjectId } of knownDealMappings) {
    if (alreadyMappedById.has(canonicalId)) {
      resolvedDeals.push({
        canonicalId,
        hsObjectId,
        accountCanonicalId: '',
        companyHubspotId: '',
        contactHubspotIds: [],
        mappingStatus: 'skipped_already_exists',
        companyAssociationCreated: false,
        contactAssociationsCreated: 0,
      });
      continue;
    }

    const accountSlug = dealSlugById.get(canonicalId);
    if (!accountSlug) {
      unresolvedCanonicalIds.push(canonicalId);
      warnings.push(`canonicalId ${canonicalId}: account_slug não encontrado em oportunidades`);
      continue;
    }

    const accountCanonicalId = slugToAccountId.get(accountSlug);
    if (!accountCanonicalId) {
      unresolvedCanonicalIds.push(canonicalId);
      warnings.push(`canonicalId ${canonicalId}: slug '${accountSlug}' não resolvido para accountId`);
      continue;
    }

    const companyHubspotId = companyMappingByAccountId.get(accountCanonicalId);
    if (!companyHubspotId) {
      unresolvedCanonicalIds.push(canonicalId);
      warnings.push(`canonicalId ${canonicalId}: accountId ${accountCanonicalId} sem mapping de Company ativo`);
      continue;
    }

    const contactHubspotIds = contactHubspotIdsByAccountId.get(accountCanonicalId) ?? [];

    toInsert.push({ canonicalId, hsObjectId, accountCanonicalId, companyHubspotId, contactHubspotIds });
  }

  // ── Insert mappings ───────────────────────────────────────────────────

  let mappingsPersisted = 0;
  let mappingsFailed = 0;

  if (toInsert.length > 0) {
    const rows = toInsert.map((e) => ({
      provider: 'hubspot',
      entity_type: 'deal',
      canonical_id: e.canonicalId,
      canopi_external_id: `cpdo_${stableHash(e.canonicalId)}`,
      hubspot_id: e.hsObjectId,
      status: 'active',
      metadata_json: {
        batchId,
        tenantId,
        contractVersion,
        createdAt: executedAt,
        source: 'canopi_clean_reload',
        recoveryMode: true,
        associatedCompanyCanonicalId: e.accountCanonicalId,
        associatedCompanyHubspotId: e.companyHubspotId,
      },
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from('hubspot_identity_mappings')
      .insert(rows)
      .select('id, canonical_id');

    if (insertError) {
      blockers.push(`Insert de mappings falhou: ${insertError.message}`);
      mappingsFailed = toInsert.length;
    } else {
      const persistedSet = new Set((insertedData ?? []).map((r: { canonical_id: string }) => r.canonical_id));
      for (const e of toInsert) {
        const wasPersisted = persistedSet.has(e.canonicalId);
        if (wasPersisted) {
          mappingsPersisted += 1;
        } else {
          mappingsFailed += 1;
          warnings.push(`Mapping não retornado para canonicalId ${e.canonicalId}`);
        }
        resolvedDeals.push({
          canonicalId: e.canonicalId,
          hsObjectId: e.hsObjectId,
          accountCanonicalId: e.accountCanonicalId,
          companyHubspotId: e.companyHubspotId,
          contactHubspotIds: e.contactHubspotIds,
          mappingStatus: wasPersisted ? 'persisted' : 'failed',
          companyAssociationCreated: false,
          contactAssociationsCreated: 0,
        });
      }
    }
  }

  if (blockers.length > 0) {
    return buildErrorResult({ blockers, warnings, contractVersion, batchId, tenantId, executedAt, inputDeals: knownDealMappings.length });
  }

  // ── Associate Deal → Company (typeId=5) ───────────────────────────────

  const dealsForAssoc = resolvedDeals.filter((d) => d.mappingStatus === 'persisted' || d.mappingStatus === 'skipped_already_exists');
  const companyAssocInputs: AssociationInput[] = dealsForAssoc
    .filter((d) => d.companyHubspotId)
    .map((d) => ({
      from: { id: d.hsObjectId },
      to: { id: d.companyHubspotId },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }],
    }));

  const { succeeded: compAssocSucceeded, failed: compAssocFailed } = await batchAssociate(
    token, 'deals', 'companies', companyAssocInputs, 5,
  );

  const compAssocFailedSet = new Set(compAssocFailed.map((f) => f.dealHsObjectId));
  for (const d of resolvedDeals) {
    if (d.companyHubspotId) {
      d.companyAssociationCreated = !compAssocFailedSet.has(d.hsObjectId);
    }
  }

  // ── Associate Deal → Contact (typeId=3) ───────────────────────────────

  const contactAssocInputs: AssociationInput[] = [];
  for (const d of dealsForAssoc) {
    for (const contactHsId of d.contactHubspotIds) {
      contactAssocInputs.push({
        from: { id: d.hsObjectId },
        to: { id: contactHsId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      });
    }
  }

  const { succeeded: contactAssocSucceeded, failed: contactAssocFailed } = await batchAssociate(
    token, 'deals', 'contacts', contactAssocInputs, 3,
  );

  const contactAssocFailedSet = new Set(contactAssocFailed.map((f) => `${f.dealHsObjectId}:${f.targetId}`));
  for (const d of resolvedDeals) {
    d.contactAssociationsCreated = d.contactHubspotIds.filter(
      (cHsId) => !contactAssocFailedSet.has(`${d.hsObjectId}:${cHsId}`),
    ).length;
  }

  const allAssocFailures = [...compAssocFailed, ...contactAssocFailed];

  if (compAssocFailed.length > 0) {
    blockers.push(`${compAssocFailed.length} associação(ões) Deal → Company falharam.`);
  }
  if (mappingsFailed > 0) {
    blockers.push(`${mappingsFailed} mapping(s) não foram persistidos.`);
  }

  return {
    status: 'success',
    mode: 'recover_deal_mappings',
    provider: 'hubspot',
    contractVersion,
    batchId,
    tenantId,
    executedAt,
    inputDeals: knownDealMappings.length,
    skippedAlreadyMapped: resolvedDeals.filter((d) => d.mappingStatus === 'skipped_already_exists').length,
    mappingsPersisted,
    mappingsFailed,
    companyAssociationsAttempted: companyAssocInputs.length,
    companyAssociationsCreated: compAssocSucceeded,
    companyAssociationsFailed: compAssocFailed.length,
    contactAssociationsAttempted: contactAssocInputs.length,
    contactAssociationsCreated: contactAssocSucceeded,
    contactAssociationsFailed: contactAssocFailed.length,
    resolvedDeals,
    unresolvedCanonicalIds,
    associationFailures: allAssocFailures,
    blockers,
    warnings,
    canProceedToNextRecorte: blockers.length === 0 && mappingsPersisted > 0,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function buildErrorResult(opts: {
  blockers: string[];
  warnings: string[];
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
  inputDeals: number;
}): HubspotCleanReloadDealRecoveryResult {
  return {
    status: 'success',
    mode: 'recover_deal_mappings',
    provider: 'hubspot',
    contractVersion: opts.contractVersion,
    batchId: opts.batchId,
    tenantId: opts.tenantId,
    executedAt: opts.executedAt,
    inputDeals: opts.inputDeals,
    skippedAlreadyMapped: 0,
    mappingsPersisted: 0,
    mappingsFailed: 0,
    companyAssociationsAttempted: 0,
    companyAssociationsCreated: 0,
    companyAssociationsFailed: 0,
    contactAssociationsAttempted: 0,
    contactAssociationsCreated: 0,
    contactAssociationsFailed: 0,
    resolvedDeals: [],
    unresolvedCanonicalIds: [],
    associationFailures: [],
    blockers: opts.blockers,
    warnings: opts.warnings,
    canProceedToNextRecorte: false,
  };
}
