"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Target, Zap, Activity, Mail, 
  ChevronRight, CheckCircle2, Brain, Link2, 
  Database, BarChart3, ShieldCheck, User, 
  MapPin, Briefcase, Network, Sparkles, MessageSquare,
  TrendingUp, ExternalLink, Calendar, Building2,
  X, AlertCircle, Clock, Trash2, Edit3, Linkedin
} from 'lucide-react';
import { getAccounts } from '../lib/accountsRepository';
import { getInteractionsByAccount } from '../lib/interactionsRepository';
import { getPlayRecommendationsByAccount } from '../lib/playRecommendationsRepository';
import { contasMock, Conta, ContatoConta, SinalConta, ActionItem } from '../data/accountsData';
import { Interaction, PlayRecommendation } from '../../scripts/seed/buildBlockCSeed';
import { useAccountDetail } from '../context/AccountDetailContext';
import { persistContact } from '../lib/contactsRepository';

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
  const { createAction, sessionActions } = useAccountDetail();
  
  const [account, setAccount] = useState<Conta | null>(null);
  const [contact, setContact] = useState<ContatoConta | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [plays, setPlays] = useState<PlayRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Operational States (Restored Parity)
  const [ownerInput, setOwnerInput] = useState<string>('');
  const [ownerStatus, setOwnerStatus] = useState<string | null>(null);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [classificationStatus, setClassificationStatus] = useState<string | null>(null);
  const [editingNarrative, setEditingNarrative] = useState<boolean>(false);
  const [observacoes, setObservacoes] = useState<string>('');
  const [historicoNarrativo, setHistoricoNarrativo] = useState<string>('');
  const [proximaAcao, setProximaAcao] = useState<string>('');
  const [narrativeStatus, setNarrativeStatus] = useState<string | null>(null);
  const [prepStatus, setPrepStatus] = useState<string | null>(null);

  const classificationOptions: ('Decisor' | 'Influenciador' | 'Champion' | 'Sponsor' | 'Blocker' | 'Técnico' | 'Negócio')[] = ['Decisor', 'Influenciador', 'Champion', 'Sponsor', 'Blocker', 'Técnico', 'Negócio'];

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
            setOwnerInput(foundContact.owner || '');
            setSelectedClassifications(foundContact.classificacao || []);
            setObservacoes(foundContact.observacoes || '');
            setHistoricoNarrativo(foundContact.historicoInteracoes || '');
            setProximaAcao(foundContact.proximaAcao || '');

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
    // Heuristic Matching: Based on name in interaction description as contact_id is not yet available in Block C.
    return interactions.filter(i => i.description.toLowerCase().includes(contact?.nome.toLowerCase() || ''));
  }, [interactions, contact]);

  // Combined signals and actions for the operational context
  const associatedInterventions = useMemo(() => {
    if (!account || !contact) return { signals: [], actions: [] };
    
    // Filter signals related to the contact's area or role
    const signals = account.sinais.filter(s => 
      s.titulo.toLowerCase().includes(contact.area.toLowerCase()) || 
      s.titulo.toLowerCase().includes(contact.papelComite.toLowerCase()) ||
      s.recomendacao.toLowerCase().includes(contact.nome.toLowerCase())
    );

    // Filter session actions related to this contact
    const actions = sessionActions.filter(a => 
      a.title.toLowerCase().includes(contact.nome.toLowerCase()) ||
      a.description.toLowerCase().includes(contact.nome.toLowerCase())
    );

    return { signals, actions };
  }, [account, contact, sessionActions]);

  // Persistence Handlers
  const handleUpdateLocalAndRemote = (updatedContact: ContatoConta) => {
    setContact(updatedContact);
    if (account) {
      persistContact({
        ...updatedContact,
        accountId: account.id,
        accountName: account.nome,
      }).catch(err => console.error('Error persisting contact:', err));
    }
  };

  const handleAssignOwner = () => {
    if (!contact) return;
    const updated = { ...contact, owner: ownerInput.trim() };
    handleUpdateLocalAndRemote(updated);
    setOwnerStatus('Owner atualizado');
    setTimeout(() => setOwnerStatus(null), 2000);
  };

  const handleToggleClassification = (cls: any) => {
    if (!contact) return;
    const newClasses = selectedClassifications.includes(cls)
      ? selectedClassifications.filter(c => c !== cls)
      : [...selectedClassifications, cls];
    
    setSelectedClassifications(newClasses);
    const updated = { ...contact, classificacao: newClasses };
    handleUpdateLocalAndRemote(updated);
    setClassificationStatus('Salvo');
    setTimeout(() => setClassificationStatus(null), 1500);
  };

  const handleSaveNarratives = () => {
    if (!contact) return;
    const updated = { 
      ...contact, 
      observacoes: observacoes.trim(), 
      historicoInteracoes: historicoNarrativo.trim(), 
      proximaAcao: proximaAcao.trim() 
    };
    handleUpdateLocalAndRemote(updated);
    setNarrativeStatus('Salvo');
    setEditingNarrative(false);
    setTimeout(() => setNarrativeStatus(null), 1500);
  };

  if (loading) return <div className="p-10 text-slate-500 font-medium animate-pulse bg-slate-950 min-h-screen">Sincronizando perfil operacional do contato...</div>;
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
                <Linkedin className="w-4 h-4 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" />
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
                {contact.owner && (
                  <div className="flex items-center gap-2 text-[11px] font-black text-blue-400 uppercase tracking-tighter">
                     <Users className="w-3 h-3" /> Owner: {contact.owner}
                  </div>
                )}
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
        
        {/* ── COLUNA ESQUERDA: SCORES & OPERAÇÃO (4/12) ── */}
        <aside className="col-span-4 space-y-6">
           {/* Matriz de Engajamento & Atribuição */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand" /> Poder & Acesso Relacional
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <MetricCard label="Influência" value={contact.influencia} color="text-brand" icon={Zap} />
                 <MetricCard label="Receptividade" value={contact.receptividade === 'Alta' ? 9 : contact.receptividade === 'Média' ? 6 : 3} color="text-emerald-400" icon={Activity} />
                 <MetricCard label="Acessibilidade" value={contact.acessibilidade === 'Alta' ? 9 : contact.acessibilidade === 'Média' ? 6 : 3} color="text-blue-400" icon={Users} />
                 <MetricCard label="Força Relacional" value={contact.forcaRelacional} color="text-amber-400" icon={ShieldCheck} />
              </div>

              {/* Atribuição de Owner (RESTAURADO) */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Users className="w-3.5 h-3.5 text-blue-400" /> Atribuição de Owner
                </p>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={ownerInput}
                     onChange={(e) => setOwnerInput(e.target.value)}
                     className="flex-1 h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-brand/40 transition-all font-medium"
                     placeholder="Nome do Owner..."
                   />
                   <button 
                     onClick={handleAssignOwner}
                     disabled={!ownerInput.trim() || !!ownerStatus}
                     className={`px-4 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${ownerStatus ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30'}`}
                   >
                     {ownerStatus ? 'OK' : 'Atribuir'}
                   </button>
                </div>
              </div>
           </section>

           {/* Classificação Operacional (RESTAURADO - TOGGLES) */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Classificação Estratégica
              </h3>
              <div className="flex flex-wrap gap-2">
                 {classificationOptions.map(option => {
                    const isSelected = selectedClassifications.includes(option);
                    return (
                       <button
                         key={option}
                         onClick={() => handleToggleClassification(option)}
                         className={`text-[9px] font-black uppercase px-2 py-1.5 rounded-lg border transition-all ${isSelected ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-950 text-slate-600 border-slate-800 hover:text-slate-400'}`}
                       >
                         {option}
                       </button>
                    );
                 })}
              </div>
              {classificationStatus && <p className="mt-3 text-[10px] text-emerald-500 animate-pulse font-bold">{classificationStatus}</p>}
           </section>

           {/* Hierarquia & Relacionamentos */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Network className="w-4 h-4 text-violet-400" /> Hierarquia & Influência
              </h3>
              <div className="space-y-6">
                 {leader ? (
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Reporta para:</p>
                      <Link href={`/contas/${slug}/contato/${leader.id}`} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-brand/40 transition-all group">
                         <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:text-brand transition-colors italic border border-slate-700">
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
              </div>
           </section>
        </aside>

        {/* ── COLUNA CENTRAL: NARRATIVAS & INTELIGÊNCIA (8/12) ── */}
        <div className="col-span-8 space-y-8">
           
           {/* Canopi AI Strategic Approach (RESTAURADO) */}
           <section className="bg-brand text-white rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-brand/20">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <MessageSquare className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                       Inteligência de Abordagem Canopi AI
                    </span>
                    <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-bold leading-tight mb-4 italic italic">
                    "{contact.ganchoReuniao || 'Focar na eficiência operacional e redução de riscos táticos.'}"
                 </h2>
                 <p className="text-white/60 text-sm max-w-2xl mb-8 leading-relaxed">
                    Stakeholder {contact.papelComite} com Score de Sucesso em {contact.scoreSucesso}%. Recomenda-se tom {contact.senioridade === 'C-Level' ? 'Executivo/ROI' : 'Técnico/Eficiência'}.
                 </p>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        createAction({
                           priority: "Alta",
                           category: "Engajamento",
                           channel: "Omnichannel",
                           status: "Nova",
                           title: `Preparar abordagem AI para ${contact.nome}`,
                           description: `Draft estratégico para perfil ${contact.cargo}. Foco: ${contact.ganchoReuniao}`,
                           accountName: account.nome,
                           sourceType: "playbook"
                        });
                        setPrepStatus('Fila Operacional Atualizada');
                        setTimeout(() => setPrepStatus(null), 3000);
                      }}
                      disabled={!!prepStatus}
                      className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-2 ${prepStatus ? 'bg-emerald-600 text-white' : 'bg-white text-brand'}`}
                    >
                       {prepStatus ? <><CheckCircle2 className="w-4 h-4" /> {prepStatus}</> : <><MessageSquare className="w-4 h-4 text-brand" /> Preparar Interação Canopi AI</>}
                    </button>
                    <button className="px-6 py-3 bg-brand-dark/30 backdrop-blur-md border border-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-dark/50 transition-all">
                       Copiar Gancho para Email
                    </button>
                 </div>
              </div>
           </section>

           {/* Narrativas Operacionais (RESTAURADO - EDITOR) */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Edit3 className="w-4 h-4 text-brand" /> Narrativas Operacionais
                 </h3>
                 <button 
                   onClick={() => setEditingNarrative(!editingNarrative)}
                   className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand transition-all"
                 >
                   {editingNarrative ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                 </button>
              </div>

              {editingNarrative ? (
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Observações Táticas</label>
                        <textarea 
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand/40 resize-none font-medium"
                          placeholder="Notas sobre perfil, comportamento ou resistências..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Histórico de Interação</label>
                        <textarea 
                          value={historicoNarrativo}
                          onChange={(e) => setHistoricoNarrativo(e.target.value)}
                          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-brand/40 resize-none font-medium"
                          placeholder="Eventos marcantes ou alinhamentos passados..."
                        />
                      </div>
                   </div>
                   <div className="flex flex-col h-full">
                      <label className="text-[9px] font-black text-slate-600 uppercase mb-2 block tracking-widest text-emerald-500">Próxima Ação Recomendada</label>
                      <textarea 
                        value={proximaAcao}
                        onChange={(e) => setProximaAcao(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40 resize-none font-medium mb-4"
                        placeholder="Qual o próximo movimento estratégico para este contato?"
                      />
                      <button 
                        onClick={handleSaveNarratives}
                        disabled={!!narrativeStatus}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${narrativeStatus ? 'bg-emerald-600 text-white' : 'bg-brand text-white hover:bg-brand-dark'}`}
                      >
                         {narrativeStatus ? 'Narrativas Atualizadas' : 'Salvar Estratégia'}
                      </button>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                   <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Observações</p>
                      <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4">{observacoes || 'Nenhuma nota tática registrada.'}</p>
                   </div>
                   <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Histórico Narrativo</p>
                      <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4">{historicoNarrativo || 'Sem histórico registrado disponível.'}</p>
                   </div>
                   <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                      <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">Próxima Ação</p>
                      <p className="text-xs text-slate-200 font-bold leading-relaxed">{proximaAcao || 'Aguardando definição estratégica.'}</p>
                   </div>
                </div>
              )}
           </section>

           <div className="grid grid-cols-2 gap-8">
              {/* Timeline Transparente (RESTAURADO) */}
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[450px]">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" /> Timeline de Engajamento
                       </h3>
                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest opacity-60">Filtro Contextual (Match por Nome)</span>
                    </div>
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
                         <p className="text-xs italic text-center">Nenhuma interação direta registrada para {contact.nome}.</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Intervenções Associadas (RESTAURADO) */}
              <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[450px]">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" /> Intervenções Associadas
                 </h3>
                 <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                    {/* Sinais Filtrados */}
                    {associatedInterventions.signals.map((sinal, i) => (
                       <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{sinal.tipo}</span>
                             <Clock className="w-3 h-3 text-slate-700" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 mb-2 truncate">{sinal.titulo}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic">
                             {sinal.recomendacao}
                          </p>
                       </div>
                    ))}
                    
                    {/* Ações da Sessão Relacionadas */}
                    {associatedInterventions.actions.map((acao, i) => (
                       <div key={i} className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex justify-between items-center group">
                          <div>
                             <p className="text-xs font-bold text-slate-200 group-hover:text-brand transition-colors">{acao.title}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black uppercase ${acao.priority === 'Alta' ? 'text-red-500' : 'text-slate-500'}`}>{acao.status} · {acao.priority}</span>
                                <span className="text-[8px] font-bold text-blue-500 tracking-tighter">@{acao.suggestedOwner}</span>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-brand" />
                       </div>
                    ))}

                    {associatedInterventions.signals.length === 0 && associatedInterventions.actions.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-40 italic py-12">
                         <Target className="w-12 h-12 mb-2" />
                         <p className="text-xs">Nenhuma intervenção direta vinculada.</p>
                      </div>
                    )}
                 </div>
              </section>
           </div>

           {/* Campanhas Digitais Relacionadas */}
           <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-brand" /> Touchpoints em Campanhas Digitais
              </h3>
              <div className="grid grid-cols-3 gap-6">
                 {account.canaisCampanhas.influencias.slice(0, 3).map((inf, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-2 group hover:border-brand/30 transition-all">
                       <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 bg-slate-900 rounded-md text-[9px] font-black text-slate-400 uppercase border border-slate-800 tracking-widest group-hover:text-brand transition-colors">{inf.canal}</span>
                          <span className="text-[9px] text-slate-600 font-bold">{new Date(inf.data).toLocaleDateString('pt-BR')}</span>
                       </div>
                       <p className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white">{inf.campanha}</p>
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
