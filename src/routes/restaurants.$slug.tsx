import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock, Heart, Star } from "lucide-react";
import { useState } from "react";
import { DishCard } from "@/components/dish-card";
import { brand } from "@/lib/brand";
import { dishesFor, getRestaurant } from "@/lib/catalog";

export const Route = createFileRoute("/restaurants/$slug")({
  loader: ({ params }) => {
    const restaurant = getRestaurant(params.slug);
    if (!restaurant) throw notFound();
    return { restaurant, menu: dishesFor(restaurant.id) };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.restaurant;
    const title = r ? `${r.name} — order online | Slider` : "Restaurant | Slider";
    const description = r
      ? `${r.description} Rated ${r.rating}/5, delivery in ${r.deliveryMins[0]}–${r.deliveryMins[1]} minutes.`
      : "Order online with Slider.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RestaurantPage,
});

function RestaurantPage() {
  const { restaurant, menu } = Route.useLoaderData();
  const [favorite, setFavorite] = useState(false);
  const categoriesInMenu = Array.from(new Set(menu.map((d) => d.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const recommended = menu.filter((d) => d.recommended);
  const shown = activeCategory ? menu.filter((d) => d.category === activeCategory) : menu;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <img
        src={restaurant.image}
        alt={`${restaurant.name} cover`}
        width={800}
        height={600}
        className="h-56 w-full rounded-3xl border border-border object-cover sm:h-72"
      />

      <div className="card-surface -mt-12 relative mx-auto flex max-w-4xl flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{restaurant.cuisines.join(" · ")}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {restaurant.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 rounded-md bg-veg px-2 py-0.5 font-bold text-primary-foreground">
              {restaurant.rating}
              <Star className="size-3 fill-current" />
            </span>
            <span className="text-muted-foreground">{restaurant.reviews.toLocaleString()} reviews</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-4" />
              {restaurant.deliveryMins[0]}–{restaurant.deliveryMins[1]} mins
            </span>
            <span className="text-muted-foreground">
              {brand.currency}
              {restaurant.costForTwo} for two
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFavorite((f) => !f)}
          aria-pressed={favorite}
          className="flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          <Heart className={`size-4 ${favorite ? "fill-primary text-primary" : ""}`} />
          {favorite ? "Saved" : "Save"}
        </button>
      </div>

      {restaurant.offer && (
        <p className="mt-6 rounded-xl border border-dashed border-primary px-4 py-3 text-sm font-semibold text-primary">
          {restaurant.offer} — applied automatically at checkout with a valid code.
        </p>
      )}

      {recommended.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Recommended</h2>
          <div className="mt-4 grid gap-4">
            {recommended.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Full menu</h2>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
          <CategoryTab
            label="All"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {categoriesInMenu.map((c) => (
            <CategoryTab
              key={c}
              label={c}
              active={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          {shown.map((d) => (
            <DishCard key={d.id} dish={d} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
      }`}
    >
      {label}
    </button>
  );
}