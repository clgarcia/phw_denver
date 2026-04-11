-- Add is_full column to trips table to track when trips are full
ALTER TABLE trips ADD COLUMN is_full BOOLEAN NOT NULL DEFAULT false;
