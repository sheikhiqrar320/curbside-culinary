import { Link } from "@tanstack/react-router";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold text-primary">{brand.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {brand.tagline} Order from {brand.city}'s best kitchens, track every step, and pay the way
            you like — UPI, cards or cash.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            {brand.address}
            <br />
            {brand.supportPhone} · {brand.supportEmail}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/restaurants" className="hover:text-primary">
                All restaurants
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Your orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">We accept</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>UPI · Google Pay · PhonePe</li>
            <li>Credit &amp; debit cards</li>
            <li>Cash on delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}