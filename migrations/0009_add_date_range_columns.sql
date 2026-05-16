-- Add date range support columns to events table
ALTER TABLE events ADD COLUMN date_range_mode BOOLEAN;
ALTER TABLE events ADD COLUMN date_range_start TEXT;
ALTER TABLE events ADD COLUMN date_range_end TEXT;
ALTER TABLE events ADD COLUMN date_range_start_time TEXT;
ALTER TABLE events ADD COLUMN date_range_end_time TEXT;

-- Add date range support columns to programs table
ALTER TABLE programs ADD COLUMN date_range_mode BOOLEAN;
ALTER TABLE programs ADD COLUMN date_range_start TEXT;
ALTER TABLE programs ADD COLUMN date_range_end TEXT;
ALTER TABLE programs ADD COLUMN date_range_start_time TEXT;
ALTER TABLE programs ADD COLUMN date_range_end_time TEXT;

-- Add date range support columns to trips table
ALTER TABLE trips ADD COLUMN date_range_mode BOOLEAN;
ALTER TABLE trips ADD COLUMN date_range_start TEXT;
ALTER TABLE trips ADD COLUMN date_range_end TEXT;
ALTER TABLE trips ADD COLUMN date_range_start_time TEXT;
ALTER TABLE trips ADD COLUMN date_range_end_time TEXT;
