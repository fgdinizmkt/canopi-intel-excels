"use client";

import { Suspense } from 'react';
import Accounts from '../../../pages/Accounts';

export default function ContasPage() {
  return (
    <Suspense fallback={null}>
      <Accounts />
    </Suspense>
  );
}
