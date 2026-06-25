import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
  server: {
    host: "0.0.0.0",
  },
});