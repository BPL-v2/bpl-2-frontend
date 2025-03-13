import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import tailwindcss from "@tailwindcss/vite";
import { splitVendorChunkPlugin } from "vite";

// Load environment variables from .env file
config();

// https://vite.dev/config/
export default defineConfig({
  // @ts-ignore
  plugins: [react(), tailwindcss(), splitVendorChunkPlugin()],
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("react-router-dom") || id.includes("react-router")) {
            return "@react-router";
          }
        },
      },
    },
  },
});
