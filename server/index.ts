// Main server entry point for the application
// Sets up Express, API routes, static file serving, error handling, and Vite (for dev)

import "dotenv/config"; // Load environment variables from .env
import express, { type Request, Response, NextFunction } from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module context
const __dirname = dirname(fileURLToPath(import.meta.url));
import path from "path";
import fs from "fs";
// `registerRoutes` is imported dynamically at runtime so we can surface helpful
// diagnostics when the compiled file is missing on the host (Render/Linux).
// `registerRoutes` returns a Promise<Server> in the source; allow any return to match that.
let registerRoutes: (server: any, app: any) => Promise<any> | any;
import { createServer } from "http";
import fileUpload from "express-fileupload";

const app = express();

// Serve uploaded images from /uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
const httpServer = createServer(app);

// Extend IncomingMessage to allow rawBody capture
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Parse JSON bodies and capture raw body for signature verification, etc.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));
// Enable file uploads
app.use(fileUpload());

// Utility function for logging with timestamp and source
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Middleware for logging API requests and responses with timing
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Monkey-patch res.json to capture response body
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});

// `storage` is imported dynamically so we can surface diagnostics when the
// compiled file is missing on the host environment.
let storage: any;

// Main async startup routine
(async () => {
  // Initialize database (dynamically import storage to avoid top-level ESM failures)
  try {
    const mod = await import("./storage.js");
    storage = mod.storage;
    if (!storage) throw new Error("storage not exported from ./storage.js");
  } catch (err) {
    console.error("Failed to load ./storage.js:", err);
    try {
      const files = fs.readdirSync(path.resolve(__dirname));
      console.error("Files in dist/server:", files);
    } catch (e) {
      console.error("Could not list dist/server contents:", e);
    }
    throw err;
  }

  await storage.initializeDatabase();

  try {
    const mod = await import("./routes.js");
    registerRoutes = mod.registerRoutes;
    if (!registerRoutes) throw new Error("registerRoutes not exported from ./routes.js");
    await registerRoutes(httpServer, app);
  } catch (err) {
    console.error("Failed to load ./routes.js:", err);
    try {
      const files = fs.readdirSync(path.resolve(__dirname));
      console.error("Files in dist/server:", files);
    } catch (e) {
      console.error("Could not list dist/server contents:", e);
    }
    throw err;
  }

  // Global error handler for API
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });

  // Serve static files in production, Vite dev server in development
  if (process.env.NODE_ENV === "production") {
    try {
      const mod = await import("./static.js");
      if (mod && typeof mod.serveStatic === "function") {
        mod.serveStatic(app);
      } else {
        console.error("serveStatic not found in ./static.js");
      }
    } catch (err) {
      console.error("Failed to load static module:", err);
    }
  } else {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  // Start HTTP server on specified port and host
  const port = parseInt(process.env.PORT || "5000", 10);
  // Always use 0.0.0.0 in production so Render can detect the open port
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  httpServer.listen(
    { port, host },
    () => {
      log(`serving on port ${port} (host: ${host})`);
    },
  );
})();
