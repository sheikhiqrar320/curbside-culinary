import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/brand";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  type AdminOrder,
  type AdminRestaurant,
  type OrderStatusValue,
} from "@/lib/admin-schemas";

const tone: Record<OrderStatusValue, string> = {
  received: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
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
  onNotes,
  busy,
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
  onStatus: (id: string, status: OrderStatusValue) => void;
  onNotes: (id: string, notes: string) => void;
  busy: boolean;
}) {
  const [filter, setFilter] = useState<"all" | OrderStatusValue>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const nameOf = (id: string | null) => restaurants.find((r) => r.id === id)?.name ?? "—";
  const pending = orders.filter((o) => o.status === "received").length;

  const list = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (q.trim() === "" ||
        o.code.toLowerCase().includes(q.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(q.toLowerCase()) ||
        o.phone.includes(q.trim())),
  );

  return (
    <div className="space-y-4">
      {pending > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <span className="font-semibold">{pending}</span> order{pending > 1 ? "s" : ""} awaiting your
          approval — customers only get confirmed once you approve.
        </div>
      )}
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
                  {o.code}{" "}
                  <Badge className={tone[o.status]}>
                    {o.status === "received" ? "Awaiting approval" : ORDER_STATUS_LABEL[o.status]}
                  </Badge>
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
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setOpen(open === o.id ? null : o.id);
                    setNoteDraft(o.admin_notes ?? "");
                  }}
                >
                  <ChevronDown className="size-4" /> Details
                </Button>
              </div>
            </div>

            {open === o.id && (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <dl className="space-y-1">
                  <Row label="Order ID" value={o.code} />
                  <Row label="Placed" value={new Date(o.placed_at).toLocaleString()} />
                  <Row label="Customer" value={o.customer_name} />
                  <Row label="Phone" value={o.phone} />
                  <Row label="Email" value={o.email ?? "—"} />
                  <Row label="Address" value={o.address} />
                  <Row label="Landmark" value={o.landmark ?? "—"} />
                  <Row label="Pincode" value={o.pincode ?? "—"} />
                  <Row label="Payment" value={o.payment_method.toUpperCase()} />
                  <Row label="Status" value={ORDER_STATUS_LABEL[o.status]} />
                </dl>
                <div>
                  <p className="font-semibold">Items</p>
                  <ul className="mt-1 space-y-1">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between gap-3 text-muted-foreground">
                        <span className="min-w-0 truncate">
                          {i.qty} × {i.name}
                        </span>
                        <span>{formatMoney(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 space-y-1 border-t border-border pt-2 text-muted-foreground">
                    <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(o.subtotal)}</span></p>
                    {o.discount > 0 && (
                      <p className="flex justify-between"><span>Discount</span><span>− {formatMoney(o.discount)}</span></p>
                    )}
                    <p className="flex justify-between"><span>Delivery</span><span>{formatMoney(o.delivery_fee)}</span></p>
                    <p className="flex justify-between"><span>Taxes</span><span>{formatMoney(o.tax)}</span></p>
                    <p className="flex justify-between font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatMoney(o.total)}</span>
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-semibold" htmlFor={`note-${o.id}`}>
                      Delivery note
                    </label>
                    <Textarea
                      id={`note-${o.id}`}
                      rows={2}
                      maxLength={500}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Ring the bell twice, call on arrival…"
                    />
                    <Button size="sm" disabled={busy} onClick={() => onNotes(o.id, noteDraft.trim())}>
                      Save note
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{value}</dd>
    </div>
  );
}