import Link from "next/link";
import { Bell, ClipboardList, LayoutDashboard, ShoppingBag, ShoppingCart, Store, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import type { NavigationUser } from "@/lib/page-access";
import { ROLES } from "@/types";

const ownerLinks = [
  { href: "/canteen-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/canteen-owner/products", label: "Products", icon: ShoppingBag },
  { href: "/canteen-owner/categories", label: "Categories", icon: Store },
  { href: "/canteen-owner/orders", label: "Orders", icon: ClipboardList },
  { href: "/canteen-owner/profile", label: "Profile", icon: UserRound },
];

export function SiteHeader({ user }: { user: NavigationUser | null }) {
  const links = !user
    ? []
    : user.status !== "ACTIVE"
      ? [{ href: "/account/status", label: "Account status", icon: UserRound }]
      : user.role === ROLES.CANTEEN_OWNER
        ? ownerLinks
        : user.role === ROLES.SUPER_ADMIN
          ? [{ href: "/admin/registrations", label: "Registrations", icon: ClipboardList }]
          : [
              { href: "/marketplace", label: "Marketplace", icon: Store },
              { href: "/cart", label: "Cart", icon: ShoppingCart },
              { href: "/orders", label: "Orders", icon: ClipboardList },
            ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          <span className="sm:hidden">Canteen Market</span>
          <span className="hidden sm:inline">University Canteen Marketplace</span>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-1 flex-wrap items-center justify-end gap-1 sm:gap-2">
          {!user ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
              <Button asChild size="sm"><Link href="/register">Create account</Link></Button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                {links.map(({ href, label, icon: Icon }) => (
                  <Button key={href} asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                    <Link href={href}>
                      <Icon aria-hidden="true" className="size-4 sm:mr-2" />
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sr-only sm:hidden">{label}</span>
                    </Link>
                  </Button>
                ))}
                {user.status === "ACTIVE" && user.role !== ROLES.SUPER_ADMIN && <NotificationBell />}
                {user.status === "ACTIVE" && user.role === ROLES.SUPER_ADMIN && (
                  <Button asChild variant="ghost" size="sm" aria-label="Notifications">
                    <Link href="/notifications"><Bell className="size-4" /><span className="sr-only">Notifications</span></Link>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 border-l pl-2 sm:pl-3">
                <span className="hidden max-w-36 truncate text-xs text-muted-foreground lg:inline" title={user.name}>{user.name}</span>
                <LogoutButton />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
