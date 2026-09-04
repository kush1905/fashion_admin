"use client";

import { create } from "zustand";
import { products as seedProducts, productStock } from "@/data/products";
import { categories as seedCategories, collections as seedCollections } from "@/data/catalog";
import { inventoryMovements as seedMovements } from "@/data/ops";
import { mockDelay } from "@/lib/utils";
import type { Category, Collection, InventoryMovement, Product, ProductStatus } from "@/types";

type CatalogState = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  movements: InventoryMovement[];
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  bulkStatus: (ids: string[], status: ProductStatus) => Promise<void>;
  setCategoryHidden: (id: string, hidden: boolean) => Promise<void>;
  reorderCategories: (ids: string[]) => void;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  adjustStock: (sku: string, quantity: number, reason: string, notes?: string) => Promise<void>;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: seedProducts,
  categories: seedCategories,
  collections: seedCollections,
  movements: seedMovements,
  updateProduct: async (id, patch) => {
    await mockDelay();
    set({
      products: get().products.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    });
  },
  saveProduct: async (product) => {
    await mockDelay(700);
    const exists = get().products.some((p) => p.id === product.id);
    set({
      products: exists
        ? get().products.map((p) => (p.id === product.id ? { ...product, updatedAt: new Date().toISOString() } : p))
        : [{ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...get().products],
    });
  },
  deleteProducts: async (ids) => {
    await mockDelay();
    set({ products: get().products.filter((p) => !ids.includes(p.id)) });
  },
  bulkStatus: async (ids, status) => {
    await mockDelay();
    set({
      products: get().products.map((p) => (ids.includes(p.id) ? { ...p, status } : p)),
    });
  },
  setCategoryHidden: async (id, hidden) => {
    await mockDelay(280);
    set({
      categories: get().categories.map((c) => (c.id === id ? { ...c, hidden } : c)),
    });
  },
  reorderCategories: (ids) => {
    set({
      categories: get().categories.map((c) => {
        const idx = ids.indexOf(c.id);
        return idx === -1 ? c : { ...c, order: idx };
      }),
    });
  },
  saveCategory: async (category) => {
    await mockDelay();
    const exists = get().categories.some((c) => c.id === category.id);
    set({
      categories: exists
        ? get().categories.map((c) => (c.id === category.id ? category : c))
        : [...get().categories, category],
    });
  },
  deleteCategory: async (id) => {
    await mockDelay();
    set({ categories: get().categories.filter((c) => c.id !== id && c.parentId !== id) });
  },
  saveCollection: async (collection) => {
    await mockDelay();
    const exists = get().collections.some((c) => c.id === collection.id);
    set({
      collections: exists
        ? get().collections.map((c) => (c.id === collection.id ? collection : c))
        : [...get().collections, collection],
    });
  },
  deleteCollection: async (id) => {
    await mockDelay();
    set({ collections: get().collections.filter((c) => c.id !== id) });
  },
  adjustStock: async (sku, quantity, reason, notes) => {
    await mockDelay(600);
    set({
      products: get().products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => (v.sku === sku ? { ...v, stock: Math.max(0, v.stock + quantity) } : v)),
      })),
      movements: [
        {
          id: `mv_${Date.now()}`,
          sku,
          productId: get().products.find((p) => p.variants.some((v) => v.sku === sku))?.id ?? "",
          type: quantity > 0 ? "restock" : "adjustment",
          quantity,
          reason,
          notes,
          createdAt: new Date().toISOString(),
          user: "Priya Shah",
        },
        ...get().movements,
      ],
    });
  },
}));

export function stockHealth(stock: number, threshold = 3): "healthy" | "low" | "out" {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "healthy";
}

export { productStock };
