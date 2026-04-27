"use client";

import { Suspense } from 'react';
import '../../../pages/signals.css';
import Signals from '../../../pages/Signals';

export default function SinaisPage() {
  return (
    <Suspense fallback={null}>
      <Signals />
    </Suspense>
  );
}
