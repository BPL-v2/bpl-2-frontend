import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
            if (id.includes("react")) {
              return "vendor_react";
            }
            if (id.includes("antd")) {
              return "vendor_antd";
            }
            if (id.includes("rc")) {
              return "vendor_rc";
            }
            // Add more specific chunking rules as needed
            return "vendor";
          }
        },
      },
    },
  },
});
