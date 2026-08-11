import Link from "next/link";
import type { ReactNode } from "react";

type LandingFooterProps = {
  isAuthenticated?: boolean;
};

export function LandingFooter({
  isAuthenticated = false,
}: LandingFooterProps): ReactNode {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg font-semibold text-text-primary">
          DocuChat
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-text-secondary"
        >
          <a
            href="#features"
            className="hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Pricing
          </a>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {isAuthenticated ? "Dashboard" : "Log in"}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
