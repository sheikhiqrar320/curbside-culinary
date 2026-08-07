import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { FeedItem } from "@/components/admin/notification-center";

type FeedState = {
  feed: FeedItem[];
  push: (item: Omit<FeedItem, "id" | "at">) => void;
  clear: () => void;
};

const FeedContext = createContext<FeedState | null>(null);

/** Keeps the last 30 live admin events so the notification centre can show them. */
export function AdminFeedProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const push = useCallback((item: Omit<FeedItem, "id" | "at">) => {
    setFeed((prev) =>
      [
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString() },
        ...prev,
      ].slice(0, 30),
    );
  }, []);

  const value = useMemo(() => ({ feed, push, clear: () => setFeed([]) }), [feed, push]);
  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useAdminFeed() {
  return useContext(FeedContext);
}