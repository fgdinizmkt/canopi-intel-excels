"use client";

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Filter,
  Plus,
  Search,
  UserPlus,
  Zap,
  Link2,
  XCircle,
} from 'lucide-react';
import * as mockData from '../data/mockData';

type Priority = 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';
type SlaStatus = 'vencido' | 'alerta' | 'ok';

interface ActionViewModel {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  accountName: string;
  ownerName: string;
  source: string;
  slaText: string;
  slaStatus: SlaStatus;
  stage: string;
  recommendedAction: string;
  nextStep: string;
  impact: string;
}

interface KPIViewModel {
  label: string;
  value: string;
  helper: string;
}

const priorityOrder: Priority[] = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA'];

const priorityClasses: Record<Priority, { pill: string; border: string }> = {
  CRÍTICA: {
    pill: 'bg-red-50 text-red-700 border-red-200',
    border: 'border-l-red-500',
  },
  ALTA: {
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-l-blue-600',
  },
  MÉDIA: {
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-l-amber-500',
  },
  BAIXA: {
    pill: 'bg-slate-50 text-slate-700 border-slate-200',
    border: 'border-l-slate-400',
  },
};

const slaClasses: Record<SlaStatus, string> = {
  vencido: 'text-red-600 bg-red-50 border-red-100',
  alerta: 'text-amber-700 bg-amber-50 border-amber-100',
  ok: 'text-emerald-700 bg-emerald-50 border-emerald-100',
};

const safeText = (value: unknown, fallback = '—') => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return fallback;
};

const inferPriority = (value: unknown): Priority => {
  const text = safeText(value, 'MÉDIA').toUpperCase();
  if (text.includes('CRI')) return 'CRÍTICA';
  if (text.includes('ALT')) return 'ALTA';
  if (text.includes('BAI')) return 'BAIXA';
  return 'MÉDIA';
};

const inferSlaStatus = (value: unknown, slaText: string): SlaStatus => {
  const text = safeText(value, '').toLowerCase();
  const normalizedSla = slaText.toLowerCase();
  if (text.includes('venc') || normalizedSla.includes('venc')) return 'vencido';
  if (text.includes('alert') || normalizedSla.includes('hoje') || normalizedSla.includes('24h')) return 'alerta';
  return 'ok';
};

const normalizeAction = (item: any, index: number): ActionViewModel => {
  const title = safeText(item?.title ?? item?.name ?? item?.actionTitle, `Ação ${index + 1}`);
  const description = safeText(
    item?.description ?? item?.summary ?? item?.reason ?? item?.context,
    'Ação operacional priorizada para manter o fluxo da conta em movimento.',
  );
  const priority = inferPriority(item?.priority ?? item?.severity ?? item?.urgency);
  const category = safeText(item?.category ?? item?.team ?? item?.type, 'Operação');
  const accountName = safeText(
    item?.accountName ?? item?.account?.name ?? item?.company ?? item?.targetAccount,
    'Conta não informada',
  );
  const ownerName = safeText(
    item?.ownerName ?? item?.owner?.name ?? item?.assignee ?? item?.responsible,
    'Owner pendente',
  );
  const source = safeText(item?.source ?? item?.origin ?? item?.trigger ?? item?.channel, 'Sistema');
  const slaText = safeText(item?.slaText ?? item?.dueText ?? item?.deadline ?? item?.eta, 'Sem SLA definido');
  const slaStatus = inferSlaStatus(item?.slaStatus ?? item?.status, slaText);
  const stage = safeText(item?.stage ?? item?.funnelStage ?? item?.pipelineStage, 'Execução');
  const recommendedAction = safeText(
    item?.recommendedAction ?? item?.primaryAction ?? item?.cta,
    'Priorizar owner e executar próximo passo imediatamente.',
  );
  const nextStep = safeText(
    item?.nextStep ?? item?.secondaryAction ?? item?.play,
    'Validar contexto da conta e registrar desdobramento na operação.',
  );
  const impact = safeText(
    item?.impact ?? item?.businessImpact ?? item?.expectedImpact,
    'Impacta velocidade de resposta, cobertura da conta e risco operacional.',
  );

  return {
    id: safeText(item?.id, `action-${index + 1}`),
    title,
    description,
    priority,
    category,
    accountName,
    ownerName,
    source,
    slaText,
    slaStatus,
    stage,
    recommendedAction,
    nextStep,
    impact,
  };
};

const buildKpis = (items: ActionViewModel[]): KPIViewModel[] => {
  const critical = items.filter((item) => item.priority === 'CRÍTICA').length;
  const overdue = items.filter((item) => item.slaStatus === 'vencido').length;
  const withoutOwner = items.filter((item) => item.ownerName === 'Owner pendente').length;
  const inFlow = items.filter((item) => item.slaStatus === 'ok').length;

  return [
    {
      label: 'Críticas agora',
      value: String(critical),
      helper: 'Itens que exigem resposta imediata',
    },
    {
      label: 'SLA vencido',
      value: String(overdue),
      helper: 'Risco operacional aberto na fila',
    },
    {
      label: 'Sem owner',
      value: String(withoutOwner),
      helper: 'Ações sem responsabilização definida',
    },
    {
      label: 'Em fluxo',
      value: String(inFlow),
      helper: 'Ações com andamento saudável',
    },
  ];
};

export const Actions: React.FC = () => {
  const rawActions = ((mockData as any).actions ?? []) as any[];
  const rawActionKpis = ((mockData as any).actionKPIs ?? []) as any[];

  const actions = useMemo(() => rawActions.map(normalizeAction), [rawActions]);
  const derivedKpis = useMemo(() => buildKpis(actions), [actions]);

  const kpis = useMemo<KPIViewModel[]>(() => {
    if (!rawActionKpis.length) return derivedKpis;

    return rawActionKpis.slice(0, 4).map((item: any, index: number) => ({
      label: safeText(item?.label ?? item?.title, derivedKpis[index]?.label ?? `KPI ${index + 1}`),
      value: safeText(item?.value, derivedKpis[index]?.value ?? '0'),
      helper: safeText(item?.helper ?? item?.description, derivedKpis[index]?.helper ?? '—'),
    }));
  }, [derivedKpis, rawActionKpis]);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'TODAS' | Priority>('TODAS');
  const [selectedId, setSelectedId] = useState<string>(actions[0]?.id ?? '');
  const [lastActionMessage, setLastActionMessage] = useState('');

  const filteredActions = useMemo(() => {
    return actions
      .filter((item) => (priorityFilter === 'TODAS' ? true : item.priority === priorityFilter))
      .filter((item) => {
        const haystack = [
          item.title,
          item.description,
          item.accountName,
          item.ownerName,
          item.category,
          item.source,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }, [actions, priorityFilter, search]);

  const selectedAction =
    filteredActions.find((item) => item.id === selectedId) ?? filteredActions[0] ?? actions[0] ?? null;

  const runQuickAction = (label: string) => {
    if (!selectedAction) return;
    setLastActionMessage(`${label} aplicado em “${selectedAction.title}”.`);
  };

  const totalVisible = filteredActions.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700">
              <Zap className="h-3.5 w-3.5" /> Núcleo operacional
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Ações</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              A fila operacional da Canopi. Aqui entram os itens que precisam ser executados agora,
              com prioridade, owner, contexto e próximo passo claro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100">
              <Download className="h-4 w-4" /> Exportar fila
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Nova ação
            </button>
          </div>
        </header>

        {lastActionMessage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {lastActionMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{kpi.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
              <p className="mt-2 text-sm text-slate-500">{kpi.helper}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por ação, conta, owner ou origem"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value as 'TODAS' | Priority)}
                  className="bg-transparent font-medium outline-none"
                >
                  <option value="TODAS">Todas as prioridades</option>
                  <option value="CRÍTICA">Crítica</option>
                  <option value="ALTA">Alta</option>
                  <option value="MÉDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                {totalVisible} item{totalVisible === 1 ? '' : 's'} visível{totalVisible === 1 ? '' : 'is'}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            {filteredActions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-base font-semibold text-slate-900">Nenhuma ação encontrada</p>
                <p className="mt-2 text-sm text-slate-500">
                  Ajuste os filtros ou revise a busca para voltar a enxergar a fila operacional.
                </p>
              </div>
            ) : (
              filteredActions.map((item) => {
                const isSelected = selectedAction?.id === item.id;
                const priorityStyle = priorityClasses[item.priority];

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-200 border-blue-300' : ''
                    }`}
                  >
                    <div className={`border-l-4 ${priorityStyle.border} pl-4`}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${priorityStyle.pill}`}>
                              {item.priority}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                              {item.category}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                              {item.stage}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                          </div>
                        </div>

                        <div className={`inline-flex items-center gap-2 self-start rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest ${slaClasses[item.slaStatus]}`}>
                          <Clock3 className="h-4 w-4" /> {item.slaText}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Conta</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{item.accountName}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Owner</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{item.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Origem</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{item.source}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Próximo passo</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-2">{item.nextStep}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
            {!selectedAction ? null : (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Detalhe da ação</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedAction.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{selectedAction.description}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${priorityClasses[selectedAction.priority].pill}`}>
                    {selectedAction.priority}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Conta</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedAction.accountName}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Owner</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedAction.ownerName}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Origem</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedAction.source}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">SLA</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedAction.slaText}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500">Recomendação principal</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-blue-900">{selectedAction.recommendedAction}</p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Impacto esperado</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">{selectedAction.impact}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Próximo passo</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{selectedAction.nextStep}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Quick actions</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => runQuickAction('Ajustar owner')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" /> Ajustar owner
                    </button>
                    <button
                      onClick={() => runQuickAction('Criar follow-up')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ArrowRight className="h-4 w-4" /> Criar follow-up
                    </button>
                    <button
                      onClick={() => runQuickAction('Conectar contexto')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Link2 className="h-4 w-4" /> Conectar contexto
                    </button>
                    <button
                      onClick={() => runQuickAction('Escalar risco')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <AlertTriangle className="h-4 w-4" /> Escalar risco
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Executável</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Ação pronta para owner assumir imediatamente.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Janela</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">SLA visível para não perder timing operacional.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      {selectedAction.slaStatus === 'vencido' ? <XCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      <span className="text-xs font-bold uppercase tracking-widest">Status</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedAction.slaStatus === 'vencido'
                        ? 'Item já vencido e exigindo correção imediata.'
                        : selectedAction.slaStatus === 'alerta'
                          ? 'Item em zona de atenção, com risco de atraso.'
                          : 'Item em fluxo operacional saudável.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Actions;
