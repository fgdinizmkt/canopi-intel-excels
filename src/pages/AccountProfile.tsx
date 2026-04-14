"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Target, Zap, Activity, ExternalLink, Mail, 
  MapPin, Users, AlertTriangle, ShieldCheck, Flame, Users2, 
  History as HistoryIcon, Globe, Sparkles, Layout, ChevronRight, 
  CheckCircle2, Brain, Link2, Database, BarChart3, PieChart, TrendingUp
} from 'lucide-react';
import { getAccounts } from '../lib/accountsRepository';
import { getInteractionsByAccount } from '../lib/interactionsRepository';
import { getPlayRecommendationsByAccount } from '../lib/playRecommendationsRepository';
import { getCampaignsMap } from '../lib/campaignsRepository';
import { calculateAccountScore } from '../lib/scoringRepository';
import { contasMock, Conta, ContatoConta } from '../data/accountsData';
import { Interaction, PlayRecommendation, Campaign } from '../../scripts/seed/buildBlockCSeed';
import { useAccountDetail } from '../context/AccountDetailContext';

interface AccountProfileProps {
  slug: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

const ScoreCard = ({ label, val, color }: { label: string; val: number; color: string }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xl font-black ${color}`}>{val}</span>
  </div>
);

export const AccountProfile: React.FC<AccountProfileProps> = ({ slug }) => {
  const router = useRouter();
  const { createAction } = useAccountDetail();
  
  const [account, setAccount] = useState<Conta | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [plays, setPlays] = useState<PlayRecommendation[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'operacional' | 'relacional' | 'inteligencia' | 'estrategia'>('operacional');

  useEffect(() => {
    async function load() {
      try {
        const allAccounts = await getAccounts();
        const found = allAccounts.find(c => c.slug === slug || c.nome.toLowerCase().replace(/\s+/g, '-') === slug) 
                   || contasMock.find(c => c.slug === slug || c.nome.toLowerCase().replace(/\s+/g, '-') === slug);
        
        if (found) {
          setAccount(found);
          const [int, pl, camp] = await Promise.all([
            getInteractionsByAccount(found.id),
            getPlayRecommendationsByAccount(found.id),
            getCampaignsMap()
          ]);
          setInteractions(int);
          setPlays(pl);
          setCampaigns(camp);
        }
      } catch (err) {
        console.error('[AccountProfile] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const score = useMemo(() => account ? calculateAccountScore(account) : null, [account]);

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse bg-slate-900 min-h-screen">Sincronizando perfil 360 da conta...</div>;
  if (!account) return <div className="p-10 text-slate-500 bg-slate-900 min-h-screen">Conta não encontrada.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 overflow-x-hidden">
      {/* ── TOP NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center font-bold text-lg shadow-lg border border-white/10 italic">
                {account.nome.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{account.nome}</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-3 h-3 text-blue-500" /> {account.dominio} · {account.vertical}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
              Sincronizar CRM
            </button>
            <button className="px-4 py-2 bg-brand text-white hover:bg-brand/90 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">
              Gerar Account Review
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-3 gap-8">
        
        {/* ── LEFT COLUMN: IDENTITY & FIRMOGRAPHICS (1/3) ── */}
        <aside className="col-span-1 space-y-6">
          {/* Executive identity */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${account.statusGeral === 'Saudável' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {account.statusGeral}
              </span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verificada por AI
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Resumo Executivo</p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{account.resumoExecutivo || 'Conta em fase de enriquecimento narrativo.'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Porte</p>
                  <p className="text-xs font-bold text-slate-200">{account.porte}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Localização</p>
                  <p className="text-xs font-bold text-slate-200">{account.localizacao}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Budget</p>
                  <p className="text-xs font-bold text-emerald-400">{fmt(account.budgetBrl)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Score de Fit</p>
                  <p className="text-xs font-bold text-blue-400">{account.icp}% ICP Match</p>
                </div>
              </div>
            </div>
          </section>

          {/* Deep Scores */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Matriz de Inteligência
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <ScoreCard label="ICP" val={account.icp} color="text-emerald-400" />
              <ScoreCard label="CRM" val={account.crm} color="text-blue-400" />
              <ScoreCard label="VP" val={account.vp} color="text-amber-400" />
              <ScoreCard label="CT" val={account.ct} color="text-violet-400" />
              <ScoreCard label="FT" val={account.ft} color="text-blue-500" />
              <div className="bg-brand/10 border border-brand/20 p-3 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-brand uppercase tracking-widest mb-1">TOTAL</span>
                <span className="text-xl font-black text-brand">{score?.scoreTotal}</span>
              </div>
            </div>
          </section>

          {/* Technographics */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Tecnografia & Soluções</h3>
            <div className="flex flex-wrap gap-2">
              {account.tecnografia.map(tech => (
                <span key={tech} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Data Confidence */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" /> Confiança dos Dados
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-black text-white">92%</div>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Alimentado por 4 fontes: CRM, ZoomInfo, Clearbit e Canopi AI Sinais v6. Próximo enriquecimento automático em 4h.
            </p>
          </section>
        </aside>

        {/* ── CENTRAL COLUMN: DEEP DIVE & TABS (2/3) ── */}
        <div className="col-span-2 space-y-8">
          
          {/* Header Action / Recommendation */}
          <section className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group border border-slate-100">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Brain className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-brand text-white text-[9px] font-black rounded uppercase tracking-widest shadow-sm">
                   Next Best Action
                </span>
                {score?.prioridade === 'crítica' && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-widest">
                    <AlertTriangle className="w-3 h-3" /> Foco Imediato
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                {account.proximaMelhorAcao || 'Detectando próxima melhor ação operacional...'}
              </h2>
              <p className="text-slate-500 text-sm max-w-2xl mb-6">
                Baseado em {interactions.length} interações recentes e {plays.length} plays recomendados pela inteligência de receita.
              </p>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:scale-[1.02] transition-transform">
                  Ativar Sequência de Abordagem
                </button>
                <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                  Personalizar Inteligência
                </button>
              </div>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            {[
              { id: 'operacional', label: 'Visão Operacional', icon: Activity },
              { id: 'relacional', label: 'Mapa Relacional', icon: Users2 },
              { id: 'inteligencia', label: 'Canopi Intelligence', icon: Sparkles },
              { id: 'estrategia', label: 'Estratégia & Metas', icon: Target },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'operacional' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Timeline Recente (Bloco C) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-blue-400" /> Timeline Progressiva
                    </h3>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{interactions.length} Eventos</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                    {interactions.length > 0 ? interactions.sort((a,b) => b.date.localeCompare(a.date)).map((int, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-slate-800 pb-2 last:pb-0">
                         <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500" />
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(int.date).toLocaleDateString('pt-BR')}</span>
                         <p className="text-xs font-bold text-slate-200 mt-1">{int.interactionType} - {int.description}</p>
                         <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{int.nextStep}</p>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-600 italic">Nenhuma interação registrada no Bloco C.</p>
                    )}
                  </div>
                </div>

                {/* Plays Recomendados */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col overflow-hidden">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Plays Recomendados IA
                  </h3>
                  <div className="space-y-4 overflow-y-auto pr-2">
                    {plays.map((play, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-brand/40 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black text-brand uppercase tracking-widest">{play.playType}</span>
                          <span className="text-[9px] font-bold text-emerald-400">Match {play.accountReadiness}%</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mb-2">{play.playName}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">{play.keySignals}</p>
                        <button className="w-full py-2 bg-slate-800 text-[10px] font-black text-slate-300 uppercase rounded-lg hover:bg-brand hover:text-white transition-all">
                          Ver Detalhes do Play
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de Oportunidades */}
                <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Pipeline & Oportunidades Históricas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {account.oportunidades.map((op, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all" />
                        <p className="text-[10px] font-bold text-slate-500 mb-1">{op.etapa}</p>
                        <p className="text-sm font-bold text-slate-100 mb-2 group-hover:text-brand transition-colors">{op.nome}</p>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-emerald-400 font-black">{fmt(op.valor)}</span>
                          <span className="text-slate-600 font-bold uppercase">{op.etapa}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'relacional' && (
              <div className="space-y-8">
                {/* Heatmap de Cobertura Relacional */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" /> Heatmap de Penetração Relacional
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] text-slate-600 font-bold uppercase underline underline-offset-4 decoration-emerald-500">Decisores Protegidos</span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase underline underline-offset-4 decoration-red-500">Lacunas Críticas</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {['Marketing', 'Vendas', 'Produto', 'TI / Infra'].map(area => {
                      const contatosArea = account.contatos.filter(c => c.area === area);
                      const hasDecisionMaker = contatosArea.some(c => c.influencia > 7);
                      const coverageScore = contatosArea.length * 25 > 100 ? 100 : contatosArea.length * 25;
                      
                      return (
                        <div key={area} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{area}</p>
                          <div className="flex items-end justify-between">
                             <span className={`text-2xl font-black ${coverageScore > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{coverageScore}%</span>
                             <span className="text-[10px] font-bold text-slate-500">{contatosArea.length} contatos</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                             <div className={`h-full ${coverageScore > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${coverageScore}%` }} />
                          </div>
                          {hasDecisionMaker && (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase mt-1">
                               <ShieldCheck className="w-3 h-3" /> Sponsor Mapeado
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comitê Comprador */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Comitê Comprador & Influenciadores</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-600 uppercase border-b border-slate-800">
                          <th className="pb-4">NOME</th>
                          <th className="pb-4">CARGO / ÁREA</th>
                          <th className="pb-4">CLASSIFICAÇÃO</th>
                          <th className="pb-4 text-right">INFLUÊNCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {account.contatos.sort((a,b) => b.influencia - a.influencia).map(c => (
                          <tr key={c.id} className="group hover:bg-slate-800/30 transition-all">
                            <td className="py-4">
                              <p className="text-sm font-bold text-slate-200 group-hover:text-brand transition-colors">{c.nome}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{c.cargo}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-xs font-bold text-slate-300">{c.cargo}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-tight">{c.area}</p>
                            </td>
                            <td className="py-4">
                               <div className="flex gap-1">
                                 {c.classificacao.map(tag => (
                                   <span key={tag} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-md text-[9px] font-bold">
                                      {tag}
                                   </span>
                                 ))}
                               </div>
                            </td>
                            <td className="py-4 text-right">
                               <span className={`text-[11px] font-black ${c.influencia > 7 ? 'text-emerald-400' : 'text-slate-500'}`}>{c.influencia}/10</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inteligencia' && (
              <div className="grid grid-cols-2 gap-6">
                 {/* Sucessos e Insucessos */}
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-400" /> O que funciona (Sucessos)
                    </h3>
                    <div className="space-y-4">
                       {(account.inteligencia.sucessos || ['Frequência de abordagem multicanal', 'Demonstração focada em ROI operacional']).map((s, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">{s}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4 text-red-400" /> O que evitar (Insucessos)
                    </h3>
                    <div className="space-y-4">
                       {(account.inteligencia.insucessos || ['Discussões técnicas sem contexto de negócio', 'Excesso de follow-ups automáticos']).map((s, i) => (
                         <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">{s}</p>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Sinais Recentes Enriquecidos */}
                 <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Sinais Operacionais de Intenção (v6)</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {account.sinais.map((sinal, i) => (
                         <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group">
                            <div className="flex items-center justify-between mb-2">
                               <span className={`text-[10px] font-black uppercase tracking-widest ${sinal.impacto === 'Alto' ? 'text-red-500' : 'text-blue-500'}`}>{sinal.tipo} · {sinal.impacto} Impacto</span>
                               <span className="text-[10px] text-slate-600 font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100 mb-2 truncate" title={sinal.titulo}>{sinal.titulo}</h4>
                            <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{sinal.recomendacao}</p>
                            <div className="flex items-center justify-between">
                               <span className="text-[9px] font-bold text-slate-600 uppercase italic">Canal: {sinal.contexto}</span>
                               <button className="text-[9px] font-black text-brand uppercase tracking-tighter group-hover:underline">Analisar Origem</button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AccountProfile;
