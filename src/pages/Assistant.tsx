"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Badge } from '../components/ui';
import { Bot, Zap, Clock, CheckCircle, MessageSquare, Play, RefreshCw, Send, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { useAccountDetail } from '../context/AccountDetailContext';
import { contasMock } from '../data/accountsData';
import { advancedSignals } from '../data/signalsV6';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextBlock = (): ContextBlock => ({
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
  });

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

      <div className="grid grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="col-span-2 p-6 flex flex-col h-[500px]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600"/> Chat com Assistente Estratégico
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-lg shadow-sm text-sm max-w-[85%] prose prose-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white prose-invert'
                      : 'bg-white text-slate-800 border border-slate-100'
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
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

          <div className="mt-4 flex gap-2">
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
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 w-12 h-12 flex items-center justify-center p-0">
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
