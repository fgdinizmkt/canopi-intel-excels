"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ChevronDown,
  Filter,
  LineChart,
  MoveDownRight,
  MoveUpRight,
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
type DetailView = "overview" | "accounts" | "actions" | "owners";

type MetricPoint = {
  label: string;
  value: number;
};

type MetricSeries = {
  key: string;
  label: string;
  currentLabel: string;
  previousLabel: string;
  deltaLabel: string;
  direction: TrendDirection;
  tone: Tone;
  series: MetricPoint[];
  whatItMeans: string;
  whatMoved: string;
  whyItMatters: string;
};

type DimensionEntity = {
  title: string;
  subtitle: string;
  status: string;
  delta: string;
};

type DimensionItem = {
  id: string;
  name: string;
  current: number;
  previous: number;
  delta: number;
  pipeline: string;
  tone: Tone;
  state: string;
  note: string;
  whatMoved: string;
  whyItMatters: string;
  decision: string;
  accounts: DimensionEntity[];
  actions: DimensionEntity[];
  owners: DimensionEntity[];
};

type DiagnosticItem = {
  id: string;
  tone: Tone;
  title: string;
  summary: string;
  cause: string;
  decision: string;
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
      currentLabel: "R$ 5,4M",
      previousLabel: "R$ 4,8M",
      deltaLabel: "+12,5%",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra o volume de pipeline acelerado pelas frentes operadas na Canopi no período.",
      whatMoved: "ABM, SEO / inbound e retomadas puxaram a curva para cima nas duas últimas semanas.",
      whyItMatters: "O avanço veio com melhor mix de contas e maior taxa de continuidade pós-sinal.",
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
      currentLabel: "R$ 1,3M",
      previousLabel: "R$ 1,0M",
      deltaLabel: "+30%",
      direction: "up",
      tone: "warning",
      whatItMeans: "Mostra receita potencial pressionada por gargalos, atraso de resposta ou perda de continuidade.",
      whatMoved: "Inbound enterprise e CRM / automação elevaram o risco no fim do ciclo.",
      whyItMatters: "Sem correção de fluxo, a página Ações vai operar mais remediação do que avanço.",
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
      currentLabel: "79%",
      previousLabel: "84%",
      deltaLabel: "-5 pts",
      direction: "down",
      tone: "critical",
      whatItMeans: "Mostra a capacidade da operação de responder dentro da janela esperada.",
      whatMoved: "Roteamento, backlog e handoff fizeram a velocidade cair nas frentes enterprise.",
      whyItMatters: "Queda de SLA reduz a consequência real dos sinais e piora o aproveitamento comercial.",
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
      currentLabel: "41 / 56",
      previousLabel: "34 / 51",
      deltaLabel: "+7 ações",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra quantas ações realmente saíram do plano para a execução concluída com consequência.",
      whatMoved: "Ações com origem bem definida e owner claro fecharam melhor o ciclo.",
      whyItMatters: "Melhora a taxa de aprendizado sobre o que gera avanço e o que só gera ruído.",
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
      currentLabel: "R$ 13,8M",
      previousLabel: "R$ 11,4M",
      deltaLabel: "+21%",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra a evolução do pipeline puxado pelas frentes ao longo do trimestre móvel.",
      whatMoved: "ABM, outbound consultivo e SEO / inbound sustentaram a alta ao longo dos meses.",
      whyItMatters: "Indica onde a máquina ganhou escala sem depender apenas de picos isolados.",
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
      currentLabel: "R$ 2,9M",
      previousLabel: "R$ 2,4M",
      deltaLabel: "+R$ 0,5M",
      direction: "up",
      tone: "warning",
      whatItMeans: "Mostra a concentração de risco acumulada em contas e fluxos com atrito operacional.",
      whatMoved: "Automação, mídia e follow-up enterprise ampliaram a pressão em contas críticas.",
      whyItMatters: "Sem reduzir risco estrutural, o ganho de pipeline vira crescimento frágil.",
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
      currentLabel: "81%",
      previousLabel: "85%",
      deltaLabel: "-4 pts",
      direction: "down",
      tone: "critical",
      whatItMeans: "Mostra como a velocidade operacional respondeu ao aumento de volume e complexidade.",
      whatMoved: "A máquina ganhou escala em ABM, mas perdeu resposta em inbound e CRM.",
      whyItMatters: "Escala sem SLA saudável limita a consequência comercial da execução.",
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
      currentLabel: "124 / 161",
      previousLabel: "101 / 149",
      deltaLabel: "+23 ações",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra o avanço de execução concluída em relação ao volume total gerado.",
      whatMoved: "Melhor governança e contexto elevaram conclusão sem perder volume.",
      whyItMatters: "Mostra quais frentes têm base operacional saudável para continuar escalando.",
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
      currentLabel: "R$ 7,9M",
      previousLabel: "R$ 6,6M",
      deltaLabel: "+19,7%",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra a fotografia do trimestre atual em relação ao trimestre anterior imediato.",
      whatMoved: "ABM, SEO e retomadas concentraram os maiores ganhos do trimestre.",
      whyItMatters: "Ajuda a decidir onde aprofundar e onde corrigir antes do próximo ciclo.",
      series: [
        { label: "Jan", value: 6.6 },
        { label: "Fev", value: 7.1 },
        { label: "Mar", value: 7.9 },
      ],
    },
    {
      key: "risk",
      label: "Receita em risco",
      currentLabel: "R$ 1,7M",
      previousLabel: "R$ 1,5M",
      deltaLabel: "+R$ 0,2M",
      direction: "up",
      tone: "warning",
      whatItMeans: "Mostra a receita sob risco de não converter ou esfriar no trimestre.",
      whatMoved: "Automação, mídia e inbound enterprise ainda concentram parte do desvio.",
      whyItMatters: "Aumenta a clareza sobre onde a decisão precisa ser corretiva e não expansiva.",
      series: [
        { label: "Jan", value: 1.3 },
        { label: "Fev", value: 1.4 },
        { label: "Mar", value: 1.7 },
      ],
    },
    {
      key: "sla",
      label: "SLA operacional",
      currentLabel: "80%",
      previousLabel: "83%",
      deltaLabel: "-3 pts",
      direction: "down",
      tone: "critical",
      whatItMeans: "Mostra a saúde de resposta da operação ao longo do trimestre.",
      whatMoved: "Maior volume e mais dependências elevaram a pressão sobre a fila.",
      whyItMatters: "Sem melhorar o SLA, parte do ganho de topo vira vazamento de meio de funil.",
      series: [
        { label: "Jan", value: 84 },
        { label: "Fev", value: 82 },
        { label: "Mar", value: 80 },
      ],
    },
    {
      key: "execution",
      label: "Execução efetiva",
      currentLabel: "57 / 73",
      previousLabel: "49 / 70",
      deltaLabel: "+8 ações",
      direction: "up",
      tone: "positive",
      whatItMeans: "Mostra a quantidade de ações que realmente fecharam o ciclo no trimestre.",
      whatMoved: "Melhor clareza de owner, contexto e próxima decisão elevou a conclusão.",
      whyItMatters: "Ajuda a separar volume operacional de avanço real com consequência.",
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
      note: "ABM concentrou a melhor combinação entre qualidade de conta, sponsor e continuidade operacional.",
      whatMoved: "Expansão e retomada em contas maduras, com sponsor reativado e ação melhor contextualizada.",
      whyItMatters: "É hoje a frente mais saudável para ampliar pipeline sem perder aderência.",
      decision: "Escalar playbooks por vertical e distribuir melhor a carga entre owners.",
      accounts: [
        { title: "MSD Saúde", subtitle: "Avanço de stage com reforço executivo", status: "Acelerou", delta: "+R$ 420k" },
        { title: "Minerva Foods", subtitle: "Reativação com leitura de uso e expansão", status: "Melhorou", delta: "+R$ 280k" },
        { title: "ArcelorMittal", subtitle: "Contato executivo respondeu melhor à prova de valor", status: "Acelerou", delta: "+R$ 310k" },
      ],
      actions: [
        { title: "Ajustar narrativa executiva", subtitle: "Comitê e sponsor com linguagem de impacto", status: "Concluída", delta: "+2 contas" },
        { title: "Priorizar contas de expansão", subtitle: "Lista com whitespace e fit mais alto", status: "Em andamento", delta: "+18%" },
        { title: "Distribuir owners por vertical", subtitle: "Evitar concentração em poucos squads", status: "Planejada", delta: "Risco médio" },
      ],
      owners: [
        { title: "Fábio Diniz", subtitle: "Expansão e comitês executivos", status: "Sob controle", delta: "6 contas" },
        { title: "Camila Ribeiro", subtitle: "Retomadas e prova de valor", status: "Atenção", delta: "Backlog 4" },
        { title: "Squad ABM", subtitle: "Cobertura por vertical", status: "Melhorou", delta: "+15 pts" },
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
      note: "É a frente com maior concentração de gargalo operacional do período.",
      whatMoved: "Regras de roteamento, filas e dependências de automação atrasaram o ciclo.",
      whyItMatters: "Sem corrigir essa base, outras frentes escalam com atrito e perdem consequência.",
      decision: "Atacar regras de handoff, fila enterprise e automações de follow-up ainda hoje.",
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
      note: "Crescimento consistente puxado por conteúdo de intenção e páginas com melhor aderência.",
      whatMoved: "Conteúdo de decisão e navegação técnica geraram continuidade melhor.",
      whyItMatters: "É uma frente com escala e custo saudável quando conectada à ação certa.",
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
      id: "intent",
      name: "Sinais de intenção",
      current: 78,
      previous: 63,
      delta: 15,
      pipeline: "R$ 2,7M",
      tone: "positive",
      state: "Melhorou e acelerou",
      note: "Responder rápido ao sinal certo continua sendo um dos maiores aceleradores da máquina.",
      whatMoved: "Combinação de intenção, fit e sponsor elevou a taxa de continuidade.",
      whyItMatters: "Mostra onde a leitura da Canopi está virando consequência de verdade.",
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
      note: "É hoje o motor com melhor retorno quando existe sponsor e prova de valor clara.",
      whatMoved: "Uso de cases, workshops e leitura de whitespace.",
      whyItMatters: "Ajuda a crescer com menor custo de aquisição e melhor previsibilidade.",
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
      note: "Saúde lidera em aderência quando narrativa executiva e prova prática caminham juntas.",
      whatMoved: "Cases, workshop e sponsor ativado sustentaram o avanço.",
      whyItMatters: "É uma vertical com potencial claro de escala e expansão.",
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
      note: "Revenue Ops concentra a maior parte da perda de eficiência no período.",
      whatMoved: "Regras, filas e tempos de resposta não acompanharam a escala.",
      whyItMatters: "Sem base operacional saudável, ganho de topo perde consequência.",
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
      note: "Quando a narrativa certa chega ao C-Level, o ciclo encurta e o patrocínio melhora.",
      whatMoved: "Mais conteúdo executivo, menos abordagem genérica.",
      whyItMatters: "Ajuda a acelerar decisão e reduzir atrito político.",
      decision: "Expandir pontos de vista executivos por vertical e por tese.",
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
      note: "Clientes ativos mostram a melhor relação entre contexto, uso e expansão.",
      whatMoved: "Leitura melhor de whitespace, risco e oportunidade.",
      whyItMatters: "É a camada mais previsível para crescimento com consequência.",
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
    id: "diag-1",
    tone: "warning",
    title: "Inbound enterprise perdeu velocidade",
    summary: "O ganho de volume veio antes da correção de roteamento e resposta.",
    cause: "CRM / automação e owner indefinido ainda pressionam a fila.",
    decision: "Corrigir fila enterprise e revisar handoff antes de ampliar campanha.",
  },
  {
    id: "diag-2",
    tone: "critical",
    title: "Tráfego Pago piorou custo e continuidade",
    summary: "Duas campanhas ganharam volume sem sustentar qualidade e próxima etapa.",
    cause: "Excesso de verba em grupos com segmentação solta e criativo genérico.",
    decision: "Redistribuir verba, ajustar criativos e reduzir desperdício por segmento.",
  },
  {
    id: "diag-3",
    tone: "positive",
    title: "ABM é a frente mais saudável para escalar",
    summary: "Entregou melhor relação entre esforço, consequência e avanço de pipeline.",
    cause: "Conta melhor lida, owner claro e prova de valor conectada ao contexto.",
    decision: "Escalar por vertical sem concentrar execução em poucos owners.",
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
    detail: "A conta ganhou tração após narrativa executiva + case + sponsor reativado.",
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
    detail: "O backlog ainda pressiona o SLA, mas a remediação foi iniciada.",
  },
];

function toneClass(tone: Tone) {
  if (tone === "positive") {
    return {
      soft: "bg-emerald-50 border-emerald-200 text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "bg-emerald-500",
      text: "text-emerald-700",
    };
  }
  if (tone === "warning") {
    return {
      soft: "bg-amber-50 border-amber-200 text-amber-700",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      accent: "bg-amber-500",
      text: "text-amber-700",
    };
  }
  if (tone === "critical") {
    return {
      soft: "bg-rose-50 border-rose-200 text-rose-700",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      accent: "bg-rose-500",
      text: "text-rose-700",
    };
  }
  return {
    soft: "bg-slate-50 border-slate-200 text-slate-700",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    accent: "bg-slate-500",
    text: "text-slate-700",
  };
}

function directionLabel(direction: TrendDirection, tone: Tone) {
  if (direction === "flat") return "Estável";
  if (direction === "up") return tone === "warning" || tone === "critical" ? "Piorou" : "Melhorou";
  return tone === "critical" ? "Piorou" : "Desacelerou";
}

function directionIcon(direction: TrendDirection, tone: Tone) {
  if (direction === "up") {
    return tone === "warning" || tone === "critical" ? <MoveUpRight className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
  }
  if (direction === "down") {
    return <TrendingDown className="h-4 w-4" />;
  }
  return <ArrowRight className="h-4 w-4" />;
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
  const width = 560;
  const height = compact ? 120 : 220;
  const padX = 24;
  const padY = 18;
  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  const points = series.map((point, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(series.length - 1, 1);
    const y = height - padY - ((point.value - min) / spread) * (height - padY * 2);
    return { x, y, ...point };
  });

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
  const toneFill = tone === "positive" ? "#10b981" : tone === "warning" ? "#f59e0b" : tone === "critical" ? "#ef4444" : "#64748b";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {[0, 1, 2, 3].map((line) => {
        const y = padY + (line * (height - padY * 2)) / 3;
        return <line key={line} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />;
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
    <div className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-[2px]">
      <div className="mx-auto flex h-full max-w-7xl items-start justify-center px-6 py-6">
        <div className="max-h-[94vh] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <button
                onClick={onClose}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
          </div>
          <div className="max-h-[calc(94vh-124px)] overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export const Performance: React.FC = () => {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [dimension, setDimension] = useState<DimensionKey>("canais");
  const [metricFocus, setMetricFocus] = useState<string>("pipeline");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<DetailView>("overview");

  const metrics = metricSeriesByPeriod[period];
  const selectedMetric = metrics.find((item) => item.key === metricFocus) ?? metrics[0];
  const selectedDimensionItems = dimensionData[dimension];
  const selectedDimension = selectedDimensionItems.find((item) => item.id === detailId) ?? null;

  const readingNow = useMemo(
    () => [
      {
        title: "O que subiu",
        text: "ABM, SEO / inbound e retomadas ganharam continuidade e empurraram pipeline para cima.",
        tone: "positive" as Tone,
      },
      {
        title: "O que caiu",
        text: "SLA e CRM / automação perderam eficiência com o aumento do volume enterprise.",
        tone: "critical" as Tone,
      },
      {
        title: "O que pede decisão",
        text: "Redistribuir esforço operacional e corrigir mídia / CRM antes de ampliar pressão no topo.",
        tone: "warning" as Tone,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1380px] px-6 pb-16 pt-8">
        <section className="overflow-hidden rounded-[30px] bg-[#0b2b78] shadow-[0_24px_80px_rgba(11,43,120,0.18)]">
          <div className="grid gap-6 px-8 py-7 lg:grid-cols-[1.5fr,1fr] lg:px-10">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
                Desempenho
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white">O que evoluiu, o que travou e onde decidir agora.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
                Resultado e performance primeiro. Conta, owner e ação específica só entram depois.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.map((metric) => {
                const tone = toneClass(metric.tone);
                return (
                  <button
                    key={metric.key}
                    onClick={() => setMetricFocus(metric.key)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      metricFocus === metric.key ? "border-white/25 bg-white/14" : "border-white/10 bg-white/6 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/58">{metric.label}</div>
                        <div className="mt-2 text-2xl font-black text-white">{metric.currentLabel}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge.replace("bg-", "bg-white/")}`}>
                        {directionIcon(metric.direction, metric.tone)}
                        {metric.deltaLabel}
                      </span>
                    </div>
                    <div className="mt-2 text-xs leading-5 text-white/68">{metric.whatMoved}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[1.4fr,0.7fr,0.7fr,0.7fr]">
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
              <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                {periodOptions.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Dimensão principal
              </span>
              <select value={dimension} onChange={(e) => { setDimension(e.target.value as DimensionKey); setDetailId(null); }} className="bg-transparent text-sm font-semibold text-slate-700 outline-none">
                {dimensionTabs.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
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
                <option>Marketing</option>
                <option>CS</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr,0.85fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Evolução principal</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{selectedMetric.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedMetric.whatItMeans}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setMetricFocus(metric.key)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      metric.key === selectedMetric.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Atual</div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{selectedMetric.currentLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Anterior</div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{selectedMetric.previousLabel}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Leitura</div>
                    <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${toneClass(selectedMetric.tone).badge}`}>
                      {directionIcon(selectedMetric.direction, selectedMetric.tone)}
                      {directionLabel(selectedMetric.direction, selectedMetric.tone)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="h-[240px]"><SimpleLineChart series={selectedMetric.series} tone={selectedMetric.tone} /></div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">O que puxou a variação</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{selectedMetric.whatMoved}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Por que isso importa</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{selectedMetric.whyItMatters}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Leitura do momento</div>
                  <div className="mt-4 space-y-3">
                    {readingNow.map((item, index) => {
                      const tone = toneClass(item.tone);
                      return (
                        <div key={index} className={`rounded-2xl border p-4 ${tone.soft}`}>
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
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Timeline do período</div>
                  <div className="mt-4 space-y-3">
                    {[
                      { date: "04 mar", title: "Triagem inbound corrigida", tone: "positive", note: "Enterprise saiu da fila geral e recuperou continuidade." },
                      { date: "11 mar", title: "Custo de mídia subiu", tone: "critical", note: "Duas campanhas pioraram custo e continuidade." },
                      { date: "18 mar", title: "Retomadas ganharam força", tone: "positive", note: "Base voltou a responder com novo contexto e caso setorial." },
                    ].map((event, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${toneClass(event.tone as Tone).accent}`} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{event.date}</span>
                        </div>
                        <div className="mt-2 text-sm font-bold text-slate-900">{event.title}</div>
                        <div className="mt-1 text-sm leading-5 text-slate-600">{event.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Comparação rápida</div>
            <div className="mt-4 space-y-3">
              {metrics.map((metric) => {
                const tone = toneClass(metric.tone);
                return (
                  <button
                    key={metric.key}
                    onClick={() => setMetricFocus(metric.key)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-slate-950">{metric.label}</div>
                        <div className="mt-1 text-xs text-slate-500">Atual {metric.currentLabel} • Anterior {metric.previousLabel}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge}`}>{metric.deltaLabel}</span>
                    </div>
                    <div className="mt-3 h-[110px] rounded-2xl border border-slate-200 bg-white p-2">
                      <SimpleLineChart series={metric.series} tone={metric.tone} compact />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Quebra por dimensão</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Onde ganhou tração, onde perdeu eficiência</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">A leitura desce por dimensão antes de descer para conta, owner e ação específica.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {dimensionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setDimension(tab.key); setDetailId(null); }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    dimension === tab.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-[1.5fr,0.55fr,0.55fr,0.55fr,0.8fr,auto] items-center gap-3 rounded-2xl px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <div>Dimensão</div>
                <div>Atual</div>
                <div>Anterior</div>
                <div>Delta</div>
                <div>Situação</div>
                <div></div>
              </div>
              <div className="mt-1 space-y-2">
                {selectedDimensionItems.map((item) => {
                  const tone = toneClass(item.tone);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setDetailId(item.id); setDetailView("overview"); }}
                      className="grid w-full grid-cols-[1.5fr,0.55fr,0.55fr,0.55fr,0.8fr,auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div>
                        <div className="text-sm font-black text-slate-950">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.pipeline} • {item.note}</div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{item.current}%</div>
                      <div className="text-sm font-bold text-slate-600">{item.previous}%</div>
                      <div className={`text-sm font-bold ${tone.text}`}>{item.delta > 0 ? `+${item.delta}` : item.delta}%</div>
                      <div>
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge}`}>{item.state}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        Abrir
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {selectedDimensionItems.slice(0, 3).map((item) => {
                const tone = toneClass(item.tone);
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-950">{item.name}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">{item.whatMoved}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge}`}>{item.state}</span>
                    </div>
                    <div className="mt-4 text-sm leading-6 text-slate-700"><strong>Decisão:</strong> {item.decision}</div>
                    <button
                      onClick={() => { setDetailId(item.id); setDetailView("overview"); }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ver detalhe navegável
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Diagnóstico</div>
            <div className="mt-4 space-y-3">
              {diagnostics.map((item) => {
                const tone = toneClass(item.tone);
                return (
                  <div key={item.id} className={`rounded-2xl border p-4 ${tone.soft}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-black text-slate-900">{item.title}</div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${tone.badge}`}>{item.tone === "critical" ? "crítico" : item.tone === "warning" ? "alerta" : "ok"}</span>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Causa provável</div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{item.cause}</div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Decisão sugerida</div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">{item.decision}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Impacto</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Só depois da leitura macro, onde isso ganhou consequência</h2>
            <div className="mt-4 space-y-3">
              {impacts.map((impact) => {
                const tone = toneClass(impact.tone);
                return (
                  <div key={impact.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-950">{impact.account}</div>
                        <div className="mt-1 text-sm text-slate-600">{impact.detail}</div>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${tone.badge}`}>{impact.delta}</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Owner</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{impact.owner}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Ação ligada</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{impact.linkedAction}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">Movimento</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{impact.movement}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {selectedDimension && (
          <OverlayShell title={selectedDimension.name} subtitle={selectedDimension.note} onClose={() => { setDetailId(null); setDetailView("overview"); }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Atual</div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{selectedDimension.current}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Anterior</div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{selectedDimension.previous}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Delta</div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{selectedDimension.delta > 0 ? `+${selectedDimension.delta}` : selectedDimension.delta}%</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pipeline</div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{selectedDimension.pipeline}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "overview", label: "Visão da frente" },
                  { key: "accounts", label: "Contas relacionadas" },
                  { key: "actions", label: "Ações ligadas" },
                  { key: "owners", label: "Owners / squads" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDetailView(item.key as DetailView)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      detailView === item.key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {detailView === "overview" && (
              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr,1fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">O que sustentou o resultado</div>
                    <div className="mt-3 text-sm leading-7 text-slate-700">{selectedDimension.whatMoved}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Por que importa</div>
                    <div className="mt-3 text-sm leading-7 text-slate-700">{selectedDimension.whyItMatters}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Próxima decisão</div>
                    <div className="mt-3 text-lg font-black text-slate-950">{selectedDimension.decision}</div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <button onClick={() => setDetailView("accounts")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir contas relacionadas</button>
                      <button onClick={() => setDetailView("actions")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Ver ações que puxaram o resultado</button>
                      <button onClick={() => setDetailView("owners")} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Navegar para owners / squads</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailView !== "overview" && (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {(detailView === "accounts" ? selectedDimension.accounts : detailView === "actions" ? selectedDimension.actions : selectedDimension.owners).map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-black text-slate-950">{item.title}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">{item.subtitle}</div>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">{item.delta}</span>
                      </div>
                      <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">{item.status}</div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Continuidade de navegação prevista para próxima camada da plataforma
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </OverlayShell>
        )}
      </div>
    </div>
  );
};

export default Performance;
