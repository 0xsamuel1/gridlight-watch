import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, mergeConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const isDevBuild = command === "build" && mode === "development";
  const nitroOptions =
    process.env.NETLIFY === "true"
      ? { preset: "netlify" }
      : process.env.VERCEL === "1"
        ? { preset: "vercel" }
        : { defaultPreset: "cloudflare-module" };

  return mergeConfig(
    {
      server: {
        host: "::",
        port: 8080,
        watch: {
          awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100,
          },
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(rootDir, "src"),
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      optimizeDeps: {
        include: [
          "react",
          "react-dom",
          "react-dom/client",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
        ],
        ignoreOutdatedRequests: true,
      },
      plugins: [
        tailwindcss(),
        tsconfigPaths({ projects: ["./tsconfig.json"] }),
        tanstackStart({
          importProtection: {
            behavior: "error",
            client: {
              files: ["**/server/**"],
              specifiers: ["server-only"],
            },
          },
          server: { entry: "server" },
        }),
        command === "build" ? nitro(nitroOptions) : undefined,
        react(),
      ],
    } satisfies UserConfig,
    isDevBuild
      ? {
          environments: {
            client: {
              define: {
                "process.env.NODE_ENV": JSON.stringify("development"),
              },
            },
          },
          esbuild: { keepNames: true },
        }
      : {},
  );
});
