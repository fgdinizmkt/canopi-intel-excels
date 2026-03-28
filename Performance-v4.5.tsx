"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ChevronDown,
  Filter,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

type PeriodKey = "30d" | "90d" | "quarter";
type DimensionKey = "canais" | "origens" | "motores" | "verticais" | "departamentos" | "cargos" | "tipos";
type Tone = "positive" | "warning" | "critical" | "neutral";
type DetailTab = "overview" | "accounts" | "actions" | "owners";

type MetricPoint = { label: string; value: number };
type Metric = {
  key: string;
  label: string;
  current: string;
  previous: string;
  delta: string;
  tone: Tone;
  summary: string;
  cause: string;
  decision: string;
  series: MetricPoint[];
};

type RelatedItem = { title: string; subtitle: string; status: string; delta: string };
type DimensionItem = {
  id: string;
  name: string;
  current: number;
  previous: number;
  delta: number;
  pipeline: string;
  tone: Tone;
  state: string;
  summary: string;
  cause: string;
  decision: string;
  accounts: RelatedItem[];
  actions: RelatedItem[];
  owners: RelatedItem[];
};

type DiagnosticItem = {
  title: string;
  tone: Tone;
  summary: string;
  cause: string;
  decision: string;
};

type ImpactItem = {
  account: string;
  tone: Tone;
  delta: string;
  owner: string;
  action: string;
  summary: string;
};

const periods: { key: PeriodKey; label: string }[] = [
  { key: "30d", label: "Últimos 30 dias" },
  { key: "90d", label: "Últimos 90 dias" },
  { key: "quarter", label: "Trimestre atual" },
];

const dimensions: { key: DimensionKey; label: string }[] = [
  { key: "canais", label: "Canais" },
  { key: "origens", label: "Origens" },
  { key: "motores", label: "Motores" },
  { key: "verticais", label: "Verticais" },
  { key: "departamentos", label: "Departamentos" },
  { key: "cargos", label: "Cargos / contatos" },
  { key: "tipos", label: "Tipos de contato" },
];

const metricsByPeriod: Record<PeriodKey, Metric[]> = {
  "30d": [
    {
      key: "pipeline",
      label: "Pipeline influenciado",
      current: "R$ 5,4M",
      previous: "R$ 4,8M",
      delta: "+12,5%",
      tone: "positive",
      summary: "ABM, SEO / inbound e retomadas puxaram o avanço do período.",
      cause: "Mais continuidade depois do sinal e melhor priorização por fit.",
      decision: "Escalar as frentes que ganharam eficiência sem sobrecarregar owners.",
      series: [
        { label: "S1", value: 3.7 },
        { label: "S2", value: 4.2 },
        { label: "S3", value: 4.8 },
        { label: "S4", value: 5.4 },
      ],
    },
    {
      key: "risk",
      label: "Receita em risco",
      current: "R$ 1,3M",
      previous: "R$ 1,0M",
      delta: "+30%",
      tone: "warning",
      summary: "Inbound enterprise e CRM pressionaram continuidade e resposta.",
      cause: "Fila, handoff e automação ainda concentram parte do atrito.",
      decision: "Corrigir a base operacional antes de ampliar pressão no topo.",
      series: [
        { label: "S1", value: 0.8 },
        { label: "S2", value: 1.0 },
        { label: "S3", value: 1.1 },
        { label: "S4", value: 1.3 },
      ],
    },
    {
      key: "sla",
      label: "SLA operacional",
      current: "79%",
      previous: "84%",
      delta: "-5 pts",
      tone: "critical",
      summary: "A máquina perdeu velocidade justamente onde o volume enterprise cresceu.",
      cause: "Roteamento e owner indefinido em parte dos casos quentes.",
      decision: "Separar fila enterprise e revisar regras de resposta ainda hoje.",
      series: [
        { label: "S1", value: 86 },
        { label: "S2", value: 83 },
        { label: "S3", value: 81 },
        { label: "S4", value: 79 },
      ],
    },
    {
      key: "execution",
      label: "Execução efetiva",
      current: "41 / 56",
      previous: "34 / 51",
      delta: "+7 ações",
      tone: "positive",
      summary: "Ações com owner claro e origem definida concluíram melhor.",
      cause: "Contexto mais objetivo elevou consequência operacional.",
      decision: "Aplicar essa disciplina nas frentes que ainda dependem de remediação.",
      series: [
        { label: "S1", value: 24 },
        { label: "S2", value: 31 },
        { label: "S3", value: 37 },
        { label: "S4", value: 41 },
      ],
    },
  ],
  "90d": [
    {
      key: "pipeline",
      label: "Pipeline influenciado",
      current: "R$ 13,8M",
      previous: "R$ 11,4M",
      delta: "+21%",
      tone: "positive",
      summary: "ABM, outbound consultivo e SEO sustentaram crescimento consistente.",
      cause: "Mais combinação entre contexto, decisão e continuidade.",
      decision: "Dobrar nas frentes que escalam sem perder aderência.",
      series: [
        { label: "M1", value: 8.4 },
        { label: "M2", value: 9.2 },
        { label: "M3", value: 10.4 },
        { label: "M4", value: 11.8 },
        { label: "M5", value: 12.7 },
        { label: "M6", value: 13.8 },
      ],
    },
    {
      key: "risk",
      label: "Receita em risco",
      current: "R$ 2,9M",
      previous: "R$ 2,4M",
      delta: "+R$ 0,5M",
      tone: "warning",
      summary: "Volume cresceu antes da correção estrutural de CRM e enterprise.",
      cause: "Concentração de risco em automação, mídia e follow-up.",
      decision: "Atacar risco estrutural antes de ampliar aquisição.",
      series: [
        { label: "M1", value: 2.1 },
        { label: "M2", value: 2.2 },
        { label: "M3", value: 2.3 },
        { label: "M4", value: 2.5 },
        { label: "M5", value: 2.7 },
        { label: "M6", value: 2.9 },
      ],
    },
    {
      key: "sla",
      label: "SLA operacional",
      current: "81%",
      previous: "85%",
      delta: "-4 pts",
      tone: "critical",
      summary: "Escala subiu mais rápido do que a capacidade de resposta enterprise.",
      cause: "Roteamento e handoff sem absorver o novo volume.",
      decision: "Ajustar governança operacional antes do próximo ciclo.",
      series: [
        { label: "M1", value: 86 },
        { label: "M2", value: 85 },
        { label: "M3", value: 84 },
        { label: "M4", value: 82 },
        { label: "M5", value: 82 },
        { label: "M6", value: 81 },
      ],
    },
    {
      key: "execution",
      label: "Execução efetiva",
      current: "124 / 161",
      previous: "101 / 149",
      delta: "+23 ações",
      tone: "positive",
      summary: "Contexto mais claro elevou taxa de conclusão do ciclo.",
      cause: "Frentes com owner claro aprenderam mais rápido.",
      decision: "Replicar a disciplina das melhores frentes nas mais frágeis.",
      series: [
        { label: "M1", value: 71 },
        { label: "M2", value: 78 },
        { label: "M3", value: 88 },
        { label: "M4", value: 101 },
        { label: "M5", value: 114 },
        { label: "M6", value: 124 },
      ],
    },
  ],
  quarter: [
    {
      key: "pipeline",
      label: "Pipeline influenciado",
      current: "R$ 7,9M",
      previous: "R$ 6,6M",
      delta: "+19,7%",
      tone: "positive",
      summary: "ABM, SEO e retomadas concentraram os maiores ganhos do trimestre.",
      cause: "Mais sponsor ativado, melhor contexto e consequência comercial.",
      decision: "Proteger as frentes saudáveis e corrigir as que drenam eficiência.",
      series: [
        { label: "Jan", value: 6.6 },
        { label: "Fev", value: 7.1 },
        { label: "Mar", value: 7.9 },
      ],
    },
    {
      key: "risk",
      label: "Receita em risco",
      current: "R$ 1,7M",
      previous: "R$ 1,5M",
      delta: "+R$ 0,2M",
      tone: "warning",
      summary: "Automação, mídia e inbound enterprise ainda concentram fricção.",
      cause: "A máquina cresceu com partes estruturais ainda frágeis.",
      decision: "Corrigir a base antes de escalar a pressão comercial.",
      series: [
        { label: "Jan", value: 1.3 },
        { label: "Fev", value: 1.4 },
        { label: "Mar", value: 1.7 },
      ],
    },
    {
      key: "sla",
      label: "SLA operacional",
      current: "80%",
      previous: "83%",
      delta: "-3 pts",
      tone: "critical",
      summary: "A velocidade de resposta perdeu tração com o aumento do volume.",
      cause: "Fila enterprise e dependências de automação sem ajuste suficiente.",
      decision: "Atacar velocidade antes de ampliar campanhas e novas frentes.",
      series: [
        { label: "Jan", value: 84 },
        { label: "Fev", value: 82 },
        { label: "Mar", value: 80 },
      ],
    },
    {
      key: "execution",
      label: "Execução efetiva",
      current: "57 / 73",
      previous: "49 / 70",
      delta: "+8 ações",
      tone: "positive",
      summary: "As frentes melhor lidas continuam fechando melhor o ciclo.",
      cause: "Mais contexto e menos ação genérica.",
      decision: "Levar esse padrão para os blocos ainda dependentes de remediação.",
      series: [
        { label: "Jan", value: 49 },
        { label: "Fev", value: 53 },
        { label: "Mar", value: 57 },
      ],
    },
  ],
};

const dimensionData: Record<DimensionKey, DimensionItem[]> = {
  canais: [
    {
      id: "abm",
      name: "ABM",
      current: 82,
      previous: 64,
      delta: 18,
      pipeline: "R$ 3,2M",
      tone: "positive",
      state: "Melhorou e acelerou",
      summary: "É a frente com melhor combinação entre qualidade de conta, sponsor e continuidade.",
      cause: "Expansão e retomada em contas maduras com narrativa e prova mais contextualizadas.",
      decision: "Escalar por vertical e distribuir melhor a execução entre owners.",
      accounts: [
        { title: "MSD Saúde", subtitle: "Avanço de stage com reforço executivo", status: "Acelerou", delta: "+R$ 420k" },
        { title: "Minerva Foods", subtitle: "Reativação com leitura de uso e expansão", status: "Melhorou", delta: "+R$ 280k" },
      ],
      actions: [
        { title: "Ajustar narrativa executiva", subtitle: "Comitê e sponsor com linguagem de impacto", status: "Concluída", delta: "+2 contas" },
        { title: "Priorizar contas de expansão", subtitle: "Lista com whitespace e fit mais alto", status: "Em andamento", delta: "+18%" },
      ],
      owners: [
        { title: "Fábio Diniz", subtitle: "Expansão e comitês executivos", status: "Sob controle", delta: "6 contas" },
        { title: "Camila Ribeiro", subtitle: "Retomadas e prova de valor", status: "Atenção", delta: "Backlog 4" },
      ],
    },
    {
      id: "crm",
      name: "CRM / automação",
      current: 49,
      previous: 58,
      delta: -9,
      pipeline: "R$ 0,9M",
      tone: "critical",
      state: "Piorou",
      summary: "É a frente com maior concentração de gargalo operacional no período.",
      cause: "Regras de roteamento, filas e dependências de automação atrasaram o ciclo.",
      decision: "Atacar handoff, fila enterprise e follow-up ainda hoje.",
      accounts: [
        { title: "Carteira Seguros Enterprise", subtitle: "Leads quentes presos em fila errada", status: "Crítico", delta: "R$ 260k" },
        { title: "Nexus Fintech", subtitle: "Follow-up caiu após enriquecimento parcial", status: "Alerta", delta: "R$ 140k" },
      ],
      actions: [
        { title: "Corrigir roteamento inbound", subtitle: "Fila enterprise separada da geral", status: "Nova", delta: "2h SLA" },
        { title: "Revisar automações de follow-up", subtitle: "Remover conflito entre regras", status: "Bloqueada", delta: "1 dependência" },
      ],
      owners: [
        { title: "Revenue Ops", subtitle: "Fluxos e handoff", status: "Crítico", delta: "SLA -5 pts" },
        { title: "Tech Ops", subtitle: "Dependências técnicas", status: "Alerta", delta: "3 filas" },
      ],
    },
    {
      id: "seo",
      name: "SEO / inbound",
      current: 71,
      previous: 63,
      delta: 8,
      pipeline: "R$ 1,4M",
      tone: "positive",
      state: "Melhorou",
      summary: "Crescimento consistente puxado por conteúdo de intenção e páginas com aderência melhor.",
      cause: "Conteúdo de decisão e navegação técnica geraram continuidade melhor.",
      decision: "Ligar páginas de intenção ao play de SDR e verticalizar melhor os temas.",
      accounts: [
        { title: "Cluster Manufatura", subtitle: "Interesse técnico virou conversa comercial", status: "Melhorou", delta: "+R$ 220k" },
      ],
      actions: [
        { title: "Conectar páginas visitadas ao play SDR", subtitle: "Conteúdo técnico com follow-up contextual", status: "Em andamento", delta: "+8 pts" },
      ],
      owners: [
        { title: "Marketing de Conteúdo", subtitle: "Autoridade e SEO", status: "Sob controle", delta: "CTR +11%" },
      ],
    },
  ],
  origens: [
    {
      id: "intencao",
      name: "Sinais de intenção",
      current: 78,
      previous: 63,
      delta: 15,
      pipeline: "R$ 2,7M",
      tone: "positive",
      state: "Melhorou e acelerou",
      summary: "Responder rápido ao sinal certo continua sendo um dos maiores aceleradores.",
      cause: "Combinação de intenção, fit e sponsor elevou a taxa de continuidade.",
      decision: "Priorizar sinais combinados com recorte de fit e vertical.",
      accounts: [
        { title: "Clever Devices", subtitle: "Páginas técnicas e prova setorial", status: "Acelerou", delta: "+R$ 190k" },
      ],
      actions: [
        { title: "Priorizar intenção + fit", subtitle: "Fila de resposta em até 2h", status: "Ativa", delta: "+15 pts" },
      ],
      owners: [
        { title: "Squad SDR", subtitle: "Resposta a sinais", status: "Melhorou", delta: "2h → 47 min" },
      ],
    },
  ],
  motores: [
    {
      id: "expansao",
      name: "Expansão",
      current: 81,
      previous: 66,
      delta: 15,
      pipeline: "R$ 2,9M",
      tone: "positive",
      state: "Melhorou e acelerou",
      summary: "É hoje o motor com melhor retorno quando existe sponsor e prova de valor.",
      cause: "Uso de cases, workshops e leitura de whitespace.",
      decision: "Escalar trilhas por uso, risco e oportunidade de cross-sell.",
      accounts: [
        { title: "MSD Saúde Animal", subtitle: "Expansão com lastro de workshop", status: "Acelerou", delta: "+R$ 330k" },
      ],
      actions: [
        { title: "Playbook de expansão por vertical", subtitle: "Saúde e manufatura primeiro", status: "Planejada", delta: "+15 pts" },
      ],
      owners: [
        { title: "CS / expansão", subtitle: "Trilhas por uso", status: "Sob controle", delta: "4 frentes" },
      ],
    },
  ],
  verticais: [
    {
      id: "saude",
      name: "Saúde",
      current: 84,
      previous: 69,
      delta: 15,
      pipeline: "R$ 2,6M",
      tone: "positive",
      state: "Melhorou e acelerou",
      summary: "Saúde lidera em aderência quando narrativa executiva e prova prática caminham juntas.",
      cause: "Cases, workshop e sponsor ativado sustentaram o avanço.",
      decision: "Transformar ativos de autoridade em sequência comercial por persona.",
      accounts: [
        { title: "MSD", subtitle: "Workshop e caso prático destravaram avanço", status: "Melhorou", delta: "+R$ 420k" },
      ],
      actions: [
        { title: "Escalar narrativa por subvertical", subtitle: "Saúde humana e animal", status: "Em andamento", delta: "+15 pts" },
      ],
      owners: [
        { title: "ABM Saúde", subtitle: "Cobertura executiva", status: "Sob controle", delta: "2 squads" },
      ],
    },
  ],
  departamentos: [
    {
      id: "revops",
      name: "Revenue Ops",
      current: 57,
      previous: 66,
      delta: -9,
      pipeline: "R$ 2,2M",
      tone: "critical",
      state: "Piorou",
      summary: "Revenue Ops concentra a maior parte da perda de eficiência do período.",
      cause: "Regras, filas e tempos de resposta não acompanharam a escala.",
      decision: "Atacar roteamento, SLA e automações antes de ampliar volume.",
      accounts: [
        { title: "Inbound enterprise", subtitle: "Fila pressionada e owner indefinido", status: "Crítico", delta: "SLA -5 pts" },
      ],
      actions: [
        { title: "Corrigir fila enterprise", subtitle: "Separar casos de alta intenção", status: "Nova", delta: "2h SLA" },
      ],
      owners: [
        { title: "Revenue Ops", subtitle: "Governança e fila", status: "Crítico", delta: "3 dependências" },
      ],
    },
  ],
  cargos: [
    {
      id: "clevel",
      name: "C-Level",
      current: 81,
      previous: 69,
      delta: 12,
      pipeline: "R$ 2,0M",
      tone: "positive",
      state: "Melhorou",
      summary: "Quando a narrativa certa chega ao C-Level, o ciclo encurta e o patrocínio melhora.",
      cause: "Mais conteúdo executivo, menos abordagem genérica.",
      decision: "Expandir pontos de vista executivos por vertical e tese.",
      accounts: [
        { title: "Telecom enterprise", subtitle: "Diretoria respondeu melhor ao benchmark", status: "Melhorou", delta: "+R$ 160k" },
      ],
      actions: [
        { title: "Narrativa executiva por setor", subtitle: "Foco em dores, benchmark e risco", status: "Planejada", delta: "+12 pts" },
      ],
      owners: [
        { title: "ABM / liderança comercial", subtitle: "Patrocínio executivo", status: "Melhorou", delta: "3 comitês" },
      ],
    },
  ],
  tipos: [
    {
      id: "clientes",
      name: "Clientes ativos",
      current: 79,
      previous: 70,
      delta: 9,
      pipeline: "R$ 2,3M",
      tone: "positive",
      state: "Melhorou",
      summary: "Clientes ativos mostram a melhor relação entre contexto, uso e expansão.",
      cause: "Leitura melhor de whitespace, risco e oportunidade.",
      decision: "Subir trilhas por uso, risco e expansão potencial.",
      accounts: [
        { title: "MSD", subtitle: "Expansão ligada a workshop e uso", status: "Melhorou", delta: "+R$ 250k" },
      ],
      actions: [
        { title: "Trilhas por whitespace", subtitle: "Ativos com leitura de oportunidade", status: "Ativa", delta: "+9 pts" },
      ],
      owners: [
        { title: "CS / expansão", subtitle: "Cobertura de carteira", status: "Sob controle", delta: "5 contas" },
      ],
    },
  ],
};

const diagnostics: DiagnosticItem[] = [
  {
    title: "Inbound enterprise perdeu velocidade",
    tone: "warning",
    summary: "O ganho de volume veio antes da correção de roteamento e resposta.",
    cause: "CRM / automação e owner indefinido ainda pressionam a fila.",
    decision: "Corrigir fila enterprise e revisar handoff antes de ampliar campanha.",
  },
  {
    title: "Tráfego Pago piorou custo e continuidade",
    tone: "critical",
    summary: "Duas campanhas ganharam volume sem sustentar qualidade e próxima etapa.",
    cause: "Excesso de verba em grupos com segmentação solta e criativo genérico.",
    decision: "Redistribuir verba, ajustar criativos e reduzir desperdício por segmento.",
  },
  {
    title: "ABM é a frente mais saudável para escalar",
    tone: "positive",
    summary: "Entregou melhor relação entre esforço, consequência e avanço de pipeline.",
    cause: "Conta melhor lida, owner claro e prova conectada ao contexto.",
    decision: "Escalar por vertical sem concentrar execução em poucos owners.",
  },
];

const impacts: ImpactItem[] = [
  {
    account: "MSD Saúde",
    tone: "positive",
    delta: "+R$ 420k",
    owner: "Fábio Diniz",
    action: "Ajustar narrativa executiva para comitê",
    summary: "A conta ganhou tração após narrativa executiva + case + sponsor reativado.",
  },
  {
    account: "V.tal",
    tone: "warning",
    delta: "-R$ 180k em risco",
    owner: "Camila Ribeiro",
    action: "Retomar sponsor técnico e revisão",
    summary: "Open rate caiu e a reunião ainda não foi confirmada.",
  },
  {
    account: "Carteira Seguros Enterprise",
    tone: "critical",
    delta: "+R$ 260k",
    owner: "Ligia Martins",
    action: "Corrigir roteamento de leads inbound",
    summary: "O backlog ainda pressiona o SLA, mas a remediação já começou.",
  },
];

function toneClass(tone: Tone) {
  if (tone === "positive") return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", panel: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", text: "text-emerald-700" };
  if (tone === "warning") return { badge: "bg-amber-50 text-amber-700 border-amber-200", panel: "bg-amber-50 border-amber-200", bar: "bg-amber-500", text: "text-amber-700" };
  if (tone === "critical") return { badge: "bg-rose-50 text-rose-700 border-rose-200", panel: "bg-rose-50 border-rose-200", bar: "bg-rose-500", text: "text-rose-700" };
  return { badge: "bg-slate-50 text-slate-700 border-slate-200", panel: "bg-slate-50 border-slate-200", bar: "bg-slate-500", text: "text-slate-700" };
}

function directionText(metric: Metric) {
  if (metric.tone === "positive") return "Melhorou";
  if (metric.tone === "critical") return "Piorou";
  return "Em atenção";
}

function SimpleLineChart({ series, tone, compact = false }: { series: MetricPoint[]; tone: Tone; compact?: boolean }) {
  const width = 520;
  const height = compact ? 88 : 210;
  const padX = 22;
  const padY = 18;
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = series.map((point, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(series.length - 1, 1);
    const y = height - padY - ((point.value - min) / spread) * (height - padY * 2);
    return { ...point, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
  const stroke = tone === "positive" ? "#10b981" : tone === "warning" ? "#f59e0b" : tone === "critical" ? "#ef4444" : "#64748b";
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {[0, 1, 2, 3].map((line) => {
        const y = padY + (line * (height - padY * 2)) / 3;
        return <line key={line} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />;
      })}
      <path d={areaPath} fill={stroke} fillOpacity="0.08" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4" fill="white" stroke={stroke} strokeWidth="2.5" />
          <text x={point.x} y={height - 3} textAnchor="middle" fontSize="10" fill="#94a3b8">{point.label}</text>
        </g>
      ))}
    </svg>
  );
}

function OverlayShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/35 backdrop-blur-[2px]">
      <div className="mx-auto flex h-full max-w-7xl items-start justify-center px-6 py-6">
        <div className="max-h-[94vh] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-6 py-5">
            <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </button>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          <div className="max-h-[calc(94vh-128px)] overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const Performance: React.FC = () => {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [dimension, setDimension] = useState<DimensionKey>("canais");
  const [metricKey, setMetricKey] = useState("pipeline");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");

  const metrics = metricsByPeriod[period];
  const selectedMetric = metrics.find((item) => item.key === metricKey) ?? metrics[0];
  const items = dimensionData[dimension];
  const detail = items.find((item) => item.id === detailId) ?? null;

  const readingCards = useMemo(
    () => [
      { title: "O que subiu", text: "ABM, SEO / inbound e retomadas ganharam continuidade e empurraram pipeline para cima.", tone: "positive" as Tone },
      { title: "O que caiu", text: "SLA, CRM e mídia perderam eficiência com o novo volume enterprise.", tone: "critical" as Tone },
      { title: "O que pede decisão", text: "Redistribuir esforço operacional e corrigir mídia / CRM antes de ampliar pressão no topo.", tone: "warning" as Tone },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1360px] px-6 pb-16 pt-8">
        <section className="overflow-hidden rounded-[30px] bg-[#0b2b78] shadow-[0_24px_80px_rgba(11,43,120,0.18)]">
          <div className="grid gap-6 px-8 py-7 lg:grid-cols-[1.25fr,1fr] lg:px-10">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">Desempenho</span>
              <h1 className="mt-4 text-[34px] font-black leading-tight tracking-tight text-white">Ler performance, entender causas e decidir onde agir.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">Resultado e evolução primeiro. Conta, owner e ação específica só entram depois.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.map((metric) => (
                <button key={metric.key} onClick={() => setMetricKey(metric.key)} className={`rounded-2xl border p-4 text-left transition ${metric.key === selectedMetric.key ? "border-white/25 bg-white/14" : "border-white/10 bg-white/6 hover:bg-white/10"}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/58">{metric.label}</div>
                  <div className="mt-2 text-2xl font-black text-white">{metric.current}</div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/68">
                    <span>Anterior {metric.previous}</span>
                    <span className="rounded-full border border-white/15 px-2 py-1 font-bold">{metric.delta}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.4fr,0.7fr,0.7fr,0.7fr]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <input className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Buscar frente, vertical, owner ou conta" />
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2"><CalendarRange className="h-4 w-4 text-slate-400" />Período</span>
              <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                {periods.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" />Dimensão principal</span>
              <select value={dimension} onChange={(e) => { setDimension(e.target.value as DimensionKey); setDetailId(null); }} className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                {dimensions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2"><ChevronDown className="h-4 w-4 text-slate-400" />Owners</span>
              <select className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                <option>Todos</option>
                <option>ABM</option>
                <option>Revenue Ops</option>
                <option>Marketing</option>
                <option>CS</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr,0.9fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Evolução principal</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{selectedMetric.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedMetric.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <button key={metric.key} onClick={() => setMetricKey(metric.key)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${metric.key === selectedMetric.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{metric.label}</button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Atual</div><div className="mt-2 text-2xl font-black text-slate-950">{selectedMetric.current}</div></div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Anterior</div><div className="mt-2 text-2xl font-black text-slate-950">{selectedMetric.previous}</div></div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Situação</div><div className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${toneClass(selectedMetric.tone).badge}`}>{directionText(selectedMetric)}</div></div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3"><div className="h-[220px]"><SimpleLineChart series={selectedMetric.series} tone={selectedMetric.tone} /></div></div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">O que puxou a variação</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{selectedMetric.cause}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Por que isso importa</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{selectedMetric.summary}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Decisão sugerida</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{selectedMetric.decision}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Leitura do momento</div>
            <div className="mt-4 space-y-3">
              {readingCards.map((card, index) => (
                <div key={index} className={`rounded-2xl border p-4 ${toneClass(card.tone).panel}`}>
                  <div className="text-sm font-black text-slate-900">{card.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">{card.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Comparação rápida</div>
              <div className="mt-3 space-y-3">
                {metrics.map((metric) => (
                  <button key={metric.key} onClick={() => setMetricKey(metric.key)} className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-slate-950">{metric.label}</div>
                        <div className="mt-1 text-xs text-slate-500">Atual {metric.current} • Anterior {metric.previous}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass(metric.tone).badge}`}>{metric.delta}</span>
                    </div>
                    <div className="mt-3 h-[86px]"><SimpleLineChart series={metric.series} tone={metric.tone} compact /></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Quebra por dimensão</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Onde ganhou tração e onde perdeu eficiência</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">A leitura desce por dimensão antes de descer para conta, owner e ação específica.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dimensions.map((item) => (
                <button key={item.key} onClick={() => { setDimension(item.key); setDetailId(null); }} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${dimension === item.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{item.label}</button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-[1.45fr,0.5fr,0.5fr,0.5fr,0.8fr,auto] items-center gap-3 rounded-2xl px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <div>Dimensão</div><div>Atual</div><div>Anterior</div><div>Delta</div><div>Situação</div><div></div>
              </div>
              <div className="mt-1 space-y-2">
                {items.map((item) => (
                  <button key={item.id} onClick={() => { setDetailId(item.id); setDetailTab("overview"); }} className="grid w-full grid-cols-[1.45fr,0.5fr,0.5fr,0.5fr,0.8fr,auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300 hover:shadow-sm">
                    <div>
                      <div className="text-sm font-black text-slate-950">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.pipeline} • {item.summary}</div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{item.current}%</div>
                    <div className="text-sm font-bold text-slate-600">{item.previous}%</div>
                    <div className={`text-sm font-bold ${toneClass(item.tone).text}`}>{item.delta > 0 ? `+${item.delta}` : item.delta}%</div>
                    <div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass(item.tone).badge}`}>{item.state}</span></div>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">Abrir <ArrowRight className="h-3.5 w-3.5" /></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-slate-950">{item.name}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">{item.summary}</div>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass(item.tone).badge}`}>{item.state}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700"><strong>Causa:</strong> {item.cause}</div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700"><strong>Decisão:</strong> {item.decision}</div>
                  </div>
                  <button onClick={() => { setDetailId(item.id); setDetailTab("overview"); }} className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Ver detalhe navegável <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Diagnóstico</div>
            <div className="mt-4 space-y-3">
              {diagnostics.map((item, index) => (
                <div key={index} className={`rounded-2xl border p-4 ${toneClass(item.tone).panel}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-black text-slate-900">{item.title}</div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass(item.tone).badge}`}>{item.tone === "positive" ? "ok" : item.tone === "warning" ? "alerta" : "crítico"}</span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 px-3 py-3 text-sm leading-6 text-slate-700"><strong>Causa:</strong> {item.cause}</div>
                    <div className="rounded-2xl bg-white/80 px-3 py-3 text-sm leading-6 text-slate-700"><strong>Decisão sugerida:</strong> {item.decision}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Impacto</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Só depois da leitura macro, onde isso ganhou consequência</h2>
            <div className="mt-4 space-y-3">
              {impacts.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-slate-950">{item.account}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.summary}</div>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${toneClass(item.tone).badge}`}>{item.delta}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Owner</div><div className="mt-1 text-sm font-bold text-slate-900">{item.owner}</div></div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Ação ligada</div><div className="mt-1 text-sm font-bold text-slate-900">{item.action}</div></div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Status</div><div className="mt-1 text-sm font-bold text-slate-900">{item.tone === "positive" ? "Evoluiu" : item.tone === "warning" ? "Em risco" : "Recuperação"}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {detail && (
          <OverlayShell title={detail.name} subtitle={detail.summary} onClose={() => { setDetailId(null); setDetailTab("overview"); }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Atual</div><div className="mt-2 text-2xl font-black text-slate-950">{detail.current}%</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Anterior</div><div className="mt-2 text-2xl font-black text-slate-950">{detail.previous}%</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Delta</div><div className="mt-2 text-2xl font-black text-slate-950">{detail.delta > 0 ? `+${detail.delta}` : detail.delta}%</div></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pipeline</div><div className="mt-2 text-2xl font-black text-slate-950">{detail.pipeline}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "overview", label: "Visão da frente" },
                  { key: "accounts", label: "Contas relacionadas" },
                  { key: "actions", label: "Ações ligadas" },
                  { key: "owners", label: "Owners / squads" },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setDetailTab(tab.key as DetailTab)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${detailTab === tab.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{tab.label}</button>
                ))}
              </div>
            </div>

            {detailTab === "overview" && (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">O que sustentou o resultado</div><div className="mt-3 text-sm leading-7 text-slate-700">{detail.cause}</div></div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5"><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Por que importa</div><div className="mt-3 text-sm leading-7 text-slate-700">{detail.summary}</div></div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próxima decisão</div>
                  <div className="mt-3 text-lg font-black text-slate-950">{detail.decision}</div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <button onClick={() => setDetailTab("accounts")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir contas relacionadas</button>
                    <button onClick={() => setDetailTab("actions")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Ver ações que puxaram esse resultado</button>
                    <button onClick={() => setDetailTab("owners")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Navegar para owners / squads</button>
                  </div>
                </div>
              </div>
            )}

            {detailTab !== "overview" && (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(detailTab === "accounts" ? detail.accounts : detailTab === "actions" ? detail.actions : detail.owners).map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-950">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">{item.subtitle}</div>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">{item.delta}</span>
                    </div>
                    <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">{item.status}</div>
                  </div>
                ))}
              </div>
            )}
          </OverlayShell>
        )}
      </div>
    </div>
  );
};

export default Performance;
