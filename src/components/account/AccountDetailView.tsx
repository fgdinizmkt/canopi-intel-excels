'use client';

import React, { useState } from 'react';
import {
  X, Maximize2, Minimize2, Building2, Target, Zap, TrendingUp,
  Activity, ExternalLink, Mail, Clock, ArrowUpRight, Layout,
  ChevronRight, Lightbulb, LogsIcon, List as ListIcon, Network,
  Sparkles as SparkleIcon, CheckCircle2, Brain, MapPin, Users,
  AlertTriangle, ShieldCheck, Flame, Users2, History as HistoryIcon,
  Globe, Share2, Pencil
} from 'lucide-react';
import { contasMock, ContatoConta, SinalConta, OportunidadeConta, Conta } from '../../data/accountsData';
import { persistOportunidade } from '../../lib/oportunidadesRepository';
import { persistAccount, getAccounts } from '../../lib/accountsRepository';
import { OrganogramNode } from './OrganogramNode';
import { ContactDetailProfile } from './ContactDetailProfile';
import { useAccountDetail } from '../../context/AccountDetailContext';

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
  const bgColor = val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold text-slate-300">{val}</span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${bgColor}`} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
};

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  accountId, initialContactId, viewMode: shellViewMode, onClose, onToggleViewMode
}) => {
  // ── ESTADO DE DADOS CONSOLIDADO (RECORTE 47: Read Path Fechado) ──
  const [liveAccount, setLiveAccount] = useState<Conta | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const all = await getAccounts();
        const found = all.find(c => c.id === accountId);
        if (found && active) {
          setLiveAccount(found);
        }
      } catch (e) {
        console.error('[AccountDetailView] Falha crítica no read path:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [accountId]);

  // Conta canônica: prefere live data do repositório, fallback ao mock para segurança estrutural
  const account = React.useMemo(() => {
    const mock = contasMock.find(c => c.id === accountId);
    if (!liveAccount) return mock;
    return liveAccount;
  }, [accountId, liveAccount]);
  
  const { createAction, updateAction, addLog, sessionLogs, sessionActions } = useAccountDetail();
  const [orgView, setOrgView] = useState<'tree' | 'list'>('tree');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId || null);
  const [isLogging, setIsLogging] = useState(false);
  const [logDraft, setLogDraft] = useState('');
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [localContatos, setLocalContatos] = useState<ContatoConta[]>(account?.contatos ?? []);
  const [localOportunidades, setLocalOportunidades] = useState<OportunidadeConta[]>(account?.oportunidades ?? []);
  const [editingOp, setEditingOp] = useState<OportunidadeConta | null>(null);
  const [localInteligencia, setLocalInteligencia] = useState<Conta['inteligencia']>(account?.inteligencia ?? { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] });
  const [editingIntel, setEditingIntel] = useState<Conta['inteligencia'] | null>(null);
  const [localLeitura, setLocalLeitura] = useState({ factual: account?.leituraFactual ?? [], inferida: account?.leituraInferida ?? [], sugerida: account?.leituraSugerida ?? [] });
  const [editingLeitura, setEditingLeitura] = useState<typeof localLeitura | null>(null);
  const [localHistorico, setLocalHistorico] = useState<Conta['historico']>(account?.historico ?? []);
  const [editingHistorico, setEditingHistorico] = useState<{ data: string; tipo: string; descricao: string; icone?: string } | null>(null);
  const [localTecnografia, setLocalTecnografia] = useState<string[]>(account?.tecnografia ?? []);
  const [editingTecnografia, setEditingTecnografia] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialContactId) setSelectedContactId(initialContactId);
  }, [initialContactId]);

  React.useEffect(() => {
    if (account) {
      setLocalContatos(account.contatos || []);
      setLocalOportunidades(account.oportunidades || []);
      setLocalInteligencia(account.inteligencia || { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] });
      setLocalLeitura({ factual: account.leituraFactual || [], inferida: account.leituraInferida || [], sugerida: account.leituraSugerida || [] });
      setLocalHistorico(account.historico || []);
      setLocalTecnografia(account.tecnografia || []);
    }
  }, [account]); // Dependência direta do objeto consolidado

  const isFullscreen = shellViewMode === 'fullscreen';

  // Radar Relacional Logic (RECORTE 26)
  const radar = React.useMemo(() => {
    if (!account) return { tension: [], support: [], gaps: [] };
    const tension = localContatos.filter(c =>
      (c.classificacao.includes('Blocker') || c.influencia > 7) &&
      account.sinais.some(s => s.contexto === c.area && s.impacto === 'Alto')
    );
    const support = localContatos.filter(c =>
      (c.classificacao.includes('Champion') || c.classificacao.includes('Sponsor')) &&
      account.sinais.some(s => s.contexto === c.area && (s.tipo === 'Tendência' || s.tipo === 'Mudança'))
    );
    const areasComSinais = Array.from(new Set(account.sinais.filter(s => s.impacto === 'Alto').map(s => s.contexto)));
    const areasComContatos = Array.from(new Set(localContatos.map(c => c.area)));
    const gaps = areasComSinais.filter(a => !areasComContatos.includes(a));

    return { tension, support, gaps };
  }, [account, localContatos]);

  const renderTree = React.useCallback((contatos: ContatoConta[], parentId?: string, level = 0) => {
    const children = contatos.filter(c => c.liderId === parentId);
    if (children.length === 0) return null;
    return children.map(contact => {
      const sinaisNaArea = account?.sinais.filter(s => s.contexto === contact.area) ?? [];
      return (
        <div key={`${contact.id}-${level}`} className="relative">
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
  }, [account?.sinais, isFullscreen, setSelectedContactId]);

  const statusAcaoStyle: Record<string, string> = {
    'Em aberto': 'text-slate-400 bg-slate-700/50 border-slate-600',
    'Em andamento': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Atrasada': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Concluída': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Nova': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Bloqueada': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Aguardando aprovação': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  // Filtragem Operacional Real (RECORTE OPERACIONAL 2.0)
  const realActions = React.useMemo(() => {
    return sessionActions.filter(a => a.accountName === (account?.nome || ''));
  }, [sessionActions, account?.nome]);

  const prioStyle: Record<string, string> = { 'Alta': 'text-red-400', 'Média': 'text-amber-400', 'Baixa': 'text-slate-500' };
  const riscoOpStyle: Record<string, string> = {
    'Alto': 'text-red-400 bg-red-500/10 border-red-500/20',
    'Médio': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Baixo': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  // Early return de segurança para ID inexistente ou loading inicial
  if (!account && !isLoading) return null;

  if (isLoading) {
    return (
      <div className={`relative h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 ${isFullscreen ? 'rounded-none' : 'rounded-l-2xl border-l border-slate-700/50'}`}>
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando Profundidade da Conta...</p>
      </div>
    );
  }

  // Garantia de tipagem pós-loading
  if (!account) return null;

  const handleSaveLog = () => {
    if (logDraft.trim()) {
      addLog(accountId, logDraft);
      setLogDraft('');
      setIsLogging(false);
      setShowFeedback('Log operacional registrado na timeline.');
      setTimeout(() => setShowFeedback(null), 3000);
    }
  };

  const handleExecPlaybook = () => {
    createAction({
      priority: "Alta",
      category: "Playbook",
      channel: "ABM",
      status: "Nova",
      title: `Ativar blindagem executiva: ${account.nome}`,
      description: `Ação prioritária gerada via Centro de Comando para mitigar riscos detectados e blindar renovação.`,
      accountName: account.nome,
      accountContext: `${account.segmento} · ${account.vertical}`,
      sourceType: "playbook",
      playbookName: "Blindagem de Renovação",
      suggestedOwner: account.ownerPrincipal,
      ownerName: account.ownerPrincipal,
      nextStep: "Enviar briefing executivo para stakeholders de área"
    });
    setShowFeedback('Playbook ativado. Nova ação enviada para a fila global.');
    setTimeout(() => setShowFeedback(null), 4000);
  };

  const handleUpdateContact = (updatedContact: ContatoConta) => {
    setLocalContatos(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleUpdateOportunidade = () => {
    if (!editingOp) return;
    setLocalOportunidades(prev => prev.map(o => o.id === editingOp.id ? editingOp : o));
    persistOportunidade(editingOp.id, editingOp.etapa, editingOp.risco);
    setEditingOp(null);
  };

  const handleSaveInteligencia = () => {
    if (!editingIntel) return;

    // 1. Snapshot do estado atual (o que foi editado no modal)
    const snapshot = { ...editingIntel };

    // 2. Build: o objeto final já está pronto em snapshot

    // 3. setState: atualiza o estado local síncrono
    setLocalInteligencia(snapshot);

    // 4. Persist: chama o repositório Supabase (fire-and-forget)
    persistAccount({
      id: account.id,
      inteligencia: snapshot
    });

    // 5. Cleanup UI
    setEditingIntel(null);
    setShowFeedback('Inteligência atualizada e persistida.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSaveLeitura = () => {
    if (!editingLeitura) return;

    // 1. Snapshot do estado atual
    const snapshot = { ...editingLeitura };

    // 2. Build: conversão para os nomes canônicos da interface
    // 3. setState: atualiza o estado local
    setLocalLeitura(snapshot);

    // 4. Persist: chama o repositório Supabase (fire-and-forget)
    persistAccount({
      id: account.id,
      leituraFactual: snapshot.factual,
      leituraInferida: snapshot.inferida,
      leituraSugerida: snapshot.sugerida,
    });

    // 5. Cleanup UI
    setEditingLeitura(null);
    setShowFeedback('Leitura estruturada atualizada e persistida.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSaveHistorico = () => {
    if (!editingHistorico) return;

    // Guard: validação obrigatória
    if (!editingHistorico.tipo || !editingHistorico.descricao.trim()) {
      setShowFeedback('Tipo e descrição são obrigatórios.');
      setTimeout(() => setShowFeedback(null), 3000);
      return;
    }

    // 1. Snapshot do estado atual: adiciona nova entrada ao histórico
    const newEntry = {
      data: editingHistorico.data || new Date().toLocaleDateString('pt-BR'),
      tipo: editingHistorico.tipo,
      descricao: editingHistorico.descricao,
      icone: editingHistorico.icone || 'HistoryIcon'
    };

    const snapshot = [...localHistorico, newEntry];

    // 2. Build: conversão para os nomes canônicos
    // 3. setState: atualiza o estado local
    setLocalHistorico(snapshot);

    // 4. Persist: chama o repositório Supabase (fire-and-forget)
    persistAccount({
      id: account.id,
      historico: snapshot,
    });

    // 5. Cleanup UI
    setEditingHistorico(null);
    setShowFeedback('Entrada histórica criada e persistida.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSaveTecnografia = () => {
    // Guard: validação obrigatória
    if (!editingTecnografia || !editingTecnografia.trim()) {
      setShowFeedback('Nome da tecnologia é obrigatório.');
      setTimeout(() => setShowFeedback(null), 3000);
      return;
    }

    // 1. Snapshot do estado atual: adiciona nova tecnologia
    const trimmed = editingTecnografia.trim();

    // Verifica duplicação
    if (localTecnografia.includes(trimmed)) {
      setShowFeedback('Tecnologia já existe na stack.');
      setTimeout(() => setShowFeedback(null), 3000);
      return;
    }

    const snapshot = [...localTecnografia, trimmed];

    // 2. Build: conversão para os nomes canônicos
    // 3. setState: atualiza o estado local
    setLocalTecnografia(snapshot);

    // 4. Persist: chama o repositório Supabase (fire-and-forget)
    persistAccount({
      id: account.id,
      tecnografia: snapshot,
    });

    // 5. Cleanup UI
    setEditingTecnografia(null);
    setShowFeedback('Tecnologia adicionada à stack.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleRemoveTecnografia = (index: number) => {
    const snapshot = localTecnografia.filter((_, i) => i !== index);
    setLocalTecnografia(snapshot);
    persistAccount({
      id: account.id,
      tecnografia: snapshot,
    });
    setShowFeedback('Tecnologia removida da stack.');
    setTimeout(() => setShowFeedback(null), 3000);
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
            {showFeedback && (
              <div className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg animate-in slide-in-from-top-1 fade-in duration-300">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">
                  <SparkleIcon className="w-3 h-3 animate-pulse" /> {showFeedback}
                </span>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm group"
              title="Voltar"
            >
              <X className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              Sair do Perfil
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

        {/* Firmografia e Tecnografia enriquecida */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-slate-700/40 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{account.localizacao}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">{account.segmento} · {account.porte}</span>
          <span>Etapa: <span className="text-slate-100 font-bold uppercase">{account.etapa}</span></span>
          <span>Budget: <span className="text-emerald-400 font-bold">{fmt(account.budgetBrl)}</span></span>
          <span>Cobertura Relacional: <span className={`font-bold ${account.coberturaRelacional >= 60 ? 'text-emerald-400' : account.coberturaRelacional >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{account.coberturaRelacional}%</span></span>
          
          {account.ownersSecundarios.length > 0 && (
            <span className="flex items-center gap-1 border-l border-slate-700 pl-4"><Users className="w-3 h-3 text-blue-500" />Time: {account.ownersSecundarios.join(', ')}</span>
          )}

          {localTecnografia.length > 0 && (
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">Stack:</span>
              <div className="flex gap-1.5">
                {localTecnografia.map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-md font-bold tracking-tight">{t}</span>
                ))}
              </div>
            </div>
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
              { label: 'Pipeline', val: fmt(localOportunidades.reduce((a, o) => a + o.valor, 0)), color: 'text-slate-100' },
              { label: 'Risco Churn', val: account.risco > 70 ? 'ALTO' : 'BAIXO', color: account.risco > 70 ? 'text-red-400' : 'text-emerald-400' },
              { label: 'Oportunidades', val: `${localOportunidades.length}`, color: localOportunidades.length > 0 ? 'text-blue-400' : 'text-slate-500' },
            ].map(k => (
              <div key={k.label} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                <span className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1">{k.label}</span>
                <div className={`text-xl font-black ${k.color}`}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Leitura Estruturada AI (Recorte 25 + E17) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <SparkleIcon className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Leitura Canopi AI</h2>
              </div>
              <button
                onClick={() => setEditingLeitura(editingLeitura ? null : { ...localLeitura })}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                title={editingLeitura ? 'Cancelar edição' : 'Editar leitura'}
              >
                <Pencil className="w-3 h-3" />
                {editingLeitura ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Factual — Dados Verificáveis</span>
              </div>
              {localLeitura.factual.length > 0 ? (
                <ul className="space-y-1.5">
                  {localLeitura.factual.map((f, i) => (
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
              {localLeitura.inferida.length > 0 ? (
                <ul className="space-y-1.5">
                  {localLeitura.inferida.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">~</span>{f}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem inferências registradas.</p>}
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Recomendações — Ação Sugerida</span>
              </div>
              {localLeitura.sugerida.length > 0 ? (
                <ul className="space-y-1.5">
                  {localLeitura.sugerida.map((f, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>{f}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem recomendações registradas.</p>}
            </div>

            {/* Editor Mínimo: Leitura Estruturada (Recorte E17) */}
            {editingLeitura && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-blue-500/20 space-y-3">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-emerald-500 uppercase tracking-widest">Dados Factuais</label>
                  <textarea
                    value={editingLeitura.factual.join('\n')}
                    onChange={(e) => setEditingLeitura({ ...editingLeitura, factual: e.target.value.split('\n').filter(l => l.trim()) })}
                    placeholder="Uma observação por linha"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-amber-500 uppercase tracking-widest">Padrões AI (Inferências)</label>
                  <textarea
                    value={editingLeitura.inferida.join('\n')}
                    onChange={(e) => setEditingLeitura({ ...editingLeitura, inferida: e.target.value.split('\n').filter(l => l.trim()) })}
                    placeholder="Uma inferência por linha"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-blue-500 uppercase tracking-widest">Ações Sugeridas</label>
                  <textarea
                    value={editingLeitura.sugerida.join('\n')}
                    onChange={(e) => setEditingLeitura({ ...editingLeitura, sugerida: e.target.value.split('\n').filter(l => l.trim()) })}
                    placeholder="Uma ação sugerida por linha"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setEditingLeitura(null)}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveLeitura}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Histórico Operacional (Recorte 49: E18) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Histórico Estruturado</h2>
              </div>
              <button
                onClick={() => setEditingHistorico(editingHistorico ? null : { data: '', tipo: '', descricao: '', icone: 'HistoryIcon' })}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                title={editingHistorico ? 'Cancelar edição' : 'Adicionar entrada'}
              >
                <Pencil className="w-3 h-3" />
                {editingHistorico ? 'Cancelar' : 'Adicionar'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
              {localHistorico.length > 0 ? (
                <ul className="space-y-2.5">
                  {localHistorico.map((h, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2 pb-2 border-b border-slate-700/30 last:border-b-0">
                      <span className="text-slate-500 flex-shrink-0 font-bold">{h.data}</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-200">{h.tipo}</div>
                        <div className="text-slate-400 mt-0.5">{h.descricao}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem entradas no histórico.</p>}
            </div>

            {/* Editor Mínimo: Nova Entrada Histórica (Recorte E18) */}
            {editingHistorico && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-amber-500/20 space-y-3">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Data (dd/mm/aaaa)</label>
                  <input
                    type="text"
                    value={editingHistorico.data}
                    onChange={(e) => setEditingHistorico({ ...editingHistorico, data: e.target.value })}
                    placeholder={new Date().toLocaleDateString('pt-BR')}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Tipo</label>
                  <select
                    value={editingHistorico.tipo}
                    onChange={(e) => setEditingHistorico({ ...editingHistorico, tipo: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-slate-600/50"
                  >
                    <option value="">Selecionar tipo</option>
                    <option value="Sinal Detectado">Sinal Detectado</option>
                    <option value="Ação Executada">Ação Executada</option>
                    <option value="Evento Crítico">Evento Crítico</option>
                    <option value="Mudança Estratégica">Mudança Estratégica</option>
                    <option value="Nota Operacional">Nota Operacional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Descrição</label>
                  <textarea
                    value={editingHistorico.descricao}
                    onChange={(e) => setEditingHistorico({ ...editingHistorico, descricao: e.target.value })}
                    placeholder="Descreva a entrada histórica"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600/50"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Ícone (opcional)</label>
                  <select
                    value={editingHistorico.icone || 'HistoryIcon'}
                    onChange={(e) => setEditingHistorico({ ...editingHistorico, icone: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-slate-600/50"
                  >
                    <option value="HistoryIcon">Histórico</option>
                    <option value="AlertTriangle">Alerta</option>
                    <option value="Clock">Relogio</option>
                    <option value="TrendingUp">Tendência</option>
                    <option value="Activity">Atividade</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setEditingHistorico(null)}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveHistorico}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-[9px] font-bold text-amber-400 hover:text-amber-300 transition-all"
                  >
                    Salvar Entrada
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stack Tecnológico (Recorte 50: E19) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stack Tecnológico</h2>
              </div>
              <button
                onClick={() => setEditingTecnografia(editingTecnografia !== null ? null : '')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                title={editingTecnografia !== null ? 'Cancelar adição' : 'Adicionar tecnologia'}
              >
                <Pencil className="w-3 h-3" />
                {editingTecnografia !== null ? 'Cancelar' : 'Adicionar'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
              {localTecnografia.length > 0 ? (
                <ul className="space-y-2">
                  {localTecnografia.map((tech, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center justify-between p-2 bg-slate-900/30 rounded-lg border border-slate-700/20">
                      <span className="font-bold text-slate-200">{tech}</span>
                      <button
                        onClick={() => handleRemoveTecnografia(i)}
                        className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                        title="Remover tecnologia"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-slate-600 italic">Sem tecnologias registradas.</p>}
            </div>

            {/* Editor Mínimo: Adicionar Tecnologia (Recorte E19) */}
            {editingTecnografia !== null && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-blue-500/20 space-y-3">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome da Tecnologia</label>
                  <input
                    type="text"
                    value={editingTecnografia ?? ''}
                    onChange={(e) => setEditingTecnografia(e.target.value)}
                    placeholder="Ex: Salesforce, AWS, SAP S/4HANA"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600/50"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setEditingTecnografia(null)}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-[9px] font-bold text-slate-400 hover:text-slate-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTecnografia}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-all"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ────── FILA DE FOGO / FIRE QUEUE (RECORTE 28) ────── */}
          <div className="relative p-6 bg-gradient-to-br from-red-500/5 to-transparent rounded-[32px] border border-red-500/10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Flame className="w-32 h-32 text-red-500" />
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/10 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Flame className="w-4 h-4 text-red-500" />
                   </div>
                   <div>
                      <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Fila de Fogo: Priorização Estratégica</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Cruzamento de Sinais, Memória e Radar Relacional</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400">NEXT BEST PLAY</span>
                   <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[9px] font-black text-slate-500 uppercase tracking-widest">Calculado agora</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {/* Item 1: Inteligência Relacional + Sinais */}
                 <div className="group p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-red-500/30 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">ALERTA CRÍTICO</span>
                       </div>
                       <span className="text-[8px] font-black text-slate-600 uppercase">Prioridade #1</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 mb-2 leading-tight">
                       Executivo em área crítica + histórico positivo com sponsor → priorizar abordagem executiva
                    </p>
                    <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sinal Atual</span>
                          <p className="text-[11px] text-slate-400">{account.sinais[0]?.titulo || 'Mudança Detectada'}</p>
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Aprendizado Histórico</span>
                          <p className="text-[11px] text-slate-400 italic">&quot;{account.inteligencia.padroes[0] || 'Aceleração via decisores técnicos.'}&quot;</p>
                       </div>
                    </div>
                    <button className="w-full mt-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest transition-all">
                       Ativar Play de Blindagem
                    </button>
                 </div>

                 {/* Item 2: Radar Gaps + Sucessos */}
                 <div className="group p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <Users2 className="w-4 h-4 text-blue-500" />
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">GAP DE COBERTURA</span>
                       </div>
                       <span className="text-[8px] font-black text-slate-600 uppercase">Prioridade #2</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 mb-2 leading-tight">
                       Sinal de alerta em área sem cobertura + padrão histórico de bloqueio → priorizar preenchimento de gap
                    </p>
                    <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ponto de Tensão</span>
                          <p className="text-[11px] text-slate-400">{account.contatos.find(c => c.classificacao.includes('Blocker'))?.nome || 'Stakeholder Crítico'}</p>
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Sucesso Base</span>
                          <p className="text-[11px] text-slate-400 italic">&quot;{account.inteligencia.sucessos[0] || 'Abertura via outbound consultivo.'}&quot;</p>
                       </div>
                    </div>
                    <button className="w-full mt-5 py-2.5 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/30 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest transition-all">
                       Alocar Champion Técnico
                    </button>
                 </div>

                 {/* Item 3: Hipóteses + Contexto Recente */}
                 <div className="group p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">ESTRATÉGIA AI</span>
                       </div>
                       <span className="text-[8px] font-black text-slate-600 uppercase">Prioridade #3</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 mb-2 leading-tight">
                       Conta com hipótese recorrente e contexto favorável → priorizar play de destrave comercial
                    </p>
                    <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hipótese AI</span>
                          <p className="text-[11px] text-slate-400">{account.inteligencia.hipoteses[0] || 'Workshop executivo sugerido.'}</p>
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Contexto</span>
                          <p className="text-[11px] text-slate-400">Janela de renovação ativa e sinais de engajamento.</p>
                       </div>
                    </div>
                    <button className="w-full mt-5 py-2.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest transition-all">
                       Simular Valor do ROI
                    </button>
                 </div>
              </div>
          </div>

          {/* Canais e Campanhas (Evolução Canônica) */}
          <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" /> Origem e Influência de Canais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Origem Principal</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{account.canaisCampanhas.origemPrincipal}</p>
                    <p className="text-[10px] text-slate-500">Atribuição por Primeiro Toque</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Influência Recente</span>
                <div className="space-y-3">
                  {account.canaisCampanhas.influencias.map((inf, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-300">{inf.canal} — {inf.campanha}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 italic">{inf.data}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operacional: Ações e Oportunidades */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Ações Operacionais
              </h3>
              <div className="space-y-3">
                {realActions.length > 0 ? realActions.map(a => (
                  <div key={a.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <p className="text-sm font-bold text-slate-100">{a.title}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${statusAcaoStyle[a.status]}`}>{a.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{a.ownerName || 'Sem owner'} • {a.category}</div>
                    {a.nextStep && (
                      <div className="mt-2 text-[10px] text-blue-400 font-medium italic truncate">
                        → {a.nextStep}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="py-8 text-center border border-dashed border-slate-700/50 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Nenhuma ação ativa</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Pipeline
              </h3>
              <div className="space-y-3">
                {localOportunidades.map(op => (
                  <div key={op.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 relative group">
                    <button 
                      onClick={() => setEditingOp(op)}
                      className="absolute top-3 right-3 p-1 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-slate-700"
                      title="Editar risco e etapa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between items-start mb-1 pr-8">
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

          {/* ────── INSIGHTS HISTÓRICOS & LIÇÕES APRENDIDAS (RECORTE 27) ────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Inteligência Cumulativa e Memória Operacional</h2>
              </div>
              <button 
                onClick={() => setEditingIntel(localInteligencia)}
                className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700"
                title="Editar Inteligência"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sucessos e Insucessos: O Fato Histórico */}
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex flex-col gap-4">
                <div>
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Memória de Prospecção</span>
                   <div className="space-y-3">
                     {localInteligencia.sucessos.map((s, i) => (
                       <div key={i} className="flex gap-2 text-xs">
                         <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <p className="text-slate-300 leading-relaxed">{s}</p>
                       </div>
                     ))}
                     {localInteligencia.insucessos.map((s, i) => (
                       <div key={i} className="flex gap-2 text-xs opacity-60">
                         <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
                         <p className="text-slate-400 leading-relaxed line-through decoration-red-900/50 italic">{s}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* Padrões e Learnings: O Conhecimento Extraído */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-blue-500/10 flex flex-col gap-4">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Padrões & Learnings</span>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Padrões Observados</p>
                    <div className="space-y-2 text-xs text-slate-200 font-medium">
                      {localInteligencia.padroes.map((p, i) => (
                        <div key={i} className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 italic">
                          &quot;{p}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Lição Principal</p>
                    <div className="flex items-center gap-3 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                      <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-200/80 font-bold leading-tight">{localInteligencia.learnings[0] || 'Sem learnings registrados.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hipóteses e Recomendações: A Implicação operacional */}
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex flex-col gap-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Hipóteses de Destrave</span>
                <div className="space-y-3">
                  {localInteligencia.hipoteses.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/30 border border-slate-800 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <SparkleIcon className="w-3 h-3 text-blue-400" />
                        <p className="text-xs font-bold text-slate-200">Hipótese #{i+1}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{h}</p>
                    </div>
                  ))}
                  {localInteligencia.fatoresRecomendacao.length > 0 && (
                     <div className="mt-2 pt-3 border-t border-slate-700/50">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Fatores AI</p>
                        <div className="flex flex-wrap gap-1.5">
                           {localInteligencia.fatoresRecomendacao.map((f, i) => (
                             <span key={i} className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700">{f}</span>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
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

            {localContatos.length > 0 ? (
              <div className={`bg-slate-900 rounded-[28px] border border-slate-800/60 shadow-2xl overflow-hidden transition-all duration-300 ${orgView === 'tree' ? 'p-6 md:p-8' : 'p-0'} ${selectedContactId && isFullscreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {orgView === 'tree' ? (
                  <div className="space-y-2">
                    {(() => {
                      const topLevel = localContatos.filter(c => !c.liderId || !localContatos.find(p => p.id === c.liderId));
                      return topLevel.map(contact => (
                        <div key={contact.id}>
                          {renderTree(localContatos, contact.liderId ? undefined : contact.id, 0)}
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
                      {localContatos.map(contact => {
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
                <HistoryIcon className="w-4 h-4" /> Timeline Integrada (360)
              </h3>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {(() => {
                  const sLogs = sessionLogs[accountId] || [];
                  const combined = [
                    ...sLogs.map(text => ({
                      tipo: 'Log Manual',
                      data: 'Agora',
                      descricao: text,
                      icone: 'LogsIcon'
                    })),
                    ...localHistorico.map(h => ({ ...h, tipo: h.tipo as any }))
                  ];
                  return combined.map((h, i) => {
                    const IconComp = h.icone === 'AlertTriangle' ? AlertTriangle : h.icone === 'Clock' ? Clock : h.icone === 'TrendingUp' ? TrendingUp : h.icone === 'Activity' ? Activity : h.icone === 'LogsIcon' ? LogsIcon : HistoryIcon;
                    return (
                      <div key={i} className="relative pl-9">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center z-10 shadow-lg">
                           <IconComp className={`w-3 h-3 ${h.tipo.includes('Sinal') ? 'text-red-500' : h.tipo.includes('Ação') ? 'text-blue-500' : 'text-emerald-500'}`} />
                        </div>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{h.tipo}</span>
                          <span className="text-[10px] font-bold text-slate-600 italic">{h.data}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{h.descricao}</p>
                      </div>
                    );
                  });
                })()}
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

      {/* FOOTER OPERACIONAL (UX REFINADA) */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50 bg-slate-800/80 flex flex-col gap-4 backdrop-blur-md">
        {isLogging ? (
          <div className="w-full flex flex-col gap-3 p-3 bg-slate-900 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Novo Registro de Log</span>
              <LogsIcon className="w-3 h-3 text-blue-500" />
            </div>
            <textarea 
              autoFocus
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-600 transition-all resize-none"
              placeholder="Descreva a atividade realizada com esta conta..."
              value={logDraft}
              onChange={e => setLogDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setIsLogging(false); setLogDraft(''); }} 
                className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveLog} 
                className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
              >
                Salvar Log
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsLogging(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all text-slate-100 shadow-lg active:scale-95"
              >
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
              <button 
                onClick={handleExecPlaybook}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95"
              >
                Executar Playbook <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── OVERLAY: FILTRO CONTEXTUAL (RECORTE 26) ── */}
      {selectedContactId && (
        <div className="absolute inset-0 z-50 flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedContactId(null)} />
          <div className={`relative h-full shadow-2xl transition-all duration-300 ${isFullscreen ? 'w-full md:w-[45%]' : 'w-full'}`}>
            {(() => {
              const contact = localContatos.find(c => c.id === selectedContactId);
              if (!contact) return null;
              // FILTRO RIGOROSO POR ÁREA DO CONTATO
              const sinaisAssociados = account.sinais.filter(s => s.contexto === contact.area);
              const acoesAssociadas = account.acoes.filter(a => a.titulo.toLowerCase().includes(contact.area.toLowerCase()) || a.owner.includes(contact.nome));
              return (
                <ContactDetailProfile
                  contact={contact}
                  onClose={() => setSelectedContactId(null)}
                  onUpdateContact={handleUpdateContact}
                  accountId={account.id}
                  sinais={sinaisAssociados}
                  acoes={realActions.filter(a => a.ownerName === contact.nome || a.description.includes(contact.nome))}
                  accountName={account.nome}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* ── OVERLAY: EDIÇÃO DE INTELIGÊNCIA (RECORTE 47) ── */}
      {editingIntel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setEditingIntel(null)} />
          <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 italic">Memória e Inteligência da Conta</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Escrita Defensiva Atômica</p>
              </div>
              <button onClick={() => setEditingIntel(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'sucessos', label: 'Sucessos Sociais/Táticos', color: 'text-emerald-400' },
                { key: 'insucessos', label: 'Insucessos/Bloqueios', color: 'text-red-400' },
                { key: 'padroes', label: 'Padrões Observados', color: 'text-blue-400' },
                { key: 'learnings', label: 'Lições Aprendidas', color: 'text-amber-400' },
                { key: 'hipoteses', label: 'Hipóteses de Destrave', color: 'text-violet-400' },
                { key: 'fatoresRecomendacao', label: 'Fatores de Recomendação', color: 'text-slate-400' },
              ].map(block => (
                <div key={block.key} className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{block.label}</label>
                  <textarea
                    className={`w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all resize-none ${block.color}`}
                    placeholder="Um item por linha..."
                    value={editingIntel[block.key as keyof Conta['inteligencia']].join('\n')}
                    onChange={e => {
                      const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                      setEditingIntel({ ...editingIntel, [block.key]: lines });
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
              <button onClick={() => setEditingIntel(null)} className="px-6 py-2.5 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-colors uppercase tracking-widest">Descartar</button>
              <button 
                onClick={handleSaveInteligencia} 
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-blue-900/40 active:scale-95 flex items-center gap-2"
              >
                <SparkleIcon className="w-4 h-4" /> Salvar Inteligência
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDetailView;
