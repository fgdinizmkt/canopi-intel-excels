'use client';

import React from 'react';
import { CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';

export function AccountCanonical() {
  const {
    selectedConnector,
    canonicalMapping,
    canonicalMappingReviewed,
    updateCanonicalMappingField,
    setCanonicalMappingReviewed,
    resetCanonicalMappingToPreset,
  } = useContasConfig();

  const totalFields = canonicalMapping.length;
  const reviewedCount = canonicalMapping.filter((mapping) => mapping.status === 'mapped').length;

  const resolvePipelineUsage = (source: string) => {
    if (source === 'fact') return 'Ingestão';
    if (source === 'canopi') return 'Canopi';
    if (source === 'recommendation') return 'Recomendação';
    return 'Custom';
  };

  const resolveMatchingUsage = (canonicalField: string) => {
    if (
      canonicalField.includes('domain') ||
      canonicalField.includes('external_account_id') ||
      canonicalField.includes('tax_id')
    ) {
      return 'Sim';
    }
    return 'Não';
  };

  const resolveScoreUsage = (isClassification?: boolean) => (isClassification ? 'Sim' : 'Não');

  const resolveReviewStatusLabel = (status: 'pending' | 'mapped' | 'error') => {
    if (status === 'mapped') return 'Revisado';
    if (status === 'error') return 'Erro';
    return 'Pendente';
  };

  const handleToggleRowReview = (canonicalField: string, status: 'pending' | 'mapped' | 'error') => {
    updateCanonicalMappingField(canonicalField, { status: status === 'mapped' ? 'pending' : 'mapped' });
  };

  const handleMarkReviewed = () => {
    if (!selectedConnector || totalFields === 0) return;
    setCanonicalMappingReviewed(true);
  };

  return (
    <section id="canonica" className="space-y-10">
      <header className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">4. Camada Canônica</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">
              Esta etapa transforma os campos da fonte já escolhida em schema Canopi para uso operacional em lote.
            </p>
          </div>
          <Badge className="bg-slate-900 text-white font-black py-2 px-4 rounded-xl">
            {reviewedCount}/{totalFields} campos revisados
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-900">
            Não é cadastro manual de conta. Aqui você revisa o schema Canopi derivado da fonte selecionada.
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
            Estado local/simulado na sessão atual. Sem persistência em backend real nesta fase.
          </div>
        </div>
      </header>

      <Card className="border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Revisão local da sessão</p>
            <p className="text-sm font-medium text-slate-700">
              {canonicalMappingReviewed
                ? 'Mapeamento canônico revisado nesta sessão.'
                : 'Mapeamento ainda não revisado nesta sessão.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetCanonicalMappingToPreset}
              disabled={!selectedConnector}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restaurar padrão da fonte
            </button>
            <button
              type="button"
              onClick={handleMarkReviewed}
              disabled={!selectedConnector || totalFields === 0}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                canonicalMappingReviewed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {canonicalMappingReviewed ? 'Revisado' : 'Marcar revisão'}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campo da fonte</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campo canônico</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obrigatório</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso no pipeline</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso em matching</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso em score/classificação</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status de revisão</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {canonicalMapping.map((mapping) => (
              <tr key={`${mapping.nativeField}-${mapping.canonicalField}`} className="hover:bg-blue-50/30 transition-all">
                <td className="px-4 py-3 text-xs font-bold text-slate-700">{mapping.nativeField}</td>
                <td className="px-4 py-3 text-xs font-black text-slate-800 font-mono">{mapping.canonicalField}</td>
                <td className="px-4 py-3">
                  <Badge className={`${mapping.required ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'} border-none text-[9px] font-black uppercase`}>
                    {mapping.required ? 'Obrigatório' : 'Opcional'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  {resolvePipelineUsage(mapping.source)}
                </td>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  {resolveMatchingUsage(mapping.canonicalField)}
                </td>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  {resolveScoreUsage(mapping.isClassification)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${mapping.status === 'mapped' ? 'bg-emerald-100 text-emerald-700' : mapping.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border-none text-[9px] font-black uppercase`}>
                    {resolveReviewStatusLabel(mapping.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleRowReview(mapping.canonicalField, mapping.status)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-700 transition-all hover:border-slate-300"
                  >
                    {mapping.status === 'mapped' ? 'Reabrir revisão' : 'Revisar campo'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="border border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-sm font-medium text-slate-700">
            O schema revisado nesta etapa alimenta as revisões de Identidade/Dedupe e Classificação ABM/ABX nas próximas fases.
            Esta revisão ainda é local e não representa sincronização de backend.
          </p>
        </div>
      </Card>
    </section>
  );
}
