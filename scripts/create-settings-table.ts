import { db } from "./server/db.js";
import { settings } from "./shared/schema.js";

async function createSettingsTable() {
  try {
    console.log("Creating settings table...");
    
    // This will create the table based on the schema definition
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "key" varchar(100) PRIMARY KEY,
        "value" text NOT NULL
      );
    `);
    
    console.log("✓ Settings table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating settings table:", error);
    process.exit(1);
  }
}

createSettingsTable();
