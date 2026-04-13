/**
 * Scoring derivado e auditável de Conta
 *
 * Política:
 * - Sem persistência, sem schema novo, sem Supabase write
 * - Derivação factual em tempo de leitura
 * - Cada dimensão tem rationale explícito
 * - Baseado APENAS em dados já existentes no modelo Conta
 */

import { Conta } from '../data/accountsData';

export interface ScoreDimension {
  name: string;
  score: number; // 0-100
  rationale: string;
  signals: string[]; // valores fonte que informaram o cálculo
}

export interface ScoringResult {
  accountId: string;
  accountNome: string;
  potencial: ScoreDimension;
  risco: ScoreDimension;
  prontidao: ScoreDimension;
  cobertura: ScoreDimension;
  confianca: ScoreDimension;
  scoreTotal: number;
  prioridade: 'crítica' | 'alta' | 'média' | 'baixa';
  avisos: string[];
}

/**
 * Calcula score derivado de uma conta baseado em dados já existentes
 * Sem persistência, apenas derivação factual
 */
export function calculateAccountScore(account: Conta): ScoringResult {
  const potencial = calculatePotencial(account);
  const risco = calculateRisco(account);
  const prontidao = calculateProntidao(account);
  const cobertura = calculateCobertura(account);
  const confianca = calculateConfianca(account);

  // Weighted sum: potencial×0.25 + risco×0.25 + prontidao×0.20 + cobertura×0.15 + confianca×0.15
  const scoreTotal = Math.round(
    potencial.score * 0.25 +
    risco.score * 0.25 +
    prontidao.score * 0.2 +
    cobertura.score * 0.15 +
    confianca.score * 0.15
  );

  const prioridade = determinePrioridade(scoreTotal, risco.score, potencial.score);
  const avisos = generateAvisos(account, risco.score, potencial.score, cobertura.score);

  return {
    accountId: account.id,
    accountNome: account.nome,
    potencial,
    risco,
    prontidao,
    cobertura,
    confianca,
    scoreTotal,
    prioridade,
    avisos,
  };
}

/**
 * Dimensão 1: Potencial (0-100)
 * Derivado de account.potencial + oportunidades
 */
function calculatePotencial(account: Conta): ScoreDimension {
  const basePotencial = account.potencial || 0;
  const oportunidadeBonus = account.oportunidades?.length > 0 ? 10 : 0;
  const budgetBonus = (account.budgetBrl || 0) > 500000 ? 10 : 0;

  const score = Math.min(100, basePotencial + oportunidadeBonus + budgetBonus);
  const signals = [
    `Potencial base: ${basePotencial}`,
    `Oportunidades: ${account.oportunidades?.length || 0}`,
    `Budget: ${account.budgetBrl ? `R$ ${(account.budgetBrl / 1000000).toFixed(1)}M` : 'Não informado'}`
  ];

  return {
    name: 'Potencial',
    score,
    rationale: `Score ${score} baseado em potencial estimado (${basePotencial}) + bonus de oportunidades (${oportunidadeBonus}) + bonus de orçamento (${budgetBonus}).`,
    signals,
  };
}

/**
 * Dimensão 2: Risco (0-100, invertido)
 * Derivado de account.risco + statusGeral + sinais críticos
 */
function calculateRisco(account: Conta): ScoreDimension {
  let risco = account.risco || 0;

  // Penalidade por status geral
  if (account.statusGeral === 'Crítico') risco += 25;
  else if (account.statusGeral === 'Atenção') risco += 10;

  // Penalidade por sinais críticos (simples conta)
  const sinaisCriticos = account.sinais?.filter(s => s.impacto === 'Alto').length || 0;
  risco += sinaisCriticos * 15;

  // Penalidade por ações atrasadas
  const acoesAtrasadas = account.acoes?.filter(a => a.status === 'Atrasada').length || 0;
  risco += acoesAtrasadas * 10;

  // Capped em 100
  const riscoFinal = Math.min(100, risco);

  // Inverte para score (alto risco = baixo score)
  const score = 100 - riscoFinal;

  const signals = [
    `Risco base: ${account.risco}`,
    `Status: ${account.statusGeral}`,
    `Sinais críticos: ${sinaisCriticos}`,
    `Ações atrasadas: ${acoesAtrasadas}`,
  ];

  return {
    name: 'Risco',
    score,
    rationale: `Score ${score} derivado de risco estimado (${account.risco}) + penalidades (status, sinais críticos, ações atrasadas). Invertido: alto risco = baixo score.`,
    signals,
  };
}

/**
 * Dimensão 3: Prontidão (0-100)
 * Derivado de account.prontidao + atividade recente + conta no ativa
 */
function calculateProntidao(account: Conta): ScoreDimension {
  let prontidao = account.prontidao || 0;

  // Bonus por atividade recente
  if (account.atividadeRecente === 'Alta') prontidao += 15;
  else if (account.atividadeRecente === 'Média') prontidao += 5;

  // Bonus se tem tipo estratégico definido
  if (account.tipoEstrategico && account.tipoEstrategico !== 'Em andamento') prontidao += 10;

  const score = Math.min(100, prontidao);
  const signals = [
    `Prontidão base: ${account.prontidao}`,
    `Atividade recente: ${account.atividadeRecente}`,
    `Tipo estratégico: ${account.tipoEstrategico}`,
  ];

  return {
    name: 'Prontidão',
    score,
    rationale: `Score ${score} baseado em prontidão estimada (${account.prontidao}) + bonus de atividade recente e estratégia definida.`,
    signals,
  };
}

/**
 * Dimensão 4: Cobertura (0-100)
 * Derivado de coberturaRelacional + número de contatos + sinais por canal
 */
function calculateCobertura(account: Conta): ScoreDimension {
  let cobertura = account.coberturaRelacional || 0;

  // Bonus por contatos
  const contatosCount = account.contatos?.length || 0;
  if (contatosCount >= 5) cobertura += 20;
  else if (contatosCount >= 3) cobertura += 10;
  else if (contatosCount >= 1) cobertura += 5;

  // Bonus por sinais diversificados (proxy de cobertura de canais)
  const sinaisCount = account.sinais?.length || 0;
  if (sinaisCount >= 5) cobertura += 15;
  else if (sinaisCount >= 3) cobertura += 8;

  // Bonus por canais de campanhas
  const canaisCount = account.canaisCampanhas?.influencias?.length || 0;
  if (canaisCount >= 2) cobertura += 10;

  const score = Math.min(100, cobertura);
  const signals = [
    `Cobertura relacional: ${account.coberturaRelacional}`,
    `Contatos: ${contatosCount}`,
    `Sinais detectados: ${sinaisCount}`,
    `Canais em campanhas: ${canaisCount}`,
  ];

  return {
    name: 'Cobertura',
    score,
    rationale: `Score ${score} derivado de cobertura relacional (${account.coberturaRelacional}) + bonus de contatos mapeados (${contatosCount}), sinais (${sinaisCount}) e canais (${canaisCount}).`,
    signals,
  };
}

/**
 * Dimensão 5: Confiança (0-100)
 * Derivado da qualidade e volume de dados: se vêm de Supabase vs mock vs derived
 * Supabase = alta confiança, mock = média, derived = baixa
 */
function calculateConfianca(account: Conta): ScoreDimension {
  let confianca = 50; // Base de confiança média

  // Sinais de alta confiança
  if (account.inteligencia && Object.values(account.inteligencia).some(arr => arr?.length > 0)) confianca += 15;
  if (account.historico && account.historico.length > 0) confianca += 10;
  if (account.leituraFactual?.length > 0) confianca += 10;
  if (account.sinais && account.sinais.length > 0) confianca += 10;
  if (account.acoes && account.acoes.length > 0) confianca += 5;
  if (account.contatos && account.contatos.length > 0) confianca += 5;

  // Penalidade: dados incompletos
  const camposChave = [
    account.dominio,
    account.vertical,
    account.segmento,
    account.potencial,
    account.risco,
  ];
  const camposVazios = camposChave.filter(c => !c).length;
  confianca -= camposVazios * 8;

  const score = Math.max(0, Math.min(100, confianca));
  const signals = [
    `Inteligência consolidada: ${account.inteligencia ? 'Sim' : 'Não'}`,
    `Histórico operacional: ${account.historico?.length || 0} entradas`,
    `Leitura factual: ${account.leituraFactual?.length || 0} pontos`,
    `Sinais mapeados: ${account.sinais?.length || 0}`,
    `Campos obrigatórios: ${5 - camposVazios}/5 preenchidos`,
  ];

  return {
    name: 'Confiança',
    score,
    rationale: `Score ${score} baseado em volume e qualidade de dados (inteligência, histórico, leitura, sinais, campos). Penalizadas ausências críticas.`,
    signals,
  };
}

/**
 * Determina prioridade operacional
 */
function determinePrioridade(
  scoreTotal: number,
  riscoScore: number,
  potencialScore: number
): 'crítica' | 'alta' | 'média' | 'baixa' {
  if (riscoScore < 30 && potencialScore > 70) return 'crítica'; // Alto risco + alto potencial
  if (scoreTotal >= 75) return 'alta'; // Score geral alto
  if (scoreTotal >= 50) return 'média';
  return 'baixa';
}

/**
 * Gera avisos operacionais
 */
function generateAvisos(
  account: Conta,
  riscoScore: number,
  potencialScore: number,
  coberturaScore: number
): string[] {
  const avisos: string[] = [];

  if (riscoScore < 30) avisos.push('⚠️ Risco crítico detectado');
  if (potencialScore > 80) avisos.push('📈 Alto potencial de oportunidade');
  if (coberturaScore < 40) avisos.push('👥 Cobertura relacional baixa — expandir contatos');
  if (account.contatos && account.contatos.length === 0) avisos.push('❌ Sem contatos mapeados');
  if (account.oportunidades && account.oportunidades.length === 0 && potencialScore > 70) {
    avisos.push('🎯 Potencial alto mas sem oportunidades identificadas');
  }

  return avisos;
}
