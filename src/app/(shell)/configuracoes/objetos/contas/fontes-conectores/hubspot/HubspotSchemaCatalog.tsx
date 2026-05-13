'use client';

import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { Badge, Button } from '@/src/components/ui';
import type {
  AccountSchemaDiscoveryResult,
  AccountSchemaProperty,
  HubSpotCompanyPopulationClass,
} from '@/src/lib/accountConnectionModel';

interface HubspotSchemaCatalogProps {
  schema: AccountSchemaDiscoveryResult;
}

const PREVIEW_FIELDS = [
  'name',
  'domain',
  'country',
  'website',
  'city',
  'state',
  'address',
  'phone',
  'industry',
  'lifecyclestage',
  'hubspot_owner_id',
  'annualrevenue',
  'numberofemployees',
  'hs_ideal_customer_profile',
  'hs_is_target_account',
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatTimestamp(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE_FORMATTER.format(date);
}

function escapeCsv(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /[,"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function summarizeOptions(property: AccountSchemaProperty) {
  if (!property.options?.length) return '—';
  if (property.optionsSummary) return property.optionsSummary;
  const preview = property.options.slice(0, 10).map((option) => `${option.label} | value=${option.value}`).join(' || ');
  return property.options.length > 10 ? `${preview} …(+${property.options.length - 10})` : preview;
}

function getPopulationClassLabel(classification: HubSpotCompanyPopulationClass) {
  switch (classification) {
    case 'POPULATE_NOW':
      return 'Popular agora';
    case 'POPULATE_IF_AVAILABLE':
      return 'Popular se disponível';
    case 'OPTION_FIELD_REVIEW':
      return 'Revisar opções';
    case 'SYSTEM_READ_ONLY':
      return 'Sistema/read-only';
    case 'HUBSPOT_CALCULATED':
      return 'Calculado';
    case 'HIDDEN_OR_INTERNAL':
      return 'Oculto/interno';
    case 'IGNORE_FOR_NOW':
      return 'Ignorar por enquanto';
    default:
      return classification;
  }
}

function badgeVariantForClass(classification: HubSpotCompanyPopulationClass): 'blue' | 'amber' | 'red' | 'emerald' | 'slate' | 'violet' {
  switch (classification) {
    case 'POPULATE_NOW':
      return 'emerald';
    case 'POPULATE_IF_AVAILABLE':
      return 'blue';
    case 'OPTION_FIELD_REVIEW':
      return 'amber';
    case 'HUBSPOT_CALCULATED':
      return 'violet';
    case 'HIDDEN_OR_INTERNAL':
      return 'slate';
    case 'SYSTEM_READ_ONLY':
      return 'slate';
    case 'CUSTOM_FIELD_CANDIDATE':
      return 'red';
    default:
      return 'slate';
  }
}

export function HubspotSchemaCatalog({ schema }: HubspotSchemaCatalogProps) {
  const properties = useMemo(() => schema.properties ?? [], [schema.properties]);

  const previewProperties = useMemo(() => {
    const byName = new Map(properties.map((property) => [property.name, property] as const));
    return PREVIEW_FIELDS.map((fieldName) => byName.get(fieldName)).filter(Boolean).slice(0, 15) as AccountSchemaProperty[];
  }, [properties]);

  const usefulPopulationCount = useMemo(
    () => properties.filter((property) => ['POPULATE_NOW', 'POPULATE_IF_AVAILABLE', 'OPTION_FIELD_REVIEW'].includes(property.canopiPopulationClass)).length,
    [properties]
  );

  const optionsFieldCount = useMemo(
    () => properties.filter((property) => (property.optionsCount ?? 0) > 0).length,
    [properties]
  );

  const technicalCount = useMemo(
    () => properties.filter((property) => ['SYSTEM_READ_ONLY', 'HUBSPOT_CALCULATED', 'HIDDEN_OR_INTERNAL', 'IGNORE_FOR_NOW'].includes(property.canopiPopulationClass)).length,
    [properties]
  );

  const handleExportCsv = () => {
    const rows = properties.map((property) => ({
      name: property.name,
      label: property.label,
      description: property.description || '',
      groupName: property.groupName || '',
      type: property.type,
      fieldType: property.fieldType,
      formField: property.formField ? 'true' : 'false',
      hidden: property.hidden ? 'true' : 'false',
      archived: property.archived ? 'true' : 'false',
      calculated: property.calculated ? 'true' : 'false',
      readOnlyValue: property.readOnlyValue ? 'true' : 'false',
      readOnlyDefinition: property.readOnlyDefinition ? 'true' : 'false',
      optionsCount: String(property.optionsCount ?? 0),
      optionsSummary: summarizeOptions(property),
      canopiPopulationClass: property.canopiPopulationClass,
      canopiPopulationReason: property.canopiPopulationReason,
    }));

    const headers = Object.keys(rows[0] || {
      name: '',
      label: '',
      description: '',
      groupName: '',
      type: '',
      fieldType: '',
      formField: '',
      hidden: '',
      archived: '',
      calculated: '',
      readOnlyValue: '',
      readOnlyDefinition: '',
      optionsCount: '',
      optionsSummary: '',
      canopiPopulationClass: '',
      canopiPopulationReason: '',
    });

    const csv = [headers.join(',')]
      .concat(rows.map((row) => headers.map((header) => escapeCsv((row as Record<string, string>)[header])).join(',')))
      .join('\n');

    downloadTextFile(`hubspot-companies-catalogo-${schema.loadedAt.slice(0, 10)}.csv`, csv, 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Catálogo de campos</p>
            <h4 className="text-lg font-black text-slate-900">{schema.count} propriedades carregadas</h4>
            <p className="max-w-4xl text-sm font-medium leading-relaxed text-slate-600">
              A Canopi identificou {schema.count} propriedades no HubSpot. Esta tela mostra uma prévia dos campos mais úteis para população e mapeamento. Para analisar todos os campos e montar uma massa mais completa, baixe o CSV completo.
            </p>
            <p className="text-xs font-medium text-slate-600">
              Exportações locais baseadas nos dados carregados nesta sessão.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">Leitura read-only</Badge>
            <Badge variant="slate">Prévia útil</Badge>
            <Badge variant="slate">CSV completo</Badge>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total de propriedades</p>
            <p className="mt-1 text-lg font-black text-slate-900">{schema.count}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Campos úteis para população</p>
            <p className="mt-1 text-lg font-black text-emerald-950">{usefulPopulationCount}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Campos com opções</p>
            <p className="mt-1 text-lg font-black text-blue-950">{optionsFieldCount}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Campos técnicos/sistema</p>
            <p className="mt-1 text-lg font-black text-slate-900">{technicalCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prévia útil</p>
            <h5 className="text-base font-black text-slate-900">Campos principais para população e mapeamento</h5>
          </div>
          <Badge variant="blue">{previewProperties.length} campos</Badge>
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-600">
          A prévia não limita a população. O CSV completo inclui campos úteis, históricos, lifecycle, cliente/ex-cliente, target account, analytics, sinais, opções controladas e campos técnicos. Use a classificação Canopi como orientação, não como trava.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-widest">Campo</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest">Label</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest">Grupo</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest">Classificação</th>
                <th className="px-4 py-3 font-bold uppercase tracking-widest">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {previewProperties.map((property) => (
                <tr key={property.name}>
                  <td className="px-4 py-3 align-top font-semibold text-slate-900">{property.name}</td>
                  <td className="px-4 py-3 align-top text-slate-600">{property.label}</td>
                  <td className="px-4 py-3 align-top text-slate-600">{property.groupName || '—'}</td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant={badgeVariantForClass(property.canopiPopulationClass)}>
                      {getPopulationClassLabel(property.canopiPopulationClass)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    <div className="space-y-1">
                      <p>{property.canopiPopulationReason}</p>
                      {property.optionsCount > 0 && (
                        <p className="text-[11px] text-slate-500">{property.optionsCount} opção(ões) controlada(s)</p>
                      )}
                      {property.readOnlyValue && <p className="text-[11px] text-slate-500">Campo read-only no schema.</p>}
                    </div>
                  </td>
                </tr>
              ))}

              {previewProperties.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    Nenhum campo prioritário encontrado no schema carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-950">
            A prévia não limita a população. O CSV completo inclui campos úteis, históricos, lifecycle, cliente/ex-cliente, target account, analytics, sinais, opções controladas e campos técnicos. Use a classificação Canopi como orientação, não como trava.
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-amber-900">
            Antes de importar dados na HubSpot, revise campos read-only, calculados, ocultos e campos com opções controladas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Exportação</p>
            <p className="text-sm font-medium text-slate-600">
              Baixe um CSV completo com {properties.length} campos e metadados úteis para análise em planilha.
            </p>
          </div>

          <Button variant="primary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExportCsv}>
            Baixar CSV completo dos campos
          </Button>
        </div>
      </div>
    </div>
  );
}
