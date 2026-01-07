import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, loginSchema, signupSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { autoMessageService } from "./autoMessageService";
import { audioService } from "./audioService";
import { ZodError } from "zod";

// Middleware to check authentication
async function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = await storage.getSession(sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Session expired' });
  }

  const user = await storage.getUserBySessionId(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Extend session if it's more than halfway to expiration
  const now = new Date();
  const halfwayPoint = new Date(session.expiresAt.getTime() - (15 * 24 * 60 * 60 * 1000)); // 15 days before expiration
  if (now > halfwayPoint) {
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Extend by 30 days
    await storage.updateSessionExpiry(sessionId, newExpiresAt);
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log('Signup request body:', { ...req.body, password: '***' });
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create session
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
      });

      res.json({
        user: { id: user.id, username: user.username, name: user.name, email: user.email },
        sessionId,
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof ZodError) {
        console.error('Zod validation errors:', JSON.stringify(error.errors, null, 2));
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
      }
      console.error('Non-Zod error:', error);
      res.status(400).json({ error: 'Invalid signup data' });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValid = await bcrypt.compare(loginData.password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
      });

      res.json({
        user: { id: user.id, username: user.username, name: user.name, email: user.email },
        sessionId,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSession(req.sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    res.json({
      user: { 
        id: req.user.id, 
        username: req.user.username, 
        name: req.user.name, 
        email: req.user.email 
      }
    });
  });

  // Protected conversation routes (require authentication)
  // Get or create conversation
  app.post("/api/conversations", requireAuth, async (req: any, res) => {
    try {
      const { girlfriendId, girlfriendName } = req.body;
      const userId = req.user.id.toString(); // Use authenticated user's ID
      
      // Try to get existing conversation
      let conversation = await storage.getConversation(userId, girlfriendId);
      
      if (!conversation) {
        // Create new conversation
        const conversationData = insertConversationSchema.parse({
          userId,
          girlfriendId,
          girlfriendName,
        });
        conversation = await storage.createConversation(conversationData);
        
        // Start auto messages for this new conversation
        autoMessageService.startAutoMessages(
          conversation.id,
          girlfriendName,
          `You are ${girlfriendName}, a loving AI girlfriend with a caring and romantic personality.`
        );
      }
      
      res.json(conversation);
    } catch (error) {
      console.error('Error managing conversation:', error);
      res.status(500).json({ error: 'Failed to manage conversation' });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:conversationId/messages", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Add message to conversation
  app.post("/api/conversations/:conversationId/messages", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { content, sender } = req.body;
      
      const messageData = insertMessageSchema.parse({
        conversationId,
        content,
        sender,
      });
      
      const message = await storage.addMessage(messageData);
      
      // Update conversation timestamp
      await storage.updateConversationTimestamp(conversationId);
      
      res.json(message);
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  });

  // Get recent messages for AI context
  app.get("/api/conversations/:conversationId/recent", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const limit = parseInt(req.query.limit as string) || 10;
      const messages = await storage.getRecentMessages(conversationId, limit);
      res.json(messages.reverse()); // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      res.status(500).json({ error: 'Failed to fetch recent messages' });
    }
  });

  // Clear all messages in a conversation
  app.delete("/api/conversations/:conversationId/messages", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      await storage.clearMessages(conversationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing messages:', error);
      res.status(500).json({ error: 'Failed to clear messages' });
    }
  });

  // Auto message management routes
  app.post("/api/auto-messages/start/:conversationId", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { girlfriendName, personality } = req.body;
      
      autoMessageService.startAutoMessages(conversationId, girlfriendName, personality);
      res.json({ success: true });
    } catch (error) {
      console.error('Error starting auto messages:', error);
      res.status(500).json({ error: 'Failed to start auto messages' });
    }
  });

  app.post("/api/auto-messages/stop/:conversationId", requireAuth, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      autoMessageService.stopAutoMessages(conversationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error stopping auto messages:', error);
      res.status(500).json({ error: 'Failed to stop auto messages' });
    }
  });

  app.get("/api/auto-messages/config", requireAuth, async (req: any, res) => {
    try {
      const config = autoMessageService.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting auto message config:', error);
      res.status(500).json({ error: 'Failed to get config' });
    }
  });

  app.post("/api/auto-messages/config", requireAuth, async (req: any, res) => {
    try {
      autoMessageService.updateConfig(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating auto message config:', error);
      res.status(500).json({ error: 'Failed to update config' });
    }
  });

  // Note: SPA routing is handled by Vite middleware in development mode
  // In production, static files would be served from dist/public

  const httpServer = createServer(app);
  
  // WebSocket server for audio calls
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  wss.on('connection', (ws: WebSocket, request) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message.type);
        
        // Handle audio call related messages
        if (message.type?.startsWith('audio_') || ['start_call', 'end_call', 'mute_status'].includes(message.type)) {
          await audioService.handleAudioCall(ws, message);
        } else {
          // Handle other WebSocket messages here if needed
          console.log('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      audioService.handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      audioService.handleDisconnect(ws);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established'
    }));
  });

  return httpServer;
}
