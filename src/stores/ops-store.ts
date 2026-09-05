"use client";

import { create } from "zustand";
import { api } from "@/services/api/client";
import type { Banner, ContentPage, Coupon, HomepageSection, Promotion, Role, StaffUser, StoreSettings } from "@/types";

type OpsState = {
  banners: Banner[];
  promotions: Promotion[];
  coupons: Coupon[];
  homepage: HomepageSection[];
  pages: ContentPage[];
  roles: Role[];
  staff: StaffUser[];
  settings: StoreSettings;
  hydrate: (payload: Partial<Omit<OpsState, "hydrate" | "saveBanner" | "saveCoupon" | "toggleCoupon" | "toggleSection" | "reorderHomepage" | "savePage" | "updateSettings" | "togglePermission" | "saveStaff">>) => void;
  saveBanner: (banner: Banner) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
  toggleSection: (id: string) => Promise<void>;
  reorderHomepage: (ids: string[]) => void;
  savePage: (page: ContentPage) => Promise<void>;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  togglePermission: (roleId: string, module: string, action: string) => void;
  saveStaff: (user: StaffUser) => Promise<void>;
};

const emptySettings: StoreSettings = {
  storeName: "Reena Rathore",
  email: "",
  phone: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  address: "",
  taxPercent: 12,
  freeShippingThreshold: 15000,
  lowStockThreshold: 3,
};

export const useOpsStore = create<OpsState>((set, get) => ({
  banners: [],
  promotions: [],
  coupons: [],
  homepage: [],
  pages: [],
  roles: [],
  staff: [],
  settings: emptySettings,
  hydrate: (payload) => set(payload),
  saveBanner: async (banner) => {
    const exists = get().banners.some((b) => b.id === banner.id);
    const saved = exists
      ? await api<Banner>(`/banners/${banner.id}`, { method: "PUT", body: JSON.stringify(banner) })
      : await api<Banner>("/banners", { method: "POST", body: JSON.stringify(banner) });
    set({
      banners: exists ? get().banners.map((b) => (b.id === banner.id ? saved : b)) : [saved, ...get().banners],
    });
  },
  saveCoupon: async (coupon) => {
    const saved = await api<Coupon>(`/coupons/${coupon.id}`, { method: "PUT", body: JSON.stringify(coupon) });
    const exists = get().coupons.some((c) => c.id === coupon.id);
    set({
      coupons: exists ? get().coupons.map((c) => (c.id === coupon.id ? saved : c)) : [saved, ...get().coupons],
    });
  },
  toggleCoupon: async (id) => {
    const coupon = await api<Coupon>(`/coupons/${id}/toggle`, { method: "PATCH" });
    set({ coupons: get().coupons.map((c) => (c.id === id ? coupon : c)) });
  },
  toggleSection: async (id) => {
    const section = await api<HomepageSection>(`/homepage/${id}/toggle`, { method: "PATCH" });
    set({ homepage: get().homepage.map((s) => (s.id === id ? section : s)) });
  },
  reorderHomepage: (ids) => {
    const map = new Map(get().homepage.map((s) => [s.id, s]));
    const homepage = ids.map((id) => map.get(id)!).filter(Boolean);
    set({ homepage });
    void api("/homepage", { method: "PUT", body: JSON.stringify({ sections: homepage }) });
  },
  savePage: async (page) => {
    const saved = await api<ContentPage>(`/pages/${page.id}`, { method: "PUT", body: JSON.stringify(page) });
    set({ pages: get().pages.map((p) => (p.id === page.id ? saved : p)) });
  },
  updateSettings: async (patch) => {
    const settings = await api<StoreSettings>("/settings", { method: "PATCH", body: JSON.stringify(patch) });
    set({ settings });
  },
  togglePermission: (roleId, module, action) => {
    set({
      roles: get().roles.map((role) => {
        if (role.id !== roleId) return role;
        const current = role.permissions[module] ?? [];
        const next = current.includes(action as never)
          ? current.filter((a) => a !== action)
          : [...current, action as never];
        return { ...role, permissions: { ...role.permissions, [module]: next } };
      }),
    });
    void api(`/roles/${roleId}/permissions`, { method: "PATCH", body: JSON.stringify({ module, action }) });
  },
  saveStaff: async (user) => {
    const saved = await api<StaffUser>(`/staff/${user.id}`, { method: "PUT", body: JSON.stringify(user) });
    const exists = get().staff.some((s) => s.id === user.id);
    set({ staff: exists ? get().staff.map((s) => (s.id === user.id ? saved : s)) : [saved, ...get().staff] });
  },
}));
