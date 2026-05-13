import type { HubSpotCompanyPopulationClass } from '@/src/lib/accountConnectionModel';

export interface HubspotCompanyPropertyOption {
  label: string;
  value: string;
  displayOrder: number | null;
  hidden: boolean;
}

export interface HubspotCompanyPropertyOptionSource {
  label?: string;
  value?: string;
  displayOrder?: number | null;
  hidden?: boolean;
}

export interface HubspotCompanyPropertySource {
  name?: string;
  label?: string;
  description?: string;
  groupName?: string;
  type?: string;
  fieldType?: string;
  formField?: boolean;
  hidden?: boolean;
  archived?: boolean;
  calculated?: boolean;
  externalOptions?: boolean;
  readOnlyDefinition?: boolean;
  readOnlyValue?: boolean;
  hasUniqueValue?: boolean;
  createdAt?: string;
  updatedAt?: string;
  referencedObjectType?: string;
  options?: HubspotCompanyPropertyOptionSource[];
}

export interface HubspotCompanyPropertyClassificationResult {
  canopiPopulationClass: HubSpotCompanyPopulationClass;
  canopiPopulationReason: string;
}

const POPULATE_NOW = new Set(['name', 'domain', 'country', 'website']);

const POPULATE_IF_AVAILABLE = new Set([
  'about_us',
  'address',
  'address2',
  'annualrevenue',
  'city',
  'description',
  'founded_year',
  'hs_country_code',
  'hs_employee_range',
  'hs_industry_group',
  'hs_linkedin_handle',
  'hs_revenue_range',
  'hs_state_code',
  'hubspot_owner_id',
  'numberofemployees',
  'phone',
  'state',
  'total_money_raised',
  'zip',
]);

const OPTION_FIELD_REVIEW = new Set([
  'industry',
  'lifecyclestage',
  'type',
  'hs_csm_sentiment',
  'hs_keywords',
]);

const SYSTEM_ID_OR_TIMESTAMP_PATTERNS = [
  /^createdate$/,
  /^hs_createdate$/,
  /^hs_lastmodifieddate$/,
  /^hs_object_id$/,
  /^hs_created_by_user_id$/,
  /^hs_updated_by_user_id$/,
  /^hubspot_owner_assigneddate$/,
  /^hubspot_team_id$/,
  /^hs_object_source/,
  /^hs_source_object_id$/,
  /^hs_parent_company_id$/,
  /^hs_last_sales_activity_date$/,
  /^hs_last_sales_activity_type$/,
  /^hs_latest_.*timestamp/,
  /^hs_latest_.*/i,
  /^hs_count_.*/i,
  /^hs_num_.*/i,
  /^hs_v2_.*/i,
  /^hs_date_entered_.*/i,
  /^hs_date_exited_.*/i,
  /^hs_time_in_.*/i,
  /^hs_analytics_.*/i,
  /^hs_intent_.*/i,
  /^hs_searchable_calculated_.*/i,
  /^hs_calculated_.*/i,
  /^hs_read_only$/,
  /^hs_merged_object_ids$/,
  /^hs_suggested_contact_count$/,
  /^hs_total_deal_value$/,
  /^hs_predictivecontactscore_v2$/,
  /^hs_predictivecontactscore_v2_next_.*/i,
  /^hs_research_agent_.*/i,
  /^hs_task_label$/,
  /^hs_target_account_.*/i,
  /^hs_paid_for_intent_signals$/,
  /^hs_is_intent_monitored$/,
  /^hs_is_enriched$/,
  /^hs_lead_status$/,
  /^hs_current_customer$/,
  /^hs_ideal_customer_profile$/,
  /^hs_plays$/,
  /^hs_reason_to_reach_out$/,
  /^hs_gps_.*/i,
  /^hs_geohash_.*/i,
  /^hs_live_enrichment_deadline$/,
  /^hs_last_metered_enrichment_timestamp$/,
  /^hs_signals_summary$/,
  /^hs_object_source_detail_.*/i,
  /^hs_object_source_label$/,
  /^hs_object_source_user_id$/,
  /^hs_object_source_id$/,
  /^num_.*/i,
  /^notes_.*/i,
  /^recent_.*/i,
  /^owneremail$/,
  /^ownername$/,
  /^timezone$/,
  /^is_public$/,
  /^facebook_.*/i,
  /^facebookfans$/,
  /^googleplus_.*/i,
  /^linkedin_.*/i,
  /^linkedinbio$/,
  /^twitter.*/i,
  /^web_technologies$/,
  /^founded_year$/,
  /^total_revenue$/,
];

function hasOptions(property: HubspotCompanyPropertySource): boolean {
  return Array.isArray(property.options) && property.options.length > 0;
}

function isSystemOnly(property: HubspotCompanyPropertySource): boolean {
  return SYSTEM_ID_OR_TIMESTAMP_PATTERNS.some((pattern) => pattern.test(property.name || ''));
}

function buildOptionSummary(property: HubspotCompanyPropertySource): string {
  if (!Array.isArray(property.options) || property.options.length === 0) return '';
  const summary = property.options
    .slice(0, 10)
    .map((option) => `${option.label} | value=${option.value}`)
    .join(' || ');
  return property.options.length > 10 ? `${summary} …(+${property.options.length - 10})` : summary;
}

export function classifyHubspotCompanyProperty(property: HubspotCompanyPropertySource): HubspotCompanyPropertyClassificationResult {
  const name = (property.name || '').trim();
  const hidden = property.hidden === true || property.archived === true;
  const calculated = property.calculated === true;
  const readOnlyValue = property.readOnlyValue === true;
  const readOnlyDefinition = property.readOnlyDefinition === true;
  const optionCount = Array.isArray(property.options) ? property.options.length : 0;

  if (hidden) {
    return {
      canopiPopulationClass: 'HIDDEN_OR_INTERNAL',
      canopiPopulationReason: property.archived
        ? 'Propriedade arquivada ou interna da HubSpot.'
        : 'Propriedade oculta ou interna da HubSpot.',
    };
  }

  if (calculated) {
    return {
      canopiPopulationClass: 'HUBSPOT_CALCULATED',
      canopiPopulationReason: 'Campo calculado pela HubSpot; não preencher manualmente.',
    };
  }

  if (POPULATE_NOW.has(name)) {
    return {
      canopiPopulationClass: 'POPULATE_NOW',
      canopiPopulationReason: 'Campo core para a massa inicial de empresas.',
    };
  }

  if (POPULATE_IF_AVAILABLE.has(name)) {
    return {
      canopiPopulationClass: 'POPULATE_IF_AVAILABLE',
      canopiPopulationReason: 'Campo útil para preencher somente se houver dado confiável.',
    };
  }

  if (OPTION_FIELD_REVIEW.has(name) || (optionCount > 0 && !readOnlyValue && !hidden && !calculated)) {
    return {
      canopiPopulationClass: 'OPTION_FIELD_REVIEW',
      canopiPopulationReason: optionCount > 0
        ? `Campo com ${optionCount} opção(ões) controlada(s); revisar valores permitidos antes de usar.`
        : 'Campo com opções controladas; revisar valores permitidos antes de usar.',
    };
  }

  if (readOnlyValue || readOnlyDefinition || isSystemOnly(property)) {
    return {
      canopiPopulationClass: 'SYSTEM_READ_ONLY',
      canopiPopulationReason: 'Campo de sistema, metadado ou valor somente leitura da HubSpot.',
    };
  }

  return {
    canopiPopulationClass: 'IGNORE_FOR_NOW',
    canopiPopulationReason: 'Campo não prioritário para a massa inicial.',
  };
}

export function normalizeHubspotCompanyOptions(property: HubspotCompanyPropertySource): HubspotCompanyPropertyOption[] {
  if (!Array.isArray(property.options)) return [];
  return property.options.map((option) => ({
    label: option.label || option.value || '',
    value: option.value || option.label || '',
    displayOrder: typeof option.displayOrder === 'number' ? option.displayOrder : null,
    hidden: option.hidden === true,
  }));
}

export function summarizeHubspotCompanyOptions(property: HubspotCompanyPropertySource): string {
  return buildOptionSummary(property);
}

export const HUBSPOT_COMPANY_RECOMMENDED_TEMPLATE_FIELDS = [
  'name',
  'domain',
  'country',
  'website',
  'city',
  'state',
  'address',
  'address2',
  'phone',
  'zip',
  'description',
  'annualrevenue',
  'numberofemployees',
  'founded_year',
  'about_us',
  'total_money_raised',
  'hs_country_code',
  'hs_state_code',
  'hs_employee_range',
  'hs_revenue_range',
  'hs_industry_group',
  'hubspot_owner_id',
  'industry',
  'lifecyclestage',
  'type',
  'hs_csm_sentiment',
] as const;
