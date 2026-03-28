"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  Filter,
  KanbanSquare,
  LayoutList,
  Link2,
  Plus,
  Search,
  TimerReset,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import * as mockData from "../data/mockData";

type Priority = "CRÍTICA" | "ALTA" | "MÉDIA" | "BAIXA";
type ViewMode = "lista" | "kanban" | "gantt";
type ActionStatus = "Nova" | "Em andamento" | "Bloqueada" | "Concluída";
type SlaStatus = "vencido" | "alerta" | "ok";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  accountName: string;
  ownerName: string | null;
  ownerAvatar?: string;
  dueLabel: string;
  slaStatus: SlaStatus;
  status: ActionStatus;
  sourceLabel: string;
  sourceType: string;
  playLabel: string;
  impactLabel: string;
  recommendedNextStep: string;
  relatedSignal: string;
  channelLabel: string;
  evidence: string[];
  timeline: { label: string; date: string; done?: boolean }[];
  buttons: { label: string; primary?: boolean; action: string }[];
}

const FALLBACK_ACTIONS: ActionItem[] = [
  {
    id: "a1",
    title: "Corrigir roteamento de inbound Fortune 500",
    description:
      "O fluxo de inbound para contas estratégicas está sendo direcionado para a fila geral por causa de uma tag de enriquecimento inconsistente.",
    priority: "CRÍTICA",
    category: "Revenue Ops",
    accountName: "CloudTech Solutions Inc.",
    ownerName: "Mariana Silva",
    ownerAvatar: "https://i.pravatar.cc/100?u=mariana",
    dueLabel: "2h (vencido)",
    slaStatus: "vencido",
    status: "Bloqueada",
    sourceLabel: "Sinal operacional de roteamento",
    sourceType: "Sinal",
    playLabel: "Recuperação de SLA inbound",
    impactLabel: "3 contas Tier 1 sem follow-up",
    recommendedNextStep: "Ajustar tag de enriquecimento, reprocessar fila e atribuir owner prioritário.",
    relatedSignal: "Fila Fortune 500 desviada para roteamento geral",
    channelLabel: "Inbound",
    evidence: [
      "3 contas com SLA quebrado nas últimas 2 horas",
      "Integração de enriquecimento parcial desde 09:14",
      "2 formulários duplicados na mesma origem de campanha",
    ],
    timeline: [
      { label: "Sinal detectado", date: "Hoje 09:14", done: true },
      { label: "Análise de causa", date: "Hoje 09:26", done: true },
      { label: "Reprocessar roteamento", date: "Hoje 10:00" },
      { label: "Reatribuir owners", date: "Hoje 10:15" },
    ],
    buttons: [
      { label: "Ajustar", primary: true, action: "start" },
      { label: "Escalar", action: "escalate" },
      { label: "Atribuir owner", action: "assign" },
    ],
  },
  {
    id: "a2",
    title: "Atribuir follow-up para contas ABM Tier 1",
    description:
      "Três contas demonstraram intenção forte nas últimas 24h e ainda não têm responsável comercial claramente definido.",
    priority: "ALTA",
    category: "ABM",
    accountName: "Nexus Fintech",
    ownerName: None,
    dueLabel: "4h restante",
    slaStatus: "alerta",
    status: "Nova",
    sourceLabel: "Sinal de intenção G2 + visitas pricing",
    sourceType: "Sinal",
    playLabel: "Follow-up executivo com prova social",
    impactLabel: "Risco de perder timing comercial",
    recommendedNextStep: "Selecionar owner com melhor cobertura da vertical financeira e disparar follow-up executivo.",
    relatedSignal: "Pico de intenção em pricing e G2",
    channelLabel: "ABM / Outbound",
    evidence: [
      "G2 high intent score nas últimas 24h",
      "3 visitas à página de pricing",
      "1 acesso ao case de fintech enterprise",
    ],
    timeline: [
      { label: "Sinal agregado", date: "Hoje 08:40", done: true },
      { label: "Validar owner", date: "Hoje 11:00" },
      { label: "Disparar follow-up", date: "Hoje 12:00" },
    ],
    buttons: [
      { label: "Atribuir", primary: true, action: "assign" },
      { label: "Ver conta", action: "open-account" },
    ],
  },
  {
    id: "a3",
    title: "Auditar campanha Q3 Cloud Migration",
    description:
      "A campanha apresenta CTR 40% abaixo do benchmark histórico e sinais de saturação criativa.",
    priority: "MÉDIA",
    category: "Mídia Paga",
    accountName: "Global Logística S.A.",
    ownerName: "Felipe Rocha",
    ownerAvatar: "https://i.pravatar.cc/100?u=felipe",
    dueLabel: "12h restante",
    slaStatus: "ok",
    status: "Em andamento",
    sourceLabel: "Desempenho abaixo do benchmark",
    sourceType: "Performance",
    playLabel: "Revisão de criativo + audiência",
    impactLabel: "Perda de eficiência no cluster cloud migration",
    recommendedNextStep: "Comparar criativo com benchmark Q1, revisar segmentação e reduzir frequência.",
    relatedSignal: "CTR -40% vs histórico",
    channelLabel: "Mídia Paga",
    evidence: [
      "CTR 0,72% vs benchmark 1,20%",
      "Frequência média 4,8",
      "Aumento de CPC em 18%",
    ],
    timeline: [
      { label: "Queda detectada", date: "Ontem 18:20", done: true },
      { label: "Auditoria criativa", date: "Hoje 10:30", done: true },
      { label: "Revisão de audiência", date: "Hoje 15:00" },
    ],
    buttons: [
      { label: "Auditar", primary: true, action: "start" },
      { label: "Conectar contexto", action: "link" },
    ],
  },
  {
    id: "a4",
    title: "Conectar Search Console do novo subdomínio",
    description:
      "Falta cobertura de dados de intenção orgânica no novo subdomínio de recursos, prejudicando sinais e assistente.",
    priority: "BAIXA",
    category: "Dados",
    accountName: "Operação Canopi",
    ownerName: "Tech Ops",
    dueLabel: "2 dias",
    slaStatus: "ok",
    status: "Nova",
    sourceLabel: "Integração pendente",
    sourceType: "Integrações",
    playLabel: "Higienização de cobertura de dados",
    impactLabel: "Visibilidade parcial do tráfego orgânico",
    recommendedNextStep: "Conectar Search Console, validar propriedade e iniciar primeira sincronização.",
    relatedSignal: "Cobertura orgânica parcial",
    channelLabel: "SEO & Inbound",
    evidence: [
      "Subdomínio ainda sem propriedade confirmada",
      "0 keywords sincronizadas desde a publicação",
    ],
    timeline: [
      { label: "Gap detectado", date: "Ontem 16:40", done: true },
      { label: "Configurar propriedade", date: "Amanhã 10:00" },
      { label: "Sincronizar dados", date: "Amanhã 16:00" },
    ],
    buttons: [
      { label: "Conectar", primary: true, action: "link" },
      { label: "Atribuir owner", action: "assign" },
    ],
  },
];

const PRIORITY_ORDER: Record<Priority, number> = {
  CRÍTICA: 0,
  ALTA: 1,
  MÉDIA: 2,
  BAIXA: 3,
};

const priorityClasses: Record<Priority, string> = {
  CRÍTICA: "border-red-500 bg-red-50 text-red-700",
  ALTA: "border-blue-600 bg-blue-50 text-blue-700",
  MÉDIA: "border-amber-500 bg-amber-50 text-amber-700",
  BAIXA: "border-slate-400 bg-slate-50 text-slate-600",
};

const statusClasses: Record<ActionStatus, string> = {
  Nova: "bg-slate-100 text-slate-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  Bloqueada: "bg-red-100 text-red-700",
  Concluída: "bg-emerald-100 text-emerald-700",
};

const slaClasses: Record<SlaStatus, string> = {
  vencido: "bg-red-100 text-red-700",
  alerta: "bg-amber-100 text-amber-700",
  ok: "bg-emerald-100 text-emerald-700",
};

function normalizePriority(value: unknown): Priority {
  const raw = String(value ?? "").toUpperCase();
  if (raw.includes("CRIT")) return "CRÍTICA";
  if (raw.includes("ALT")) return "ALTA";
  if (raw.includes("MED")) return "MÉDIA";
  return "BAIXA";
}

function normalizeStatus(value: unknown): ActionStatus {
  const raw = String(value ?? "").toLowerCase();
  if (raw.includes("concl")) return "Concluída";
  if (raw.includes("bloq") || raw.includes("risk")) return "Bloqueada";
  if (raw.includes("and") || raw.includes("progress")) return "Em andamento";
  return "Nova";
}

function normalizeSlaStatus(value: unknown, due: unknown): SlaStatus {
  const raw = String(value ?? "").toLowerCase();
  const dueText = String(due ?? "").toLowerCase();
  if (raw.includes("venc") || dueText.includes("venc")) return "vencido";
  if (raw.includes("alert") || dueText.includes("hoje") || dueText.includes("4h")) return "alerta";
  return "ok";
}

function getString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return [];
}

function extractActions(): ActionItem[] {
  const source = (mockData as any)?.actions;
  if (!Array.isArray(source) || source.length === 0) return FALLBACK_ACTIONS;

  return source.map((raw: any, index: number): ActionItem => {
    const title = getString(raw.title, raw.name, raw.actionTitle, `Ação ${index + 1}`);
    const description = getString(
      raw.description,
      raw.summary,
      raw.reason,
      "Sem descrição detalhada disponível no mock."
    );
    const priority = normalizePriority(raw.priority ?? raw.severity);
    const ownerName = getString(raw.ownerName, raw.owner, raw.assignee, raw.responsible) || null;
    const dueLabel = getString(raw.slaText, raw.sla, raw.dueLabel, raw.dueDate, "Sem SLA definido");
    const status = normalizeStatus(raw.status);
    const sourceLabel = getString(raw.sourceLabel, raw.source, raw.origin, raw.trigger, "Sinal operacional");
    const accountName = getString(raw.accountName, raw.account, raw.company, raw.accountTitle, "Conta relacionada");
    const category = getString(raw.category, raw.type, raw.area, "Operação");
    const playLabel = getString(raw.playLabel, raw.play, raw.recommendedPlay, "Próxima melhor ação");
    const impactLabel = getString(raw.impactLabel, raw.impact, raw.expectedImpact, "Impacto ainda não descrito");
    const nextStep = getString(raw.recommendedNextStep, raw.nextStep, raw.recommendation, "Validar contexto e executar.");
    const relatedSignal = getString(raw.relatedSignal, raw.signal, raw.signalTitle, sourceLabel);
    const channelLabel = getString(raw.channelLabel, raw.channel, raw.channelName, category);

    return {
      id: String(raw.id ?? `action-${index + 1}`),
      title,
      description,
      priority,
      category,
      accountName,
      ownerName,
      ownerAvatar: getString(raw.ownerAvatar, raw.avatar) || undefined,
      dueLabel,
      slaStatus: normalizeSlaStatus(raw.slaStatus, dueLabel),
      status,
      sourceLabel,
      sourceType: getString(raw.sourceType, raw.originType, "Sinal"),
      playLabel,
      impactLabel,
      recommendedNextStep: nextStep,
      relatedSignal,
      channelLabel,
      evidence: getArray(raw.evidence).length
        ? getArray(raw.evidence)
        : [sourceLabel, impactLabel, `Canal: ${channelLabel}`],
      timeline: Array.isArray(raw.timeline) && raw.timeline.length
        ? raw.timeline.map((step: any, stepIndex: number) => ({
            label: getString(step.label, step.title, step.name, `Etapa ${stepIndex + 1}`),
            date: getString(step.date, step.when, step.timestamp, "Sem data"),
            done: Boolean(step.done ?? step.completed),
          }))
        : [
            { label: "Sinal detectado", date: "Hoje", done: true },
            { label: "Análise de contexto", date: "Hoje" },
            { label: "Execução da ação", date: dueLabel },
          ],
      buttons: Array.isArray(raw.buttons) && raw.buttons.length
        ? raw.buttons.map((button: any) => ({
            label: getString(button.label, button.name, "Executar"),
            primary: Boolean(button.primary),
            action: getString(button.action, button.label, "start").toLowerCase(),
          }))
        : [
            { label: "Executar", primary: true, action: "start" },
            { label: "Atribuir owner", action: "assign" },
          ],
    };
  });
}

function extractActionKpis(actions: ActionItem[]) {
  const source = (mockData as any)?.actionKPIs;
  if (Array.isArray(source) && source.length >= 4) {
    return source.map((item: any, index: number) => ({
      id: String(item.id ?? index),
      label: getString(item.label, item.title, item.name, `KPI ${index + 1}`),
      value: getString(item.value, item.metric, item.number, "0"),
      helper: getString(item.helper, item.description, item.delta, ""),
    }));
  }

  return [
    {
      id: "k1",
      label: "Críticas agora",
      value: String(actions.filter((a) => a.priority === "CRÍTICA").length),
      helper: "Itens que exigem resposta imediata",
    },
    {
      id: "k2",
      label: "SLA vencido",
      value: String(actions.filter((a) => a.slaStatus === "vencido").length),
      helper: "Ações já fora do prazo",
    },
    {
      id: "k3",
      label: "Sem owner",
      value: String(actions.filter((a) => !a.ownerName).length),
      helper: "Itens sem responsável definido",
    },
    {
      id: "k4",
      label: "Em fluxo",
      value: String(actions.filter((a) => a.status === "Em andamento").length),
      helper: "Ações em execução agora",
    },
  ];
}

function sortActions(items: ActionItem[]) {
  return [...items].sort((a, b) => {
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }
    return a.title.localeCompare(b.title);
  });
}

function ActionProfileModal({
  action,
  onClose,
}: {
  action: ActionItem | null;
  onClose: () => void;
}) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 px-8 py-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold border ${priorityClasses[action.priority]}`}>
                {action.priority}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[action.status]}`}>
                {action.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${slaClasses[action.slaStatus]}`}>
                SLA: {action.dueLabel}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{action.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{action.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 px-8 py-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conta relacionada</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">{action.accountName}</p>
                    <p className="mt-1 text-sm text-slate-500">{action.channelLabel}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Ver conta <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Responsável</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">{action.ownerName ?? "Não atribuído"}</p>
                    <p className="mt-1 text-sm text-slate-500">{action.category}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Atribuir owner <UserPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Origem e contexto</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{action.sourceLabel}</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Ver sinal <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{action.sourceType}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Play sugerido</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{action.playLabel}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Impacto esperado</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{action.impactLabel}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Próximo passo recomendado</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{action.recommendedNextStep}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Evidências</p>
                <ul className="mt-3 space-y-3">
                  {action.evidence.map((evidence, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="border-t border-slate-100 bg-slate-50 px-8 py-6 lg:border-l lg:border-t-0">
            <div className="space-y-6">
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Linha do tempo da ação</p>
                <div className="mt-4 space-y-4">
                  {action.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-0.5 flex flex-col items-center">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400 border border-slate-200"}`}>
                          {step.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                        </div>
                        {idx < action.timeline.length - 1 && <div className="mt-1 h-8 w-px bg-slate-200" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ações rápidas</p>
                <div className="mt-4 flex flex-col gap-3">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Marcar em andamento <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Reatribuir owner <UserPlus className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Escalar risco <AlertTriangle className="h-4 w-4" />
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function Actions() {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"Todas" | Priority>("Todas");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [items, setItems] = useState<ActionItem[]>(() => sortActions(extractActions()));

  const kpis = useMemo(() => extractActionKpis(items), [items]);

  const filteredItems = useMemo(() => {
    const base = items.filter((item) => {
      const matchesQuery =
        !query ||
        [item.title, item.description, item.accountName, item.ownerName ?? "", item.category, item.sourceLabel]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
      return matchesQuery && matchesPriority;
    });

    return sortActions(base);
  }, [items, priorityFilter, query]);

  const selectedAction =
    filteredItems.find((item) => item.id === selectedId) ??
    items.find((item) => item.id === selectedId) ??
    filteredItems[0] ??
    null;

  const profileAction =
    items.find((item) => item.id === profileId) ??
    selectedAction;

  const kanbanGroups: ActionStatus[] = ["Nova", "Em andamento", "Bloqueada", "Concluída"];

  function updateAction(id: string, patch: Partial<ActionItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function handleButtonAction(item: ActionItem, action: string) {
    const normalized = action.toLowerCase();

    if (normalized.includes("assign") || normalized.includes("atrib")) {
      updateAction(item.id, {
        ownerName: item.ownerName ?? "Owner sugerido pela Canopi",
        status: item.status === "Nova" ? "Em andamento" : item.status,
      });
      return;
    }

    if (normalized.includes("escal")) {
      updateAction(item.id, {
        priority: "CRÍTICA",
        slaStatus: "alerta",
        status: "Bloqueada",
      });
      return;
    }

    if (normalized.includes("start") || normalized.includes("ajust") || normalized.includes("audit") || normalized.includes("connect") || normalized.includes("link")) {
      updateAction(item.id, {
        status: "Em andamento",
        slaStatus: item.slaStatus === "vencido" ? "alerta" : item.slaStatus,
      });
      return;
    }

    if (normalized.includes("done") || normalized.includes("concl")) {
      updateAction(item.id, { status: "Concluída", slaStatus: "ok" });
      return;
    }
  }

  const renderList = () => (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelectedId(item.id)}
          className={`w-full rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
            selectedAction?.id === item.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
          }`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClasses[item.priority]}`}>
                  {item.priority}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[item.status]}`}>
                  {item.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.category}
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-slate-900">{item.title}</h3>
              <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-600">{item.description}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conta</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{item.accountName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{item.ownerName ?? "Não atribuído"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Origem</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{item.sourceLabel}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SLA</p>
                  <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-bold ${slaClasses[item.slaStatus]}`}>
                    {item.dueLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-[260px]">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setProfileId(item.id);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                Ver perfil completo
              </button>

              <div className="grid grid-cols-1 gap-2">
                {item.buttons.map((button, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleButtonAction(item, button.action);
                    }}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      button.primary
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderKanban = () => (
    <div className="grid gap-4 xl:grid-cols-4">
      {kanbanGroups.map((status) => {
        const columnItems = filteredItems.filter((item) => item.status === status);
        return (
          <div key={status} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide text-slate-800">{status}</h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                {columnItems.length}
              </span>
            </div>
            <div className="space-y-3">
              {columnItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="w-full rounded-2xl border border-white bg-white p-4 text-left shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityClasses[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${slaClasses[item.slaStatus]}`}>
                      {item.dueLabel}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{item.description}</p>
                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <p><strong className="text-slate-700">Conta:</strong> {item.accountName}</p>
                    <p><strong className="text-slate-700">Owner:</strong> {item.ownerName ?? "Não atribuído"}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setProfileId(item.id);
                      }}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleButtonAction(item, "start");
                      }}
                      className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Avançar
                    </button>
                  </div>
                </button>
              ))}
              {columnItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-400">
                  Nenhuma ação nesta coluna
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGantt = () => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[2.2fr_1fr_1fr_3fr] border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>Ação</span>
        <span>Status</span>
        <span>SLA</span>
        <span>Timeline</span>
      </div>

      {filteredItems.map((item) => {
        const steps = item.timeline.length || 1;
        return (
          <div key={item.id} className="grid grid-cols-[2.2fr_1fr_1fr_3fr] items-center border-b border-slate-100 px-5 py-4 last:border-b-0">
            <div className="pr-4">
              <button onClick={() => setProfileId(item.id)} className="text-left">
                <p className="font-bold text-slate-900 hover:text-blue-700">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.accountName}</p>
              </button>
            </div>
            <div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[item.status]}`}>
                {item.status}
              </span>
            </div>
            <div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${slaClasses[item.slaStatus]}`}>
                {item.dueLabel}
              </span>
            </div>
            <div>
              <div className="grid grid-cols-4 gap-2">
                {item.timeline.map((step, idx) => (
                  <div key={idx} className={`rounded-xl border px-3 py-2 text-xs ${step.done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    <p className="font-semibold">{step.label}</p>
                    <p className="mt-1 opacity-80">{step.date}</p>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - steps) }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-300">
                    —
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 pb-24">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">Revenue Ops / Ações</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Fila operacional de ações</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Priorize, mova e inspecione ações com contexto de conta, sinal, owner, SLA e impacto esperado.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nova ação
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          {kpis.map((kpi, idx) => (
            <div key={kpi.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{kpi.value}</p>
                </div>
                {idx === 0 && <AlertTriangle className="h-6 w-6 text-red-500" />}
                {idx === 1 && <Clock3 className="h-6 w-6 text-amber-500" />}
                {idx === 2 && <Users className="h-6 w-6 text-blue-500" />}
                {idx === 3 && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              </div>
              {kpi.helper && <p className="mt-3 text-xs leading-5 text-slate-500">{kpi.helper}</p>}
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar por conta, ação, owner ou origem..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <div className="relative">
                      <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value as any)}
                        className="appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                      >
                        <option>Todas</option>
                        <option>CRÍTICA</option>
                        <option>ALTA</option>
                        <option>MÉDIA</option>
                        <option>BAIXA</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  {[
                    { id: "lista" as ViewMode, label: "Lista", icon: LayoutList },
                    { id: "kanban" as ViewMode, label: "Kanban", icon: KanbanSquare },
                    { id: "gantt" as ViewMode, label: "Gantt", icon: CalendarDays },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        viewMode === mode.id
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <XCircle className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">Nenhuma ação encontrada</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Ajuste os filtros ou limpe a busca para ver novamente a fila operacional.
                </p>
              </div>
            ) : viewMode === "lista" ? (
              renderList()
            ) : viewMode === "kanban" ? (
              renderKanban()
            ) : (
              renderGantt()
            )}
          </div>

          <aside className="sticky top-24 h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedAction ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClasses[selectedAction.priority]}`}>
                    {selectedAction.priority}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[selectedAction.status]}`}>
                    {selectedAction.status}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ação selecionada</p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">{selectedAction.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{selectedAction.description}</p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conta</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAction.accountName}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Owner</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAction.ownerName ?? "Não atribuído"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Origem</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAction.sourceLabel}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Próximo passo</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selectedAction.recommendedNextStep}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setProfileId(selectedAction.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    Ver perfil completo
                  </button>
                  <button
                    onClick={() => handleButtonAction(selectedAction, "assign")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Atribuir owner
                  </button>
                  <button
                    onClick={() => handleButtonAction(selectedAction, "escalate")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Escalar risco
                  </button>
                  <button
                    onClick={() => handleButtonAction(selectedAction, "start")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <TimerReset className="h-4 w-4" />
                    Marcar em andamento
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Link2 className="h-4 w-4" />
                    Conectar contexto
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Eye className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">Selecione uma ação para ver o contexto operacional.</p>
              </div>
            )}
          </aside>
        </section>
      </div>

      <ActionProfileModal action={profileAction ?? null} onClose={() => setProfileId(null)} />
    </>
  );
}
