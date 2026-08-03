import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { formatMoney } from "@/lib/brand";
import {
  ORDER_STATUS_LABEL,
  type AdminOrder,
  type AdminRestaurant,
  type OrderStatusValue,
} from "@/lib/admin-schemas";

const TILES: { key: "active" | OrderStatusValue; label: string; klass: string }[] = [
  { key: "active", label: "Active orders", klass: "bg-primary/10 text-primary" },
  { key: "received", label: "Awaiting approval", klass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { key: "preparing", label: "Preparing", klass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { key: "out_for_delivery", label: "Out for delivery", klass: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  { key: "delivered", label: "Completed", klass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { key: "cancelled", label: "Cancelled", klass: "bg-destructive/15 text-destructive" },
];

export function LiveBoard({
  orders,
  restaurants,
  connected,
  onStatus,
  busy,
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
  connected: boolean;
  onStatus: (id: string, status: OrderStatusValue) => void;
  busy: boolean;
}) {
  const count = (key: "active" | OrderStatusValue) =>
    key === "active"
      ? orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length
      : orders.filter((o) => o.status === key).length;

  const nameOf = (id: string | null) => restaurants.find((r) => r.id === id)?.name ?? "—";
  const feed = orders.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={`inline-block size-2 rounded-full ${connected ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"}`}
        />
        {connected ? "Live — updating automatically" : "Connecting to live updates…"}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((t) => (
          <div key={t.key} className="card-surface p-4">
            <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">{count(t.key)}</p>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.klass}`}>
              live
            </span>
          </div>
        ))}
      </div>

      <div className="card-surface p-4 sm:p-6">
        <h2 className="font-display text-lg font-bold">Live order feed</h2>
        <ul className="mt-4 space-y-2">
          {feed.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {o.code}{" "}
                  <Badge variant="secondary">
                    {o.status === "received" ? "Awaiting approval" : ORDER_STATUS_LABEL[o.status]}
                  </Badge>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.customer_name} · {nameOf(o.restaurant_id)} · {o.payment_method.toUpperCase()} ·{" "}
                  {new Date(o.placed_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatMoney(o.total)}</span>
                {o.status === "received" && (
                  <>
                    <Button size="sm" disabled={busy} onClick={() => onStatus(o.id, "accepted")}>
                      <Check className="size-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      className="text-destructive"
                      onClick={() => onStatus(o.id, "cancelled")}
                    >
                      <X className="size-4" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
          {feed.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No orders yet — new ones appear here instantly.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}