"use client";

import { create } from "zustand";
import { carts as seedCarts, customers as seedCustomers, reviews as seedReviews, wishlists as seedWishlists } from "@/data/customers";
import { mockDelay } from "@/lib/utils";
import type { Review, ReviewStatus } from "@/types";

type CustomersState = {
  customers: typeof seedCustomers;
  wishlists: typeof seedWishlists;
  carts: typeof seedCarts;
  reviews: Review[];
  updateReview: (id: string, patch: Partial<Review>) => Promise<void>;
  setReviewStatus: (id: string, status: ReviewStatus) => Promise<void>;
  markCartReminded: (id: string) => Promise<void>;
};

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: seedCustomers,
  wishlists: seedWishlists,
  carts: seedCarts,
  reviews: seedReviews,
  updateReview: async (id, patch) => {
    await mockDelay();
    set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  },
  setReviewStatus: async (id, status) => {
    await mockDelay(320);
    set({ reviews: get().reviews.map((r) => (r.id === id ? { ...r, status } : r)) });
  },
  markCartReminded: async (id) => {
    await mockDelay(600);
    set({
      carts: get().carts.map((c) => (c.id === id ? { ...c, abandoned: c.abandoned } : c)),
    });
  },
}));
