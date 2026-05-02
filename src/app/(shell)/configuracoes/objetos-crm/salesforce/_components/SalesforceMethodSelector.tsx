'use client';

import React, { useState } from 'react';
import { FileJson, KeyRound, Network } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';

type SalesforceMethod = 'oauth' | 'token' | 'csv';

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
    panel: {
      lines: [
        'Validação controlada de leitura.',
        'Será usado apenas para testar acesso à instância e leitura de metadados do objeto Account.',
        'Nenhum token deve ser persistido nesta etapa.',
      ],
    },
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

export function SalesforceMethodSelector() {
  const [selected, setSelected] = useState<SalesforceMethod>('oauth');

  const activeMethod = METHODS.find((m) => m.id === selected)!;

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
        <ul className="mt-4 space-y-2">
          {activeMethod.panel.lines.map((line) => (
            <li
              key={line}
              className={`text-sm font-medium leading-relaxed ${
                selected === 'oauth'
                  ? 'text-blue-800'
                  : selected === 'token'
                  ? 'text-amber-900'
                  : 'text-slate-700'
              }`}
            >
              {line}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
