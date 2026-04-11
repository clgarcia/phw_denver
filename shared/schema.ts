import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
});

export const events = pgTable("events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date"),
  time: text("time"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location").notNull(),
  capacity: integer("capacity"),
  registeredCount: integer("registered_count").notNull().default(0),
  imageUrl: text("image_url"),
  googleFormUrl: text("google_form_url"),
  isActive: boolean("is_active").notNull().default(true),
  requiresRegistration: boolean("requires_registration").notNull().default(true),
  additionalDates: text("additional_dates"),
  dateRangeMode: boolean("date_range_mode"),
  dateRangeStart: text("date_range_start"),
  dateRangeEnd: text("date_range_end"),
  dateRangeStartTime: text("date_range_start_time"),
  dateRangeEndTime: text("date_range_end_time"),
});

export const programs = pgTable("programs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  schedule: text("schedule"),
  location: text("location"),
  capacity: integer("capacity"),
  registeredCount: integer("registered_count").notNull().default(0),
  startTime: text("start_time"),
  endTime: text("end_time"),
  imageUrl: text("image_url"),
  googleFormUrl: text("google_form_url"),
  isActive: boolean("is_active").notNull().default(true),
  additionalDates: text("additional_dates"),
  dateRangeMode: boolean("date_range_mode"),
  dateRangeStart: text("date_range_start"),
  dateRangeEnd: text("date_range_end"),
  dateRangeStartTime: text("date_range_start_time"),
  dateRangeEndTime: text("date_range_end_time"),
});

export const registrations = pgTable("registrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  participationType: text("participation_type").notNull().default("participant"),
  eventId: varchar("event_id", { length: 36 }),
  programId: varchar("program_id", { length: 36 }),
  tripId: varchar("trip_id", { length: 36 }),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  notes: text("notes"),
  isArchived: boolean("is_archived").notNull().default(false),
});

export const trips = pgTable("trips", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: text("date"),
  endDate: text("end_date"),
  time: text("time"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  destination: text("destination").notNull(),
  durationDays: integer("duration_days").notNull(),
  durationNights: integer("duration_nights").notNull(),
  difficultyLevel: text("difficulty_level").notNull(),
  registeredCount: integer("registered_count").notNull().default(0),
  imageUrl: text("image_url"),
  googleFormUrl: text("google_form_url"),
  isActive: boolean("is_active").notNull().default(true),
  isFull: boolean("is_full").notNull().default(false),
  additionalDates: text("additional_dates"),
  dateRangeMode: boolean("date_range_mode"),
  dateRangeStart: text("date_range_start"),
  dateRangeEnd: text("date_range_end"),
  dateRangeStartTime: text("date_range_start_time"),
  dateRangeEndTime: text("date_range_end_time"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  registeredCount: true,
}).extend({
  date: z.string().optional(),
  time: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().optional(),
  googleFormUrl: z.string().optional(),
  additionalDates: z.string().optional(),
  dateRangeMode: z.boolean().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  dateRangeStartTime: z.string().optional(),
  dateRangeEndTime: z.string().optional(),
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  registeredCount: true,
}).extend({
  schedule: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().optional(),
  googleFormUrl: z.string().optional(),
  additionalDates: z.string().optional(),
  dateRangeMode: z.boolean().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  dateRangeStartTime: z.string().optional(),
  dateRangeEndTime: z.string().optional(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  registeredCount: true,
}).extend({
  date: z.string().optional(),
  endDate: z.string().optional(),
  time: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  imageUrl: z.string().optional(),
  googleFormUrl: z.string().optional(),
  additionalDates: z.string().optional(),
  dateRangeMode: z.boolean().optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  dateRangeStartTime: z.string().optional(),
  dateRangeEndTime: z.string().optional(),
});

// Participant Registration Table
export const participantRegistrations = pgTable("participant_registrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  middleInitial: text("middle_initial"),
  lastName: text("last_name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  email: text("email").notNull(),
  mobilePhone: text("mobile_phone"),
  workPhone: text("work_phone"),
  homePhone: text("home_phone"),
  preferredPhone: text("preferred_phone").notNull(),
  birthYear: integer("birth_year").notNull(),
  gender: text("gender").notNull(),
  ethnicity: text("ethnicity").notNull(),
  militaryStatus: text("military_status").notNull(),
  isDisabledVeteran: boolean("is_disabled_veteran").notNull(),
  usesVA: boolean("uses_va").notNull(),
  branchOfService: text("branch_of_service").notNull(),
  deployments: text("deployments"), // Comma-separated or JSON
  entryDate: text("entry_date"), // MM/YYYY
  rank: text("rank"),
  rankGrade: text("rank_grade"),
  awards: text("awards"),
  conditions: text("conditions"), // Comma-separated or JSON
  flyFishingLevel: text("fly_fishing_level").notNull(),
  flyTyingLevel: text("fly_tying_level").notNull(),
  rodBuildingLevel: text("rod_building_level").notNull(),
  flyCastingLevel: text("fly_casting_level").notNull(),
  handedness: text("handedness"),
  retrieveHand: text("retrieve_hand"),
  shirtSize: text("shirt_size"),
  shoeSize: text("shoe_size"),
  accessibility: text("accessibility"),
  additionalInfo: text("additional_info"),
  maritalStatus: text("marital_status"),
  education: text("education"),
  employment: text("employment"),
  personalBio: text("personal_bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParticipantRegistrationSchema = createInsertSchema(participantRegistrations).omit({
  id: true,
  createdAt: true,
});

// Volunteer Registration Table
export const volunteerRegistrations = pgTable("volunteer_registrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  middleInitial: text("middle_initial"),
  lastName: text("last_name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  email: text("email").notNull(),
  mobilePhone: text("mobile_phone"),
  workPhone: text("work_phone"),
  homePhone: text("home_phone"),
  preferredPhone: text("preferred_phone").notNull(),
  birthYear: integer("birth_year").notNull(),
  isTeen: boolean("is_teen"),
  gender: text("gender").notNull(),
  ethnicity: text("ethnicity").notNull(),
  didServe: boolean("did_serve").notNull(),
  emergencyFirstName: text("emergency_first_name").notNull(),
  emergencyLastName: text("emergency_last_name").notNull(),
  emergencyRelationship: text("emergency_relationship").notNull(),
  emergencyEmail: text("emergency_email"),
  emergencyMobilePhone: text("emergency_mobile_phone").notNull(),
  emergencyWorkPhone: text("emergency_work_phone"),
  emergencyHomePhone: text("emergency_home_phone"),
  phwffConnection: text("phwff_connection").notNull(),
  leadershipRole: text("leadership_role").notNull(),
  region: text("region").notNull(),
  startDate: text("start_date").notNull(), // MM/YYYY
  vaVolunteer: boolean("va_volunteer").notNull(),
  allergies: text("allergies"),
  skills: text("skills"), // Comma-separated or JSON
  flyFishingLevel: text("fly_fishing_level").notNull(),
  flyTyingLevel: text("fly_tying_level").notNull(),
  rodBuildingLevel: text("rod_building_level").notNull(),
  flyCastingLevel: text("fly_casting_level").notNull(),
  handedness: text("handedness"),
  retrieveHand: text("retrieve_hand"),
  shirtSize: text("shirt_size"),
  shoeSize: text("shoe_size"),
  accessibility: text("accessibility"),
  additionalInfo: text("additional_info"),
  maritalStatus: text("marital_status"),
  education: text("education"),
  employment: text("employment"),
  personalBio: text("personal_bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerRegistrationSchema = createInsertSchema(volunteerRegistrations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
