import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, IndianRupee, ShoppingBag, Clock, RotateCcw, Package, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { MenuPanel } from "@/components/admin/menu-panel";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { LiveBoard } from "@/components/admin/live-board";
import { MediaPanel } from "@/components/admin/media-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { formatMoney } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import {
  applyDiscount,
  deleteAllDishes,
  deleteDish,
  getAdminOverview,
  resetDashboard,
  saveDish,
  setDishAvailability,
  setDishVisibility,
  setOrderNotes,
  setOrderStatus,
  saveStoreSettings,
  updateAdminCredentials,
} from "@/lib/admin.functions";
import type { DishInput, OrderStatusValue } from "@/lib/admin-schemas";
import type { StoreSettingsInput } from "@/lib/store-schemas";

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
  const { settings } = useStoreSettings();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "That action failed");

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
  const dishVisible = useMutation({
    mutationFn: useServerFn(setDishVisibility),
    onSuccess: invalidate,
    onError,
  });
  const orderNotes = useMutation({
    mutationFn: useServerFn(setOrderNotes),
    onSuccess: () => { toast.success("Delivery note saved"); invalidate(); },
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
  const reset = useMutation({
    mutationFn: useServerFn(resetDashboard),
    onSuccess: (r: { deleted: number }) => {
      toast.success(`Dashboard reset — ${r.deleted} order${r.deleted === 1 ? "" : "s"} cleared`);
      invalidate();
    },
    onError,
  });
  const storeSave = useMutation({
    mutationFn: useServerFn(saveStoreSettings),
    onSuccess: () => {
      toast.success("Store settings saved");
      queryClient.invalidateQueries({ queryKey: ["store", "settings"] });
    },
    onError,
  });
  const discountAll = useMutation({
    mutationFn: useServerFn(applyDiscount),
    onSuccess: () => { toast.success("Discounts updated"); invalidate(); },
    onError,
  });
  const wipeMenu = useMutation({
    mutationFn: useServerFn(deleteAllDishes),
    onSuccess: (r: { deleted: number }) => {
      toast.success(`${r.deleted} product${r.deleted === 1 ? "" : "s"} removed`);
      invalidate();
    },
    onError,
  });
  const credentials = useMutation({
    mutationFn: useServerFn(updateAdminCredentials),
    onSuccess: () => toast.success("Admin login updated — use it next time you sign in"),
    onError,
  });

  const busy =
    dishSave.isPending ||
    dishToggle.isPending ||
    dishVisible.isPending ||
    orderNotes.isPending ||
    dishRemove.isPending ||
    orderStatus.isPending ||
    storeSave.isPending ||
    discountAll.isPending ||
    wipeMenu.isPending ||
    credentials.isPending ||
    reset.isPending;

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

  const { restaurants, dishes, orders, customers } = overview.data!;
  const paid = orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const live = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length;
  const awaiting = orders.filter((o) => o.status === "received").length;

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
              Menus, live customer orders and revenue in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => overview.refetch()} disabled={overview.isFetching}>
              {overview.isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive" disabled={reset.isPending}>
                  <RotateCcw className="size-4" /> Reset dashboard
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start the dashboard from zero?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes every order — live, completed and cancelled — so counters,
                    revenue and charts begin again. Restaurants and menus are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep data</AlertDialogCancel>
                  <AlertDialogAction onClick={() => reset.mutate({} as never)}>
                    Reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard accent label="Revenue" value={formatMoney(revenue)} hint={`${paid.length} paid orders`} icon={IndianRupee} />
        <StatCard label="Total orders" value={String(orders.length)} hint={`${live} live right now`} icon={ShoppingBag} />
        <StatCard label="Pending orders" value={String(awaiting)} hint="Accept to start the kitchen" icon={Clock} />
        <StatCard label="Products" value={String(dishes.length)} hint={`${dishes.filter((d) => d.visible).length} visible to customers`} icon={Package} />
        <StatCard label="Customers" value={String(customers)} hint="Registered accounts" icon={Users} />
      </div>

      <Tabs defaultValue="live" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="menu">Food</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="media">Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <LiveBoard
            orders={orders}
            restaurants={restaurants}
            connected={overview.isSuccess}
            busy={busy}
            onStatus={(id, status) => orderStatus.mutate({ data: { id, status } })}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsPanel orders={orders} restaurants={restaurants} />
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <MenuPanel
            restaurants={restaurants}
            dishes={dishes}
            busy={busy}
            onSave={(input: DishInput) => dishSave.mutate({ data: input })}
            onToggle={(id, available) => dishToggle.mutate({ data: { id, available } })}
            onVisibility={(id, visible) => dishVisible.mutate({ data: { id, visible } })}
            onDelete={(id) => dishRemove.mutate({ data: { id } })}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersPanel
            orders={orders}
            restaurants={restaurants}
            busy={busy}
            onStatus={(id, status: OrderStatusValue) => orderStatus.mutate({ data: { id, status } })}
            onNotes={(id, notes) => orderNotes.mutate({ data: { id, notes } })}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaPanel restaurants={restaurants} dishes={dishes} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel
            settings={settings}
            busy={busy}
            onSave={(input: StoreSettingsInput) => storeSave.mutate({ data: input })}
            onDiscountAll={(discount) => discountAll.mutate({ data: { scope: "all", discount } })}
            onDeleteAllDishes={() => wipeMenu.mutate({} as never)}
            onCredentials={(input) => credentials.mutate({ data: input })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}