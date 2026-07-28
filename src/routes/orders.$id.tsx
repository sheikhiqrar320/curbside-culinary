import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { brand, formatMoney } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { dishes } from "@/lib/catalog";
import { loadOrders, ORDER_STAGES, stageFor, type Order } from "@/lib/orders";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Track order ${params.id} | Slider` },
      { name: "description", content: "Live status of your Slider delivery, from kitchen acceptance to doorstep." },
      { property: "og:title", content: `Track order ${params.id} | Slider` },
      { property: "og:description", content: "Live status of your Slider delivery." },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [, setTick] = useState(0);

  useEffect(() => {
    setOrder(loadOrders().find((o) => o.id === id) ?? null);
    const t = setInterval(() => setTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, [id]);

  if (order === undefined) {
    return <div className="mx-auto my-16 h-64 max-w-3xl animate-pulse rounded-2xl bg-muted" />;
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Order not found</h1>
        <Link to="/orders" className="mt-6 inline-block font-semibold text-primary">
          Back to your orders
        </Link>
      </div>
    );
  }

  const stage = stageFor(order.placedAt);
  const canCancel = stage < 2;

  const reorder = () => {
    order.items.forEach((item) => {
      const dish = dishes.find((d) => d.name === item.name);
      if (dish) for (let i = 0; i < item.qty; i++) cart.add(dish);
    });
    toast.success("Items added back to your cart");
    navigate({ to: "/cart" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted-foreground">Order {order.id}</p>
      <h1 className="mt-1 font-display text-3xl font-bold">
        {stage === 4 ? "Delivered. Enjoy!" : ORDER_STAGES[stage]}
      </h1>

      <ol className="card-surface mt-8 space-y-0 p-6">
        {ORDER_STAGES.map((label, i) => {
          const done = i <= stage;
          return (
            <li key={label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`grid size-6 place-items-center rounded-full ${
                    done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                </span>
                {i < ORDER_STAGES.length - 1 && (
                  <span className={`h-10 w-0.5 ${i < stage ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className={done ? "" : "opacity-50"}>
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {done ? "Completed" : "Pending"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="card-surface mt-6 p-6 print:border-none">
        <h2 className="font-display text-lg font-bold">Invoice</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {brand.name} · {new Date(order.placedAt).toLocaleString()}
        </p>
        <p className="mt-4 text-sm">
          <span className="font-semibold">{order.name}</span> · {order.phone}
          <br />
          <span className="text-muted-foreground">{order.address}</span>
          <br />
          <span className="text-muted-foreground">Paid via {order.paymentMethod}</span>
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.name} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {i.qty} × {i.name}
              </span>
              <span>{formatMoney(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
          {order.discount > 0 && (
            <div className="flex justify-between text-veg">
              <dt>Discount</dt>
              <dd>− {formatMoney(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{order.deliveryFee === 0 ? "Free" : formatMoney(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Taxes</dt>
            <dd>{formatMoney(order.tax)}</dd>
          </div>
        </dl>
        <p className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
          <span>Total paid</span>
          <span>{formatMoney(order.total)}</span>
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
        >
          <Printer className="size-4" />
          Download invoice
        </button>
        <button
          type="button"
          onClick={reorder}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Reorder
        </button>
        {canCancel && (
          <button
            type="button"
            onClick={() => toast.success("Cancellation requested — no charge will be made.")}
            className="rounded-xl border border-destructive px-5 py-2.5 text-sm font-semibold text-destructive"
          >
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}