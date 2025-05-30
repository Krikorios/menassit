import { spawn, ChildProcess } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { storage } from '../storage';

export interface VoiceProcessingResult {
  transcription: string;
  confidence: number;
  processingTime: number;
  intent?: string;
  entities?: Record<string, any>;
}

export interface TTSResult {
  audioBuffer: Buffer;
  processingTime: number;
}

class VoiceService {
  private sttModelPath: string;
  private ttsModelPath: string;
  private isInitialized: boolean = false;
  private sttProcess: ChildProcess | null = null;
  private ttsProcess: ChildProcess | null = null;

  constructor() {
    this.sttModelPath = process.env.STT_MODEL_PATH || './models/speech/base-stt';
    this.ttsModelPath = process.env.TTS_MODEL_PATH || './models/speech/base-tts';
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing voice models...');
      
      // Check if model files exist
      const sttExists = await this.checkModelExists(this.sttModelPath);
      const ttsExists = await this.checkModelExists(this.ttsModelPath);
      
      if (!sttExists || !ttsExists) {
        console.error('Voice models not found. Please run model setup script.');
        return false;
      }
      
      // Initialize STT model (using whisper.cpp or similar)
      await this.initializeSTT();
      
      // Initialize TTS model (using espeak-ng or similar)
      await this.initializeTTS();
      
      this.isInitialized = true;
      console.log('Voice models initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize voice models:', error);
      return false;
    }
  }

  private async checkModelExists(modelPath: string): Promise<boolean> {
    try {
      await fs.access(modelPath);
      return true;
    } catch {
      return false;
    }
  }

  private async initializeSTT(): Promise<void> {
    // Initialize STT process - in production, this would start the actual model
    console.log(`Loading STT model from ${this.sttModelPath}`);
    // For now, we'll simulate model loading
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async initializeTTS(): Promise<void> {
    // Initialize TTS process - in production, this would start the actual model
    console.log(`Loading TTS model from ${this.ttsModelPath}`);
    // For now, we'll simulate model loading
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async processAudioToText(audioBuffer: Buffer, userId?: number): Promise<VoiceProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('Voice service not initialized');
    }

    const startTime = Date.now();
    
    try {
      // In production, this would use actual STT processing
      // For now, we'll simulate transcription
      const transcription = await this.simulateSTT(audioBuffer);
      const confidence = 0.95; // Simulated confidence
      const processingTime = Date.now() - startTime;
      
      // Extract intent and entities from transcription
      const { intent, entities } = this.extractIntent(transcription);
      
      const result: VoiceProcessingResult = {
        transcription,
        confidence,
        processingTime,
        intent,
        entities
      };

      // Log voice command if user is provided
      if (userId) {
        await storage.createVoiceCommand({
          userId,
          command: transcription,
          transcription,
          intent,
          confidence,
          processingTime,
          successful: true
        });
      }

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (userId) {
        await storage.createVoiceCommand({
          userId,
          command: '',
          transcription: '',
          confidence: 0,
          processingTime,
          successful: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      throw error;
    }
  }

  async textToSpeech(text: string, voice?: string): Promise<TTSResult> {
    if (!this.isInitialized) {
      throw new Error('Voice service not initialized');
    }

    const startTime = Date.now();
    
    try {
      // In production, this would use actual TTS processing
      const audioBuffer = await this.simulateTTS(text, voice);
      const processingTime = Date.now() - startTime;
      
      return {
        audioBuffer,
        processingTime
      };
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  private async simulateSTT(audioBuffer: Buffer): Promise<string> {
    // Simulate STT processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a simulated transcription based on common commands
    const sampleCommands = [
      "Create task review budget reports",
      "Add expense coffee shop four dollars fifty cents",
      "Show me today's tasks",
      "What's my financial summary",
      "Schedule meeting with team for Friday",
      "Mark task as completed",
      "Add income freelance payment five hundred dollars"
    ];
    
    return sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
  }

  private async simulateTTS(text: string, voice?: string): Promise<Buffer> {
    // Simulate TTS processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return a dummy audio buffer (in production, this would be actual audio)
    const dummyAudioData = Buffer.alloc(1024, 0);
    return dummyAudioData;
  }

  private extractIntent(transcription: string): { intent?: string; entities?: Record<string, any> } {
    const text = transcription.toLowerCase();
    
    // Simple intent recognition based on keywords
    if (text.includes('create') && (text.includes('task') || text.includes('todo'))) {
      return {
        intent: 'task_create',
        entities: this.extractTaskEntities(text)
      };
    }
    
    if (text.includes('add') && (text.includes('expense') || text.includes('cost'))) {
      return {
        intent: 'expense_add',
        entities: this.extractExpenseEntities(text)
      };
    }
    
    if (text.includes('add') && text.includes('income')) {
      return {
        intent: 'income_add',
        entities: this.extractIncomeEntities(text)
      };
    }
    
    if (text.includes('show') || text.includes('list') || text.includes('get')) {
      if (text.includes('task')) {
        return { intent: 'task_list' };
      }
      if (text.includes('financial') || text.includes('money') || text.includes('summary')) {
        return { intent: 'financial_summary' };
      }
    }
    
    if (text.includes('complete') || text.includes('done') || text.includes('finish')) {
      return { intent: 'task_complete' };
    }
    
    return { intent: 'unknown' };
  }

  private extractTaskEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract task title (everything after "create task" or similar)
    const taskMatch = text.match(/(?:create|add|new)\s+(?:task|todo)\s+(.+)/i);
    if (taskMatch) {
      entities.title = taskMatch[1].trim();
    }
    
    // Extract priority
    if (text.includes('high priority') || text.includes('urgent')) {
      entities.priority = 'high';
    } else if (text.includes('low priority')) {
      entities.priority = 'low';
    } else {
      entities.priority = 'medium';
    }
    
    // Extract due date (simplified)
    if (text.includes('today')) {
      entities.dueDate = new Date().toISOString();
    } else if (text.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      entities.dueDate = tomorrow.toISOString();
    }
    
    return entities;
  }

  private extractExpenseEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract amount
    const amountMatch = text.match(/(?:\$|dollar|dollars?)\s*(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*(?:dollar|dollars?)/i);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1] || amountMatch[2]);
    }
    
    // Extract category/description
    const categories = ['food', 'transport', 'shopping', 'utilities', 'entertainment', 'healthcare'];
    for (const category of categories) {
      if (text.includes(category)) {
        entities.category = category;
        break;
      }
    }
    
    if (!entities.category) {
      entities.category = 'other';
    }
    
    // Extract description
    const expenseMatch = text.match(/(?:expense|spent|paid)\s+(?:for\s+)?(.+?)(?:\s+\$|\s+\d+|$)/i);
    if (expenseMatch) {
      entities.description = expenseMatch[1].trim();
    }
    
    return entities;
  }

  private extractIncomeEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract amount
    const amountMatch = text.match(/(?:\$|dollar|dollars?)\s*(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*(?:dollar|dollars?)/i);
    if (amountMatch) {
      entities.amount = parseFloat(amountMatch[1] || amountMatch[2]);
    }
    
    // Extract source/description
    const incomeMatch = text.match(/(?:income|received|earned)\s+(?:from\s+)?(.+?)(?:\s+\$|\s+\d+|$)/i);
    if (incomeMatch) {
      entities.description = incomeMatch[1].trim();
    }
    
    entities.category = 'income';
    
    return entities;
  }

  async getModelStatus(): Promise<{ stt: boolean; tts: boolean; initialized: boolean }> {
    return {
      stt: await this.checkModelExists(this.sttModelPath),
      tts: await this.checkModelExists(this.ttsModelPath),
      initialized: this.isInitialized
    };
  }

  shutdown(): void {
    if (this.sttProcess) {
      this.sttProcess.kill();
    }
    if (this.ttsProcess) {
      this.ttsProcess.kill();
    }
    this.isInitialized = false;
  }
}

export const voiceService = new VoiceService();
