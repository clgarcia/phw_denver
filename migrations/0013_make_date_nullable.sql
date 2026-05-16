-- Make date column nullable for events table
ALTER TABLE events ALTER COLUMN date DROP NOT NULL;
