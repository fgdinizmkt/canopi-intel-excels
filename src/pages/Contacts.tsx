'use client';

import React, { useMemo, useState } from 'react';
import { Search, Filter, ShieldCheck, Zap, AlertCircle, Users } from 'lucide-react';
import { contasMock } from '../data/accountsData';
import { StakeholderPulse } from '../components/contacts/StakeholderPulse';
import { StakeholderRadar, EnrichedContact } from '../components/contacts/StakeholderRadar';

export const Contacts: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Flattening e Enriquecimento de Dados
  const allStakeholders = useMemo(() => {
    return contasMock.flatMap(account => 
      account.contatos.map(contact => ({
        ...contact,
        accountId: account.id,
        accountName: account.nome,
        vertical: account.vertical,
      }))
    );
  }, []);

  // 2. Cálculos de Estatísticas (Heurísticas Reais)
  const stats = useMemo(() => {
    return {
      total: allStakeholders.length,
      decisors: allStakeholders.filter(s => s.classificacao.includes('Decisor')).length,
      sponsors: allStakeholders.filter(s => s.classificacao.includes('Sponsor')).length,
      blockers: allStakeholders.filter(s => s.classificacao.includes('Blocker')).length,
      criticalRisk: allStakeholders.filter(s => s.influencia > 7 && s.forcaRelacional < 45).length,
    };
  }, [allStakeholders]);

  // 3. Lógica de Filtragem
  const filteredStakeholders = useMemo(() => {
    return allStakeholders.filter(s => {
      const matchesFilter = filter === 'todos' || s.classificacao.some(c => c.toLowerCase() === filter.toLowerCase());
      const matchesSearch = s.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.accountName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allStakeholders, filter, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Stakeholder Intelligence
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Radar transversal de influência e cobertura do portfólio.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-slate-100"
            />
          </div>
          
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700 shadow-inner">
            {[
              { id: 'todos', label: 'Todos', icon: Users },
              { id: 'decisor', label: 'Decisores', icon: ShieldCheck },
              { id: 'sponsor', label: 'Sponsors', icon: Zap },
              { id: 'blocker', label: 'Blockers', icon: AlertCircle },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <f.icon className="w-3.5 h-3.5" /> {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- KPIs PULSE --- */}
      <StakeholderPulse stats={stats} />

      {/* --- RADAR GRID --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
               <Filter className="w-3 h-3" /> Resultados Filtrados ({filteredStakeholders.length})
           </h2>
        </div>

        <StakeholderRadar contacts={filteredStakeholders} />
      </div>

    </div>
  );
};

export default Contacts;
