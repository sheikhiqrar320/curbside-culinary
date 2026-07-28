import { useState } from "react";
import { Check, X, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/brand";
import type { AdminRestaurant } from "@/lib/admin-schemas";

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
};

export function ApprovalsPanel({
  restaurants,
  onDecide,
  onFeature,
  busy,
}: {
  restaurants: AdminRestaurant[];
  onDecide: (id: string, status: "approved" | "rejected", reason?: string) => void;
  onFeature: (id: string, featured: boolean) => void;
  busy: boolean;
}) {
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const pending = restaurants.filter((r) => r.status === "pending");
  const rest = restaurants.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-bold">
          Awaiting review <span className="text-muted-foreground">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing in the queue. New restaurant applications land here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.cuisines.join(" · ")}</p>
                    <p className="mt-1 max-w-prose text-sm text-muted-foreground">{r.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.delivery_min}–{r.delivery_max} min · {formatMoney(r.cost_for_two)} for two ·{" "}
                      {r.pure_veg ? "Pure veg" : "Veg & non-veg"}
                    </p>
                  </div>
                  <Badge className={statusTone[r.status]}>Pending</Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" disabled={busy} onClick={() => onDecide(r.id, "approved")}>
                    <Check className="size-4" /> Approve
                  </Button>
                  <Input
                    placeholder="Reason (for rejection)"
                    value={reasons[r.id] ?? ""}
                    maxLength={300}
                    onChange={(e) => setReasons((s) => ({ ...s, [r.id]: e.target.value }))}
                    className="h-9 w-full max-w-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onDecide(r.id, "rejected", reasons[r.id])}
                  >
                    <X className="size-4" /> Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">All restaurants</h2>
        <ul className="mt-4 space-y-2">
          {rest.map((r) => (
            <li key={r.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {r.name}{" "}
                  {r.featured && <span className="text-xs font-normal text-primary">· Featured</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {r.cuisines.join(" · ")} · ★ {r.rating}
                </p>
                {r.status === "rejected" && r.rejection_reason && (
                  <p className="text-xs text-destructive">Reason: {r.rejection_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusTone[r.status]}>{r.status}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => onFeature(r.id, !r.featured)}
                  title={r.featured ? "Remove from featured" : "Feature on home page"}
                >
                  {r.featured ? <StarOff className="size-4" /> : <Star className="size-4" />}
                </Button>
                {r.status !== "approved" ? (
                  <Button size="sm" disabled={busy} onClick={() => onDecide(r.id, "approved")}>
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onDecide(r.id, "rejected", "Suspended by admin")}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}