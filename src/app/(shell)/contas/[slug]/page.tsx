"use client";

import { useParams, useRouter } from 'next/navigation';
import { AccountProfile } from '../../../../pages/AccountProfile';
import { contaPorSlug } from '../../../../data/accountsData';

export default function ContaDetalhePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  // Resolução semântica via Slug
  const account = contaPorSlug(params?.slug || '');

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500">
        <h2 className="text-xl font-bold mb-2 text-slate-300">Conta não encontrada</h2>
        <button 
          onClick={() => router.push('/contas')}
          className="text-sm font-black text-blue-400 uppercase tracking-widest hover:underline"
        >
          Ir para a base de contas
        </button>
      </div>
    );
  }

  // A página dedicada agora assume o layout 360 profundo
  return <AccountProfile slug={params!.slug} />;
}
