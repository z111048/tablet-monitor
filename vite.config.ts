import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/tablet-monitor/", // 你的倉庫名稱
  plugins: [react()],
});
