"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Target, Zap, Activity, Mail, 
  ChevronRight, CheckCircle2, Brain, Link2, 
  Database, BarChart3, ShieldCheck, User, 
  MapPin, Briefcase, Network, Sparkles, MessageSquare,
  TrendingUp, ExternalLink, Calendar, Building2
} from 'lucide-react';
import { getAccounts } from '../lib/accountsRepository';
import { getInteractionsByAccount } from '../lib/interactionsRepository';
import { getPlayRecommendationsByAccount } from '../lib/playRecommendationsRepository';
import { contasMock, Conta, ContatoConta } from '../data/accountsData';
import { Interaction, PlayRecommendation } from '../../scripts/seed/buildBlockCSeed';

interface ContactProfileProps {
  slug: string;
  contactId: string;
}

const MetricCard = ({ label, value, color, icon: Icon }: { label: string; value: number | string; color: string; icon: any }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-black ${color}`}>{value}</span>
      {typeof value === 'number' && <span className="text-[9px] text-slate-600 font-bold">/10</span>}
    </div>
  </div>
);

export const ContactProfile: React.FC<ContactProfileProps> = ({ slug, contactId }) => {
  const router = useRouter();
  
  const [account, setAccount] = useState<Conta | null>(null);
  const [contact, setContact] = useState<ContatoConta | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [plays, setPlays] = useState<PlayRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allAccounts = await getAccounts();
        const foundAcc = allAccounts.find(c => c.slug === slug) || contasMock.find(c => c.slug === slug);
        
        if (foundAcc) {
          setAccount(foundAcc);
          const foundContact = foundAcc.contatos.find(c => c.id === contactId);
          if (foundContact) {
            setContact(foundContact);
            const [int, pl] = await Promise.all([
              getInteractionsByAccount(foundAcc.id),
              getPlayRecommendationsByAccount(foundAcc.id)
            ]);
            setInteractions(int);
            setPlays(pl);
          }
        }
      } catch (err) {
        console.error('[ContactProfile] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, contactId]);

  const contactInteractions = useMemo(() => {
    // In a real scenario, interactions would have a contact_id.
    // Since our seed/repository for Block C might not have contact-level granularity yet,
    // we show account interactions related to this contact's area or just general for now.
    return interactions.filter(i => i.description.toLowerCase().includes(contact?.nome.toLowerCase() || ''));
  }, [interactions, contact]);

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse bg-slate-950 min-h-screen">Sincronizando perfil 360 do contato...</div>;
  if (!account || !contact) return <div className="p-10 text-slate-500 bg-slate-950 min-h-screen">Contato ou Conta não encontrados.</div>;

  const leader = account.contatos.find(c => c.id === contact.liderId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 overflow-x-hidden">
      {/* ── TOP NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link href="/contas" className="hover:text-slate-300 transition-colors">Contas</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/contas/${slug}`} className="hover:text-slate-300 transition-colors uppercase">{account.nome}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-200">Perfil do Contato</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HEADER DE IDENTIDADE ── */}
      <header className="bg-slate-900 border-b border-slate-800 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex items-end gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand to-brand/40 flex items-center justify-center text-3xl font-black italic shadow-2xl border border-white/10 shrink-0">
            {contact.nome.substring(0, 2)}
          </div>
          <div className="flex-1 pb-2">
             <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-black tracking-tighter">{contact.nome}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${contact.status === 'Ativa' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {contact.status}
                </span>
             </div>
             <p className="text-lg text-slate-300 font-medium flex items-center gap-2">
                {contact.cargo} <span className="text-slate-500">·</span> {contact.area}
             </p>
             <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                   <Target className="w-3.5 h-3.5 text-brand" /> {contact.papelComite}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                   <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {contact.senioridade}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 italic">
                   <Building2 className="w-3.5 h-3.5 text-slate-600" /> {account.nome}
                </div>
             </div>
          </div>
          <div className="flex flex-col items-end gap-3 pb-2">
             <div className="flex gap-2">
                {contact.classificacao.map(tag => (
                   <span key={tag} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest">{tag}</span>
                ))}
             </div>
             <button className="px-6 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 transition-all">
                Agendar Reunião
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-12 gap-8">
        
        {/* ── COLUNA ESQUERDA: SCORES & MATRIZ (4/12) ── */}
        <aside className="col-span-4 space-y-6">
           {/* Matriz de Engajamento do Contato */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Target className="w-24 h-24 text-brand" />
              </div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand" /> Matriz de Influência Canopi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <MetricCard label="Influência" value={contact.influencia} color="text-brand" icon={Zap} />
                 <MetricCard label="Receptividade" value={contact.receptividade === 'Alta' ? 9 : contact.receptividade === 'Média' ? 6 : 3} color="text-emerald-400" icon={Activity} />
                 <MetricCard label="Acessibilidade" value={contact.acessibilidade === 'Alta' ? 9 : contact.acessibilidade === 'Média' ? 6 : 3} color="text-blue-400" icon={Users} />
                 <MetricCard label="Força Relacional" value={contact.forcaRelacional} color="text-amber-400" icon={ShieldCheck} />
              </div>

              {/* Score de Sucesso */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score de Sucesso</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white">{contact.scoreSucesso}%</span>
                       <span className="text-[10px] text-emerald-500 font-bold uppercase shrink-0">Probabilidade de Conversão</span>
                    </div>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent" style={{ transform: `rotate(${contact.scoreSucesso * 3.6}deg)` }} />
                    <span className="text-[10px] font-black">{contact.scoreSucesso}</span>
                 </div>
              </div>
           </section>

           {/* Hierarquia & Relacionamentos */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" /> Hierarquia & Influência
              </h3>
              <div className="space-y-6">
                 {leader ? (
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Reporta para:</p>
                      <Link href={`/contas/${slug}/contato/${leader.id}`} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-brand/40 transition-all group">
                         <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:text-brand transition-colors italic">
                            {leader.nome.substring(0, 2)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-brand">{leader.nome}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{leader.cargo}</p>
                         </div>
                      </Link>
                   </div>
                 ) : (
                   <p className="text-[10px] text-slate-600 italic">Hierarquia superior não mapeada.</p>
                 )}

                 {/* Peers / Subordinates can go here */}
              </div>
           </section>

           {/* Data Trust */}
           <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" /> Confiança dos Dados
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-black text-white">88%</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[88%]" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Sincronizado via LinkedIn e CRM. Última validação automática em 2h.
              </p>
           </section>
        </aside>

        {/* ── COLUNA CENTRAL: HISTÓRICO & INTELIGÊNCIA (8/12) ── */}
        <div className="col-span-8 space-y-8">
           
           {/* Gancho de Reunião IA */}
           <section className="bg-brand text-white rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-brand/20">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                       Gancho Canopi AI
                    </span>
                    <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-bold leading-tight mb-4 italic italic">
                    "{contact.ganchoReuniao || 'Desenvolva uma abordagem focada em redução de downtime e eficiência operacional.'}"
                 </h2>
                 <p className="text-white/60 text-sm max-w-2xl mb-8 leading-relaxed">
                    Baseado no perfil de {contact.senioridade} e na receptividade {contact.receptividade}, este gancho foca no valor estratégico imediato.
                 </p>
                 <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white text-brand rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                       Copiar para Email
                    </button>
                    <button className="px-6 py-3 bg-brand-dark/30 backdrop-blur-md border border-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark/50 transition-all">
                       Ver Contexto Completo
                    </button>
                 </div>
              </div>
           </section>

           <div className="grid grid-cols-2 gap-8">
              {/* Histórico de Interações do Contato */}
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[450px]">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-blue-400" /> Timeline do Contato
                    </h3>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">{contactInteractions.length} Eventos</span>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                    {contactInteractions.length > 0 ? contactInteractions.map((int, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-slate-800 pb-2 last:pb-0">
                         <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500" />
                         <span className="text-[9px] font-black text-slate-500 uppercase">{new Date(int.date).toLocaleDateString('pt-BR')}</span>
                         <p className="text-xs font-black text-slate-200 mt-1">{int.interactionType}</p>
                         <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{int.description}</p>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                         <Activity className="w-12 h-12 opacity-10" />
                         <p className="text-xs italic text-center">Nenhuma interação direta registrada para {contact.nome} no Bloco C.</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Sinais V6 & Plays Relacionados */}
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[450px]">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Sinais & Contexto IA
                 </h3>
                 <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                    {account.sinais.slice(0, 3).map((sinal, i) => (
                       <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-brand transition-colors" />
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sinal.tipo}</span>
                             <TrendingUp className="w-3 h-3 text-emerald-500" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 mb-2 truncate">{sinal.titulo}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                             {sinal.recomendacao}
                          </p>
                          <div className="flex justify-end">
                             <button className="text-[9px] font-black text-brand uppercase tracking-tighter hover:underline italic">Ver Sinais v6</button>
                          </div>
                       </div>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-slate-800">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Plays sugeridos para este stakeholder:</p>
                       <div className="space-y-2">
                          {plays.slice(0, 2).map((play, i) => (
                             <div key={i} className="p-3 bg-brand/5 border border-brand/10 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-brand/10 transition-all">
                                <span className="text-[10px] font-bold text-slate-300 group-hover:text-brand transition-colors truncate pr-2">{play.playName}</span>
                                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-brand transition-colors shrink-0" />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </section>
           </div>

           {/* Campanhas & Impactos */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-violet-400" /> Campanhas & Touchpoints Digitais
              </h3>
              <div className="grid grid-cols-3 gap-6">
                 {account.canaisCampanhas.influencias.map((inf, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-2">
                       <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[9px] font-black text-slate-400 uppercase border border-slate-800">{inf.canal}</span>
                          <span className="text-[9px] text-slate-600 font-bold">{new Date(inf.data).toLocaleDateString('pt-BR')}</span>
                       </div>
                       <p className="text-xs font-bold text-slate-200 line-clamp-1">{inf.campanha}</p>
                       <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{inf.impacto}</p>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </main>
    </div>
  );
};

export default ContactProfile;
