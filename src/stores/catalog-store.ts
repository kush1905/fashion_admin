"use client";

import { create } from "zustand";
import { api } from "@/services/api/client";
import { productStock } from "@/data/products";
import type { Category, Collection, InventoryMovement, Product, ProductStatus } from "@/types";

type CatalogState = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  movements: InventoryMovement[];
  hydrated: boolean;
  hydrate: (payload: Partial<Pick<CatalogState, "products" | "categories" | "collections" | "movements">>) => void;
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
  products: [],
  categories: [],
  collections: [],
  movements: [],
  hydrated: false,
  hydrate: (payload) => set({ ...payload, hydrated: true }),
  updateProduct: async (id, patch) => {
    const product = await api<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    set({ products: get().products.map((p) => (p.id === id ? product : p)) });
  },
  saveProduct: async (product) => {
    const exists = get().products.some((p) => p.id === product.id);
    const saved = exists
      ? await api<Product>(`/products/${product.id}`, { method: "PUT", body: JSON.stringify(product) })
      : await api<Product>("/products", { method: "POST", body: JSON.stringify(product) });
    set({
      products: exists
        ? get().products.map((p) => (p.id === product.id ? saved : p))
        : [saved, ...get().products],
    });
  },
  deleteProducts: async (ids) => {
    await api("/products/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) });
    set({ products: get().products.filter((p) => !ids.includes(p.id)) });
  },
  bulkStatus: async (ids, status) => {
    await api("/products/bulk-status", { method: "POST", body: JSON.stringify({ ids, status }) });
    set({ products: get().products.map((p) => (ids.includes(p.id) ? { ...p, status } : p)) });
  },
  setCategoryHidden: async (id, hidden) => {
    const category = get().categories.find((c) => c.id === id);
    if (!category) return;
    const saved = await api<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...category, hidden }),
    });
    set({ categories: get().categories.map((c) => (c.id === id ? saved : c)) });
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
    const exists = get().categories.some((c) => c.id === category.id);
    const saved = exists
      ? await api<Category>(`/categories/${category.id}`, { method: "PUT", body: JSON.stringify(category) })
      : await api<Category>("/categories", { method: "POST", body: JSON.stringify(category) });
    set({
      categories: exists
        ? get().categories.map((c) => (c.id === category.id ? saved : c))
        : [...get().categories, saved],
    });
  },
  deleteCategory: async (id) => {
    await api(`/categories/${id}`, { method: "DELETE" });
    set({ categories: get().categories.filter((c) => c.id !== id && c.parentId !== id) });
  },
  saveCollection: async (collection) => {
    const exists = get().collections.some((c) => c.id === collection.id);
    const saved = exists
      ? await api<Collection>(`/collections/${collection.id}`, { method: "PUT", body: JSON.stringify(collection) })
      : await api<Collection>("/collections", { method: "POST", body: JSON.stringify(collection) });
    set({
      collections: exists
        ? get().collections.map((c) => (c.id === collection.id ? saved : c))
        : [...get().collections, saved],
    });
  },
  deleteCollection: async (id) => {
    await api(`/collections/${id}`, { method: "DELETE" });
    set({ collections: get().collections.filter((c) => c.id !== id) });
  },
  adjustStock: async (sku, quantity, reason, notes) => {
    const result = await api<{ product: Product; movement: InventoryMovement }>(`/inventory/${encodeURIComponent(sku)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity, reason, notes }),
    });
    set({
      products: get().products.map((p) => (p.id === result.product.id ? result.product : p)),
      movements: [result.movement, ...get().movements],
    });
  },
}));

export function stockHealth(stock: number, threshold = 3): "healthy" | "low" | "out" {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "healthy";
}

export { productStock };
