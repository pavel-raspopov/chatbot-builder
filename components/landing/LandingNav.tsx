import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type LandingNavProps = {
  isAuthenticated?: boolean;
};

export function LandingNav({
  isAuthenticated = false,
}: LandingNavProps): ReactNode {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          DocuChat
        </Link>
        <nav
          aria-label="Marketing"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <a
            href="#features"
            className="hidden text-text-secondary transition-colors hover:text-accent sm:inline focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hidden text-text-secondary transition-colors hover:text-accent sm:inline focus:outline-none focus:ring-1 focus:ring-accent"
          >
            Pricing
          </a>
          {isAuthenticated ? (
            <Button href="/dashboard" variant="primary">
              Dashboard
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-text-secondary transition-colors hover:text-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                Log in
              </Link>
              <Button href="/signup" variant="primary">
                Start free
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
