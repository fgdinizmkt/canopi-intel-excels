"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus,
  TrendingUp,
  Target,
  Filter,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  PieChart,
  ArrowRight,
  Sparkles,
  Bot,
  AlertCircle,
  Activity,
  ShieldCheck,
  Globe,
  Settings,
  Layers,
  MousePointer2,
  Youtube,
  Linkedin,
  Monitor,
  Layout,
  ExternalLink,
  DollarSign,
  BadgeCheck,
  Megaphone,
  Users,
  Eye,
  Video,
  ThumbsDown,
  ThumbsUp,
  Network,
  Link2,
  RefreshCw,
  Facebook
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Modal } from '../components/ui';
import { ClientOnly } from '../components/ui/ClientOnly';
import { motion, AnimatePresence } from 'motion/react';

// --- MOCK DATA ---

const performanceBySegmentData = [
  { name: 'Financeiro', val: 85, color: '#2563eb', mqls: 142 },
  { name: 'Tecnologia', val: 72, color: '#3b82f6', mqls: 84 },
  { name: 'Varejo', val: 45, color: '#93c5fd', mqls: 32 },
  { name: 'Saúde', val: 58, color: '#60a5fa', mqls: 19 },
];

const campaignsData = [
  { id: 'cmp-99281', name: 'ABM: Retenção Tier 1 - Q3', channel: 'LINKEDIN', type: 'Sponsored Content', investment: 18240, conv: 42, cpl: 434, impact: ['IBM', 'SAP', 'ORA'], status: 'ACTIVE' },
  { id: 'cmp-99282', name: 'Search: CRM Pro - Enterprise', channel: 'GOOGLE', type: 'PMAX / Search', investment: 12500, conv: 86, cpl: 145, impact: ['ITA', 'SAN', 'AMB'], status: 'ACTIVE' },
  { id: 'cmp-99283', name: 'Remarketing: Casos de Sucesso', channel: 'META', type: 'Display / Video', investment: 5900, conv: 312, cpl: 19, impact: '142 Contas', status: 'OPTIMIZING' },
  { id: 'cmp-99284', name: 'Bing: Intent Search B2B', channel: 'BING', type: 'Search', investment: 3100, conv: 18, cpl: 172, impact: ['GOL', 'AZU'], status: 'ACTIVE' },
  { id: 'cmp-99285', name: 'YouTube: Brand Awareness Tech', channel: 'YOUTUBE', type: 'TrueView / Discovery', investment: 4200, conv: 12, cpl: 350, impact: 'Brand Lift +12%', status: 'ACTIVE' }
];

const channelBenchmarks = [
  {
    channel: 'GAds / Bing',
    best: { name: 'Search: Enterprise Cloud', rate: '22.4%', signal: 'High Intent' },
    worst: { name: 'Display: Generic SMB', rate: '0.4%', signal: 'Low Match' }
  },
  {
    channel: 'Social (LI/Meta)',
    best: { name: 'Video: Case Estudo Logística', rate: '14.8%', signal: 'Social Proof' },
    worst: { name: 'Static: Banner Institucional', rate: '1.2%', signal: 'Banner Blindness' }
  }
];

const connectedSources = [
  { name: 'Google Ads', status: 'Active', lastSync: '2m ago', icon: Search, color: 'text-rose-500' },
  { name: 'Facebook Ads', status: 'Active', lastSync: '5m ago', icon: Facebook, color: 'text-blue-600' },
  { name: 'LinkedIn Ads', status: 'Active', lastSync: '12m ago', icon: Linkedin, color: 'text-blue-700' },
  { name: 'Microsoft Ads', status: 'Active', lastSync: '1h ago', icon: Layout, color: 'text-emerald-500' },
  { name: 'HubSpot', status: 'Active', lastSync: '1m ago', icon: Link2, color: 'text-orange-500' },
  { name: 'Salesforce', status: 'Active', lastSync: '10m ago', icon: ShieldCheck, color: 'text-blue-400' },
  { name: 'YouTube API', status: 'Active', lastSync: '15m ago', icon: Youtube, color: 'text-rose-600' }
];

type TimeFilter = '7d' | '30d' | '90d';

export const PaidMedia: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const filters = {
    '7d': { pVol: 0.35, label: 'Últimos 7 dias', trend: -2.1 },
    '30d': { pVol: 1.0, label: 'Últimos 30 dias', trend: 12.5 },
    '90d': { pVol: 3.2, label: 'Trimestre Atual', trend: +18.4 },
  };
  const currFilter = filters[timeFilter];

  const cycleTimeFilter = () => {
    if (timeFilter === '30d') setTimeFilter('90d');
    else if (timeFilter === '90d') setTimeFilter('7d');
    else setTimeFilter('30d');
  };

  const openSimModal = (title: string, componentKey: string, size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    let contentNode;
    switch(componentKey) {
      case 'GOOGLE_PMAX':
        contentNode = (
           <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> PMax Intelligence Overview
                 </h4>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Search Share</p>
                       <p className="text-lg font-black text-white">42%</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Video Share</p>
                       <p className="text-lg font-black text-white">28%</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Display Share</p>
                       <p className="text-lg font-black text-white">30%</p>
                    </div>
                 </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-3xl">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Performance de Assets</p>
                 <div className="space-y-3">
                    {[
                       { type: 'Headline 1', val: 'A Melhor Solução ABM', status: 'EXCELLENT' },
                       { type: 'Image Asset', val: 'Dashboard Preview v2', status: 'GOOD' },
                       { type: 'Video Asset', val: 'Explainer 30s', status: 'LOW' }
                    ].map((asset, i) => (
                       <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">{asset.type}</p>
                             <p className="text-xs font-bold text-slate-800">{asset.val}</p>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-1 rounded ${asset.status === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-600' : asset.status === 'GOOD' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                             {asset.status}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all" onClick={() => setModalOpen(false)}>Otimizar Assets PMax</button>
           </div>
        );
        break;

      case 'YOUTUBE_METRICS':
        contentNode = (
           <div className="space-y-6">
              <div className="flex items-center gap-4 bg-rose-50 p-6 rounded-3xl border border-rose-100">
                 <Youtube className="w-8 h-8 text-rose-600" />
                 <div>
                    <h5 className="text-sm font-bold text-rose-900 uppercase">YouTube Direct Inbound</h5>
                    <p className="text-[10px] text-rose-700 font-medium">Campanha: Awareness Tech v1</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">VTR (View Through Rate)</p>
                    <p className="text-2xl font-black text-slate-900">38.4%</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                       <div className="bg-rose-500 h-full rounded-full w-[38.4%]"></div>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Retention @ 30s</p>
                    <p className="text-2xl font-black text-slate-900">52.1%</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                       <div className="bg-blue-500 h-full rounded-full w-[52.1%]"></div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Audiência Principal Engajada</p>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">CTOs Enterprise</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm">SaaS Founders</span>
                 </div>
              </div>

              <button className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors" onClick={() => setModalOpen(false)}>Editar Campanha no YT Studio</button>
           </div>
        );
        break;

      case 'BING_INTENT':
        contentNode = (
           <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-emerald-600" />
                 </div>
                 <div>
                    <h5 className="text-sm font-extrabold text-slate-800 uppercase">Bing / Microsoft Ads B2B</h5>
                    <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5 tracking-tighter">EXCLUVISO: LinkedIn Profile Targeting Enabled</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Filtros de Perfil Profissional (Microsoft Graph)</p>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                       { label: 'Job Title', val: 'Sales Manager' },
                       { label: 'Company Type', val: 'Enterprise' },
                       { label: 'Degree', val: 'MBA/Post-Grad' },
                       { label: 'Skills', val: 'Account Based Marketing' }
                    ].map((f, i) => (
                       <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{f.label}</p>
                          <p className="text-xs font-bold text-slate-800">{f.val}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20" onClick={() => setModalOpen(false)}>Atualizar Segmentação B2B</button>
           </div>
        );
        break;

      case 'NOVA_CAMPANHA':
        contentNode = (
           <div className="space-y-6">
              <div className="flex gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-sm uppercase tracking-tight">Campaign Strategy Builder</h4>
                    <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Canopi Intelligence Integration</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Canal de Origem</label>
                    <select 
                       aria-label="Canal de Origem"
                       className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                       <option>Google Ads (Search + PMax)</option>
                       <option>LinkedIn Ads (Matched Audience)</option>
                       <option>Meta Ads (Direct Response)</option>
                       <option>Bing / Microsoft Ads</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Objetivo Agêntico</label>
                    <select 
                       aria-label="Objetivo Agêntico"
                       className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                       <option>Maximização de Pipeline</option>
                       <option>Atração de Contas Tier 1</option>
                       <option>Retenção de Base (Churn Prev)</option>
                    </select>
                 </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[11px] font-bold text-blue-900 uppercase">Sincronização de Públicos</p>
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                 </div>
                 <p className="text-[10px] text-blue-700 font-medium">Extraindo <span className="font-bold">842 Contas Impactadas</span> do seu CRM para Matched Audience automático.</p>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black shadow-lg shadow-blue-500/10 transition-all" onClick={() => setModalOpen(false)}>Publicar Campanha Estratégica</button>
           </div>
        );
        break;

      case 'BID_CONTROL':
         contentNode = (
           <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                 <div className="w-12 h-12 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                 </div>
                 <div>
                    <h5 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">AI Bid Management</h5>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 tracking-wide">Status: <span className="text-emerald-600 font-bold uppercase">Optimized</span></p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">CPA Atual (MQL)</p>
                       <p className="text-lg font-black text-slate-900">R$ 84,20</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">CPA Sugerido</p>
                       <p className="text-lg font-black text-blue-600">R$ 72,00</p>
                    </div>
                 </div>

                 <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                       <span>Agressividade do Agente</span>
                       <span>75%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full">
                       <div className="h-full bg-blue-600 rounded-full transition-all w-[75%]"></div>
                    </div>
                 </div>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20" onClick={() => setModalOpen(false)}>Salvar Novos Lances (Bids)</button>
           </div>
         );
         break;

      case 'AUDIT_AI':
         contentNode = (
           <div className="space-y-6">
              <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="relative z-10 font-mono text-[10px] text-emerald-400 space-y-2">
                    <p className="opacity-50">&gt; running canopi-paid-intelligence --audit all</p>
                    <p className="text-white font-bold">[!] DETECTADO: 14% de &quot;Wasteful Spend&quot; no Google Ads (Display Network)</p>
                    <p className="text-slate-400">&gt; Recomendação: Negativar canais de apps infantis e focar em clusters ABM.</p>
                    <p className="bg-blue-900/40 p-2 rounded border border-blue-500/30 text-blue-300 mt-2">ECONOMIA ESTIMADA: R$ 4.250 / mês</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Saúde do Pixel</p>
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                       <span className="text-xs font-bold text-slate-800">100% Sincronizado</span>
                    </div>
                 </div>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Qualidade de Origem</p>
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-blue-500" />
                       <span className="text-xs font-bold text-slate-800">8.4/10 Score</span>
                    </div>
                 </div>
              </div>

              <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all" onClick={() => setModalOpen(false)}>Aplicar Otimizações em Lote</button>
           </div>
         );
         break;

      case 'LP_AUDIT':
         contentNode = (
           <div className="space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                       <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                       <h5 className="text-sm font-bold text-slate-800">SDR: Demonstração Inteligente</h5>
                       <p className="text-[10px] text-slate-400 font-medium truncate">/lp/demo-enterprise-v2</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Bounce Rate</p>
                       <p className="text-lg font-black text-slate-900">32%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Conv. Rate</p>
                       <p className="text-lg font-black text-emerald-600">14.5%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Avg. Load</p>
                       <p className="text-lg font-black text-blue-600">1.2s</p>
                    </div>
                 </div>

                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Sparkles className="w-3 h-3 text-emerald-600" />
                       <span className="text-[10px] font-bold text-emerald-800 tracking-tight uppercase">Performance Excelente</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-emerald-400 cursor-pointer" />
                 </div>
              </div>
              <button className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-xs hover:bg-black transition-all" onClick={() => setModalOpen(false)}>Editar Asset no Unbounce / Webflow</button>
           </div>
         );
         break;

      case 'DRILLDOWN_CAMPAIGN':
         contentNode = (
           <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                       <h5 className="text-[10px] font-extrabold text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                          <Layers className="w-3 h-3 text-blue-600" /> Grupos de Anúncios (Ad Groups)
                       </h5>
                       <div className="space-y-4 font-bold text-slate-800">
                          {[
                             { name: 'Competidor X Filter', invest: 'R$ 4.2k', cpl: 'R$ 82', conv: 12 },
                             { name: 'Intent Search: "Plataforma ABM"', invest: 'R$ 8.1k', cpl: 'R$ 114', conv: 45 },
                             { name: 'Display Remarketing', invest: 'R$ 1.9k', cpl: 'R$ 12', conv: 112 },
                          ].map((g, idx) => (
                             <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:border-blue-300 group transition-all">
                                <div>
                                   <p className="text-xs group-hover:text-blue-700">{g.name}</p>
                                   <p className="text-[9px] text-slate-400 font-medium mt-0.5">{g.invest} investidos</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs text-emerald-600 font-black">{g.conv} Conv.</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">{g.cpl}/MQL</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="w-full md:w-80 space-y-6">
                    <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl relative overflow-hidden">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Atribuição por Canal</p>
                       <div className="h-40 min-h-[160px]">
                          <ClientOnly fallback={<div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />}>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{name: 'G', val: 40}, {name: 'L', val: 78}, {name: 'M', val: 12}, {name: 'B', val: 24}]}>
                                   <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                      <Cell fill="#3b82f6" />
                                      <Cell fill="#2563eb" />
                                      <Cell fill="#8b5cf6" />
                                      <Cell fill="#10b981" />
                                   </Bar>
                                </BarChart>
                             </ResponsiveContainer>
                          </ClientOnly>
                       </div>
                    </div>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all" onClick={() => setModalOpen(false)}>Visualizar Analytics Completo</button>
                 </div>
              </div>
           </div>
         );
         break;

      default:
        contentNode = <div className="p-8 text-center text-slate-400">Funcionalidade em desenvolvimento...</div>;
    }

    setModalData({ title, content: contentNode, size });
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mídia Paga</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 max-w-2xl leading-relaxed">
            Monitoramento tático de investimento e eficiência ABM. Otimize seus lances e criativos em canais de busca, display e redes sociais com dados de intenção em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={cycleTimeFilter}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-slate-50 transition-colors shadow-sm group"
          >
            <Calendar className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="w-32 text-center">{currFilter.label}</span>
          </button>
          <button 
            onClick={() => openSimModal('Configurador de Campanha Estratégica', 'NOVA_CAMPANHA', 'lg')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 rounded-lg text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20 group border border-blue-600"
          >
            <Plus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nova Campanha Paga
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: 'Investimento Total', val: `R$ ${Math.round(142500 * currFilter.pVol).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: `+12.5%`, key: 'AUDIT_AI', sub: 'Investido em Canais' },
          { label: 'CPL Médio (MQL)', val: 'R$ 84,20', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '4.2% ALERTA', key: 'BID_CONTROL', sub: 'Custo por Lead Ativo' },
          { label: 'Custo / Oportunidade', val: 'R$ 1.120', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Estável', key: 'LP_AUDIT', sub: 'Eficiência de Funil' },
          { label: 'Pipeline Influenciado', val: `R$ ${(4.2 * currFilter.pVol).toFixed(1)}M`, icon: ShieldCheck, color: 'text-white', bg: 'bg-slate-900', trend: '+18% ROAS', key: 'DRILLDOWN_CAMPAIGN', sub: 'Atribuição Direta', isDark: true },
          { label: 'Contas Impactadas', val: `${Math.round(842 * currFilter.pVol)}`, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '156 Tier 1', key: 'DRILLDOWN_CAMPAIGN', sub: 'Match de Audiência' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.isDark ? 'bg-slate-900' : 'bg-white'} p-5 rounded-2xl border ${kpi.isDark ? 'border-slate-800' : 'border-slate-100'} shadow-sm transition-all cursor-pointer hover:border-blue-400 group relative overflow-hidden`} onClick={() => openSimModal(kpi.label, kpi.key, 'lg')}>
             {kpi.isDark && <div className="absolute top-0 right-0 opacity-5 -mr-4 -mt-4"><PieChart className="w-20 h-20 text-white" /></div>}
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-8 h-8 rounded-lg ${kpi.isDark ? 'bg-blue-600' : kpi.bg} ${kpi.isDark ? 'text-white' : kpi.color} flex items-center justify-center shadow-inner`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${kpi.isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600'}`}>
                  {kpi.trend}
                </span>
             </div>
             <p className={`text-[10px] font-extrabold ${kpi.isDark ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-widest mb-1 relative z-10`}>{kpi.label}</p>
             <h3 className={`text-2xl font-bold ${kpi.isDark ? 'text-white' : 'text-slate-900'} relative z-10`}>{kpi.val}</h3>
             <p className={`text-[10px] ${kpi.isDark ? 'text-slate-500' : 'text-slate-400'} mt-1 font-medium relative z-10`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Performance Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-[2] bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
             <div>
               <h2 className="text-lg font-bold text-slate-900 tracking-tight">Performance Estratégica por Canal</h2>
               <p className="text-xs text-slate-500 font-medium mt-1">Comparativo direto de ROAS e Match de Intenção por plataforma.</p>
             </div>
             <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200" onClick={() => openSimModal('Auditoria Global de Bids', 'BID_CONTROL', 'md')}>Bids</button>
                <button className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg" onClick={() => openSimModal('Terminal de Auditoria AI', 'AUDIT_AI', 'lg')}>Audit AI</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            {[
               { name: 'GAds Search', val: 45.5, infl: 32, icon: Search, color: 'rose', badge: 'SEARCH / CORE', key: 'DRILLDOWN_CAMPAIGN' },
               { name: 'GAds PMax', val: 12.4, infl: 14, icon: Zap, color: 'blue', badge: 'AI-DRIVEN', key: 'GOOGLE_PMAX' },
               { name: 'LinkedIn Ads', val: 68.0, infl: 62, icon: Linkedin, color: 'blue', badge: 'ALTA INTEL', key: 'DRILLDOWN_CAMPAIGN' },
               { name: 'Meta Ads', val: 29.0, infl: 18, icon: Facebook, color: 'indigo', badge: 'REMARKETING', key: 'LP_AUDIT' },
               { name: 'YouTube API', val: 4.2, infl: 5, icon: Youtube, color: 'rose', badge: 'VIDEO / AW', key: 'YOUTUBE_METRICS' },
            ].map((c, i) => (
               <div key={i} className="p-4 rounded-2xl border border-slate-50 hover:border-blue-200 transition-all cursor-pointer group flex flex-col" onClick={() => openSimModal(c.name, c.key, 'lg')}>
                  <div className={`w-8 h-8 bg-${c.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                     <c.icon className={`w-4 h-4 text-${c.color}-600`} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{c.name}</p>
                  <p className="text-lg font-black text-slate-900">R$ {Math.round(c.val * currFilter.pVol)}k</p>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between">
                     <span className="text-[9px] font-bold text-slate-400">Match</span>
                     <span className="text-[10px] font-black text-blue-600">{c.infl}%</span>
                  </div>
               </div>
            ))}
          </div>

          {/* Efficiency by Segment */}
          <div className="border-t border-slate-100 pt-8">
             <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Activity className="w-3 h-3 text-blue-500" /> Eficiência de Segmento (Match)
                </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {performanceBySegmentData.map((seg, i) => (
                   <div key={i} className="space-y-1 group cursor-pointer" onClick={() => openSimModal(`Detalhamento: ${seg.name}`, 'DRILLDOWN_CAMPAIGN', 'lg')}>
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-slate-600">{seg.name}</span>
                         <span className="text-blue-600">{seg.val}% • {seg.mqls} MQLs</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full rounded-full transition-all duration-1000" style={{width: `${seg.val}%`, backgroundColor: seg.color}}></div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="flex-1 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-7 relative overflow-hidden border border-slate-800 shadow-xl">
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
             <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2 bg-blue-500/10 p-2 pr-4 rounded-full border border-blue-500/20 w-fit">
                   <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                   <span className="text-white text-[10px] font-bold tracking-widest uppercase">Canopi Intelligence</span>
                </div>
                
                {[
                   { title: 'CPL ANÔMALO', text: 'LinkedIn Ads escalou 24% em CPAs Enterprise. Recomendamos revisar criativos v4.', color: 'rose', key: 'BID_CONTROL' },
                   { title: 'OPORTUNIDADE ABM', text: 'Cluster Logística aquecido. Transicione campanhas de Search para Direct Demo.', color: 'blue', key: 'NOVA_CAMPANHA' },
                   { title: 'WASTE DETECTADO', text: 'Bing Ads exibindo para termos residenciais. Negativar keywords imprecisas.', color: 'amber', key: 'AUDIT_AI' },
                ].map((ins, i) => (
                   <div key={i} className={`bg-slate-800/50 border border-${ins.color}-500/20 p-4 rounded-2xl hover:border-${ins.color}-500/40 transition-all cursor-pointer shadow-sm`} onClick={() => openSimModal(ins.title, ins.key, 'md')}>
                      <span className={`text-[9px] font-bold text-${ins.color}-400 uppercase`}>{ins.title}</span>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ins.text}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Benchmark de Campanhas (Success x Failure per Channel) */}
      <div className="space-y-6 pt-10 border-t border-slate-100">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
               <TrendingUp className="w-6 h-6 text-blue-600" /> Destaques por Canal (Success vs Bottom)
            </h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Comparativo Multi-toque</div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {channelBenchmarks.map((bench, i) => (
               <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{bench.channel}</span>
                     <BadgeCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {/* Success Card */}
                     <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3 hover:bg-emerald-50 transition-colors cursor-pointer" onClick={() => openSimModal(`Sucesso: ${bench.best.name}`, 'DRILLDOWN_CAMPAIGN', 'lg')}>
                        <div className="flex items-center gap-2">
                           <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                           <span className="text-[10px] font-black text-emerald-700 uppercase">Top Performer</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 leading-tight">{bench.best.name}</h5>
                        <div className="flex justify-between items-end">
                           <span className="text-2xl font-black text-emerald-600">{bench.best.rate}</span>
                           <span className="text-[8px] font-bold text-emerald-500 mb-1">{bench.best.signal}</span>
                        </div>
                     </div>
                     
                     {/* Failure Card */}
                     <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-3 hover:bg-rose-50 transition-colors cursor-pointer" onClick={() => openSimModal(`Correção: ${bench.worst.name}`, 'AUDIT_AI', 'lg')}>
                        <div className="flex items-center gap-2">
                           <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                           <span className="text-[10px] font-black text-rose-700 uppercase">Bottom Line</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 leading-tight">{bench.worst.name}</h5>
                        <div className="flex justify-between items-end">
                           <span className="text-2xl font-black text-rose-600">{bench.worst.rate}</span>
                           <span className="text-[8px] font-bold text-rose-500 mb-1">{bench.worst.signal}</span>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Campaign Detail Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-10">
         <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/20">
            <div>
               <h3 className="text-lg font-bold text-slate-900">Detalhamento de Campanhas em Operação</h3>
               <p className="text-xs text-slate-400 mt-1">Visão granular por ID, Canal e Atribuição de Impacto.</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Search className="w-4 h-4 text-slate-400" /></button>
               <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Exportar CSV</button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50">
                     <th className="pl-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Campanha</th>
                     <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Canal</th>
                     <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Investimento</th>
                     <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Conv/MQL</th>
                     <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Impacto Conta</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {campaignsData.map((cmp, i) => (
                     <tr key={cmp.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openSimModal(`Campanha: ${cmp.name}`, 'DRILLDOWN_CAMPAIGN', 'xl')}>
                        <td className="pl-8 py-5">
                           <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{cmp.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{cmp.type} • ID: {cmp.id}</p>
                        </td>
                        <td className="px-4 py-5">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border ${
                              cmp.channel === 'LINKEDIN' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              cmp.channel === 'GOOGLE' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              cmp.channel === 'META' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                              cmp.channel === 'YOUTUBE' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-emerald-50 text-emerald-700 border-emerald-100'
                           }`}>
                              {cmp.channel}
                           </span>
                        </td>
                        <td className="px-4 py-5">
                           <p className="text-[11px] font-bold text-slate-700">R$ {cmp.investment.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-5">
                           <p className="text-[11px] font-bold text-slate-900">{cmp.conv}</p>
                           <p className="text-[9px] text-slate-400 font-bold">R$ {cmp.cpl}/MQL</p>
                        </td>
                        <td className="px-4 py-5">
                           <div className="flex -space-x-2 items-center justify-center">
                              {Array.isArray(cmp.impact) ? cmp.impact.map((acc, idx) => (
                                 <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">{acc}</div>
                              )) : (
                                 <span className="text-[10px] font-bold text-slate-500 italic bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">{cmp.impact}</span>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* NEW SECTION: Connected Sources Registry (Footer) */}
      <div className="bg-slate-50 rounded-3xl p-8 mt-12 border border-slate-200">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" /> Fontes de Dados Conectadas
               </h3>
               <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tight">Status de sincronização global Canopi Intel</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
               <RefreshCw className="w-3 h-3 text-blue-500" /> Sincronizar Tudo
            </button>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {connectedSources.map((source, i) => (
               <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-all cursor-pointer">
                  <div className={`w-10 h-10 ${source.color} bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                     <source.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-800 mb-1">{source.name}</p>
                  <div className="flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                     <span className="text-[9px] font-bold text-emerald-600 uppercase">ONLINE</span>
                  </div>
                  <span className="mt-2 text-[8px] text-slate-400 font-bold">{source.lastSync}</span>
               </div>
            ))}
         </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'Canopi Paid Media Suite'}
        //@ts-ignore
        size={modalData?.size || 'md'}
      >
        <div className="py-2">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};


export default PaidMedia;
