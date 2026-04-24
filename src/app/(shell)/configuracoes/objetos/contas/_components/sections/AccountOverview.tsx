'use client';

import React from 'react';
import { Activity, Settings, History } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { 
  CONNECTOR_PRESETS, 
  CONTA_CANONICAL_FIELDS_MINIMUM, 
  type ConnectorType 
} from '@/src/lib/contaConnectorsV2';

export function AccountOverview() {
  return (
    <section id="visao-geral" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-blue-600 decoration-8 underline-offset-8">1. Visão Geral</h2>
        <p className="text-lg text-slate-500 mt-6 max-w-3xl leading-relaxed font-medium">
          O módulo <strong className="text-slate-900">CONTAS</strong> gerencia a ingestão, interpretação e governança de empresas-alvo em lote. 
          É a entidade raiz de relacionamento da plataforma, impactando diretamente o Cockpit, Sinais e Orquestração ABM/X.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-6">
         <Card className="p-8 border-slate-200 hover:shadow-xl transition-all group">
            <Activity className="w-8 h-8 text-blue-600 mb-6 group-hover:scale-110 transition-all" />
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">Impacto no Sistema</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Rege o roteamento de contas, cálculo de scores de intenção e a visibilidade de clusters no Cockpit V2.</p>
         </Card>
         <Card className="p-8 border-slate-200 hover:shadow-xl transition-all group">
            <Settings className="w-8 h-8 text-purple-600 mb-6 group-hover:scale-110 transition-all" />
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">Configuração em Lote</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Abandonamos a edição individual. Toda lógica é aplicada ao universo de contas via conectores ou upload massivo.</p>
         </Card>
         <Card className="p-8 border-slate-200 hover:shadow-xl transition-all group">
            <History className="w-8 h-8 text-emerald-600 mb-6 group-hover:scale-110 transition-all" />
            <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">Status do Módulo</h3>
            <div className="mt-4 flex items-center gap-3">
               <Badge className="bg-emerald-100 text-emerald-700 font-black">PUBLISHED</Badge>
               <span className="text-[10px] font-bold text-slate-400">LAST SYNC: 2h ago</span>
            </div>
         </Card>
      </div>
    </section>
  );
}
