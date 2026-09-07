"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/layout";
import { useOpsStore } from "@/stores/ops-store";

export default function PromotionsPage() {
  const promotions = useOpsStore((s) => s.promotions);
  return (
    <div>
      <PageHeader title="Promotions" description="Discount campaigns, featured products, and category pushes." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Promotions" }]} />
      <div className="grid gap-3 md:grid-cols-2">
        {promotions.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl">{p.name}</h2>
              <StatusBadge value={p.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{p.type}{p.value ? ` · ${p.value}` : ""}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.startDate} → {p.endDate}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
