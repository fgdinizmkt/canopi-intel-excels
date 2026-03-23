/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Signal, DetailedAccount, Metric, Priority, Action, ActionKPI, RiskAccount, ABMAccount, ABMCluster, ABMPlay } from '../types';

export const detailedAccounts: DetailedAccount[] = [
  {
    id: '1',
    name: 'CloudTech Solutions Inc.',
    domain: 'cloudtech.com',
    vertical: 'SaaS',
    segment: 'ENTERPRISE',
    stage: 'CONSIDERAÇÃO',
    engagement: 85,
    healthScore: 92,
    expansionProb: 74,
    status: 'ATIVA',
    recommendedPlay: {
      title: 'Executive Outreach',
      description: 'Focado em eficiência operacional. O VP de Engenharia demonstrou alto engajamento em cases de ROI.'
    },
    recentSignals: [
      { id: 's1', title: 'Nova Vaga: VP de Cloud Platform', source: 'LinkedIn Intent', timestamp: 'Há 2 horas', type: 'intent' },
      { id: 's2', title: 'Acesso ao Deck de Preços (3x)', source: 'Direct Traffic', timestamp: 'Hoje às 10:42', type: 'direct' },
      { id: 's3', title: 'Redução de Uso API - Endpoint X', source: 'Product Usage', timestamp: 'Ontem', type: 'usage' }
    ],
    timeline: [
      { id: 't1', date: '12 Mai, 2024', title: 'Mapeamento de Stakeholders concluído', type: 'success' },
      { id: 't2', date: '05 Mai, 2024', title: 'Reunião de Alinhamento Técnico', type: 'info' }
    ]
  },
  {
    id: '2',
    name: 'Global Logística S.A.',
    domain: 'globallog.com.br',
    vertical: 'Logística',
    segment: 'MID-MARKET',
    stage: 'APRENDIZADO',
    engagement: 42,
    healthScore: 65,
    expansionProb: 30,
    status: 'ATIVA',
    recommendedPlay: {
      title: 'Nurturing Educacional',
      description: 'Focar em conteúdos de otimização de malha logística e redução de custos operacionais.'
    },
    recentSignals: [
      { id: 's4', title: 'Visita à página de funcionalidades', source: 'Direct Traffic', timestamp: 'Há 5 horas', type: 'direct' }
    ],
    timeline: [
      { id: 't3', date: '10 Mai, 2024', title: 'Primeiro contato realizado', type: 'info' }
    ]
  },
  {
    id: '3',
    name: 'Nexus Fintech',
    domain: 'nexus.finance',
    vertical: 'Finanças',
    segment: 'ENTERPRISE',
    stage: 'DECISÃO',
    engagement: 98,
    healthScore: 88,
    expansionProb: 92,
    status: 'ATIVA',
    recommendedPlay: {
      title: 'Closing Play',
      description: 'Apresentar proposta final com foco em segurança de dados e conformidade regulatória.'
    },
    recentSignals: [
      { id: 's5', title: 'Download de Whitepaper de Segurança', source: 'Direct Traffic', timestamp: 'Hoje às 09:15', type: 'direct' }
    ],
    timeline: [
      { id: 't4', date: '15 Mai, 2024', title: 'Apresentação de Demo concluída', type: 'success' }
    ]
  }
];

export const accountSummaryCards = [
  { label: 'CONTAS PRIORITÁRIAS', value: '42', change: '+12%', trend: 'up', color: 'blue' },
  { label: 'CONTAS EM RISCO', value: '08', change: '+2', trend: 'down', color: 'red' },
  { label: 'ALTO POTENCIAL', value: '124', subtext: 'Ativas', color: 'slate' },
];

export const kpis: Metric[] = [
  { label: 'Pipeline Influenciado', value: '14.2', change: 12.4, trend: 'up', prefix: 'R$ ', suffix: 'M' },
  { label: 'Leads Totais', value: '2.840', change: 5, trend: 'up' },
  { label: 'MQLs Qualificados', value: '412', change: -2, trend: 'down' },
  { label: 'Oportunidades', value: '86', change: 18, trend: 'up' },
  { label: 'Negócios Ganhos', value: '24', change: 0, trend: 'neutral' },
  { label: 'Conversão', value: '3.2', change: 0.4, trend: 'up', suffix: '%' },
];

export const pipelineInfluence = [
  { label: 'OUTBOUND SALES', value: 42, color: 'bg-blue-600' },
  { label: 'SOCIAL / PAID ADS', value: 28, color: 'bg-blue-400' },
  { label: 'EVENTOS & PARCERIAS', value: 18, color: 'bg-blue-200' },
  { label: 'ORGANIC / DIRECT', value: 12, color: 'bg-slate-200' },
];

export const accountsAtRisk: RiskAccount[] = [
  { id: '1', name: 'Global Logistics Ltd', healthScore: 32, gaps: ['Zero acessos no dashboard', 'Owner inativo há 12 dias'], owner: 'Rodrigo M.', tier: 'Tier 1' },
  { id: '2', name: 'TechNova Systems', healthScore: 58, gaps: ['Ticket crítico aberto há 48h', 'Executivo saiu da empresa'], owner: 'Paula S.', tier: 'Tier 1' },
  { id: '3', name: 'SoftFoods S.A.', healthScore: 45, gaps: ['Redução de 40% no uso da API', 'Renovação em 30 dias'], owner: 'Marcos V.', tier: 'Tier 2' },
];

export const abmAccounts: ABMAccount[] = [
  {
    id: '1',
    name: 'Global Bank S.A.',
    industry: 'Fintech Enterprise',
    fitScore: 9.8,
    potential: 'R$ 450k/ano',
    cluster: 'TIER 1',
    status: 'ATV. PENDENTE',
    initials: 'GB'
  },
  {
    id: '2',
    name: 'Manufatura Norte',
    industry: 'Industrial Mid-Market',
    fitScore: 7.5,
    potential: 'R$ 120k/ano',
    cluster: 'MID-PROWESS',
    status: 'EM PLAYBOOK',
    initials: 'MN'
  },
  {
    id: '3',
    name: 'ScalePay Brasil',
    industry: 'Fintech Growth',
    fitScore: 9.2,
    potential: 'R$ 280k/ano',
    cluster: 'TIER 1',
    status: 'MAPEANDO DECISORES',
    initials: 'SC'
  }
];

export const abmClusters: ABMCluster[] = [
  { id: '1', name: 'Manufatura Enterprise', count: 32, playbook: 'Eficiência Operacional 4.0', color: 'bg-blue-600' },
  { id: '2', name: 'Fintech Mid-market', count: 48, playbook: 'Scaling High Velocity', color: 'bg-blue-400' },
  { id: '3', name: 'HealthTech', count: 15, playbook: 'Compliance & Privacy First', color: 'bg-blue-200' }
];

export const abmPlays: ABMPlay[] = [
  {
    id: '1',
    title: 'Relatório Setorial Customizado',
    description: 'Envio de PDF personalizado com comparativo de eficiência para C-Levels do Cluster Manufatura.',
    efficiency: 88
  },
  {
    id: '2',
    title: 'Webinar de Mesa Redonda',
    description: 'Convite exclusivo para diretores financeiros de Fintechs Mid-market discutirem Open Banking.',
    efficiency: 72
  },
  {
    id: '3',
    title: 'Campanha de Social Ads 1:1',
    description: 'Ads altamente focados em dor específica de segurança de dados para o Tier 1 de HealthTech.',
    efficiency: 94
  }
];

export const priorities: Priority[] = [
  { id: '1', title: 'Aprovar Proposta Final', account: 'Banco Tech', owner: 'Rodrigo M.', severity: 'crítica' },
  { id: '2', title: 'Reunião de Alinhamento', account: 'EnergyCo', owner: 'Paula S.', severity: 'média' },
  { id: '3', title: 'Follow-up Comercial', account: 'SoftFoods', owner: 'Marcos V.', severity: 'baixa' },
];

export const signals: Signal[] = [
  {
    id: 'SIG-4092',
    title: 'Queda de performance acentuada no Google Ads',
    description: 'CTR caiu 45% nas últimas 2 horas. Possível conflito de keywords ou interrupção de rastreamento de conversão no GA4.',
    severity: 'crítico',
    type: 'Operacional',
    category: 'Canal',
    channel: 'Google Ads',
    source: 'Mídia Paga',
    owner: 'Ana Paula Silva',
    confidence: 94,
    timestamp: 'Há 12 minutos',
    context: 'Atividade incomum detectada na campanha de "Expansão de Infraestrutura". O custo por clique (CPC) subiu drasticamente sem aumento proporcional em conversões.',
    probableCause: 'Erro de Script GTM ou conflito de tags de conversão após atualização do site.',
    impact: 'Perda estimada de R$ 1.2k/dia em investimento ineficiente.',
    recommendation: 'Revisar o container do GTM e as regras de disparo de tags de conversão.',
    suggestedOwner: 'Equipe de Performance',
    mainAction: 'Investigar Agora',
  },
  {
    id: 'SIG-4088',
    title: 'Lead Inbound quente sem dono (SLA Risco)',
    description: 'Lead da "TechCorp" (score 98) completou formulário de demo mas não foi roteado devido a regras de território pendentes.',
    severity: 'alerta',
    type: 'Pipeline',
    category: 'Inbound',
    channel: 'Site Institucional',
    source: 'Orgânico',
    owner: 'Carlos Eduardo',
    confidence: 88,
    timestamp: 'Há 1 hora',
    context: 'Lead de alta intenção (Tier 1) aguardando atribuição por mais de 60 minutos, excedendo o SLA de 15 minutos para leads quentes.',
    probableCause: 'Regra de roteamento para o território "Sudeste" está desativada ou sem owner definido.',
    impact: 'Risco de 30% na taxa de conversão por demora no primeiro contato.',
    recommendation: 'Atribuir manualmente ao SDR de plantão e revisar regras de território.',
    suggestedOwner: 'Sales Ops',
    mainAction: 'Atribuir Owner',
  },
  {
    id: 'SIG-4075',
    title: 'Cluster promissor detectado em "SaaS / Fintech"',
    description: 'Aumento de 300% em tráfego orgânico e menções sociais vindo de empresas do setor financeiro na região Sudeste.',
    severity: 'oportunidade',
    type: 'Conta',
    category: 'ABX',
    channel: 'LinkedIn / Orgânico',
    source: 'Social',
    owner: 'Julia Mendes',
    confidence: 72,
    timestamp: 'Há 4 horas',
    context: 'Padrão de navegação identificado em 12 contas alvo simultaneamente, focando em páginas de precificação e estudos de caso de fintechs.',
    probableCause: 'Tendência de mercado ou campanha de concorrente gerando interesse na categoria.',
    impact: 'Potencial de geração de R$ 500k em novo pipeline em 30 dias.',
    recommendation: 'Ativar campanha de retargeting específica para o cluster de Fintechs.',
    suggestedOwner: 'Growth Marketing',
    mainAction: 'Ver Detalhes',
  },
];

export const actionKPIs: ActionKPI[] = [
  { label: 'TOTAL DE AÇÕES', value: 42, trend: '+4 hoje', color: 'slate' },
  { label: 'CRÍTICAS', value: '07', subtext: 'Ação Imediata', color: 'red' },
  { label: 'EM ATRASO (SLA)', value: '03', trend: '-12% vs ontem', color: 'slate' },
  { label: 'TAXA DE RESOLUÇÃO', value: '92%', color: 'emerald' },
];

export const actions: Action[] = [
  {
    id: 'ACT-2841',
    title: 'Corrigir roteamento de leads Inbound',
    severity: 'crítico',
    category: 'Marketing Ops',
    contextInfo: 'Campanha: Global Fortune 500',
    slaStatus: 'Há 2 horas (SLA Vencido)',
    slaTrend: 'vencido',
    suggestedOwner: { name: 'Ana Paula', avatar: 'https://picsum.photos/seed/ana/40/40' },
    type: 'Operacional'
  },
  {
    id: 'ACT-2839',
    title: 'Atribuir follow-up comercial',
    severity: 'alerta',
    category: 'Sales Development',
    contextInfo: 'Conta: CloudTech Solutions Inc.',
    slaStatus: 'Vencendo em 4h',
    slaTrend: 'alerta',
    suggestedOwner: { name: 'Aguardando atribuição' },
    type: 'Pipeline'
  },
  {
    id: 'ACT-2835',
    title: 'Auditar campanha Q3 Cloud Migration',
    severity: 'oportunidade',
    category: 'Performance Marketing',
    contextInfo: 'Mídia Paga: Google Ads',
    slaStatus: 'Prazo: 12h restante',
    slaTrend: 'ok',
    suggestedOwner: { name: 'Carlos E.', avatar: 'https://picsum.photos/seed/carlos/40/40' },
    type: 'Campanha'
  },
  {
    id: 'ACT-2830',
    title: 'Conectar Search Console para novo subdomínio',
    severity: 'estável',
    category: 'Data Ops',
    contextInfo: 'SEO: Subdomínio Recursos',
    slaStatus: 'Prazo: 2 dias',
    slaTrend: 'ok',
    suggestedOwner: { name: 'Tech Ops', avatar: 'https://picsum.photos/seed/tech/40/40' },
    type: 'Dados'
  }
];
