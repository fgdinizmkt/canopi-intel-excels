import { useMemo, useState } from 'react';

type FrontKey =
  | 'canais'
  | 'origens'
  | 'motores'
  | 'verticais'
  | 'departamentos'
  | 'contatos';

type DetailType = 'front' | 'account' | 'action' | null;

type ViewState = {
  type: DetailType;
  key?: string;
  label?: string;
};

type MetricCard = {
  label: string;
  value: string;
  previous: string;
  delta: string;
  tone: 'positive' | 'neutral' | 'warning' | 'danger';
};

type FrontSummary = {
  key: FrontKey;
  label: string;
  summary: string;
  status: 'saudável' | 'atenção' | 'crítico' | 'oportunidade';
  current: string;
  previous: string;
  delta: string;
  why: string;
  implication: string;
  recommendedAction: string;
  relatedAccounts: { name: string; reason: string; owner: string; impact: string }[];
  relatedActions: { title: string; team: string; sla: string; outcome: string }[];
  bars: number[];
};

const heroMetrics: MetricCard[] = [
  {
    label: 'Pipeline influenciado',
    value: 'R$ 5,4M',
    previous: 'R$ 4,8M',
    delta: '+12,5%',
    tone: 'positive',
  },
  {
    label: 'Receita em risco',
    value: 'R$ 1,3M',
    previous: 'R$ 1,5M',
    delta: '-13,3%',
    tone: 'positive',
  },
  {
    label: 'SLA operacional',
    value: '79%',
    previous: '84%',
    delta: '-5 p.p.',
    tone: 'warning',
  },
  {
    label: 'Execução efetiva',
    value: '41 / 56',
    previous: '37 / 51',
    delta: '+4 ações',
    tone: 'positive',
  },
];

const fronts: FrontSummary[] = [
  {
    key: 'canais',
    label: 'Canais',
    summary: 'ABM e SEO sustentam avanço, enquanto CRM e Pago ainda geram atrito operacional.',
    status: 'atenção',
    current: 'ABM, SEO e Inbound puxaram 68% do avanço líquido.',
    previous: 'No período anterior, o ganho estava mais concentrado em Pago.',
    delta: '+8,2%',
    why: 'ABM entrou com melhor combinação entre qualidade de conta, sponsor e continuidade. Pago recuperou clique, mas não sustentou eficiência de conversão.',
    implication: 'A decisão não é investir mais em tudo, e sim preservar o que sustenta pipeline e corrigir o que ainda desperdiça capacidade operacional.',
    recommendedAction: 'Redistribuir parte do esforço de CRM e Pago para frentes com maior consistência de conversão e continuidade.',
    relatedAccounts: [
      { name: 'MSD Saúde', reason: 'ABM acelerou narrativa e avanço comercial.', owner: 'Pablo Diniz', impact: '+R$ 480 mil' },
      { name: 'V.tal', reason: 'SEO e inbound sustentaram descoberta e retomada.', owner: 'Camila Ribeiro', impact: '+R$ 190 mil' },
      { name: 'Carteiro Seguros Enterprise', reason: 'CRM perdeu timing de retomada.', owner: 'Ligia Martins', impact: 'Risco de R$ 220 mil' },
    ],
    relatedActions: [
      { title: 'Ajustar orçamento entre ABM, SEO e CRM', team: 'Performance + RevOps', sla: 'Hoje', outcome: 'Reduzir desperdício e proteger pipeline' },
      { title: 'Revisar régua de retomada no CRM', team: 'CRM Ops', sla: '24h', outcome: 'Recuperar leads com intenção recente' },
      { title: 'Abrir revisão de Paid por segmento', team: 'Mídia Paga', sla: '48h', outcome: 'Remover grupos com clique sem continuidade' },
    ],
    bars: [42, 57, 61, 74, 81, 88],
  },
  {
    key: 'origens',
    label: 'Origens',
    summary: 'Inbound continua gerando volume útil, mas outbound seletivo puxou melhor progressão para oportunidade.',
    status: 'oportunidade',
    current: 'Outbound seletivo elevou taxa de avanço em contas enterprise.',
    previous: 'Antes, inbound carregava sozinho a maior parte do progresso comercial.',
    delta: '+6,4%',
    why: 'A qualidade do handoff e do contexto vindo de outbound melhorou quando a abordagem partiu de dor, conta e comitê.',
    implication: 'Há espaço para usar outbound como acelerador seletivo, não como canal de volume.',
    recommendedAction: 'Abrir play conjunto entre marketing e SDR para contas com intenção recente e lacuna de contato executivo.',
    relatedAccounts: [
      { name: 'Minerva Foods', reason: 'Outbound conectou sponsor e área usuária.', owner: 'Elber Costa', impact: '+R$ 310 mil' },
      { name: 'ArcelorMittal', reason: 'Inbound abriu demanda, mas faltou continuidade.', owner: 'Célio Hira', impact: 'Potencial de R$ 270 mil' },
      { name: 'Clever Devices', reason: 'Origem bem definida, execução ainda irregular.', owner: 'Fábio Diniz', impact: 'Risco moderado' },
    ],
    relatedActions: [
      { title: 'Ativar sequência executiva para contas com alta intenção', team: 'SDR + Marketing', sla: 'Hoje', outcome: 'Ganhar continuidade em contas enterprise' },
      { title: 'Revisar handoff de inbound para vendas', team: 'RevOps', sla: '24h', outcome: 'Eliminar perda de contexto' },
      { title: 'Atualizar critérios de origem prioritária', team: 'Ops', sla: '48h', outcome: 'Melhorar leitura situacional do funil' },
    ],
    bars: [34, 45, 48, 59, 69, 77],
  },
  {
    key: 'motores',
    label: 'Motores',
    summary: 'O motor de geração está saudável, mas o motor de continuidade ainda depende demais de owners específicos.',
    status: 'crítico',
    current: 'Execução operacional cresceu, porém com dependência alta de poucas pessoas para fazer o fluxo andar.',
    previous: 'O período anterior tinha menor volume, mas menos concentração operacional.',
    delta: '-4,1%',
    why: 'Campanhas e plays evoluíram, mas follow-up, sincronização e retomada ainda estão concentrados em poucos owners.',
    implication: 'Sem redistribuição de execução, o ganho macro fica frágil e difícil de sustentar.',
    recommendedAction: 'Criar fila mais clara de ownership e redistribuir rotinas de continuidade e retomada.',
    relatedAccounts: [
      { name: 'FHLB', reason: 'Conta com sinais bons, mas sem continuidade de owner.', owner: 'Ligia Martins', impact: 'Risco de estagnação' },
      { name: 'MSD Animal Health', reason: 'Motor de continuidade sustentou avanço.', owner: 'Camila Ribeiro', impact: '+R$ 140 mil' },
      { name: 'NowVertical BR', reason: 'Excesso de dependência em um só ponto de contato.', owner: 'Pablo Diniz', impact: 'Risco operacional' },
    ],
    relatedActions: [
      { title: 'Redistribuir owners com base em aging e SLA', team: 'Gestão Operacional', sla: 'Hoje', outcome: 'Reduzir dependência crítica' },
      { title: 'Corrigir filas de continuidade no CRM', team: 'CRM Ops', sla: '24h', outcome: 'Diminuir atraso de retomada' },
      { title: 'Abrir revisão de capacidade por frente', team: 'Liderança', sla: '48h', outcome: 'Sustentar crescimento sem gargalo' },
    ],
    bars: [71, 66, 62, 58, 53, 49],
  },
  {
    key: 'verticais',
    label: 'Verticais',
    summary: 'Saúde e indústria continuam com melhor combinação de aderência, continuidade e potencial de expansão.',
    status: 'saudável',
    current: 'Saúde lidera avanço e indústria segue com conversão acima da média.',
    previous: 'O período anterior tinha avanço mais distribuído, porém menos eficiente.',
    delta: '+9,7%',
    why: 'As narrativas estão melhores, há mais contexto na abordagem e mais continuidade após o primeiro avanço.',
    implication: 'Vale aprofundar os plays e a especialização por vertical antes de abrir frentes amplas demais.',
    recommendedAction: 'Duplicar padrões vencedores de saúde e indústria para contas com perfil semelhante.',
    relatedAccounts: [
      { name: 'MSD Saúde', reason: 'Vertical com prova, timing e narrativa bem alinhados.', owner: 'Pablo Diniz', impact: '+R$ 480 mil' },
      { name: 'ArcelorMittal', reason: 'Indústria com ganho consistente de aderência.', owner: 'Célio Hira', impact: '+R$ 260 mil' },
      { name: 'Grupo IN', reason: 'Potencial bom, mas ainda sem continuidade ideal.', owner: 'Fábio Diniz', impact: '+R$ 90 mil' },
    ],
    relatedActions: [
      { title: 'Abrir biblioteca de prova por vertical', team: 'Conteúdo + Growth', sla: '72h', outcome: 'Escalar narrativa que converte melhor' },
      { title: 'Revisar priorização de contas lookalike', team: 'ABM', sla: '48h', outcome: 'Expandir padrão vencedor' },
      { title: 'Atualizar recomendações por vertical', team: 'Ops', sla: 'Hoje', outcome: 'Guiar ações concretas por contexto' },
    ],
    bars: [38, 49, 56, 63, 79, 91],
  },
  {
    key: 'departamentos',
    label: 'Departamentos',
    summary: 'Marketing e pré-vendas estão alinhados, mas ainda há quebra no handoff com comercial em contas de ciclo mais longo.',
    status: 'atenção',
    current: 'As equipes ganharam ritmo, porém parte do valor ainda se perde na transição para continuidade comercial.',
    previous: 'Antes, o problema aparecia mais cedo, na geração; agora está mais no handoff.',
    delta: '+3,1%',
    why: 'A operação melhorou na origem e na priorização, mas a passagem para execução comercial ainda varia por owner e por conta.',
    implication: 'Sem handoff mais consistente, o avanço macro não se transforma em consequência comercial proporcional.',
    recommendedAction: 'Padronizar transição entre marketing, SDR e vendas com contexto mínimo obrigatório.',
    relatedAccounts: [
      { name: 'V.tal', reason: 'Handoff sem contexto completo atrasou revisão.', owner: 'Camila Ribeiro', impact: 'Risco de atraso' },
      { name: 'Minerva Foods', reason: 'Boa coordenação entre áreas acelerou ciclo.', owner: 'Elber Costa', impact: '+R$ 310 mil' },
      { name: 'Carteiro Seguros Enterprise', reason: 'Retomada sem contexto perdeu força.', owner: 'Ligia Martins', impact: 'Risco de R$ 220 mil' },
    ],
    relatedActions: [
      { title: 'Definir checklist de handoff obrigatório', team: 'RevOps', sla: 'Hoje', outcome: 'Diminuir perda entre áreas' },
      { title: 'Revisar casos com atraso acima de 7 dias', team: 'Vendas + SDR', sla: '24h', outcome: 'Recuperar continuidade' },
      { title: 'Abrir painel de passagem por owner', team: 'Ops', sla: '48h', outcome: 'Expor gargalos recorrentes' },
    ],
    bars: [49, 55, 59, 66, 68, 71],
  },
  {
    key: 'contatos',
    label: 'Contatos e base',
    summary: 'O resultado melhora quando há mais senioridade mapeada e maior cobertura do comitê comprador.',
    status: 'oportunidade',
    current: 'Contas com champion e sponsor mapeados converteram melhor.',
    previous: 'Antes, a operação avançava mais baseada em um único ponto de contato.',
    delta: '+7,9%',
    why: 'Quando a base tem mais qualidade e profundidade, a abordagem ganha contexto e a continuidade fica menos frágil.',
    implication: 'Mapeamento de contatos não é detalhe operacional. É fator de performance.',
    recommendedAction: 'Priorizar enriquecimento e expansão de comitê em contas com potencial e dependência de poucos contatos.',
    relatedAccounts: [
      { name: 'MSD Saúde', reason: 'Sponsor + champion ativados.', owner: 'Pablo Diniz', impact: '+R$ 480 mil' },
      { name: 'FHLB', reason: 'Baixa cobertura de liderança ainda trava avanço.', owner: 'Ligia Martins', impact: 'Risco moderado' },
      { name: 'Clever Devices', reason: 'Boa aderência, mas comitê incompleto.', owner: 'Fábio Diniz', impact: 'Potencial de expansão' },
    ],
    relatedActions: [
      { title: 'Atualizar comitê em contas com alta prioridade', team: 'ABX + SDR', sla: 'Hoje', outcome: 'Ganhar profundidade de relacionamento' },
      { title: 'Enriquecer contatos de liderança', team: 'Dados + SDR', sla: '24h', outcome: 'Reduzir dependência de poucos contatos' },
      { title: 'Abrir verificação de lacunas por senioridade', team: 'Ops', sla: '48h', outcome: 'Guiar próxima onda de mapeamento' },
    ],
    bars: [31, 37, 46, 58, 72, 84],
  },
];

const macroTimeline = [
  {
    title: 'Pipeline influenciado',
    value: 'R$ 5,4M',
    previous: 'R$ 4,8M',
    delta: '+12,5%',
    why: 'ABM, SEO e outbound seletivo sustentaram avanço com melhor continuidade.',
    whyItMatters: 'Mostra ganho real de capacidade de gerar avanço útil, não só volume.',
    points: [28, 36, 49, 57, 73, 88],
    tone: 'positive',
  },
  {
    title: 'Receita em risco',
    value: 'R$ 1,3M',
    previous: 'R$ 1,5M',
    delta: '-13,3%',
    why: 'Recuperações pontuais evitaram perda maior em contas enterprise.',
    whyItMatters: 'A queda do risco abre espaço para agir em crescimento sem perder proteção.',
    points: [72, 69, 67, 59, 54, 48],
    tone: 'positive',
  },
  {
    title: 'SLA operacional',
    value: '79%',
    previous: '84%',
    delta: '-5 p.p.',
    why: 'A execução cresceu, mas follow-up e retomada ainda ficaram concentrados.',
    whyItMatters: 'Sem SLA estável, o avanço macro perde sustentação nas próximas semanas.',
    points: [84, 82, 80, 79, 77, 79],
    tone: 'warning',
  },
  {
    title: 'Execução efetiva',
    value: '41 / 56',
    previous: '37 / 51',
    delta: '+4 ações',
    why: 'Mais frentes foram acionadas, mas nem todas fecharam ciclo completo.',
    whyItMatters: 'Execução sem fechamento vira atividade, não consequência.',
    points: [32, 39, 47, 51, 63, 73],
    tone: 'positive',
  },
];

const situationalNotes = [
  {
    type: 'O que melhorou',
    text: 'ABM, SEO e outbound seletivo sustentaram crescimento com melhor qualidade de avanço e menor dependência de clique isolado.',
    tone: 'positive',
  },
  {
    type: 'O que exige ação',
    text: 'CRM, handoff comercial e continuidade operacional ainda quebram parte do valor gerado no topo da operação.',
    tone: 'warning',
  },
  {
    type: 'O que muda a decisão',
    text: 'A decisão mais forte do período não é gerar mais volume. É proteger o que converte melhor e corrigir as frentes que ainda desperdiçam continuidade.',
    tone: 'neutral',
  },
];

const diagnosisCards = [
  {
    title: 'Inbound enterprise perdeu velocidade',
    cause: 'Volume útil caiu na etapa de conversão de levantamento para resposta.',
    decision: 'Corrigir proposta de valor e reforçar handoff antes de ampliar campanha.',
    tone: 'warning',
  },
  {
    title: 'Tráfego pago puxou custo sem continuidade',
    cause: 'Segmentos amplos geraram clique, mas não sustentaram progressão comercial.',
    decision: 'Redistribuir budget e reduzir grupos sem continuidade real.',
    tone: 'danger',
  },
  {
    title: 'ABM está na frente mais saudável para escalar',
    cause: 'Melhor equilíbrio entre qualidade de conta, sponsor e execução de owners.',
    decision: 'Expandir padrão vencedor para verticais e contas semelhantes.',
    tone: 'positive',
  },
];

const impactRows = [
  {
    account: 'MSD Saúde',
    owner: 'Pablo Diniz',
    action: 'Ajustar narrativa executiva para comitê',
    status: 'Evoluiu',
    consequence: '+R$ 480 mil influenciados',
  },
  {
    account: 'V.tal',
    owner: 'Camila Ribeiro',
    action: 'Retomar resposta técnica e revisão',
    status: 'Em risco',
    consequence: '+14 dias no ciclo',
  },
  {
    account: 'Carteiro Seguros Enterprise',
    owner: 'Ligia Martins',
    action: 'Corrigir roteamento de leads inbound',
    status: 'Recuperação',
    consequence: 'Risco de R$ 220 mil',
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function toneClasses(tone: MetricCard['tone'] | 'saudável' | 'atenção' | 'crítico' | 'oportunidade') {
  switch (tone) {
    case 'positive':
    case 'saudável':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'warning':
    case 'atenção':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'danger':
    case 'crítico':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'oportunidade':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function SparkBars({ values, tone = 'emerald' }: { values: number[]; tone?: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' }) {
  const colorClass = {
    emerald: 'bg-emerald-500/85',
    amber: 'bg-amber-500/85',
    rose: 'bg-rose-500/85',
    sky: 'bg-sky-500/85',
    slate: 'bg-slate-500/85',
  }[tone];

  const max = Math.max(...values);

  return (
    <div className="flex h-24 items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 items-end">
          <div
            className={cn('w-full rounded-t-xl transition-all', colorClass)}
            style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function StatusPill({ children, tone }: { children: string; tone: FrontSummary['status'] | MetricCard['tone'] }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold', toneClasses(tone as any))}>
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string;
  title: string;
  description: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      {right}
    </div>
  );
}

export default function PerformanceV46() {
  const [selectedFront, setSelectedFront] = useState<FrontKey>('canais');
  const [view, setView] = useState<ViewState>({ type: null });

  const activeFront = useMemo(
    () => fronts.find((front) => front.key === selectedFront) ?? fronts[0],
    [selectedFront],
  );

  const openFrontPage = (front: FrontSummary) => {
    setSelectedFront(front.key);
    setView({ type: 'front', key: front.key, label: front.label });
  };

  const openAccountPage = (name: string) => setView({ type: 'account', key: name, label: name });
  const openActionPage = (title: string) => setView({ type: 'action', key: title, label: title });
  const closeDetailPage = () => setView({ type: null });

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-6 xl:px-8">
        <section className="overflow-hidden rounded-[28px] bg-[#10358f] text-white shadow-[0_20px_60px_rgba(16,53,143,0.22)]">
          <div className="px-6 py-6 md:px-8 md:py-7">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90">
              Desempenho
            </span>
            <div className="mt-4 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
              <div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-[34px]">
                  Ler performance, entender causas e decidir onde agir.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  Resultado da operação no período, com contexto para priorizar as próximas decisões sem perder consequência comercial.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">{metric.label}</div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/72">
                      <span>Anterior {metric.previous}</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-white">{metric.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Buscar frente, vertical, owner ou conta
            </div>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Período: últimos 30 dias</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Dimensão principal: situacional</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Owners: todos</button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            eyebrow="Situação do período"
            title="O que realmente aconteceu nesta janela"
            description="Antes de descer para conta, owner ou ação isolada, a página precisa mostrar o quadro situacional: o que ganhou força, o que perdeu continuidade e o que isso muda na decisão agora."
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quadro situacional</div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Não é só evolução temporal. É leitura com contexto.</h3>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    A operação avançou onde houve combinação entre qualidade da origem, continuidade de owners e melhor profundidade em contas estratégicas. O risco caiu, mas ainda existe fragilidade em CRM, handoff e distribuição de execução.
                  </p>
                </div>
                <StatusPill tone="warning">Leitura situacional</StatusPill>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {macroTimeline.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</div>
                      </div>
                      <StatusPill tone={item.tone}>{item.delta}</StatusPill>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Anterior {item.previous}</div>
                    <div className="mt-4">
                      <SparkBars
                        values={item.points}
                        tone={item.tone === 'positive' ? 'emerald' : item.tone === 'warning' ? 'amber' : 'rose'}
                      />
                    </div>
                    <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">O que puxou:</span> {item.why}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Por que importa:</span> {item.whyItMatters}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Síntese orientada à decisão</div>
                <div className="mt-4 space-y-3">
                  {situationalNotes.map((note) => (
                    <div key={note.type} className={cn('rounded-2xl border p-4 text-sm', toneClasses(note.tone as any))}>
                      <div className="font-semibold">{note.type}</div>
                      <p className="mt-1 leading-6">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Para onde essa leitura deve levar</div>
                <div className="mt-4 space-y-3">
                  {fronts.slice(0, 3).map((front) => (
                    <button
                      key={front.key}
                      onClick={() => openFrontPage(front)}
                      className="block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Abrir página de {front.label.toLowerCase()}</div>
                          <div className="mt-1 text-sm text-slate-500">{front.recommendedAction}</div>
                        </div>
                        <StatusPill tone={front.status}>{front.status}</StatusPill>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            eyebrow="Desdobramento"
            title="A leitura situacional precisa se desdobrar em frentes navegáveis"
            description="Cada frente abaixo funciona como uma camada de decisão. Não é só leitura. Cada uma abre contexto próprio, contas relacionadas e ações concretas."
            right={
              <div className="flex flex-wrap gap-2">
                {fronts.map((front) => (
                  <button
                    key={front.key}
                    onClick={() => setSelectedFront(front.key)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-sm font-medium transition',
                      selectedFront === front.key
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                    )}
                  >
                    {front.label}
                  </button>
                ))}
              </div>
            }
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Frente ativa</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{activeFront.label}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeFront.summary}</p>
                </div>
                <StatusPill tone={activeFront.status}>{activeFront.status}</StatusPill>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Atual</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{activeFront.current}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Anterior</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{activeFront.previous}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Delta</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{activeFront.delta}</div>
                </div>
              </div>

              <div className="mt-5">
                <SparkBars
                  values={activeFront.bars}
                  tone={activeFront.status === 'crítico' ? 'rose' : activeFront.status === 'atenção' ? 'amber' : activeFront.status === 'oportunidade' ? 'sky' : 'emerald'}
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">O que sustentou o resultado</div>
                  <p className="mt-2 leading-6">{activeFront.why}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-900">O que isso muda na decisão</div>
                  <p className="mt-2 leading-6">{activeFront.implication}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ação concreta da frente</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">{activeFront.recommendedAction}</div>
                  </div>
                  <button
                    onClick={() => openFrontPage(activeFront)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Abrir página da frente
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contas puxadas por esta frente</div>
                <div className="mt-4 space-y-3">
                  {activeFront.relatedAccounts.map((account) => (
                    <button
                      key={account.name}
                      onClick={() => openAccountPage(account.name)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{account.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{account.reason}</div>
                        <div className="mt-2 text-xs text-slate-400">Owner: {account.owner}</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{account.impact}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ações relacionadas</div>
                <div className="mt-4 space-y-3">
                  {activeFront.relatedActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={() => openActionPage(action.title)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{action.team}</div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>SLA {action.sla}</div>
                        <div className="mt-1 font-medium text-slate-700">{action.outcome}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            eyebrow="Diagnóstico"
            title="Depois da situação e do desdobramento, vêm os gargalos"
            description="O diagnóstico vem antes da lista de contas e antes da fila de owners. Ele explica onde a eficiência quebra e quais frentes merecem reação imediata."
          />

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {diagnosisCards.map((card) => (
              <div key={card.title} className={cn('rounded-[24px] border p-5', toneClasses(card.tone as any))}>
                <div className="text-sm font-semibold">{card.title}</div>
                <p className="mt-3 text-sm leading-6">{card.cause}</p>
                <div className="mt-4 rounded-2xl bg-white/70 p-3 text-sm">
                  <span className="font-semibold">Decisão sugerida:</span> {card.decision}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            eyebrow="Consequência"
            title="Só depois da leitura macro, disso tudo ganha consequência"
            description="Aqui a página desce para conta, owner e ação ligada. Não como ponto de partida, e sim como consequência natural da leitura anterior."
          />

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.4fr_1fr_1.4fr_0.8fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <div>Conta</div>
              <div>Owner</div>
              <div>Ação ligada</div>
              <div>Status</div>
              <div>Consequência</div>
            </div>
            {impactRows.map((row) => (
              <div key={row.account} className="grid grid-cols-[1.4fr_1fr_1.4fr_0.8fr_1fr] gap-4 border-b border-slate-200 px-4 py-4 text-sm last:border-b-0">
                <button onClick={() => openAccountPage(row.account)} className="text-left font-semibold text-slate-900 hover:text-slate-700">
                  {row.account}
                </button>
                <div className="text-slate-600">{row.owner}</div>
                <button onClick={() => openActionPage(row.action)} className="text-left text-slate-700 hover:text-slate-900">
                  {row.action}
                </button>
                <div className="text-slate-600">{row.status}</div>
                <div className="font-semibold text-slate-900">{row.consequence}</div>
              </div>
            ))}
          </div>
        </section>

        {view.type && (
          <section className="rounded-[30px] border border-slate-900 bg-slate-950 p-5 text-white shadow-[0_25px_80px_rgba(15,23,42,0.38)] md:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Página acionada</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{view.label}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
                  Esta camada existe para que clique em frente, conta ou ação leve a contexto real e continuidade. Não é botão morto e não é popup sem função.
                </p>
              </div>
              <button
                onClick={closeDetailPage}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Voltar para Desempenho
              </button>
            </div>

            {view.type === 'front' && (
              <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Visão da frente</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-white/45">Atual</div>
                        <div className="mt-2 text-sm font-semibold">{activeFront.current}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-white/45">Anterior</div>
                        <div className="mt-2 text-sm font-semibold">{activeFront.previous}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs text-white/45">Delta</div>
                        <div className="mt-2 text-sm font-semibold">{activeFront.delta}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/75">
                    <div className="font-semibold text-white">O que sustentou o resultado</div>
                    <p className="mt-2">{activeFront.why}</p>
                    <div className="mt-4 font-semibold text-white">O que puxou risco</div>
                    <p className="mt-2">{activeFront.implication}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Contas relacionadas</div>
                    <div className="mt-3 space-y-3">
                      {activeFront.relatedAccounts.map((account) => (
                        <button
                          key={account.name}
                          onClick={() => openAccountPage(account.name)}
                          className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                        >
                          <div className="text-sm font-semibold text-white">{account.name}</div>
                          <div className="mt-1 text-sm text-white/65">{account.reason}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/45">Ações concretas desta frente</div>
                    <div className="mt-3 space-y-3">
                      {activeFront.relatedActions.map((action) => (
                        <button
                          key={action.title}
                          onClick={() => openActionPage(action.title)}
                          className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                        >
                          <div className="text-sm font-semibold text-white">{action.title}</div>
                          <div className="mt-1 text-sm text-white/65">{action.outcome}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view.type === 'account' && (
              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Resumo da conta</div>
                  <div className="mt-3 text-lg font-semibold">{view.label}</div>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Esta conta entrou na consequência da leitura por combinar impacto comercial, continuidade operacional e necessidade concreta de ação. Aqui a navegação deve levar para a futura página de conta, com timeline, sinais, comitê, owners e plays relacionados.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">Abrir perfil da empresa</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">Abrir contas relacionadas e aprendizados</div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Próximos passos concretos</div>
                  <div className="mt-3 space-y-3 text-sm text-white/75">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir página da conta</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir ação ligada</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir owner responsável</div>
                  </div>
                </div>
              </div>
            )}

            {view.type === 'action' && (
              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Ação concreta</div>
                  <div className="mt-3 text-lg font-semibold">{view.label}</div>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Esta camada existe para ligar performance a execução. A ação precisa ter contexto, motivo, SLA, owner, conta conectada e resultado esperado. Na evolução da plataforma, este clique deve abrir a página de Ação ou o detalhe operacional correspondente.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Encaminhamentos</div>
                  <div className="mt-3 space-y-3 text-sm text-white/75">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir owner responsável</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir conta impactada</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Abrir histórico de execução</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
