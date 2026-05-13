import {
  buildHubspotWritebackSetupResult,
  parseHubspotScopes,
} from './hubspotWritebackSetup';
import type { HubspotWritebackSetupResult } from './hubspotWritebackSetupTypes';
import type {
  HubspotWritebackCompanyRecord,
  HubspotWritebackContactRecord,
  HubspotWritebackDryRunResult,
} from './hubspotWritebackTypes';
import type {
  HubspotWritebackExecuteRequest,
  HubspotWritebackExecutionCountGroup,
  HubspotWritebackExecutionError,
  HubspotWritebackExecutionResult,
} from './hubspotWritebackExecuteTypes';

type HubspotTokenInfo = {
  hub_id?: number | string;
  hubId?: number | string;
  scopes?: string[] | string;
};

type HubspotPropertyRecord = {
  name?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  groupName?: string;
  description?: string;
  formField?: boolean;
  hidden?: boolean;
  archived?: boolean;
  calculated?: boolean;
  externalOptions?: boolean;
  hubspotDefined?: boolean;
  hasUniqueValue?: boolean;
  modificationMetadata?: {
    readOnlyValue?: boolean;
    readOnlyDefinition?: boolean;
    readOnlyOptions?: boolean;
  };
};

type BatchUpsertResult = {
  results?: Array<{
    id?: string;
    objectWriteTraceId?: string;
  }>;
  errors?: Array<{
    objectWriteTraceId?: string;
    message?: string;
    errors?: Array<{ message?: string }>;
  }>;
};

const DEFAULT_BATCH_LIMIT = 50;

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function compactProperties(properties: Record<string, string | null | undefined>) {
  return Object.entries(properties).reduce<Record<string, string>>((accumulator, [key, value]) => {
    const normalizedValue = readString(value);
    if (normalizedValue) accumulator[key] = normalizedValue;
    return accumulator;
  }, {});
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  const chunkSize = Math.max(1, size);
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function sanitizeHubspotError(status: number) {
  if (status === 400) return 'Token inválido ou malformado.';
  if (status === 401 || status === 403) return 'Token inválido, revogado ou sem permissão para validar o setup.';
  if (status === 404) return 'HubSpot não retornou dados para este token.';
  if (status === 429) return 'HubSpot atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'HubSpot indisponível no momento.';
  return 'Não foi possível validar o setup HubSpot.';
}

function createBatchLimits(maxCompanies: number, maxContacts: number, maxAssociations: number): HubspotWritebackExecutionCountGroup {
  return {
    companies: Math.min(DEFAULT_BATCH_LIMIT, Math.max(0, maxCompanies || DEFAULT_BATCH_LIMIT)),
    contacts: Math.min(DEFAULT_BATCH_LIMIT, Math.max(0, maxContacts || DEFAULT_BATCH_LIMIT)),
    associations: Math.min(DEFAULT_BATCH_LIMIT, Math.max(0, maxAssociations || DEFAULT_BATCH_LIMIT)),
  };
}

function normalizeIdList(values?: string[]) {
  return new Set((values || []).map((value) => value.trim()).filter(Boolean));
}

function normalizeIdRecord(values?: Record<string, string>) {
  return new Map(
    Object.entries(values || {}).flatMap(([key, value]) => {
      const normalizedKey = readString(key);
      const normalizedValue = readString(value);
      if (!normalizedKey || !normalizedValue) {
        return [];
      }
      return [[normalizedKey, normalizedValue] as const];
    })
  );
}

function getEmailDomain(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return null;
  const domain = trimmed.slice(atIndex + 1).trim();
  return domain.length > 0 ? domain : null;
}

function isPersonalEmailDomain(domain: string | null): boolean {
  if (!domain) return false;
  return new Set([
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'yahoo.com',
    'icloud.com',
    'aol.com',
    'proton.me',
    'protonmail.com',
    'gmx.com',
    'mail.com',
  ]).has(domain.toLowerCase());
}

function normalizeSetupProperty(property: HubspotPropertyRecord) {
  return {
    name: readString(property.name) || undefined,
    label: readString(property.label) || undefined,
    type: readString(property.type) || undefined,
    fieldType: readString(property.fieldType) || undefined,
    groupName: readString(property.groupName) || undefined,
    description: readString(property.description) || undefined,
    formField: readBoolean(property.formField),
    hidden: readBoolean(property.hidden),
    archived: readBoolean(property.archived),
    calculated: readBoolean(property.calculated),
    externalOptions: readBoolean(property.externalOptions),
    hasUniqueValue: readBoolean(property.hasUniqueValue),
    hubspotDefined: readBoolean(property.hubspotDefined),
    modificationMetadata: property.modificationMetadata || undefined,
  };
}

function pickCompanyProperties(company: HubspotWritebackCompanyRecord, batchId: string, timestamp: string) {
  return compactProperties({
    canopi_company_id: company.canopi_company_id,
    name: company.name,
    domain: company.domain,
    website: company.website,
    city: company.city,
    state: company.state,
    country: company.country,
    industry: company.industry,
    canopi_source: 'HubSpot writeback protegido',
    canopi_import_batch_id: batchId,
    canopi_last_sync_at: timestamp,
    canopi_simulated_fields: company.simulatedFields.join(' | '),
  });
}

function pickContactProperties(contact: HubspotWritebackContactRecord, batchId: string, timestamp: string) {
  return compactProperties({
    canopi_contact_id: contact.canopi_contact_id,
    canopi_associated_company_id: contact.associated_canopi_company_id,
    firstname: contact.firstname,
    lastname: contact.lastname,
    email: contact.email,
    phone: contact.phone,
    jobtitle: contact.jobtitle,
    canopi_source: 'HubSpot writeback protegido',
    canopi_import_batch_id: batchId,
    canopi_last_sync_at: timestamp,
    canopi_simulated_fields: contact.simulatedFields.join(' | '),
  });
}

function normalizeExecutionErrors(errors: HubspotWritebackExecutionError[]): HubspotWritebackExecutionError[] {
  return errors.filter((entry) => entry.message.trim().length > 0);
}

async function readTokenContext(token: string) {
  let hubId: string | null = null;
  let scopes: string[] = [];

  try {
    const response = await fetch('https://api.hubapi.com/oauth/v2/private-apps/get/access-token-info', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenKey: token }),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json().catch(() => null)) as HubspotTokenInfo | null;
      hubId = payload?.hub_id !== undefined
        ? String(payload.hub_id)
        : payload?.hubId !== undefined
          ? String(payload.hubId)
          : null;
      scopes = parseHubspotScopes(payload?.scopes);
    }
  } catch {
    // Introspecção opcional.
  }

  return { hubId, scopes };
}

async function fetchProperties(token: string, objectType: 'companies' | 'contacts') {
  const response = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      properties: [] as HubspotPropertyRecord[],
    };
  }

  const payload = (await response.json().catch(() => null)) as { results?: HubspotPropertyRecord[] } | null;
  return {
    ok: true as const,
    status: response.status,
    properties: Array.isArray(payload?.results) ? payload.results.map(normalizeSetupProperty) : [],
  };
}

async function verifyHubspotSetup(token: string): Promise<HubspotWritebackSetupResult> {
  const { hubId, scopes } = await readTokenContext(token);
  const companiesResponse = await fetchProperties(token, 'companies');
  const contactsReadScopeAvailable = scopes.includes('crm.schemas.contacts.read');
  const companiesProperties = companiesResponse.ok ? companiesResponse.properties : [];
  const contactsProperties = contactsReadScopeAvailable
    ? (await fetchProperties(token, 'contacts')).properties
    : [];

  return buildHubspotWritebackSetupResult({
    hubId,
    scopes,
    readAccessConfirmed: companiesResponse.ok,
    companiesProperties,
    contactsProperties,
  });
}

function selectReadyCompanies(
  dryRun: HubspotWritebackDryRunResult,
  limit: number,
  sentCompanyIds: Set<string>
) {
  return dryRun.companies
    .filter((company) => !company.isDuplicate)
    .filter((company) => !sentCompanyIds.has(company.canopi_company_id))
    .slice(0, limit);
}

function selectReadyContacts(
  dryRun: HubspotWritebackDryRunResult,
  companyIds: Set<string>,
  limit: number,
  sentContactIds: Set<string>
) {
  return dryRun.contacts
    .filter((contact) => contact.blocked_reason === null && contact.association_confidence !== 'low' && !contact.isDuplicate)
    .filter((contact) => contact.associated_canopi_company_id && companyIds.has(contact.associated_canopi_company_id))
    .filter((contact) => !sentContactIds.has(contact.canopi_contact_id))
    .slice(0, limit);
}

function createAssociationKey(contactId: string, companyId: string) {
  return `${contactId}|${companyId}`;
}

async function upsertBatchObjects<T extends HubspotWritebackCompanyRecord | HubspotWritebackContactRecord>(options: {
  token: string;
  objectType: 'companies' | 'contacts';
  idProperty: string;
  batchId: string;
  records: T[];
  getProperties: (record: T, batchId: string, timestamp: string) => Record<string, string>;
}): Promise<{
  hubspotIdByCanopiId: Map<string, string>;
  succeededCount: number;
  failedCount: number;
  errors: HubspotWritebackExecutionError[];
}> {
  const { token, objectType, idProperty, batchId, records, getProperties } = options;
  const startedAt = new Date().toISOString();
  const hubspotIdByCanopiId = new Map<string, string>();
  const errors: HubspotWritebackExecutionError[] = [];
  let succeededCount = 0;
  let failedCount = 0;

  for (const chunk of chunkArray(records, DEFAULT_BATCH_LIMIT)) {
    const inputs = chunk.map((record) => ({
      id: record[objectType === 'companies' ? 'canopi_company_id' : 'canopi_contact_id'],
      idProperty,
      objectWriteTraceId: record[objectType === 'companies' ? 'canopi_company_id' : 'canopi_contact_id'],
      properties: getProperties(record, batchId, startedAt),
    }));

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/batch/upsert`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
      cache: 'no-store',
    });

    const payload = (await response.json().catch(() => null)) as BatchUpsertResult | null;
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const resultMap = new Map<string, string>();

    results.forEach((result, index) => {
      const traceId = readString(result.objectWriteTraceId) || readString(inputs[index]?.objectWriteTraceId) || readString(inputs[index]?.id);
      const recordId = readString(result.id);
      if (traceId && recordId) {
        resultMap.set(traceId, recordId);
      }
    });

    inputs.forEach((input) => {
      const traceId = readString(input.objectWriteTraceId) || readString(input.id);
      const hubspotId = traceId ? resultMap.get(traceId) : null;
      if (hubspotId) {
        hubspotIdByCanopiId.set(traceId || '', hubspotId);
        succeededCount += 1;
      } else {
        failedCount += 1;
        errors.push({
          stage: objectType,
          canopiId: traceId || undefined,
          message: `Falha ao enviar ${objectType === 'companies' ? 'empresa' : 'contato'} para o HubSpot.`,
        });
      }
    });

    const responseErrors = Array.isArray(payload?.errors) ? payload.errors : [];
    responseErrors.forEach((entry) => {
      const traceId = readString(entry.objectWriteTraceId);
      errors.push({
        stage: objectType,
        canopiId: traceId || undefined,
        message: readString(entry.message) || entry.errors?.map((item) => readString(item.message)).filter(Boolean).join(' ') || `HubSpot retornou erro ao processar ${objectType}.`,
      });
    });
  }

  return {
    hubspotIdByCanopiId,
    succeededCount,
    failedCount,
    errors,
  };
}

async function createAssociations(options: {
  token: string;
  contacts: HubspotWritebackContactRecord[];
  contactHubspotIdByCanopiId: Map<string, string>;
  companyHubspotIdByCanopiId: Map<string, string>;
  maxAssociations: number;
  sentAssociationKeys: Set<string>;
}) {
  const { token, contacts, contactHubspotIdByCanopiId, companyHubspotIdByCanopiId, maxAssociations, sentAssociationKeys } = options;
  const errors: HubspotWritebackExecutionError[] = [];
  let succeededCount = 0;
  let failedCount = 0;
  let skippedAlreadySent = 0;
  const sentAssociationKeysResult: string[] = [];
  const chunkSize = Math.max(1, Math.min(DEFAULT_BATCH_LIMIT, maxAssociations || DEFAULT_BATCH_LIMIT));

  for (const chunk of chunkArray(contacts, chunkSize)) {
    for (const contact of chunk) {
      const contactHubspotId = contactHubspotIdByCanopiId.get(contact.canopi_contact_id);
      const companyHubspotId = contact.associated_canopi_company_id
        ? companyHubspotIdByCanopiId.get(contact.associated_canopi_company_id)
        : null;
      const associationKey = contact.associated_canopi_company_id
        ? createAssociationKey(contact.canopi_contact_id, contact.associated_canopi_company_id)
        : null;

      if (associationKey && sentAssociationKeys.has(associationKey)) {
        skippedAlreadySent += 1;
        continue;
      }

      if (!contactHubspotId || !companyHubspotId) {
        failedCount += 1;
        errors.push({
          stage: 'associations',
          canopiId: contact.canopi_contact_id,
          message: 'Associação bloqueada porque o contato ou a empresa não foi criada no HubSpot.',
        });
        continue;
      }

      const response = await fetch(
        `https://api.hubapi.com/crm/v4/objects/contact/${contactHubspotId}/associations/default/company/${companyHubspotId}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (response.ok || response.status === 409) {
        succeededCount += 1;
        if (associationKey) sentAssociationKeysResult.push(associationKey);
        continue;
      }

      failedCount += 1;
      const details = await response.text().catch(() => '');
      errors.push({
        stage: 'associations',
        canopiId: contact.canopi_contact_id,
        message: details || `Falha ao associar contato ao HubSpot company (${response.status}).`,
      });
    }
  }

  return {
    succeededCount,
    failedCount,
    skippedAlreadySent,
    sentAssociationKeys: sentAssociationKeysResult,
    errors,
  };
}

export async function executeHubspotWriteback(options: HubspotWritebackExecuteRequest): Promise<
  HubspotWritebackExecutionResult | { ok: false; error: string; details?: string }
> {
  const startedAt = new Date().toISOString();
  const startedTime = Date.now();
  const batchLimits = createBatchLimits(
    options.maxCompaniesPerBatch || 50,
    options.maxContactsPerBatch || 50,
    options.maxAssociationsPerBatch || 50
  );
  const dryRun = options.dryRun;
  const sentCompanyIds = normalizeIdList(options.sentCompanyIds);
  const sentContactIds = normalizeIdList(options.sentContactIds);
  const sentAssociationKeys = normalizeIdList(options.sentAssociationKeys);
  const previousCompanyHubspotIds = normalizeIdRecord(options.sentCompanyHubspotIds);
  const previousContactHubspotIds = normalizeIdRecord(options.sentContactHubspotIds);

  if (!options.confirmWriteback) {
    return { ok: false, error: 'Confirmação explícita ausente para executar writeback.' };
  }

  if (!options.token.trim()) {
    return { ok: false, error: 'Informe um token válido do HubSpot para executar writeback.' };
  }

  if (options.executionMode !== 'limited' && options.executionMode !== 'remaining') {
    return { ok: false, error: 'Modo de execução inválido.' };
  }

  if (dryRun.status !== 'success') {
    return { ok: false, error: 'O dry-run enviado não está em formato válido.' };
  }

  if (dryRun.blockers.length > 0) {
    return { ok: false, error: 'Existem bloqueios no dry-run. Corrija antes de enviar para o HubSpot.', details: dryRun.blockers.join(' ') };
  }

  const setup = await verifyHubspotSetup(options.token);
  if (!setup.readAccessConfirmed || !setup.ready || !setup.scopeSummary.schemaRead.ready || !setup.scopeSummary.objectWrite.ready || !setup.scopeSummary.schemaWrite.ready) {
    return {
      ok: false,
      error: 'O setup HubSpot não está pronto para writeback real.',
      details: [...setup.blockers, ...setup.warnings].join(' ') || 'Reconecte e valide os pré-requisitos do HubSpot.',
    };
  }

  if (!setup.companies.uniqueReady || !setup.contacts.uniqueReady) {
    return {
      ok: false,
      error: 'IDs externos Canopi precisam estar configurados como únicos no HubSpot.',
      details: 'Valide canopi_company_id e canopi_contact_id como propriedades únicas antes de executar.',
    };
  }

  const readyCompanies = selectReadyCompanies(
    dryRun,
    options.executionMode === 'limited' ? batchLimits.companies : Number.MAX_SAFE_INTEGER,
    sentCompanyIds
  );
  const readyCompanyIds = new Set([...sentCompanyIds, ...readyCompanies.map((company) => company.canopi_company_id)]);
  const readyContacts = selectReadyContacts(
    dryRun,
    readyCompanyIds,
    options.executionMode === 'limited' ? Math.min(batchLimits.contacts, batchLimits.associations) : Number.MAX_SAFE_INTEGER,
    sentContactIds
  );

  if (readyCompanies.length === 0 && readyContacts.length === 0) {
    return {
      ok: false,
      error: 'Não há empresas ou contatos prontos para envio neste modo.',
      details: 'Execute o dry-run novamente e confirme que há registros prontos sem bloqueios.',
    };
  }

  const batchId = `canopi-hubspot-${startedAt.replace(/[:.]/g, '-')}`;
  const warnings: string[] = [...dryRun.warnings];
  const errors: HubspotWritebackExecutionError[] = [];

  const companyUpsert = await upsertBatchObjects({
    token: options.token,
    objectType: 'companies',
    idProperty: 'canopi_company_id',
    batchId,
    records: readyCompanies,
    getProperties: (company) => pickCompanyProperties(company, batchId, startedAt),
  });
  errors.push(...companyUpsert.errors);

  const contactUpsert = await upsertBatchObjects({
    token: options.token,
    objectType: 'contacts',
    idProperty: 'canopi_contact_id',
    batchId,
    records: readyContacts,
    getProperties: (contact) => pickContactProperties(contact, batchId, startedAt),
  });
  errors.push(...contactUpsert.errors);

  const associationResult = await createAssociations({
    token: options.token,
    contacts: readyContacts,
    contactHubspotIdByCanopiId: new Map([...previousContactHubspotIds, ...contactUpsert.hubspotIdByCanopiId]),
    companyHubspotIdByCanopiId: new Map([...previousCompanyHubspotIds, ...companyUpsert.hubspotIdByCanopiId]),
    maxAssociations: batchLimits.associations,
    sentAssociationKeys,
  });
  errors.push(...associationResult.errors);

  const received: HubspotWritebackExecutionCountGroup = {
    companies: dryRun.summary.readyForSendCompanies,
    contacts: dryRun.summary.readyForSendContacts,
    associations: dryRun.summary.readyForSendContacts,
  };

  const skippedAlreadySent: HubspotWritebackExecutionCountGroup = {
    companies: sentCompanyIds.size,
    contacts: sentContactIds.size,
    associations: sentAssociationKeys.size + associationResult.skippedAlreadySent,
  };

  const processed: HubspotWritebackExecutionCountGroup = {
    companies: readyCompanies.length,
    contacts: readyContacts.length,
    associations: associationResult.succeededCount + associationResult.failedCount,
  };

  const succeeded: HubspotWritebackExecutionCountGroup = {
    companies: companyUpsert.succeededCount,
    contacts: contactUpsert.succeededCount,
    associations: associationResult.succeededCount,
  };

  const failed: HubspotWritebackExecutionCountGroup = {
    companies: Math.max(0, processed.companies - succeeded.companies),
    contacts: Math.max(0, processed.contacts - succeeded.contacts),
    associations: Math.max(0, processed.associations - succeeded.associations),
  };

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startedTime;

  return {
    ok: failed.companies === 0 && failed.contacts === 0 && failed.associations === 0 && errors.length === 0,
    mode: options.executionMode,
    startedAt,
    finishedAt,
    durationMs,
    received,
    skippedAlreadySent,
    processed,
    succeeded,
    failed,
    errors: normalizeExecutionErrors(errors),
    warnings,
    batchLimits,
    setupReady: setup.ready,
    dryRunAt: dryRun.analyzedAt,
    sent: {
      companyIds: [...companyUpsert.hubspotIdByCanopiId.keys()],
      contactIds: [...contactUpsert.hubspotIdByCanopiId.keys()],
      associationKeys: [...associationResult.sentAssociationKeys],
    },
    hubspotIds: {
      companyIdsByCanopiId: Object.fromEntries([...previousCompanyHubspotIds, ...companyUpsert.hubspotIdByCanopiId]),
      contactIdsByCanopiId: Object.fromEntries([...previousContactHubspotIds, ...contactUpsert.hubspotIdByCanopiId]),
    },
  };
}
