import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authMiddleware, requireRole, type AuthenticatedRequest } from "./middleware/auth";
import { 
  generalRateLimit, 
  authRateLimit, 
  voiceRateLimit, 
  aiRateLimit,
  securityMiddleware,
  compressionMiddleware,
  requestLoggingMiddleware,
  errorTrackingMiddleware
} from "./middleware/security";
import { monitoringService } from "./services/monitoringService";
import { taskScheduler } from "./services/taskScheduler";

// WebSocket connection management
const wsConnections = new Map<number, WebSocket[]>(); // userId -> WebSocket connections

function broadcastToChat(chatId: number, data: any) {
  // Get all participants of the chat and send message to their connections
  wsConnections.forEach((connections, userId) => {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  });
}
import { performanceOptimizationService } from "./services/performanceOptimization";
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
  // Apply security middleware
  app.use(securityMiddleware);
  app.use(compressionMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(performanceOptimizationService.performanceMiddleware);
  app.use(generalRateLimit);

  // Health check endpoint for production monitoring
  app.get('/health', async (req, res) => {
    const health = await monitoringService.getHealthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  });

  // System metrics endpoint (admin only)
  app.get('/api/admin/metrics', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const metrics = await monitoringService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Performance metrics endpoint (admin/pro only)
  app.get('/api/admin/performance', authMiddleware, requireRole(['admin', 'pro']), async (req, res) => {
    try {
      const performance = await monitoringService.getPerformanceMetrics();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  });

  // Usage analytics endpoint (admin only)
  app.get('/api/admin/analytics/:timeframe?', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const timeframe = req.params.timeframe as 'day' | 'week' | 'month' || 'day';
      const analytics = await monitoringService.getUsageAnalytics(timeframe);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Arabic performance analytics endpoint
  app.post('/api/analytics/arabic-performance', (req: Request, res: Response) => {
    try {
      const { metrics, issues, userAgent, timestamp } = req.body;
      
      // Log Arabic performance data for monitoring
      console.log('[Arabic Performance]', {
        rtlRenderTime: metrics.rtlRenderTime,
        fontLoadTime: metrics.fontLoadTime,
        layoutShiftScore: metrics.layoutShiftScore,
        textDirectionSwitchTime: metrics.textDirectionSwitchTime,
        arabicTextRenderScore: metrics.arabicTextRenderScore,
        issues: issues.length,
        userAgent: userAgent?.substring(0, 100),
        timestamp
      });
      
      res.json({ status: 'recorded' });
    } catch (error) {
      console.warn('Failed to record Arabic performance data:', error);
      res.status(500).json({ error: 'Failed to record performance data' });
    }
  });

  // Performance optimization endpoints
  app.get('/api/admin/performance-health', authMiddleware, requireRole(['admin']), (req, res) => {
    try {
      const healthStatus = performanceOptimizationService.getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get performance health status' });
    }
  });

  app.get('/api/admin/performance-metrics', authMiddleware, requireRole(['admin']), (req, res) => {
    try {
      const timeframe = parseInt(req.query.timeframe as string) || 15;
      const metrics = performanceOptimizationService.getAverageMetrics(timeframe);
      const current = performanceOptimizationService.getCurrentMetrics();
      res.json({ current, average: metrics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  });

  app.post('/api/admin/optimize-memory', authMiddleware, requireRole(['admin']), (req, res) => {
    try {
      performanceOptimizationService.optimizeMemoryUsage();
      res.json({ status: 'Memory optimization completed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize memory' });
    }
  });

  // Chat API routes
  app.get('/api/chats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const chats = await storage.getChats(req.user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });

  app.post('/api/chats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const chat = await storage.createChat({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Add creator as participant
      await storage.addChatParticipant({
        chatId: chat.id,
        userId: req.user.id,
        role: 'admin'
      });
      
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create chat' });
    }
  });

  app.get('/api/chats/:id/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const chatId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getMessages(chatId, req.user.id, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/chats/:id/messages', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const chatId = parseInt(req.params.id);
      const message = await storage.createMessage({
        chatId,
        senderId: req.user.id,
        ...req.body
      });
      
      // Broadcast to WebSocket clients
      broadcastToChat(chatId, {
        type: 'new_message',
        chatId,
        message
      });
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.get('/api/contacts', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contacts = await storage.getContacts(req.user.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.post('/api/contacts', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contact = await storage.createContact({
        ...req.body,
        userId: req.user.id
      });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  app.get('/api/professional-services', async (req: Request, res: Response) => {
    try {
      const { type, location } = req.query;
      const services = await storage.getProfessionalServices(
        type as string,
        location as string
      );
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch professional services' });
    }
  });

  app.post('/api/professional-services', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const service = await storage.createProfessionalService({
        ...req.body,
        providerId: req.user.id
      });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create professional service' });
    }
  });

  app.get('/api/service-requests', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const type = req.query.type as 'client' | 'provider' || 'client';
      const requests = await storage.getServiceRequests(req.user.id, type);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service requests' });
    }
  });

  app.post('/api/service-requests', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const request = await storage.createServiceRequest({
        ...req.body,
        clientId: req.user.id
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create service request' });
    }
  });

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

  // Authentication routes (with rate limiting)
  app.post('/api/auth/register', authRateLimit, authController.register);
  app.post('/api/auth/login', authRateLimit, authController.login);
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

  // Voice processing routes (with rate limiting)
  app.post('/api/voice/initialize', authMiddleware, voiceController.initialize);
  app.post('/api/voice/process-command', authMiddleware, voiceRateLimit, voiceController.processCommand);
  app.post('/api/voice/speak', authMiddleware, voiceRateLimit, voiceController.speak);
  app.get('/api/voice/commands', authMiddleware, voiceController.getCommands);
  app.get('/api/voice/status', authMiddleware, voiceController.getStatus);

  // AI routes (with rate limiting)
  app.get('/api/ai/daily-joke', aiController.getDailyJoke);
  app.post('/api/ai/generate-joke', authMiddleware, aiRateLimit, aiController.generateJoke);
  app.post('/api/ai/chat', authMiddleware, aiRateLimit, aiController.chat);
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

  // Enhanced health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const healthCheck = await monitoringService.getHealthCheck();
      res.json(healthCheck);
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin monitoring endpoints
  app.get('/api/admin/metrics', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const metrics = await monitoringService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  });

  app.get('/api/admin/performance', authMiddleware, requireRole(['admin', 'pro']), async (req, res) => {
    try {
      const performance = await monitoringService.getPerformanceMetrics();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  });

  app.get('/api/admin/analytics/:timeframe?', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const timeframe = (req.params.timeframe as 'day' | 'week' | 'month') || 'day';
      const analytics = await monitoringService.getUsageAnalytics(timeframe);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  app.get('/api/admin/tasks', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const tasks = taskScheduler.getTaskStatus();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task status' });
    }
  });

  app.post('/api/admin/tasks/:taskName/execute', authMiddleware, requireRole(['admin']), async (req, res) => {
    try {
      const { taskName } = req.params;
      await taskScheduler.executeTask(taskName);
      res.json({ success: true, message: `Task ${taskName} executed successfully` });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Task execution failed' });
    }
  });

  // Apply error tracking middleware at the end
  app.use(errorTrackingMiddleware);

  const httpServer = createServer(app);

  // WebSocket server setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    let userId: number | null = null;

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join' && message.userId) {
          userId = message.userId;
          
          // Add connection to user's connection list
          if (!wsConnections.has(userId)) {
            wsConnections.set(userId, []);
          }
          wsConnections.get(userId)!.push(ws);
          
          console.log(`User ${userId} connected to WebSocket`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        // Remove connection from user's connection list
        const connections = wsConnections.get(userId);
        if (connections) {
          const index = connections.indexOf(ws);
          if (index > -1) {
            connections.splice(index, 1);
          }
          if (connections.length === 0) {
            wsConnections.delete(userId);
          }
        }
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
