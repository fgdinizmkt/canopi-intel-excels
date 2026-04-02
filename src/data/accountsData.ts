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
  historico: { data: string; tipo: string; descricao: string }[];
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
      { id: 'c1', nome: 'Roberta Lima', cargo: 'VP de Operações', area: 'Operações', senioridade: 'C-Level', papelComite: 'Decisão final', forcaRelacional: 72, receptividade: 'Alta', acessibilidade: 'Média', status: 'Ativa', classificacao: ['Decisor', 'Negócio'], influencia: 90, potencialSucesso: 85 },
      { id: 'c2', nome: 'Carlos Mendes', cargo: 'Diretor de TI', area: 'Tecnologia', senioridade: 'Diretoria', papelComite: 'Validação técnica', forcaRelacional: 64, receptividade: 'Média', acessibilidade: 'Alta', status: 'Ativa', classificacao: ['Influenciador', 'Técnico', 'Champion'], liderId: 'c1', influencia: 82, potencialSucesso: 76 },
      { id: 'c3', nome: 'Aline Prado', cargo: 'Gerente de Controladoria', area: 'Finanças', senioridade: 'Gerência', papelComite: 'Análise orçamentária', forcaRelacional: 41, receptividade: 'Baixa', acessibilidade: 'Baixa', status: 'A desenvolver', classificacao: ['Blocker', 'Negócio'], liderId: 'c1', influencia: 68, potencialSucesso: 48 }
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
    historico: [
      { data: '2026-03-29', tipo: 'Sinal', descricao: 'Mudança no comitê de compras detectada.' },
      { data: '2026-03-26', tipo: 'Ação', descricao: 'Reunião com sponsor adiada.' },
      { data: '2026-03-20', tipo: 'Oportunidade', descricao: 'Proposta de renovação enviada.' }
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
    contatos: [{ id:'c4', nome:'Gustavo Rocha', cargo:'Head de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Patrocinador da mudança', forcaRelacional:58, receptividade:'Alta', acessibilidade:'Média', status:'Ativa', classificacao:['Sponsor','Negócio'], influencia:79, potencialSucesso:74 }],
    oportunidades: [{ id:'o3', nome:'Primeiro contrato plataforma ops', etapa:'Qualificação', valor:550000, owner:'Rafael Prado', risco:'Baixo', probabilidade:44, historico:['Descoberta inicial concluída'] }],
    canaisCampanhas: { origemPrincipal:'Inbound orgânico', influencias:[{ canal:'Inbound', campanha:'SEO - Eficiência financeira', tipo:'Inbound', impacto:'Entrada da conta na base', data:'2026-02-05' }] },
    abm: { motivo:'Conta alvo prioritária para expansão em fintechs.', fit:'Fit alto por maturidade digital e dor operacional.', cluster:'Fintech crescimento - Cluster B', similaridade:'81% com wins recentes.', coberturaInicialComite:'48% com lacuna em TI.', playsEntrada:['Play de valor por persona','Play técnico-funcional'], potencialAbertura:'Alto para frente de observabilidade operacional.', hipoteses:['Conteúdo técnico acelera validação interna.'], contasSimilares:['BrixPay','NexaBank'] },
    abx: { motivo:'Ainda sem maturidade ABX.', evolucaoJornada:'Início de relacionamento.', maturidadeRelacional:'Baixa', sponsorAtivo:'Em formação', profundidadeComite:'Baixa', continuidade:'Não aplicável', expansao:'Mapeamento futuro', retencao:'Não aplicável', riscoEstagnacao:'Baixo no curto prazo' },
    inteligencia: { sucessos:['Entrada via conteúdo de caso real.'], insucessos:['Contato financeiro sem personalização teve baixa resposta.'], padroes:['Diretoria de operações responde melhor que compras no estágio inicial.'], learnings:['Mensagem técnica com impacto financeiro converte mais.'], hipoteses:['Workshop técnico eleva taxa de avanço para proposta.'], fatoresRecomendacao:['Fit ICP alto','Cobertura relacional baixa'] },
    historico:[{data:'2026-03-27', tipo:'Ação', descricao:'Reunião de descoberta registrada.'}]
  },
  {
    id: '3', slug: 'logprime-supply', nome: 'LogPrime Supply', dominio: 'logprime.com', vertical: 'Logística', segmento: 'Enterprise', porte: 'Grande', localizacao: 'Campinas, Brasil',
    ownerPrincipal: 'Daniel Moreira', ownersSecundarios: ['Ana Beatriz'], etapa: 'Renovação', tipoEstrategico: 'ABX', potencial: 74, risco: 79, prontidao: 58, coberturaRelacional: 39,
    ultimaMovimentacao: '2026-03-30', atividadeRecente: 'Alta', playAtivo: 'ABX', statusGeral: 'Crítico', icp: 70, crm: 42, vp: 38, ct: 34, ft: 65, budgetBrl: 1800000, oportunidadePrincipal: 'Renovação anual plataforma core', possuiOportunidade: true,
    proximaMelhorAcao: 'Executar plano de recuperação com sponsor alternativo e revisão de valor percebido.', resumoExecutivo: 'Conta com risco elevado de estagnação e baixa cobertura relacional em áreas críticas.',
    leituraFactual: ['2 ações atrasadas.', 'Queda de uso em módulo de planejamento.', 'Renovação vence em 65 dias.'], leituraInferida: ['Sem reforço executivo, chance de churn parcial aumenta.'], leituraSugerida: ['Ativar play ABX de retenção e expansão assistida.'],
    sinais: [{ id:'s4', titulo:'Queda de uso do módulo core', tipo:'Alerta', impacto:'Alto', owner:'Daniel Moreira', recomendacao:'Entrar com squad de adoção em 7 dias.', contexto:'Uso semanal caiu 27% no último mês.', data:'2026-03-30' }],
    acoes: [{ id:'a5', titulo:'Plano de recuperação da renovação', status:'Atrasada', owner:'Daniel Moreira', prioridade:'Alta', prazo:'2026-03-25' }],
    contatos: [{ id:'c5', nome:'Patrícia Gomes', cargo:'Diretora de Operações', area:'Operações', senioridade:'Diretoria', papelComite:'Renovação', forcaRelacional:46, receptividade:'Média', acessibilidade:'Baixa', status:'Risco', classificacao:['Decisor','Negócio'], influencia:84, potencialSucesso:52 }],
    oportunidades: [{ id:'o4', nome:'Renovação anual plataforma core', etapa:'Negociação', valor:1800000, owner:'Daniel Moreira', risco:'Alto', probabilidade:36, historico:['Escopo de renovação reduzido pelo cliente'] }],
    canaisCampanhas: { origemPrincipal:'CRM de base instalada', influencias:[{ canal:'CRM', campanha:'Adoção e valor Q1', tipo:'CRM', impacto:'Engajamento de usuários finais', data:'2026-01-18' }] },
    abm: { motivo:'Conta não priorizada para ABM no momento.', fit:'Fit médio.', cluster:'Logística base instalada', similaridade:'64% com contas em retenção.', coberturaInicialComite:'39%', playsEntrada:['Play de retomada executiva'], potencialAbertura:'Moderado', hipoteses:['Fortalecer sponsor secundário reduz risco de churn.'], contasSimilares:['CargoFlux'] },
    abx: { motivo:'Conta de base instalada em risco de renovação.', evolucaoJornada:'Piloto > adoção > risco de retração.', maturidadeRelacional:'Média-baixa', sponsorAtivo:'Ausente no último ciclo', profundidadeComite:'Baixa', continuidade:'Ameaçada', expansao:'Congelada', retencao:'Prioridade máxima', riscoEstagnacao:'Alto' },
    inteligencia: { sucessos:['Picos de adoção após treinamentos dirigidos.'], insucessos:['Sem sponsor ativo houve travamento de roadmap.'], padroes:['Contas com baixa cobertura financeira renovam com desconto agressivo.'], learnings:['Plano de valor contínuo precisa envolver diretoria.'], hipoteses:['Comitê quinzenal de valor reduz risco em 20 p.p.'], fatoresRecomendacao:['Risco elevado','Cobertura relacional baixa','Renovação próxima'] },
    historico:[{data:'2026-03-30', tipo:'Sinal', descricao:'Queda de uso detectada no módulo core.'}]
  }
];

export const contaPorSlug = (slug: string) => contasMock.find((conta) => conta.slug === slug);
