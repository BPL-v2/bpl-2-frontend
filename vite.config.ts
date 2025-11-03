import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import path from "path";
import { defineConfig } from "vite";

// Load environment variables from .env file
config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
  // for dev
  server: {
    host: "0.0.0.0",
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "@react": ["react", "react-dom"],
          "@uplot": ["uplot", "uplot-react"],
          "@tanstack": [
            "@tanstack/react-form",
            "@tanstack/react-query",
            "@tanstack/react-router",
            "@tanstack/react-table",
            "@tanstack/react-virtual",
          ],
          "@heroicons": ["@heroicons/react"],
          "@embla": ["embla-carousel-react"],
          "@headlessui": ["@headlessui/react"],
          "@vendor": [
            "clsx",
            "dayjs",
            "isomorphic-fetch",
            "pako",
            "tailwind-merge",
            "url",
          ],
        },
      },
    },
  },
});
