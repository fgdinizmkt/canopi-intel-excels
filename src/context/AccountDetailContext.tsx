import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { contasMock, ActionItem, HistoryItem, initialActions } from '../data/accountsData';
import { persistAction } from '../lib/actionsRepository';

/**
 * Tipos de visualização do Perfil da Conta
 */
export type AccountViewMode = 'drawer' | 'fullscreen';

interface AccountDetailContextType {
  selectedAccountId: string | null;
  selectedContactId: string | null;
  isOpen: boolean;
  viewMode: AccountViewMode;
  /** Módulo de origem para retorno contextual */
  originModule: string | null;
  /** URL de origem para retorno contextual */
  originPath: string | null;
  /** Chave de estado opcional para filtros/scrolling */
  originStateKey: string | null;
  openAccount: (accountId: string, contactId?: string, opts?: { mode?: AccountViewMode, originModule?: string, originPath?: string, stateKey?: string }) => void;
  closeAccount: () => void;
  toggleViewMode: () => void;
  /** Operação: Lista de ações criadas nesta sessão */
  sessionActions: ActionItem[];
  /** Operação: Logs adicionados nesta sessão (por Account ID) */
  sessionLogs: Record<string, string[]>;
  /** Cria uma nova ação operacional e retorna seu ID */
  createAction: (action: Partial<ActionItem>) => string;
  /** Atualiza uma ação existente com registro de histórico automático */
  updateAction: (actionId: string, patch: Partial<ActionItem> & { comment?: string }, actor?: string) => void;
  /** Adiciona um registro ao histórico da conta */
  addLog: (accountId: string, text: string) => void;
}

const AccountDetailContext = createContext<AccountDetailContextType | undefined>(undefined);

/**
 * Helper puro: constrói uma ação nova com todos os campos preenchidos
 * Sem efeitos colaterais, sem state
 * Montagem explícita: não permite sobrescrita livre de id, status, createdAt
 * Preserva campos opcionais do partialAction campo a campo, explicitamente
 */
function buildNewAction(partialAction: Partial<ActionItem>): ActionItem {
  return {
    id: `session-${Date.now()}`,
    priority: partialAction.priority || "Média",
    category: partialAction.category || "Manual",
    channel: partialAction.channel || "Ops",
    status: "Nova",
    title: partialAction.title || "Nova Ação Operacional",
    description: partialAction.description || "",
    accountName: partialAction.accountName || "Conta não identificada",
    accountContext: partialAction.accountContext || "Contexto manual",
    origin: partialAction.origin || "Canopi Command Center",
    relatedSignal: partialAction.relatedSignal || "Ação disparada via Centro de Comando",
    ownerName: partialAction.ownerName || null,
    suggestedOwner: partialAction.suggestedOwner || "Fábio Diniz",
    ownerTeam: partialAction.ownerTeam || "Revenue Ops",
    slaText: partialAction.slaText || "24h",
    slaStatus: partialAction.slaStatus || "ok",
    expectedImpact: partialAction.expectedImpact || "Evolução do engajamento na conta",
    nextStep: partialAction.nextStep || "Iniciar contato",
    dependencies: Array.isArray(partialAction.dependencies) ? partialAction.dependencies : [],
    evidence: Array.isArray(partialAction.evidence) ? partialAction.evidence : [],
    history: [
      {
        id: `hist-${Date.now()}`,
        when: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actor: "Canopi AI",
        type: "evidência",
        text: `Ação operacional materializada via ${partialAction.sourceType || 'manual'}.`
      },
      ...(Array.isArray(partialAction.history) ? partialAction.history : [])
    ],
    projectObjective: partialAction.projectObjective || "Executar tese de abordagem conforme recomendação Canopi.",
    projectSuccess: partialAction.projectSuccess || "Aprovação do próximo passo pelo stakeholder.",
    projectSteps: Array.isArray(partialAction.projectSteps) ? partialAction.projectSteps : [],
    buttons: Array.isArray(partialAction.buttons) ? partialAction.buttons : [
      { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
      { id: "start", label: "Executar", tone: "primary", action: "start" },
    ],
    createdAt: new Date().toISOString(),
    sourceType: partialAction.sourceType,
    playbookName: partialAction.playbookName,
    playbookRunId: partialAction.playbookRunId,
    playbookStepId: partialAction.playbookStepId,
    relatedAccountId: partialAction.relatedAccountId,
  };
}

/**
 * Helper puro: aplica patch a uma ação existente com histórico automático
 * Detecta mudanças, constrói histórico, retorna ação final
 * Sem efeitos colaterais, sem state
 * Checks de presença ('in') em vez de truthy para comportamento determinístico
 */
function applyActionPatch(
  action: ActionItem,
  patch: Partial<ActionItem & { comment?: string }>,
  actor: string = "Usuário"
): ActionItem {
  const historyEntries: HistoryItem[] = [];
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Detectar mudanças para histórico automático
  // Usar 'in' para detectar presença, não depender de truthy
  if ('status' in patch && patch.status !== action.status) {
    historyEntries.push({
      id: `hist-status-${Date.now()}`,
      when: now,
      actor,
      type: "mudança",
      text: `Status alterado de ${action.status} para ${patch.status}.`
    });
  }

  if ('ownerName' in patch && patch.ownerName !== action.ownerName) {
    historyEntries.push({
      id: `hist-owner-${Date.now()}`,
      when: now,
      actor,
      type: "owner",
      text: `Owner alterado para ${patch.ownerName}.`
    });
  }

  if ('nextStep' in patch && patch.nextStep !== action.nextStep) {
    historyEntries.push({
      id: `hist-step-${Date.now()}`,
      when: now,
      actor,
      type: "follow-up",
      text: `Próximo passo atualizado: "${patch.nextStep}".`
    });
  }

  if ('comment' in patch && patch.comment) {
    historyEntries.push({
      id: `hist-comment-${Date.now()}`,
      when: now,
      actor,
      type: "comentário",
      text: patch.comment
    });
  }

  // Prevenir que o comentário entre no objeto da ação
  const { comment, ...restPatch } = patch;

  return {
    ...action,
    ...restPatch,
    history: [...historyEntries, ...action.history]
  };
}

/**
 * Provider global para gestão da profundidade da conta
 */
export const AccountDetailProvider: React.FC<{ children: React.ReactNode; routerProp?: any }> = ({ children, routerProp }) => {
  const router = routerProp;
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<AccountViewMode>('drawer');
  const [originModule, setOriginModule] = useState<string | null>(null);
  const [originPath, setOriginPath] = useState<string | null>(null);
  const [originStateKey, setOriginStateKey] = useState<string | null>(null);

  // Estados Operacionais da Sessão com Persistência Local
  const [sessionActions, setSessionActions] = useState<ActionItem[]>([]);
  const [sessionLogs, setSessionLogs] = useState<Record<string, string[]>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hidratação inicial ao montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedActions = localStorage.getItem('canopi_v1_actions');
        const storedLogs = localStorage.getItem('canopi_v1_logs');

        if (storedActions) {
           setSessionActions(JSON.parse(storedActions));
        } else {
           // Bootstrap inicial
           setSessionActions(initialActions);
        }
        
        if (storedLogs) setSessionLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Falha ao hidratar camada operacional Canopi:', e);
        setSessionActions(initialActions);
      } finally {
        setIsHydrated(true);
      }
    }
  }, []);

  // 2. Sincronização reativa com o storage
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('canopi_v1_actions', JSON.stringify(sessionActions));
      localStorage.setItem('canopi_v1_logs', JSON.stringify(sessionLogs));
    }
  }, [sessionActions, sessionLogs, isHydrated]);

  /**
   * Abre o detalhe da conta via rota dinâmica (Subpágina)
   */
  const openAccount = useCallback((
    accountId: string, 
    contactId?: string, 
    opts: { mode?: AccountViewMode, originModule?: string, originPath?: string, stateKey?: string } = {}
  ) => {
    // Busca o slug da conta para garantir semântica correta na URL
    const account = contasMock.find(c => c.id === accountId);
    const identifier = account?.slug || accountId;

    setSelectedAccountId(accountId);
    setSelectedContactId(contactId || null);
    setViewMode(opts.mode || 'drawer');
    setOriginModule(opts.originModule || null);
    setOriginPath(opts.originPath || (typeof window !== 'undefined' ? window.location.pathname : null));
    setOriginStateKey(opts.stateKey || null);
    setIsOpen(true);

    // Navegação física para a subpágina dedicada
    if (router && typeof router.push === 'function') {
      router.push(`/contas/${identifier}`);
    }
  }, [router]);

  /**
   * Fecha o detalhe da conta retornando para a origem
   */
  const closeAccount = useCallback(() => {
    const path = originPath;
    
    setIsOpen(false);
    setSelectedAccountId(null);
    setSelectedContactId(null);
    setOriginModule(null);
    setOriginPath(null);
    setOriginStateKey(null);
    
    if (router && typeof router.push === 'function') {
      // Prioriza o retorno para o path de origem registrado
      if (path && typeof window !== 'undefined' && path !== window.location.pathname) {
        router.push(path);
      } else if (typeof window !== 'undefined' && window.history.length > 1 && typeof router.back === 'function') {
        router.back();
      } else {
        router.push('/contas');
      }
    }
  }, [router, originPath]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'drawer' ? 'fullscreen' : 'drawer'));
  }, []);

  /**
   * Operacional: Criação de Ação Real
   * E6: Local-first + persistência remota best-effort
   */
  const createAction = useCallback((partialAction: Partial<ActionItem>): string => {
    // 1. Construir ação final (puro, sem efeitos)
    const newAction = buildNewAction(partialAction);

    // 2. Registrar localmente (síncrono, imediato)
    setSessionActions(prev => [newAction, ...prev]);

    // 3. Persistir remotamente (assíncrono, best-effort, fire-and-forget)
    persistAction(newAction).catch(() => {
      // Silencioso — persistAction já logged o erro
    });

    return newAction.id;
  }, []);

  /**
   * Operacional: Mutação de Ação com Histórico Automático
   * E6: Local-first + persistência remota best-effort
   */
  const updateAction = useCallback((actionId: string, patch: Partial<ActionItem & { comment?: string }>, actor: string = "Usuário") => {
    // 1. Localizar ação atual NO SNAPSHOT ANTES de setState
    const currentAction = sessionActions.find(a => a.id === actionId);
    if (!currentAction) return;

    // 2. Calcular ação final ANTES de setState
    const updatedAction = applyActionPatch(currentAction, patch, actor);

    // 3. Atualizar estado local
    setSessionActions(prev => prev.map(a => a.id === actionId ? updatedAction : a));

    // 4. Persistir remotamente (assíncrono, best-effort, fire-and-forget)
    persistAction(updatedAction).catch(() => {
      // Silencioso — persistAction já logged o erro
    });
  }, [sessionActions]);

  /**
   * Operacional: Registro de Log / Timeline
   */
  const addLog = useCallback((accountId: string, text: string) => {
    setSessionLogs(prev => ({
      ...prev,
      [accountId]: [text, ...(prev[accountId] || [])]
    }));
  }, []);

  return (
    <AccountDetailContext.Provider
      value={{
        selectedAccountId,
        selectedContactId,
        isOpen,
        viewMode,
        originModule,
        originPath,
        originStateKey,
        openAccount,
        closeAccount,
        toggleViewMode,
        sessionActions,
        sessionLogs,
        createAction,
        updateAction,
        addLog,
      }}
    >
      {children}
    </AccountDetailContext.Provider>
  );
};

/**
 * Contexto de fallback para quando o hook é usado fora do Provider.
 * Retorna operações no-op em vez de lançar erro fatal (previne 500 em App Router).
 */
const FALLBACK_CONTEXT: AccountDetailContextType = {
  selectedAccountId: null,
  selectedContactId: null,
  isOpen: false,
  viewMode: 'drawer',
  originModule: null,
  originPath: null,
  originStateKey: null,
  openAccount: () => {},
  closeAccount: () => {},
  toggleViewMode: () => {},
  sessionActions: [],
  sessionLogs: {},
  createAction: () => '',
  updateAction: () => {},
  addLog: () => {},
};

/**
 * Hook para interagir com o Perfil da Conta de qualquer lugar do Canopi.
 * Fora do Provider retorna um contexto de fallback seguro (no-op) em vez de throw.
 */
export const useAccountDetail = () => {
  const context = useContext(AccountDetailContext);
  if (!context) {
    // Fallback seguro: não lança erro, retorna operações no-op.
    // Garante que componentes em rotas App Router não colapam o runtime
    // quando o Provider ainda não montou ou não está na árvore.
    if (typeof window !== 'undefined') {
      console.warn('[Canopi] useAccountDetail chamado fora do AccountDetailProvider — retornando fallback no-op.');
    }
    return FALLBACK_CONTEXT;
  }
  return context;
};
