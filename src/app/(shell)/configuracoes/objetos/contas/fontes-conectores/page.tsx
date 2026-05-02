import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ConnectorsStore } from '../_components/sections/ConnectorsStore';

export default function FontesConectoresPage() {
  return (
    <div className="space-y-8">
      <Link
        href="/configuracoes/objetos-crm"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Hub de CRM e Dados
      </Link>
      <ConnectorsStore />
    </div>
  );
}
