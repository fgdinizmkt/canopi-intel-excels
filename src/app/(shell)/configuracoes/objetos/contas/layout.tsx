'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Save,
} from 'lucide-react';
import { Badge } from '@/src/components/ui';
import { ContasConfigProvider, useContasConfig } from './_components/ContasConfigContext';

function ContasConfigLayoutInner({ children }: { children: React.ReactNode }) {
  const { isSaving, canPublish, readinessScore, save } = useContasConfig();
  
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* STICKY HEADER PRESERVADO */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/configuracoes" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Configurações de CONTAS</h1>
                <Badge className="bg-blue-100 text-blue-700 font-black">V2 ARCHITECTURE</Badge>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-0.5">OBJETOS & CRM / ENTIDADES / CONTAS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="mr-6 text-right hidden xl:block">
                <p className="text-[10px] font-black text-slate-400 uppercase">Prontidão do setup local</p>
                <div className="flex items-center gap-2">
                   <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${readinessScore > 80 ? 'bg-emerald-500' : readinessScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${readinessScore}%` }}
                      />
                   </div>
                   <span className={`text-xs font-black ${readinessScore > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>
                     {readinessScore}%
                   </span>
                </div>
             </div>
             <button 
              onClick={save}
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 disabled:opacity-50"
             >
                {isSaving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
             </button>
             <button 
              disabled={!canPublish}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${
                canPublish ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-slate-200 text-slate-400 shadow-none'
              }`}
             >
                Concluir etapa local
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 p-8">
         <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-8">
               <span>Canopi © 2026</span>
               <span>v2.7.2-Final-Hardened</span>
               <span>Branch: feature/hardened-accounts-v2</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Architecture Validated</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Rastreability Active</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default function ContasConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContasConfigProvider>
      <ContasConfigLayoutInner>
        {children}
      </ContasConfigLayoutInner>
    </ContasConfigProvider>
  );
}
