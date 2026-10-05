import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import deployment from "./vercel.json" with { type: "json" };
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { sourcemap: false },
  preview: {
    headers: Object.fromEntries(
      deployment.headers[0].headers.map(({ key, value }) => [key, value]),
    ),
  },
});
