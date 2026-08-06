import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminCredentialsSchema,
  bulkDiscountSchema,
  storeSettingsSchema,
} from "./store-schemas";
import {
  dishInputSchema,
  dishStatusSchema,
  dishVisibilitySchema,
  featuredSchema,
  idSchema,
  orderNotesSchema,
  orderStatusInputSchema,
  restaurantDecisionSchema,
  type AdminOrder,
  type AdminOverview,
} from "./admin-schemas";

/** Reads the caller's admin role from user_roles (RLS: callers only see their own rows). */
async function isAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not verify permissions");
  return Boolean(data);
}

/** Throws unless the caller holds the admin role (checked server-side, RLS-backed). */
async function assertAdmin(context: { supabase: any; userId: string }) {
  if (!(await isAdmin(context))) throw new Error("Forbidden: admin access required");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context);
    const { supabase } = context;

    const [restaurants, dishes, orders, customers] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("dishes").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("placed_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    if (restaurants.error) throw new Error(restaurants.error.message);
    if (dishes.error) throw new Error(dishes.error.message);
    if (orders.error) throw new Error(orders.error.message);

    return {
      restaurants: restaurants.data ?? [],
      dishes: dishes.data ?? [],
      customers: customers.count ?? 0,
      orders: (orders.data ?? []).map((o: Record<string, unknown>) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : [],
      })) as AdminOverview["orders"],
    };
  });

export type { AdminOrder };

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await isAdmin(context), userId: context.userId };
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
  .inputValidator((input: unknown) => featuredSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("restaurants")
      .update({ featured: data.featured })
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
      discount: data.discount,
      stock: data.stock,
      visible: data.visible,
      veg: data.veg,
      category: data.category,
      recommended: data.recommended,
      available: data.available,
      tags: data.tags,
      prep_minutes: data.prep_minutes,
      ...(data.image_url !== undefined ? { image_url: data.image_url } : {}),
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

/** Hides or shows a product in the customer storefront. */
export const setDishVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dishVisibilitySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("dishes")
      .update({ visible: data.visible })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Saves a delivery note against an order. */
export const setOrderNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orderNotesSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ admin_notes: data.notes || null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
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

/** Wipes all order history so the dashboard starts from zero again. Admin only. */
export const resetDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { error, count } = await context.supabase
      .from("orders")
      .delete({ count: "exact" })
      .not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: count ?? 0 };
  });

/** Saves the store control centre (theme, fees, offers, open/closed, contacts). */
export const saveStoreSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => storeSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("store_settings")
      .update(data)
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Applies or clears a discount on one product or on every product at once. */
export const applyDiscount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bulkDiscountSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const query = context.supabase.from("dishes").update({ discount: data.discount });
    const { error } =
      data.scope === "one" && data.dish_id
        ? await query.eq("id", data.dish_id)
        : await query.not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Removes every product from the shop. Irreversible — used by "vanish the shop". */
export const deleteAllDishes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { error, count } = await context.supabase
      .from("dishes")
      .delete({ count: "exact" })
      .not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true, deleted: count ?? 0 };
  });

/** Lets the signed-in admin change their own dashboard email and/or password. */
export const updateAdminCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminCredentialsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (data.email) {
      payload.email = data.email;
      payload.email_confirm = true;
    }
    if (data.password) payload.password = data.password;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, payload);
    if (error) throw new Error(error.message);
    return { ok: true, emailChanged: Boolean(data.email) };
  });