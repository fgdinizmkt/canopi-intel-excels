import { useMemo, useState } from 'react';

type FrontKey = 'seo' | 'inbound' | 'paid' | 'social' | 'events' | 'data' | 'integrations';
type DetailType = 'front' | 'account' | 'action' | null;

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
};

type DetailState = {
  type: DetailType;
  label?: string;
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
  },
  {
    key: 'data',
    label: 'Qualidade de Dados',
    status: 'atenção',
    confidence: 'Alta',
    impact: '82% de qualidade',
    context: 'A qualidade dos dados evoluiu, mas ainda há gargalos em owner ausente, senioridade, duplicidade e profundidade do comitê comprador.',
    integrations: ['CRM', 'HubSpot', 'Apollo'],
    metrics: [
      { label: 'Completude', value: '82%', delta: '+3 p.p.' },
      { label: 'Duplicidade', value: '4,1%', delta: '-1,2 p.p.' },
      { label: 'Owner ausente', value: '17 contas', delta: '-5' },
      { label: 'Senioridade mapeada', value: '63%', delta: '+8 p.p.' },
    ],
    trend: [44, 49, 53, 61, 69, 82],
    mix: [
      { label: 'Completude', value: 82 },
      { label: 'Profundidade de contato', value: 63 },
      { label: 'Owner correto', value: 71 },
      { label: 'Comitê completo', value: 46 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Melhor dado já aumentou a qualidade da priorização.' },
      { title: 'Onde ainda falha', text: 'Contas enterprise ainda sofrem com cobertura incompleta de liderança.' },
      { title: 'O que isso muda', text: 'Dado deixou de ser higiene e passou a ser parte da performance.' },
    ],
    accounts: [
      { name: 'FHLB', owner: 'Ligia Martins', impact: 'Baixa cobertura de contatos', note: 'Comitê insuficiente para avançar.' },
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: 'Comitê incompleto', note: 'Boa aderência, pouca profundidade.' },
    ],
    actions: [
      { title: 'Corrigir contas sem owner', team: 'RevOps', sla: 'Hoje', expected: 'Eliminar gargalo operacional imediato.' },
      { title: 'Enriquecer liderança nas contas prioritárias', team: 'Dados + SDR', sla: '48h', expected: 'Dar profundidade real às contas quentes.' },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrações',
    status: 'atenção',
    confidence: 'Média',
    impact: '68% de confiabilidade',
    context: 'As integrações críticas estão presentes, mas há fontes parciais e falhas recentes que afetam a confiança de social, mídia e eventos.',
    integrations: ['HubSpot', 'Salesforce', 'GA4', 'Search Console', 'LinkedIn Ads'],
    metrics: [
      { label: 'Conectadas', value: '9', delta: '+1' },
      { label: 'Parciais', value: '3', delta: '+1' },
      { label: 'Ausentes', value: '2', delta: '0' },
      { label: 'Falhas recentes', value: '4', delta: '+2' },
    ],
    trend: [74, 72, 71, 69, 68, 68],
    mix: [
      { label: 'Conectadas', value: 81 },
      { label: 'Parciais', value: 52 },
      { label: 'Confiáveis', value: 68 },
      { label: 'Críticas ausentes', value: 27 },
    ],
    notes: [
      { title: 'O que puxou', text: 'Base crítica está conectada e suficiente para leitura macro.' },
      { title: 'Onde ainda falha', text: 'Falhas pequenas já afetam atribuição e confiança em algumas frentes.' },
      { title: 'O que isso muda', text: 'Integração entra no centro da leitura, não como rodapé técnico.' },
    ],
    accounts: [
      { name: 'Carteiro Seguros Enterprise', owner: 'Ligia Martins', impact: 'Leitura parcial de origem', note: 'Atribuição ficou incompleta.' },
      { name: 'V.tal', owner: 'Camila Ribeiro', impact: 'Atribuição incompleta', note: 'Influência cruzada subestimada.' },
    ],
    actions: [
      { title: 'Corrigir falha de sincronização em campanhas pagas', team: 'Ops + Mídia', sla: 'Hoje', expected: 'Recuperar confiança na análise de mídia.' },
      { title: 'Completar leitura de eventos e social', team: 'Ops', sla: '72h', expected: 'Fechar lacunas de influência e jornada.' },
    ],
  },
];

const journeySteps = [
  { step: 'Origem do sinal', text: 'Paid perdeu continuidade e SEO ganhou tração qualificada em temas mais maduros.' },
  { step: 'Onde apareceu primeiro', text: 'A quebra ficou visível em inbound, handoff e contas enterprise com ticket maior.' },
  { step: 'O que foi afetado', text: 'Velocidade de avanço, continuidade operacional e confiança em parte da atribuição.' },
  { step: 'Ação disparada', text: 'Cortar desperdício em paid, reforçar handoff, abrir clusters SEO e corrigir owners ausentes.' },
  { step: 'Consequência esperada', text: 'Proteger pipeline, recuperar eficiência e melhorar a priorização das próximas ações.' },
];

const diagnosisCards = [
  {
    title: 'SEO puxou descoberta com mais aderência',
    evidence: 'GEO, AEO e AIO cresceram em temas comparativos e de problema.',
    decision: 'Expandir clusters de intenção alta e conectar ao fluxo comercial.',
    tone: 'positive',
  },
  {
    title: 'Inbound perdeu força no meio da jornada',
    evidence: 'A passagem entre descoberta, levantamento e resposta desacelerou em contas enterprise.',
    decision: 'Rever handoff e CTA de ativos com maior peso no pipeline.',
    tone: 'warning',
  },
  {
    title: 'Mídia paga continua com custo acima do que entrega',
    evidence: 'Grupos amplos mantêm clique, mas não sustentam continuidade e avanço útil.',
    decision: 'Reduzir desperdício e concentrar orçamento em ICP com melhor aderência.',
    tone: 'danger',
  },
];

const consequenceRows = [
  { account: 'MSD Saúde', owner: 'Pablo Diniz', action: 'Ajustar narrativa executiva para comitê', status: 'Evoluiu', impact: '+R$ 480 mil influenciados' },
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

function Bars({ values, tone }: { values: number[]; tone: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' }) {
  const color = {
    emerald: 'bg-emerald-500/85',
    amber: 'bg-amber-500/85',
    rose: 'bg-rose-500/85',
    sky: 'bg-sky-500/85',
    slate: 'bg-slate-500/85',
  }[tone];
  const max = Math.max(...values);
  return (
    <div className="flex h-44 items-end gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-2">
          <div className={cn('w-full rounded-t-2xl', color)} style={{ height: `${Math.max(20, (value / max) * 100)}%` }} />
          <div className="text-[10px] text-slate-400">S{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ items, tone }: { items: { label: string; value: number }[]; tone: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate' }) {
  const bar = {
    emerald: 'bg-emerald-500/85',
    amber: 'bg-amber-500/85',
    rose: 'bg-rose-500/85',
    sky: 'bg-sky-500/85',
    slate: 'bg-slate-500/85',
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
          <SectionHeader title="Resumo executivo" description="Resultado consolidado do período, qualidade da leitura e condições operacionais que sustentam ou limitam o avanço." />
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
          <SectionHeader title="Frentes que explicam o período" description="Cada frente mostra contexto, tendência, peso no resultado, contas afetadas e ações que nascem dessa leitura." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
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
                    <Bars values={front.trend} tone={tone as any} />
                  </div>
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Composição da leitura</div>
                    <HorizontalBars items={front.mix} tone={tone as any} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Leitura da frente</div>
                    <div className="space-y-3">
                      {front.notes.map((note) => (
                        <div key={note.title} className="rounded-[20px] border border-slate-200 bg-white p-4">
                          <div className="text-sm font-semibold text-slate-900">{note.title}</div>
                          <div className="mt-2 text-sm leading-6 text-slate-600">{note.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setDetail({ type: 'front', label: front.label })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Abrir detalhe da frente</button>
                    <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Abrir jornada relacionada</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Contas e ações geradas por esta frente" description="Onde essa leitura aparece na operação, quem está envolvido e o que precisa ser executado agora." />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Jornada da situação" description="Como o sinal apareceu, onde ganhou consequência e quais ações surgem dessa leitura." />
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
          <SectionHeader title="Diagnóstico" description="Evidências do período, leitura causal e decisão sugerida para cada frente prioritária." />
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {diagnosisCards.map((card) => (
              <div key={card.title} className={cn('rounded-[24px] border p-5', toneClass(card.tone))}>
                <div className="text-sm font-semibold">{card.title}</div>
                <div className="mt-3 text-sm leading-6">{card.evidence}</div>
                <div className="mt-4 rounded-2xl bg-white/70 p-3 text-sm"><span className="font-semibold">Decisão sugerida:</span> {card.decision}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader title="Qualidade da leitura" description="Confiabilidade da análise a partir de dados, cobertura e estado das integrações críticas." />
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
          <SectionHeader title="Consequência" description="Contas, owners e ações como efeito da leitura anterior, já conectadas à execução operacional." />
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
