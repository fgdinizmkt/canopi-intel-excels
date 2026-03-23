/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Severity = 'crítico' | 'alerta' | 'oportunidade' | 'estável';

export interface Signal {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  type: 'Operacional' | 'Campanha' | 'Conta' | 'Pipeline' | 'Integração' | 'Dados';
  category: string;
  channel: string;
  source: string;
  owner: string;
  confidence: number;
  timestamp: string;
  context: string;
  probableCause: string;
  impact: string;
  recommendation: string;
  suggestedOwner: string;
  mainAction: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  type: 'success' | 'info' | 'warning';
}

export interface DetailedAccount {
  id: string;
  name: string;
  domain: string;
  vertical: string;
  segment: string;
  stage: 'CONSCIENTIZAÇÃO' | 'APRENDIZADO' | 'CONSIDERAÇÃO' | 'DECISÃO';
  engagement: number;
  healthScore: number;
  expansionProb: number;
  status: 'ATIVA' | 'EM RISCO' | 'INATIVA';
  recentSignals: {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    type: 'intent' | 'direct' | 'usage';
  }[];
  timeline: TimelineEvent[];
  recommendedPlay: {
    title: string;
    description: string;
  };
}

export interface RiskAccount {
  id: string;
  name: string;
  healthScore: number;
  gaps: string[];
  owner: string;
  tier: string;
}

export interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export interface Priority {
  id: string;
  title: string;
  account: string;
  owner: string;
  severity: 'crítica' | 'média' | 'baixa';
}

export interface Action {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  category: string;
  contextInfo: string; // e.g., "Campanha: Global Fortune 500"
  slaStatus: string; // e.g., "Há 2 horas (SLA Vencido)" or "Vencendo em 4h"
  slaTrend?: 'vencido' | 'alerta' | 'ok';
  suggestedOwner: {
    name: string;
    avatar?: string;
  };
  type: string;
}

export interface ActionKPI {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  color?: 'red' | 'blue' | 'emerald' | 'slate';
}

export interface ABMAccount {
  id: string;
  name: string;
  industry: string;
  fitScore: number;
  potential: string;
  cluster: string;
  status: string;
  initials: string;
}

export interface ABMCluster {
  id: string;
  name: string;
  count: number;
  playbook: string;
  color: string;
}

export interface ABMPlay {
  id: string;
  title: string;
  description: string;
  efficiency: number;
}
