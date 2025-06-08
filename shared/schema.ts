import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, uuid, json, pgEnum, time, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const professionalTypeEnum = pgEnum("professional_type", [
  "doctor", "dentist", "therapist", "consultant", "lawyer", 
  "accountant", "coach", "tutor", "other"
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending", "confirmed", "cancelled", "completed", "no_show"
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "pending", "accepted", "blocked"
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("standard"), // standard, pro, admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  voiceEnabled: boolean("voice_enabled").default(true),
  ttsEnabled: boolean("tts_enabled").default(true),
  
  // Professional Profile Fields
  isProfessional: boolean("is_professional").default(false).notNull(),
  professionalType: professionalTypeEnum("professional_type"),
  businessName: varchar("business_name", { length: 255 }),
  bio: text("bio"),
  specializations: text("specializations"), // JSON array as text
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  
  // Social & Discovery
  isPublicProfile: boolean("is_public_profile").default(false).notNull(),
  allowAppointmentBooking: boolean("allow_appointment_booking").default(false).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // low, medium, high
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdViaVoice: boolean("created_via_voice").default(false),
  voiceTranscription: text("voice_transcription"),
  // Enhanced fields
  categoryId: integer("category_id").references(() => taskCategories.id),
  projectId: integer("project_id").references(() => projects.id),
  parentTaskId: integer("parent_task_id").references(() => tasks.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  tags: text("tags").array(),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  attachments: text("attachments").array(),
  isTemplate: boolean("is_template").default(false),
  templateId: integer("template_id").references(() => tasks.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Categories
export const taskCategories = pgTable("task_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: varchar("color", { length: 7 }), // hex color
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  color: varchar("color", { length: 7 }),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time Tracking
export const timeTracking = pgTable("time_tracking", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Financial records table
export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(), // income, expense
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => financialCategories.id),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdViaVoice: boolean("created_via_voice").default(false),
  voiceTranscription: text("voice_transcription"),
  metadata: json("metadata"), // For additional data like receipt info
  // Enhanced fields
  tags: text("tags").array(),
  recurringId: integer("recurring_id").references(() => recurringTransactions.id),
  budgetId: integer("budget_id").references(() => budgets.id),
  receipt: text("receipt"), // file path or URL
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Categories
export const financialCategories = pgTable("financial_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // income, expense
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 50 }),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => financialCategories.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // monthly, yearly, weekly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  alertThreshold: integer("alert_threshold").default(80), // percentage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recurring Transactions
export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // income, expense
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => financialCategories.id),
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextDue: timestamp("next_due").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bill Reminders
export const billReminders = pgTable("bill_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  dueDate: timestamp("due_date").notNull(),
  frequency: varchar("frequency", { length: 20 }), // one-time, monthly, yearly
  categoryId: integer("category_id").references(() => financialCategories.id),
  reminderDays: integer("reminder_days").array(), // days before due date to remind
  isPaid: boolean("is_paid").default(false),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI interactions table
export const aiInteractions = pgTable("ai_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // joke, insight, response
  prompt: text("prompt"),
  response: text("response").notNull(),
  modelUsed: text("model_used"),
  processingTime: integer("processing_time"), // in milliseconds
  wasSpoken: boolean("was_spoken").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Voice commands table
export const voiceCommands = pgTable("voice_commands", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  transcription: text("transcription").notNull(),
  intent: varchar("intent", { length: 50 }), // task_create, expense_add, query, etc.
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  processingTime: integer("processing_time"), // in milliseconds
  successful: boolean("successful").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  theme: varchar("theme", { length: 10 }).default("light"), // light, dark, auto
  language: varchar("language", { length: 10 }).default("en"),
  voiceModel: text("voice_model").default("base"),
  ttsVoice: text("tts_voice").default("default"),
  notifications: json("notifications"), // notification preferences
  dashboardLayout: json("dashboard_layout"), // custom dashboard configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  tasks: many(tasks),
  financialRecords: many(financialRecords),
  aiInteractions: many(aiInteractions),
  voiceCommands: many(voiceCommands),
  preferences: one(userPreferences),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
}));

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  user: one(users, { fields: [financialRecords.userId], references: [users.id] }),
}));

export const aiInteractionsRelations = relations(aiInteractions, ({ one }) => ({
  user: one(users, { fields: [aiInteractions.userId], references: [users.id] }),
}));

export const voiceCommandsRelations = relations(voiceCommands, ({ one }) => ({
  user: one(users, { fields: [voiceCommands.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTaskSchema = createSelectSchema(tasks);

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectFinancialRecordSchema = createSelectSchema(financialRecords);

export const insertVoiceCommandSchema = createInsertSchema(voiceCommands).omit({
  id: true,
  createdAt: true,
});

export const selectVoiceCommandSchema = createSelectSchema(voiceCommands);

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserPreferencesSchema = createSelectSchema(userPreferences);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = z.infer<typeof insertVoiceCommandSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type AIInteraction = typeof aiInteractions.$inferSelect;

// Additional validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().datetime().optional(),
});

export const financialRecordCreateSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().datetime(),
});
