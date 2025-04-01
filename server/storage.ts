import { pgTable } from 'drizzle-orm/pg-core';
import { json } from 'drizzle-orm/pg-core';
import { eq, and, desc, asc } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { 
  User, Pet, Shelter, AdoptionRequest, 
  LostFoundPet, InsertUser, 
  InsertPet, InsertShelter, InsertAdoptionRequest,
  InsertLostFoundPet,
  users, pets, shelters, adoptionRequests, lostFoundPets
} from '@shared/schema';
import { db } from './db';

export interface IStorage {
  sessionStore: any; // session store
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Pet operations
  getPet(id: number): Promise<Pet | undefined>;
  getAllPets(filters?: Partial<Pet>): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<Pet>): Promise<Pet | undefined>;
  deletePet(id: number): Promise<boolean>;
  
  // Shelter operations
  getShelter(id: number): Promise<Shelter | undefined>;
  getAllShelters(): Promise<Shelter[]>;
  createShelter(shelter: InsertShelter): Promise<Shelter>;
  updateShelter(id: number, shelter: Partial<Shelter>): Promise<Shelter | undefined>;
  
  // Adoption request operations
  getAdoptionRequest(id: number): Promise<AdoptionRequest | undefined>;
  getAdoptionRequestsByPet(petId: number): Promise<AdoptionRequest[]>;
  getAdoptionRequestsByUser(userId: number): Promise<AdoptionRequest[]>;
  createAdoptionRequest(request: InsertAdoptionRequest): Promise<AdoptionRequest>;
  updateAdoptionRequest(id: number, request: Partial<AdoptionRequest>): Promise<AdoptionRequest | undefined>;
  
  // Lost and found pet operations
  getLostFoundPet(id: number): Promise<LostFoundPet | undefined>;
  getAllLostFoundPets(type?: 'lost' | 'found'): Promise<LostFoundPet[]>;
  createLostFoundPet(pet: InsertLostFoundPet): Promise<LostFoundPet>;
  updateLostFoundPet(id: number, pet: Partial<LostFoundPet>): Promise<LostFoundPet | undefined>;
  

}

// Create a database store for sessions
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL!,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }

  async getAllPets(filters?: Partial<Pet>): Promise<Pet[]> {
    // Convert filters to where conditions
    const whereConditions = [];
    if (filters?.type) whereConditions.push(eq(pets.type, filters.type));
    if (filters?.status) whereConditions.push(eq(pets.status, filters.status));
    
    // No filters, return all
    if (whereConditions.length === 0) {
      return db.select().from(pets).orderBy(desc(pets.created_at));
    }
    
    // Apply filters
    return db
      .select()
      .from(pets)
      .where(and(...whereConditions))
      .orderBy(desc(pets.created_at));
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const [createdPet] = await db.insert(pets).values(pet).returning();
    return createdPet;
  }

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet | undefined> {
    const [updatedPet] = await db
      .update(pets)
      .set(pet)
      .where(eq(pets.id, id))
      .returning();
    return updatedPet;
  }

  async deletePet(id: number): Promise<boolean> {
    await db.delete(pets).where(eq(pets.id, id));
    return true;
  }

  // Shelter operations
  async getShelter(id: number): Promise<Shelter | undefined> {
    const [shelter] = await db.select().from(shelters).where(eq(shelters.id, id));
    return shelter;
  }

  async getAllShelters(): Promise<Shelter[]> {
    return db.select().from(shelters);
  }

  async createShelter(shelter: InsertShelter): Promise<Shelter> {
    const [createdShelter] = await db.insert(shelters).values(shelter).returning();
    return createdShelter;
  }

  async updateShelter(id: number, shelter: Partial<Shelter>): Promise<Shelter | undefined> {
    const [updatedShelter] = await db
      .update(shelters)
      .set(shelter)
      .where(eq(shelters.id, id))
      .returning();
    return updatedShelter;
  }

  // Adoption request operations
  async getAdoptionRequest(id: number): Promise<AdoptionRequest | undefined> {
    const [request] = await db.select().from(adoptionRequests).where(eq(adoptionRequests.id, id));
    return request;
  }

  async getAdoptionRequestsByPet(petId: number): Promise<AdoptionRequest[]> {
    return db
      .select()
      .from(adoptionRequests)
      .where(eq(adoptionRequests.pet_id, petId))
      .orderBy(desc(adoptionRequests.created_at));
  }

  async getAdoptionRequestsByUser(userId: number): Promise<AdoptionRequest[]> {
    return db
      .select()
      .from(adoptionRequests)
      .where(eq(adoptionRequests.user_id, userId))
      .orderBy(desc(adoptionRequests.created_at));
  }

  async createAdoptionRequest(request: InsertAdoptionRequest): Promise<AdoptionRequest> {
    const [createdRequest] = await db.insert(adoptionRequests).values(request).returning();
    return createdRequest;
  }

  async updateAdoptionRequest(id: number, request: Partial<AdoptionRequest>): Promise<AdoptionRequest | undefined> {
    const [updatedRequest] = await db
      .update(adoptionRequests)
      .set(request)
      .where(eq(adoptionRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Lost and found pet operations
  async getLostFoundPet(id: number): Promise<LostFoundPet | undefined> {
    const [pet] = await db.select().from(lostFoundPets).where(eq(lostFoundPets.id, id));
    return pet;
  }

  async getAllLostFoundPets(type?: 'lost' | 'found'): Promise<LostFoundPet[]> {
    if (type) {
      return db
        .select()
        .from(lostFoundPets)
        .where(eq(lostFoundPets.type, type))
        .orderBy(desc(lostFoundPets.created_at));
    }
    return db.select().from(lostFoundPets).orderBy(desc(lostFoundPets.created_at));
  }

  async createLostFoundPet(pet: InsertLostFoundPet): Promise<LostFoundPet> {
    const [createdPet] = await db.insert(lostFoundPets).values(pet).returning();
    return createdPet;
  }

  async updateLostFoundPet(id: number, pet: Partial<LostFoundPet>): Promise<LostFoundPet | undefined> {
    const [updatedPet] = await db
      .update(lostFoundPets)
      .set(pet)
      .where(eq(lostFoundPets.id, id))
      .returning();
    return updatedPet;
  }


}

// Export an instance of the storage implementation
export const storage = new DatabaseStorage();