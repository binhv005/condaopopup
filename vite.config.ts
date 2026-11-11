import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Two pages: the one-page homestay landing and the room detail page
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // shadcn-style "@/..." imports
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        room: resolve(__dirname, "room.html"),
      },
    },
  },
});
