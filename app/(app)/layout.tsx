import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-background">
      <AppNavbar />
      <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-8 sm:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
