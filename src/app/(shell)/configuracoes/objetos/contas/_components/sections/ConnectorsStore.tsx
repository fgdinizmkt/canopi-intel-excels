import React from 'react';
import Image from 'next/image';
import { Card } from '@/src/components/ui';

type ConnectorKind = 'salesforce' | 'hubspot' | 'rd-station-crm' | 'pipedrive' | 'clickup' | 'outro-crm';

interface ConnectorStoreCard {
  id: ConnectorKind;
  nome: string;
  descricao: string;
  categoria: string;
  metodosConexao: string[];
  objetosSuportados: string[];
  requisitos: string[];
  ctaLabel: string;
  ctaEnabled: boolean;
  destaque?: boolean;
  logoSrc?: string;
  logoAlt?: string;
}

const CONNECTORS_STORE_CARDS: ConnectorStoreCard[] = [
  {
    id: 'salesforce',
    nome: 'Salesforce',
    descricao: 'Conector CRM para operacoes comerciais e receita.',
    categoria: 'CRM e vendas',
    metodosConexao: ['OAuth / Connected App', 'Token temporario', 'CSV exportado'],
    objetosSuportados: ['Account'],
    requisitos: ['Acesso API ativo', 'Credencial valida para teste de conexao'],
    ctaLabel: 'Configurar conector',
    ctaEnabled: false,
    destaque: true,
    logoSrc: '/integrations/logos/Salesforce_logo.png',
    logoAlt: 'Logo Salesforce',
  },
  {
    id: 'hubspot',
    nome: 'HubSpot',
    descricao: 'Conector CRM para marketing e funil comercial.',
    categoria: 'CRM e automacao',
    metodosConexao: ['OAuth', 'Private App token', 'CSV exportado (quando aplicavel)'],
    objetosSuportados: ['Company'],
    requisitos: ['Permissoes de leitura da fonte', 'Credencial com escopos minimos'],
    ctaLabel: 'Ver opcoes de conexao',
    ctaEnabled: false,
    logoSrc: '/integrations/logos/Hubspot_logo.png',
    logoAlt: 'Logo HubSpot',
  },
  {
    id: 'rd-station-crm',
    nome: 'RD Station CRM',
    descricao: 'Conector de gestao comercial para operacao de contas.',
    categoria: 'Gestao comercial',
    metodosConexao: ['Token/API', 'OAuth quando aplicavel', 'CSV exportado (quando aplicavel)'],
    objetosSuportados: ['Organization'],
    requisitos: ['Conta com acesso a API', 'Campos minimos de identificacao da conta'],
    ctaLabel: 'Ver opcoes de conexao',
    ctaEnabled: false,
    logoSrc: '/integrations/logos/rd-station-black.svg',
    logoAlt: 'Logo RD Station CRM',
  },
  {
    id: 'pipedrive',
    nome: 'Pipedrive',
    descricao: 'Conector de CRM para pipelines e operacao comercial.',
    categoria: 'Gestao comercial',
    metodosConexao: ['OAuth', 'API token', 'CSV exportado (quando aplicavel)'],
    objetosSuportados: ['Organizations'],
    requisitos: ['Conta com acesso a integracoes', 'Definicao de campos essenciais de conta'],
    ctaLabel: 'Ver opcoes de conexao',
    ctaEnabled: false,
    logoSrc: '/integrations/logos/Pipedrive_logo.png',
    logoAlt: 'Logo Pipedrive',
  },
  {
    id: 'clickup',
    nome: 'ClickUp',
    descricao: 'Conector para operacao e produtividade com dados de contas.',
    categoria: 'Operacao e produtividade',
    metodosConexao: ['OAuth', 'Personal token', 'CSV/export (quando aplicavel)'],
    objetosSuportados: ['Espacos e listas de contas'],
    requisitos: ['Workspace autorizado', 'Definicao da entidade de contas no workspace'],
    ctaLabel: 'Ver opcoes de conexao',
    ctaEnabled: false,
    logoSrc: '/integrations/logos/clickup_logo.png',
    logoAlt: 'Logo ClickUp',
  },
  {
    id: 'outro-crm',
    nome: 'Outro CRM',
    descricao: 'Conector adaptavel para fontes proprietarias de CRM.',
    categoria: 'Integracao personalizada',
    metodosConexao: ['API token', 'OAuth quando aplicavel', 'Configuracao manual'],
    objetosSuportados: ['Entidade customizada de contas'],
    requisitos: ['Documentacao tecnica da fonte', 'Mapeamento minimo de campos obrigatorios'],
    ctaLabel: 'Ver opcoes de conexao',
    ctaEnabled: false,
    logoSrc: '/integrations/logos/CRM_outro.png',
    logoAlt: 'Logo Outro CRM',
  },
];

function ConnectorLogo({ connector }: { connector: ConnectorStoreCard }) {
  if (connector.logoSrc) {
    const logoContainerClassName = connector.id === 'outro-crm'
      ? 'inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-2 py-1'
      : 'inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-1';

    return (
      <div className={logoContainerClassName}>
        <Image
          src={connector.logoSrc}
          alt={connector.logoAlt || `Logo ${connector.nome}`}
          width={112}
          height={28}
          className="h-auto max-h-7 w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-2 py-1"
      aria-label="Sem marca especifica"
      title="Sem marca especifica"
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">CRM</span>
    </div>
  );
}

export function ConnectorsStore() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Loja de Conectores</h2>
        <p className="max-w-4xl text-sm font-medium leading-relaxed text-slate-600">
          Catalogo de integracoes de contas da Canopi. Cada conector possui configuracao dedicada em sua propria tela,
          com metodos de conexao, requisitos e objetos suportados.
        </p>
      </header>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">Escopo de configuracao</p>
        <p className="mt-1 text-sm font-medium text-blue-900">
          CSV, OAuth, token, schema e mapping serao configurados dentro da pagina dedicada de cada conector.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {CONNECTORS_STORE_CARDS.map((connector) => {
          return (
            <Card
              key={connector.id}
              className={`flex h-full flex-col border p-6 ${
                connector.destaque
                  ? 'border-blue-300 bg-gradient-to-b from-blue-50 to-white shadow-lg shadow-blue-100'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="mb-5 flex items-start gap-3">
                <ConnectorLogo connector={connector} />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{connector.nome}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{connector.categoria}</p>
                </div>
              </div>

              <p className="mb-5 text-sm font-medium leading-relaxed text-slate-600">{connector.descricao}</p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Metodos de conexao</p>
                  <ul className="mt-1 space-y-1 text-slate-700">
                    {connector.metodosConexao.map((metodo) => (
                      <li key={metodo}>• {metodo}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Objetos suportados</p>
                  <p className="mt-1 font-semibold text-slate-800">{connector.objetosSuportados.join(', ')}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Requisitos</p>
                  <ul className="mt-1 space-y-1 text-slate-700">
                    {connector.requisitos.map((requisito) => (
                      <li key={requisito}>• {requisito}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={!connector.ctaEnabled}
                  className={`w-full rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    connector.ctaEnabled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'cursor-default border border-slate-200 bg-slate-100 text-slate-500'
                  }`}
                >
                  {connector.ctaLabel}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
