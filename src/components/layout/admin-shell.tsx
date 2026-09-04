"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Search, PanelLeft } from "lucide-react";
import { can, navForRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/overlay";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/forms";
import { Separator } from "@/components/ui/layout";

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}>
            <div className="flex size-9 items-center justify-center rounded-md bg-[#c4a574] text-sm font-medium text-[#1c1917]">
              B
            </div>
        {!collapsed ? (
          <div>
            <p className="font-display text-lg leading-none text-sidebar-foreground">Backstage</p>
            <p className="mt-1 text-[11px] tracking-[0.16em] text-sidebar-muted uppercase">Admin</p>
          </div>
        ) : null}
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-6">
        {navForRole(user?.roleId).map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed ? (
              <p className="px-2 pb-1 text-[10px] tracking-[0.18em] text-sidebar-muted uppercase">{group.title}</p>
            ) : (
              <Separator className="mx-2 mb-2 bg-sidebar-border" />
            )}
            <ul className="grid gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        active && "bg-sidebar-accent text-sidebar-foreground",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? <span>{item.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {!collapsed ? (
        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-muted">
          Signed in as
          <p className="mt-1 text-sidebar-foreground">{user?.name ?? "Guest"}</p>
          <p className="text-sidebar-muted">{user?.role}</p>
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useUiStore((s) => s.collapsed);
  const mobileOpen = useUiStore((s) => s.mobileOpen);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const setMobileOpen = useUiStore((s) => s.setMobileOpen);
  const notices = useUiStore((s) => s.notices);
  const markAllRead = useUiStore((s) => s.markAllRead);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = notices.filter((n) => !n.read).length;

  return (
    <div className="min-h-dvh min-w-0 bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border transition-[width] duration-200 md:block",
          collapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(calc(100vw-2.5rem),280px)] border-0 p-0 pt-[env(safe-area-inset-top)]">
          <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("min-w-0 transition-[padding] duration-200", collapsed ? "md:pl-[72px]" : "md:pl-[248px]")}>
        <header className="sticky top-0 z-20 flex min-h-14 w-full min-w-0 items-center gap-2 border-b bg-background/90 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md sm:gap-3 md:px-8">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden shrink-0 md:inline-flex" onClick={toggleCollapsed} aria-label="Collapse sidebar">
            <PanelLeft className="size-4" />
          </Button>
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="h-9 w-full bg-card pl-8"
              aria-label="Search orders, products, customers"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = e.currentTarget.value.toLowerCase();
                  if (q.startsWith("ord")) router.push("/admin/orders");
                  else if (q.includes("product") || q.includes("lehenga") || q.includes("saree")) router.push("/admin/products");
                  else router.push("/admin/customers");
                }
              }}
            />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-4" />
                {unread > 0 ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" /> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] p-0">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-medium">Needs attention</p>
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={markAllRead}>
                  Mark read
                </button>
              </div>
              <Separator />
              {notices.map((n) => (
                <div key={n.id} className={cn("px-3 py-2.5", !n.read && "bg-muted/50")}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.at}</p>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus-visible:outline-none">
                <span className="hidden text-right text-xs sm:block">
                  <span className="block font-medium">{user?.name}</span>
                  <span className="text-muted-foreground">{user?.role}</span>
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {user?.initials}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {can(user?.roleId, "Settings", "view") ? (
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>Settings</DropdownMenuItem>
              ) : null}
              {can(user?.roleId, "Settings", "edit") ? (
                <DropdownMenuItem onClick={() => router.push("/admin/users")}>Staff</DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:py-6">{children}</main>
      </div>
      <span className="sr-only">{pathname}</span>
    </div>
  );
}
