import { db } from "./db";
import { app_data } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // We can add methods here if we decide to sync data later.
  // For now, it's a placeholder.
  checkHealth(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async checkHealth(): Promise<boolean> {
    try {
      await db.select().from(app_data).limit(1);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
