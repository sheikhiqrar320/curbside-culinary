import { supabase } from "@/integrations/supabase/client";
import type { Dish } from "./catalog";
import fallbackImage from "@/assets/hero-spread.jpg";

/** A product as customers see it: admin-managed row plus its computed sale price. */
export type Product = Dish & {
  mrp: number;
  discount: number;
  stock: number;
  tags: string[];
  prepMinutes: number;
  restaurantSlug: string;
  restaurantName: string;
};

/**
 * Loads every product the admin has published (visible items of approved
 * restaurants). Row-level rules hide anything the admin marked as hidden.
 */
export async function fetchProducts(): Promise<Product[]> {
  const [{ data: rows, error }, { data: places }] = await Promise.all([
    supabase.from("dishes").select("*").order("created_at", { ascending: false }),
    supabase.from("restaurants").select("id,slug,name,image_url"),
  ]);
  if (error) throw new Error(error.message);

  const byId = new Map((places ?? []).map((r) => [r.id, r]));

  return (rows ?? []).map((d) => {
    const place = byId.get(d.restaurant_id);
    const discount = d.discount ?? 0;
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      price: Math.round(d.price * (1 - discount / 100)),
      mrp: d.price,
      discount,
      stock: d.stock ?? 0,
      tags: d.tags ?? [],
      prepMinutes: d.prep_minutes ?? 25,
      veg: d.veg,
      category: d.category,
      recommended: d.recommended,
      available: d.available && (d.stock ?? 0) > 0,
      restaurantId: d.restaurant_id,
      restaurantSlug: place?.slug ?? "",
      restaurantName: place?.name ?? "",
      image: d.image_url || place?.image_url || fallbackImage,
    } satisfies Product;
  });
}

/** Instant, typo-tolerant-ish search across name, category, description and restaurant. */
export function matchesSearch(p: Product, term: string) {
  if (!term) return true;
  const t = term.toLowerCase();
  return (
    p.name.toLowerCase().includes(t) ||
    p.category.toLowerCase().includes(t) ||
    p.description.toLowerCase().includes(t) ||
    p.restaurantName.toLowerCase().includes(t)
  );
}
