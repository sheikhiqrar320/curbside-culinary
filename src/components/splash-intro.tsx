import { useEffect, useState } from "react";

const SEEN_KEY = "slider.splash.v1";

/**
 * Cinematic brand intro shown once per browser session when the app opens.
 * Purely presentational — it never blocks routing once the animation ends.
 */
export function SplashIntro() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "leaving">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SEEN_KEY, "1");
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");
    setPhase("playing");
    const leave = setTimeout(() => setPhase("leaving"), 2200);
    const done = setTimeout(() => setPhase("hidden"), 3000);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-ink text-ink-foreground transition-opacity duration-700 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* warm depth lighting */}
      <div className="splash-glow absolute -top-1/3 left-1/2 size-[80vmax] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div className="splash-glow absolute -bottom-1/3 right-0 size-[60vmax] rounded-full bg-accent/20 blur-[120px] [animation-delay:.6s]" />
      <div className="splash-steam pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_65%)]" />

      <div className="relative px-6 text-center">
        <p className="splash-kicker text-xs font-semibold uppercase tracking-[0.6em] opacity-0">
          Our own kitchen
        </p>
        <h1 className="splash-title mt-4 font-display text-[clamp(2.75rem,12vw,8rem)] font-extrabold leading-[0.95] tracking-tight">
          <span className="splash-word inline-block">SLIDER</span>{" "}
          <span className="splash-word splash-word-2 inline-block bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent">
            CAFE
          </span>
        </h1>
        <div className="splash-rule mx-auto mt-6 h-px w-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="splash-kicker mt-5 text-sm tracking-[0.25em] opacity-0 [animation-delay:1.1s]">
          HOT FOOD · SLID TO YOUR DOOR
        </p>
      </div>
    </div>
  );
}