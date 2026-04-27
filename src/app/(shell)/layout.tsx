import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ShellLayoutClient from './ShellLayoutClient';

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const auth = cookieStore.get('canopi_auth')?.value;

  if (auth !== 'true') {
    redirect('/login');
  }

  return <ShellLayoutClient>{children}</ShellLayoutClient>;
}
