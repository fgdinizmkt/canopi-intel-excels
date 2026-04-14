import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type PlayRecommendation } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Recomendações de Play — Camada de Leitura Supabase com Fallback
 */

export type PlayRecommendationRow = PlayRecommendation;

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

    return data as PlayRecommendationRow[];
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
  return allRecs.filter(r => r.accountId === accountId);
}
