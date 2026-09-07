"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency } from "@/lib/format";
import { useCustomersStore } from "@/stores/customers-store";

export default function CustomerAnalyticsPage() {
  const customers = useCustomersStore((s) => s.customers);
  const vip = customers.filter((c) => c.segment === "vip");
  const repeat = customers.filter((c) => c.segment === "repeat");
  const fresh = customers.filter((c) => c.segment === "new");
  const cities = Object.entries(
    customers.reduce<Record<string, number>>((acc, c) => {
      acc[c.city] = (acc[c.city] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader title="Customer analytics" description="New vs returning, the top book, and where they live." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Customer analytics" }]} />
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="New" value={String(fresh.length)} />
        <KpiCard label="Repeat" value={String(repeat.length)} />
        <KpiCard label="VIP" value={String(vip.length)} />
      </div>
      <h2 className="mt-8 mb-3 font-display text-xl">Top clients</h2>
      <TableWrap>
        <thead><tr><Th>Name</Th><Th>City</Th><Th>Orders</Th><Th>Spend</Th></tr></thead>
        <tbody>
          {[...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 8).map((c) => (
            <tr key={c.id}>
              <Td className="font-medium">{c.name}</Td>
              <Td>{c.city}</Td>
              <Td>{c.totalOrders}</Td>
              <Td>{formatCurrency(c.totalSpend)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <h2 className="mt-8 mb-3 font-display text-xl">Cities</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {cities.map(([city, n]) => (
          <li key={city} className="flex justify-between rounded-lg border bg-card px-4 py-3 text-sm">
            <span>{city}</span>
            <span className="text-muted-foreground">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
