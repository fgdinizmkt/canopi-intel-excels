import React, { useMemo, useState } from 'react';

type PeriodKey = '7d' | '30d' | '90d';
type ChannelKey = 'all' | 'abm' | 'abx' | 'paid' | 'outbound' | 'inbound' | 'events' | 'cs';
type OwnerKey = 'all' | 'camila' | 'ligia' | 'fabio' | 'time-receita';

type PerformanceItem = {
  id: string;
  title: string;
  front: 'ABM' | 'ABX' | 'Mídia Paga' | 'Outbound' | 'Inbound' | 'Eventos' | 'CS';
  channel: Exclude<ChannelKey, 'all'>;
  owner: 'Camila' | 'Ligia' | 'Fábio' | 'Time Receita';
  account: string;
  status: 'Acelerando' | 'Estável' | 'Em risco' | 'Travado';
  priority: 'Alta' | 'Média' | 'Baixa';
  currentValue: number;
  previousValue: number;
  targetValue: number;
  impactLabel: string;
  actionCount: number;
  blockedCount: number;
  nextStep: string;
  notes: string;
  timeline: { label: string; value: number }[];
};

const PERFORMANCE_ITEMS: PerformanceItem[] = [
  {
    id: 'perf-001',
    title: 'Expansão de engajamento em contas tier A',
    front: 'ABX',
    channel: 'abx',
    owner: 'Fábio',
    account: 'Minerva Foods',
    status: 'Acelerando',
    priority: 'Alta',
    currentValue: 82,
    previousValue: 64,
    targetValue: 88,
    impactLabel: 'Mais sinais qualificados e avanço de conta',
    actionCount: 14,
    blockedCount: 1,
    nextStep: 'Ajustar priorização dos contatos com maior propensão e reforçar cadência executiva.',
    notes:
      'O desempenho cresceu após combinação entre sinais, personalização e sequência coordenada com mídia e outbound.',
    timeline: [
      { label: 'Sem 1', value: 48 },
      { label: 'Sem 2', value: 56 },
      { label: 'Sem 3', value: 64 },
      { label: 'Sem 4', value: 73 },
      { label: 'Sem 5', value: 82 },
    ],
  },
  {
    id: 'perf-002',
    title: 'Recuperação de pipeline estagnado',
    front: 'Outbound',
    channel: 'outbound',
    owner: 'Ligia',
    account: 'V.tal',
    status: 'Em risco',
    priority: 'Alta',
    currentValue: 51,
    previousValue: 58,
    targetValue: 72,
    impactLabel: 'Queda de resposta e menor avanço de reunião',
    actionCount: 11,
    blockedCount: 3,
    nextStep: 'Revisar copy, timing de follow-up e conexão entre dor, prova e contexto de conta.',
    notes:
      'A performance caiu nas últimas duas semanas. Há sinais de desgaste na abordagem e pouca renovação de mensagem.',
    timeline: [
      { label: 'Sem 1', value: 66 },
      { label: 'Sem 2', value: 61 },
      { label: 'Sem 3', value: 58 },
      { label: 'Sem 4', value: 54 },
      { label: 'Sem 5', value: 51 },
    ],
  },
  {
    id: 'perf-003',
    title: 'Eficiência da mídia em contas estratégicas',
    front: 'Mídia Paga',
    channel: 'paid',
    owner: 'Camila',
    account: 'ArcelorMittal',
    status: 'Estável',
    priority: 'Média',
    currentValue: 68,
    previousValue: 66,
    targetValue: 78,
    impactLabel: 'Entrega consistente, mas com espaço de otimização',
    actionCount: 9,
    blockedCount: 0,
    nextStep: 'Refinar segmentação e criativos por estágio de conta.',
    notes:
      'A mídia mantém boa consistência, porém ainda sem salto claro de eficiência nas contas mais maduras.',
    timeline: [
      { label: 'Sem 1', value: 62 },
      { label: 'Sem 2', value: 64 },
      { label: 'Sem 3', value: 66 },
      { label: 'Sem 4', value: 67 },
      { label: 'Sem 5', value: 68 },
    ],
  },
  {
    id: 'perf-004',
    title: 'Adoção de playbook inbound por intenção',
    front: 'Inbound',
    channel: 'inbound',
    owner: 'Time Receita',
    account: 'Clever Devices',
    status: 'Acelerando',
    priority: 'Média',
    currentValue: 74,
    previousValue: 59,
    targetValue: 80,
    impactLabel: 'Maior aderência entre conteúdo, intenção e abordagem',
    actionCount: 12,
    blockedCount: 1,
    nextStep: 'Expandir fluxos para clusters próximos e revisar scoring.',
    notes:
      'A nova lógica de roteamento elevou a qualidade das entradas e reduziu dispersão operacional.',
    timeline: [
      { label: 'Sem 1', value: 50 },
      { label: 'Sem 2', value: 55 },
      { label: 'Sem 3', value: 59 },
      { label: 'Sem 4', value: 67 },
      { label: 'Sem 5', value: 74 },
    ],
  },
  {
    id: 'perf-005',
    title: 'Aproveitamento de eventos em follow-up',
    front: 'Eventos',
    channel: 'events',
    owner: 'Fábio',
    account: 'FHLB',
    status: 'Travado',
    priority: 'Alta',
    currentValue: 39,
    previousValue: 43,
    targetValue: 65,
    impactLabel: 'Pouca conversão pós-evento e perda de timing',
    actionCount: 7,
    blockedCount: 4,
    nextStep: 'Reorganizar SLA de follow-up e conexão entre evento, sinais e cadência.',
    notes:
      'O gargalo está menos na geração de interesse e mais na operacionalização do pós-evento.',
    timeline: [
      { label: 'Sem 1', value: 47 },
      { label: 'Sem 2', value: 46 },
      { label: 'Sem 3', value: 43 },
      { label: 'Sem 4', value: 41 },
      { label: 'Sem 5', value: 39 },
    ],
  },
  {
    id: 'perf-006',
    title: 'Retenção e expansão via CS consultivo',
    front: 'CS',
    channel: 'cs',
    owner: 'Time Receita',
    account: 'MSD',
    status: 'Estável',
    priority: 'Média',
    currentValue: 71,
    previousValue: 70,
    targetValue: 79,
    impactLabel: 'Base saudável, mas com pouca aceleração nova',
    actionCount: 8,
    blockedCount: 1,
    nextStep: 'Criar trilhas por risco e potencial de expansão.',
    notes:
      'A estrutura atual preserva bem a base, porém ainda sem leitura preditiva forte para expansão.',
    timeline: [
      { label: 'Sem 1', value: 68 },
      { label: 'Sem 2', value: 69 },
      { label: 'Sem 3', value: 70 },
      { label: 'Sem 4', value: 70 },
      { label: 'Sem 5', value: 71 },
    ],
  },
];

const periodMultiplier: Record<PeriodKey, number> = {
  '7d': 0.9,
  '30d': 1,
  '90d': 1.08,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function formatDelta(current: number, previous: number) {
  const diff = current - previous;
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}${diff.toFixed(0)}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

function getStatusTone(status: PerformanceItem['status']) {
  switch (status) {
    case 'Acelerando':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'Estável':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case 'Em risco':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'Travado':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    default:
      return 'bg-white/10 text-white border-white/20';
  }
}

function getDeltaTone(current: number, previous: number) {
  if (current > previous) return 'text-emerald-300';
  if (current < previous) return 'text-rose-300';
  return 'text-zinc-300';
}

function MiniTrend({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-20 items-end gap-2">
      {values.map((value, index) => {
        const height = Math.max((value / max) * 100, 12);
        return (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-white/80"
              style={{ height: `${height}%`, minHeight: 10 }}
            />
          </div>
        );
      })}
    </div>
  );
}

function LineTrend({ timeline }: { timeline: { label: string; value: number }[] }) {
  const max = Math.max(...timeline.map((item) => item.value));
  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {timeline.map((point) => {
          const height = Math.max((point.value / max) * 100, 16);
          return (
            <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-cyan-400 to-blue-300"
                style={{ height: `${height}%` }}
              />
              <span className="text-[11px] text-zinc-400">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Performance() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [channel, setChannel] = useState<ChannelKey>('all');
  const [owner, setOwner] = useState<OwnerKey>('all');
  const [selectedItem, setSelectedItem] = useState<PerformanceItem | null>(null);

  const filteredItems = useMemo(() => {
    return PERFORMANCE_ITEMS.filter((item) => {
      const channelMatch = channel === 'all' ? true : item.channel === channel;
      const ownerMatch =
        owner === 'all'
          ? true
          : (owner === 'camila' && item.owner === 'Camila') ||
            (owner === 'ligia' && item.owner === 'Ligia') ||
            (owner === 'fabio' && item.owner === 'Fábio') ||
            (owner === 'time-receita' && item.owner === 'Time Receita');

      return channelMatch && ownerMatch;
    }).map((item) => {
      const factor = periodMultiplier[period];
      return {
        ...item,
        currentValue: Math.round(item.currentValue * factor),
        previousValue: Math.round(item.previousValue * factor),
        targetValue: Math.round(item.targetValue * factor),
        timeline: item.timeline.map((t) => ({
          ...t,
          value: Math.round(t.value * factor),
        })),
      };
    });
  }, [channel, owner, period]);

  const summary = useMemo(() => {
    const totalCurrent =
      filteredItems.reduce((acc, item) => acc + item.currentValue, 0) / Math.max(filteredItems.length, 1);
    const totalPrevious =
      filteredItems.reduce((acc, item) => acc + item.previousValue, 0) / Math.max(filteredItems.length, 1);
    const totalTarget =
      filteredItems.reduce((acc, item) => acc + item.targetValue, 0) / Math.max(filteredItems.length, 1);

    const blockedActions = filteredItems.reduce((acc, item) => acc + item.blockedCount, 0);
    const totalActions = filteredItems.reduce((acc, item) => acc + item.actionCount, 0);
    const atRisk = filteredItems.filter(
      (item) => item.status === 'Em risco' || item.status === 'Travado'
    ).length;

    return {
      avgPerformance: totalCurrent,
      avgPrevious: totalPrevious,
      avgTarget: totalTarget,
      blockedActions,
      totalActions,
      atRisk,
    };
  }, [filteredItems]);

  const groupedByFront = useMemo(() => {
    const groups = filteredItems.reduce<Record<string, PerformanceItem[]>>((acc, item) => {
      if (!acc[item.front]) acc[item.front] = [];
      acc[item.front].push(item);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([front, items]) => ({
        front,
        items,
        avg: items.reduce((acc, item) => acc + item.currentValue, 0) / items.length,
        prev: items.reduce((acc, item) => acc + item.previousValue, 0) / items.length,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [filteredItems]);

  const actionNow = useMemo(() => {
    return [...filteredItems]
      .sort((a, b) => {
        const aScore =
          (a.status === 'Travado' ? 4 : a.status === 'Em risco' ? 3 : a.priority === 'Alta' ? 2 : 1) +
          a.blockedCount;
        const bScore =
          (b.status === 'Travado' ? 4 : b.status === 'Em risco' ? 3 : b.priority === 'Alta' ? 2 : 1) +
          b.blockedCount;
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1527] via-[#0d1b32] to-[#10213d] p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  Desempenho V2
                </div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Entenda o que está performando, o que desacelerou e onde agir agora
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
                  Esta visão foi desenhada para apoiar decisão operacional com leitura temporal,
                  comparação com o período anterior e aprofundamento por frente, owner e contexto de conta.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[520px]">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Período</span>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodKey)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="7d" className="bg-slate-900">
                      Últimos 7 dias
                    </option>
                    <option value="30d" className="bg-slate-900">
                      Últimos 30 dias
                    </option>
                    <option value="90d" className="bg-slate-900">
                      Últimos 90 dias
                    </option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Frente</span>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as ChannelKey)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="all" className="bg-slate-900">
                      Todas
                    </option>
                    <option value="abm" className="bg-slate-900">
                      ABM
                    </option>
                    <option value="abx" className="bg-slate-900">
                      ABX
                    </option>
                    <option value="paid" className="bg-slate-900">
                      Mídia Paga
                    </option>
                    <option value="outbound" className="bg-slate-900">
                      Outbound
                    </option>
                    <option value="inbound" className="bg-slate-900">
                      Inbound
                    </option>
                    <option value="events" className="bg-slate-900">
                      Eventos
                    </option>
                    <option value="cs" className="bg-slate-900">
                      CS
                    </option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Owner</span>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value as OwnerKey)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="all" className="bg-slate-900">
                      Todos
                    </option>
                    <option value="camila" className="bg-slate-900">
                      Camila
                    </option>
                    <option value="ligia" className="bg-slate-900">
                      Ligia
                    </option>
                    <option value="fabio" className="bg-slate-900">
                      Fábio
                    </option>
                    <option value="time-receita" className="bg-slate-900">
                      Time Receita
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Performance média</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="text-4xl font-semibold">{formatPercent(summary.avgPerformance)}</div>
                  <div className={cn('text-sm font-medium', getDeltaTone(summary.avgPerformance, summary.avgPrevious))}>
                    {formatDelta(summary.avgPerformance, summary.avgPrevious)} vs período anterior
                  </div>
                </div>
                <div className="mt-3 text-sm text-zinc-400">
                  Meta média atual: {formatPercent(summary.avgTarget)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Ações em execução</div>
                <div className="mt-3 text-4xl font-semibold">{summary.totalActions}</div>
                <div className="mt-3 text-sm text-zinc-400">
                  O volume sozinho não basta. O foco aqui é consequência operacional.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Bloqueios ativos</div>
                <div className="mt-3 text-4xl font-semibold">{summary.blockedActions}</div>
                <div className="mt-3 text-sm text-zinc-400">
                  Bloqueios impactam diretamente a velocidade de resposta e avanço.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Frentes sob atenção</div>
                <div className="mt-3 text-4xl font-semibold">{summary.atRisk}</div>
                <div className="mt-3 text-sm text-zinc-400">
                  Em risco ou travadas, pedindo correção antes de perder timing.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-white/10 bg-[#0b1424] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Leitura temporal consolidada</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Evolução média recente para entender aceleração, estabilidade ou perda de tração.
                </p>
              </div>
              <div className={cn('text-sm font-medium', getDeltaTone(summary.avgPerformance, summary.avgPrevious))}>
                {formatDelta(summary.avgPerformance, summary.avgPrevious)} pts
              </div>
            </div>

            <div className="mt-6">
              <MiniTrend values={filteredItems.flatMap((item) => item.timeline.map((t) => t.value)).slice(-10)} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Melhor aceleração</div>
                <div className="mt-3 text-lg font-semibold">
                  {groupedByFront[0]?.front ?? 'Sem dados'}
                </div>
                <div className="mt-2 text-sm text-zinc-400">
                  Média atual de {groupedByFront[0] ? formatPercent(groupedByFront[0].avg) : '0%'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Maior desaceleração</div>
                <div className="mt-3 text-lg font-semibold">
                  {[...groupedByFront].sort((a, b) => (a.avg - a.prev) - (b.avg - b.prev))[0]?.front ?? 'Sem dados'}
                </div>
                <div className="mt-2 text-sm text-zinc-400">
                  Onde a diferença recente mais pede revisão operacional.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Gap para meta</div>
                <div className="mt-3 text-lg font-semibold">
                  {formatPercent(Math.max(summary.avgTarget - summary.avgPerformance, 0))}
                </div>
                <div className="mt-2 text-sm text-zinc-400">
                  Distância média entre entrega real e objetivo esperado.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0b1424] p-6">
            <h2 className="text-xl font-semibold">Onde agir agora</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Prioridades operacionais com maior urgência combinando risco, bloqueio e impacto.
            </p>

            <div className="mt-6 space-y-3">
              {actionNow.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="mt-1 text-sm text-zinc-400">
                        {item.front} • {item.account} • {item.owner}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium',
                        getStatusTone(item.status)
                      )}
                    >
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-zinc-500">Performance</div>
                      <div className="mt-1 font-medium">{formatPercent(item.currentValue)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Bloqueios</div>
                      <div className="mt-1 font-medium">{item.blockedCount}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Próximo passo</div>
                      <div className="mt-1 truncate font-medium">{item.nextStep}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[24px] border border-white/10 bg-[#0b1424] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Desempenho por frente</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Comparação entre frentes para enxergar onde a performance evolui e onde perde força.
              </p>
            </div>
            <div className="text-sm text-zinc-500">
              Clique em qualquer linha para ver mais detalhes
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
              <div className="col-span-3">Frente</div>
              <div className="col-span-2">Atual</div>
              <div className="col-span-2">Anterior</div>
              <div className="col-span-2">Delta</div>
              <div className="col-span-3">Itens</div>
            </div>

            <div className="divide-y divide-white/10">
              {groupedByFront.map((group) => (
                <div key={group.front} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
                  <div className="col-span-3 font-medium">{group.front}</div>
                  <div className="col-span-2">{formatPercent(group.avg)}</div>
                  <div className="col-span-2">{formatPercent(group.prev)}</div>
                  <div className={cn('col-span-2 font-medium', getDeltaTone(group.avg, group.prev))}>
                    {formatDelta(group.avg, group.prev)}
                  </div>
                  <div className="col-span-3 text-zinc-400">
                    {group.items.length} iniciativa{group.items.length > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Iniciativas com leitura detalhada</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Blocos com contexto de conta, impacto, tendência e sinal claro do que fazer.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-white/10 bg-[#0b1424] p-5 transition hover:border-cyan-400/25"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{item.title}</div>
                    <div className="mt-2 text-sm text-zinc-400">
                      {item.front} • {item.account} • {item.owner}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium',
                      getStatusTone(item.status)
                    )}
                  >
                    {item.status}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Atual</div>
                    <div className="mt-2 text-2xl font-semibold">{formatPercent(item.currentValue)}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Delta</div>
                    <div className={cn('mt-2 text-2xl font-semibold', getDeltaTone(item.currentValue, item.previousValue))}>
                      {formatDelta(item.currentValue, item.previousValue)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Meta</div>
                    <div className="mt-2 text-2xl font-semibold">{formatPercent(item.targetValue)}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <LineTrend timeline={item.timeline} />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Impacto percebido</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-300">{item.impactLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Próximo passo</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-300">{item.nextStep}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
                    Prioridade {item.priority}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
                    {item.actionCount} ações relacionadas
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
                    {item.blockedCount} bloqueios
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/15"
                  >
                    Ver leitura detalhada
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[28px] border border-white/10 bg-[#081120] shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#081120]/95 px-6 py-5 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Leitura detalhada</div>
                  <h3 className="mt-2 text-2xl font-semibold">{selectedItem.title}</h3>
                  <div className="mt-2 text-sm text-zinc-400">
                    {selectedItem.front} • {selectedItem.account} • {selectedItem.owner}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Atual</div>
                  <div className="mt-2 text-3xl font-semibold">{formatPercent(selectedItem.currentValue)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Anterior</div>
                  <div className="mt-2 text-3xl font-semibold">{formatPercent(selectedItem.previousValue)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Meta</div>
                  <div className="mt-2 text-3xl font-semibold">{formatPercent(selectedItem.targetValue)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</div>
                  <div className="mt-2">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-sm font-medium',
                        getStatusTone(selectedItem.status)
                      )}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="text-lg font-semibold">Evolução recente</h4>
                  <p className="mt-2 text-sm text-zinc-400">
                    Leitura temporal da iniciativa para apoiar decisão sem depender apenas de fotografia estática.
                  </p>
                  <div className="mt-5">
                    <LineTrend timeline={selectedItem.timeline} />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="text-lg font-semibold">Resumo operacional</h4>
                  <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-300">
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Impacto</div>
                      <p>{selectedItem.impactLabel}</p>
                    </div>
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Observações</div>
                      <p>{selectedItem.notes}</p>
                    </div>
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">Próximo passo</div>
                      <p>{selectedItem.nextStep}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Conta</div>
                  <div className="mt-2 text-base font-medium">{selectedItem.account}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Owner</div>
                  <div className="mt-2 text-base font-medium">{selectedItem.owner}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Prioridade</div>
                  <div className="mt-2 text-base font-medium">{selectedItem.priority}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="text-lg font-semibold">Execução relacionada</h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Ações relacionadas</div>
                      <div className="mt-2 text-2xl font-semibold">{selectedItem.actionCount}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Bloqueios</div>
                      <div className="mt-2 text-2xl font-semibold">{selectedItem.blockedCount}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="text-lg font-semibold">Leitura de decisão</h4>
                  <div className="mt-4 text-sm leading-6 text-zinc-300">
                    {selectedItem.status === 'Travado' && (
                      <p>
                        A iniciativa está travada e exige destravamento operacional imediato antes de qualquer tentativa
                        de escalar volume.
                      </p>
                    )}
                    {selectedItem.status === 'Em risco' && (
                      <p>
                        Há perda de tração. O mais sensato é revisar mensagem, fluxo, timing e aderência da execução ao
                        contexto real da conta.
                      </p>
                    )}
                    {selectedItem.status === 'Estável' && (
                      <p>
                        A base está consistente, mas sem aceleração clara. Oportunidade de otimização fina e ganho
                        incremental.
                      </p>
                    )}
                    {selectedItem.status === 'Acelerando' && (
                      <p>
                        A iniciativa mostra sinais saudáveis de evolução. Vale consolidar o aprendizado e replicar o
                        padrão com cuidado em frentes correlatas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/15"
                >
                  Voltar para a visão de desempenho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
