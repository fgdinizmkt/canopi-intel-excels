import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Download, Zap, AlertTriangle, Info, CheckCircle2, X, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { signals } from '../data/mockData';
import { Signal, Severity } from '../types';
import { Badge, Button, Card } from '../components/ui';

type FilterSeverity = 'Todas' | 'critico' | 'alerta' | 'oportunidade' | 'estavel';
type FilterType = 'Todos' | 'Operacional' | 'Pipeline' | 'Conta';
type FilterCategory = 'Todas' | 'Canal' | 'Inbound' | 'ABX' | 'ABM' | 'SEO' | 'Dados' | 'Outbound';

export const Signals: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterSeverity, setFilterSeverity] = useState<string>("Todas");
  const [filterType, setFilterType] = useState<string>("Todos");
  const [filterCategory, setFilterCategory] = useState<string>("Todas");

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const matchSeverity = filterSeverity === "Todas" || s.severity === filterSeverity;
      const matchType = filterType === "Todos" || s.type === filterType;
      const matchCategory = filterCategory === "Todas" || s.category === filterCategory;
      return matchSeverity && matchType && matchCategory;
    });
  }, [filterSeverity, filterType, filterCategory]);

  const criticalCount = signals.filter(s => s.severity === "crítico").length;
  const alertCount = signals.filter(s => s.severity === "alerta").length;
  const opportunityCount = signals.filter(s => s.severity === "oportunidade").length;

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case "crítico": return "red";
      case "alerta": return "amber";
      case "oportunidade": return "blue";
      case "estável": return "emerald";
      default: return "slate";
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "crítico": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "alerta": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "oportunidade": return <Zap className="w-4 h-4 text-brand" />;
      case "estável": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const hasActiveFilters = filterSeverity !== "Todas" || filterType !== "Todos" || filterCategory !== "Todas";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Inteligencia</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand">Monitoramento em Tempo Real</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sinais</h1>
          <p className="text-slate-500 mt-2 max-w-2xl font-medium">
            Analise proativa de anomalias, oportunidades de cluster e saude do pipeline de receita detectadas por IA.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Download />}>Exportar Relatorio</Button>
          <Button icon={<Zap />}>Gerar Automacao</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-2xl font-extrabold text-red-600">{criticalCount}</p>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Críticos</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-extrabold text-amber-600">{alertCount}</p>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Alertas</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-brand shrink-0" />
          <div>
            <p className="text-2xl font-extrabold text-brand">{opportunityCount}</p>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Oportunidades</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severidade</span>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
            <option value="Todas">Todas</option>
            <option value="crítico">Crítico</option>
            <option value="alerta">Alerta</option>
            <option value="oportunidade">Oportunidade</option>
            <option value="estável">Estável</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</span>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
            <option value="Todos">Todos</option>
            <option value="Operacional">Operacional</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Conta">Conta</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</span>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
            <option value="Todas">Todas</option>
            <option value="Canal">Canal</option>
            <option value="Inbound">Inbound</option>
            <option value="ABX">ABX</option>
            <option value="ABM">ABM</option>
            <option value="SEO">SEO</option>
            <option value="Dados">Dados</option>
            <option value="Outbound">Outbound</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button onClick={() => { setFilterSeverity("Todas"); setFilterType("Todos"); setFilterCategory("Todas"); }}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
            <X className="w-3 h-3" /> Limpar filtros
          </button>
        )}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredSignals.length} de {signals.length} Sinais
          </span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode("grid")}
              className={"p-1.5 rounded-md transition-all " + (viewMode === "grid" ? "bg-white shadow-sm text-brand" : "text-slate-400")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={"p-1.5 rounded-md transition-all " + (viewMode === "list" ? "bg-white shadow-sm text-brand" : "text-slate-400")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredSignals.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 shadow-sm">
          <p className="text-slate-400 font-semibold">Nenhum sinal encontrado com os filtros aplicados.</p>
          <button onClick={() => { setFilterSeverity("Todas"); setFilterType("Todos"); setFilterCategory("Todas"); }}
            className="mt-3 text-xs font-bold text-brand hover:underline">Limpar filtros</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredSignals.map((signal) => (
          <div key={signal.id} onClick={() => setSelectedSignal(signal)}
            className={"group bg-white hover:bg-slate-50/50 rounded-2xl p-6 transition-all border-l-4 shadow-sm hover:shadow-md cursor-pointer " +
              (signal.severity === "crítico" ? "border-l-red-500" :
               signal.severity === "alerta" ? "border-l-amber-500" :
               signal.severity === "oportunidade" ? "border-l-brand" : "border-l-emerald-500")}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getSeverityIcon(signal.severity)}
                  <Badge variant={getSeverityColor(signal.severity)}>{signal.severity}</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{signal.id} - {signal.timestamp}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand transition-colors">{signal.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{signal.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Causa Provavel</p>
                    <p className="text-xs font-semibold text-slate-900">{signal.probableCause}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impacto Estimado</p>
                    <p className={"text-xs font-bold " + (signal.severity === "crítico" ? "text-red-600" : signal.severity === "alerta" ? "text-amber-600" : "text-brand")}>
                      {signal.impact}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confianca</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={"h-full " + (signal.confidence > 90 ? "bg-emerald-500" : signal.confidence > 80 ? "bg-brand" : "bg-amber-500")}
                          style={{ width: signal.confidence + "%" }}></div>
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Responsavel</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      {signal.owner.split(" ").map((n: string) => n[0]).join("")}
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

      <AnimatePresence>
        {selectedSignal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSignal(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[70] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(selectedSignal.severity)}
                  <Badge variant={getSeverityColor(selectedSignal.severity)}>{selectedSignal.severity}</Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedSignal.id}</span>
                </div>
                <button onClick={() => setSelectedSignal(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{selectedSignal.timestamp}</p>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedSignal.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{selectedSignal.context}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Causa Provavel</p>
                    <p className="text-sm font-bold text-slate-900">{selectedSignal.probableCause}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Impacto</p>
                    <p className={"text-sm font-bold " + (selectedSignal.severity === "crítico" ? "text-red-600" : selectedSignal.severity === "alerta" ? "text-amber-600" : "text-brand")}>
                      {selectedSignal.impact}
                    </p>
                  </div>
                </div>
                <Card title="Recomendacao da IA" className="bg-brand/5 border-brand/10">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">{selectedSignal.recommendation}</p>
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
                      { label: "Canal", value: selectedSignal.channel },
                      { label: "Origem", value: selectedSignal.source },
                      { label: "Tipo", value: selectedSignal.type },
                      { label: "Confianca", value: selectedSignal.confidence + "%" },
                      { label: "Data/Hora", value: selectedSignal.timestamp },
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
