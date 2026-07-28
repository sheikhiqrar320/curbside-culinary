import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/brand";
import type { AdminDish, AdminRestaurant, DishInput } from "@/lib/admin-schemas";

type Draft = {
  id?: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: string;
  veg: boolean;
  category: string;
  recommended: boolean;
  available: boolean;
};

const emptyDraft = (restaurantId: string): Draft => ({
  restaurant_id: restaurantId,
  name: "",
  description: "",
  price: "",
  veg: false,
  category: "Mains",
  recommended: false,
  available: true,
});

export function MenuPanel({
  restaurants,
  dishes,
  onSave,
  onToggle,
  onDelete,
  busy,
}: {
  restaurants: AdminRestaurant[];
  dishes: AdminDish[];
  onSave: (input: DishInput) => void;
  onToggle: (id: string, available: boolean) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "");
  const [draft, setDraft] = useState<Draft | null>(null);

  const list = dishes.filter((d) => d.restaurant_id === restaurantId);
  const current = draft ?? null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;
    const price = Number(current.price);
    if (!current.name.trim() || !Number.isFinite(price) || price < 0) return;
    onSave({
      id: current.id,
      restaurant_id: current.restaurant_id,
      name: current.name.trim(),
      description: current.description.trim(),
      price: Math.round(price),
      veg: current.veg,
      category: current.category.trim() || "Mains",
      recommended: current.recommended,
      available: current.available,
    });
    setDraft(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={restaurantId}
          onValueChange={(v) => {
            setRestaurantId(v);
            setDraft(null);
          }}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Choose a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDraft(emptyDraft(restaurantId))} disabled={!restaurantId || busy}>
          <Plus className="size-4" /> Add dish
        </Button>
      </div>

      {current && (
        <form onSubmit={submit} className="card-surface grid gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="d-name">Name</Label>
            <Input
              id="d-name"
              value={current.name}
              maxLength={120}
              onChange={(e) => setDraft({ ...current, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-price">Price (₹)</Label>
            <Input
              id="d-price"
              type="number"
              min={0}
              max={100000}
              value={current.price}
              onChange={(e) => setDraft({ ...current, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="d-desc">Description</Label>
            <Textarea
              id="d-desc"
              value={current.description}
              maxLength={400}
              onChange={(e) => setDraft({ ...current, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-cat">Category</Label>
            <Input
              id="d-cat"
              value={current.category}
              maxLength={60}
              onChange={(e) => setDraft({ ...current, category: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={current.veg}
                onCheckedChange={(v) => setDraft({ ...current, veg: v })}
              />
              Veg
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={current.recommended}
                onCheckedChange={(v) => setDraft({ ...current, recommended: v })}
              />
              Recommended
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={current.available}
                onCheckedChange={(v) => setDraft({ ...current, available: v })}
              />
              Available
            </label>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {current.id ? "Save changes" : "Add dish"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {list.map((d) => (
          <li key={d.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-semibold">
                {d.name}{" "}
                <span className="text-xs font-normal text-muted-foreground">· {d.category}</span>
              </p>
              <p className="truncate text-sm text-muted-foreground">{d.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatMoney(d.price)}</span>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={d.available}
                  disabled={busy}
                  onCheckedChange={(v) => onToggle(d.id, v)}
                />
                {d.available ? "In stock" : "Sold out"}
              </label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setDraft({
                    id: d.id,
                    restaurant_id: d.restaurant_id,
                    name: d.name,
                    description: d.description,
                    price: String(d.price),
                    veg: d.veg,
                    category: d.category,
                    recommended: d.recommended,
                    available: d.available,
                  })
                }
              >
                <Pencil className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDelete(d.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No dishes yet for this restaurant.
          </li>
        )}
      </ul>
    </div>
  );
}