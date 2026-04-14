import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type Interaction } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Interações — Camada de Leitura Supabase com Fallback
 */

export type InteractionRow = Interaction;

/**
 * Busca todas as interações do Supabase com fallback para Seed
 */
export async function getInteractions(): Promise<Interaction[]> {
  const localSeed = buildBlockCSeed().interactions;

  if (!isSupabaseConfigured()) {
    return localSeed;
  }

  try {
    const { data, error } = await supabase!
      .from('interactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('[Interactions] Erro ao buscar do Supabase:', error.message);
      return localSeed;
    }

    if (!data || data.length === 0) {
      return localSeed;
    }

    return data as InteractionRow[];
  } catch (err) {
    console.error('[Interactions] Exceção ao buscar interações:', err);
    return localSeed;
  }
}

/**
 * Busca interações de uma conta específica
 */
export async function getInteractionsByAccount(accountId: string): Promise<Interaction[]> {
  const allInteractions = await getInteractions();
  // If we are in Supabase mode, we could query filtered, 
  // but keeping it simple for now as per the defensive read pattern
  return allInteractions.filter(i => i.accountId === accountId);
}
