import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { TipoEstrategico } from '../data/accountsData';

export type PlayAtivo = 'ABM' | 'ABX' | 'Híbrido' | 'Nenhum';

/**
 * ABM Row: Supabase schema for ABM account data
 * Subset of Conta interface focused on ABM scoring and context
 */
export interface AbmRow {
  id: string;
  slug?: string;
  icp?: number;
  crm?: number;
  vp?: number;
  ct?: number;
  ft?: number;
  abm?: {
    motivo?: string;
    fit?: string;
    cluster?: string;
    similaridade?: string;
    coberturaInicialComite?: string;
    playsEntrada?: string[];
    potencialAbertura?: string;
    hipoteses?: string[];
    contasSimilares?: string[];
    // Narrativas estratégicas (E12)
    strategyNarrative?: string;
    riskAssessment?: string;
    successCriteria?: string;
  };
  tipoEstrategico?: TipoEstrategico;
  playAtivo?: PlayAtivo;
}

/**
 * getAbm: Read ABM account data from Supabase (read-only, defensive)
 *
 * Pattern:
 * 1. Check Supabase configured
 * 2. Query table 'contas' with explicit fields (no select('*'))
 * 3. Error or absent config → return [] (graceful fallback)
 * 4. Logging at key points for observability
 *
 * Fallback strategy:
 * - Supabase not configured → [] (complementary layer is empty)
 * - Query error → [] (use local contasMock completely)
 * - Success → return array of AbmRow for merge in page
 */
export async function getAbm(): Promise<AbmRow[]> {
  // 1. Check configuration
  if (!isSupabaseConfigured()) {
    console.debug('[ABM Repository] Supabase not configured, using contasMock only');
    return [];
  }

  try {
    // 2. Query explicit fields only (not select('*'))
    const { data, error } = await supabase!
      .from('contas')
      .select('id, slug, icp, crm, vp, ct, ft, abm, tipoEstrategico, playAtivo');

    // 3. Error handling: log and return empty (fallback)
    if (error) {
      console.warn('[ABM Repository] Query failed, falling back to contasMock:', error.message);
      return [];
    }

    // 4. Success: log and return
    if (data && Array.isArray(data)) {
      console.info(`[ABM Repository] Loaded ${data.length} accounts from Supabase`);
      return data as AbmRow[];
    }

    // 5. Unexpected state
    console.warn('[ABM Repository] Unexpected data format, falling back to contasMock');
    return [];
  } catch (exception) {
    console.error('[ABM Repository] Exception during query:', exception);
    return [];
  }
}

/**
 * persistAbm: Update ABM account data in Supabase (defensive, best-effort)
 * Expanded for Recorte 33: now includes 'tipoEstrategico' and 'playAtivo'.
 * Expanded for Recorte 40 (E12): now includes narrative fields inside abm object.
 */
export async function persistAbm(abm: {
  id: string;
  tipoEstrategico?: TipoEstrategico;
  playAtivo?: PlayAtivo;
  abm?: {
    strategyNarrative?: string;
    riskAssessment?: string;
    successCriteria?: string;
    // preserve other abm fields
    motivo?: string;
    fit?: string;
    cluster?: string;
    similaridade?: string;
    coberturaInicialComite?: string;
    playsEntrada?: string[];
    potencialAbertura?: string;
    hipoteses?: string[];
    contasSimilares?: string[];
  };
}): Promise<void> {
  if (!isSupabaseConfigured() || !abm.id) return;

  try {
    // 1. Build payload: explicit fields only
    const payload: {
      id: string;
      tipoEstrategico?: TipoEstrategico;
      playAtivo?: PlayAtivo;
      abm?: AbmRow['abm'];
    } = { id: abm.id };

    if (abm.tipoEstrategico !== undefined) payload.tipoEstrategico = abm.tipoEstrategico;
    if (abm.playAtivo !== undefined) payload.playAtivo = abm.playAtivo;
    if (abm.abm !== undefined) payload.abm = abm.abm;

    // 2. Upsert by id - mapping only allowed fields
    const { error } = await supabase!
      .from('contas')
      .upsert(payload, { onConflict: 'id' });

    // 3. Defensive log - never block or throw UI
    if (error) {
      console.warn('[ABM Repository] Persist failed:', error.message);
    } else {
      console.info(`[ABM Repository] Persisted ABM fields for ${abm.id}`);
    }
  } catch (exception) {
    console.error('[ABM Repository] Exception during persist:', exception);
  }
}

export default getAbm;
