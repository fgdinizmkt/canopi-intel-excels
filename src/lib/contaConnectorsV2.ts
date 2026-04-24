/**
 * Conta Connectors V2 — Corrected Architecture
 * SEPARATES: FATO DO CRM | PRESET CANOPI | COMPORTAMENTO CONFIGURÁVEL
 * Source: 'fact' | 'recommendation' | 'custom'
 */

export interface ConnectorIdentity {
  nativePrimaryKey: string; // FACT: what's native in the CRM
  nativeSecondaryKeys?: string[]; // FACT: alternative native IDs
  chosenPrimaryKey: string; // CONFIGURATION: user's choice
  chosenSecondaryKey?: string; // CONFIGURATION: user's choice
  dedupeStrategy: 'primary_only' | 'primary_secondary' | 'primary_domain' | 'primary_email' | 'custom';
  recommendedPrimaryKey: string; // RECOMMENDATION: Canopi suggestion
  recommendedDedupeStrategy: string; // RECOMMENDATION: Canopi suggestion
  confidenceScore: number; // 0-100: How reliable is this source's identity?
  notes?: string;
}

export interface FieldMapping {
  nativeField: string; // CRM field name
  canonicalField: string; // Canopi field name
  dataType: string;
  required: boolean;
  source: 'fact' | 'recommendation' | 'custom' | 'canopi'; // SOURCE CLASSIFICATION
  isCanonicalMinimum: boolean; // FACT: blocks deletion?
  policy: 'overwrite' | 'append' | 'manual_review';
  status: 'pending' | 'mapped' | 'error';
  errorMessage?: string;
  notes?: string;
  // Metadata for Scaling Units
  isClassification?: boolean;
  isWriteback?: boolean;
  origin?: 'source' | 'canopi' | 'override';
}

export interface ConnectorInstructions {
  factsAboutConnector: string[]; // Immutable facts about this CRM
  whatMustExist: string[]; // Prerequisites (API keys, permissions, etc)
  publishBlockers: string[]; // Explicit blockers (not suggestions)
  recommendations: string[]; // Canopi suggestions
  traceabilityFields?: string[];
  traceabilityExample?: string;
  lgpdInstructions?: string[];
}

export interface ConnectorPreset {
  id: string;
  name: string;
  nativeObject: string;
  identity: ConnectorIdentity;
  requiredFields: string[]; // Native fields that are mandatory
  fieldMappings: FieldMapping[];
  conflictPolicy: 'overwrite' | 'append' | 'manual_review';
  supportsWriteback: boolean;
  writebackTargets: string[]; // Which native fields can receive writeback
  lgpdRisk: 'low' | 'medium' | 'high';
  affectedSections: string[];
  possibleBlockers: string[];
  isComplete: boolean;
  instructions: ConnectorInstructions;
  validationStatus: 'valid' | 'warning' | 'error';
  validationErrors?: string[];
}

// ============ CLASSIFICATION OPTIONS ============
export const CLASSIFICATION_OPTIONS = {
  account_operating_mode: ['generic', 'abm', 'abx'],
  targeting_status: ['not_targeted', 'candidate', 'targeted', 'orchestrated'],
  abm_tier: ['none', 'tier_3', 'tier_2', 'tier_1', 'strategic'],
  abx_stage: ['none', 'aware', 'engaged', 'discovery', 'evaluation', 'negotiation', 'expansion'],
  orchestration_status: ['idle', 'monitoring', 'play_active', 'multi_threading', 'expansion_motion']
};

// ============ CANONICAL FIELDS FOR CONTA ============
export const CONTA_CANONICAL_FIELDS_MINIMUM = [
  'external_account_id',
  'canonical_name',
  'primary_domain',
  'account_owner',
  'account_operating_mode',
  'targeting_status',
  'abm_tier',
  'abx_stage'
];

export const CONTA_CANONICAL_FIELDS_FULL = [
  ...CONTA_CANONICAL_FIELDS_MINIMUM,
  'ticker_symbol',
  'linkedin_url',
  'crunchbase_id',
  'partner_status',
  'customer_status',
  'created_at',
  'updated_at',
  'upload_date',
  'upload_batch_id'
];

// ============ SALESFORCE ============
export const SALESFORCE_PRESET: ConnectorPreset = {
  id: 'salesforce',
  name: 'Salesforce',
  identity: {
    nativePrimaryKey: 'Id',
    nativeSecondaryKeys: ['AccountNumber', 'ExternalId__c', 'Name'],
    chosenPrimaryKey: 'Id',
    chosenSecondaryKey: 'AccountNumber',
    dedupeStrategy: 'primary_only',
    recommendedPrimaryKey: 'Id',
    recommendedDedupeStrategy: 'primary_only',
    confidenceScore: 98,
    notes: 'FATO: Salesforce uses 18-char Id as native PK. OPÇÃO: use AccountNumber se numerado ou ExternalId__c se customizado. FALLBACK: Name + BillingCity se ID indisponível.',
  },
  fieldMappings: [
    { nativeField: 'Id', canonicalField: 'external_account_id', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', notes: 'FATO: Salesforce primary key', origin: 'source' },
    { nativeField: 'Name', canonicalField: 'canonical_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', notes: 'FATO: Business Name', origin: 'source' },
    { nativeField: 'Name', canonicalField: 'legal_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'Website', canonicalField: 'primary_domain', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'AccountNumber', canonicalField: 'tax_id', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'OwnerId', canonicalField: 'account_owner', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'Type', canonicalField: 'account_status', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'Industry', canonicalField: 'industry', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'BillingCity', canonicalField: 'billing_city', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'BillingState', canonicalField: 'billing_state', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'BillingCountry', canonicalField: 'billing_country', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'ParentId', canonicalField: 'parent_account_external_id', dataType: 'string', required: false, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    // Classification fields
    { nativeField: 'Type', canonicalField: 'account_operating_mode', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'Rating', canonicalField: 'targeting_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'Tier__c', canonicalField: 'abm_tier', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'Stage__c', canonicalField: 'abx_stage', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'Status__c', canonicalField: 'orchestration_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true }
  ],
  instructions: {
    factsAboutConnector: [
      'Salesforce é relacional: Account é tabela base com Id (18 char)',
      'AccountNumber é campo opcional; customized fields via __c suffix',
      'BillingCity, BillingCountry, Industry são campos padrão',
      'O mapeamento default requer revisão manual obrigatória',
    ],
    whatMustExist: [
      'Salesforce API enabled',
      'Connected App com OAuth 2.0',
      'Permissions: crm.objects.accounts.read',
    ],
    publishBlockers: [
      'API credentials não validadas',
      'Campo Id não mapeado',
      'Revisão manual do field mapping não confirmada',
      'PK escolhida ausente no mapping',
    ],
    recommendations: [
      'Use Id como Primary Key nativa',
      'Mapeie AccountNumber se for seu identificador de ERP',
      'Habilite Writeback para os campos de classificação ABM/ABX',
    ],
    lgpdInstructions: [
      'Mapeie o campo de Base Legal (Legal Basis) do Salesforce se aplicável',
      'Campos de Opt-out do Salesforce devem ser respeitados no processamento',
    ]
  },
  nativeObject: 'Account',
  requiredFields: ['Id', 'Name', 'OwnerId'],
  conflictPolicy: 'manual_review',
  supportsWriteback: true,
  writebackTargets: ['Type', 'Rating', 'Tier__c', 'Stage__c', 'Status__c'],
  lgpdRisk: 'medium',
  affectedSections: ['fontes', 'identidade', 'canonica', 'writeback', 'upload'],
  possibleBlockers: ['CONECTOR_MISSING', 'IDENTITY_CONFLICT'],
  isComplete: true,
  validationStatus: 'valid',
};

// ============ HUBSPOT ============
export const HUBSPOT_PRESET: ConnectorPreset = {
  id: 'hubspot',
  name: 'HubSpot',
  identity: {
    nativePrimaryKey: 'hs_object_id',
    nativeSecondaryKeys: ['domain', 'name'],
    chosenPrimaryKey: 'domain',
    chosenSecondaryKey: 'hs_object_id',
    dedupeStrategy: 'primary_secondary',
    recommendedPrimaryKey: 'domain',
    recommendedDedupeStrategy: 'primary_secondary',
    confidenceScore: 92,
    notes: 'FATO: domain é field nativo em HubSpot e é altamente dedupável. OPÇÃO: h_object_id como fallback numérico.',
  },
  fieldMappings: [
    { nativeField: 'hs_object_id', canonicalField: 'external_account_id', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'name', canonicalField: 'canonical_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'domain', canonicalField: 'primary_domain', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'hubspot_owner_id', canonicalField: 'account_owner', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'lifecyclestage', canonicalField: 'lifecycle_stage', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'industry', canonicalField: 'industry', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'city', canonicalField: 'billing_city', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'state', canonicalField: 'billing_state', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'country', canonicalField: 'billing_country', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    // Classification
    { nativeField: 'lifecyclestage', canonicalField: 'account_operating_mode', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'hs_lead_status', canonicalField: 'targeting_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'tier', canonicalField: 'abm_tier', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'abx_stage', canonicalField: 'abx_stage', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'orchestration_status', canonicalField: 'orchestration_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true }
  ],
  instructions: {
    factsAboutConnector: [
      'HubSpot Companies: hs_object_id é numeric mas domain é o campo de dedupe mestre',
      'lifecyclestage e hs_lead_status são campos core de jornada',
    ],
    whatMustExist: [
      'HubSpot Private App Token',
      'Permissions: crm.objects.companies.read / write',
    ],
    publishBlockers: [
      'Private App Token inválido',
      'Domain não mapeado',
      'Campo native name não mapeado',
    ],
    recommendations: [
      'Use domain como PK principal',
      'Habilite o mapping de lifecyclestage para Account Operating Mode',
    ],
    lgpdInstructions: [
      'Mapeie Legal Basis for Processing do HubSpot',
      'Sincronize status de Subscrição se houver fluxos de marketing',
    ]
  },
  nativeObject: 'Company',
  requiredFields: ['hs_object_id', 'domain', 'name'],
  conflictPolicy: 'overwrite',
  supportsWriteback: true,
  writebackTargets: ['lifecyclestage', 'hs_lead_status', 'tier', 'abx_stage', 'orchestration_status'],
  lgpdRisk: 'low',
  affectedSections: ['fontes', 'identidade', 'canonica', 'writeback', 'upload'],
  possibleBlockers: ['CONECTOR_MISSING', 'IDENTITY_CONFLICT'],
  isComplete: true,
  validationStatus: 'valid',
};

// ============ RD STATION ============
export const RD_STATION_PRESET: ConnectorPreset = {
  id: 'rd_station',
  name: 'RD Station CRM',
  identity: {
    nativePrimaryKey: 'id',
    nativeSecondaryKeys: ['website', 'legal_entity'],
    chosenPrimaryKey: 'id',
    chosenSecondaryKey: 'website',
    dedupeStrategy: 'primary_secondary',
    recommendedPrimaryKey: 'id',
    recommendedDedupeStrategy: 'primary_secondary',
    confidenceScore: 85,
  },
  fieldMappings: [
    { nativeField: 'id', canonicalField: 'external_account_id', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'name', canonicalField: 'canonical_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'website', canonicalField: 'primary_domain', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'legal_entity', canonicalField: 'tax_id', dataType: 'string', required: false, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'user_id', canonicalField: 'account_owner', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    // Classification
    { nativeField: 'stage', canonicalField: 'account_operating_mode', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'status', canonicalField: 'targeting_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'tier', canonicalField: 'abm_tier', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'abx_stage', canonicalField: 'abx_stage', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true },
    { nativeField: 'orchestration_status', canonicalField: 'orchestration_status', dataType: 'string', required: true, source: 'canopi', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', isClassification: true, origin: 'canopi', isWriteback: true }
  ],
  instructions: {
    factsAboutConnector: [
      'RD CRM é baseado em organizações com CNPJ (legal_entity)',
      'website URL deve ser limpa para extração de domínio',
    ],
    whatMustExist: [
      'RD CRM API Token',
    ],
    publishBlockers: [
      'Token inválido',
      'Legal Entity (CNPJ) não mapeado como secondary key (opcional mas recomendado)',
    ],
    recommendations: [
      'Use website como campo de dedupe mestre',
    ],
  },
  nativeObject: 'Organization',
  requiredFields: ['id', 'name', 'website'],
  conflictPolicy: 'append',
  supportsWriteback: true,
  writebackTargets: ['stage', 'status', 'tier', 'abx_stage', 'orchestration_status'],
  lgpdRisk: 'low',
  affectedSections: ['fontes', 'identidade', 'canonica', 'writeback', 'upload'],
  possibleBlockers: ['CONECTOR_MISSING', 'IDENTITY_CONFLICT'],
  isComplete: true,
  validationStatus: 'valid',
};

// ============ CSV UPLOAD ============
export const CSV_UPLOAD_PRESET: ConnectorPreset = {
  id: 'csv_upload',
  name: 'Upload CSV (Batch)',
  identity: {
    nativePrimaryKey: 'row_index',
    nativeSecondaryKeys: ['email', 'domain'],
    chosenPrimaryKey: 'row_index',
    dedupeStrategy: 'custom',
    recommendedPrimaryKey: 'row_index',
    recommendedDedupeStrategy: 'primary_domain',
    confidenceScore: 65,
    notes: 'FATO: CSV não tem ID nativo. RASTREABILIDADE: filename + index é o PK de fato para auditoria.',
  },
  fieldMappings: [
    { nativeField: 'row_index', canonicalField: 'source_record_url', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'mapped', origin: 'source' },
    { nativeField: 'empresa', canonicalField: 'canonical_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'website', canonicalField: 'primary_domain', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'cnpj', canonicalField: 'tax_id', dataType: 'string', required: false, source: 'recommendation', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    // LGPD MANDATORY
    { nativeField: 'base_legal', canonicalField: 'source_system', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', notes: 'Indique a base legal LGPD (ex: Legítimo Interesse)', origin: 'override' },
  ],
  instructions: {
    factsAboutConnector: [
      'Batch Upload requer rastreabilidade de origem e data',
      'Cada linha deve ser validada contra duplicatas no CRM mestre',
    ],
    whatMustExist: [
      'Arquivo CSV UTF-8',
      'Cabeçalho obrigatório',
    ],
    publishBlockers: [
      'Ausência de Base Legal (LGPD Check)',
      'Ausência de campo de Nome ou Domínio',
      'PK de rastreabilidade (row_index) não mapeada',
    ],
    recommendations: [
      'Baixe o template canônico antes de subir',
      'Valide CPFs/CNPJs se presentes',
    ],
    lgpdInstructions: [
      'Obrigatório declarar a finalidade do processamento (Art. 6, I LGPD)',
      'A base legal deve ser explicitada para cada batch de upload',
    ]
  },
  nativeObject: 'Batch Record',
  requiredFields: ['row_index', 'empresa', 'website', 'base_legal'],
  conflictPolicy: 'manual_review',
  supportsWriteback: false,
  writebackTargets: [],
  lgpdRisk: 'high',
  affectedSections: ['fontes', 'upload'],
  possibleBlockers: ['CONECTOR_MISSING', 'LGPD_LEGAL_BASIS_MISSING'],
  isComplete: false,
  validationStatus: 'warning',
};

// ============ OTHER CRM ============
export const OTHER_CRM_PRESET: ConnectorPreset = {
  id: 'other_crm',
  name: 'Outro CRM',
  identity: {
    nativePrimaryKey: 'id',
    chosenPrimaryKey: 'id',
    dedupeStrategy: 'primary_only',
    recommendedPrimaryKey: 'id',
    recommendedDedupeStrategy: 'primary_only',
    confidenceScore: 50,
  },
  fieldMappings: [
    { nativeField: 'id', canonicalField: 'external_account_id', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
    { nativeField: 'name', canonicalField: 'canonical_name', dataType: 'string', required: true, source: 'fact', isCanonicalMinimum: true, policy: 'overwrite', status: 'pending', origin: 'source' },
  ],
  instructions: {
    factsAboutConnector: ['Custom setup — defina sua própria PK'],
    whatMustExist: ['API ou Database Access'],
    publishBlockers: ['Falha na conexão de teste', 'Mapeamento ID/Name ausente'],
    recommendations: ['Siga o padrão de campos canônicos Canopi'],
  },
  nativeObject: '',
  requiredFields: [],
  conflictPolicy: 'manual_review',
  supportsWriteback: true,
  writebackTargets: [],
  lgpdRisk: 'medium',
  affectedSections: ['fontes', 'identidade', 'canonica', 'writeback', 'upload'],
  possibleBlockers: ['CUSTOM_CONNECTOR_INCOMPLETE'],
  isComplete: false,
  validationStatus: 'warning',
};

export type ConnectorType = 'salesforce' | 'hubspot' | 'rd_station' | 'other_crm' | 'csv_upload';

export const CONNECTOR_PRESETS: Record<ConnectorType, ConnectorPreset> = {
  salesforce: SALESFORCE_PRESET,
  hubspot: HUBSPOT_PRESET,
  rd_station: RD_STATION_PRESET,
  other_crm: OTHER_CRM_PRESET,
  csv_upload: CSV_UPLOAD_PRESET,
};
