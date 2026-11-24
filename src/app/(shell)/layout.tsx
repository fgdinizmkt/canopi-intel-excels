import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import ShellLayoutClient from './ShellLayoutClient';
import { getUsuarioAtual } from '@/src/lib/supabase/server';

export default async function ShellLayout({ children }: { children: ReactNode }) {
  // Segunda checagem, no servidor: sessao valida no Supabase Auth.
  // O middleware ja redireciona; aqui e defesa em profundidade.
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    redirect('/login');
  }

  return <ShellLayoutClient>{children}</ShellLayoutClient>;
}
