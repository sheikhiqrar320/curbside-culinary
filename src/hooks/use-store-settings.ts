import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchStoreSettings } from "@/lib/store";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/lib/store-schemas";

export const STORE_SETTINGS_KEY = ["store", "settings"] as const;

// One shared realtime channel for the whole app, ref-counted across hook users.
let channel: ReturnType<typeof supabase.channel> | null = null;
let listeners = 0;

/** Live store settings: refetches instantly whenever the admin saves a change. */
export function useStoreSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: STORE_SETTINGS_KEY,
    queryFn: fetchStoreSettings,
    staleTime: 30_000,
  });

  useEffect(() => {
    listeners += 1;
    if (!channel) {
      channel = supabase
        // Fresh topic each time: Supabase reuses channels by topic name, and a
        // reused-but-still-subscribed channel rejects new listeners.
        .channel(`store-settings-live-${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "store_settings" },
          () => queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_KEY }),
        )
        .subscribe();
    }
    return () => {
      listeners -= 1;
      if (listeners <= 0 && channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [queryClient]);

  const settings: StoreSettings =
    query.data ?? ({ ...DEFAULT_STORE_SETTINGS, id: true, updated_at: "" } as StoreSettings);

  return { settings, isLoading: query.isLoading };
}