import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "out/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/**/*.ts",
        "actions/**/*.ts",
        "app/api/**/route.ts",
        "components/**/*.tsx",
      ],
      exclude: [
        "lib/supabase/database.types.ts",
        // Thin SDK/environment wrappers that only exercise real Supabase or
        // network I/O in production — unit-tested indirectly via consumers.
        "lib/supabase/server.ts",
        "lib/supabase/admin.ts",
        "lib/supabase/client.ts",
        "lib/supabase/env.ts",
        "lib/supabase/proxy.ts",
        "lib/chat/streamClient.ts",
        "lib/ingest-client.ts",
        "**/*.d.ts",
      ],
      thresholds: {
        global: { lines: 65 },
        "lib/**/*.ts": { lines: 80 },
      },
    },
  },
});

