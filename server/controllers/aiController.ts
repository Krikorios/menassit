import { Response } from 'express';
import { aiService } from '../services/aiService';
import { storage } from '../storage';
import { AuthenticatedRequest } from '../middleware/auth';

export const aiController = {
  async getDailyJoke(req: any, res: Response) {
    try {
      // Check if we already have a joke for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingJokes = await storage.getAIInteractions(undefined, 'joke', 1);
      const todayJoke = existingJokes.find(joke => {
        const jokeDate = new Date(joke.createdAt);
        jokeDate.setHours(0, 0, 0, 0);
        return jokeDate.getTime() === today.getTime();
      });

      if (todayJoke) {
        return res.json({
          joke: todayJoke.response,
          cached: true,
          timestamp: todayJoke.createdAt
        });
      }

      // Generate new daily joke
      const jokeResponse = await aiService.generateDailyJoke();
      
      res.json({
        joke: jokeResponse.content,
        category: jokeResponse.category,
        cached: false,
        processingTime: jokeResponse.processingTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get daily joke error:', error);
      res.status(500).json({ error: 'Failed to get daily joke' });
    }
  },

  async generateJoke(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { personalized } = req.query;
      
      let jokeResponse;
      if (personalized === 'true') {
        jokeResponse = await aiService.generatePersonalizedJoke(req.user.id);
      } else {
        jokeResponse = await aiService.generateDailyJoke();
      }
      
      res.json({
        joke: jokeResponse.content,
        category: jokeResponse.category,
        personalized: personalized === 'true',
        processingTime: jokeResponse.processingTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Generate joke error:', error);
      res.status(500).json({ error: 'Failed to generate joke' });
    }
  },

  async chat(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await aiService.chat(req.user.id, message);
      
      res.json({
        response: response.content,
        processingTime: response.processingTime,
        modelUsed: response.modelUsed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  },

  async getInteractions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { type, limit } = req.query;
      
      const interactions = await storage.getAIInteractions(
        req.user.id,
        type as string,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json({ interactions });
    } catch (error) {
      console.error('Get AI interactions error:', error);
      res.status(500).json({ error: 'Failed to fetch AI interactions' });
    }
  },

  async getStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = await aiService.getModelStatus();
      
      res.json({
        ...status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get AI status error:', error);
      res.status(500).json({ error: 'Failed to get AI status' });
    }
  },

  async generateInsight(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { type } = req.body;
      
      if (!type || !['financial', 'productivity', 'general'].includes(type)) {
        return res.status(400).json({ error: 'Valid insight type is required (financial, productivity, general)' });
      }

      const insight = await aiService.generateInsight(req.user.id, type);
      
      res.json({
        insight: insight.content,
        type,
        processingTime: insight.processingTime,
        modelUsed: insight.modelUsed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Generate insight error:', error);
      res.status(500).json({ error: 'Failed to generate insight' });
    }
  }
};
