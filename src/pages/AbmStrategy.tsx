"use client";

import React, { useState, useMemo } from 'react';
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
  Rocket,
  Handshake,
  Network
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { motion } from 'motion/react';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock } from '../data/accountsData';

// --- MOCK DATA ---



// ---- 6 ABM HEATMAPS DATA ----
const abmHeatmapAccounts = [
  // name, vertical, importance(y), icp, crm, verticalPot, contacts, fit, budget(R$k mapeado da base ABM)
  { id: 1,  name: 'AlphaBank S.A.',    vertical: 'Financeiro',  imp: 88, icp: 87, crm: 45, vp: 82, ct: 78, ft: 84, budget: 420 },
  { id: 2,  name: 'NovaSaude',         vertical: 'Saúde',       imp: 74, icp: 72, crm: 80, vp: 68, ct: 55, ft: 70, budget: 185 },
  { id: 3,  name: 'PaperTech Ind.',    vertical: 'Indústria',   imp: 60, icp: 58, crm: 62, vp: 75, ct: 90, ft: 55, budget: 90  },
  { id: 4,  name: 'MobilityPro',       vertical: 'Mobilidade',  imp: 50, icp: 45, crm: 35, vp: 60, ct: 40, ft: 48, budget: 60  },
  { id: 5,  name: 'AgroCloud',         vertical: 'Agronegócio', imp: 65, icp: 78, crm: 70, vp: 85, ct: 30, ft: 60, budget: 210 },
  { id: 6,  name: 'TelecomMax',        vertical: 'Telecom',     imp: 80, icp: 82, crm: 90, vp: 55, ct: 65, ft: 77, budget: 310 },
  { id: 7,  name: 'SeguraVida',        vertical: 'Seguros',     imp: 55, icp: 55, crm: 48, vp: 52, ct: 72, ft: 50, budget: 130 },
  { id: 8,  name: 'RetailTech',        vertical: 'Varejo',      imp: 42, icp: 38, crm: 55, vp: 40, ct: 35, ft: 38, budget: 45  },
  { id: 9,  name: 'EduVision',         vertical: 'Educação',   imp: 35, icp: 30, crm: 28, vp: 45, ct: 20, ft: 32, budget: 30  },
  { id: 10, name: 'InfraBuild',        vertical: 'Construção',  imp: 70, icp: 65, crm: 60, vp: 70, ct: 85, ft: 62, budget: 160 },
  { id: 11, name: 'FinPay Brasil',     vertical: 'Fintech',     imp: 85, icp: 90, crm: 85, vp: 78, ct: 60, ft: 88, budget: 380 },
  { id: 12, name: 'EnergyCore',        vertical: 'Energia',     imp: 62, icp: 50, crm: 42, vp: 90, ct: 48, ft: 56, budget: 250 },
];
const abmHeatmapCriteria = [
  {
    id: 'icp',
    title: 'ICP Score',
    subtitle: 'Aderência ao Perfil Ideal de Cliente',
    xLabel: 'SCORE ICP',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = aderência ao perfil ideal de cliente. Eixo Y = importância estratégica da conta. Contas no quadrante superior direito são prioridade máxima de abordagem.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
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
    desc: (a: typeof abmHeatmapAccounts[0]) =>
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
    desc: (a: typeof abmHeatmapAccounts[0]) =>
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
    desc: (a: typeof abmHeatmapAccounts[0]) =>
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
    desc: (a: typeof abmHeatmapAccounts[0]) =>
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
    desc: (a: typeof abmHeatmapAccounts[0]) => {
      const avg = Math.round((a.icp + a.crm + a.vp + a.ct + a.ft) / 5);
      return `Média ${avg}% — ${avg >= 72 ? 'TOP TIER: Alocar SDR + AE dedicados. Iniciar play imediatamente.' : avg >= 55 ? 'MID TIER: Incluir em sequência nurturing avançada.' : 'LOW TIER: Manter em watch list e reavaliar em 90 dias.'}`;
    },
    scoreKey: 'avg' as const,
  },
];
// Helper to get score for 'avg'
const getHmScore = (acc: typeof abmHeatmapAccounts[0], key: string): number => {
  if (key === 'avg') return Math.round((acc.icp + acc.crm + acc.vp + acc.ct + acc.ft) / 5);
  return acc[key as keyof typeof acc] as number;
};

export const ABMStrategy: React.FC<{subPage?: string}> = ({ subPage }) => {
  const [hmTooltip, setHmTooltip] = useState<any>(null);
  // Sliders reativos
  const [icpThreshold, setIcpThreshold] = useState(70);
  const [icpWeights, setIcpWeights] = useState({ receita: 30, stack: 25, equipe: 20, setor: 25 });

  const { openAccount } = useAccountDetail();

  // TAL Table derivada de contasMock
  const abmAccounts = useMemo(() => {
    const statusMap: Record<string, string> = { 'Crítico': 'HOT', 'Atenção': 'PLAYBOOK', 'Saudável': 'MAPEANDO' };
    return contasMock.map(c => ({
      id:         c.id,
      initials:   c.nome.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      name:       c.nome,
      vertical:   c.vertical,
      fitScore:   parseFloat((c.prontidao / 10).toFixed(1)),
      status:     statusMap[c.statusGeral] ?? 'WATCH',
      engagement: c.prontidao,
      mqa:        c.prontidao > 70,
    }));
  }, []);

  // Score ICP ponderado pelos pesos configurados (normalizado 0-100)
  const getWeightedIcp = (acc: typeof abmHeatmapAccounts[0]) => {
    const base = acc.icp;
    const weightedDelta = ((icpWeights.receita - 30) * 0.4 + (icpWeights.stack - 25) * 0.3 + (icpWeights.equipe - 20) * 0.2 + (icpWeights.setor - 25) * 0.3) / 10;
    return Math.max(1, Math.min(99, Math.round(base + weightedDelta)));
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
              <p className="text-lg font-bold text-slate-900">142</p>
           </div>
           <div className="px-6 py-2 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Health Score</p>
              <p className="text-lg font-bold text-emerald-600">8.4/10</p>
           </div>
           <Button size="sm" className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-6 border-none">Refinar TAL</Button>
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
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => openAccount(acc.id)}>
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
                            <div className={`h-full ${acc.engagement > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${acc.engagement}%` }}></div>
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
                      <Badge variant="blue" className="text-[8px] border-none bg-blue-50 text-blue-600 font-bold">AO VIVO</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {ranked.slice(0,5).map((acc, i) => {
                        const avg = Math.round((acc.icp+acc.crm+acc.vp+acc.ct+acc.ft)/5);
                        const tier = avg >= 72 ? { label:'TOP', cls:'bg-red-100 text-red-600' } : avg >= 55 ? { label:'MID', cls:'bg-amber-100 text-amber-600' } : { label:'LOW', cls:'bg-slate-100 text-slate-500' };
                        return (
                          <div key={acc.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500"/>Orquestrar em Lote</p>
                    <div className="space-y-2">
                      {[
                        { label:'Ativar TOP TIER', sub:`${ranked.filter(a=>Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5)>=72).length} contas prontas`, cls:'bg-red-600 hover:bg-red-700 text-white', icon:<Zap className="w-3 h-3"/>, type:'BATCH_TOP' },
                        { label:'Nurturing MID TIER', sub:`${ranked.filter(a=>{const s=Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5);return s>=55&&s<72;}).length} contas em espera`, cls:'bg-amber-500 hover:bg-amber-600 text-white', icon:<Activity className="w-3 h-3"/>, type:'BATCH_MID' },
                        { label:'Watch List LOW TIER', sub:`${ranked.filter(a=>Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5)<55).length} contas`, cls:'bg-slate-200 hover:bg-slate-300 text-slate-700', icon:<Clock className="w-3 h-3"/>, type:'BATCH_LOW' },
                      ].map((btn, i) => (
                        <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${btn.cls}`}>
                          {btn.icon}
                          <div><p className="text-[10px] font-bold">{btn.label}</p><p className="text-[8px] opacity-70">{btn.sub}</p></div>
                        </button>
                      ))}
                    </div>
                    <MiniActions actions={[
                      { icon: <ArrowUpRight className="w-3 h-3"/>, label: 'Criar Oport.' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Agendar' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Sync CRM' },
                    ]} />
                  </div>,

                  <div key="avg-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout className="w-3 h-3 text-indigo-500"/>Playbooks em Execução</p>
                    <div className="space-y-2">
                       {['Expansão Tier 1', 'Reengajamento C-Level', 'Nurturing Mid-Market'].map((p, i) => (
                         <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                           <span className="text-[9px] font-bold text-slate-700">{p}</span>
                           <Badge variant="blue" className="text-[7px] border-none">ATIVO</Badge>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Explorar Biblioteca de Plays</button>
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
                          className="w-full h-1.5 accent-blue-600 rounded-full cursor-pointer"/>
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
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Exportar Lista Qualificada</button>
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
                            className="w-full h-1.5 accent-slate-600 rounded-full cursor-pointer"/>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Salvar Configuração</button>
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
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Importar do Canopi Intel</button>
                    <MiniActions actions={[
                      { icon: <Search className="w-3 h-3"/>, label: 'Refinar IA' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Enriquecer' },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Enviar Vendas' },
                    ]} />
                  </div>,
                ],
                ct: [
                  <div key="ct-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widests flex items-center gap-2"><Users className="w-3 h-3 text-indigo-500"/>Gap de Contatos (DMU)</p>
                    <div className="space-y-1.5">
                      {abmHeatmapAccounts.filter(a => a.ct < 50 && a.imp > 60).slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0"/>
                          <div className="flex-1 min-w-0"><p className="text-[9px] font-bold text-slate-800 truncate">{acc.name}</p><p className="text-[8px] text-slate-400">{acc.ct}% mapeado</p></div>
                          <button className="text-[8px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-indigo-700 transition-colors shrink-0">Enriquecer</button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="w-3 h-3"/>LinkedIn Sales Nav
                    </button>
                    <MiniActions actions={[
                      { icon: <Database className="w-3 h-3"/>, label: 'Atual. CRM' },
                      { icon: <CheckCircle className="w-3 h-3"/>, label: 'Atribuir' },
                      { icon: <Smartphone className="w-3 h-3"/>, label: 'Canopi' },
                    ]} />
                  </div>,
                  <div key="ct-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-emerald-500"/>Cargos Críticos DMU</p>
                    <div className="space-y-1.5">
                      {[
                        { cargo:'CEO / Presidente', status:'gap', pct:38 },
                        { cargo:'CFO / Dir. Finanças', status:'gap', pct:42 },
                        { cargo:'CTO / Dir. TI', status:'ok', pct:78 },
                        { cargo:'VP Comercial', status:'gap', pct:30 },
                        { cargo:'Head de Produto', status:'ok', pct:65 },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                          <span className="text-[9px] font-medium text-slate-600 flex-1">{c.cargo}</span>
                          <span className={`text-[9px] font-bold ${c.status === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Criar Sequência por Cargo</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Campanha' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Atividade' },
                      { icon: <MessageSquare className="w-3 h-3"/>, label: 'Conectar' },
                    ]} />
                  </div>,

                  <div key="ct-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Map className="w-3 h-3 text-blue-500"/>Mapa de Influência</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Identifique os bloqueadores e campeões dentro dos comitês mapeados.</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50"><p className="text-[12px] font-black text-blue-600">14</p><p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Champions</p></div>
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50"><p className="text-[12px] font-black text-amber-500">8</p><p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Bloqueadores</p></div>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Mapear Conexões</button>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-emerald-500"/>Fast-Track Pipeline</p>
                      <Badge variant="emerald" className="text-[8px] border-none bg-emerald-50 text-emerald-600 font-bold">{abmHeatmapAccounts.filter(a=>a.ft>=75).length} elegíveis</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {abmHeatmapAccounts.filter(a => a.ft >= 75).slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl group hover:border-emerald-300 transition-all">
                          <div><p className="text-[9px] font-bold text-slate-800">{acc.name}</p><p className="text-[8px] text-emerald-600">Fit {acc.ft}% — Budget R${acc.budget}k</p></div>
                          <button className="text-[8px] bg-emerald-600 text-white px-2 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">Mover</button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Mover Todas para Oportunidade</button>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Proposta' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Demo' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Criar Oport.' },
                    ]} />
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
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.val}%` }}/></div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Propor Roadmap de Fit</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Campanha Fit' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Workshop' },
                      { icon: <FileText className="w-3 h-3"/>, label: 'Case Study' },
                    ]} />
                  </div>,

                  <div key="ft-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3 text-amber-500"/>Sinais Tecnológicos</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Contas indicando mudanças de infraestrutura ou adoção de concorrentes.</p>
                    <div className="space-y-1.5">
                       {[{name: 'TechInsure Co.', signal:'Pesquisa Cloud AWS'},{name:'ScalePay Brasil', signal:'Fim contratação Hubspot'}].map((a, i) => (
                         <div key={i} className="p-2 bg-amber-50 rounded-lg">
                           <p className="text-[9px] font-bold text-slate-800">{a.name}</p>
                           <p className="text-[8px] text-amber-600 uppercase font-bold mt-0.5"><Zap className="inline w-2 h-2 mr-1"/>{a.signal}</p>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Monitorar Concorrentes</button>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500"/>Contas Quentes</p>
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{hotCrm.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {hotCrm.slice(0,3).map(acc => (
                        <div key={acc.id} className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"/><p className="text-[9px] font-bold text-slate-800 truncate max-w-[90px]">{acc.name}</p></div>
                            <span className="text-[8px] font-bold text-blue-700">{acc.crm}%</span>
                          </div>
                          <div className="flex gap-1">
                            {[
                              { label:'SDR', color:'bg-blue-600 hover:bg-blue-700', type:'SDR' },
                              { label:'AE / Vendas', color:'bg-indigo-600 hover:bg-indigo-700', type:'AE' },
                              { label:'Campanha', color:'bg-purple-600 hover:bg-purple-700', type:'CAMP' },
                            ].map(b => (
                              <button key={b.type} className={`flex-1 text-[7px] ${b.color} text-white py-1 rounded-lg font-bold transition-colors`}>{b.label}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Criar Sequência Multicanal</button>
                    <MiniActions actions={[
                      { icon: <ArrowUpRight className="w-3 h-3"/>, label: 'Oportunidade' },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Atividade' },
                      { icon: <Database className="w-3 h-3"/>, label: 'Atual. CRM' },
                    ]} />
                  </div>,
                  <div key="crm-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bell className="w-3 h-3 text-amber-500"/>Reativação de Frias</p>
                    <div className="space-y-1.5">
                      {coldCrm.slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0"/>
                          <div className="flex-1 min-w-0"><p className="text-[9px] font-bold text-slate-800 truncate">{acc.name}</p><p className="text-[8px] text-slate-400">{acc.crm}% engaj. — {acc.vertical}</p></div>
                          <button className="text-[8px] bg-amber-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-amber-600 transition-colors shrink-0">Reativar</button>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Lançar Campanha Reengajamento</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Email Flow' },
                      { icon: <Eye className="w-3 h-3"/>, label: 'Diagnóstico' },
                      { icon: <ZapOff className="w-3 h-3"/>, label: 'Pausar' },
                    ]} />
                  </div>,

                  <div key="crm-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-emerald-500"/>Velocidade do Pipeline</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Dias médios na fase atual de contas mapeadas vs contas ignoradas.</p>
                    <div className="flex items-end gap-3 h-16 mt-2 pt-2 border-t border-slate-50">
                       <div className="flex-1 bg-slate-100 rounded-t-lg h-full flex items-center justify-center flex-col"><p className="text-[11px] font-black">28</p><p className="text-[6px] text-slate-400 uppercase font-bold">Inativo</p></div>
                       <div className="flex-1 bg-emerald-500 rounded-t-lg h-[45%] flex items-center justify-center flex-col text-white"><p className="text-[11px] font-black">12</p><p className="text-[6px] text-emerald-100 uppercase font-bold">ABM</p></div>
                    </div>
                    <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Analisar Gargalos</button>
                    <MiniActions actions={[
                      { icon: <History className="w-3 h-3"/>, label: 'Histórico' },
                      { icon: <Activity className="w-3 h-3"/>, label: 'Forecasting' },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'RevOps' },
                    ]} />
                  </div>,
                ],
                vp: [
                  <div key="vp-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-3 h-3 text-purple-500"/>Budget Mapeado (Contexto)</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Budget ABM real extraído do histórico da base de clientes por setor. Pool total identificado: <span className="font-bold text-slate-700">R$480k</span></p>
                    <div className="space-y-1.5 pt-1">
                      {([
                        { label:'Financeiro', pct:35, color:'bg-blue-600' },
                        { label:'Saúde', pct:20, color:'bg-emerald-600' },
                        { label:'Agronegócio', pct:18, color:'bg-lime-600' },
                        { label:'Telecom', pct:15, color:'bg-indigo-600' },
                        { label:'Outros', pct:12, color:'bg-slate-400' },
                      ] as const).map(v => {
                        const rsk = Math.round(480 * v.pct / 100);
                        return (
                          <div key={v.label} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${v.color}`}></span>
                                <span className="text-[9px] font-bold text-slate-700 uppercase">{v.label}</span>
                             </div>
                             <span className="text-[10px] font-black text-purple-700">R${rsk}k <span className="text-[8px] text-slate-400 opacity-60">({v.pct}%)</span></span>
                          </div>
                        );
                      })}
                    </div>
                    <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Explorar Dados Financeiros</button>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Exportar PDF' },
                      { icon: <Flag className="w-3 h-3"/>, label: 'Alocar Verba' },
                      { icon: <Users className="w-3 h-3"/>, label: 'Compartilhar' },
                    ]} />
                  </div>,
                  <div key="vp-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-3 h-3 text-indigo-500"/>Criar Cluster ABM</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nome do Cluster</label>
                        <input type="text" placeholder="Ex: Fintech High Growth" className="w-full text-[10px] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 text-slate-700 font-medium"/>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Vertical Alvo</label>
                        <select className="w-full text-[10px] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 text-slate-700 font-medium bg-white">
                          {['Financeiro','Saúde','Agronegócio','Telecom','Indústria','Mobilidade','Seguros','Varejo','Educação','Construção','Energia'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Score Mínimo de Vertical</label>
                        <input type="range" min="40" max="90" defaultValue="65" className="w-full h-1.5 accent-indigo-600 rounded-full cursor-pointer"/>
                      </div>
                    </div>
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-2"><Plus className="w-3 h-3"/>Criar Cluster</button>
                    <MiniActions actions={[
                      { icon: <Users className="w-3 h-3"/>, label: 'Ver Contas' },
                      { icon: <Mail className="w-3 h-3"/>, label: 'Play' },
                      { icon: <Crosshair className="w-3 h-3"/>, label: 'Segmentar' },
                    ]} />
                  </div>,

                  <div key="vp-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500"/>Eventos & Relacionamento</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Orquestração offline para clusters de altíssimo valor (Eventos, Jantares).</p>
                    <div className="space-y-1.5 pt-1">
                       {[{name:'Jantar C-Level', date:'12 Nov, SP', cluster:'Fintech Top'},{name:'Workshop Tech', date:'20 Nov, Online', cluster:'Saúde Mid'}].map((e,i) => (
                         <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <div><p className="text-[9px] font-bold text-slate-800">{e.name}</p><p className="text-[7px] font-bold text-blue-500 uppercase">{e.cluster}</p></div>
                            <span className="text-[8px] font-bold text-slate-400 text-right">{e.date}</span>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Planejar Evento Regional</button>
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
                  <div key={criterion.id} className="grid grid-cols-1 xl:grid-cols-[58.5%_41.5%] gap-5 items-stretch">
                    {/* Heatmap card */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-full space-y-5">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 uppercase">{criterion.title}</h3>
                          <p className="text-sm text-slate-500 font-medium mt-1">{criterion.subtitle}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                          {[{c:'#27ae60',l:'Baixo'},{c:'#f9ca24',l:'Médio'},{c:'#e67e22',l:'Alto'},{c:'#c0392b',l:'Crítico'}].map(i=>(
                            <div key={i.l} className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor:i.c}}></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{i.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    {/* SVG heatmap */}
                    <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-inner flex-1 flex flex-col bg-slate-900/[0.02] items-center justify-center">
                      <svg
                        width="100%" height="100%"
                        viewBox="0 0 800 500"
                        preserveAspectRatio="xMidYMid meet"
                        style={{display:'block', cursor:'crosshair', minHeight: '400px'}}
                        onMouseLeave={() => setHmTooltip(null)}
                      >
                        <defs>
                          <linearGradient id={`hmGradFull-${criterion.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#27ae60" stopOpacity="0.92" />
                            <stop offset="40%"  stopColor="#f9ca24" stopOpacity="0.92" />
                            <stop offset="70%"  stopColor="#e67e22" stopOpacity="0.92" />
                            <stop offset="100%" stopColor="#c0392b" stopOpacity="0.92" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="800" height="500" fill={`url(#hmGradFull-${criterion.id})`} />
                        {/* Grid lines 4x4 */}
                        {[1,2,3].map(i => <line key={`v${i}`} x1={i*200} y1="0" x2={i*200} y2="500" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
                        {[1,2,3].map(i => <line key={`h${i}`} x1="0" y1={i*125} x2="800" y2={i*125} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
                        {abmHeatmapAccounts.map((acc) => {
                          const score = criterion.scoreKey === 'icp' ? getWeightedIcp(acc) : getHmScore(acc, criterion.scoreKey);
                          const cx = 28 + (score / 100) * 744;
                          const cy = 470 - (acc.imp / 100) * 440;
                          const desc = criterion.desc(acc);

                          // Cor do número conforme temperatura (posição no gradiente diagonal)
                          const tempValue = (score + acc.imp) / 2;
                          const numColor = tempValue >= 78 ? '#c0392b' : tempValue >= 62 ? '#e67e22' : tempValue >= 46 ? '#b7860b' : '#1a7a3c';

                          // Label: mostra vertical no heatmap "vp", nome da empresa nos demais
                          const labelText = criterion.id === 'vp' ? acc.vertical : acc.name;
                          const shortLabel = labelText.length > 13 ? labelText.slice(0, 13) + '…' : labelText;
                          const labelW = Math.min(shortLabel.length * 5.5 + 12, 90);

                          // Alterna posição do callout (acima/abaixo) para minimizar sobreposição
                          const above = acc.id % 2 === 1;
                          const lineY1 = above ? cy - 12 : cy + 12;
                          const lineY2 = above ? cy - 28 : cy + 28;
                          const labelY = above ? lineY2 - 12 : lineY2 + 1;

                          return (
                            <g
                              key={acc.id}
                              style={{cursor:'pointer'}}
                              onMouseEnter={(e) => {
                                const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                                const svgX = (e.clientX - rect.left) * (800 / rect.width);
                                const svgY = (e.clientY - rect.top) * (500 / rect.height);
                                const displayName = criterion.id === 'vp' ? acc.vertical : acc.name;
                                setHmTooltip({ criterionId: criterion.id, x: svgX, y: svgY, displayName, name: acc.name, vertical: acc.vertical, score, desc });
                              }}
                              onMouseLeave={() => setHmTooltip(null)}
                            >
                              {/* Callout line */}
                              <line x1={cx} y1={lineY1} x2={cx} y2={lineY2} stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeDasharray="2,2" />
                              {/* Label pill */}
                              <rect x={cx - labelW / 2} y={above ? labelY - 10 : labelY} width={labelW} height={12} rx="4" fill="rgba(15,23,42,0.72)" />
                              <text x={cx} y={above ? labelY - 1 : labelY + 9} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="7" fontWeight="700" fontFamily="sans-serif">{shortLabel}</text>
                              {/* Bubble */}
                              <circle cx={cx} cy={cy} r="13" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                              <circle cx={cx} cy={cy} r="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                              <text x={cx} y={cy + 3.5} textAnchor="middle" fill={numColor} fontSize="7.5" fontWeight="900" fontFamily="sans-serif">{score}%</text>
                            </g>
                          );
                        })}
                        {/* Axis labels */}
                        <text x="400" y="490" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">{criterion.xLabel}</text>
                        <text x="14" y="250" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3" transform="rotate(-90,14,250)">{criterion.yLabel}</text>
                        {/* Tooltip — apenas para este heatmap */}
                        {hmTooltip && hmTooltip.criterionId === criterion.id && (() => {
                          const tipTemp = (hmTooltip.score + abmHeatmapAccounts.find(a => a.name === hmTooltip.name)!.imp) / 2;
                          const tipColor = tipTemp >= 78 ? '#e74c3c' : tipTemp >= 62 ? '#f39c12' : tipTemp >= 46 ? '#d4ac0d' : '#27ae60';
                          return (
                            <g transform={`translate(${Math.min(hmTooltip.x + 14, 610)}, ${hmTooltip.y > 380 ? hmTooltip.y - 130 : hmTooltip.y + 14})`}>
                              <rect x="0" y="0" width="190" height="118" rx="10" fill="rgba(15,23,42,0.97)" />
                              <text x="12" y="22" fill="white" fontSize="12" fontWeight="700" fontFamily="sans-serif">{hmTooltip.displayName}</text>
                              <text x="12" y="36" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">{criterion.id === 'vp' ? hmTooltip.name : hmTooltip.vertical}</text>
                              <rect x="12" y="43" width="166" height="1" fill="rgba(255,255,255,0.1)" />
                              <text x="12" y="62" fill={tipColor} fontSize="17" fontWeight="900" fontFamily="sans-serif">{hmTooltip.score}%</text>
                              {hmTooltip.desc.slice(hmTooltip.desc.indexOf('—') + 2).match(/.{1,33}/g)?.slice(0,3).map((line, i) => (
                                <text key={i} x="12" y={78 + i * 13} fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">{line}</text>
                              ))}
                            </g>
                          );
                        })()}
                      </svg>
                    </div>
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
                );
              });
            })()}

           {/* ===== NOVO MÓDULO: ANÁLISE DE CONTATOS E DEPARTAMENTOS ===== */}
           <div className="pt-8 space-y-12">
             <div className="flex flex-col gap-2 mb-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Análise de Contatos e Departamentos</h2>
               <p className="text-sm text-slate-500 font-medium">Cruzamento tático global: Perfil de Contato vs Vertical de Mercado</p>
             </div>

             {(() => {
               const matrixVerticals = ['Varejo', 'Indústria', 'Saúde', 'Telecom', 'Energia', 'Mobilização', 'Finanças', 'Agro', 'Seguros', 'Mineração', 'Automóvel'];
               const defaultYAxis = ['C-Level', 'Diretor', 'Gerente', 'Coord.', 'Espec.', 'Analista'];
               const positioningYAxis = ['Decisor', 'Embaixador', 'Champion', 'Comprador', 'Stakeholder', 'Influenciador', 'Gatekeeper', 'Detrator'];
               
               // Cores: Decisor (0) até Detrator (7)
               const heatmapScale = ['#22c55e', '#4ade80', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#b91c1c'];
               
               // Helpers para o Scatter Plot Orgânico (Jitter)
               const pseudoRandom = (seed: number) => {
                 const x = Math.sin(seed++) * 10000;
                 return x - Math.floor(x);
               };
               const matrixViews = [
                 { id: 'pos', title: 'Gráfico de Dispersão de Posicionamento', desc: 'Mapeamento vetorial de como as personas se posicionam diante da Canopi.', yAxisDef: defaultYAxis, note: 'Cada bolha é um Cargo. O eixo Y sinaliza onde aquele cargo estaciona na jornada de decisão. O tamanho rege o volume de contatos e a cor vai de verde (caminho livre) a vermelho (detrator).' },
                 { id: 'pot', title: 'Potencial de Contato por Vertical vs Cargo', desc: 'Score agregado de propensão a conversão e engajamento da conta alvo.', yAxisDef: defaultYAxis, note: 'Cruze os eixos de Vertical (colunas) e Cargo (linhas) para descobrir em quais cruzamentos o orçamento/potencial é máximo (vermelho).' },
                 { id: 'recept', title: 'Receptividade Média (Rapport)', desc: 'Grau de abertura para criar um relacionamento inicial qualificado.', yAxisDef: defaultYAxis, note: 'Tons mais quentes (laranja/vermelho) identificam hierarquias corporativas super engajadas.' },
                 { id: 'access', title: 'Acessibilidade de Contato', desc: 'Nível de dificuldade política ou logística para alcançar o decisor.', yAxisDef: defaultYAxis, note: 'Mede a ausência de Gatekeepers. Áreas verdes profundas significam alta blindagem de contato.' }
               ];

               const getPositioningCharacteristic = (vId: string, pId: string) => {
                 const seed = (vId.charCodeAt(0) * 3 + pId.charCodeAt(0) * 7) % 100;
                 // Mapeado do melhor pro pior (0 a 7) dependendo do cargo
                 if (pId === 'C-Level') return seed > 70 ? 0 /*Decisor*/ : seed > 40 ? 4 /*Stakeholder*/ : seed > 20 ? 6 /*Gatekeeper*/ : 7 /*Detrator*/;
                 if (pId === 'Diretor') return seed > 60 ? 1 /*Embaixador*/ : seed > 30 ? 3 /*Comprador*/ : 6;
                 if (pId === 'Gerente') return seed > 70 ? 2 /*Champion*/ : seed > 30 ? 3 : 5 /*Influenciador*/;
                 if (pId === 'Coord.' || pId === 'Espec.') return seed > 80 ? 7 : seed > 40 ? 5 : 4;
                 return seed > 50 ? 5 : 4;
               };

               const charColors: Record<string, string> = {
                 'Decisor': '#8b5cf6', 'Comprador': '#3b82f6', 'Influenciador': '#f59e0b',
                 'Embaixador': '#10b981', 'Stakeholder': '#64748b', 'Detrator': '#ef4444'
               };

               const getMatrixScore = (view: string, vId: string, pId: string) => {
                 let base = 0.5;
                 const seed = (vId.charCodeAt(0) + pId.charCodeAt(0) + view.charCodeAt(0)) % 100;
                 base = (seed / 100) * 0.4 + 0.3; // base drift 0.3 to 0.7
                 
                 // Nova lógica ajustada conforme regras de negócio de ABM reais
                 if (view === 'access') {
                   // Acessibilidade é MUITO BAIXA em C-Level/Diretor, ALTA em Espec/Analista
                   if (pId === 'C-Level') base = 0.1 + (seed/100)*0.2; // 10-30%
                   else if (pId === 'Diretor') base = 0.2 + (seed/100)*0.3; // 20-50%
                   else if (pId === 'Analista' || pId === 'Espec.') base = 0.7 + (seed/100)*0.3; // 70-100%
                   else base = 0.5 + (seed/100)*0.3;
                 }
                 else if (view === 'recept') {
                   // Receptividade pode ser moderada/baixa no topo e mais alta no meio-tático
                   if (pId === 'C-Level') base -= 0.2;
                   if (pId === 'Gerente' || pId === 'Coord.') base += 0.25;
                 }
                 else if (view === 'pot') {
                   // Potencial de contato (Sweet spot = Diretor, Gerente, Comprador)
                   if (pId === 'C-Level' || pId === 'Analista') base -= 0.15;
                   if (pId === 'Diretor' || pId === 'Gerente') base += 0.2;
                 }
                 else if (view === 'pos') {
                   // Variable volume depending on the Role and Seed (Vertical)
                   let vol = 0.5;
                   if (pId === 'C-Level') vol = 0.15 + (seed/100)*0.25; // Small bubbles
                   else if (pId === 'Diretor') vol = 0.3 + (seed/100)*0.3; // Medium
                   else if (pId === 'Analista' || pId === 'Espec.') vol = 0.6 + (seed/100)*0.4; // Large
                   else vol = 0.4 + (seed/100)*0.4;
                   base = vol;
                 }

                 return Math.max(0.01, Math.min(0.99, base));
               };

               const matrixCardsMap: Record<string, React.ReactNode[]> = {
                 pot: [
                   <div key="bp0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-emerald-500"/>Top Cruzamentos</p>
                       <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">LIVE</span>
                     </div>
                     <div className="space-y-1.5 flex-1">
                       {[{v:'Varejo',c:'Diretor',s:91},{v:'Saúde',c:'Gerente',s:87},{v:'Indústria',c:'Coord.',s:82}].map((row,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                           <span className="text-[9px] font-bold text-slate-700">{row.v} × {row.c}</span>
                           <div className="flex items-center gap-1.5">
                             <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${row.s}%`}}/></div>
                             <span className="text-[9px] font-black text-emerald-600">{row.s}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Zap className="w-3 h-3"/>Priorizar Ataque</button>
                   </div>,
                   <div key="bp1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-3 h-3 text-violet-500"/>Budget Mapeado</p>
                     <div className="flex-1 flex items-center justify-center">
                       <div className="relative w-24 h-24">
                         <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                           <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                           <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray="68 32" strokeLinecap="round"/>
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-lg font-black text-slate-900">68%</span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase">cobert.</span>
                         </div>
                       </div>
                     </div>
                     <p className="text-[9px] text-center text-slate-500 font-medium">R$326k dos R$480k mapeados com potencial qualificado</p>
                     <button className="w-full text-[9px] h-7 font-bold border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"><BarChart className="w-3 h-3"/>Ver Distribuição</button>
                   </div>,
                   <div key="bp2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500"/>Ativação em Lote</p>
                       <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">23 contas</span>
                     </div>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">Há <strong>23 contas</strong> com potencial acima de 70% sem nenhuma atividade nos últimos 14 dias.</p>
                     <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                       <p className="text-[9px] font-bold text-blue-700">Play: Direct Mail + LinkedIn Ads para Diretores de Varejo em bloco</p>
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-slate-900 text-white hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5"><Rocket className="w-3 h-3"/>Lançar Sequência</button>
                   </div>
                 ],
                 recept: [
                   <div key="r0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3 text-blue-500"/>Gauge de Rapport</p>
                     <div className="flex-1 space-y-2">
                       {[{label:'C-Level',pct:31,color:'bg-red-400'},{label:'Diretor',pct:52,color:'bg-amber-400'},{label:'Gerente',pct:74,color:'bg-emerald-400'},{label:'Analista',pct:86,color:'bg-emerald-500'}].map((r,i)=>(
                         <div key={i} className="space-y-0.5">
                           <div className="flex justify-between"><span className="text-[9px] font-bold text-slate-600">{r.label}</span><span className="text-[9px] font-black text-slate-700">{r.pct}%</span></div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${r.color} rounded-full`} style={{width:`${r.pct}%`}}/></div>
                         </div>
                       ))}
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Mail className="w-3 h-3"/>Criar Email de Rapport</button>
                   </div>,
                   <div key="r1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3 text-indigo-500"/>Evento VIP</p>
                       <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+38% abertura</span>
                     </div>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">C-Levels de Saúde e Indústria responderam <strong>2.8x mais</strong> quando abordados em contexto de roundtable presencial exclusivo.</p>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 bg-indigo-50 rounded-xl text-center"><p className="text-[8px] font-bold text-indigo-400 uppercase">Próximo</p><p className="text-[10px] font-black text-indigo-700">Abr 12</p></div>
                       <div className="p-2 bg-slate-50 rounded-xl text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">Inscritos</p><p className="text-[10px] font-black text-slate-700">7 / 12</p></div>
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"><Sparkles className="w-3 h-3"/>Planejar Evento</button>
                   </div>,
                   <div key="r2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Handshake className="w-3 h-3 text-emerald-500"/>Quebra-Gelo Finance</p>
                     <div className="flex-1 p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                       <p className="text-[8px] font-bold text-amber-700 uppercase">Alerta: Baixa Receptividade</p>
                       <p className="text-[9px] font-medium text-amber-600 leading-relaxed">Setor <strong>Finance + Seguros</strong>: C-Levels com receptividade abaixo de 35%. Exige material consultivo de alto valor antes de qualquer abordagem direta.</p>
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-slate-900 text-white hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5"><BrainCircuit className="w-3 h-3"/>Criar Conteúdo Consultivo</button>
                   </div>
                 ],
                 access: [
                   <div key="a0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500"/>Rotas Livres</p>
                       <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ALTA</span>
                     </div>
                     <div className="flex-1 space-y-1.5">
                       {[{v:'Agro',c:'Analista',pct:92},{v:'Saúde',c:'Espec.',pct:88},{v:'Telecom',c:'Coord.',pct:79}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50">
                           <span className="text-[9px] font-bold text-emerald-800">{r.v} → {r.c}</span>
                           <span className="text-[9px] font-black text-emerald-600">{r.pct}%</span>
                         </div>
                       ))}
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Rocket className="w-3 h-3"/>Ativar Flywheel Inbound</button>
                   </div>,
                   <div key="a1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Network className="w-3 h-3 text-red-500"/>Blindagem C-Level</p>
                     <div className="flex-1 p-3 bg-red-50 border border-red-100 rounded-xl">
                       <p className="text-[9px] font-bold text-red-700 mb-2">Gatekeepers Identificados</p>
                       {[{n:'Varejo',g:'Assist. Exec.',risk:'CRÍTICO'},{n:'Finance',g:'Chefe de Gab.',risk:'ALTO'},{n:'Indústria',g:'Sec. Diretoria',risk:'ALTO'}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between py-1 border-b border-red-100 last:border-none">
                           <span className="text-[8px] font-bold text-red-600">{r.n} — {r.g}</span>
                           <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${r.risk==='CRÍTICO'?'bg-red-600 text-white':'bg-orange-100 text-orange-600'}`}>{r.risk}</span>
                         </div>
                       ))}
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Network className="w-3 h-3"/>Bypassar via Bottom-Up</button>
                   </div>,
                   <div key="a2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3 h-3 text-purple-500"/>Abordagem Mista</p>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">Use Influenciadores com acesso rápido para gerar <strong>buzz interno</strong> e fazer Decisores pedirem eles mesmos por uma apresentação.</p>
                     <div className="flex gap-2 my-1">
                       {['Influencer','→ Buzz','→ Decisor'].map((s,i)=>(
                         <div key={i} className={`flex-1 p-2 rounded-xl text-center text-[8px] font-black ${i===0?'bg-purple-50 text-purple-600':i===1?'bg-slate-100 text-slate-500':'bg-emerald-50 text-emerald-600'}`}>{s}</div>
                       ))}
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <button className="text-[9px] h-7 font-bold bg-slate-900 text-white rounded-xl hover:bg-black flex items-center justify-center gap-1"><Zap className="w-3 h-3"/>Ativar</button>
                       <button className="text-[9px] h-7 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1"><BarChart className="w-3 h-3"/>Relatório</button>
                     </div>
                   </div>
                 ],
                 pos: [
                   <div key="p0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-amber-500"/>Alerta DMU</p>
                       <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">WATCH</span>
                     </div>
                     <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex-1">
                       <p className="text-[9px] font-bold text-amber-700 uppercase mb-1">Gap Crítico: Compradores</p>
                       <p className="text-[9px] font-medium text-amber-600 leading-relaxed">Indústria, Agro e Varejo <strong>não têm Compradores</strong> (Procurement) mapeados. O ciclo de compra trava sem esse elo.</p>
                     </div>
                     <div className="flex gap-2">
                       <button className="flex-1 text-[9px] h-7 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>Mapear Compradores</button>
                       <button className="text-[9px] h-7 px-3 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center"><ExternalLink className="w-3 h-3"/></button>
                     </div>
                   </div>,
                   <div key="p1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-3 h-3 text-orange-500"/>Rede de Embaixadores</p>
                     <div className="flex-1 space-y-2">
                       {[{v:'Tech',n:'4 Embaixadores',hot:true},{v:'Seguros',n:'3 Embaixadores',hot:true},{v:'Saúde',n:'1 Embaixador',hot:false}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded-xl">
                           <span className="text-[9px] font-bold text-orange-800">{r.v}</span>
                           <div className="flex items-center gap-1.5">
                             <span className="text-[9px] font-medium text-orange-600">{r.n}</span>
                             {r.hot && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"/>}
                           </div>
                         </div>
                       ))}
                     </div>
                     <button className="w-full text-[9px] h-7 font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Handshake className="w-3 h-3"/>Ativar Programa</button>
                   </div>,
                   <div key="p2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-blue-500"/>Risco de Detratores</p>
                       <span className="text-[8px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">3 ativos</span>
                     </div>
                     <div className="flex-1 space-y-1.5">
                       {[{n:'TechCorp',r:'Gerente TI',s:'BLOQUEIO'},{n:'IndPrev',r:'Dir. Ops',s:'OBSERVAÇÃO'},{n:'AgroX',r:'Coord. Compras',s:'ALERTA'}].map((d,i)=>(
                         <div key={i} className="flex items-start justify-between p-2 bg-slate-50 rounded-xl gap-2">
                           <div><p className="text-[9px] font-bold text-slate-800">{d.n}</p><p className="text-[8px] text-slate-400">{d.r}</p></div>
                           <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shrink-0 ${i===0?'bg-red-600 text-white':i===1?'bg-amber-400 text-white':'bg-slate-200 text-slate-600'}`}>{d.s}</span>
                         </div>
                       ))}
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <button className="text-[9px] h-7 font-bold bg-slate-900 text-white rounded-xl hover:bg-black flex items-center justify-center gap-1"><Flag className="w-3 h-3"/>Neutralizar</button>
                       <button className="text-[9px] h-7 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>Riscos</button>
                     </div>
                   </div>
                 ]
               };

               return matrixViews.map((view, vIdx) => {
                 const currentYAxis = view.yAxisDef;
                 return (
                 <div key={view.id}>
                 <div className={view.id === 'pos' ? "flex flex-col gap-6 pb-6" : "grid grid-cols-1 xl:grid-cols-[58.5%_41.5%] gap-5 items-stretch pb-10"}>
                   
                   {/* MATRIX HEATMAP CARD */}
                   <div className="bg-white p-6 rounded-[24px] lg:rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-full space-y-5">
                      <div className="flex justify-between items-center">
                         <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                              <Layout className="w-5 h-5 text-blue-600"/>
                              {vIdx + 1}. {view.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">{view.desc}</p>
                         </div>
                      </div>
                      
                      {/* TIGHT MATRIX GRID OR SCATTER PLOT */}
                      <div className="flex-1 flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner overflow-x-auto overflow-y-hidden">
                         
                         {view.id === 'pos' ? (
                            <div className="w-full h-full flex flex-col justify-center min-w-[600px] relative px-4 bg-white rounded-2xl border border-slate-200">
                               {/* SCATTER PLOT ORGÂNICO (PREMIUM PRO COM TRENDLINE) */}
                               <div className="flex-1 relative overflow-hidden bg-white ml-24 mt-8 mb-8 border-b-2 border-slate-100">
                                 <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="none" style={{display:'block', cursor:'crosshair', minHeight: '380px'}} onMouseLeave={() => setHmTooltip(null)}>
                                     {/* Horizontal Premium Grid Lines Only */}
                                     {positioningYAxis.map((_, i) => <line key={`h${i}`} x1="0" y1={(i+0.5)*(500/8)} x2="1200" y2={(i+0.5)*(500/8)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />)}

                                     {/* Trendline Cinza Claro Linear e Pontilhada (Fina) */}
                                     <line x1="40" y1="460" x2="1160" y2="40" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,6" />

                                     {/* Colored Deterministic Bubbles with Jitter */}
                                     {matrixVerticals.map((v, vIdx) => {
                                        return defaultYAxis.map((p, pIdx) => {
                                           const charIndex = getPositioningCharacteristic(v, p);
                                           const charName = positioningYAxis[charIndex];
                                           
                                           // Bubble size dynamics based on volume
                                           const volScore = getMatrixScore(view.id, v, p);
                                           const r = 12 + (volScore * 24); // From 12px to 36px (larger to fit text)
                                           const percent = Math.round(volScore * 100);

                                           // Deterministic Offset by Cargo Index
                                           const offsetX = (pIdx - 2.5) * 16;  // More space since we have 1200px width
                                           
                                           // Vertical organic Jitter so they don't lock exactly on the line
                                           const hash2 = pseudoRandom(pIdx * 19 + vIdx * 11);
                                           const jitterY = (hash2 - 0.5) * (500/8 * 0.75); // +/- jitter based on lane height
                                           
                                           const baseCX = (vIdx + 0.5) * (1200 / 11);
                                           const baseCY = (charIndex + 0.5) * (500 / 8);
                                           
                                           const cx = Math.max(30, Math.min(1170, baseCX + offsetX));
                                           const cy = Math.max(30, Math.min(470, baseCY + jitterY));
                                           
                                           const bubbleColor = heatmapScale[charIndex];
                                           
                                           return (
                                              <g key={`${v}-${p}`} style={{cursor:'pointer'}}
                                                 onMouseEnter={(e) => {
                                                    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                                                    const svgX = (e.clientX - rect.left) * (1200 / rect.width);
                                                    const svgY = (e.clientY - rect.top) * (500 / rect.height);
                                                    setHmTooltip({ id: 'pos', x: svgX, y: svgY, v, p, charName, color: bubbleColor, size: percent });
                                                 }}>
                                                 <title>{p} em {v}: {percent}% volume. Posicionamento: {charName}</title>
                                                 {/* Solid bubble */}
                                                 <circle cx={cx} cy={cy} r={r} fill={bubbleColor} opacity="0.85" stroke="#fff" strokeWidth="1.5" />
                                                 {/* Text inside the bubble */}
                                                 <text x={cx} y={cy + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">{percent}%</text>
                                              </g>
                                           )
                                        })
                                     })}

                                     {/* Custom Tooltip render (overlaying the graph) */}
                                     {hmTooltip && hmTooltip.id === 'pos' && (
                                        <g transform={`translate(${Math.min(hmTooltip.x + 15, 1000)}, ${hmTooltip.y > 380 ? hmTooltip.y - 120 : hmTooltip.y + 15})`} style={{pointerEvents:'none'}}>
                                           <rect x="0" y="0" width="180" height="96" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0px 10px 15px rgba(0,0,0,0.1))"/>
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
                               
                               {/* Y-Axis floating labels left - OUTSIDE OF OVERFLOW HIDDEN */}
                               <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-around text-[9px] font-bold text-slate-500 tracking-tighter w-[80px]">
                                  {positioningYAxis.map(y => <div key={y} className="flex-1 flex items-center justify-end pr-2 border-r-2 border-slate-100"><span className="text-right leading-none max-w-[70px] break-words uppercase">{y}</span></div>)}
                               </div>

                               {/* X-Axis floating labels bottom */}
                               <div className="flex justify-around items-center pt-2 pb-4 ml-24 mr-2">
                                  {matrixVerticals.map(v => <span key={v} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-[60px] text-center truncate mt-2">{v}</span>)}
                               </div>
                            </div>


                         ) : (

                         <div className="w-full h-full flex flex-col justify-center min-w-[500px]">
                            {/* Column Headers (Verticals) */}
                            <div className="flex shrink-0 h-10 mb-2">
                               <div className="w-[90px] shrink-0" />
                               <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` }}>
                                  {matrixVerticals.map(vertical => (
                                     <div key={vertical} className="flex items-end justify-center pb-1">
                                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter truncate text-center max-w-[60px]">
                                          {vertical}
                                       </span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                            
                            {/* Rows (Personas) */}
                            <div className="flex-1 flex flex-col gap-[2px] mt-2">
                               {currentYAxis.map(yLabel => (
                                  <div key={yLabel} className="flex-1 flex min-h-[32px]">
                                     {/* Y axis label */}
                                     <div className="w-[90px] shrink-0 flex items-center justify-end pr-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">
                                        {yLabel}
                                     </div>
                                     {/* Data Cells (Now smaller, tight, with numbers inside) */}
                                     <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` }}>
                                        {matrixVerticals.map(vertical => {
                                           const score = getMatrixScore(view.id, vertical, yLabel);
                                           // Same heat scale
                                           const color = score >= 0.85 ? '#c0392b' : score >= 0.7 ? '#e67e22' : score >= 0.55 ? '#f9ca24' : score >= 0.4 ? '#a8e6cf' : '#27ae60';
                                           const textColor = score >= 0.7 || score <= 0.4 ? 'text-white' : 'text-slate-900';
                                           const scoreVal = Math.round(score * 100);
                                           
                                           return (
                                              <div key={vertical} 
                                                   className="relative group transition-all rounded-[6px] cursor-pointer hover:border-slate-800 border-2 border-transparent hover:z-30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center isolate"
                                                   style={{ backgroundColor: color }}>
                                                 
                                                 {/* Number inside the cell */}
                                                 <span className={`text-[10px] font-black ${textColor} opacity-90`}>{scoreVal}</span>

                                                 {/* Rich Tooltip on hover */}
                                                 <div className="absolute opacity-0 group-hover:opacity-100 z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 border border-slate-700 w-52 rounded-xl shadow-2xl p-3 pointer-events-none transition-opacity">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                       <span className="text-[11px] font-black text-white uppercase tracking-wider">{vertical}</span>
                                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scoreVal>=70?'bg-red-500/20 text-red-400':scoreVal<=40?'bg-green-500/20 text-green-400':'bg-amber-500/20 text-amber-400'}`}>{scoreVal}%</span>
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
                                                    {/* Triangle pointer */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900"></div>
                                                 </div>
                                              </div>
                                           )
                                        })}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                         
                         )}

                      </div>
                      
                      {/* Disclaimer explicativo para o usuário ler graficamente */}
                      <div className="mt-4 pt-4 px-2 border-t border-slate-100">
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            <span className="font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md mr-2">Como Ler</span>
                            {view.note}
                         </p>
                      </div>
                   </div>

                   {/* ACTION CARDS */}
                   <div className={view.id === 'pos' ? "grid grid-cols-1 md:grid-cols-3 gap-5" : "grid grid-cols-2 grid-rows-[1fr_1fr] gap-4 h-full"}>
                     {(matrixCardsMap[view.id] || matrixCardsMap.pot).map((card, i) => (
                       <div key={i} className={view.id === 'pos' ? "h-full" : (i === 2 ? "col-span-2 h-full" : "col-span-1 h-full")}>
                         {card}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* DIVISÃO ENTRE SESSÕES */}
                 {view.id === 'pos' && (
                   <div className="w-full flex items-center gap-4 pt-4 pb-12 opacity-80">
                     <div className="h-px bg-slate-300 flex-1"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border border-slate-200 rounded-full py-1">Heatmaps Táticos Verticais</span>
                     <div className="h-px bg-slate-300 flex-1"></div>
                   </div>
                 )}
                 </div>
                 );
               });
             })()}
           </div>

      {/* ===== FIT FIRMOGRÁFICO + TECNOGRÁFICO (abaixo dos heatmaps) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FIT FIRMOGRÁFICO */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3"/> Fit Firmográfico ABM</h4>
          <div className="space-y-5">
            {[
              { label: 'Receita Anual (> R$ 500M)', val: 78 },
              { label: 'Sede (SP / Remoto)', val: 92 },
              { label: 'Tamanho Time Tech (> 50)', val: 45 }
            ].map((idx, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase"><span>{idx.label}</span><span>{idx.val}%</span></div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-blue-600" style={{ width: `${idx.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* FIT TECNOGRÁFICO */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3"/> Fit Tecnográfico ABM</h4>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group hover:border-blue-300 transition-all">
              <Cloud className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">Stack Cloud</p><p className="text-[9px] font-bold text-slate-400 uppercase">AWS / Azure Dominante</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group hover:border-blue-300 transition-all">
              <Database className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">CRM Utilizado</p><p className="text-[9px] font-bold text-slate-400 uppercase">Salesforce (85%)</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group hover:border-blue-300 transition-all">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">AI Readiness</p><p className="text-[9px] font-bold text-slate-400 uppercase">Alta Maturidade</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

// --- HELPER COMPONENTS ---

const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
);


export default ABMStrategy;
