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
  type ConnectorType,
} from '@/src/lib/contaConnectorsV2';
import { getAccountConnectorAdapter } from '@/src/lib/accountConnectorAdapters';

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

function getMetadataStatusLabel(status: string): string {
  switch (status) {
    case 'not_discovered': return 'Metadados não descobertos';
    case 'ready_to_discover': return 'Pronto para descobrir metadados';
    case 'discovering': return 'Descobrindo metadados';
    case 'discovered': return 'Metadados descobertos';
    case 'failed': return 'Falha na descoberta';
    default: return status;
  }
}

function getSyncStatusLabel(status: string): string {
  switch (status) {
    case 'not_available': return 'Não disponível';
    case 'not_configured': return 'Não configurado';
    case 'ready': return 'Pronto';
    case 'running': return 'Executando';
    case 'succeeded': return 'Concluído com sucesso';
    case 'failed': return 'Falhou';
    case 'stale': return 'Desatualizado';
    default: return status;
  }
}

function ConnectorLogo({ type, isActive }: { type: ConnectorType; isActive: boolean }) {
  const brands: Record<ConnectorType, { abbr: string; color: string }> = {
    salesforce: { abbr: 'SF',  color: 'text-sky-600' },
    hubspot:    { abbr: 'HS',  color: 'text-orange-500' },
    rd_station: { abbr: 'RD',  color: 'text-blue-600' },
    csv_upload: { abbr: 'CSV', color: 'text-emerald-600' },
    other_crm:  { abbr: '?',   color: 'text-slate-500' },
  };
  const { abbr, color } = brands[type];
  return (
    <span className={`text-sm font-black tracking-tight leading-none ${isActive ? 'text-white' : color}`}>
      {abbr}
    </span>
  );
}

function getIngestMethod(type: ConnectorType): string {
  switch (type) {
    case 'salesforce': return 'Método futuro previsto: API + OAuth 2.0';
    case 'hubspot':    return 'Método futuro previsto: Private App API';
    case 'rd_station': return 'Método futuro previsto: API + Token';
    case 'csv_upload': return 'Método atual: upload local em lote (arquivo)';
    case 'other_crm':  return 'Método futuro previsto: API, banco ou middleware';
  }
}

function getIntegrationLabel(type: ConnectorType): string {
  switch (type) {
    case 'salesforce': return 'CRM nativo';
    case 'hubspot':    return 'CRM nativo';
    case 'rd_station': return 'CRM operacional';
    case 'csv_upload': return 'Upload em lote';
    case 'other_crm':  return 'Setup semiassistido';
  }
}

function getDomainField(type: ConnectorType): string | null {
  switch (type) {
    case 'salesforce': return 'Website';
    case 'hubspot':    return 'domain';
    case 'rd_station': return 'website';
    case 'csv_upload': return 'website / domínio';
    case 'other_crm':  return null;
  }
}

function getConnectorName(type: ConnectorType, customName?: string): string {
  if (type === 'other_crm' && customName?.trim()) return customName.trim();
  return CONNECTOR_PRESETS[type].name;
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

  const canValidateLocally = Boolean(selectedConnector) && (
    selectedConnector !== 'other_crm' ||
    Boolean(
      customConfig.customName?.trim() &&
      customConfig.customNativeObject?.trim() &&
      customConfig.customPrimaryKey?.trim()
    )
  );

  const domainField = selectedConnector ? getDomainField(selectedConnector) : null;

  return (
    <section id="fontes" className="space-y-10">
      <header className="space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">2. Fontes e Conectores</h2>
        <p className="text-lg text-slate-500 max-w-3xl font-medium">
          Esta etapa define a origem da base de contas. Ela não cria contas manualmente.
        </p>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          Esta etapa ainda não conecta ao CRM externo. A seleção abaixo apenas define a fonte local/simulada e o contrato de leitura
          que será usado pela Camada Canônica. OAuth, token, chamada de API e sincronização real serão tratados em um recorte futuro
          de conexão real.
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-900">
            Defina de onde o Canopi vai ler a base de contas em lote no setup local.
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700">
            O mapeamento técnico de campos será feito na etapa <strong>Camada Canônica</strong>.
          </div>
        </div>
      </header>

      {/* Grid de seleção de origem */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">
          Escolha a origem das contas
        </h3>

        <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2">
          {connectorTypes.map(type => {
            const preset = CONNECTOR_PRESETS[type];
            const isActive = conta.connectorType === type;
            const name = CONNECTOR_PRESETS[type].name;

            return (
              <Card
                key={type}
                className={`h-full border-2 p-0 transition-all ${
                  isActive
                    ? 'border-blue-600 ring-4 ring-blue-50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isActive ? 'bg-blue-600 shadow-lg' : 'bg-slate-100'
                        }`}
                      >
                        <ConnectorLogo type={type} isActive={isActive} />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                            {name}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                            {getIntegrationLabel(type)}
                          </p>
                        </div>
                        <Badge
                          className={`border-none text-[8px] font-black ${
                            preset.identity.confidenceScore > 90
                              ? 'bg-emerald-100 text-emerald-700'
                              : preset.identity.confidenceScore > 75
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Confiança: {preset.identity.confidenceScore}%
                        </Badge>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="rounded-xl px-4 py-2 text-[10px] font-black uppercase bg-blue-100 text-blue-700 select-none">
                        Fonte local escolhida
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConnector(type)}
                        className="rounded-xl px-4 py-2 text-[10px] font-black uppercase bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-700"
                      >
                        Usar como fonte local
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3 text-xs font-bold text-slate-600">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">
                        Entidade nativa
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                        <Info className="h-4 w-4 text-slate-400" />
                        {preset.nativeObject || 'A definir no setup'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">
                        Chave primária
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        {preset.identity.nativePrimaryKey || 'A definir'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.26em] text-slate-400">
                        Método de ingestão
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                        <Zap className="h-4 w-4 text-slate-400" />
                        {getIngestMethod(type)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs font-medium text-slate-400">
        Selecionar uma fonte não conecta CRM externo. Esta etapa apenas prepara o contrato local para as próximas revisões.
      </p>

      <Card className="border border-slate-200 p-5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-4">
          Estado da etapa atual
        </h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Fonte local</p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {selectedConnector ? 'Configurada' : 'Não configurada'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Contrato local da fonte</p>
            <p className="mt-2 text-sm font-black text-slate-900">
              {connectorLocalValidated ? 'Validado' : 'Pendente'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Conexão real</p>
            <p className="mt-2 text-sm font-black text-slate-900">Não implementada nesta etapa</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Sincronização real</p>
            <p className="mt-2 text-sm font-black text-slate-900">Não implementada nesta etapa</p>
          </div>
        </div>
      </Card>

      {/* Painel de contrato de leitura */}
      <Card className="border border-slate-200 p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                Contrato de leitura da fonte
              </p>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                {activePreset ? getConnectorName(selectedConnector as ConnectorType, conta.customName) : 'Selecione uma fonte para continuar'}
              </h3>
              <p className="max-w-3xl text-sm font-medium text-slate-600">
                Os campos abaixo descrevem a estrutura da fonte. O mapeamento técnico será feito na etapa Camada Canônica.
              </p>
            </div>
            {activePreset && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-900 shrink-0">
                Origem: {getIntegrationLabel(selectedConnector as ConnectorType)}
              </div>
            )}
          </div>
        </div>

        {!activePreset ? (
          <div className="px-6 py-10">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-sm font-medium text-slate-500">
              Escolha uma fonte no grid acima para abrir o contrato de leitura.
            </div>
          </div>
        ) : (
          <div className="space-y-8 px-6 py-6">

            {/* Setup semiassistido (other_crm) — apenas campos do sourceContract */}
            {selectedConnector === 'other_crm' && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
                    Identificar a fonte de contas
                  </h4>
                </div>
                <p className="mb-6 max-w-3xl text-sm font-medium text-slate-700">
                  Informe os dados mínimos da ferramenta para que o Canopi saiba de onde ler a base de contas em lote.
                  Dedupe, mapeamento de campos e política de conflito serão configurados nas etapas seguintes.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Nome da ferramenta
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pipedrive"
                      value={customConfig.customName || ''}
                      onChange={(e) => updateCustomConfig({ customName: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Objeto/entidade de contas
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Organizations"
                      value={conta.nativeObject || ''}
                      onChange={(e) => updateCustomConfig({ customNativeObject: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Chave primária da entidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: org_id"
                      value={conta.primaryKey || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateCustomConfig({
                          customPrimaryKey: value,
                          primaryKeys: [value],
                        });
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition-all focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resumo do contrato de leitura */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400 mb-4">
                Resumo do contrato de leitura
              </h4>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Fonte selecionada</p>
                  <p className="mt-2 text-base font-black text-slate-900">{getConnectorName(selectedConnector as ConnectorType, conta.customName)}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{getIntegrationLabel(selectedConnector as ConnectorType)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Entidade / objeto de origem</p>
                  <p className="mt-2 text-base font-black text-slate-900">{conta.nativeObject || '—'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Entidade lida em lote pela integração.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Chave primária nativa</p>
                  <p className="mt-2 text-base font-black text-slate-900">{conta.primaryKey || '—'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Identificador nativo da entidade de contas.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Campo de domínio corporativo</p>
                  <p className="mt-2 text-base font-black text-slate-900">{domainField ?? '—'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {domainField ? 'Detectado no preset da fonte.' : 'Não detectado. Definir em Identidade/Dedupe.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Método esperado para conexão real futura</p>
                  <p className="mt-2 text-base font-black text-slate-900">{getIngestMethod(selectedConnector as ConnectorType)}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Referência para recorte futuro de conexão real.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Conexão real</p>
                  <p className="mt-2 flex items-center gap-2 text-base font-black text-slate-900">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Não implementada nesta etapa
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Sem OAuth, token, chamada de API ou backend real nesta etapa.</p>
                </div>
              </div>
            </div>

            {/* Fatos da fonte (conectores nativos) */}
            {activeAdapter && realConnectionContract && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-2 mb-5">
                  <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                    Modelo de conexão real futura
                  </h4>
                  <p className="text-sm font-medium text-slate-600">
                    Este bloco descreve a arquitetura esperada para conexão real futura. Nenhuma credencial é solicitada ou armazenada nesta etapa.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Autenticação prevista</p>
                    <p className="mt-2 text-sm font-black text-slate-900">{getAuthTypeLabel(realConnectionContract.authType)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Status atual</p>
                    <p className="mt-2 text-sm font-black text-slate-900">{getConnectionStatusLabel(realConnectionContract.connectionStatus)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Sincronização planejada</p>
                    <p className="mt-2 text-sm font-black text-slate-900">{getSyncStatusLabel(realConnectionContract.syncStatus)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Metadados</p>
                    <p className="mt-2 text-sm font-black text-slate-900">{getMetadataStatusLabel(realConnectionContract.metadataStatus)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Campos customizados</p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {realConnectionContract.supportsCustomFields ? 'Suportado no modelo' : 'Não suportado no modelo'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Refresh token</p>
                    <p className="mt-2 text-sm font-black text-slate-900">
                      {realConnectionContract.supportsRefreshToken ? 'Previsto no modelo' : 'Não aplicável no modelo'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Escopos mínimos (least privilege)</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {realConnectionContract.requiredScopes.length === 0 && (
                        <span className="text-sm font-medium text-slate-500">Sem escopo obrigatório nesta origem.</span>
                      )}
                      {realConnectionContract.requiredScopes.map((scope) => (
                        <span key={scope} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Escopos opcionais</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {realConnectionContract.optionalScopes.length === 0 && (
                        <span className="text-sm font-medium text-slate-500">Sem escopos opcionais definidos.</span>
                      )}
                      {realConnectionContract.optionalScopes.map((scope) => (
                        <span key={scope} className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Objetos prioritários (primeiro teste)</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeAdapter.priorityObjectsForFirstTest.map((objectName) => (
                        <span key={objectName} className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                          {objectName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Objetos futuros previstos</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeAdapter.futureObjectsPlanned.length === 0 && (
                        <span className="text-sm font-medium text-slate-500">Sem objetos adicionais previstos.</span>
                      )}
                      {activeAdapter.futureObjectsPlanned.map((objectName) => (
                        <span key={objectName} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700">
                          {objectName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-700">Próximo recorte técnico</p>
                  <p className="mt-2 text-sm font-medium text-amber-900">{activeAdapter.nextRecommendedStep}</p>
                </div>
              </div>
            )}

            {selectedConnector !== 'other_crm' && activePreset.instructions.factsAboutConnector.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h4 className="text-xs font-black uppercase tracking-[0.28em] text-slate-400 mb-4">
                  Fatos da fonte
                </h4>
                <div className="space-y-3">
                  {activePreset.instructions.factsAboutConnector.map((fact, idx) => (
                    <div key={idx} className="flex gap-3 text-sm font-medium text-slate-600">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validação do contrato local */}
            <div className={`rounded-2xl border p-5 ${
              connectorLocalValidated
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-slate-200 bg-white'
            }`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
                    Contrato local da fonte
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {connectorLocalValidated
                      ? 'Contrato local da fonte validado. A origem, entidade e chave primária foram revisadas nesta sessão.'
                      : 'Revise os dados acima e confirme o contrato de leitura local antes de avançar.'}
                  </p>
                  <p className="text-xs font-medium text-slate-400 italic">
                    Isto não executa OAuth, token, chamada de API ou sincronização real com o sistema externo.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canValidateLocally || connectorLocalValidated}
                  onClick={() => setConnectorLocalValidated(true)}
                  className={`shrink-0 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    connectorLocalValidated
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : canValidateLocally
                        ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {connectorLocalValidated ? '✓ Contrato local da fonte validado' : 'Validar contrato local da fonte'}
                </button>
              </div>
            </div>

            {/* Aviso operacional */}
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
                    Próximas etapas
                  </h4>
                  <ul className="space-y-1 text-sm font-medium text-amber-900">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      Identidade e Dedupe: chaves, domínio corporativo e política de conflito.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                      Camada Canônica: mapeamento técnico dos campos da fonte para o modelo Canopi.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}
      </Card>
    </section>
  );
}
