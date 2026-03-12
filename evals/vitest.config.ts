import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./evals/setup.ts"],
    include: ["evals/unit/**/*.test.ts"],
    testTimeout: 10_000,
  },
})
