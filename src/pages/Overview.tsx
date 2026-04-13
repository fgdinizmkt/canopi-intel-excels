/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ShieldCheck, MoreHorizontal, Sparkles, AlertTriangle, Zap, Target } from 'lucide-react';
import { advancedSignals } from '../data/signalsV6';
import { contasMock, initialActions } from '../data/accountsData';
import { Card, Badge, Button } from '../components/ui';
import { calculateAccountScore, isContaCritica, isAltaPrioridade, getPrincipalAviso, deriveProximaMelhorAcao, deriveMotivoDaRecomendacao, deriveAcaoOperacional } from '../lib/scoringRepository';
import { useAccountDetail } from '../context/AccountDetailContext';

export const Overview: React.FC = () => {
  const { openAccount, createAction } = useAccountDetail();

  // ─── DERIVAÇÃO MEMOIZADA DE SINAIS (Nível de Severidade) ───────────────
  const { criticosSinais, alertasSinais, oportunidadesSinais, resolvedosSinais, topSignal, saudeOperacional, topPrioridades } = useMemo(() => {
    const crits = advancedSignals.filter(s => s.severity === 'crítico');
    const alerts = advancedSignals.filter(s => s.severity === 'alerta');
    const opps = advancedSignals.filter(s => s.severity === 'oportunidade');
    const resolved = advancedSignals.filter(s => s.resolved);

    // Executivo: sinal crítico de maior confiança
    const top = [...crits].sort((a, b) => b.confidence - a.confidence)[0];

    // Saúde operacional: 1 por severity
    const saude = [
      crits[0]
        ? { title: crits[0].title, detail: crits[0].impact, border: 'border-red-500', titleCls: 'text-red-900', detailCls: 'text-red-600' }
        : null,
      alerts[0]
        ? { title: alerts[0].title, detail: alerts[0].impact, border: 'border-amber-500', titleCls: 'text-amber-900', detailCls: 'text-amber-600' }
        : null,
      opps[0]
        ? { title: opps[0].title, detail: opps[0].impact, border: 'border-brand', titleCls: 'text-brand', detailCls: 'text-brand' }
        : null,
    ].filter(Boolean) as { title: string; detail: string; border: string; titleCls: string; detailCls: string }[];

    // Prioridades imediatas: top 3 por severity + confidence
    const severityOrder: Record<string, number> = { crítico: 0, alerta: 1, oportunidade: 2 };
    const priorities = [...advancedSignals]
      .sort((a, b) =>
        (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) ||
        b.confidence - a.confidence
      )
      .slice(0, 3);

    return {
      criticosSinais: crits,
      alertasSinais: alerts,
      oportunidadesSinais: opps,
      resolvedosSinais: resolved,
      topSignal: top,
      saudeOperacional: saude,
      topPrioridades: priorities
    };
  }, []);

  // ─── INTELIGÊNCIA DE PERFORMANCE (Dinamização por canal/origem) ────────
  const performanceMetrics = useMemo(() => {
    const allSignals = advancedSignals.filter(s => !s.archived && s.resolved === false);

    // Pipeline associado: contagem de contas ativas com sinais ativos
    const accountsWithSignals = new Set(allSignals.map(s => s.accountId || s.account));
    const activeAccountsCount = accountsWithSignals.size;
    const totalPipeline = activeAccountsCount > 0 ? `R$ ${(activeAccountsCount * 215)}k` : 'R$ 0';

    // Taxa de conversão: baseada em sinais resolvidos
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
      resolvedSignals: resolvedosSinais.length
    };
  }, [advancedSignals]);

  // ─── INTELIGÊNCIA DE FILA (Detecção de anomalias — 4 tipos) ──────────────
  const queueIntelligence = useMemo(() => {
    const allActions = initialActions;
    const now = new Date();

    // Métricas básicas
    const total = allActions.length;
    const critical = allActions.filter(a => a.priority === 'Crítica').length;
    const delayed = allActions.filter(a => {
      const created = new Date(a.createdAt || '2026-04-03T09:00:00Z');
      return (now.getTime() - created.getTime()) > (24 * 60 * 60 * 1000);
    }).length;
    const noOwner = allActions.filter(a => !a.ownerName).length;

    // Anomalias (4 tipos)
    const foundAnomalies: Array<{ type: string; title: string; description: string; severity: 'high' | 'medium' }> = [];

    // 1. GHOSTING: Ações críticas sem owner há 24h+
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
        severity: 'high'
      });
    }

    // 2. VAZÃO BAIXA: Origem com >= 3 ações e 0 conclusões
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
          severity: 'medium'
        });
      }
    });

    // 3. CONGESTIONAMENTO: >= 3 ações Críticas/Altas ativas no mesmo canal
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
          severity: 'high'
        });
      }
    });

    // 4. CASCATA: >= 2 ações Bloqueadas ou Vencidas na mesma conta
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
          severity: 'high'
        });
      }
    });

    return {
      total,
      critical,
      delayed,
      noOwner,
      anomalies: foundAnomalies.slice(0, 2) // Mostrar top 2
    };
  }, []);

  // ─── SAÚDE DOS CANAIS ───────────────────────────────────────────────────
  const getChannelStatus = (category: string): { status: string; variant: string } => {
    const sinais = advancedSignals.filter(s => s.category === category);
    if (sinais.some(s => s.severity === 'crítico'))    return { status: 'Crítico', variant: 'red' };
    if (sinais.some(s => s.severity === 'alerta'))     return { status: 'Alerta',  variant: 'amber' };
    if (sinais.some(s => s.severity === 'oportunidade')) return { status: 'Ativo',  variant: 'emerald' };
    return { status: 'Estável', variant: 'emerald' };
  };

  const channels = [
    { label: 'SEO / Orgânico', ...getChannelStatus('SEO') },
    { label: 'Inbound',        ...getChannelStatus('Inbound') },
    { label: 'Outbound',       ...getChannelStatus('Outbound') },
    { label: 'Tráfego Pago',   ...getChannelStatus('Canal') },
  ];

  // ─── ORIGIN BREAKDOWN (Análise dinâmica de volume e vazão por origem) ────
  const originBreakdown = useMemo(() => {
    const breakdown = advancedSignals.reduce((acc, s) => {
      if (!acc[s.source]) acc[s.source] = { total: 0, resolved: 0 };
      acc[s.source].total++;
      if (s.resolved) acc[s.source].resolved++;
      return acc;
    }, {} as Record<string, { total: number; resolved: number }>);

    return Object.entries(breakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([origin, stats]) => {
        const pct = Math.round((stats.total / advancedSignals.length) * 100);
        const resRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
        return { origin, pct, resRate, total: stats.total };
      });
  }, []);

  // ─── TRIAGEM POR SCORE (Recorte 54 — F2) ────────────────────────────────
  const triageByScore = useMemo(() => {
    const contas = contasMock.map(c => ({ conta: c, score: calculateAccountScore(c) }));

    return {
      criticas: contas.filter(x => isContaCritica(x.score)).sort((a, b) => b.score.scoreTotal - a.score.scoreTotal).slice(0, 4),
      altasPrio: contas.filter(x => isAltaPrioridade(x.score) && !isContaCritica(x.score)).sort((a, b) => b.score.scoreTotal - a.score.scoreTotal).slice(0, 3),
      altoPotencialBaixaCobertura: contas.filter(x => x.score.potencial.score > 75 && x.score.cobertura.score < 50).sort((a, b) => b.score.potencial.score - a.score.potencial.score).slice(0, 3),
      topOportunidades: contas.filter(x => (x.conta.oportunidades?.length ?? 0) > 0).sort((a, b) => b.score.scoreTotal - a.score.scoreTotal).slice(0, 4),
    };
  }, []);

  // ─── ABM READINESS (Contas com prontidão > 70) ──────────────────────────
  const abmReadyAccounts = contasMock
    .filter(c => c.prontidao > 70 && c.playAtivo !== 'Nenhum' && c.reconciliationStatus !== 'vazia')
    .slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Plataforma de Inteligência de Receita</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Bem-vindo à Canopi</h1>
          <p className="text-slate-500 mt-2 max-w-md font-medium">
            Sua central de inteligência está sincronizada. Detectamos{' '}
            <span className="text-brand font-bold">{advancedSignals.length} novos sinais</span> de alta intenção hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50">Configurar Fontes</Button>
          <Button className="bg-brand text-white hover:bg-brand/90 border-none shadow-lg shadow-brand/20">Gerar Relatório Executivo</Button>
        </div>
      </header>

      {/* KPIs Section — Consolidados (Performance + Actions) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Pipeline (Performance) */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-brand text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-100">Pipeline Total</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-headline">{performanceMetrics.totalPipeline}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-white/80">
                <TrendingUp className="w-3 h-3" />
                <span>{performanceMetrics.activeAccounts} contas ativas</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* KPI 2: Conversão (Performance) */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Taxa de Conversão</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-headline">{performanceMetrics.conversionRate}%</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>{performanceMetrics.resolvedSignals}/{performanceMetrics.totalSignals} resolvidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Sinais Ativos */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sinais Ativos</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-headline">{advancedSignals.length}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span>{criticosSinais.length} críticos</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 4: Ações Críticas (Queue Intelligence) */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ações Críticas</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-headline">{queueIntelligence.critical}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-slate-400">
                <span>fila operacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 5: Em Risco de SLA (Queue Intelligence) */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SLA em Risco</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold font-headline">{queueIntelligence.delayed}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-amber-600">
                <Zap className="w-3 h-3" />
                <span>atrasadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 6: Melhor Origem (Performance) */}
        <div className="p-5 rounded-2xl border border-slate-100 shadow-sm bg-white text-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Maior Volume</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold font-headline">{performanceMetrics.bestOrigin}</h3>
              <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span>origem principal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRIAGEM OPERACIONAL — Orientada por Score (Recorte 54 — F2) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900">Triagem Operacional por Score</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Contas Críticas */}
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <Badge variant="slate" className="mb-2 bg-red-100 text-red-700 border-red-200 text-[9px]">CRÍTICAS</Badge>
            <h3 className="text-sm font-bold text-slate-900 mb-3">{triageByScore.criticas.length} contas</h3>
            <div className="space-y-2">
              {triageByScore.criticas.map(x => (
                <div key={x.conta.id} className="p-2.5 bg-white rounded-lg border border-red-200/50 hover:border-red-400 transition-all">
                  <p className="text-[11px] font-semibold text-slate-900 cursor-pointer hover:text-red-700" onClick={() => openAccount(x.conta.id)}>{x.conta.nome}</p>
                  <p className="text-[9px] text-slate-600 mt-1 line-clamp-1">{deriveProximaMelhorAcao(x.conta, x.score)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-red-700 font-bold">Score {x.score.scoreTotal}</span>
                    <button onClick={(e) => { e.stopPropagation(); const acao = deriveAcaoOperacional(x.conta, x.score); createAction({ title: acao.title, description: acao.description, priority: acao.priority, category: acao.category, accountName: x.conta.nome, accountContext: `${x.conta.segmento} · ${x.conta.vertical}`, expectedImpact: acao.expectedImpact, nextStep: acao.nextStep, sourceType: acao.sourceType, relatedAccountId: x.conta.id }); }} className="text-[8px] text-red-600 hover:text-red-700 font-bold uppercase">Ação</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Altas Prioridades */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <Badge variant="slate" className="mb-2 bg-amber-100 text-amber-700 border-amber-200 text-[9px]">ALTAS PRIORIDADES</Badge>
            <h3 className="text-sm font-bold text-slate-900 mb-3">{triageByScore.altasPrio.length} contas</h3>
            <div className="space-y-2">
              {triageByScore.altasPrio.map(x => (
                <div key={x.conta.id} className="p-2.5 bg-white rounded-lg border border-amber-200/50 hover:border-amber-400 transition-all">
                  <p className="text-[11px] font-semibold text-slate-900 cursor-pointer hover:text-amber-700" onClick={() => openAccount(x.conta.id)}>{x.conta.nome}</p>
                  <p className="text-[9px] text-slate-600 mt-1 line-clamp-1">{deriveProximaMelhorAcao(x.conta, x.score)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-amber-700 font-bold">Score {x.score.scoreTotal}</span>
                    <button onClick={(e) => { e.stopPropagation(); const acao = deriveAcaoOperacional(x.conta, x.score); createAction({ title: acao.title, description: acao.description, priority: acao.priority, category: acao.category, accountName: x.conta.nome, accountContext: `${x.conta.segmento} · ${x.conta.vertical}`, expectedImpact: acao.expectedImpact, nextStep: acao.nextStep, sourceType: acao.sourceType, relatedAccountId: x.conta.id }); }} className="text-[8px] text-amber-600 hover:text-amber-700 font-bold uppercase">Ação</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alto Potencial + Baixa Cobertura */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <Badge variant="slate" className="mb-2 bg-blue-100 text-blue-700 border-blue-200 text-[9px]">ALTO POT. / BAIXA COB.</Badge>
            <h3 className="text-sm font-bold text-slate-900 mb-3">{triageByScore.altoPotencialBaixaCobertura.length} contas</h3>
            <div className="space-y-2">
              {triageByScore.altoPotencialBaixaCobertura.map(x => (
                <div key={x.conta.id} className="p-2.5 bg-white rounded-lg border border-blue-200/50 hover:border-blue-400 transition-all">
                  <p className="text-[11px] font-semibold text-slate-900 cursor-pointer hover:text-blue-700" onClick={() => openAccount(x.conta.id)}>{x.conta.nome}</p>
                  <p className="text-[9px] text-slate-600 mt-1 line-clamp-1">{deriveProximaMelhorAcao(x.conta, x.score)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-blue-700 font-bold">Pot. {x.score.potencial.score}</span>
                    <button onClick={(e) => { e.stopPropagation(); const acao = deriveAcaoOperacional(x.conta, x.score); createAction({ title: acao.title, description: acao.description, priority: acao.priority, category: acao.category, accountName: x.conta.nome, accountContext: `${x.conta.segmento} · ${x.conta.vertical}`, expectedImpact: acao.expectedImpact, nextStep: acao.nextStep, sourceType: acao.sourceType, relatedAccountId: x.conta.id }); }} className="text-[8px] text-blue-600 hover:text-blue-700 font-bold uppercase">Ação</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Oportunidades por Score */}
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50">
            <Badge variant="slate" className="mb-2 bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px]">TOP OPORTUNIDADES</Badge>
            <h3 className="text-sm font-bold text-slate-900 mb-3">{triageByScore.topOportunidades.length} contas</h3>
            <div className="space-y-2">
              {triageByScore.topOportunidades.map(x => (
                <div key={x.conta.id} className="p-2.5 bg-white rounded-lg border border-emerald-200/50 hover:border-emerald-400 transition-all">
                  <p className="text-[11px] font-semibold text-slate-900 cursor-pointer hover:text-emerald-700" onClick={() => openAccount(x.conta.id)}>{x.conta.nome}</p>
                  <p className="text-[9px] text-slate-600 mt-1 line-clamp-1">{deriveProximaMelhorAcao(x.conta, x.score)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-emerald-700 font-bold">Score {x.score.scoreTotal}</span>
                    <button onClick={(e) => { e.stopPropagation(); const acao = deriveAcaoOperacional(x.conta, x.score); createAction({ title: acao.title, description: acao.description, priority: acao.priority, category: acao.category, accountName: x.conta.nome, accountContext: `${x.conta.segmento} · ${x.conta.vertical}`, expectedImpact: acao.expectedImpact, nextStep: acao.nextStep, sourceType: acao.sourceType, relatedAccountId: x.conta.id }); }} className="text-[8px] text-emerald-600 hover:text-emerald-700 font-bold uppercase">Ação</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Highlight */}
          {topSignal && (
            <Card className="border-l-4 border-l-brand relative overflow-hidden group">
              <div className="relative z-10">
                <Badge variant="blue" className="mb-4 bg-brand/10 text-brand border-none">SINAL FORTE / OPORTUNIDADE PRINCIPAL</Badge>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{topSignal.account}</h2>
                <p className="text-slate-600 max-w-xl leading-relaxed mb-8 text-sm">
                  {topSignal.description}
                </p>
                <div className="flex flex-wrap items-center gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">NÍVEL DE CONFIANÇA</p>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${topSignal.confidence}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{topSignal.confidence}%</span>
                    </div>
                  </div>
                  <Button className="px-8 bg-brand hover:bg-brand/90 text-white border-none">Gerar Plano de Abordagem</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Performance Insights — O que está melhorando */}
          <Card className="border-l-4 border-l-emerald-500">
            <div className="relative z-10">
              <Badge variant="slate" className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-100">PERFORMANCE & CONVERSÃO</Badge>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">O que está melhorando</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sinais Resolvidos</p>
                  <div className="flex items-end gap-3">
                    <h4 className="text-3xl font-bold text-emerald-600">{performanceMetrics.resolvedSignals}</h4>
                    <p className="text-xs text-slate-500 mb-1">{Math.round((performanceMetrics.resolvedSignals / performanceMetrics.totalSignals) * 100)}% do total</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Taxa de Conversão</p>
                  <div className="flex items-end gap-3">
                    <h4 className="text-3xl font-bold text-emerald-600">{performanceMetrics.conversionRate}%</h4>
                    <p className="text-xs text-slate-500 mb-1">acima da meta</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Origem Destaque</p>
                  <div className="flex items-end gap-3">
                    <h4 className="text-2xl font-bold text-emerald-600">{performanceMetrics.bestOrigin}</h4>
                    <p className="text-xs text-slate-500 mb-1">melhor performance</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contas com Sinais Críticos */}
          <Card title="Contas com Alertas Críticos" headerAction={<Button variant="ghost" size="sm" className="text-brand font-bold">Ver todas</Button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50">
                    <th className="pb-4">CONTA</th>
                    <th className="pb-4">SINAL CRÍTICO</th>
                    <th className="pb-4">OWNER</th>
                    <th className="pb-4 text-right">CONFIANÇA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {criticosSinais.slice(0, 3).map((signal) => (
                    <tr key={signal.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{signal.account}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-xs text-slate-600 max-w-xs truncate">{signal.title}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-xs font-medium text-slate-500">{signal.owner}</p>
                      </td>
                      <td className="py-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                          {signal.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Channel Health */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Saúde dos Canais & Orquestração</h3>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {channels.map((channel, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{channel.label}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{channel.status}</span>
                    {channel.variant === 'emerald' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {channel.variant === 'amber'   && <AlertCircle  className="w-5 h-5 text-amber-500"  />}
                    {channel.variant === 'red'     && <AlertCircle  className="w-5 h-5 text-red-500"    />}
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Performance por Origem (Inteligência Dinâmica) */}
          <Card title="Volume e Vazão por Origem de Sinal">
            <div className="space-y-6 pt-4">
              {originBreakdown.map((item) => (
                <div key={item.origin} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <div>
                      <span className="text-slate-900">{item.origin}</span>
                      <span className="text-slate-400 ml-2">({item.total} sinais)</span>
                    </div>
                    <span className="text-slate-500">{item.pct}% · {item.resRate}% resolvido</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Operational Health */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Saúde Operacional</h3>
            </div>
            <div className="space-y-4">
              {saudeOperacional.map((item, i) => (
                <div key={i} className={`p-4 bg-white rounded-2xl border-l-4 ${item.border} shadow-sm`}>
                  <p className={`text-xs font-bold ${item.titleCls}`}>{item.title}</p>
                  <p className={`text-[10px] ${item.detailCls} mt-1`}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Priorities + Anomalies */}
          <Card title="Prioridades e Insights">
            <div className="space-y-5">
              {/* Seção 1: Top 3 Sinais */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sinais Críticos</p>
                {topPrioridades.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between group cursor-pointer mb-3 pb-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                        {signal.account.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{signal.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{signal.account}</p>
                      </div>
                    </div>
                    <Badge variant={signal.severity === 'crítico' ? 'red' : signal.severity === 'alerta' ? 'amber' : 'slate'}>
                      {signal.severity}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Seção 2: Anomalias da Fila (se houver) */}
              {queueIntelligence.anomalies.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Insights Operacionais</p>
                  {queueIntelligence.anomalies.map((ano, i) => (
                    <div key={i} className={`p-3 rounded-lg mb-2 border-l-4 ${ano.severity === 'high' ? 'border-l-red-500 bg-red-50' : 'border-l-amber-500 bg-amber-50'}`}>
                      <p className={`text-xs font-bold ${ano.severity === 'high' ? 'text-red-900' : 'text-amber-900'}`}>{ano.type}</p>
                      <p className={`text-[10px] ${ano.severity === 'high' ? 'text-red-700' : 'text-amber-700'} mt-1`}>{ano.title}</p>
                      <p className={`text-[10px] ${ano.severity === 'high' ? 'text-red-600' : 'text-amber-600'} mt-0.5`}>{ano.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="secondary" className="w-full mt-4 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">Ver Fila de Ações</Button>
            </div>
          </Card>

          {/* Data Confidence */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Confiança nos Dados</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl font-bold font-headline">98.2%</span>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-8">
                4 fontes de dados conectadas e sincronizadas em tempo real.
              </p>
              <div className="flex gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ABM Readiness */}
          <Card title="Prontidão ABM/ABX" subtitle="Contas com picos de intenção">
            <div className="space-y-4">
              {abmReadyAccounts.map((conta, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-xs font-bold text-brand uppercase">
                      {conta.nome.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{conta.nome}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{conta.oportunidadePrincipal}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      {conta.prontidao > 80 ? 'Alta Prontidão' : 'Em Ascensão'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Potencial: {conta.potencial}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-600 hover:bg-slate-50">Ver Pipeline ABM</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default Overview;
