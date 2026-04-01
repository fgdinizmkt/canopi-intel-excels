'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccountDetail } from '../../context/AccountDetailContext';
import { AccountDetailView } from './AccountDetailView';

/**
 * Manager Responsável por renderizar o Perfil da Conta no modo correto (Drawer ou Fullscreen)
 */
export const AccountDetailManager: React.FC = () => {
  const { selectedAccountId, isOpen, viewMode, closeAccount, toggleViewMode } = useAccountDetail();

  // Bloquear scroll do body quando o fullscreen estiver aberto
  useEffect(() => {
    if (isOpen && viewMode === 'fullscreen') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, viewMode]);

  return (
    <AnimatePresence>
      {isOpen && selectedAccountId && (
        <>
          {/* Backdrop para fechar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAccount}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Container do Perfil */}
          <motion.div
            initial={viewMode === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
            animate={viewMode === 'drawer' ? { x: 0 } : { opacity: 1, scale: 1 }}
            exit={viewMode === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-[101] shadow-2xl overflow-hidden ${
              viewMode === 'drawer' 
                ? 'top-0 right-0 h-screen w-full md:w-[600px] lg:w-[750px]' 
                : 'inset-4 md:inset-10 rounded-2xl border border-slate-700/50'
            }`}
          >
            <AccountDetailView 
              accountId={selectedAccountId}
              viewMode={viewMode}
              onClose={closeAccount}
              onToggleViewMode={toggleViewMode}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
