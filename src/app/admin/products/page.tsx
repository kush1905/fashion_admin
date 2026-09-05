"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/overlay";
import { EmptyState, TableWrap, Td, Th } from "@/components/ui/layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { assignableCategories, categoryPath } from "@/lib/catalog";
import { productStock, useCatalogStore } from "@/stores/catalog-store";
import { useCan } from "@/hooks/use-can";
import type { ProductStatus } from "@/types";
import { MediaImg } from "@/components/media/media-img";

export default function ProductsPage() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const collections = useCatalogStore((s) => s.collections);
  const bulkStatus = useCatalogStore((s) => s.bulkStatus);
  const deleteProducts = useCatalogStore((s) => s.deleteProducts);
  const can = useCan();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [collection, setCollection] = useState("all");
  const [status, setStatus] = useState("all");
  const [stock, setStock] = useState("all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const pageSize = 8;

  const colors = [...new Set(products.flatMap((p) => p.colors.map((c) => c.name)))];
  const sizes = [...new Set(products.flatMap((p) => p.sizes))];

  const filtered = useMemo(() => {
    let rows = products.filter((p) => {
      const text = `${p.title} ${p.sku}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (category !== "all" && p.categoryId !== category) return false;
      if (collection !== "all" && !p.collectionIds.includes(collection)) return false;
      if (status !== "all" && p.status !== status) return false;
      const units = productStock(p);
      if (stock === "out" && units > 0) return false;
      if (stock === "low" && (units === 0 || units > 3)) return false;
      if (stock === "in" && units === 0) return false;
      if (size !== "all" && !p.sizes.includes(size)) return false;
      if (color !== "all" && !p.colors.some((c) => c.name === color)) return false;
      return true;
    });
    if (sort === "price") rows = [...rows].sort((a, b) => b.price - a.price);
    if (sort === "stock") rows = [...rows].sort((a, b) => productStock(a) - productStock(b));
    if (sort === "newest") rows = [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return rows;
  }, [products, q, category, collection, status, stock, size, color, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allOnPage = rows.every((r) => selected.includes(r.id)) && rows.length > 0;

  async function apply(statusValue: ProductStatus) {
    setBusy(true);
    await bulkStatus(selected, statusValue);
    toast.success(`${selected.length} products updated`);
    setSelected([]);
    setBusy(false);
  }

  async function onDelete() {
    setBusy(true);
    await deleteProducts(selected);
    toast.success("Products archived from the catalogue");
    setSelected([]);
    setConfirm(false);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Catalogue, variants, and visibility for the shop."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Products" }]}
        actions={
          can("Products", "create") ? (
            <Button asChild>
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-8">
        <Input placeholder="Search title or SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="sm:col-span-2 xl:col-span-2" />
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {assignableCategories(categories).map((c) => (
              <SelectItem key={c.id} value={c.id}>{categoryPath(categories, c.id)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={collection} onValueChange={(v) => { setCollection(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Collection" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {["all", "published", "draft", "scheduled", "archived"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={(v) => { setStock(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any stock</SelectItem>
            <SelectItem value="in">In stock</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="out">Out</SelectItem>
          </SelectContent>
        </Select>
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any size</SelectItem>
            {sizes.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={color} onValueChange={setColor}>
          <SelectTrigger><SelectValue placeholder="Colour" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any colour</SelectItem>
            {colors.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected.length > 0 && can("Products", "edit") ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <span className="mr-2">{selected.length} selected</span>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => apply("published")}>Publish</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => apply("draft")}>Unpublish</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => apply("archived")}>Archive</Button>
          {can("Products", "delete") ? (
            <Button size="sm" variant="destructive" disabled={busy} onClick={() => setConfirm(true)}>Delete</Button>
          ) : null}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="No products match your filters" description="Clear search or status to see the full catalogue." />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-10">
                <Checkbox
                  checked={allOnPage}
                  onCheckedChange={(v) => setSelected(v ? [...new Set([...selected, ...rows.map((r) => r.id)])] : selected.filter((id) => !rows.some((r) => r.id === id)))}
                />
              </Th>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Added</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <Td>
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={(v) => setSelected(v ? [...selected, p.id] : selected.filter((id) => id !== p.id))}
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <MediaImg src={p.images[0]} alt="" className="size-12 rounded-md object-cover" />
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                      <p className="text-xs text-muted-foreground">{p.colors.map((c) => c.name).join(" · ")}</p>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{p.sku}</Td>
                <Td className="text-muted-foreground text-xs">{categoryPath(categories, p.categoryId) || "—"}</Td>
                <Td>{formatCurrency(p.price)}</Td>
                <Td>{productStock(p)}</Td>
                <Td><StatusBadge value={p.status} /></Td>
                <Td className="text-muted-foreground">{formatDate(p.createdAt)}</Td>
                <Td>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/products/${p.id}`}>{can("Products", "edit") ? "Edit" : "View"}</Link>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-muted-foreground">
            {page} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete selected products?"
        description="They will be removed from the catalogue in this demo. This is a simulated delete."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={onDelete}
      />
    </div>
  );
}
