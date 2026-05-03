'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Circle, FileJson, KeyRound, Loader2, Network, XCircle } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { SalesforceCsvPreparation } from './SalesforceCsvPreparation';
import { SalesforceDiscovery } from './SalesforceDiscovery';

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

interface PreparedAccountsPreviewRow {
  key: string;
  label: string;
  gaps: string[];
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

interface LocalPreSyncContractRow {
  Id: string | null;
  Name: string | null;
  Website: string | null;
  Industry: string | null;
  Type: string | null;
  OwnerId: string | null;
  status: 'válido' | 'com lacunas';
  gaps: string[];
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

function getAccountPreviewRowGaps(record: AccountsPreviewRecord): string[] {
  const gaps: string[] = [];
  if (!record.Id?.trim()) gaps.push('sem Id');
  if (!record.Name?.trim()) gaps.push('sem Name');
  if (!record.Website?.trim()) gaps.push('sem Website');
  if (!record.Industry?.trim()) gaps.push('sem Industry');
  return gaps;
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
      status: row.isValid ? 'válido' : 'com lacunas',
      gaps: row.gaps,
    })),
  };
}

function getLocalPreSyncDryRunReasons(row: LocalPreSyncContractRow): string[] {
  const reasons: string[] = [];
  if (!row.Id?.trim()) reasons.push('sem Id');
  if (!row.Name?.trim()) reasons.push('sem Name');
  if (!row.Website?.trim()) reasons.push('sem Website');
  if (!row.Industry?.trim()) reasons.push('sem Industry');
  return reasons;
}

function classifyLocalPreSyncDryRunRow(row: LocalPreSyncContractRow, index: number): LocalPreSyncDryRunRow {
  const reasons = getLocalPreSyncDryRunReasons(row);
  const isBlocked = reasons.includes('sem Id') || reasons.includes('sem Name');
  const isAlert = !isBlocked && (reasons.includes('sem Website') || reasons.includes('sem Industry'));

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
    title: 'OAuth / External Client App',
    description: 'Conexão OAuth produtiva via External Client App para validação read-only controlada.',
    badge: 'OAuth',
    badgeVariant: 'blue',
    icon: <Network className="h-4 w-4" />,
    panel: {
      lines: [
        'Conexão OAuth produtiva com External Client App.',
        'Validação read-only inicial via Account/describe com persistência segura de credenciais.',
        'Sem sync, sem writeback e sem importação real nesta etapa.',
      ],
    },
  },
  {
    id: 'token',
    title: 'Validação pontual',
    description: 'Use para validar acesso pontual. Nada será salvo.',
    badge: 'Validação pontual',
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
  const contractCardRef = useRef<HTMLDivElement | null>(null);
  const dryRunCardRef = useRef<HTMLDivElement | null>(null);
  const prevOAuthConfiguredRef = useRef(false);
  const prevOAuthConnectedRef = useRef(false);
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

    if (oauthStatus.connected && !prevOAuthConnectedRef.current) {
      setShowOAuthConfigForm(false);
    } else if (!oauthStatus.connected && !prevOAuthConfiguredRef.current) {
      setShowOAuthConfigForm(false);
    }

    prevOAuthConfiguredRef.current = oauthStatus.configured;
    prevOAuthConnectedRef.current = oauthStatus.connected;
  }, [oauthStatus]);

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
    window.location.href = '/api/account-connectors/salesforce/oauth/start';
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

  async function handleOAuthHealthCheck() {
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
      } else {
        setOauthNotice(data.error || 'Não foi possível validar a conexão OAuth.');
      }
    } catch {
      setOauthNotice('Não foi possível validar a conexão OAuth.');
    } finally {
      setOauthActionLoading(null);
    }
  }

  async function handleLoadAccountsPreview() {
    if (!oauthConnected) {
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

    try {
      const res = await fetch('/api/account-connectors/salesforce/oauth/accounts?limit=10', {
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
    } catch {
      setAccountsPreview(null);
      setAccountsPreviewError('Não foi possível carregar o preview read-only de Accounts.');
    } finally {
      setAccountsPreviewLoading(false);
    }
  }

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
    setSelectedAccountPreviewKeys((current) => (current.length === accountPreviewRows.length ? [] : accountPreviewRows.map((row) => row.key)));
  }

  function handlePrepareAccountPreviewSelection() {
    setPrepareButtonBusy(true);
    setLocalPreSyncDryRun(null);
    setDryRunFeedback(null);
    setDryRunJustCompleted(false);
    setDryRunButtonBusy(false);
    const nextSelection = {
      ...liveAccountPreviewSummary,
      preparedAt: new Date().toISOString(),
    };
    window.setTimeout(() => {
      setPreparedAccountsPreviewSelection(nextSelection);
      setLocalPreSyncContract(null);
      setSelectionFeedback('Seleção preparada. Contrato local liberado.');
      setContractFeedback(null);
      setContractJustGenerated(false);
      setContractButtonGenerated(false);
      setPrepareButtonBusy(false);
    }, 120);
  }

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

  function handleExecuteLocalDryRun() {
    if (!localPreSyncContract) return;

    setDryRunButtonBusy(true);
    setDryRunFeedback(null);
    setLocalPreSyncDryRun(null);

    window.setTimeout(() => {
      const nextDryRun = buildLocalPreSyncDryRun(localPreSyncContract);
      setLocalPreSyncDryRun(nextDryRun);
      setDryRunFeedback('Dry-run read-only concluído nesta sessão.');
      setDryRunJustCompleted(true);
      setDryRunButtonBusy(false);
      setTimeout(() => {
        dryRunCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }, 120);
  }

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
        setOauthNotice('Conexão OAuth removida com sucesso.');
      }
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
  const accountPreviewRows = useMemo(
    () =>
      (accountsPreview?.records || []).map((record, index) => {
        const gaps = getAccountPreviewRowGaps(record);
        return {
          key: getAccountPreviewRowKey(record, index),
          label: getAccountPreviewRowLabel(record, index),
          gaps,
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
    () => ({
      preparedAt: new Date().toISOString(),
      selectedCount: selectedAccountPreviewRows.length,
      validCount: selectedAccountPreviewRows.filter((row) => row.isValid).length,
      rowsWithGapsCount: selectedAccountPreviewRows.filter((row) => row.gaps.length > 0).length,
      rows: selectedAccountPreviewRows,
    }),
    [selectedAccountPreviewRows]
  );
  const selectedRowsCount = preparedAccountsPreviewSelection?.selectedCount ?? selectedAccountPreviewRows.length;
  const canGenerateLocalContract = Boolean(preparedAccountsPreviewSelection);
  const isPrepareSuccess = Boolean(preparedAccountsPreviewSelection) && !prepareButtonBusy;
  const isGenerateSuccess = contractButtonGenerated || Boolean(localPreSyncContract);
  const canExecuteLocalDryRun = Boolean(localPreSyncContract);
  const isDryRunSuccess = dryRunJustCompleted || Boolean(localPreSyncDryRun);
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {METHODS.map((method) => {
          const isActive = method.id === selected;
          const isSecondary = method.id === 'token';
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelected(method.id)}
              className={`group w-full rounded-3xl border text-left transition-all ${
                isSecondary ? 'p-4' : 'p-6'
              } ${
                isActive && !isSecondary
                  ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-100'
                  : isActive && isSecondary
                  ? 'border-slate-300 bg-slate-100'
                  : isSecondary
                  ? 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSecondary ? 'h-6 w-6' : 'h-8 w-8'
                  } ${
                    isActive ? 'bg-blue-100 text-blue-700' : isSecondary ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
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
                className={`transition-colors ${
                  isSecondary ? 'mt-3 text-sm font-bold' : 'mt-4 text-base font-black'
                } ${
                  isActive ? 'text-blue-900' : isSecondary ? 'text-slate-500' : 'text-slate-900 group-hover:text-blue-800'
                }`}
              >
                {method.title}
              </h3>
              <p className={`mt-1.5 leading-relaxed ${isSecondary ? 'text-xs font-medium text-slate-400' : 'mt-2 text-sm font-medium text-slate-600'}`}>
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
          <div className="mt-5 space-y-4">
            <div className={`rounded-2xl border p-4 ${
              oauthStatusTone === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
              oauthStatusTone === 'amber' ? 'border-amber-200 bg-amber-50' :
              oauthStatusTone === 'red' ? 'border-red-200 bg-red-50' :
              'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-black ${
                    oauthStatusTone === 'emerald' ? 'text-emerald-900' :
                    oauthStatusTone === 'amber' ? 'text-amber-900' :
                    oauthStatusTone === 'red' ? 'text-red-900' : 'text-slate-900'
                  }`}>
                    OAuth / External Client App
                  </p>
                  <p className={`mt-1 text-[11px] font-medium leading-relaxed ${
                    oauthStatusTone === 'emerald' ? 'text-emerald-800' :
                    oauthStatusTone === 'amber' ? 'text-amber-800' :
                    oauthStatusTone === 'red' ? 'text-red-800' : 'text-slate-700'
                  }`}>
                    {oauthLoading
                      ? 'Carregando estado OAuth...'
                      : oauthStatus?.status === 'connected'
                      ? 'Conexão OAuth ativa com validação read-only de Account.'
                      : oauthStatus?.status === 'requires_configuration'
                      ? 'Para conectar o Salesforce via OAuth, salve a configuração da External Client App abaixo.'
                      : oauthStatus?.status === 'error'
                      ? 'OAuth configurado com erro operacional. Execute validação ou reconexão.'
                      : 'OAuth disponível para iniciar conexão Salesforce via OAuth.'}
                  </p>
                </div>
                <Badge className={`border-none px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                  oauthStatusTone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  oauthStatusTone === 'amber' ? 'bg-amber-100 text-amber-700' :
                  oauthStatusTone === 'red' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {oauthLoading
                    ? 'Carregando'
                    : oauthStatus?.status === 'connected'
                    ? 'Conectado'
                    : oauthStatus?.status === 'requires_configuration'
                    ? 'Configuração pendente'
                    : oauthStatus?.status === 'error'
                    ? 'Erro'
                    : 'Desconectado'}
                </Badge>
              </div>
            </div>

            {!oauthLoading && (
              <div className="space-y-4">
                {oauthConnected && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-black text-emerald-900">Salesforce conectado via OAuth</p>
                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                      {([
                        ['Instance URL', oauthStatus?.instanceUrl || '—'],
                        ['Org ID', oauthStatus?.orgId || '—'],
                        ['User ID', oauthStatus?.userId || '—'],
                        ['Escopos autorizados', oauthStatus?.scopes?.length ? oauthStatus.scopes.join(', ') : '—'],
                        ['Status da conexão', oauthStatus?.status || 'connected'],
                        ['Objeto Account validado', oauthStatus?.accountLabel || '—'],
                        ['Campos Account disponíveis', String(oauthStatus?.accountFieldsCount ?? 0)],
                        ['API version usada', oauthStatus?.apiVersion || 'v66.0'],
                      ] as [string, string][]).map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{label}</p>
                          <p className="text-sm font-medium text-emerald-900 break-all">{value}</p>
                        </div>
                      ))}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Última validação</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-emerald-900 break-all">
                            {oauthStatus?.lastHealthCheckAt ? formatTestedAt(oauthStatus.lastHealthCheckAt) : '—'}
                          </p>
                          {isValidationRecent && (
                            <span className="rounded-md bg-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                              Atualizado agora
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!oauthConnected && oauthConfigured && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-black text-blue-900">Configuração OAuth salva</p>
                    <p className="mt-1 text-sm font-medium text-blue-800">
                      A configuração da External Client App está pronta para iniciar a conexão OAuth.
                    </p>
                  </div>
                )}

                {oauthNotice && (
                  <div className={`rounded-2xl border px-4 py-3 ${
                    oauthNotice.toLowerCase().includes('não foi possível') ||
                    oauthNotice.toLowerCase().includes('falhou') ||
                    oauthNotice.toLowerCase().includes('erro')
                      ? 'border-red-200 bg-red-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      oauthNotice.toLowerCase().includes('não foi possível') ||
                      oauthNotice.toLowerCase().includes('falhou') ||
                      oauthNotice.toLowerCase().includes('erro')
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>{oauthNotice}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {oauthConnected ? (
                    <>
                      <button
                        type="button"
                        onClick={handleOAuthHealthCheck}
                        disabled={oauthActionLoading !== null}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {oauthActionLoading === 'health' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {oauthActionLoading === 'health' ? 'Validando...' : 'Validar conexão'}
                      </button>
                      <button
                        type="button"
                        onClick={handleOAuthDisconnect}
                        disabled={oauthActionLoading !== null}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-black text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {oauthActionLoading === 'disconnect' && <Loader2 className="h-4 w-4 animate-spin" />}
                        Desconectar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOAuthConfigForm((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        {showConfigForm ? 'Fechar edição da configuração' : 'Editar configuração OAuth'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleOAuthConnect}
                        disabled={oauthActionLoading !== null || !oauthConfigured}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {oauthActionLoading === 'connect' && <Loader2 className="h-4 w-4 animate-spin" />}
                        Conectar Salesforce via OAuth
                      </button>
                      {oauthConfigured && (
                        <button
                          type="button"
                          onClick={() => setShowOAuthConfigForm((prev) => !prev)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          {showConfigForm ? 'Fechar edição da configuração' : 'Editar configuração OAuth'}
                        </button>
                      )}
                      {!oauthConfigured && (
                        <p className="w-full text-xs font-medium text-amber-800">
                          Salve a configuração OAuth para habilitar a conexão.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Sobre este modo
                  </p>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800">OAuth / Fonte viva</span> — Conexão persistida com token criptografado. Valida acesso read-only ao Salesforce via Account/describe. Permite discovery de metadados de múltiplos objetos. Sem sync, sem writeback, sem importação real.
                  </p>
                </div>

                {showConfigForm && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-black text-slate-900">Configurar External Client App</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      Configure a conexão Salesforce via OAuth. O Client Secret fica criptografado e nunca é exibido após o salvamento.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Client ID</label>
                        <input
                          type="text"
                          value={oauthConfigForm.clientId}
                          onChange={(e) => setOauthConfigForm((prev) => ({ ...prev, clientId: e.target.value }))}
                          placeholder={oauthConfig?.clientIdConfigured ? 'Client ID já configurado (preencha para atualizar)' : 'Cole o Client ID da External Client App'}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                        {oauthConfig?.clientIdConfigured && !oauthConfigForm.clientId.trim() && (
                          <p className="text-[11px] font-medium text-slate-500">Client ID configurado.</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Client Secret</label>
                        <input
                          type="password"
                          value={oauthConfigForm.clientSecret}
                          onChange={(e) => setOauthConfigForm((prev) => ({ ...prev, clientSecret: e.target.value }))}
                          placeholder={oauthConfig?.clientSecretConfigured ? 'Já configurado (preencha apenas para trocar)' : 'Cole o Client Secret'}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Redirect URI</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={oauthConfigForm.redirectUri}
                            onChange={(e) => setOauthConfigForm((prev) => ({ ...prev, redirectUri: e.target.value }))}
                            className="min-w-[280px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          />
                          <button
                            type="button"
                            onClick={handleCopyCallbackUrl}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"
                          >
                            Copiar callback URL
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                          Use exatamente esta URL como Callback URL na External Client App do Salesforce.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Login URL</label>
                        <input
                          type="text"
                          value={oauthConfigForm.loginUrl}
                          onChange={(e) => setOauthConfigForm((prev) => ({ ...prev, loginUrl: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Escopos</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-700">api</span>
                          <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-700">refresh_token</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">External Client App</p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        OAuth habilitado, Callback URL igual ao Redirect URI e escopos <span className="font-mono">api</span> e <span className="font-mono">refresh_token</span>.
                      </p>
                    </div>

                    {oauthConfigError && (
                      <p className="mt-3 text-sm font-medium text-red-700">{oauthConfigError}</p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOAuthConfigSave}
                        disabled={oauthConfigSaving || oauthConfigLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {oauthConfigSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Salvar configuração OAuth
                      </button>
                      {oauthConfig?.configured && (
                        <span className="text-xs font-medium text-emerald-700">Configuração OAuth salva</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <SalesforceDiscovery
              title="Discovery via OAuth conectado"
              description="Campos detectados são somente leitura. Nenhum registro será importado nesta etapa."
            />

            <Card className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">Preview read-only de Accounts</p>
                  <p className="text-sm font-medium text-slate-600">
                    Carrega uma amostra pequena e somente leitura de registros reais de Accounts via OAuth já persistido.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadAccountsPreview}
                  disabled={!oauthConnected || accountsPreviewLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accountsPreviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {accountsPreviewLoading ? 'Carregando Accounts...' : 'Carregar Accounts'}
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardrails</p>
                <ul className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                  <li>• Somente leitura.</li>
                  <li>• Não importa registros para a Canopi.</li>
                  <li>• Não grava no Supabase.</li>
                  <li>• Não executa sync real.</li>
                  <li>• Não faz writeback.</li>
                  <li>• Não usa Bulk API.</li>
                </ul>
              </div>

              {!oauthConnected && (
                <p className="mt-4 text-sm font-medium text-amber-800">
                  Conecte o Salesforce via OAuth para habilitar o preview read-only de Accounts.
                </p>
              )}

              {accountsPreviewError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-black text-red-900">Não foi possível carregar Accounts</p>
                  <p className="mt-1 text-sm font-medium text-red-800">{accountsPreviewError}</p>
                </div>
              )}

              {accountsPreview && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-800">
                      {accountsPreview.records.length} registros carregados
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      total {accountsPreview.totalSize}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      limite {accountsPreview.limit}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      API {accountsPreview.apiVersion}
                    </span>
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-800">
                      {selectedRowsCount} selecionados
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    {accountsPreview.done ? 'Resultado completo para o limite solicitado.' : 'Resultado parcial para o limite solicitado.'} Última leitura:{' '}
                    {formatTestedAt(accountsPreview.testedAt)}
                  </p>

                  {selectionFeedback && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-black text-emerald-900">Seleção preparada</p>
                      <p className="mt-1 text-sm font-medium text-emerald-800">{selectionFeedback}</p>
                    </div>
                  )}

                  {contractFeedback && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                      <p className="text-sm font-black text-blue-900">Contrato local gerado</p>
                      <p className="mt-1 text-sm font-medium text-blue-800">{contractFeedback}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAllAccountPreviewRows}
                      disabled={accountPreviewRows.length === 0}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {allAccountPreviewRowsSelected ? 'Desselecionar todos os registros carregados' : 'Selecionar todos os registros carregados'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrepareAccountPreviewSelection}
                      disabled={selectedAccountPreviewRows.length === 0}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        prepareButtonBusy
                          ? 'bg-slate-500 text-white'
                          : isPrepareSuccess
                          ? 'border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {prepareButtonBusy
                        ? 'Preparando...'
                        : isPrepareSuccess
                        ? 'Seleção preparada'
                        : 'Preparar seleção'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateLocalPreSyncContract}
                      disabled={!canGenerateLocalContract}
                      title={!canGenerateLocalContract ? 'Prepare a seleção para liberar o contrato.' : undefined}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isGenerateSuccess
                          ? 'border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'
                          : canGenerateLocalContract
                          ? 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-50'
                          : 'border border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isGenerateSuccess ? 'Contrato gerado' : 'Gerar contrato local'}
                    </button>
                    {!canGenerateLocalContract && (
                      <p className="w-full text-xs font-medium text-slate-500">
                        Prepare a seleção para liberar o contrato.
                      </p>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          <th className="w-12 px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                            <input
                              type="checkbox"
                              aria-label="Selecionar todos os registros carregados"
                              checked={allAccountPreviewRowsSelected}
                              onChange={handleToggleSelectAllAccountPreviewRows}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              disabled={accountPreviewRows.length === 0}
                            />
                          </th>
                          {accountPreviewColumns.map(([label]) => (
                            <th
                              key={label}
                              className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {accountsPreview.records.map((record, index) => {
                          const rowKey = getAccountPreviewRowKey(record, index);
                          const rowLabel = getAccountPreviewRowLabel(record, index);

                          return (
                            <tr key={rowKey} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="px-3 py-2 text-center align-top">
                                <input
                                  type="checkbox"
                                  aria-label={`Selecionar ${rowLabel}`}
                                  checked={selectedAccountPreviewRowSet.has(rowKey)}
                                  onChange={() => toggleAccountPreviewRowSelection(rowKey)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              {accountPreviewColumns.map(([, fieldName]) => (
                                <td key={`${rowKey}-${fieldName}`} className="whitespace-nowrap px-3 py-2 text-sm text-slate-700">
                                  <span className="block max-w-[220px] truncate">
                                    {record[fieldName as keyof AccountsPreviewRecord] || '—'}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <Card className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-blue-900">Seleção preparada para pré-sync read-only</p>
                        <p className="text-sm font-medium text-blue-800">
                          Seleção local desta sessão. Não importa registros, não grava no Supabase e não executa sync real.
                        </p>
                      </div>
                      <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-800">
                        {selectedAccountPreviewRows.length} selecionados
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-blue-100 bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Válidos para pré-sync read-only</p>
                        <p className="mt-1 text-2xl font-black text-blue-900">
                          {preparedAccountsPreviewSelection?.validCount ?? liveAccountPreviewSummary.validCount}
                        </p>
                        <p className="mt-1 text-xs font-medium text-blue-700">Registros com Id, Name, Website e Industry completos.</p>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Registros com lacunas</p>
                        <p className="mt-1 text-2xl font-black text-blue-900">
                          {preparedAccountsPreviewSelection?.rowsWithGapsCount ?? liveAccountPreviewSummary.rowsWithGapsCount}
                        </p>
                        <p className="mt-1 text-xs font-medium text-blue-700">Lacunas simples: sem Id, sem Name, sem Website, sem Industry.</p>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-white p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Preparação local</p>
                        <p className="mt-1 text-2xl font-black text-blue-900">
                          {preparedAccountsPreviewSelection ? 'Consolidada' : 'Pendente'}
                        </p>
                        <p className="mt-1 text-xs font-medium text-blue-700">
                          {preparedAccountsPreviewSelection
                            ? `Preparada em ${formatTestedAt(preparedAccountsPreviewSelection.preparedAt)}`
                            : 'Clique em “Preparar seleção” para consolidar o resumo nesta sessão.'}
                        </p>
                      </div>
                    </div>

                    {preparedAccountsPreviewSelection ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Resumo preparado</p>
                        <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-blue-100 bg-blue-50">
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-blue-800">Registro</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-blue-800">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-blue-800">Lacunas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {preparedAccountsPreviewSelection.rows.map((row, rowIndex) => (
                                <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                                  <td className="px-3 py-2 text-sm font-medium text-blue-900">{row.label}</td>
                                  <td className="px-3 py-2 text-sm">
                                    {row.isValid ? (
                                      <Badge className="border-none bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1">
                                        Válido
                                      </Badge>
                                    ) : (
                                      <Badge className="border-none bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1">
                                        Com lacunas
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-blue-800">
                                    {row.gaps.length > 0 ? row.gaps.join(', ') : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-medium text-blue-800">
                        Selecione os Accounts carregados e clique em “Preparar seleção” para registrar o resumo local desta sessão.
                      </p>
                    )}

                  {localPreSyncContract && (
                    <div
                      ref={contractCardRef}
                      className={`mt-4 rounded-2xl border p-4 transition-all ${
                        contractJustGenerated ? 'border-blue-300 bg-blue-50 shadow-sm shadow-blue-100' : 'border-slate-200 bg-white'
                      }`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900">Contrato local de pré-sync read-only</p>
                            <p className="text-sm font-medium text-slate-600">
                              Contrato local desta sessão. Nenhuma gravação, importação ou sincronização é executada.
                            </p>
                          </div>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                          {selectedRowsCount} selecionados
                        </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                          {([
                            ['Criado em', formatTestedAt(localPreSyncContract.createdAt)],
                            ['Origem', localPreSyncContract.source],
                            ['Objeto', localPreSyncContract.objectApiName],
                            ['Modo', localPreSyncContract.mode],
                            ['Limite usado', String(localPreSyncContract.previewLimit)],
                            ['Total carregados', String(localPreSyncContract.totalLoaded)],
                            ['Total selecionados', String(localPreSyncContract.totalSelected)],
                            ['Total válidos', String(localPreSyncContract.totalValid)],
                            ['Total com lacunas', String(localPreSyncContract.totalWithGaps)],
                          ] as [string, string][]).map(([label, value]) => (
                            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                              <p className="mt-1 text-sm font-medium text-slate-900 break-all">{value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Campos considerados</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {localPreSyncContract.fieldsConsidered.map((field) => (
                              <Badge key={field} className="border-none bg-white text-slate-700 text-[10px] font-black uppercase px-2 py-1">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-100">
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Registro</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Id</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Name</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Website</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Industry</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Type</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">OwnerId</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Lacunas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {localPreSyncContract.records.map((row, index) => (
                                <tr key={`${row.Id || row.Name || index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                  <td className="px-3 py-2 text-sm font-medium text-slate-900">Account {index + 1}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.Id || '—'}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.Name || '—'}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.Website || '—'}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.Industry || '—'}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.Type || '—'}</td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.OwnerId || '—'}</td>
                                  <td className="px-3 py-2 text-sm">
                                    {row.status === 'válido' ? (
                                      <Badge className="border-none bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1">
                                        Válido
                                      </Badge>
                                    ) : (
                                      <Badge className="border-none bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1">
                                        Com lacunas
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-slate-700">{row.gaps.length > 0 ? row.gaps.join(', ') : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardrails do contrato local</p>
                          <ul className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                            <li>• Contrato local desta sessão.</li>
                            <li>• Não importa registros.</li>
                            <li>• Não grava no Supabase.</li>
                            <li>• Não executa sync real.</li>
                            <li>• Não altera camada canônica.</li>
                            <li>• Não faz dedupe real.</li>
                            <li>• Não faz writeback.</li>
                            <li>• Não usa Bulk API.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExecuteLocalDryRun}
                      disabled={!canExecuteLocalDryRun || dryRunButtonBusy}
                      title={!canExecuteLocalDryRun ? 'Prepare o contrato local para liberar o dry-run.' : undefined}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        dryRunButtonBusy
                          ? 'bg-slate-500 text-white'
                          : isDryRunSuccess
                          ? 'border border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'
                          : canExecuteLocalDryRun
                          ? 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-50'
                          : 'border border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {dryRunButtonBusy
                        ? 'Executando dry-run...'
                        : isDryRunSuccess
                        ? 'Dry-run concluído'
                        : 'Executar dry-run read-only'}
                    </button>
                    {!canExecuteLocalDryRun && (
                      <p className="w-full text-xs font-medium text-slate-500">
                        Prepare o contrato local para liberar o dry-run.
                      </p>
                    )}
                  </div>

                  {dryRunFeedback && (
                    <div
                      className={`mt-4 rounded-2xl border px-4 py-3 transition-all ${
                        dryRunJustCompleted ? 'border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <p className={`text-sm font-black ${dryRunJustCompleted ? 'text-emerald-900' : 'text-blue-900'}`}>
                        Dry-run read-only de Accounts
                      </p>
                      <p className={`mt-1 text-sm font-medium ${dryRunJustCompleted ? 'text-emerald-800' : 'text-blue-800'}`}>
                        {dryRunFeedback}
                      </p>
                    </div>
                  )}

                  {localPreSyncDryRun && (
                    <div
                      ref={dryRunCardRef}
                      className={`mt-4 rounded-2xl border p-4 transition-all ${
                        dryRunJustCompleted ? 'border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">Dry-run read-only de Accounts</p>
                          <p className="text-sm font-medium text-slate-600">
                            Simulação local desta sessão. Nenhuma leitura adicional, gravação ou sincronização é executada.
                          </p>
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                          {localPreSyncDryRun.contractTotal} registros
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        {([
                          ['Criado em', formatTestedAt(localPreSyncDryRun.createdAt)],
                          ['Origem', localPreSyncDryRun.source],
                          ['Objeto', localPreSyncDryRun.objectApiName],
                          ['Modo', localPreSyncDryRun.mode],
                          ['Total no contrato', String(localPreSyncDryRun.contractTotal)],
                          ['Aptos para sync read-only futuro', String(localPreSyncDryRun.aptoCount)],
                          ['Com alertas', String(localPreSyncDryRun.alertCount)],
                          ['Bloqueados', String(localPreSyncDryRun.blockedCount)],
                        ] as [string, string][]).map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                            <p className="mt-1 text-sm font-medium text-slate-900 break-all">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Campos avaliados</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {localPreSyncDryRun.fieldsEvaluated.map((field) => (
                            <Badge key={field} className="border-none bg-white text-slate-700 text-[10px] font-black uppercase px-2 py-1">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                              <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Registro</th>
                              <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Status</th>
                              <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">Motivos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {localPreSyncDryRun.rows.map((row, index) => (
                              <tr key={row.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-3 py-2 text-sm font-medium text-slate-900">
                                  <div className="space-y-1">
                                    <p>{row.label}</p>
                                    <p className="text-[11px] font-mono text-slate-500">
                                      {row.record.Id || '—'} · {row.record.Name || '—'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {row.status === 'apto para sync read-only futuro' ? (
                                    <Badge className="border-none bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-1">
                                      Apto para sync read-only futuro
                                    </Badge>
                                  ) : row.status === 'com alertas' ? (
                                    <Badge className="border-none bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-1">
                                      Com alertas
                                    </Badge>
                                  ) : (
                                    <Badge className="border-none bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1">
                                      Bloqueado para sync
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-slate-700">
                                  {row.reasons.length > 0 ? row.reasons.join(', ') : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardrails do dry-run</p>
                        <ul className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                          <li>• Dry-run local desta sessão.</li>
                          <li>• Não importa registros.</li>
                          <li>• Não grava no Supabase.</li>
                          <li>• Não executa sync real.</li>
                          <li>• Não altera camada canônica.</li>
                          <li>• Não faz dedupe real.</li>
                          <li>• Não faz writeback.</li>
                          <li>• Não usa Bulk API.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-100/50 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-800">Guardrails da seleção</p>
                    <ul className="mt-2 space-y-1 text-xs font-medium text-blue-800">
                        <li>• Seleção local desta sessão.</li>
                        <li>• Não importa registros.</li>
                        <li>• Não grava no Supabase.</li>
                        <li>• Não altera camada canônica.</li>
                        <li>• Não faz writeback.</li>
                        <li>• Não usa Bulk API.</li>
                      </ul>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          </div>
        )}

        {selected === 'token' && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sobre este modo
            </p>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Token temporário / Validação efêmera</span> — Valida acesso read-only ao objeto Account apenas. Nada é salvo, nenhuma conexão é persistida. Ao trocar de aba ou recarregar a página, o token e o resultado são descartados.
            </p>
          </div>
        )}

        {selected === 'csv' && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sobre este modo
            </p>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">CSV exportado / Entrada local</span> — Análise local de arquivo exportado do Salesforce. Não consulta o Salesforce ao vivo. Sem conexão OAuth, sem token, sem metadados via describe. Foco em upload, preview de colunas e validação local.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
