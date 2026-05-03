'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card } from '@/src/components/ui';

type PreviewValue = string | number | boolean | null;

interface ObjectPreviewResult {
  objectApiName: string;
  label: string;
  limit: number;
  totalSize: number;
  fields: string[];
  records: Record<string, PreviewValue>[];
  status: 'success' | 'error';
  error: string | null;
  testedAt: string;
}

interface PreviewApiResponse {
  status: string;
  provider: string;
  requestedAt?: string;
  objects?: ObjectPreviewResult[];
  error?: string;
}

type PreviewState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; results: ObjectPreviewResult[]; requestedAt: string }
  | { phase: 'error'; message: string };

const ENTITY_ORDER = ['Account', 'Contact', 'Opportunity', 'Lead', 'Campaign'];

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCellValue(value: PreviewValue): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') return value.toLocaleString('pt-BR');
  const str = String(value).trim();
  if (!str) return '—';
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    try {
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(str));
    } catch {
      return str;
    }
  }
  return str;
}

function EntityCard({ result }: { result: ObjectPreviewResult }) {
  const success = result.status === 'success';

  return (
    <div className={`rounded-2xl border p-4 ${success ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          )}
          <span className="text-sm font-black text-slate-900">{result.objectApiName}</span>
          {success && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
              {result.records.length} registro{result.records.length !== 1 ? 's' : ''}
            </span>
          )}
          {!success && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-700">
              Erro
            </span>
          )}
        </div>
        {success && result.totalSize > result.records.length && (
          <span className="text-[10px] font-medium text-slate-500">
            mostrando {result.records.length} de {result.totalSize.toLocaleString('pt-BR')} total
          </span>
        )}
      </div>

      {!success && result.error && (
        <p className="mt-2 text-xs font-medium text-red-700">{result.error}</p>
      )}

      {success && result.records.length === 0 && (
        <p className="mt-2 text-xs font-medium text-slate-500">Nenhum registro encontrado nesta organização.</p>
      )}

      {success && result.records.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {result.fields.map((f) => (
                  <th
                    key={f}
                    className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500"
                  >
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.records.map((record, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                >
                  {result.fields.map((f) => (
                    <td
                      key={f}
                      className="max-w-[200px] truncate whitespace-nowrap px-3 py-2 text-xs font-medium text-slate-700"
                      title={formatCellValue(record[f])}
                    >
                      {formatCellValue(record[f])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {success && (
        <p className="mt-2 text-[10px] font-medium text-slate-400">
          Consultado em {formatDate(result.testedAt)}
        </p>
      )}
    </div>
  );
}

interface SalesforceMultiEntityPreviewProps {
  oauthConnected: boolean;
}

export function SalesforceMultiEntityPreview({ oauthConnected }: SalesforceMultiEntityPreviewProps) {
  const [state, setState] = useState<PreviewState>({ phase: 'idle' });

  async function handleLoad() {
    if (!oauthConnected) return;
    setState({ phase: 'loading' });

    try {
      const objects = ENTITY_ORDER.join(',');
      const res = await fetch(
        `/api/account-connectors/salesforce/oauth/preview?objects=${objects}&limit=5`,
        { cache: 'no-store' },
      );
      const data = (await res.json()) as PreviewApiResponse;

      if (!res.ok || data.status === 'error') {
        setState({ phase: 'error', message: data.error ?? 'Não foi possível carregar o preview multi-entidade.' });
        return;
      }

      const ordered = (data.objects ?? []).sort(
        (a, b) => ENTITY_ORDER.indexOf(a.objectApiName) - ENTITY_ORDER.indexOf(b.objectApiName),
      );
      setState({ phase: 'done', results: ordered, requestedAt: data.requestedAt ?? new Date().toISOString() });
    } catch {
      setState({ phase: 'error', message: 'Não foi possível carregar o preview multi-entidade.' });
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900">Preview read-only multi-entidade</p>
          <p className="text-sm font-medium text-slate-600">
            Amostra pequena e somente leitura de registros reais de Account, Contact, Opportunity, Lead e Campaign via OAuth persistido.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoad}
          disabled={!oauthConnected || state.phase === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.phase === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          {state.phase === 'loading' ? 'Carregando...' : 'Carregar preview multi-entidade'}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardrails</p>
        <ul className="mt-2 space-y-1 text-xs font-medium text-slate-600">
          <li>• Somente leitura.</li>
          <li>• Não importa registros para a Canopi.</li>
          <li>• Não grava no Supabase.</li>
          <li>• Não executa sync real.</li>
          <li>• Não altera camada canônica.</li>
          <li>• Não faz dedupe real.</li>
          <li>• Não faz writeback.</li>
          <li>• Não usa Bulk API.</li>
        </ul>
      </div>

      {!oauthConnected && state.phase === 'idle' && (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Conecte o Salesforce via OAuth para ativar este preview.
        </p>
      )}

      {state.phase === 'error' && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-bold text-red-700">{state.message}</p>
        </div>
      )}

      {state.phase === 'done' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Resultado — {state.results.filter((r) => r.status === 'success').length} de {state.results.length} entidades com sucesso
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              Consultado em {formatDate(state.requestedAt)}
            </p>
          </div>
          {state.results.map((result) => (
            <EntityCard key={result.objectApiName} result={result} />
          ))}
        </div>
      )}
    </Card>
  );
}
