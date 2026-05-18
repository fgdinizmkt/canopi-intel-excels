import { getBlockingHubspotProperties } from '@/src/lib/hubspotPropertyRegistry';

export const CLEAN_RELOAD_SETUP_CONTRACT_VERSION = 'c2.9e.2d.11';

// ── Types ─────────────────────────────────────────────────────────────────

type HubspotObjectType = 'companies' | 'contacts';

export type PropertyCheckStatus = 'ok' | 'missing' | 'incompatible';

export interface PropertyCheckResult {
  hubspotName: string;
  label: string;
  status: PropertyCheckStatus;
  message: string;
  details: {
    existingType: string | null;
    existingFieldType: string | null;
    existingHasUniqueValue: boolean | null;
    existingArchived: boolean;
    expectedType: string;
    expectedFieldType: string;
    expectedHasUniqueValue: boolean;
  };
}

export interface ObjectAudit {
  objectType: HubspotObjectType;
  properties: PropertyCheckResult[];
  ready: boolean;
}

export interface CreatedPropertyEntry {
  objectType: HubspotObjectType;
  hubspotName: string;
  label: string;
  action: 'created' | 'already_exists' | 'failed';
  message: string;
}

export interface SetupSummary {
  totalChecked: number;
  ok: number;
  missing: number;
  incompatible: number;
  created: number;
  failed: number;
}

export interface HubspotCleanReloadSetupResult {
  status: 'success';
  contractVersion: string;
  mode: 'verify' | 'create_missing';
  checkedAt: string;
  objects: {
    companies: ObjectAudit;
    contacts: ObjectAudit;
  };
  summary: SetupSummary;
  missingProperties: string[];
  incompatibleProperties: string[];
  createdProperties: string[];
  blockers: string[];
  warnings: string[];
  canProceedToCleanCreate: boolean;
  guardrails: string[];
}

export interface HubspotCleanReloadSetupOptions {
  mode: 'verify' | 'create_missing';
  contractVersion?: string;
}

// ── Property specs ────────────────────────────────────────────────────────

interface BlockingSpec {
  hubspotName: string;
  label: string;
  type: string;
  fieldType: string;
  hasUniqueValue: boolean;
  groupName: string;
  description: string;
}

function buildSpecs(entityType: 'company' | 'contact', groupName: string): BlockingSpec[] {
  return getBlockingHubspotProperties(entityType).map((p) => ({
    hubspotName: p.hubspotName,
    label: p.label,
    type: p.type,
    fieldType: p.fieldType,
    hasUniqueValue: p.internalName !== 'canopi_tenant_id',
    groupName,
    description: p.description,
  }));
}

// ── HubSpot API helpers ───────────────────────────────────────────────────

interface RawHubspotProperty {
  name?: unknown;
  type?: unknown;
  fieldType?: unknown;
  hasUniqueValue?: unknown;
  archived?: unknown;
}

function readStr(v: unknown): string | null {
  if (typeof v === 'string') { const t = v.trim(); return t.length > 0 ? t : null; }
  if (typeof v === 'number') return String(v);
  return null;
}

async function fetchProperties(
  token: string,
  objectType: HubspotObjectType,
): Promise<{ ok: boolean; properties: Map<string, RawHubspotProperty> }> {
  try {
    const res = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, properties: new Map() };

    const payload = (await res.json().catch(() => null)) as { results?: unknown[] } | null;
    const index = new Map<string, RawHubspotProperty>();
    if (Array.isArray(payload?.results)) {
      for (const item of payload!.results as RawHubspotProperty[]) {
        const name = readStr(item.name);
        if (name) index.set(name.toLowerCase(), item);
      }
    }
    return { ok: true, properties: index };
  } catch {
    return { ok: false, properties: new Map() };
  }
}

// ── Audit logic ───────────────────────────────────────────────────────────

function auditObject(
  objectType: HubspotObjectType,
  specs: BlockingSpec[],
  propertyIndex: Map<string, RawHubspotProperty>,
  readOk: boolean,
): ObjectAudit {
  const results: PropertyCheckResult[] = specs.map((spec) => {
    if (!readOk) {
      return {
        hubspotName: spec.hubspotName,
        label: spec.label,
        status: 'incompatible',
        message: 'Leitura de propriedades HubSpot indisponível.',
        details: {
          existingType: null,
          existingFieldType: null,
          existingHasUniqueValue: null,
          existingArchived: false,
          expectedType: spec.type,
          expectedFieldType: spec.fieldType,
          expectedHasUniqueValue: spec.hasUniqueValue,
        },
      };
    }

    const existing = propertyIndex.get(spec.hubspotName.toLowerCase()) ?? null;

    if (!existing) {
      return {
        hubspotName: spec.hubspotName,
        label: spec.label,
        status: 'missing',
        message: 'Propriedade ausente no HubSpot.',
        details: {
          existingType: null,
          existingFieldType: null,
          existingHasUniqueValue: null,
          existingArchived: false,
          expectedType: spec.type,
          expectedFieldType: spec.fieldType,
          expectedHasUniqueValue: spec.hasUniqueValue,
        },
      };
    }

    const existingType = readStr(existing.type);
    const existingFieldType = readStr(existing.fieldType);
    const existingHasUniqueValue = typeof existing.hasUniqueValue === 'boolean' ? existing.hasUniqueValue : null;
    const existingArchived = existing.archived === true;

    const incompatibilities: string[] = [];
    if (existingType?.toLowerCase() !== spec.type.toLowerCase()) {
      incompatibilities.push(`tipo '${existingType ?? '—'}' difere do esperado '${spec.type}'`);
    }
    if (existingFieldType?.toLowerCase() !== spec.fieldType.toLowerCase()) {
      incompatibilities.push(`fieldType '${existingFieldType ?? '—'}' difere do esperado '${spec.fieldType}'`);
    }
    if (spec.hasUniqueValue && existingHasUniqueValue !== true) {
      incompatibilities.push(`hasUniqueValue deve ser true para esta propriedade de identidade`);
    }
    if (existingArchived) {
      incompatibilities.push(`propriedade arquivada no HubSpot`);
    }

    if (incompatibilities.length > 0) {
      return {
        hubspotName: spec.hubspotName,
        label: spec.label,
        status: 'incompatible',
        message: incompatibilities.join('; '),
        details: { existingType, existingFieldType, existingHasUniqueValue, existingArchived, expectedType: spec.type, expectedFieldType: spec.fieldType, expectedHasUniqueValue: spec.hasUniqueValue },
      };
    }

    return {
      hubspotName: spec.hubspotName,
      label: spec.label,
      status: 'ok',
      message: 'Propriedade presente e compatível.',
      details: { existingType, existingFieldType, existingHasUniqueValue, existingArchived, expectedType: spec.type, expectedFieldType: spec.fieldType, expectedHasUniqueValue: spec.hasUniqueValue },
    };
  });

  const missing = results.filter((r) => r.status === 'missing').length;
  const incompatible = results.filter((r) => r.status === 'incompatible').length;

  return { objectType, properties: results, ready: missing === 0 && incompatible === 0 };
}

// ── Creation ──────────────────────────────────────────────────────────────

async function createProperty(
  token: string,
  objectType: HubspotObjectType,
  spec: BlockingSpec,
): Promise<CreatedPropertyEntry> {
  const payload = {
    name: spec.hubspotName,
    label: spec.label,
    type: spec.type,
    fieldType: spec.fieldType,
    groupName: spec.groupName,
    description: spec.description,
    formField: false,
    hidden: false,
    externalOptions: false,
    hasUniqueValue: spec.hasUniqueValue,
  };

  try {
    const res = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (res.ok) {
      return { objectType, hubspotName: spec.hubspotName, label: spec.label, action: 'created', message: `${spec.label} criada com sucesso.` };
    }

    const errBody = (await res.json().catch(() => null)) as { message?: string } | null;
    const errMsg = errBody?.message ?? `HTTP ${res.status}`;
    return { objectType, hubspotName: spec.hubspotName, label: spec.label, action: 'failed', message: `Falha ao criar ${spec.label}: ${errMsg}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'UNKNOWN';
    return { objectType, hubspotName: spec.hubspotName, label: spec.label, action: 'failed', message: `Erro de rede ao criar ${spec.label}: ${msg}` };
  }
}

// ── Result builder ────────────────────────────────────────────────────────

function buildResult(options: {
  mode: 'verify' | 'create_missing';
  contractVersion: string;
  checkedAt: string;
  companies: ObjectAudit;
  contacts: ObjectAudit;
  creationLog: CreatedPropertyEntry[];
}): HubspotCleanReloadSetupResult {
  const { mode, contractVersion, checkedAt, companies, contacts, creationLog } = options;

  const allProperties = [...companies.properties, ...contacts.properties];
  const missing = allProperties.filter((p) => p.status === 'missing');
  const incompatible = allProperties.filter((p) => p.status === 'incompatible');
  const ok = allProperties.filter((p) => p.status === 'ok');

  const created = creationLog.filter((e) => e.action === 'created');
  const failed = creationLog.filter((e) => e.action === 'failed');

  const missingProperties = [
    ...companies.properties.filter((p) => p.status === 'missing').map((p) => `companies.${p.hubspotName}`),
    ...contacts.properties.filter((p) => p.status === 'missing').map((p) => `contacts.${p.hubspotName}`),
  ];

  const incompatibleProperties = [
    ...companies.properties.filter((p) => p.status === 'incompatible').map((p) => `companies.${p.hubspotName}: ${p.message}`),
    ...contacts.properties.filter((p) => p.status === 'incompatible').map((p) => `contacts.${p.hubspotName}: ${p.message}`),
  ];

  const createdProperties = created.map((e) => `${e.objectType}.${e.hubspotName}`);

  const blockers: string[] = [];
  if (missing.length > 0) blockers.push(`Propriedades bloqueadoras ausentes: ${missingProperties.join(', ')}`);
  if (incompatible.length > 0) blockers.push(`Propriedades incompatíveis impedem a carga: ${incompatibleProperties.join(' | ')}`);
  if (failed.length > 0) blockers.push(`Falha na criação de propriedades: ${failed.map((e) => `${e.objectType}.${e.hubspotName}`).join(', ')}`);

  const warnings: string[] = [];
  if (mode === 'verify' && missing.length > 0) {
    warnings.push(`Execute mode_setup=create_missing com confirm=true para criar as ${missing.length} propriedades ausentes.`);
  }

  return {
    status: 'success',
    contractVersion,
    mode,
    checkedAt,
    objects: { companies, contacts },
    summary: {
      totalChecked: allProperties.length,
      ok: ok.length,
      missing: missing.length,
      incompatible: incompatible.length,
      created: created.length,
      failed: failed.length,
    },
    missingProperties,
    incompatibleProperties,
    createdProperties,
    blockers,
    warnings,
    canProceedToCleanCreate: blockers.length === 0,
    guardrails: [
      'Nenhum Company ou Contact criado no HubSpot.',
      'Nenhum mapping criado em hubspot_identity_mappings.',
      'Nenhuma escrita em accounts ou contacts no Supabase.',
      'Token lido de variável de ambiente — não exposto na resposta.',
      'create_missing só executa com confirm=true explícito.',
      'Propriedades incompatíveis bloqueiam create_missing inteiramente.',
      'Propriedades existentes nunca são sobrescritas.',
    ],
  };
}

// ── Public entry point ────────────────────────────────────────────────────

export async function runHubspotCleanReloadSetup(
  options: HubspotCleanReloadSetupOptions,
): Promise<HubspotCleanReloadSetupResult | { status: 'error'; error: string; canProceedToCleanCreate: false }> {
  const { mode, contractVersion = CLEAN_RELOAD_SETUP_CONTRACT_VERSION } = options;

  const token = (process.env.HUBSPOT_PRIVATE_APP_TOKEN ?? '').trim();
  if (!token) {
    return {
      status: 'error',
      error: 'HUBSPOT_TOKEN_NOT_CONFIGURED',
      canProceedToCleanCreate: false,
    };
  }

  const checkedAt = new Date().toISOString();

  const companySpecs = buildSpecs('company', 'companyinformation');
  const contactSpecs = buildSpecs('contact', 'contactinformation');

  const [companiesRead, contactsRead] = await Promise.all([
    fetchProperties(token, 'companies'),
    fetchProperties(token, 'contacts'),
  ]);

  const companies = auditObject('companies', companySpecs, companiesRead.properties, companiesRead.ok);
  const contacts = auditObject('contacts', contactSpecs, contactsRead.properties, contactsRead.ok);

  if (mode === 'verify') {
    return buildResult({ mode, contractVersion, checkedAt, companies, contacts, creationLog: [] });
  }

  // create_missing mode
  const allIncompatible = [
    ...companies.properties.filter((p) => p.status === 'incompatible'),
    ...contacts.properties.filter((p) => p.status === 'incompatible'),
  ];
  if (allIncompatible.length > 0) {
    const names = allIncompatible.map((p) => p.hubspotName).join(', ');
    return {
      status: 'error',
      error: `INCOMPATIBLE_PROPERTIES_BLOCK_CREATE: ${names}. Corrija manualmente no HubSpot antes de prosseguir.`,
      canProceedToCleanCreate: false,
    };
  }

  const creationLog: CreatedPropertyEntry[] = [];

  for (const spec of companySpecs) {
    const existing = companies.properties.find((p) => p.hubspotName === spec.hubspotName);
    if (existing?.status !== 'missing') {
      creationLog.push({ objectType: 'companies', hubspotName: spec.hubspotName, label: spec.label, action: 'already_exists', message: `${spec.label} já existe no HubSpot.` });
      continue;
    }
    creationLog.push(await createProperty(token, 'companies', spec));
  }

  for (const spec of contactSpecs) {
    const existing = contacts.properties.find((p) => p.hubspotName === spec.hubspotName);
    if (existing?.status !== 'missing') {
      creationLog.push({ objectType: 'contacts', hubspotName: spec.hubspotName, label: spec.label, action: 'already_exists', message: `${spec.label} já existe no HubSpot.` });
      continue;
    }
    creationLog.push(await createProperty(token, 'contacts', spec));
  }

  // Re-verify after creation
  const [companiesRecheck, contactsRecheck] = await Promise.all([
    fetchProperties(token, 'companies'),
    fetchProperties(token, 'contacts'),
  ]);

  const companiesFinal = auditObject('companies', companySpecs, companiesRecheck.properties, companiesRecheck.ok);
  const contactsFinal = auditObject('contacts', contactSpecs, contactsRecheck.properties, contactsRecheck.ok);

  return buildResult({ mode, contractVersion, checkedAt, companies: companiesFinal, contacts: contactsFinal, creationLog });
}
