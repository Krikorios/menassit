import { users, sessions, tasks, financialRecords, voiceCommands, aiInteractions, userPreferences, type User, type InsertUser, type Task, type InsertTask, type FinancialRecord, type InsertFinancialRecord, type Session, type VoiceCommand, type InsertVoiceCommand, type AIInteraction, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Session management
  createSession(userId: number, token: string, expiresAt: Date): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Task management
  createTask(task: InsertTask): Promise<Task>;
  getTasks(userId: number, status?: string): Promise<Task[]>;
  getTask(id: number, userId: number): Promise<Task | undefined>;
  updateTask(id: number, userId: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<boolean>;
  
  // Financial records
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  getFinancialRecords(userId: number, startDate?: Date, endDate?: Date): Promise<FinancialRecord[]>;
  getFinancialSummary(userId: number, startDate?: Date, endDate?: Date): Promise<{ income: number; expenses: number; net: number }>;
  updateFinancialRecord(id: number, userId: number, updates: Partial<FinancialRecord>): Promise<FinancialRecord | undefined>;
  deleteFinancialRecord(id: number, userId: number): Promise<boolean>;
  
  // Voice commands
  createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand>;
  getVoiceCommands(userId: number, limit?: number): Promise<VoiceCommand[]>;
  
  // AI interactions
  createAIInteraction(interaction: Omit<AIInteraction, 'id' | 'createdAt'>): Promise<AIInteraction>;
  getAIInteractions(userId?: number, type?: string, limit?: number): Promise<AIInteraction[]>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createSession(userId: number, token: string, expiresAt: Date): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({ userId, token, expiresAt })
      .returning();
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gte(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async getTasks(userId: number, status?: string): Promise<Task[]> {
    const query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (status) {
      query.where(and(eq(tasks.userId, userId), eq(tasks.status, status)));
    }
    
    return await query.orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number, userId: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task || undefined;
  }

  async updateTask(id: number, userId: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return result.rowCount > 0;
  }

  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db
      .insert(financialRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async getFinancialRecords(userId: number, startDate?: Date, endDate?: Date): Promise<FinancialRecord[]> {
    let query = db.select().from(financialRecords).where(eq(financialRecords.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(financialRecords.userId, userId),
          gte(financialRecords.date, startDate),
          lte(financialRecords.date, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(financialRecords.date));
  }

  async getFinancialSummary(userId: number, startDate?: Date, endDate?: Date): Promise<{ income: number; expenses: number; net: number }> {
    let query = db.select({
      type: financialRecords.type,
      amount: financialRecords.amount
    }).from(financialRecords).where(eq(financialRecords.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(financialRecords.userId, userId),
          gte(financialRecords.date, startDate),
          lte(financialRecords.date, endDate)
        )
      );
    }
    
    const records = await query;
    
    let income = 0;
    let expenses = 0;
    
    records.forEach(record => {
      const amount = parseFloat(record.amount);
      if (record.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
      }
    });
    
    return {
      income,
      expenses,
      net: income - expenses
    };
  }

  async updateFinancialRecord(id: number, userId: number, updates: Partial<FinancialRecord>): Promise<FinancialRecord | undefined> {
    const [record] = await db
      .update(financialRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(financialRecords.id, id), eq(financialRecords.userId, userId)))
      .returning();
    return record || undefined;
  }

  async deleteFinancialRecord(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(financialRecords)
      .where(and(eq(financialRecords.id, id), eq(financialRecords.userId, userId)));
    return result.rowCount > 0;
  }

  async createVoiceCommand(command: InsertVoiceCommand): Promise<VoiceCommand> {
    const [newCommand] = await db
      .insert(voiceCommands)
      .values(command)
      .returning();
    return newCommand;
  }

  async getVoiceCommands(userId: number, limit: number = 50): Promise<VoiceCommand[]> {
    return await db
      .select()
      .from(voiceCommands)
      .where(eq(voiceCommands.userId, userId))
      .orderBy(desc(voiceCommands.createdAt))
      .limit(limit);
  }

  async createAIInteraction(interaction: Omit<AIInteraction, 'id' | 'createdAt'>): Promise<AIInteraction> {
    const [newInteraction] = await db
      .insert(aiInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async getAIInteractions(userId?: number, type?: string, limit: number = 50): Promise<AIInteraction[]> {
    let query = db.select().from(aiInteractions);
    
    const conditions = [];
    if (userId) conditions.push(eq(aiInteractions.userId, userId));
    if (type) conditions.push(eq(aiInteractions.type, type));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(aiInteractions.createdAt))
      .limit(limit);
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ userId, ...preferences })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
