import { 
  users, type User, type InsertUser,
  pets, type Pet, type InsertPet,
  shelters, type Shelter, type InsertShelter,
  adoptionRequests, type AdoptionRequest, type InsertAdoptionRequest,
  lostFoundPets, type LostFoundPet, type InsertLostFoundPet,
  donations, type Donation, type InsertDonation
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
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
  
  // Donation operations
  getDonation(id: number): Promise<Donation | undefined>;
  getDonationsByUser(userId: number): Promise<Donation[]>;
  getDonationsByShelter(shelterId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private shelters: Map<number, Shelter>;
  private adoptionRequests: Map<number, AdoptionRequest>;
  private lostFoundPets: Map<number, LostFoundPet>;
  private donations: Map<number, Donation>;

  // Current IDs for auto-increment
  private userIdCounter: number;
  private petIdCounter: number;
  private shelterIdCounter: number;
  private adoptionRequestIdCounter: number;
  private lostFoundPetIdCounter: number;
  private donationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.shelters = new Map();
    this.adoptionRequests = new Map();
    this.lostFoundPets = new Map();
    this.donations = new Map();

    this.userIdCounter = 1;
    this.petIdCounter = 1;
    this.shelterIdCounter = 1;
    this.adoptionRequestIdCounter = 1;
    this.lostFoundPetIdCounter = 1;
    this.donationIdCounter = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Pet methods
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getAllPets(filters?: Partial<Pet>): Promise<Pet[]> {
    let pets = Array.from(this.pets.values());
    
    if (filters) {
      pets = pets.filter(pet => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true;
          return pet[key as keyof Pet] === value;
        });
      });
    }
    
    return pets;
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = this.petIdCounter++;
    const now = new Date();
    const pet: Pet = { 
      ...insertPet, 
      id, 
      created_at: now 
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePet(id: number, petData: Partial<Pet>): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (!pet) return undefined;

    const updatedPet = { ...pet, ...petData };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  async deletePet(id: number): Promise<boolean> {
    return this.pets.delete(id);
  }

  // Shelter methods
  async getShelter(id: number): Promise<Shelter | undefined> {
    return this.shelters.get(id);
  }

  async getAllShelters(): Promise<Shelter[]> {
    return Array.from(this.shelters.values());
  }

  async createShelter(insertShelter: InsertShelter): Promise<Shelter> {
    const id = this.shelterIdCounter++;
    const shelter: Shelter = { ...insertShelter, id };
    this.shelters.set(id, shelter);
    return shelter;
  }

  async updateShelter(id: number, shelterData: Partial<Shelter>): Promise<Shelter | undefined> {
    const shelter = this.shelters.get(id);
    if (!shelter) return undefined;

    const updatedShelter = { ...shelter, ...shelterData };
    this.shelters.set(id, updatedShelter);
    return updatedShelter;
  }

  // Adoption request methods
  async getAdoptionRequest(id: number): Promise<AdoptionRequest | undefined> {
    return this.adoptionRequests.get(id);
  }

  async getAdoptionRequestsByPet(petId: number): Promise<AdoptionRequest[]> {
    return Array.from(this.adoptionRequests.values()).filter(
      (request) => request.pet_id === petId,
    );
  }

  async getAdoptionRequestsByUser(userId: number): Promise<AdoptionRequest[]> {
    return Array.from(this.adoptionRequests.values()).filter(
      (request) => request.user_id === userId,
    );
  }

  async createAdoptionRequest(insertRequest: InsertAdoptionRequest): Promise<AdoptionRequest> {
    const id = this.adoptionRequestIdCounter++;
    const now = new Date();
    const request: AdoptionRequest = { 
      ...insertRequest, 
      id, 
      created_at: now 
    };
    this.adoptionRequests.set(id, request);
    return request;
  }

  async updateAdoptionRequest(id: number, requestData: Partial<AdoptionRequest>): Promise<AdoptionRequest | undefined> {
    const request = this.adoptionRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...requestData };
    this.adoptionRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Lost and found pet methods
  async getLostFoundPet(id: number): Promise<LostFoundPet | undefined> {
    return this.lostFoundPets.get(id);
  }

  async getAllLostFoundPets(type?: 'lost' | 'found'): Promise<LostFoundPet[]> {
    let pets = Array.from(this.lostFoundPets.values());
    
    if (type) {
      pets = pets.filter(pet => pet.type === type);
    }
    
    return pets;
  }

  async createLostFoundPet(insertPet: InsertLostFoundPet): Promise<LostFoundPet> {
    const id = this.lostFoundPetIdCounter++;
    const now = new Date();
    const pet: LostFoundPet = { 
      ...insertPet, 
      id, 
      created_at: now 
    };
    this.lostFoundPets.set(id, pet);
    return pet;
  }

  async updateLostFoundPet(id: number, petData: Partial<LostFoundPet>): Promise<LostFoundPet | undefined> {
    const pet = this.lostFoundPets.get(id);
    if (!pet) return undefined;

    const updatedPet = { ...pet, ...petData };
    this.lostFoundPets.set(id, updatedPet);
    return updatedPet;
  }

  // Donation methods
  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationsByUser(userId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.user_id === userId,
    );
  }

  async getDonationsByShelter(shelterId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.shelter_id === shelterId,
    );
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.donationIdCounter++;
    const now = new Date();
    const donation: Donation = { 
      ...insertDonation, 
      id, 
      created_at: now 
    };
    this.donations.set(id, donation);
    return donation;
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Create sample shelters
    const shelter1: InsertShelter = {
      name: "Happy Tails Rescue",
      address: "456 Shelter Rd",
      city: "Pet City",
      state: "PC",
      zip: "12345",
      phone: "(555) 987-6543",
      email: "info@happytailsrescue.org",
      website: "https://www.happytailsrescue.org",
      description: "A loving shelter dedicated to finding homes for pets",
    };
    
    const shelter2: InsertShelter = {
      name: "Paws & Claws Shelter",
      address: "789 Animal Ave",
      city: "Furry Town",
      state: "FT",
      zip: "54321",
      phone: "(555) 123-4567",
      email: "contact@pawsandclaws.org",
      website: "https://www.pawsandclaws.org",
      description: "Helping pets find loving homes since 2005",
    };
    
    this.createShelter(shelter1);
    this.createShelter(shelter2);
    
    // Create sample pets
    const pet1: InsertPet = {
      name: "Max",
      type: "dog",
      breed: "Golden Retriever",
      age: 3,
      gender: "male",
      size: "large",
      color: "golden",
      weight: "65 lbs",
      description: "Max is a friendly, energetic dog who loves long walks and playing fetch. Great with kids!",
      status: "available",
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: false,
      shelter_id: 1,
      images: [
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1568572933382-74d440642117?ixlib=rb-1.2.1&auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const pet2: InsertPet = {
      name: "Luna",
      type: "cat",
      breed: "Domestic Shorthair",
      age: 1,
      gender: "female",
      size: "small",
      color: "gray tabby",
      weight: "8 lbs",
      description: "Luna is a sweet, affectionate cat who loves to cuddle. She's very playful and gets along with other cats.",
      status: "pending",
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: true,
      shelter_id: 1,
      images: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const pet3: InsertPet = {
      name: "Rocky",
      type: "dog",
      breed: "Boxer Mix",
      age: 5,
      gender: "male",
      size: "large",
      color: "brown",
      weight: "75 lbs",
      description: "Rocky is an active, loyal dog looking for an experienced owner. He needs regular exercise and training.",
      status: "available",
      good_with_children: false,
      good_with_dogs: true,
      good_with_cats: false,
      shelter_id: 2,
      images: [
        "https://images.unsplash.com/photo-1583795128727-6ec3642408f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const pet4: InsertPet = {
      name: "Bella",
      type: "cat",
      breed: "Siamese Mix",
      age: 2,
      gender: "female",
      size: "small",
      color: "cream",
      weight: "7 lbs",
      description: "Bella is a quiet, gentle cat who enjoys sitting in sunny spots. She's very clean and well-behaved.",
      status: "available",
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: true,
      shelter_id: 2,
      images: [
        "https://images.unsplash.com/photo-1518288774672-b94e808873ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    this.createPet(pet1);
    this.createPet(pet2);
    this.createPet(pet3);
    this.createPet(pet4);
    
    // Create sample users
    const user1: InsertUser = {
      username: "johndoe",
      password: "password123",  // In a real app, this would be hashed
      email: "john@example.com",
      name: "John Doe",
      phone: "(555) 111-2222",
      role: "adopter",
      bio: "Animal lover looking to adopt a new friend",
      profile_picture: "https://randomuser.me/api/portraits/men/1.jpg",
    };
    
    const user2: InsertUser = {
      username: "sarahsmith",
      password: "password456",  // In a real app, this would be hashed
      email: "sarah@example.com",
      name: "Sarah Smith",
      phone: "(555) 333-4444",
      role: "rescuer",
      bio: "Passionate about rescuing animals in need",
      profile_picture: "https://randomuser.me/api/portraits/women/1.jpg",
    };
    
    this.createUser(user1);
    this.createUser(user2);
    
    // Create sample lost/found pets
    const lostPet1: InsertLostFoundPet = {
      type: "lost",
      pet_type: "dog",
      breed: "Beagle Mix",
      name: "Charlie",
      gender: "male",
      description: "Blue collar with tags, very friendly",
      location: "Oak Park",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "open",
      reporter_id: 1,
      contact_name: "John Doe",
      contact_email: "john@example.com",
      contact_phone: "(555) 111-2222",
      images: [
        "https://images.unsplash.com/photo-1517423738875-5ce310acd3da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const foundPet1: InsertLostFoundPet = {
      type: "found",
      pet_type: "cat",
      breed: "Tabby",
      name: "",
      gender: "female",
      description: "No collar, friendly, appears well-fed",
      location: "Westfield Mall",
      date: new Date(), // today
      status: "open",
      reporter_id: 2,
      contact_name: "Sarah Smith",
      contact_email: "sarah@example.com",
      contact_phone: "(555) 333-4444",
      images: [
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const lostPet2: InsertLostFoundPet = {
      type: "lost",
      pet_type: "cat",
      breed: "Calico Cat",
      name: "Rosie",
      gender: "female",
      description: "Pink collar, microchipped, shy",
      location: "Riverview Apts",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "open",
      reporter_id: 1,
      contact_name: "John Doe",
      contact_email: "john@example.com",
      contact_phone: "(555) 111-2222",
      images: [
        "https://images.unsplash.com/photo-1523626797181-8c5ae80d40c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    const foundPet2: InsertLostFoundPet = {
      type: "found",
      pet_type: "dog",
      breed: "Terrier Mix",
      name: "",
      gender: "male",
      description: "Black collar, no tags, friendly",
      location: "Central Park",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: "open",
      reporter_id: 2,
      contact_name: "Sarah Smith",
      contact_email: "sarah@example.com",
      contact_phone: "(555) 333-4444",
      images: [
        "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-1.2.1&auto=format&fit=crop&w=800"
      ],
    };
    
    this.createLostFoundPet(lostPet1);
    this.createLostFoundPet(foundPet1);
    this.createLostFoundPet(lostPet2);
    this.createLostFoundPet(foundPet2);
  }
}

export const storage = new MemStorage();
