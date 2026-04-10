"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowUpDown, LayoutGrid, List, KanbanSquare, Search } from 'lucide-react';
import { contasMock, type Conta, type TipoEstrategico } from '../data/accountsData';
import { getAccounts, persistAccount } from '../lib/accountsRepository';
import { useAccountDetail } from '../context/AccountDetailContext';

type Visualizacao = 'lista' | 'grade' | 'board';
type Ordenacao = 'potencial_desc' | 'risco_desc' | 'movimentacao_desc';

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
};

const filtrosIniciais: Filtros = {
  busca: '', vertical: 'todos', segmento: 'todos', owner: 'todos', etapa: 'todas',
  tipoConta: 'todas', potencial: 'todos', risco: 'todos', cobertura: 'todos', oportunidade: 'todas', atividade: 'todas', play: 'todos'
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
    play: searchParams?.get('play') || 'todos'
  });

  useEffect(() => {
    const carregarContas = async () => {
      try {
        const dados = await getAccounts();
        setContas(dados);
      } catch (err) {
        console.error('[Accounts] Erro ao carregar contas:', err);
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
      return true;
    });

    data = data.sort((a, b) => {
      if (ordenacao === 'potencial_desc') return b.potencial - a.potencial;
      if (ordenacao === 'risco_desc') return b.risco - a.risco;
      return toDate(b.ultimaMovimentacao) - toDate(a.ultimaMovimentacao);
    });

    return data;
  }, [filtros, ordenacao, contas]);

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
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Contas</h1>
          <p className="text-sm text-slate-500 mt-1">Visão centralizada das empresas, com priorização, contexto estratégico e navegação para profundidade operacional.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[280px] flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filtros.busca} onChange={(e) => atualizarFiltro('busca', e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Buscar conta, domínio ou contexto" />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as Ordenacao)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
              <option value="potencial_desc">Ordenar: Potencial (maior)</option>
              <option value="risco_desc">Ordenar: Risco (maior)</option>
              <option value="movimentacao_desc">Ordenar: Última movimentação</option>
            </select>
          </div>
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            <button onClick={() => setVisualizacao('lista')} className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${visualizacao === 'lista' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}><List className="w-4 h-4 inline mr-1" />Lista</button>
            <button onClick={() => setVisualizacao('grade')} className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${visualizacao === 'grade' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4 inline mr-1" />Grade</button>
            <button onClick={() => setVisualizacao('board')} className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${visualizacao === 'board' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}><KanbanSquare className="w-4 h-4 inline mr-1" />Board</button>
          </div>
        </div>
      </header>

      {coberturaBase < 55 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4" /> Aviso: cobertura média da base em {coberturaBase}%. Recomenda-se reforçar mapeamento relacional.
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {macroCards.map((card) => (
          <button key={card.titulo} onClick={card.acao} className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-brand/40 hover:shadow-sm transition-all">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{card.titulo}</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{card.valor}</p>
          </button>
        ))}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <select value={filtros.vertical} onChange={(e) => atualizarFiltro('vertical', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Vertical: todas</option>{opcoes.verticais.map((v) => <option key={v}>{v}</option>)}</select>
        <select value={filtros.segmento} onChange={(e) => atualizarFiltro('segmento', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Segmento: todos</option>{opcoes.segmentos.map((v) => <option key={v}>{v}</option>)}</select>
        <select value={filtros.owner} onChange={(e) => atualizarFiltro('owner', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Owner: todos</option>{opcoes.owners.map((v) => <option key={v}>{v}</option>)}</select>
        <select value={filtros.etapa} onChange={(e) => atualizarFiltro('etapa', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todas">Etapa: todas</option>{opcoes.etapas.map((v) => <option key={v}>{v}</option>)}</select>
        <select value={filtros.tipoConta} onChange={(e) => atualizarFiltro('tipoConta', e.target.value as Filtros['tipoConta'])} className="p-2 border rounded-lg text-sm"><option value="todas">Tipo: todas</option><option value="em_andamento">Em andamento</option><option value="abm">ABM</option><option value="abx">ABX</option><option value="hibridas">Híbridas</option></select>
        <select value={filtros.potencial} onChange={(e) => atualizarFiltro('potencial', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Potencial: todos</option><option value="alto">Alto</option><option value="medio">Médio</option></select>
        <select value={filtros.risco} onChange={(e) => atualizarFiltro('risco', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Risco: todos</option><option value="alto">Alto</option><option value="medio">Médio</option></select>
        <select value={filtros.cobertura} onChange={(e) => atualizarFiltro('cobertura', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Cobertura: todas</option><option value="baixa">Baixa</option><option value="alta">Alta</option></select>
        <select value={filtros.oportunidade} onChange={(e) => atualizarFiltro('oportunidade', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todas">Oportunidade: todas</option><option value="com">Com oportunidade</option><option value="sem">Sem oportunidade</option></select>
        <select value={filtros.atividade} onChange={(e) => atualizarFiltro('atividade', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todas">Atividade recente</option><option value="alta">Alta</option><option value="média">Média</option><option value="baixa">Baixa</option></select>
        <select value={filtros.play} onChange={(e) => atualizarFiltro('play', e.target.value)} className="p-2 border rounded-lg text-sm"><option value="todos">Play ativo</option><option value="abm">ABM</option><option value="abx">ABX</option><option value="híbrido">Híbrido</option></select>
        <button onClick={() => setFiltros(filtrosIniciais)} className="p-2 border rounded-lg text-sm font-semibold text-slate-600">Limpar filtros</button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button onClick={() => atualizarFiltro('risco', 'alto')} className="bg-white border rounded-xl p-3 text-left"><p className="text-xs font-bold text-slate-500 uppercase">Contas que exigem atenção</p><p className="text-sm text-slate-700 mt-1">Risco alto e última movimentação recente.</p></button>
        <button onClick={() => { atualizarFiltro('tipoConta', 'abm'); atualizarFiltro('cobertura', 'baixa'); }} className="bg-white border rounded-xl p-3 text-left"><p className="text-xs font-bold text-slate-500 uppercase">Contas prontas para ABM</p><p className="text-sm text-slate-700 mt-1">Fit alto com cobertura inicial a completar.</p></button>
        <button onClick={() => { atualizarFiltro('tipoConta', 'abx'); atualizarFiltro('oportunidade', 'com'); }} className="bg-white border rounded-xl p-3 text-left"><p className="text-xs font-bold text-slate-500 uppercase">Contas prontas para ABX</p><p className="text-sm text-slate-700 mt-1">Base instalada com oportunidade ativa.</p></button>
        <button onClick={() => atualizarFiltro('cobertura', 'baixa')} className="bg-white border rounded-xl p-3 text-left"><p className="text-xs font-bold text-slate-500 uppercase">Cobertura da base</p><p className="text-sm text-slate-700 mt-1">Média atual: {coberturaBase}%.</p></button>
      </section>

      {filtradas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">Nenhum resultado encontrado</p>
          <p className="text-sm text-slate-500 mt-1">Ajuste os filtros para visualizar contas compatíveis com sua consulta.</p>
        </div>
      ) : visualizacao !== 'lista' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtradas.map((conta) => {
            const acoesAtrasadas = conta.acoes.filter(a => a.status === 'Atrasada').length;
            return (
              <button 
                key={conta.id} 
                onClick={() => openAccount(conta.id)} 
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand/50 hover:shadow-md transition-all text-left block w-full group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-slate-900 leading-tight group-hover:text-brand transition-colors">{conta.nome}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClasse(conta.statusGeral)}`}>{conta.statusGeral}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{conta.vertical} · {conta.segmento}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Pot. {conta.potencial}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    conta.atividadeRecente === 'Alta' ? 'bg-emerald-100 text-emerald-700' :
                    conta.atividadeRecente === 'Média' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{conta.atividadeRecente}</span>
                  {conta.sinais.length > 0 && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{conta.sinais.length} sinal{conta.sinais.length !== 1 ? 'is' : ''}</span>
                  )}
                  {acoesAtrasadas > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">{acoesAtrasadas} atras.</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3 text-left">Conta</th><th className="p-3 text-left">Vertical / Segmento</th><th className="p-3 text-left">Owner</th><th className="p-3 text-left">Etapa</th><th className="p-3 text-left">Tipo estratégico</th><th className="p-3 text-left">Play ativo</th><th className="p-3 text-left">Potencial</th><th className="p-3 text-left">Risco</th><th className="p-3 text-left">Cobertura relacional</th><th className="p-3 text-left">Última movimentação</th><th className="p-3 text-left">Oportunidade</th><th className="p-3 text-left">Próxima melhor ação</th><th className="p-3 text-left">Status geral</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((conta) => (
                <tr key={conta.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${conta.atividadeRecente === 'Alta' ? 'bg-emerald-500' : conta.atividadeRecente === 'Média' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      <div>
                        <button onClick={() => openAccount(conta.id)} className="font-bold text-brand hover:underline text-left">{conta.nome}</button>
                        <p className="text-xs text-slate-500">{conta.dominio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{conta.vertical} / {conta.segmento}</td>
                  <td className="p-3"><button onClick={() => atualizarFiltro('owner', conta.ownerPrincipal)} className="underline decoration-dotted">{conta.ownerPrincipal}</button></td>
                  <td className="p-3">{conta.etapa}</td>
                  <td className="p-3">
                    <div className="inline-flex gap-1 bg-slate-100 rounded-lg p-1">
                      {(['ABM', 'ABX', 'Híbrida', 'Em andamento'] as TipoEstrategico[]).map(tipo => (
                        <button
                          key={tipo}
                          onClick={() => handleUpdateTipoEstrategico(conta.id, tipo)}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            conta.tipoEstrategico === tipo
                              ? tipo === 'ABM' ? 'bg-blue-500 text-white'
                              : tipo === 'ABX' ? 'bg-purple-500 text-white'
                              : tipo === 'Híbrida' ? 'bg-amber-500 text-white'
                              : 'bg-slate-500 text-white'
                              : 'bg-transparent text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="inline-flex gap-1 bg-slate-100 rounded-lg p-1">
                      {(['ABM', 'ABX', 'Híbrido', 'Nenhum'] as const).map(play => (
                        <button
                          key={play}
                          onClick={() => handleUpdatePlayAtivo(conta.id, play)}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            conta.playAtivo === play
                              ? play === 'ABM' ? 'bg-blue-500 text-white'
                              : play === 'ABX' ? 'bg-purple-500 text-white'
                              : play === 'Híbrido' ? 'bg-amber-500 text-white'
                              : 'bg-slate-500 text-white'
                              : 'bg-transparent text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {play === 'Nenhum' ? 'Nenhum' : play}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">{conta.potencial}</td>
                  <td className={`p-3 font-semibold ${riscoClasse(conta.risco)}`}>{conta.risco}</td>
                  <td className="p-3">{conta.coberturaRelacional}%</td>
                  <td className="p-3">{new Date(conta.ultimaMovimentacao).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{conta.oportunidadePrincipal ? <button onClick={() => openAccount(conta.id)} className="underline text-left">{conta.oportunidadePrincipal}</button> : '-'}</td>
                  <td className="p-3 max-w-[240px]">
                    <button
                      onClick={() => abrirEditorNarrativo(conta)}
                      className="text-xs text-slate-600 hover:text-brand hover:underline text-left group flex items-start gap-1.5"
                      title={conta.proximaMelhorAcao}
                    >
                      <span className="block truncate flex-1">{conta.proximaMelhorAcao}</span>
                      <span className="shrink-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
                    </button>
                  </td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeClasse(conta.statusGeral)}`}>{conta.statusGeral}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
