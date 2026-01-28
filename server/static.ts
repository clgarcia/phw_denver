// Static file serving for production builds
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Serves static files and SPA fallback for unmatched routes
export function serveStatic(app: Express) {
  // Path to built client assets (goes up one level from dist/server to dist/public)
  const distPath = path.resolve(__dirname, "..", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from the build directory
  app.use(express.static(distPath));

  // Fallback to index.html for SPA routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
