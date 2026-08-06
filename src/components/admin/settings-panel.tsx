import { useEffect, useState } from "react";
import { KeyRound, Palette, Percent, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import type { StoreSettings, StoreSettingsInput } from "@/lib/store-schemas";

type Props = {
  settings: StoreSettings;
  busy: boolean;
  onSave: (input: StoreSettingsInput) => void;
  onDiscountAll: (discount: number) => void;
  onDeleteAllDishes: () => void;
  onCredentials: (input: { email: string; password: string }) => void;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Store;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function SettingsPanel({
  settings,
  busy,
  onSave,
  onDiscountAll,
  onDeleteAllDishes,
  onCredentials,
}: Props) {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [bulkDiscount, setBulkDiscount] = useState(10);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function save() {
    const { id: _id, updated_at: _u, ...input } = form;
    onSave(input as StoreSettingsInput);
  }

  const colorValue = (v: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#ff5722");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Shop status" icon={Store}>
        <Toggle
          label={form.shop_open ? "Shop is open" : "Shop is closed"}
          hint="Closing the shop stops new orders and shows customers your message."
          checked={form.shop_open}
          onCheckedChange={(v) => set("shop_open", v)}
        />
        <Field label="Closed headline">
          <Input
            value={form.closed_title}
            maxLength={80}
            onChange={(e) => set("closed_title", e.target.value)}
          />
        </Field>
        <Field label="Why are you closed?">
          <Textarea
            rows={3}
            maxLength={400}
            value={form.closed_reason}
            placeholder="Festival break — we're back tomorrow at 11am."
            onChange={(e) => set("closed_reason", e.target.value)}
          />
        </Field>
        <Field label="Shop name">
          <Input value={form.store_name} maxLength={60} onChange={(e) => set("store_name", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} maxLength={140} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
      </Section>

      <Section title="Contact & offers" icon={Percent}>
        <Field label="Help number">
          <Input value={form.support_phone} onChange={(e) => set("support_phone", e.target.value)} />
        </Field>
        <Field label="Support email">
          <Input value={form.support_email} onChange={(e) => set("support_email", e.target.value)} />
        </Field>
        <Field label="WhatsApp number">
          <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Toggle
          label="Show special offer banner"
          checked={form.offer_active}
          onCheckedChange={(v) => set("offer_active", v)}
        />
        <Field label="Offer message">
          <Input
            value={form.offer_text}
            maxLength={200}
            placeholder="Flat 20% off on every biryani today!"
            onChange={(e) => set("offer_text", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Delivery, fees & ETA" icon={Percent}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (₹)">
            <Input
              type="number"
              min={0}
              value={form.delivery_fee}
              onChange={(e) => set("delivery_fee", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Free delivery above (₹)">
            <Input
              type="number"
              min={0}
              value={form.free_delivery_above}
              onChange={(e) => set("free_delivery_above", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Delivery time min (mins)">
            <Input
              type="number"
              min={1}
              value={form.eta_min}
              onChange={(e) => set("eta_min", Number(e.target.value) || 1)}
            />
          </Field>
          <Field label="Delivery time max (mins)">
            <Input
              type="number"
              min={1}
              value={form.eta_max}
              onChange={(e) => set("eta_max", Number(e.target.value) || 1)}
            />
          </Field>
          <Field label="Tax rate (%)">
            <Input
              type="number"
              min={0}
              max={50}
              value={Math.round(form.tax_rate * 100)}
              onChange={(e) => set("tax_rate", Math.min(Number(e.target.value) || 0, 50) / 100)}
            />
          </Field>
        </div>
        <Toggle
          label="Free delivery over a threshold"
          hint="Switch off to always charge the delivery fee."
          checked={form.free_delivery_enabled}
          onCheckedChange={(v) => set("free_delivery_enabled", v)}
        />
        <div className="rounded-xl border border-border p-3">
          <p className="text-sm font-semibold">Discount every product at once</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={90}
              value={bulkDiscount}
              onChange={(e) => setBulkDiscount(Math.min(Number(e.target.value) || 0, 90))}
              className="w-24"
            />
            <Button size="sm" disabled={busy} onClick={() => onDiscountAll(bulkDiscount)}>
              Apply {bulkDiscount}%
            </Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onDiscountAll(0)}>
              Remove all discounts
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Look & feel" icon={Palette}>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["Primary", "theme_primary"],
              ["Accent", "theme_accent"],
              ["Background", "theme_background"],
            ] as const
          ).map(([label, key]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`${label} colour`}
                  value={colorValue(form[key])}
                  onChange={(e) => set(key, e.target.value)}
                  className="size-9 cursor-pointer rounded-lg border border-border bg-transparent"
                />
                <Button size="sm" variant="ghost" onClick={() => set(key, "")}>
                  Reset
                </Button>
              </div>
            </Field>
          ))}
        </div>
        <Toggle
          label="Dark theme"
          hint="Applies across the customer app and this dashboard."
          checked={form.theme_mode === "dark"}
          onCheckedChange={(v) => set("theme_mode", v ? "dark" : "light")}
        />
      </Section>

      <Section title="Admin login" icon={KeyRound}>
        <Field label="New admin email">
          <Input
            type="email"
            value={email}
            placeholder="iqrar@slider.app"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            value={password}
            placeholder="At least 8 characters"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button
          variant="outline"
          disabled={busy || (!email && !password)}
          onClick={() => {
            onCredentials({ email, password });
            setEmail("");
            setPassword("");
          }}
        >
          Update admin login
        </Button>
      </Section>

      <Section title="Danger zone" icon={Trash2}>
        <p className="text-sm text-muted-foreground">
          Vanish the whole shop: this deletes every product permanently. Orders stay untouched.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive" disabled={busy}>
              <Trash2 className="size-4" /> Vanish the whole shop
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete every product?</AlertDialogTitle>
              <AlertDialogDescription>
                Customers will see an empty menu straight away. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my menu</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteAllDishes}>Delete everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      <div className="lg:col-span-2">
        <Button size="lg" className="w-full" disabled={busy} onClick={save}>
          Save store settings
        </Button>
      </div>
    </div>
  );
}