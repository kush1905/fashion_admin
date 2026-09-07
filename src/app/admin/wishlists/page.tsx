"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatDate } from "@/lib/format";
import { useCatalogStore } from "@/stores/catalog-store";
import { useCustomersStore } from "@/stores/customers-store";
import { KpiCard } from "@/components/shared/kpi-card";
import { MediaImg } from "@/components/media/media-img";

export default function WishlistsPage() {
  const wishlists = useCustomersStore((s) => s.wishlists);
  const products = useCatalogStore((s) => s.products);
  const byProduct = products
    .map((p) => ({ product: p, count: wishlists.filter((w) => w.productId === p.id).length }))
    .filter((x) => x.count)
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <PageHeader title="Wishlists" description="What people are holding, not yet buying." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Wishlists" }]} />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Saved items" value={String(wishlists.length)} />
        <KpiCard label="Unique products" value={String(byProduct.length)} />
        <KpiCard label="Est. conversion" value="18%" hint="demo figure" />
      </div>
      <h2 className="mb-3 font-display text-xl">Most wishlisted</h2>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {byProduct.slice(0, 4).map(({ product, count }) => (
          <Card key={product.id} className="flex items-center gap-3 p-3">
            <MediaImg src={product.images[0]} alt="" className="h-16 w-12 rounded object-cover" />
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-sm text-muted-foreground">{count} saves</p>
            </div>
          </Card>
        ))}
      </div>
      <TableWrap>
        <thead><tr><Th>Customer</Th><Th>Product</Th><Th>Added</Th></tr></thead>
        <tbody>
          {wishlists.map((w) => (
            <tr key={w.id}>
              <Td>{w.customerName}</Td>
              <Td>{products.find((p) => p.id === w.productId)?.title}</Td>
              <Td>{formatDate(w.addedAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
