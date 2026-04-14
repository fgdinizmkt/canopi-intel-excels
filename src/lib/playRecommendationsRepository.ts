import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type PlayRecommendation } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Recomendações de Play — Camada de Leitura Supabase com Fallback
 */

export type PlayRecommendationRow = {
  id: string;
  account_id: string;
  play_id: string;
  play_name: string;
  play_type: PlayRecommendation['playType'];
  rationale: string;
  key_signals: string[];
  account_readiness: number;
  estimated_value: number;
  timeline_weeks: number;
  confidence_score: number;
  is_active: boolean;
  started_at?: string;
  success_probability: number;
  next_step_description: string;
  next_step_owner?: string;
  next_step_deadline?: string;
};

/**
 * Mapeia uma linha do Supabase (snake_case) para o tipo do Domínio (camelCase)
 */
function mapPlayRecommendationRowToDomain(row: PlayRecommendationRow): PlayRecommendation {
  return {
    id: row.id,
    accountId: row.account_id,
    playId: row.play_id,
    playName: row.play_name,
    playType: row.play_type,
    rationale: row.rationale,
    keySignals: row.key_signals,
    accountReadiness: row.account_readiness,
    estimatedValue: row.estimated_value,
    timelineWeeks: row.timeline_weeks,
    confidenceScore: row.confidence_score,
    isActive: row.is_active,
    startedAt: row.started_at,
    successProbability: row.success_probability,
    nextStepDescription: row.next_step_description,
    nextStepOwner: row.next_step_owner,
    nextStepDeadline: row.next_step_deadline,
  };
}

/**
 * Busca todas as recomendações do Supabase com fallback para Seed
 */
export async function getPlayRecommendations(): Promise<PlayRecommendation[]> {
  const localSeed = buildBlockCSeed().playRecommendations;

  if (!isSupabaseConfigured()) {
    return localSeed;
  }

  try {
    const { data, error } = await supabase!
      .from('play_recommendations')
      .select('*');

    if (error) {
      console.warn('[PlayRecs] Erro ao buscar do Supabase:', error.message);
      return localSeed;
    }

    if (!data || data.length === 0) {
      return localSeed;
    }

    return (data as PlayRecommendationRow[]).map(mapPlayRecommendationRowToDomain);
  } catch (err) {
    console.error('[PlayRecs] Exceção ao buscar recomendações:', err);
    return localSeed;
  }
}

/**
 * Busca recomendações de uma conta específica
 */
export async function getPlayRecommendationsByAccount(accountId: string): Promise<PlayRecommendation[]> {
  const allRecs = await getPlayRecommendations();
  // Agora filtra sobre o campo accountId (camelCase) já mapeado
  return allRecs.filter(r => r.accountId === accountId);
}
