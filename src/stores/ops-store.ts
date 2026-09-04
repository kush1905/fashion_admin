"use client";

import { create } from "zustand";
import {
  banners as seedBanners,
  contentPages as seedPages,
  coupons as seedCoupons,
  homepageSections as seedHome,
  promotions as seedPromos,
  roles as seedRoles,
  settings as seedSettings,
  staff as seedStaff,
} from "@/data/ops";
import { mockDelay } from "@/lib/utils";
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

export const useOpsStore = create<OpsState>((set, get) => ({
  banners: seedBanners,
  promotions: seedPromos,
  coupons: seedCoupons,
  homepage: seedHome,
  pages: seedPages,
  roles: seedRoles,
  staff: seedStaff,
  settings: seedSettings,
  saveBanner: async (banner) => {
    await mockDelay();
    const exists = get().banners.some((b) => b.id === banner.id);
    set({ banners: exists ? get().banners.map((b) => (b.id === banner.id ? banner : b)) : [banner, ...get().banners] });
  },
  saveCoupon: async (coupon) => {
    await mockDelay();
    const exists = get().coupons.some((c) => c.id === coupon.id);
    set({ coupons: exists ? get().coupons.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...get().coupons] });
  },
  toggleCoupon: async (id) => {
    await mockDelay(250);
    set({ coupons: get().coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) });
  },
  toggleSection: async (id) => {
    await mockDelay(220);
    set({ homepage: get().homepage.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)) });
  },
  reorderHomepage: (ids) => {
    const map = new Map(get().homepage.map((s) => [s.id, s]));
    set({ homepage: ids.map((id) => map.get(id)!).filter(Boolean) });
  },
  savePage: async (page) => {
    await mockDelay();
    set({ pages: get().pages.map((p) => (p.id === page.id ? page : p)) });
  },
  updateSettings: async (patch) => {
    await mockDelay();
    set({ settings: { ...get().settings, ...patch } });
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
  },
  saveStaff: async (user) => {
    await mockDelay();
    const exists = get().staff.some((s) => s.id === user.id);
    set({ staff: exists ? get().staff.map((s) => (s.id === user.id ? user : s)) : [user, ...get().staff] });
  },
}));
