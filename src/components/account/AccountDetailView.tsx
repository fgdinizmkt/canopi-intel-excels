'use client';

import React, { useState } from 'react';
import {
  X, Maximize2, Minimize2, Building2, Target, Zap, TrendingUp,
  Activity, ExternalLink, Mail, Clock, ArrowUpRight, Layout,
  ChevronRight, Lightbulb, LogsIcon, List as ListIcon, Network,
  Sparkles as SparkleIcon, CheckCircle2, Brain, MapPin, Users
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

  const renderTree = (contatos: ContatoConta[], parentId?: string, level = 0) => {
    const children = contatos.filter(c => c.liderId === parentId);
    if (children.length === 0) return null;
    return children.map(contact => (
      <div key={contact.id}>
        <OrganogramNode contact={contact} level={level} isFullscreen={isFullscreen} onSelect={setSelectedContactId} />
        {renderTree(contatos, contact.id, level + 1)}
      </div>
    ));
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

        {/* Sub-header: Owner / Playbook / Potencial */}
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

        {/* Firmografia enriquecida */}
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

        {/* Scores ICP / CRM / VP / CT / FT */}
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

          {/* LEITURA ESTRUTURADA — 3 camadas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <SparkleIcon className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Leitura Canopi AI</h2>
            </div>

            {/* Factual */}
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

            {/* Inferida */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Inferências — Padrão AI</span>
              </div>
              {account.leituraInferida.length > 0 ? (
                <ul className="space-y-1.5">
                  {account.leituraInferida.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">~</span>{f}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem inferências disponíveis.</p>}
            </div>

            {/* Sugerida */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Recomendações — Ação Sugerida</span>
              </div>
              {account.leituraSugerida.length > 0 ? (
                <ul className="space-y-1.5">
                  {account.leituraSugerida.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>{f}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem recomendações disponíveis.</p>}
            </div>
          </div>

          {/* AÇÕES DA CONTA */}
          <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Ações Operacionais
              <span className="ml-auto text-[10px] text-slate-600 font-normal">{account.acoes.length} registradas</span>
            </h3>
            {account.acoes.length > 0 ? (
              <div className="space-y-3">
                {account.acoes.map(a => (
                  <div key={a.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-sm font-bold text-slate-100 leading-tight">{a.titulo}</p>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black border ${statusAcaoStyle[a.status] || 'text-slate-400 bg-slate-700 border-slate-600'}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{a.owner}</span>
                      <span className={`font-bold ${prioStyle[a.prioridade]}`}>{a.prioridade}</span>
                      <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{a.prazo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-600 italic text-center py-3">Nenhuma ação registrada para esta conta.</p>}
          </div>

          {/* OPORTUNIDADES */}
          <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Pipeline & Oportunidades
              <span className="ml-auto text-[10px] text-slate-600 font-normal">{account.oportunidades.length} registradas</span>
            </h3>
            {account.oportunidades.length > 0 ? (
              <div className="space-y-4">
                {account.oportunidades.map(op => (
                  <div key={op.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-100">{op.nome}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Etapa: <span className="text-slate-300">{op.etapa}</span> · Owner: {op.owner}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-black text-emerald-400">{fmt(op.valor)}</div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${riscoOpStyle[op.risco]}`}>Risco {op.risco}</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Probabilidade de Fechamento</span>
                        <span className="font-bold text-slate-300">{op.probabilidade}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${op.probabilidade}%` }} />
                      </div>
                    </div>
                    {op.historico.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {op.historico.map((h, i) => (
                          <span key={i} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{h}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-600 italic text-center py-3">Nenhuma oportunidade registrada para esta conta.</p>}
          </div>

          {/* HISTÓRICO E SINAIS */}
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Histórico */}
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Histórico Recente
              </h3>
              {account.historico.length > 0 ? (
                <div className="space-y-5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-700">
                  {account.historico.map((h, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700" />
                      <div>
                        <div className="text-[10px] font-black text-blue-400 uppercase">{h.data} · {h.tipo}</div>
                        <p className="text-sm text-slate-300 mt-0.5">{h.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-600 italic text-center py-3">Sem histórico registrado.</p>}
            </div>

            {/* Sinais Ampliados */}
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Target className="w-4 h-4" /> Sinais Ativos
                <span className="ml-auto text-[10px] font-normal text-slate-600">{account.sinais.length} detectados</span>
              </h3>
              {account.sinais.length > 0 ? (
                <div className="space-y-3">
                  {account.sinais.map(s => {
                    const impactoColor = s.impacto === 'Alto' ? 'text-red-400 bg-red-500/10 border-red-500/20' : s.impacto === 'Médio' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-400 bg-slate-700/50 border-slate-600';
                    return (
                      <div key={s.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{s.tipo}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${impactoColor}`}>Impacto {s.impacto}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 mb-1">{s.titulo}</h4>
                        <p className="text-[11px] text-slate-500 italic mb-2">&quot;{s.recomendacao}&quot;</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-slate-600 border-t border-slate-800 pt-2">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.owner}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.data}</span>
                          {s.contexto && <span className="w-full mt-0.5 text-slate-600 italic">{s.contexto}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-slate-600 italic text-center py-3">Nenhum sinal ativo para esta conta.</p>}
            </div>
          </div>

          {/* COMITÊ DE COMPRAS — sem alteração */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                  <Network className="w-5 h-5 text-blue-500" /> Comitê de Compras & Influência
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Mapeamento hierárquico e força relacional dos stakeholders</p>
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
                          <OrganogramNode contact={contact} level={0} isFullscreen={isFullscreen} onSelect={setSelectedContactId} />
                          {renderTree(account.contatos, contact.id, 1)}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800">
                        <th className="pl-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stakeholder</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Área / Senioridade</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Influência</th>
                        <th className="pr-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Relacional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {account.contatos.map(contact => (
                        <tr key={contact.id} onClick={() => setSelectedContactId(contact.id)} className="group hover:bg-blue-500/5 transition-all cursor-pointer">
                          <td className="py-3 px-8">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">{contact.nome.substring(0, 2).toUpperCase()}</div>
                              <div>
                                <div className="text-sm font-bold text-slate-100">{contact.nome}</div>
                                <div className="text-[10px] text-slate-500">{contact.cargo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-xs text-slate-100 font-bold uppercase">{contact.area}</div>
                            <div className="text-[10px] text-slate-500">{contact.senioridade}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-0.5 mb-1">
                              {[...Array(5)].map((_, i) => <div key={i} className={`w-2 h-1 rounded-sm ${i < contact.influencia / 2 ? 'bg-blue-500' : 'bg-slate-800'}`} />)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Inf: {contact.influencia}/10</div>
                          </td>
                          <td className="py-3 px-8 text-right">
                            <div className="text-sm font-black text-emerald-400">{contact.forcaRelacional}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-800 text-center">
                <p className="text-xs text-slate-600 italic">Nenhum contato mapeado para esta conta.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
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

      {/* ── OVERLAY: PERFIL DO CONTATO ── */}
      {selectedContactId && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSelectedContactId(null)} />
          <div className={`relative h-full shadow-2xl transition-all duration-300 ${isFullscreen ? 'w-full md:w-[45%]' : 'w-full'}`}>
            {(() => {
              const contact = account.contatos.find(c => c.id === selectedContactId);
              if (!contact) return null;
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
