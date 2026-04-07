/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Bell, Settings, ChevronRight } from 'lucide-react';

import Image from 'next/image';

const AbmTabs: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRelatorios = searchParams?.get('tab') === 'relatorios';
  return (
    <>
      <button
        onClick={() => router.push('/estrategia-abm?tab=principal')}
        className={`text-sm font-bold transition-all ${!isRelatorios ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
      >
        Estratégia ABM
      </button>
      <button
        onClick={() => router.push('/estrategia-abm?tab=relatorios')}
        className={`text-sm font-bold transition-all ${isRelatorios ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
      >
        Relatórios
      </button>
    </>
  );
};

export const Topbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    '/visao-geral': 'Visão Geral',
    '/sinais': 'Sinais',
    '/acoes': 'Fila de Ações',
    '/desempenho': 'Análise de Desempenho',
    '/contas': 'Contas',
    '/seo-inbound': 'SEO & Inbound',
    '/midia-paga': 'Mídia Paga',
    '/outbound': 'Outbound',
    '/estrategia-abm': 'Estratégia ABM',
    '/orquestracao-abx': 'Orquestração ABX',
    '/inteligencia-cruzada': 'Inteligência Cruzada',
    '/assistente': 'Assistente',
    '/integracoes': 'Integrações',
    '/contatos': 'Contatos',
    '/configuracoes': 'Configurações',
  };

  const pageBreadcrumbs: Record<string, string[]> = {
    '/acoes': ['CANOPI', 'REVENUE OPS'],
    '/contas': ['CANOPI', 'INTELIGÊNCIA'],
    '/sinais': ['CANOPI', 'INTELIGÊNCIA'],
    '/estrategia-abm': ['CANOPI', 'ESTRATÉGIA'],
    '/orquestracao-abx': ['CANOPI', 'ESTRATÉGIA'],
    '/inteligencia-cruzada': ['CANOPI', 'ESTRATÉGIA'],
    '/outbound': ['CANOPI', 'OUTBOUND'],
    '/integracoes': ['CANOPI', 'CONFIGURAÇÕES', 'INTEGRAÇÕES'],
    '/assistente': ['CANOPI', 'ASSISTENTE'],
    '/contatos': ['CANOPI', 'CONTATOS'],
  };

  const derivedTitle = (pathname ? pageTitles[pathname] : undefined) ?? 'Canopi Platform';
  const derivedBreadcrumbs = (pathname ? pageBreadcrumbs[pathname] : undefined) ?? ['CANOPI'];

  const showTabs = pathname === '/contas' || pathname === '/sinais' || pathname === '/estrategia-abm';

  return (
    <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {derivedBreadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <span>{crumb}</span>
              {i < derivedBreadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
            </React.Fragment>
          ))}
          {derivedBreadcrumbs.length > 0 && <ChevronRight className="w-3 h-3" />}
          <span className="text-brand">{derivedTitle}</span>
        </div>
        
        {showTabs && (
          <div className="flex items-center gap-6 ml-8">
            {pathname === '/estrategia-abm' ? (
              <Suspense fallback={null}>
                <AbmTabs />
              </Suspense>
            ) : (
              <>
                <button
                  onClick={() => router.push('/contas')}
                  className={`text-sm font-bold transition-all ${pathname === '/contas' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Contas
                </button>
                <button
                  onClick={() => router.push('/sinais')}
                  className={`text-sm font-bold transition-all ${pathname === '/sinais' ? 'text-brand border-b-2 border-brand pb-5 mt-5' : 'text-slate-400 hover:text-slate-600'}`}
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
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio"
            alt="Avatar"
            width={32}
            height={32}
            unoptimized
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50"
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
