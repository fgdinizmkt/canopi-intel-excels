'use client';

import React from 'react';
import { 
  User, 
  ChevronRight, 
  ExternalLink, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Zap, 
  Info 
} from 'lucide-react';
import { ContatoConta } from '../../data/accountsData';

interface OrganogramNodeProps {
  contact: ContatoConta;
  level: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onSelect?: (id: string) => void;
  isFullscreen?: boolean;
}

/**
 * OrganogramNode - "Power Grid" Card
 * Representa um stakeholder com alta densidade de informação operacional e hierárquica.
 */
export const OrganogramNode: React.FC<OrganogramNodeProps> = ({ 
  contact, 
  level, 
  isExpanded, 
  onToggle,
  onSelect,
  isFullscreen 
}) => {
  // Cores semânticas baseadas na classificação
  const getClassColor = (classes: string[]) => {
    if (classes.includes('Blocker')) return 'border-red-500 text-red-500 bg-red-500/10';
    if (classes.includes('Sponsor')) return 'border-emerald-500 text-emerald-500 bg-emerald-500/10';
    if (classes.includes('Decisor')) return 'border-amber-500 text-amber-500 bg-amber-500/10';
    if (classes.includes('Champion')) return 'border-blue-500 text-blue-500 bg-blue-500/10';
    return 'border-slate-600 text-slate-400 bg-slate-800/50';
  };

  const styleClass = getClassColor(contact.classificacao);
  const indentClass = level > 0 ? `ml-${level * 4} md:ml-${level * 8}` : '';

  return (
    <div 
      className={`relative group transition-all duration-300 ${indentClass} mb-3`}
      style={{ marginLeft: isFullscreen ? `${level * 40}px` : `${level * 20}px` }}
      onClick={() => onSelect?.(contact.id)}
    >
      {/* Conector Hierárquico (L deitado) */}
      {level > 0 && (
        <div 
          className="absolute -left-4 top-0 bottom-0 w-px bg-slate-700"
          style={{ left: '-12px', top: '-12px', height: '28px', width: '12px', borderLeft: '1px solid #334155', borderBottom: '1px solid #334155', borderBottomLeftRadius: '4px' }}
        />
      )}

      <div className={`
        flex items-center gap-4 p-4 rounded-2xl border-l-4 bg-slate-900 shadow-xl 
        hover:shadow-blue-900/10 hover:translate-x-1 transition-all cursor-pointer
        border-t border-r border-b border-slate-800/50
        ${styleClass.split(' ')[0]} /* Pega apenas a cor da borda */
      `}>
        {/* Avatar / Classificação */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 font-black text-sm group-hover:border-blue-500/50 transition-colors">
            {contact.nome.substring(0, 2).toUpperCase()}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${styleClass.split(' ')[2]}`}>
            {contact.classificacao.includes('Blocker') ? <AlertCircle className="w-2.5 h-2.5" /> : 
             contact.classificacao.includes('Sponsor') ? <ShieldCheck className="w-2.5 h-2.5" /> :
             <Zap className="w-2.5 h-2.5" />}
          </div>
        </div>

        {/* Info Principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-slate-100 truncate flex items-center gap-2 group-hover:text-blue-400 transition-colors">
              {contact.nome}
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Ver Perfil</span>
            </h4>
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${styleClass.split(' ').slice(1).join(' ')}`}>
                {contact.classificacao[0]}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
            {contact.cargo} • <span className="text-slate-400">{contact.area}</span>
          </div>
        </div>

        {/* Métricas Operacionais (Visíveis ou Expandidas no Fullscreen) */}
        <div className={`flex items-center gap-6 ${isFullscreen ? 'ml-6' : 'hidden md:flex'}`}>
          {/* Relacionamento */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-black text-slate-500 uppercase">Relac.</span>
               <span className={`text-[10px] font-bold ${contact.forcaRelacional > 70 ? 'text-emerald-500' : 'text-blue-500'}`}>
                 {contact.forcaRelacional}%
               </span>
            </div>
            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full ${contact.forcaRelacional > 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${contact.forcaRelacional}%` }} />
            </div>
          </div>

          {/* Influência */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-black text-slate-500 uppercase">Inf.</span>
               <span className="text-[10px] font-bold text-blue-400">{contact.influencia}/10</span>
            </div>
            <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2.5 h-1 rounded-sm ${i < contact.influencia / 2 ? 'bg-blue-600' : 'bg-slate-800'}`} />
               ))}
            </div>
          </div>
        </div>

        {/* Affordance de Fase 3 */}
        <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganogramNode;
