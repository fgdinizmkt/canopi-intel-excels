/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, 
  ChevronRight, 
  Search, 
  Download, 
  Zap, 
  Clock, 
  User, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  X,
  ArrowRight,
  LayoutGrid,
  List
} from 'lucide-react';
import { signals } from '../data/mockData';
import { Signal, Severity } from '../types';
import { Badge, Button, Card } from '../components/ui';

export const Signals: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'crítico': return 'red';
      case 'alerta': return 'amber';
      case 'oportunidade': return 'blue';
      case 'estável': return 'emerald';
      default: return 'slate';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'crítico': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'alerta': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'oportunidade': return <Zap className="w-4 h-4 text-brand" />;
      case 'estável': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Inteligência</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand">Monitoramento em Tempo Real</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sinais</h1>
          <p className="text-slate-500 mt-2 max-w-2xl font-medium">
            Análise proativa de anomalias, oportunidades de cluster e saúde do pipeline de receita detectadas por IA.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download />}>Exportar Relatório</Button>
          <Button icon={<Zap />}>Gerar Automação</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-3">
        {[
          { label: 'Severidade', value: 'Todas' },
          { label: 'Tipo', value: 'Operacional' },
          { label: 'Categoria', value: 'Pipeline' },
          { label: 'Canal', value: 'Inbound' },
          { label: 'Confiança', value: '> 85%' },
        ].map((filter, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filter.label}</span>
            <span className="text-xs font-semibold text-slate-900">{filter.value}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">32 Sinais Ativos</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="p-1.5 bg-white rounded-md shadow-sm text-brand"><LayoutGrid className="w-4 h-4" /></button>
            <button className="p-1.5 text-slate-400"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Signals Feed */}
      <div className="grid grid-cols-1 gap-4">
        {signals.map((signal) => (
          <div 
            key={signal.id} 
            onClick={() => setSelectedSignal(signal)}
            className={`group bg-white hover:bg-slate-50/50 rounded-2xl p-6 transition-all border-l-4 shadow-sm hover:shadow-md cursor-pointer ${
              signal.severity === 'crítico' ? 'border-l-red-500' : 
              signal.severity === 'alerta' ? 'border-l-amber-500' : 
              signal.severity === 'oportunidade' ? 'border-l-brand' : 'border-l-emerald-500'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={getSeverityColor(signal.severity)}>{signal.severity}</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{signal.id} • {signal.timestamp}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors">{signal.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{signal.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Causa Provável</p>
                    <p className="text-xs font-semibold text-slate-900">{signal.probableCause}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impacto Estimado</p>
                    <p className={`text-xs font-bold ${signal.severity === 'crítico' ? 'text-red-600' : signal.severity === 'alerta' ? 'text-amber-600' : 'text-brand'}`}>
                      {signal.impact}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confiança</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${signal.confidence > 90 ? 'bg-emerald-500' : signal.confidence > 80 ? 'bg-brand' : 'bg-amber-500'}`} style={{ width: `${signal.confidence}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900">{signal.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categoria</p>
                    <Badge variant="slate">{signal.category}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-64 flex flex-col justify-between border-l border-slate-50 lg:pl-6">
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Responsável</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      {signal.owner.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{signal.owner}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="w-full">{signal.mainAction}</Button>
                  <Button variant="ghost" size="sm" className="w-full">Arquivar</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {selectedSignal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSignal(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={getSeverityColor(selectedSignal.severity)}>{selectedSignal.severity}</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedSignal.id}</span>
                </div>
                <button onClick={() => setSelectedSignal(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedSignal.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{selectedSignal.context}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Causa Provável</p>
                    <p className="text-sm font-bold text-slate-900">{selectedSignal.probableCause}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Impacto</p>
                    <p className="text-sm font-bold text-red-600">{selectedSignal.impact}</p>
                  </div>
                </div>

                <Card title="Recomendação da IA" className="bg-brand/5 border-brand/10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        {selectedSignal.recommendation}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-brand">
                        <span>Owner Sugerido: {selectedSignal.suggestedOwner}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Detalhes Adicionais</h4>
                  <div className="divide-y divide-slate-50 border-t border-b border-slate-50">
                    {[
                      { label: 'Canal', value: selectedSignal.channel },
                      { label: 'Origem', value: selectedSignal.source },
                      { label: 'Confiança', value: `${selectedSignal.confidence}%` },
                      { label: 'Data/Hora', value: selectedSignal.timestamp },
                    ].map((item, i) => (
                      <div key={i} className="py-3 flex justify-between items-center">
                        <span className="text-xs text-slate-500">{item.label}</span>
                        <span className="text-xs font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <Button className="flex-1" size="lg">{selectedSignal.mainAction}</Button>
                <Button variant="outline" className="flex-1" size="lg">Atribuir a Outro</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


export default Signals;
