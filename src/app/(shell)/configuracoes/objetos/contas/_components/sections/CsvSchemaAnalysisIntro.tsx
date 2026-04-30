'use client';

type CsvSchemaAnalysisIntroProps = {
  pills: string[];
  sectionLabel: string;
  title: string;
  description: string;
};

export function CsvSchemaAnalysisIntro({
  pills,
  sectionLabel,
  title,
  description,
}: CsvSchemaAnalysisIntroProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span key={pill} className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">
            {pill}
          </span>
        ))}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-600">{sectionLabel}</p>
      <h4 className="text-xl font-black tracking-tight text-slate-900">{title}</h4>
      <p className="max-w-3xl text-sm font-medium text-slate-600">{description}</p>
    </div>
  );
}
