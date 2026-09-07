"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card } from "@/components/ui/layout";
import { kpis, salesSeries } from "@/data/ops";
import { formatCurrency, formatNumber, percentChange } from "@/lib/format";

export default function SalesAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Sales analytics" description="Revenue, tickets, and how the month is tracking." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Sales analytics" }]} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Revenue" value={formatCurrency(kpis.revenue.value)} change={percentChange(kpis.revenue.value, kpis.revenue.previous)} hint="this month" />
        <KpiCard label="Orders" value={formatNumber(kpis.orders.value)} change={percentChange(kpis.orders.value, kpis.orders.previous)} />
        <KpiCard label="AOV" value={formatCurrency(kpis.aov.value)} change={percentChange(kpis.aov.value, kpis.aov.previous)} />
        <KpiCard label="Paid conversion" value="3.4%" hint="sessions → paid (demo)" />
      </div>
      <Card className="mt-4 p-4">
        <h2 className="mb-4 font-display text-xl">Twelve-month trend</h2>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesSeries["12m"]} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e4dcd1" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v / 100000}L`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Bar dataKey="revenue" fill="#6b2d3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
