-- Add additional dates column to events table
ALTER TABLE events ADD COLUMN additional_dates TEXT;

-- Add additional dates column to programs table  
ALTER TABLE programs ADD COLUMN additional_dates TEXT;

-- Add additional dates column to trips table
ALTER TABLE trips ADD COLUMN additional_dates TEXT;
