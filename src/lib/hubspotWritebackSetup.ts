import type {
  HubspotWritebackPropertyRequirement,
  HubspotWritebackSetupActionLog,
  HubspotWritebackSetupIssue,
  HubspotWritebackSetupObjectSummary,
  HubspotWritebackSetupObjectType,
  HubspotWritebackSetupPropertyState,
  HubspotWritebackSetupResult,
  HubspotWritebackSetupScopeState,
} from './hubspotWritebackSetupTypes';

export interface HubspotWritebackPropertyRecord {
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
  hasUniqueValue?: boolean;
  hubspotDefined?: boolean;
  modificationMetadata?: {
    readOnlyValue?: boolean;
    readOnlyDefinition?: boolean;
    readOnlyOptions?: boolean;
  };
}

export const HUBSPOT_WRITEBACK_SCOPE_REQUIREMENTS = {
  schemaRead: ['crm.schemas.companies.read', 'crm.schemas.contacts.read'],
  objectWrite: ['crm.objects.companies.write', 'crm.objects.contacts.write'],
  schemaWrite: ['crm.schemas.companies.write', 'crm.schemas.contacts.write'],
} as const;

export const HUBSPOT_WRITEBACK_COMPANY_PROPERTIES: HubspotWritebackPropertyRequirement[] = [
  {
    objectType: 'companies',
    name: 'canopi_company_id',
    label: 'Canopi Company ID',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: true,
    description: 'Identificador externo da empresa gerado pela Canopi para writeback e upsert.',
    groupName: 'companyinformation',
  },
  {
    objectType: 'companies',
    name: 'canopi_source',
    label: 'Canopi Source',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Origem do registro enviado ou preparado pela Canopi.',
    groupName: 'companyinformation',
  },
  {
    objectType: 'companies',
    name: 'canopi_import_batch_id',
    label: 'Canopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Identificador do lote de importação/writeback preparado pela Canopi.',
    groupName: 'companyinformation',
  },
  {
    objectType: 'companies',
    name: 'canopi_last_sync_at',
    label: 'Canopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Data/hora da última sincronização ou preparação de writeback pela Canopi.',
    groupName: 'companyinformation',
  },
  {
    objectType: 'companies',
    name: 'canopi_simulated_fields',
    label: 'Canopi Simulated Fields',
    type: 'string',
    fieldType: 'textarea',
    hasUniqueValue: false,
    description: 'Campos que foram simulados/preenchidos pela Canopi para revisão.',
    groupName: 'companyinformation',
  },
];

export const HUBSPOT_WRITEBACK_CONTACT_PROPERTIES: HubspotWritebackPropertyRequirement[] = [
  {
    objectType: 'contacts',
    name: 'canopi_contact_id',
    label: 'Canopi Contact ID',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: true,
    description: 'Identificador externo do contato gerado pela Canopi para writeback e upsert.',
    groupName: 'contactinformation',
  },
  {
    objectType: 'contacts',
    name: 'canopi_associated_company_id',
    label: 'Canopi Associated Company ID',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'ID Canopi da empresa associada ao contato no dry-run.',
    groupName: 'contactinformation',
  },
  {
    objectType: 'contacts',
    name: 'canopi_source',
    label: 'Canopi Source',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Origem do contato enviado ou preparado pela Canopi.',
    groupName: 'contactinformation',
  },
  {
    objectType: 'contacts',
    name: 'canopi_import_batch_id',
    label: 'Canopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Identificador do lote de importação/writeback preparado pela Canopi.',
    groupName: 'contactinformation',
  },
  {
    objectType: 'contacts',
    name: 'canopi_last_sync_at',
    label: 'Canopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    hasUniqueValue: false,
    description: 'Data/hora da última sincronização ou preparação de writeback pela Canopi.',
    groupName: 'contactinformation',
  },
  {
    objectType: 'contacts',
    name: 'canopi_simulated_fields',
    label: 'Canopi Simulated Fields',
    type: 'string',
    fieldType: 'textarea',
    hasUniqueValue: false,
    description: 'Campos que foram simulados/preenchidos pela Canopi para revisão.',
    groupName: 'contactinformation',
  },
];

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

export function parseHubspotScopes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((scope) => String(scope).trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    return raw
      .split(/[\s,]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
  }

  return [];
}

export function summarizeScopeState(required: string[], granted: string[]): HubspotWritebackSetupScopeState {
  const missing = required.filter((scope) => !granted.includes(scope));
  return {
    required,
    granted,
    missing,
    ready: missing.length === 0,
  };
}

function normalizeComparableValue(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.trim().toLowerCase();
}

function comparePropertyRequirement(
  requirement: HubspotWritebackPropertyRequirement,
  existing: HubspotWritebackPropertyRecord | null
): HubspotWritebackSetupPropertyState {
  if (!existing) {
    return {
      requirement,
      status: 'missing',
      message: 'Propriedade ausente no HubSpot.',
      existingGroupName: null,
      existingType: null,
      existingFieldType: null,
      existingHasUniqueValue: null,
      existingReadOnlyValue: false,
      existingReadOnlyDefinition: false,
      existingArchived: false,
      existingHidden: false,
    };
  }

  const existingType = readString(existing.type);
  const existingFieldType = readString(existing.fieldType);
  const existingGroupName = readString(existing.groupName);
  const existingHasUniqueValue = typeof existing.hasUniqueValue === 'boolean' ? existing.hasUniqueValue : null;
  const existingReadOnlyValue = readBoolean(existing.modificationMetadata?.readOnlyValue);
  const existingReadOnlyDefinition = readBoolean(existing.modificationMetadata?.readOnlyDefinition);
  const existingArchived = readBoolean(existing.archived);
  const existingHidden = readBoolean(existing.hidden);

  const incompatibilities: string[] = [];
  if (normalizeComparableValue(existingType) !== normalizeComparableValue(requirement.type)) {
    incompatibilities.push(`tipo ${existingType || '—'} incompatível com ${requirement.type}.`);
  }
  if (normalizeComparableValue(existingFieldType) !== normalizeComparableValue(requirement.fieldType)) {
    incompatibilities.push(`fieldType ${existingFieldType || '—'} incompatível com ${requirement.fieldType}.`);
  }
  if (requirement.hasUniqueValue && existingHasUniqueValue !== true) {
    incompatibilities.push('precisa ser único no HubSpot.');
  }
  if (existingReadOnlyValue || existingReadOnlyDefinition) {
    incompatibilities.push('a definição atual está marcada como somente leitura.');
  }
  if (existingArchived) {
    incompatibilities.push('a propriedade está arquivada.');
  }
  if (existingHidden) {
    incompatibilities.push('a propriedade está oculta no HubSpot.');
  }

  if (incompatibilities.length > 0) {
    return {
      requirement,
      status: 'incompatible',
      message: incompatibilities.join(' '),
      existingGroupName,
      existingType,
      existingFieldType,
      existingHasUniqueValue,
      existingReadOnlyValue,
      existingReadOnlyDefinition,
      existingArchived,
      existingHidden,
    };
  }

  const groupMismatch = existingGroupName && normalizeComparableValue(existingGroupName) !== normalizeComparableValue(requirement.groupName);
  return {
    requirement,
    status: 'ready',
    message: groupMismatch
      ? `Grupo atual ${existingGroupName} difere do grupo sugerido ${requirement.groupName}.`
      : 'Propriedade pronta para writeback.',
    existingGroupName,
    existingType,
    existingFieldType,
    existingHasUniqueValue,
    existingReadOnlyValue,
    existingReadOnlyDefinition,
    existingArchived,
    existingHidden,
  };
}

function buildObjectSummary(
  objectType: HubspotWritebackSetupObjectType,
  label: string,
  requirements: HubspotWritebackPropertyRequirement[],
  existingProperties: HubspotWritebackPropertyRecord[]
): HubspotWritebackSetupObjectSummary {
  const propertyIndex = new Map(
    existingProperties
      .filter((property) => typeof property.name === 'string' && property.name.trim().length > 0)
      .map((property) => [String(property.name).trim().toLowerCase(), property])
  );

  const properties = requirements.map((requirement) => {
    const existing = propertyIndex.get(requirement.name.trim().toLowerCase()) || null;
    return comparePropertyRequirement(requirement, existing);
  });

  const missing = properties.filter((property) => property.status === 'missing').map((property) => property.requirement.name);
  const incompatible = properties
    .filter((property) => property.status === 'incompatible')
    .map((property) => property.requirement.name);
  const uniqueReady = properties
    .filter((property) => property.requirement.hasUniqueValue)
    .every((property) => property.status === 'ready' && property.existingHasUniqueValue === true);

  return {
    objectType,
    label,
    ready: missing.length === 0 && incompatible.length === 0 && uniqueReady,
    uniqueReady,
    missing,
    incompatible,
    properties,
  };
}

function buildIssueList(
  objectType: HubspotWritebackSetupObjectType | 'scopes' | 'connection' | 'ids',
  summary: HubspotWritebackSetupObjectSummary
): HubspotWritebackSetupIssue[] {
  const issues: HubspotWritebackSetupIssue[] = [];

  summary.properties.forEach((property) => {
    if (property.status === 'missing') {
      issues.push({
        severity: 'pending',
        objectType,
        propertyName: property.requirement.name,
        title: `${property.requirement.label} ausente`,
        message: `${property.requirement.label} não existe no HubSpot e precisa ser criada.`,
      });
      return;
    }

    if (property.status === 'incompatible') {
      issues.push({
        severity: 'blocked',
        objectType,
        propertyName: property.requirement.name,
        title: `${property.requirement.label} incompatível`,
        message: `${property.requirement.label} existe, mas ${property.message}`,
      });
    }
  });

  return issues;
}

export function buildHubspotWritebackSetupResult(options: {
  hubId: string | null;
  scopes: string[];
  readAccessConfirmed: boolean;
  companiesProperties: HubspotWritebackPropertyRecord[];
  contactsProperties: HubspotWritebackPropertyRecord[];
  creationLog?: HubspotWritebackSetupActionLog[];
}): HubspotWritebackSetupResult {
  const { hubId, scopes, readAccessConfirmed, companiesProperties, contactsProperties, creationLog } = options;
  const schemaRead = summarizeScopeState([...HUBSPOT_WRITEBACK_SCOPE_REQUIREMENTS.schemaRead], scopes);
  const objectWrite = summarizeScopeState([...HUBSPOT_WRITEBACK_SCOPE_REQUIREMENTS.objectWrite], scopes);
  const schemaWrite = summarizeScopeState([...HUBSPOT_WRITEBACK_SCOPE_REQUIREMENTS.schemaWrite], scopes);

  const companies = buildObjectSummary('companies', 'Companies', HUBSPOT_WRITEBACK_COMPANY_PROPERTIES, companiesProperties);
  const contacts = buildObjectSummary('contacts', 'Contacts', HUBSPOT_WRITEBACK_CONTACT_PROPERTIES, contactsProperties);

  const issues: HubspotWritebackSetupIssue[] = [
    ...buildIssueList('companies', companies),
    ...buildIssueList('contacts', contacts),
  ];

  if (!schemaRead.ready) {
    schemaRead.missing.forEach((scope) => {
      issues.push({
        severity: 'blocked',
        objectType: 'scopes',
        scope,
        title: 'Escopo de leitura ausente',
        message: `Falta o escopo ${scope} para validar propriedades do setup.`,
      });
    });
  }

  if (!objectWrite.ready) {
    objectWrite.missing.forEach((scope) => {
      issues.push({
        severity: 'blocked',
        objectType: 'scopes',
        scope,
        title: 'Escopo de escrita ausente',
        message: `Falta o escopo ${scope} para liberar o writeback real.`,
      });
    });
  }

  if (!schemaWrite.ready) {
    schemaWrite.missing.forEach((scope) => {
      issues.push({
        severity: 'pending',
        objectType: 'scopes',
        scope,
        title: 'Escopo de criação de propriedades ausente',
        message: `Falta o escopo ${scope} para criar propriedades Canopi faltantes.`,
      });
    });
  }

  if (!readAccessConfirmed) {
    issues.push({
      severity: 'blocked',
      objectType: 'connection',
      title: 'Leitura de empresas indisponível',
      message: 'A conexão HubSpot não confirmou leitura de companies nesta sessão.',
    });
  }

  if (!companies.uniqueReady || !contacts.uniqueReady) {
    issues.push({
      severity: 'blocked',
      objectType: 'ids',
      title: 'IDs externos únicos incompletos',
      message: 'Os IDs externos Canopi precisam estar configurados como únicos no HubSpot.',
    });
  }

  const blockers = issues
    .filter((issue) => issue.severity === 'blocked')
    .map((issue) => issue.message);
  const warnings = issues
    .filter((issue) => issue.severity === 'pending')
    .map((issue) => issue.message);

  const ready = readAccessConfirmed && schemaRead.ready && objectWrite.ready && companies.ready && contacts.ready;
  const canCreateProperties = readAccessConfirmed
    && schemaRead.ready
    && schemaWrite.ready
    && [...companies.missing, ...contacts.missing].length > 0
    && companies.incompatible.length === 0
    && contacts.incompatible.length === 0;

  return {
    status: 'success',
    provider: 'hubspot',
    checkedAt: new Date().toISOString(),
    hubId,
    scopes,
    readAccessConfirmed,
    scopeSummary: {
      schemaRead,
      objectWrite,
      schemaWrite,
    },
    companies,
    contacts,
    issues,
    blockers,
    warnings,
    ready,
    canCreateProperties,
    creationLog,
  };
}

export function buildHubspotWritebackPropertyPayload(requirement: HubspotWritebackPropertyRequirement) {
  return {
    fieldType: requirement.fieldType,
    groupName: requirement.groupName,
    label: requirement.label,
    name: requirement.name,
    type: requirement.type,
    description: requirement.description,
    formField: false,
    hidden: false,
    externalOptions: false,
    hasUniqueValue: requirement.hasUniqueValue,
  };
}

export function summarizeHubspotWritebackProperties(result: HubspotWritebackSetupResult) {
  return [
    {
      objectType: 'companies' as const,
      label: 'Companies',
      ready: result.companies.ready,
      properties: result.companies.properties,
    },
    {
      objectType: 'contacts' as const,
      label: 'Contacts',
      ready: result.contacts.ready,
      properties: result.contacts.properties,
    },
  ];
}
