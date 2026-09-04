"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCustomersStore } from "@/stores/customers-store";

export default function CustomersPage() {
  const customers = useCustomersStore((s) => s.customers);
  const [q, setQ] = useState("");
  const rows = useMemo(
    () => customers.filter((c) => `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase())),
    [customers, q],
  );
  return (
    <div>
      <PageHeader title="Customers" description="The book — who buys, where they live, what they spend." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Customers" }]} />
      <Input className="mb-4 max-w-sm" placeholder="Search name, email, city" value={q} onChange={(e) => setQ(e.target.value)} />
      {rows.length === 0 ? <EmptyState title="No customers match" /> : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Orders</Th>
              <Th>Spend</Th>
              <Th>Last purchase</Th>
              <Th>Location</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/customers/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                  <div className="mt-1"><StatusBadge value={c.segment} /></div>
                </Td>
                <Td className="text-muted-foreground">{c.email}</Td>
                <Td>{c.phone}</Td>
                <Td>{c.totalOrders}</Td>
                <Td>{formatCurrency(c.totalSpend)}</Td>
                <Td>{c.lastPurchase ? formatDate(c.lastPurchase) : "—"}</Td>
                <Td>{c.location}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
