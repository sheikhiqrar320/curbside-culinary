import { Link } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { brand } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-4" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">{brand.name}</span>
          </Link>
          <span className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="truncate">Koramangala, {brand.city}</span>
          </span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/restaurants"
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:flex"
          >
            <Search className="size-4" />
            Browse
          </Link>
          <Link
            to="/orders"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Orders
          </Link>
          <ThemeToggle />
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <ShoppingBag className="size-4" />
            <span>Cart</span>
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] text-ink-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}