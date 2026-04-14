import supabase, { isSupabaseConfigured } from './supabaseClient';
import { buildBlockCSeed, type Campaign } from '../../scripts/seed/buildBlockCSeed';

/**
 * Repositório de Campanhas — Camada de Leitura Supabase com Fallback
 */

export type CampaignRow = {
  id: string;
  name: string;
  type: Campaign['type'];
  channel: string;
  source: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  objective: string;
  target_audience?: string;
  accounts_reached: number;
  accounts_engaged: number;
  signals_generated: number;
  is_active: boolean;
  performance?: number;
};

/**
 * Mapeia uma linha do Supabase (snake_case) para o tipo do Domínio (camelCase)
 */
function mapCampaignRowToDomain(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    channel: row.channel,
    source: row.source,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    objective: row.objective,
    targetAudience: row.target_audience,
    accountsReached: row.accounts_reached,
    accountsEngaged: row.accounts_engaged,
    signalsGenerated: row.signals_generated,
    isActive: row.is_active,
    performance: row.performance,
  };
}

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

    return (data as CampaignRow[]).map(mapCampaignRowToDomain);
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
