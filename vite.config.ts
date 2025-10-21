import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/nominatim": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/nominatim/, ""),
        headers: {
          "User-Agent": "IntuTaxi/1.0 (contact@intu.taxi)",
          "Accept-Language": "es,en;q=0.8",
          "Referer": "http://localhost:5173/",
        },
      },
    },
  },
});
