"use client";

import type { ReactNode } from "react";
import { RouteError } from "@/components/layout/RouteError";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode {
  return <RouteError error={error} reset={reset} />;
}
