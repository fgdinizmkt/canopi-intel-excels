'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { X, Info, Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Zap, Brain, Clock, Users, Sparkles, ChevronRight, Activity, Globe } from 'lucide-react';
import { SignalCase } from '../data/signalCases';

const STAGES_X = [140, 440, 740, 1040, 1340, 1640, 1940, 2240, 2540];
const CARD_WIDTH = 180;
const CARD_HEIGHT = 120;
const VERTICAL_SPACING = 280;
const PADDING_TOP = 180;
const PADDING_BOTTOM = 150;
const PADDING_LEFT = 80;
const PADDING_RIGHT = 80;
const OFFSET_MAX_Y = 150;
const OFFSET_MIN_Y = -150;

// ESTRUTURA DE LINKS REAIS (PAI -> FILHOS)
const NODE_HIERARCHY: Record<string, string[]> = {
  'signal': ['ev1', 'ev2', 'ev3'],
  'ev1': ['hyp1'],
  'ev2': ['hyp2'],
  'ev3': ['hyp3'],
  'hyp1': ['dec1'],
  'hyp2': ['dec2'],
  'hyp3': ['dec3'],
  'dec1': ['opt1-1', 'opt1-2'],
  'dec2': ['opt2-1', 'opt2-2'],
  'dec3': ['opt3-1', 'opt3-2'],
  'opt1-1': ['act1-1'],
  'opt1-2': ['act1-2'],
  'opt2-1': ['act2-1'],
  'opt2-2': ['act2-2'],
  'opt3-1': ['act3-1'],
  'opt3-2': ['act3-2'],
};

interface NodeMetric {
  label: string;
  value: string;
  trend?: string;
  isNegative?: boolean;
}

interface NodeData {
  title: string;
  category: string;
  icon: React.ReactNode;
  detail: string;
  desc: string;
  metric: string;
  status: string;
  metrics?: NodeMetric[];
  logicType: 'choice' | 'chance' | 'outcome' | 'root';
  branchLabel?: string;
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
  const [chosenOptionPerDecision, setChosenOptionPerDecision] = useState<Record<string, string>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [dragging, setDragging] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [offsets, setOffsets] = useState<Record<string, { x: number, y: number }>>({});

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

    // DESCRITIVO: SINAL (ROOT)
    if (id === 'signal') {
      return {
        title: signalCase.accountName,
        category: 'SINAL ANALISADO (DESCRITIVO)',
        icon: <Target className="w-5 h-5 text-blue-400" />,
        logicType: 'root',
        detail: signalCase.signalTitle,
        desc: situation.context,
        metric: severity.toUpperCase(),
        status: 'Trigger Principal',
        metrics: [
          { label: 'Impacto Estimado', value: `R$ ${situation.initialState.healthScore * 10}k/mês`, isNegative: true },
          { label: 'Score Saúde', value: `${situation.initialState.healthScore}/100` }
        ]
      };
    }

    // DESCRITIVO: EVIDÊNCIAS
    if (id.startsWith('ev')) {
      const idx = parseInt(id.replace('ev', '')) - 1;
      const ev = signalCase.evidence[idx];
      return {
        title: ev?.title || 'Análise Técnica',
        category: 'EVIDÊNCIA (DESCRITIVO)',
        icon: <Activity className="w-5 h-5 text-indigo-400" />,
        logicType: 'root',
        detail: ev?.detail || 'Evidência operacional mapeada.',
        desc: ev?.source || 'GA4 / Pipeline de Dados',
        metric: 'VALIDADO',
        status: 'Auditado',
        metrics: [
          { label: 'Confiança', value: '98%' },
          { label: 'Fonte', value: 'Google Ads' }
        ]
      };
    }

    // PREDITIVO: HIPÓTESES (CHANCE NODES)
    if (id.startsWith('hyp')) {
      const idx = parseInt(id.replace('hyp', '')) - 1;
      const event = situation.timeline[idx];
      return {
        title: event?.signal || 'Impacto Projetado',
        category: 'HIPÓTESE (PREDITIVO)',
        icon: <TrendingDown className="w-5 h-5 text-amber-500" />,
        logicType: 'chance',
        branchLabel: `${Math.round(80 - idx * 10)}% Probabilidade`,
        detail: event?.indicator || 'Projeção de agravamento do cenário.',
        desc: 'Cálculo estatístico baseado em casos similares.',
        metric: 'RISCO PROJETADO',
        status: 'Preditivo',
        metrics: [
          { label: 'Probabilidade', value: `${80 - idx * 10}%` },
          { label: 'Expectativa', value: 'R$ -12k', isNegative: true }
        ]
      };
    }

    // DECISÕES (PONTOS DE ESCOLHA DO USUÁRIO)
    if (id.startsWith('dec')) {
       const idx = parseInt(id.replace('dec', '')) - 1;
       const dp = situation.decisionPoints[0]; // Simplificado para exemplo
       return {
         title: idx === 0 ? dp.title : `Ajuste Tático secundário`,
         category: 'PONTO DE DECISÃO (PRESCRITIVO)',
         icon: <Brain className="w-5 h-5 text-indigo-400" />,
         logicType: 'choice',
         detail: dp.analysis,
         desc: dp.context,
         metric: 'ESCOLHA TÁTICA',
         status: 'Ponto de Escolha',
         metrics: [
           { label: 'Alternativas', value: '2' },
           { label: 'Impacto', value: 'ALTO' }
         ]
       };
    }

    // ALTERNATIVAS (OPÇÕES DE RAMO)
    if (id.includes('opt')) {
      const parts = id.replace('opt', '').split('-');
      const decIdx = parseInt(parts[0]) - 1;
      const optIdx = parseInt(parts[1]) - 1;
      const opt = situation.decisionPoints[0].options[optIdx] || situation.decisionPoints[0].options[0];
      
      return {
        title: opt.option || 'Alternativa',
        category: 'OPÇÃO SELECIONADA',
        icon: <ChevronRight className="w-5 h-5 text-indigo-200" />,
        logicType: 'choice',
        branchLabel: `Payoff ${opt.successProbability}%`,
        detail: opt.description || '',
        desc: opt.consequence || '',
        metric: `${opt.successProbability}%`,
        status: 'Avaliação de Risco',
        metrics: [
          { label: 'Probabilidade', value: `${opt.successProbability}%` },
          { label: 'Esforço', value: 'MÉDIO' }
        ]
      };
    }

    // AÇÕES OPERACIONAIS (TERMINAIS)
    if (id.includes('act')) {
      const parts = id.replace('act', '').split('-');
      const decIdx = parseInt(parts[0]) - 1;
      const actIdx = parseInt(parts[1]) - 1;
      const opt = situation.decisionPoints[0].options[actIdx] || situation.decisionPoints[0].options[0];

      return {
        title: opt.actionDerived || 'Ação Recomendada',
        category: 'AÇÃO PRESCRITIVA',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        logicType: 'outcome',
        branchLabel: 'Executar',
        detail: 'Habilitação da manobra recomendada pelo Oracle.',
        desc: opt.timeline || 'Resolução Imediata',
        metric: 'APROVADO',
        status: 'Auditado',
        metrics: [
          { label: 'Responsável', value: opt.owner || 'CS' },
          { label: 'Urgência', value: 'ALTA' }
        ]
      };
    }

    return { title: id, category: 'Node', icon: null, detail: '', desc: '', metric: '', status: '', logicType: 'root' };
  }, [signalCase]);

  // Helper: encontrar caminho do root até um nó
  const getPathToNode = useCallback((targetId: string): string[] => {
    if (targetId === 'signal') return ['signal'];

    const path: string[] = [];
    let current = targetId;

    while (current !== 'signal') {
      path.unshift(current);
      let found = false;
      for (const [parent, children] of Object.entries(NODE_HIERARCHY)) {
        if (children.includes(current)) {
          current = parent;
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    path.unshift('signal');
    return path;
  }, []);

  // CALCULAR QUAIS CARDS ESTÃO VISÍVEIS BASEADO NO RAMO ATIVO ATUAL
  const visibleCards = useMemo(() => {
    const revealed = new Set(['signal']);

    // Sempre mostrar filhos diretos do signal (nível 1: ev1, ev2, ev3)
    const signalChildren = NODE_HIERARCHY['signal'] || [];
    signalChildren.forEach(child => revealed.add(child));

    // Se algo está selecionado, mostrar o caminho até ele + seus filhos diretos
    if (selectedCard && selectedCard !== 'signal') {
      const pathToSelected = getPathToNode(selectedCard);
      pathToSelected.forEach(nodeId => revealed.add(nodeId));

      // Adicionar filhos diretos do nó selecionado
      const selectedChildren = NODE_HIERARCHY[selectedCard] || [];
      selectedChildren.forEach(child => revealed.add(child));
    }

    return Array.from(revealed);
  }, [selectedCard, getPathToNode]);

  // HELPER PARA PROFUNDIDADE (CENTRALIZADO)
  const getNodeDepth = useCallback((nodeId: string): number => {
    if (nodeId === 'signal') return 0;
    for (const [parent, children] of Object.entries(NODE_HIERARCHY)) {
      if (children.includes(nodeId)) return getNodeDepth(parent) + 1;
    }
    return 0;
  }, []);

  // Calculer hauteur du canvas basée sur le contenu
  const calculateCanvasHeight = useCallback(() => {
    if (visibleCards.length === 0) return 600;
    let maxY = 0;

    visibleCards.forEach(id => {
      const depth = getNodeDepth(id);
      let baseY = PADDING_TOP;

      if (id.startsWith('ev')) {
        const idx = parseInt(id.replace('ev', '')) - 1;
        baseY += idx * VERTICAL_SPACING;
      } else if (id.startsWith('hyp')) {
        const idx = parseInt(id.replace('hyp', '')) - 1;
        baseY += idx * VERTICAL_SPACING;
      } else if (id.startsWith('dec')) {
        const idx = parseInt(id.replace('dec', '')) - 1;
        baseY += idx * VERTICAL_SPACING;
      } else if (id.includes('opt')) {
        const parts = id.replace('opt', '').split('-');
        const decIdx = parseInt(parts[0]) - 1;
        const optIdx = parseInt(parts[1]) - 1;
        baseY += (decIdx * 2 + optIdx) * (VERTICAL_SPACING / 2);
      } else if (id.includes('act')) {
        const parts = id.replace('act', '').split('-');
        const decIdx = parseInt(parts[0]) - 1;
        const actIdx = parseInt(parts[1]) - 1;
        baseY += (decIdx * 2 + actIdx) * (VERTICAL_SPACING / 2);
      }

      // Considerar offsets (drag) ao calcular altura máxima
      const actualY = baseY + (offsets[id]?.y || 0);
      maxY = Math.max(maxY, actualY);
    });

    return Math.max(600, maxY + PADDING_BOTTOM + CARD_HEIGHT);
  }, [visibleCards, getNodeDepth, offsets]);

  const canvasHeight = useMemo(() => calculateCanvasHeight(), [calculateCanvasHeight]);

  // Memoize selectedNodeData para estabilidade do drawer
  const selectedNodeData = useMemo(() => {
    if (!selectedCard) return null;
    return {
      nodeId: selectedCard,
      data: getNodeData(selectedCard)
    };
  }, [selectedCard, getNodeData]);

  // Resetar offsets ao trocar de ramo - elimina resíduos de layout anterior
  useEffect(() => {
    setOffsets({});
    offsetRef.current = {};
  }, [selectedCard]);

  // CALCULAR POSIÇÕES X E Y (ÁRVORE REAL COM CRESCIMENTO VERTICAL)
  // Aplicar margens seguras no posicionamento
  const getPosition = useCallback((id: string) => {
    const depth = getNodeDepth(id);
    const baseX = STAGES_X[depth] || depth * 300;
    const x = PADDING_LEFT + baseX;

    let y = PADDING_TOP;
    if (id.startsWith('ev')) {
       const idx = parseInt(id.replace('ev', '')) - 1;
       y += idx * VERTICAL_SPACING;
    } else if (id.startsWith('hyp')) {
       const idx = parseInt(id.replace('hyp', '')) - 1;
       y += idx * VERTICAL_SPACING;
    } else if (id.startsWith('dec')) {
       const idx = parseInt(id.replace('dec', '')) - 1;
       y += idx * VERTICAL_SPACING;
    } else if (id.includes('opt')) {
       const parts = id.replace('opt', '').split('-');
       const decIdx = parseInt(parts[0]) - 1;
       const optIdx = parseInt(parts[1]) - 1;
       const parentY = PADDING_TOP + (decIdx * VERTICAL_SPACING);
       y = parentY + (optIdx - 0.5) * (VERTICAL_SPACING / 2);
    } else if (id.includes('act')) {
       const parts = id.replace('act', '').split('-');
       const decIdx = parseInt(parts[0]) - 1;
       const actIdx = parseInt(parts[1]) - 1;
       const parentY = PADDING_TOP + (decIdx * VERTICAL_SPACING);
       y = parentY + (actIdx - 0.5) * (VERTICAL_SPACING / 2);
    }

    return { x: x + (offsets[id]?.x || 0), y: y + (offsets[id]?.y || 0) };
  }, [offsets, getNodeDepth]);

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

    // ADICIONAR LABEL NO CONECTOR (PROBABILIDADE/PAYOFF)
    const labelId = `label-${fromId}-${toId}`;
    let labelEl = document.getElementById(labelId);
    const toData = getNodeData(toId);
    
    if (toData.branchLabel) {
      if (!labelEl) {
        labelEl = document.createElement('div');
        labelEl.id = labelId;
        labelEl.className = "absolute pointer-events-none bg-[#0F1115]/80 backdrop-blur px-2 py-0.5 rounded-full border border-white/10 text-[6px] font-black text-indigo-300 uppercase tracking-widest z-[10]";
        containerRef.current?.appendChild(labelEl);
      }
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      labelEl.style.left = `${mx - 30}px`; // centralizar aprox
      labelEl.style.top = `${my - 10}px`;
      labelEl.innerText = toData.branchLabel;
    } else if (labelEl) {
      labelEl.remove();
    }
  }, [getNodeData]);

  const updateAllConnectors = useCallback(() => {
    Object.entries(NODE_HIERARCHY).forEach(([parentId, children]) => {
      if (!visibleCards.includes(parentId)) return;
      children.forEach(childId => {
        if (visibleCards.includes(childId)) {
          updateConnector(parentId, childId);
        }
      });
    });
  }, [visibleCards, updateConnector]);

  useLayoutEffect(() => {
    updateAllConnectors();
    const h = requestAnimationFrame(updateAllConnectors);
    return () => cancelAnimationFrame(h);
  }, [updateAllConnectors]);

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

        const baseColX = STAGES_X[getNodeDepth(dragging)] ?? 0;
        let baseY = PADDING_TOP;
        if (dragging.startsWith('ev')) {
          const idx = parseInt(dragging.replace('ev', '')) - 1;
          baseY += idx * VERTICAL_SPACING;
        } else if (dragging.startsWith('hyp')) {
          const idx = parseInt(dragging.replace('hyp', '')) - 1;
          baseY += idx * VERTICAL_SPACING;
        }

        offsetRef.current[dragging] = {
          x: Math.max(-150, Math.min(150, targetX - baseColX)),
          y: Math.max(OFFSET_MIN_Y, Math.min(OFFSET_MAX_Y, targetY - baseY))
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

  const dynamicWidth = PADDING_LEFT + (STAGES_X[STAGES_X.length - 1] || 2500) + PADDING_RIGHT + 200;

  const getDecisionSummary = (id: string): { type: string; title: string; summary: string } => {
    const data = getNodeData(id);
    return {
      type: data.category,
      title: data.title,
      summary: data.detail
    };
  };

  return (
    <div className="w-full h-auto flex flex-col bg-transparent font-sans select-none">
      <div className="bg-transparent px-0 py-6 flex justify-between items-center shrink-0 z-[100] border-b border-slate-200/40 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
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
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">🌳 Navegação Ativa</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden min-h-[1200px]">
        <div
          className={`flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar bg-white/[0.02]`}
          ref={containerRef}
          onScroll={updateAllConnectors}
          style={{ height: `${Math.max(1200, canvasHeight + 100)}px` }}
        >
          <div style={{ width: dynamicWidth, height: canvasHeight, minWidth: dynamicWidth, minHeight: canvasHeight, position: 'relative' }}>
            <svg width={dynamicWidth} height={canvasHeight} className="absolute inset-0 block pointer-events-none z-0">
              <defs>
                <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridLarge)" />

              {Object.entries(NODE_HIERARCHY).map(([parentId, children]) => {
                if (!visibleCards.includes(parentId)) return null;
                return children.map(childId => {
                  if (!visibleCards.includes(childId)) return null;
                  const key = `${parentId}-${childId}`;
                  return (
                    <path 
                      key={key} 
                      ref={el => { pathRefs.current[key] = el; }} 
                      fill="none" 
                      stroke="#64748b" 
                      strokeWidth="2" 
                      strokeOpacity="0.3" 
                    />
                  );
                });
              })}
            </svg>

            <div className="absolute inset-0 z-10 pointer-events-none">
              {visibleCards.map(id => {
                const pos = getPosition(id);
                const data = getNodeData(id);
                const isHovered = hoveredCard === id;
                const isSelected = selectedCard === id;
                const active = dragging === id;

                // Determine if this option is the chosen one for its parent decision
                const isChosenOption = id.includes('opt') && (() => {
                  const parts = id.replace('opt', '').split('-');
                  const decisionId = `dec${parts[0]}`;
                  return chosenOptionPerDecision[decisionId] === id;
                })();

                return (
                  <div
                    key={id}
                    ref={el => { cardRefs.current[id] = el; }}
                    onMouseDown={e => handleMouseDown(e, id)}
                    onMouseEnter={() => !dragging && !isSelected && setHoveredCard(id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`pointer-events-auto absolute ${active ? 'z-[200]' : isSelected ? 'z-[150]' : isHovered ? 'z-[120]' : 'z-10'} ${active ? '' : 'transition-all duration-300'}`}
                    style={{
                      left: pos.x, top: pos.y, width: CARD_WIDTH, height: CARD_HEIGHT,
                      transform: `translate(-50%, -50%) ${active ? 'scale(1.1)' : isHovered ? 'scale(1.05)' : 'scale(1)'}`,
                      cursor: active ? 'grabbing' : 'grab'
                    }}
                  >
                    <div
                      onClick={() => {
                        if (!dragMoved) {
                          setSelectedCard(id);
                          setHoveredCard(null);
                          const data = getNodeData(id);

                          // Track chosen option per decision (local exclusivity, no tree filtering)
                          if (id.includes('opt')) {
                            const parts = id.replace('opt', '').split('-');
                            const decisionId = `dec${parts[0]}`;
                            setChosenOptionPerDecision(prev => ({
                              ...prev,
                              [decisionId]: id
                            }));
                          }

                          // Trigger recording for context nodes
                          if (onDecisionRecorded) {
                             onDecisionRecorded({
                               stage: getNodeDepth(id),
                               nodeId: id,
                               nodeType: id === 'signal' ? 'signal' : id.startsWith('ev') ? 'evidence' : id.startsWith('hyp') ? 'factor' : 'factor',
                               title: data.title,
                               summary: id === 'signal' ? `${data.detail} | Severidade: ${data.metric}` : data.detail
                             });
                          }
                        }
                      }}
                      className={`w-full h-full p-4 border-2 flex flex-col justify-center items-start text-left transition-all ${
                        data.logicType === 'chance' ? 'rounded-[3rem] border-dashed border-2' :
                        data.logicType === 'outcome' ? 'rounded-lg border-2' :
                        data.logicType === 'choice' ? 'rounded-2xl border-2' : 'rounded-2xl border-2'
                      } ${
                        id === 'signal'
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 text-blue-950 shadow-[0_10px_40px_rgba(59,130,246,0.2)]'
                          : id.startsWith('ev')
                          ? `${isSelected ? 'bg-indigo-900 border-indigo-400 text-white shadow-[0_10px_40px_rgba(99,102,241,0.3)]' : isHovered ? 'bg-indigo-50 border-indigo-400 shadow-[0_8px_30px_rgba(99,102,241,0.15)]' : 'bg-white border-indigo-200 text-slate-900 shadow-sm'}`
                          : id.startsWith('hyp')
                          ? `${isSelected ? 'bg-amber-900 border-amber-400 text-white shadow-[0_10px_40px_rgba(217,119,6,0.3)]' : isHovered ? 'bg-amber-50 border-amber-400 shadow-[0_8px_30px_rgba(217,119,6,0.15)]' : 'bg-white border-amber-200 text-slate-900 shadow-sm'} rounded-[2rem] border-dashed`
                          : id.startsWith('dec')
                          ? `${isSelected ? 'bg-purple-900 border-purple-400 text-white shadow-[0_10px_40px_rgba(168,85,247,0.3)]' : isHovered ? 'bg-purple-50 border-purple-400 shadow-[0_8px_30px_rgba(168,85,247,0.15)]' : 'bg-white border-purple-200 text-slate-900 shadow-sm'}`
                          : id.includes('opt')
                          ? `${isChosenOption ? 'bg-teal-50 border-teal-500 text-teal-950 shadow-[0_10px_40px_rgba(20,184,166,0.2)] ring-2 ring-teal-300' : isSelected ? 'bg-teal-900 border-teal-400 text-white shadow-[0_10px_40px_rgba(20,184,166,0.3)]' : isHovered ? 'bg-teal-50 border-teal-400 shadow-[0_8px_30px_rgba(20,184,166,0.15)]' : 'bg-white border-teal-200 text-slate-900 shadow-sm'}`
                          : id.includes('act')
                          ? `${isSelected ? 'bg-emerald-900 border-emerald-400 text-white shadow-[0_10px_40px_rgba(16,185,129,0.3)]' : isHovered ? 'bg-emerald-50 border-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.15)]' : 'bg-white border-emerald-200 text-slate-900 shadow-sm'}`
                          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      {/* TOOLTIP HOVER (LEVE E RESUMIDO) */}
                      {isHovered && !dragging && !isSelected && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl z-[500] w-52 animate-in fade-in zoom-in duration-200 pointer-events-none border border-slate-700">
                          <p className="text-[8px] font-black uppercase text-indigo-400 mb-0.5 tracking-widest">{data.category}</p>
                          <p className="text-[10px] font-bold leading-tight line-clamp-2 mb-1.5">{data.title}</p>
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
                            <span className="text-[7px] text-slate-500 font-bold uppercase">{data.status}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${data.metric === 'CRITICAL' || data.metric === 'CRÍTICO' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                          </div>
                        </div>
                      )}

                      {id === 'signal' ? (
                        <div className="flex flex-col w-full h-full justify-between py-1 px-1">
                          <div className="flex items-center justify-between mb-1">
                             <div className="flex items-center gap-2">
                               {data.icon}
                               <span className="text-[11px] font-black text-blue-900 tracking-tighter uppercase">{data.title}</span>
                             </div>
                             <div className={`px-1.5 py-0.5 rounded text-[7px] font-black text-white ${
                               data.metric === 'CRITICAL' ? 'bg-red-600' : 'bg-blue-600'
                             }`}>
                               {data.metric}
                             </div>
                          </div>
                          <div className="flex-1 mt-1 text-left">
                             <p className="text-[10px] font-black text-slate-800 leading-[1.2] line-clamp-2">{data.detail}</p>
                             <div className="mt-auto pt-1 flex items-center justify-between border-t border-black/5">
                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{data.category}</span>
                                <span className="text-[7px] font-bold text-slate-400">{data.status}</span>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full w-full">
                          <div className="flex items-center justify-between mb-1.5 pt-0.5">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              isSelected ? 'bg-white/20 text-white' :
                              id === 'decision' || id.startsWith('opt') ? 'bg-indigo-50 text-indigo-600' :
                              id === 'action' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-slate-50 text-slate-600'
                            }`}>
                              {React.cloneElement(data.icon as any, { size: 12 })}
                            </div>
                            <span className={`text-[6.5px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase ${
                               isSelected ? 'bg-white/20 text-white' :
                               id === 'decision' || id.startsWith('opt') ? 'bg-indigo-600 text-white' :
                               id === 'action' ? 'bg-emerald-600 text-white' :
                               'bg-slate-100 text-slate-500'
                            }`}>
                               {data.category}
                            </span>
                          </div>

                          <div className="flex-1 overflow-hidden">
                            <h6 className={`text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-1 mb-1 ${
                              isSelected ? 'text-white' : 'text-slate-900'
                            }`}>
                              {data.title}
                            </h6>
                            
                            {/* MINI GRID DE MÉTRICAS NO CARD (DENSE AD-STYLE) */}
                            {data.metrics && (
                              <div className="grid grid-cols-2 gap-1.5 mt-2">
                                {data.metrics.slice(0, 4).map((m, i) => (
                                  <div key={i} className={`p-1.5 rounded-lg border flex flex-col justify-center transition-colors ${
                                    isSelected ? 'bg-white/10 border-white/10' : 'bg-black/[0.02] border-black/[0.04]'
                                  }`}>
                                    <p className={`text-[6px] font-black uppercase tracking-tighter mb-0.5 ${
                                      isSelected ? 'text-white/40' : 'text-slate-400'
                                    }`}>{m.label}</p>
                                    <div className="flex items-center gap-1">
                                      <p className={`text-[9px] font-black leading-none ${
                                        m.isNegative ? 'text-red-500' : isSelected ? 'text-white' : 'text-slate-900'
                                      }`}>
                                        {m.value}
                                      </p>
                                      {m.trend && (
                                        <span className={`text-[6px] font-bold ${m.isNegative ? 'text-red-400' : 'text-emerald-500'}`}>
                                          {m.trend}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-2 flex justify-between items-center border-t border-black/[0.03]">
                            <div className={`text-[7px] font-black uppercase tracking-widest ${
                              isSelected ? 'text-blue-300' : 'text-slate-400'
                            }`}>
                              {data.status}
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              data.metric === 'CRITICAL' || data.metric === 'CRÍTICO' ? 'bg-red-500 animate-pulse' : 
                              isSelected ? 'bg-white animate-pulse' : 'bg-indigo-500'
                            }`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedNodeData && (
          <div className="absolute right-6 top-6 bottom-6 w-[440px] bg-[#0F1115] text-slate-300 rounded-[2.5rem] flex flex-col overflow-hidden z-[500] animate-in slide-in-from-right duration-500 border border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            {/* HUD HEADER */}
            <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Tactical Recon HUD</span>
                </div>
            </div>

            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
              {/* NODE IDENTITY */}
              <div className="relative pl-5">
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1.5">{selectedNodeData.data.category}</p>
                <h4 className="font-black text-xl text-white leading-tight uppercase tracking-tight">
                  {selectedNodeData.data.title}
                </h4>
              </div>

              {/* POLYMORPHIC CONTENT BASED ON NODE TYPE */}
              {(() => {
                const data = selectedNodeData.data;
                const nodeType = data.logicType;
                const nodeId = selectedNodeData.nodeId;

                return (
                  <div className="space-y-6">
                    {/* TYPE-SPECIFIC RENDERING */}

                    {/* ROOT/SIGNAL NODE */}
                    {nodeType === 'root' && nodeId === 'signal' && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-5 rounded-2xl">
                          <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Situação Crítica Detectada</label>
                          <p className="text-[13px] text-white font-bold leading-relaxed">{data.detail}</p>
                          <p className="text-[11px] text-slate-300 mt-3 italic">{data.desc}</p>
                        </div>

                        {data.metrics && (
                          <div className="grid grid-cols-2 gap-2">
                            {data.metrics.map((m, i) => (
                              <div key={i} className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                                <label className="text-[7px] font-black text-blue-300 uppercase tracking-widest block mb-1">{m.label}</label>
                                <p className={`text-sm font-black ${m.isNegative ? 'text-red-400' : 'text-blue-100'}`}>{m.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* EVIDENCE NODE */}
                    {nodeId.startsWith('ev') && (
                      <div className="space-y-4">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl">
                          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Evidência Operacional</label>
                          <p className="text-[12px] text-white font-bold">{data.detail}</p>
                          <p className="text-[10px] text-slate-300 mt-3">Fonte: {data.desc}</p>
                        </div>

                        {data.metrics && (
                          <div className="grid grid-cols-2 gap-2">
                            {data.metrics.map((m, i) => (
                              <div key={i} className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                                <label className="text-[7px] font-black text-indigo-300 uppercase mb-1 block">{m.label}</label>
                                <p className="text-sm font-black text-indigo-100">{m.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* HYPOTHESIS/CHANCE NODE */}
                    {nodeId.startsWith('hyp') && (
                      <div className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl border-dashed">
                          <label className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-2 block">Projeção Probabilística</label>
                          <p className="text-[12px] text-white font-bold">{data.detail}</p>
                          <p className="text-[10px] text-slate-300 mt-3">{data.desc}</p>
                        </div>

                        {data.metrics && (
                          <div className="grid grid-cols-2 gap-2">
                            {data.metrics.map((m, i) => (
                              <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                                <label className="text-[7px] font-black text-amber-300 uppercase mb-1 block">{m.label}</label>
                                <p className="text-sm font-black text-amber-100">{m.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DECISION POINT */}
                    {nodeId.startsWith('dec') && (
                      <div className="space-y-4">
                        <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl">
                          <label className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-2 block">Ponto de Decisão</label>
                          <p className="text-[12px] text-white font-bold">{data.detail}</p>
                          <p className="text-[10px] text-slate-300 mt-3">{data.desc}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <p className="text-[9px] font-black text-white uppercase tracking-widest">Alternativas Disponíveis</p>
                          </div>

                          {(() => {
                            const allOptions = signalCase.situationData.decisionPoints[0].options
                              .map((opt, idx) => ({ opt, idx }));
                            const chosenOptionId = chosenOptionPerDecision[selectedNodeData.nodeId];
                            const chosenIdx = chosenOptionId ?
                              parseInt(chosenOptionId.replace('opt', '').split('-')[1]) - 1 :
                              null;

                            // Show all options, but highlight chosen one
                            const displayOptions = chosenIdx !== null
                              ? allOptions.filter(({ idx }) => idx === chosenIdx)
                              : allOptions;

                            return displayOptions
                              .map(({ opt, idx }) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-black text-purple-300">
                                    {idx + 1}
                                  </div>
                                  <p className="text-[12px] font-black text-white uppercase tracking-tight pt-0.5">{opt.option}</p>
                                </div>
                                <div className="bg-purple-500/20 px-2 py-0.5 rounded text-[8px] font-black text-purple-300">
                                  {opt.successProbability}% SUCESSO
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                  <label className="text-[6px] font-black text-red-400 uppercase tracking-widest mb-1 block">Risco</label>
                                  <p className="text-[10px] text-slate-300 font-bold leading-tight">{opt.consequence}</p>
                                </div>
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                  <label className="text-[6px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">Ação</label>
                                  <p className="text-[10px] text-slate-300 font-bold leading-tight">{opt.actionDerived}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (onDecisionRecorded) {
                                    onDecisionRecorded({
                                      stage: 5,
                                      nodeId: `decision-option-${idx}`,
                                      nodeType: 'decision-choice',
                                      title: opt.option,
                                      summary: `${opt.option} (${opt.successProbability}%) → ${opt.actionDerived}`
                                    });
                                    setSelectedCard(null);
                                  }
                                }}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-[0.98]"
                              >
                                Escolher Esta Alternativa
                              </button>
                            </div>
                          ))
                          })()}
                        </div>
                      </div>
                    )}

                    {/* OPTION/ALTERNATIVE */}
                    {nodeId.includes('opt') && (() => {
                      const parts = nodeId.replace('opt', '').split('-');
                      const optIdx = parseInt(parts[1]) - 1;
                      const opt = signalCase.situationData.decisionPoints[0].options[optIdx];

                      return (
                        <div className="space-y-4">
                          <div className="bg-teal-500/10 border border-teal-500/20 p-5 rounded-2xl">
                            <label className="text-[8px] font-black text-teal-400 uppercase tracking-widest mb-2 block">Alternativa Selecionada</label>
                            <p className="text-[12px] text-white font-bold">{opt?.option || data.title}</p>
                            <p className="text-[10px] text-slate-300 mt-3">{opt?.description || data.detail}</p>
                          </div>

                          {opt && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                <label className="text-[7px] font-black text-amber-400 uppercase tracking-widest mb-2 block">Taxa de Sucesso</label>
                                <p className="text-lg font-black text-amber-100">{opt.successProbability}%</p>
                              </div>
                              <div className="p-4 bg-slate-500/5 border border-slate-500/10 rounded-xl">
                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável</label>
                                <p className="text-sm font-bold text-slate-100">{opt.owner || 'Não definido'}</p>
                              </div>
                            </div>
                          )}

                          {opt && (
                            <div className="space-y-3">
                              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                <label className="text-[7px] font-black text-red-400 uppercase tracking-widest mb-2 block">Risco / Consequência</label>
                                <p className="text-[11px] text-slate-200 leading-relaxed">{opt.consequence}</p>
                              </div>
                              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                <label className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Ação Derivada</label>
                                <p className="text-[11px] text-slate-200 leading-relaxed">{opt.actionDerived}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ACTION/OUTCOME */}
                    {nodeId.includes('act') && (
                      <div className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                          <label className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Ação Recomendada</label>
                          <p className="text-[12px] text-white font-bold">{data.title}</p>
                          <p className="text-[10px] text-slate-300 mt-3">{data.detail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ACTION FOOTER DARK */}
            <div className="p-10 border-t border-slate-800/50 bg-[#1A1D23]">
              {selectedNodeData.nodeId.startsWith('dec') ? (
                <div className="flex items-center justify-center p-5 bg-[#20242B] rounded-2xl border border-slate-700/50 shadow-inner">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse text-center">Selecione uma alternativa acima</p>
                </div>
              ) : selectedNodeData.nodeId.includes('opt') || selectedNodeData.nodeId.includes('act') ? (
                <div className="text-center">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-3">Ramificação em análise</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (onDecisionRecorded && selectedNodeData) {
                      onDecisionRecorded({
                        stage: getNodeDepth(selectedNodeData.nodeId),
                        nodeId: selectedNodeData.nodeId,
                        nodeType: selectedNodeData.nodeId === 'signal' ? 'signal' : selectedNodeData.nodeId.startsWith('ev') ? 'evidence' : 'factor',
                        title: selectedNodeData.data.title,
                        summary: selectedNodeData.data.detail
                      });
                      setSelectedCard(null);
                    }
                  }}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 rounded-2xl py-5 font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {(() => {
                    if (selectedNodeData.nodeId === 'signal') return 'Registrar Sinal';
                    if (selectedNodeData.nodeId.startsWith('ev')) return 'Registrar Evidência';
                    if (selectedNodeData.nodeId.startsWith('hyp')) return 'Registrar Hipótese';
                    return 'Registrar';
                  })()}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-100 px-10 py-6 shrink-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Selecione um nó para explorar o caminho de decisão</p>
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
