"use client";

import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/products/product-editor";
import { EmptyState } from "@/components/ui/layout";
import { useCatalogStore } from "@/stores/catalog-store";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const exists = useCatalogStore((s) => s.products.some((p) => p.id === id));
  if (!exists) return <EmptyState title="Product not found" description="It may have been removed from this demo session." />;
  return <ProductEditor productId={id} />;
}
