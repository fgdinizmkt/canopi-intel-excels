"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '../../../components/layout/Sidebar';
import { Topbar } from '../../../components/layout/Topbar';
import { contaPorSlug } from '../../../data/accountsData';

const sessoes = ['resumo', 'sinais', 'acoes', 'contatos', 'organograma', 'oportunidades', 'canais-campanhas', 'abm', 'abx', 'inteligencia', 'historico'] as const;
type Sessao = typeof sessoes[number];

export default function ContaDetalhePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('contas');

  useEffect(() => {
    const authStatus = localStorage.getItem('canopi_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
    else router.push('/login');
  }, [router]);

  const conta = useMemo(() => contaPorSlug(params.slug), [params.slug]);
  const sessao = (searchParams.get('sessao') as Sessao) || 'resumo';
  const sessaoValida: Sessao = sessoes.includes(sessao) ? sessao : 'resumo';

  const goSessao = (s: Sessao) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sessao', s);
    router.replace(url.pathname + url.search);
  };

  if (!isAuthenticated) return null;

  if (!conta) {
    return <div className="p-10">Conta não encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="ml-60 min-h-screen flex flex-col">
        <Topbar title="Contas" breadcrumbs={['CANOPI', 'INTELIGÊNCIA']} activePage="contas" setActivePage={(page) => { setActivePage(page); router.push('/' + page); }} />
        <main className="p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Conta</p>
                <h1 className="text-3xl font-extrabold text-slate-900">{conta.nome}</h1>
                <p className="text-sm text-slate-500 mt-1">{conta.dominio} · {conta.vertical} · {conta.segmento} · {conta.porte} · {conta.localizacao}</p>
              </div>
              <Link href="/contas" className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold">Voltar para base</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Owner principal</p><p className="font-bold">{conta.ownerPrincipal}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Owners secundários</p><p className="font-bold">{conta.ownersSecundarios.join(', ')}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Etapa atual</p><p className="font-bold">{conta.etapa}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Status geral</p><p className="font-bold">{conta.statusGeral}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Tipo estratégico</p><p className="font-bold">{conta.tipoEstrategico}</p></div>
              <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-500">Oportunidade principal</p><p className="font-bold">{conta.oportunidadePrincipal || 'Sem oportunidade ativa'}</p></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border rounded-xl"><p className="text-xs text-slate-500">Score de potencial</p><p className="text-xl font-extrabold">{conta.potencial}</p></div>
              <div className="p-3 border rounded-xl"><p className="text-xs text-slate-500">Score de risco</p><p className="text-xl font-extrabold">{conta.risco}</p></div>
              <div className="p-3 border rounded-xl"><p className="text-xs text-slate-500">Score de prontidão</p><p className="text-xl font-extrabold">{conta.prontidao}</p></div>
              <div className="p-3 border rounded-xl"><p className="text-xs text-slate-500">Cobertura relacional</p><p className="text-xl font-extrabold">{conta.coberturaRelacional}%</p></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {sessoes.map((s) => (
                <button key={s} onClick={() => goSessao(s)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${sessaoValida === s ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {s === 'canais-campanhas' ? 'Canais & Campanhas' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {sessaoValida === 'resumo' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Resumo</h2>
                <p className="text-slate-700">{conta.resumoExecutivo}</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div><p className="font-bold mb-2">Leitura factual</p><ul className="list-disc pl-5 space-y-1">{conta.leituraFactual.map((v) => <li key={v}>{v}</li>)}</ul></div>
                  <div><p className="font-bold mb-2">Leitura inferida</p><ul className="list-disc pl-5 space-y-1">{conta.leituraInferida.map((v) => <li key={v}>{v}</li>)}</ul></div>
                  <div><p className="font-bold mb-2">Leitura sugerida</p><ul className="list-disc pl-5 space-y-1">{conta.leituraSugerida.map((v) => <li key={v}>{v}</li>)}</ul></div>
                </div>
              </div>
            )}

            {sessaoValida === 'sinais' && (
              <div><h2 className="text-xl font-bold mb-4">Sinais</h2><div className="space-y-3">{conta.sinais.map((s) => <div key={s.id} className="border rounded-xl p-4"><p className="font-bold">{s.titulo}</p><p className="text-sm text-slate-500">{s.tipo} · impacto {s.impacto} · owner {s.owner}</p><p className="text-sm mt-2"><b>Contexto:</b> {s.contexto}</p><p className="text-sm"><b>Recomendação:</b> {s.recomendacao}</p></div>)}</div></div>
            )}

            {sessaoValida === 'acoes' && (
              <div><h2 className="text-xl font-bold mb-4">Ações</h2><div className="space-y-3">{conta.acoes.map((a) => <div key={a.id} className="border rounded-xl p-4"><p className="font-bold">{a.titulo}</p><p className="text-sm text-slate-600">Status: {a.status} · Owner: {a.owner} · Prioridade: {a.prioridade} · Prazo: {new Date(a.prazo).toLocaleDateString('pt-BR')}</p><div className="mt-2 flex gap-2"><button className="px-2 py-1 bg-slate-100 rounded text-xs">Marcar em andamento</button><button className="px-2 py-1 bg-slate-100 rounded text-xs">Replanejar prazo</button></div></div>)}</div></div>
            )}

            {sessaoValida === 'contatos' && (
              <div><h2 className="text-xl font-bold mb-4">Contatos</h2><div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-left">Nome</th><th className="p-2 text-left">Cargo</th><th className="p-2 text-left">Área</th><th className="p-2 text-left">Senioridade</th><th className="p-2 text-left">Papel no comitê</th><th className="p-2 text-left">Força relacional</th><th className="p-2 text-left">Receptividade</th><th className="p-2 text-left">Acessibilidade</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Classificação</th></tr></thead><tbody>{conta.contatos.map((c) => <tr key={c.id} className="border-t"><td className="p-2 font-semibold text-brand">{c.nome}</td><td className="p-2">{c.cargo}</td><td className="p-2">{c.area}</td><td className="p-2">{c.senioridade}</td><td className="p-2">{c.papelComite}</td><td className="p-2">{c.forcaRelacional}</td><td className="p-2">{c.receptividade}</td><td className="p-2">{c.acessibilidade}</td><td className="p-2">{c.status}</td><td className="p-2">{c.classificacao.join(', ')}</td></tr>)}</tbody></table></div><p className="text-xs text-slate-500 mt-3">Preparado para futura navegação de perfil individual do contato.</p></div>
            )}

            {sessaoValida === 'organograma' && (
              <div className="space-y-4"><h2 className="text-xl font-bold">Organograma</h2><p className="text-sm text-slate-500">Hierarquia, influência e lacunas do comitê.</p><div className="flex gap-2"><select className="border rounded-lg p-2 text-sm"><option>Todas as áreas</option>{Array.from(new Set(conta.contatos.map((c) => c.area))).map((a) => <option key={a}>{a}</option>)}</select><select className="border rounded-lg p-2 text-sm"><option>Todas senioridades</option>{Array.from(new Set(conta.contatos.map((c) => c.senioridade))).map((a) => <option key={a}>{a}</option>)}</select><select className="border rounded-lg p-2 text-sm"><option>Todos os papéis</option>{Array.from(new Set(conta.contatos.map((c) => c.papelComite))).map((a) => <option key={a}>{a}</option>)}</select></div><div className="space-y-3">{conta.contatos.map((c) => <div key={c.id} className={`border rounded-xl p-4 ${!c.liderId ? 'bg-slate-50' : 'ml-8'}`}><p className="font-bold">{c.nome} — {c.cargo}</p><p className="text-sm text-slate-600">Área: {c.area} · Senioridade: {c.senioridade} · Influência: {c.influencia}</p><p className="text-sm text-slate-600">Força relacional: {c.forcaRelacional} · Receptividade: {c.receptividade} · Acessibilidade: {c.acessibilidade} · Potencial de sucesso: {c.potencialSucesso}</p></div>)}</div><div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">Lacuna do comitê: ausência de sponsor secundário em finanças.</div></div>
            )}

            {sessaoValida === 'oportunidades' && (
              <div><h2 className="text-xl font-bold mb-4">Oportunidades</h2><div className="space-y-3">{conta.oportunidades.map((o) => <div key={o.id} className="border rounded-xl p-4"><p className="font-bold">{o.nome}</p><p className="text-sm text-slate-600">Etapa: {o.etapa} · Valor: {o.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} · Owner: {o.owner} · Risco: {o.risco} · Probabilidade: {o.probabilidade}%</p><p className="text-sm mt-2 font-semibold">Histórico de avanço</p><ul className="list-disc pl-5 text-sm">{o.historico.map((h) => <li key={h}>{h}</li>)}</ul></div>)}</div></div>
            )}

            {sessaoValida === 'canais-campanhas' && (
              <div><h2 className="text-xl font-bold mb-4">Canais & Campanhas</h2><p className="text-sm text-slate-700">Origem principal: <b>{conta.canaisCampanhas.origemPrincipal}</b></p><div className="mt-3 space-y-3">{conta.canaisCampanhas.influencias.map((i, idx) => <div key={idx} className="border rounded-xl p-4"><p className="font-bold">{i.canal} · {i.campanha}</p><p className="text-sm">Tipo: {i.tipo} · Impacto: {i.impacto} · Data: {new Date(i.data).toLocaleDateString('pt-BR')}</p></div>)}</div></div>
            )}

            {sessaoValida === 'abm' && (
              <div className="space-y-3"><h2 className="text-xl font-bold">ABM</h2><p><b>Por que está em ABM:</b> {conta.abm.motivo}</p><p><b>Fit:</b> {conta.abm.fit}</p><p><b>Cluster:</b> {conta.abm.cluster}</p><p><b>Similaridade:</b> {conta.abm.similaridade}</p><p><b>Cobertura inicial do comitê:</b> {conta.abm.coberturaInicialComite}</p><p><b>Campanhas/plays de entrada:</b> {conta.abm.playsEntrada.join(', ')}</p><p><b>Potencial de abertura:</b> {conta.abm.potencialAbertura}</p><p><b>Hipóteses:</b> {conta.abm.hipoteses.join(' | ')}</p><p><b>Contas similares:</b> {conta.abm.contasSimilares.join(', ')}</p><button className="px-3 py-2 rounded-xl bg-brand text-white text-sm font-semibold">Ativar play ABM</button></div>
            )}

            {sessaoValida === 'abx' && (
              <div className="space-y-3"><h2 className="text-xl font-bold">ABX</h2><p><b>Por que está em ABX:</b> {conta.abx.motivo}</p><p><b>Evolução da jornada:</b> {conta.abx.evolucaoJornada}</p><p><b>Maturidade relacional:</b> {conta.abx.maturidadeRelacional}</p><p><b>Sponsor ativo ou ausente:</b> {conta.abx.sponsorAtivo}</p><p><b>Profundidade do comitê:</b> {conta.abx.profundidadeComite}</p><p><b>Continuidade:</b> {conta.abx.continuidade}</p><p><b>Expansão:</b> {conta.abx.expansao}</p><p><b>Retenção:</b> {conta.abx.retencao}</p><p><b>Risco de estagnação:</b> {conta.abx.riscoEstagnacao}</p><button className="px-3 py-2 rounded-xl bg-brand text-white text-sm font-semibold">Ativar play ABX</button></div>
            )}

            {sessaoValida === 'inteligencia' && (
              <div className="space-y-4"><h2 className="text-xl font-bold">Inteligência</h2><div className="grid md:grid-cols-2 gap-4 text-sm"><div><p className="font-bold">Sucessos</p><ul className="list-disc pl-5">{conta.inteligencia.sucessos.map((i) => <li key={i}>{i}</li>)}</ul></div><div><p className="font-bold">Insucessos</p><ul className="list-disc pl-5">{conta.inteligencia.insucessos.map((i) => <li key={i}>{i}</li>)}</ul></div><div><p className="font-bold">Padrões históricos</p><ul className="list-disc pl-5">{conta.inteligencia.padroes.map((i) => <li key={i}>{i}</li>)}</ul></div><div><p className="font-bold">Learnings e hipóteses</p><ul className="list-disc pl-5">{[...conta.inteligencia.learnings, ...conta.inteligencia.hipoteses].map((i) => <li key={i}>{i}</li>)}</ul></div></div><p className="text-sm"><b>Fatores que sustentam recomendações:</b> {conta.inteligencia.fatoresRecomendacao.join(', ')}</p></div>
            )}

            {sessaoValida === 'historico' && (
              <div><h2 className="text-xl font-bold mb-4">Histórico</h2><div className="space-y-3">{conta.historico.map((h, idx) => <div key={idx} className="border-l-2 border-brand pl-4 py-2"><p className="text-xs text-slate-500">{new Date(h.data).toLocaleDateString('pt-BR')} · {h.tipo}</p><p className="text-sm font-medium">{h.descricao}</p></div>)}</div></div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
