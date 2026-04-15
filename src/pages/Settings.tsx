"use client";

import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import {
  Search, Bell, HelpCircle, Zap, BarChart3, Target, Check, AlertCircle,
  Info, Shield, ChevronDown, GripVertical, User, Briefcase, Megaphone,
  Clock, BrainCircuit, Activity, Database, Globe, RefreshCw, Layers, ShieldCheck,
  Server, Wifi, WifiOff, Cpu
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
            { label: 'Ambiente', val: 'Development', sub: 'Local/Staging' },
            { label: 'Supabase Status', val: 'Configurado', sub: 'Conectado' },
            { label: 'Modo Fallback', val: 'Ativo', sub: 'Mock ready' },
            { label: 'Última Sincronização', val: 'Real-time', sub: 'Via Supabase' },
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
        {/* 2. AMBIENTE ATUAL - CONFIGURAÇÃO & STATUS */}
        <Card className="lg:col-span-2 p-10 border-slate-200 shadow-sm rounded-[48px] bg-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100 shadow-inner">
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ambiente Atual</h3>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Configuração de Plataforma & Infraestrutura</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambiente Execução</p>
                  <span className="text-sm font-black text-blue-600">Development</span>
                </div>
                <div className="space-y-3 text-[10px] text-slate-600">
                  <div className="flex justify-between"><span>Node.js:</span><span className="font-black">24 LTS</span></div>
                  <div className="flex justify-between"><span>Next.js:</span><span className="font-black">App Router v13+</span></div>
                  <div className="flex justify-between"><span>Runtime:</span><span className="font-black">Vercel Fluid Compute</span></div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Supabase Configurado', sub: 'PostgreSQL + Auth + Realtime', val: true },
                  { label: 'Fallback Automático', sub: 'Mock seed data quando indisponível', val: true },
                  { label: 'Sincronização Real-time', sub: 'Listeners ativos em accounts, interactions, campaigns', val: true },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-all">
                        {item.val ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-medium text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                    <Check className={`w-5 h-5 ${item.val ? 'text-blue-600' : 'text-slate-200'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-blue-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 to-blue-900/50"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-300" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Status de Conexão</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Supabase Project</p>
                      <p className="text-sm font-black tracking-tight">canopi-intel</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-300 uppercase tracking-wider">Modo Atual</p>
                      <p className="text-sm font-black tracking-tight">Supabase + Fallback</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 space-y-3">
                     <div>
                        <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Confiabilidade por Fonte</p>
                        <p className="text-[10px] text-blue-100">Accounts: Real quando Supabase disponível</p>
                        <p className="text-[10px] text-blue-100">Overview: Mock (advancedSignals)</p>
                        <p className="text-[10px] text-blue-100">Performance: Static hardcoded</p>
                     </div>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl h-14 shadow-xl hover:bg-blue-700 transition-all">
                Verificar Status da Conexão
              </Button>
            </div>
          </div>
        </Card>

        {/* 3. FONTES REAIS DA PLATAFORMA */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Fontes Reais" sub="Entidades de Dados & Origem" icon={<Database className="w-6 h-6 text-emerald-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { name: 'Accounts (Contas)', role: 'Dados mestres de conta', health: 95, type: 'Real/Mock', impacted: 'Accounts, Overview, Performance' },
              { name: 'Interactions (Bloco C)', role: 'Sinais de engajamento', health: 92, type: 'Real/Mock', impacted: 'Accounts, Plays' },
              { name: 'PlayRecommendations', role: 'Plays ativos recomendados', health: 90, type: 'Real/Mock', impacted: 'Accounts' },
              { name: 'CampaignsCanonical (E22)', role: 'Campanhas normalizadas', health: 88, type: 'Real/Mock', impacted: 'Accounts (E22.1)' },
              { name: 'Opportunities (Oportunidades)', role: 'Pipeline de vendas', health: 85, type: 'Mock', impacted: 'Accounts' },
              { name: 'advancedSignals (Mock)', role: 'Sinais fictícios para exploration', health: 0, type: 'Mock Only', impacted: 'Overview (100%)' },
              { name: 'initialActions (Mock)', role: 'Fila de ações fictícia', health: 0, type: 'Mock Only', impacted: 'Overview (100%)' },
              { name: 'METRICS, FRENTES (Static)', role: 'Performance hardcoded', health: 0, type: 'Static', impacted: 'Performance (100%)' },
            ].map((source, i) => (
              <div key={i} className="group cursor-pointer p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{source.name}</span>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${source.type === 'Real/Mock' ? 'bg-emerald-100 text-emerald-700' : source.type === 'Mock Only' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {source.type}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{source.role}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Impacta: {source.impacted}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 whitespace-nowrap ml-2">{source.health}%</span>
                </div>
                {source.health > 0 && (
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${source.health >= 80 ? 'bg-emerald-500' : source.health >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${source.health}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-200 relative overflow-hidden">
             <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">⚠️ Inconsistência Detectada</p>
             <h4 className="text-slate-900 text-sm font-bold leading-snug">Overview e Performance usam dados mock, não reconciliados com Accounts (real/fallback). Ver doc 25 para auditoria completa.</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. CONFIABILIDADE POR TELA */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Confiabilidade por Tela" sub="Matriz de Qualidade de Dados" icon={<BarChart3 className="w-6 h-6 text-blue-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { page: 'Accounts', realComp: '100%', confidence: 95, desc: 'Supabase + fallback mock' },
              { page: 'Overview', realComp: '0%', confidence: 20, desc: 'Mock advancedSignals + initialActions' },
              { page: 'Performance', realComp: '0%', confidence: 5, desc: 'METRICS/FRENTES hardcoded' },
              { page: 'Settings', realComp: '0%', confidence: 50, desc: 'Mostra fontes reais (este painel)' },
            ].map((screen, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{screen.page}</span>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${screen.confidence >= 80 ? 'bg-emerald-100 text-emerald-700' : screen.confidence >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {screen.confidence}% confiável
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{screen.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] text-slate-500">Componentes Reais:</p>
                      <span className="text-[9px] font-black text-slate-700">{screen.realComp}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: screen.realComp }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] text-slate-500">Confiabilidade Geral:</p>
                      <span className="text-[9px] font-black text-slate-700">{screen.confidence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${screen.confidence >= 80 ? 'bg-emerald-500' : screen.confidence >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${screen.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-200">
             <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">📊 Recomendação</p>
             <p className="text-slate-700 text-sm leading-snug">Para diagnosticar plataforma: use <strong>Accounts</strong> para dados reais, <strong>Overview/Performance</strong> apenas para exploração. Ver doc 25 para detalhes.</p>
          </div>
        </Card>

        {/* 5. LACUNAS ESTRUTURAIS */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Lacunas Estruturais" sub="O que Ainda Não Está Reconciliado" icon={<AlertCircle className="w-6 h-6 text-amber-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { issue: 'Overview é 100% Mock', status: 'Não Reconciliado', severity: 'high', action: 'Refatorar para usar getAccounts() + getInteractions()' },
              { issue: 'Performance é 100% Hardcoded', status: 'Não Reconciliado', severity: 'high', action: 'Derivar METRICS e FRENTES de dados reais' },
              { issue: 'Sinais e Plays não em Supabase', status: 'Pendente', severity: 'medium', action: 'Migração E2 para supabase.signals' },
              { issue: 'Campanhas ainda em fase E22.1', status: 'Exploratório', severity: 'low', action: 'Aguardar avaliação visual do usuário' },
            ].map((gap, i) => (
              <div key={i} className="flex justify-between items-start p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-xl mt-1 ${gap.severity === 'high' ? 'bg-red-50 text-red-600' : gap.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{gap.issue}</p>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${gap.severity === 'high' ? 'bg-red-100 text-red-700' : gap.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {gap.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{gap.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-red-50 rounded-3xl border border-red-200">
             <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2">⚠️ Diagnóstico Crítico</p>
             <p className="text-slate-900 text-sm leading-snug font-medium">Onde o operador deve olhar para saber se plataforma está saudável:</p>
             <ul className="text-[10px] text-slate-700 mt-2 space-y-1 ml-4">
                <li>• <strong>Pipeline Real:</strong> Contar contas com interações em Accounts (não confiar em Overview/Performance)</li>
                <li>• <strong>SLA Operacional:</strong> Verificar plays ativos via getPlayRecommendations() em Accounts</li>
                <li>• <strong>Campanhas:</strong> E22.1 em exploração, ver Accounts para números reais (não Performance)</li>
             </ul>
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
