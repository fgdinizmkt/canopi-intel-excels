/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Share2, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  ArrowRight, 
  Info, 
  ChevronDown, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Globe,
  Mail,
  MessageSquare,
  Building2,
  Rocket,
  RefreshCw,
  Search,
  Filter,
  Download,
  Database,
  ShieldCheck,
  Star,
  Ban,
  Plus,
  Layers,
  Megaphone
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';

export const CrossIntelligence: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inteligência Cruzada</h1>
          <p className="text-slate-500 font-medium">
            Transformando aprendizados em recomendações escaláveis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">VERTICAL</span>
            <span>Todas</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">SEGMENTO</span>
            <span>Enterprise</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">CONFIANÇA</span>
            <span className="text-brand">{">"} 80%</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-brand rounded-lg shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">O que é:</span> Inteligência Cruzada é a camada que transforma aprendizados de campanhas, contas, comitês, relacionamento e performance em recomendações reaproveitáveis entre <span className="italic font-medium">ABM (Account-Based Marketing)</span> e <span className="italic font-medium">ABX (Account-Based Experience)</span>.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Insights Reutilizáveis', val: '124', sub: '+12% vs mês ant.', color: 'text-slate-900' },
          { title: 'Maior Repetição', val: 'Fintech', sub: '34 plays similares detectados', badge: 'Alto Impacto' },
          { title: 'Plays Reaproveitáveis', val: '42', sub: 'em 8 clusters', icon: '+5' },
          { title: 'Confiança Média', val: '88%', sub: 'Baseado em 1.2k interações', icon: CheckCircle2 },
        ].map((kpi, i) => (
          <Card key={i} noPadding className="p-6 border border-slate-200 shadow-sm bg-white h-full flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{kpi.title}</p>
              <div className="flex items-end gap-2">
                <h3 className={`text-3xl font-bold ${kpi.color || 'text-brand'}`}>{kpi.val}</h3>
                {kpi.badge && <Badge variant="blue" className="text-[8px] px-1.5 mb-1.5">{kpi.badge}</Badge>}
                {kpi.icon === CheckCircle2 && <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1.5" />}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-4">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* The Loop Section */}
      <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">O Loop de Inteligência</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-brand bg-slate-50/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Zap className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-bold text-slate-900">ABX feeds ABM</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Dados de engajamento e experiência em contas ativas refinam a segmentação de novas contas para prospecção.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Users className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p><strong>Stakeholders Aceleradores:</strong> CTOs em verticais SaaS tendem a reduzir em 15 dias o agendamento da primeira reunião quando tocados por LinkedIn Ads antes do outbound.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Target className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p><strong>Estruturas de Comitê:</strong> Empresas com {'>'}500 func. exigem aprovação de Procurement no estágio M3. Inicie o "warm-up" desse perfil agora.</p>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900">ABM feeds ABX</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Insights de intenção e perfil de contas de marketing priorizam o sucesso e expansão na base de clientes.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Rocket className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Campanhas de Aquecimento:</strong> A campanha "Efficiency First" gerou 40% mais cliques em display para contas que receberam direct mail prévio no modelo 1:1.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Search className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Canais de Melhor Abertura:</strong> C-levels do Setor Financeiro respondem 3x mais a convites para webinars exclusivos via WhatsApp do que por E-mail corporativo.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Verticals & Contact Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patterns by Vertical */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900">Padrões por Vertical</h2>
            <button className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">Explorar dados crus</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                name: 'Manufatura', 
                tag: 'Alta Taxa', 
                tagVariant: 'emerald', 
                desc: 'Foco em integração de legado e eficiência operacional.', 
                success: 64, 
                alert: 'Comitê técnico isolado',
                icon: Building2
              },
              { 
                name: 'Fintech', 
                tag: 'Máxima', 
                tagVariant: 'emerald', 
                desc: 'Escalabilidade rápida e conformidade rigorosa.', 
                success: 71, 
                alert: 'Rotatividade de líderes',
                icon: Database
              },
              { 
                name: 'Varejo', 
                tag: 'Média', 
                tagVariant: 'amber', 
                desc: 'Margens comprimidas e jornada omnichannel.', 
                success: 48, 
                alert: 'Decisões sazonais/budget',
                icon: Zap
              }
            ].map((v, i) => (
              <Card key={i} noPadding className="p-5 border-none shadow-sm bg-white flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <v.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <Badge variant={v.tagVariant as any} className="text-[8px] px-1.5">{v.tag}</Badge>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{v.desc}</p>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Sucesso</span>
                      <span className="text-slate-900">{v.success}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-brand h-full rounded-full" style={{ width: `${v.success}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {v.alert}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Classes de Contato */}
        <div className="space-y-4 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 px-2">Classes de Contato</h2>
          <Card noPadding className="p-6 border-none shadow-sm bg-white flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Perfis Comportamentais</p>
            <div className="space-y-8">
              {[
                { name: 'Decisores', desc: 'Buscam ROI e Segurança', relevance: 92, icon: BarChart3, color: 'blue' },
                { name: 'Influencers', desc: 'Foco em Processo e UX', relevance: 85, icon: Megaphone, color: 'indigo' },
                { name: 'Champions', desc: 'Aliados Internos de Valor', relevance: 98, icon: Star, color: 'emerald' },
                { name: 'Bloqueadores', desc: 'Aversão à Mudança / Custo', relevance: null, icon: Ban, color: 'red' }
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className={`p-2.5 bg-${p.color}-50 rounded-xl transition-colors group-hover:bg-${p.color}-100`}>
                    <p.icon className={`w-4 h-4 text-${p.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                      {p.relevance ? (
                        <span className="text-[9px] font-bold text-brand bg-brand/5 px-1.5 py-0.5 rounded-md">{p.relevance}% Relevance</span>
                      ) : (
                        <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded-md">Monitorar</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate font-medium">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Similar Accounts Table */}
      <Card title="Contas com Sinergia Detectada" subtitle="Recomendações baseadas em padrões de sucesso de ABX">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conta</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vertical</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinergia</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'CloudScale Inc.', vertical: 'Fintech', synergy: 94, status: 'Pronto', color: 'emerald' },
                { name: 'Global Logistics', vertical: 'Manufatura', synergy: 88, status: 'Aquecimento', color: 'blue' },
                { name: 'RetailFlow', vertical: 'Varejo', synergy: 82, status: 'Análise', color: 'amber' },
                { name: 'SecureBank', vertical: 'Fintech', synergy: 91, status: 'Pronto', color: 'emerald' },
              ].map((account, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {account.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{account.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium text-slate-500">{account.vertical}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`bg-${account.color === 'emerald' ? 'emerald' : account.color === 'blue' ? 'blue' : 'amber'}-500 h-full rounded-full`} style={{ width: `${account.synergy}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{account.synergy}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={account.color as any}>{account.status}</Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Final CTA - Fixed Readability */}
      <div className="bg-slate-900 p-10 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        {/* Dots Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Pronto para escalar?</h2>
            <p className="text-white/70 font-medium leading-relaxed">
              Implemente estas recomendações de inteligência cruzada agora e aumente a velocidade do seu pipeline em até 25% através de automações de GTM baseadas em evidências.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button className="bg-brand text-white hover:bg-brand/90 px-8 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20">
              Aplicar Recomendações
            </button>
            <button className="bg-transparent text-white border-2 border-white/20 hover:bg-white/10 px-8 py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all">
              Exportar Playbooks
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <p>© 2024 CANOPI | intel excels. BUILT FOR ENTERPRISE GROWTH.</p>
        <div className="flex gap-8">
          <button className="hover:text-brand transition-colors">Privacidade</button>
          <button className="hover:text-brand transition-colors">Documentação</button>
          <button className="hover:text-brand transition-colors">Status</button>
        </div>
      </div>
    </div>
  );
};


export default CrossIntelligence;
