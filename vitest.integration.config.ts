import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/integration/**/*.spec.ts"],
    setupFiles: ["./__tests__/integration/setup.ts"],
    exclude: ["node_modules/**", "e2e/**"],
    testTimeout: 30000,
    env: {
      BASE_URL: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
