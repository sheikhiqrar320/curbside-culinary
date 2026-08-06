import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "./store-schemas";

/** Reads the single store-control record every visitor sees (theme, fees, open/closed). */
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase.from("store_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...(data ?? {}),
    id: true,
    updated_at: (data?.updated_at as string) ?? new Date().toISOString(),
  } as StoreSettings;
}

/** Only real colour values (hex) override the design tokens. */
export const isColor = (value: string | null | undefined) =>
  typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value.trim());

/** Delivery fee for a subtotal, using the admin's free-delivery rules. */
export function deliveryFeeFor(subtotal: number, s: Pick<StoreSettings, "delivery_fee" | "free_delivery_enabled" | "free_delivery_above">) {
  if (subtotal <= 0) return 0;
  if (s.free_delivery_enabled && subtotal >= s.free_delivery_above) return 0;
  return s.delivery_fee;
}