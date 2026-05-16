-- Add volunteer capacity to events table and make capacity nullable
ALTER TABLE events ALTER COLUMN capacity DROP NOT NULL;
ALTER TABLE events ADD COLUMN volunteer_capacity INTEGER;

-- Add volunteer capacity to programs table and make capacity nullable
ALTER TABLE programs ALTER COLUMN capacity DROP NOT NULL;
ALTER TABLE programs ADD COLUMN volunteer_capacity INTEGER;
