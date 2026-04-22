'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { X, Info, Target, AlertCircle, CheckCircle2, TrendingUp, Zap, Clock, Users, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { SignalCase } from '../data/signalCases';

const STAGES_X = [140, 440, 740, 1040, 1340, 1640, 1940];
const CANVAS_HEIGHT = 650;
const CENTER_Y = 325;
const CARD_WIDTH = 135;
const CARD_HEIGHT = 100;

const STAGE_MAP: Record<string, number> = {
  signal: 0,
  evidence1: 1, evidence2: 1, evidence3: 1,
  timeline: 2,
  factor1: 3, factor2: 3, factor3: 3,
  decision: 4,
  opt1: 5, opt2: 5, opt3: 5,
  action: 6
};

interface NodeData {
  title: string;
  category: string;
  icon: React.ReactNode;
  detail: string;
  desc: string;
  metric: string;
  status: string;
}

interface DecisionMindMapProps {
  signalCase: SignalCase;
  onDecisionRecorded?: (entry: {
    stage: number;
    nodeId: string;
    nodeType: string;
    title: string;
    summary: string;
  }) => void;
}

const DecisionMindMap: React.FC<DecisionMindMapProps> = ({ signalCase, onDecisionRecorded }) => {
  const [revealLevel, setRevealLevel] = useState(0);
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [offsets, setOffsets] = useState<Record<string, { x: number, y: number }>>({
    signal: { x: 0, y: 0 },
    evidence1: { x: 0, y: -110 }, evidence2: { x: 0, y: 0 }, evidence3: { x: 0, y: 110 },
    timeline: { x: 0, y: 0 },
    factor1: { x: 0, y: -120 }, factor2: { x: 0, y: 0 }, factor3: { x: 0, y: 120 },
    decision: { x: 0, y: 0 },
    opt1: { x: 0, y: -120 }, opt2: { x: 0, y: 0 }, opt3: { x: 0, y: 120 },
    action: { x: 0, y: 0 },
  });

  const offsetRef = useRef<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    offsetRef.current = { ...offsets };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});

  const getNodeData = useCallback((id: string): NodeData => {
    const situation = signalCase.situationData;
    const severity = signalCase.severity;

    if (id === 'signal') {
      return {
        title: signalCase.accountName.toUpperCase(),
        category: signalCase.signalTitle,
        icon: (
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${signalCase.signalType === 'risk' ? 'bg-red-600' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(0,0,0,0.2)]`} />
          </div>
        ),
        detail: signalCase.summary,
        desc: `Confiança: ${Math.round(signalCase.confidence)}% • Severidade: ${severity.toUpperCase()}`,
        metric: severity.toUpperCase(),
        status: 'Trigger'
      };
    }

    if (id.startsWith('evidence')) {
      const idx = parseInt(id.replace('evidence', '')) - 1;
      if (idx >= 0 && idx < signalCase.evidence.length) {
        const ev = signalCase.evidence[idx];
        return {
          title: ev.title,
          category: 'Evidence',
          icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
          detail: ev.title,
          desc: ev.detail,
          metric: ev.severity || 'high',
          status: 'Validado'
        };
      }
    }

    if (id === 'timeline') {
      return {
        title: situation.situationTitle,
        category: 'Analysis',
        icon: <Target className="w-5 h-5 text-blue-600" />,
        detail: situation.situationTitle,
        desc: situation.context,
        metric: 'Síntese',
        status: 'Crítico'
      };
    }

    if (id.startsWith('factor')) {
      const idx = parseInt(id.replace('factor', '')) - 1;
      if (idx >= 0 && idx < situation.timeline.length) {
        const event = situation.timeline[idx];
        return {
          title: event.signal,
          category: 'Factor',
          icon: <Clock className="w-5 h-5" />,
          detail: event.signal,
          desc: event.indicator,
          metric: event.date,
          status: 'Neutro'
        };
      }
    }

    if (id === 'decision') {
      const dp = situation.decisionPoints[0];
      return {
        title: dp.title,
        category: 'Decision',
        icon: <Target className="w-5 h-5" />,
        detail: dp.title,
        desc: dp.analysis,
        metric: 'Estratégia',
        status: 'Pendente'
      };
    }

    if (id.startsWith('opt')) {
      const idx = parseInt(id.replace('opt', '')) - 1;
      const dp = situation.decisionPoints[0];
      if (idx >= 0 && idx < dp.options.length) {
        const opt = dp.options[idx];
        return {
          title: opt.option,
          category: 'Option',
          icon: <Zap className="w-5 h-5" />,
          detail: opt.option,
          desc: opt.description,
          metric: `${opt.successProbability}% Success`,
          status: 'Path'
        };
      }
    }

    if (id === 'action') {
      const act = signalCase.outputActions[0];
      return {
        title: act.title,
        category: 'Action',
        icon: <CheckCircle2 className="w-5 h-5" />,
        detail: act.title,
        desc: act.description || '',
        metric: act.priority,
        status: 'Recomendado'
      };
    }

    return { title: id, category: 'Node', icon: null, detail: '', desc: '', metric: '', status: '' };
  }, [signalCase]);

  const visibleCards = useMemo(() => {
    const cards = ['signal'];
    if (revealLevel >= 1) {
      const evidenceCount = Math.min(3, signalCase.evidence.length);
      for (let i = 1; i <= evidenceCount; i++) cards.push(`evidence${i}`);
    }
    if (revealLevel >= 2) cards.push('timeline');
    if (revealLevel >= 3) {
      const timelineCount = Math.min(3, signalCase.situationData.timeline.length);
      for (let i = 1; i <= timelineCount; i++) cards.push(`factor${i}`);
    }
    if (revealLevel >= 4) cards.push('decision');
    if (revealLevel >= 5) {
      const optCount = Math.min(3, signalCase.situationData.decisionPoints[0]?.options.length || 0);
      for (let i = 1; i <= optCount; i++) cards.push(`opt${i}`);
    }
    if (revealLevel >= 6 && signalCase.outputActions.length > 0) cards.push('action');
    return cards;
  }, [revealLevel, signalCase]);

  const layout = useMemo(() => {
    const res: Record<string, { x: number, y: number }> = {};
    visibleCards.forEach(id => {
      const stageIdx = STAGE_MAP[id] ?? 0;
      res[id] = {
        x: STAGES_X[stageIdx] + (offsets[id]?.x || 0),
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
    const evidenceCount = Math.min(3, signalCase.evidence.length);
    if (revealLevel >= 1) {
      for (let i = 1; i <= evidenceCount; i++) {
        updateConnector('signal', `evidence${i}`);
      }
    }
    if (revealLevel >= 2) {
      for (let i = 1; i <= evidenceCount; i++) {
        updateConnector(`evidence${i}`, 'timeline');
      }
    }
    const timelineCount = Math.min(3, signalCase.situationData.timeline.length);
    if (revealLevel >= 3) {
      for (let i = 1; i <= timelineCount; i++) {
        updateConnector('timeline', `factor${i}`);
      }
    }
    if (revealLevel >= 4) {
      for (let i = 1; i <= timelineCount; i++) {
        updateConnector(`factor${i}`, 'decision');
      }
    }
    if (revealLevel >= 5 && chosenOptionIndex !== null) {
      const opt = `opt${chosenOptionIndex + 1}`;
      updateConnector('decision', opt);
      if (revealLevel >= 6) updateConnector(opt, 'action');
    }
  }, [revealLevel, chosenOptionIndex, signalCase, updateConnector]);

  useLayoutEffect(() => {
    updateAllConnectors();
    const h = requestAnimationFrame(updateAllConnectors);
    return () => cancelAnimationFrame(h);
  }, [updateAllConnectors, layout, revealLevel, chosenOptionIndex]);

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

        const targetX = (e.clientX - dragOffset.x) - containerRect.left + scrollX;
        const targetY = (e.clientY - dragOffset.y) - containerRect.top;

        const cardEl = cardRefs.current[dragging];
        if (cardEl) {
          cardEl.style.left = `${targetX}px`;
          cardEl.style.top = `${targetY}px`;
        }

        updateAllConnectors();

        const baseColX = STAGES_X[STAGE_MAP[dragging] ?? 0];
        offsetRef.current[dragging] = {
          x: Math.max(-150, Math.min(150, targetX - baseColX)),
          y: Math.max(-300, Math.min(300, targetY - CENTER_Y))
        };
      }
    };

    const handleMouseUp = () => {
      setOffsets({ ...offsetRef.current });
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, dragStartPos, dragMoved, updateAllConnectors, onDecisionRecorded, selectedCard, visibleCards]);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = cardRefs.current[id]?.getBoundingClientRect();
    if (!rect) return;

    setDragging(id);
    setHoveredCard(null);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2)
    });
    setDragMoved(false);
  };

  const dynamicWidth = STAGES_X[6] + 500;

  const getDecisionSummary = (id: string): { type: string; title: string; summary: string } => {
    if (id === 'signal') {
      return {
        type: 'signal',
        title: `Sinal ${signalCase.signalType === 'risk' ? 'de Risco' : 'de Expansão'}: ${signalCase.signalTitle}`,
        summary: `${signalCase.accountName} | Confiança: ${Math.round(signalCase.confidence)}%`
      };
    }
    if (id.startsWith('evidence')) {
      const idx = parseInt(id.replace('evidence', '')) - 1;
      const ev = signalCase.evidence[idx];
      return {
        type: 'evidence',
        title: `Evidência: ${ev.title}`,
        summary: ev.detail
      };
    }
    if (id === 'timeline') {
      return {
        type: 'timeline',
        title: signalCase.situationData.situationTitle,
        summary: `${signalCase.situationData.timeline.length} eventos críticos mapeados`
      };
    }
    if (id.startsWith('factor')) {
      const idx = parseInt(id.replace('factor', '')) - 1;
      const event = signalCase.situationData.timeline[idx];
      return {
        type: 'factor',
        title: `Fator: ${event.signal}`,
        summary: event.indicator
      };
    }
    if (id === 'decision') {
      return {
        type: 'decision',
        title: `Decisão: ${signalCase.situationData.decisionPoints[0].title}`,
        summary: `${signalCase.situationData.decisionPoints[0].options.length} opções disponíveis`
      };
    }
    if (id.startsWith('opt')) {
      const idx = parseInt(id.replace('opt', '')) - 1;
      const opt = signalCase.situationData.decisionPoints[0].options[idx];
      return {
        type: 'option',
        title: `Opção Selecionada: ${opt.option}`,
        summary: `Consequência — ${opt.consequence} | Próxima Ação — ${opt.actionDerived}`
      };
    }
    if (id === 'action') {
      const act = signalCase.outputActions[0];
      return {
        type: 'action',
        title: `Ação: ${act.title}`,
        summary: `Prioridade: ${act.priority} | Responsável: ${act.ownerSuggestion || 'A definir'}`
      };
    }
    return { type: id, title: id, summary: '' };
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 font-sans select-none">
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
              <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Account: {signalCase.accountName}</span>
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

              {revealLevel >= 1 && signalCase.evidence.map((_, i) => (
                <path key={`signal-evidence${i+1}`} ref={el => { pathRefs.current[`signal-evidence${i+1}`] = el; }} fill="none" stroke="#64748b" strokeWidth="2" strokeOpacity="0.3" />
              ))}
              {revealLevel >= 2 && signalCase.evidence.map((_, i) => (
                <path key={`evidence${i+1}-timeline`} ref={el => { pathRefs.current[`evidence${i+1}-timeline`] = el; }} fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.2" />
              ))}
              {revealLevel >= 3 && signalCase.situationData.timeline.map((_, i) => (
                <path key={`timeline-factor${i+1}`} ref={el => { pathRefs.current[`timeline-factor${i+1}`] = el; }} fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.2" />
              ))}
              {revealLevel >= 4 && signalCase.situationData.timeline.map((_, i) => (
                <path key={`factor${i+1}-decision`} ref={el => { pathRefs.current[`factor${i+1}-decision`] = el; }} fill="none" stroke="#f97316" strokeWidth="2.5" strokeOpacity="0.4" />
              ))}
              {revealLevel >= 5 && chosenOptionIndex !== null && (
                <path ref={el => { pathRefs.current[`decision-opt${chosenOptionIndex+1}`] = el; }} fill="none" stroke="#22c55e" strokeWidth="3" strokeOpacity="0.6" />
              )}
              {revealLevel >= 6 && chosenOptionIndex !== null && (
                <path ref={el => { pathRefs.current[`opt${chosenOptionIndex+1}-action`] = el; }} fill="none" stroke="#2563eb" strokeWidth="4" strokeOpacity="0.9" />
              )}
            </svg>

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
                            if (id === 'signal') setRevealLevel(1);
                            else if (id.startsWith('evidence')) setRevealLevel(2);
                            else if (id === 'timeline') setRevealLevel(3);
                            else if (id.startsWith('factor')) setRevealLevel(4);
                            else if (id === 'decision') setRevealLevel(5);
                            else if (id.startsWith('opt')) { setChosenOptionIndex(parseInt(id.replace('opt', '')) - 1); setRevealLevel(6); }
                          }
                        }}
                        className={`w-full h-full rounded-2xl p-4 border-2 flex flex-col justify-center items-start text-left transition-all ${
                          id === 'signal'
                            ? 'bg-blue-50/30 border-blue-600 shadow-[0_8px_30px_rgba(37,99,235,0.1)]'
                            : isSelected ? 'bg-[#16181D] border-blue-500 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)]' :
                            isChosen ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-[0_10px_25px_rgba(16,185,129,0.2)]' :
                            isHovered ? 'bg-white border-blue-400 shadow-[0_10px_30px_rgba(0,0,0,0.1)] scale-[1.02]' :
                            id === 'action' ? 'bg-slate-900 border-slate-800 text-white' :
                            'bg-white border-slate-100 text-slate-800 shadow-sm'
                        }`}
                      >
                        {id === 'signal' ? (
                          <div className="flex flex-col w-full h-full justify-between py-1 px-1">
                            <div className="flex items-center gap-2">
                              {data.icon}
                              <span className="text-sm font-black text-slate-900 tracking-tight leading-none">{data.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-2">
                              {data.category}
                            </div>
                            <div className="mt-auto pt-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                signalCase.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                                signalCase.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {data.metric}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                              isSelected ? 'bg-blue-500/20 text-white' : 'bg-slate-50 border border-slate-100 text-slate-600 shadow-sm'
                            }`}>
                              {React.cloneElement(data.icon as any, { size: 16 })}
                            </div>
                            <div className="w-full">
                              <div className={`text-[9px] font-black uppercase tracking-tight line-clamp-2 leading-tight mb-1 ${
                                isSelected ? 'text-white' : 'text-slate-900'
                              }`}>
                                {data.title}
                              </div>
                              <div className={`text-[7px] font-bold uppercase tracking-widest opacity-60 ${
                                isSelected ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {data.category}
                              </div>
                            </div>
                            <div className="mt-auto w-full pt-2 flex justify-between items-center">
                              <div className={`text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100'
                              }`}>
                                {data.metric}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedCard && (
          <div className="absolute right-8 top-8 bottom-8 w-[420px] bg-[#16181D] text-slate-200 rounded-[3rem] flex flex-col overflow-hidden z-[500] animate-in slide-in-from-right duration-500 border border-slate-700/50 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            {/* HEADER DARK */}
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-800/50">
                <button onClick={() => setSelectedCard(null)} className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shadow-lg">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 bg-[#20242B] border border-slate-700/50 px-4 py-1.5 rounded-full">
                  <Zap className={`w-3 h-3 ${getNodeData(selectedCard).category.includes('RISCO') ? 'text-red-400' : 'text-indigo-400'}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Tactical intelligence</span>
                </div>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-8">
              {/* TITLE SECTION */}
              <div className="relative">
                <div className="absolute -left-10 top-0 bottom-0 w-1 bg-indigo-500" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">{getNodeData(selectedCard).category}</p>
                <h4 className="font-black text-2xl text-white leading-tight uppercase tracking-tighter">{getNodeData(selectedCard).title.replace('\n', ' ')}</h4>
              </div>

              {/* CORE INFO BLOCKS */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#20242B] p-5 rounded-2xl border border-slate-700/40">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Impacto Previsto</p>
                    <p className="text-lg font-black text-white">{getNodeData(selectedCard).metric}</p>
                  </div>
                  <div className="bg-[#20242B] p-5 rounded-2xl border border-slate-700/40">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status de Fluxo</p>
                    <p className="text-lg font-black text-indigo-400">{getNodeData(selectedCard).status}</p>
                  </div>
              </div>

              {/* CONTEXT BLOCK */}
              <div className="bg-[#20242B] p-6 rounded-2xl border border-slate-700/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Info className="w-12 h-12 text-white" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  Contexto Operacional
                </p>
                <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                  {getNodeData(selectedCard).detail}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    &quot;{getNodeData(selectedCard).desc}&quot;
                  </p>
                </div>
              </div>

              {/* DECISION BRANCHING / OPTIONS */}
              {selectedCard === 'decision' ? (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Matriz de Decisão</p>
                  </div>
                  
                  <div className="space-y-3">
                    {signalCase.situationData.decisionPoints[0].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onDecisionRecorded) {
                            const stage = visibleCards.findIndex(id => id === selectedCard);
                            onDecisionRecorded({
                              stage,
                              nodeId: `decision-option-${idx}`,
                              nodeType: 'decision-choice',
                              title: opt.option,
                              summary: `Consequência — ${opt.consequence} | Próxima Ação — ${opt.actionDerived}`
                            });
                            setChosenOptionIndex(idx);
                            setRevealLevel(6);
                            setSelectedCard(null);
                          }
                        }}
                        className="w-full bg-[#20242B] border border-slate-700/50 hover:border-indigo-500/50 p-5 rounded-2xl transition-all group text-left relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ChevronRight className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-white mb-1 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{opt.option}</p>
                            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">{opt.description}</p>
                            
                             <div className="grid grid-cols-1 gap-3 mt-2 pt-3 border-t border-slate-700/30">
                                <div className="p-2.5 bg-slate-800/40 rounded-xl border border-white/5">
                                  <p className="text-[7px] font-black text-indigo-400 uppercase mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Consequência Esperada
                                  </p>
                                  <p className="text-[10px] text-slate-200 font-medium leading-normal">{opt.consequence || 'Estabilização de ARR imediata.'}</p>
                                </div>
                                
                                <div className="p-2.5 bg-slate-800/40 rounded-xl border border-white/5">
                                  <p className="text-[7px] font-black text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
                                    <Zap className="w-2.5 h-2.5" /> Próxima Ação Derivada
                                  </p>
                                  <p className="text-[10px] text-slate-200 font-medium leading-normal">{opt.actionDerived || 'Ativar playbook de retenção.'}</p>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                                      <Users className="w-2.5 h-2.5 text-slate-300" />
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{opt.owner || 'Comercial'}</span>
                                  </div>
                                  <div className="bg-indigo-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                    <span className="text-[7px] font-black text-indigo-300 uppercase tracking-widest">Confiança</span>
                                    <span className="text-[9px] text-white font-black">{opt.successProbability}%</span>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Ação Sugerida</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3">
                        <Zap className="w-5 h-5 text-indigo-500/30" />
                     </div>
                     <p className="text-xs font-black text-indigo-100 mb-1 leading-snug uppercase tracking-tight">
                        {signalCase.outputActions[0]?.title || 'Aguardando Deliberação'}
                     </p>
                     <p className="text-[10px] text-indigo-300/80 leading-relaxed">
                        {signalCase.outputActions[0]?.description || 'A análise deste nó apoiará a recomendação final de orquestração.'}
                     </p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER DARK */}
            <div className="p-10 border-t border-slate-800/50 bg-[#1A1D23]">
              {selectedCard === 'decision' ? (
                <div className="flex items-center justify-center p-4 bg-[#20242B] rounded-2xl border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse text-center">Aguardando seleção tática acima</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (onDecisionRecorded && selectedCard) {
                      const stage = visibleCards.findIndex(id => id === selectedCard);
                      const summary = getDecisionSummary(selectedCard);
                      onDecisionRecorded({
                        stage,
                        nodeId: selectedCard,
                        nodeType: summary.type,
                        title: summary.title,
                        summary: summary.summary
                      });
                      setSelectedCard(null);
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-5 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-indigo-400/30"
                >
                  <Zap className="w-4 h-4 text-white" />
                  Mapear Inteligência
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-100 px-10 py-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decision Stage Matrix</span>
            <div className="flex items-center gap-3">
              {[0,1,2,3,4,5,6].map(i => (<div key={i} className={`h-2.5 rounded-full transition-all duration-1000 ${revealLevel >= i ? 'w-10 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'w-2.5 bg-slate-100'}`} />))}
            </div>
          </div>
        </div>
        <button disabled={revealLevel < 6} className="relative flex items-center gap-4 px-12 py-5 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-[0_20px_60px_rgba(0,0,0,0.3)] active:scale-95 group overflow-hidden" onClick={() => setSelectedCard('action')}>
          <Info className="w-4 h-4 text-blue-400" /> <span>Review Strategic Action</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; border: 3px solid #16181D; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default DecisionMindMap;
