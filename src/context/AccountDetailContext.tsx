'use strict';

import React, { createContext, useContext, useState, useCallback } from 'react';

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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<AccountViewMode>('drawer');

  const openAccount = useCallback((accountId: string, contactId?: string, mode: AccountViewMode = 'drawer') => {
    setSelectedAccountId(accountId);
    setSelectedContactId(contactId || null);
    setViewMode(mode);
    setIsOpen(true);
  }, []);

  const closeAccount = useCallback(() => {
    setIsOpen(false);
    // Não limpamos os IDs imediatamente para evitar "flicker" no fechamento da transição
    setTimeout(() => {
      setSelectedAccountId(null);
      setSelectedContactId(null);
    }, 300);
  }, []);

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
