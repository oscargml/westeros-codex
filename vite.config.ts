import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Custom domain (gameofthrones.uk) serves from root
  base: "/",
  plugins: [react(), tailwindcss()],
});
