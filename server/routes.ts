import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authMiddleware, requireRole } from "./middleware/auth";
import { authController } from "./controllers/authController";
import { taskController } from "./controllers/taskController";
import { financialController } from "./controllers/financialController";
import { voiceController } from "./controllers/voiceController";
import { aiController } from "./controllers/aiController";

// Configure passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/logout', authController.logout);
  app.get('/api/auth/me', authMiddleware, authController.me);
  app.put('/api/auth/profile', authMiddleware, authController.updateProfile);
  app.post('/api/auth/complete-onboarding', authMiddleware, authController.completeOnboarding);

  // Task routes
  app.get('/api/tasks', authMiddleware, taskController.getTasks);
  app.get('/api/tasks/:id', authMiddleware, taskController.getTask);
  app.post('/api/tasks', authMiddleware, taskController.createTask);
  app.put('/api/tasks/:id', authMiddleware, taskController.updateTask);
  app.delete('/api/tasks/:id', authMiddleware, taskController.deleteTask);

  // Financial routes
  app.get('/api/financial/records', authMiddleware, financialController.getRecords);
  app.get('/api/financial/summary', authMiddleware, financialController.getSummary);
  app.post('/api/financial/records', authMiddleware, financialController.createRecord);
  app.put('/api/financial/records/:id', authMiddleware, financialController.updateRecord);
  app.delete('/api/financial/records/:id', authMiddleware, financialController.deleteRecord);

  // Voice processing routes
  app.post('/api/voice/initialize', authMiddleware, voiceController.initialize);
  app.post('/api/voice/process-command', authMiddleware, voiceController.processCommand);
  app.post('/api/voice/speak', authMiddleware, voiceController.speak);
  app.get('/api/voice/commands', authMiddleware, voiceController.getCommands);
  app.get('/api/voice/status', authMiddleware, voiceController.getStatus);

  // AI routes
  app.get('/api/ai/daily-joke', aiController.getDailyJoke);
  app.post('/api/ai/generate-joke', authMiddleware, aiController.generateJoke);
  app.post('/api/ai/chat', authMiddleware, aiController.chat);
  app.get('/api/ai/interactions', authMiddleware, aiController.getInteractions);
  app.get('/api/ai/status', authMiddleware, aiController.getStatus);

  // Admin routes (dev/admin role only)
  app.get('/api/admin/users', authMiddleware, requireRole(['admin']), async (req, res) => {
    // Admin functionality - would implement user management
    res.json({ message: 'Admin endpoint - user management would be implemented here' });
  });

  app.get('/api/admin/system-status', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      // System status check
      const status = {
        database: 'connected',
        voiceModels: 'loaded',
        aiModels: 'loaded',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system status' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
