'use client';

import React from 'react';
import { Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';

export function AccountUploadLgpd() {
  const { baseLegal, setBaseLegal } = useContasConfig();

  return (
    <section id="upload" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">7. Upload e LGPD</h2>
        <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">Gestão de bases offline via CSV com rastreabilidade mandatória e conformidade legal.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-8 space-y-8">
            <Card className="p-8 border-slate-200 bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Download className="w-48 h-48 text-slate-900" />
               </div>
               <div className="relative">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Template de Escala Canopi</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl mb-10 italic">
                     O upload por planilha é um fluxo controlado. Use apenas o template oficial para garantir que colunas de rastreabilidade e LGPD sejam preenchidas corretamente.
                  </p>
                  <div className="flex items-center gap-4">
                     <button className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-blue-200">
                       <Download className="w-5 h-5" />
                       Download Template (.CSV)
                     </button>
                     <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">
                        Upload Base Preparada
                     </button>
                  </div>
               </div>
            </Card>

            <Card className="p-8 border-emerald-200 bg-emerald-50/10 space-y-8">
               <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  Camada de Auditoria LGPD
               </h3>
               <div className="grid grid-cols-2 gap-8 divide-x divide-emerald-100 items-start">
                  <div className="space-y-6 pr-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Base Legal Declarada</label>
                        <select 
                          value={baseLegal}
                          onChange={(e) => setBaseLegal(e.target.value)}
                          className={`w-full px-4 py-3 bg-white border rounded-2xl text-xs font-black uppercase shadow-sm focus:ring-2 transition-all outline-none ${
                            baseLegal ? 'border-emerald-200 focus:ring-emerald-500' : 'border-red-200 focus:ring-red-500 ring-2 ring-red-50'
                          }`}
                        >
                           <option value="">-- SELECIONE A BASE LEGAL --</option>
                           <option value="legitimo_interesse">Legítimo Interesse (Art. 10 LGPD)</option>
                           <option value="consentimento">Consentimento Explícito (Opt-in)</option>
                           <option value="contrato">Execução de Contrato</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Responsável pela Carga</label>
                        <input type="text" placeholder="Nome do Growth/Marketing Op" className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-2xl text-xs font-black shadow-sm outline-none" />
                     </div>
                  </div>
                  <div className="space-y-6 pl-8">
                     <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 bg-white border border-emerald-200 rounded-2xl shadow-sm cursor-pointer hover:bg-emerald-50 transition-all group">
                           <input type="checkbox" className="w-5 h-5 rounded-lg border-emerald-300 text-emerald-600" />
                           <span className="text-[11px] font-black text-emerald-900 uppercase leading-snug">Rastreabilidade source_record_url disponível?</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-white border border-emerald-200 rounded-2xl shadow-sm cursor-pointer hover:bg-emerald-50 transition-all group">
                           <input type="checkbox" className="w-5 h-5 rounded-lg border-emerald-300 text-emerald-600" />
                           <span className="text-[11px] font-black text-emerald-900 uppercase leading-snug">Coluna de Opt-in/Consentimento presente?</span>
                        </label>
                     </div>
                     <div className="p-4 bg-white/50 border border-emerald-100 rounded-2xl italic text-[10px] font-bold text-emerald-600">
                       &quot;Registros sem base legal comprovada serão marcados com status ‘Risk’ e bloqueados para ações de outreach automático.&quot;
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="col-span-4 space-y-6">
            <Card className="p-8 border-slate-200 h-full">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Mapeamento do Arquivo</h3>
               <div className="space-y-4">
                  {[
                     { col: 'ID da Conta', can: 'external_account_id', sub: 'Mandatório' },
                     { col: 'Website / Domínio', can: 'primary_domain', sub: 'Mandatório' },
                     { col: 'Nome fantasia', can: 'canonical_name', sub: 'Opcional' },
                     { col: 'CNPJ', can: 'tax_id', sub: 'Dedupe key' },
                     { col: 'Responsável', can: 'account_owner', sub: 'Routing key' },
                  ].map((m, i) => (
                     <div key={i} className="pt-4 border-t border-slate-100 first:border-0 first:pt-0">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">Coluna: {m.col}</span>
                           <span className="text-[9px] font-bold text-blue-600 uppercase mb-1">{m.sub}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl text-white font-black text-[11px] tracking-tight flex items-center justify-between">
                           <span>{m.can.toUpperCase()}</span>
                           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </section>
  );
}
