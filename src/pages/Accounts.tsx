"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  ExternalLink,
  ChevronDown,
  BarChart2,
  Sparkles,
  User
} from 'lucide-react';
import { Modal } from '../components/ui';

interface MockAccount {
  id: string;
  name: string;
  domain: string;
  avatar: string;
  avatarBg: string;
  avatarText: string;
  vertical: string;
  segment: string;
  stage: string;
  stageBadgeBg: string;
  stageBadgeText: string;
  engagement: number;
  engBarColor: string;
  engTextColor: string;
}

const mockAccounts: MockAccount[] = [
  {
    id: '1',
    name: 'CloudTech Solutions Inc.',
    domain: 'cloudtech.com',
    avatar: 'CT',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-600',
    vertical: 'SaaS',
    segment: 'Enterprise',
    stage: 'CONSIDERAÇÃO',
    stageBadgeBg: 'bg-amber-100/60',
    stageBadgeText: 'text-amber-700',
    engagement: 85,
    engBarColor: 'bg-blue-600',
    engTextColor: 'text-blue-600'
  },
  {
    id: '2',
    name: 'Global Logística S.A.',
    domain: 'globallog.com.br',
    avatar: 'GL',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-600',
    vertical: 'Logística',
    segment: 'Mid-Market',
    stage: 'APRENDIZADO',
    stageBadgeBg: 'bg-blue-100/60',
    stageBadgeText: 'text-blue-600',
    engagement: 42,
    engBarColor: 'bg-blue-600',
    engTextColor: 'text-blue-600'
  },
  {
    id: '3',
    name: 'Nexus Fintech',
    domain: 'nexus.finance',
    avatar: 'NX',
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-600',
    vertical: 'Finanças',
    segment: 'Enterprise',
    stage: 'DECISÃO',
    stageBadgeBg: 'bg-rose-100/60',
    stageBadgeText: 'text-rose-700',
    engagement: 98,
    engBarColor: 'bg-rose-600',
    engTextColor: 'text-rose-600'
  }
];

export const Accounts = ({ setActivePage }: { setActivePage?: (page: string) => void }) => {
  const [selectedAccount, setSelectedAccount] = useState<MockAccount | null>(null);
  
  // Simulation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const openSimModal = (title: string, msg: string) => {
    setModalData({
      title,
      content: (
        <div className="space-y-4 py-2">
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {msg}
          </p>
          <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Status da Operação
            </span>
            <span className="text-xs text-slate-500">
              Mock ilustrativo acionado na plataforma Canopi.
            </span>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen">
      
      {/* Top Navigation Tabs & Search */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-0">
        <div className="flex items-center gap-8 px-2">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-4 font-bold text-sm">Contas</button>
          <button onClick={() => openSimModal('Aba: Sinais', 'Navegação para o feed contínuo de sinais detectados. Esta interface listará comportamentos agudos por conta e pessoa em tempo real.')} className="text-slate-500 hover:text-slate-800 pb-4 font-semibold text-sm transition-colors">Sinais</button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            readOnly
            onClick={() => openSimModal('Pesquisa Global', 'Aqui abriria o painel de Omni-Busca da Canopi, capaz de encontrar Contas, Pessoas, Sinais e Oportunidades instantaneamente.')}
            type="text"
            placeholder="Buscar..."
            className="w-48 md:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contas</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gestão centralizada de empresas e inteligência de receita.</p>
        </div>

        {/* Dashboard Cards Container */}
        <div className="flex gap-4">
          {/* Card: Contas Prioritárias */}
          <div 
             onClick={() => openSimModal('Filtro Rapido', 'Isolando e recarregando tabela apenas com as 42 Contas Prioritárias atuais do funil.')}
             className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Contas Prioritárias</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-slate-900">42</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">+12%</span>
            </div>
          </div>

          {/* Card: Contas em Risco */}
          <div 
            onClick={() => openSimModal('Filtro Rapido', 'Isolando e recarregando tabela apenas com as 08 Contas em Risco mapeadas.')}
            className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 border-l-[3px] border-l-rose-600 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Contas Em Risco</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-slate-900">08</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500">+2</span>
            </div>
          </div>

          {/* Card: Alto Potencial */}
          <div 
            onClick={() => openSimModal('Filtro Rapido', 'Isolando e recarregando tabela apenas com as 124 Contas de Alto Potencial mapeadas.')}
            className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Alto Potencial</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-slate-900">124</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Ativas</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-slate-50/80 rounded-xl border border-slate-200">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 hidden sm:inline-block">Filtros:</span>
          
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors shadow-sm outline-none cursor-pointer">
            <option>Vertical: Todas</option>
            <option>SaaS</option>
            <option>Finanças</option>
            <option>Logística</option>
            <option>Saúde</option>
          </select>
          
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors shadow-sm outline-none cursor-pointer">
            <option>Segmento: Enterprise</option>
            <option>Segmento: Mid-Market</option>
            <option>Segmento: SMB</option>
          </select>
          
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors shadow-sm outline-none cursor-pointer">
            <option>Funil: Todos</option>
            <option>1. Conscientização</option>
            <option>2. Aprendizado</option>
            <option>3. Consideração</option>
            <option>4. Decisão</option>
            <option>5. Retenção</option>
          </select>
        </div>

        {/* Accounts Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pl-6 pr-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Nome da Conta</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Vertical / Segm.</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Etapa Funil</th>
                <th className="px-4 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Engajamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockAccounts.map((account) => (
                <tr 
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className="group hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  {/* Avatar and Name */}
                  <td className="pl-6 pr-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${account.avatarBg} ${account.avatarText} shadow-sm group-hover:scale-105 transition-transform`}>
                        {account.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{account.name}</h4>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{account.domain}</p>
                      </div>
                    </div>
                  </td>

                  {/* Vertical / Segment */}
                  <td className="px-4 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">{account.vertical}</p>
                      <p className="text-[10px] font-medium text-slate-400">{account.segment}</p>
                    </div>
                  </td>

                  {/* Etapa Funil */}
                  <td className="px-4 py-5">
                    <span className={`px-2.5 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest ${account.stageBadgeBg} ${account.stageBadgeText}`}>
                      {account.stage}
                    </span>
                  </td>

                  {/* Engajamento */}
                  <td className="px-4 py-5 pr-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-28">
                        <div 
                          className={`h-full ${account.engBarColor} rounded-full`}
                          style={{ width: `${account.engagement}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${account.engTextColor} min-w-[3ch]`}>
                        {account.engagement}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-slate-50/40 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">Exibindo 10 de 542 contas</p>
          </div>
        </div>

      </div>

      {/* Visão 360 - Side Drawer */}
      <AnimatePresence>
        {selectedAccount && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAccount(null)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 transition-opacity"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%', boxShadow: '-10px 0 30px rgba(0,0,0,0)' }}
              animate={{ x: 0, boxShadow: '-10px 0 40px rgba(0,0,0,0.08)' }}
              exit={{ x: '100%', boxShadow: '-10px 0 30px rgba(0,0,0,0)' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-screen w-full md:w-[480px] bg-white z-50 overflow-y-auto border-l border-slate-200/50"
            >
              <div className="p-8 space-y-8">
                
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-3">
                    <BarChart2 className="w-5 h-5 text-blue-700" />
                    <h2 className="font-bold text-slate-900 text-lg tracking-tight">Visão 360 da Conta</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedAccount(null)}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Identity Profile */}
                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-2xl shadow-sm">
                    {selectedAccount.avatar}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedAccount.name}</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                        ENTERPRISE
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                        ATIVA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro KPIs (Saúde & Expansão) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] shadow-sm">
                    <p className="text-[9px] font-extrabold text-emerald-800/60 uppercase tracking-widest mb-1.5">Score Saúde</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-3xl font-bold text-emerald-600 tracking-tight">92</span>
                      <span className="text-sm font-semibold text-emerald-600/50">/100</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fefce8] border border-[#fef08a] shadow-sm">
                    <p className="text-[9px] font-extrabold text-amber-800/60 uppercase tracking-widest mb-1.5">Prob. Expansão</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-3xl font-bold text-amber-700 tracking-tight">74</span>
                      <span className="text-sm font-semibold text-amber-700/60">%</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Play Card */}
                <div onClick={() => openSimModal('Executar Play Recomendado', 'Isto acionaria o módulo de Orquestração ABX para envolver o VP de Engenharia nessa sequência configurada de Email, Conexão no LinkedIn e Ads focados no material consumido.')} className="relative p-5 rounded-xl border border-blue-600 bg-white shadow-sm cursor-pointer hover:bg-blue-50/30 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>
                  <div className="space-y-3 pl-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-800 tracking-wide">Play Recomendado</span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                      Iniciar "Executive Outreach" com foco em eficiência operacional. O VP de Engenharia demonstrou alto engajamento em Whitepapers de ROI.
                    </p>
                  </div>
                </div>

                {/* Sinais Recentes Timeline */}
                <div className="space-y-5 pt-2">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Sinais Recentes</h4>
                  
                  <div className="space-y-6">
                    {/* Signal 1 */}
                    <div className="flex gap-4">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                      <div className="space-y-0.5 -mt-0.5 cursor-pointer" onClick={() => openSimModal('Detalhe do Sinal', 'Visualização do Job Title exato que buscou no LinkedIn, keywords atreladas a arquitetura e Cloud e quem da conta interagiu com o post.')}>
                        <p className="text-[13px] font-bold text-slate-800 leading-snug hover:text-blue-600 transition-colors">Nova Vaga: VP de Cloud Platform</p>
                        <p className="text-[11px] italic text-slate-500">Há 2 horas • LinkedIn Intent</p>
                      </div>
                    </div>
                    
                    {/* Signal 2 */}
                    <div className="flex gap-4">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                      <div className="space-y-0.5 -mt-0.5 cursor-pointer" onClick={() => openSimModal('Páginas Visitadas', 'Abertura do percurso exato do Lead "VP Eng" no site, rastreando estadia média na página de Pricing por 4m12s.')}>
                        <p className="text-[13px] font-bold text-slate-800 leading-snug hover:text-blue-600 transition-colors">Acesso ao Deck de Preços (3x)</p>
                        <p className="text-[11px] italic text-slate-500">Hoje às 10:42 • Direct Traffic</p>
                      </div>
                    </div>

                    {/* Signal 3 */}
                    <div className="flex gap-4">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                      <div className="space-y-0.5 -mt-0.5 cursor-pointer" onClick={() => openSimModal('Alerta de Adoção', 'Ruptura na tendência de requests no Endpoint X monitorado pelo Integrador Hubspot/Mixpanel. Alto indicativo de churn gap ou downsizing técnico.')}>
                        <p className="text-[13px] font-bold text-slate-800 leading-snug hover:text-blue-600 transition-colors">Redução de Uso API - Endpoint X</p>
                        <p className="text-[11px] italic text-slate-500">Ontem • Product Usage</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-5 pt-4">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Linha do Tempo</h4>
                  
                  <div className="relative space-y-8 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                     {/* Item 1 */}
                     <div className="relative pl-7 flex flex-col space-y-1">
                        <div className="absolute left-[-2.5px] top-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-blue-600 bg-white z-10" />
                        <p className="text-[10px] font-semibold text-slate-500">12 Mai, 2024</p>
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">Mapeamento de Stakeholders concluído</p>
                      </div>

                      {/* Item 2 */}
                      <div className="relative pl-7 flex flex-col space-y-1 opacity-60">
                         <div className="absolute left-[-1.5px] top-1.5 w-3 h-3 rounded-full bg-slate-200 border-2 border-white z-10" />
                         <p className="text-[10px] font-semibold text-slate-500">05 Mai, 2024</p>
                         <p className="text-[13px] font-bold text-slate-800 leading-tight">Reunião de Alinhamento Técnico</p>
                      </div>
                  </div>
                </div>

                {/* Final Drawer Buttons */}
                <div className="pt-4 pb-2 space-y-3">
                  <button onClick={() => openSimModal('Redirecionamento', 'Navegação para a página isolada do CRM "CloudTech Solutions", trazendo aba de Pessoas, Oportunidades, Atividades e Logs do Agente Autônomo.')} className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 text-white font-bold text-sm rounded-lg hover:bg-blue-800 shadow-sm transition-colors cursor-pointer group">
                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Abrir Perfil Completo
                  </button>
                  <button 
                    onClick={() => {
                       if (setActivePage) setActivePage('contatos');
                       setSelectedAccount(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-100 hover:text-blue-700 shadow-sm transition-colors cursor-pointer group"
                  >
                    <User className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                    Ver as 12 Pessoas da Conta
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalData?.title || 'Simulação Canopi'}
      >
        <div className="py-2">
          {modalData?.content}
        </div>
      </Modal>

    </div>
  );
};

export default Accounts;

