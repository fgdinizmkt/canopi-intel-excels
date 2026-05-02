import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, Database, Layers, ShieldCheck } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';

export default function HubCrmDadosPage() {
  return (
    <div className="space-y-10">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:text-blue-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para Entidades
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
            <Layers className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Hub de CRM e Dados</h2>
            <p className="text-sm font-medium text-slate-600">
              Este hub separa a configuração local por CRM da camada canônica global da Canopi.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">CRM local / Conectores</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
              Entrada primária
            </Badge>
          </div>

          <Link href="/configuracoes/objetos/contas/fontes-conectores">
            <Card className="group border border-slate-200 bg-white p-6 rounded-3xl hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    Loja de Conectores
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    Escolha Salesforce, HubSpot, RD Station CRM, Pipedrive, ClickUp ou Outro CRM como fonte.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Escopo por CRM</p>
                <p className="mt-1 text-xs font-medium text-blue-900 leading-relaxed">
                  Métodos, objetos, mapping, matching local, pipeline local, writeback local, governança local e validação local serão tratados dentro
                  de cada CRM.
                </p>
              </div>
            </Card>
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Camada canônica global</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
              Canopi global
            </Badge>
          </div>

          <Card className="border border-slate-200 bg-white p-6 rounded-3xl">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Modelo Canônico Canopi</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Revise Conta, Contato, Oportunidade e Campanha como destinos canônicos.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Escopo global</p>
              <p className="mt-1 text-xs font-medium text-emerald-900 leading-relaxed">
                Dedupe global, survivorship, pipeline consolidado, writeback global, governança global e publicação/auditoria ficam na camada global.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
