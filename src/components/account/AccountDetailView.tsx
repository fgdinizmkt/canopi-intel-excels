'use client';

import React, { useState } from 'react';
import {
  X, Maximize2, Minimize2, Building2, Target, Zap, TrendingUp,
  Activity, ExternalLink, Mail, Clock, ArrowUpRight, Layout,
  ChevronRight, Lightbulb, LogsIcon, List as ListIcon, Network,
  Sparkles as SparkleIcon, CheckCircle2, Brain, MapPin, Users,
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { contasMock, ContatoConta, SinalConta } from '../../data/accountsData';
import { OrganogramNode } from './OrganogramNode';
import { ContactDetailProfile } from './ContactDetailProfile';

interface AccountDetailViewProps {
  accountId: string;
  initialContactId?: string | null;
  viewMode: 'drawer' | 'fullscreen';
  onClose: () => void;
  onToggleViewMode: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

const ScoreMiniBar = ({ label, val }: { label: string; val: number }) => {
  const color = val >= 75 ? '#22c55e' : val >= 50 ? '#3b82f6' : '#f59e0b';
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold text-slate-300">{val}</span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${val}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  accountId, initialContactId, viewMode: shellViewMode, onClose, onToggleViewMode
}) => {
  const account = React.useMemo(() => contasMock.find(c => c.id === accountId), [accountId]);
  const [orgView, setOrgView] = useState<'tree' | 'list'>('tree');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId || null);

  React.useEffect(() => {
    if (initialContactId) setSelectedContactId(initialContactId);
  }, [initialContactId]);

  if (!account) return null;

  const isFullscreen = shellViewMode === 'fullscreen';

  // Radar Relacional Logic (RECORTE 26)
  const getRadarRelacional = () => {
    const tension = account.contatos.filter(c => 
      (c.classificacao.includes('Blocker') || c.influencia > 7) && 
      account.sinais.some(s => s.contexto === c.area && s.impacto === 'Alto')
    );
    const support = account.contatos.filter(c => 
      (c.classificacao.includes('Champion') || c.classificacao.includes('Sponsor')) && 
      account.sinais.some(s => s.contexto === c.area && (s.tipo === 'Tendência' || s.tipo === 'Mudança'))
    );
    const areasComSinais = Array.from(new Set(account.sinais.filter(s => s.impacto === 'Alto').map(s => s.contexto)));
    const areasComContatos = Array.from(new Set(account.contatos.map(c => c.area)));
    const gaps = areasComSinais.filter(a => !areasComContatos.includes(a));

    return { tension, support, gaps };
  };

  const radar = getRadarRelacional();

  const renderTree = (contatos: ContatoConta[], parentId?: string, level = 0) => {
    const children = contatos.filter(c => c.liderId === parentId);
    if (children.length === 0) return null;
    return children.map(contact => {
      const sinaisNaArea = account.sinais.filter(s => s.contexto === contact.area);
      return (
        <div key={contact.id} className="relative">
          {/* Micro-badges de Sinais (RECORTE 26) */}
          {sinaisNaArea.length > 0 && (
            <div className="absolute top-0 right-0 z-10 -mt-1 -mr-1 flex gap-1">
              {sinaisNaArea.some(s => s.impacto === 'Alto' || s.tipo === 'Alerta') ? (
                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center shadow-lg" title={`${sinaisNaArea.length} sinais nesta área`}>
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center shadow-lg" title={`${sinaisNaArea.length} sinais nesta área`}>
                  <SparkleIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )}
          <OrganogramNode contact={contact} level={level} isFullscreen={isFullscreen} onSelect={setSelectedContactId} />
          {renderTree(contatos, contact.id, level + 1)}
        </div>
      );
    });
  };

  const statusAcaoStyle: Record<string, string> = {
    'Em aberto': 'text-slate-400 bg-slate-700/50 border-slate-600',
    'Em andamento': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Atrasada': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Concluída': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  const prioStyle: Record<string, string> = { 'Alta': 'text-red-400', 'Média': 'text-amber-400', 'Baixa': 'text-slate-500' };
  const riscoOpStyle: Record<string, string> = {
    'Alto': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Médio': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Baixo': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className={`relative h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-l-2xl border-l border-slate-700/50'}`}>

      {/* ── HEADER ── */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold shadow-lg border border-white/10 uppercase italic">
              {account.nome.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">{account.nome}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-700 text-slate-400 border border-slate-600">{account.tipoEstrategico}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${account.statusGeral === 'Saudável' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : account.statusGeral === 'Crítico' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {account.statusGeral}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{account.vertical}</span>
                <span className="flex items-center gap-1 text-blue-400 cursor-pointer hover:underline"><ExternalLink className="w-3 h-3" />{account.dominio}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleViewMode} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400" title={isFullscreen ? 'Reduzir' : 'Expandir'}>
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-slate-400" title="Fechar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-5">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-0.5">Owner Principal</span>
              <span className="text-xs font-medium flex items-center gap-1.5"><Layout className="w-3 h-3 text-blue-500" />{account.ownerPrincipal}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-0.5">Playbook Ativo</span>
              <span className={`text-xs font-medium flex items-center gap-1.5 ${account.playAtivo !== 'Nenhum' ? 'text-blue-400' : 'text-slate-400'}`}>
                <Zap className="w-3 h-3" />{account.playAtivo}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-0.5">Atividade</span>
              <span className={`text-xs font-bold ${account.atividadeRecente === 'Alta' ? 'text-emerald-400' : account.atividadeRecente === 'Baixa' ? 'text-red-400' : 'text-blue-400'}`}>{account.atividadeRecente}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px] italic">Sincronizado Canopi AI</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Firmografia enriquecida (Recorte 25) */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-slate-700/40 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{account.localizacao}</span>
          <span>{account.segmento} · {account.porte}</span>
          <span>Etapa: <span className="text-slate-300 font-bold">{account.etapa}</span></span>
          <span>Budget: <span className="text-emerald-400 font-bold">{fmt(account.budgetBrl)}</span></span>
          <span>Cobertura Relacional: <span className={`font-bold ${account.coberturaRelacional >= 60 ? 'text-emerald-400' : account.coberturaRelacional >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{account.coberturaRelacional}%</span></span>
          {account.ownersSecundarios.length > 0 && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />Time: {account.ownersSecundarios.join(', ')}</span>
          )}
        </div>

        {/* Scores ICP / CRM / VP / CT / FT (Recorte 25) */}
        <div className="flex gap-3 mt-3">
          {[
            { label: 'ICP', val: account.icp },
            { label: 'CRM', val: account.crm },
            { label: 'VP', val: account.vp },
            { label: 'CT', val: account.ct },
            { label: 'FT', val: account.ft },
          ].map(s => <ScoreMiniBar key={s.label} label={s.label} val={s.val} />)}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
        <div className={`p-6 space-y-8 ${isFullscreen ? 'max-w-7xl mx-auto w-full' : ''}`}>

          {/* KPIs táticos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Prontidão AI', val: `${account.prontidao}%`, color: 'text-blue-400' },
              { label: 'Score Potencial', val: `${account.potencial}`, color: 'text-emerald-400' },
              { label: 'Pipeline', val: fmt(account.oportunidades.reduce((a, o) => a + o.valor, 0)), color: 'text-slate-100' },
              { label: 'Risco Churn', val: account.risco > 70 ? 'ALTO' : 'BAIXO', color: account.risco > 70 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Oportunidades', val: `${account.oportunidades.length}`, color: account.oportunidades.length > 0 ? 'text-blue-400' : 'text-slate-500' },
            ].map(k => (
              <div key={k.label} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">{k.label}</span>
                <div className={`text-xl font-black ${k.color}`}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Leitura Estruturada AI (Recorte 25) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <SparkleIcon className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Leitura Canopi AI</h2>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Factual — Dados Verificáveis</span>
              </div>
              {account.leituraFactual.length > 0 ? (
                <ul className="space-y-1.5">
                  {account.leituraFactual.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5 flex-shrink-0">—</span>{f}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem dados factuais registrados.</p>}
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Inferências — Padrão AI</span>
              </div>
              {account.leituraInferida.map((f, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">~</span>{f}
                </li>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Recomendações — Ação Sugerida</span>
              </div>
              {account.leituraSugerida.map((f, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>{f}
                </li>
              ))}
            </div>
          </div>

          {/* Operacional: Ações e Oportunidades (Recorte 25) */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Ações Operacionais
              </h3>
              <div className="space-y-3">
                {account.acoes.map(a => (
                  <div key={a.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-sm font-bold text-slate-100">{a.titulo}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${statusAcaoStyle[a.status]}`}>{a.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{a.owner} • {a.prazo}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Pipeline
              </h3>
              <div className="space-y-3">
                {account.oportunidades.map(op => (
                  <div key={op.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-100">{op.nome}</p>
                      <span className="text-emerald-400 font-black">{fmt(op.valor)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{op.etapa} • Risco <span className={riscoOpStyle[op.risco].split(' ')[0]}>{op.risco}</span></div>
                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${op.probabilidade}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ────── RADAR RELACIONAL (RECORTE 26) ────── */}
          <div className="p-6 bg-blue-500/5 rounded-[28px] border border-blue-500/10 shadow-lg">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
              <Network className="w-5 h-5" /> Radar de Inteligência Relacional
              <div className="flex-1 h-px bg-blue-500/20" />
              <span className="text-[10px] font-normal text-blue-500/60 lowercase italic">cruzamento de sinais x comitê</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pontos de Tensão */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pontos de Tensão</span>
                </div>
                {radar.tension.length > 0 ? radar.tension.map(c => (
                  <div key={c.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-[10px] font-bold text-red-400">
                      {c.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-100 truncate">{c.nome}</p>
                      <p className="text-[9px] text-red-400 uppercase font-black">{c.area} • Exposição Crítica</p>
                    </div>
                  </div>
                )) : <p className="text-[10px] text-slate-600 italic">Nenhum stakeholder influente sob alerta imediato.</p>}
              </div>

              {/* Pontos de Apoio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pontos de Apoio</span>
                </div>
                {radar.support.length > 0 ? radar.support.map(c => (
                  <div key={c.id} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {c.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-100 truncate">{c.nome}</p>
                      <p className="text-[9px] text-emerald-400 uppercase font-black">{c.area} • Driver de Sucesso</p>
                    </div>
                  </div>
                )) : <p className="text-[10px] text-slate-600 italic">Sem sponsors ativos para os sinais atuais.</p>}
              </div>

              {/* Gaps de Interlocução */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gaps de Cobertura</span>
                </div>
                {radar.gaps.length > 0 ? radar.gaps.map((area, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <p className="text-[11px] font-bold text-slate-100">{area}</p>
                    <p className="text-[9px] text-blue-400 uppercase font-black">Sinal Crítico Detectado • Sem Contato</p>
                  </div>
                )) : <p className="text-[10px] text-slate-600 italic">Toda área crítica possui interlocutor mapeado.</p>}
              </div>
            </div>
          </div>

          {/* COMITÊ DE COMPRAS (Com micro-badges do Recorte 26) */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                  <Network className="w-5 h-5 text-blue-500" /> Comitê de Compras & Influência
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Mapeamento hierárquico enriquecido com sinais de área</p>
              </div>
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button onClick={() => setOrgView('tree')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orgView === 'tree' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                  <Network className="w-3.5 h-3.5" /> Organograma
                </button>
                <button onClick={() => setOrgView('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orgView === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                  <ListIcon className="w-3.5 h-3.5" /> Lista
                </button>
              </div>
            </div>

            {account.contatos.length > 0 ? (
              <div className={`bg-slate-900 rounded-[28px] border border-slate-800/60 shadow-2xl overflow-hidden transition-all duration-300 ${orgView === 'tree' ? 'p-6 md:p-8' : 'p-0'} ${selectedContactId && isFullscreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {orgView === 'tree' ? (
                  <div className="space-y-2">
                    {(() => {
                      const topLevel = account.contatos.filter(c => !c.liderId || !account.contatos.find(p => p.id === c.liderId));
                      return topLevel.map(contact => (
                        <div key={contact.id}>
                          {renderTree(account.contatos, contact.liderId ? undefined : contact.id, 0)}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800">
                        <th className="pl-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stakeholder</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Área / Inteligência</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Relacional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {account.contatos.map(contact => {
                        const sinaisNaArea = account.sinais.filter(s => s.contexto === contact.area);
                        const hasCriticalSignal = sinaisNaArea.some(s => s.impacto === 'Alto');
                        return (
                          <tr key={contact.id} onClick={() => setSelectedContactId(contact.id)} className="group hover:bg-blue-500/5 transition-all cursor-pointer">
                            <td className="py-3 px-8">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">{contact.nome.substring(0, 2).toUpperCase()}</div>
                                <div>
                                  <div className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{contact.nome}</div>
                                  <div className="text-[10px] text-slate-500">{contact.cargo}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-100 font-bold uppercase">{contact.area}</span>
                                {sinaisNaArea.length > 0 && (
                                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 ${hasCriticalSignal ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                    {hasCriticalSignal ? <AlertTriangle className="w-2.5 h-2.5" /> : <SparkleIcon className="w-2.5 h-2.5" />}
                                    {sinaisNaArea.length} SINAL
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-8 text-right">
                              <div className="text-sm font-black text-emerald-400">{contact.forcaRelacional}%</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : <div className="p-8 border border-slate-800 text-center text-xs italic text-slate-600">Nenhum contato mapeado.</div>}
          </div>

          {/* Histórico e Sinais (RESTAURADOS ao nível de riqueza do Recorte 25) */}
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Histórico Recente
              </h3>
              <div className="space-y-4">
                {account.historico.slice(0, 3).map((h, i) => (
                  <div key={i} className="pl-4 border-l border-slate-700">
                    <p className="text-[10px] font-bold text-blue-400">{h.data}</p>
                    <p className="text-xs text-slate-300">{h.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Target className="w-4 h-4" /> Sinais Ativos
              </h3>
              <div className="space-y-3">
                {account.sinais.map(s => (
                  <div key={s.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-sm font-bold text-slate-100">{s.titulo}</p>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${s.tipo === 'Alerta' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>{s.tipo}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic mb-2">&quot;{s.recomendacao}&quot;</p>
                    <div className="flex flex-wrap gap-2 text-[9px] text-slate-500 uppercase font-black tracking-tighter">
                      <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">{s.contexto}</span>
                      <span>Impacto: <span className={s.impacto === 'Alto' ? 'text-red-400' : 'text-blue-400'}>{s.impacto}</span></span>
                      <span>Owner: {s.owner}</span>
                      <span>Data: {s.data}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER (RESTAURADO ao estado preservado do Recorte 25) */}
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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95">
            Executar Playbook <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── OVERLAY: FILTRO CONTEXTUAL (RECORTE 26) ── */}
      {selectedContactId && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedContactId(null)} />
          <div className={`relative h-full shadow-2xl transition-all duration-300 ${isFullscreen ? 'w-full md:w-[45%]' : 'w-full'}`}>
            {(() => {
              const contact = account.contatos.find(c => c.id === selectedContactId);
              if (!contact) return null;
              // FILTRO RIGOROSO POR ÁREA DO CONTATO
              const sinaisAssociados = account.sinais.filter(s => s.contexto === contact.area);
              const acoesAssociadas = account.acoes.filter(a => a.titulo.toLowerCase().includes(contact.area.toLowerCase()) || a.owner.includes(contact.nome));
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
