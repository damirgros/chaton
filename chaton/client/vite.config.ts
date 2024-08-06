import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
      include: "**/*.svg",
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:5000", // Proxy API requests to the server
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../server/src/build"), // Specify the output directory
    emptyOutDir: true, // Clean the output directory before each build
  },
});
