"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Plus, 
  ChevronDown,
  Zap,
  Link,
  Search,
  CheckCircle,
  Database,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { Button, Modal } from '../components/ui';

interface ActionItem {
  id: string;
  priority: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';
  category: string;
  title: string;
  description: string;
  ownerName: string | null;
  ownerAvatar?: string;
  slaText: string;
  slaStatus: 'vencido' | 'alerta' | 'ok';
  buttons: { label: string; primary: boolean }[];
}

const actionsList: ActionItem[] = [
  {
    id: 'a1',
    priority: 'CRÍTICA',
    category: 'Marketing',
    title: 'Corrigir roteamento',
    description: 'O fluxo de inbound para contas Fortune 500 está sendo direcionado para a fila geral devido a um erro na tag de enriquecimento do...',
    ownerName: 'M. Silva',
    ownerAvatar: 'https://i.pravatar.cc/150?u=msilva',
    slaText: '2h (Vencido)',
    slaStatus: 'vencido',
    buttons: [
      { label: 'Ajustar', primary: true },
      { label: 'Escalar', primary: false }
    ]
  },
  {
    id: 'a2',
    priority: 'ALTA',
    category: 'Receita',
    title: 'Atribuir follow-up',
    description: '3 contas ABM Tier 1 demonstraram alto sinal de intenção no G2 nas últimas 24 horas. Necessário SDR prioritário.',
    ownerName: null,
    slaText: '4h restante',
    slaStatus: 'ok',
    buttons: [
      { label: 'Atribuir', primary: true }
    ]
  },
  {
    id: 'a3',
    priority: 'MÉDIA',
    category: 'Marketing',
    title: 'Auditar campanha',
    description: 'Campanha "Q3 Cloud Migration" apresenta CTR 40% abaixo do benchmark histórico. Revisar criativos e audiência.',
    ownerName: 'F. Rocha',
    ownerAvatar: 'https://i.pravatar.cc/150?u=frocha',
    slaText: '12h restante',
    slaStatus: 'ok',
    buttons: [
      { label: 'Auditar', primary: false }
    ]
  },
  {
    id: 'a4',
    priority: 'BAIXA',
    category: 'Dados',
    title: 'Conectar Search Console',
    description: 'Integração pendente para o novo subdomínio de recursos. Necessário para visibilidade de palavras-chave de intenção.',
    ownerName: 'Tech Ops',
    ownerAvatar: 'https://i.pravatar.cc/150?u=techops',
    slaText: '2 dias',
    slaStatus: 'ok',
    buttons: [
      { label: 'Conectar', primary: true }
    ]
  },
  {
    id: 'a5',
    priority: 'ALTA',
    category: 'Estratégia',
    title: 'Reengajar conta XPTO Corp',
    description: 'A conta está inativa há 15 dias após demonstração técnica. Justificativa: Possível churn de interesse. Reativar com case de sucesso do mesmo setor.',
    ownerName: 'A. Gomes',
    ownerAvatar: 'https://i.pravatar.cc/150?u=agomes',
    slaText: '6h restante',
    slaStatus: 'ok',
    buttons: [
      { label: 'Ajustar', primary: false }
    ]
  }
];

export const Actions: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; actionType: string; content: React.ReactNode } | null>(null);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRÍTICA': return { border: 'border-l-red-500', bg: 'bg-red-100', text: 'text-red-700' };
      case 'ALTA': return { border: 'border-l-blue-600', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'MÉDIA': return { border: 'border-l-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'BAIXA': return { border: 'border-l-slate-400', bg: 'bg-slate-200', text: 'text-slate-600' };
      default: return { border: 'border-l-slate-300', bg: 'bg-slate-100', text: 'text-slate-600' };
    }
  };

  const openActionSimulation = (title: string, actionType: string) => {
    let content;
    
    switch(actionType.toUpperCase()) {
      case 'CONECTAR':
        content = (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm text-slate-500">Iniciando protocolo de integração via API para Search Console...</p>
            <div className="flex items-center justify-center gap-4 py-8 relative">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner z-10">
                <Database className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 h-1 bg-slate-100 relative overflow-hidden rounded-full">
                <div className="absolute top-0 bottom-0 left-0 w-full bg-blue-500 animate-[pulse_1.5s_ease-in-out_infinite] -translate-x-full" style={{ animationName: 'slideRight' }}></div>
                <style>{`@keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner z-10">
                <Link className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl flex items-start gap-3 border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h5 className="text-sm font-bold text-emerald-900">Conexão Estabelecida</h5>
                <p className="text-xs text-emerald-700 mt-1">Sincronização de palavras-chave iniciará em D+1. Dados já disponíveis para o Assistente IA.</p>
              </div>
            </div>
          </div>
        );
        break;
      case 'AUDITAR':
        content = (
          <div className="space-y-4 animate-in fade-in duration-500">
            <p className="text-sm text-slate-500">Rodando Inteligência Cruzada contra o histórico do Q1 e Q2...</p>
            <div className="p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Criativos</span>
                <span className="font-bold text-red-600">-40% CTR</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex"><div className="w-[30%] bg-red-500"></div></div>
              
              <div className="flex items-center justify-between text-sm pt-4">
                <span className="text-slate-500">Audiência Restrita</span>
                <span className="font-bold text-emerald-600">Alinhada (+12% Fit)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex"><div className="w-[85%] bg-emerald-500"></div></div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4" icon={<Zap className="w-4 h-4"/>}>
              Aplicar Sugestões da IA
            </Button>
          </div>
        );
        break;
      case 'ATRIBUIR':
      case 'ESCALAR':
        content = (
          <div className="space-y-4 animate-in zoom-in-95 duration-500">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Selecione o Owner Estratégico
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { name: 'M. Silva', role: 'SDR Inbound', perf: '98% SLA' },
                { name: 'J. Costa', role: 'SDR Outbound', perf: '85% SLA' },
                { name: 'A. Gomes', role: 'AE Key Account', perf: '94% SLA' }
              ].map((u, i) => (
                <div key={i} className="p-3 border border-slate-100 hover:border-blue-500 hover:bg-blue-50 cursor-pointer rounded-xl transition-all">
                  <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider mb-2">{u.role}</p>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{u.perf}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      case 'PROCESSAR':
        content = (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <p className="text-sm text-slate-500">O motor agêntico engajou a próxima melhor ação do dia.</p>
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 rounded-2xl text-white shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                <div className="h-6 w-6 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
              <div className="flex gap-2 text-xs font-bold text-blue-600">
                <Search className="w-4 h-4" /> Conta ABM Tier 1 (A carregar)
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        );
        break;
      case 'INSIGHT':
        content = (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl relative overflow-hidden">
              <Zap className="w-32 h-32 absolute -right-6 -bottom-6 text-amber-100 opacity-50" />
              <h4 className="text-amber-900 font-bold mb-2">Insight de Inteligência Cruzada</h4>
              <p className="text-amber-800 text-sm leading-relaxed relative z-10">
                Contas do setor Financeiro com a tecnologia MongoDB recém adicionada possuem 300% mais chance de converter após webinars de arquitetura.
              </p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Habilitar Play Executiva</Button>
          </div>
        );
        break;
      default:
        content = (
           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
             Ação "{actionType}" engatilhada. O sistema está orquestrando...
           </div>
        );
    }

    setModalData({ title, actionType, content });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Ações</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Fila Priorizada de Atividades de Revenue Intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold" icon={<Download className="w-4 h-4" />}>Exportar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 font-semibold" icon={<Plus className="w-4 h-4" />}>Nova Ação</Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {[
          { label: 'PRIORIDADE', value: 'Todas' },
          { label: 'TIPO', value: 'Todos' },
          { label: 'OWNER', value: 'Qualquer um' },
          { label: 'CANAL', value: 'Todos os Canais' },
          { label: 'STATUS', value: 'Pendente' },
        ].map((filter, i) => (
          <div key={i} className="flex flex-col bg-slate-50/50 rounded-xl px-4 py-2 min-w-[140px] border border-slate-100 cursor-pointer hover:border-slate-300 transition-colors">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{filter.label}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-semibold text-slate-900">{filter.value}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-4 pt-4 relative">
        {actionsList.map((action, idx) => {
          const style = getPriorityStyle(action.priority);
          // AI floating button logic for the last item exactly like the mockup image
          const isLast = idx === actionsList.length - 1; 

          return (
            <div key={action.id} className={`bg-white rounded-2xl relative transition-all border border-slate-100 shadow-sm hover:shadow-md border-l-4 ${style.border}`}>
              <div className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Title & Description */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest ${style.bg} ${style.text}`}>
                      {action.priority}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">{action.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{action.description}</p>
                </div>

                {/* Right Side: Meta & Actions */}
                <div className="flex items-center gap-8 md:min-w-[400px]">
                  
                  {/* Owner */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">OWNER</p>
                    <div className="flex items-center gap-2">
                      {action.ownerName ? (
                        <>
                          <img src={action.ownerAvatar} alt="" className="w-6 h-6 rounded-full bg-slate-200" />
                          <span className="text-sm font-bold text-slate-900">{action.ownerName}</span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-slate-400 italic">Não atribuído</span>
                      )}
                    </div>
                  </div>

                  {/* SLA */}
                  <div className="min-w-[100px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AGING/SLA</p>
                    <p className={`text-sm font-bold ${action.slaStatus === 'vencido' ? 'text-red-600' : 'text-slate-900'}`}>
                      {action.slaText}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {action.buttons.map((btn, bIdx) => (
                      <button 
                        key={bIdx}
                        onClick={() => openActionSimulation(action.title, btn.label)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                          btn.primary 
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        
        {/* Fila Health */}
        <div className="col-span-1 lg:col-span-2 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between shadow-sm gap-6">
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-900 mb-6">Saúde da Fila</h4>
            <div className="flex flex-wrap gap-6 sm:gap-10">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">14</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ações Pendentes</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight">03</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Fora do SLA</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">88%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Taxa de Resposta</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm md:max-w-xs w-full">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Health Score</p>
              <p className="text-xs text-slate-600 font-medium leading-tight">Métrica calculada em tempo real cruzando a resolução do SLA com o engajamento operacional do pipeline.</p>
            </div>
            {/* Health Score Graphic exactly matching Image 2 */}
            <div className="w-20 h-20 shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center relative">
              <div className="w-[50px] h-[50px] bg-white border-[3px] border-blue-700 rounded shadow-sm transform -rotate-[8deg] flex items-center justify-center">
                <span className="text-lg font-extrabold text-blue-700">92</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone */}
        <div className="bg-blue-700 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-md relative">
          <div>
            <h4 className="text-lg font-bold mb-3">Próximo Marco</h4>
            <p className="text-sm text-blue-100 leading-relaxed mb-6">
              Você está a 4 ações de bater a meta diária de otimização de pipeline.
            </p>
          </div>
          <button 
             onClick={() => openActionSimulation('Engajar Próximo Marco', 'PROCESSAR')}
             className="w-full bg-white text-blue-700 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
          >
            Processar Próximo
          </button>

          {/* Floating Action Button (Lightning Drop) */}
          <button 
             onClick={() => openActionSimulation('Atalho do Motor Agêntico', 'INSIGHT')}
             className="absolute -right-4 -bottom-4 w-14 h-14 bg-blue-800 border-[3px] border-white hover:bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-all cursor-pointer z-10"
          >
            <Zap className="w-6 h-6 fill-white" />
          </button>
        </div>

      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'Simulação'}
      >
        <div className="pt-2 pb-4">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};

export default Actions;

