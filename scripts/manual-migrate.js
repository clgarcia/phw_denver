#!/usr/bin/env node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Run migration 0003 - Add registration_pin to events
    try {
      await client.query('ALTER TABLE "events" ADD COLUMN "registration_pin" text');
      console.log('✓ Added registration_pin column to events');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ registration_pin column already exists');
      } else {
        console.warn('⚠ Error adding registration_pin:', err.message);
      }
    }

    // Run migration 0004 - Add settings table
    try {
      await client.query(`
        CREATE TABLE "settings" (
          "key" varchar(100) PRIMARY KEY NOT NULL,
          "value" text NOT NULL
        )
      `);
      console.log('✓ Created settings table');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ settings table already exists');
      } else {
        console.warn('⚠ Error creating settings table:', err.message);
      }
    }

    // Run migration 0006 - Add google_form_url columns
    try {
      await client.query('ALTER TABLE "programs" ADD COLUMN "google_form_url" text');
      console.log('✓ Added google_form_url column to programs');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ google_form_url column already exists in programs');
      } else {
        console.warn('⚠ Error adding to programs:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "trips" ADD COLUMN "google_form_url" text');
      console.log('✓ Added google_form_url column to trips');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ google_form_url column already exists in trips');
      } else {
        console.warn('⚠ Error adding to trips:', err.message);
      }
    }

    // Run migration 0007 - Remove registration_pin from events
    try {
      await client.query('ALTER TABLE "events" DROP COLUMN "registration_pin"');
      console.log('✓ Removed registration_pin column from events');
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log('ℹ registration_pin column does not exist (already removed)');
      } else {
        console.warn('⚠ Error removing registration_pin:', err.message);
      }
    }

    // Add google_form_url to events if not present
    try {
      await client.query('ALTER TABLE "events" ADD COLUMN "google_form_url" text');
      console.log('✓ Added google_form_url column to events');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ google_form_url column already exists in events');
      } else {
        console.warn('⚠ Error adding to events:', err.message);
      }
    }

    // Run migration 0008 - Add additional_dates columns for multiple event dates
    try {
      await client.query('ALTER TABLE "events" ADD COLUMN "additional_dates" text');
      console.log('✓ Added additional_dates column to events');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ additional_dates column already exists in events');
      } else {
        console.warn('⚠ Error adding additional_dates to events:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "programs" ADD COLUMN "additional_dates" text');
      console.log('✓ Added additional_dates column to programs');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ additional_dates column already exists in programs');
      } else {
        console.warn('⚠ Error adding additional_dates to programs:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "trips" ADD COLUMN "additional_dates" text');
      console.log('✓ Added additional_dates column to trips');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ additional_dates column already exists in trips');
      } else {
        console.warn('⚠ Error adding additional_dates to trips:', err.message);
      }
    }

    // Run migration 0009 - Add date range support columns
    try {
      await client.query('ALTER TABLE "events" ADD COLUMN "date_range_mode" boolean');
      console.log('✓ Added date_range_mode column to events');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ date_range_mode column already exists in events');
      } else {
        console.warn('⚠ Error adding date_range_mode to events:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "events" ADD COLUMN "date_range_start" text');
      await client.query('ALTER TABLE "events" ADD COLUMN "date_range_end" text');
      await client.query('ALTER TABLE "events" ADD COLUMN "date_range_start_time" text');
      await client.query('ALTER TABLE "events" ADD COLUMN "date_range_end_time" text');
      console.log('✓ Added date_range columns to events');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ date_range columns already exist in events');
      } else {
        console.warn('⚠ Error adding date_range columns to events:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "programs" ADD COLUMN "date_range_mode" boolean');
      await client.query('ALTER TABLE "programs" ADD COLUMN "date_range_start" text');
      await client.query('ALTER TABLE "programs" ADD COLUMN "date_range_end" text');
      await client.query('ALTER TABLE "programs" ADD COLUMN "date_range_start_time" text');
      await client.query('ALTER TABLE "programs" ADD COLUMN "date_range_end_time" text');
      console.log('✓ Added date_range columns to programs');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ date_range columns already exist in programs');
      } else {
        console.warn('⚠ Error adding date_range columns to programs:', err.message);
      }
    }

    try {
      await client.query('ALTER TABLE "trips" ADD COLUMN "date_range_mode" boolean');
      await client.query('ALTER TABLE "trips" ADD COLUMN "date_range_start" text');
      await client.query('ALTER TABLE "trips" ADD COLUMN "date_range_end" text');
      await client.query('ALTER TABLE "trips" ADD COLUMN "date_range_start_time" text');
      await client.query('ALTER TABLE "trips" ADD COLUMN "date_range_end_time" text');
      console.log('✓ Added date_range columns to trips');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('ℹ date_range columns already exist in trips');
      } else {
        console.warn('⚠ Error adding date_range columns to trips:', err.message);
      }
    }

    console.log('\n✓ Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
