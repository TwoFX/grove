import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the bundle can be served from any subpath. Safe because
  // hash routing keeps the document URL fixed at index.html.
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Handlebars' main entry requires Node's "fs"; use the browser build.
      handlebars: "handlebars/dist/handlebars.js",
    },
  },
  build: {
    outDir: "out",
  },
});
