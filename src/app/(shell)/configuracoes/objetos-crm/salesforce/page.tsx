import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  FileJson,
  KeyRound,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Card } from '@/src/components/ui';

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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Métodos de conexão</p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-blue-700" />
              <h3 className="text-base font-black text-slate-900">OAuth / Connected App</h3>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              Método recomendado para conexão real futura com política de autorização por aplicativo.
            </p>
          </Card>
          <Card className="rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-700" />
              <h3 className="text-base font-black text-slate-900">Token temporário</h3>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              Validação controlada de acesso e leitura para verificar objeto, campos e permissão da fonte.
            </p>
          </Card>
          <Card className="rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4 text-blue-700" />
              <h3 className="text-base font-black text-slate-900">CSV exportado</h3>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              Alternativa de entrada local para a fonte Salesforce, sem criar conector global separado.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Objetos e metadados</p>
        <Card className="rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">Account como primeiro objeto</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Contact, Lead, Opportunity e Campaign ficam como próximos objetos mapeáveis desta fonte.
              </p>
            </div>
            <Badge className="border-none bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
              Prioridade inicial
            </Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Contact', 'Lead', 'Opportunity', 'Campaign'].map((obj) => (
              <span
                key={obj}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
              >
                {obj}
              </span>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Leitura de metadados</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
              A descoberta de metadados deve ler campos, URLs e relacionamentos do objeto para apoiar o mapeamento Salesforce para Canopi.
            </p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Próximas configurações locais</p>
        <Card className="rounded-3xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              'Mapping Salesforce → Canopi',
              'Matching local',
              'Pipeline local',
              'Writeback local',
              'Governança local',
              'Validação local',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Segurança desta configuração</p>
        <Card className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <p className="text-sm font-black text-emerald-900">Controles ativos nesta página dedicada</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-medium text-emerald-900">
            <li>• Sem persistência de token</li>
            <li>• Sem sincronização automática</li>
            <li>• Sem writeback</li>
            <li>• Sem alteração no CRM</li>
            <li>• Página apenas prepara a configuração dedicada</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
