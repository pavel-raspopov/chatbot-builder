"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppNavbar } from "@/components/layout/AppNavbar";

type AppShellProps = {
  children: ReactNode;
};

function isInAppChatPath(pathname: string): boolean {
  return /^\/bots\/[^/]+\/chat\/?$/.test(pathname);
}

export function AppShell({ children }: AppShellProps): ReactNode {
  const pathname = usePathname();
  const chat = isInAppChatPath(pathname);

  return (
    <div
      className={
        chat
          ? "flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-background"
          : "flex min-h-dvh min-w-0 flex-col bg-background"
      }
    >
      <AppNavbar />
      <main
        className={
          chat
            ? "mx-auto flex min-h-0 w-full min-w-0 max-w-[1440px] flex-1 flex-col overflow-hidden px-4 py-4 sm:px-8 sm:py-6"
            : "mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-8 sm:px-8"
        }
      >
        {children}
      </main>
      {chat ? null : <AppFooter />}
    </div>
  );
}
