'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheckBig, Download, Loader2, Send } from 'lucide-react';
import { Badge, Button, Card } from '@/src/components/ui';
import type {
  HubspotWritebackCompanyRecord,
  HubspotWritebackContactRecord,
  HubspotWritebackDryRunResult,
} from '@/src/lib/hubspotWritebackTypes';

interface HubspotWritebackImportProps {
  canWriteHubspot: boolean;
  missingWriteScopes: string[];
}

type WritebackPhase = 'idle' | 'analyzing' | 'ready' | 'blocked' | 'prepared' | 'error';
type PreviewTab = 'companies' | 'contacts' | 'associations';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

function formatContactName(contact: HubspotWritebackContactRecord) {
  return [contact.firstname, contact.lastname].filter(Boolean).join(' ').trim() || contact.email || `Contato ${contact.sourceRowIndex + 1}`;
}

function buildReviewCsv(analysis: HubspotWritebackDryRunResult) {
  const rows = [
    ...analysis.companies.map((company) => ({
      record_type: 'company',
      source_row_index: String(company.sourceRowIndex + 1),
      canopi_company_id: company.canopi_company_id,
      canopi_contact_id: '',
      name: company.name,
      domain: company.domain || '',
      website: company.website || '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      jobtitle: '',
      associated_canopi_company_id: '',
      associated_company_name: '',
      associated_company_domain: '',
      association_source: '',
      association_confidence: '',
      blocked_reason: '',
      simulated_fields: company.simulatedFields.join(' | '),
    })),
    ...analysis.contacts.map((contact) => ({
      record_type: 'contact',
      source_row_index: String(contact.sourceRowIndex + 1),
      canopi_company_id: contact.associated_canopi_company_id || '',
      canopi_contact_id: contact.canopi_contact_id,
      name: formatContactName(contact),
      domain: '',
      website: '',
      firstname: contact.firstname || '',
      lastname: contact.lastname || '',
      email: contact.email || '',
      phone: contact.phone || '',
      jobtitle: contact.jobtitle || '',
      associated_canopi_company_id: contact.associated_canopi_company_id || '',
      associated_company_name: contact.associated_company_name || '',
      associated_company_domain: contact.associated_company_domain || '',
      association_source: contact.association_source || '',
      association_confidence: contact.association_confidence,
      blocked_reason: contact.blocked_reason || '',
      simulated_fields: contact.simulatedFields.join(' | '),
    })),
  ];

  const headers = Object.keys(rows[0] || {
    record_type: '',
    source_row_index: '',
    canopi_company_id: '',
    canopi_contact_id: '',
    name: '',
    domain: '',
    website: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    jobtitle: '',
    associated_canopi_company_id: '',
    associated_company_name: '',
    associated_company_domain: '',
    association_source: '',
    association_confidence: '',
    blocked_reason: '',
    simulated_fields: '',
  });

  return [headers.join(',')]
    .concat(rows.map((row) => headers.map((header) => escapeCsv((row as Record<string, string>)[header])).join(',')))
    .join('\n');
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function MiniTable({
  title,
  rows,
  columns,
  emptyLabel,
}: {
  title: string;
  rows: Array<Record<string, string>>;
  columns: Array<{ key: string; label: string }>;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h5 className="text-sm font-black text-slate-900">{title}</h5>
        <Badge variant="slate">{rows.length}</Badge>
      </div>
      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2 font-bold uppercase tracking-widest">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2 text-slate-600">
                      {row[column.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}

function FileSlot({
  label,
  description,
  file,
  status,
  onChange,
}: {
  label: string;
  description: string;
  file: File | null;
  status: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <Badge variant={file ? 'emerald' : 'slate'}>{status}</Badge>
      </div>
      <input
        type="file"
        accept=".csv,.xlsx,.xlsm"
        onChange={(event) => {
          onChange(event.target.files?.[0] || null);
          event.currentTarget.value = '';
        }}
        className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white hover:file:bg-black"
      />
      <p className="text-xs font-medium text-slate-500">{description}</p>
      <p className="text-xs font-medium text-slate-600">
        {file ? `${file.name} · ${formatFileSize(file.size)}` : 'Aguardando arquivo'}
      </p>
    </label>
  );
}

export function HubspotWritebackImport({ canWriteHubspot, missingWriteScopes }: HubspotWritebackImportProps) {
  const [companiesFile, setCompaniesFile] = useState<File | null>(null);
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<HubspotWritebackDryRunResult | null>(null);
  const [phase, setPhase] = useState<WritebackPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('companies');
  const requestSequence = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const hasCompaniesFile = Boolean(companiesFile);
  const hasContactsFile = Boolean(contactsFile);
  const hasAnyFile = hasCompaniesFile || hasContactsFile;
  const isDualUpload = hasCompaniesFile && hasContactsFile;
  const summary = analysis?.summary;
  const blockerCount = analysis?.blockers.length ?? 0;
  const duplicateCount = summary ? summary.duplicateCompanies + summary.duplicateContacts : 0;
  const reviewCount = summary?.reviewCount ?? 0;
  const readyCount = summary ? summary.readyForSendCompanies + summary.readyForSendContacts : 0;
  const totalContacts = summary?.contactsIdentified ?? 0;
  const scopeMessage = useMemo(() => {
    if (canWriteHubspot) {
      return 'A conexão atual permite preparar o envio. A escrita real continua fora deste recorte.';
    }
    if (missingWriteScopes.length === 0) {
      return 'Reconecte HubSpot com permissão de escrita para liberar o writeback assistido.';
    }
    return `Scopes ausentes: ${missingWriteScopes.join(', ')}.`;
  }, [canWriteHubspot, missingWriteScopes]);

  const uploadModeLabel = useMemo(() => {
    if (isDualUpload) return 'Analisando empresas e contatos';
    if (hasCompaniesFile) return 'Analisando base de empresas';
    if (hasContactsFile) return 'Analisando base de contatos';
    return 'Aguardando arquivos';
  }, [hasCompaniesFile, hasContactsFile, isDualUpload]);

  const phaseLabel = useMemo(() => {
    if (!hasAnyFile) return 'Aguardando arquivos';
    if (phase === 'analyzing') return uploadModeLabel;
    if (phase === 'ready') return 'Análise atualizada';
    if (phase === 'blocked') return 'Existem registros que precisam de correção';
    if (phase === 'prepared') return 'Pronto para envio';
    if (phase === 'error') return 'Não foi possível analisar a base';
    return uploadModeLabel;
  }, [hasAnyFile, phase, uploadModeLabel]);

  useEffect(() => {
    abortRef.current?.abort();

    if (!hasAnyFile) {
      requestSequence.current += 1;
      setAnalysis(null);
      setError(null);
      setPrepared(false);
      setPhase('idle');
      setPreviewTab('companies');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestSequence.current;

    setAnalysis(null);
    setError(null);
    setPrepared(false);
    setPhase('analyzing');
    setPreviewTab('companies');

    const run = async () => {
      try {
        const formData = new FormData();
        if (companiesFile && contactsFile) {
          formData.append('companiesFile', companiesFile);
          formData.append('contactsFile', contactsFile);
        } else if (companiesFile) {
          formData.append('companiesFile', companiesFile);
        } else if (contactsFile) {
          formData.append('contactsFile', contactsFile);
        }

        const response = await fetch('/api/account-connectors/hubspot/writeback/dry-run', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);
        if (controller.signal.aborted || requestId !== requestSequence.current) return;

        if (!response.ok || !payload || payload.status !== 'success') {
          setAnalysis(null);
          setError(payload?.error || 'Não foi possível analisar a base.');
          setPhase('error');
          return;
        }

        setAnalysis(payload as HubspotWritebackDryRunResult);
        setError(null);
        setPhase(payload.blockers?.length > 0 ? 'blocked' : 'ready');
      } catch (caughtError) {
        if (controller.signal.aborted || requestId !== requestSequence.current) return;
        setAnalysis(null);
        setError(caughtError instanceof Error && caughtError.name === 'AbortError' ? null : 'Não foi possível analisar a base.');
        setPhase(caughtError instanceof Error && caughtError.name === 'AbortError' ? 'idle' : 'error');
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [companiesFile, contactsFile, hasAnyFile]);

  const handleDownloadReviewCsv = () => {
    if (!analysis) return;
    setIsDownloading(true);
    try {
      const csv = buildReviewCsv(analysis);
      downloadTextFile(`hubspot-writeback-revisao-${analysis.analyzedAt.slice(0, 10)}.csv`, csv, 'text/csv');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrepareSend = () => {
    if (!analysis || !canWriteHubspot || blockerCount > 0 || readyCount === 0) return;
    setPrepared(true);
    setPhase('prepared');
  };

  const slotStatus = (file: File | null) => {
    if (!file) return 'Aguardando';
    if (phase === 'analyzing') return 'Analisando';
    if (phase === 'ready' || phase === 'blocked' || phase === 'prepared') return 'Análise atualizada';
    if (phase === 'error') return 'Erro';
    return 'Carregado';
  };

  const previewRows =
    previewTab === 'companies'
      ? analysis?.previewCompanies.slice(0, 5).map((company) => ({
          campo: company.canopi_company_id,
          label: company.name,
          grupo: company.domain || '—',
          classificacao: company.isDuplicate ? 'Duplicada' : 'Única',
          observacao: company.simulatedFields.join(' | ') || '—',
        })) || []
      : previewTab === 'contacts'
        ? analysis?.previewContacts.slice(0, 5).map((contact) => ({
            campo: contact.canopi_contact_id,
            label: formatContactName(contact),
            grupo: contact.associated_company_name || '—',
            classificacao: contact.association_confidence,
            observacao: contact.blocked_reason || contact.association_source || '—',
          })) || []
        : analysis?.previewAssociations.slice(0, 5).map((association) => ({
            campo: association.contactName,
            label: association.companyName,
            grupo: association.contactEmail || '—',
            classificacao: association.association_confidence,
            observacao: association.association_source || '—',
          })) || [];

  const previewColumns =
    previewTab === 'companies'
      ? [
          { key: 'campo', label: 'ID Canopi' },
          { key: 'label', label: 'Nome' },
          { key: 'grupo', label: 'Domínio' },
          { key: 'classificacao', label: 'Classificação' },
          { key: 'observacao', label: 'Observação' },
        ]
      : previewTab === 'contacts'
        ? [
            { key: 'campo', label: 'ID Canopi' },
            { key: 'label', label: 'Contato' },
            { key: 'grupo', label: 'Empresa' },
            { key: 'classificacao', label: 'Confiança' },
            { key: 'observacao', label: 'Observação' },
          ]
        : [
            { key: 'campo', label: 'Contato' },
            { key: 'label', label: 'Empresa' },
            { key: 'grupo', label: 'E-mail' },
            { key: 'classificacao', label: 'Confiança' },
            { key: 'observacao', label: 'Origem' },
          ];

  const previewTitle =
    previewTab === 'companies'
      ? 'Empresas'
      : previewTab === 'contacts'
        ? 'Contatos'
        : 'Associações';

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">HubSpot Writeback Assistido</p>
              <h3 className="text-2xl font-black text-slate-950">Importar base para HubSpot</h3>
              <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
                Suba a base de empresas e, se houver, a base de contatos. A Canopi preserva o vínculo contato → empresa usando IDs Canopi, não apenas domínio de e-mail.
              </p>
            </div>
            <Badge
              variant={
                phase === 'prepared'
                  ? 'emerald'
                  : phase === 'blocked'
                    ? 'amber'
                    : phase === 'error'
                      ? 'red'
                      : phase === 'analyzing'
                        ? 'blue'
                        : 'slate'
              }
            >
              {phaseLabel}
            </Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FileSlot
              label="Base de empresas"
              description="Aceita CSV, XLSX ou XLSM. Se esta for a única base, ela será tratada como base de empresas."
              file={companiesFile}
              status={slotStatus(companiesFile)}
              onChange={(file) => setCompaniesFile(file)}
            />

            <FileSlot
              label="Base de contatos"
              description="Use quando contatos e empresas estiverem em arquivos separados. Colunas de empresa servem só para associação e referência."
              file={contactsFile}
              status={slotStatus(contactsFile)}
              onChange={(file) => setContactsFile(file)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600">
            {hasAnyFile ? (
              <p>{uploadModeLabel}. O resultado sempre reflete apenas os arquivos atualmente selecionados.</p>
            ) : (
              <p>Aguardando arquivos. Ao selecionar uma base, a análise é executada automaticamente.</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200 bg-white">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resumo consolidado</p>
              <h4 className="text-xl font-black text-slate-950">Prévia do dry-run atual</h4>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Empresas únicas, contatos, vínculos válidos e bloqueios aparecem consolidados sem acumular resultados antigos.
              </p>
            </div>
            <Badge variant={blockerCount > 0 ? 'amber' : 'slate'}>{analysis ? 'Resultado atual' : 'Sem análise'}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Empresas únicas" value={summary?.companiesIdentified ?? 0} />
            <MetricCard label="Contatos" value={totalContacts} />
            <MetricCard label="Associados" value={summary?.contactsAssociated ?? 0} />
            <MetricCard label="Bloqueados" value={summary?.blockedContacts ?? 0} />
          </div>

          {analysis?.warnings?.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Aviso</p>
              <ul className="mt-2 space-y-1">
                {analysis.warnings.slice(0, 4).map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis?.blockers?.length ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">Bloqueios</p>
              <ul className="mt-2 space-y-1">
                {analysis.blockers.map((blocker) => (
                  <li key={blocker}>• {blocker}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="border border-slate-200 bg-white">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prévia curta</p>
              <h4 className="text-xl font-black text-slate-950">Empresas, contatos e associações</h4>
              <p className="mt-1 text-sm font-medium text-slate-600">
                A prévia mostra apenas uma amostra útil. O dry-run completo continua disponível no CSV de revisão.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'companies', label: 'Empresas' },
                { key: 'contacts', label: 'Contatos' },
                { key: 'associations', label: 'Associações' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPreviewTab(tab.key as PreviewTab)}
                  className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                    previewTab === tab.key
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {analysis ? (
            <MiniTable
              title={previewTitle}
              rows={previewRows}
              columns={previewColumns}
              emptyLabel={`Nenhuma prévia disponível para ${previewTitle.toLowerCase()}.`}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
              A prévia será exibida automaticamente depois que a análise terminar.
            </div>
          )}
        </div>
      </Card>

      <Card className="border border-slate-200 bg-white">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Próxima ação</p>
              <h4 className="text-xl font-black text-slate-950">Preparar revisão</h4>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Exporte o CSV de revisão e confirme os vínculos antes de preparar o envio.
              </p>
            </div>
            <Badge variant={canWriteHubspot ? 'emerald' : 'slate'}>{canWriteHubspot ? 'Escrita disponível' : 'Escrita bloqueada'}</Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadReviewCsv}
              disabled={!analysis || isDownloading}
              icon={isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            >
              Baixar CSV de revisão
            </Button>
            <Button
              variant="primary"
              onClick={handlePrepareSend}
              disabled={!analysis || !canWriteHubspot || blockerCount > 0 || readyCount === 0}
              icon={prepared ? <CircleCheckBig className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            >
              Enviar para HubSpot
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-600">
            {canWriteHubspot ? (
              <p>Preparação local pronta. A escrita real continua fora deste recorte.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-slate-700">
                  Envio bloqueado por permissão. Reconecte o HubSpot com escopos de escrita para liberar o writeback.
                </p>
                <p>{scopeMessage}</p>
                <p className="text-xs text-slate-500">
                  A reconexão continua disponível no card superior de validação.
                </p>
              </div>
            )}
          </div>

          {prepared ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-950">
              Preparação concluída. Nenhuma escrita real foi executada neste recorte.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {error}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
