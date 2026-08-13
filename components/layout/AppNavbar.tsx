"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    match: (path: string) => path === "/dashboard",
  },
  {
    href: "/bots",
    label: "Bots",
    match: (path: string) => path.startsWith("/bots"),
  },
  {
    href: "/settings/billing",
    label: "Billing",
    match: (path: string) => path.startsWith("/settings"),
  },
] as const;

function linkClass(active: boolean): string {
  return [
    "text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent",
    active ? "text-accent" : "text-text-secondary hover:text-accent",
  ].join(" ");
}

export function AppNavbar(): ReactNode {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-2 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="font-display text-xl font-semibold tracking-tight text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            DocuChat
          </Link>
          <form action={signOut} className="sm:hidden">
            <Button type="submit" variant="secondary" className="px-3">
              Sign out
            </Button>
          </form>
        </div>
        <nav
          aria-label="App"
          className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-6"
        >
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={signOut} className="hidden sm:block">
            <Button type="submit" variant="secondary" className="px-3 sm:px-4">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
