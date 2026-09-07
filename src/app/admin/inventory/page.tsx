"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { Sheet, SheetContent } from "@/components/ui/overlay";
import { formatDateTime } from "@/lib/format";
import { stockHealth, useCatalogStore } from "@/stores/catalog-store";
import { useCan } from "@/hooks/use-can";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/forms";
import { MediaImg } from "@/components/media/media-img";

export default function InventoryPage() {
  const products = useCatalogStore((s) => s.products);
  const movements = useCatalogStore((s) => s.movements);
  const adjustStock = useCatalogStore((s) => s.adjustStock);
  const can = useCan();
  const [tab, setTab] = useState("all");
  const [sku, setSku] = useState<string | null>(null);
  const [qty, setQty] = useState("1");
  const [type, setType] = useState("restock");
  const [reason, setReason] = useState("Atelier intake");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    return products.flatMap((p) =>
      p.variants.map((v) => ({
        product: p,
        ...v,
        available: v.stock,
        health: stockHealth(v.stock),
      })),
    );
  }, [products]);

  const filtered = rows.filter((r) => {
    if (tab === "low") return r.health === "low";
    if (tab === "out") return r.health === "out";
    return true;
  });

  const current = rows.find((r) => r.sku === sku);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Available, reserved, and movement history across every SKU."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Inventory" }]}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Units on hand</p>
          <p className="font-display text-2xl">{rows.reduce((s, r) => s + r.stock, 0)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Low stock SKUs</p>
          <p className="font-display text-2xl">{rows.filter((r) => r.health === "low").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Out of stock</p>
          <p className="font-display text-2xl">{rows.filter((r) => r.health === "out").length}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All SKUs</TabsTrigger>
          <TabsTrigger value="low">Low stock</TabsTrigger>
          <TabsTrigger value="out">Out of stock</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState title={tab === "out" ? "Nothing is fully out" : "Inventory is currently healthy"} />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th>Size</Th>
                  <Th>Colour</Th>
                  <Th>Available</Th>
                  <Th>Reserved</Th>
                  <Th>Health</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.sku}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <MediaImg src={r.product.images[0]} alt="" className="size-10 rounded object-cover" />
                        {r.product.title}
                      </div>
                    </Td>
                    <Td className="font-mono text-xs">{r.sku}</Td>
                    <Td>{r.size}</Td>
                    <Td>{r.color}</Td>
                    <Td>{r.available}</Td>
                    <Td>{r.reserved}</Td>
                    <Td><StatusBadge value={r.health} /></Td>
                    <Td>
                      {can("Inventory", "update") ? (
                        <Button size="sm" variant="outline" onClick={() => setSku(r.sku)}>Adjust</Button>
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </TabsContent>
      </Tabs>

      <h2 className="mt-8 font-display text-xl">Stock movement</h2>
      <TableWrap>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>SKU</Th>
            <Th>Type</Th>
            <Th>Qty</Th>
            <Th>Reason</Th>
            <Th>User</Th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <Td className="text-muted-foreground">{formatDateTime(m.createdAt)}</Td>
              <Td className="font-mono text-xs">{m.sku}</Td>
              <Td><StatusBadge value={m.type} /></Td>
              <Td>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</Td>
              <Td>{m.reason}</Td>
              <Td>{m.user}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <Sheet open={!!sku} onOpenChange={() => setSku(null)}>
        <SheetContent className="overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <h2 className="font-display text-2xl">Adjust stock</h2>
          <p className="text-sm text-muted-foreground">{current?.product.title} · {current?.sku}</p>
          <div className="mt-4 grid gap-3">
            <Field label="Type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="adjustment">Adjustment down</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quantity"><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
            <Field label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            <Button
              disabled={busy}
              onClick={async () => {
                if (!sku) return;
                setBusy(true);
                const n = Number(qty) * (type === "restock" ? 1 : -1);
                await adjustStock(sku, n, reason, notes);
                toast.success("Stock updated");
                setBusy(false);
                setSku(null);
              }}
            >
              {busy ? "Saving…" : "Apply adjustment"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
