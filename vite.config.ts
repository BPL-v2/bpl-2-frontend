import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import tailwindcss from "@tailwindcss/vite";
// Load environment variables from .env file
config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust the chunk size warning limit if needed
  },
});
