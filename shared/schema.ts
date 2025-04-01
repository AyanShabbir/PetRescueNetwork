import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User related schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("adopter"), // adopter, rescuer, veterinarian, shelter_staff, admin
  bio: text("bio"),
  profile_picture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Pet related schemas
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // dog, cat, bird, etc.
  breed: text("breed"),
  age: integer("age"),
  gender: text("gender"), // male, female, unknown
  size: text("size"), // small, medium, large
  color: text("color"),
  weight: text("weight"),
  description: text("description"),
  status: text("status").notNull().default("available"), // available, pending, adopted
  good_with_children: boolean("good_with_children"),
  good_with_dogs: boolean("good_with_dogs"),
  good_with_cats: boolean("good_with_cats"),
  shelter_id: integer("shelter_id"),
  created_at: timestamp("created_at").defaultNow(),
  images: jsonb("images").default([]),
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  created_at: true,
});

// Shelter related schemas
export const shelters = pgTable("shelters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  description: text("description"),
});

export const insertShelterSchema = createInsertSchema(shelters).omit({
  id: true,
});

// Adoption request schema
export const adoptionRequests = pgTable("adoption_requests", {
  id: serial("id").primaryKey(),
  pet_id: integer("pet_id").notNull(),
  user_id: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  created_at: timestamp("created_at").defaultNow(),
  message: text("message"),
});

export const insertAdoptionRequestSchema = createInsertSchema(adoptionRequests).omit({
  id: true,
  created_at: true,
});

// Lost and found pet reporting
export const lostFoundPets = pgTable("lost_found_pets", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // lost, found
  pet_type: text("pet_type").notNull(), // dog, cat, etc.
  breed: text("breed"),
  name: text("name"),
  gender: text("gender"),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("open"), // open, closed
  reporter_id: integer("reporter_id").notNull(),
  contact_name: text("contact_name").notNull(),
  contact_email: text("contact_email").notNull(),
  contact_phone: text("contact_phone").notNull(),
  images: jsonb("images").default([]),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertLostFoundPetSchema = createInsertSchema(lostFoundPets).omit({
  id: true,
  created_at: true,
});



// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;

export type Shelter = typeof shelters.$inferSelect;
export type InsertShelter = z.infer<typeof insertShelterSchema>;

export type AdoptionRequest = typeof adoptionRequests.$inferSelect;
export type InsertAdoptionRequest = z.infer<typeof insertAdoptionRequestSchema>;

export type LostFoundPet = typeof lostFoundPets.$inferSelect;
export type InsertLostFoundPet = z.infer<typeof insertLostFoundPetSchema>;
