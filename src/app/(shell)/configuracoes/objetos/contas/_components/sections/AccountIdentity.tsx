'use client';

import React from 'react';
import { useContasConfig } from '../ContasConfigContext';
import { Fingerprint, Copy, ShieldCheck, AlertTriangle, Search } from 'lucide-react';

export const AccountIdentity = () => {
  const { conta, updateCustomConfig } = useContasConfig();

  const handleTogglePK = (field: string) => {
    const currentPKs = (conta as any).primaryKeys || [];
    const newPKs = currentPKs.includes(field)
      ? currentPKs.filter((k: string) => k !== field)
      : [...currentPKs, field];
    updateCustomConfig({ primaryKeys: newPKs });
  };

  const identityFields = [
    { id: 'dominio', label: 'Domínio Principal', description: 'ex: canopi.com.br - Chave de ouro para harmonização B2B.' },
    { id: 'cnpj', label: 'CNPJ / Tax ID', description: 'Identificador fiscal único. Recomendado para precisão no Brasil.' },
    { id: 'id_crm', label: 'ID do CRM', description: 'Identificador nativo da fonte (Salesforce ID, HubSpot ID).' },
    { id: 'email_domain', label: 'Sufixo de Email', description: 'Usado para associar contatos a contas automaticamente.' },
  ];

  return (
    <div className="space-y-8">
      {/* Prime Key Governance */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Fingerprint className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Governança de Identidade</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Definição de Chaves Primárias (PKs)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {identityFields.map((field) => {
            const isPK = (conta.primaryKeys || []).includes(field.id);
            return (
              <div 
                key={field.id}
                onClick={() => handleTogglePK(field.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  isPK ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-black uppercase tracking-tight ${isPK ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {field.label}
                  </span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPK ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    {isPK && <ShieldCheck className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{field.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isPK ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {isPK ? 'Chave Ativa' : 'Disponível'}
                  </span>
                  {isPK && field.id === 'dominio' && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white animate-pulse">
                      Sugestão: Master Key
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deduplication Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-black">Motor de Deduplicação</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-bold">Resolução de Conflitos</p>
                <p className="text-xs text-slate-400">O que fazer quando houver duplicidade na entrada?</p>
              </div>
              <select className="bg-slate-800 border-none rounded-lg px-3 py-2 text-xs font-bold outline-none">
                <option>Mesclar Automático (Merge)</option>
                <option>Priorizar Fonte Nova (Overwrite)</option>
                <option>Preservar Existente (Skip)</option>
                <option>Criar como Alias (Soft Link)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-bold">Sensibilidade do Matching</p>
                <p className="text-xs text-slate-400">Strict (Exact Match) vs Fuzzy (Partial Match)</p>
              </div>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-md bg-blue-600">Strict</button>
                <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-md text-slate-400">Fuzzy</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl">
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-xs font-black uppercase">Consistência ID</h4>
          </div>
          <p className="text-xs text-amber-900 font-bold leading-relaxed mb-6">
            Alterar as chaves primárias após a primeira ingestão pode causar fragmentação na base histórica.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-amber-800 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Impacta na Timeline de Contas
            </div>
            <div className="flex items-center gap-3 text-xs text-amber-800 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Afeta o cálculo de LTV / CAC
            </div>
            <div className="flex items-center gap-3 text-xs text-amber-800 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Exige re-indexação do Search Engine
            </div>
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border-2 border-amber-200 text-amber-700 font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all">
            Validar Integridade
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountIdentity;
