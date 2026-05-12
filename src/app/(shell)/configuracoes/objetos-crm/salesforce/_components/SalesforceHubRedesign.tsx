'use client';

import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Cloud,
  Copy,
  Database,
  Filter,
  History,
  LayoutGrid,
  Lock,
  LogOut,
  Pencil,
  RefreshCw,
  Settings2,
  ShieldCheck,
  ToggleLeft,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/src/components/ui';

interface OAuthConfigForm {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  loginUrl: string;
}

interface SalesforceHubRedesignProps {
  oauthStatus: any;
  oauthLoading: boolean;
  oauthActionLoading: 'connect' | 'health' | 'disconnect' | null;
  connectionValidatedAt: string | null;
  accountsPreview: any;
  accountsPreviewLoading: boolean;
  selectedAccountPreviewRows: any[];
  preparedAccountsPreviewSelection: any | null;
  localPreSyncContract: any | null;
  localPreSyncDryRun: any | null;
  accountQualityPendingItems: any[];
  accountQualityResolvedItems: any[];
  accountSyncState: any;
  activeObject: 'accounts' | 'contacts' | 'opportunities';
  contactPreviewState: any;
  contactSyncState: any;
  onSetActiveObject: (obj: 'accounts' | 'contacts' | 'opportunities') => void;
  onContactPreview: () => void;
  onContactSync: () => void;
  contactFullLoadState: { phase: 'idle' | 'loading' | 'done' | 'error'; recordCount?: number; message?: string };
  onLoadAllContacts: () => void;
  opportunityPreviewState: any;
  opportunitySyncState: any;
  onOpportunityPreview: () => void;
  onOpportunitySync: () => void;
  onRevalidateOpportunityPreview: () => void;
  opportunityFullLoadState: { phase: 'idle' | 'loading' | 'done' | 'error'; recordCount?: number; message?: string };
  onLoadAllOpportunities: () => void;
  configurationCompleted: boolean;
  onCompleteConfiguration: () => void;
  leadLoadState: { phase: 'idle' | 'loading' | 'done' | 'error'; records?: any[]; totalSize?: number; message?: string };
  onLoadLeads: () => void;
  // Config OAuth
  oauthConfig: any;
  oauthConfigured: boolean;
  oauthConfigSaving: boolean;
  oauthConfigError: string | null;
  showConfigForm: boolean;
  oauthConfigForm: OAuthConfigForm;
  onConfigFormChange: (field: keyof OAuthConfigForm, value: string) => void;
  onConfigSave: () => void;
  onConfigEditToggle: () => void;
  onCopyCallbackUrl: () => void;
  // Handlers
  onConnect: () => void;
  onHealthCheck: () => void;
  onDisconnect: () => void;
  onLoadAccounts: () => void;
  onReloadHubState: () => void;
  onLoadAllAccounts: () => void;
  accountsFullLoadState: { phase: 'idle' | 'loading' | 'done' | 'error'; totalLoaded?: number; message?: string };
  hubRefreshState: { phase: 'idle' | 'loading' | 'done' | 'error'; message?: string; updatedAt?: string };
  onSelectAll: () => void;
  onPrepare: () => void;
  onGenerateContract: () => void;
  onDryRun: () => void;
  onSync: () => void;
}

export function SalesforceHubRedesign({
  oauthStatus,
  oauthLoading,
  oauthActionLoading,
  connectionValidatedAt: _connectionValidatedAt,
  accountsPreview,
  accountsPreviewLoading,
  selectedAccountPreviewRows,
  preparedAccountsPreviewSelection,
  localPreSyncContract,
  localPreSyncDryRun,
  accountQualityPendingItems,
  accountQualityResolvedItems: _accountQualityResolvedItems,
  accountSyncState,
  activeObject,
  contactPreviewState,
  contactSyncState,
  onSetActiveObject,
  onContactPreview,
  onContactSync,
  contactFullLoadState,
  onLoadAllContacts,
  opportunityPreviewState,
  opportunitySyncState,
  onOpportunityPreview,
  onOpportunitySync,
  onRevalidateOpportunityPreview,
  opportunityFullLoadState,
  onLoadAllOpportunities,
  configurationCompleted,
  onCompleteConfiguration,
  leadLoadState,
  onLoadLeads,
  oauthConfig,
  oauthConfigured,
  oauthConfigSaving,
  oauthConfigError,
  showConfigForm,
  oauthConfigForm,
  onConfigFormChange,
  onConfigSave,
  onConfigEditToggle,
  onCopyCallbackUrl,
  onConnect,
  onHealthCheck,
  onDisconnect,
  onLoadAccounts,
  onReloadHubState,
  onLoadAllAccounts,
  accountsFullLoadState,
  hubRefreshState,
  onSelectAll,
  onPrepare,
  onGenerateContract,
  onDryRun,
  onSync
}: SalesforceHubRedesignProps) {

  const isConnected = oauthStatus?.status === 'connected';
  const isOAuthError = oauthStatus?.status === 'error';
  const isOAuthRestoring = oauthLoading && !oauthStatus;
  const accountsLoaded = !!accountsPreview;
  const accountsCount = accountsPreview?.records?.length || 0;
  const hasFullAccountSnapshot = accountSyncState.phase === 'done' || accountsFullLoadState.phase === 'done' || accountsCount > 50;
  const contactPreview = contactPreviewState.phase === 'done' ? contactPreviewState.preview : null;
  const opportunityPreview = opportunityPreviewState.phase === 'done' ? opportunityPreviewState.preview : null;
  const contactUnresolvedCount = contactPreview?.unresolvedCount ?? 0;
  const opportunityUnresolvedCount = opportunityPreview?.unresolvedCount ?? 0;
  const contactResolvedCount = contactPreview?.resolvedCount ?? 0;
  const opportunityResolvedCount = opportunityPreview?.resolvedCount ?? 0;
  const hasPendingLinkIssues = contactUnresolvedCount > 0 || opportunityUnresolvedCount > 0;
  const finalConfigurationLabel = hasPendingLinkIssues
    ? 'Configuração concluída com pendências'
    : 'Configuração concluída · Modo leitura ativo';
  const finalConfigurationTone = hasPendingLinkIssues
    ? {
        border: 'border-amber-200',
        background: 'bg-amber-50',
        label: 'text-amber-700',
        text: 'text-slate-700',
      }
    : {
        border: 'border-emerald-200',
        background: 'bg-emerald-50',
        label: 'text-emerald-700',
        text: 'text-slate-700',
      };
  const canCompleteConfiguration =
    accountSyncState.phase === 'done' &&
    contactSyncState.phase === 'done' &&
    opportunitySyncState.phase === 'done';
  const completeConfigurationLabel = hasPendingLinkIssues
    ? 'Concluir com pendências'
    : 'Concluir configuração Salesforce';

  const clientIdAlreadySaved = Boolean(oauthConfig?.clientIdConfigured);
  const secretAlreadySaved = Boolean(oauthConfig?.clientSecretConfigured);
  const canSaveConfig =
    oauthConfigForm.redirectUri.trim() !== '' &&
    oauthConfigForm.loginUrl.trim() !== '' &&
    (clientIdAlreadySaved || oauthConfigForm.clientId.trim() !== '') &&
    (secretAlreadySaved || oauthConfigForm.clientSecret.trim() !== '');

  // Agrupamento de pendências por campo para a visão de matriz
  const fieldIssues = useMemo(() => {
    const issues: Record<string, { count: number; type: string }> = {};
    accountQualityPendingItems.forEach(item => {
      if (!issues[item.field]) {
        issues[item.field] = { count: 0, type: item.type };
      }
      issues[item.field].count++;
    });
    return issues;
  }, [accountQualityPendingItems]);

  // Contagem de campos críticos ausentes por campo, direto dos registros brutos
  const criticalFieldIssues = useMemo(() => {
    const records: any[] = accountsPreview?.records ?? [];
    return {
      Industry: records.filter((r: any) => !r.Industry?.trim()).length,
      Website: records.filter((r: any) => !r.Website?.trim()).length,
      Type: records.filter((r: any) => !r.Type?.trim()).length,
    };
  }, [accountsPreview]);

  const hasCriticalMissingFields =
    accountsLoaded &&
    (criticalFieldIssues.Industry > 0 || criticalFieldIssues.Website > 0 || criticalFieldIssues.Type > 0);

  function generateCorrectionCsv() {
    const records: any[] = accountsPreview?.records ?? [];
    const needsCorrection = records.filter(
      (r: any) => !r.Industry?.trim() || !r.Website?.trim() || !r.Type?.trim()
    );
    if (needsCorrection.length === 0) return;
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Id', 'Canopi_Reference_AccountName', 'Industry', 'Website', 'Type'];
    const rows = needsCorrection.map((r: any) =>
      [r.Id, r.Name, r.Industry, r.Website, r.Type].map(escape).join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salesforce_accounts_correcao.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const mappingRows = [
    { label: 'Nome da empresa', type: 'Texto', sfField: 'Account.Name', canopiField: 'name' },
    { label: 'Site / Domínio', type: 'URL', sfField: 'Account.Website', canopiField: 'dominio' },
    { label: 'Vertical', type: 'Picklist', sfField: 'Account.Industry', canopiField: 'segmento' },
    { label: 'Tipo de conta', type: 'Picklist', sfField: 'Account.Type', canopiField: 'tipo' },
    { label: 'Proprietário', type: 'Lookup', sfField: 'Account.OwnerId', canopiField: 'owner' },
    { label: 'Salesforce ID', type: 'ID', sfField: 'Account.Id', canopiField: 'external_id' },
  ];

  const getStatusBadge = (field: string) => {
    const sfName = field.split('.').pop() || '';
    const criticalFields = ['Industry', 'Website', 'Type'] as const;
    type CriticalField = typeof criticalFields[number];

    if (accountsLoaded && criticalFields.includes(sfName as CriticalField)) {
      const count = criticalFieldIssues[sfName as CriticalField];
      if (count > 0) {
        return (
          <Badge className="bg-red-50 text-red-700 border-none px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
            {count} sem valor
          </Badge>
        );
      }
    }

    const issue = fieldIssues[sfName];
    if (issue) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-none px-2 py-0.5 text-[10px] font-bold">
          {issue.count} pendências
        </Badge>
      );
    }

    if (!accountsLoaded) {
      return <Badge className="bg-slate-100 text-slate-400 border-none px-2 py-0.5 text-[10px] font-bold">—</Badge>;
    }

    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[10px] font-bold">
        Pronto
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      {/* ── HEADER ── */}
      <header className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Integrações</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600">Salesforce</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Configuração Salesforce</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Gerencie a conexão e o mapeamento de dados entre Canopi e Salesforce.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none ${
              isConnected ? 'bg-emerald-100 text-emerald-700'
              : isOAuthError ? 'bg-red-100 text-red-600'
              : isOAuthRestoring ? 'bg-slate-100 text-slate-400'
              : 'bg-slate-100 text-slate-500'
            }`}>
              {isConnected ? '● Conta conectada'
              : isOAuthError ? '● Requer reconexão'
              : isOAuthRestoring ? '○ Verificando...'
              : '○ Sem conexão configurada'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="px-8">
        {/* ── CONFIGURAÇÃO DO CONECTOR SALESFORCE ── */}
        <section className={`mb-6 rounded-3xl border shadow-sm ${
          isOAuthError ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
        }`}>

          {/* ── A: Configuração OAuth do Salesforce ── */}
          <div className="border-b border-slate-100 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Configuração OAuth do Salesforce
              </p>
              {oauthConfigured && !showConfigForm ? (
                <button
                  onClick={onConfigEditToggle}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-slate-700"
                >
                  <Pencil className="h-3 w-3" />
                  Editar configuração
                </button>
              ) : null}
            </div>

            {showConfigForm ? (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-500">
                  Configure o aplicativo conectado (Connected App) usado por esta empresa antes de iniciar a conexão OAuth. Consumer Key, Consumer Secret e Callback URL são obrigatórios.
                </p>
                {oauthConfigError ? (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">{oauthConfigError}</p>
                ) : null}

                {/* Ambiente */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">Ambiente</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onConfigFormChange('loginUrl', 'https://login.salesforce.com')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        oauthConfigForm.loginUrl === 'https://login.salesforce.com' || oauthConfigForm.loginUrl === ''
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      Produção
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfigFormChange('loginUrl', 'https://test.salesforce.com')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        oauthConfigForm.loginUrl === 'https://test.salesforce.com'
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      Sandbox
                    </button>
                  </div>
                </div>

                {/* Client ID */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Consumer Key / Client ID
                  </label>
                  <input
                    type="text"
                    value={oauthConfigForm.clientId}
                    onChange={(e) => onConfigFormChange('clientId', e.target.value)}
                    placeholder={oauthConfig?.clientIdConfigured ? '•••••• salvo' : '3MVG9...'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  {clientIdAlreadySaved ? (
                    <p className="mt-1 text-[10px] text-slate-400">Consumer Key já salva. Preencha apenas se quiser substituir.</p>
                  ) : (
                    <p className="mt-1 text-[10px] text-amber-600 font-medium">Obrigatório para primeira configuração.</p>
                  )}
                </div>

                {/* Client Secret */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Consumer Secret / Client Secret
                  </label>
                  <input
                    type="password"
                    value={oauthConfigForm.clientSecret}
                    onChange={(e) => onConfigFormChange('clientSecret', e.target.value)}
                    placeholder={oauthConfig?.clientSecretConfigured ? '•••••••• salvo' : 'Cole o secret do Connected App'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  {secretAlreadySaved ? (
                    <p className="mt-1 text-[10px] text-slate-400">Consumer Secret já salvo. Preencha apenas se quiser substituir.</p>
                  ) : (
                    <p className="mt-1 text-[10px] text-amber-600 font-medium">Obrigatório para primeira configuração.</p>
                  )}
                </div>

                {/* Callback URL */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Callback URL da Canopi — use esta URL no Connected App do Salesforce
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={oauthConfigForm.redirectUri}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-mono text-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={onCopyCallbackUrl}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copiar URL
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onConfigSave}
                    disabled={oauthConfigSaving || !canSaveConfig}
                    className="flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    {oauthConfigSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                    {oauthConfigSaving ? 'Salvando...' : 'Salvar configuração'}
                  </button>
                  {oauthConfigured ? (
                    <button
                      type="button"
                      onClick={onConfigEditToggle}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 transition-all hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              /* Resumo quando configurado e não em edição */
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ambiente</p>
                    <p className="text-sm font-bold text-slate-700">
                      {oauthConfig?.loginUrl === 'https://test.salesforce.com' ? 'Sandbox' : 'Produção'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consumer Key</p>
                    <p className="text-sm font-mono font-medium text-slate-700">
                      {oauthConfig?.clientIdConfigured ? '•••••• salvo' : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consumer Secret</p>
                    <p className="text-sm font-mono font-medium text-slate-700">
                      {oauthConfig?.clientSecretConfigured ? '•••••••• salvo' : '—'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Callback URL</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-mono text-slate-600 truncate max-w-xs">{oauthConfigForm.redirectUri}</p>
                      <button onClick={onCopyCallbackUrl} className="shrink-0 text-slate-400 hover:text-slate-600">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                {!oauthConfig?.updatedAt ? (
                  <p className="text-[10px] text-amber-600">
                    Configuração carregada do ambiente local. Para uso multiempresa, salve uma configuração própria para esta empresa.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* ── B: Conexão da conta Salesforce ── */}
          <div className="p-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Conexão da conta Salesforce
            </p>
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                  isConnected ? 'bg-emerald-50 text-emerald-600'
                  : isOAuthError ? 'bg-red-100 text-red-500'
                  : isOAuthRestoring ? 'bg-slate-100 text-slate-400'
                  : !oauthConfigured ? 'bg-slate-100 text-slate-300'
                  : 'bg-blue-50 text-blue-600'
                }`}>
                  <Cloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isOAuthRestoring ? 'Verificando conexão Salesforce'
                    : isConnected ? 'Salesforce conectado para esta empresa'
                    : isOAuthError ? 'Conexão Salesforce precisa de atenção'
                    : !oauthConfigured ? 'Configure o OAuth antes de conectar'
                    : 'Salesforce ainda não conectado'}
                  </h3>
                  <p className={`mt-0.5 text-xs font-medium ${isOAuthError ? 'text-red-600' : 'text-slate-500'}`}>
                    {isOAuthRestoring ? 'Verificando se existe uma autorização OAuth válida para esta empresa.'
                    : isConnected ? 'Conexão ativa para esta empresa. Você pode revalidar, trocar a conta conectada ou desconectar este conector.'
                    : isOAuthError ? 'A autorização expirou ou não pôde ser validada. Reconecte para continuar.'
                    : !oauthConfigured ? 'Preencha os dados do OAuth acima e salve antes de iniciar a conexão com sua conta Salesforce.'
                    : 'Clique em Conectar Salesforce para iniciar o fluxo OAuth desta empresa.'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                {isOAuthRestoring ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verificando...
                  </div>
                ) : isConnected ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={onHealthCheck}
                      disabled={!!oauthActionLoading}
                      className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-[#4338CA] hover:shadow-lg disabled:opacity-50"
                    >
                      {oauthActionLoading === 'health' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                      Revalidar conexão
                    </button>
                    <button
                      onClick={onConnect}
                      disabled={!!oauthActionLoading}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Trocar conta Salesforce
                    </button>
                    <button
                      onClick={onDisconnect}
                      disabled={!!oauthActionLoading}
                      className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Desconectar Salesforce
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={!!oauthActionLoading || !oauthConfigured}
                    className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black text-white transition-all hover:shadow-lg disabled:opacity-50 ${
                      isOAuthError ? 'bg-red-600 hover:bg-red-700' : 'bg-[#4F46E5] hover:bg-[#4338CA]'
                    }`}
                  >
                    {oauthActionLoading === 'connect' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    {isOAuthError ? 'Reconectar Salesforce' : 'Conectar Salesforce'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── GRID PRINCIPAL ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* COLUNA ESQUERDA (3) */}
          <div className="space-y-6 lg:col-span-3">
            {/* Sincronização de Objetos */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Database className="h-4 w-4 text-slate-400" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Sincronização de Objetos</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold">Contas e Organizações</p>
                  <p className="text-[10px] text-slate-400">Empresas e organizações do Salesforce</p>
                </div>

                {!isConnected ? (
                  <p className="text-[10px] font-medium text-slate-400">Conecte o Salesforce para carregar.</p>
                ) : accountsLoaded ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregadas</p>
                        <p className="mt-0.5 text-base font-black text-[#4F46E5]">{accountsCount}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total SF</p>
                        <p className="mt-0.5 text-base font-black text-slate-800">{accountsPreview?.totalSize ?? '—'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selecionadas</p>
                        <p className="mt-0.5 text-base font-black text-slate-800">{selectedAccountPreviewRows.length}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preparadas</p>
                        <p className={`mt-0.5 text-base font-black ${preparedAccountsPreviewSelection ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {preparedAccountsPreviewSelection?.selectedCount ?? '—'}
                        </p>
                      </div>
                    </div>
                    {preparedAccountsPreviewSelection ? (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[10px] font-black text-emerald-700">
                          {preparedAccountsPreviewSelection.selectedCount} preparadas — prossiga pelo mapeamento abaixo
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={onSelectAll}
                          className={`flex-1 rounded-xl py-2 text-[10px] font-black transition-colors ${
                            selectedAccountPreviewRows.length === 0
                              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              : selectedAccountPreviewRows.length === accountsCount
                                ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                                : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          {selectedAccountPreviewRows.length === 0
                            ? 'Selecionar todos'
                            : selectedAccountPreviewRows.length === accountsCount
                              ? 'Todos selecionados'
                              : `Selecionadas ${selectedAccountPreviewRows.length} de ${accountsCount}`}
                        </button>
                        <button
                          onClick={onPrepare}
                          disabled={selectedAccountPreviewRows.length === 0}
                          className="flex-1 rounded-xl bg-[#4F46E5] py-2 text-[10px] font-black text-white hover:bg-[#4338CA] disabled:opacity-40"
                        >
                          {selectedAccountPreviewRows.length === 0
                            ? 'Selecione Accounts'
                            : `Preparar ${selectedAccountPreviewRows.length}`}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={hasFullAccountSnapshot ? onReloadHubState : onLoadAccounts}
                      disabled={accountsPreviewLoading}
                      className="w-full rounded-xl border border-slate-100 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-50"
                    >
                      {accountsPreviewLoading || hubRefreshState.phase === 'loading'
                        ? 'Recarregando estado...'
                        : hasFullAccountSnapshot
                          ? 'Recarregar tudo'
                          : 'Recarregar amostra (50)'}
                    </button>
                    {hubRefreshState.phase === 'done' && (
                      <p className="text-[10px] font-medium text-slate-400">
                        Estado atualizado agora{hubRefreshState.updatedAt ? ` · ${new Date(hubRefreshState.updatedAt).toLocaleString('pt-BR')}` : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={onLoadAllAccounts}
                      disabled={accountsPreviewLoading || accountsFullLoadState.phase === 'loading'}
                      className="w-full rounded-xl bg-[#4F46E5] py-2.5 text-xs font-black text-white hover:bg-[#4338CA] disabled:opacity-50"
                    >
                      {(accountsPreviewLoading || accountsFullLoadState.phase === 'loading') ? 'Carregando...' : 'Carregar todas'}
                    </button>
                    <button
                      onClick={onLoadAccounts}
                      disabled={accountsPreviewLoading || accountsFullLoadState.phase === 'loading'}
                      className="w-full rounded-xl border border-slate-200 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-50"
                    >
                      Amostra (50)
                    </button>
                  </div>
                )}

                {accountSyncState.phase === 'done' ? (
                  <div className="space-y-3">
                    {/* Leads & Contatos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">Leads & Contatos</p>
                          <p className="text-[10px] text-slate-400">Perfis e informações de contato</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {contactSyncState.phase === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          <button
                            onClick={() => onSetActiveObject('contacts')}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${activeObject === 'contacts' ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                          >
                            {contactSyncState.phase === 'done' ? 'Ver resultado' : 'Validar'}
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500">Contacts</p>
                          {contactSyncState.phase === 'done' ? (
                            <span className="text-[10px] font-bold text-emerald-600">
                              {contactSyncState.result.createdCount} criados · {contactSyncState.result.skippedCount} ignorados
                            </span>
                          ) : contactFullLoadState.phase === 'done' ? (
                            <span className="text-[10px] font-medium text-slate-500">{contactFullLoadState.recordCount ?? 0} carregados</span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">pendente</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500">Leads</p>
                          {leadLoadState.phase === 'done' ? (
                            <span className="text-[10px] font-medium text-amber-600">
                              {leadLoadState.records?.length ?? 0} encontrados · sync pendente
                            </span>
                          ) : leadLoadState.phase === 'loading' ? (
                            <span className="text-[10px] font-medium text-slate-400">carregando para leitura...</span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400">
                              {activeObject === 'contacts' && contactSyncState.phase === 'done'
                                ? 'carregando para leitura...'
                                : 'sync pendente'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Oportunidades e Funil */}
                    {contactSyncState.phase !== 'done' ? (
                      <div className="flex items-center justify-between opacity-40">
                        <div>
                          <p className="text-sm font-bold">Oportunidades e Funil</p>
                          <p className="text-[10px] text-slate-400">Disponível após validar Contacts.</p>
                        </div>
                        <ToggleLeft className="h-6 w-6 text-slate-300" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">Oportunidades e Funil</p>
                            <p className="text-[10px] text-slate-400">Rastreie o pipeline de vendas</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {opportunitySyncState.phase === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            <button
                              onClick={() => onSetActiveObject('opportunities')}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${activeObject === 'opportunities' ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                              {opportunitySyncState.phase === 'done' ? 'Ver resultado' : 'Validar'}
                            </button>
                          </div>
                        </div>
                        {opportunitySyncState.phase === 'done' && (() => {
                          const r = opportunitySyncState.result;
                          const oppItems: any[] = opportunityPreviewState.phase === 'done' ? opportunityPreviewState.preview.items : [];
                          const stages = Array.from(new Set(oppItems.map((i: any) => i.stageName).filter(Boolean)));
                          const totalAmount = oppItems.reduce((sum: number, i: any) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);
                          const hasAmount = oppItems.some((i: any) => typeof i.amount === 'number' && i.amount > 0);
                          return (
                            <div className="rounded-xl bg-slate-50 px-3 py-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500">Opportunities</p>
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {r.createdCount} criadas · {r.skippedCount} ignoradas
                                </span>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[10px] font-black text-slate-500">Funil</p>
                                <div className="text-right">
                                  {stages.length > 0 ? (
                                    <p className="text-[10px] font-medium text-slate-600">{stages.length} stage{stages.length !== 1 ? 's' : ''}</p>
                                  ) : (
                                    <p className="text-[10px] font-medium text-slate-400">derivado das Opps</p>
                                  )}
                                  {hasAmount ? (
                                    <p className="text-[10px] font-medium text-slate-500">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalAmount)}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] font-medium text-slate-400">valor não disponível</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        {opportunitySyncState.phase !== 'done' && (
                          <p className="text-[10px] font-medium text-slate-600">Oportunidades prontas para validação</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between opacity-40">
                      <div>
                        <p className="text-sm font-bold">Leads & Contatos</p>
                        <p className="text-[10px] text-slate-400">Disponível após sincronização de Contas</p>
                      </div>
                      <ToggleLeft className="h-6 w-6 text-slate-300" />
                    </div>
                    <div className="flex items-center justify-between opacity-40">
                      <div>
                        <p className="text-sm font-bold">Oportunidades e Funil</p>
                        <p className="text-[10px] text-slate-400">Disponível após sincronização de Contas</p>
                      </div>
                      <ToggleLeft className="h-6 w-6 text-slate-300" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Configurações de Fluxo */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-slate-400" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Configurações de Fluxo</h4>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">Padrão</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direção</p>
                  <p className="text-xs font-bold mt-0.5">SF → Canopi</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modo</p>
                  <p className="text-xs font-bold mt-0.5">Batch (Lote)</p>
                </div>
                <p className="text-[10px] font-medium text-slate-400 px-1">Fluxo bidirecional e modo real-time disponíveis em versões futuras.</p>
              </div>
            </div>
          </div>

          {/* COLUNA CENTRAL (6) */}
          <div className="space-y-6 lg:col-span-6">
            {activeObject === 'contacts' ? (
              /* ── PAINEL DE VALIDAÇÃO DE CONTACTS ─────────────────────────── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-slate-300 rotate-180 cursor-pointer" onClick={() => onSetActiveObject('accounts')} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Validação de Contacts e Leads</h4>
                  </div>
                  <button
                    onClick={() => onSetActiveObject('accounts')}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Voltar para Accounts
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Preview de Contacts</h4>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold">Read-only</Badge>
                  </div>

                  {contactPreviewState.phase === 'idle' && (
                    <div className="text-center py-8 space-y-3">
                      <p className="text-sm font-medium text-slate-500">Busca os contatos do contrato sincronizado e resolve o vínculo com Accounts Canopi.</p>
                      <div className="flex flex-col items-center gap-2">
                        {contactFullLoadState.phase !== 'done' ? (
                          <button
                            onClick={onLoadAllContacts}
                            disabled={contactFullLoadState.phase === 'loading'}
                            className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-2.5 text-sm font-black text-white hover:bg-[#4338CA] disabled:opacity-50"
                          >
                            {contactFullLoadState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                            {contactFullLoadState.phase === 'loading' ? 'Carregando Contacts...' : 'Carregar todos os Contacts'}
                          </button>
                        ) : (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                              {contactFullLoadState.recordCount ?? 0} Contacts carregados
                            </p>
                          </div>
                        )}
                        <button
                          onClick={onContactPreview}
                          disabled={contactFullLoadState.phase === 'loading'}
                          className="rounded-2xl border border-slate-200 px-6 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {contactFullLoadState.phase === 'done' ? 'Validar Contacts' : 'Usar contrato existente'}
                        </button>
                        {contactFullLoadState.phase === 'error' && (
                          <p className="text-[11px] font-medium text-red-500">{contactFullLoadState.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {contactPreviewState.phase === 'loading' && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Buscando contatos...
                    </div>
                  )}

                  {contactPreviewState.phase === 'error' && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Erro</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{contactPreviewState.message}</p>
                      <button
                        onClick={onContactPreview}
                        className="mt-2 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-black text-white hover:bg-red-700"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {contactPreviewState.phase === 'done' && (() => {
                    const { preview, contractSource } = contactPreviewState;
                    const allUnresolved = preview.resolvedCount === 0 && preview.totalContacts > 0;
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                            <p className="text-lg font-black text-slate-900">{preview.totalContacts}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                            <p className="text-lg font-black text-emerald-700">{preview.resolvedCount}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Resolvidos</p>
                          </div>
                          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
                            <p className="text-lg font-black text-amber-700">{preview.unresolvedCount}</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Sem vínculo</p>
                          </div>
                        </div>

                        {contractSource === 'fallback' && (
                          <p className="text-[10px] font-medium text-slate-400">
                            Contacts lidos de contrato com registros de contato; Accounts resolvidas pela base sincronizada.
                          </p>
                        )}

                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {preview.items.slice(0, 10).map((item: any) => (
                                <tr key={item.sourceContactId} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-2.5">
                                    <p className="text-xs font-bold text-slate-900">{item.nome || '—'}</p>
                                    {item.email && <p className="text-[10px] text-slate-400">{item.email}</p>}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {item.resolvedAccountName ? (
                                      <p className="text-xs font-medium text-slate-700">{item.resolvedAccountName}</p>
                                    ) : (
                                      <p className="text-xs font-medium text-amber-600">Sem vínculo</p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold ${item.actionPreview === 'create' ? 'bg-emerald-100 text-emerald-700' : item.actionPreview === 'update' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                      {item.actionPreview === 'create' ? 'Criar' : item.actionPreview === 'update' ? 'Atualizar' : item.actionPreview}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {preview.items.length > 10 && (
                            <div className="bg-slate-50 border-t border-slate-100 px-3 py-2">
                              <p className="text-[10px] font-medium text-slate-400">+{preview.items.length - 10} contatos não exibidos</p>
                            </div>
                          )}
                        </div>

                        {allUnresolved ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Nenhum vínculo resolvido</p>
                            <p className="mt-0.5 text-xs font-medium text-slate-600">
                              Contacts encontrados, mas nenhum vínculo com Accounts sincronizadas foi resolvido. Reexecute Account Sync ou selecione um contrato compatível.
                            </p>
                          </div>
                        ) : contactSyncState.phase === 'done' ? (() => {
                          const r = contactSyncState.result;
                          const microcopy = [
                            r.createdCount > 0 ? `${r.createdCount} criados` : '',
                            r.updatedCount > 0 ? `${r.updatedCount} atualizados` : '',
                            r.errorCount > 0 ? `${r.errorCount} erros` : '',
                            r.skippedCount > 0 ? `${r.skippedCount} ignorados` : '',
                          ].filter(Boolean).join(' · ');
                          return (
                            <div className="flex items-center justify-end gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <p className="text-sm font-black text-emerald-700">Contacts sincronizados</p>
                              {microcopy && <p className="text-[11px] font-medium text-slate-400">{microcopy}</p>}
                            </div>
                          );
                        })() : (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={contactSyncState.phase !== 'loading' ? onContactSync : undefined}
                              disabled={contactSyncState.phase === 'loading'}
                              className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] disabled:opacity-50"
                            >
                              {contactSyncState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                              {contactSyncState.phase === 'loading' ? 'Sincronizando Contacts...' : 'Sincronizar Contacts'}
                            </button>
                            {contactSyncState.phase === 'error' && (
                              <p className="text-[11px] font-medium text-red-500">{contactSyncState.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ── LEADS — read-only, sem sync ─────────────────────────── */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Leads</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Leads carregados apenas para leitura. Nenhum Lead é gravado na Canopi.</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-bold">Sync pendente</Badge>
                  </div>

                  {leadLoadState.phase === 'idle' && (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-sm font-medium text-slate-500">Carregando Leads para leitura...</p>
                    </div>
                  )}

                  {leadLoadState.phase === 'loading' && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Carregando Leads...
                    </div>
                  )}

                  {leadLoadState.phase === 'error' && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Erro ao consultar Leads</p>
                      <p className="text-xs font-medium text-slate-600">{leadLoadState.message}</p>
                      <button
                        onClick={onLoadLeads}
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-black text-white hover:bg-red-700"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {leadLoadState.phase === 'done' && (() => {
                    const records = leadLoadState.records ?? [];
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                            <p className="text-lg font-black text-slate-900">{leadLoadState.totalSize ?? records.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encontrados</p>
                          </div>
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-center">
                            <p className="text-lg font-black text-indigo-700">{records.length}</p>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Carregados</p>
                          </div>
                          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
                            <p className="text-lg font-black text-amber-700">—</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Leads em leitura</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Leads carregados apenas para leitura</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-600">
                            Nenhum Lead foi gravado na Canopi. Lead Sync permanece pendente.
                          </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Empresa</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {records.slice(0, 10).map((lead: any, i: number) => (
                                <tr key={lead.Id ?? i} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-2.5">
                                    <p className="text-xs font-bold text-slate-900">{lead.Name || '—'}</p>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <p className="text-xs font-medium text-slate-700">{lead.Company || '—'}</p>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600">{lead.Status || '—'}</span>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <p className="text-[10px] text-slate-500">{lead.Email || '—'}</p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {records.length > 10 && (
                            <div className="bg-slate-50 border-t border-slate-100 px-3 py-2">
                              <p className="text-[10px] font-medium text-slate-400">+{records.length - 10} Leads não exibidos · {records.length} carregados no total</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={onLoadLeads}
                            className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-black text-white hover:bg-indigo-700"
                          >
                            Atualizar Leads
                          </button>
                          <p className="text-[10px] text-slate-400">Consulta apenas para leitura.</p>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Sincronização de Leads pendente</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-600">
                            {records.length} Leads encontrados e carregados do Salesforce. Nenhum dado de Lead foi gravado na Canopi.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : activeObject === 'opportunities' ? (
              /* ── PAINEL DE VALIDAÇÃO DE OPPORTUNITIES ───────────────────── */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-slate-300 rotate-180 cursor-pointer" onClick={() => onSetActiveObject('accounts')} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Validação de Oportunidades</h4>
                  </div>
                  <button
                    onClick={() => onSetActiveObject('accounts')}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Voltar para Accounts
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-400" />
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Preview de Opportunities</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Valide oportunidades relacionadas às Accounts sincronizadas.</p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold">Read-only</Badge>
                  </div>

                  <div className="mb-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Accounts sincronizadas com sucesso.
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Contacts já validados neste fluxo.
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <Circle className="h-3 w-3 text-slate-300" />
                      Opportunity Contact Roles ficam para próximo recorte.
                    </div>
                  </div>

                  {opportunityPreviewState.phase === 'idle' && (
                    <div className="text-center py-6 space-y-3">
                      <div className="flex flex-col items-center gap-2">
                        {opportunityFullLoadState.phase !== 'done' ? (
                          <button
                            onClick={onLoadAllOpportunities}
                            disabled={opportunityFullLoadState.phase === 'loading'}
                            className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-2.5 text-sm font-black text-white hover:bg-[#4338CA] disabled:opacity-50"
                          >
                            {opportunityFullLoadState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                            {opportunityFullLoadState.phase === 'loading' ? 'Carregando Opportunities...' : 'Carregar todas as Opportunities'}
                          </button>
                        ) : (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                              {opportunityFullLoadState.recordCount ?? 0} Opportunities carregadas
                            </p>
                          </div>
                        )}
                        <button
                          onClick={onOpportunityPreview}
                          disabled={opportunityFullLoadState.phase === 'loading'}
                          className="rounded-2xl border border-slate-200 px-6 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {opportunityFullLoadState.phase === 'done' ? 'Validar Opportunities' : 'Usar contrato existente'}
                        </button>
                        {opportunityFullLoadState.phase === 'error' && (
                          <p className="text-[11px] font-medium text-red-500">{opportunityFullLoadState.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {opportunityPreviewState.phase === 'loading' && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Buscando oportunidades...
                    </div>
                  )}

                  {opportunityPreviewState.phase === 'error' && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Erro</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{opportunityPreviewState.message}</p>
                      <button
                        onClick={onOpportunityPreview}
                        className="mt-2 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-black text-white hover:bg-red-700"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {opportunityPreviewState.phase === 'done' && (() => {
                    const { preview } = opportunityPreviewState;
                    const allUnresolved = preview.resolvedCount === 0 && preview.totalOpportunities > 0;
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                            <p className="text-lg font-black text-slate-900">{preview.totalOpportunities}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                            <p className="text-lg font-black text-emerald-700">{preview.resolvedCount}</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Novas</p>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                            <p className="text-lg font-black text-slate-500">{preview.existingMatchCount ?? 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Já existem</p>
                          </div>
                          <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-center">
                            <p className="text-lg font-black text-amber-700">{preview.unresolvedCount}</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Sem vínculo</p>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Oportunidade</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Conta</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stage</th>
                                <th className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {preview.items.slice(0, 10).map((item: any) => (
                                <tr key={item.sourceOpportunityId} className="hover:bg-slate-50/50">
                                  <td className="px-3 py-2.5">
                                    <p className="text-xs font-bold text-slate-900">{item.nome || '—'}</p>
                                    {item.amount != null && (
                                      <p className="text-[10px] text-slate-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.amount)}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {item.resolvedAccountName ? (
                                      <p className="text-xs font-medium text-slate-700">{item.resolvedAccountName}</p>
                                    ) : (
                                      <p className="text-xs font-medium text-amber-600">Sem vínculo</p>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <p className="text-xs font-medium text-slate-600">{item.stageName || '—'}</p>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {item.actionPreview === 'ready_to_create' && (
                                      <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700">Criar</span>
                                    )}
                                    {item.actionPreview === 'ready_to_update' && (
                                      <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700">Atualizar</span>
                                    )}
                                    {item.actionPreview === 'existing_match' && (
                                      <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500">Já existe</span>
                                    )}
                                    {item.actionPreview === 'unresolved_account' && (
                                      <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700">Sem vínculo</span>
                                    )}
                                    {item.actionPreview === 'missing_required_fields' && (
                                      <span className="inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700">Campos faltando</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {preview.items.length > 10 && (
                            <div className="bg-slate-50 border-t border-slate-100 px-3 py-2">
                              <p className="text-[10px] font-medium text-slate-400">+{preview.items.length - 10} oportunidades não exibidas</p>
                            </div>
                          )}
                        </div>

                        {/* Funil derivado das Opportunities */}
                        {(() => {
                          const items: any[] = preview.items;
                          const stages = Array.from(new Set(items.map((i: any) => i.stageName).filter(Boolean)));
                          const totalAmount = items.reduce((sum: number, i: any) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);
                          const hasAmount = items.some((i: any) => typeof i.amount === 'number' && i.amount > 0);
                          if (stages.length === 0) return null;
                          return (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Funil derivado das Opportunities carregadas do Salesforce</p>
                              <div className="flex flex-wrap gap-1.5">
                                {stages.map((stage) => (
                                  <span key={stage} className="rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{stage}</span>
                                ))}
                              </div>
                              <p className="text-[10px] font-medium text-slate-500">
                                {stages.length} stage{stages.length !== 1 ? 's' : ''} identificado{stages.length !== 1 ? 's' : ''} · {preview.totalOpportunities} Opportunit{preview.totalOpportunities !== 1 ? 'ies' : 'y'} ·{' '}
                                {hasAmount
                                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalAmount)
                                  : 'valor não disponível'}
                              </p>
                            </div>
                          );
                        })()}

                        {allUnresolved ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Nenhuma Account resolvida</p>
                            <p className="mt-0.5 text-xs font-medium text-slate-600">
                              Opportunities encontradas, mas nenhuma Account foi resolvida. Verifique o contrato de Opportunities.
                            </p>
                          </div>
                        ) : opportunitySyncState.phase === 'done' ? (() => {
                          const r = opportunitySyncState.result;
                          const syncedSomething = r.createdCount + r.updatedCount > 0;
                          const microcopy = [
                            r.createdCount > 0 ? `${r.createdCount} criadas` : '',
                            r.updatedCount > 0 ? `${r.updatedCount} atualizadas` : '',
                            r.errorCount > 0 ? `${r.errorCount} erros` : '',
                            r.skippedCount > 0 ? `${r.skippedCount} ignoradas` : '',
                          ].filter(Boolean).join(' · ');
                          return syncedSomething ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-end gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <p className="text-sm font-black text-emerald-700">Opportunities sincronizadas</p>
                                {microcopy && <p className="text-[11px] font-medium text-slate-400">{microcopy}</p>}
                              </div>
                              {configurationCompleted && (() => {
                                const oppItems: any[] = preview.items;
                                const stages = Array.from(new Set(oppItems.map((i: any) => i.stageName).filter(Boolean)));
                                const hasAmount = oppItems.some((i: any) => typeof i.amount === 'number' && i.amount > 0);
                                const totalAmount = oppItems.reduce((sum: number, i: any) => sum + (typeof i.amount === 'number' ? i.amount : 0), 0);
                                const r = opportunitySyncState.phase === 'done' ? opportunitySyncState.result : null;
                                const cs = contactSyncState.phase === 'done' ? contactSyncState.result : null;
                                const acctResult = accountSyncState.phase === 'done' ? accountSyncState.result : null;
                                return (
                                  <div className={`rounded-2xl ${finalConfigurationTone.border} ${finalConfigurationTone.background} px-4 py-4 space-y-3`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${finalConfigurationTone.label}`}>{finalConfigurationLabel}</p>
                                    {hasPendingLinkIssues && (
                                      <p className={`text-xs font-medium ${finalConfigurationTone.text}`}>
                                        Há vínculos pendentes em Contacts e/ou Opportunities. A base está carregada, mas a leitura não está limpa.
                                      </p>
                                    )}
                                    <div className="space-y-1.5 text-xs font-medium text-slate-700">
                                      {acctResult && (
                                        <p>Accounts: {accountsPreview?.records?.length ?? 0} carregadas · {acctResult.createdCount > 0 ? `${acctResult.createdCount} criadas · ` : ''}{acctResult.updatedCount} sincronizadas no último sync</p>
                                      )}
                                      {cs ? (
                                        <p>Contacts: {contactFullLoadState.phase === 'done' ? `${contactFullLoadState.recordCount ?? 0} carregados · ` : ''}{contactResolvedCount} resolvidos · {contactUnresolvedCount} sem vínculo · {cs.createdCount} criados · {cs.updatedCount} atualizados{cs.skippedCount > 0 ? ` · ${cs.skippedCount} ignorados` : ''}{cs.errorCount > 0 ? ` · ${cs.errorCount} erros` : ''}</p>
                                      ) : (
                                        <p>Contacts: {contactFullLoadState.phase === 'done' ? `${contactFullLoadState.recordCount ?? 0} carregados` : 'não validados'}</p>
                                      )}
                                      <p>
                                        Leads: {leadLoadState.phase === 'done'
                                          ? `${leadLoadState.records?.length ?? 0} carregados · sync pendente`
                                          : 'não carregados · sync pendente'}
                                      </p>
                                      {r && (
                                        <p>Opportunities: {preview.totalOpportunities} carregadas · {opportunityResolvedCount} resolvidas · {preview.unresolvedCount} sem vínculo · {r.createdCount} criadas · {r.existingMatchSkippedCount ?? 0} já existentes · {r.skippedCount} ignoradas</p>
                                      )}
                                      <p>
                                        Funil: {stages.length > 0
                                          ? `${preview.totalOpportunities} Opportunit${preview.totalOpportunities !== 1 ? 'ies' : 'y'} · ${stages.length} stage${stages.length !== 1 ? 's' : ''} · ${hasAmount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalAmount) : 'valor não disponível'}`
                                          : 'derivado das Opportunities carregadas'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Base carregada · pendências de vínculo</p>
                              <p className="text-xs font-medium text-slate-600">
                                {microcopy ? `${microcopy} — ` : ''}Revise os vínculos de conta e campos obrigatórios, ou revalide o preview para atualizar os dados.
                              </p>
                              <button
                                onClick={onRevalidateOpportunityPreview}
                                className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-all"
                              >
                                Revalidar preview
                              </button>
                            </div>
                          );
                        })() : (
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              onClick={opportunitySyncState.phase !== 'loading' ? onOpportunitySync : undefined}
                              disabled={opportunitySyncState.phase === 'loading'}
                              className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-6 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] disabled:opacity-50"
                            >
                              {opportunitySyncState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                              {opportunitySyncState.phase === 'loading' ? 'Sincronizando Opportunities...' : 'Sincronizar Opportunities'}
                            </button>
                            {opportunitySyncState.phase === 'error' && (
                              <p className="text-[11px] font-medium text-red-500">{opportunitySyncState.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
            <>
            <div className="grid grid-cols-2 gap-4">
              {/* Escopo e Filtros */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Escopo e Filtros</h4>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">Padrão</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data de Corte</p>
                    <p className="text-xs font-bold">Últimos 12 meses</p>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 px-1">Filtros adicionais disponíveis em versões futuras.</p>
                </div>
              </div>

              {/* Identidade e Unicidade */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Identidade</h4>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">Padrão</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chave Única</p>
                    <p className="text-xs font-bold">Salesforce ID</p>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-medium text-slate-500">Deduplicação por Salesforce ID</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAPEAMENTO DE CAMPOS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-slate-400" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Mapeamento de Campos</h4>
                </div>
                <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold">Objeto: Accounts</Badge>
              </div>

              {/* Estados de fluxo — visíveis enquanto não há qualidade disponível */}
              {!accountsLoaded && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Aguardando dados</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">Carregue Accounts no painel à esquerda para iniciar a análise de campos.</p>
                </div>
              )}
              {accountsLoaded && !preparedAccountsPreviewSelection && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Selecione e prepare</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">{accountsCount} registros disponíveis. Selecione os que deseja analisar e clique em Preparar.</p>
                </div>
              )}
              {preparedAccountsPreviewSelection && !localPreSyncContract && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Preparação</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">{preparedAccountsPreviewSelection.selectedCount} registros selecionados. Prepare a sincronização para continuar.</p>
                  <button onClick={onGenerateContract} className="mt-2 rounded-xl bg-[#4F46E5] px-4 py-1.5 text-xs font-black text-white hover:bg-[#4338CA]">
                    Preparar sincronização
                  </button>
                </div>
              )}
              {localPreSyncContract && !localPreSyncDryRun && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Validação</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">Vamos validar a configuração antes de liberar a sincronização.</p>
                  <button onClick={onDryRun} className="mt-2 rounded-xl bg-[#4F46E5] px-4 py-1.5 text-xs font-black text-white hover:bg-[#4338CA]">
                    Validar configuração
                  </button>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Campo Canopi</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tipo</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Salesforce</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappingRows.map((row) => (
                      <tr key={row.canopiField} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-slate-900">{row.label}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className="bg-slate-100 text-slate-400 border-none text-[9px] font-bold px-1.5">{row.type}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600">
                            {row.sfField}
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(row.sfField)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasCriticalMissingFields && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-black text-amber-800">Correção necessária no Salesforce</p>
                  <p className="mt-1 text-[11px] font-medium text-amber-700">
                    {[
                      criticalFieldIssues.Industry > 0 && `${criticalFieldIssues.Industry} sem Industry`,
                      criticalFieldIssues.Website > 0 && `${criticalFieldIssues.Website} sem Website`,
                      criticalFieldIssues.Type > 0 && `${criticalFieldIssues.Type} sem Type`,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-2 text-[10px] font-medium text-amber-600">
                    Preencha os campos ausentes no CSV e importe no Salesforce para atualizar os registros. Depois, recarregue Accounts na Canopi.
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-amber-500">
                    Use a coluna <span className="font-black">Id</span> como identificador no Salesforce. A coluna <span className="font-black">Canopi_Reference_AccountName</span> é apenas referência e não deve ser mapeada no upload.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={generateCorrectionCsv}
                      className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-black text-white hover:bg-amber-800"
                    >
                      Baixar CSV de correção
                    </button>
                    <button
                      type="button"
                      onClick={hasFullAccountSnapshot ? onReloadHubState : onLoadAccounts}
                      disabled={accountsPreviewLoading}
                      className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    >
                      {hasFullAccountSnapshot ? 'Recarregar tudo' : 'Recarregar amostra (50)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
            )}
          </div>

          {/* COLUNA DIREITA (3) */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="h-4 w-4 text-slate-400" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Atividade Recente</h4>
              </div>

              <div className="space-y-6">
                {[
                  { date: 'Hoje, 14:30', title: 'Sincronização concluída', desc: '12 registros atualizados', status: 'success' },
                  { date: 'Hoje, 11:15', title: 'Aviso de Sincronização', desc: 'Falha em 2 registros', status: 'warning' },
                  { date: 'Ontem, 09:15', title: 'Sincronização concluída', desc: '85 registros criados', status: 'success' },
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    {idx !== 2 && <div className="absolute left-2.5 top-5 h-full w-[1px] bg-slate-100" />}
                    <div className={`absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-white shadow-sm ${
                      item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
                    <p className="text-xs font-black text-slate-900">{item.title}</p>
                    <p className="text-[10px] font-medium text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <button className="mt-8 w-full text-[11px] font-black text-[#4F46E5] hover:underline">
                Ver todos os logs
              </button>
            </div>
          </div>
        </div>

        {/* ── ENTRADA ALTERNATIVA POR CSV ── */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">Entrada alternativa por CSV</h4>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">Opcional</span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Use um CSV padronizado para importar dados para a Canopi quando a conexão direta não for suficiente.
                </p>
              </div>
            </div>
            <button
              disabled
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-black text-slate-400 cursor-not-allowed"
            >
              Disponível em etapa futura
            </button>
          </div>
        </div>
      </main>

      {/* ── FOOTER CTA ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Criptografia ponta-a-ponta ativa</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              {accountQualityPendingItems.length > 0 && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{accountQualityPendingItems.length} Pendências de Qualidade</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {canCompleteConfiguration && !configurationCompleted && (
                <button
                  onClick={onCompleteConfiguration}
                  className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-black text-white shadow-lg transition-all ${
                    hasPendingLinkIssues ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {completeConfigurationLabel}
                </button>
              )}
              {configurationCompleted && (
                <div className={`rounded-2xl border px-4 py-2 text-sm font-black ${finalConfigurationTone.border} ${finalConfigurationTone.background} ${finalConfigurationTone.text}`}>
                  {finalConfigurationLabel}
                </div>
              )}
              {(() => {
              if (!oauthConfigured) {
                return (
                  <button
                    disabled
                    className="flex items-center gap-2 rounded-2xl bg-slate-100 px-8 py-3 text-sm font-black text-slate-400 shadow-none cursor-not-allowed"
                  >
                    Configurar OAuth Salesforce
                  </button>
                );
              }
              if (isOAuthRestoring) {
                return (
                  <button disabled className="flex items-center gap-2 rounded-2xl bg-slate-100 px-8 py-3 text-sm font-black text-slate-400 shadow-none cursor-not-allowed">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Verificando conexão
                  </button>
                );
              }
              if (isOAuthError) {
                return (
                  <button
                    onClick={onConnect}
                    disabled={!!oauthActionLoading}
                    className="flex items-center gap-2 rounded-2xl bg-red-600 px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-red-700 disabled:opacity-50"
                  >
                    {oauthActionLoading === 'connect' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Reconectar Salesforce
                  </button>
                );
              }
              if (!isConnected) {
                return (
                  <button
                    onClick={onConnect}
                    disabled={!!oauthActionLoading}
                    className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    {oauthActionLoading === 'connect' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Conectar Salesforce
                  </button>
                );
              }
              // "Carregar Accounts" — handler dedicado, não onSync
              if (!accountsLoaded) {
                return (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={onLoadAllAccounts}
                      disabled={accountsPreviewLoading || accountsFullLoadState.phase === 'loading'}
                      className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] disabled:opacity-50"
                    >
                      {(accountsPreviewLoading || accountsFullLoadState.phase === 'loading') ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                      {(accountsPreviewLoading || accountsFullLoadState.phase === 'loading') ? 'Carregando...' : 'Carregar todas as Accounts'}
                    </button>
                    <button
                      onClick={onLoadAccounts}
                      disabled={accountsPreviewLoading || accountsFullLoadState.phase === 'loading'}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Carregar amostra (50)
                    </button>
                    {accountsFullLoadState.phase === 'error' && (
                      <p className="text-[11px] font-medium text-red-500">{accountsFullLoadState.message}</p>
                    )}
                  </div>
                );
              }
              // Estados de dados — disabled informativos, onSync só quando realmente pronto
              const syncReady =
                selectedAccountPreviewRows.length > 0 &&
                !!preparedAccountsPreviewSelection &&
                !!localPreSyncContract &&
                !!localPreSyncDryRun &&
                (localPreSyncDryRun?.blockedCount ?? 0) === 0 &&
                !hasCriticalMissingFields &&
                accountSyncState.phase !== 'loading' &&
                accountSyncState.phase !== 'done';
              const ctaLabel =
                accountSyncState.phase === 'loading' ? 'Sincronizando...'
                : accountSyncState.phase === 'done' ? 'Sincronização concluída'
                : selectedAccountPreviewRows.length === 0 ? 'Selecionar Accounts'
                : !preparedAccountsPreviewSelection ? 'Preparar sincronização'
                : !localPreSyncContract ? 'Preparar sincronização'
                : !localPreSyncDryRun ? 'Validar configuração'
                : (localPreSyncDryRun?.blockedCount ?? 0) > 0 ? 'Resolver bloqueios'
                : hasCriticalMissingFields ? 'Corrigir dados no Salesforce'
                : 'Iniciar sincronização completa';
              const syncResult = accountSyncState.phase === 'done' ? accountSyncState.result : null;
              const syncMicrocopy = syncResult
                ? [
                    syncResult.createdCount > 0 ? `${syncResult.createdCount} criadas` : '',
                    syncResult.updatedCount > 0 ? `${syncResult.updatedCount} atualizadas` : '',
                    syncResult.errorCount > 0 ? `${syncResult.errorCount} erros` : '',
                    syncResult.skippedCount > 0 ? `${syncResult.skippedCount} ignoradas` : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : null;
              return (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={syncReady ? onSync : undefined}
                    disabled={!syncReady || accountSyncState.phase === 'loading'}
                    className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] hover:shadow-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {accountSyncState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {accountSyncState.phase === 'done' && <CheckCircle2 className="h-4 w-4" />}
                    {ctaLabel}
                  </button>
              {syncMicrocopy && (
                <p className="text-[11px] font-medium text-slate-400">{syncMicrocopy}</p>
              )}
                </div>
              );
              })()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
