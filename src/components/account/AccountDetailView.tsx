'use client';

import React, { useMemo, useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Building2, 
  Target, 
  Zap, 
  TrendingUp, 
  Activity, 
  ExternalLink,
  Mail,
  Clock,
  ArrowUpRight,
  Layout,
  Cpu,
  Layers,
  ChevronRight,
  Compass,
  Lightbulb,
  LogsIcon,
  List as ListIcon,
  Network,
  Sparkles as SparkleIcon
} from 'lucide-react';
import { contasMock, ContatoConta } from '../../data/accountsData';
import { OrganogramNode } from './OrganogramNode';
import { ContactDetailProfile } from './ContactDetailProfile';

interface AccountDetailViewProps {
  accountId: string;
  initialContactId?: string | null;
  viewMode: 'drawer' | 'fullscreen';
  onClose: () => void;
  onToggleViewMode: () => void;
}

/**
 * Componente do Centro de Comando da Conta (Fase 3 - Perfil do Contato)
 * Narrativa operacional completa com Organograma e Detalhamento de Stakeholders.
 */
export const AccountDetailView: React.FC<AccountDetailViewProps> = ({ 
  accountId, 
  initialContactId,
  viewMode: shellViewMode, 
  onClose, 
  onToggleViewMode 
}) => {
  // 1. Busca de dados e estados locais
  const account = useMemo(() => contasMock.find(c => c.id === accountId), [accountId]);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId || null);

  // Sincronizar contato inicial se mudar (ex: navegação externa)
  React.useEffect(() => {
    if (initialContactId) {
      setSelectedContactId(initialContactId);
    }
  }, [initialContactId]);
  
  if (!account) return null;

  const isFullscreen = shellViewMode === 'fullscreen';

  // Lógica de Renderização Recursiva do Organograma
  const renderTree = (contatos: ContatoConta[], parentId?: string, level = 0) => {
    const children = contatos.filter(c => c.liderId === parentId);
    if (children.length === 0) return null;

    return children.map(contact => (
      <div key={contact.id}>
        <OrganogramNode 
          contact={contact} 
          level={level} 
          isFullscreen={isFullscreen} 
          onSelect={setSelectedContactId}
        />
        {renderTree(contatos, contact.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className={`relative h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-l-2xl border-l border-slate-700/50'}`}>
      
      {/* --- HEADER GOLDEN RECORD --- */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-bold shadow-lg border border-white/10 uppercase italic">
              {account.nome.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">{account.nome}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-700 text-slate-400 border border-slate-600`}>
                  {account.tipoEstrategico}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  account.statusGeral === 'Saudável' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                }`}>
                  {account.statusGeral}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {account.vertical}</span>
                <span className="flex items-center gap-1 text-blue-400 hover:underline cursor-pointer"><ExternalLink className="w-3.5 h-3.5" /> {account.dominio}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleViewMode}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
              title={isFullscreen ? 'Reduzir para Drawer' : 'Expandir para Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Owner Principal</span>
              <span className="font-medium flex items-center gap-1.5"><Layout className="w-3.5 h-3.5 text-blue-500" /> {account.ownerPrincipal}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Playbook Ativo</span>
              <span className={`font-medium flex items-center gap-1.5 ${account.playAtivo !== 'Nenhum' ? 'text-blue-400' : 'text-slate-400'}`}>
                <Zap className="w-3.5 h-3.5" /> {account.playAtivo}
              </span>
            </div>
            <div className="flex flex-col">
               <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Potencial</span>
               <span className="text-xs font-bold text-slate-300">{account.potencial}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs italic">Sincronizado Canopi AI</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
        <div className={`p-6 space-y-8 ${isFullscreen ? 'max-w-7xl mx-auto w-full' : ''}`}>
          
          {/* --- KPIs TÁTICOS --- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Prontidão AI</span>
              <div className="text-3xl font-black text-blue-500">{account.prontidao}%</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Score Potencial</span>
              <div className="text-3xl font-black text-emerald-500">{account.potencial}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
               <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Pipeline</span>
               <div className="text-2xl font-black text-slate-100 italic">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(account.oportunidades.reduce((acc, op) => acc + op.valor, 0))}
               </div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Risco Churn</span>
              <div className={`text-3xl font-black ${account.risco > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                {account.risco > 70 ? 'ALTO' : 'BAIXO'}
              </div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Atividade</span>
              <div className={`text-2xl font-black ${
                account.atividadeRecente === 'Alta' ? 'text-emerald-500' : 'text-blue-500'
              }`}>
                {account.atividadeRecente.toUpperCase()}
              </div>
            </div>
          </div>

          {/* --- BRIEFING AI --- */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-blue-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Briefing Estratégico Canopi AI</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg italic font-medium">
              "{account.resumoExecutivo}"
            </p>
          </div>

          {/* --- STAKEHOLDERS / COMITÊ --- */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                    <Network className="w-5 h-5 text-blue-500" />
                    Comitê de Compras & Influência
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Mapeamento hierárquico e força relacional dos stakeholders</p>
               </div>
               
               <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-inner">
                  <button 
                    onClick={() => setViewMode('tree')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'tree' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Network className="w-3.5 h-3.5" /> Organograma
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ListIcon className="w-3.5 h-3.5" /> Lista
                  </button>
               </div>
            </div>

            <div className={`bg-slate-900 rounded-[32px] border border-slate-800/60 shadow-2xl overflow-hidden transition-all duration-300 ${viewMode === 'tree' ? 'p-6 md:p-10' : 'p-0'} ${selectedContactId && isFullscreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {viewMode === 'tree' ? (
                <div className="space-y-2">
                  {(() => {
                    const topLevel = account.contatos.filter(c => !c.liderId || !account.contatos.find(p => p.id === c.liderId));
                    return topLevel.map(contact => (
                      <div key={contact.id}>
                        <OrganogramNode 
                          contact={contact} 
                          level={0} 
                          isFullscreen={isFullscreen} 
                          onSelect={setSelectedContactId}
                        />
                        {renderTree(account.contatos, contact.id, 1)}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/40 border-b border-slate-800">
                      <th className="pl-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stakeholder</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Área / Senioridade</th>
                      <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Influência</th>
                      <th className="pr-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Relacionamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {account.contatos.map(contact => (
                     <tr key={contact.id} onClick={() => setSelectedContactId(contact.id)} className="group hover:bg-blue-500/5 transition-all cursor-pointer">
                       <td className="py-4 px-8">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                             {contact.nome.substring(0, 2).toUpperCase()}
                           </div>
                           <div>
                             <div className="text-sm font-bold text-slate-100">{contact.nome}</div>
                             <div className="text-[10px] text-slate-500">{contact.cargo}</div>
                           </div>
                         </div>
                       </td>
                       <td className="py-4 px-4">
                         <div className="text-xs text-slate-100 uppercase font-bold">{contact.area}</div>
                         <div className="text-[10px] text-slate-500">{contact.senioridade}</div>
                       </td>
                       <td className="py-4 px-4">
                         <div className="flex gap-0.5 mb-1">
                           {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-2 h-1 rounded-sm ${i < contact.influencia/2 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                           ))}
                         </div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inf: {contact.influencia}/10</div>
                       </td>
                       <td className="py-4 px-8 text-right">
                         <div className="text-sm font-black text-emerald-500">{contact.forcaRelacional}%</div>
                       </td>
                     </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* --- HISTÓRICO & SINAIS --- */}
          <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Histórico Recente
              </h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-700">
                {account.historico.map((h, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700" />
                    <div>
                      <div className="text-[10px] font-black text-blue-400 uppercase">{h.data} • {h.tipo}</div>
                      <p className="text-sm text-slate-300 mt-1">{h.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="w-4 h-4" /> Sinais Ativos
              </h3>
              <div className="space-y-4">
                {account.sinais.map(s => (
                  <div key={s.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{s.tipo}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mb-1">{s.titulo}</h4>
                    <p className="text-[11px] text-slate-500 italic">"{s.recomendacao}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/80 flex justify-between items-center backdrop-blur-md">
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-100 shadow-lg active:scale-95">
              <LogsIcon className="w-4 h-4 text-blue-500" /> Registrar Log
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-100 shadow-lg active:scale-95">
              <Mail className="w-4 h-4 text-emerald-500" /> E-mail 1:1
           </button>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end pr-4 border-r border-slate-700">
              <span className="text-[9px] text-slate-500 uppercase font-black">Próxima Recomendação</span>
              <span className="text-[10px] text-blue-400 font-bold truncate max-w-[200px]">{account.proximaMelhorAcao}</span>
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95">
              Executar Playbook <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* --- OVERLAY: PERFIL DO CONTATO --- */}
      {selectedContactId && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          {/* Dimming Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 opacity-100"
            onClick={() => setSelectedContactId(null)}
          />
          
          {/* Profile Content Container */}
          <div className={`relative h-full shadow-2xl transition-all duration-300 transform translate-x-0 ${isFullscreen ? 'w-full md:w-[45%]' : 'w-full'}`}>
             {(() => {
                const contact = account.contatos.find(c => c.id === selectedContactId);
                if (!contact) return null;
                
                // Filtro associado (exemplo tático)
                const sinaisAssociados = account.sinais.filter(s => s.contexto.includes(contact.area));
                const acoesAssociadas = account.acoes.filter(a => a.titulo.includes(contact.area));

                return (
                  <ContactDetailProfile 
                    contact={contact} 
                    onClose={() => setSelectedContactId(null)} 
                    sinais={sinaisAssociados}
                    acoes={acoesAssociadas}
                  />
                );
             })()}
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDetailView;
