"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { useOrdersStore } from "@/stores/orders-store";

export default function DeliveryPage() {
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.fulfillmentType === "home_delivery");
  return (
    <div>
      <PageHeader title="Home delivery" description="Orders leaving the atelier for a doorstep, not a boutique counter." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Home delivery" }]} />
      {orders.length === 0 ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">No home-delivery orders right now.</p>
      ) : (
      <TableWrap>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>City</Th>
            <Th>Courier</Th>
            <Th>Tracking</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <Td><Link className="font-medium hover:underline" href={`/admin/orders/${o.id}`}>{o.id}</Link><p className="text-xs text-muted-foreground">{formatDate(o.date)}</p></Td>
              <Td>{o.customerName}</Td>
              <Td>{o.location}</Td>
              <Td>{o.courier ?? "Unassigned"}</Td>
              <Td className="font-mono text-xs">{o.trackingNumber ?? "—"}</Td>
              <Td>{formatCurrency(o.total)}</Td>
              <Td><StatusBadge value={o.orderStatus} /></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      )}
    </div>
  );
}
