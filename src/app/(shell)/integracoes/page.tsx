"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Integrations from '../../../pages/Integrations';

export default function IntegracoesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('canopi_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
    else router.push('/login');
  }, [router]);

  if (!isAuthenticated) return null;

  return <Integrations />;
}
