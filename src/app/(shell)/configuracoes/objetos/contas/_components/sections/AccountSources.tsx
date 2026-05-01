'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  KeyRound,
  Loader2,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';
import {
  CONNECTOR_PRESETS,
  type ConnectorPreset,
  type ConnectorType,
} from '@/src/lib/contaConnectorsV2';
import { getAccountConnectorAdapterSafe } from '@/src/lib/accountConnectorAdapters';
import type {
  AccountSchemaProperty,
  AccountSchemaSuggestedMapping,
  AccountConnectorSurfaceKind,
  AccountRealConnectionContract,
} from '@/src/lib/accountConnectionModel';
import {
  analyzeCsvSchema,
  parseCsvText,
  validateCsvData,
  type CsvParseProgress,
  type CsvSchemaAnalysis,
  type CsvSchemaQualityLevel,
  type CsvUploadMeta,
} from '@/src/lib/parseCsvLocal';
import { SourceSnapshotSummary } from './SourceSnapshotSummary';
import { CsvSchemaAnalysisIntro } from './CsvSchemaAnalysisIntro';

interface LocalSourceConfig {
  sourceName: string;
  primaryObject: string;
  primaryKeyField: string;
  accountNameField: string;
  domainField: string;
  ownerField: string;
  statusOrStageField: string;
  lastUpdatedField: string;
  priorityTestObject: string;
  localNotes: string;
  expectedCustomFields: string;
  taxIdField: string;
  segmentField: string;
  industryField: string;
  companySizeField: string;
  revenueField: string;
  countryRegionField: string;
  localDedupePolicy: string;
  csvDelimiter: string;
  csvEncoding: string;
  csvHeaderInFirstLine: boolean;
  csvDedupeKey: string;
  csvRequiredMinimumField: string;
  csvObservation: string;
  otherCrmName: string;
  otherCrmNativeEntity: string;
  otherCrmPrimaryKey: string;
  otherCrmFutureBaseUrl: string;
  otherCrmFutureObservation: string;
}

type WorkflowTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success';

interface WorkflowAction {
  title: string;
  description: string;
  buttonLabel: string;
  tone: WorkflowTone;
  disabled: boolean;
  onClick?: () => void;
  reason?: string;
}

type CsvFlowState = 'no-file' | 'invalid' | 'dirty' | 'saved' | 'confirmed' | 'completed';
type HubspotConnectionTestStatus = 'idle' | 'testing' | 'success' | 'error';
type HubspotPreviewStatus = 'idle' | 'loading' | 'success' | 'error';
type HubspotSchemaStatus = 'idle' | 'loading' | 'success' | 'error';
type HubspotSessionState = 'clean' | 'testing' | 'validated' | 'incomplete' | 'error';

interface HubspotConnectionTestMeta {
  provider: 'hubspot';
  testedAt: string;
  hubId: string | null;
  scopes: string[];
  readAccessConfirmed: boolean;
}

interface SalesforceConnectionTestMeta {
  provider: 'salesforce';
  testedAt: string;
  instanceUrl: string;
  apiVersion: string;
  accountLabel: string;
  accountFieldsCount: number;
  readAccessConfirmed: boolean;
}

interface HubspotCompanyPreview {
  id: string;
  name: string | null;
  domain: string | null;
  industry: string | null;
  country: string | null;
  ownerId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface HubspotSchemaDiscoveryPayload {
  status?: 'success' | 'error';
  provider?: string;
  loadedAt?: string;
  count?: number;
  properties?: AccountSchemaProperty[];
  suggestedMappings?: AccountSchemaSuggestedMapping[];
  missingRecommendedFields?: AccountSchemaSuggestedMapping[];
  error?: string;
}

interface CsvProcessingState extends CsvParseProgress {
  fileName: string;
}

const WORKFLOW_STEPS = [
  '1. Escolher fonte',
  '2. Escolher método de entrada',
  '3. Enviar CSV e salvar',
  '4. Confirmar e concluir',
];

const ACTION_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function normalize(value: string | null | undefined): string {
  return (value || '').trim();
}

function formatActionTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return ACTION_TIMESTAMP_FORMATTER.format(parsed);
}

function normalizeSalesforceInstanceUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('salesforce.com') && !host.endsWith('force.com')) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function findNativeField(
  preset: ConnectorPreset,
  canonicalCandidates: string[],
  fallback: string
): string {
  const found = preset.fieldMappings.find((mapping) => canonicalCandidates.includes(mapping.canonicalField));
  return found?.nativeField || fallback;
}

function buildDefaultLocalSourceConfig(type: ConnectorType): LocalSourceConfig {
  const preset = CONNECTOR_PRESETS[type];
  const adapter = getAccountConnectorAdapterSafe(type);
  if (!adapter) {
    return {
      sourceName: preset.name,
      primaryObject: preset.nativeObject || (type === 'other_crm' ? 'Organizations' : ''),
      primaryKeyField: preset.identity.nativePrimaryKey || 'id',
      accountNameField: findNativeField(preset, ['canonical_name', 'legal_name'], 'name'),
      domainField: findNativeField(preset, ['primary_domain'], 'domain'),
      ownerField: findNativeField(preset, ['account_owner'], 'owner_id'),
      statusOrStageField: findNativeField(
        preset,
        ['account_status', 'lifecycle_stage', 'targeting_status', 'abx_stage', 'account_operating_mode'],
        'status'
      ),
      lastUpdatedField: findNativeField(preset, ['updated_at'], type === 'hubspot' ? 'hs_lastmodifieddate' : 'updated_at'),
      priorityTestObject: 'accounts',
      localNotes: '',
      expectedCustomFields: '',
      taxIdField: findNativeField(preset, ['tax_id'], type === 'rd_station' ? 'legal_entity' : 'cnpj'),
      segmentField: findNativeField(preset, ['segment'], 'segment'),
      industryField: findNativeField(preset, ['industry'], 'industry'),
      companySizeField: findNativeField(preset, ['company_size'], 'company_size'),
      revenueField: findNativeField(preset, ['revenue'], 'annual_revenue'),
      countryRegionField: findNativeField(preset, ['billing_country'], 'country'),
      localDedupePolicy: preset.identity.recommendedDedupeStrategy || 'primary_only',
      csvDelimiter: ',',
      csvEncoding: 'UTF-8',
      csvHeaderInFirstLine: true,
      csvDedupeKey: 'domain',
      csvRequiredMinimumField: 'account_name',
      csvObservation: 'Importação CSV disponível para esta fonte. Não envia dados para backend nesta etapa.',
      otherCrmName: type === 'other_crm' ? preset.name : '',
      otherCrmNativeEntity: type === 'other_crm' ? preset.nativeObject : '',
      otherCrmPrimaryKey: type === 'other_crm' ? preset.identity.nativePrimaryKey : '',
      otherCrmFutureBaseUrl: '',
      otherCrmFutureObservation: 'Endpoints e autenticação serão definidos conforme a fonte escolhida.',
    };
  }
  const customFieldCandidates = preset.fieldMappings
    .filter((mapping) => mapping.nativeField.includes('__c') || mapping.nativeField.toLowerCase().includes('custom'))
    .map((mapping) => mapping.nativeField);

  const sourceName = preset.name;
  const primaryObject = preset.nativeObject || (type === 'other_crm' ? 'Organizations' : '');
  const primaryKeyField = preset.identity.nativePrimaryKey || 'id';
  const priorityTestObject = adapter.priorityObjectsForFirstTest[0] || primaryObject || 'accounts';

  return {
    sourceName,
    primaryObject,
    primaryKeyField,
    accountNameField: findNativeField(preset, ['canonical_name', 'legal_name'], 'name'),
    domainField: findNativeField(preset, ['primary_domain'], 'domain'),
    ownerField: findNativeField(preset, ['account_owner'], 'owner_id'),
    statusOrStageField: findNativeField(
      preset,
      ['account_status', 'lifecycle_stage', 'targeting_status', 'abx_stage', 'account_operating_mode'],
      'status'
    ),
    lastUpdatedField: findNativeField(preset, ['updated_at'], type === 'hubspot' ? 'hs_lastmodifieddate' : 'updated_at'),
    priorityTestObject,
    localNotes: '',
    expectedCustomFields: customFieldCandidates.join(', '),
    taxIdField: findNativeField(preset, ['tax_id'], type === 'rd_station' ? 'legal_entity' : 'cnpj'),
    segmentField: findNativeField(preset, ['segment'], 'segment'),
    industryField: findNativeField(preset, ['industry'], 'industry'),
    companySizeField: findNativeField(preset, ['company_size'], 'company_size'),
    revenueField: findNativeField(preset, ['revenue'], 'annual_revenue'),
    countryRegionField: findNativeField(preset, ['billing_country'], 'country'),
    localDedupePolicy: preset.identity.recommendedDedupeStrategy || 'primary_only',
    csvDelimiter: ',',
    csvEncoding: 'UTF-8',
    csvHeaderInFirstLine: true,
    csvDedupeKey: 'domain',
    csvRequiredMinimumField: 'account_name',
    csvObservation: 'Importação CSV disponível para esta fonte. Não envia dados para backend nesta etapa.',
    otherCrmName: type === 'other_crm' ? sourceName : '',
    otherCrmNativeEntity: type === 'other_crm' ? primaryObject : '',
    otherCrmPrimaryKey: type === 'other_crm' ? primaryKeyField : '',
    otherCrmFutureBaseUrl: '',
    otherCrmFutureObservation: 'Endpoints e autenticação serão definidos conforme a fonte escolhida.',
  };
}

function mergeWithDefaults(type: ConnectorType, saved: Partial<LocalSourceConfig> | undefined): LocalSourceConfig {
  return { ...buildDefaultLocalSourceConfig(type), ...(saved || {}) };
}

function getAuthTypeLabel(authType: string): string {
  switch (authType) {
    case 'oauth2_authorization_code': return 'OAuth 2.0 (Authorization Code)';
    case 'bearer_token': return 'Token temporário';
    case 'private_app_token': return 'Token de App Privado';
    case 'api_token': return 'Token de API';
    case 'basic_auth': return 'Basic Auth';
    case 'none': return 'Sem autenticação';
    default: return authType;
  }
}

function getConnectionStatusLabel(status: string): string {
  switch (status) {
    case 'not_configured': return 'Ainda não configurado';
    case 'local_setup_only': return 'Apenas setup local';
    case 'credentials_required': return 'Credenciais necessárias';
    case 'ready_to_test': return 'Pronto para teste';
    case 'testing': return 'Teste em andamento';
    case 'connected': return 'Conexão real ativa';
    case 'token_expired': return 'Token expirado';
    case 'refresh_failed': return 'Renovação falhou';
    case 'connection_error': return 'Erro de conexão';
    case 'disconnected': return 'Desconectado';
    default: return status;
  }
}

function getIngestMethod(type: ConnectorType): string {
  switch (type) {
    case 'salesforce': return 'Teste com token temporário · Token temporário + URL da instância';
    case 'hubspot': return 'Funcional real · Private App API';
    case 'rd_station': return 'Shell/preset · API + Token';
    case 'other_crm': return 'Shell/preset · API, banco ou middleware';
    case 'csv_upload': return 'Método local · Upload CSV';
    default: return 'Setup local guiado';
  }
}

function getInputMethodLabel(selectedConnector: ConnectorType | null, selectedInputMethod: string | null): string {
  if (!selectedConnector) return 'Não definida';
  if (selectedConnector === 'hubspot' && !selectedInputMethod) return 'Método pendente';
  if (selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token') return 'HubSpot real';
  if (selectedConnector === 'salesforce') return 'Validação com token temporário';
  if (selectedInputMethod === 'csv_upload') return 'Entrada local';
  if (selectedInputMethod === 'native_setup') return 'Setup local guiado';
  if (selectedInputMethod) return selectedInputMethod;
  return selectedConnector === 'hubspot' ? 'Método pendente' : 'Setup local guiado';
}

function getDefaultInputMethodForProvider(provider: ConnectorType): string {
  if (provider === 'hubspot') return 'not_selected';
  if (provider === 'csv_upload') return 'csv_upload';
  return 'native_setup';
}

function getConnectorSurfaceLabel(surfaceKind: AccountConnectorSurfaceKind): string {
  switch (surfaceKind) {
    case 'functional_real':
      return 'Funcional real';
    case 'shell_preset':
      return 'Shell/preset';
    case 'future_documented':
      return 'A definir';
    default:
      return 'Conector';
  }
}

function getConnectorSurfaceTone(surfaceKind: AccountConnectorSurfaceKind): 'neutral' | 'info' | 'warning' | 'danger' | 'success' {
  switch (surfaceKind) {
    case 'functional_real':
      return 'success';
    case 'shell_preset':
      return 'warning';
    case 'future_documented':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function getMetadataStatusLabel(status: AccountRealConnectionContract['metadataStatus']): string {
  switch (status) {
    case 'ready_to_discover':
      return 'Pronto para descobrir';
    case 'discovering':
      return 'Descobrindo';
    case 'discovered':
      return 'Descoberto';
    case 'failed':
      return 'Falha';
    default:
      return 'Não descoberto';
  }
}

function getSyncStatusLabel(status: AccountRealConnectionContract['syncStatus']): string {
  switch (status) {
    case 'ready':
      return 'Pronto';
    case 'running':
      return 'Em execução';
    case 'succeeded':
      return 'Concluído';
    case 'failed':
      return 'Falhou';
    case 'stale':
      return 'Desatualizado';
    case 'not_available':
      return 'Não disponível';
    default:
      return 'Não configurado';
  }
}

function getHubspotTestLabel(status: HubspotConnectionTestStatus): string {
  switch (status) {
    case 'testing':
      return 'Testando';
    case 'success':
      return 'Validada';
    case 'error':
      return 'Erro';
    default:
      return 'Não testado';
  }
}

function getHubspotSessionStateLabel(state: HubspotSessionState): string {
  switch (state) {
    case 'testing':
      return 'Testando';
    case 'validated':
      return 'Validada nesta sessão';
    case 'incomplete':
      return 'Teste validado, preview/schema pendentes';
    case 'error':
      return 'Erro';
    default:
      return 'Limpa';
  }
}

function getHubspotSessionStateTone(state: HubspotSessionState): 'neutral' | 'info' | 'warning' | 'danger' | 'success' {
  switch (state) {
    case 'testing':
      return 'info';
    case 'validated':
      return 'success';
    case 'incomplete':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'neutral';
  }
}

function getCsvSchemaQualityLabel(level: CsvSchemaQualityLevel): string {
  switch (level) {
    case 'alta':
      return 'Alta';
    case 'média':
      return 'Média';
    default:
      return 'Baixa';
  }
}

function getCsvSchemaTone(level: CsvSchemaQualityLevel): 'neutral' | 'info' | 'warning' | 'danger' | 'success' {
  switch (level) {
    case 'alta':
      return 'success';
    case 'média':
      return 'warning';
    default:
      return 'danger';
  }
}

function getIntegrationLabel(type: ConnectorType): string {
  switch (type) {
    case 'salesforce': return 'Teste com token temporário';
    case 'hubspot': return 'Funcional real';
    case 'rd_station': return 'Shell/preset';
    case 'other_crm': return 'Shell/preset';
    case 'csv_upload': return 'Método local';
    default: return 'Conector';
  }
}

function ConnectorLogo({ type, isActive }: { type: ConnectorType; isActive: boolean }) {
  const brands: Record<ConnectorType, { abbr: string; color: string }> = {
    salesforce: { abbr: 'SF', color: 'text-sky-600' },
    hubspot: { abbr: 'HS', color: 'text-orange-500' },
    rd_station: { abbr: 'RD', color: 'text-blue-600' },
    csv_upload: { abbr: 'CSV', color: 'text-emerald-600' },
    other_crm: { abbr: '?', color: 'text-slate-500' },
  };
  const { abbr, color } = brands[type];
  return (
    <span className={`text-xs font-black tracking-tight leading-none ${isActive ? 'text-white' : color}`}>
      {abbr}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none transition-all focus:border-blue-500"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none transition-all focus:border-blue-500"
        />
      )}
    </div>
  );
}

export function AccountSources() {
  const {
    conta,
    selectedConnector,
    legacySelectedConnector,
    setConnector,
    updateCustomConfig,
    customConfig,
    connectorLocalValidated,
    setConnectorLocalValidated,
    registerLocalSourceSaveHandler,
    setAccountSourcesStepCompleted,
    hubspotConnectionStepCompleted,
    completeLocalSetup,
    csvUploadMeta,
    inputMethodDraftByProvider,
    setInputMethodDraftForProvider,
    realConnectionContract,
    accountSourcesStepCompleted,
    setCanSaveLocalSourceSetup,
  } = useContasConfig();

  const connectorTypes: Array<Exclude<ConnectorType, 'csv_upload'>> = ['salesforce', 'hubspot', 'rd_station', 'other_crm'];
  const activePreset = selectedConnector ? CONNECTOR_PRESETS[selectedConnector] : null;
  const activeAdapter = getAccountConnectorAdapterSafe(selectedConnector);
  const savedLocalConfigByProvider = React.useMemo(
    () => (customConfig.localSourceConfigByProvider || {}) as Partial<Record<ConnectorType, Partial<LocalSourceConfig>>>,
    [customConfig.localSourceConfigByProvider]
  );
  const connectionTestStatusByProvider = React.useMemo(
    () => (customConfig.connectionTestStatusByProvider || {}) as Record<string, HubspotConnectionTestStatus>,
    [customConfig.connectionTestStatusByProvider]
  );
  const connectionTestMetaByProvider = React.useMemo(
    () => (customConfig.connectionTestMetaByProvider || {}) as Record<string, HubspotConnectionTestMeta | null>,
    [customConfig.connectionTestMetaByProvider]
  );
  const connectionTestErrorByProvider = React.useMemo(
    () => (customConfig.connectionTestErrorByProvider || {}) as Record<string, string | null>,
    [customConfig.connectionTestErrorByProvider]
  );
  const lastConnectionTestAtByProvider = React.useMemo(
    () => (customConfig.lastConnectionTestAtByProvider || {}) as Record<string, string | null>,
    [customConfig.lastConnectionTestAtByProvider]
  );
  const storedInputMethod = selectedConnector ? customConfig.inputMethodByProvider?.[selectedConnector] ?? null : null;
  const hubspotDraftChoice = selectedConnector ? inputMethodDraftByProvider[selectedConnector] ?? null : null;
  const hubspotConnectionTestStatus = selectedConnector ? connectionTestStatusByProvider[selectedConnector] ?? 'idle' : 'idle';
  const hubspotHasRealEvidence = selectedConnector === 'hubspot'
    && (hubspotConnectionTestStatus === 'success' || hubspotConnectionStepCompleted);
  const hubspotHasCsvEvidence = Boolean(csvUploadMeta) || connectorLocalValidated || accountSourcesStepCompleted;
  const effectiveInputMethod = React.useMemo(() => {
    if (!selectedConnector) return null;
    if (selectedConnector !== 'hubspot') {
      return storedInputMethod && storedInputMethod !== 'csv_upload' ? storedInputMethod : 'native_setup';
    }
    if (hubspotDraftChoice) return hubspotDraftChoice;
    if (storedInputMethod === 'private_app_token' && hubspotHasRealEvidence) return 'private_app_token';
    if (storedInputMethod === 'csv_upload' && hubspotHasCsvEvidence) return 'csv_upload';
    return null;
  }, [
    hubspotDraftChoice,
    hubspotHasCsvEvidence,
    hubspotHasRealEvidence,
    selectedConnector,
    storedInputMethod,
  ]);
  const selectedInputMethod = effectiveInputMethod;
  const isHubspotMethodPending = selectedConnector === 'hubspot' && !effectiveInputMethod;
  const isCsvInput = selectedInputMethod === 'csv_upload';
  const isHubspotApiInput = selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token';
  const currentSourceCompleted = isHubspotApiInput ? hubspotConnectionStepCompleted : accountSourcesStepCompleted;
  const rawSaved = selectedConnector ? savedLocalConfigByProvider[selectedConnector] : undefined;
  const savedLocalConfig = (rawSaved && (rawSaved as any)._savedFor === selectedConnector)
    ? rawSaved
    : undefined;

  const [draftConfig, setDraftConfig] = React.useState<LocalSourceConfig | null>(null);
  const [hasUnsavedLocalEdit, setHasUnsavedLocalEdit] = React.useState(false);
  const [hubspotPrivateAppToken, setHubspotPrivateAppToken] = React.useState('');
  const [hubspotTesting, setHubspotTesting] = React.useState(false);
  const [hubspotPreviewStatus, setHubspotPreviewStatus] = React.useState<HubspotPreviewStatus>('idle');
  const [hubspotPreviewCompanies, setHubspotPreviewCompanies] = React.useState<HubspotCompanyPreview[]>([]);
  const [hubspotPreviewLoadedAt, setHubspotPreviewLoadedAt] = React.useState<string | null>(null);
  const [hubspotPreviewError, setHubspotPreviewError] = React.useState<string | null>(null);
  const [hubspotSchemaStatus, setHubspotSchemaStatus] = React.useState<HubspotSchemaStatus>('idle');
  const [hubspotSchemaProperties, setHubspotSchemaProperties] = React.useState<AccountSchemaProperty[]>([]);
  const [hubspotSchemaTotalCount, setHubspotSchemaTotalCount] = React.useState<number | null>(null);
  const [hubspotSchemaLoadedAt, setHubspotSchemaLoadedAt] = React.useState<string | null>(null);
  const [hubspotSchemaError, setHubspotSchemaError] = React.useState<string | null>(null);
  const [hubspotSchemaSuggestedMappings, setHubspotSchemaSuggestedMappings] = React.useState<AccountSchemaSuggestedMapping[]>([]);
  const [hubspotMissingRecommendedFields, setHubspotMissingRecommendedFields] = React.useState<AccountSchemaSuggestedMapping[]>([]);
  const [salesforceInstanceUrl, setSalesforceInstanceUrl] = React.useState('');
  const [salesforceAccessToken, setSalesforceAccessToken] = React.useState('');
  const [salesforceTesting, setSalesforceTesting] = React.useState(false);
  const [salesforceConnectionTestStatus, setSalesforceConnectionTestStatus] = React.useState<HubspotConnectionTestStatus>('idle');
  const [salesforceConnectionTestError, setSalesforceConnectionTestError] = React.useState<string | null>(null);
  const [salesforceConnectionTestMeta, setSalesforceConnectionTestMeta] = React.useState<SalesforceConnectionTestMeta | null>(null);

  // CSV upload local state
  const [isCsvParsing, setIsCsvParsing] = React.useState(false);
  const [csvProcessingState, setCsvProcessingState] = React.useState<CsvProcessingState | null>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const csvProcessingRunIdRef = React.useRef(0);
  const csvReaderRef = React.useRef<FileReader | null>(null);
  const csvProcessingTimeoutRef = React.useRef<number | null>(null);
  const clearCsvProcessingTimeout = React.useCallback(() => {
    if (csvProcessingTimeoutRef.current !== null) {
      window.clearTimeout(csvProcessingTimeoutRef.current);
      csvProcessingTimeoutRef.current = null;
    }
  }, []);
  const clearCsvInputValue = React.useCallback(() => {
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  }, []);
  const clearHubspotPreview = React.useCallback(() => {
    setHubspotPreviewStatus('idle');
    setHubspotPreviewCompanies([]);
    setHubspotPreviewLoadedAt(null);
    setHubspotPreviewError(null);
  }, []);
  const clearHubspotSchema = React.useCallback(() => {
    setHubspotSchemaStatus('idle');
    setHubspotSchemaProperties([]);
    setHubspotSchemaTotalCount(null);
    setHubspotSchemaLoadedAt(null);
    setHubspotSchemaError(null);
    setHubspotSchemaSuggestedMappings([]);
    setHubspotMissingRecommendedFields([]);
  }, []);
  const resetHubspotSession = React.useCallback(() => {
    if (!selectedConnector || selectedConnector !== 'hubspot') return;
    setHubspotPrivateAppToken('');
    setHubspotTesting(false);
    setInputMethodDraftForProvider('hubspot', null);
    clearHubspotPreview();
    clearHubspotSchema();
    updateCustomConfig((prev: any) => ({
      ...prev,
      inputMethodByProvider: {
        ...(prev.inputMethodByProvider || {}),
        hubspot: 'not_selected',
      },
      connectionTestStatusByProvider: {
        ...(prev.connectionTestStatusByProvider || {}),
        hubspot: 'idle',
      },
      connectionTestMetaByProvider: {
        ...(prev.connectionTestMetaByProvider || {}),
        hubspot: null,
      },
      connectionTestErrorByProvider: {
        ...(prev.connectionTestErrorByProvider || {}),
        hubspot: null,
      },
      lastConnectionTestAtByProvider: {
        ...(prev.lastConnectionTestAtByProvider || {}),
        hubspot: null,
      },
      connectorLocalValidated: false,
      connectorLocalValidatedByProvider: {
        ...(prev.connectorLocalValidatedByProvider || {}),
        hubspot: false,
      },
      localSourceSavedAt: null,
      localSourceSavedAtByProvider: {
        ...(prev.localSourceSavedAtByProvider || {}),
        hubspot: null,
      },
      localContractValidatedAt: null,
      localContractValidatedAtByProvider: {
        ...(prev.localContractValidatedAtByProvider || {}),
        hubspot: null,
      },
      accountSourcesStepCompleted: false,
      accountSourcesStepCompletedByProvider: {
        ...(prev.accountSourcesStepCompletedByProvider || {}),
        hubspot: false,
      },
      accountSourcesStepCompletedAt: null,
      accountSourcesStepCompletedAtByProvider: {
        ...(prev.accountSourcesStepCompletedAtByProvider || {}),
        hubspot: null,
      },
      hubspotConnectionStepCompleted: false,
      hubspotConnectionStepCompletedByProvider: {
        ...(prev.hubspotConnectionStepCompletedByProvider || {}),
        hubspot: false,
      },
      hubspotConnectionStepCompletedAt: null,
      hubspotConnectionStepCompletedAtByProvider: {
        ...(prev.hubspotConnectionStepCompletedAtByProvider || {}),
        hubspot: null,
      },
    }));
  }, [
    clearHubspotPreview,
    clearHubspotSchema,
    selectedConnector,
    setInputMethodDraftForProvider,
    updateCustomConfig,
  ]);
  const openCsvPicker = React.useCallback(() => {
    clearCsvInputValue();
    csvInputRef.current?.click();
  }, [clearCsvInputValue]);

  React.useEffect(() => {
    if (!selectedConnector || selectedConnector !== 'hubspot' || selectedInputMethod !== 'private_app_token') {
      setHubspotPrivateAppToken('');
      setHubspotTesting(false);
      clearHubspotPreview();
      clearHubspotSchema();
      return;
    }
    if (hubspotConnectionTestStatus !== 'success') {
      clearHubspotPreview();
      clearHubspotSchema();
    }
  }, [clearHubspotPreview, clearHubspotSchema, hubspotConnectionTestStatus, selectedConnector, selectedInputMethod]);

  React.useEffect(() => {
    if (!selectedConnector) {
      setDraftConfig(null);
      setHasUnsavedLocalEdit(false);
      clearCsvProcessingTimeout();
      csvReaderRef.current?.abort();
      csvReaderRef.current = null;
      setCsvProcessingState(null);
      clearCsvInputValue();
      return;
    }
    setDraftConfig(mergeWithDefaults(selectedConnector, savedLocalConfig));
    setHasUnsavedLocalEdit(!savedLocalConfig);
    clearCsvProcessingTimeout();
    csvReaderRef.current?.abort();
    csvReaderRef.current = null;
    setCsvProcessingState(null);
    clearCsvInputValue();
  }, [clearCsvInputValue, clearCsvProcessingTimeout, selectedConnector, savedLocalConfig]);

  const CSV_REVALIDATION_FIELDS: (keyof LocalSourceConfig)[] = [
    'csvDedupeKey', 'csvRequiredMinimumField', 'csvDelimiter', 'csvEncoding', 'csvHeaderInFirstLine',
  ];

  const updateDraft = <K extends keyof LocalSourceConfig>(key: K, value: LocalSourceConfig[K]) => {
    setDraftConfig((previous) => {
      if (!previous) return previous;
      if (previous[key] === value) return previous;
      setHasUnsavedLocalEdit(true);
      return { ...previous, [key]: value };
    });
    if (connectorLocalValidated) {
      setConnectorLocalValidated(false);
    }
    setAccountSourcesStepCompleted(false);
    updateCustomConfig((prev: any) => ({
      ...prev,
      localContractValidatedAt: null,
      localContractValidatedAtByProvider: selectedConnector
        ? {
            ...(prev.localContractValidatedAtByProvider || {}),
            [selectedConnector]: null,
          }
        : prev.localContractValidatedAtByProvider,
      accountSourcesStepCompletedAt: null,
      accountSourcesStepCompletedAtByProvider: selectedConnector
        ? {
            ...(prev.accountSourcesStepCompletedAtByProvider || {}),
            [selectedConnector]: null,
          }
        : prev.accountSourcesStepCompletedAtByProvider,
    }));
    // Invalidate CSV meta when config fields that affect validation change
    if (isCsvInput && CSV_REVALIDATION_FIELDS.includes(key)) {
      updateCustomConfig((prev: any) => ({
        ...prev,
        csvUploadMeta: null,
        csvUploadMetaByProvider: selectedConnector
          ? {
              ...(prev.csvUploadMetaByProvider || {}),
              [selectedConnector]: null,
            }
          : prev.csvUploadMetaByProvider,
        connectorLocalValidated: false,
          connectorLocalValidatedByProvider: selectedConnector
            ? {
                ...(prev.connectorLocalValidatedByProvider || {}),
                [selectedConnector]: false,
              }
            : prev.connectorLocalValidatedByProvider,
        }));
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const setInputMethodForSelectedConnector = React.useCallback((method: string) => {
    if (!selectedConnector) return;
    setInputMethodDraftForProvider(selectedConnector, method);
    updateCustomConfig((prev: any) => ({
      ...prev,
      inputMethodByProvider: {
        ...(prev.inputMethodByProvider || {}),
        [selectedConnector]:
          selectedConnector === 'hubspot' && method === 'csv_upload'
            ? (prev.inputMethodByProvider?.[selectedConnector] ?? 'not_selected')
            : method,
      },
    }));
  }, [selectedConnector, setInputMethodDraftForProvider, updateCustomConfig]);

  const hasDraftChanges = React.useMemo(() => {
    if (!selectedConnector || !draftConfig) return false;
    if (hasUnsavedLocalEdit) return true;
    const baseline = mergeWithDefaults(selectedConnector, savedLocalConfig);
    return JSON.stringify(draftConfig) !== JSON.stringify(baseline);
  }, [draftConfig, hasUnsavedLocalEdit, savedLocalConfig, selectedConnector]);

  React.useEffect(() => {
    setCanSaveLocalSourceSetup(hasDraftChanges && !isHubspotMethodPending && !isHubspotApiInput);
  }, [hasDraftChanges, isHubspotApiInput, isHubspotMethodPending, setCanSaveLocalSourceSetup]);

  const processCsvFile = React.useCallback(async (file: File) => {
    if (!selectedConnector || !isCsvInput || !draftConfig) return;

    const runId = ++csvProcessingRunIdRef.current;
    const currentFileName = file.name;
    let finished = false;

    const finish = (nextState: CsvProcessingState | null, keepErrorVisible = false) => {
      if (finished || runId !== csvProcessingRunIdRef.current) return;
      finished = true;
      clearCsvProcessingTimeout();
      csvReaderRef.current = null;
      setIsCsvParsing(false);
      setCsvProcessingState(nextState);
      if (!keepErrorVisible) {
        window.setTimeout(() => {
          if (runId === csvProcessingRunIdRef.current) {
            setCsvProcessingState(null);
          }
        }, 0);
      }
    };

    const fail = (message: string) => {
      if (finished || runId !== csvProcessingRunIdRef.current) return;
      finish({
        fileName: currentFileName,
        phase: 'error',
        processedRows: 0,
        totalRows: 0,
        percent: 100,
        message,
      }, true);
      updateCustomConfig((prev: any) => ({
        ...prev,
        csvUploadMeta: null,
        csvUploadMetaByProvider: selectedConnector
          ? {
              ...(prev.csvUploadMetaByProvider || {}),
              [selectedConnector]: null,
            }
          : prev.csvUploadMetaByProvider,
        connectorLocalValidated: false,
        connectorLocalValidatedByProvider: selectedConnector
          ? {
              ...(prev.connectorLocalValidatedByProvider || {}),
              [selectedConnector]: false,
            }
          : prev.connectorLocalValidatedByProvider,
      }));
    };

    setHasUnsavedLocalEdit(true);
    setIsCsvParsing(true);
    setCsvProcessingState({
      fileName: currentFileName,
      phase: 'reading_file',
      processedRows: 0,
      totalRows: 0,
      percent: 5,
      message: 'Lendo o arquivo no navegador...',
    });
    if (connectorLocalValidated) setConnectorLocalValidated(false);
    setAccountSourcesStepCompleted(false);
    updateCustomConfig((prev: any) => ({
      ...prev,
      localContractValidatedAt: null,
      localContractValidatedAtByProvider: selectedConnector
        ? {
            ...(prev.localContractValidatedAtByProvider || {}),
            [selectedConnector]: null,
          }
        : prev.localContractValidatedAtByProvider,
      accountSourcesStepCompletedAt: null,
      accountSourcesStepCompletedAtByProvider: selectedConnector
        ? {
            ...(prev.accountSourcesStepCompletedAtByProvider || {}),
            [selectedConnector]: null,
          }
        : prev.accountSourcesStepCompletedAtByProvider,
    }));

    const reader = new FileReader();
    csvReaderRef.current = reader;
    csvProcessingTimeoutRef.current = window.setTimeout(() => {
      if (runId !== csvProcessingRunIdRef.current || finished) return;
      fail('Não foi possível concluir a leitura do CSV.');
    }, 10000);

    reader.onprogress = (event) => {
      if (finished || runId !== csvProcessingRunIdRef.current || !event.lengthComputable || !event.total) return;
      const percent = Math.max(5, Math.min(24, Math.round((event.loaded / event.total) * 20)));
      setCsvProcessingState({
        fileName: currentFileName,
        phase: 'reading_file',
        processedRows: 0,
        totalRows: 0,
        percent,
        message: `Lendo o arquivo no navegador... ${Math.round((event.loaded / event.total) * 100)}%`,
      });
    };

    reader.onerror = () => {
      if (finished || runId !== csvProcessingRunIdRef.current) return;
      fail('Falha ao ler o arquivo no navegador.');
    };

    reader.onabort = () => {
      if (finished || runId !== csvProcessingRunIdRef.current) return;
      fail('Leitura do CSV cancelada. Selecione o arquivo novamente.');
    };

    reader.onload = async (event) => {
      if (finished || runId !== csvProcessingRunIdRef.current) return;
      try {
        const text = String(event.target?.result ?? '');
        const delimiter = draftConfig.csvDelimiter || ',';
        const hasHeader = draftConfig.csvHeaderInFirstLine !== false;
        setCsvProcessingState({
          fileName: currentFileName,
          phase: 'parsing_csv',
          processedRows: 0,
          totalRows: 0,
          percent: 26,
          message: 'Interpretando as linhas no navegador...',
        });

        const parsed = await parseCsvText(text, delimiter, hasHeader, {
          onProgress: (progress) => {
            if (finished || runId !== csvProcessingRunIdRef.current) return;
            const scaledPercent = Math.min(80, Math.max(26, progress.phase === 'done'
              ? 80
              : progress.phase === 'parsing_csv'
                ? 26 + Math.round(progress.percent * 0.54)
                : progress.percent));
            setCsvProcessingState({
              fileName: currentFileName,
              phase: progress.phase,
              processedRows: progress.processedRows,
              totalRows: progress.totalRows,
              percent: scaledPercent,
              message: progress.message,
            });
          },
        });

        if (finished || runId !== csvProcessingRunIdRef.current) return;
        setCsvProcessingState({
          fileName: currentFileName,
          phase: 'validating_columns',
          processedRows: parsed.rawRowCount,
          totalRows: parsed.rawRowCount,
          percent: 84,
          message: 'Validando colunas essenciais e chaves de dedupe...',
        });

        const { previewRows, validation } = validateCsvData(
          file.name,
          file.size,
          parsed,
          {
            requiredMinimumField: draftConfig.csvRequiredMinimumField || '',
            dedupeKey: draftConfig.csvDedupeKey || '',
          }
        );
        const schemaAnalysis = analyzeCsvSchema(parsed, {
          requiredMinimumField: draftConfig.csvRequiredMinimumField || '',
          dedupeKey: draftConfig.csvDedupeKey || '',
        });

        if (finished || runId !== csvProcessingRunIdRef.current) return;
        setCsvProcessingState({
          fileName: currentFileName,
          phase: 'building_preview',
          processedRows: parsed.rawRowCount,
          totalRows: parsed.rawRowCount,
          percent: 94,
          message: 'Montando preview e resumo local...',
        });

        const meta: CsvUploadMeta = {
          fileName: file.name,
          fileSizeBytes: file.size,
          headers: parsed.headers,
          rowCount: parsed.rawRowCount,
          previewRows,
          uploadedAt: new Date().toISOString(),
          validationResult: validation,
          schemaAnalysis,
        };

        updateCustomConfig((prev: any) => ({
          ...prev,
          csvUploadMeta: meta,
          csvUploadMetaByProvider: selectedConnector
            ? {
                ...(prev.csvUploadMetaByProvider || {}),
                [selectedConnector]: meta,
              }
            : prev.csvUploadMetaByProvider,
          connectorLocalValidated: false,
          connectorLocalValidatedByProvider: selectedConnector
            ? {
                ...(prev.connectorLocalValidatedByProvider || {}),
                [selectedConnector]: false,
              }
            : prev.connectorLocalValidatedByProvider,
        }));

        finish({
          fileName: currentFileName,
          phase: 'done',
          processedRows: parsed.rawRowCount,
          totalRows: parsed.rawRowCount,
          percent: 100,
          message: validation.isValid
            ? 'CSV pronto para uso local.'
            : 'CSV carregado com avisos de validação.',
        });
      } catch (error) {
        if (finished || runId !== csvProcessingRunIdRef.current) return;
        fail(error instanceof Error ? error.message : 'Não foi possível processar o CSV.');
      }
    };

    window.setTimeout(() => {
      if (runId !== csvProcessingRunIdRef.current || finished) return;
      try {
        reader.readAsText(file, draftConfig.csvEncoding || 'UTF-8');
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Não foi possível iniciar a leitura do CSV.');
      }
    }, 0);
  }, [
    clearCsvProcessingTimeout,
    connectorLocalValidated,
    draftConfig,
    isCsvInput,
    selectedConnector,
    setAccountSourcesStepCompleted,
    setConnectorLocalValidated,
    updateCustomConfig,
  ]);

  const canValidateLocally = React.useMemo(() => {
    if (!selectedConnector || !draftConfig) return false;

    if (isCsvInput) {
      const configReady =
        normalize(draftConfig.csvRequiredMinimumField).length > 0 &&
        normalize(draftConfig.csvDedupeKey).length > 0 &&
        normalize(draftConfig.csvDelimiter).length > 0 &&
        normalize(draftConfig.csvEncoding).length > 0;
      const csvReady = csvUploadMeta?.validationResult?.isValid === true;
      return configReady && csvReady && !hasDraftChanges;
    }

    const baseReady = [
      normalize(draftConfig.sourceName),
      normalize(draftConfig.primaryObject),
      normalize(draftConfig.primaryKeyField),
      normalize(draftConfig.accountNameField),
      normalize(draftConfig.domainField),
    ].every((value) => value.length > 0);

    if (!baseReady) return false;

    if (selectedConnector === 'other_crm') {
      return normalize(draftConfig.otherCrmName).length > 0
        && normalize(draftConfig.otherCrmNativeEntity).length > 0
        && normalize(draftConfig.otherCrmPrimaryKey).length > 0
        && !hasDraftChanges;
    }

    return !hasDraftChanges;
  }, [draftConfig, selectedConnector, csvUploadMeta, hasDraftChanges, isCsvInput]);

  const saveLocalConfig = React.useCallback(() => {
    if (!selectedConnector || !draftConfig) return;
    const wasDirty = hasDraftChanges;
    const now = new Date().toISOString();

    const resolvedPrimaryKey = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmPrimaryKey) || normalize(draftConfig.primaryKeyField)
      : normalize(draftConfig.primaryKeyField);
    const resolvedObject = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmNativeEntity) || normalize(draftConfig.primaryObject)
      : normalize(draftConfig.primaryObject);
    const resolvedName = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmName) || normalize(draftConfig.sourceName)
      : normalize(draftConfig.sourceName);

    updateCustomConfig((prev: any) => ({
      ...prev,
      inputMethodByProvider: {
        ...(prev.inputMethodByProvider || {}),
        [selectedConnector]: selectedInputMethod || getDefaultInputMethodForProvider(selectedConnector),
      },
      localSourceConfigByProvider: {
        ...(prev.localSourceConfigByProvider || {}),
        [selectedConnector]: { ...draftConfig, _savedFor: selectedConnector },
      },
      customName: selectedConnector === 'other_crm' ? resolvedName : prev.customName,
      customNativeObject: selectedConnector === 'other_crm' ? resolvedObject : prev.customNativeObject,
      customPrimaryKey: selectedConnector === 'other_crm' ? resolvedPrimaryKey : prev.customPrimaryKey,
      primaryKeys: [resolvedPrimaryKey].filter(Boolean),
      connectorLocalValidated: wasDirty ? false : connectorLocalValidated,
      connectorLocalValidatedByProvider: {
        ...(prev.connectorLocalValidatedByProvider || {}),
        [selectedConnector]: wasDirty ? false : (prev.connectorLocalValidatedByProvider?.[selectedConnector] ?? connectorLocalValidated),
      },
      accountSourcesStepCompleted: wasDirty ? false : accountSourcesStepCompleted,
      accountSourcesStepCompletedByProvider: {
        ...(prev.accountSourcesStepCompletedByProvider || {}),
        [selectedConnector]: wasDirty ? false : (prev.accountSourcesStepCompletedByProvider?.[selectedConnector] ?? accountSourcesStepCompleted),
      },
      localSourceSavedAt: now,
      localSourceSavedAtByProvider: {
        ...(prev.localSourceSavedAtByProvider || {}),
        [selectedConnector]: now,
      },
      localContractValidatedAt: wasDirty ? null : prev.localContractValidatedAt ?? null,
      localContractValidatedAtByProvider: {
        ...(prev.localContractValidatedAtByProvider || {}),
        [selectedConnector]: wasDirty ? null : (prev.localContractValidatedAtByProvider?.[selectedConnector] ?? null),
      },
      accountSourcesStepCompletedAt: wasDirty ? null : prev.accountSourcesStepCompletedAt ?? null,
      accountSourcesStepCompletedAtByProvider: {
        ...(prev.accountSourcesStepCompletedAtByProvider || {}),
        [selectedConnector]: wasDirty ? null : (prev.accountSourcesStepCompletedAtByProvider?.[selectedConnector] ?? null),
      },
    }));
    setHasUnsavedLocalEdit(false);
  }, [accountSourcesStepCompleted, connectorLocalValidated, draftConfig, hasDraftChanges, selectedConnector, selectedInputMethod, updateCustomConfig]);

  const restorePreset = React.useCallback(() => {
    if (!selectedConnector) return;
    const defaults = buildDefaultLocalSourceConfig(selectedConnector);
    const now = new Date().toISOString();
    setDraftConfig(defaults);
    updateCustomConfig((prev: any) => ({
      ...prev,
      inputMethodByProvider: {
        ...(prev.inputMethodByProvider || {}),
        [selectedConnector]: selectedInputMethod || getDefaultInputMethodForProvider(selectedConnector),
      },
      localSourceConfigByProvider: {
        ...(prev.localSourceConfigByProvider || {}),
        [selectedConnector]: { ...defaults, _savedFor: selectedConnector },
      },
      connectorLocalValidated: false,
      connectorLocalValidatedByProvider: {
        ...(prev.connectorLocalValidatedByProvider || {}),
        [selectedConnector]: false,
      },
      customName: selectedConnector === 'other_crm' ? defaults.otherCrmName : prev.customName,
      customNativeObject: selectedConnector === 'other_crm' ? defaults.otherCrmNativeEntity : prev.customNativeObject,
      customPrimaryKey: selectedConnector === 'other_crm' ? defaults.otherCrmPrimaryKey : prev.customPrimaryKey,
      primaryKeys: [selectedConnector === 'other_crm' ? defaults.otherCrmPrimaryKey : defaults.primaryKeyField].filter(Boolean),
      accountSourcesStepCompleted: false,
      accountSourcesStepCompletedByProvider: {
        ...(prev.accountSourcesStepCompletedByProvider || {}),
        [selectedConnector]: false,
      },
      localSourceSavedAt: now,
      localSourceSavedAtByProvider: {
        ...(prev.localSourceSavedAtByProvider || {}),
        [selectedConnector]: now,
      },
      csvUploadMeta: null,
      csvUploadMetaByProvider: {
        ...(prev.csvUploadMetaByProvider || {}),
        [selectedConnector]: null,
      },
      localContractValidatedAt: null,
      localContractValidatedAtByProvider: {
        ...(prev.localContractValidatedAtByProvider || {}),
        [selectedConnector]: null,
      },
      accountSourcesStepCompletedAt: null,
      accountSourcesStepCompletedAtByProvider: {
        ...(prev.accountSourcesStepCompletedAtByProvider || {}),
        [selectedConnector]: null,
      },
    }));
    if (csvInputRef.current) csvInputRef.current.value = '';
    setHasUnsavedLocalEdit(false);
  }, [selectedConnector, selectedInputMethod, updateCustomConfig]);

  const validateLocalContract = React.useCallback(() => {
    if (!selectedConnector || !draftConfig || !canValidateLocally) return;
    const now = new Date().toISOString();
    updateCustomConfig((prev: any) => ({
      ...prev,
      connectorLocalValidated: true,
      connectorLocalValidatedByProvider: {
        ...(prev.connectorLocalValidatedByProvider || {}),
        [selectedConnector]: true,
      },
      localContractValidatedAt: now,
      localContractValidatedAtByProvider: {
        ...(prev.localContractValidatedAtByProvider || {}),
        [selectedConnector]: now,
      },
      accountSourcesStepCompleted: false,
      accountSourcesStepCompletedByProvider: {
        ...(prev.accountSourcesStepCompletedByProvider || {}),
        [selectedConnector]: false,
      },
      accountSourcesStepCompletedAt: null,
      accountSourcesStepCompletedAtByProvider: {
        ...(prev.accountSourcesStepCompletedAtByProvider || {}),
        [selectedConnector]: null,
      },
    }));
  }, [canValidateLocally, draftConfig, selectedConnector, updateCustomConfig]);

  const testHubspotConnection = React.useCallback(async () => {
    if (!selectedConnector || selectedConnector !== 'hubspot' || selectedInputMethod !== 'private_app_token') return;
    const token = hubspotPrivateAppToken.trim();
    const now = new Date().toISOString();

    const setTestState = (status: HubspotConnectionTestStatus, error: string | null, meta: HubspotConnectionTestMeta | null) => {
      updateCustomConfig((prev: any) => ({
        ...prev,
        connectionTestStatusByProvider: {
          ...(prev.connectionTestStatusByProvider || {}),
          [selectedConnector]: status,
        },
        connectionTestMetaByProvider: {
          ...(prev.connectionTestMetaByProvider || {}),
          [selectedConnector]: meta,
        },
        connectionTestErrorByProvider: {
          ...(prev.connectionTestErrorByProvider || {}),
          [selectedConnector]: error,
        },
        lastConnectionTestAtByProvider: {
          ...(prev.lastConnectionTestAtByProvider || {}),
          [selectedConnector]: now,
        },
      }));
    };

    if (!token) {
      setTestState('error', 'Informe um token de Private App para testar a conexão HubSpot.', null);
      return;
    }

    setHubspotTesting(true);
    setTestState('testing', null, null);

    try {
      const response = await fetch('/api/account-connectors/hubspot/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const payload = await response.json().catch(() => null) as
        | {
          status?: 'success' | 'error';
          provider?: string;
          testedAt?: string;
          hubId?: string | null;
          scopes?: string[];
          readAccessConfirmed?: boolean;
          error?: string;
        }
        | null;

      if (!response.ok || payload?.status !== 'success') {
        const message = payload?.error || 'Não foi possível validar a conexão HubSpot.';
        setTestState('error', message, null);
        setConnectorLocalValidated(false);
        setAccountSourcesStepCompleted(false);
        updateCustomConfig((prev: any) => ({
          ...prev,
          connectorLocalValidated: false,
          connectorLocalValidatedByProvider: {
            ...(prev.connectorLocalValidatedByProvider || {}),
            [selectedConnector]: false,
          },
          accountSourcesStepCompleted: false,
          accountSourcesStepCompletedByProvider: {
            ...(prev.accountSourcesStepCompletedByProvider || {}),
            [selectedConnector]: false,
          },
          accountSourcesStepCompletedAt: null,
          accountSourcesStepCompletedAtByProvider: {
            ...(prev.accountSourcesStepCompletedAtByProvider || {}),
            [selectedConnector]: null,
          },
          localContractValidatedAt: null,
          localContractValidatedAtByProvider: {
            ...(prev.localContractValidatedAtByProvider || {}),
            [selectedConnector]: null,
          },
        }));
        return;
      }

      const testedAt = payload?.testedAt || now;
      const meta: HubspotConnectionTestMeta = {
        provider: 'hubspot',
        testedAt,
        hubId: payload?.hubId ?? null,
        scopes: Array.isArray(payload?.scopes) ? payload.scopes : [],
        readAccessConfirmed: payload?.readAccessConfirmed === true,
      };

      setTestState('success', null, meta);
      setConnectorLocalValidated(true);
      setAccountSourcesStepCompleted(false);

      updateCustomConfig((prev: any) => ({
        ...prev,
        connectorLocalValidated: true,
        connectorLocalValidatedByProvider: {
          ...(prev.connectorLocalValidatedByProvider || {}),
          [selectedConnector]: true,
        },
        localContractValidatedAt: testedAt,
        localContractValidatedAtByProvider: {
          ...(prev.localContractValidatedAtByProvider || {}),
          [selectedConnector]: testedAt,
        },
        accountSourcesStepCompleted: false,
        accountSourcesStepCompletedByProvider: {
          ...(prev.accountSourcesStepCompletedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompletedAt: null,
        accountSourcesStepCompletedAtByProvider: {
          ...(prev.accountSourcesStepCompletedAtByProvider || {}),
          [selectedConnector]: null,
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível validar a conexão HubSpot.';
      setTestState('error', message, null);
      setConnectorLocalValidated(false);
      setAccountSourcesStepCompleted(false);
      updateCustomConfig((prev: any) => ({
        ...prev,
        connectorLocalValidated: false,
        connectorLocalValidatedByProvider: {
          ...(prev.connectorLocalValidatedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompleted: false,
        accountSourcesStepCompletedByProvider: {
          ...(prev.accountSourcesStepCompletedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompletedAt: null,
        accountSourcesStepCompletedAtByProvider: {
          ...(prev.accountSourcesStepCompletedAtByProvider || {}),
          [selectedConnector]: null,
        },
        localContractValidatedAt: null,
        localContractValidatedAtByProvider: {
          ...(prev.localContractValidatedAtByProvider || {}),
          [selectedConnector]: null,
        },
      }));
    } finally {
      setHubspotTesting(false);
    }
  }, [hubspotPrivateAppToken, selectedConnector, selectedInputMethod, setAccountSourcesStepCompleted, setConnectorLocalValidated, updateCustomConfig]);

  const testSalesforceConnection = React.useCallback(async () => {
    if (!selectedConnector || selectedConnector !== 'salesforce') return;

    const instanceUrl = normalizeSalesforceInstanceUrl(salesforceInstanceUrl);
    const token = salesforceAccessToken.trim();
    const now = new Date().toISOString();

    if (!instanceUrl || !token) {
      setSalesforceConnectionTestStatus('error');
      setSalesforceConnectionTestError('Informe a URL da instância Salesforce e o token temporário para testar a conexão.');
      setSalesforceConnectionTestMeta(null);
      setSalesforceTesting(false);
      setConnectorLocalValidated(false);
      setAccountSourcesStepCompleted(false);
      updateCustomConfig((prev: any) => ({
        ...prev,
        connectorLocalValidated: false,
        connectorLocalValidatedByProvider: {
          ...(prev.connectorLocalValidatedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompleted: false,
        accountSourcesStepCompletedByProvider: {
          ...(prev.accountSourcesStepCompletedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompletedAt: null,
        accountSourcesStepCompletedAtByProvider: {
          ...(prev.accountSourcesStepCompletedAtByProvider || {}),
          [selectedConnector]: null,
        },
        localContractValidatedAt: null,
        localContractValidatedAtByProvider: {
          ...(prev.localContractValidatedAtByProvider || {}),
          [selectedConnector]: null,
        },
      }));
      return;
    }

    setSalesforceTesting(true);
    setSalesforceConnectionTestStatus('testing');
    setSalesforceConnectionTestError(null);
    setSalesforceConnectionTestMeta(null);

    try {
      const response = await fetch('/api/account-connectors/salesforce/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceUrl, token, apiVersion: 'v60.0' }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
          status?: 'success' | 'error';
          provider?: string;
          testedAt?: string;
          instanceUrl?: string;
          apiVersion?: string;
          accountLabel?: string;
          accountFieldsCount?: number;
          readAccessConfirmed?: boolean;
          error?: string;
        }
        | null;

      if (!response.ok || payload?.status !== 'success') {
        const message = payload?.error || 'Não foi possível validar a conexão Salesforce.';
        setSalesforceConnectionTestStatus('error');
        setSalesforceConnectionTestError(message);
        setSalesforceConnectionTestMeta(null);
        setConnectorLocalValidated(false);
        setAccountSourcesStepCompleted(false);
        updateCustomConfig((prev: any) => ({
          ...prev,
          connectorLocalValidated: false,
          connectorLocalValidatedByProvider: {
            ...(prev.connectorLocalValidatedByProvider || {}),
            [selectedConnector]: false,
          },
          accountSourcesStepCompleted: false,
          accountSourcesStepCompletedByProvider: {
            ...(prev.accountSourcesStepCompletedByProvider || {}),
            [selectedConnector]: false,
          },
          accountSourcesStepCompletedAt: null,
          accountSourcesStepCompletedAtByProvider: {
            ...(prev.accountSourcesStepCompletedAtByProvider || {}),
            [selectedConnector]: null,
          },
          localContractValidatedAt: null,
          localContractValidatedAtByProvider: {
            ...(prev.localContractValidatedAtByProvider || {}),
            [selectedConnector]: null,
          },
        }));
        return;
      }

      const testedAt = payload?.testedAt || now;
      const meta: SalesforceConnectionTestMeta = {
        provider: 'salesforce',
        testedAt,
        instanceUrl: payload?.instanceUrl || instanceUrl,
        apiVersion: payload?.apiVersion || 'v60.0',
        accountLabel: payload?.accountLabel || 'Account',
        accountFieldsCount: typeof payload?.accountFieldsCount === 'number' ? payload.accountFieldsCount : 0,
        readAccessConfirmed: payload?.readAccessConfirmed === true,
      };

      setSalesforceConnectionTestStatus('success');
      setSalesforceConnectionTestError(null);
      setSalesforceConnectionTestMeta(meta);
      setConnectorLocalValidated(true);
      setAccountSourcesStepCompleted(false);

      updateCustomConfig((prev: any) => ({
        ...prev,
        connectorLocalValidated: true,
        connectorLocalValidatedByProvider: {
          ...(prev.connectorLocalValidatedByProvider || {}),
          [selectedConnector]: true,
        },
        localContractValidatedAt: testedAt,
        localContractValidatedAtByProvider: {
          ...(prev.localContractValidatedAtByProvider || {}),
          [selectedConnector]: testedAt,
        },
        accountSourcesStepCompleted: false,
        accountSourcesStepCompletedByProvider: {
          ...(prev.accountSourcesStepCompletedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompletedAt: null,
        accountSourcesStepCompletedAtByProvider: {
          ...(prev.accountSourcesStepCompletedAtByProvider || {}),
          [selectedConnector]: null,
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível validar a conexão Salesforce.';
      setSalesforceConnectionTestStatus('error');
      setSalesforceConnectionTestError(message);
      setSalesforceConnectionTestMeta(null);
      setConnectorLocalValidated(false);
      setAccountSourcesStepCompleted(false);
      updateCustomConfig((prev: any) => ({
        ...prev,
        connectorLocalValidated: false,
        connectorLocalValidatedByProvider: {
          ...(prev.connectorLocalValidatedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompleted: false,
        accountSourcesStepCompletedByProvider: {
          ...(prev.accountSourcesStepCompletedByProvider || {}),
          [selectedConnector]: false,
        },
        accountSourcesStepCompletedAt: null,
        accountSourcesStepCompletedAtByProvider: {
          ...(prev.accountSourcesStepCompletedAtByProvider || {}),
          [selectedConnector]: null,
        },
        localContractValidatedAt: null,
        localContractValidatedAtByProvider: {
          ...(prev.localContractValidatedAtByProvider || {}),
          [selectedConnector]: null,
        },
      }));
    } finally {
      setSalesforceTesting(false);
    }
  }, [
    salesforceAccessToken,
    salesforceInstanceUrl,
    selectedConnector,
    setAccountSourcesStepCompleted,
    setConnectorLocalValidated,
    updateCustomConfig,
  ]);

  const loadHubspotPreview = React.useCallback(async () => {
    if (!selectedConnector || selectedConnector !== 'hubspot' || selectedInputMethod !== 'private_app_token') return;
    if (hubspotConnectionTestStatus !== 'success') {
      setHubspotPreviewStatus('error');
      setHubspotPreviewError('Valide a conexão HubSpot antes de carregar o preview.');
      setHubspotPreviewCompanies([]);
      setHubspotPreviewLoadedAt(null);
      return;
    }

    const token = hubspotPrivateAppToken.trim();
    if (!token) {
      setHubspotPreviewStatus('error');
      setHubspotPreviewError('Informe o token da Private App para carregar o preview.');
      setHubspotPreviewCompanies([]);
      setHubspotPreviewLoadedAt(null);
      return;
    }

    setHubspotPreviewStatus('loading');
    setHubspotPreviewError(null);

    try {
      const response = await fetch('/api/account-connectors/hubspot/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ tokenKey: token }),
      });

      const payload = await response.json().catch(() => null) as
        | {
          status?: 'success' | 'error';
          provider?: string;
          loadedAt?: string;
          count?: number;
          companies?: HubspotCompanyPreview[];
          error?: string;
        }
        | null;

      if (!response.ok || payload?.status !== 'success') {
        const message = payload?.error || 'Não foi possível carregar o preview de companies.';
        setHubspotPreviewStatus('error');
        setHubspotPreviewError(message);
        setHubspotPreviewCompanies([]);
        setHubspotPreviewLoadedAt(null);
        return;
      }

      setHubspotPreviewCompanies(Array.isArray(payload?.companies) ? payload.companies.slice(0, 10) : []);
      setHubspotPreviewLoadedAt(payload?.loadedAt || new Date().toISOString());
      setHubspotPreviewStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar o preview de companies.';
      setHubspotPreviewStatus('error');
      setHubspotPreviewError(message);
      setHubspotPreviewCompanies([]);
      setHubspotPreviewLoadedAt(null);
    }
  }, [hubspotConnectionTestStatus, hubspotPrivateAppToken, selectedConnector, selectedInputMethod]);

  const loadHubspotSchema = React.useCallback(async () => {
    if (!selectedConnector || selectedConnector !== 'hubspot' || selectedInputMethod !== 'private_app_token') return;
    if (hubspotConnectionTestStatus !== 'success') {
      setHubspotSchemaStatus('error');
      setHubspotSchemaError('Valide a conexão HubSpot antes de detectar o schema de companies.');
      setHubspotSchemaProperties([]);
      setHubspotSchemaTotalCount(null);
      setHubspotSchemaLoadedAt(null);
      setHubspotSchemaSuggestedMappings([]);
      setHubspotMissingRecommendedFields([]);
      return;
    }

    const token = hubspotPrivateAppToken.trim();
    if (!token) {
      setHubspotSchemaStatus('error');
      setHubspotSchemaError('Informe o token da Private App para detectar o schema de companies.');
      setHubspotSchemaProperties([]);
      setHubspotSchemaTotalCount(null);
      setHubspotSchemaLoadedAt(null);
      setHubspotSchemaSuggestedMappings([]);
      setHubspotMissingRecommendedFields([]);
      return;
    }

    setHubspotSchemaStatus('loading');
    setHubspotSchemaError(null);

    try {
      const response = await fetch('/api/account-connectors/hubspot/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ tokenKey: token }),
      });

      const payload = await response.json().catch(() => null) as HubspotSchemaDiscoveryPayload | null;

      if (!response.ok || payload?.status !== 'success') {
        const message = payload?.error || 'Não foi possível detectar o schema de companies.';
        setHubspotSchemaStatus('error');
        setHubspotSchemaError(message);
        setHubspotSchemaProperties([]);
        setHubspotSchemaTotalCount(null);
        setHubspotSchemaLoadedAt(null);
        setHubspotSchemaSuggestedMappings([]);
        setHubspotMissingRecommendedFields([]);
        return;
      }

      setHubspotSchemaTotalCount(typeof payload?.count === 'number' ? payload.count : null);
      setHubspotSchemaProperties(Array.isArray(payload?.properties) ? payload.properties.slice(0, 200) : []);
      setHubspotSchemaLoadedAt(payload?.loadedAt || new Date().toISOString());
      setHubspotSchemaSuggestedMappings(Array.isArray(payload?.suggestedMappings) ? payload.suggestedMappings : []);
      setHubspotMissingRecommendedFields(Array.isArray(payload?.missingRecommendedFields) ? payload.missingRecommendedFields : []);
      setHubspotSchemaStatus('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível detectar o schema de companies.';
      setHubspotSchemaStatus('error');
      setHubspotSchemaError(message);
      setHubspotSchemaProperties([]);
      setHubspotSchemaTotalCount(null);
      setHubspotSchemaLoadedAt(null);
      setHubspotSchemaSuggestedMappings([]);
      setHubspotMissingRecommendedFields([]);
    }
  }, [hubspotConnectionTestStatus, hubspotPrivateAppToken, selectedConnector, selectedInputMethod]);

  const concludeLocalSetupFlow = React.useCallback(() => {
    if (!selectedConnector || !connectorLocalValidated || currentSourceCompleted) return;
    if (isCsvInput && csvUploadMeta?.validationResult?.isValid !== true) return;
    if (isHubspotMethodPending) return;
    completeLocalSetup();
  }, [completeLocalSetup, connectorLocalValidated, csvUploadMeta?.validationResult?.isValid, currentSourceCompleted, isCsvInput, isHubspotMethodPending, selectedConnector]);

  const hubspotConnectionTestMeta = selectedConnector ? connectionTestMetaByProvider[selectedConnector] ?? null : null;
  const hubspotConnectionTestError = selectedConnector ? connectionTestErrorByProvider[selectedConnector] ?? null : null;
  const hubspotLastConnectionTestAt = selectedConnector ? lastConnectionTestAtByProvider[selectedConnector] ?? null : null;
  const hubspotSessionState = React.useMemo<HubspotSessionState>(() => {
    if (selectedConnector !== 'hubspot' || selectedInputMethod !== 'private_app_token') {
      return 'clean';
    }
    if (hubspotConnectionTestStatus === 'testing') return 'testing';
    if (hubspotConnectionTestStatus === 'error') return 'error';
    if (hubspotConnectionTestStatus === 'success') {
      if (hubspotPreviewStatus === 'success' || hubspotSchemaStatus === 'success' || hubspotConnectionStepCompleted) {
        return 'validated';
      }
      return 'incomplete';
    }
    if (hubspotPreviewStatus !== 'idle' || hubspotSchemaStatus !== 'idle' || hubspotConnectionStepCompleted) {
      return 'incomplete';
    }
    return 'clean';
  }, [
    hubspotConnectionStepCompleted,
    hubspotConnectionTestStatus,
    hubspotPreviewStatus,
    hubspotSchemaStatus,
    selectedConnector,
    selectedInputMethod,
  ]);

  const sourceAction = React.useMemo<WorkflowAction>(() => {
    if (!selectedConnector) {
      return {
        title: 'Escolha uma fonte para iniciar o setup local.',
        description: 'A primeira ação é selecionar Salesforce, HubSpot, RD Station ou Outro CRM.',
        buttonLabel: 'Selecionar fonte',
        tone: 'neutral' as const,
        disabled: true,
        reason: 'Sem fonte selecionada ainda.',
      };
    }

    if (isHubspotMethodPending) {
      return {
        title: 'Escolha o método de entrada para continuar.',
        description: 'HubSpot precisa de um método explícito: CSV local ou Private App / API Token.',
        buttonLabel: 'Método pendente',
        tone: 'info' as const,
        disabled: true,
        reason: 'Selecione CSV local ou Private App / API Token no bloco acima.',
      };
    }

    if (isCsvInput && csvProcessingState?.phase === 'error') {
      return {
        title: 'Não foi possível concluir a leitura do CSV.',
        description: csvProcessingState.message,
        buttonLabel: 'Selecionar CSV novamente',
        tone: 'danger' as const,
        onClick: openCsvPicker,
        disabled: false,
        reason: 'Selecione o arquivo outra vez para tentar uma nova leitura.',
      };
    }

    if (isCsvInput && !csvUploadMeta) {
      return {
        title: 'Envie o CSV para esta fonte.',
        description: 'O arquivo é lido apenas no navegador. Nada é enviado para backend nesta etapa.',
        buttonLabel: 'Selecionar CSV',
        tone: 'info' as const,
        disabled: true,
      };
    }

    if (isCsvInput && csvUploadMeta?.validationResult?.isValid === false) {
      return {
        title: 'Corrija o arquivo CSV antes de continuar.',
        description: 'O preview existe, mas o arquivo ainda não atende aos requisitos mínimos para uso local.',
        buttonLabel: 'Selecionar CSV',
        tone: 'danger' as const,
        disabled: true,
        reason: 'Arquivo CSV inválido ou incompleto nesta sessão.',
      };
    }

    if (selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token') {
      if (hubspotConnectionTestStatus === 'testing') {
        return {
          title: 'Testando a conexão HubSpot.',
          description: 'A Canopi está validando o token da Private App no servidor.',
          buttonLabel: 'Teste em andamento',
          tone: 'info' as const,
          disabled: true,
        };
      }

      return {
        title: hubspotPrivateAppToken.trim()
          ? 'Teste a conexão HubSpot para validar o acesso real.'
          : 'Informe um token de Private App para testar a conexão HubSpot.',
        description: 'O teste acontece no servidor. O token não é salvo e não aparece depois do envio.',
        buttonLabel: hubspotTesting ? 'Testando...' : 'Testar conexão HubSpot',
        tone: hubspotConnectionTestStatus === 'error' ? 'danger' as const : 'warning' as const,
        onClick: testHubspotConnection,
        disabled: hubspotTesting || !hubspotPrivateAppToken.trim(),
        reason: hubspotConnectionTestError || undefined,
      };
    }

    if (selectedConnector === 'salesforce') {
      if (salesforceTesting) {
        return {
          title: 'Testando a conexão Salesforce.',
          description: 'A Canopi está validando a URL da instância e o token temporário no servidor.',
          buttonLabel: 'Teste em andamento',
          tone: 'info' as const,
          disabled: true,
        };
      }

      return {
        title: salesforceInstanceUrl.trim() && salesforceAccessToken.trim()
          ? 'Teste a conexão Salesforce para validar o acesso real mínimo.'
          : 'Informe a URL da instância e o token temporário para testar a conexão Salesforce.',
        description: 'O teste acontece no servidor em modo read-only. Nada é salvo, sincronizado ou escrito no CRM.',
        buttonLabel: salesforceConnectionTestStatus === 'success' ? 'Testar novamente' : 'Testar conexão Salesforce',
        tone: salesforceConnectionTestStatus === 'error' ? 'danger' as const : 'warning' as const,
        onClick: testSalesforceConnection,
        disabled: !salesforceInstanceUrl.trim() || !salesforceAccessToken.trim(),
        reason: salesforceConnectionTestError || undefined,
      };
    }

    if (hasDraftChanges) {
      return {
        title: 'Você tem alterações locais não salvas.',
        description: 'Salve a configuração desta fonte para registrar a versão atual nesta sessão.',
        buttonLabel: 'Salvar configuração',
        tone: 'warning' as const,
        onClick: saveLocalConfig,
        disabled: false,
      };
    }

    if (!connectorLocalValidated) {
      return {
        title: isCsvInput
          ? 'Configuração salva. Agora confirme o uso deste CSV.'
          : 'Configuração salva. Agora revise a entrada desta fonte.',
        description: isCsvInput
          ? 'Isso confirma que o arquivo e os campos escolhidos estão prontos para uso local na Canopi.'
          : 'A validação é local e libera a conclusão quando a fonte estiver consistente.',
        buttonLabel: isCsvInput ? 'Confirmar CSV' : 'Confirmar uso',
        tone: 'info' as const,
        onClick: validateLocalContract,
        disabled: false,
      };
    }

    if (!currentSourceCompleted) {
      return {
        title: isCsvInput
          ? 'CSV confirmado para uso local.'
          : (isHubspotApiInput ? 'Conexão HubSpot validada nesta sessão.' : 'Fonte confirmada para uso local.'),
        description: 'A próxima ação é registrar a etapa desta fonte nesta sessão.',
        buttonLabel: isCsvInput || isHubspotApiInput ? 'Concluir configuração' : 'Concluir etapa local',
        tone: 'success' as const,
        onClick: concludeLocalSetupFlow,
        disabled: false,
      };
    }

    return {
      title: isCsvInput
        ? 'Configuração concluída.'
        : (isHubspotApiInput ? 'Conexão HubSpot validada nesta sessão e etapa registrada.' : 'Etapa local registrada.'),
      description: 'O setup local desta fonte já foi concluído nesta sessão.',
      buttonLabel: isCsvInput || isHubspotApiInput ? 'Configuração concluída' : 'Etapa local registrada',
      tone: 'success' as const,
      disabled: true,
    };
  }, [
    currentSourceCompleted,
    connectorLocalValidated,
    csvUploadMeta,
    csvProcessingState,
    hasDraftChanges,
    openCsvPicker,
    saveLocalConfig,
    selectedConnector,
    selectedInputMethod,
    concludeLocalSetupFlow,
    validateLocalContract,
    isCsvInput,
    isHubspotMethodPending,
    hubspotPrivateAppToken,
    hubspotConnectionTestError,
    hubspotConnectionTestStatus,
    hubspotTesting,
    isHubspotApiInput,
    testHubspotConnection,
    salesforceAccessToken,
    salesforceConnectionTestError,
    salesforceConnectionTestStatus,
    salesforceInstanceUrl,
    salesforceTesting,
    testSalesforceConnection,
  ]);

  const lastSavedAt = formatActionTimestamp(customConfig.localSourceSavedAt ?? null);
  const lastValidatedAt = formatActionTimestamp(customConfig.localContractValidatedAt ?? null);
  const hubspotConnectionStepCompletedAt = formatActionTimestamp(customConfig.hubspotConnectionStepCompletedAt ?? null);
  const stepCompletedAt = isHubspotApiInput ? hubspotConnectionStepCompletedAt : formatActionTimestamp(customConfig.accountSourcesStepCompletedAt ?? null);

  const csvFlowState = React.useMemo<CsvFlowState>(() => {
    if (!selectedConnector || !isCsvInput) return 'no-file';
    if (!csvUploadMeta) return 'no-file';
    if (csvUploadMeta.validationResult?.isValid === false) return 'invalid';
    if (accountSourcesStepCompleted) return 'completed';
    if (connectorLocalValidated) return 'confirmed';
    if (hasDraftChanges) return 'dirty';
    return 'saved';
  }, [accountSourcesStepCompleted, connectorLocalValidated, csvUploadMeta, hasDraftChanges, isCsvInput, selectedConnector]);

  const csvStatusLabel = React.useMemo(() => {
    if (csvProcessingState?.phase === 'error') return 'Erro';
    if (isCsvParsing) return 'Processando';
    switch (csvFlowState) {
      case 'no-file':
      case 'invalid':
      case 'dirty':
        return 'Pendente';
      case 'saved':
        return 'Configuração salva';
      case 'confirmed':
        return 'CSV confirmado';
      case 'completed':
        return 'Concluído';
    }
  }, [csvFlowState, csvProcessingState?.phase, isCsvParsing]);

  const csvRowCountLabel = csvUploadMeta ? csvUploadMeta.rowCount.toLocaleString('pt-BR') : '—';
  const csvPreviewRows = csvUploadMeta?.previewRows ?? [];
  const csvHeaders = csvUploadMeta?.headers ?? [];
  const csvHasPreviewRows = csvPreviewRows.length > 0;
  const csvValidationErrors = csvUploadMeta?.validationResult?.errors ?? [];
  const csvSchemaAnalysis: CsvSchemaAnalysis | null = csvUploadMeta?.schemaAnalysis ?? null;
  const csvHasValidationErrors = csvValidationErrors.length > 0;
  const csvProcessingErrorMessage = csvProcessingState?.phase === 'error' ? csvProcessingState.message : null;
  const csvPrimaryAction = sourceAction;
  const csvDraft = draftConfig as LocalSourceConfig;

  React.useEffect(() => {
    registerLocalSourceSaveHandler(saveLocalConfig);
    return () => registerLocalSourceSaveHandler(null);
  }, [registerLocalSourceSaveHandler, saveLocalConfig]);

  return (
    <section id="fontes" className="space-y-8">
      <header className="space-y-3">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">2. Fontes e Conectores</h2>
        <p className="text-base text-slate-500 max-w-3xl font-medium">
          Esta etapa define a origem da base de contas e o contrato local de leitura.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Setup local/simulado da fonte para o mapeamento canônico.
        </div>
      </header>

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Escolha a origem das contas</h3>
        <p className="max-w-3xl text-sm font-medium text-slate-500">
          Cada opção expõe claramente sua camada de produto nesta versão.
        </p>

        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {connectorTypes.map((type) => {
            const preset = CONNECTOR_PRESETS[type];
            const adapter = getAccountConnectorAdapterSafe(type)!;
            const isActive = conta.connectorType === type;
            return (
              <Card
                key={type}
                className={`border-2 p-0 transition-all ${isActive ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Selecionar ${preset.name} como fonte local`}
                  onClick={() => setConnector(type)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setConnector(type);
                    }
                  }}
                  className="flex h-full flex-col p-4 cursor-pointer outline-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-blue-600' : 'bg-slate-100'}`}>
                        <ConnectorLogo type={type} isActive={isActive} />
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase tracking-tight text-slate-900">{preset.name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">{getIntegrationLabel(type)}</p>
                      </div>
                    </div>
                    {isActive ? (
                        <span className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase bg-blue-100 text-blue-700">
                        Fonte selecionada
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConnector(type)}
                        className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase bg-slate-900 text-white transition-all hover:bg-slate-700"
                      >
                        Usar esta fonte
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge className={`border-none text-[8px] font-black ${preset.identity.confidenceScore > 90 ? 'bg-emerald-100 text-emerald-700' : preset.identity.confidenceScore > 75 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      Confiança: {preset.identity.confidenceScore}%
                    </Badge>
                    <Badge className={`border-none text-[8px] font-black ${getConnectorSurfaceTone(adapter.surfaceKind) === 'success' ? 'bg-emerald-100 text-emerald-700' : getConnectorSurfaceTone(adapter.surfaceKind) === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {getConnectorSurfaceLabel(adapter.surfaceKind)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[9px] font-bold text-slate-400">{getIngestMethod(type)}</p>

                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">Entidade nativa</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-700">{preset.nativeObject || 'A definir no setup'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-400">Chave primária</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-700">{preset.identity.nativePrimaryKey || 'A definir'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border border-slate-200 p-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-3">Fonte selecionada</h4>
        {!selectedConnector && legacySelectedConnector && (
          <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            A fonte salva anteriormente não é compatível com o modelo atual. Selecione uma fonte novamente.
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
            <p className="mt-1 text-sm font-black text-slate-900">{draftConfig?.sourceName || 'Não configurada'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entrada</p>
            <p className="mt-1 text-sm font-black text-slate-900">{getInputMethodLabel(selectedConnector, selectedInputMethod)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Arquivo</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {isCsvInput ? (csvUploadMeta?.fileName || 'Nenhum arquivo enviado') : 'Não aplicável neste método'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Linhas</p>
            <p className="mt-1 text-sm font-black text-slate-900">{isCsvInput ? csvRowCountLabel : '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Status</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {isHubspotMethodPending
                ? 'Método pendente'
                : (isHubspotApiInput
                  ? getHubspotTestLabel(hubspotConnectionTestStatus)
                  : isCsvInput
                    ? csvStatusLabel
                    : (connectorLocalValidated
                      ? 'Validada nesta sessão'
                      : hasDraftChanges
                        ? 'Rascunho local'
                        : 'Pronta para validar'))}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Camada do conector</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {!selectedConnector
                ? 'Não configurada'
                : isHubspotMethodPending
                  ? 'Aguardando método'
                  : getConnectorSurfaceLabel(realConnectionContract?.surfaceKind || activeAdapter?.surfaceKind || 'functional_real')}
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-500">
              {!selectedConnector
                ? 'Auth: —'
                : realConnectionContract
                  ? `Auth: ${getAuthTypeLabel(realConnectionContract.authType)}`
                  : activeAdapter
                    ? `Auth: ${getAuthTypeLabel(activeAdapter.authType)}`
                    : 'Auth: —'}
            </p>
          </div>
        </div>
        {realConnectionContract && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-none bg-white text-[8px] font-black text-slate-700">
                {getConnectorSurfaceLabel(realConnectionContract.surfaceKind)}
              </Badge>
              <Badge className="border-none bg-white text-[8px] font-black text-slate-700">
                {getAuthTypeLabel(realConnectionContract.authType)}
              </Badge>
              <Badge className="border-none bg-white text-[8px] font-black text-slate-700">
                Metadados: {getMetadataStatusLabel(realConnectionContract.metadataStatus)}
              </Badge>
              <Badge className="border-none bg-white text-[8px] font-black text-slate-700">
                Sync: {getSyncStatusLabel(realConnectionContract.syncStatus)}
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Capacidades</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {realConnectionContract.supportsMetadataDiscovery ? 'Descoberta de metadados' : 'Sem descoberta de metadados'}
                </p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  {realConnectionContract.supportsIncrementalSync ? 'Sync incremental não disponível nesta versão' : 'Sem sync incremental'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Escopos</p>
                <p className="mt-1 text-sm font-black text-slate-900">{realConnectionContract.requiredScopes.length}</p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  Obrigatórios: {realConnectionContract.requiredScopes.length} · Opcionais: {realConnectionContract.optionalScopes.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Cobertura</p>
                <p className="mt-1 text-sm font-black text-slate-900">{realConnectionContract.coverage}%</p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">Confiança operacional {realConnectionContract.dataConfidence}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Estado desta versão</p>
                <p className="mt-1 text-sm font-black text-slate-900">{realConnectionContract.nextRecommendedStep || 'Disponível nesta versão'}</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setConnector(null)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50"
          >
            Trocar fonte
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            {selectedConnector ? `Fonte: ${activePreset?.name || '—'}` : 'Nenhuma fonte selecionada'}
          </span>
        </div>
      </Card>

      {selectedConnector && activePreset && selectedConnector === 'hubspot' && (
        <Card className="border border-slate-200 p-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Como deseja configurar o HubSpot?</p>
            <h4 className="text-2xl font-black tracking-tight text-slate-900">Escolha um método de entrada</h4>
            <p className="max-w-3xl text-sm font-medium text-slate-600">
              Selecione CSV local para importar um arquivo exportado ou Private App / API Token para testar a conexão real no servidor.
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputMethodForSelectedConnector('csv_upload')}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isCsvInput
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Usar CSV local</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Importe um CSV exportado do HubSpot. Não conecta com a API.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setInputMethodForSelectedConnector('private_app_token')}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isHubspotApiInput
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-700">Conectar HubSpot via Private App</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Teste uma conexão real usando token temporário. Não inicia sync.
              </p>
            </button>
          </div>
        </Card>
      )}

      {selectedConnector && activePreset && draftConfig && isCsvInput && !isHubspotMethodPending && (
        <Card className="relative overflow-hidden border border-slate-200 p-5 min-h-[680px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Método de entrada</p>
              <h4 className="text-2xl font-black tracking-tight text-slate-900">Importar via CSV para esta fonte</h4>
              <p className="text-sm font-medium text-slate-600 max-w-3xl">
                A Canopi vai ler o arquivo apenas no navegador. Nada será enviado para backend nesta etapa.
              </p>
            </div>
            <button
              type="button"
              onClick={openCsvPicker}
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-700"
            >
              Selecionar CSV
            </button>
          </div>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                void processCsvFile(file);
              }
              e.currentTarget.value = '';
            }}
          />

          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
              <p className="mt-1 text-sm font-black text-slate-900">{activePreset?.name || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entrada</p>
              <p className="mt-1 text-sm font-black text-slate-900">CSV</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Arquivo</p>
              <p className="mt-1 text-sm font-black text-slate-900">{csvUploadMeta?.fileName || 'Nenhum arquivo enviado'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Status</p>
              <p className="mt-1 text-sm font-black text-slate-900">{csvStatusLabel}</p>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Conexão real</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {selectedConnector === 'salesforce'
                ? (salesforceConnectionTestStatus === 'success'
                  ? 'Teste mínimo validado nesta sessão'
                  : salesforceConnectionTestStatus === 'testing'
                    ? 'Teste em andamento'
                    : 'Teste real mínimo disponível')
                : selectedConnector === 'hubspot'
                  ? 'Conexão real disponível no fluxo abaixo'
                  : 'Não implementada'}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {selectedConnector === 'salesforce'
                ? 'Leitura segura no servidor com token temporário e URL da instância.'
                : 'Sem sync, sem importação e sem writeback.'}
            </p>
          </div>

          <div className="mt-4 min-h-[360px] space-y-4">
            {!csvUploadMeta && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs font-medium text-slate-400">
                Nenhum arquivo selecionado
              </div>
            )}

            {csvUploadMeta && (
              <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Preview do arquivo</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Confira as primeiras linhas antes de salvar a configuração.</p>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Campo de nome da conta" value={csvDraft.csvRequiredMinimumField} onChange={(v) => updateDraft('csvRequiredMinimumField', v)} placeholder="account_name" />
                <Field label="Campo de domínio/dedupe" value={csvDraft.csvDedupeKey} onChange={(v) => updateDraft('csvDedupeKey', v)} placeholder="domain" />
                <Field label="Separador" value={csvDraft.csvDelimiter} onChange={(v) => updateDraft('csvDelimiter', v)} placeholder="," />
                <Field label="Encoding" value={csvDraft.csvEncoding} onChange={(v) => updateDraft('csvEncoding', v)} placeholder="UTF-8" />
              </div>

              {csvHasPreviewRows && (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <p className="px-3 pt-3 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Preview
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-50">
                        <tr>
                          {csvHeaders.map((h) => (
                            <th key={h} className="px-2.5 py-1.5 text-left font-black uppercase tracking-wide text-slate-500 whitespace-nowrap border-b border-slate-100">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreviewRows.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            {csvHeaders.map((h) => (
                              <td key={h} className="px-2.5 py-1.5 font-medium text-slate-700 whitespace-nowrap max-w-[160px] truncate" title={row[h]}>
                                {row[h] || <span className="text-slate-300">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {csvHasValidationErrors && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-red-600">Avisos importantes</p>
                  {csvValidationErrors.map((err) => (
                    <div key={err.code} className="flex items-start gap-2 text-xs font-medium text-red-800">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {csvSchemaAnalysis && (
                <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <CsvSchemaAnalysisIntro
                      pills={[
                        'Read-only',
                        'Pré-mapeamento local',
                        'Sem sync',
                        'Sem importação',
                        'Não aplica Camada Canônica',
                      ]}
                      sectionLabel="Schema local e pré-mapeamento CSV"
                      title="Analise os headers detectados e a qualidade mínima da base"
                      description="Análise local dos headers do arquivo. Não aplica Camada Canônica, não importa dados e não cria mapeamento definitivo."
                    />
                    <div className="flex shrink-0 flex-col gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        getCsvSchemaTone(csvSchemaAnalysis.qualityLevel) === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : getCsvSchemaTone(csvSchemaAnalysis.qualityLevel) === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        Qualidade {getCsvSchemaQualityLabel(csvSchemaAnalysis.qualityLevel)}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        getCsvSchemaTone(csvSchemaAnalysis.mappingConfidence) === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : getCsvSchemaTone(csvSchemaAnalysis.mappingConfidence) === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        Confiança {getCsvSchemaQualityLabel(csvSchemaAnalysis.mappingConfidence)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Headers detectados</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{csvSchemaAnalysis.totalHeaders.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Campos recomendados encontrados</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{csvSchemaAnalysis.detectedRecommendedFields.length.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Campos recomendados ausentes</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{csvSchemaAnalysis.missingRecommendedFields.length.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Confiança do pré-mapeamento</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{getCsvSchemaQualityLabel(csvSchemaAnalysis.mappingConfidence)}</p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-white p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Qualidade da base</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{csvSchemaAnalysis.qualityScore}/100</p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
                      <div className="border-b border-violet-50 bg-violet-50/60 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Pré-mapeamento sugerido</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              <th className="px-4 py-3">Campo CSV</th>
                              <th className="px-4 py-3">Campo sugerido Canopi</th>
                              <th className="px-4 py-3">Confiança</th>
                              <th className="px-4 py-3">Motivo</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {csvSchemaAnalysis.suggestedMappings.map((mapping) => (
                              <tr key={`${mapping.canopiField}-${mapping.csvField || 'missing'}`} className="text-sm text-slate-700">
                                <td className="px-4 py-3 font-semibold text-slate-900">{mapping.csvField || '—'}</td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900">{mapping.canopiField}</div>
                                  <div className="text-xs text-slate-500">{mapping.canopiLabel}</div>
                                </td>
                                <td className="px-4 py-3 capitalize">{getCsvSchemaQualityLabel(mapping.confidence)}</td>
                                <td className="px-4 py-3 text-slate-600">{mapping.reason}</td>
                                <td className="px-4 py-3">
                                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                                    mapping.status === 'encontrado'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {mapping.status === 'encontrado' ? 'Encontrado' : 'Ausente'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-violet-100 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Campos ausentes</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">Campos recomendados que ainda não apareceram no schema detectado.</p>
                        <div className="mt-3 space-y-2">
                          {csvSchemaAnalysis.missingRecommendedFields.length > 0 ? csvSchemaAnalysis.missingRecommendedFields.map((mapping) => (
                            <div key={`${mapping.canopiField}-missing`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <p className="text-sm font-black text-slate-900">{mapping.canopiField}</p>
                              <p className="text-xs text-slate-600">{mapping.canopiLabel}</p>
                            </div>
                          )) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                              <p className="text-sm font-black text-emerald-800">Nenhuma lacuna nas recomendações iniciais.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-violet-100 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Avisos de qualidade</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">Leitura local da qualidade da base e do dedupe.</p>
                        <div className="mt-3 space-y-2">
                          {csvSchemaAnalysis.warnings.length > 0 ? csvSchemaAnalysis.warnings.map((warning) => (
                            <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                              <p className="text-xs font-medium text-amber-800">{warning}</p>
                            </div>
                          )) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                              <p className="text-sm font-black text-slate-800">Nenhum aviso relevante detectado.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-violet-100 bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Campos extras</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">Headers presentes no arquivo, mas não usados no pré-mapeamento local.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {csvSchemaAnalysis.extraHeaders.length > 0 ? csvSchemaAnalysis.extraHeaders.map((header) => (
                            <span key={header} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                              {header}
                            </span>
                          )) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                              Nenhum campo extra relevante
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

          {isCsvParsing && csvProcessingState && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 px-4 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Processando CSV no navegador</p>
                    <h5 className="text-2xl font-black tracking-tight text-slate-900">{csvProcessingState.fileName}</h5>
                    <p className="text-sm font-medium text-slate-600">{csvProcessingState.message}</p>
                  </div>
                  <Badge className="border-none bg-slate-100 text-[10px] font-black text-slate-700">
                    {csvProcessingState.phase}
                  </Badge>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    <span>Progresso real</span>
                    <span>{csvProcessingState.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, csvProcessingState.percent))}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {csvProcessingState.processedRows > 0
                      ? `${csvProcessingState.processedRows.toLocaleString('pt-BR')} de ${Math.max(csvProcessingState.totalRows, csvProcessingState.processedRows).toLocaleString('pt-BR')} linha(s) processadas`
                      : 'Aguardando leitura e parsing do arquivo.'}
                  </p>
                </div>
              </div>
            </div>
	          )}
	        </div>
      </Card>
    )}

      {selectedConnector && activePreset && draftConfig && selectedConnector === 'salesforce' && (
        <Card className="relative overflow-hidden border border-slate-200 bg-slate-50/70 p-5 min-h-[520px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Método de entrada</p>
              <h4 className="text-2xl font-black tracking-tight text-slate-900">Teste com token temporário do Salesforce</h4>
              <p className="text-sm font-medium text-slate-600 max-w-3xl">
                A Canopi valida um token temporário e a URL da instância no servidor, sem salvar o segredo, sem sync e sem writeback.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                Read-only
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                Token temporário
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                Sem sync
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                Sem writeback
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
              <p className="mt-1 text-sm font-black text-slate-900">{activePreset?.name || 'Salesforce'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entrada</p>
              <p className="mt-1 text-sm font-black text-slate-900">Validação com token temporário</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Leitura segura do Salesforce via token temporário e URL da instância.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Instância</p>
              <p className="mt-1 text-sm font-black text-slate-900">{salesforceInstanceUrl || 'Nenhuma URL informada'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Status</p>
              <p className="mt-1 text-sm font-black text-slate-900">{getHubspotTestLabel(salesforceConnectionTestStatus)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="URL da instância Salesforce"
                  value={salesforceInstanceUrl}
                  onChange={setSalesforceInstanceUrl}
                  placeholder="https://sua-instancia.my.salesforce.com"
                />
                <Field
                  label="Token temporário"
                  value={salesforceAccessToken}
                  onChange={setSalesforceAccessToken}
                  placeholder="00D...!"
                  type="password"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void testSalesforceConnection()}
                  disabled={salesforceTesting || !salesforceInstanceUrl.trim() || !salesforceAccessToken.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                >
                  {salesforceTesting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testando acesso com token
                    </span>
                  ) : (
                    'Testar acesso com token'
                  )}
                </button>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" />
                    Token não persistido
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  salesforceConnectionTestStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : salesforceConnectionTestStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {getHubspotTestLabel(salesforceConnectionTestStatus)}
                </span>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${
              salesforceConnectionTestStatus === 'success'
                ? 'border-emerald-200 bg-emerald-50'
                : salesforceConnectionTestStatus === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-200 bg-white'
            }`}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Resultado seguro</p>
              {salesforceConnectionTestStatus === 'success' && salesforceConnectionTestMeta ? (
                <div className="mt-2 space-y-3">
                  <p className="inline-flex items-center gap-2 text-base font-black text-emerald-800">
                    <ShieldCheck className="h-4 w-4" />
                    Validação Salesforce concluída nesta sessão.
                  </p>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-black">Instância:</span> {salesforceConnectionTestMeta.instanceUrl}</p>
                    <p><span className="font-black">Objeto lido:</span> {salesforceConnectionTestMeta.accountLabel}</p>
                    <p><span className="font-black">Campos detectados:</span> {salesforceConnectionTestMeta.accountFieldsCount.toLocaleString('pt-BR')}</p>
                    <p><span className="font-black">Versão da API:</span> {salesforceConnectionTestMeta.apiVersion}</p>
                    <p><span className="font-black">Leitura mínima:</span> {salesforceConnectionTestMeta.readAccessConfirmed ? 'Confirmada' : 'Não confirmada'}</p>
                    <p className="text-xs font-medium text-slate-500">
                      Teste em {formatActionTimestamp(salesforceConnectionTestMeta.testedAt)}. O token permanece apenas em memória nesta sessão para permitir a validação read-only.
                    </p>
                  </div>
                </div>
              ) : salesforceConnectionTestStatus === 'error' ? (
                <div className="mt-2 space-y-2">
                  <p className="text-base font-black text-red-800">Não foi possível validar o acesso Salesforce.</p>
                  <p className="text-sm text-red-700">{salesforceConnectionTestError || 'Revise a URL da instância e o token temporário.'}</p>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-base font-black text-slate-900">Aguardando teste com token temporário nesta sessão.</p>
                  <p className="text-sm text-slate-600">
                    O servidor ainda não validou a URL da instância e o token temporário. Após o teste, apenas metadados seguros permanecem na sessão.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {selectedConnector && activePreset && draftConfig && isHubspotApiInput && !isHubspotMethodPending && (
        <Card className="relative overflow-hidden border border-blue-200 bg-blue-50/40 p-5 min-h-[540px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500">Método de entrada</p>
              <h4 className="text-2xl font-black tracking-tight text-slate-900">Testar conexão real do HubSpot</h4>
              <p className="text-sm font-medium text-slate-600 max-w-3xl">
                A Canopi valida o token da Private App no servidor, sem salvar o segredo e sem iniciar sync real.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                Conexão real C2.1
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Token temporário
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
              <p className="mt-1 text-sm font-black text-slate-900">{activePreset?.name || 'HubSpot'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entrada</p>
              <p className="mt-1 text-sm font-black text-slate-900">HubSpot real</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Método Private App retomado desta sessão. Use o reset para voltar à escolha do método HubSpot.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Último teste</p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {hubspotLastConnectionTestAt ? formatActionTimestamp(hubspotLastConnectionTestAt) : 'Nenhum teste realizado'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Status</p>
              <p className="mt-1 text-sm font-black text-slate-900">{getHubspotTestLabel(hubspotConnectionTestStatus)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Field
                  label="Token da Private App"
                  value={hubspotPrivateAppToken}
                  onChange={setHubspotPrivateAppToken}
                  placeholder="pat-nao-compartilhe-este-token"
                  type="password"
                />
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Orientação</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Informe um token temporário apenas para testar a leitura de companies. O token não é salvo em sessionStorage nem localStorage.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void testHubspotConnection()}
                  disabled={hubspotTesting || !hubspotPrivateAppToken.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                >
                  {hubspotTesting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testando conexão HubSpot
                    </span>
                  ) : (
                    'Testar conexão HubSpot'
                  )}
                </button>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" />
                    Token não persistido
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  hubspotConnectionTestStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : hubspotConnectionTestStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {getHubspotTestLabel(hubspotConnectionTestStatus)}
                </span>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 ${hubspotConnectionTestStatus === 'success' ? 'border-emerald-200 bg-emerald-50' : hubspotConnectionTestStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Resultado seguro</p>
              {hubspotConnectionTestStatus === 'success' && hubspotConnectionTestMeta ? (
                <div className="mt-2 space-y-3">
                  <p className="inline-flex items-center gap-2 text-base font-black text-emerald-800">
                    <ShieldCheck className="h-4 w-4" />
                    Conexão HubSpot validada nesta sessão.
                  </p>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p><span className="font-black">Hub ID:</span> {hubspotConnectionTestMeta.hubId || 'Não retornado'}</p>
                    <p><span className="font-black">Leitura mínima:</span> {hubspotConnectionTestMeta.readAccessConfirmed ? 'Confirmada' : 'Não confirmada'}</p>
                    <div className="flex flex-wrap gap-2">
                      {hubspotConnectionTestMeta.scopes.length > 0 ? (
                        hubspotConnectionTestMeta.scopes.map((scope) => (
                          <span key={scope} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            {scope}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Escopos não retornados
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      Teste em {formatActionTimestamp(hubspotConnectionTestMeta.testedAt)}. O token permanece apenas em memória nesta sessão para permitir o preview read-only.
                    </p>
                  </div>
                </div>
              ) : hubspotConnectionTestStatus === 'error' ? (
                <div className="mt-2 space-y-2">
                  <p className="text-base font-black text-red-800">Não foi possível validar a conexão HubSpot.</p>
                  <p className="text-sm text-red-700">{hubspotConnectionTestError || 'Revise o token e tente novamente.'}</p>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-base font-black text-slate-900">Aguardando teste real nesta sessão.</p>
                  <p className="text-sm text-slate-600">
                    O servidor ainda não validou o token. Após o teste, apenas metadados seguros permanecem na sessão.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${getHubspotSessionStateTone(hubspotSessionState) === 'success'
            ? 'border-emerald-200 bg-emerald-50'
            : getHubspotSessionStateTone(hubspotSessionState) === 'warning'
              ? 'border-amber-200 bg-amber-50'
              : getHubspotSessionStateTone(hubspotSessionState) === 'danger'
                ? 'border-red-200 bg-red-50'
                : getHubspotSessionStateTone(hubspotSessionState) === 'info'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white'
          }`}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Sessão HubSpot</p>
                <h5 className="text-lg font-black tracking-tight text-slate-900">{getHubspotSessionStateLabel(hubspotSessionState)}</h5>
                <p className="max-w-3xl text-sm font-medium text-slate-600">
                  Este é um reset completo da sessão HubSpot nesta tela. Ele remove o token temporário, o teste, o preview, o schema e a escolha do método, voltando o fluxo ao início. Nada é alterado no CRM externo.
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Use quando quiser descartar esta sessão temporária e recomeçar a configuração HubSpot.
                </p>
              </div>
              <button
                type="button"
                onClick={resetHubspotSession}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50"
              >
                Resetar sessão HubSpot
              </button>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Estado</p>
                <p className="mt-1 text-sm font-black text-slate-900">{getHubspotSessionStateLabel(hubspotSessionState)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Último teste</p>
                <p className="mt-1 text-sm font-black text-slate-900">{hubspotLastConnectionTestAt ? formatActionTimestamp(hubspotLastConnectionTestAt) : 'Nenhum teste nesta sessão'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Preview</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {hubspotPreviewStatus === 'success'
                    ? `Carregado (${hubspotPreviewCompanies.length.toLocaleString('pt-BR')})`
                    : hubspotPreviewStatus === 'loading'
                      ? 'Carregando'
                      : hubspotPreviewStatus === 'error'
                        ? 'Erro'
                        : 'Não carregado'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Schema</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {hubspotSchemaStatus === 'success'
                    ? `Detectado (${(hubspotSchemaTotalCount ?? hubspotSchemaProperties.length).toLocaleString('pt-BR')})`
                    : hubspotSchemaStatus === 'loading'
                      ? 'Detectando'
                      : hubspotSchemaStatus === 'error'
                        ? 'Erro'
                        : 'Não detectado'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedConnector && activePreset && draftConfig && isHubspotApiInput && hubspotConnectionTestStatus === 'success' && (
        <Card className="border border-sky-200 bg-sky-50/60 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">Read-only</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">Sem sync</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">Sem importação</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">Token não persistido</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">Amostra até 10 companies</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-600">Preview read-only do HubSpot</p>
              <h4 className="text-xl font-black tracking-tight text-slate-900">Carregue uma amostra de companies para validar a leitura</h4>
                <p className="max-w-3xl text-sm font-medium text-slate-600">
                Isso não inicia sync, não importa companies e não salva o token. O preview é apenas uma leitura controlada desta versão.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => void loadHubspotPreview()}
                disabled={hubspotPreviewStatus === 'loading' || !hubspotPrivateAppToken.trim()}
                className="rounded-xl bg-sky-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {hubspotPreviewStatus === 'loading' ? 'Carregando preview...' : 'Carregar preview de companies'}
              </button>
              <p className="text-[11px] font-medium text-slate-500">
                {hubspotPreviewStatus === 'idle'
                  ? 'Pronto para carregar uma amostra read-only.'
                  : hubspotPreviewStatus === 'success'
                    ? 'Preview carregado e validado na sessão atual.'
                    : hubspotPreviewStatus === 'error'
                      ? hubspotPreviewError || 'Revise o token e tente novamente.'
                      : 'Lendo companies no servidor.'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Leitura read-only</p>
                <p className="text-sm font-medium text-slate-600">
                  {hubspotPreviewStatus === 'success'
                    ? `Amostra validada em ${formatActionTimestamp(hubspotPreviewLoadedAt) || 'agora'} com ${hubspotPreviewCompanies.length} company(s).`
                    : hubspotPreviewStatus === 'loading'
                      ? 'Carregando a amostra de companies.'
                      : hubspotPreviewStatus === 'error'
                        ? 'Falha sanitizada na leitura read-only.'
                        : 'Nenhuma amostra carregada ainda.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">Preview</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">Companies</span>
              </div>
            </div>

            {hubspotPreviewStatus === 'error' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-black text-red-800">Não foi possível carregar o preview de companies.</p>
                <p className="mt-1 text-sm text-red-700">{hubspotPreviewError || 'Revise o token e tente novamente.'}</p>
              </div>
            )}

            {hubspotPreviewStatus === 'success' && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                        <th className="px-4 py-3">Empresa</th>
                        <th className="px-4 py-3">Domínio</th>
                        <th className="px-4 py-3">Setor</th>
                        <th className="px-4 py-3">País</th>
                        <th className="px-4 py-3">Owner ID</th>
                        <th className="px-4 py-3">Atualizado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {hubspotPreviewCompanies.length > 0 ? hubspotPreviewCompanies.map((company) => (
                        <tr key={company.id} className="text-sm text-slate-700">
                          <td className="px-4 py-3 font-semibold text-slate-900">{company.name || company.id}</td>
                          <td className="px-4 py-3">{company.domain || '—'}</td>
                          <td className="px-4 py-3">{company.industry || '—'}</td>
                          <td className="px-4 py-3">{company.country || '—'}</td>
                          <td className="px-4 py-3">{company.ownerId || '—'}</td>
                          <td className="px-4 py-3">{company.updatedAt ? formatActionTimestamp(company.updatedAt) || company.updatedAt : '—'}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                            Nenhuma company retornada pelo preview read-only.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {selectedConnector && activePreset && draftConfig && isHubspotApiInput && hubspotConnectionTestStatus === 'success' && (
        <Card className="border border-violet-200 bg-violet-50/70 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Read-only</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Pré-mapeamento</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Sem sync</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Sem importação</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Token não persistido</span>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Não aplica Camada Canônica</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-600">Schema e pré-mapeamento HubSpot</p>
              <h4 className="text-xl font-black tracking-tight text-slate-900">Detecte os campos de companies e veja uma sugestão inicial para Contas</h4>
                <p className="max-w-3xl text-sm font-medium text-slate-600">
                Isso não aplica mapeamento canônico, não importa dados e não inicia sync. O objetivo é preparar esta versão com metadados seguros do schema.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => void loadHubspotSchema()}
                disabled={hubspotSchemaStatus === 'loading' || !hubspotPrivateAppToken.trim()}
                className="rounded-xl bg-violet-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {hubspotSchemaStatus === 'loading' ? 'Detectando schema...' : 'Detectar campos de companies'}
              </button>
              <p className="text-[11px] font-medium text-slate-500">
                {hubspotSchemaStatus === 'idle'
                  ? 'Pronto para detectar properties read-only.'
                  : hubspotSchemaStatus === 'success'
                    ? 'Schema detectado e pré-mapeamento carregado.'
                    : hubspotSchemaStatus === 'error'
                      ? hubspotSchemaError || 'Revise o token e tente novamente.'
                      : 'Lendo properties de companies no servidor.'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Properties detectadas</p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {(hubspotSchemaTotalCount ?? hubspotSchemaProperties.length).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Properties exibidas</p>
              <p className="mt-1 text-sm font-black text-slate-900">{hubspotSchemaProperties.length.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Campos recomendados encontrados</p>
              <p className="mt-1 text-sm font-black text-slate-900">{hubspotSchemaSuggestedMappings.length.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Campos recomendados ausentes</p>
              <p className="mt-1 text-sm font-black text-slate-900">{hubspotMissingRecommendedFields.length.toLocaleString('pt-BR')}</p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white p-3 md:col-span-2 xl:col-span-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Último carregamento</p>
              <p className="mt-1 text-sm font-black text-slate-900">{hubspotSchemaLoadedAt ? formatActionTimestamp(hubspotSchemaLoadedAt) || 'agora' : '—'}</p>
            </div>
          </div>

          {hubspotSchemaStatus === 'error' && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-black text-red-800">Não foi possível detectar o schema de companies.</p>
              <p className="mt-1 text-sm text-red-700">{hubspotSchemaError || 'Revise o token e tente novamente.'}</p>
            </div>
          )}

          {hubspotSchemaStatus === 'success' && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
                  <div className="border-b border-violet-50 bg-violet-50/60 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Pré-mapeamento sugerido</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                          <th className="px-4 py-3">Campo HubSpot</th>
                          <th className="px-4 py-3">Rótulo HubSpot</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Campo sugerido na Canopi</th>
                          <th className="px-4 py-3">Confiança</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[...hubspotSchemaSuggestedMappings, ...hubspotMissingRecommendedFields].map((mapping) => (
                          <tr key={`${mapping.canopiField}-${mapping.hubspotField}`} className="text-sm text-slate-700">
                            <td className="px-4 py-3 font-semibold text-slate-900">{mapping.hubspotField}</td>
                            <td className="px-4 py-3">{mapping.hubspotLabel}</td>
                            <td className="px-4 py-3">{mapping.status === 'encontrado' ? 'property' : 'property esperada'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{mapping.canopiField}</td>
                            <td className="px-4 py-3">{mapping.confidence}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                                mapping.status === 'encontrado'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {mapping.status === 'encontrado' ? 'Encontrado' : 'Ausente'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-violet-100 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Campos detectados</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Lista compacta com os primeiros campos encontrados no schema read-only.</p>
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                      <div className="max-h-[420px] overflow-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                              <th className="px-3 py-2">Nome</th>
                              <th className="px-3 py-2">Rótulo</th>
                              <th className="px-3 py-2">Tipo</th>
                              <th className="px-3 py-2">Grupo</th>
                              <th className="px-3 py-2">Oculta</th>
                              <th className="px-3 py-2">Somente leitura</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {hubspotSchemaProperties.slice(0, 12).map((property) => (
                              <tr key={property.name} className="text-xs text-slate-700">
                                <td className="px-3 py-2 font-semibold text-slate-900">{property.name}</td>
                                <td className="px-3 py-2">{property.label}</td>
                                <td className="px-3 py-2">{property.type}</td>
                                <td className="px-3 py-2">{property.groupName || '—'}</td>
                                <td className="px-3 py-2">{property.hidden ? 'Sim' : 'Não'}</td>
                                <td className="px-3 py-2">{property.readOnlyDefinition || property.readOnlyValue ? 'Sim' : 'Não'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-violet-100 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-700">Lacunas identificadas</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Campos recomendados que ainda não apareceram no schema detectado.</p>
                    <div className="mt-3 space-y-2">
                      {hubspotMissingRecommendedFields.length > 0 ? hubspotMissingRecommendedFields.map((mapping) => (
                        <div key={`${mapping.canopiField}-missing`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-sm font-black text-slate-900">{mapping.hubspotField}</p>
                          <p className="text-xs text-slate-600">
                            Sugestão Canopi: {mapping.canopiField} • {mapping.canopiLabel}
                          </p>
                        </div>
                      )) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <p className="text-sm font-black text-emerald-800">Nenhuma lacuna nas recomendações iniciais.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {isCsvInput && (
      <Card className="border border-slate-200 p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Configuração da fonte selecionada</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {activePreset ? activePreset.name : 'Selecione uma fonte para continuar'}
          </h3>
          <p className="mt-2 max-w-4xl text-sm font-medium text-slate-600">
            Aqui você configura a fonte escolhida e, quando aplicável, o CSV usado como entrada local desta fonte.
          </p>
        </div>

        {!activePreset || !selectedConnector || !draftConfig ? (
          <div className="px-6 py-8">
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-6 text-sm font-medium text-slate-500">
              Escolha uma fonte no grid acima para abrir o painel de configuração local.
            </div>
          </div>
        ) : null}
        {activePreset && selectedConnector && draftConfig && isCsvInput && !isHubspotMethodPending && (
          <>
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-700">Fluxo da etapa</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                {WORKFLOW_STEPS.map((step) => (
                  <div key={step} className="rounded-lg border border-blue-100 bg-white px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-blue-700">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400 mb-3">Bloco A — Campos essenciais</h4>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Nome da fonte" value={draftConfig.sourceName} onChange={(v) => updateDraft('sourceName', v)} />
                <Field label="Entidade principal" value={draftConfig.primaryObject} onChange={(v) => updateDraft('primaryObject', v)} />
                <Field label="Chave primária" value={draftConfig.primaryKeyField} onChange={(v) => updateDraft('primaryKeyField', v)} />
                <Field label="Campo de nome da conta" value={draftConfig.accountNameField} onChange={(v) => updateDraft('accountNameField', v)} />
                <Field label="Campo de domínio/site" value={draftConfig.domainField} onChange={(v) => updateDraft('domainField', v)} />
                <Field label="Campo de owner" value={draftConfig.ownerField} onChange={(v) => updateDraft('ownerField', v)} />
                <Field label="Campo de status ou estágio" value={draftConfig.statusOrStageField} onChange={(v) => updateDraft('statusOrStageField', v)} />
                <Field label="Campo de última atualização" value={draftConfig.lastUpdatedField} onChange={(v) => updateDraft('lastUpdatedField', v)} />
                <Field label="Objeto prioritário para primeiro teste" value={draftConfig.priorityTestObject} onChange={(v) => updateDraft('priorityTestObject', v)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Bloco B — Campos opcionais</h4>
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Complementares, não obrigatórios</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Campos customizados esperados" value={draftConfig.expectedCustomFields} onChange={(v) => updateDraft('expectedCustomFields', v)} />
                <Field label="Campo de CNPJ/documento" value={draftConfig.taxIdField} onChange={(v) => updateDraft('taxIdField', v)} />
                <Field label="Campo de segmento" value={draftConfig.segmentField} onChange={(v) => updateDraft('segmentField', v)} />
                <Field label="Campo de setor" value={draftConfig.industryField} onChange={(v) => updateDraft('industryField', v)} />
                <Field label="Campo de porte" value={draftConfig.companySizeField} onChange={(v) => updateDraft('companySizeField', v)} />
                <Field label="Campo de receita/faturamento" value={draftConfig.revenueField} onChange={(v) => updateDraft('revenueField', v)} />
                <Field label="Campo de país/região" value={draftConfig.countryRegionField} onChange={(v) => updateDraft('countryRegionField', v)} />
                <Field label="Política de dedupe local" value={draftConfig.localDedupePolicy} onChange={(v) => updateDraft('localDedupePolicy', v)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-slate-400">Bloco C — Observações locais</h4>
              <Field label="Observações locais" value={draftConfig.localNotes} onChange={(v) => updateDraft('localNotes', v)} textarea />
            </div>

            {selectedConnector === 'other_crm' && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-indigo-700 mb-3">Bloco D — Específico de Outro CRM</h4>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Nome do CRM" value={draftConfig.otherCrmName} onChange={(v) => updateDraft('otherCrmName', v)} />
                  <Field label="Entidade nativa" value={draftConfig.otherCrmNativeEntity} onChange={(v) => updateDraft('otherCrmNativeEntity', v)} />
                  <Field label="Chave primária" value={draftConfig.otherCrmPrimaryKey} onChange={(v) => updateDraft('otherCrmPrimaryKey', v)} />
                  <Field label="URL base opcional" value={draftConfig.otherCrmFutureBaseUrl} onChange={(v) => updateDraft('otherCrmFutureBaseUrl', v)} placeholder="https://api.exemplo.com" />
                </div>
                <div className="mt-3">
                  <Field label="Observação do Outro CRM" value={draftConfig.otherCrmFutureObservation} onChange={(v) => updateDraft('otherCrmFutureObservation', v)} textarea />
                </div>
              </div>
            )}

            <Card className={`border px-4 py-4 ${sourceAction.tone === 'warning' ? 'border-amber-200 bg-amber-50' : sourceAction.tone === 'danger' ? 'border-red-200 bg-red-50' : sourceAction.tone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-blue-100 bg-blue-50'}`}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">O que fazer agora</p>
                    <h4 className="text-lg font-black tracking-tight text-slate-900">{sourceAction.title}</h4>
                    <p className="max-w-4xl text-sm font-medium text-slate-600">{sourceAction.description}</p>
                    {'reason' in sourceAction && sourceAction.reason && (
                      <p className="text-xs font-bold text-slate-500">{sourceAction.reason}</p>
                    )}
                  </div>

                  <SourceSnapshotSummary
                    sourceName={draftConfig.sourceName}
                    entryLabel={selectedConnector === 'hubspot' ? getInputMethodLabel(selectedConnector, selectedInputMethod) : 'CSV'}
                    statusLabel={isHubspotMethodPending ? 'Método pendente' : (isHubspotApiInput ? getHubspotTestLabel(hubspotConnectionTestStatus) : csvStatusLabel)}
                    lastSavedNote={lastSavedAt ? `Configuração local salva em ${lastSavedAt}.` : null}
                    lastValidatedNote={lastValidatedAt ? `CSV confirmado em ${lastValidatedAt}.` : null}
                    stepCompletedNote={stepCompletedAt ? `Configuração concluída em ${stepCompletedAt}.` : null}
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:flex-col">
                  <button
                    type="button"
                    disabled={sourceAction.disabled}
                    onClick={sourceAction.onClick}
                    className={`rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      sourceAction.tone === 'warning'
                        ? 'bg-amber-600 text-white shadow-lg hover:bg-amber-700'
                        : sourceAction.tone === 'danger'
                          ? 'bg-red-600 text-white shadow-lg hover:bg-red-700'
                          : sourceAction.tone === 'success'
                            ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700'
                            : 'bg-slate-900 text-white shadow-lg hover:bg-slate-700'
                    } disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none`}
                  >
                    {sourceAction.buttonLabel}
                  </button>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={restorePreset}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50"
              >
                Restaurar padrão
              </button>
              <span className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${hasDraftChanges ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {hasDraftChanges ? 'Há alterações locais não salvas' : 'Configuração salva'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-slate-400">Detalhes de configuração da fonte</h4>
              <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{draftConfig.sourceName}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entidade</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{draftConfig.primaryObject}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Chave primária</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{draftConfig.primaryKeyField}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Objeto prioritário</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{draftConfig.priorityTestObject}</p>
                </div>
              </div>
      <div className={`rounded-xl border p-3 ${(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Status da configuração</p>
                  <p className="text-sm font-medium text-slate-700">
                    {(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated)
                      ? (isHubspotApiInput
                        ? (currentSourceCompleted
                          ? 'Conexão HubSpot validada e etapa concluída.'
                          : 'Conexão HubSpot validada. Se houver edição, o status volta para pendente.')
                        : 'CSV confirmado para uso local. Se houver edição, o status volta para pendente.')
                      : (isHubspotApiInput
                        ? 'Revise os dados, informe o token temporário e teste a conexão HubSpot.'
                        : 'Revise os dados, salve a configuração local e confirme o uso do CSV.')}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated)
                      ? (isHubspotApiInput
                        ? (currentSourceCompleted
                          ? 'A etapa já foi registrada nesta sessão.'
                          : 'A confirmação ativa o próximo passo no bloco “O que fazer agora”.')
                        : 'A confirmação ativa o próximo passo no bloco “O que fazer agora”.')
                      : (isHubspotApiInput
                        ? 'O teste continua disponível apenas no bloco principal acima.'
                        : 'A confirmação continua disponível apenas no bloco principal acima.')}
                  </p>
                </div>
              </div>
              {!(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated) && hasDraftChanges && !isHubspotMethodPending && (
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  Há edição local pendente. Salve a configuração para liberar a confirmação.
                </p>
              )}
              {!(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated) && !hasDraftChanges && isCsvInput && csvUploadMeta?.validationResult?.isValid === false && !isHubspotMethodPending && (
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  Corrija o CSV antes de confirmar o uso desta fonte.
                </p>
              )}
              {(isHubspotApiInput ? hubspotConnectionTestStatus === 'success' : connectorLocalValidated) && (isHubspotApiInput ? (hubspotConnectionStepCompletedAt || hubspotLastConnectionTestAt) : lastValidatedAt) && !isHubspotMethodPending && (
                <p className="mt-2 text-[11px] font-medium text-emerald-700">
                  {isHubspotApiInput ? 'Conexão HubSpot concluída em' : 'CSV confirmado em'} {isHubspotApiInput ? (hubspotConnectionStepCompletedAt || hubspotLastConnectionTestAt) : lastValidatedAt}.
                </p>
              )}
            </div>
	        </div>
	        <details className="rounded-xl border border-slate-200 bg-white p-4">
	          <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
	            Detalhes desta versão
	          </summary>
	          <p className="mt-3 text-xs font-medium text-slate-500">
	            Informativo. Não solicita credenciais e não executa conexão.
	          </p>
	        </details>
	      </>
	      )}
      </Card>
      )}

      <div className="text-xs text-slate-400 font-medium">
	        <span className="inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Os limites desta versão variam conforme a fonte selecionada.</span>
      </div>
    </section>
  );
}
