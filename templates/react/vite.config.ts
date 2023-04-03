/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
  css: {
    modules: {
      generateScopedName: isProd ? "[hash:base64:8]" : undefined,
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles" as common;`,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["setupTests.ts"],
    coverage: {
      all: true,
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
    },
  },
  plugins: [
    react(),
    sassDts({
      // global: {
      //   generate: true,
      //   outFile: path.resolve(__dirname, './src/style.d.ts'),
      // },
    }),
  ],
});
