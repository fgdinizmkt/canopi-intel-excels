/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Layers, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowRight, 
  Plus, 
  Activity,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  LayoutDashboard,
  Filter,
  Clock,
  ExternalLink,
  Bot,
  BadgeCheck,
  Box,
  MessageSquare,
  FileText,
  Mail,
  Calendar,
  Eye,
  MoreVertical,
  Flag,
  Maximize2,
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
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
  ZapOff,
  Layout,
  Globe,
  PieChart,
  Target,
  ShoppingBag,
  Link,
  Search,
  Database,
  Rocket,
  Crosshair,
  Handshake,
  Info,
  Network,
  AlertCircle,
  TrendingDown,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '../components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { compiladoClientesData } from '../data/abxData';

// --- DATA PROCESSING & MAPPING ---

const processABXData = (data: any[]) => {
  return data.map((item, index) => {
    const rawScore = item.MÉDIA || 0;
    const healthScore = Math.floor(rawScore * 100);
    
    // Revenue Multiplier (Simulation based on Company Size)
    const sizeMap: Record<string, number> = {
      '10000 +': 1.8, '5001 - 10000': 1.5, '1001 - 5000': 1.2, '501 - 1000': 1.0, '201 - 500': 0.8, '51 - 200': 0.5, '11 - 50': 0.3, '1 - 10': 0.1
    };
    const multiplier = sizeMap[item.Tamanho_da_Empresa_funcionários] || 1.0;
    
    // Stage Inference
    let stage = 'Descoberta';
    const isCustomer = item.Serviço_Grupo_IN === 'Sim' || item.Licença_Grupo_IN === 'Sim';
    if (isCustomer) stage = 'Retenção';
    else if (rawScore > 0.65) stage = 'Expansão';
    else if (rawScore > 0.5) stage = 'Engajamento';
    
    // Solutions & Whitespace
    const solutions = {
      dataViz: item.Qual_Solução_de_DataViz || 'Não identificado',
      cloud: item.Qual_Solução_em_Cloud || 'Não identificado',
      rpa: item.Qual_Solução_de_RPA || 'Não identificado',
      ia: item.Qual_Solução_em_IA || 'Não identificado'
    };
    const activeAreasArr = ['dataViz', 'cloud', 'rpa', 'ia'].filter(k => (solutions as any)[k] !== 'Não identificado' && (solutions as any)[k] !== 'Não');
    const whitespace = 4 - activeAreasArr.length;

    // Financial Potential (R$ Simulation)
    const upsellValue = isCustomer ? (whitespace * 80000 * multiplier) : 0;
    const crossSellValue = (isCustomer && whitespace > 1) ? (whitespace * 120000 * multiplier) : 0;
    const churnRiskValue = (isCustomer && healthScore < 50) ? (500000 * multiplier) : 0;
    
    // Action Route Recommendation
    let actionRoute = 'Exploração';
    if (isCustomer && healthScore < 50) actionRoute = 'Defender Churn';
    else if (isCustomer && whitespace >= 2) actionRoute = 'Acelerar Upsell';
    else if (isCustomer && activeAreasArr.length === 1) actionRoute = 'Acelerar Cross-sell';
    else if (!isCustomer && rawScore > 0.6) actionRoute = 'Destravar Conta';

    // Simulated Ops Memory
    const winHistory = item.Temos_Case === 'Sim' ? [`Win: ${solutions.dataViz} Deployment`, `Win: Setup Dashboards`] : [];
    const lossHistory = index % 7 === 0 ? ['Loss: RPA POC (Preço)'] : [];
    const activeProjects = isCustomer ? [`Projeto: Expansão ${activeAreasArr[0] || 'Cloud'}`] : [];

    return {
      id: `acc-${index}`,
      name: item.Nome_da_Empresa,
      vertical: item.Setor_de_Atuação || 'Outros',
      segment: item.Segmento,
      size: item.Tamanho_da_Empresa_funcionários,
      revenue: item.Tamanho_da_Empresa_Fat_anual,
      score: healthScore,
      stage,
      isCustomer,
      risk: (isCustomer && healthScore < 50) ? 'High' : (healthScore < 45 ? 'Medium' : 'Low'),
      solutions,
      whitespace,
      activeAreas: activeAreasArr.length,
      obs: item.Obs || 'Acompanhamento de expansão de dados',
      abmProgram: item.ABM_Program,
      owner: ['Rafael Mendes', 'Carolina Lima', 'Diego Faria', 'Juliana Costa'][index % 4],
      fitScore: (rawScore * 10).toFixed(1),
      financial: { upsell: upsellValue, crossSell: crossSellValue, risk: churnRiskValue },
      actionRoute,
      memory: { wins: winHistory, losses: lossHistory, active: activeProjects },
      lastActivity: ['Reunião Executiva', 'Abertura de Proposta', 'Sinal de Intenção (Apollo)', 'Webinário Assistido'][index % 4]
    };
  });
};

const processedAccounts = processABXData(compiladoClientesData);

const calculateBigNumbers = (accounts: any[]) => {
  const mapped = accounts.length;
  const quality = (accounts.reduce((acc, current) => acc + current.score, 0) / mapped).toFixed(1);
  const totalUpsell = accounts.reduce((acc, current) => acc + current.financial.upsell, 0);
  const totalCrossSell = accounts.reduce((acc, current) => acc + current.financial.crossSell, 0);
  const churnAccounts = accounts.filter(a => a.isCustomer && a.score < 50).length;
  const exposureRisk = accounts.reduce((acc, current) => acc + current.financial.risk, 0);

  return { mapped, quality, totalUpsell, totalCrossSell, churnAccounts, exposureRisk };
};

const bigNumbers = calculateBigNumbers(processedAccounts);

// --- MOCK DATA FOR ORCHESTRATION ---

const committeeRoles = ['Sponsor Executivo', 'Técnico', 'Usuário Final', 'Operações', 'Financeiro', 'Segurança', 'Procurement', 'Champion'];
const orchestrationChannels = ['SDR / Outbound', 'Email', 'LinkedIn', 'Paid Media', 'Content', 'Events', 'Website', 'Exec Sync', 'Product', 'CS Touch'];

const pipelineByVertical = [
  { name: 'Varejo', open: 450, won: 120, lost: 30, expansion: 210, risk: 45 },
  { name: 'Indústria', open: 320, won: 450, lost: 80, expansion: 340, risk: 120 },
  { name: 'Saúde', open: 580, won: 200, lost: 40, expansion: 150, risk: 20 },
  { name: 'Financeiro', open: 890, won: 600, lost: 110, expansion: 450, risk: 85 },
  { name: 'Telecom', open: 210, won: 340, lost: 20, expansion: 120, risk: 10 },
  { name: 'Energia', open: 150, won: 80, lost: 15, expansion: 90, risk: 35 },
];

const funnelEvolution = [
  { date: 'Jan', advance: 12, regress: 2, stay: 45 },
  { date: 'Fev', advance: 18, regress: 4, stay: 40 },
  { date: 'Mar', advance: 24, regress: 1, stay: 35 },
];

const channelInfluence = [
  { name: 'Outbound', value: 35 },
  { name: 'Email', value: 20 },
  { name: 'LinkedIn', value: 15 },
  { name: 'Paid Media', value: 15 },
  { name: 'Net Relationship', value: 10 },
  { name: 'CS Signals', value: 5 },
];

const coordinatedTimeline = [
  { id: 1, account: 'Global Bank S.A.', type: 'Exec Sync', action: 'Reunião estratégica com VP de TI confirmada', owner: 'Rafael Mendes', time: 'Há 2h', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 2, account: 'Innova Retail', type: 'Paid Media', action: 'Impressões em LinkedIn Ads subiram 40% (Tier 1)', owner: 'Marketing Bot', time: 'Há 4h', icon: <Target className="w-3.5 h-3.5" /> },
  { id: 3, account: 'TechCorp S.A.', type: 'Email', action: 'Abertura de proposta consolidada pelo Sponsor', owner: 'Diego Faria', time: 'Há 6h', icon: <Mail className="w-3.5 h-3.5" /> },
  { id: 4, account: 'Energia+ Ltda', type: 'SDR Outbound', action: 'Nova conta em Engajamento após Cold Call', owner: 'Carolina Lima', time: 'Há 8h', icon: <Activity className="w-3.5 h-3.5" /> },
];

const pendingDecisions = [
  { id: 1, account: 'Global Bank S.A.', blocker: 'Aprovação de Budget Q3 pendente no Sponsor', owner: 'VP Financeiro', date: '24/03', severity: 'High' },
  { id: 2, account: 'Innova Retail', blocker: 'POC de IA aguardando dados históricos', owner: 'Data Lead', date: '26/03', severity: 'Medium' },
  { id: 3, account: 'Sky Logistics', blocker: 'Renovação de contrato Cloud s/ Champion', owner: 'Procurement', date: '21/03', severity: 'Critical' },
];

const pipelineStats = {
  projects: 26,
  activeOps: 14,
  winRate: '68%',
  expansionPipe: 'R$ 1.2M'
};

// --- PEOPLE & INFLUENCE DATA ---

const generatePeopleData = (accounts: any[]) => {
  const roles = ['Sponsor Executivo', 'Decisor Econômico', 'Técnico', 'Usuário Influenciador', 'Operações', 'Financeiro', 'Procurement', 'Champion', 'Bloqueador'];
  const channels = ['Email', 'WhatsApp', 'LinkedIn', 'Reunião', 'Evento', 'Almoco/Social'];
  
  return Array.from({ length: 40 }).map((_, i) => {
    const acc = accounts[i % accounts.length];
    const role = roles[i % roles.length];
    const influence = Math.floor(Math.random() * 100);
    const accessibility = Math.floor(Math.random() * 100);
    const engagement = Math.floor(Math.random() * 100);
    
    return {
      id: `person-${i}`,
      name: ['Fábio Diniz', 'Alice Souza', 'Marco Aurélio', 'Elena Silva', 'Ricardo Mello', 'Paula Torres', 'Gustavo Lima', 'Sandra Oh'][i % 8],
      account: acc.name,
      accountId: acc.id,
      role,
      title: ['CTO', 'Head of Sales', 'Product Lead', 'CFO', 'IT Manager', 'Procurement Officer'][i % 6],
      influence,
      accessibility,
      engagement,
      power: influence > 70 ? 'High' : (influence > 40 ? 'Medium' : 'Low'),
      status: engagement > 60 ? 'Active' : (engagement > 30 ? 'Neutral' : 'Cold'),
      channel: channels[i % channels.length],
      lastTouch: `${Math.floor(Math.random() * 15)}d atrás`,
      owner: acc.owner,
      risk: i % 7 === 0 ? 'High' : 'Low',
      impact: influence * (engagement / 100),
      isChampion: i % 5 === 0,
      isBlocker: i % 9 === 0,
    };
  });
};

const peopleData = generatePeopleData(processedAccounts);

const contactsBigNumbers = {
  mapped: peopleData.length,
  quality: '72%',
  champions: peopleData.filter(p => p.isChampion).length,
  blockers: peopleData.filter(p => p.isBlocker).length,
  gapSponsor: 4,
  gapTechnical: 2,
  lowCoverage: 6,
  riskPolitical: 3
};

const SectionHeader: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  badge?: string;
  badgeColor?: 'blue' | 'indigo' | 'emerald' | 'amber';
}> = ({ title, subtitle, icon, badge, badgeColor = 'blue' }) => (
  <div className="flex justify-between items-start mb-6">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-${badgeColor}-50 text-${badgeColor}-600 shadow-sm border border-${badgeColor}-100`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{title}</h3>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    {badge && (
      <Badge className={`bg-${badgeColor}-500/10 text-${badgeColor}-700 border-${badgeColor}-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm`}>
        {badge}
      </Badge>
    )}
  </div>
);

const HeroLayer: React.FC<{ 
  hotUpsell: any[]; 
  highRiskChurn: any[]; 
  bigNumbers: any;
}> = ({ hotUpsell, highRiskChurn, bigNumbers }) => {
  const formatCurrency = (val: number) => `R$ ${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase">Command Center Active</Badge>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  CRM LIVE SYNC
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                Orquestração de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Expansão e Risco</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium max-w-xl">Coordenação centralizada de jornadas, cobertura de comitê e white-space para maximizar LTV e mitigar churn.</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-white text-slate-950 hover:bg-slate-100 font-black text-[10px] px-8 py-6 rounded-2xl uppercase tracking-widest shadow-xl h-14">Fila de Comando</Button>
              <Button variant="ghost" className="text-white border border-white/10 hover:bg-white/5 font-black text-[10px] px-8 py-6 rounded-2xl uppercase tracking-widest h-14">Ações Estratégicas</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 border-t border-white/10 pt-10">
            {[
              { label: 'Contas Mapeadas', val: bigNumbers.mapped, sub: 'Total Base ABX', color: 'text-white' },
              { label: 'Qualidade Mapeamento', val: `${bigNumbers.quality}%`, sub: 'Score de Dados', color: 'text-blue-400' },
              { label: 'Potencial Cross-sell', val: formatCurrency(bigNumbers.totalCrossSell), sub: 'Whitespace R$', color: 'text-emerald-400' },
              { label: 'Potencial Upsell', val: formatCurrency(bigNumbers.totalUpsell), sub: 'Expansion R$', color: 'text-emerald-400' },
              { label: 'Contas em Risco', val: bigNumbers.churnAccounts, sub: 'Score < 5.0', color: 'text-red-400' },
              { label: 'Receita Exposta', val: formatCurrency(bigNumbers.exposureRisk), sub: 'Churn Risk R$', color: 'text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className={`text-xl font-black tracking-tighter ${stat.color}`}>{stat.val}</h3>
                <p className="text-[9px] font-bold text-slate-600 uppercase">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Top Opportunity', 
            account: hotUpsell[0]?.name || 'N/A', 
            desc: 'Alta propensão de Expansão (Cloud)', 
            val: formatCurrency(hotUpsell[0]?.financial?.upsell || 0),
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'emerald'
          },
          { 
            title: 'Critical Churn Risk', 
            account: highRiskChurn[0]?.name || 'N/A', 
            desc: 'Baixo engajamento e queda de score', 
            val: formatCurrency(highRiskChurn[0]?.financial?.risk || 0),
            icon: <ZapOff className="w-5 h-5" />,
            color: 'red'
          },
          { 
            title: 'Funnel Bottleneck', 
            account: 'Stage: Proposta', 
            desc: '8 contas aguardando aprovação técnica', 
            val: 'R$ 1.4M',
            icon: <Clock className="w-5 h-5" />,
            color: 'amber'
          },
        ].map((item, i) => (
          <Card key={i} className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white hover:scale-[1.02] transition-all flex items-center gap-6 border-b-8" style={{ borderBottomColor: item.color === 'emerald' ? '#10b981' : item.color === 'red' ? '#ef4444' : '#f59e0b' }}>
            <div className={`p-4 rounded-3xl bg-${item.color}-50 text-${item.color}-600 shadow-inner`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</p>
              <h4 className="text-base font-black text-slate-900 truncate">{item.account}</h4>
              <p className="text-[11px] font-medium text-slate-500 mb-2 truncate">{item.desc}</p>
              <div className="flex items-center gap-2">
                <Badge variant={item.color as any} className="text-[9px] font-black uppercase px-2 py-0 border-none bg-opacity-10">{item.val}</Badge>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Impacto Est.</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-colors" />
          </Card>
        ))}
      </div>
    </div>
  );
};

const Pipeline360Layer: React.FC<{ pipelineData: any[]; channelData: any[] }> = ({ pipelineData, channelData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card className="lg:col-span-2 p-8 border-slate-200 shadow-sm rounded-[40px] bg-white overflow-hidden relative">
      <SectionHeader title="Pipeline por Vertical" subtitle="Volume de expansão e risco segmentado por setor" icon={<Building2 className="w-5 h-5" />} badge="Real-time" />
      <div className="h-[300px] w-full mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
            <ReTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} itemStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }} />
            <Bar dataKey="won" name="Ganho" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={40} />
            <Bar dataKey="expansion" name="Expansão" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="open" name="Aberto" stackId="a" fill="#94a3b8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="risk" name="Risco" fill="#ef4444" radius={[8, 8, 8, 8]} barSize={10} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
    <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
      <SectionHeader title="Impacto Cross-Channel" subtitle="Atribuição de fontes na geração de pipeline" icon={<Network className="w-5 h-5" />} badgeColor="indigo" />
      <div className="h-[250px] mt-4 flex items-center justify-center relative">
         <ResponsiveContainer width="100%" height="100%">
           <RePieChart>
             <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
               {channelData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'][index % 6]} stroke="none" />
               ))}
             </Pie>
             <ReTooltip />
           </RePieChart>
         </ResponsiveContainer>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
            <span className="text-2xl font-black text-slate-900">+38%</span>
         </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-6">
        {channelData.slice(0, 4).map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'][i] }}></div>
            <span className="text-[9px] font-bold text-slate-600 truncate">{c.name}</span>
            <span className="ml-auto text-[9px] font-black">{c.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ActionRoutesLayer: React.FC<{ accounts: any[] }> = ({ accounts }) => {
  const routes = [
    { id: 'upsell', title: 'Acelerar Upsell', icon: <TrendingUp className="w-5 h-5" />, color: 'emerald', accounts: accounts.filter(a => a.actionRoute === 'Acelerar Upsell').slice(0, 2) },
    { id: 'cross', title: 'Acelerar Cross-sell', icon: <ShoppingBag className="w-5 h-5" />, color: 'blue', accounts: accounts.filter(a => a.actionRoute === 'Acelerar Cross-sell').slice(0, 2) },
    { id: 'churn', title: 'Defender Churn', icon: <ZapOff className="w-5 h-5" />, color: 'red', accounts: accounts.filter(a => a.actionRoute === 'Defender Churn').slice(0, 2) },
    { id: 'stalled', title: 'Destravar Conta', icon: <Activity className="w-5 h-5" />, color: 'amber', accounts: accounts.filter(a => a.actionRoute === 'Destravar Conta').slice(0, 2) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {routes.map((route, i) => (
        <Card key={i} className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-xl bg-${route.color}-50 text-${route.color}-600`}>{route.icon}</div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{route.title}</h4>
          </div>
          <div className="space-y-4">
            {route.accounts.map((acc, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl space-y-3 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 group/item">
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black text-slate-900 truncate pr-2">{acc.name}</p>
                  <Badge variant={route.color as any} className="text-[8px] font-black uppercase px-2 py-0 border-none bg-opacity-20">{acc.score}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Intervenção Sugerida</p>
                  <p className="text-[10px] font-medium text-slate-700 leading-tight">
                    {route.id === 'upsell' ? 'Acionar Sponsor Executivo para demonstrar valor do módulo IA' :
                     route.id === 'cross' ? 'Ativar play de caso complementar com área de Dados' :
                     route.id === 'churn' ? 'Iniciar play de recuperação e diagnóstico de risco' :
                     'Rodar campanha de reentrada multicanal (LinkedIn + SDR)'}
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-1 border-t border-slate-200/50">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Database className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">CRM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Rocket className="w-3 h-3 text-indigo-500" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Apollo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 gap-2">Ver Todas <ArrowRight className="w-3 h-3" /></Button>
        </Card>
      ))}
    </div>
  );
};

const RankingsLayer: React.FC<{ hotUpsell: any[]; hotCrossSell: any[]; highRiskChurn: any[] }> = ({ hotUpsell, hotCrossSell, highRiskChurn }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { title: 'Top Upsell Potential', icon: <ArrowUpRight className="w-5 h-5 text-emerald-500" />, data: hotUpsell, badge: 'High Fit', color: 'emerald', tactic: 'Expansão Cloud' },
      { title: 'Cross-sell Momentum', icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, data: hotCrossSell, badge: 'Whitespace', color: 'blue', tactic: 'Play de DataViz' },
      { title: 'Critical Churn Risk', icon: <ZapOff className="w-5 h-5 text-red-500" />, data: highRiskChurn, badge: 'Low Score', color: 'red', tactic: 'Play de Retenção' },
    ].map((rank, i) => (
      <Card key={i} className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white hover:shadow-lg transition-all border-b-8" style={{ borderBottomColor: rank.color === 'emerald' ? '#10b981' : rank.color === 'blue' ? '#3b82f6' : '#ef4444' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-${rank.color}-50 text-${rank.color}-600`}>{rank.icon}</div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{rank.title}</h4>
          </div>
          <Badge variant={rank.color as any} className="text-[9px] font-black tracking-widest uppercase px-2 py-0 border-none bg-opacity-10">{rank.badge}</Badge>
        </div>
        <div className="space-y-4">
          {rank.data.slice(0, 4).map((acc, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-sm">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-800 truncate">{acc.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{acc.vertical}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-900">{acc.score}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Whitelist Area</p>
                  <p className="text-[9px] font-bold text-blue-600 truncate">Marketing Ops</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Next Best Action</p>
                  <p className="text-[9px] font-bold text-slate-900 truncate">Play de {rank.tactic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 gap-2 bg-slate-50 hover:bg-slate-100 transition-all rounded-xl py-3">Ver Ranking Completo <ArrowRight className="w-3 h-3" /></Button>
      </Card>
    ))}
  </div>
);

const CommercialMemoryLayer: React.FC<{ accounts: any[] }> = ({ accounts }) => (
  <div className="space-y-6">
    <SectionHeader title="Memória Comercial Canopi" subtitle="Histórico de vitórias, perdas e projetos ativos nas top contas" icon={<History className="w-5 h-5" />} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {accounts.slice(0, 4).map((acc, i) => (
        <Card key={i} className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">{acc.name}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{acc.vertical}</p>
            </div>
            <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ml-2">{acc.lastActivity}</Badge>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Vitórias Recentes</p>
              {acc.memory.wins.map((w: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {w}
                </div>
              ))}
              {acc.memory.wins.length === 0 && <p className="text-[10px] italic text-slate-400">Nenhum registro</p>}
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Projetos Ativos</p>
              {acc.memory.active.map((p: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                  <Activity className="w-3 h-3" />
                  {p}
                </div>
              ))}
              {acc.memory.active.length === 0 && <p className="text-[10px] italic text-slate-400">Aguardando início</p>}
            </div>
          </div>
          <Button variant="ghost" className="w-full mt-6 text-[9px] font-black uppercase text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl transition-all">Explorar Ficha 360°</Button>
        </Card>
      ))}
    </div>
  </div>
);

const HeatmapsLayer: React.FC<{ accounts: any[]; committeeRoles: string[] }> = ({ accounts, committeeRoles }) => (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
    <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
      <SectionHeader title="Cobertura do Comitê Comprador" subtitle="Engajamento por papel (Vermelho = Risco / Azul = Seguro)" icon={<Users className="w-5 h-5" />} badge="Critical Ops" />
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-separate border-spacing-[2px]">
          <thead>
            <tr>
              <th className="p-2 min-w-[140px]"></th>
              {committeeRoles.map(role => (
                <th key={role} className="p-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center h-24">
                  <span className="[writing-mode:vertical-lr] rotate-180">{role}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.slice(0, 8).map((acc, i) => (
              <tr key={i}>
                <td className="p-3 bg-slate-50 rounded-l-xl">
                  <p className="text-[10px] font-black text-slate-900 truncate max-w-[120px]">{acc.name}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{acc.vertical}</p>
                </td>
                {committeeRoles.map((_, idx) => {
                  const intensity = (acc.score / 20) - (idx % 3);
                  const score = Math.max(0, Math.min(5, Math.floor(intensity)));
                  // Red-Blue Scale: 0-1 (Red/Orange), 2-3 (Amber/Slate), 4-5 (Blue/DarkBlue)
                  const colors = ['#fee2e2', '#fecaca', '#fdba74', '#94a3b8', '#3b82f6', '#1e3a8a'];
                  return (
                    <td key={idx} className="p-0">
                      <div className="w-full h-10 rounded-[4px] border border-white transition-all hover:scale-[1.1] hover:z-10 relative cursor-pointer" style={{ backgroundColor: colors[score] }} title={`${acc.name} - ${committeeRoles[idx]}: Intensity ${score}`}></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-6">
        {['Risco', 'Baixo', 'Médio', 'Forte', 'Bluechip'].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#ef4444', '#f87171', '#fb923c', '#94a3b8', '#3b82f6'][i] }}></div>
            <span className="text-[8px] font-black text-slate-400 uppercase">{l}</span>
          </div>
        ))}
      </div>
    </Card>
    
    <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
      <SectionHeader title="Matriz de Whitespace Operacional" subtitle="Status de Solução por Departamento (Categorias)" icon={<Target className="w-5 h-5" />} badgeColor="indigo" />
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-separate border-spacing-[4px]">
          <thead>
            <tr>
              <th className="p-2 min-w-[120px]"></th>
              {['DataViz', 'Cloud', 'RPA', 'IA/GenIA'].map(h => (
                <th key={h} className="p-2 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.slice(0, 10).map((acc, i) => (
              <tr key={i}>
                <td className="p-2">
                   <p className="text-[10px] font-black text-slate-800 truncate">{acc.name}</p>
                </td>
                {['dataViz', 'cloud', 'rpa', 'ia'].map((key, idx) => {
                  const status = (acc.solutions as any)[key];
                  const has = status !== 'Não identificado' && status !== 'Não';
                  const isOpp = !has && acc.score > 60;
                  const isRisk = has && acc.score < 50;
                  
                  return (
                    <td key={idx} className="p-0">
                      <div className={`w-full h-8 rounded-lg flex items-center justify-center transition-all hover:scale-[1.05] cursor-pointer ${
                        isRisk ? 'bg-red-100 text-red-600 border border-red-200' :
                        isOpp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse' :
                        has ? 'bg-blue-600 text-white shadow-sm' :
                        'bg-slate-50 border border-slate-100 opacity-40'
                      }`} title={`${acc.name} - ${key}: ${status}`}>
                        {has ? <BadgeCheck className="w-3 h-3" /> : (isOpp ? <Plus className="w-3 h-3" /> : (isRisk ? <AlertCircle className="w-3 h-3" /> : null))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[9px] font-black text-emerald-800 uppercase">Expansão Recomendada</span>
        </div>
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[9px] font-black text-red-800 uppercase">Risco de Churn Solução</span>
        </div>
      </div>
    </Card>
  </div>
);

const OperationalFilaLayer: React.FC<{ accounts: any[]; onSelect: (acc: any) => void }> = ({ accounts, onSelect }) => (
  <Card className="p-0 border-slate-200 shadow-xl rounded-[48px] bg-white overflow-hidden border-t-8 border-t-blue-600">
    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Rocket className="w-7 h-7 text-blue-600" />
          Fila de Comando ABX
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Coordenação de jornada cross-channel e sinais de prontidão</p>
      </div>
      <div className="flex gap-3">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="BUSCAR NO CRM..." className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none w-64 shadow-sm focus:ring-2 focus:ring-blue-500" />
         </div>
         <Button variant="ghost" className="bg-white border border-slate-200 rounded-2xl p-3"><Filter className="w-5 h-5 text-slate-600" /></Button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa & Contexto</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fase Real</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gap</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rota Sugerida</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fonte</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {accounts.slice(0, 15).map((acc, i) => (
            <tr key={i} className="hover:bg-blue-50/30 transition-all group cursor-pointer" onClick={() => onSelect(acc)}>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm group-hover:bg-blue-600 transition-colors">
                    {acc.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{acc.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{acc.vertical} • {acc.owner}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-center">
                <Badge className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${
                  acc.stage === 'Retenção' ? 'border-blue-100 text-blue-700 bg-blue-50' :
                  acc.stage === 'Expansão' ? 'border-emerald-100 text-emerald-700 bg-emerald-50' :
                  'border-slate-100 text-slate-500 bg-slate-50'
                }`}>
                  {acc.stage}
                </Badge>
              </td>
              <td className="px-6 py-6 text-center">
                 <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-100 text-xs font-black text-slate-900 group-hover:border-blue-500 transition-all">
                   {acc.score}
                 </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex justify-center gap-1">
                  {['dataViz', 'cloud', 'rpa', 'ia'].map((sol, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${(acc.solutions as any)[sol] !== 'Não identificado' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${acc.actionRoute.includes('Upsell') ? 'bg-emerald-500' : acc.actionRoute.includes('Churn') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-700">{acc.actionRoute}</span>
                </div>
              </td>
              <td className="px-6 py-6 text-center">
                <div className="flex justify-center gap-2 opacity-40 group-hover:opacity-100 transition-all">
                  <Database className="w-3.5 h-3.5" />
                  <Rocket className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                 <Button size="sm" className="bg-slate-900 text-white hover:bg-blue-600 border-none rounded-xl font-black text-[10px] uppercase px-5 transition-all shadow-md">
                   Explorar 360°
                 </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ContactsSummaryLayer: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 bg-slate-900 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl mt-12">
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent pointer-events-none"></div>
    {[
      { label: 'Contatos Mapeados', val: stats.mapped, sub: 'Total no Comitê', color: 'text-white' },
      { label: 'Qualidade Mapeam.', val: stats.quality, sub: 'Completo/Acertado', color: 'text-blue-400' },
      { label: 'Champions', val: stats.champions, sub: 'Relacionamento Ativo', color: 'text-emerald-400' },
      { label: 'Bloqueadores', val: stats.blockers, sub: 'Risco de Barreira', color: 'text-red-400' },
      { label: 'Gap Sponsor', val: stats.gapSponsor, sub: 'Executivos Faltando', color: 'text-amber-400' },
      { label: 'Gap Técnico', val: stats.gapTechnical, sub: 'Influência Técnica', color: 'text-amber-400' },
      { label: 'Baixa Cobertura', val: stats.lowCoverage, sub: 'Contas Vulneráveis', color: 'text-orange-400' },
      { label: 'Risco Político', val: stats.riskPolitical, sub: 'Churn Humano', color: 'text-red-500' },
    ].map((s, i) => (
      <div key={i} className="space-y-1 relative z-10 border-r border-white/5 last:border-none pr-4">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
        <h3 className={`text-xl font-black tracking-tighter ${s.color}`}>{s.val}</h3>
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{s.sub}</p>
      </div>
    ))}
  </div>
);

const HumanMappingDiagnosis: React.FC<{ accounts: any[] }> = ({ accounts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
    {[
      { title: 'Excelência Humana', accounts: 12, percentage: 30, color: 'blue', icon: <UserCheck className="w-4 h-4" /> },
      { title: 'Dependência Unitária', accounts: 8, percentage: 20, color: 'red', icon: <AlertCircle className="w-4 h-4" /> },
      { title: 'Sem Sponsor Executivo', accounts: 14, percentage: 35, color: 'amber', icon: <ZapOff className="w-4 h-4" /> },
      { title: 'Mapeamento Parcial', accounts: 6, percentage: 15, color: 'slate', icon: <Search className="w-4 h-4" /> },
    ].map((d, i) => (
      <Card key={i} className="p-6 border-slate-200 shadow-sm rounded-3xl bg-white flex items-center gap-4 group hover:border-blue-200 transition-all">
        <div className={`p-3 rounded-2xl bg-${d.color}-50 text-${d.color}-600 group-hover:scale-110 transition-transform`}>
           {d.icon}
        </div>
        <div className="flex-1 min-w-0">
           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{d.title}</h4>
           <div className="flex items-end gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">{d.accounts}</span>
              <span className="text-[10px] font-bold text-slate-400 mb-1">contas</span>
           </div>
           <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={`h-full bg-${d.color}-500`} style={{ width: `${d.percentage}%` }}></div>
           </div>
        </div>
      </Card>
    ))}
  </div>
);

const ContactHeatmapsLayer: React.FC<{ accounts: any[]; people: any[] }> = ({ accounts, people }) => {
  const roles = ['Sponsor Executivo', 'Decisor Econômico', 'Técnico', 'Usuário Influenciador', 'Operações', 'Financeiro', 'Procurement', 'Champion', 'Bloqueador'];
  const channels = ['Email', 'WhatsApp', 'LinkedIn', 'Reunião', 'Evento', 'Almoco/Social'];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
      <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
        <SectionHeader title="Matriz de Cobertura Humana" subtitle="Status do Buying Group por Conta (Lines = Accounts / Cols = Roles)" icon={<Users className="w-5 h-5" />} badge="Gap Analysis" />
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-separate border-spacing-[2px]">
            <thead>
              <tr>
                <th className="p-2 min-w-[140px]"></th>
                {roles.map(role => (
                  <th key={role} className="p-2 text-[7px] font-black text-slate-400 uppercase tracking-tighter text-center h-28">
                    <span className="[writing-mode:vertical-lr] rotate-180">{role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.slice(0, 8).map((acc, i) => (
                <tr key={i}>
                  <td className="p-3 bg-slate-50 rounded-l-xl">
                    <p className="text-[10px] font-black text-slate-900 truncate max-w-[120px]">{acc.name}</p>
                  </td>
                  {roles.map((role, idx) => {
                    const person = people.find(p => p.accountId === acc.id && p.role === role);
                    const status = person ? (person.engagement > 60 ? 'Quente' : 'Frio') : 'Ausente';
                    const colors = { 'Quente': '#3b82f6', 'Frio': '#93c5fd', 'Ausente': '#f1f5f9' };
                    return (
                      <td key={idx} className="p-0">
                        <div className="w-full h-8 rounded-[4px] border border-white transition-all hover:scale-[1.1] hover:z-10 relative cursor-pointer" 
                             style={{ backgroundColor: colors[status] }} 
                             title={`${acc.name} - ${role}: ${status}`}>
                           {person?.isChampion && <div className="absolute inset-0 flex items-center justify-center"><Star className="w-2.5 h-2.5 text-white" /></div>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-6">
          {['Relacionamento Ativo', 'Mapeado (Frio)', 'Gap de Perfil'].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#93c5fd', '#f1f5f9'][i] }}></div>
              <span className="text-[8px] font-black text-slate-500 uppercase">{l}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
        <SectionHeader title="Engajamento por Canal" subtitle="Tração de interação por contato chave" icon={<Activity className="w-5 h-5" />} badgeColor="emerald" />
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-separate border-spacing-[2px]">
            <thead>
              <tr>
                <th className="p-2 min-w-[140px]"></th>
                {channels.map(c => (
                  <th key={c} className="p-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.slice(0, 10).map((p, i) => (
                <tr key={i}>
                  <td className="p-2">
                    <p className="text-[10px] font-black text-slate-800 truncate">{p.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{p.account}</p>
                  </td>
                  {channels.map((c, idx) => {
                    const isActive = p.channel === c;
                    const engagement = isActive ? p.engagement : 0;
                    return (
                      <td key={idx} className="p-0">
                        <div className={`w-full h-8 rounded-lg flex items-center justify-center transition-all hover:scale-[1.05] cursor-pointer ${
                          engagement > 70 ? 'bg-emerald-500' : 
                          engagement > 40 ? 'bg-emerald-300' : 
                          engagement > 0 ? 'bg-emerald-100' : 'bg-slate-50 opacity-40'
                        }`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase">Alta Tração</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-100"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase">Baixa Resposta</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ContactAnalyticsLayer: React.FC<{ people: any[] }> = ({ people }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
    <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
      <SectionHeader title="Influência x Acessibilidade" subtitle="Mapeamento de Decision Makers vs Facilidade de Acesso" icon={<Target className="w-5 h-5" />} />
      <div className="h-[350px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="accessibility" name="Acessibilidade" unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Acessibilidade', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 800 }} />
            <YAxis type="number" dataKey="influence" name="Influência" unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Influência', angle: -90, position: 'left', fontSize: 10, fontWeight: 800 }} />
            <ZAxis type="number" dataKey="impact" range={[50, 400]} />
            <ReTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
            <Scatter name="Contatos" data={people} fill="#3b82f6">
              {people.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.influence > 70 ? (entry.accessibility > 50 ? '#10b981' : '#f59e0b') : '#94a3b8'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
         <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-700 uppercase">Foco Direto</p>
            <p className="text-[8px] font-medium text-emerald-600">Influente & Acessível</p>
         </div>
         <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <p className="text-[10px] font-black text-amber-700 uppercase">Multicanal</p>
            <p className="text-[8px] font-medium text-amber-600">Influente & Difícil</p>
         </div>
         <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-700 uppercase">Acompanhar</p>
            <p className="text-[8px] font-medium text-slate-600">Baixa Influência</p>
         </div>
      </div>
    </Card>

    <Card className="p-8 border-slate-200 shadow-sm rounded-[40px] bg-white">
      <SectionHeader title="Engajamento x Poder Decisório" subtitle="Relacionamento ativo vs Peso no Comitê" icon={<ShieldCheck className="w-5 h-5" />} badgeColor="indigo" />
      <div className="h-[350px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="engagement" name="Engajamento" unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Engajamento', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 800 }} />
            <YAxis type="number" dataKey="influence" name="Poder Decisório" unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Poder', angle: -90, position: 'left', fontSize: 10, fontWeight: 800 }} />
            <ZAxis type="number" dataKey="impact" range={[100, 500]} />
            <ReTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Contatos" data={people} fill="#6366f1">
              {people.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.engagement > 70 ? (entry.influence > 70 ? '#3b82f6' : '#10b981') : (entry.influence > 70 ? '#ef4444' : '#94a3b8')} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
         <div className="flex gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase">Sponsor Ativo</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase">Decisor Frio</span>
            </div>
         </div>
         <Badge className="bg-indigo-50 text-indigo-700 border-none text-[8px] font-black uppercase">Foco: Reativação</Badge>
      </div>
    </Card>
  </div>
);

const ContactOperationalFilaLayer: React.FC<{ people: any[] }> = ({ people }) => (
  <Card className="p-0 border-slate-200 shadow-xl rounded-[48px] bg-white overflow-hidden border-t-8 border-t-indigo-600 mt-12 pb-8">
    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
      <div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Users className="w-7 h-7 text-indigo-600" />
          Fila Operacional de Pessoas
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Gestão tática do comitê de contas ativas</p>
      </div>
      <div className="flex gap-3">
         <Button variant="ghost" className="bg-white border border-slate-200 rounded-2xl py-3 px-6 text-[10px] font-black uppercase text-slate-600 shadow-sm">Todos os Sponsors</Button>
         <Button variant="ghost" className="bg-white border border-slate-200 rounded-2xl py-3 px-6 text-[10px] font-black uppercase text-slate-600 shadow-sm">Filtrar Bloqueadores</Button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pessoa & Cargo</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conta</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Papel ABX</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Influência</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Canal Pref.</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Último Toque</th>
            <th className="px-8 py-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {people.slice(0, 12).map((p, i) => (
            <tr key={i} className="hover:bg-indigo-50/30 transition-all group cursor-pointer text-slate-900">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white ${p.isChampion ? 'bg-emerald-500' : p.isBlocker ? 'bg-red-500' : 'bg-slate-300'}`}>
                    {p.name.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-black truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{p.title}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 items-center">
                 <p className="text-[11px] font-black text-slate-800">{p.account}</p>
              </td>
              <td className="px-6 py-6 text-center">
                <Badge className={`px-2 py-0.5 font-black text-[8px] uppercase tracking-widest border-none ${
                    p.role.includes('Sponsor') ? 'bg-blue-100 text-blue-700' :
                    p.role.includes('Champion') ? 'bg-emerald-100 text-emerald-700' :
                    p.role.includes('Bloqueador') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.role}
                </Badge>
              </td>
              <td className="px-6 py-6">
                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.influence > 70 ? 'bg-blue-600' : 'bg-slate-400'}`} style={{ width: `${p.influence}%` }}></div>
                 </div>
              </td>
              <td className="px-6 py-6">
                 <div className="flex items-center gap-2">
                    {p.channel === 'Email' ? <Mail className="w-3.5 h-3.5 text-slate-400" /> : <MessageSquare className="w-3.5 h-3.5 text-slate-400" />}
                    <span className="text-[11px] font-bold text-slate-600">{p.channel}</span>
                 </div>
              </td>
              <td className="px-6 py-6 text-center">
                 <span className="text-[11px] font-black text-slate-700">{p.lastTouch}</span>
              </td>
              <td className="px-8 py-6 text-right">
                 <Button size="sm" className="bg-white border border-slate-200 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 rounded-xl font-black text-[9px] uppercase px-4 transition-all">Ação</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ContactActionsLayer: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pb-12">
    {[
      { title: 'Aproximar Sponsor', person: 'Elena Silva', account: 'Global Bank S.A.', action: 'Agendar Intro Executiva via CEO Canopi', color: 'blue', tag: 'High Priority' },
      { title: 'Contornar Bloqueador', person: 'Ricardo Mello', account: 'Innova Retail', action: 'Enviar prova social de TI específica do setor', color: 'red', tag: 'Critical' },
      { title: 'Reativar Champion', person: 'Paula Torres', account: 'TechCorp S.A.', action: 'Compartilhar novo Case Study de Automação', color: 'emerald', tag: 'Opportunity' },
      { title: 'Blindar Conta', person: 'Gustavo Lima', account: 'Sky Logistics', action: 'Incluir em Newsletter Premium Persona-based', color: 'indigo', tag: 'Retention' },
    ].map((action, i) => (
      <Card key={i} className={`p-8 border-slate-200 shadow-sm rounded-[40px] bg-white border-l-8 border-l-${action.color}-500 group hover:shadow-lg transition-all`}>
        <div className="flex justify-between items-start mb-6">
           <Badge className={`bg-${action.color}-50 text-${action.color}-600 border-none text-[8px] font-black uppercase`}>{action.tag}</Badge>
           <Zap className={`w-4 h-4 text-${action.color}-400 group-hover:animate-pulse`} />
        </div>
        <div className="space-y-4">
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{action.title}</p>
              <h4 className="text-sm font-black text-slate-900 mt-1">{action.person}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{action.account}</p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[9px] font-black text-slate-800 uppercase mb-2">Ação Recomendada</p>
              <p className="text-[11px] font-medium text-slate-700 leading-tight">{action.action}</p>
           </div>
           <Button className={`w-full bg-${action.color}-600 text-white font-black text-[10px] uppercase py-3 rounded-2xl shadow-md hover:opacity-90 transition-all`}>Acionar Play</Button>
        </div>
      </Card>
    ))}
  </div>
);

const DataOriginFooter: React.FC = () => (
  <div className="pt-10 border-t border-slate-200 flex flex-wrap items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
     <div className="flex items-center gap-8">
        {[
          { name: 'Apollo.io', sync: 'Há 12m', icon: <Rocket className="w-4 h-4" /> },
          { name: 'SugarCRM', sync: 'Sincronizado', icon: <Database className="w-4 h-4" /> },
          { name: 'Spreadsheet', sync: 'Live', icon: <FileText className="w-4 h-4" /> },
          { name: 'Paid Media', sync: 'Pixel Ativo', icon: <Target className="w-4 h-4" /> },
        ].map((src, i) => (
          <div key={i} className="flex items-center gap-2">
             <div className="p-1.5 bg-slate-100 rounded-lg">{src.icon}</div>
             <div>
               <p className="text-[9px] font-black uppercase text-slate-900">{src.name}</p>
               <p className="text-[8px] font-bold text-slate-500">{src.sync}</p>
             </div>
          </div>
        ))}
     </div>
     <div className="text-right">
       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Canopi Intel Engine v4.2</p>
       <p className="text-[9px] font-bold text-slate-400">© 2026 ABX Command Center</p>
     </div>
  </div>
);

export const ABXOrchestration: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<{ title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);

  // Strategic Stats
  const hotUpsell = processedAccounts.filter(a => a.isCustomer && a.whitespace >= 1 && a.score > 60).slice(0, 5);
  const hotCrossSell = processedAccounts.filter(a => a.isCustomer && a.activeAreas === 1).slice(0, 5);
  const highRiskChurn = processedAccounts.filter(a => a.isCustomer && a.score < 55).slice(0, 5);

  const pipelineByVertical = [
    { name: 'Varejo', won: 450, expansion: 280, open: 150, risk: 40 },
    { name: 'Saúde', won: 320, expansion: 410, open: 90, risk: 15 },
    { name: 'Indústria', won: 280, expansion: 150, open: 210, risk: 60 },
    { name: 'Finanças', won: 510, expansion: 90, open: 120, risk: 10 },
    { name: 'Tech', won: 190, expansion: 340, open: 80, risk: 5 },
  ];

  const channelInfluence = [
    { name: 'Apollo.io', value: 35 },
    { name: 'Inbound CRM', value: 25 },
    { name: 'Paid Social', value: 15 },
    { name: 'Nativo (Canopi)', value: 12 },
    { name: 'Events', value: 8 },
    { name: 'Others', value: 5 },
  ];

  const committeeRoles = ['Champion', 'Economic Buyer', 'Technical Evaluator', 'End User', 'Procurement', 'IT Sec'];

  const handleAccountSelect = (acc: any) => {
    setModalData({
      title: `Visão 360°: ${acc.name}`,
      size: 'xl',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pain Point Prioritário</p>
                <p className="text-sm font-medium text-slate-700 italic">"{acc.obs}"</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Rota Recomendada</p>
                <p className="text-sm font-black text-blue-900">{acc.actionRoute}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Gaps de Expansão e Whitespace</h4>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(acc.solutions).map(([key, val]) => (
                  <div key={key} className={`p-4 rounded-2xl border ${val !== 'Não identificado' && val !== 'Não' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                    <p className="text-[9px] font-black uppercase text-slate-500">{key}</p>
                    <p className="text-[10px] font-bold truncate">{(val as string)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 text-white rounded-[40px] shadow-xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Dados Financeiros</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Potencial Upsell</p>
                  <p className="text-xl font-black">R$ {(acc.financial.upsell / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Potencial Cross-sell</p>
                  <p className="text-xl font-black">R$ {(acc.financial.crossSell / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 rounded-2xl h-14">Acionar Orquestração</Button>
          </div>
        </div>
      )
    });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-12 animate-in fade-in duration-700">
        
        {/* LAYER 1 & 2: HERO & KPIs */}
        <HeroLayer hotUpsell={hotUpsell} highRiskChurn={highRiskChurn} bigNumbers={bigNumbers} />

        {/* LAYER 3: INTERVENTION ROUTES (NEW) */}
        <ActionRoutesLayer accounts={processedAccounts} />

        {/* LAYER 4: PIPELINE 360° */}
        <Pipeline360Layer pipelineData={pipelineByVertical} channelData={channelInfluence} />

        {/* LAYER 5: STRATEGIC RANKINGS */}
        <RankingsLayer hotUpsell={hotUpsell} hotCrossSell={hotCrossSell} highRiskChurn={highRiskChurn} />

        {/* LAYER 6: COMMERCIAL MEMORY */}
        <CommercialMemoryLayer accounts={processedAccounts} />

        {/* LAYER 7: ABX HEATMAPS */}
        <HeatmapsLayer accounts={processedAccounts} committeeRoles={committeeRoles} />

        {/* LAYER 8: OPERATIONAL FILA */}
        <OperationalFilaLayer accounts={processedAccounts} onSelect={handleAccountSelect} />

        {/* --- PEOPLE & INFLUENCE LAYER [NEW] --- */}
        <div id="people-influence-layer" className="pt-16 border-t border-slate-200">
          <SectionHeader 
            title="Orquestração de Pessoas na Conta" 
            subtitle="Mapeamento de influência, acessibilidade e cobertura do comitê comprador" 
            icon={<Users className="w-6 h-6" />}
            badge="Influence Layer v2.0"
            badgeColor="indigo"
          />
          
          <ContactsSummaryLayer stats={contactsBigNumbers} />
          
          <HumanMappingDiagnosis accounts={processedAccounts} />
          
          <ContactHeatmapsLayer accounts={processedAccounts} people={peopleData} />
          
          <ContactAnalyticsLayer people={peopleData} />
          
          <ContactOperationalFilaLayer people={peopleData} />
          
          <ContactActionsLayer />
        </div>

        {/* DATA ORIGIN FOOTER */}
        <DataOriginFooter />

      </div>

      {modalOpen && (
        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          title={modalData?.title || ''}
          size={modalData?.size || 'md'}
        >
          {modalData?.content}
        </Modal>
      )}
    </div>
  );
};

const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);


export default ABXOrchestration;
