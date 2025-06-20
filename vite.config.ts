import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// Load environment variables from .env file
config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  preview: {
    port: 3001,
  },
  // for dev
  server: {
    port: 3000,
  },
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      "@client": path.resolve(__dirname, "./src/client"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@mytypes": path.resolve(__dirname, "./src/mytypes"),
      "@icons": path.resolve(__dirname, "./src/icons"),
      "@rules": path.resolve(__dirname, "./src/rules"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("tanstack")) {
            return "@tanstack";
          }
          if (id.includes("heroicons")) {
            return "@heroicons";
          }
          if (
            id.includes("headlessui") ||
            id.includes("react-aria") ||
            id.includes("floating-ui")
          ) {
            return "@headlessui";
          }
          if (id.includes("node_modules")) {
            return "@vendor";
          }
        },
      },
    },
  },
});
