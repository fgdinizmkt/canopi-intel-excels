import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { AccountDetailProvider } from '../context/AccountDetailContext';
import '../app/globals.css';

/**
 * Bridge minimalista para garantir que o AccountDetailProvider
 * esteja disponível nas rotas do Pages Router (src/pages).
 *
 * Guard de hydration: o router só é injetado após montagem no cliente.
 * Previne mismatch de SSR quando o router ainda não está pronto.
 */
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AccountDetailProvider routerProp={isMounted ? router : undefined}>
      <Component {...pageProps} />
    </AccountDetailProvider>
  );
}

export default MyApp;
