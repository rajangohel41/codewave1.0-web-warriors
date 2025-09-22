import { RequestHandler } from "express";
import { userDB, sessionDB } from "../database";

// Simple password validation (in production, use bcrypt)
const validatePassword = (password: string, userPassword: string): boolean => {
  return password === userPassword; // In production: await bcrypt.compare(password, userPassword)
};

const hashPassword = (password: string): string => {
  return password; // In production: await bcrypt.hash(password, 10)
};

// POST /api/auth/signup
export const handleSignup: RequestHandler = async (req, res) => {
  console.log('Signup attempt:', { name: req.body?.name, email: req.body?.email, hasPassword: !!req.body?.password });

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('Signup failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      console.log('Signup failed: Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = userDB.findByEmail(email);
    if (existingUser) {
      console.log('Signup failed: User already exists');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    const user = userDB.create({
      name,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinDate: new Date().toISOString(),
      tripCount: 0
    });

    console.log('User created:', { id: user.id, email: user.email });

    // Create session
    const sessionId = sessionDB.create(user.id);
    console.log('Session created:', { sessionId: sessionId.substring(0, 8) + '...' });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log('Signup successful:', { userId: user.id, email: user.email });
    res.json({
      success: true,
      user: userWithoutPassword,
      sessionId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
        message: 'Internal server error'
    });
  }
};

// POST /api/auth/login
export const handleLogin: RequestHandler = async (req, res) => {
  console.log('Login attempt:', { email: req.body?.email, hasPassword: !!req.body?.password });

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = userDB.findByEmail(email);
    console.log('User lookup result:', { email, found: !!user });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isValid = validatePassword(password, user.password);
    console.log('Password validation:', { isValid });

    if (!isValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create session
    const sessionId = sessionDB.create(user.id);
    console.log('Session created:', { sessionId: sessionId.substring(0, 8) + '...' });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    console.log('Login successful:', { userId: user.id, email: user.email });
    res.json({
      success: true,
      user: userWithoutPassword,
      sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/auth/logout
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionId) {
      sessionDB.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// GET /api/auth/me
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({ 
        success: false, 
        message: 'No session token provided' 
      });
    }

    const session = sessionDB.find(sessionId);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    const user = userDB.findById(session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Middleware to authenticate requests
export const authenticateUser: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const session = sessionDB.find(sessionId);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    const user = userDB.findById(session.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
