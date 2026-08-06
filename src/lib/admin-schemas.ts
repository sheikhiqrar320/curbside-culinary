import { z } from "zod";

export const ORDER_STATUSES = [
  "received",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatusValue, string> = {
  received: "Order received",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const idSchema = z.object({ id: z.string().uuid() });

export const restaurantDecisionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(APPROVAL_STATUSES),
  reason: z.string().trim().max(300).optional(),
});

export const featuredSchema = z.object({
  id: z.string().uuid(),
  featured: z.boolean(),
});

export const dishStatusSchema = z.object({
  id: z.string().uuid(),
  available: z.boolean(),
});

export const dishInputSchema = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(400).default(""),
  price: z.number().int().min(0).max(100000),
  discount: z.number().int().min(0).max(90).default(0),
  stock: z.number().int().min(0).max(100000).default(0),
  visible: z.boolean().default(true),
  veg: z.boolean().default(false),
  category: z.string().trim().min(1).max(60).default("Mains"),
  recommended: z.boolean().default(false),
  available: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  prep_minutes: z.number().int().min(1).max(240).default(25),
  image_url: z.string().trim().url().max(2000).nullable().optional(),
});
export type DishInput = z.infer<typeof dishInputSchema>;

export const orderStatusInputSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});

export const dishVisibilitySchema = z.object({
  id: z.string().uuid(),
  visible: z.boolean(),
});

export const orderNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(500),
});

export type AdminRestaurant = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  description: string;
  image_url: string | null;
  rating: number;
  reviews: number;
  delivery_min: number;
  delivery_max: number;
  cost_for_two: number;
  offer: string | null;
  pure_veg: boolean;
  featured: boolean;
  status: ApprovalStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type AdminDish = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  visible: boolean;
  veg: boolean;
  category: string;
  recommended: boolean;
  available: boolean;
  tags: string[];
  prep_minutes: number;
  image_url: string | null;
  created_at: string;
};

export type AdminOrder = {
  id: string;
  code: string;
  restaurant_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  landmark: string | null;
  pincode: string | null;
  admin_notes: string | null;
  payment_method: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax: number;
  total: number;
  status: OrderStatusValue;
  placed_at: string;
};

export type AdminOverview = {
  restaurants: AdminRestaurant[];
  dishes: AdminDish[];
  orders: AdminOrder[];
  customers: number;
};