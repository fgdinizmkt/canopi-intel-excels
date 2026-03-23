"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus,
  TrendingUp,
  Target,
  Filter,
  Phone,
  Mail,
  Linkedin,
  MousePointer2,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Radar,
  PieChart,
  ArrowRight,
  Sparkles,
  UserPlus,
  MessageSquare,
  Bot,
  Settings,
  AlertTriangle,
  Activity,
  User,
  ShieldCheck,
  Globe,
  BadgeCheck
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
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const baseOutboundData = [
  { name: 'Seg', linkedin: 400, email: 240, calls: 120 },
  { name: 'Ter', linkedin: 300, email: 139, calls: 210 },
  { name: 'Qua', linkedin: 200, email: 980, calls: 300 },
  { name: 'Qui', linkedin: 278, email: 390, calls: 150 },
  { name: 'Sex', linkedin: 189, email: 480, calls: 180 },
];

const outboundAccountsData = [
  {
    id: 'mercadolivre',
    avatar: 'ML',
    name: 'Mercado Livre',
    details: 'Strategic • Marketplace',
    cadence: 'Entrada Enterprise v4',
    engagement: 78,
    stage: 'TOUCH 3 (LinkedIn)',
    stageBg: 'bg-blue-50 text-blue-700 border-blue-100',
    action: 'Enviar LinkedIn Voice',
    simKey: 'VOICE_SIM'
  },
  {
    id: 'totvs',
    avatar: 'TV',
    name: 'Tots SaaS',
    details: 'Enterprise • Software',
    cadence: 'CXOs High-Touch',
    engagement: 45,
    stage: 'TOUCH 1 (Email)',
    stageBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    action: 'Ver Perfil no CRM',
    simKey: 'CRM_PROFILE'
  },
  {
    id: 'nubank',
    avatar: 'NB',
    name: 'Nubank Brasil',
    details: 'Strategic • Fintech',
    cadence: 'Expansão Latam',
    engagement: 92,
    stage: 'REUNIÃO MARCADA',
    stageBg: 'bg-purple-50 text-purple-700 border-purple-100',
    action: 'Validar Playbook',
    simKey: 'PLAYBOOK_SIM'
  }
];

type TimeFilter = '7d' | '30d' | '90d';

export const Outbound: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const filters = {
    '7d': { outVol: 0.3, label: 'Últimos 7 dias', trend: -1.4 },
    '30d': { outVol: 1.0, label: 'Últimos 30 dias', trend: 0 },
    '90d': { outVol: 2.8, label: 'Este Trimestre', trend: +4.2 },
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
      case 'NOVA_CADENCIA':
        contentNode = (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
               <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-white tracking-tight">CADENCE DESIGNER 2.0</h4>
                  <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1">Orquestração Agêntica Multicanal</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-tighter">Fluxo de Sequenciamento</p>
                     <div className="space-y-3 relative">
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-blue-100 border-dashed border-l"></div>
                        
                        <div className="relative z-10 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                           <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-white" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">Dia 1: Cold Email (Personalizado via AI)</p>
                              <p className="text-[9px] text-slate-500">Gatilho: Signal de Intenção Detectado</p>
                           </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm ml-6">
                           <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                              <Linkedin className="w-4 h-4 text-white" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-800">Dia 2: LinkedIn (Interação em Post)</p>
                              <p className="text-[9px] text-slate-500">Ação: Curtir e Comentar via Agente</p>
                           </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm ml-6 opacity-60">
                           <div className="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center shrink-0">
                              <Target className="w-4 h-4 text-white" />
                           </div>
                           <div className="flex-1 text-slate-400 italic">Clique para adicionar step...</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Configuração de Alvos</p>
                     <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Segmento</p>
                           <p className="text-xs font-bold text-slate-800 truncate">VPs de Revenue Ops</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Tone of Voice</p>
                           <p className="text-xs font-bold text-slate-800">Consultivo & Autoritário</p>
                        </div>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-blue-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20" onClick={() => setModalOpen(false)}>
                     Ativar em High-Scale <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        );
        break;

      case 'CRM_SYNC':
        contentNode = (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                           <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <h5 className="text-sm font-bold text-slate-800">Salesforce Mirror</h5>
                           <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">HEALTHY CONECTION</p>
                        </div>
                     </div>
                     <Settings className="w-4 h-4 text-slate-400 hover:rotate-90 transition-transform cursor-pointer" />
                  </div>

                  <div className="space-y-4">
                     {[
                        { obj: 'Accounts', status: 'SYCED', items: 1240 },
                        { obj: 'Contacts', status: 'SYNCING', items: 5821 },
                        { obj: 'Opportunities', status: 'SYCED', items: 84 },
                        { obj: 'Activities', status: 'IDLE', items: 42800 },
                     ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                           <div>
                              <p className="text-xs font-bold text-slate-700">{item.obj}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{item.items} registros rastreados</p>
                           </div>
                           <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border ${item.status === 'SYNCING' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {item.status}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="w-full md:w-80 space-y-4">
                  <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest opacity-60">Log de Operações Recentes</p>
                     <div className="space-y-3 font-mono text-[9px]">
                        <p className="text-emerald-400 leading-tight border-l-2 border-emerald-500 pl-2">&gt; Mapping new field 'Intent_Score_B2B' to 'Canopi_Int'</p>
                        <p className="text-white leading-tight border-l-2 border-white pl-2">&gt; Successfully pushed 12 tasks to Salesforce</p>
                        <p className="text-amber-400 leading-tight border-l-2 border-amber-500 pl-2 italic">&gt; [i] Sync delayed: 42 API calls remaining this hour</p>
                     </div>
                  </div>
                  <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors" onClick={() => setModalOpen(false)}>Configurar Webhooks</button>
               </div>
            </div>
          </div>
        );
        break;

      case 'OUTBOUND_AUDIT':
         contentNode = (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {[
                    { label: 'Domain Health', val: '98%', status: 'GOOD', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Spam Rate', val: '0.04%', status: 'ULTRA LOW', icon: AlertTriangle, color: 'text-blue-500' },
                    { label: 'SPF/DKIM/DMARC', val: 'Valid', status: 'VERIFIED', icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'API Latency', val: '12ms', status: 'FAST', icon: Activity, color: 'text-emerald-500' },
                 ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                       <stat.icon className={`w-4 h-4 ${stat.color} mb-3`} />
                       <p className="text-xl font-bold text-slate-900">{stat.val}</p>
                       <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                 ))}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                 <h5 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" /> Curva de Reputação de Domínio (Warmup)
                 </h5>
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={baseOutboundData.map(d => ({ ...d, val: 80 + Math.random() * 20 }))}>
                          <Area type="monotone" dataKey="val" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} />
                          <Tooltip content={() => null} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl hover:bg-black transition-all" onClick={() => setModalOpen(false)}>Abrir Central de Domínios</button>
              </div>
           </div>
         );
         break;

      case 'VOICE_SIM':
        contentNode = (
          <div className="space-y-6">
            <div className="bg-[#f3f6f8] rounded-3xl p-6 border border-slate-200 shadow-inner">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                     <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800">LinkedIn Outreach Terminal</p>
                     <p className="text-[10px] text-slate-500">Sugerido para: <span className="text-blue-600 font-bold">Mercado Livre (Daniel)</span></p>
                  </div>
               </div>

               <div className="space-y-4 max-w-md">
                  <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-400 shrink-0"></div>
                     <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-xs font-medium text-slate-700 leading-relaxed">
                        Daniel acabou de curtir "O futuro do ABM em escala 2024". Este é o gatilho emocional para abordar com o Voice Note.
                     </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                     <div className="p-4 bg-blue-600 rounded-2xl rounded-tr-none text-white text-xs font-medium leading-relaxed shadow-lg shadow-blue-500/20">
                        "Oi Daniel! Vi seu interesse no post de ABM v4. Pensei muito no que você comentou sobre personalização e como isso casa com o que estamos buildando aqui..."
                     </div>
                     <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">YO</div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button className="py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm" onClick={() => setModalOpen(false)}>Injetar via Sales Navigator</button>
               <button className="py-4 bg-blue-700 text-white rounded-2xl font-bold text-xs hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2" onClick={() => setModalOpen(false)}>
                  <Bot className="w-4 h-4" /> Re-gerar Script IA
               </button>
            </div>
          </div>
        );
        break;

      case 'CRM_PROFILE':
         contentNode = (
           <div className="space-y-6">
              <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                 <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">TV</div>
                 <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900">Totvs SaaS</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Managed via canopi-agente-03
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nível de Intenção</p>
                    <p className="text-2xl font-black text-blue-600">45%</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dados da Conta (CRM)</p>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs py-2 border-b border-slate-50"><span className="text-slate-500">Revenue Anual:</span> <span className="font-bold text-slate-800">$1.2B</span></div>
                       <div className="flex justify-between text-xs py-2 border-b border-slate-50"><span className="text-slate-500">Sede:</span> <span className="font-bold text-slate-800">São Paulo, SP</span></div>
                       <div className="flex justify-between text-xs py-2 border-b border-slate-50"><span className="text-slate-500">Último Touchpoint:</span> <span className="font-bold text-slate-800">2h atrás (Email)</span></div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engajamento de Decisores</p>
                    <div className="flex -space-x-3">
                       {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 ring-1 ring-slate-100">D{i}</div>)}
                       <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-xs font-bold text-white ring-1 ring-blue-500 shadow-lg">+3</div>
                    </div>
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest" onClick={() => setModalOpen(false)}>Abrir Deep Dive CRM</button>
                 </div>
              </div>
           </div>
         );
         break;

      case 'DRILLDOWN_METRIC':
        contentNode = (
          <div className="space-y-8">
             <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Engajamento Total</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">2.4k</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                   <p className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Open Rate</p>
                   <p className="text-3xl font-black text-blue-700 tracking-tight">42.8%</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                   <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2 tracking-widest">Reply Rate</p>
                   <p className="text-3xl font-black text-emerald-700 tracking-tight">12.1%</p>
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <PieChart className="w-4 h-4 text-blue-500" /> Atribuição de Funil (Outbound)
                   </h5>
                </div>
                <div className="p-8 space-y-4">
                   {[
                      { channel: 'E-mail Sequências', share: 45, color: '#2563eb' },
                      { channel: 'LinkedIn Sales Navigator', share: 38, color: '#8b5cf6' },
                      { channel: 'Cold Call (SDR Direct)', share: 12, color: '#10b981' },
                      { channel: 'Social Selling (Executivos)', share: 5, color: '#f59e0b' },
                   ].map((item, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>{item.channel}</span>
                            <span>{item.share}%</span>
                         </div>
                         <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{width: `${item.share}%`, backgroundColor: item.color}}></div>
                         </div>
                      </div>
                   ))}
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outbound Analytics</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 max-w-2xl leading-relaxed">
            Gestão de prospecção ativa via cadências multicanal. Integre sinais de intenção para abordagens hiper-personalizadas que abrem portas em contas estratégicas.
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
            onClick={() => openSimModal('Novo Designer de Fluxo (Outbound)', 'NOVA_CADENCIA', 'lg')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 rounded-lg text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20 group border border-blue-600"
          >
            <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nova Cadência Agêntica
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: CONTAS ACCESSED */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-blue-300" onClick={() => openSimModal('Exploração de Métricas: Impacto', 'DRILLDOWN_METRIC', 'lg')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              {(12.4 + currFilter.trend).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Contas Impactadas</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(842 * currFilter.outVol)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Contatos ativos no período</p>
        </div>

        {/* Card 2: CONNECT RATE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-emerald-300" onClick={() => openSimModal('Exploração de Métricas: Conexão', 'DRILLDOWN_METRIC', 'lg')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Phone className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currFilter.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {(1.2 + currFilter.trend).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Taxa de Conexão</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(48.2 + currFilter.trend)}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Emails e Calls atendidas</p>
        </div>

        {/* Card 3: REPLY RATE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-amber-300" onClick={() => openSimModal('Exploração de Métricas: Respostas', 'DRILLDOWN_METRIC', 'lg')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              +{Math.abs(currFilter.trend).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Reply Rate (Geral)</p>
          <h3 className="text-2xl font-bold text-slate-900">{(14.2 + (currFilter.trend * 0.5)).toFixed(1)}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Interesse demonstrado direto</p>
        </div>

        {/* Card 4: MEETINGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-blue-300" onClick={() => openSimModal('Exploração de Métricas: Reuniões', 'DRILLDOWN_METRIC', 'lg')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              +14
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Reuniões Marcadas</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(156 * currFilter.outVol)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Conversão final do fluxo</p>
        </div>

        {/* Card 5 (Dark theme) PIPELINE */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden transition-all group cursor-pointer hover:bg-black" onClick={() => openSimModal('Exploração de Métricas: Pipeline', 'DRILLDOWN_METRIC', 'lg')}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <TrendingUp className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/50 border border-blue-500/50 text-white flex items-center justify-center backdrop-blur-md">
                <Target className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currFilter.trend >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'}`}>
                +{(15.0 + currFilter.trend * 2).toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pipeline Outbound</p>
            <h3 className="text-2xl font-extrabold text-white">R$ {(3.4 * currFilter.outVol).toFixed(1)}M</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Originado via SDRs/Agentes</p>
          </div>
        </div>

      </div>

      {/* Middle Section: Chart + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Chart Area */}
        <div className="flex-[2] bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Engajamento Multicanal por Dia</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Interações diretas em E-mail, LinkedIn e Cold Calls.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors" onClick={() => openSimModal('Painel de Sincronização em Nuvem', 'CRM_SYNC', 'lg')}>CRM Sync</button>
              <button className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm" onClick={() => openSimModal('Auditoria de Saúde de Domínios', 'OUTBOUND_AUDIT', 'lg')}>Auditoria AI</button>
            </div>
          </div>

          <div className="relative h-[280px] w-full rounded-xl overflow-hidden mb-8 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={baseOutboundData.map(d => ({
                ...d,
                linkedin: d.linkedin * currFilter.outVol,
                email: d.email * currFilter.outVol,
                calls: d.calls * currFilter.outVol,
              }))}>
                <XAxis dataKey="name" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={({ active, payload }) => {
                    if (active && payload) {
                      return (
                        <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs font-bold shadow-2xl border border-slate-700">
                          {payload.map((item, i) => (
                            <div key={i} className="flex justify-between gap-6 mb-1 last:mb-0">
                               <span className="opacity-70">{item.name}:</span>
                               <span>{item.value} interações</span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Bar dataKey="linkedin" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                <Bar dataKey="email" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="calls" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sub data lists - Restoration of style from SEO & Inbound */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-slate-100 pt-8 mt-4">
              <div className="flex flex-col">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <BadgeCheck className="w-3 h-3 text-amber-500" />
                  Sequências de Alta Performance
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Indústria High-Connect v2', cat: 'EMPRESA', conv: 28 },
                    { label: 'Tier 1 Strategic Outreach', cat: 'VIPS', conv: 15 },
                    { label: 'CXO Financeiro Personalizado', cat: 'CXOS', conv: 42 },
                    { label: 'Webinar Follow-up v1', cat: 'EVENTO', conv: 9 },
                  ].map((seq, idx) => (
                    <div key={idx} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors cursor-pointer" onClick={() => openSimModal(`Performance: ${seq.label}`, 'DRILLDOWN_METRIC', 'lg')}>
                      <div className="flex items-center gap-3">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{seq.label}</span>
                      </div>
                      <span className="text-[10.5px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{seq.conv}% Conv.</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Radar className="w-3 h-3 text-indigo-500" />
                  Gatilhos de Intenção do Mercado
                </p>
                <div className="space-y-1.5">
                  {[
                    { kw: "Mudança de Liderança (C-Level)", alert: "Alta", score: 92 },
                    { kw: "Adoção de Stack AI / Ops", alert: "Média", score: 78 },
                    { kw: "Expansion Signals (Latam)", alert: "Alta", score: 85 },
                    { kw: "SDR Massive Hiring", alert: "Baixa", score: 45 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors cursor-pointer" onClick={() => openSimModal(`Sinal de Mercado: ${item.kw}`, 'OUTBOUND_AUDIT', 'lg')}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.alert === 'Alta' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.kw}</span>
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{item.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>

        {/* Right Sidebar - Insights Agênticos (Outbound Focused) */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[400px]">
          
          <div className="flex-[1.5] bg-slate-900 rounded-3xl p-7 shadow-lg relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-screen animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 bg-slate-800/50 p-2 pr-4 rounded-full border border-slate-700/50 w-fit">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                   <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm tracking-wide">Prospect Intelligence</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#111827] border border-blue-900/50 p-5 rounded-2xl hover:border-blue-700 transition-colors">
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div> LinkedIn Intent</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed mb-5">
                    Daniel (C-Level • IBM) engajou com seu conteúdo de ROI B2B. O timing é perfeito para abordagem.
                  </p>
                  <button onClick={() => openSimModal('Sugestão de Script: LinkedIn Voice', 'VOICE_SIM', 'md')} className="text-[10px] w-full py-2 bg-blue-600/20 rounded-lg border border-blue-500/30 font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600/40 transition-colors">
                    Gerar Script de Voz <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-[#111827] border border-emerald-900/50 p-5 rounded-2xl hover:border-emerald-700 transition-colors">
                   <div className="flex flex-col gap-2 mb-3">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_#10b981]"></div> Saturação Detectada</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed mb-5">
                    A cadência "Tech SMB" atingiu o limite de disparos diários. O Agente sugere pausar o canal E-mail.
                  </p>
                  <button onClick={() => openSimModal('Auditoria de Canal Outbound', 'OUTBOUND_AUDIT', 'lg')} className="text-[10px] w-full py-2 bg-emerald-600/10 rounded-lg border border-emerald-500/20 font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-colors">
                    Otimizar Fluxo <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Saúde do Funil Outbound */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all">
             <div className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer shadow-sm" onClick={() => openSimModal('Adicionar Métrica de Saúde', 'GENERIC')}>
               <Plus className="w-4 h-4" />
             </div>
             <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Eficiência por Touchpoint</p>
             <div className="space-y-6">
               <div className="cursor-pointer group" onClick={() => openSimModal('Detalhamento: Connect Rate', 'DRILLDOWN_METRIC', 'lg')}>
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Connect Rate (1st Touch)</span>
                     <span className="text-sm font-extrabold text-blue-700">58%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: '58%'}}></div>
                  </div>
               </div>
               <div className="cursor-pointer group" onClick={() => openSimModal('Detalhamento: Reuniões', 'DRILLDOWN_METRIC', 'lg')}>
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">Reuniões / Respostas</span>
                     <span className="text-sm font-extrabold text-emerald-600">{(24.5 + currFilter.trend).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{width: `${24.5 + currFilter.trend}%`}}></div>
                  </div>
               </div>
             </div>
          </div>
          
        </div>
      </div>

      {/* Visual Content Grid - Personas em Prospecção */}
      <div className="px-2">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Personas em Prospecção (Maiores Conversões)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[
            { title: "VPs de Revenue Ops", cat: "Segmento Tech", emails: "240", conv: "14.5%", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=240&h=160" },
            { title: "Diretores Logísticos", cat: "Segmento E-commerce", emails: "184", conv: "9.2%", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=240&h=160" },
            { title: "Heads de Estratégia", cat: "Segmento Financeiro", emails: "412", conv: "18.8%", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400&h=300" },
          ].map((persona, idx) => (
            <div key={idx} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-300 transition-all cursor-pointer shadow-sm" onClick={() => openSimModal(`Persona: ${persona.title}`, 'DRILLDOWN_METRIC', 'lg')}>
              <div className="relative h-32 w-full overflow-hidden">
                <img src={persona.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={persona.title} />
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold text-slate-700 uppercase shadow-sm border border-slate-200">{persona.cat}</div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{persona.title}</h4>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Impactos</span>
                    <span className="text-xs font-extrabold text-slate-700">{Math.round(parseInt(persona.emails) * currFilter.outVol)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Reuniões</span>
                    <span className="text-xs font-extrabold text-blue-600">{Math.round(idx * 4.2 + 8)}%</span>
                  </div>
                  <div className="ml-auto w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Table: Fluxo de Prospecção Ativa */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Fluxo de Prospecção Ativa por Conta ABM</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Monitore o progresso individual dos tomadores de decisão em cada conta-chave.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="Buscar conta..." 
                 className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all shadow-sm"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             </div>
             <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm" onClick={() => openSimModal('Filtros de Prospecção', 'GENERIC')}>
               <Filter className="w-4 h-4 text-slate-500" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-8 pr-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Conta ABM</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Cadência Ativa</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Intenção (%)</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fase Atual</th>
                <th className="pr-8 pl-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Intervenção Agêntica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {outboundAccountsData.map(row => (
                <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="pl-8 pr-4 py-5">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => openSimModal(`Visão 360: ${row.name}`, 'CRM_PROFILE', 'lg')}>
                      <div className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center shadow-sm group-hover:border-blue-300">
                        {row.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{row.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{row.details}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer hover:text-blue-600" onClick={() => openSimModal(`Fluxo: ${row.cadence}`, 'NOVA_CADENCIA', 'lg')}>
                       <Zap className="w-3.5 h-3.5 text-blue-500" />
                       {row.cadence}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shadow-inner">
                      <Radar className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{row.engagement}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                     <span className={`px-2 py-1 text-[9px] font-extrabold rounded-md border tracking-widest uppercase ${row.stageBg}`}>
                       {row.stage}
                     </span>
                  </td>
                  <td className="pr-8 pl-4 py-5 text-center">
                    <button className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50 bg-blue-50/50 border border-blue-100/50" onClick={() => openSimModal(row.action, row.simKey || 'VOICE_SIM', 'md')}>
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 text-center">
             <button className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 mx-auto">
                <Plus className="w-3.5 h-3.5" /> Ver mais 14 contas em prospecção
             </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'Canopi Outbound Engine'}
        //@ts-ignore - Adding custom size support for larger simulations
        size={modalData?.size || 'md'}
      >
        <div className="py-2">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};


export default Outbound;
