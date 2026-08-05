import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, type Product } from "@/lib/products";

/**
 * Customer-facing product feed. Subscribes to database changes so anything the
 * admin adds, edits, hides or deletes shows up instantly without a refresh.
 */
export function useProducts() {
  const queryClient = useQueryClient();

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("catalog-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "dishes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["menu"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants" }, () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
