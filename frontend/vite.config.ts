import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Avoid CORS during local dev by proxying API requests to the backend.
      "/api": {
        // Use 127.0.0.1 to avoid IPv6 ::1 issues on some machines.
        // Override when needed: VITE_API_PROXY_TARGET=http://127.0.0.1:4001
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:4000",
        changeOrigin: true
      }
    }
  }
});


