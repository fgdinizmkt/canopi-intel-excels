"use client";

import { useParams, useRouter } from 'next/navigation';
import { ContactProfile } from '../../../../../../pages/ContactProfile';
import { contaPorSlug } from '../../../../../../data/accountsData';

export default function ContatoDetalhePage() {
  const params = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  
  // Resolução semântica via Slug da conta e ID do contato
  const account = contaPorSlug(params?.slug || '');
  const contact = account?.contatos.find(c => c.id === params?.id);

  if (!account || !contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500">
        <h2 className="text-xl font-bold mb-2 text-slate-300 italic">Contato não encontrado</h2>
        <p className="text-sm mb-6 text-slate-600">Verifique a conta mãe ou o identificador do contato.</p>
        <button 
          onClick={() => router.push(account ? `/contas/${account.slug}` : '/contas')}
          className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
        >
          {account ? `Voltar para o perfil de ${account.nome}` : 'Ir para a base de contas'}
        </button>
      </div>
    );
  }

  // Renderiza a página dedicada profunda do contato
  return <ContactProfile slug={params!.slug} contactId={params!.id} />;
}
