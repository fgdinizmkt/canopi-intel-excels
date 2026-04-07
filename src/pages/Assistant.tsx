"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Badge } from '../components/ui';
import { Bot, Zap, Clock, CheckCircle, MessageSquare, Play, RefreshCw, Send, Loader2, AlertTriangle, Building2, TrendingUp, Target, Lightbulb, Copy, MessageCircle } from 'lucide-react';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock } from '../data/accountsData';
import { advancedSignals } from '../data/signalsV6';
import { buildOperationalIntelligence, deriveRecommendedPlays } from '../helpers/operationalIntelligence';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { selectedAccountId } = useAccountDetail();

  // Leitura defensiva do localStorage — apenas no cliente
  useEffect(() => {
    try {
      const raw = localStorage.getItem('canopi_actions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setStoredActions(parsed as StoredAction[]);
        }
      }
    } catch {
      // localStorage malformado — ignora
    }
  }, []);

  // Conta aberta (pode ser null)
  const contaAberta = useMemo(() => {
    if (!selectedAccountId) return null;
    return contasMock.find(c => c.id === selectedAccountId) ?? null;
  }, [selectedAccountId]);

  // Sinais ativos (não arquivados, não resolvidos)
  const sinaisAtivos = useMemo(
    () => advancedSignals.filter(s => !s.archived && !s.resolved),
    [],
  );

  // Top 3 sinais críticos para o contexto
  const sinaisCriticosContexto = useMemo(() => {
    const severityOrder: Record<string, number> = { crítico: 0, alerta: 1, oportunidade: 2 };
    return [...sinaisAtivos]
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
      .slice(0, 3)
      .map(s => ({
        title: s.title,
        severity: s.severity,
        account: s.account,
        recommendation: s.recommendation,
        confidence: s.confidence,
      }));
  }, [sinaisAtivos]);

  // KPIs derivados de dados reais
  const kpis = useMemo(() => {
    const criticos = advancedSignals.filter(s => s.severity === 'crítico' && !s.archived).length;
    const prioritarias = contasMock.filter(c => c.prontidao > 70).length;
    const confidenceMedia = advancedSignals.length > 0
      ? Math.round(advancedSignals.reduce((sum, s) => sum + s.confidence, 0) / advancedSignals.length)
      : 0;

    return [
      { label: 'AÇÕES NA FILA',       val: String(storedActions.length),  icon: Play,          color: 'text-blue-500' },
      { label: 'SINAIS ATIVOS',       val: String(sinaisAtivos.length),   icon: Bot,           color: 'text-emerald-500' },
      { label: 'SINAIS CRÍTICOS',     val: String(criticos),              icon: AlertTriangle, color: 'text-red-500' },
      { label: 'CONTAS PRIORITÁRIAS', val: String(prioritarias),          icon: Building2,     color: 'text-purple-500' },
      { label: 'CONFIANÇA MÉDIA',     val: `${confidenceMedia}%`,         icon: CheckCircle,   color: 'text-emerald-500' },
    ];
  }, [storedActions, sinaisAtivos]);

  // Fila de tarefas operacionais — ações reais ou fallback em sinais críticos
  const filaOperacional = useMemo(() => {
    if (storedActions.length > 0) {
      return storedActions.slice(0, 3).map(a => ({
        task: a.title || 'Ação sem título',
        sub: a.account || '—',
        status: a.status || 'Nova',
        icon: a.status === 'Em andamento' ? RefreshCw : a.status === 'Concluída' ? CheckCircle : Clock,
      }));
    }
    // Fallback: sinais críticos como tarefas pendentes
    return advancedSignals
      .filter(s => s.severity === 'crítico' && !s.archived)
      .slice(0, 3)
      .map(s => ({
        task: s.title,
        sub: s.account,
        status: 'Pendente',
        icon: AlertTriangle,
      }));
  }, [storedActions]);

  // Plays recomendados baseados em inteligência operacional
  const recommendedPlays = useMemo(() => deriveRecommendedPlays(), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextBlock = (): ContextBlock => {
    const opIntel = buildOperationalIntelligence();
    return {
      contaAberta: contaAberta
        ? {
            nome: contaAberta.nome,
            vertical: contaAberta.vertical,
            statusGeral: contaAberta.statusGeral,
            resumoExecutivo: contaAberta.resumoExecutivo,
            prontidao: contaAberta.prontidao,
            potencial: contaAberta.potencial,
            proximaMelhorAcao: contaAberta.proximaMelhorAcao,
          }
        : null,
      sinaisCriticos: sinaisCriticosContexto,
      acoesFila: storedActions.slice(0, 3).map(a => ({
        title: a.title || 'Ação sem título',
        accountName: a.account || '—',
        status: a.status || 'Nova',
      })),
      operationalIntelligence: opIntel,
    };
  };

  const handleUsePlayInChat = (promptText: string) => {
    setInput(promptText);
  };

  const handleCopyPlay = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getUrgencyColor = (urgency: string): string => {
    if (urgency === 'crítica') return 'bg-red-50 border-red-200 text-red-900';
    if (urgency === 'alta') return 'bg-orange-50 border-orange-200 text-orange-900';
    return 'bg-blue-50 border-blue-200 text-blue-900';
  };

  const getUrgencyBadgeColor = (urgency: string): string => {
    if (urgency === 'crítica') return 'bg-red-100 text-red-700';
    if (urgency === 'alta') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Build history from current messages, excluding any leading assistant messages
    // (Gemini requires first content to be from 'user')
    const firstUserIdx = messages.findIndex(m => m.role === 'user');
    const historyToSend = firstUserIdx === -1 ? [] : messages.slice(firstUserIdx);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: historyToSend,
          context: buildContextBlock(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na comunicação com a API');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Erro:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assistente IA</h1>
          <p className="text-slate-500 mt-1">
            {contaAberta
              ? `Contexto ativo: ${contaAberta.nome} · ${contaAberta.vertical}`
              : 'Gerencie suas automações, interaja com a IA e monitore a execução de tarefas estratégicas.'}
          </p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800">
          <Bot className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2 text-slate-900">{kpi.val}</p>
          </Card>
        ))}
      </div>

      {/* Prioridades Imediatas */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-amber-900">Prioridades Imediatas</h3>
        </div>
        <div className="text-xs space-y-2">
          {(() => {
            const opIntel = buildOperationalIntelligence();
            const insights: string[] = [];
            if (opIntel.health.criticalIndicator && !opIntel.health.criticalIndicator.includes('Estável')) {
              insights.push(opIntel.health.criticalIndicator);
            }
            if (opIntel.queue.anomalies.length > 0) {
              insights.push(`⚠️ ${opIntel.queue.anomalies[0].description}`);
            }
            if (opIntel.priorities.riskAccounts.length > 0) {
              insights.push(`🎯 Conta em risco: ${opIntel.priorities.riskAccounts[0].name}`);
            }
            return insights.length > 0 ? (
              insights.map((insight, i) => <p key={i} className="text-amber-800">{insight}</p>)
            ) : (
              <p className="text-amber-700">✅ Operação estável — continue monitorando</p>
            );
          })()}
        </div>
      </Card>

      {/* Plays Recomendados */}
      {recommendedPlays.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedPlays.map((play) => (
            <Card key={play.id} className={`p-4 border ${getUrgencyColor(play.urgency)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-sm">{play.title}</h4>
                    <p className="text-xs opacity-75 mt-0.5">{play.reason}</p>
                  </div>
                </div>
                <Badge className={`flex-shrink-0 text-xs ${getUrgencyBadgeColor(play.urgency)}`}>
                  {play.urgency}
                </Badge>
              </div>
              <div className="text-xs space-y-2 mt-3 pt-2 border-t border-current border-opacity-10">
                <p><span className="font-semibold">Foco:</span> {play.focus}</p>
                <p><span className="font-semibold">Ação:</span> {play.suggestedAction}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-2 border-t border-current border-opacity-10">
                <Button
                  onClick={() => handleUsePlayInChat(play.promptForChat)}
                  className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  Chat
                </Button>
                <Button
                  onClick={() => handleCopyPlay(play.promptForChat)}
                  className="flex-1 h-7 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="col-span-2 p-0 flex flex-col h-[600px] !overflow-y-auto !overflow-x-hidden">
          <div className="px-6 pt-6 pb-0 flex-shrink-0">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600"/> Chat com Assistente Estratégico
            </h3>
          </div>

          {/* Messages Area — flex-1 min-h-0 overflow-y-auto crucial para scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 bg-slate-50 p-4 mx-6 rounded-xl border border-slate-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-lg shadow-sm text-sm max-w-[90%] break-words prose prose-sm prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-headings:my-3 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-4 prose-blockquote:italic prose-blockquote:my-2 prose-a:text-blue-500 prose-a:underline ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white prose-invert'
                      : 'bg-white text-slate-800 border border-slate-100'
                  }`}
                >
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white p-3 rounded-lg shadow-sm text-sm max-w-[85%] border border-slate-100 flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando estratégia...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area — flex-shrink-0 para garantir que não encolha */}
          <div className="flex-shrink-0 mt-4 px-6 pb-6 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={contaAberta
                ? `Pergunte sobre ${contaAberta.nome}, plays, sinais ou estratégias...`
                : 'Pergunte sobre plays, contas, ou estratégias ABM/ABX...'}
              className="flex-1 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 w-12 h-12 flex items-center justify-center p-0 flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Fila Operacional */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Fila de Tarefas Operacionais</h3>
          {filaOperacional.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma tarefa na fila.</p>
          ) : (
            <div className="space-y-4">
              {filaOperacional.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <t.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      t.status === 'Em andamento' ? 'text-blue-500 animate-spin'
                      : t.status === 'Concluída'  ? 'text-emerald-500'
                      : t.status === 'Pendente'   ? 'text-red-400'
                      : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate" title={t.task}>{t.task}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.sub} · {t.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};


export default Assistant;
