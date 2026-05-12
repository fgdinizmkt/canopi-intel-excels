'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, FileJson, KeyRound, Loader2, Network, XCircle } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { SalesforceHubRedesign } from './SalesforceHubRedesign';

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

type OAuthPanelStatus = 'requires_configuration' | 'disconnected' | 'connected' | 'error';

interface OAuthStatusResult {
  configured: boolean;
  connected: boolean;
  status: OAuthPanelStatus;
  instanceUrl?: string | null;
  orgId?: string | null;
  userId?: string | null;
  scopes?: string[];
  lastHealthCheckAt?: string | null;
  accountLabel?: string | null;
  accountFieldsCount?: number | null;
  apiVersion?: string;
  error?: string | null;
  configChecklist?: {
    clientId: boolean;
    clientSecret: boolean;
    redirectUri: boolean;
    loginUrl: boolean;
  };
}

interface OAuthConfigResult {
  configured: boolean;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  loginUrl: string;
  redirectUri: string;
  scopes: string[];
  callbackUrl: string;
  updatedAt: string | null;
}

interface AccountsPreviewRecord {
  Id: string | null;
  Name: string | null;
  Website: string | null;
  Industry: string | null;
  Type: string | null;
  OwnerId: string | null;
  CreatedDate: string | null;
  LastModifiedDate: string | null;
}

interface AccountsPreviewResult {
  records: AccountsPreviewRecord[];
  totalSize: number;
  done: boolean;
  limit: number;
  apiVersion: string;
  instanceUrl: string;
  accountLabel: string;
  testedAt: string;
}

interface AccountsPreviewApiResponse {
  status: string;
  provider: string;
  preview?: AccountsPreviewResult;
  error?: string;
}

type AccountQualityField = 'Id' | 'Name' | 'Website' | 'Industry' | 'Type' | 'OwnerId';
type AccountQualityDecision = 'manual' | 'fix_salesforce' | 'accept' | 'remove' | 'blocker';

interface AccountQualityResolution {
  decision: AccountQualityDecision;
  value: string;
}

interface PreparedAccountsPreviewRow {
  key: string;
  label: string;
  gaps: string[];
  recommendedGaps: string[];
  isValid: boolean;
  record: AccountsPreviewRecord;
}

interface PreparedAccountsPreviewSummary {
  preparedAt: string;
  selectedCount: number;
  validCount: number;
  rowsWithGapsCount: number;
  rows: PreparedAccountsPreviewRow[];
}

type SyncSummary = {
  startedAt?: string;
  finishedAt?: string;
  createdCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  errorCount?: number;
  unresolvedAccountCount?: number;
  missingRequiredFieldsCount?: number;
  existingMatchSkippedCount?: number;
  ambiguousMatchSkippedCount?: number;
  outcome?: string;
};

interface SalesforceHubHydrationResponse {
  status: 'success' | 'error';
  provider: 'salesforce';
  hydratedAt?: string;
  salesforce?: {
    accounts?: { totalSize: number; recordsLoaded: number; done: boolean; testedAt: string };
    contacts?: { totalSize: number; recordsLoaded: number; testedAt: string | null };
    opportunities?: { totalSize: number; recordsLoaded: number; testedAt: string | null };
    leads?: { totalSize: number; recordsLoaded: number; done: boolean; testedAt: string };
  };
  canopi?: {
    accounts?: { count: number; latestSync: SyncSummary | null; contractId: string | null; preview: AccountsPreviewResult | null };
    contacts?: { count: number; latestSync: SyncSummary | null; contractId: string | null; preview: ContactPreviewData | null };
    opportunities?: { count: number; latestSync: SyncSummary | null; contractId: string | null; preview: OpportunityPreviewData | null };
  };
  configurationCompleted?: boolean;
  leadLoadState?: { phase: 'idle'; message: string };
  error?: string;
}

interface LocalPreSyncContractRow {
  Id: string | null;
  Name: string | null;
  Website: string | null;
  Industry: string | null;
  Type: string | null;
  OwnerId: string | null;
  status: 'válido' | 'com lacunas';
  gaps: string[];
  recommendedGaps: string[];
}

interface LocalPreSyncContract {
  createdAt: string;
  source: 'Salesforce OAuth';
  objectApiName: 'Account';
  mode: 'read-only';
  previewLimit: number;
  totalLoaded: number;
  totalSelected: number;
  totalValid: number;
  totalWithGaps: number;
  fieldsConsidered: string[];
  records: LocalPreSyncContractRow[];
}

type LocalPreSyncDryRunRecordStatus = 'apto para sync read-only futuro' | 'com alertas' | 'bloqueado para sync';

interface LocalPreSyncDryRunRow {
  key: string;
  label: string;
  status: LocalPreSyncDryRunRecordStatus;
  reasons: string[];
  record: LocalPreSyncContractRow;
}

interface LocalPreSyncDryRun {
  createdAt: string;
  source: 'Salesforce OAuth';
  objectApiName: 'Account';
  mode: 'dry-run read-only';
  contractTotal: number;
  aptoCount: number;
  alertCount: number;
  blockedCount: number;
  fieldsEvaluated: string[];
  rows: LocalPreSyncDryRunRow[];
}

interface AccountSyncExecutionResult {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  outcome: string;
}

type AccountSyncState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; contractId: string; result: AccountSyncExecutionResult }
  | { phase: 'error'; message: string };

interface ContactPreviewItem {
  sourceContactId: string;
  sourceAccountId: string;
  resolvedCanopiAccountId: string | null;
  resolvedAccountName: string | null;
  nome: string;
  email: string;
  cargo: string | null;
  area: string | null;
  actionPreview: string;
  warnings: string[];
}

interface ContactPreviewData {
  contractId: string;
  totalContacts: number;
  resolvedCount: number;
  unresolvedCount: number;
  missingFieldsCount: number;
  items: ContactPreviewItem[];
}

interface ContactSyncResult {
  contractId: string;
  entity: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  outcome: string;
}

type ContactPreviewState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; contractId: string; preview: ContactPreviewData; contractSource: 'account_sync' | 'fallback' }
  | { phase: 'error'; message: string };

type ContactSyncState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: ContactSyncResult }
  | { phase: 'error'; message: string };

interface OpportunityPreviewItem {
  sourceOpportunityId: string;
  sourceAccountId: string;
  resolvedCanopiAccountId: string | null;
  resolvedAccountName: string | null;
  nome: string;
  stageName: string;
  amount: number | null;
  closeDate: string;
  probability: number | null;
  type: string;
  ownerId: string;
  actionPreview: string;
  warnings: string[];
}

interface OpportunityPreviewData {
  contractId: string;
  totalOpportunities: number;
  resolvedCount: number;
  existingMatchCount: number;
  unresolvedCount: number;
  missingFieldsCount: number;
  contactRoleLacuna: boolean;
  items: OpportunityPreviewItem[];
}

interface LeadRecord {
  Id: string | null;
  Name: string | null;
  Company: string | null;
  Status: string | null;
  Email: string | null;
  OwnerId: string | null;
  CreatedDate: string | null;
  LastModifiedDate: string | null;
}

interface OpportunitySyncResult {
  contractId: string;
  entity: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  unresolvedAccountCount: number;
  errorCount: number;
  outcome: string;
}

type OpportunityPreviewState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; contractId: string; preview: OpportunityPreviewData }
  | { phase: 'error'; message: string };

type OpportunitySyncState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; result: OpportunitySyncResult }
  | { phase: 'error'; message: string };

const INDUSTRY_STANDARD_OPTIONS = [
  'Tecnologia',
  'Serviços financeiros',
  'Seguros',
  'Saúde',
  'Farmacêutico',
  'Varejo',
  'Educação',
  'Indústria',
  'Energia',
  'Telecomunicações',
  'Agronegócio',
  'Logística',
  'Alimentos e bebidas',
  'Serviços profissionais',
  'Setor público',
  'Outro',
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

function getAccountPreviewRowKey(record: AccountsPreviewRecord, index: number): string {
  return record.Id?.trim() || `${record.Name?.trim() || 'account'}-${index}`;
}

function getAccountPreviewRowLabel(record: AccountsPreviewRecord, index: number): string {
  return record.Name?.trim() || record.Id?.trim() || `Account ${index + 1}`;
}

function getAccountQualityResolutionKey(rowKey: string, field: AccountQualityField): string {
  return `${rowKey}::${field}`;
}

function getAccountQualityFieldFromGap(gap: string): AccountQualityField | null {
  const field = gap.replace(/^sem\s+/i, '').trim();
  if (field === 'Id' || field === 'Name' || field === 'Website' || field === 'Industry' || field === 'Type' || field === 'OwnerId') {
    return field;
  }
  return null;
}

function getAccountQualityGapForField(field: AccountQualityField): string {
  return `sem ${field}`;
}

function getDefaultAccountQualityDecision(field: AccountQualityField, isBlocking: boolean): AccountQualityDecision {
  if (isBlocking || field === 'Id' || field === 'Name') return 'blocker';
  if (field === 'Industry') return 'manual';
  if (field === 'Website') return 'fix_salesforce';
  return 'accept';
}

function getAccountPreviewRowGaps(record: AccountsPreviewRecord): string[] {
  const gaps: string[] = [];
  if (!record.Id?.trim()) gaps.push('sem Id');
  if (!record.Name?.trim()) gaps.push('sem Name');
  return gaps;
}

function getAccountPreviewRowRecommendedGaps(record: AccountsPreviewRecord): string[] {
  const gaps: string[] = [];
  if (!record.Website?.trim()) gaps.push('sem Website');
  if (!record.Industry?.trim()) gaps.push('sem Industry');
  if (!record.Type?.trim()) gaps.push('sem Type');
  if (!record.OwnerId?.trim()) gaps.push('sem OwnerId');
  return gaps;
}

function buildAccountPreviewRows(records: AccountsPreviewRecord[]): PreparedAccountsPreviewRow[] {
  return records.map((record, index) => {
    const gaps = getAccountPreviewRowGaps(record);
    const recommendedGaps = getAccountPreviewRowRecommendedGaps(record);
    return {
      key: getAccountPreviewRowKey(record, index),
      label: getAccountPreviewRowLabel(record, index),
      gaps,
      recommendedGaps,
      isValid: gaps.length === 0,
      record,
    };
  });
}

function formatBlockingFieldsMessage(rows: PreparedAccountsPreviewRow[]): string {
  const uniqueGaps = Array.from(new Set(rows.flatMap((row) => row.gaps)));
  if (uniqueGaps.length === 0) return 'Campos mínimos ausentes na leitura atual.';
  return `Campos bloqueadores: ${uniqueGaps.join(', ')}.`;
}

function buildLocalPreSyncContract(summary: PreparedAccountsPreviewSummary, preview: AccountsPreviewResult): LocalPreSyncContract {
  return {
    createdAt: new Date().toISOString(),
    source: 'Salesforce OAuth',
    objectApiName: 'Account',
    mode: 'read-only',
    previewLimit: preview.limit,
    totalLoaded: preview.records.length,
    totalSelected: summary.selectedCount,
    totalValid: summary.validCount,
    totalWithGaps: summary.rowsWithGapsCount,
    fieldsConsidered: ['Id', 'Name', 'Website', 'Industry', 'Type', 'OwnerId', 'CreatedDate', 'LastModifiedDate'],
    records: summary.rows.map((row) => ({
      Id: row.record.Id,
      Name: row.record.Name,
      Website: row.record.Website,
      Industry: row.record.Industry,
      Type: row.record.Type,
      OwnerId: row.record.OwnerId,
      status: row.isValid && row.recommendedGaps.length === 0 ? 'válido' : 'com lacunas',
      gaps: row.gaps,
      recommendedGaps: row.recommendedGaps,
    })),
  };
}

function getLocalPreSyncDryRunReasons(row: LocalPreSyncContractRow): string[] {
  const reasons: string[] = [];
  if (!row.Id?.trim()) reasons.push('sem Id');
  if (!row.Name?.trim()) reasons.push('sem Name');
  reasons.push(...row.recommendedGaps);
  return reasons;
}

function classifyLocalPreSyncDryRunRow(row: LocalPreSyncContractRow, index: number): LocalPreSyncDryRunRow {
  const reasons = getLocalPreSyncDryRunReasons(row);
  const isBlocked = reasons.includes('sem Id') || reasons.includes('sem Name');
  const isAlert = !isBlocked && row.recommendedGaps.length > 0;

  return {
    key: `${row.Id || row.Name || 'account'}-${index}`,
    label: row.Name?.trim() || row.Id?.trim() || `Account ${index + 1}`,
    status: isBlocked ? 'bloqueado para sync' : isAlert ? 'com alertas' : 'apto para sync read-only futuro',
    reasons:
      isBlocked || isAlert
        ? reasons
        : ['pronto para o dry-run read-only futuro'],
    record: row,
  };
}

function buildLocalPreSyncDryRun(contract: LocalPreSyncContract): LocalPreSyncDryRun {
  const rows = contract.records.map(classifyLocalPreSyncDryRunRow);

  return {
    createdAt: new Date().toISOString(),
    source: contract.source,
    objectApiName: contract.objectApiName,
    mode: 'dry-run read-only',
    contractTotal: contract.records.length,
    aptoCount: rows.filter((row) => row.status === 'apto para sync read-only futuro').length,
    alertCount: rows.filter((row) => row.status === 'com alertas').length,
    blockedCount: rows.filter((row) => row.status === 'bloqueado para sync').length,
    fieldsEvaluated: contract.fieldsConsidered,
    rows,
  };
}
const METHODS: MethodDefinition[] = [
  {
    id: 'oauth',
    title: 'Conectar via Salesforce',
    description: 'Recomendado para conexão contínua. Usa a conexão autorizada do Salesforce para buscar dados com segurança.',
    badge: 'Recomendado',
    badgeVariant: 'blue',
    icon: <Network className="h-4 w-4" />,
    panel: {
      lines: [
        'Conexão contínua com a sua conta do Salesforce.',
        'Permite buscar dados com segurança, sem expor senhas.',
      ],
    },
  },
  {
    id: 'token',
    title: 'Validar com acesso pontual',
    description: 'Alternativa para validação rápida usando um token temporário.',
    badge: 'Validação pontual',
    badgeVariant: 'amber',
    icon: <KeyRound className="h-4 w-4" />,
    panel: { lines: [] },
  },
  {
    id: 'csv',
    title: 'Usar arquivo CSV',
    description: 'Alternativa local, sem conexão direta. Importe um arquivo exportado do Salesforce.',
    badge: 'Sem conexão',
    badgeVariant: 'slate',
    icon: <FileJson className="h-4 w-4" />,
    panel: {
      lines: [
        'Use planilhas CSV exportadas diretamente do Salesforce.',
        'Nenhuma conexão contínua será mantida.',
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

const ACCOUNT_PREVIEW_LIMIT_OPTIONS = [10, 25, 50, 100, 200] as const;

export function SalesforceMethodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<SalesforceMethod>('oauth');

  const [instanceUrl, setInstanceUrl] = useState('');
  const [token, setToken] = useState('');
  const [apiVersion, setApiVersion] = useState('v66.0');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [result, setResult] = useState<TestSuccessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusResult | null>(null);
  const [oauthLoading, setOauthLoading] = useState(true);
  const [oauthActionLoading, setOauthActionLoading] = useState<'connect' | 'health' | 'disconnect' | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [oauthConfig, setOauthConfig] = useState<OAuthConfigResult | null>(null);
  const [oauthConfigLoading, setOauthConfigLoading] = useState(true);
  const [oauthConfigSaving, setOauthConfigSaving] = useState(false);
  const [oauthConfigError, setOauthConfigError] = useState<string | null>(null);
  const [showOAuthConfigForm, setShowOAuthConfigForm] = useState(false);
  const [lastValidationPulseAt, setLastValidationPulseAt] = useState<string | null>(null);
  const [accountPreviewLimit, setAccountPreviewLimit] = useState<number>(50);
  const [accountsPreview, setAccountsPreview] = useState<AccountsPreviewResult | null>(null);
  const [accountsPreviewLoading, setAccountsPreviewLoading] = useState(false);
  const [accountsPreviewError, setAccountsPreviewError] = useState<string | null>(null);
  const [selectedAccountPreviewKeys, setSelectedAccountPreviewKeys] = useState<string[]>([]);
  const [preparedAccountsPreviewSelection, setPreparedAccountsPreviewSelection] = useState<PreparedAccountsPreviewSummary | null>(null);
  const [localPreSyncContract, setLocalPreSyncContract] = useState<LocalPreSyncContract | null>(null);
  const [localPreSyncDryRun, setLocalPreSyncDryRun] = useState<LocalPreSyncDryRun | null>(null);
  const [selectionFeedback, setSelectionFeedback] = useState<string | null>(null);
  const [contractFeedback, setContractFeedback] = useState<string | null>(null);
  const [dryRunFeedback, setDryRunFeedback] = useState<string | null>(null);
  const [contractJustGenerated, setContractJustGenerated] = useState(false);
  const [dryRunJustCompleted, setDryRunJustCompleted] = useState(false);
  const [prepareButtonBusy, setPrepareButtonBusy] = useState(false);
  const [contractButtonGenerated, setContractButtonGenerated] = useState(false);
  const [dryRunButtonBusy, setDryRunButtonBusy] = useState(false);
  const [accountQualityResolutions, setAccountQualityResolutions] = useState<Record<string, AccountQualityResolution>>({});
  const [confirmedIndustryItems, setConfirmedIndustryItems] = useState<Record<string, string>>({});
  const [editingResolutionKeys, setEditingResolutionKeys] = useState<Set<string>>(new Set());
  const [showAllQualityItems, setShowAllQualityItems] = useState(false);
  const [accountSyncState, setAccountSyncState] = useState<AccountSyncState>({ phase: 'idle' });
  const [activeObject, setActiveObject] = useState<'accounts' | 'contacts' | 'opportunities'>('accounts');
  const [contactPreviewState, setContactPreviewState] = useState<ContactPreviewState>({ phase: 'idle' });
  const [contactSyncState, setContactSyncState] = useState<ContactSyncState>({ phase: 'idle' });
  const [opportunityPreviewState, setOpportunityPreviewState] = useState<OpportunityPreviewState>({ phase: 'idle' });
  const [opportunitySyncState, setOpportunitySyncState] = useState<OpportunitySyncState>({ phase: 'idle' });
  const [configurationCompleted, setConfigurationCompleted] = useState(false);
  const [accountsFullLoadState, setAccountsFullLoadState] = useState<{ phase: 'idle' | 'loading' | 'done' | 'error'; totalLoaded?: number; message?: string }>({ phase: 'idle' });
  const [contactFullLoadState, setContactFullLoadState] = useState<{ phase: 'idle' | 'loading' | 'done' | 'error'; recordCount?: number; message?: string }>({ phase: 'idle' });
  const [opportunityFullLoadState, setOpportunityFullLoadState] = useState<{ phase: 'idle' | 'loading' | 'done' | 'error'; recordCount?: number; message?: string }>({ phase: 'idle' });
  const [leadLoadState, setLeadLoadState] = useState<{ phase: 'idle' | 'loading' | 'done' | 'error'; records?: LeadRecord[]; totalSize?: number; message?: string }>({ phase: 'idle' });
  const [hubRefreshState, setHubRefreshState] = useState<{ phase: 'idle' | 'loading' | 'done' | 'error'; message?: string; updatedAt?: string }>({ phase: 'idle' });
  const resetAccountSyncStateToIdle = useCallback((force = false) => {
    setAccountSyncState((current) => (force || current.phase !== 'loading' ? { phase: 'idle' } : current));
  }, []);
  const resetAccountsOperationalSession = useCallback(() => {
    setAccountsPreview(null);
    setAccountsPreviewLoading(false);
    setAccountsPreviewError(null);
    setSelectedAccountPreviewKeys([]);
    setPreparedAccountsPreviewSelection(null);
    setLocalPreSyncContract(null);
    setLocalPreSyncDryRun(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setDryRunFeedback(null);
    setAccountQualityResolutions({});
    setConfirmedIndustryItems({});
    setEditingResolutionKeys(new Set());
    setContractJustGenerated(false);
    setDryRunJustCompleted(false);
    setPrepareButtonBusy(false);
    setContractButtonGenerated(false);
    setDryRunButtonBusy(false);
    resetAccountSyncStateToIdle(true);
  }, [resetAccountSyncStateToIdle]);
  const accountSyncInputsSignatureRef = useRef('');
  const contractCardRef = useRef<HTMLDivElement | null>(null);
  const dryRunCardRef = useRef<HTMLDivElement | null>(null);
  const prevOAuthConfiguredRef = useRef(false);
  const prevOAuthConnectedRef = useRef(false);
  const hydratingHubStateRef = useRef(true);
  const buildResolvedAccountRows = useCallback((rows: PreparedAccountsPreviewRow[]): PreparedAccountsPreviewRow[] => {
    return rows.flatMap((row) => {
      const hasRemoveDecision = [...row.gaps, ...row.recommendedGaps].some((gap) => {
        const field = getAccountQualityFieldFromGap(gap);
        if (!field) return false;
        return accountQualityResolutions[getAccountQualityResolutionKey(row.key, field)]?.decision === 'remove';
      });
      if (hasRemoveDecision) return [];

      const nextRecord: AccountsPreviewRecord = { ...row.record };
      const nextGaps = [...row.gaps];
      const nextRecommendedGaps = [...row.recommendedGaps];

      [...row.gaps, ...row.recommendedGaps].forEach((gap) => {
        const field = getAccountQualityFieldFromGap(gap);
        if (!field) return;
        const resolution = accountQualityResolutions[getAccountQualityResolutionKey(row.key, field)];
        if (!resolution) return;

        const rawValue = resolution.value ?? '';
        const resolutionValue = rawValue.startsWith('__custom__:')
          ? rawValue.slice(11)
          : rawValue === '__ai__'
            ? ''
            : rawValue;

        if (resolution.decision === 'manual' && resolutionValue.trim()) {
          nextRecord[field] = resolutionValue.trim();
          const fieldGap = getAccountQualityGapForField(field);
          const blockerIndex = nextGaps.indexOf(fieldGap);
          if (blockerIndex >= 0) nextGaps.splice(blockerIndex, 1);
          const warningIndex = nextRecommendedGaps.indexOf(fieldGap);
          if (warningIndex >= 0) nextRecommendedGaps.splice(warningIndex, 1);
          return;
        }

        if (resolution.decision === 'accept') {
          const warningIndex = nextRecommendedGaps.indexOf(getAccountQualityGapForField(field));
          if (warningIndex >= 0) nextRecommendedGaps.splice(warningIndex, 1);
          return;
        }

        if (resolution.decision === 'blocker') {
          const fieldGap = getAccountQualityGapForField(field);
          const warningIndex = nextRecommendedGaps.indexOf(fieldGap);
          if (warningIndex >= 0) nextRecommendedGaps.splice(warningIndex, 1);
          if (!nextGaps.includes(fieldGap)) nextGaps.push(fieldGap);
        }
      });

      return [{
        ...row,
        gaps: nextGaps,
        recommendedGaps: nextRecommendedGaps,
        isValid: nextGaps.length === 0,
        record: nextRecord,
      }];
    });
  }, [accountQualityResolutions]);
  const [oauthConfigForm, setOauthConfigForm] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:3053/api/account-connectors/salesforce/oauth/callback',
    loginUrl: 'https://login.salesforce.com',
  });

  const activeMethod = METHODS.find((m) => m.id === selected)!;
  const oauthFlowStatus = searchParams?.get('salesforceOAuthStatus');

  const loadOAuthStatus = useCallback(async () => {
    setOauthLoading(true);
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/status', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as OAuthStatusResult;
      setOauthStatus(data);
    } catch {
      setOauthStatus({
        configured: false,
        connected: false,
        status: 'error',
        error: 'Não foi possível carregar o estado OAuth.',
      });
    } finally {
      setOauthLoading(false);
    }
  }, []);

  const loadOAuthConfig = useCallback(async () => {
    setOauthConfigLoading(true);
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/config', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as OAuthConfigResult;
      setOauthConfig(data);
      setOauthConfigForm((prev) => ({
        ...prev,
        redirectUri: data.redirectUri || prev.redirectUri,
        loginUrl: data.loginUrl || prev.loginUrl,
      }));
    } catch {
      setOauthConfigError('Não foi possível carregar a configuração OAuth.');
    } finally {
      setOauthConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOAuthStatus();
    loadOAuthConfig();
  }, [loadOAuthStatus, loadOAuthConfig]);

  const loadHubHydration = useCallback(async () => {
    hydratingHubStateRef.current = true;
    setHubRefreshState((current) => (current.phase === 'loading' ? current : { phase: 'loading', message: 'Recarregando estado...' }));

    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/hub-state', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as SalesforceHubHydrationResponse;

      if (!res.ok || data.status !== 'success' || !data.canopi) {
        setHubRefreshState({ phase: 'error', message: 'Não foi possível recarregar o estado do Hub.' });
        return;
      }

      const accountPreview = data.canopi.accounts?.preview ?? null;
      if (accountPreview) {
        setAccountsPreview(accountPreview);
        setAccountsPreviewError(null);
        const hydratedRows = buildAccountPreviewRows(accountPreview.records);
        const hydratedSelectedKeys = hydratedRows.map((row) => row.key);
        const hydratedSelectedRows = buildResolvedAccountRows(hydratedRows);
        const hydratedSelection: PreparedAccountsPreviewSummary = {
          preparedAt: data.hydratedAt ?? new Date().toISOString(),
          selectedCount: hydratedSelectedRows.length,
          validCount: hydratedSelectedRows.filter((row) => row.isValid).length,
          rowsWithGapsCount: hydratedSelectedRows.filter((row) => row.gaps.length > 0 || row.recommendedGaps.length > 0).length,
          rows: hydratedSelectedRows,
        };
        const hydratedContract = buildLocalPreSyncContract(hydratedSelection, accountPreview);
        const hydratedDryRun = buildLocalPreSyncDryRun(hydratedContract);

        setSelectedAccountPreviewKeys(hydratedSelectedKeys);
        setPreparedAccountsPreviewSelection(hydratedSelection);
        setLocalPreSyncContract(hydratedContract);
        setLocalPreSyncDryRun(hydratedDryRun);
        setSelectionFeedback('Estado restaurado do último sync persistido.');
        setContractFeedback('Contrato local restaurado do último sync persistido.');
        setDryRunFeedback('Dry-run read-only restaurado do último sync persistido.');
        setContractJustGenerated(true);
        setDryRunJustCompleted(true);
      }

      if (data.canopi.accounts) {
        const hydratedAccounts = data.canopi.accounts;
        const accountSync = hydratedAccounts.latestSync ?? null;
        if (accountSync) {
          setAccountSyncState({
            phase: 'done',
            contractId: hydratedAccounts.contractId ?? 'persisted',
            result: {
              createdCount: accountSync.createdCount ?? 0,
              updatedCount: accountSync.updatedCount ?? 0,
              skippedCount: accountSync.skippedCount ?? 0,
              errorCount: accountSync.errorCount ?? 0,
              outcome: accountSync.outcome ?? 'synced',
            },
          });
          setAccountsFullLoadState({
            phase: 'done',
            totalLoaded: hydratedAccounts.count,
            message: 'Estado restaurado do último Account Sync.',
          });
        }
      }

      if (data.canopi.contacts) {
        const hydratedContacts = data.canopi.contacts;
        const contactSync = hydratedContacts.latestSync ?? null;
        if (contactSync) {
          setContactSyncState({
            phase: 'done',
            result: {
              contractId: hydratedContacts.contractId ?? 'persisted',
              entity: 'Contact',
              createdCount: contactSync.createdCount ?? 0,
              updatedCount: contactSync.updatedCount ?? 0,
              skippedCount: contactSync.skippedCount ?? 0,
              errorCount: contactSync.errorCount ?? 0,
              outcome: contactSync.outcome ?? 'synced',
            },
          });
          setContactFullLoadState({
            phase: 'done',
            recordCount: hydratedContacts.count,
            message: 'Estado restaurado do último Contact Sync.',
          });
        } else if (hydratedContacts.preview) {
          setContactFullLoadState({
            phase: 'done',
            recordCount: hydratedContacts.preview.totalContacts,
            message: 'Estado restaurado da última prévia de Contacts.',
          });
        }

        if (hydratedContacts.preview) {
          setContactPreviewState({
            phase: 'done',
            contractId: hydratedContacts.contractId ?? 'persisted',
            preview: hydratedContacts.preview,
            contractSource: 'fallback',
          });
        }
      }

      if (data.canopi.opportunities) {
        const hydratedOpportunities = data.canopi.opportunities;
        const opportunitySync = hydratedOpportunities.latestSync ?? null;
        if (opportunitySync) {
          setOpportunitySyncState({
            phase: 'done',
            result: {
              contractId: hydratedOpportunities.contractId ?? 'persisted',
              entity: 'Opportunity',
              createdCount: opportunitySync.createdCount ?? 0,
              updatedCount: opportunitySync.updatedCount ?? 0,
              skippedCount: opportunitySync.skippedCount ?? 0,
              unresolvedAccountCount: opportunitySync.unresolvedAccountCount ?? 0,
              errorCount: opportunitySync.errorCount ?? 0,
              outcome: opportunitySync.outcome ?? 'synced',
            },
          });
          setOpportunityFullLoadState({
            phase: 'done',
            recordCount: hydratedOpportunities.count,
            message: 'Estado restaurado do último Opportunity Sync.',
          });
        } else if (hydratedOpportunities.preview) {
          setOpportunityFullLoadState({
            phase: 'done',
            recordCount: hydratedOpportunities.preview.items.length,
            message: 'Estado restaurado da última prévia de Opportunities.',
          });
        }

        if (hydratedOpportunities.preview) {
          setOpportunityPreviewState({
            phase: 'done',
            contractId: hydratedOpportunities.contractId ?? 'persisted',
            preview: hydratedOpportunities.preview,
          });
        }
      }

      setConfigurationCompleted(Boolean(data.configurationCompleted));
      setHubRefreshState({
        phase: 'done',
        message: 'Estado atualizado agora',
        updatedAt: data.hydratedAt ?? new Date().toISOString(),
      });
    } catch {
      setHubRefreshState({ phase: 'error', message: 'Não foi possível recarregar o estado do Hub.' });
      // Mantém a tela funcional mesmo sem hidratação persistida.
    } finally {
      hydratingHubStateRef.current = false;
    }
  }, [buildResolvedAccountRows]);

  useEffect(() => {
    void loadHubHydration();
  }, [loadHubHydration]);

  useEffect(() => {
    if (!oauthFlowStatus) return;

    const notices: Record<string, string> = {
      success: 'Conexão OAuth concluída com sucesso.',
      config_missing: 'Configuração OAuth pendente. Salve a External Client App para habilitar a conexão.',
      authorization_denied: 'Autorização OAuth não concluída no Salesforce.',
      invalid_state: 'Validação de segurança OAuth falhou (state inválido).',
      missing_code: 'Callback OAuth sem código de autorização.',
      callback_error: 'Não foi possível concluir o callback OAuth.',
    };

    setOauthNotice(notices[oauthFlowStatus] || 'Fluxo OAuth retornou com status não mapeado.');
    loadOAuthStatus();

    const next = new URL(window.location.href);
    next.searchParams.delete('salesforceOAuthStatus');
    router.replace(`${next.pathname}${next.search}`);
  }, [oauthFlowStatus, loadOAuthStatus, router]);

  useEffect(() => {
    if (!oauthStatus?.configured) {
      setShowOAuthConfigForm(true);
      prevOAuthConfiguredRef.current = false;
      prevOAuthConnectedRef.current = false;
      return;
    }

    if (prevOAuthConnectedRef.current && !oauthStatus.connected) {
      resetAccountsOperationalSession();
      setShowOAuthConfigForm(false);
    } else if (oauthStatus.connected && !prevOAuthConnectedRef.current) {
      setShowOAuthConfigForm(false);
    } else if (!oauthStatus.connected && !prevOAuthConfiguredRef.current) {
      setShowOAuthConfigForm(false);
    }

    prevOAuthConfiguredRef.current = oauthStatus.configured;
    prevOAuthConnectedRef.current = oauthStatus.connected;
  }, [oauthStatus, resetAccountsOperationalSession]);

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

  function handleOAuthConnect() {
    setOauthActionLoading('connect');
    window.location.href = '/api/account-connectors/salesforce/oauth/start?force_login=1';
  }

  async function handleOAuthConfigSave() {
    setOauthConfigSaving(true);
    setOauthConfigError(null);
    setOauthNotice(null);

    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: oauthConfigForm.clientId,
          clientSecret: oauthConfigForm.clientSecret,
          redirectUri: oauthConfigForm.redirectUri,
          loginUrl: oauthConfigForm.loginUrl,
          scopes: ['api', 'refresh_token'],
        }),
      });

      const data = (await res.json()) as { status?: string; error?: string; config?: OAuthConfigResult };
      if (!res.ok || data.status === 'error') {
        setOauthConfigError(data.error || 'Não foi possível salvar a configuração OAuth.');
        return;
      }

      if (data.config) {
        setOauthConfig(data.config);
      }

      setOauthConfigForm((prev) => ({ ...prev, clientSecret: '' }));
      setOauthNotice('Configuração OAuth salva.');
      await loadOAuthStatus();
      await loadOAuthConfig();
    } catch {
      setOauthConfigError('Não foi possível salvar a configuração OAuth.');
    } finally {
      setOauthConfigSaving(false);
    }
  }

  async function handleCopyCallbackUrl() {
    try {
      const text = oauthConfigForm.redirectUri.trim();
      await navigator.clipboard.writeText(text);
      setOauthNotice('Callback URL copiada.');
    } catch {
      setOauthNotice('Não foi possível copiar a callback URL.');
    }
  }

  async function handleOAuthHealthCheck(): Promise<boolean> {
    setOauthActionLoading('health');
    setOauthNotice(null);
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/health', {
        method: 'POST',
        cache: 'no-store',
      });
      const data = (await res.json()) as OAuthStatusResult & { error?: string };
      setOauthStatus(data);
      if (res.ok) {
        setLastValidationPulseAt(new Date().toISOString());
        setOauthNotice('Conexão validada com sucesso agora.');
        return true;
      } else {
        setOauthNotice(data.error || 'Não foi possível validar a conexão OAuth.');
        return false;
      }
    } catch {
      setOauthNotice('Não foi possível validar a conexão OAuth.');
      return false;
    } finally {
      setOauthActionLoading(null);
    }
  }

  const handleLoadAccountsPreview = useCallback(async () => {
    if (!oauthStatus?.connected) {
      setAccountsPreviewError('Conecte o Salesforce via OAuth para carregar o preview read-only de Accounts.');
      return;
    }

    setAccountsPreviewLoading(true);
    setAccountsPreviewError(null);
    setOauthNotice(null);
    setSelectedAccountPreviewKeys([]);
    setPreparedAccountsPreviewSelection(null);
    setLocalPreSyncContract(null);
    setLocalPreSyncDryRun(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setDryRunFeedback(null);
    setContractJustGenerated(false);
    setDryRunJustCompleted(false);
    setContractButtonGenerated(false);
    setDryRunButtonBusy(false);
    resetAccountSyncStateToIdle();

    try {
      const res = await fetch(`/api/account-connectors/salesforce/oauth/accounts?limit=${accountPreviewLimit}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as AccountsPreviewApiResponse;

      if (!res.ok || data.status !== 'success' || !data.preview) {
        setAccountsPreview(null);
        setAccountsPreviewError(data.error || 'Não foi possível carregar o preview read-only de Accounts.');
        return;
      }

      setAccountsPreview(data.preview);
      setSelectedAccountPreviewKeys([]);
    } catch {
      setAccountsPreview(null);
      setAccountsPreviewError('Não foi possível carregar o preview read-only de Accounts.');
    } finally {
      setAccountsPreviewLoading(false);
    }
  }, [accountPreviewLimit, oauthStatus?.connected, resetAccountSyncStateToIdle]);

  function toggleAccountPreviewRowSelection(rowKey: string) {
    setPreparedAccountsPreviewSelection(null);
    setLocalPreSyncContract(null);
    setLocalPreSyncDryRun(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setDryRunFeedback(null);
    setContractJustGenerated(false);
    setDryRunJustCompleted(false);
    setContractButtonGenerated(false);
    setDryRunButtonBusy(false);
    setPrepareButtonBusy(false);
    resetAccountSyncStateToIdle();
    setSelectedAccountPreviewKeys((current) =>
      current.includes(rowKey) ? current.filter((key) => key !== rowKey) : [...current, rowKey]
    );
  }

  function handleToggleSelectAllAccountPreviewRows() {
    setPreparedAccountsPreviewSelection(null);
    setLocalPreSyncContract(null);
    setLocalPreSyncDryRun(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setDryRunFeedback(null);
    setContractJustGenerated(false);
    setDryRunJustCompleted(false);
    setContractButtonGenerated(false);
    setDryRunButtonBusy(false);
    setPrepareButtonBusy(false);
    resetAccountSyncStateToIdle();
    setSelectedAccountPreviewKeys((current) => (current.length === accountPreviewRows.length ? [] : accountPreviewRows.map((row) => row.key)));
  }

  const handlePrepareAccountPreviewSelection = useCallback((): LocalPreSyncContract | null => {
    if (!accountsPreview) {
      setOauthNotice('Accounts carregadas ausentes. Carregue Accounts antes de preparar a etapa técnica.');
      document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return null;
    }

    setPrepareButtonBusy(true);
    setOauthNotice(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setContractJustGenerated(false);
    setContractButtonGenerated(false);

    try {
      const selectedRows = buildResolvedAccountRows(accountsPreview.records
        .map((record, index) => {
          const gaps = getAccountPreviewRowGaps(record);
          const recommendedGaps = getAccountPreviewRowRecommendedGaps(record);
          return {
            key: getAccountPreviewRowKey(record, index),
            label: getAccountPreviewRowLabel(record, index),
            gaps,
            recommendedGaps,
            isValid: gaps.length === 0,
            record,
          };
        })
        .filter((row) => selectedAccountPreviewKeys.includes(row.key)));

      if (selectedRows.length === 0) {
        setOauthNotice('Nenhuma Account selecionada. Selecione pelo menos um registro antes de preparar a etapa técnica.');
        document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return null;
      }

      const selectedValidCount = selectedRows.filter((row) => row.gaps.length === 0).length;
      if (selectedValidCount === 0) {
        setPreparedAccountsPreviewSelection(null);
        setLocalPreSyncContract(null);
        setOauthNotice(`Nenhuma Account com Id e Name foi encontrada nesta leitura. ${formatBlockingFieldsMessage(selectedRows)}`);
        document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return null;
      }

      resetAccountSyncStateToIdle();
      setLocalPreSyncDryRun(null);
      setDryRunFeedback(null);
      setDryRunJustCompleted(false);
      setDryRunButtonBusy(false);

      const validCount = selectedValidCount;
      const rowsWithGapsCount = selectedRows.filter((row) => row.gaps.length > 0 || row.recommendedGaps.length > 0).length;
      const nextSelection = {
        preparedAt: new Date().toISOString(),
        selectedCount: selectedRows.length,
        validCount,
        rowsWithGapsCount,
        rows: selectedRows,
      };
      const nextContract = buildLocalPreSyncContract(nextSelection, accountsPreview);

      setPreparedAccountsPreviewSelection(nextSelection);
      setLocalPreSyncContract(nextContract);
      const hasRecommendedGaps = selectedRows.some((row) => row.recommendedGaps.length > 0);
      setSelectionFeedback(hasRecommendedGaps ? 'Seleção preparada. Contrato local criado com lacunas não bloqueadoras.' : 'Seleção preparada. Contrato local criado nesta sessão.');
      setContractFeedback(hasRecommendedGaps ? 'Contrato local criado com lacunas não bloqueadoras.' : 'Contrato local criado nesta sessão.');
      setContractJustGenerated(true);
      setContractButtonGenerated(true);

      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          contractCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      return nextContract;
    } catch (error) {
      setPreparedAccountsPreviewSelection(null);
      setLocalPreSyncContract(null);
      setSelectionFeedback(null);
      setContractFeedback(null);
      setContractJustGenerated(false);
      setContractButtonGenerated(false);
      setOauthNotice(
        `Não foi possível criar o contrato local: ${error instanceof Error && error.message ? error.message : 'erro inesperado'}.`
      );
      return null;
    } finally {
      setPrepareButtonBusy(false);
    }
  }, [accountsPreview, buildResolvedAccountRows, resetAccountSyncStateToIdle, selectedAccountPreviewKeys]);

  function handleGenerateLocalPreSyncContract() {
    if (!preparedAccountsPreviewSelection || !accountsPreview) return;
    setLocalPreSyncDryRun(null);
    setDryRunFeedback(null);
    setDryRunJustCompleted(false);
    setDryRunButtonBusy(false);
    const nextContract = buildLocalPreSyncContract(preparedAccountsPreviewSelection, accountsPreview);
    setLocalPreSyncContract(nextContract);
    setContractFeedback('Contrato local gerado nesta sessão.');
    setContractJustGenerated(true);
    setContractButtonGenerated(true);
    setTimeout(() => {
      contractCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  const handleExecuteLocalDryRun = useCallback((contractOverride?: LocalPreSyncContract | null): Promise<boolean> => {
    const contractToRun = contractOverride ?? localPreSyncContract;
    if (!contractToRun) {
      setDryRunFeedback('Contrato local pendente. Prepare a seleção antes de executar o dry-run read-only.');
      return Promise.resolve(false);
    }

    setDryRunButtonBusy(true);
    setDryRunFeedback(null);
    setLocalPreSyncDryRun(null);

    return new Promise((resolve) => {
      const executeDryRun = () => {
        try {
          const nextDryRun = buildLocalPreSyncDryRun(contractToRun);
          setLocalPreSyncDryRun(nextDryRun);
          setDryRunFeedback('Dry-run read-only concluído nesta sessão.');
          setDryRunJustCompleted(true);
          if (typeof window !== 'undefined') {
            window.setTimeout(() => {
              dryRunCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
          }
          resolve(true);
        } catch (error) {
          setDryRunFeedback(
            `Não foi possível executar o dry-run read-only: ${error instanceof Error && error.message ? error.message : 'erro inesperado'}.`
          );
          setDryRunJustCompleted(false);
          resolve(false);
        } finally {
          setDryRunButtonBusy(false);
        }
      };

      if (typeof window !== 'undefined') {
        window.setTimeout(executeDryRun, 120);
      } else {
        executeDryRun();
      }
    });
  }, [localPreSyncContract]);

  const handleExecuteAccountSync = useCallback(async (source: 'main' | 'advanced' = 'advanced'): Promise<boolean> => {
    if (!preparedAccountsPreviewSelection || !accountsPreview || !localPreSyncContract || !localPreSyncDryRun) {
      setOauthNotice('Accounts exigem preparação técnica antes do sync real.');
      document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    if (preparedAccountsPreviewSelection.validCount === 0 || localPreSyncDryRun.aptoCount === 0) {
      setOauthNotice('Nenhuma Account com Id e Name está pronta para sincronização nesta sessão. Revise a preparação técnica antes de continuar.');
      document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }

    if (accountSyncState.phase === 'loading') return false;

    setAccountSyncState({ phase: 'loading' });
    try {
      const selectedRecords = preparedAccountsPreviewSelection.rows.map((row) => ({
        Id: row.record.Id,
        Name: row.record.Name,
        Website: row.record.Website,
        Industry: row.record.Industry,
        Type: row.record.Type,
        OwnerId: row.record.OwnerId,
        CreatedDate: row.record.CreatedDate,
        LastModifiedDate: row.record.LastModifiedDate,
        id: row.record.Id,
        displayName: row.label,
        fieldValues: { ...row.record },
      }));

      const contract = {
        source: 'salesforce-oauth',
        mode: 'assistant-account-sync',
        entities: [
          {
            objectApiName: 'Account',
            label: 'Account',
            selectedRecords,
          },
        ],
      };

      const dryRunSummary = {
        estimatedRecordsCanSync: preparedAccountsPreviewSelection.validCount,
      };

      const saveContractRes = await fetch('/api/account-connectors/salesforce/oauth/sync-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract, dryRunSummary }),
        cache: 'no-store',
      });
      const saveContractData = await saveContractRes.json();
      if (!saveContractRes.ok || saveContractData.status !== 'success' || !saveContractData.syncContract?.id) {
        setAccountSyncState({ phase: 'error', message: saveContractData.error ?? 'Não foi possível salvar o contrato de Accounts.' });
        return false;
      }

      const contractId = saveContractData.syncContract.id as string;
      const mapping = {
        entity: 'Account',
        sourceObjectApiName: 'Account',
        fieldMap: {
          source_external_id: 'Id',
          nome: 'Name',
          dominio: 'Website',
          segmento: 'Industry',
          tipo: 'Type',
        },
        dedupeRule: {
          priority: ['source_external_id', 'domain_match'],
          domainSourceField: 'Website',
          preserveCanopiId: true,
          neverOverwrite: ['id', 'tipoEstrategico', 'playAtivo', 'scoring'],
        },
        sourceExternalIdField: 'Id',
        canonicalDedupeField: 'dominio',
        updatedAt: new Date().toISOString(),
      };

      const mappingRes = await fetch('/api/account-connectors/salesforce/oauth/sync-contract', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, mapping }),
        cache: 'no-store',
      });
      const mappingData = await mappingRes.json();
      if (!mappingRes.ok || mappingData.status !== 'success') {
        setAccountSyncState({ phase: 'error', message: mappingData.error ?? 'Não foi possível salvar o mapeamento de Accounts.' });
        return false;
      }

      const execRes = await fetch('/api/account-connectors/salesforce/oauth/sync-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
        cache: 'no-store',
      });
      const execData = await execRes.json();
      if (!execRes.ok || execData.status !== 'success' || !execData.result) {
        setAccountSyncState({ phase: 'error', message: execData.error ?? 'Erro ao executar sync de Accounts.' });
        return false;
      }

      const result = execData.result as AccountSyncExecutionResult;
      setAccountSyncState({ phase: 'done', contractId, result });
      setTimeout(() => contractCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return true;
    } catch {
      setAccountSyncState({ phase: 'error', message: 'Falha de rede ao executar sync de Accounts.' });
      return false;
    }
  }, [
    accountSyncState.phase,
    accountsPreview,
    localPreSyncContract,
    localPreSyncDryRun,
    preparedAccountsPreviewSelection,
  ]);

  async function handleContactPreview() {
    // Pré-condição: Account Sync deve estar concluído para que o lookup de Accounts esteja disponível.
    // O contractId do Account Sync NÃO é usado como fonte de Contacts — ele é um contrato de Account.
    if (accountSyncState.phase !== 'done') {
      setContactPreviewState({ phase: 'error', message: 'Sincronize Accounts antes de validar Contacts.' });
      return;
    }

    setContactPreviewState({ phase: 'loading' });

    type EligibleContract = { id: string; status: string; contactCount: number; hasAccountLookupSource: boolean; createdAt: string };

    // Busca contratos elegíveis que realmente contenham registros de Contact (contactCount > 0).
    // O backend já filtra por contactCount > 0 em getEligibleSalesforceContactPreviewContracts.
    let eligibleContracts: EligibleContract[] = [];
    try {
      const eligibleRes = await fetch('/api/account-connectors/salesforce/oauth/contact-preview', { cache: 'no-store' });
      const eligibleData = await eligibleRes.json().catch(() => ({})) as { status?: string; contracts?: EligibleContract[]; error?: string };
      if (eligibleData.status !== 'success') {
        setContactPreviewState({ phase: 'error', message: eligibleData.error ?? 'Erro ao buscar contratos de Contacts.' });
        return;
      }
      eligibleContracts = (eligibleData.contracts ?? []).filter((c) => c.contactCount > 0);
    } catch {
      setContactPreviewState({ phase: 'error', message: 'Erro de rede ao buscar contratos de Contacts.' });
      return;
    }

    // Nenhum contrato com registros de Contact encontrado — situação esperada se o usuário
    // ainda não gerou um contrato multi-entidade (Account + Contact).
    if (eligibleContracts.length === 0) {
      setContactPreviewState({
        phase: 'error',
        message:
          'Accounts estão sincronizadas, mas ainda não há fonte de Contacts disponível para preview. Gere ou carregue um contrato multi-entidade com Contacts antes de validar Contact Sync.',
      });
      return;
    }

    // Critério de seleção: synced > hasAccountLookupSource > contactCount > createdAt mais recente.
    const sorted = [...eligibleContracts].sort((a, b) => {
      const byStatus = (b.status === 'synced' ? 1 : 0) - (a.status === 'synced' ? 1 : 0);
      if (byStatus !== 0) return byStatus;
      const byLookup = (b.hasAccountLookupSource ? 1 : 0) - (a.hasAccountLookupSource ? 1 : 0);
      if (byLookup !== 0) return byLookup;
      const byCount = b.contactCount - a.contactCount;
      if (byCount !== 0) return byCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const chosen = sorted[0];

    try {
      const previewRes = await fetch('/api/account-connectors/salesforce/oauth/contact-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: chosen.id }),
        cache: 'no-store',
      });
      const previewData = await previewRes.json().catch(() => ({})) as { status?: string; preview?: ContactPreviewData; error?: string };
      if (previewData.status !== 'success' || !previewData.preview) {
        setContactPreviewState({ phase: 'error', message: previewData.error ?? 'Erro ao gerar preview de Contacts.' });
        return;
      }
      if (previewData.preview.totalContacts === 0) {
        setContactPreviewState({ phase: 'error', message: 'A fonte selecionada não contém Contacts.' });
        return;
      }
      setContactPreviewState({ phase: 'done', contractId: chosen.id, preview: previewData.preview, contractSource: 'fallback' });
    } catch {
      setContactPreviewState({ phase: 'error', message: 'Erro de rede ao gerar preview de Contacts.' });
    }
  }

  async function handleContactSync() {
    if (contactPreviewState.phase !== 'done') return;
    // Guardrail: bloqueia sync se nenhum Contact tem Account resolvida.
    if (contactPreviewState.preview.resolvedCount === 0) {
      setContactSyncState({
        phase: 'error',
        message: 'Contacts encontrados, mas nenhum vínculo com Accounts sincronizadas foi resolvido. Reexecute Account Sync ou selecione um contrato compatível.',
      });
      return;
    }
    const contractId = contactPreviewState.contractId;
    setContactSyncState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/contact-sync-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({})) as { status?: string; result?: ContactSyncResult; error?: string };
      if (data.status !== 'ok' || !data.result) {
        setContactSyncState({ phase: 'error', message: data.error ?? 'Erro ao executar sync de Contacts.' });
        return;
      }
      setContactSyncState({ phase: 'done', result: data.result });
    } catch {
      setContactSyncState({ phase: 'error', message: 'Erro de rede ao executar sync de Contacts.' });
    }
  }

  async function handleOpportunityPreview() {
    if (contactSyncState.phase !== 'done') {
      setOpportunityPreviewState({ phase: 'error', message: 'Valide Contacts antes de validar Opportunities.' });
      return;
    }
    setOpportunityPreviewState({ phase: 'loading' });

    type EligibleOppContract = { id: string; status: string; opportunityCount: number; hasAccountLookupSource: boolean; createdAt: string };

    let eligible: EligibleOppContract[] = [];
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/opportunity-preview', { cache: 'no-store' });
      const data = await res.json().catch(() => ({})) as { status?: string; contracts?: EligibleOppContract[]; error?: string };
      if (data.status !== 'ok') {
        setOpportunityPreviewState({ phase: 'error', message: data.error ?? 'Erro ao buscar contratos de Opportunities.' });
        return;
      }
      eligible = (data.contracts ?? []).filter((c) => c.opportunityCount > 0);
    } catch {
      setOpportunityPreviewState({ phase: 'error', message: 'Erro de rede ao buscar contratos de Opportunities.' });
      return;
    }

    if (eligible.length === 0) {
      setOpportunityPreviewState({
        phase: 'error',
        message: 'Accounts e Contacts estão sincronizados, mas ainda não há fonte de Opportunities disponível para preview. Gere ou carregue um contrato multi-entidade com Opportunities antes de validar Opportunity Sync.',
      });
      return;
    }

    const sorted = [...eligible].sort((a, b) => {
      const byStatus = (b.status === 'synced' ? 1 : 0) - (a.status === 'synced' ? 1 : 0);
      if (byStatus !== 0) return byStatus;
      const byLookup = (b.hasAccountLookupSource ? 1 : 0) - (a.hasAccountLookupSource ? 1 : 0);
      if (byLookup !== 0) return byLookup;
      const byCount = b.opportunityCount - a.opportunityCount;
      if (byCount !== 0) return byCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const chosen = sorted[0];

    try {
      const previewRes = await fetch('/api/account-connectors/salesforce/oauth/opportunity-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: chosen.id }),
        cache: 'no-store',
      });
      const previewData = await previewRes.json().catch(() => ({})) as { status?: string; result?: OpportunityPreviewData; error?: string };
      if (previewData.status !== 'ok' || !previewData.result) {
        setOpportunityPreviewState({ phase: 'error', message: previewData.error ?? 'Erro ao gerar preview de Opportunities.' });
        return;
      }
      if (previewData.result.totalOpportunities === 0) {
        setOpportunityPreviewState({ phase: 'error', message: 'A fonte selecionada não contém Opportunities.' });
        return;
      }
      setOpportunityPreviewState({ phase: 'done', contractId: chosen.id, preview: previewData.result });
    } catch {
      setOpportunityPreviewState({ phase: 'error', message: 'Erro de rede ao gerar preview de Opportunities.' });
    }
  }

  async function handleOpportunitySync() {
    if (opportunityPreviewState.phase !== 'done') return;
    if (opportunityPreviewState.preview.resolvedCount === 0) {
      setOpportunitySyncState({
        phase: 'error',
        message: 'Opportunities encontradas, mas nenhuma Account foi resolvida. Verifique o contrato de Opportunities.',
      });
      return;
    }
    const contractId = opportunityPreviewState.contractId;
    setOpportunitySyncState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/opportunity-sync-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({})) as { status?: string; result?: OpportunitySyncResult; error?: string };
      if (data.status !== 'ok' || !data.result) {
        setOpportunitySyncState({ phase: 'error', message: data.error ?? 'Erro ao executar sync de Opportunities.' });
        return;
      }
      setOpportunitySyncState({ phase: 'done', result: data.result });
    } catch {
      setOpportunitySyncState({ phase: 'error', message: 'Erro de rede ao executar sync de Opportunities.' });
    }
  }

  function handleRevalidateOpportunityPreview() {
    setOpportunitySyncState({ phase: 'idle' });
    void handleOpportunityPreview();
  }

  async function handleLoadAllAccounts() {
    if (!oauthStatus?.connected) return;
    setAccountsFullLoadState({ phase: 'loading' });
    setAccountsPreviewLoading(true);
    setAccountsPreviewError(null);
    setSelectedAccountPreviewKeys([]);
    setPreparedAccountsPreviewSelection(null);
    setLocalPreSyncContract(null);
    setLocalPreSyncDryRun(null);
    setSelectionFeedback(null);
    setContractFeedback(null);
    setDryRunFeedback(null);
    setContractJustGenerated(false);
    setDryRunJustCompleted(false);
    setContractButtonGenerated(false);
    setDryRunButtonBusy(false);
    resetAccountSyncStateToIdle();
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/accounts?limit=all', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await res.json()) as AccountsPreviewApiResponse & { loadAll?: boolean };
      if (!res.ok || data.status !== 'success' || !data.preview) {
        setAccountsFullLoadState({ phase: 'error', message: data.error || 'Não foi possível carregar todas as Accounts.' });
        setAccountsPreviewError(data.error || 'Não foi possível carregar todas as Accounts.');
        return;
      }
      setAccountsPreview(data.preview);
      // Auto-select all valid records
      const allKeys = (data.preview.records ?? [])
        .filter((r: any) => r.Id)
        .map((r: any) => r.Id as string);
      setSelectedAccountPreviewKeys(allKeys);
      setAccountsFullLoadState({ phase: 'done', totalLoaded: allKeys.length });
    } catch {
      setAccountsFullLoadState({ phase: 'error', message: 'Erro de rede ao carregar todas as Accounts.' });
      setAccountsPreviewError('Erro de rede ao carregar todas as Accounts.');
    } finally {
      setAccountsPreviewLoading(false);
    }
  }

  async function handleCreateContactFullLoadContract() {
    setContactFullLoadState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/full-load-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objects: ['Contact'] }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({})) as { status?: string; contractId?: string; summary?: Array<{ objectApiName: string; recordCount: number }>; error?: string };
      if (data.status !== 'ok' || !data.contractId) {
        setContactFullLoadState({ phase: 'error', message: data.error ?? 'Erro ao carregar Contacts.' });
        return;
      }
      const contactSummary = data.summary?.find((s) => s.objectApiName === 'Contact');
      setContactFullLoadState({ phase: 'done', recordCount: contactSummary?.recordCount });
    } catch {
      setContactFullLoadState({ phase: 'error', message: 'Erro de rede ao carregar Contacts.' });
    }
  }

  async function handleCreateOpportunityFullLoadContract() {
    setOpportunityFullLoadState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/full-load-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objects: ['Opportunity'] }),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({})) as { status?: string; contractId?: string; summary?: Array<{ objectApiName: string; recordCount: number }>; error?: string };
      if (data.status !== 'ok' || !data.contractId) {
        setOpportunityFullLoadState({ phase: 'error', message: data.error ?? 'Erro ao carregar Opportunities.' });
        return;
      }
      const oppSummary = data.summary?.find((s) => s.objectApiName === 'Opportunity');
      setOpportunityFullLoadState({ phase: 'done', recordCount: oppSummary?.recordCount });
    } catch {
      setOpportunityFullLoadState({ phase: 'error', message: 'Erro de rede ao carregar Opportunities.' });
    }
  }

  const handleLoadLeads = useCallback(async () => {
    if (!oauthStatus?.connected) return;
    setLeadLoadState({ phase: 'loading' });
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/leads', {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({})) as { status?: string; leads?: { records: LeadRecord[]; totalSize: number }; error?: string };
      if (data.status !== 'success' || !data.leads) {
        setLeadLoadState({ phase: 'error', message: data.error ?? 'Não foi possível consultar Leads no Salesforce.' });
        return;
      }
      setLeadLoadState({ phase: 'done', records: data.leads.records, totalSize: data.leads.totalSize });
    } catch {
      setLeadLoadState({ phase: 'error', message: 'Erro de rede ao consultar Leads.' });
    }
  }, [oauthStatus?.connected]);

  useEffect(() => {
    if (activeObject !== 'contacts') return;
    if (contactSyncState.phase !== 'done') return;
    if (leadLoadState.phase !== 'idle') return;
    void handleLoadLeads();
  }, [activeObject, contactSyncState.phase, handleLoadLeads, leadLoadState.phase]);

  async function handleOAuthDisconnect() {
    setOauthActionLoading('disconnect');
    setOauthNotice(null);
    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/disconnect', {
        method: 'POST',
        cache: 'no-store',
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setOauthNotice(data.error || 'Não foi possível desconectar OAuth.');
      } else {
        setOauthNotice('Salesforce desconectado. Os dados já sincronizados permanecem na Canopi, mas a leitura atual foi encerrada.');
      }
      resetAccountsOperationalSession();
      resetAccountSyncStateToIdle(true);
      await loadOAuthStatus();
    } catch {
      setOauthNotice('Não foi possível desconectar OAuth.');
    } finally {
      setOauthActionLoading(null);
    }
  }

  const oauthStatusTone = useMemo(() => {
    if (!oauthStatus) return 'slate';
    if (oauthStatus.status === 'connected') return 'emerald';
    if (oauthStatus.status === 'requires_configuration') return 'amber';
    if (oauthStatus.status === 'error') return 'red';
    return 'slate';
  }, [oauthStatus]);

  const oauthConfigured = Boolean(oauthStatus?.configured);
  const oauthConnected = Boolean(oauthStatus?.connected);
  const showConfigForm = !oauthConfigured || showOAuthConfigForm;
  const isValidationRecent = useMemo(() => {
    if (!lastValidationPulseAt) return false;
    return Date.now() - new Date(lastValidationPulseAt).getTime() < 90_000;
  }, [lastValidationPulseAt]);
  const connectionValidatedAt = lastValidationPulseAt ?? oauthStatus?.lastHealthCheckAt ?? null;
  const accountPreviewRows = useMemo(
    () =>
      (accountsPreview?.records || []).map((record, index) => {
        const gaps = getAccountPreviewRowGaps(record);
        const recommendedGaps = getAccountPreviewRowRecommendedGaps(record);
        return {
          key: getAccountPreviewRowKey(record, index),
          label: getAccountPreviewRowLabel(record, index),
          gaps,
          recommendedGaps,
          isValid: gaps.length === 0,
          record,
        };
      }),
    [accountsPreview]
  );
  const selectedAccountPreviewRowSet = useMemo(() => new Set(selectedAccountPreviewKeys), [selectedAccountPreviewKeys]);
  const selectedAccountPreviewRows = useMemo(
    () => accountPreviewRows.filter((row) => selectedAccountPreviewRowSet.has(row.key)),
    [accountPreviewRows, selectedAccountPreviewRowSet]
  );
  const allAccountPreviewRowsSelected =
    accountPreviewRows.length > 0 && accountPreviewRows.every((row) => selectedAccountPreviewRowSet.has(row.key));
  const liveAccountPreviewSummary = useMemo<PreparedAccountsPreviewSummary>(
    () => {
      const resolvedRows = buildResolvedAccountRows(selectedAccountPreviewRows);
      return {
        preparedAt: new Date().toISOString(),
        selectedCount: resolvedRows.length,
        validCount: resolvedRows.filter((row) => row.isValid).length,
        rowsWithGapsCount: resolvedRows.filter((row) => row.gaps.length > 0 || row.recommendedGaps.length > 0).length,
        rows: resolvedRows,
      };
    },
    [buildResolvedAccountRows, selectedAccountPreviewRows]
  );
  const selectedRowsCount = preparedAccountsPreviewSelection?.selectedCount ?? selectedAccountPreviewRows.length;
  const canGenerateLocalContract = Boolean(preparedAccountsPreviewSelection);
  const isPrepareSuccess = Boolean(preparedAccountsPreviewSelection) && !prepareButtonBusy;
  const isGenerateSuccess = contractButtonGenerated || Boolean(localPreSyncContract);
  const canExecuteLocalDryRun = Boolean(localPreSyncContract);
  const isDryRunSuccess = dryRunJustCompleted || Boolean(localPreSyncDryRun);
  const accountSyncInputsSignature = useMemo(
    () =>
      [
        selected,
        oauthConnected ? 'connected' : 'disconnected',
        accountsPreview?.testedAt ?? 'no-preview',
        accountsPreview?.records.length ?? 0,
        selectedAccountPreviewKeys.join('|'),
        preparedAccountsPreviewSelection?.preparedAt ?? 'no-prepared',
        localPreSyncContract?.createdAt ?? 'no-contract',
        localPreSyncDryRun?.createdAt ?? 'no-dryrun',
      ].join('::'),
    [
      selected,
      oauthConnected,
      accountsPreview?.testedAt,
      accountsPreview?.records.length,
      selectedAccountPreviewKeys,
      preparedAccountsPreviewSelection?.preparedAt,
      localPreSyncContract?.createdAt,
      localPreSyncDryRun?.createdAt,
    ],
  );

  useEffect(() => {
    if (accountSyncState.phase === 'loading') return;
    if (hydratingHubStateRef.current) {
      accountSyncInputsSignatureRef.current = accountSyncInputsSignature;
      return;
    }
    if (accountSyncInputsSignature === accountSyncInputsSignatureRef.current) return;
    if (accountSyncInputsSignatureRef.current !== '') {
      setAccountSyncState((current) => (current.phase === 'loading' ? current : { phase: 'idle' }));
    }
    accountSyncInputsSignatureRef.current = accountSyncInputsSignature;
  }, [accountSyncInputsSignature, accountSyncState.phase]);

  const accountsJourney = useMemo(() => {
    const foundCount = accountsPreview?.records.length ?? 0;
    const validCount = preparedAccountsPreviewSelection?.validCount ?? liveAccountPreviewSummary.validCount;
    const selectedCount = preparedAccountsPreviewSelection?.selectedCount ?? selectedAccountPreviewRows.length;
    const accountsLoaded = foundCount > 0;
    const accountsSelected = selectedCount > 0;
    const accountsPrepared = Boolean(preparedAccountsPreviewSelection);
    const localContractCreated = Boolean(localPreSyncContract);
    const dryRunDone = Boolean(localPreSyncDryRun);
    const realSyncDone = accountSyncState.phase === 'done';
    const autoSelectionApplied = selectedAccountPreviewRows.length > 0;
    const hasTechnicalReview =
      Boolean(preparedAccountsPreviewSelection) &&
      (!localPreSyncContract || !localPreSyncDryRun) &&
      accountSyncState.phase !== 'done';

    let status: 'not_loaded' | 'found' | 'prepared' | 'technical_review' | 'sync_ready' | 'syncing' | 'synced' | 'error' = 'not_loaded';
    if (accountsPreviewError) {
      status = 'error';
    } else if (accountSyncState.phase === 'loading') {
      status = 'syncing';
    } else if (accountSyncState.phase === 'done') {
      status = 'synced';
    } else if (localPreSyncContract && localPreSyncDryRun && validCount > 0) {
      status = 'sync_ready';
    } else if (foundCount > 0 && validCount === 0) {
      status = 'technical_review';
    } else if (hasTechnicalReview) {
      status = 'technical_review';
    } else if (preparedAccountsPreviewSelection) {
      status = 'prepared';
    } else if (foundCount > 0) {
      status = 'found';
    }

    return {
      status,
      foundCount,
      validCount,
      selectedCount,
      accountsLoaded,
      accountsSelected,
      accountsPrepared,
      localContractCreated,
      dryRunDone,
      realSyncDone,
      autoSelectionApplied,
      errorMessage: accountsPreviewError,
      technicalReviewReason:
        foundCount > 0 && validCount === 0
          ? 'Nenhuma Account com Id e Name foi encontrada nesta leitura. Revise a preparação técnica antes de continuar.'
          : hasTechnicalReview
            ? 'A preparação técnica de Accounts é necessária antes do sync real.'
            : null,
      onLoad: handleLoadAccountsPreview,
      onPrepare: handlePrepareAccountPreviewSelection,
      onDryRun: handleExecuteLocalDryRun,
      onReviewTechnical: () => {
        setOauthNotice('Accounts exigem revisão técnica antes do sync completo nesta sessão.');
        document.getElementById('salesforce-accounts-technical')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      onSync: () => handleExecuteAccountSync('main'),
    };
  }, [
    accountsPreview,
    accountsPreviewError,
    handleExecuteAccountSync,
    handleExecuteLocalDryRun,
    handleLoadAccountsPreview,
    handlePrepareAccountPreviewSelection,
    localPreSyncContract,
    localPreSyncDryRun,
    preparedAccountsPreviewSelection,
    selectedAccountPreviewRows.length,
    accountSyncState.phase,
    liveAccountPreviewSummary.validCount,
  ]);
  const accountPreviewColumns = [
    ['Id', 'Id'],
    ['Nome', 'Name'],
    ['Website', 'Website'],
    ['Industry', 'Industry'],
    ['Type', 'Type'],
    ['Owner', 'OwnerId'],
    ['Criado em', 'CreatedDate'],
    ['Atualizado em', 'LastModifiedDate'],
  ] as const;

  const salesforceJourneyNextStep = useMemo(() => {
    if (!oauthConnected) {
      return {
        title: 'Conectar Salesforce',
        description: 'Autorize o OAuth antes de buscar dados.',
        tone: 'slate',
      };
    }
    if (!connectionValidatedAt) {
      return {
        title: 'Validar conexão',
        description: 'Confirme a conexão ativa antes de encontrar dados.',
        tone: 'blue',
      };
    }
    if (!accountsPreview) {
      return {
        title: 'Mapear objetos e carregar Accounts',
        description: 'Identifique objetos e campos disponíveis no Salesforce (leitura apenas). Carregue Accounts para analisar qualidade de dados.',
        tone: 'blue',
      };
    }
    if (!localPreSyncContract) {
      return {
        title: 'Preparar prévia segura',
        description: 'Prepare a seleção para criar o contrato local read-only.',
        tone: 'amber',
      };
    }
    if (!localPreSyncDryRun) {
      return {
        title: 'Executar dry-run read-only',
        description: 'Valide os avisos de qualidade antes de revisar pendências.',
        tone: 'amber',
      };
    }
    return {
      title: 'Revisar pendências antes de sync real',
      description: 'Confira avisos de qualidade e decida o que corrigir antes de qualquer gravação.',
      tone: 'emerald',
    };
  }, [accountsPreview, connectionValidatedAt, localPreSyncContract, localPreSyncDryRun, oauthConnected]);

  const accountQualityPendingItems = useMemo(() => {
    if (!localPreSyncDryRun || !preparedAccountsPreviewSelection) return [];
    return preparedAccountsPreviewSelection.rows.flatMap((row) =>
      [...row.gaps, ...row.recommendedGaps].map((gap) => {
        const field = getAccountQualityFieldFromGap(gap);
        if (!field) return null;
        const key = getAccountQualityResolutionKey(row.key, field);
        const isBlocking = row.gaps.includes(gap);
        const resolution = accountQualityResolutions[key];
        const hasDecision = !!resolution;
        const decision = resolution?.decision;
        return {
          key,
          rowKey: row.key,
          account: row.label,
          field,
          currentValue: row.record[field] || '—',
          classification: decision ?? '',
          value: resolution?.value ?? '',
          type: isBlocking || decision === 'blocker' ? 'Bloqueador' : 'Aviso',
          impact:
            field === 'Id' || field === 'Name'
              ? 'Impede usar esta Account em sincronização real.'
              : field === 'Industry'
                ? 'Afeta análises por vertical e segmentação; pode ser preenchido localmente antes do sync.'
                : field === 'Website'
                  ? 'Reduz qualidade de dedupe, enriquecimento e vínculos externos.'
                  : field === 'Type'
                    ? 'Reduz classificação comercial, mas não bloqueia a prévia.'
                    : 'Aviso técnico; não bloqueia a prévia.',
          action:
            decision === 'manual'
              ? 'Valor local será usado apenas no contrato/dry-run desta sessão.'
              : decision === 'accept'
                ? 'Lacuna aceita temporariamente nesta sessão.'
                : decision === 'remove'
                  ? 'Account será removida do conjunto preparado.'
                  : decision === 'blocker'
                    ? 'Campo tratado como bloqueador local nesta sessão.'
                    : 'Escolha uma ação acima para resolver este item.',
        };
      }).filter((item): item is NonNullable<typeof item> => Boolean(item))
    );
  }, [accountQualityResolutions, localPreSyncDryRun, preparedAccountsPreviewSelection]);

  const accountQualityResolvedItems = useMemo(() => {
    if (Object.keys(accountQualityResolutions).length === 0) return [];
    const rowMap = new Map(selectedAccountPreviewRows.map((row) => [row.key, row]));
    return Object.entries(accountQualityResolutions).flatMap(([key, resolution]) => {
      if (!resolution.decision) return [];
      const separatorIdx = key.lastIndexOf('::');
      if (separatorIdx === -1) return [];
      const rowKey = key.slice(0, separatorIdx);
      const field = key.slice(separatorIdx + 2) as AccountQualityField;
      const row = rowMap.get(rowKey);
      if (!row) return [];
      const rawValue = resolution.value ?? '';
      const displayValue = rawValue.startsWith('__custom__:')
        ? rawValue.slice(11)
        : rawValue === '__ai__'
          ? ''
          : rawValue;
      const confirmedValue = field === 'Industry' ? confirmedIndustryItems[key] : undefined;
      const decisionLabel: Record<AccountQualityDecision, string> = {
        manual: 'Corrigido na Canopi',
        fix_salesforce: 'Corrigir no Salesforce',
        accept: 'Aceito temporariamente',
        remove: 'Removido do sync',
        blocker: 'Bloqueador',
      };
      return [{
        key,
        rowKey,
        field,
        account: row.label,
        originValue: row.record[field] || '—',
        decision: resolution.decision,
        decisionLabel: decisionLabel[resolution.decision] ?? resolution.decision,
        displayValue,
        confirmedValue,
      }];
    });
  }, [accountQualityResolutions, confirmedIndustryItems, selectedAccountPreviewRows]);

  function updateAccountQualityResolution(key: string, patch: Partial<AccountQualityResolution>) {
    setAccountQualityResolutions((current) => {
      const existing = current[key];
      if (existing) {
        return { ...current, [key]: { ...existing, ...patch } };
      }
      if (patch.decision) {
        return { ...current, [key]: patch as AccountQualityResolution };
      }
      return current;
    });
  }

  function applyAccountQualityDecisionForField(field: AccountQualityField, decision: AccountQualityDecision) {
    setAccountQualityResolutions((current) => {
      const next = { ...current };
      accountQualityPendingItems
        .filter((item) => item.field === field)
        .forEach((item) => {
          const existing = next[item.key];
          next[item.key] = existing
            ? { ...existing, decision }
            : { decision, value: '' };
        });
      return next;
    });
  }

  async function handleRecalculateAccountsQualityReview() {
    if (!accountsPreview) {
      setOauthNotice('Accounts carregadas ausentes. Carregue Accounts antes de recalcular a qualidade.');
      return;
    }
    const decidedCount = Object.keys(accountQualityResolutions).length;
    const resolvedRows = buildResolvedAccountRows(selectedAccountPreviewRows);
    const nextSelection: PreparedAccountsPreviewSummary = {
      preparedAt: new Date().toISOString(),
      selectedCount: resolvedRows.length,
      validCount: resolvedRows.filter((row) => row.isValid).length,
      rowsWithGapsCount: resolvedRows.filter((row) => row.gaps.length > 0 || row.recommendedGaps.length > 0).length,
      rows: resolvedRows,
    };
    const nextContract = buildLocalPreSyncContract(nextSelection, accountsPreview);
    setPreparedAccountsPreviewSelection(nextSelection);
    setLocalPreSyncContract(nextContract);
    const feedbackMsg = decidedCount > 0
      ? `${decidedCount} decisão(ões) aplicada(s) ao contrato local. Dry-run recalculado. Nenhuma gravação externa.`
      : 'Contrato local recalculado. Nenhuma decisão registrada ainda.';
    setSelectionFeedback(feedbackMsg);
    setContractFeedback(feedbackMsg);
    const dryRunSucceeded = await handleExecuteLocalDryRun(nextContract);
    if (!dryRunSucceeded) {
      setOauthNotice('Não foi possível recalcular o dry-run read-only com as decisões locais.');
    }
  }

  // ── Derived values for Field Mapping block ───────────────────────────────
  const qualityBlockVisible =
    accountQualityPendingItems.length > 0 || accountQualityResolvedItems.length > 0;

  const qualityBlockPlaceholder = !oauthConnected
    ? 'Conecte o Salesforce via OAuth para visualizar o guia de mapeamento.'
    : !accountsPreview
    ? 'Carregue Accounts no painel técnico para iniciar o mapeamento de campos.'
    : !preparedAccountsPreviewSelection
    ? 'Prepare a seleção no painel técnico para analisar a qualidade dos dados.'
    : null;

  return (
    <SalesforceHubRedesign
      oauthStatus={oauthStatus}
      oauthLoading={oauthLoading}
      oauthActionLoading={oauthActionLoading}
      connectionValidatedAt={connectionValidatedAt}
      accountsPreview={accountsPreview}
      accountsPreviewLoading={accountsPreviewLoading}
      selectedAccountPreviewRows={selectedAccountPreviewRows}
      preparedAccountsPreviewSelection={preparedAccountsPreviewSelection}
      localPreSyncContract={localPreSyncContract}
      localPreSyncDryRun={localPreSyncDryRun}
      accountQualityPendingItems={accountQualityPendingItems}
      accountQualityResolvedItems={accountQualityResolvedItems}
      accountSyncState={accountSyncState}
      oauthConfig={oauthConfig}
      oauthConfigured={oauthConfigured}
      oauthConfigSaving={oauthConfigSaving}
      oauthConfigError={oauthConfigError}
      showConfigForm={showConfigForm}
      oauthConfigForm={oauthConfigForm}
      onConfigFormChange={(field, value) => setOauthConfigForm((prev) => ({ ...prev, [field]: value }))}
      onConfigSave={handleOAuthConfigSave}
      onConfigEditToggle={() => setShowOAuthConfigForm((v) => !v)}
      onCopyCallbackUrl={handleCopyCallbackUrl}
      onConnect={handleOAuthConnect}
      onHealthCheck={handleOAuthHealthCheck}
      onDisconnect={handleOAuthDisconnect}
      onLoadAccounts={handleLoadAccountsPreview}
      onReloadHubState={() => { void loadHubHydration(); }}
      onLoadAllAccounts={handleLoadAllAccounts}
      accountsFullLoadState={accountsFullLoadState}
      hubRefreshState={hubRefreshState}
      onSelectAll={handleToggleSelectAllAccountPreviewRows}
      onPrepare={handlePrepareAccountPreviewSelection}
      onGenerateContract={handleGenerateLocalPreSyncContract}
      onDryRun={() => void handleExecuteLocalDryRun()}
      onSync={() => void handleExecuteAccountSync('main')}
      activeObject={activeObject}
      contactPreviewState={contactPreviewState}
      contactSyncState={contactSyncState}
      onSetActiveObject={setActiveObject}
      onContactPreview={() => void handleContactPreview()}
      onContactSync={() => void handleContactSync()}
      contactFullLoadState={contactFullLoadState}
      onLoadAllContacts={handleCreateContactFullLoadContract}
      opportunityPreviewState={opportunityPreviewState}
      opportunitySyncState={opportunitySyncState}
      onOpportunityPreview={() => void handleOpportunityPreview()}
      onOpportunitySync={() => void handleOpportunitySync()}
      onRevalidateOpportunityPreview={handleRevalidateOpportunityPreview}
      opportunityFullLoadState={opportunityFullLoadState}
      onLoadAllOpportunities={handleCreateOpportunityFullLoadContract}
      configurationCompleted={configurationCompleted}
      onCompleteConfiguration={() => setConfigurationCompleted(true)}
      leadLoadState={leadLoadState}
      onLoadLeads={handleLoadLeads}
    />
  );
}
