/**
 * Build Bloco C Seed — Campaigns, Interactions, Play Recommendations
 *
 * Constructs the canonical structure for:
 * - campaigns: Inbound/outbound campaigns that generated interest
 * - interactions: Touchpoints between company and account
 * - play_recommendations: Recommended next plays based on state and history
 *
 * This is the source of truth for Bloco C population.
 * Called from scripts/seed/exportBlockCSeedJson.ts and scripts/seed/validateBlockCSeed.ts
 */

import { contasMock } from '../../src/data/accountsData';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  type: 'inbound' | 'outbound' | 'earned' | 'partnership';
  channel: string;
  source: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  budget?: number;
  objective: string;
  targetAudience?: string;
  accountsReached: number;
  accountsEngaged: number;
  signalsGenerated: number;
  isActive: boolean;
  performance?: number; // 0-100
}

export interface Interaction {
  id: string;
  accountId: string;
  campaignId?: string;
  interactionType:
    | 'visit'
    | 'download'
    | 'email_open'
    | 'email_click'
    | 'call'
    | 'demo'
    | 'meeting'
    | 'submission'
    | 'event'
    | 'content_consumption';
  timestamp: string; // ISO 8601
  date: string; // YYYY-MM-DD
  channel: string;
  direction: 'inbound' | 'outbound';
  initiator: 'conta' | 'empresa';
  description: string;
  relevance: number; // 0-100
  sentiment?: 'positive' | 'neutral' | 'negative';
  owner?: string;
  followUpRequired: boolean;
  nextStep?: string;
  source: string;
  confidence: number; // 0-100
}

export interface PlayDefinition {
  id: string;
  name: string;
  category: 'ABM' | 'ABX' | 'operational' | 'retention';
  description: string;
  prerequisites: string[];
  idealTimelineWeeks: number;
  estimatedValueRange: { min: number; max: number }; // BRL
}

export interface PlayRecommendation {
  id: string;
  accountId: string;
  playId: string;
  playName: string;
  playType: 'entry' | 'engagement' | 'expansion' | 'retention' | 'reactivation';
  rationale: string;
  keySignals: string[];
  accountReadiness: number; // 0-100
  estimatedValue: number;
  timelineWeeks: number;
  confidenceScore: number; // 0-100
  isActive: boolean;
  startedAt?: string; // YYYY-MM-DD
  successProbability: number; // 0-100
  nextStepDescription: string;
  nextStepOwner?: string;
  nextStepDeadline?: string; // YYYY-MM-DD
}

export interface BlockoCCanonical {
  campaigns: Campaign[];
  interactions: Interaction[];
  playRecommendations: PlayRecommendation[];
  playPool: PlayDefinition[];
  metadata: {
    generatedAt: string;
    version: string;
    summary: {
      totalCampaigns: number;
      totalInteractions: number;
      totalPlayRecommendations: number;
      accountsWithPlays: number;
      interactionTypesCount: Record<string, number>;
    };
  };
}

// ============================================================================
// PLAY POOL — REFERENCE PRÉ-DEFINIDA
// ============================================================================

export const PlayPool: PlayDefinition[] = [
  {
    id: 'play_abm_entry_bi',
    name: 'ABM Entry — BI & Analytics',
    category: 'ABM',
    description: 'Entry play for BI & Analytics vertical: webinar → whitepaper → demo',
    prerequisites: ['inbound_signal', 'high_engagement'],
    idealTimelineWeeks: 6,
    estimatedValueRange: { min: 50000, max: 200000 },
  },
  {
    id: 'play_abm_entry_consulting',
    name: 'ABM Entry — Consulting',
    category: 'ABM',
    description: 'Entry play for Consulting: discovery → proposal → negotiation',
    prerequisites: ['strategic_intent', 'decision_maker_engaged'],
    idealTimelineWeeks: 8,
    estimatedValueRange: { min: 100000, max: 500000 },
  },
  {
    id: 'play_abm_entry_platform',
    name: 'ABM Entry — Platform',
    category: 'ABM',
    description: 'Entry play for Platform: freemium → upsell → contract',
    prerequisites: ['product_usage', 'expansion_signals'],
    idealTimelineWeeks: 4,
    estimatedValueRange: { min: 30000, max: 150000 },
  },
  {
    id: 'play_abx_expansion_crosssell',
    name: 'ABX Expansion — Cross-sell',
    category: 'ABX',
    description: 'Expand with additional products to existing customer',
    prerequisites: ['existing_contract', 'success_outcomes'],
    idealTimelineWeeks: 5,
    estimatedValueRange: { min: 25000, max: 100000 },
  },
  {
    id: 'play_abx_expansion_upsell',
    name: 'ABX Expansion — Upsell',
    category: 'ABX',
    description: 'Upgrade existing customer to higher tier',
    prerequisites: ['usage_growth', 'satisfaction_signals'],
    idealTimelineWeeks: 3,
    estimatedValueRange: { min: 15000, max: 75000 },
  },
  {
    id: 'play_abx_retention_risk',
    name: 'ABX Retention — Risk Mitigation',
    category: 'retention',
    description: 'Win-back play for at-risk customer',
    prerequisites: ['churn_signal', 'recent_disengagement'],
    idealTimelineWeeks: 4,
    estimatedValueRange: { min: 20000, max: 80000 },
  },
  {
    id: 'play_operational_govtech',
    name: 'Operational — GovTech Alignment',
    category: 'operational',
    description: 'Specialized play for government/public sector requirements',
    prerequisites: ['govtech_signals', 'regulatory_requirements'],
    idealTimelineWeeks: 12,
    estimatedValueRange: { min: 200000, max: 1000000 },
  },
];

// ============================================================================
// BUILDERS
// ============================================================================

export function createCampaign(overrides: Partial<Campaign>): Campaign {
  const defaults: Campaign = {
    id: `camp_${Date.now()}`,
    name: 'Campaign Name',
    type: 'inbound',
    channel: 'email',
    source: 'rd_station',
    startDate: '2026-01-01',
    objective: 'Generate leads',
    accountsReached: 0,
    accountsEngaged: 0,
    signalsGenerated: 0,
    isActive: true,
  };
  return { ...defaults, ...overrides };
}

export function createInteraction(overrides: Partial<Interaction>): Interaction {
  const defaults: Interaction = {
    id: `int_${Date.now()}`,
    accountId: '',
    interactionType: 'visit',
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    channel: 'website',
    direction: 'inbound',
    initiator: 'conta',
    description: 'Interaction occurred',
    relevance: 50,
    followUpRequired: false,
    source: 'ga4',
    confidence: 75,
  };
  return { ...defaults, ...overrides };
}

export function createPlayRecommendation(
  overrides: Partial<PlayRecommendation>
): PlayRecommendation {
  const defaults: PlayRecommendation = {
    id: `play_rec_${Date.now()}`,
    accountId: '',
    playId: 'play_abm_entry_bi',
    playName: 'ABM Entry — BI & Analytics',
    playType: 'entry',
    rationale: 'Recommended based on account state',
    keySignals: [],
    accountReadiness: 50,
    estimatedValue: 100000,
    timelineWeeks: 6,
    confidenceScore: 75,
    isActive: true,
    successProbability: 60,
    nextStepDescription: 'Schedule initial discovery call',
  };
  return { ...defaults, ...overrides };
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

export function buildBlockCSeed(): BlockoCCanonical {
  const campaigns: Campaign[] = [];
  const interactions: Interaction[] = [];
  const playRecommendations: PlayRecommendation[] = [];

  // TODO: Populate with realistic data for all 43 accounts
  // This is currently a scaffolding structure; population will be in next iteration

  const interactionTypesCount: Record<string, number> = {};
  for (const interaction of interactions) {
    interactionTypesCount[interaction.interactionType] =
      (interactionTypesCount[interaction.interactionType] || 0) + 1;
  }

  const accountsWithPlays = new Set(playRecommendations.map(p => p.accountId)).size;

  const canonical: BlockoCCanonical = {
    campaigns,
    interactions,
    playRecommendations,
    playPool: PlayPool,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      summary: {
        totalCampaigns: campaigns.length,
        totalInteractions: interactions.length,
        totalPlayRecommendations: playRecommendations.length,
        accountsWithPlays,
        interactionTypesCount,
      },
    },
  };

  return canonical;
}

export default buildBlockCSeed;
