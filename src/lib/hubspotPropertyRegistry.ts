export type HubspotRegistryEntityType = 'company' | 'contact' | 'deal' | 'product';

export type HubspotPropertyType = 'string' | 'number' | 'enumeration' | 'date' | 'datetime' | 'bool';

export type HubspotPropertyFieldType = 'text' | 'textarea' | 'number' | 'select' | 'booleancheckbox' | 'date';

export type HubspotPropertyDirection =
  | 'canopi_to_hubspot'
  | 'bidirectional'
  | 'hubspot_to_canopi';

export type HubspotPropertyConflictRule =
  | 'block_on_diverge'
  | 'canopi_wins'
  | 'hubspot_wins'
  | 'latest_wins'
  | 'manual_review';

export interface HubspotRegistryPropertyOption {
  label: string;
  value: string;
}

export interface HubspotRegistryProperty {
  entityType: HubspotRegistryEntityType;
  internalName: string;
  hubspotName: string;
  label: string;
  type: HubspotPropertyType;
  fieldType: HubspotPropertyFieldType;
  required: boolean;
  blocking: boolean;
  direction: HubspotPropertyDirection;
  canopiOwned: boolean;
  canReturnFromHubSpot: boolean;
  conflictRule: HubspotPropertyConflictRule;
  description: string;
  contractVersion: string;
  options?: HubspotRegistryPropertyOption[];
}

export interface HubspotPropertyRegistryValidationResult {
  valid: boolean;
  entityTypes: HubspotRegistryEntityType[];
  totalProperties: number;
  missingBlocking: string[];
  warnings: string[];
}

const CONTRACT_VERSION = 'c2.9e.2d.8';

const SYNC_STATUS_OPTIONS: HubspotRegistryPropertyOption[] = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Ativo', value: 'active' },
  { label: 'Com conflito', value: 'conflicted' },
  { label: 'Bloqueado', value: 'blocked' },
  { label: 'Arquivado', value: 'archived' },
];

export const HUBSPOT_PROPERTY_REGISTRY: HubspotRegistryProperty[] = [
  // ── COMPANY ──────────────────────────────────────────────────────────────

  // Identity — blocking
  {
    entityType: 'company',
    internalName: 'canopi_canonical_id',
    hubspotName: 'canopi_canonical_id',
    label: 'Knopi Canonical ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'UUID canônico da account na Knopi (accounts.id). Imutável após inserção.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_company_id',
    hubspotName: 'canopi_company_id',
    label: 'Knopi Company ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'ID externo da empresa gerado deterministicamente pela Knopi (hash de nome+domínio). Deve ser único no HubSpot.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_tenant_id',
    hubspotName: 'canopi_tenant_id',
    label: 'Knopi Tenant ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'Identificador do tenant/organização Knopi. Bloqueia operação se divergir.',
    contractVersion: CONTRACT_VERSION,
  },

  // Metadata — not blocking
  {
    entityType: 'company',
    internalName: 'canopi_import_batch_id',
    hubspotName: 'canopi_import_batch_id',
    label: 'Knopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Identificador do lote de importação. Sobrescrito apenas em nova carga limpa.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_contract_version',
    hubspotName: 'canopi_contract_version',
    label: 'Knopi Contract Version',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Versão do contrato de identidade usado na carga. Referência de auditoria.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_sync_status',
    hubspotName: 'canopi_sync_status',
    label: 'Knopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'bidirectional',
    canopiOwned: false,
    canReturnFromHubSpot: true,
    conflictRule: 'canopi_wins',
    description: 'Status de sincronização do registro. Pode ser atualizado bidirecionalmente.',
    contractVersion: CONTRACT_VERSION,
    options: SYNC_STATUS_OPTIONS,
  },
  {
    entityType: 'company',
    internalName: 'canopi_last_synced_at',
    hubspotName: 'canopi_last_sync_at',
    label: 'Knopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Timestamp ISO 8601 da última sincronização bem-sucedida.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_source',
    hubspotName: 'canopi_source',
    label: 'Knopi Source',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Origem do registro na Knopi (ex: salesforce_sync, manual_import).',
    contractVersion: CONTRACT_VERSION,
  },

  // Enrichment
  {
    entityType: 'company',
    internalName: 'canopi_icp_tier',
    hubspotName: 'canopi_icp_tier',
    label: 'Knopi ICP Tier',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Nível ICP da account conforme modelo da Knopi.',
    contractVersion: CONTRACT_VERSION,
    options: [
      { label: 'Tier 1 — ICP Core', value: 'tier_1' },
      { label: 'Tier 2 — ICP Expandido', value: 'tier_2' },
      { label: 'Tier 3 — Adjacente', value: 'tier_3' },
      { label: 'Fora do ICP', value: 'out_of_icp' },
    ],
  },
  {
    entityType: 'company',
    internalName: 'canopi_segment',
    hubspotName: 'canopi_segment',
    label: 'Knopi Segment',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Segmento de mercado da account conforme classificação Knopi.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'company',
    internalName: 'canopi_account_score',
    hubspotName: 'canopi_account_score',
    label: 'Knopi Account Score',
    type: 'number',
    fieldType: 'number',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Score quantitativo da account calculado pela Knopi.',
    contractVersion: CONTRACT_VERSION,
  },

  // ── CONTACT ──────────────────────────────────────────────────────────────

  // Identity — blocking
  {
    entityType: 'contact',
    internalName: 'canopi_canonical_id',
    hubspotName: 'canopi_canonical_id',
    label: 'Knopi Canonical ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'UUID canônico do contact na Knopi (contacts.id). Imutável após inserção.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_contact_id',
    hubspotName: 'canopi_contact_id',
    label: 'Knopi Contact ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'ID externo do contact gerado deterministicamente pela Knopi. Deve ser único no HubSpot.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_tenant_id',
    hubspotName: 'canopi_tenant_id',
    label: 'Knopi Tenant ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'Identificador do tenant/organização Knopi. Bloqueia operação se divergir.',
    contractVersion: CONTRACT_VERSION,
  },

  // Metadata — not blocking
  {
    entityType: 'contact',
    internalName: 'canopi_associated_company_id',
    hubspotName: 'canopi_associated_company_id',
    label: 'Knopi Associated Company ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'ID Knopi da company associada ao contact. Não editar no HubSpot.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_import_batch_id',
    hubspotName: 'canopi_import_batch_id',
    label: 'Knopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Identificador do lote de importação.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_contract_version',
    hubspotName: 'canopi_contract_version',
    label: 'Knopi Contract Version',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Versão do contrato de identidade.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_sync_status',
    hubspotName: 'canopi_sync_status',
    label: 'Knopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'bidirectional',
    canopiOwned: false,
    canReturnFromHubSpot: true,
    conflictRule: 'canopi_wins',
    description: 'Status de sincronização do contact.',
    contractVersion: CONTRACT_VERSION,
    options: SYNC_STATUS_OPTIONS,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_last_synced_at',
    hubspotName: 'canopi_last_sync_at',
    label: 'Knopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Timestamp ISO 8601 da última sincronização.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_source',
    hubspotName: 'canopi_source',
    label: 'Knopi Source',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Origem do contact na Knopi.',
    contractVersion: CONTRACT_VERSION,
  },

  // Enrichment
  {
    entityType: 'contact',
    internalName: 'canopi_contact_role',
    hubspotName: 'canopi_contact_role',
    label: 'Knopi Contact Role',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Papel funcional do contact no contexto comercial Knopi.',
    contractVersion: CONTRACT_VERSION,
    options: [
      { label: 'Decisor', value: 'decision_maker' },
      { label: 'Influenciador', value: 'influencer' },
      { label: 'Champion', value: 'champion' },
      { label: 'Blocker', value: 'blocker' },
      { label: 'Usuário Final', value: 'end_user' },
      { label: 'Técnico', value: 'technical' },
      { label: 'Indefinido', value: 'unknown' },
    ],
  },
  {
    entityType: 'contact',
    internalName: 'canopi_engagement_score',
    hubspotName: 'canopi_engagement_score',
    label: 'Knopi Engagement Score',
    type: 'number',
    fieldType: 'number',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Score de engajamento do contact calculado pela Knopi.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'contact',
    internalName: 'canopi_buying_committee_role',
    hubspotName: 'canopi_buying_committee_role',
    label: 'Knopi Buying Committee Role',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Papel do contact no buying committee da account.',
    contractVersion: CONTRACT_VERSION,
    options: [
      { label: 'Líder do Comitê', value: 'committee_lead' },
      { label: 'Avaliador Técnico', value: 'technical_evaluator' },
      { label: 'Aprovador Financeiro', value: 'financial_approver' },
      { label: 'Usuário-chave', value: 'key_user' },
      { label: 'Fora do comitê', value: 'non_committee' },
    ],
  },

  // ── DEAL ─────────────────────────────────────────────────────────────────

  // Identity — blocking
  {
    entityType: 'deal',
    internalName: 'canopi_canonical_id',
    hubspotName: 'canopi_canonical_id',
    label: 'Knopi Canonical ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'UUID canônico da oportunidade na Knopi. Imutável após inserção.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_opportunity_id',
    hubspotName: 'canopi_opportunity_id',
    label: 'Knopi Opportunity ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'ID externo da oportunidade gerado pela Knopi. Deve ser único no HubSpot.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_tenant_id',
    hubspotName: 'canopi_tenant_id',
    label: 'Knopi Tenant ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'Identificador do tenant/organização Knopi.',
    contractVersion: CONTRACT_VERSION,
  },

  // Metadata — not blocking
  {
    entityType: 'deal',
    internalName: 'canopi_import_batch_id',
    hubspotName: 'canopi_import_batch_id',
    label: 'Knopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Identificador do lote de importação.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_contract_version',
    hubspotName: 'canopi_contract_version',
    label: 'Knopi Contract Version',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Versão do contrato de identidade.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_sync_status',
    hubspotName: 'canopi_sync_status',
    label: 'Knopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'bidirectional',
    canopiOwned: false,
    canReturnFromHubSpot: true,
    conflictRule: 'canopi_wins',
    description: 'Status de sincronização do deal.',
    contractVersion: CONTRACT_VERSION,
    options: SYNC_STATUS_OPTIONS,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_last_synced_at',
    hubspotName: 'canopi_last_sync_at',
    label: 'Knopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Timestamp ISO 8601 da última sincronização.',
    contractVersion: CONTRACT_VERSION,
  },

  // Enrichment
  {
    entityType: 'deal',
    internalName: 'canopi_stage_canonical',
    hubspotName: 'canopi_stage_canonical',
    label: 'Knopi Stage Canonical',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Estágio canônico da oportunidade no modelo Knopi (ex: prospecting, qualified, closed_won).',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'deal',
    internalName: 'canopi_forecast_category',
    hubspotName: 'canopi_forecast_category',
    label: 'Knopi Forecast Category',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Categoria de forecast da oportunidade conforme modelo Knopi.',
    contractVersion: CONTRACT_VERSION,
    options: [
      { label: 'Pipeline', value: 'pipeline' },
      { label: 'Best Case', value: 'best_case' },
      { label: 'Commit', value: 'commit' },
      { label: 'Closed Won', value: 'closed_won' },
      { label: 'Omitido', value: 'omitted' },
    ],
  },
  {
    entityType: 'deal',
    internalName: 'canopi_opportunity_score',
    hubspotName: 'canopi_opportunity_score',
    label: 'Knopi Opportunity Score',
    type: 'number',
    fieldType: 'number',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Score quantitativo da oportunidade calculado pela Knopi.',
    contractVersion: CONTRACT_VERSION,
  },

  // ── PRODUCT ──────────────────────────────────────────────────────────────
  // Service é tratado como Product com canopi_product_type = 'service'.

  // Identity — blocking
  {
    entityType: 'product',
    internalName: 'canopi_canonical_id',
    hubspotName: 'canopi_canonical_id',
    label: 'Knopi Canonical ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'UUID canônico do produto/serviço na Knopi. Imutável após inserção.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'product',
    internalName: 'canopi_product_id',
    hubspotName: 'canopi_product_id',
    label: 'Knopi Product ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'ID externo do produto/serviço gerado pela Knopi. Deve ser único no HubSpot.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'product',
    internalName: 'canopi_tenant_id',
    hubspotName: 'canopi_tenant_id',
    label: 'Knopi Tenant ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: true,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'block_on_diverge',
    description: 'Identificador do tenant/organização Knopi.',
    contractVersion: CONTRACT_VERSION,
  },

  // Metadata — not blocking
  {
    entityType: 'product',
    internalName: 'canopi_import_batch_id',
    hubspotName: 'canopi_import_batch_id',
    label: 'Knopi Import Batch ID',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Identificador do lote de importação.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'product',
    internalName: 'canopi_contract_version',
    hubspotName: 'canopi_contract_version',
    label: 'Knopi Contract Version',
    type: 'string',
    fieldType: 'text',
    required: true,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Versão do contrato de identidade.',
    contractVersion: CONTRACT_VERSION,
  },
  {
    entityType: 'product',
    internalName: 'canopi_sync_status',
    hubspotName: 'canopi_sync_status',
    label: 'Knopi Sync Status',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'bidirectional',
    canopiOwned: false,
    canReturnFromHubSpot: true,
    conflictRule: 'canopi_wins',
    description: 'Status de sincronização do produto/serviço.',
    contractVersion: CONTRACT_VERSION,
    options: SYNC_STATUS_OPTIONS,
  },
  {
    entityType: 'product',
    internalName: 'canopi_last_synced_at',
    hubspotName: 'canopi_last_sync_at',
    label: 'Knopi Last Sync At',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Timestamp ISO 8601 da última sincronização.',
    contractVersion: CONTRACT_VERSION,
  },

  // Enrichment
  {
    entityType: 'product',
    internalName: 'canopi_product_type',
    hubspotName: 'canopi_product_type',
    label: 'Knopi Product Type',
    type: 'enumeration',
    fieldType: 'select',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Tipo do produto/serviço no catálogo Knopi. Serviços usam valor service.',
    contractVersion: CONTRACT_VERSION,
    options: [
      { label: 'Produto', value: 'product' },
      { label: 'Serviço', value: 'service' },
      { label: 'Add-on', value: 'addon' },
      { label: 'Licença', value: 'license' },
    ],
  },
  {
    entityType: 'product',
    internalName: 'canopi_solution_family',
    hubspotName: 'canopi_solution_family',
    label: 'Knopi Solution Family',
    type: 'string',
    fieldType: 'text',
    required: false,
    blocking: false,
    direction: 'canopi_to_hubspot',
    canopiOwned: true,
    canReturnFromHubSpot: false,
    conflictRule: 'canopi_wins',
    description: 'Família de solução à qual o produto/serviço pertence no portfólio Knopi.',
    contractVersion: CONTRACT_VERSION,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

export function getHubspotPropertiesByEntity(entityType: HubspotRegistryEntityType): HubspotRegistryProperty[] {
  return HUBSPOT_PROPERTY_REGISTRY.filter((p) => p.entityType === entityType);
}

export function getBlockingHubspotProperties(entityType: HubspotRegistryEntityType): HubspotRegistryProperty[] {
  return HUBSPOT_PROPERTY_REGISTRY.filter((p) => p.entityType === entityType && p.blocking);
}

export function getRequiredHubspotProperties(entityType: HubspotRegistryEntityType): HubspotRegistryProperty[] {
  return HUBSPOT_PROPERTY_REGISTRY.filter((p) => p.entityType === entityType && p.required);
}

export function isRegisteredHubspotProperty(entityType: HubspotRegistryEntityType, hubspotName: string): boolean {
  const normalized = hubspotName.trim().toLowerCase();
  return HUBSPOT_PROPERTY_REGISTRY.some(
    (p) => p.entityType === entityType && p.hubspotName.toLowerCase() === normalized,
  );
}

export function validateHubspotPropertyRegistry(): HubspotPropertyRegistryValidationResult {
  const entityTypes: HubspotRegistryEntityType[] = ['company', 'contact', 'deal', 'product'];
  const missingBlocking: string[] = [];
  const warnings: string[] = [];

  for (const entityType of entityTypes) {
    const props = getHubspotPropertiesByEntity(entityType);

    if (props.length === 0) {
      missingBlocking.push(`${entityType}: sem propriedades registradas`);
      continue;
    }

    if (!props.some((p) => p.internalName === 'canopi_canonical_id')) {
      missingBlocking.push(`${entityType}: canopi_canonical_id ausente`);
    }
    if (!props.some((p) => p.internalName === 'canopi_tenant_id')) {
      missingBlocking.push(`${entityType}: canopi_tenant_id ausente`);
    }
    if (!props.some((p) => p.internalName === 'canopi_contract_version')) {
      warnings.push(`${entityType}: canopi_contract_version ausente`);
    }
    if (!props.some((p) => p.internalName === 'canopi_import_batch_id')) {
      warnings.push(`${entityType}: canopi_import_batch_id ausente`);
    }
  }

  return {
    valid: missingBlocking.length === 0,
    entityTypes,
    totalProperties: HUBSPOT_PROPERTY_REGISTRY.length,
    missingBlocking,
    warnings,
  };
}
