"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarRange,
  ChevronRight,
  Clock3,
  Filter,
  Gauge,
  Layers3,
  LineChart as LineChartIcon,
  Search,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeRange = "30d" | "mes" | "trimestre";
type EvolutionMetric = "pipeline" | "risco" | "sla" | "execucao";
type DimensionKey =
  | "canais"
  | "origens"
  | "motores"
  | "verticais"
  | "departamentos"
  | "cargos"
  | "tipos";

type Tone = "critico" | "alerta" | "ok";

type SummaryCard = {
  id: string;
  title: string;
  value: string;
  delta: string;
  tone: Tone;
  helper: string;
};

type TrendPoint = {
  label: string;
  pipeline: number;
  risco: number;
  sla: number;
  execucao: number;
  leads: number;
  conversao: number;
};

type DimensionRow = {
  id: string;
  title: string;
  subtitle: string;
  pipeline: number;
  variacao: string;
  eficiencia: number;
  risco: number;
  conversao: number;
  insight: string;
};

type DiagnosticRow = {
  id: string;
  title: string;
  tone: Tone;
  summary: string;
  why: string;
  nextStep: string;
};

type ImpactRow = {
  id: string;
  title: string;
  subtitle: string;
  pipelineDelta: string;
  status: string;
  owner: string;
  linkedAction: string;
  summary: string;
};

type OverlayState =
  | null
  | {
      type: "dimension" | "diagnostic" | "impact";
      title: string;
      subtitle: string;
      chips: string[];
      kpis: { label: string; value: string }[];
      sections: { title: string; body: string }[];
    };

const toneStyles: Record<Tone, { pill: string; soft: string; border: string; icon: string }> = {
  critico: {
    pill: "border border-red-200 bg-red-50 text-red-700",
    soft: "bg-red-50",
    border: "border-red-100",
    icon: "text-red-600",
  },
  alerta: {
    pill: "border border-amber-200 bg-amber-50 text-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-100",
    icon: "text-amber-600",
  },
  ok: {
    pill: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "text-emerald-600",
  },
};

const summaryByRange: Record<TimeRange, SummaryCard[]> = {
  "30d": [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 5,4M",
      delta: "+11% vs período anterior",
      tone: "ok",
      helper: "Alta puxada por outbound executivo, ABM e inbound enterprise.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 1,3M",
      delta: "4 frentes concentram 71% do risco",
      tone: "alerta",
      helper: "CRM, follow-up e atraso de sponsor ainda concentram desvios.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "79%",
      delta: "-6 p.p. da meta",
      tone: "alerta",
      helper: "O gap está maior em inbound enterprise e automação.",
    },
    {
      id: "execucao",
      title: "Execução efetiva",
      value: "41 / 56",
      delta: "73% concluídas no prazo",
      tone: "ok",
      helper: "Frentes com owner claro e origem consistente evoluem mais rápido.",
    },
  ],
  mes: [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 7,1M",
      delta: "+14% no mês",
      tone: "ok",
      helper: "Maior aceleração em SEO, ABM e retomadas multi-thread.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 1,9M",
      delta: "6 frentes pedem ajuste",
      tone: "alerta",
      helper: "Risco espalhado entre CRM, social e resposta comercial.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "81%",
      delta: "+2 p.p. no mês",
      tone: "ok",
      helper: "Redistribuição de owners mitigou backlog em duas frentes.",
    },
    {
      id: "execucao",
      title: "Execução efetiva",
      value: "66 / 89",
      delta: "13 bloqueios relevantes",
      tone: "alerta",
      helper: "Integrações e handoffs ainda estouram parte do ciclo.",
    },
  ],
  trimestre: [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 16,4M",
      delta: "+18% no trimestre",
      tone: "ok",
      helper: "A tração veio de canais com narrativa mais madura e melhor orquestração.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 3,2M",
      delta: "8 frentes críticas",
      tone: "critico",
      helper: "O risco está concentrado em follow-up tardio e desaceleração comercial.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "77%",
      delta: "gap estrutural de capacidade",
      tone: "critico",
      helper: "O crescimento não foi acompanhado pelo mesmo ganho operacional.",
    },
    {
      id: "execucao",
      title: "Execução efetiva",
      value: "151 / 204",
      delta: "31 fora do prazo",
      tone: "alerta",
      helper: "A eficiência subiu, mas ainda não estabilizou em todas as frentes.",
    },
  ],
};

const trendsByRange: Record<TimeRange, TrendPoint[]> = {
  "30d": [
    { label: "S1", pipeline: 3.2, risco: 1.5, sla: 75, execucao: 61, leads: 148, conversao: 14 },
    { label: "S2", pipeline: 3.8, risco: 1.4, sla: 77, execucao: 67, leads: 156, conversao: 15 },
    { label: "S3", pipeline: 4.6, risco: 1.6, sla: 78, execucao: 72, leads: 173, conversao: 17 },
    { label: "S4", pipeline: 5.4, risco: 1.3, sla: 79, execucao: 73, leads: 181, conversao: 18 },
  ],
  mes: [
    { label: "Sem 1", pipeline: 4.5, risco: 1.8, sla: 77, execucao: 68, leads: 529, conversao: 15 },
    { label: "Sem 2", pipeline: 5.0, risco: 1.9, sla: 79, execucao: 71, leads: 548, conversao: 16 },
    { label: "Sem 3", pipeline: 6.1, risco: 1.7, sla: 81, execucao: 73, leads: 583, conversao: 17 },
    { label: "Sem 4", pipeline: 7.1, risco: 1.9, sla: 81, execucao: 74, leads: 601, conversao: 18 },
  ],
  trimestre: [
    { label: "Jan", pipeline: 4.6, risco: 2.0, sla: 74, execucao: 64, leads: 1710, conversao: 14 },
    { label: "Fev", pipeline: 5.7, risco: 2.4, sla: 78, execucao: 70, leads: 1823, conversao: 16 },
    { label: "Mar", pipeline: 6.1, risco: 2.1, sla: 80, execucao: 74, leads: 1948, conversao: 17 },
  ],
};

const dimensionsByGroup: Record<DimensionKey, DimensionRow[]> = {
  canais: [
    { id: "c1", title: "SEO / Inbound", subtitle: "Orgânico, conteúdo e demanda capturada", pipeline: 2.1, variacao: "+16%", eficiencia: 82, risco: 22, conversao: 19, insight: "Ganha em volume e qualidade, mas depende de resposta mais rápida nas MQLs enterprise." },
    { id: "c2", title: "Outbound", subtitle: "Prospecção estruturada e executiva", pipeline: 1.8, variacao: "+11%", eficiencia: 79, risco: 31, conversao: 17, insight: "Melhorou com ICP mais restrito e contas multi-thread." },
    { id: "c3", title: "Tráfego Pago", subtitle: "Aquisição paga e campanhas de intenção", pipeline: 0.9, variacao: "-7%", eficiencia: 63, risco: 46, conversao: 12, insight: "CPQL subiu e a taxa de continuidade caiu em duas verticais." },
    { id: "c4", title: "Social Media", subtitle: "Presença, distribuição e engajamento", pipeline: 0.4, variacao: "+4%", eficiencia: 58, risco: 37, conversao: 9, insight: "Apoia awareness e aquecimento, mas ainda com pouco efeito direto em pipeline." },
    { id: "c5", title: "CRM / Automação", subtitle: "Nutrição, cadência e recuperação", pipeline: 1.2, variacao: "+8%", eficiencia: 74, risco: 34, conversao: 15, insight: "Existe ganho claro nas retomadas, mas backlog operacional ainda afeta SLA." },
  ],
  origens: [
    { id: "o1", title: "Intenção externa", subtitle: "G2, visitas-chave e sinais de compra", pipeline: 1.6, variacao: "+13%", eficiencia: 81, risco: 21, conversao: 20, insight: "Frente mais forte para abertura de oportunidades de ticket maior." },
    { id: "o2", title: "Inbound direto", subtitle: "Formulários, demo e contato orgânico", pipeline: 1.4, variacao: "+9%", eficiencia: 77, risco: 27, conversao: 18, insight: "Ganha volume, mas precisa de triagem mais precisa por prioridade." },
    { id: "o3", title: "Base reengajada", subtitle: "Recuperação de contas e leads antigos", pipeline: 1.0, variacao: "+17%", eficiencia: 76, risco: 29, conversao: 16, insight: "Tem maior efeito quando cruza narrativa setorial e sponsor atualizado." },
    { id: "o4", title: "Eventos e ativações", subtitle: "Eventos, webinars e relacionamento", pipeline: 0.7, variacao: "-3%", eficiencia: 61, risco: 42, conversao: 11, insight: "Bom para aceleração, mas ainda fraco em continuidade pós-evento." },
  ],
  motores: [
    { id: "m1", title: "ABM / ABX", subtitle: "Orquestração de contas estratégicas", pipeline: 2.4, variacao: "+18%", eficiencia: 84, risco: 24, conversao: 21, insight: "Motor mais consistente quando há cadência, narrativa e multi-threading." },
    { id: "m2", title: "Demand Gen", subtitle: "Programas de geração e captura de demanda", pipeline: 1.8, variacao: "+10%", eficiencia: 76, risco: 29, conversao: 17, insight: "Ganha tração quando bem alinhado a conteúdo e operação comercial." },
    { id: "m3", title: "Marketing Ops / RevOps", subtitle: "Fluxos, automação e governança", pipeline: 0.8, variacao: "+6%", eficiencia: 71, risco: 33, conversao: 13, insight: "Não lidera volume, mas altera diretamente o nível de eficiência da máquina." },
    { id: "m4", title: "Conteúdo estratégico", subtitle: "Conteúdo, prova e narrativa", pipeline: 0.9, variacao: "+12%", eficiencia: 73, risco: 25, conversao: 14, insight: "Apoia canais e acelera deals quando há case e contexto corretos." },
  ],
  verticais: [
    { id: "v1", title: "Saúde", subtitle: "Humana e animal", pipeline: 1.9, variacao: "+15%", eficiencia: 80, risco: 23, conversao: 18, insight: "Vertical mais madura em narrativa, workshops e interesse por IA aplicada." },
    { id: "v2", title: "Industrial", subtitle: "Operação, eficiência e dados", pipeline: 1.1, variacao: "+7%", eficiencia: 72, risco: 30, conversao: 14, insight: "Converte melhor quando o caso é tangível e orientado a eficiência operacional." },
    { id: "v3", title: "Serviços financeiros", subtitle: "Fintechs, bancos e seguradoras", pipeline: 1.5, variacao: "+9%", eficiencia: 75, risco: 35, conversao: 16, insight: "Tem ticket alto, mas ciclo maior e mais dependência de sponsor." },
    { id: "v4", title: "Infra / Telecom", subtitle: "Escala, dados e automação", pipeline: 0.8, variacao: "-4%", eficiencia: 62, risco: 41, conversao: 12, insight: "Perde ritmo quando a operação comercial não acompanha a velocidade do interesse." },
  ],
  departamentos: [
    { id: "d1", title: "Marketing", subtitle: "CMO, demand gen e operações", pipeline: 1.7, variacao: "+11%", eficiencia: 78, risco: 28, conversao: 18, insight: "Melhor resposta a prova prática, benchmark e ganho de eficiência." },
    { id: "d2", title: "TI / Dados", subtitle: "CTO, dados e arquitetura", pipeline: 1.5, variacao: "+8%", eficiencia: 74, risco: 27, conversao: 17, insight: "Prefere profundidade técnica e clareza de impacto sistêmico." },
    { id: "d3", title: "Operações", subtitle: "COO, processos e produtividade", pipeline: 1.2, variacao: "+14%", eficiencia: 79, risco: 24, conversao: 19, insight: "Acelera quando a proposta mostra redução de fricção operacional." },
    { id: "d4", title: "RH / People", subtitle: "Eficiência interna e experiência", pipeline: 0.6, variacao: "+5%", eficiencia: 67, risco: 34, conversao: 11, insight: "Boa abertura, mas ainda pede melhor sustentação de business case." },
  ],
  cargos: [
    { id: "cg1", title: "C-Level", subtitle: "Decisão estratégica", pipeline: 2.0, variacao: "+12%", eficiencia: 81, risco: 25, conversao: 20, insight: "Quando engaja, acelera bem o ciclo e reduz atrito político." },
    { id: "cg2", title: "Diretores", subtitle: "Patrocínio e orçamento", pipeline: 1.6, variacao: "+10%", eficiencia: 76, risco: 28, conversao: 17, insight: "É o melhor ponto para traduzir valor em priorização concreta." },
    { id: "cg3", title: "Gerentes", subtitle: "Operação e viabilização", pipeline: 1.1, variacao: "+7%", eficiencia: 73, risco: 31, conversao: 15, insight: "Converte bem com prova prática e plano de implementação claro." },
    { id: "cg4", title: "Especialistas", subtitle: "Influenciadores técnicos", pipeline: 0.7, variacao: "+4%", eficiencia: 68, risco: 33, conversao: 12, insight: "Importantes para validação, mas não lideram avanço sozinhos." },
  ],
  tipos: [
    { id: "t1", title: "Lead novo", subtitle: "Primeira entrada no ciclo", pipeline: 1.3, variacao: "+9%", eficiencia: 72, risco: 26, conversao: 14, insight: "Volume saudável, mas exige triagem melhor em contas enterprise." },
    { id: "t2", title: "Lead aquecido", subtitle: "Já tocado por campanhas ou conteúdo", pipeline: 1.7, variacao: "+13%", eficiencia: 79, risco: 22, conversao: 18, insight: "Responde melhor a narrativa setorial e prova concreta." },
    { id: "t3", title: "Conta reengajada", subtitle: "Retomada após inatividade", pipeline: 1.0, variacao: "+17%", eficiencia: 75, risco: 29, conversao: 16, insight: "Tem boa tração quando cruza timing e sponsor novo." },
    { id: "t4", title: "Cliente em expansão", subtitle: "Upsell, cross-sell e nova frente", pipeline: 1.4, variacao: "+15%", eficiencia: 83, risco: 18, conversao: 21, insight: "Melhor relação entre velocidade, confiança e ticket incremental." },
  ],
};

const diagnostics: DiagnosticRow[] = [
  {
    id: "g1",
    title: "Perda de velocidade em inbound enterprise",
    tone: "alerta",
    summary: "A triagem melhorou, mas a resposta após o primeiro sinal ainda está acima da janela ideal.",
    why: "Capacidade desigual entre owners e fila misturada com leads de menor prioridade.",
    nextStep: "Separar fila enterprise, reforçar SLA e redistribuir owners por criticidade.",
  },
  {
    id: "g2",
    title: "CPQL piorou em Tráfego Pago",
    tone: "critico",
    summary: "A aquisição segue gerando volume, mas a qualidade caiu em duas campanhas de intenção.",
    why: "Audiência ampla demais e baixa aderência entre mensagem, destino e contexto do clique.",
    nextStep: "Revisar segmentação, criativos e exclusões antes de ampliar investimento.",
  },
  {
    id: "g3",
    title: "ABM aumentou eficiência, mas concentrou risco operacional",
    tone: "ok",
    summary: "A conta certa está avançando mais rápido, mas a execução está pesada para poucos owners.",
    why: "Mais multi-threading, mais conteúdo customizado e maior carga de coordenação.",
    nextStep: "Padronizar partes do processo e distribuir apoio em operações e conteúdo.",
  },
];

const impactRows: ImpactRow[] = [
  {
    id: "i1",
    title: "MSD Saúde",
    subtitle: "Retomada com prova de IA aplicada em workshop e conteúdo derivado",
    pipelineDelta: "+R$ 420k",
    status: "Acelerando",
    owner: "M. Silva",
    linkedAction: "Executar retomada com conteúdo setorial",
    summary: "A frente ganhou tração após combinação de narrativa, case e sponsor reativado.",
  },
  {
    id: "i2",
    title: "XPTO Corp",
    subtitle: "Conta desacelerou por atraso no follow-up pós-demo",
    pipelineDelta: "-R$ 180k",
    status: "Em risco",
    owner: "A. Gomes",
    linkedAction: "Reativar sponsor e corrigir cadência",
    summary: "O interesse continuou, mas a operação perdeu timing na sequência da conversa.",
  },
  {
    id: "i3",
    title: "Nexus Fintech",
    subtitle: "Aceleração com outbound executivo e narrativa de eficiência operacional",
    pipelineDelta: "+R$ 310k",
    status: "Evoluindo",
    owner: "F. Rocha",
    linkedAction: "Expandir abordagem para novo centro de decisão",
    summary: "A conta respondeu melhor quando a conversa saiu de produto e foi para impacto operacional.",
  },
];

const timelineEvents: Record<TimeRange, { date: string; label: string; detail: string; tone: Tone }[]> = {
  "30d": [
    { date: "04 mar", label: "Ajuste em triagem inbound", detail: "Priorização enterprise separada da fila geral.", tone: "ok" },
    { date: "11 mar", label: "Pico de risco em mídia paga", detail: "Duas campanhas ampliaram custo com queda de continuidade.", tone: "critico" },
    { date: "18 mar", label: "Retomadas aquecidas", detail: "Base reengajada voltou a acelerar com prova setorial.", tone: "ok" },
    { date: "24 mar", label: "Gargalo em CRM / automação", detail: "Dependências de fluxo elevaram o backlog operacional.", tone: "alerta" },
  ],
  mes: [
    { date: "Sem 1", label: "Redistribuição de owners", detail: "Fila enterprise ganhou priorização e resposta melhor.", tone: "ok" },
    { date: "Sem 2", label: "Queda em social", detail: "Engajamento continuou, mas a continuidade em pipeline cedeu.", tone: "alerta" },
    { date: "Sem 3", label: "ABM ganhou tração", detail: "Mais contas com avanço simultâneo e multi-thread ativo.", tone: "ok" },
    { date: "Sem 4", label: "Risco em campanhas pagas", detail: "CPQL e eficiência saíram do intervalo saudável.", tone: "critico" },
  ],
  trimestre: [
    { date: "Jan", label: "Ajuste de base e governança", detail: "Menos ruído em qualificação e origem dos sinais.", tone: "ok" },
    { date: "Fev", label: "Crescimento sem reforço operacional", detail: "Volume subiu mais rápido que a capacidade.", tone: "alerta" },
    { date: "Mar", label: "Efeito de retomadas e ABM", detail: "Melhor combinação entre narrativa e oportunidade real.", tone: "ok" },
  ],
};

const dimensionLabels: Record<DimensionKey, string> = {
  canais: "Canais",
  origens: "Origens",
  motores: "Motores",
  verticais: "Verticais",
  departamentos: "Departamentos",
  cargos: "Cargos / contatos",
  tipos: "Tipos de contato",
};

function NumberPill({ value }: { value: string }) {
  const positive = value.startsWith("+");
  const negative = value.startsWith("-");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : negative
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {positive ? <TrendingUp className="mr-1 h-3 w-3" /> : negative ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
      {value}
    </span>
  );
}

function SummaryMetricCard({ card }: { card: SummaryCard }) {
  const tone = toneStyles[card.tone];
  return (
    <div className={`rounded-2xl border ${tone.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{card.title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.pill}`}>{card.delta}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{card.helper}</p>
    </div>
  );
}

function OverlayPage({ overlay, onClose }: { overlay: OverlayState; onClose: () => void }) {
  if (!overlay) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-6xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{overlay.subtitle}</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{overlay.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {overlay.chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-6 sm:grid-cols-[1.2fr_0.8fr] sm:px-8">
          <div className="space-y-6">
            {overlay.sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Leitura rápida</p>
              <div className="mt-4 grid gap-3">
                {overlay.kpis.map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
                    <p className="mt-2 text-lg font-extrabold text-slate-900">{kpi.value}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">Próximo avanço</p>
              <p className="mt-3 text-sm leading-7 text-blue-950">
                Aqui a navegação pode evoluir para páginas filhas de canal, vertical, owner, conta ou iniciativa, sempre com retorno claro para a leitura macro.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const Performance: React.FC = () => {
  const [range, setRange] = useState<TimeRange>("30d");
  const [metric, setMetric] = useState<EvolutionMetric>("pipeline");
  const [dimension, setDimension] = useState<DimensionKey>("canais");
  const [overlay, setOverlay] = useState<OverlayState>(null);
  const [ownerFilter, setOwnerFilter] = useState("todos");

  const summary = summaryByRange[range];
  const trend = trendsByRange[range];
  const timeline = timelineEvents[range];
  const dimensionRows = dimensionsByGroup[dimension];

  const headline = useMemo(() => {
    if (range === "30d") return "Últimos 30 dias";
    if (range === "mes") return "Mês corrente";
    return "Trimestre atual";
  }, [range]);

  const evolutionConfig = {
    pipeline: { title: "Pipeline influenciado", key: "pipeline" as const, unit: "R$ mi", previous: "+0,9 mi vs janela anterior" },
    risco: { title: "Receita em risco", key: "risco" as const, unit: "R$ mi", previous: "-0,2 mi vs janela anterior" },
    sla: { title: "SLA operacional", key: "sla" as const, unit: "%", previous: "+3 p.p. vs janela anterior" },
    execucao: { title: "Execução efetiva", key: "execucao" as const, unit: "%", previous: "+5 p.p. vs janela anterior" },
  }[metric];

  const dimensionChartData = dimensionRows.map((row) => ({
    name: row.title,
    pipeline: row.pipeline,
    eficiencia: row.eficiencia,
    conversao: row.conversao,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">
                <Gauge className="h-3.5 w-3.5" /> Desempenho operacional e comercial
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-[2.35rem]">
                Resultado, evolução e performance para decidir melhor onde agir.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Leitura consolidada do que melhorou, caiu, acelerou ou travou na máquina, antes de descer para owners, contas e ações específicas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Janela analisada</p>
                <p className="mt-2 text-lg font-bold text-white">{headline}</p>
                <p className="mt-2 text-sm text-slate-300">Comparação automática com a janela imediatamente anterior.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Leitura rápida</p>
                <p className="mt-2 text-lg font-bold text-white">ABM, SEO e retomadas puxam alta</p>
                <p className="mt-2 text-sm text-slate-300">Tráfego Pago e CRM ainda concentram a maior parte da fricção.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_auto_auto_auto]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value=""
              readOnly
              placeholder="Buscar frente, vertical, owner ou conta"
              className="w-full bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <CalendarRange className="h-4 w-4 text-slate-400" />
            <select value={range} onChange={(e) => setRange(e.target.value as TimeRange)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none">
              <option value="30d">Últimos 30 dias</option>
              <option value="mes">Mês</option>
              <option value="trimestre">Trimestre</option>
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Layers3 className="h-4 w-4 text-slate-400" />
            <select value={dimension} onChange={(e) => setDimension(e.target.value as DimensionKey)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none">
              {(Object.keys(dimensionLabels) as DimensionKey[]).map((key) => (
                <option key={key} value={key}>{dimensionLabels[key]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none">
              <option value="todos">Todos os owners</option>
              <option value="marketing">Owners de marketing</option>
              <option value="receita">Owners de receita</option>
              <option value="ops">Owners de operações</option>
            </select>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {summary.map((card) => (
            <SummaryMetricCard key={card.id} card={card} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Evolução temporal</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{evolutionConfig.title}</h2>
                <p className="mt-2 text-sm text-slate-600">Leitura de tendência, variação e comportamento da frente principal antes de aprofundar por dimensão.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["pipeline", "Pipeline"],
                  ["risco", "Risco"],
                  ["sla", "SLA"],
                  ["execucao", "Execução"],
                ] as [EvolutionMetric, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setMetric(key)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      metric === key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Curva principal</p>
                    <p className="text-sm font-semibold text-slate-700">{evolutionConfig.previous}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                    <LineChartIcon className="h-3.5 w-3.5" /> {evolutionConfig.unit}
                  </div>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey={evolutionConfig.key} stroke="#0f172a" strokeWidth={2.5} fill="url(#trendFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">Timeline do período</p>
                <div className="mt-4 space-y-3">
                  {timeline.map((item) => {
                    const tone = toneStyles[item.tone];
                    return (
                      <div key={item.date + item.label} className="flex gap-3 rounded-2xl border border-slate-200 p-3">
                        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone === "ok" ? "bg-emerald-500" : item.tone === "alerta" ? "bg-amber-500" : "bg-red-500"}`} />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.date}</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.pill}`}>{item.tone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Leads / volume</p>
                <div className="mt-3 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2.2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Conversão</p>
                <div className="mt-3 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="conversao" stroke="#16a34a" strokeWidth={2.2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Leitura do momento</p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">ABM e SEO puxam a subida do pipeline.</div>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">O risco segue mais alto onde a operação responde tarde.</div>
                  <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">Mídia paga ainda exige ajuste antes de ganhar escala de novo.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Resumo executivo</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Target className="h-4 w-4 text-blue-600" /> Melhor tração</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">ABM, retomadas e SEO / Inbound estão concentrando melhor relação entre volume, qualidade e avanço real.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldAlert className="h-4 w-4 text-amber-600" /> Maior fricção</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">CRM / automação e Tráfego Pago ainda pressionam SLA, continuidade e custo por oportunidade qualificada.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Clock3 className="h-4 w-4 text-emerald-600" /> Próxima decisão</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">Ajustar distribuição operacional, corrigir campanhas com pior custo e reforçar fluxo das retomadas com melhor resposta.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Quebra por dimensão</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Onde a performance ganha ou perde eficiência</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(dimensionLabels) as DimensionKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setDimension(key)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    dimension === key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {dimensionLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Pipeline, eficiência e conversão por {dimensionLabels[dimension].toLowerCase()}</p>
                <NumberPill value={dimensionRows[0]?.variacao ?? "+0%"} />
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dimensionChartData} layout="vertical" margin={{ top: 4, right: 10, left: 10, bottom: 4 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pipeline" fill="#0f172a" radius={[0, 6, 6, 0]} name="Pipeline (R$ mi)" />
                    <Bar dataKey="eficiencia" fill="#2563eb" radius={[0, 6, 6, 0]} name="Eficiência (%)" />
                    <Bar dataKey="conversao" fill="#16a34a" radius={[0, 6, 6, 0]} name="Conversão (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              {dimensionRows.map((row) => (
                <button
                  key={row.id}
                  onClick={() =>
                    setOverlay({
                      type: "dimension",
                      title: row.title,
                      subtitle: `${dimensionLabels[dimension]} • leitura detalhada`,
                      chips: [row.subtitle, `Variação ${row.variacao}`, `Risco ${row.risco}%`],
                      kpis: [
                        { label: "Pipeline", value: `R$ ${row.pipeline.toFixed(1)}M` },
                        { label: "Eficiência", value: `${row.eficiencia}%` },
                        { label: "Conversão", value: `${row.conversao}%` },
                        { label: "Risco", value: `${row.risco}%` },
                      ],
                      sections: [
                        { title: "Leitura", body: row.insight },
                        { title: "Causa provável", body: "A performance desta dimensão está sendo afetada pela combinação entre qualidade de entrada, resposta operacional e narrativa aplicada no momento da abordagem." },
                        { title: "Próximo aprofundamento", body: "Daqui a navegação pode abrir páginas específicas de frente, owner, conta ou iniciativa, sempre preservando o retorno para a leitura macro." },
                      ],
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-900">{row.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.subtitle}</p>
                    </div>
                    <NumberPill value={row.variacao} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{row.insight}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Pipeline <span className="ml-1 text-slate-900">R$ {row.pipeline.toFixed(1)}M</span></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Eficiência <span className="ml-1 text-slate-900">{row.eficiencia}%</span></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Conversão <span className="ml-1 text-slate-900">{row.conversao}%</span></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Risco <span className="ml-1 text-slate-900">{row.risco}%</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Diagnóstico</p>
            <div className="mt-4 space-y-3">
              {diagnostics.map((row) => {
                const tone = toneStyles[row.tone];
                return (
                  <button
                    key={row.id}
                    onClick={() =>
                      setOverlay({
                        type: "diagnostic",
                        title: row.title,
                        subtitle: "Diagnóstico operacional e comercial",
                        chips: [row.tone, "Causa + consequência + próximo passo"],
                        kpis: [
                          { label: "Tonalidade", value: row.tone },
                          { label: "Foco", value: "Eficiência e continuidade" },
                          { label: "Estado", value: "Exige decisão" },
                        ],
                        sections: [
                          { title: "Resumo", body: row.summary },
                          { title: "Por que aconteceu", body: row.why },
                          { title: "Próximo passo", body: row.nextStep },
                        ],
                      })
                    }
                    className={`w-full rounded-2xl border ${tone.border} ${tone.soft} p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`mt-0.5 h-4 w-4 ${tone.icon}`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{row.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{row.summary}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.pill}`}>{row.tone}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Impacto em contas e iniciativas</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Só depois da leitura macro, onde isso ganhou ou perdeu consequência</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {impactRows.map((row) => (
                <button
                  key={row.id}
                  onClick={() =>
                    setOverlay({
                      type: "impact",
                      title: row.title,
                      subtitle: row.subtitle,
                      chips: [row.status, row.owner, row.linkedAction],
                      kpis: [
                        { label: "Delta de pipeline", value: row.pipelineDelta },
                        { label: "Status", value: row.status },
                        { label: "Owner", value: row.owner },
                      ],
                      sections: [
                        { title: "Leitura", body: row.summary },
                        { title: "Ação relacionada", body: row.linkedAction },
                        { title: "Uso da navegação", body: "Este detalhe pode evoluir para páginas específicas de conta, iniciativa, timeline e conjunto de evidências, sempre com botão voltar para a página de Desempenho." },
                      ],
                    })
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">{row.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{row.subtitle}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{row.summary}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{row.pipelineDelta}</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{row.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Owner <span className="ml-1 text-slate-900">{row.owner}</span></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Ação <span className="ml-1 text-slate-900">{row.linkedAction}</span></div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Detalhe <span className="ml-1 text-slate-900">Abrir visão</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <OverlayPage overlay={overlay} onClose={() => setOverlay(null)} />
    </div>
  );
};

export default Performance;
