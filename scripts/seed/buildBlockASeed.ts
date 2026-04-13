import { contasMock, initialActions } from '../../src/data/accountsData';
import CENARIO_PARCIAL from './scenarios/parcial';

export type AccountSeedRow = {
  id: string;
  slug: string;
  nome: string;
  dominio: string;
  vertical: string;
  segmento: string;
  porte: string;
  localizacao: string;
  ownerPrincipal: string;
  etapa: string;
  tipoEstrategico: string;
  potencial: number;
  risco: number;
  prontidao: number;
  coberturaRelacional: number;
  ultimaMovimentacao: string;
  atividadeRecente: string;
  playAtivo: string;
  statusGeral: string;
  oportunidadePrincipal?: string;
  possuiOportunidade: boolean;
  proximaMelhorAcao: string;
  resumoExecutivo: string;
  inteligencia: unknown;
  leituraFactual: string[];
  leituraInferida: string[];
  leituraSugerida: string[];
  historico: unknown[];
  tecnografia: string[];
  canaisCampanhas: unknown;
};

export type ContaSeedRow = {
  id: string;
  slug: string;
  nome: string;
  icp: number;
  crm: number;
  vp: number;
  ct: number;
  ft: number;
  abm: unknown;
  abx: unknown;
};

export type ContactSeedRow = {
  id: string;
  nome: string;
  cargo?: string;
  area?: string;
  senioridade?: string;
  papelComite?: string;
  forcaRelacional: number;
  receptividade?: string;
  acessibilidade?: string;
  status?: string;
  classificacao: string[];
  influencia: number;
  potencialSucesso?: number;
  scoreSucesso?: number;
  ganchoReuniao?: string;
  liderId?: string;
  owner?: string;
  observacoes?: string;
  historicoInteracoes?: string;
  proximaAcao?: string;
  accountId: string;
  accountName: string;
};

export type SignalSeedRow = {
  id: string;
  severity: string;
  type: string;
  category: string;
  archived: boolean;
  resolved: boolean;
  title: string;
  description: string;
  timestamp: string;
  account: string;
  accountId: string;
  owner: string;
  confidence: number;
  channel: string;
  source: string;
  context: string;
  probableCause: string;
  impact: string;
  recommendation: string;
};

export type OpportunitySeedRow = {
  id: string;
  account_slug: string;
  nome: string;
  etapa: string;
  valor: number;
  owner: string;
  risco: 'Alto' | 'Médio' | 'Baixo';
  probabilidade: number;
  historico: string[];
};

export interface BlockASeed {
  scenario: string;
  generatedAt: string;
  tables: {
    accounts: AccountSeedRow[];
    contas: ContaSeedRow[];
    contacts: ContactSeedRow[];
    signals: SignalSeedRow[];
    actions: typeof initialActions;
    oportunidades: OpportunitySeedRow[];
  };
  summary: {
    accounts: number;
    contas: number;
    contacts: number;
    signals: number;
    actions: number;
    oportunidades: number;
  };
}

function mapSignalSeverity(input: string): string {
  if (input === 'Alto') return 'critical';
  if (input === 'Médio') return 'warning';
  return 'info';
}

function inferSignalCategory(tipo: string): string {
  if (tipo === 'Mudança') return 'Mudança de conta';
  if (tipo === 'Alerta') return 'Risco operacional';
  return 'Tendência';
}

function inferChannel(origemPrincipal?: string): string {
  if (!origemPrincipal) return 'Ops';
  return origemPrincipal;
}

function buildAccounts(): AccountSeedRow[] {
  return contasMock.map((conta) => ({
    id: conta.id,
    slug: conta.slug,
    nome: conta.nome,
    dominio: conta.dominio,
    vertical: conta.vertical,
    segmento: conta.segmento,
    porte: conta.porte,
    localizacao: conta.localizacao,
    ownerPrincipal: conta.ownerPrincipal,
    etapa: conta.etapa,
    tipoEstrategico: conta.tipoEstrategico,
    potencial: conta.potencial,
    risco: conta.risco,
    prontidao: conta.prontidao,
    coberturaRelacional: conta.coberturaRelacional,
    ultimaMovimentacao: conta.ultimaMovimentacao,
    atividadeRecente: conta.atividadeRecente,
    playAtivo: conta.playAtivo,
    statusGeral: conta.statusGeral,
    oportunidadePrincipal: conta.oportunidadePrincipal,
    possuiOportunidade: conta.possuiOportunidade,
    proximaMelhorAcao: conta.proximaMelhorAcao,
    resumoExecutivo: conta.resumoExecutivo,
    inteligencia: conta.inteligencia,
    leituraFactual: conta.leituraFactual,
    leituraInferida: conta.leituraInferida,
    leituraSugerida: conta.leituraSugerida,
    historico: conta.historico,
    tecnografia: conta.tecnografia,
    canaisCampanhas: conta.canaisCampanhas,
  }));
}

function buildContas(): ContaSeedRow[] {
  return contasMock.map((conta) => ({
    id: conta.id,
    slug: conta.slug,
    nome: conta.nome,
    icp: conta.icp,
    crm: conta.crm,
    vp: conta.vp,
    ct: conta.ct,
    ft: conta.ft,
    abm: conta.abm,
    abx: conta.abx,
  }));
}

function buildContacts(): ContactSeedRow[] {
  return contasMock.flatMap((conta) =>
    conta.contatos.map((contact) => ({
      id: contact.id,
      nome: contact.nome,
      cargo: contact.cargo,
      area: contact.area,
      senioridade: contact.senioridade,
      papelComite: contact.papelComite,
      forcaRelacional: contact.forcaRelacional,
      receptividade: contact.receptividade,
      acessibilidade: contact.acessibilidade,
      status: contact.status,
      classificacao: contact.classificacao,
      influencia: contact.influencia,
      potencialSucesso: contact.potencialSucesso,
      scoreSucesso: contact.scoreSucesso,
      ganchoReuniao: contact.ganchoReuniao,
      liderId: contact.liderId,
      owner: contact.owner,
      observacoes: contact.observacoes,
      historicoInteracoes: contact.historicoInteracoes,
      proximaAcao: contact.proximaAcao,
      accountId: conta.id,
      accountName: conta.nome,
    })),
  );
}

function buildSignals(): SignalSeedRow[] {
  return contasMock.flatMap((conta) =>
    conta.sinais.map((signal) => ({
      id: signal.id,
      severity: mapSignalSeverity(signal.impacto),
      type: signal.tipo,
      category: inferSignalCategory(signal.tipo),
      archived: false,
      resolved: false,
      title: signal.titulo,
      description: signal.contexto,
      timestamp: signal.data,
      account: conta.nome,
      accountId: conta.id,
      owner: signal.owner,
      confidence: CENARIO_PARCIAL.signalConfidenceDefault,
      channel: inferChannel(conta.canaisCampanhas?.origemPrincipal),
      source: conta.canaisCampanhas?.origemPrincipal || 'Canopi Seed',
      context: signal.contexto,
      probableCause: '',
      impact: signal.impacto,
      recommendation: signal.recomendacao,
    })),
  );
}

function buildOportunidades(): OpportunitySeedRow[] {
  return contasMock.flatMap((conta) =>
    conta.oportunidades.map((opp) => ({
      id: opp.id,
      account_slug: conta.slug,
      nome: opp.nome,
      etapa: opp.etapa,
      valor: opp.valor,
      owner: opp.owner,
      risco: opp.risco,
      probabilidade: opp.probabilidade,
      historico: opp.historico,
    })),
  );
}

export function buildBlockASeed(): BlockASeed {
  const accounts = buildAccounts();
  const contas = buildContas();
  const contacts = buildContacts();
  const signals = buildSignals();
  const actions = [...initialActions];
  const oportunidades = buildOportunidades();

  return {
    scenario: CENARIO_PARCIAL.key,
    generatedAt: new Date().toISOString(),
    tables: {
      accounts,
      contas,
      contacts,
      signals,
      actions,
      oportunidades,
    },
    summary: {
      accounts: accounts.length,
      contas: contas.length,
      contacts: contacts.length,
      signals: signals.length,
      actions: actions.length,
      oportunidades: oportunidades.length,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seed = buildBlockASeed();
  console.log(JSON.stringify(seed.summary, null, 2));
}
