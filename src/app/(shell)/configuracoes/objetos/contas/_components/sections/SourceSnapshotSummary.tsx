'use client';

type SourceSnapshotSummaryProps = {
  sourceName: string;
  entryLabel: string;
  statusLabel: string;
  lastSavedNote?: string | null;
  lastValidatedNote?: string | null;
  stepCompletedNote?: string | null;
};

export function SourceSnapshotSummary({
  sourceName,
  entryLabel,
  statusLabel,
  lastSavedNote,
  lastValidatedNote,
  stepCompletedNote,
}: SourceSnapshotSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
          Fonte: {sourceName}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
          Entrada: {entryLabel}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
          Status: {statusLabel}
        </span>
      </div>

      <div className="space-y-1 text-xs font-bold text-slate-500">
        {lastSavedNote && <p>{lastSavedNote}</p>}
        {lastValidatedNote && <p>{lastValidatedNote}</p>}
        {stepCompletedNote && <p>{stepCompletedNote}</p>}
      </div>
    </div>
  );
}
