import { z } from "zod";

export const STAFF_ROLES = ["admin", "manager", "staff", "restaurant_owner"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type AppRole = StaffRole | "customer";

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  restaurant_owner: "Kitchen owner",
  customer: "Customer",
};

export const customerUpdateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  loyalty_points: z.number().int().min(0).max(1_000_000).optional(),
  wallet_balance: z.number().int().min(0).max(10_000_000).optional(),
});

export const suspendSchema = z.object({
  id: z.string().uuid(),
  suspended: z.boolean(),
});

export const roleGrantSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(STAFF_ROLES),
  enabled: z.boolean(),
});

export const staffCreateSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  full_name: z.string().trim().max(120).default(""),
  role: z.enum(STAFF_ROLES),
});

export const notificationSchema = z.object({
  audience: z.enum(["all", "one"]),
  recipient_id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().max(500).default(""),
  link: z.string().trim().max(300).optional(),
});

export type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  suspended: boolean;
  loyalty_points: number;
  wallet_balance: number;
  created_at: string;
  roles: AppRole[];
};

export type AuditLog = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  audience: string;
  recipient_id: string | null;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type PeopleOverview = {
  customers: Customer[];
  audit: AuditLog[];
  notifications: NotificationRow[];
};