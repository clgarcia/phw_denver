// API route registration for events, programs, registrations, and trips
import type { Express } from "express";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertProgramSchema, insertTripSchema, insertRegistrationSchema } from "@shared/schema";
import { sendRegistrationConfirmation } from "./email";

// Registers all API endpoints for the application
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Event endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      // Validate and create a new event
      const parsed = insertEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid event data", errors: parsed.error.errors });
      }
      const event = await storage.createEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      // Update an event by ID
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      // Delete an event by ID
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Program endpoints
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get("/api/programs/:id", async (req, res) => {
    try {
      const program = await storage.getProgram(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.post("/api/programs", async (req, res) => {
    try {
      // Validate and create a new program
      const parsed = insertProgramSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid program data", errors: parsed.error.errors });
      }
      const program = await storage.createProgram(parsed.data);
      res.status(201).json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.patch("/api/programs/:id", async (req, res) => {
    try {
      // Update a program by ID
      const program = await storage.updateProgram(req.params.id, req.body);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.delete("/api/programs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProgram(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete program" });
    }
  });

  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/registrations/:id", async (req, res) => {
    try {
      const registration = await storage.getRegistration(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registration" });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const parsed = insertRegistrationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid registration data", errors: parsed.error.errors });
      }

      if (parsed.data.eventId) {
        const event = await storage.getEvent(parsed.data.eventId);
        if (!event) {
          return res.status(400).json({ message: "Event not found" });
        }
        if (event.registeredCount >= event.capacity) {
          return res.status(400).json({ message: "Event is full" });
        }
      }

      if (parsed.data.programId) {
        const program = await storage.getProgram(parsed.data.programId);
        if (!program) {
          return res.status(400).json({ message: "Program not found" });
        }
        if (program.registeredCount >= program.capacity) {
          return res.status(400).json({ message: "Program is full" });
        }
      }

      if (parsed.data.tripId) {
        const trip = await storage.getTrip(parsed.data.tripId);
        if (!trip) {
          return res.status(400).json({ message: "Trip not found" });
        }
        if (trip.registeredCount >= trip.capacity) {
          return res.status(400).json({ message: "Trip is full" });
        }
      }

      const registration = await storage.createRegistration(parsed.data);

      if (registration.eventId) {
        await storage.incrementEventRegistration(registration.eventId);
      }
      if (registration.programId) {
        await storage.incrementProgramRegistration(registration.programId);
      }
      if (registration.tripId) {
        await storage.incrementTripRegistration(registration.tripId);
      }

      let event = null;
      let program = null;
      let trip = null;
      
      if (registration.eventId) {
        event = await storage.getEvent(registration.eventId);
      }
      if (registration.programId) {
        program = await storage.getProgram(registration.programId);
      }
      if (registration.tripId) {
        trip = await storage.getTrip(registration.tripId);
      }

      sendRegistrationConfirmation({
        recipientEmail: registration.email,
        recipientName: `${registration.firstName} ${registration.lastName}`,
        participationType: registration.participationType || "participant",
        eventTitle: event?.title,
        eventDate: event?.date,
        eventTime: event?.time,
        eventLocation: event?.location,
        programName: program?.name,
        programStartDate: program?.startDate,
        tripName: trip?.name,
        tripDate: trip?.date,
        tripEndDate: trip?.endDate,
        tripTime: trip?.time,
        tripEndTime: trip?.endTime,
        tripMeetupLocation: trip?.meetupLocation,
      }).catch(err => console.error("Email send failed:", err));

      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to create registration" });
    }
  });

  app.patch("/api/registrations/:id", async (req, res) => {
    try {
      const registration = await storage.updateRegistration(req.params.id, req.body);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRegistration(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete registration" });
    }
  });

  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const parsed = insertTripSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid trip data", errors: parsed.error.errors });
      }
      const trip = await storage.createTrip(parsed.data);
      res.status(201).json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrip(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // Image upload endpoint
  app.post("/api/upload-image", (req, res) => {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const image = req.files.image;
    const uploadDir = __dirname + "/../public/uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = Date.now() + "-" + image.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filepath = path.join(uploadDir, filename);
    image.mv(filepath, (err) => {
      if (err) return res.status(500).json({ message: "Failed to save image" });
      res.json({ url: "/uploads/" + filename });
    });
  });

  return httpServer;
}
