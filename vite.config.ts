import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "deenful",
      project: "mlm-admin",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./dist/**",
      },
    }),
  ],
  
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
});
