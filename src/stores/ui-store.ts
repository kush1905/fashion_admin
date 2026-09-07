"use client";

import { create } from "zustand";
import type { ActivityItem } from "@/types";

type Notice = { id: string; title: string; body: string; at: string; read: boolean };

type UiState = {
  collapsed: boolean;
  mobileOpen: boolean;
  notices: Notice[];
  activity: ActivityItem[];
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  markAllRead: () => void;
  hydrateActivity: (activity: ActivityItem[]) => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  collapsed: false,
  mobileOpen: false,
  activity: [],
  notices: [
    { id: "n1", title: "Order needs packing", body: "ORD-18402 is packed and waiting on a label.", at: "12 min ago", read: false },
    { id: "n2", title: "Low stock", body: "Navy Nameera skirt set, size L is out of stock.", at: "1 hr ago", read: false },
    { id: "n3", title: "Return waiting", body: "Ananya Mehra requested a return on the sage anarkali.", at: "2 days ago", read: false },
    { id: "n4", title: "Review pending", body: "Meera Kapoor’s gown review is awaiting approval.", at: "2 days ago", read: true },
  ],
  toggleCollapsed: () => set({ collapsed: !get().collapsed }),
  setMobileOpen: (open) => set({ mobileOpen: open }),
  markAllRead: () => set({ notices: get().notices.map((n) => ({ ...n, read: true })) }),
  hydrateActivity: (activity) => set({ activity }),
}));
