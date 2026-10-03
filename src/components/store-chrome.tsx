import { useEffect } from "react";
import { Megaphone, Moon } from "lucide-react";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { isColor } from "@/lib/store";

/**
 * Applies the admin's chosen colours + light/dark mode to the whole app and
 * renders the special-offer strip. Runs on every page via the root layout.
 */
export function StoreTheme() {
  const { settings } = useStoreSettings();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (name: string, value: string) => {
      if (isColor(value)) root.style.setProperty(name, value.trim());
      else root.style.removeProperty(name);
    };
    apply("--primary", settings.theme_primary);
    apply("--ring", settings.theme_primary);
    apply("--accent", settings.theme_accent);
    apply("--background", settings.theme_background);
    root.classList.toggle("dark", settings.theme_mode === "dark");
  }, [settings.theme_primary, settings.theme_accent, settings.theme_background, settings.theme_mode]);

  const background = settings.background_url ? (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <img src={settings.background_url} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 bg-background" style={{ opacity: (settings.background_dim ?? 60) / 100 }} />
    </div>
  ) : null;

  if (!settings.offer_active || !settings.offer_text) return background;

  return (
    <>
    {background}
    <div className="bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">
      <span className="inline-flex items-center gap-2">
        <Megaphone className="size-4" /> {settings.offer_text}
      </span>
    </div>
    </>
  );
}

/** Full-width notice shown to customers whenever the admin closes the shop. */
export function ShopClosedNotice() {
  const { settings } = useStoreSettings();
  if (settings.shop_open) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="card-surface relative overflow-hidden p-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-accent/30 blur-3xl"
        />
        <div className="relative">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Moon className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{settings.closed_title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {settings.closed_reason ||
              "We're not taking orders right now. Come back soon — the pans will be hot again."}
          </p>
          {settings.support_phone && (
            <p className="mt-4 text-sm font-semibold text-primary">Need us? {settings.support_phone}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/** True when customers should be blocked from ordering. */
export function useShopOpen() {
  return useStoreSettings().settings.shop_open;
}