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
// For AWS RDS with self-signed certificates, disable certificate validation
let sslOption: any = undefined;
if (!isLocalDb) {
  // AWS RDS uses self-signed certificates, so we need to disable strict validation
  sslOption = { rejectUnauthorized: false };
}

const poolOptions: any = { connectionString: process.env.DATABASE_URL };
// Always apply SSL options for non-local databases
if (!isLocalDb) {
  poolOptions.ssl = sslOption;
}

const pool = new Pool(poolOptions);

// Export a Drizzle ORM instance for database operations
export const db = drizzle(pool, { schema });
