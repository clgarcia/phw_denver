-- Make schedule field nullable in programs table
ALTER TABLE "programs" ALTER COLUMN "schedule" DROP NOT NULL;
