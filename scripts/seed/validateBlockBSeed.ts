/**
 * Validate Bloco B Seed Coherence
 *
 * Ensures Bloco B maintains logical consistency with:
 * - Valid account references (Bloco A)
 * - Valid integration references
 * - Coherent state transitions
 * - Data freshness rules
 *
 * Called from scripts/seed/runBlockBSeed.sh
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildBlockBSeed, BlockoBCanonical } from './buildBlockBSeed';
import { contasMock } from '../../src/data/accountsData';

// ============================================================================
// VALIDATION RULES
// ============================================================================

interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: string;
  message: string;
  severity: 'critical' | 'error';
}

interface ValidationWarning {
  type: string;
  message: string;
}

// ============================================================================
// VALIDATORS
// ============================================================================

class BlockBValidator {
  private canonical: BlockoBCanonical;
  private accountIds: Set<string>;
  private integrationIds: Set<string>;
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(canonical: BlockoBCanonical) {
    this.canonical = canonical;
    this.accountIds = new Set(contasMock.map(a => a.id));
    this.integrationIds = new Set(canonical.integrations.map(i => i.id));
  }

  /**
   * Run all validations
   */
  validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateStructure();
    this.validateIntegrations();
    this.validateSourceSnapshots();
    this.validateAccountSourceCoverage();
    this.validateSyncStatuses();
    this.validateCoherence();

    return {
      passed: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate basic structure
   */
  private validateStructure(): void {
    if (!this.canonical.integrations || !Array.isArray(this.canonical.integrations)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'integrations must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.sourceSnapshots || !Array.isArray(this.canonical.sourceSnapshots)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'sourceSnapshots must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.accountSourceCoverage || !Array.isArray(this.canonical.accountSourceCoverage)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'accountSourceCoverage must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.syncStatuses || !Array.isArray(this.canonical.syncStatuses)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'syncStatuses must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.metadata) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'metadata is required',
        severity: 'critical',
      });
    }
  }

  /**
   * Validate integrations
   */
  private validateIntegrations(): void {
    for (const integration of this.canonical.integrations) {
      // Required fields
      if (!integration.id) {
        this.errors.push({
          type: 'INTEGRATION_ID',
          message: 'integrations must have id',
          severity: 'error',
        });
      }

      if (!integration.label) {
        this.errors.push({
          type: 'INTEGRATION_LABEL',
          message: `integration ${integration.id} must have label`,
          severity: 'error',
        });
      }

      if (!['CRM', 'Ads', 'Analytics', 'Communication', 'ERP', 'Other'].includes(integration.category)) {
        this.errors.push({
          type: 'INTEGRATION_CATEGORY',
          message: `integration ${integration.id} has invalid category: ${integration.category}`,
          severity: 'error',
        });
      }

      if (!['healthy', 'degraded', 'down'].includes(integration.healthStatus)) {
        this.errors.push({
          type: 'INTEGRATION_HEALTH',
          message: `integration ${integration.id} has invalid healthStatus: ${integration.healthStatus}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate source snapshots
   */
  private validateSourceSnapshots(): void {
    for (const snapshot of this.canonical.sourceSnapshots) {
      // Required fields
      if (!snapshot.id) {
        this.errors.push({
          type: 'SNAPSHOT_ID',
          message: 'sourceSnapshots must have id',
          severity: 'error',
        });
      }

      if (!this.integrationIds.has(snapshot.integrationId)) {
        this.errors.push({
          type: 'SNAPSHOT_INTEGRATION_REF',
          message: `snapshot ${snapshot.id} references non-existent integrationId: ${snapshot.integrationId}`,
          severity: 'error',
        });
      }

      if (!snapshot.snapshotDate || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.snapshotDate)) {
        this.errors.push({
          type: 'SNAPSHOT_DATE',
          message: `snapshot ${snapshot.id} has invalid snapshotDate format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }

      if (!['success', 'partial_failure', 'failure'].includes(snapshot.syncStatus)) {
        this.errors.push({
          type: 'SNAPSHOT_SYNC_STATUS',
          message: `snapshot ${snapshot.id} has invalid syncStatus: ${snapshot.syncStatus}`,
          severity: 'error',
        });
      }

      if (snapshot.dataConsistency < 0 || snapshot.dataConsistency > 100) {
        this.errors.push({
          type: 'SNAPSHOT_CONSISTENCY',
          message: `snapshot ${snapshot.id} dataConsistency must be 0-100, got ${snapshot.dataConsistency}`,
          severity: 'error',
        });
      }

      if (snapshot.confidenceLevel < 0 || snapshot.confidenceLevel > 100) {
        this.errors.push({
          type: 'SNAPSHOT_CONFIDENCE',
          message: `snapshot ${snapshot.id} confidenceLevel must be 0-100, got ${snapshot.confidenceLevel}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate account source coverage
   */
  private validateAccountSourceCoverage(): void {
    for (const coverage of this.canonical.accountSourceCoverage) {
      // Required fields
      if (!coverage.id) {
        this.errors.push({
          type: 'COVERAGE_ID',
          message: 'accountSourceCoverage must have id',
          severity: 'error',
        });
      }

      if (!this.accountIds.has(coverage.accountId)) {
        this.errors.push({
          type: 'COVERAGE_ACCOUNT_REF',
          message: `coverage ${coverage.id} references non-existent accountId: ${coverage.accountId}`,
          severity: 'error',
        });
      }

      if (!this.integrationIds.has(coverage.integrationId)) {
        this.errors.push({
          type: 'COVERAGE_INTEGRATION_REF',
          message: `coverage ${coverage.id} references non-existent integrationId: ${coverage.integrationId}`,
          severity: 'error',
        });
      }

      if (!['full', 'partial', 'weak', 'none'].includes(coverage.coverageLevel)) {
        this.errors.push({
          type: 'COVERAGE_LEVEL',
          message: `coverage ${coverage.id} has invalid coverageLevel: ${coverage.coverageLevel}`,
          severity: 'error',
        });
      }

      if (!['real-time', 'hourly', 'daily', 'weekly', 'stale'].includes(coverage.dataFreshness)) {
        this.errors.push({
          type: 'COVERAGE_FRESHNESS',
          message: `coverage ${coverage.id} has invalid dataFreshness: ${coverage.dataFreshness}`,
          severity: 'error',
        });
      }

      if (coverage.dataQualityScore < 0 || coverage.dataQualityScore > 100) {
        this.errors.push({
          type: 'COVERAGE_QUALITY',
          message: `coverage ${coverage.id} dataQualityScore must be 0-100, got ${coverage.dataQualityScore}`,
          severity: 'error',
        });
      }

      if (coverage.completenessScore < 0 || coverage.completenessScore > 100) {
        this.errors.push({
          type: 'COVERAGE_COMPLETENESS',
          message: `coverage ${coverage.id} completenessScore must be 0-100, got ${coverage.completenessScore}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate sync statuses
   */
  private validateSyncStatuses(): void {
    for (const syncStatus of this.canonical.syncStatuses) {
      // Required fields
      if (!syncStatus.id) {
        this.errors.push({
          type: 'SYNCSTATUS_ID',
          message: 'syncStatuses must have id',
          severity: 'error',
        });
      }

      if (!this.integrationIds.has(syncStatus.integrationId)) {
        this.errors.push({
          type: 'SYNCSTATUS_INTEGRATION_REF',
          message: `syncStatus ${syncStatus.id} references non-existent integrationId: ${syncStatus.integrationId}`,
          severity: 'error',
        });
      }

      if (!['connected', 'partial', 'missing', 'stale', 'error'].includes(syncStatus.currentStatus)) {
        this.errors.push({
          type: 'SYNCSTATUS_STATUS',
          message: `syncStatus ${syncStatus.id} has invalid currentStatus: ${syncStatus.currentStatus}`,
          severity: 'error',
        });
      }

      if (syncStatus.syncIntervalMinutes < 1) {
        this.warnings.push({
          type: 'SYNCSTATUS_INTERVAL',
          message: `syncStatus ${syncStatus.id} syncIntervalMinutes should be >= 1, got ${syncStatus.syncIntervalMinutes}`,
        });
      }
    }
  }

  /**
   * Validate coherence between tables
   */
  private validateCoherence(): void {
    // Rule: If syncStatus is 'connected', should have recent snapshot
    for (const syncStatus of this.canonical.syncStatuses) {
      if (syncStatus.currentStatus === 'connected') {
        const hasRecentSnapshot = this.canonical.sourceSnapshots.some(s =>
          s.integrationId === syncStatus.integrationId &&
          s.syncStatus === 'success'
        );

        if (!hasRecentSnapshot) {
          this.warnings.push({
            type: 'COHERENCE_CONNECTED_NO_SNAPSHOT',
            message: `syncStatus ${syncStatus.id} is 'connected' but has no successful snapshot`,
          });
        }
      }
    }

    // Rule: Integration should have at least one syncStatus
    for (const integration of this.canonical.integrations) {
      const hasSyncStatus = this.canonical.syncStatuses.some(s =>
        s.integrationId === integration.id
      );

      if (!hasSyncStatus && this.canonical.syncStatuses.length > 0) {
        this.warnings.push({
          type: 'COHERENCE_INTEGRATION_NO_SYNC',
          message: `integration ${integration.id} has no corresponding syncStatus`,
        });
      }
    }
  }
}

// ============================================================================
// MAIN VALIDATOR FUNCTION
// ============================================================================

export function validateBlockBSeed(): ValidationResult {
  try {
    console.log('[seed] Validando coerência do Bloco B...');

    const blockoBCanonical = buildBlockBSeed();
    const validator = new BlockBValidator(blockoBCanonical);
    const result = validator.validate();

    if (result.passed) {
      console.log('[seed] ✓ Validação de Bloco B passou.');
    } else {
      console.log('[seed] ✗ Validação de Bloco B encontrou erros:');
      for (const error of result.errors) {
        console.log(`  [${error.severity.toUpperCase()}] ${error.type}: ${error.message}`);
      }
      process.exit(1);
    }

    if (result.warnings.length > 0) {
      console.log('[seed] ⚠ Avisos durante validação:');
      for (const warning of result.warnings) {
        console.log(`  [WARNING] ${warning.type}: ${warning.message}`);
      }
    }

    return result;
  } catch (error) {
    console.error('[seed] Erro fatal durante validação de Bloco B:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export default validateBlockBSeed;
