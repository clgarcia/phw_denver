// Storage layer for database operations and seeding
import { 
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Program, type InsertProgram,
  type Trip, type InsertTrip,
  type Registration, type InsertRegistration,
  users, events, programs, trips, registrations
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations (CRUD for all entities)
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  incrementEventRegistration(id: string): Promise<void>;
  
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: string, program: Partial<InsertProgram>): Promise<Program | undefined>;
  deleteProgram(id: string): Promise<boolean>;
  incrementProgramRegistration(id: string): Promise<void>;
  
  getTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;
  incrementTripRegistration(id: string): Promise<void>;
  
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: string): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined>;
  deleteRegistration(id: string): Promise<boolean>;
  
  initializeDatabase(): Promise<void>;
}

// Concrete implementation of IStorage using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // Initialize database and seed if empty
  async initializeDatabase(): Promise<void> {
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await this.seedData();
    }
  }

  // Seed the database with initial data for events, programs, and registrations
  private async seedData() {
    const event1 = await this.createEvent({
      title: "Fly Fishing Show",
      description: "Visit our booth at the convention center. Learn about fly fishing techniques, meet experienced anglers, and discover the latest gear. Military discounts available for admission.",
      date: "2026-02-21",
      time: "09:00",
      location: "Mountain View Convention Center",
      capacity: 150,
      isActive: true,
    });
    
    const event2 = await this.createEvent({
      title: "Volunteer Appreciation Meeting",
      description: "Join us for our annual volunteer appreciation meeting. See our 2026 plans and celebrate volunteer service contributions. Lunch will be catered.",
      date: "2026-02-01",
      time: "11:00",
      location: "Community Library, Main Hall",
      capacity: 75,
      isActive: true,
    });
    
    await this.createEvent({
      title: "Spring River Outing",
      description: "A guided fly fishing trip on the beautiful Clear Creek. All skill levels welcome. Equipment provided for those who need it. Learn casting techniques and enjoy nature.",
      date: "2026-03-15",
      time: "07:00",
      location: "Clear Creek State Park",
      capacity: 20,
      isActive: true,
    });

    await this.createEvent({
      title: "Veterans Casting Clinic",
      description: "A hands-on casting clinic designed for veterans of all experience levels. Learn proper casting techniques from certified instructors. All equipment provided.",
      date: "2026-04-05",
      time: "10:00",
      location: "Riverside Park Pavilion",
      capacity: 25,
      isActive: true,
    });

    const program1 = await this.createProgram({
      name: "Fly Fishing Fundamentals",
      description: "An 8-week program teaching the basics of fly fishing. Learn casting, fly selection, knot tying, and river reading. Perfect for beginners wanting to start their fly fishing journey.",
      startDate: "2026-03-01",
      endDate: "2026-04-26",
      schedule: "Saturdays 8:00 AM - 11:00 AM",
      capacity: 15,
      isActive: true,
    });
    
    await this.createProgram({
      name: "Fly Tying Workshop Series",
      description: "Learn the art of fly tying from experienced craftsmen. Create your own flies to use on the water. All materials provided. No prior experience necessary.",
      startDate: "2026-02-15",
      endDate: "2026-05-15",
      schedule: "Wednesdays 6:00 PM - 8:00 PM",
      capacity: 12,
      isActive: true,
    });
    
    await this.createProgram({
      name: "Outdoor Wellness Program",
      description: "Combine the healing power of nature with mindfulness practices. Weekly outdoor sessions include hiking, meditation by the water, and gentle nature walks.",
      startDate: "2026-02-01",
      endDate: "2026-04-30",
      schedule: "Mon/Wed 7:00 AM - 8:30 AM",
      capacity: 20,
      isActive: true,
    });

    await this.createProgram({
      name: "River Conservation Workshop",
      description: "Learn about river ecosystems and conservation efforts. Participate in stream cleanup activities and habitat restoration. Perfect for those who want to give back to nature.",
      startDate: "2026-03-15",
      endDate: "2026-06-15",
      schedule: "First Saturday of each month 9:00 AM - 12:00 PM",
      capacity: 30,
      isActive: true,
    });

    // Seed some registrations
    await this.createRegistration({
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
      eventId: event1.id,
      programId: null,
      notes: null,
    });
    
    await this.createRegistration({
      firstName: "Michael",
      lastName: "Chen",
      email: "m.chen@email.com",
      phone: "(555) 234-5678",
      eventId: null,
      programId: program1.id,
      notes: "Interested in additional resources",
    });
    
    await this.createRegistration({
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.r@email.com",
      phone: "(555) 345-6789",
      eventId: event2.id,
      programId: null,
      notes: null,
    });
  }

  // User CRUD operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }


  // Create a new user
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await db.insert(users).values({ ...insertUser, id }).returning();
    return result[0];
  }

  // Event CRUD operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  // Create a new event
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const result = await db.insert(events).values({
      ...insertEvent,
      id,
      registeredCount: 0,
      imageUrl: insertEvent.imageUrl || null,
    }).returning();
    return result[0];
  }

  // Update an event
  async updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return result[0];
  }

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Increment the registration count for an event
  async incrementEventRegistration(id: string): Promise<void> {
    await db.update(events)
      .set({ registeredCount: sql`${events.registeredCount} + 1` })
      .where(eq(events.id, id));
  }

  // Program CRUD operations
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const result = await db.select().from(programs).where(eq(programs.id, id));
    return result[0];
  }

  // Create a new program
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const result = await db.insert(programs).values({
      ...insertProgram,
      id,
      registeredCount: 0,
    }).returning();
    return result[0];
  }

  // Update a program
  async updateProgram(id: string, data: Partial<InsertProgram>): Promise<Program | undefined> {
    const result = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
    return result[0];
  }

  // Delete a program
  async deleteProgram(id: string): Promise<boolean> {
    const result = await db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }

  // Increment the registration count for a program
  async incrementProgramRegistration(id: string): Promise<void> {
    await db.update(programs)
      .set({ registeredCount: sql`${programs.registeredCount} + 1` })
      .where(eq(programs.id, id));
  }

  // Trip CRUD operations
  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const result = await db.select().from(trips).where(eq(trips.id, id));
    return result[0];
  }

  // Create a new trip
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const result = await db.insert(trips).values({
      ...insertTrip,
      id,
      registeredCount: 0,
    }).returning();
    return result[0];
  }

  // Update a trip
  async updateTrip(id: string, data: Partial<InsertTrip>): Promise<Trip | undefined> {
    const result = await db.update(trips).set(data).where(eq(trips.id, id)).returning();
    return result[0];
  }

  // Delete a trip
  async deleteTrip(id: string): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id)).returning();
    return result.length > 0;
  }

  // Increment the registration count for a trip
  async incrementTripRegistration(id: string): Promise<void> {
    await db.update(trips)
      .set({ registeredCount: sql`${trips.registeredCount} + 1` })
      .where(eq(trips.id, id));
  }

  // Registration CRUD operations
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async getRegistration(id: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id));
    return result[0];
  }

  // Create a new registration
  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const result = await db.insert(registrations).values({
      ...insertRegistration,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }

  // Update a registration
  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined> {
    const result = await db.update(registrations).set(data).where(eq(registrations.id, id)).returning();
    return result[0];
  }

  // Delete a registration
  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }
}

// Export a singleton storage instance
export const storage = new DatabaseStorage();
