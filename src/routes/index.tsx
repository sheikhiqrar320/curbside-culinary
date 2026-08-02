import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search, Star } from "lucide-react";
import { useRef, useState } from "react";
import heroImage from "@/assets/hero-spread.jpg";
import { DishCard } from "@/components/dish-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { brand } from "@/lib/brand";
import { categories, coupons, dishes, restaurants, reviews } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slider — Food Delivery in Bengaluru" },
      {
        name: "description",
        content:
          "Order biryani, pizza, burgers and more from top Bengaluru kitchens. Live tracking, coupons and cash on delivery.",
      },
      { property: "og:title", content: "Slider — Food Delivery in Bengaluru" },
      {
        property: "og:description",
        content: "Order from top Bengaluru kitchens with live tracking, coupons and flexible payments.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const popular = dishes.filter((d) => d.recommended).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Delivering in {brand.city}
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-extrabold text-balance lg:text-7xl">
            Hot food, <span className="text-primary">slid to your door.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            240+ kitchens, live order tracking to the minute, and coupons that actually apply at
            checkout.
          </p>

          <form
            className="mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/restaurants", search: { q: query || undefined } });
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants or dishes"
                aria-label="Search restaurants or dishes"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Find food
            </button>
          </form>
        </div>

        <img
          src={heroImage}
          alt="Overhead spread of biryani, pizza, burgers and salad bowls"
          width={1200}
          height={900}
          className="aspect-[4/3] w-full rounded-3xl border border-border object-cover shadow-[var(--shadow-lift)]"
        />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">What are you craving?</h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scrollRail(-1)}
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scrollRail(1)}
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
        <div ref={railRef} className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/restaurants"
              search={{ q: c.label }}
              className="group w-28 shrink-0 snap-start text-center"
            >
              <span className="grid aspect-square w-full place-items-center rounded-2xl border border-border bg-card text-4xl transition-transform group-hover:-translate-y-1">
                {c.emoji}
              </span>
              <span className="mt-2 block text-sm font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold">Offers for you</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="card-surface flex flex-col justify-between gap-4 p-6"
              style={{ backgroundImage: "var(--gradient-warm)" }}
            >
              <p className="font-display text-xl font-bold text-primary-foreground">{c.label}</p>
              <span className="w-fit rounded-lg border border-dashed border-primary-foreground/60 px-3 py-1 font-mono text-sm text-primary-foreground">
                {c.code}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Featured restaurants</h2>
          <Link to="/restaurants" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {restaurants
            .filter((r) => r.featured)
            .map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
        </div>
      </section>

      {/* Popular dishes */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-display text-2xl font-bold">Popular dishes near you</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {popular.map((d) => (
            <DishCard key={d.id} dish={d} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl bg-ink px-6 py-14 text-ink-foreground sm:px-12">
          <h2 className="text-center font-display text-3xl font-bold">Loved across the city</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="space-y-4">
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed">"{r.text}"</blockquote>
                <figcaption className="text-sm opacity-70">
                  {r.name} · {r.area}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
