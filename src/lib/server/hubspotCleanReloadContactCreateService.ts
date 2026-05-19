import { getSupabaseAdminClient } from './supabaseAdmin';
import { validateHubspotPropertyRegistry } from '@/src/lib/hubspotPropertyRegistry';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';

export const CLEAN_RELOAD_CONTACT_CREATE_CONTRACT_VERSION = 'c2.9e.2d.13';

const CHUNK_SIZE = 50;
const ASSOC_CHUNK_SIZE = 50;

// ── ID generation ─────────────────────────────────────────────────────────

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function buildCanopiContactId(canonicalId: string): string {
  return `cpct_${stableHash(canonicalId)}`;
}

function splitName(nome: string | null): { firstname: string | null; lastname: string | null } {
  if (!nome || !nome.trim()) return { firstname: null, lastname: null };
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: null };
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
}

// ── Types ─────────────────────────────────────────────────────────────────

type ContactDbRow = {
  id: string;
  accountId: string | null;
  nome: string | null;
  cargo: string | null;
  area: string | null;
  status: string | null;
};

interface ContactCandidate {
  canonicalId: string;
  canopiContactId: string;
  nome: string | null;
  cargo: string | null;
  accountCanonicalId: string;
  companyHubspotId: string;
}

export interface ContactCreateEntry {
  canonicalId: string;
  canopiContactId: string;
  hsObjectId: string;
  companyHubspotId: string;
  associationCreated: boolean;
  mappingStatus: 'persisted' | 'failed';
}

export interface ContactCreateFailure {
  canonicalId: string;
  canopiContactId: string;
  error: string;
}

export interface AssociationFailure {
  contactHsObjectId: string;
  companyHubspotId: string;
  error: string;
}

export interface HubspotCleanReloadContactCreatePreflight {
  registryValid: boolean;
  contactBlockingPropertiesReady: boolean;
  contactBlockingMissing: string[];
  contactPropertiesCreated: string[];
  contactPropertiesFailed: string[];
  contactPropertiesAlreadyExist: string[];
  existingCompanyMappings: number;
  existingContactMappings: number;
  validContacts: number;
  blockedContacts: number;
  blockedNoAnchor: number;
  blockedReasons: string[];
}

export interface HubspotCleanReloadContactCreateResult {
  status: 'success';
  mode: 'create_contacts';
  provider: 'hubspot';
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
  preflight: HubspotCleanReloadContactCreatePreflight;
  results: {
    attempted: number;
    created: number;
    failed: number;
    associationsAttempted: number;
    associationsCreated: number;
    associationsFailed: number;
    mappingsPersisted: number;
    mappingsFailed: number;
    createdWithoutMapping: number;
  };
  createdContacts: ContactCreateEntry[];
  failedContacts: ContactCreateFailure[];
  associationFailures: AssociationFailure[];
  blockers: string[];
  warnings: string[];
  canProceedToDealCreate: boolean;
  guardrails: string[];
}

export interface HubspotCleanReloadContactCreateOptions {
  batchId: string;
  tenantId: string;
  contractVersion?: string;
  resumeMode?: boolean;
}

// ── Contact property specs ─────────────────────────────────────────────────

const SYNC_STATUS_OPTIONS = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Ativo', value: 'active' },
  { label: 'Com conflito', value: 'conflicted' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Arquivado', value: 'archived' },
];

interface ContactPropertySpec {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  hasUniqueValue?: boolean;
  options?: Array<{ label: string; value: string }>;
}

const CONTACT_PROPERTY_SPECS: ContactPropertySpec[] = [
  // Blocking — identity
  { name: 'canopi_canonical_id', label: 'Canopi Canonical ID', type: 'string', fieldType: 'text', hasUniqueValue: true },
  { name: 'canopi_contact_id', label: 'Canopi Contact ID', type: 'string', fieldType: 'text', hasUniqueValue: true },
  { name: 'canopi_tenant_id', label: 'Canopi Tenant ID', type: 'string', fieldType: 'text', hasUniqueValue: false },
  // Metadata — not blocking
  { name: 'canopi_associated_company_id', label: 'Canopi Associated Company ID', type: 'string', fieldType: 'text', hasUniqueValue: false },
  { name: 'canopi_import_batch_id', label: 'Canopi Import Batch ID', type: 'string', fieldType: 'text', hasUniqueValue: false },
  { name: 'canopi_contract_version', label: 'Canopi Contract Version', type: 'string', fieldType: 'text', hasUniqueValue: false },
  {
    name: 'canopi_sync_status',
    label: 'Canopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    hasUniqueValue: false,
    options: SYNC_STATUS_OPTIONS,
  },
  { name: 'canopi_last_sync_at', label: 'Canopi Last Sync At', type: 'string', fieldType: 'text', hasUniqueValue: false },
  { name: 'canopi_source', label: 'Canopi Source', type: 'string', fieldType: 'text', hasUniqueValue: false },
];

const CONTACT_BLOCKING_NAMES = new Set(['canopi_canonical_id', 'canopi_contact_id', 'canopi_tenant_id']);

// ── HubSpot property setup ────────────────────────────────────────────────

async function ensureContactProperties(
  token: string,
): Promise<{ blockingMissing: string[]; created: string[]; failed: string[]; alreadyExist: string[] }> {
  const listRes = await fetch('https://api.hubapi.com/crm/v3/properties/contacts?limit=500', {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const listBody = (await listRes.json().catch(() => ({ results: [] }))) as { results?: Array<{ name?: string }> };
  const existingNames = new Set((listBody.results ?? []).map((p) => p.name).filter(Boolean));

  const blockingMissing: string[] = [];
  const created: string[] = [];
  const failed: string[] = [];
  const alreadyExist: string[] = [];

  for (const spec of CONTACT_PROPERTY_SPECS) {
    if (existingNames.has(spec.name)) {
      alreadyExist.push(spec.name);
      continue;
    }

    const body: Record<string, unknown> = {
      name: spec.name,
      label: spec.label,
      type: spec.type,
      fieldType: spec.fieldType,
      groupName: 'contactinformation',
      hasUniqueValue: spec.hasUniqueValue ?? false,
    };
    if (spec.options) body.options = spec.options;

    const createRes = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (createRes.ok) {
      created.push(spec.name);
    } else {
      const errBody = (await createRes.json().catch(() => ({}))) as { message?: string };
      const msg = errBody.message ?? `HTTP ${createRes.status}`;
      if (createRes.status === 409 || (msg ?? '').toLowerCase().includes('already exists')) {
        alreadyExist.push(spec.name);
      } else {
        failed.push(`${spec.name}: ${msg}`);
        if (CONTACT_BLOCKING_NAMES.has(spec.name)) {
          blockingMissing.push(spec.name);
        }
      }
    }
  }

  return { blockingMissing, created, failed, alreadyExist };
}

// ── HubSpot Batch Create Contacts ─────────────────────────────────────────

interface HubspotBatchResponse {
  status?: string;
  results?: Array<{ id?: string; properties?: Record<string, unknown> }>;
  errors?: Array<{ message?: string }>;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function batchCreateContacts(
  token: string,
  inputs: Array<{ properties: Record<string, string> }>,
  retries = 2,
): Promise<{ results: HubspotBatchResponse['results']; errors: HubspotBatchResponse['errors'] }> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
      cache: 'no-store',
    });

    if (res.status === 429 && attempt < retries) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? 10);
      await sleep(retryAfter * 1000);
      continue;
    }

    const body = (await res.json().catch(() => ({}))) as HubspotBatchResponse;
    return { results: body.results ?? [], errors: body.errors ?? [] };
  }
  return { results: [], errors: [{ message: 'RATE_LIMIT_EXHAUSTED' }] };
}

// ── HubSpot Associations v4 ───────────────────────────────────────────────

interface AssociationInput {
  from: { id: string };
  to: { id: string };
  types: Array<{ associationCategory: string; associationTypeId: number }>;
}

async function batchAssociateContactsToCompanies(
  token: string,
  allInputs: AssociationInput[],
  retries = 2,
): Promise<{ succeeded: number; failed: AssociationFailure[] }> {
  if (allInputs.length === 0) return { succeeded: 0, failed: [] };

  const failedAssociations: AssociationFailure[] = [];
  let succeeded = 0;

  for (const chunk of chunkArray(allInputs, ASSOC_CHUNK_SIZE)) {
    let done = false;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const res = await fetch('https://api.hubapi.com/crm/v4/associations/contacts/companies/batch/create', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
          failedAssociations.push({ contactHsObjectId: input.from.id, companyHubspotId: input.to.id, error: msg });
        }
      }
      done = true;
      break;
    }

    if (!done) {
      for (const input of chunk) {
        failedAssociations.push({ contactHsObjectId: input.from.id, companyHubspotId: input.to.id, error: 'RATE_LIMIT_EXHAUSTED' });
      }
    }
  }

  return { succeeded, failed: failedAssociations };
}

// ── Supabase helpers ──────────────────────────────────────────────────────

async function readValidContacts(
  companyMappingByAccountId: Map<string, string>,
): Promise<{ valid: ContactCandidate[]; blocked: Array<{ id: string; reason: string }>; blockedNoAnchor: number }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('contacts').select('id, accountId, nome, cargo, area, status');
  if (error) throw new Error('READ_CONTACTS_FAILED');

  const valid: ContactCandidate[] = [];
  const blocked: Array<{ id: string; reason: string }> = [];
  let blockedNoAnchor = 0;

  for (const row of (data ?? []) as ContactDbRow[]) {
    const accountId = typeof row.accountId === 'string' && row.accountId.trim() ? row.accountId.trim() : null;

    if (!accountId) {
      blocked.push({ id: row.id, reason: 'accountId ausente — contact sem empresa âncora' });
      blockedNoAnchor += 1;
      continue;
    }

    const companyHubspotId = companyMappingByAccountId.get(accountId);
    if (!companyHubspotId) {
      blocked.push({ id: row.id, reason: `accountId ${accountId} não tem mapping ativo de Company operacional` });
      continue;
    }

    valid.push({
      canonicalId: row.id,
      canopiContactId: buildCanopiContactId(row.id),
      nome: typeof row.nome === 'string' && row.nome.trim() ? row.nome.trim() : null,
      cargo: typeof row.cargo === 'string' && row.cargo.trim() ? row.cargo.trim() : null,
      accountCanonicalId: accountId,
      companyHubspotId,
    });
  }

  return { valid, blocked, blockedNoAnchor };
}

async function persistContactMappings(
  entries: Array<{
    canonicalId: string;
    canopiContactId: string;
    hsObjectId: string;
    companyHubspotId: string;
    accountCanonicalId: string;
  }>,
  batchId: string,
  tenantId: string,
  contractVersion: string,
  executedAt: string,
): Promise<{ persisted: string[]; failed: Array<{ canonicalId: string; hsObjectId: string; error: string }> }> {
  if (entries.length === 0) return { persisted: [], failed: [] };

  const supabase = getSupabaseAdminClient();
  const rows = entries.map((e) => ({
    provider: 'hubspot',
    entity_type: 'contact',
    canonical_id: e.canonicalId,
    canopi_external_id: e.canopiContactId,
    hubspot_id: e.hsObjectId,
    status: 'active',
    metadata_json: {
      batchId,
      tenantId,
      contractVersion,
      createdAt: executedAt,
      source: 'canopi_clean_reload',
      associatedCompanyCanonicalId: e.accountCanonicalId,
      associatedCompanyHubspotId: e.companyHubspotId,
    },
  }));

  const { data, error } = await supabase.from('hubspot_identity_mappings').insert(rows).select('id, canonical_id');
  if (error) {
    return {
      persisted: [],
      failed: entries.map((e) => ({ canonicalId: e.canonicalId, hsObjectId: e.hsObjectId, error: error.message })),
    };
  }

  const persistedIds = new Set((data ?? []).map((r: { canonical_id: string }) => r.canonical_id));
  const persisted = entries.filter((e) => persistedIds.has(e.canonicalId)).map((e) => e.canonicalId);
  const failed = entries
    .filter((e) => !persistedIds.has(e.canonicalId))
    .map((e) => ({ canonicalId: e.canonicalId, hsObjectId: e.hsObjectId, error: 'Row not returned after insert' }));

  return { persisted, failed };
}

// ── Main export ───────────────────────────────────────────────────────────

export async function runHubspotCleanReloadContactCreate(
  options: HubspotCleanReloadContactCreateOptions,
): Promise<HubspotCleanReloadContactCreateResult | { status: 'error'; error: string; canProceedToDealCreate: false }> {
  const { batchId, tenantId, contractVersion = CLEAN_RELOAD_CONTACT_CREATE_CONTRACT_VERSION, resumeMode = false } = options;
  const executedAt = new Date().toISOString();

  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return { status: 'error', error: 'HUBSPOT_TOKEN_NOT_CONFIGURED', canProceedToDealCreate: false };
  }

  // ── Preflight ─────────────────────────────────────────────────────────

  // 1. Registry
  const registryValidation = validateHubspotPropertyRegistry();

  // 2. Ensure contact properties exist in HubSpot (blocking + metadata)
  const propSetup = await ensureContactProperties(token);

  // 3. Existing company mappings — need to resolve companyHubspotId per accountCanonicalId
  const companyMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'account', status: 'active' });
  const companyMappingByAccountId = new Map<string, string>();
  for (const m of companyMappings) {
    if (m.canonicalId && m.hubspotId) {
      companyMappingByAccountId.set(m.canonicalId, m.hubspotId);
    }
  }

  // 4. Existing contact mappings (idempotency guard)
  const existingContactMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'contact', status: 'active' });

  // 5. Read valid contacts from Supabase
  const { valid: validCandidates, blocked: blockedCandidates, blockedNoAnchor } = await readValidContacts(companyMappingByAccountId);

  const preflight: HubspotCleanReloadContactCreatePreflight = {
    registryValid: registryValidation.valid,
    contactBlockingPropertiesReady: propSetup.blockingMissing.length === 0,
    contactBlockingMissing: propSetup.blockingMissing,
    contactPropertiesCreated: propSetup.created,
    contactPropertiesFailed: propSetup.failed,
    contactPropertiesAlreadyExist: propSetup.alreadyExist,
    existingCompanyMappings: companyMappings.length,
    existingContactMappings: existingContactMappings.length,
    validContacts: validCandidates.length,
    blockedContacts: blockedCandidates.length,
    blockedNoAnchor,
    blockedReasons: blockedCandidates.map((b) => `${b.id}: ${b.reason}`),
  };

  // ── Blocker evaluation ────────────────────────────────────────────────

  const blockers: string[] = [];

  if (!registryValidation.valid) {
    blockers.push(`Registry inválida: ${registryValidation.missingBlocking.join('; ')}`);
  }
  if (propSetup.blockingMissing.length > 0) {
    blockers.push(
      `Propriedades bloqueadoras de Contact não existem no HubSpot e não puderam ser criadas: ${propSetup.blockingMissing.join(', ')}. Verifique permissões do token.`,
    );
  }
  if (propSetup.failed.length > 0 && propSetup.failed.some((f) => CONTACT_BLOCKING_NAMES.has(f.split(':')[0].trim()))) {
    blockers.push(`Falha ao criar propriedades bloqueadoras de Contact: ${propSetup.failed.join('; ')}`);
  }
  if (companyMappings.length === 0) {
    blockers.push('Nenhum mapping ativo de Company (entity_type=account) encontrado. Execute C2.9E.2D.12 antes de criar Contacts.');
  }
  if (existingContactMappings.length > 0 && !resumeMode) {
    blockers.push(
      `${existingContactMappings.length} mapping(s) ativo(s) de Contact já existem. Execute um recorte de limpeza antes, ou use resumeMode=true para criar somente os não mapeados.`,
    );
  }
  if (validCandidates.length === 0) {
    blockers.push('Nenhum Contact válido com Company mapping ativo para criar no HubSpot.');
  }

  const warnings: string[] = [];
  if (blockedCandidates.length > 0) {
    warnings.push(
      `${blockedCandidates.length} contacts bloqueados (${blockedNoAnchor} sem âncora): ${blockedCandidates.map((b) => b.id).slice(0, 5).join(', ')}${blockedCandidates.length > 5 ? '...' : ''}`,
    );
  }
  if (registryValidation.warnings.length > 0) {
    warnings.push(...registryValidation.warnings);
  }

  if (blockers.length > 0) {
    return buildErrorResult({ blockers, warnings, preflight, contractVersion, batchId, tenantId, executedAt });
  }

  // ── Resume mode — skip already-mapped contacts ─────────────────────────

  const alreadyMappedIds = resumeMode
    ? new Set(existingContactMappings.map((m) => m.canonicalId).filter(Boolean))
    : new Set<string>();
  const candidatesToCreate = resumeMode ? validCandidates.filter((c) => !alreadyMappedIds.has(c.canonicalId)) : validCandidates;

  if (resumeMode && candidatesToCreate.length === 0) {
    return {
      ...buildErrorResult({
        blockers: [],
        warnings: [...warnings, 'resumeMode: todos os contacts já estão mapeados.'],
        preflight,
        contractVersion,
        batchId,
        tenantId,
        executedAt,
      }),
      canProceedToDealCreate: true,
    };
  }

  // ── Create Contacts in chunks ─────────────────────────────────────────

  const createdContacts: ContactCreateEntry[] = [];
  const failedContacts: ContactCreateFailure[] = [];
  let mappingsPersisted = 0;
  let mappingsFailed = 0;

  // Map from hsObjectId → candidate (for association step)
  const createdByHsId = new Map<string, ContactCandidate>();

  for (const chunk of chunkArray(candidatesToCreate, CHUNK_SIZE)) {
    const inputs = chunk.map((c) => {
      const { firstname, lastname } = splitName(c.nome);
      return {
        properties: compactProps({
          firstname,
          lastname,
          jobtitle: c.cargo,
          canopi_canonical_id: c.canonicalId,
          canopi_contact_id: c.canopiContactId,
          canopi_tenant_id: tenantId,
          canopi_associated_company_id: c.accountCanonicalId,
          canopi_import_batch_id: batchId,
          canopi_contract_version: contractVersion,
          canopi_sync_status: 'pending',
          canopi_source: 'canopi_clean_reload',
          canopi_last_sync_at: executedAt,
        }),
      };
    });

    let chunkResults: HubspotBatchResponse['results'] = [];
    let chunkErrors: HubspotBatchResponse['errors'] = [];

    try {
      const response = await batchCreateContacts(token, inputs);
      chunkResults = response.results ?? [];
      chunkErrors = response.errors ?? [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'NETWORK_ERROR';
      for (const c of chunk) {
        failedContacts.push({ canonicalId: c.canonicalId, canopiContactId: c.canopiContactId, error: `Chunk create failed: ${msg}` });
      }
      continue;
    }

    // Match results by canopi_canonical_id (order not guaranteed)
    const resultByCanonicalId = new Map<string, string>();
    for (const r of chunkResults ?? []) {
      const cid = r.properties?.canopi_canonical_id;
      const hsId = r.id;
      if (typeof cid === 'string' && cid && typeof hsId === 'string' && hsId) {
        resultByCanonicalId.set(cid, hsId);
      }
    }

    const createdInChunk: ContactCandidate[] = [];
    for (const c of chunk) {
      const hsObjectId = resultByCanonicalId.get(c.canonicalId);
      if (hsObjectId) {
        createdInChunk.push(c);
        createdByHsId.set(hsObjectId, c);
      } else {
        const errMsg = (chunkErrors ?? []).find(() => true)?.message ?? 'CREATE_FAILED';
        failedContacts.push({ canonicalId: c.canonicalId, canopiContactId: c.canopiContactId, error: errMsg });
      }
    }

    // Persist mappings for this chunk
    if (createdInChunk.length > 0) {
      const toMap = createdInChunk.map((c) => ({
        canonicalId: c.canonicalId,
        canopiContactId: c.canopiContactId,
        hsObjectId: resultByCanonicalId.get(c.canonicalId) as string,
        companyHubspotId: c.companyHubspotId,
        accountCanonicalId: c.accountCanonicalId,
      }));

      const { persisted, failed: mappingFailed } = await persistContactMappings(toMap, batchId, tenantId, contractVersion, executedAt);
      const persistedSet = new Set(persisted);

      for (const c of createdInChunk) {
        const hsObjectId = resultByCanonicalId.get(c.canonicalId) as string;
        const wasPersisted = persistedSet.has(c.canonicalId);

        if (wasPersisted) {
          mappingsPersisted += 1;
          createdContacts.push({
            canonicalId: c.canonicalId,
            canopiContactId: c.canopiContactId,
            hsObjectId,
            companyHubspotId: c.companyHubspotId,
            associationCreated: false, // set after association step
            mappingStatus: 'persisted',
          });
        } else {
          mappingsFailed += 1;
          const failure = mappingFailed.find((f) => f.canonicalId === c.canonicalId);
          warnings.push(
            `Contact ${c.canonicalId} criado no HubSpot (hs_object_id: ${hsObjectId}) mas mapping falhou: ${failure?.error ?? 'UNKNOWN'}`,
          );
          createdContacts.push({
            canonicalId: c.canonicalId,
            canopiContactId: c.canopiContactId,
            hsObjectId,
            companyHubspotId: c.companyHubspotId,
            associationCreated: false,
            mappingStatus: 'failed',
          });
        }
      }
    }
  }

  // ── Associate Contacts → Companies (separate step, v4 API) ────────────

  const associationInputs: AssociationInput[] = createdContacts.map((entry) => ({
    from: { id: entry.hsObjectId },
    to: { id: entry.companyHubspotId },
    types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 1 }],
  }));

  const { succeeded: assocSucceeded, failed: assocFailed } = await batchAssociateContactsToCompanies(token, associationInputs);

  // Mark association status on createdContacts
  const assocFailedSet = new Set(assocFailed.map((f) => f.contactHsObjectId));
  for (const entry of createdContacts) {
    entry.associationCreated = !assocFailedSet.has(entry.hsObjectId);
  }

  if (assocFailed.length > 0) {
    warnings.push(
      `${assocFailed.length} associação(ões) Contact → Company falharam. Contacts criados mas sem vínculo no HubSpot.`,
    );
  }

  // ── Final blockers ────────────────────────────────────────────────────

  const createdWithoutMapping = createdContacts.filter((c) => c.mappingStatus === 'failed').length;
  const finalBlockers: string[] = [];

  if (failedContacts.length > 0) {
    finalBlockers.push(
      `${failedContacts.length} Contact(s) não foram criados no HubSpot. Verifique failedContacts antes de avançar para Deals.`,
    );
  }
  if (createdWithoutMapping > 0) {
    finalBlockers.push(
      `${createdWithoutMapping} Contact(s) criados no HubSpot sem mapping persistido. Não avance para Deals até resolver.`,
    );
  }
  if (assocFailed.length > 0) {
    finalBlockers.push(
      `${assocFailed.length} associação(ões) Contact → Company falharam. Verifique associationFailures antes de avançar.`,
    );
  }

  return {
    status: 'success',
    mode: 'create_contacts',
    provider: 'hubspot',
    contractVersion,
    batchId,
    tenantId,
    executedAt,
    preflight,
    results: {
      attempted: candidatesToCreate.length,
      created: createdContacts.length,
      failed: failedContacts.length,
      associationsAttempted: associationInputs.length,
      associationsCreated: assocSucceeded,
      associationsFailed: assocFailed.length,
      mappingsPersisted,
      mappingsFailed,
      createdWithoutMapping,
    },
    createdContacts,
    failedContacts,
    associationFailures: assocFailed,
    blockers: finalBlockers,
    warnings,
    canProceedToDealCreate: finalBlockers.length === 0 && createdContacts.length > 0,
    guardrails: [
      'Nenhuma Company criada.',
      'Nenhum Deal criado.',
      'Nenhum Product criado.',
      'Nenhum Service criado.',
      'Nenhum reset ou delete executado.',
      'Nenhum hs_object_id histórico reutilizado.',
      'Contacts associados somente às 247 Companies operacionais novas via mapping ativo.',
      'Nenhuma escrita em accounts ou contacts no Supabase.',
      'Mapping só persiste para Contacts criados com sucesso neste recorte.',
      'Token não exposto na resposta.',
    ],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function chunkArray<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function compactProps(obj: Record<string, string | null | undefined>): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    if (typeof v === 'string' && v.trim()) acc[k] = v.trim();
    return acc;
  }, {});
}

function buildErrorResult(opts: {
  blockers: string[];
  warnings: string[];
  preflight: HubspotCleanReloadContactCreatePreflight;
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
}): HubspotCleanReloadContactCreateResult {
  return {
    status: 'success',
    mode: 'create_contacts',
    provider: 'hubspot',
    contractVersion: opts.contractVersion,
    batchId: opts.batchId,
    tenantId: opts.tenantId,
    executedAt: opts.executedAt,
    preflight: opts.preflight,
    results: {
      attempted: 0,
      created: 0,
      failed: 0,
      associationsAttempted: 0,
      associationsCreated: 0,
      associationsFailed: 0,
      mappingsPersisted: 0,
      mappingsFailed: 0,
      createdWithoutMapping: 0,
    },
    createdContacts: [],
    failedContacts: [],
    associationFailures: [],
    blockers: opts.blockers,
    warnings: opts.warnings,
    canProceedToDealCreate: false,
    guardrails: [
      'Nenhum Contact criado — bloqueadores impediram execução.',
      'Nenhuma Company criada.',
      'Nenhuma escrita em accounts ou contacts no Supabase.',
      'Token não exposto na resposta.',
    ],
  };
}
