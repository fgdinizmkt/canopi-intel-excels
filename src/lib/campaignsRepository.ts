import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type Campaign } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Campanhas — Camada de Leitura Supabase com Fallback
 */

export type CampaignRow = Campaign;

/**
 * Busca todas as campanhas do Supabase com fallback para Seed
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const localSeed = buildBlockCSeed().campaigns;

  if (!isSupabaseConfigured()) {
    return localSeed;
  }

  try {
    const { data, error } = await supabase!
      .from('campaigns')
      .select('*');

    if (error) {
      console.warn('[Campaigns] Erro ao buscar do Supabase:', error.message);
      return localSeed;
    }

    if (!data || data.length === 0) {
      return localSeed;
    }

    // Merge/Map data
    return (data as CampaignRow[]).map(row => ({
      ...row,
      // Ensure local overrides mapping if needed, but here structure is identical
    }));
  } catch (err) {
    console.error('[Campaigns] Exceção ao buscar campanhas:', err);
    return localSeed;
  }
}

/**
 * Helper para buscar mapa de campanhas por ID
 */
export async function getCampaignsMap(): Promise<Record<string, Campaign>> {
  const campaigns = await getCampaigns();
  return campaigns.reduce((acc, campaign) => {
    acc[campaign.id] = campaign;
    return acc;
  }, {} as Record<string, Campaign>);
}
