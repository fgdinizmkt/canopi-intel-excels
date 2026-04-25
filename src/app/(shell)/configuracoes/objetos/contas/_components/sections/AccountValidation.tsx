'use client';

import React from 'react';
import Link from 'next/link';
import { useContasConfig } from '../ContasConfigContext';
import { AlertCircle, CheckCircle2, ShieldAlert, Zap, ArrowRight, Database } from 'lucide-react';

export const AccountValidation = () => {
  const { blockers, canPublish, readinessScore, stepStatus } = useContasConfig();
  const stepStatusMap = new Map(stepStatus.map((step) => [step.slug, step]));

  return (
    <div className="space-y-6">
      {/* Header & Readiness */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Validação do Setup Local</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Prontidão do contrato local:</span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${readinessScore > 80 ? 'bg-emerald-500' : readinessScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className={`text-sm font-black ${readinessScore > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>{readinessScore}%</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl">
          Este score mede apenas completude do setup local (presets, campos e contrato local). Ele não representa conexão real com CRM externo.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-900">
          Conexão real com CRM ainda não implementada. Esta validação cobre apenas presets, campos e contrato local.
        </p>
      </div>

      {/* Blockers List */}
      <div className="grid grid-cols-1 gap-4">
        {blockers.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-emerald-800">Setup local validado</h3>
            <p className="text-sm text-emerald-600 mt-1">Nenhum impedimento crítico local encontrado. Pronto para revisão local.</p>
          </div>
        ) : (
          blockers.map((blocker) => (
            <div key={blocker.id} className={`flex gap-4 p-5 rounded-2xl border ${blocker.severity === 'hard' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="shrink-0">
                {blocker.severity === 'hard' ? <ShieldAlert className="w-6 h-6 text-red-600" /> : <AlertCircle className="w-6 h-6 text-amber-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-black uppercase tracking-tight ${blocker.severity === 'hard' ? 'text-red-900' : 'text-amber-900'}`}>
                    {blocker.id} • {blocker.section}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${blocker.severity === 'hard' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                    {blocker.severity === 'hard' ? 'Bloqueador Crítico' : 'Aviso de Risco'}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-2">{blocker.message}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-black/5">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Consequência</span>
                    <p className="text-xs text-slate-600 leading-relaxed italic">{blocker.consequence}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Ação Corretiva</span>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {blocker.action}
                      </p>
                      {blocker.sectionSlug ? (
                        <Link
                          href={`/configuracoes/objetos/contas/${blocker.sectionSlug}`}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                        >
                          Ir para {stepStatusMap.get(blocker.sectionSlug)?.label || blocker.section}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Revisar em Validação Local
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-200">
        <div className="flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Zap className={`w-6 h-6 ${canPublish ? 'text-yellow-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="text-lg font-black leading-none mb-1">Conclusão da etapa local</p>
            <p className="text-xs text-slate-400 font-medium">
              {canPublish
                ? 'Critérios locais atendidos. Pronto para registrar validação local.'
                : 'Selecione uma fonte e valide o contrato local de leitura antes de concluir a etapa local.'}
            </p>
          </div>
        </div>

        <button 
          disabled={!canPublish}
          onClick={() => alert('ENTREGA: A etapa local de Contas V2 foi registrada. Não houve publicação em produção nem conexão real com CRM externo.')}
          className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            canPublish 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-900/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          {canPublish ? 'Registrar validação local' : 'Validação local bloqueada'}
        </button>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-3">
        <Database className="w-4 h-4 text-slate-400" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Ambiente: Homologação Local State • Dados persistentes apenas p/ navegação atual
        </p>
      </div>
    </div>
  );
};

export default AccountValidation;
