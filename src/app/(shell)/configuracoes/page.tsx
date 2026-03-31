"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Settings from '../../../pages/Settings';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('canopi_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
    else router.push('/login');
  }, [router]);

  if (!isAuthenticated) return null;

  return <Settings />;
}
