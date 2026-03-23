"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  FileText,
  MousePointer,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { Button, Modal } from '../components/ui';

// Base Mock Data
const basePerformanceData = [
  { name: 'Semana 01', pipeline: 800000, investimento: 10000, pipelineAnterior: 720000, investimentoAnterior: 9500 },
  { name: 'Semana 02', pipeline: 1200000, investimento: 12000, pipelineAnterior: 1050000, investimentoAnterior: 11000 },
  { name: 'Semana 03', pipeline: 2450000, investimento: 14200, pipelineAnterior: 2100000, investimentoAnterior: 13500 },
  { name: 'Semana 04', pipeline: 1800000, investimento: 13000, pipelineAnterior: 1950000, investimentoAnterior: 14200 },
  { name: 'Semana 05', pipeline: 2900000, investimento: 15000, pipelineAnterior: 2400000, investimentoAnterior: 13800 },
];

const baseChannelMetrics = [
  { canal: 'SEO Orgânico', baseOportunidades: 142, basePipeline: 4.2, taxaBase: 22, cplBase: 12.00, color: '#3b82f6' },
  { canal: 'Google Search (Paid)', baseOportunidades: 89, basePipeline: 2.8, taxaBase: 18, cplBase: 84.50, color: '#8b5cf6' },
  { canal: 'Inbound Marketing', baseOportunidades: 204, basePipeline: 5.1, taxaBase: 28, cplBase: 45.20, color: '#10b981' },
  { canal: 'LinkedIn Ads', baseOportunidades: 31, basePipeline: 1.1, taxaBase: 14, cplBase: 156.00, color: '#f59e0b' },
  { canal: 'Eventos (Offline/Online)', baseOportunidades: 45, basePipeline: 3.5, taxaBase: 35, cplBase: 320.00, color: '#ec4899' },
  { canal: 'Email Marketing', baseOportunidades: 211, basePipeline: 2.2, taxaBase: 12, cplBase: 8.50, color: '#06b6d4' },
  { canal: 'Partners/Referral', baseOportunidades: 28, basePipeline: 6.4, taxaBase: 45, cplBase: 0.00, color: '#14b8a6' },
];

const baseHeatmapData = [
  { time: '00-02H', channels: [1, 1, 2, 2, 1, 1] },
  { time: '02-04H', channels: [1, 1, 1, 1, 1, 1] },
  { time: '04-06H', channels: [2, 1, 1, 1, 1, 2] },
  { time: '06-08H', channels: [3, 2, 2, 3, 2, 4] },
  { time: '08-10H', channels: [4, 4, 3, 4, 3, 5] },
  { time: '10-12H', channels: [5, 5, 4, 3, 4, 3] },
  { time: '12-14H', channels: [4, 5, 5, 4, 3, 2] },
  { time: '14-16H', channels: [4, 4, 5, 5, 4, 3] },
  { time: '16-18H', channels: [5, 5, 4, 4, 5, 2] },
  { time: '18-20H', channels: [3, 4, 3, 2, 2, 1] },
  { time: '20-22H', channels: [2, 2, 2, 1, 1, 1] },
  { time: '22-00H', channels: [1, 1, 1, 1, 1, 1] },
];

const channelNames = ['PAID SEARCH', 'SEO ORGÂNICO', 'SOCIAL ADS', 'OUTBOUND', 'REFERRAL', 'E-MAIL'];

type TimeFilter = '7d' | '30d' | '90d';

const KPICard = ({ title, value, trend, isPositive }: { title: string, value: string, trend: string, isPositive: boolean }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  </div>
);

export const Performance: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState('receita');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  
  // Modal states for simulations
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const filterMultipliers = {
    '7d': { vol: 0.25, rateMod: -2.4, cplMod: +15, label: 'Últimos 7 dias' },
    '30d': { vol: 1.0, rateMod: 0, cplMod: 0, label: 'Últimos 30 dias' },
    '90d': { vol: 3.2, rateMod: +4.1, cplMod: -12, label: 'Últimos 90 dias' },
  };

  const currFilter = filterMultipliers[timeFilter];

  // Derive dynamic heatmap data so colors change from Hot to Cold
  const dynamicHeatmapData = baseHeatmapData.map((slot, i) => ({
    time: slot.time,
    channels: slot.channels.map((val, j) => {
      // Simulate heat variation based on volume
      let newVal = val * currFilter.vol;

      // Add variety for other periods to illustrate big jumps
      if (timeFilter !== '30d') {
         // Create deterministic pseudo-random noise so it feels real
         const noise = (Math.sin(i * 10 + j * 5) + Math.cos(val)) * (timeFilter === '90d' ? 2 : 1.5);
         newVal += noise;
      }
      
      if (activeMetric === 'volume') newVal *= 1.2;
      if (activeMetric === 'investimento') newVal *= 0.8;
      // Clamp between 1 (Colsest) to 5 (Hottest)
      return Math.min(5, Math.max(1, Math.round(newVal)));
    })
  }));

  const metrics = [
    { id: 'receita', label: 'Receita' },
    { id: 'volume', label: 'Volume' },
    { id: 'oportunidades', label: 'Oportunidades' },
    { id: 'investimento', label: 'Investimento' },
    { id: 'trafego', label: 'Tráfego' },
  ];

  const getHeatmapValue = (intensity: number) => {
    const base = intensity * 10;
    switch (activeMetric) {
      case 'receita': return `R$ ${(base * 12.5).toFixed(0)}k`;
      case 'volume': return (base * 150).toFixed(0);
      case 'oportunidades': return (base * 12).toFixed(0);
      case 'investimento': return `R$ ${(base * 1.2).toFixed(1)}k`;
      case 'trafego': return (base * 1200).toFixed(0);
      default: return base;
    }
  };

  // The requested Hot to Cold Color Scale (Frio -> Quente) with Pastel & Transparency
  const hotColdScaleColors = [
    'bg-[#bae6fd]/70 text-blue-900 border-[#7dd3fc]/50', // 1: Very Cold (Pastel Light Blue)
    'bg-[#e0f2fe]/80 text-blue-900 border-[#bae6fd]/60', // 2: Cold (Lighter Blue/Cyan)
    'bg-[#fef08a]/80 text-yellow-900 border-[#fde047]/60', // 3: Warm (Pastel Yellow)
    'bg-[#fdba74]/80 text-orange-900 border-[#fb923c]/60', // 4: Hot (Pastel Orange)
    'bg-[#fca5a5]/80 text-red-900 border-[#f87171]/60', // 5: Very Hot (Pastel Red)
  ];

  const getHeatmapColor = (intensity: number) => {
    const index = Math.min(Math.max(Math.floor(intensity) - 1, 0), 4);
    return hotColdScaleColors[index];
  };

  const cycleTimeFilter = () => {
    if (timeFilter === '30d') setTimeFilter('90d');
    else if (timeFilter === '90d') setTimeFilter('7d');
    else setTimeFilter('30d');
  };

  const openSimModal = (title: string, type: string, extra?: any) => {
    let content;
    switch(type) {
      case 'EXPORT':
        content = (
          <div className="space-y-6 flex flex-col items-center justify-center py-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center animate-bounce">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Gerando Relatório B2B...</h3>
              <p className="text-sm text-slate-500 mt-2">Exportando KPIs detalhados da visualização de {currFilter.label}.</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-full animate-[progress_2s_ease-out]"></div>
              <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Download Concluído</p>
          </div>
        );
        break;
      case 'HEATMAP_CELL':
        content = (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-8 h-8 rounded-lg ${getHeatmapColor(extra.intensity)}`}></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{extra.channel} • {extra.time}</p>
                <p className="font-bold text-slate-900 text-lg">{getHeatmapValue(extra.intensity)} gerados ({activeMetric})</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl relative overflow-hidden">
              <Zap className="w-16 h-16 absolute -right-2 -bottom-2 text-amber-200/50" />
              <p className="text-sm text-amber-900 relative z-10 font-medium">
                <strong className="block mb-1 text-amber-700">Insight Sistêmico:</strong>
                A conversão nesta faixa horária aumentou 45% nos {currFilter.label}. Recomendamos alocar SDRs dedicados para inbound reply neste momento específico.
              </p>
            </div>
          </div>
        );
        break;
      case 'FILTERS':
        content = (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Simulação do painel lateral de Filtros Avançados.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-2">SEGMENTO</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked readOnly/> Enterprise</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" readOnly/> Mid-Market</div>
                </div>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-2">TIER CONTA</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked readOnly/> Tier 1</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" readOnly/> Tier 2</div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600" onClick={() => setModalOpen(false)}>Aplicar Filtros</Button>
          </div>
        );
        break;
      case 'REPORT':
        content = (
          <div className="text-center py-8 space-y-4">
             <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
             <h3 className="font-bold text-lg">Abrindo Deep Dive...</h3>
             <p className="text-sm text-slate-500">Isso abriria um drill-down detalhado das métricas do funil por canal.</p>
          </div>
        );
        break;
      default:
        content = <div className="p-4">Simulação acionada.</div>;
    }

    setModalData({ title, content });
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Análise de Desempenho</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitoramento avançado de fluxo de receita e eficiência de funil.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dynamic Filter simulation trigger */}
          <button 
            onClick={cycleTimeFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm group relative"
          >
            <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="w-[110px] text-center">{currFilter.label}</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
          </button>
          
          <button onClick={() => openSimModal('Filtros Avançados', 'FILTERS')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button onClick={() => openSimModal('Exportação', 'EXPORT')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Grid (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Investimento Total" 
          value={`R$ ${(142.5 * currFilter.vol).toFixed(1)}k`} 
          trend={currFilter.vol > 1 ? "+12%" : "-4%"} 
          isPositive={currFilter.vol >= 1} 
        />
        <KPICard 
          title="Custo por Lead (CPL)" 
          value={`R$ ${(42.10 * (1 + (currFilter.cplMod/100))).toFixed(2)}`} 
          trend={`${currFilter.cplMod > 0 ? '+' : ''}${currFilter.cplMod}%`} 
          isPositive={currFilter.cplMod <= 0} 
        />
        <KPICard 
          title="Taxa de Conversão" 
          value={`${(18.4 + currFilter.rateMod).toFixed(1)}%`} 
          trend={`${currFilter.rateMod > 0 ? '+' : ''}${(2.1 + currFilter.rateMod).toFixed(1)}%`} 
          isPositive={currFilter.rateMod >= 0} 
        />
        <KPICard 
          title="CAC Médio" 
          value={`R$ ${(1250 * (1 + (currFilter.cplMod/100))).toFixed(0)}`} 
          trend={`${currFilter.cplMod > 0 ? '+' : '-'}${(8 + Math.abs(currFilter.cplMod)).toFixed(1)}%`} 
          isPositive={currFilter.cplMod <= 0} 
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Duna de Receita & Tendência de Investimento</h2>
            <p className="text-slate-400 text-xs mt-1 font-medium">Análise temporal de pipeline influenciado vs capital alocado</p>
          </div>
          <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-600"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-200"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investimento</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={basePerformanceData.map(d => ({
              ...d, 
              pipeline: d.pipeline * currFilter.vol,
              investimento: d.investimento * currFilter.vol,
              pipelineAnterior: d.pipelineAnterior * currFilter.vol,
            }))}>
              <defs>
                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorPipelineAnterior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detalhamento Semanal</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Período Atual</p>
                            <p className="text-xs font-medium flex justify-between gap-6">
                              <span className="text-slate-400">Pipeline:</span>
                              <span className="font-bold text-white">R$ {payload[0]?.value ? Number(payload[0].value).toLocaleString('pt-BR') : 0}</span>
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-800">
                            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Período Anterior</p>
                            <p className="text-xs font-medium flex justify-between gap-6">
                              <span className="text-slate-400">Pipeline:</span>
                              <span className="font-bold text-slate-300">R$ {payload[1]?.value ? Number(payload[1].value).toLocaleString('pt-BR') : 0}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="pipelineAnterior" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorPipelineAnterior)" />
              <Area type="monotone" dataKey="pipeline" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPipeline)" />
              <Area type="monotone" dataKey="investimento" stroke="#93c5fd" strokeWidth={2} strokeDasharray="3 3" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Matriz de Densidade de Conversão</h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-slate-500 text-xs font-medium">Temperatura performática redimensionada por: <b>{currFilter.label}</b></p>
              <div className="h-1 w-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <span className="text-[8px] font-bold text-blue-700 uppercase tracking-widest">Frio</span>
                <div className="flex gap-0.5">
                  {hotColdScaleColors.map((color, i) => (
                    <div key={i} className={`w-4 h-1.5 rounded-sm ${color}`}></div>
                  ))}
                </div>
                <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Quente</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center bg-slate-100/50 p-1 rounded-xl">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMetric === metric.id
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <div className="space-y-3 pt-1">
                {channelNames.map((channel, i) => (
                  <div key={i} className="h-10 flex items-center justify-end pr-2 border-r border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{channel}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                {dynamicHeatmapData.map((timeSlot, colIndex) => (
                  <div key={colIndex} className="space-y-3">
                    {timeSlot.channels.map((intensity, rowIndex) => (
                      <div 
                        key={rowIndex} 
                        onClick={() => openSimModal('Insight por Quadrante', 'HEATMAP_CELL', { intensity, channel: channelNames[rowIndex], time: timeSlot.time })}
                        className={`h-10 rounded-lg transition-all duration-300 hover:scale-[1.15] cursor-pointer ${getHeatmapColor(intensity)} flex items-center justify-center group relative shadow-sm hover:z-10`}
                      >
                        <span className="text-[7px] font-bold opacity-80 group-hover:opacity-0 transition-opacity whitespace-nowrap px-1">
                           {getHeatmapValue(intensity)}
                        </span>
                        <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 absolute inset-0 justify-center">
                           <MousePointer className="w-3 h-3"/>
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 text-center border-t border-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                        {timeSlot.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table and Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Métricas Comparativas por Canal</h2>
            <button onClick={() => openSimModal('Relatório Consolidado', 'REPORT')} className="text-blue-600 text-[11px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">Ver relatório <ArrowRight className="w-3 h-3" /></button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Canal de Aquisição</th>
                  <th className="text-right pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oportunidades</th>
                  <th className="text-right pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Gerado</th>
                  <th className="text-right pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa SQL/OP</th>
                  <th className="text-right pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {baseChannelMetrics.map((item, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openSimModal(`Detalhes: ${item.canal}`, 'REPORT')}>
                    <td className="py-4 pl-4 rounded-l-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-bold text-slate-700">{item.canal}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-sm font-medium text-slate-600">{(item.baseOportunidades * currFilter.vol).toFixed(0)}</td>
                    <td className="py-4 text-right text-sm font-bold text-slate-900 border-l border-transparent group-hover:border-slate-100 px-4 bg-transparent group-hover:bg-slate-100/50 transition-colors">
                      R$ {(item.basePipeline * currFilter.vol).toFixed(1)}M
                    </td>
                    <td className="py-4 text-right text-sm font-bold text-emerald-600">
                      {Math.max(1, (item.taxaBase + currFilter.rateMod)).toFixed(1)}%
                    </td>
                    <td className="py-4 pr-4 rounded-r-xl text-right text-sm font-medium text-slate-600">
                      R$ {(item.cplBase * (1 + (currFilter.cplMod/100))).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Insights Card */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-blue-300" />
                <h2 className="text-lg font-bold">Insights Estratégicos</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => openSimModal('Aprofundamento', 'REPORT')}>
                  <p className="text-sm font-medium leading-relaxed text-blue-50">
                    "O ROI de <strong className="text-white">Partners/Referral</strong> domina a geração de Pipeline eficiente (- CPL) nos {currFilter.label}."
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => openSimModal('Aprofundamento Heatmap', 'REPORT')}>
                  <p className="text-sm font-medium leading-relaxed text-blue-50">
                    "Picos (<strong className="text-red-300">Quente</strong>) no heatmap às 14h apontam que Eventos Online performam melhor à tarde."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Integrity Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Integridade de Dados</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Analytics API</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">Sincronizado</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">LinkedIn Ads</span>
                </div>
                <span className="text-[9px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-widest">Falha Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Simulation Modal */}
       <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'Operação Canopi'}
      >
        <div className="pt-2 pb-4">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};


export default Performance;
