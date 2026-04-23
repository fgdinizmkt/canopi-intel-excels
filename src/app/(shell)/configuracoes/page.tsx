"use client";

import React, { useState } from 'react';
import {
  Settings, Database, Users, Zap, Link2, Layers, MapPin, Save, X, Plus, Edit2,
  AlertCircle, CheckCircle, Clock, ChevronRight, Copy, Trash2, Eye, Maximize2, Minimize2, PlayCircle
} from 'lucide-react';
import { Card, Badge } from '../../../components/ui';

// ===== TIPOS =====
type EntityType = 'conta' | 'contato' | 'oportunidade' | 'campanha' | 'sinal' | 'acao' | 'stakeholder' | 'owner' | 'media' | 'event';
type CrmSystem = 'salesforce' | 'hubspot' | 'interno' | 'ga4' | 'google_ads' | 'meta' | 'linkedin' | 'crm';
type PublishStatus = 'draft' | 'pending_review' | 'published';
type SyncFreq = 'Tempo real' | '2 horas' | '4 horas' | '6 horas' | '12 horas' | 'Diário';
type ConflictPolicy = 'overwrite' | 'append' | 'manual_review';
type AttributionModel = 'last_touch' | 'first_touch' | 'multi_touch' | 'u_shaped' | 'linear' | 'w_shaped';

interface ConfigEntity {
  id: EntityType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fieldCount: number;
  customFieldCount: number;
  sourceOfTruth: CrmSystem | string;
  status: 'configured' | 'partial' | 'missing';
  lastModified: string;
  pendingChanges?: boolean;
}

interface MediaSource {
  id: string;
  name: string;
  platform: CrmSystem;
  status: 'connected' | 'partial' | 'error' | 'disconnected';
  accountName: string;
  syncFreq: SyncFreq;
  scope: string[];
  impact: string;
  pendingChanges?: boolean;
}

interface CanopiEvent {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  source: CrmSystem;
  status: 'active' | 'inactive' | 'validating';
  usage: ('performance' | 'signals' | 'attribution' | 'cockpit')[];
  value?: number;
  lastValidation?: string;
  destination: string;
}

interface AttributionConfig {
  model: AttributionModel;
  window: number; // dias
  priorities: CrmSystem[];
  normalizationRules: string[];
  conflictPolicy: 'ga4_beats_ads' | 'ads_beats_ga4' | 'crm_final_say';
}

interface TaxonomyRule {
  id: string;
  field: string;
  pattern: string;
  mandatory: boolean;
  canopiFlag?: 'abm' | 'abx' | 'play';
}

interface AudienceSync {
  id: string;
  platform: CrmSystem;
  audienceType: string;
  syncRule: string;
  refreshFreq: string;
  status: 'active' | 'inactive';
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  mandatory: boolean;
  owner?: string;
  duration?: string;
  criteria?: string;
  type: 'marketing' | 'sales';
  lossReasons?: string[];
}

interface MatchingRule {
  id: string;
  entity: 'conta' | 'contato';
  criteria: string;
  priority: number;
  enabled: boolean;
  conflictResolution: 'merge' | 'manual' | 'overwrite';
  fuzzyMatch: boolean;
}

interface StakeholderRole {
  id: string;
  name: string;
  enabled: boolean;
  seniority: 'C-Level' | 'Diretoria' | 'Gerência' | 'Especialista';
  priority: number;
  roleType: 'sponsor' | 'champion' | 'budget_holder' | 'technical' | 'procurement' | 'user';
}

interface RequiredField {
  id: string;
  entity: EntityType;
  fieldName: string;
  mandatory: boolean;
  source: CrmSystem;
  validation?: string;
  visibility: 'internal' | 'external';
  editable: boolean;
}

interface ScoringRule {
  id: string;
  name: string;
  active: boolean;
  weight: number;
  components: { name: string; weight: number; source: string }[];
  threshold: number;
  impact: string;
  description: string;
}

interface SignalConfig {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: string;
  cooldownDays: number;
  defaultOwner: string;
  slaHours: number;
  triggerCondition: string;
  sourceDependency: string[];
}

interface RoutingRule {
  id: string;
  name: string;
  criteria: string;
  target: string;
  priority: number;
  slaQueue: number;
  fallback: string;
}

interface Play {
  id: string;
  name: string;
  category: 'Expansion' | 'Acquisition' | 'Retention' | 'Nurturing';
  type: string;
  defaultOwner: string;
  activationStage: string;
  suggestedChannel: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  preConditions: string[];
  successCriteria: string;
  cancelCriteria: string;
  status: 'draft' | 'pending' | 'validated' | 'published';
}

interface ABMConfig {
  icp: {
    verticals: string[];
    employeeRange: string[];
    revenueMin: number;
    technographics: string[];
  };
  tiers: {
    id: string;
    label: string;
    criteria: string;
    playbooks: string[];
    minCoverage: number;
  }[];
  clusters: {
    id: string;
    name: string;
    logic: string;
  }[];
}

interface ABXConfig {
  journeyStages: string[];
  sponsorLogic: string;
  championLogic: string;
  committeeMaturityThreshold: number;
  multiThreadingTrigger: string;
  stagnationRiskDays: number;
  expansionReadinessCriteria: string[];
  orchestrationRules: {
    event: string;
    action: string;
    handoff: string;
  }[];
}

interface IntelligenceInsight {
  id: string;
  name: string;
  description: string;
  propagationRule: string;
  confidenceScore: number;
  validityDays: number;
  scope: 'global' | 'cluster' | 'vertical';
  category: 'mídia' | 'plays' | 'sinais' | 'comitê';
  status: 'draft' | 'validated' | 'active' | 'archived';
}

interface Learning {
  id: string;
  name: string;
  type: 'Pattern' | 'Prediction' | 'Anomalies';
  originContext: string;
  destinationContext: string;
  recommendation: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  expiresAt: string;
  owner: string;
  status: 'active' | 'pending' | 'expired';
}

interface GovernanceConfig {
  version: string;
  publishPolicy: 'manual' | 'automatic' | 'peer_review';
  environments: ('dev' | 'staging' | 'prod')[];
  historySize: number;
  visibility: 'private' | 'internal' | 'shared';
  manualAuditRequired: boolean;
}

interface PermissionProfile {
  id: string;
  role: string;
  domains: {
    name: string;
    level: 'none' | 'view' | 'edit' | 'publish' | 'admin';
  }[];
}

type ActiveTab = 'objetos' | 'source' | 'pipeline' | 'campos' | 'owners' | 'matching' | 'hierarquia' | 'midia' | 'conversoes' | 'atribuicao' | 'audiencias' | 'scores' | 'sinais' | 'roteamento' | 'plays' | 'abm' | 'abx' | 'exchange' | 'learnings' | 'governanca' | 'permissoes';

const ConfigStage1: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('objetos');
  const [drawer, setDrawer] = useState<{ type: string; id?: string } | null>(null);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // ===== ETAPA 3 STATE: SCORES =====
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([
    {
      id: 'lead-fit',
      name: 'Lead Fit Score',
      active: true,
      weight: 30,
      components: [
        { name: 'ICP Match', weight: 50, source: 'LinkedIn/CRM' },
        { name: 'Tecnografia', weight: 30, source: 'Canopi Crawler' },
        { name: 'Volume de Contatos', weight: 20, source: 'CRM' }
      ],
      threshold: 70,
      impact: 'Define a qualificação inicial da conta para ABX.',
      description: 'Avalia a aderência do perfil da empresa ao Ideal Customer Profile.'
    },
    {
      id: 'engagement',
      name: 'Engagement Score',
      active: true,
      weight: 25,
      components: [
        { name: 'Atividade Web', weight: 40, source: 'GA4' },
        { name: 'Abertura Email', weight: 30, source: 'HubSpot' },
        { name: 'Interações Sales', weight: 30, source: 'Canopi History' }
      ],
      threshold: 60,
      impact: 'Determina a urgência de abordagem no Cockpit.',
      description: 'Mede a intensidade da interação da conta nos últimos 30 dias.'
    },
    {
      id: 'abx-readiness',
      name: 'ABX Readiness',
      active: true,
      weight: 20,
      components: [
        { name: 'Completo do Comitê', weight: 60, source: 'Stakeholder Map' },
        { name: 'Intenção Externas', weight: 40, source: 'Signals API' }
      ],
      threshold: 80,
      impact: 'Ativa recomendações de Plays de expansão/fechamento.',
      description: 'Avalia se a conta possui maturidade relacional para uma transição ABX.'
    }
  ]);

  // ===== ETAPA 3 STATE: SINAIS =====
  const [signalConfigs, setSignalConfigs] = useState<SignalConfig[]>([
    {
      id: 'high-intent',
      name: 'Alta Intenção de Compra',
      category: 'Inbound',
      severity: 'critical',
      threshold: 'Acesso a página de preços + Demo Request',
      cooldownDays: 7,
      defaultOwner: 'SDR Team',
      slaHours: 2,
      triggerCondition: 'Event(pricing_view) AND Event(demo_request)',
      sourceDependency: ['GA4', 'Conversions']
    },
    {
      id: 'stagnation-risk',
      name: 'Risco de Estagnação',
      category: 'Pipeline',
      severity: 'medium',
      threshold: '+15 dias sem interação válida',
      cooldownDays: 30,
      defaultOwner: 'Account Manager',
      slaHours: 24,
      triggerCondition: 'DaysSince(last_interaction) > 15',
      sourceDependency: ['CRM', 'Interactions']
    },
    {
      id: 'committee-missing',
      name: 'Comitê Incompleto p/ ABM',
      category: 'ABM',
      severity: 'high',
      threshold: 'Shadow Account detectada sem Decisor mapeado',
      cooldownDays: 14,
      defaultOwner: 'ABM Lead',
      slaHours: 48,
      triggerCondition: 'Count(Stakeholder[type==Decisor]) == 0',
      sourceDependency: ['Stakeholder Map']
    }
  ]);

  // ===== ETAPA 3 STATE: ROTEAMENTO =====
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([
    {
      id: 'critical-routing',
      name: 'Urgência Crítica',
      criteria: 'severity == "critical"',
      target: 'Head of Sales / Oncall SDR',
      priority: 1,
      slaQueue: 1,
      fallback: 'Operador de Plantão'
    },
    {
      id: 'enterprise-routing',
      name: 'Tier 1 Accounts',
      criteria: 'account_tier == "Enterprise" OR potential > 100k',
      target: 'Strategic Account Executive',
      priority: 2,
      slaQueue: 4,
      fallback: 'General Pool'
    },
    {
      id: 'source-based',
      name: 'Inbound GA4 Routing',
      criteria: 'signal_source == "GA4"',
      target: 'Inbound Team',
      priority: 3,
      slaQueue: 8,
      fallback: 'SDR Team'
    }
  ]);

  // ===== ETAPA 4 STATE: PLAYS =====
  const [plays, setPlays] = useState<Play[]>([
    {
      id: 'exec-intro',
      name: 'Executive Introduction',
      category: 'Acquisition',
      type: '1-to-1 Outreach',
      defaultOwner: 'Account Executive',
      activationStage: 'Target Account',
      suggestedChannel: 'LinkedIn + Email',
      priority: 'high',
      preConditions: ['ICP Match == Custom', 'Stakeholder[type==Decision Holder] mapped'],
      successCriteria: 'Discovery Call scheduled',
      cancelCriteria: 'No response after 3 attempts',
      status: 'published'
    },
    {
      id: 'stakeholder-exp',
      name: 'Stakeholder Expansion',
      category: 'Expansion',
      type: 'Warm Intro',
      defaultOwner: 'SDR Team',
      activationStage: 'Discovery',
      suggestedChannel: 'Email Thread',
      priority: 'medium',
      preConditions: ['Main Stakeholder engaged', 'Committee Completeness < 60%'],
      successCriteria: '2+ new stakeholders mapped',
      cancelCriteria: 'Gatekeeper refusal',
      status: 'validated'
    },
    {
      id: 'Expansion Motion',
      name: 'Expansion Motion',
      category: 'Expansion',
      type: 'Upsell Play',
      defaultOwner: 'Customer Success',
      activationStage: 'Customer',
      suggestedChannel: 'Review Meeting',
      priority: 'critical',
      preConditions: ['Health Score > 80', 'Expansion Readiness == High'],
      successCriteria: 'Expansion opportunity created',
      cancelCriteria: 'Contract renewal pending',
      status: 'draft'
    }
  ]);

  // ===== ETAPA 4 STATE: ABM =====
  const [abmConfig, setAbmConfig] = useState<ABMConfig>({
    icp: {
      verticals: ['SaaS', 'Fintech', 'Energy', 'GovTech'],
      employeeRange: ['500-1000', '1000-5000', '5000+'],
      revenueMin: 50000000,
      technographics: ['Salesforce', 'HubSpot', 'SAP', 'AWS']
    },
    tiers: [
      { id: 'tier-1', label: 'Tier 1 - Strategic', criteria: 'Revenue > 1B OR High Strategic Value', playbooks: ['1-to-1 Hyper-personalized'], minCoverage: 80 },
      { id: 'tier-2', label: 'Tier 2 - Scale', criteria: 'Revenue > 100M AND Fit Tier == A', playbooks: ['1-to-few Segmented'], minCoverage: 60 },
      { id: 'tier-3', label: 'Tier 3 - Programmatic', criteria: 'Fit Tier == A or B', playbooks: ['1-to-many Automated'], minCoverage: 30 }
    ],
    clusters: [
      { id: 'clu-fin', name: 'Financial Services Latam', logic: 'Vertical == Finance AND Region == LATAM' },
      { id: 'clu-tech', name: 'Mid-Market SaaS US', logic: 'Vertical == SaaS AND Employees < 1000 AND Region == US' }
    ]
  });

  // ===== ETAPA 4 STATE: ABX =====
  const [abxConfig, setAbxConfig] = useState<ABXConfig>({
    journeyStages: ['Unaware', 'Aware', 'Engaged', 'Discovery', 'Evaluation', 'Negotiation', 'Closed Won', 'Expansion'],
    sponsorLogic: 'Highest seniority stakeholder with positive sentiment',
    championLogic: 'Stakeholder with highest interaction frequency in last 30 days',
    committeeMaturityThreshold: 75,
    multiThreadingTrigger: 'Committee Size < 3 AND Journey Stage == Discovery',
    stagnationRiskDays: 14,
    expansionReadinessCriteria: ['Health Score > 80', 'Contract > 6 months', 'Active Usage > 70%'],
    orchestrationRules: [
      { event: 'Intent Signal: High', action: 'Activate Exec Intro Play', handoff: 'Marketing -> Sales' },
      { event: 'Opp Created', action: 'Activate Committee Expansion Play', handoff: 'Sales -> Solutions' },
      { event: 'High Stagnation Risk', action: 'Activate Re-engagement Play', handoff: 'Sales -> AM' }
    ]
  });

  // ===== ETAPA 5 STATE: INTELLIGENCE EXCHANGE =====
  const [exchangeInsights, setExchangeInsights] = useState<IntelligenceInsight[]>([
    {
      id: 'ins-ind-ent',
      name: 'Industrial Enterprise Play Optimization',
      description: 'Plays de Executive Introduction performam 40% melhor na vertical industrial com contas Enterprise.',
      propagationRule: 'ABM -> ABX (Vertical == Industrial)',
      confidenceScore: 92,
      validityDays: 180,
      scope: 'vertical',
      category: 'plays',
      status: 'active'
    },
    {
      id: 'ins-comm-inc',
      name: 'Incomplete Committee Predication',
      description: 'Sinais de intenção alta em contas com comitê < 40% indicam risco de ghosting em 15 dias.',
      propagationRule: 'ABX -> ABM (Global)',
      confidenceScore: 85,
      validityDays: 90,
      scope: 'global',
      category: 'sinais',
      status: 'validated'
    }
  ]);

  const [learnings, setLearnings] = useState<Learning[]>([
    {
      id: 'lrn-001',
      name: 'Decision Maker Ghosting Pattern',
      type: 'Pattern',
      originContext: 'ABX Negotiation',
      destinationContext: 'ABM Nurturing',
      recommendation: 'Trigger re-engagement play via Sponsor intro',
      confidenceLevel: 'High',
      expiresAt: '2026-10-20',
      owner: 'Cadu (Data Science)',
      status: 'active'
    }
  ]);

  const [governance, setGovernance] = useState<GovernanceConfig>({
    version: 'v2.4.0',
    publishPolicy: 'peer_review',
    environments: ['staging', 'prod'],
    historySize: 50,
    visibility: 'internal',
    manualAuditRequired: true
  });

  const [permissions, setPermissions] = useState<PermissionProfile[]>([
    {
      id: 'prof-admin',
      role: 'Growth Admin',
      domains: [
        { name: 'mídia', level: 'admin' },
        { name: 'CRM', level: 'admin' },
        { name: 'sinais', level: 'admin' },
        { name: 'exchange', level: 'admin' }
      ]
    },
    {
      id: 'prof-mkt',
      role: 'Marketing Op',
      domains: [
        { name: 'mídia', level: 'publish' },
        { name: 'sinais', level: 'edit' },
        { name: 'ABM', level: 'view' },
        { name: 'exchange', level: 'view' }
      ]
    }
  ]);

  // ===== ESTADO: OBJETOS (ETAPA 1) =====
  const [entities] = useState<ConfigEntity[]>([
    { id: 'conta', name: 'Conta', icon: Database, description: 'Empresa-alvo, prospect ou cliente', fieldCount: 28, customFieldCount: 5, sourceOfTruth: 'salesforce', status: 'configured', lastModified: '2026-04-15' },
    { id: 'contato', name: 'Contato', icon: Users, description: 'Stakeholder, decisor, influenciador', fieldCount: 18, customFieldCount: 3, sourceOfTruth: 'hubspot', status: 'configured', lastModified: '2026-04-20' },
    { id: 'oportunidade', name: 'Oportunidade', icon: Zap, description: 'Deal, proposta, projeto em venda', fieldCount: 12, customFieldCount: 2, sourceOfTruth: 'salesforce', status: 'configured', lastModified: '2026-04-18' },
    { id: 'campanha', name: 'Campanha', icon: Link2, description: 'Iniciativa de marketing, outreach, conteúdo', fieldCount: 14, customFieldCount: 4, sourceOfTruth: 'hubspot', status: 'partial', lastModified: '2026-04-12', pendingChanges: true },
    { id: 'sinal', name: 'Sinal', icon: Layers, description: 'Mudança, alerta, tendência, oportunidade', fieldCount: 9, customFieldCount: 0, sourceOfTruth: 'interno', status: 'configured', lastModified: '2026-04-22' },
    { id: 'acao', name: 'Ação', icon: CheckCircle, description: 'Task, recomendação, play, intervenção', fieldCount: 11, customFieldCount: 1, sourceOfTruth: 'interno', status: 'configured', lastModified: '2026-04-21' },
    { id: 'stakeholder', name: 'Stakeholder', icon: Users, description: 'Papéis e influência no comitê', fieldCount: 5, customFieldCount: 0, sourceOfTruth: 'interno', status: 'partial', lastModified: '2026-04-22' },
    { id: 'owner', name: 'Owner', icon: Zap, description: 'Responsáveis e roteamento', fieldCount: 4, customFieldCount: 0, sourceOfTruth: 'interno', status: 'configured', lastModified: '2026-04-22' }
  ]);

  // ===== ESTADO: SOURCE OF TRUTH =====
  const [sourceOfTruth] = useState<Record<EntityType, { primary: CrmSystem; secondary?: CrmSystem; syncFreq: SyncFreq; fallback: string; conflictPolicy: ConflictPolicy }>>({
    conta: { primary: 'salesforce', secondary: 'hubspot', syncFreq: '6 horas', fallback: 'Revisão manual', conflictPolicy: 'manual_review' },
    contato: { primary: 'hubspot', secondary: 'salesforce', syncFreq: '2 horas', fallback: 'Manual', conflictPolicy: 'overwrite' },
    oportunidade: { primary: 'salesforce', syncFreq: '4 horas', fallback: 'Último update vence', conflictPolicy: 'overwrite' },
    campanha: { primary: 'hubspot', secondary: 'interno', syncFreq: 'Diário', fallback: 'Entrada manual', conflictPolicy: 'append' },
    sinal: { primary: 'interno', syncFreq: 'Tempo real', fallback: 'N/A', conflictPolicy: 'overwrite' },
    acao: { primary: 'interno', syncFreq: 'Tempo real', fallback: 'N/A', conflictPolicy: 'overwrite' },
    stakeholder: { primary: 'interno', syncFreq: 'Tempo real', fallback: 'N/A', conflictPolicy: 'overwrite' },
    owner: { primary: 'interno', syncFreq: 'Tempo real', fallback: 'N/A', conflictPolicy: 'overwrite' },
    media: { primary: 'ga4', syncFreq: '2 horas', fallback: 'Manual', conflictPolicy: 'manual_review' },
    event: { primary: 'interno', syncFreq: 'Tempo real', fallback: 'N/A', conflictPolicy: 'overwrite' },
  });

  // ===== ESTADO: FONTES DE MÍDIA (ETAPA 2) =====
  const [mediaSources] = useState<MediaSource[]>([
    { id: '1', name: 'Google Analytics 4', platform: 'ga4', status: 'connected', accountName: 'Canopi Main - 123456', syncFreq: '2 horas', scope: ['página', 'evento', 'usuário'], impact: 'Desempenho Inbound' },
    { id: '2', name: 'Google Ads', platform: 'google_ads', status: 'partial', accountName: 'Canopi Performance', syncFreq: '4 horas', scope: ['campanha', 'conversão'], impact: 'ROI de Mídia' },
    { id: '3', name: 'Meta Ads', platform: 'meta', status: 'error', accountName: 'Canopi FB/IG', syncFreq: 'Diário', scope: ['campanha'], impact: 'Social Leads', pendingChanges: true },
    { id: '4', name: 'LinkedIn Ads', platform: 'linkedin', status: 'connected', accountName: 'Canopi B2B', syncFreq: '6 horas', scope: ['campanha', 'leads'], impact: 'ABM Audiences' },
  ]);

  // ===== ESTADO: EVENTOS E CONVERSÕES (ETAPA 2) =====
  const [canopiEvents] = useState<CanopiEvent[]>([
    { id: 'e1', name: 'page_view_pricing', type: 'secondary', source: 'ga4', status: 'active', usage: ['performance', 'signals'], destination: 'Canopi Dashboard' },
    { id: 'e2', name: 'demo_request_form_submit', type: 'primary', source: 'interno', status: 'active', usage: ['performance', 'signals', 'attribution', 'cockpit'], value: 500, destination: 'CRM + Slack' },
    { id: 'e3', name: 'pricing_calculator_use', type: 'secondary', source: 'ga4', status: 'validating', usage: ['performance'], destination: 'Canopi' },
    { id: 'e4', name: 'webinar_registration', type: 'primary', source: 'linkedin', status: 'active', usage: ['performance', 'signals'], value: 150, destination: 'CRM' },
    { id: 'e5', name: 'opportunity_created', type: 'primary', source: 'crm', status: 'active', usage: ['attribution', 'cockpit'], value: 2000, destination: 'Internal Reports' },
  ]);

  // ===== ESTADO: ATRIBUIÇÃO (ETAPA 2) =====
  const [attribution] = useState<AttributionConfig>({
    model: 'multi_touch',
    window: 30,
    priorities: ['ga4', 'google_ads', 'crm'],
    normalizationRules: ['Lowercase UTMs', 'Remove Aliases', 'Consolidate Social'],
    conflictPolicy: 'ga4_beats_ads'
  });

  // ===== ESTADO: TAXONOMIA (ETAPA 2) =====
  const [taxonomyRules] = useState<TaxonomyRule[]>([
    { id: '1', field: 'utm_source', pattern: 'ga4_standards', mandatory: true },
    { id: '2', field: 'utm_medium', pattern: 'paid|organic|owned', mandatory: true },
    { id: '3', field: 'utm_campaign', pattern: 'v[0-9]_{vertical}_{cluster}', mandatory: true, canopiFlag: 'play' },
    { id: '4', field: 'abm_flag', pattern: 'true|false', mandatory: false, canopiFlag: 'abm' },
  ]);

  // ===== ESTADO: AUDIENCIAS (ETAPA 2) =====
  const [audienceSyncs] = useState<AudienceSync[]>([
    { id: 'a1', platform: 'linkedin', audienceType: 'ABM Targets', syncRule: 'Account Status = Target', refreshFreq: 'Diário', status: 'active' },
    { id: 'a2', platform: 'google_ads', audienceType: 'Remarketing Pricing', syncRule: 'Event = pricing_view', refreshFreq: '4 horas', status: 'active' },
    { id: 'a3', platform: 'meta', audienceType: 'Lookalike High Potential', syncRule: 'Score > 80', refreshFreq: 'Semanal', status: 'inactive' },
  ]);

  // ===== ESTADO: PIPELINE STAGES =====
  const [pipelineStages] = useState<PipelineStage[]>([
    { id: 'm1', name: 'MQL', order: 1, mandatory: true, owner: 'Marketing', duration: '1-3 dias', criteria: 'Lead score > 50', type: 'marketing', lossReasons: ['Spam', 'Fora do ICP', 'Dados Inválidos'] },
    { id: 'm2', name: 'SQL/SAL', order: 2, mandatory: true, owner: 'SDR', duration: '1-2 dias', criteria: 'BANT inicial', type: 'marketing', lossReasons: ['Sem Budget', 'Sem Timing'] },
    { id: 's1', name: 'Qualificação AE', order: 3, mandatory: true, owner: 'AE', duration: '3-5 dias', criteria: 'Budget confirmado', type: 'sales', lossReasons: ['Preço', 'Concorrência'] },
    { id: 's2', name: 'Proposta', order: 4, mandatory: true, owner: 'AE', duration: '5-7 dias', criteria: 'Proposta enviada', type: 'sales' },
    { id: 's3', name: 'Negociação', order: 5, mandatory: false, owner: 'AE/Gerente', duration: '3-14 dias', criteria: 'Termos discutidos', type: 'sales' },
    { id: 's4', name: 'Fechamento', order: 6, mandatory: true, owner: 'AE', duration: '5-30 dias', criteria: 'Aguardando ass', type: 'sales' },
  ]);

  // ===== ESTADO: CAMPOS OBRIGATÓRIOS =====
  const [requiredFields] = useState<RequiredField[]>([
    { id: '1', entity: 'conta', fieldName: 'Nome Canônico', mandatory: true, source: 'salesforce', visibility: 'external', editable: false },
    { id: '2', entity: 'conta', fieldName: 'Domínio', mandatory: true, source: 'salesforce', visibility: 'external', editable: false },
    { id: '3', entity: 'conta', fieldName: 'Tier / ICP', mandatory: true, source: 'interno', visibility: 'internal', editable: true },
    { id: '4', entity: 'conta', fieldName: 'Vertical Principal', mandatory: true, source: 'salesforce', visibility: 'external', editable: true },
    { id: '5', entity: 'contato', fieldName: 'Cargo Normalizado', mandatory: true, source: 'interno', visibility: 'internal', editable: true },
    { id: '6', entity: 'contato', fieldName: 'Stakeholder Role', mandatory: true, source: 'interno', visibility: 'internal', editable: true },
    { id: '7', entity: 'contato', fieldName: 'Influência', mandatory: true, source: 'interno', visibility: 'internal', editable: true },
    { id: '8', entity: 'oportunidade', fieldName: 'Stage', mandatory: true, source: 'salesforce', visibility: 'external', editable: true },
    { id: '9', entity: 'oportunidade', fieldName: 'Valor Estimado', mandatory: true, source: 'salesforce', visibility: 'external', editable: true },
  ]);

  // ===== ESTADO: STAKEHOLDER ROLES =====
  const [stakeholderRoles] = useState<StakeholderRole[]>([
    { id: '1', name: 'Executive Sponsor', enabled: true, seniority: 'C-Level', priority: 1, roleType: 'sponsor' },
    { id: '2', name: 'Champion', enabled: true, seniority: 'Diretoria', priority: 2, roleType: 'champion' },
    { id: '3', name: 'Budget Holder', enabled: true, seniority: 'C-Level', priority: 1, roleType: 'budget_holder' },
    { id: '4', name: 'Technical Evaluator', enabled: true, seniority: 'Gerência', priority: 3, roleType: 'technical' },
    { id: '5', name: 'Procurement', enabled: true, seniority: 'Diretoria', priority: 4, roleType: 'procurement' },
    { id: '6', name: 'User Rep', enabled: true, seniority: 'Especialista', priority: 5, roleType: 'user' },
  ]);

  // ===== ESTADO: MATCHING RULES =====
  const [matchingRules] = useState<MatchingRule[]>([
    { id: '1', entity: 'conta', criteria: 'Domínio Exato', priority: 1, enabled: true, conflictResolution: 'merge', fuzzyMatch: false },
    { id: '2', entity: 'conta', criteria: 'Aliases de Nome', priority: 2, enabled: true, conflictResolution: 'manual', fuzzyMatch: true },
    { id: '3', entity: 'conta', criteria: 'Parent/Child relationship', priority: 3, enabled: true, conflictResolution: 'merge', fuzzyMatch: false },
    { id: '4', entity: 'contato', criteria: 'Email Primário', priority: 1, enabled: true, conflictResolution: 'merge', fuzzyMatch: false },
    { id: '5', entity: 'contato', criteria: 'LinkedIn URL', priority: 2, enabled: true, conflictResolution: 'manual', fuzzyMatch: false },
  ]);

  // ===== TAB: OBJETOS =====
  const ObjectsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-600 uppercase mb-1">Entidades Configuradas</p>
          <p className="text-3xl font-black text-emerald-600">{entities.filter(e => e.status === 'configured').length}</p>
        </Card>
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-600 uppercase mb-1">Campos Totais</p>
          <p className="text-3xl font-black text-blue-600">{entities.reduce((sum, e) => sum + e.fieldCount + e.customFieldCount, 0)}</p>
        </Card>
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-bold text-slate-600 uppercase mb-1">Status Global</p>
          <p className="text-lg font-black text-slate-900 capitalize">{publishStatus.replace('_', ' ')}</p>
        </Card>
      </div>

      <div className="space-y-3">
        {entities.map((entity) => {
          const statusColor = { configured: 'emerald', partial: 'amber', missing: 'red' }[entity.status];
          const Icon = entity.icon;

          return (
            <Card key={entity.id} className="p-4 rounded-2xl hover:border-blue-300 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    <Icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-slate-900">{entity.name}</h3>
                      <Badge className={`bg-${statusColor}-100 text-${statusColor}-700`}>
                        {entity.status === 'configured' ? 'Configurado' : entity.status === 'partial' ? 'Parcial' : 'Faltando'}
                      </Badge>
                      {entity.pendingChanges && (
                        <Badge className="bg-amber-100 text-amber-700 animate-pulse">Alterações Pendentes</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{entity.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {entity.fieldCount} base + {entity.customFieldCount} extra • Fonte: <span className="font-bold">{entity.sourceOfTruth}</span> • Modificado: {entity.lastModified}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawer({ type: 'entity', id: entity.id })}
                  className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-all"
                  title="Configurar Entidade"
                >
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ===== TAB: SOURCE OF TRUTH =====
  const SourceOfTruthSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Políticas de Fonte de Verdade</h3>
        <div className="space-y-4">
          {Object.entries(sourceOfTruth).map(([entity, config]) => (
            <div key={entity} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-900 capitalize">{entity}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 capitalize">{config.primary}</Badge>
                  {config.secondary && <Badge className="bg-slate-100 text-slate-700 capitalize">+ {config.secondary}</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-600">Política de Conflito</p>
                  <p className="text-slate-900 capitalize">{config.conflictPolicy.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Sync</p>
                  <p className="text-slate-900">{config.syncFreq}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Fallback</p>
                  <p className="text-slate-900">{config.fallback}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: PIPELINE =====
  const PipelineSection = () => (
    <div className="space-y-6">
      {['marketing', 'sales'].map((type) => (
        <Card key={type} className="p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 capitalize">Pipeline: {type}</h3>
            <button
              className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              title={`Adicionar estágio ao pipeline de ${type}`}
            >
              <Plus className="w-4 h-4" />
              Novo Estágio
            </button>
          </div>

          <div className="space-y-2">
            {pipelineStages.filter(s => s.type === type).map((stage) => (
              <div key={stage.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">{stage.order}</div>
                    <div>
                      <p className="font-bold text-slate-900">{stage.name}</p>
                      <p className="text-xs text-slate-600">Critério: {stage.criteria}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.mandatory && <Badge className="bg-red-100 text-red-700">Obrigatório</Badge>}
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title={`Editar estágio ${stage.name}`}
                    >
                      <Edit2 className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 ml-11">
                  <span><strong>Owner:</strong> {stage.owner}</span>
                  <span><strong>Duração:</strong> {stage.duration}</span>
                </div>
                {stage.lossReasons && stage.lossReasons.length > 0 && (
                  <div className="mt-3 ml-11 flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold text-slate-500 w-full mb-1 uppercase">Motivos de Perda/Desqualificação:</span>
                    {stage.lossReasons.map(r => (
                      <Badge key={r} className="bg-slate-50 text-slate-500 border border-slate-200">{r}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  // ===== TAB: CAMPOS =====
  const FieldsSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Mapeamento de Campos Críticos (Conta & Contato)</h3>
        <div className="space-y-6">
          {(['conta', 'contato', 'oportunidade'] as EntityType[]).map((entityType) => {
            const fields = requiredFields.filter(f => f.entity === entityType);
            return (
              <div key={entityType}>
                <h4 className="font-bold text-slate-700 capitalize mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {entityType}
                </h4>
                <div className="space-y-2 mb-4">
                  {fields.map((field) => (
                    <div key={field.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{field.fieldName}</p>
                          <Badge className={field.visibility === 'internal' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                            {field.visibility === 'internal' ? 'Uso Interno' : 'Externo/Visível'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Fonte: <span className="font-bold">{field.source}</span> • {field.editable ? 'Editável' : 'Leitura Apenas'} {field.validation ? `• ${field.validation}` : ''}
                        </p>
                      </div>
                      <Badge className={field.mandatory ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}>
                        {field.mandatory ? 'Obrigatório' : 'Opcional'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: OWNERS =====
  const OwnersSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900">Taxonomia de Stakeholders</h3>
          <button
            className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            title="Criar novo papel de stakeholder"
          >
            <Plus className="w-4 h-4" />
            Novo Papel
          </button>
        </div>

        <div className="space-y-2">
          {stakeholderRoles.map((role) => (
            <div key={role.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all flex items-center justify-between bg-white group">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{role.name}</p>
                  <Badge className="bg-slate-100 text-slate-600 border border-slate-200 uppercase text-[10px]">{role.roleType.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">Senioridade: {role.seniority} • Prioridade: {role.priority}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{role.enabled ? 'Ativo' : 'Inativo'}</span>
                  <input
                    type="checkbox"
                    checked={role.enabled}
                    readOnly
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    title={`Status de ativação para ${role.name}`}
                  />
                </div>
                <button
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  title={`Editar papel ${role.name}`}
                >
                  <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: MATCHING =====
  const MatchingSection = () => (
    <div className="space-y-6">
      {(['conta', 'contato'] as const).map((entityType) => {
        const rules = matchingRules.filter(r => r.entity === entityType);
        return (
          <Card key={entityType} className="p-6 rounded-2xl">
            <h3 className="font-black text-slate-900 mb-4 capitalize">Regras de Deduplicação — {entityType}</h3>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all bg-white group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{rule.criteria}</p>
                        {rule.fuzzyMatch && (
                          <Badge className="bg-amber-100 text-amber-700">Fuzzy Match</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Prioridade: {rule.priority} • Resolução: <span className="font-bold capitalize">{rule.conflictResolution}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{rule.enabled ? 'Ativo' : 'Inativo'}</span>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          readOnly
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          title={`Ativar regra: ${rule.criteria}`}
                        />
                      </div>
                      <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        title={`Configurar regra ${rule.criteria}`}
                      >
                        <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  // ===== TAB: HIERARQUIA =====
  const HierarchySection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">Hierarquia de Contas & Consolidação</p>
            <p className="text-sm text-blue-800">Parâmetros para mapear parent/child, holdings, unidades de negócio e subsidiárias.</p>
          </div>
        </div>
      </div>

      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900">Taxonomia de Hierarquia</h3>
          <Badge className="bg-emerald-100 text-emerald-700">Ativado</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'holding', name: 'Holding', desc: 'Controladora global/financeira' },
            { id: 'bu', name: 'Unidade de Negócio', desc: 'Divisões operacionais independentes' },
            { id: 'subsidiaria', name: 'Subsidiária', desc: 'Operação regional ou local' },
            { id: 'unidade', name: 'Unidade Local', desc: 'Site ou filial específica' },
          ].map((type) => (
            <div key={type.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <p className="font-bold text-slate-900">{type.name}</p>
              <p className="text-xs text-slate-600 mt-1">{type.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Mapeamento Ativo (Holding &gt; Child)</h3>
        <div className="space-y-2">
          {[
            { parent: 'Grupo Votorantim', type: 'Holding', children: ['Votorantim Cimentos', 'Votorantim Metais', 'Nexa Resources'] },
            { parent: 'Natura & Co', type: 'Holding', children: ['Natura', 'Avon', 'The Body Shop'] },
            { parent: 'Banco Bradesco', type: 'Holding', children: ['Bradesco Seguros', 'Next', 'Ágora'] },
          ].map((group) => (
            <div key={group.parent} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-900">{group.parent}</p>
                <Badge className="bg-blue-50 text-blue-600 text-[10px]">{group.type}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.children.map((child) => (
                  <Badge key={child} className="bg-slate-50 text-slate-600 border border-slate-200 cursor-default">{child}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: FONTES DE MÍDIA (ETAPA 2) =====
  const MediaSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Conexões de Mídia & Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          {mediaSources.map((source) => {
            const statusColor = { connected: 'emerald', partial: 'amber', error: 'red', disconnected: 'slate' }[source.status];
            return (
              <div key={source.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all bg-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                    <p className="font-bold text-slate-900">{source.name}</p>
                  </div>
                  <Badge className={`bg-${statusColor}-100 text-${statusColor}-700 capitalize`}>{source.status}</Badge>
                </div>
                <div className="space-y-2 mb-4 text-xs">
                  <p className="text-slate-600 font-medium">Conta: <span className="text-slate-900">{source.accountName}</span></p>
                  <p className="text-slate-600">Escopo: <span className="text-slate-900">{source.scope.join(', ')}</span></p>
                  <p className="text-slate-600 italic">Impacto: {source.impact}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{source.syncFreq} Sync</span>
                  <button
                    onClick={() => setDrawer({ type: 'media', id: source.id })}
                    className="text-xs font-bold text-blue-600 hover:underline"
                    title={`Configurar ${source.name}`}
                  >
                    Gerenciar
                  </button>
                </div>
                {source.pendingChanges && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: CONVERSÕES (ETAPA 2) =====
  const ConversionsSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-900">Eventos & Conversões Canônicas</h3>
          <button className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all" title="Mapear novo evento">
            + Novo Evento
          </button>
        </div>
        <div className="space-y-3">
          {canopiEvents.map((event) => (
            <div key={event.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-all bg-white flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 leading-none">{event.name}</p>
                  <Badge className={event.type === 'primary' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="uppercase font-black tracking-tighter text-blue-600">{event.source}</span>
                  <span>→ Destination: {event.destination}</span>
                  {event.value && <span className="font-bold text-emerald-600">${event.value}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.usage.map(u => (
                  <Badge key={u} className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] uppercase">{u}</Badge>
                ))}
                <button className="p-2 hover:bg-slate-100 rounded-lg ml-2" title={`Editar ${event.name}`}><Edit2 className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: ATRIBUIÇÃO & TAXONOMIA (ETAPA 2) =====
  const AttributionTaxonomySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl h-full">
          <h3 className="font-black text-slate-900 mb-4">Modelo de Atribuição</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-black text-blue-600 uppercase mb-1">Modelo Ativo</p>
              <p className="text-xl font-black text-blue-900 capitalize">{attribution.model.replace('_', ' ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Janela</p>
                <p className="font-bold text-slate-900">{attribution.window} dias</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Prioridade</p>
                <p className="font-bold text-slate-900 uppercase tracking-tighter">{attribution.priorities[0]} Wins</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-600 mb-2 uppercase">Hierarquia de Conflito</p>
              <p className="text-sm font-medium text-slate-700 italic">&quot;Se GA4 e CRM divergirem, {attribution.conflictPolicy.replace(/_/g, ' ')}&quot;</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl h-full">
          <h3 className="font-black text-slate-900 mb-4">Taxonomia de Campanha</h3>
          <div className="space-y-3">
            {taxonomyRules.map((rule) => (
              <div key={rule.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 relative group">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-slate-900 text-sm">{rule.field}</p>
                  {rule.mandatory && <Badge className="bg-red-50 text-red-600 text-[9px]">Mandatory</Badge>}
                </div>
                <code className="text-[10px] text-blue-600 block bg-blue-50/50 p-1 rounded font-mono truncate">{rule.pattern}</code>
                {rule.canopiFlag && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] uppercase tracking-widest">{rule.canopiFlag}</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ===== TAB: AUDIENCIAS (ETAPA 2) =====
  const AudienceSyncSection = () => (
    <div className="space-y-6">
       <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Global Audience Sync Flags</h3>
        <div className="space-y-2">
          {audienceSyncs.map((sync) => (
            <div key={sync.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-all bg-white">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-black text-slate-900 uppercase tracking-tight">{sync.platform}</p>
                  <Badge className="bg-slate-100 text-slate-600 text-[10px]">{sync.audienceType}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">Regra: <span className="font-mono text-blue-600">{sync.syncRule}</span></p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400">REFRESH</p>
                  <p className="text-xs font-black text-slate-700">{sync.refreshFreq}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{sync.status === 'active' ? 'Sincronizado' : 'Pausado'}</span>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${sync.status === 'active' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${sync.status === 'active' ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg" title="Ver logs de sync"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: SCORES (ETAPA 3) =====
  const ScoresSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Matriz de Scoring Estratégico</h3>
        <div className="grid grid-cols-1 gap-4">
          {scoringRules.map((rule) => (
            <div key={rule.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-blue-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${rule.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {rule.weight}%
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{rule.name}</p>
                    <p className="text-xs text-slate-500">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Attention Threshold</p>
                    <p className="font-black text-slate-900">&gt; {rule.threshold}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${rule.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.active ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {rule.components.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{comp.name}</span>
                      <span className="text-[10px] font-bold text-blue-600">{comp.weight}%</span>
                    </div>
                    <p className="text-xs text-slate-900 font-medium truncate">Source: {comp.source}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-600 italic">Impacto: {rule.impact}</p>
                <button className="text-xs font-bold text-blue-600 hover:underline">Ajustar Pesos</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: SINAIS (ETAPA 3) =====
  const SignalsSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Configuração de Gatilhos de Sinal</h3>
        <div className="space-y-3">
          {signalConfigs.map((config) => (
            <div key={config.id} className="p-4 border border-slate-200 rounded-xl bg-white flex items-start gap-4 hover:shadow-md transition-all group">
              <div className={`mt-1 p-2 rounded-lg ${
                config.severity === 'critical' ? 'bg-red-100 text-red-600' :
                config.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900">{config.name}</p>
                    <Badge className="bg-slate-100 text-slate-600 text-[9px] uppercase tracking-tighter">{config.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400">SLA</p>
                      <p className="font-black text-slate-700">{config.slaHours}h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400">COOLDOWN</p>
                      <p className="font-black text-slate-700">{config.cooldownDays}d</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 mb-2">
                  <code className="text-[10px] text-blue-700 font-mono">{config.triggerCondition}</code>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold">FONTES: {config.sourceDependency.join(', ')}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500 font-bold">OWNER: {config.defaultOwner}</span>
                  </div>
                  <button className="text-blue-600 font-bold group-hover:underline">Parametrizar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: ROTEAMENTO (ETAPA 3) =====
  const RoutingSection = () => (
    <div className="space-y-6">
       <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-900">Regras de Roteamento & SLA</h3>
          <button className="px-3 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-black transition-all">
            + Nova Regra
          </button>
        </div>
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Prioridade</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Critério de Gatilho</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Destino (Fila/Owner)</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">SLA Vazão</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Fallback</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routingRules.sort((a,b) => a.priority - b.priority).map((rule) => (
                <tr key={rule.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-4 py-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                      {rule.priority}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                    <code className="text-[10px] text-blue-600">{rule.criteria}</code>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className="bg-blue-100 text-blue-700 font-bold border-none">{rule.target}</Badge>
                  </td>
                  <td className="px-4 py-4 font-black text-slate-700 text-sm">{rule.slaQueue}h</td>
                  <td className="px-4 py-4 text-xs text-slate-500 font-medium">{rule.fallback}</td>
                  <td className="px-4 py-4 text-right">
                    <button title="Editar Regra" className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100 rounded-lg">
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ===== TAB: PLAYS (ETAPA 4) =====
  const PlaysSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-900">Biblioteca de Tactical Plays</h3>
          <button className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all">+ Nova Play</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {plays.map((play) => (
            <div key={play.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-blue-400 transition-all relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    play.category === 'Acquisition' ? 'bg-emerald-100 text-emerald-600' :
                    play.category === 'Expansion' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900">{play.name}</p>
                      <Badge className={`text-[9px] uppercase tracking-tighter ${
                        play.priority === 'critical' ? 'bg-red-100 text-red-600' :
                        play.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                      }`}>{play.priority}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{play.type} • {play.suggestedChannel}</p>
                  </div>
                </div>
                <Badge className={`capitalize ${
                  play.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                  play.status === 'validated' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>{play.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Estágio Ativação</p>
                  <p className="text-xs font-bold text-slate-700">{play.activationStage}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Owner Padrão</p>
                  <p className="text-xs font-bold text-slate-700">{play.defaultOwner}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Sucesso</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{play.successCriteria}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  {play.preConditions.map((cond, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">{cond}</span>
                  ))}
                </div>
                <button className="text-xs font-bold text-blue-600 group-hover:underline">Editar Play</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: ABM (ETAPA 4) =====
  const ABMSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-4">Ideal Customer Profile (ICP)</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Verticals & Segments</p>
              <div className="flex flex-wrap gap-2">
                {abmConfig.icp.verticals.map(v => <Badge key={v} className="bg-white text-slate-700 border-slate-200">{v}</Badge>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Revenue Min</p>
                <p className="font-black text-slate-900 leading-none">${(abmConfig.icp.revenueMin/1000000).toFixed(0)}M+</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Employee Range</p>
                <p className="text-xs font-bold text-slate-900">{abmConfig.icp.employeeRange.join(', ')}</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Technographics Match</p>
              <div className="flex flex-wrap gap-2">
                {abmConfig.icp.technographics.map(t => <Badge key={t} className="bg-blue-600 text-white border-none">{t}</Badge>)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-4">Account Tiers & Strategy</h3>
          <div className="space-y-3">
            {abmConfig.tiers.map((tier) => (
              <div key={tier.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-black text-slate-900 text-sm">{tier.label}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Min Coverage: {tier.minCoverage}%</p>
                </div>
                <code className="text-[10px] text-slate-500 block mb-3">{tier.criteria}</code>
                <div className="flex flex-wrap gap-1">
                  {tier.playbooks.map(p => <Badge key={p} className="bg-slate-100 text-slate-600 text-[9px] uppercase">{p}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-4">Clusters Operacionais</h3>
        <div className="grid grid-cols-2 gap-4">
          {abmConfig.clusters.map(clu => (
            <div key={clu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-900">{clu.name}</p>
                <code className="text-[10px] text-blue-600">{clu.logic}</code>
              </div>
              <button title="Editar Cluster" className="p-2 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-200">
                <Edit2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: ABX (ETAPA 4) =====
  const ABXSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-5 rounded-2xl col-span-2">
          <h3 className="font-black text-slate-900 mb-4">Orquestração de Pontos de Jornada</h3>
          <div className="space-y-3">
            {abxConfig.orchestrationRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="p-3 border border-slate-200 rounded-xl bg-white flex-1 hover:border-blue-400 transition-all group-hover:shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EVENT TRIGGER</p>
                    <Badge className="bg-blue-50 text-blue-600 border-none text-[9px]">{rule.handoff}</Badge>
                  </div>
                  <p className="font-bold text-slate-900 mb-2">{rule.event}</p>
                  <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                    <Zap className="w-3 h-3" />
                    {rule.action}
                  </div>
                </div>
                {idx < abxConfig.orchestrationRules.length - 1 && <ChevronRight className="w-5 h-5 text-slate-300" />}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-4">Ready-for-Expansion</h3>
          <div className="space-y-4">
            {abxConfig.expansionReadinessCriteria.map((crit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-700">{crit}</span>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Governance Logic</p>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">Sponsor Recognition</p>
                  <p className="font-bold text-slate-800 italic">&quot;{abxConfig.sponsorLogic}&quot;</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Champion Recognition</p>
                  <p className="font-bold text-slate-800 italic">&quot;{abxConfig.championLogic}&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-4">Risk & Multi-threading</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase mb-1">Stagnation Alert</p>
                <p className="text-sm font-bold text-red-900">After {abxConfig.stagnationRiskDays} days without Interaction</p>
              </div>
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Multi-threading Trigger</p>
                <p className="text-sm font-bold text-orange-900">{abxConfig.multiThreadingTrigger}</p>
              </div>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-4">Journey Stages Definition</h3>
          <div className="flex flex-wrap gap-2">
            {abxConfig.journeyStages.map((stage, idx) => (
              <div key={stage} className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600 border-none font-bold py-1 px-3">
                  {idx + 1}. {stage}
                </Badge>
                {idx < abxConfig.journeyStages.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ===== TAB: INTELLIGENCE EXCHANGE (ETAPA 5) =====
  const IntelligenceExchangeSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-900">Intelligence Propagation Rules</h3>
          <button className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all">+ Nova Regra</button>
        </div>
        <div className="space-y-4">
          {exchangeInsights.map((insight) => (
            <div key={insight.id} className="p-5 border border-slate-200 rounded-xl bg-white hover:border-blue-400 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{insight.name}</p>
                    <p className="text-xs text-slate-500">{insight.propagationRule}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">{insight.confidenceScore}% Trust</Badge>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Scope: {insight.scope}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">{insight.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Validade: {insight.validityDays}d</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize">{insight.status}</Badge>
                  </div>
                </div>
                <button className="text-xs font-bold text-blue-600 group-hover:underline">Parametrizar Propagação</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== TAB: LEARNINGS (ETAPA 5) =====
  const LearningRepositorySection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-6">Learning Repository & Catalog</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Learning / Recommendation</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Context Map</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Confidence</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {learnings.map((lrn) => (
              <tr key={lrn.id} className="hover:bg-slate-50 transition-all">
                <td className="px-4 py-4">
                  <p className="text-sm font-bold text-slate-900">{lrn.name}</p>
                  <p className="text-xs text-blue-600 font-medium italic">{lrn.recommendation}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                    <span>{lrn.originContext}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600">{lrn.destinationContext}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`${
                    lrn.confidenceLevel === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>{lrn.confidenceLevel}</Badge>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs font-bold text-slate-700 uppercase">{lrn.status}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button title="Ver Detalhes" className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // ===== TAB: GOVERNANCE (ETAPA 5) =====
  const GovernanceSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Publication & Versioning Policy
          </h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center p-3 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
              <p className="text-sm font-bold text-slate-700">Versão Atual</p>
              <Badge className="bg-slate-900 text-white border-none">{governance.version}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
              <p className="text-sm font-bold text-slate-700">Política de Publicação</p>
              <span className="text-xs font-black text-blue-600 uppercase italic underline cursor-pointer">{governance.publishPolicy}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-slate-200 rounded-xl hover:border-blue-300 transition-all">
              <p className="text-sm font-bold text-slate-700">Ambientes Ativos</p>
              <div className="flex gap-2">
                {governance.environments.map(env => <Badge key={env} className="bg-blue-100 text-blue-600 border-none capitalize">{env}</Badge>)}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">Auditoria manual obrigatória habilitada para alterações em Intelligence Exchange.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl">
          <h3 className="font-black text-slate-900 mb-6">Historical Log & Dependencies</h3>
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
              {[
                { event: 'Update: ABM Tiers Strategy', date: 'Hoje, 10:45', author: 'Ana (Marketing)' },
                { event: 'Published: Etapa 4 Tactical Library', date: 'Ontem, 16:20', author: 'Cadu (Admin)' },
                { event: 'Modified: Scoring Weight - Fit', date: '22 Abr, 14:00', author: 'Ana (Marketing)' },
              ].map((log, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-slate-300 border-4 border-white ring-1 ring-slate-100" />
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{log.event}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{log.date} • {log.author}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // ===== TAB: PERMISSIONS (ETAPA 5) =====
  const PermissionsSection = () => (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h3 className="font-black text-slate-900 mb-6">Access Control by Intelligence Domain</h3>
        <div className="grid grid-cols-1 gap-4">
          {permissions.map((prof) => (
            <div key={prof.id} className="p-5 border border-slate-200 rounded-xl bg-white flex items-center justify-between group hover:border-blue-400 transition-all">
              <div>
                <p className="font-black text-slate-900">{prof.role}</p>
                <div className="flex gap-2 mt-2">
                  {prof.domains.map(dom => (
                    <div key={dom.name} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded">
                      <span className="text-[9px] font-black text-slate-400 uppercase">{dom.name}:</span>
                      <span className={`text-[9px] font-black uppercase ${
                        dom.level === 'admin' ? 'text-red-500' :
                        dom.level === 'publish' ? 'text-blue-500' : 'text-slate-500'
                      }`}>{dom.level}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="text-xs font-black text-slate-400 hover:text-blue-600 transition-all uppercase px-4 py-2 border border-slate-200 rounded-lg hover:border-blue-200">Editar Perfil</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Configurações & Setup</h1>
            <p className="text-slate-600">Parametrização da Camada Operacional • Etapas 1, 2 e 3</p>
          </div>
          <button
            onClick={() => setPublishStatus(publishStatus === 'draft' ? 'published' : 'draft')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              publishStatus === 'published'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {publishStatus === 'draft' ? 'Publicar Alterações' : 'Publicado'}
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex gap-0 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'objetos' as const, label: 'Objetos', category: 'Estrutura' },
            { id: 'source' as const, label: 'Source of Truth', category: 'Estrutura' },
            { id: 'pipeline' as const, label: 'Pipeline', category: 'Estrutura' },
            { id: 'campos' as const, label: 'Campos', category: 'Estrutura' },
            { id: 'owners' as const, label: 'Stakeholders', category: 'Estrutura' },
            { id: 'matching' as const, label: 'Matching', category: 'Estrutura' },
            { id: 'hierarquia' as const, label: 'Hierarquia', category: 'Estrutura' },
            { id: 'midia' as const, label: 'Mídia & Inbound', category: 'Etapa 2' },
            { id: 'conversoes' as const, label: 'Conversões', category: 'Etapa 2' },
            { id: 'atribuicao' as const, label: 'Atribuição', category: 'Etapa 2' },
            { id: 'audiencias' as const, label: 'Audiências', category: 'Etapa 2' },
            { id: 'scores' as const, label: 'Scores', category: 'Etapa 3' },
            { id: 'sinais' as const, label: 'Sinais', category: 'Etapa 3' },
            { id: 'roteamento' as const, label: 'Roteamento', category: 'Etapa 3' },
            { id: 'plays' as const, label: 'Plays', category: 'Etapa 4' },
            { id: 'abm' as const, label: 'ABM', category: 'Etapa 4' },
            { id: 'abx' as const, label: 'ABX', category: 'Etapa 4' },
            { id: 'exchange' as const, label: 'Exchange', category: 'Etapa 5' },
            { id: 'learnings' as const, label: 'Learnings', category: 'Etapa 5' },
            { id: 'governanca' as const, label: 'Governança', category: 'Etapa 5' },
            { id: 'permissoes' as const, label: 'Permissões', category: 'Etapa 5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold text-xs border-b-2 transition-all flex flex-col items-center min-w-[100px] ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="text-[8px] uppercase tracking-widest mb-1 opacity-60 font-black">{tab.category}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === 'objetos' && <ObjectsSection />}
          {activeTab === 'source' && <SourceOfTruthSection />}
          {activeTab === 'pipeline' && <PipelineSection />}
          {activeTab === 'campos' && <FieldsSection />}
          {activeTab === 'owners' && <OwnersSection />}
          {activeTab === 'matching' && <MatchingSection />}
          {activeTab === 'hierarquia' && <HierarchySection />}
          {activeTab === 'midia' && <MediaSection />}
          {activeTab === 'conversoes' && <ConversionsSection />}
          {activeTab === 'atribuicao' && <AttributionTaxonomySection />}
          {activeTab === 'audiencias' && <AudienceSyncSection />}
          {activeTab === 'scores' && <ScoresSection />}
          {activeTab === 'sinais' && <SignalsSection />}
          {activeTab === 'roteamento' && <RoutingSection />}
          {activeTab === 'plays' && <PlaysSection />}
          {activeTab === 'abm' && <ABMSection />}
          {activeTab === 'abx' && <ABXSection />}
          {activeTab === 'exchange' && <IntelligenceExchangeSection />}
          {activeTab === 'learnings' && <LearningRepositorySection />}
          {activeTab === 'governanca' && <GovernanceSection />}
          {activeTab === 'permissoes' && <PermissionsSection />}
        </div>
      </main>
    </div>
  );
};

export default ConfigStage1;
