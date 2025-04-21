import session from 'express-session';
import { createId } from '@paralleldrive/cuid2';
import createMemoryStore from 'memorystore';
import { 
  User, Pet, Shelter, AdoptionRequest, 
  LostFoundPet, InsertUser, 
  InsertPet, InsertShelter, InsertAdoptionRequest,
  InsertLostFoundPet
} from '@shared/schema';

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

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  sessionStore: any;
  private users: User[] = [];
  private pets: Pet[] = [];
  private shelters: Shelter[] = [];
  private adoptionRequests: AdoptionRequest[] = [];
  private lostFoundPets: LostFoundPet[] = [];
  private nextId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a default admin user
    this.users.push({
      id: this.nextId++,
      username: 'admin',
      password: 'admin123', // This is plain text for the in-memory storage
      email: 'admin@petrescuehub.com',
      name: 'Admin User',
      role: 'admin',
      bio: 'System administrator',
      phone: null,
      profile_picture: null
    });
    
    // Add a default adopter user
    this.users.push({
      id: this.nextId++,
      username: 'user',
      password: 'user123', // This is plain text for the in-memory storage
      email: 'user@example.com',
      name: 'Regular User',
      role: 'adopter',
      bio: 'Pet lover',
      phone: null,
      profile_picture: null
    });
    
    // Create some shelters
    this.createShelter({
      name: 'Happy Paws Rescue',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      phone: '555-123-4567',
      email: 'info@happypawsrescue.org',
      website: 'https://www.happypawsrescue.org',
      description: 'We specialize in rescuing and rehoming dogs and cats of all ages.'
    });
    
    this.createShelter({
      name: 'Second Chance Animal Shelter',
      address: '456 Oak Ave',
      city: 'Riverdale',
      state: 'NY',
      zip: '10471',
      phone: '555-987-6543',
      email: 'contact@secondchanceshelter.org',
      website: 'https://www.secondchanceshelter.org',
      description: 'Our mission is to rescue abandoned and stray animals and find them loving forever homes.'
    });
    
    // Create some pets
    this.createPet({
      name: 'Max',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      color: 'golden',
      weight: '65 lbs',
      description: 'Friendly and energetic dog who loves to play fetch.',
      status: 'available',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: false,
      shelter_id: 1,
      images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29sZGVuJTIwcmV0cmlldmVyfGVufDB8fDB8fHww']
    });
    
    this.createPet({
      name: 'Luna',
      type: 'cat',
      breed: 'Siamese',
      age: 2,
      gender: 'female',
      size: 'medium',
      color: 'cream with brown points',
      weight: '9 lbs',
      description: 'Elegant and vocal cat who enjoys being the center of attention.',
      status: 'available',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: true,
      shelter_id: 2,
      images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lhbWVzZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D']
    });
    
    this.createPet({
      name: 'Charlie',
      type: 'dog',
      breed: 'Beagle',
      age: 5,
      gender: 'male',
      size: 'medium',
      color: 'tricolor',
      weight: '25 lbs',
      description: 'Sweet beagle with a gentle disposition. Loves long walks and cuddles.',
      status: 'available',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: true,
      shelter_id: 1,
      images: ['https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhZ2xlfGVufDB8fDB8fHww']
    });
    
    // Add some lost and found pets
    this.createLostFoundPet({
      type: 'lost',
      pet_type: 'dog',
      breed: 'Labrador Retriever',
      name: 'Buddy',
      gender: 'male',
      description: 'Black lab with white spot on chest, wearing red collar with tags.',
      location: 'Lincoln Park, Chicago',
      date: new Date('2025-04-10'),
      status: 'open',
      reporter_id: 2,
      contact_name: 'John Smith',
      contact_email: 'john@example.com',
      contact_phone: '555-123-4567',
      images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBsYWJyYWRvcnxlbnwwfHwwfHx8MA%3D%3D']
    });
    
    this.createLostFoundPet({
      type: 'found',
      pet_type: 'cat',
      breed: 'Tabby',
      name: null,
      gender: 'unknown',
      description: 'Orange tabby cat, no collar, very friendly and appears well-fed.',
      location: 'Maple Street, Springfield',
      date: new Date('2025-04-15'),
      status: 'open',
      reporter_id: 1,
      contact_name: 'Jane Doe',
      contact_email: 'jane@example.com',
      contact_phone: '555-987-6543',
      images: ['https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRhYmJ5JTIwY2F0fGVufDB8fDB8fHww']
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextId++,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...user };
    return this.users[index];
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.find(pet => pet.id === id);
  }

  async getAllPets(filters?: Partial<Pet>): Promise<Pet[]> {
    if (!filters) return [...this.pets].sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
    
    return this.pets.filter(pet => {
      if (filters.type && pet.type !== filters.type) return false;
      if (filters.status && pet.status !== filters.status) return false;
      return true;
    }).sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const newPet: Pet = {
      id: this.nextId++,
      ...pet,
      created_at: new Date()
    };
    this.pets.push(newPet);
    return newPet;
  }

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet | undefined> {
    const index = this.pets.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.pets[index] = { ...this.pets[index], ...pet };
    return this.pets[index];
  }

  async deletePet(id: number): Promise<boolean> {
    const index = this.pets.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.pets.splice(index, 1);
    return true;
  }

  // Shelter operations
  async getShelter(id: number): Promise<Shelter | undefined> {
    return this.shelters.find(shelter => shelter.id === id);
  }

  async getAllShelters(): Promise<Shelter[]> {
    return [...this.shelters];
  }

  async createShelter(shelter: InsertShelter): Promise<Shelter> {
    const newShelter: Shelter = {
      id: this.nextId++,
      ...shelter
    };
    this.shelters.push(newShelter);
    return newShelter;
  }

  async updateShelter(id: number, shelter: Partial<Shelter>): Promise<Shelter | undefined> {
    const index = this.shelters.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.shelters[index] = { ...this.shelters[index], ...shelter };
    return this.shelters[index];
  }

  // Adoption request operations
  async getAdoptionRequest(id: number): Promise<AdoptionRequest | undefined> {
    return this.adoptionRequests.find(request => request.id === id);
  }

  async getAdoptionRequestsByPet(petId: number): Promise<AdoptionRequest[]> {
    return this.adoptionRequests
      .filter(request => request.pet_id === petId)
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
  }

  async getAdoptionRequestsByUser(userId: number): Promise<AdoptionRequest[]> {
    return this.adoptionRequests
      .filter(request => request.user_id === userId)
      .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
  }

  async createAdoptionRequest(request: InsertAdoptionRequest): Promise<AdoptionRequest> {
    const newRequest: AdoptionRequest = {
      id: this.nextId++,
      ...request,
      created_at: new Date()
    };
    this.adoptionRequests.push(newRequest);
    return newRequest;
  }

  async updateAdoptionRequest(id: number, request: Partial<AdoptionRequest>): Promise<AdoptionRequest | undefined> {
    const index = this.adoptionRequests.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    this.adoptionRequests[index] = { ...this.adoptionRequests[index], ...request };
    return this.adoptionRequests[index];
  }

  // Lost and found pet operations
  async getLostFoundPet(id: number): Promise<LostFoundPet | undefined> {
    return this.lostFoundPets.find(pet => pet.id === id);
  }

  async getAllLostFoundPets(type?: 'lost' | 'found'): Promise<LostFoundPet[]> {
    if (type) {
      return this.lostFoundPets
        .filter(pet => pet.type === type)
        .sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
    }
    return [...this.lostFoundPets].sort((a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0));
  }

  async createLostFoundPet(pet: InsertLostFoundPet): Promise<LostFoundPet> {
    const newPet: LostFoundPet = {
      id: this.nextId++,
      ...pet,
      created_at: new Date()
    };
    this.lostFoundPets.push(newPet);
    return newPet;
  }

  async updateLostFoundPet(id: number, pet: Partial<LostFoundPet>): Promise<LostFoundPet | undefined> {
    const index = this.lostFoundPets.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.lostFoundPets[index] = { ...this.lostFoundPets[index], ...pet };
    return this.lostFoundPets[index];
  }
}

// Export an instance of the storage implementation
export const storage = new MemStorage();