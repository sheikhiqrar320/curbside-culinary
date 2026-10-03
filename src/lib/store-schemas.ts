import { z } from "zod";

/** A CSS colour the admin picked (hex). Empty/legacy values fall back to the design tokens. */
const colorField = z.string().trim().max(30).default("");

export const storeSettingsSchema = z.object({
  store_name: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(140).default(""),
  shop_open: z.boolean().default(true),
  closed_title: z.string().trim().max(80).default("The kitchen is resting"),
  closed_reason: z.string().trim().max(400).default(""),
  support_phone: z.string().trim().max(40).default(""),
  support_email: z.string().trim().max(120).default(""),
  whatsapp: z.string().trim().max(40).default(""),
  theme_primary: colorField,
  theme_accent: colorField,
  theme_background: colorField,
  theme_mode: z.enum(["light", "dark"]).default("light"),
  background_url: z.string().trim().max(2000).default(""),
  background_dim: z.number().int().min(0).max(95).default(60),
  offer_active: z.boolean().default(false),
  offer_text: z.string().trim().max(200).default(""),
  delivery_fee: z.number().int().min(0).max(5000).default(39),
  free_delivery_enabled: z.boolean().default(true),
  free_delivery_above: z.number().int().min(0).max(100000).default(599),
  tax_rate: z.number().min(0).max(0.5).default(0.05),
  eta_min: z.number().int().min(1).max(600).default(30),
  eta_max: z.number().int().min(1).max(600).default(45),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
export type StoreSettings = StoreSettingsInput & { id: boolean; updated_at: string };

export const DEFAULT_STORE_SETTINGS: StoreSettingsInput = storeSettingsSchema.parse({
  store_name: "Slider",
  tagline: "Hot food, slid to your door.",
  support_phone: "+91 80 4567 8900",
  support_email: "support@slider.food",
  theme_primary: "",
  theme_accent: "",
  theme_background: "",
});

export const adminCredentialsSchema = z
  .object({
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    password: z.string().min(8, "Use at least 8 characters").max(72).optional().or(z.literal("")),
  })
  .refine((v) => Boolean(v.email || v.password), {
    message: "Enter a new email or a new password",
  });

export const bulkDiscountSchema = z.object({
  scope: z.enum(["all", "one"]),
  dish_id: z.string().uuid().optional(),
  discount: z.number().int().min(0).max(90),
});