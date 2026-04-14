/**
 * Validate Bloco C Seed Coherence
 *
 * Ensures Bloco C maintains logical consistency with:
 * - Valid account references (Bloco A)
 * - Valid campaign and play references
 * - Coherent interaction timestamps and types
 * - Play recommendations aligned with account state
 *
 * Called from scripts/seed/runBlockCSeed.sh
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildBlockCSeed, BlockoCCanonical } from './buildBlockCSeed';
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

class BlockCValidator {
  private canonical: BlockoCCanonical;
  private accountIds: Set<string>;
  private campaignIds: Set<string>;
  private playIds: Set<string>;
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(canonical: BlockoCCanonical) {
    this.canonical = canonical;
    this.accountIds = new Set(contasMock.map(a => a.id));
    this.campaignIds = new Set(canonical.campaigns.map(c => c.id));
    this.playIds = new Set(canonical.playPool.map(p => p.id));
  }

  /**
   * Run all validations
   */
  validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateStructure();
    this.validateCampaigns();
    this.validateInteractions();
    this.validatePlayRecommendations();
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
    if (!this.canonical.campaigns || !Array.isArray(this.canonical.campaigns)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'campaigns must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.interactions || !Array.isArray(this.canonical.interactions)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'interactions must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.playRecommendations || !Array.isArray(this.canonical.playRecommendations)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'playRecommendations must be an array',
        severity: 'critical',
      });
    }

    if (!this.canonical.playPool || !Array.isArray(this.canonical.playPool)) {
      this.errors.push({
        type: 'STRUCTURE',
        message: 'playPool must be an array',
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
   * Validate campaigns
   */
  private validateCampaigns(): void {
    for (const campaign of this.canonical.campaigns) {
      // Required fields
      if (!campaign.id) {
        this.errors.push({
          type: 'CAMPAIGN_ID',
          message: 'campaigns must have id',
          severity: 'error',
        });
      }

      if (!campaign.name) {
        this.errors.push({
          type: 'CAMPAIGN_NAME',
          message: `campaign ${campaign.id} must have name`,
          severity: 'error',
        });
      }

      if (!['inbound', 'outbound', 'earned', 'partnership'].includes(campaign.type)) {
        this.errors.push({
          type: 'CAMPAIGN_TYPE',
          message: `campaign ${campaign.id} has invalid type: ${campaign.type}`,
          severity: 'error',
        });
      }

      if (!campaign.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(campaign.startDate)) {
        this.errors.push({
          type: 'CAMPAIGN_DATE',
          message: `campaign ${campaign.id} has invalid startDate format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }

      if (campaign.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(campaign.endDate)) {
        this.errors.push({
          type: 'CAMPAIGN_DATE',
          message: `campaign ${campaign.id} has invalid endDate format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }

      if (campaign.performance !== undefined && (campaign.performance < 0 || campaign.performance > 100)) {
        this.errors.push({
          type: 'CAMPAIGN_PERFORMANCE',
          message: `campaign ${campaign.id} performance must be 0-100, got ${campaign.performance}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate interactions
   */
  private validateInteractions(): void {
    for (const interaction of this.canonical.interactions) {
      // Required fields
      if (!interaction.id) {
        this.errors.push({
          type: 'INTERACTION_ID',
          message: 'interactions must have id',
          severity: 'error',
        });
      }

      if (!this.accountIds.has(interaction.accountId)) {
        this.errors.push({
          type: 'INTERACTION_ACCOUNT_REF',
          message: `interaction ${interaction.id} references non-existent accountId: ${interaction.accountId}`,
          severity: 'error',
        });
      }

      if (
        interaction.campaignId &&
        !this.campaignIds.has(interaction.campaignId)
      ) {
        this.errors.push({
          type: 'INTERACTION_CAMPAIGN_REF',
          message: `interaction ${interaction.id} references non-existent campaignId: ${interaction.campaignId}`,
          severity: 'error',
        });
      }

      const validInteractionTypes = [
        'visit',
        'download',
        'email_open',
        'email_click',
        'call',
        'demo',
        'meeting',
        'submission',
        'event',
        'content_consumption',
      ];
      if (!validInteractionTypes.includes(interaction.interactionType)) {
        this.errors.push({
          type: 'INTERACTION_TYPE',
          message: `interaction ${interaction.id} has invalid interactionType: ${interaction.interactionType}`,
          severity: 'error',
        });
      }

      if (!interaction.timestamp || isNaN(new Date(interaction.timestamp).getTime())) {
        this.errors.push({
          type: 'INTERACTION_TIMESTAMP',
          message: `interaction ${interaction.id} has invalid timestamp: ${interaction.timestamp}`,
          severity: 'error',
        });
      }

      if (!interaction.date || !/^\d{4}-\d{2}-\d{2}$/.test(interaction.date)) {
        this.errors.push({
          type: 'INTERACTION_DATE',
          message: `interaction ${interaction.id} has invalid date format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }

      if (!['inbound', 'outbound'].includes(interaction.direction)) {
        this.errors.push({
          type: 'INTERACTION_DIRECTION',
          message: `interaction ${interaction.id} has invalid direction: ${interaction.direction}`,
          severity: 'error',
        });
      }

      if (!['conta', 'empresa'].includes(interaction.initiator)) {
        this.errors.push({
          type: 'INTERACTION_INITIATOR',
          message: `interaction ${interaction.id} has invalid initiator: ${interaction.initiator}`,
          severity: 'error',
        });
      }

      if (interaction.relevance < 0 || interaction.relevance > 100) {
        this.errors.push({
          type: 'INTERACTION_RELEVANCE',
          message: `interaction ${interaction.id} relevance must be 0-100, got ${interaction.relevance}`,
          severity: 'error',
        });
      }

      if (interaction.confidence < 0 || interaction.confidence > 100) {
        this.errors.push({
          type: 'INTERACTION_CONFIDENCE',
          message: `interaction ${interaction.id} confidence must be 0-100, got ${interaction.confidence}`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate play recommendations
   */
  private validatePlayRecommendations(): void {
    for (const play of this.canonical.playRecommendations) {
      // Required fields
      if (!play.id) {
        this.errors.push({
          type: 'PLAY_ID',
          message: 'playRecommendations must have id',
          severity: 'error',
        });
      }

      if (!this.accountIds.has(play.accountId)) {
        this.errors.push({
          type: 'PLAY_ACCOUNT_REF',
          message: `play ${play.id} references non-existent accountId: ${play.accountId}`,
          severity: 'error',
        });
      }

      if (!this.playIds.has(play.playId)) {
        this.errors.push({
          type: 'PLAY_PLAYID_REF',
          message: `play ${play.id} references non-existent playId: ${play.playId}`,
          severity: 'error',
        });
      }

      const validPlayTypes = ['entry', 'engagement', 'expansion', 'retention', 'reactivation'];
      if (!validPlayTypes.includes(play.playType)) {
        this.errors.push({
          type: 'PLAY_TYPE',
          message: `play ${play.id} has invalid playType: ${play.playType}`,
          severity: 'error',
        });
      }

      if (play.accountReadiness < 0 || play.accountReadiness > 100) {
        this.errors.push({
          type: 'PLAY_READINESS',
          message: `play ${play.id} accountReadiness must be 0-100, got ${play.accountReadiness}`,
          severity: 'error',
        });
      }

      if (play.confidenceScore < 0 || play.confidenceScore > 100) {
        this.errors.push({
          type: 'PLAY_CONFIDENCE',
          message: `play ${play.id} confidenceScore must be 0-100, got ${play.confidenceScore}`,
          severity: 'error',
        });
      }

      if (play.successProbability < 0 || play.successProbability > 100) {
        this.errors.push({
          type: 'PLAY_SUCCESS_PROB',
          message: `play ${play.id} successProbability must be 0-100, got ${play.successProbability}`,
          severity: 'error',
        });
      }

      if (play.startedAt && !/^\d{4}-\d{2}-\d{2}$/.test(play.startedAt)) {
        this.errors.push({
          type: 'PLAY_DATE',
          message: `play ${play.id} has invalid startedAt format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }

      if (play.nextStepDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(play.nextStepDeadline)) {
        this.errors.push({
          type: 'PLAY_DATE',
          message: `play ${play.id} has invalid nextStepDeadline format (must be YYYY-MM-DD)`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate coherence between tables
   */
  private validateCoherence(): void {
    // Rule: Each account should not have duplicate play recommendations
    const playsByAccount = new Map<string, Set<string>>();
    for (const play of this.canonical.playRecommendations) {
      if (!playsByAccount.has(play.accountId)) {
        playsByAccount.set(play.accountId, new Set());
      }
      const playIds = playsByAccount.get(play.accountId)!;
      if (playIds.has(play.playId)) {
        this.warnings.push({
          type: 'COHERENCE_DUPLICATE_PLAY',
          message: `account ${play.accountId} has duplicate play recommendation for ${play.playId}`,
        });
      }
      playIds.add(play.playId);
    }

    // Rule: If interaction has campaignId, campaign should exist
    // (This is already checked in validateInteractions, but we can add cross-table check here)

    // Rule: Account state coherence (if populated)
    if (this.canonical.playRecommendations.length > 0 && this.canonical.interactions.length === 0) {
      this.warnings.push({
        type: 'COHERENCE_PLAYS_NO_INTERACTIONS',
        message: 'playRecommendations exist but no interactions found — may indicate incomplete data',
      });
    }
  }
}

// ============================================================================
// MAIN VALIDATOR FUNCTION
// ============================================================================

export function validateBlockCSeed(): ValidationResult {
  try {
    console.log('[seed] Validando coerência do Bloco C...');

    const blockoCCanonical = buildBlockCSeed();
    const validator = new BlockCValidator(blockoCCanonical);
    const result = validator.validate();

    if (result.passed) {
      console.log('[seed] ✓ Validação de Bloco C passou.');
    } else {
      console.log('[seed] ✗ Validação de Bloco C encontrou erros:');
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
    console.error('[seed] Erro fatal durante validação de Bloco C:', error);
    process.exit(1);
  }
}

export default validateBlockCSeed;
