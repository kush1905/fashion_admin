"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/nav";
import { useOrdersStore } from "@/stores/orders-store";

export default function OrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [method, setMethod] = useState("all");

  const rows = useMemo(() => {
    return orders.filter((o) => {
      const text = `${o.id} ${o.customerName} ${o.location}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (status !== "all" && o.orderStatus !== status) return false;
      if (payment !== "all" && o.paymentStatus !== payment) return false;
      if (method !== "all" && o.fulfillmentType !== method) return false;
      return true;
    });
  }, [orders, q, status, payment, method]);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Every ticket from the shop — payment, fulfilment, and where it needs to go."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Orders" }]}
      />
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
        <Input placeholder="Search order, customer, city" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "paid", "pending", "refunded", "partially_refunded"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any fulfilment</SelectItem>
            <SelectItem value="home_delivery">Home delivery</SelectItem>
            <SelectItem value="store_pickup">Store pickup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No orders found" description="Try another status or clear the search." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Items</Th>
              <Th>Amount</Th>
              <Th>Payment</Th>
              <Th>Fulfilment</Th>
              <Th>Location</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.id}</Link>
                  <p className="text-xs text-muted-foreground"><StatusBadge value={o.orderStatus} /></p>
                </Td>
                <Td>{o.customerName}</Td>
                <Td className="text-muted-foreground">{formatDate(o.date)}</Td>
                <Td>{o.items.length}</Td>
                <Td>{formatCurrency(o.total)}</Td>
                <Td><StatusBadge value={o.paymentStatus} /></Td>
                <Td><StatusBadge value={o.fulfillmentType} /></Td>
                <Td>{o.location}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
