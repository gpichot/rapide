import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

import manifest from "./manifest.json";
import packageJson from "./package.json";

// Remove $schema from manifest.json
const { $schema: _, ...baseManifest } = manifest;

const finalManifest = {
  ...baseManifest,
  version: packageJson.version,
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  plugins: [react(), crx({ manifest: finalManifest })],
});
