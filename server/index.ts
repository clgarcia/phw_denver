// Main server entry point for the application
// Sets up Express, API routes, static file serving, error handling, and Vite (for dev)

import "dotenv/config"; // Load environment variables from .env
import express, { type Request, Response, NextFunction } from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module context
const __dirname = dirname(fileURLToPath(import.meta.url));
import path from "path";
import { registerRoutes } from "./routes.js";
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

import { storage } from "./storage.js";

// Main async startup routine
(async () => {
  // Initialize database and register API routes
  await storage.initializeDatabase();
  await registerRoutes(httpServer, app);

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
  const host = process.platform === "win32" ? "127.0.0.1" : "0.0.0.0";
  httpServer.listen(
    {
      port,
      host,
      reusePort: !process.platform.includes("win32"),
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
