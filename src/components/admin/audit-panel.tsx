import { useState } from "react";
import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadCsv, toCsv } from "@/lib/csv";
import type { AuditLog } from "@/lib/people-schemas";

export function AuditPanel({ logs }: { logs: AuditLog[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = logs.filter(
    (l) =>
      !term ||
      l.action.toLowerCase().includes(term) ||
      l.summary.toLowerCase().includes(term) ||
      (l.actor_email ?? "").toLowerCase().includes(term),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search the activity log"
            value={q}
            maxLength={80}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            downloadCsv(
              `activity-log-${new Date().toISOString().slice(0, 10)}.csv`,
              toCsv(list, [
                { key: "when", label: "When", value: (l) => new Date(l.created_at).toISOString() },
                { key: "who", label: "Who", value: (l) => l.actor_email ?? "" },
                { key: "action", label: "Action", value: (l) => l.action },
                { key: "entity", label: "Entity", value: (l) => l.entity },
                { key: "summary", label: "Summary", value: (l) => l.summary },
              ]),
            )
          }
        >
          Export log CSV
        </Button>
        <p className="text-sm text-muted-foreground">{list.length} events</p>
      </div>

      <ol className="space-y-2">
        {list.map((l) => (
          <li key={l.id} className="card-surface flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                <History className="size-4 text-primary" />
                {l.summary || l.action}
                <Badge className="bg-muted text-muted-foreground">{l.action}</Badge>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {l.actor_email ?? "system"}
                {l.entity ? ` · ${l.entity}` : ""}
                {l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ""}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing logged yet. Admin actions appear here as they happen.
          </li>
        )}
      </ol>
    </div>
  );
}