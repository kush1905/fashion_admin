"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Card, EmptyState } from "@/components/ui/layout";
import { ConfirmDialog } from "@/components/ui/overlay";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ORDER_STATUSES, labelize } from "@/lib/nav";
import { useOrdersStore } from "@/stores/orders-store";
import { useCan } from "@/hooks/use-can";
import type { OrderStatus } from "@/types";
import { MediaImg } from "@/components/media/media-img";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const createShipment = useOrdersStore((s) => s.createShipment);
  const can = useCan();
  const [status, setStatus] = useState<OrderStatus>(order?.orderStatus ?? "pending");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"cancel" | "refund" | null>(null);

  if (!order) return <EmptyState title="Order not found" />;
  const orderId = order.id;

  async function applyStatus(next: OrderStatus) {
    setBusy(true);
    await updateOrderStatus(orderId, next);
    toast.success(`Order marked ${labelize(next)}`);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title={order.id}
        description={`${order.customerName} · ${formatDateTime(order.date)}`}
        crumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/orders", label: "Orders" }, { label: order.id }]}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Invoice sent to printer (simulated)")}>Print invoice</Button>
            <Button variant="outline" onClick={() => toast.success("Invoice downloaded (simulated)")}>Download invoice</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="font-display text-xl">Pieces</h2>
            <ul className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <li key={item.sku} className="flex min-w-0 gap-3 border-b border-border/70 pb-3 last:border-0">
                  <MediaImg src={item.image} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover sm:h-20 sm:w-16" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${item.productId}`} className="font-medium hover:underline">{item.title}</Link>
                    <p className="text-xs text-muted-foreground">{item.sku} · {item.color} · {item.size} · ×{item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-xl">Shipment timeline</h2>
            <ol className="mt-4 grid gap-0">
              {order.timeline.map((t, i) => (
                <li key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`size-3 rounded-full ${t.done ? "bg-primary" : "bg-border"}`} />
                    {i < order.timeline.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.done && t.at ? formatDateTime(t.at) : "Pending"}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="grid gap-4 self-start">
          <Card className="p-5">
            <h2 className="font-display text-xl">Customer</h2>
            <p className="mt-2 font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            <Button asChild variant="link" className="px-0">
              <Link href={`/admin/customers/${order.customerId}`}>Open profile</Link>
            </Button>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-xl">Addresses</h2>
            <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">Shipping</p>
            <p className="text-sm">
              {order.shippingAddress.line1}
              {order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="mt-3 text-xs tracking-wide text-muted-foreground uppercase">Billing</p>
            <p className="text-sm">
              {order.billing.line1}
              <br />
              {order.billing.city}, {order.billing.state} {order.billing.postalCode}
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-xl">Payment</h2>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd>−{formatCurrency(order.discount)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{formatCurrency(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd>{formatCurrency(order.tax)}</dd></div>
              <div className="mt-2 flex justify-between font-medium"><dt>Total</dt><dd>{formatCurrency(order.total)}</dd></div>
            </dl>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>{order.paymentMethod}</span>
              <StatusBadge value={order.paymentStatus} />
            </div>
            {order.transactionRef ? <p className="mt-1 font-mono text-xs text-muted-foreground">{order.transactionRef}</p> : null}
          </Card>
          <Card className="grid gap-3 p-5">
            <h2 className="font-display text-xl">Actions</h2>
            <p className="text-sm text-muted-foreground">Fulfilment: {labelize(order.fulfillmentType)}</p>
            {can("Orders", "update") ? (
              <>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{labelize(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={busy} onClick={() => applyStatus(status)}>{busy ? "Updating…" : "Update status"}</Button>
            <Button
              variant="outline"
              onClick={async () => {
                setBusy(true);
                await createShipment(order.id, "Delhivery", `DLV${Math.floor(Math.random() * 90000000)}`);
                toast.success("Shipment created");
                setBusy(false);
              }}
            >
              Create shipment
            </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Your role can view this order but not change fulfilment.</p>
            )}
            {can("Orders", "cancel") ? <Button variant="outline" onClick={() => setConfirm("cancel")}>Cancel order</Button> : null}
            {can("Orders", "refund") ? <Button variant="destructive" onClick={() => setConfirm("refund")}>Process refund</Button> : null}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "cancel"}
        onOpenChange={() => setConfirm(null)}
        title="Cancel this order?"
        description="The customer will be notified in a live system. Here it only updates the demo."
        confirmLabel="Cancel order"
        destructive
        loading={busy}
        onConfirm={async () => {
          await applyStatus("cancelled");
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "refund"}
        onOpenChange={() => setConfirm(null)}
        title="Refund this order?"
        description="Simulated refund to the original payment method."
        confirmLabel="Refund"
        destructive
        loading={busy}
        onConfirm={async () => {
          await applyStatus("refunded");
          setConfirm(null);
        }}
      />
    </div>
  );
}
