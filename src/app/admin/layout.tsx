"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <RouteGuard>
        <AdminShell>{children}</AdminShell>
      </RouteGuard>
    </AuthGate>
  );
}
