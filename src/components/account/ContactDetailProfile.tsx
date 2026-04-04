'use client';

import React from 'react';
import { 
  X, 
  User, 
  Linkedin, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Activity, 
  Target, 
  MessageSquare, 
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ContatoConta, SinalConta, AcaoConta } from '../../data/accountsData';
import { useAccountDetail } from '../../context/AccountDetailContext';

interface ContactDetailProfileProps {
  contact: ContatoConta;
  onClose: () => void;
  sinais?: SinalConta[];
  acoes?: AcaoConta[];
  accountName?: string;
}

/**
 * ContactDetailProfile - Operational Intelligence Layer
 * Camada de profundidade para diagnóstico e estratégia de abordagem de stakeholders.
 */
export const ContactDetailProfile: React.FC<ContactDetailProfileProps> = ({ 
  contact, 
  onClose,
  sinais = [],
  acoes = [],
  accountName = "Conta não identificada"
}) => {
  const { createAction } = useAccountDetail();
  const [prepStatus, setPrepStatus] = React.useState<string | null>(null);
  // Cores semânticas Baseadas na Classificação
  const getClassColor = (classes: string[]) => {
    if (classes.includes('Blocker')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (classes.includes('Sponsor')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (classes.includes('Decisor')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  };

  const styleClass = getClassColor(contact.classificacao);

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700/50 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* --- HEADER PERFIL --- */}
      <div className="p-6 border-b border-slate-800 bg-slate-800/20">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-black text-slate-100 shadow-inner">
            {contact.nome.substring(0, 2).toUpperCase()}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight">{contact.nome}</h2>
            <Linkedin className="w-4 h-4 text-blue-400 cursor-pointer hover:text-blue-300 transition-colors" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-4">{contact.cargo} • <span className="text-slate-500">{contact.area}</span></p>
          
          <div className="flex flex-wrap gap-2">
            {contact.classificacao.map(cls => (
              <span key={cls} className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${styleClass}`}>
                {cls}
              </span>
            ))}
            <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {contact.senioridade}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* --- MÉTRICAS DE PODER & ACESSO --- */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Poder & Acesso Relacional
          </h3>
          <div className="space-y-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
            {/* Score de Sucesso (Canônico) */}
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                <span className="text-blue-400">Score de Sucesso (AI)</span>
                <span className="text-blue-400">{contact.scoreSucesso}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${contact.scoreSucesso}%` }} />
              </div>
            </div>
            {/* Influência */}
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                <span className="text-slate-400">Influência no Comitê</span>
                <span className="text-slate-300 font-black">{contact.influencia}/10</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500" style={{ width: `${contact.influencia * 10}%` }} />
              </div>
            </div>
            {/* Força Relacional */}
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1.5">
                <span className="text-slate-400">Força Relacional</span>
                <span className="text-emerald-500">{contact.forcaRelacional}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${contact.forcaRelacional}%` }} />
              </div>
            </div>
            {/* Receptividade / Acessibilidade */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
               <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Receptividade</span>
                  <span className={`text-xs font-bold ${contact.receptividade === 'Alta' ? 'text-emerald-500' : 'text-amber-500'}`}>{contact.receptividade}</span>
               </div>
               <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase block mb-1">Acessibilidade</span>
                  <span className={`text-xs font-bold ${contact.acessibilidade === 'Alta' ? 'text-emerald-500' : 'text-blue-500'}`}>{contact.acessibilidade}</span>
               </div>
            </div>
          </div>
        </section>

        {/* --- CONTEXTO OPERACIONAL (SINAIS/AÇÕES) --- */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Intervenções Associadas
          </h3>
          <div className="space-y-3">
            {sinais.length > 0 || acoes.length > 0 ? (
              <>
                {sinais.map(s => (
                  <div key={s.id} className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="text-[9px] font-black text-blue-400 uppercase mb-1">{s.tipo}</div>
                    <div className="text-xs font-bold text-slate-100">{s.titulo}</div>
                  </div>
                ))}
                {acoes.map(a => (
                  <div key={a.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{a.titulo}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Prazo: {a.prazo}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </div>
                ))}
              </>
            ) : (
              <div className="p-8 bg-slate-800/10 border border-dashed border-slate-800 rounded-2xl text-center">
                <p className="text-xs text-slate-600 italic">Nenhum sinal crítico direto vinculado.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- MANUAL DE ABORDAGEM CANOPI AI --- */}
        <section className="bg-gradient-to-br from-blue-900/20 to-slate-900 p-5 rounded-2xl border border-blue-500/20 relative overflow-hidden shadow-xl">
          <div className="absolute -right-4 -top-4 opacity-10">
            <BrainCircuit className="w-24 h-24 text-blue-400" />
          </div>
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Inteligência de Abordagem Canopi
          </h3>
          
          <div className="space-y-4">
            {contact.ganchoReuniao && (
              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
                <span className="text-[9px] font-black text-blue-500 uppercase block mb-1.5 tracking-widest">Gancho para Reunião</span>
                <p className="text-xs text-slate-100 font-medium italic">&quot;{contact.ganchoReuniao}&quot;</p>
              </div>
            )}

            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Estratégia de Conversão</span>
              <p className="text-xs text-slate-100 leading-relaxed font-bold">
                {contact.scoreSucesso > 70 
                  ? `Engajamento crítico detectado. Recomenda-se abordagem direta via ${contact.papelComite} focando em prova de valor.` 
                  : `Stakeholder com score moderado (${contact.scoreSucesso}%). Priorizar nutrição técnica antes do convite executivo.`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="text-[8px] font-black text-slate-500 uppercase block">Tom de abordagem</span>
                <span className="text-[10px] font-bold text-slate-200">{contact.senioridade === 'C-Level' ? 'Executivo / ROI' : 'Técnico / Eficiência'}</span>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <span className="text-[8px] font-black text-slate-500 uppercase block">Recomendação AI</span>
                <span className="text-[10px] font-bold text-emerald-400">Abordar em 24h</span>
              </div>
            </div>

            <button 
              disabled={!!prepStatus}
              onClick={() => {
                createAction({
                  priority: "Alta",
                  category: "Prospecção",
                  channel: "LinkedIn/Email",
                  status: "Nova",
                  title: `Interação estratégica AI: ${contact.nome}`,
                  description: `Preparar abordagem personalizada com foco em ${contact.area}. Gancho sugerido: "${contact.ganchoReuniao || 'Conexão via rede.'}"`,
                  accountName: accountName,
                  accountContext: `${contact.cargo}`,
                  sourceType: "playbook",
                  suggestedOwner: "Você",
                  nextStep: "Validar minuta e realizar disparo personalizado"
                });
                setPrepStatus('Interação enviada para fila');
                setTimeout(() => setPrepStatus(null), 3000);
              }}
              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${prepStatus ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'}`}
            >
              {prepStatus ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {prepStatus}
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" /> Preparar Interação Canopi AI
                </>
              )}
            </button>
          </div>
        </section>

      </div>

    </div>
  );
};

export default ContactDetailProfile;
