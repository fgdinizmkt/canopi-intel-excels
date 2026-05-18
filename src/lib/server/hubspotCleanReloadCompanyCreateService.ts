import { getSupabaseAdminClient } from './supabaseAdmin';
import { validateHubspotPropertyRegistry } from '@/src/lib/hubspotPropertyRegistry';
import { runHubspotCleanReloadSetup } from './hubspotCleanReloadSetupService';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';

export const CLEAN_RELOAD_COMPANY_CREATE_CONTRACT_VERSION = 'c2.9e.2d.12';

const CHUNK_SIZE = 50;

// ── ID generation (mirrors hubspotWritebackNormalizer.createCompanyId) ────

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function buildCanopiCompanyId(nome: string, dominio: string | null): string {
  const base = `${normalizeSlug(nome)}|${normalizeSlug(dominio ?? '')}|`;
  return `cpco_${stableHash(base)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────

type AccountRow = {
  id: string;
  nome: string | null;
  dominio: string | null;
};

interface CompanyCandidate {
  canonicalId: string;
  nome: string;
  dominio: string | null;
  canopiCompanyId: string;
}

export interface CompanyCreateEntry {
  canonicalId: string;
  canopiCompanyId: string;
  hsObjectId: string;
  mappingId: string | null;
  mappingStatus: 'persisted' | 'failed';
}

export interface CompanyCreateFailure {
  canonicalId: string;
  canopiCompanyId: string;
  error: string;
}

export interface HubspotCleanReloadCompanyCreatePreflight {
  registryValid: boolean;
  setupReady: boolean;
  setupMissingProperties: string[];
  setupIncompatibleProperties: string[];
  metadataPropertiesCreated: string[];
  metadataPropertiesFailed: string[];
  metadataPropertiesAlreadyExist: string[];
  existingCompanyMappings: number;
  hubspotCanopiCompanyIdConflicts: number;
  conflictingCanopiCompanyIds: string[];
  validCompanies: number;
  blockedCompanies: number;
  blockedReasons: string[];
}

export interface HubspotCleanReloadCompanyCreateResult {
  status: 'success';
  mode: 'create_companies';
  provider: 'hubspot';
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
  preflight: HubspotCleanReloadCompanyCreatePreflight;
  results: {
    attempted: number;
    created: number;
    failed: number;
    mappingsPersisted: number;
    mappingsFailed: number;
    createdWithoutMapping: number;
  };
  createdCompanies: CompanyCreateEntry[];
  failedCompanies: CompanyCreateFailure[];
  blockers: string[];
  warnings: string[];
  canProceedToContactCreate: boolean;
  guardrails: string[];
}

export interface HubspotCleanReloadCompanyCreateOptions {
  batchId: string;
  tenantId: string;
  contractVersion?: string;
  resumeMode?: boolean;
}

// ── Required metadata properties for Company create ───────────────────────

interface MetadataPropertySpec {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  options?: Array<{ label: string; value: string }>;
}

const COMPANY_METADATA_PROPERTIES: MetadataPropertySpec[] = [
  { name: 'canopi_import_batch_id', label: 'Canopi Import Batch ID', type: 'string', fieldType: 'text' },
  { name: 'canopi_contract_version', label: 'Canopi Contract Version', type: 'string', fieldType: 'text' },
  {
    name: 'canopi_sync_status',
    label: 'Canopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    options: [
      { label: 'Pendente', value: 'pending' },
      { label: 'Ativo', value: 'active' },
      { label: 'Com conflito', value: 'conflicted' },
      { label: 'Bloqueado', value: 'blocked' },
      { label: 'Arquivado', value: 'archived' },
    ],
  },
  { name: 'canopi_last_sync_at', label: 'Canopi Last Sync At', type: 'string', fieldType: 'text' },
  { name: 'canopi_source', label: 'Canopi Source', type: 'string', fieldType: 'text' },
];

async function fetchExistingCanopiCompanyIds(token: string): Promise<Set<string>> {
  // Only fetch companies WITHOUT canopi_canonical_id — these are historical (pre-clean-reload)
  // companies whose canopi_company_id may conflict with new creates.
  const existing = new Set<string>();
  let after: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filterGroups: [
        {
          filters: [
            { propertyName: 'canopi_company_id', operator: 'HAS_PROPERTY' },
            { propertyName: 'canopi_canonical_id', operator: 'NOT_HAS_PROPERTY' },
          ],
        },
      ],
      properties: ['canopi_company_id'],
      limit: 100,
    };
    if (after) body.after = after;

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = (await res.json().catch(() => ({ results: [] }))) as {
      results?: Array<{ properties?: Record<string, unknown> }>;
      paging?: { next?: { after?: string } };
    };

    for (const r of data.results ?? []) {
      const cid = r.properties?.canopi_company_id;
      if (typeof cid === 'string' && cid) existing.add(cid);
    }

    after = data.paging?.next?.after;
  } while (after);

  return existing;
}

async function ensureCompanyMetadataProperties(
  token: string,
): Promise<{ created: string[]; failed: string[]; alreadyExist: string[] }> {
  // Fetch existing company properties
  const listRes = await fetch('https://api.hubapi.com/crm/v3/properties/companies?limit=500', {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const listBody = (await listRes.json().catch(() => ({ results: [] }))) as { results?: Array<{ name?: string }> };
  const existingNames = new Set((listBody.results ?? []).map((p) => p.name).filter(Boolean));

  const created: string[] = [];
  const failed: string[] = [];
  const alreadyExist: string[] = [];

  for (const spec of COMPANY_METADATA_PROPERTIES) {
    if (existingNames.has(spec.name)) {
      alreadyExist.push(spec.name);
      continue;
    }
    const body: Record<string, unknown> = {
      name: spec.name,
      label: spec.label,
      type: spec.type,
      fieldType: spec.fieldType,
      groupName: 'companyinformation',
      hasUniqueValue: false,
    };
    if (spec.options) body.options = spec.options;

    const createRes = await fetch('https://api.hubapi.com/crm/v3/properties/companies', {
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
      // If already exists (409), treat as existing
      if (createRes.status === 409 || (msg ?? '').toLowerCase().includes('already exists')) {
        alreadyExist.push(spec.name);
      } else {
        failed.push(`${spec.name}: ${msg}`);
      }
    }
  }

  return { created, failed, alreadyExist };
}

// ── HubSpot API ───────────────────────────────────────────────────────────

interface HubspotBatchCreateResponse {
  status?: string;
  results?: Array<{ id?: string; properties?: Record<string, unknown> }>;
  errors?: Array<{ message?: string; context?: { objectWriteTraceId?: string[] } }>;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function batchCreateCompanies(
  token: string,
  inputs: Array<{ properties: Record<string, string> }>,
  retries = 2,
): Promise<{ results: HubspotBatchCreateResponse['results']; errors: HubspotBatchCreateResponse['errors'] }> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/companies/batch/create', {
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

    const body = (await res.json().catch(() => ({}))) as HubspotBatchCreateResponse;
    return { results: body.results ?? [], errors: body.errors ?? [] };
  }
  return { results: [], errors: [{ message: 'RATE_LIMIT_EXHAUSTED' }] };
}

// ── Supabase helpers ──────────────────────────────────────────────────────

async function readValidAccounts(tenantId: string): Promise<{ valid: CompanyCandidate[]; blocked: Array<{ id: string; reason: string }> }> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('accounts').select('id, nome, dominio');
  if (error) throw new Error('READ_ACCOUNTS_FAILED');

  const valid: CompanyCandidate[] = [];
  const blocked: Array<{ id: string; reason: string }> = [];

  for (const row of (data ?? []) as AccountRow[]) {
    const nome = typeof row.nome === 'string' && row.nome.trim() ? row.nome.trim() : null;
    if (!nome) {
      blocked.push({ id: row.id, reason: 'nome ausente — canopi_company_id não pode ser gerado' });
      continue;
    }
    // tenantId is validated at route level — always present here
    if (!tenantId) {
      blocked.push({ id: row.id, reason: 'tenantId ausente — canopi_tenant_id bloqueado' });
      continue;
    }
    valid.push({
      canonicalId: row.id,
      nome,
      dominio: typeof row.dominio === 'string' && row.dominio.trim() ? row.dominio.trim() : null,
      canopiCompanyId: buildCanopiCompanyId(nome, row.dominio ?? null),
    });
  }

  return { valid, blocked };
}

async function persistMappings(
  entries: Array<{ canonicalId: string; canopiCompanyId: string; hsObjectId: string }>,
  batchId: string,
  tenantId: string,
  contractVersion: string,
  executedAt: string,
): Promise<{ persisted: string[]; failed: Array<{ canonicalId: string; hsObjectId: string; error: string }> }> {
  if (entries.length === 0) return { persisted: [], failed: [] };

  const supabase = getSupabaseAdminClient();
  const rows = entries.map((e) => ({
    provider: 'hubspot',
    entity_type: 'account',
    canonical_id: e.canonicalId,
    canopi_external_id: e.canopiCompanyId,
    hubspot_id: e.hsObjectId,
    status: 'active',
    metadata_json: {
      batchId,
      tenantId,
      contractVersion,
      createdAt: executedAt,
      source: 'canopi_clean_reload',
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

export async function runHubspotCleanReloadCompanyCreate(
  options: HubspotCleanReloadCompanyCreateOptions,
): Promise<HubspotCleanReloadCompanyCreateResult | { status: 'error'; error: string; canProceedToContactCreate: false }> {
  const { batchId, tenantId, contractVersion = CLEAN_RELOAD_COMPANY_CREATE_CONTRACT_VERSION, resumeMode = false } = options;
  const executedAt = new Date().toISOString();

  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return { status: 'error', error: 'HUBSPOT_TOKEN_NOT_CONFIGURED', canProceedToContactCreate: false };
  }

  // ── Preflight ─────────────────────────────────────────────────────────

  // 1. Registry
  const registryValidation = validateHubspotPropertyRegistry();

  // 2. Setup properties (blocking)
  const setupResult = await runHubspotCleanReloadSetup({ mode: 'verify', contractVersion });
  const setupReady = setupResult.status === 'success' && setupResult.canProceedToCleanCreate;
  const setupMissingProperties = setupResult.status === 'success' ? setupResult.missingProperties : [];
  const setupIncompatibleProperties = setupResult.status === 'success' ? setupResult.incompatibleProperties : [];

  // 3. Ensure metadata properties exist in HubSpot (non-blocking setup)
  const metadataSetup = await ensureCompanyMetadataProperties(token);

  // 4. Existing company mappings (Supabase side)
  const existingMappings = await listHubspotIdentityMappings({ provider: 'hubspot', entityType: 'account', status: 'active' });

  // 5. Valid accounts
  const { valid: validCandidates, blocked: blockedCandidates } = await readValidAccounts(tenantId);

  // 6. Check for canopi_company_id conflicts in HubSpot (existing companies from prior runs)
  const existingHubspotIds = await fetchExistingCanopiCompanyIds(token);
  const conflictingIds = validCandidates.filter((c) => existingHubspotIds.has(c.canopiCompanyId)).map((c) => c.canopiCompanyId);

  const preflight: HubspotCleanReloadCompanyCreatePreflight = {
    registryValid: registryValidation.valid,
    setupReady,
    setupMissingProperties,
    setupIncompatibleProperties,
    metadataPropertiesCreated: metadataSetup.created,
    metadataPropertiesFailed: metadataSetup.failed,
    metadataPropertiesAlreadyExist: metadataSetup.alreadyExist,
    existingCompanyMappings: existingMappings.length,
    hubspotCanopiCompanyIdConflicts: conflictingIds.length,
    conflictingCanopiCompanyIds: conflictingIds,
    validCompanies: validCandidates.length,
    blockedCompanies: blockedCandidates.length,
    blockedReasons: blockedCandidates.map((b) => `${b.id}: ${b.reason}`),
  };

  // ── Blocker evaluation ────────────────────────────────────────────────

  const blockers: string[] = [];

  if (!registryValidation.valid) {
    blockers.push(`Registry inválida: ${registryValidation.missingBlocking.join('; ')}`);
  }
  if (!setupReady) {
    const missing = setupMissingProperties.length > 0 ? `ausentes: ${setupMissingProperties.join(', ')}` : '';
    const incompatible = setupIncompatibleProperties.length > 0 ? `incompatíveis: ${setupIncompatibleProperties.join(', ')}` : '';
    blockers.push(`Propriedades bloqueadoras não estão prontas no HubSpot. ${[missing, incompatible].filter(Boolean).join('; ')}`);
  }
  if (metadataSetup.failed.length > 0) {
    blockers.push(`Falha ao criar propriedades de metadata no HubSpot: ${metadataSetup.failed.join('; ')}. Verifique permissões do token.`);
  }
  if (conflictingIds.length > 0) {
    blockers.push(
      `${conflictingIds.length} companies têm canopi_company_id já existente no HubSpot (conflito de unicidade). Remova ou archive os registros históricos no HubSpot antes de prosseguir.`,
    );
  }
  if (existingMappings.length > 0 && !resumeMode) {
    blockers.push(`${existingMappings.length} mapping(s) ativo(s) já existem para entity_type=account. Execute um recorte de limpeza antes de criar novos, ou use resumeMode=true para criar somente os não mapeados.`);
  }
  if (validCandidates.length === 0) {
    blockers.push('Nenhuma Company válida para criar no HubSpot.');
  }

  const warnings: string[] = [];
  if (blockedCandidates.length > 0) {
    warnings.push(`${blockedCandidates.length} accounts bloqueadas e excluídas: ${blockedCandidates.map((b) => b.id).slice(0, 5).join(', ')}${blockedCandidates.length > 5 ? '...' : ''}`);
  }

  if (blockers.length > 0) {
    return buildErrorResult({ blockers, warnings, preflight, contractVersion, batchId, tenantId, executedAt });
  }

  // ── Create Companies ──────────────────────────────────────────────────

  // In resume mode, skip companies that already have an active mapping
  const alreadyMappedIds = resumeMode
    ? new Set(existingMappings.map((m) => m.canonicalId).filter(Boolean))
    : new Set<string>();
  const candidatesToCreate = resumeMode
    ? validCandidates.filter((c) => !alreadyMappedIds.has(c.canonicalId))
    : validCandidates;

  if (resumeMode && candidatesToCreate.length === 0) {
    return {
      ...buildErrorResult({ blockers: [], warnings: [...warnings, 'resumeMode: todos os companies já estão mapeados.'], preflight, contractVersion, batchId, tenantId, executedAt }),
      canProceedToContactCreate: true,
    };
  }

  const createdCompanies: CompanyCreateEntry[] = [];
  const failedCompanies: CompanyCreateFailure[] = [];
  let mappingsPersisted = 0;
  let mappingsFailed = 0;

  const chunks = chunkArray(candidatesToCreate, CHUNK_SIZE);

  for (const chunk of chunks) {
    const inputs = chunk.map((c) => ({
      properties: compactProps({
        name: c.nome,
        domain: sanitizeDomain(c.dominio),
        canopi_canonical_id: c.canonicalId,
        canopi_company_id: c.canopiCompanyId,
        canopi_tenant_id: tenantId,
        canopi_import_batch_id: batchId,
        canopi_contract_version: contractVersion,
        canopi_sync_status: 'pending',
        canopi_source: 'canopi_clean_reload',
        canopi_last_sync_at: executedAt,
      }),
    }));

    let chunkResults: HubspotBatchCreateResponse['results'] = [];
    let chunkErrors: HubspotBatchCreateResponse['errors'] = [];

    try {
      const response = await batchCreateCompanies(token, inputs);
      chunkResults = response.results ?? [];
      chunkErrors = response.errors ?? [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'NETWORK_ERROR';
      for (const c of chunk) {
        failedCompanies.push({ canonicalId: c.canonicalId, canopiCompanyId: c.canopiCompanyId, error: `Chunk create failed: ${msg}` });
      }
      continue;
    }

    // Map results by canopi_canonical_id
    const resultByCanonicalId = new Map<string, string>();
    for (const r of chunkResults ?? []) {
      const cid = r.properties?.canopi_canonical_id;
      const hsId = r.id;
      if (typeof cid === 'string' && cid && typeof hsId === 'string' && hsId) {
        resultByCanonicalId.set(cid, hsId);
      }
    }

    // Identify failed from errors (match by index if canonical_id not available)
    const createdInChunk: CompanyCandidate[] = [];
    for (const c of chunk) {
      const hsObjectId = resultByCanonicalId.get(c.canonicalId);
      if (hsObjectId) {
        createdInChunk.push(c);
      } else {
        // Check if it's in errors
        const errMsg = (chunkErrors ?? []).find(() => true)?.message ?? 'CREATE_FAILED';
        failedCompanies.push({ canonicalId: c.canonicalId, canopiCompanyId: c.canopiCompanyId, error: errMsg });
      }
    }

    // Persist mappings for created companies
    if (createdInChunk.length > 0) {
      const toMap = createdInChunk.map((c) => ({
        canonicalId: c.canonicalId,
        canopiCompanyId: c.canopiCompanyId,
        hsObjectId: resultByCanonicalId.get(c.canonicalId) as string,
      }));

      const { persisted, failed: mappingFailed } = await persistMappings(toMap, batchId, tenantId, contractVersion, executedAt);
      const persistedSet = new Set(persisted);

      for (const c of createdInChunk) {
        const hsObjectId = resultByCanonicalId.get(c.canonicalId) as string;
        const mappingFailure = mappingFailed.find((f) => f.canonicalId === c.canonicalId);
        const wasPersisted = persistedSet.has(c.canonicalId);

        if (wasPersisted) {
          mappingsPersisted += 1;
          createdCompanies.push({ canonicalId: c.canonicalId, canopiCompanyId: c.canopiCompanyId, hsObjectId, mappingId: null, mappingStatus: 'persisted' });
        } else {
          mappingsFailed += 1;
          warnings.push(`Company ${c.canonicalId} criada no HubSpot (hs_object_id: ${hsObjectId}) mas mapping falhou: ${mappingFailure?.error ?? 'UNKNOWN'}`);
          createdCompanies.push({ canonicalId: c.canonicalId, canopiCompanyId: c.canopiCompanyId, hsObjectId, mappingId: null, mappingStatus: 'failed' });
        }
      }
    }
  }

  const createdWithoutMapping = createdCompanies.filter((c) => c.mappingStatus === 'failed').length;

  const finalBlockers: string[] = [];
  if (failedCompanies.length > 0) {
    finalBlockers.push(`${failedCompanies.length} Companies não foram criadas no HubSpot. Verifique failedCompanies antes de prosseguir para Contacts.`);
  }
  if (createdWithoutMapping > 0) {
    finalBlockers.push(`${createdWithoutMapping} Companies criadas no HubSpot sem mapping persistido. Não avance para Contacts até resolver.`);
  }

  return {
    status: 'success',
    mode: 'create_companies',
    provider: 'hubspot',
    contractVersion,
    batchId,
    tenantId,
    executedAt,
    preflight,
    results: {
      attempted: validCandidates.length,
      created: createdCompanies.length,
      failed: failedCompanies.length,
      mappingsPersisted,
      mappingsFailed,
      createdWithoutMapping,
    },
    createdCompanies,
    failedCompanies,
    blockers: finalBlockers,
    warnings,
    canProceedToContactCreate: finalBlockers.length === 0 && createdCompanies.length > 0,
    guardrails: [
      'Nenhum Contact criado.',
      'Nenhum Deal criado.',
      'Nenhum Product criado.',
      'Nenhum reset ou delete executado.',
      'Nenhum hs_object_id histórico reutilizado.',
      'Nenhuma escrita em accounts ou contacts no Supabase.',
      'Mapping só persiste para Companies criadas com sucesso neste recorte.',
      'Falha parcial para o create sem comprometer mappings já persistidos.',
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

const VALID_DOMAIN_RE = /^[a-z0-9][a-z0-9\-.]*\.[a-z]{2,}$/i;

function sanitizeDomain(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const d = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return VALID_DOMAIN_RE.test(d) ? d : null;
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
  preflight: HubspotCleanReloadCompanyCreatePreflight;
  contractVersion: string;
  batchId: string;
  tenantId: string;
  executedAt: string;
}): HubspotCleanReloadCompanyCreateResult {
  return {
    status: 'success',
    mode: 'create_companies',
    provider: 'hubspot',
    contractVersion: opts.contractVersion,
    batchId: opts.batchId,
    tenantId: opts.tenantId,
    executedAt: opts.executedAt,
    preflight: opts.preflight,
    results: { attempted: 0, created: 0, failed: 0, mappingsPersisted: 0, mappingsFailed: 0, createdWithoutMapping: 0 },
    createdCompanies: [],
    failedCompanies: [],
    blockers: opts.blockers,
    warnings: opts.warnings,
    canProceedToContactCreate: false,
    guardrails: [
      'Nenhum Company criado — bloqueadores impediram execução.',
      'Nenhum Contact criado.',
      'Nenhuma escrita em accounts ou contacts no Supabase.',
      'Token não exposto na resposta.',
    ],
  };
}
