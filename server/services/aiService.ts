import { storage } from '../storage';

export interface AIResponse {
  content: string;
  processingTime: number;
  modelUsed: string;
}

export interface JokeResponse extends AIResponse {
  category: string;
}

class AIService {
  private modelPath: string;
  private isInitialized: boolean = false;

  constructor() {
    this.modelPath = process.env.AI_MODEL_PATH || './models/ai/base-llm';
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing AI models...');
      
      // In production, this would load the actual local LLM
      await this.loadModel();
      
      this.isInitialized = true;
      console.log('AI models initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      return false;
    }
  }

  private async loadModel(): Promise<void> {
    // Simulate model loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`AI model loaded from ${this.modelPath}`);
  }

  async generateDailyJoke(): Promise<JokeResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      // In production, this would use the actual AI model
      const joke = await this.simulateJokeGeneration();
      const processingTime = Date.now() - startTime;
      
      const response: JokeResponse = {
        content: joke,
        processingTime,
        modelUsed: 'local-llm-base',
        category: 'programming'
      };

      // Store the interaction
      await storage.createAIInteraction({
        userId: null, // Daily joke is global
        type: 'joke',
        prompt: 'Generate daily programming joke',
        response: joke,
        modelUsed: 'local-llm-base',
        processingTime,
        wasSpoken: false
      });

      return response;
    } catch (error) {
      console.error('AI joke generation error:', error);
      throw new Error('Failed to generate joke');
    }
  }

  async generatePersonalizedJoke(userId: number, preferences?: any): Promise<JokeResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      // Get user context for personalization
      const userTasks = await storage.getTasks(userId);
      const recentCommands = await storage.getVoiceCommands(userId, 5);
      
      const joke = await this.simulatePersonalizedJoke(userTasks.length, recentCommands.length);
      const processingTime = Date.now() - startTime;
      
      const response: JokeResponse = {
        content: joke,
        processingTime,
        modelUsed: 'local-llm-base',
        category: 'personalized'
      };

      // Store the interaction
      await storage.createAIInteraction({
        userId,
        type: 'joke',
        prompt: 'Generate personalized joke',
        response: joke,
        modelUsed: 'local-llm-base',
        processingTime,
        wasSpoken: false
      });

      return response;
    } catch (error) {
      console.error('Personalized joke generation error:', error);
      throw new Error('Failed to generate personalized joke');
    }
  }

  async chat(userId: number, message: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      // Get user context
      const user = await storage.getUser(userId);
      const recentTasks = await storage.getTasks(userId);
      const financialSummary = await storage.getFinancialSummary(userId);
      
      const response = await this.simulateChat(message, {
        user,
        taskCount: recentTasks.length,
        financialSummary
      });
      
      const processingTime = Date.now() - startTime;
      
      const aiResponse: AIResponse = {
        content: response,
        processingTime,
        modelUsed: 'local-llm-base'
      };

      // Store the interaction
      await storage.createAIInteraction({
        userId,
        type: 'response',
        prompt: message,
        response,
        modelUsed: 'local-llm-base',
        processingTime,
        wasSpoken: false
      });

      return aiResponse;
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async generateInsight(userId: number, type: 'financial' | 'productivity' | 'general'): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      let insight = '';
      
      switch (type) {
        case 'financial':
          const summary = await storage.getFinancialSummary(userId);
          insight = await this.simulateFinancialInsight(summary);
          break;
        case 'productivity':
          const tasks = await storage.getTasks(userId);
          insight = await this.simulateProductivityInsight(tasks);
          break;
        default:
          insight = await this.simulateGeneralInsight();
      }
      
      const processingTime = Date.now() - startTime;
      
      const response: AIResponse = {
        content: insight,
        processingTime,
        modelUsed: 'local-llm-base'
      };

      // Store the interaction
      await storage.createAIInteraction({
        userId,
        type: 'insight',
        prompt: `Generate ${type} insight`,
        response: insight,
        modelUsed: 'local-llm-base',
        processingTime,
        wasSpoken: false
      });

      return response;
    } catch (error) {
      console.error('AI insight generation error:', error);
      throw new Error('Failed to generate insight');
    }
  }

  private async simulateJokeGeneration(): Promise<string> {
    const jokes = [
      "Why don't developers ever finish their tasks? Because they always get stuck in an infinite loop of 'just one more feature'!",
      "Why did the programmer quit his job? He didn't get arrays! (a raise)",
      "How many programmers does it take to screw in a light bulb? None, that's a hardware problem!",
      "Why do Java developers wear glasses? Because they can't C#!",
      "A SQL query walks into a bar, approaches two tables and asks: 'Can I join you?'",
      "Why don't tasks ever get lonely? Because they always have deadlines to keep them company!",
      "What's a programmer's favorite hangout place? The Foo Bar!",
      "Why did the developer go broke? Because he used up all his cache!"
    ];
    
    await new Promise(resolve => setTimeout(resolve, 800));
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  private async simulatePersonalizedJoke(taskCount: number, voiceCommandCount: number): Promise<string> {
    let joke = '';
    
    if (taskCount > 10) {
      joke = "Looks like you're collecting tasks like Pokémon cards! Gotta catch 'em all... and then actually do them!";
    } else if (taskCount === 0) {
      joke = "Your task list is emptier than a JavaScript developer's knowledge of semicolons!";
    } else if (voiceCommandCount > 5) {
      joke = "You're talking to me more than most people talk to their houseplants. At least I talk back!";
    } else {
      joke = await this.simulateJokeGeneration();
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return joke;
  }

  private async simulateChat(message: string, context: any): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      if (context.taskCount === 0) {
        return "You have no pending tasks right now. Great job staying on top of things! Ready to add something new?";
      } else {
        return `You currently have ${context.taskCount} pending tasks. Would you like me to help you prioritize them or create a new one?`;
      }
    }
    
    if (lowerMessage.includes('money') || lowerMessage.includes('financial') || lowerMessage.includes('budget')) {
      const { income, expenses, net } = context.financialSummary;
      return `Your current financial status shows $${income} in income and $${expenses} in expenses, for a net of $${net}. ${net > 0 ? "You're in the positive!" : "Consider reviewing your expenses."}`;
    }
    
    if (lowerMessage.includes('help')) {
      return "I can help you with tasks, financial tracking, and answering questions about your data. Try saying 'create task', 'add expense', or ask about your financial summary!";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello ${context.user?.firstName || 'there'}! I'm your AI assistant. How can I help you manage your tasks and finances today?`;
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
    return "I understand you're asking about that. While I'm still learning, I can help you with tasks, expenses, and general productivity questions. Is there something specific I can assist with?";
  }

  private async simulateFinancialInsight(summary: { income: number; expenses: number; net: number }): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const { income, expenses, net } = summary;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
    
    if (net > 0) {
      if (expenseRatio < 70) {
        return `Excellent financial management! You're spending only ${expenseRatio.toFixed(1)}% of your income. Consider investing the surplus for long-term growth.`;
      } else {
        return `Good job maintaining a positive balance! Your expense ratio is ${expenseRatio.toFixed(1)}%. Consider optimizing some categories to improve savings.`;
      }
    } else {
      return `Your expenses exceed income by $${Math.abs(net)}. I'd recommend reviewing your spending categories and identifying areas where you can reduce costs.`;
    }
  }

  private async simulateProductivityInsight(tasks: any[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    
    if (tasks.length === 0) {
      return "Your task list is clear! This is a great time to plan ahead or tackle some long-term goals.";
    }
    
    if (overdueTasks.length > 0) {
      return `You have ${overdueTasks.length} overdue tasks. Consider prioritizing these first to get back on track.`;
    }
    
    if (completedTasks.length > pendingTasks.length) {
      return `Great productivity! You've completed ${completedTasks.length} tasks. Keep up the momentum with your remaining ${pendingTasks.length} tasks.`;
    }
    
    return `You have ${pendingTasks.length} pending tasks. Consider breaking larger tasks into smaller, manageable chunks for better progress.`;
  }

  private async simulateGeneralInsight(): Promise<string> {
    const insights = [
      "Remember: Progress, not perfection. Small daily improvements lead to remarkable long-term results.",
      "Voice commands can speed up your workflow by 40%. Try using them for quick task creation and expense logging.",
      "The best time to plan tomorrow is today. Spend 5 minutes each evening reviewing and organizing.",
      "Your data stays completely private with local processing. No cloud, no worries!",
      "Consistency beats intensity. Better to track expenses daily than to do it all at month-end."
    ];
    
    await new Promise(resolve => setTimeout(resolve, 800));
    return insights[Math.floor(Math.random() * insights.length)];
  }

  async getModelStatus(): Promise<{ loaded: boolean; modelPath: string; initialized: boolean }> {
    return {
      loaded: this.isInitialized,
      modelPath: this.modelPath,
      initialized: this.isInitialized
    };
  }
}

export const aiService = new AIService();
