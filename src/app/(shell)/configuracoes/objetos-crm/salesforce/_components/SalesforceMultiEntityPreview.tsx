'use client';

import React, { useState, useMemo, useRef } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, CheckSquare, ClipboardList, Eye, Loader2, MinusSquare, ShieldCheck, Square, XCircle, Zap } from 'lucide-react';
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

type SyncPreviewState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: any }
  | { phase: 'error'; message: string };

type EligibilityStatus = 'valid' | 'alert' | 'blocked';

interface EligibilityResult {
  status: EligibilityStatus;
  alerts: string[];
}

type SelectionMap = Record<string, string[]>;

interface ContractRecord {
  id: string;
  displayName: string;
  eligibilityStatus: EligibilityStatus;
  eligibilityAlerts: string[];
  fieldValues: Record<string, PreviewValue>;
}

interface ContractEntity {
  objectApiName: string;
  label: string;
  selectedCount: number;
  validCount: number;
  alertCount: number;
  blockedCount: number;
  selectedRecords: ContractRecord[];
}

interface ContractSummary {
  totalSelected: number;
  totalValid: number;
  totalAlert: number;
  totalBlocked: number;
  estimatedRecordsToProcess: number;
}

interface SalesforceMultiEntityContract {
  createdAt: string;
  source: 'salesforce-oauth';
  mode: 'local-multi-entity-contract';
  entitiesInScope: string[];
  referenceSamples: {
    accountIds: string[];
  };
  summary: ContractSummary;
  entities: ContractEntity[];
}

type DryRunRecordStatus = 'valid' | 'missing' | 'permission-error' | 'other-error';

interface DryRunRecord {
  id: string;
  displayName: string;
  status: DryRunRecordStatus;
  reason?: string;
}

interface DryRunEntityResult {
  objectApiName: string;
  label: string;
  selectedCount: number;
  validCount: number;
  missingCount: number;
  permissionErrorCount: number;
  otherErrorCount: number;
  records: DryRunRecord[];
}

interface DryRunResult {
  status: 'success' | 'error';
  dryRunAt: string;
  executionTimeMs: number;
  results: DryRunEntityResult[];
  summary: {
    totalChecked: number;
    totalValid: number;
    totalMissing: number;
    totalPermissionError: number;
    totalOtherError: number;
    estimatedRecordsCanSync: number;
    estimatedRecordsWillFail: number;
  };
}

type DryRunState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: DryRunResult }
  | { phase: 'error'; message: string };

type SyncContractState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; contractId: string; estimatedRecordsCanSync: number }
  | { phase: 'error'; message: string };

// ─── Mapeamento Canônico (C4.5) ────────────────────────────────────────────────

interface CanonicalFieldMap {
  source_external_id: string;
  nome: string;
  dominio: string;
  segmento: string;
  tipo: string;
}

interface AccountSamplePreview {
  source_external_id: string | null;
  nome: string | null;
  dominio: string | null;
  segmento: string | null;
  tipo: string | null;
}

type CanonicalMappingState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; updatedAt: string }
  | { phase: 'error'; message: string };

const ENTITY_ORDER = ['Account', 'Contact', 'Opportunity', 'Lead', 'Campaign'];

const STATUS_STYLES: Record<EligibilityStatus, { row: string; badge: string; label: string }> = {
  valid: { row: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800', label: 'Válido' },
  alert: { row: 'bg-amber-50/40', badge: 'bg-amber-100 text-amber-700', label: 'Alertas' },
  blocked: { row: 'bg-red-50/40', badge: 'bg-red-100 text-red-700', label: 'Bloqueado' },
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
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

function getStr(record: Record<string, PreviewValue>, field: string): string {
  const v = record[field];
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function assessEligibility(
  objectApiName: string,
  record: Record<string, PreviewValue>,
  accountIds: Set<string>,
): EligibilityResult {
  const id = getStr(record, 'Id');
  const name = getStr(record, 'Name');

  switch (objectApiName) {
    case 'Account': {
      if (!id || !name) return { status: 'blocked', alerts: ['Id ou Name ausente.'] };
      const alerts: string[] = [];
      if (!getStr(record, 'Website')) alerts.push('Website ausente.');
      if (!getStr(record, 'Industry')) alerts.push('Industry ausente.');
      return { status: alerts.length ? 'alert' : 'valid', alerts };
    }
    case 'Contact': {
      const email = getStr(record, 'Email');
      const accountId = getStr(record, 'AccountId');
      if (!id || !name || !email) return { status: 'blocked', alerts: ['Id, Name ou Email ausente.'] };
      const alerts: string[] = [];
      if (!accountId) {
        alerts.push('AccountId ausente.');
      } else if (!accountIds.has(accountId)) {
        alerts.push('AccountId não encontrado na amostra de Accounts carregada.');
      }
      return { status: alerts.length ? 'alert' : 'valid', alerts };
    }
    case 'Opportunity': {
      const stageName = getStr(record, 'StageName');
      const accountId = getStr(record, 'AccountId');
      if (!id || !name || !stageName) return { status: 'blocked', alerts: ['Id, Name ou StageName ausente.'] };
      const alerts: string[] = [];
      if (!accountId) {
        alerts.push('AccountId ausente.');
      } else if (!accountIds.has(accountId)) {
        alerts.push('AccountId não encontrado na amostra de Accounts carregada.');
      }
      return { status: alerts.length ? 'alert' : 'valid', alerts };
    }
    case 'Lead': {
      if (!id || !name) return { status: 'blocked', alerts: ['Id ou Name ausente.'] };
      const alerts: string[] = [];
      if (!getStr(record, 'Email')) alerts.push('Email ausente.');
      return { status: alerts.length ? 'alert' : 'valid', alerts };
    }
    case 'Campaign': {
      if (!id || !name) return { status: 'blocked', alerts: ['Id ou Name ausente.'] };
      const alerts: string[] = [];
      if (!getStr(record, 'Status')) alerts.push('Status ausente.');
      return { status: alerts.length ? 'alert' : 'valid', alerts };
    }
    default:
      return { status: 'valid', alerts: [] };
  }
}

const DRY_RUN_STATUS_STYLES: Record<DryRunRecordStatus, { badge: string; label: string }> = {
  valid: { badge: 'bg-emerald-100 text-emerald-800', label: 'Válido' },
  missing: { badge: 'bg-slate-100 text-slate-600', label: 'Ausente' },
  'permission-error': { badge: 'bg-red-100 text-red-700', label: 'Sem permissão' },
  'other-error': { badge: 'bg-amber-100 text-amber-700', label: 'Erro' },
};

interface DryRunPanelProps {
  result: DryRunResult;
  syncContractState: SyncContractState;
  onSaveSyncContract: () => void;
}

function DryRunPanel({ result, syncContractState, onSaveSyncContract }: DryRunPanelProps) {
  const canSave = result.summary.estimatedRecordsCanSync > 0;
  const isSaving = syncContractState.phase === 'loading';
  const isSaved = syncContractState.phase === 'done';

  return (
    <div className="rounded-2xl border-2 border-blue-700 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" />
          <p className="text-sm font-black text-slate-900">Resultado do dry-run read-only</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-[10px] font-medium text-slate-400">
            {formatDate(result.dryRunAt)} · {result.executionTimeMs}ms
          </p>
        </div>
      </div>

      <p className="mt-1 text-xs font-medium text-slate-600">
        Esta validação consultou o Salesforce em modo somente leitura.
        Nenhum registro foi importado, salvo ou sincronizado.
        O resultado indica quais registros parecem aptos para uma futura etapa de sync.
      </p>

      {/* Global summary */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-slate-900">{result.summary.totalChecked}</p>
          <p className="text-[10px] font-medium text-slate-500">verificados</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-emerald-800">{result.summary.totalValid}</p>
          <p className="text-[10px] font-medium text-emerald-600">aptos para sync</p>
        </div>
        {result.summary.totalMissing > 0 && (
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
            <p className="text-lg font-black text-slate-700">{result.summary.totalMissing}</p>
            <p className="text-[10px] font-medium text-slate-500">ausentes</p>
          </div>
        )}
        {result.summary.totalPermissionError > 0 && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-black text-red-800">{result.summary.totalPermissionError}</p>
            <p className="text-[10px] font-medium text-red-600">sem permissão</p>
          </div>
        )}
        {result.summary.totalOtherError > 0 && (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-center">
            <p className="text-lg font-black text-amber-800">{result.summary.totalOtherError}</p>
            <p className="text-[10px] font-medium text-amber-600">outros erros</p>
          </div>
        )}
      </div>

      {/* Estimated can sync */}
      <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-center">
        <p className="text-[10px] font-medium text-blue-700">
          Estimativa de registros aptos para sync:{' '}
          <span className="font-black">{result.summary.estimatedRecordsCanSync}</span>
          {result.summary.estimatedRecordsWillFail > 0 && (
            <> · falhariam: <span className="font-black">{result.summary.estimatedRecordsWillFail}</span></>
          )}
        </p>
      </div>

      {/* Per-entity breakdown */}
      <div className="mt-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detalhamento por entidade</p>
        {result.results.map((entity) => (
          <div key={entity.objectApiName} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-800">{entity.objectApiName}</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                {entity.selectedCount} verificados
              </span>
              {entity.validCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  {entity.validCount} aptos
                </span>
              )}
              {entity.missingCount > 0 && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                  {entity.missingCount} ausentes
                </span>
              )}
              {entity.permissionErrorCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">
                  {entity.permissionErrorCount} sem permissão
                </span>
              )}
              {entity.otherErrorCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                  {entity.otherErrorCount} erros
                </span>
              )}
            </div>

            <ul className="mt-2 space-y-1">
              {entity.records.map((rec) => {
                const styles = DRY_RUN_STATUS_STYLES[rec.status];
                return (
                  <li
                    key={rec.id}
                    className="flex flex-wrap items-center gap-1.5 rounded-lg px-2 py-1 text-[10px]"
                  >
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-black uppercase tracking-wider ${styles.badge}`}>
                      {styles.label}
                    </span>
                    <span className="font-medium text-slate-700">{rec.displayName}</span>
                    {rec.reason && (
                      <span className="text-slate-500">{rec.reason}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Save sync contract */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Salvar intenção de sync</p>
        <p className="mt-1 text-[10px] font-medium text-slate-600">
          Este passo salva a intenção de sync para revisão futura.
          Nenhum registro é importado, atualizado ou sincronizado.
          O status <span className="font-black text-slate-700">pending</span> indica que o contrato aguarda
          mapeamento canônico antes de qualquer gravação.
        </p>

        {!isSaved && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSaveSyncContract}
              disabled={!canSave || isSaving}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-blue-700 enabled:text-white enabled:hover:bg-blue-800"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar contrato para sync'}
            </button>
            {!canSave && (
              <p className="text-[10px] font-medium text-slate-400">
                Disponível apenas quando há registros aptos para sync.
              </p>
            )}
          </div>
        )}

        {syncContractState.phase === 'error' && (
          <p className="mt-2 text-xs font-medium text-red-700">{syncContractState.message}</p>
        )}

        {isSaved && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <p className="text-xs font-black text-emerald-800">Contrato salvo com sucesso</p>
            </div>
            <p className="mt-1 text-[10px] font-medium text-emerald-700">
              ID: <span className="font-black">{syncContractState.contractId}</span>
            </p>
            <p className="text-[10px] font-medium text-emerald-700">
              Status: <span className="font-black">pending</span> ·{' '}
              {syncContractState.estimatedRecordsCanSync} registro{syncContractState.estimatedRecordsCanSync !== 1 ? 's' : ''} aptos registrados
            </p>
            <p className="mt-1 text-[10px] font-medium text-emerald-600">
              Nenhum registro foi sincronizado. O contrato aguarda mapeamento canônico para qualquer gravação futura.
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] font-medium text-slate-400">
        Limites desta etapa: nenhum dado foi alterado, importado, sincronizado ou gravado nas tabelas canônicas.
      </p>
    </div>
  );
}

interface ContractPanelProps {
  contract: SalesforceMultiEntityContract;
  onGenerateContract: () => void;
  onDryRun: () => void;
  dryRunLoading: boolean;
  hasOnlyBlocked: boolean;
}

function ContractPanel({ contract, onGenerateContract, onDryRun, dryRunLoading, hasOnlyBlocked }: ContractPanelProps) {
  const CONTRACT_STATUS_STYLES = STATUS_STYLES;

  return (
    <div className="rounded-2xl border-2 border-slate-800 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 shrink-0 text-slate-800" />
          <p className="text-sm font-black text-slate-900">Contrato local multi-entidade</p>
        </div>
        <p className="text-[10px] font-medium text-slate-400">Gerado em {formatDate(contract.createdAt)}</p>
      </div>

      <p className="mt-1 text-xs font-medium text-slate-600">
        Este contrato organiza a seleção desta sessão para uma futura simulação de sync read-only.
        Nada é salvo, importado ou sincronizado.
        A validação final ainda acontecerá em um dry-run posterior.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onGenerateContract}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] font-black text-white transition-colors hover:bg-slate-900"
        >
          <ClipboardList className="h-3 w-3" />
          Atualizar contrato
        </button>
        <button
          type="button"
          onClick={onDryRun}
          disabled={dryRunLoading || contract.summary.estimatedRecordsToProcess === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-2.5 py-1.5 text-[10px] font-black text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dryRunLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          {dryRunLoading ? 'Validando...' : 'Executar dry-run read-only'}
        </button>
      </div>

      {contract.summary.estimatedRecordsToProcess === 0 && (
        <p className="mt-2 text-[10px] font-medium text-slate-500">
          Nenhum registro apto no contrato — selecione registros válidos ou com alertas.
        </p>
      )}

      {/* Global summary */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-slate-900">{contract.summary.totalSelected}</p>
          <p className="text-[10px] font-medium text-slate-500">selecionados</p>
        </div>
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-emerald-800">{contract.summary.totalValid}</p>
          <p className="text-[10px] font-medium text-emerald-600">válidos</p>
        </div>
        {contract.summary.totalAlert > 0 && (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-center">
            <p className="text-lg font-black text-amber-800">{contract.summary.totalAlert}</p>
            <p className="text-[10px] font-medium text-amber-600">com alertas</p>
          </div>
        )}
        {contract.summary.totalBlocked > 0 && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-black text-red-800">{contract.summary.totalBlocked}</p>
            <p className="text-[10px] font-medium text-red-600">bloqueados</p>
          </div>
        )}
      </div>

      <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-center">
        <p className="text-[10px] font-medium text-slate-500">
          Estimativa de registros processáveis:{' '}
          <span className="font-black text-slate-800">{contract.summary.estimatedRecordsToProcess}</span>
        </p>
      </div>

      {/* Scope metadata */}
      <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          Fonte: Salesforce OAuth
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          Modo: contrato local
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          {contract.entitiesInScope.length} entidade{contract.entitiesInScope.length !== 1 ? 's' : ''} em escopo
        </span>
        {contract.referenceSamples.accountIds.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
            {contract.referenceSamples.accountIds.length} Account{contract.referenceSamples.accountIds.length !== 1 ? 's' : ''} na amostra
          </span>
        )}
      </div>

      {/* Per-entity breakdown */}
      <div className="mt-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detalhamento por entidade</p>
        {contract.entities.map((entity) => (
          <div key={entity.objectApiName} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-800">{entity.objectApiName}</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                {entity.selectedCount} selecionados
              </span>
              {entity.validCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  {entity.validCount} válidos
                </span>
              )}
              {entity.alertCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                  {entity.alertCount} com alertas
                </span>
              )}
              {entity.blockedCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">
                  {entity.blockedCount} bloqueados
                </span>
              )}
            </div>

            {/* Compact record list */}
            <ul className="mt-2 space-y-1">
              {entity.selectedRecords.map((rec) => {
                const styles = CONTRACT_STATUS_STYLES[rec.eligibilityStatus];
                return (
                  <li
                    key={rec.id}
                    className={`flex flex-wrap items-start gap-1.5 rounded-lg px-2 py-1 text-[10px] ${styles.row}`}
                  >
                    <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 font-black uppercase tracking-wider ${styles.badge}`}>
                      {styles.label}
                    </span>
                    <span className="font-medium text-slate-700">{rec.displayName}</span>
                    {rec.eligibilityAlerts.map((alert, ai) => (
                      <span key={ai} className="flex items-center gap-0.5 text-amber-700">
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                        {alert}
                      </span>
                    ))}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] font-medium text-slate-400">
        Limites desta etapa: nenhum dado foi gravado, importado, sincronizado ou persistido.
        Contact e Opportunity têm AccountId avaliado apenas contra a amostra de Accounts carregada no preview.
      </p>
      {hasOnlyBlocked && (
        <p className="mt-2 text-[10px] font-medium text-amber-600">
          Todos os registros selecionados estão bloqueados — selecione pelo menos um válido ou com alertas para gerar o contrato.
        </p>
      )}
    </div>
  );
}

interface EntityCardProps {
  result: ObjectPreviewResult;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  accountIds: Set<string>;
}

function EntityCard({ result, selectedIds, onToggle, onSelectAll, onClearAll, accountIds }: EntityCardProps) {
  const success = result.status === 'success';
  const selectionSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const eligibilityMap = useMemo(() => {
    const map = new Map<string, EligibilityResult>();
    for (const record of result.records) {
      const id = getStr(record, 'Id');
      if (id) map.set(id, assessEligibility(result.objectApiName, record, accountIds));
    }
    return map;
  }, [result.records, result.objectApiName, accountIds]);

  const summary = useMemo(() => {
    let valid = 0, alert = 0, blocked = 0;
    for (const elig of eligibilityMap.values()) {
      if (elig.status === 'valid') valid++;
      else if (elig.status === 'alert') alert++;
      else blocked++;
    }
    return { loaded: result.records.length, selected: selectedIds.length, valid, alert, blocked };
  }, [eligibilityMap, result.records.length, selectedIds.length]);

  const allSelected = result.records.length > 0 && selectedIds.length === result.records.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

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
        <>
          {/* Entity summary + action buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span>{summary.loaded} carregados</span>
              <span>·</span>
              <span className="font-black text-slate-700">{summary.selected} selecionados</span>
              <span>·</span>
              <span className="text-emerald-700">{summary.valid} válidos</span>
              {summary.alert > 0 && (
                <><span>·</span><span className="text-amber-600">{summary.alert} com alertas</span></>
              )}
              {summary.blocked > 0 && (
                <><span>·</span><span className="text-red-600">{summary.blocked} bloqueados</span></>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600 hover:bg-slate-200"
                >
                  <MinusSquare className="h-3 w-3" />
                  Limpar seleção
                </button>
              )}
            </div>
          </div>

          {/* Records table */}
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="w-8 px-3 py-2">
                    <button
                      type="button"
                      onClick={allSelected ? onClearAll : onSelectAll}
                      aria-label="selecionar todos"
                      className="rounded-md p-0.5 transition-colors hover:bg-slate-100"
                    >
                      {allSelected ? (
                        <CheckSquare className="h-4 w-4 text-slate-800" />
                      ) : someSelected ? (
                        <MinusSquare className="h-4 w-4 text-blue-700" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Status
                  </th>
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
                {result.records.map((record, i) => {
                  const id = getStr(record, 'Id');
                  const isSelected = id ? selectionSet.has(id) : false;
                  const elig = id
                    ? (eligibilityMap.get(id) ?? { status: 'valid' as EligibilityStatus, alerts: [] })
                    : { status: 'blocked' as EligibilityStatus, alerts: ['Id ausente.'] };
                  const styles = STATUS_STYLES[elig.status];

                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-50 last:border-0 transition-colors hover:brightness-95 ${isSelected ? 'ring-1 ring-inset ring-slate-300' : ''} ${styles.row}`}
                    >
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => id && onToggle(id)}
                          disabled={!id}
                          aria-label={isSelected ? 'desselecionar' : 'selecionar'}
                          className="rounded-md p-0.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-slate-800" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${styles.badge}`}
                          >
                            {styles.label}
                          </span>
                          {elig.alerts.map((alert, ai) => (
                            <span key={ai} className="flex items-center gap-0.5 text-[9px] font-medium text-amber-700">
                              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                              {alert}
                            </span>
                          ))}
                        </div>
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-[10px] font-medium text-slate-400">
            Consultado em {formatDate(result.testedAt)}
          </p>
        </>
      )}
    </div>
  );
}

// ─── AccountMappingPanel (C4.5) ────────────────────────────────────────────────

const SALESFORCE_ACCOUNT_FIELDS = ['Id', 'Name', 'Website', 'Industry', 'Type', 'OwnerId', 'CreatedDate', 'LastModifiedDate'];

const CANONICAL_FIELDS: { key: keyof CanonicalFieldMap; label: string; required: boolean }[] = [
  { key: 'source_external_id', label: 'ID Externo (Salesforce)', required: true },
  { key: 'nome', label: 'Nome da Conta', required: true },
  { key: 'dominio', label: 'Domínio / Website', required: true },
  { key: 'segmento', label: 'Segmento / Indústria', required: false },
  { key: 'tipo', label: 'Tipo de Conta', required: false },
];

const DEFAULT_FIELD_MAP: CanonicalFieldMap = {
  source_external_id: 'Id',
  nome: 'Name',
  dominio: 'Website',
  segmento: 'Industry',
  tipo: 'Type',
};

function buildSamplePreview(
  accountRecords: Record<string, PreviewValue>[],
  fieldMap: CanonicalFieldMap,
): AccountSamplePreview | null {
  if (!accountRecords.length) return null;
  const first = accountRecords[0];
  return {
    source_external_id: first[fieldMap.source_external_id] != null ? String(first[fieldMap.source_external_id]) : null,
    nome: first[fieldMap.nome] != null ? String(first[fieldMap.nome]) : null,
    dominio: first[fieldMap.dominio] != null ? String(first[fieldMap.dominio]) : null,
    segmento: first[fieldMap.segmento] != null ? String(first[fieldMap.segmento]) : null,
    tipo: first[fieldMap.tipo] != null ? String(first[fieldMap.tipo]) : null,
  };
}

interface AccountMappingPanelProps {
  contractId: string;
  accountRecords: Record<string, PreviewValue>[];
  mappingState: CanonicalMappingState;
  onSaveMapping: (fieldMap: CanonicalFieldMap) => void;
}

function AccountMappingPanel({ contractId, accountRecords, mappingState, onSaveMapping }: AccountMappingPanelProps) {
  const [fieldMap, setFieldMap] = useState<CanonicalFieldMap>({ ...DEFAULT_FIELD_MAP });
  const isSaving = mappingState.phase === 'loading';
  const isSaved = mappingState.phase === 'done';

  const samplePreview = useMemo(
    () => buildSamplePreview(accountRecords, fieldMap),
    [accountRecords, fieldMap],
  );

  const missingRequired = CANONICAL_FIELDS
    .filter((f) => f.required && !fieldMap[f.key])
    .map((f) => f.label);

  function handleFieldChange(canonicalKey: keyof CanonicalFieldMap, salesforceField: string) {
    setFieldMap((prev) => ({ ...prev, [canonicalKey]: salesforceField }));
  }

  return (
    <div className="rounded-2xl border-2 border-violet-700 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-black text-slate-900">Mapeamento canônico de Account</p>
          <p className="text-xs font-medium text-slate-600">
            Este mapeamento prepara o contrato para uma futura etapa de sync read-only.
            Nenhum dado foi gravado em Contas.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-800">
          Account only
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contrato de referência</p>
        <p className="mt-1 text-[10px] font-medium text-slate-600">
          ID: <span className="font-black text-slate-800">{contractId}</span>
        </p>
        <p className="text-[10px] font-medium text-slate-600">Status atual: <span className="font-black">pending</span></p>
        <p className="text-[10px] font-medium text-slate-600">
          O mapeamento salvo irá atualizar este contrato para o status{' '}
          <span className="font-black text-violet-700">mapped</span>.
        </p>
      </div>

      {/* Tabela de mapeamento */}
      <div className="mt-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Configurar mapeamento de campos
        </p>
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          Selecione qual campo do Salesforce corresponde a cada campo canônico da Canopi.
        </p>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Campo canônico (Canopi)
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Obrigatório
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Campo Salesforce (origem)
                </th>
              </tr>
            </thead>
            <tbody>
              {CANONICAL_FIELDS.map((cf) => (
                <tr key={cf.key} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2">
                    <span className="text-xs font-black text-slate-800">{cf.label}</span>
                    <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                      {cf.key}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {cf.required ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-black text-violet-700">sim</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">opcional</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={fieldMap[cf.key]}
                      onChange={(e) => handleFieldChange(cf.key, e.target.value)}
                      disabled={isSaved}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">— selecionar —</option>
                      {SALESFORCE_ACCOUNT_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview de 1 linha */}
      {samplePreview && (
        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Preview: como esta conta ficaria após o mapeamento
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500">
            Simulação visual apenas. Nenhum dado foi gravado em Contas.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CANONICAL_FIELDS.map((cf) => {
              const value = samplePreview[cf.key];
              return (
                <div key={cf.key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{cf.label}</p>
                  <p className={`mt-0.5 text-xs font-medium ${value ? 'text-slate-800' : 'text-slate-400'}`}>
                    {value || '—'}
                  </p>
                  <p className="text-[9px] text-slate-400">← {fieldMap[cf.key] || 'não mapeado'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regras de Dedupe */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Regras de deduplicação (não editável neste recorte)</p>
        <ul className="mt-2 space-y-1 text-[10px] font-medium text-slate-600">
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            Prioridade 1: Salesforce Id (<code className="rounded bg-slate-200 px-1 text-[9px]">source_external_id</code>)
            — se já existir no banco.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
            Prioridade 2: Domínio / Website — match por{' '}
            <code className="rounded bg-slate-200 px-1 text-[9px]">Website</code>.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            O ID interno da Canopi será preservado — nunca sobrescrito pelo Salesforce.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Campos estratégicos da Canopi não serão sobrescritos por Salesforce:{' '}
            <code className="rounded bg-slate-200 px-1 text-[9px]">tipoEstrategico</code>,{' '}
            <code className="rounded bg-slate-200 px-1 text-[9px]">playAtivo</code>,{' '}
            <code className="rounded bg-slate-200 px-1 text-[9px]">scoring</code>.
          </li>
        </ul>
      </div>

      {/* Botão de salvar */}
      {!isSaved && (
        <div className="mt-5">
          {missingRequired.length > 0 && (
            <p className="mb-2 text-[10px] font-medium text-amber-700">
              Campos obrigatórios sem mapeamento: {missingRequired.join(', ')}.
            </p>
          )}
          <button
            type="button"
            onClick={() => onSaveMapping(fieldMap)}
            disabled={isSaving || missingRequired.length > 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-violet-700 enabled:text-white enabled:hover:bg-violet-800"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isSaving ? 'Salvando mapeamento...' : 'Salvar mapeamento de Account'}
          </button>
        </div>
      )}

      {mappingState.phase === 'error' && (
        <p className="mt-3 text-xs font-medium text-red-700">{mappingState.message}</p>
      )}

      {isSaved && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <p className="text-xs font-black text-emerald-800">Mapeamento salvo com sucesso.</p>
          </div>
          <p className="mt-1 text-[10px] font-medium text-emerald-700">
            Status do contrato atualizado para <span className="font-black">mapped</span>.
          </p>
          <p className="text-[10px] font-medium text-emerald-700">
            Salvo em: {mappingState.updatedAt ? new Date(mappingState.updatedAt).toLocaleString('pt-BR') : '—'}
          </p>
          <p className="mt-1 text-[10px] font-medium text-emerald-600">
            Nenhum registro foi sincronizado. O contrato aguarda a próxima etapa de sync read-only.
          </p>
        </div>
      )}

      <p className="mt-4 text-[10px] font-medium text-slate-400">
        Limites: nenhuma conta foi criada, atualizada ou sincronizada.
        Este mapeamento registra apenas a intenção de tradução de campos para uso futuro no sync read-only.
        Apenas Account está no escopo deste recorte.
      </p>
    </div>
  );
}

interface SalesforceMultiEntityPreviewProps {
  oauthConnected: boolean;
}

export function SalesforceMultiEntityPreview({ oauthConnected }: SalesforceMultiEntityPreviewProps) {
  const [state, setState] = useState<PreviewState>({ phase: 'idle' });
  const [selectionMap, setSelectionMap] = useState<SelectionMap>({});
  const [contract, setContract] = useState<SalesforceMultiEntityContract | null>(null);
  const [dryRunState, setDryRunState] = useState<DryRunState>({ phase: 'idle' });
  const [syncContractState, setSyncContractState] = useState<SyncContractState>({ phase: 'idle' });
  const [canonicalMappingState, setCanonicalMappingState] = useState<CanonicalMappingState>({ phase: 'idle' });
  const contractPanelRef = useRef<HTMLDivElement>(null);
  const dryRunPanelRef = useRef<HTMLDivElement>(null);
  const mappingPanelRef = useRef<HTMLDivElement>(null);
  const syncPreviewPanelRef = useRef<HTMLDivElement>(null);

  const [syncPreviewState, setSyncPreviewState] = useState<SyncPreviewState>({ phase: 'idle' });

  async function handleSaveSyncContract() {
    if (dryRunState.phase !== 'done' || !contract) return;
    setSyncContractState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/sync-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract, dryRunSummary: dryRunState.result.summary }),
        cache: 'no-store',
      });
      const data = (await res.json()) as { status: string; syncContract?: { id: string; estimatedRecordsCanSync: number }; error?: string };
      if (!res.ok || data.status !== 'success' || !data.syncContract) {
        setSyncContractState({ phase: 'error', message: data.error ?? 'Não foi possível salvar o contrato.' });
        return;
      }
      setSyncContractState({
        phase: 'done',
        contractId: data.syncContract.id,
        estimatedRecordsCanSync: data.syncContract.estimatedRecordsCanSync,
      });
    } catch {
      setSyncContractState({ phase: 'error', message: 'Não foi possível salvar o contrato.' });
    }
  }

  async function handleSaveCanonicalMapping(fieldMap: CanonicalFieldMap) {
    if (syncContractState.phase !== 'done') return;
    setCanonicalMappingState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/sync-contract', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: syncContractState.contractId,
          mapping: { fieldMap },
        }),
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        status: string;
        syncContract?: { updatedAt: string };
        error?: string;
      };
      if (!res.ok || data.status !== 'success' || !data.syncContract) {
        setCanonicalMappingState({ phase: 'error', message: data.error ?? 'Não foi possível salvar o mapeamento.' });
        return;
      }
      setCanonicalMappingState({ phase: 'done', updatedAt: data.syncContract.updatedAt });
      setTimeout(() => {
        mappingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch {
      setCanonicalMappingState({ phase: 'error', message: 'Não foi possível salvar o mapeamento.' });
    }
  }

  async function handleLoadSyncPreview() {
    if (syncContractState.phase !== 'done') return;
    setSyncPreviewState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/sync-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: syncContractState.contractId }),
        cache: 'no-store',
      });
      const data = (await res.json()) as { status: string; preview?: any; error?: string };
      if (!res.ok || data.status !== 'success' || !data.preview) {
        setSyncPreviewState({ phase: 'error', message: data.error ?? 'Não foi possível carregar o preview.' });
        return;
      }
      setSyncPreviewState({ phase: 'done', result: data.preview });
      setTimeout(() => {
        syncPreviewPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      setSyncPreviewState({ phase: 'error', message: 'Não foi possível carregar o preview.' });
    }
  }

  async function handleLoad() {
    if (!oauthConnected) return;
    setState({ phase: 'loading' });
    setSelectionMap({});
    setContract(null);
    setDryRunState({ phase: 'idle' });
    setSyncContractState({ phase: 'idle' });
    setCanonicalMappingState({ phase: 'idle' });

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

  async function handleDryRun() {
    if (!contract) return;
    setDryRunState({ phase: 'loading' });

    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract }),
        cache: 'no-store',
      });
      const data = (await res.json()) as DryRunResult & { error?: string };

      if (!res.ok || data.status === 'error') {
        setDryRunState({ phase: 'error', message: (data as unknown as { error?: string }).error ?? 'Não foi possível executar o dry-run.' });
        return;
      }

      setDryRunState({ phase: 'done', result: data });
      setTimeout(() => {
        dryRunPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch {
      setDryRunState({ phase: 'error', message: 'Não foi possível executar o dry-run.' });
    }
  }

  function handleToggle(objectApiName: string, id: string) {
    setContract(null);
    setDryRunState({ phase: 'idle' });
    setSyncContractState({ phase: 'idle' });
    setSelectionMap((prev) => {
      const current = prev[objectApiName] ?? [];
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...prev, [objectApiName]: next };
    });
  }

  function handleSelectAll(objectApiName: string, records: Record<string, PreviewValue>[]) {
    setContract(null);
    setDryRunState({ phase: 'idle' });
    setSyncContractState({ phase: 'idle' });
    const ids = records.map((r) => getStr(r, 'Id')).filter(Boolean);
    setSelectionMap((prev) => ({ ...prev, [objectApiName]: ids }));
  }

  function handleClearAll(objectApiName: string) {
    setContract(null);
    setDryRunState({ phase: 'idle' });
    setSyncContractState({ phase: 'idle' });
    setSelectionMap((prev) => ({ ...prev, [objectApiName]: [] }));
  }

  const accountIds = useMemo<Set<string>>(() => {
    if (state.phase !== 'done') return new Set();
    const accountResult = state.results.find((r) => r.objectApiName === 'Account' && r.status === 'success');
    if (!accountResult) return new Set();
    return new Set(accountResult.records.map((r) => getStr(r, 'Id')).filter(Boolean));
  }, [state]);

  const globalSummary = useMemo(() => {
    if (state.phase !== 'done') return null;

    let totalSelected = 0, totalValid = 0, totalAlert = 0, totalBlocked = 0;
    const entitiesWithSelection: string[] = [];

    for (const result of state.results) {
      if (result.status !== 'success') continue;
      const selectedIds = selectionMap[result.objectApiName] ?? [];
      if (selectedIds.length > 0) entitiesWithSelection.push(result.objectApiName);
      totalSelected += selectedIds.length;
      for (const record of result.records) {
        const elig = assessEligibility(result.objectApiName, record, accountIds);
        if (elig.status === 'valid') totalValid++;
        else if (elig.status === 'alert') totalAlert++;
        else totalBlocked++;
      }
    }

    return { totalSelected, totalValid, totalAlert, totalBlocked, entitiesWithSelection };
  }, [state, selectionMap, accountIds]);

  const hasAnySelection = useMemo(() => {
    return Object.values(selectionMap).some((ids) => ids.length > 0);
  }, [selectionMap]);

  const hasOnlyBlocked = useMemo(() => {
    if (state.phase !== 'done') return false;
    for (const result of state.results) {
      if (result.status !== 'success') continue;
      const selectedIds = selectionMap[result.objectApiName] ?? [];
      for (const record of result.records) {
        const id = getStr(record, 'Id');
        if (!id || !selectedIds.includes(id)) continue;
        const elig = assessEligibility(result.objectApiName, record, accountIds);
        if (elig.status !== 'blocked') return false;
      }
    }
    return hasAnySelection;
  }, [state, selectionMap, accountIds, hasAnySelection]);

  function handleGenerateContract() {
    if (state.phase !== 'done' || !hasAnySelection) return;

    const entities: ContractEntity[] = [];

    for (const result of state.results) {
      if (result.status !== 'success') continue;
      const selectedIds = selectionMap[result.objectApiName] ?? [];
      if (selectedIds.length === 0) continue;
      const selectedSet = new Set(selectedIds);
      const selectedRecords: ContractRecord[] = [];
      let valid = 0, alert = 0, blocked = 0;

      for (const record of result.records) {
        const id = getStr(record, 'Id');
        if (!id || !selectedSet.has(id)) continue;
        const elig = assessEligibility(result.objectApiName, record, accountIds);
        selectedRecords.push({
          id,
          displayName: getStr(record, 'Name') || id,
          eligibilityStatus: elig.status,
          eligibilityAlerts: elig.alerts,
          fieldValues: { ...record },
        });
        if (elig.status === 'valid') valid++;
        else if (elig.status === 'alert') alert++;
        else blocked++;
      }

      entities.push({
        objectApiName: result.objectApiName,
        label: result.label || result.objectApiName,
        selectedCount: selectedRecords.length,
        validCount: valid,
        alertCount: alert,
        blockedCount: blocked,
        selectedRecords,
      });
    }

    const totalSelected = entities.reduce((s, e) => s + e.selectedCount, 0);
    const totalValid = entities.reduce((s, e) => s + e.validCount, 0);
    const totalAlert = entities.reduce((s, e) => s + e.alertCount, 0);
    const totalBlocked = entities.reduce((s, e) => s + e.blockedCount, 0);

    const newContract: SalesforceMultiEntityContract = {
      createdAt: new Date().toISOString(),
      source: 'salesforce-oauth',
      mode: 'local-multi-entity-contract',
      entitiesInScope: entities.map((e) => e.objectApiName),
      referenceSamples: {
        accountIds: Array.from(accountIds),
      },
      summary: {
        totalSelected,
        totalValid,
        totalAlert,
        totalBlocked,
        estimatedRecordsToProcess: totalValid,
      },
      entities,
    };

    setContract(newContract);
    setTimeout(() => {
      contractPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-900">Preview read-only multi-entidade</p>
          <p className="text-sm font-medium text-slate-600">
            Accounts, Contacts, Opportunities, Leads e Campaigns carregados neste preview somente leitura via OAuth persistido.
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

      {/* Limites desta etapa */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Limites desta etapa</p>
        <ul className="mt-2 space-y-1 text-xs font-medium text-slate-600">
          <li>• Esta etapa apenas prepara registros para análise local.</li>
          <li>• Nada é importado, salvo ou sincronizado.</li>
          <li>• Contact e Opportunity são avaliados contra os Accounts carregados neste preview.</li>
          <li>• Lead e Campaign seguem independentes nesta versão.</li>
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

          {/* Global summary */}
          {globalSummary && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sumário global</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                <span>
                  <span className="font-black text-slate-800">{globalSummary.totalSelected}</span> selecionados
                </span>
                <span>
                  <span className="font-black text-emerald-700">{globalSummary.totalValid}</span> válidos
                </span>
                {globalSummary.totalAlert > 0 && (
                  <span>
                    <span className="font-black text-amber-600">{globalSummary.totalAlert}</span> com alertas
                  </span>
                )}
                {globalSummary.totalBlocked > 0 && (
                  <span>
                    <span className="font-black text-red-600">{globalSummary.totalBlocked}</span> bloqueados
                  </span>
                )}
                {globalSummary.entitiesWithSelection.length > 0 && (
                  <span className="text-slate-500">
                    Entidades: {globalSummary.entitiesWithSelection.join(', ')}
                  </span>
                )}
              </div>
              {hasOnlyBlocked && (
                <p className="mt-1 text-[10px] font-medium text-amber-600">
                  Todos os registros selecionados estão bloqueados — selecione pelo menos um válido ou com alertas para gerar o contrato.
                </p>
              )}
            </div>
          )}

          {/* Entity cards */}
          {state.results.map((result) => (
            <EntityCard
              key={result.objectApiName}
              result={result}
              selectedIds={selectionMap[result.objectApiName] ?? []}
              onToggle={(id) => handleToggle(result.objectApiName, id)}
              onSelectAll={() => handleSelectAll(result.objectApiName, result.records)}
              onClearAll={() => handleClearAll(result.objectApiName)}
              accountIds={accountIds}
            />
          ))}

          {/* Contextual action area */}
          {state.phase === 'done' && hasAnySelection && !contract && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seleção pronta para contrato</p>
                  <p className="text-xs font-medium text-slate-600">
                    Revise a seleção e gere o contrato local para validar em modo read-only.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-slate-600">
                    <span>
                      <span className="font-black text-slate-800">{globalSummary?.totalSelected ?? 0}</span> selecionados
                    </span>
                    <span>
                      <span className="font-black text-emerald-700">{globalSummary?.totalValid ?? 0}</span> válidos
                    </span>
                    {(globalSummary?.totalAlert ?? 0) > 0 && (
                      <span>
                        <span className="font-black text-amber-600">{globalSummary?.totalAlert ?? 0}</span> com alertas
                      </span>
                    )}
                    {(globalSummary?.totalBlocked ?? 0) > 0 && (
                      <span>
                        <span className="font-black text-red-600">{globalSummary?.totalBlocked ?? 0}</span> bloqueados
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateContract}
                    disabled={!hasAnySelection}
                    title={hasOnlyBlocked ? 'Todos os registros selecionados estão bloqueados.' : undefined}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-slate-800 enabled:text-white enabled:hover:bg-slate-900"
                  >
                    <ClipboardList className="h-3 w-3" />
                    Gerar contrato local
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contract panel */}
          {contract && (
            <div ref={contractPanelRef} className="scroll-mt-4">
              <ContractPanel
                contract={contract}
                onGenerateContract={handleGenerateContract}
                onDryRun={handleDryRun}
                dryRunLoading={dryRunState.phase === 'loading'}
                hasOnlyBlocked={hasOnlyBlocked}
              />
            </div>
          )}

          {/* Dry-run error */}
          {dryRunState.phase === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold text-red-700">{dryRunState.message}</p>
            </div>
          )}

          {/* Dry-run result panel */}
          {dryRunState.phase === 'done' && (
            <div ref={dryRunPanelRef} className="scroll-mt-4">
              <DryRunPanel
                result={dryRunState.result}
                syncContractState={syncContractState}
                onSaveSyncContract={handleSaveSyncContract}
              />
            </div>
          )}

          {/* Painel de mapeamento canônico (C4.5) */}
          {syncContractState.phase === 'done' && (
            <div ref={mappingPanelRef} className="scroll-mt-4">
              <AccountMappingPanel
                contractId={syncContractState.contractId}
                accountRecords={
                  state.phase === 'done'
                    ? (state.results.find((r) => r.objectApiName === 'Account' && r.status === 'success')?.records ?? [])
                    : []
                }
                mappingState={canonicalMappingState}
                onSaveMapping={handleSaveCanonicalMapping}
              />
            </div>
          )}

          {/* Botão de preview de sync (C4.6) */}
          {canonicalMappingState.phase === 'done' && syncPreviewState.phase === 'idle' && (
            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={handleLoadSyncPreview}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-black text-white hover:bg-violet-800 transition-all hover:scale-105 shadow-lg shadow-violet-200"
              >
                <Eye className="h-4 w-4" />
                Visualizar impacto da sincronização
              </button>
            </div>
          )}

          {/* Painel de preview de sincronização (C4.6) */}
          {syncPreviewState.phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-700" />
              <p className="mt-3 text-sm font-bold text-slate-700">Gerando preview de sincronização...</p>
              <p className="text-[10px] font-medium text-slate-500">Comparando dados do Salesforce com sua base local Canopi</p>
            </div>
          )}

          {syncPreviewState.phase === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-700" />
                <p className="text-sm font-black text-red-800">Erro ao gerar preview</p>
              </div>
              <p className="mt-1 text-xs font-medium text-red-700">{syncPreviewState.message}</p>
              <button
                type="button"
                onClick={handleLoadSyncPreview}
                className="mt-3 text-xs font-bold text-red-700 underline underline-offset-4"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {syncPreviewState.phase === 'done' && (
            <div ref={syncPreviewPanelRef} className="scroll-mt-4">
              <SyncPreviewPanel result={syncPreviewState.result} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── SyncPreviewPanel (C4.6) ──────────────────────────────────────────────────

function SyncPreviewPanel({ result }: { result: any }) {
  const { summary, items } = result;

  return (
    <div className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-base font-black text-slate-900">Prévia de Sincronização de Contas</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              Read-Only
            </span>
            <p className="text-xs font-medium text-slate-600">
              Impacto simulado baseado no mapeamento canônico salvo.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 min-w-[60px]">
            <p className="text-[10px] font-black text-emerald-600">{summary.toCreate}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Criar</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 min-w-[60px]">
            <p className="text-[10px] font-black text-blue-600">{summary.toUpdate}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Atualizar</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 min-w-[60px]">
            <p className="text-[10px] font-black text-slate-600">{summary.noChange}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Iguais</p>
          </div>
          {summary.warnings > 0 && (
            <div className="flex flex-col items-center rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 min-w-[60px]">
              <p className="text-[10px] font-black text-amber-600">{summary.warnings}</p>
              <p className="text-[8px] font-bold uppercase text-amber-500">Avisos</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Conta Salesforce
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Campos Traduzidos (Preview)
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Estado na Canopi
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Ação Prevista
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item: any, idx: number) => (
              <tr key={item.sourceExternalId + idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-slate-900">{item.sourceDisplayName}</p>
                    <p className="text-[9px] font-medium text-slate-400 font-mono">SF ID: {item.sourceExternalId}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="font-bold text-slate-400 w-12 shrink-0">Nome:</span>
                      <span className="font-medium text-slate-700">{item.canonicalFields.nome || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="font-bold text-slate-400 w-12 shrink-0">Domínio:</span>
                      <span className="font-medium text-slate-700">{item.canonicalFields.dominio || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="font-bold text-slate-400 w-12 shrink-0">Seg:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[120px]">{item.canonicalFields.segmento || '—'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.currentCanopiValue ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="font-bold text-slate-400">Atual:</span>
                        <span className="font-medium text-slate-600 italic">{item.currentCanopiValue.nome}</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        Match por {item.currentCanopiValue.dominio === item.canonicalFields.dominio ? 'Domínio' : 'ID Externo'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 italic">Novo registro</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {item.actionPreview === 'create' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700 w-fit">
                        <Zap className="h-3 w-3" /> CRIAR
                      </span>
                    )}
                    {item.actionPreview === 'update' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black text-blue-700 w-fit">
                        <ArrowRight className="h-3 w-3" /> ATUALIZAR
                      </span>
                    )}
                    {item.actionPreview === 'no_change' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> SEM ALTERAÇÃO
                      </span>
                    )}
                    {item.actionPreview === 'warning' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-700 w-fit">
                        <AlertTriangle className="h-3 w-3" /> AVISO
                      </span>
                    )}

                    {item.warnings.map((w: string, i: number) => (
                      <p key={i} className="text-[9px] font-medium text-amber-600 leading-tight">
                        ⚠ {w}
                      </p>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-center border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2 text-violet-700 bg-violet-50 px-4 py-2 rounded-xl">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-xs font-black">Sincronização Read-Only</p>
        </div>
        <p className="mt-3 max-w-md text-center text-[11px] font-medium text-slate-500">
          Nenhum dado foi gravado na sua base de Contas da Canopi.
          Este painel apenas simula a tradução dos campos e o impacto que o sync teria se fosse executado agora.
        </p>
        <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          O sync persistente ainda não está habilitado.
        </p>
      </div>
    </div>
  );
}
