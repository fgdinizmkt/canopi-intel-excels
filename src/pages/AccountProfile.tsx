"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Target, Zap, Activity, ExternalLink, Mail, 
  MapPin, Users, AlertTriangle, ShieldCheck, Flame, Users2, 
  History as HistoryIcon, Globe, Sparkles, Layout, ChevronRight, 
  CheckCircle2, Brain, Link2, Database, BarChart3, PieChart, TrendingUp,
  X, Pencil, Plus, Trash2, Network, List as ListIcon, Share2, Lightbulb,
  CornerDownRight, MoreHorizontal, Edit3
} from 'lucide-react';
import { getAccounts, persistAccount } from '../lib/accountsRepository';
import { getInteractionsByAccount } from '../lib/interactionsRepository';
import { getPlayRecommendationsByAccount } from '../lib/playRecommendationsRepository';
import { getCampaignsMap } from '../lib/campaignsRepository';
import { calculateAccountScore, ScoringResult, deriveProximaMelhorAcao, deriveMotivoDaRecomendacao, deriveAcaoOperacional } from '../lib/scoringRepository';
import { persistOportunidade } from '../lib/oportunidadesRepository';
import { contasMock, Conta, ContatoConta, OportunidadeConta, SinalConta, AcaoConta } from '../data/accountsData';
import { Interaction, PlayRecommendation, Campaign } from '../../scripts/seed/buildBlockCSeed';
import { useAccountDetail } from '../context/AccountDetailContext';

interface AccountProfileProps {
  slug: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

const ScoreMiniBar = ({ label, val }: { label: string; val: number }) => {
  const bgColor = val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-slate-300">{val}</span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${bgColor}`} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
};

// Organogram Node Component (Improved for real hierarchical look)
const OrgNode = ({ contact, level, isRoot, onSelect }: { contact: ContatoConta; level: number; isRoot?: boolean; onSelect: (id: string) => void }) => {
  const color = contact.classificacao.includes('Blocker') ? 'border-red-500 text-red-400 bg-red-500/5' :
                contact.classificacao.includes('Sponsor') ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' :
                contact.classificacao.includes('Decisor') ? 'border-amber-500 text-amber-400 bg-amber-500/5' :
                'border-slate-700 text-slate-300 bg-slate-900';

  return (
    <div className="relative group">
       {!isRoot && (
         <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-800" />
       )}
       <div 
         onClick={() => onSelect(contact.id)}
         className={`p-3 rounded-xl border-l-4 ${color} transition-all hover:translate-x-1 cursor-pointer shadow-lg w-64 shrink-0`}
       >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs">
                {contact.nome.substring(0,2).toUpperCase()}
             </div>
             <div className="min-w-0">
                <p className="text-xs font-black truncate">{contact.nome}</p>
                <p className="text-[10px] text-slate-500 truncate">{contact.cargo}</p>
             </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
             <span className="text-[8px] font-black uppercase text-slate-500">{contact.papelComite}</span>
             <span className="text-[9px] font-bold text-blue-500">{contact.influencia}/10 Inf.</span>
          </div>
       </div>
    </div>
  );
};

export const AccountProfile: React.FC<AccountProfileProps> = ({ slug }) => {
  const router = useRouter();
  const { createAction, sessionActions } = useAccountDetail();
  
  // -- CONSOLIDATED DATA STATE --
  const [account, setAccount] = useState<Conta | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [plays, setPlays] = useState<PlayRecommendation[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'operacional' | 'relacional' | 'inteligencia' | 'estrategia'>('operacional');

  // -- LOCAL OPERATIONAL STATES --
  const [localLeitura, setLocalLeitura] = useState({ factual: [] as string[], inferida: [] as string[], sugerida: [] as string[] });
  const [editingLeitura, setEditingLeitura] = useState<typeof localLeitura | null>(null);
  const [localInteligencia, setLocalInteligencia] = useState({ sucessos: [] as string[], insucessos: [] as string[], padroes: [] as string[], learnings: [] as string[], hipoteses: [] as string[], fatoresRecomendacao: [] as string[] });
  const [editingIntel, setEditingIntel] = useState<typeof localInteligencia | null>(null);
  const [localTecnografia, setLocalTecnografia] = useState<string[]>([]);
  const [editingTecnografia, setEditingTecnografia] = useState<string | null>(null);
  const [orgView, setOrgView] = useState<'tree' | 'list'>('tree');
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

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

          // Initialize local states
          setLocalLeitura({ factual: found.leituraFactual || [], inferida: found.leituraInferida || [], sugerida: found.leituraSugerida || [] });
          setLocalInteligencia(found.inteligencia || { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] });
          setLocalTecnografia(found.tecnografia || []);
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

  // -- RADAR RELACIONAL LOGIC (PORTED FROM AUDIT) --
  const radar = useMemo(() => {
    if (!account) return { tension: [], support: [], gaps: [] };
    const contatos = account.contatos || [];
    const sinais = account.sinais || [];
    
    const tension = contatos.filter(c =>
      (c.classificacao.includes('Blocker') || c.influencia > 7) &&
      sinais.some(s => s.contexto === c.area && s.impacto === 'Alto')
    );
    const support = contatos.filter(c =>
      (c.classificacao.includes('Champion') || c.classificacao.includes('Sponsor')) &&
      sinais.some(s => s.contexto === c.area && (s.tipo === 'Tendência' || s.tipo === 'Mudança'))
    );
    const areasComSinais = Array.from(new Set(sinais.filter(s => s.impacto === 'Alto').map(s => s.contexto)));
    const areasComContatos = Array.from(new Set(contatos.map(c => c.area)));
    const gaps = areasComSinais.filter(a => !areasComContatos.includes(a));

    return { tension, support, gaps };
  }, [account]);

  // -- PERSISTENCE HANDLERS --
  const handleSaveLeitura = () => {
    if (!editingLeitura || !account) return;
    setLocalLeitura(editingLeitura);
    persistAccount({
      id: account.id,
      leituraFactual: editingLeitura.factual,
      leituraInferida: editingLeitura.inferida,
      leituraSugerida: editingLeitura.sugerida
    });
    setEditingLeitura(null);
    setShowFeedback('Leitura IA persistida.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleSaveIntel = () => {
    if (!editingIntel || !account) return;
    setLocalInteligencia(editingIntel);
    persistAccount({ id: account.id, inteligencia: editingIntel });
    setEditingIntel(null);
    setShowFeedback('Cérebro operacional atualizado.');
    setTimeout(() => setShowFeedback(null), 3000);
  };

  const handleUpdateTecnografia = (newTech: string) => {
    if (!account || !newTech.trim()) return;
    const updated = [...localTecnografia, newTech.trim()];
    setLocalTecnografia(updated);
    persistAccount({ id: account.id, tecnografia: updated });
    setEditingTecnografia(null);
  };

  const handleRemoveTecnografia = (tech: string) => {
    if (!account) return;
    const updated = localTecnografia.filter(t => t !== tech);
    setLocalTecnografia(updated);
    persistAccount({ id: account.id, tecnografia: updated });
  };

  // -- ORGANOGRAM RENDERING (MULTIPLE TREES / FOREST) --
  const renderTree = useCallback((contatos: ContatoConta[], parentId?: string, level = 0) => {
    const children = contatos.filter(c => c.liderId === parentId);
    if (children.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-4 relative">
        {children.map(contact => (
          <div key={contact.id} className="flex items-start gap-6">
            <OrgNode contact={contact} level={level} isRoot={level === 0} onSelect={(id) => router.push(`/contas/${slug}/contato/${id}`)} />
            <div className="flex flex-col gap-4 border-l border-slate-800 pl-6">
               {renderTree(contatos, contact.id, level + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  }, [slug, router]);

  const organogramForest = useMemo(() => {
    if (!account) return null;
    const roots = account.contatos.filter(c => !c.liderId || !account.contatos.some(p => p.id === c.liderId));
    
    return (
      <div className="space-y-12 overflow-x-auto pb-8 scrollbar-thin">
         {roots.map(root => (
           <div key={root.id} className="inline-block min-w-max pr-12">
              <div className="mb-4">
                 <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-[10px] font-black uppercase text-slate-500 rounded-lg tracking-widest italic">
                    Árvore Hierárquica: {root.area}
                 </span>
              </div>
              <div className="flex flex-col gap-6">
                 <div className="flex items-start gap-6">
                    <OrgNode contact={root} level={0} isRoot={true} onSelect={(id) => router.push(`/contas/${slug}/contato/${id}`)} />
                    <div className="flex flex-col gap-4 border-l border-slate-800 pl-6">
                       {renderTree(account.contatos, root.id, 1)}
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    );
  }, [account, renderTree]);

  // -- TIMELINE 360 UNIFICADA (RECORTE 2) --
  const unifiedTimeline = useMemo(() => {
    if (!account) return [];
    const { sessionLogs } = useAccountDetail(); // Re-accessing for the memo logic
    const logs = sessionLogs[account.id] || [];
    
    const combined = [
      ...logs.map(text => ({
        tipo: 'Log Manual',
        data: new Date().toISOString().split('T')[0], // Placeholder for current session logs
        descricao: text,
        icone: 'LogsIcon',
        color: 'text-blue-500'
      })),
      ...interactions.map(int => ({
        tipo: `Interação (${int.channel})`,
        data: int.date,
        descricao: `${int.interactionType.toUpperCase()}: ${int.description}`,
        icone: 'Activity',
        color: 'text-emerald-500'
      })),
      ...account.historico.map(h => ({
        tipo: h.tipo,
        data: h.data.includes('/') ? h.data.split('/').reverse().join('-') : h.data, // normalization
        descricao: h.descricao,
        icone: h.icone || 'HistoryIcon',
        color: 'text-amber-500'
      }))
    ].sort((a,b) => b.data.localeCompare(a.data));

    return combined;
  }, [account, interactions]);

  const accountActions = useMemo(() => {
    return sessionActions.filter(a => a.accountName === account?.nome);
  }, [sessionActions, account?.nome]);

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse bg-slate-950 min-h-screen">Sincronizando perfil 360 da conta...</div>;
  if (!account) return <div className="p-10 text-slate-500 bg-slate-950 min-h-screen">Conta não encontrada.</div>;

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
            {showFeedback && (
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mr-4 animate-pulse">✓ {showFeedback}</span>
            )}
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm">
              Sincronizar CRM
            </button>
            <button className="px-4 py-2 bg-brand text-white hover:bg-brand/90 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20">
              Gerar Account Review
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: IDENTITY & FIRMOGRAPHICS (4/12) ── */}
        <aside className="col-span-4 space-y-6">
          {/* Identity & Structure */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vertical Estratégica</span>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter">{account.vertical}</h2>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Potencial Growth</span>
                 <span className="text-2xl font-black text-emerald-400">{account.potencial}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 pt-4 border-t border-slate-800">
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <Target className="w-3 h-3" /> Modelo de Atendimento
                  </p>
                  <p className="text-xs font-bold text-slate-300 uppercase">{account.tipoEstrategico}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <Building2 className="w-3 h-3" /> Porte Corporativo
                  </p>
                  <p className="text-xs font-bold text-slate-300 uppercase">{account.porte}</p>
               </div>
            </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Status Geral</p>
                  <p className={`text-xs font-bold uppercase ${account.statusGeral === 'Saudável' ? 'text-emerald-400' : 'text-amber-400'}`}>{account.statusGeral}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Budget Comercial</p>
                  <p className="text-xs font-bold text-emerald-400">{fmt(account.budgetBrl)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Atividade Recente</p>
                  <p className={`text-xs font-bold ${account.atividadeRecente === 'Alta' ? 'text-emerald-400' : 'text-blue-500'}`}>{account.atividadeRecente}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mapeamento</p>
                  <p className="text-xs font-bold text-blue-400">{account.coberturaRelacional}% do Comitê</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/50">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Account Ownership</span>
                    <Users className="w-3.5 h-3.5" />
                 </p>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                       <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400 border border-blue-500/20">
                          {account.ownerPrincipal.substring(0,2).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-200">{account.ownerPrincipal}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase">Owner Principal</p>
                       </div>
                    </div>
                    {account.ownersSecundarios && account.ownersSecundarios.length > 0 && (
                       <div className="flex flex-wrap gap-2 pt-1">
                          {account.ownersSecundarios.map(o => (
                            <span key={o} className="px-2 py-1 bg-slate-800 text-[8px] font-black text-slate-400 rounded-md border border-slate-700 uppercase tracking-tighter">Co-owner: {o}</span>
                          ))}
                       </div>
                    )}
                 </div>
              </div>

              {/* Macro Priorização Section */}
              <div className="pt-8 border-t border-slate-800/50">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                       <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Prioridade de Negócio
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${account.prioridadeMacro === 'Crítica' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                       {account.prioridadeMacro || 'Normal'}
                    </span>
                 </div>
                 <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">&quot;{account.prioridadeRationale || 'Conta sob monitoramento padrão de ciclo de venda.'}&quot;</p>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-800/50">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Priorização Baseada em Racional</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                 </p>
                 <div className="space-y-4">
                    {score && [
                      score.potencial, score.risco, score.prontidao, score.cobertura, score.confianca
                    ].map(dim => (
                      <div key={dim.name} className="space-y-1.5">
                        <ScoreMiniBar label={dim.name} val={dim.score} />
                        <p className="text-[8px] text-slate-500 italic leading-tight pl-1">{dim.rationale}</p>
                        <div className="flex flex-wrap gap-1 pl-1">
                           {dim.signals.slice(0, 3).map((sig, idx) => (
                             <span key={idx} className="text-[7px] text-blue-400 opacity-60">• {sig}</span>
                           ))}
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </section>

          {/* New: Portfólio & Expansão (E14) */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database className="w-16 h-16 text-emerald-400" />
             </div>
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" /> Portfólio & Contexto Comercial
             </h3>
             <div className="space-y-6">
                {account.portfolio?.ativa.length ? (
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.1em] mb-2 block">Ativo (O que já tem)</span>
                    <div className="flex flex-wrap gap-2">
                       {account.portfolio.ativa.map(p => <span key={p} className="px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded text-[9px] font-bold text-emerald-300">{p}</span>)}
                    </div>
                  </div>
                ) : null}

                {account.portfolio?.negociacao.length ? (
                  <div className="pt-4 border-t border-slate-800">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.1em] mb-2 block">Em Negociação / Pipeline</span>
                    <div className="space-y-2">
                       {account.portfolio.negociacao.map(p => <div key={p} className="flex items-center gap-2 text-[10px] text-slate-300 font-medium"><Plus className="w-3 h-3 text-blue-500" /> {p}</div>)}
                    </div>
                  </div>
                ) : null}

                {account.portfolio?.risco.length ? (
                  <div className="pt-4 border-t border-slate-800">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.1em] mb-2 block">Exposição de Risco (Churn)</span>
                    <div className="space-y-2">
                       {account.portfolio.risco.map(p => <div key={p} className="flex items-center gap-2 text-[10px] text-red-400 font-medium"><AlertTriangle className="w-3 h-3 text-red-500" /> {p}</div>)}
                    </div>
                  </div>
                ) : null}

                {account.portfolio?.whitespace.length ? (
                  <div className="pt-4 border-t border-slate-800">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.1em] mb-2 block">Oportunidade Whitespace</span>
                    <div className="flex flex-wrap gap-2">
                       {account.portfolio.whitespace.map(p => <span key={p} className="px-2 py-1 bg-amber-500/5 border border-amber-500/10 rounded text-[9px] font-bold text-amber-200/70">{p}</span>)}
                    </div>
                  </div>
                ) : null}
             </div>
          </section>

          {/* Technographics (Restored with Edit) */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Database className="w-4 h-4 text-blue-500" /> Stack Tecnológica
              </h3>
              <button onClick={() => setEditingTecnografia(editingTecnografia === null ? '' : null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-all">
                 {editingTecnografia !== null ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            
            {editingTecnografia !== null && (
              <div className="flex gap-2 mb-4">
                 <input 
                   type="text" 
                   value={editingTecnografia}
                   onChange={e => setEditingTecnografia(e.target.value)}
                   className="flex-1 h-8 bg-slate-950 border border-slate-800 rounded-lg px-3 text-[10px] text-slate-200 outline-none focus:border-blue-500/50"
                   placeholder="Nova tecnologia..."
                 />
                 <button onClick={() => handleUpdateTecnografia(editingTecnografia)} className="px-3 h-8 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg">Add</button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {localTecnografia.map(tech => (
                <div key={tech} className="group relative">
                  <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-tight">
                    {tech}
                  </span>
                  <button onClick={() => handleRemoveTecnografia(tech)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
              {localTecnografia.length === 0 && <p className="text-[10px] text-slate-600 italic">Sem stack registrada.</p>}
            </div>
          </section>

          {/* Canais & Campanhas */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Link2 className="w-16 h-16 text-violet-400" />
             </div>
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-violet-400" /> Campanhas & Touchpoints
             </h3>
             <div className="space-y-4">
                {account.canaisCampanhas.influencias.slice(0, 3).map((inf, i) => (
                   <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative group">
                      <div className="flex items-center justify-between mb-1.5">
                         <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[8px] font-black text-slate-400 uppercase border border-slate-800 tracking-tighter">{inf.canal}</span>
                         <span className="text-[8px] text-slate-600 font-bold">{new Date(inf.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">{inf.campanha}</p>
                      <p className="text-[9px] text-slate-500 mt-1 line-clamp-2 italic leading-relaxed">{inf.impacto}</p>
                   </div>
                ))}
             </div>
          </section>

          {/* History / Timeline Structural (Restored) */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-amber-500" /> Memória Corporativa
             </h3>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {account.historico.sort((a,b) => b.data.localeCompare(a.data)).map((h, i) => (
                   <div key={i} className="relative pl-6 border-l border-slate-800 pb-4 last:pb-0">
                      <div className="absolute top-0 -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-amber-500" />
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{h.data}</p>
                      <p className="text-[11px] font-bold text-slate-200">{h.tipo}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{h.descricao}</p>
                   </div>
                ))}
             </div>
          </section>
        </aside>

        {/* ── CENTRAL COLUMN: COMMAND CENTER & DRILL-DOWN (8/12) ── */}
        <div className="col-span-8 space-y-8">
          
          {/* Executive Strategy & Next Action */}
          <section className="bg-gradient-to-br from-brand to-brand-dark text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
               <Brain className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                   Canopi Command Engine
                </span>
                <Sparkles className="w-4 h-4 text-white/50 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black leading-tight mb-4 tracking-tighter">
                {deriveProximaMelhorAcao(account, score!)}
              </h2>
              <p className="text-white/70 text-sm max-w-2xl mb-8 leading-relaxed font-medium">
                {deriveMotivoDaRecomendacao(account, score!)}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    const acao = deriveAcaoOperacional(account, score!);
                    createAction(acao);
                    setShowFeedback('Intervenção operacional injetada.');
                    setTimeout(() => setShowFeedback(null), 3000);
                  }}
                  className="px-8 py-3.5 bg-white text-brand rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-dark/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Gerar Ação Operacional
                </button>
                <div className="flex -space-x-2">
                   {account.contatos.slice(0,3).map(c => (
                     <div key={c.id} title={c.nome} className="w-9 h-9 rounded-full bg-brand-dark border-2 border-brand flex items-center justify-center font-bold text-[10px] text-white/80 shadow-lg">
                        {c.nome.substring(0,1)}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </section>

          {/* Deep Tabs */}
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
            {[
              { id: 'operacional', label: 'Estratégia & Fila', icon: Activity },
              { id: 'relacional', label: 'Comitê & Organograma', icon: Users2 },
              { id: 'inteligencia', label: 'Leitura Canopi AI', icon: Sparkles },
              { id: 'estrategia', label: 'Pipeline & Metas', icon: Target },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-xl ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-8 min-h-[600px]">
            {activeTab === 'operacional' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* ── FILA DE FOGO: A PRIORIZAÇÃO ESTRATÉGICA (RESTAURADO) ── */}
                <section className="relative p-8 bg-gradient-to-br from-red-500/10 to-transparent rounded-[2.5rem] border border-red-500/20 shadow-2xl overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                      <Flame className="w-48 h-48 text-red-500" />
                   </div>
                   
                   <div className="flex justify-between items-center mb-8 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-red-500/10 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                           <Flame className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                           <h2 className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Fila de Fogo: Inteligência de Intervenção</h2>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Cruzamento de Sinais, Memória e Radar Relacional</p>
                        </div>
                     </div>
                     <span className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400">PRÓXIMO MELHOR PLAY</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      {/* 카드 1: INTELIGÊNCIA RELACIONAL + SINAIS */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/40 transition-all group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <AlertTriangle className="w-4 h-4 text-amber-500" />
                               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Alerta Crítico</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase">Prio #1</span>
                         </div>
                         <p className="text-sm font-bold text-slate-100 mb-4 leading-tight">
                            {radar.tension.length > 0 
                              ? `Stakeholder em área crítica (${radar.tension[0].area}) com sinal de alto impacto detectado.` 
                              : 'Alerta detectado em stakeholder estratégico com risco de bloqueio iminente.'}
                         </p>
                         <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sinal Prioritário</span>
                               <p className="text-[11px] text-slate-400">{account.sinais[0]?.titulo || 'Mudança Estrutural Detectada'}</p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Diretriz IA</span>
                               <p className="text-[11px] text-slate-400 italic">"Ativar play de blindagem executiva e alinhar resposta técnica."</p>
                            </div>
                         </div>
                         <button className="w-full mt-6 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest transition-all">
                            Ativar Play de Blindagem
                         </button>
                      </div>

                      {/* 카드 2: GAP DE COBERTURA */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <Users2 className="w-4 h-4 text-blue-500" />
                               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Gap de Cobertura</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase">Prio #2</span>
                         </div>
                         <p className="text-sm font-bold text-slate-100 mb-4 leading-tight">
                            {radar.gaps.length > 0 
                              ? `Sinal estratégico em ${radar.gaps[0]} sem interlocutor mapeado. Risco de silêncio operacional.` 
                              : 'Vazios de interlocução em áreas com sinais recentes de tendência.'}
                         </p>
                         <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Área Expansiva</span>
                               <p className="text-[11px] text-slate-400">{radar.gaps[0] || 'Área sem cobertura'}</p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Caminho do Sucesso</span>
                               <p className="text-[11px] text-slate-400 italic">"Padrão v6: Abertura via Champion de área adjacente."</p>
                            </div>
                         </div>
                         <button className="w-full mt-6 py-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/30 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest transition-all">
                            Infiltrar Champion
                         </button>
                      </div>

                      {/* 카드 3: INTELIGÊNCIA CUMULATIVA */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <Zap className="w-4 h-4 text-emerald-500" />
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Atalhos Operacionais</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase">Prio #3</span>
                         </div>
                         <p className="text-sm font-bold text-slate-100 mb-4 leading-tight">
                            Contexto atual favorável à replicação de padrão vitorioso: "Alinhamento de ROI com CXO".
                         </p>
                         <div className="space-y-3 mt-4 border-t border-slate-800/80 pt-4">
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hipótese IA</span>
                               <p className="text-[11px] text-slate-400">{account.inteligencia.hipoteses[0] || 'Acelerar via Business Case'}</p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Histórico de Validação</span>
                               <p className="text-[11px] text-slate-400 italic">"Padrão recorrente de destrave na vertical {account.vertical}."</p>
                            </div>
                         </div>
                         <button className="w-full mt-6 py-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest transition-all">
                            Simular ROI Canopi
                         </button>
                      </div>
                   </div>
                </section>

                <div className="grid grid-cols-2 gap-8">
                  {/* TIMELINE 360 UNIFICADA (RESTAURADA) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4 text-amber-500" /> Timeline Unificada 360
                      </h3>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-3 py-1 rounded-full">{unifiedTimeline.length} Entradas</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-8 pr-4 scrollbar-thin">
                      {unifiedTimeline.map((item, i) => (
                        <div key={i} className="relative pl-8 border-l-2 border-slate-800 pb-2 group">
                           <div className="absolute top-0 -left-[11px] w-5 h-5 rounded-lg bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-lg z-10">
                              {item.icone === 'LogsIcon' ? <Edit3 className="w-2.5 h-2.5 text-blue-400" /> :
                               item.icone === 'Activity' ? <Activity className="w-2.5 h-2.5 text-emerald-400" /> :
                               <HistoryIcon className="w-2.5 h-2.5 text-amber-400" />}
                           </div>
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.data}</span>
                           <h4 className={`text-[10px] font-black uppercase mt-1 ${item.color}`}>{item.tipo}</h4>
                           <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{item.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AÇÕES OPERACIONAIS ATIVAS (RESTAURADO) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col h-[600px]">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                       <Zap className="w-4 h-4 text-blue-500" /> Intervenções em Andamento
                    </h3>
                    <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                       {accountActions.map((action, i) => (
                         <div key={i} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl border-l-4 border-l-blue-500 shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                               <span className="text-[8px] font-black uppercase text-blue-400 px-2 py-0.5 bg-blue-500/5 rounded border border-blue-500/20">{action.status}</span>
                               <span className="text-[8px] font-black text-slate-600 uppercase">{action.category}</span>
                            </div>
                            <h4 className="text-sm font-black text-slate-100 mb-2 leading-tight">{action.title}</h4>
                            <p className="text-[10px] text-slate-500 mb-4">{action.description}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                               <span className="text-[9px] font-bold text-slate-400">Owner: {action.ownerName || 'IA-System'}</span>
                               <span className={`text-[9px] font-black ${action.priority === 'Alta' ? 'text-red-400' : 'text-slate-500'}`}>{action.priority}</span>
                            </div>
                         </div>
                       ))}
                       {accountActions.length === 0 && (
                         <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <CheckCircle2 className="w-12 h-12 text-slate-700 mb-4" />
                            <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest leading-loose">Nenhuma ação ativa<br/>Gere uma intervenção acima</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'relacional' && (
              <div className="space-y-8 animate-in fade-in">
                
                {/* ── RADAR DE INTELIGÊNCIA RELACIONAL (RESTAURADO) ── */}
                <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 shadow-lg">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Network className="w-5 h-5" /> Radar de Inteligência Relacional (Auditoria V6)
                    <div className="flex-1 h-px bg-blue-500/20" />
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pontos de Tensão */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pontos de Tensão (Blockers)</span>
                      </div>
                      <div className="space-y-3">
                        {radar.tension.map(c => (
                          <div key={c.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4 group hover:bg-red-500/10 transition-all cursor-pointer" onClick={() => router.push(`/contas/${slug}/contato/${c.id}`)}>
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center font-black text-xs text-red-400 border border-red-500/20">
                              {c.nome.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-100 truncate group-hover:text-red-400">{c.nome}</p>
                              <p className="text-[9px] text-red-500/70 uppercase font-black tracking-tighter">{c.area} • Exposição Crítica</p>
                            </div>
                          </div>
                        ))}
                        {radar.tension.length === 0 && <p className="text-[10px] text-slate-600 italic pl-2">Nenhum stakeholder influente sob alerta direto.</p>}
                      </div>
                    </div>

                    {/* Pontos de Apoio */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pontos de Apoio (Sponsors)</span>
                      </div>
                      <div className="space-y-3">
                        {radar.support.map(c => (
                          <div key={c.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4 group hover:bg-emerald-500/10 transition-all cursor-pointer" onClick={() => router.push(`/contas/${slug}/contato/${c.id}`)}>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center font-black text-xs text-emerald-400 border border-emerald-500/20">
                              {c.nome.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-100 truncate group-hover:text-emerald-400">{c.nome}</p>
                              <p className="text-[9px] text-emerald-500/70 uppercase font-black tracking-tighter">{c.area} • Driver de Sucesso</p>
                            </div>
                          </div>
                        ))}
                        {radar.support.length === 0 && <p className="text-[10px] text-slate-600 italic pl-2">Sem sponsors ativos para os sinais atuais.</p>}
                      </div>
                    </div>

                    {/* Gaps de Cobertura */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gaps (Lacunas de Mapeamento)</span>
                      </div>
                      <div className="space-y-3">
                        {radar.gaps.map((area, i) => (
                          <div key={i} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl group hover:border-blue-500/30 transition-all">
                            <p className="text-xs font-black text-slate-200 group-hover:text-blue-400">{area}</p>
                            <p className="text-[9px] text-blue-500/60 uppercase font-black tracking-tighter mt-1">Sinal Crítico Detectado • Sem Contato Mapeado</p>
                            <button className="mt-3 text-[8px] font-black uppercase text-blue-400 hover:underline">Solicitar Mapeamento IA</button>
                          </div>
                        ))}
                        {radar.gaps.length === 0 && <p className="text-[10px] text-slate-600 italic pl-2">Toda área crítica possui interlocução mapeada.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organograma Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setOrgView('tree')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${orgView === 'tree' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                         <Network className="w-4 h-4" /> Organograma Profundo
                      </button>
                      <button 
                        onClick={() => setOrgView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${orgView === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                         <ListIcon className="w-4 h-4" /> Modo Lista
                      </button>
                   </div>
                   <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Mapeado via CRM
                   </div>
                </div>

                {orgView === 'tree' ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 min-h-[500px]">
                     {organogramForest}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-700 uppercase border-b border-slate-800">
                          <th className="pb-6">STAKEHOLDER</th>
                          <th className="pb-6 text-center">ÁREA / HIERARQUIA</th>
                          <th className="pb-6 text-center">PODER & ACESSO</th>
                          <th className="pb-6 text-right">AÇÕES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {account.contatos.sort((a,b) => b.influencia - a.influencia).map(c => (
                          <tr key={c.id} className="group hover:bg-slate-800/30 transition-all cursor-pointer" onClick={() => router.push(`/contas/${slug}/contato/${c.id}`)}>
                             <td className="py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                      {c.nome.substring(0,2).toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-100 group-hover:text-blue-400 transition-colors">{c.nome}</p>
                                      <p className="text-[10px] font-bold text-slate-500">{c.cargo}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-6 text-center">
                                <div className="flex flex-col items-center gap-2">
                                   <span className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-black text-slate-400 uppercase border border-slate-800">{c.area}</span>
                                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${c.status === 'Frio' ? 'bg-slate-800 text-slate-600' : c.status === 'Em Risco' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                      {c.status || 'Ativo'}
                                   </span>
                                </div>
                             </td>
                            <td className="py-6 text-center">
                               <div className="flex items-center justify-center gap-4">
                                  <div className="flex flex-col items-center">
                                     <span className="text-[9px] font-black text-slate-600 uppercase">Inf.</span>
                                     <span className="text-xs font-black text-slate-300">{c.influencia}/10</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                     <span className="text-[9px] font-black text-slate-600 uppercase">Relac.</span>
                                     <span className="text-xs font-black text-emerald-400">{c.forcaRelacional}%</span>
                                  </div>
                               </div>
                            </td>
                            <td className="py-6 text-right">
                               <button className="p-2 hover:bg-slate-950 rounded-lg text-slate-700 hover:text-blue-500 transition-all">
                                  <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inteligencia' && (
              <div className="space-y-8 animate-in fade-in">
                 {/* Leitura Canopi AI Section (Restored Parity) */}
                 <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Sparkles className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-500" /> Dril-down Canopi Intelligence
                       </h3>
                       <button onClick={() => setEditingLeitura(editingLeitura === null ? { ...localLeitura } : null)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 transition-all uppercase hover:text-blue-400">
                          {editingLeitura ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />} {editingLeitura ? 'Cancelar' : 'Sugerir Insights'}
                       </button>
                    </div>

                    {editingLeitura ? (
                       <div className="space-y-6">
                          {['factual', 'inferida', 'sugerida'].map(type => (
                             <div key={type}>
                               <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{type === 'factual' ? 'Dados Verificáveis' : type === 'inferida' ? 'Inferências AI' : 'Ações Recomendadas'}</label>
                               <textarea 
                                 value={editingLeitura[type as keyof typeof localLeitura].join('\n')}
                                 onChange={e => setEditingLeitura({ ...editingLeitura, [type]: e.target.value.split('\n') })}
                                 className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 focus:border-blue-500/40 outline-none font-medium leading-relaxed"
                                 placeholder="Uma entrada por linha..."
                               />
                             </div>
                          ))}
                          <button onClick={handleSaveLeitura} className="w-full py-4 bg-brand text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-brand/20">Persistir Inteligência Estruturada</button>
                       </div>
                    ) : (
                       <div className="grid grid-cols-4 gap-8">
                          <div className="space-y-4">
                             <span className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/20 w-max">Origem da Conta</span>
                             <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                <p className="text-xs font-black text-white italic">&quot;{account.canaisCampanhas.origemPrincipal}&quot;</p>
                             </div>
                             <div className="space-y-3 pt-4">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Factual (v6)</p>
                                {localLeitura.factual.map((f, i) => <p key={i} className="text-xs text-slate-400 font-medium italic leading-relaxed border-l-2 border-slate-800 pl-3 group hover:border-blue-500 transition-all">{f}</p>)}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <span className="flex items-center gap-2 text-[10px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/5 px-3 py-1.5 rounded-lg border border-violet-500/20 w-max">Influência de Canais</span>
                             <div className="space-y-3">
                                {account.canaisCampanhas.influencias.map((inf, i) => (
                                   <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl relative group">
                                      <div className="flex items-center justify-between mb-1.5">
                                         <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[8px] font-black text-slate-400 uppercase border border-slate-800 tracking-tighter">{inf.canal}</span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-200 line-clamp-1">{inf.campanha}</p>
                                      <p className="text-[9px] text-slate-500 mt-1 line-clamp-2 italic leading-relaxed">{inf.impacto}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/20 w-max">Inferências AI</span>
                             <div className="space-y-3">
                                {localLeitura.inferida.map((f, i) => <p key={i} className="text-xs text-slate-400 font-medium italic leading-relaxed border-l-2 border-slate-800 pl-3 group hover:border-amber-500 transition-all">~ {f}</p>)}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-max">Recomendações</span>
                             <div className="space-y-3">
                                {localLeitura.sugerida.map((f, i) => <p key={i} className="text-xs text-slate-200 font-bold leading-relaxed border-l-2 border-emerald-500/40 pl-3 group hover:border-emerald-500 transition-all">→ {f}</p>)}
                             </div>
                          </div>
                       </div>
                    )}
                 </section>

                 {/* Inteligência Cumulativa (Memória Operacional Profunda) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     
                     {/* Coluna 1: Memória de Prospecção (Fatos) */}
                     <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-6">
                        <div>
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Vitórias & Padrões de Sucesso
                           </h3>
                           <ul className="space-y-3">
                              {localInteligencia.sucessos.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-300 font-medium italic group hover:border-emerald-500/30 transition-all">{s}</li>
                              ))}
                           </ul>
                        </div>
                        <div className="pt-6 border-t border-slate-800">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" /> Riscos & Alertas de Segmento
                           </h3>
                           <ul className="space-y-3">
                              {localInteligencia.insucessos.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-slate-400 font-medium italic group hover:border-red-500/30 transition-all">{s}</li>
                              ))}
                           </ul>
                        </div>
                     </div>

                     {/* Coluna 2: Cérebro Estratégico (Padrões e Lições) */}
                     <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/10 rounded-3xl flex flex-col gap-8">
                        <div>
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6 block">Padrões Observados IA</span>
                           <div className="space-y-4">
                              {localInteligencia.padroes.map((p, i) => (
                                <div key={i} className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 italic text-xs text-slate-200 font-medium leading-relaxed relative overflow-hidden group">
                                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-all" />
                                   &quot;{p}&quot;
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="pt-8 border-t border-slate-700/50">
                           <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 block">A Maior Lição (Canopi Core)</span>
                           <div className="flex items-start gap-4 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                              <p className="text-xs text-amber-200/90 font-bold leading-relaxed">
                                 {localInteligencia.learnings[0] || 'Nenhuma lição crítica extraída desta conta até o momento.'}
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Coluna 3: Futuro Operacional (Hipóteses) */}
                     <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hipóteses de Destrave Strat</span>
                        <div className="space-y-4">
                           {localInteligencia.hipoteses.map((h, i) => (
                              <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2 group hover:border-blue-500/20 transition-all">
                                 <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase">Hipótese #{i+1}</p>
                                 </div>
                                 <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">{h}</p>
                              </div>
                           ))}
                        </div>
                        {localInteligencia.fatoresRecomendacao.length > 0 && (
                           <div className="mt-auto pt-6 border-t border-slate-800">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Fatores de Qualificação AI</p>
                              <div className="flex flex-wrap gap-2">
                                 {localInteligencia.fatoresRecomendacao.map((f, i) => (
                                   <span key={i} className="text-[8px] px-2 py-1 bg-slate-800 text-slate-500 rounded-lg border border-slate-700 font-black uppercase tracking-tighter">{f}</span>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'estrategia' && (
              <div className="space-y-8 animate-in fade-in">
                 {/* Pipeline drill-down */}
                 <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-emerald-500" /> Pipeline Drill-down & Forecast
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {account.oportunidades.map((op, i) => (
                         <div key={i} className="group p-6 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col gap-4">
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-brand transition-all" />
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{op.etapa}</span>
                               <span className="text-[10px] font-black text-red-500 uppercase">{op.risco} Risco</span>
                            </div>
                            <h4 className="text-base font-bold text-slate-100 group-hover:text-brand transition-colors italic">{op.nome}</h4>
                            <div className="mt-auto pt-4 border-t border-slate-800 flex items-end justify-between">
                               <div>
                                  <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Valor Contratual</p>
                                  <p className="text-xl font-black text-emerald-400">{fmt(op.valor)}</p>
                               </div>
                               <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-600 transition-all">
                                  <MoreHorizontal className="w-5 h-5" />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Maturidade Relacional</h3>
                       <div className="h-64 flex flex-col items-center justify-center gap-6">
                          <div className="relative w-40 h-40 flex items-center justify-center">
                             <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
                             <div className="absolute inset-0 rounded-full border-8 border-brand border-t-transparent animate-[spin_3s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'}} />
                             <span className="text-4xl font-black text-white">{account.coberturaRelacional}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Engajamento Profundo Detectado</p>
                       </div>
                    </div>
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Sinais Operacionais de Intenção</h3>
                       <div className="space-y-3">
                          {account.sinais.map((s, i) => (
                             <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-300">{s.titulo}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${s.impacto === 'Alto' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>{s.impacto}</span>
                             </div>
                          ))}
                       </div>
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
