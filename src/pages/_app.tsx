import type { AppProps } from 'next/app';
import { AccountDetailProvider } from '../context/AccountDetailContext';
import '../app/globals.css';

/**
 * Bridge minimalista para garantir que o AccountDetailProvider
 * esteja disponível nas rotas do Pages Router (src/pages).
 * Isso resolve o bloqueio de build no Signals.tsx e outras páginas.
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AccountDetailProvider>
      <Component {...pageProps} />
    </AccountDetailProvider>
  );
}

export default MyApp;
