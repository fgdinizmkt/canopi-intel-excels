import supabase, { isSupabaseConfigured } from './supabaseClient';
import { advancedSignals } from '../data/signalsV6';

/**
 * Repositório de Sinais — Camada de Leitura Supabase com Fallback
 * E3: Segunda migração de entidade
 *
 * Estratégia:
 * 1. Se Supabase está configurado, tenta ler signals
 * 2. Se falha ou não configurado, retorna advancedSignals
 * 3. Nunca escreve — apenas leitura
 */

/**
 * Tipo explícito para item de sinal na aplicação
 * Baseado na estrutura dos sinais mock + campos operacionais locais
 * Compatível com advancedSignals e tipos flexíveis do mock
 */
export type SignalItem = {
  id: string;
  severity: string; // 'crítico' | 'alerta' | 'oportunidade'
  type: string;
  category: string;
  archived: boolean;
  resolved: boolean;
  title: string;
  description: string;
  timestamp: string;
  account: string;
  accountId?: string;
  owner: string;
  confidence: number;
  channel: string;
  source: string;
  context?: string;
  probableCause: string;
  impact: string;
  recommendation: string;
  suggestedOwner?: string;
  // Campos operacionais locais (não persistem em Supabase)
  flow?: string;
  mainAction?: string;
  linkedAction?: any;
  accountContext?: string;
  accountDetails?: any[];
  stakeholders?: any[];
  nextSteps?: string[];
  actions?: any[];
};

export type SignalRow = {
  id: string;
  severity?: 'crítico' | 'alerta' | 'oportunidade';
  type?: string;
  category?: string;
  archived?: boolean;
  resolved?: boolean;
  title?: string;
  description?: string;
  timestamp?: string;
  account?: string;
  accountId?: string;
  owner?: string;
  confidence?: number;
  channel?: string;
  source?: string;
  context?: string;
  probableCause?: string;
  impact?: string;
  recommendation?: string;
};

/**
 * Busca sinais do Supabase com fallback para advancedSignals
 * Faz merge com advancedSignals para campos profundos não migrados ainda
 */
export async function getSignals(): Promise<SignalItem[]> {
  // Se Supabase não está configurado, retorna mock imediatamente
  if (!isSupabaseConfigured()) {
    console.info('[Signals] Supabase não configurado. Usando advancedSignals.');
    return advancedSignals;
  }

  try {
    // Query defensiva: lê apenas campos mínimos necessários para listagem
    const { data, error } = await supabase!
      .from('signals')
      .select(`
        id,
        severity,
        type,
        category,
        archived,
        resolved,
        title,
        description,
        timestamp,
        account,
        accountId,
        owner,
        confidence,
        channel,
        source,
        context,
        probableCause,
        impact,
        recommendation
      `);

    if (error) {
      console.warn('[Signals] Erro ao buscar do Supabase:', error.message);
      return advancedSignals;
    }

    if (!data || data.length === 0) {
      console.info('[Signals] Nenhum sinal encontrado no Supabase. Usando advancedSignals.');
      return advancedSignals;
    }

    // Faz merge com advancedSignals para campos profundos (mainAction, linkedAction, flow, actionItems, etc)
    // Esta estratégia permite migração gradual sem reescrever tudo de uma vez
    const supabaseSignals = (data as SignalRow[]).map(row => {
      // Procura mock por id
      const mockSignal = advancedSignals.find(s => s.id === row.id);

      // Se não houver mock correspondente, cria shell seguro com campos obrigatórios
      if (!mockSignal) {
        console.warn(`[Signals] Nenhum sinal mock encontrado para id=${row.id}. Usando shell seguro.`);
        return {
          // Campos do Supabase
          ...row,
          // Campos obrigatórios preenchidos com valores seguros
          severity: row.severity || 'alerta',
          type: row.type || 'Operacional',
          category: row.category || 'Geral',
          archived: row.archived ?? false,
          resolved: row.resolved ?? false,
          title: row.title || 'Sinal sem título',
          description: row.description || '',
          timestamp: row.timestamp || 'Agora',
          account: row.account || 'Sem conta',
          accountId: row.accountId || '',
          owner: row.owner || 'Não atribuído',
          confidence: row.confidence ?? 0,
          channel: row.channel || 'Sem canal',
          source: row.source || 'Sem origem',
          context: row.context || '',
          probableCause: row.probableCause || '',
          impact: row.impact || '',
          recommendation: row.recommendation || '',
          // Campos profundos sempre vazios (serão preenchidos em migrações futuras)
          mainAction: 'Ver Detalhes',
          flow: 'account',
          linkedAction: null,
          suggestedOwner: row.owner || 'A atribuir',
        } as typeof advancedSignals[0];
      }

      // Merge defensivo: preservar mock quando Supabase retorna null/undefined
      return {
        ...mockSignal,
        ...row,
        // Garantir que campos críticos nunca sejam degradados por null
        severity: row.severity ?? mockSignal.severity,
        type: row.type ?? mockSignal.type,
        category: row.category ?? mockSignal.category,
        title: row.title ?? mockSignal.title,
        description: row.description ?? mockSignal.description,
        timestamp: row.timestamp ?? mockSignal.timestamp,
        account: row.account ?? mockSignal.account,
        accountId: row.accountId ?? mockSignal.accountId,
        owner: row.owner ?? mockSignal.owner,
        confidence: row.confidence ?? mockSignal.confidence,
        channel: row.channel ?? mockSignal.channel,
        source: row.source ?? mockSignal.source,
        context: row.context ?? mockSignal.context,
        probableCause: row.probableCause ?? mockSignal.probableCause,
        impact: row.impact ?? mockSignal.impact,
        recommendation: row.recommendation ?? mockSignal.recommendation,
        archived: row.archived ?? mockSignal.archived,
        resolved: row.resolved ?? mockSignal.resolved,
      } as typeof advancedSignals[0];
    });

    console.info(`[Signals] ${supabaseSignals.length} sinais carregados do Supabase`);
    return supabaseSignals;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Signals] Exceção ao buscar sinais:', errorMsg);
    return advancedSignals;
  }
}

/**
 * E7: Persistência defensiva de sinal no Supabase.
 * Upsert por id, mapeamento explícito SignalItem → SignalRow.
 * Best-effort: nunca relança erro, falha silenciosa com logging.
 * Fire-and-forget: não bloqueia fluxo local.
 */
export async function persistSignal(signal: SignalItem): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[signalsRepository] Supabase não configurado — skip persistência remota');
    return;
  }

  try {
    console.log(`[signalsRepository] Persistindo sinal ${signal.id} no Supabase...`);

    // Mapeamento explícito SignalItem → SignalRow
    // Persiste apenas campos que fazem sentido no banco de dados
    const signalRow: SignalRow = {
      id: signal.id,
      severity: signal.severity as 'crítico' | 'alerta' | 'oportunidade' | undefined,
      type: signal.type,
      category: signal.category,
      archived: signal.archived,
      resolved: signal.resolved,
      title: signal.title,
      description: signal.description,
      timestamp: signal.timestamp,
      account: signal.account,
      accountId: signal.accountId,
      owner: signal.owner,
      confidence: signal.confidence,
      channel: signal.channel,
      source: signal.source,
      context: signal.context,
      probableCause: signal.probableCause,
      impact: signal.impact,
      recommendation: signal.recommendation
    };

    // Upsert por id
    const { error } = await supabase!
      .from('signals')
      .upsert(signalRow, { onConflict: 'id' });

    if (error) {
      console.error(`[signalsRepository] Erro ao persistir sinal ${signal.id}:`, error);
      return;
    }

    console.log(`[signalsRepository] Sinal ${signal.id} persistido com sucesso`);
  } catch (e) {
    console.error(`[signalsRepository] Exceção ao persistir sinal ${signal.id}:`, e);
    // Silencioso — nunca relança
  }
}
