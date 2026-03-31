import { useMemo, useState } from 'react';

type FrontKey = 'abm' | 'abx' | 'seo' | 'inbound' | 'paid' | 'social' | 'events';
type Confidence = 'Alta' | 'Média' | 'Baixa';
type Status = 'saudável' | 'atenção' | 'crítico' | 'oportunidade';

type Front = {
  key: FrontKey;
  label: string;
  status: Status;
  confidence: Confidence;
  impact: string;
  context: string;
  integrations: string[];
  metrics: { label: string; value: string; delta: string }[];
  trend: number[];
  mix: { label: string; value: number }[];
  accounts: { name: string; owner: string; impact: string; note: string }[];
  actions: { title: string; team: string; sla: string; expected: string }[];
  nurture?: { flow: string; performance: string; emailModel: string }[];
};

type DetailState =
  | { kind: 'front'; frontKey: FrontKey }
  | { kind: 'account'; name: string; summary: string; owner: string }
  | { kind: 'action'; title: string; team: string; expected: string }
  | { kind: 'tool'; name: string; source: string; issue: string; impact: string }
  | { kind: 'journey'; label: string }
  | null;

const heroMetrics = [
  { label: 'Pipeline influenciado', value: 'R$ 5,4M', previous: 'R$ 4,8M', delta: '+12,5%' },
  { label: 'Receita sob risco', value: 'R$ 1,3M', previous: 'R$ 1,5M', delta: '-13,3%' },
  { label: 'SLA operacional', value: '79%', previous: '84%', delta: '-5 p.p.' },
  { label: 'Execução efetiva', value: '41 / 56', previous: '37 / 51', delta: '+4 ações' },
];

const summaryCards = [
  { label: 'Risco de churn / perda', value: 'R$ 620 mil', delta: '-8,1%', tone: 'warning' },
  { label: 'Risco por não avanço', value: 'R$ 430 mil', delta: '-2,4%', tone: 'warning' },
  { label: 'Risco por atraso operacional', value: 'R$ 250 mil', delta: '-1,8%', tone: 'warning' },
  { label: 'Qualidade dos dados', value: '82%', delta: '+3 p.p.', tone: 'positive' },
  { label: 'Qualidade das integrações', value: '68%', delta: '-4 p.p.', tone: 'warning' },
  { label: 'Confiança da leitura', value: 'Média-alta', delta: 'Dados críticos ok', tone: 'neutral' },
] as const;

const macroSeries = [
  { label: 'Pipeline influenciado', values: [32, 38, 46, 55, 68, 79], tone: '#10b981' },
  { label: 'Risco de churn / perda', values: [64, 62, 60, 56, 51, 46], tone: '#f43f5e' },
  { label: 'Risco por não avanço', values: [53, 55, 52, 47, 43, 39], tone: '#f59e0b' },
  { label: 'Risco por atraso operacional', values: [48, 46, 45, 42, 39, 35], tone: '#0ea5e9' },
] as const;

const fronts: Front[] = [
  {
    key: 'abm',
    label: 'ABM',
    status: 'saudável',
    confidence: 'Alta',
    impact: '+R$ 690 mil',
    context: 'ABM segue como frente mais consistente entre prioridade de conta, narrativa, sponsor e avanço comercial.',
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
    accounts: [
      { name: 'MSD Saúde', owner: 'Pablo Diniz', impact: '+R$ 480 mil', note: 'Narrativa e continuidade puxaram avanço comercial.' },
      { name: 'Minerva Foods', owner: 'Elber Costa', impact: '+R$ 210 mil', note: 'Conta avançou com sponsor e timing.' },
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
    context: 'ABX ganha quando marketing, SDR e comercial atuam sobre as mesmas contas com contexto compartilhado.',
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
    accounts: [
      { name: 'Clever Devices', owner: 'Fábio Diniz', impact: '+R$ 170 mil', note: 'Conta respondeu melhor com coordenação entre marketing e SDR.' },
      { name: 'FHLB', owner: 'Ligia Martins', impact: '+R$ 90 mil', note: 'Boa resposta a múltiplos toques.' },
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
    context: 'SEO ganhou força em descoberta e intenção qualificada com GEO, AEO e AIO em temas comparativos e de eficiência.',
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
    context: 'Mídia paga elevou custo em grupos amplos e não sustentou avanço proporcional em continuidade e pipeline.',
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
    context: 'Social melhorou em prova, autoridade e apoio à jornada, mas ainda com atribuição parcial e pouco encadeamento direto.',
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

const toolDiagnostics = [
  { name: 'HubSpot', status: 'Conectado', source: 'Leads, fluxos, e-mails, lifecycle stage', issue: 'Alguns eventos de clique chegam com atraso em fluxos antigos.', impact: 'Pode subestimar performance de nutrição em algumas jornadas.' },
  { name: 'Salesforce', status: 'Parcial', source: 'Oportunidades, estágio, owner, contas', issue: 'Campos de motivo de perda e próximos passos estão inconsistentes.', impact: 'A leitura de risco por não avanço fica menos precisa.' },
  { name: 'GA4', status: 'Conectado', source: 'Sessões, conversão, páginas e eventos digitais', issue: 'Campanhas históricas têm UTMs incompletas.', impact: 'Atribuição digital fica parcial em alguns períodos.' },
  { name: 'Search Console', status: 'Conectado', source: 'Queries, páginas, cliques, impressões', issue: 'Cobertura limitada para páginas novas de fundo comercial.', impact: 'SEO pode parecer menor do que realmente está contribuindo.' },
  { name: 'LinkedIn Ads', status: 'Parcial', source: 'Campanhas, gasto, leads, segmentação', issue: 'Sincronização recente falhou em grupos específicos.', impact: 'Paid e influência social ficam subavaliados.' },
  { name: 'CRM', status: 'Conectado', source: 'Contas, owners, ações, histórico operacional', issue: 'Contas sem owner e lacunas de senioridade persistem.', impact: 'Priorização e continuidade perdem qualidade.' },
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
      return 'border-[#e2e8f0] bg-[#f8fafc] text-slate-700';
  }
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 300;
  const h = 120;
  const pad = 10;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (values.length - 1);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full rounded-2xl border border-[#e2e8f0] bg-white">
      <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / (values.length - 1);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return <circle key={`${v}-${i}`} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

function Bars({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f8fafc]">
              <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, right }: { title: string; description: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e2e8f0] pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 max-w-4xl text-sm text-slate-500">{description}</p>
      </div>
      {right}
    </div>
  );
}

const periodsData = [
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
  { id: 'trimestre', label: 'Trimestre atual' },
] as const;

type PeriodId = typeof periodsData[number]['id'];

const metricsByPeriod: Record<PeriodId, any> = {
  '7d':  { pipeline:'1,2M', pipelineDelta:'+4% vs semana ant.', receita:'280k', receitaDelta:'+3% vs meta', conversao:'74%', metaConversao:'75%', acoes:'12/18', acoesRate:'67%', score:'79%', scoreTrend:'Estável' },
  '30d': { pipeline:'5,4M', pipelineDelta:'+12% vs mês ant.', receita:'1,3M', receitaDelta:'+8% vs meta', conversao:'79%', metaConversao:'75%', acoes:'41/56', acoesRate:'73%', score:'82%', scoreTrend:'Médio-alto' },
  '90d': { pipeline:'14,2M', pipelineDelta:'+18% vs trim. ant.', receita:'3,8M', receitaDelta:'+11% vs meta', conversao:'81%', metaConversao:'75%', acoes:'128/164', acoesRate:'78%', score:'84%', scoreTrend:'Alto' },
  'trimestre': { pipeline:'14,2M', pipelineDelta:'+18% vs Q4 2025', receita:'3,8M', receitaDelta:'+11% vs meta', conversao:'81%', metaConversao:'75%', acoes:'128/164', acoesRate:'78%', score:'84%', scoreTrend:'Alto' },
};

const frentesData = [
  {id:'abm',name:'ABM',tagline:'Contas estratégicas · Playbooks ativos',icon:'🎯',color:'#2b44ff',bg:'#eff2ff',statusLabel:'Acima da meta',statusTone:'positive',
   chartPoints:'5,44 30,38 55,30 80,22 105,15 130,10 155,7 195,4',
   kpis:[{label:'Pipeline',value:'R$ 620k',delta:'+18%'},{label:'Contas ativas',value:'8',delta:'+2'},{label:'Reuniões geradas',value:'17',delta:'+5'},{label:'Taxa de avanço',value:'68%',delta:'+6%'}],
   squad:[{name:'Pablo Diniz',sla:82},{name:'Camila Ribeiro',sla:91}]},
  {id:'abx',name:'ABX',tagline:'Orquestrações ativas · Engajamento multicanal',icon:'🔄',color:'#7c3aed',bg:'#f5f3ff',statusLabel:'No plano',statusTone:'neutral',
   chartPoints:'5,46 30,42 55,36 80,30 105,25 130,20 155,16 195,12',
   kpis:[{label:'Pipeline',value:'R$ 430k',delta:'+7%'},{label:'Orquestrações',value:'6',delta:'+1'},{label:'Toques totais',value:'284',delta:'+22%'},{label:'Engajamento',value:'34%',delta:'+8%'}],
   squad:[{name:'Julia Mendes',sla:76},{name:'Elber Costa',sla:68}]},
  {id:'outbound',name:'Outbound',tagline:'Cadências · Taxa de resposta · Leads',icon:'📡',color:'#ea580c',bg:'#fff7ed',statusLabel:'Abaixo da meta',statusTone:'danger',
   chartPoints:'5,18 30,22 55,20 80,26 105,30 130,34 155,38 195,42',
   kpis:[{label:'Taxa de resposta',value:'3,2%',delta:'-4,8%'},{label:'Leads gerados',value:'12',delta:'-8'},{label:'Cadências ativas',value:'3',delta:''},{label:'Contas abordadas',value:'34',delta:''}],
   squad:[{name:'Daniel Rocha',sla:64},{name:'Ligia Martins',sla:88}]},
  {id:'seo',name:'SEO / Orgânico',tagline:'Posições · Tráfego qualificado · Leads',icon:'🔍',color:'#16a34a',bg:'#f0fdf4',statusLabel:'Em recuperação',statusTone:'warning',
   chartPoints:'5,28 30,26 55,32 80,38 105,35 130,28 155,22 195,18',
   kpis:[{label:'Posição média',value:'14ª',delta:'-8 pos.'},{label:'Tráfego org.',value:'4.200',delta:'-18%'},{label:'Leads org.',value:'38',delta:'-12'},{label:'Keywords top10',value:'23',delta:'-3'}],
   squad:[{name:'Marina Costa',sla:79}]},
  {id:'midia',name:'Mídia Paga',tagline:'Google Ads · LinkedIn Ads · ROAS',icon:'💰',color:'#d97706',bg:'#fffbeb',statusLabel:'Incidente ativo',statusTone:'danger',
   chartPoints:'5,12 30,15 55,12 80,18 105,35 130,42 155,46 195,48',
   kpis:[{label:'CTR médio',value:'1,2%',delta:'-45%'},{label:'ROAS',value:'1,8x',delta:'-2,1x'},{label:'CPC médio',value:'R$ 8,40',delta:'+38%'},{label:'Conversões',value:'3',delta:'-72%'}],
   squad:[{name:'Ana Paula Silva',sla:72}]},
  {id:'inbound',name:'Inbound',tagline:'Leads qualificados · Score · SLA',icon:'📥',color:'#2b44ff',bg:'#eff2ff',statusLabel:'SLA em risco',statusTone:'warning',
   chartPoints:'5,44 30,38 55,32 80,26 105,22 130,18 155,14 195,8',
   kpis:[{label:'Leads recebidos',value:'28',delta:'+6'},{label:'Score médio',value:'76',delta:'+4'},{label:'SLA médio',value:'38min',delta:'-meta'},{label:'Atribuídos',value:'27/28',delta:''}],
   squad:[{name:'Ligia Martins',sla:88},{name:'Carlos Eduardo',sla:74}]},
  {id:'social',name:'Redes Sociais',tagline:'LinkedIn · Instagram · Alcance',icon:'📱',color:'#a855f7',bg:'#fdf4ff',statusLabel:'Estável',statusTone:'neutral',
   chartPoints:'5,40 30,36 55,32 80,28 105,25 130,22 155,20 195,18',
   kpis:[{label:'Alcance orgânico',value:'28k',delta:'+12%'},{label:'Engajamento',value:'3,8%',delta:'+0,4%'},{label:'Leads via social',value:'8',delta:'+3'},{label:'Seguidores',value:'4.280',delta:'+140'}],
   squad:[{name:'Camila Ribeiro',sla:85}]},
  {id:'squads',name:'Squads · SLA',tagline:'Performance de execução por owner',icon:'👥',color:'#16a34a',bg:'#f0fdf4',statusLabel:'84% SLA global',statusTone:'positive',
   chartPoints:'5,34 30,28 55,24 80,20 105,16 130,14 155,11 195,8',
   kpis:[{label:'SLA global',value:'84%',delta:'+6%'},{label:'Ações concluídas',value:'41/56',delta:'73%'},{label:'Backlog',value:'15',delta:'+3'},{label:'Tempo médio',value:'18h',delta:'-4h'}],
   squad:[{name:'Pablo Diniz',sla:82},{name:'Daniel Rocha',sla:64},{name:'Marina Costa',sla:79},{name:'Ligia Martins',sla:88}]},
];

const channelsData = [
  { name:'ABM', value:'620k', delta:'+18%', pct:46, color:'#2b44ff', score:92 },
  { name:'ABX', value:'430k', delta:'+7%', pct:32, color:'#7c3aed', score:78 },
  { name:'Orgânico', value:'180k', delta:'+22%', pct:14, color:'#10b981', score:74 },
  { name:'Inbound', value:'120k', delta:'+5%', pct:9, color:'#f59e0b', score:68 },
  { name:'Outbound', value:'250k', delta:'-4%', pct:19, color:'#ef4444', score:42 },
];

const accountsData = [
  {
    name:'MSD Saúde', meta:'Cliente ativo · Enterprise Saúde · Expansão em avaliação interna',
    color:'#2b44ff', canal:'ABM', status:'Em expansão', statusClass:'bb',
    valor:'R$ 180k adicionais', owner:'Pablo Diniz', lifetime:'R$ 2,4M total', lastContact:'Há 2 dias',
    signals:[{id:'SIG-4055',title:'Sinal de expansão detectado',sev:'oportunidade'}],
    actions:[{title:'Agendar reunião executiva',owner:'Pablo Diniz',status:'Em andamento'},{title:'Preparar proposta de expansão',owner:'Pablo Diniz',status:'Nova'}]
  },
  {
    name:'Nexus Fintech', meta:'Enterprise Fintech · Estágio de Decisão · Proposta de R$ 280k enviada há 8 dias',
    color:'#ef4444', canal:'ABM', status:'Em risco', statusClass:'br',
    valor:'R$ 280k em risco', owner:'Pablo Diniz', lifetime:'R$ 280k prospecto', lastContact:'Há 3 horas',
    signals:[{id:'SIG-4068',title:'Sponsor principal saiu da empresa',sev:'crítico'}],
    actions:[{title:'Mapear novo decisor urgente',owner:'Pablo Diniz',status:'Em andamento'}]
  },
  {
    name:'Minerva Foods', meta:'Enterprise Industrial · ABX em playbook · Avaliação de fornecedor em andamento',
    color:'#f59e0b', canal:'ABX + Orgânico', status:'Monitorando', statusClass:'bam',
    valor:'Janela de 2-3 semanas', owner:'Elber Costa', lifetime:'R$ 650k histórico', lastContact:'Há 1 dia',
    signals:[{id:'SIG-4041',title:'Intenção de pesquisa crescente +220%',sev:'oportunidade'},{id:'SIG-4092',title:'Queda de performance no Google Ads',sev:'crítico'}],
    actions:[{title:'Intensificar cadência ABX',owner:'Elber Costa',status:'Em andamento'}]
  },
  {
    name:'Carteira Seguros Enterprise', meta:'Tier 1 · Lead inbound qualificado · Score 98',
    color:'#10b981', canal:'Inbound', status:'SLA em risco', statusClass:'bam',
    valor:'Alta conversão estimada', owner:'Ligia Martins', lifetime:'Novo prospecto', lastContact:'Há 1 hora',
    signals:[{id:'SIG-4088',title:'Lead quente sem owner — SLA excedido',sev:'alerta'}],
    actions:[{title:'Atribuir owner e primeiro contato',owner:'Ligia Martins',status:'Nova'}]
  },
];

const lossReasons = [
  {label:'Mudança de sponsor',pct:38},{label:'Orçamento cortado',pct:27},{label:'Concorrente eleito',pct:21},{label:'Projeto adiado',pct:14}
];
const objections = [
  {label:'Preço alto',pct:42},{label:'Integração complexa',pct:31},{label:'Falta de caso similar',pct:18},{label:'Time interno pequeno',pct:9}
];
const accelerators = [
  {label:'Case setorial relevante',pct:34},{label:'Reunião executiva',pct:28},{label:'Trial ou POC',pct:19},{label:'Desconto por urgência',pct:11}
];

const alertsData = [
  {id:'SIG-4068',severity:'Crítico',badgeClass:'br',icon:'🚨',bg:'#fef2f2',border:'#fecaca',iconBg:'#fee2e2',linkColor:'#dc2626',title:'Nexus Fintech em risco — sponsor saiu',desc:'R$ 280k em risco de perda ou atraso de 60-90 dias. Ação necessária nas próximas 24h.'},
  {id:'SIG-4034',severity:'Alerta',badgeClass:'bam',icon:'⚠️',bg:'#fffbeb',border:'#fde68a',iconBg:'#fef3c7',linkColor:'#d97706',title:'Outbound abaixo do benchmark — Cluster Manufatura',desc:'Taxa de resposta 3,2% vs benchmark 8%. Perda estimada de 18 oportunidades no trimestre.'},
  {id:'SIG-4075',severity:'Oportunidade',badgeClass:'bb',icon:'⚡',bg:'#eff2ff',border:'#c7d2fe',iconBg:'#e0e7ff',linkColor:'#2b44ff',title:'Cluster Fintech Sudeste — janela de oportunidade',desc:'300% de crescimento em tráfego. Potencial de R$ 500k em pipeline novo nos próximos 30 dias.'},
  {id:'SIG-4055',severity:'Oportunidade',badgeClass:'bg',icon:'📈',bg:'#f0fdf4',border:'#bbf7d0',iconBg:'#dcfce7',linkColor:'#16a34a',title:'MSD Saúde — expansão detectada',desc:'3 novos decisores acessaram o deck de expansão. Janela de 48h para R$ 180k adicionais.'},
];

const squadPerformance = [
  { name: 'Pablo Diniz', role: 'ABM & Enterprise', sla: 82, active: 14, comp: 38, time: '1.2 dias' },
  { name: 'Ligia Martins', role: 'Inbound & Growth', sla: 88, active: 8, comp: 45, time: '0.8 dias' },
  { name: 'Daniel Rocha', role: 'Outbound & Hunting', sla: 64, active: 22, comp: 12, time: '3.4 dias' },
  { name: 'Marina Costa', role: 'Paid Media', sla: 79, active: 5, comp: 28, time: '1.8 dias' },
  { name: 'Julia Mendes', role: 'Customer Success', sla: 76, active: 11, comp: 19, time: '2.1 dias' },
  { name: 'Elber Costa', role: 'ABM & Enterprise', sla: 68, active: 15, comp: 21, time: '2.9 dias' },
  { name: 'Ana Paula Silva', role: 'SEO & Content', sla: 72, active: 9, comp: 16, time: '2.4 dias' },
  { name: 'Camila Ribeiro', role: 'Growth Ops', sla: 91, active: 4, comp: 52, time: '0.5 dias' }
];

const techPerformance = [
  { name: 'HubSpot CRM', icon: '🟧', uptime: 94, status: 'Falha', tags: ['ABM', 'Inbound', 'Pipeline'], msg: 'Dados de conversão do último período podem estar desatualizados.' },
  { name: 'Google Analytics', icon: '📊', uptime: 99.8, status: 'Conectado', tags: ['SEO', 'Mídia Paga'], msg: '' },
  { name: 'Google Ads', icon: '📈', uptime: 87, status: 'Degradado', tags: ['Mídia Paga'], msg: 'Atraso no sincronismo de custos via GTM.' },
  { name: 'LinkedIn Ads', icon: '🟦', uptime: 99.4, status: 'Conectado', tags: ['Mídia Paga', 'ABM'], msg: '' },
  { name: 'Search Console', icon: '🔍', uptime: 99.9, status: 'Conectado', tags: ['SEO/Orgânico'], msg: '' },
  { name: 'Outreach', icon: '📧', uptime: 98.1, status: 'Conectado', tags: ['Outbound', 'ABX'], msg: '' }
];

export default function Performance() {
  const [period, setPeriod] = useState<PeriodId>('30d');
  const [openFrenteIds, setOpenFrenteIds] = useState<Record<string, boolean>>({});
  const toggleFrente = (id: string) => setOpenFrenteIds(prev => ({ ...prev, [id]: !prev[id] }));

  const currentMetrics = metricsByPeriod[period];

  const [selectedFront, setSelectedFront] = useState<FrontKey>('abm');
  const [search, setSearch] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'todas' | Confidence>('todas');
  const [detail, setDetail] = useState<DetailState>(null);

  const filteredFronts = useMemo(() => {
    return fronts.filter((front) => {
      const matchesSearch = [front.label, front.context, ...front.accounts.map((a) => a.name)].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesConfidence = confidenceFilter === 'todas' || front.confidence === confidenceFilter;
      return matchesSearch && matchesConfidence;
    });
  }, [search, confidenceFilter]);

  const front = useMemo(() => filteredFronts.find((item) => item.key === selectedFront) ?? filteredFronts[0] ?? fronts[0], [filteredFronts, selectedFront]);
  const toneColor = front.status === 'crítico' ? '#f43f5e' : front.status === 'atenção' ? '#f59e0b' : front.status === 'oportunidade' ? '#0ea5e9' : '#10b981';

  const openAccount = (account: Front['accounts'][number]) => setDetail({ kind: 'account', name: account.name, summary: account.note, owner: account.owner });
  const openAction = (action: Front['actions'][number]) => setDetail({ kind: 'action', title: action.title, team: action.team, expected: action.expected });

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: '#f6f8fc' }}>
      <div className="mx-auto w-full max-w-[1480px] px-6 py-6 xl:px-8">
        <section className="overflow-hidden text-white" style={{ borderRadius: '28px', background: 'linear-gradient(135deg, #041135 0%, #11286e 52%, #1f3f9b 100%)', boxShadow: '0 20px 60px rgba(16,53,143,0.22)' }}>
          <div className="px-6 py-6 md:px-8 md:py-7">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90">Desempenho</span>
            <div className="mt-4 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
              <div>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-[34px]">Desempenho</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">Entenda o que gerou resultado. Feche o ciclo Sinal → Ação → Desempenho → novo Sinal.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {periodsData.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className="rounded-full border px-4 py-1.5 text-[11px] font-semibold transition-all"
                      style={{
                        background: period === p.id ? 'white' : 'rgba(255,255,255,0.08)',
                        color: period === p.id ? '#17348f' : 'rgba(255,255,255,0.7)',
                        borderColor: period === p.id ? 'white' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    📅 Personalizado
                  </button>
                </div>
              </div>
              <div></div>
            </div>
            
            <div className="mt-8 grid gap-3 grid-cols-5">
              <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Pipeline Total</div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-white leading-none">R$ {currentMetrics.pipeline}</div>
                <div className="mt-1 text-[11px] font-bold text-[#6ee7b7]">{currentMetrics.pipelineDelta}</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Receita Gerada</div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-white leading-none">R$ {currentMetrics.receita}</div>
                <div className="mt-1 text-[11px] font-bold text-[#6ee7b7]">{currentMetrics.receitaDelta}</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Taxa de Conversão</div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-white leading-none">{currentMetrics.conversao}</div>
                <div className="mt-1 text-[11px] text-white/50">Meta: {currentMetrics.metaConversao}</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Ações Concluídas</div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-white leading-none">{currentMetrics.acoes}</div>
                <div className="mt-1 text-[11px] text-white/50">{currentMetrics.acoesRate} de execução</div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Score Médio</div>
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-white leading-none">{currentMetrics.score}</div>
                <div className="mt-1 text-[11px] text-white/50">{currentMetrics.scoreTrend}</div>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button className="inline-flex items-center gap-[7px] border-none px-[18px] py-[9px] text-[13px] font-bold transition-all cursor-pointer" style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                ↓ Exportar relatório
              </button>
              <button className="inline-flex items-center gap-[7px] border-none px-[18px] py-[9px] text-[13px] font-bold transition-all cursor-pointer" style={{ borderRadius: '14px', background: 'white', color: '#17348f' }}>
                → Ver sinais gerados
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Resumo Executivo por Canal</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">{periodsData.find((p) => p.id === period)?.label} · Comparado ao período anterior</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {channelsData.map((ch) => (
              <div key={ch.name} className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: ch.color }}></div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">{ch.name}</div>
                </div>
                <div className="text-[20px] font-extrabold tracking-[-0.02em]" style={{ color: ch.color }}>R$ {ch.value}</div>
                <div className="mt-0.5 text-[11px] font-bold" style={{ color: ch.delta.startsWith('+') ? '#16a34a' : '#dc2626' }}>{ch.delta} vs ant.</div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                  <div className="h-full rounded-full" style={{ width: `${ch.pct}%`, background: ch.color }}></div>
                </div>
                <div className="mt-1 text-[10px] text-[#94a3b8]">{ch.pct}% do total</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Performance por Frente Operacional</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">Clique em qualquer frente para ver KPIs detalhados e tendência</div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-[10px]">
            {frentesData.map((fr) => {
              const isOpen = openFrenteIds[fr.id];
              return (
                <div 
                  key={fr.id} 
                  onClick={() => toggleFrente(fr.id)} 
                  className="overflow-hidden border cursor-pointer" 
                  style={{ 
                    borderRadius: '20px', 
                    borderColor: isOpen ? fr.color : '#e2e8f0', 
                    boxShadow: isOpen ? '0 6px 24px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.22s'
                  }}
                >
                  <div className="px-4 py-3.5 flex items-start justify-between" style={{ background: isOpen ? fr.bg : '#ffffff' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: fr.bg }}>
                        <span className="text-[18px]">{fr.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '-0.01em', color: isOpen ? fr.color : '#0f172a' }}>{fr.name}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fr.tagline}</div>
                      </div>
                    </div>
                    <span className={cn('rounded-full border px-2 py-0.5 whitespace-nowrap shrink-0', toneClass(fr.statusTone))} style={{ fontSize: '10px' }}>
                      {fr.statusLabel}
                    </span>
                  </div>
                  
                  <div className="border-t flex items-center" style={{ borderColor: '#f1f5f9', background: '#ffffff', padding: '14px 18px', gap: '12px' }}>
                    {fr.kpis.slice(0, 2).map((kpi) => (
                      <div key={kpi.label} className="flex-1">
                        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '2px' }}>{kpi.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: fr.color }}>{kpi.value}</div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: kpi.delta.startsWith('+') ? '#10b981' : kpi.delta.startsWith('-') ? '#ef4444' : '#94a3b8' }}>
                          {kpi.delta}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isOpen && (
                    <div className="border-t" style={{ borderColor: '#f1f5f9', background: '#ffffff' }}>
                      <div className="grid grid-cols-2 gap-2" style={{ padding: '12px 18px' }}>
                        {fr.kpis.slice(2).map((kpi) => (
                          <div key={kpi.label} className="border" style={{ background: '#f8fafc', borderColor: '#f1f5f9', borderRadius: '10px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '2px' }}>{kpi.label}</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{kpi.value}</div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: kpi.delta.startsWith('+') ? '#16a34a' : kpi.delta.startsWith('-') ? '#dc2626' : '#94a3b8' }}>
                              {kpi.delta}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{ padding: '0 18px 18px' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 12px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '6px' }}>Tendência no período</div>
                          <svg viewBox="0 0 200 48" className="w-full" style={{ height: '48px' }}>
                            <line x1="0" y1="16" x2="200" y2="16" stroke="#e2e8f0" strokeWidth="0.8"/>
                            <line x1="0" y1="32" x2="200" y2="32" stroke="#e2e8f0" strokeWidth="0.8"/>
                            <polyline points={fr.chartPoints} fill="none" stroke={fr.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points={`${fr.chartPoints} 195,48 5,48`} fill={fr.color} style={{ opacity: 0.08 }}/>
                          </svg>
                        </div>
                        
                        <div className="border-t" style={{ borderColor: '#f1f5f9', marginTop: '12px', paddingTop: '12px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '8px' }}>Métricas Adicionais</div>
                          <div className="text-[11px] text-[#64748b]">Acompanhamento de squad movido para seção dedicada no rodapé.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <section className="border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Tendência por Canal</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">Evolução semanal no período selecionado</div>
              </div>
            </div>
            <svg viewBox="0 0 440 180" className="h-[180px] w-full">
              <line x1="0" y1="36" x2="440" y2="36" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="0" y1="72" x2="440" y2="72" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="0" y1="108" x2="440" y2="108" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="0" y1="144" x2="440" y2="144" stroke="#f1f5f9" strokeWidth="1"/>
              <polyline points="10,140 70,118 130,98 190,78 250,60 310,46 370,36 430,30" fill="none" stroke="#2b44ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,148 70,138 130,125 190,114 250,102 310,92 370,82 430,75" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,130 70,138 130,134 190,142 250,138 310,145 370,150 430,155" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,158 70,150 130,142 190,132 250,125 310,118 370,110 430,104" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="10" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S1</text>
              <text x="70" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S2</text>
              <text x="130" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S3</text>
              <text x="190" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S4</text>
              <text x="250" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S5</text>
              <text x="310" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S6</text>
              <text x="370" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S7</text>
              <text x="430" y="175" fontSize="8" fill="#94a3b8" fontFamily="Inter">S8</text>
            </svg>
            <div className="mt-1.5 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5"><div className="h-[3px] w-2.5 rounded-sm bg-[#2b44ff]"></div><span className="text-[10px] font-semibold text-[#64748b]">ABM</span></div>
              <div className="flex items-center gap-1.5"><div className="h-[3px] w-2.5 rounded-sm bg-[#7c3aed]"></div><span className="text-[10px] font-semibold text-[#64748b]">ABX</span></div>
              <div className="flex items-center gap-1.5"><div className="h-[3px] w-2.5 rounded-sm bg-[#f59e0b]"></div><span className="text-[10px] font-semibold text-[#64748b]">Outbound</span></div>
              <div className="flex items-center gap-1.5"><div className="h-[3px] w-2.5 rounded-sm bg-[#10b981]"></div><span className="text-[10px] font-semibold text-[#64748b]">Orgânico</span></div>
            </div>
          </section>

          <section className="border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Fatores que explicam o período</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">O que funcionou e o que não funcionou</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] p-3.5">
                <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#16a34a]">✓ O que funcionou</div>
                <div className="flex items-center gap-2.5 border-b border-[#f1f5f9] py-2 text-[12px]">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#2b44ff]"></div>
                  <span className="flex-1 font-semibold">ABM — contas estratégicas</span>
                  <span className="font-bold text-[#16a34a]">+18%</span>
                </div>
                <div className="flex items-center gap-2.5 border-b border-[#f1f5f9] py-2 text-[12px]">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#10b981]"></div>
                  <span className="flex-1 font-semibold">Orgânico — SEO de produto</span>
                  <span className="font-bold text-[#16a34a]">+22%</span>
                </div>
                <div className="flex items-center gap-2.5 py-2 text-[12px]">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#7c3aed]"></div>
                  <span className="flex-1 font-semibold">ABX — Cluster Fintech</span>
                  <span className="font-bold text-[#16a34a]">+7%</span>
                </div>
              </div>
              
              <div className="rounded-[14px] border border-[#fecaca] bg-[#fef2f2] p-3.5">
                <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#dc2626]">✗ O que não funcionou</div>
                <div className="flex items-center gap-2.5 border-b border-[#f1f5f9] py-2 text-[12px]">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#f59e0b]"></div>
                  <span className="flex-1 font-semibold">Outbound — Cluster Manufatura</span>
                  <span className="font-bold text-[#dc2626]">-4%</span>
                </div>
                <div className="flex items-center gap-2.5 py-2 text-[12px]">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#ef4444]"></div>
                  <span className="flex-1 font-semibold">Google Ads — conflito GTM</span>
                  <span className="font-bold text-[#dc2626]">-45%</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Contas · Ações e Atribuição de Fonte</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">Histórico, sinais ativos, ações em andamento e valor total do relacionamento</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {accountsData.map((acc) => (
              <div key={acc.name} className="overflow-hidden border border-[#e2e8f0] bg-white transition-all" style={{ borderRadius: '18px', borderLeft: `4px solid ${acc.color}` }}>
                <div className="px-5 py-4">
                  <div className="mb-2.5 flex items-start justify-between">
                    <div>
                      <div className="mb-0.5 text-[15px] font-bold text-[#0f172a]">{acc.name}</div>
                      <div className="text-[12px] text-[#64748b]">{acc.meta}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', acc.statusClass === 'bb' ? toneClass('neutral') : acc.statusClass === 'br' ? toneClass('danger') : toneClass('warning'))}>{acc.status}</span>
                      <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-bold text-[#475569]">{acc.canal}</span>
                    </div>
                  </div>
                  
                  {acc.signals.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Sinais ativos</div>
                      {acc.signals.map(s => (
                        <div key={s.id} className="flex items-center gap-2 border-b border-[#f1f5f9] py-2 text-[12px] last:border-0">
                          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.sev === 'crítico' ? '#ef4444' : s.sev === 'alerta' ? '#f59e0b' : '#2b44ff' }}></div>
                          <span className="font-bold text-[#94a3b8]">{s.id} ·</span>
                          <span className="flex-1 text-[#0f172a]">{s.title}</span>
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', s.sev === 'crítico' ? toneClass('danger') : s.sev === 'alerta' ? toneClass('warning') : toneClass('neutral'))}>{s.sev}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {acc.actions.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Ações em andamento</div>
                      {acc.actions.map(a => (
                        <div key={a.title} className="flex items-center gap-2 border-b border-[#f1f5f9] py-1 text-[12px] last:border-0">
                          <span className="flex-1 text-[#0f172a]">{a.title}</span>
                          <span className="text-[11px] text-[#64748b]">{a.owner}</span>
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', a.status === 'Em andamento' ? toneClass('neutral') : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]')}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2.5 border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-3">
                  <div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Canal</div><div className="text-[13px] font-bold text-[#0f172a]">{acc.canal}</div></div>
                  <div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Valor</div><div className="text-[13px] font-bold" style={{ color: acc.color }}>{acc.valor}</div></div>
                  <div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Owner</div><div className="text-[13px] font-bold text-[#0f172a]">{acc.owner}</div></div>
                  <div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Relacionamento</div><div className="text-[13px] font-bold text-[#0f172a]">{acc.lifetime}</div></div>
                  <div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">Último contato</div><div className="text-[13px] font-bold text-[#0f172a]">{acc.lastContact}</div></div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[#f1f5f9] px-5 py-3">
                  <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-[#2b44ff] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-[#1e34e8]">→ Ver no Canopi</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-[#ff7a59] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-[#e8603a]">🔗 Abrir no HubSpot</button>
                  <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#e2e8f0] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#475569] transition-all hover:bg-[#f8fafc]">⚡ Criar ação</button>
                  <div className="ml-auto text-[11px] text-[#94a3b8]">{acc.signals.length} sinal(is) · {acc.actions.length} ação(ões)</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3.5">
          <section className="border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Aceleração de Funil</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">Onde o pipeline acelerou ou travou</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-2.5">
              <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#475569]">Leads qualificados</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: '90%', background: '#2b44ff' }}></div></div>
              <span className="w-[72px] text-right text-[13px] font-extrabold">R$ 5,4M</span><span className="w-[48px] text-right text-[11px] font-bold text-[#16a34a]">+12%</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-2.5">
              <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#475569]">Em avaliação</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: '65%', background: '#7c3aed' }}></div></div>
              <span className="w-[72px] text-right text-[13px] font-extrabold">R$ 3,5M</span><span className="w-[48px] text-right text-[11px] font-bold text-[#16a34a]">+6%</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-2.5">
              <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#475569]">Proposta enviada</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: '45%', background: '#f59e0b' }}></div></div>
              <span className="w-[72px] text-right text-[13px] font-extrabold">R$ 2,4M</span><span className="w-[48px] text-right text-[11px] font-bold text-[#d97706]">0%</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-2.5">
              <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#475569]">Decisão</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: '30%', background: '#ef4444' }}></div></div>
              <span className="w-[72px] text-right text-[13px] font-extrabold">R$ 1,6M</span><span className="w-[48px] text-right text-[11px] font-bold text-[#dc2626]">-3%</span>
            </div>
            <div className="flex items-center gap-3 py-2.5">
              <span className="w-[130px] shrink-0 text-[12px] font-semibold text-[#475569]">Fechado</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full" style={{ width: '24%', background: '#10b981' }}></div></div>
              <span className="w-[72px] text-right text-[13px] font-extrabold">R$ 1,3M</span><span className="w-[48px] text-right text-[11px] font-bold text-[#16a34a]">+8%</span>
            </div>
          </section>

          <section className="border border-[#e2e8f0] bg-white p-5 md:p-6" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Qualidade de Leads por Canal</div>
                <div className="mt-0.5 text-[12px] text-[#64748b]">Score médio e receita por origem</div>
              </div>
            </div>
            {channelsData.map(ch => (
              <div key={ch.name} className="mb-2.5 last:mb-0">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: ch.color }}></div>
                    <span className="text-[13px] font-semibold text-[#0f172a]">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] font-bold" style={{ color: ch.color }}>{ch.score}% score</span>
                    <span className="text-[11px] text-[#94a3b8]">R$ {ch.value}</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]">
                  <div className="h-full rounded-full" style={{ width: `${ch.score}%`, background: ch.color }}></div>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="mt-6 border border-[#e2e8f0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]" style={{ borderRadius: '22px', padding: '20px 24px' }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Qualidade de Fechamento</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">Motivos de perda, objeções e aceleradores</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#fee2e2] bg-[#f8fafc] p-5">
              <div className="mb-4 text-[9px] font-black uppercase tracking-widest text-[#ef4444]">Motivos de Perda</div>
              <div className="flex flex-col gap-1">
                {lossReasons.map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-[#f1f5f9] py-2 last:border-0 text-[12px]">
                    <span className="font-bold text-[#0f172a]">{item.label}</span>
                    <span className="font-black text-[#ef4444]">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#fef3c7] bg-[#f8fafc] p-5">
              <div className="mb-4 text-[9px] font-black uppercase tracking-widest text-[#d97706]">Objeções mais comuns</div>
              <div className="flex flex-col gap-1">
                {objections.map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-[#f1f5f9] py-2 last:border-0 text-[12px]">
                    <span className="font-bold text-[#0f172a]">{item.label}</span>
                    <span className="font-black text-[#d97706]">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#dcfce7] bg-[#f8fafc] p-5">
              <div className="mb-4 text-[9px] font-black uppercase tracking-widest text-[#10b981]">Aceleradores</div>
              <div className="flex flex-col gap-1">
                {accelerators.map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-[#f1f5f9] py-2 last:border-0 text-[12px]">
                    <span className="font-bold text-[#0f172a]">{item.label}</span>
                    <span className="font-black text-[#10b981]">+{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 border border-[#e2e8f0] bg-white" style={{ borderRadius: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '20px 24px' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Alertas de Desempenho · Sinais para o próximo ciclo</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">O desempenho atual está gerando estes sinais — clique para acessar</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {alertsData.map(alert => (
              <div key={alert.id} className="flex cursor-pointer items-start gap-4 rounded-[14px] p-4 transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]" style={{ background: alert.bg, border: `1px solid ${alert.border}` }}>
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-[15px]" style={{ background: alert.iconBg }}>{alert.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 text-[13px] font-bold text-[#0f172a]">{alert.title}</div>
                  <div className="mb-2 text-[12px] leading-relaxed text-[#64748b]">{alert.desc}</div>
                  <div className="flex items-center gap-3">
                    <button className="cursor-pointer border-none bg-transparent p-0 font-inherit text-[12px] font-bold transition-opacity hover:opacity-80" style={{ color: alert.linkColor }}>→ Ver {alert.id}</button>
                    <button className="cursor-pointer bg-white px-3 py-1.5 text-[11px] font-semibold text-[#475569] transition-all hover:bg-[#f8fafc]" style={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}>Ver conta</button>
                  </div>
                </div>
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap', alert.badgeClass === 'br' ? toneClass('danger') : alert.badgeClass === 'bam' ? toneClass('warning') : toneClass('neutral'))} style={{ borderRadius: '100px' }}>{alert.severity}</span>
              </div>
            ))}
          </div>
        </section>

        {/* NOVAS SEÇÕES: SQUADS E TECNOLOGIAS */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <section className="border border-[#e2e8f0] bg-white transition-all shadow-[0_1px_4px_rgba(0,0,0,0.05)]" style={{ borderRadius: '22px', padding: '20px 24px' }}>
            <div className="mb-5">
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Squads · Execução e SLA</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">Performance operacional por executivo no período</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {squadPerformance.map((sq) => {
                const color = sq.sla >= 80 ? '#10b981' : sq.sla >= 65 ? '#f59e0b' : '#ef4444';
                const bgBadge = sq.sla >= 80 ? '#ecfdf5' : sq.sla >= 65 ? '#fffbeb' : '#fef2f2';
                const borderBadge = sq.sla >= 80 ? '#a7f3d0' : sq.sla >= 65 ? '#fde68a' : '#fecaca';
                
                return (
                  <div key={sq.name} className="border border-[#f1f5f9] bg-[#f8fafc] flex flex-col gap-3" style={{ borderRadius: '14px', padding: '14px' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex shrink-0 items-center justify-center font-bold" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff2ff', fontSize: '11px', color: '#2b44ff' }}>
                        {sq.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="truncate text-[12px] font-extrabold text-[#0f172a] tracking-[-0.01em]">{sq.name}</div>
                        <div className="truncate text-[10px] font-medium text-[#64748b]">{sq.role}</div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#94a3b8] uppercase tracking-widest">SLA</span>
                        <span style={{ color }}>{sq.sla}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sq.sla}%`, background: color }} />
                      </div>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 border-t border-[#f1f5f9] pt-3">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-0.5">Ações</div>
                        <div className="text-[13px] font-extrabold text-[#0f172a] tracking-[-0.02em]">{sq.comp} <span className="text-[10px] font-normal text-[#94a3b8]">/ {sq.active}</span></div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-0.5">Média</div>
                        <div className="text-[13px] font-extrabold text-[#0f172a] tracking-[-0.02em]">{sq.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-[#e2e8f0] bg-white transition-all shadow-[0_1px_4px_rgba(0,0,0,0.05)]" style={{ borderRadius: '22px', padding: '20px 24px' }}>
            <div className="mb-5">
              <div className="font-bold uppercase tracking-widest text-[#94a3b8] text-[9px]">Performance de Tecnologias</div>
              <div className="mt-0.5 text-[12px] text-[#64748b]">Estabilidade das integrações e impacto em dados</div>
            </div>
            <div className="flex flex-col gap-3">
              {techPerformance.map((tech) => {
                const isFail = tech.status === 'Falha';
                const isDegraded = tech.status === 'Degradado';
                const isOk = tech.status === 'Conectado';
                
                const toneColor = isOk ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444';
                const toneBg = isOk ? '#ecfdf5' : isDegraded ? '#fffbeb' : '#fef2f2';
                const toneBorder = isOk ? '#a7f3d0' : isDegraded ? '#fde68a' : '#fecaca';

                return (
                  <div key={tech.name} className="border border-[#f1f5f9] bg-white transition-all flex flex-col gap-2.5" style={{ borderRadius: '14px', padding: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f8fafc] border border-[#f1f5f9] text-[16px]">{tech.icon}</div>
                        <span className="text-[13px] font-extrabold text-[#0f172a] tracking-[-0.01em]">{tech.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#f1f5f9]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${tech.uptime}%`, background: toneColor }} />
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border" style={{ color: toneColor, background: toneBg, borderColor: toneBorder, borderRadius: '100px' }}>
                          {tech.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pl-[44px]">
                      {tech.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 text-[9px] font-bold text-[#64748b] bg-[#f8fafc] border border-[#f1f5f9]" style={{ borderRadius: '6px' }}>{t}</span>
                      ))}
                    </div>
                    {(isFail || isDegraded) && (
                      <div className="mt-1 ml-[44px] text-[11px] font-medium p-2.5 border" style={{ color: toneColor, background: toneBg, borderColor: toneBorder, borderRadius: '10px' }}>
                        <span className="font-bold mr-1">⚠️ Atenção:</span>{tech.msg}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
