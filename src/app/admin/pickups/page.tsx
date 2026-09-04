"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { formatDateTime } from "@/lib/format";
import { useOrdersStore } from "@/stores/orders-store";

const nextStatus = { awaiting: "ready", ready: "picked_up", picked_up: "completed", completed: "completed" } as const;

export default function PickupsPage() {
  const pickups = useOrdersStore((s) => s.pickups);
  const update = useOrdersStore((s) => s.updatePickupStatus);
  return (
    <div>
      <PageHeader title="Pickup orders" description="Flagship and city boutiques — ready, collected, done." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Pickups" }]} />
      <TableWrap>
        <thead>
          <tr>
            <Th>Pickup</Th>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Location</Th>
            <Th>Ready</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {pickups.map((p) => (
            <tr key={p.id}>
              <Td className="font-medium">{p.id}</Td>
              <Td><Link className="hover:underline" href={`/admin/orders/${p.orderId}`}>{p.orderId}</Link></Td>
              <Td>{p.customerName}<p className="text-xs text-muted-foreground">{p.phone}</p></Td>
              <Td>{p.location}</Td>
              <Td>{p.readyAt ? formatDateTime(p.readyAt) : "—"}</Td>
              <Td><StatusBadge value={p.status} /></Td>
              <Td>
                {p.status !== "completed" ? (
                  <Button size="sm" variant="outline" onClick={async () => {
                    await update(p.id, nextStatus[p.status]);
                    toast.success("Pickup updated");
                  }}>Mark {nextStatus[p.status].replace(/_/g, " ")}</Button>
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
