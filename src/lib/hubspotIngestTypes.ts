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
