import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/brand";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type AdminOrder,
  type AdminRestaurant,
  type OrderStatusValue,
} from "@/lib/admin-schemas";

const tone: Record<OrderStatusValue, string> = {
  received: "bg-muted text-muted-foreground",
  accepted: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  preparing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  out_for_delivery: "bg-primary/15 text-primary",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

export function OrdersPanel({
  orders,
  restaurants,
  onStatus,
  busy,
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
  onStatus: (id: string, status: OrderStatusValue) => void;
  busy: boolean;
}) {
  const [filter, setFilter] = useState<"all" | OrderStatusValue>("all");
  const [q, setQ] = useState("");
  const nameOf = (id: string | null) => restaurants.find((r) => r.id === id)?.name ?? "—";

  const list = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (q.trim() === "" ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search order id or customer"
          value={q}
          maxLength={80}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-xs"
        />
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-2">
        {list.map((o) => (
          <li key={o.id} className="card-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {o.code} <Badge className={tone[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {o.customer_name} · {nameOf(o.restaurant_id)} · {o.payment_method.toUpperCase()}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(o.placed_at).toLocaleString()} · {o.address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatMoney(o.total)}</span>
                <Select
                  value={o.status}
                  disabled={busy}
                  onValueChange={(v) => onStatus(o.id, v as OrderStatusValue)}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No orders match this view.
          </li>
        )}
      </ul>
    </div>
  );
}