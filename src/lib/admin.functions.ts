import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  dishInputSchema,
  dishStatusSchema,
  orderStatusInputSchema,
  restaurantDecisionSchema,
  type AdminOverview,
} from "./admin-schemas";

/** Throws unless the caller holds the admin role (checked server-side, RLS-backed). */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Could not verify permissions");
  if (!data) throw new Error("Forbidden: admin access required");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context);
    const { supabase } = context;

    const [restaurants, dishes, orders] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("dishes").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("placed_at", { ascending: false }).limit(200),
    ]);

    if (restaurants.error) throw new Error(restaurants.error.message);
    if (dishes.error) throw new Error(dishes.error.message);
    if (orders.error) throw new Error(orders.error.message);

    return {
      restaurants: restaurants.data ?? [],
      dishes: dishes.data ?? [],
      orders: orders.data ?? [],
    };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

export const decideRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => restaurantDecisionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("restaurants")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: data.status === "rejected" ? (data.reason ?? null) : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setRestaurantFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    restaurantDecisionSchema.pick({ id: true }).extend(dishStatusSchema.shape).partial({ available: true }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("restaurants")
      .update({ featured: Boolean(data.available) })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dishInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      restaurant_id: data.restaurant_id,
      name: data.name,
      description: data.description,
      price: data.price,
      veg: data.veg,
      category: data.category,
      recommended: data.recommended,
      available: data.available,
    };
    const query = data.id
      ? context.supabase.from("dishes").update(payload).eq("id", data.id)
      : context.supabase.from("dishes").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDishAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dishStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("dishes")
      .update({ available: data.available })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => restaurantDecisionSchema.pick({ id: true }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("dishes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orderStatusInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });