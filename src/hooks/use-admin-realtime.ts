import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes the admin dashboard to live database events (orders, restaurants,
 * dishes, customer sign-ups, media) and refreshes the overview automatically.
 * Refetches are coalesced so bursts of events don't thrash the app.
 */
export function useAdminRealtime(enabled: boolean) {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      if (timer.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      }, 250);
    };

    const channel = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const next = payload.new as { code?: string; status?: string } | null;
        const prev = payload.eventType === "UPDATE" ? (payload.old as { status?: string }) : null;
        if (payload.eventType === "INSERT") toast.success(`New order ${next?.code ?? ""}`);
        else if (next?.status === "cancelled" && prev?.status !== "cancelled")
          toast.error(`Order ${next?.code ?? ""} cancelled`);
        else if (payload.eventType === "UPDATE" && prev?.status !== next?.status)
          toast(`Order ${next?.code ?? ""} → ${next?.status?.replace(/_/g, " ")}`);
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurants" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "dishes" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_assets" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, () => {
        toast("New customer registered");
        refresh();
      })
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}