import React from 'react';
import {
  Puzzle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Server,
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';

type IntegracaoCategoria = 'CRM' | 'Ads' | 'Dados' | 'Destino';
type IntegracaoStatus = 'connected' | 'partial' | 'error' | 'disconnected';

interface Integracao {
  id: string;
  nome: string;
  categoria: IntegracaoCategoria;
  status: IntegracaoStatus;
  lastSync: string;
  icon: string;
  confianca: number;
  volume: string;
  impacto: string[];
  crítica: boolean;
  proximoPasso: string;
}

const integrações: Integracao[] = [
  {
    id: 'int-1',
    nome: 'HubSpot',
    categoria: 'CRM',
    status: 'connected',
    lastSync: 'há 12 min',
    icon: 'HS',
    confianca: 98,
    volume: '24.5k contatos · 1.2k contas',
    impacto: ['Prontidão de Contas', 'Mapeamento de Comitê'],
    crítica: true,
    proximoPasso: 'Revisar mapeamento de campos (SDR)',
  },
  {
    id: 'int-2',
    nome: 'LinkedIn Ads',
    categoria: 'Ads',
    status: 'error',
    lastSync: 'erro de API',
    icon: 'LI',
    confianca: 0,
    volume: 'sincronização interrompida',
    impacto: ['Sinais de Intenção', 'Atribuição de Mídia'],
    crítica: true,
    proximoPasso: 'Renovar Token de API',
  },
  {
    id: 'int-3',
    nome: 'Salesforce',
    categoria: 'CRM',
    status: 'partial',
    lastSync: 'há 2 horas',
    icon: 'SF',
    confianca: 72,
    volume: '8.1k oportunidades',
    impacto: ['Pipeline ABM', 'Previsão de Receita'],
    crítica: true,
    proximoPasso: 'Validar duplicidade de Leads',
  },
  {
    id: 'int-4',
    nome: 'Google Ads',
    categoria: 'Ads',
    status: 'connected',
    lastSync: 'há 5 min',
    icon: 'GA',
    confianca: 94,
    volume: '156k impressões · 4.2k cliques',
    impacto: ['Desempenho de Campanha'],
    crítica: false,
    proximoPasso: 'Sincronizar conversões offline',
  },
  {
    id: 'int-5',
    nome: 'Clearbit',
    categoria: 'Dados',
    status: 'connected',
    lastSync: 'há 1 dia',
    icon: 'CB',
    confianca: 91,
    volume: '892 perfis enriquecidos',
    impacto: ['Enriquecimento de Lead'],
    crítica: false,
    proximoPasso: 'Ajustar regras de fallback',
  },
  {
    id: 'int-6',
    nome: 'Slack',
    categoria: 'Destino',
    status: 'connected',
    lastSync: 'há 1 min',
    icon: 'SL',
    confianca: 100,
    volume: '14 canais ativos',
    impacto: ['Alertas em Tempo Real'],
    crítica: false,
    proximoPasso: 'Adicionar canal de War Room',
  },
  {
    id: 'int-7',
    nome: 'Meetime',
    categoria: 'Destino',
    status: 'disconnected',
    lastSync: 'nunca',
    icon: 'MT',
    confianca: 0,
    volume: 'sem dados',
    impacto: ['Fluxo de Outbound'],
    crítica: false,
    proximoPasso: 'Configurar Webhook',
  },
];

const getStatusBadge = (status: IntegracaoStatus) => {
  switch (status) {
    case 'connected': return <Badge variant="emerald">Conectado</Badge>;
    case 'partial': return <Badge variant="amber">Parcial</Badge>;
    case 'error': return <Badge variant="red">Erro</Badge>;
    default: return <Badge variant="slate">Desconectado</Badge>;
  }
};

const getConfidenceColor = (confianca: number) => {
  if (confianca >= 90) return 'text-emerald-600';
  if (confianca >= 70) return 'text-amber-600';
  return 'text-red-600';
};

export const Integrations: React.FC = () => {
  const confiancaMedia = Math.round(integrações.filter(i => i.status !== 'disconnected').reduce((acc, i) => acc + i.confianca, 0) / integrações.filter(i => i.status !== 'disconnected').length);
  const fontesCriticas = integrações.filter(i => i.crítica);
  const fontesCriticasAtivas = fontesCriticas.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="blue" className="bg-white/10 text-white border-white/20">PAINEL DE CONFIABILIDADE DO STACK</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Integrações</h1>
              <p className="text-white/80 text-sm md:text-base">Mantenha a saúde das fontes de dados para garantir a precisão da inteligência Canopi.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Confiança do Stack</p>
                <p className={`text-2xl font-bold mt-1 ${getConfidenceColor(confiancaMedia)}`}>{confiancaMedia}%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Fontes Críticas</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold">{fontesCriticasAtivas}</span>
                  <span className="text-sm text-white/40">/ {fontesCriticas.length} ativas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button className="bg-brand text-white hover:bg-brand/90 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20">
              <Puzzle className="w-4 h-4 mr-2" /> Nova Integração
            </Button>
            <div className="ml-auto flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80">Monitoramento global ativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {(['CRM', 'Ads', 'Dados', 'Destino'] as IntegracaoCategoria[]).map((cat) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              {cat === 'CRM' && <Database className="w-4 h-4 text-blue-500" />}
              {cat === 'Ads' && <Zap className="w-4 h-4 text-amber-500" />}
              {cat === 'Dados' && <Server className="w-4 h-4 text-emerald-500" />}
              {cat === 'Destino' && <ArrowRight className="w-4 h-4 text-violet-500" />}
              <h3 className="text-sm font-bold text-slate-800">{cat}</h3>
            </div>
            
            <div className="space-y-3">
              {integrações
                .filter((int) => int.categoria === cat)
                .map((int) => (
                  <Card key={int.id} className="p-5 flex flex-col gap-4 border-slate-200 hover:border-brand/30 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-700 shadow-sm">
                        {int.icon}
                      </div>
                      {getStatusBadge(int.status)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900">{int.nome}</h4>
                        {int.crítica && <Badge variant="red" className="text-[9px] px-1 py-0 h-4 uppercase">Crítica</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Sincronização: {int.lastSync}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px]">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 font-medium truncate">{int.volume}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {int.impacto.map((imp) => (
                          <Badge key={imp} variant="slate" className="text-[9px] bg-slate-50 text-slate-600 border-slate-100 font-medium">
                            Alimenta: {imp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {int.status !== 'connected' && int.confianca < 100 && (
                      <div className={`text-[11px] font-bold p-2 rounded-lg border flex items-start gap-2 ${
                        int.status === 'error' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                      }`}>
                        <AlertCircle className={`w-3.5 h-3.5 mt-0.5 ${int.status === 'error' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div className="space-y-1">
                          <p className={int.status === 'error' ? 'text-red-900' : 'text-amber-900'}>Confiança: {int.confianca}%</p>
                          <p className={`font-medium ${int.status === 'error' ? 'text-red-700' : 'text-amber-700'}`}>Gargalo: {int.proximoPasso}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex gap-2">
                      {int.status === 'error' ? (
                        <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white">Corrigir Conector</Button>
                      ) : int.status === 'partial' ? (
                        <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">Revisar Mapeamento</Button>
                      ) : int.status === 'disconnected' ? (
                        <Button size="sm" className="flex-1 bg-brand text-white">Conectar Fonte</Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1 border-slate-200">Ver Impacto</Button>
                      )}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-8 rounded-[28px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">Auditando integridade do stack...</h2>
            <p className="text-white/70 text-sm mt-2">O Canopi monitora continuamente a qualidade dos dados para evitar alarmes falsos e garantir a precisão da IA.</p>
          </div>
          <button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 font-bold rounded-xl transition-all whitespace-nowrap">
            Baixar Relatório de Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;

