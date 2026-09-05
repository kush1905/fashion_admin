"use client";

import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api/client";
import { useCatalogStore } from "@/stores/catalog-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useCustomersStore } from "@/stores/customers-store";
import { useOpsStore } from "@/stores/ops-store";
import { useUiStore } from "@/stores/ui-store";
import type { DatabaseShape } from "@/services/api/bootstrap";
import { Button } from "@/components/ui/button";

function applyBootstrap(data: DatabaseShape) {
  useCatalogStore.getState().hydrate({
    products: data.products,
    categories: data.categories,
    collections: data.collections,
    movements: data.movements,
  });
  useOrdersStore.getState().hydrate({
    orders: data.orders,
    shipments: data.shipments,
    pickups: data.pickups,
    returns: data.returns,
  });
  useCustomersStore.getState().hydrate({
    customers: data.customers,
    carts: data.carts,
    wishlists: data.wishlists,
    reviews: data.reviews,
  });
  useOpsStore.getState().hydrate({
    banners: data.banners,
    homepage: data.homepage,
    promotions: data.promotions,
    coupons: data.coupons,
    pages: data.pages,
    roles: data.roles,
    staff: data.staff,
    settings: data.settings,
  });
  useUiStore.getState().hydrateActivity(data.activity);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const data = await api<DatabaseShape>("/admin/bootstrap");
      applyBootstrap(data);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-[min(24rem,calc(100vw-2rem))] space-y-3">
          <p className="font-display text-2xl">Loading atelier data</p>
          <p className="text-sm text-muted-foreground">Connecting the admin to the shared catalogue.</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-3 text-center">
          <p className="font-display text-2xl">API unavailable</p>
          <p className="text-sm text-muted-foreground">
            The admin could not reach the atelier API. Confirm the backend is running on port 4000, then retry.
          </p>
          {error ? <p className="text-xs text-muted-foreground">{error}</p> : null}
          <Button onClick={() => void load()}>Retry connection</Button>
        </div>
      </div>
    );
  }

  return children;
}
