import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canopi | intel excels',
  description: 'Plataforma SaaS B2B de inteligência operacional, estratégica e account-centric.',
  other: {
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
