'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Database, FileSearch, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card } from '@/src/components/ui';

type ValidationPhase = 'idle' | 'loading' | 'success' | 'missing_config' | 'credential_error' | 'api_error';
type RequestPhase = 'idle' | 'loading' | 'success' | 'error';

interface HubspotTestResult {
  status: 'success';
  provider: 'hubspot';
  testedAt: string;
  hubId: string | null;
  scopes: string[];
  readAccessConfirmed: boolean;
}

interface HubspotPreviewCompany {
  id: string;
  name: string | null;
  domain: string | null;
  industry: string | null;
  country: string | null;
  ownerId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface HubspotPreviewResult {
  status: 'success';
  provider: 'hubspot';
  loadedAt: string;
  count: number;
  companies: HubspotPreviewCompany[];
}

interface HubspotSchemaProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description: string | null;
  groupName: string | null;
  hidden: boolean;
  calculated: boolean;
  readOnlyValue: boolean;
  readOnlyDefinition: boolean;
  hasUniqueValue: boolean;
  optionCount: number;
  referencedObjectType: string | null;
}

interface HubspotSchemaMapping {
  hubspotField: string;
  hubspotLabel: string;
  canopiField: string;
  canopiLabel: string;
  confidence: 'alta' | 'média' | 'baixa';
  status: 'encontrado' | 'ausente';
}

interface HubspotSchemaResult {
  status: 'success';
  provider: 'hubspot';
  loadedAt: string;
  count: number;
  properties: HubspotSchemaProperty[];
  suggestedMappings: HubspotSchemaMapping[];
  missingRecommendedFields: HubspotSchemaMapping[];
}

interface ValidationState {
  phase: ValidationPhase;
  message: string;
  data: HubspotTestResult | null;
  validatedToken: string | null;
  updatedAt: string | null;
}

interface RequestState<T> {
  phase: RequestPhase;
  data: T | null;
  error: string | null;
  updatedAt: string | null;
}

function createRequestState<T>(): RequestState<T> {
  return {
    phase: 'idle',
    data: null,
    error: null,
    updatedAt: null,
  };
}

function formatTimestamp(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function mapHubspotError(status: number | null) {
  if (status === 400) {
    return { phase: 'missing_config' as const, message: 'Private App token não informado. Informe uma credencial válida da HubSpot para validar o acesso de leitura.' };
  }
  if (status === 401 || status === 403) {
    return { phase: 'credential_error' as const, message: 'Não foi possível validar o token. Revise se o Private App token está correto e se possui permissão de leitura para empresas.' };
  }
  return { phase: 'api_error' as const, message: 'Não foi possível consultar a HubSpot agora. Verifique a conexão e tente novamente.' };
}

async function postJson<T>(url: string, token: string): Promise<{ ok: boolean; status: number; payload: T | { error?: string; status?: string } }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenKey: token }),
  });

  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

export default function HubSpotPage() {
  const [token, setToken] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>({
    phase: 'idle',
    message: '',
    data: null,
    validatedToken: null,
    updatedAt: null,
  });
  const [previewState, setPreviewState] = useState<RequestState<HubspotPreviewResult>>(createRequestState<HubspotPreviewResult>());
  const [schemaState, setSchemaState] = useState<RequestState<HubspotSchemaResult>>(createRequestState<HubspotSchemaResult>());

  const normalizedToken = token.trim();
  const hasToken = normalizedToken.length > 0;
  const accessValidated = validationState.phase === 'success' && validationState.validatedToken === normalizedToken;
  const previewRows = previewState.data?.companies.slice(0, 5) ?? [];
  const schemaRows = schemaState.data?.suggestedMappings.slice(0, 8) ?? [];
  const missingRows = schemaState.data?.missingRecommendedFields.slice(0, 5) ?? [];

  useEffect(() => {
    if (validationState.phase === 'success' && validationState.validatedToken && validationState.validatedToken !== normalizedToken) {
      setValidationState({
        phase: hasToken ? 'idle' : 'missing_config',
        message: hasToken
          ? 'Token alterado. Valide o acesso novamente antes de continuar.'
          : 'Private App token não informado. Informe uma credencial válida da HubSpot para validar o acesso de leitura.',
        data: null,
        validatedToken: null,
        updatedAt: null,
      });
      setPreviewState(createRequestState<HubspotPreviewResult>());
      setSchemaState(createRequestState<HubspotSchemaResult>());
    }
  }, [hasToken, normalizedToken, validationState.phase, validationState.validatedToken]);

  const mainStatus = useMemo(() => {
    if (!hasToken) {
      return {
        label: 'Configuração incompleta',
        tone: 'amber' as const,
        message: 'Erro de configuração obrigatória ausente. Private App token não informado. Informe uma credencial válida da HubSpot para validar o acesso de leitura.',
      };
    }

    if (validationState.phase === 'loading') {
      return { label: 'Validando acesso', tone: 'blue' as const, message: 'Aguarde a resposta da HubSpot.' };
    }

    if (validationState.phase === 'success' && accessValidated) {
      return { label: 'Acesso validado', tone: 'emerald' as const, message: 'Acesso validado para leitura nesta sessão.' };
    }

    if (validationState.phase === 'credential_error') {
      return { label: 'Falha na validação da credencial', tone: 'red' as const, message: validationState.message };
    }

    if (validationState.phase === 'api_error') {
      return { label: 'Erro de consulta à HubSpot', tone: 'red' as const, message: validationState.message };
    }

    return {
      label: 'Pronto para validar',
      tone: 'blue' as const,
      message: 'Token informado. Valide o acesso antes de carregar empresas e campos.',
    };
  }, [accessValidated, hasToken, validationState.message, validationState.phase]);

  const canPreview = accessValidated;
  const canAnalyze = accessValidated;

  const validateAccess = useCallback(async () => {
    if (!hasToken) {
      setValidationState({
        phase: 'missing_config',
        message: 'Private App token não informado. Informe uma credencial válida da HubSpot para validar o acesso de leitura.',
        data: null,
        validatedToken: null,
        updatedAt: new Date().toISOString(),
      });
      setPreviewState(createRequestState<HubspotPreviewResult>());
      setSchemaState(createRequestState<HubspotSchemaResult>());
      return;
    }

    setValidationState((current) => ({ ...current, phase: 'loading', message: 'Validando acesso...' }));

    try {
      const { ok, status, payload } = await postJson<HubspotTestResult>('/api/account-connectors/hubspot/test', normalizedToken);
      if (!ok || payload.status !== 'success') {
        const mapped = mapHubspotError(status);
        setValidationState({
          phase: mapped.phase,
          message: mapped.message,
          data: null,
          validatedToken: null,
          updatedAt: new Date().toISOString(),
        });
        setPreviewState(createRequestState<HubspotPreviewResult>());
        setSchemaState(createRequestState<HubspotSchemaResult>());
        return;
      }

      setValidationState({
        phase: 'success',
        message: 'Acesso validado para leitura nesta sessão.',
        data: payload as HubspotTestResult,
        validatedToken: normalizedToken,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setValidationState({
        phase: 'api_error',
        message: 'Não foi possível consultar a HubSpot agora. Verifique a conexão e tente novamente.',
        data: null,
        validatedToken: null,
        updatedAt: new Date().toISOString(),
      });
      setPreviewState(createRequestState<HubspotPreviewResult>());
      setSchemaState(createRequestState<HubspotSchemaResult>());
    }
  }, [hasToken, normalizedToken]);

  const loadPreview = useCallback(async () => {
    if (!canPreview) {
      setPreviewState({
        phase: 'error',
        data: null,
        error: 'Valide o acesso antes de pré-visualizar empresas.',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    setPreviewState((current) => ({ ...current, phase: 'loading', error: null }));

    try {
      const { ok, status, payload } = await postJson<HubspotPreviewResult>('/api/account-connectors/hubspot/preview', normalizedToken);
      if (!ok || payload.status !== 'success') {
        const mapped = mapHubspotError(status);
        setPreviewState({
          phase: 'error',
          data: null,
          error: mapped.message,
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      setPreviewState({
        phase: 'success',
        data: payload as HubspotPreviewResult,
        error: null,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setPreviewState({
        phase: 'error',
        data: null,
        error: 'Não foi possível consultar a HubSpot agora. Verifique a conexão e tente novamente.',
        updatedAt: new Date().toISOString(),
      });
    }
  }, [canPreview, normalizedToken]);

  const loadSchema = useCallback(async () => {
    if (!canAnalyze) {
      setSchemaState({
        phase: 'error',
        data: null,
        error: 'Valide o acesso antes de analisar campos.',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    setSchemaState((current) => ({ ...current, phase: 'loading', error: null }));

    try {
      const { ok, status, payload } = await postJson<HubspotSchemaResult>('/api/account-connectors/hubspot/schema', normalizedToken);
      if (!ok || payload.status !== 'success') {
        const mapped = mapHubspotError(status);
        setSchemaState({
          phase: 'error',
          data: null,
          error: mapped.message,
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      setSchemaState({
        phase: 'success',
        data: payload as HubspotSchemaResult,
        error: null,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setSchemaState({
        phase: 'error',
        data: null,
        error: 'Não foi possível consultar a HubSpot agora. Verifique a conexão e tente novamente.',
        updatedAt: new Date().toISOString(),
      });
    }
  }, [canAnalyze, normalizedToken]);

  const tokenStatusTone = mainStatus.tone === 'emerald' ? 'emerald' : mainStatus.tone === 'red' ? 'red' : mainStatus.tone === 'amber' ? 'amber' : 'blue';
  const tokenStatusPanelClassName = tokenStatusTone === 'emerald'
    ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
    : tokenStatusTone === 'red'
      ? 'border-red-100 bg-red-50 text-red-950'
      : tokenStatusTone === 'amber'
        ? 'border-amber-100 bg-amber-50 text-amber-950'
        : 'border-blue-100 bg-blue-50 text-blue-950';

  return (
    <div className="space-y-10">
      <Link
        href="/configuracoes/objetos/contas/fontes-conectores"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Loja de Conectores
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex h-12 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-1 shadow-sm shadow-slate-100">
            <Image
              src="/integrations/logos/Hubspot_logo.png"
              alt="HubSpot"
              width={112}
              height={28}
              className="h-auto max-h-7 w-auto max-w-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">HubSpot</h1>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
              Conecte sua conta, valide o acesso de leitura e veja uma amostra de empresas e campos disponíveis antes de avançar.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">Acesso de leitura</Badge>
            <Badge variant="slate">Pré-visualização</Badge>
            <Badge variant="slate">Análise de campos</Badge>
            <Badge variant="slate">Sem gravação</Badge>
          </div>
          <p className="mt-3 max-w-4xl text-sm font-medium leading-relaxed text-slate-600">
            Nenhum dado será gravado na Canopi nesta etapa. Nenhuma credencial será salva nesta etapa. Esta etapa não altera dados na HubSpot.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border border-slate-200">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conectar HubSpot</p>
              <h2 className="text-2xl font-black text-slate-900">Use um token para liberar a leitura</h2>
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Use um Private App token para validar o acesso de leitura da sua conta HubSpot antes de abrir empresas e analisar campos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">O que esta etapa faz</p>
              <ul className="mt-2 space-y-1 text-sm font-medium text-slate-700">
                <li>• Valida o acesso de leitura</li>
                <li>• Mostra uma amostra de empresas</li>
                <li>• Lista campos úteis para mapeamento</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">O que ainda não acontece</p>
              <ul className="mt-2 space-y-1 text-sm font-medium text-slate-700">
                <li>• Não sincroniza dados</li>
                <li>• Não grava empresas na Canopi</li>
                <li>• Não altera dados na HubSpot</li>
                <li>• Não salva credenciais</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Próximo passo</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-blue-950">
                Informe o token, valide o acesso e então use as ações de empresas e campos.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Token e validação</p>
                <h2 className="text-2xl font-black text-slate-900">Validação de acesso</h2>
                <p className="text-sm font-medium leading-relaxed text-slate-600">
                  {mainStatus.message}
                </p>
              </div>
              <Badge variant={tokenStatusTone}>
                {mainStatus.label}
              </Badge>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Private App token</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                type="password"
                placeholder="Cole o Private App token da HubSpot"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <div className={`rounded-2xl border p-4 ${tokenStatusPanelClassName}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Estado da configuração</p>
              <p className="mt-1 text-sm font-semibold">{mainStatus.label}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed">{mainStatus.message}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={validateAccess}
                disabled={validationState.phase === 'loading'}
                icon={validationState.phase === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              >
                Validar acesso
              </Button>
              <Button
                variant="outline"
                onClick={loadPreview}
                disabled={!canPreview || previewState.phase === 'loading'}
                icon={previewState.phase === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              >
                Pré-visualizar empresas
              </Button>
              <Button
                variant="secondary"
                onClick={loadSchema}
                disabled={!canAnalyze || schemaState.phase === 'loading'}
                icon={schemaState.phase === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
              >
                Analisar campos
              </Button>
            </div>

            <p className="text-xs font-medium leading-relaxed text-slate-500">
              Se o token estiver ausente ou incorreto, a mensagem acima explica exatamente o bloqueio.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Validação</p>
              <h3 className="text-xl font-black text-slate-900">Acesso</h3>
            </div>
            <Badge variant={validationState.phase === 'success' ? 'emerald' : validationState.phase === 'loading' ? 'blue' : validationState.phase === 'credential_error' || validationState.phase === 'api_error' ? 'red' : hasToken ? 'blue' : 'amber'}>
              {!hasToken
                ? 'Configuração incompleta'
                : validationState.phase === 'success'
                  ? 'Acesso validado'
                  : validationState.phase === 'loading'
                    ? 'Validando'
                    : validationState.phase === 'credential_error'
                      ? 'Falha'
                      : validationState.phase === 'api_error'
                        ? 'Erro'
                        : 'Pronto para validar'}
            </Badge>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {!hasToken ? (
              <p>Erro de configuração obrigatória ausente: Private App token não informado.</p>
            ) : validationState.phase === 'loading' ? (
              <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando acesso...
              </div>
            ) : validationState.phase === 'success' && validationState.data ? (
              <>
                <p><span className="font-semibold text-slate-900">Hub ID:</span> {validationState.data.hubId || 'não informado'}</p>
                <p><span className="font-semibold text-slate-900">Scopes:</span> {validationState.data.scopes.length ? validationState.data.scopes.join(', ') : '—'}</p>
                <p><span className="font-semibold text-slate-900">Leitura confirmada:</span> {validationState.data.readAccessConfirmed ? 'sim' : 'não'}</p>
                <p className="text-xs text-slate-500">Validado em {formatTimestamp(validationState.updatedAt ?? validationState.data.testedAt)}</p>
              </>
            ) : validationState.phase === 'credential_error' || validationState.phase === 'api_error' ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
                {validationState.message}
              </div>
            ) : (
              <p>Valide o acesso para liberar a pré-visualização de empresas e a análise de campos.</p>
            )}
          </div>
        </Card>

        <Card className="border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Empresas</p>
              <h3 className="text-xl font-black text-slate-900">Pré-visualização de empresas</h3>
            </div>
            <Badge variant={!canPreview ? 'slate' : previewState.phase === 'success' ? 'emerald' : previewState.phase === 'loading' ? 'blue' : previewState.phase === 'error' ? 'red' : 'blue'}>
              {!canPreview ? 'Bloqueado' : previewState.phase === 'success' ? `${previewState.data?.count ?? 0} carregadas` : previewState.phase === 'loading' ? 'Carregando' : previewState.phase === 'error' ? 'Falha' : 'Pronto'}
            </Badge>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {!canPreview ? (
              <p className="text-slate-600">Valide o acesso antes de pré-visualizar empresas.</p>
            ) : previewState.phase === 'idle' ? (
              <p className="text-slate-600">Clique para carregar uma amostra de empresas da HubSpot.</p>
            ) : previewState.phase === 'loading' ? (
              <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : previewState.phase === 'error' ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
                {previewState.error}
              </div>
            ) : previewState.data ? (
              <>
                <p className="text-slate-700">{previewState.data.count} empresa(s) carregada(s) para leitura em {formatTimestamp(previewState.updatedAt ?? previewState.data.loadedAt)}.</p>
                {previewRows.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="px-3 py-2 font-bold uppercase tracking-widest">Nome</th>
                          <th className="px-3 py-2 font-bold uppercase tracking-widest">Domínio</th>
                          <th className="px-3 py-2 font-bold uppercase tracking-widest">Setor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {previewRows.map((company) => (
                          <tr key={company.id}>
                            <td className="px-3 py-2 font-medium text-slate-900">{company.name || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{company.domain || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{company.industry || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">Preview vazio retornado pela API.</p>
                )}
              </>
            ) : null}
          </div>
        </Card>

        <Card className="border border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Campos</p>
              <h3 className="text-xl font-black text-slate-900">Análise de campos</h3>
            </div>
            <Badge variant={!canAnalyze ? 'slate' : schemaState.phase === 'success' ? 'emerald' : schemaState.phase === 'loading' ? 'blue' : schemaState.phase === 'error' ? 'red' : 'blue'}>
              {!canAnalyze ? 'Bloqueado' : schemaState.phase === 'success' ? `${schemaState.data?.count ?? 0} propriedades` : schemaState.phase === 'loading' ? 'Analisando' : schemaState.phase === 'error' ? 'Falha' : 'Pronto'}
            </Badge>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {!canAnalyze ? (
              <p className="text-slate-600">Valide o acesso antes de analisar campos.</p>
            ) : schemaState.phase === 'idle' ? (
              <p className="text-slate-600">Clique para analisar campos de empresas disponíveis para mapeamento.</p>
            ) : schemaState.phase === 'loading' ? (
              <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando...
              </div>
            ) : schemaState.phase === 'error' ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
                {schemaState.error}
              </div>
            ) : schemaState.data ? (
              <>
                <p className="text-slate-700">{schemaState.data.count} propriedade(s) identificada(s) em {formatTimestamp(schemaState.updatedAt ?? schemaState.data.loadedAt)}.</p>
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-bold uppercase tracking-widest">HubSpot</th>
                        <th className="px-3 py-2 font-bold uppercase tracking-widest">Canopi</th>
                        <th className="px-3 py-2 font-bold uppercase tracking-widest">Confiança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {schemaRows.map((mapping) => (
                        <tr key={`${mapping.hubspotField}-${mapping.canopiField}`}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{mapping.hubspotLabel}</p>
                            <p className="text-[11px] text-slate-500">{mapping.hubspotField}</p>
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{mapping.canopiLabel}</p>
                            <p className="text-[11px] text-slate-500">{mapping.canopiField}</p>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant={mapping.confidence === 'alta' ? 'emerald' : mapping.confidence === 'média' ? 'amber' : 'slate'}>
                              {mapping.confidence}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {missingRows.length > 0 && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Campos recomendados ausentes</p>
                    <ul className="mt-2 space-y-1 text-sm font-medium text-amber-950">
                      {missingRows.map((mapping) => (
                        <li key={`${mapping.hubspotField}-${mapping.canopiField}`}>• {mapping.hubspotLabel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Segurança desta etapa</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-medium leading-relaxed text-slate-700">
            <li>• Nenhum dado será gravado na Canopi nesta etapa.</li>
            <li>• Nenhuma credencial será salva nesta etapa.</li>
            <li>• Esta etapa não altera dados na HubSpot.</li>
          </ul>
        </Card>

        <Card className="border border-slate-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-700" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Leitura útil</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Permissão mínima</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Leitura de empresas</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Campos úteis</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Nome, domínio, setor e responsável</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Próxima ação</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-blue-950">
          Informe o token, valide o acesso e então pré-visualize empresas ou analise campos. O fluxo é de leitura e não grava nada.
        </p>
      </div>
    </div>
  );
}
