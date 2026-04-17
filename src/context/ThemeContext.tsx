'use client';

import React, { createContext, useContext } from 'react';

type Theme = 'claro';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: false;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = () => {
  };

  return (
    <ThemeContext.Provider value={{ theme: 'claro', setTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  }
  return context;
}
