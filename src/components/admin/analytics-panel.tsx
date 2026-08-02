import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/brand";
import type { AdminOrder, AdminRestaurant } from "@/lib/admin-schemas";

const STATUS_COLORS: Record<string, string> = {
  received: "hsl(var(--primary))",
  accepted: "hsl(var(--primary) / 0.75)",
  preparing: "hsl(var(--primary) / 0.55)",
  out_for_delivery: "hsl(var(--primary) / 0.4)",
  delivered: "hsl(var(--primary) / 0.25)",
  cancelled: "hsl(var(--destructive))",
};

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

  const statusMix = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, value]) => ({
    name: status.replace(/_/g, " "),
    value,
    fill: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
  }));

  const aov = paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0;
  const cancelRate = orders.length
    ? Math.round(((orders.length - paid.length) / orders.length) * 100)
    : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card-surface p-5 lg:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Revenue, last 7 days</h3>
            <p className="text-xs text-muted-foreground">
              Average order value {formatMoney(aov)} · {cancelRate}% cancelled
            </p>
          </div>
          <p className="font-display text-2xl font-bold">
            {formatMoney(revenueSeries.reduce((s, d) => s + d.revenue, 0))}
          </p>
        </div>
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

      <div className="card-surface p-5">
        <h3 className="font-display text-lg font-bold">Order status mix</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {statusMix.map((s) => (
                  <Cell key={s.name} fill={s.fill} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5 lg:col-span-2">
        <h3 className="font-display text-lg font-bold">Orders per day</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="currentColor" className="text-xs" />
              <YAxis allowDecimals={false} stroke="currentColor" className="text-xs" />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}