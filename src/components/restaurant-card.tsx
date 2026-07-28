import { Link } from "@tanstack/react-router";
import { Clock, Star } from "lucide-react";
import { brand } from "@/lib/brand";
import type { Restaurant } from "@/lib/catalog";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to="/restaurants/$slug" params={{ slug: restaurant.slug }} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
        <img
          src={restaurant.image}
          alt={`${restaurant.name} — ${restaurant.cuisines.join(", ")}`}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {restaurant.offer && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
            {restaurant.offer}
          </span>
        )}
        {restaurant.pureVeg && (
          <span className="absolute top-3 right-3 rounded-lg bg-card px-2 py-1 text-[11px] font-bold text-veg">
            Pure Veg
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold group-hover:text-primary">
            {restaurant.name}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{restaurant.cuisines.join(" · ")}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-veg px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
          {restaurant.rating}
          <Star className="size-3 fill-current" />
        </span>
      </div>
      <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {restaurant.deliveryMins[0]}–{restaurant.deliveryMins[1]} mins
        </span>
        <span>
          {brand.currency}
          {restaurant.costForTwo} for two
        </span>
      </p>
    </Link>
  );
}