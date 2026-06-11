import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages serves from /<repo-name>/ — set via env so local dev stays at /
  base: process.env.GITHUB_PAGES ? "/westeros-codex/" : "/",
  plugins: [react(), tailwindcss()],
});
