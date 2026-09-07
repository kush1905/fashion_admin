"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/layout";
import { KpiCard } from "@/components/shared/kpi-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useCustomersStore } from "@/stores/customers-store";
import { MediaImg } from "@/components/media/media-img";

export default function CartsPage() {
  const carts = useCustomersStore((s) => s.carts);
  const remind = useCustomersStore((s) => s.markCartReminded);
  const abandoned = carts.filter((c) => c.abandoned);
  return (
    <div>
      <PageHeader title="Carts" description="Open baskets and the ones that walked away." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Carts" }]} />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Abandoned carts" value={String(abandoned.length)} />
        <KpiCard label="Abandoned value" value={formatCurrency(abandoned.reduce((s, c) => s + c.value, 0))} />
        <KpiCard label="Open carts" value={String(carts.filter((c) => !c.abandoned).length)} />
      </div>
      <div className="grid gap-3">
        {carts.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{c.customerName}</p>
                <p className="text-sm text-muted-foreground">{c.customerEmail} · updated {formatDateTime(c.updatedAt)}</p>
                <div className="mt-2"><StatusBadge value={c.abandoned ? "abandoned" : "active"} /></div>
              </div>
              <p className="font-display text-xl">{formatCurrency(c.value)}</p>
            </div>
            <ul className="mt-3 grid gap-2">
              {c.items.map((i) => (
                <li key={i.sku} className="flex items-center gap-2 text-sm">
                  <MediaImg src={i.image} alt="" className="size-10 rounded object-cover" />
                  {i.title} · {i.color} / {i.size} ×{i.quantity}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={async () => { await remind(c.id); toast.success("Reminder queued (simulated)"); }}>Send reminder</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.message(`WhatsApp ${c.customerName} from the studio desk`)}>Contact</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
