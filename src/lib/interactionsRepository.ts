import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type Interaction } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Interações — Camada de Leitura Supabase com Fallback
 */

export type InteractionRow = {
  id: string;
  account_id: string;
  campaign_id?: string;
  interaction_type: Interaction['interactionType'];
  timestamp: string;
  date: string;
  channel: string;
  direction: 'inbound' | 'outbound';
  initiator: 'conta' | 'empresa';
  description: string;
  relevance: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  owner?: string;
  follow_up_required: boolean;
  next_step?: string;
  source: string;
  confidence: number;
};

/**
 * Mapeia uma linha do Supabase (snake_case) para o tipo do Domínio (camelCase)
 */
function mapInteractionRowToDomain(row: InteractionRow): Interaction {
  return {
    id: row.id,
    accountId: row.account_id,
    campaignId: row.campaign_id,
    interactionType: row.interaction_type,
    timestamp: row.timestamp,
    date: row.date,
    channel: row.channel,
    direction: row.direction,
    initiator: row.initiator,
    description: row.description,
    relevance: row.relevance,
    sentiment: row.sentiment,
    owner: row.owner,
    followUpRequired: row.follow_up_required,
    nextStep: row.next_step,
    source: row.source,
    confidence: row.confidence,
  };
}

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

    return (data as InteractionRow[]).map(mapInteractionRowToDomain);
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
  // Agora filtra sobre o campo accountId (camelCase) já mapeado
  return allInteractions.filter(i => i.accountId === accountId);
}
