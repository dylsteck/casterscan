import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  plugins: [
    tanstackStart({
      srcDirectory: "app",
      router: {
        routesDirectory: "routes",
      },
    }),
    nitro({ preset: "node-server", noExternals: ["ws"] }),
    viteReact(),
  ],
});
