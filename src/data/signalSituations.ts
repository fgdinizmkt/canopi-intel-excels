'use client';

export interface SignalEvent {
  date: string;
  signal: string;
  severity: 'crítico' | 'alerta' | 'oportunidade';
  indicator: string;
  value?: string | number;
  impact?: string;
  source?: string;
}

export interface DecisionOption {
  option: string;
  description: string;
  owner: string;
  timeline: string;
  riskLevel?: 'baixo' | 'médio' | 'alto';
  successProbability?: number;
  subOptions?: Array<{
    suboption: string;
    description: string;
    cost?: string;
    effort?: 'baixo' | 'médio' | 'alto';
  }>;
}

export interface DecisionPoint {
  title: string;
  analysis: string;
  probability: number;
  context: string;
  options: DecisionOption[];
  chosenOption: number;
  alternativeChosen?: boolean;
  reasoning?: string;
}

export interface SignalSituation {
  id: string;
  accountName: string;
  accountId: string;
  accountARR?: string;
  accountIndustry?: string;
  situationType: 'churn-prevention' | 'expansion' | 'cross-sell' | 'technical-issue' | 'contract-risk' | 'compliance' | 'market-shift';
  situationTitle: string;
  context: string;
  triggerDate: string;
  initialState: {
    arrStatus: string;
    engagement: string;
    stakeholders: number;
    healthScore: number;
    contractStatus?: string;
    lastMilestone?: string;
  };
  timeline: SignalEvent[];
  decisionPoints: DecisionPoint[];
  actionsTaken: Array<{
    date: string;
    action: string;
    owner: string;
    status: 'pending' | 'in-progress' | 'completed';
    notes?: string;
  }>;
  outcome: {
    result: 'success' | 'partial' | 'failed';
    finalState: string;
    impact: string;
    arEffect?: string;
    contractChange?: string;
    lessonsLearned: string[];
    metrics: Array<{
      label: string;
      before: string;
      after: string;
      change: string;
    }>;
  };
  duration: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'critical';
  keyInfluencers?: string[];
  criticalMoment?: string;
}

export const signalSituations: SignalSituation[] = [
  {
    id: 'SIT-001',
    accountName: 'FinanceFlow',
    accountId: 'ACC-024',
    accountARR: '$28.800',
    accountIndustry: 'Fintech',
    situationType: 'churn-prevention',
    situationTitle: 'Recuperação de Conta em Risco — Champion Churn + Engagement Cliff',
    context: 'Conta dormindo há 45 dias. CFO (champion único) deixou a empresa. Redução de 3 users. Nenhuma resposta a outreach. Contrato renova em 60 dias.',
    triggerDate: '2026-04-01',
    initialState: {
      arrStatus: 'Em risco extremo',
      engagement: 'Crítico — zero interações',
      stakeholders: 1,
      healthScore: 22,
      contractStatus: 'Renewal pending (60 dias)',
      lastMilestone: '45 dias atrás',
    },
    timeline: [
      {
        date: '2026-04-01',
        signal: 'Engagement Cliff',
        severity: 'crítico',
        indicator: 'Last touch: 45 dias sem qualquer interação',
        value: '0 logins, 0 API calls',
        impact: 'Conta completamente dormindo',
        source: 'Product Analytics',
      },
      {
        date: '2026-04-02',
        signal: 'Champion Churn — CFO saiu',
        severity: 'crítico',
        indicator: 'Único decisor deixou a empresa',
        value: 'CFO mudou para concorrente',
        impact: 'Perda de champion e conhecimento de contexto',
        source: 'LinkedIn Alert + Support',
      },
      {
        date: '2026-04-02',
        signal: 'License Reduction',
        severity: 'alerta',
        indicator: 'Downgrade automático de users',
        value: '-3 users (-30%)',
        impact: 'Redução de $2.400 ARR anual',
        source: 'Billing System',
      },
      {
        date: '2026-04-03',
        signal: 'Bounce Rate Spike',
        severity: 'alerta',
        indicator: 'Emails devolvidos ao nosso outreach',
        value: '100% bounce (CFO saiu)',
        impact: 'Não conseguimos contatar novo decisor',
        source: 'Email Platform',
      },
      {
        date: '2026-04-05',
        signal: 'Contract Renewal Red Flag',
        severity: 'crítico',
        indicator: '60 dias até renewal com nenhum champion',
        value: 'Risk window: 60 dias',
        impact: 'Projeção: churn certo sem intervenção',
        source: 'Contract Management',
      },
    ],
    decisionPoints: [
      {
        title: 'Estratégia crítica: C-Level intervention vs. wait-and-see',
        analysis: 'Conta com 3+ sinais críticos simultâneos. Champion saiu, engagement zerado. Probabilidade de churn: 85% em 48h sem ação. Novo decisor desconhecido. Decisão: escalar para C-Level ou manter abordagem tradicional.',
        probability: 85,
        context: 'Janela crítica: 60 dias até renewal. Sem novo mapping, conta é perda certa. Novo CFO desconhecido no contexto da solução.',
        options: [
          {
            option: 'C-Level Intervention — CEO nosso → CFO deles (Workshop executivo)',
            description: 'Nosso CEO/VP Sales agenda urgentemente workshop estratégico com novo CFO. Foco: ROI, implementação, roadmap futuro. Demonstra commitment e contorna churn.',
            owner: 'VP Sales + CEO',
            timeline: '24h',
            riskLevel: 'médio',
            successProbability: 78,
            subOptions: [
              { suboption: 'Workshop formatado: 90min com prep técnica + business case', description: 'Execução imediata', cost: 'Alto', effort: 'alto' },
              { suboption: 'CFO briefing: contextualizar relação com CFO anterior', description: 'Background briefing', cost: 'Médio', effort: 'médio' },
              { suboption: 'Oferta de extensão: 20% desconto se assinarem em 72h', description: 'Urgency mechanism', cost: 'Alto financeiramente', effort: 'baixo' },
            ],
          },
          {
            option: 'Support-Led Approach — CS Manager → Novo stakeholder (Technical Review)',
            description: 'Customer Success agenda revisão técnica com novo contact. Menos intimidante que C-Level. Risco: novo decisor não conhece valor, vai questionar tudo.',
            owner: 'CS Manager',
            timeline: '48h',
            riskLevel: 'alto',
            successProbability: 35,
            subOptions: [
              { suboption: 'Tech review focado em implementação + health check', description: 'Technical review session', cost: 'Baixo', effort: 'médio' },
              { suboption: 'Sem contexto de negócio = sem senso de urgência', description: 'Business context gap', cost: 'Nenhum', effort: 'baixo' },
            ],
          },
          {
            option: 'Financial Retention Package — Oferta agressiva de retenção',
            description: 'Propor 3 anos com 20-30% desconto + free implementation. Cria urgência de decisão. Risco: CFO novo vai aceitar desconto mas reduz LTV conta.',
            owner: 'Sales Director',
            timeline: '24h',
            riskLevel: 'médio',
            successProbability: 72,
            subOptions: [
              { suboption: 'MRR reduction: -20% = -$480/mês', description: 'Discount impact', cost: 'Alto em LTV', effort: 'baixo' },
              { suboption: 'Expansion potential: oferecer módulos adicionais como incentivo', description: 'Expansion incentive', cost: 'Médio', effort: 'médio' },
            ],
          },
          {
            option: 'Win-back Campaign — Posição como competitive threat',
            description: 'Assumir que será churn, preparar re-acquisition em 90 dias. Risco: perde ARR atual + custo de re-aquisição é 5x maior.',
            owner: 'Marketing',
            timeline: '30 dias',
            riskLevel: 'alto',
            successProbability: 15,
          },
        ],
        chosenOption: 0,
        reasoning: 'C-Level intervention oferece maior probabilidade de salvar conta com commitment visível. Novo CFO responde melhor a abordagem executiva + business focus.',
      },
      {
        title: 'Pós-intervenção: Como estruturar novo relacionamento com CFO novo',
        analysis: 'Se C-Level intervention tiver sucesso inicial, precisa de onboarding rápido de novo CFO. Risco: novo CFO questiona value de anterior, quer renegociar.',
        probability: 67,
        context: 'CFO novo vem de empresa diferente. Não tem contexto de implementação anterior. Pode ter preferências tecnológicas diferentes.',
        options: [
          {
            option: 'Dedicated CSM + Sponsor mapping urgente',
            description: 'Assign CS Manager sênior. Fazer mapeamento completo de stakeholders com novo CFO. Rebuilding trust.',
            owner: 'CS Director',
            timeline: '7 dias',
            riskLevel: 'baixo',
            successProbability: 85,
          },
          {
            option: 'Business review customizada (quarterly)',
            description: 'Estruturar review trimestral focado em ROI + roadmap futuro. Mostrar value com números.',
            owner: 'Account Executive',
            timeline: 'Ongoing',
            riskLevel: 'baixo',
            successProbability: 72,
          },
          {
            option: 'Expansion opportunity pitch',
            description: 'Aproveitar "fresh eyes" de novo CFO para vender módulos complementares. Aumentar stickiness.',
            owner: 'Sales',
            timeline: '30 dias',
            riskLevel: 'médio',
            successProbability: 58,
          },
        ],
        chosenOption: 0,
      },
    ],
    actionsTaken: [
      {
        date: '2026-04-03',
        action: 'Escalação imediata — VP Sales notificado do churn risk',
        owner: 'VP Sales',
        status: 'completed',
        notes: 'Confirmado: CEO agendará com novo CFO em 24h',
      },
      {
        date: '2026-04-04',
        action: 'Prep de workshop executivo — business case customizado para FinanceFlow',
        owner: 'Sales Engineer + Marketing',
        status: 'completed',
        notes: 'ROI calculator, implementation timeline, roadmap executivo',
      },
      {
        date: '2026-04-04',
        action: 'LinkedIn intel — Profile novo CFO, background, preferências profissionais',
        owner: 'Sales Development',
        status: 'completed',
      },
      {
        date: '2026-04-05',
        action: 'Workshop executivo — 90 min com CEO nosso + novo CFO FinanceFlow',
        owner: 'CEO + VP Sales',
        status: 'completed',
        notes: 'Recording feita para distribuição interna. Novo CFO respondeu bem. ROI ressoou.',
      },
      {
        date: '2026-04-06',
        action: 'Proposta formal — Renovação 2 anos + 10% aumento + free implementation quarter',
        owner: 'Sales',
        status: 'completed',
      },
      {
        date: '2026-04-07',
        action: 'Contrato assinado + kickoff CS call com novo CFO',
        owner: 'Account Executive',
        status: 'completed',
        notes: 'CS Manager atribuído. Sponsor mapping iniciado.',
      },
    ],
    outcome: {
      result: 'success',
      finalState: 'Conta reativada, novo CFO engajado, contrato renovado por 2 anos com 10% de aumento. Risk mitigado de 85% → 12%.',
      impact: 'Retenção de $28.800 ARR base + $2.880 adicional (10%) + ARR economizado em re-acquisition (~$15k).',
      arEffect: '+$46.680 ARR impacto total (retenção + aumento + economia)',
      contractChange: 'Renewal: 2 anos | MRR: $2.880 → $3.168',
      lessonsLearned: [
        'Intervenção C-Level em <24h transformou cenário crítico de 85% churn → sucesso',
        'Novo decisor respondeu melhor a abordagem executiva + business focus vs. tactical support',
        'Proposta financeira criou urgência de decisão (10% aumento resonou vs. desconto)',
        '"Champion churn" é sinal mais crítico que engagement cliff — novo decisor = novo contrato',
        'Monitoramento de mudanças executivas no LinkedIn preveniu surpresa total',
        'Recording de workshop foi asset de confiança para novo CFO compartilhar internamente',
      ],
      metrics: [
        {
          label: 'Engajamento',
          before: '0 interações/45 dias',
          after: '8 touchpoints/2 semanas',
          change: '📈 Reativado',
        },
        {
          label: 'ARR',
          before: '$28.800',
          after: '$31.680',
          change: '📈 +10%',
        },
        {
          label: 'Health Score',
          before: '22',
          after: '76',
          change: '📈 +54 pontos',
        },
        {
          label: 'Users Licensed',
          before: '7 (-30% downgrade)',
          after: '9 (+28%)',
          change: '📈 +2 users',
        },
        {
          label: 'Churn Probability',
          before: '85%',
          after: '12%',
          change: '📉 -73 pp',
        },
      ],
    },
    duration: '4 dias',
    complexity: 'critical',
    keyInfluencers: ['CEO (ours)', 'New CFO (FinanceFlow)', 'VP Sales'],
    criticalMoment: '2026-04-03 — Decisão de escalar para C-Level em <24h salvou conta',
  },

  {
    id: 'SIT-002',
    accountName: 'RetailMax',
    accountId: 'ACC-031',
    accountARR: '$8.500',
    accountIndustry: 'Retail',
    situationType: 'expansion',
    situationTitle: 'Aceleração de Deal — Content Consumption Surge + Multi-Threading Detectado',
    context: 'Spike de consumo de conteúdo técnico em 48h. 3 pessoas de procurement/ops pesquisando plataforma simultaneamente. Requisição de demo técnica com urgência implícita (quinta-feira mencionada).',
    triggerDate: '2026-04-07',
    initialState: {
      arrStatus: 'Opportunity',
      engagement: 'Acelerado — múltiplos touchpoints simultâneos',
      stakeholders: 3,
      healthScore: 72,
      contractStatus: 'Prospect',
      lastMilestone: 'Initial demo (3 semanas atrás)',
    },
    timeline: [
      {
        date: '2026-04-07',
        signal: 'Content Consumption Surge',
        severity: 'oportunidade',
        indicator: 'Spike em acesso a pricing page, technical docs, implementation guide',
        value: '12 page views em 48h (vs. 2-3 typical)',
        impact: 'Interesse genuíno escalando para fase técnica',
        source: 'Website Analytics + Marketo',
      },
      {
        date: '2026-04-08',
        signal: 'Demo Booking Spike',
        severity: 'oportunidade',
        indicator: 'Requisição de demo técnica com múltiplos stakeholders',
        value: 'Solicitação de "technical deep-dive com arquitetura"',
        impact: 'Indicador de due diligence ativo — não exploração casual',
        source: 'Outreach platform + Calendar booking',
      },
      {
        date: '2026-04-08',
        signal: 'Multi-Threading Activity — 3 contatos diferentes',
        severity: 'oportunidade',
        indicator: '3 pessoas de 3 funções diferentes (Procurement Dir, Ops Manager, TI Manager) pesquisando',
        value: '3 stakeholders engajados em paralelo',
        impact: 'Dor compartilhada em múltiplas funções — indica urgência cruzada',
        source: 'LinkedIn Sales Navigator + CRM activity',
      },
      {
        date: '2026-04-09',
        signal: 'Competitive Research Detected',
        severity: 'alerta',
        indicator: 'RetailMax também visitou 2 competitors nesta semana',
        value: 'Benchmarking contra [Competitor A] e [Competitor B]',
        impact: 'Deal é genuíno, mas não exclusivo — concorrência ativa',
        source: 'Demandbase + ZoomInfo',
      },
      {
        date: '2026-04-10',
        signal: 'RFP Preparation Signal',
        severity: 'oportunidade',
        indicator: 'Download de RFP template + technical requirements sheet',
        value: 'Preparando processo formal de evaluation',
        impact: 'Sinaliza timeline de decisão estruturado (30-45 dias)',
        source: 'Content tracking',
      },
    ],
    decisionPoints: [
      {
        title: 'Estratégia de aceleração — Co-design vs. Trial vs. POC',
        analysis: 'Signals indicam genuine buying interest de múltiplos ângulos. 3 stakeholders engajados = buy-in largo. Competitor research ativa, então precisa diferenciar rápido. Probabilidade de fechamento: 72% se acelerado nos próximos 7 dias.',
        probability: 72,
        context: 'Deal tem momentum mas não é exclusivo. Timeline implícita de 45 dias (RFP), mas spike atual sugere urgência interna em cliente.',
        options: [
          {
            option: 'Co-design workshop (2h alignment técnico-comercial)',
            description: 'Agendar sessão colaborativa com 3 stakeholders. Alinhar requirements com arquitetura nossa. Build-in de buy-in técnico. Deliverable: requirements alignment doc assinado.',
            owner: 'Sales + Solutions Architect',
            timeline: '48h',
            riskLevel: 'baixo',
            successProbability: 78,
            subOptions: [
              { suboption: 'Pre-workshop: 30min de alinhamento com Procurement Dir (decision maker)', description: 'Alignment com decision maker', cost: 'Médio', effort: 'médio' },
              { suboption: 'Workshop: 2h com todos 3, focado em "como vocês usarão"', description: 'Full team workshop', cost: 'Médio', effort: 'médio' },
              { suboption: 'Post-workshop: recording + requirements doc enviado para aprovação interna deles', description: 'Post-workshop deliverables', cost: 'Baixo', effort: 'baixo' },
            ],
          },
          {
            option: 'Extended Trial — 90 dias free + structure de success',
            description: 'Oferecer trial extenso com CSM dedicado. Risco: "trial paralysis" (usam 90 dias, depois dizem "legal mas não urgent"). Mas cria opt-in mental.',
            owner: 'Sales',
            timeline: '24h',
            riskLevel: 'médio',
            successProbability: 58,
            subOptions: [
              { suboption: 'Trial offer: 90 dias free com 2 logins de usuarios', description: 'Extended free trial', cost: 'Alto (recurso)', effort: 'alto' },
              { suboption: 'Success metric: kit de "primeiras 30 dias" predefinido', description: 'Success framework', cost: 'Médio', effort: 'médio' },
            ],
          },
          {
            option: 'Paid POC — Small scope, $5k, 30 dias',
            description: 'Estruturar POC pago com escopo limitado (1 site piloto vs. all stores). Cria commitment financeiro. Risco: cliente quer resultado garantido em 30 dias.',
            owner: 'Solutions',
            timeline: '5 dias',
            riskLevel: 'médio',
            successProbability: 65,
          },
          {
            option: 'Aggressive Close — Oferta com deadline (72h)',
            description: 'Criar urgência com oferta limitada: "20% desconto se assinarem até 72h". Risco: parece salesy, pode ofender Procurement Dir.',
            owner: 'Sales Director',
            timeline: '24h',
            riskLevel: 'alto',
            successProbability: 48,
          },
        ],
        chosenOption: 0,
        reasoning: 'Co-design alinha técnica + comercial, cria buy-in genuíno sem parecer salesy. Competitors também fazem, mas agendado rápido (48h) nega vantagem deles.',
      },
      {
        title: 'Pós-co-design: Timing de proposta vs. RFP vs. verbal commitment',
        analysis: 'Se co-design for bem-sucedido (likely), cliente vai sair com alignment técnico. Pergunta: enviar proposta escrita formal (gatilho de RFP) ou obter verbal commitment antes?',
        probability: 68,
        context: 'Procurement Dir é decision maker but Ops Manager pode ter veto. RFP formal tipicamente estende deal de 30-60 dias.',
        options: [
          {
            option: 'Proposta formal imediatamente pós-workshop',
            description: 'Aproveitar momentum. Enviar proposta com termos discutidos no workshop. Força cliente a fazer escolha: formal RFP vs. quick close.',
            owner: 'Sales',
            timeline: '24h post-workshop',
            riskLevel: 'baixo',
            successProbability: 72,
          },
          {
            option: 'Verbal commitment primeiro, proposta depois',
            description: 'Pedir OK de princípio de Procurement Dir antes de proposta formal. Reduz risco de "perdida em RFP".',
            owner: 'Sales',
            timeline: '48h post-workshop',
            riskLevel: 'médio',
            successProbability: 65,
          },
          {
            option: 'Deixar deles levar RFP primeiro',
            description: 'Aceitar que vão rodar RFP formal. Antecipar necessidades, ser responsive. Risco: timeline estende para 60+ dias, competitors ganham tempo.',
            owner: 'Sales',
            timeline: 'RFP timeline deles',
            riskLevel: 'alto',
            successProbability: 52,
          },
        ],
        chosenOption: 0,
        reasoning: 'Proposta rápida capitaliza momentum. Se vão para RFP anyway, melhor ter proposta já na mesa.',
      },
    ],
    actionsTaken: [
      {
        date: '2026-04-08',
        action: 'Agendamento urgente de co-design workshop com 3 stakeholders',
        owner: 'Account Executive',
        status: 'completed',
        notes: 'Confirmado: quinta-feira 2h, Zoom com Procurement Dir, Ops Manager, TI Manager',
      },
      {
        date: '2026-04-09',
        action: 'Prep técnico — Solutions Architect mapeou requirements de RetailMax',
        owner: 'Solutions Architect',
        status: 'completed',
        notes: 'Assumindo: multi-site rollout, 500+ users, integração com inventory system',
      },
      {
        date: '2026-04-09',
        action: 'Competitive intel — Preparar diferenciadores vs. Competitor A & B',
        owner: 'Sales Engineer',
        status: 'completed',
        notes: 'Messaging key: implementation speed (16 semanas vs. 24), user adoption (tracking built-in)',
      },
      {
        date: '2026-04-10',
        action: 'Co-design workshop — 2h com alignment de requirements + arquitectura',
        owner: 'Sales + Solutions Architect',
        status: 'completed',
        notes: 'Recording feita. Procurement Dir pediu proposal "dentro de 3 dias". Ops Manager fez 8 perguntas técnicas (positivo).',
      },
      {
        date: '2026-04-11',
        action: 'Proposta formal enviada — Deal $15k MRR, implementation Q2, payment terms net-30',
        owner: 'Sales',
        status: 'completed',
        notes: 'Incluído: 16-week implementation plan, 3 waves de rollout (sites), success metrics',
      },
      {
        date: '2026-04-12',
        action: 'Procurement Dir confirmou: "vamos assinar, precisa de approval CFO por budget size"',
        owner: 'Sales',
        status: 'in-progress',
        notes: 'Next: CFO approval estimado 48-72h. Competidor ainda em RFP (lento).',
      },
      {
        date: '2026-04-13',
        action: 'CFO approval confirmado. Contrato assinado. Kickoff de implementação agendado.',
        owner: 'Account Executive',
        status: 'completed',
        notes: 'Deal fechou em 6 dias de discovery → signature. Speed foi chave.',
      },
    ],
    outcome: {
      result: 'success',
      finalState: 'Deal fechado em 6 dias (vs. 45-60 dias típico). $15k MRR inicial. POC estruturado: 1 site piloto (3 semanas), então rollout para 12 sites restantes em Q3.',
      impact: 'Novo cliente | Expansão potencial de $50k+ ARR em 6 meses (rollout de pilotos para todos stores)',
      arEffect: '+$180k ARR potencial (se expansão completa)',
      contractChange: 'Contract: 1 ano | MRR: $15k | Expansion option: +$4k MRR per site x 11 sites = $44k upside',
      lessonsLearned: [
        'Co-design workshop foi diferenciador crítico — synced 3 stakeholders com buy-in técnico',
        'Multi-threading (3 pessoas) é sinal mais forte que single champion — decisão distribuída',
        'Speed de resposta (co-design em 48h) criou percepção de capacidade vs. competitors (em RFP lento)',
        'Incluir recording de workshop no follow-up foi asset de re-venda internamente (CFO viu gravação, aprovou)',
        'Competitor research conhecimento (zoominfo) permitiu de diferenciador claro (speed + adoption)',
        'Requirements doc assinado pós-workshop = agreement mínimo = proposta foi fácil',
      ],
      metrics: [
        {
          label: 'Deal Cycle',
          before: 'Estimado 45-60 dias',
          after: '6 dias',
          change: '📈 -75% redução',
        },
        {
          label: 'Stakeholder Alignment',
          before: '3 pessoas, goals diferentes',
          after: '100% aligned (3/3 assinaram)',
          change: '📈 +100%',
        },
        {
          label: 'Deal Value',
          before: 'Estimado $8k MRR',
          after: '$15k MRR + $44k upside',
          change: '📈 +87% inicial, +550% upside',
        },
        {
          label: 'Win Probability vs. Competitors',
          before: 'Desconhecido',
          after: '95% (PO em mãos, implementação begun)',
          change: '📈 Dominante',
        },
      ],
    },
    duration: '6 dias',
    complexity: 'moderate',
    keyInfluencers: ['Procurement Director', 'Ops Manager', 'CFO (approval)'],
    criticalMoment: '2026-04-10 — Co-design workshop em 48h estabeleceu diferenciador vs. competitors em RFP lento',
  },

  {
    id: 'SIT-003',
    accountName: 'HealthTech',
    accountId: 'ACC-045',
    accountARR: '$0',
    accountIndustry: 'Healthcare',
    situationType: 'cross-sell',
    situationTitle: 'Cross-Account Opportunity — Holding com 5 Subsidiárias, Shared Pain, Centralized Decision',
    context: 'Holding (ParentCorp) com 5 subsidiárias healthcare. 5 stakeholders de 5 subsidiárias pesquisando solução simultaneamente sem coordenação explícita. Mesma dor: operational efficiency em procurement. CIO + CFO do holding querem avaliar como consolidação.',
    triggerDate: '2026-04-10',
    initialState: {
      arrStatus: 'Multi-opportunity (zero baseline)',
      engagement: 'Cluster research — distribuído',
      stakeholders: 5,
      healthScore: 65,
      contractStatus: 'Prospect (grupo)',
      lastMilestone: 'Initial contact com Sub A manager',
    },
    timeline: [
      {
        date: '2026-04-10',
        signal: 'Multi-Threading Activity x5 (Não-coordenado)',
        severity: 'oportunidade',
        indicator: '5 pessoas de 5 subsidiárias diferentes pesquisando plataforma em paralelo',
        value: '5 stakeholders, cada um com seu CRM entry',
        impact: 'Padrão distribuído — indica dor compartilhada sistêmica',
        source: 'CRM + Marketo leads',
      },
      {
        date: '2026-04-11',
        signal: 'Shared Pain Pattern Detectado',
        severity: 'oportunidade',
        indicator: 'Análise de pain statements: 3 subsidiárias mencionam "procurement inefficiency"',
        value: 'Ineficiência operacional (comum em multi-entity setup)',
        impact: 'Oportunidade não é Sub A isolada — é sistêmica na ParentCorp',
        source: 'Outreach conversations + RFI responses',
      },
      {
        date: '2026-04-12',
        signal: 'Committee Engagement — Holding Level',
        severity: 'oportunidade',
        indicator: 'CIO + CFO do holding quer avaliar "como solução se consolidaria para ParentCorp"',
        value: '2 C-level do holding engajados',
        impact: 'Decisão pode ser centralizada (holding) vs. 5 independentes (subsidiárias)',
        source: 'Initial call com Sub A Dir, que escalou para holding',
      },
      {
        date: '2026-04-13',
        signal: 'Budget Reservation Detected',
        severity: 'alerta',
        indicator: 'Sub A manager menciona "budget alocado para H2 para solução de procurement"',
        value: 'Budget já existe — não é exploração casual',
        impact: 'Deal é financeiramente viável já',
        source: 'Conversation notes',
      },
      {
        date: '2026-04-14',
        signal: 'Competitive Threat — Alternative Build',
        severity: 'alerta',
        indicator: 'ParentCorp CIO menciona "estamos considerando build in-house vs. buy"',
        value: 'Competição: custom development (longo, caro) vs. nós',
        impact: 'Oportunidade de posicionar speed-to-value (SaaS vs. build)',
        source: 'CIO conversation',
      },
      {
        date: '2026-04-16',
        signal: 'Stakeholder Conflict Emerging',
        severity: 'alerta',
        indicator: 'Sub B VP diz "não queremos holding mandatando tecnologia — queremos autonomia"',
        value: 'Potential friction: holding control vs. subsidiary independence',
        impact: 'Complexidade de buy-in aumentada',
        source: 'Discovery call Sub B',
      },
    ],
    decisionPoints: [
      {
        title: 'Abordagem estratégica: Individual vs. Cluster vs. Hybrid',
        analysis: 'Oportunidade excepcional de $150k+ potencial (5 subsidiárias x $30k cada). Mas decision structure é complexa: holding quer consolidação, subsidiárias querem autonomia. Probabilidade de fechamento com abordagem clustered (holding-led): 85%. Com individual (5 deals): 45% (cada um é deal separado, longo).',
        probability: 85,
        context: 'CIO + CFO do holding têm peso político de consolidar. Mas subsidiárias operacionais têm veto potencial. Timing: holding quer decisão em 6 semanas (antes de Q3 budget planning).',
        options: [
          {
            option: 'ABM Campaign — Holding-Level (Consolidation Play)',
            description: 'Criar case study + business case consolidado para holding. ROI calculations mostrando economia de consolidação (vs. 5 deals independentes). Pitch direto para CIO + CFO do holding como "strategic consolidation".',
            owner: 'ABM Manager + Sales Director',
            timeline: '7 dias',
            riskLevel: 'médio',
            successProbability: 78,
            subOptions: [
              { suboption: 'Case study: Consolidação em outro holding healthcare (com permissão)', description: 'Social proof case study', cost: 'Médio', effort: 'médio' },
              { suboption: 'Business case: ROI de consolidação (% savings vs. 5 independent deployments)', description: 'Consolidation ROI analysis', cost: 'Médio', effort: 'médio' },
              { suboption: 'Governance proposal: Como manejar holding mandates + subsidiary autonomy', description: 'Governance framework proposal', cost: 'Médio', effort: 'alto' },
            ],
          },
          {
            option: 'Parallel Track — Deal individual em Sub A + Enterprise commitment para 4 restantes',
            description: 'Estruturar Pilot em Sub A (pequeno escopo, $30k, 8 semanas). Simultaneously obter enterprise commitment escrito de holding para rollout em Sub B-E em Q3. Hedges risco: prova conceito + commitment futuro.',
            owner: 'Sales + Solutions',
            timeline: '14 dias',
            riskLevel: 'médio',
            successProbability: 72,
            subOptions: [
              { suboption: 'Sub A Pilot: $30k, 1 departamento, 8 semanas (MVP)', description: 'Pilot implementation', cost: 'Médio', effort: 'médio' },
              { suboption: 'Enterprise MOU: ParentCorp commita para Sub B-E rollout, condicionado ao sucesso Sub A', description: 'Enterprise commitment MOU', cost: 'Baixo (estrutural)', effort: 'médio' },
            ],
          },
          {
            option: 'Individual Track — 5 deals independentes com messaging corporativo',
            description: 'Tratar cada subsidiária como deal separado, mas coordenado tematicamente (ex: "healthcare consolidation efficiency" em marketing). Risco: longo, cada subsidiary tem timeline diferente, holding se frustra com ineficiência.',
            owner: 'Sales Team',
            timeline: '60-90 dias',
            riskLevel: 'alto',
            successProbability: 48,
          },
          {
            option: 'Build vs. Buy Positioning — Compore nosso SaaS vs. custom development',
            description: 'Posicionar SaaS como "speed to value" vs. "custom build = 18 meses + ongoing maintenance". Apresentar ROI time-to-value como vantagem competitiva.',
            owner: 'Sales Director + Solutions Architect',
            timeline: '3 dias',
            riskLevel: 'baixo',
            successProbability: 65,
            subOptions: [
              { suboption: 'TCO analysis: Build in-house vs. SaaS vs. alternative vendors', description: 'TCO comparison analysis', cost: 'Médio', effort: 'alto' },
              { suboption: 'Case study: Outro healthcare que tentou build, falhou, migrou para SaaS', description: 'Build failure case study', cost: 'Médio', effort: 'médio' },
            ],
          },
        ],
        chosenOption: 2,
        reasoning: 'Hybrid (Pilot + Enterprise MOU) reduce risco enquanto capitaliza holding momentum. Prova conceito em Sub A, commitment de enterprise para 4 restantes = deal seguro com upside em Q3.',
      },
      {
        title: 'Governança pós-deal: Como manejar holding mandates vs. subsidiary autonomy tension',
        analysis: 'Se MOU for assinado, vai ter fricção: Como holding implementa standard enquanto subsidiárias querempersonalização. Precisa de governance model claro desde day 1.',
        probability: 72,
        context: 'Sub B VP já sinalizou "não queremos mandatos de cima". Holding CIO quer consolidação. Típica dinâmica corporativa multi-entity.',
        options: [
          {
            option: 'Governance Framework — "Core mandatory + Local optional"',
            description: 'Estruturar solução com core modules (mandatory across all subs) + local customizations (optional, cada sub decide). Resolve tension.',
            owner: 'Solutions Architect',
            timeline: '5 dias',
            riskLevel: 'baixo',
            successProbability: 82,
            subOptions: [
              { suboption: 'Core modules: Procurement workflow, spend analytics, vendor management (holding mandates)', description: 'Core standard modules', cost: 'Incluído', effort: 'alto' },
              { suboption: 'Local modules: Custom integrations, reports, configurations (subsidiárias pagam add-on)', description: 'Local optional modules', cost: 'Variável', effort: 'médio' },
            ],
          },
          {
            option: 'Subsidiary Steering Committee — Quarterly alignment',
            description: 'Estruturar comitê com reps de cada sub + holding. Sync quarterly sobre roadmap, customizations, governance decisions. Gives subs voz.',
            owner: 'Customer Success',
            timeline: 'Post-launch',
            riskLevel: 'baixo',
            successProbability: 75,
          },
          {
            option: 'Expansion incentive — "Subsidiárias que excedem adoption targets ganham free customizations"',
            description: 'Criar gamification: se Sub B adopta 80% in 6 months, recebe X horas de free implementation para custom reports. Alignment incentivo.',
            owner: 'Sales',
            timeline: '30 dias pós-launch',
            riskLevel: 'médio',
            successProbability: 68,
          },
        ],
        chosenOption: 0,
        reasoning: 'Core + Local framework resolve tension estruturalmente. Allows consolidation (holding happy) + autonomy (subsidiárias happy). Implementação mais complexa mas buy-in melhor.',
      },
    ],
    actionsTaken: [
      {
        date: '2026-04-12',
        action: 'Mapeamento de dor em 5 subsidiárias — Entrevistas executivas com cada Sub VP/Dir',
        owner: 'ABM Manager',
        status: 'completed',
        notes: 'Confirmed: procurements inefficiency é pain-point comum. Variações por sub (Sub A: approvals; Sub B: vendor mgmt; Sub C: spend visibility).',
      },
      {
        date: '2026-04-13',
        action: 'Consolidation case study criado + ROI business case para holding',
        owner: 'Marketing + ABM Manager',
        status: 'completed',
        notes: 'Case study: Hospital system com 3 entities, consolidou com SaaS, 40% reduction in procurement cycle time.',
      },
      {
        date: '2026-04-15',
        action: 'Apresentação executiva ao CIO + CFO do holding',
        owner: 'CEO (ours) + ABM Manager',
        status: 'completed',
        notes: 'CIO positivo, CFO pediu "proposal para consolidation + costs de rollout staged".  Alternative build vs. buy comparison well received.',
      },
      {
        date: '2026-04-16',
        action: 'Estruturação de Hybrid deal — Sub A Pilot + Enterprise MOU para Sub B-E',
        owner: 'Sales Director + Solutions Architect',
        status: 'completed',
        notes: 'Proposal: $30k Sub A (8 weeks), + $120k Enterprise MOU (Sub B-E, conditional on Sub A success).',
      },
      {
        date: '2026-04-17',
        action: 'Subsidiary individual meetings — Address concerns (Sub B autonomy, Sub C integration questions)',
        owner: 'Sales + Solutions Architect',
        status: 'in-progress',
        notes: 'Sub B: Reassured on "core mandatory + local optional" framework. Sub C: Tech integration call scheduled.',
      },
      {
        date: '2026-04-19',
        action: 'Pilot terms finalized + Enterprise MOU drafted',
        owner: 'Legal + Sales',
        status: 'in-progress',
        notes: 'MOU language: "Enterprise commitment conditioned on Sub A pilot achieving 75% adoption in 8 weeks".',
      },
      {
        date: '2026-04-20',
        action: 'Sub A Pilot contract signed + Enterprise MOU signed (holding CIO + CFO)',
        owner: 'Sales Director',
        status: 'completed',
        notes: 'Deal closed: $30k immediate + $120k committed (Q3 trigger). Kickoff Sub A pilot week of 4/21.',
      },
    ],
    outcome: {
      result: 'partial',
      finalState: 'Pilot (Sub A) go-live pada Q2, Enterprise commitment de ParentCorp assinado para Sub B-E rollout Q3 (condicionado ao sucesso do pilot). Governance framework ("core mandatory + local optional") implementado para suportar holding mandates + sub autonomy.',
      impact: 'Deal inicial $30k + Enterprise commitment $120k (Q3). Potencial de $50k+ adicional em customizations + expansão.',
      arEffect: '+$150k ARR (se enterprise MOU converte 100%)',
      contractChange: 'Pilot: 8 weeks | MRR: $3.75k | Enterprise (conditional): $15k MRR x Sub B-E, starting Q3',
      lessonsLearned: [
        'Multi-entity opportunity requer consolidation play (holding-led) vs. 5 individual deals (seria 3x mais longo)',
        'Hybrid model (pilot + enterprise MOU) hedges risco: prova conceito + future commitment = safe close',
        'Governance framework ("core + local") foi key de resolver tension entre holding mandates e subsidiary autonomy',
        'Case study consolidation foi persuasivo para CIO + CFO — social proof de "holding consolidation works"',
        'Subsidiary individual meetings foram críticas — Sub B veto risk só resolvido com autonomy reassurance',
        'Build vs. buy positioning foi decisive — CIO considerava custom build, SaaS speed-to-value ganhou',
        'Enterprise MOU com trigger conditions (sub A success) alinhava incentivos e comunicava expectations',
      ],
      metrics: [
        {
          label: 'Oportunidade Potencial',
          before: '$150k (5 subs x $30k)',
          after: '$150k locked-in (pilot $30k + enterprise MOU $120k)',
          change: '📈 100% captured',
        },
        {
          label: 'Stakeholder Alignment',
          before: '5 independent, cada um diferente',
          after: 'Holding centralized + subs aligned via governance framework',
          change: '📈 +85% alignment',
        },
        {
          label: 'Decision Complexity',
          before: 'Muito alta (5 independent decisions)',
          after: 'Média (1 holding approval + pilot success)',
          change: '📉 -60% complexidade',
        },
        {
          label: 'Time-to-First-Deal',
          before: '90-120 dias (typical multi-entity)',
          after: '10 dias (pilot close)',
          change: '📈 -88% redução',
        },
        {
          label: 'Enterprise Expansion Probability',
          before: 'Incerto (5 separate paths)',
          after: '80% (MOU com trigger)',
          change: '📈 +High confidence',
        },
      ],
    },
    duration: '10 dias',
    complexity: 'critical',
    keyInfluencers: ['CIO (holding)', 'CFO (holding)', 'Sub A Dir (pilot champion)', 'Sub B VP (risk — autonomy)'],
    criticalMoment: '2026-04-15 — CEO presentation ao holding CIO + CFO estabeleceu consolidation como estratégia viable (vs. build in-house)',
  },
];
