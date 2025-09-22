// Simple in-memory database for demo purposes
// In production, replace with PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // In production, use bcrypt hash
  avatar?: string;
  joinDate: string;
  tripCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  cost: number;
  travelers: number;
  budget?: number;
  interests: string[];
  status: 'planned' | 'completed' | 'upcoming';
  thumbnail?: string;
  itinerary: DayPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface DayPlan {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  totalCost: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  duration: string;
  cost: string;
  type: 'attraction' | 'restaurant' | 'activity' | 'transport';
  rating?: number;
}

// In-memory storage
const users: Map<string, User> = new Map();
const trips: Map<string, Trip> = new Map();
const sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

// User operations
export const userDB = {
  create: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };
    users.set(id, newUser);
    return newUser;
  },

  findByEmail: (email: string): User | undefined => {
    return Array.from(users.values()).find(user => user.email === email);
  },

  findById: (id: string): User | undefined => {
    return users.get(id);
  },

  update: (id: string, updates: Partial<User>): User | undefined => {
    const user = users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    users.set(id, updatedUser);
    return updatedUser;
  },

  delete: (id: string): boolean => {
    return users.delete(id);
  },

  getAll: (): User[] => {
    return Array.from(users.values());
  }
};

// Trip operations
export const tripDB = {
  create: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newTrip: Trip = {
      ...trip,
      id,
      createdAt: now,
      updatedAt: now
    };
    trips.set(id, newTrip);
    
    // Update user trip count
    const user = userDB.findById(trip.userId);
    if (user) {
      userDB.update(user.id, { tripCount: user.tripCount + 1 });
    }
    
    return newTrip;
  },

  findById: (id: string): Trip | undefined => {
    return trips.get(id);
  },

  findByUserId: (userId: string): Trip[] => {
    return Array.from(trips.values()).filter(trip => trip.userId === userId);
  },

  update: (id: string, updates: Partial<Trip>): Trip | undefined => {
    const trip = trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = {
      ...trip,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    trips.set(id, updatedTrip);
    return updatedTrip;
  },

  delete: (id: string): boolean => {
    const trip = trips.get(id);
    if (trip) {
      // Update user trip count
      const user = userDB.findById(trip.userId);
      if (user && user.tripCount > 0) {
        userDB.update(user.id, { tripCount: user.tripCount - 1 });
      }
    }
    return trips.delete(id);
  },

  getAll: (): Trip[] => {
    return Array.from(trips.values());
  }
};

// Session operations
export const sessionDB = {
  create: (userId: string): string => {
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    sessions.set(sessionId, { userId, expiresAt });
    return sessionId;
  },

  find: (sessionId: string): { userId: string; expiresAt: Date } | undefined => {
    const session = sessions.get(sessionId);
    if (!session) return undefined;
    
    // Check if session expired
    if (session.expiresAt < new Date()) {
      sessions.delete(sessionId);
      return undefined;
    }
    
    return session;
  },

  delete: (sessionId: string): boolean => {
    return sessions.delete(sessionId);
  },

  cleanup: (): void => {
    const now = new Date();
    for (const [sessionId, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(sessionId);
      }
    }
  }
};

// Seed some demo data
export const seedDatabase = () => {
  console.log('Starting database seeding...');

  // Create demo user
  const demoUser = userDB.create({
    email: 'demo@travelgenius.com',
    name: 'Demo User',
    password: 'demo123', // In production: await bcrypt.hash('demo123', 10)
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo@travelgenius.com',
    joinDate: new Date('2024-01-01').toISOString(),
    tripCount: 0
  });

  console.log('Demo user created:', { id: demoUser.id, email: demoUser.email });

  // Create some demo trips
  const parisTrip = tripDB.create({
    userId: demoUser.id,
    destination: 'Paris, France',
    startDate: '2024-06-15',
    endDate: '2024-06-20',
    duration: 5,
    cost: 1250,
    travelers: 2,
    budget: 1500,
    interests: ['Culture', 'Food', 'History'],
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=250&fit=crop',
    itinerary: []
  });

  const tokyoTrip = tripDB.create({
    userId: demoUser.id,
    destination: 'Tokyo, Japan',
    startDate: '2024-08-10',
    endDate: '2024-08-17',
    duration: 7,
    cost: 2100,
    travelers: 2,
    budget: 2500,
    interests: ['Food', 'Culture', 'Shopping'],
    status: 'upcoming',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
    itinerary: []
  });

  console.log('Demo trips created:', { parisTrip: parisTrip.id, tokyoTrip: tokyoTrip.id });
  console.log('Database seeded successfully with demo data');
  console.log('Available users:', userDB.getAll().map(u => ({ id: u.id, email: u.email })));
};

// Cleanup expired sessions every hour
setInterval(sessionDB.cleanup, 60 * 60 * 1000);
