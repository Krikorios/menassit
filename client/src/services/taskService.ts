import { apiRequest } from "@/lib/queryClient";
import { Task, InsertTask } from "@shared/schema";

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
  message?: string;
}

export const taskService = {
  async getTasks(status?: string): Promise<TasksResponse> {
    const url = status ? `/api/tasks?status=${status}` : "/api/tasks";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getTask(id: number): Promise<TaskResponse> {
    const response = await apiRequest("GET", `/api/tasks/${id}`);
    return response.json();
  },

  async createTask(task: InsertTask & { createdViaVoice?: boolean; voiceTranscription?: string }): Promise<TaskResponse> {
    const response = await apiRequest("POST", "/api/tasks", task);
    return response.json();
  },

  async updateTask(id: number, updates: Partial<Task>): Promise<TaskResponse> {
    const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
    return response.json();
  },

  async deleteTask(id: number): Promise<{ message: string }> {
    const response = await apiRequest("DELETE", `/api/tasks/${id}`);
    return response.json();
  },

  async completeTask(id: number): Promise<TaskResponse> {
    return this.updateTask(id, { status: "completed", completedAt: new Date() });
  },
};
