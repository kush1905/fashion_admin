import type { PermissionAction } from "@/types";
import { roles } from "@/data/ops";
import { NAV, type NavGroup } from "@/lib/nav";

export function permissionsFor(roleId: string) {
  return roles.find((role) => role.id === roleId)?.permissions ?? {};
}

export function can(roleId: string | undefined, module: string, action: PermissionAction | string) {
  if (!roleId) return false;
  if (roleId === "role_super") return true;
  return (permissionsFor(roleId)[module] ?? []).includes(action as PermissionAction);
}

export function canAccessPath(roleId: string | undefined, pathname: string) {
  if (!roleId) return false;
  const p = pathname.replace(/\/$/, "") || "/";

  if (p === "/admin") return true;
  if (p === "/admin/products/new") return can(roleId, "Products", "create");
  if (p.startsWith("/admin/products")) return can(roleId, "Products", "view");
  if (p.startsWith("/admin/orders")) return can(roleId, "Orders", "view");
  if (p.startsWith("/admin/inventory")) return can(roleId, "Inventory", "view");
  if (p.startsWith("/admin/categories") || p.startsWith("/admin/collections")) {
    return can(roleId, "Products", "create") || can(roleId, "Products", "edit");
  }
  if (p.startsWith("/admin/reviews")) return can(roleId, "Customers", "edit");
  if (p.startsWith("/admin/customers") || p.startsWith("/admin/wishlists") || p.startsWith("/admin/carts")) {
    return can(roleId, "Customers", "view");
  }
  if (
    p.startsWith("/admin/homepage") ||
    p.startsWith("/admin/banners") ||
    p.startsWith("/admin/promotions") ||
    p.startsWith("/admin/coupons")
  ) {
    return can(roleId, "Marketing", "view");
  }
  if (p.startsWith("/admin/shipments") || p.startsWith("/admin/pickups") || p.startsWith("/admin/delivery")) {
    return can(roleId, "Orders", "update");
  }
  if (p.startsWith("/admin/returns")) return can(roleId, "Orders", "update") || can(roleId, "Orders", "refund");
  if (p.startsWith("/admin/analytics")) return can(roleId, "Settings", "view");
  if (p.startsWith("/admin/content")) return can(roleId, "Marketing", "create") || can(roleId, "Marketing", "publish");
  if (p.startsWith("/admin/users") || p.startsWith("/admin/roles")) return can(roleId, "Settings", "edit");
  if (p.startsWith("/admin/settings")) return can(roleId, "Settings", "view");
  return false;
}

export function navForRole(roleId: string | undefined): NavGroup[] {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessPath(roleId, item.href)),
  })).filter((group) => group.items.length > 0);
}
