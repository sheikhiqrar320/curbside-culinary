import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/brand";
import type { AdminOrder, AdminRestaurant } from "@/lib/admin-schemas";

export function AnalyticsPanel({
  orders,
  restaurants,
}: {
  orders: AdminOrder[];
  restaurants: AdminRestaurant[];
}) {
  const paid = orders.filter((o) => o.status !== "cancelled");

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const revenueSeries = days.map((d) => {
    const next = new Date(d).setDate(d.getDate() + 1);
    const inDay = paid.filter((o) => {
      const t = new Date(o.placed_at).getTime();
      return t >= d.getTime() && t < next;
    });
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      revenue: inDay.reduce((s, o) => s + o.total, 0),
      orders: inDay.length,
    };
  });

  const byRestaurant = restaurants
    .map((r) => ({
      name: r.name.length > 14 ? `${r.name.slice(0, 13)}…` : r.name,
      revenue: paid.filter((o) => o.restaurant_id === r.id).reduce((s, o) => s + o.total, 0),
    }))
    .filter((r) => r.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-bold">Revenue, last 7 days</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="currentColor" className="text-xs" />
              <YAxis stroke="currentColor" className="text-xs" />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.18}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-bold">Top restaurants by revenue</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byRestaurant}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="currentColor" className="text-xs" />
              <YAxis stroke="currentColor" className="text-xs" />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}