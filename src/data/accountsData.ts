export type TipoEstrategico = 'ABM' | 'ABX' | 'Híbrida' | 'Em andamento';

export interface SinalConta {
  id: string;
  titulo: string;
  tipo: 'Mudança' | 'Alerta' | 'Tendência';
  impacto: 'Alto' | 'Médio' | 'Baixo';
  owner: string;
  recomendacao: string;
  contexto: string;
  data: string;
}

export interface AcaoConta {
  id: string;
  titulo: string;
  status: 'Em aberto' | 'Em andamento' | 'Atrasada' | 'Concluída';
  owner: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  prazo: string;
}

export interface ContatoConta {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  senioridade: 'C-Level' | 'Diretoria' | 'Gerência' | 'Especialista';
  papelComite: string;
  forcaRelacional: number;
  receptividade: 'Alta' | 'Média' | 'Baixa';
  acessibilidade: 'Alta' | 'Média' | 'Baixa';
  status: string;
  classificacao: ('Decisor' | 'Influenciador' | 'Champion' | 'Sponsor' | 'Blocker' | 'Técnico' | 'Negócio')[];
  liderId?: string;
  influencia: number;
  potencialSucesso: number;
  /** Score consolidado de probabilidade de conversão (0-100) */
  scoreSucesso: number;
  /** Sugestão de abertura de conversa Canopi AI */
  ganchoReuniao?: string;
}

export interface OportunidadeConta {
  id: string;
  nome: string;
  etapa: string;
  valor: number;
  owner: string;
  risco: 'Alto' | 'Médio' | 'Baixo';
  probabilidade: number;
  historico: string[];
}

// --- TIPAGEM OPERACIONAL (QUEUE GLOBAL) ---
export type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
export type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Aguardando aprovação" | "Concluída";
export type SlaStatus = "vencido" | "alerta" | "ok" | "sem_sla";

export interface ProjectStep {
  id: string;
  lane: string;
  label: string;
  owner: string;
  startWeek: number;
  duration: number;
  status: "done" | "active" | "pending" | "risk";
  detail: string;
}

export interface HistoryItem {
  id: string;
  when: string;
  actor: string;
  type: "mudança" | "evidência" | "risco" | "owner" | "follow-up";
  text: string;
}

export interface ActionItem {
  id: string;
  priority: Priority;
  category: string;
  channel: string;
  status: ActionStatus;
  title: string;
  description: string;
  accountName: string;
  accountContext: string;
  origin: string;
  relatedSignal: string;
  ownerName: string | null;
  suggestedOwner: string;
  ownerTeam: string;
  slaText: string;
  slaStatus: SlaStatus;
  expectedImpact: string;
  nextStep: string;
  dependencies: string[];
  evidence: string[];
  history: HistoryItem[];
  projectObjective: string;
  projectSuccess: string;
  projectSteps: ProjectStep[];
  buttons: { id: string; label: string; tone: "primary" | "secondary" | "danger"; action: "open" | "assign" | "start" | "escalate" | "complete" | "project" }[];
  
  sourceType?: "manual" | "signal" | "playbook";
  playbookName?: string;
  playbookRunId?: string;
  playbookStepId?: string;
  relatedAccountId?: string;
}

export interface Conta {
  id: string;
  slug: string;
  nome: string;
  dominio: string;
  vertical: string;
  segmento: string;
  porte: string;
  localizacao: string;
  ownerPrincipal: string;
  ownersSecundarios: string[];
  etapa: string;
  tipoEstrategico: TipoEstrategico;
  potencial: number;
  risco: number;
  prontidao: number;
  coberturaRelacional: number;
  icp: number;
  crm: number;
  vp: number;
  ct: number;
  ft: number;
  /** Valor absoluto em BRL (Reais) */
  budgetBrl: number;
  ultimaMovimentacao: string;
  atividadeRecente: 'Alta' | 'Média' | 'Baixa';
  playAtivo: 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum';
  statusGeral: 'Saudável' | 'Atenção' | 'Crítico';
  oportunidadePrincipal?: string;
  possuiOportunidade: boolean;
  proximaMelhorAcao: string;
  resumoExecutivo: string;
  leituraFactual: string[];
  leituraInferida: string[];
  leituraSugerida: string[];
  sinais: SinalConta[];
  acoes: AcaoConta[];
  contatos: ContatoConta[];
  oportunidades: OportunidadeConta[];
  canaisCampanhas: {
    origemPrincipal: string;
    influencias: { canal: string; campanha: string; tipo: string; impacto: string; data: string }[];
  };
  abm: {
    motivo: string;
    fit: string;
    cluster: string;
    similaridade: string;
    coberturaInicialComite: string;
    playsEntrada: string[];
    potencialAbertura: string;
    hipoteses: string[];
    contasSimilares: string[];
  };
  abx: {
    motivo: string;
    evolucaoJornada: string;
    maturidadeRelacional: string;
    sponsorAtivo: string;
    profundidadeComite: string;
    continuidade: string;
    expansao: string;
    retencao: string;
    riscoEstagnacao: string;
  };
  inteligencia: {
    sucessos: string[];
    insucessos: string[];
    padroes: string[];
    learnings: string[];
    hipoteses: string[];
    fatoresRecomendacao: string[];
  };
  tecnografia: string[];
  historico: { data: string; tipo: string; descricao: string; icone?: string }[];
}

export const contasMock: Conta[] = [
  {
    id: '1',
    slug: 'nova-energia-brasil',
    nome: 'Nova Energia Brasil',
    dominio: 'novaenergia.com.br',
    vertical: 'Energia',
    segmento: 'Enterprise',
    porte: 'Grande',
    localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Mariana Costa',
    ownersSecundarios: ['Leandro Silva', 'Paula Nogueira'],
    etapa: 'Expansão',
    tipoEstrategico: 'Híbrida',
    potencial: 92,
    risco: 38,
    prontidao: 84,
    coberturaRelacional: 63,
    ultimaMovimentacao: '2026-03-29',
    atividadeRecente: 'Alta',
    playAtivo: 'Híbrido',
    statusGeral: 'Atenção',
    icp: 94,
    crm: 86,
    vp: 88,
    ct: 72,
    ft: 90,
    budgetBrl: 3200000,
    oportunidadePrincipal: 'Renovação multi-unidade 2026',
    possuiOportunidade: true,
    proximaMelhorAcao: 'Executar reunião executiva com VP de Operações e Sponsor de TI.',
    resumoExecutivo: 'Conta em expansão com alto potencial de receita adicional, porém com lacunas críticas em cobertura do comitê técnico-financeiro.',
    leituraFactual: ['3 sinais críticos nos últimos 10 dias.', '2 oportunidades abertas com valor total de R$ 3,2M.', 'Sponsor atual com baixa disponibilidade.'],
    leituraInferida: ['Risco de atraso de decisão por falta de alinhamento entre operações e finanças.', 'Possível aceleração se houver reforço de champion interno no time de TI.'],
    leituraSugerida: ['Priorizar engajamento no nível diretoria financeira.', 'Ativar play ABX de continuidade para blindar renovação.'],
    sinais: [
      { id: 's1', titulo: 'Mudança no comitê de compras', tipo: 'Mudança', impacto: 'Alto', owner: 'Mariana Costa', recomendacao: 'Mapear novo decisor em até 48h.', contexto: 'Diretor de compras anterior deixou a empresa.', data: '2026-03-28' },
      { id: 's2', titulo: 'Queda no engajamento de sponsor', tipo: 'Alerta', impacto: 'Médio', owner: 'Leandro Silva', recomendacao: 'Reforçar cadência executiva quinzenal.', contexto: 'Últimas 2 reuniões canceladas pelo sponsor.', data: '2026-03-24' }
    ],
    acoes: [
      { id: 'a1', titulo: 'Atualizar mapa de stakeholders de finanças', status: 'Em aberto', owner: 'Paula Nogueira', prioridade: 'Alta', prazo: '2026-04-02' },
      { id: 'a2', titulo: 'Reunião de alinhamento com sponsor', status: 'Atrasada', owner: 'Mariana Costa', prioridade: 'Alta', prazo: '2026-03-26' },
      { id: 'a3', titulo: 'Validar proposta de expansão de escopo', status: 'Em andamento', owner: 'Leandro Silva', prioridade: 'Média', prazo: '2026-04-08' }
    ],
    contatos: [
      { id: 'c1', nome: 'Roberta Lima', cargo: 'VP de Operações', area: 'Operações', senioridade: 'C-Level', papelComite: 'Decisão final', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 90, potencialSucesso: 85, scoreSucesso: 88, ganchoReuniao: 'Pautar expansão de ROI na vertical de logística.' },
      { id: 'c2', nome: 'Carlos Mendes', cargo: 'Diretor de TI', area: 'Tecnologia', senioridade: 'Diretoria', papelComite: 'Validação técnica', forcaRelacional: 64, receptividade: 'Média', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Influenciador', 'Técnico', 'Champion'], liderId: 'c1', influencia: 82, potencialSucesso: 76, scoreSucesso: 74, ganchoReuniao: 'Validar stack de observabilidade operacional.' },
      { id: 'c3', nome: 'Aline Prado', cargo: 'Gerente de Controladoria', area: 'Finanças', senioridade: 'Gerência', papelComite: 'Análise orçamentária', forcaRelacional: 41, receptividade: 'Baixa', acessibilidade: 'Baixa', status: 'A desenvolver', classificacao: ['Blocker', 'Negócio'], liderId: 'c1', influencia: 68, potencialSucesso: 48, scoreSucesso: 42, ganchoReuniao: 'Apresentar business case de redução de churn.' }
    ],
    oportunidades: [
      { id: 'o1', nome: 'Renovação multi-unidade 2026', etapa: 'Proposta', valor: 2200000, owner: 'Mariana Costa', risco: 'Médio', probabilidade: 68, historico: ['Diagnóstico concluído', 'Escopo validado com operações'] },
      { id: 'o2', nome: 'Expansão módulo preditivo', etapa: 'Qualificação', valor: 1000000, owner: 'Leandro Silva', risco: 'Baixo', probabilidade: 52, historico: ['Hipótese levantada em reunião executiva'] }
    ],
    canaisCampanhas: {
      origemPrincipal: 'Outbound executivo',
      influencias: [
        { canal: 'Outbound', campanha: 'Executivo Energia Q1', tipo: 'Outbound', impacto: 'Abertura de reunião com VP', data: '2026-01-10' },
        { canal: 'CRM', campanha: 'Nutrição de caso de uso operacional', tipo: 'CRM', impacto: 'Aumento de engajamento técnico', data: '2026-02-14' }
      ]
    },
    abm: {
      motivo: 'Conta com alto fit ICP e janela de expansão ativa.',
      fit: 'Alto fit com operações distribuídas e alta complexidade.',
      cluster: 'Energia Enterprise - Cluster A',
      similaridade: '88% com contas expandidas em 12 meses.',
      coberturaInicialComite: '63% com lacuna em finanças.',
      playsEntrada: ['Play de prova de valor por unidade', 'Play de champion técnico'],
      potencialAbertura: 'Elevado para frente de analytics operacional.',
      hipoteses: ['Avanço via área de operações destrava compra corporativa.'],
      contasSimilares: ['Ultra Grid', 'Voltix Energia']
    },
    abx: {
      motivo: 'Conta em jornada ativa de continuidade e expansão.',
      evolucaoJornada: 'Do piloto para expansão multi-unidade em 8 meses.',
      maturidadeRelacional: 'Média-alta com gaps financeiros.',
      sponsorAtivo: 'Sponsor presente, porém com disponibilidade limitada.',
      profundidadeComite: 'Moderada com concentração em operações.',
      continuidade: 'Renovação depende de reforço financeiro.',
      expansao: 'Potencial alto em analytics preditivo.',
      retencao: 'Boa adoção do módulo atual.',
      riscoEstagnacao: 'Médio por falta de sponsor alternativo.'
    },
    inteligencia: {
      sucessos: ['Abertura executiva via outbound consultivo.', 'Champion técnico impulsionou aprovação inicial.'],
      insucessos: ['Tentativa de negociação sem área financeira não avançou.'],
      padroes: ['Decisão acelera quando operações + finanças entram cedo.'],
      learnings: ['Reforçar prova de ROI para controladoria.'],
      hipoteses: ['Workshop financeiro pode elevar probabilidade em 12 p.p.'],
      fatoresRecomendacao: ['Cobertura relacional parcial', 'Risco de dependência de sponsor único']
    },
    tecnografia: ['Salesforce CRM', 'AWS Cloud', 'SAP S/4HANA', 'Tableau', 'ServiceNow'],
    historico: [
      { data: '2026-03-29', tipo: 'Sinal', descricao: 'Mudança no comitê de compras detectada.', icone: 'AlertTriangle' },
      { data: '2026-03-26', tipo: 'Ação', descricao: 'Reunião com sponsor adiada.', icone: 'Clock' },
      { data: '2026-03-20', tipo: 'Oportunidade', descricao: 'Proposta de renovação enviada.', icone: 'TrendingUp' }
    ]
  },
  {
    id: '2', slug: 'finaxis-tech', nome: 'Finaxis Tech', dominio: 'finaxis.io', vertical: 'Finanças', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'Curitiba, Brasil',
    ownerPrincipal: 'Rafael Prado', ownersSecundarios: ['Lia Azevedo'], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 86, risco: 22, prontidao: 71, coberturaRelacional: 48,
    ultimaMovimentacao: '2026-03-27', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 82, crm: 68, vp: 74, ct: 52, ft: 78, budgetBrl: 550000, oportunidadePrincipal: 'Primeiro contrato plataforma ops', possuiOportunidade: true,
    proximaMelhorAcao: 'Ativar campanha ABM focada em eficiência operacional do backoffice.', resumoExecutivo: 'Conta com fit relevante e sinais de interesse, ainda em fase inicial de relacionamento.',
    leituraFactual: ['2 reuniões de descoberta realizadas.', 'Champion técnico identificado.'], leituraInferida: ['Jornada deve acelerar com prova de caso no segmento financeiro.'], leituraSugerida: ['Executar play ABM de entrada com conteúdo por persona.'],
    sinais: [{ id:'s3', titulo:'Acesso recorrente ao case financeiro', tipo:'Tendência', impacto:'Médio', owner:'Rafael Prado', recomendacao:'Priorizar contato com diretoria de operações.', contexto:'3 acessos em 5 dias no material de caso.', data:'2026-03-25' }],
    acoes: [{ id:'a4', titulo:'Agendar reunião com diretoria de operações', status:'Em andamento', owner:'Rafael Prado', prioridade:'Alta', prazo:'2026-04-04' }],
    contatos: [{ id:'c4', nome:'Gustavo Rocha', cargo:'Head de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Patrocinador da mudança', forcaRelacional:58, receptividade:'Alta', acessibilidade:'Média', status:'Ativa', classificacao:['Sponsor','Negócio'], influencia:79, potencialSucesso:74, scoreSucesso: 70 }],
    oportunidades: [{ id:'o3', nome:'Primeiro contrato plataforma ops', etapa:'Qualificação', valor:550000, owner:'Rafael Prado', risco:'Baixo', probabilidade:44, historico:['Descoberta inicial concluída'] }],
    canaisCampanhas: { origemPrincipal:'Inbound orgânico', influencias:[{ canal:'Inbound', campanha:'SEO - Eficiência financeira', tipo:'Inbound', impacto:'Entrada da conta na base', data:'2026-02-05' }] },
    abm: { motivo:'Conta alvo prioritária para expansão em fintechs.', fit:'Fit alto por maturidade digital e dor operacional.', cluster:'Fintech crescimento - Cluster B', similaridade:'81% com wins recentes.', coberturaInicialComite:'48% com lacuna em TI.', playsEntrada:['Play de valor por persona','Play técnico-funcional'], potencialAbertura:'Alto para frente de observabilidade operacional.', hipoteses:['Conteúdo técnico acelera validação interna.'], contasSimilares:['BrixPay','NexaBank'] },
    abx: { motivo:'Ainda sem maturidade ABX.', evolucaoJornada:'Início de relacionamento.', maturidadeRelacional:'Baixa', sponsorAtivo:'Em formação', profundidadeComite:'Baixa', continuidade:'Não aplicável', expansao:'Mapeamento futuro', retencao:'Não aplicável', riscoEstagnacao:'Baixo no curto prazo' },
    inteligencia: { sucessos:['Entrada via conteúdo de caso real.'], insucessos:['Contato financeiro sem personalização teve baixa resposta.'], padroes:['Diretoria de operações responde melhor que compras no estágio inicial.'], learnings:['Mensagem técnica com impacto financeiro converte mais.'], hipoteses:['Workshop técnico eleva taxa de avanço para proposta.'], fatoresRecomendacao:['Fit ICP alto','Cobertura relacional baixa'] },
    tecnografia: ['HubSpot CRM', 'Azure Cloud'],
    historico:[{data:'2026-03-27', tipo:'Ação', descricao:'Reunião de descoberta registrada.', icone: 'Activity'}]
  },
  {
    id: '3', slug: 'logprime-supply', nome: 'LogPrime Supply', dominio: 'logprime.com', vertical: 'Logística', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Campinas, Brasil',
    ownerPrincipal: 'Daniel Moreira', ownersSecundarios: ['Ana Beatriz'], etapa: 'Renovação', tipoEstrategico: 'ABX', potencial: 74, risco: 79, prontidao: 58, coberturaRelacional: 39,
    ultimaMovimentacao: '2026-03-30', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Crítico', icp: 70, crm: 42, vp: 38, ct: 34, ft: 65, budgetBrl: 1800000, oportunidadePrincipal: 'Renovação anual plataforma core', possuiOportunidade: true,
    proximaMelhorAcao: 'Executar plano de recuperação com sponsor alternativo e revisão de valor percebido.', resumoExecutivo: 'Conta com risco elevado de estagnação e baixa cobertura relacional em áreas críticas.',
    leituraFactual: ['2 ações atrasadas.', 'Queda de uso em módulo de planejamento.', 'Renovação vence em 65 dias.'], leituraInferida: ['Sem reforço executivo, chance de churn parcial aumenta.'], leituraSugerida: ['Ativar play ABX de retenção e expansão assistida.'],
    sinais: [{ id:'s4', titulo:'Queda de uso do módulo core', tipo:'Alerta', impacto:'Alto', owner:'Daniel Moreira', recomendacao:'Entrar com squad de adoção em 7 dias.', contexto:'Uso semanal caiu 27% no último mês.', data:'2026-03-30' }],
    acoes: [{ id:'a5', titulo:'Plano de recuperação da renovação', status:'Atrasada', owner:'Daniel Moreira', prioridade:'Alta', prazo:'2026-03-25' }],
    contatos: [{ id:'c5', nome:'Patrícia Gomes', cargo:'Diretora de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Renovação', forcaRelacional:46, receptividade:'Média', acessibilidade:'Baixa', status:'Risco', classificacao:['Decisor','Negócio'], influencia:84, potencialSucesso:52, scoreSucesso: 45 }],
    oportunidades: [{ id:'o4', nome:'Renovação anual plataforma core', etapa:'Negociação', valor:1800000, owner:'Daniel Moreira', risco:'Alto', probabilidade:36, historico:['Escopo de renovação reduzido pelo cliente'] }],
    canaisCampanhas: { origemPrincipal:'CRM de base instalada', influencias:[{ canal:'CRM', campanha:'Adoção e valor Q1', tipo:'CRM', impacto:'Engajamento de usuários finais', data:'2026-01-18' }] },
    abm: { motivo:'Conta não priorizada para ABM no momento.', fit:'Fit médio.', cluster:'Logística base instalada', similaridade:'64% com contas em retenção.', coberturaInicialComite:'39%', playsEntrada:['Play de retomada executiva'], potencialAbertura:'Moderado', hipoteses:['Fortalecer sponsor secundário reduz risco de churn.'], contasSimilares:['CargoFlux'] },
    abx: { motivo:'Conta de base instalada em risco de renovação.', evolucaoJornada:'Piloto > adoção > risco de retração.', maturidadeRelacional:'Média-baixa', sponsorAtivo:'Ausente no último ciclo', profundidadeComite:'Baixa', continuidade:'Ameaçada', expansao:'Congelada', retencao:'Prioridade máxima', riscoEstagnacao:'Alto' },
    inteligencia: { sucessos:['Picos de adoção após treinamentos dirigidos.'], insucessos:['Sem sponsor ativo houve travamento de roadmap.'], padroes:['Contas com baixa cobertura financeira renovam com desconto agressivo.'], learnings:['Plano de valor contínuo precisa envolver diretoria.'], hipoteses:['Comitê quinzenal de valor reduz risco em 20 p.p.'], fatoresRecomendacao:['Risco elevado','Cobertura relacional baixa','Renovação próxima'] },
    tecnografia: ['Oracle ERP', 'Google Cloud'],
    historico:[{data:'2026-03-30', tipo:'Sinal', descricao:'Queda de uso detectada no módulo core.', icone: 'AlertCircle'}]
  },
  {
    id: '4', slug: 'alphabank-sa', nome: 'AlphaBank S.A.', dominio: 'alphabank.com.br', vertical: 'Financeiro', segmento: 'Enterprise', porte: 'Grande', localizacao: 'São Paulo, Brasil',
    ownerPrincipal: 'Beatriz Lima', ownersSecundarios: ['Rafael Prado'], etapa: 'Prospecção', tipoEstrategico: 'ABM', potencial: 88, risco: 15, prontidao: 82, coberturaRelacional: 74,
    ultimaMovimentacao: '2026-04-01', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 87, crm: 45, vp: 82, ct: 78, ft: 84, budgetBrl: 4200000, possuiOportunidade: false,
    proximaMelhorAcao: 'Apresentar diagnóstico de AI Readiness para diretoria executiva.', resumoExecutivo: 'Conta estratégica com alto fit e budget mapeado, aguardando validação de roadmap.',
    leituraFactual: ['Budget de R$ 4.2M identificado.', 'Alta atividade em materiais de IA.'], leituraInferida: ['Momento ideal para entrada com oferta de governança.'], leituraSugerida: ['Ativar play ABM de entrada consultiva.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'MQL Consultivo', influencias: [] },
    abm: { motivo: 'Fit ICP excelente.', fit: 'Alto', cluster: 'Financeiro Top', similaridade: '92%', coberturaInicialComite: '74%', playsEntrada: [], potencialAbertura: 'Altíssimo', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: []
  },
  {
    id: '5', slug: 'novasaude-global', nome: 'NovaSaude', dominio: 'novasaude.com', vertical: 'Saúde', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Rio de Janeiro, Brasil',
    ownerPrincipal: 'Lia Azevedo', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 74, risco: 28, prontidao: 70, coberturaRelacional: 55,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Média', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 72, crm: 80, vp: 68, ct: 55, ft: 70, budgetBrl: 1850000, possuiOportunidade: true,
    proximaMelhorAcao: 'Mapear decisores técnicos na filial sul.', resumoExecutivo: 'Conta com bom engajamento em marketing, mas com DMU ainda fragmentado.',
    leituraFactual: ['Engajamento CRM de 80%.', '1 oportunidade em qualificação.'], leituraInferida: ['Possibilidade de expansão via cross-sell precoce.'], leituraSugerida: ['Reforçar cobertura de contatos via LinkedIn.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Eventos', influencias: [] },
    abm: { motivo: 'Vertical prioritária.', fit: 'Médio-alto', cluster: 'Healthcare Enterprise', similaridade: '78%', coberturaInicialComite: '55%', playsEntrada: [], potencialAbertura: 'Médio', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: []
  },
  {
    id: '6', slug: 'mobilitypro-sa', nome: 'MobilityPro', dominio: 'mobilitypro.com.br', vertical: 'Mobilidade', segmento: 'Mid-Market', porte: 'Médio', localizacao: 'Belo Horizonte, Brasil',
    ownerPrincipal: 'Marcos Oliveira', ownersSecundarios: [], etapa: 'Descoberta', tipoEstrategico: 'ABM', potencial: 50, risco: 40, prontidao: 48, coberturaRelacional: 40,
    ultimaMovimentacao: '2026-03-25', atividadeRecente: 'Baixa', playAtivo: 'Nenhum', statusGeral: 'Atenção', icp: 45, crm: 35, vp: 60, ct: 40, ft: 48, budgetBrl: 600000, possuiOportunidade: false,
    proximaMelhorAcao: 'Iniciar sequência de reativação.', resumoExecutivo: 'Conta fria com histórico de interesse em 2025, precisando de nova abordagem.',
    leituraFactual: ['Atividade recente baixa.', 'Sem oportunidade aberta.'], leituraInferida: ['Risco de perda de timing comercial.'], leituraSugerida: ['Lançar play de reengajamento.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Inbound Antigo', influencias: [] },
    abm: { motivo: 'Potencial de vertical alto.', fit: 'Baixo-médio', cluster: 'Mobilidade Mid', similaridade: '45%', coberturaInicialComite: '40%', playsEntrada: [], potencialAbertura: 'Baixo', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: []
  },
  {
    id: '7', slug: 'agrocloud-sa', nome: 'AgroCloud', dominio: 'agrocloud.com', vertical: 'Agronegócio', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Goiânia, Brasil',
    ownerPrincipal: 'Ricardo Santos', ownersSecundarios: [], etapa: 'Qualificação', tipoEstrategico: 'ABM', potencial: 65, risco: 20, prontidao: 60, coberturaRelacional: 30,
    ultimaMovimentacao: '2026-04-02', atividadeRecente: 'Alta', playAtivo: 'ABM', statusGeral: 'Saudável', icp: 78, crm: 70, vp: 85, ct: 30, ft: 60, budgetBrl: 2100000, possuiOportunidade: false,
    proximaMelhorAcao: 'Identificar champion na área de tecnologia agrícola.', resumoExecutivo: 'Conta em vertical de alta tração com sinais fortes de expansão de budget tech.',
    leituraFactual: ['Vertical Potencial de 85%.', 'Baixa cobertura de contatos (30%).'], leituraInferida: ['Grande GAP de mapeamento, mas alto interesse técnico.'], leituraSugerida: ['Executar play de mapeamento de DMU.'],
    sinais: [], acoes: [], contatos: [], oportunidades: [],
    canaisCampanhas: { origemPrincipal: 'Field Marketing', influencias: [] },
    abm: { motivo: 'Liderança em vertical Agro.', fit: 'Médio', cluster: 'Agro Global', similaridade: '65%', coberturaInicialComite: '30%', playsEntrada: [], potencialAbertura: 'Médio-alto', hipoteses: [], contasSimilares: [] },
    abx: { motivo: '', evolucaoJornada: '', maturidadeRelacional: '', sponsorAtivo: '', profundidadeComite: '', continuidade: '', expansao: '', retencao: '', riscoEstagnacao: '' },
    inteligencia: { sucessos: [], insucessos: [], padroes: [], learnings: [], hipoteses: [], fatoresRecomendacao: [] },
    tecnografia: [],
    historico: []
  }
];

export const contaPorSlug = (slug: string) => contasMock.find((conta) => conta.slug === slug);
