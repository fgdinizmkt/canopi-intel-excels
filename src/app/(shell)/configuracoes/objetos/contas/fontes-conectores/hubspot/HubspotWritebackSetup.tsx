'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, PlusCircle, RefreshCw } from 'lucide-react';
import { Badge, Button, Card } from '@/src/components/ui';
import type { HubspotWritebackSetupResult } from '@/src/lib/hubspotWritebackSetupTypes';

interface HubspotWritebackSetupProps {
  token: string;
  connectionActive: boolean;
  companiesReadActive: boolean;
  catalogLoaded: boolean;
  onSetupStateChange: (state: HubspotWritebackSetupResult | null) => void;
}

type SetupFetchPhase = 'idle' | 'verifying' | 'creating' | 'ready' | 'pending' | 'blocked' | 'error';

function statusVariant(phase: SetupFetchPhase) {
  if (phase === 'ready') return 'emerald';
  if (phase === 'blocked' || phase === 'pending') return 'amber';
  if (phase === 'error') return 'red';
  if (phase === 'verifying' || phase === 'creating') return 'blue';
  return 'slate';
}

function fetchSetup(token: string, action: 'verify' | 'create_missing_properties', confirm = false) {
  return fetch('/api/account-connectors/hubspot/writeback/setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tokenKey: token,
      action,
      confirm,
    }),
  });
}

export function HubspotWritebackSetup({
  token,
  connectionActive,
  companiesReadActive,
  catalogLoaded,
  onSetupStateChange,
}: HubspotWritebackSetupProps) {
  const [phase, setPhase] = useState<SetupFetchPhase>('idle');
  const [setupResult, setSetupResult] = useState<HubspotWritebackSetupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const requestSequence = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const runVerify = useCallback(async () => {
    if (!connectionActive || !token.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestSequence.current;

    setError(null);
    setPhase('verifying');

    try {
      const response = await fetchSetup(token, 'verify');
      const payload = await response.json().catch(() => null);
      if (controller.signal.aborted || requestId !== requestSequence.current) return;

      if (!response.ok || !payload || payload.status !== 'success') {
        setSetupResult(null);
        setError(payload?.error || 'Não foi possível validar o setup HubSpot.');
        setPhase('error');
        onSetupStateChange(null);
        return;
      }

      const result = payload as HubspotWritebackSetupResult;
      setSetupResult(result);
      setActionLog(
        result.creationLog?.map((entry) => `${entry.label}: ${entry.message}`) || []
      );
      setPhase(result.ready ? 'ready' : result.blockers.length > 0 ? 'blocked' : 'pending');
      onSetupStateChange(result);
    } catch (caughtError) {
      if (controller.signal.aborted || requestId !== requestSequence.current) return;
      setSetupResult(null);
      setError(caughtError instanceof Error && caughtError.name === 'AbortError'
        ? null
        : 'Não foi possível validar o setup HubSpot.');
      setPhase(caughtError instanceof Error && caughtError.name === 'AbortError' ? 'idle' : 'error');
      onSetupStateChange(null);
    }
  }, [connectionActive, onSetupStateChange, token]);

  const runCreate = useCallback(async () => {
    if (!setupResult) return;
    if (!setupResult.canCreateProperties) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestSequence.current;

    setError(null);
    setPhase('creating');

    try {
      const response = await fetchSetup(token, 'create_missing_properties', true);
      const payload = await response.json().catch(() => null);
      if (controller.signal.aborted || requestId !== requestSequence.current) return;

      if (!response.ok || !payload || payload.status !== 'success') {
        setError(payload?.error || 'Não foi possível criar as propriedades Canopi.');
        setPhase('error');
        return;
      }

      const result = payload as HubspotWritebackSetupResult;
      setSetupResult(result);
      setActionLog(
        result.creationLog?.map((entry) => `${entry.label}: ${entry.message}`) || []
      );
      setPhase(result.ready ? 'ready' : result.blockers.length > 0 ? 'blocked' : 'pending');
      onSetupStateChange(result);
    } catch (caughtError) {
      if (controller.signal.aborted || requestId !== requestSequence.current) return;
      setError(caughtError instanceof Error && caughtError.name === 'AbortError'
        ? null
        : 'Não foi possível criar as propriedades Canopi.');
      setPhase(caughtError instanceof Error && caughtError.name === 'AbortError' ? 'idle' : 'error');
    }
  }, [onSetupStateChange, setupResult, token]);

  useEffect(() => {
    void runVerify();
    return () => {
      abortRef.current?.abort();
    };
  }, [runVerify]);

  useEffect(() => {
    if (!connectionActive) {
      setSetupResult(null);
      setError(null);
      setActionLog([]);
      setPhase('idle');
      onSetupStateChange(null);
    }
  }, [connectionActive, onSetupStateChange]);

  const companySummary = setupResult?.companies;
  const contactSummary = setupResult?.contacts;
  const writeScopesReady = setupResult?.scopeSummary.objectWrite.ready ?? false;
  const schemaWriteReady = setupResult?.scopeSummary.schemaWrite.ready ?? false;
  const idsReady = Boolean(
    companySummary?.uniqueReady &&
    contactSummary?.uniqueReady &&
    !companySummary?.missing.length &&
    !contactSummary?.missing.length &&
    !companySummary?.incompatible.length &&
    !contactSummary?.incompatible.length
  );
  const idsBlocked = Boolean(companySummary?.incompatible.length || contactSummary?.incompatible.length);

  const checklist = useMemo(() => {
    const buildEntry = (label: string, state: 'ready' | 'pending' | 'blocked' | 'error' | 'verifying', description: string) => ({
      label,
      state,
      description,
    });

    return [
      buildEntry('Conexão HubSpot ativa', connectionActive ? 'ready' : 'blocked', connectionActive ? 'Conexão validada nesta sessão.' : 'Conecte o HubSpot primeiro.'),
      buildEntry('Leitura de empresas ativa', companiesReadActive ? 'ready' : 'blocked', companiesReadActive ? 'Leitura de companies confirmada.' : 'Valide a leitura de companies.'),
      buildEntry('Catálogo de campos carregado', catalogLoaded ? 'ready' : 'pending', catalogLoaded ? 'Campos disponíveis para revisão.' : 'Atualize o catálogo de campos antes de criar propriedades.'),
      buildEntry('Permissão de escrita em empresas', writeScopesReady ? 'ready' : 'blocked', writeScopesReady ? 'crm.objects.companies.write disponível.' : 'crm.objects.companies.write ausente.'),
      buildEntry('Permissão de escrita em contatos', writeScopesReady ? 'ready' : 'blocked', writeScopesReady ? 'crm.objects.contacts.write disponível.' : 'crm.objects.contacts.write ausente.'),
      buildEntry('Propriedades Canopi em Companies', companySummary?.ready ? 'ready' : companySummary?.incompatible.length ? 'blocked' : 'pending', companySummary?.ready ? 'Todas as propriedades necessárias estão prontas.' : companySummary?.incompatible.length ? 'Há propriedades incompatíveis em Companies.' : 'Ainda faltam propriedades em Companies.'),
      buildEntry('Propriedades Canopi em Contacts', contactSummary?.ready ? 'ready' : contactSummary?.incompatible.length ? 'blocked' : 'pending', contactSummary?.ready ? 'Todas as propriedades necessárias estão prontas.' : contactSummary?.incompatible.length ? 'Há propriedades incompatíveis em Contacts.' : 'Ainda faltam propriedades em Contacts.'),
      buildEntry('IDs externos únicos configurados', idsReady ? 'ready' : idsBlocked ? 'blocked' : 'pending', idsReady ? 'Canopi Company ID e Canopi Contact ID estão prontos.' : idsBlocked ? 'Os IDs externos têm incompatibilidades e precisam de ajuste.' : 'Os IDs externos ainda precisam ser criados ou validados.'),
    ];
  }, [catalogLoaded, companiesReadActive, companySummary, contactSummary, connectionActive, idsBlocked, idsReady, writeScopesReady]);

  const badgeText = phase === 'verifying'
    ? 'Verificando'
    : phase === 'creating'
      ? 'Criando'
      : phase === 'ready'
        ? 'Pronto'
        : phase === 'blocked'
          ? 'Pendente'
          : phase === 'pending'
            ? 'Pendente'
          : phase === 'error'
            ? 'Erro'
            : 'Aguardando';

  return (
    <Card className="border border-slate-200 bg-white">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pré-requisitos para atualização do HubSpot</p>
            <h3 className="text-2xl font-black text-slate-950">HubSpot pronto para atualização</h3>
            <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
              A atualização do HubSpot só será liberada depois que o HubSpot tiver permissões de escrita e propriedades Canopi configuradas.
            </p>
          </div>
          <Badge variant={statusVariant(phase)}>{badgeText}</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {checklist.map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-slate-900">{entry.label}</p>
                <Badge
                  variant={
                    entry.state === 'ready'
                      ? 'emerald'
                      : entry.state === 'blocked'
                        ? 'red'
                        : entry.state === 'error'
                          ? 'red'
                          : entry.state === 'verifying'
                            ? 'blue'
                            : 'amber'
                  }
                >
                  {entry.state === 'ready'
                    ? 'Pronto'
                    : entry.state === 'blocked'
                      ? 'Bloqueado'
                      : entry.state === 'error'
                        ? 'Erro'
                        : entry.state === 'verifying'
                          ? 'Verificando'
                          : 'Pendente'}
                </Badge>
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{entry.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Companies</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {companySummary?.ready ? 'Prontas para atualização' : 'Aguardando ajustes'}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {companySummary?.missing.length ? `${companySummary.missing.length} propriedade(s) ausente(s).` : 'Sem propriedades ausentes.'}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Unicidade: {companySummary?.uniqueReady ? 'ok' : 'pendente'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contacts</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {contactSummary?.ready ? 'Prontos para atualização' : 'Aguardando ajustes'}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {contactSummary?.missing.length ? `${contactSummary.missing.length} propriedade(s) ausente(s).` : 'Sem propriedades ausentes.'}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Unicidade: {contactSummary?.uniqueReady ? 'ok' : 'pendente'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ações</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={() => { void runVerify(); }}
                disabled={!connectionActive || phase === 'verifying' || phase === 'creating'}
                icon={phase === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              >
                Verificar configuração HubSpot
              </Button>
              <Button
                variant="outline"
                onClick={() => { void runCreate(); }}
                disabled={!connectionActive || !setupResult || !setupResult.canCreateProperties || phase === 'creating' || phase === 'verifying' || !schemaWriteReady}
                icon={phase === 'creating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              >
                Criar propriedades Canopi no HubSpot
              </Button>
              <Button
                variant="ghost"
                onClick={() => { void runVerify(); }}
                disabled={!connectionActive || phase === 'verifying' || phase === 'creating'}
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                Revalidar setup
              </Button>
            </div>
          </div>
        </div>

        {setupResult?.issues.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pontos a revisar</p>
            <ul className="mt-2 space-y-1 text-sm font-medium leading-relaxed text-slate-700">
              {setupResult.issues.slice(0, 6).map((issue) => (
                <li key={`${issue.objectType}-${issue.title}`}>
                  • <span className="font-semibold text-slate-900">{issue.title}:</span> {issue.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {actionLog.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Log da última ação</p>
            <ul className="mt-2 space-y-1 text-sm font-medium text-slate-700">
              {actionLog.slice(0, 6).map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <div>{error}</div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
