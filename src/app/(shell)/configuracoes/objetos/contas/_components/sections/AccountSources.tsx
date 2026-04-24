'use client';

import React from 'react';
import { Database, ShieldCheck, Info, ArrowRightLeft, AlertTriangle, Lock, Zap } from 'lucide-react';
import { Card, Badge } from '@/src/components/ui';
import { useContasConfig } from '../ContasConfigContext';
import { 
  CONNECTOR_PRESETS, 
  CONTA_CANONICAL_FIELDS_MINIMUM, 
  type ConnectorType 
} from '@/src/lib/contaConnectorsV2';

export function AccountSources() {
  const { conta, setConnector, updateCustomConfig, customConfig } = useContasConfig();

  const updateMapping = (index: number, updates: any) => {
    const newMappings = [...(conta.fieldMappings || [])];
    newMappings[index] = { ...newMappings[index], ...updates };
    updateCustomConfig({ fieldMappings: newMappings });
  };

  return (
    <section id="fontes" className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">2. Fontes e Conectores</h2>
        <p className="text-lg text-slate-500 mt-4 max-w-3xl font-medium">Defina sua Fonte de Verdade (SoT) primária e configure os conectores nativos.</p>
      </header>

      <div className="grid grid-cols-2 gap-8">
        {(['salesforce', 'hubspot', 'rd_station', 'other_crm'] as ConnectorType[]).map(type => {
          const preset = CONNECTOR_PRESETS[type];
          if (type === 'csv_upload') return null;
          const isActive = conta.connectorType === type;
          
          return (
            <Card key={type} className={`p-0 overflow-hidden border-2 transition-all ${isActive ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                         <Database className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{preset.name}</h3>
                         <div className="flex items-center gap-2">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{type === 'other_crm' ? 'Modo Semiassistido' : 'CRM Native Integration'}</p>
                           <Badge className={`${preset.identity.confidenceScore > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} text-[8px] font-black border-none`}>
                             Confiança: {preset.identity.confidenceScore}%
                           </Badge>
                         </div>
                      </div>
                   </div>
                   <button 
                    type="button"
                    onClick={() => setConnector(type)}
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-900 text-white shadow-lg'
                    }`}
                   >
                      {isActive ? 'Ativo' : 'Conectar'}
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                   <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Objeto: {type === 'hubspot' ? 'Company' : type === 'rd_station' ? 'Organization' : 'Account'}</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>PK: {preset.identity.nativePrimaryKey} {preset.identity.nativeSecondaryKeys && preset.identity.nativeSecondaryKeys.length > 0 && `(+${preset.identity.nativeSecondaryKeys.join('/')})`}</span>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-[10px] space-y-1">
                   <p className="font-black uppercase text-slate-400 mb-2">Fatos da Fonte ({preset.name})</p>
                   {preset.instructions.factsAboutConnector.map((fact, fidx) => (
                     <div key={fidx} className="flex gap-2">
                       <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                       <span className="text-slate-600 font-medium">{fact}</span>
                     </div>
                   ))}
                </div>

                {isActive && (
                  <div className="space-y-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                     {type === 'other_crm' && (
                       <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-6 mb-6">
                         <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                           <Zap className="w-3 h-3" /> Configuração Técnica (Outro CRM)
                         </h4>
                         <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Ferramenta</label>
                             <input 
                               type="text"
                               placeholder="Ex: Pipedrive"
                               value={conta.customName || ''}
                               onChange={(e) => updateCustomConfig({ customName: e.target.value })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Objeto Nativo</label>
                             <input 
                               type="text"
                               placeholder="Ex: Organizations"
                               value={conta.nativeObject || ''}
                               onChange={(e) => updateCustomConfig({ customNativeObject: e.target.value })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Primary Key Nativa</label>
                             <input 
                               type="text"
                               placeholder="Ex: org_id"
                               value={conta.primaryKey || ''}
                               onChange={(e) => {
                                 const val = e.target.value;
                                 updateCustomConfig({ 
                                   customPrimaryKey: val,
                                   primaryKeys: [val]
                                 });
                               }}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Chaves Secundárias (comma separated)</label>
                             <input 
                               type="text"
                               placeholder="Ex: domain, tax_id"
                               value={conta.secondaryKeys.join(', ')}
                               onChange={(e) => updateCustomConfig({ customSecondaryKeys: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="space-y-1 col-span-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Campos Obrigatórios na Fonte (comma separated)</label>
                             <input 
                               type="text"
                               placeholder="Ex: name, owner_id, status"
                               value={conta.requiredFields.join(', ')}
                               onChange={(e) => updateCustomConfig({ customRequiredFields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Política de Conflito</label>
                             <select 
                               value={conta.conflictPolicy}
                               onChange={(e) => updateCustomConfig({ customConflictPolicy: e.target.value })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 appearance-none"
                             >
                                <option value="">-- SELECIONE --</option>
                                <option value="manual_review">Manual Review</option>
                                <option value="append">Append Only</option>
                                <option value="overwrite">Overwrite</option>
                             </select>
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Confiança (%)</label>
                             <input 
                               type="number"
                               value={conta.confidenceScore || 0}
                               onChange={(e) => updateCustomConfig({ customConfidence: parseInt(e.target.value) || 0 })}
                               className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                           </div>
                           <div className="col-span-2 flex items-center gap-6 p-4 bg-white/50 rounded-2xl border border-blue-100">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox"
                                  id="supportsWriteback"
                                  checked={conta.supportsWriteback}
                                  onChange={(e) => updateCustomConfig({ customSupportsWriteback: e.target.checked })}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="supportsWriteback" className="text-[10px] font-black text-slate-600 uppercase">Suporta Writeback</label>
                              </div>
                              {conta.supportsWriteback && (
                                <div className="flex-1 space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Targets de Writeback (comma separated)</label>
                                  <input 
                                    type="text"
                                    placeholder="Ex: account_name, owner_id"
                                    value={(customConfig.customWritebackTargets || []).join(', ')}
                                    onChange={(e) => updateCustomConfig({ customWritebackTargets: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                                  />
                                </div>
                              )}
                           </div>
                         </div>
                       </div>
                     )}

                     <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Mapeamento Contextual: {preset.name}</h4>
                     <div className="space-y-3">
                        {conta.fieldMappings.map((map, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                             <div className="col-span-5">
                                <input 
                                  type="text" 
                                  value={map.nativeField} 
                                  onChange={(e) => updateMapping(idx, { nativeField: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white transition-all outline-none"
                                  placeholder="campo_nativo"
                                />
                             </div>
                             <div className="col-span-1 flex justify-center text-slate-300">
                                <ArrowRightLeft className="w-3 h-3" />
                             </div>
                             <div className="col-span-6 relative">
                                <select 
                                  value={map.canonicalField}
                                  disabled={map.isCanonicalMinimum}
                                  onChange={(e) => updateMapping(idx, { canonicalField: e.target.value })}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase appearance-none"
                                >
                                  <option value="">-- CANOPI FIELD --</option>
                                  {CONTA_CANONICAL_FIELDS_MINIMUM.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                {map.isCanonicalMinimum && <Lock className="absolute right-3 top-2.5 w-3 h-3 text-slate-300" />}
                             </div>
                          </div>
                        ))}
                     </div>
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 font-medium italic">Revisão manual obrigatória para campos canônicos marcados como mandatórios.</p>
                     </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
