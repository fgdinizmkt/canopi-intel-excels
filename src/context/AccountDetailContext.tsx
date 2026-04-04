import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contasMock, ActionItem, HistoryItem } from '../data/accountsData';

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
  /** Cria uma nova ação operacional */
  createAction: (action: Partial<ActionItem>) => void;
  /** Atualiza uma ação existente com registro de histórico automático */
  updateAction: (actionId: string, patch: Partial<ActionItem>, actor?: string) => void;
  /** Adiciona um registro ao histórico da conta */
  addLog: (accountId: string, text: string) => void;
}

const AccountDetailContext = createContext<AccountDetailContextType | undefined>(undefined);

/**
 * Provider global para gestão da profundidade da conta
 */
export const AccountDetailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
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
        
        if (storedActions) setSessionActions(JSON.parse(storedActions));
        if (storedLogs) setSessionLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Falha ao hidratar camada operacional Canopi:', e);
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
    router.push(`/contas/${identifier}`);
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
    
    // Prioriza o retorno para o path de origem registrado
    if (path && typeof window !== 'undefined' && path !== window.location.pathname) {
      router.push(path);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/contas');
    }
  }, [router, originPath]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'drawer' ? 'fullscreen' : 'drawer'));
  }, []);

  /**
   * Operacional: Criação de Ação Real
   */
  const createAction = useCallback((partialAction: Partial<ActionItem>) => {
    const newAction: ActionItem = {
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
      slaText: "24h",
      slaStatus: "ok",
      expectedImpact: "Evolução do engajamento na conta",
      nextStep: partialAction.nextStep || "Iniciar contato",
      dependencies: [],
      evidence: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          when: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actor: "Canopi AI",
          type: "evidência",
          text: `Ação operacional materializada via ${partialAction.sourceType || 'manual'}.`
        }
      ],
      projectObjective: "Executar tese de abordagem conforme recomendação Canopi.",
      projectSuccess: "Aprovação do próximo passo pelo stakeholder.",
      projectSteps: [],
      buttons: [
        { id: "view", label: "Ver perfil completo", tone: "secondary", action: "open" },
        { id: "start", label: "Executar", tone: "primary", action: "start" },
      ],
      ...partialAction
    };

    setSessionActions(prev => [newAction, ...prev]);
  }, []);

  /**
   * Operacional: Mutação de Ação com Histórico Automático
   */
  const updateAction = useCallback((actionId: string, patch: Partial<ActionItem>, actor: string = "Usuário") => {
    setSessionActions(prev => prev.map(action => {
      if (action.id !== actionId) return action;

      const historyEntries: HistoryItem[] = [];
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Detectar mudanças para histórico automático
      if (patch.status && patch.status !== action.status) {
        historyEntries.push({
          id: `hist-status-${Date.now()}`,
          when: now,
          actor,
          type: "mudança",
          text: `Status alterado de ${action.status} para ${patch.status}.`
        });
      }

      if (patch.ownerName && patch.ownerName !== action.ownerName) {
        historyEntries.push({
          id: `hist-owner-${Date.now()}`,
          when: now,
          actor,
          type: "owner",
          text: `Owner alterado para ${patch.ownerName}.`
        });
      }

      if (patch.nextStep && patch.nextStep !== action.nextStep) {
        historyEntries.push({
          id: `hist-step-${Date.now()}`,
          when: now,
          actor,
          type: "follow-up",
          text: `Próximo passo atualizado: "${patch.nextStep}".`
        });
      }

      return {
        ...action,
        ...patch,
        history: [...historyEntries, ...action.history]
      };
    }));
  }, []);

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
 * Hook para interagir com o Perfil da Conta de qualquer lugar do Canopi
 */
export const useAccountDetail = () => {
  const context = useContext(AccountDetailContext);
  if (!context) {
    throw new Error('useAccountDetail must be used within an AccountDetailProvider');
  }
  return context;
};
