'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Save, X, Info, Target, AlertCircle, CheckCircle2, TrendingUp, Zap, Clock, Users } from 'lucide-react';
import { signalSituations } from '../data/signalSituations';

const STAGES_X = [140, 440, 740, 1040, 1340, 1640, 1940];
const CANVAS_HEIGHT = 650;
const CENTER_Y = 325;
const CARD_WIDTH = 135;
const CARD_HEIGHT = 100;

const STAGE_MAP: Record<string, number> = {
  trigger: 0,
  signal1: 1, signal2: 1, signal3: 1,
  reading: 2,
  crit1: 3, crit2: 3, crit3: 3,
  decision: 4,
  opt1: 5, opt2: 5, opt3: 5,
  action: 6
};

const DecisionMindMap: React.FC = () => {
  const [revealLevel, setRevealLevel] = useState(0);
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);
  
  // INTERACTION STATES
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // DRAG STATE
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // OFFSETS State (for persistence and clean layout)
  const [offsets, setOffsets] = useState<Record<string, { x: number, y: number }>>({
    trigger: { x: 0, y: 0 },
    signal1: { x: 0, y: -110 }, signal2: { x: 0, y: 0 }, signal3: { x: 0, y: 110 },
    reading: { x: 0, y: 0 },
    crit1: { x: 0, y: -120 }, crit2: { x: 0, y: 0 }, crit3: { x: 0, y: 120 },
    decision: { x: 0, y: 0 },
    opt1: { x: 0, y: -120 }, opt2: { x: 0, y: 0 }, opt3: { x: 0, y: 120 },
    action: { x: 0, y: 0 },
  });

  // Current real-time offset Ref (to avoid React lag during drag)
  const offsetRef = useRef<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    offsetRef.current = { ...offsets };
  }, []); // Only once at init

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});

  const situation = signalSituations[0]; 

  const getNodeData = useCallback((id: string) => {
    switch (id) {
      case 'trigger': return { title: 'Risco de Churn', category: 'Trigger', icon: <Zap className="w-5 h-5" />, detail: situation.situationTitle, desc: situation.context, metric: 'Health: 22', status: 'Crítico' };
      case 'signal1': return { title: 'Queda de Uso', category: 'Signal', icon: < TrendingUp className="w-5 h-5 rotate-180 text-red-500" />, detail: situation.timeline[0].indicator, desc: situation.timeline[0].impact, metric: '-45%', status: 'Alerta' };
      case 'signal2': return { title: 'Champion Churn', category: 'Signal', icon: <Users className="w-5 h-5 text-orange-500" />, detail: situation.timeline[1].indicator, desc: situation.timeline[1].impact, metric: 'CFO Left', status: 'Crítico' };
      case 'signal3': return { title: 'Contract Risk', category: 'Signal', icon: <AlertCircle className="w-5 h-5 text-amber-500" />, detail: situation.timeline[4].indicator, desc: situation.timeline[4].impact, metric: '60 Days', status: 'Alerta' };
      case 'reading': return { title: 'Churn Preditivo', category: 'Analysis', icon: <Target className="w-5 h-5 text-blue-600" />, detail: 'Análise de Cluster FinanceFlow', desc: situation.decisionPoints[0].analysis, metric: '85% Prob.', status: 'Validado' };
      case 'crit1': return { title: 'Time Window', category: 'Factor', icon: <Clock className="w-5 h-5" />, detail: 'Janela de Intervenção', desc: 'A oportunidade de salvar a conta expira antes do próximo ciclo de faturamento.', metric: '14 Dias', status: 'Neutro' };
      case 'crit2': return { title: 'LTV/CAC', category: 'Factor', icon: <TrendingUp className="w-5 h-5" />, detail: 'Unit Economics', desc: 'O custo de reaquisição é 5.2x superior ao custo de retenção atual.', metric: '$28.8k ARR', status: 'Positivo' };
      case 'crit3': return { title: 'Network Effect', category: 'Factor', icon: <Info className="w-5 h-5" />, detail: 'Exposição de Cluster', desc: 'Esta conta é referência para o setor de Fintech; o churn impacta o branding regional.', metric: 'Alto Impacto', status: 'Neutro' };
      case 'decision': return { title: 'Strategy Choice', category: 'Decision', icon: <Target className="w-5 h-5" />, detail: situation.decisionPoints[0].title, desc: situation.decisionPoints[0].context, metric: 'Nível C', status: 'Pendente' };
      case 'opt1': return { title: 'C-Level Call', category: 'Option', icon: <Zap className="w-5 h-5" />, detail: situation.decisionPoints[0].options[0].option, desc: situation.decisionPoints[0].options[0].description, metric: '78% Success', status: 'Ideal' };
      case 'opt2': return { title: 'Tech Review', category: 'Option', icon: <Info className="w-5 h-5" />, detail: situation.decisionPoints[0].options[1].option, desc: situation.decisionPoints[0].options[1].description, metric: '35% Success', status: 'Baixo' };
      case 'opt3': return { title: 'Retention Pack', category: 'Option', icon: <TrendingUp className="w-5 h-5" />, detail: situation.decisionPoints[0].options[2].option, desc: situation.decisionPoints[0].options[2].description, metric: '72% Success', status: 'Financeiro' };
      case 'action': return { title: 'Materialize Play', category: 'Action', icon: <CheckCircle2 className="w-5 h-5" />, detail: situation.actionsTaken[0].action, desc: situation.actionsTaken[0].notes, metric: 'Immediate', status: 'Execução' };
      default: return { title: id, category: 'Node', detail: '', desc: '', metric: '', status: '' };
    }
  }, [situation]);

  const visibleCards = useMemo(() => {
    const cards = ['trigger'];
    if (revealLevel >= 1) cards.push('signal1', 'signal2', 'signal3');
    if (revealLevel >= 2) cards.push('reading');
    if (revealLevel >= 3) cards.push('crit1', 'crit2', 'crit3');
    if (revealLevel >= 4) cards.push('decision');
    if (revealLevel >= 5) cards.push('opt1', 'opt2', 'opt3');
    if (revealLevel >= 6) cards.push('action');
    return cards;
  }, [revealLevel]);

  // UI Pos for Render
  const layout = useMemo(() => {
    const res: Record<string, { x: number, y: number }> = {};
    visibleCards.forEach(id => {
      res[id] = {
        x: STAGES_X[STAGE_MAP[id]] + (offsets[id]?.x || 0),
        y: CENTER_Y + (offsets[id]?.y || 0)
      };
    });
    return res;
  }, [visibleCards, offsets]);

  const updateConnector = useCallback((fromId: string, toId: string) => {
    const path = pathRefs.current[`${fromId}-${toId}`];
    const fromEl = cardRefs.current[fromId];
    const toEl = cardRefs.current[toId];

    if (!path || !fromEl || !toEl || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollX = containerRef.current.scrollLeft;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = fromRect.left - containerRect.left + scrollX + fromRect.width;
    const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
    const x2 = toRect.left - containerRect.left + scrollX;
    const y2 = toRect.top - containerRect.top + toRect.height / 2;

    const dist = Math.max(20, Math.abs(x2 - x1));
    const cp1x = x1 + dist * 0.4;
    const cp2x = x2 - dist * 0.4;

    path.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`);
  }, []);

  const updateAllConnectors = useCallback(() => {
    if (revealLevel >= 1) { updateConnector('trigger', 'signal1'); updateConnector('trigger', 'signal2'); updateConnector('trigger', 'signal3'); }
    if (revealLevel >= 2) { updateConnector('signal1', 'reading'); updateConnector('signal2', 'reading'); updateConnector('signal3', 'reading'); }
    if (revealLevel >= 3) { updateConnector('reading', 'crit1'); updateConnector('reading', 'crit2'); updateConnector('reading', 'crit3'); }
    if (revealLevel >= 4) { updateConnector('crit1', 'decision'); updateConnector('crit2', 'decision'); updateConnector('crit3', 'decision'); }
    if (revealLevel >= 5 && chosenOptionIndex !== null) {
       const opt = `opt${chosenOptionIndex+1}`;
       updateConnector('decision', opt);
       if (revealLevel >= 6) updateConnector(opt, 'action');
    }
  }, [revealLevel, chosenOptionIndex, updateConnector]);

  useLayoutEffect(() => {
    updateAllConnectors();
    const h = requestAnimationFrame(updateAllConnectors);
    return () => cancelAnimationFrame(h);
  }, [updateAllConnectors, layout, revealLevel, chosenOptionIndex]);

  // DRAG LOGIC - SYNCED DOM UPDATE
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (!dragMoved && (dx > 5 || dy > 5)) setDragMoved(true);

      if (dragMoved || dx > 5 || dy > 5) {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollX = containerRef.current.scrollLeft;

        // 1. Calculate new real pos
        const targetX = (e.clientX - dragOffset.x) - containerRect.left + scrollX;
        const targetY = (e.clientY - dragOffset.y) - containerRect.top;

        // 2. Update Card DOM Directly (Absolute Rigidity)
        const cardEl = cardRefs.current[dragging];
        if (cardEl) {
           cardEl.style.left = `${targetX}px`;
           cardEl.style.top = `${targetY}px`;
        }

        // 3. Update Path DOM Directly (Zero Lag)
        updateAllConnectors();

        // 4. Track in Ref (to be synced on MouseUp)
        const baseColX = STAGES_X[STAGE_MAP[dragging]];
        offsetRef.current[dragging] = {
           x: Math.max(-150, Math.min(150, targetX - baseColX)),
           y: Math.max(-300, Math.min(300, targetY - CENTER_Y))
        };
      }
    };

    const handleMouseUp = () => {
      // Final Sync to React State to consolidate
      setOffsets({ ...offsetRef.current });
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, dragStartPos, dragMoved, updateAllConnectors]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = cardRefs.current[id]?.getBoundingClientRect();
    if (!rect) return;
    
    setDragging(id);
    setHoveredCard(null); // Block hover
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({ 
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2)
    });
    setDragMoved(false);
  };

  const dynamicWidth = STAGES_X[6] + 500;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 font-sans select-none">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
             <Target className="w-6 h-6 text-blue-400" />
          </div>
          <div>
             <h3 className="font-black text-sm text-slate-900 uppercase tracking-[0.2em] leading-tight">Canopi Intelligence Oracle</h3>
             <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Decision MindMap</span>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Account: FinanceFlow</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
             <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="flex -space-x-1.5">
                   {[...Array(revealLevel)].map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                   ))}
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Stage {revealLevel}/6</span>
             </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex bg-white">
        <div 
          className="flex-1 overflow-x-auto overflow-y-hidden bg-white relative custom-scrollbar flex" 
          ref={containerRef}
          onScroll={updateAllConnectors}
        >
          <div style={{ width: dynamicWidth, height: '100%', minWidth: dynamicWidth, position: 'relative' }}>
             <svg width={dynamicWidth} height={CANVAS_HEIGHT} className="absolute inset-0 block pointer-events-none z-0">
                <defs>
                   <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
                   </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridLarge)" />

                {/* Connectors */}
                {revealLevel >= 1 && (['signal1','signal2','signal3'].map(to => <path key={`trigger-${to}`} ref={el => { pathRefs.current[`trigger-${to}`] = el; }} fill="none" stroke="#64748b" strokeWidth="2" strokeOpacity="0.3" />))}
                {revealLevel >= 2 && (['signal1','signal2','signal3'].map(from => <path key={`${from}-reading`} ref={el => { pathRefs.current[`${from}-reading`] = el; }} fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.2" />))}
                {revealLevel >= 3 && (['crit1','crit2','crit3'].map(to => <path key={`reading-${to}`} ref={el => { pathRefs.current[`reading-${to}`] = el; }} fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.2" />))}
                {revealLevel >= 4 && (['crit1','crit2','crit3'].map(from => <path key={`${from}-decision`} ref={el => { pathRefs.current[`${from}-decision`] = el; }} fill="none" stroke="#f97316" strokeWidth="2.5" strokeOpacity="0.4" />))}
                {revealLevel >= 5 && chosenOptionIndex !== null && (<path ref={el => { pathRefs.current[`decision-opt${chosenOptionIndex+1}`] = el; }} fill="none" stroke="#22c55e" strokeWidth="3" strokeOpacity="0.6" />)}
                {revealLevel >= 6 && chosenOptionIndex !== null && (<path ref={el => { pathRefs.current[`opt${chosenOptionIndex+1}-action`] = el; }} fill="none" stroke="#2563eb" strokeWidth="4" strokeOpacity="0.9" />)}
             </svg>

             {/* NODES */}
             <div className="absolute inset-0 z-10 pointer-events-none">
                {visibleCards.map(id => {
                   const pos = layout[id];
                   const data = getNodeData(id);
                   const isHovered = hoveredCard === id;
                   const isSelected = selectedCard === id;
                   const active = dragging === id;
                   const isChosen = (id.startsWith('opt') && chosenOptionIndex === parseInt(id.replace('opt', '')) - 1);

                   return (
                      <div
                        key={id}
                        ref={el => { cardRefs.current[id] = el; }}
                        onMouseDown={e => handleMouseDown(e, id)}
                        onMouseEnter={() => !dragging && setHoveredCard(id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`pointer-events-auto absolute ${active ? 'z-[200]' : isSelected ? 'z-[150]' : isHovered ? 'z-[120]' : 'z-10'} ${active ? '' : 'transition-all duration-300'}`}
                        style={{
                           left: pos.x, top: pos.y, width: CARD_WIDTH, height: CARD_HEIGHT,
                           transform: `translate(-50%, -50%) ${active ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)'}`,
                           cursor: active ? 'grabbing' : 'grab'
                        }}
                      >
                         {/* TOOLTIP */}
                         {isHovered && !dragging && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl text-white text-[8px] font-black py-1.5 px-3 rounded-lg flex items-center gap-2 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Crítico' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`} />
                               <span className="uppercase tracking-widest">{data.category} • {data.status}</span>
                            </div>
                         )}

                         <div
                            onClick={() => {
                               if (!dragMoved) {
                                  setSelectedCard(id);
                                  if (id === 'trigger') setRevealLevel(1);
                                  else if (id.startsWith('signal')) setRevealLevel(2);
                                  else if (id === 'reading') setRevealLevel(3);
                                  else if (id.startsWith('crit')) setRevealLevel(4);
                                  else if (id === 'decision') setRevealLevel(5);
                                  else if (id.startsWith('opt')) { setChosenOptionIndex(parseInt(id.replace('opt', '')) - 1); setRevealLevel(6); }
                               }
                            }}
                            className={`w-full h-full rounded-[1.75rem] p-4 border-2 flex flex-col justify-between items-center text-center transition-all ${
                               isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)]' :
                               isChosen ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-[0_10px_25px_rgba(16,185,129,0.2)]' :
                               isHovered ? 'bg-white border-blue-400 shadow-[0_10px_30px_rgba(0,0,0,0.1)] scale-[1.02]' :
                               id === 'action' ? 'bg-slate-900 border-slate-800 text-white' :
                               id === 'trigger' ? 'bg-blue-50 border-blue-200 text-blue-900 font-black' :
                               'bg-white border-slate-100 text-slate-800 shadow-lg'
                            }`}
                         >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-slate-50 border border-slate-100 shadow-sm'}`}>
                               {data.icon}
                            </div>
                            <div className="flex flex-col gap-0.5">
                               <div className={`text-[10px] font-black uppercase tracking-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{data.title}</div>
                               <div className={`text-[7px] font-bold uppercase tracking-widest opacity-60 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{data.category}</div>
                            </div>
                            <div className={`text-[9px] font-black px-3 py-1 rounded-full ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                               {data.metric}
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* DRAWER */}
        {selectedCard && (
          <div className="absolute right-8 top-8 bottom-8 w-[340px] bg-white/98 backdrop-blur-2xl border border-slate-200 shadow-[0_40px_120px_rgba(37,99,235,0.2)] rounded-[3.5rem] flex flex-col overflow-hidden z-[500] animate-in slide-in-from-right duration-700">
             <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-10">
                   <button onClick={() => setSelectedCard(null)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                      <X className="w-6 h-6" />
                   </button>
                   <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex items-center gap-2">
                       <Zap className="w-3 h-3 text-blue-600" />
                       <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Intelligence Detail</span>
                   </div>
                </div>

                <div className="mb-8">
                   <h4 className="font-black text-2xl text-slate-900 leading-none uppercase tracking-tighter mb-2">{getNodeData(selectedCard).title}</h4>
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{getNodeData(selectedCard).category}</p>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info className="w-3 h-3" /> Contexto Operacional</p>
                      <p className="text-[12px] text-slate-800 font-bold leading-relaxed">{getNodeData(selectedCard).detail}</p>
                   </div>
                   <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">< Zap className="w-3 h-3" /> Impacto & Resumo</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{getNodeData(selectedCard).desc}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-blue-600 rounded-[1.5rem] text-white shadow-lg"><p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Métrica Core</p><p className="text-lg font-black">{getNodeData(selectedCard).metric}</p></div>
                      <div className="p-5 bg-slate-900 rounded-[1.5rem] text-white"><p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Status</p><p className="text-lg font-black">{getNodeData(selectedCard).status}</p></div>
                   </div>
                </div>
             </div>
             <div className="p-10 border-t border-slate-100 bg-white/50 backdrop-blur-md">
                 <button className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3"><Zap className="w-4 h-4 text-blue-400" /> Confirmar Tactical Action</button>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t border-slate-100 px-10 py-8 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-12">
            <div className="flex flex-col gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decision Stage Matrix</span>
               <div className="flex items-center gap-3">
                  {[0,1,2,3,4,5,6].map(i => (<div key={i} className={`h-2.5 rounded-full transition-all duration-1000 ${revealLevel >= i ? 'w-10 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'w-2.5 bg-slate-100'}`} />))}
               </div>
            </div>
         </div>
         <button disabled={chosenOptionIndex === null} className="relative flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_20px_60px_rgba(0,0,0,0.3)] active:scale-95 group overflow-hidden" onClick={() => { alert(`Intelligence Materialized and Synced to Core DB.`); }}>
           <Save className="w-4 h-4" /> <span>Finalize Strategic Action</span>
           <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
         </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 3px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default DecisionMindMap;
