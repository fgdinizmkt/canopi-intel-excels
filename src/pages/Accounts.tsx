"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowUpDown, LayoutGrid, List, KanbanSquare, Search } from 'lucide-react';
import { contasMock, type Conta } from '../data/accountsData';

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

  const [loading, setLoading] = useState(true);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>((searchParams.get('view') as Visualizacao) || 'lista');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>((searchParams.get('sort') as Ordenacao) || 'potencial_desc');
  const [filtros, setFiltros] = useState<Filtros>({
    ...filtrosIniciais,
    busca: searchParams.get('busca') || '',
    vertical: searchParams.get('vertical') || 'todos',
    segmento: searchParams.get('segmento') || 'todos',
    owner: searchParams.get('owner') || 'todos',
    etapa: searchParams.get('etapa') || 'todas',
    tipoConta: (searchParams.get('tipo') as Filtros['tipoConta']) || 'todas',
    potencial: searchParams.get('potencial') || 'todos',
    risco: searchParams.get('risco') || 'todos',
    cobertura: searchParams.get('cobertura') || 'todos',
    oportunidade: searchParams.get('oportunidade') || 'todas',
    atividade: searchParams.get('atividade') || 'todas',
    play: searchParams.get('play') || 'todos'
  });

  useEffect(() => {
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
    verticais: Array.from(new Set(contasMock.map((c) => c.vertical))),
    segmentos: Array.from(new Set(contasMock.map((c) => c.segmento))),
    owners: Array.from(new Set(contasMock.map((c) => c.ownerPrincipal))),
    etapas: Array.from(new Set(contasMock.map((c) => c.etapa)))
  }), []);

  const filtradas = useMemo(() => {
    let data = contasMock.filter((c) => {
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
  }, [filtros, ordenacao]);

  const metricas = useMemo(() => ({
    prioritarias: contasMock.filter((c) => c.potencial >= 80 || c.statusGeral !== 'Saudável').length,
    risco: contasMock.filter((c) => c.risco >= 70).length,
    andamento: contasMock.filter((c) => c.tipoEstrategico === 'Em andamento').length,
    abm: contasMock.filter((c) => c.tipoEstrategico === 'ABM').length,
    abx: contasMock.filter((c) => c.tipoEstrategico === 'ABX').length,
    altoPotencial: contasMock.filter((c) => c.potencial >= 80).length,
    baixaCobertura: contasMock.filter((c) => c.coberturaRelacional < 50).length,
    oportunidades: contasMock.filter((c) => c.possuiOportunidade).length
  }), []);

  const atualizarFiltro = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) => setFiltros((prev) => ({ ...prev, [chave]: valor }));

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

  const coberturaBase = Math.round(contasMock.reduce((acc, c) => acc + c.coberturaRelacional, 0) / contasMock.length);

  if (loading) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-8 text-sm text-slate-500">Carregando portfólio de contas...</div>;
  }

  if (contasMock.length === 0) {
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
          {filtradas.map((conta) => (
            <Link key={conta.id} href={`/contas/${conta.slug}?sessao=resumo`} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm">
              <p className="font-bold text-slate-900">{conta.nome}</p>
              <p className="text-xs text-slate-500 mt-1">{conta.vertical} · {conta.segmento}</p>
              <p className="text-xs mt-3 text-slate-600">Próxima ação: {conta.proximaMelhorAcao}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3 text-left">Conta</th><th className="p-3 text-left">Vertical / Segmento</th><th className="p-3 text-left">Owner</th><th className="p-3 text-left">Etapa</th><th className="p-3 text-left">Tipo estratégico</th><th className="p-3 text-left">Potencial</th><th className="p-3 text-left">Risco</th><th className="p-3 text-left">Cobertura relacional</th><th className="p-3 text-left">Última movimentação</th><th className="p-3 text-left">Oportunidade</th><th className="p-3 text-left">Próxima melhor ação</th><th className="p-3 text-left">Status geral</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((conta) => (
                <tr key={conta.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3"><Link href={`/contas/${conta.slug}?sessao=resumo`} className="font-bold text-brand hover:underline">{conta.nome}</Link><p className="text-xs text-slate-500">{conta.dominio}</p></td>
                  <td className="p-3">{conta.vertical} / {conta.segmento}</td>
                  <td className="p-3"><button onClick={() => atualizarFiltro('owner', conta.ownerPrincipal)} className="underline decoration-dotted">{conta.ownerPrincipal}</button></td>
                  <td className="p-3">{conta.etapa}</td>
                  <td className="p-3">
                    {conta.tipoEstrategico === 'ABM' ? <Link href={`/contas/${conta.slug}?sessao=abm`} className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">ABM</Link> : conta.tipoEstrategico === 'ABX' ? <Link href={`/contas/${conta.slug}?sessao=abx`} className="px-2 py-1 rounded bg-purple-100 text-purple-700 font-semibold">ABX</Link> : <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold">{conta.tipoEstrategico}</span>}
                  </td>
                  <td className="p-3">{conta.potencial}</td>
                  <td className={`p-3 font-semibold ${riscoClasse(conta.risco)}`}>{conta.risco}</td>
                  <td className="p-3">{conta.coberturaRelacional}%</td>
                  <td className="p-3">{new Date(conta.ultimaMovimentacao).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{conta.oportunidadePrincipal ? <Link href={`/contas/${conta.slug}?sessao=oportunidades`} className="underline">{conta.oportunidadePrincipal}</Link> : '-'}</td>
                  <td className="p-3">{conta.proximaMelhorAcao}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeClasse(conta.statusGeral)}`}>{conta.statusGeral}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Accounts;
