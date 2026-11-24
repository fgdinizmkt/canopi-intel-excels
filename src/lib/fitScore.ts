/**
 * Scorecard ABE por conta. Motor de DUAS CAMADAS.
 *
 * Decisao de negocio (Fabio, 23/11/2026). O motor antigo (scoringRepository)
 * botava completude de cadastro dentro da nota de prioridade (confianca 15%),
 * que e exatamente o defeito que a planilha tirou de proposito: preencher
 * campo subia a pontuacao, e conta vazia de ouro perdia para conta cheia de
 * lixo. Aqui as duas coisas ficam SEPARADAS:
 *
 *   CAMADA 1 · NOTA DE FIT (prioridade). Quem perseguir. Herda a regua
 *   validada da planilha (Acesso 30, Capital em Risco 25, Friccao 20,
 *   Gatilho 15, Relacionamento 10), pesos intactos. Setor entra como ICP
 *   (gate + aderencia), nunca como peso abstrato. Completude NAO entra aqui.
 *
 *   CAMADA 2 · SAUDE DO DADO. Nao infla a nota de fit. Mede completude
 *   campo a campo, REBAIXA a confianca da nota exibida (fit alto em dado
 *   ralo = baixa confianca, essa e a penalizacao) e gera a lista de lacunas
 *   para enriquecer e fazer o writeback no CRM.
 *
 * A nota EXIBIDA e a nota de fit multiplicada pelo fator de confianca. O
 * farol le a nota exibida.
 */

import { Conta } from '../data/accountsData';
import { ICPProfile, computeSectorFit, passaGateICP } from './icp';

/* ===================  CAMADA 1: NOTA DE FIT  =================== */

export interface Pilar {
  nome: string;
  score: number; // 0-100
  peso: number; // fracao (soma 1.0)
  rationale: string;
}

export type RotaAbordagem = '1-to-1' | 'abrir porta' | 'programático' | 'topo de funil';

export interface NotaFit {
  accountId: string;
  icpId: string | null;
  icpNome: string | null;
  sectorFit: number; // aderencia ao ICP ativo (0-100)
  dentroDoICP: boolean; // passou o gate de setor
  pilares: Pilar[];
  nota: number; // media ponderada dos pilares (0-100), antes da confianca
  rota: RotaAbordagem;
}

// Pesos herdados da regua validada da planilha. NAO mexer sem recalibrar.
const PESOS = {
  acesso: 0.3,
  capital: 0.25,
  friccao: 0.2,
  gatilho: 0.15,
  relacionamento: 0.1,
} as const;

/** Pilar 1 · Acesso a Decisao. Forca do comite mapeado vs meta de cadeiras. */
function pilarAcessoADecisao(account: Conta): Pilar {
  const contatos = account.contatos || [];
  const PESO_SENIORIDADE: Record<string, number> = {
    'C-Level': 100,
    Diretoria: 85,
    'Gerência': 60,
    Especialista: 40,
  };
  // Soma ponderada: peso da cadeira x forca do vinculo (0-100 para 0-1)
  let somaPonderada = 0;
  for (const c of contatos) {
    const pesoCadeira = PESO_SENIORIDADE[c.senioridade] || 40;
    const ehDecisor = (c.classificacao || []).some(
      (x) => x === 'Decisor' || x === 'Sponsor' || x === 'Champion',
    );
    const bonusPapel = ehDecisor ? 1.2 : 1;
    somaPonderada += pesoCadeira * ((c.forcaRelacional || 0) / 100) * bonusPapel;
  }
  // Meta: 5 cadeiras C-Level fortes = teto de referencia
  const metaReferencia = 5 * 100;
  const score = Math.max(0, Math.min(100, Math.round((somaPonderada / metaReferencia) * 100)));
  return {
    nome: 'Acesso à Decisão',
    score,
    peso: PESOS.acesso,
    rationale: `${contatos.length} contatos mapeados; força ponderada por senioridade e papel no comitê.`,
  };
}

/** Pilar 2 · Capital em Risco. Dinheiro em jogo: budget + valor de oportunidades. */
function pilarCapitalEmRisco(account: Conta): Pilar {
  const budget = account.budgetBrl || 0;
  const valorOpps = (account.oportunidades || []).reduce((s, o) => s + (o.valor || 0), 0);
  const total = budget + valorOpps;
  // Faixas (BRL): 1M+ = teto. Escala por patamar, nao linear ingenua.
  let score: number;
  if (total >= 1_000_000) score = 100;
  else if (total >= 500_000) score = 85;
  else if (total >= 200_000) score = 70;
  else if (total >= 80_000) score = 50;
  else if (total > 0) score = 30;
  else score = Math.max(0, Math.min(100, account.potencial || 0)); // fallback: potencial estimado
  return {
    nome: 'Capital em Risco',
    score,
    peso: PESOS.capital,
    rationale: `Capital em jogo R$ ${(total / 1000).toFixed(0)}k (budget + oportunidades).`,
  };
}

/** Pilar 3 · Evidencia de Friccao. Provas de que a conta tem a dor que resolvemos. */
function pilarEvidenciaDeFriccao(account: Conta): Pilar {
  const sinais = account.sinais || [];
  const altos = sinais.filter((s) => s.impacto === 'Alto').length;
  const medios = sinais.filter((s) => s.impacto === 'Médio').length;
  let score = altos * 25 + medios * 12;
  if (account.statusGeral === 'Crítico') score += 20;
  else if (account.statusGeral === 'Atenção') score += 10;
  score = Math.max(0, Math.min(100, score));
  return {
    nome: 'Evidência de Fricção',
    score,
    peso: PESOS.friccao,
    rationale: `${altos} sinais de alto impacto, ${medios} de médio; status ${account.statusGeral}.`,
  };
}

/** Pilar 4 · Gatilho. Evento recente que abre janela. */
function pilarGatilho(account: Conta): Pilar {
  const sinais = account.sinais || [];
  const gatilhos = sinais.filter((s) => s.tipo === 'Mudança' || s.tipo === 'Alerta').length;
  let score = gatilhos * 30;
  if (account.atividadeRecente === 'Alta') score += 30;
  else if (account.atividadeRecente === 'Média') score += 15;
  score = Math.max(0, Math.min(100, score));
  return {
    nome: 'Gatilho',
    score,
    peso: PESOS.gatilho,
    rationale: `${gatilhos} sinais de mudanca/alerta; atividade recente ${account.atividadeRecente}.`,
  };
}

/** Pilar 5 · Relacionamento. Vinculo existente, historico e se ja comprou. */
function pilarRelacionamento(account: Conta): Pilar {
  const contatos = account.contatos || [];
  const forcaMedia = contatos.length
    ? contatos.reduce((s, c) => s + (c.forcaRelacional || 0), 0) / contatos.length
    : 0;
  let score = Math.round(forcaMedia); // 0-100
  if (account.possuiOportunidade) score += 15; // ja ha negocio em jogo
  if ((account.historico?.length || 0) > 0) score += 10;
  score = Math.max(0, Math.min(100, score));
  return {
    nome: 'Relacionamento',
    score,
    peso: PESOS.relacionamento,
    rationale: `Forca relacional media ${Math.round(forcaMedia)}; ${
      account.possuiOportunidade ? 'com' : 'sem'
    } oportunidade ativa.`,
  };
}

/** Rota de abordagem: cruza a nota com o acesso ao comite (como na planilha). */
function derivarRota(nota: number, acesso: number): RotaAbordagem {
  if (nota >= 70 && acesso >= 60) return '1-to-1';
  if (nota >= 70 && acesso < 60) return 'abrir porta';
  if (nota >= 45) return 'programático';
  return 'topo de funil';
}

/**
 * Calcula a Nota de Fit de uma conta contra um ICP.
 * Se a conta nao passa o gate de setor do ICP, dentroDoICP = false e a nota
 * reflete so os pilares (ainda calculada, para visibilidade, mas fora do
 * ranking daquele ICP).
 */
export function computeNotaFit(account: Conta, icp: ICPProfile | null): NotaFit {
  const pilares = [
    pilarAcessoADecisao(account),
    pilarCapitalEmRisco(account),
    pilarEvidenciaDeFriccao(account),
    pilarGatilho(account),
    pilarRelacionamento(account),
  ];
  const nota = Math.round(pilares.reduce((s, p) => s + p.score * p.peso, 0));
  const acesso = pilares[0].score;
  const sectorFit = icp ? computeSectorFit(account, icp) : 50;
  const dentroDoICP = icp ? passaGateICP(account, icp) : true;

  return {
    accountId: account.id,
    icpId: icp?.id ?? null,
    icpNome: icp?.nome ?? null,
    sectorFit,
    dentroDoICP,
    pilares,
    nota,
    rota: derivarRota(nota, acesso),
  };
}

/* ===================  CAMADA 2: SAUDE DO DADO  =================== */

export interface LacunaDado {
  campo: string;
  estado: 'preenchido' | 'vazio' | 'obrigatorio_faltando';
  /** O que fazer: enriquecer (buscar), writeback (devolver ao CRM) ou nada. */
  acao: 'nenhuma' | 'enriquecer' | 'writeback';
}

export interface SaudeDado {
  accountId: string;
  completude: number; // 0-100
  /** Multiplica a nota de fit para gerar a nota exibida (penalizacao). */
  fatorConfianca: number; // 0.4 a 1.0
  lacunas: LacunaDado[];
}

/**
 * Mede a saude do cadastro da conta. Campos-base sempre avaliados; campos
 * exigidos pelo ICP ativo viram 'obrigatorio_faltando' quando vazios.
 */
export function computeSaudeDado(account: Conta, icp: ICPProfile | null): SaudeDado {
  const camposBase: { campo: string; valor: unknown }[] = [
    { campo: 'dominio', valor: account.dominio },
    { campo: 'vertical', valor: account.vertical },
    { campo: 'segmento', valor: account.segmento },
    { campo: 'porte', valor: account.porte },
    { campo: 'localizacao', valor: account.localizacao },
    { campo: 'contatos', valor: (account.contatos?.length || 0) > 0 ? 'ok' : '' },
    { campo: 'sinais', valor: (account.sinais?.length || 0) > 0 ? 'ok' : '' },
    { campo: 'oportunidades', valor: account.possuiOportunidade ? 'ok' : '' },
  ];

  const vazio = (v: unknown) => v === undefined || v === null || String(v).trim() === '';

  const lacunas: LacunaDado[] = camposBase.map(({ campo, valor }) => {
    if (!vazio(valor)) return { campo, estado: 'preenchido', acao: 'nenhuma' };
    // Vazio: e exigido pelo ICP ativo?
    const exigidoPeloICP =
      !!icp &&
      ((campo === 'vertical' && icp.setoresAlvo.length > 0) ||
        (campo === 'segmento' && icp.setoresAlvo.length > 0) ||
        (campo === 'porte' && icp.portesAlvo.length > 0) ||
        (campo === 'contatos' && icp.cargosComite.length > 0));
    return {
      campo,
      estado: exigidoPeloICP ? 'obrigatorio_faltando' : 'vazio',
      acao: 'enriquecer',
    };
  });

  const preenchidos = lacunas.filter((l) => l.estado === 'preenchido').length;
  const completude = Math.round((preenchidos / lacunas.length) * 100);
  // Penalizacao: dado ralo rebaixa a confianca da nota exibida (0.4 a 1.0).
  const fatorConfianca = Number((0.4 + 0.6 * (completude / 100)).toFixed(3));

  return { accountId: account.id, completude, fatorConfianca, lacunas };
}

/* ===================  SCORECARD + FAROL  =================== */

export type BandaFarol = 'critico' | 'frio' | 'morno' | 'quente' | 'pronto';

export interface Scorecard {
  accountId: string;
  fit: NotaFit;
  saude: SaudeDado;
  /** Nota de fit x fator de confianca. E o que o ranking e o farol usam. */
  notaExibida: number;
  farol: BandaFarol;
}

/** Cinco bandas por luminosidade, da planilha (grafite para ciano). */
function bandaFarol(nota: number): BandaFarol {
  if (nota >= 80) return 'pronto';
  if (nota >= 60) return 'quente';
  if (nota >= 40) return 'morno';
  if (nota >= 20) return 'frio';
  return 'critico';
}

/** Monta o scorecard completo de uma conta contra um ICP. */
export function computeScorecard(account: Conta, icp: ICPProfile | null): Scorecard {
  const fit = computeNotaFit(account, icp);
  const saude = computeSaudeDado(account, icp);
  const notaExibida = Math.round(fit.nota * saude.fatorConfianca);
  return {
    accountId: account.id,
    fit,
    saude,
    notaExibida,
    farol: bandaFarol(notaExibida),
  };
}
