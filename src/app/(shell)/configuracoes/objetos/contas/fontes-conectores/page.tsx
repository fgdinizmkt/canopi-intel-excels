'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AccountSources } from '../_components/sections/AccountSources';

export default function FontesConectoresPage() {
  return (
    <div className="space-y-8">
      <Link href="/configuracoes/objetos/contas" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" />
        Voltar para Hub de Contas
      </Link>
      <AccountSources />
    </div>
  );
}
