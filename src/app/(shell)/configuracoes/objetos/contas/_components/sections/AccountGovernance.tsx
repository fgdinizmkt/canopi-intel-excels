'use client';

import React from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import { Card } from '@/src/components/ui';

export function AccountGovernance() {
  return (
    <section id="governanca" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">8. Governança de Mapeamento</h2>
        <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">Painel-resumo de consolidação e auditoria dos fluxos de dados.</p>
      </header>

      <Card className="p-8 border-slate-200 space-y-12">
         <div className="grid grid-cols-4 gap-6">
            <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center">
               <p className="text-4xl font-black text-blue-900 mb-2">24</p>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Campos Mapeados</p>
            </div>
            <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl text-center">
               <p className="text-4xl font-black text-emerald-900 mb-2">100%</p>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Canônicos Mandatórios</p>
            </div>
            <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl text-center">
               <p className="text-4xl font-black text-amber-900 mb-2">8</p>
               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Ativos p/ Writeback</p>
            </div>
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl text-center">
               <p className="text-4xl font-black text-slate-900 mb-2">3</p>
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Fontes de Conflito</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Visão Consolidada</h3>
               <div className="space-y-3">
                  {['Salesforce → Canopi', 'CSV Upload → Canopi', 'Canopi → Salesforce (Writeback)'].map((fluxo, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm">
                        <span className="text-xs font-black text-slate-700 uppercase">{fluxo}</span>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase">Audit Health</span>
                           <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-8 bg-slate-900 rounded-3xl relative overflow-hidden">
               <div className="absolute right-0 top-0 p-8 opacity-20"><Lock className="w-32 h-32 text-white" /></div>
               <div className="relative">
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Última Validação de Governança</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">
                     A arquitetura de dados atual foi validada em <strong className="text-white">23/04/2026</strong> por <strong className="text-white">Canopi Growth Intelligence</strong>. Nenhuma lacuna crítica pendente.
                  </p>
                  <button className="flex items-center gap-3 text-xs font-black text-white hover:text-blue-400 transition-all uppercase underline tracking-widest">
                     Ver Logs Históricos
                     <ExternalLink className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </Card>
    </section>
  );
}
