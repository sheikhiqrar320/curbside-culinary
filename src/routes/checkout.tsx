import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { linesToItems, newOrderId, saveOrder } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Slider" },
      { name: "description", content: "Confirm your delivery address and pay by UPI, card or cash on delivery." },
      { property: "og:title", content: "Checkout | Slider" },
      { property: "og:description", content: "Confirm your address and pay by UPI, card or cash on delivery." },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI — Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit or debit card" },
  { id: "netbanking", label: "Net banking" },
  { id: "cod", label: "Cash on delivery" },
];

const SAVED_ADDRESSES = [
  { id: "home", label: "Home", value: "402, Palm Grove, 5th Block Koramangala, Bengaluru 560095" },
  { id: "work", label: "Work", value: "WeWork Galaxy, Residency Road, Bengaluru 560025" },
];

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressId, setAddressId] = useState(SAVED_ADDRESSES[0].id);
  const [customAddress, setCustomAddress] = useState("");
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold">Nothing to check out</h1>
        <Link
          to="/restaurants"
          className="mt-6 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
        >
          Find something to eat
        </Link>
      </div>
    );
  }

  const address =
    addressId === "new"
      ? customAddress
      : (SAVED_ADDRESSES.find((a) => a.id === addressId)?.value ?? "");

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Please enter your name.");
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, "").slice(-10)))
      return toast.error("Enter a valid 10-digit phone number.");
    if (address.trim().length < 10) return toast.error("Please enter a delivery address.");

    setPlacing(true);
    const order = {
      id: newOrderId(),
      placedAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? payment,
      items: linesToItems(cart.lines),
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      tax: cart.tax,
      total: cart.total,
    };
    saveOrder(order);
    cart.clear();
    toast.success("Order placed — the kitchen has been notified.");
    navigate({ to: "/orders/$id", params: { id: order.id } });
  };

  return (
    <form onSubmit={placeOrder} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>

        <section className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} placeholder="Ananya Mehta" />
            <Field label="Phone number" value={phone} onChange={setPhone} placeholder="98450 12345" />
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Delivery address</h2>
          <div className="mt-4 space-y-3">
            {SAVED_ADDRESSES.map((a) => (
              <Choice
                key={a.id}
                name="address"
                checked={addressId === a.id}
                onChange={() => setAddressId(a.id)}
                title={a.label}
                subtitle={a.value}
              />
            ))}
            <Choice
              name="address"
              checked={addressId === "new"}
              onChange={() => setAddressId("new")}
              title="Add a new address"
            />
            {addressId === "new" && (
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                rows={3}
                aria-label="New delivery address"
                placeholder="Flat, building, street, landmark, pincode"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            )}
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="font-display text-lg font-bold">Payment method</h2>
          <div className="mt-4 space-y-3">
            {PAYMENT_METHODS.map((p) => (
              <Choice
                key={p.id}
                name="payment"
                checked={payment === p.id}
                onChange={() => setPayment(p.id)}
                title={p.label}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Card and UPI payments are simulated in this build. Connect a payment provider to take real
            money.
          </p>
        </section>
      </div>

      <aside>
        <div className="card-surface sticky top-24 p-6">
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.lines.map(({ dish, qty }) => (
              <li key={dish.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted-foreground">
                  {qty} × {dish.name}
                </span>
                <span className="shrink-0">{formatMoney(dish.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            {cart.discount > 0 && (
              <p className="flex justify-between text-veg">
                <span>Discount</span>
                <span>− {formatMoney(cart.discount)}</span>
              </p>
            )}
            <p className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>{cart.deliveryFee === 0 ? "Free" : formatMoney(cart.deliveryFee)}</span>
            </p>
            <p className="flex justify-between text-muted-foreground">
              <span>Taxes</span>
              <span>{formatMoney(cart.tax)}</span>
            </p>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-bold">
            <span>To pay</span>
            <span>{formatMoney(cart.total)}</span>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {placing ? "Placing order…" : `Place order · ${formatMoney(cart.total)}`}
          </button>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        value={value}
        maxLength={80}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  subtitle,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-4 text-sm transition-colors ${
        checked ? "border-primary bg-secondary" : "border-border"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1 accent-primary" />
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        {subtitle && <span className="block text-muted-foreground">{subtitle}</span>}
      </span>
    </label>
  );
}