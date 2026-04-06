/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Operacional Intelligence Helper
 * Consolidates real platform intelligence for Assistant context enrichment
 */

import { advancedSignals } from '../data/signalsV6';
import { contasMock, initialActions } from '../data/accountsData';

// ─── TYPES ───────────────────────────────────────────────────────────────

export interface OperationalIntelligence {
  performance: PerformanceIntelligence;
  queue: QueueIntelligence;
  priorities: PrioritiesIntelligence;
  health: HealthSnapshot;
}

export interface PerformanceIntelligence {
  totalPipeline: string;
  conversionRate: number;
  bestOrigin: string;
  activeAccounts: number;
  totalSignals: number;
  resolvedSignals: number;
}

export interface QueueIntelligence {
  totalActions: number;
  criticalActions: number;
  delayedActions: number;
  noOwnerActions: number;
  anomalies: Anomaly[];
}

export interface Anomaly {
  type: string;
  title: string;
  description: string;
  severity: 'high' | 'medium';
  accountName?: string;
}

export interface PrioritiesIntelligence {
  topSignals: Array<{
    id: string;
    title: string;
    account: string;
    severity: string;
    confidence: number;
    recommendation: string;
  }>;
  topAnomalies: Anomaly[];
  riskAccounts: Array<{
    name: string;
    reason: string;
    riskLevel: 'high' | 'medium';
  }>;
}

export interface HealthSnapshot {
  operationalSummary: string;
  criticalIndicator: string;
  nextImmediateAction: string;
}

// ─── EXTRATORES DE INTELIGÊNCIA ──────────────────────────────────────

/**
 * Extrai inteligência de performance: pipeline, conversão, origem
 */
export function extractPerformanceIntelligence(): PerformanceIntelligence {
  const resolvedosSinais = advancedSignals.filter(s => s.resolved);
  const allSignals = advancedSignals.filter(s => !s.archived && s.resolved === false);

  // Pipeline associado: contagem de contas ativas com sinais ativos
  const accountsWithSignals = new Set(allSignals.map(s => s.accountId || s.account));
  const activeAccountsCount = accountsWithSignals.size;
  const totalPipeline = activeAccountsCount > 0 ? `R$ ${(activeAccountsCount * 215)}k` : 'R$ 0';

  // Taxa de conversão
  const conversionRate = advancedSignals.length > 0
    ? Math.round((resolvedosSinais.length / advancedSignals.length) * 100)
    : 0;

  // Melhor origem por volume
  const originVolume = advancedSignals.reduce((acc, s) => {
    acc[s.source] = (acc[s.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bestOrigin = Object.entries(originVolume)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    totalPipeline,
    conversionRate,
    bestOrigin,
    activeAccounts: activeAccountsCount,
    totalSignals: advancedSignals.length,
    resolvedSignals: resolvedosSinais.length,
  };
}

/**
 * Extrai inteligência de fila: ações críticas, SLA em risco, anomalias
 */
export function extractQueueIntelligence(): QueueIntelligence {
  const allActions = initialActions;
  const now = new Date();

  const total = allActions.length;
  const critical = allActions.filter(a => a.priority === 'Crítica').length;
  const delayed = allActions.filter(a => {
    const created = new Date(a.createdAt || '2026-04-03T09:00:00Z');
    return (now.getTime() - created.getTime()) > (24 * 60 * 60 * 1000);
  }).length;
  const noOwner = allActions.filter(a => !a.ownerName).length;

  // Anomalias (4 tipos)
  const foundAnomalies: Anomaly[] = [];

  // 1. GHOSTING
  const ghosted = allActions.find(a =>
    a.priority === 'Crítica' &&
    !a.ownerName &&
    (now.getTime() - new Date(a.createdAt || '2026-04-03T09:00:00Z').getTime()) > (24 * 60 * 60 * 1000)
  );
  if (ghosted) {
    foundAnomalies.push({
      type: 'Ghosting',
      title: 'Atribuição Crítica Pendente',
      description: `Ação na ${ghosted.accountName} sem responsável há 24h+`,
      severity: 'high',
      accountName: ghosted.accountName,
    });
  }

  // 2. VAZÃO BAIXA
  const originStats = allActions.reduce((acc, a) => {
    if (!acc[a.origin]) acc[a.origin] = { total: 0, done: 0 };
    acc[a.origin].total++;
    if (a.status === 'Concluída') acc[a.origin].done++;
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  Object.entries(originStats).forEach(([origin, stats]) => {
    if (stats.total >= 3 && stats.done === 0) {
      foundAnomalies.push({
        type: 'Vazão',
        title: `Baixa Vazão: ${origin}`,
        description: `${stats.total} ações sem conclusão. Investigar bloqueios.`,
        severity: 'medium',
      });
    }
  });

  // 3. CONGESTIONAMENTO
  const channelCrit = allActions.reduce((acc, a) => {
    if (a.status !== 'Concluída' && (a.priority === 'Crítica' || a.priority === 'Alta')) {
      acc[a.channel] = (acc[a.channel] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  Object.entries(channelCrit).forEach(([channel, count]) => {
    if (count >= 3) {
      foundAnomalies.push({
        type: 'Congestionamento',
        title: `Fila Crítica: ${channel}`,
        description: `Concentração de ${count} ações de alta prioridade. Risco de gargalo.`,
        severity: 'high',
      });
    }
  });

  // 4. CASCATA
  const accStats = allActions.reduce((acc, a) => {
    if (!acc[a.accountName]) acc[a.accountName] = 0;
    if (a.status === 'Bloqueada' || a.slaStatus === 'vencido') acc[a.accountName]++;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(accStats).forEach(([accName, count]) => {
    if (count >= 2) {
      foundAnomalies.push({
        type: 'Bloqueio',
        title: `Cascata: ${accName}`,
        description: `Conta com ${count} impeditivos simultâneos. Paralisia operacional.`,
        severity: 'high',
        accountName: accName,
      });
    }
  });

  return {
    totalActions: total,
    criticalActions: critical,
    delayedActions: delayed,
    noOwnerActions: noOwner,
    anomalies: foundAnomalies.slice(0, 3), // Top 3 anomalias
  };
}

/**
 * Extrai prioridades: sinais críticos, anomalias, contas em risco
 */
export function extractPrioritiesIntelligence(): PrioritiesIntelligence {
  const allSignals = advancedSignals.filter(s => !s.archived && s.resolved === false);
  const severityOrder: Record<string, number> = { crítico: 0, alerta: 1, oportunidade: 2 };

  // Top 3 sinais por severidade + confiança
  const topSignals = [...allSignals]
    .sort((a, b) =>
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) ||
      b.confidence - a.confidence
    )
    .slice(0, 3)
    .map(s => ({
      id: s.id,
      title: s.title,
      account: s.account,
      severity: s.severity,
      confidence: s.confidence,
      recommendation: s.recommendation,
    }));

  // Top anomalias
  const queue = extractQueueIntelligence();
  const topAnomalies = queue.anomalies.slice(0, 2);

  // Contas em risco
  const criticosSinais = advancedSignals.filter(s => s.severity === 'crítico' && !s.archived);
  const accountsInRisk: Array<{ name: string; reason: string; riskLevel: 'high' | 'medium' }> = [];

  const accountRiskMap = new Map<string, { criticalCount: number; maxConfidence: number }>();
  criticosSinais.forEach(s => {
    const existing = accountRiskMap.get(s.account) || { criticalCount: 0, maxConfidence: 0 };
    accountRiskMap.set(s.account, {
      criticalCount: existing.criticalCount + 1,
      maxConfidence: Math.max(existing.maxConfidence, s.confidence),
    });
  });

  accountRiskMap.forEach((data, accountName) => {
    if (data.criticalCount > 0) {
      accountsInRisk.push({
        name: accountName,
        reason: `${data.criticalCount} sinal(is) crítico(s) com confiança ${data.maxConfidence}%`,
        riskLevel: data.criticalCount >= 2 ? 'high' : 'medium',
      });
    }
  });

  return {
    topSignals,
    topAnomalies,
    riskAccounts: accountsInRisk.slice(0, 3),
  };
}

/**
 * Extrai snapshot de saúde geral da operação
 */
export function extractHealthSnapshot(): HealthSnapshot {
  const perf = extractPerformanceIntelligence();
  const queue = extractQueueIntelligence();
  const priorities = extractPrioritiesIntelligence();

  // Summary operacional
  const operationalSummary = `Pipeline: ${perf.totalPipeline} | Conversão: ${perf.conversionRate}% | Sinais ativos: ${perf.totalSignals} | Ações críticas: ${queue.criticalActions} | SLA em risco: ${queue.delayedActions}`;

  // Indicador crítico
  const criticalIndicator =
    queue.anomalies.length > 0 && queue.anomalies[0].severity === 'high'
      ? `🔴 Anomalia crítica: ${queue.anomalies[0].title}`
      : priorities.topSignals.length > 0 && priorities.topSignals[0].severity === 'crítico'
        ? `⚠️ Sinal crítico detectado: ${priorities.topSignals[0].title}`
        : '✅ Operação estável';

  // Próxima ação imediata
  const nextAction =
    queue.anomalies.length > 0
      ? `Investigar ${queue.anomalies[0].title.toLowerCase()}`
      : priorities.riskAccounts.length > 0
        ? `Atuar na conta ${priorities.riskAccounts[0].name} (risco ${priorities.riskAccounts[0].riskLevel})`
        : 'Monitorar KPIs';

  return {
    operationalSummary,
    criticalIndicator,
    nextImmediateAction: nextAction,
  };
}

/**
 * Consolida toda inteligência operacional em um objeto único
 */
export function buildOperationalIntelligence(): OperationalIntelligence {
  return {
    performance: extractPerformanceIntelligence(),
    queue: extractQueueIntelligence(),
    priorities: extractPrioritiesIntelligence(),
    health: extractHealthSnapshot(),
  };
}
