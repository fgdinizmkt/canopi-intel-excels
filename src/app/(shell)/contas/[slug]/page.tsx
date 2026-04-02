"use client";

import { useParams, useRouter } from 'next/navigation';
import { AccountDetailView } from '../../../../components/account/AccountDetailView';
import { contaPorSlug } from '../../../../data/accountsData';

export default function ContaDetalhePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  // Resolução semântica correta via Slug
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

  const handleClose = () => {
    // Comportamento de saída inteligente: tenta voltar ou vai para a listagem
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/contas');
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] -m-6">
      <AccountDetailView 
        accountId={account.id} 
        viewMode="fullscreen" 
        onClose={handleClose} 
        onToggleViewMode={() => {}} 
      />
    </div>
  );
}
