"use client";

import React, { useMemo } from 'react';
import { Card, Badge } from '../components/ui';
import {
  AlertCircle, BarChart3, Check, Database, Info, Cpu
} from 'lucide-react';
import { isSupabaseConfigured, getEnvironment } from '../lib/supabaseClient';

export const Settings: React.FC = () => {
  // Estado verificável em runtime
  const runtimeState = useMemo(() => ({
    supabaseConfigured: isSupabaseConfigured(),
    environment: getEnvironment(),
  }), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* HERO: Estado Verificável em Runtime */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase">
                Settings & Diagnostics
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Plataforma: Transparência de Dados
              </h1>
              <p className="text-slate-400 mt-3 text-sm font-medium max-w-xl leading-relaxed">
                Mapeamento estrutural de fontes de dados (real, mock, static) e estado verificável em runtime.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-white/10">
          {[
            { label: 'Ambiente Detectado', val: runtimeState.environment || '?', sub: 'Do env vars' },
            { label: 'Supabase', val: runtimeState.supabaseConfigured ? 'Configurado' : 'Não configurado', sub: runtimeState.supabaseConfigured ? 'Irá usar dados reais' : 'Usando mock apenas' },
            { label: 'Estado Estrutural', val: 'Mapeado', sub: 'Ver blocos abaixo' },
            { label: 'Auditoria', val: 'Documento 25', sub: 'Leia doc 25 para detalhes' },
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
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Verificável em Runtime</p>
                </div>
                <div className="space-y-3 text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Ambiente:</span>
                    <span className="font-black">{runtimeState.environment || 'Não detectado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supabase:</span>
                    <span className={`font-black ${runtimeState.supabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {runtimeState.supabaseConfigured ? 'Configurado' : 'Não configurado'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 italic mt-2">Leitura de: env vars e isSupabaseConfigured()</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Fallback Automático', sub: 'Código: accountsRepository.ts linha 148-150', val: true },
                  { label: 'Accounts usa Supabase', sub: 'Se configurado; senão usa contasMock', val: true },
                  { label: 'Interactions usa Supabase', sub: 'Se configurado; senão usa seed', val: true },
                  { label: 'Telemetria em Runtime', sub: 'Não auditada — não há métricas reais coletadas', val: false },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-5 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        {item.val ? <Check className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-medium text-slate-500">{item.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-amber-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-700/50 to-amber-900/50"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-300" />
                    <h4 className="text-xs font-black uppercase tracking-widest">O Que Não Está Auditado</h4>
                  </div>
                  <div className="space-y-2 text-[10px] text-amber-100">
                    <p>✗ Node.js/Next.js versão</p>
                    <p>✗ Vercel Fluid Compute (deployment)</p>
                    <p>✗ Listeners/realtime (não há observabilidade)</p>
                    <p>✗ Última sincronização (não auditada)</p>
                    <p>✗ Latência de conexão</p>
                    <p>✗ Taxa de uptime</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-2">Recomendação</p>
                     <p className="text-[10px] text-amber-100 leading-snug">Para diagnosticar plataforma real, consulte diretamente a página <strong>Accounts</strong> — ela reflete dados reais ou fallback confiável.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. MAPEAMENTO ESTRUTURAL DE FONTES */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Mapeamento de Fontes" sub="Repositórios & Tipo de Dados" icon={<Database className="w-6 h-6 text-blue-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { name: 'Accounts', sub: 'getAccounts()', type: 'Supabase + Fallback', impl: 'accountsRepository.ts' },
              { name: 'Interactions', sub: 'getInteractions()', type: 'Supabase + Fallback', impl: 'interactionsRepository.ts' },
              { name: 'PlayRecommendations', sub: 'getPlayRecommendations()', type: 'Supabase + Fallback', impl: 'playRecommendationsRepository.ts' },
              { name: 'CampaignsCanonical (E22)', sub: 'getCampaignsCanonical()', type: 'Supabase + Fallback', impl: 'campaignsCanonicalRepository.ts' },
              { name: 'Opportunities', sub: 'getOportunidadesMap()', type: 'Mock/Fallback', impl: 'oportunidadesRepository.ts' },
              { name: 'advancedSignals', sub: 'Importado direto', type: 'Mock Apenas', impl: 'data/signalsV6.ts' },
              { name: 'initialActions', sub: 'Importado direto', type: 'Mock Apenas', impl: 'data/accountsData.ts' },
              { name: 'METRICS, FRENTES, SQUAD_OWNERS', sub: 'Arrays hardcoded', type: 'Static Apenas', impl: 'Performance.tsx' },
            ].map((source, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{source.name}</span>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${source.type === 'Supabase + Fallback' ? 'bg-emerald-100 text-emerald-700' : source.type === 'Mock/Fallback' ? 'bg-blue-100 text-blue-700' : source.type === 'Mock Apenas' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {source.type}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{source.sub}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Arquivo: {source.impl}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-200">
             <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">📋 Legenda</p>
             <div className="text-[10px] text-slate-700 space-y-1">
               <p><strong>Supabase + Fallback:</strong> Código tenta ler real, cai para mock se indisponível</p>
               <p><strong>Mock/Fallback:</strong> Lógica mista (ex: oportunidades ainda em E2)</p>
               <p><strong>Mock Apenas:</strong> Importa direto, zero tentativa de ler Supabase</p>
               <p><strong>Static Apenas:</strong> Arrays hardcoded em código (ex: Performance.tsx)</p>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. HEURÍSTICA: CONFIABILIDADE EDITORIALIZADA POR TELA */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Confiabilidade por Tela" sub="Heurística Editorial (não medida)" icon={<BarChart3 className="w-6 h-6 text-blue-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { page: 'Accounts', label: 'Alta', color: 'emerald', desc: 'Tenta Supabase real; fallback mock confiável' },
              { page: 'Overview', label: 'Baixa', color: 'red', desc: 'Mock direto (advancedSignals), não reconciliado' },
              { page: 'Performance', label: 'Nenhuma', color: 'red', desc: 'Arrays hardcoded (não tem fonte real)' },
              { page: 'Settings', label: 'Média', color: 'amber', desc: 'Mostra mapeamento estrutural (este painel)' },
            ].map((screen, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{screen.page}</span>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${screen.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : screen.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {screen.label}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{screen.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-200">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">⚠️ Importante</p>
             <p className="text-slate-700 text-sm leading-snug">Estes labels são <strong>heurística editorial</strong>, não métricas auditadas. Para diagnóstico real: consulte <strong>Accounts</strong> (dados reais/fallback confiável).</p>
          </div>
        </Card>

        {/* 5. ESTADO ESTRUTURAL DOCUMENTADO (NÃO AUDITADO) */}
        <Card className="p-10 border-slate-200 shadow-sm rounded-[48px] bg-white">
          <SectionHeader title="Estado Estrutural" sub="Mapeamento Documentado em Doc 25" icon={<Info className="w-6 h-6 text-blue-600" />} />

          <div className="space-y-4 mt-10">
            {[
              { aspect: 'Overview', note: 'Importa advancedSignals direto (mock)', status: 'Documentado' },
              { aspect: 'Performance', note: 'Arrays METRICS/FRENTES hardcoded', status: 'Documentado' },
              { aspect: 'Accounts', note: 'Tenta getAccounts() real, fallback contasMock', status: 'Ativo' },
              { aspect: 'E22.1 Campanhas', note: 'Integração em exploração — aguardando user review', status: 'Exploratório' },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.aspect}</span>
                      <Badge className={`text-[8px] font-black px-2 py-0.5 ${item.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Exploratório' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500">{item.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-200">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">📖 Referência</p>
             <p className="text-slate-700 text-sm leading-snug">Estado estrutural completo documentado em <strong>docs/98-operacao/25-auditoria-canonicidade-fontes-dados.md</strong>.</p>
             <p className="text-[10px] text-slate-600 mt-2">Para diagnosticar saúde real: consulte <strong>Accounts.tsx</strong> (seus dados refletem Supabase ou fallback confiável).</p>
          </div>
        </Card>
      </div>

      {/* RODAPÉ: Aviso sobre Escopo Documental */}
      <div className="pt-10 border-t border-slate-200">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
           <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">ℹ️ Escopo desta Página</p>
           <p className="text-sm text-slate-700 leading-snug">Configurações em Settings.tsx é <strong>diagnóstica e documental</strong>. Não persiste dados, não salva estado, não executa ações operacionais. Consulte <strong>docs/98-operacao/25-auditoria-canonicidade-fontes-dados.md</strong> para detalhes completos.</p>
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
