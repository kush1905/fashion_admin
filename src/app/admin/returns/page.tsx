"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { useOrdersStore } from "@/stores/orders-store";
import type { ReturnStatus } from "@/types";
import { MediaImg } from "@/components/media/media-img";

const flow: ReturnStatus[] = ["requested", "approved", "pickup_scheduled", "returned", "inspected", "refund_initiated", "refund_completed"];

export default function ReturnsPage() {
  const returns = useOrdersStore((s) => s.returns);
  const update = useOrdersStore((s) => s.updateReturnStatus);
  const [filter, setFilter] = useState("all");
  const rows = returns.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      <PageHeader title="Returns & refunds" description="From request to inspection to money back." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Returns" }]} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...flow, "rejected"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s.replace(/_/g, " ")}
          </Button>
        ))}
      </div>
      {rows.length === 0 ? <EmptyState title="No returns in this state" /> : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Return</Th>
              <Th>Order</Th>
              <Th>Product</Th>
              <Th>Customer</Th>
              <Th>Reason</Th>
              <Th>Refund</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <Td className="font-medium"><Link href={`/admin/returns/${r.id}`} className="hover:underline">{r.id}</Link><p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p></Td>
                <Td><Link href={`/admin/orders/${r.orderId}`} className="hover:underline">{r.orderId}</Link></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <MediaImg src={r.image} alt="" className="size-10 rounded object-cover" />
                    <span>{r.productTitle}</span>
                  </div>
                </Td>
                <Td>{r.customerName}</Td>
                <Td>{r.reason}</Td>
                <Td>{formatCurrency(r.refundAmount)}</Td>
                <Td><StatusBadge value={r.status} /></Td>
                <Td>
                  {r.status !== "refund_completed" && r.status !== "rejected" ? (
                    <Button size="sm" variant="outline" onClick={async () => {
                      const i = flow.indexOf(r.status);
                      await update(r.id, flow[Math.min(i + 1, flow.length - 1)]);
                      toast.success("Return updated");
                    }}>Advance</Button>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
