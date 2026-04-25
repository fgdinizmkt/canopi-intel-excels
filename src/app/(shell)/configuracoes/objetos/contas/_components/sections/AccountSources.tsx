'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';
import {
  CONNECTOR_PRESETS,
  type ConnectorPreset,
  type ConnectorType,
} from '@/src/lib/contaConnectorsV2';
import { getAccountConnectorAdapter } from '@/src/lib/accountConnectorAdapters';

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

const WORKFLOW_STEPS = [
  '1. Escolher fonte',
  '2. Configurar fonte local',
  '3. Revisar e validar contrato',
  '4. Detalhes técnicos futuros',
];

function normalize(value: string | null | undefined): string {
  return (value || '').trim();
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
  const adapter = getAccountConnectorAdapter(type);
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
    accountNameField: findNativeField(preset, ['canonical_name', 'legal_name'], type === 'csv_upload' ? 'empresa' : 'name'),
    domainField: findNativeField(preset, ['primary_domain'], type === 'csv_upload' ? 'website' : 'domain'),
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
    csvDelimiter: ';',
    csvEncoding: 'UTF-8',
    csvHeaderInFirstLine: true,
    csvDedupeKey: type === 'csv_upload' ? 'website' : '',
    csvRequiredMinimumField: type === 'csv_upload' ? 'empresa' : '',
    csvObservation: 'Upload/importação real ainda não implementado neste recorte.',
    otherCrmName: type === 'other_crm' ? sourceName : '',
    otherCrmNativeEntity: type === 'other_crm' ? primaryObject : '',
    otherCrmPrimaryKey: type === 'other_crm' ? primaryKeyField : '',
    otherCrmFutureBaseUrl: '',
    otherCrmFutureObservation: 'Endpoints e autenticação serão tratados em recorte futuro.',
  };
}

function mergeWithDefaults(type: ConnectorType, saved: Partial<LocalSourceConfig> | undefined): LocalSourceConfig {
  return { ...buildDefaultLocalSourceConfig(type), ...(saved || {}) };
}

function getAuthTypeLabel(authType: string): string {
  switch (authType) {
    case 'oauth2_authorization_code': return 'OAuth 2.0 (Authorization Code)';
    case 'private_app_token': return 'Token de App Privado';
    case 'api_token': return 'Token de API';
    case 'bearer_token': return 'Bearer Token';
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
    case 'salesforce': return 'Método futuro previsto: API + OAuth 2.0';
    case 'hubspot': return 'Método futuro previsto: Private App API';
    case 'rd_station': return 'Método futuro previsto: API + Token';
    case 'csv_upload': return 'Método atual: upload local em lote (arquivo)';
    case 'other_crm': return 'Método futuro previsto: API, banco ou middleware';
  }
}

function getIntegrationLabel(type: ConnectorType): string {
  switch (type) {
    case 'salesforce': return 'CRM nativo';
    case 'hubspot': return 'CRM nativo';
    case 'rd_station': return 'CRM operacional';
    case 'csv_upload': return 'Upload em lote';
    case 'other_crm': return 'Setup semiassistido';
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
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
          type="text"
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
    setConnector,
    updateCustomConfig,
    customConfig,
    connectorLocalValidated,
    setConnectorLocalValidated,
    realConnectionContract,
  } = useContasConfig();

  const connectorTypes: ConnectorType[] = ['salesforce', 'hubspot', 'rd_station', 'csv_upload', 'other_crm'];
  const activePreset = selectedConnector ? CONNECTOR_PRESETS[selectedConnector] : null;
  const activeAdapter = selectedConnector ? getAccountConnectorAdapter(selectedConnector) : null;
  const savedLocalConfigByProvider = (customConfig.localSourceConfigByProvider || {}) as Partial<Record<ConnectorType, Partial<LocalSourceConfig>>>;
  const fallbackSavedLocalConfig = customConfig.localSourceConfig as Partial<LocalSourceConfig> | undefined;
  const savedLocalConfig = selectedConnector
    ? (savedLocalConfigByProvider[selectedConnector] || fallbackSavedLocalConfig)
    : fallbackSavedLocalConfig;

  const [draftConfig, setDraftConfig] = React.useState<LocalSourceConfig | null>(null);
  const [hasUnsavedLocalEdit, setHasUnsavedLocalEdit] = React.useState(false);

  React.useEffect(() => {
    if (!selectedConnector) {
      setDraftConfig(null);
      setHasUnsavedLocalEdit(false);
      return;
    }
    setDraftConfig(mergeWithDefaults(selectedConnector, savedLocalConfig));
    setHasUnsavedLocalEdit(false);
  }, [selectedConnector, savedLocalConfig]);

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
  };

  const hasDraftChanges = React.useMemo(() => {
    if (!selectedConnector || !draftConfig) return false;
    if (hasUnsavedLocalEdit) return true;
    const baseline = mergeWithDefaults(selectedConnector, savedLocalConfig);
    return JSON.stringify(draftConfig) !== JSON.stringify(baseline);
  }, [draftConfig, hasUnsavedLocalEdit, savedLocalConfig, selectedConnector]);

  const canValidateLocally = React.useMemo(() => {
    if (!selectedConnector || !draftConfig) return false;
    const baseReady = [
      normalize(draftConfig.sourceName),
      normalize(draftConfig.primaryObject),
      normalize(draftConfig.primaryKeyField),
      normalize(draftConfig.accountNameField),
      normalize(draftConfig.domainField),
    ].every((value) => value.length > 0);

    if (!baseReady) return false;

    if (selectedConnector === 'csv_upload') {
      return normalize(draftConfig.csvDedupeKey).length > 0 && normalize(draftConfig.csvRequiredMinimumField).length > 0;
    }

    if (selectedConnector === 'other_crm') {
      return normalize(draftConfig.otherCrmName).length > 0
        && normalize(draftConfig.otherCrmNativeEntity).length > 0
        && normalize(draftConfig.otherCrmPrimaryKey).length > 0;
    }

    return true;
  }, [draftConfig, selectedConnector]);

  const saveLocalConfig = () => {
    if (!selectedConnector || !draftConfig) return;

    const resolvedPrimaryKey = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmPrimaryKey) || normalize(draftConfig.primaryKeyField)
      : normalize(draftConfig.primaryKeyField);
    const resolvedObject = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmNativeEntity) || normalize(draftConfig.primaryObject)
      : normalize(draftConfig.primaryObject);
    const resolvedName = selectedConnector === 'other_crm'
      ? normalize(draftConfig.otherCrmName) || normalize(draftConfig.sourceName)
      : normalize(draftConfig.sourceName);

    updateCustomConfig({
      localSourceConfig: draftConfig,
      localSourceConfigByProvider: {
        ...savedLocalConfigByProvider,
        [selectedConnector]: draftConfig,
      },
      customName: selectedConnector === 'other_crm' ? resolvedName : customConfig.customName,
      customNativeObject: selectedConnector === 'other_crm' ? resolvedObject : customConfig.customNativeObject,
      customPrimaryKey: selectedConnector === 'other_crm' ? resolvedPrimaryKey : customConfig.customPrimaryKey,
      primaryKeys: [resolvedPrimaryKey].filter(Boolean),
      connectorLocalValidated: false,
    });
    setHasUnsavedLocalEdit(false);
  };

  const restorePreset = () => {
    if (!selectedConnector) return;
    const defaults = buildDefaultLocalSourceConfig(selectedConnector);
    setDraftConfig(defaults);
    updateCustomConfig({
      localSourceConfig: defaults,
      localSourceConfigByProvider: {
        ...savedLocalConfigByProvider,
        [selectedConnector]: defaults,
      },
      connectorLocalValidated: false,
      customName: selectedConnector === 'other_crm' ? defaults.otherCrmName : customConfig.customName,
      customNativeObject: selectedConnector === 'other_crm' ? defaults.otherCrmNativeEntity : customConfig.customNativeObject,
      customPrimaryKey: selectedConnector === 'other_crm' ? defaults.otherCrmPrimaryKey : customConfig.customPrimaryKey,
      primaryKeys: [selectedConnector === 'other_crm' ? defaults.otherCrmPrimaryKey : defaults.primaryKeyField].filter(Boolean),
    });
    setHasUnsavedLocalEdit(false);
  };

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

        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {connectorTypes.map((type) => {
            const preset = CONNECTOR_PRESETS[type];
            const isActive = conta.connectorType === type;
            return (
              <Card
                key={type}
                className={`border-2 p-0 transition-all ${isActive ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex h-full flex-col p-4">
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
                        Fonte local escolhida
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConnector(type)}
                        className="rounded-lg px-2.5 py-1 text-[9px] font-black uppercase bg-slate-900 text-white transition-all hover:bg-slate-700"
                      >
                        Usar como fonte local
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge className={`border-none text-[8px] font-black ${preset.identity.confidenceScore > 90 ? 'bg-emerald-100 text-emerald-700' : preset.identity.confidenceScore > 75 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      Confiança: {preset.identity.confidenceScore}%
                    </Badge>
                    <span className="text-[9px] font-bold text-slate-400">{getIngestMethod(type).replace('Método futuro previsto: ', '')}</span>
                  </div>

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
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Fonte</p>
            <p className="mt-1 text-sm font-black text-slate-900">{draftConfig?.sourceName || 'Não configurada'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Entidade</p>
            <p className="mt-1 text-sm font-black text-slate-900">{draftConfig?.primaryObject || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Chave primária</p>
            <p className="mt-1 text-sm font-black text-slate-900">{draftConfig?.primaryKeyField || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Contrato local</p>
            <p className="mt-1 text-sm font-black text-slate-900">{connectorLocalValidated ? 'Validado' : 'Pendente'}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Conexão real</p>
            <p className="mt-1 text-sm font-black text-slate-900">Não implementada</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Sync real</p>
            <p className="mt-1 text-sm font-black text-slate-900">Não implementado</p>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-200 p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Contrato de leitura da fonte</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {activePreset ? activePreset.name : 'Selecione uma fonte para continuar'}
          </h3>
          <p className="mt-2 max-w-4xl text-sm font-medium text-slate-600">
            Aqui você ajusta apenas o contrato local de leitura. Conexão real continua fora deste recorte.
          </p>
        </div>

        {!activePreset || !selectedConnector || !draftConfig ? (
          <div className="px-6 py-8">
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-6 text-sm font-medium text-slate-500">
              Escolha uma fonte no grid acima para abrir o painel de configuração local.
            </div>
          </div>
        ) : (
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

            {selectedConnector === 'csv_upload' && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 mb-3">Bloco D — Específico de Upload CSV</h4>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Separador esperado" value={draftConfig.csvDelimiter} onChange={(v) => updateDraft('csvDelimiter', v)} />
                  <Field label="Encoding esperado" value={draftConfig.csvEncoding} onChange={(v) => updateDraft('csvEncoding', v)} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Cabeçalho na primeira linha</label>
                    <select
                      value={draftConfig.csvHeaderInFirstLine ? 'sim' : 'nao'}
                      onChange={(event) => updateDraft('csvHeaderInFirstLine', event.target.value === 'sim')}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none transition-all focus:border-blue-500"
                    >
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>
                  <Field label="Chave de dedupe" value={draftConfig.csvDedupeKey} onChange={(v) => updateDraft('csvDedupeKey', v)} />
                  <Field label="Campo obrigatório mínimo" value={draftConfig.csvRequiredMinimumField} onChange={(v) => updateDraft('csvRequiredMinimumField', v)} />
                </div>
                <div className="mt-3">
                  <Field label="Observação CSV" value={draftConfig.csvObservation} onChange={(v) => updateDraft('csvObservation', v)} textarea />
                </div>
              </div>
            )}

            {selectedConnector === 'other_crm' && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-indigo-700 mb-3">Bloco D — Específico de Outro CRM</h4>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Nome do CRM" value={draftConfig.otherCrmName} onChange={(v) => updateDraft('otherCrmName', v)} />
                  <Field label="Entidade nativa" value={draftConfig.otherCrmNativeEntity} onChange={(v) => updateDraft('otherCrmNativeEntity', v)} />
                  <Field label="Chave primária" value={draftConfig.otherCrmPrimaryKey} onChange={(v) => updateDraft('otherCrmPrimaryKey', v)} />
                  <Field label="URL base futura (opcional)" value={draftConfig.otherCrmFutureBaseUrl} onChange={(v) => updateDraft('otherCrmFutureBaseUrl', v)} placeholder="https://api.exemplo.com" />
                </div>
                <div className="mt-3">
                  <Field label="Observação do Outro CRM" value={draftConfig.otherCrmFutureObservation} onChange={(v) => updateDraft('otherCrmFutureObservation', v)} textarea />
                </div>
              </div>
            )}

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                  onClick={saveLocalConfig}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-700"
                >
                  Salvar configuração local
                </button>
                <button
                  type="button"
                  onClick={restorePreset}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all hover:bg-slate-50"
                >
                  Restaurar preset da fonte
                </button>
                <span className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ${hasDraftChanges ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {hasDraftChanges ? 'Edição local pendente de salvar' : 'Configuração local sincronizada'}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-500">
                Salva apenas este contrato local. Não publica nem conecta CRM.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-slate-400">Revisar e validar contrato local</h4>
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
              <div className={`rounded-xl border p-3 ${connectorLocalValidated ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Contrato local da fonte</p>
                    <p className="text-sm font-medium text-slate-700">
                      {connectorLocalValidated
                        ? 'Contrato local validado. Se houver edição, o status volta para pendente.'
                        : 'Revise os dados, salve a configuração local e valide o contrato.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!canValidateLocally || connectorLocalValidated}
                    onClick={() => setConnectorLocalValidated(true)}
                    className={`shrink-0 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${connectorLocalValidated ? 'bg-emerald-100 text-emerald-700 cursor-default' : canValidateLocally ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    {connectorLocalValidated ? '✓ Contrato local da fonte validado' : 'Validar contrato local da fonte'}
                  </button>
                </div>
              </div>
            </div>

            {activeAdapter && realConnectionContract && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Detalhes técnicos da conexão futura</h4>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Informativo. Não solicita credenciais e não executa conexão nesta etapa.
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Autenticação prevista</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{getAuthTypeLabel(realConnectionContract.authType)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Status atual</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{getConnectionStatusLabel(realConnectionContract.connectionStatus)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Refresh token</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{realConnectionContract.supportsRefreshToken ? 'Previsto no modelo' : 'Não aplicável no modelo'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Campos customizados</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{realConnectionContract.supportsCustomFields ? 'Suportado no modelo' : 'Não suportado no modelo'}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-start gap-2">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Escopos mínimos</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {realConnectionContract.requiredScopes.length === 0 && (
                        <span className="text-xs font-medium text-slate-500">Sem escopo obrigatório nesta origem.</span>
                      )}
                      {realConnectionContract.requiredScopes.map((scope) => (
                        <span key={scope} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700">{scope}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Objetos prioritários</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {activeAdapter.priorityObjectsForFirstTest.map((objectName) => (
                        <span key={objectName} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">{objectName}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedConnector !== 'other_crm' && activePreset.instructions.factsAboutConnector.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400 mb-2">Fatos da fonte</h4>
                <div className="space-y-1.5">
                  {activePreset.instructions.factsAboutConnector.map((fact, index) => (
                    <div key={index} className="flex gap-2 text-sm font-medium text-slate-600">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">Próximas etapas</h4>
                  <ul className="space-y-1 text-sm font-medium text-amber-900">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0 text-amber-600" />Identidade e Dedupe: chaves, domínio corporativo e política de conflito.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 shrink-0 text-amber-600" />Camada Canônica: mapeamento técnico dos campos da fonte para o modelo Canopi.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="text-xs text-slate-400 font-medium">
        <span className="inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Conexão real e sincronização contínua seguem para o recorte C2.</span>
      </div>
    </section>
  );
}
