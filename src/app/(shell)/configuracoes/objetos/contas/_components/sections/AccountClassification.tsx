'use client';

import React from 'react';
import { Zap, Activity } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';
import { CLASSIFICATION_OPTIONS } from '@/src/lib/contaConnectorsV2';

export function AccountClassification() {
  const { conta, updateCustomConfig } = useContasConfig();

  return (
    <section id="classificacao" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">5. Classificação ABM / ABX</h2>
        <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">Configuração de status inteligentes que regem o comportamento da conta.</p>
      </header>

      <div className="grid grid-cols-2 gap-8">
         <Card className="p-8 border-slate-200 space-y-8">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 border-b border-slate-100 pb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              Status Operacionais
            </h3>
            <div className="space-y-6 divide-y divide-slate-50">
              {Object.entries(CLASSIFICATION_OPTIONS).map(([key, options]) => (
                <div key={key} className="pt-6 first:pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-tight">{key.replace(/_/g, ' ')}</label>
                    <select className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                       <option>PRIORIDADE: CANOPI</option>
                       <option>PRIORIDADE: FONTE</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(options as string[]).map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateCustomConfig({ [key]: opt })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                          (conta as any)[key] === opt 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-500 ring-offset-1' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
         </Card>

         <div className="space-y-6">
            <Card className="p-8 border-slate-200 bg-slate-900 text-white">
               <h3 className="font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Lógica de Derivação
               </h3>
               <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                  Se a conta não possuir classificação na fonte, o Canopi tentará derivar o <strong className="text-white">ABM_TIER</strong> baseado na matriz de ICP definida na etapa 4.
               </p>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Derivação Automática</span>
                     <Badge className="bg-emerald-500 text-white border-none">Ativa</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase">Override Manual (Cockpit)</span>
                     <Badge className="bg-blue-500 text-white border-none">Priority</Badge>
                  </div>
               </div>
            </Card>
            <Card className="p-8 border-blue-100 bg-blue-50/20">
               <h4 className="text-xs font-black text-blue-900 uppercase mb-2">Nota de Orquestração</h4>
               <p className="text-xs text-blue-700 italic font-medium leading-relaxed">
                  Mudanças no <strong className="font-black">orchestration_status</strong> disparam gatilhos automáticos de inclusão/exclusão em audiências de Ads síncronas.
               </p>
            </Card>
         </div>
      </div>
    </section>
  );
}
