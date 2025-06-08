import { users, sessions, tasks, financialRecords, voiceCommands, aiInteractions, userPreferences, contacts, chats, chatParticipants, messages, messageStatuses, professionalServices, serviceRequests, type User, type InsertUser, type Task, type InsertTask, type FinancialRecord, type InsertFinancialRecord, type Session, type VoiceCommand, type InsertVoiceCommand, type AIInteraction, type UserPreferences, type InsertUserPreferences, type Contact, type InsertContact, type Chat, type InsertChat, type ChatParticipant, type InsertChatParticipant, type Message, type InsertMessage, type MessageStatus, type InsertMessageStatus, type ProfessionalService, type InsertProfessionalService, type ServiceRequest, type InsertServiceRequest } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, or, inArray } from "drizzle-orm";

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
  
  // Chat management
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(userId: number): Promise<Contact[]>;
  updateContact(id: number, userId: number, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number, userId: number): Promise<boolean>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChats(userId: number): Promise<Chat[]>;
  getChat(id: number, userId: number): Promise<Chat | undefined>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  removeChatParticipant(chatId: number, userId: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatId: number, userId: number, limit?: number): Promise<Message[]>;
  updateMessage(id: number, userId: number, updates: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: number, userId: number): Promise<boolean>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;
  
  // Professional services
  createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService>;
  getProfessionalServices(type?: string, location?: string): Promise<ProfessionalService[]>;
  updateProfessionalService(id: number, userId: number, updates: Partial<ProfessionalService>): Promise<ProfessionalService | undefined>;
  
  // Service requests
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  getServiceRequests(userId: number, type?: 'client' | 'provider'): Promise<ServiceRequest[]>;
  updateServiceRequest(id: number, userId: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;
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
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));
    
    if (status) {
      query = db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.status, status)));
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
    return (result.rowCount || 0) > 0;
  }

  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db
      .insert(financialRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async getFinancialRecords(userId: number, startDate?: Date, endDate?: Date): Promise<FinancialRecord[]> {
    let whereConditions = [eq(financialRecords.userId, userId)];
    
    if (startDate && endDate) {
      whereConditions.push(gte(financialRecords.date, startDate));
      whereConditions.push(lte(financialRecords.date, endDate));
    }
    
    const query = db.select().from(financialRecords).where(and(...whereConditions));
    
    return await query.orderBy(desc(financialRecords.date));
  }

  async getFinancialSummary(userId: number, startDate?: Date, endDate?: Date): Promise<{ income: number; expenses: number; net: number }> {
    let whereConditions = [eq(financialRecords.userId, userId)];
    
    if (startDate && endDate) {
      whereConditions.push(gte(financialRecords.date, startDate));
      whereConditions.push(lte(financialRecords.date, endDate));
    }
    
    const records = await db.select({
      type: financialRecords.type,
      amount: financialRecords.amount
    }).from(financialRecords).where(and(...whereConditions));
    
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
    return (result.rowCount || 0) > 0;
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
    const conditions = [];
    if (userId) conditions.push(eq(aiInteractions.userId, userId));
    if (type) conditions.push(eq(aiInteractions.type, type));
    
    const baseQuery = db.select().from(aiInteractions);
    
    const finalQuery = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    return await finalQuery
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

  // Chat management implementation
  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return created;
  }

  async getContacts(userId: number): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .orderBy(desc(contacts.lastContactedAt));
  }

  async updateContact(id: number, userId: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db
      .update(contacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteContact(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return result.rowCount > 0;
  }

  // Chat operations implementation
  async createChat(chat: InsertChat): Promise<Chat> {
    const [created] = await db
      .insert(chats)
      .values(chat)
      .returning();
    return created;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return await db
      .select({
        id: chats.id,
        type: chats.type,
        name: chats.name,
        description: chats.description,
        avatar: chats.avatar,
        isActive: chats.isActive,
        lastMessageId: chats.lastMessageId,
        lastMessageAt: chats.lastMessageAt,
        createdBy: chats.createdBy,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(and(
        eq(chatParticipants.userId, userId),
        eq(chatParticipants.isActive, true)
      ))
      .orderBy(desc(chats.lastMessageAt));
  }

  async getChat(id: number, userId: number): Promise<Chat | undefined> {
    const [chat] = await db
      .select()
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(and(
        eq(chats.id, id),
        eq(chatParticipants.userId, userId),
        eq(chatParticipants.isActive, true)
      ));
    return chat?.chats || undefined;
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [created] = await db
      .insert(chatParticipants)
      .values(participant)
      .returning();
    return created;
  }

  async removeChatParticipant(chatId: number, userId: number): Promise<boolean> {
    const result = await db
      .update(chatParticipants)
      .set({ isActive: false, leftAt: new Date() })
      .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, userId)));
    return result.rowCount > 0;
  }

  // Message operations implementation
  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update chat's last message
    await db
      .update(chats)
      .set({ lastMessageId: created.id, lastMessageAt: created.createdAt })
      .where(eq(chats.id, created.chatId));
    
    return created;
  }

  async getMessages(chatId: number, userId: number, limit: number = 50): Promise<Message[]> {
    // Verify user is participant in chat
    const [participant] = await db
      .select()
      .from(chatParticipants)
      .where(and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, userId),
        eq(chatParticipants.isActive, true)
      ));
    
    if (!participant) {
      return [];
    }

    return await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.chatId, chatId),
        eq(messages.isDeleted, false)
      ))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async updateMessage(id: number, userId: number, updates: Partial<Message>): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set({ ...updates, isEdited: true, editedAt: new Date() })
      .where(and(eq(messages.id, id), eq(messages.senderId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteMessage(id: number, userId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(and(eq(messages.id, id), eq(messages.senderId, userId)));
    return result.rowCount > 0;
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    await db
      .insert(messageStatuses)
      .values({
        messageId,
        userId,
        status: 'read',
        timestamp: new Date()
      });
  }

  // Professional services implementation
  async createProfessionalService(service: InsertProfessionalService): Promise<ProfessionalService> {
    const [created] = await db
      .insert(professionalServices)
      .values(service)
      .returning();
    return created;
  }

  async getProfessionalServices(type?: string, location?: string): Promise<ProfessionalService[]> {
    let query = db
      .select()
      .from(professionalServices)
      .where(eq(professionalServices.isActive, true));

    if (type) {
      query = query.where(eq(professionalServices.serviceType, type));
    }
    
    if (location) {
      query = query.where(eq(professionalServices.location, location));
    }

    return await query.orderBy(desc(professionalServices.rating));
  }

  async updateProfessionalService(id: number, userId: number, updates: Partial<ProfessionalService>): Promise<ProfessionalService | undefined> {
    const [updated] = await db
      .update(professionalServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(professionalServices.id, id), eq(professionalServices.userId, userId)))
      .returning();
    return updated || undefined;
  }

  // Service requests implementation
  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [created] = await db
      .insert(serviceRequests)
      .values(request)
      .returning();
    return created;
  }

  async getServiceRequests(userId: number, type: 'client' | 'provider' = 'client'): Promise<ServiceRequest[]> {
    if (type === 'client') {
      return await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.clientId, userId))
        .orderBy(desc(serviceRequests.createdAt));
    } else {
      return await db
        .select()
        .from(serviceRequests)
        .innerJoin(professionalServices, eq(serviceRequests.serviceId, professionalServices.id))
        .where(eq(professionalServices.providerId, userId))
        .orderBy(desc(serviceRequests.createdAt));
    }
  }

  async updateServiceRequest(id: number, userId: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updated] = await db
      .update(serviceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(serviceRequests.id, id), eq(serviceRequests.clientId, userId)))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
