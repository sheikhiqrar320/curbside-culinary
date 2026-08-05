import { createServerFn } from "@tanstack/react-start";
import { orderCodeSchema, placeOrderSchema } from "./order-schemas";

/** Places a Cash-on-Delivery order. It stays unconfirmed until an admin approves it. */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let restaurantId: string | null = null;
    if (data.restaurant_slug) {
      const { data: r } = await supabaseAdmin
        .from("restaurants")
        .select("id")
        .eq("slug", data.restaurant_slug)
        .maybeSingle();
      restaurantId = r?.id ?? null;
    }

    const { error } = await supabaseAdmin.from("orders").insert({
      code: data.code,
      restaurant_id: restaurantId,
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      landmark: data.landmark || null,
      pincode: data.pincode,
      payment_method: "cod",
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      delivery_fee: data.delivery_fee,
      tax: data.tax,
      total: data.total,
      status: "received",
    });
    if (error) throw new Error(error.message);
    return { ok: true, code: data.code, status: "received" as const };
  });

/** Public status lookup for the tracking page (no personal data returned). */
export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => orderCodeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("code,status,updated_at")
      .eq("code", data.code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? { status: row.status as string, updatedAt: row.updated_at as string } : null;
  });