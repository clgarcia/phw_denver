-- Drop unused fields from trips table
ALTER TABLE trips DROP COLUMN meetup_location;
ALTER TABLE trips DROP COLUMN capacity;
ALTER TABLE trips DROP COLUMN volunteer_capacity;
ALTER TABLE trips DROP COLUMN trip_coordinator_capacity;
ALTER TABLE trips DROP COLUMN volunteer_names;
