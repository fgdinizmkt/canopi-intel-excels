import supabase, { isSupabaseConfigured } from './supabaseClient';
import { ActionItem, Priority, ActionStatus, SlaStatus } from '../data/accountsData';

/**
 * Repositório de Ações — Camada Complementar/Remota de Leitura
 * E5: Quarta migração de entidade
 *
 * Responsabilidade exclusiva: retornar ações complementares do Supabase
 * NÃO é responsável pela fila viva — essa é gerida por AccountDetailContext
 * Merge entre remote e local é responsabilidade da página (Actions.tsx)
 *
 * Contrato:
 * - Retorna apenas ações remotas/complementares
 * - Em erro ou ausência de configuração: retorna []
 * - Nunca escreve
 */

export type ActionRow = {
  id: string;
  priority: string;
  category: string;
  channel: string;
  status: string;
  title: string;
  description: string;
  accountName: string;
  origin: string;
  slaStatus: string;
  suggestedOwner: string;
  ownerTeam: string;
  createdAt: string;
  // Opcionais (18)
  accountContext?: string;
  relatedSignal?: string;
  ownerName?: string | null;
  slaText?: string;
  expectedImpact?: string;
  nextStep?: string;
  dependencies?: string[];
  evidence?: string[];
  history?: any[];
  projectObjective?: string;
  projectSuccess?: string;
  projectSteps?: any[];
  buttons?: any[];
  sourceType?: string;
  playbookName?: string;
  playbookRunId?: string;
  playbookStepId?: string;
  relatedAccountId?: string;
};

export type RepositoryAction = ActionItem;

// Type guards explícitos (sem as any)
function isValidPriority(val: unknown): val is Priority {
  return typeof val === 'string' && ['Crítica', 'Alta', 'Média', 'Baixa'].includes(val);
}

function isValidStatus(val: unknown): val is ActionStatus {
  return typeof val === 'string' && ['Nova', 'Em andamento', 'Bloqueada', 'Aguardando aprovação', 'Concluída'].includes(val);
}

function isValidSlaStatus(val: unknown): val is SlaStatus {
  return typeof val === 'string' && ['vencido', 'alerta', 'ok', 'sem_sla'].includes(val);
}

function isValidSourceType(val: unknown): val is 'manual' | 'signal' | 'playbook' {
  return typeof val === 'string' && ['manual', 'signal', 'playbook'].includes(val);
}

/**
 * Busca ações remotas do Supabase como camada complementar
 * Retorna [] em erro ou ausência de configuração
 */
export async function getActions(): Promise<RepositoryAction[]> {
  // Se Supabase não está configurado, retorna vazio (complemento vazio)
  if (!isSupabaseConfigured()) {
    console.info('[Actions Repository] Supabase não configurado. Retornando camada complementar vazia.');
    return [];
  }

  try {
    // Query defensiva: campos mínimos necessários
    const { data, error } = await supabase!
      .from('actions')
      .select(`
        id,
        priority,
        category,
        channel,
        status,
        title,
        description,
        accountName,
        origin,
        slaStatus,
        suggestedOwner,
        ownerTeam,
        createdAt,
        accountContext,
        relatedSignal,
        ownerName,
        slaText,
        expectedImpact,
        nextStep,
        dependencies,
        evidence,
        history,
        projectObjective,
        projectSuccess,
        projectSteps,
        buttons,
        sourceType,
        playbookName,
        playbookRunId,
        playbookStepId,
        relatedAccountId
      `);

    if (error) {
      console.warn('[Actions Repository] Erro ao buscar do Supabase:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.info('[Actions Repository] Nenhuma ação encontrada no Supabase.');
      return [];
    }

    // Processa ações remotas para criar shells seguros
    const remoteActions: RepositoryAction[] = (data as ActionRow[]).map(row => {
      console.info(`[Actions Repository] Shell seguro para ação remota id=${row.id}`);

      // Shell com type guards explícitos
      const shellAction: RepositoryAction = {
        id: row.id,
        priority: isValidPriority(row.priority) ? row.priority : ('Média' as const),
        category: row.category || 'Manual',
        channel: row.channel || 'Ops',
        status: isValidStatus(row.status) ? row.status : ('Nova' as const),
        title: row.title || 'Ação sem título',
        description: row.description || '',
        accountName: row.accountName || 'Conta desconhecida',
        accountContext: row.accountContext || 'Contexto não definido',
        origin: row.origin || 'Supabase Remote',
        relatedSignal: row.relatedSignal || '',
        ownerName: row.ownerName || null,
        slaText: row.slaText || 'SLA não definido',
        slaStatus: isValidSlaStatus(row.slaStatus) ? row.slaStatus : ('ok' as const),
        expectedImpact: row.expectedImpact || '',
        nextStep: row.nextStep || 'Aguardando ação',
        suggestedOwner: row.suggestedOwner || 'Não atribuído',
        ownerTeam: row.ownerTeam || 'Revenue Ops',
        dependencies: Array.isArray(row.dependencies) ? row.dependencies : [],
        evidence: Array.isArray(row.evidence) ? row.evidence : [],
        history: Array.isArray(row.history) ? row.history : [],
        projectObjective: row.projectObjective || '',
        projectSuccess: row.projectSuccess || '',
        projectSteps: Array.isArray(row.projectSteps) ? row.projectSteps : [],
        buttons: Array.isArray(row.buttons) ? row.buttons : [
          { id: 'view', label: 'Ver perfil completo', tone: 'secondary', action: 'open' },
          { id: 'start', label: 'Executar', tone: 'primary', action: 'start' },
        ],
        createdAt: row.createdAt || new Date().toISOString(),
        // Opcionais: usar apenas se válido e presente
        ...(isValidSourceType(row.sourceType) && { sourceType: row.sourceType }),
        ...(row.playbookName && typeof row.playbookName === 'string' && { playbookName: row.playbookName }),
        ...(row.playbookRunId && typeof row.playbookRunId === 'string' && { playbookRunId: row.playbookRunId }),
        ...(row.playbookStepId && typeof row.playbookStepId === 'string' && { playbookStepId: row.playbookStepId }),
        ...(row.relatedAccountId && typeof row.relatedAccountId === 'string' && { relatedAccountId: row.relatedAccountId }),
      };

      return shellAction;
    });

    console.info(`[Actions Repository] ${remoteActions.length} ações remotas carregadas`);
    return remoteActions;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Actions Repository] Exceção ao buscar ações remotas:', errorMsg);
    return [];
  }
}

/**
 * Persiste ação (upsert por id) para Supabase como best-effort
 * Não bloqueia, não retorna resultado, não lança erro
 * Logging silencioso apenas (sem UI impact)
 *
 * E6: Primeira Escrita Defensiva
 * Mapeamento explícito: reflete a ação final local com máxima fidelidade
 * Sem defaults remotos que inventem semântica diferente
 * ownerName: null persiste como null
 */
export async function persistAction(action: ActionItem): Promise<void> {
  // Se Supabase não está configurado, silencia (operação local é source of truth)
  if (!isSupabaseConfigured()) {
    console.debug('[Actions Repository] persistAction: Supabase não configurado. Skipping.');
    return;
  }

  try {
    // Mapeamento explícito: ActionItem → ActionRow
    // Reflete a ação final local de forma previsível
    const rowData: ActionRow = {
      id: action.id,
      priority: action.priority,
      category: action.category,
      channel: action.channel,
      status: action.status,
      title: action.title,
      description: action.description,
      accountName: action.accountName,
      origin: action.origin,
      slaStatus: action.slaStatus,
      suggestedOwner: action.suggestedOwner,
      ownerTeam: action.ownerTeam,
      createdAt: action.createdAt,
      accountContext: action.accountContext,
      relatedSignal: action.relatedSignal,
      ownerName: action.ownerName,
      slaText: action.slaText,
      expectedImpact: action.expectedImpact,
      nextStep: action.nextStep,
      dependencies: action.dependencies,
      evidence: action.evidence,
      history: action.history,
      projectObjective: action.projectObjective,
      projectSuccess: action.projectSuccess,
      projectSteps: action.projectSteps,
      buttons: action.buttons,
      sourceType: isValidSourceType(action.sourceType) ? action.sourceType : undefined,
      playbookName: action.playbookName,
      playbookRunId: action.playbookRunId,
      playbookStepId: action.playbookStepId,
      relatedAccountId: action.relatedAccountId,
    };

    // Upsert por id: insere novo ou atualiza existente
    const { error } = await supabase!
      .from('actions')
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      console.warn(`[Actions Repository] Erro ao persistir ação id=${action.id}:`, error.message);
      // Não relança — operação local já foi bem-sucedida
      return;
    }

    console.info(`[Actions Repository] Ação id=${action.id} persistida com sucesso`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[Actions Repository] Exceção ao persistir ação id=${action.id}:`, errorMsg);
    // Não relança — operação local já foi bem-sucedida
  }
}
