import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    forceRerunTriggers: [
      "**/package.json",
      "**/package-lock.json",
      "**/vitest.config.*",
      "**/vite.config.*",
      "**/tsconfig*.json",
    ],
  },
});
