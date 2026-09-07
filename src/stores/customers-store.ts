"use client";

import { create } from "zustand";
import { api } from "@/services/api/client";
import type { Cart, Customer, Review, ReviewStatus, WishlistEntry } from "@/types";

type CustomersState = {
  customers: Customer[];
  wishlists: WishlistEntry[];
  carts: Cart[];
  reviews: Review[];
  hydrate: (payload: Partial<Pick<CustomersState, "customers" | "wishlists" | "carts" | "reviews">>) => void;
  updateReview: (id: string, patch: Partial<Review>) => Promise<void>;
  setReviewStatus: (id: string, status: ReviewStatus) => Promise<void>;
  markCartReminded: (id: string) => Promise<void>;
};

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  wishlists: [],
  carts: [],
  reviews: [],
  hydrate: (payload) => set(payload),
  updateReview: async (id, patch) => {
    if (patch.status) {
      const review = await api<Review>(`/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: patch.status, reply: patch.reply }),
      });
      set({ reviews: get().reviews.map((r) => (r.id === id ? review : r)) });
      return;
    }
    set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  },
  setReviewStatus: async (id, status) => {
    const review = await api<Review>(`/reviews/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    set({ reviews: get().reviews.map((r) => (r.id === id ? review : r)) });
  },
  markCartReminded: async (id) => {
    set({ carts: get().carts.map((c) => (c.id === id ? { ...c, abandoned: c.abandoned } : c)) });
  },
}));
