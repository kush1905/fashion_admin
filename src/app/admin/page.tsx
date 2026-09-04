"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { kpis, salesSeries } from "@/data/ops";
import { formatCurrency, formatDate, formatNumber, percentChange } from "@/lib/format";
import { productStock, useCatalogStore } from "@/stores/catalog-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { categories } from "@/data/catalog";
import { useCan } from "@/hooks/use-can";
import { canAccessPath } from "@/lib/permissions";

const ranges = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "12m", label: "12 months" },
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<(typeof ranges)[number]["id"]>("7d");
  const orders = useOrdersStore((s) => s.orders);
  const products = useCatalogStore((s) => s.products);
  const activity = useUiStore((s) => s.activity);
  const user = useAuthStore((s) => s.user);
  const can = useCan();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const isStaff = user?.roleId !== "role_super";

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) counts[o.orderStatus] = (counts[o.orderStatus] ?? 0) + 1;
    return counts;
  }, [orders]);

  const topProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status === "published")
      .sort((a, b) => b.reviewCount * b.price - a.reviewCount * a.price)
      .slice(0, 5);
  }, [products]);

  const lowStock = products.filter((p) => productStock(p) <= 3).slice(0, 5);
  const data = salesSeries[range];

  return (
    <div>
      <PageHeader
        title={`Good afternoon, ${firstName}`}
        description={
          isStaff
            ? `${user?.role} desk — you only see orders, customers, and catalogue assigned to this role.`
            : "Wedding-season week. Four orders need a decision before close of day."
        }
        crumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            {can("Orders", "view") ? (
              <Button asChild variant="outline">
                <Link href="/admin/orders">View orders</Link>
              </Button>
            ) : null}
            {can("Products", "create") ? (
              <Button asChild>
                <Link href="/admin/products/new">Add product</Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Revenue" value={formatCurrency(kpis.revenue.value)} change={percentChange(kpis.revenue.value, kpis.revenue.previous)} hint="vs last period" />
        <KpiCard label="Orders" value={formatNumber(kpis.orders.value)} change={percentChange(kpis.orders.value, kpis.orders.previous)} hint="this month" />
        <KpiCard label="Customers" value={formatNumber(kpis.customers.value)} change={percentChange(kpis.customers.value, kpis.customers.previous)} hint="active book" />
        <KpiCard label="Average order" value={formatCurrency(kpis.aov.value)} change={percentChange(kpis.aov.value, kpis.aov.previous)} hint="AOV" />
        <KpiCard label="Pending orders" value={String(kpis.pending.value)} change={percentChange(kpis.pending.value, kpis.pending.previous)} hint="need action" />
        <KpiCard label="Low stock" value={String(kpis.lowStock.value)} change={percentChange(kpis.lowStock.value, kpis.lowStock.previous)} hint="below threshold" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl">Sales</h2>
              <p className="text-xs text-muted-foreground">Atelier intake, not including appointments</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {ranges.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`rounded-md px-2.5 py-1 text-xs ${range === r.id ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b2d3c" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6b2d3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e4dcd1" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a39b91" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a39b91" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                <Area type="monotone" dataKey="revenue" stroke="#6b2d3c" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-display text-xl">Order overview</h2>
          <ul className="mt-4 grid gap-2">
            {["pending", "confirmed", "packed", "dispatched", "delivered", "cancelled", "return_requested"].map((s) => (
              <li key={s} className="flex items-center justify-between text-sm">
                <StatusBadge value={s} />
                <span className="tabular-nums">{orderCounts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-display text-xl">Top products</h2>
            {canAccessPath(user?.roleId, "/admin/analytics/products") ? (
              <Link href="/admin/analytics/products" className="text-xs text-muted-foreground hover:text-foreground">
                Product analytics
              </Link>
            ) : null}
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Sold*</Th>
                <Th>Revenue*</Th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="size-10 rounded-md object-cover" />
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </Td>
                  <Td className="text-muted-foreground">{categories.find((c) => c.id === p.categoryId)?.name}</Td>
                  <Td>{p.reviewCount + 8}</Td>
                  <Td>{formatCurrency((p.reviewCount + 8) * p.price)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <p className="px-4 py-2 text-[11px] text-muted-foreground">*Units inferred from demo velocity, not live POS.</p>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">
              All orders
            </Link>
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                  </Td>
                  <Td>{o.customerName}</Td>
                  <Td>{formatCurrency(o.total)}</Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <StatusBadge value={o.orderStatus} />
                      <StatusBadge value={o.paymentStatus} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {can("Inventory", "view") ? (
        <Card className="p-4">
          <h2 className="font-display text-xl">Low stock</h2>
          {lowStock.length === 0 ? (
            <EmptyState title="Inventory is healthy" description="Nothing is under the threshold of 3 units." />
          ) : (
            <ul className="mt-3 grid gap-3">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.images[0]} alt="" className="size-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{productStock(p)} units left</p>
                  </div>
                  {can("Inventory", "update") ? (
                    <Link href="/admin/inventory" className="text-xs text-primary">
                      Adjust
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
        ) : null}
        <Card className="p-4">
          <h2 className="font-display text-xl">Recent activity</h2>
          <ul className="mt-3 grid gap-3">
            {activity.map((a) => (
              <li key={a.id} className="border-b border-border/60 pb-3 last:border-0">
                <p className="text-sm">{a.message}</p>
                <p className="text-[11px] text-muted-foreground">{formatDate(a.at)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h2 className="font-display text-xl">Quick actions</h2>
          <div className="mt-3 grid gap-2">
            {[
              { href: "/admin/products/new", label: "Add product" },
              { href: "/admin/banners", label: "Create banner" },
              { href: "/admin/orders", label: "View orders" },
              { href: "/admin/inventory", label: "Manage inventory" },
              { href: "/admin/coupons", label: "Create coupon" },
            ]
              .filter((a) => canAccessPath(user?.roleId, a.href))
              .map((a) => (
              <Button key={a.href} asChild variant="outline" className="justify-start">
                <Link href={a.href}>{a.label}</Link>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
