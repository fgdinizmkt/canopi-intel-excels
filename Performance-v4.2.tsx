
"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ChevronDown,
  Filter,
  Gauge,
  GitBranch,
  LineChart,
  MoveUpRight,
  MoveDownRight,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type PeriodKey = "30d" | "90d" | "quarter";
type DimensionKey =
  | "canais"
  | "origens"
  | "motores"
  | "verticais"
  | "departamentos"
  | "cargos"
  | "tipos";

type TrendDirection = "up" | "down" | "flat";
type Tone = "positive" | "warning" | "critical" | "neutral";

type MetricPoint = {
  label: string;
  value: number;
};

type MetricSeries = {
  key: string;
  label: string;
  unit: string;
  currentLabel: string;
  previousLabel: string;
  direction: TrendDirection;
  tone: Tone;
  series: MetricPoint[];
  summary: string;
};

type DimensionItem = {
  id: string;
  name: string;
  current: number;
  previous: number;
  delta: number;
  pipeline: string;
  note: string;
  risk: string;
  nextAction: string;
  related: string[];
};

type DiagnosticItem = {
  id: string;
  tone: Tone;
  title: string;
  summary: string;
  cause: string;
  consequence: string;
  nextAction: string;
};

type ImpactItem = {
  id: string;
  account: string;
  movement: string;
  owner: string;
  linkedAction: string;
  delta: string;
  tone: Tone;
  detail: string;
};

const periodOptions: { key: PeriodKey; label: string }[] = [
  { key: "30d", label: "Últimos 30 dias" },
  { key: "90d", label: "Últimos 90 dias" },
  { key: "quarter", label: "Trimestre atual" },
];

const dimensionTabs: { key: DimensionKey; label: string }[] = [
  { key: "canais", label: "Canais" },
  { key: "origens", label: "Origens" },
  { key: "motores", label: "Motores" },
  { key: "verticais", label: "Verticais" },
  { key: "departamentos", label: "Departamentos" },
  { key: "cargos", label: "Cargos / contatos" },
  { key: "tipos", label: "Tipos de contato" },
];

const metricSeriesByPeriod: Record<PeriodKey, MetricSeries[]> = {
  "30d": [
    {
      key: "pipeline",
      label: "Pipeline influenciado",
      unit: "R$ mi",
      currentLabel: "R$ 5,4M",
      previousLabel: "R$ 4,8M",
      direction: "up",
      tone: "positive",
      summary: "ABM, inbound e retomadas puxaram avanço com melhor mix de oportunidade.",
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
      unit: "R$ mi",
      currentLabel: "R$ 1,3M",
      previousLabel: "R$ 1,0M",
      direction: "up",
      tone: "warning",
      summary: "Follow-up atrasado e CRM pressionado elevaram risco em inbound enterprise.",
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
      unit: "%",
      currentLabel: "79%",
      previousLabel: "84%",
      direction: "down",
      tone: "critical",
      summary: "Perda de velocidade em inbound enterprise e automação criou desvio da meta.",
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
      unit: "%",
      currentLabel: "41 / 56",
      previousLabel: "34 / 51",
      direction: "up",
      tone: "positive",
      summary: "Frentes com owner claro e origem consistente concluíram melhor no período.",
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
      unit: "R$ mi",
      currentLabel: "R$ 13,8M",
      previousLabel: "R$ 11,4M",
      direction: "up",
      tone: "positive",
      summary: "Ganhos sustentados em ABM, outbound consultivo e SEO / inbound.",
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
      unit: "R$ mi",
      currentLabel: "R$ 2,9M",
      previousLabel: "R$ 2,4M",
      direction: "up",
      tone: "warning",
      summary: "Concentração maior de risco em contas enterprise e automação pendente.",
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
      unit: "%",
      currentLabel: "81%",
      previousLabel: "85%",
      direction: "down",
      tone: "critical",
      summary: "A máquina ficou mais eficiente em ABM, mas perdeu velocidade em inbound.",
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
      unit: "%",
      currentLabel: "124 / 161",
      previousLabel: "101 / 149",
      direction: "up",
      tone: "positive",
      summary: "Melhor governança elevou taxa de conclusão sem perder volume.",
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
  "quarter": [
    {
      key: "pipeline",
      label: "Pipeline influenciado",
      unit: "R$ mi",
      currentLabel: "R$ 7,9M",
      previousLabel: "R$ 6,6M",
      direction: "up",
      tone: "positive",
      summary: "O trimestre atual está ganhando força em ABM, SEO e retomadas.",
      series: [
        { label: "Jan", value: 6.6 },
        { label: "Fev", value: 7.1 },
        { label: "Mar", value: 7.9 },
      ],
    },
    {
      key: "risk",
      label: "Receita em risco",
      unit: "R$ mi",
      currentLabel: "R$ 1,7M",
      previousLabel: "R$ 1,5M",
      direction: "up",
      tone: "warning",
      summary: "Automação, mídia e inbound enterprise ainda concentram desvio.",
      series: [
        { label: "Jan", value: 1.3 },
        { label: "Fev", value: 1.4 },
        { label: "Mar", value: 1.7 },
      ],
    },
    {
      key: "sla",
      label: "SLA operacional",
      unit: "%",
      currentLabel: "80%",
      previousLabel: "83%",
      direction: "down",
      tone: "critical",
      summary: "O ganho de escala veio com pressão em resposta e roteamento.",
      series: [
        { label: "Jan", value: 84 },
        { label: "Fev", value: 82 },
        { label: "Mar", value: 80 },
      ],
    },
    {
      key: "execution",
      label: "Execução efetiva",
      unit: "%",
      currentLabel: "57 / 73",
      previousLabel: "49 / 70",
      direction: "up",
      tone: "positive",
      summary: "As ações com contexto mais claro avançam melhor.",
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
      note: "Melhor evolução entre volume, qualidade e avanço real.",
      risk: "Baixo",
      nextAction: "Priorizar contas de expansão com sponsor mapeado.",
      related: ["MSD Saúde Animal", "Minerva Foods"],
    },
    {
      id: "inbound",
      name: "Inbound",
      current: 74,
      previous: 59,
      delta: 15,
      pipeline: "R$ 2,4M",
      note: "Ganhou tração, mas ainda perde velocidade no enterprise.",
      risk: "Médio",
      nextAction: "Corrigir roteamento e automações de triagem.",
      related: ["Carteira Seguros Enterprise", "Nexus Fintech"],
    },
    {
      id: "outbound",
      name: "Outbound",
      current: 58,
      previous: 65,
      delta: -7,
      pipeline: "R$ 1,6M",
      note: "Retomadas não escalaram como esperado no período.",
      risk: "Alto",
      nextAction: "Revisar cadência e mensagens por vertical.",
      related: ["V.tal", "FHLB"],
    },
    {
      id: "midiapaga",
      name: "Tráfego Pago",
      current: 68,
      previous: 66,
      delta: 2,
      pipeline: "R$ 1,1M",
      note: "Volume estável, mas CPL e aderência por campanha pedem ajuste.",
      risk: "Médio",
      nextAction: "Redistribuir verba e cortar desperdício por grupo.",
      related: ["Cluster Healthtech"],
    },
    {
      id: "seo",
      name: "SEO / Inbound",
      current: 71,
      previous: 63,
      delta: 8,
      pipeline: "R$ 1,4M",
      note: "Crescimento consistente puxado por conteúdo de intenção.",
      risk: "Baixo",
      nextAction: "Conectar páginas visitadas ao play de SDR.",
      related: ["Cluster Manufatura"],
    },
    {
      id: "crm",
      name: "CRM / automação",
      current: 49,
      previous: 58,
      delta: -9,
      pipeline: "R$ 0,9M",
      note: "Maior concentração de gargalo operacional do período.",
      risk: "Alto",
      nextAction: "Revisar handoffs, regras e filas automáticas.",
      related: ["Inbound enterprise", "Automações de follow-up"],
    },
  ],
  origens: [
    {
      id: "intent",
      name: "Sinais de intenção",
      current: 78,
      previous: 63,
      delta: 15,
      pipeline: "R$ 2,7M",
      note: "Responder rápido ao sinal certo acelerou avanço real.",
      risk: "Médio",
      nextAction: "Priorizar combinação de intenção + fit + sponsor.",
      related: ["G2", "Pages visited", "Bombora"],
    },
    {
      id: "eventos",
      name: "Eventos",
      current: 39,
      previous: 43,
      delta: -4,
      pipeline: "R$ 0,7M",
      note: "Pós-evento perdeu cadência e consequência operacional.",
      risk: "Alto",
      nextAction: "Reorganizar follow-up por lote e owner.",
      related: ["FHLB", "Feiras setoriais"],
    },
    {
      id: "conteudo",
      name: "Conteúdo / autoridade",
      current: 74,
      previous: 61,
      delta: 13,
      pipeline: "R$ 1,5M",
      note: "Cases e conteúdo técnico apoiaram expansão e retomadas.",
      risk: "Baixo",
      nextAction: "Transformar ativos internos em material comercial.",
      related: ["Case V.tal", "Workshop IA MSD"],
    },
    {
      id: "site",
      name: "Comportamento no site",
      current: 69,
      previous: 60,
      delta: 9,
      pipeline: "R$ 1,2M",
      note: "Volume cresce, mas ainda falta consequência em parte das visitas.",
      risk: "Médio",
      nextAction: "Conectar páginas técnicas a playbooks de abordagem.",
      related: ["Cluster Manufatura", "Clever Devices"],
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
      note: "Frente com melhor retorno quando há sponsor e caso aplicável.",
      risk: "Baixo",
      nextAction: "Subir plays de expansão por vertical.",
      related: ["MSD", "Minerva", "V.tal"],
    },
    {
      id: "retomada",
      name: "Retomada",
      current: 62,
      previous: 54,
      delta: 8,
      pipeline: "R$ 1,6M",
      note: "Melhorou com contexto novo, mas ainda depende demais de poucos owners.",
      risk: "Médio",
      nextAction: "Estruturar gatilhos de retomada por causa de perda.",
      related: ["Base de lost deals", "V.tal"],
    },
    {
      id: "aquisicao",
      name: "Aquisição",
      current: 67,
      previous: 62,
      delta: 5,
      pipeline: "R$ 2,1M",
      note: "Crescimento moderado; qualidade varia bastante por origem.",
      risk: "Médio",
      nextAction: "Combinar mídia, SEO e intent com recorte melhor.",
      related: ["Healthtech", "Fintech"],
    },
    {
      id: "retencao",
      name: "Retenção / CS",
      current: 71,
      previous: 70,
      delta: 1,
      pipeline: "R$ 0,8M",
      note: "Saudável, mas ainda com pouca aceleração nova.",
      risk: "Baixo",
      nextAction: "Criar trilhas por risco e potencial de expansão.",
      related: ["MSD", "Cartera consultiva"],
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
      note: "Melhor evolução em contas com conteúdo executivo e sponsor claro.",
      risk: "Baixo",
      nextAction: "Escalar playbooks de workshop e autoridade.",
      related: ["MSD", "Healthtech"],
    },
    {
      id: "industrial",
      name: "Industrial / manufatura",
      current: 72,
      previous: 61,
      delta: 11,
      pipeline: "R$ 1,9M",
      note: "Sinais de site melhoraram, mas ainda faltam abordagens por contexto.",
      risk: "Médio",
      nextAction: "Amarrar navegação técnica a outbound consultivo.",
      related: ["Cluster Manufatura", "Minerva"],
    },
    {
      id: "telecom",
      name: "Telecom",
      current: 58,
      previous: 64,
      delta: -6,
      pipeline: "R$ 1,1M",
      note: "Perdeu ritmo com follow-up e sponsor técnico travados.",
      risk: "Alto",
      nextAction: "Reabrir agenda com benchmark e prova de valor.",
      related: ["V.tal"],
    },
    {
      id: "financeiro",
      name: "Seguros / financeiro",
      current: 49,
      previous: 56,
      delta: -7,
      pipeline: "R$ 1,4M",
      note: "Roteamento e SLA pressionaram avanço em enterprise.",
      risk: "Alto",
      nextAction: "Corrigir triagem, owner e handoff.",
      related: ["Carteira Seguros Enterprise"],
    },
  ],
  departamentos: [
    {
      id: "marketing",
      name: "Marketing",
      current: 76,
      previous: 69,
      delta: 7,
      pipeline: "R$ 3,0M",
      note: "Melhor na geração e aceleração, mas ainda com desperdício em mídia.",
      risk: "Médio",
      nextAction: "Ajustar orçamento e criativos por segmento.",
      related: ["Paid Media", "SEO", "Conteúdo"],
    },
    {
      id: "revops",
      name: "Revenue Ops",
      current: 57,
      previous: 66,
      delta: -9,
      pipeline: "R$ 2,2M",
      note: "Maior pressão está em SLA, roteamento e automação.",
      risk: "Alto",
      nextAction: "Atacar regras, filas e tempos de resposta.",
      related: ["Inbound enterprise", "CRM"],
    },
    {
      id: "comercial",
      name: "Comercial / SDR",
      current: 68,
      previous: 62,
      delta: 6,
      pipeline: "R$ 2,5M",
      note: "Responde melhor quando recebe contexto e próxima ação claros.",
      risk: "Médio",
      nextAction: "Conectar melhor causa do sinal e roteiro de abordagem.",
      related: ["SDRs", "Owners"],
    },
    {
      id: "cs",
      name: "CS / expansão",
      current: 71,
      previous: 70,
      delta: 1,
      pipeline: "R$ 0,9M",
      note: "Saudável, mas com baixo volume de novas oportunidades.",
      risk: "Baixo",
      nextAction: "Ativar trilhas por uso, risco e whitespace.",
      related: ["Retenção", "Case reuse"],
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
      note: "Quando engaja, acelera bem o ciclo e reduz atrito político.",
      risk: "Baixo",
      nextAction: "Subir pontos de vista executivos por vertical.",
      related: ["CEO", "Diretores", "VPs"],
    },
    {
      id: "diretores",
      name: "Diretores",
      current: 76,
      previous: 66,
      delta: 10,
      pipeline: "R$ 1,6M",
      note: "Patrocínio e orçamento conectam melhor com priorização concreta.",
      risk: "Médio",
      nextAction: "Ajustar oferta e narrativa por área.",
      related: ["Marketing", "Operações", "TI"],
    },
    {
      id: "gerentes",
      name: "Gerentes",
      current: 73,
      previous: 66,
      delta: 7,
      pipeline: "R$ 1,1M",
      note: "Convertem bem com prova prática e plano de implementação claro.",
      risk: "Médio",
      nextAction: "Mostrar impacto operacional e próximos passos.",
      related: ["Gerentes de área", "Coordenadores"],
    },
    {
      id: "especialistas",
      name: "Especialistas",
      current: 68,
      previous: 64,
      delta: 4,
      pipeline: "R$ 0,7M",
      note: "Influenciadores técnicos importantes, mas não lideram avanço sozinhos.",
      risk: "Médio",
      nextAction: "Usar como ponte para decisor e para detalhamento técnico.",
      related: ["Arquitetos", "Analistas", "Engenharia"],
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
      note: "Maior potencial em expansão e cross-sell quando há contexto certo.",
      risk: "Baixo",
      nextAction: "Trilhas por uso, risco e whitespace.",
      related: ["CS", "Expansão", "ABX"],
    },
    {
      id: "mql",
      name: "Leads MQL / SQL",
      current: 66,
      previous: 60,
      delta: 6,
      pipeline: "R$ 1,8M",
      note: "Melhoraram em volume, mas a qualidade oscila por origem.",
      risk: "Médio",
      nextAction: "Ajustar scoring e filtragem por intenção.",
      related: ["Inbound", "Paid Media", "SEO"],
    },
    {
      id: "lost",
      name: "Lost deals / retomadas",
      current: 61,
      previous: 54,
      delta: 7,
      pipeline: "R$ 1,2M",
      note: "Ganham força quando voltam com conteúdo novo e timing melhor.",
      risk: "Médio",
      nextAction: "Criar ritmos por motivo de perda.",
      related: ["Retomadas", "Playbook de reentrada"],
    },
    {
      id: "parceiros",
      name: "Contatos indiretos / parceiros",
      current: 53,
      previous: 49,
      delta: 4,
      pipeline: "R$ 0,5M",
      note: "Úteis para abrir portas, mas pouco consistentes sem owner claro.",
      risk: "Médio",
      nextAction: "Estruturar trilhas de influência e handoff.",
      related: ["Ecossistema", "Indicações"],
    },
  ],
};

const diagnostics: DiagnosticItem[] = [
  {
    id: "diag-1",
    tone: "warning",
    title: "Perda de velocidade em inbound enterprise",
    summary: "A triagem melhorou, mas a resposta após o primeiro sinal ainda está acima da janela ideal.",
    cause: "CRM / automação e owner indefinido em parte dos casos quentes.",
    consequence: "Risco de perda de demanda qualificada e atraso na criação de oportunidade.",
    nextAction: "Atacar regras de roteamento e corrigir fila enterprise ainda hoje.",
  },
  {
    id: "diag-2",
    tone: "critical",
    title: "CPL piorou em Tráfego Pago",
    summary: "A aquisição segue gerando volume, mas a qualidade caiu em duas campanhas de alta intenção.",
    cause: "Excesso de verba em grupos com baixo ajuste de segmentação.",
    consequence: "Mais custo por oportunidade e menos aderência comercial.",
    nextAction: "Redistribuir verba e revisar criativos por segmento.",
  },
  {
    id: "diag-3",
    tone: "positive",
    title: "ABM aumentou eficiência, mas concentrou risco operacional",
    summary: "A frente está avançando mais rápido, mas a execução está pesada para poucos owners.",
    cause: "Boa leitura de conta e ação, porém pouca redundância operacional.",
    consequence: "Escala limitada e maior dependência de poucas pessoas.",
    nextAction: "Distribuir plays com contexto e reforçar apoio de squads.",
  },
];

const impacts: ImpactItem[] = [
  {
    id: "impact-1",
    account: "MSD Saúde",
    movement: "Avanço de stage",
    owner: "Fábio Diniz",
    linkedAction: "Ajustar narrativa executiva para comitê",
    delta: "+R$ 420k",
    tone: "positive",
    detail: "A frente ganhou tração após combinação de narrativa, case e sponsor reativado.",
  },
  {
    id: "impact-2",
    account: "V.tal",
    movement: "Risco de esfriamento",
    owner: "Camila Ribeiro",
    linkedAction: "Retomar sponsor técnico e reunião de revisão",
    delta: "-R$ 180k em risco",
    tone: "warning",
    detail: "Open rate caiu e a reunião ainda não foi confirmada.",
  },
  {
    id: "impact-3",
    account: "Carteira Seguros Enterprise",
    movement: "Recuperação operacional",
    owner: "Ligia Martins",
    linkedAction: "Corrigir roteamento de leads inbound",
    delta: "+R$ 260k",
    tone: "critical",
    detail: "O backlog ainda pressiona SLA, mas a remediação já começou.",
  },
  {
    id: "impact-4",
    account: "ArcelorMittal",
    movement: "Oportunidade acelerada",
    owner: "Camila Ribeiro",
    linkedAction: "Follow-up executivo com prova de valor",
    delta: "+R$ 310k",
    tone: "positive",
    detail: "A conta respondeu melhor após contato executivo e reforço técnico.",
  },
];

function toneClass(tone: Tone) {
  if (tone === "positive") {
    return {
      soft: "bg-emerald-50 border-emerald-200 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "bg-emerald-500",
    };
  }
  if (tone === "warning") {
    return {
      soft: "bg-amber-50 border-amber-200 text-amber-700",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      accent: "bg-amber-500",
    };
  }
  if (tone === "critical") {
    return {
      soft: "bg-rose-50 border-rose-200 text-rose-700",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "bg-rose-500",
    };
  }
  return {
    soft: "bg-slate-50 border-slate-200 text-slate-700",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    accent: "bg-slate-500",
  };
}

function trendIcon(direction: TrendDirection, tone: Tone) {
  if (direction === "up") {
    return tone === "warning" || tone === "critical" ? (
      <MoveUpRight className="h-3.5 w-3.5" />
    ) : (
      <TrendingUp className="h-3.5 w-3.5" />
    );
  }
  if (direction === "down") {
    return <TrendingDown className="h-3.5 w-3.5" />;
  }
  return <ArrowRight className="h-3.5 w-3.5" />;
}

function SimpleLineChart({
  series,
  tone,
  compact = false,
}: {
  series: MetricPoint[];
  tone: Tone;
  compact?: boolean;
}) {
  const width = 540;
  const height = compact ? 110 : 240;
  const padX = 24;
  const padY = 20;
  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  const points = series.map((point, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(series.length - 1, 1);
    const y =
      height - padY - ((point.value - min) / spread) * (height - padY * 2);
    return { x, y, label: point.label, value: point.value };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padY} L ${
    points[0].x
  } ${height - padY} Z`;

  const toneFill =
    tone === "positive"
      ? "#10b981"
      : tone === "warning"
      ? "#f59e0b"
      : tone === "critical"
      ? "#ef4444"
      : "#64748b";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {[0, 1, 2, 3].map((line) => {
        const y = padY + (line * (height - padY * 2)) / 3;
        return (
          <line
            key={line}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke="#e5e7eb"
            strokeDasharray="4 4"
          />
        );
      })}
      <path d={areaPath} fill={toneFill} fillOpacity="0.08" />
      <path d={path} fill="none" stroke={toneFill} strokeWidth="3" strokeLinecap="round" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4" fill="white" stroke={toneFill} strokeWidth="2.5" />
          <text x={point.x} y={height - 4} textAnchor="middle" fontSize="11" fill="#94a3b8">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ProgressBar({ value, tone }: { value: number; tone: Tone }) {
  const color =
    tone === "positive"
      ? "bg-emerald-500"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "critical"
      ? "bg-rose-500"
      : "bg-slate-500";
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function OverlayShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-[2px]">
      <div className="mx-auto flex h-full max-w-6xl items-start justify-center px-6 py-8">
        <div className="max-h-[92vh] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-200 px-8 py-6">
            <div>
              <button
                onClick={onClose}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
          </div>
          <div className="max-h-[calc(92vh-140px)] overflow-y-auto px-8 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const Performance: React.FC = () => {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [dimension, setDimension] = useState<DimensionKey>("canais");
  const [metricFocus, setMetricFocus] = useState<string>("pipeline");
  const [dimensionDetailId, setDimensionDetailId] = useState<string | null>(null);
  const [impactDetailId, setImpactDetailId] = useState<string | null>(null);

  const metrics = metricSeriesByPeriod[period];
  const selectedMetric = metrics.find((item) => item.key === metricFocus) ?? metrics[0];
  const selectedDimensionItems = dimensionData[dimension];
  const dimensionDetail =
    selectedDimensionItems.find((item) => item.id === dimensionDetailId) ?? null;
  const impactDetail = impacts.find((item) => item.id === impactDetailId) ?? null;

  const executiveSummary = useMemo(() => {
    return [
      {
        title: "Melhor tração",
        text: "ABM, retomadas e SEO / inbound estão concentrando melhor relação entre volume, qualidade e avanço real.",
        tone: "positive" as Tone,
      },
      {
        title: "Maior fricção",
        text: "CRM / automação e Tráfego Pago ainda pressionam SLA, continuidade e custo por oportunidade qualificada.",
        tone: "warning" as Tone,
      },
      {
        title: "Próxima decisão",
        text: "Ajustar distribuição operacional, corrigir campanhas com pior custo e reforçar fluxo das retomadas com melhor resposta.",
        tone: "neutral" as Tone,
      },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1320px] px-6 pb-16 pt-8">
        <section className="overflow-hidden rounded-[30px] bg-[#0b2b78] shadow-[0_24px_80px_rgba(11,43,120,0.18)]">
          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.6fr,0.9fr] lg:px-10">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
                  Desempenho operacional e comercial
                </span>
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white">
                Resultado, evolução e performance para decidir melhor onde agir.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/78">
                Leitura consolidada do que melhorou, caiu, acelerou ou travou na máquina,
                antes de descer para owners, contas e ações específicas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Janela analisada
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  {periodOptions.find((item) => item.key === period)?.label}
                </div>
                <div className="mt-1 text-xs text-white/65">
                  Comparação automática com a janela imediatamente anterior.
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Leitura rápida
                </div>
                <div className="mt-2 text-base font-black text-white">
                  ABM, SEO e retomadas puxam alta
                </div>
                <div className="mt-1 text-xs text-white/65">
                  Tráfego Pago e CRM ainda concentram a maior parte da fricção.
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 px-8 pb-8 pt-6 sm:grid-cols-2 xl:grid-cols-4 lg:px-10">
            {metrics.map((metric) => {
              const tone = toneClass(metric.tone);
              return (
                <button
                  key={metric.key}
                  onClick={() => setMetricFocus(metric.key)}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    metricFocus === metric.key
                      ? "border-white/25 bg-white/12"
                      : "border-white/10 bg-white/6 hover:bg-white/9"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                        {metric.label}
                      </div>
                      <div className="mt-2 text-[34px] font-black leading-none text-white">
                        {metric.currentLabel}
                      </div>
                    </div>
                    <div className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge.replace("bg-", "bg-white/")}`}>
                      {trendIcon(metric.direction, metric.tone)}
                    </div>
                  </div>
                  <div className="mt-3 text-xs leading-5 text-white/65">{metric.summary}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.4fr,repeat(3,minmax(0,0.58fr))]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Buscar frente, vertical, owner ou conta"
              />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                {periodOptions.find((item) => item.key === period)?.label}
              </span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodKey)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
              >
                {periodOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Cargos / contatos
              </span>
              <select className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                <option>Todos</option>
                <option>C-Level</option>
                <option>Diretores</option>
                <option>Gerentes</option>
                <option>Especialistas</option>
              </select>
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <ChevronDown className="h-4 w-4 text-slate-400" />
                Todos os owners
              </span>
              <select className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                <option>Todos</option>
                <option>Revenue Ops</option>
                <option>ABM</option>
                <option>Paid Media</option>
                <option>CS</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr,0.85fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Evolução temporal
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {selectedMetric.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Leitura de tendência, variação e comportamento da frente principal antes de
                  aprofundar por dimensão.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setMetricFocus(metric.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedMetric.key === metric.key
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Curva principal
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedMetric.direction === "up" ? "+ " : selectedMetric.direction === "down" ? "- " : ""}
                      {selectedMetric.currentLabel} vs janela anterior
                    </div>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {selectedMetric.unit}
                  </div>
                </div>
                <div className="mt-4 h-[260px] rounded-2xl border border-slate-200 bg-white p-3">
                  <SimpleLineChart series={selectedMetric.series} tone={selectedMetric.tone} />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Timeline do período
                  </div>
                  <div className="mt-3 space-y-3">
                    {[
                      { date: "04 mar", title: "Ajuste em triagem inbound", tone: "positive", note: "Priorização enterprise separada da fila geral." },
                      { date: "11 mar", title: "Pico de risco em mídia paga", tone: "critical", note: "Duas campanhas ampliaram custo com queda de continuidade." },
                      { date: "18 mar", title: "Retomadas aquecidas", tone: "positive", note: "Base reengajada voltou a acelerar com prova setorial." },
                      { date: "24 mar", title: "Gargalo em CRM / automação", tone: "warning", note: "Dependências de fluxo elevaram o backlog operacional." },
                    ].map((event, index) => {
                      const tone = toneClass(event.tone as Tone);
                      return (
                        <div key={index} className="rounded-2xl border border-slate-200 p-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${tone.accent}`} />
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                              {event.date}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-bold text-slate-900">{event.title}</div>
                          <div className="mt-1 text-sm leading-5 text-slate-600">{event.note}</div>
                          <span className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${tone.badge}`}>
                            {event.tone === "positive"
                              ? "ok"
                              : event.tone === "critical"
                              ? "crítico"
                              : "alerta"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Leads / volume
                    </div>
                    <div className="mt-3 h-[120px] rounded-2xl border border-slate-200 bg-white p-3">
                      <SimpleLineChart series={selectedMetric.series} tone="positive" compact />
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Conversão
                    </div>
                    <div className="mt-3 h-[120px] rounded-2xl border border-slate-200 bg-white p-3">
                      <SimpleLineChart series={selectedMetric.series} tone="warning" compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Resumo executivo
            </div>
            <div className="mt-4 space-y-3">
              {executiveSummary.map((item, index) => {
                const tone = toneClass(item.tone);
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 ${tone.soft}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${tone.accent}`} />
                      <div className="text-sm font-black text-slate-900">{item.title}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Quebra por dimensão
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Onde a performance ganha ou perde eficiência
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                A leitura não desce cedo para conta individual. Primeiro entendemos onde a
                máquina ganhou tração, perdeu eficiência ou concentrou risco.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {dimensionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setDimension(tab.key);
                    setDimensionDetailId(null);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    dimension === tab.key
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-bold text-slate-900">
                {dimensionTabs.find((item) => item.key === dimension)?.label}
              </div>
              <div className="mt-4 space-y-4">
                {selectedDimensionItems.map((item) => {
                  const tone: Tone = item.delta > 6 ? "positive" : item.delta >= 0 ? "warning" : "critical";
                  const totalMax = Math.max(...selectedDimensionItems.map((entry) => entry.current));
                  return (
                    <button
                      key={item.id}
                      onClick={() => setDimensionDetailId(item.id)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-base font-black text-slate-950">{item.name}</div>
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${toneClass(tone).badge}`}>
                          {item.delta > 0 ? `+${item.delta}` : item.delta}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr,auto] md:items-center">
                        <div>
                          <ProgressBar value={(item.current / Math.max(totalMax, 1)) * 100} tone={tone} />
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Atual {item.current}%</span>
                            <span>Anterior {item.previous}%</span>
                          </div>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.pipeline}
                        </div>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-600">{item.note}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {selectedDimensionItems.map((item) => {
                const tone: Tone = item.delta > 6 ? "positive" : item.delta >= 0 ? "warning" : "critical";
                const toneUi = toneClass(tone);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-950">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-600">{item.note}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${toneUi.badge}`}>
                        {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Pipeline</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.pipeline}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Atual</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.current}%</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Anterior</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.previous}%</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Risco</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.risk}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDimensionDetailId(item.id)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver leitura detalhada
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Diagnóstico
            </div>
            <div className="mt-4 space-y-3">
              {diagnostics.map((item) => {
                const tone = toneClass(item.tone);
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 ${tone.soft}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-black text-slate-900">{item.title}</div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${tone.badge}`}>
                        {item.tone === "critical"
                          ? "crítico"
                          : item.tone === "warning"
                          ? "alerta"
                          : "ok"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Causa provável
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{item.cause}</div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Consequência
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{item.consequence}</div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Próximo passo
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{item.nextAction}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Impacto em contas e iniciativas
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Só depois da leitura macro, onde isso ganhou ou perdeu consequência
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {impacts.map((impact) => {
                const tone = toneClass(impact.tone);
                return (
                  <div key={impact.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-slate-950">{impact.account}</div>
                        <div className="mt-1 text-sm text-slate-600">{impact.detail}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${tone.badge}`}>
                        {impact.delta}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[0.7fr,1fr,auto]">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Owner</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{impact.owner}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Ação relacionada</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{impact.linkedAction}</div>
                      </div>
                      <button
                        onClick={() => setImpactDetailId(impact.id)}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir visão
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {dimensionDetail && (
          <OverlayShell
            title={dimensionDetail.name}
            subtitle={dimensionDetail.note}
            onClose={() => setDimensionDetailId(null)}
          >
            <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Leitura da dimensão
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Atual
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-950">{dimensionDetail.current}%</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Anterior
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-950">{dimensionDetail.previous}%</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Delta
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-950">
                        {dimensionDetail.delta > 0 ? `+${dimensionDetail.delta}` : dimensionDetail.delta}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Pipeline
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-950">{dimensionDetail.pipeline}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Por que isso aconteceu
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-700">
                    {dimensionDetail.note} Nesta leitura, a frente mostra risco <strong>{dimensionDetail.risk}</strong>{" "}
                    e indica a necessidade de <strong>{dimensionDetail.nextAction}</strong>.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Próxima decisão
                  </div>
                  <div className="mt-3 text-lg font-black text-slate-950">{dimensionDetail.nextAction}</div>
                  <div className="mt-4 text-sm leading-6 text-slate-600">
                    A página de desempenho não resolve a ação aqui. Ela te prepara para decidir com mais contexto antes
                    de entrar na fila operacional ou na conta específica.
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {dimensionDetail.related.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Caminhos de aprofundamento
                  </div>
                  <div className="mt-4 grid gap-3">
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Abrir contas relacionadas
                    </button>
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Ver ações que puxaram esse resultado
                    </button>
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Navegar para owners / squads conectados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </OverlayShell>
        )}

        {impactDetail && (
          <OverlayShell
            title={impactDetail.account}
            subtitle={impactDetail.detail}
            onClose={() => setImpactDetailId(null)}
          >
            <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Movimento observado
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-950">{impactDetail.movement}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {impactDetail.detail}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Owner
                    </div>
                    <div className="mt-2 text-lg font-black text-slate-950">{impactDetail.owner}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Ação ligada
                    </div>
                    <div className="mt-2 text-sm font-bold leading-6 text-slate-950">{impactDetail.linkedAction}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Consequência
                    </div>
                    <div className="mt-2 text-lg font-black text-slate-950">{impactDetail.delta}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  O que fazer com essa leitura
                </div>
                <div className="mt-4 space-y-3">
                  <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Abrir conta com contexto completo
                  </button>
                  <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Navegar para a ação relacionada
                  </button>
                  <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Ver owners e squads impactados
                  </button>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  O objetivo desta camada não é executar tudo daqui. É permitir uma leitura melhor antes
                  de entrar na ação, na conta ou na operação específica.
                </div>
              </div>
            </div>
          </OverlayShell>
        )}
      </div>
    </div>
  );
};

export default Performance;
