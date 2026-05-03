import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Badge, Card } from '@/src/components/ui';
import { SalesforceMethodSelector } from './_components/SalesforceMethodSelector';
import { SalesforceDiscovery } from './_components/SalesforceDiscovery';

export default function SalesforceDedicatedPage() {
  return (
    <div className="space-y-10">
      <Link
        href="/configuracoes/objetos/contas/fontes-conectores"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Loja de Conectores
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Image
              src="/integrations/logos/Salesforce_logo.png"
              alt="Salesforce"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">Salesforce</h2>
            <p className="text-sm font-medium text-slate-600">
              Configure a fonte Salesforce para leitura de contas, metadados e mapeamento local.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Visão da fonte</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fonte</p>
            <p className="mt-1 text-sm font-black text-slate-900">Salesforce</p>
          </Card>
          <Card className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objeto prioritário</p>
            <p className="mt-1 text-sm font-black text-slate-900">Account</p>
          </Card>
          <Card className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
            <p className="mt-1 text-sm font-black text-slate-900">Configuração local</p>
          </Card>
          <Card className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escopo</p>
            <p className="mt-1 text-sm font-black text-slate-900">Leitura e metadados</p>
          </Card>
          <Card className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ambiente</p>
            <p className="mt-1 text-sm font-black text-slate-900">OAuth/Token/CSV por CRM</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado atual do conector Salesforce</p>
        <Card className="rounded-3xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {([
              ['Token temporário', 'Funcional read-only', 'emerald'],
              ['OAuth / External Client App', 'OAuth produtivo', 'emerald'],
              ['Discovery multiobjeto', 'Account · Contact · Opportunity', 'emerald'],
              ['CSV exportado', 'Preparação local', 'blue'],
              ['Bulk API / sync', 'Futuro', 'amber'],
              ['Writeback', 'Não disponível nesta versão', 'slate'],
            ] as [string, string, 'emerald' | 'blue' | 'amber' | 'slate'][]).map(([label, status, tone]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <span
                  className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                    tone === 'emerald'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tone === 'blue'
                      ? 'bg-blue-100 text-blue-800'
                      : tone === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">
            Este conector já permite validação read-only via token temporário, preparação local por CSV e conexão OAuth produtiva quando configurada.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Métodos de conexão</p>
        <SalesforceMethodSelector />
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Discovery e mapeamento pré-sync</p>
        <SalesforceDiscovery />
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Objetos neste recorte</p>
        <Card className="rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">Account · Contact · Opportunity</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Discovery read-only de metadados. Lead foi excluído intencionalmente deste recorte. Campaign fica para recorte futuro.
              </p>
            </div>
            <Badge className="border-none bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
              Pré-sync
            </Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Account', 'Contact', 'Opportunity'].map((obj) => (
              <span
                key={obj}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
              >
                {obj}
              </span>
            ))}
            {['Lead', 'Campaign'].map((obj) => (
              <span
                key={obj}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-400 line-through"
              >
                {obj}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Limites desta versão</p>
        <Card className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <p className="text-sm font-black text-emerald-900">Guardrails ativos nesta página dedicada</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-medium text-emerald-900">
            <li>• Sem sync neste recorte — discovery prepara, não importa</li>
            <li>• Sem writeback neste recorte</li>
            <li>• Sem leitura massiva de registros neste recorte</li>
            <li>• Sem exposição de tokens em UI, query string, logs ou armazenamento client-side</li>
            <li>• Sem criação ou atualização de registros no CRM</li>
            <li>• Lead excluído intencionalmente deste recorte</li>
          </ul>
          <p className="mt-4 text-xs font-medium text-emerald-800">
            Sync, Bulk API e writeback serão tratados em recortes próprios. Próximo passo natural: primeiro sync read-only controlado de Accounts.
          </p>
        </Card>
      </section>
    </div>
  );
}
