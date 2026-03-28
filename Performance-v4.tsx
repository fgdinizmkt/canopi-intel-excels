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
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Gauge,
  Layers3,
  LineChart as LineChartIcon,
  Radar,
  ShieldAlert,
  Target,
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
type DimensionKey = "motores" | "verticais" | "departamentos" | "cargos" | "tipos";
type Severity = "critico" | "alerta" | "ok";

type MetricCard = {
  id: string;
  title: string;
  value: string;
  delta: string;
  tone: Severity;
  helper: string;
};

type TrendPoint = {
  label: string;
  pipeline: number;
  risco: number;
  sla: number;
  executadas: number;
  concluidas: number;
  atrasadas: number;
};

type DimensionRow = {
  id: string;
  name: string;
  pipeline: number;
  conversao: number;
  eficiencia: number;
  risco: number;
  variacao: string;
  insight: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  time: string;
  tone: Severity;
  detail: string;
};

type DiagnosticRow = {
  id: string;
  title: string;
  tone: Severity;
  metric: string;
  summary: string;
  nextStep: string;
};

type AccountImpactRow = {
  id: string;
  account: string;
  movement: string;
  linkedAction: string;
  owner: string;
  channel: string;
  pipelineDelta: string;
  status: string;
  note: string;
};

type OverlayData = {
  type: "dimension" | "diagnostic" | "account";
  title: string;
  subtitle: string;
  chips: string[];
  sections: { label: string; value: string }[];
  note: string;
};

const toneClasses: Record<Severity, { chip: string; border: string; bg: string; icon: string }> = {
  critico: {
    chip: "border border-red-200 bg-red-50 text-red-700",
    border: "border-red-100",
    bg: "bg-red-50/80",
    icon: "text-red-600",
  },
  alerta: {
    chip: "border border-amber-200 bg-amber-50 text-amber-700",
    border: "border-amber-100",
    bg: "bg-amber-50/80",
    icon: "text-amber-600",
  },
  ok: {
    chip: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    bg: "bg-emerald-50/80",
    icon: "text-emerald-600",
  },
};

const metricCards: Record<TimeRange, MetricCard[]> = {
  "30d": [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 5,4M",
      delta: "+11% vs janela anterior",
      tone: "ok",
      helper: "Ganho concentrado em ABM, inbound enterprise e retomadas com narrativa executiva.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 1,3M",
      delta: "4 frentes concentram 71% do risco",
      tone: "alerta",
      helper: "Risco puxado por atraso em resposta, desalinhamento de sponsor e gargalo de operação.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "79%",
      delta: "abaixo da meta de 85%",
      tone: "alerta",
      helper: "Inbound enterprise, CRM e automação ainda puxam perda de velocidade.",
    },
    {
      id: "execucao",
      title: "Execução consolidada",
      value: "41 / 56",
      delta: "9 ainda fora do prazo",
      tone: "ok",
      helper: "Ações com owner e origem bem definidos têm taxa melhor de conclusão e efeito em pipeline.",
    },
  ],
  mes: [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 7,1M",
      delta: "+14% no mês",
      tone: "ok",
      helper: "Tração forte em ABM, outbound executivo e SEO / inbound com contas enterprise.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 1,9M",
      delta: "6 frentes pedem ajuste",
      tone: "alerta",
      helper: "CRM, inbound e social mantêm perda de eficiência em conversão e follow-up.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "81%",
      delta: "+2 p.p. no mês",
      tone: "ok",
      helper: "Melhora vem de redistribuição de owners e ajuste de fila nas contas críticas.",
    },
    {
      id: "execucao",
      title: "Execução consolidada",
      value: "66 / 89",
      delta: "13 bloqueios relevantes",
      tone: "alerta",
      helper: "Dependências de integração e handoffs entre marketing e receita ainda atrasam etapas.",
    },
  ],
  trimestre: [
    {
      id: "pipeline",
      title: "Pipeline influenciado",
      value: "R$ 16,4M",
      delta: "+18% no trimestre",
      tone: "ok",
      helper: "Expansão concentrada em contas estratégicas, retomadas e canais com melhor alinhamento operacional.",
    },
    {
      id: "risco",
      title: "Receita em risco",
      value: "R$ 3,2M",
      delta: "8 frentes críticas",
      tone: "critico",
      helper: "Desaceleração em sponsor, baixa resposta e perda de timing ainda pesam nas maiores oportunidades.",
    },
    {
      id: "sla",
      title: "SLA operacional",
      value: "77%",
      delta: "gap estrutural de capacidade",
      tone: "critico",
      helper: "Aumento de volume sem reforço proporcional de operação e automação.",
    },
    {
      id: "execucao",
      title: "Execução consolidada",
      value: "151 / 204",
      delta: "31 fora do prazo",
      tone: "alerta",
      helper: "Operação ganhou cadência, mas ainda não estabilizou em algumas frentes-chave.",
    },
  ],
};

const trendData: Record<TimeRange, TrendPoint[]> = {
  "30d": [
    { label: "S1", pipeline: 3.4, risco: 1.5, sla: 76, executadas: 9, concluidas: 7, atrasadas: 3 },
    { label: "S2", pipeline: 3.8, risco: 1.6, sla: 74, executadas: 11, concluidas: 8, atrasadas: 4 },
    { label: "S3", pipeline: 4.2, risco: 1.4, sla: 78, executadas: 13, concluidas: 10, atrasadas: 3 },
    { label: "S4", pipeline: 5.4, risco: 1.3, sla: 79, executadas: 14, concluidas: 12, atrasadas: 2 },
  ],
  mes: [
    { label: "Sem 1", pipeline: 4.5, risco: 1.8, sla: 77, executadas: 14, concluidas: 10, atrasadas: 4 },
    { label: "Sem 2", pipeline: 5.0, risco: 1.9, sla: 79, executadas: 16, concluidas: 12, atrasadas: 4 },
    { label: "Sem 3", pipeline: 6.1, risco: 1.7, sla: 81, executadas: 18, concluidas: 14, atrasadas: 3 },
    { label: "Sem 4", pipeline: 7.1, risco: 1.9, sla: 81, executadas: 18, concluidas: 15, atrasadas: 2 },
  ],
  trimestre: [
    { label: "Jan", pipeline: 4.6, risco: 2.0, sla: 74, executadas: 44, concluidas: 31, atrasadas: 9 },
    { label: "Fev", pipeline: 5.7, risco: 2.4, sla: 78, executadas: 51, concluidas: 38, atrasadas: 8 },
    { label: "Mar", pipeline: 6.1, risco: 2.1, sla: 80, executadas: 56, concluidas: 43, atrasadas: 7 },
  ],
};

const dimensionData: Record<DimensionKey, DimensionRow[]> = {
  motores: [
    {
      id: "m1",
      name: "SEO / Inbound",
      pipeline: 1.9,
      conversao: 23,
      eficiencia: 68,
      risco: 0.8,
      variacao: "+8% em pipeline, mas SLA abaixo do esperado",
      insight: "Aumento de volume sem roteamento proporcional derrubou velocidade de resposta.",
    },
    {
      id: "m2",
      name: "Outbound",
      pipeline: 1.6,
      conversao: 19,
      eficiencia: 79,
      risco: 0.5,
      variacao: "+5% em avanço de stage",
      insight: "Abordagem executiva aumentou resposta em contas de telecom e indústria.",
    },
    {
      id: "m3",
      name: "Paid Media",
      pipeline: 1.2,
      conversao: 14,
      eficiencia: 66,
      risco: 0.4,
      variacao: "CPL subiu 11% no recorte",
      insight: "Há ganho de volume, mas menor qualidade nas frentes mais amplas.",
    },
    {
      id: "m4",
      name: "CRM / Automação",
      pipeline: 0.9,
      conversao: 17,
      eficiencia: 61,
      risco: 0.9,
      variacao: "Queda de eficiência em handoff",
      insight: "Dependência de ajustes de fluxo e hygiene de base ainda pesa em follow-up.",
    },
    {
      id: "m5",
      name: "Social Media",
      pipeline: 0.6,
      conversao: 9,
      eficiencia: 58,
      risco: 0.3,
      variacao: "Tração estável, mas sem aceleração",
      insight: "A frente ajuda awareness, porém ainda não converte com força em pipeline.",
    },
  ],
  verticais: [
    { id: "v1", name: "Saúde", pipeline: 1.7, conversao: 26, eficiencia: 83, risco: 0.4, variacao: "+12% em avanço", insight: "Narrativas regulatórias e cases melhoraram a conversão do comitê." },
    { id: "v2", name: "Telecom", pipeline: 1.4, conversao: 18, eficiencia: 71, risco: 0.7, variacao: "Risco subiu em 2 contas", insight: "Sponsors técnicos estão mais lentos que o esperado no último ciclo." },
    { id: "v3", name: "Seguros", pipeline: 1.3, conversao: 21, eficiencia: 69, risco: 0.8, variacao: "Volume alto com SLA pressionado", insight: "Inbound enterprise e follow-up estão concentrando gargalo nesta vertical." },
    { id: "v4", name: "Indústria", pipeline: 1.1, conversao: 17, eficiencia: 77, risco: 0.5, variacao: "+4% em execução", insight: "Outbound e prova técnica têm mantido cadência mais consistente." },
  ],
  departamentos: [
    { id: "d1", name: "Marketing", pipeline: 2.2, conversao: 24, eficiencia: 76, risco: 0.6, variacao: "+9% na influência", insight: "Boa geração e ativação, mas ainda com perda de velocidade no handoff." },
    { id: "d2", name: "Vendas", pipeline: 1.8, conversao: 20, eficiencia: 73, risco: 0.7, variacao: "Execução desigual entre squads", insight: "Contas com sponsor ativo avançam; as demais pedem maior disciplina comercial." },
    { id: "d3", name: "Operações", pipeline: 0.8, conversao: 16, eficiencia: 63, risco: 0.9, variacao: "SLA em atenção", insight: "Integrações, priorização e dependências externas ainda seguram a velocidade." },
    { id: "d4", name: "CS / Expansão", pipeline: 0.6, conversao: 15, eficiencia: 71, risco: 0.3, variacao: "Espaço para cross-sell", insight: "Há sinais positivos, mas pouca cadência estruturada nas contas com base instalada." },
  ],
  cargos: [
    { id: "c1", name: "Diretores", pipeline: 1.9, conversao: 27, eficiencia: 81, risco: 0.4, variacao: "Melhor taxa de avanço", insight: "Mensagens com prova executiva têm trazido melhor resposta nesse perfil." },
    { id: "c2", name: "Gerentes", pipeline: 1.5, conversao: 19, eficiencia: 70, risco: 0.6, variacao: "Boa tração, mas menor velocidade", insight: "Entram mais cedo no processo, porém travam mais em alinhamento interno." },
    { id: "c3", name: "Especialistas", pipeline: 1.1, conversao: 14, eficiencia: 67, risco: 0.5, variacao: "Engajamento estável", insight: "Bom para validação técnica, menos decisivo na aceleração comercial." },
    { id: "c4", name: "Compras", pipeline: 0.5, conversao: 11, eficiencia: 56, risco: 0.7, variacao: "Maior atrito no fechamento", insight: "Faltam materiais de suporte e timing adequado para destravar esse perfil." },
  ],
  tipos: [
    { id: "t1", name: "Lead inbound quente", pipeline: 1.6, conversao: 31, eficiencia: 72, risco: 0.5, variacao: "Alta intenção, baixa velocidade", insight: "Boa qualidade, mas o SLA ainda impede melhor aproveitamento do pico de interesse." },
    { id: "t2", name: "Conta ABM estratégica", pipeline: 2.1, conversao: 23, eficiencia: 84, risco: 0.4, variacao: "Melhor impacto em ticket", insight: "Quando há owner, narrativa e sponsor mapeados, o avanço é mais previsível." },
    { id: "t3", name: "Contato reengajado", pipeline: 0.9, conversao: 16, eficiencia: 69, risco: 0.6, variacao: "Resposta irregular", insight: "Depende muito da oferta contextual e do timing da retomada." },
    { id: "t4", name: "Contato sem owner", pipeline: 0.4, conversao: 7, eficiencia: 42, risco: 0.9, variacao: "Maior perda de eficiência", insight: "A ausência de responsabilidade clara segue derrubando a taxa de avanço." },
  ],
};

const timelineEvents: TimelineEvent[] = [
  {
    id: "te1",
    title: "Queda de SLA em inbound enterprise",
    time: "Ontem · 14:20",
    tone: "critico",
    detail: "13 leads entraram fora da fila correta e elevaram o risco de perda no mesmo dia.",
  },
  {
    id: "te2",
    title: "Recuperação em MSD Saúde após ajuste de narrativa",
    time: "Ontem · 10:05",
    tone: "ok",
    detail: "Novo material executivo reabriu o diálogo e antecipou a próxima etapa comercial.",
  },
  {
    id: "te3",
    title: "CRM e automação concentraram gargalo de follow-up",
    time: "2 dias atrás",
    tone: "alerta",
    detail: "Fluxos pendentes e higiene de base impactaram tempo de resposta em 4 frentes.",
  },
  {
    id: "te4",
    title: "Outbound acelerou contas industriais",
    time: "3 dias atrás",
    tone: "ok",
    detail: "Ajuste de abordagem executiva elevou resposta e avanço em duas contas de indústria.",
  },
];

const diagnostics: DiagnosticRow[] = [
  {
    id: "dg1",
    title: "SLA abaixo do alvo em SEO / Inbound",
    tone: "critico",
    metric: "79 leads no recorte com pico de atraso",
    summary: "A operação absorveu volume maior sem reforço de roteamento e owner.",
    nextStep: "Reforçar distribuição, revisar gatilhos e ligar atraso a Ações críticas.",
  },
  {
    id: "dg2",
    title: "CRM / Automação com perda de eficiência",
    tone: "alerta",
    metric: "61% de eficiência operacional",
    summary: "Fluxos, campos e dependências externas ainda seguram follow-up e reaproveitamento.",
    nextStep: "Priorizar correções de fluxo e saneamento da base operacional.",
  },
  {
    id: "dg3",
    title: "ABM com melhor relação entre execução e avanço",
    tone: "ok",
    metric: "5 contas aceleradas no recorte",
    summary: "Quando há owner, hipótese e prova contextual, a frente avança com mais previsibilidade.",
    nextStep: "Replicar a disciplina operacional nas contas com potencial semelhante.",
  },
];

const accountImpacts: AccountImpactRow[] = [
  {
    id: "ac1",
    account: "MSD Saúde",
    movement: "Avanço de stage",
    linkedAction: "Ajustar narrativa executiva para comitê",
    owner: "Fábio Diniz",
    channel: "ABM",
    pipelineDelta: "+R$ 420k",
    status: "Positivo",
    note: "A conta voltou a responder após revisão do case, framing executivo e timing de retomada.",
  },
  {
    id: "ac2",
    account: "V.tal",
    movement: "Risco de esfriamento",
    linkedAction: "Retomar sponsor técnico e reunião de revisão",
    owner: "Camila Ribeiro",
    channel: "ABM",
    pipelineDelta: "-R$ 180k em risco",
    status: "Atenção",
    note: "A tração caiu depois do último contato. A decisão agora depende de reativar sponsor e cadência.",
  },
  {
    id: "ac3",
    account: "Carteira Seguros Enterprise",
    movement: "Recuperação operacional",
    linkedAction: "Corrigir roteamento de leads inbound",
    owner: "Ligia Martins",
    channel: "SEO / Inbound",
    pipelineDelta: "+R$ 260k recuperáveis",
    status: "Crítico em remediação",
    note: "O backlog ainda pressiona, mas a frente já mostra recuperação após ajustes de fila.",
  },
  {
    id: "ac4",
    account: "ArcelorMittal",
    movement: "Oportunidade acelerada",
    linkedAction: "Follow-up executivo com prova de valor",
    owner: "Camila Ribeiro",
    channel: "Outbound",
    pipelineDelta: "+R$ 310k",
    status: "Positivo",
    note: "A combinação entre contato executivo e ancoragem técnica melhorou a leitura de valor.",
  },
];

const dimensionLabels: Record<DimensionKey, string> = {
  motores: "Motores e canais",
  verticais: "Verticais",
  departamentos: "Departamentos",
  cargos: "Cargos e contatos",
  tipos: "Tipos de contato",
};

function formatMoney(value: number) {
  return `R$ ${value.toFixed(1)}M`;
}

function overlayFromDimension(row: DimensionRow, label: string): OverlayData {
  return {
    type: "dimension",
    title: row.name,
    subtitle: `${label} · leitura detalhada de desempenho`,
    chips: [row.variacao, `Pipeline ${formatMoney(row.pipeline)}`, `Risco ${formatMoney(row.risco)}`],
    sections: [
      { label: "Conversão", value: `${row.conversao}%` },
      { label: "Eficiência", value: `${row.eficiencia}%` },
      { label: "Pipeline", value: formatMoney(row.pipeline) },
      { label: "Receita em risco", value: formatMoney(row.risco) },
    ],
    note: row.insight,
  };
}

function overlayFromDiagnostic(row: DiagnosticRow): OverlayData {
  return {
    type: "diagnostic",
    title: row.title,
    subtitle: "Diagnóstico operacional detalhado",
    chips: [row.metric, row.nextStep],
    sections: [
      { label: "Leitura atual", value: row.metric },
      { label: "Resumo", value: row.summary },
      { label: "Próximo passo", value: row.nextStep },
    ],
    note: "Use este aprofundamento para decidir se a frente pede ajuste estrutural, ação corretiva ou escalonamento.",
  };
}

function overlayFromAccount(row: AccountImpactRow): OverlayData {
  return {
    type: "account",
    title: row.account,
    subtitle: "Impacto observado após ações e ajustes",
    chips: [row.movement, row.channel, row.status],
    sections: [
      { label: "Ação ligada", value: row.linkedAction },
      { label: "Owner", value: row.owner },
      { label: "Delta de pipeline", value: row.pipelineDelta },
      { label: "Leitura", value: row.note },
    ],
    note: "Aprofundamento útil para navegar de desempenho para contexto da conta, sem perder a visão macro da página.",
  };
}

const Performance: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [dimension, setDimension] = useState<DimensionKey>("motores");
  const [overlay, setOverlay] = useState<OverlayData | null>(null);

  const metrics = metricCards[timeRange];
  const trend = trendData[timeRange];
  const dimensions = dimensionData[dimension];

  const periodLabel = useMemo(() => {
    if (timeRange === "30d") return "Últimos 30 dias";
    if (timeRange === "mes") return "Mês atual";
    return "Trimestre atual";
  }, [timeRange]);

  const maxPipeline = Math.max(...dimensions.map((row) => row.pipeline), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                <Gauge className="h-3.5 w-3.5" />
                Desempenho v4 · leitura de performance para decidir melhor
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-[34px]">
                Evolução, eficiência e impacto em uma leitura mais analítica.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
                A página de Desempenho mostra o resultado das frentes, o comportamento ao longo do tempo e onde vale aprofundar a análise antes de decidir.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Janela ativa</div>
                <div className="mt-2 text-2xl font-extrabold text-white">{periodLabel}</div>
                <div className="mt-1 text-xs text-slate-300">Comparação contínua com a janela anterior equivalente</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Frentes monitoradas</div>
                <div className="mt-2 text-2xl font-extrabold text-white">12</div>
                <div className="mt-1 text-xs text-slate-300">Motores, verticais, departamentos e base de contatos</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Leituras aprofundáveis</div>
                <div className="mt-2 text-2xl font-extrabold text-white">Overlay</div>
                <div className="mt-1 text-xs text-slate-300">Cada bloco pode abrir detalhe com voltar, sem depender só de popup</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="bg-transparent text-slate-700 outline-none"
                >
                  <option value="30d">Últimos 30 dias</option>
                  <option value="mes">Mês atual</option>
                  <option value="trimestre">Trimestre</option>
                </select>
              </label>

              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <Layers3 className="h-4 w-4 text-slate-500" />
                <select
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value as DimensionKey)}
                  className="bg-transparent text-slate-700 outline-none"
                >
                  <option value="motores">Motores e canais</option>
                  <option value="verticais">Verticais</option>
                  <option value="departamentos">Departamentos</option>
                  <option value="cargos">Cargos e contatos</option>
                  <option value="tipos">Tipos de contato</option>
                </select>
              </label>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <Filter className="h-4 w-4 text-slate-500" />
                Tempo real com comparação histórica
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">Base clara · hero forte</span>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">v4 em evolução</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const tone = toneClasses[metric.tone];
          return (
            <div key={metric.id} className={`rounded-[24px] border ${tone.border} ${tone.bg} p-5 shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.title}</div>
                  <div className="mt-2 text-[28px] font-extrabold tracking-tight text-slate-900">{metric.value}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}>{metric.delta}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{metric.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Evolução temporal</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Como o desempenho evoluiu no recorte</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setOverlay({
                  type: "diagnostic",
                  title: "Leitura temporal consolidada",
                  subtitle: `${periodLabel} · comparação de tendência e execução`,
                  chips: ["Pipeline influenciado", "Receita em risco", "SLA", "Execução"],
                  sections: [
                    { label: "Foco", value: "Entender evolução antes de decidir em qual frente aprofundar" },
                    { label: "Momento", value: "Aceleração em pipeline, mas ainda com risco concentrado em poucas frentes" },
                    { label: "Uso", value: "Esse overlay existe para leitura de causa e efeito antes de descer para conta e ação" },
                  ],
                  note: "Desempenho deve começar em tendência e variação. Depois, sim, aprofundar em frente, gargalo e impacto.",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Ver leitura ampliada
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pipeline" name="Pipeline (R$ M)" stroke="#2563eb" fill="url(#pipelineFill)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="risco" name="Risco (R$ M)" stroke="#ef4444" fill="url(#riskFill)" strokeWidth={2} />
                    <Line type="monotone" dataKey="sla" name="SLA %" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Target className="h-4 w-4 text-blue-600" />
                  Leitura do período
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  O recorte atual mostra ganho em pipeline e melhora de execução, mas o risco ainda está concentrado em frentes com perda de velocidade operacional.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                  Execução ao longo do tempo
                </div>
                <div className="mt-3 h-[156px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="concluidas" name="Concluídas" fill="#16a34a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="atrasadas" name="Atrasadas" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline de desempenho</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Eventos que explicam o momento atual</h2>

          <div className="mt-5 space-y-3">
            {timelineEvents.map((event) => {
              const tone = toneClasses[event.tone];
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() =>
                    setOverlay({
                      type: "diagnostic",
                      title: event.title,
                      subtitle: `Timeline · ${event.time}`,
                      chips: [event.time, event.tone === "critico" ? "Crítico" : event.tone === "alerta" ? "Atenção" : "Positivo"],
                      sections: [
                        { label: "Momento", value: event.time },
                        { label: "Leitura", value: event.detail },
                        { label: "Por que importa", value: "Ajuda a conectar tendência, contexto e impacto antes de descer para iniciativa específica." },
                      ],
                      note: "Essa timeline existe para contextualizar variações de desempenho sem reduzir a leitura apenas a contas e owners.",
                    })
                  }
                  className={`w-full rounded-2xl border ${tone.border} ${tone.bg} p-4 text-left transition-all hover:border-slate-300`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${tone.icon}`}>
                      {event.tone === "critico" ? <ShieldAlert className="h-4 w-4" /> : event.tone === "alerta" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-slate-900">{event.title}</div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{event.time}</div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{event.detail}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Decomposição por dimensão</p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Abrindo o desempenho por frente, perfil e estrutura</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(dimensionLabels) as DimensionKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDimension(key)}
                className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                  dimension === key
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {dimensionLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensions} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#334155", fontSize: 12 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="pipeline" name="Pipeline (R$ M)" fill="#2563eb" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-3">
            {dimensions.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setOverlay(overlayFromDimension(row, dimensionLabels[dimension]))}
                className="rounded-[22px] border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-slate-900">{row.name}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500">{row.variacao}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pipeline</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900">{formatMoney(row.pipeline)}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Conversão</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900">{row.conversao}%</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Eficiência</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900">{row.eficiencia}%</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Risco</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900">{formatMoney(row.risco)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Participação no recorte atual</span>
                    <span>{Math.round((row.pipeline / maxPipeline) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                    <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${Math.max(16, (row.pipeline / maxPipeline) * 100)}%` }} />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{row.insight}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Diagnóstico</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Gargalos e desvios que pedem decisão</h2>

          <div className="mt-5 space-y-3">
            {diagnostics.map((row) => {
              const tone = toneClasses[row.tone];
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setOverlay(overlayFromDiagnostic(row))}
                  className={`w-full rounded-2xl border ${tone.border} ${tone.bg} p-4 text-left transition-all hover:border-slate-300`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}>
                        {row.tone === "critico" ? <ShieldAlert className="h-3.5 w-3.5" /> : row.tone === "alerta" ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {row.tone === "critico" ? "Crítico" : row.tone === "alerta" ? "Atenção" : "Positivo"}
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-900">{row.title}</h3>
                      <p className="mt-2 text-sm font-medium text-slate-600">{row.metric}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{row.summary}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Impacto em contas</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Só depois do macro, o detalhe da consequência</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              4 contas relevantes no recorte
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {accountImpacts.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setOverlay(overlayFromAccount(row))}
                className="w-full rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 text-left transition-all hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-slate-900">{row.account}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500">{row.movement}</div>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">{row.channel}</div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ação ligada</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">{row.linkedAction}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Delta</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{row.pipelineDelta}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{row.note}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {overlay ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[30px] border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 rounded-t-[30px] border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => setOverlay(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar
                  </button>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{overlay.subtitle}</p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{overlay.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {overlay.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-4 md:grid-cols-2">
                {overlay.sections.map((section) => (
                  <div key={section.label} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{section.label}</div>
                    <div className="mt-3 text-base font-bold leading-7 text-slate-900">{section.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                  {overlay.type === "dimension" ? <Radar className="h-4 w-4" /> : overlay.type === "account" ? <Building2 className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  Leitura orientada à decisão
                </div>
                <p className="mt-3 text-sm leading-7 text-blue-950">{overlay.note}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Performance;
