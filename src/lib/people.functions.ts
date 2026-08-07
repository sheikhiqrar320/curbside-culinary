import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  customerUpdateSchema,
  notificationSchema,
  roleGrantSchema,
  staffCreateSchema,
  suspendSchema,
  type PeopleOverview,
} from "./people-schemas";
import { z } from "zod";

/** Customers, staff roles, activity log and notification history for the admin panel. */
export const getPeopleOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PeopleOverview> => {
    const { assertAdmin } = await import("./admin-guard.server");
    await assertAdmin(context);

    const [profiles, roles, audit, notifications] = await Promise.all([
      context.supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
      context.supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300),
      context.supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (profiles.error) throw new Error(profiles.error.message);

    const roleMap = new Map<string, string[]>();
    for (const r of roles.data ?? []) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }

    return {
      customers: (profiles.data ?? []).map((p: Record<string, any>) => ({
        id: p.id,
        full_name: p.full_name ?? null,
        email: p.email ?? null,
        phone: p.phone ?? null,
        suspended: Boolean(p.suspended),
        loyalty_points: p.loyalty_points ?? 0,
        wallet_balance: p.wallet_balance ?? 0,
        created_at: p.created_at,
        roles: (roleMap.get(p.id) ?? ["customer"]) as PeopleOverview["customers"][number]["roles"],
      })),
      audit: (audit.data ?? []) as PeopleOverview["audit"],
      notifications: (notifications.data ?? []) as PeopleOverview["notifications"],
    };
  });

/** Edits a customer's contact details, loyalty points or wallet balance. */
export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => customerUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("profiles").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(context, {
      action: "customer.update",
      entity: "profile",
      entity_id: id,
      summary: `Updated customer profile`,
      details: patch,
    });
    return { ok: true };
  });

/** Suspends or restores a customer account (blocks sign-in while suspended). */
export const setCustomerSuspended = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => suspendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    if (data.id === context.userId) throw new Error("You can't suspend your own account");

    const { error } = await context.supabase
      .from("profiles")
      .update({ suspended: data.suspended })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.updateUserById(data.id, {
      ban_duration: data.suspended ? "876000h" : "none",
    });

    await logAudit(context, {
      action: data.suspended ? "customer.suspend" : "customer.restore",
      entity: "profile",
      entity_id: data.id,
      summary: data.suspended ? "Suspended customer account" : "Restored customer account",
    });
    return { ok: true };
  });

/** Permanently deletes a customer account and its profile. */
export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    if (data.id === context.userId) throw new Error("You can't delete your own account");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);

    await logAudit(context, {
      action: "customer.delete",
      entity: "profile",
      entity_id: data.id,
      summary: "Deleted customer account",
    });
    return { ok: true };
  });

/** Creates a one-time password-reset link the admin can share with a customer. */
export const createPasswordResetLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ email: z.string().trim().email() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });
    if (error) throw new Error(error.message);
    await logAudit(context, {
      action: "customer.reset_password",
      entity: "profile",
      summary: `Generated a password reset link for ${data.email}`,
    });
    return { link: link.properties?.action_link ?? "" };
  });

/** Grants or revokes a staff role for an existing account. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => roleGrantSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    if (data.user_id === context.userId && data.role === "admin" && !data.enabled) {
      throw new Error("You can't remove your own admin role");
    }

    if (data.enabled) {
      const { error } = await context.supabase
        .from("user_roles")
        .insert({ user_id: data.user_id, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }

    await logAudit(context, {
      action: data.enabled ? "role.grant" : "role.revoke",
      entity: "user_role",
      entity_id: data.user_id,
      summary: `${data.enabled ? "Granted" : "Revoked"} the ${data.role} role`,
    });
    return { ok: true };
  });

/** Creates a new admin / manager / staff account with a confirmed email. */
export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => staffCreateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error) throw new Error(error.message);
    const uid = created.user?.id;
    if (!uid) throw new Error("Account could not be created");

    await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: data.role });
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: uid, full_name: data.full_name || data.email, email: data.email });

    await logAudit(context, {
      action: "staff.create",
      entity: "profile",
      entity_id: uid,
      summary: `Created ${data.role} account ${data.email}`,
    });
    return { ok: true, id: uid };
  });

/** Sends an in-app notification to one customer or broadcasts it to everyone. */
export const sendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => notificationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin-guard.server");
    await assertAdmin(context);
    if (data.audience === "one" && !data.recipient_id) throw new Error("Pick a customer first");

    const { error } = await context.supabase.from("notifications").insert({
      audience: data.audience,
      recipient_id: data.audience === "one" ? data.recipient_id : null,
      title: data.title,
      body: data.body,
      link: data.link || null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);

    await logAudit(context, {
      action: "notification.send",
      entity: "notification",
      summary: `Sent "${data.title}" to ${data.audience === "all" ? "all customers" : "one customer"}`,
    });
    return { ok: true };
  });

/** Deletes a notification from the history. */
export const deleteNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-guard.server");
    await assertAdmin(context);
    const { error } = await context.supabase.from("notifications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });