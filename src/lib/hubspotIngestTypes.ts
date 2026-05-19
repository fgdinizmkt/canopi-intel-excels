export type HubspotIngestProvider = 'hubspot';

export type HubspotIngestContractStatus = 'draft' | 'ready' | 'blocked' | 'executed' | 'failed';

export type HubspotIngestObjectType =
  | 'companies'
  | 'contacts'
  | 'deals'
  | 'leads'
  | 'campaigns'
  | 'properties'
  | 'associations';

export type HubspotIngestObjectRole = 'canonical' | 'inventory' | 'diagnostic' | 'out_of_scope';

export type HubspotIngestScopeStatus = 'granted' | 'missing' | 'not_required';

export type HubspotIngestEntityStatus = 'available' | 'unavailable' | 'missing_scope' | 'error' | 'not_implemented';

export type HubspotIngestCountKind = 'real_total' | 'sample' | 'not_available' | 'not_implemented';

export type HubspotIngestPropertyStatus = 'available' | 'missing_scope' | 'not_configured' | 'error';

export interface HubspotIngestObjectSelection {
  objectType: HubspotIngestObjectType;
  label: string;
  selected: boolean;
  role: HubspotIngestObjectRole;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
}

export interface HubspotIngestIdentityPolicyEntity {
  canonicalTarget: 'accounts' | 'contacts';
  stableIdentifierField: string;
  matchStrategy: 'canopi_id_first_then_evidence' | 'stable_id_only';
  evidenceFields: string[];
  matchSignals: string[];
  canopiIdField: string;
  canopiBatchField: string | null;
  notes: string;
}

export interface HubspotIngestIdentityPolicy {
  companies: HubspotIngestIdentityPolicyEntity;
  contacts: HubspotIngestIdentityPolicyEntity;
}

export interface HubspotIngestScopeSnapshotItem {
  scope: string | null;
  objectType: HubspotIngestObjectType;
  status: HubspotIngestScopeStatus;
  sourceEndpoint: string | null;
  note: string | null;
}

export interface HubspotIngestEntitySummary {
  objectType: HubspotIngestObjectType;
  label: string;
  selected: boolean;
  status: HubspotIngestEntityStatus;
  hubspotTotalCount: number | null;
  canopiTaggedCount: number | null;
  canopiBatchCount: number | null;
  outsideCanopiCount: number | null;
  countKind: HubspotIngestCountKind;
  canopiTagStatus?: HubspotIngestPropertyStatus;
  canopiBatchStatus?: HubspotIngestPropertyStatus;
  scopeRequired: string | null;
  sourceEndpoint: string | null;
  note: string | null;
}

export interface HubspotIngestResolvedEntityItem {
  objectType: HubspotIngestObjectType;
  label: string;
  totalHubspotCount: number | null;
  canopiTaggedCount: number | null;
  outsideCanopiCount: number | null;
  sourceEndpoint: string | null;
}

export interface HubspotIngestUnresolvedItem {
  objectType: 'companies' | 'contacts';
  hubspotId: string | null;
  reason: string;
  evidence: string[];
  fields: Record<string, string | null>;
  remediation: string;
}

export interface HubspotIngestAmbiguousItem {
  objectType: 'companies' | 'contacts';
  hubspotId: string | null;
  candidateHubspotIds: string[];
  reason: string;
  evidence: string[];
  fields: Record<string, string | null>;
  remediation: string;
}

export interface HubspotIngestDryRunSummary {
  generatedAt: string;
  status: Extract<HubspotIngestContractStatus, 'ready' | 'blocked'>;
  companiesHubspotCount: number | null;
  companiesCanopiCount: number | null;
  companiesWithoutCanopiId: number | null;
  contactsHubspotCount: number | null;
  contactsCanopiCount: number | null;
  contactsWithoutCanopiId: number | null;
  unresolvedItemsCount: number;
  ambiguousItemsCount: number;
  entitySummaries: HubspotIngestEntitySummary[];
  outOfScopeObjects: HubspotIngestObjectType[];
  blockers: string[];
  warnings: string[];
  recommendation: string;
}

export interface HubspotIngestContractJson {
  version: 'c2.9e.2a';
  provider: HubspotIngestProvider;
  sourceConnectionId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  selectedObjects: HubspotIngestObjectSelection[];
  identityPolicy: HubspotIngestIdentityPolicy;
  scopeSnapshot: HubspotIngestScopeSnapshotItem[];
  resolvedItems: HubspotIngestResolvedEntityItem[];
  unresolvedItems: HubspotIngestUnresolvedItem[];
  ambiguousItems: HubspotIngestAmbiguousItem[];
  dryRunSummary: HubspotIngestDryRunSummary;
  canonicalTargets: {
    companies: 'accounts';
    contacts: 'contacts';
  };
}

export interface HubspotIngestContractSummary {
  id: string;
  provider: HubspotIngestProvider;
  status: HubspotIngestContractStatus;
  sourceConnectionId: string | null;
  createdBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  dryRunSummary: HubspotIngestDryRunSummary;
}

export interface HubspotIngestContract extends HubspotIngestContractSummary {
  contractJson: HubspotIngestContractJson;
  executionSummary: Record<string, unknown> | null;
}

export interface HubspotIngestContractDraftInput {
  token: string;
  sourceConnectionId?: string | null;
  createdBy?: string | null;
  notes?: string | null;
}

export interface HubspotIngestContractDraftResult {
  contractJson: HubspotIngestContractJson;
  dryRunSummary: HubspotIngestDryRunSummary;
  status: Extract<HubspotIngestContractStatus, 'ready' | 'blocked'>;
  unresolvedItems: HubspotIngestUnresolvedItem[];
  ambiguousItems: HubspotIngestAmbiguousItem[];
}

export type HubspotIngestExecutionMode = 'dry_run';

export type HubspotIngestExecutionStatus = 'success' | 'blocked';

export type HubspotIngestExecutionPlanSnapshotMode = 'execution_plan_snapshot';

export type HubspotIngestExecutionPlanSnapshotStatus = 'planned' | 'blocked';

export type HubspotIngestExecutionRecordAction = 'update' | 'review' | 'skip';

export interface HubspotIngestExecutionPlanSection {
  totalPlanned: number | null;
  create: number;
  update: number;
  skip: number;
  review: number;
  allowedFields: string[];
  notes: string;
}

export interface HubspotIngestExecutionOutOfScopeItem {
  included: false;
  action: 'skip';
  reason: string;
}

export interface HubspotIngestExecutionUnresolvedSummary {
  companiesOutsideCanopi: number | null;
  contactsWithoutCanopiId: number | null;
  ambiguousItems: number;
}

export interface HubspotIngestExecutionSummary {
  companiesTotal: number | null;
  contactsTotal: number | null;
  companiesPlannedUpdate: number;
  contactsPlannedUpdate: number;
  unresolvedCompanies: number | null;
  unresolvedContacts: number | null;
  persisted: false;
  dryRunOnly: true;
  contractStatus: HubspotIngestContractStatus;
}

export interface HubspotIngestExecutionPlanSnapshotSection {
  planned: number;
  update: number;
  review: number;
  create: number;
  skip: number;
}

export interface HubspotIngestExecutionPlanRecord {
  hubspotId: string;
  canopiId: string;
  action: HubspotIngestExecutionRecordAction;
  allowedFields: string[];
  fieldCandidates: Record<string, string | null>;
  conflicts: string[];
  warnings: string[];
}

export interface HubspotIngestExecutionPlanSnapshotSummary {
  accounts: HubspotIngestExecutionPlanSnapshotSection;
  contacts: HubspotIngestExecutionPlanSnapshotSection;
}

export interface HubspotIngestExecutionPlanSnapshotExecutionSummary {
  version: 'c2.9e.2b.2a';
  mode: HubspotIngestExecutionPlanSnapshotMode;
  provider: HubspotIngestProvider;
  contractId: string;
  planHash: string | null;
  createdAt: string;
  status: HubspotIngestExecutionPlanSnapshotStatus;
  persisted: false;
  canPersist: false;
  canonicalPersisted: false;
  summary: HubspotIngestExecutionPlanSnapshotSummary;
  records: {
    accounts: HubspotIngestExecutionPlanRecord[];
    contacts: HubspotIngestExecutionPlanRecord[];
  };
  unresolved: HubspotIngestExecutionUnresolvedSummary;
  outOfScope: HubspotIngestObjectType[];
  guardrails: string[];
  blockers: string[];
  warnings: string[];
}

export type HubspotIngestApplyPreflightMode = 'apply_preflight';

export type HubspotIngestApplyPreflightStatus = 'ready' | 'blocked';

export interface HubspotIngestApplyPreflightRecordResult {
  hubspotId: string;
  canopiId: string;
  status: 'ready_to_apply' | 'review' | 'blocked' | 'skip';
  action: HubspotIngestExecutionRecordAction;
  allowedFields: string[];
  fieldCandidates: Record<string, string | null>;
  existingValues: Record<string, string | null>;
  conflicts: string[];
  warnings: string[];
}

export interface HubspotIngestApplyPreflightSummarySection {
  planned: number;
  readyToApply: number;
  review: number;
  blocked: number;
  skip: number;
}

export interface HubspotIngestApplyPreflightSummary {
  accounts: HubspotIngestApplyPreflightSummarySection;
  contacts: HubspotIngestApplyPreflightSummarySection;
}

export interface HubspotIngestApplyPreflightResult {
  status: HubspotIngestApplyPreflightStatus;
  mode: HubspotIngestApplyPreflightMode;
  provider: HubspotIngestProvider;
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
  canApply: false;
  wouldPersist: false;
  summary: HubspotIngestApplyPreflightSummary;
  conflicts: {
    accounts: HubspotIngestApplyPreflightRecordResult[];
    contacts: HubspotIngestApplyPreflightRecordResult[];
  };
  blockers: string[];
  warnings: string[];
  guardrails: string[];
  nextStep: 'apply_real_requires_transactional_boundary';
}

export type HubspotIngestApplyMode = 'apply';
export type HubspotIngestApplyStatus = 'success' | 'blocked';

export interface HubspotIngestApplySummarySection {
  planned: number;
  applied: number;
  review: number;
  blocked: number;
  skip: number;
}

export interface HubspotIngestApplySummary {
  accounts: HubspotIngestApplySummarySection;
  contacts: HubspotIngestApplySummarySection;
}

export interface HubspotIngestApplySourceSnapshot {
  version: 'c2.9e.2b.2a';
  mode: HubspotIngestExecutionPlanSnapshotMode;
  planHash: string;
  status: HubspotIngestExecutionPlanSnapshotStatus;
  createdAt?: string;
}

export interface HubspotIngestApplyRpcResult {
  status: HubspotIngestApplyStatus;
  mode: HubspotIngestApplyMode;
  provider: HubspotIngestProvider;
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
  persisted: boolean;
  canonicalPersisted: boolean;
  contractStatusBefore: HubspotIngestContractStatus;
  contractStatusAfter: HubspotIngestContractStatus;
  summary: HubspotIngestApplySummary;
  blockers: string[];
  warnings: string[];
  countsBefore: {
    hubspot_ingest_contracts: number;
    accounts: number;
    contacts: number;
  };
  countsAfter: {
    hubspot_ingest_contracts: number;
    accounts: number;
    contacts: number;
  };
  sourceSnapshot: HubspotIngestApplySourceSnapshot;
}

export type HubspotIdentityMappingProvider = 'hubspot';
export type HubspotIdentityMappingEntityType = 'account' | 'contact' | 'deal';
export type HubspotIdentityMappingStatus = 'active' | 'inactive' | 'blocked';

export interface HubspotIdentityMappingMetadata {
  [key: string]: unknown;
}

export interface HubspotIdentityMapping {
  id: string;
  provider: HubspotIdentityMappingProvider;
  entityType: HubspotIdentityMappingEntityType;
  canonicalId: string;
  canopiExternalId: string;
  hubspotId: string | null;
  sourceConnectionId: string | null;
  sourceFingerprint: string | null;
  status: HubspotIdentityMappingStatus;
  metadataJson: HubspotIdentityMappingMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface HubspotIdentityMappingLookupFilters {
  provider?: HubspotIdentityMappingProvider;
  entityType?: HubspotIdentityMappingEntityType;
  canonicalId?: string;
  canopiExternalId?: string;
  hubspotId?: string;
  status?: HubspotIdentityMappingStatus;
}

export type HubspotIdentityMappingRecoveryMode = 'identity_mapping_recovery_dry_run';

export type HubspotIdentityMappingRecoveryStatus = 'success' | 'blocked';

export type HubspotIdentityMappingRecoveryClassification =
  | 'resolved_exact'
  | 'unresolved'
  | 'ambiguous'
  | 'unsafe'
  | 'missing_required_fields';

export type HubspotIdentityMappingRecoveryMatchSource =
  | 'direct_canonical_id'
  | 'identity_mapping_canopi_external_id'
  | 'identity_mapping_hubspot_id'
  | 'heuristic_name_domain'
  | 'heuristic_account_anchor'
  | 'heuristic_contact_identity'
  | 'none';

export interface HubspotIdentityMappingRecoveryRecord {
  entityType: HubspotIdentityMappingEntityType;
  hubspotId: string;
  snapshotCanopiId: string;
  canonicalId: string | null;
  classification: HubspotIdentityMappingRecoveryClassification;
  matchSource: HubspotIdentityMappingRecoveryMatchSource;
  mappingId: string | null;
  candidateCanonicalIds: string[];
  reasons: string[];
  snapshotFields: Record<string, string | null>;
}

export interface HubspotIdentityMappingRecoverySummarySection {
  total: number;
  resolvedExact: number;
  unresolved: number;
  ambiguous: number;
  unsafe: number;
  missingRequiredFields: number;
}

export interface HubspotIdentityMappingRecoveryDryRunResult {
  status: HubspotIdentityMappingRecoveryStatus;
  mode: HubspotIdentityMappingRecoveryMode;
  provider: HubspotIngestProvider;
  contractId: string;
  generatedAt: string;
  snapshot: HubspotIngestApplySourceSnapshot;
  summary: {
    accounts: HubspotIdentityMappingRecoverySummarySection;
    contacts: HubspotIdentityMappingRecoverySummarySection;
  };
  accounts: HubspotIdentityMappingRecoveryRecord[];
  contacts: HubspotIdentityMappingRecoveryRecord[];
  blockers: string[];
  warnings: string[];
  guardrails: string[];
}

export type HubspotIdentityMappingProposalMode = 'identity_mapping_proposal_dry_run';

export type HubspotIdentityMappingProposalStatus = 'success' | 'blocked';

export type HubspotIdentityMappingProposalClassification =
  | 'proposed_exact'
  | 'proposed_strong'
  | 'ambiguous'
  | 'unresolved'
  | 'unsafe'
  | 'missing_required_fields';

export type HubspotIdentityMappingProposalMatchSource =
  | 'direct_canonical_id'
  | 'identity_mapping_canopi_external_id'
  | 'identity_mapping_hubspot_id'
  | 'heuristic_name_domain'
  | 'heuristic_name_only'
  | 'heuristic_domain_only'
  | 'none';

export interface HubspotIdentityMappingProposalRecord {
  entityType: HubspotIdentityMappingEntityType;
  hubspotId: string;
  snapshotCanopiId: string;
  canonicalId: string | null;
  classification: HubspotIdentityMappingProposalClassification;
  matchSource: HubspotIdentityMappingProposalMatchSource;
  mappingId: string | null;
  candidateCanonicalIds: string[];
  reasons: string[];
  snapshotFields: Record<string, string | null>;
}

export interface HubspotIdentityMappingProposalSummarySection {
  total: number;
  proposedExact: number;
  proposedStrong: number;
  ambiguous: number;
  unresolved: number;
  unsafe: number;
  missingRequiredFields: number;
}

export interface HubspotIdentityMappingProposalContactsSummary {
  total: number;
  dependentOnUnresolvedAccount: number;
  evaluableIfAccountsResolved: number;
  missingRequiredFields: number;
  blockers: string[];
}

export interface HubspotIdentityMappingProposalDryRunResult {
  status: HubspotIdentityMappingProposalStatus;
  mode: HubspotIdentityMappingProposalMode;
  provider: HubspotIngestProvider;
  contractId: string;
  generatedAt: string;
  snapshot: HubspotIngestApplySourceSnapshot;
  summary: {
    accounts: HubspotIdentityMappingProposalSummarySection;
    contacts: HubspotIdentityMappingProposalContactsSummary;
  };
  accounts: HubspotIdentityMappingProposalRecord[];
  blockers: string[];
  warnings: string[];
  guardrails: string[];
}

export interface HubspotIngestExecutionResult {
  status: HubspotIngestExecutionStatus;
  mode: HubspotIngestExecutionMode;
  provider: HubspotIngestProvider;
  contractId: string;
  canPersist: false;
  blockers: string[];
  warnings: string[];
  plan: {
    accounts: HubspotIngestExecutionPlanSection;
    contacts: HubspotIngestExecutionPlanSection;
  };
  outOfScope: {
    deals: HubspotIngestExecutionOutOfScopeItem;
    leads: HubspotIngestExecutionOutOfScopeItem;
    campaigns: HubspotIngestExecutionOutOfScopeItem;
    properties: HubspotIngestExecutionOutOfScopeItem;
    associations: HubspotIngestExecutionOutOfScopeItem;
  };
  unresolved: HubspotIngestExecutionUnresolvedSummary;
  guardrails: string[];
  summary: HubspotIngestExecutionSummary;
}
