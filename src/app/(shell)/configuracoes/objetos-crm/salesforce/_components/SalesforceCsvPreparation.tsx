'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ColumnRecognitionType = 'salesforce' | 'alternative' | 'unrecognized';
type ColumnAction = 'suggest' | 'override' | 'ignore';

interface CsvColumnReading {
  header: string;
  recognitionType: ColumnRecognitionType;
  canopiLabel: string;
  observation: string;
  exampleValues: string[];
}

interface ColumnAdjustment {
  action: ColumnAction;
  overrideField: string;
}

interface CsvAnalysis {
  fileName: string;
  fileSizeBytes: number;
  headers: string[];
  previewRows: Record<string, string>[];
  rowCount: number;
  delimiter: string;
  columnReadings: CsvColumnReading[];
  warnings: string[];
  compatibility: 'alta' | 'parcial' | 'baixa';
  recognizedCount: number;
  alternativeCount: number;
  unrecognizedCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SALESFORCE_FIELDS: Record<string, string> = {
  id: 'Account Id',
  name: 'Account Name',
  type: 'Account Type',
  industry: 'Industry',
  website: 'Website',
  phone: 'Phone',
  ownerid: 'Owner',
  createddate: 'Created Date',
  lastmodifieddate: 'Last Modified Date',
  billingcity: 'Billing City',
  billingstate: 'Billing State',
  billingcountry: 'Billing Country',
};

const ALTERNATIVE_FIELDS: Record<string, string> = {
  account_name: 'Nome da conta para preview',
  domain: 'Domínio',
  owner_name: 'Owner local',
  lifecycle_stage: 'Estágio local',
  updated_at: 'Atualização local',
  cnpj: 'Documento local',
  segment: 'Segmento local',
  company_size: 'Tamanho da empresa',
  annual_revenue_brl: 'Receita estimada local',
  country: 'País',
  region: 'Região',
  source_system: 'Sistema de origem',
  intent_score: 'Score de intenção',
  priority_tier: 'Tier de prioridade',
  open_opportunity_value_brl: 'Valor de oportunidade local',
  last_signal_type: 'Tipo do último sinal',
  last_signal_date: 'Data do último sinal',
  local_notes: 'Notas locais',
};

const SALESFORCE_FIELD_LABELS = new Set(Object.values(SALESFORCE_FIELDS));
const ALTERNATIVE_FIELD_LABELS = new Set(Object.values(ALTERNATIVE_FIELDS));

// Grupo A — Nome da conta
const REQUIRED_GROUP_A_LABELS = new Set(['Account Name', 'Nome da conta para preview']);
// Grupo B — Identificação ou desambiguação
const REQUIRED_GROUP_B_LABELS = new Set(['Account Id', 'Domínio', 'Website', 'Documento local']);
// Union para badge "Obrigatório" na tabela
const ALL_REQUIRED_LABELS = new Set([...REQUIRED_GROUP_A_LABELS, ...REQUIRED_GROUP_B_LABELS]);

const TARGET_FIELD_GROUPS: { group: string; fields: string[] }[] = [
  { group: 'Salesforce Account', fields: Object.values(SALESFORCE_FIELDS) },
  { group: 'Canopi local', fields: Object.values(ALTERNATIVE_FIELDS) },
];

const RECOMMENDED_FIELDS = [
  'Industry', 'Owner', 'Type',
  'BillingCity', 'BillingState', 'BillingCountry',
  'Segmento local', 'Estágio local', 'Receita estimada local',
];

const EXAMPLE_CSV = [
  'Id,Name,Type,Industry,Website,Phone,OwnerId,CreatedDate,LastModifiedDate,BillingCity,BillingState,BillingCountry',
  '001Axxxxxxxxxxxxxxxxx,Acme Corp,Customer,Technology,https://acmecorp.com,+55 11 90000-0001,005Axxxxxxxxxxxxxxxxx,2024-01-15T10:00:00Z,2024-03-22T14:30:00Z,São Paulo,SP,Brazil',
  '001Bxxxxxxxxxxxxxxxxx,Global Industries,Prospect,Manufacturing,https://globalind.com,+55 11 90000-0002,005Bxxxxxxxxxxxxxxxxx,2024-02-01T09:00:00Z,2024-04-10T11:00:00Z,Rio de Janeiro,RJ,Brazil',
  '001Cxxxxxxxxxxxxxxxxx,TechStart Ltda,Partner,Software,https://techstart.com.br,+55 11 90000-0003,005Cxxxxxxxxxxxxxxxxx,2024-03-05T08:00:00Z,2024-04-30T16:00:00Z,Curitiba,PR,Brazil',
].join('\n');

const STEPS = ['Requisitos', 'Upload', 'Leitura', 'Confirmar'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectDelimiter(line: string): { char: string; label: string } {
  const counts = {
    ',': (line.match(/,/g) ?? []).length,
    ';': (line.match(/;/g) ?? []).length,
    '\t': (line.match(/\t/g) ?? []).length,
  };
  const max = Math.max(...Object.values(counts));
  if (max === 0) return { char: ',', label: 'vírgula' };
  if (counts[';'] === max) return { char: ';', label: 'ponto e vírgula' };
  if (counts['\t'] === max) return { char: '\t', label: 'tabulação' };
  return { char: ',', label: 'vírgula' };
}

function splitCsvField(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (line.slice(i, i + delimiter.length) === delimiter) {
        fields.push(current.trim()); current = ''; i += delimiter.length - 1;
      } else current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function classifyColumn(header: string): {
  recognitionType: ColumnRecognitionType;
  canopiLabel: string;
  observation: string;
} {
  const key = header.toLowerCase().trim();
  if (SALESFORCE_FIELDS[key]) {
    let observation = 'Campo padrão do Salesforce Account.';
    if (key === 'id') observation = 'Chave padrão Salesforce Account.';
    else if (key === 'name') observation = 'Nome padrão da conta Salesforce.';
    return { recognitionType: 'salesforce', canopiLabel: SALESFORCE_FIELDS[key], observation };
  }
  if (ALTERNATIVE_FIELDS[key]) {
    const observation = key === 'account_name'
      ? 'Alternativa local para leitura visual. Não cria mapeamento canônico.'
      : 'Campo local aceito para preview.';
    return { recognitionType: 'alternative', canopiLabel: ALTERNATIVE_FIELDS[key], observation };
  }
  return {
    recognitionType: 'unrecognized',
    canopiLabel: '—',
    observation: 'Coluna mantida apenas no preview desta sessão.',
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function parseCsvAndAnalyze(
  text: string,
  fileSizeBytes: number,
  fileName: string,
): { analysis: CsvAnalysis | null; blockingErrors: string[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const nonEmpty = lines.filter((l) => l.trim() !== '');
  if (nonEmpty.length === 0) return { analysis: null, blockingErrors: ['O arquivo está vazio.'] };

  const { char: delim, label: delimLabel } = detectDelimiter(nonEmpty[0]);
  const headers = splitCsvField(nonEmpty[0], delim).map((h) => h.trim());

  const blockingErrors: string[] = [];
  if (headers.length === 0) blockingErrors.push('Nenhum cabeçalho detectado no arquivo.');

  const seen = new Set<string>();
  const duplicates: string[] = [];
  headers.forEach((h) => { if (seen.has(h)) duplicates.push(h); else seen.add(h); });
  if (duplicates.length > 0) blockingErrors.push(`Colunas duplicadas: ${duplicates.join(', ')}.`);
  if (blockingErrors.length > 0) return { analysis: null, blockingErrors };

  const dataLines = nonEmpty.slice(1);
  const rowCount = dataLines.length;
  let inconsistentRows = 0;
  const previewRows: Record<string, string>[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const values = splitCsvField(dataLines[i], delim);
    if (values.length !== headers.length) inconsistentRows++;
    if (i < 5) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() ?? ''; });
      previewRows.push(row);
    }
  }

  const columnReadings: CsvColumnReading[] = headers.map((header) => {
    const classification = classifyColumn(header);
    const exampleValues = previewRows
      .map((row) => row[header] ?? '')
      .filter((v) => v.trim() !== '')
      .slice(0, 2);
    return { header, ...classification, exampleValues };
  });

  const hasId = headers.some((h) => h.toLowerCase() === 'id');
  const hasName = headers.some((h) => h.toLowerCase() === 'name');
  const hasAccountName = headers.some((h) => h.toLowerCase() === 'account_name');
  const compatibility: CsvAnalysis['compatibility'] =
    hasId && hasName ? 'alta' : (hasId || hasName || hasAccountName) ? 'parcial' : 'baixa';

  const warnings: string[] = [];
  if (!hasId && !hasName) {
    warnings.push('CSV lido, mas não parece seguir o formato padrão de exportação Account do Salesforce.');
  } else {
    if (!hasId) warnings.push('Coluna "Id" não encontrada. O identificador único é necessário para distinguir registros.');
    if (!hasName && !hasAccountName) warnings.push('Coluna "Name" não encontrada. O nome da conta não estará visível no preview.');
    if (hasAccountName && !hasName) warnings.push('"account_name" reconhecida como alternativa local para leitura visual. Não representa mapeamento canônico.');
  }
  if (inconsistentRows > 0) warnings.push(`${inconsistentRows} linha(s) com número de colunas diferente do cabeçalho.`);
  if (rowCount === 0) warnings.push('Nenhuma linha de dados encontrada após o cabeçalho.');

  const recognizedCount = columnReadings.filter((c) => c.recognitionType === 'salesforce').length;
  const alternativeCount = columnReadings.filter((c) => c.recognitionType === 'alternative').length;
  const unrecognizedCount = columnReadings.filter((c) => c.recognitionType === 'unrecognized').length;

  return {
    blockingErrors: [],
    analysis: {
      fileName, fileSizeBytes, headers, previewRows, rowCount, delimiter: delimLabel,
      columnReadings, warnings, compatibility, recognizedCount, alternativeCount, unrecognizedCount,
    },
  };
}

function getEffectiveLabel(col: CsvColumnReading, adj: ColumnAdjustment): string {
  if (adj.action === 'ignore') return '—';
  if (adj.action === 'override') return adj.overrideField;
  return col.canopiLabel;
}

function getEffectiveType(col: CsvColumnReading, adj: ColumnAdjustment): ColumnRecognitionType | 'ignored' {
  if (adj.action === 'ignore') return 'ignored';
  if (adj.action === 'override') {
    if (!adj.overrideField) return 'unrecognized';
    if (SALESFORCE_FIELD_LABELS.has(adj.overrideField)) return 'salesforce';
    if (ALTERNATIVE_FIELD_LABELS.has(adj.overrideField)) return 'alternative';
    return 'unrecognized';
  }
  return col.recognitionType;
}

function buildInitialAdjustments(columnReadings: CsvColumnReading[]): Record<string, ColumnAdjustment> {
  const adj: Record<string, ColumnAdjustment> = {};
  for (const col of columnReadings) {
    adj[col.header] = { action: 'suggest', overrideField: '' };
  }
  return adj;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesforceCsvPreparation() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [blockingErrors, setBlockingErrors] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, ColumnAdjustment>>({});
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const derivedCounters = React.useMemo(() => {
    if (!analysis) return { recognized: 0, alternative: 0, unrecognized: 0, ignored: 0 };
    let recognized = 0, alternative = 0, unrecognized = 0, ignored = 0;
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      const eff = getEffectiveType(col, adj);
      if (eff === 'salesforce') recognized++;
      else if (eff === 'alternative') alternative++;
      else if (eff === 'unrecognized') unrecognized++;
      else ignored++;
    }
    return { recognized, alternative, unrecognized, ignored };
  }, [analysis, adjustments]);

  // Two required groups computed live from user adjustments
  const requiredGroups = React.useMemo(() => {
    if (!analysis) return { groupA: false, groupB: false, allMet: false };
    let groupA = false;
    let groupB = false;
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      const label = getEffectiveLabel(col, adj);
      if (REQUIRED_GROUP_A_LABELS.has(label)) groupA = true;
      if (REQUIRED_GROUP_B_LABELS.has(label)) groupB = true;
    }
    return { groupA, groupB, allMet: groupA && groupB };
  }, [analysis, adjustments]);

  const confirmationSummary = React.useMemo(() => {
    if (!analysis) return null;
    const used: string[] = [];
    const ignored: string[] = [];
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      if (adj.action === 'ignore') {
        ignored.push(col.header);
      } else {
        const label = getEffectiveLabel(col, adj);
        used.push(label !== '—' ? `${col.header} → ${label}` : col.header);
      }
    }
    return { used, ignored };
  }, [analysis, adjustments]);

  const phase = confirmed ? 4 : analysis ? 3 : 2;
  const canConfirm = requiredGroups.allMet && blockingErrors.length === 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAnalysis(null);
    setBlockingErrors([]);
    setConfirmed(false);
    setAdjustments({});
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBlockingErrors(['O arquivo deve ter extensão .csv.']);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBlockingErrors(['O arquivo excede 5 MB. Reduza o tamanho antes de continuar.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text.trim()) { setBlockingErrors(['O arquivo está vazio.']); return; }
        const result = parseCsvAndAnalyze(text, file.size, file.name);
        if (result.blockingErrors.length > 0) { setBlockingErrors(result.blockingErrors); return; }
        if (result.analysis) {
          setAnalysis(result.analysis);
          setAdjustments(buildInitialAdjustments(result.analysis.columnReadings));
        }
      } catch {
        setBlockingErrors(['Erro inesperado ao processar o arquivo CSV.']);
      }
    };
    reader.readAsText(file);
  }

  function handleClear() {
    setAnalysis(null);
    setBlockingErrors([]);
    setConfirmed(false);
    setAdjustments({});
    if (inputRef.current) inputRef.current.value = '';
  }

  function updateAdjustment(header: string, patch: Partial<ColumnAdjustment>) {
    setAdjustments((prev) => ({ ...prev, [header]: { ...prev[header], ...patch } }));
  }

  function downloadExample() {
    const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canopi_salesforce_account_exemplo.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-5 space-y-6">

      {/* ── Stepper ── */}
      <div className="flex items-center">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const done = stepNum < phase;
          const current = stepNum === phase;
          return (
            <React.Fragment key={label}>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                  done ? 'bg-emerald-600 text-white' :
                  current ? 'bg-slate-900 text-white' :
                  'border border-slate-300 bg-white text-slate-400'
                }`}>
                  {done ? '✓' : stepNum}
                </div>
                <span className={`whitespace-nowrap text-[10px] font-bold ${
                  done ? 'text-emerald-700' : current ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`mb-4 mx-2 flex-1 border-t ${done ? 'border-emerald-400' : 'border-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── BLOCO 1: Requisitos ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <p className="text-sm font-black text-slate-900">Requisitos do CSV Salesforce Account</p>

        {/* Obrigatórios */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Obrigatórios para confirmação local
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-black text-slate-800">Nome da conta</p>
              <div className="flex flex-wrap gap-1.5">
                {['Account Name', 'Nome da conta para preview'].map((f) => (
                  <span key={f} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Pelo menos um desses campos deve estar presente e não ignorado.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-black text-slate-800">Identificação ou desambiguação</p>
              <div className="flex flex-wrap gap-1.5">
                {['Account Id', 'Domínio', 'Website', 'Documento local'].map((f) => (
                  <span key={f} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Pelo menos um desses campos garante identificação ou desambiguação na leitura local.
              </p>
            </div>
          </div>
        </div>

        {/* Recomendados */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Recomendados para melhor leitura
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RECOMMENDED_FIELDS.map((f) => (
              <span key={f} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
                {f}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-slate-500">
            Campos adicionais enriquecem a leitura local sem serem obrigatórios para confirmar.
          </p>
        </div>
      </div>

      {/* ── BLOCO 2: Upload ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Arquivo CSV</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100">
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            Selecionar CSV
          </label>
          <button
            type="button"
            onClick={downloadExample}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar CSV exemplo
          </button>
          <span className="text-[11px] text-slate-500">Apenas .csv · Máximo 5 MB · leitura local para preview</span>
        </div>
      </div>

      {/* ── Erros bloqueantes ── */}
      {blockingErrors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm font-black text-red-900">Arquivo não pode ser processado</p>
          </div>
          <ul className="space-y-1 pl-6">
            {blockingErrors.map((err) => (
              <li key={err} className="text-sm font-medium text-red-800">• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Estado: arquivo carregado ── */}
      {analysis && (
        <div className="space-y-5">

          {/* BLOCO 3: Resumo do arquivo */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <p className="text-sm font-black text-slate-900">Arquivo analisado localmente</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  {([
                    ['Arquivo', analysis.fileName],
                    ['Tamanho', formatFileSize(analysis.fileSizeBytes)],
                    ['Colunas', String(analysis.headers.length)],
                    ['Linhas de dados', String(analysis.rowCount)],
                    ['Delimitador', analysis.delimiter],
                    ['Preview exibido', `${analysis.previewRows.length} linha(s)`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${
                    analysis.compatibility === 'alta' ? 'bg-emerald-100' :
                    analysis.compatibility === 'parcial' ? 'bg-amber-100' : 'bg-red-100'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Compatibilidade:
                    </span>
                    <span className={`text-sm font-black ${
                      analysis.compatibility === 'alta' ? 'text-emerald-800' :
                      analysis.compatibility === 'parcial' ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {analysis.compatibility}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Campos obrigatórios:
                    </span>
                    <span className={`text-sm font-black ${requiredGroups.allMet ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {requiredGroups.allMet ? 'atendidos' : 'pendentes'}
                    </span>
                  </div>
                  {requiredGroups.allMet ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2 text-[10px] font-black text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Campos obrigatórios atendidos
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Campos obrigatórios pendentes
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600"
                title="Limpar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Avisos */}
          {analysis.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-black text-amber-900">Avisos</p>
              <ul className="space-y-1">
                {analysis.warnings.map((w) => (
                  <li key={w} className="text-sm font-medium text-amber-800">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* BLOCO 4: Leitura das colunas — editável */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">Ajuste local de leitura</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  Preparação local · não cria campos · não salva configuração
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {derivedCounters.recognized > 0 && (
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    {derivedCounters.recognized} reconhecida{derivedCounters.recognized !== 1 ? 's' : ''}
                  </span>
                )}
                {derivedCounters.alternative > 0 && (
                  <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                    {derivedCounters.alternative} alternativa{derivedCounters.alternative !== 1 ? 's' : ''} local{derivedCounters.alternative !== 1 ? 'ais' : ''}
                  </span>
                )}
                {derivedCounters.unrecognized > 0 && (
                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                    {derivedCounters.unrecognized} não reconhecida{derivedCounters.unrecognized !== 1 ? 's' : ''}
                  </span>
                )}
                {derivedCounters.ignored > 0 && (
                  <span className="rounded-lg border border-slate-300 bg-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-500">
                    {derivedCounters.ignored} ignorada{derivedCounters.ignored !== 1 ? 's' : ''}
                  </span>
                )}
                {analysis.warnings.length > 0 && (
                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                    {analysis.warnings.length} aviso{analysis.warnings.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Coluna do arquivo', 'Exemplos', 'Campo sugerido', 'Ação', 'Status', 'Observação'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.columnReadings.map((col, idx) => {
                    const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
                    const effType = getEffectiveType(col, adj);
                    const effLabel = getEffectiveLabel(col, adj);
                    const isIgnored = adj.action === 'ignore';
                    const isRequired = !isIgnored && ALL_REQUIRED_LABELS.has(effLabel);

                    return (
                      <tr
                        key={col.header}
                        className={`border-b border-slate-100 ${isIgnored ? 'opacity-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        {/* Coluna do arquivo */}
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-bold text-slate-900">
                          {col.header}
                        </td>
                        {/* Exemplos */}
                        <td className="px-3 py-2.5 text-xs">
                          {col.exampleValues.length > 0
                            ? col.exampleValues.map((v, i) => (
                                <span key={i} className="mr-1 inline-block max-w-[90px] truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                                  {v}
                                </span>
                              ))
                            : <span className="text-slate-400">—</span>}
                        </td>
                        {/* Campo sugerido / override select */}
                        <td className="min-w-[170px] px-3 py-2.5">
                          {adj.action === 'override' ? (
                            <select
                              value={adj.overrideField}
                              onChange={(e) => updateAdjustment(col.header, { overrideField: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            >
                              <option value="">Selecionar campo...</option>
                              {TARGET_FIELD_GROUPS.map((group) => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.fields.map((field) => (
                                    <option key={field} value={field}>{field}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs ${isIgnored ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {col.canopiLabel}
                            </span>
                          )}
                        </td>
                        {/* Ação */}
                        <td className="min-w-[145px] px-3 py-2.5">
                          <select
                            value={adj.action}
                            onChange={(e) => {
                              const newAction = e.target.value as ColumnAction;
                              updateAdjustment(col.header, {
                                action: newAction,
                                overrideField: newAction === 'override' ? adj.overrideField : '',
                              });
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          >
                            <option value="suggest">Usar sugestão</option>
                            <option value="override">Trocar campo</option>
                            <option value="ignore">Ignorar coluna</option>
                          </select>
                        </td>
                        {/* Status */}
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            {effType === 'ignored' ? (
                              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                Ignorada
                              </span>
                            ) : effType === 'salesforce' ? (
                              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                Reconhecida
                              </span>
                            ) : effType === 'alternative' ? (
                              <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                                Alternativa local
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                                Não reconhecida
                              </span>
                            )}
                            {isRequired && (
                              <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                                Obrigatório
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Observação */}
                        <td className="max-w-[200px] px-3 py-2.5 text-[11px] text-slate-500">
                          {isIgnored
                            ? 'Coluna ignorada nesta preparação local. Não será considerada.'
                            : adj.action === 'override' && !adj.overrideField
                              ? 'Selecione um campo de destino acima.'
                              : adj.action === 'override'
                                ? `Ajuste local de leitura para "${effLabel}". Não cria campos.`
                                : col.observation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCO 5: Preview das primeiras linhas */}
          {analysis.previewRows.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <p className="text-sm font-black text-slate-900">Primeiras linhas do arquivo</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100">
                      {analysis.headers.slice(0, 8).map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">
                          {h}
                        </th>
                      ))}
                      {analysis.headers.length > 8 && (
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          +{analysis.headers.length - 8} col.
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.previewRows.map((row, idx) => (
                      <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        {analysis.headers.slice(0, 8).map((h) => (
                          <td key={h} className="max-w-[140px] truncate px-3 py-2 text-xs text-slate-700">
                            {row[h] || '—'}
                          </td>
                        ))}
                        {analysis.headers.length > 8 && (
                          <td className="px-3 py-2 text-xs text-slate-400">…</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Preview local: {analysis.previewRows.length} de {analysis.rowCount} linha(s). Sem persistência: leitura e ajuste local apenas nesta sessão.
              </p>
            </div>
          )}

          {/* BLOCO 6: Gate de campos obrigatórios + botão confirmar */}
          {!confirmed && (
            <div className="space-y-3">
              {/* Alerta amigável quando requisitos pendentes */}
              {!requiredGroups.allMet && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-black text-amber-900">
                        Antes de confirmar, ajuste os campos obrigatórios
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-amber-800">
                        Para confirmar a preparação local, a Canopi precisa identificar pelo menos o nome da conta e uma chave de identificação ou desambiguação.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {([
                      {
                        key: 'groupA',
                        label: 'Nome da conta',
                        met: requiredGroups.groupA,
                        resolve: 'Selecione uma coluna como Account Name ou Nome da conta para preview.',
                      },
                      {
                        key: 'groupB',
                        label: 'Identificação da conta',
                        met: requiredGroups.groupB,
                        resolve: 'Selecione uma coluna como Account Id, Domínio, Website ou Documento local.',
                      },
                    ] as { key: string; label: string; met: boolean; resolve: string }[]).map(({ key, label, met, resolve }) => (
                      <div
                        key={key}
                        className={`rounded-xl border px-4 py-3 ${met ? 'border-emerald-200 bg-white' : 'border-amber-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          {met ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                          )}
                          <p className={`text-sm font-black ${met ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {label}
                          </p>
                          <span className={`ml-auto text-[10px] font-black uppercase tracking-widest ${met ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {met ? 'Atendido' : 'Pendente'}
                          </span>
                        </div>
                        {!met && (
                          <p className="mt-1.5 pl-6 text-[11px] font-medium text-amber-800">
                            {resolve}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setConfirmed(true)}
                disabled={!canConfirm}
                title={!canConfirm ? 'Ajuste os campos obrigatórios para confirmar' : undefined}
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar CSV para esta sessão
              </button>

              {!canConfirm && (
                <p className="text-center text-[11px] font-medium text-slate-500">
                  Confirmação bloqueada até os campos obrigatórios serem atendidos.
                </p>
              )}
            </div>
          )}

          {/* BLOCO 7: Resumo pós-confirmação */}
          {confirmed && confirmationSummary && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-emerald-900">CSV confirmado para esta sessão</p>
                    <p className="text-[11px] font-medium leading-relaxed text-emerald-800">
                      A Canopi concluiu a preparação local para esta sessão. Sem persistência e sem atualização no Salesforce.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-emerald-200 pt-4 sm:grid-cols-4">
                  {([
                    ['Arquivo', analysis.fileName],
                    ['Linhas', String(analysis.rowCount)],
                    ['Compatibilidade', analysis.compatibility],
                    ['Nome da conta', 'Atendido'],
                    ['Identificação da conta', 'Atendida'],
                    ['Colunas usadas', String(confirmationSummary.used.length)],
                    ['Colunas ignoradas', String(confirmationSummary.ignored.length)],
                    ['Reconhecidas', String(derivedCounters.recognized)],
                    ['Alternativas locais', String(derivedCounters.alternative)],
                    ...(derivedCounters.unrecognized > 0 ? ([['Não reconhecidas', String(derivedCounters.unrecognized)]] as [string, string][]) : []),
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-emerald-900">{value}</p>
                    </div>
                  ))}
                </div>
                {confirmationSummary.ignored.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-white/60 px-4 py-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      Colunas ignoradas nesta preparação
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {confirmationSummary.ignored.map((col) => (
                        <span key={col} className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Próximos recortes previstos
                </p>
                <div className="space-y-2">
                  {([
                    ['2C.3', 'Requisitos avançados e arquivo exemplo'],
                    ['2C.4', 'Mapeamento local de colunas'],
                    ['2C.5', 'Revisão final da preparação local'],
                  ] as [string, string][]).map(([step, label]) => (
                    <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 opacity-50">
                      <span className="w-8 shrink-0 text-[10px] font-black text-slate-500">{step}</span>
                      <span className="flex-1 text-sm font-medium text-slate-600">{label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Previsto</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
