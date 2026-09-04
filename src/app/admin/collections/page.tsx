"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/forms";
import { Card } from "@/components/ui/layout";
import { Sheet, SheetContent } from "@/components/ui/overlay";
import { useCatalogStore } from "@/stores/catalog-store";

export default function CollectionsPage() {
  const collections = useCatalogStore((s) => s.collections);
  const products = useCatalogStore((s) => s.products);
  const saveCollection = useCatalogStore((s) => s.saveCollection);
  const [active, setActive] = useState<string | null>(null);
  const current = collections.find((c) => c.id === active);

  return (
    <div>
      <PageHeader
        title="Collections"
        description="Edits, seasons, and merchandising groups assigned to products."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Collections" }]}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <img src={c.image} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">{c.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
                <StatusBadge value={c.status} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{c.productIds.length} products · {c.season}</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => setActive(c.id)}>
                Assign products
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!current} onOpenChange={() => setActive(null)}>
        <SheetContent className="overflow-y-auto p-5">
          <h2 className="font-display text-2xl">{current?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tick pieces into this edit.</p>
          <ul className="mt-4 grid gap-2">
            {products.map((p) => {
              const on = current?.productIds.includes(p.id) ?? false;
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-md border px-2 py-2">
                  <Checkbox
                    checked={on}
                    onCheckedChange={async (v) => {
                      if (!current) return;
                      const productIds = v ? [...current.productIds, p.id] : current.productIds.filter((id) => id !== p.id);
                      await saveCollection({ ...current, productIds });
                      toast.success("Collection updated");
                    }}
                  />
                  <img src={p.images[0]} alt="" className="size-10 rounded object-cover" />
                  <span className="text-sm">{p.title}</span>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
