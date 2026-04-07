"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Badge } from '../components/ui';
import { Bot, Zap, Clock, CheckCircle, MessageSquare, Play, RefreshCw, Send, Loader2, AlertTriangle, Building2, TrendingUp, Target, Copy, MessageCircle, ChevronRight, Plus } from 'lucide-react';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock, initialActions, type Priority } from '../data/accountsData';
import { advancedSignals } from '../data/signalsV6';
import { buildOperationalIntelligence, deriveRecommendedPlays } from '../helpers/operationalIntelligence';

// ─── Tipos de cards acionáveis ─────────────────────────────────────
type ResponseCard =
  | { type: 'existing_account'; accountId: string; slug: string; name: string; reason?: string }
  | { type: 'existing_signal';  signalId: string;  name: string; severity: string; account: string; reason?: string }
  | { type: 'existing_action';  actionId: string;  title: string; priority: string; accountName: string; reason?: string }
  | { type: 'new_action'; title: string; reason: string; urgency: string; accountName: string; relatedAccountId?: string; focus?: string; suggestedAction: string; destination?: string };

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  cards?: ResponseCard[];
}

interface StoredAction {
  id: string;
  title: string;
  account: string;
  status: string;
  priority?: string;
}

interface ContextBlock {
  contaAberta: {
    nome: string;
    vertical: string;
    statusGeral: string;
    resumoExecutivo: string;
    prontidao: number;
    potencial: number;
    proximaMelhorAcao: string;
  } | null;
  sinaisCriticos: Array<{
    title: string;
    severity: string;
    account: string;
    recommendation: string;
    confidence: number;
  }>;
  acoesFila: Array<{
    title: string;
    accountName: string;
    status: string;
  }>;
  availableEntities?: {
    accounts: Array<{ id: string; slug: string; name: string; status?: string }>;
    signals: Array<{ id: string; title: string; severity: string; account: string }>;
    actions: Array<{ id: string; title: string; priority: string; accountName: string }>;
  };
  operationalIntelligence: {
    performance: {
      totalPipeline: string;
      conversionRate: number;
      bestOrigin: string;
      activeAccounts: number;
      totalSignals: number;
      resolvedSignals: number;
    };
    queue: {
      totalActions: number;
      criticalActions: number;
      delayedActions: number;
      noOwnerActions: number;
      anomalies: Array<{
        type: string;
        title: string;
        description: string;
        severity: string;
      }>;
    };
    priorities: {
      topSignals: Array<{
        id: string;
        title: string;
        account: string;
        severity: string;
        confidence: number;
      }>;
      topAnomalies: Array<{
        type: string;
        title: string;
        description: string;
        severity: string;
      }>;
      riskAccounts: Array<{
        name: string;
        reason: string;
        riskLevel: string;
      }>;
    };
    health: {
      operationalSummary: string;
      criticalIndicator: string;
      nextImmediateAction: string;
    };
  };
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou o estrategista de IA da Canopi | intel excels. Como posso ajudar com a sua estratégia B2B hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storedActions, setStoredActions] = useState<StoredAction[]>([]);
  const [createdActionIds, setCreatedActionIds] = useState<Set<string>>(new Set());
  const [createdActionMap, setCreatedActionMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { selectedAccountId, createAction } = useAccountDetail();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('canopi_actions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setStoredActions(parsed as StoredAction[]);
      }
    } catch {}
  }, []);

  const contaAberta = useMemo(() => {
    if (!selectedAccountId) return null;
    return contasMock.find(c => c.id === selectedAccountId) ?? null;
  }, [selectedAccountId]);

  const sinaisAtivos = useMemo(() => advancedSignals.filter(s => !s.archived && !s.resolved), []);

  const sinaisCriticosContexto = useMemo(() => {
    const severityOrder: Record<string, number> = { crítico: 0, alerta: 1, oportunidade: 2 };
    return [...sinaisAtivos]
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
      .slice(0, 3)
      .map(s => ({ title: s.title, severity: s.severity, account: s.account, recommendation: s.recommendation, confidence: s.confidence }));
  }, [sinaisAtivos]);

  const kpis = useMemo(() => {
    const criticos = advancedSignals.filter(s => s.severity === 'crítico' && !s.archived).length;
    const prioritarias = contasMock.filter(c => c.prontidao > 70).length;
    const confidenceMedia = advancedSignals.length > 0
      ? Math.round(advancedSignals.reduce((sum, s) => sum + s.confidence, 0) / advancedSignals.length)
      : 0;

    return [
      { label: 'Fila de Ações', val: String(storedActions.length), icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Sinais Ativos', val: String(sinaisAtivos.length), icon: Bot, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Críticos', val: String(criticos), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Prioritárias', val: String(prioritarias), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Confiança', val: `${confidenceMedia}%`, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];
  }, [storedActions, sinaisAtivos]);

  const filaOperacional = useMemo(() => {
    if (storedActions.length > 0) {
      return storedActions.slice(0, 3).map(a => ({
        task: a.title || 'Ação sem título',
        sub: a.account || '—',
        status: a.status || 'Nova',
        icon: a.status === 'Em andamento' ? RefreshCw : a.status === 'Concluída' ? CheckCircle : Clock,
      }));
    }
    return advancedSignals.filter(s => s.severity === 'crítico' && !s.archived).slice(0, 3).map(s => ({
      task: s.title, sub: s.account, status: 'Pendente', icon: AlertTriangle,
    }));
  }, [storedActions]);

  const recommendedPlays = useMemo(() => deriveRecommendedPlays(), []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const buildContextBlock = (): ContextBlock => {
    const opIntel = buildOperationalIntelligence();
    const availableAccounts = contasMock.filter(c => c.reconciliationStatus !== 'vazia' && (c.statusGeral !== 'Saudável' || c.prontidao > 70)).slice(0, 8).map(c => ({ id: c.id, slug: c.slug, name: c.nome, status: c.statusGeral }));
    const availableSignals = sinaisAtivos.filter(s => s.severity === 'crítico').slice(0, 5).map(s => ({ id: s.id, title: s.title, severity: s.severity, account: s.account }));
    const availableActions = initialActions.filter(a => a.priority === 'Crítica' || a.priority === 'Alta').slice(0, 5).map(a => ({ id: a.id, title: a.title, priority: a.priority, accountName: a.accountName || '—' }));

    return {
      contaAberta: contaAberta ? { nome: contaAberta.nome, vertical: contaAberta.vertical, statusGeral: contaAberta.statusGeral, resumoExecutivo: contaAberta.resumoExecutivo, prontidao: contaAberta.prontidao, potencial: contaAberta.potencial, proximaMelhorAcao: contaAberta.proximaMelhorAcao } : null,
      sinaisCriticos: sinaisCriticosContexto,
      acoesFila: storedActions.slice(0, 3).map(a => ({ title: a.title || 'Ação sem título', accountName: a.account || '—', status: a.status || 'Nova' })),
      availableEntities: { accounts: availableAccounts, signals: availableSignals, actions: availableActions },
      operationalIntelligence: opIntel,
    };
  };

  const validateCards = (cards: ResponseCard[], ctx: ContextBlock): ResponseCard[] => {
    if (!ctx.availableEntities) return [];
    const validAccountSlugs = new Set(ctx.availableEntities.accounts.map(a => a.slug));
    const validSignalIds = new Set(ctx.availableEntities.signals.map(s => s.id));
    const validActionIds = new Set(ctx.availableEntities.actions.map(a => a.id));

    return cards.filter(card => {
      if (card.type === 'existing_account') return validAccountSlugs.has(card.slug);
      if (card.type === 'existing_signal') return validSignalIds.has(card.signalId);
      if (card.type === 'existing_action') return validActionIds.has(card.actionId);
      if (card.type === 'new_action') return !!card.title && !!card.accountName;
      return false;
    });
  };

  const checkActionDuplicate = (title: string, accountName: string): boolean => {
    const titleLower = title.toLowerCase().slice(0, 20);
    return initialActions.some(a => a.accountName?.toLowerCase() === accountName.toLowerCase() && a.title?.toLowerCase().includes(titleLower)) ||
           storedActions.some(a => a.account?.toLowerCase() === accountName.toLowerCase() && a.title?.toLowerCase().includes(titleLower));
  };

  const handleCreateAction = (card: ResponseCard & { type: 'new_action' }) => {
    if (checkActionDuplicate(card.title, card.accountName)) return;
    const priorityMap: Record<string, Priority> = { crítica: 'Crítica', alta: 'Alta', média: 'Média' };
    const actionId = createAction({ title: card.title, priority: priorityMap[card.urgency] ?? 'Alta', category: 'ABX', channel: 'ABX', accountName: card.accountName, relatedAccountId: card.relatedAccountId, accountContext: card.focus ?? '', ownerName: null, nextStep: card.suggestedAction, sourceType: 'signal', description: card.reason });
    setCreatedActionIds(prev => new Set([...prev, `${card.title}|${card.accountName}`]));
    setCreatedActionMap(prev => ({ ...prev, [`${card.title}|${card.accountName}`]: actionId as string }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const firstUserIdx = messages.findIndex(m => m.role === 'user');
    const historyToSend = firstUserIdx === -1 ? [] : messages.slice(firstUserIdx);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ctx = buildContextBlock();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historyToSend, context: ctx }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na API');
      const validatedCards = data.cards ? validateCards(data.cards, ctx) : [];
      setMessages(prev => [...prev, { role: 'assistant', content: data.text, cards: validatedCards }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Falha técnica:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponseCards = (cards: ResponseCard[]) => {
    if (!cards || cards.length === 0) return null;
    return (
      <div className="space-y-2.5 mt-4">
        {cards.map((card, idx) => {
          if (card.type === 'new_action') {
            const isDuplicate = checkActionDuplicate(card.title, card.accountName);
            const isCreated = createdActionIds.has(`${card.title}|${card.accountName}`);
            const createdActionId = createdActionMap[`${card.title}|${card.accountName}`];
            const targetLink = createdActionId ? `/acoes?actionId=${createdActionId}` : '/acoes';
            return (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                  <Badge className={`text-[10px] uppercase font-bold ${card.urgency === 'crítica' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{card.urgency}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-3">{card.reason}</p>
                <div className="flex gap-2">
                  {isDuplicate || isCreated ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-8 text-[11px] font-bold bg-emerald-500 text-white rounded flex items-center justify-center gap-1.5"><CheckCircle className="w-3 h-3" /> {isCreated ? 'Criada na Fila' : 'Já existe na fila'}</div>
                      <Link href={targetLink} className="h-8 px-3 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded flex items-center gap-1 hover:bg-slate-200 transition-all">Ver Ação <ChevronRight className="w-3 h-3" /></Link>
                    </div>
                  ) : (
                    <Button onClick={() => handleCreateAction(card)} className="flex-1 h-8 text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700"><Plus className="w-3 h-3 mr-1" /> Criar na Fila</Button>
                  )}
                  <Button onClick={() => setInput(card.suggestedAction)} className="flex-1 h-8 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"><MessageCircle className="w-3 h-3 mr-1" /> Investigar</Button>
                </div>
              </div>
            );
          }

          // Branch: existing_account
          if (card.type === 'existing_account') {
            return (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-all flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500"><Building2 className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{card.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.reason || 'Contexto da conta.'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">Conta</Badge>
                    <Link href={`/contas/${card.slug}`} className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-1">Ver Contexto <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            );
          }

          // Branch: existing_signal
          if (card.type === 'existing_signal') {
            return (
              <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-amber-200 transition-all flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-500"><Zap className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{card.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.reason || 'Sinal tático para investigação.'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="bg-amber-50 text-amber-700 text-[10px] uppercase font-bold">{card.severity}</Badge>
                    <Link href={`/sinais?signalId=${card.signalId}`} className="text-[11px] font-black text-amber-600 hover:underline flex items-center gap-1">Ver Sinal <ChevronRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            );
          }

          // Branch: existing_action
          return (
            <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-200 transition-all flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-500"><Target className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{(card as any).title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.reason || 'Ação operacional em andamento.'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold">{(card as any).priority}</Badge>
                  <Link href={`/acoes?actionId=${(card as any).actionId}`} className="text-[11px] font-black text-emerald-600 hover:underline flex items-center gap-1">Ver Ação <ChevronRight className="w-3 h-3" /></Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      {/* Header Premium (Layout Step 12) */}
      <div className="flex justify-between items-end pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assistente Estratégico</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {contaAberta ? `Foco em Inteligência: ${contaAberta.nome}` : 'Orquestração Account-Centric & Decisão Agêntica'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 py-1.5 px-4 uppercase text-[10px] tracking-widest font-black ring-1 ring-blue-100 italic">Enterprise Edition</Badge>
        </div>
      </div>

      {/* KPIs & Prioridades (Layout Step 12) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 grid grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="p-4 bg-white border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color} mb-3 group-hover:scale-110 transition-transform`}><kpi.icon className="w-5 h-5" /></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-xl font-black text-slate-900 tracking-tighter">{kpi.val}</p>
              </div>
            </Card>
          ))}
        </div>
        <Card className="col-span-4 p-5 bg-amber-50 border-amber-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-amber-200 text-amber-600 animate-pulse"><Target className="w-6 h-6" /></div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Status Operacional</h3>
            <p className="text-sm text-amber-800 font-bold leading-tight">{buildOperationalIntelligence().health.criticalIndicator || 'Operação estabilizada.'}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-8 h-[740px]">
        {/* Chat Interface (Premium Design) */}
        <div className="col-span-8 flex flex-col h-full bg-white border border-slate-200 shadow-2xl rounded-[32px] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 bg-slate-50/40">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`p-6 rounded-[24px] text-sm leading-relaxed shadow-sm min-w-[120px] ${
                  msg.role === 'user' ? 'bg-blue-600 text-white font-medium rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none ring-1 ring-slate-900/5'
                }`}>
                  <div className={`prose prose-sm max-w-none prose-p:my-1 prose-strong:text-inherit ${msg.role === 'user' ? 'prose-invert' : ''}`}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  {msg.cards && renderResponseCards(msg.cards)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-slate-200 shadow-sm w-fit animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">IA Processando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Analise conta, sinal ou peça recomendações..." className="w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium" disabled={isLoading} />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2.5 h-12 w-12 rounded-xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center"><Send className="w-5 h-5 ml-0.5" /></Button>
            </div>
          </div>
        </div>

        {/* Sidebar Operacional (Premium Design) */}
        <div className="col-span-4 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1"><h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic">Plays Sugeridos</h3><Zap className="w-4 h-4 text-amber-500" /></div>
            {recommendedPlays.slice(0, 3).map((play) => (
              <Card key={play.id} className="p-5 border-slate-200 hover:border-blue-200 transition-all bg-white group cursor-help">
                <div className="flex items-start justify-between mb-3"><h4 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{play.title}</h4><Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase tracking-tighter">{play.urgency}</Badge></div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{play.reason}</p>
                <div className="flex gap-2">
                  <Button onClick={() => setInput(play.promptForChat)} className="flex-1 h-8 text-[11px] font-black bg-blue-700 text-white uppercase hover:bg-blue-800 transition-all">Ativar Chat</Button>
                  <Button onClick={() => navigator.clipboard.writeText(play.promptForChat)} className="h-8 w-8 p-0 bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all"><Copy className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="space-y-4 mt-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic px-1">Fila Operacional</h3>
            <div className="space-y-3">
              {filaOperacional.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><t.icon className={`w-5 h-5 ${t.status === 'Em andamento' ? 'text-blue-500 animate-spin' : t.status === 'Concluída' ? 'text-emerald-500' : 'text-slate-400'}`} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate uppercase mt-0.5" title={t.task}>{t.task}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{t.sub} <span className="opacity-40 mx-1">·</span> {t.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/acoes" className="block w-full py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-all border-2 border-dashed border-slate-100 rounded-2xl">Ver Fila Completa</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
