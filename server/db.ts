// Database connection and ORM setup using Drizzle and PostgreSQL
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

// Ensure the database URL is set in environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a PostgreSQL connection pool
const isLocalDb = (process.env.DATABASE_URL || "").includes("localhost") || (process.env.DATABASE_URL || "").includes("127.0.0.1");

// Determine SSL behavior for non-local DB connections.
// If `PGSSLROOTCERT` is provided (or a bundled `rds-combined-ca-bundle.pem` exists),
// validate the server certificate. Otherwise fall back to using SSL without strict verification
// so deployments that can't provide the CA still connect (useful for short-term testing).
let sslOption: any = undefined;
if (!isLocalDb) {
  const caPath = process.env.PGSSLROOTCERT || path.resolve(process.cwd(), "rds-combined-ca-bundle.pem");
  try {
    const ca = fs.readFileSync(caPath, "utf8");
    sslOption = { rejectUnauthorized: true, ca };
  } catch (err) {
    // CA not found — still enable SSL but don't reject unauthorized (keeps compatibility)
    sslOption = { rejectUnauthorized: false };
  }
}

const poolOptions: any = { connectionString: process.env.DATABASE_URL };
if (!isLocalDb && sslOption) poolOptions.ssl = sslOption;

const pool = new Pool(poolOptions);

// Export a Drizzle ORM instance for database operations
export const db = drizzle(pool, { schema });
