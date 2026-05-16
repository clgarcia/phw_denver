-- Make time column nullable for events table
ALTER TABLE events ALTER COLUMN time DROP NOT NULL;
