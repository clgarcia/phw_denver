import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
let replayerPlugin = [];
// Only load Replit plugins in development with REPL_ID set
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    try {
        const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
        replayerPlugin = [runtimeErrorOverlay()];
    }
    catch {
        // Plugin not available, skip it
    }
}
export default defineConfig({
    plugins: [
        react(),
        ...replayerPlugin,
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
