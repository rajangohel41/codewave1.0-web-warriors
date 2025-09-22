import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { 
  handleSignup, 
  handleLogin, 
  handleLogout, 
  handleGetUser, 
  authenticateUser 
} from "./routes/auth";
import { 
  handleGenerateTrip, 
  handleGetTrips, 
  handleGetTrip, 
  handleUpdateTrip, 
  handleDeleteTrip 
} from "./routes/trips";
import { seedDatabase, userDB, tripDB } from "./database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Seed database with demo data
  seedDatabase();

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    const users = userDB.getAll();
    const trips = tripDB.getAll();

    console.log('Health check:', {
      userCount: users.length,
      tripCount: trips.length,
      demoUser: users.find(u => u.email === 'demo@travelgenius.com')?.id
    });

    res.json({
      message: ping,
      timestamp: new Date().toISOString(),
      database: {
        users: users.length,
        trips: trips.length,
        status: 'connected'
      }
    });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/me", handleGetUser);

  // Protected trip routes
  app.post("/api/trips/generate", authenticateUser, handleGenerateTrip);
  app.get("/api/trips", authenticateUser, handleGetTrips);
  app.get("/api/trips/:id", authenticateUser, handleGetTrip);
  app.put("/api/trips/:id", authenticateUser, handleUpdateTrip);
  app.delete("/api/trips/:id", authenticateUser, handleDeleteTrip);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong!' 
    });
  });

  return app;
}
