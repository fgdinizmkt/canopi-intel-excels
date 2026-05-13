export type HubspotWritebackSetupStatus = 'idle' | 'verifying' | 'ready' | 'pending' | 'blocked' | 'creating' | 'error';

export type HubspotWritebackSetupSeverity = 'ready' | 'pending' | 'blocked' | 'error';

export type HubspotWritebackSetupObjectType = 'companies' | 'contacts';

export interface HubspotWritebackPropertyRequirement {
  objectType: HubspotWritebackSetupObjectType;
  name: string;
  label: string;
  type: string;
  fieldType: string;
  hasUniqueValue: boolean;
  description: string;
  groupName: string;
}

export interface HubspotWritebackSetupPropertyState {
  requirement: HubspotWritebackPropertyRequirement;
  status: 'ready' | 'missing' | 'incompatible';
  message: string;
  existingGroupName: string | null;
  existingType: string | null;
  existingFieldType: string | null;
  existingHasUniqueValue: boolean | null;
  existingReadOnlyValue: boolean;
  existingReadOnlyDefinition: boolean;
  existingArchived: boolean;
  existingHidden: boolean;
}

export interface HubspotWritebackSetupScopeState {
  required: string[];
  granted: string[];
  missing: string[];
  ready: boolean;
}

export interface HubspotWritebackSetupObjectSummary {
  objectType: HubspotWritebackSetupObjectType;
  label: string;
  ready: boolean;
  uniqueReady: boolean;
  missing: string[];
  incompatible: string[];
  properties: HubspotWritebackSetupPropertyState[];
}

export interface HubspotWritebackSetupIssue {
  severity: HubspotWritebackSetupSeverity;
  objectType: HubspotWritebackSetupObjectType | 'scopes' | 'connection' | 'ids';
  propertyName?: string;
  scope?: string;
  title: string;
  message: string;
}

export interface HubspotWritebackSetupActionLog {
  objectType: HubspotWritebackSetupObjectType;
  propertyName: string;
  label: string;
  action: 'created' | 'skipped_existing' | 'blocked_incompatible';
  message: string;
}

export interface HubspotWritebackSetupResult {
  status: 'success';
  provider: 'hubspot';
  checkedAt: string;
  hubId: string | null;
  scopes: string[];
  readAccessConfirmed: boolean;
  scopeSummary: {
    schemaRead: HubspotWritebackSetupScopeState;
    objectWrite: HubspotWritebackSetupScopeState;
    schemaWrite: HubspotWritebackSetupScopeState;
  };
  companies: HubspotWritebackSetupObjectSummary;
  contacts: HubspotWritebackSetupObjectSummary;
  issues: HubspotWritebackSetupIssue[];
  blockers: string[];
  warnings: string[];
  ready: boolean;
  canCreateProperties: boolean;
  creationLog?: HubspotWritebackSetupActionLog[];
}

export interface HubspotWritebackSetupError {
  status: 'error';
  provider: 'hubspot';
  error: string;
  details?: string;
}
