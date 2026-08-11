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
    alwaysVisible: true,
  },
  {
    href: "/bots",
    label: "Bots",
    match: (path: string) => path.startsWith("/bots"),
    alwaysVisible: false,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    match: (path: string) => path.startsWith("/settings"),
    alwaysVisible: false,
  },
] as const;

function linkClass(active: boolean): string {
  return [
    "text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-accent",
    active ? "text-accent" : "text-text-secondary hover:text-accent",
  ].join(" ");
}

export function AppNavbar(): ReactNode {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-6 sm:px-8">
        <Link
          href="/dashboard"
          className="shrink-0 font-display text-xl font-semibold tracking-tight text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          DocuChat
        </Link>
        <nav
          aria-label="App"
          className="flex min-w-0 items-center gap-3 sm:gap-6"
        >
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkClass(active)} ${item.alwaysVisible ? "" : "hidden sm:inline"}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={signOut} className="shrink-0">
            <Button type="submit" variant="secondary" className="px-3 sm:px-4">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
