'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, FileJson, KeyRound, Loader2, Network, XCircle } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { SalesforceCsvPreparation } from './SalesforceCsvPreparation';

type SalesforceMethod = 'oauth' | 'token' | 'csv';
type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface MethodDefinition {
  id: SalesforceMethod;
  title: string;
  description: string;
  badge: string;
  badgeVariant: 'blue' | 'amber' | 'slate';
  icon: React.ReactNode;
  panel: {
    lines: string[];
  };
}

interface AccountField {
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
  isUpdateable: boolean;
  isCreateable?: boolean;
  isCustom?: boolean;
}

interface TestSuccessResult {
  status: 'success';
  provider: string;
  testedAt: string;
  instanceUrl: string;
  apiVersion: string;
  accountLabel: string;
  accountFieldsCount: number;
  readAccessConfirmed: boolean;
  accountFields?: AccountField[];
}


const METHODS: MethodDefinition[] = [
  {
    id: 'oauth',
    title: 'OAuth / External Client App',
    description: 'Método recomendado para conexão real futura com política de autorização por aplicativo.',
    badge: 'Recomendado',
    badgeVariant: 'blue',
    icon: <Network className="h-4 w-4" />,
    panel: {
      lines: [
        'Método recomendado para conexão real futura.',
        'Use uma External Client App no Salesforce para controlar autorização, escopos e acesso via OAuth 2.0.',
        'Connected Apps existentes podem ser tratados como compatibilidade, mas novas configurações devem priorizar External Client App.',
      ],
    },
  },
  {
    id: 'token',
    title: 'Token temporário',
    description: 'Validação controlada de acesso e leitura para verificar objeto, campos e permissão da fonte.',
    badge: 'Validação',
    badgeVariant: 'amber',
    icon: <KeyRound className="h-4 w-4" />,
    panel: { lines: [] },
  },
  {
    id: 'csv',
    title: 'CSV exportado',
    description: 'Alternativa de entrada local para a fonte Salesforce, sem criar conector global separado.',
    badge: 'Local',
    badgeVariant: 'slate',
    icon: <FileJson className="h-4 w-4" />,
    panel: {
      lines: [
        'Entrada local a partir de exportação do Salesforce.',
        'Serve como alternativa de análise local sem criar conector global separado.',
        'Não deve reativar CSV fora da página dedicada do CRM.',
      ],
    },
  },
];

const BADGE_CLASSES: Record<MethodDefinition['badgeVariant'], string> = {
  blue: 'border-none bg-blue-100 text-blue-700',
  amber: 'border-none bg-amber-100 text-amber-700',
  slate: 'border-none bg-slate-100 text-slate-600',
};

const CHECKLIST_ITEMS = [
  'Instância acessível',
  'API habilitada',
  'Objeto Account encontrado',
  'Metadados lidos',
  'Campos disponíveis',
];

function formatTestedAt(iso: string): string {
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

export function SalesforceMethodSelector() {
  const [selected, setSelected] = useState<SalesforceMethod>('oauth');

  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  const [apiVersion, setApiVersion] = useState('v66.0');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [result, setResult] = useState<TestSuccessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMethod = METHODS.find((m) => m.id === selected)!;

  async function handleTest() {
    if (!instanceUrl.trim() || !token.trim()) {
      setErrorMessage('Informe a URL da sua instância Salesforce e um token temporário válido para testar a leitura do Account.');
      return;
    }

    setTestStatus('loading');
    setResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/account-connectors/salesforce/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceUrl, token, apiVersion }),
      });
      const data = (await res.json()) as { status: string; error?: string } & Partial<TestSuccessResult>;

      if (data.status === 'success') {
        setResult(data as TestSuccessResult);
        setTestStatus('success');
      } else {
        setErrorMessage(data.error ?? 'Não foi possível validar a conexão.');
        setTestStatus('error');
      }
    } catch {
      setErrorMessage('Não foi possível alcançar o servidor.');
      setTestStatus('error');
    }
  }

  function handleClear() {
    setInstanceUrl('');
    setToken('');
    setApiVersion('v66.0');
    setTestStatus('idle');
    setResult(null);
    setErrorMessage(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {METHODS.map((method) => {
          const isActive = method.id === selected;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelected(method.id)}
              className={`group w-full rounded-3xl border p-6 text-left transition-all ${
                isActive
                  ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}
                >
                  {method.icon}
                </div>
                <Badge
                  className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${BADGE_CLASSES[method.badgeVariant]}`}
                >
                  {method.badge}
                </Badge>
              </div>
              <h3
                className={`mt-4 text-base font-black transition-colors ${
                  isActive ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-800'
                }`}
              >
                {method.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {method.description}
              </p>
            </button>
          );
        })}
      </div>

      <Card
        className={`rounded-3xl border p-6 transition-all ${
          selected === 'oauth'
            ? 'border-blue-200 bg-blue-50'
            : selected === 'token'
            ? 'border-amber-200 bg-amber-50'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-xl ${
              selected === 'oauth'
                ? 'bg-blue-100 text-blue-700'
                : selected === 'token'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {activeMethod.icon}
          </div>
          <p
            className={`text-sm font-black ${
              selected === 'oauth'
                ? 'text-blue-900'
                : selected === 'token'
                ? 'text-amber-900'
                : 'text-slate-800'
            }`}
          >
            {activeMethod.title}
          </p>
        </div>

        {selected === 'token' ? (
          <div className="mt-5 space-y-5">
            <p className="text-sm font-medium text-amber-900">
              Use um token temporário apenas para validar leitura do objeto Account. Nada será salvo.
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Instance URL
                </label>
                <input
                  type="text"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  placeholder="https://sua-instancia.my.salesforce.com"
                  disabled={testStatus === 'loading'}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Access Token temporário
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole o access token aqui"
                  disabled={testStatus === 'loading'}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  API Version
                </label>
                <input
                  type="text"
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder="v66.0"
                  disabled={testStatus === 'loading'}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 disabled:opacity-50"
                />
              </div>
            </div>

            {testStatus === 'idle' && errorMessage && (
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            )}

            <button
              type="button"
              onClick={handleTest}
              disabled={testStatus === 'loading'}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
              {testStatus === 'loading' ? 'Validando leitura do Account...' : 'Testar leitura do Account'}
            </button>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Validações</p>
              <ul className="space-y-1.5">
                {CHECKLIST_ITEMS.map((item) => {
                  let icon: React.ReactNode;
                  let textClass: string;

                  if (testStatus === 'idle') {
                    icon = <Circle className="h-4 w-4 shrink-0 text-amber-300" />;
                    textClass = 'text-amber-700';
                  } else if (testStatus === 'loading') {
                    icon = <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />;
                    textClass = 'text-amber-800';
                  } else if (testStatus === 'success') {
                    icon = <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />;
                    textClass = 'text-emerald-800';
                  } else {
                    icon = <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
                    textClass = 'text-red-700';
                  }

                  return (
                    <li key={item} className="flex items-center gap-2">
                      {icon}
                      <span className={`text-sm font-medium ${textClass}`}>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {testStatus === 'success' && result && (
              <div className="space-y-4">
                <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-black text-emerald-900">Leitura do Account validada</p>
                  <dl className="space-y-1">
                    {(
                      [
                        ['Instância validada', result.instanceUrl],
                        ['API version', result.apiVersion],
                        ['Objeto', result.accountLabel],
                        ['Campos disponíveis', String(result.accountFieldsCount)],
                        ['Leitura confirmada', 'Sim'],
                        ['Testado em', formatTestedAt(result.testedAt)],
                      ] as [string, string][]
                    ).map(([label, value]) => (
                      <div key={label} className="flex items-baseline gap-2">
                        <dt className="shrink-0 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          {label}:
                        </dt>
                        <dd className="break-all text-sm font-medium text-emerald-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {Array.isArray(result.accountFields) && result.accountFields.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">Campos detectados em Account</p>
                      <p className="mt-1 text-[11px] font-medium text-slate-600 leading-relaxed">
                        Esta visualização mostra apenas metadados do objeto Account. Nenhum registro real é lido, salvo ou sincronizado.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-100">
                            <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Nome
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Label
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Tipo
                            </th>
                            <th className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Obrigatório
                            </th>
                            <th className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Editável
                            </th>
                            <th className="px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                              Customizado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.accountFields.map((field, idx) => (
                            <tr
                              key={field.name}
                              className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                            >
                              <td className="px-3 py-2 text-sm font-mono text-slate-900">{field.name}</td>
                              <td className="px-3 py-2 text-sm text-slate-800">{field.label}</td>
                              <td className="px-3 py-2 text-sm text-slate-700">
                                <Badge className="border-none bg-slate-200 text-slate-700 text-[10px] font-bold uppercase px-2 py-1">
                                  {field.type}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {field.isRequired ? (
                                  <Badge className="border-none bg-red-100 text-red-700 text-[10px] font-bold uppercase px-2 py-1">
                                    Obrigatório
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Opcional</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {field.isUpdateable ? (
                                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" title="Editável" />
                                ) : (
                                  <span className="inline-block h-2 w-2 rounded-full bg-slate-300" title="Somente leitura" />
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {field.isCustom && (
                                  <Badge className="border-none bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2 py-1">
                                    Custom
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {Array.isArray(result.accountFields) && result.accountFields.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Nenhum campo foi retornado para visualização.</p>
                  </div>
                )}
              </div>
            )}

            {testStatus === 'error' && errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-black text-red-900">Não foi possível validar a conexão</p>
                <p className="mt-1 text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            )}

            {(testStatus === 'success' || testStatus === 'error') && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-amber-600 underline underline-offset-2 hover:text-amber-800"
              >
                Limpar dados do teste
              </button>
            )}
          </div>
        ) : selected === 'csv' ? (
          <SalesforceCsvPreparation />
        ) : (
          <ul className="mt-4 space-y-2">
            {activeMethod.panel.lines.map((line) => (
              <li
                key={line}
                className={`text-sm font-medium leading-relaxed ${
                  selected === 'oauth' ? 'text-blue-800' : 'text-slate-700'
                }`}
              >
                {line}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
