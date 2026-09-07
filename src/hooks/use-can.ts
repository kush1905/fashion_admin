"use client";

import { useAuthStore } from "@/stores/auth-store";
import { can } from "@/lib/permissions";

export function useCan() {
  const roleId = useAuthStore((s) => s.user?.roleId);
  return (module: string, action: string) => can(roleId, module, action);
}
