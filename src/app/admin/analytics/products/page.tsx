"use client";

import { PageHeader } from "@/components/shared/page-header";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency } from "@/lib/format";
import { categories } from "@/data/catalog";
import { productStock, useCatalogStore } from "@/stores/catalog-store";
import { MediaImg } from "@/components/media/media-img";

export default function ProductAnalyticsPage() {
  const products = useCatalogStore((s) => s.products);
  const ranked = [...products].map((p) => ({ ...p, units: p.reviewCount + 6, revenue: (p.reviewCount + 6) * p.price })).sort((a, b) => b.revenue - a.revenue);
  const byCat = categories
    .filter((c) => c.productCount && !c.parentId)
    .map((c) => ({ name: c.name, count: c.productCount }));

  return (
    <div>
      <PageHeader title="Product analytics" description="What moves, what sits, and which families carry the season." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Product analytics" }]} />
      <h2 className="mb-3 font-display text-xl">Best sellers</h2>
      <TableWrap>
        <thead><tr><Th>Product</Th><Th>Category</Th><Th>Units</Th><Th>Revenue</Th><Th>Stock</Th></tr></thead>
        <tbody>
          {ranked.slice(0, 8).map((p) => (
            <tr key={p.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <MediaImg src={p.images[0]} alt="" className="size-10 rounded object-cover" />
                  {p.title}
                </div>
              </Td>
              <Td>{categories.find((c) => c.id === p.categoryId)?.name}</Td>
              <Td>{p.units}</Td>
              <Td>{formatCurrency(p.revenue)}</Td>
              <Td>{productStock(p)}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <h2 className="mt-8 mb-3 font-display text-xl">Slow movers</h2>
      <TableWrap>
        <thead><tr><Th>Product</Th><Th>Units</Th><Th>Status</Th></tr></thead>
        <tbody>
          {ranked.slice(-4).map((p) => (
            <tr key={p.id}>
              <Td>{p.title}</Td>
              <Td>{p.units}</Td>
              <Td>{p.status}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <h2 className="mt-8 mb-3 font-display text-xl">Category mix</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {byCat.map((c) => (
          <li key={c.name} className="flex justify-between rounded-lg border bg-card px-4 py-3 text-sm">
            <span>{c.name}</span>
            <span className="text-muted-foreground">{c.count} live pieces</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
