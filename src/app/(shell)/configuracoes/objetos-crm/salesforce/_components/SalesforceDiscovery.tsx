'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Card } from '@/src/components/ui';

type SalesforceObjectStatus = 'available' | 'unavailable' | 'no_permission' | 'error';

interface SalesforceFieldMeta {
  name: string;
  label: string;
  type: string;
  nillable: boolean;
  updateable: boolean;
  createable: boolean;
  calculated: boolean;
}

interface SalesforceObjectDiscovery {
  objectApiName: string;
  label: string;
  status: SalesforceObjectStatus;
  readable: boolean;
  fieldCount: number;
  fields: SalesforceFieldMeta[];
  recommendedFields: SalesforceFieldMeta[];
  missingRecommendedFields: string[];
  message?: string;
}

type DiscoveryState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; discoveries: SalesforceObjectDiscovery[] }
  | { phase: 'error'; message: string };

function StatusBadge({ status }: { status: SalesforceObjectStatus }) {
  const map: Record<SalesforceObjectStatus, { label: string; className: string }> = {
    available: { label: 'Disponível', className: 'bg-emerald-100 text-emerald-800' },
    unavailable: { label: 'Indisponível', className: 'bg-slate-200 text-slate-700' },
    no_permission: { label: 'Sem permissão', className: 'bg-amber-100 text-amber-800' },
    error: { label: 'Erro', className: 'bg-red-100 text-red-700' },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${className}`}>
      {label}
    </span>
  );
}

function ObjectCard({ discovery }: { discovery: SalesforceObjectDiscovery }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    available: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    unavailable: <XCircle className="h-4 w-4 text-slate-400" />,
    no_permission: <AlertCircle className="h-4 w-4 text-amber-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  }[discovery.status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <p className="text-sm font-black text-slate-900">
              {discovery.label}
              <span className="ml-2 font-mono text-[10px] font-medium text-slate-400">
                {discovery.objectApiName}
              </span>
            </p>
            {discovery.readable && (
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {discovery.fieldCount} campos · {discovery.recommendedFields.length} recomendados presentes
                {discovery.missingRecommendedFields.length > 0 && (
                  <span className="ml-1 text-amber-600">
                    · {discovery.missingRecommendedFields.length} ausentes
                  </span>
                )}
              </p>
            )}
            {discovery.message && (
              <p className="mt-0.5 text-xs font-medium text-slate-500">{discovery.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={discovery.status} />
          {discovery.readable && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-700"
            >
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              {expanded ? 'Recolher' : 'Campos'}
            </button>
          )}
        </div>
      </div>

      {expanded && discovery.readable && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {discovery.recommendedFields.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Campos recomendados presentes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {discovery.recommendedFields.map((f) => (
                  <span
                    key={f.name}
                    title={`${f.label} · ${f.type}`}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-800"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {discovery.missingRecommendedFields.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">
                Campos recomendados ausentes / não mapeáveis
              </p>
              <div className="flex flex-wrap gap-1.5">
                {discovery.missingRecommendedFields.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[10px] font-bold text-amber-700 line-through"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Todos os campos disponíveis ({discovery.fieldCount})
            </p>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-wrap gap-1">
                {discovery.fields.map((f) => (
                  <span
                    key={f.name}
                    title={`${f.label} · ${f.type}`}
                    className="rounded px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-500"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SalesforceDiscovery() {
  const [state, setState] = useState<DiscoveryState>({ phase: 'idle' });

  async function runDiscovery() {
    setState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/discovery', {
        method: 'POST',
        cache: 'no-store',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const msg =
          body.error === 'NOT_CONFIGURED'
            ? 'OAuth não configurado. Configure as credenciais antes de executar o discovery.'
            : body.error === 'NOT_CONNECTED'
              ? 'Salesforce não está conectado. Conecte via OAuth antes de executar o discovery.'
              : 'Não foi possível executar o discovery no momento.';
        setState({ phase: 'error', message: msg });
        return;
      }
      const data = (await res.json()) as { discoveries: SalesforceObjectDiscovery[] };
      setState({ phase: 'done', discoveries: data.discoveries });
    } catch {
      setState({ phase: 'error', message: 'Erro inesperado ao conectar com o servidor.' });
    }
  }

  return (
    <Card className="rounded-3xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Discovery read-only · Pré-sync</h3>
          <p className="text-sm font-medium text-slate-600">
            Lê metadados de Account, Contact e Opportunity via describe. Nenhum registro é importado.
          </p>
        </div>
        <button
          onClick={runDiscovery}
          disabled={state.phase === 'loading'}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.phase === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {state.phase === 'loading' ? 'Consultando...' : 'Executar discovery'}
        </button>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div className="space-y-0.5">
          <p className="text-xs font-black text-blue-900">
            Nenhum registro será importado nesta etapa.
          </p>
          <p className="text-xs font-medium text-blue-700">
            Este mapeamento prepara um sync futuro, mas ainda não sincroniza dados.
          </p>
        </div>
      </div>

      {state.phase === 'idle' && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-400">
            Clique em &quot;Executar discovery&quot; para consultar os objetos disponíveis na sua organização Salesforce.
          </p>
        </div>
      )}

      {state.phase === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">{state.message}</p>
        </div>
      )}

      {state.phase === 'done' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Objetos detectados
          </p>
          {state.discoveries.map((d) => (
            <ObjectCard key={d.objectApiName} discovery={d} />
          ))}
          <p className="pt-1 text-[10px] font-medium text-slate-400">
            Lead foi excluído intencionalmente deste recorte. Sync não disponível nesta versão.
          </p>
        </div>
      )}
    </Card>
  );
}
