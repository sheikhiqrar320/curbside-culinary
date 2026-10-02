import { Minus, Plus, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatMoney } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import type { Dish } from "@/lib/catalog";
import { VegBadge } from "./veg-badge";

export function DishCard({ dish }: { dish: Dish }) {
  const navigate = useNavigate();
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.dish.id === dish.id)?.qty ?? 0;
  const soldOut = dish.available === false;
  const extra = dish as Dish & { mrp?: number; discount?: number; stock?: number };
  const discount = extra.discount ?? 0;

  const buyNow = () => {
    if (qty === 0) add(dish);
    navigate({ to: "/checkout" });
  };

  return (
    <article className="card-surface group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {discount}% OFF
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 font-display text-lg font-bold">
            Sold out
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <VegBadge veg={dish.veg} />
          {dish.recommended && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Bestseller</span>
          )}
        </div>
        <h3 className="mt-2 font-display text-xl font-bold">{dish.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
        {typeof extra.stock === "number" && !soldOut && extra.stock <= 10 && (
          <p className="mt-2 text-xs font-semibold text-destructive">Only {extra.stock} left</p>
        )}

        <div className="mt-4 flex items-end gap-2">
          <span className="font-display text-2xl font-extrabold text-primary">{formatMoney(dish.price)}</span>
          {discount > 0 && extra.mrp && extra.mrp > dish.price && (
            <span className="pb-1 text-sm text-muted-foreground line-through">{formatMoney(extra.mrp)}</span>
          )}
        </div>

        {!soldOut && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={buyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Zap className="size-4 fill-current" /> Buy now
            </button>
            {qty === 0 ? (
              <button
                type="button"
                aria-label="Add to cart"
                onClick={() => {
                  add(dish);
                  toast.success(`${dish.name} added to cart`);
                }}
                className="grid place-items-center rounded-xl border-2 border-primary px-4 text-primary hover:bg-primary/10"
              >
                <Plus className="size-5" />
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border-2 border-primary px-3 text-primary">
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
        )}
      </div>
    </article>
  );
}
