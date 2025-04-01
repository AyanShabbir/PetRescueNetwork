import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import 'dotenv/config';

// Check if database URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Create database connection
const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });