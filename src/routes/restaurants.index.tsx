import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { DishCard } from "@/components/dish-card";
import { useProducts } from "@/hooks/use-products";
import { matchesSearch } from "@/lib/products";
import { brand } from "@/lib/brand";
import { ShopClosedNotice, useShopOpen } from "@/components/store-chrome";

type SearchParams = { q?: string };

export const Route = createFileRoute("/restaurants/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu | Slider" },
      {
        name: "description",
        content:
          "Search and filter our menu by cuisine, rating, delivery time and veg-only. Add dishes straight to your cart.",
      },
      { property: "og:title", content: "Menu | Slider" },
      {
        property: "og:description",
        content: "Search and filter our menu by cuisine, rating and delivery time.",
      },
    ],
  }),
  component: RestaurantsPage,
});

const SORTS = ["Relevance", "Rating", "Delivery time", "Cost: low to high"] as const;
const PRICE_BANDS = [
  { id: "all", label: "Any price", max: Infinity },
  { id: "u150", label: "Under ₹150", max: 150 },
  { id: "u300", label: "Under ₹300", max: 300 },
  { id: "u500", label: "Under ₹500", max: 500 },
] as const;

function RestaurantsPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Relevance");
  const [category, setCategory] = useState<string | null>(null);
  const [band, setBand] = useState<(typeof PRICE_BANDS)[number]["id"]>("all");
  const [tag, setTag] = useState<string | null>(null);
  const products = useProducts();
  const shopOpen = useShopOpen();

  const term = query.trim().toLowerCase();
  const maxPrice = PRICE_BANDS.find((b) => b.id === band)?.max ?? Infinity;

  const allProducts = products.data ?? [];
  const productCategories = Array.from(new Set(allProducts.map((p) => p.category))).sort();
  const productTags = Array.from(new Set(allProducts.flatMap((p) => p.tags))).sort();
  const shownProducts = allProducts
    .filter((p) => matchesSearch(p, term))
    .filter((p) => (!category || p.category === category) && (!vegOnly || p.veg) && p.price <= maxPrice)
    .filter((p) => !tag || p.tags.includes(tag))
    .sort((a, b) => (sort === "Cost: low to high" ? a.price - b.price : 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Our menu</h1>

      {!shopOpen && (
        <div className="mt-6">
          <ShopClosedNotice />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              navigate({ search: { q: e.target.value || undefined }, replace: true });
            }}
            placeholder="Search products by name, category or keyword"
            aria-label="Search products by name, category or keyword"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={vegOnly} onClick={() => setVegOnly((v) => !v)} label="Pure veg" />
          
          {SORTS.filter((s) => s === "Cost: low to high").map((s) => (
            <FilterChip
              key={s}
              active={sort === s}
              onClick={() => setSort(sort === s ? "Relevance" : s)}
              label={s}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRICE_BANDS.filter((b) => b.id !== "all").map((b) => (
          <FilterChip
            key={b.id}
            active={band === b.id}
            onClick={() => setBand(band === b.id ? "all" : b.id)}
            label={b.label}
          />
        ))}
        {productCategories.map((c) => (
          <FilterChip
            key={c}
            active={category === c}
            onClick={() => setCategory(category === c ? null : c)}
            label={c}
          />
        ))}
        {productTags.map((t) => (
          <FilterChip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} label={t} />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">
          Dishes{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {products.isLoading ? "loading…" : `${shownProducts.length} items · live`}
          </span>
        </h2>
        {shownProducts.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shownProducts.map((p) => (
              <DishCard key={p.id} dish={p} />
            ))}
          </div>
        ) : (
          !products.isLoading && (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No items match this search yet — new products appear here the moment they are added.
            </p>
          )
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Prices in {brand.currency}. Cash on delivery only.
        </p>
      </section>

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