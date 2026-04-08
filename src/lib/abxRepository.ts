import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * ABX Row: Supabase schema for ABX account data
 * Subset of Conta interface focused on ABX expansion context
 */
export interface AbxRow {
  id: string;
  abx?: {
    motivo?: string;
    evolucaoJornada?: string;
    maturidadeRelacional?: string;
    sponsorAtivo?: string;
    profundidadeComite?: string;
    continuidade?: string;
    expansao?: string;
    retencao?: string;
    riscoEstagnacao?: string;
  };
}

/**
 * getAbx: Read ABX account data from Supabase (read-only, defensive)
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
 * - Success → return array of AbxRow for merge in page
 */
export async function getAbx(): Promise<AbxRow[]> {
  // 1. Check configuration
  if (!isSupabaseConfigured()) {
    console.debug('[ABX Repository] Supabase not configured, using contasMock only');
    return [];
  }

  try {
    // 2. Query explicit fields only (not select('*'))
    const { data, error } = await supabase!
      .from('contas')
      .select('id, abx');

    // 3. Error handling: log and return empty (fallback)
    if (error) {
      console.warn('[ABX Repository] Query failed, falling back to contasMock:', error.message);
      return [];
    }

    // 4. Success: log and return
    if (data && Array.isArray(data)) {
      console.info(`[ABX Repository] Loaded ${data.length} accounts from Supabase`);
      return data as AbxRow[];
    }

    // 5. Unexpected state
    console.warn('[ABX Repository] Unexpected data format, falling back to contasMock');
    return [];
  } catch (exception) {
    console.error('[ABX Repository] Exception during query:', exception);
    return [];
  }
}

export default getAbx;
