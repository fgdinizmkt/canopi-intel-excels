"use client";

import { useParams } from 'next/navigation';
import { AccountProfile } from '../../../../pages/AccountProfile';

export default function ContaDetalhePage() {
  const params = useParams<{ slug: string }>();

  // A conta e resolvida dentro do AccountProfile: primeiro na base real
  // (Supabase), depois na base de exemplo. Antes havia aqui um filtro que so
  // aceitava contas de exemplo, e nenhuma conta real abria.
  return <AccountProfile slug={params?.slug || ''} />;
}
