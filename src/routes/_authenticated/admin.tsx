import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, IndianRupee, ShoppingBag, Store, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { ApprovalsPanel } from "@/components/admin/approvals-panel";
import { MenuPanel } from "@/components/admin/menu-panel";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { LiveBoard } from "@/components/admin/live-board";
import { MediaPanel } from "@/components/admin/media-panel";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { formatMoney } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import {
  decideRestaurant,
  deleteDish,
  getAdminOverview,
  saveDish,
  setDishAvailability,
  setOrderStatus,
  setRestaurantFeatured,
} from "@/lib/admin.functions";
import type { DishInput, OrderStatusValue } from "@/lib/admin-schemas";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | Slider" },
      {
        name: "description",
        content: "Approve restaurants, manage menus, update order status and track revenue on Slider.",
      },
      { property: "og:title", content: "Admin dashboard | Slider" },
      { property: "og:description", content: "Operations control room for the Slider marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const overviewFn = useServerFn(getAdminOverview);

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => overviewFn(),
    retry: false,
  });

  useAdminRealtime(overview.isSuccess);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "That action failed");

  const decide = useMutation({
    mutationFn: useServerFn(decideRestaurant),
    onSuccess: () => { toast.success("Restaurant updated"); invalidate(); },
    onError,
  });
  const feature = useMutation({
    mutationFn: useServerFn(setRestaurantFeatured),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError,
  });
  const dishSave = useMutation({
    mutationFn: useServerFn(saveDish),
    onSuccess: () => { toast.success("Menu saved"); invalidate(); },
    onError,
  });
  const dishToggle = useMutation({
    mutationFn: useServerFn(setDishAvailability),
    onSuccess: invalidate,
    onError,
  });
  const dishRemove = useMutation({
    mutationFn: useServerFn(deleteDish),
    onSuccess: () => { toast.success("Dish removed"); invalidate(); },
    onError,
  });
  const orderStatus = useMutation({
    mutationFn: useServerFn(setOrderStatus),
    onSuccess: () => { toast.success("Order status updated"); invalidate(); },
    onError,
  });

  const busy =
    decide.isPending ||
    feature.isPending ||
    dishSave.isPending ||
    dishToggle.isPending ||
    dishRemove.isPending ||
    orderStatus.isPending;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (overview.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (overview.isError) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have the admin role, so this dashboard stays locked.
        </p>
        <Button className="mt-6" variant="outline" onClick={signOut}>
          Sign in with another account
        </Button>
      </div>
    );
  }

  const { restaurants, dishes, orders } = overview.data!;
  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const live = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length;
  const pending = restaurants.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="card-surface relative overflow-hidden p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldAlert className="size-3.5" /> Server-verified admin
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Control room
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Approvals, menus, live orders and revenue in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => overview.refetch()} disabled={overview.isFetching}>
              {overview.isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard accent label="Revenue" value={formatMoney(revenue)} hint={`${paid.length} paid orders`} icon={IndianRupee} />
        <StatCard label="Live orders" value={String(live)} hint="Not yet delivered" icon={ShoppingBag} />
        <StatCard label="Restaurants" value={String(restaurants.length)} hint={`${restaurants.filter((r) => r.status === "approved").length} approved`} icon={Store} />
        <StatCard label="Pending approvals" value={String(pending)} hint="Waiting on you" icon={Clock} />
      </div>

      <Tabs defaultValue="live" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="menu">Food</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="media">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <LiveBoard orders={orders} restaurants={restaurants} connected={overview.isSuccess} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsPanel orders={orders} restaurants={restaurants} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <ApprovalsPanel
            restaurants={restaurants}
            busy={busy}
            onDecide={(id, status, reason) => decide.mutate({ data: { id, status, reason } })}
            onFeature={(id, featured) => feature.mutate({ data: { id, featured } })}
          />
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <MenuPanel
            restaurants={restaurants}
            dishes={dishes}
            busy={busy}
            onSave={(input: DishInput) => dishSave.mutate({ data: input })}
            onToggle={(id, available) => dishToggle.mutate({ data: { id, available } })}
            onDelete={(id) => dishRemove.mutate({ data: { id } })}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersPanel
            orders={orders}
            restaurants={restaurants}
            busy={busy}
            onStatus={(id, status: OrderStatusValue) => orderStatus.mutate({ data: { id, status } })}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaPanel restaurants={restaurants} dishes={dishes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}