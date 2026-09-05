"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/layout";
import { formatCurrency } from "@/lib/format";
import { useOrdersStore } from "@/stores/orders-store";
import type { ReturnStatus } from "@/types";
import { MediaImg } from "@/components/media/media-img";

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const item = useOrdersStore((s) => s.returns.find((r) => r.id === id));
  const update = useOrdersStore((s) => s.updateReturnStatus);
  if (!item) return <EmptyState title="Return not found" />;
  const returnId = item.id;

  async function act(status: ReturnStatus, label: string) {
    await update(returnId, status);
    toast.success(label);
  }

  return (
    <div>
      <PageHeader
        title={item.id}
        description={`${item.customerName} · ${item.orderId}`}
        crumbs={[{ href: "/admin/returns", label: "Returns" }, { label: item.id }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <MediaImg src={item.image} alt="" className="h-56 w-full rounded-lg object-cover" />
          <h2 className="mt-4 font-display text-xl">{item.productTitle}</h2>
          <p className="text-sm text-muted-foreground">{item.sku}</p>
          <p className="mt-3 text-sm"><span className="text-muted-foreground">Reason · </span>{item.reason}</p>
          <p className="mt-2 text-sm leading-relaxed">{item.comment}</p>
          <p className="mt-4 text-sm">Refund due {formatCurrency(item.refundAmount)}</p>
          <div className="mt-2"><StatusBadge value={item.status} /></div>
        </Card>
        <Card className="grid gap-2 p-5 self-start">
          <h2 className="font-display text-xl">Actions</h2>
          <Button onClick={() => act("approved", "Return approved")}>Approve</Button>
          <Button variant="outline" onClick={() => act("rejected", "Return rejected")}>Reject</Button>
          <Button variant="outline" onClick={() => act("pickup_scheduled", "Pickup scheduled")}>Schedule pickup</Button>
          <Button variant="outline" onClick={() => act("refund_completed", "Refund completed")}>Complete refund</Button>
        </Card>
      </div>
    </div>
  );
}
