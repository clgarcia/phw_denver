import { 
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Program, type InsertProgram,
  type Registration, type InsertRegistration,
  users, events, programs, registrations
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

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
  
  getRegistrations(): Promise<Registration[]>;
  getRegistration(id: string): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined>;
  deleteRegistration(id: string): Promise<boolean>;
  
  initializeDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeDatabase(): Promise<void> {
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length === 0) {
      await this.seedData();
    }
  }

  private async seedData() {
    const event1 = await this.createEvent({
      title: "Spring Community Festival",
      description: "Join us for our annual spring celebration featuring live music, local food vendors, games, and activities for the whole family. Come connect with neighbors and celebrate the season!",
      date: "2026-03-15",
      time: "10:00",
      location: "Central Park Pavilion",
      capacity: 200,
      isActive: true,
    });
    
    const event2 = await this.createEvent({
      title: "Tech Talk: AI in Education",
      description: "An informative session exploring how artificial intelligence is transforming education. Learn about the latest tools and methodologies being used in classrooms today.",
      date: "2026-02-20",
      time: "18:30",
      location: "Community Learning Center",
      capacity: 75,
      isActive: true,
    });
    
    await this.createEvent({
      title: "Wellness Workshop: Stress Management",
      description: "A hands-on workshop teaching practical techniques for managing stress in daily life. Includes guided meditation, breathing exercises, and take-home resources.",
      date: "2026-02-28",
      time: "14:00",
      location: "Wellness Center Room 101",
      capacity: 30,
      isActive: true,
    });

    const program1 = await this.createProgram({
      name: "Youth Leadership Academy",
      description: "An 8-week program designed to develop leadership skills in young people ages 14-18. Participants learn communication, teamwork, and project management through hands-on activities.",
      startDate: "2026-03-01",
      endDate: "2026-04-26",
      schedule: "Saturdays 9:00 AM - 12:00 PM",
      price: 150,
      capacity: 25,
      isActive: true,
    });
    
    await this.createProgram({
      name: "Creative Arts Workshop Series",
      description: "Explore your creativity through various art forms including painting, sculpture, and mixed media. No prior experience necessary - all materials provided.",
      startDate: "2026-02-15",
      endDate: "2026-05-15",
      schedule: "Wednesdays 6:00 PM - 8:00 PM",
      price: 200,
      capacity: 20,
      isActive: true,
    });
    
    await this.createProgram({
      name: "Fitness Fundamentals",
      description: "A comprehensive fitness program for beginners. Learn proper form, develop workout routines, and build healthy habits with certified trainers.",
      startDate: "2026-02-01",
      endDate: "2026-03-31",
      schedule: "Mon/Wed/Fri 7:00 AM - 8:00 AM",
      price: 99,
      capacity: 15,
      isActive: true,
    });

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

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await db.insert(users).values({ ...insertUser, id }).returning();
    return result[0];
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

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

  async updateEvent(id: string, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  async incrementEventRegistration(id: string): Promise<void> {
    await db.update(events)
      .set({ registeredCount: sql`${events.registeredCount} + 1` })
      .where(eq(events.id, id));
  }

  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const result = await db.select().from(programs).where(eq(programs.id, id));
    return result[0];
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const result = await db.insert(programs).values({
      ...insertProgram,
      id,
      registeredCount: 0,
    }).returning();
    return result[0];
  }

  async updateProgram(id: string, data: Partial<InsertProgram>): Promise<Program | undefined> {
    const result = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
    return result[0];
  }

  async deleteProgram(id: string): Promise<boolean> {
    const result = await db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }

  async incrementProgramRegistration(id: string): Promise<void> {
    await db.update(programs)
      .set({ registeredCount: sql`${programs.registeredCount} + 1` })
      .where(eq(programs.id, id));
  }

  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async getRegistration(id: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations).where(eq(registrations.id, id));
    return result[0];
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const result = await db.insert(registrations).values({
      ...insertRegistration,
      id,
      status: "pending",
      createdAt: new Date().toISOString().split('T')[0],
    }).returning();
    return result[0];
  }

  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | undefined> {
    const result = await db.update(registrations).set(data).where(eq(registrations.id, id)).returning();
    return result[0];
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
