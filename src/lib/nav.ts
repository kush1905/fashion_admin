import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Boxes,
  FolderTree,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Package,
  Percent,
  RotateCcw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  Wallet,
  Heart,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/collections", label: "Collections", icon: LayoutGrid },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Customers",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/wishlists", label: "Wishlists", icon: Heart },
      { href: "/admin/carts", label: "Carts", icon: Wallet },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/promotions", label: "Promotions", icon: Sparkles },
      { href: "/admin/coupons", label: "Coupons", icon: Percent },
    ],
  },
  {
    title: "Logistics",
    items: [
      { href: "/admin/shipments", label: "Shipments", icon: Truck },
      { href: "/admin/pickups", label: "Pickup orders", icon: Store },
      { href: "/admin/delivery", label: "Home delivery", icon: MapPin },
      { href: "/admin/returns", label: "Returns & refunds", icon: RotateCcw },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/admin/analytics/sales", label: "Sales", icon: BarChart3 },
      { href: "/admin/analytics/products", label: "Products", icon: Package },
      { href: "/admin/analytics/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [{ href: "/admin/content", label: "Pages & lookbook", icon: BookOpen }],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users & staff", icon: Users },
      { href: "/admin/roles", label: "Roles & permissions", icon: Shield },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "ready_for_pickup",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
] as const;

export function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
