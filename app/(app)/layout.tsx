import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppNavbar />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 sm:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
