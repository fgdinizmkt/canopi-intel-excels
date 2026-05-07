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

/**
 * Escrita defensiva atômica de Oportunidades.
 * Somente fire-and-forget. Parcialmente atualiza a base.
 */
export async function persistOportunidade(id: string, etapa: string, risco: 'Alto' | 'Médio' | 'Baixo'): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.debug('[Oportunidades] Supabase não configurado. Fallback local acionado para update:', id);
    return;
  }

  try {
    const { error } = await supabase!
      .from('oportunidades')
      .update({ etapa, risco })
      .eq('id', id);

    if (error) {
      console.warn('[Oportunidades] Erro silenciado ao persistir:', error.message);
    }
  } catch (err) {
    console.warn('[Oportunidades] Exceção estrutural na persistência:', err instanceof Error ? err.message : String(err));
  }
}

export type CRMOpportunitySyncPayload = {
  id: string;
  accountSlug: string;
  nome: string;
  etapa?: string;
  valor?: number;
  owner?: string;
  risco?: 'Alto' | 'Médio' | 'Baixo';
  probabilidade?: number;
  historico?: string[];
};

export type CRMOpportunitySyncResult = {
  action: 'created' | 'updated' | 'skipped' | 'error';
  canopiId?: string;
  reason?: string;
  error?: string;
};

export async function syncOpportunityFromCRM(
  payload: CRMOpportunitySyncPayload,
  mode: 'create' | 'update',
): Promise<CRMOpportunitySyncResult> {
  if (!isSupabaseConfigured()) {
    return {
      action: 'skipped',
      reason: 'Supabase não configurado. Sync CRM ignorado.',
    };
  }

  if (!payload.id) {
    return { action: 'error', error: 'ID da oportunidade é obrigatório.' };
  }

  if (!payload.accountSlug?.trim()) {
    return { action: 'error', error: 'account_slug é obrigatório.' };
  }

  if (!payload.nome?.trim()) {
    return { action: 'error', error: 'Nome é obrigatório para criar oportunidade.' };
  }

  const safePayload: Record<string, unknown> = {
    id: payload.id,
    account_slug: payload.accountSlug.trim(),
    nome: payload.nome.trim(),
  };

  if (payload.etapa !== undefined && payload.etapa.trim()) {
    safePayload.etapa = payload.etapa.trim();
  }

  if (payload.valor !== undefined && Number.isFinite(payload.valor)) {
    safePayload.valor = payload.valor;
  } else if (mode === 'create') {
    safePayload.valor = 0;
  }

  if (payload.owner !== undefined && payload.owner.trim()) {
    safePayload.owner = payload.owner.trim();
  } else if (mode === 'create') {
    safePayload.owner = '';
  }

  if (payload.risco !== undefined) {
    safePayload.risco = payload.risco;
  } else if (mode === 'create') {
    safePayload.risco = 'Médio';
  }

  if (payload.probabilidade !== undefined && Number.isFinite(payload.probabilidade)) {
    safePayload.probabilidade = payload.probabilidade;
  } else if (mode === 'create') {
    safePayload.probabilidade = 0;
  }

  const historico = Array.isArray(payload.historico) ? payload.historico.filter(Boolean) : [];
  if (historico.length > 0 || mode === 'create') {
    safePayload.historico = historico;
  }

  try {
    if (mode === 'create') {
      const { data, error } = await supabase!
        .from('oportunidades')
        .insert(safePayload)
        .select('id')
        .maybeSingle();

      if (error) {
        return { action: 'error', canopiId: payload.id, error: error.message };
      }

      const createdId = (data as { id?: string } | null)?.id || payload.id;
      return { action: 'created', canopiId: createdId };
    }

    const { data, error } = await supabase!
      .from('oportunidades')
      .update(safePayload)
      .eq('id', payload.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return { action: 'error', canopiId: payload.id, error: error.message };
    }

    if (!data) {
      return {
        action: 'skipped',
        canopiId: payload.id,
        reason: 'Registro não encontrado para atualização.',
      };
    }

    return { action: 'updated', canopiId: payload.id };
  } catch (err) {
    return {
      action: 'error',
      canopiId: payload.id,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
