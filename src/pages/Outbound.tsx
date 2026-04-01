"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus,
  TrendingUp,
  Target,
  Filter,
  Phone,
  Search,
  Zap,
  Radar,
  PieChart,
  ArrowRight,
  Sparkles,
  UserPlus,
  Bot,
  Settings,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Globe,
  Command,
  ChevronRight,
  Clock,
  ExternalLink,
  MessageSquare,
  Mail,
  Linkedin,
  X,
  FileText,
  User,
  Layout,
  BarChart3,
  ArrowUpRight,
  Info,
  Layers,
  Cpu
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Modal, Badge } from '../components/ui';
import { advancedSignals } from '../data/signalsV6';
import { contasMock } from '../data/accountsData';
import { useAccountDetail } from '../context/AccountDetailContext';

// --- MOCK DATA PARA ICP / PERSONAS ---
const personaData = [
  { 
    title: "VP de Revenue Ops", 
    vertical: "Technology / SaaS", 
    channel: "LinkedIn Voice", 
    benchmark: "14.5%", 
    play: "Efficiency First",
    pain: "Fragmentação de dados e falta de visibilidade de atribuição."
  },
  { 
    title: "Head de Supply Chain", 
    vertical: "Logistics / Retail", 
    channel: "Cold Call", 
    benchmark: "9.2%", 
    play: "Operational Risk",
    pain: "Gaps de visibilidade no monitoramento de parceiros críticos."
  },
  { 
    title: "Diretor Financeiro (CFO)", 
    vertical: "Finance / Enterprise", 
    channel: "Email Executivo", 
    benchmark: "18.8%", 
    play: "Growth Expension",
    pain: "Necessidade de provar ROI antes de expandir novos canais."
  }
];

// --- AUX COMPONENTS (FASE 2: Identificação de Fonte) ---
const SourceBadge: React.FC<{ source: string }> = ({ source }) => {
  const isNexus = source.toLowerCase().includes('nexus');
  const isMinerva = source.toLowerCase().includes('minerva');
  const isCross = source.toLowerCase().includes('cross');
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-tighter shadow-sm
      ${isNexus ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
        isMinerva ? 'bg-amber-50 border-amber-100 text-amber-600' : 
        isCross ? 'bg-purple-50 border-purple-100 text-purple-600' : 
        'bg-slate-50 border-slate-100 text-slate-500'}`}>
       <Cpu className="w-2.5 h-2.5" /> {source}
    </div>
  );
};

export const Outbound: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);
  const [activeTab, setActiveTab ] = useState<'queue' | 'personas'>('queue');
  const { openAccount } = useAccountDetail();

  // Helper para buscar ID da conta pelo nome (para costura com sinais)
  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1'; // Fallback para ID '1' se não encontrar
  };

  // Mapeamento de Sinais para Metadados Táticos (FASE 2: Costura Arquitetural)
  const outboundSignals = useMemo(() => {
    return advancedSignals
      .filter(s => 
        s.category === 'Outbound' || 
        (s.category === 'ABM' && s.type === 'Conta') ||
        (s.category === 'ABX' && s.type === 'Conta')
      )
      .map(s => {
        // Natureza da Recomendação
        let tag: 'ABM' | 'ABX' | 'Growth' | 'Híbrido' = 'Growth';
        if (s.category === 'ABM') tag = 'ABM';
        else if (s.category === 'ABX') tag = 'ABX';
        else if (s.severity === 'crítico') tag = 'Híbrido';

        // Objetivo Tático
        let objective: 'entrada' | 'continuidade' | 'expansão' | 'recuperação' | 'otimização' = 'entrada';
        if (s.severity === 'crítico' && s.category === 'ABM') objective = 'recuperação';
        else if (s.severity === 'oportunidade') objective = 'expansão';
        else if (s.title.toLowerCase().includes('queda') || s.title.toLowerCase().includes('abaixo')) objective = 'otimização';
        else if (s.description.toLowerCase().includes('contínuo') || s.title.toLowerCase().includes('intenta')) objective = 'continuidade';

        // Fonte do Sinal (Costura com Nexus/Minerva/Local)
        let source = 'Operação Local';
        if (s.title.toLowerCase().includes('nexus') || s.account.includes('Nexus')) source = 'Nexus Engine';
        else if (s.title.toLowerCase().includes('minerva') || s.source === 'Intent Data') source = 'Minerva Signal';
        else if (s.type === 'Operacional' && s.severity === 'crítico') source = 'Cross Intel';

        // Roteamento (Local vs Global)
        // Regra: Se for crítico ou envolver risco de perda financeira > 200k, rotear para Global (Actions)
        const isGlobal = s.severity === 'crítico' || (s.impact && s.impact.includes('280k'));

        return { ...s, tag, objective, source, isGlobal };
      });
  }, []);

  const openPlaybookDrawer = (signal: any) => {
    setModalData({
      title: `Playbook: ${signal.objective.toUpperCase()}`,
      size: 'lg',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-24 h-24 text-white" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <Badge variant="blue">PLAYBOOK ATIVO</Badge>
                   <SourceBadge source={signal.source} />
                </div>
                <h3 className="text-xl font-bold">{signal.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{signal.context || signal.description}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> Racional de Execução
                   </p>
                   <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                      "{signal.recommendation}"
                   </p>
                </div>
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Roteamento Sugerido</p>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${signal.isGlobal ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-900">{signal.isGlobal ? 'Página de AÇÕES (Interdisciplinar)' : 'Execução Local (SDR)'}</span>
                   </div>
                </div>
             </div>
             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1">
                   <Info className="w-3 h-3" /> Semântica do Play: {signal.tag}
                </p>
                <div className="space-y-3">
                   <div className="flex justify-between text-[11px] pb-2 border-b border-slate-200"><span className="text-slate-500">Natureza:</span> <span className="font-bold text-slate-900">{signal.tag}</span></div>
                   <div className="flex justify-between text-[11px] pb-2 border-b border-slate-200"><span className="text-slate-500">Conta:</span> <span className="font-bold text-slate-900">{signal.account}</span></div>
                   <div className="flex justify-between text-[11px] pb-2 border-b border-slate-200"><span className="text-slate-500">Canal:</span> <span className="font-bold text-indigo-600">{signal.channel}</span></div>
                   <div className="flex justify-between text-[11px] pt-1"><span className="text-slate-500">Dificuldade:</span> <span className="font-bold text-slate-700">{signal.isGlobal ? 'Alta (Multi-stakeholder)' : 'Média (SDR Tactile)'}</span></div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <div className="flex gap-3">
                <button className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2
                   ${signal.isGlobal ? 'bg-white border-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-900 border-slate-900 text-white hover:bg-black'}`}>
                   <Zap className="w-4 h-4" /> Executar Local (Outbound)
                </button>
                <button className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2
                   ${signal.isGlobal ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700' : 'bg-white border-slate-900 text-slate-900 hover:bg-slate-50'}`}>
                   <ExternalLink className="w-4 h-4" /> Enviar para Ações
                </button>
             </div>
             <p className="text-[9px] text-center text-slate-400 font-medium px-8 italic">
                {signal.isGlobal ? '* Este item foi roteado para Global pois exige alinhamento entre SDR, Executivo e Operações.' : '* Item de execução autônoma permitida conforme limites de alçada SDR.'}
             </p>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  const openEntityModal = (type: 'account' | 'contact', name: string) => {
    setModalData({
      title: type === 'account' ? `Perfil da Empresa: ${name}` : `Perfil do Contato: ${name}`,
      size: 'md',
      content: (
         <div className="py-12 px-6 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[24px] flex items-center justify-center mx-auto shadow-inner">
               <User className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-bold text-slate-900">{name}</h3>
               <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed italic">Direcionando para o cockpit de Stakeholders...</p>
            </div>
            <div className="pt-4 flex gap-3">
               <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10">Ver no CRM</button>
               <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50">Explorar Sinais</button>
            </div>
         </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest tracking-[0.2em]">Fluxo Tático Operacional</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outbound Intelligence</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
             <button 
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'queue' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Fila de Intervenção
             </button>
             <button 
                onClick={() => setActiveTab('personas')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'personas' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Contexto ICP
             </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 rounded-xl text-xs font-bold text-white hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20 border border-blue-600">
            <Plus className="w-4 h-4" />
            Nova Cadência
          </button>
        </div>
      </div>

      {/* Cockpit KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Em Fila Hoje', val: '42', detail: '12 urgentes', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Connect Rate', val: '58%', detail: '+4.2% vs ontem', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'SLA em Risco', val: '04', detail: 'Abordagem atrasada', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Novos Sinais', val: '18', detail: 'Nexus/Minerva (24h)', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all group">
            <div className="flex items-center justify-between mb-3 text-slate-300 group-hover:text-slate-400">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shadow-inner`}>
                <kpi.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-[0.1em]">{kpi.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{kpi.val}</h3>
               <span className="text-[10px] font-bold text-slate-500">{kpi.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* FASE 2: Glossário Tático Rápido */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Layers className="w-4 h-4" /> Semântica do Dia:</div>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> <span className="text-[10px] font-black text-slate-600">ABM: <span className="text-slate-400 font-medium">Conta Única</span></span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> <span className="text-[10px] font-black text-slate-600">ABX: <span className="text-slate-400 font-medium">Cluster & Intent</span></span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> <span className="text-[10px] font-black text-slate-600">Growth: <span className="text-slate-400 font-medium">Volume & Taxa</span></span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> <span className="text-[10px] font-black text-slate-600">Híbrido: <span className="text-slate-400 font-medium">Nexus + Minerva</span></span></div>
             </div>
          </div>

          {/* Top Intervention Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {outboundSignals.slice(0, 3).map((signal, i) => (
               <div key={i} className={`relative overflow-hidden bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border-l-4 ${signal.isGlobal ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex flex-col gap-1.5">
                        <SourceBadge source={signal.source} />
                        <div className="flex gap-1.5">
                           <Badge variant={signal.severity === 'crítico' ? 'red' : 'blue'}>{signal.tag}</Badge>
                           {signal.isGlobal && <Badge variant="amber" className="text-[8px]">GLOBAL ATIVO</Badge>}
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{signal.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Ação Sugerida:</span>
                       <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full tracking-tighter truncate max-w-[150px]">{signal.mainAction.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2 cursor-pointer group/item" onClick={() => openAccount(getAccountIdByName(signal.account))}>
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                           {signal.account.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 tracking-tighter hover:text-blue-600 transition-colors truncate max-w-[80px]">{signal.account}</span>
                        <ArrowUpRight className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/item:opacity-100 transition-all" />
                     </div>
                     <button onClick={() => openPlaybookDrawer(signal)} className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm
                        ${signal.isGlobal ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-slate-900 text-white hover:bg-black'}`}>
                        {signal.isGlobal ? 'Escalar para Ações' : 'Executar Playbook'} <ArrowRight className="w-3 h-3" />
                     </button>
                  </div>
               </div>
             ))}
          </div>

          {/* Tactical Execution Queue */}
          <div className="space-y-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                   <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Fila de Intervenção Tática</h3>
                   <p className="text-xs text-slate-500 font-medium mt-0.5 tracking-tight uppercase tracking-widest text-[9px]">Priorização Automática • Alçadas SDR & Global</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Filtrar por conta ou playbook..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none w-72 shadow-sm transition-all" 
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                   </div>
                   <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                      <Filter className="w-4 h-4" /> Filtros
                   </button>
                </div>
             </div>

             <div className="space-y-2">
                {outboundSignals.map((item, idx) => (
                  <div key={idx} className="group bg-white hover:bg-slate-50/40 p-4 rounded-[28px] border border-slate-100 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center gap-6 hover:shadow-md hover:border-blue-100 relative">
                    
                    {/* Conta e Contato (Costura Arquitetural) */}
                    <div className="w-full lg:w-72 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-[18px] bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-400 flex items-center justify-center shadow-inner group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600 transition-all cursor-pointer" onClick={() => openAccount(getAccountIdByName(item.account))} title="Ver visão da empresa">
                          {item.id.split('-')[1]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-black text-slate-900 truncate tracking-tight hover:text-blue-700 cursor-pointer transition-colors" onClick={() => openAccount(getAccountIdByName(item.account))}>{item.account}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="flex items-center gap-1 cursor-pointer group/contact" onClick={() => openEntityModal('contact', item.owner)} title="Ver perfil do contato">
                                <User className="w-3 h-3 text-slate-400 group-hover/contact:text-blue-500 transition-colors" />
                                <span className="text-[10px] font-bold text-slate-500 group-hover/contact:text-slate-900 group-hover/contact:underline transition-all">{item.owner}</span>
                             </div>
                             <SourceBadge source={item.source} />
                          </div>
                       </div>
                    </div>

                    {/* Gatilho e Natureza */}
                    <div className="flex-1 px-4 lg:border-l border-slate-100 space-y-1 cursor-pointer" onClick={() => openPlaybookDrawer(item)}>
                       <div className="flex flex-wrap gap-2 mb-1.5">
                          <Badge variant="slate" className="text-[8px] h-4 bg-slate-900 text-white border-none">{item.tag}</Badge>
                          <Badge variant="blue" className="text-[8px] h-4 uppercase">{item.objective}</Badge>
                          {item.isGlobal && <Badge variant="amber" className="text-[8px] px-1.5 h-4">ACTIONS QUEUE</Badge>}
                       </div>
                       <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-900 transition-colors">
                          {item.title}
                       </p>
                    </div>

                    {/* Canal e Meta-dados */}
                    <div className="w-full lg:w-40 px-4 lg:border-l border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Canal Sugerido</p>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                           {item.channel.toLowerCase().includes('email') && <Mail className="w-3.5 h-3.5 text-purple-500" />}
                           {item.channel.toLowerCase().includes('linkedin') && <Linkedin className="w-3.5 h-3.5 text-blue-500" />}
                           {item.channel.toLowerCase().includes('call') && <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                           {item.channel.toLowerCase().includes('site') && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                           <span className="truncate">{item.channel}</span>
                        </div>
                    </div>

                    {/* CTAs Finalizada (Costura Semântica) */}
                    <div className="flex items-center gap-3 ml-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-none border-slate-50">
                       <button onClick={() => openPlaybookDrawer(item)} className={`h-11 px-6 rounded-[16px] text-[10px] font-black uppercase tracking-[0.05em] transition-all shadow-xl flex items-center gap-2
                          ${item.isGlobal ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/10' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/10'}`}>
                          {item.isGlobal ? 'Escalar para Ações' : 'Executar Playbook'} <ArrowRight className="w-4 h-4" />
                       </button>
                       <div className="flex gap-1.5">
                          <button className="w-11 h-11 bg-white border border-slate-200 rounded-[16px] flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group/settings" title="Configurar Playbook (Configuração Técnica)">
                             <Settings className="w-4 h-4 text-slate-400 group-hover/settings:rotate-90 transition-all" />
                          </button>
                          <button onClick={() => openAccount(getAccountIdByName(item.account))} className="w-11 h-11 bg-white border border-slate-200 rounded-[16px] flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 group/nav transition-all shadow-sm" title="Abrir Visão da Empresa">
                             <ChevronRight className="w-4 h-4 text-slate-400 group-hover/nav:text-blue-500 group-hover/nav:translate-x-0.5 transition-all" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </>
      ) : (
        /* Aba Contexto ICP - Implementação Fase 2 */
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Seção Superior: Grids de Benchmarks & Verticais */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BarChart3 className="w-32 h-32 text-blue-600" />
                 </div>
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Benchmarks de Operação</span>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">ICPs & Verticais Prioritárias</h3>
                    </div>
                    <Badge variant="blue" className="px-4 py-2 text-[10px] font-black uppercase">MÉDIA GERAL: 11.2%</Badge>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {[
                       { vertical: 'Enterprise SaaS', focus: 'Revenue Ops / IT', benchmark: '15.4%', trend: 'up' },
                       { vertical: 'Manufacturing', focus: 'Logistics / Supply', benchmark: '8.2%', trend: 'down' },
                       { vertical: 'Fintech / Banking', focus: 'Finance / Risk', benchmark: '12.8%', trend: 'stable' },
                       { vertical: 'Healthcare', focus: 'Operations / MedTech', benchmark: '9.6%', trend: 'stable' },
                    ].map((v, i) => (
                       <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover:border-blue-100">
                                <Radar className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                             </div>
                             <div>
                                <p className="text-[15px] font-black text-slate-900 leading-tight">{v.vertical}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{v.focus}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[16px] font-black text-slate-900 tracking-tight">{v.benchmark}</p>
                             <div className={`flex items-center justify-end gap-1 text-[9px] font-black uppercase mt-0.5 ${v.trend === 'up' ? 'text-emerald-600' : v.trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>
                                {v.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : v.trend === 'down' ? <Activity className="w-2.5 h-2.5" /> : null}
                                {v.trend === 'up' ? 'CRESCENTE' : v.trend === 'down' ? 'EM QUEDA' : 'ESTÁVEL'}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[36px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-700">
                    <PieChart className="w-48 h-48 text-white" />
                 </div>
                 <div className="relative z-10 flex flex-col h-full gap-8">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Share de Conversão</span>
                       </div>
                       <h3 className="text-xl font-bold">Mix de Canais por Persona</h3>
                    </div>

                    <div className="space-y-6">
                       {[
                          { persona: 'C-Level', channel: 'Personalized Email', pct: 68, color: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' },
                          { persona: 'Heads / VPs', channel: 'LinkedIn Voice', pct: 42, color: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]' },
                          { persona: 'Managers', channel: 'Direct Cold Call', pct: 24, color: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' },
                       ].map((p, i) => (
                          <div key={i} className="space-y-2">
                             <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold">{p.persona}</span>
                                <span className={`text-xs font-black ${p.persona === 'C-Level' ? 'text-blue-400' : ''}`}>{p.pct}%</span>
                             </div>
                             <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
                                <div className={`h-full rounded-full ${p.color} transition-all duration-1000`} style={{ width: `${p.pct}%` }}></div>
                             </div>
                             <div className="flex items-center gap-1.5 opacity-60">
                                <span className="text-[9px] font-bold uppercase text-slate-400">Canal Vencedor:</span>
                                <span className="text-[9px] font-black text-slate-300">{p.channel}</span>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                       <Bot className="w-4 h-4 text-blue-500" />
                       <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">Derived by Minerva Engine • Updated 2h ago</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Seção Inferior: Personas Cards (Finalizados na Fase 2) */}
           <div>
              <div className="flex items-center justify-between mb-8 px-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                       <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Arquétipos de Decisão</h3>
                       <p className="text-sm text-slate-500 font-medium tracking-tight">Dicionário de abordagem tática por perfil.</p>
                    </div>
                 </div>
                 <button className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1">
                    Ver Todos os Perfis <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {personaData.map((p, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                          <User className="w-40 h-40 text-slate-900" />
                       </div>
                       
                       <div className="flex items-center gap-2 mb-4">
                          <Badge variant="blue" className="bg-blue-50 text-blue-700 border-none font-black px-3 py-1 text-[9px]">{p.vertical}</Badge>
                       </div>
                       
                       <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight">{p.title}</h4>
                       
                       <div className="mt-8 space-y-5 flex-1 relative z-10">
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/20 group-hover:border-blue-100 transition-all">
                             <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ponto de Dor</p>
                             </div>
                             <p className="text-xs text-slate-600 leading-relaxed font-bold italic tracking-tight underline decoration-blue-100 decoration-4 underline-offset-4">{p.pain}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <span className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Melhor Canal</span>
                                <span className="text-[11px] font-black text-slate-900 leading-tight">{p.channel}</span>
                             </div>
                             <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <span className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Benchmark</span>
                                <span className="text-[14px] font-black text-emerald-600 tracking-tight">{p.benchmark}</span>
                             </div>
                          </div>

                          <div className="flex items-center justify-between pt-6 mt-auto border-t border-slate-50">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tactical Play</span>
                             <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
                                <Bot className="w-3.5 h-3.5 text-blue-600" /> {p.play}
                             </span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Modal Genérico para Simulação (Drawers e Visões de Perfil) */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || ''}
        size={modalData?.size}
      >
        {modalData?.content}
      </Modal>

    </div>
  );
};

export default Outbound;
