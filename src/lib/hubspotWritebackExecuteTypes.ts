import type { HubspotWritebackDryRunResult } from './hubspotWritebackTypes';

export type HubspotWritebackExecutionMode = 'limited' | 'remaining';

export type HubspotWritebackExecutionStage =
  | 'validation'
  | 'companies'
  | 'contacts'
  | 'associations'
  | 'request'
  | 'setup';

export interface HubspotWritebackExecutionError {
  stage: HubspotWritebackExecutionStage;
  canopiId?: string;
  message: string;
}

export interface HubspotWritebackExecutionCountGroup {
  companies: number;
  contacts: number;
  associations: number;
}

export interface HubspotWritebackExecutionResult {
  ok: boolean;
  mode: HubspotWritebackExecutionMode;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  received: HubspotWritebackExecutionCountGroup;
  skippedAlreadySent: HubspotWritebackExecutionCountGroup;
  processed: HubspotWritebackExecutionCountGroup;
  succeeded: HubspotWritebackExecutionCountGroup;
  failed: HubspotWritebackExecutionCountGroup;
  errors: HubspotWritebackExecutionError[];
  warnings: string[];
  batchLimits: HubspotWritebackExecutionCountGroup;
  setupReady: boolean;
  dryRunAt: string;
  sent: {
    companyIds: string[];
    contactIds: string[];
    associationKeys: string[];
  };
  hubspotIds: {
    companyIdsByCanopiId: Record<string, string>;
    contactIdsByCanopiId: Record<string, string>;
  };
}

export interface HubspotWritebackExecuteRequest {
  token: string;
  confirmWriteback: boolean;
  setupReady: boolean;
  dryRun: HubspotWritebackDryRunResult;
  executionMode: HubspotWritebackExecutionMode;
  sentCompanyIds?: string[];
  sentContactIds?: string[];
  sentAssociationKeys?: string[];
  sentCompanyHubspotIds?: Record<string, string>;
  sentContactHubspotIds?: Record<string, string>;
  maxCompaniesPerBatch?: number;
  maxContactsPerBatch?: number;
  maxAssociationsPerBatch?: number;
}

export interface HubspotWritebackExecuteError {
  status: 'error';
  provider: 'hubspot';
  error: string;
  details?: string;
}
