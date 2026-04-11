import supabase, { isSupabaseConfigured } from './supabaseClient';
import type { OportunidadeConta } from '../data/accountsData';

export interface OpportunityRow {
  id: string;
  account_slug: string;
  nome: string;
  etapa: string;
  valor: number;
  owner: string;
  risco: 'Alto' | 'Médio' | 'Baixo';
  probabilidade: number;
  historico: string[];
}

/**
 * Busca oportunides de modo read-only e agrupa por account_slug.
 * Retorna OportunidadeConta correspondendo ao tipo base da UI.
 */
export async function getOportunidadesMap(): Promise<Record<string, OportunidadeConta[]>> {
  if (!isSupabaseConfigured()) {
    console.debug('[Oportunidades] Supabase não configurado. Retornando fallback nulo.');
    return {};
  }

  try {
    const { data, error } = await supabase!
      .from('oportunidades')
      .select(`
        id,
        account_slug,
        nome,
        etapa,
        valor,
        owner,
        risco,
        probabilidade,
        historico
      `);

    if (error) {
      console.warn('[Oportunidades] Erro na query:', error.message);
      return {};
    }

    if (!data || data.length === 0) {
      console.info('[Oportunidades] Base vazia no Supabase.');
      return {};
    }

    const map: Record<string, OportunidadeConta[]> = {};
    for (const row of data as OpportunityRow[]) {
      if (!map[row.account_slug]) {
        map[row.account_slug] = [];
      }
      map[row.account_slug].push({
        id: row.id,
        nome: row.nome,
        etapa: row.etapa,
        valor: row.valor,
        owner: row.owner,
        risco: row.risco,
        probabilidade: row.probabilidade,
        historico: row.historico || [],
      });
    }

    console.info(`[Oportunidades] Sucesso. ${data.length} instâncias alocadas.`);
    return map;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Oportunidades] Exceção:', errorMsg);
    return {};
  }
}
