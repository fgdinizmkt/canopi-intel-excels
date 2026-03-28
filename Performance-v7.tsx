import { useMemo, useState } from 'react';

type FrontKey = 'abm' | 'abx' | 'seo' | 'inbound' | 'paid' | 'social' | 'events';
type DetailType = 'front' | 'account' | 'action' | 'journey' | null;

type Front = {
  key: FrontKey;
  label: string;
  status: 'saudável' | 'atenção' | 'crítico' | 'oportunidade';
  confidence: 'Alta' | 'Média' | 'Baixa';
  impact: string;
  context: string;
  integrations: string[];
  metrics: { label: string; value: string; delta: string }[];
  trend: number[];
  mix: { label: string; value: number }[];
  notes: { title: string; text: string }[];
  accounts: { name: string; owner: string; impact: string; note: string }[];
  actions: { title: string; team: string; sla: string; expected: string }[];
  nurture?: { flow: string; performance: string; emailModel: string }[];
};

type DetailState = {
  type: DetailType;
  label?: string;
};

const heroMetrics = [
  { label: 'Pipeline influenciado', value: 'R$ 5,4M', previous: 'R$ 4,8M', delta: '+12,5%' },
  { label: 'Receita sob risco', value: 'R$ 1,3M', previous: 'R$ 1,5M', delta: '-13,3%' },
  { label: 'SLA operacional', value: '79%', previous: '84%', delta: '-5 p.p.' },
  { label: 'Execução efetiva', value: '41 / 56', previous: '37 / 51', delta: '+4 ações' },
];

const summaryCards = [
  { label: 'Pipeline influenciado', value: 'R$ 5,4M', delta: '+12,5%', tone: 'positive' },
  { label: 'Risco de churn / perda', value: 'R$ 620 mil', delta: '-8,1%', tone: 'warning' },
  { label: 'Risco por não avanço', value: 'R$ 430 mil', delta: '-2,4%', tone: 'warning' },
  { label: 'Risco por atraso operacional', value: 'R$ 250 mil', delta: '-1,8%', tone: 'warning' },
  { label: 'Execução efetiva', value: '41 / 56', delta: '+4 ações', tone: 'positive' },
  { label: 'Qualidade dos dados', value: '82%', delta: '+3 p.p.', tone: 'positive' },
  { label: 'Qualidade das integrações', value: '68%', delta: '-4 p.p.', tone: 'warning' },
  { label: 'Confiança da leitura', value: 'Média-alta', delta: 'Dados críticos ok', tone: 'neutral' },
] as const;

const macroSeries = [
  { label: 'Pipeline influenciado', values: [32, 38, 46, 55, 68, 79], tone: 'emerald' },
  { label: 'Risco de churn / perda', values: [64, 62, 60, 56, 51, 46], tone: 'rose' },
  { label: 'Risco por não avanço', values: [53, 55, 52, 47, 43, 39], tone: 'amber' },
  { label: 'Risco por atraso operacional', values: [48, 46, 45, 42, 39, 35], tone: 'sky' },
] as const;

const fronts: Front[] = [
  {
    key: 'abm',
    label: 'ABM',
    status: 'saudável',
    confidence: 'Alta',
    impact: '+R$ 690 mil',
    context: 'ABM segue como frente mais consistente entre prioridade de conta, narrativa, sponsor e avanço comercial. A principal oportunidade é ampliar o padrão vencedor para mais contas semelhantes.',
    integrations: ['CRM', 'HubSpot', 'Apollo'],
    metrics: [
      { label: 'Contas priorizadas', value: '34', delta: '+5' },
      { label: 'Contas com avanço', value: '17', delta: '+4' },
      { label: 'Pipeline influenciado', value: 'R$ 690 mil', delta: '+18%' },
      { label: 'Executivos ativos', value: '26', delta: '+7' },
    ],
    trend: [39, 47, 54, 63, 72, 86],
    mix: [
      { label: 'Contas com sponsor', value: 74 },
      { label: 'Narrativa aderente', value: 81 },
      { label: 'Continuidade', value: 67 },
      { label: 'Execução de owners', value: 72 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Narrativas mais específicas e melhor profundidade de conta sustentaram avanço.' },
      { title: 'Onde ainda falha', text: 'Ainda existe dependência excessiva de poucos owners em contas estratégicas.' },
      { title: 'O que isso muda', text: 'ABM deve puxar padrão de qualidade para outras frentes, não só volume de execução.' },
    ],
    accounts: [
      { name: 'MSD Saúde', owner: 'Pablo Diniz', impact: '+R$ 480 mil', note: 'Narrativa e continuidade puxaram avanço comercial.' },
      { name: 'Minerva Foods', owner: 'Elber Costa', impact: '+R$ 210 mil', note: 'Conta avançou com combinação forte de sponsor e timing.' },
    ],
    actions: [
      { title: 'Expandir padrão vencedor para contas lookalike', team: 'ABM + Conteúdo', sla: '48h', expected: 'Escalar avanço em contas com aderência semelhante.' },
      { title: 'Redistribuir acompanhamento entre owners', team: 'Gestão Operacional', sla: '24h', expected: 'Reduzir dependência operacional concentrada.' },
    ],
    nurture: [
      { flow: 'Nurture executivo', performance: 'Abertura 41%, clique 13%, avanço 4 contas', emailModel: 'Prova + narrativa setorial' },
      { flow: 'Nurture de comitê', performance: 'Abertura 37%, clique 11%, 2 replies', emailModel: 'Dor operacional + caso semelhante' },
    ],
  },
  {
    key: 'abx',
    label: 'ABX',
    status: 'oportunidade',
    confidence: 'Média',
    impact: '+R$ 520 mil',
    context: 'ABX ganhou força quando marketing, pré-vendas e comercial atuaram sobre as mesmas contas com contexto compartilhado. O ganho está em coordenação, não só em ativação.',
    integrations: ['CRM', 'HubSpot', 'Salesforce'],
    metrics: [
      { label: 'Contas em orquestração', value: '21', delta: '+6' },
      { label: 'Squads ativos', value: '5', delta: '+1' },
      { label: 'Contas com toque multicanal', value: '14', delta: '+4' },
      { label: 'Pipeline influenciado', value: 'R$ 520 mil', delta: '+16%' },
    ],
    trend: [28, 33, 39, 51, 63, 71],
    mix: [
      { label: 'Coordenação entre áreas', value: 69 },
      { label: 'Multicanal por conta', value: 63 },
      { label: 'Continuidade por jornada', value: 58 },
      { label: 'Penetração em comitê', value: 54 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Contas com coordenação real entre áreas tiveram melhor continuidade.' },
      { title: 'Onde ainda falha', text: 'Ainda faltam sinais mais claros de progresso por jornada em algumas contas.' },
      { title: 'O que isso muda', text: 'ABX precisa aparecer como leitura de relacionamento e penetração, não só como canal paralelo.' },
    ],
    accounts: [
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: '+R$ 170 mil', note: 'Conta respondeu melhor quando houve coordenação entre marketing e SDR.' },
      { name: 'FHLB', owner: 'Ligia Martins', impact: '+R$ 90 mil', note: 'Penetração parcial do comitê, com boa resposta a múltiplos toques.' },
    ],
    actions: [
      { title: 'Abrir leitura de jornada por conta em orquestração', team: 'ABX + Ops', sla: '48h', expected: 'Dar visibilidade ao progresso por relacionamento.' },
      { title: 'Priorizar contas com penetração parcial e intenção recente', team: 'ABX + SDR', sla: '24h', expected: 'Aumentar continuidade onde já existe tração.' },
    ],
    nurture: [
      { flow: 'Nurture por jornada de conta', performance: 'Abertura 36%, clique 9%, 3 reuniões', emailModel: 'Dor + multitoque + prova' },
      { flow: 'Nurture de expansão', performance: 'Abertura 33%, clique 10%, 1 reply executivo', emailModel: 'Caso + próximo passo operacional' },
    ],
  },
  {
    key: 'seo',
    label: 'SEO',
    status: 'oportunidade',
    confidence: 'Média',
    impact: '+R$ 420 mil',
    context: 'SEO ganhou força em descoberta e intenção qualificada. GEO, AEO e AIO melhoraram principalmente em temas comparativos, integração e eficiência operacional.',
    integrations: ['GA4', 'Search Console'],
    metrics: [
      { label: 'GEO', value: '61', delta: '+9' },
      { label: 'AEO', value: '54', delta: '+7' },
      { label: 'AIO', value: '43', delta: '+5' },
      { label: 'Temas com tração', value: '18', delta: '+4' },
    ],
    trend: [28, 34, 39, 52, 61, 72],
    mix: [
      { label: 'Perguntas comparativas', value: 72 },
      { label: 'Problemas e dores', value: 64 },
      { label: 'Intenção comercial', value: 48 },
      { label: 'Páginas estratégicas', value: 41 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Perguntas comparativas passaram a gerar sessões mais qualificadas.' },
      { title: 'Onde ainda falha', text: 'Páginas estratégicas de fundo comercial ainda têm cobertura parcial.' },
      { title: 'O que isso muda', text: 'Vale abrir novos clusters antes de ampliar produção genérica.' },
    ],
    accounts: [
      { name: 'V.tal', owner: 'Camila Ribeiro', impact: '+R$ 190 mil', note: 'SEO sustentou descoberta e retomada.' },
      { name: 'MSD Saúde', owner: 'Pablo Diniz', impact: '+R$ 110 mil', note: 'Temas específicos ajudaram na qualificação.' },
    ],
    actions: [
      { title: 'Abrir páginas para termos com intenção alta', team: 'SEO + Conteúdo', sla: '48h', expected: 'Ganhar descoberta com melhor qualidade.' },
      { title: 'Expandir cluster de integração e eficiência', team: 'Conteúdo', sla: '72h', expected: 'Aumentar aderência em buscas mais maduras.' },
    ],
  },
  {
    key: 'inbound',
    label: 'Inbound',
    status: 'atenção',
    confidence: 'Alta',
    impact: '+R$ 380 mil',
    context: 'Inbound continua gerando demanda útil, mas perdeu velocidade entre descoberta, levantamento e resposta em contas enterprise.',
    integrations: ['HubSpot', 'GA4'],
    metrics: [
      { label: 'Leads qualificados', value: '186', delta: '+11%' },
      { label: 'Taxa de avanço', value: '24%', delta: '-3 p.p.' },
      { label: 'Tempo até resposta', value: '2,8 dias', delta: '+0,6' },
      { label: 'Ativos puxadores', value: '9', delta: '+2' },
    ],
    trend: [62, 60, 61, 57, 55, 51],
    mix: [
      { label: 'Descoberta', value: 78 },
      { label: 'Levantamento', value: 55 },
      { label: 'Resposta', value: 41 },
      { label: 'Continuidade', value: 38 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Conteúdo educativo e ativos de prova mantiveram o topo saudável.' },
      { title: 'Onde ainda falha', text: 'Handoff e contexto comercial incompleto travam avanço em contas maiores.' },
      { title: 'O que isso muda', text: 'Não é problema de volume. É problema de passagem e continuidade.' },
    ],
    accounts: [
      { name: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', impact: 'Risco de R$ 220 mil', note: 'Perdeu timing entre interesse e recomendação.' },
      { name: 'ArcelorMittal', owner: 'Célio Hira', impact: '+R$ 140 mil', note: 'Continuidade parcial após bom início.' },
    ],
    actions: [
      { title: 'Revisar handoff entre inbound e vendas', team: 'RevOps', sla: '24h', expected: 'Recuperar velocidade em contas enterprise.' },
      { title: 'Ajustar CTA dos ativos de maior valor', team: 'Conteúdo + Growth', sla: '72h', expected: 'Melhorar passagem para resposta.' },
    ],
    nurture: [
      { flow: 'Nurture de consideração', performance: 'Abertura 39%, clique 12%, avanço 6 contas', emailModel: 'Problema + prova + CTA leve' },
      { flow: 'Nurture de retomada', performance: 'Abertura 31%, clique 8%, 2 replies', emailModel: 'Recap + urgência operacional' },
    ],
  },
  {
    key: 'paid',
    label: 'Mídia Paga',
    status: 'crítico',
    confidence: 'Alta',
    impact: 'Risco de R$ 310 mil',
    context: 'Mídia paga elevou custo em grupos mais amplos e não sustentou avanço proporcional em continuidade e pipeline.',
    integrations: ['Google Ads', 'LinkedIn Ads', 'GA4'],
    metrics: [
      { label: 'Investimento', value: 'R$ 84 mil', delta: '+18%' },
      { label: 'CPL', value: 'R$ 312', delta: '+22%' },
      { label: 'Avanço útil', value: '11%', delta: '-4 p.p.' },
      { label: 'Segmentos com desperdício', value: '7', delta: '+3' },
    ],
    trend: [78, 74, 71, 63, 58, 49],
    mix: [
      { label: 'Clique', value: 79 },
      { label: 'Lead', value: 58 },
      { label: 'Levantamento', value: 34 },
      { label: 'Continuidade', value: 21 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Segmentos amplos mantiveram clique, mas sem progressão equivalente.' },
      { title: 'Onde ainda falha', text: 'ICP mais frouxo e baixa continuidade derrubam eficiência.' },
      { title: 'O que isso muda', text: 'A decisão é cortar desperdício e concentrar em aderência, não expandir orçamento.' },
    ],
    accounts: [
      { name: 'Minerva Foods', owner: 'Elber Costa', impact: '+R$ 130 mil', note: 'Melhor resposta em segmentação mais precisa.' },
      { name: 'NowVertical BR', owner: 'Pablo Diniz', impact: 'Risco operacional', note: 'Clique alto sem avanço comercial compatível.' },
    ],
    actions: [
      { title: 'Cortar grupos com clique sem continuidade', team: 'Mídia Paga', sla: 'Hoje', expected: 'Reduzir desperdício imediatamente.' },
      { title: 'Redistribuir budget para ICP com melhor aderência', team: 'Performance', sla: '24h', expected: 'Melhorar avanço útil do investimento.' },
    ],
  },
  {
    key: 'social',
    label: 'Mídia Social',
    status: 'atenção',
    confidence: 'Média',
    impact: '+R$ 90 mil',
    context: 'Social melhorou em prova, autoridade e apoio à jornada, mas ainda com atribuição parcial e pouco encadeamento direto em algumas contas.',
    integrations: ['LinkedIn', 'Meta'],
    metrics: [
      { label: 'Engajamento útil', value: '7,2%', delta: '+1,4 p.p.' },
      { label: 'Temas com resposta alta', value: '6', delta: '+2' },
      { label: 'Contas tocadas', value: '14', delta: '+5' },
      { label: 'Confiança da atribuição', value: '54%', delta: '+6 p.p.' },
    ],
    trend: [33, 38, 42, 47, 51, 57],
    mix: [
      { label: 'Prova e autoridade', value: 71 },
      { label: 'Amplificação', value: 66 },
      { label: 'Jornada de conta', value: 44 },
      { label: 'Atribuição', value: 31 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Conteúdos de prova, bastidor e aplicação prática responderam melhor.' },
      { title: 'Onde ainda falha', text: 'A jornada até conta e oportunidade ainda aparece de forma parcial.' },
      { title: 'O que isso muda', text: 'Social deve operar mais conectado a contas e plays, não isolado como awareness.' },
    ],
    accounts: [
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: '+R$ 60 mil', note: 'Engajamento ajudou aquecimento.' },
      { name: 'FHLB', owner: 'Ligia Martins', impact: 'Potencial de retomada', note: 'Influência visível, mas ainda sem fechamento claro.' },
    ],
    actions: [
      { title: 'Conectar posts de prova a jornadas específicas', team: 'Social + Growth', sla: '72h', expected: 'Dar consequência para temas que já tracionam.' },
      { title: 'Marcar contas impactadas por campanhas sociais', team: 'Ops', sla: '48h', expected: 'Melhorar a leitura da influência real.' },
    ],
  },
  {
    key: 'events',
    label: 'Eventos',
    status: 'oportunidade',
    confidence: 'Média',
    impact: '+R$ 260 mil',
    context: 'Eventos trouxeram abertura de relacionamento e reuniões, mas a disciplina pós-evento ainda varia muito por owner.',
    integrations: ['CRM', 'Planilhas'],
    metrics: [
      { label: 'Contas impactadas', value: '23', delta: '+8' },
      { label: 'Follow-up em dia', value: '61%', delta: '+9 p.p.' },
      { label: 'Reuniões geradas', value: '12', delta: '+4' },
      { label: 'Oportunidades abertas', value: '4', delta: '+2' },
    ],
    trend: [21, 29, 36, 48, 59, 66],
    mix: [
      { label: 'Aquecimento', value: 73 },
      { label: 'Follow-up', value: 61 },
      { label: 'Reuniões', value: 52 },
      { label: 'Oportunidade', value: 39 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Contas já aquecidas responderam melhor ao contato pós-evento.' },
      { title: 'Onde ainda falha', text: 'A passagem pós-evento continua muito dependente de disciplina individual.' },
      { title: 'O que isso muda', text: 'Eventos precisam de régua própria e visível, não ações soltas.' },
    ],
    accounts: [
      { name: 'MSD Animal Health', owner: 'Camila Ribeiro', impact: '+R$ 140 mil', note: 'Bom follow-up e evolução.' },
      { name: 'Grupo IN', owner: 'Fábio Diniz', impact: '+R$ 70 mil', note: 'Aquecimento consistente com continuidade parcial.' },
    ],
    actions: [
      { title: 'Abrir régua pós-evento para contas quentes', team: 'CRM + SDR', sla: '24h', expected: 'Ganhar continuidade operacional.' },
      { title: 'Priorizar reuniões com contas aquecidas', team: 'Comercial', sla: 'Hoje', expected: 'Converter calor em avanço real.' },
    ],
    nurture: [
      { flow: 'Pós-evento quente', performance: 'Abertura 42%, clique 15%, 4 reuniões', emailModel: 'Recap + próximo passo + urgência' },
      { flow: 'Pós-evento morno', performance: 'Abertura 29%, clique 7%, 1 reply', emailModel: 'Resumo + conteúdo de apoio' },
    ],
  },
];

const journeySteps = [
  { step: 'Origem do sinal', text: 'Paid perdeu continuidade, enquanto ABM, ABX e SEO sustentaram avanço qualificado.' },
  { step: 'Onde apareceu primeiro', text: 'A quebra ficou visível em handoff, contas enterprise e jornadas com owner instável.' },
  { step: 'Tipo de risco gerado', text: 'Parte do risco foi de churn/perda, parte de não avanço e parte de atraso operacional.' },
  { step: 'Ação disparada', text: 'Cortar desperdício em paid, reforçar handoff, abrir clusters SEO e estabilizar owners nas contas críticas.' },
  { step: 'Consequência esperada', text: 'Proteger receita, recuperar eficiência e tornar a próxima ação mais clara para cada frente.' },
];

const consequenceRows = [
  { account: 'MSD Saúde', owner: 'Pablo Diniz', action: 'Ajustar narrativa executiva para comitê', status: 'Evoluiu', impact: '+R$ 480 mil influenciados' },
  { account: 'V.tal', owner: 'Camila Ribeiro', action: 'Retomar resposta técnica e revisão', status: 'Risco por atraso', impact: '+14 dias no ciclo' },
  { account: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', action: 'Corrigir roteamento de leads inbound', status: 'Risco por não avanço', impact: 'Risco de R$ 220 mil' },
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

function BarChart({ values, tone }: { values: number[]; tone: 'emerald' | 'amber' | 'rose' | 'sky' }) {
  const color = {
    emerald: 'bg-emerald-500/85',
    amber: 'bg-amber-500/85',
    rose: 'bg-rose-500/85',
    sky: 'bg-sky-500/85',
  }[tone];
  const max = Math.max(...values);
  return (
    <div className="flex h-40 items-end gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
          <div className={cn('w-full rounded-t-2xl', color)} style={{ height: `${Math.max(18, (value / max) * 100)}%` }} />
          <div className="text-[10px] text-slate-400">S{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ items, tone }: { items: { label: string; value: number }[]; tone: 'emerald' | 'amber' | 'rose' | 'sky' }) {
  const bar = {
    emerald: 'bg-emerald-500/85',
    amber: 'bg-amber-500/85',
    rose: 'bg-rose-500/85',
    sky: 'bg-sky-500/85',
  }[tone];
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className={cn('h-full rounded-full', bar)} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, right }: { title: string; description: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 max-w-4xl text-sm text-slate-500">{description}</p>
      </div>
      {right}
    </div>
  );
}

export default function Performance() {
  const [selectedFront, setSelectedFront] = useState<FrontKey>('abm');
  const [detail, setDetail] = useState<DetailState>({ type: null });
  const front = useMemo(() => fronts.find((item) => item.key === selectedFront) ?? fronts[0], [selectedFront]);
  const tone = front.status === 'crítico' ? 'rose' : front.status === 'atenção' ? 'amber' : front.status === 'oportunidade' ? 'sky' : 'emerald';

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="mx-auto w-full max-w-[1480px] px-6 py-6 xl:px-8">
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
          <SectionHeader title="Resumo executivo" description="Leitura consolidada do período com separação explícita do risco de receita por perda, não avanço e atraso operacional." />
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
          <SectionHeader title="Leitura macro do período" description="Visualização geral do avanço e dos tipos de risco que exigem leitura mais profunda nas frentes abaixo." />
          <div className="mt-6 grid gap-5 xl:grid-cols-4">
            {macroSeries.map((series) => (
              <div key={series.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">{series.label}</div>
                <BarChart values={series.values as number[]} tone={series.tone as any} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Frentes que explicam o período" description="ABM e ABX aparecem junto das demais frentes para mostrar onde o diferencial do Canopi influencia avanço, risco e relacionamento." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {fronts.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedFront(item.key)}
                  className={cn(
                    'rounded-[24px] border p-4 text-left transition',
                    selectedFront === item.key ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={cn('text-base font-semibold', selectedFront === item.key ? 'text-white' : 'text-slate-900')}>{item.label}</div>
                      <div className={cn('mt-1 text-xs', selectedFront === item.key ? 'text-white/70' : 'text-slate-500')}>{item.confidence} confiança</div>
                    </div>
                    <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', toneClass(item.status), selectedFront === item.key && 'border-white/15 bg-white/10 text-white')}>
                      {item.status}
                    </span>
                  </div>
                  <div className={cn('mt-3 text-sm leading-6', selectedFront === item.key ? 'text-white/82' : 'text-slate-600')}>{item.context}</div>
                  <div className={cn('mt-4 text-lg font-semibold', selectedFront === item.key ? 'text-white' : 'text-slate-900')}>{item.impact}</div>
                </button>
              ))}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Frente selecionada</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{front.label}</h3>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{front.context}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {front.integrations.map((integration) => (
                    <span key={integration} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{integration}</span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-4">
                {front.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[20px] border border-slate-200 bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</div>
                    <div className="mt-1 text-xs text-slate-500">{metric.delta}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tendência da frente</div>
                    <BarChart values={front.trend} tone={tone as any} />
                  </div>
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Composição da leitura</div>
                    <HorizontalBars items={front.mix} tone={tone as any} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-3">
                    {front.notes.map((note) => (
                      <div key={note.title} className="rounded-[20px] border border-slate-200 bg-white p-4">
                        <div className="text-sm font-semibold text-slate-900">{note.title}</div>
                        <div className="mt-2 text-sm leading-6 text-slate-600">{note.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setDetail({ type: 'front', label: front.label })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir detalhe da frente</button>
                    <button onClick={() => setDetail({ type: 'journey', label: `${front.label} • Jornada` })} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Abrir jornada relacionada</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Contas, ações e nutrições ligadas à frente" description="Onde essa leitura aparece na operação, quais ações nascem dela e quais fluxos de nutrição estão sustentando ou travando o avanço." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contas puxadas por {front.label}</div>
              <div className="space-y-3">
                {front.accounts.map((account) => (
                  <button key={account.name} onClick={() => setDetail({ type: 'account', label: account.name })} className="flex w-full items-start justify-between gap-4 rounded-[20px] border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{account.name}</div>
                      <div className="mt-1 text-xs text-slate-500">Owner: {account.owner}</div>
                      <div className="mt-2 text-sm text-slate-600">{account.note}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{account.impact}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ações ligadas</div>
              <div className="space-y-3">
                {front.actions.map((action) => (
                  <button key={action.title} onClick={() => setDetail({ type: 'action', label: action.title })} className="flex w-full items-start justify-between gap-4 rounded-[20px] border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{action.team}</div>
                      <div className="mt-2 text-sm text-slate-600">{action.expected}</div>
                    </div>
                    <div className="text-xs text-slate-500">SLA {action.sla}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nutrições e modelos de e-mail</div>
              <div className="space-y-3">
                {(front.nurture ?? []).length === 0 ? (
                  <div className="rounded-[20px] border border-slate-200 bg-white p-4 text-sm text-slate-500">Sem fluxo de nutrição relevante nesta frente.</div>
                ) : (
                  front.nurture?.map((item) => (
                    <div key={item.flow} className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">{item.flow}</div>
                      <div className="mt-2 text-sm text-slate-600">{item.performance}</div>
                      <div className="mt-2 text-xs text-slate-500">Modelo: {item.emailModel}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Jornada da situação" description="Como o sinal apareceu, onde gerou consequência e que tipo de risco ou avanço foi produzido no período." right={<button onClick={() => setDetail({ type: 'journey', label: 'Jornada da situação' })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir jornada</button>} />
          <div className="mt-6 grid gap-4 xl:grid-cols-5">
            {journeySteps.map((item, index) => (
              <div key={item.step} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{index + 1}</div>
                <div className="text-sm font-semibold text-slate-900">{item.step}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Qualidade da leitura" description="Camada fixa da página para deixar claro o quanto os dados e as integrações sustentam ou limitam a confiança da análise." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Qualidade dos dados</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Completude</div><div className="mt-2 text-2xl font-semibold">82%</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Duplicidade</div><div className="mt-2 text-2xl font-semibold">4,1%</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Owner ausente</div><div className="mt-2 text-2xl font-semibold">17</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Senioridade mapeada</div><div className="mt-2 text-2xl font-semibold">63%</div></div>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Qualidade das integrações</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Conectadas</div><div className="mt-2 text-2xl font-semibold">9</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Parciais</div><div className="mt-2 text-2xl font-semibold">3</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Ausentes</div><div className="mt-2 text-2xl font-semibold">2</div></div>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4"><div className="text-xs text-slate-400">Falhas recentes</div><div className="mt-2 text-2xl font-semibold">4</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Consequência" description="Contas, owners e ações como efeito da leitura anterior, já conectadas à execução operacional e ao tipo de risco gerado." />
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[1.4fr_1fr_1.4fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <div>Conta</div><div>Owner</div><div>Ação ligada</div><div>Status</div><div>Impacto</div>
            </div>
            {consequenceRows.map((row) => (
              <div key={row.account} className="grid grid-cols-[1.4fr_1fr_1.4fr_1fr_1fr] gap-4 border-b border-slate-200 px-4 py-4 text-sm last:border-b-0">
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
                <p className="mt-2 max-w-3xl text-sm text-white/70">Camada para aprofundar contexto, análise, relação com jornada e continuidade operacional.</p>
              </div>
              <button onClick={() => setDetail({ type: null })} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/90">Voltar</button>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <button className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left text-sm">Abrir jornada completa</button>
              <button className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left text-sm">Abrir conta ou frente relacionada</button>
              <button className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left text-sm">Abrir ação operacional ligada</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
