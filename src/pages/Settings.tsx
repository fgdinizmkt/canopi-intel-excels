import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { 
  Search, Bell, HelpCircle, Zap, BarChart3, Target, Check, AlertCircle, 
  Info, Shield, ChevronDown, GripVertical, User, Briefcase, Megaphone, 
  Clock, BrainCircuit, Activity, Database, Globe, RefreshCw, Layers, ShieldCheck,
  Server
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [toggles, setToggles] = useState({ nexus_ai: true, auto_sync: true, risk_alert: true });
  const [enginePower, setEnginePower] = useState(85);

  // Mapeamentos estáticos para blindagem de cores Tailwind (Evita interpolação frágil)
  const bgMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    'emerald-pale': 'bg-emerald-50',
    'blue-pale': 'bg-blue-50',
    'amber-pale': 'bg-amber-50',
    'red-pale': 'bg-red-50'
  };

  const textMap: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    red: 'text-red-600'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* 1. WORKSPACE HEALTH - HERO PROTAGONISTA */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase">
                Control Tower v1.0
              </Badge>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-tighter">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                System Healthy
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Workspace Governance
              </h1>
              <p className="text-slate-400 mt-3 text-sm font-medium max-w-xl leading-relaxed">
                Painel central de monitoramento, confiabilidade de dados e orquestração da engine Nexus Core.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Último Sync Global</p>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span className="text-xl font-black tabular-nums">Há 12m</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Confiabilidade de Dados</p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xl font-black tabular-nums">98.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-white/10">
          {[
            { label: 'Integridade de Contas', val: '100%', sub: 'Zero duplicatas' },
            { label: 'Latência Nexus Core', val: '1.2s', sub: 'Média de resposta' },
            { label: 'Health Score Workspace', val: 'A+', sub: 'Excelente' },
            { label: 'Uso de Tokens (mês)', val: '43%', sub: 'LTM 1.2M' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg font-black">{stat.val}</h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. NEXUS CORE - A ENGINE DE INTELIGÊNCIA */}
        <Card className="lg:col-span-2 p-10 border-slate-200 shadow-sm rounded-[48px] bg-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-50 rounded-3xl border border-indigo-100 shadow-inner">
                <BrainCircuit className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nexus Core Engine</h3>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Configuração de Inteligência & Processamento</p>
              </div>
            </div>
            <button 
              type="button"
              className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${toggles.nexus_ai ? 'bg-indigo-600' : 'bg-slate-200'}`} 
              onClick={() => setToggles({...toggles, nexus_ai: !toggles.nexus_ai})}
              aria-label="Alternar Nexus Core Engine"
              aria-pressed={toggles.nexus_ai}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${toggles.nexus_ai ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agressividade da Predição</p>
                  <span className="text-sm font-black text-indigo-600">{enginePower}%</span>
                </div>
                <input 
                  type="range" 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                  value={enginePower} 
                  onChange={(e) => setEnginePower(parseInt(e.target.value))}
                />
                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
                  Define o nível de &quot;ousadia&quot; da IA ao sugerir ações de expansão baseadas em sinais fracos.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Priorizar Sinais de Terceiros', sub: '6sense, G2, Apollo', val: true },
                  { label: 'Veto Humano Obrigatório', sub: 'Ações de P0 exigem aprovação', val: true },
                  { label: 'Auto-saneamento de Contatos', sub: 'Enriquecimento via Canopi Intel', val: false },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-all">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-medium text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                    <Check className={`w-5 h-5 ${item.val ? 'text-indigo-600' : 'text-slate-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-indigo-300" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Status da Instância</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Enterprise LLM Node</p>
                    <p className="text-2xl font-black tracking-tight">Gemini 1.5 Pro</p>
                    <Badge className="bg-indigo-400/20 text-indigo-200 border-none text-[8px] font-black mt-2">DEDICATED INSTANCE</Badge>
                  </div>
                  <div className="pt-6 border-t border-white/10 space-y-4">
                     <div>
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Context Window Use</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-400" style={{ width: '38%' }}></div>
                        </div>
                     </div>
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold text-indigo-200 uppercase">Tokens in / Out</p>
                        <p className="text-[10px] font-black">1.2M / 450k</p>
                     </div>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl h-14 shadow-xl hover:bg-slate-800 transition-all">
                Reiniciar Engine Nexus
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. DATA GOVERNANCE - INTEGRIDADE DAS FONTES */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Data Governance" sub="Confiabilidade das Fontes de Dados" icon={<Database className="w-6 h-6 text-blue-600" />} />
          
          <div className="space-y-6 mt-10">
            {[
              { name: 'CRM Central (Sugar)', status: 'Live', health: 99.4, color: 'emerald' },
              { name: 'Apollo.io Enriquecimento', status: 'Sincronizado', health: 96.2, color: 'blue' },
              { name: 'Minerva Signals Engine', status: 'Running', health: 88.0, color: 'amber' },
              { name: 'LinkedIn Paid Social', status: 'Ativo', health: 100, color: 'emerald' },
              { name: 'Bases Ad-hoc (Sheets)', status: 'Pronto', health: 92.5, color: 'blue' },
            ].map((source, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${bgMap[source.color || 'blue']} animate-pulse`}></div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{source.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{source.health}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${bgMap[source.color || 'blue']} transition-all duration-1000`} 
                    style={{ width: `${source.health}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-900 rounded-3xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
             <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">Ação de Sustentação</p>
             <h4 className="text-white text-sm font-bold leading-snug">Auditoria de 145 contas sem Owner identificado no CRM.</h4>
             <Button variant="ghost" className="w-full mt-6 text-white bg-white/10 hover:bg-white/20 font-black text-[9px] uppercase tracking-widest py-3 rounded-xl border border-white/10">
                Rodar Auto-Fix de Mapeamento
             </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. GLOBAL PREFERENCES - PREFERÊNCIAS ENXUTAS */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Global Preferences" sub="Parâmetros Corporativos do Workspace" icon={<Globe className="w-6 h-6 text-slate-900" />} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <div className="space-y-6">
              {[
                { label: 'Moeda Padrão', val: 'BRL (R$)', icon: <Activity className="w-4 h-4" /> },
                { label: 'Ano Fiscal / Período', val: 'Janeiro - Dezembro', icon: <Clock className="w-4 h-4" /> },
              ].map((pref, i) => (
                <div key={i} className="p-5 border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-900 transition-all">{pref.icon}</div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{pref.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-900">{pref.val}</span>
                    <ChevronDown className="w-3 h-3 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Meta Global do Workspace (Q2)</p>
               <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">R$ 12.5M</span>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5 whitespace-nowrap">GOAL REVENUE</p>
               </div>
               <div className="flex items-center gap-4 text-[9px] font-black uppercase text-slate-500 mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Forecast</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Gap</div>
               </div>
            </div>
          </div>
        </Card>

        {/* 5. OPERATIONAL GUARDRAILS - NOTIFICAÇÕES & CRITICIDADE */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Operational Guardrails" sub="Governança de Alertas e Notificações" icon={<Shield className="w-6 h-6 text-red-600" />} />
          
          <div className="space-y-4 mt-10">
            {[
              { label: 'CRÍTICO (P0): Churn ou Risco Político', color: 'red', desc: 'Push + Email + Slack Urgent', val: true, id: 'toggle-critical' },
              { label: 'ALERTA (P1): Mudança de ICP ou Signal Gap', color: 'amber', desc: 'Push + Slack Digest', val: true, id: 'toggle-alert' },
              { label: 'OPORTUNIDADE (P2): Sinal de Intenção Médio', color: 'blue', desc: 'In-app Notification Only', val: false, id: 'toggle-opp' },
            ].map((n, i) => (
              <div key={i} className="flex justify-between items-center p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${bgMap[`${n.color}-pale`] || 'bg-blue-50'} ${textMap[n.color] || 'text-blue-600'} group-hover:scale-110 transition-transform`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{n.label}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">{n.desc}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  className={`w-10 h-6 rounded-full transition-colors ${n.val ? (n.color === 'red' ? 'bg-red-600' : n.color === 'amber' ? 'bg-amber-600' : 'bg-blue-600') : 'bg-slate-200'}`}
                  aria-label={n.label}
                  aria-pressed={n.val}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${n.val ? 'translate-x-4' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* FOOTER ACTIONS - CONTEXTO OPERACIONAL */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-200">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">AD</div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Authorization</p>
              <p className="text-xs font-bold text-slate-900 leading-none mt-0.5">Fábio Diniz • 2026-04-01 23:30</p>
           </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none py-6 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 border-slate-200 hover:bg-slate-50 h-14">Descartar Configuração</Button>
          <Button className="flex-1 md:flex-none py-6 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 h-14">Publicar Governança</Button>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; sub: string; icon: React.ReactNode }> = ({ title, sub, icon }) => (
  <div className="flex items-start gap-5">
    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{title}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{sub}</p>
    </div>
  </div>
);

export default Settings;
