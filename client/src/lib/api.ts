import { apiRequest } from "./queryClient";
import { Pet, LostFoundPet, AdoptionRequest, Shelter, Donation } from "@shared/schema";

// Authentication related API calls
export const authAPI = {
  login: (username: string, password: string) => {
    return apiRequest("POST", "/api/auth/login", { username, password });
  },
  
  register: (userData: any) => {
    return apiRequest("POST", "/api/auth/register", userData);
  },
  
  logout: () => {
    return apiRequest("POST", "/api/auth/logout", {});
  },
  
  getCurrentUser: async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include"
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to get current user");
    }
    
    return response.json();
  }
};

// Pet related API calls
export const petsAPI = {
  getAllPets: async (filters?: { type?: string, status?: string }): Promise<Pet[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    
    const url = `/api/pets${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch pets");
    }
    
    return response.json();
  },
  
  getPetById: async (id: number): Promise<Pet> => {
    const response = await fetch(`/api/pets/${id}`, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch pet details");
    }
    
    return response.json();
  },
  
  createPet: (petData: any) => {
    return apiRequest("POST", "/api/pets", petData);
  },
  
  updatePet: (id: number, petData: any) => {
    return apiRequest("PUT", `/api/pets/${id}`, petData);
  }
};

// Lost and found pets related API calls
export const lostFoundAPI = {
  getAllLostFoundPets: async (type?: 'lost' | 'found'): Promise<LostFoundPet[]> => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    
    const url = `/api/lost-found-pets${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch lost and found pets");
    }
    
    return response.json();
  },
  
  getLostFoundPetById: async (id: number): Promise<LostFoundPet> => {
    const response = await fetch(`/api/lost-found-pets/${id}`, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch lost/found pet details");
    }
    
    return response.json();
  },
  
  reportLostFoundPet: (petData: any) => {
    return apiRequest("POST", "/api/lost-found-pets", petData);
  },
  
  updateLostFoundPet: (id: number, petData: any) => {
    return apiRequest("PUT", `/api/lost-found-pets/${id}`, petData);
  }
};

// Adoption requests related API calls
export const adoptionAPI = {
  submitAdoptionRequest: (requestData: any) => {
    return apiRequest("POST", "/api/adoption-requests", requestData);
  },
  
  getUserAdoptionRequests: async (): Promise<AdoptionRequest[]> => {
    const response = await fetch("/api/adoption-requests/user", { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user adoption requests");
    }
    
    return response.json();
  },
  
  getPetAdoptionRequests: async (petId: number): Promise<AdoptionRequest[]> => {
    const response = await fetch(`/api/adoption-requests/pet/${petId}`, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch pet adoption requests");
    }
    
    return response.json();
  },
  
  updateAdoptionRequest: (id: number, status: string) => {
    return apiRequest("PUT", `/api/adoption-requests/${id}`, { status });
  }
};

// Shelter related API calls
export const sheltersAPI = {
  getAllShelters: async (): Promise<Shelter[]> => {
    const response = await fetch("/api/shelters", { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch shelters");
    }
    
    return response.json();
  },
  
  getShelterById: async (id: number): Promise<Shelter> => {
    const response = await fetch(`/api/shelters/${id}`, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch shelter details");
    }
    
    return response.json();
  },
  
  createShelter: (shelterData: any) => {
    return apiRequest("POST", "/api/shelters", shelterData);
  }
};

// Donation related API calls
export const donationsAPI = {
  makeDonation: (donationData: any) => {
    return apiRequest("POST", "/api/donations", donationData);
  },
  
  getUserDonations: async (): Promise<Donation[]> => {
    const response = await fetch("/api/donations/user", { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user donations");
    }
    
    return response.json();
  },
  
  getShelterDonations: async (shelterId: number): Promise<Donation[]> => {
    const response = await fetch(`/api/donations/shelter/${shelterId}`, { credentials: "include" });
    
    if (!response.ok) {
      throw new Error("Failed to fetch shelter donations");
    }
    
    return response.json();
  }
};
