'use client';

import React from 'react';
import { Users, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

interface StakeholderPulseProps {
  stats: {
    total: number;
    decisors: number;
    sponsors: number;
    blockers: number;
    criticalRisk: number;
  };
}

export const StakeholderPulse: React.FC<StakeholderPulseProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all group">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Stakeholders</span>
        </div>
        <div className="text-2xl font-black text-slate-100">{stats.total}</div>
        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Mapeados no total</div>
      </div>

      <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all group">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Decisores</span>
        </div>
        <div className="text-2xl font-black text-slate-100">{stats.decisors}</div>
        <div className="text-[10px] text-emerald-500 mt-1 uppercase font-bold">Comitê Principal</div>
      </div>

      <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all group">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Sponsors</span>
        </div>
        <div className="text-2xl font-black text-slate-100">{stats.sponsors}</div>
        <div className="text-[10px] text-blue-400 mt-1 uppercase font-bold">Atalhos Estratégicos</div>
      </div>

      <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 hover:border-red-500/30 transition-all group">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none">Blockers</span>
        </div>
        <div className="text-2xl font-black text-red-500">{stats.blockers}</div>
        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Riscos Mapeados</div>
      </div>

      <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-200 text-[10px] uppercase font-bold tracking-widest leading-none">Risco Político</span>
        </div>
        <div className="text-2xl font-black text-blue-400">{stats.criticalRisk}</div>
        <div className="text-[10px] text-blue-500 mt-1 uppercase font-bold">Alerta de Cobertura</div>
      </div>
    </div>
  );
};
