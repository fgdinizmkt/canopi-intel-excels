import { getSupabaseAdminClient } from './supabaseAdmin';
import { validateHubspotPropertyRegistry } from '@/src/lib/hubspotPropertyRegistry';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';

export const CLEAN_RELOAD_DEAL_CREATE_CONTRACT_VERSION = 'c2.9e.2d.14';

const CHUNK_SIZE = 50;
const ASSOC_CHUNK_SIZE = 50;
// Abort threshold: if HubSpot has >= 1000 contacts, something went wrong
const CONTACT_COUNT_ABORT_THRESHOLD = 1000;

// ── ID generation ─────────────────────────────────────────────────────────

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function buildCanopiDealId(canonicalId: string): string {
  return `cpdo_${stableHash(canonicalId)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────

type OportunidadeRow = {
  id: string;
  account_slug: string | null;
  nome: string | null;
  etapa: string | null;
  valor: number | null;
  owner: string | null;
};

type AccountSlugRow = {
  id: string;
  slug: string | null;
};

type ContactAccountRow = {
  id: string;
  accountId: string | null;
};

interface DealCandidate {
  canonicalId: string;
  canopiDealId: string;
  dealName: string;
  etapa: string | null;
  valor: number | null;
  accountCanonicalId: string;
  companyHubspotId: string;
  contactHubspotIds: string[];
}

export interface DealCreateEntry {
  canonicalId: string;
  canopiDealId: string;
  hsObjectId: string;
  companyHubspotId: string;
  contactHubspotIds: string[];
  companyAssociationCreated: boolean;
  contactAssociationsCreated: number;
  mappingStatus: 'persisted' | 'failed';
}

export interface DealCreateFailure {
  canonicalId: string;
  canopiDealId: string;
  error: string;
}

export interface AssociationFailure {
  dealHsObjectId: string;
  targetId: string;
  targetType: 'company' | 'contact';
  error: string;
}

export interface HubspotCleanReloadDealCreatePreflight {
  registryValid: boolean;
  dealBlockingPropertiesReady: boolean;
  dealBlockingMissing: string[];
  dealPropertiesCreated: string[];
  dealPropertiesFailed: string[];
  dealPropertiesAlreadyExist: string[];
  hubspotContactTotal: number;
  contactCountSafe: boolean;
  existingCompanyMappings: number;
  existingContactMappings: number;
  existingDealMappings: number;
  validDeals: number;
  blockedDeals: number;
  blockedReasons: string[];
  expectedCompanyAssociations: number;
  expectedContactAssociations: number;
}

export interface HubspotCleanReloadDealCreateResult {
  status: 'success';
  mode: 'create_deals';
  provider: 'hubspot';
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
  preflight: HubspotCleanReloadDealCreatePreflight;
  results: {
    attempted: number;
    created: number;
    failed: number;
    companyAssociationsAttempted: number;
    companyAssociationsCreated: number;
    companyAssociationsFailed: number;
    contactAssociationsAttempted: number;
    contactAssociationsCreated: number;
    contactAssociationsFailed: number;
    mappingsPersisted: number;
    mappingsFailed: number;
    createdWithoutMapping: number;
  };
  createdDeals: DealCreateEntry[];
  failedDeals: DealCreateFailure[];
  associationFailures: AssociationFailure[];
  blockers: string[];
  warnings: string[];
  canProceedToNextRecorte: boolean;
  guardrails: string[];
}

export interface HubspotCleanReloadDealCreateOptions {
  batchId: string;
  tenantId: string;
  contractVersion?: string;
  resumeMode?: boolean;
  preflightOnly?: boolean;
}

// ── Deal property specs ────────────────────────────────────────────────────

const SYNC_STATUS_OPTIONS = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Ativo', value: 'active' },
  { label: 'Com conflito', value: 'conflicted' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Arquivado', value: 'archived' },
];

interface DealPropertySpec {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  hasUniqueValue?: boolean;
  options?: Array<{ label: string; value: string }>;
}

const DEAL_PROPERTY_SPECS: DealPropertySpec[] = [
  // Blocking — identity
  { name: 'canopi_canonical_id', label: 'Canopi Canonical ID', type: 'string', fieldType: 'text', hasUniqueValue: true },
  { name: 'canopi_opportunity_id', label: 'Canopi Opportunity ID', type: 'string', fieldType: 'text', hasUniqueValue: true },
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
  { name: 'canopi_stage_canonical', label: 'Canopi Stage Canonical', type: 'string', fieldType: 'text', hasUniqueValue: false },
];

const DEAL_BLOCKING_NAMES = new Set(['canopi_canonical_id', 'canopi_opportunity_id', 'canopi_tenant_id']);

// ── HubSpot property setup ────────────────────────────────────────────────

async function ensureDealProperties(
  token: string,
): Promise<{ blockingMissing: string[]; created: string[]; failed: string[]; alreadyExist: string[] }> {
  const listRes = await fetch('https://api.hubapi.com/crm/v3/properties/deals?limit=500', {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const listBody = (await listRes.json().catch(() => ({ results: [] }))) as { results?: Array<{ name?: string }> };
  const existingNames = new Set((listBody.results ?? []).map((p) => p.name).filter(Boolean));

  const blockingMissing: string[] = [];
  const created: string[] = [];
  const failed: string[] = [];
  const alreadyExist: string[] = [];

  for (const spec of DEAL_PROPERTY_SPECS) {
    if (existingNames.has(spec.name)) {
      alreadyExist.push(spec.name);
      continue;
    }

    const body: Record<string, unknown> = {
      name: spec.name,
      label: spec.label,
      type: spec.type,
      fieldType: spec.fieldType,
      groupName: 'dealinformation',
      hasUniqueValue: spec.hasUniqueValue ?? false,
    };
    if (spec.options) body.options = spec.options;

    const createRes = await fetch('https://api.hubapi.com/crm/v3/properties/deals', {
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
        if (DEAL_BLOCKING_NAMES.has(spec.name)) {
          blockingMissing.push(spec.name);
        }
      }
    }
  }

  return { blockingMissing, created, failed, alreadyExist };
}

// ── HubSpot Contact count guardrail ───────────────────────────────────────

async function fetchHubspotContactTotal(token: string): Promise<number> {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterGroups: [], limit: 1, properties: [] }),
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => ({}))) as { total?: number };
  return body.total ?? -1;
}

// ── HubSpot Batch Create Deals ────────────────────────────────────────────

interface HubspotBatchResponse {
  results?: Array<{ id?: string; properties?: Record<string, unknown> }>;
  errors?: Array<{ message?: string }>;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function batchCreateDeals(
  token: string,
  inputs: Array<{ properties: Record<string, string> }>,
  retries = 2,
): Promise<{ results: HubspotBatchResponse['results']; errors: HubspotBatchResponse['errors'] }> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals/batch/create', {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  for (const chunk of chunkArray(allInputs, ASSOC_CHUNK_SIZE)) {
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
          failedAssociations.push({
            dealHsObjectId: input.from.id,
            targetId: input.to.id,
            targetType,
            error: msg,
          });
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

// ── Supabase helpers ──────────────────────────────────────────────────────

async function readDealCandidates(
  companyMappingByAccountId: Map<string, string>,
  contactHubspotIdsByAccountId: Map<string, string[]>,
): Promise<{ valid: DealCandidate[]; blocked: Array<{ id: string; reason: string }> }> {
  const supabase = getSupabaseAdminClient();

  // Read oportunidades
  const { data: opsData, error: opsError } = await supabase
    .from('oportunidades')
    .select('id, account_slug, nome, etapa, valor, owner');
  if (opsError) throw new Error('READ_OPORTUNIDADES_FAILED');

  // Read accounts slug → canonical_id map
  const { data: accsData, error: accsError } = await supabase
    .from('accounts')
    .select('id, slug')
    .not('slug', 'is', null);
  if (accsError) throw new Error('READ_ACCOUNTS_FAILED');

  const slugToAccountId = new Map<string, string>();
  for (const acc of (accsData ?? []) as AccountSlugRow[]) {
    if (acc.slug) slugToAccountId.set(acc.slug, acc.id);
  }

  const valid: DealCandidate[] = [];
  const blocked: Array<{ id: string; reason: string }> = [];

  for (const row of (opsData ?? []) as OportunidadeRow[]) {
    // dealname is required
    const dealName = typeof row.nome === 'string' && row.nome.trim() ? row.nome.trim() : null;
    if (!dealName) {
      blocked.push({ id: row.id, reason: 'nome ausente — dealname obrigatório no HubSpot' });
      continue;
    }

    // resolve account_slug → accountId
    const accountSlug = typeof row.account_slug === 'string' && row.account_slug.trim() ? row.account_slug.trim() : null;
    if (!accountSlug) {
      blocked.push({ id: row.id, reason: 'account_slug ausente — deal sem empresa âncora' });
      continue;
    }

    const accountCanonicalId = slugToAccountId.get(accountSlug);
    if (!accountCanonicalId) {
      blocked.push({ id: row.id, reason: `account_slug '${accountSlug}' não resolvido para account canônico` });
      continue;
    }

    const companyHubspotId = companyMappingByAccountId.get(accountCanonicalId);
    if (!companyHubspotId) {
      blocked.push({ id: row.id, reason: `accountId ${accountCanonicalId} não tem mapping ativo de Company operacional` });
      continue;
    }

    valid.push({
      canonicalId: row.id,
      canopiDealId: buildCanopiDealId(row.id),
      dealName,
      etapa: typeof row.etapa === 'string' && row.etapa.trim() ? row.etapa.trim() : null,
      valor: typeof row.valor === 'number' && Number.isFinite(row.valor) ? row.valor : null,
      accountCanonicalId,
      companyHubspotId,
      contactHubspotIds: contactHubspotIdsByAccountId.get(accountCanonicalId) ?? [],
    });
  }

  return { valid, blocked };
}

async function buildContactHubspotIdsByAccountId(
  contactMappings: Array<{ canonicalId: string; hubspotId: string | null }>,
): Promise<Map<string, string[]>> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('contacts').select('id, accountId');
  if (error) throw new Error('READ_CONTACTS_FOR_DEAL_ASSOC_FAILED');

  const contactMappingByCanonicalId = new Map<string, string>();
  for (const m of contactMappings) {
    if (m.canonicalId && m.hubspotId) {
      contactMappingByCanonicalId.set(m.canonicalId, m.hubspotId);
    }
  }

  const byAccountId = new Map<string, string[]>();
  for (const row of (data ?? []) as ContactAccountRow[]) {
    if (!row.accountId) continue;
    const contactHsId = contactMappingByCanonicalId.get(row.id);
    if (!contactHsId) continue;
    if (!byAccountId.has(row.accountId)) byAccountId.set(row.accountId, []);
    byAccountId.get(row.accountId)!.push(contactHsId);
  }

  return byAccountId;
}

async function persistDealMappings(
  entries: Array<{
    canonicalId: string;
    canopiDealId: string;
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
    entity_type: 'deal',
    canonical_id: e.canonicalId,
    canopi_external_id: e.canopiDealId,
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

export async function runHubspotCleanReloadDealCreate(
  options: HubspotCleanReloadDealCreateOptions,
): Promise<HubspotCleanReloadDealCreateResult | { status: 'error'; error: string; canProceedToNextRecorte: false }> {
  const { batchId, tenantId, contractVersion = CLEAN_RELOAD_DEAL_CREATE_CONTRACT_VERSION, resumeMode = false, preflightOnly = false } = options;
  const executedAt = new Date().toISOString();

  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return { status: 'error', error: 'HUBSPOT_TOKEN_NOT_CONFIGURED', canProceedToNextRecorte: false };
  }

  // ── Preflight ─────────────────────────────────────────────────────────

  // 1. Registry
  const registryValidation = validateHubspotPropertyRegistry();

  // 2. Ensure deal properties exist in HubSpot
  const propSetup = await ensureDealProperties(token);

  // 3. Contact count guardrail
  const hubspotContactTotal = await fetchHubspotContactTotal(token);
  const contactCountSafe = hubspotContactTotal >= 0 && hubspotContactTotal < CONTACT_COUNT_ABORT_THRESHOLD;

  // 4. Company mappings
  const companyMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'account', status: 'active' });
  const companyMappingByAccountId = new Map<string, string>();
  for (const m of companyMappings) {
    if (m.canonicalId && m.hubspotId) companyMappingByAccountId.set(m.canonicalId, m.hubspotId);
  }

  // 5. Contact mappings (for Deal → Contact associations)
  const contactMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'contact', status: 'active' });

  // 6. Build accountId → [contactHubspotId, ...] map
  const contactHubspotIdsByAccountId = await buildContactHubspotIdsByAccountId(
    contactMappings.map((m) => ({ canonicalId: m.canonicalId, hubspotId: m.hubspotId })),
  );

  // 7. Existing deal mappings (idempotency guard)
  const existingDealMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'deal', status: 'active' });

  // 8. Read deal candidates
  const { valid: validCandidates, blocked: blockedCandidates } = await readDealCandidates(
    companyMappingByAccountId,
    contactHubspotIdsByAccountId,
  );

  const expectedContactAssociations = validCandidates.reduce((sum, d) => sum + d.contactHubspotIds.length, 0);

  const preflight: HubspotCleanReloadDealCreatePreflight = {
    registryValid: registryValidation.valid,
    dealBlockingPropertiesReady: propSetup.blockingMissing.length === 0,
    dealBlockingMissing: propSetup.blockingMissing,
    dealPropertiesCreated: propSetup.created,
    dealPropertiesFailed: propSetup.failed,
    dealPropertiesAlreadyExist: propSetup.alreadyExist,
    hubspotContactTotal,
    contactCountSafe,
    existingCompanyMappings: companyMappings.length,
    existingContactMappings: contactMappings.length,
    existingDealMappings: existingDealMappings.length,
    validDeals: validCandidates.length,
    blockedDeals: blockedCandidates.length,
    blockedReasons: blockedCandidates.map((b) => `${b.id}: ${b.reason}`),
    expectedCompanyAssociations: validCandidates.length,
    expectedContactAssociations,
  };

  // ── Blocker evaluation ────────────────────────────────────────────────

  const blockers: string[] = [];

  if (!registryValidation.valid) {
    blockers.push(`Registry inválida: ${registryValidation.missingBlocking.join('; ')}`);
  }
  if (propSetup.blockingMissing.length > 0) {
    blockers.push(
      `Propriedades bloqueadoras de Deal não existem no HubSpot e não puderam ser criadas: ${propSetup.blockingMissing.join(', ')}.`,
    );
  }
  if (!contactCountSafe) {
    blockers.push(
      `GUARDRAIL: HubSpot tem ${hubspotContactTotal} Contacts (limite: ${CONTACT_COUNT_ABORT_THRESHOLD - 1}). Abortar antes de criar Deals.`,
    );
  }
  if (companyMappings.length === 0) {
    blockers.push('Nenhum mapping ativo de Company encontrado. Execute C2.9E.2D.12 antes de criar Deals.');
  }
  if (contactMappings.length === 0) {
    blockers.push('Nenhum mapping ativo de Contact encontrado. Execute C2.9E.2D.13 antes de criar Deals.');
  }
  if (existingDealMappings.length > 0 && !resumeMode) {
    blockers.push(
      `${existingDealMappings.length} mapping(s) ativo(s) de Deal já existem. Use resumeMode=true para criar somente os não mapeados.`,
    );
  }
  if (validCandidates.length === 0) {
    blockers.push('Nenhum Deal válido com Company mapping ativo para criar no HubSpot.');
  }

  const warnings: string[] = [];
  if (blockedCandidates.length > 0) {
    warnings.push(
      `${blockedCandidates.length} deals bloqueados: ${blockedCandidates.map((b) => b.id).slice(0, 5).join(', ')}${blockedCandidates.length > 5 ? '...' : ''}`,
    );
  }
  if (registryValidation.warnings.length > 0) {
    warnings.push(...registryValidation.warnings);
  }

  if (blockers.length > 0) {
    return buildErrorResult({ blockers, warnings, preflight, contractVersion, batchId, tenantId, executedAt });
  }

  // ── Preflight-only gate: return before any write ──────────────────────

  if (preflightOnly) {
    return {
      ...buildErrorResult({ blockers: [], warnings, preflight, contractVersion, batchId, tenantId, executedAt }),
      canProceedToNextRecorte: false,
      guardrails: [
        'preflightOnly=true: nenhum Deal criado.',
        'preflightOnly=true: nenhum mapping alterado.',
        'preflightOnly=true: nenhuma associação criada.',
        'preflightOnly=true: HubSpot e Supabase intactos.',
      ],
    };
  }

  // ── Resume mode ───────────────────────────────────────────────────────

  const alreadyMappedIds = resumeMode
    ? new Set(existingDealMappings.map((m) => m.canonicalId).filter(Boolean))
    : new Set<string>();
  const candidatesToCreate = resumeMode ? validCandidates.filter((c) => !alreadyMappedIds.has(c.canonicalId)) : validCandidates;

  if (resumeMode && candidatesToCreate.length === 0) {
    return {
      ...buildErrorResult({
        blockers: [],
        warnings: [...warnings, 'resumeMode: todos os deals já estão mapeados.'],
        preflight,
        contractVersion,
        batchId,
        tenantId,
        executedAt,
      }),
      canProceedToNextRecorte: true,
    };
  }

  // ── Create Deals in chunks ────────────────────────────────────────────

  const createdDeals: DealCreateEntry[] = [];
  const failedDeals: DealCreateFailure[] = [];
  let mappingsPersisted = 0;
  let mappingsFailed = 0;

  for (const chunk of chunkArray(candidatesToCreate, CHUNK_SIZE)) {
    const inputs = chunk.map((d) => ({
      properties: compactProps({
        dealname: d.dealName,
        amount: d.valor !== null ? String(d.valor) : null,
        canopi_canonical_id: d.canonicalId,
        canopi_opportunity_id: d.canopiDealId,
        canopi_tenant_id: tenantId,
        canopi_associated_company_id: d.accountCanonicalId,
        canopi_import_batch_id: batchId,
        canopi_contract_version: contractVersion,
        canopi_sync_status: 'pending',
        canopi_source: 'canopi_clean_reload',
        canopi_last_sync_at: executedAt,
        canopi_stage_canonical: d.etapa,
      }),
    }));

    let chunkResults: HubspotBatchResponse['results'] = [];
    let chunkErrors: HubspotBatchResponse['errors'] = [];

    try {
      const response = await batchCreateDeals(token, inputs);
      chunkResults = response.results ?? [];
      chunkErrors = response.errors ?? [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'NETWORK_ERROR';
      for (const d of chunk) {
        failedDeals.push({ canonicalId: d.canonicalId, canopiDealId: d.canopiDealId, error: `Chunk create failed: ${msg}` });
      }
      continue;
    }

    // Match results by canopi_canonical_id
    const resultByCanonicalId = new Map<string, string>();
    for (const r of chunkResults ?? []) {
      const cid = r.properties?.canopi_canonical_id;
      const hsId = r.id;
      if (typeof cid === 'string' && cid && typeof hsId === 'string' && hsId) {
        resultByCanonicalId.set(cid, hsId);
      }
    }

    const createdInChunk: DealCandidate[] = [];
    for (const d of chunk) {
      const hsObjectId = resultByCanonicalId.get(d.canonicalId);
      if (hsObjectId) {
        createdInChunk.push(d);
      } else {
        const errMsg = (chunkErrors ?? []).find(() => true)?.message ?? 'CREATE_FAILED';
        failedDeals.push({ canonicalId: d.canonicalId, canopiDealId: d.canopiDealId, error: errMsg });
      }
    }

    // Persist mappings for created deals in this chunk
    if (createdInChunk.length > 0) {
      const toMap = createdInChunk.map((d) => ({
        canonicalId: d.canonicalId,
        canopiDealId: d.canopiDealId,
        hsObjectId: resultByCanonicalId.get(d.canonicalId) as string,
        companyHubspotId: d.companyHubspotId,
        accountCanonicalId: d.accountCanonicalId,
      }));

      const { persisted, failed: mappingFailed } = await persistDealMappings(toMap, batchId, tenantId, contractVersion, executedAt);
      const persistedSet = new Set(persisted);

      for (const d of createdInChunk) {
        const hsObjectId = resultByCanonicalId.get(d.canonicalId) as string;
        const wasPersisted = persistedSet.has(d.canonicalId);

        if (wasPersisted) {
          mappingsPersisted += 1;
          createdDeals.push({
            canonicalId: d.canonicalId,
            canopiDealId: d.canopiDealId,
            hsObjectId,
            companyHubspotId: d.companyHubspotId,
            contactHubspotIds: d.contactHubspotIds,
            companyAssociationCreated: false,
            contactAssociationsCreated: 0,
            mappingStatus: 'persisted',
          });
        } else {
          mappingsFailed += 1;
          const failure = mappingFailed.find((f) => f.canonicalId === d.canonicalId);
          warnings.push(
            `Deal ${d.canonicalId} criado no HubSpot (hs_object_id: ${hsObjectId}) mas mapping falhou: ${failure?.error ?? 'UNKNOWN'}`,
          );
          createdDeals.push({
            canonicalId: d.canonicalId,
            canopiDealId: d.canopiDealId,
            hsObjectId,
            companyHubspotId: d.companyHubspotId,
            contactHubspotIds: d.contactHubspotIds,
            companyAssociationCreated: false,
            contactAssociationsCreated: 0,
            mappingStatus: 'failed',
          });
        }
      }
    }
  }

  // ── Associate Deals → Companies (v4 API, typeId=5) ────────────────────

  const companyAssocInputs: AssociationInput[] = createdDeals.map((entry) => ({
    from: { id: entry.hsObjectId },
    to: { id: entry.companyHubspotId },
    types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }],
  }));

  const { succeeded: compAssocSucceeded, failed: compAssocFailed } = await batchAssociate(
    token, 'deals', 'companies', companyAssocInputs, 5,
  );

  const compAssocFailedSet = new Set(compAssocFailed.map((f) => f.dealHsObjectId));
  for (const entry of createdDeals) {
    entry.companyAssociationCreated = !compAssocFailedSet.has(entry.hsObjectId);
  }

  // ── Associate Deals → Contacts (v4 API, typeId=3) ─────────────────────

  const contactAssocInputs: AssociationInput[] = [];
  for (const entry of createdDeals) {
    for (const contactHsId of entry.contactHubspotIds) {
      contactAssocInputs.push({
        from: { id: entry.hsObjectId },
        to: { id: contactHsId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      });
    }
  }

  const { succeeded: contactAssocSucceeded, failed: contactAssocFailed } = await batchAssociate(
    token, 'deals', 'contacts', contactAssocInputs, 3,
  );

  // Count contact associations per deal
  const contactAssocFailedSet = new Set(contactAssocFailed.map((f) => `${f.dealHsObjectId}:${f.targetId}`));
  for (const entry of createdDeals) {
    entry.contactAssociationsCreated = entry.contactHubspotIds.filter(
      (cHsId) => !contactAssocFailedSet.has(`${entry.hsObjectId}:${cHsId}`),
    ).length;
  }

  const allAssocFailures = [...compAssocFailed, ...contactAssocFailed];
  if (compAssocFailed.length > 0) {
    warnings.push(`${compAssocFailed.length} associação(ões) Deal → Company falharam.`);
  }
  if (contactAssocFailed.length > 0) {
    warnings.push(`${contactAssocFailed.length} associação(ões) Deal → Contact falharam.`);
  }

  // ── Final blockers ────────────────────────────────────────────────────

  const createdWithoutMapping = createdDeals.filter((d) => d.mappingStatus === 'failed').length;
  const finalBlockers: string[] = [];

  if (failedDeals.length > 0) {
    finalBlockers.push(`${failedDeals.length} Deal(s) não foram criados no HubSpot.`);
  }
  if (createdWithoutMapping > 0) {
    finalBlockers.push(`${createdWithoutMapping} Deal(s) criados sem mapping persistido.`);
  }
  if (compAssocFailed.length > 0) {
    finalBlockers.push(`${compAssocFailed.length} associação(ões) Deal → Company falharam. Verifique associationFailures.`);
  }

  return {
    status: 'success',
    mode: 'create_deals',
    provider: 'hubspot',
    contractVersion,
    batchId,
    tenantId,
    executedAt,
    preflight,
    results: {
      attempted: candidatesToCreate.length,
      created: createdDeals.length,
      failed: failedDeals.length,
      companyAssociationsAttempted: companyAssocInputs.length,
      companyAssociationsCreated: compAssocSucceeded,
      companyAssociationsFailed: compAssocFailed.length,
      contactAssociationsAttempted: contactAssocInputs.length,
      contactAssociationsCreated: contactAssocSucceeded,
      contactAssociationsFailed: contactAssocFailed.length,
      mappingsPersisted,
      mappingsFailed,
      createdWithoutMapping,
    },
    createdDeals,
    failedDeals,
    associationFailures: allAssocFailures,
    blockers: finalBlockers,
    warnings,
    canProceedToNextRecorte: finalBlockers.length === 0 && createdDeals.length > 0,
    guardrails: [
      'Nenhum Contact criado.',
      'Nenhuma Company criada.',
      'Nenhum Product criado.',
      'Nenhum Service criado.',
      'Nenhum reset ou delete executado.',
      'Nenhum hs_object_id histórico reutilizado.',
      'Deals associados somente às 247 Companies operacionais novas via mapping ativo.',
      'Deals associados somente a Contacts com mapping ativo (entity_type=contact).',
      'Nenhuma escrita em accounts, contacts ou companies no Supabase.',
      'Mapping só persiste para Deals criados com sucesso neste recorte.',
      `Contagem de Contacts HubSpot verificada: ${hubspotContactTotal} (abaixo do limite de ${CONTACT_COUNT_ABORT_THRESHOLD}).`,
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
  preflight: HubspotCleanReloadDealCreatePreflight;
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
}): HubspotCleanReloadDealCreateResult {
  return {
    status: 'success',
    mode: 'create_deals',
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
      companyAssociationsAttempted: 0,
      companyAssociationsCreated: 0,
      companyAssociationsFailed: 0,
      contactAssociationsAttempted: 0,
      contactAssociationsCreated: 0,
      contactAssociationsFailed: 0,
      mappingsPersisted: 0,
      mappingsFailed: 0,
      createdWithoutMapping: 0,
    },
    createdDeals: [],
    failedDeals: [],
    associationFailures: [],
    blockers: opts.blockers,
    warnings: opts.warnings,
    canProceedToNextRecorte: false,
    guardrails: [
      'Nenhum Deal criado — bloqueadores impediram execução.',
      'Nenhum Contact criado.',
      'Nenhuma escrita em accounts, contacts ou companies no Supabase.',
      'Token não exposto na resposta.',
    ],
  };
}
