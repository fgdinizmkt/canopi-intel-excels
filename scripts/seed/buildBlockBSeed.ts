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
 * POPULATION: Bloco B Canonical Data for Cenário Parcial
 *
 * This populates Bloco B with realistic integration states,
 * snapshots, coverage, and sync status based on:
 * - scenarios/parcial.ts (source states)
 * - Bloco A account data (43 contas)
 * - Coherence rules (ABM/ABX coverage patterns)
 *
 * @returns Populated Bloco B structure
 */
export function buildBlockBSeed(): BlockoBCanonical {
  const canonical = initializeBlockBCanonical();

  // ====== POPULATE INTEGRATIONS ======
  canonical.integrations = [
    createIntegration('hubspot', 'HubSpot', 'CRM', {
      description: 'CRM principal para conta, contato, oportunidade',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-01-15',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('salesforce', 'Salesforce', 'CRM', {
      description: 'CRM secundário, integração legada',
      isActive: true,
      healthStatus: 'degraded',
      connectedSince: '2023-06-01',
      lastChecked: new Date('2026-03-15').toISOString(),
    }),
    createIntegration('google_ads', 'Google Ads', 'Ads', {
      description: 'Paid media para analytics e atribuição',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-03-10',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('meta_ads', 'Meta Ads', 'Ads', {
      description: 'Facebook/Instagram para campanhas',
      isActive: true,
      healthStatus: 'down',
      connectedSince: '2024-02-20',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('linkedin_ads', 'LinkedIn Ads', 'Ads', {
      description: 'LinkedIn para B2B campaigns',
      isActive: false,
      healthStatus: 'down',
      connectedSince: undefined,
    }),
    createIntegration('ga4', 'Google Analytics 4', 'Analytics', {
      description: 'Website analytics e comportamento',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-01-20',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('search_console', 'Google Search Console', 'Analytics', {
      description: 'SEO e busca orgânica',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-02-01',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('apollo', 'Apollo', 'Other', {
      description: 'B2B enrichment e intent data',
      isActive: true,
      healthStatus: 'degraded',
      connectedSince: '2024-04-05',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('outreach', 'Outreach', 'Other', {
      description: 'Sales engagement e sequências',
      isActive: false,
      healthStatus: 'down',
      connectedSince: undefined,
    }),
    createIntegration('salesloft', 'SalesLoft', 'Other', {
      description: 'Sales engagement alternativo',
      isActive: false,
      healthStatus: 'down',
      connectedSince: undefined,
    }),
    createIntegration('rd_station', 'RD Station', 'Other', {
      description: 'Automação de marketing e leads',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-01-10',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('bigquery', 'Google BigQuery', 'Analytics', {
      description: 'Data warehouse para análises complexas',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-03-01',
      lastChecked: new Date().toISOString(),
    }),
    createIntegration('slack', 'Slack', 'Communication', {
      description: 'Notificações e comunicação',
      isActive: true,
      healthStatus: 'healthy',
      connectedSince: '2024-02-10',
      lastChecked: new Date().toISOString(),
    }),
  ];

  // ====== POPULATE SOURCE SNAPSHOTS ======
  // Gerar 1-2 snapshots por integração ativa
  canonical.sourceSnapshots = [
    // HubSpot — connected
    createSourceSnapshot('snap_hubspot_2026_04_12', 'hubspot', '2026-04-12', {
      recordsReceived: 2340,
      recordsProcessed: 2340,
      dataConsistency: 98,
      syncStatus: 'success',
      confidenceLevel: 98,
      lastSyncDuration: 45,
    }),
    // Salesforce — stale
    createSourceSnapshot('snap_salesforce_2026_02_15', 'salesforce', '2026-02-15', {
      recordsReceived: 1850,
      recordsProcessed: 1750,
      recordsFailedCount: 100,
      dataConsistency: 72,
      syncStatus: 'partial_failure',
      confidenceLevel: 65,
      lastSyncDuration: 120,
    }),
    // Google Ads — connected
    createSourceSnapshot('snap_google_ads_2026_04_13', 'google_ads', '2026-04-13', {
      recordsReceived: 5600,
      recordsProcessed: 5600,
      dataConsistency: 96,
      syncStatus: 'success',
      confidenceLevel: 96,
      lastSyncDuration: 60,
    }),
    // Meta Ads — error (API authentication failed)
    createSourceSnapshot('snap_meta_ads_2026_04_13', 'meta_ads', '2026-04-13', {
      recordsReceived: 0,
      recordsProcessed: 0,
      recordsFailedCount: 3400,
      dataConsistency: 0,
      syncStatus: 'failure',
      errorMessage: 'API authentication failed: invalid credentials or token expired',
      confidenceLevel: 0,
      lastSyncDuration: 5,
    }),
    // GA4 — connected
    createSourceSnapshot('snap_ga4_2026_04_13', 'ga4', '2026-04-13', {
      recordsReceived: 12000,
      recordsProcessed: 12000,
      dataConsistency: 94,
      syncStatus: 'success',
      confidenceLevel: 94,
      lastSyncDuration: 180,
    }),
    // Search Console — connected
    createSourceSnapshot('snap_search_console_2026_04_12', 'search_console', '2026-04-12', {
      recordsReceived: 8500,
      recordsProcessed: 8500,
      dataConsistency: 95,
      syncStatus: 'success',
      confidenceLevel: 95,
      lastSyncDuration: 120,
    }),
    // Apollo — partial
    createSourceSnapshot('snap_apollo_2026_04_11', 'apollo', '2026-04-11', {
      recordsReceived: 4200,
      recordsProcessed: 3800,
      recordsFailedCount: 400,
      dataConsistency: 68,
      syncStatus: 'partial_failure',
      confidenceLevel: 70,
      lastSyncDuration: 150,
    }),
    // RD Station — connected
    createSourceSnapshot('snap_rd_station_2026_04_13', 'rd_station', '2026-04-13', {
      recordsReceived: 6700,
      recordsProcessed: 6700,
      dataConsistency: 92,
      syncStatus: 'success',
      confidenceLevel: 92,
      lastSyncDuration: 75,
    }),
    // BigQuery — connected
    createSourceSnapshot('snap_bigquery_2026_04_13', 'bigquery', '2026-04-13', {
      recordsReceived: 45000,
      recordsProcessed: 45000,
      dataConsistency: 99,
      syncStatus: 'success',
      confidenceLevel: 99,
      lastSyncDuration: 300,
    }),
    // Slack — connected
    createSourceSnapshot('snap_slack_2026_04_13', 'slack', '2026-04-13', {
      recordsReceived: 2100,
      recordsProcessed: 2100,
      dataConsistency: 100,
      syncStatus: 'success',
      confidenceLevel: 100,
      lastSyncDuration: 20,
    }),
  ];

  // ====== POPULATE ACCOUNT SOURCE COVERAGE ======
  // Emular cobertura realista por conta
  // ABM: focus em inbound (GA4, Google Ads, RD Station, Search Console)
  // ABX: focus em CRM (HubSpot, Salesforce), Sales (Apollo)

  const accounts = require('../../src/data/accountsData').contasMock;

  for (const account of accounts) {
    // Define base coverage por tipo estratégico
    const isABM = account.tipoEstrategico === 'ABM';
    const isABX = account.tipoEstrategico === 'ABX';
    const isMature = account.prontidao > 70;

    // HubSpot — sempre tem cobertura
    if (isABX || isMature) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_hubspot`,
          account.id,
          'hubspot',
          {
            coverageLevel: isABX || isMature ? 'full' : 'partial',
            contactsCovered: true,
            signalsCovered: true,
            opportunitiesCovered: true,
            companyDataCovered: true,
            engagementDataCovered: true,
            lastSyncDate: '2026-04-13',
            dataFreshness: 'real-time',
            dataQualityScore: isABX || isMature ? 92 : 78,
            completenessScore: isABX || isMature ? 95 : 75,
          }
        )
      );
    }

    // GA4 — mais forte em ABM (inbound)
    if (isABM || account.potencial > 75) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_ga4`,
          account.id,
          'ga4',
          {
            coverageLevel: 'partial',
            contactsCovered: false,
            signalsCovered: true,
            opportunitiesCovered: false,
            companyDataCovered: true,
            engagementDataCovered: true,
            lastSyncDate: '2026-04-13',
            dataFreshness: 'hourly',
            dataQualityScore: 88,
            completenessScore: 82,
          }
        )
      );
    }

    // Google Ads — accounts com alto potencial
    if (account.potencial > 70) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_google_ads`,
          account.id,
          'google_ads',
          {
            coverageLevel: 'partial',
            contactsCovered: false,
            signalsCovered: true,
            opportunitiesCovered: false,
            companyDataCovered: false,
            engagementDataCovered: true,
            lastSyncDate: '2026-04-13',
            dataFreshness: 'daily',
            dataQualityScore: 85,
            completenessScore: 80,
          }
        )
      );
    }

    // RD Station — marketing automation
    if (account.atividadeRecente === 'Alta' || isABM) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_rd_station`,
          account.id,
          'rd_station',
          {
            coverageLevel: 'partial',
            contactsCovered: false,
            signalsCovered: true,
            opportunitiesCovered: false,
            companyDataCovered: false,
            engagementDataCovered: true,
            lastSyncDate: '2026-04-13',
            dataFreshness: 'daily',
            dataQualityScore: 80,
            completenessScore: 75,
          }
        )
      );
    }

    // Apollo — enrichment, mostly ABX/mature
    if (isABX || isMature) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_apollo`,
          account.id,
          'apollo',
          {
            coverageLevel: 'weak',
            contactsCovered: true,
            signalsCovered: false,
            opportunitiesCovered: false,
            companyDataCovered: true,
            engagementDataCovered: false,
            lastSyncDate: '2026-04-11',
            dataFreshness: 'weekly',
            dataQualityScore: 72,
            completenessScore: 65,
          }
        )
      );
    }

    // Search Console — accounts com website activity
    if (account.coberturaRelacional > 40) {
      canonical.accountSourceCoverage.push(
        createAccountSourceCoverage(
          `cov_${account.id}_search_console`,
          account.id,
          'search_console',
          {
            coverageLevel: 'weak',
            contactsCovered: false,
            signalsCovered: true,
            opportunitiesCovered: false,
            companyDataCovered: false,
            engagementDataCovered: true,
            lastSyncDate: '2026-04-12',
            dataFreshness: 'weekly',
            dataQualityScore: 75,
            completenessScore: 70,
          }
        )
      );
    }
  }

  // ====== POPULATE SYNC STATUSES ======
  canonical.syncStatuses = [
    createSyncStatus('sync_hubspot', 'hubspot', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 30,
      successCount: 245,
      isMonitored: true,
    }),
    createSyncStatus('sync_salesforce', 'salesforce', {
      currentStatus: 'stale',
      lastSyncAttempt: new Date('2026-04-13').toISOString(),
      lastSuccessfulSync: new Date('2026-02-15').toISOString(),
      syncIntervalMinutes: 120,
      errorCount: 18,
      statusReason: 'Última sincronização em fevereiro; requer reconexão',
      isMonitored: true,
      alertsActive: 2,
    }),
    createSyncStatus('sync_google_ads', 'google_ads', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 60,
      successCount: 180,
      isMonitored: true,
    }),
    createSyncStatus('sync_meta_ads', 'meta_ads', {
      currentStatus: 'error',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date('2026-04-10').toISOString(),
      syncIntervalMinutes: 90,
      successCount: 142,
      errorCount: 11,
      statusReason: 'API authentication failed: invalid credentials or token expired. Requer reconexão manual.',
      isMonitored: true,
      alertsActive: 3,
      nextRetryAt: new Date(Date.now() + 3600000).toISOString(), // 1 hora
    }),
    createSyncStatus('sync_linkedin_ads', 'linkedin_ads', {
      currentStatus: 'missing',
      lastSyncAttempt: new Date('2026-01-30').toISOString(),
      lastSuccessfulSync: undefined,
      syncIntervalMinutes: 120,
      statusReason: 'Integração não conectada',
      isMonitored: false,
    }),
    createSyncStatus('sync_ga4', 'ga4', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 60,
      successCount: 200,
      isMonitored: true,
    }),
    createSyncStatus('sync_search_console', 'search_console', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 120,
      successCount: 140,
      isMonitored: true,
    }),
    createSyncStatus('sync_apollo', 'apollo', {
      currentStatus: 'partial',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 180,
      successCount: 95,
      errorCount: 12,
      statusReason: 'Taxa de erro em ~11%; dados parciais',
      isMonitored: true,
      alertsActive: 1,
    }),
    createSyncStatus('sync_outreach', 'outreach', {
      currentStatus: 'missing',
      lastSyncAttempt: new Date('2025-12-20').toISOString(),
      lastSuccessfulSync: undefined,
      syncIntervalMinutes: 60,
      statusReason: 'Integração não conectada',
      isMonitored: false,
    }),
    createSyncStatus('sync_salesloft', 'salesloft', {
      currentStatus: 'missing',
      lastSyncAttempt: new Date('2025-11-15').toISOString(),
      lastSuccessfulSync: undefined,
      syncIntervalMinutes: 60,
      statusReason: 'Integração não conectada',
      isMonitored: false,
    }),
    createSyncStatus('sync_rd_station', 'rd_station', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 45,
      successCount: 190,
      isMonitored: true,
    }),
    createSyncStatus('sync_bigquery', 'bigquery', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 120,
      successCount: 150,
      isMonitored: true,
    }),
    createSyncStatus('sync_slack', 'slack', {
      currentStatus: 'connected',
      lastSyncAttempt: new Date().toISOString(),
      lastSuccessfulSync: new Date().toISOString(),
      syncIntervalMinutes: 30,
      successCount: 210,
      isMonitored: true,
    }),
  ];

  // Compute summary before returning
  canonical.summary = computeBlockBSummary(canonical);

  return canonical;
}

export { buildBlockBSeed as default };
