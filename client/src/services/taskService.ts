import { apiRequest } from "@/lib/queryClient";

export const taskService = {
  async getTasks(status?: string) {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`/api/tasks${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  async getTask(id: number) {
    const response = await fetch(`/api/tasks/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  async createTask(task: any) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return response.json();
  },

  async updateTask(id: number, updates: any) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async completeTask(id: number) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    return response.json();
  },

  async deleteTask(id: number) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};