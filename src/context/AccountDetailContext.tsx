import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { contasMock } from '../data/accountsData';

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
