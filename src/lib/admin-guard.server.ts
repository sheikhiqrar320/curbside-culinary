/**
 * Server-only guards and audit helpers shared by the admin server functions.
 * Never import this from a component — it is blocked from client bundles.
 */

type AdminContext = { supabase: any; userId: string; claims?: Record<string, unknown> };

/** True when the caller holds the admin role (read through RLS as the caller). */
export async function isAdmin(context: AdminContext) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Could not verify permissions");
  return Boolean(data);
}

/** Throws unless the caller is an admin. */
export async function assertAdmin(context: AdminContext) {
  if (!(await isAdmin(context))) throw new Error("Forbidden: admin access required");
}

export type AuditEntry = {
  action: string;
  entity?: string;
  entity_id?: string | null;
  summary?: string;
  details?: Record<string, unknown>;
};

/**
 * Records an admin action in the activity log. Failures are swallowed so a
 * logging problem can never block the operation the admin actually asked for.
 */
export async function logAudit(context: AdminContext, entry: AuditEntry) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: context.userId,
      actor_email: (context.claims?.["email"] as string | undefined) ?? null,
      action: entry.action,
      entity: entry.entity ?? "",
      entity_id: entry.entity_id ?? null,
      summary: entry.summary ?? "",
      details: entry.details ?? {},
    });
  } catch {
    /* audit logging is best-effort */
  }
}