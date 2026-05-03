import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { Badge, Card } from '@/src/components/ui';
import { SalesforceMethodSelector } from './_components/SalesforceMethodSelector';

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

      <header className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <Image
                src="/integrations/logos/Salesforce_logo.png"
                alt="Salesforce"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">Salesforce</h2>
              <p className="text-sm font-medium text-slate-600">
                Configure a fonte Salesforce para validar acesso, ler metadados e preparar mapeamentos antes da sincronização.
              </p>
            </div>
          </div>
          <Badge className="w-fit border-none bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
            Setup guiado
          </Badge>
        </div>

        <Card className="rounded-3xl border border-slate-200 p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">OAuth</p>
              <p className="mt-1 text-sm font-black text-slate-900">Conectado / Desconectado</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Fonte viva recomendada</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entidades suportadas</p>
              <p className="mt-1 text-sm font-black text-slate-900">5 entidades</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Account, Contact, Opportunity, Lead, Campaign</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CSV por entidade</p>
              <p className="mt-1 text-sm font-black text-slate-900">Preparação local</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Upload e ajuste local, sem consulta ao Salesforce</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronização</p>
              <p className="mt-1 text-sm font-black text-slate-900">Ainda não habilitada</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Esta página prepara acesso e mapeamentos</p>
            </div>
          </div>
        </Card>
      </header>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Métodos de conexão</p>
        <SalesforceMethodSelector />
      </section>

      <section className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Limites desta versão</p>
        <Card className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
            <p className="text-sm font-black text-slate-900">Limites desta versão</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-medium text-slate-700">
            <li>• Nenhum registro será importado agora</li>
            <li>• Sincronização ainda não habilitada</li>
            <li>• Writeback ainda não habilitado</li>
            <li>• Campos detectados são somente leitura</li>
            <li>• Mapeamento editável ainda não disponível</li>
            <li>• Tokens e segredos não são exibidos na interface</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
