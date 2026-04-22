'use client';

import React, { useState } from 'react';
import {
  Search, Bell, Settings, Home, List, PieChart, Users, ChevronDown,
  Sparkles, CheckCircle2, ChevronRight, Share2, MessageSquare, Heart, Bookmark, Zap, Activity, AlertTriangle, Target, Link, Globe
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import DecisionMindMap from '../components/DecisionMindMap';

const polar = (r, deg) => {
  const rad = (deg - 90) * Math.PI / 180.0;
  return { x: 600 + r * Math.cos(rad), y: 600 + r * Math.sin(rad) };
};

const arcPath = (rInner, rOuter, startDeg, endDeg) => {
  if (endDeg - startDeg <= 0) return '';
  const p1 = polar(rInner, startDeg);
  const p2 = polar(rInner, endDeg);
  const p3 = polar(rOuter, endDeg);
  const p4 = polar(rOuter, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M${p1.x},${p1.y} A${rInner},${rInner} 0 ${largeArc},1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${rOuter},${rOuter} 0 ${largeArc},0 ${p4.x},${p4.y} Z`;
};

const getArcCenter = (rInner, rOuter, startDeg, endDeg) => {
  const rMid = (rInner + rOuter) / 2;
  const degMid = (startDeg + endDeg) / 2;
  return polar(rMid, degMid);
};

const motorsData = [
  {
    id: "abm", name: "ABM",
    hex: "#4338ca", bgSlate: "bg-indigo-900",
    status: "Crítico", signalCount: 14, icon: Target,
    kpis: ["3 Tier A offline", "4 Sponsors perdidos", "Cobertura: 32%"],
    risk: "Sponsors Tier A sem follow-up há >15d.",
    opportunity: "Retarget de decisores frios na conta Acme.",
    nextMove: "Reengajar Sponsor Principal",
    sources: ["Salesforce", "LinkedIn", "Clearbit"],
    items: ["Estratégia Tier A", "Oport. Globex", "Aberturas Acme", "Sponsors Hooli"],
    sublayer: ["Contratos ABM", "Mapeamento Sponsor", "Risco Pipeline", "Expansão Contas"],
  },
  {
    id: "abx", name: "ABX",
    hex: "#6d28d9", bgSlate: "bg-violet-900",
    status: "Alerta", signalCount: 22, icon: List,
    kpis: ["7 Plays Ativos", "12 Contas no-play", "Ativação: 48%"],
    risk: "Queda na conversão de Plays Enterprise.",
    opportunity: "Orquestrar contas alta intenção sem plays.",
    nextMove: "Ativar Playbook Intenção",
    sources: ["HubSpot", "6sense", "Canopi"],
    items: ["Plays Scale MM", "Intent Surge", "Camp. Retenção", "Maturidade Q3"],
    sublayer: ["Ativação de Plays", "Identific. Lacunas", "Maturidade Tecnológica", "Orquestração Dinâmica"],
  },
  {
    id: "paga", name: "Mídia Paga",
    hex: "#1d4ed8", bgSlate: "bg-blue-900",
    status: "Estável", signalCount: 9, icon: Search,
    kpis: ["CAC R$ 2.4k", "ROI +12%", "3 Ads Saturados"],
    risk: "Desperdício em cluster SMB B2C.",
    opportunity: "Realocar budget excedente para Top Tier B2B.",
    nextMove: "Escalar Campanhas ABM",
    sources: ["LinkedIn Ads", "Google Ads", "Meta"],
    items: [],
    sublayer: ["Monitor Campanhas", "Clusters Perfil B2B", "Otimização LTV/CAC", "Eficiência Custo Aquisição"],
  },
  {
    id: "organico", name: "Orgânico",
    hex: "#047857", bgSlate: "bg-emerald-900",
    status: "Crescente", signalCount: 17, icon: Globe,
    kpis: ["+15% Tráfego B2B", "+4 Posições Top3", "Alta Intenção"],
    risk: "Perda de posição na key 'B2B CRM'.",
    opportunity: "Capitalizar termo 'AI Revenue' com assets.",
    nextMove: "Revisar Cluster Estratégico",
    sources: ["Google Search", "Semrush", "Analytics"],
    items: [],
    sublayer: ["Ativos Institucionais", "Performance SERP", "Sinais de Busca", "Trafego Especializado"],
  },
  {
    id: "outbound", name: "Outbound",
    hex: "#b45309", bgSlate: "bg-amber-900",
    status: "Atenção", signalCount: 31, icon: Share2,
    kpis: ["14 Cadências", "Rep. 4%", "12 SLA Quebrados"],
    risk: "Follow-up atrasado no cluster Mid-Market.",
    opportunity: "Respostas mornas podem virar reuniões com call ágil.",
    nextMove: "Forçar Follow-ups",
    sources: ["Apollo", "SalesLoft", "Gmail"],
    items: ["Cad. Liderança", "Operador Inativo", "SLA Vencendo", "Replies Mornas", "Bounce Rate"],
    sublayer: ["Cadências Ativas", "Produtividade Time", "SLA & Repostas", "Controle SPAM"],
  }
];

const CockpitV2 = () => {
  const [hoveredMotor, setHoveredMotor] = useState<string | null>(null);
  const [pinnedMotor, setPinnedMotor] = useState<string | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const activeFocus = pinnedMotor || hoveredMotor;
  const currentMotor = activeFocus ? motorsData.find(m => m.id === activeFocus) : null;

  const totalSignals = motorsData.reduce((acc, m) => acc + m.signalCount, 0);
  let currentStart = 0;
  const dynamicallyMap = motorsData.map((motor) => {
    const weight = motor.signalCount / totalSignals;
    const minSweep = 45; 
    let sweep = weight * 360;
    if (sweep < minSweep) sweep = minSweep;
    return { ...motor, weight, rawSweep: sweep };
  });

  const rawTotal = dynamicallyMap.reduce((acc, m) => acc + m.rawSweep, 0);
  const motorsRenderData = dynamicallyMap.map((motor) => {
    const sweep = (motor.rawSweep / rawTotal) * 360;
    const start = currentStart;
    const end = start + sweep;
    currentStart = end;
    return { ...motor, startDeg: start, endDeg: end, sweep };
  });

  const handleMouseMove = (e: any) => {
     setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getRotationCenter = (startDeg: number, endDeg: number) => {
    return (startDeg + endDeg) / 2;
  };

  const getSafeTextAngle = (angle: number) => {
    if (angle > 90 && angle < 270) {
      return angle + 180;
    }
    return angle;
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Sidebar onNewCampaign={() => {}} />

      <div className="flex-1 flex flex-col ml-60 h-screen overflow-y-auto w-full">
        <Topbar />
        
        <main className="w-full max-w-[1700px] mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-700" onMouseMove={handleMouseMove} onClick={() => {if(hoveredMotor === null && pinnedMotor) setPinnedMotor(null)}}>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden gap-6">
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">System Overview</h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Cross-Intelligence Cockpit</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed max-w-xl">
                A Canopi monitora continuamente a saúde da sua geração de receita cruzando sinais orgânicos vindos de todas as suas frentes dimensionais ativas.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 z-10 w-full md:w-auto">
              <Button className="w-full bg-slate-900 rounded-lg text-white font-bold hover:bg-slate-800 shadow-md h-auto py-2.5 text-xs">Exibir Sugestões</Button>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { value: '143', label: 'Sinais Criticos', sub: 'Últimas 24h', borderColor: 'border-slate-800', dot: 'bg-slate-800' },
                { value: 'R$ 4.2M', label: 'Pipeline Exposto', sub: 'Riscos Sem Play', borderColor: 'border-red-600', dot: 'bg-red-600' },
                { value: '18', label: 'Ações Prioritárias', sub: 'Fila de Orquestração', borderColor: 'border-slate-600', dot: 'bg-slate-600' },
                { value: '32', label: 'Contas em Risco', sub: 'Atenção Sponsor', borderColor: 'border-amber-500', dot: 'bg-amber-500' },
                { value: '98%', label: 'Sincronização', sub: 'Cobertura Dados', borderColor: 'border-slate-400', dot: 'bg-slate-400' }
              ].map((card, i) => (
                <Card key={i} className={`p-4 border-t-2 ${card.borderColor} shadow-sm flex flex-col items-start justify-center`}>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${card.dot}`} /> {card.label}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{card.value}</h4>
                  <p className="text-[10px] font-bold text-slate-400">{card.sub}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CENTRAL BLOCK - Layout dinâmico em Grid em vez de Absolute */}
          <div className="pt-24 pb-20 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.8fr_1fr] gap-4 md:gap-8 items-center min-h-[80vh] relative">
            
            {/* ONION GRAPH */}
            <div className="w-full flex justify-center items-center relative transform md:scale-[0.85] lg:scale-95 xl:scale-[1.05] 2xl:scale-[1.10] transition-transform">
              
              <div className="w-[100%] max-w-[1400px] aspect-square relative" onMouseLeave={() => setHoveredSlice(null)}>
                <svg viewBox="0 0 1200 1200" className="w-full h-full drop-shadow-2xl" style={{ overflow: 'visible' }}>

                  {motorsRenderData.map((motor, idx) => {
                    const isFocus = activeFocus === motor.id;
                    const opacityMod = activeFocus ? (isFocus ? 1 : 0.08) : 0.8;
                    const pad = 1.0;
                    const mStart = motor.startDeg + pad;
                    const mEnd = motor.endDeg - pad;
                    const hasItemsLayer = motor.items.length > 0;
                    
                    return (
                      <g key={motor.id} 
                         style={{ opacity: opacityMod, transition: 'opacity 0.2s', cursor: 'pointer' }}
                         onMouseEnter={() => setHoveredMotor(motor.id)}
                         onMouseLeave={() => setHoveredMotor(null)}
                         onClick={(e) => { e.stopPropagation(); setPinnedMotor(motor.id === pinnedMotor ? null : motor.id); }}
                      >
                        
                        <path d={arcPath(120, 240, mStart, mEnd)} 
                              fill={motor.hex} fillOpacity={0.15} stroke="#ffffff" strokeWidth="6" 
                              className={`transition-all duration-300 ${pinnedMotor === motor.id ? 'stroke-slate-900 border-[8px]' : ''}`}
                        />
                        
                        <foreignObject 
                            x={getArcCenter(120, 240, mStart, mEnd).x - 60} 
                            y={getArcCenter(120, 240, mStart, mEnd).y - 25} 
                            width="120" height="50"
                            transform={`rotate(${getSafeTextAngle(getRotationCenter(mStart, mEnd))}, ${getArcCenter(120, 240, mStart, mEnd).x}, ${getArcCenter(120, 240, mStart, mEnd).y})`}
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-slate-900 text-lg font-black tracking-widest" style={{ color: motor.hex }}>{motor.name}</span>
                          </div>
                        </foreignObject>

                        {motor.sublayer.map((sub, i) => {
                           const sliceSweep = (motor.sweep - (pad*2)) / motor.sublayer.length;
                           const sStart = mStart + (i * sliceSweep);
                           const sEnd = sStart + sliceSweep;
                           const outerR = hasItemsLayer ? 380 : 540;
                           const localVol = Math.max(1, Math.floor(motor.signalCount / motor.sublayer.length));

                           // Matemática para forçar line-break exato no espaço útil: (arcLen * ~0.8)
                           const rMidInner = (240 + outerR) / 2;
                           const safeWidthInner = Math.max(40, ((sliceSweep * Math.PI) / 180) * rMidInner * 0.85);

                           return (
                             <g key={`l2-${i}`}
                                onMouseEnter={() => setHoveredSlice({ 
                                   motorName: motor.name,
                                   prompt: `Módulo Tático Associado: ${sub}`,
                                   type: 'Sublayer Metrics',
                                   source: 'Arquitetura Interna',
                                   payload: `Distribuição volumétrica correspondente à arquitetura lógica do motor.`,
                                   valueInfo: `${localVol} Entidades Analisadas`,
                                   status: motor.status
                                })}
                             >
                               <path d={arcPath(240, outerR, sStart, sEnd)} fill={motor.hex} fillOpacity={isFocus ? 0.30 : 0.20} stroke="#ffffff" strokeWidth="4" />
                               <foreignObject 
                                  x={getArcCenter(240, outerR, sStart, sEnd).x - safeWidthInner/2} 
                                  y={getArcCenter(240, outerR, sStart, sEnd).y - 30} 
                                  width={safeWidthInner} height="60"
                                  transform={`rotate(${getSafeTextAngle(getRotationCenter(sStart, sEnd))}, ${getArcCenter(240, outerR, sStart, sEnd).x}, ${getArcCenter(240, outerR, sStart, sEnd).y})`}
                               >
                                 <div className="w-full h-full flex flex-col items-center justify-center text-center pointer-events-none p-0 overflow-hidden">
                                   <span className="text-slate-900 text-[12px] font-black leading-[1.1] break-words">{sub}</span>
                                   <span className="text-slate-600 font-bold text-[9px] bg-white/70 px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap mt-1">{localVol} CTXS</span>
                                 </div>
                               </foreignObject>
                             </g>
                           );
                        })}

                        {hasItemsLayer && motor.items.map((item, i) => {
                           const sliceSweep = (motor.sweep - (pad*2)) / motor.items.length;
                           const sStart = mStart + (i * sliceSweep);
                           const sEnd = sStart + sliceSweep;
                           const localSig = Math.max(1, Math.floor(motor.signalCount / motor.items.length));

                           const rMidOuter = (380 + 540) / 2;
                           const safeWidthOuter = Math.max(25, ((sliceSweep * Math.PI) / 180) * rMidOuter * 0.75);

                           return (
                             <g key={`l3-${i}`}
                                onMouseEnter={() => setHoveredSlice({ 
                                   motorName: motor.name,
                                   prompt: `Insight Específico: ${item}`,
                                   type: 'Entity Signal',
                                   source: motor.sources[0] || 'Integrado',
                                   payload: 'Célula operacional cruzando pontos de dados reais extraídos diretamente pelas fontes originais.',
                                   valueInfo: `${localSig} Ocorrências Singulares`,
                                   status: motor.status
                                })}
                             >
                               <path d={arcPath(380, 540, sStart, sEnd)} fill={motor.hex} fillOpacity={isFocus ? 0.20 : 0.12} stroke="#ffffff" strokeWidth="3" />
                               <foreignObject 
                                  x={getArcCenter(380, 540, sStart, sEnd).x - safeWidthOuter/2} 
                                  y={getArcCenter(380, 540, sStart, sEnd).y - 25} 
                                  width={safeWidthOuter} height="50"
                                  transform={`rotate(${getSafeTextAngle(getRotationCenter(sStart, sEnd))}, ${getArcCenter(380, 540, sStart, sEnd).x}, ${getArcCenter(380, 540, sStart, sEnd).y})`}
                               >
                                 <div className="w-full h-full flex flex-col items-center justify-center text-center pointer-events-none p-0 overflow-hidden">
                                   <span className="text-slate-800 text-[10px] font-bold leading-tight break-words">{item}</span>
                                 </div>
                               </foreignObject>
                             </g>
                           );
                        })}
                      </g>
                    );
                  })}
                </svg>
                
                <div className={`absolute inset-0 m-auto w-44 h-44 rounded-full shadow-2xl border-[8px] border-slate-100 flex flex-col items-center justify-center text-center p-4 transition-all duration-300 pointer-events-none z-10 ${pinnedMotor ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                  <Zap className={`w-8 h-8 mb-2 ${pinnedMotor ? 'text-white' : 'text-brand animate-pulse'}`} />
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] leading-tight ${pinnedMotor ? 'text-white' : 'text-slate-900'}`}>{pinnedMotor ? 'Trava Ativa' : 'Sync On'}</p>
                </div>
                
              </div>
            </div>

            {/* HOVER DARK TOOLTIP (Segue o mouse livremente) */}
            {hoveredSlice && (
              <div className="fixed z-50 bg-[#16181D] text-slate-200 p-5 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] pointer-events-none transform -translate-x-[110%] -translate-y-1/2 border border-slate-700/80 w-[420px]"
                  style={{ left: mousePos.x, top: mousePos.y }}>
                
                <h4 className="font-bold text-base text-white leading-snug mb-4 pb-4 border-b border-slate-700/60">{hoveredSlice.prompt}</h4>
                
                <div className="bg-[#20242B] rounded-xl p-4 mb-5 flex items-start gap-4 border border-slate-700/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="p-2.5 bg-slate-800 rounded-lg shrink-0">
                    <Target className="w-5 h-5 text-slate-200" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight mb-1">Métrica cruzada via <span className="font-bold text-indigo-400">{hoveredSlice.motorName}</span></p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{hoveredSlice.payload}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 pb-5 border-b border-slate-700/60">
                  <div className="flex justify-between items-center px-1">
                    <span className="font-medium text-slate-400 text-xs">Taxonomia Interna</span>
                    <span className="font-bold text-white text-xs bg-slate-800 px-2 py-1 rounded-md">{hoveredSlice.type}</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="font-medium text-slate-400 text-xs">Acesso Fonte</span>
                    <span className="font-bold text-white text-xs">{hoveredSlice.source}</span>
                  </div>
                  <div className="flex justify-between items-center px-1 mt-2 pt-2 border-t border-slate-800/50">
                    <span className="font-medium text-slate-500 text-[10px] uppercase tracking-widest">Peso Computado</span>
                    <span className="font-bold text-indigo-400 text-xs">{hoveredSlice.valueInfo}</span>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT PANEL - GRID LAYOUT (Não se sobrepõe) */}
            <div className="w-full flex justify-end z-20">
              <div className="w-full max-w-[600px] shadow-2xl rounded-3xl bg-white border border-slate-200 overflow-hidden transform transition-all duration-500 h-[750px] flex flex-col">
              {!currentMotor ? (
                // IDLE STATE
                <div className="flex-1 p-8 overflow-y-auto w-full">
                   <h4 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                     <Globe className="w-5 h-5 text-brand" /> Nenhum Motor Selecionado
                   </h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                     Passe o cursor sobre os quadrantes do gráfico à esquerda para investigar suas células contextuais, ou clique para isolar uma frente.
                   </p>
                </div>
              ) : (
                // ACTIVE STATE
                 <div className="flex-1 p-8 flex flex-col relative overflow-hidden bg-white w-full">
                   <div className="absolute -top-10 -right-10 w-48 h-48 opacity-10 rounded-full" style={{backgroundColor: currentMotor.hex}} />
                   
                   {pinnedMotor && (
                     <div className="absolute top-4 right-4 z-20 cursor-pointer p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => setPinnedMotor(null)}>
                       <span className="text-[10px] font-bold uppercase tracking-widest px-2 text-slate-800">Desfixar ✕</span>
                     </div>
                   )}

                   <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className="flex gap-4">
                       <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-lg ${currentMotor.bgSlate}`}>
                          <currentMotor.icon className="w-7 h-7" />
                       </div>
                       <div>
                         <h4 className="text-2xl font-black uppercase tracking-widest mb-1 text-slate-900" style={{color: currentMotor.hex}}>
                           {currentMotor.name}
                         </h4>
                         <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mt-1">
                           <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200 shadow-sm">{Math.round((currentMotor.signalCount / totalSignals)*100)}% Visibilidade Ativa</span>
                         </p>
                       </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                     {currentMotor.kpis.slice(0,2).map((kpi, i) => (
                       <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xs font-black text-slate-800 leading-tight block">{kpi}</span>
                       </div>
                     ))}
                   </div>

                   <div className="space-y-4 mb-8 flex-1 relative z-10 overflow-y-auto pr-2">
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                       <div className="flex items-center justify-between mb-3 pl-2">
                         <span className="text-[11px] uppercase tracking-widest font-black text-red-600">Alerta Estratégico Crítico</span>
                         <AlertTriangle className="w-5 h-5 text-red-400" />
                       </div>
                       <p className="text-sm text-slate-800 font-semibold pl-2 leading-relaxed">{currentMotor.risk}</p>
                     </div>
                     
                     <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                       <div className="flex items-center justify-between mb-3 pl-2">
                         <span className="text-[11px] uppercase tracking-widest font-black text-emerald-600">Oportunidade Expansível</span>
                         <Target className="w-5 h-5 text-emerald-400" />
                       </div>
                       <p className="text-sm text-slate-800 font-semibold pl-2 leading-relaxed">{currentMotor.opportunity}</p>
                     </div>
                   </div>

                   <div className="space-y-4 relative z-10 mt-auto pt-4 border-t border-slate-100">
                     <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Engenharia de Ação Imediata</p>
                     <Button className="w-full font-bold shadow-xl hover:-translate-y-1 transition-all text-sm py-6 text-white" style={{ backgroundColor: currentMotor.hex }}>
                       <Sparkles className="w-4 h-4 mr-2" /> Executar {currentMotor.nextMove}
                     </Button>
                     <div className="flex gap-3">
                       <Button variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 text-xs py-5 font-bold hover:bg-slate-50 shadow-sm">Abrir Detalhamento</Button>
                       <Button variant="outline" className="flex-1 bg-white border-slate-200 text-slate-700 text-xs py-5 font-bold hover:bg-slate-50 shadow-sm">Suspender Motor</Button>
                     </div>
                   </div>
                 </div>
              )}
              </div>
            </div>
            
          </div>
            {/* PLAYS E AÇÕES */}

            <div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">

                <Sparkles className="w-4 h-4 text-indigo-500" /> Ações Prioritárias

              </h3>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                <table className="w-full text-left">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Nome da Play</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Gatilho</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Status</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Motor</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {[1,2,3,4,5].map((i) => {

                      const motors = ['Mid-market Nurture', 'Recuperação Sponsor', 'Retarget C-Level', 'Abertura Account', 'Sinal de Concorrente'];

                      const source = ['ABX', 'ABM', 'Paga', 'Outbound', 'ABX'];

                      return (

                      <tr key={i} className="hover:bg-slate-50/50">

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-2 h-2 rounded-full bg-indigo-500" />

                            <span className="text-xs font-bold text-slate-700">{motors[i-1]} #{i}</span>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <span className="inline-flex border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600">

                            Dinâmico

                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">Ativa</span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-2">

                            <div className="w-5 h-5 rounded-full bg-indigo-100 border border-white shadow-sm flex items-center justify-center">

                                <Zap className="w-3 h-3 text-indigo-500" />

                            </div>

                            <span className="text-xs font-semibold text-slate-500">{source[i-1]}</span>

                          </div>

                        </td>

                      </tr>

                    );})}

                  </tbody>

                </table>

                

                {/* Purple Promo Banner inside table layout (as in reference) */}

                <div className="m-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 flex items-center justify-between">

                  <div>

                    <h4 className="font-black text-slate-900 mb-1">Ações Recomendadas (Intel)</h4>

                    <p className="text-sm text-slate-600 mb-4">Descubra novas automações de playbook cruzando sinais de todos os motores.</p>

                    <Button className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-4 py-1.5 h-auto">Orquestrar Agora</Button>

                  </div>

                  <div className="w-24 h-24 bg-purple-200/50 rounded-full flex items-center justify-center">

                     <Sparkles className="w-8 h-8 text-purple-600" />

                  </div>

                </div>

              </div>

            </div>

            {/* INTENT SEARCH (TABLE) */}

            <div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Sinais de Demanda Mídia/Orgânico</h3>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                 <table className="w-full text-left">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Palavra/Tópico</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Volume</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Intenção</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Tráfego B2B</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {['crm b2b enterprise', 'platarforma de lead scoring', 'account based marketing brasil', 'recuperação de churn mid-market'].map((kw, i) => (

                      <tr key={i} className="hover:bg-slate-50/50">

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <span className="text-xs font-bold text-slate-700 capitalize">{kw}</span>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{12400 - (i*1200)}</td>

                        <td className="px-6 py-4">

                           <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">

                             <div className="h-full bg-emerald-500" style={{ width: `${90 - i*15}%` }} />

                           </div>

                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{(2.4 - i*0.4).toFixed(1)}k</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* MAPA MENTAL DECISÓRIO - Substitui Ramificações Estratégicas Preditivas */}

            <div className="w-full h-[750px] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <DecisionMindMap />
            </div>

            {/* SOCIAL MEDIA (TABLE) */}

            <div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Sinais Sociais e Engajamento</h3>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                 <table className="w-full text-left">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Plataforma B2B</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Taxa de Engajamento</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Crescimento Identificado</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {['LinkedIn Institucional', 'Twitter / X', 'Eventos e Webinars'].map((plat, i) => (

                      <tr key={i} className="hover:bg-slate-50/50">

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <span className="text-xs font-bold text-slate-700">{plat}</span>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{(4.2 - i*0.8).toFixed(1)}%</td>

                        <td className="px-6 py-4">

                          <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">+{120 - i*20} / sem</span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* MESSAGING (TABLE) */}

            <div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Performance de Cadências e Follow-up</h3>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

                 <table className="w-full text-left">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Cadência Operacional</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Taxa de Abertura</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Taxa de Resposta</th>

                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-black text-slate-400">Status Operacional</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {['Contato Frio Estratégico', 'Nurture de Decisores', 'Recuperação de Churn'].map((camp, i) => (

                      <tr key={i} className="hover:bg-slate-50/50">

                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{camp}</td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{(48 - i*6).toFixed(1)}%</td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{(12 - i*2).toFixed(1)}%</td>

                        <td className="px-6 py-4">

                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${i === 2 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>

                            {i === 2 ? 'Alerta' : 'Saudável'}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          {/* DARK FOOTER */}

          <footer className="mt-16 bg-slate-900 rounded-3xl p-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 shadow-xl border border-slate-800">

             <div>

               <h3 className="text-white font-black text-lg mb-2">Precisa de assistência? Contacte a Mesa</h3>

               <p className="text-indigo-400 font-bold mb-4">squad@canopi.com.br</p>

               <p className="text-[10px] uppercase tracking-widest font-black">© 2026 Canopi. Intel Excels.</p>

             </div>

             <div className="flex gap-4 mt-6 md:mt-0 opacity-60">

                <Button variant="ghost" className="hover:bg-slate-800 hover:text-white p-2 h-auto"><List className="w-5 h-5"/></Button>

                <Button variant="ghost" className="hover:bg-slate-800 hover:text-white p-2 h-auto"><CheckCircle2 className="w-5 h-5"/></Button>

             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CockpitV2;
