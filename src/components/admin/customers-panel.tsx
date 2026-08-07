import { useMemo, useState } from "react";
import { Ban, KeyRound, Save, Search, Trash2, Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatMoney } from "@/lib/brand";
import { downloadCsv, toCsv } from "@/lib/csv";
import { ROLE_LABEL, type Customer } from "@/lib/people-schemas";
import type { AdminOrder } from "@/lib/admin-schemas";

export function CustomersPanel({
  customers,
  orders,
  busy,
  onUpdate,
  onSuspend,
  onDelete,
  onResetPassword,
}: {
  customers: Customer[];
  orders: AdminOrder[];
  busy: boolean;
  onUpdate: (input: {
    id: string;
    full_name?: string | null;
    phone?: string | null;
    loyalty_points?: number;
    wallet_balance?: number;
  }) => void;
  onSuspend: (id: string, suspended: boolean) => void;
  onDelete: (id: string) => void;
  onResetPassword: (email: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState({ full_name: "", phone: "", loyalty_points: 0, wallet_balance: 0 });

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; spend: number; last: string | null }>();
    for (const o of orders) {
      const key = (o.email ?? o.phone ?? "").toLowerCase();
      if (!key) continue;
      const prev = map.get(key) ?? { count: 0, spend: 0, last: null };
      map.set(key, {
        count: prev.count + 1,
        spend: prev.spend + (o.status === "cancelled" ? 0 : o.total),
        last: !prev.last || o.placed_at > prev.last ? o.placed_at : prev.last,
      });
    }
    return map;
  }, [orders]);

  const statFor = (c: Customer) =>
    stats.get((c.email ?? "").toLowerCase()) ??
    stats.get((c.phone ?? "").toLowerCase()) ?? { count: 0, spend: 0, last: null };

  const term = q.trim().toLowerCase();
  const list = customers.filter(
    (c) =>
      !term ||
      (c.full_name ?? "").toLowerCase().includes(term) ||
      (c.email ?? "").toLowerCase().includes(term) ||
      (c.phone ?? "").includes(term),
  );

  function exportCsv() {
    downloadCsv(
      `customers-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(list, [
        { key: "name", label: "Name", value: (c) => c.full_name ?? "" },
        { key: "email", label: "Email", value: (c) => c.email ?? "" },
        { key: "phone", label: "Phone", value: (c) => c.phone ?? "" },
        { key: "roles", label: "Roles", value: (c) => c.roles.join(" | ") },
        { key: "status", label: "Status", value: (c) => (c.suspended ? "Suspended" : "Active") },
        { key: "orders", label: "Orders", value: (c) => statFor(c).count },
        { key: "spend", label: "Lifetime spend", value: (c) => statFor(c).spend },
        { key: "points", label: "Loyalty points", value: (c) => c.loyalty_points },
        { key: "wallet", label: "Wallet", value: (c) => c.wallet_balance },
        { key: "joined", label: "Joined", value: (c) => new Date(c.created_at).toISOString() },
      ]),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email or phone"
            value={q}
            maxLength={80}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={exportCsv}>
          Export customers CSV
        </Button>
        <p className="text-sm text-muted-foreground">{list.length} accounts</p>
      </div>

      <ul className="space-y-2">
        {list.map((c) => {
          const s = statFor(c);
          return (
            <li key={c.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {c.full_name || "Unnamed customer"}
                    {c.suspended && <Badge className="bg-destructive/15 text-destructive">Suspended</Badge>}
                    {c.roles
                      .filter((r) => r !== "customer")
                      .map((r) => (
                        <Badge key={r} className="bg-primary/15 text-primary">
                          {ROLE_LABEL[r] ?? r}
                        </Badge>
                      ))}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.email ?? "no email"} · {c.phone ?? "no phone"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.count} order{s.count === 1 ? "" : "s"} · {formatMoney(s.spend)} lifetime ·{" "}
                    {c.loyalty_points} pts · wallet {formatMoney(c.wallet_balance)} · joined{" "}
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setOpen(open === c.id ? null : c.id);
                      setDraft({
                        full_name: c.full_name ?? "",
                        phone: c.phone ?? "",
                        loyalty_points: c.loyalty_points,
                        wallet_balance: c.wallet_balance,
                      });
                    }}
                  >
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onSuspend(c.id, !c.suspended)}
                    className={c.suspended ? "" : "text-destructive"}
                  >
                    {c.suspended ? <Undo2 className="size-4" /> : <Ban className="size-4" />}
                    {c.suspended ? "Restore" : "Suspend"}
                  </Button>
                </div>
              </div>

              {open === c.id && (
                <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input
                      value={draft.full_name}
                      maxLength={120}
                      onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={draft.phone}
                      maxLength={30}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    />
                  </Field>
                  <Field label="Loyalty points">
                    <Input
                      type="number"
                      min={0}
                      value={draft.loyalty_points}
                      onChange={(e) => setDraft({ ...draft, loyalty_points: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Wallet balance (₹)">
                    <Input
                      type="number"
                      min={0}
                      value={draft.wallet_balance}
                      onChange={(e) => setDraft({ ...draft, wallet_balance: Number(e.target.value) || 0 })}
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        onUpdate({
                          id: c.id,
                          full_name: draft.full_name.trim() || null,
                          phone: draft.phone.trim() || null,
                          loyalty_points: draft.loyalty_points,
                          wallet_balance: draft.wallet_balance,
                        })
                      }
                    >
                      <Save className="size-4" /> Save changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || !c.email}
                      onClick={() => c.email && onResetPassword(c.email)}
                    >
                      <KeyRound className="size-4" /> Reset password
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive" disabled={busy}>
                          <Trash2 className="size-4" /> Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {c.full_name || c.email} will be removed permanently. Their past orders stay in
                            your records. This can't be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep account</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Recent orders
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {orders
                        .filter(
                          (o) =>
                            (c.email && o.email?.toLowerCase() === c.email.toLowerCase()) ||
                            (c.phone && o.phone === c.phone),
                        )
                        .slice(0, 5)
                        .map((o) => (
                          <li key={o.id} className="flex justify-between gap-3">
                            <span>
                              {o.code} · {new Date(o.placed_at).toLocaleDateString()}
                            </span>
                            <span>
                              {formatMoney(o.total)} · {o.status.replace(/_/g, " ")}
                            </span>
                          </li>
                        ))}
                      {orders.filter(
                        (o) =>
                          (c.email && o.email?.toLowerCase() === c.email.toLowerCase()) ||
                          (c.phone && o.phone === c.phone),
                      ).length === 0 && <li>No orders yet.</li>}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No customers match this search.
          </li>
        )}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}