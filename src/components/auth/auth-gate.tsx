"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated();
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated());
    const t = window.setTimeout(() => setHydrated(), 600);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, [setHydrated]);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Opening Backstage…
      </div>
    );
  }

  return <>{children}</>;
}
