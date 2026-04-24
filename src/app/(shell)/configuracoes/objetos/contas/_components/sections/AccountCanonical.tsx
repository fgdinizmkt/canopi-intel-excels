'use client';

import React from 'react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';
import { CLASSIFICATION_OPTIONS } from '@/src/lib/contaConnectorsV2';

export function AccountCanonical() {
  const { conta } = useContasConfig();

  return (
    <section id="canonica" className="space-y-10">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">4. Camada Canônica</h2>
          <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">O schema rígido que estrutura o universo de Contas.</p>
        </div>
        <Badge className="bg-slate-900 text-white font-black py-2 px-4 rounded-xl">24 Campos Ativos</Badge>
      </header>

      <Card className="p-0 overflow-hidden border-slate-200">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campo Canônico</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Elegibilidade Writeback</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {conta.fieldMappings.map(map => (
                   <tr key={map.canonicalField} className="hover:bg-blue-50/30 transition-all group border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800 font-mono italic group-hover:text-blue-600 transition-all">{map.canonicalField}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Destino Final</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                         <Badge className={`${map.origin === 'source' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} text-[8px] border-none`}>
                           {map.origin?.toUpperCase() || 'CANOPI'}
                         </Badge>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col items-center">
                           <Badge className={`${map.status === 'mapped' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} border-none font-black text-[9px] uppercase`}>
                             {map.status}
                           </Badge>
                           {map.required && <span className="text-[8px] font-black text-red-500 mt-1 uppercase">Obrigatório</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex flex-col items-center gap-1">
                           <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${map.status === 'mapped' ? 'bg-emerald-500' : 'bg-slate-300'} w-full`} />
                           </div>
                           <span className="text-[8px] font-black text-slate-400 uppercase">Confidence</span>
                         </div>
                      </td>
                   </tr>
                ))}
            </tbody>
         </table>
      </Card>
    </section>
  );
}
