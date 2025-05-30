import { Response } from 'express';
import { storage } from '../storage';
import { financialRecordCreateSchema } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export const financialController = {
  async getRecords(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { startDate, endDate } = req.query;
      
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate) {
        start = new Date(startDate as string);
      }
      
      if (endDate) {
        end = new Date(endDate as string);
      }

      const records = await storage.getFinancialRecords(req.user.id, start, end);
      
      res.json({ records });
    } catch (error) {
      console.error('Get financial records error:', error);
      res.status(500).json({ error: 'Failed to fetch financial records' });
    }
  },

  async getSummary(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { startDate, endDate, period } = req.query;
      
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (period) {
        const now = new Date();
        switch (period) {
          case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            end = now;
            break;
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
            break;
        }
      } else {
        if (startDate) start = new Date(startDate as string);
        if (endDate) end = new Date(endDate as string);
      }

      const summary = await storage.getFinancialSummary(req.user.id, start, end);
      
      res.json({ 
        summary,
        period: period || 'custom',
        startDate: start?.toISOString(),
        endDate: end?.toISOString()
      });
    } catch (error) {
      console.error('Get financial summary error:', error);
      res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
  },

  async createRecord(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = financialRecordCreateSchema.parse(req.body);
      
      const record = await storage.createFinancialRecord({
        userId: req.user.id,
        type: validatedData.type,
        amount: validatedData.amount.toString(),
        category: validatedData.category,
        description: validatedData.description,
        date: new Date(validatedData.date),
        createdViaVoice: req.body.createdViaVoice || false,
        voiceTranscription: req.body.voiceTranscription,
        metadata: req.body.metadata
      });

      res.status(201).json({ 
        message: 'Financial record created successfully',
        record 
      });
    } catch (error) {
      console.error('Create financial record error:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid input data', details: error.message });
      }
      res.status(500).json({ error: 'Failed to create financial record' });
    }
  },

  async updateRecord(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      const allowedUpdates = ['type', 'amount', 'category', 'description', 'date', 'metadata'];
      const updates: any = {};
      
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          if (field === 'date') {
            updates[field] = new Date(req.body[field]);
          } else if (field === 'amount') {
            updates[field] = req.body[field].toString();
          } else {
            updates[field] = req.body[field];
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const record = await storage.updateFinancialRecord(recordId, req.user.id, updates);
      if (!record) {
        return res.status(404).json({ error: 'Financial record not found' });
      }

      res.json({ 
        message: 'Financial record updated successfully',
        record 
      });
    } catch (error) {
      console.error('Update financial record error:', error);
      res.status(500).json({ error: 'Failed to update financial record' });
    }
  },

  async deleteRecord(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      const deleted = await storage.deleteFinancialRecord(recordId, req.user.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Financial record not found' });
      }

      res.json({ message: 'Financial record deleted successfully' });
    } catch (error) {
      console.error('Delete financial record error:', error);
      res.status(500).json({ error: 'Failed to delete financial record' });
    }
  }
};
