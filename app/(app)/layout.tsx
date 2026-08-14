import { AppShell } from "@/components/layout/AppShell";
import type { ReactNode } from "react";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return <AppShell>{children}</AppShell>;
}
