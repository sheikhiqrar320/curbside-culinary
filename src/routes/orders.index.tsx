import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/brand";
import { loadOrders, ORDER_STAGES, stageFor, type Order } from "@/lib/orders";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "Your orders | Slider" },
      { name: "description", content: "See past Slider orders, track live deliveries and reorder in one tap." },
      { property: "og:title", content: "Your orders | Slider" },
      { property: "og:description", content: "Track live deliveries and reorder your favourites." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => setOrders(loadOrders()), []);

  if (orders === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No orders yet.{" "}
          <Link to="/restaurants" className="font-semibold text-primary">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                to="/orders/$id"
                params={{ id: o.id }}
                className="card-surface flex items-center justify-between gap-4 p-5 hover:border-primary"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{o.id}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.placedAt).toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{formatMoney(o.total)}</p>
                  <p className="text-xs text-primary">{ORDER_STAGES[stageFor(o.placedAt)]}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}