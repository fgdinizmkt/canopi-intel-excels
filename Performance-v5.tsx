import { useMemo, useState } from 'react';

type FrontKey = 'seo' | 'inbound' | 'paid' | 'social' | 'events' | 'data' | 'integrations';
type DetailType = 'front' | 'account' | 'action' | null;

type DetailState = {
  type: DetailType;
  label?: string;
};

type Front = {
  key: FrontKey;
  label: string;
  status: 'saudável' | 'atenção' | 'crítico' | 'oportunidade';
  confidence: 'Alta' | 'Média' | 'Baixa';
  impact: string;
  trend: string;
  integrations: string[];
  summary: string;
  metrics: { label: string; value: string; delta: string }[];
  chart: number[];
  insights: string[];
  accounts: { name: string; owner: string; impact: string }[];
  actions: { title: string; team: string; sla: string }[];
};

const heroMetrics = [
  { label: 'Pipeline influenciado', value: 'R$ 5,4M', previous: 'R$ 4,8M', delta: '+12,5%' },
  { label: 'Receita em risco', value: 'R$ 1,3M', previous: 'R$ 1,5M', delta: '-13,3%' },
  { label: 'SLA operacional', value: '79%', previous: '84%', delta: '-5 p.p.' },
  { label: 'Execução efetiva', value: '41 / 56', previous: '37 / 51', delta: '+4 ações' },
];

const summaryCards = [
  { label: 'Pipeline influenciado', value: 'R$ 5,4M', delta: '+12,5%', tone: 'positive' },
  { label: 'Receita em risco', value: 'R$ 1,3M', delta: '-13,3%', tone: 'positive' },
  { label: 'Eficiência operacional', value: '79%', delta: '-5 p.p.', tone: 'warning' },
  { label: 'Execução efetiva', value: '41 / 56', delta: '+4 ações', tone: 'positive' },
  { label: 'Qualidade dos dados', value: '82%', delta: '+3 p.p.', tone: 'positive' },
  { label: 'Qualidade das integrações', value: '68%', delta: '-4 p.p.', tone: 'warning' },
  { label: 'Cobertura de canais', value: '6 / 7', delta: '1 parcial', tone: 'warning' },
  { label: 'Confiança da leitura', value: 'Média-alta', delta: 'Dados críticos ok', tone: 'neutral' },
] as const;

const fronts: Front[] = [
  {
    key: 'seo',
    label: 'SEO',
    status: 'oportunidade',
    confidence: 'Média',
    impact: '+R$ 420 mil',
    trend: 'GEO e AEO ganharam tração em perguntas comparativas e de problema.',
    integrations: ['GA4', 'Search Console'],
    summary: 'SEO ganhou força em descoberta e intenção qualificada, mas ainda com cobertura parcial de clusters e leitura incompleta de páginas estratégicas.',
    metrics: [
      { label: 'GEO', value: '61', delta: '+9' },
      { label: 'AEO', value: '54', delta: '+7' },
      { label: 'AIO', value: '43', delta: '+5' },
      { label: 'Temas com tração', value: '18', delta: '+4' },
    ],
    chart: [28, 35, 41, 56, 63, 72],
    insights: [
      'Perguntas comparativas passaram a puxar sessões mais qualificadas.',
      'Clusters ligados a integração e eficiência estão acima da média.',
      'Ainda faltam páginas fortes para termos mais comerciais.',
    ],
    accounts: [
      { name: 'V.tal', owner: 'Camila Ribeiro', impact: '+R$ 190 mil' },
      { name: 'MSD Saúde', owner: 'Pablo Diniz', impact: '+R$ 110 mil' },
    ],
    actions: [
      { title: 'Abrir páginas para termos com intenção alta', team: 'SEO + Conteúdo', sla: '48h' },
      { title: 'Reforçar cluster de integração', team: 'Conteúdo', sla: '72h' },
    ],
  },
  {
    key: 'inbound',
    label: 'Inbound',
    status: 'atenção',
    confidence: 'Alta',
    impact: '+R$ 380 mil',
    trend: 'Volume útil segue bom, mas a passagem para continuidade perdeu velocidade.',
    integrations: ['HubSpot', 'GA4'],
    summary: 'Inbound continua trazendo demanda relevante, porém a progressão entre interesse, levantamento e resposta desacelerou em contas enterprise.',
    metrics: [
      { label: 'Leads qualificados', value: '186', delta: '+11%' },
      { label: 'Taxa de avanço', value: '24%', delta: '-3 p.p.' },
      { label: 'Tempo até resposta', value: '2,8 dias', delta: '+0,6' },
      { label: 'Conteúdos puxadores', value: '9', delta: '+2' },
    ],
    chart: [62, 59, 61, 57, 54, 51],
    insights: [
      'O topo continua saudável, mas o meio do funil perdeu ritmo.',
      'Handoff incompleto afetou contas com ticket maior.',
      'Peças educativas seguem puxando descoberta útil.',
    ],
    accounts: [
      { name: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', impact: 'Risco de R$ 220 mil' },
      { name: 'ArcelorMittal', owner: 'Célio Hira', impact: '+R$ 140 mil' },
    ],
    actions: [
      { title: 'Revisar handoff entre inbound e vendas', team: 'RevOps', sla: '24h' },
      { title: 'Ajustar CTA de ativos enterprise', team: 'Conteúdo + Growth', sla: '72h' },
    ],
  },
  {
    key: 'paid',
    label: 'Mídia Paga',
    status: 'crítico',
    confidence: 'Alta',
    impact: 'Risco de R$ 310 mil',
    trend: 'Custo subiu, mas continuidade comercial não acompanhou.',
    integrations: ['Google Ads', 'LinkedIn Ads', 'GA4'],
    summary: 'Mídia paga elevou custo em grupos mais amplos e não sustentou avanço proporcional em pipeline e continuidade comercial.',
    metrics: [
      { label: 'Investimento', value: 'R$ 84 mil', delta: '+18%' },
      { label: 'CPL', value: 'R$ 312', delta: '+22%' },
      { label: 'Avanço útil', value: '11%', delta: '-4 p.p.' },
      { label: 'Segmentos com desperdício', value: '7', delta: '+3' },
    ],
    chart: [78, 74, 71, 63, 58, 49],
    insights: [
      'Segmentos amplos geraram clique, mas não sustentaram progressão.',
      'Paid perdeu eficiência em contas fora do ICP principal.',
      'As melhores campanhas estão nas segmentações mais restritas.',
    ],
    accounts: [
      { name: 'Minerva Foods', owner: 'Elber Costa', impact: '+R$ 130 mil' },
      { name: 'NowVertical BR', owner: 'Pablo Diniz', impact: 'Risco operacional' },
    ],
    actions: [
      { title: 'Cortar grupos com clique sem continuidade', team: 'Mídia Paga', sla: 'Hoje' },
      { title: 'Redistribuir budget para segmentos de melhor aderência', team: 'Performance', sla: '24h' },
    ],
  },
  {
    key: 'social',
    label: 'Mídia Social',
    status: 'atenção',
    confidence: 'Média',
    impact: '+R$ 90 mil',
    trend: 'Engajamento melhorou, mas influência direta na jornada ainda é parcial.',
    integrations: ['LinkedIn', 'Meta'],
    summary: 'Social está melhor para amplificação e prova de autoridade, mas ainda com baixa rastreabilidade completa de influência em contas e oportunidades.',
    metrics: [
      { label: 'Engajamento útil', value: '7,2%', delta: '+1,4 p.p.' },
      { label: 'Temas com resposta alta', value: '6', delta: '+2' },
      { label: 'Contas tocadas', value: '14', delta: '+5' },
      { label: 'Confiança da atribuição', value: '54%', delta: '+6 p.p.' },
    ],
    chart: [33, 38, 42, 47, 51, 57],
    insights: [
      'Conteúdo de prova e bastidor teve melhor resposta.',
      'Ainda existe limitação de atribuição de impacto.',
      'Pode apoiar ABM e inbound em contas aquecidas.',
    ],
    accounts: [
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: '+R$ 60 mil' },
      { name: 'FHLB', owner: 'Ligia Martins', impact: 'Potencial de retomada' },
    ],
    actions: [
      { title: 'Conectar posts de prova a jornadas específicas', team: 'Social + Growth', sla: '72h' },
      { title: 'Marcar contas impactadas por campanha social', team: 'Ops', sla: '48h' },
    ],
  },
  {
    key: 'events',
    label: 'Eventos',
    status: 'oportunidade',
    confidence: 'Média',
    impact: '+R$ 260 mil',
    trend: 'Eventos geraram contas aquecidas, mas follow-up ainda varia por owner.',
    integrations: ['CRM', 'Planilhas'],
    summary: 'Eventos estão gerando boa abertura de relacionamento e conversas iniciais, mas a continuidade pós-evento ainda precisa de mais disciplina operacional.',
    metrics: [
      { label: 'Contas impactadas', value: '23', delta: '+8' },
      { label: 'Follow-up em dia', value: '61%', delta: '+9 p.p.' },
      { label: 'Reuniões geradas', value: '12', delta: '+4' },
      { label: 'Oportunidades abertas', value: '4', delta: '+2' },
    ],
    chart: [21, 29, 36, 48, 59, 66],
    insights: [
      'Eventos funcionaram melhor em contas já aquecidas.',
      'Pós-evento ainda depende demais da disciplina do owner.',
      'Vale criar régua específica de continuidade.',
    ],
    accounts: [
      { name: 'MSD Animal Health', owner: 'Camila Ribeiro', impact: '+R$ 140 mil' },
      { name: 'Grupo IN', owner: 'Fábio Diniz', impact: '+R$ 70 mil' },
    ],
    actions: [
      { title: 'Abrir régua pós-evento para contas quentes', team: 'CRM + SDR', sla: '24h' },
      { title: 'Priorizar reuniões com contas aquecidas', team: 'Comercial', sla: 'Hoje' },
    ],
  },
  {
    key: 'data',
    label: 'Qualidade de Dados',
    status: 'atenção',
    confidence: 'Alta',
    impact: '82% de qualidade',
    trend: 'Campos críticos melhoraram, mas ainda há lacunas em owner, senioridade e enriquecimento.',
    integrations: ['CRM', 'HubSpot', 'Apollo'],
    summary: 'A qualidade dos dados evoluiu, mas ainda há pontos que limitam leitura fina e execução: owner ausente, duplicidade, lacunas de cargo e comitê comprador incompleto.',
    metrics: [
      { label: 'Completude', value: '82%', delta: '+3 p.p.' },
      { label: 'Duplicidade', value: '4,1%', delta: '-1,2 p.p.' },
      { label: 'Owner ausente', value: '17 contas', delta: '-5' },
      { label: 'Senioridade mapeada', value: '63%', delta: '+8 p.p.' },
    ],
    chart: [44, 49, 53, 61, 69, 82],
    insights: [
      'A melhoria de dado já aparece na qualidade da priorização.',
      'Ainda falta profundidade em comitê e liderança em contas enterprise.',
      'A ausência de owner continua sendo gargalo operacional.',
    ],
    accounts: [
      { name: 'FHLB', owner: 'Ligia Martins', impact: 'Baixa cobertura de contatos' },
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: 'Comitê incompleto' },
    ],
    actions: [
      { title: 'Corrigir contas sem owner', team: 'RevOps', sla: 'Hoje' },
      { title: 'Enriquecer liderança nas contas prioritárias', team: 'Dados + SDR', sla: '48h' },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrações',
    status: 'atenção',
    confidence: 'Média',
    impact: '68% de confiabilidade',
    trend: 'A base crítica está conectada, mas há fontes parciais e falhas que reduzem confiança em alguns diagnósticos.',
    integrations: ['HubSpot', 'Salesforce', 'GA4', 'Search Console', 'LinkedIn Ads'],
    summary: 'As integrações mais críticas estão disponíveis, mas ainda existem fontes parciais e falhas recentes que reduzem a confiança da leitura em social, mídia e eventos.',
    metrics: [
      { label: 'Conectadas', value: '9', delta: '+1' },
      { label: 'Parciais', value: '3', delta: '+1' },
      { label: 'Ausentes', value: '2', delta: '0' },
      { label: 'Falhas recentes', value: '4', delta: '+2' },
    ],
    chart: [74, 72, 71, 69, 68, 68],
    insights: [
      'LinkedIn Ads e eventos ainda entram com leitura parcial.',
      'Falhas pequenas já afetam confiança da atribuição.',
      'Integração é parte da análise, não rodapé técnico.',
    ],
    accounts: [
      { name: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', impact: 'Leitura parcial de origem' },
      { name: 'V.tal', owner: 'Camila Ribeiro', impact: 'Atribuição incompleta' },
    ],
    actions: [
      { title: 'Corrigir falha de sincronização em campanhas pagas', team: 'Ops + Mídia', sla: 'Hoje' },
      { title: 'Completar leitura de eventos e social', team: 'Ops', sla: '72h' },
    ],
  },
];

const journey = [
  { step: 'Origem do sinal', text: 'Paid perdeu continuidade enquanto SEO e ABM ganharam tração qualificada.' },
  { step: 'Frente afetada', text: 'Inbound e CRM sofreram no handoff, enquanto dados e owners explicaram parte do gargalo.' },
  { step: 'Consequência operacional', text: 'Contas enterprise com maior potencial desaceleraram na passagem entre interesse e avanço.' },
  { step: 'Ação disparada', text: 'Redistribuir budget, corrigir owner ausente, reforçar régua pós-evento e abrir clusters SEO com intenção alta.' },
  { step: 'Impacto esperado', text: 'Recuperar continuidade, proteger pipeline e aumentar a qualidade da priorização.' },
];

const insightCards = [
  {
    title: 'SEO ganhou tração em perguntas comparativas',
    evidence: 'GEO, AEO e AIO cresceram em clusters com intenção mais qualificada.',
    action: 'Abrir páginas e conteúdos para clusters de alto potencial.',
    tone: 'positive',
  },
  {
    title: 'Inbound perdeu velocidade no meio do funil',
    evidence: 'A passagem entre descoberta e resposta desacelerou em contas enterprise.',
    action: 'Rever handoff e CTA dos ativos mais críticos.',
    tone: 'warning',
  },
  {
    title: 'Mídia paga elevou custo sem sustentar avanço',
    evidence: 'Grupos mais amplos puxaram clique sem progressão equivalente.',
    action: 'Cortar desperdício e concentrar orçamento em ICP com melhor aderência.',
    tone: 'danger',
  },
];

const consequenceRows = [
  { account: 'MSD Saúde', owner: 'Pablo Diniz', action: 'Ajustar narrativa executiva para comitê', status: 'Evoluiu', impact: '+R$ 480 mil' },
  { account: 'V.tal', owner: 'Camila Ribeiro', action: 'Retomar resposta técnica e revisão', status: 'Em risco', impact: '+14 dias no ciclo' },
  { account: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', action: 'Corrigir roteamento de leads inbound', status: 'Recuperação', impact: 'Risco de R$ 220 mil' },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function toneClass(tone: string) {
  switch (tone) {
    case 'positive':
    case 'saudável':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'warning':
    case 'atenção':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'danger':
    case 'crítico':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'oportunidade':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function MiniBars({ values, tone }: { values: number[]; tone: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' }) {
  const color = {
    emerald: 'bg-emerald-500/80',
    amber: 'bg-amber-500/80',
    rose: 'bg-rose-500/80',
    sky: 'bg-sky-500/80',
    slate: 'bg-slate-500/80',
  }[tone];
  const max = Math.max(...values);
  return (
    <div className="flex h-24 items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      {values.map((v, i) => (
        <div key={`${v}-${i}`} className="flex flex-1 items-end">
          <div className={cn('w-full rounded-t-xl', color)} style={{ height: `${Math.max(18, (v / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title, description, right }: { title: string; description: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      {right}
    </div>
  );
}

export default function Performance() {
  const [selectedFront, setSelectedFront] = useState<FrontKey>('seo');
  const [detail, setDetail] = useState<DetailState>({ type: null });

  const front = useMemo(() => fronts.find((item) => item.key === selectedFront) ?? fronts[0], [selectedFront]);
  const tone = front.status === 'crítico' ? 'rose' : front.status === 'atenção' ? 'amber' : front.status === 'oportunidade' ? 'sky' : 'emerald';

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-6 xl:px-8">
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

        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Buscar conta, canal, campanha, owner ou situação</div>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Período: últimos 30 dias</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Dimensão principal: situacional</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Confiança: todas</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Integrações: todas</button>
            <button className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">Owners: todos</button>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle title="Resumo executivo" description="Leitura rápida do período, incluindo performance, qualidade da leitura e cobertura operacional." />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</div>
                  <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', toneClass(card.tone))}>{card.delta}</span>
                </div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle
            title="Mapa de frentes" 
            description="A página passa a ser explorada por frentes reais da operação. Cada bloco leva a uma leitura mais profunda, com gráfico, impacto, ações e jornada." 
          />
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fronts.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedFront(item.key)}
                    className={cn(
                      'rounded-[24px] border p-4 text-left transition',
                      selectedFront === item.key
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={cn('text-sm font-semibold', selectedFront === item.key ? 'text-white' : 'text-slate-900')}>{item.label}</div>
                        <div className={cn('mt-1 text-xs', selectedFront === item.key ? 'text-white/70' : 'text-slate-500')}>{item.confidence} confiança</div>
                      </div>
                      <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', toneClass(item.status), selectedFront === item.key && 'border-white/15 bg-white/10 text-white')}>
                        {item.status}
                      </span>
                    </div>
                    <div className={cn('mt-4 text-sm', selectedFront === item.key ? 'text-white/85' : 'text-slate-600')}>{item.trend}</div>
                    <div className={cn('mt-4 text-lg font-semibold', selectedFront === item.key ? 'text-white' : 'text-slate-900')}>{item.impact}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Frente selecionada</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{front.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{front.summary}</p>
                </div>
                <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', toneClass(front.status))}>{front.status}</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {front.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">{metric.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{metric.delta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle
            title="Aprofundamento da frente"
            description="Gráfico, contexto, contas e ações concretas para a frente selecionada."
            right={<button onClick={() => setDetail({ type: 'front', label: front.label })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir detalhe</button>}
          />
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {front.integrations.map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1">{item}</span>
                  ))}
                </div>
                <div className="mt-4">
                  <MiniBars values={front.chart} tone={tone as any} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {front.insights.map((insight) => (
                  <div key={insight} className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contas puxadas por esta frente</div>
                <div className="mt-4 space-y-3">
                  {front.accounts.map((account) => (
                    <button key={account.name} onClick={() => setDetail({ type: 'account', label: account.name })} className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{account.name}</div>
                        <div className="mt-1 text-xs text-slate-500">Owner: {account.owner}</div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{account.impact}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ações ligadas</div>
                <div className="mt-4 space-y-3">
                  {front.actions.map((action) => (
                    <button key={action.title} onClick={() => setDetail({ type: 'action', label: action.title })} className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{action.team}</div>
                      </div>
                      <div className="text-xs text-slate-500">SLA {action.sla}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle title="Jornada da situação" description="Da origem do sinal até a consequência operacional e comercial." />
          <div className="mt-6 grid gap-4 xl:grid-cols-5">
            {journey.map((item, index) => (
              <div key={item.step} className="relative rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{index + 1}</div>
                <div className="text-sm font-semibold text-slate-900">{item.step}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle title="Insights acionáveis" description="Evidência, causa provável e ação concreta para o período." />
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {insightCards.map((card) => (
              <div key={card.title} className={cn('rounded-[24px] border p-5', toneClass(card.tone))}>
                <div className="text-sm font-semibold">{card.title}</div>
                <div className="mt-3 text-sm leading-6">{card.evidence}</div>
                <div className="mt-4 rounded-2xl bg-white/70 p-3 text-sm"><span className="font-semibold">Ação recomendada:</span> {card.action}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle title="Qualidade da leitura" description="Dados e integrações como parte nativa do diagnóstico." />
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Qualidade dos dados</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Completude</div><div className="mt-2 text-2xl font-semibold">82%</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Duplicidade</div><div className="mt-2 text-2xl font-semibold">4,1%</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Owner ausente</div><div className="mt-2 text-2xl font-semibold">17</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Senioridade mapeada</div><div className="mt-2 text-2xl font-semibold">63%</div></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Qualidade das integrações</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Conectadas</div><div className="mt-2 text-2xl font-semibold">9</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Parciais</div><div className="mt-2 text-2xl font-semibold">3</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Ausentes</div><div className="mt-2 text-2xl font-semibold">2</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Falhas recentes</div><div className="mt-2 text-2xl font-semibold">4</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle title="Consequência" description="Contas, owners e ações como efeito da leitura anterior." />
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.4fr_1fr_1.4fr_0.8fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <div>Conta</div><div>Owner</div><div>Ação ligada</div><div>Status</div><div>Impacto</div>
            </div>
            {consequenceRows.map((row) => (
              <div key={row.account} className="grid grid-cols-[1.4fr_1fr_1.4fr_0.8fr_1fr] gap-4 border-b border-slate-200 px-4 py-4 text-sm last:border-b-0">
                <button onClick={() => setDetail({ type: 'account', label: row.account })} className="text-left font-semibold text-slate-900">{row.account}</button>
                <div className="text-slate-600">{row.owner}</div>
                <button onClick={() => setDetail({ type: 'action', label: row.action })} className="text-left text-slate-700">{row.action}</button>
                <div className="text-slate-600">{row.status}</div>
                <div className="font-semibold text-slate-900">{row.impact}</div>
              </div>
            ))}
          </div>
        </section>

        {detail.type && (
          <section className="mt-6 rounded-[28px] border border-slate-900 bg-slate-950 p-5 text-white shadow-[0_25px_80px_rgba(15,23,42,0.38)] md:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Detalhe acionado</div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{detail.label}</h3>
                <p className="mt-2 max-w-3xl text-sm text-white/70">Camada navegável para devolver função real à página: abrir frente, conta ou ação com contexto, impacto e continuidade.</p>
              </div>
              <button onClick={() => setDetail({ type: null })} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90">Voltar</button>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm">Abrir jornada completa</div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm">Abrir conta ou frente relacionada</div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm">Abrir ação operacional ligada</div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
