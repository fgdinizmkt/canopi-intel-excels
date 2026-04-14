/**
 * Bloco B — Integrations, Snapshots, Coverage and Sync Status
 *
 * Source of truth builder for emulating integrations, source snapshots,
 * account coverage, and sync status.
 *
 * This file defines the types and builders for the Bloco B canonical structure.
 * Data population happens in subsequent iterations.
 */

// ============================================================================
// TYPES — Bloco B Canonical Structures
// ============================================================================

export type IntegrationStatus = 'connected' | 'partial' | 'missing' | 'stale' | 'error';
export type CoverageLevel = 'full' | 'partial' | 'weak' | 'none';
export type SyncStatusType = 'connected' | 'partial' | 'missing' | 'stale' | 'error';
export type DataFreshness = 'real-time' | 'hourly' | 'daily' | 'weekly' | 'stale';
export type SyncResult = 'success' | 'partial_failure' | 'failure';
export type HealthStatus = 'healthy' | 'degraded' | 'down';

/**
 * Integration Definition
 *
 * Represents a single integration available in the Canopi system.
 * Not account-specific; global definition.
 */
export interface IntegrationDefinition {
  id: string;
  label: string;
  category: 'CRM' | 'Ads' | 'Analytics' | 'Communication' | 'ERP' | 'Other';
  description: string;
  isActive: boolean;
  connectedSince?: string; // YYYY-MM-DD
  lastChecked?: string;    // ISO 8601 timestamp
  healthStatus: HealthStatus;
}

/**
 * Source Snapshot
 *
 * Captures the state of an integration at a point in time.
 * Simulates "last successful pull of data from this integration".
 */
export interface SourceSnapshot {
  id: string;
  integrationId: string;
  snapshotDate: string;        // YYYY-MM-DD
  snapshotTimestamp: string;   // ISO 8601
  recordsReceived: number;
  recordsProcessed: number;
  recordsFailedCount?: number;
  dataConsistency: number;     // 0-100
  lastSyncDuration?: number;   // seconds
  syncStatus: SyncResult;
  errorMessage?: string;
  confidenceLevel: number;     // 0-100
}

/**
 * Account Source Coverage
 *
 * Maps which integration covers which data for which account.
 */
export interface AccountSourceCoverage {
  id: string;
  accountId: string;
  integrationId: string;
  coverageLevel: CoverageLevel;

  // Specific fields covered
  contactsCovered: boolean;
  signalsCovered: boolean;
  opportunitiesCovered: boolean;
  companyDataCovered: boolean;
  engagementDataCovered: boolean;

  lastSyncDate: string;        // YYYY-MM-DD
  nextExpectedSync?: string;   // YYYY-MM-DD
  dataFreshness: DataFreshness;

  // Quality metrics
  dataQualityScore: number;    // 0-100
  completenessScore: number;   // 0-100

  // Context
  isManualOverride?: boolean;
  notes?: string;
}

/**
 * Sync Status
 *
 * Current synchronization status of each integration.
 * Real-time health check representation.
 */
export interface SyncStatus {
  id: string;
  integrationId: string;
  lastSyncAttempt: string;       // ISO 8601 timestamp
  lastSuccessfulSync: string;    // ISO 8601 timestamp
  syncIntervalMinutes: number;

  currentStatus: SyncStatusType;
  statusReason?: string;

  recordsInQueue?: number;
  errorCount?: number;
  successCount?: number;

  nextRetryAt?: string;          // ISO 8601 timestamp
  maintenanceWindow?: string;    // human-readable

  isMonitored: boolean;
  alertsActive?: number;
}

/**
 * Bloco B Canonical Structure
 *
 * Complete canonical structure for Bloco B.
 * This is what gets exported to JSON seed.
 */
export interface BlockoBCanonical {
  metadata: {
    version: string;
    generatedAt: string;        // ISO 8601 timestamp
    blocAVersion: string;       // reference to Bloco A version
    scenarioKey: string;        // 'parcial'
  };
  integrations: IntegrationDefinition[];
  sourceSnapshots: SourceSnapshot[];
  accountSourceCoverage: AccountSourceCoverage[];
  syncStatuses: SyncStatus[];

  // Summary statistics
  summary: {
    totalIntegrations: number;
    connectedCount: number;
    partialCount: number;
    missingCount: number;
    staleCount: number;
    errorCount: number;
    totalSnapshots: number;
    totalCoverageRecords: number;
    totalSyncStatuses: number;
  };
}

// ============================================================================
// BUILDERS — Scaffolding for Data Construction
// ============================================================================

/**
 * Builder for IntegrationDefinition
 */
export function createIntegration(
  id: string,
  label: string,
  category: IntegrationDefinition['category'],
  overrides?: Partial<IntegrationDefinition>
): IntegrationDefinition {
  return {
    id,
    label,
    category,
    description: '',
    isActive: true,
    healthStatus: 'healthy',
    ...overrides,
  };
}

/**
 * Builder for SourceSnapshot
 */
export function createSourceSnapshot(
  id: string,
  integrationId: string,
  snapshotDate: string,
  overrides?: Partial<SourceSnapshot>
): SourceSnapshot {
  return {
    id,
    integrationId,
    snapshotDate,
    snapshotTimestamp: new Date(`${snapshotDate}T00:00:00Z`).toISOString(),
    recordsReceived: 0,
    recordsProcessed: 0,
    dataConsistency: 100,
    syncStatus: 'success',
    confidenceLevel: 100,
    ...overrides,
  };
}

/**
 * Builder for AccountSourceCoverage
 */
export function createAccountSourceCoverage(
  id: string,
  accountId: string,
  integrationId: string,
  overrides?: Partial<AccountSourceCoverage>
): AccountSourceCoverage {
  return {
    id,
    accountId,
    integrationId,
    coverageLevel: 'none',
    contactsCovered: false,
    signalsCovered: false,
    opportunitiesCovered: false,
    companyDataCovered: false,
    engagementDataCovered: false,
    lastSyncDate: new Date().toISOString().split('T')[0],
    dataFreshness: 'stale',
    dataQualityScore: 0,
    completenessScore: 0,
    ...overrides,
  };
}

/**
 * Builder for SyncStatus
 */
export function createSyncStatus(
  id: string,
  integrationId: string,
  overrides?: Partial<SyncStatus>
): SyncStatus {
  const now = new Date().toISOString();
  return {
    id,
    integrationId,
    lastSyncAttempt: now,
    lastSuccessfulSync: now,
    syncIntervalMinutes: 60,
    currentStatus: 'missing',
    isMonitored: true,
    ...overrides,
  };
}

/**
 * Initialize empty Bloco B Canonical structure
 */
export function initializeBlockBCanonical(blocAVersion: string = '1.0'): BlockoBCanonical {
  return {
    metadata: {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      blocAVersion,
      scenarioKey: 'parcial',
    },
    integrations: [],
    sourceSnapshots: [],
    accountSourceCoverage: [],
    syncStatuses: [],
    summary: {
      totalIntegrations: 0,
      connectedCount: 0,
      partialCount: 0,
      missingCount: 0,
      staleCount: 0,
      errorCount: 0,
      totalSnapshots: 0,
      totalCoverageRecords: 0,
      totalSyncStatuses: 0,
    },
  };
}

/**
 * Compute summary statistics from canonical structure
 */
export function computeBlockBSummary(canonical: BlockoBCanonical): BlockoBCanonical['summary'] {
  const statuses = canonical.syncStatuses;
  return {
    totalIntegrations: canonical.integrations.length,
    connectedCount: statuses.filter(s => s.currentStatus === 'connected').length,
    partialCount: statuses.filter(s => s.currentStatus === 'partial').length,
    missingCount: statuses.filter(s => s.currentStatus === 'missing').length,
    staleCount: statuses.filter(s => s.currentStatus === 'stale').length,
    errorCount: statuses.filter(s => s.currentStatus === 'error').length,
    totalSnapshots: canonical.sourceSnapshots.length,
    totalCoverageRecords: canonical.accountSourceCoverage.length,
    totalSyncStatuses: canonical.syncStatuses.length,
  };
}

// ============================================================================
// SCAFFOLDING — Data Population Ready
// ============================================================================

/**
 * SCAFFOLDING: Initialize Bloco B with empty structure
 *
 * This is the entry point for building Bloco B data.
 * Data population happens by calling builders above.
 *
 * @returns Empty Bloco B structure ready for population
 */
export function buildBlockBSeed(): BlockoBCanonical {
  const canonical = initializeBlockBCanonical();

  // TODO: Population of integrations
  // TODO: Population of source snapshots
  // TODO: Population of account source coverage
  // TODO: Population of sync statuses
  //
  // Next iteration: Populate with actual data for 43 accounts
  // and integration states from scenarios/parcial.ts

  // Compute summary before returning
  canonical.summary = computeBlockBSummary(canonical);

  return canonical;
}

export { buildBlockBSeed as default };
