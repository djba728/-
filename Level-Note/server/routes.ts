import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check route
  app.get(api.health.check.path, async (_req, res) => {
    const dbStatus = await storage.checkHealth();
    res.json({ status: dbStatus ? "ok" : "degraded" });
  });

  return httpServer;
}
