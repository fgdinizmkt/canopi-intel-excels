'use client';

import React, { useMemo } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Building2, 
  Target, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Activity, 
  ExternalLink,
  MessageSquare,
  Mail,
  Linkedin,
  Clock,
  ArrowUpRight,
  Info,
  Layout,
  Cpu,
  Layers,
  ChevronRight,
  Compass,
  Lightbulb,
  FileText
} from 'lucide-react';
import { contasMock, Conta, ContatoConta, AcaoConta, OportunidadeConta } from '../../data/accountsData';

interface AccountDetailViewProps {
  accountId: string;
  viewMode: 'drawer' | 'fullscreen';
  onClose: () => void;
  onToggleViewMode: () => void;
}

/**
 * Componente do Centro de Comando da Conta (Fase 1)
 * Renderiza a narrativa operacional completa da empresa.
 */
export const AccountDetailView: React.FC<AccountDetailViewProps> = ({ 
  accountId, 
  viewMode, 
  onClose, 
  onToggleViewMode 
}) => {
  // 1. Busca de dados
  const account = useMemo(() => contasMock.find(c => c.id === accountId), [accountId]);
  
  if (!account) return null;

  return (
    <div className={`h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden ${viewMode === 'fullscreen' ? 'rounded-none' : 'rounded-l-2xl border-l border-slate-700/50'}`}>
      
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
              title={viewMode === 'drawer' ? 'Expandir para Fullscreen' : 'Reduzir para Drawer'}
            >
              {viewMode === 'drawer' ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
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
            <span className="text-slate-500 text-xs italic">Sincronizado com Minerva AI em tempo real</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
        <div className={`p-6 space-y-8 ${viewMode === 'fullscreen' ? 'max-w-7xl mx-auto w-full' : ''}`}>
          
          {/* --- KPIs TÁTICOS --- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Prontidão AI</span>
              <div className="text-3xl font-black text-blue-500">{account.prontidao}%</div>
              <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${account.prontidao}%` }} />
              </div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Score de Potencial</span>
              <div className="text-3xl font-black text-emerald-500">{account.potencial}</div>
              <span className="text-[10px] text-emerald-500/70 font-bold uppercase">ICP Target</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Valor Pipeline</span>
              <div className="text-2xl font-black text-slate-100 italic">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(account.oportunidades.reduce((acc, op) => acc + op.valor, 0))}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">VPL Aberto</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Risco Churn</span>
              <div className={`text-3xl font-black ${account.risco > 70 ? 'text-red-500' : 'text-emerald-500'}`}>
                {account.risco > 70 ? 'ALTO' : 'BAIXO'}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">{account.risco}% Score</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 leading-none">Atividade</span>
              <div className={`text-2xl font-black ${
                account.atividadeRecente === 'Alta' ? 'text-emerald-500' : account.atividadeRecente === 'Baixa' ? 'text-red-500' : 'text-blue-500'
              }`}>
                {account.atividadeRecente.toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase italic">Volume</span>
            </div>
          </div>

          {/* --- RESUMO EXECUTIVO / BRIEFING AI --- */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-blue-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Briefing Estratégico Canopi AI</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-lg italic font-medium">
              "{account.resumoExecutivo}"
            </p>
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-4">
               <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">Próxima Melhor Ação</span>
                  <p className="text-sm text-slate-100 font-bold">{account.proximaMelhorAcao}</p>
               </div>
            </div>
          </div>

          {/* --- TRÍPTICO DE LEITURA (FACTUAL / INFERIDA / SUGERIDA) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Factual */}
            <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest leading-none">Leitura Factual</h3>
              </div>
              <ul className="space-y-3">
                {account.leituraFactual.map((fact, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300 border-b border-white/5 pb-2 last:border-0 italic">
                    <span className="text-blue-500 font-bold shrink-0">·</span>
                    <span>{fact}</span>
                  </li>
                ))}
                <li className="pt-2 text-[10px] text-slate-500 flex justify-between">
                   <span>Setor</span>
                   <span className="text-slate-300">{account.vertical}</span>
                </li>
                <li className="text-[10px] text-slate-500 flex justify-between">
                   <span>Porte</span>
                   <span className="text-slate-300">{account.porte}</span>
                </li>
              </ul>
            </div>

            {/* Inferida */}
            <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 shadow-inner">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Cpu className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest leading-none">Leitura Inferida</h3>
              </div>
              <ul className="space-y-3">
                {account.leituraInferida.map((inf, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-100 border-b border-blue-500/5 pb-2 last:border-0 font-medium tracking-tight">
                    <span className="text-blue-400 font-bold shrink-0">→</span>
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sugerida */}
            <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20 shadow-inner">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Compass className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest leading-none">Leitura Sugerida</h3>
              </div>
              <ul className="space-y-3">
                {account.leituraSugerida.map((sug, i) => (
                  <li key={i} className="flex gap-2 text-sm text-emerald-50 grupo cursor-pointer hover:translate-x-1 transition-transform">
                    <span className="text-emerald-500 font-bold shrink-0">!</span>
                    <span className="bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 w-full font-bold">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`grid gap-8 ${viewMode === 'fullscreen' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* FILA OPERATIVA: SINAIS + AÇÕES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Fila Operativa Ativa</h2>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">{account.sinais.length + account.acoes.length} intervenções</span>
              </div>
              
              <div className="space-y-3">
                {account.sinais.map(signal => (
                  <div key={signal.id} className="bg-slate-800/40 p-3 rounded-lg border-l-2 border-l-blue-500 flex justify-between items-start group hover:bg-slate-800/60 transition-colors">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">{signal.tipo}</div>
                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          signal.impacto === 'Alto' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          Impacto {signal.impacto}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-100 mb-1">{signal.titulo}</div>
                      <div className="text-[10px] text-slate-500 italic">"{signal.recomendacao}"</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                       <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">{signal.data}</span>
                       <div className="text-[9px] text-slate-400 font-medium">Owner: {signal.owner}</div>
                    </div>
                  </div>
                ))}

                {account.acoes.map(action => (
                  <div key={action.id} className="bg-slate-800/40 p-3 rounded-lg border-l-2 border-l-emerald-500 flex justify-between items-center group hover:bg-slate-800/60 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{action.titulo}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Prazo: {action.prazo} · <span className="text-blue-500 font-bold">{action.owner}</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          action.prioridade === 'Alta' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'
                       }`}>
                          {action.prioridade}
                       </div>
                       <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[9px] font-black uppercase">
                        {action.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OPORTUNIDADES & ESTRATÉGIA ABM/ABX */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Pipeline & Estratégia</h2>
                </div>
              </div>

              <div className="space-y-4">
                {account.oportunidades.map(op => (
                  <div key={op.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowUpRight className="w-4 h-4 text-slate-500 hover:text-emerald-500 cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-100">{op.nome}</h4>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{op.etapa}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-emerald-500 font-black text-lg leading-none">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.valor)}
                         </div>
                         <div className="text-[10px] text-slate-500 font-bold mt-1">PROG: {op.probabilidade}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                      <div className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        op.risco === 'Baixo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>RISCO {op.risco.toUpperCase()}</div>
                      <span className="text-[10px] text-slate-500">Owner: <span className="text-slate-300 font-bold">{op.owner}</span></span>
                    </div>
                  </div>
                ))}

                {/* ABM / ABX Context */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3 text-indigo-400">
                         <Target className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Contexto ABM</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic mb-3">
                         "{account.abm.motivo}"
                      </p>
                      <div className="space-y-1">
                         <div className="text-[9px] text-slate-500 uppercase font-bold">Fit Mapeado:</div>
                         <div className="text-[10px] text-slate-300 font-medium">{account.abm.fit}</div>
                      </div>
                   </div>
                   <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-3 text-blue-400">
                         <Layers className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Contexto ABX</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic mb-3">
                         "{account.abx.motivo}"
                      </p>
                      <div className="flex justify-between items-center bg-blue-500/5 p-1.5 rounded">
                         <span className="text-[9px] text-slate-500 uppercase font-bold">Jornada:</span>
                         <span className="text-[9px] text-blue-400 font-black uppercase">{account.abx.evolucaoJornada}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- INTELIGÊNCIA & HISTÓRICO --- */}
          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                   <Lightbulb className="w-4 h-4 text-amber-500" />
                   <h2 className="text-sm font-bold uppercase tracking-widest">Inteligência & Memória</h2>
                </div>
                <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50 space-y-4">
                   <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">Sucessos</span>
                      <ul className="text-xs text-slate-400 space-y-1">
                         {account.inteligencia.sucessos.map((s: string, i: number) => <li key={i}>· {s}</li>)}
                      </ul>
                   </div>
                   <div>
                      <span className="text-[10px] font-black text-red-500 uppercase block mb-1">Insucessos / Gaps</span>
                      <ul className="text-xs text-slate-400 space-y-1">
                         {account.inteligencia.insucessos.map((s: string, i: number) => <li key={i}>· {s}</li>)}
                      </ul>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                   <Clock className="w-4 h-4 text-slate-500" />
                   <h2 className="text-sm font-bold uppercase tracking-widest">Histórico Recente</h2>
                </div>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-700">
                   {account.historico.map((h, i) => (
                      <div key={i} className="relative">
                         <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-900 group-hover:border-blue-500 scale-125 z-10" />
                         <div className="flex justify-between items-start">
                            <div>
                               <div className="text-[10px] font-black text-slate-500 uppercase mb-0.5">{h.data} · {h.tipo}</div>
                               <p className="text-xs text-slate-300 leading-snug">{h.descricao}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* --- STAKEHOLDERS / COMITÊ (BASE FASE 2) --- */}
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest">Comitê & Stakeholders</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <Layout className="w-3 h-3" /> Lista
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase cursor-help" title="Organograma Visual (Disponível na Fase 2)">
                  <Layers className="w-3 h-3" /> Organograma
                </div>
              </div>
            </div>

            <div className="overflow-x-auto bg-slate-800/10 rounded-2xl border border-slate-800/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800/50 bg-slate-800/30">
                    <th className="py-4 px-6 font-bold">Stakeholder</th>
                    <th className="py-4 font-bold">Area / Senioridade</th>
                    <th className="py-4 font-bold">Influência / Sucesso</th>
                    <th className="py-4 font-bold">Classificações</th>
                    <th className="py-4 font-bold text-right pr-6">Cobertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {account.contatos.map(contact => (
                    <tr key={contact.id} className="group hover:bg-blue-500/5 transition-all cursor-pointer">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all shadow-inner">
                            {contact.nome.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              {contact.nome}
                              {contact.liderId && <div className="text-[9px] px-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-black uppercase" title="Possui vínculo hierárquico">Reports</div>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">{contact.cargo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-slate-200 font-medium">{contact.area}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{contact.senioridade}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1.5">
                           <div className="flex gap-0.5">
                              {[...Array(10)].map((_, i) => (
                                 <div key={i} className={`w-1 h-3 rounded-full ${i < contact.influencia ? 'bg-blue-600' : 'bg-slate-800'}`} />
                              ))}
                           </div>
                           <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                              <span>Inf: <span className="text-blue-400">{contact.influencia}/10</span></span>
                              <span>P.S: <span className="text-emerald-500">{contact.potencialSucesso}%</span></span>
                           </div>
                        </div>
                      </td>
                      <td className="py-4">
                         <div className="flex flex-wrap gap-1">
                            {contact.classificacao.map(cls => (
                               <span key={cls} className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase ${
                                  cls === 'Decisor' ? 'bg-amber-500/20 text-amber-500' : 
                                  cls === 'Influenciador' ? 'bg-blue-500/20 text-blue-500' :
                                  cls === 'Blocker' ? 'bg-red-500/20 text-red-500' :
                                  cls === 'Sponsor' ? 'bg-emerald-500/20 text-emerald-500' :
                                  'bg-slate-700 text-slate-400'
                               }`}>
                                  {cls}
                               </span>
                            ))}
                         </div>
                         <div className="text-[9px] text-slate-500 italic mt-1 font-medium">{contact.papelComite}</div>
                      </td>
                      <td className="py-4 text-right pr-6">
                         <div className="flex flex-col items-end gap-1">
                           <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                              <div className={`h-full ${contact.forcaRelacional > 70 ? 'bg-emerald-500' : contact.forcaRelacional > 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${contact.forcaRelacional}%` }} />
                           </div>
                           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Relacionamento: {contact.forcaRelacional}%</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-blue-500/5 border-t border-slate-800 rounded-b-2xl text-center">
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center justify-center gap-2 italic">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Depth Navigation: Fase 2 (Organograma) e Fase 3 (Perfil Individual) preparadas estruturalmente.
                 </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- FOOTER / CTAs --- */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/80 flex justify-between items-center backdrop-blur-md">
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-100 shadow-lg active:scale-95">
              <LogIcon className="w-4 h-4 text-blue-500" /> Registrar Log
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

    </div>
  );
};

// --- ICONES AUXILIARES ---

function SparkleIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function LogIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" />
    </svg>
  );
}
