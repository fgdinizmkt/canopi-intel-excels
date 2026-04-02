'use client';

import React from 'react';
import { Network, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAccountDetail } from '../../context/AccountDetailContext';

export interface EnrichedContact {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  classificacao: string[];
  influencia: number;
  forcaRelacional: number;
  accountId: string;
  accountName: string;
  vertical: string;
}

interface StakeholderRadarProps {
  contacts: EnrichedContact[];
}

export const StakeholderRadar: React.FC<StakeholderRadarProps> = ({ contacts }) => {
  const { openAccount } = useAccountDetail();

  const getBadgeColor = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'sponsor': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
      case 'decisor': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'blocker': return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-slate-500 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {contacts.map((contact) => {
        const isHighRisk = contact.influencia > 7 && contact.forcaRelacional < 45;
        const mainClassification = contact.classificacao[0] || 'Stakeholder';

        return (
          <div 
            key={`${contact.accountId}-${contact.id}`}
            onClick={() => openAccount(contact.accountId, contact.id)}
            className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-slate-800 transition-all cursor-pointer shadow-xl"
          >
            {isHighRisk && (
              <div className="absolute top-4 right-4 text-red-500">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-bold text-slate-100 uppercase italic">
                {contact.nome.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-100 truncate">{contact.nome}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold truncate">{contact.cargo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-300 truncate">{contact.accountName}</span>
                </div>
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{contact.vertical}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {contact.classificacao.map(c => (
                  <span 
                    key={c} 
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tighter border ${getBadgeColor(c)}`}
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Relacionamento</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          contact.forcaRelacional > 60 ? 'bg-emerald-500' : contact.forcaRelacional > 40 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${contact.forcaRelacional}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-100">{contact.forcaRelacional}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Poder</span>
                  <div className="text-sm font-black text-slate-200">{contact.influencia}/10</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700/30 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                 Ver Perfil AI <TrendingUp className="w-3 h-3" />
               </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
