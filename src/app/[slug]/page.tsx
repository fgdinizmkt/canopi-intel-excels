"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import App from '../../App';

export default function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('canopi_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return <App initialPage={slug} />;
}
