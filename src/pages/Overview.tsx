/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ShieldCheck, MoreHorizontal, Sparkles } from 'lucide-react';
import { kpis, accountsAtRisk, pipelineInfluence } from '../data/mockData';
import { advancedSignals } from '../data/signalsV6';
import { contasMock } from '../data/accountsData';
import { Card, Badge, Button } from '../components/ui';

export const Overview: React.FC = () => {
  // Derivações de sinais reais
  const criticosSinais = advancedSignals.filter(s => s.severity === 'crítico');
  const alertasSinais  = advancedSignals.filter(s => s.severity === 'alerta');
  const oportunidadesSinais = advancedSignals.filter(s => s.severity === 'oportunidade');

  // Executive Highlight: sinal crítico de maior confiança
  const topSignal = [...criticosSinais].sort((a, b) => b.confidence - a.confidence)[0];

  // Saúde Operacional: 1 representante de cada severity
  const saudeOperacional = [
    criticosSinais[0]
      ? { title: criticosSinais[0].title, detail: criticosSinais[0].impact, border: 'border-red-500', titleCls: 'text-red-900', detailCls: 'text-red-600' }
      : null,
    alertasSinais[0]
      ? { title: alertasSinais[0].title, detail: alertasSinais[0].impact, border: 'border-amber-500', titleCls: 'text-amber-900', detailCls: 'text-amber-600' }
      : null,
    oportunidadesSinais[0]
      ? { title: oportunidadesSinais[0].title, detail: oportunidadesSinais[0].impact, border: 'border-brand', titleCls: 'text-brand', detailCls: 'text-brand' }
      : null,
  ].filter(Boolean) as { title: string; detail: string; border: string; titleCls: string; detailCls: string }[];

  // Prioridades Imediatas: top 3 por severity desc → confidence desc
  const severityOrder: Record<string, number> = { crítico: 0, alerta: 1, oportunidade: 2 };
  const topPrioridades = [...advancedSignals]
    .sort((a, b) =>
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9) ||
      b.confidence - a.confidence
    )
    .slice(0, 3);

  // ABM Readiness: contas com prontidão > 70 e play ativo
  const abmReadyAccounts = contasMock
    .filter(c => c.prontidao > 70 && c.playAtivo !== 'Nenhum')
    .slice(0, 2);

  // Channel Health: pior severity por categoria de sinal
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

      {/* KPIs Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`p-5 rounded-2xl border border-slate-100 shadow-sm ${index === 0 ? 'bg-brand text-white' : 'bg-white text-slate-900'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'text-brand-100' : 'text-slate-400'}`}>{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold font-headline">
                  {kpi.prefix}{kpi.value}{kpi.suffix}
                </h3>
                <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${
                  kpi.trend === 'up' ? (index === 0 ? 'text-white/80' : 'text-emerald-600') :
                  kpi.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                  {kpi.change > 0 ? `+${kpi.change}%` : kpi.change === 0 ? '0%' : `${kpi.change}%`}
                  {index === 0 && <span className="ml-1 opacity-70">vs mês anterior</span>}
                </div>
              </div>
              {index === 0 && (
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
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

          {/* Accounts at Risk */}
          <Card title="Contas em Risco de Churn / Baixo Engajamento" headerAction={<Button variant="ghost" size="sm" className="text-brand font-bold">Ver todas</Button>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50">
                    <th className="pb-4">NOME DA CONTA</th>
                    <th className="pb-4">SCORE DE SAÚDE</th>
                    <th className="pb-4">PRINCIPAIS LACUNAS</th>
                    <th className="pb-4 text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {accountsAtRisk.map((account) => (
                    <tr key={account.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{account.name}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${account.healthScore < 40 ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                          <span className={`font-bold ${account.healthScore < 40 ? 'text-red-600' : 'text-amber-600'}`}>
                            {account.healthScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-xs text-slate-500">{account.gaps[0]}</p>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
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

          {/* Pipeline Influence */}
          <Card title="Influência de Pipeline por Origem">
            <div className="space-y-6 pt-4">
              {pipelineInfluence.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
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

          {/* Immediate Priorities */}
          <Card title="Prioridades Imediatas">
            <div className="space-y-5">
              {topPrioridades.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                      {signal.account.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{signal.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{signal.account} · {signal.owner}</p>
                    </div>
                  </div>
                  <Badge variant={signal.severity === 'crítico' ? 'red' : signal.severity === 'alerta' ? 'amber' : 'slate'}>
                    {signal.severity}
                  </Badge>
                </div>
              ))}
              <Button variant="secondary" className="w-full mt-4 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">Ver Minha Agenda</Button>
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
