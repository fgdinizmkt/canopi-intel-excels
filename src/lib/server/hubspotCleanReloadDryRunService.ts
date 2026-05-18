import { createHash } from 'crypto';
import { getSupabaseAdminClient } from './supabaseAdmin';
import {
  getBlockingHubspotProperties,
  getRequiredHubspotProperties,
  validateHubspotPropertyRegistry,
} from '../hubspotPropertyRegistry';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';

export const CLEAN_RELOAD_CONTRACT_VERSION = 'c2.9e.2d.9';
export const CLEAN_RELOAD_DRY_RUN_MODE = 'clean_reload_dry_run' as const;

// ── Row types ─────────────────────────────────────────────────────────────

type AccountRow = {
  id: string;
  nome: string | null;
  dominio: string | null;
  vertical: string | null;
  segmento: string | null;
  porte: string | null;
  localizacao: string | null;
  ownerPrincipal: string | null;
  etapa: string | null;
};

type ContactRow = {
  id: string;
  accountId: string | null;
  accountName: string | null;
  nome: string | null;
  cargo: string | null;
  area: string | null;
  status: string | null;
};

// ── Public types ──────────────────────────────────────────────────────────

export interface HubspotCleanReloadDryRunOptions {
  batchId: string;
  contractVersion?: string;
  tenantId?: string | null;
  sampleSize?: number;
}

export interface HubspotCleanReloadCompanySample {
  canonicalId: string;
  nome: string | null;
  dominio: string | null;
  status: 'valid' | 'blocked';
  blockers: string[];
  warnings: string[];
}

export interface HubspotCleanReloadContactSample {
  canonicalId: string;
  nome: string | null;
  cargo: string | null;
  anchorCompanyCanonicalId: string | null;
  anchorResolved: boolean;
  status: 'valid' | 'blocked';
  blockers: string[];
  warnings: string[];
}

export interface HubspotCleanReloadDryRunResult {
  status: 'success';
  mode: typeof CLEAN_RELOAD_DRY_RUN_MODE;
  provider: 'hubspot';
  contractVersion: string;
  batchId: string;
  tenantId: string | null;
  executedAt: string;
  registryValidation: {
    valid: boolean;
    totalProperties: number;
    missingBlocking: string[];
    warnings: string[];
  };
  companies: {
    total: number;
    valid: number;
    blocked: number;
    requiredProperties: string[];
    blockingProperties: string[];
    samples: HubspotCleanReloadCompanySample[];
  };
  contacts: {
    total: number;
    valid: number;
    blockedNoAnchor: number;
    blockedOther: number;
    requiredProperties: string[];
    blockingProperties: string[];
    samples: HubspotCleanReloadContactSample[];
  };
  existingMappings: {
    total: number;
    note: string;
  };
  blockers: string[];
  warnings: string[];
  planHash: string;
  canProceedToCleanCreate: boolean;
  guardrails: string[];
}

// ── Internal types ────────────────────────────────────────────────────────

interface CompanyValidationResult {
  status: 'valid' | 'blocked';
  blockers: string[];
  warnings: string[];
}

interface ContactValidationResult {
  status: 'valid' | 'blocked';
  blockers: string[];
  warnings: string[];
  anchorResolved: boolean;
  isNoAnchor: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function readNullableString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function buildPlanHash(params: {
  batchId: string;
  contractVersion: string;
  tenantId: string | null;
  validCompanyIds: string[];
  validContactIds: string[];
}): string {
  const input = JSON.stringify({
    batchId: params.batchId,
    contractVersion: params.contractVersion,
    tenantId: params.tenantId,
    companies: [...params.validCompanyIds].sort(),
    contacts: [...params.validContactIds].sort(),
  });
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function validateCompany(
  account: AccountRow,
  tenantId: string | null,
  blockingNames: Set<string>,
): CompanyValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // canopi_canonical_id — always present (accounts.id from DB)

  // canopi_company_id — needs nome to generate hash-based ID
  if (!readNullableString(account.nome)) {
    if (blockingNames.has('canopi_company_id')) {
      blockers.push('nome ausente — canopi_company_id não pode ser gerado');
    } else {
      warnings.push('nome ausente');
    }
  }

  // canopi_tenant_id — needs tenantId option
  if (!tenantId) {
    if (blockingNames.has('canopi_tenant_id')) {
      blockers.push('tenantId não fornecido — canopi_tenant_id bloqueado');
    } else {
      warnings.push('tenantId ausente — canopi_tenant_id não será preenchido');
    }
  }

  // dominio — not blocking but degrades company ID quality
  if (!readNullableString(account.dominio)) {
    warnings.push('dominio ausente — canopi_company_id derivado apenas do nome');
  }

  return { status: blockers.length > 0 ? 'blocked' : 'valid', blockers, warnings };
}

function validateContact(
  contact: ContactRow,
  validAccountIds: Set<string>,
  tenantId: string | null,
  blockingNames: Set<string>,
): ContactValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const anchorId = readNullableString(contact.accountId);
  const isNoAnchor = anchorId === null;
  const anchorResolved = anchorId !== null && validAccountIds.has(anchorId);

  // Anchor company must be resolvable before sending to HubSpot
  if (!anchorResolved) {
    if (isNoAnchor) {
      blockers.push('accountId ausente — contact sem empresa âncora');
    } else {
      blockers.push(`accountId ${anchorId} não encontrado nas companies válidas`);
    }
  }

  // canopi_tenant_id — needs tenantId option
  if (!tenantId && blockingNames.has('canopi_tenant_id')) {
    blockers.push('tenantId não fornecido — canopi_tenant_id bloqueado');
  }

  // nome — useful but not a hard blocker for contact ID
  if (!readNullableString(contact.nome)) {
    warnings.push('nome ausente — contact sem nome identificável');
  }

  return {
    status: blockers.length > 0 ? 'blocked' : 'valid',
    blockers,
    warnings,
    anchorResolved,
    isNoAnchor,
  };
}

function buildGuardrails(): string[] {
  return [
    'Nenhuma escrita executada — somente leitura de accounts e contacts.',
    'Nenhuma chamada à API HubSpot.',
    'Nenhum mapping criado.',
    'canProceedToCleanCreate=false bloqueia qualquer create subsequente.',
    'tenantId deve ser fornecido explicitamente — não inferido do ambiente.',
    'planHash é determinístico — mesma base + batchId + contractVersion + tenantId gera o mesmo hash.',
    'Contacts bloqueados por ausência de âncora não entram na carga — não há create de contact standalone neste recorte.',
    'Histórico HubSpot (hubspot_identity_mappings) não é reutilizado — nova carga gera novos hs_object_ids.',
    'Resposta não expõe token, credentials ou payload bruto.',
  ];
}

// ── Main export ───────────────────────────────────────────────────────────

export async function runHubspotCleanReloadDryRun(
  options: HubspotCleanReloadDryRunOptions,
): Promise<HubspotCleanReloadDryRunResult> {
  const {
    batchId,
    contractVersion = CLEAN_RELOAD_CONTRACT_VERSION,
    tenantId = null,
    sampleSize = 5,
  } = options;

  const clampedSampleSize = Math.max(1, Math.min(20, sampleSize));
  const executedAt = new Date().toISOString();

  // 1. Validate registry
  const registryValidation = validateHubspotPropertyRegistry();

  // 2. Registry-derived property lists
  const companyBlockingProps = getBlockingHubspotProperties('company');
  const companyRequiredProps = getRequiredHubspotProperties('company');
  const contactBlockingProps = getBlockingHubspotProperties('contact');
  const contactRequiredProps = getRequiredHubspotProperties('contact');
  const companyBlockingNames = new Set(companyBlockingProps.map((p) => p.internalName));
  const contactBlockingNames = new Set(contactBlockingProps.map((p) => p.internalName));

  // 3. Read Supabase — read-only, no writes
  const supabase = getSupabaseAdminClient();
  const [accountsResult, contactsResult, existingMappings] = await Promise.all([
    supabase
      .from('accounts')
      .select('id, nome, dominio, vertical, segmento, porte, localizacao, ownerPrincipal, etapa'),
    supabase
      .from('contacts')
      .select('id, accountId, accountName, nome, cargo, area, status'),
    listHubspotIdentityMappings({ provider: 'hubspot' }),
  ]);

  if (accountsResult.error) throw new Error('READ_ACCOUNTS_FAILED');
  if (contactsResult.error) throw new Error('READ_CONTACTS_FAILED');

  const accounts = (accountsResult.data ?? []) as AccountRow[];
  const contacts = (contactsResult.data ?? []) as ContactRow[];

  // 4. Validate companies
  interface CompanyEntry { account: AccountRow; result: CompanyValidationResult }
  const companyCandidates: CompanyEntry[] = accounts.map((account) => ({
    account,
    result: validateCompany(account, tenantId, companyBlockingNames),
  }));

  const validCompanies = companyCandidates.filter((c) => c.result.status === 'valid');
  const blockedCompanies = companyCandidates.filter((c) => c.result.status === 'blocked');
  const validAccountIds = new Set(validCompanies.map((c) => c.account.id));

  // 5. Validate contacts
  interface ContactEntry { contact: ContactRow; result: ContactValidationResult }
  const contactCandidates: ContactEntry[] = contacts.map((contact) => ({
    contact,
    result: validateContact(contact, validAccountIds, tenantId, contactBlockingNames),
  }));

  const validContacts = contactCandidates.filter((c) => c.result.status === 'valid');
  const blockedNoAnchorContacts = contactCandidates.filter(
    (c) => c.result.status === 'blocked' && c.result.isNoAnchor,
  );
  const blockedOtherContacts = contactCandidates.filter(
    (c) => c.result.status === 'blocked' && !c.result.isNoAnchor,
  );

  // 6. Plan hash — deterministic over valid canonical IDs
  const planHash = buildPlanHash({
    batchId,
    contractVersion,
    tenantId,
    validCompanyIds: validCompanies.map((c) => c.account.id),
    validContactIds: validContacts.map((c) => c.contact.id),
  });

  // 7. Global blockers and warnings
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!registryValidation.valid) {
    blockers.push(`Registry inválida: ${registryValidation.missingBlocking.join('; ')}`);
  }
  if (!tenantId) {
    blockers.push('tenantId obrigatório não fornecido — canopi_tenant_id bloqueado para todas as entidades');
  }
  if (validCompanies.length === 0) {
    blockers.push('Nenhuma company válida para carga limpa');
  }
  if (blockedCompanies.length > 0) {
    warnings.push(`${blockedCompanies.length} companies bloqueadas e excluídas do plano`);
  }
  if (blockedNoAnchorContacts.length > 0) {
    warnings.push(`${blockedNoAnchorContacts.length} contacts bloqueados por ausência de empresa âncora`);
  }
  if (blockedOtherContacts.length > 0) {
    warnings.push(`${blockedOtherContacts.length} contacts bloqueados por outros motivos`);
  }
  if (existingMappings.length > 0) {
    warnings.push(
      `${existingMappings.length} mapping(s) existente(s) em hubspot_identity_mappings — ` +
        'a nova carga operará independentemente e gerará novos hs_object_ids',
    );
  }
  warnings.push(...registryValidation.warnings);

  const canProceedToCleanCreate = blockers.length === 0 && validCompanies.length > 0;

  // 8. Build samples — mix of valid + blocked for visibility
  const companySamples: HubspotCleanReloadCompanySample[] = [
    ...validCompanies.slice(0, Math.ceil(clampedSampleSize / 2)),
    ...blockedCompanies.slice(0, Math.floor(clampedSampleSize / 2)),
  ]
    .slice(0, clampedSampleSize)
    .map(({ account, result }) => ({
      canonicalId: account.id,
      nome: readNullableString(account.nome),
      dominio: readNullableString(account.dominio),
      status: result.status,
      blockers: result.blockers,
      warnings: result.warnings,
    }));

  const contactSamples: HubspotCleanReloadContactSample[] = [
    ...validContacts.slice(0, Math.ceil(clampedSampleSize / 2)),
    ...blockedNoAnchorContacts.slice(0, Math.floor(clampedSampleSize / 2)),
  ]
    .slice(0, clampedSampleSize)
    .map(({ contact, result }) => ({
      canonicalId: contact.id,
      nome: readNullableString(contact.nome),
      cargo: readNullableString(contact.cargo),
      anchorCompanyCanonicalId: readNullableString(contact.accountId),
      anchorResolved: result.anchorResolved,
      status: result.status,
      blockers: result.blockers,
      warnings: result.warnings,
    }));

  return {
    status: 'success',
    mode: CLEAN_RELOAD_DRY_RUN_MODE,
    provider: 'hubspot',
    contractVersion,
    batchId,
    tenantId,
    executedAt,
    registryValidation: {
      valid: registryValidation.valid,
      totalProperties: registryValidation.totalProperties,
      missingBlocking: registryValidation.missingBlocking,
      warnings: registryValidation.warnings,
    },
    companies: {
      total: accounts.length,
      valid: validCompanies.length,
      blocked: blockedCompanies.length,
      requiredProperties: companyRequiredProps.map((p) => p.hubspotName),
      blockingProperties: companyBlockingProps.map((p) => p.hubspotName),
      samples: companySamples,
    },
    contacts: {
      total: contacts.length,
      valid: validContacts.length,
      blockedNoAnchor: blockedNoAnchorContacts.length,
      blockedOther: blockedOtherContacts.length,
      requiredProperties: contactRequiredProps.map((p) => p.hubspotName),
      blockingProperties: contactBlockingProps.map((p) => p.hubspotName),
      samples: contactSamples,
    },
    existingMappings: {
      total: existingMappings.length,
      note:
        existingMappings.length === 0
          ? 'Nenhum mapping existente — base limpa para nova carga.'
          : 'Mappings existentes detectados. A nova carga opera independentemente e gerará novos hs_object_ids.',
    },
    blockers,
    warnings,
    planHash,
    canProceedToCleanCreate,
    guardrails: buildGuardrails(),
  };
}
