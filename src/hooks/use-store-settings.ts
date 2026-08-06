import { useEffect, useId } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchStoreSettings } from "@/lib/store";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/lib/store-schemas";

export const STORE_SETTINGS_KEY = ["store", "settings"] as const;

/** Live store settings: refetches instantly whenever the admin saves a change. */
export function useStoreSettings() {
  const queryClient = useQueryClient();
  // Each mounted hook needs its own channel name; reusing one name across
  // components makes Supabase reject the second subscription.
  const channelId = useId();

  const query = useQuery({
    queryKey: STORE_SETTINGS_KEY,
    queryFn: fetchStoreSettings,
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`store-settings-live${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, channelId]);

  const settings: StoreSettings =
    query.data ?? ({ ...DEFAULT_STORE_SETTINGS, id: true, updated_at: "" } as StoreSettings);

  return { settings, isLoading: query.isLoading };
}