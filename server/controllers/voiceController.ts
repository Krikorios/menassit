import { Response } from 'express';
import multer from 'multer';
import { voiceService } from '../services/voiceService';
import { storage } from '../storage';
import { AuthenticatedRequest } from '../middleware/auth';

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

export const voiceController = {
  async initialize(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await voiceService.initialize();
      
      if (success) {
        res.json({ 
          message: 'Voice models initialized successfully',
          status: 'ready'
        });
      } else {
        res.status(500).json({ error: 'Failed to initialize voice models' });
      }
    } catch (error) {
      console.error('Voice initialization error:', error);
      res.status(500).json({ error: 'Voice initialization failed' });
    }
  },

  async processCommand(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { audioData } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Process audio to text
      const result = await voiceService.processAudioToText(audioBuffer, req.user.id);
      
      // Execute the command based on intent
      let actionResult = null;
      if (result.intent && result.entities) {
        actionResult = await this.executeVoiceCommand(req.user.id, result.intent, result.entities);
      }

      res.json({
        transcription: result.transcription,
        intent: result.intent,
        confidence: result.confidence,
        processingTime: result.processingTime,
        actionResult
      });
    } catch (error) {
      console.error('Voice command processing error:', error);
      res.status(500).json({ error: 'Failed to process voice command' });
    }
  },

  async speak(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { text, voice } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const result = await voiceService.textToSpeech(text, voice);
      
      // Set appropriate headers for audio response
      res.set({
        'Content-Type': 'audio/wav',
        'Content-Length': result.audioBuffer.length
      });
      
      res.send(result.audioBuffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  },

  async getCommands(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { limit } = req.query;
      const commands = await storage.getVoiceCommands(req.user.id, limit ? parseInt(limit as string) : undefined);
      
      res.json({ commands });
    } catch (error) {
      console.error('Get voice commands error:', error);
      res.status(500).json({ error: 'Failed to fetch voice commands' });
    }
  },

  async getStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = await voiceService.getModelStatus();
      
      res.json({
        ...status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get voice status error:', error);
      res.status(500).json({ error: 'Failed to get voice status' });
    }
  },

  async executeVoiceCommand(userId: number, intent: string, entities: Record<string, any>) {
    try {
      switch (intent) {
        case 'task_create':
          if (entities.title) {
            const task = await storage.createTask({
              userId,
              title: entities.title,
              description: entities.description,
              priority: entities.priority || 'medium',
              dueDate: entities.dueDate ? new Date(entities.dueDate) : undefined,
              status: 'pending',
              createdViaVoice: true,
              voiceTranscription: entities.originalTranscription
            });
            return { type: 'task_created', task };
          }
          break;

        case 'expense_add':
          if (entities.amount && entities.category) {
            const record = await storage.createFinancialRecord({
              userId,
              type: 'expense',
              amount: entities.amount.toString(),
              category: entities.category,
              description: entities.description || 'Voice expense entry',
              date: new Date(),
              createdViaVoice: true,
              voiceTranscription: entities.originalTranscription
            });
            return { type: 'expense_added', record };
          }
          break;

        case 'income_add':
          if (entities.amount) {
            const record = await storage.createFinancialRecord({
              userId,
              type: 'income',
              amount: entities.amount.toString(),
              category: entities.category || 'income',
              description: entities.description || 'Voice income entry',
              date: new Date(),
              createdViaVoice: true,
              voiceTranscription: entities.originalTranscription
            });
            return { type: 'income_added', record };
          }
          break;

        case 'task_list':
          const tasks = await storage.getTasks(userId, 'pending');
          return { type: 'tasks_retrieved', tasks: tasks.slice(0, 5) }; // Limit for voice response

        case 'financial_summary':
          const summary = await storage.getFinancialSummary(userId);
          return { type: 'financial_summary', summary };

        default:
          return { type: 'unknown_intent', message: 'I didn\'t understand that command' };
      }
    } catch (error) {
      console.error('Execute voice command error:', error);
      return { type: 'error', message: 'Failed to execute command' };
    }
  }
};
