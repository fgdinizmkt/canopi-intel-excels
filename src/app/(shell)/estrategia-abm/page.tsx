"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ABMStrategy from '../../../pages/AbmStrategy';

function AbmContent() {
  const searchParams = useSearchParams();
  const subPage = searchParams?.get('tab') ?? 'principal';
  return <ABMStrategy subPage={subPage} />;
}

export default function EstrategiaAbmPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('canopi_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
    else router.push('/login');
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <Suspense fallback={null}>
      <AbmContent />
    </Suspense>
  );
}
