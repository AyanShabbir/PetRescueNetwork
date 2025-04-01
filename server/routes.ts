import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import {
  insertUserSchema,
  insertPetSchema,
  insertShelterSchema,
  insertAdoptionRequestSchema,
  insertLostFoundPetSchema,
} from "@shared/schema";
import { setupAuth, requireAuth, requireRole } from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password before sending back
      const { password, ...userWithoutPassword } = user;
      
      // Set the session
      (req.session as any).userId = user.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set the session
      (req.session as any).userId = user.id;
      
      // Remove password before sending back
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const { userId } = req.session as any;
    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Remove password before sending back
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  // Pet routes
  app.get("/api/pets", async (req, res) => {
    try {
      const { type, status } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type;
      if (status) filters.status = status;
      
      const pets = await storage.getAllPets(filters);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      if (isNaN(petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/pets", requireAuth, requireRole(["shelter_staff", "admin"]), async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/pets/:id", requireAuth, requireRole(["shelter_staff", "admin"]), async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      if (isNaN(petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      const updatedPet = await storage.updatePet(petId, req.body);
      res.json(updatedPet);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Shelter routes
  app.get("/api/shelters", async (req, res) => {
    try {
      const shelters = await storage.getAllShelters();
      res.json(shelters);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/shelters/:id", async (req, res) => {
    try {
      const shelterId = parseInt(req.params.id);
      if (isNaN(shelterId)) {
        return res.status(400).json({ message: "Invalid shelter ID" });
      }
      
      const shelter = await storage.getShelter(shelterId);
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      
      res.json(shelter);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/shelters", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const shelterData = insertShelterSchema.parse(req.body);
      const shelter = await storage.createShelter(shelterData);
      res.status(201).json(shelter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shelter data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Adoption request routes
  app.post("/api/adoption-requests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      const requestData = insertAdoptionRequestSchema.parse({
        ...req.body,
        user_id: userId
      });
      
      // Check if pet exists
      const pet = await storage.getPet(requestData.pet_id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Check if pet is available
      if (pet.status !== "available") {
        return res.status(400).json({ message: "Pet is not available for adoption" });
      }
      
      const adoptionRequest = await storage.createAdoptionRequest(requestData);
      
      // Update pet status to pending
      await storage.updatePet(pet.id, { status: "pending" });
      
      res.status(201).json(adoptionRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/adoption-requests/user", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const requests = await storage.getAdoptionRequestsByUser(userId);
      
      // Get pet details for each request
      const requestsWithPets = await Promise.all(
        requests.map(async (request) => {
          const pet = await storage.getPet(request.pet_id);
          return { ...request, pet };
        })
      );
      
      res.json(requestsWithPets);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/adoption-requests/pet/:petId", requireAuth, requireRole(["shelter_staff", "admin"]), async (req, res) => {
    try {
      const petId = parseInt(req.params.petId);
      if (isNaN(petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      
      const requests = await storage.getAdoptionRequestsByPet(petId);
      
      // Get user details for each request
      const requestsWithUsers = await Promise.all(
        requests.map(async (request) => {
          const user = await storage.getUser(request.user_id);
          if (user) {
            // Remove password
            const { password, ...userWithoutPassword } = user;
            return { ...request, user: userWithoutPassword };
          }
          return request;
        })
      );
      
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/adoption-requests/:id", requireAuth, requireRole(["shelter_staff", "admin"]), async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.getAdoptionRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Adoption request not found" });
      }
      
      const updatedRequest = await storage.updateAdoptionRequest(requestId, { status });
      
      // Update pet status if request is approved
      if (status === "approved") {
        await storage.updatePet(request.pet_id, { status: "adopted" });
        
        // Reject other pending requests for the same pet
        const otherRequests = await storage.getAdoptionRequestsByPet(request.pet_id);
        for (const otherRequest of otherRequests) {
          if (otherRequest.id !== requestId && otherRequest.status === "pending") {
            await storage.updateAdoptionRequest(otherRequest.id, { status: "rejected" });
          }
        }
      } else if (status === "rejected" && request.status === "pending") {
        // If this was a pending request that's now rejected, check if all requests for this pet are rejected
        const petRequests = await storage.getAdoptionRequestsByPet(request.pet_id);
        const allRejected = petRequests.every(r => r.id === requestId || r.status === "rejected");
        
        if (allRejected) {
          // If all requests are rejected, set pet back to available
          await storage.updatePet(request.pet_id, { status: "available" });
        }
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Lost and found pet routes
  app.get("/api/lost-found-pets", async (req, res) => {
    try {
      const { type } = req.query;
      let validType: 'lost' | 'found' | undefined = undefined;
      
      if (type === 'lost' || type === 'found') {
        validType = type;
      }
      
      const pets = await storage.getAllLostFoundPets(validType);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/lost-found-pets", async (req, res) => {
    try {
      // If user is logged in, use their ID, otherwise use a default (guest) reporter
      let reporterId = 1; // Default guest user ID
      
      if (req.isAuthenticated()) {
        reporterId = (req.user as any).id;
      }
      
      console.log("Processing lost/found pet report with data:", JSON.stringify(req.body));
      
      // Convert date string to Date object if it's a string
      let formData = {...req.body};
      if (typeof formData.date === 'string') {
        formData.date = new Date(formData.date);
      }
      
      const petData = insertLostFoundPetSchema.parse({
        ...formData,
        reporter_id: reporterId
      });
      
      console.log("Validated pet data:", JSON.stringify(petData));
      
      const pet = await storage.createLostFoundPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      console.error("Error creating lost/found pet report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/lost-found-pets/:id", async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      if (isNaN(petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      
      const pet = await storage.getLostFoundPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Lost/found pet not found" });
      }
      
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/lost-found-pets/:id", requireAuth, async (req, res) => {
    try {
      const petId = parseInt(req.params.id);
      if (isNaN(petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      
      const pet = await storage.getLostFoundPet(petId);
      if (!pet) {
        return res.status(404).json({ message: "Lost/found pet not found" });
      }
      
      // Only allow update if user is the reporter or an admin
      const user = (req as any).user;
      if (pet.reporter_id !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized to update this report" });
      }
      
      const updatedPet = await storage.updateLostFoundPet(petId, req.body);
      res.json(updatedPet);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
