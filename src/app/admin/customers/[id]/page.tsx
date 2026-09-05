"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/forms";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCustomersStore } from "@/stores/customers-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useCatalogStore } from "@/stores/catalog-store";
import { KpiCard } from "@/components/shared/kpi-card";
import { MediaImg } from "@/components/media/media-img";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customer = useCustomersStore((s) => s.customers.find((c) => c.id === id));
  const allOrders = useOrdersStore((s) => s.orders);
  const allReturns = useOrdersStore((s) => s.returns);
  const allWishlists = useCustomersStore((s) => s.wishlists);
  const allCarts = useCustomersStore((s) => s.carts);
  const allReviews = useCustomersStore((s) => s.reviews);
  const products = useCatalogStore((s) => s.products);
  const orders = allOrders.filter((o) => o.customerId === id);
  const wishlists = allWishlists.filter((w) => w.customerId === id);
  const carts = allCarts.filter((c) => c.customerId === id);
  const reviews = allReviews.filter((r) => r.customerId === id);
  const returns = allReturns.filter((r) => r.customerId === id);
  if (!customer) return <EmptyState title="Customer not found" />;

  return (
    <div>
      <PageHeader title={customer.name} description={`${customer.email} · ${customer.phone}`} crumbs={[{ href: "/admin/customers", label: "Customers" }, { label: customer.name }]} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Orders" value={String(customer.totalOrders)} />
        <KpiCard label="Lifetime spend" value={formatCurrency(customer.totalSpend)} />
        <KpiCard label="Segment" value={customer.segment.toUpperCase()} />
        <KpiCard label="Joined" value={formatDate(customer.joinedAt)} />
      </div>
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="cart">Cart</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4">
          <TableWrap>
            <thead><tr><Th>Order</Th><Th>Date</Th><Th>Total</Th><Th>Status</Th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <Td><Link className="hover:underline" href={`/admin/orders/${o.id}`}>{o.id}</Link></Td>
                  <Td>{formatDate(o.date)}</Td>
                  <Td>{formatCurrency(o.total)}</Td>
                  <Td><StatusBadge value={o.orderStatus} /></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </TabsContent>
        <TabsContent value="addresses" className="mt-4 grid gap-3 md:grid-cols-2">
          {customer.addresses.length === 0 ? <EmptyState title="No saved addresses" /> : customer.addresses.map((a, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{a.name}</p>
                {a.label ? <span className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">{a.label}</span> : null}
              </div>
              {i === 0 ? <p className="mt-1 text-[10px] tracking-[0.14em] uppercase text-primary">Default</p> : null}
              <p className="mt-2 text-sm text-muted-foreground">
                {a.line1}
                {a.line2 ? <>, {a.line2}</> : null}
                {a.landmark ? <>, {a.landmark}</> : null}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country}
              </p>
              <p className="mt-2 text-sm">{a.phone}</p>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="wishlist" className="mt-4">
          <ul className="grid gap-2">
            {wishlists.map((w) => {
              const p = products.find((x) => x.id === w.productId);
              return (
                <li key={w.id} className="flex items-center gap-3 rounded-lg border bg-card p-2">
                  <MediaImg src={p?.images[0]} alt="" className="size-12 rounded object-cover" />
                  <span>{p?.title}</span>
                </li>
              );
            })}
          </ul>
        </TabsContent>
        <TabsContent value="cart" className="mt-4">
          {carts.length === 0 ? <EmptyState title="No active cart" /> : carts.map((c) => (
            <Card key={c.id} className="p-4">
              <p className="text-sm text-muted-foreground">Value {formatCurrency(c.value)} · {c.abandoned ? "Abandoned" : "Active"}</p>
              {c.items.map((i) => <p key={i.sku} className="text-sm">{i.title} ×{i.quantity}</p>)}
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 grid gap-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <p className="font-medium">{r.title} · {r.rating}★</p>
              <p className="text-sm text-muted-foreground">{r.body}</p>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="returns" className="mt-4">
          {returns.length === 0 ? <EmptyState title="No returns" /> : returns.map((r) => (
            <Card key={r.id} className="p-4">
              <Link href={`/admin/returns/${r.id}`} className="font-medium hover:underline">{r.id}</Link>
              <p className="text-sm">{r.productTitle}</p>
              <StatusBadge value={r.status} />
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
