import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { execSync } from "node:child_process";

const BUILD_DATE = new Date().toISOString();
let COMMIT = "";
try {
  COMMIT = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  COMMIT = "unknown";
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
    __BUILD_COMMIT__: JSON.stringify(COMMIT),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
