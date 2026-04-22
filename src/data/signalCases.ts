import { SignalSituation } from './signalSituations';

export type SignalCaseType = 'risk' | 'expansion';

export interface SignalEvidence {
  title: string;
  detail: string;
  source?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SignalCaseAction {
  title: string;
  type: string;
  ownerSuggestion?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface SignalCase {
  id: string;
  signalId: string;
  accountId: string;
  accountName: string;
  signalTitle: string;
  signalType: SignalCaseType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  summary: string;
  evidence: SignalEvidence[];
  situationData: SignalSituation;
  outputActions: SignalCaseAction[];
  decisionLedger: Array<{
    stage: number;
    decision: string;
    timestamp: string;
    owner?: string;
  }>;
}

export const signalCases: Record<string, SignalCase> = {
  'SIG-4068': {
    id: 'CASE-4068-001',
    signalId: 'SIG-4068',
    accountId: '11',
    accountName: 'Nexus Fintech',
    signalTitle: 'Sponsor principal saiu da empresa',
    signalType: 'risk',
    severity: 'critical',
    confidence: 97,
    summary: 'VP de Tecnologia, principal sponsor, saiu. Proposta de R$ 280k em estágio de Decisão em risco.',
    evidence: [
      {
        title: 'Sponsor saiu da empresa',
        detail: 'VP de Tecnologia (Rodrigo Alvez) já não está na empresa. Sem substituto designado.',
        source: 'LinkedIn',
        severity: 'critical'
      },
      {
        title: 'Proposta em risco',
        detail: 'Proposta final de R$ 280k enviada há 8 dias. Agora sem sponsor, risco de atraso ou perda total.',
        source: 'CRM',
        severity: 'critical'
      },
      {
        title: 'Timeframe crítico',
        detail: 'Estágio de Decisão tipicamente dura 5-7 dias. Sem decisor, proposta pode expirar em 60-90 dias.',
        source: 'Estimativa Comercial',
        severity: 'high'
      }
    ],
    situationData: {
      id: 'SIT-004-CHURN-NEXUS',
      accountName: 'Nexus Fintech',
      accountId: '11',
      accountARR: '$280k',
      accountIndustry: 'Fintech',
      situationTitle: 'Reativação Urgente: Risco de Perda de Sponsor Principal',
      context: 'Conta Enterprise em estágio de Decisão com proposta de R$ 280k. VP de Tecnologia (sponsor principal) saiu da empresa. Sem substituto designado. Risco de atraso de 60-90 dias ou perda total do negócio.',
      situationType: 'churn-prevention',
      triggerDate: '2026-04-22',
      initialState: {
        arrStatus: 'R$ 280k em risco (proposta Decisão)',
        engagement: 'Sponsor saiu, nível baixo',
        stakeholders: 1,
        healthScore: 22,
        contractStatus: 'Proposta em Decisão',
        lastMilestone: 'Proposta enviada há 8 dias'
      },
      duration: '48-72h',
      complexity: 'critical',
      timeline: [
        {
          date: 'Dia 1',
          signal: 'VP Tecnologia sai da empresa',
          severity: 'crítico',
          indicator: 'Sponsor Principal Ausente',
          value: 'Perda imediata'
        },
        {
          date: 'Dia 2',
          signal: 'Tentativa de contato fallha',
          severity: 'crítico',
          indicator: 'Sem Resposta',
          value: 'Impossível validar novo decisor'
        },
        {
          date: 'Dia 3-8',
          signal: 'Proposta em limbo',
          severity: 'alerta',
          indicator: 'Sem Progresso',
          value: 'Estágio de Decisão suspenso'
        }
      ],
      decisionPoints: [
        {
          title: 'Como reagir à saída do sponsor?',
          analysis: 'Três opções: (1) Mapear novo sponsor direto (CFO), (2) Aguardar nova liderança de TI, (3) Reformular proposta para novo contexto',
          probability: 0.85,
          context: 'Janela de 24-48h para agir antes que a proposta expire definitivamente',
          chosenOption: -1,
          options: [
            {
              option: 'Ação urgente: Acionar CFO em 24h',
              description: 'Email executivo direto + LinkedIn message para CFO. Propor reunião de confirmação da continuidade do projeto.',
              owner: 'Pablo Diniz',
              timeline: '24h',
              successProbability: 78,
              riskLevel: 'médio',
              consequence: 'Retenção imediata do Champion e validação da proposta de R$ 280k.',
              actionDerived: 'Executiva comercial assumir outreach imediato.'
            },
            {
              option: 'Aguardar novo VP de TI ser designado',
              description: 'Agendar reunião com novo VP (quando designado). Risco: processo pode levar 30-60 dias.',
              owner: 'Pablo Diniz',
              timeline: '30-60 dias',
              successProbability: 35,
              riskLevel: 'alto',
              consequence: 'Risco crítico de perda do budget trimestral e esfriamento do deal.',
              actionDerived: 'Manter monitoramento passivo do LinkedIn e CRM.'
            },
            {
              option: 'Reformular para CFO + Operações',
              description: 'Reposicionar proposta como iniciativa de transformação operacional (não só TI).',
              owner: 'Equipe Comercial',
              timeline: '48h',
              successProbability: 65,
              riskLevel: 'médio',
              consequence: 'Ampliação do valor percebido mas requer novo alinhamento técnico posterior.',
              actionDerived: 'Revisão do business case com foco em eficiência financeira.'
            }
          ]
        }
      ],
      actionsTaken: [
        {
          date: '2026-04-22',
          action: 'Identificar novo decisor',
          owner: 'Pablo Diniz',
          status: 'in-progress',
          notes: 'Prioridade: CFO ou novo VP de TI. Busca ativa LinkedIn + CRM nos próximos 24h.'
        },
        {
          date: '2026-04-23',
          action: 'Preparar email executivo para CFO',
          owner: 'Marketing + Comercial',
          status: 'pending',
          notes: 'Narrativa: Continuidade da parceria estratégica. Mencionar projeto em andamento.'
        }
      ],
      outcome: {
        result: 'partial',
        finalState: 'Proposta de R$ 280k em risco. Ação urgente em 24-48h pode salvar negócio.',
        impact: 'Se bem-sucedido: retenção de R$ 280k + possível aumento. Se fracassa: perda total.',
        lessonsLearned: ['Manter múltiplos sponsors em contas Enterprise', 'Monitorar rotatividade de liderança'],
        metrics: [
          { label: 'Risco de Perda', before: '80%', after: '40%', change: '-40%' },
          { label: 'Timeframe', before: '60-90 dias', after: '48-72h', change: 'Crítico' }
        ]
      }
    },
    outputActions: [
      {
        title: 'Identificar novo decisor (CFO ou novo VP TI)',
        type: 'research',
        ownerSuggestion: 'Pablo Diniz',
        priority: 'high',
        description: 'Busca ativa no LinkedIn + CRM para identificar CFO ou novo VP de Tecnologia designado'
      },
      {
        title: 'Enviar email executivo ao CFO',
        type: 'outreach',
        ownerSuggestion: 'Pablo Diniz',
        priority: 'high',
        description: 'Propor reunião de continuidade. Incluir narrativa sobre impacto do projeto.'
      },
      {
        title: 'Agendar reunião em 24h',
        type: 'meeting',
        ownerSuggestion: 'Pablo Diniz',
        priority: 'high',
        description: 'Confirmação de continuidade ou reformulação da proposta'
      },
      {
        title: 'Reformular proposta se necessário',
        type: 'proposal',
        ownerSuggestion: 'Equipe Comercial',
        priority: 'medium',
        description: 'Reposicionar para CFO + contexto operacional se novo VP não estiver disponível'
      }
    ],
    decisionLedger: []
  },
  'SIG-4055': {
    id: 'CASE-4055-001',
    signalId: 'SIG-4055',
    accountId: '13',
    accountName: 'MSD Saúde',
    signalTitle: 'Sinal de expansão detectado',
    signalType: 'expansion',
    severity: 'high',
    confidence: 81,
    summary: '3 novos decisores acessaram funcionalidades avançadas e deck de expansão. Oportunidade de R$ 180k adicionais.',
    evidence: [
      {
        title: '3 novos decisores ativos',
        detail: 'Três novos contatos da MSD Saúde acessaram funcionalidades avançadas nas últimas 8 horas.',
        source: 'Intent Data',
        severity: 'high'
      },
      {
        title: 'Acesso ao deck de expansão',
        detail: 'Conteúdo de expansão / upgrade foi visualizado por múltiplos decisores em sequência.',
        source: 'Site Analytics',
        severity: 'high'
      },
      {
        title: 'Cliente ativo em crescimento',
        detail: 'MSD Saúde é cliente atual. Padrão de acesso sugere avaliação interna para upgrade ou nova unidade de negócio.',
        source: 'CRM',
        severity: 'medium'
      }
    ],
    situationData: {
      id: 'SIT-005-EXPANSION-MSD',
      accountName: 'MSD Saúde',
      accountId: '13',
      accountARR: 'R$ 180k+ oportunidade',
      accountIndustry: 'Saúde',
      situationTitle: 'Oportunidade de Expansão: Upgrade ou Novo Segmento',
      context: 'Cliente Enterprise ativo acessou conteúdo de expansão. Três novos decisores engajados simultaneamente sugere avaliação interna de upgrade ou nova unidade de negócio. Oportunidade: R$ 180k adicionais.',
      situationType: 'expansion',
      triggerDate: '2026-04-22',
      initialState: {
        arrStatus: 'R$ 180k adicionais em potencial',
        engagement: 'Muito alto - 3 novos decisores ativos',
        stakeholders: 3,
        healthScore: 85,
        contractStatus: 'Cliente ativo buscando expansão',
        lastMilestone: '3 novos decisores acessaram deck'
      },
      duration: '14-21 dias',
      complexity: 'moderate',
      timeline: [
        {
          date: 'Hoje',
          signal: '3 novos decisores acessam deck de expansão',
          severity: 'oportunidade',
          indicator: '3 Decisores Novos Ativos',
          value: 'Sinal claro'
        },
        {
          date: 'Próximas 48h',
          signal: 'Janela crítica para engajar',
          severity: 'oportunidade',
          indicator: 'Momentum de Avaliação',
          value: 'Primeira mão vence'
        },
        {
          date: 'Próximas 2 semanas',
          signal: 'Decisão será tomada',
          severity: 'oportunidade',
          indicator: 'Proposta + Reunião',
          value: 'Timing é tudo'
        }
      ],
      decisionPoints: [
        {
          title: 'Como capitalizar o sinal de expansão?',
          analysis: 'MSD está avaliando upgrade ou novo segmento. Três decisores novos = sinal forte. Janela: 48h para primeira mão.',
          probability: 0.88,
          context: 'Expansões de clientes existentes têm 3x mais chance de fechar se abordadas nos primeiros 2 dias do sinal.',
          chosenOption: -1,
          options: [
            {
              option: 'Reunião executiva em 24-48h',
              description: 'Agendar call executiva com os 3 novos contatos + sponsor atual. Objetivo: entender escopo de expansão e preparar proposta.',
              owner: 'Pablo Diniz',
              timeline: '24-48h',
              successProbability: 94,
              riskLevel: 'baixo'
            },
            {
              option: 'Proposta preparatória imediata',
              description: 'Baseado no uso atual da MSD, montar proposta preliminar para expansão. Enviar em 24h com convite para reunião.',
              owner: 'Equipe Comercial',
              timeline: '24h',
              successProbability: 78,
              riskLevel: 'baixo'
            },
            {
              option: 'Mapear novos decisores primeiro',
              description: 'Antes de proposta ou reunião, entender quem são os 3 novos contatos e qual seu poder de decisão.',
              owner: 'Pablo Diniz',
              timeline: '3-5 dias',
              successProbability: 45,
              riskLevel: 'alto'
            }
          ]
        }
      ],
      actionsTaken: [
        {
          date: '2026-04-22',
          action: 'Mapear 3 novos decisores',
          owner: 'Pablo Diniz',
          status: 'in-progress',
          notes: 'Entender roles, poder de decisão, e conexão com sponsor atual. LinkedIn search + CRM.'
        },
        {
          date: '2026-04-23',
          action: 'Preparar proposta de expansão',
          owner: 'Equipe Comercial',
          status: 'pending',
          notes: 'Baseada no uso atual da MSD. R$ 180k adicionais sugere upgrade ou novo módulo.'
        }
      ],
      outcome: {
        result: 'partial',
        finalState: 'Oportunidade de R$ 180k em avaliação interna. Janela crítica: próximos 2-3 dias.',
        impact: 'Se bem-sucedido: R$ 180k adicionais + relacionamento estratégico. Se fracassa: concorrente entra.',
        lessonsLearned: ['Expansões ganham com velocidade', 'Primeira mão geralmente vence', 'Proposta em <24h é crítica'],
        metrics: [
          { label: 'Oportunidade', before: 'Detectada', after: 'Quantificada R$ 180k', change: '+100% visibility' },
          { label: 'Janela', before: 'Contínua', after: '2-3 dias críticos', change: 'Urgência' }
        ]
      }
    },
    outputActions: [
      {
        title: 'Agendar reunião executiva em 24-48h',
        type: 'meeting',
        ownerSuggestion: 'Pablo Diniz',
        priority: 'high',
        description: 'Com os 3 novos decisores + sponsor atual. Entender escopo de expansão.'
      },
      {
        title: 'Preparar proposta de expansão',
        type: 'proposal',
        ownerSuggestion: 'Equipe Comercial',
        priority: 'high',
        description: 'R$ 180k adicionais. Baseada em uso atual + nova unidade/segmento.'
      },
      {
        title: 'Mapear 3 novos decisores',
        type: 'research',
        ownerSuggestion: 'Pablo Diniz',
        priority: 'medium',
        description: 'Roles, poder de decisão, e conexão com sponsor atual'
      },
      {
        title: 'Preparar narrativa de expansão',
        type: 'content',
        ownerSuggestion: 'Marketing',
        priority: 'medium',
        description: 'Case studies de outras contas em expansão similar'
      }
    ],
    decisionLedger: []
  }
};
