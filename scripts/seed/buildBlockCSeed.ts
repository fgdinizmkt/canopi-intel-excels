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

// ============================================================================
// POPULATION FUNCTIONS
// ============================================================================

function populateCampaigns(): Campaign[] {
  const campaigns: Campaign[] = [
    // RD Station (Marketing Automation)
    createCampaign({
      id: 'camp_rd_station_automation_q1',
      name: 'Marketing Automation Basics — Q1 2026',
      type: 'inbound',
      channel: 'email',
      source: 'rd_station',
      startDate: '2026-02-15',
      endDate: '2026-03-30',
      budget: 15000,
      objective: 'Generate leads through email nurture series',
      targetAudience: 'Marketing & Operations managers',
      accountsReached: 12,
      accountsEngaged: 8,
      signalsGenerated: 4,
      isActive: true,
      performance: 68,
    }),
    createCampaign({
      id: 'camp_rd_station_whitepaper_governance',
      name: 'Whitepaper: Data Governance Essentials',
      type: 'inbound',
      channel: 'content',
      source: 'rd_station',
      startDate: '2026-02-20',
      endDate: '2026-04-13',
      budget: 12000,
      objective: 'Drive whitepaper downloads and qualification',
      targetAudience: 'Data governance and compliance leads',
      accountsReached: 18,
      accountsEngaged: 9,
      signalsGenerated: 6,
      isActive: true,
      performance: 72,
    }),
    // HubSpot (CRM)
    createCampaign({
      id: 'camp_hubspot_email_nurture_q1',
      name: 'Q1 Email Nurture Series',
      type: 'outbound',
      channel: 'email',
      source: 'hubspot',
      startDate: '2026-03-01',
      endDate: '2026-04-10',
      budget: 8000,
      objective: 'Nurture existing leads through automated sequences',
      targetAudience: 'Mid-market prospects',
      accountsReached: 15,
      accountsEngaged: 10,
      signalsGenerated: 3,
      isActive: true,
      performance: 65,
    }),
    createCampaign({
      id: 'camp_hubspot_success_checkin',
      name: 'Customer Success Check-in Campaign',
      type: 'outbound',
      channel: 'call',
      source: 'hubspot',
      startDate: '2026-03-15',
      endDate: '2026-04-13',
      budget: 6000,
      objective: 'Check in with existing customers on expansion opportunities',
      targetAudience: 'Current customers with 6+ months tenure',
      accountsReached: 8,
      accountsEngaged: 7,
      signalsGenerated: 2,
      isActive: true,
      performance: 78,
    }),
    // Google Ads
    createCampaign({
      id: 'camp_google_ads_search_enterprise',
      name: 'Search Ads — Enterprise Solutions',
      type: 'outbound',
      channel: 'paid',
      source: 'google_ads',
      startDate: '2026-02-01',
      endDate: '2026-04-13',
      budget: 35000,
      objective: 'Drive traffic from enterprise decision-makers',
      targetAudience: 'Enterprise companies searching for analytics solutions',
      accountsReached: 22,
      accountsEngaged: 14,
      signalsGenerated: 8,
      isActive: true,
      performance: 74,
    }),
    createCampaign({
      id: 'camp_google_ads_retargeting_q1',
      name: 'Retargeting Campaign — Q1 2026',
      type: 'outbound',
      channel: 'paid',
      source: 'google_ads',
      startDate: '2026-03-01',
      endDate: '2026-04-13',
      budget: 28000,
      objective: 'Re-engage users who visited website',
      targetAudience: 'Prior website visitors from target accounts',
      accountsReached: 19,
      accountsEngaged: 11,
      signalsGenerated: 5,
      isActive: true,
      performance: 69,
    }),
    // GA4 (Analytics)
    createCampaign({
      id: 'camp_ga4_content_hub',
      name: 'Website Content Hub',
      type: 'inbound',
      channel: 'website',
      source: 'ga4',
      startDate: '2026-01-01',
      endDate: '2026-04-13',
      budget: 20000,
      objective: 'Drive organic engagement through content',
      targetAudience: 'All website visitors interested in analytics',
      accountsReached: 35,
      accountsEngaged: 18,
      signalsGenerated: 10,
      isActive: true,
      performance: 76,
    }),
    createCampaign({
      id: 'camp_ga4_webinar_series_q1',
      name: 'Q1 Webinar Series — Analytics Best Practices',
      type: 'inbound',
      channel: 'event',
      source: 'ga4',
      startDate: '2026-02-15',
      endDate: '2026-03-25',
      budget: 18000,
      objective: 'Establish thought leadership and generate leads',
      targetAudience: 'Analytics practitioners and CTOs',
      accountsReached: 24,
      accountsEngaged: 16,
      signalsGenerated: 7,
      isActive: false,
      performance: 81,
    }),
    // Search Console (SEO)
    createCampaign({
      id: 'camp_search_console_seo_content',
      name: 'SEO Content Marketing Program',
      type: 'earned',
      channel: 'website',
      source: 'search_console',
      startDate: '2026-01-15',
      endDate: '2026-04-13',
      budget: 25000,
      objective: 'Drive organic traffic from search results',
      targetAudience: 'Users searching for enterprise analytics solutions',
      accountsReached: 28,
      accountsEngaged: 12,
      signalsGenerated: 6,
      isActive: true,
      performance: 73,
    }),
    // Salesforce (CRM)
    createCampaign({
      id: 'camp_salesforce_demo_trial',
      name: 'Demo & Trial Program',
      type: 'outbound',
      channel: 'call',
      source: 'salesforce',
      startDate: '2026-03-01',
      endDate: '2026-04-13',
      budget: 10000,
      objective: 'Convert qualified leads to trials',
      targetAudience: 'Sales-qualified leads',
      accountsReached: 11,
      accountsEngaged: 9,
      signalsGenerated: 4,
      isActive: true,
      performance: 67,
    }),
    createCampaign({
      id: 'camp_salesforce_proposal_track',
      name: 'Proposal & Negotiation Track',
      type: 'outbound',
      channel: 'call',
      source: 'salesforce',
      startDate: '2026-03-15',
      endDate: '2026-04-13',
      budget: 5000,
      objective: 'Accelerate deals in proposal stage',
      targetAudience: 'Accounts in proposal stage',
      accountsReached: 6,
      accountsEngaged: 5,
      signalsGenerated: 2,
      isActive: true,
      performance: 71,
    }),
    // Apollo (Enrichment)
    createCampaign({
      id: 'camp_apollo_prospect_research',
      name: 'Prospect Research & Outreach',
      type: 'outbound',
      channel: 'email',
      source: 'apollo',
      startDate: '2026-02-01',
      endDate: '2026-04-13',
      budget: 9000,
      objective: 'Enable personalized outreach with enriched data',
      targetAudience: 'New prospect companies in verticals of interest',
      accountsReached: 16,
      accountsEngaged: 6,
      signalsGenerated: 3,
      isActive: true,
      performance: 58,
    }),
    // BigQuery (Analytics)
    createCampaign({
      id: 'camp_bigquery_analytics_casestudy',
      name: 'Analytics Case Study Program',
      type: 'earned',
      channel: 'content',
      source: 'bigquery',
      startDate: '2026-03-01',
      endDate: '2026-04-13',
      budget: 14000,
      objective: 'Generate thought leadership through case studies',
      targetAudience: 'Enterprise analytics decision-makers',
      accountsReached: 10,
      accountsEngaged: 7,
      signalsGenerated: 4,
      isActive: true,
      performance: 72,
    }),
  ];

  return campaigns;
}

function populateInteractions(): Interaction[] {
  const interactions: Interaction[] = [];
  let interactionCounter = 1;

  // Helper function to add interaction
  const addInteraction = (
    accountId: string,
    type: Interaction['interactionType'],
    channel: string,
    source: string,
    date: string,
    description: string,
    campaignId?: string,
    relevance: number = 60
  ) => {
    interactions.push(
      createInteraction({
        id: `int_${accountId}_${interactionCounter++}`,
        accountId,
        campaignId,
        interactionType: type,
        timestamp: new Date(`${date}T${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00Z`).toISOString(),
        date,
        channel,
        direction: ['visit', 'download', 'email_open', 'email_click', 'content_consumption'].includes(type) ? 'inbound' : 'outbound',
        initiator: ['visit', 'download', 'email_open', 'email_click', 'content_consumption', 'submission'].includes(type) ? 'conta' : 'empresa',
        description,
        relevance,
        sentiment: Math.random() > 0.3 ? 'positive' : 'neutral',
        owner: ['call', 'demo', 'meeting'].includes(type) ? ['Mariana Costa', 'Leandro Silva', 'Paula Nogueira'][Math.floor(Math.random() * 3)] : undefined,
        followUpRequired: type === 'demo' || type === 'meeting' || type === 'submission',
        nextStep: ['demo', 'meeting', 'submission'].includes(type) ? 'Schedule follow-up call' : undefined,
        source,
        confidence: 75 + Math.floor(Math.random() * 25),
      })
    );
  };

  // Create interactions for each account (5-8 per account)
  for (const account of contasMock) {
    const isABM = account.tipoEstrategico === 'ABM';
    const isEarlyStage = ['Prospecção', 'Descoberta'].includes(account.etapa);
    const numInteractions = isEarlyStage ? 5 + Math.floor(Math.random() * 2) : 6 + Math.floor(Math.random() * 2);

    // Timeline: Feb 1 - Apr 13, distributed
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-04-13');
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const dates: string[] = [];
    for (let i = 0; i < numInteractions; i++) {
      const randomDay = Math.floor(Math.random() * days);
      const interactionDate = new Date(startDate.getTime() + randomDay * 24 * 60 * 60 * 1000);
      dates.push(interactionDate.toISOString().split('T')[0]);
    }
    dates.sort();

    // Pattern for ABM vs ABX
    if (isABM) {
      // ABM: More inbound, content-focused, gradual engagement
      addInteraction(account.id, 'visit', 'website', 'ga4', dates[0], 'Visited analytics solutions page', 'camp_ga4_content_hub', 45);
      addInteraction(account.id, 'download', 'website', 'ga4', dates[0] || dates[1], 'Downloaded whitepaper: Data Governance', 'camp_rd_station_whitepaper_governance', 65);
      addInteraction(account.id, 'email_open', 'email', 'rd_station', dates[1] || dates[2], 'Opened first nurture email', 'camp_rd_station_automation_q1', 55);

      if (numInteractions > 4) {
        addInteraction(account.id, 'email_click', 'email', 'rd_station', dates[2] || dates[3], 'Clicked CTA in nurture email', 'camp_rd_station_automation_q1', 70);
      }
      if (numInteractions > 5) {
        if (account.potencial > 75) {
          addInteraction(account.id, 'demo', 'call', 'hubspot', dates[3] || dates[4], 'Attended product demo', undefined, 85);
        } else {
          addInteraction(account.id, 'content_consumption', 'website', 'ga4', dates[3] || dates[4], 'Watched webinar recording', 'camp_ga4_webinar_series_q1', 60);
        }
      }
      if (numInteractions > 6) {
        addInteraction(account.id, 'meeting', 'call', 'hubspot', dates[4] || dates[5], 'Executive alignment call', undefined, 88);
      }
      if (numInteractions > 7) {
        addInteraction(account.id, 'submission', 'website', 'hubspot', dates[5] || dates[6], 'Requested pricing information', undefined, 78);
      }
    } else {
      // ABX: More CRM-driven, call/meeting-focused, expansion-oriented
      addInteraction(account.id, 'call', 'call', 'salesforce', dates[0], 'Customer success check-in call', 'camp_hubspot_success_checkin', 75);
      addInteraction(account.id, 'email_open', 'email', 'hubspot', dates[1], 'Opened expansion opportunity email', 'camp_hubspot_email_nurture_q1', 65);
      addInteraction(account.id, 'meeting', 'call', 'salesforce', dates[2], 'Expansion opportunity deep-dive meeting', undefined, 85);

      if (numInteractions > 4) {
        addInteraction(account.id, 'submission', 'website', 'hubspot', dates[3], 'Submitted expansion questionnaire', undefined, 72);
      }
      if (numInteractions > 5) {
        addInteraction(account.id, 'demo', 'call', 'salesforce', dates[4], 'Product feature demo for new module', 'camp_salesforce_demo_trial', 80);
      }
      if (numInteractions > 6) {
        addInteraction(account.id, 'call', 'call', 'salesforce', dates[4], 'Contract review call', 'camp_salesforce_proposal_track', 88);
      }
      if (numInteractions > 7) {
        addInteraction(account.id, 'visit', 'website', 'ga4', dates[5] || dates[6], 'Visited customer portal', 'camp_ga4_content_hub', 50);
      }
    }
  }

  return interactions;
}

export function buildBlockCSeed(): BlockoCCanonical {
  const campaigns = populateCampaigns();
  const interactions = populateInteractions();
  const playRecommendations: PlayRecommendation[] = [];

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
