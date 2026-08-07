import { useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, STAFF_ROLES, type Customer, type StaffRole } from "@/lib/people-schemas";

export function StaffPanel({
  people,
  busy,
  onRole,
  onCreate,
}: {
  people: Customer[];
  busy: boolean;
  onRole: (userId: string, role: StaffRole, enabled: boolean) => void;
  onCreate: (input: { email: string; password: string; full_name: string; role: StaffRole }) => void;
}) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "staff" as StaffRole });

  const staff = people.filter((p) => p.roles.some((r) => r !== "customer"));
  const term = q.trim().toLowerCase();
  const searchable = people.filter(
    (p) =>
      term.length > 0 &&
      ((p.full_name ?? "").toLowerCase().includes(term) || (p.email ?? "").toLowerCase().includes(term)),
  );
  const shown = term ? searchable : staff;

  return (
    <div className="space-y-6">
      <section className="card-surface p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <UserPlus className="size-4 text-primary" /> Create a team account
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The account is confirmed instantly and can sign in at once with the role you pick.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Full name"
            value={form.full_name}
            maxLength={120}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            maxLength={160}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password (8+ characters)"
            value={form.password}
            maxLength={72}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as StaffRole })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="mt-4"
          disabled={busy || !form.email || form.password.length < 8}
          onClick={() => {
            onCreate(form);
            setForm({ email: "", password: "", full_name: "", role: "staff" });
          }}
        >
          Create account
        </Button>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <ShieldCheck className="size-4 text-primary" /> Roles & permissions
          </h3>
          <Input
            className="w-full max-w-xs"
            placeholder="Search any account to grant a role"
            value={q}
            maxLength={80}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <ul className="mt-4 space-y-2">
          {shown.map((p) => (
            <li key={p.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {p.full_name || "Unnamed"}
                  {p.suspended && <Badge className="bg-destructive/15 text-destructive">Suspended</Badge>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{p.email}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {STAFF_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={p.roles.includes(role)}
                      disabled={busy}
                      onCheckedChange={(v) => onRole(p.id, role, v)}
                    />
                    {ROLE_LABEL[role]}
                  </label>
                ))}
              </div>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {term ? "No account matches that search." : "No team accounts yet — create one above."}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}