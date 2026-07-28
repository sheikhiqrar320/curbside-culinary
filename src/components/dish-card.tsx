import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import type { Dish } from "@/lib/catalog";
import { VegBadge } from "./veg-badge";

export function DishCard({ dish }: { dish: Dish }) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.dish.id === dish.id)?.qty ?? 0;
  const soldOut = dish.available === false;

  return (
    <article className="card-surface flex gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <VegBadge veg={dish.veg} />
          {dish.recommended && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
              Recommended
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-display text-base font-semibold">{dish.name}</h3>
        <p className="mt-1 font-semibold text-primary">{formatMoney(dish.price)}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
      </div>

      <div className="flex w-28 shrink-0 flex-col items-center gap-2">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          width={200}
          height={200}
          className="size-24 rounded-xl object-cover"
        />
        {soldOut ? (
          <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Sold out
          </span>
        ) : qty === 0 ? (
          <button
            type="button"
            onClick={() => {
              add(dish);
              toast.success(`${dish.name} added to cart`);
            }}
            className="-mt-4 rounded-lg border-2 border-primary bg-card px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Add
          </button>
        ) : (
          <div className="-mt-4 flex items-center gap-3 rounded-lg border-2 border-primary bg-card px-2 py-1.5 text-primary">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty(dish.id, qty - 1)}>
              <Minus className="size-4" />
            </button>
            <span className="text-sm font-bold">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty(dish.id, qty + 1)}>
              <Plus className="size-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}