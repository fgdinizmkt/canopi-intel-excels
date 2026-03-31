/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, Filter, ChevronRight } from 'lucide-react';

interface TopbarProps {
  title: string;
  breadcrumbs?: string[];
  activePage?: string;
  setActivePage?: (page: string) => void;
  subPage?: string;
  setSubPage?: (subPage: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  breadcrumbs = [],
  activePage,
  setActivePage,
  subPage,
  setSubPage
}) => {
  const router = useRouter();
  const showTabs = activePage === 'contas' || activePage === 'sinais' || activePage === 'estrategia-abm';

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <span>{crumb}</span>
              {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
            </React.Fragment>
          ))}
          {breadcrumbs.length > 0 && <ChevronRight className="w-3 h-3" />}
          <span className="text-brand">{title}</span>
        </div>
        
        {showTabs && (
          <div className="flex items-center gap-6 ml-8">
            {activePage === 'estrategia-abm' ? (
              <>
                <button 
                  onClick={() => setSubPage?.('principal')}
                  className={`text-sm font-bold transition-all ${subPage === 'principal' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Estratégia ABM
                </button>
                <button 
                  onClick={() => setSubPage?.('relatorios')}
                  className={`text-sm font-bold transition-all ${subPage === 'relatorios' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Relatórios
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActivePage?.('contas'); router.push('/contas'); }}
                  className={`text-sm font-bold transition-all ${activePage === 'contas' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Contas
                </button>
                <button
                  onClick={() => { setActivePage?.('sinais'); router.push('/sinais'); }}
                  className={`text-sm font-bold transition-all ${activePage === 'sinais' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sinais
                </button>
              </>
            )}
          </div>
        )}
        
        <div className="relative w-full max-w-sm ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar ações ou campanhas..." 
            className="w-full bg-slate-50 border-none rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-slate-100 mx-1"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Fábio Diniz</p>
            <div className="flex flex-col items-end leading-none">
              <p className="text-[9px] text-brand font-bold">@fdiniz</p>
              <p className="text-[8px] text-slate-400 font-medium lowercase tracking-tighter">fabio.diniz@canopi.com</p>
            </div>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio" 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
