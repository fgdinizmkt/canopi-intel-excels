'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Activity, 
  CircleAlert,
  Database, 
  LockKeyhole,
  ShieldCheck, 
  Table, 
  Zap, 
  ArrowRightLeft, 
  Upload, 
  Lock,
  Search
} from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig, type ContasConfigStepStatus } from './_components/ContasConfigContext';

export default function ContasHubPage() {
  const { stepStatus, readinessScore } = useContasConfig();

  const stepStatusMap = new Map(stepStatus.map((step) => [step.slug, step]));

  const getStatusBadgeClass = (status: ContasConfigStepStatus['status']) => {
    switch (status) {
      case 'configured':
        return 'bg-emerald-100 text-emerald-600';
      case 'blocked':
        return 'bg-red-100 text-red-600';
      case 'locked':
        return 'bg-slate-200 text-slate-500';
      case 'optional':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-amber-100 text-amber-600';
    }
  };

  const getStatusLabel = (status: ContasConfigStepStatus['status']) => {
    switch (status) {
      case 'configured':
        return 'CONFIGURADO';
      case 'blocked':
        return 'BLOQUEADO';
      case 'locked':
        return 'TRAVADO';
      case 'optional':
        return 'OPCIONAL';
      default:
        return 'PENDENTE';
    }
  };

  const sections = [
    { 
      id: 'visao-geral', 
      title: '1. Visão Geral', 
      desc: 'Impacto no sistema e status do módulo.', 
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      slug: 'visao-geral'
    },
    { 
      id: 'fontes', 
      title: '2. Fontes e Conectores', 
      desc: 'CRM Native Integration & Field Mappings.', 
      icon: Database, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      slug: 'fontes-conectores' 
    },
    { 
      id: 'identidade', 
      title: '3. Identidade e Dedupe', 
      desc: 'Primary Keys & Políticas de Duplicidade.', 
      icon: ShieldCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      slug: 'identidade-dedupe'
    },
    { 
      id: 'canonica', 
      title: '4. Camada Canônica', 
      desc: 'Schema rígido e estruturação de dados.', 
      icon: Table, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      slug: 'camada-canonica'
    },
    { 
      id: 'classificacao', 
      title: '5. Classificação ABM / ABX', 
      desc: 'Status inteligentes e ICP ICP Mapping.', 
      icon: Zap, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      slug: 'classificacao-abm-abx'
    },
    { 
      id: 'writeback', 
      title: '6. Writeback (Retorno)', 
      desc: 'Sync bidirecional e master intelligence.', 
      icon: ArrowRightLeft, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      slug: 'writeback'
    },
    { 
      id: 'upload', 
      title: '7. Upload e LGPD', 
      desc: 'Bases offline e Auditoria Legal.', 
      icon: Upload, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      slug: 'upload-lgpd'
    },
    { 
      id: 'governanca', 
      title: '8. Governança', 
      desc: 'Audit Health e Histórico de Validação.', 
      icon: Search, 
      color: 'text-slate-600', 
      bg: 'bg-slate-50',
      slug: 'governanca-mapeamento'
    },
    { 
      id: 'validacao', 
      title: '9. Validação & Publicação', 
      desc: 'Hard Blockers e Checklist Final.', 
      icon: Lock, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      slug: 'validacao-publicacao'
    },
  ];

  return (
    <div className="space-y-12">
      <header className="flex items-end justify-between">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Módulo de Configuração</h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Selecione uma área para configurar a inteligência de Contas. 
            O progresso é monitorado em tempo real pelo <strong className="text-blue-600">Readiness Score</strong>.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-100 flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Health Status</p>
              <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{readinessScore >= 100 ? 'Pronto p/ Validação' : 'Setup em Progresso'}</p>
           </div>
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${readinessScore >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <ShieldCheck className="w-6 h-6" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const step = stepStatusMap.get(section.slug);
          if (!step) return null;

          const isLocked = step.status === 'locked';
          const visibleBlockers = step.blockers.filter((blocker) => Boolean(blocker.sectionSlug));
          const hasBlockers = visibleBlockers.length > 0;
          const cardBody = (
            <Card
              className={`group p-8 border-slate-200 transition-all flex flex-col h-full bg-white relative overflow-hidden ${
                isLocked
                  ? 'opacity-75 border-slate-200 bg-slate-50/50'
                  : 'hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1'
              }`}
            >
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${section.bg} rounded-full ${isLocked ? 'opacity-10' : 'opacity-0 group-hover:opacity-40'} transition-all duration-500`} />

              <div className="flex items-start justify-between mb-8 gap-4">
                <div className={`p-4 rounded-2xl ${section.bg} ${section.color} transition-all ${isLocked ? '' : 'group-hover:scale-110 group-hover:shadow-lg'} shadow-black/5`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <Badge className={`${getStatusBadgeClass(step.status)} font-black text-[9px] uppercase tracking-widest border-none px-3 py-1`}>
                  {getStatusLabel(step.status)}
                </Badge>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tight mb-2 transition-colors ${isLocked ? 'text-slate-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
                    {section.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{section.desc}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pré-requisito</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.prerequisite}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impacto</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.impact}</p>
                </div>

                {hasBlockers && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-700">
                      <CircleAlert className="w-4 h-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Bloqueio ativo</p>
                    </div>
                    <p className="text-xs text-red-900 font-bold leading-relaxed">{visibleBlockers[0].message}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {isLocked ? 'Desbloqueie a etapa anterior' : 'Acessar Configuração'}
                </span>
                {isLocked ? (
                  <LockKeyhole className="w-4 h-4 text-slate-300" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </Card>
          );

          return isLocked ? (
            <div key={section.id}>{cardBody}</div>
          ) : (
            <Link key={section.id} href={step.href}>
              {cardBody}
            </Link>
          );
        })}
      </div>

      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between overflow-hidden relative">
         <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none">
            <Zap className="w-64 h-64 text-white" />
         </div>
         <div className="space-y-2 relative">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Workflow de Configuração</h3>
            <p className="text-sm text-slate-400 font-medium">Siga a ordem numérica para garantir a integridade total do objeto Contas.</p>
         </div>
         <div className="flex items-center gap-3 relative">
            <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase hover:bg-blue-50 transition-all shadow-xl">
               Ver Documentação V2
            </button>
            <button className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase cursor-not-allowed">
               Advanced Debugger
            </button>
         </div>
      </div>
    </div>
  );
}
