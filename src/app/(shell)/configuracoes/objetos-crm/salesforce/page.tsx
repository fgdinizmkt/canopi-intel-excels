import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { SalesforceMethodSelector } from './_components/SalesforceMethodSelector';

export default function SalesforceDedicatedPage() {
  return (
    <div className="space-y-10">
      <Link
        href="/configuracoes/objetos/contas/fontes-conectores"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Loja de Conectores
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Image
              src="/integrations/logos/Salesforce_logo.png"
              alt="Salesforce"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">Salesforce</h2>
            <p className="text-sm font-medium text-slate-600">
              Configure a conexão, revise os dados encontrados e sincronize com segurança o que já está pronto para a Canopi.
            </p>
          </div>
        </div>
      </header>

      <div id="salesforce-connection-start">
        <SalesforceMethodSelector />
      </div>
    </div>
  );
}
