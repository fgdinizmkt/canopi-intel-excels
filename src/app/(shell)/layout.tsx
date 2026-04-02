"use client";

import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { Modal, Button } from '../../components/ui';
import { Rocket, Target, Users, Zap } from 'lucide-react';
import { AccountDetailProvider } from '../../context/AccountDetailContext';
import { AccountDetailManager } from '../../components/account/AccountDetailManager';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  return (
    <AccountDetailProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar onNewCampaign={() => setIsCampaignModalOpen(true)} />
        <div className="ml-60 flex flex-col min-h-screen flex-1">
          <Topbar />
          <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
            {children}
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
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                   <type.icon key={i} className={`w-5 h-5 text-${type.color === 'brand' ? 'brand' : type.color + '-600'}`} />
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
    </AccountDetailProvider>
  );
}
