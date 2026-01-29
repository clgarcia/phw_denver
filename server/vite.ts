// Vite development server integration for Express
import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

// Create a Vite logger instance
const viteLogger = createLogger();

// Sets up Vite middleware and HTML serving for development
export async function setupVite(server: Server, app: Express) {
  // Load vite config dynamically at runtime
  // @ts-expect-error - vite.config is excluded from tsconfig but needed at runtime
  const viteConfigModule = await import("../vite.config");
  const viteConfig = viteConfigModule.default;

  // Vite server options for middleware mode and HMR
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  // Create the Vite dev server
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Attach Vite middlewares to Express
  app.use(vite.middlewares);

  // Serve index.html for all unmatched routes (SPA fallback)
  app.use("/*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Always reload index.html from disk for hot updates
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // Add a cache-busting query param to main.tsx
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
