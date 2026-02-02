import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
//Proxy config for dev environment
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost",
        changeOrigin: true,
        secure: false,
      },
      "/password": {
        target: "https://localhost",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "https://localhost",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})