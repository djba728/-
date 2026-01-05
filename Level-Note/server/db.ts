import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Default to a dummy connection string if not present to avoid crashing build steps
// in environments where DB isn't strictly needed for the static app,
// but usually Replit provides DATABASE_URL.
const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
