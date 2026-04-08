"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Filter,
  Plus,
  ChevronRight,
  BarChart3,
  Database,
  Cpu,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  Layout,
  Layers,
  Activity,
  Map,
  ShieldCheck,
  Globe,
  PieChart,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Bot,
  BadgeCheck,
  Users,
  Box,
  MessageSquare,
  FileText,
  Mail,
  Calendar,
  Eye,
  ArrowUpRight,
  Flag,
  BarChart,
  Cloud,
  BrainCircuit,
  Settings2,
  History,
  Smartphone,
  Share2,
  Bell,
  CheckCircle,
  AlertCircle,
  FileSearch,
  ZapOff,
  Crosshair,
  Briefcase,
  Phone,
  Send,
  Handshake,
  Rocket,
  Network
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { motion } from 'motion/react';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock } from '../data/accountsData';
import { getAbm, type AbmRow } from '../lib/abmRepository';

// --- MOCK DATA ---



// ---- HEATMAP CRITERIA DEFINITION ----
const abmHeatmapCriteria = [
  {
    id: 'icp',
    title: 'ICP Score',
    subtitle: 'Aderência ao Perfil Ideal de Cliente',
    xLabel: 'SCORE ICP',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = aderência ao perfil ideal de cliente. Eixo Y = importância estratégica da conta. Contas no quadrante superior direito são prioridade máxima de abordagem.',
    desc: (a: any) =>
      `ICP ${a.icp}% — ${a.icp >= 75 ? 'Alta aderência ao perfil ideal. Prioridade máxima de abordagem.' : a.icp >= 50 ? 'Aderência moderada. Qualificar antes de avançar.' : 'Fora do perfil. Manter em nurturing passivo.'}`,
    scoreKey: 'icp' as const,
  },
  {
    id: 'crm',
    title: 'Engajamento no CRM',
    subtitle: 'Histórico de interações e atividade registrada',
    xLabel: 'NÍVEL DE ENGAJAMENTO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = volume de interações registradas no CRM (calls, e-mails, demos). Eixo Y = relevância da conta. Contas acima de 70% de engajamento devem ser ativadas via SDR imediatamente.',
    desc: (a: any) =>
      `Engajamento ${a.crm}% — ${a.crm >= 70 ? 'Conta ativa com múltiplas interações. Acionar SDR imediatamente.' : a.crm >= 45 ? 'Engajamento médio. Intensificar conteúdo 1:1.' : 'Conta fria. Iniciar reativação com campanha de reconhecimento.'}`,
    scoreKey: 'crm' as const,
  },
  {
    id: 'vp',
    title: 'Potencial da Vertical',
    subtitle: 'Mercado endereçável e sinergia com nosso portfólio',
    xLabel: 'POTENCIAL DE MERCADO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Cada bolha representa uma vertical de mercado. Eixo X = potencial de expansão e TAM da vertical. Eixo Y = peso estratégico. Verticais no quadrante quente indicam onde concentrar budget de marketing.',
    desc: (a: any) =>
      `Vertical ${a.vp}% — ${a.vp >= 75 ? 'Vertical de alta tração. Há benchmarks e cases aplicáveis.' : a.vp >= 50 ? 'Potencial moderado. Desenvolver case específico.' : 'Vertical emergente. Avaliar ROI antes de investir.'}`,
    scoreKey: 'vp' as const,
  },
  {
    id: 'ct',
    title: 'Contatos Mapeados',
    subtitle: 'Profundidade e qualidade dos relacionamentos na conta',
    xLabel: 'COBERTURA DE CONTATOS',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = cobertura do DMU (Decision Making Unit) — percentual de stakeholders mapeados na conta. Priorize contas estratégicas com baixa cobertura: maior gap, maior oportunidade de expansão.',
    desc: (a: any) =>
      `Contatos ${a.ct}% — ${a.ct >= 75 ? 'DMU bem mapeado. Champion e Decisor identificados.' : a.ct >= 45 ? 'Contatos parciais. Expandir rede via LinkedIn Sales Nav.' : 'Poucos contatos. Estratégia de entrada via eventos ou parceiros.'}`,
    scoreKey: 'ct' as const,
  },
  {
    id: 'ft',
    title: 'Fit com a Canopi',
    subtitle: 'Alinhamento tecnológico, cultural e de timing',
    xLabel: 'FIT CANOPI',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = alinhamento da conta com o stack tecnológico, maturidade analítica e timing comercial da Canopi. Contas com fit alto e importância alta são candidatas a fast-track no pipeline.',
    desc: (a: any) =>
      `Fit ${a.ft}% — ${a.ft >= 75 ? 'Fit excelente. Stack tecnológica e maturidade analítica alinhadas.' : a.ft >= 50 ? 'Fit parcial. Identificar gaps e propor roadmap gradual.' : 'Fit baixo. Considerar parceiros integradores antes de avançar.'}`,
    scoreKey: 'ft' as const,
  },
  {
    id: 'avg',
    title: 'Média Geral',
    subtitle: 'Score consolidado dos 5 critérios — ranking ABM',
    xLabel: 'SCORE CONSOLIDADO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Score composto = média de ICP, Engajamento CRM, Potencial da Vertical, Contatos Mapeados e Fit Canopi. Contas acima de 72% são classificadas como TOP TIER e recebem SDR + AE dedicados.',
    desc: (a: any) => {
      const avg = Math.round((a.icp + a.crm + a.vp + a.ct + a.ft) / 5);
      return `Média ${avg}% — ${avg >= 72 ? 'TOP TIER: Alocar SDR + AE dedicados. Iniciar play imediatamente.' : avg >= 55 ? 'MID TIER: Incluir em sequência nurturing avançada.' : 'LOW TIER: Manter em watch list e reavaliar em 90 dias.'}`;
    },
    scoreKey: 'avg' as const,
  },
];

// --- CONSTANTES DE ESTILO E CORES ---
const HEATMAP_LEGEND = [
  { color: 'bg-[#27ae60]', label: 'Baixo' },
  { color: 'bg-[#f9ca24]', label: 'Médio' },
  { color: 'bg-[#e67e22]', label: 'Alto' },
  { color: 'bg-[#c0392b]', label: 'Crítico' }
];

const HEATMAP_SCALE = ['#22c55e', '#4ade80', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#b91c1c'];

// --- COMPONENTES AUXILIARES (MEMOIZADOS PARA PERFORMANCE) ---

const AbmHeatmapLegend: React.FC = React.memo(() => (
  <div className="flex gap-3 items-center">
    {HEATMAP_LEGEND.map(item => (
      <div key={item.label} className="flex items-center gap-1.5">
        <div className={`w-3 h-3 rounded-full ${item.color}`} />
        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
      </div>
    ))}
  </div>
));
AbmHeatmapLegend.displayName = 'AbmHeatmapLegend';

type HeatmapChartProps = {
  criterion: any;
  accounts: any[];
  weightedIcp: (a: any) => number;
  hmScore: (acc: any, key: string) => number;
  onHover: (tooltip: any) => void;
};

const HeatmapChart: React.FC<HeatmapChartProps> = React.memo(({ criterion, accounts, weightedIcp, hmScore, onHover }) => (
  <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-inner flex-1 flex flex-col bg-slate-900/[0.02] items-center justify-center min-h-[400px]">
    <svg
      width="100%" height="100%"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      className="block cursor-crosshair"
      onMouseLeave={() => onHover(null)}
    >
      <defs>
        <linearGradient id={`hmGradFull-${criterion.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#27ae60" stopOpacity="0.92" />
          <stop offset="40%" stopColor="#f9ca24" stopOpacity="0.92" />
          <stop offset="70%" stopColor="#e67e22" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="500" fill={`url(#hmGradFull-${criterion.id})`} />
      
      {/* Grid lines 4x4 */}
      {[1, 2, 3].map(i => <line key={`v${i}`} x1={i * 200} y1="0" x2={i * 200} y2="500" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
      {[1, 2, 3].map(i => <line key={`h${i}`} x1="0" y1={i * 125} x2="800" y2={i * 125} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
      
      {accounts.map((acc, i) => {
        const score = criterion.scoreKey === 'icp' ? weightedIcp(acc) : hmScore(acc, criterion.scoreKey);
        const cx = 28 + (score / 100) * 744;
        const cy = 470 - (acc.imp / 100) * 440;
        const desc = criterion.desc(acc);

        const tempValue = (score + acc.imp) / 2;
        const numColor = tempValue >= 78 ? '#c0392b' : tempValue >= 62 ? '#e67e22' : tempValue >= 46 ? '#b7860b' : '#1a7a3c';

        const labelText = criterion.id === 'vp' ? acc.vertical : acc.name;
        const shortLabel = labelText.length > 13 ? labelText.slice(0, 13) + '…' : labelText;
        const labelW = Math.min(shortLabel.length * 5.5 + 12, 90);

        const above = i % 2 === 1;
        const lineY1 = above ? cy - 12 : cy + 12;
        const lineY2 = above ? cy - 28 : cy + 28;
        const labelY = above ? lineY2 - 12 : lineY2 + 1;

        return (
          <g
            key={acc.id}
            className="cursor-pointer"
            onMouseEnter={(e) => {
              const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
              const svgX = (e.clientX - rect.left) * (800 / rect.width);
              const svgY = (e.clientY - rect.top) * (500 / rect.height);
              const displayName = criterion.id === 'vp' ? acc.vertical : acc.name;
              onHover({ criterionId: criterion.id, x: svgX, y: svgY, displayName, name: acc.name, vertical: acc.vertical, score, desc });
            }}
          >
            <line x1={cx} y1={lineY1} x2={cx} y2={lineY2} stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeDasharray="2,2" />
            <rect x={cx - labelW / 2} y={above ? labelY - 10 : labelY} width={labelW} height={12} rx="4" fill="rgba(15,23,42,0.72)" />
            <text x={cx} y={above ? labelY - 1 : labelY + 9} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="7" fontWeight="700" fontFamily="sans-serif">{shortLabel}</text>
            <circle cx={cx} cy={cy} r="13" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <text x={cx} y={cy + 3.5} textAnchor="middle" fill={numColor} fontSize="7.5" fontWeight="900" fontFamily="sans-serif">{score}%</text>
          </g>
        );
      })}
      
      <text x="400" y="490" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">{criterion.xLabel}</text>
      <text x="14" y="250" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3" transform="rotate(-90,14,250)">{criterion.yLabel}</text>
    </svg>
  </div>
));
HeatmapChart.displayName = 'HeatmapChart';

const StrategicScatterPlot: React.FC<{
  positioningYAxis: string[];
  matrixVerticals: string[];
  defaultYAxis: string[];
  getPositioningCharacteristic: (v: string, p: string) => number;
  getMatrixScore: (view: string, v: string, p: string) => number;
  pseudoRandom: (seed: number) => number;
  heatmapScale: string[];
  onHover: (tooltip: any) => void;
  hmTooltip: any;
}> = React.memo(({ positioningYAxis, matrixVerticals, defaultYAxis, getPositioningCharacteristic, getMatrixScore, pseudoRandom, heatmapScale, onHover, hmTooltip }) => (
  <div className="w-full h-full flex flex-col justify-center min-w-[600px] relative px-4 bg-white rounded-2xl border border-slate-200">
    <div className="flex-1 relative overflow-hidden bg-white ml-24 mt-8 mb-8 border-b-2 border-slate-100">
      <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="none" className="block cursor-crosshair min-h-[380px]" onMouseLeave={() => onHover(null)}>
        {positioningYAxis.map((_, i) => <line key={`h${i}`} x1="0" y1={(i + 0.5) * (500 / 8)} x2="1200" y2={(i + 0.5) * (500 / 8)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />)}
        <line x1="40" y1="460" x2="1160" y2="40" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,6" />
        {matrixVerticals.map((v, vIdx) => (
          defaultYAxis.map((p, pIdx) => {
            const charIndex = getPositioningCharacteristic(v, p);
            const charName = positioningYAxis[charIndex];
            const volScore = getMatrixScore('pos', v, p);
            const r = 12 + (volScore * 24);
            const percent = Math.round(volScore * 100);
            const offsetX = (pIdx - 2.5) * 16;
            const hash2 = pseudoRandom(pIdx * 19 + vIdx * 11);
            const jitterY = (hash2 - 0.5) * (500 / 8 * 0.75);
            const baseCX = (vIdx + 0.5) * (1200 / 11);
            const baseCY = (charIndex + 0.5) * (500 / 8);
            const cx = Math.max(30, Math.min(1170, baseCX + offsetX));
            const cy = Math.max(30, Math.min(470, baseCY + jitterY));
            const bubbleColor = heatmapScale[charIndex];
            
            return (
              <g key={`${v}-${p}`} className="cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                  const svgX = (e.clientX - rect.left) * (1200 / rect.width);
                  const svgY = (e.clientY - rect.top) * (500 / rect.height);
                  onHover({ id: 'pos', x: svgX, y: svgY, v, p, charName, color: bubbleColor, size: percent });
                }}>
                <title>{p} em {v}: {percent}% volume. Posicionamento: {charName}</title>
                <circle cx={cx} cy={cy} r={r} fill={bubbleColor} opacity="0.85" stroke="#fff" strokeWidth="1.5" />
                <text x={cx} y={cy + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">{percent}%</text>
              </g>
            );
          })
        ))}
        {hmTooltip && hmTooltip.id === 'pos' && (
          <g transform={`translate(${Math.min(hmTooltip.x + 15, 1000)}, ${hmTooltip.y > 380 ? hmTooltip.y - 120 : hmTooltip.y + 15})`} className="pointer-events-none">
            <rect x="0" y="0" width="180" height="96" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" className="drop-shadow-lg" />
            <text x="14" y="24" fill="#0f172a" fontSize="12" fontWeight="800" fontFamily="sans-serif">{hmTooltip.p}</text>
            <text x="14" y="38" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="sans-serif">Vertical: {hmTooltip.v}</text>
            <rect x="14" y="46" width="152" height="1" fill="#f1f5f9" />
            <circle cx="18" cy="62" r="4.5" fill={hmTooltip.color} />
            <text x="28" y="65" fill={hmTooltip.color} fontSize="11" fontWeight="800" fontFamily="sans-serif">{hmTooltip.charName}</text>
            <text x="14" y="82" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Densidade Cargos: {hmTooltip.size || 0}% mapeado</text>
          </g>
        )}
      </svg>
    </div>
    <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-around text-[9px] font-bold text-slate-500 tracking-tighter w-[80px]">
      {positioningYAxis.map(y => <div key={y} className="flex-1 flex items-center justify-end pr-2 border-r-2 border-slate-100"><span className="text-right leading-none max-w-[70px] break-words uppercase">{y}</span></div>)}
    </div>
    <div className="flex justify-around items-center pt-2 pb-4 ml-24 mr-2">
      {matrixVerticals.map(v => <span key={v} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-[60px] text-center truncate mt-2">{v}</span>)}
    </div>
  </div>
));
StrategicScatterPlot.displayName = 'StrategicScatterPlot';

const TacticalMatrixHeatmap: React.FC<{
  matrixVerticals: string[];
  currentYAxis: string[];
  viewId: string;
  getMatrixScore: (view: string, v: string, p: string) => number;
}> = React.memo(({ matrixVerticals, currentYAxis, viewId, getMatrixScore }) => (
  <div className="w-full h-full flex flex-col justify-center min-w-[500px]">
    <div className="flex shrink-0 h-10 mb-2">
      <div className="w-[90px] shrink-0" />
      <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` } as React.CSSProperties}>
        {matrixVerticals.map(vertical => (
          <div key={vertical} className="flex items-end justify-center pb-1">
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter truncate text-center max-w-[60px]">{vertical}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-[2px] mt-2">
      {currentYAxis.map(yLabel => (
        <div key={yLabel} className="flex-1 flex min-h-[32px]">
          <div className="w-[90px] shrink-0 flex items-center justify-end pr-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{yLabel}</div>
          <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` } as React.CSSProperties}>
            {matrixVerticals.map(vertical => {
              const score = getMatrixScore(viewId, vertical, yLabel);
              const color = score >= 0.85 ? '#c0392b' : score >= 0.7 ? '#e67e22' : score >= 0.55 ? '#f9ca24' : score >= 0.4 ? '#a8e6cf' : '#27ae60';
              const textColor = score >= 0.7 || score <= 0.4 ? 'text-white' : 'text-slate-900';
              const scoreVal = Math.round(score * 100);
              return (
                <div key={vertical} className="relative group transition-all rounded-[6px] cursor-pointer hover:border-slate-800 border-2 border-transparent hover:z-30 shadow-inner flex items-center justify-center isolate" style={{ backgroundColor: color } as React.CSSProperties}>
                  <span className={`text-[10px] font-black ${textColor} opacity-90`}>{scoreVal}</span>
                  <div className="absolute opacity-0 group-hover:opacity-100 z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 border border-slate-700 w-52 rounded-xl shadow-2xl p-3 pointer-events-none transition-opacity">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">{vertical}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scoreVal >= 70 ? 'bg-red-500/20 text-red-400' : scoreVal <= 40 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{scoreVal}%</span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 mb-2">{yLabel}</p>
                    <div className="h-px w-full bg-slate-700/50 mb-2"></div>
                    <p className="text-[9px] text-slate-300 leading-relaxed font-medium">
                      Insight: {score >= 0.7 ? 'Alta probabilidade estrutural. Engaje imediatamente.' : score <= 0.4 ? 'Zona de alerta logístico e fricção de acesso.' : 'Potencial moderado de abordagem em lote.'}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 p-1.5 bg-slate-950 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Sugestão: {score >= 0.7 ? 'Direct Mail' : score <= 0.4 ? 'Social Ads' : 'Cold Call'}</span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
));
TacticalMatrixHeatmap.displayName = 'TacticalMatrixHeatmap';

const FirmographicSection: React.FC = React.memo(() => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3"/> Fit Firmográfico ABM</h4>
      <div className="space-y-5">
        {[
          { label: 'Receita Anual (> R$ 500M)', val: 78 },
          { label: 'Sede (SP / Remoto)', val: 92 },
          { label: 'Tamanho Time Tech (> 50)', val: 45 }
        ].map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase"><span>{item.label}</span><span>{item.val}%</span></div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div className="h-full bg-blue-600" style={{ width: `${item.val}%` } as React.CSSProperties}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3"/> Fit Tecnográfico ABM</h4>
      <div className="space-y-3">
        {[
          { icon: <Cloud className="w-4 h-4 text-blue-600" />, title: 'Stack Cloud', desc: 'AWS / Azure Dominante' },
          { icon: <Database className="w-4 h-4 text-blue-600" />, title: 'CRM Utilizado', desc: 'Salesforce (85%)' },
          { icon: <Sparkles className="w-4 h-4 text-blue-600" />, title: 'AI Readiness', desc: 'Alta Maturidade' }
        ].map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group hover:border-blue-300 transition-all cursor-pointer">
            {item.icon}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{item.title}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{item.desc}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
          </div>
        ))}
      </div>
    </div>
  </div>
));
FirmographicSection.displayName = 'FirmographicSection';

export const ABMStrategy: React.FC<{subPage?: string}> = ({ subPage }) => {
  const [hmTooltip, setHmTooltip] = useState<any>(null);
  // Sliders reativos
  const [icpThreshold, setIcpThreshold] = useState(70);
  const [icpWeights, setIcpWeights] = useState({ receita: 30, stack: 25, equipe: 20, setor: 25 });

  const { openAccount } = useAccountDetail();
  const [supabaseAbm, setSupabaseAbm] = useState<AbmRow[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  // Load ABM data from Supabase once on mount
  useEffect(() => {
    (async () => {
      const remote = await getAbm();
      setSupabaseAbm(remote);
    })();
  }, []);

  // Merge: contasMock (base) + supabaseAbm (complementary)
  // Local-first pattern: contasMock is source of truth
  const accounts = useMemo(() => {
    const merged = [...contasMock];

    // Merge fields from Supabase by id (only: icp, crm, vp, ct, ft, abm, tipoEstrategico)
    for (const remote of supabaseAbm) {
      const idx = merged.findIndex(c => c.id === remote.id);
      if (idx >= 0) {
        merged[idx] = {
          ...merged[idx],
          icp: remote.icp ?? merged[idx].icp,
          crm: remote.crm ?? merged[idx].crm,
          vp: remote.vp ?? merged[idx].vp,
          ct: remote.ct ?? merged[idx].ct,
          ft: remote.ft ?? merged[idx].ft,
          tipoEstrategico: remote.tipoEstrategico ?? merged[idx].tipoEstrategico,
          abm: {
            ...merged[idx].abm,
            ...(remote.abm || {})
          }
        };
      }
      // Ignore remote accounts not in contasMock
    }

    return merged;
  }, [supabaseAbm]);

  // Initialize activeAccountId once accounts is available
  useEffect(() => {
    if (activeAccountId === null && accounts.length > 0) {
      setActiveAccountId(accounts[0]!.id);
    }
  }, [accounts, activeAccountId]);

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccountId) || accounts[0];
  }, [activeAccountId, accounts]);

  // Camada Derivada: Transforma accounts (merged) para o formato do Heatmap
  const abmHeatmapAccounts = useMemo(() => {
    return accounts.map(c => ({
      id:       c.id,
      name:     c.nome,
      vertical: c.vertical,
      imp:      c.potencial, // Usamos potencial como prox de importância estratégica (eixo Y)
      icp:      c.icp,
      crm:      c.crm,
      vp:       c.vp,
      ct:       c.ct,
      ft:       c.ft,
      budget:   Math.round(c.budgetBrl / 1000) // Converte BRL absoluto para k para UI
    }));
  }, [accounts]);

  // TAL Table derivada de accounts (merged)
  const abmAccounts = useMemo(() => {
    const statusMap: Record<string, string> = { 'Crítico': 'HOT', 'Atenção': 'PLAYBOOK', 'Saudável': 'MAPEANDO' };
    return accounts.map(c => ({
      id:         c.id,
      initials:   c.nome.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      name:       c.nome,
      vertical:   c.vertical,
      fitScore:   parseFloat((c.prontidao / 10).toFixed(1)),
      status:     statusMap[c.statusGeral] ?? 'WATCH',
      engagement: c.prontidao,
      mqa:        c.prontidao > 70,
    }));
  }, [accounts]);

  // Score ICP ponderado pelos pesos configurados (normalizado 0-100)
  const getWeightedIcp = (acc: any) => {
    const base = acc.icp;
    const weightedDelta = ((icpWeights.receita - 30) * 0.4 + (icpWeights.stack - 25) * 0.3 + (icpWeights.equipe - 20) * 0.2 + (icpWeights.setor - 25) * 0.3) / 10;
    return Math.max(1, Math.min(99, Math.round(base + weightedDelta)));
  };

  const getHmScore = (acc: any, key: string) => {
    return Math.round((acc as any)[key] || 0);
  };


  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-[1700px] mx-auto font-sans text-slate-900">
      
      {/* 1. HERO - Discreet & Powerful */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
           <Activity className="w-64 h-64" />
        </div>
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Target className="w-8 h-8" />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estratégia Comercial</span>
                 <ChevronRight className="w-3 h-3 text-slate-300" />
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Growth Framework</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase">Estratégia ABM</h1>
              <p className="text-xs text-slate-500 font-medium mt-2 max-w-lg leading-relaxed">
                 Orquestração de contas-alvo baseada em fit firmográfico, tecnográfico e sinais de intenção em tempo real. Painel unificado de inteligência e plays táticos.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 z-10">
           <div className="px-6 py-2 text-center border-r border-slate-200">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Target Accounts</p>
              <p className="text-lg font-bold text-slate-900">{accounts.length}</p>
           </div>
           <div className="px-6 py-2 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Health Score</p>
              <p className="text-lg font-bold text-emerald-600">{(accounts.reduce((acc, c) => acc + c.prontidao, 0) / (accounts.length * 10)).toFixed(1)}/10</p>
           </div>
           <Button size="sm" className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-6 border-none" title="Refinar lista de contas-alvo" aria-label="Refinar lista de contas-alvo">Refinar TAL</Button>
        </div>
      </div>

      {/* GRID PRINCIPAL: TAL (7/12) + Funil ABM + Clusters (5/12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: TAL TABLE compact */}
        <div className="xl:col-span-7">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase">Universo de Contas (TAL)</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Interações, Fit e Maturidade do Pipeline ABM</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-[10px] font-bold text-slate-400 uppercase"><Filter className="w-3 h-3 mr-1.5"/>Filtros</Button>
                <Button size="sm" className="bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase py-1.5 px-4 border-none shadow-lg shadow-blue-500/20">Nova Conta</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="pl-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Account / Vertical</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase text-center">Score</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase text-center">MQA</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase">Engaj.</th>
                    <th className="pr-6 py-3 text-[9px] font-bold text-slate-500 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {abmAccounts.map(acc => (
                    <tr key={acc.id} 
                        className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${activeAccountId === acc.id ? 'bg-blue-50/30' : ''}`} 
                        onClick={() => { setActiveAccountId(acc.id); openAccount(acc.id, undefined, { originModule: 'Estratégia ABM' }); }}>
                      <td className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs group-hover:border-blue-400 transition-all shadow-sm">{acc.initials}</div>
                          <div><p className="text-xs font-bold text-slate-800">{acc.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{acc.vertical}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center"><span className="text-xs font-bold text-slate-900">{acc.fitScore}</span></td>
                      <td className="px-3 py-3.5 text-center">
                        {acc.mqa ? (<div className="flex justify-center"><BadgeCheck className="w-4 h-4 text-emerald-500" /></div>) : (<div className="flex justify-center"><Circle className="w-4 h-4 text-slate-200" /></div>)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className={`h-full ${acc.engagement > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${acc.engagement}%` } as React.CSSProperties}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-900">{acc.engagement}%</span>
                        </div>
                      </td>
                      <td className="pr-6 py-3.5 text-right"><Badge variant={acc.status === 'HOT' ? 'emerald' : 'slate'} className="text-[8px] font-bold uppercase border-none">{acc.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Reserved for future operational content */}
        <div className="xl:col-span-5 space-y-5">
        </div>
      </div>
      {/* FIM GRID PRINCIPAL */}

            {/* ===== 6 HEATMAPS DE CONTAS ABM + ACTION CARDS ===== */}
            {(() => {
              const orderedCriteria = ['avg','icp','ct','ft','crm','vp'];
              const criteriaMap = Object.fromEntries(abmHeatmapCriteria.map(c => [c.id, c]));

              // Sorted accounts by avg for ranking
              const ranked = [...abmHeatmapAccounts].sort((a,b) => {
                const avgA = Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5);
                const avgB = Math.round((b.icp+b.crm+b.vp+b.ct+b.ft)/5);
                return avgB - avgA;
              });

              const qualifiedIcp = abmHeatmapAccounts.filter(a => getWeightedIcp(a) >= icpThreshold);
              const hotCrm = abmHeatmapAccounts.filter(a => a.crm >= 70);
              const coldCrm = abmHeatmapAccounts.filter(a => a.crm < 45);

              const MiniActions = ({ actions }: { actions: { icon: React.ReactNode; label: string }[] }) => (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 mt-auto">
                  {actions.map((a, i) => (
                    <div key={i}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-100 text-center opacity-40">
                      <span className="text-slate-400">{a.icon}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wide leading-tight">{a.label}</span>
                    </div>
                  ))}
                </div>
              );

              const actionCards: Record<string, React.ReactNode[]> = {
                avg: [
                  <div key="avg-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-blue-500"/>Ranking ABM</p>
                      <Badge variant="blue" className="text-[8px] border-none bg-blue-50 text-blue-600 font-bold">POSIÇÃO: {accounts.indexOf(activeAccount) + 1}º</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {ranked.slice(0,5).map((acc, i) => {
                        const avg = Math.round((acc.icp+acc.crm+acc.vp+acc.ct+acc.ft)/5);
                        const isCurrent = acc.id === activeAccountId;
                        const tier = avg >= 72 ? { label:'TOP', cls:'bg-red-100 text-red-600' } : avg >= 55 ? { label:'MID', cls:'bg-amber-100 text-amber-600' } : { label:'LOW', cls:'bg-slate-100 text-slate-500' };
                        return (
                          <div key={acc.id} className={`flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-blue-50 border border-blue-100' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-300 w-4">{i+1}</span>
                            <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-slate-800 truncate">{acc.name}</p></div>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md ${tier.cls}`}>{tier.label}</span>
                            <span className="text-[11px] font-black text-slate-700">{avg}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Exportar CSV' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Atribuir AE' },
                      { icon: <Flag className="w-3 h-3"/>, label: 'Criar Meta' },
                    ]} />
                  </div>,
                  <div key="avg-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500"/>Próxima Ação: {activeAccount.nome}</p>
                    <div className="space-y-2">
                      {[
                        { label: activeAccount.prontidao > 70 ? 'Ativação Prioritária (MQA)' : 'Nurturing Estratégico', sub: activeAccount.statusGeral === 'Crítico' ? 'Ação imediata exigida' : 'Acompanhamento semanal', cls: activeAccount.prontidao > 70 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700', icon: <Zap className="w-3 h-3"/> },
                        { label: 'Briefing da Vertical', sub: `Foco em ${activeAccount.vertical}`, cls: 'bg-blue-600 hover:bg-blue-700 text-white', icon: <Target className="w-3 h-3"/> },
                        { label: 'Revisão de Comitê', sub: activeAccount.ct < 50 ? 'Gaps identificados' : 'DMU Mapeada', cls: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700', icon: <Network className="w-3 h-3"/> }
                      ].map((btn, i) => (
                        <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${btn.cls}`}>
                          {btn.icon}
                          <div><p className="text-[10px] font-bold">{btn.label}</p><p className="text-[8px] opacity-70">{btn.sub}</p></div>
                        </button>
                      ))}
                    </div>
                    <MiniActions actions={[
                      { icon: <ArrowUpRight className="w-3 h-3"/>, label: 'Oportunidade' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Agendar Day' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Sync Account' },
                    ]} />
                  </div>,

                  <div key="avg-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout className="w-3 h-3 text-indigo-500"/>Playbooks Sugeridos</p>
                    <div className="space-y-2">
                       {[
                         activeAccount.icp > 80 ? 'Expansão Tier 1 (ICP Alto)' : 'Infiltração Tech Stack',
                         activeAccount.ct < 50 ? 'Mapeamento de DMU' : 'Reengajamento C-Level',
                         activeAccount.budgetBrl > 1000000 ? 'Executivo Lead (High Budget)' : 'Nurturing Mid-Market'
                       ].map((p, i) => (
                         <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                           <span className="text-[9px] font-bold text-slate-700">{p}</span>
                           <Badge variant="blue" className="text-[7px] border-none bg-blue-50 text-blue-600">RECOMENDADO</Badge>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2" title="Ativar playbook para esta conta" aria-label="Ativar playbook para esta conta">Ativar Playbook Selecionado</button>
                    <MiniActions actions={[
                      { icon: <Activity className="w-3 h-3"/>, label: 'Performance' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Templates' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Audiência' },
                    ]} />
                  </div>,
                ],
                icp: [
                  <div key="icp-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-blue-500"/>Qualificação ICP</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                          <span>Score mínimo</span>
                          <span className="text-blue-600">≥ {icpThreshold}% — {qualifiedIcp.length} contas</span>
                        </div>
                        <input type="range" min="40" max="95" value={icpThreshold}
                          onChange={e => setIcpThreshold(Number(e.target.value))}
                          className="w-full h-1.5 accent-blue-600 rounded-full cursor-pointer"
                          aria-label="Ajustar threshold de qualificação ICP"
                          title={`Threshold atual: ${icpThreshold}%`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        {qualifiedIcp.slice(0,4).map(acc => (
                          <div key={acc.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <span className="text-[9px] font-bold text-slate-700 truncate max-w-[110px]">{acc.name}</span>
                            <span className="text-[10px] font-black text-blue-700">{getWeightedIcp(acc)}%</span>
                          </div>
                        ))}
                        {qualifiedIcp.length === 0 && <p className="text-[9px] text-slate-400 text-center py-2">Nenhuma conta nesse threshold</p>}
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-all active:scale-[0.98]" title="Exportar contas qualificadas" aria-label="Exportar lista de contas qualificadas">Exportar Lista Qualificada</button>
                    <MiniActions actions={[
                      { icon: <FileSearch className="w-3 h-3"/>, label: 'Segmento' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Sync CRM' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Revisão' },
                    ]} />
                  </div>,
                  <div key="icp-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings2 className="w-3 h-3 text-slate-500"/>Pesos do ICP</p>
                    <p className="text-[8px] text-slate-400">Ajuste os pesos — scores recalculados ao vivo.</p>
                    <div className="space-y-2">
                      {([
                        { label:'Receita Anual', key:'receita' as const, val: icpWeights.receita },
                        { label:'Stack Tecnológico', key:'stack' as const, val: icpWeights.stack },
                        { label:'Tamanho de Equipe', key:'equipe' as const, val: icpWeights.equipe },
                        { label:'Setor / Vertical', key:'setor' as const, val: icpWeights.setor },
                      ] as const).map((w) => (
                        <div key={w.key} className="space-y-0.5">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>{w.label}</span><span className="text-slate-700">{w.val}%</span></div>
                          <input type="range" min="0" max="50" value={w.val}
                            onChange={e => setIcpWeights(prev => ({ ...prev, [w.key]: Number(e.target.value) }))}
                            className="w-full h-1.5 accent-slate-600 rounded-full cursor-pointer"
                            aria-label={`Ajustar peso para ${w.label}`}
                            title={`Peso atual: ${w.val}%`}
                          />
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-all active:scale-[0.98]" title="Salvar pesos de qualificação ICP" aria-label="Salvar pesos de qualificação ICP">Salvar Configuração</button>
                    <MiniActions actions={[
                      { icon: <History className="w-3 h-3"/>, label: 'Histórico' },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Compartilhar' },
                      { icon: <Bell className="w-3 h-3"/>, label: 'Alertas' },
                    ]} />
                  </div>,

                  <div key="icp-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bot className="w-3 h-3 text-emerald-500"/>IA Lookalike</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Encontre contas gemêas baseadas nas TOP 10% qualificadas no ICP atual.</p>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                       <Bot className="w-5 h-5 text-emerald-600"/>
                       <div>
                         <p className="text-[10px] font-bold text-slate-800">42 Contas Descobertas</p>
                         <p className="text-[8px] text-emerald-600 font-bold uppercase">Sinergia &gt; 85% com o tier 1</p>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2" title="Importar contas via IA" aria-label="Importar do Canopi Intel">Importar do Canopi Intel</button>
                    <MiniActions actions={[
                      { icon: <Search className="w-3 h-3"/>, label: 'Refinar IA' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Enriquecer' },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Enviar Vendas' },
                    ]} />
                  </div>,
                ],
                ct: [
                  <div key="ct-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3 text-indigo-500"/>Gap de Comitê: {activeAccount.nome}</p>
                    <div className="space-y-1.5 flex-1">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                         <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
                         <div>
                            <p className="text-[9px] font-bold text-slate-800">Mapeamento Incompleto ({activeAccount.ct}%)</p>
                            <p className="text-[8px] text-slate-500 leading-tight">Faltam decisores estratégicos de <strong>{activeAccount.vertical}</strong>.</p>
                         </div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2">Contatos Recomendados</p>
                      {['VP of Engineering', 'Director of Finance', 'Head of Growth'].map((role, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group hover:border-indigo-300 border border-transparent transition-all">
                           <span className="text-[9px] font-bold text-slate-700">{role}</span>
                           <button 
                             className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors active:scale-90"
                             aria-label={`Adicionar contato recomendado: ${role}`}
                             title="Adicionar contato"
                           >
                             <Plus className="w-3 h-3" aria-hidden="true"/>
                           </button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title="Enriquecer dados via Apollo" aria-label="Enriquecer via Apollo">Enriquecer via Apollo</button>
                  </div>,
                  <div key="ct-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-emerald-500"/>Status DMU</p>
                    <div className="space-y-1.5 flex-1">
                      {[
                        { cargo:'CEO / Board', status: activeAccount.ct > 80 ? 'ok' : 'gap', pct: activeAccount.ct > 80 ? 88 : 12 },
                        { cargo:'CFO / Finance', status: activeAccount.ct > 70 ? 'ok' : 'gap', pct: activeAccount.ct > 70 ? 75 : 28 },
                        { cargo:'CTO / TI', status: activeAccount.ct > 50 ? 'ok' : 'gap', pct: activeAccount.ct > 50 ? 92 : 35 },
                        { cargo:'Marketing Lead', status: 'ok', pct: 65 },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                          <span className="text-[9px] font-medium text-slate-600 flex-1">{c.cargo}</span>
                          <span className={`text-[9px] font-bold ${c.status === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[9px] font-bold uppercase rounded-xl transition-colors" title="Iniciar sequência multi-thread" aria-label="Iniciar Sequência Multi-Thread">Iniciar Sequência Multi-Thread</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Campanha' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Atividade' },
                      { icon: <MessageSquare className="w-3 h-3"/>, label: 'Conectar' },
                    ]} />
                  </div>,
                  <div key="ct-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Map className="w-3 h-3 text-blue-500"/>Mapa de Influência</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed font-medium">Visualizando bloqueadores e campeões em <strong>{activeAccount.vertical}</strong>.</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50">
                          <p className={`text-[12px] font-black ${activeAccount.ct > 50 ? 'text-blue-600' : 'text-slate-400'}`}>{activeAccount.ct > 50 ? '12' : '02'}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Champions</p>
                       </div>
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50">
                          <p className={`text-[12px] font-black ${activeAccount.ct < 40 ? 'text-amber-500' : 'text-slate-400'}`}>{activeAccount.ct < 40 ? '08' : '01'}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Bloqueadores</p>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2" title="Analisar radar de influência" aria-label="Iniciar Radar de Influência">Iniciar Radar de Influência</button>
                    <MiniActions actions={[
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Social Selling' },
                      { icon: <TrendingUp className="w-3 h-3"/>, label: 'Evolução' },
                      { icon: <Zap className="w-3 h-3"/>, label: 'Ação C-Level' },
                    ]} />
                  </div>,
                ],
                ft: [
                  <div key="ft-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-emerald-500"/>Potencial: {activeAccount.nome}</p>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${activeAccount.ft > 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                         {activeAccount.ft > 70 ? 'HIGH FIT' : 'FIT STAND.'}
                      </span>
                    </div>
                    <div className="space-y-1.5 flex-1 pt-1">
                       <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <p className="text-[9px] font-bold text-emerald-700 uppercase">Análise de Budget</p>
                          <p className="text-[10px] font-bold text-slate-800">R$ {(activeAccount.budgetBrl / 1000).toFixed(0)}k <span className="text-[8px] font-medium text-slate-400">identificado</span></p>
                          <p className="text-[8px] text-emerald-600 font-bold mt-1 uppercase">
                             {activeAccount.budgetBrl > 1000000 ? 'Prioridade Tier A (VP Level)' : 'Prioridade Tier B'}
                          </p>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title="Gerar proposta comercial" aria-label="Gerar Proposta Estrutural">Gerar Proposta Estrutural</button>
                    <MiniActions actions={[{icon:<BarChart className="w-3 h-3"/>, label:'ROI'}, {icon:<CheckCircle2 className="w-3 h-3"/>, label:'Validar'}]} />
                  </div>,
                  <div key="ft-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-3 h-3 text-blue-500"/>Análise de Gaps de Fit</p>
                    <div className="space-y-2">
                      {[
                        { label:'Stack Tecnológico', val:72, color:'bg-blue-500' },
                        { label:'Maturidade Analítica', val:58, color:'bg-indigo-500' },
                        { label:'Timing Comercial', val:44, color:'bg-amber-500' },
                        { label:'Cultura de Dados', val:35, color:'bg-red-500' },
                      ].map((g, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>{g.label}</span><span>{g.val}%</span></div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.val}%` } as React.CSSProperties}/></div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 text-[9px] font-bold uppercase rounded-xl transition-colors" title={`Benchmarking da vertical ${activeAccount.vertical}`} aria-label={`Benchmarking ${activeAccount.vertical}`}>Benchmarking {activeAccount.vertical}</button>
                  </div>,

                  <div key="ft-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3 text-amber-500"/>Sinais de Intenção</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed font-medium">Detectando picos de interesse para o perfil de <strong>{activeAccount.vertical}</strong>.</p>
                    <div className="space-y-1.5 pt-2 flex-1">
                       <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-[9px] font-bold text-slate-800">{activeAccount.nome}</p>
                          <p className="text-[8px] text-amber-600 uppercase font-bold mt-1"><Zap className="inline w-2 h-2 mr-1"/>Picos de Acesso Recentes</p>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2" title="Visualizar sinais de intenção" aria-label="Monitorar Signals">Monitorar Signals</button>
                    <MiniActions actions={[
                      { icon: <Search className="w-3 h-3"/>, label: 'Tech Stack' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Alerta CRM' },
                      { icon: <Users className="w-3 h-3"/>, label: 'G2 / Capterra' },
                    ]} />
                  </div>,
                ],
                crm: [
                  <div key="crm-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3 text-orange-500"/>Engajamento: {activeAccount.nome}</p>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${activeAccount.crm > 65 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                         {activeAccount.crm > 65 ? 'ATIVO' : 'AQUECENDO'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex-1">
                       <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">Sinal de Receptividade</p>
                       <p className="text-[10px] font-medium text-slate-700 leading-relaxed italic">
                         &quot;{activeAccount.crm > 60 ? 'A conta demonstra interações consistentes com SDRs nos últimos 15 dias.' : 'Baixa tração orgânica. Requer abordagem consultiva Tier 2 para destravar.'}&quot;
                       </p>
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title="Timeline de atividades no CRM" aria-label="Timeline CRM">Timeline CRM</button>
                    <MiniActions actions={[
                      { icon: <Briefcase className="w-3 h-3"/>, label: 'Atividade' },
                      { icon: <Mail className="w-3 h-3"/>, label: 'Seq. E-mail' },
                      { icon: <Phone className="w-3 h-3"/>, label: 'Ligar' },
                    ]} />
                  </div>,
                  <div key="crm-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-3 h-3 text-red-500"/>Gargalos Detectados</p>
                    <div className="space-y-2 flex-1">
                       {[
                         { l: 'Fricção de Contato', s: activeAccount.crm < 50 ? 'ALTA' : 'BAIXA', c: activeAccount.crm < 50 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50 border-none' },
                         { l: 'Tempo de Resposta', s: activeAccount.crm < 40 ? 'LENTO' : 'OK', c: activeAccount.crm < 40 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50 border-none' },
                         { l: 'Aderência Tech', s: activeAccount.icp > 70 ? 'ALTA' : 'MODERADA', c: 'text-blue-600 bg-blue-50 border-none' }
                       ].map((g, i) => (
                         <div key={i} className="flex justify-between items-center p-2 rounded-lg border border-slate-50">
                           <span className="text-[9px] font-bold text-slate-600 uppercase">{g.l}</span>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${g.c}`}>{g.s}</span>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-2 font-bold text-[9px] text-red-600 border border-red-100 hover:bg-red-50 rounded-xl uppercase" title="Escalar fluxo de atendimento crítico" aria-label="Escalar Fluxo">Escalar Fluxo</button>
                  </div>,

                  <div key="crm-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Send className="w-3 h-3 text-blue-500"/>Playbook Sugerido</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-medium">Campanha para a vertical <strong>{activeAccount.vertical}</strong> baseada no score atual de CRM (<strong>{activeAccount.crm}%</strong>).</p>
                    <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-xl border-dashed">
                       <p className="text-[10px] font-bold text-blue-800">&quot;Desafios de {activeAccount.vertical} 2024&quot;</p>
                       <p className="text-[8px] text-blue-600 mt-1 uppercase font-bold">3 e-mails | 2 calls | 1 LinkedIn</p>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title="Injetar playbooks no pipeline" aria-label="Injetar na Fila">Injetar na Fila</button>
                  </div>,
                ],
                vp: [
                  <div key="vp-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-3 h-3 text-purple-500"/>Clusterização: {activeAccount.nome}</p>
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl space-y-2 flex-1">
                       <p className="text-[9px] font-bold text-purple-700 uppercase">Contexto de Vertical</p>
                       <p className="text-[10px] font-medium text-slate-700 leading-relaxed italic">
                         &quot;{activeAccount.vertical === 'Tecnologia' ? 'Alta propensão a adoção de novas stacks. Focar em ROI de infraestrutura.' : 'Vertical com ciclo de venda longo. Focar em conformidade e segurança.'}&quot;
                       </p>
                    </div>
                    <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title={`Ver detalhes do cluster ${activeAccount.vertical}`} aria-label={`Ver Cluster ${activeAccount.vertical}`}>Ver Cluster {activeAccount.vertical}</button>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Exportar PDF' },
                      { icon: <Flag className="w-3 h-3"/>, label: 'Alocar Verba' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Compartilhar' },
                    ]} />
                  </div>,
                  <div key="vp-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-3 h-3 text-indigo-500"/>Mover para Cluster</p>
                    <div className="space-y-1.5 flex-1 pt-1">
                       <p className="text-[9px] text-slate-400 font-medium">Atribua {activeAccount.nome} a um cluster estratégico para disparar playbooks orquestrados.</p>
                       <select 
                         className="w-full text-[10px] border border-slate-200 rounded-xl px-3 py-2 bg-white font-medium text-slate-700 mt-2 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                         aria-label="Selecionar cluster estratégico para a conta"
                       >
                          <option value="">Selecione um Cluster...</option>
                          <option value="tier1">Tier 1 - High Priority</option>
                          <option value="churn">Churn Risk - Winback</option>
                          <option value="expansion">Expansion - Cross-sell</option>
                       </select>
                    </div>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors" title="Confirmar alocação estratégica" aria-label="Confirmar Alocação">Confirmar Alocação</button>
                    <MiniActions actions={[
                      { icon: <Users className="w-3 h-3"/>, label: 'Ver Contas' },
                      { icon: <Mail className="w-3 h-3"/>, label: 'Play' },
                      { icon: <Crosshair className="w-3 h-3"/>, label: 'Segmentar' },
                    ]} />
                  </div>,

                  <div key="vp-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500"/>Influência & Rapport</p>
                    <div className="space-y-1.5 flex-1 pt-1">
                       <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Acesso Decisor</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${activeAccount.ct > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                             {activeAccount.ct > 60 ? 'MAPEADO' : 'PENDENTE'}
                          </span>
                       </div>
                       <p className="text-[8px] text-slate-400 leading-relaxed mt-1">Status de mapeamento do comitê de compras (CT Score: {activeAccount.ct}%).</p>
                    </div>
                    <button className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 text-[9px] font-bold uppercase rounded-xl transition-colors" title="Mapa detalhado do comitê" aria-label="Visualizar Comitê">Visualizar Comitê</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'RSVP' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Presentes' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Executivo' },
                    ]} />
                  </div>,
                ],
              };


              return orderedCriteria.map((id) => {
                const criterion = criteriaMap[id];
                return (
                  <div key={criterion.id} className="space-y-5">
                    <div className="grid grid-cols-1 xl:grid-cols-[58.5%_41.5%] gap-5 items-stretch">
                      {/* Heatmap card */}
                      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-full space-y-5">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 uppercase">{criterion.title}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">{criterion.subtitle}</p>
                          </div>
                          <AbmHeatmapLegend />
                        </div>
                        
                        {/* SVG heatmap */}
                        <HeatmapChart 
                          criterion={criterion} 
                          accounts={abmHeatmapAccounts} 
                          weightedIcp={getWeightedIcp} 
                          hmScore={getHmScore} 
                          onHover={setHmTooltip} 
                        />
                        
                        {/* Disclaimer */}
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-3 px-1 border-t border-slate-50 mt-2">
                          <span className="font-bold text-slate-500 uppercase tracking-wide mr-1">Como ler:</span>{criterion.note}
                        </p>
                      </div>

                      {/* Action cards — grid 2x2 perfeitamente simétrico */}
                      <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-4 h-full">
                        {(actionCards[criterion.id] || []).map((card, i) => (
                          <div key={i} className={i === 2 ? "col-span-2 h-full" : "col-span-1 h-full"}>
                            {card}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

           {/* ===== ANÁLISE DE CONTATOS E DEPARTAMENTOS ===== */}
           <div className="pt-8 space-y-12">
             <div className="flex flex-col gap-2 mb-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Análise de Contatos e Departamentos</h2>
               <p className="text-sm text-slate-500 font-medium">Cruzamento tático global: Perfil de Contato vs Vertical de Mercado</p>
             </div>

             {(() => {
               const matrixVerticals = ['Varejo', 'Indústria', 'Saúde', 'Telecom', 'Energia', 'Mobilização', 'Finanças', 'Agro', 'Seguros', 'Mineração', 'Automóvel'];
               const defaultYAxis = ['C-Level', 'Diretor', 'Gerente', 'Coord.', 'Espec.', 'Analista'];
               const positioningYAxis = ['Decisor', 'Embaixador', 'Champion', 'Comprador', 'Stakeholder', 'Influenciador', 'Gatekeeper', 'Detrator'];
               const heatmapScale = ['#22c55e', '#4ade80', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#b91c1c'];
               
               const pseudoRandom = (seed: number) => {
                 const x = Math.sin(seed++) * 10000;
                 return x - Math.floor(x);
               };

               const matrixViews = [
                 { id: 'pos', title: 'Gráfico de Dispersão de Posicionamento', desc: 'Mapeamento vetorial de como as personas se posicionam diante da Canopi.', yAxisDef: defaultYAxis, note: 'Cada bolha é um Cargo. O eixo Y sinaliza onde aquele cargo estaciona na jornada de decisão. O tamanho rege o volume de contatos.' },
                 { id: 'pot', title: 'Potencial de Contato por Vertical vs Cargo', desc: 'Score agregado de propensão a conversão e engajamento da conta alvo.', yAxisDef: defaultYAxis, note: 'Cruze os eixos de Vertical (colunas) e Cargo (linhas) para descobrir cruzamentos de máximo potencial.' },
                 { id: 'recept', title: 'Receptividade Média (Rapport)', desc: 'Grau de abertura para criar um relacionamento inicial qualificado.', yAxisDef: defaultYAxis, note: 'Tons mais quentes identificam hierarquias corporativas super engajadas.' },
                 { id: 'access', title: 'Acessibilidade de Contato', desc: 'Nível de dificuldade política ou logística para alcançar o decisor.', yAxisDef: defaultYAxis, note: 'Mede a ausência de Gatekeepers. Áreas verdes significam alta blindagem.' }
               ];

               const getPositioningCharacteristic = (vId: string, pId: string) => {
                 const seed = (vId.charCodeAt(0) * 3 + pId.charCodeAt(0) * 7) % 100;
                 if (pId === 'C-Level') return seed > 70 ? 0 : seed > 40 ? 4 : seed > 20 ? 6 : 7;
                 if (pId === 'Diretor') return seed > 60 ? 1 : seed > 30 ? 3 : 6;
                 if (pId === 'Gerente') return seed > 70 ? 2 : seed > 30 ? 3 : 5;
                 if (pId === 'Coord.' || pId === 'Espec.') return seed > 80 ? 7 : seed > 40 ? 5 : 4;
                 return seed > 50 ? 5 : 4;
               };

               const getMatrixScore = (view: string, vId: string, pId: string) => {
                 let base = 0.5;
                 const seed = (vId.charCodeAt(0) + pId.charCodeAt(0) + view.charCodeAt(0)) % 100;
                 base = (seed / 100) * 0.4 + 0.3; 
                 if (view === 'access') {
                   if (pId === 'C-Level') base = 0.1 + (seed/100)*0.2;
                   else if (pId === 'Diretor') base = 0.2 + (seed/100)*0.3;
                   else if (pId === 'Analista' || pId === 'Espec.') base = 0.7 + (seed/100)*0.3;
                   else base = 0.5 + (seed/100)*0.3;
                 }
                 else if (view === 'recept') {
                   if (pId === 'C-Level') base -= 0.2;
                   if (pId === 'Gerente' || pId === 'Coord.') base += 0.25;
                 }
                 else if (view === 'pot') {
                   if (pId === 'C-Level' || pId === 'Analista') base -= 0.15;
                   if (pId === 'Diretor' || pId === 'Gerente') base += 0.2;
                 }
                 else if (view === 'pos') {
                   let vol = (pId === 'C-Level') ? 0.2 : (pId === 'Diretor' ? 0.4 : 0.7);
                   base = vol;
                 }
                 return Math.max(0.01, Math.min(0.99, base));
               };

               const matrixCardsMap: Record<string, React.ReactNode[]> = {
                 pot: [
                   <div key="bp0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-emerald-500"/>Potencial: {activeAccount.nome}</p>
                     <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex-1">
                        <p className="text-[9px] font-bold text-slate-600 uppercase">Score ICP {activeAccount.icp}%</p>
                        <p className="text-[10px] font-medium text-slate-700 leading-relaxed mt-1">Conta estratégica para vertical {activeAccount.vertical}.</p>
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-emerald-600 text-white rounded-xl" title="Iniciar playbook para especialista" aria-label="Playbook Especialista">Playbook Especialista</button>
                   </div>
                 ]
               };

               return (
                 <React.Fragment>
                   {matrixViews.map((view, vIdx) => (
                     <div key={view.id} className="mb-12">
                       <div className={view.id === 'pos' ? "flex flex-col gap-6" : "grid grid-cols-1 xl:grid-cols-[60%_40%] gap-6 items-stretch"}>
                         
                         <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col h-full space-y-6">
                            <div className="flex justify-between items-center px-2">
                               <div>
                                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Layout className="w-5 h-5 text-blue-600"/>
                                    {vIdx + 1}. {view.title}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-medium mt-1">{view.desc}</p>
                               </div>
                            </div>
                            <div className="flex-1 flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-[24px] shadow-inner overflow-x-auto min-h-[400px]">
                               {view.id === 'pos' ? (
                                 <StrategicScatterPlot 
                                   positioningYAxis={positioningYAxis}
                                   matrixVerticals={matrixVerticals}
                                   defaultYAxis={defaultYAxis}
                                   getPositioningCharacteristic={getPositioningCharacteristic}
                                   getMatrixScore={getMatrixScore}
                                   pseudoRandom={pseudoRandom}
                                   heatmapScale={heatmapScale}
                                   onHover={setHmTooltip}
                                   hmTooltip={hmTooltip}
                                 />
                               ) : (
                                 <TacticalMatrixHeatmap 
                                   matrixVerticals={matrixVerticals}
                                   currentYAxis={view.yAxisDef}
                                   viewId={view.id}
                                   getMatrixScore={getMatrixScore}
                                 />
                               )}
                            </div>
                            <div className="mt-4 pt-4 px-2 border-t border-slate-100">
                               <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                  <span className="font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md mr-2">Como Ler</span>
                                  {view.note}
                               </p>
                            </div>
                         </div>

                         <div className={view.id === 'pos' ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "grid grid-cols-1 gap-4 h-full"}>
                           {(matrixCardsMap[view.id] || matrixCardsMap.pot).map((card, i) => (
                             <div key={i} className="h-full">
                               {card}
                             </div>
                           ))}
                         </div>
                       </div>

                       {view.id === 'pos' && (
                         <div className="w-full flex items-center gap-4 pt-12 opacity-80">
                           <div className="h-px bg-slate-200 flex-1"></div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border border-slate-200 rounded-full py-1">Heatmaps Táticos Verticais</span>
                           <div className="h-px bg-slate-200 flex-1"></div>
                         </div>
                       )}
                     </div>
                   ))}
                 </React.Fragment>
               );
             })()}
           </div>

           {/* FIT FIRMOGRÁFICO + TECNOGRÁFICO */}
           <FirmographicSection />
         </div>
      );
    };

// --- HELPER COMPONENTS ---

const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
);


export default ABMStrategy;
