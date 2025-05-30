import { Response } from 'express';
import { storage } from '../storage';
import { taskCreateSchema } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export const taskController = {
  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { status } = req.query;
      const tasks = await storage.getTasks(req.user.id, status as string);
      
      res.json({ tasks });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  async getTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      const task = await storage.getTask(taskId, req.user.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ task });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  },

  async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = taskCreateSchema.parse(req.body);
      
      const task = await storage.createTask({
        userId: req.user.id,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        status: 'pending',
        createdViaVoice: req.body.createdViaVoice || false,
        voiceTranscription: req.body.voiceTranscription
      });

      res.status(201).json({ 
        message: 'Task created successfully',
        task 
      });
    } catch (error) {
      console.error('Create task error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input data', details: error.message });
      }
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      const allowedUpdates = ['title', 'description', 'priority', 'status', 'dueDate'];
      const updates: any = {};
      
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          if (field === 'dueDate' && req.body[field]) {
            updates[field] = new Date(req.body[field]);
          } else {
            updates[field] = req.body[field];
          }
        }
      }

      // If marking as completed, set completedAt timestamp
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
      } else if (updates.status && updates.status !== 'completed') {
        updates.completedAt = null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const task = await storage.updateTask(taskId, req.user.id, updates);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ 
        message: 'Task updated successfully',
        task 
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }

      const deleted = await storage.deleteTask(taskId, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
};
