"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  AlertTriangle, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  KanbanSquare, 
  Search, 
  ExternalLink, 
  ArrowUpRight, 
  Building2, 
  Target, 
  Zap,
  Activity, 
  Sparkles, 
  Mail, 
  Globe,
  Layout,
  Users,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { contasMock, type Conta, type TipoEstrategico } from '../data/accountsData';
import { getAccounts, persistAccount } from '../lib/accountsRepository';
import { calculateAccountScore } from '../lib/scoringRepository';
import { useAccountDetail } from '../context/AccountDetailContext';
import { getInteractions } from '../lib/interactionsRepository';
import { getPlayRecommendations } from '../lib/playRecommendationsRepository';
import { Interaction, PlayRecommendation } from '../../scripts/seed/buildBlockCSeed';

type Visualizacao = 'lista' | 'grade' | 'board';
type Ordenacao = 'potencial_desc' | 'risco_desc' | 'movimentacao_desc' | 'score_desc' | 'score_asc' | 'engajamento_desc';

type Filtros = {
  busca: string;
  vertical: string;
  segmento: string;
  owner: string;
  etapa: string;
  tipoConta: 'todas' | 'em_andamento' | 'abm' | 'abx' | 'hibridas';
  potencial: string;
  risco: string;
  cobertura: string;
  oportunidade: string;
  atividade: string;
  play: string;
  blocoCInteracoes: 'todos' | 'com' | 'sem' | 'recente';
  blocoCPlays: 'todos' | 'com' | 'sem';
};

const filtrosIniciais: Filtros = {
  busca: '', vertical: 'todos', segmento: 'todos', owner: 'todos', etapa: 'todas',
  tipoConta: 'todas', potencial: 'todos', risco: 'todos', cobertura: 'todos', oportunidade: 'todas', atividade: 'todas', play: 'todos',
  blocoCInteracoes: 'todos', blocoCPlays: 'todos'
};

const toDate = (date: string) => new Date(date).getTime();
const badgeClasse = (status: Conta['statusGeral']) => status === 'Crítico' ? 'bg-rose-100 text-rose-700' : status === 'Atenção' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
const riscoClasse = (risco: number) => risco >= 70 ? 'text-rose-600' : risco >= 40 ? 'text-amber-600' : 'text-emerald-600';

export const Accounts = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openAccount } = useAccountDetail();

  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState<Conta[]>([]);
  const [allInteractions, setAllInteractions] = useState<Interaction[]>([]);
  const [allPlays, setAllPlays] = useState<PlayRecommendation[]>([]);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>((searchParams?.get('view') as Visualizacao) || 'lista');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>((searchParams?.get('sort') as Ordenacao) || 'potencial_desc');
  const [filtros, setFiltros] = useState<Filtros>({
    ...filtrosIniciais,
    busca: searchParams?.get('busca') || '',
    vertical: searchParams?.get('vertical') || 'todos',
    segmento: searchParams?.get('segmento') || 'todos',
    owner: searchParams?.get('owner') || 'todos',
    etapa: searchParams?.get('etapa') || 'todas',
    tipoConta: (searchParams?.get('tipo') as Filtros['tipoConta']) || 'todas',
    potencial: searchParams?.get('potencial') || 'todos',
    risco: searchParams?.get('risco') || 'todos',
    cobertura: searchParams?.get('cobertura') || 'todos',
    oportunidade: searchParams?.get('oportunidade') || 'todas',
    atividade: searchParams?.get('atividade') || 'todas',
    play: searchParams?.get('play') || 'todos',
    blocoCInteracoes: (searchParams?.get('blocoCInteracoes') as Filtros['blocoCInteracoes']) || 'todos',
    blocoCPlays: (searchParams?.get('blocoCPlays') as Filtros['blocoCPlays']) || 'todos'
  });

  useEffect(() => {
    const carregarContas = async () => {
      try {
        const [dadosContas, dadosInteractions, dadosPlays] = await Promise.all([
          getAccounts(),
          getInteractions(),
          getPlayRecommendations()
        ]);
        setContas(dadosContas);
        setAllInteractions(dadosInteractions);
        setAllPlays(dadosPlays);
      } catch (err) {
        console.error('[Accounts] Erro ao carregar contas ou bloco C:', err);
        setContas(contasMock);
      }
    };

    carregarContas();

    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.busca) params.set('busca', filtros.busca);
    if (filtros.vertical !== 'todos') params.set('vertical', filtros.vertical);
    if (filtros.segmento !== 'todos') params.set('segmento', filtros.segmento);
    if (filtros.owner !== 'todos') params.set('owner', filtros.owner);
    if (filtros.etapa !== 'todas') params.set('etapa', filtros.etapa);
    if (filtros.tipoConta !== 'todas') params.set('tipo', filtros.tipoConta);
    if (filtros.potencial !== 'todos') params.set('potencial', filtros.potencial);
    if (filtros.risco !== 'todos') params.set('risco', filtros.risco);
    if (filtros.cobertura !== 'todos') params.set('cobertura', filtros.cobertura);
    if (filtros.oportunidade !== 'todas') params.set('oportunidade', filtros.oportunidade);
    if (filtros.atividade !== 'todas') params.set('atividade', filtros.atividade);
    if (filtros.play !== 'todos') params.set('play', filtros.play);
    if (filtros.blocoCInteracoes !== 'todos') params.set('blocoCInteracoes', filtros.blocoCInteracoes);
    if (filtros.blocoCPlays !== 'todos') params.set('blocoCPlays', filtros.blocoCPlays);
    params.set('view', visualizacao);
    params.set('sort', ordenacao);
    router.replace(`${pathname}?${params.toString()}`);
  }, [filtros, visualizacao, ordenacao, pathname, router]);

  const opcoes = useMemo(() => ({
    verticais: Array.from(new Set(contas.map((c) => c.vertical))),
    segmentos: Array.from(new Set(contas.map((c) => c.segmento))),
    owners: Array.from(new Set(contas.map((c) => c.ownerPrincipal))),
    etapas: Array.from(new Set(contas.map((c) => c.etapa)))
  }), [contas]);

  // Agregação de Sinais do Bloco C por Conta (Movido para cima para ser usado no sort)
  const blocoCSignals = useMemo(() => {
    const map: Record<string, { interactionsCount: number; playsCount: number; lastInteractionDate?: string }> = {};

    contas.forEach(c => {
      const accountInteractions = allInteractions.filter(i => i.accountId === c.id);
      const accountPlays = allPlays.filter(p => p.accountId === c.id && p.isActive);

      map[c.id] = {
        interactionsCount: accountInteractions.length,
        playsCount: accountPlays.length,
        lastInteractionDate: accountInteractions.length > 0
          ? accountInteractions.sort((a, b) => b.date.localeCompare(a.date))[0].date
          : undefined
      };
    });

    return map;
  }, [contas, allInteractions, allPlays]);

  const filtradas = useMemo(() => {
    let data = contas.filter((c) => {
      if (filtros.busca && !`${c.nome} ${c.dominio}`.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
      if (filtros.vertical !== 'todos' && c.vertical !== filtros.vertical) return false;
      if (filtros.segmento !== 'todos' && c.segmento !== filtros.segmento) return false;
      if (filtros.owner !== 'todos' && c.ownerPrincipal !== filtros.owner) return false;
      if (filtros.etapa !== 'todas' && c.etapa !== filtros.etapa) return false;
      if (filtros.tipoConta === 'abm' && c.tipoEstrategico !== 'ABM') return false;
      if (filtros.tipoConta === 'abx' && c.tipoEstrategico !== 'ABX') return false;
      if (filtros.tipoConta === 'hibridas' && c.tipoEstrategico !== 'Híbrida') return false;
      if (filtros.tipoConta === 'em_andamento' && c.tipoEstrategico !== 'Em andamento') return false;
      if (filtros.potencial === 'alto' && c.potencial < 80) return false;
      if (filtros.potencial === 'medio' && (c.potencial < 50 || c.potencial >= 80)) return false;
      if (filtros.risco === 'alto' && c.risco < 70) return false;
      if (filtros.risco === 'medio' && (c.risco < 40 || c.risco >= 70)) return false;
      if (filtros.cobertura === 'baixa' && c.coberturaRelacional >= 50) return false;
      if (filtros.cobertura === 'alta' && c.coberturaRelacional < 70) return false;
      if (filtros.oportunidade === 'com' && !c.possuiOportunidade) return false;
      if (filtros.oportunidade === 'sem' && c.possuiOportunidade) return false;
      if (filtros.atividade !== 'todas' && c.atividadeRecente.toLowerCase() !== filtros.atividade) return false;
      if (filtros.play !== 'todos' && c.playAtivo.toLowerCase() !== filtros.play) return false;

      // FILTROS BLOCO C (Supersede ou complementa os manuais)
      const signals = blocoCSignals[c.id];
      if (filtros.blocoCInteracoes === 'com' && (!signals || signals.interactionsCount === 0)) return false;
      if (filtros.blocoCInteracoes === 'sem' && signals && signals.interactionsCount > 0) return false;
      if (filtros.blocoCInteracoes === 'recente') {
        if (!signals || !signals.lastInteractionDate) return false;
        const lastDate = new Date(signals.lastInteractionDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (lastDate < thirtyDaysAgo) return false;
      }
      if (filtros.blocoCPlays === 'com' && (!signals || signals.playsCount === 0)) return false;
      if (filtros.blocoCPlays === 'sem' && signals && signals.playsCount > 0) return false;

      return true;
    });

    data = data.sort((a, b) => {
      if (ordenacao === 'potencial_desc') return b.potencial - a.potencial;
      if (ordenacao === 'risco_desc') return b.risco - a.risco;
      if (ordenacao === 'score_desc') {
        const scoreA = calculateAccountScore(a).scoreTotal;
        const scoreB = calculateAccountScore(b).scoreTotal;
        return scoreB - scoreA;
      }
      if (ordenacao === 'score_asc') {
        const scoreA = calculateAccountScore(a).scoreTotal;
        const scoreB = calculateAccountScore(b).scoreTotal;
        return scoreA - scoreB;
      }
      if (ordenacao === 'engajamento_desc') {
        const dateA = blocoCSignals[a.id]?.lastInteractionDate || '0000-00-00';
        const dateB = blocoCSignals[b.id]?.lastInteractionDate || '0000-00-00';
        return dateB.localeCompare(dateA);
      }
      return toDate(b.ultimaMovimentacao) - toDate(a.ultimaMovimentacao);
    });

    return data;
  }, [filtros, ordenacao, contas, blocoCSignals]);

  const metricas = useMemo(() => ({
    prioritarias: contas.filter((c) => c.potencial >= 80 || c.statusGeral !== 'Saudável').length,
    risco: contas.filter((c) => c.risco >= 70).length,
    andamento: contas.filter((c) => c.tipoEstrategico === 'Em andamento').length,
    abm: contas.filter((c) => c.tipoEstrategico === 'ABM').length,
    abx: contas.filter((c) => c.tipoEstrategico === 'ABX').length,
    altoPotencial: contas.filter((c) => c.potencial >= 80).length,
    baixaCobertura: contas.filter((c) => c.coberturaRelacional < 50).length,
    oportunidades: contas.filter((c) => c.possuiOportunidade).length
  }), [contas]);

  const atualizarFiltro = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => setFiltros((prev) => ({ ...prev, [chave]: valor }));

  // Handler local-first + fire-and-forget para atualizar tipoEstrategico
  // 1. Snapshot: captura estado atual completo (tipoEstrategico + playAtivo)
  // 2. Atualiza estado local imediatamente via setContas()
  // 3. Persiste AMBOS os campos juntos (impede sobrescrita mútua com undefined)
  const handleUpdateTipoEstrategico = (contaId: string, newTipo: TipoEstrategico) => {
    // Snapshot: encontra a conta atual
    const contaAtual = contas.find(c => c.id === contaId);
    if (!contaAtual) return;

    // Local-first: atualiza estado local imediatamente
    setContas(prev => prev.map(c =>
      c.id === contaId ? { ...c, tipoEstrategico: newTipo } : c
    ));

    // Fire-and-forget: persiste TODOS os 4 campos no snapshot
    persistAccount({
      id: contaId,
      tipoEstrategico: newTipo,
      playAtivo: contaAtual.playAtivo,
      resumoExecutivo: contaAtual.resumoExecutivo,
      proximaMelhorAcao: contaAtual.proximaMelhorAcao
    });
  };

  // Handler local-first + fire-and-forget para atualizar playAtivo
  // 1. Snapshot: captura estado atual completo (tipoEstrategico + playAtivo)
  // 2. Atualiza estado local imediatamente via setContas()
  // 3. Persiste AMBOS os campos juntos (impede sobrescrita mútua com undefined)
  const handleUpdatePlayAtivo = (contaId: string, newPlay: 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum') => {
    // Snapshot: encontra a conta atual
    const contaAtual = contas.find(c => c.id === contaId);
    if (!contaAtual) return;

    // Local-first: atualiza estado local imediatamente
    setContas(prev => prev.map(c =>
      c.id === contaId ? { ...c, playAtivo: newPlay } : c
    ));

    // Fire-and-forget: persiste TODOS os 4 campos no snapshot
    persistAccount({
      id: contaId,
      tipoEstrategico: contaAtual.tipoEstrategico,
      playAtivo: newPlay,
      resumoExecutivo: contaAtual.resumoExecutivo,
      proximaMelhorAcao: contaAtual.proximaMelhorAcao
    });
  };

  // Handler ATÔMICO local-first + fire-and-forget para atualizar AMBAS narrativas
  // Garante: 1 snapshot + 1 setState + 1 persist = zero sobrescrita de race condition
  const handleUpdateNarrativas = (contaId: string, newResumo: string, newAcao: string) => {
    const contaAtual = contas.find(c => c.id === contaId);
    if (!contaAtual) return;

    // Local-first: atualiza AMBOS os campos em um único setState
    setContas(prev => prev.map(c =>
      c.id === contaId ? { ...c, resumoExecutivo: newResumo, proximaMelhorAcao: newAcao } : c
    ));

    // Fire-and-forget: persiste TODOS os 4 campos com snapshot único
    // Atomicidade garantida: não há condição de corrida entre dois persists
    persistAccount({
      id: contaId,
      tipoEstrategico: contaAtual.tipoEstrategico,
      playAtivo: contaAtual.playAtivo,
      resumoExecutivo: newResumo,
      proximaMelhorAcao: newAcao
    });
  };

  // Estado para controlar modal de edição de campos narrativos
  const [editingContaId, setEditingContaId] = useState<string | null>(null);
  const [editResumo, setEditResumo] = useState('');
  const [editAcao, setEditAcao] = useState('');

  const abrirEditorNarrativo = (conta: Conta) => {
    setEditingContaId(conta.id);
    setEditResumo(conta.resumoExecutivo || '');
    setEditAcao(conta.proximaMelhorAcao || '');
  };

  const fecharEditorNarrativo = () => {
    setEditingContaId(null);
    setEditResumo('');
    setEditAcao('');
  };

  const salvarNarrativas = () => {
    if (!editingContaId) return;
    // Chamada ÚNICA e ATÔMICA para ambas narrativas
    handleUpdateNarrativas(editingContaId, editResumo, editAcao);
    fecharEditorNarrativo();
  };

  const macroCards = [
    { titulo: 'Contas prioritárias', valor: metricas.prioritarias, acao: () => setFiltros((f) => ({ ...f, potencial: 'alto' })) },
    { titulo: 'Contas em risco', valor: metricas.risco, acao: () => setFiltros((f) => ({ ...f, risco: 'alto' })) },
    { titulo: 'Contas em andamento', valor: metricas.andamento, acao: () => setFiltros((f) => ({ ...f, tipoConta: 'em_andamento' })) },
    { titulo: 'Contas ABM', valor: metricas.abm, acao: () => setFiltros((f) => ({ ...f, tipoConta: 'abm' })) },
    { titulo: 'Contas ABX', valor: metricas.abx, acao: () => setFiltros((f) => ({ ...f, tipoConta: 'abx' })) },
    { titulo: 'Alto potencial', valor: metricas.altoPotencial, acao: () => setFiltros((f) => ({ ...f, potencial: 'alto' })) },
    { titulo: 'Baixa cobertura relacional', valor: metricas.baixaCobertura, acao: () => setFiltros((f) => ({ ...f, cobertura: 'baixa' })) },
    { titulo: 'Oportunidades ativas', valor: metricas.oportunidades, acao: () => setFiltros((f) => ({ ...f, oportunidade: 'com' })) }
  ];

  const coberturaBase = Math.round(contas.reduce((acc, c) => acc + c.coberturaRelacional, 0) / contas.length);

  if (loading) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-8 text-sm text-slate-500">Carregando portfólio de contas...</div>;
  }

  if (contas.length === 0) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-8 text-sm text-slate-600">Nenhuma conta cadastrada no portfólio. Cadastre contas para iniciar a priorização operacional.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand/30 selection:text-white pb-20">
      {/* ── ALIGNED EXECUTIVE HERO ── */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 text-center md:text-left">
        <header className="relative overflow-hidden bg-[#020617] rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-900/20 border border-white/5">
          {/* Subtle Glow Overlays */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            {/* Top Context Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">Revenue Intelligence</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">Cockpit Ativo</span>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">Portfólio Estratégico</span>
            </div>

            {/* Breadcrumb & Title Area */}
            <div className="mb-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Canopi · Intelligence · Portfolio</p>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                Portfólio de Contas
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium max-w-3xl leading-relaxed mx-auto md:mx-0">
                Monitoramento estratégico e orquestração operacional do portfólio de contas.
              </p>
            </div>

            {/* Middle Controls (View Toggle & Search) */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mb-8">
              <div className="flex bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
                <button onClick={() => setVisualizacao('lista')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${visualizacao === 'lista' ? 'bg-white text-brand shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Lista</button>
                <button onClick={() => setVisualizacao('grade')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${visualizacao === 'grade' ? 'bg-white text-brand shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Grade</button>
                <button onClick={() => setVisualizacao('board')} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${visualizacao === 'board' ? 'bg-white text-brand shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Board</button>
              </div>
              <div className="relative group flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  value={filtros.busca} 
                  onChange={(e) => atualizarFiltro('busca', e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-slate-600" 
                  placeholder="Localizar conta..." 
                />
              </div>
            </div>

            {/* Integrated Metrics (Aligned Boxes) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] hover:bg-white/[0.08] transition-all group text-left">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Total de Contas</p>
                <p className="text-2xl font-black text-white tracking-tighter">{contas.length}</p>
                <p className="mt-1 text-[9px] font-bold text-emerald-500 uppercase">Base Ativa</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] hover:bg-white/[0.08] transition-all group cursor-pointer text-left" onClick={() => setFiltros(f => ({ ...f, potencial: 'alto' }))}>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Alto Potencial</p>
                <p className="text-2xl font-black text-white tracking-tighter">{metricas.altoPotencial}</p>
                <p className="mt-1 text-[9px] font-bold text-brand uppercase">Growth Fit</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] hover:bg-white/[0.08] transition-all group cursor-pointer text-left" onClick={() => setFiltros(f => ({ ...f, risco: 'alto' }))}>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Exposição Crítica</p>
                <p className="text-2xl font-black text-white tracking-tighter">{metricas.risco}</p>
                <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase">Risco Detectado</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] hover:bg-white/[0.08] transition-all group text-left">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Cobertura Relacional</p>
                <p className="text-2xl font-black text-white tracking-tighter">{coberturaBase}%</p>
                <p className="mt-1 text-[9px] font-bold text-blue-400 uppercase">Saúde</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] hover:bg-white/[0.08] transition-all group cursor-pointer text-left" onClick={() => setFiltros(f => ({ ...f, oportunidade: 'com' }))}>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Pipeline Ativo</p>
                <p className="text-2xl font-black text-white tracking-tighter">{metricas.oportunidades}</p>
                <p className="mt-1 text-[9px] font-bold text-brand uppercase">Oportunidades</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-center md:justify-start gap-3">
              <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                <ArrowUpRight className="w-3 h-3" /> Exportar Intel
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 mt-12 mb-20">
        {/* ── REFINED FILTER COMMAND STRIP ── */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 space-y-6 mb-8 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-brand" /> Filtros e Segmentação
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
                <select 
                  value={ordenacao} 
                  onChange={(e) => setOrdenacao(e.target.value as Ordenacao)} 
                  className="bg-transparent text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-brand focus:outline-none cursor-pointer"
                >
                  <option value="potencial_desc">Potencial (maior)</option>
                  <option value="risco_desc">Risco (maior)</option>
                  <option value="score_desc">Score Canopi (maior)</option>
                  <option value="score_asc">Score Canopi (menor)</option>
                  <option value="engajamento_desc">Engajamento Recente</option>
                  <option value="movimentacao_desc">Última movimentação</option>
                </select>
              </div>
              <button 
                onClick={() => setFiltros(filtrosIniciais)} 
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand transition-colors"
              >
                Limpar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            <select value={filtros.vertical} onChange={(e) => atualizarFiltro('vertical', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Vertical: Todas</option>
              {opcoes.verticais.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filtros.segmento} onChange={(e) => atualizarFiltro('segmento', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Segmento: Todos</option>
              {opcoes.segmentos.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filtros.owner} onChange={(e) => atualizarFiltro('owner', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Owner: Todos</option>
              {opcoes.owners.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filtros.etapa} onChange={(e) => atualizarFiltro('etapa', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todas">Etapa: Todas</option>
              {opcoes.etapas.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filtros.tipoConta} onChange={(e) => atualizarFiltro('tipoConta', e.target.value as Filtros['tipoConta'])} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todas">Estratégia: Todas</option>
              <option value="em_andamento">Em andamento</option>
              <option value="abm">ABM</option>
              <option value="abx">ABX</option>
              <option value="hibridas">Híbridas</option>
            </select>
            <select value={filtros.play} onChange={(e) => atualizarFiltro('play', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Play: Todos</option>
              <option value="abm">ABM</option>
              <option value="abx">ABX</option>
              <option value="híbrido">Híbrido</option>
              <option value="nenhum">Nenhum</option>
            </select>
            <select value={filtros.atividade} onChange={(e) => atualizarFiltro('atividade', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todas">Atividade: Todas</option>
              <option value="ativo">Ativo</option>
              <option value="parado">Parado</option>
            </select>
            <select value={filtros.potencial} onChange={(e) => atualizarFiltro('potencial', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Potencial: Todos</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
            </select>
            <select value={filtros.risco} onChange={(e) => atualizarFiltro('risco', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Risco: Todos</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
            </select>
            <select value={filtros.cobertura} onChange={(e) => atualizarFiltro('cobertura', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todos">Cobertura: Todas</option>
              <option value="alta">Alta</option>
              <option value="baixa">Baixa</option>
            </select>
            <select value={filtros.oportunidade} onChange={(e) => atualizarFiltro('oportunidade', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:border-brand focus:bg-white transition-all shadow-sm">
              <option value="todas">Pipeline: Todos</option>
              <option value="com">Com Oportunidade</option>
              <option value="sem">Sem Oportunidade</option>
            </select>
            <select value={filtros.blocoCInteracoes} onChange={(e) => atualizarFiltro('blocoCInteracoes', e.target.value as Filtros['blocoCInteracoes'])} className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs font-black text-emerald-600 focus:border-emerald-500 transition-all shadow-sm uppercase tracking-tighter">
              <option value="todos">Interações: Todas</option>
              <option value="com">Com Sinais</option>
              <option value="sem">Sem Sinais</option>
              <option value="recente">Recente (30d)</option>
            </select>
            <select value={filtros.blocoCPlays} onChange={(e) => atualizarFiltro('blocoCPlays', e.target.value as Filtros['blocoCPlays'])} className="w-full bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-xs font-black text-blue-600 focus:border-blue-500 transition-all shadow-sm uppercase tracking-tighter">
              <option value="todos">Plays Sugeridos: Todos</option>
              <option value="com">Com Recomendações</option>
              <option value="sem">Sem Recomendações</option>
            </select>
          </div>
        </section>

        {/* ── TACTICAL SHORTCUTS & OPERATION PRESETS ── */}
        <div className="mb-4 flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Layout className="w-3.5 h-3.5" /> Presets Operacionais
          </h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Acesso Rápido por Contexto</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <button onClick={() => { atualizarFiltro('risco', 'alto'); setOrdenacao('engajamento_desc'); }} className="p-4 bg-white border border-slate-200 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/5 rounded-[1.5rem] text-left group transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-12 h-12 text-rose-600" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Atenção Crítica</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 leading-tight">Contas de alto risco com movimentação recente detectada.</p>
          </button>

          <button onClick={() => { atualizarFiltro('tipoConta', 'abm'); atualizarFiltro('cobertura', 'baixa'); }} className="p-4 bg-white border border-slate-200 hover:border-brand hover:shadow-lg hover:shadow-brand/5 rounded-[1.5rem] text-left group transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Users className="w-12 h-12 text-brand" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-brand/5 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-brand" />
              </div>
              <span className="text-[9px] font-black text-brand uppercase tracking-widest">Gap Relacional</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 leading-tight">Contas ABM prontas para início de mapeamento estratégico.</p>
          </button>

          <button onClick={() => { atualizarFiltro('tipoConta', 'abx'); atualizarFiltro('oportunidade', 'com'); }} className="p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 rounded-[1.5rem] text-left group transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Aceleração Base</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 leading-tight">Expansão em contas com pipeline e estratégia ABX ativa.</p>
          </button>

          <button onClick={() => atualizarFiltro('blocoCPlays', 'com')} className="p-4 bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 rounded-[1.5rem] text-left group transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Cpu className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Machine Insight</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 leading-tight">Sugestão de plays recomendados pela inteligência Canopi.</p>
          </button>
        </div>

        {/* ── ACCOUNTS CONTENT AREA ── */}
        {filtradas.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-24 text-center border-dashed">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-lg font-black text-white tracking-tighter uppercase tracking-widest">Nenhum Registro Identificado</p>
            <p className="text-sm text-slate-500 mt-2 font-medium">Os critérios selecionados não retornaram contas compatíveis.</p>
            <button onClick={() => setFiltros(filtrosIniciais)} className="mt-8 px-6 py-2.5 bg-brand text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">Resetar Filtros</button>
          </div>
        ) : visualizacao === 'grade' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtradas.map((conta) => {
              const acoesAtrasadas = conta.acoes.filter(a => a.status === 'Atrasada').length;
              const signals = blocoCSignals[conta.id];
              const score = calculateAccountScore(conta);
              return (
                <div 
                  key={conta.id} 
                  className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-brand/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 py-10 px-6 opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none transition-opacity">
                    <Building2 className="w-32 h-32 text-slate-900" />
                  </div>
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${conta.statusGeral === 'Saudável' ? 'bg-emerald-500 pulse-green' : conta.statusGeral === 'Atenção' ? 'bg-amber-500 pulse-amber' : 'bg-rose-500 pulse-red'}`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{conta.vertical}</span>
                      </div>
                      <h3 onClick={() => openAccount(conta.id)} className="text-xl font-bold text-slate-900 tracking-tighter leading-tight truncate cursor-pointer hover:text-brand transition-colors">
                        {conta.nome}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate mt-0.5">{conta.dominio}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        conta.statusGeral === 'Saudável' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        conta.statusGeral === 'Crítico' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {conta.statusGeral}
                      </span>
                      <div className="bg-slate-50 border border-slate-200 p-1.5 flex items-center gap-2 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 px-1">SCORE</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${score.scoreTotal >= 75 ? 'bg-emerald-500/10 text-emerald-600' : score.scoreTotal >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}>
                          {score.scoreTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex items-center justify-between text-[11px] border-y border-slate-100 py-3">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Potencial</span>
                          <span className="text-slate-900 font-bold">{conta.potencial}%</span>
                       </div>
                       <div className="space-y-1 text-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mapeamento</span>
                          <span className="text-slate-900 font-bold">{conta.coberturaRelacional}%</span>
                       </div>
                       <div className="space-y-1 text-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Risco</span>
                          <span className={`font-bold ${riscoClasse(conta.risco)}`}>{conta.risco}</span>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {signals?.interactionsCount > 0 && (
                          <div className="px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex items-center gap-1.5" title="Sinais do Bloco C">
                            <Activity className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-400">{signals.interactionsCount}</span>
                          </div>
                        )}
                        {signals?.playsCount > 0 && (
                          <div className="px-2 py-1 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-400">{signals.playsCount} PLAYS</span>
                          </div>
                        )}
                        {acoesAtrasadas > 0 && (
                          <div className="px-2 py-1 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span className="text-[10px] font-black text-rose-400">{acoesAtrasadas} ATRASADAS</span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {conta.ownerPrincipal.substring(0,2).toUpperCase()}
                       </div>
                       <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">{conta.ownerPrincipal}</span>
                    </div>
                    <Link 
                      href={`/contas/${conta.slug}`}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-950 border border-slate-200 hover:border-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all shadow-sm"
                    >
                      Perfil 360
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : visualizacao === 'board' ? (
          <div className="flex gap-6 overflow-x-auto pb-8 items-start min-h-[70vh] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {opcoes.etapas.map((etapa) => {
              const contasNaEtapa = filtradas.filter(c => c.etapa === etapa);
              return (
                <div key={etapa} className="min-w-[340px] w-[340px] flex flex-col gap-4">
                  <div className="flex items-center justify-between px-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{etapa}</h3>
                    </div>
                    <span className="text-[10px] font-black bg-slate-900 border border-slate-800 text-slate-400 px-3 py-0.5 rounded-full">{contasNaEtapa.length}</span>
                  </div>
                  <div className="space-y-4">
                    {contasNaEtapa.map(conta => {
                      const signals = blocoCSignals[conta.id];
                      return (
                        <div 
                          key={conta.id} 
                          className="bg-white border border-slate-200 rounded-[1.5rem] p-5 hover:border-brand/40 group transition-all cursor-default shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 onClick={() => openAccount(conta.id)} className="font-bold text-slate-900 tracking-tighter truncate leading-tight cursor-pointer hover:text-brand transition-colors">
                                {conta.nome}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase truncate mt-0.5">{conta.vertical} · {conta.segmento}</p>
                            </div>
                            <span className={`shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${conta.statusGeral === 'Crítico' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : conta.statusGeral === 'Atenção' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 my-3">
                             <div className="text-center">
                                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Growth</span>
                                <span className="text-[10px] font-bold text-slate-900">{conta.potencial}%</span>
                             </div>
                             <div className="text-center border-x border-slate-50">
                                <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Risco</span>
                                <span className={`text-[10px] font-bold ${riscoClasse(conta.risco)}`}>{conta.risco}</span>
                             </div>
                             <div className="text-center">
                                <span className="text-[10px] font-black text-slate-900 uppercase block mb-1">
                                  {calculateAccountScore(conta).scoreTotal}
                                </span>
                                <span className="text-[7px] font-black text-slate-400 uppercase">Score</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {signals?.interactionsCount > 0 && (
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1">
                                  <Activity className="w-2.5 h-2.5" /> {signals.interactionsCount}
                                </span>
                              )}
                              {signals?.playsCount > 0 && (
                                <span className="text-[9px] font-black text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> {signals.playsCount}
                                </span>
                              )}
                            </div>
                            <Link 
                              href={`/contas/${conta.slug}`} 
                              className="text-[9px] font-black text-slate-500 hover:text-brand uppercase tracking-widest transition-colors flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Perfil <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── PREMIUM LIST VIEW ── */
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-[0.12em]">
                    <th className="py-5 px-4 pl-8 text-[10px]">Conta & Inteligência</th>
                    <th className="py-5 px-4 text-[10px]">Contexto / Owner</th>
                    <th className="py-5 px-4 text-[10px]">Score & Pipeline</th>
                    <th className="py-5 px-4 text-[10px]">Estratégia & Play</th>
                    <th className="py-5 px-4 text-[10px]">Cobertura</th>
                    <th className="py-5 px-4 text-end pr-8 text-[10px]">Ação de Próximo Passo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtradas.map((conta) => {
                    const score = calculateAccountScore(conta);
                    const signals = blocoCSignals[conta.id];
                    return (
                      <tr key={conta.id} className="group hover:bg-white hover:shadow-md transition-all">
                        {/* 1. IDENTITY & CONTEXT */}
                        <td className="py-5 px-4 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-[11px]">
                               {conta.nome.substring(0,2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                               <div className="flex items-center gap-1.5 mb-1">
                                 <button 
                                   onClick={() => openAccount(conta.id)} 
                                   className="text-[13px] font-bold text-slate-950 hover:text-brand tracking-tighter cursor-pointer block text-left truncate"
                                 >
                                   {conta.nome}
                                 </button>
                                 <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conta.statusGeral === 'Saudável' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                               </div>
                               <div className="flex items-center gap-3 mb-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{conta.dominio}</span>
                                  {signals?.interactionsCount > 0 && (
                                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                       <Activity className="w-2.5 h-2.5" /> {signals.interactionsCount}
                                     </span>
                                  )}
                               </div>
                               {/* Context Info moved below Identity to reduce horizontal tension */}
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-500">{conta.vertical}</span>
                                  <span className="text-[10px] font-black text-slate-200 uppercase">/</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">{conta.segmento}</span>
                               </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. OWNER */}
                        <td className="py-5 px-4 text-slate-500 min-w-[140px]">
                           <div className="flex items-center gap-2 leading-none text-slate-400">
                             <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[8px] font-black">
                                {conta.ownerPrincipal.substring(0,2).toUpperCase()}
                             </div>
                             <p className="text-[10px] font-bold uppercase tracking-widest">{conta.ownerPrincipal}</p>
                           </div>
                        </td>

                        {/* 3. SCORE & PIPELINE */}
                        <td className="py-5 px-4">
                           <div className="flex items-center gap-3">
                              <div className="text-center bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl min-w-[45px] shadow-sm">
                                 <p className="text-[12px] font-black text-slate-900">{score.scoreTotal}</p>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Score</p>
                              </div>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-1.5 mb-1">
                                   <p className={`text-[10px] font-black uppercase tracking-tight ${score.scoreTotal >= 75 ? 'text-emerald-600' : score.scoreTotal >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{score.prioridade}</p>
                                   {conta.possuiOportunidade && (
                                     <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[8px] font-black uppercase tracking-tighter">Pipeline</span>
                                   )}
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase leading-none tracking-tight">{conta.etapa}</p>
                              </div>
                           </div>
                        </td>

                        {/* 4. STRATEGY & PLAY */}
                        <td className="py-5 px-4">
                           <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100 w-fit">
                                {(['ABM', 'ABX', 'Híbrida', 'Em andamento'] as const).map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => handleUpdateTipoEstrategico(conta.id, t)}
                                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                                      conta.tipoEstrategico === t ? 'bg-white text-brand shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                              {/* 4B: Compact Play Indicator replaces redundant selection */}
                              <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-slate-400">
                                <Zap className="w-3 h-3 text-brand opacity-60 shrink-0" />
                                <span>Play ativo: {signals?.playsCount > 0 ? 'Sim' : 'Não'} · {signals?.playsCount || 0}</span>
                              </div>
                           </div>
                        </td>

                        {/* 5. COVERAGE */}
                        <td className="py-5 px-4">
                           <div className="space-y-1.5">
                              <div className="flex items-baseline justify-between w-24">
                                 <span className="text-[8px] font-black text-slate-400 uppercase">Coverage</span>
                                 <span className="text-[10px] font-bold text-slate-900">{conta.coberturaRelacional}%</span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                 <div 
                                   className={`h-full rounded-full transition-all duration-1000 ${conta.coberturaRelacional >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                   style={{ width: `${conta.coberturaRelacional}%` }} 
                                 />
                              </div>
                           </div>
                        </td>

                        {/* 6. NEXT STEP ACTIONS */}
                        <td className="py-5 px-4 text-end pr-8">
                           <div className="flex items-center justify-end gap-3">
                              <div className="text-end min-w-0 max-w-[150px]">
                                 <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{conta.proximaMelhorAcao || 'Sem ação'}</p>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Próximo Passo</p>
                              </div>
                              <button 
                                onClick={() => abrirEditorNarrativo(conta)} 
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-brand hover:border-brand/40 transition-all shadow-sm"
                                title="Editar"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${badgeClasse(conta.statusGeral)}`}>
                                  {conta.statusGeral}
                                </span>
                                <Link href={`/contas/${conta.slug}`} className="text-[8px] font-black text-brand uppercase tracking-widest hover:underline whitespace-nowrap">Perfil 360</Link>
                              </div>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal para editar campos narrativos */}
      {editingContaId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Editar narrativas</h3>
              <button
                onClick={fecharEditorNarrativo}
                className="text-slate-500 hover:text-slate-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Resumo Executivo
                </label>
                <textarea
                  value={editResumo}
                  onChange={(e) => setEditResumo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm font-sans resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                  rows={3}
                  placeholder="Síntese factual da situação e contexto da conta..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Próxima Melhor Ação
                </label>
                <textarea
                  value={editAcao}
                  onChange={(e) => setEditAcao(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm font-sans resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
                  rows={3}
                  placeholder="Próximo passo operacional recomendado para avanço..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={fecharEditorNarrativo}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={salvarNarrativas}
                className="px-4 py-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition-all"
              >
                Salvar narrativas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
