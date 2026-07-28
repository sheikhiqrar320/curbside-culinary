import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { brand } from "./brand";
import { coupons, dishes, type Dish } from "./catalog";

export type CartLine = { dish: Dish; qty: number };

type CartState = {
  lines: CartLine[];
  coupon: string | null;
  add: (dish: Dish) => void;
  remove: (dishId: string) => void;
  setQty: (dishId: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  count: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "slider.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  // Start empty so SSR and first client render match, then hydrate from storage.
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { lines: { id: string; qty: number }[]; coupon: string | null };
      setLines(
        saved.lines
          .map(({ id, qty }) => {
            const dish = dishes.find((d) => d.id === id);
            return dish ? { dish, qty } : null;
          })
          .filter(Boolean) as CartLine[],
      );
      setCoupon(saved.coupon ?? null);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines: lines.map((l) => ({ id: l.dish.id, qty: l.qty })), coupon }),
    );
  }, [lines, coupon]);

  const value = useMemo<CartState>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.dish.price * l.qty, 0);
    const active = coupons.find((c) => c.code === coupon);
    let discount = 0;
    let deliveryFee = subtotal === 0 || subtotal >= brand.freeDeliveryAbove ? 0 : brand.deliveryFee;

    if (active && subtotal >= active.minOrder) {
      if (active.type === "percent") discount = Math.min((subtotal * active.value) / 100, active.cap);
      if (active.type === "flat") discount = active.value;
      if (active.type === "delivery") deliveryFee = 0;
    }

    const taxable = Math.max(subtotal - discount, 0);
    const tax = Math.round(taxable * brand.taxRate);

    return {
      lines,
      coupon,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      discount: Math.round(discount),
      deliveryFee,
      tax,
      total: Math.max(Math.round(taxable + tax + deliveryFee), 0),
      add: (dish) =>
        setLines((prev) => {
          const found = prev.find((l) => l.dish.id === dish.id);
          if (found) return prev.map((l) => (l.dish.id === dish.id ? { ...l, qty: l.qty + 1 } : l));
          return [...prev, { dish, qty: 1 }];
        }),
      remove: (dishId) => setLines((prev) => prev.filter((l) => l.dish.id !== dishId)),
      setQty: (dishId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.dish.id !== dishId)
            : prev.map((l) => (l.dish.id === dishId ? { ...l, qty } : l)),
        ),
      clear: () => {
        setLines([]);
        setCoupon(null);
      },
      applyCoupon: (code) => {
        const match = coupons.find((c) => c.code === code.trim().toUpperCase());
        if (!match) return { ok: false, message: "That code doesn't exist." };
        if (subtotal < match.minOrder)
          return { ok: false, message: `Add ${brand.currency}${match.minOrder - subtotal} more to use this code.` };
        setCoupon(match.code);
        return { ok: true, message: `${match.code} applied.` };
      },
      clearCoupon: () => setCoupon(null),
    };
  }, [lines, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}