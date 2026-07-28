import type { CartLine } from "./cart";

export type OrderStatus =
  | "Order Received"
  | "Restaurant Accepted"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

export const ORDER_STAGES: OrderStatus[] = [
  "Order Received",
  "Restaurant Accepted",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

export type Order = {
  id: string;
  placedAt: string;
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
};

const KEY = "slider.orders.v1";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order) {
  const all = [order, ...loadOrders()];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function newOrderId() {
  return `SLD-${Math.floor(100000 + Math.random() * 899999)}`;
}

export function linesToItems(lines: CartLine[]) {
  return lines.map((l) => ({ name: l.dish.name, qty: l.qty, price: l.dish.price }));
}

/** Stage index derived from how long ago the order was placed (demo simulation). */
export function stageFor(placedAt: string) {
  const mins = (Date.now() - new Date(placedAt).getTime()) / 60000;
  if (mins < 0.5) return 0;
  if (mins < 1.5) return 1;
  if (mins < 3) return 2;
  if (mins < 6) return 3;
  return 4;
}