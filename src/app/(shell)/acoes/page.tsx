"use client";

import { Suspense } from 'react';
import Actions from '../../../pages/Actions';

export default function AcoesPage() {
  return (
    <Suspense fallback={null}>
      <Actions />
    </Suspense>
  );
}
