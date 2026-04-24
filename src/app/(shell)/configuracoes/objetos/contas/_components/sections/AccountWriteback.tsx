'use client';

import React from 'react';
import { Zap, ArrowRightLeft } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';

export function AccountWriteback() {
  const { conta } = useContasConfig();

  return (
    <section id="writeback" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">6. Writeback (Retorno ao CRM)</h2>
        <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">Configure a direção e integridade dos dados atualizados pela Canopi na fonte de origem.</p>
      </header>

      <Card className="p-8 border-slate-200">
         <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white shadow-2xl mb-12">
            <div className="flex items-center gap-6">
               <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20"><Zap className="w-8 h-8 text-white" /></div>
               <div>
                  <p className="font-black text-2xl uppercase tracking-tighter leading-none mb-2">Master Intelligence Sync</p>
                  <p className="text-sm font-medium text-slate-400">Ativado: A Canopi atualiza o CRM automaticamente.</p>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <Badge className="bg-emerald-500 text-white border-none py-1.5 px-4 rounded-lg font-black tracking-widest text-[10px]">Habilitado</Badge>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Última Atualização: Hoje, 14:32</span>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-3">
              <ArrowRightLeft className="w-4 h-4" />
              Mapeamento de Retorno (CRM Writeback)
            </h3>
            <div className="grid grid-cols-1 gap-3">
               {conta.fieldMappings.filter(m => m.isWriteback || ['account_operating_mode', 'abm_tier', 'abx_stage'].includes(m.canonicalField)).map(m => (
                  <div key={m.canonicalField} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                     <div className="flex items-center gap-6">
                       <div className="p-3 bg-white rounded-xl border border-slate-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowRightLeft className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fonte: CANOPI CANONICAL</p>
                          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{m.canonicalField}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destino no CRM</p>
                           <input 
                             type="text" 
                             defaultValue={m.nativeField}
                             className="bg-white border-b-2 border-slate-200 focus:border-blue-600 outline-none px-2 py-1 text-sm font-black text-blue-600 text-right uppercase"
                           />
                           <p className="text-[8px] font-bold text-orange-600 mt-1 uppercase italic">Risco: Sobrescrita de Valor</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <select className="bg-slate-200 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-500">
                             <option>OVERWRITE ALL</option>
                             <option>APPEND ONLY</option>
                             <option>MANUAL REVIEW</option>
                          </select>
                          <Badge className="bg-blue-600/10 text-blue-700 text-[8px] border-none">Sync Ativo</Badge>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </Card>
    </section>
  );
}
