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
                      onClick={onLoadAccounts}
                      disabled={accountsPreviewLoading}
                      className="w-full rounded-xl border border-slate-100 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-50"
                    >
                      {accountsPreviewLoading ? 'Recarregando...' : 'Recarregar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onLoadAccounts}
                    disabled={accountsPreviewLoading}
                    className="w-full rounded-xl bg-[#4F46E5] py-2.5 text-xs font-black text-white hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    {accountsPreviewLoading ? 'Carregando...' : 'Carregar Accounts'}
                  </button>
                )}

                <div className="flex items-center justify-between opacity-40">
                  <div>
                    <p className="text-sm font-bold">Leads & Contatos</p>
                    <p className="text-[10px] text-slate-400">Perfis e informações de contato</p>
                  </div>
                  <ToggleLeft className="h-6 w-6 text-slate-300" />
                </div>

                <div className="flex items-center justify-between opacity-40">
                  <div>
                    <p className="text-sm font-bold">Oportunidades e Funil</p>
                    <p className="text-[10px] text-slate-400">Rastreie o pipeline de vendas</p>
                  </div>
                  <ToggleLeft className="h-6 w-6 text-slate-300" />
                </div>
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
                      onClick={onLoadAccounts}
                      disabled={accountsPreviewLoading}
                      className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    >
                      Recarregar Accounts
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                  <button
                    onClick={onLoadAccounts}
                    disabled={accountsPreviewLoading}
                    className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] disabled:opacity-50"
                  >
                    {accountsPreviewLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    {accountsPreviewLoading ? 'Carregando...' : 'Carregar Accounts'}
                  </button>
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
                accountSyncState.phase !== 'loading';
              const ctaLabel =
                accountSyncState.phase === 'loading' ? 'Sincronizando...'
                : selectedAccountPreviewRows.length === 0 ? 'Selecionar Accounts'
                : !preparedAccountsPreviewSelection ? 'Preparar sincronização'
                : !localPreSyncContract ? 'Preparar sincronização'
                : !localPreSyncDryRun ? 'Validar configuração'
                : (localPreSyncDryRun?.blockedCount ?? 0) > 0 ? 'Resolver bloqueios'
                : hasCriticalMissingFields ? 'Corrigir dados no Salesforce'
                : 'Iniciar sincronização completa';
              return (
                <button
                  onClick={syncReady ? onSync : undefined}
                  disabled={!syncReady || accountSyncState.phase === 'loading'}
                  className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-8 py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#4338CA] hover:shadow-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                >
                  {accountSyncState.phase === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {ctaLabel}
                </button>
              );
            })()}
          </div>
        </div>
      </footer>
    </div>
  );
}
