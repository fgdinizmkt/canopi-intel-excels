"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock3,
  Download,
  FolderKanban,
  GripVertical,
  History,
  LayoutList,
  Plus,
  Search,
  Users,
  X,
  Target,
  TrendingUp,
  Activity,
  MessageSquare,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Badge, Button, Card } from '../components/ui';
import { useAccountDetail } from "../context/AccountDetailContext";
import { contasMock, ActionItem, ActionStatus, Priority, SlaStatus, HistoryItem, ProjectStep } from "../data/accountsData";

type ViewMode = "Lista" | "Kanban";
type ModalTab = "resumo" | "projeto" | "historico";
type CardDensity = "super-compacta" | "compacta" | "media" | "expandida";

// ─── Style helpers (inline para garantir compilação no Tailwind v4) ─────────



// ─── Classes legadas (usadas no Kanban e Overlay) ───────────────────────────

const priorityClasses: Record<Priority, string> = {
  Crítica: "border border-red-200 bg-red-50 text-red-700",
  Alta:    "border border-blue-200 bg-blue-50 text-blue-700",
  Média:   "border border-orange-200 bg-orange-50 text-orange-700",
  Baixa:   "border border-slate-200 bg-slate-100 text-slate-600",
};

const statusClasses: Record<ActionStatus, string> = {
  Nova:                   "bg-slate-100 text-slate-700",
  'Em andamento':         "bg-blue-100 text-blue-700",
  Bloqueada:              "bg-amber-100 text-amber-700",
  'Aguardando aprovação': "bg-violet-100 text-violet-700",
  Concluída:              "bg-emerald-100 text-emerald-700",
};

const slaClasses: Record<SlaStatus, string> = {
  vencido: "text-red-600",
  alerta: "text-amber-600",
  ok: "text-slate-900",
  sem_sla: "text-slate-500",
};

const cardSurfaceClasses: Record<ActionStatus, string> = {
  Nova: "bg-slate-50",
  'Em andamento': "bg-blue-50",
  Bloqueada: "bg-amber-50",
  'Aguardando aprovação': "bg-violet-50",
  Concluída: "bg-emerald-50",
};

const priorityBorderClasses: Record<Priority, string> = {
  Crítica: "border-l-4 border-l-red-500",
  Alta: "border-l-4 border-l-blue-600",
  Média: "border-l-4 border-l-amber-500",
  Baixa: "border-l-4 border-l-slate-400",
};

const ganttBarClasses: Record<ProjectStep["status"], string> = {
  done: "bg-emerald-500",
  active: "bg-blue-600",
  pending: "bg-slate-300",
  risk: "bg-red-500",
};

const historyDotClasses: Record<HistoryItem["type"], string> = {
  mudança: "bg-blue-600",
  evidência: "bg-emerald-500",
  risco: "bg-red-500",
  owner: "bg-violet-500",
  "follow-up": "bg-amber-500",
  comentário: "bg-slate-400",
};

// Inline version for guaranteed rendering



const statusOptions: ActionStatus[] = ["Nova", "Em andamento", "Bloqueada", "Aguardando aprovação", "Concluída"];
const weekLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string | null) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function sortByPriorityAndSla(items: ActionItem[]) {
  const priorityOrder: Record<Priority, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 };
  const slaOrder: Record<SlaStatus, number> = { vencido: 0, alerta: 1, ok: 2, sem_sla: 3 };
  return [...items].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return slaOrder[a.slaStatus] - slaOrder[b.slaStatus];
  });
}

function MetricCard({ label, value, helper, icon }: { label: string; value: number | string; helper?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-[20px] p-4 flex flex-col justify-center backdrop-blur-md">
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.16em] mb-2">{label}</div>
      <div className="text-[28px] font-extrabold tracking-tighter leading-none text-white">{value}</div>
      {helper && <div className="text-[11px] text-white/50 mt-1 font-medium">{helper}</div>}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex min-w-[160px] flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none bg-transparent pr-7 text-sm font-semibold text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-4 h-4 w-4 text-slate-400" />
    </label>
  );
}

function QuickButton({
  label,
  tone,
  onClick,
  small = false,
}: {
  label: string;
  tone: "primary" | "secondary" | "danger";
  onClick: () => void;
  small?: boolean;
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold cursor-pointer transition-all active:scale-95";
  const sizeClasses = small ? "rounded-xl px-3 py-1.5 text-xs" : "rounded-[14px] px-[18px] py-[9px] text-[13px]";
  const toneClasses = 
    tone === 'primary' ? "bg-[#2b44ff] text-white border-none hover:bg-[#1a33ee]" : 
    tone === 'danger' ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : 
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={cx(baseClasses, sizeClasses, toneClasses)}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="bg-white/85 p-3 rounded-[14px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-[13px] font-bold leading-relaxed text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{helper}</p>
    </div>
  );
}

function DetailList({ title, items, emptyLabel }: { title: string; items: string[]; emptyLabel: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">{emptyLabel}</p> : null}
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#2457f5]" />
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DensityToggle({
  value,
  onChange,
}: {
  value: CardDensity;
  onChange: (value: CardDensity) => void;
}) {
  const options: Array<{ id: CardDensity; label: string }> = [
    { id: "compacta", label: "Compacta" },
    { id: "media", label: "Média" },
    { id: "expandida", label: "Expandida" },
  ];

  return (
    <div className="flex items-center gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Densidade do Kanban</p>
      <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cx(
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              value === option.id ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type ProjectScale = "semana" | "mes" | "trimestre";

function scaleConfig(scale: ProjectScale) {
  if (scale === "mes") {
    return { labels: ["Mar", "Abr", "Mai", "Jun"], units: 4 };
  }
  if (scale === "trimestre") {
    return { labels: ["T1", "T2", "T3"], units: 3 };
  }
  return { labels: weekLabels, units: 8 };
}

function normalizeStep(step: ProjectStep, scale: ProjectScale) {
  if (scale === "mes") {
    const start = Math.floor((step.startWeek - 1) / 2) + 1;
    const duration = Math.max(1, Math.ceil(step.duration / 2));
    return { start, duration };
  }
  if (scale === "trimestre") {
    const start = Math.floor((step.startWeek - 1) / 3) + 1;
    const duration = Math.max(1, Math.ceil(step.duration / 3));
    return { start, duration };
  }
  return { start: step.startWeek, duration: step.duration };
}

function ActionListCard({
  item,
  density = 'media',
  onTitleClick,
  onButtonAction,
}: {
  item: ActionItem;
  density?: CardDensity;
  onTitleClick: (item: ActionItem) => void;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
}) {
  const { openAccount } = useAccountDetail();
  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1';
  };
  const getBtnClasses = (tone: string) => cx(
    "block w-full py-2.25 px-4 rounded-[14px] text-[13px] font-bold transition-all hover:brightness-95 active:scale-[0.98] text-center",
    tone === 'primary' ? "bg-blue-600 text-white border-none" : 
    tone === 'danger' ? "bg-rose-50 text-rose-600 border border-rose-200" : 
    "bg-white text-slate-700 border border-slate-200"
  );

  // ── Super compacta: só título, owner e tags ────────────────────────
  if (density === 'super-compacta') {
    return (
      <div className={cx(
        "flex items-center gap-2.5 transition-all border shadow-sm",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        "rounded-[14px] p-[10px_16px]"
      )}>
        <span className={cx(priorityClasses[item.priority], "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0")}>{item.priority}</span>
        <span className={cx(statusClasses[item.status], "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0")}>{item.status}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName), undefined, { originModule: 'Ações' }); }}
          className="flex-1 min-w-0 text-left bg-transparent border-none cursor-pointer p-0 text-sm font-extrabold text-slate-900 truncate"
        >
          <span className="hover:text-blue-600 transition-colors">{item.accountName}</span> <span className="font-medium text-slate-500">— {item.title}</span>
        </button>
        <span className="text-xs text-slate-500 shrink-0 font-medium">{item.ownerName ?? 'N/A'}</span>
        <span className={cx(slaClasses[item.slaStatus], "text-xs shrink-0 font-bold")}>{item.slaText}</span>
      </div>
    );
  }


  return (
    <div className={cx(
        "transition-all border shadow-sm hover:border-slate-300",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        density === 'compacta' ? "rounded-[20px] p-4" : "rounded-[24px] p-[20px_24px]"
    )}>
      <div className="flex gap-6 items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cx(priorityClasses[item.priority], "rounded-full px-2.5 py-1 text-[11px] font-bold")}>
              {item.priority}
            </span>
            <span className={cx(statusClasses[item.status], "rounded-full px-2.5 py-1 text-[11px] font-bold")}>
              {item.status}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {item.channel}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {item.category}
            </span>
            {item.sourceType === "playbook" && (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                Playbook: {item.playbookName}
              </span>
            )}
          </div>

          {/* Title & description */}
          <div className="mt-4">
            <div className="text-left bg-none border-none p-0">
              <p 
                onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName), undefined, { originModule: 'Ações' }); }}
                className="hover:text-blue-600 transition-colors cursor-pointer text-[22px] font-black tracking-[-0.03em] leading-tight text-slate-900"
              >
                {item.accountName}
              </p>
              <button 
                type="button" 
                onClick={() => onTitleClick(item)} 
                className="text-left bg-none border-none cursor-pointer p-0 block mt-1"
                aria-label={`Ver detalhes da ação: ${item.title}`}
              >
                <p className="text-sm font-semibold text-slate-600">{item.title}</p>
              </button>
            </div>
            {density !== 'compacta' && (
              <p className="mt-3 text-[13px] leading-relaxed text-slate-500 max-w-[880px]">{item.description}</p>
            )}
            {density === 'compacta' && item.origin && (
              <p className="mt-2 text-[11px] text-slate-400 font-medium">{item.origin}</p>
            )}
          </div>

          {/* Info blocks — hide on compacta */}
          {density === 'expandida' && (
            <div className="mt-5 grid grid-cols-5 gap-3">
              <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
              <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={item.ownerTeam} />
              <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
              <InfoBlock label="Impacto" value={item.expectedImpact} helper="Consequência esperada" />
              <InfoBlock label="Próximo passo" value={item.nextStep} helper={item.slaText} />
            </div>
          )}
          {density === 'media' && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={item.ownerTeam} />
              <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
              <InfoBlock label="SLA" value={item.slaText} helper={item.status} />
            </div>
          )}
        </div>

        {/* Action sidebar */}
        <div className="w-[180px] shrink-0 flex flex-col gap-2">
          {item.buttons.map((button) => (
            <button
              key={button.id}
              type="button"
              className={getBtnClasses(button.tone)}
              onClick={() => onButtonAction(item, button.action)}
              aria-label={button.label}
            >
              {button.label}
            </button>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">SLA</p>
            <p className={cx("mt-1.25 text-[13px] font-bold", slaClasses[item.slaStatus])}>{item.slaText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({
  item,
  density,
  onTitleClick,
  onButtonAction,
  onDragStart,
}: {
  item: ActionItem;
  density: CardDensity;
  onTitleClick: (item: ActionItem) => void;
  onButtonAction: (item: ActionItem, action: ActionItem["buttons"][number]["action"]) => void;
  onDragStart: (id: string) => void;
}) {
  const compact = density === 'compacta' || density === 'super-compacta';
  const superCompact = density === 'super-compacta';
  const medium = density === 'media';
  const summary = compact
    ? truncateText(item.description, 72)
    : medium
      ? truncateText(item.description, 110)
      : truncateText(item.description, 145);

  const minH = superCompact ? 120 : compact ? 200 : medium ? 248 : 290;

  return (
    <div 
      draggable 
      onDragStart={() => onDragStart(item.id)} 
      className={cx(
        "flex flex-col border transition-all cursor-grab active:cursor-grabbing hover:border-slate-400 hover:shadow-lg",
        priorityBorderClasses[item.priority],
        cardSurfaceClasses[item.status],
        superCompact ? "rounded-[16px] p-2.5 min-h-[120px]" : compact ? "rounded-[20px] p-4 min-h-[200px]" : medium ? "rounded-[20px] p-4 min-h-[248px]" : "rounded-[20px] p-4 min-h-[290px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={cx(priorityClasses[item.priority], "rounded-full px-2 py-0.5 text-[10px] font-bold")}>
            {item.priority}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 truncate">
            {item.category}
          </span>
          {item.sourceType === "playbook" && (
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-sky-600 truncate">
              PB: {item.playbookName}
            </span>
          )}
        </div>
        {!compact && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {item.channel}
          </span>
        )}
      </div>

      {/* Title */}
      {!superCompact && (
        <div className="mt-3 min-w-0">
          <button
            type="button"
            onClick={() => onTitleClick(item)}
            className="w-full text-left bg-transparent border-none cursor-pointer p-0"
          >
            <p className={cx("font-black tracking-tight leading-tight text-slate-900 truncate", compact ? "text-[17px]" : "text-[18px]")}>
              {item.accountName}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-600 truncate">
              {item.title}
            </p>
          </button>
          <p className={cx("mt-2 leading-relaxed text-slate-500", compact ? "text-[11px]" : "text-xs")}>{summary}</p>
        </div>
      )}
      {superCompact && (
        <button
          type="button"
          onClick={() => onTitleClick(item)}
          className="mt-2 w-full text-left bg-transparent border-none cursor-pointer p-0 text-sm font-black text-slate-900 truncate"
        >
          {item.accountName}
        </button>
      )}

      {/* Meta — hide on super-compacta */}
      {!superCompact && (
        <div className={cx("mt-3 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner</p>
            <p className="mt-1 text-xs font-bold text-slate-900 truncate">{item.ownerName ?? 'Não atribuído'}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{item.ownerTeam}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA</p>
            <p className={cx("mt-1 text-xs font-bold", slaClasses[item.slaStatus])}>{item.slaText}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{item.status}</p>
          </div>
        </div>
      )}

      {/* Next step */}
      {density !== 'compacta' && !superCompact && (
        <div className="mt-2.5 rounded-xl bg-white/60 p-2.5 border border-white/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Próximo passo</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {truncateText(item.nextStep, density === 'media' ? 80 : 120)}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-auto pt-3 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onButtonAction(item, 'open')}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all"
        >
          Ver
        </button>
        {item.buttons.slice(0, 1).map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => onButtonAction(item, btn.action)}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-blue-700 transition-all"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Playbook Library (Recorte 20) ──────────────────────────────────────────

type PlaybookCategory = "Retenção Crítica" | "Expansão" | "Novos Logos" | "Upsell";

interface PlaybookTemplateAction {
  id: string;
  title: string;
  priority: Priority;
  category: string;
  channel: string;
  expectedImpact: string;
}

interface PlaybookTemplate {
  id: string;
  name: string;
  category: PlaybookCategory;
  objective: string;
  criteria: string;
  actions: PlaybookTemplateAction[];
}

const playbookTemplates: PlaybookTemplate[] = [
  {
    id: "pb-retention-enterprise",
    name: "Escudo de Renovação Enterprise",
    category: "Retenção Crítica",
    objective: "Reverter risco de churn em contas Tier 1 e blindar a renovação ativando sponsors secundários.",
    criteria: "Status Geral = Crítico ou Risco > 70%",
    actions: [
      { id: "step-1-roi", title: "Reunião Executiva: Validação de ROI", priority: "Crítica", category: "ABX", channel: "Executivo", expectedImpact: "Blindagem de Pipeline" },
      { id: "step-2-audit", title: "Auditoria de Adoção: Módulo Core", priority: "Alta", category: "CS", channel: "Técnico", expectedImpact: "Redução de Atrito" },
      { id: "step-3-briefing", title: "Briefing de Renovação Blindada", priority: "Alta", category: "Revenue", channel: "Sales", expectedImpact: "Fechamento de Ciclo" },
    ]
  }
];

function PlaybookCard({ template, potentialCount, onConfigure }: { template: PlaybookTemplate; potentialCount: number; onConfigure: (template: PlaybookTemplate) => void }) {
  return (
    <div className="min-w-[280px] rounded-[24px] border border-slate-200 bg-slate-50 p-6 flex flex-col gap-4 shadow-sm hover:border-slate-300 transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
          <FolderKanban className="w-5 h-5 text-slate-700" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full">
          {template.category}
        </span>
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 leading-tight letter-spacing-[-0.03em]">{template.name}</h4>
        <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">{template.objective}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oportunidade</p>
          <p className="text-xs font-bold text-slate-700">{potentialCount} {potentialCount === 1 ? 'conta' : 'contas'}</p>
        </div>
        <button 
          onClick={() => onConfigure(template)}
          className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors"
        >
          Configurar Play
        </button>
      </div>
    </div>
  );
}

function PlaybookActivationOverlay({ 
  template, 
  onClose, 
  onConfirm 
}: { 
  template: PlaybookTemplate | null; 
  onClose: () => void; 
  onConfirm: (templateId: string, accountIds: string[]) => void 
}) {
  const [selectedAccs, setSelectedAccs] = useState<string[]>([]);
  const eligibleAccounts = useMemo(() => {
    if (!template) return [];
    // LogPrime (ID 3) é o alvo do template 01
    return contasMock.filter(c => c.id === '3');
  }, [template]);

  useEffect(() => {
    if (eligibleAccounts.length > 0) setSelectedAccs([eligibleAccounts[0].id]);
  }, [eligibleAccounts]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-20 flex items-stretch animate-in fade-in duration-300">
      <div className="m-auto flex flex-col w-full max-w-[1000px] overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-2xl">
        <div className="border-bottom border-slate-200 p-10 bg-slate-50/50">
          <div className="flex items-start justify-between gap-10">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest py-1 px-3 border border-blue-100 bg-blue-50 rounded-full">Configurando Ativação</span>
              <h2 className="mt-6 text-4xl font-black text-slate-900 letter-spacing-[-0.03em]">{template.name}</h2>
              <p className="mt-4 text-base text-slate-500 font-medium max-w-xl">{template.objective}</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors active:scale-90"
              aria-label="Fechar modal de ativação"
              title="Fechar"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-[1fr_320px] gap-10">
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Contas Elegíveis para este Playbook</p>
              <div className="space-y-3">
                {eligibleAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-5 p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <input 
                      type="checkbox" 
                      id={`acc-${acc.id}`}
                      className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" 
                      checked={selectedAccs.includes(acc.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAccs(prev => [...prev, acc.id]);
                        else setSelectedAccs(prev => prev.filter(id => id !== acc.id));
                      }}
                      aria-label={`Selecionar conta ${acc.nome}`}
                    />
                    <div className="flex-1">
                      <p className="text-lg font-black text-slate-900">{acc.nome}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 py-0.5 px-2 rounded">Risco {acc.risco}%</span>
                         <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 py-0.5 px-2 rounded">Renovação em 65 dias</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Owner Sugerido</p>
                       <p className="text-sm font-bold text-slate-700">{acc.ownerPrincipal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Injeção Operacional (3 Ações)</p>
              <div className="space-y-2">
                {template.actions.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-200 bg-white">
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{idx+1}</span>
                      <p className="text-sm font-bold text-slate-700">{act.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{act.channel}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase border border-slate-100 py-1 px-2 rounded">{act.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo da Ativação</p>
                <p className="mt-4 text-base font-medium leading-relaxed">
                   Ao ativar, o sistema injetará <span className="font-black text-blue-400">3 ações</span> diretamente na fila operacional para a conta selecionada.
                </p>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-white/50">Total de Ações</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                  <span className="text-white/50">Contas</span>
                  <span className="font-bold">{selectedAccs.length}</span>
                </div>
              </div>
              <button 
                onClick={() => onConfirm(template.id, selectedAccs)}
                disabled={selectedAccs.length === 0}
                className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Injetar 3 ações na fila
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionOverlay({
  item,
  tab,
  setTab,
  projectScale,
  setProjectScale,
  onClose,
  onAssignOwner,
  onChangeStatus,
  onEscalate,
}: {
  item: ActionItem | null;
  tab: ModalTab;
  setTab: (tab: ModalTab) => void;
  projectScale: ProjectScale;
  setProjectScale: (value: ProjectScale) => void;
  onClose: () => void;
  onAssignOwner: (id: string) => void;
  onChangeStatus: (id: string, nextStatus: ActionStatus) => void;
  onEscalate: (id: string) => void;
}) {
  const [commentDraft, setCommentDraft] = useState("");
  const { updateAction, openAccount } = useAccountDetail();
  const config = scaleConfig(projectScale);

  const getAccountIdByName = (name: string) => {
    const account = contasMock.find(c => c.nome.toLowerCase() === name.toLowerCase());
    return account ? account.id : '1';
  };
  
  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item) return null;

  const handleSaveNextStep = (val: string) => {
    if (val !== item.nextStep) {
      updateAction(item.id, { nextStep: val });
    }
  };

  const handleSaveOwner = (val: string) => {
    if (val !== item.ownerName) {
      updateAction(item.id, { ownerName: val });
    }
  };

  const handlePostComment = () => {
    if (!commentDraft.trim()) return;
    updateAction(item.id, { comment: commentDraft });
    setCommentDraft("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 p-5 lg:p-10 backdrop-blur-md flex items-stretch animate-in fade-in duration-300">
      <div className="m-auto flex flex-col w-full max-w-[1380px] h-full overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.18)]">
        {/* Header */}
        <div className="border-b border-slate-200 p-8 lg:px-10 bg-slate-50/30">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold border", priorityClasses[item.priority])}>{item.priority}</span>
                <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", statusClasses[item.status])}>{item.status}</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.channel}</span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
              </div>
              <p 
                onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName), undefined, { originModule: 'Ações' }); }}
                className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-block"
              >
                {item.accountName}
              </p>
              <h2 className="mt-3 text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-slate-900 max-w-4xl">{item.title}</h2>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-slate-500 max-w-3xl font-medium">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-12 h-12 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shrink-0 shadow-sm active:scale-95"
              aria-label="Fechar overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs + Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200/50 pt-6">
            <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1">
              {[
                { id: 'resumo', label: 'Resumo' },
                { id: 'projeto', label: 'Projeto' },
                { id: 'historico', label: 'Histórico' },
              ].map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTab(entry.id as ModalTab)}
                  className={cx(
                    "rounded-xl px-5 py-2 text-sm font-bold transition-all border-none cursor-pointer",
                    tab === entry.id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="lg:ml-auto flex flex-wrap gap-2">
              <QuickButton label={item.ownerName ? 'Reatribuir owner' : 'Atribuir owner sugerido'} tone="secondary" onClick={() => onAssignOwner(item.id)} />
              <QuickButton label="Escalar risco" tone="danger" onClick={() => onEscalate(item.id)} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {tab === 'resumo' && (
            <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-8">
              <div className="flex flex-col gap-8">
                {/* Info grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div onClick={(e) => { e.stopPropagation(); openAccount(getAccountIdByName(item.accountName), undefined, { originModule: 'Ações' }); }} className="cursor-pointer">
                    <InfoBlock label="Conta" value={item.accountName} helper={item.accountContext} />
                  </div>
                  <InfoBlock label="Owner" value={item.ownerName ?? 'Não atribuído'} helper={`Time: ${item.ownerTeam}`} />
                  <InfoBlock label="Origem" value={item.origin} helper={item.relatedSignal} />
                  <InfoBlock label="SLA" value={item.slaText} helper={`Status: ${item.status}`} />
                </div>

                {/* Impact + Next step */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50/50 p-8 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impacto esperado</p>
                    <p className="mt-4 text-3xl font-black tracking-tight leading-tight text-slate-900">{item.expectedImpact}</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximo passo</p>
                    <input 
                      type="text"
                      defaultValue={item.nextStep}
                      onBlur={(e) => handleSaveNextStep(e.target.value)}
                      className="mt-4 w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-lg font-bold leading-relaxed text-slate-700 focus:outline-blue-200"
                    />
                    <div className="mt-8 flex gap-3">
                      <QuickButton label="Abrir projeto" tone="secondary" onClick={() => setTab('projeto')} />
                      <QuickButton label="Executar agora" tone="primary" onClick={() => onChangeStatus(item.id, 'Em andamento')} />
                    </div>
                  </div>
                </div>

                {/* Evidence + Dependencies */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <DetailList title="Evidências" items={item.evidence} emptyLabel="Sem evidências registradas." />
                  <DetailList title="Dependências" items={item.dependencies} emptyLabel="Nenhuma dependência registrada." />
                </div>
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-6">Controle Operacional</p>
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">Lifecycle da Ação</p>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map(st => (
                          <button
                            key={st}
                            onClick={() => onChangeStatus(item.id, st)}
                            className={cx(
                              "text-[10px] font-bold py-2.5 px-1 rounded-xl border transition-all text-center",
                              item.status === st 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Atribuir Owner</p>
                      <input 
                        type="text"
                        placeholder="Nome do responsável..."
                        defaultValue={item.ownerName || ""}
                        onBlur={(e) => handleSaveOwner(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-wider">Registrar Observação</p>
                      <textarea 
                        rows={3}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder="Adicione um comentário ou atualização rápida..."
                        className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      />
                      <button 
                        onClick={handlePostComment}
                        className="w-full mt-3 py-3 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Salvar observação
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-6">Histórico recente</p>
                  <div className="flex flex-col gap-6">
                    {item.history.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <span className={cx("w-2.5 h-2.5 rounded-full shrink-0 mt-1", historyDotClasses[entry.type])} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{entry.text}</p>
                          <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{entry.actor} · {entry.when}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'projeto' && (
            <div className="flex flex-col gap-8">
              <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projeto operacional da ação</p>
                    <h3 className="mt-4 text-3xl font-black tracking-tight leading-tight text-slate-900">{item.projectObjective}</h3>
                    <p className="mt-3 text-sm font-bold text-slate-500">Critério de sucesso: {item.projectSuccess}</p>
                  </div>
                  <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 gap-1">
                    {[{ id: 'semana', label: 'Semana' }, { id: 'mes', label: 'Mês' }, { id: 'trimestre', label: 'Trimestre' }].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setProjectScale(o.id as ProjectScale)}
                        className={cx(
                            "rounded-xl px-5 py-2 text-xs font-bold transition-all border-none cursor-pointer",
                            projectScale === o.id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500 hover:text-slate-700"
                        )}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-1 shadow-sm overflow-hidden scrollbar-hide">
                <div className="min-w-[1200px] p-10">
                  {/* Gantt header */}
                  <div className="grid grid-cols-[200px_350px_160px_1fr] gap-6 pb-6 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>Fase</div><div>Entregável</div><div>Owner</div>
                    <div className={cx("grid gap-2", config.units === 8 ? "grid-cols-8" : config.units === 4 ? "grid-cols-4" : "grid-cols-3")}>
                      {config.labels.map((l) => <div key={l} className="text-center">{l}</div>)}
                    </div>
                  </div>
                  {/* Gantt rows */}
                  <div className="divide-y divide-slate-50">
                    {item.projectSteps.map((step) => {
                      const norm = normalizeStep(step, projectScale);
                      const left = ((norm.start - 1) / config.units) * 100;
                      const width = (norm.duration / config.units) * 100;
                      return (
                        <div key={step.id} className="grid grid-cols-[200px_350px_160px_1fr] gap-6 py-6 group hover:bg-slate-50/50 transition-colors">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{step.lane}</p>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{step.label}</p>
                            <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">{step.detail}</p>
                          </div>
                          <p className="text-xs font-bold text-slate-600">{step.owner}</p>
                          <div className="relative h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
                            <div className={cx("absolute inset-0 grid", config.units === 8 ? "grid-cols-8" : config.units === 4 ? "grid-cols-4" : "grid-cols-3")}>
                              {config.labels.map((l) => <div key={l} className="border-l border-slate-200/50 first:border-none" />)}
                            </div>
                            <div 
                              style={{ left: `${left}%`, width: `${Math.max(width, 10)}%` } as React.CSSProperties}
                              className={cx(
                                "absolute top-2 h-8 rounded-xl shadow-lg flex items-center px-4 text-[10px] font-black text-white uppercase tracking-widest transition-all",
                                ganttBarClasses[step.status]
                              )}
                            >
                              {step.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'historico' && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
              <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-8">Histórico completo da ação</p>
                <div className="flex flex-col gap-8">
                  {item.history.map((entry) => (
                    <div key={entry.id} className="flex gap-6">
                      <span className={cx("w-5 h-5 rounded-full shrink-0 border-4 border-white shadow-sm ring-1 ring-slate-100 mt-0.5", historyDotClasses[entry.type])} />
                      <div>
                        <p className="text-base font-bold text-slate-900 leading-tight">{entry.text}</p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{entry.actor} · {entry.when} · {entry.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <DetailList title="Dependências em aberto" items={item.dependencies} emptyLabel="Nenhuma dependência em aberto." />
                <DetailList title="Evidências-chave" items={item.evidence} emptyLabel="Sem evidências-chave." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



const KpiCard = ({ label, value, color = "text-slate-900", trend, variant }: { label: string; value: string | number; color?: string; trend?: string; variant?: 'highlight' }) => (
  <div className={cx(
    "p-5 rounded-3xl border transition-all",
    variant === 'highlight' ? "bg-slate-900 border-slate-800 shadow-xl" : "bg-white border-slate-200"
  )}>
    <p className={cx("text-[10px] font-black uppercase tracking-widest", variant === 'highlight' ? "text-slate-500" : "text-slate-400")}>{label}</p>
    <div className="mt-3 flex items-baseline gap-2">
      <span className={cx("text-2xl font-black tracking-tight", variant === 'highlight' ? "text-white" : color)}>{value}</span>
      {trend && <span className="text-[10px] font-bold text-slate-400">{trend}</span>}
    </div>
  </div>
);

export const Actions: React.FC = () => {
  const { openAccount, sessionActions, updateAction, createAction } = useAccountDetail();
  
  // O sessionActions agora contém tanto as iniciais (hidratadas) quanto as da sessão
  const allItems = sessionActions;

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [ownerFilter, setOwnerFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("Lista");
  const [overlayItemId, setOverlayItemId] = useState<string | null>(null);
  const [overlayTab, setOverlayTab] = useState<ModalTab>("resumo");
  const [projectScale, setProjectScale] = useState<ProjectScale>("semana");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAllList, setShowAllList] = useState(false);
  const [kanbanDensity, setKanbanDensity] = useState<CardDensity>('media');
  const [listDensity, setListDensity] = useState<CardDensity>('media');
  const [showNewAction, setShowNewAction] = useState(false);
  const [newActionForm, setNewActionForm] = useState({ account: '', title: '', owner: '', priority: 'Alta' as Priority });

  // Estados Recorte 20
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activatingTemplate, setActivatingTemplate] = useState<PlaybookTemplate | null>(null);

  const handleActivatePlaybook = (templateId: string, accountIds: string[]) => {
    const template = playbookTemplates.find(t => t.id === templateId);
    if (!template) return;

    accountIds.forEach(accountId => {
      const account = contasMock.find(c => c.id === accountId);
      template.actions.forEach(act => {
        createAction({
          ...act,
          accountName: account?.nome || "Conta desconhecida",
          accountContext: "Playbook: " + template.name,
          origin: "Playbook: " + template.name,
          ownerName: account?.ownerPrincipal || null,
        });
      });
    });

    setActivatingTemplate(null);
  };

  const metrics = useMemo(() => {
    const total = allItems.length;
    const critical = allItems.filter(item => item.priority === "Crítica" && item.status !== "Concluída").length;
    const inProgress = allItems.filter(item => item.status === "Em andamento").length;
    const concluida = allItems.filter(item => item.status === "Concluída").length;
    const delayed = allItems.filter(item => item.slaStatus === "vencido" || item.slaStatus === "alerta").length;
    const noOwner = allItems.filter(item => item.ownerName === null).length;
    const conversionRate = total > 0 ? (concluida / total) * 100 : 0;
    
    const now = new Date();
    // Aging: mais de 48h (estimado pelos mocks)
    const aged = allItems.filter(a => {
      if (a.status === 'Concluída') return false;
      const created = new Date(a.createdAt || "2026-04-03T09:00:00Z");
      return (now.getTime() - created.getTime()) > (48 * 60 * 60 * 1000);
    }).length;

    return { total, critical, inProgress, delayed, noOwner, conversionRate, aged, concluida };
  }, [allItems]);

  const ownerOptions = useMemo(() => {
    const uniqueOwners = Array.from(new Set(allItems.map((item) => item.ownerName ?? "Sem owner")));
    return ["Todos", ...uniqueOwners];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return sortByPriorityAndSla(
      allItems.filter((item) => {
        const matchesQuery =
          lowerQuery.length === 0 ||
          [item.title, item.description, item.accountName, item.origin, item.relatedSignal, item.category, item.channel]
            .join(" ")
            .toLowerCase()
            .includes(lowerQuery);
        const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
        const matchesChannel = channelFilter === "Todos" || item.channel === channelFilter;
        const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;
        const matchesOwner = ownerFilter === "Todos" || (ownerFilter === "Sem owner" ? item.ownerName === null : item.ownerName === ownerFilter);
        return matchesQuery && matchesPriority && matchesChannel && matchesStatus && matchesOwner;
      })
    );
  }, [allItems, query, priorityFilter, channelFilter, statusFilter, ownerFilter]);

  useEffect(() => {
    setShowAllList(false);
  }, [query, priorityFilter, channelFilter, statusFilter, ownerFilter]);

  const visibleListItems = showAllList ? filteredItems : filteredItems.slice(0, 5);
  const selectedItem = allItems.find((item) => item.id === overlayItemId) ?? null;

  const itemsByStatus = useMemo(
    () => statusOptions.map((status) => ({ status, items: filteredItems.filter((item) => item.status === status) })),
    [filteredItems]
  );

  function handleAssignOwner(id: string) {
    const target = allItems.find((item) => item.id === id);
    if (!target) return;
    updateAction(id, { ownerName: target.suggestedOwner });
  }

  function handleChangeStatus(id: string, nextStatus: ActionStatus) {
    const target = allItems.find((item) => item.id === id);
    if (!target || target.status === nextStatus) return;
    updateAction(id, { status: nextStatus });
  }

  function handleEscalate(id: string) {
    updateAction(id, { priority: "Crítica", slaStatus: "alerta", status: "Bloqueada" });
  }

  function openOverlay(item: ActionItem, tab: ModalTab = "resumo") {
    setOverlayItemId(item.id);
    setOverlayTab(tab);
  }

  function handleButtonAction(item: ActionItem, action: ActionItem["buttons"][number]["action"]) {
    if (action === "open") {
      openOverlay(item, "resumo");
      return;
    }
    if (action === "project") {
      openOverlay(item, "projeto");
      return;
    }
    if (action === "assign") {
      handleAssignOwner(item.id);
      return;
    }
    if (action === "start") {
      handleChangeStatus(item.id, "Em andamento");
      openOverlay(item, "resumo");
      return;
    }
    if (action === "complete") {
      handleChangeStatus(item.id, "Concluída");
      openOverlay(item, "historico");
      return;
    }
    if (action === "escalate") {
      handleEscalate(item.id);
      openOverlay(item, "historico");
    }
  }

  function handleDropCard(nextStatus: ActionStatus) {
    if (!draggedId) return;
    handleChangeStatus(draggedId, nextStatus);
    setDraggedId(null);
  }

  function handleExport() {
    const cols = ['Conta', 'Título', 'Prioridade', 'Status', 'Canal', 'Owner', 'SLA', 'Origem'];
    const rows = filteredItems.map((item) => [
      item.accountName,
      item.title,
      item.priority,
      item.status,
      item.channel,
      item.ownerName ?? 'Não atribuído',
      item.slaText,
      item.origin,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `canopi-acoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-5 py-8 lg:px-8 2xl:px-10 bg-[#f6f8fc]">
      <div className="mx-auto max-w-[1520px]">
        <section className="bg-gradient-to-br from-[#041135] via-[#11286e] to-[#1f3f9b] rounded-[36px] border border-[#17348f] p-8 pb-9 text-white shadow-[0_28px_80px_rgba(15,36,104,0.22)] overflow-hidden relative">
          {/* Buttons — absolute top-right */}
          <div className="absolute top-5 right-6 flex gap-2 z-[2]">
            <button
              onClick={handleExport}
              title={`Exportar ${filteredItems.length} ações como CSV`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 cursor-pointer backdrop-blur-md hover:bg-white/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button
              onClick={() => setShowNewAction(true)}
              title="Criar nova ação na fila operacional"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#17348f] cursor-pointer shadow-lg hover:bg-slate-50 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Nova ação
            </button>
          </div>

          <div className="max-w-[680px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/5">Revenue Ops</span>
                <span className="bg-emerald-500/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-500/10">Sinais conectados</span>
                <span className="bg-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70 border border-white/5">Projeto por ação</span>
              </div>
              <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-white/40 mt-6">Canopi · Revenue Ops · Fila de ações</p>
              <h1 className="text-5xl font-black tracking-tight leading-[1.05] mt-4">Fila operacional de ações</h1>
              <p className="mt-5 text-[15px] leading-relaxed text-white/60 font-medium">
                Orquestração de ações com contexto de conta, sinal, owner, SLA, histórico e fluxo operacional por ação. A leitura geral fica leve, e o detalhe profundo abre em overlay central quando a equipe precisa decidir e agir.
              </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            <MetricCard label="Total de ações" value={metrics.total} helper="fila operacional conectada" icon={<LayoutList className="h-5 w-5" />} />
            <MetricCard label="Críticas" value={metrics.critical} helper="exigem atenção executiva" icon={<AlertTriangle className="h-5 w-5" />} />
            <MetricCard label="Em andamento" value={metrics.inProgress} helper="sendo executadas" icon={<Clock3 className="h-5 w-5" />} />
            <MetricCard label="Em risco de SLA" value={metrics.delayed} helper="vencido ou em alerta" icon={<History className="h-5 w-5" />} />
            <MetricCard label="Conversão" value={`${metrics.conversionRate.toFixed(1)}%`} helper="taxa de conclusão" icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />} />
            <MetricCard label="Envelhecidas" value={metrics.aged} helper="+48h sem entrega" icon={<Timer className="h-5 w-5 text-slate-400" />} />
            <MetricCard label="Sem owner" value={metrics.noOwner} helper="pedem atribuição" icon={<Users className="h-5 w-5" />} />
          </div>
        </section>
        
        {/* Playbook Library Bar (Recorte 20) */}
        <div className="mt-8">
           <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center gap-3">
                 <FolderKanban className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Biblioteca de Playbooks</h3>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-all"
              >
                {isLibraryOpen ? 'Recolher Biblioteca' : 'Ver Biblioteca'}
              </button>
           </div>
           
           {isLibraryOpen && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide animate-in slide-in-from-top-4 duration-300">
                 {playbookTemplates.map(template => (
                    <PlaybookCard 
                      key={template.id} 
                      template={template} 
                      potentialCount={contasMock.filter(c => c.id === '3').length}
                      onConfigure={setActivatingTemplate}
                    />
                 ))}
                 
                 {/* Placeholder for future templates */}
                 <div className="min-w-[280px] rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                       <Plus className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Novo Template</p>
                    <p className="mt-1 text-[10px] text-slate-400">Em breve: Playbooks customizados</p>
                 </div>
              </div>
           )}
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm font-sans">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <label className="flex items-center gap-2.5 flex-1 basis-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:border-slate-300 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar conta, ação, owner..."
                className="w-full bg-transparent text-[13px] text-slate-700 outline-none border-none placeholder:text-slate-400 font-bold"
              />
            </label>

            {/* Filters row */}
            {([
              { label: 'Prioridade', value: priorityFilter, options: ['Todas', 'Crítica', 'Alta', 'Média', 'Baixa'], set: setPriorityFilter },
              { label: 'Canal', value: channelFilter, options: ['Todos', ...Array.from(new Set(allItems.map((i) => i.channel)))], set: setChannelFilter },
              { label: 'Status', value: statusFilter, options: ['Todos', ...statusOptions], set: setStatusFilter },
              { label: 'Owner', value: ownerFilter, options: ownerOptions, set: setOwnerFilter },
            ] as const).map((f) => (
              <div key={f.label} className="relative shrink-0">
                <select
                  value={f.value}
                  onChange={(e) => (f.set as (v: string) => void)(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 py-2 text-xs font-bold text-slate-600 cursor-pointer outline-none shadow-sm hover:border-slate-300"
                  aria-label={f.label}
                >
                  {f.options.map((o) => <option key={o as string} value={o as string}>{o as string}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ))}

            <div className="flex-1" />

            {/* Density (for list view, discrete) */}
            {viewMode === 'Lista' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Densidade</span>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                  {(['super-compacta', 'compacta', 'media', 'expandida'] as CardDensity[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setListDensity(d)}
                      title={{ 'super-compacta': 'Só título, owner e tags', compacta: 'Visão resumida', media: 'Visão padrão', expandida: 'Visão completa' }[d]}
                      aria-label={`Mudar densidade da lista para ${d}`}
                      className={cx(
                        "rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-all border-none",
                        listDensity === d ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-400"
                      )}
                    >
                      {{ 'super-compacta': 'S', compacta: 'C', media: 'M', expandida: 'E' }[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View toggle */}
            <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 gap-1 shrink-0">
              {([
                { id: 'Lista', label: 'Lista', Icon: LayoutList },
                { id: 'Kanban', label: 'Kanban', Icon: FolderKanban },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id as ViewMode)}
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold cursor-pointer transition-all border-none",
                    viewMode === id ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-500"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'Lista' ? (
          <div className={cx("mt-5 flex flex-col", listDensity === 'super-compacta' ? "gap-1.5" : "gap-3.5")}>
            {visibleListItems.map((item) => (
              <ActionListCard key={item.id} item={item} density={listDensity} onTitleClick={(selected) => openOverlay(selected, 'resumo')} onButtonAction={handleButtonAction} />
            ))}
            {filteredItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
                Nenhuma ação encontrada com os filtros aplicados.
              </div>
            ) : null}
            {filteredItems.length > 5 ? (
              <div className="flex justify-center pt-1">
                <button type="button" onClick={() => setShowAllList((current) => !current)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                  {showAllList ? "Mostrar apenas as 5 primeiras ações" : `Mostrar mais ${filteredItems.length - 5} ações da fila`}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3.5">
            {/* Density toggle for Kanban — right aligned, compact */}
            <div className="flex justify-end items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Densidade</span>
              <div className="flex rounded-[10px] border border-slate-200 bg-slate-50 p-0.75 gap-0.5">
                {(['super-compacta', 'compacta', 'media', 'expandida'] as CardDensity[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setKanbanDensity(d)}
                    title={{ 'super-compacta': 'Só título, owner e tags', compacta: 'Visão resumida', media: 'Visão padrão', expandida: 'Visão completa' }[d]}
                    aria-label={`Mudar densidade do kanban para ${d}`}
                    className={cx(
                      "rounded-[7px] p-[4px_9px] text-[11px] font-semibold cursor-pointer border-none transition-all",
                      kanbanDensity === d ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-400"
                    )}
                  >
                    {{ 'super-compacta': 'S', compacta: 'C', media: 'M', expandida: 'E' }[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-5">
              <div className="grid grid-cols-5 gap-4">
                {itemsByStatus.map(({ status, items: laneItems }, index) => (
                  <div
                    key={status}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropCard(status)}
                    className="min-w-0 py-2"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[20px] font-black leading-tight tracking-tight text-slate-950">{status}</p>
                        <p className="mt-1 text-xs text-slate-500">{laneItems.length} ação(ões)</p>
                      </div>
                      <span className={cx("rounded-full px-3 py-1 text-[11px] font-bold", statusClasses[status])}>{status}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {laneItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                          Nenhuma ação neste estágio
                        </div>
                      ) : null}
                      {laneItems.map((item) => (
                        <KanbanCard
                          key={item.id}
                          item={item}
                          density={kanbanDensity}
                          onTitleClick={(selected) => openOverlay(selected, "resumo")}
                          onButtonAction={handleButtonAction}
                          onDragStart={setDraggedId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ActionOverlay
        item={selectedItem}
        tab={overlayTab}
        setTab={setOverlayTab}
        projectScale={projectScale}
        setProjectScale={setProjectScale}
        onClose={() => setOverlayItemId(null)}
        onAssignOwner={handleAssignOwner}
        onChangeStatus={handleChangeStatus}
        onEscalate={handleEscalate}
      />

      {/* ─── Modal Nova Ação ─────────────────────────────────────────── */}
      {showNewAction && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-[520px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowNewAction(false)} 
              className="absolute top-5 right-5 w-9 h-9 rounded-xl border border-slate-200 bg-white cursor-pointer flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Nova ação</p>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">Criar ação na fila</h2>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed font-medium">Preencha os campos abaixo para adicionar uma nova ação à fila operacional.</p>

            <div className="mt-7 flex flex-col gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Conta *</label>
                <input
                  value={newActionForm.account}
                  onChange={(e) => setNewActionForm((f) => ({ ...f, account: e.target.value }))}
                  placeholder="Ex: Carteira Seguros Enterprise"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Título da ação *</label>
                <input
                  value={newActionForm.title}
                  onChange={(e) => setNewActionForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Reativar contato com decisor"
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Owner</label>
                  <input
                    value={newActionForm.owner}
                    onChange={(e) => setNewActionForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="Responsável"
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Prioridade</label>
                  <div className="relative">
                    <select
                      value={newActionForm.priority}
                      onChange={(e) => setNewActionForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                      className="w-full appearance-none rounded-2xl border border-slate-200 p-4 pr-10 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                      aria-label="Selecionar prioridade"
                    >
                      <option>Alta</option>
                      <option>Crítica</option>
                      <option>Média</option>
                      <option>Baixa</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowNewAction(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all active:scale-95 border-none"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!newActionForm.account.trim() || !newActionForm.title.trim()) return;
                  createAction({
                    accountName: newActionForm.account,
                    title: newActionForm.title,
                    priority: newActionForm.priority as Priority,
                    ownerName: newActionForm.owner || null,
                  });
                  setShowNewAction(false);
                  setNewActionForm({ account: '', title: '', owner: '', priority: 'Alta' });
                }}
                className="flex-[2] rounded-2xl bg-blue-600 p-4 text-sm font-bold text-white border-none cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-95"
              >
                Criar ação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playbook Activation Overlay (Recorte 20) */}
      <PlaybookActivationOverlay
        template={activatingTemplate}
        onClose={() => setActivatingTemplate(null)}
        onConfirm={handleActivatePlaybook}
      />
    </div>
  );
};

export default Actions;
