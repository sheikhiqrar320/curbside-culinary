import { useState } from "react";
import { Check, X, ChevronDown, Download, Printer, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
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
import { downloadCsv, toCsv } from "@/lib/csv";
import { printInvoice } from "@/lib/invoice";
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
  storeName = "Slider",
  supportPhone = "",
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
  onStatus: (id: string, status: OrderStatusValue) => void;
  onNotes: (id: string, notes: string) => void;
  busy: boolean;
  storeName?: string;
  supportPhone?: string;
}) {
  const [filter, setFilter] = useState<"all" | OrderStatusValue>("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const nameOf = (id: string | null) => restaurants.find((r) => r.id === id)?.name ?? "—";
  const pending = orders.filter((o) => o.status === "received").length;

  const term = q.trim().toLowerCase();
  const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
  const toTs = to ? new Date(`${to}T23:59:59.999`).getTime() : null;

  const list = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    const placed = new Date(o.placed_at).getTime();
    if (fromTs !== null && placed < fromTs) return false;
    if (toTs !== null && placed > toTs) return false;
    if (!term) return true;
    return (
      o.code.toLowerCase().includes(term) ||
      o.customer_name.toLowerCase().includes(term) ||
      o.phone.includes(q.trim()) ||
      (o.email ?? "").toLowerCase().includes(term) ||
      o.address.toLowerCase().includes(term) ||
      (o.pincode ?? "").includes(q.trim()) ||
      o.items.some((i) => i.name.toLowerCase().includes(term))
    );
  });

  function exportCsv() {
    if (list.length === 0) {
      toast.error("Nothing to export with these filters");
      return;
    }
    downloadCsv(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(list, [
        { key: "code", label: "Order ID", value: (o) => o.code },
        { key: "placed", label: "Placed at", value: (o) => new Date(o.placed_at).toLocaleString() },
        { key: "status", label: "Status", value: (o) => ORDER_STATUS_LABEL[o.status] },
        { key: "customer", label: "Customer", value: (o) => o.customer_name },
        { key: "phone", label: "Phone", value: (o) => o.phone },
        { key: "email", label: "Email", value: (o) => o.email ?? "" },
        { key: "address", label: "Address", value: (o) => o.address },
        { key: "landmark", label: "Landmark", value: (o) => o.landmark ?? "" },
        { key: "pincode", label: "Pincode", value: (o) => o.pincode ?? "" },
        { key: "restaurant", label: "Kitchen", value: (o) => nameOf(o.restaurant_id) },
        { key: "items", label: "Items", value: (o) => o.items.map((i) => `${i.qty}x ${i.name}`).join(" | ") },
        { key: "subtotal", label: "Subtotal", value: (o) => o.subtotal },
        { key: "discount", label: "Discount", value: (o) => o.discount },
        { key: "delivery", label: "Delivery fee", value: (o) => o.delivery_fee },
        { key: "tax", label: "Tax", value: (o) => o.tax },
        { key: "total", label: "Total", value: (o) => o.total },
        { key: "payment", label: "Payment", value: (o) => o.payment_method.toUpperCase() },
        { key: "notes", label: "Notes", value: (o) => o.admin_notes ?? "" },
      ]),
    );
    toast.success(`Exported ${list.length} order${list.length === 1 ? "" : "s"}`);
  }

  return (
    <div className="space-y-4">
      {pending > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <span className="font-semibold">{pending}</span> order{pending > 1 ? "s" : ""} awaiting your
          approval — customers only get confirmed once you approve.
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Search id, customer, phone, email, address or item"
          value={q}
          maxLength={80}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-sm"
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
        <label className="text-xs font-semibold text-muted-foreground">
          From
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-40" />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          To
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-40" />
        </label>
        {(from || to || term || filter !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              setFrom("");
              setTo("");
              setQ("");
              setFilter("all");
            }}
          >
            Clear
          </Button>
        )}
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV ({list.length})
        </Button>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!printInvoice(o, storeName, supportPhone))
                      toast.error("Allow pop-ups to print the invoice");
                  }}
                >
                  <Printer className="size-4" /> Invoice
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${o.phone}`}>
                        <Phone className="size-4" /> Call customer
                      </a>
                    </Button>
                    {o.email && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`mailto:${o.email}?subject=Your order ${o.code}`}>
                          <Mail className="size-4" /> Email customer
                        </a>
                      </Button>
                    )}
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