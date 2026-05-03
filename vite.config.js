import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devTarget = env.VITE_DEV_API_URL || "http://localhost:3000";
  const prodTarget =
    env.VITE_PROD_API_URL || "https://af-project-backend.onrender.com";
  const appEnv = env.VITE_APP_ENV || mode;
  const target = appEnv === "production" ? prodTarget : devTarget;

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.js",
    },
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
