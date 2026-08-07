import { useCallback, useEffect, useState } from "react";

type Permission = "default" | "granted" | "denied" | "unsupported";

/**
 * Desktop/mobile browser notifications for the admin panel. Works while the
 * site is open in a tab; no service worker or external push service required.
 */
export function useBrowserNotifications() {
  const [permission, setPermission] = useState<Permission>("unsupported");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission as Permission);
  }, []);

  const request = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported" as const;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    return result;
  }, []);

  const notify = useCallback((title: string, body?: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (document.visibilityState === "visible" && document.hasFocus()) return;
    try {
      new Notification(title, { body, tag: title, icon: "/favicon.ico" });
    } catch {
      /* some browsers block constructor notifications */
    }
  }, []);

  return { permission, request, notify };
}

/** Fire-and-forget helper for modules that can't use hooks. */
export function pushBrowserNotification(title: string, body?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && document.hasFocus()) return;
  try {
    new Notification(title, { body, tag: title, icon: "/favicon.ico" });
  } catch {
    /* ignore */
  }
}