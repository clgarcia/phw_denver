// Database connection and ORM setup using Drizzle and PostgreSQL
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Ensure the database URL is set in environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export a Drizzle ORM instance for database operations
export const db = drizzle(pool, { schema });
