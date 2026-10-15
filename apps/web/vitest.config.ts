import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    // Threads pool: no child process spawn, which is more reliable on Windows
    // hosts where spawning a Node child can fail in constrained environments.
    pool: "threads",
  },
});
