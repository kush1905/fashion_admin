"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { canAccessPath } from "@/lib/permissions";
import { useAuthStore } from "@/stores/auth-store";

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const roleId = useAuthStore((s) => s.user?.roleId);
  const allowed = canAccessPath(roleId, pathname);

  useEffect(() => {
    if (roleId && !allowed) {
      toast.error("This area isn’t assigned to your role.");
      router.replace("/admin");
    }
  }, [allowed, roleId, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
