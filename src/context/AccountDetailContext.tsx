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
  openAccount: (accountId: string, contactId?: string, mode?: AccountViewMode) => void;
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

  /**
   * Abre o detalhe da conta via rota dinâmica (Subpágina)
   * Prioriza o uso de identificador semântico (slug) na URL
   */
  const openAccount = useCallback((accountId: string, contactId?: string, mode: AccountViewMode = 'drawer') => {
    // Busca o slug da conta para garantir semântica correta na URL
    const account = contasMock.find(c => c.id === accountId);
    const identifier = account?.slug || accountId;

    setSelectedAccountId(accountId);
    setSelectedContactId(contactId || null);
    setViewMode(mode);
    setIsOpen(true);

    // Navegação física para a subpágina dedicada
    router.push(`/contas/${identifier}`);
  }, [router]);

  /**
   * Fecha o detalhe da conta retornando para a origem
   */
  const closeAccount = useCallback(() => {
    setIsOpen(false);
    setSelectedAccountId(null);
    setSelectedContactId(null);
    
    // Comportamento de saída flexível: volta ou vai para listagem
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/contas');
    }
  }, [router]);

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
