import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="card-surface group relative overflow-hidden p-5 transition-shadow hover:shadow-lg">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl transition-opacity ${
          accent ? "bg-primary/25" : "bg-primary/10"
        } opacity-70 group-hover:opacity-100`}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="relative mt-3 font-display text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}