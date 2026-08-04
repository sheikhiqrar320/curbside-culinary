import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { DishCard } from "@/components/dish-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { dishes, restaurants, restaurantById } from "@/lib/catalog";

type SearchParams = { q?: string };

export const Route = createFileRoute("/restaurants/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse restaurants & dishes | Slider" },
      {
        name: "description",
        content:
          "Search and filter our menu by cuisine, rating, delivery time and veg-only. Add dishes straight to your cart.",
      },
      { property: "og:title", content: "Browse restaurants & dishes | Slider" },
      {
        property: "og:description",
        content: "Search and filter our menu by cuisine, rating and delivery time.",
      },
    ],
  }),
  component: RestaurantsPage,
});

const SORTS = ["Relevance", "Rating", "Delivery time", "Cost: low to high"] as const;

function RestaurantsPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [vegOnly, setVegOnly] = useState(false);
  const [fast, setFast] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Relevance");

  const term = query.trim().toLowerCase();

  let list = restaurants.filter((r) => {
    if (vegOnly && !r.pureVeg) return false;
    if (fast && r.deliveryMins[1] > 30) return false;
    if (!term) return true;
    return (
      r.name.toLowerCase().includes(term) ||
      r.cuisines.some((c) => c.toLowerCase().includes(term)) ||
      dishes.some((d) => d.restaurantId === r.id && d.name.toLowerCase().includes(term))
    );
  });

  if (sort === "Rating") list = [...list].sort((a, b) => b.rating - a.rating);
  if (sort === "Delivery time") list = [...list].sort((a, b) => a.deliveryMins[1] - b.deliveryMins[1]);
  if (sort === "Cost: low to high") list = [...list].sort((a, b) => a.costForTwo - b.costForTwo);

  const matchingDishes = term
    ? dishes.filter(
        (d) =>
          (!vegOnly || d.veg) &&
          (d.name.toLowerCase().includes(term) || d.category.toLowerCase().includes(term)),
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Browse restaurants</h1>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              navigate({ search: { q: e.target.value || undefined }, replace: true });
            }}
            placeholder="Search restaurants, cuisines or dishes"
            aria-label="Search restaurants, cuisines or dishes"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={vegOnly} onClick={() => setVegOnly((v) => !v)} label="Pure veg" />
          <FilterChip active={fast} onClick={() => setFast((v) => !v)} label="Under 30 min" />
          {SORTS.filter((s) => s !== "Relevance").map((s) => (
            <FilterChip
              key={s}
              active={sort === s}
              onClick={() => setSort(sort === s ? "Relevance" : s)}
              label={s}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{list.length} restaurants open now</p>

      {list.length > 0 ? (
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No restaurants match those filters. Try clearing one.
        </p>
      )}

      {matchingDishes.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Dishes matching "{query}"</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {matchingDishes.map((d) => (
              <div key={d.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {restaurantById(d.restaurantId)?.name}
                </p>
                <DishCard dish={d} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FilterChip({
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
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}