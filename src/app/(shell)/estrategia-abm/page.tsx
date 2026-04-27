"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ABMStrategy from '../../../pages/AbmStrategy';

function AbmContent() {
  const searchParams = useSearchParams();
  const subPage = searchParams?.get('tab') ?? 'principal';
  return <ABMStrategy subPage={subPage} />;
}

export default function EstrategiaAbmPage() {
  return (
    <Suspense fallback={null}>
      <AbmContent />
    </Suspense>
  );
}
