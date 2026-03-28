"use client";

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Filter, 
  Plus, 
  ChevronRight, 
  BarChart3, 
  Database, 
  Cpu, 
  Search, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Zap,
  Layout,
  Layers,
  Activity,
  Map,
  ShieldCheck,
  Globe,
  PieChart,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Bot,
  BadgeCheck,
  Users,
  Box,
  MessageSquare,
  FileText,
  Mail,
  Calendar,
  Eye,
  ArrowUpRight,
  MoreVertical,
  Flag,
  Maximize2,
  TrendingDown,
  BarChart,
  Building2,
  Cloud,
  BrainCircuit,
  Settings2,
  History,
  MousePointer2,
  Smartphone,
  Share2,
  Bell,
  CheckCircle,
  AlertCircle,
  FileSearch,
  ZapOff,
  Crosshair,
  Rocket,
  Handshake,
  Info,
  Network
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const benchmarks = [
  { id: 'reach', label: 'Target Account Reach', val: '72%', trend: '+15%', elite: 'Elite: 70%+', desc: 'Alcance total do comitê de compra' },
  { id: 'winrate', label: 'ABM Win Rate', val: '48%', trend: '+12%', elite: 'Elite: 45%+', desc: 'Taxa de fechamento vs marketing trad.' },
  { id: 'roi', label: 'Account-Based ROI', val: '432%', trend: '+5%', elite: 'Elite: 400%+', desc: 'Retorno financeiro por real investido' },
  { id: 'prog', label: 'Progression Rate', val: '42%', trend: '+8%', elite: 'Elite: 40%+', desc: 'Contas que avançaram no funil' },
];

const abmAccounts = [
  { id: '1',  initials: 'GB', name: 'Global Bank S.A.',   vertical: 'Financeiro',  fitScore: 9.8, status: 'HOT',       engagement: 92, mqa: true  },
  { id: '2',  initials: 'MN', name: 'Manufatura Norte',   vertical: 'Manufactura', fitScore: 7.5, status: 'PLAYBOOK',  engagement: 45, mqa: false },
  { id: '3',  initials: 'SB', name: 'ScalePay Brasil',    vertical: 'Financeiro',  fitScore: 9.2, status: 'MAPEANDO',  engagement: 88, mqa: true  },
  { id: '4',  initials: 'IH', name: 'Innova Health',      vertical: 'Saúde',       fitScore: 8.9, status: 'HOT',       engagement: 74, mqa: true  },
  { id: '5',  initials: 'AB', name: 'AlphaBank S.A.',     vertical: 'Financeiro',  fitScore: 9.0, status: 'HOT',       engagement: 85, mqa: true  },
  { id: '6',  initials: 'FP', name: 'FinPay Brasil',      vertical: 'Fintech',     fitScore: 8.7, status: 'HOT',       engagement: 80, mqa: true  },
  { id: '7',  initials: 'TM', name: 'TelecomMax',         vertical: 'Telecom',     fitScore: 8.4, status: 'MAPEANDO',  engagement: 72, mqa: true  },
  { id: '8',  initials: 'AG', name: 'AgroCloud',          vertical: 'Agronegócio', fitScore: 7.8, status: 'PLAYBOOK',  engagement: 68, mqa: false },
  { id: '9',  initials: 'IB', name: 'InfraBuild',         vertical: 'Construção',  fitScore: 7.2, status: 'MAPEANDO',  engagement: 60, mqa: false },
  { id: '10', initials: 'EC', name: 'EnergyCore',         vertical: 'Energia',     fitScore: 6.8, status: 'WATCH',     engagement: 42, mqa: false },
  { id: '11', initials: 'NS', name: 'NovaSaude',          vertical: 'Saúde',       fitScore: 7.0, status: 'MAPEANDO',  engagement: 55, mqa: false },
  { id: '12', initials: 'PT', name: 'PaperTech Ind.',     vertical: 'Indústria',   fitScore: 6.5, status: 'WATCH',     engagement: 38, mqa: false },
];

// ABM Priority accounts - scatter data: x=Impacto, y=Probabilidade (% de 0-100)
const scatterAccounts = [
  { id: 1,  x: 78, y: 82, label: '10', account: 'Global Bank S.A.',   vertical: 'Financeiro',  tier: 'TIER 1', arr: 'R$ 450k', action: 'Ação 1', risk: 'critical',  actionDesc: 'Reunião executiva + Proposta personalizada Finanças 4.0' },
  { id: 2,  x: 85, y: 88, label: '8',  account: 'ScalePay Brasil',    vertical: 'Financeiro',  tier: 'TIER 1', arr: 'R$ 280k', action: 'Ação 1', risk: 'critical',  actionDesc: 'Sequência de nurturing via LinkedIn + Social Ads 1:1' },
  { id: 3,  x: 62, y: 75, label: '9',  account: 'Innova Health',      vertical: 'Saúde',       tier: 'TIER 1', arr: 'R$ 620k', action: 'Ação 3', risk: 'high',      actionDesc: 'Webinar exclusivo Compliance HealthTech + Follow-up SDR' },
  { id: 4,  x: 90, y: 60, label: '12', account: 'TechInsure Co.',     vertical: 'Seguros',     tier: 'TIER 1', arr: 'R$ 390k', action: 'Ação 1', risk: 'high',      actionDesc: 'Conteúdo de prova social + Relatório ROI personalizado' },
  { id: 5,  x: 50, y: 68, label: '9',  account: 'AgroCloud Latam',    vertical: 'Agronegócio', tier: 'MID',    arr: 'R$ 170k', action: 'Ação 3', risk: 'high',      actionDesc: 'Demo guiada do produto + Parceria de canal' },
  { id: 6,  x: 38, y: 55, label: '10', account: 'Manufatura Norte',   vertical: 'Manufatura',  tier: 'MID',    arr: 'R$ 120k', action: 'Ação 4', risk: 'moderate', actionDesc: 'Relatório de eficiência operacional + Indicação interna' },
  { id: 7,  x: 25, y: 78, label: '10', account: 'EduTech S.A.',       vertical: 'Educação',    tier: 'MID',    arr: 'R$ 95k',  action: 'Ação 4', risk: 'moderate', actionDesc: 'Programa de trial + Parceria acadêmica' },
  { id: 8,  x: 70, y: 42, label: '4',  account: 'RetailMax Brasil',   vertical: 'Varejo',      tier: 'SMB',    arr: 'R$ 55k',  action: 'Ação 2', risk: 'moderate', actionDesc: 'Campanha de reengajamento por e-mail + Ads Remarketing' },
  { id: 9,  x: 55, y: 38, label: '9',  account: 'LogParcel Group',    vertical: 'Logística',   tier: 'SMB',    arr: 'R$ 72k',  action: 'Ação 2', risk: 'low',      actionDesc: 'Sequência de outbound fria com personalização por vertical' },
  { id: 10, x: 18, y: 32, label: '10', account: 'StartupX',           vertical: 'SaaS',        tier: 'SMB',    arr: 'R$ 30k',  action: 'Ação 4', risk: 'low',      actionDesc: 'Inclusão em newsletter + Trial gratuito' },
  { id: 11, x: 42, y: 22, label: '7',  account: 'GovTech MG',        vertical: 'Governo',     tier: 'SMB',    arr: 'R$ 48k',  action: 'Ação 2', risk: 'low',      actionDesc: 'Webinar público + Levantamento de necessidades via BDR' },
  { id: 12, x: 82, y: 28, label: '5',  account: 'MediaGroup Brasil', vertical: 'Mídia',       tier: 'SMB',    arr: 'R$ 42k',  action: 'Ação 2', risk: 'low',      actionDesc: 'Estratégia de conteúdo co-criado + Campanha de influência' },
];

// Hexbin: organic multi-hotspot distribution
const personas = ['CEO / Presidente', 'CFO / Dir. Finanças', 'CTO / Dir. TI', 'CMO / Dir. Mkt', 'COO / Dir. Ops', 'CISO / Seg. Info', 'VP Comercial', 'Head de Produto', 'Gerente de TI', 'Analista Sênior'];
const hexVerticals = ['Financeiro', 'Saúde', 'Manufatura', 'SaaS', 'Logística', 'Varejo', 'Seguros', 'Educação', 'Energia', 'Agroneg.'];

// Organic distribution: manually set hotspot intensities per (row=persona, col=vertical)
// Values 0..1 → color scale
const hexIntensityMap: Record<string, number> = {
  '0,0':0.95, '0,1':0.45, '0,2':0.35, '0,3':0.60, '0,4':0.30, '0,5':0.25, '0,6':0.70, '0,7':0.20, '0,8':0.40, '0,9':0.50,
  '1,0':0.85, '1,1':0.50, '1,2':0.30, '1,3':0.45, '1,4':0.20, '1,5':0.15, '1,6':0.65, '1,7':0.15, '1,8':0.35, '1,9':0.40,
  '2,0':0.55, '2,1':0.75, '2,2':0.60, '2,3':0.90, '2,4':0.55, '2,5':0.80, '2,6':0.40, '2,7':0.50, '2,8':0.30, '2,9':0.35,
  '3,0':0.40, '3,1':0.45, '3,2':0.35, '3,3':0.70, '3,4':0.30, '3,5':0.25, '3,6':0.35, '3,7':0.60, '3,8':0.25, '3,9':0.30,
  '4,0':0.50, '4,1':0.40, '4,2':0.85, '4,3':0.50, '4,4':0.75, '4,5':0.30, '4,6':0.45, '4,7':0.35, '4,8':0.60, '4,9':0.70,
  '5,0':0.60, '5,1':0.80, '5,2':0.45, '5,3':0.55, '5,4':0.35, '5,5':0.90, '5,6':0.55, '5,7':0.30, '5,8':0.25, '5,9':0.20,
  '6,0':0.70, '6,1':0.50, '6,2':0.40, '6,3':0.55, '6,4':0.45, '6,5':0.35, '6,6':0.80, '6,7':0.40, '6,8':0.50, '6,9':0.60,
  '7,0':0.45, '7,1':0.60, '7,2':0.70, '7,3':0.80, '7,4':0.50, '7,5':0.40, '7,6':0.35, '7,7':0.75, '7,8':0.30, '7,9':0.45,
  '8,0':0.30, '8,1':0.35, '8,2':0.55, '8,3':0.45, '8,4':0.65, '8,5':0.30, '8,6':0.40, '8,7':0.50, '8,8':0.85, '8,9':0.55,
  '9,0':0.20, '9,1':0.25, '9,2':0.40, '9,3':0.35, '9,4':0.50, '9,5':0.20, '9,6':0.30, '9,7':0.40, '9,8':0.60, '9,9':0.75,
};
const getHexCellColor = (intensity: number): string => {
  if (intensity >= 0.90) return '#c0392b';
  if (intensity >= 0.80) return '#e74c3c';
  if (intensity >= 0.70) return '#e67e22';
  if (intensity >= 0.60) return '#f39c12';
  if (intensity >= 0.50) return '#f9ca24';
  if (intensity >= 0.40) return '#a8e6cf';
  if (intensity >= 0.30) return '#27ae60';
  if (intensity >= 0.20) return '#2ecc71';
  return '#1abc9c';
};
const channelByIntensity = (v: number) => {
  if (v >= 0.80) return 'LinkedIn Ads 1:1 + Outreach Executive';
  if (v >= 0.60) return 'Email Marketing + Webinar Exclusivo';
  if (v >= 0.40) return 'Social Ads + Conteúdo Educacional';
  return 'Newsletter + Trial Gratuito';
};

const entryPlays = [
  { id: 'p1', title: 'Relatório Setorial Customizado', desc: 'Envio de PDF personalizado com comparativo de eficácia para C-Levels do setor Industrial.', efficacy: 88, icon: <FileText className="w-5 h-5" /> },
  { id: 'p2', title: 'Webinar de Mesa Redonda', desc: 'Convite exclusivo para diretores financeiros de Fintechs Mid-market discutirem Open Banking.', efficacy: 72, icon: <Users className="w-5 h-5" /> },
  { id: 'p3', title: 'Campanha Social Ads 1:1', desc: 'Ads altamente focados em dor específica de segurança de dados para o Tier 1 de HealthTech.', efficacy: 94, icon: <Layout className="w-5 h-5" /> },
];

const verticalClusters = [
  { id: 'v1', name: 'Manufatura Enterprise', count: 32, playbook: 'Eficiência Operacional 4.0', val: 85, health: 'Estável' },
  { id: 'v2', name: 'Fintech Mid-market', count: 48, playbook: 'Scaling High Velocity', val: 72, health: 'Em Queda' },
  { id: 'v3', name: 'HealthTech Tier 1', count: 15, playbook: 'Compliance & Privacy First', val: 94, health: 'Crítico' },
  { id: 'v4', name: 'AgroTech Expansion', count: 21, playbook: 'Penetração em Mercados de Alto Potencial', val: 67, health: 'Estável' },
];

const journeyTimeline = [
  { stage: 'Awareness', count: 142, status: 'complete', color: 'bg-blue-400' },
  { stage: 'Engagement', count: 85, status: 'active', color: 'bg-indigo-500' },
  { stage: 'MQA', count: 24, status: 'pending', color: 'bg-emerald-500' },
  { stage: 'Opportunity', count: 12, status: 'pending', color: 'bg-amber-500' },
  { stage: 'Win', count: 5, status: 'pending', color: 'bg-emerald-600' },
];



// ---- 6 ABM HEATMAPS DATA ----
const abmHeatmapAccounts = [
  // name, vertical, importance(y), icp, crm, verticalPot, contacts, fit, budget(R$k mapeado da base ABM)
  { id: 1,  name: 'AlphaBank S.A.',    vertical: 'Financeiro',  imp: 88, icp: 87, crm: 45, vp: 82, ct: 78, ft: 84, budget: 420 },
  { id: 2,  name: 'NovaSaude',         vertical: 'Saúde',       imp: 74, icp: 72, crm: 80, vp: 68, ct: 55, ft: 70, budget: 185 },
  { id: 3,  name: 'PaperTech Ind.',    vertical: 'Indústria',   imp: 60, icp: 58, crm: 62, vp: 75, ct: 90, ft: 55, budget: 90  },
  { id: 4,  name: 'MobilityPro',       vertical: 'Mobilidade',  imp: 50, icp: 45, crm: 35, vp: 60, ct: 40, ft: 48, budget: 60  },
  { id: 5,  name: 'AgroCloud',         vertical: 'Agronegócio', imp: 65, icp: 78, crm: 70, vp: 85, ct: 30, ft: 60, budget: 210 },
  { id: 6,  name: 'TelecomMax',        vertical: 'Telecom',     imp: 80, icp: 82, crm: 90, vp: 55, ct: 65, ft: 77, budget: 310 },
  { id: 7,  name: 'SeguraVida',        vertical: 'Seguros',     imp: 55, icp: 55, crm: 48, vp: 52, ct: 72, ft: 50, budget: 130 },
  { id: 8,  name: 'RetailTech',        vertical: 'Varejo',      imp: 42, icp: 38, crm: 55, vp: 40, ct: 35, ft: 38, budget: 45  },
  { id: 9,  name: 'EduVision',         vertical: 'Educação',   imp: 35, icp: 30, crm: 28, vp: 45, ct: 20, ft: 32, budget: 30  },
  { id: 10, name: 'InfraBuild',        vertical: 'Construção',  imp: 70, icp: 65, crm: 60, vp: 70, ct: 85, ft: 62, budget: 160 },
  { id: 11, name: 'FinPay Brasil',     vertical: 'Fintech',     imp: 85, icp: 90, crm: 85, vp: 78, ct: 60, ft: 88, budget: 380 },
  { id: 12, name: 'EnergyCore',        vertical: 'Energia',     imp: 62, icp: 50, crm: 42, vp: 90, ct: 48, ft: 56, budget: 250 },
];
const abmHeatmapCriteria = [
  {
    id: 'icp',
    title: 'ICP Score',
    subtitle: 'Aderência ao Perfil Ideal de Cliente',
    xLabel: 'SCORE ICP',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = aderência ao perfil ideal de cliente. Eixo Y = importância estratégica da conta. Contas no quadrante superior direito são prioridade máxima de abordagem.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
      `ICP ${a.icp}% — ${a.icp >= 75 ? 'Alta aderência ao perfil ideal. Prioridade máxima de abordagem.' : a.icp >= 50 ? 'Aderência moderada. Qualificar antes de avançar.' : 'Fora do perfil. Manter em nurturing passivo.'}`,
    scoreKey: 'icp' as const,
  },
  {
    id: 'crm',
    title: 'Engajamento no CRM',
    subtitle: 'Histórico de interações e atividade registrada',
    xLabel: 'NÍVEL DE ENGAJAMENTO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = volume de interações registradas no CRM (calls, e-mails, demos). Eixo Y = relevância da conta. Contas acima de 70% de engajamento devem ser ativadas via SDR imediatamente.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
      `Engajamento ${a.crm}% — ${a.crm >= 70 ? 'Conta ativa com múltiplas interações. Acionar SDR imediatamente.' : a.crm >= 45 ? 'Engajamento médio. Intensificar conteúdo 1:1.' : 'Conta fria. Iniciar reativação com campanha de reconhecimento.'}`,
    scoreKey: 'crm' as const,
  },
  {
    id: 'vp',
    title: 'Potencial da Vertical',
    subtitle: 'Mercado endereçável e sinergia com nosso portfólio',
    xLabel: 'POTENCIAL DE MERCADO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Cada bolha representa uma vertical de mercado. Eixo X = potencial de expansão e TAM da vertical. Eixo Y = peso estratégico. Verticais no quadrante quente indicam onde concentrar budget de marketing.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
      `Vertical ${a.vp}% — ${a.vp >= 75 ? 'Vertical de alta tração. Há benchmarks e cases aplicáveis.' : a.vp >= 50 ? 'Potencial moderado. Desenvolver case específico.' : 'Vertical emergente. Avaliar ROI antes de investir.'}`,
    scoreKey: 'vp' as const,
  },
  {
    id: 'ct',
    title: 'Contatos Mapeados',
    subtitle: 'Profundidade e qualidade dos relacionamentos na conta',
    xLabel: 'COBERTURA DE CONTATOS',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = cobertura do DMU (Decision Making Unit) — percentual de stakeholders mapeados na conta. Priorize contas estratégicas com baixa cobertura: maior gap, maior oportunidade de expansão.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
      `Contatos ${a.ct}% — ${a.ct >= 75 ? 'DMU bem mapeado. Champion e Decisor identificados.' : a.ct >= 45 ? 'Contatos parciais. Expandir rede via LinkedIn Sales Nav.' : 'Poucos contatos. Estratégia de entrada via eventos ou parceiros.'}`,
    scoreKey: 'ct' as const,
  },
  {
    id: 'ft',
    title: 'Fit com a Canopi',
    subtitle: 'Alinhamento tecnológico, cultural e de timing',
    xLabel: 'FIT CANOPI',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Eixo X = alinhamento da conta com o stack tecnológico, maturidade analítica e timing comercial da Canopi. Contas com fit alto e importância alta são candidatas a fast-track no pipeline.',
    desc: (a: typeof abmHeatmapAccounts[0]) =>
      `Fit ${a.ft}% — ${a.ft >= 75 ? 'Fit excelente. Stack tecnológica e maturidade analítica alinhadas.' : a.ft >= 50 ? 'Fit parcial. Identificar gaps e propor roadmap gradual.' : 'Fit baixo. Considerar parceiros integradores antes de avançar.'}`,
    scoreKey: 'ft' as const,
  },
  {
    id: 'avg',
    title: 'Média Geral',
    subtitle: 'Score consolidado dos 5 critérios — ranking ABM',
    xLabel: 'SCORE CONSOLIDADO',
    yLabel: 'IMPORTÂNCIA ESTRATÉGICA',
    note: 'Score composto = média de ICP, Engajamento CRM, Potencial da Vertical, Contatos Mapeados e Fit Canopi. Contas acima de 72% são classificadas como TOP TIER e recebem SDR + AE dedicados.',
    desc: (a: typeof abmHeatmapAccounts[0]) => {
      const avg = Math.round((a.icp + a.crm + a.vp + a.ct + a.ft) / 5);
      return `Média ${avg}% — ${avg >= 72 ? 'TOP TIER: Alocar SDR + AE dedicados. Iniciar play imediatamente.' : avg >= 55 ? 'MID TIER: Incluir em sequência nurturing avançada.' : 'LOW TIER: Manter em watch list e reavaliar em 90 dias.'}`;
    },
    scoreKey: 'avg' as const,
  },
];
// Helper to get score for 'avg'
const getHmScore = (acc: typeof abmHeatmapAccounts[0], key: string): number => {
  if (key === 'avg') return Math.round((acc.icp + acc.crm + acc.vp + acc.ct + acc.ft) / 5);
  return acc[key as keyof typeof acc] as number;
};

export const ABMStrategy: React.FC<{subPage?: string}> = ({ subPage }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);
  const [hmTooltip, setHmTooltip] = useState<any>(null);
  // Sliders reativos
  const [icpThreshold, setIcpThreshold] = useState(70);
  const [icpWeights, setIcpWeights] = useState({ receita: 30, stack: 25, equipe: 20, setor: 25 });
  const [budgetAlloc, setBudgetAlloc] = useState({ financeiro: 35, saude: 20, agro: 18, telecom: 15, outros: 12 });
  const totalBudget = 480; // R$480k budget total ABM mapeado da base
  // Score ICP ponderado pelos pesos configurados (normalizado 0-100)
  const getWeightedIcp = (acc: typeof abmHeatmapAccounts[0]) => {
    const base = acc.icp;
    const weightedDelta = ((icpWeights.receita - 30) * 0.4 + (icpWeights.stack - 25) * 0.3 + (icpWeights.equipe - 20) * 0.2 + (icpWeights.setor - 25) * 0.3) / 10;
    return Math.max(1, Math.min(99, Math.round(base + weightedDelta)));
  };

  const openDetailedModal = (type: string, data: any) => {
    let content;
    switch(type) {
      case 'ACCOUNT':
        content = (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-lg shadow-sm">
                {data.initials}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{data.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.industry} • TIER 1</p>
              </div>
              <Badge variant="emerald" className="ml-auto">HOT ACCOUNT</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Users className="w-3 h-3"/> Comitê de Compra</p>
                <div className="space-y-3">
                  {[{ role: 'Champion', name: 'Ana Souza', status: 'Engajada' }, { role: 'Buyer', name: 'Marcos Reais', status: 'Conectado' }, { role: 'Influencer', name: 'Carla Dias', status: 'Pendente' }].map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">{p.role}</span>
                      <span className="text-[10px] font-bold text-slate-900 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Settings2 className="w-3 h-3"/> Tech Match</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="blue" className="bg-blue-50 text-blue-600 border-none text-[9px]">AWS Cloud</Badge>
                  <Badge variant="blue" className="bg-indigo-50 text-indigo-600 border-none text-[9px]">Salesforce CRM</Badge>
                  <Badge variant="blue" className="bg-purple-50 text-purple-600 border-none text-[9px]">Hubspot Inbound</Badge>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 fill-amber-400 text-amber-400"/> Next Best Action</h5>
                <Badge variant="slate" className="bg-white/10 text-white border-none text-[8px]">IA SUGGESTION</Badge>
              </div>
              <p className="text-sm font-medium mb-4 text-slate-300">Enviar convite para mesa redonda de C-Levels sobre Finanças 4.0. Ana Souza (Champion) demonstrou interesse em posts relacionados ontem.</p>
              <Button size="sm" className="w-full bg-blue-600 border-none font-bold">Agendar via SDR</Button>
            </div>
          </div>
        );
        setModalData({ title: `Estratégia: ${data.name}`, content, size: 'lg' });
        break;
      case 'METRIC':
        content = (
          <div className="space-y-6">
             <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{data.label}</p>
                <p className="text-3xl font-bold text-slate-900">{data.val}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{data.desc}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase">vs Métodos Tradicionais</h5>
                   <div className="flex items-end gap-3 h-32">
                      <div className="w-10 bg-slate-200 rounded-t-lg h-12 flex items-center justify-center"><span className="text-[10px] -rotate-90 font-bold">Trad.</span></div>
                      <div className="w-10 bg-blue-600 rounded-t-lg h-[90%] flex items-center justify-center"><span className="text-[10px] -rotate-90 font-bold text-white">ABM</span></div>
                   </div>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase">↑ 2.4x Eficiência</p>
                </div>
                <div className="space-y-2">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase">Benchmark Elite</h5>
                   <p className="text-sm font-bold text-slate-900">{data.elite}</p>
                </div>
            </div>
          </div>
        );
        setModalData({ title: `Analítico: ${data.label}`, content, size: 'md' });
        break;
      case 'PLAY':
         content = (
            <div className="space-y-6">
               <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">{data.icon}</div>
                  <div>
                     <h4 className="text-lg font-bold text-slate-900">{data.title}</h4>
                     <p className="text-xs text-slate-500 font-medium tracking-tight">Eficácia Estimada: {data.efficacy}%</p>
                  </div>
               </div>
               <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase">Roteiro de Ativação</h5>
                  {[
                     { step: '1', task: 'Validar lista de contatos no LinkedIn Sales Navigator' },
                     { step: '2', task: 'Disparar e-mail 1:1 personalizado com o Champion' },
                     { step: '3', task: 'Ativar Social Ads focados no cluster Manufatura' },
                     { step: '4', task: 'Ligação de agendamento via BDR/SDR' }
                  ].map((s, i) => (
                     <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-none">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">{s.step}</div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{s.task}</p>
                     </div>
                  ))}
               </div>
               <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase shadow-lg shadow-slate-900/10">Orquestrar Agora</Button>
            </div>
         );
         setModalData({ title: `Playbook: ${data.title}`, content });
         break;
      case 'CLUSTER':
         content = (
            <div className="space-y-6">
               <div className="flex justify-between items-start p-6 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                  <div>
                     <h4 className="text-xl font-bold uppercase tracking-tight">{data.name}</h4>
                     <p className="text-[10px] font-bold opacity-80 mt-1">{data.count} CONTAS ATIVAS NO CLUSTER</p>
                  </div>
                  <Badge variant="slate" className="bg-white/20 text-white border-none text-[9px] font-bold uppercase">{data.health}</Badge>
               </div>
               <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase">Resumo de Atividade</h5>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Engajamento Médio</p>
                        <p className="text-lg font-bold text-slate-900">{data.val}%</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Novas MQAs (7d)</p>
                        <p className="text-lg font-bold text-emerald-600">+4</p>
                     </div>
                  </div>
                  <div className="pt-4">
                     <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3"><Layout className="w-3 h-3"/> Playbook Ativo</p>
                     <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">{data.playbook}</p>
                  </div>
               </div>
               <Button className="w-full bg-blue-600 text-white rounded-xl py-6 font-bold uppercase shadow-lg shadow-blue-500/20">Expandir Cluster</Button>
            </div>
         );
         setModalData({ title: `Análise de Cluster: ${data.name}`, content });
         break;
      case 'PRIORITY_POINT':
        const riskColors: Record<string, string> = { critical: 'bg-red-600', high: 'bg-orange-500', moderate: 'bg-yellow-400', low: 'bg-green-500' };
        const riskLabels: Record<string, string> = { critical: 'Crítico', high: 'Alto Risco', moderate: 'Moderado', low: 'Baixo Risco' };
        const riskTexts: Record<string, string> = { critical: 'text-red-600', high: 'text-orange-500', moderate: 'text-yellow-600', low: 'text-green-600' };
        content = (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">{data.account}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{data.vertical} • {data.tier}</p>
              </div>
              <div className={`${riskColors[data.risk]} text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg`}>{riskLabels[data.risk]}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">ARR Potencial</p>
                <p className="text-sm font-bold text-slate-900">{data.arr}</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Probabilidade</p>
                <p className={`text-sm font-bold ${riskTexts[data.risk]}`}>{data.y}%</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Impacto Score</p>
                <p className="text-sm font-bold text-slate-900">{data.x}/100</p>
              </div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> Ação Recomendada ({data.action})</h5>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{data.actionDesc}</p>
            </div>
            <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><BrainCircuit className="w-3 h-3 fill-blue-400 text-blue-400" /> Próximos Passos (IA)</h5>
              <div className="space-y-3">
                {['Mapear Comitê de Compra (DMU) no LinkedIn Sales Navigator', 'Criar sequência de abordagem personalizada por perfil de cargo', 'Ativar play de intenção com conteúdo setorial exclusivo'].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              <Button size="sm" className="w-full bg-blue-600 border-none font-bold mt-2">Lançar Sequência de Ativação</Button>
            </div>
          </div>
        );
        setModalData({ title: `Análise de Conta: ${data.account}`, content, size: 'md' });
        break;
      case 'HEX_CELL':
        const scoreDisplay = data.score as number;
        const hexRisk = scoreDisplay >= 80 ? 'Muito Alta' : scoreDisplay >= 60 ? 'Moderada' : scoreDisplay >= 40 ? 'Baixa' : 'Muito Baixa';
        const hexColor = scoreDisplay >= 80 ? '#c0392b' : scoreDisplay >= 60 ? '#f39c12' : scoreDisplay >= 40 ? '#27ae60' : '#1abc9c';
        const contentTypes: Record<string, string[]> = {
          'LinkedIn Ads 1:1 + Outreach Executive': ['Case Study Executivo', 'Convite para Evento Exclusivo', 'Insights de Mercado Personalizados'],
          'Email Marketing + Webinar Exclusivo': ['Newsletter Setorial', 'Webinar Temático', 'Relatório de Benchmark'],
          'Social Ads + Conteúdo Educacional': ['Article LinkedIn', 'Infográfico de Setor', 'Mini-curso Online'],
          'Newsletter + Trial Gratuito': ['Trial Freemium', 'Post Educacional', 'White Paper'],
        };
        const contents = contentTypes[data.channel as string] || ['Conteúdo genérico'];
        content = (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 rounded-2xl" style={{ backgroundColor: hexColor + '15', border: `1px solid ${hexColor}30` }}>
              <div>
                <h4 className="text-base font-bold text-slate-900 uppercase">{data.persona}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Vertical: {data.vertical}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: hexColor }}>{scoreDisplay}%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Sinergia {hexRisk}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Canal Principal</p>
                <p className="text-xs font-bold text-slate-800">{data.channel}</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Abordagem</p>
                <p className="text-xs font-bold text-slate-800">{scoreDisplay >= 60 ? '1:1 Personalizada' : 'Nurturing Escalável'}</p>
              </div>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase">Conteúdos Recomendados</h5>
              {contents.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: hexColor }}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{c}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Estimativa de Tempo de Resposta</p>
              <p className="text-sm font-bold text-slate-900">{scoreDisplay >= 80 ? '3-7 dias' : scoreDisplay >= 60 ? '7-14 dias' : scoreDisplay >= 40 ? '14-30 dias' : '+30 dias'}</p>
            </div>
            <Button className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold uppercase">Criar Sequência para Esta Combinação</Button>
          </div>
        );
        setModalData({ title: `Sinergia: ${data.persona} x ${data.vertical}`, content, size: 'md' });
        break;
      case 'EXPORT':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-4 bottom-4 opacity-10"><FileText className="w-24 h-24"/></div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Exportar Lista ABM</p>
              <h4 className="text-xl font-bold">{data.label || 'Ranking ABM'}</h4>
              <p className="text-[11px] opacity-70 mt-1">{142} registros prontos para exportação</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase">Colunas a incluir</h5>
              {[
                {col:'Empresa', checked:true}, {col:'ICP Score', checked:true}, {col:'CRM Engajamento', checked:true},
                {col:'Potencial de Vertical', checked:true}, {col:'Contatos Mapeados', checked:false},
                {col:'Fit Canopi', checked:true}, {col:'Nota Média', checked:true},
              ].map((c,i)=>(
                <label key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" defaultChecked={c.checked} className="accent-blue-600 w-3.5 h-3.5"/>
                  <span className="text-[9px] font-bold text-slate-700">{c.col}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['CSV', 'Salesforce', 'HubSpot'].map((fmt,i)=>(
                <button key={i} className={`p-3 rounded-xl border text-center text-[9px] font-bold transition-colors ${i===0?'bg-blue-600 text-white border-blue-600':'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>{fmt}</button>
              ))}
            </div>
            <Button className="w-full bg-blue-600 text-white rounded-xl py-6 font-bold uppercase">Gerar Exportação</Button>
          </div>
        );
        setModalData({ title: 'Exportar Lista ABM', content, size: 'md' });
        break;

      case 'ASSIGN':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Atribuição de Contas</p>
              <h4 className="text-xl font-bold">Selecionar Account Executive</h4>
              <p className="text-[11px] opacity-80 mt-1">23 contas TOP TIER sem AE atribuído</p>
            </div>
            <div className="space-y-3">
              {[
                {name:'Rafael Mendes', role:'AE Enterprise', load:8, max:12, avatar:'RM', color:'bg-blue-600'},
                {name:'Carolina Lima', role:'AE Mid-Market', load:11, max:12, avatar:'CL', color:'bg-violet-600'},
                {name:'Diego Faria', role:'AE Estratégico', load:5, max:10, avatar:'DF', color:'bg-emerald-600'},
                {name:'Juliana Costa', role:'AE SMB', load:9, max:15, avatar:'JC', color:'bg-amber-600'},
              ].map((ae,i)=>(
                <label key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-all shadow-sm group">
                  <input type="radio" name="ae" className="accent-indigo-600" defaultChecked={i===2}/>
                  <div className={`w-9 h-9 rounded-xl ${ae.color} text-white font-black text-[11px] flex items-center justify-center shrink-0`}>{ae.avatar}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{ae.name}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{ae.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-700">{ae.load}/{ae.max}</p>
                    <div className="w-14 h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-full bg-indigo-400 rounded-full" style={{width:`${(ae.load/ae.max)*100}%`}}/></div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">contas</p>
                  </div>
                </label>
              ))}
            </div>
            <Button className="w-full bg-indigo-600 text-white rounded-xl py-6 font-bold uppercase">Confirmar Atribuição</Button>
          </div>
        );
        setModalData({ title: 'Atribuir Account Executive', content, size: 'lg' });
        break;

      case 'GOAL':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">OKR — Objetivo</p>
              <h4 className="text-xl font-bold">Criar Meta de Pipeline</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Objetivo (O)</label>
                <input type="text" defaultValue="Converter 15 contas Tier 1 em oportunidades até Q2 2025" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"/>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Resultado-Chave 1 (KR)</label>
                <input type="text" defaultValue="Atingir 80%+ de ICP qualificado nas 15 contas" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 outline-none"/>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Resultado-Chave 2 (KR)</label>
                <input type="text" defaultValue="Mapear 3+ contatos DMU por conta (Decision-Making Unit)" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Prazo</label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs bg-white">
                    <option>Q2 2025 (Jun 30)</option>
                    <option>Q3 2025 (Set 30)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Responsável</label>
                  <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs bg-white">
                    <option>Rafael Mendes</option>
                    <option>Diego Faria</option>
                  </select>
                </div>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 text-white rounded-xl py-6 font-bold uppercase">Registrar OKR no CRM</Button>
          </div>
        );
        setModalData({ title: 'Criar Meta de Pipeline (OKR)', content, size: 'lg' });
        break;

      case 'REACTIVATE':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-amber-500 shrink-0"/>
                <h4 className="text-sm font-bold text-amber-800">Reativar: {data.name || 'Conta Inativa'}</h4>
              </div>
              <p className="text-[10px] font-medium text-amber-600">Engajamento CRM: <strong>{data.crm || '28'}%</strong> · Última atividade: <strong>47 dias atrás</strong></p>
            </div>
            <div className="space-y-3">
              <h5 className="text-[9px] font-bold text-slate-400 uppercase">Escolha a abordagem de reativação</h5>
              {[
                {titulo:'Email Executivo Direto', desc:'Template 1:1 personalizado com insight sobre o setor da conta. Taxa de abertura estimada: 42%.', tag:'Recomendado', tagCor:'bg-emerald-100 text-emerald-700'},
                {titulo:'LinkedIn InMail + Conexão', desc:'Cold InMail via SDR com contexto de match de conteúdo recente publicado pela conta.', tag:'2° opção', tagCor:'bg-blue-100 text-blue-700'},
                {titulo:'Gifting / Direct Mail', desc:'Envio físico personalizado para o endereço da empresa. Alto impacto para contas acima de R$500k.', tag:'Alto custo', tagCor:'bg-amber-100 text-amber-700'},
              ].map((o,i)=>(
                <label key={i} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-amber-200 shadow-sm">
                  <input type="radio" name="react" className="accent-amber-500 mt-1" defaultChecked={i===0}/>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold text-slate-800">{o.titulo}</p>
                      <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${o.tagCor}`}>{o.tag}</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{o.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button className="w-full bg-amber-500 text-white rounded-xl py-6 font-bold uppercase">Iniciar Reativação</Button>
          </div>
        );
        setModalData({ title: `Playbook de Reativação`, content, size: 'lg' });
        break;

      case 'NEW_PLAY':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute right-4 bottom-4 opacity-10"><Layout className="w-20 h-20"/></div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Biblioteca de Playbooks</p>
              <h4 className="text-xl font-bold">Escolha ou crie um Play</h4>
            </div>
            <div className="space-y-2">
              {[
                {nome:'Expansão Tier 1', desc:'Email D0 + LinkedIn D2 + Cold Call D5 + Gift D10', verticais:'Finance, Tech', rodando:true, cor:'bg-red-600'},
                {nome:'Reengajamento C-Level', desc:'InMail personalizado + Evento VIP + Introdução indireta', verticais:'Saúde, Indústria', rodando:true, cor:'bg-violet-600'},
                {nome:'Nurturing Mid-Market', desc:'Conteúdo educativo semanal + Webinar mensal + SDR trimestral', verticais:'Todas', rodando:true, cor:'bg-blue-600'},
                {nome:'Upsell Champions', desc:'CS Touch + Caso de Sucesso + AE Check-in', verticais:'Tech, Seguros', rodando:false, cor:'bg-emerald-600'},
                {nome:'Cold Break Enterprise', desc:'PR/Conteúdo → Evento → Reabordagem com contexto', verticais:'Finance, Agro', rodando:false, cor:'bg-amber-600'},
              ].map((p,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-violet-200 cursor-pointer transition-all shadow-sm">
                  <div className={`w-2 h-full min-h-[40px] rounded-full ${p.cor} shrink-0`}/>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-slate-800">{p.nome}</p>
                      {p.rodando && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{p.desc}</p>
                    <p className="text-[8px] text-slate-300 mt-0.5">Verticais: {p.verticais}</p>
                  </div>
                  <button className="text-[8px] font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-violet-100 hover:text-violet-600 transition-colors shrink-0">{p.rodando ? 'Clonar' : 'Ativar'}</button>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase">Criar Novo Playbook</Button>
          </div>
        );
        setModalData({ title: 'Biblioteca de Playbooks ABM', content, size: 'xl' });
        break;

      case 'PERF':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Analytics de Playbooks</p>
              <h4 className="text-xl font-bold">Performance das Sequências</h4>
              <p className="text-[11px] opacity-80 mt-1">Últimos 30 dias · 3 plays ativos</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:'Taxa de Abertura', val:'47%', delta:'+6pp', cor:'text-emerald-600'},
                {label:'Taxa de Reply', val:'18%', delta:'+2pp', cor:'text-emerald-600'},
                {label:'Oportunidades Geradas', val:'11', delta:'+4', cor:'text-emerald-600'},
              ].map((m,i)=>(
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                  <p className="text-2xl font-black text-slate-900">{m.val}</p>
                  <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">{m.label}</p>
                  <p className={`text-[9px] font-bold mt-1 ${m.cor}`}>{m.delta} vs mês ant.</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h5 className="text-[9px] font-bold text-slate-400 uppercase">Desempenho por Play</h5>
              {[
                {nome:'Expansão Tier 1', abertura:62, reply:28, opps:7, cor:'bg-red-500'},
                {nome:'Reengajamento C-Level', abertura:45, reply:14, opps:3, cor:'bg-violet-500'},
                {nome:'Nurturing Mid-Market', abertura:38, reply:11, opps:1, cor:'bg-blue-500'},
              ].map((p,i)=>(
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-5 rounded-full ${p.cor} shrink-0`}/>
                    <p className="text-[10px] font-bold text-slate-800">{p.nome}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[{l:'Abertura',v:`${p.abertura}%`},{l:'Reply',v:`${p.reply}%`},{l:'Opps',v:p.opps}].map((m,j)=>(
                      <div key={j}><p className="text-sm font-black text-slate-800">{m.v}</p><p className="text-[7px] font-bold text-slate-400 uppercase">{m.l}</p></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase">Exportar Relatório de Performance</Button>
          </div>
        );
        setModalData({ title: 'Performance de Playbooks', content, size: 'xl' });
        break;

      case 'FAST_TRACK':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Fast-Track Pipeline</p>
              <h4 className="text-xl font-bold">Mover para Oportunidade</h4>
              <p className="text-[11px] opacity-80 mt-1">{abmHeatmapAccounts?.filter((a:{ft:number})=>a.ft>=75).length || 6} contas com Fit ≥75% elegíveis para avanço imediato</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <h5 className="text-[9px] font-bold text-slate-400 uppercase">Contas selecionadas para fast-track</h5>
              {(abmHeatmapAccounts || []).filter((a:{ft:number})=>a.ft>=75).slice(0,4).map((acc:{id:number,name:string,ft:number,budget:number},i:number)=>(
                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-800">{acc.name}</p>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase">Fit {acc.ft}% · Budget R${acc.budget}k</p>
                  </div>
                  <div className="text-right">
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="accent-emerald-600 w-3.5 h-3.5"/>
                      <span className="text-[8px] font-bold text-slate-500">Incluir</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">Fase no CRM</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-white">
                  <option>Descoberta Qualificada</option>
                  <option>Proposta em Preparação</option>
                  <option>Negociação</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1.5">AE Responsável</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-white">
                  <option>Diego Faria (5/10)</option>
                  <option>Rafael Mendes (8/12)</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-emerald-600 text-white rounded-xl py-6 font-bold uppercase">Confirmar Fast-Track → CRM</Button>
          </div>
        );
        setModalData({ title: 'Fast-Track: Mover para Oportunidade', content, size: 'xl' });
        break;

      case 'LINKEDIN':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-[#0A66C2] rounded-2xl text-white shadow-lg shadow-blue-700/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">LinkedIn Sales Navigator</p>
              <h4 className="text-xl font-bold">Prospecção de Contatos DMU</h4>
              <p className="text-[11px] opacity-80 mt-1">Busca inteligente de contatos faltantes no comitê de decisão</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-[9px] font-bold text-slate-400 uppercase">Filtros de busca automáticos</h5>
              {[
                {filtro:'Empresa', valor:'TechCorp, IndPrev, AgroX + 6 contas com gap'},
                {filtro:'Cargo', valor:'CEO, CFO, VP Comercial, Head de Compras'},
                {filtro:'Senioridade', valor:'Diretor / VP / C-Level'},
                {filtro:'Engajamento', valor:'Postou em LinkedIn nos últimos 30 dias'},
                {filtro:'Localização', valor:'São Paulo, Rio, Curitiba, Campinas'},
              ].map((f,i)=>(
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-[8px] font-black text-[#0A66C2] uppercase w-16 shrink-0">{f.filtro}</span>
                  <span className="text-[9px] font-medium text-slate-700">{f.valor}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600 shrink-0"/>
              <p className="text-[9px] font-medium text-blue-700">Estimativa: 18-26 contatos de decisão encontrados com esses filtros</p>
            </div>
            <Button className="w-full bg-[#0A66C2] text-white rounded-xl py-6 font-bold uppercase">Abrir no Sales Navigator</Button>
          </div>
        );
        setModalData({ title: 'LinkedIn Sales Navigator — Prospecção DMU', content, size: 'lg' });
        break;

      case 'POT_PRIORITY':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Sequência de Ataque — Potencial Máximo</p>
              <h4 className="text-xl font-black">Priorização de Cruzamentos</h4>
              <p className="text-[11px] font-medium opacity-80 mt-1">23 contas x 3 cargos com potencial {'>'}70% sem atividade nos últimos 14 dias</p>
            </div>
            <div className="space-y-3">
              {[
                {rank:1, combo:'Varejo × Diretor', score:91, action:'Direct Mail Executivo', horizon:'D+0'},
                {rank:2, combo:'Saúde × Gerente', score:87, action:'LinkedIn Outreach + Gift', horizon:'D+2'},
                {rank:3, combo:'Indústria × Coord.', score:82, action:'Cold Call SDR', horizon:'D+3'},
                {rank:4, combo:'Agro × Diretor', score:78, action:'Email Nurturing 1:1', horizon:'D+5'},
              ].map((r,i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 cursor-pointer transition-all">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center shrink-0">#{r.rank}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{r.combo}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{r.action} · {r.horizon}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">{r.score}</p>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-1"><div className="h-full bg-emerald-400 rounded-full" style={{width:`${r.score}%`}}/></div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-emerald-600 text-white rounded-xl py-6 font-bold uppercase shadow-lg shadow-emerald-500/20">Orquestrar Todos em Bloco</Button>
          </div>
        );
        setModalData({ title: 'Sequência de Ataque por Prioridade', content, size: 'lg' });
        break;

      case 'BUDGET_BREAKDOWN':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-violet-600 rounded-2xl text-white shadow-lg shadow-violet-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Budget Mapeado ABM</p>
              <h4 className="text-2xl font-black">R$ 480.000 <span className="text-[14px] font-medium opacity-80">total disponível</span></h4>
            </div>
            <div className="space-y-2">
              {[
                {label:'Financeiro', pct:35, val:'R$168k', color:'bg-violet-500'},
                {label:'Saúde', pct:20, val:'R$96k', color:'bg-blue-500'},
                {label:'Agro', pct:18, val:'R$86k', color:'bg-emerald-500'},
                {label:'Telecom', pct:15, val:'R$72k', color:'bg-amber-500'},
                {label:'Outros', pct:12, val:'R$58k', color:'bg-slate-300'},
              ].map((v,i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                  <div className="w-2 h-8 rounded-full shrink-0 " style={{background: v.color.replace('bg-','').replace('-500','')}} />
                  <div className={`w-2 h-8 rounded-full shrink-0 ${v.color}`}/>
                  <span className="text-xs font-bold text-slate-700 w-20">{v.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${v.color} rounded-full`} style={{width:`${v.pct}%`}}/>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{v.pct}%</span>
                  <span className="text-[10px] font-black text-slate-800 w-14 text-right">{v.val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-violet-600 text-white rounded-xl font-bold">Rebalancear Budget</Button>
              <Button variant="ghost" className="border border-slate-200 rounded-xl font-bold px-6">Exportar</Button>
            </div>
          </div>
        );
        setModalData({ title: 'Breakdown de Budget por Vertical', content, size: 'md' });
        break;

      case 'BATCH_POT':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold uppercase tracking-tight">Orquestração em Lote</h4>
                <Badge variant="emerald" className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border-none">23 CONTAS</Badge>
              </div>
              <p className="text-[11px] font-medium text-slate-300">Contas com Potencial {'>'}70% sem atividade nos últimos 14 dias — prontas para ativação imediata</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase">Linha do Tempo de Ativação</h5>
              {[
                {d:'D+0', action:'Direct Mail para Diretores de Varejo', icon:'📧', active:true},
                {d:'D+2', action:'LinkedIn Ads segmentados por vertical', icon:'💼', active:false},
                {d:'D+5', action:'SDR Cold Call para Gerentes de Saúde', icon:'📞', active:false},
                {d:'D+7', action:'Conteúdo educativo par Coordenadores', icon:'📄', active:false},
              ].map((s,i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.active ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${s.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.d}</div>
                  <span className="text-[10px] font-medium text-slate-700">{s.icon} {s.action}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase">Lançar Sequência Imediatamente</Button>
          </div>
        );
        setModalData({ title: 'Orquestração em Lote — Potencial >70%', content, size: 'lg' });
        break;

      case 'RAPPORT_EMAIL':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Template de Email de Rapport</p>
              <h4 className="text-base font-bold">Personalizado por Cargo</h4>
            </div>
            <div className="space-y-3">
              {[
                {cargo:'C-Level', assunto:'[Nome], insights exclusivos sobre [Vertical] para 2025', linha:'Caro [Nome], dado nosso trabalho com [empresa similar], mapeamos uma oportunidade específica para [empresa]...', vibe:'Executivo · Estratégico', cor:'text-violet-600 bg-violet-50'},
                {cargo:'Gerente', assunto:'[Nome], benchmark operacional que pode impactar seu time', linha:'Olá [Nome], estamos trabalhando com equipes de [área] em [setor] e encontramos um padrão recorrente...', vibe:'Técnico · Prático', cor:'text-blue-600 bg-blue-50'},
                {cargo:'Analista', assunto:'Ferramenta gratuita para [dor específica do cargo]', linha:'Oi [Nome], sei que você lida diariamente com [dor]. Desenvolvemos algo que pode simplificar isso...', vibe:'Direto · Funcional', cor:'text-emerald-600 bg-emerald-50'},
              ].map((t,i) => (
                <div key={i} className={`p-4 rounded-2xl border ${t.cor.split(' ')[1]} border-transparent`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold uppercase ${t.cor.split(' ')[0]}`}>{t.cargo}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${t.cor}`}>{t.vibe}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-700 mb-1">Assunto: {t.assunto}</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{t.linha}</p>
                </div>
              ))}
            </div>
            <Button className="w-full bg-blue-600 text-white rounded-xl py-6 font-bold uppercase">Exportar para Sequência Outreach</Button>
          </div>
        );
        setModalData({ title: 'Templates de Email de Rapport por Cargo', content, size: 'lg' });
        break;

      case 'EVENTO_VIP':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <Badge variant="slate" className="bg-white/20 text-white border-none text-[9px] mb-3">PRÓXIMO · ABR 12</Badge>
              <h4 className="text-xl font-bold">Jantar de C-Levels</h4>
              <p className="text-[11px] font-medium opacity-80">Saúde & Indústria · 12 vagas · 7 confirmadas</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{l:'Confirmados',v:'7',c:'text-emerald-600 bg-emerald-50'},{l:'Pendentes',v:'3',c:'text-amber-600 bg-amber-50'},{l:'Convidados',v:'12',c:'text-blue-600 bg-blue-50'}].map((s,i)=>(
                <div key={i} className={`p-3 rounded-2xl text-center ${s.c.split(' ')[1]}`}>
                  <p className={`text-2xl font-black ${s.c.split(' ')[0]}`}>{s.v}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase">Roteiro do Evento</h5>
              {[
                {h:'19:00', a:'Recepção e welcome drink exclusivo'},
                {h:'19:45', a:'Mesa redonda: Tendências Financeiras 2025'},
                {h:'21:00', a:'Jantar temático — networking 1:1 facilitado'},
                {h:'22:30', a:'Sessão de insights Canopi + Q&A'},
              ].map((s,i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[9px] font-black text-indigo-600 w-10 shrink-0">{s.h}</span>
                  <span className="text-[9px] font-medium text-slate-600">{s.a}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-indigo-600 text-white rounded-xl font-bold">Gerenciar Inscrições</Button>
              <Button variant="ghost" className="border border-slate-200 rounded-xl font-bold px-5">Enviar Lembretes</Button>
            </div>
          </div>
        );
        setModalData({ title: 'Evento VIP — Jantar de C-Levels', content, size: 'lg' });
        break;

      case 'BREAKICE_PLAY':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Receptividade Crítica — Finance & Seguros</h4>
                  <p className="text-[10px] font-medium text-amber-600 mt-1">C-Levels abaixo de 35% de abertura. Abordagem direta falhou em 8/10 tentativas recentes.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {step:'1', title:'Conteúdo de Alta Autoridade', desc:'Publicar white paper "Riscos Operacionais Financeiros 2025" com assinatura de analista Canopi + parceiro do setor', tipo:'Conteúdo', dias:'Hoje'},
                {step:'2', title:'Patrocínio de Evento Setorial', desc:'Associar a marca Canopi a evento finance de Março — garantir presença e fala de 5min no palco principal', tipo:'Evento', dias:'30 dias'},
                {step:'3', title:'Menção por Terceiros (PR)', desc:'Ativar assessora de imprensa para publicar case anonymizado em veículo finance (Razão Contábil, Exame, etc)', tipo:'PR', dias:'45 dias'},
                {step:'4', title:'Reabordagem com Contexto', desc:'Após steps 1-3, o C-Level já terá ouvido a Canopi de 3 fontes diferentes. Reabordar com referência específica.', tipo:'Outreach', dias:'60 dias'},
              ].map((s,i) => (
                <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 font-black text-[11px] flex items-center justify-center shrink-0">{s.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-bold text-slate-800">{s.title}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{s.dias}</span>
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase">Ativar Playbook de Quebra-Gelo</Button>
          </div>
        );
        setModalData({ title: 'Playbook de Quebra-Gelo — Finance & Seguros', content, size: 'xl' });
        break;

      case 'FLYWHEEL_INBOUND':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Flywheel de Inbound</p>
              <h4 className="text-xl font-bold">Ativação para Rotas Livres</h4>
              <p className="text-[11px] opacity-80 mt-1">Camadas de Analistas e Especialistas têm 87% de taxa de abertura de email e nenhum Gatekeeper mapeado</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:'Agro → Analista', pct:92, canal:'LinkedIn Ads'},
                {label:'Saúde → Espec.', pct:88, canal:'Cold Email'},
                {label:'Telecom → Coord.', pct:79, canal:'SDR Call'},
                {label:'Varejo → Analista', pct:76, canal:'LinkedIn DM'},
              ].map((r,i)=>(
                <div key={i} className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[9px] font-bold text-emerald-800 mb-1">{r.label}</p>
                  <p className="text-lg font-black text-emerald-600">{r.pct}%</p>
                  <p className="text-[8px] font-bold text-emerald-400 uppercase">{r.canal}</p>
                </div>
              ))}
            </div>
            <Button className="w-full bg-emerald-600 text-white rounded-xl py-6 font-bold uppercase">Iniciar Flywheel Automaticamente</Button>
          </div>
        );
        setModalData({ title: 'Flywheel Inbound — Rotas Livres', content, size: 'md' });
        break;

      case 'GATEKEEPER_BYPASS':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
              <div>
                <h4 className="text-sm font-bold text-red-800">Playbook: Bypassar Gatekeepers</h4>
                <p className="text-[10px] font-medium text-red-500 mt-1">3 gatekeepers críticos identificados. Abordagem direta ao C-Level está bloqueada — use play de flanco.</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {titulo:'Wave 1: Bottom-Up via Analista', desc:'Conecte-se com 3 Analistas da conta via LinkedIn. Ofereça acesso gratuito a relatório setorial. Eles organicamente levam a informação ao Gerente.', icon:'📊'},
                {titulo:'Wave 2: Influenciador Lateral', desc:'Identifique alguém que conhece o C-Level fora do trabalho (associação setorial, evento passado). Peça uma introdução informal.', icon:'🤝'},
                {titulo:'Wave 3: Conteúdo + PR', desc:'Publicar insight relevante sobre a conta ou seu setor. Marcar o C-Level (não o Gatekeeper) em comentário. Gera atenção legítima.', icon:'📢'},
                {titulo:'Wave 4: Evento Neutro', desc:'Convidar o C-Level para mesa redonda setorial não-comercial. O Gatekeeper não filtra convites externos de prestígio.', icon:'🎯'},
              ].map((w,i)=>(
                <div key={i} className="flex gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <span className="text-2xl shrink-0">{w.icon}</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800 mb-0.5">{w.titulo}</p>
                    <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-red-600 text-white rounded-xl py-6 font-bold uppercase">Iniciar Operação de Bypass</Button>
          </div>
        );
        setModalData({ title: 'Playbook: Bypassar Gatekeepers', content, size: 'xl' });
        break;

      case 'DMU_HUNT':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">LinkedIn Sales Navigator</p>
              <h4 className="text-xl font-bold">Caçada de Compradores</h4>
              <p className="text-[11px] opacity-80 mt-1">Gap crítico: 3 verticais sem Procurement mapeado = ciclo de venda travado</p>
            </div>
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase">Filtros de Busca Recomendados</h5>
              {[
                {label:'Cargo', value:'"Gerente de Compras" OR "Procurement" OR "Supply Chain"'},
                {label:'Empresa', value:'TechCorp, IndPrev, AgroX, + 4 contas gap'},
                {label:'Senioridade', value:'Gerente / Coordenador / Diretor'},
                {label:'Última atividade', value:'Postou no LinkedIn nos últimos 30 dias'},
              ].map((f,i)=>(
                <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase w-16 shrink-0">{f.label}</span>
                  <span className="text-[9px] font-medium text-slate-700 font-mono">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>
              <p className="text-[9px] font-medium text-emerald-700">Estimativa: 11-17 contatos de Procurement a serem mapeados com esses filtros</p>
            </div>
            <Button className="w-full bg-amber-500 text-white rounded-xl py-6 font-bold uppercase">Abrir no Sales Navigator</Button>
          </div>
        );
        setModalData({ title: 'Caçada de Compradores — LinkedIn', content, size: 'lg' });
        break;

      case 'DETRACTOR_PLAN':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-slate-900 rounded-2xl text-white">
              <h4 className="text-xl font-bold mb-1">Plano de Neutralização</h4>
              <p className="text-[11px] font-medium text-slate-300">3 detratores ativos representam risco de bloqueio em contas de alto potencial</p>
            </div>
            {[
              {conta:'TechCorp', perfil:'Gerente TI', status:'BLOQUEIO ATIVO', cor:'bg-red-600', tactic:'Mapear Champion alternativo no mesmo nível. Pedir apoio ao CTO que já está engajado para fazer apresentação interna.'},
              {conta:'IndPrev', perfil:'Dir. Operações', status:'EM OBSERVAÇÃO', cor:'bg-amber-500', tactic:'Criar material técnico focado especificamente nas preocupações de Ops. Endereçar ROI de implantação diretamente com dados.'},
              {conta:'AgroX', perfil:'Coord. Compras', status:'ALERTA MÉDIO', cor:'bg-slate-400', tactic:'Incluir Coord. em webinar de melhores práticas. Gerar rapport antes da próxima proposta.'},
            ].map((d,i)=>(
              <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.conta}</p>
                    <p className="text-[9px] text-slate-400">{d.perfil}</p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-1 rounded-lg text-white ${d.cor}`}>{d.status}</span>
                </div>
                <p className="text-[9px] font-medium text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl">{d.tactic}</p>
              </div>
            ))}
            <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold uppercase">Registrar Plano no CRM</Button>
          </div>
        );
        setModalData({ title: 'Plano de Neutralização de Detratores', content, size: 'xl' });
        break;

      case 'AMBASSADOR_PLAY':
        content = (
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white shadow-xl shadow-orange-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Programa de Embaixadores</p>
              <h4 className="text-xl font-bold">8 Embaixadores Identificados</h4>
              <p className="text-[11px] opacity-80 mt-1">Tech (4) e Seguros (3) com alta densidade de promotores orgânicos da Canopi</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {titulo:'Incentivo Tech', desc:'Co-branded case study + menção em LinkedIn oficial Canopi', cor:'bg-blue-50 border-blue-100'},
                {titulo:'Incentivo Seguros', desc:'Acesso antecipado a nova feature + certificado de parceria', cor:'bg-amber-50 border-amber-100'},
                {titulo:'Referral Program', desc:'10% desconto na renovação por cada indicação ativa', cor:'bg-emerald-50 border-emerald-100'},
                {titulo:'Advisory Board', desc:'Convite para advisory board 2025 com 4 vagas disponíveis', cor:'bg-violet-50 border-violet-100'},
              ].map((p,i)=>(
                <div key={i} className={`p-4 rounded-2xl border ${p.cor}`}>
                  <p className="text-[10px] font-bold text-slate-800 mb-1">{p.titulo}</p>
                  <p className="text-[9px] font-medium text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
            <Button className="w-full bg-orange-500 text-white rounded-xl py-6 font-bold uppercase">Ativar Programa Formalmente</Button>
          </div>
        );
        setModalData({ title: 'Programa de Incentivo a Embaixadores', content, size: 'lg' });
        break;

      default:
        // Categóricas ricas baseadas no "type"
        const typeStr = String(type);
        const isForm = ['GOAL', 'OPP', 'SEG', 'CREATE_CLUSTER', 'CRM_ALERT', 'FUND', 'ALERT', 'CRM_UPDATE', 'ASSIGN', 'CANOPI', 'RSVP', 'PERF'].includes(typeStr);
        const isList = ['EXPORT', 'SYNC', 'HIST', 'SHARE', 'AUDIENCE', 'LOOKALIKE', 'REFINE_IA', 'ENR_IA', 'SEND_SALES', 'SS', 'REP'].includes(typeStr);
        const isCamp = ['BATCH', 'CAMP', 'SEQ', 'CAMP_REACT', 'EMAIL', 'CLEVEL_PLAY', 'PLAY', 'NEW_PLAY', 'SDR', 'AE'].includes(typeStr);
        const isAgenda = ['SCHED', 'ACTIVITY', 'CONNECT', 'DEMO', 'EVENT', 'EXEC_SYNC', 'GIFT'].includes(typeStr);
        
        let ui;

        if (isForm) {
            ui = (
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h5 className="text-sm font-bold text-slate-800">{data.label || 'Nova Entrada'}</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Preencha os dados necessários para o registro sistêmico.</p>
                 </div>
                 <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Nome / Referência</label>
                      <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500" defaultValue={data.account?.name || data.label} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Proprietário (Owner)</label>
                         <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"><option>SDR Team Lead</option><option>AE Enterprise</option></select>
                       </div>
                       <div>
                         <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Prioridade</label>
                         <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"><option>ALTA</option><option>NORMAL</option></select>
                       </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Anotações Adicionais</label>
                      <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs h-20" placeholder="Insira o contexto ou instruções..."></textarea>
                    </div>
                 </div>
              </div>
            );
        } else if (isList) {
            ui = (
              <div className="space-y-4">
                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-emerald-800">Preview de Dados (Sync)</h5>
                      <p className="text-[10px] text-emerald-600 mt-0.5">74 registros selecionados para {data.label}</p>
                    </div>
                    <Button size="sm" className="bg-emerald-600 text-white font-bold text-[9px] uppercase px-4 h-7">Validar Schema</Button>
                 </div>
                 <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50">
                          <tr><th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Objeto</th><th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Match Score</th><th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-right">Ação</th></tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 text-[10px] font-medium text-slate-700">
                          <tr><td className="px-3 py-2 font-bold">{data.account?.name || 'Globex Corporation'}</td><td className="px-3 py-2 text-emerald-600">98% Fit</td><td className="px-3 py-2 text-right"><span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Update</span></td></tr>
                          <tr><td className="px-3 py-2 font-bold">Acme Corp South</td><td className="px-3 py-2 text-blue-600">85% Fit</td><td className="px-3 py-2 text-right"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Insert</span></td></tr>
                          <tr><td className="px-3 py-2 font-bold">Initech Financial</td><td className="px-3 py-2 text-blue-600">77% Fit</td><td className="px-3 py-2 text-right"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Insert</span></td></tr>
                       </tbody>
                    </table>
                 </div>
                 <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0"/>
                    <p className="text-[9px] text-amber-700 font-medium">Atenção: A sincronização com Salesforce/Outreach consome tokens da API da Canopi.</p>
                 </div>
              </div>
            );
        } else if (isCamp) {
            ui = (
              <div className="space-y-4">
                 <div className="text-center p-6 border border-slate-100 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm relative overflow-hidden">
                    <Zap className="w-12 h-12 text-blue-200 absolute -right-2 -bottom-2" />
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"><Mail className="w-5 h-5"/></div>
                    <h5 className="text-base font-bold text-slate-800 tracking-tight">{data.label || 'Lançar Playbook'}</h5>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Esta ação ativará a orquestração multicanal (Email, LinkedIn, Ads) para as contas em lote.</p>
                 </div>
                 <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-3">Linha do Tempo de Ativação (Preview)</p>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[8px] font-bold z-10">D0</div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-blue-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]"><p className="text-[10px] font-bold text-slate-800">Email 1: Introdução Executiva</p></div>
                       </div>
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[8px] font-bold z-10">D3</div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-slate-100 bg-white"><p className="text-[10px] font-bold text-slate-600">LinkedIn: Visualização do SDR</p></div>
                       </div>
                       <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[8px] font-bold z-10">D5</div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-slate-100 bg-white"><p className="text-[10px] font-bold text-slate-600">Task CRM: Ligar para Champion</p></div>
                       </div>
                    </div>
                 </div>
              </div>
            );
        } else if (isAgenda) {
            ui = (
              <div className="space-y-4">
                 <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h5 className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2 mb-2">{data.label || 'Agendamento e Agenda'}</h5>
                    <div className="grid grid-cols-7 gap-1 mt-4">
                       {['D','S','T','Q','Q','S','S'].map((d,i)=><div key={i} className="text-center text-[8px] font-bold text-indigo-400">{d}</div>)}
                       {[...Array(30)].map((_,i)=><div key={i} className={`h-8 rounded flex items-center justify-center text-[10px] font-medium ${i===14 ? 'bg-indigo-600 text-white font-bold shadow-md' : i>10 && i<18 ? 'bg-indigo-100/50 text-indigo-800 hover:bg-indigo-200 cursor-pointer' : 'text-slate-400'}`}>{i+1}</div>)}
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Horários Disponíveis (15 Nov)</p>
                    <div className="flex gap-2">
                       <Button size="sm" variant="outline" className="flex-1 text-[10px]">10:00 AM</Button>
                       <Button size="sm" className="flex-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none font-bold text-[10px]">14:30 PM</Button>
                       <Button size="sm" variant="outline" className="flex-1 text-[10px]">16:00 PM</Button>
                    </div>
                 </div>
              </div>
            );
        } else {
            // Dashboard / Análise Genérica para o restante
            ui = (
              <div className="space-y-4">
                 <div className="p-5 bg-slate-900 rounded-xl relative overflow-hidden text-white shadow-xl">
                    <BarChart3 className="absolute right-[-20%] top-[-20%] w-48 h-48 opacity-10" />
                    <h5 className="text-lg font-bold tracking-tight mb-1">{data.label || 'Relatório Analítico'}</h5>
                    <p className="text-xs text-slate-400 font-medium max-w-[80%]">Visualização macro de gaps e engajamento da conta ou lote selecionado.</p>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Média Hit-Rate</p>
                       <p className="text-lg font-black text-slate-800">42%</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">CAC Est.</p>
                       <p className="text-lg font-black text-rose-500">R$3k</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Velocidade</p>
                       <p className="text-lg font-black text-emerald-500">+12d</p>
                    </div>
                 </div>
                 <div className="p-4 border border-slate-200 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-700 uppercase mb-3 text-center">Desempenho em 30 dias</p>
                    <div className="flex items-end justify-between h-16 pt-2">
                       {[30, 45, 20, 60, 85, 50, 95].map((v, i) => (
                          <div key={i} className="w-[10%] bg-blue-100 rounded-t-sm hover:bg-blue-300 transition-colors relative group">
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100">{v}</div>
                             <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${v}%` }}></div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            );
        }

        content = (
          <div className="space-y-6">
            {ui}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
               <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase text-slate-500" onClick={() => setModalOpen(false)}>Cancelar</Button>
               <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-6 border-none shadow-md shadow-blue-500/20" onClick={() => setModalOpen(false)}>{isForm ? 'Salvar Configuração' : isCamp ? 'Iniciar Sequência' : isAgenda ? 'Confirmar Agendamento' : 'Confirmar Ação Sistêmica'}</Button>
            </div>
          </div>
        );
        setModalData({ title: `${data.label || type}`, content, size: isList || isCamp ? 'lg' as any : 'md' as any });
        break;
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 max-w-[1700px] mx-auto font-sans text-slate-900">
      
      {/* 1. HERO - Discreet & Powerful */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
           <Activity className="w-64 h-64" />
        </div>
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Target className="w-8 h-8" />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estratégia Comercial</span>
                 <ChevronRight className="w-3 h-3 text-slate-300" />
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Growth Framework</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none uppercase">Estratégia ABM</h1>
              <p className="text-xs text-slate-500 font-medium mt-2 max-w-lg leading-relaxed">
                 Orquestração de contas-alvo baseada em fit firmográfico, tecnográfico e sinais de intenção em tempo real. Painel unificado de inteligência e plays táticos.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 z-10">
           <div className="px-6 py-2 text-center border-r border-slate-200">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Target Accounts</p>
              <p className="text-lg font-bold text-slate-900">142</p>
           </div>
           <div className="px-6 py-2 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Health Score</p>
              <p className="text-lg font-bold text-emerald-600">8.4/10</p>
           </div>
           <Button size="sm" className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-6 border-none" onClick={() => openDetailedModal('TAL_CONFIG', {})}>Refinar TAL</Button>
        </div>
      </div>

      {/* 2. ELITE BENCHMARKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {benchmarks.map((b, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            onClick={() => openDetailedModal('METRIC', b)}
            className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm relative group cursor-pointer hover:border-blue-400 transition-all"
          >
             <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                   <BarChart3 className="w-5 h-5" />
                </div>
                <Badge variant="emerald" className="text-[9px] font-bold border-none uppercase">{b.trend}</Badge>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{b.label}</p>
             <h3 className="text-3xl font-bold text-slate-900 mb-2">{b.val}</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{b.elite}</p>
          </motion.div>
        ))}
      </div>

      {/* GRID PRINCIPAL: TAL (7/12) + Funil ABM + Clusters (5/12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT: TAL TABLE compact */}
        <div className="xl:col-span-7">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase">Universo de Contas (TAL)</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Interações, Fit e Maturidade do Pipeline ABM</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-[10px] font-bold text-slate-400 uppercase"><Filter className="w-3 h-3 mr-1.5"/>Filtros</Button>
                <Button size="sm" className="bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase py-1.5 px-4 border-none shadow-lg shadow-blue-500/20">Nova Conta</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="pl-6 py-3 text-[9px] font-bold text-slate-500 uppercase">Account / Vertical</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase text-center">Score</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase text-center">MQA</th>
                    <th className="px-3 py-3 text-[9px] font-bold text-slate-500 uppercase">Engaj.</th>
                    <th className="pr-6 py-3 text-[9px] font-bold text-slate-500 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {abmAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => openDetailedModal('ACCOUNT', acc)}>
                      <td className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs group-hover:border-blue-400 transition-all shadow-sm">{acc.initials}</div>
                          <div><p className="text-xs font-bold text-slate-800">{acc.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{acc.vertical}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center"><span className="text-xs font-bold text-slate-900">{acc.fitScore}</span></td>
                      <td className="px-3 py-3.5 text-center">
                        {acc.mqa ? (<div className="flex justify-center"><BadgeCheck className="w-4 h-4 text-emerald-500" /></div>) : (<div className="flex justify-center"><Circle className="w-4 h-4 text-slate-200" /></div>)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className={`h-full ${acc.engagement > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${acc.engagement}%` }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-900">{acc.engagement}%</span>
                        </div>
                      </td>
                      <td className="pr-6 py-3.5 text-right"><Badge variant={acc.status === 'HOT' ? 'emerald' : 'slate'} className="text-[8px] font-bold uppercase border-none">{acc.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Funil ABM + Clusterização */}
        <div className="xl:col-span-5 space-y-5">
          {/* FUNIL ABM */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Jornada de Contas (Funil ABM)</h3>
              <Badge variant="slate" className="bg-slate-50 text-slate-400 border-none font-bold text-[8px] uppercase tracking-tighter">PROGRESSION</Badge>
            </div>
            <div className="space-y-3.5">
              {journeyTimeline.map((j, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{j.stage}</div>
                  <div className="flex-1 relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(j.count / journeyTimeline[0].count) * 100}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className={`h-full ${j.color} shadow-sm`}></motion.div>
                  </div>
                  <div className="w-8 text-right text-[11px] font-bold text-slate-900">{j.count}</div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Velocity Index ABM</p>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase"><TrendingUp className="w-3 h-3" /> 15% ACCEL.</div>
              </div>
            </div>
          </div>

          {/* CLUSTERIZAÇÃO */}
          <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 bg-slate-50/20 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2"><Box className="w-4 h-4 text-blue-600" /> Clusterização ABM</h3>
              <Button variant="ghost" size="sm" className="text-[9px] font-bold text-slate-400 uppercase">+ Novo</Button>
            </div>
            <div className="p-5 space-y-3">
              {verticalClusters.map((c, i) => (
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-300 transition-all cursor-pointer group" onClick={() => openDetailedModal('CLUSTER', c)}>
                  <div className="flex justify-between items-center mb-2">
                    <div><p className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.name}</p><p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{c.count} CONTAS</p></div>
                    <Badge variant={c.health === 'Estável' ? 'blue' : c.health === 'Em Queda' ? 'amber' : 'red'} className="text-[7px] font-bold border-none uppercase">{c.health}</Badge>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden mb-2 border border-slate-100"><div className="h-full bg-blue-600" style={{ width: `${c.val}%` }}></div></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Efficiency: {c.val}%</span>
                    <span className="text-[8px] font-bold text-blue-600 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">Playbook <ArrowRight className="w-2 h-2" /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* FIM GRID PRINCIPAL */}

            {/* ===== 6 HEATMAPS DE CONTAS ABM + ACTION CARDS ===== */}
            {(() => {
              const orderedCriteria = ['avg','icp','ct','ft','crm','vp'];
              const criteriaMap = Object.fromEntries(abmHeatmapCriteria.map(c => [c.id, c]));

              // Sorted accounts by avg for ranking
              const ranked = [...abmHeatmapAccounts].sort((a,b) => {
                const avgA = Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5);
                const avgB = Math.round((b.icp+b.crm+b.vp+b.ct+b.ft)/5);
                return avgB - avgA;
              });

              const qualifiedIcp = abmHeatmapAccounts.filter(a => getWeightedIcp(a) >= icpThreshold);
              const hotCrm = abmHeatmapAccounts.filter(a => a.crm >= 70);
              const coldCrm = abmHeatmapAccounts.filter(a => a.crm < 45);

              const MiniActions = ({ actions }: { actions: { icon: React.ReactNode; label: string; onClick: () => void }[] }) => (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 mt-auto">
                  {actions.map((a, i) => (
                    <button key={i} onClick={a.onClick}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-center group">
                      <span className="text-slate-400 group-hover:text-blue-500 transition-colors">{a.icon}</span>
                      <span className="text-[7px] font-bold text-slate-400 group-hover:text-blue-500 uppercase tracking-wide leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              );

              const actionCards: Record<string, React.ReactNode[]> = {
                avg: [
                  <div key="avg-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-blue-500"/>Ranking ABM</p>
                      <Badge variant="blue" className="text-[8px] border-none bg-blue-50 text-blue-600 font-bold">AO VIVO</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {ranked.slice(0,5).map((acc, i) => {
                        const avg = Math.round((acc.icp+acc.crm+acc.vp+acc.ct+acc.ft)/5);
                        const tier = avg >= 72 ? { label:'TOP', cls:'bg-red-100 text-red-600' } : avg >= 55 ? { label:'MID', cls:'bg-amber-100 text-amber-600' } : { label:'LOW', cls:'bg-slate-100 text-slate-500' };
                        return (
                          <div key={acc.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openDetailedModal('ACCOUNT', acc)}>
                            <span className="text-[10px] font-bold text-slate-300 w-4">{i+1}</span>
                            <div className="flex-1 min-w-0"><p className="text-[10px] font-bold text-slate-800 truncate">{acc.name}</p></div>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md ${tier.cls}`}>{tier.label}</span>
                            <span className="text-[11px] font-black text-slate-700">{avg}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Exportar CSV', onClick: () => openDetailedModal('EXPORT', { label: 'Ranking ABM' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'Atribuir AE', onClick: () => openDetailedModal('ASSIGN', { label: 'Atribuição de AE' }) },
                      { icon: <Flag className="w-3 h-3"/>, label: 'Criar Meta', onClick: () => openDetailedModal('GOAL', { label: 'Meta de Pipeline' }) },
                    ]} />
                  </div>,
                  <div key="avg-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500"/>Orquestrar em Lote</p>
                    <div className="space-y-2">
                      {[
                        { label:'Ativar TOP TIER', sub:`${ranked.filter(a=>Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5)>=72).length} contas prontas`, cls:'bg-red-600 hover:bg-red-700 text-white', icon:<Zap className="w-3 h-3"/>, type:'BATCH_TOP' },
                        { label:'Nurturing MID TIER', sub:`${ranked.filter(a=>{const s=Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5);return s>=55&&s<72;}).length} contas em espera`, cls:'bg-amber-500 hover:bg-amber-600 text-white', icon:<Activity className="w-3 h-3"/>, type:'BATCH_MID' },
                        { label:'Watch List LOW TIER', sub:`${ranked.filter(a=>Math.round((a.icp+a.crm+a.vp+a.ct+a.ft)/5)<55).length} contas`, cls:'bg-slate-200 hover:bg-slate-300 text-slate-700', icon:<Clock className="w-3 h-3"/>, type:'BATCH_LOW' },
                      ].map((btn, i) => (
                        <button key={i} onClick={() => openDetailedModal('BATCH', { label: btn.label, type: btn.type })} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${btn.cls}`}>
                          {btn.icon}
                          <div><p className="text-[10px] font-bold">{btn.label}</p><p className="text-[8px] opacity-70">{btn.sub}</p></div>
                        </button>
                      ))}
                    </div>
                    <MiniActions actions={[
                      { icon: <ArrowUpRight className="w-3 h-3"/>, label: 'Criar Oport.', onClick: () => openDetailedModal('OPP', { label: 'Nova Oportunidade CRM' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Agendar', onClick: () => openDetailedModal('SCHED', { label: 'Agendar Revisão de Pipeline' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Sync CRM', onClick: () => openDetailedModal('SYNC', { label: 'Sincronizar com Salesforce' }) },
                    ]} />
                  </div>,

                  <div key="avg-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layout className="w-3 h-3 text-indigo-500"/>Playbooks em Execução</p>
                    <div className="space-y-2">
                       {['Expansão Tier 1', 'Reengajamento C-Level', 'Nurturing Mid-Market'].map((p, i) => (
                         <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                           <span className="text-[9px] font-bold text-slate-700">{p}</span>
                           <Badge variant="blue" className="text-[7px] border-none">ATIVO</Badge>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => openDetailedModal('NEW_PLAY', { label: 'Novo Playbook de Orquestração' })} className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Explorar Biblioteca de Plays</button>
                    <MiniActions actions={[
                      { icon: <Activity className="w-3 h-3"/>, label: 'Performance', onClick: () => openDetailedModal('PERF', { label: 'Performance de Playbooks' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Templates', onClick: () => openDetailedModal('TPL', { label: 'Templates de Sequences' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'Audiência', onClick: () => openDetailedModal('AUDIENCE', { label: 'Audiência dos Playbooks' }) },
                    ]} />
                  </div>,
                ],
                icp: [
                  <div key="icp-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-blue-500"/>Qualificação ICP</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                          <span>Score mínimo</span>
                          <span className="text-blue-600">≥ {icpThreshold}% — {qualifiedIcp.length} contas</span>
                        </div>
                        <input type="range" min="40" max="95" value={icpThreshold}
                          onChange={e => setIcpThreshold(Number(e.target.value))}
                          className="w-full h-1.5 accent-blue-600 rounded-full cursor-pointer"/>
                      </div>
                      <div className="space-y-1.5">
                        {qualifiedIcp.slice(0,4).map(acc => (
                          <div key={acc.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => openDetailedModal('ACCOUNT', acc)}>
                            <span className="text-[9px] font-bold text-slate-700 truncate max-w-[110px]">{acc.name}</span>
                            <span className="text-[10px] font-black text-blue-700">{getWeightedIcp(acc)}%</span>
                          </div>
                        ))}
                        {qualifiedIcp.length === 0 && <p className="text-[9px] text-slate-400 text-center py-2">Nenhuma conta nesse threshold</p>}
                      </div>
                    </div>
                    <button onClick={() => openDetailedModal('EXPORT', { label: `Lista ICP ≥${icpThreshold}%` })} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Exportar Lista Qualificada</button>
                    <MiniActions actions={[
                      { icon: <FileSearch className="w-3 h-3"/>, label: 'Segmento', onClick: () => openDetailedModal('SEG', { label: 'Segmento ICP' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Sync CRM', onClick: () => openDetailedModal('SYNC', { label: 'Sync ICP → Salesforce' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Revisão', onClick: () => openDetailedModal('SCHED', { label: 'Agendar Revisão de ICP' }) },
                    ]} />
                  </div>,
                  <div key="icp-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings2 className="w-3 h-3 text-slate-500"/>Pesos do ICP</p>
                    <p className="text-[8px] text-slate-400">Ajuste os pesos — scores recalculados ao vivo.</p>
                    <div className="space-y-2">
                      {([
                        { label:'Receita Anual', key:'receita' as const, val: icpWeights.receita },
                        { label:'Stack Tecnológico', key:'stack' as const, val: icpWeights.stack },
                        { label:'Tamanho de Equipe', key:'equipe' as const, val: icpWeights.equipe },
                        { label:'Setor / Vertical', key:'setor' as const, val: icpWeights.setor },
                      ] as const).map((w) => (
                        <div key={w.key} className="space-y-0.5">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>{w.label}</span><span className="text-slate-700">{w.val}%</span></div>
                          <input type="range" min="0" max="50" value={w.val}
                            onChange={e => setIcpWeights(prev => ({ ...prev, [w.key]: Number(e.target.value) }))}
                            className="w-full h-1.5 accent-slate-600 rounded-full cursor-pointer"/>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('CONFIG', { label: 'Config Pesos ICP', weights: icpWeights })} className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Salvar Configuração</button>
                    <MiniActions actions={[
                      { icon: <History className="w-3 h-3"/>, label: 'Histórico', onClick: () => openDetailedModal('HIST', { label: 'Histórico de Configs' }) },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Compartilhar', onClick: () => openDetailedModal('SHARE', { label: 'Compartilhar Config' }) },
                      { icon: <Bell className="w-3 h-3"/>, label: 'Alertas', onClick: () => openDetailedModal('ALERT', { label: 'Alertas de ICP' }) },
                    ]} />
                  </div>,

                  <div key="icp-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bot className="w-3 h-3 text-emerald-500"/>IA Lookalike</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Encontre contas gemêas baseadas nas TOP 10% qualificadas no ICP atual.</p>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                       <Bot className="w-5 h-5 text-emerald-600"/>
                       <div>
                         <p className="text-[10px] font-bold text-slate-800">42 Contas Descobertas</p>
                         <p className="text-[8px] text-emerald-600 font-bold uppercase">Sinergia &gt; 85% com o tier 1</p>
                       </div>
                    </div>
                    <button onClick={() => openDetailedModal('LOOKALIKE', { label: 'Gerar Lista IA Lookalike' })} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Importar do Canopi Intel</button>
                    <MiniActions actions={[
                      { icon: <Search className="w-3 h-3"/>, label: 'Refinar IA', onClick: () => openDetailedModal('REFINE_IA', { label: 'Refinar Parâmetros de IA' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Enriquecer', onClick: () => openDetailedModal('ENR_IA', { label: 'Enriquecer via Claro/BDR' }) },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Enviar Vendas', onClick: () => openDetailedModal('SEND_SALES', { label: 'Enviar Lista para SDR' }) },
                    ]} />
                  </div>,
                ],
                ct: [
                  <div key="ct-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widests flex items-center gap-2"><Users className="w-3 h-3 text-indigo-500"/>Gap de Contatos (DMU)</p>
                    <div className="space-y-1.5">
                      {abmHeatmapAccounts.filter(a => a.ct < 50 && a.imp > 60).slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0"/>
                          <div className="flex-1 min-w-0"><p className="text-[9px] font-bold text-slate-800 truncate">{acc.name}</p><p className="text-[8px] text-slate-400">{acc.ct}% mapeado</p></div>
                          <button onClick={() => openDetailedModal('ENRICH', acc)} className="text-[8px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-indigo-700 transition-colors shrink-0">Enriquecer</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('LINKEDIN', { label: 'LinkedIn Sales Navigator' })} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-2">
                      <ExternalLink className="w-3 h-3"/>LinkedIn Sales Nav
                    </button>
                    <MiniActions actions={[
                      { icon: <Database className="w-3 h-3"/>, label: 'Atual. CRM', onClick: () => openDetailedModal('CRM_UPDATE', { label: 'Atualizar Contatos no CRM' }) },
                      { icon: <CheckCircle className="w-3 h-3"/>, label: 'Atribuir', onClick: () => openDetailedModal('ASSIGN', { label: 'Atribuir SDR por Conta' }) },
                      { icon: <Smartphone className="w-3 h-3"/>, label: 'Canopi', onClick: () => openDetailedModal('CANOPI', { label: 'Registrar no Canopi' }) },
                    ]} />
                  </div>,
                  <div key="ct-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-emerald-500"/>Cargos Críticos DMU</p>
                    <div className="space-y-1.5">
                      {[
                        { cargo:'CEO / Presidente', status:'gap', pct:38 },
                        { cargo:'CFO / Dir. Finanças', status:'gap', pct:42 },
                        { cargo:'CTO / Dir. TI', status:'ok', pct:78 },
                        { cargo:'VP Comercial', status:'gap', pct:30 },
                        { cargo:'Head de Produto', status:'ok', pct:65 },
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => openDetailedModal('ROLE', c)}>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                          <span className="text-[9px] font-medium text-slate-600 flex-1">{c.cargo}</span>
                          <span className={`text-[9px] font-bold ${c.status === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('SEQ', { label: 'Sequência por Cargo' })} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Criar Sequência por Cargo</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Campanha', onClick: () => openDetailedModal('CAMP', { label: 'Campanha por Cargo' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Atividade', onClick: () => openDetailedModal('ACTIVITY', { label: 'Atribuir Atividade Canopi' }) },
                      { icon: <MessageSquare className="w-3 h-3"/>, label: 'Conectar', onClick: () => openDetailedModal('CONNECT', { label: 'Conectar no LinkedIn' }) },
                    ]} />
                  </div>,

                  <div key="ct-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Map className="w-3 h-3 text-blue-500"/>Mapa de Influência</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Identifique os bloqueadores e campeões dentro dos comitês mapeados.</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50"><p className="text-[12px] font-black text-blue-600">14</p><p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Champions</p></div>
                       <div className="p-2 border border-slate-100 rounded-lg text-center bg-slate-50"><p className="text-[12px] font-black text-amber-500">8</p><p className="text-[7px] font-bold text-slate-500 uppercase mt-0.5">Bloqueadores</p></div>
                    </div>
                    <button onClick={() => openDetailedModal('INFLUENCE_MAP', { label: 'Extrair Mapa de Influência' })} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Mapear Conexões</button>
                    <MiniActions actions={[
                      { icon: <Share2 className="w-3 h-3"/>, label: 'Social Selling', onClick: () => openDetailedModal('SS', { label: 'Rede de Contatos - Social Selling' }) },
                      { icon: <TrendingUp className="w-3 h-3"/>, label: 'Evolução', onClick: () => openDetailedModal('MAP_EVO', { label: 'Evolução do Comitê' }) },
                      { icon: <Zap className="w-3 h-3"/>, label: 'Ação C-Level', onClick: () => openDetailedModal('CLEVEL_PLAY', { label: 'Abordagem Executiva' }) },
                    ]} />
                  </div>,
                ],
                ft: [
                  <div key="ft-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-emerald-500"/>Fast-Track Pipeline</p>
                      <Badge variant="emerald" className="text-[8px] border-none bg-emerald-50 text-emerald-600 font-bold">{abmHeatmapAccounts.filter(a=>a.ft>=75).length} elegíveis</Badge>
                    </div>
                    <div className="space-y-1.5">
                      {abmHeatmapAccounts.filter(a => a.ft >= 75).slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl group cursor-pointer hover:border-emerald-300 transition-all" onClick={() => openDetailedModal('ACCOUNT', acc)}>
                          <div><p className="text-[9px] font-bold text-slate-800">{acc.name}</p><p className="text-[8px] text-emerald-600">Fit {acc.ft}% — Budget R${acc.budget}k</p></div>
                          <button onClick={e => { e.stopPropagation(); openDetailedModal('MOVE', { label: `Mover ${acc.name} → Oportunidade` }); }} className="text-[8px] bg-emerald-600 text-white px-2 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">Mover</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('FAST_TRACK', { label: 'Mover Elegíveis → Oportunidade' })} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Mover Todas para Oportunidade</button>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Proposta', onClick: () => openDetailedModal('PROP', { label: 'Criar Proposta Comercial' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Demo', onClick: () => openDetailedModal('DEMO', { label: 'Marcar Demo' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Criar Oport.', onClick: () => openDetailedModal('OPP', { label: 'Criar Oportunidade CRM' }) },
                    ]} />
                  </div>,
                  <div key="ft-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-3 h-3 text-blue-500"/>Análise de Gaps de Fit</p>
                    <div className="space-y-2">
                      {[
                        { label:'Stack Tecnológico', val:72, color:'bg-blue-500' },
                        { label:'Maturidade Analítica', val:58, color:'bg-indigo-500' },
                        { label:'Timing Comercial', val:44, color:'bg-amber-500' },
                        { label:'Cultura de Dados', val:35, color:'bg-red-500' },
                      ].map((g, i) => (
                        <div key={i} className="space-y-0.5 cursor-pointer" onClick={() => openDetailedModal('GAP', g)}>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>{g.label}</span><span>{g.val}%</span></div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.val}%` }}/></div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('ROADMAP', { label: 'Roadmap de Fit' })} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Propor Roadmap de Fit</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Campanha Fit', onClick: () => openDetailedModal('CAMP', { label: 'Campanha de Fit Tecnológico' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'Workshop', onClick: () => openDetailedModal('EVENT', { label: 'Workshop de Maturidade' }) },
                      { icon: <FileText className="w-3 h-3"/>, label: 'Case Study', onClick: () => openDetailedModal('CASE', { label: 'Enviar Case de Sucesso' }) },
                    ]} />
                  </div>,

                  <div key="ft-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3 text-amber-500"/>Sinais Tecnológicos</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Contas indicando mudanças de infraestrutura ou adoção de concorrentes.</p>
                    <div className="space-y-1.5">
                       {[{name: 'TechInsure Co.', signal:'Pesquisa Cloud AWS'},{name:'ScalePay Brasil', signal:'Fim contratação Hubspot'}].map((a, i) => (
                         <div key={i} className="p-2 bg-amber-50 rounded-lg">
                           <p className="text-[9px] font-bold text-slate-800">{a.name}</p>
                           <p className="text-[8px] text-amber-600 uppercase font-bold mt-0.5"><Zap className="inline w-2 h-2 mr-1"/>{a.signal}</p>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => openDetailedModal('INTENT', { label: 'Sinais de Intenção Totais' })} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Monitorar Concorrentes</button>
                    <MiniActions actions={[
                      { icon: <Search className="w-3 h-3"/>, label: 'Tech Stack', onClick: () => openDetailedModal('TECH_STACK', { label: 'Scrape de Tecnologias' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Alerta CRM', onClick: () => openDetailedModal('CRM_ALERT', { label: 'Criar Alerta SDR CRM' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'G2 / Capterra', onClick: () => openDetailedModal('G2_INTENT', { label: 'Analisar Intent G2' }) },
                    ]} />
                  </div>,
                ],
                crm: [
                  <div key="crm-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500"/>Contas Quentes</p>
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{hotCrm.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {hotCrm.slice(0,3).map(acc => (
                        <div key={acc.id} className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"/><p className="text-[9px] font-bold text-slate-800 truncate max-w-[90px]">{acc.name}</p></div>
                            <span className="text-[8px] font-bold text-blue-700">{acc.crm}%</span>
                          </div>
                          <div className="flex gap-1">
                            {[
                              { label:'SDR', color:'bg-blue-600 hover:bg-blue-700', type:'SDR' },
                              { label:'AE / Vendas', color:'bg-indigo-600 hover:bg-indigo-700', type:'AE' },
                              { label:'Campanha', color:'bg-purple-600 hover:bg-purple-700', type:'CAMP' },
                            ].map(b => (
                              <button key={b.type} onClick={() => openDetailedModal(b.type, { label: `${b.label}: ${acc.name}`, account: acc })} className={`flex-1 text-[7px] ${b.color} text-white py-1 rounded-lg font-bold transition-colors`}>{b.label}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('SEQ', { label: 'Sequência Multicanal — Contas Quentes' })} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Criar Sequência Multicanal</button>
                    <MiniActions actions={[
                      { icon: <ArrowUpRight className="w-3 h-3"/>, label: 'Oportunidade', onClick: () => openDetailedModal('OPP', { label: 'Criar Oportunidade no CRM' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Atividade', onClick: () => openDetailedModal('ACTIVITY', { label: 'Atribuir Atividade Canopi' }) },
                      { icon: <Database className="w-3 h-3"/>, label: 'Atual. CRM', onClick: () => openDetailedModal('CRM_UPDATE', { label: 'Atualizar Status CRM' }) },
                    ]} />
                  </div>,
                  <div key="crm-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bell className="w-3 h-3 text-amber-500"/>Reativação de Frias</p>
                    <div className="space-y-1.5">
                      {coldCrm.slice(0,4).map(acc => (
                        <div key={acc.id} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0"/>
                          <div className="flex-1 min-w-0"><p className="text-[9px] font-bold text-slate-800 truncate">{acc.name}</p><p className="text-[8px] text-slate-400">{acc.crm}% engaj. — {acc.vertical}</p></div>
                          <button onClick={() => openDetailedModal('REACTIVATE', acc)} className="text-[8px] bg-amber-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-amber-600 transition-colors shrink-0">Reativar</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => openDetailedModal('CAMP_REACT', { label: 'Campanha de Reengajamento' })} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold uppercase rounded-xl transition-colors">Lançar Campanha Reengajamento</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'Email Flow', onClick: () => openDetailedModal('EMAIL', { label: 'Fluxo E-mail Reativação' }) },
                      { icon: <Eye className="w-3 h-3"/>, label: 'Diagnóstico', onClick: () => openDetailedModal('DIAG', { label: 'Diagnóstico de Churn Risk' }) },
                      { icon: <ZapOff className="w-3 h-3"/>, label: 'Pausar', onClick: () => openDetailedModal('PAUSE', { label: 'Pausar Contas Inativas' }) },
                    ]} />
                  </div>,

                  <div key="crm-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3 text-emerald-500"/>Velocidade do Pipeline</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Dias médios na fase atual de contas mapeadas vs contas ignoradas.</p>
                    <div className="flex items-end gap-3 h-16 mt-2 pt-2 border-t border-slate-50">
                       <div className="flex-1 bg-slate-100 rounded-t-lg h-full flex items-center justify-center flex-col"><p className="text-[11px] font-black">28</p><p className="text-[6px] text-slate-400 uppercase font-bold">Inativo</p></div>
                       <div className="flex-1 bg-emerald-500 rounded-t-lg h-[45%] flex items-center justify-center flex-col text-white"><p className="text-[11px] font-black">12</p><p className="text-[6px] text-emerald-100 uppercase font-bold">ABM</p></div>
                    </div>
                    <button onClick={() => openDetailedModal('VELOCITY', { label: 'Dashboard de Análise de Pipeline' })} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Analisar Gargalos</button>
                    <MiniActions actions={[
                      { icon: <History className="w-3 h-3"/>, label: 'Histórico', onClick: () => openDetailedModal('HIST_PIPE', { label: 'Histórico de Conversões' }) },
                      { icon: <Activity className="w-3 h-3"/>, label: 'Forecasting', onClick: () => openDetailedModal('FORECAST', { label: 'Forecasting ABM' }) },
                      { icon: <Share2 className="w-3 h-3"/>, label: 'RevOps', onClick: () => openDetailedModal('REVOPS', { label: 'Ajuste de SLA RevOps' }) },
                    ]} />
                  </div>,
                ],
                vp: [
                  <div key="vp-c1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-3 h-3 text-purple-500"/>Budget Mapeado (Contexto)</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Budget ABM real extraído do histórico da base de clientes por setor. Pool total identificado: <span className="font-bold text-slate-700">R$480k</span></p>
                    <div className="space-y-1.5 pt-1">
                      {([
                        { label:'Financeiro', pct:35, color:'bg-blue-600' },
                        { label:'Saúde', pct:20, color:'bg-emerald-600' },
                        { label:'Agronegócio', pct:18, color:'bg-lime-600' },
                        { label:'Telecom', pct:15, color:'bg-indigo-600' },
                        { label:'Outros', pct:12, color:'bg-slate-400' },
                      ] as const).map(v => {
                        const rsk = Math.round(480 * v.pct / 100);
                        return (
                          <div key={v.label} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${v.color}`}></span>
                                <span className="text-[9px] font-bold text-slate-700 uppercase">{v.label}</span>
                             </div>
                             <span className="text-[10px] font-black text-purple-700">R${rsk}k <span className="text-[8px] text-slate-400 opacity-60">({v.pct}%)</span></span>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => openDetailedModal('REP', { label: 'Análise Profunda de Budget Setorial' })} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Explorar Dados Financeiros</button>
                    <MiniActions actions={[
                      { icon: <FileText className="w-3 h-3"/>, label: 'Exportar PDF', onClick: () => openDetailedModal('REP_PDF', { label: 'Exportar PDF de Budget' }) },
                      { icon: <Flag className="w-3 h-3"/>, label: 'Alocar Verba', onClick: () => openDetailedModal('FUND', { label: 'Alocar Verba no Canopi' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'Compartilhar', onClick: () => openDetailedModal('SHARE_BUDGET', { label: 'Compartilhar C-Level' }) },
                    ]} />
                  </div>,
                  <div key="vp-c2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-3 h-3 text-indigo-500"/>Criar Cluster ABM</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nome do Cluster</label>
                        <input type="text" placeholder="Ex: Fintech High Growth" className="w-full text-[10px] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 text-slate-700 font-medium"/>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Vertical Alvo</label>
                        <select className="w-full text-[10px] border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 text-slate-700 font-medium bg-white">
                          {['Financeiro','Saúde','Agronegócio','Telecom','Indústria','Mobilidade','Seguros','Varejo','Educação','Construção','Energia'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Score Mínimo de Vertical</label>
                        <input type="range" min="40" max="90" defaultValue="65" className="w-full h-1.5 accent-indigo-600 rounded-full cursor-pointer"/>
                      </div>
                    </div>
                    <button onClick={() => openDetailedModal('CREATE_CLUSTER', { label: 'Criar Cluster de Vertical' })} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-2"><Plus className="w-3 h-3"/>Criar Cluster</button>
                    <MiniActions actions={[
                      { icon: <Users className="w-3 h-3"/>, label: 'Ver Contas', onClick: () => openDetailedModal('CLUSTER_ACCS', { label: 'Contas por Vertical' }) },
                      { icon: <Mail className="w-3 h-3"/>, label: 'Play', onClick: () => openDetailedModal('PLAY', { label: 'Executar Play de Vertical' }) },
                      { icon: <Crosshair className="w-3 h-3"/>, label: 'Segmentar', onClick: () => openDetailedModal('SEG', { label: 'Criar Segmento por Vertical' }) },
                    ]} />
                  </div>,

                  <div key="vp-c3" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500"/>Eventos & Relacionamento</p>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Orquestração offline para clusters de altíssimo valor (Eventos, Jantares).</p>
                    <div className="space-y-1.5 pt-1">
                       {[{name:'Jantar C-Level', date:'12 Nov, SP', cluster:'Fintech Top'},{name:'Workshop Tech', date:'20 Nov, Online', cluster:'Saúde Mid'}].map((e,i) => (
                         <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <div><p className="text-[9px] font-bold text-slate-800">{e.name}</p><p className="text-[7px] font-bold text-blue-500 uppercase">{e.cluster}</p></div>
                            <span className="text-[8px] font-bold text-slate-400 text-right">{e.date}</span>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => openDetailedModal('EVENT_ROI', { label: 'Gestão de Eventos ABM' })} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold uppercase rounded-xl transition-colors mt-2">Planejar Evento Regional</button>
                    <MiniActions actions={[
                      { icon: <Mail className="w-3 h-3"/>, label: 'RSVP', onClick: () => openDetailedModal('RSVP', { label: 'Gestão de RSVP VIP' }) },
                      { icon: <Users className="w-3 h-3"/>, label: 'Presentes', onClick: () => openDetailedModal('GIFT', { label: 'Enviar Direct Mail / Brinde' }) },
                      { icon: <Calendar className="w-3 h-3"/>, label: 'Executivo', onClick: () => openDetailedModal('EXEC_SYNC', { label: 'Alinhamento com Founders' }) },
                    ]} />
                  </div>,
                ],
              };


              return orderedCriteria.map((id) => {
                const criterion = criteriaMap[id];
                return (
                  <div key={criterion.id} className="grid grid-cols-1 xl:grid-cols-[58.5%_41.5%] gap-5 items-stretch">
                    {/* Heatmap card */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-full space-y-5">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 uppercase">{criterion.title}</h3>
                          <p className="text-sm text-slate-500 font-medium mt-1">{criterion.subtitle}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                          {[{c:'#27ae60',l:'Baixo'},{c:'#f9ca24',l:'Médio'},{c:'#e67e22',l:'Alto'},{c:'#c0392b',l:'Crítico'}].map(i=>(
                            <div key={i.l} className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor:i.c}}></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{i.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    {/* SVG heatmap */}
                    <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-inner flex-1 flex flex-col bg-slate-900/[0.02] items-center justify-center">
                      <svg
                        width="100%" height="100%"
                        viewBox="0 0 800 500"
                        preserveAspectRatio="xMidYMid meet"
                        style={{display:'block', cursor:'crosshair', minHeight: '400px'}}
                        onMouseLeave={() => setHmTooltip(null)}
                      >
                        <defs>
                          <linearGradient id={`hmGradFull-${criterion.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#27ae60" stopOpacity="0.92" />
                            <stop offset="40%"  stopColor="#f9ca24" stopOpacity="0.92" />
                            <stop offset="70%"  stopColor="#e67e22" stopOpacity="0.92" />
                            <stop offset="100%" stopColor="#c0392b" stopOpacity="0.92" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="0" width="800" height="500" fill={`url(#hmGradFull-${criterion.id})`} />
                        {/* Grid lines 4x4 */}
                        {[1,2,3].map(i => <line key={`v${i}`} x1={i*200} y1="0" x2={i*200} y2="500" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
                        {[1,2,3].map(i => <line key={`h${i}`} x1="0" y1={i*125} x2="800" y2={i*125} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />)}
                        {abmHeatmapAccounts.map((acc) => {
                          const score = criterion.scoreKey === 'icp' ? getWeightedIcp(acc) : getHmScore(acc, criterion.scoreKey);
                          const cx = 28 + (score / 100) * 744;
                          const cy = 470 - (acc.imp / 100) * 440;
                          const desc = criterion.desc(acc);

                          // Cor do número conforme temperatura (posição no gradiente diagonal)
                          const tempValue = (score + acc.imp) / 2;
                          const numColor = tempValue >= 78 ? '#c0392b' : tempValue >= 62 ? '#e67e22' : tempValue >= 46 ? '#b7860b' : '#1a7a3c';

                          // Label: mostra vertical no heatmap "vp", nome da empresa nos demais
                          const labelText = criterion.id === 'vp' ? acc.vertical : acc.name;
                          const shortLabel = labelText.length > 13 ? labelText.slice(0, 13) + '…' : labelText;
                          const labelW = Math.min(shortLabel.length * 5.5 + 12, 90);

                          // Alterna posição do callout (acima/abaixo) para minimizar sobreposição
                          const above = acc.id % 2 === 1;
                          const lineY1 = above ? cy - 12 : cy + 12;
                          const lineY2 = above ? cy - 28 : cy + 28;
                          const labelY = above ? lineY2 - 12 : lineY2 + 1;

                          return (
                            <g
                              key={acc.id}
                              style={{cursor:'pointer'}}
                              onMouseEnter={(e) => {
                                const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                                const svgX = (e.clientX - rect.left) * (800 / rect.width);
                                const svgY = (e.clientY - rect.top) * (500 / rect.height);
                                const displayName = criterion.id === 'vp' ? acc.vertical : acc.name;
                                setHmTooltip({ criterionId: criterion.id, x: svgX, y: svgY, displayName, name: acc.name, vertical: acc.vertical, score, desc });
                              }}
                              onMouseLeave={() => setHmTooltip(null)}
                            >
                              {/* Callout line */}
                              <line x1={cx} y1={lineY1} x2={cx} y2={lineY2} stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeDasharray="2,2" />
                              {/* Label pill */}
                              <rect x={cx - labelW / 2} y={above ? labelY - 10 : labelY} width={labelW} height={12} rx="4" fill="rgba(15,23,42,0.72)" />
                              <text x={cx} y={above ? labelY - 1 : labelY + 9} textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="7" fontWeight="700" fontFamily="sans-serif">{shortLabel}</text>
                              {/* Bubble */}
                              <circle cx={cx} cy={cy} r="13" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                              <circle cx={cx} cy={cy} r="10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                              <text x={cx} y={cy + 3.5} textAnchor="middle" fill={numColor} fontSize="7.5" fontWeight="900" fontFamily="sans-serif">{score}%</text>
                            </g>
                          );
                        })}
                        {/* Axis labels */}
                        <text x="400" y="490" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3">{criterion.xLabel}</text>
                        <text x="14" y="250" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="3" transform="rotate(-90,14,250)">{criterion.yLabel}</text>
                        {/* Tooltip — apenas para este heatmap */}
                        {hmTooltip && hmTooltip.criterionId === criterion.id && (() => {
                          const tipTemp = (hmTooltip.score + abmHeatmapAccounts.find(a => a.name === hmTooltip.name)!.imp) / 2;
                          const tipColor = tipTemp >= 78 ? '#e74c3c' : tipTemp >= 62 ? '#f39c12' : tipTemp >= 46 ? '#d4ac0d' : '#27ae60';
                          return (
                            <g transform={`translate(${Math.min(hmTooltip.x + 14, 610)}, ${hmTooltip.y > 380 ? hmTooltip.y - 130 : hmTooltip.y + 14})`}>
                              <rect x="0" y="0" width="190" height="118" rx="10" fill="rgba(15,23,42,0.97)" />
                              <text x="12" y="22" fill="white" fontSize="12" fontWeight="700" fontFamily="sans-serif">{hmTooltip.displayName}</text>
                              <text x="12" y="36" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">{criterion.id === 'vp' ? hmTooltip.name : hmTooltip.vertical}</text>
                              <rect x="12" y="43" width="166" height="1" fill="rgba(255,255,255,0.1)" />
                              <text x="12" y="62" fill={tipColor} fontSize="17" fontWeight="900" fontFamily="sans-serif">{hmTooltip.score}%</text>
                              {hmTooltip.desc.slice(hmTooltip.desc.indexOf('—') + 2).match(/.{1,33}/g)?.slice(0,3).map((line, i) => (
                                <text key={i} x="12" y={78 + i * 13} fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">{line}</text>
                              ))}
                            </g>
                          );
                        })()}
                      </svg>
                    </div>
                    {/* Disclaimer */}
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-3 px-1 border-t border-slate-50 mt-2">
                      <span className="font-bold text-slate-500 uppercase tracking-wide mr-1">Como ler:</span>{criterion.note}
                    </p>
                  </div>
                  {/* Action cards — grid 2x2 perfeitamente simétrico */}
                  <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-4 h-full">
                    {(actionCards[criterion.id] || []).map((card, i) => (
                      <div key={i} className={i === 2 ? "col-span-2 h-full" : "col-span-1 h-full"}>
                        {card}
                      </div>
                    ))}
                  </div>
                </div>
                );
              });
            })()}

           {/* ===== NOVO MÓDULO: ANÁLISE DE CONTATOS E DEPARTAMENTOS ===== */}
           <div className="pt-8 space-y-12">
             <div className="flex flex-col gap-2 mb-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Análise de Contatos e Departamentos</h2>
               <p className="text-sm text-slate-500 font-medium">Cruzamento tático global: Perfil de Contato vs Vertical de Mercado</p>
             </div>

             {(() => {
               const matrixVerticals = ['Varejo', 'Indústria', 'Saúde', 'Telecom', 'Energia', 'Mobilização', 'Finanças', 'Agro', 'Seguros', 'Mineração', 'Automóvel'];
               const defaultYAxis = ['C-Level', 'Diretor', 'Gerente', 'Coord.', 'Espec.', 'Analista'];
               const positioningYAxis = ['Decisor', 'Embaixador', 'Champion', 'Comprador', 'Stakeholder', 'Influenciador', 'Gatekeeper', 'Detrator'];
               
               // Cores: Decisor (0) até Detrator (7)
               const heatmapScale = ['#22c55e', '#4ade80', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#b91c1c'];
               
               // Helpers para o Scatter Plot Orgânico (Jitter)
               const pseudoRandom = (seed: number) => {
                 const x = Math.sin(seed++) * 10000;
                 return x - Math.floor(x);
               };
               const matrixViews = [
                 { id: 'pos', title: 'Gráfico de Dispersão de Posicionamento', desc: 'Mapeamento vetorial de como as personas se posicionam diante da Canopi.', yAxisDef: defaultYAxis, note: 'Cada bolha é um Cargo. O eixo Y sinaliza onde aquele cargo estaciona na jornada de decisão. O tamanho rege o volume de contatos e a cor vai de verde (caminho livre) a vermelho (detrator).' },
                 { id: 'pot', title: 'Potencial de Contato por Vertical vs Cargo', desc: 'Score agregado de propensão a conversão e engajamento da conta alvo.', yAxisDef: defaultYAxis, note: 'Cruze os eixos de Vertical (colunas) e Cargo (linhas) para descobrir em quais cruzamentos o orçamento/potencial é máximo (vermelho).' },
                 { id: 'recept', title: 'Receptividade Média (Rapport)', desc: 'Grau de abertura para criar um relacionamento inicial qualificado.', yAxisDef: defaultYAxis, note: 'Tons mais quentes (laranja/vermelho) identificam hierarquias corporativas super engajadas.' },
                 { id: 'access', title: 'Acessibilidade de Contato', desc: 'Nível de dificuldade política ou logística para alcançar o decisor.', yAxisDef: defaultYAxis, note: 'Mede a ausência de Gatekeepers. Áreas verdes profundas significam alta blindagem de contato.' }
               ];

               const getPositioningCharacteristic = (vId: string, pId: string) => {
                 const seed = (vId.charCodeAt(0) * 3 + pId.charCodeAt(0) * 7) % 100;
                 // Mapeado do melhor pro pior (0 a 7) dependendo do cargo
                 if (pId === 'C-Level') return seed > 70 ? 0 /*Decisor*/ : seed > 40 ? 4 /*Stakeholder*/ : seed > 20 ? 6 /*Gatekeeper*/ : 7 /*Detrator*/;
                 if (pId === 'Diretor') return seed > 60 ? 1 /*Embaixador*/ : seed > 30 ? 3 /*Comprador*/ : 6;
                 if (pId === 'Gerente') return seed > 70 ? 2 /*Champion*/ : seed > 30 ? 3 : 5 /*Influenciador*/;
                 if (pId === 'Coord.' || pId === 'Espec.') return seed > 80 ? 7 : seed > 40 ? 5 : 4;
                 return seed > 50 ? 5 : 4;
               };

               const charColors: Record<string, string> = {
                 'Decisor': '#8b5cf6', 'Comprador': '#3b82f6', 'Influenciador': '#f59e0b',
                 'Embaixador': '#10b981', 'Stakeholder': '#64748b', 'Detrator': '#ef4444'
               };

               const getMatrixScore = (view: string, vId: string, pId: string) => {
                 let base = 0.5;
                 const seed = (vId.charCodeAt(0) + pId.charCodeAt(0) + view.charCodeAt(0)) % 100;
                 base = (seed / 100) * 0.4 + 0.3; // base drift 0.3 to 0.7
                 
                 // Nova lógica ajustada conforme regras de negócio de ABM reais
                 if (view === 'access') {
                   // Acessibilidade é MUITO BAIXA em C-Level/Diretor, ALTA em Espec/Analista
                   if (pId === 'C-Level') base = 0.1 + (seed/100)*0.2; // 10-30%
                   else if (pId === 'Diretor') base = 0.2 + (seed/100)*0.3; // 20-50%
                   else if (pId === 'Analista' || pId === 'Espec.') base = 0.7 + (seed/100)*0.3; // 70-100%
                   else base = 0.5 + (seed/100)*0.3;
                 }
                 else if (view === 'recept') {
                   // Receptividade pode ser moderada/baixa no topo e mais alta no meio-tático
                   if (pId === 'C-Level') base -= 0.2;
                   if (pId === 'Gerente' || pId === 'Coord.') base += 0.25;
                 }
                 else if (view === 'pot') {
                   // Potencial de contato (Sweet spot = Diretor, Gerente, Comprador)
                   if (pId === 'C-Level' || pId === 'Analista') base -= 0.15;
                   if (pId === 'Diretor' || pId === 'Gerente') base += 0.2;
                 }
                 else if (view === 'pos') {
                   // Variable volume depending on the Role and Seed (Vertical)
                   let vol = 0.5;
                   if (pId === 'C-Level') vol = 0.15 + (seed/100)*0.25; // Small bubbles
                   else if (pId === 'Diretor') vol = 0.3 + (seed/100)*0.3; // Medium
                   else if (pId === 'Analista' || pId === 'Espec.') vol = 0.6 + (seed/100)*0.4; // Large
                   else vol = 0.4 + (seed/100)*0.4;
                   base = vol;
                 }

                 return Math.max(0.01, Math.min(0.99, base));
               };

               const matrixCardsMap: Record<string, React.ReactNode[]> = {
                 pot: [
                   <div key="bp0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-emerald-500"/>Top Cruzamentos</p>
                       <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">LIVE</span>
                     </div>
                     <div className="space-y-1.5 flex-1">
                       {[{v:'Varejo',c:'Diretor',s:91},{v:'Saúde',c:'Gerente',s:87},{v:'Indústria',c:'Coord.',s:82}].map((row,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                           <span className="text-[9px] font-bold text-slate-700">{row.v} × {row.c}</span>
                           <div className="flex items-center gap-1.5">
                             <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${row.s}%`}}/></div>
                             <span className="text-[9px] font-black text-emerald-600">{row.s}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => openDetailedModal('POT_PRIORITY', {label:'Sequência de Ataque por Prioridade'})} className="w-full text-[9px] h-7 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Zap className="w-3 h-3"/>Priorizar Ataque</button>
                   </div>,
                   <div key="bp1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><PieChart className="w-3 h-3 text-violet-500"/>Budget Mapeado</p>
                     <div className="flex-1 flex items-center justify-center">
                       <div className="relative w-24 h-24">
                         <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                           <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                           <circle cx="18" cy="18" r="15.9" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray="68 32" strokeLinecap="round"/>
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-lg font-black text-slate-900">68%</span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase">cobert.</span>
                         </div>
                       </div>
                     </div>
                     <p className="text-[9px] text-center text-slate-500 font-medium">R$326k dos R$480k mapeados com potencial qualificado</p>
                     <button onClick={() => openDetailedModal('BUDGET_BREAKDOWN', {label:'Breakdown de Budget por Vertical'})} className="w-full text-[9px] h-7 font-bold border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"><BarChart className="w-3 h-3"/>Ver Distribuição</button>
                   </div>,
                   <div key="bp2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-500"/>Ativação em Lote</p>
                       <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">23 contas</span>
                     </div>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">Há <strong>23 contas</strong> com potencial acima de 70% sem nenhuma atividade nos últimos 14 dias.</p>
                     <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                       <p className="text-[9px] font-bold text-blue-700">Play: Direct Mail + LinkedIn Ads para Diretores de Varejo em bloco</p>
                     </div>
                     <button onClick={() => openDetailedModal('BATCH_POT', {label:'Orquestração em Lote — Potencial >70%'})} className="w-full text-[9px] h-7 font-bold bg-slate-900 text-white hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5"><Rocket className="w-3 h-3"/>Lançar Sequência</button>
                   </div>
                 ],
                 recept: [
                   <div key="r0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3 text-blue-500"/>Gauge de Rapport</p>
                     <div className="flex-1 space-y-2">
                       {[{label:'C-Level',pct:31,color:'bg-red-400'},{label:'Diretor',pct:52,color:'bg-amber-400'},{label:'Gerente',pct:74,color:'bg-emerald-400'},{label:'Analista',pct:86,color:'bg-emerald-500'}].map((r,i)=>(
                         <div key={i} className="space-y-0.5">
                           <div className="flex justify-between"><span className="text-[9px] font-bold text-slate-600">{r.label}</span><span className="text-[9px] font-black text-slate-700">{r.pct}%</span></div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${r.color} rounded-full`} style={{width:`${r.pct}%`}}/></div>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => openDetailedModal('RAPPORT_EMAIL', {label:'Criar Email de Rapport por Cargo'})} className="w-full text-[9px] h-7 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Mail className="w-3 h-3"/>Criar Email de Rapport</button>
                   </div>,
                   <div key="r1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3 text-indigo-500"/>Evento VIP</p>
                       <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+38% abertura</span>
                     </div>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">C-Levels de Saúde e Indústria responderam <strong>2.8x mais</strong> quando abordados em contexto de roundtable presencial exclusivo.</p>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="p-2 bg-indigo-50 rounded-xl text-center"><p className="text-[8px] font-bold text-indigo-400 uppercase">Próximo</p><p className="text-[10px] font-black text-indigo-700">Abr 12</p></div>
                       <div className="p-2 bg-slate-50 rounded-xl text-center"><p className="text-[8px] font-bold text-slate-400 uppercase">Inscritos</p><p className="text-[10px] font-black text-slate-700">7 / 12</p></div>
                     </div>
                     <button onClick={() => openDetailedModal('EVENTO_VIP', {label:'Planejar Evento VIP / Jantar de C-Levels'})} className="w-full text-[9px] h-7 font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"><Sparkles className="w-3 h-3"/>Planejar Evento</button>
                   </div>,
                   <div key="r2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Handshake className="w-3 h-3 text-emerald-500"/>Quebra-Gelo Finance</p>
                     <div className="flex-1 p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
                       <p className="text-[8px] font-bold text-amber-700 uppercase">Alerta: Baixa Receptividade</p>
                       <p className="text-[9px] font-medium text-amber-600 leading-relaxed">Setor <strong>Finance + Seguros</strong>: C-Levels com receptividade abaixo de 35%. Exige material consultivo de alto valor antes de qualquer abordagem direta.</p>
                     </div>
                     <button onClick={() => openDetailedModal('BREAKICE_PLAY', {label:'Playbook de Quebra-Gelo para Finance'})} className="w-full text-[9px] h-7 font-bold bg-slate-900 text-white hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5"><BrainCircuit className="w-3 h-3"/>Criar Conteúdo Consultivo</button>
                   </div>
                 ],
                 access: [
                   <div key="a0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500"/>Rotas Livres</p>
                       <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ALTA</span>
                     </div>
                     <div className="flex-1 space-y-1.5">
                       {[{v:'Agro',c:'Analista',pct:92},{v:'Saúde',c:'Espec.',pct:88},{v:'Telecom',c:'Coord.',pct:79}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50">
                           <span className="text-[9px] font-bold text-emerald-800">{r.v} → {r.c}</span>
                           <span className="text-[9px] font-black text-emerald-600">{r.pct}%</span>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => openDetailedModal('FLYWHEEL_INBOUND', {label:'Ativar Flywheel Inbound para Rotas Livres'})} className="w-full text-[9px] h-7 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Rocket className="w-3 h-3"/>Ativar Flywheel Inbound</button>
                   </div>,
                   <div key="a1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Network className="w-3 h-3 text-red-500"/>Blindagem C-Level</p>
                     <div className="flex-1 p-3 bg-red-50 border border-red-100 rounded-xl">
                       <p className="text-[9px] font-bold text-red-700 mb-2">Gatekeepers Identificados</p>
                       {[{n:'Varejo',g:'Assist. Exec.',risk:'CRÍTICO'},{n:'Finance',g:'Chefe de Gab.',risk:'ALTO'},{n:'Indústria',g:'Sec. Diretoria',risk:'ALTO'}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between py-1 border-b border-red-100 last:border-none">
                           <span className="text-[8px] font-bold text-red-600">{r.n} — {r.g}</span>
                           <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${r.risk==='CRÍTICO'?'bg-red-600 text-white':'bg-orange-100 text-orange-600'}`}>{r.risk}</span>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => openDetailedModal('GATEKEEPER_BYPASS', {label:'Playbook: Bypassar Gatekeepers'})} className="w-full text-[9px] h-7 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Network className="w-3 h-3"/>Bypassar via Bottom-Up</button>
                   </div>,
                   <div key="a2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-4 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers className="w-3 h-3 text-purple-500"/>Abordagem Mista</p>
                     <p className="text-[9px] font-medium text-slate-500 leading-relaxed flex-1">Use Influenciadores com acesso rápido para gerar <strong>buzz interno</strong> e fazer Decisores pedirem eles mesmos por uma apresentação.</p>
                     <div className="flex gap-2 my-1">
                       {['Influencer','→ Buzz','→ Decisor'].map((s,i)=>(
                         <div key={i} className={`flex-1 p-2 rounded-xl text-center text-[8px] font-black ${i===0?'bg-purple-50 text-purple-600':i===1?'bg-slate-100 text-slate-500':'bg-emerald-50 text-emerald-600'}`}>{s}</div>
                       ))}
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => openDetailedModal('BOTTOM_UP_PLAY', {label:'Play Bottom-Up por Vertical'})} className="text-[9px] h-7 font-bold bg-slate-900 text-white rounded-xl hover:bg-black flex items-center justify-center gap-1"><Zap className="w-3 h-3"/>Ativar</button>
                       <button onClick={() => openDetailedModal('ACCESS_REPORT', {label:'Relatório de Acessibilidade'})} className="text-[9px] h-7 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1"><BarChart className="w-3 h-3"/>Relatório</button>
                     </div>
                   </div>
                 ],
                 pos: [
                   <div key="p0" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BadgeCheck className="w-3 h-3 text-amber-500"/>Alerta DMU</p>
                       <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">WATCH</span>
                     </div>
                     <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex-1">
                       <p className="text-[9px] font-bold text-amber-700 uppercase mb-1">Gap Crítico: Compradores</p>
                       <p className="text-[9px] font-medium text-amber-600 leading-relaxed">Indústria, Agro e Varejo <strong>não têm Compradores</strong> (Procurement) mapeados. O ciclo de compra trava sem esse elo.</p>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => openDetailedModal('DMU_HUNT', {label:'Caçada de Compradores no LinkedIn'})} className="flex-1 text-[9px] h-7 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>Mapear Compradores</button>
                       <button onClick={() => openDetailedModal('DMU_OVERLAY', {label:'Mapa DMU Completo'})} className="text-[9px] h-7 px-3 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center"><ExternalLink className="w-3 h-3"/></button>
                     </div>
                   </div>,
                   <div key="p1" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box className="w-3 h-3 text-orange-500"/>Rede de Embaixadores</p>
                     <div className="flex-1 space-y-2">
                       {[{v:'Tech',n:'4 Embaixadores',hot:true},{v:'Seguros',n:'3 Embaixadores',hot:true},{v:'Saúde',n:'1 Embaixador',hot:false}].map((r,i)=>(
                         <div key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded-xl">
                           <span className="text-[9px] font-bold text-orange-800">{r.v}</span>
                           <div className="flex items-center gap-1.5">
                             <span className="text-[9px] font-medium text-orange-600">{r.n}</span>
                             {r.hot && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"/>}
                           </div>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => openDetailedModal('AMBASSADOR_PLAY', {label:'Programa de Incentivo a Embaixadores'})} className="w-full text-[9px] h-7 font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"><Handshake className="w-3 h-3"/>Ativar Programa</button>
                   </div>,
                   <div key="p2" className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 flex flex-col h-full space-y-3">
                     <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-blue-500"/>Risco de Detratores</p>
                       <span className="text-[8px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">3 ativos</span>
                     </div>
                     <div className="flex-1 space-y-1.5">
                       {[{n:'TechCorp',r:'Gerente TI',s:'BLOQUEIO'},{n:'IndPrev',r:'Dir. Ops',s:'OBSERVAÇÃO'},{n:'AgroX',r:'Coord. Compras',s:'ALERTA'}].map((d,i)=>(
                         <div key={i} className="flex items-start justify-between p-2 bg-slate-50 rounded-xl gap-2">
                           <div><p className="text-[9px] font-bold text-slate-800">{d.n}</p><p className="text-[8px] text-slate-400">{d.r}</p></div>
                           <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shrink-0 ${i===0?'bg-red-600 text-white':i===1?'bg-amber-400 text-white':'bg-slate-200 text-slate-600'}`}>{d.s}</span>
                         </div>
                       ))}
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => openDetailedModal('DETRACTOR_PLAN', {label:'Plano de Conversão de Detratores'})} className="text-[9px] h-7 font-bold bg-slate-900 text-white rounded-xl hover:bg-black flex items-center justify-center gap-1"><Flag className="w-3 h-3"/>Neutralizar</button>
                       <button onClick={() => openDetailedModal('DETRACTOR_RISK', {label:'Relatório de Riscos de Pipeline'})} className="text-[9px] h-7 font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1"><Eye className="w-3 h-3"/>Riscos</button>
                     </div>
                   </div>
                 ]
               };

               return matrixViews.map((view, vIdx) => {
                 const currentYAxis = view.yAxisDef;
                 return (
                 <div key={view.id}>
                 <div className={view.id === 'pos' ? "flex flex-col gap-6 pb-6" : "grid grid-cols-1 xl:grid-cols-[58.5%_41.5%] gap-5 items-stretch pb-10"}>
                   
                   {/* MATRIX HEATMAP CARD */}
                   <div className="bg-white p-6 rounded-[24px] lg:rounded-[40px] border border-slate-200 shadow-sm flex flex-col h-full space-y-5">
                      <div className="flex justify-between items-center">
                         <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                              <Layout className="w-5 h-5 text-blue-600"/>
                              {vIdx + 1}. {view.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">{view.desc}</p>
                         </div>
                      </div>
                      
                      {/* TIGHT MATRIX GRID OR SCATTER PLOT */}
                      <div className="flex-1 flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner overflow-x-auto overflow-y-hidden">
                         
                         {view.id === 'pos' ? (
                            <div className="w-full h-full flex flex-col justify-center min-w-[600px] relative px-4 bg-white rounded-2xl border border-slate-200">
                               {/* SCATTER PLOT ORGÂNICO (PREMIUM PRO COM TRENDLINE) */}
                               <div className="flex-1 relative overflow-hidden bg-white ml-24 mt-8 mb-8 border-b-2 border-slate-100">
                                 <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="none" style={{display:'block', cursor:'crosshair', minHeight: '380px'}} onMouseLeave={() => setHmTooltip(null)}>
                                     {/* Horizontal Premium Grid Lines Only */}
                                     {positioningYAxis.map((_, i) => <line key={`h${i}`} x1="0" y1={(i+0.5)*(500/8)} x2="1200" y2={(i+0.5)*(500/8)} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />)}

                                     {/* Trendline Cinza Claro Linear e Pontilhada (Fina) */}
                                     <line x1="40" y1="460" x2="1160" y2="40" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6,6" />

                                     {/* Colored Deterministic Bubbles with Jitter */}
                                     {matrixVerticals.map((v, vIdx) => {
                                        return defaultYAxis.map((p, pIdx) => {
                                           const charIndex = getPositioningCharacteristic(v, p);
                                           const charName = positioningYAxis[charIndex];
                                           
                                           // Bubble size dynamics based on volume
                                           const volScore = getMatrixScore(view.id, v, p);
                                           const r = 12 + (volScore * 24); // From 12px to 36px (larger to fit text)
                                           const percent = Math.round(volScore * 100);

                                           // Deterministic Offset by Cargo Index
                                           const offsetX = (pIdx - 2.5) * 16;  // More space since we have 1200px width
                                           
                                           // Vertical organic Jitter so they don't lock exactly on the line
                                           const hash2 = pseudoRandom(pIdx * 19 + vIdx * 11);
                                           const jitterY = (hash2 - 0.5) * (500/8 * 0.75); // +/- jitter based on lane height
                                           
                                           const baseCX = (vIdx + 0.5) * (1200 / 11);
                                           const baseCY = (charIndex + 0.5) * (500 / 8);
                                           
                                           const cx = Math.max(30, Math.min(1170, baseCX + offsetX));
                                           const cy = Math.max(30, Math.min(470, baseCY + jitterY));
                                           
                                           const bubbleColor = heatmapScale[charIndex];
                                           
                                           return (
                                              <g key={`${v}-${p}`} style={{cursor:'pointer'}}
                                                 onMouseEnter={(e) => {
                                                    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                                                    const svgX = (e.clientX - rect.left) * (1200 / rect.width);
                                                    const svgY = (e.clientY - rect.top) * (500 / rect.height);
                                                    setHmTooltip({ id: 'pos', x: svgX, y: svgY, v, p, charName, color: bubbleColor, size: percent });
                                                 }}>
                                                 <title>{p} em {v}: {percent}% volume. Posicionamento: {charName}</title>
                                                 {/* Solid bubble */}
                                                 <circle cx={cx} cy={cy} r={r} fill={bubbleColor} opacity="0.85" stroke="#fff" strokeWidth="1.5" />
                                                 {/* Text inside the bubble */}
                                                 <text x={cx} y={cy + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">{percent}%</text>
                                              </g>
                                           )
                                        })
                                     })}

                                     {/* Custom Tooltip render (overlaying the graph) */}
                                     {hmTooltip && hmTooltip.id === 'pos' && (
                                        <g transform={`translate(${Math.min(hmTooltip.x + 15, 1000)}, ${hmTooltip.y > 380 ? hmTooltip.y - 120 : hmTooltip.y + 15})`} style={{pointerEvents:'none'}}>
                                           <rect x="0" y="0" width="180" height="96" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0px 10px 15px rgba(0,0,0,0.1))"/>
                                           <text x="14" y="24" fill="#0f172a" fontSize="12" fontWeight="800" fontFamily="sans-serif">{hmTooltip.p}</text>
                                           <text x="14" y="38" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="sans-serif">Vertical: {hmTooltip.v}</text>
                                           <rect x="14" y="46" width="152" height="1" fill="#f1f5f9" />
                                           <circle cx="18" cy="62" r="4.5" fill={hmTooltip.color} />
                                           <text x="28" y="65" fill={hmTooltip.color} fontSize="11" fontWeight="800" fontFamily="sans-serif">{hmTooltip.charName}</text>
                                           <text x="14" y="82" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Densidade Cargos: {hmTooltip.size || 0}% mapeado</text>
                                        </g>
                                     )}
                                 </svg>
                               </div>
                               
                               {/* Y-Axis floating labels left - OUTSIDE OF OVERFLOW HIDDEN */}
                               <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-around text-[9px] font-bold text-slate-500 tracking-tighter w-[80px]">
                                  {positioningYAxis.map(y => <div key={y} className="flex-1 flex items-center justify-end pr-2 border-r-2 border-slate-100"><span className="text-right leading-none max-w-[70px] break-words uppercase">{y}</span></div>)}
                               </div>

                               {/* X-Axis floating labels bottom */}
                               <div className="flex justify-around items-center pt-2 pb-4 ml-24 mr-2">
                                  {matrixVerticals.map(v => <span key={v} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter w-[60px] text-center truncate mt-2">{v}</span>)}
                               </div>
                            </div>


                         ) : (

                         <div className="w-full h-full flex flex-col justify-center min-w-[500px]">
                            {/* Column Headers (Verticals) */}
                            <div className="flex shrink-0 h-10 mb-2">
                               <div className="w-[90px] shrink-0" />
                               <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` }}>
                                  {matrixVerticals.map(vertical => (
                                     <div key={vertical} className="flex items-end justify-center pb-1">
                                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter truncate text-center max-w-[60px]">
                                          {vertical}
                                       </span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                            
                            {/* Rows (Personas) */}
                            <div className="flex-1 flex flex-col gap-[2px] mt-2">
                               {currentYAxis.map(yLabel => (
                                  <div key={yLabel} className="flex-1 flex min-h-[32px]">
                                     {/* Y axis label */}
                                     <div className="w-[90px] shrink-0 flex items-center justify-end pr-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">
                                        {yLabel}
                                     </div>
                                     {/* Data Cells (Now smaller, tight, with numbers inside) */}
                                     <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${matrixVerticals.length}, minmax(0, 1fr))` }}>
                                        {matrixVerticals.map(vertical => {
                                           const score = getMatrixScore(view.id, vertical, yLabel);
                                           // Same heat scale
                                           const color = score >= 0.85 ? '#c0392b' : score >= 0.7 ? '#e67e22' : score >= 0.55 ? '#f9ca24' : score >= 0.4 ? '#a8e6cf' : '#27ae60';
                                           const textColor = score >= 0.7 || score <= 0.4 ? 'text-white' : 'text-slate-900';
                                           const scoreVal = Math.round(score * 100);
                                           
                                           return (
                                              <div key={vertical} 
                                                   className="relative group transition-all rounded-[6px] cursor-pointer hover:border-slate-800 border-2 border-transparent hover:z-30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center isolate"
                                                   style={{ backgroundColor: color }}>
                                                 
                                                 {/* Number inside the cell */}
                                                 <span className={`text-[10px] font-black ${textColor} opacity-90`}>{scoreVal}</span>

                                                 {/* Rich Tooltip on hover */}
                                                 <div className="absolute opacity-0 group-hover:opacity-100 z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 border border-slate-700 w-52 rounded-xl shadow-2xl p-3 pointer-events-none transition-opacity">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                       <span className="text-[11px] font-black text-white uppercase tracking-wider">{vertical}</span>
                                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${scoreVal>=70?'bg-red-500/20 text-red-400':scoreVal<=40?'bg-green-500/20 text-green-400':'bg-amber-500/20 text-amber-400'}`}>{scoreVal}%</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-blue-400 mb-2">{yLabel}</p>
                                                    <div className="h-px w-full bg-slate-700/50 mb-2"></div>
                                                    <p className="text-[9px] text-slate-300 leading-relaxed font-medium">
                                                       Insight: {score >= 0.7 ? 'Alta probabilidade estrutural. Engaje imediatamente.' : score <= 0.4 ? 'Zona de alerta logístico e fricção de acesso.' : 'Potencial moderado de abordagem em lote.'}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-1.5 p-1.5 bg-slate-950 rounded-lg">
                                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                       <span className="text-[8px] font-bold text-slate-400 uppercase">Sugestão: {score >= 0.7 ? 'Direct Mail' : score <= 0.4 ? 'Social Ads' : 'Cold Call'}</span>
                                                    </div>
                                                    {/* Triangle pointer */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900"></div>
                                                 </div>
                                              </div>
                                           )
                                        })}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                         
                         )}

                      </div>
                      
                      {/* Disclaimer explicativo para o usuário ler graficamente */}
                      <div className="mt-4 pt-4 px-2 border-t border-slate-100">
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            <span className="font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md mr-2">Como Ler</span>
                            {view.note}
                         </p>
                      </div>
                   </div>

                   {/* ACTION CARDS */}
                   <div className={view.id === 'pos' ? "grid grid-cols-1 md:grid-cols-3 gap-5" : "grid grid-cols-2 grid-rows-[1fr_1fr] gap-4 h-full"}>
                     {(matrixCardsMap[view.id] || matrixCardsMap.pot).map((card, i) => (
                       <div key={i} className={view.id === 'pos' ? "h-full" : (i === 2 ? "col-span-2 h-full" : "col-span-1 h-full")}>
                         {card}
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* DIVISÃO ENTRE SESSÕES */}
                 {view.id === 'pos' && (
                   <div className="w-full flex items-center gap-4 pt-4 pb-12 opacity-80">
                     <div className="h-px bg-slate-300 flex-1"></div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border border-slate-200 rounded-full py-1">Heatmaps Táticos Verticais</span>
                     <div className="h-px bg-slate-300 flex-1"></div>
                   </div>
                 )}
                 </div>
                 );
               });
             })()}
           </div>

      {/* ===== FIT FIRMOGRÁFICO + TECNOGRÁFICO (abaixo dos heatmaps) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FIT FIRMOGRÁFICO */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3"/> Fit Firmográfico ABM</h4>
          <div className="space-y-5">
            {[
              { label: 'Receita Anual (> R$ 500M)', val: 78 },
              { label: 'Sede (SP / Remoto)', val: 92 },
              { label: 'Tamanho Time Tech (> 50)', val: 45 }
            ].map((idx, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase"><span>{idx.label}</span><span>{idx.val}%</span></div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-blue-600" style={{ width: `${idx.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* FIT TECNOGRÁFICO */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-3 h-3"/> Fit Tecnográfico ABM</h4>
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group cursor-pointer hover:border-blue-300 transition-all" onClick={() => openDetailedModal('TECH', { label: 'Stack Cloud' })}>
              <Cloud className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">Stack Cloud</p><p className="text-[9px] font-bold text-slate-400 uppercase">AWS / Azure Dominante</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group cursor-pointer hover:border-blue-300 transition-all" onClick={() => openDetailedModal('TECH', { label: 'CRM' })}>
              <Database className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">CRM Utilizado</p><p className="text-[9px] font-bold text-slate-400 uppercase">Salesforce (85%)</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 group cursor-pointer hover:border-blue-300 transition-all" onClick={() => openDetailedModal('TECH', { label: 'AI Readiness' })}>
              <Sparkles className="w-4 h-4 text-blue-600" />
              <div className="flex-1"><p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">AI Readiness</p><p className="text-[9px] font-bold text-slate-400 uppercase">Alta Maturidade</p></div>
              <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PLAYS DE ENTRADA RECOMENDADOS (RESTORED) */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-10">
         <div className="flex justify-between items-center bg-white">
            <div>
               <h3 className="text-xl font-bold text-slate-900 uppercase">Plays de Entrada Recomendados</h3>
               <p className="text-sm text-slate-500 font-medium mt-1">Ações táticas validadas para os clusters ativos</p>
            </div>
            <Button variant="ghost" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border border-blue-100 px-6 py-2 rounded-xl">Ver Todos os Playbooks</Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {entryPlays.map((play) => (
               <motion.div key={play.id} whileHover={{ y: -8 }} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col h-full group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-full h-full p-2" />
                     </div>
                     {play.icon}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-tight leading-tight">{play.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">{play.desc}</p>
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                     <div><p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Eficácia</p><p className="text-sm font-bold text-slate-900 tracking-tighter">{play.efficacy}%</p></div>
                     <Button className="bg-slate-900 text-white font-bold rounded-xl text-[10px] uppercase py-3 px-6 hover:bg-black border-none" onClick={() => openDetailedModal('PLAY', play)}>Executar Play</Button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalData?.title || 'Canopi ABM Intelligence'}>
        <div className="py-2">{modalData?.content}</div>
      </Modal>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
);

const Hexagon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
);

export default ABMStrategy;
