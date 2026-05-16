-- Add startTime and endTime to events table
ALTER TABLE events ADD COLUMN start_time TEXT;
ALTER TABLE events ADD COLUMN end_time TEXT;

-- Add startTime and endTime to programs table
ALTER TABLE programs ADD COLUMN start_time TEXT;
ALTER TABLE programs ADD COLUMN end_time TEXT;
