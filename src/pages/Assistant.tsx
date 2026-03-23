"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Badge } from '../components/ui';
import { Bot, Zap, Clock, CheckCircle, MessageSquare, Play, RefreshCw, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou o estrategista de IA da Canopi | intel excels. Como posso ajudar com a sua estratégia B2B hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
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
          <p className="text-slate-500 mt-1">Gerencie suas automações, interaja com a IA e monitore a execução de tarefas estratégicas.</p>
        </div>
        <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800">
          <Bot className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'TAREFAS EM EXECUÇÃO', val: '12', icon: Play, color: 'text-blue-500' },
          { label: 'INSIGHTS GERADOS', val: '148', icon: Bot, color: 'text-emerald-500' },
          { label: 'AÇÕES AUTOMÁTICAS', val: '842', icon: Zap, color: 'text-amber-500' },
          { label: 'TEMPO ECONOMIZADO', val: '42h', icon: Clock, color: 'text-purple-500' },
          { label: 'CONFIANÇA DA IA', val: '98.2%', icon: CheckCircle, color: 'text-emerald-500' },
        ].map((kpi, i) => (
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
              placeholder="Pergunte sobre plays, contas, ou estratégias ABM/ABX..." 
              className="flex-1 p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 w-12 h-12 flex items-center justify-center p-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Task Queue */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">Fila de Tarefas Operacionais</h3>
          <div className="space-y-4">
            {[
              { task: 'Otimizar Bid LinkedIn', status: 'Executando', icon: RefreshCw },
              { task: 'Gerar Relatório ABM', status: 'Pendente', icon: Clock },
              { task: 'Analisar Leads Inbound', status: 'Concluído', icon: CheckCircle },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <t.icon className={`w-5 h-5 ${t.status === 'Executando' ? 'text-blue-500 animate-spin' : t.status === 'Concluído' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{t.task}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};


export default Assistant;
