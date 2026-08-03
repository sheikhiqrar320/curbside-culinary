import { z } from "zod";

export const placeOrderSchema = z.object({
  code: z.string().trim().min(4).max(32),
  restaurant_slug: z.string().trim().max(120).optional(),
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(10).max(300),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        qty: z.number().int().min(1).max(50),
        price: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(50),
  subtotal: z.number().int().min(0),
  discount: z.number().int().min(0),
  delivery_fee: z.number().int().min(0),
  tax: z.number().int().min(0),
  total: z.number().int().min(0),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const orderCodeSchema = z.object({ code: z.string().trim().min(4).max(32) });

/** Customer-facing wording for each backend order status. */
export const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  received: "Waiting for admin approval",
  accepted: "Confirmed by admin",
  preparing: "Preparing your food",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Rejected / cancelled",
};

/** Timeline steps shown to the customer, mapped from the backend status. */
export const CUSTOMER_STAGES = [
  "Order placed",
  "Admin approved",
  "Preparing",
  "Out for delivery",
  "Delivered",
] as const;

export function stageIndexFor(status: string) {
  switch (status) {
    case "accepted":
      return 1;
    case "preparing":
      return 2;
    case "out_for_delivery":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}