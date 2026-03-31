"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Overview from './pages/Overview';
import Signals from './pages/Signals';
import Actions from './pages/Actions';
import Performance from './pages/Performance-v8.1';
import Accounts from './pages/Accounts';
import Outbound from './pages/Outbound';
import PaidMedia from './pages/PaidMedia';
import SeoInbound from './pages/SeoInbound';
import Integrations from './pages/Integrations';
import Assistant from './pages/Assistant';
import Contacts from './pages/Contacts';
import ABMStrategy from './pages/AbmStrategy';
import ABXOrchestration from './pages/ABXOrchestration';
import CrossIntelligence from './pages/CrossIntelligence';
import Settings from './pages/Settings';
import { Modal, Button } from './components/ui';
import { Rocket, Target, Users, Zap } from 'lucide-react';

export default function App({ initialPage = 'visao-geral' }: { initialPage?: string }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [subPage, setSubPage] = useState('principal');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Sync activePage if initialPage changes (e.g. on navigation)
  React.useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  const getPageTitle = (id: string) => {
    switch (id) {
      case 'visao-geral': return 'Visão Geral';
      case 'sinais': return 'Sinais';
      case 'acoes': return 'Fila de Ações';
      case 'desempenho': return 'Análise de Desempenho';
      case 'contas': return 'Contas';
      case 'seo-inbound': return 'SEO & Inbound';
      case 'midia-paga': return 'Mídia Paga';
      case 'outbound': return 'Outbound';
      case 'estrategia-abm': return 'Estratégia ABM';
      case 'orquestracao-abx': return 'Orquestração ABX';
      case 'inteligencia-cruzada': return 'Inteligência Cruzada';
      case 'governanca-operacional': return 'Governança Operacional';
      case 'assistente': return 'Assistente';
      case 'integracoes': return 'Integrações';
      case 'contatos': return 'Contatos';
      case 'configuracoes': return 'Configurações';
      default: return 'Canopi Platform';
    }
  };

  const getBreadcrumbs = (id: string) => {
    if (id === 'acoes') return ['CANOPI', 'REVENUE OPS'];
    if (id === 'contas' || id === 'sinais') return ['CANOPI', 'INTELIGÊNCIA'];
    if (id === 'estrategia-abm' || id === 'orquestracao-abx' || id === 'inteligencia-cruzada') return ['CANOPI', 'ESTRATÉGIA'];
    if (id === 'governanca-operacional') return ['CANOPI', 'CONFIGURAÇÕES'];
    if (id === 'outbound') return ['CANOPI', 'OUTBOUND'];
    if (id === 'integracoes') return ['CANOPI', 'CONFIGURAÇÕES', 'INTEGRAÇÕES'];
    if (id === 'assistente') return ['CANOPI', 'ASSISTENTE'];
    if (id === 'contatos') return ['CANOPI', 'CONTATOS'];
    return ['CANOPI'];
  };

  const renderPage = () => {
    switch (activePage) {
      case 'visao-geral':
        return <Overview />;
      case 'sinais':
        return <Signals />;
      case 'acoes':
        return <Actions />;
      case 'desempenho':
        return <Performance />;
      case 'contas':
        return <Accounts setActivePage={setActivePage} />;
      case 'seo-inbound':
        return <SeoInbound />;
      case 'outbound':
        return <Outbound />;
      case 'midia-paga':
        return <PaidMedia />;
      case 'integracoes':
        return <Integrations />;
      case 'assistente':
        return <Assistant />;
      case 'contatos':
        return <Contacts />;
      case 'estrategia-abm':
        return <ABMStrategy subPage={subPage} />;
      case 'orquestracao-abx':
        return <ABXOrchestration />;
      case 'inteligencia-cruzada':
        return <CrossIntelligence />;
      case 'configuracoes':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <span className="text-2xl font-bold">?</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{getPageTitle(activePage)}</h2>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Esta tela está em desenvolvimento e será integrada em breve nesta base modular.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onNewCampaign={() => setIsCampaignModalOpen(true)}
      />
      
      <div className="ml-60 flex flex-col min-h-screen">
        <Topbar 
          title={getPageTitle(activePage)} 
          breadcrumbs={getBreadcrumbs(activePage)} 
          activePage={activePage}
          setActivePage={(page) => {
            setActivePage(page);
            setSubPage('principal');
          }}
          subPage={subPage}
          setSubPage={setSubPage}
        />
        
        <main className={`flex-1 max-w-[1600px] mx-auto w-full ${['desempenho', 'acoes', 'sinais'].includes(activePage) ? '' : 'p-8'}`}>
          {renderPage()}
        </main>

        <footer className="p-8 border-t border-slate-100 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 opacity-40">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Canopi</span>
              <div className="h-3 w-px bg-slate-300"></div>
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Intel Excels</span>
            </div>
          </div>
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
            &copy; 2026 · Todos os direitos reservados
          </p>
        </footer>
      </div>

      {/* Nova Campanha Modal */}
      <Modal 
        isOpen={isCampaignModalOpen} 
        onClose={() => setIsCampaignModalOpen(false)}
        title="Criar Nova Campanha"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            Selecione o tipo de campanha que deseja iniciar. Nossa IA irá sugerir as melhores plays baseadas no seu histórico de Cross-Intelligence.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { title: 'Campanha ABM 1:1', desc: 'Foco em contas estratégicas de alto valor.', icon: Target, color: 'brand' },
              { title: 'Campanha ABX Awareness', desc: 'Aumente o alcance em clusters específicos.', icon: Rocket, color: 'blue' },
              { title: 'Campanha de Expansão', desc: 'Identifique oportunidades em clientes atuais.', icon: Zap, color: 'amber' },
              { title: 'Play de Relacionamento', desc: 'Engajamento C-Level e Peer-to-peer.', icon: Users, color: 'emerald' },
            ].map((type, i) => (
              <button 
                key={i}
                className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-left group"
              >
                <div className={`p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                  <type.icon className={`w-5 h-5 text-${type.color === 'brand' ? 'brand' : type.color + '-600'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{type.title}</h4>
                  <p className="text-[11px] text-slate-500">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsCampaignModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1">Continuar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
