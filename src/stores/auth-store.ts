"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_ACCOUNTS, type SessionUser } from "@/lib/demo-auth";
import { mockDelay } from "@/lib/utils";

type AuthState = {
  user: SessionUser | null;
  hydrated: boolean;
  setHydrated: () => void;
  login: (identifier: string, password: string) => Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }>;
  logout: () => void;
};

function toSession(account: (typeof DEMO_ACCOUNTS)[number]): SessionUser {
  return {
    id: account.staffId,
    name: account.name,
    email: account.email,
    role: account.role,
    roleId: account.roleId,
    initials: account.initials,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      login: async (identifier, password) => {
        await mockDelay(620);
        const id = identifier.trim().toLowerCase();
        const account = DEMO_ACCOUNTS.find(
          (a) => a.staffId.toLowerCase() === id || a.email.toLowerCase() === id,
        );
        if (!account || account.password !== password) {
          return { ok: false, error: "Those credentials don’t match a demo Super Admin or staff account." };
        }
        const user = toSession(account);
        set({ user });
        return { ok: true, user };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "backstage-auth-v2",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
