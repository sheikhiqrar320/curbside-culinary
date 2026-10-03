import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { coupons } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart | Slider" },
      { name: "description", content: "Review your items, adjust quantitiesbefore checkout." },
      { property: "og:title", content: "Your cart | Slider" },
      { property: "og:description", content: "Review your itemsbefore checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const [code, setCode] = useState("");

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Pick something hot — it's only a couple of taps away.</p>
        <Link
          to="/restaurants"
          className="mt-8 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display text-3xl font-bold">Your cart</h1>
        <div className="mt-6 space-y-3">
          {cart.lines.map(({ dish, qty }) => (
            <div key={dish.id} className="card-surface flex items-center gap-4 p-4">
              <img
                src={dish.image}
                alt={dish.name}
                loading="lazy"
                width={200}
                height={200}
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{dish.name}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(dish.price)} each</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-lg border border-border px-2 py-1">
                <button type="button" aria-label="Decrease quantity" onClick={() => cart.setQty(dish.id, qty - 1)}>
                  <Minus className="size-4" />
                </button>
                <span className="text-sm font-bold">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => cart.setQty(dish.id, qty + 1)}>
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="w-20 shrink-0 text-right font-semibold">{formatMoney(dish.price * qty)}</p>
              <button
                type="button"
                aria-label={`Remove ${dish.name}`}
                onClick={() => cart.remove(dish.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {coupons.length > 0 && (
        <div className="card-surface mt-6 p-5">
          <h2 className="font-display text-lg font-bold">Have a coupon?</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              aria-label="Coupon code"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm uppercase outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                const res = cart.applyCoupon(code);
                res.ok ? toast.success(res.message) : toast.error(res.message);
              }}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Apply
            </button>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {coupons.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  className="font-mono font-semibold text-primary"
                  onClick={() => setCode(c.code)}
                >
                  {c.code}
                </button>{" "}
                — {c.label}
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>

      <aside className="lg:col-span-1">
        <div className="card-surface sticky top-24 p-6">
          <h2 className="font-display text-lg font-bold">Bill details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Item total" value={formatMoney(cart.subtotal)} />
            {cart.discount > 0 && (
              <Row label={`Discount (${cart.coupon})`} value={`− ${formatMoney(cart.discount)}`} accent />
            )}
            <Row label="Delivery fee" value={cart.deliveryFee === 0 ? "Free" : formatMoney(cart.deliveryFee)} />
            <Row label="Taxes" value={formatMoney(cart.tax)} />
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-display text-lg font-bold">
            <span>To pay</span>
            <span>{formatMoney(cart.total)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
          >
            Proceed to checkout
          </Link>
          {cart.coupon && (
            <button
              type="button"
              onClick={cart.clearCoupon}
              className="mt-3 w-full text-xs text-muted-foreground underline"
            >
              Remove coupon
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "font-semibold text-veg" : "font-medium"}>{value}</dd>
    </div>
  );
}