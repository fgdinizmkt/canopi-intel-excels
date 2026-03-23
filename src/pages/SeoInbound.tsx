"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus,
  TrendingUp,
  UserPlus,
  BadgeCheck,
  Layers,
  Wallet,
  Filter,
  Ghost,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Cpu, // For AI/GEO icons
  HandMetal, // For hand-raisers
  Bot,
  Globe,
  Youtube,
  Linkedin,
  MousePointer2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Modal } from '../components/ui';

// --- MOCK DATA ---

const basePerformanceData = [
  { name: '1', search: 8000, ai: 200 },
  { name: '2', search: 12000, ai: 400 },
  { name: '3', search: 9000, ai: 450 },
  { name: '4', search: 14200, ai: 900 },
  { name: '5', search: 8500, ai: 1100 },
  { name: '6', search: 15100, ai: 1800 },
  { name: '7', search: 11000, ai: 2400 }, // AI Overviews growing over time
];

const impactTableData = [
  {
    id: 'ibm',
    avatar: 'IBM',
    name: 'IBM Brasil',
    details: 'Enterprise • Tecnologia',
    contentTitle: 'O Futuro do ABM na Era do AGI',
    contentType: 'AEO OPTIMIZED ARTICLE',
    baseEngagement: 12,
    stage: 'CONSIDERAÇÃO',
    stageBg: 'bg-amber-50 text-amber-700 border-amber-100',
    action: 'Enviar Case de Estudo',
  },
  {
    id: 'itau',
    avatar: 'IT',
    name: 'Itaú Unibanco',
    details: 'Enterprise • Financeiro',
    contentTitle: 'Gestão de Dados em Escala',
    contentType: 'WEBINAR',
    baseEngagement: 45,
    stage: 'DECISÃO',
    stageBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    action: 'Levantada de Mão (Comercial)',
  },
  {
    id: 'ambev',
    avatar: 'AM',
    name: 'Ambev',
    details: 'Strategic • CPG',
    contentTitle: 'Inovação em Supply Chain',
    contentType: 'SEO PILLAR PAGE',
    baseEngagement: 8,
    stage: 'CONSCIENTIZAÇÃO',
    stageBg: 'bg-slate-100 text-slate-600 border-slate-200',
    action: 'Incluir em Newsletter',
  }
];

type TimeFilter = '7d' | '30d' | '90d';

export const SeoInbound: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const filters = {
    '7d': { seoVol: 0.28, inbVol: 0.15, label: 'Últimos 7 dias', rateDiff: -1.2 },
    '30d': { seoVol: 1.0, inbVol: 1.0, label: 'Últimos 30 dias', rateDiff: 0 },
    '90d': { seoVol: 3.1, inbVol: 4.8, label: 'Este Trimestre', rateDiff: +3.4 },
  };
  const currFilter = filters[timeFilter];

  const cycleTimeFilter = () => {
    if (timeFilter === '30d') setTimeFilter('90d');
    else if (timeFilter === '90d') setTimeFilter('7d');
    else setTimeFilter('30d');
  };

  const openSimModal = (title: string, componentKey: string) => {
    let contentNode;
    switch(componentKey) {
      case 'NOVA_OTIMIZACAO':
        contentNode = (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 mb-2 shadow-inner">
               <Bot className="w-8 h-8 text-emerald-400 shrink-0" />
               <div>
                  <h4 className="font-bold text-white text-sm">Laboratório AEO & GEO</h4>
                  <p className="text-xs text-slate-400 mt-1">Configuração de otimização de conteúdo para Answer Engines (Perplexity/SGE) e Generative Engine Optimization.</p>
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Target Engine</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer">
                <option>Multi-Engine (SGE + Perplexity + Claude)</option>
                <option>Google AI Overviews (SGE) Isolado</option>
                <option>Perplexity Pro Isolado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Asset URL ou Texto Fonte</label>
              <input type="text" placeholder="https://seudominio.com.br/pillar-page" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="pt-2">
              <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors" onClick={() => setModalOpen(false)}>Processar Modelagem AEO</button>
            </div>
          </div>
        );
        break;
      case 'GSC':
        contentNode = (
          <div className="text-center space-y-4 py-4">
             <div className="w-16 h-16 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Search className="w-8 h-8 text-blue-600" />
             </div>
             <div>
               <h3 className="font-bold text-slate-800">Google Search Console</h3>
               <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">Integração API v3 Ativa</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2 mt-4">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Última Vrededura (Crawling):</span>
                    <span className="text-slate-500">Há 45 minutos</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">AI Overviews Tracking:</span>
                    <span className="text-emerald-500 font-bold">Monitorando 142 Queries</span>
                 </div>
             </div>
             <button className="text-xs w-full py-2.5 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-lg hover:bg-blue-100 mt-2" onClick={() => setModalOpen(false)}>Acessar Logs Técnicos Server-Side</button>
          </div>
        );
        break;
      case 'INVESTIGAR_SITEMAP':
        contentNode = (
          <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-[10px] sm:text-xs overflow-hidden leading-relaxed shadow-inner">
             <p className="text-emerald-300 font-bold mb-2 tracking-widest uppercase">➜ GEO Crawler Agent Iniciado</p>
             <p>[OK] Autenticando com CMS / Vercel Deployments</p>
             <p className="opacity-70">&gt; GET /sitemap.xml... HTTP 200</p>
             <p className="opacity-70">&gt; Scanning Citation Signals para Perplexity...</p>
             <p className="text-rose-400 mt-2">[ALERTA GEO] As 4 Pillar Pages de "Enterprise Solutions" não possuem formatação estruturada de FAQ (Schema.org) necessária para gatilhos de Answer Engine.</p>
             <div className="mt-4 border-t border-slate-700 pt-3">
               <button className="bg-indigo-600 text-white border border-indigo-500/30 px-3 py-2 rounded hover:bg-indigo-700 transition-colors w-full font-sans font-bold text-xs" onClick={() => setModalOpen(false)}>Injetar JSON-LD Automático via Edge</button>
             </div>
          </div>
        );
        break;
      case 'SDR_PLAY':
         contentNode = (
           <div className="space-y-4">
             <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Alerta Hand-Raiser Direcionado</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                     Esta Oportunidade de ABM foi roteada para a fila prioritária ("Fast-Lane") dos SDRs no CRM. O Lead consumiu 3 ativos técnicos e acionou nosso alerta de <strong className="text-emerald-700">High-Intent Hand-Raiser</strong>.
                  </p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button className="text-[11px] w-full py-2.5 font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50" onClick={() => setModalOpen(false)}>Recolher Analista</button>
                <button className="text-[11px] w-full py-2.5 font-bold text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-black" onClick={() => setModalOpen(false)}>Ver Perfil do Lead no CRM</button>
             </div>
           </div>
         );
         break;
      case 'METAS':
         contentNode = (
           <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600">Ajuste os benchmarks orgânicos para o período analisado ({currFilter.label}):</p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <label className="text-[10px] font-bold text-slate-400 uppercase">Levantadas de Mão (Mês)</label>
                   <input type="number" defaultValue="85" className="w-full mt-2 p-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-bold" />
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <label className="text-[10px] font-bold text-slate-400 uppercase">AIO Share of Voice (%)</label>
                   <input type="number" defaultValue="25" className="w-full mt-2 p-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-bold" />
                 </div>
              </div>
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm py-3 rounded-lg shadow-md" onClick={() => setModalOpen(false)}>Salvar Calibração</button>
           </div>
         );
         break;
      case 'VIEW_TRAFFIC_DRILLDOWN':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600"/> Quebra Analítica de Tráfego</h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                 <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-600">Busca Orgânica Tradicional</span>
                    <span className="font-bold text-slate-800">{(68 * currFilter.seoVol).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">Sessões</span></span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                    <span className="font-semibold text-emerald-600">Google AI Overviews (SGE)</span>
                    <span className="font-bold text-slate-800">{(12 * currFilter.seoVol).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">Sessões</span></span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                    <span className="font-semibold text-indigo-600">Perplexity AI / Claude Search</span>
                    <span className="font-bold text-slate-800">{(8 * currFilter.seoVol).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">Sessões</span></span>
                 </div>
                 <div className="flex justify-between items-center text-sm pb-1">
                    <span className="font-semibold text-slate-600">Direto / Desconhecido</span>
                    <span className="font-bold text-slate-800">{(54 * currFilter.seoVol).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">Sessões</span></span>
                 </div>
              </div>
           </div>
         );
         break;
      case 'VIEW_AEO_DRILLDOWN':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Bot className="w-4 h-4 text-purple-600"/> Answer Engine Tracking Limit</h4>
              <div className="bg-purple-50 text-purple-800 p-4 rounded-xl text-sm leading-relaxed border border-purple-100">
                O índice de <strong>Visibilidade AEO (Answer Engine Optimization)</strong> cruza citações do domínio e menções positivas através da API do Perplexity e de simulações sistêmicas feitas pela Canopi em prompts do ChatGPT visando suas Keywords Core.
              </div>
              <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-lg shadow-sm" onClick={() => setModalOpen(false)}>Visualizar Histórico de Prompts</button>
           </div>
         );
         break;
      case 'VIEW_HANDRAISERS':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><HandMetal className="w-4 h-4 text-amber-600"/> Filtro de Hand-Raisers</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">A conta de "Hand-Raisers" inclui apenas Leads qualificadissimos (High Intent) que pediram uma Demo, preencheram formulário de contato ativo (Fale Conosco) ou realizaram Trials originados da Busca Orgânica ou LLMs.</p>
              <div className="grid grid-cols-2 gap-3 mb-2">
                 <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-blue-700">{Math.round(412 * currFilter.inbVol)}</span>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mt-1">Demos Agendadas</span>
                 </div>
                 <div className="p-3 bg-white border border-slate-200 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-emerald-600">{Math.round(89 * currFilter.inbVol)}</span>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mt-1">Contatos (ICP)</span>
                 </div>
              </div>
           </div>
         );
         break;
      case 'EXPORT_DATA':
         contentNode = (
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                 <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Exportar Data Lake de Performance</h4>
              <p className="text-sm text-slate-500 px-4">Esta ação compilará os logs de acesso orgânico, cruzamentos de IP x Empresas (Clearbit/Canopi) e referências de AEO num CSV detalhado.</p>
              <div className="pt-2 w-full max-w-xs mx-auto">
                 <button className="w-full bg-blue-700 text-white font-bold py-3 text-sm rounded-xl shadow-md hover:bg-blue-800" onClick={() => setModalOpen(false)}>Confirmar Download (214 MB)</button>
              </div>
           </div>
         );
         break;
      case 'PAGE_AUDIT':
         contentNode = (
           <div className="space-y-3">
              <h4 className="font-bold text-slate-800 mb-2">Editor de Conteúdo Híbrido</h4>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tags Críticas de AEO/SEO Detectadas na URL:</label>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2 mt-2">
                 <div className="text-xs text-emerald-400 font-mono flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> &lt;meta name="robots" content="index, follow, max-snippet:-1" /&gt;</div>
                 <div className="text-xs text-blue-400 font-mono flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> &lt;script type="application/ld+json"&gt;FAQPage...</div>
                 <div className="text-xs text-rose-400 font-mono flex items-center gap-2">Erro: Faltam Author Credentials e EEAT signals nítidos.</div>
              </div>
           </div>
         );
         break;
      case 'RANK_TRACKER':
         contentNode = (
           <div className="space-y-4">
             <h4 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600"/> Keyword Rank Tracker Deep-Dive</h4>
             <table className="w-full text-left text-sm mt-4 border border-slate-200 rounded-lg overflow-hidden">
                <thead><tr className="bg-slate-50"><th className="p-3 border-b text-xs text-slate-500">Concorrente</th><th className="p-3 border-b text-xs text-slate-500">Posição Atual (SERP)</th></tr></thead>
                <tbody>
                   <tr><td className="p-3 border-b font-medium text-slate-800">canopi.com.br</td><td className="p-3 border-b"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Pos. 2</span></td></tr>
                   <tr><td className="p-3 border-b font-medium text-slate-500">hubspot.com</td><td className="p-3 border-b"><span className="text-slate-500 font-bold">Pos. 3 (-1)</span></td></tr>
                   <tr><td className="p-3 font-medium text-slate-500">pipedrive.com.br</td><td className="p-3"><span className="text-slate-500 font-bold">Pos. 5</span></td></tr>
                </tbody>
             </table>
           </div>
         );
         break;

      case 'CRO_LPs':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-blue-600"/> Mapa de Calor de Conversão</h4>
              <p className="text-sm text-slate-600">As Landing Pages com foco em "Enterprise" estão 22% abaixo do benchmark. Demos estão se perdendo no formulário estendido.</p>
              <button className="w-full text-xs font-bold bg-blue-50 text-blue-700 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors" onClick={() => setModalOpen(false)}>Integrar com Hotjar / Clarity</button>
           </div>
         );
         break;
      case 'YOUTUBE':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Youtube className="w-4 h-4 text-rose-600"/> Dark Funnel (YouTube)</h4>
              <p className="text-sm text-slate-600 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">Visualização do "Watch Time" cruzado com o pipeline B2B. O vídeo de "Product Tour" influenciou R$ 1.2M do seu pipeline orgânico de Janeiro.</p>
           </div>
         );
         break;
      case 'LINKEDIN':
         contentNode = (
           <div className="space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-600"/> Employee Advocacy Tracker</h4>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-slate-700 font-medium">O rastreio de menções via CRM indica que <strong>118 Leads</strong> ouviram falar da Canopi através do seu CEO e Top Voices internos antes de pesquisar o nome da marca no Google clássico.</p>
              </div>
           </div>
         );
         break;

      default:
        contentNode = (
          <p className="text-sm font-medium text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            Ação dinâmica acionada no componente isolado.
          </p>
        );
    }

    setModalData({ title, content: contentNode });
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Orgânica</h1>
          <p className="text-slate-500 text-sm font-medium mt-1 max-w-2xl leading-relaxed">
            Unificação do seu Growth. Monitore SEO Clássico, visibilidade AEO/GEO de Inteligências Artificiais, e converta tráfego com Hand-Raisers diretamente para o pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={cycleTimeFilter}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-slate-50 transition-colors shadow-sm group relative"
          >
            <Calendar className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="w-32 text-center">{currFilter.label}</span>
          </button>
          <button 
            onClick={() => openSimModal('Configurador de Answer Engines', 'NOVA_OTIMIZACAO')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-lg text-xs font-bold text-emerald-400 hover:bg-black transition-colors shadow-md shadow-emerald-700/20 group border border-slate-800"
          >
            <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Nova Otimização AEO
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) - SEO / GEO / AIO / INBOUND MIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: TRAFEGO (SEO Metric) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-blue-300" onClick={() => openSimModal('Tráfego Orgânico: Drilldown', 'VIEW_TRAFFIC_DRILLDOWN')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currFilter.seoVol >= 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {(12.4 + currFilter.rateDiff * 2).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Crescimento Orgânico</p>
          <h3 className="text-2xl font-bold text-slate-900">{(142.8 * currFilter.seoVol).toFixed(1)}k</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Sessões totais (Search + Direto)</p>
        </div>

        {/* Card 2: AEO VISIBILITY (AI Metric) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-purple-300" onClick={() => openSimModal('Visibilidade em LLMs', 'VIEW_AEO_DRILLDOWN')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <Cpu className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currFilter.inbVol >= 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {(5.2 + currFilter.rateDiff).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Visibilidade AEO/AIO</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(24.8 * currFilter.seoVol)}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Citações em LLMs & SGE</p>
        </div>

        {/* Card 3: HAND RAISERS (Inbound High-Intent) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer hover:border-amber-300" onClick={() => openSimModal('Hand-Raisers Drilldown', 'VIEW_HANDRAISERS')}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <HandMetal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              {(+8.8 + Math.abs(currFilter.rateDiff/2)).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Levantadas de Mão</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(501 * currFilter.inbVol)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Demos + Formulários Orgânicos</p>
        </div>

        {/* Card 4: OPPORTUNIDADES (Pipeline Impact) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Layers className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currFilter.inbVol >= 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {(8.1 + currFilter.rateDiff * 1.5).toFixed(1)}%
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Oportunidades</p>
          <h3 className="text-2xl font-bold text-slate-900">{Math.round(42 * currFilter.inbVol)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Origem do funil orgânico</p>
        </div>

        {/* Card 5 (Dark theme) PIPELINE */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden transition-all group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/50 border border-blue-500/50 text-white flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currFilter.inbVol >= 1 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'}`}>
                {(15.0 + currFilter.rateDiff * 3).toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pipeline Influenciado</p>
            <h3 className="text-2xl font-extrabold text-white">R$ {(4.2 * currFilter.inbVol).toFixed(1)}M</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Atribuição multitoque</p>
          </div>
        </div>

      </div>

      {/* Middle Section: Chart + Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Chart Area */}
        <div className="flex-[2] bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Share de Busca Baseado em Motores</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Tráfego oriundo de Busca Tradicional x Respostas por IA (AEO)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openSimModal('Exportar Data Lake', 'EXPORT_DATA')} className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors">Exportar</button>
              <button onClick={() => openSimModal('Search Console', 'GSC')} className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm">Ver GSC</button>
            </div>
          </div>

          <div className="relative h-[280px] w-full rounded-xl overflow-hidden mb-8 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {/* Stacked Area Chart to represent Search+AI mix */}
              <AreaChart data={basePerformanceData.map((d, i) => ({
                 name: d.name,
                 search: (d.search * currFilter.seoVol) + (Math.sin(i) * 1500 * (currFilter.seoVol > 1 ? 2 : 0.5)),
                 ai: (d.ai * currFilter.seoVol * 2.5) // Exaggerate AI growth visually
              }))}>
                <defs>
                   <linearGradient id="colorSeo" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                   </linearGradient>
                </defs>
                <Tooltip 
                   content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       return (
                         <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-bold shadow-2xl border border-slate-700 space-y-2">
                           <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Clássico</div>
                             <span className="text-slate-300">{Math.round(payload[0].value as number).toLocaleString('pt-BR')} vis</span>
                           </div>
                           <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> AI/SGE</div>
                             <span className="text-purple-300">{Math.round(payload[1].value as number).toLocaleString('pt-BR')} vis</span>
                           </div>
                         </div>
                       );
                     }
                     return null;
                   }}
                />
                <Area type="monotone" dataKey="search" stackId="1" stroke="#2563eb" strokeWidth={3} fill="url(#colorSeo)" dot={{ r: 0 }} activeDot={{ r: 5, fill: "#fff", stroke: "#2563eb" }} />
                <Area type="monotone" dataKey="ai" stackId="1" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorAi)" dot={{ r: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expanded Bottom Section: Assets, Keywords & Performance Grid */}
          <div className="border-t border-slate-100 pt-8 mt-4 flex-1 overflow-y-auto no-scrollbar">
            {/* Row 1: Authority Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10 px-2">
              {/* Left Column: Top Assets */}
              <div className="flex flex-col">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <BadgeCheck className="w-3 h-3 text-emerald-500" />
                  Assets de Maior Autoridade GEO
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: '/blog/guia-abm-2024', type: 'post', growth: 42 },
                    { label: '/produtos/inteligencia', type: 'pillar', growth: 18 },
                    { label: '/blog/maquina-de-vendas', type: 'post', growth: 12 },
                    { label: '/ebook/estrategia-gep', type: 'off-page', growth: 8 },
                    { label: '/solucoes/enterprise', type: 'pillar', growth: 25 },
                  ].map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors cursor-pointer" onClick={() => openSimModal('Auditoria SEO Estrutural', 'PAGE_AUDIT')}>
                      <div className="flex items-center gap-3">
                        {asset.type === 'pillar' ? <Globe className="w-3.5 h-3.5 text-blue-500" /> : <Bot className="w-3.5 h-3.5 text-emerald-500" />}
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{asset.label}</span>
                      </div>
                      <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">+{(asset.growth + currFilter.rateDiff).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Keywords */}
              <div className="flex flex-col">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Search className="w-3 h-3 text-blue-500" />
                  Keywords em SGE & Search
                </p>
                <div className="space-y-1.5">
                  {[
                    { kw: "software abm b2b", pos: "4", trend: "+2", color: "text-emerald-500" },
                    { kw: "revenue ops ai", pos: "2", trend: "=", color: "text-slate-400" },
                    { kw: "inteligência de vendas", pos: "8", trend: "-1", color: "text-rose-500" },
                    { kw: "plataforma de sdr b2b", pos: "14", trend: "+4", color: "text-emerald-500" },
                    { kw: "automação marketing b2b", pos: "1", trend: "+1", color: "text-emerald-300" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors cursor-pointer" onClick={() => openSimModal('Posicionamentos da Keyword', 'RANK_TRACKER')}>
                      <div className="flex items-center gap-3">
                        <TrendingUp className={`w-3.5 h-3.5 ${item.trend.includes('-') ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">"{item.kw}"</span>
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-500">Pos. {item.pos} <span className={`${item.color} ml-1 font-extrabold`}>({item.trend})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Visual High-Performance Grid */}
            <div className="px-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Destaques de Performance (Posts & LPs)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[
                  { title: "Futuro do ABM e AGI", cat: "Blog Post", views: "12.4k", conv: "3.2%", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=240&h=160" },
                  { title: "Demo: Inteligência Canopi", cat: "Landing Page", views: "8.1k", conv: "14.5%", img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=240&h=160" },
                  { title: "ROI de Vendas Analytics", cat: "Blog Post", views: "5.8k", conv: "2.1%", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=240&h=160" },
                ].map((post, idx) => (
                  <div key={idx} className="group bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden hover:border-blue-200 transition-all cursor-pointer shadow-sm" onClick={() => openSimModal(post.title, 'PAGE_AUDIT')}>
                    <div className="relative h-32 w-full overflow-hidden">
                      <img src={post.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold text-slate-700 uppercase shadow-sm border border-slate-200">{post.cat}</div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sessões</span>
                          <span className="text-xs font-extrabold text-slate-700">{post.views}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Conv.</span>
                          <span className="text-xs font-extrabold text-emerald-600">{post.conv}</span>
                        </div>
                        <div className="ml-auto flex -space-x-2">
                           {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-500 shrink-0">B{i}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Elements */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[400px]">
          
          {/* Insights Agênticos (Dark Profile) */}
          <div className="flex-[1.5] bg-slate-900 rounded-3xl p-7 shadow-lg relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-screen animate-pulse"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 bg-slate-800/50 p-2 pr-4 rounded-full border border-slate-700/50 w-fit">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                   <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm tracking-wide">Modelagem e Otimização Agêntica</h3>
              </div>
              
              <div className="space-y-4">
                {/* Insight 1: GEO Anomaly */}
                <div className="bg-[#111827] border border-blue-900/50 p-5 rounded-2xl hover:border-blue-700 transition-colors">
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div> Anomalia AEO/Schema</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed mb-5">
                    14 URls sem JSON-LD FAQ/HowTo Schemas. Isso quebra as respostas na SGE e ChatGPT para o Cluster de "Enterprise".
                  </p>
                  <button onClick={() => openSimModal('Investigação de SEO Estrutural', 'INVESTIGAR_SITEMAP')} className="text-[10px] w-full py-2 bg-blue-600/20 rounded-lg border border-blue-500/30 font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600/40 transition-colors">
                    Investigar / Corrigir <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Insight 2: ABM Hand Raiser Opportunity */}
                <div className="bg-[#111827] border border-emerald-900/50 p-5 rounded-2xl hover:border-emerald-700 transition-colors">
                  <div className="flex flex-col gap-2 mb-3">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_#10b981]"></div> Levantada de Mão (Intent)</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed mb-5">
                    A página "ROI de Vendas" registrou o formulário de um C-Level logado <strong className="text-white">Conta Tier 1 IBM Brasil</strong>.
                  </p>
                  <button onClick={() => openSimModal('Criar Ponte Agêntica entre SEO e Outbound', 'SDR_PLAY')} className="text-[10px] w-full py-2 bg-emerald-600/10 rounded-lg border border-emerald-500/20 font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600/30 transition-colors">
                    Rotear Fast-Lane (SDR) <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Saúde de Inbound/Handraisers (Light) */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all">
             <div className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer shadow-sm" onClick={() => openSimModal('Metas de Perfomance Inbound', 'METAS')}>
               <Plus className="w-4 h-4" />
             </div>
             <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Eficiência de Respostas Inbound</p>
             <div className="space-y-6">
               <div>
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-slate-700">Hand-Raisers em Conversão</span>
                     <span className="text-sm font-extrabold text-blue-700">82%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: '82%'}}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-slate-700">LP Authority Score (AEO)</span>
                     <span className="text-sm font-extrabold text-emerald-600">{(62.4 + currFilter.rateDiff).toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{width: `${62.4 + currFilter.rateDiff}%`}}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-end mb-2 cursor-pointer group" onClick={() => openSimModal('Auditoria CRO de LPs', 'CRO_LPs')}  >
                     <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors"><MousePointer2 className="w-3.5 h-3.5"/> Taxa de Conversão (CRO LPs)</span>
                     <span className="text-sm font-extrabold text-blue-700">14.5%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: '14.5%'}}></div>
                  </div>
               </div>
             </div>
          </div>

          {/* Social & Youtube Auxiliares */}
          <div className="bg-slate-50 p-7 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden transition-all">
             <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-5">Pesquisa Oculta & Auxiliares</p>
             <div className="space-y-4">
                <div className="bg-white border border-rose-100 p-4 rounded-2xl hover:border-rose-300 transition-colors cursor-pointer group" onClick={() => openSimModal('YouTube Analytics', 'YOUTUBE')}  >
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5"><Youtube className="w-4 h-4 text-rose-600"/> Youtube Inbound</span>
                   </div>
                   <p className="text-xl font-bold text-slate-900 mt-2">{Math.round(42 * currFilter.inbVol)} <span className="text-[10px] uppercase text-slate-500 font-extrabold ml-1">Leads via Video</span></p>
                </div>
                <div className="bg-white border border-blue-100 p-4 rounded-2xl hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => openSimModal('LinkedIn Dark Social', 'LINKEDIN')}  >
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><Linkedin className="w-4 h-4 text-blue-600"/> LinkedIn (Dark Social)</span>
                   </div>
                   <p className="text-xl font-bold text-slate-900 mt-2">{Math.round(118 * currFilter.inbVol)} <span className="text-[10px] uppercase text-slate-500 font-extrabold ml-1">Menções Validadas</span></p>
                </div>
             </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Table Area (Impacto Inbound ABM) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Hand-Raisers e Materiais Consumidos por Contas Alvo</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Veja quais otimizações de SEO e levantadas de mão conectam diretamente com o pipeline.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
               <button className="px-5 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm">Todas</button>
               <button className="px-5 py-2 text-slate-500 text-xs font-bold rounded-lg hover:text-slate-800 transition-colors">AEO/SGE</button>
             </div>
             
             <div className="relative group">
               <select className="appearance-none flex items-center gap-2 pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors outline-none cursor-pointer shadow-sm">
                 <option>Formatos</option>
                 <option>AEO Articles</option>
                 <option>Pillar Pages</option>
               </select>
               <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
             </div>

             {/* Search */}
             <div className="relative">
               <input 
                 type="text" 
                 placeholder="Buscar influência..." 
                 className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all shadow-sm"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-8 pr-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Conta ABM Match</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ativo Gerador (GEO/Inbound)</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Signals</th>
                <th className="px-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fase Alvo</th>
                <th className="pr-8 pl-4 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Intervenção de Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {impactTableData.map(row => (
                <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="pl-8 pr-4 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100/80 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center shadow-sm">
                        {row.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{row.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{row.details}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-bold text-slate-800 mb-1">{row.contentTitle}</p>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-700 flex items-center gap-1">
                      {row.contentType.includes('AEO') && <Bot className="w-3 h-3 text-purple-600"/> }
                      {row.contentType.includes('SEO') && <Globe className="w-3 h-3 text-blue-600"/> }
                      {row.contentType}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-inner cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => openSimModal('Listagem de Logs Comportamentais', 'VIEW_HANDRAISERS')}>
                      <Ghost className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{Math.max(1, Math.round(row.baseEngagement * currFilter.inbVol))}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                     <select className={`px-2 py-1 text-[9px] font-extrabold rounded-md border tracking-widest uppercase cursor-pointer outline-none appearance-none ${row.stageBg}`}>
                       <option>{row.stage}</option>
                       <option>CONSCIENTIZAÇÃO</option>
                       <option>CONSIDERAÇÃO</option>
                       <option>DECISÃO</option>
                       <option>HAND RAISER</option>
                     </select>
                  </td>
                  <td className="pr-8 pl-4 py-5 text-center">
                    <button className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50" onClick={() => openSimModal('Executar Ação de Hand-Raiser', 'SDR_PLAY')}>
                      {row.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30">
            <p className="text-[11px] font-semibold text-slate-400">Dados rastreados unindo sessões limpas orgânicas, citações sistêmicas (SGE) e conversões nominais.</p>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'System Core'}
      >
        <div className="py-2">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};


export default SeoInbound;
