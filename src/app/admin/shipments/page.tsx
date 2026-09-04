"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatDate } from "@/lib/format";
import { useOrdersStore } from "@/stores/orders-store";

export default function ShipmentsPage() {
  const shipments = useOrdersStore((s) => s.shipments);
  const update = useOrdersStore((s) => s.updateShipmentStatus);
  return (
    <div>
      <PageHeader title="Shipments" description="Courier, tracking, and where the parcel actually is." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Shipments" }]} />
      {shipments.length === 0 ? <EmptyState title="No shipments yet" /> : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Shipment</Th>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Courier</Th>
              <Th>Tracking</Th>
              <Th>Dispatch</Th>
              <Th>ETA</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium">{s.id}</Td>
                <Td><Link className="hover:underline" href={`/admin/orders/${s.orderId}`}>{s.orderId}</Link></Td>
                <Td>{s.customerName}<p className="text-xs text-muted-foreground">{s.location}</p></Td>
                <Td>{s.courier}</Td>
                <Td className="font-mono text-xs">{s.trackingNumber}</Td>
                <Td>{formatDate(s.dispatchDate)}</Td>
                <Td>{formatDate(s.eta)}</Td>
                <Td><StatusBadge value={s.status} /></Td>
                <Td>
                  <Button size="sm" variant="outline" onClick={async () => {
                    const next = s.status === "label_created" ? "dispatched" : s.status === "dispatched" ? "in_transit" : s.status === "in_transit" ? "out_for_delivery" : "delivered";
                    await update(s.id, next);
                    toast.success(`Moved to ${next.replace(/_/g, " ")}`);
                  }}>Advance</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
