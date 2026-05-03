'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
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

const CANOPI_MAPPING: Record<string, Array<{ canopiAttr: string; sfField: string }>> = {
  Account: [
    { canopiAttr: 'Nome da conta', sfField: 'Name' },
    { canopiAttr: 'Site', sfField: 'Website' },
    { canopiAttr: 'Setor', sfField: 'Industry' },
    { canopiAttr: 'Tipo', sfField: 'Type' },
    { canopiAttr: 'Receita anual', sfField: 'AnnualRevenue' },
    { canopiAttr: 'Funcionários', sfField: 'NumberOfEmployees' },
    { canopiAttr: 'Dono', sfField: 'OwnerId' },
  ],
  Contact: [
    { canopiAttr: 'Nome', sfField: 'Name' },
    { canopiAttr: 'Email', sfField: 'Email' },
    { canopiAttr: 'Telefone', sfField: 'Phone' },
    { canopiAttr: 'Cargo', sfField: 'Title' },
    { canopiAttr: 'Departamento', sfField: 'Department' },
    { canopiAttr: 'Conta relacionada', sfField: 'AccountId' },
    { canopiAttr: 'Dono', sfField: 'OwnerId' },
  ],
  Opportunity: [
    { canopiAttr: 'Nome da oportunidade', sfField: 'Name' },
    { canopiAttr: 'Conta relacionada', sfField: 'AccountId' },
    { canopiAttr: 'Estágio', sfField: 'StageName' },
    { canopiAttr: 'Valor', sfField: 'Amount' },
    { canopiAttr: 'Fechamento', sfField: 'CloseDate' },
    { canopiAttr: 'Probabilidade', sfField: 'Probability' },
    { canopiAttr: 'Tipo', sfField: 'Type' },
    { canopiAttr: 'Dono', sfField: 'OwnerId' },
  ],
  Lead: [
    { canopiAttr: 'Nome', sfField: 'Name' },
    { canopiAttr: 'Empresa', sfField: 'Company' },
    { canopiAttr: 'Email', sfField: 'Email' },
    { canopiAttr: 'Telefone', sfField: 'Phone' },
    { canopiAttr: 'Cargo', sfField: 'Title' },
    { canopiAttr: 'Status', sfField: 'Status' },
    { canopiAttr: 'Origem', sfField: 'LeadSource' },
    { canopiAttr: 'Dono', sfField: 'OwnerId' },
  ],
  Campaign: [
    { canopiAttr: 'Nome da campanha', sfField: 'Name' },
    { canopiAttr: 'Tipo', sfField: 'Type' },
    { canopiAttr: 'Status', sfField: 'Status' },
    { canopiAttr: 'Início', sfField: 'StartDate' },
    { canopiAttr: 'Fim', sfField: 'EndDate' },
    { canopiAttr: 'Orçamento', sfField: 'BudgetedCost' },
    { canopiAttr: 'Custo real', sfField: 'ActualCost' },
    { canopiAttr: 'Receita esperada', sfField: 'ExpectedRevenue' },
    { canopiAttr: 'Ativa', sfField: 'IsActive' },
  ],
};

const STATUS_CONFIG: Record<
  SalesforceObjectStatus,
  { label: string; badgeCls: string; iconCls: string }
> = {
  available: {
    label: 'Disponível',
    badgeCls: 'bg-emerald-100 text-emerald-800',
    iconCls: 'text-emerald-600',
  },
  unavailable: {
    label: 'Indisponível',
    badgeCls: 'bg-slate-100 text-slate-600',
    iconCls: 'text-slate-400',
  },
  no_permission: {
    label: 'Sem permissão',
    badgeCls: 'bg-amber-100 text-amber-700',
    iconCls: 'text-amber-500',
  },
  error: {
    label: 'Erro',
    badgeCls: 'bg-red-100 text-red-700',
    iconCls: 'text-red-500',
  },
};

function StatusIcon({ status, className }: { status: SalesforceObjectStatus; className?: string }) {
  const cls = `h-4 w-4 shrink-0 ${STATUS_CONFIG[status].iconCls} ${className ?? ''}`;
  if (status === 'available') return <CheckCircle2 className={cls} />;
  if (status === 'no_permission') return <AlertCircle className={cls} />;
  return <XCircle className={cls} />;
}

function coverageBar(present: number, total: number) {
  if (total === 0) return null;
  const pct = Math.round((present / total) * 100);
  const color = pct === 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500">
        {present}/{total}
      </span>
    </div>
  );
}

function ObjectRow({ discovery }: { discovery: SalesforceObjectDiscovery }) {
  const [expanded, setExpanded] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const cfg = STATUS_CONFIG[discovery.status];
  const recTotal = discovery.recommendedFields.length + discovery.missingRecommendedFields.length;
  const fieldNameSet = new Set(discovery.fields.map((f) => f.name));
  const canopiMap = CANOPI_MAPPING[discovery.objectApiName] ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusIcon status={discovery.status} />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-900">{discovery.label}</span>
            <span className="ml-2 font-mono text-[10px] text-slate-400">{discovery.objectApiName}</span>
          </div>

          {discovery.readable && (
            <div className="hidden items-center gap-4 sm:flex">
              <span className="text-xs text-slate-400">
                <span className="font-bold text-slate-700">{discovery.fieldCount}</span> campos
              </span>
              {coverageBar(discovery.recommendedFields.length, recTotal)}
            </div>
          )}

          {!discovery.readable && discovery.message && (
            <span className="truncate text-xs text-slate-400">{discovery.message}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${cfg.badgeCls}`}
          >
            {cfg.label}
          </span>
          {discovery.readable && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
            >
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {expanded ? 'Recolher' : 'Detalhar'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile field summary */}
      {discovery.readable && (
        <div className="flex items-center gap-4 border-t border-slate-50 px-4 py-2 sm:hidden">
          <span className="text-xs text-slate-400">
            <span className="font-bold text-slate-700">{discovery.fieldCount}</span> campos
          </span>
          {coverageBar(discovery.recommendedFields.length, recTotal)}
        </div>
      )}

      {/* Expandable detail */}
      {expanded && discovery.readable && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
          {/* Recommended present */}
          {discovery.recommendedFields.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                ✓ Recomendados presentes ({discovery.recommendedFields.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {discovery.recommendedFields.map((f) => (
                  <span
                    key={f.name}
                    title={`${f.label} · ${f.type}`}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing recommended */}
          {discovery.missingRecommendedFields.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                ✗ Ausentes / não mapeáveis ({discovery.missingRecommendedFields.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {discovery.missingRecommendedFields.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-600 line-through decoration-amber-400"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Canopi mapping suggestions */}
          {canopiMap.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Mapeamento Canopi sugerido
              </p>
              <p className="mb-2 text-[10px] font-medium text-slate-400">
                Campos detectados via Salesforce describe · somente leitura na Canopi
              </p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                {canopiMap.map(({ canopiAttr, sfField }) => {
                  const exists = fieldNameSet.has(sfField);
                  return (
                    <div
                      key={sfField}
                      className="flex items-center justify-between gap-3 px-3 py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-xs font-medium text-slate-700">{canopiAttr}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            exists ? 'text-emerald-700' : 'text-slate-400 line-through'
                          }`}
                        >
                          {sfField}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase ${
                            exists ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                        >
                          {exists ? '✓' : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                Mapeamento editável será disponibilizado em versão futura.
              </p>
            </div>
          )}

          {/* All fields toggle */}
          <div>
            <button
              onClick={() => setShowAllFields((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              {showAllFields ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Todos os {discovery.fieldCount} campos disponíveis
            </button>

            {showAllFields && (
              <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {discovery.fields.map((f) => (
                    <span
                      key={f.name}
                      title={`${f.label} · ${f.type}`}
                      className="font-mono text-[9px] text-slate-500"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DiscoverySummary({ discoveries }: { discoveries: SalesforceObjectDiscovery[] }) {
  const available = discoveries.filter((d) => d.status === 'available').length;
  const noPermission = discoveries.filter((d) => d.status === 'no_permission').length;
  const unavailable = discoveries.filter(
    (d) => d.status === 'unavailable' || d.status === 'error',
  ).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
        <p className="text-xl font-black text-emerald-700">{available}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Disponíveis</p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center">
        <p className="text-xl font-black text-amber-600">{noPermission}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Sem permissão</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
        <p className="text-xl font-black text-slate-500">{unavailable}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Indisponíveis</p>
      </div>
    </div>
  );
}

export function SalesforceDiscovery({
  title = 'Discovery de objetos · Pré-sync',
  description = 'Lê metadados de Account, Contact, Opportunity, Lead e Campaign via describe.',
}: {
  title?: string;
  description?: string;
} = {}) {
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="text-sm font-medium text-slate-500">{description}</p>
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

      {/* Guardrail banner */}
      <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="text-xs font-black text-blue-900">
            Nenhum registro será importado nesta etapa.
          </p>
          <p className="text-xs font-medium text-blue-700">
            Este mapeamento prepara um sync futuro, mas ainda não sincroniza dados.
          </p>
        </div>
      </div>

      {/* States */}
      {state.phase === 'idle' && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-400">
            Clique em &ldquo;Executar discovery&rdquo; para mapear os objetos disponíveis na sua organização.
          </p>
        </div>
      )}

      {state.phase === 'loading' && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-400">
            Consultando metadados via Salesforce describe...
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
        <div className="space-y-4">
          <DiscoverySummary discoveries={state.discoveries} />

          <div className="space-y-2">
            {state.discoveries.map((d) => (
              <ObjectRow key={d.objectApiName} discovery={d} />
            ))}
          </div>

          <p className="text-[10px] font-medium text-slate-400">
            Discovery read-only · Sync não disponível nesta versão.
          </p>
        </div>
      )}
    </Card>
  );
}
